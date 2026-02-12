<?php
/**
 * Creative Asset Validator - Cloudinary Service
 * Upload, transform, resize, quota tracking
 */

namespace CAV\Services;

use CAV\Core\{Database, ApiException, Logger, Encryption};

class CloudinaryService {
    private Database $db;
    private Encryption $encryption;
    private array $config;
    private ?array $credentials = null;
    
    public function __construct(Database $db, Encryption $encryption, array $config) {
        $this->db = $db;
        $this->encryption = $encryption;
        $this->config = $config;
    }
    
    // ========================================================
    // CREDENTIALS MANAGEMENT
    // ========================================================
    
    /**
     * Get Cloudinary credentials for a user
     * Priority: User BYOK > System settings > Config file
     */
    public function getCredentials(array $user): array {
        // Check user's BYOK credentials
        if (!empty($user['cloudinary_cloud_name']) && !empty($user['cloudinary_api_key'])) {
            $apiSecret = $this->getUserApiSecret($user['id']);
            if ($apiSecret) {
                return [
                    'cloud_name' => $user['cloudinary_cloud_name'],
                    'api_key' => $user['cloudinary_api_key'],
                    'api_secret' => $apiSecret,
                    'source' => 'byok'
                ];
            }
        }
        
        // Check system settings (set by super admin)
        $systemCreds = $this->getSystemCredentials();
        if ($systemCreds) {
            return array_merge($systemCreds, ['source' => 'system']);
        }
        
        // Fall back to config file
        if (!empty($this->config['cloudinary']['cloud_name'])) {
            return [
                'cloud_name' => $this->config['cloudinary']['cloud_name'],
                'api_key' => $this->config['cloudinary']['api_key'],
                'api_secret' => $this->config['cloudinary']['api_secret'],
                'source' => 'config'
            ];
        }
        
        throw new ApiException('Cloudinary not configured', 503);
    }
    
    private function getUserApiSecret(int $userId): ?string {
        $row = $this->db->fetch(
            'SELECT key_value FROM user_api_keys 
             WHERE user_id = ? AND service = ? AND key_name = ?',
            [$userId, 'cloudinary', 'api_secret']
        );
        
        if ($row) {
            return $this->encryption->decrypt($row['key_value']);
        }
        
        return null;
    }
    
    private function getSystemCredentials(): ?array {
        $settings = $this->db->fetchAll(
            "SELECT setting_key, setting_value FROM system_settings 
             WHERE setting_key IN ('cloudinary_cloud_name', 'cloudinary_api_key', 'cloudinary_api_secret')"
        );
        
        $creds = [];
        foreach ($settings as $s) {
            $key = str_replace('cloudinary_', '', $s['setting_key']);
            $value = $s['setting_value'];
            
            // Decrypt encrypted values
            if ($key === 'api_secret' && $value) {
                $value = $this->encryption->decrypt($value);
            }
            
            $creds[$key] = $value;
        }
        
        if (!empty($creds['cloud_name']) && !empty($creds['api_key']) && !empty($creds['api_secret'])) {
            return $creds;
        }
        
        return null;
    }
    
    /**
     * Save super admin Cloudinary settings
     */
    public function saveSystemCredentials(string $cloudName, string $apiKey, string $apiSecret, int $adminId): void {
        $encryptedSecret = $this->encryption->encrypt($apiSecret);
        
        $settings = [
            ['cloudinary_cloud_name', $cloudName, 'encrypted'],
            ['cloudinary_api_key', $apiKey, 'encrypted'],
            ['cloudinary_api_secret', $encryptedSecret, 'encrypted']
        ];
        
        foreach ($settings as [$key, $value, $type]) {
            $this->db->query(
                "INSERT INTO system_settings (setting_key, setting_value, setting_type, updated_by)
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE setting_value = ?, updated_by = ?",
                [$key, $value, $type, $adminId, $value, $adminId]
            );
        }
        
        Logger::info('System Cloudinary credentials updated', ['admin_id' => $adminId]);
    }
    
    /**
     * Save user BYOK credentials
     */
    public function saveUserCredentials(int $userId, string $cloudName, string $apiKey, string $apiSecret): void {
        // Update user record
        $this->db->update('users', [
            'cloudinary_cloud_name' => $cloudName,
            'cloudinary_api_key' => $apiKey
        ], 'id = ?', [$userId]);
        
        // Store encrypted secret
        $encryptedSecret = $this->encryption->encrypt($apiSecret);
        
        $this->db->query(
            "INSERT INTO user_api_keys (user_id, service, key_name, key_value)
             VALUES (?, 'cloudinary', 'api_secret', ?)
             ON DUPLICATE KEY UPDATE key_value = ?",
            [$userId, $encryptedSecret, $encryptedSecret]
        );
        
        Logger::info('User Cloudinary credentials updated', ['user_id' => $userId]);
    }
    
    // ========================================================
    // QUOTA MANAGEMENT
    // ========================================================
    
    public function getQuota(array $user): array {
        $hasByok = !empty($user['cloudinary_api_key']);
        
        if ($hasByok) {
            return [
                'type' => 'byok',
                'used' => 0,
                'limit' => -1, // Unlimited
                'percent' => 0,
                'remaining' => -1,
                'can_transform' => true,
                'reset_date' => null
            ];
        }
        
        $limit = $this->config['cloudinary']['free_transforms_monthly'] ?? 25;
        $used = (int) $user['quota_transforms_used'];
        $remaining = max(0, $limit - $used);
        $percent = $limit > 0 ? round(($used / $limit) * 100, 1) : 0;
        
        return [
            'type' => 'shared',
            'used' => $used,
            'limit' => $limit,
            'percent' => $percent,
            'remaining' => $remaining,
            'can_transform' => $remaining > 0,
            'reset_date' => $user['quota_reset_date'],
            'warning' => $percent >= 80 && $percent < 100,
            'exceeded' => $percent >= 100
        ];
    }
    
    public function canTransform(array $user, int $credits = 1): bool {
        $quota = $this->getQuota($user);
        return $quota['can_transform'] && ($quota['remaining'] === -1 || $quota['remaining'] >= $credits);
    }
    
    public function useCredits(int $userId, float $credits = 1): void {
        $this->db->query(
            'CALL sp_use_transform(?, ?)',
            [$userId, $credits]
        );
    }
    
    // ========================================================
    // UPLOAD
    // ========================================================
    
    public function generateUploadSignature(array $user, array $params = []): array {
        $creds = $this->getCredentials($user);
        
        $timestamp = time();
        $folder = 'cav/' . $user['id'];
        
        $uploadParams = array_merge([
            'timestamp' => $timestamp,
            'folder' => $folder,
            'upload_preset' => 'cav_upload'
        ], $params);
        
        // Sort and create signature string
        ksort($uploadParams);
        $signatureString = http_build_query($uploadParams) . $creds['api_secret'];
        $signature = sha1($signatureString);
        
        return [
            'signature' => $signature,
            'timestamp' => $timestamp,
            'cloud_name' => $creds['cloud_name'],
            'api_key' => $creds['api_key'],
            'folder' => $folder,
            'upload_url' => "https://api.cloudinary.com/v1_1/{$creds['cloud_name']}/auto/upload"
        ];
    }
    
    // ========================================================
    // TRANSFORM / RESIZE
    // ========================================================
    
    /**
     * Transform/resize an asset
     */
    public function transform(array $user, string $publicId, array $options): array {
        // Check quota
        if (!$this->canTransform($user)) {
            throw new ApiException('Transform quota exceeded. Upgrade or add your own Cloudinary account.', 429);
        }
        
        $creds = $this->getCredentials($user);
        
        // Build transformation
        $transformations = [];
        
        if (isset($options['width']) && isset($options['height'])) {
            $transformations[] = [
                'width' => (int) $options['width'],
                'height' => (int) $options['height'],
                'crop' => $options['crop'] ?? 'fill',
                'gravity' => $options['gravity'] ?? 'auto'
            ];
        }
        
        if (isset($options['format'])) {
            $transformations[] = ['fetch_format' => $options['format']];
        }
        
        if (isset($options['quality'])) {
            $transformations[] = ['quality' => $options['quality']];
        }
        
        // Generate eager transformation
        $eagerTransform = $this->buildTransformationString($transformations);
        
        // Call Cloudinary API
        $url = "https://api.cloudinary.com/v1_1/{$creds['cloud_name']}/image/explicit";
        
        $postData = [
            'public_id' => $publicId,
            'type' => 'upload',
            'eager' => $eagerTransform,
            'eager_async' => false,
            'timestamp' => time()
        ];
        
        // Sign the request
        ksort($postData);
        $signatureString = http_build_query($postData) . $creds['api_secret'];
        $postData['signature'] = sha1($signatureString);
        $postData['api_key'] = $creds['api_key'];
        
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query($postData),
            CURLOPT_TIMEOUT => 60
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            Logger::error('Cloudinary transform failed', [
                'http_code' => $httpCode,
                'response' => $response
            ]);
            throw new ApiException('Transform failed', 500);
        }
        
        $result = json_decode($response, true);
        
        // Use credits
        $this->useCredits($user['id'], 1);
        
        // Log the transform
        $this->logTransform($user['id'], $publicId, $options, $result);
        
        return [
            'success' => true,
            'url' => $result['eager'][0]['secure_url'] ?? null,
            'width' => $result['eager'][0]['width'] ?? null,
            'height' => $result['eager'][0]['height'] ?? null,
            'format' => $result['eager'][0]['format'] ?? null,
            'bytes' => $result['eager'][0]['bytes'] ?? null
        ];
    }
    
    /**
     * Generate a transformation URL (no credit cost, just URL generation)
     */
    public function getTransformUrl(array $user, string $publicId, array $options): string {
        $creds = $this->getCredentials($user);
        
        $transformations = [];
        
        if (isset($options['width']) && isset($options['height'])) {
            $transformations[] = [
                'width' => (int) $options['width'],
                'height' => (int) $options['height'],
                'crop' => $options['crop'] ?? 'fill',
                'gravity' => $options['gravity'] ?? 'auto'
            ];
        }
        
        $transformStr = $this->buildTransformationString($transformations);
        $format = $options['format'] ?? 'auto';
        
        return "https://res.cloudinary.com/{$creds['cloud_name']}/image/upload/{$transformStr}/f_{$format}/{$publicId}";
    }
    
    private function buildTransformationString(array $transformations): string {
        $parts = [];
        
        foreach ($transformations as $t) {
            $tParts = [];
            
            if (isset($t['width'])) $tParts[] = "w_{$t['width']}";
            if (isset($t['height'])) $tParts[] = "h_{$t['height']}";
            if (isset($t['crop'])) $tParts[] = "c_{$t['crop']}";
            if (isset($t['gravity'])) $tParts[] = "g_{$t['gravity']}";
            if (isset($t['quality'])) $tParts[] = "q_{$t['quality']}";
            if (isset($t['fetch_format'])) $tParts[] = "f_{$t['fetch_format']}";
            
            if (!empty($tParts)) {
                $parts[] = implode(',', $tParts);
            }
        }
        
        return implode('/', $parts);
    }
    
    private function logTransform(int $userId, string $publicId, array $options, array $result): void {
        $uuid = $this->generateUuid();
        
        $this->db->insert('asset_transforms', [
            'uuid' => $uuid,
            'source_asset_id' => $this->getAssetIdByCloudinaryId($publicId) ?? 0,
            'owner_id' => $userId,
            'transform_type' => 'resize',
            'target_width' => $options['width'] ?? null,
            'target_height' => $options['height'] ?? null,
            'target_format' => $options['format'] ?? null,
            'platform_name' => $options['platform'] ?? null,
            'cloudinary_id' => $result['public_id'] ?? null,
            'result_url' => $result['eager'][0]['secure_url'] ?? null,
            'result_size' => $result['eager'][0]['bytes'] ?? 0,
            'status' => 'completed',
            'credits_used' => 1,
            'completed_at' => date('Y-m-d H:i:s')
        ]);
    }
    
    private function getAssetIdByCloudinaryId(string $cloudinaryId): ?int {
        $result = $this->db->fetchColumn(
            'SELECT id FROM assets WHERE cloudinary_id = ?',
            [$cloudinaryId]
        );
        return $result ? (int) $result : null;
    }
    
    private function generateUuid(): string {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
    
    // ========================================================
    // VIDEO SPECIFIC
    // ========================================================
    
    public function transformVideo(array $user, string $publicId, array $options): array {
        // Check quota (video costs more credits)
        $credits = 2; // Videos cost 2 credits
        if (!$this->canTransform($user, $credits)) {
            throw new ApiException('Transform quota exceeded for video. Videos cost 2 credits.', 429);
        }
        
        $creds = $this->getCredentials($user);
        
        // Build video transformation URL
        $transformParts = [];
        
        if (isset($options['width']) && isset($options['height'])) {
            $transformParts[] = "w_{$options['width']},h_{$options['height']},c_" . ($options['crop'] ?? 'fill');
        }
        
        if (isset($options['format'])) {
            $transformParts[] = "f_{$options['format']}";
        }
        
        $transformStr = implode('/', $transformParts);
        
        // For video, we use the URL-based transformation
        $url = "https://res.cloudinary.com/{$creds['cloud_name']}/video/upload/{$transformStr}/{$publicId}";
        
        // Use credits
        $this->useCredits($user['id'], $credits);
        
        Logger::info('Video transform requested', [
            'user_id' => $user['id'],
            'public_id' => $publicId,
            'options' => $options
        ]);
        
        return [
            'success' => true,
            'url' => $url,
            'width' => $options['width'] ?? null,
            'height' => $options['height'] ?? null,
            'credits_used' => $credits
        ];
    }
}

