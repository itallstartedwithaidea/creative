<?php
/**
 * Creative Asset Validator - Authentication Handler
 * Google OAuth token validation, session management, RBAC
 */

namespace CAV\Core;

class Auth {
    private Database $db;
    private array $config;
    private ?array $currentUser = null;
    private ?string $sessionToken = null;
    
    public function __construct(Database $db, array $config) {
        $this->db = $db;
        $this->config = $config;
    }
    
    // ========================================================
    // GOOGLE OAUTH VALIDATION
    // ========================================================
    
    public function validateGoogleToken(string $idToken): array {
        $clientId = $this->config['google']['client_id'];
        
        // Verify with Google's tokeninfo endpoint
        $url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($idToken);
        
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => true
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            throw new ApiException('Invalid Google token', 401);
        }
        
        $payload = json_decode($response, true);
        
        // Verify audience matches our client ID
        if ($payload['aud'] !== $clientId) {
            throw new ApiException('Token audience mismatch', 401);
        }
        
        // Check expiry
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            throw new ApiException('Token expired', 401);
        }
        
        // Check domain restriction
        $allowedDomains = $this->config['google']['allowed_domains'] ?? ['*'];
        if ($allowedDomains[0] !== '*') {
            $email = $payload['email'] ?? '';
            $domain = explode('@', $email)[1] ?? '';
            if (!in_array($domain, $allowedDomains)) {
                throw new ApiException('Email domain not allowed', 403);
            }
        }
        
        return [
            'google_id' => $payload['sub'],
            'email' => $payload['email'],
            'name' => $payload['name'] ?? $payload['email'],
            'picture' => $payload['picture'] ?? null,
            'domain' => explode('@', $payload['email'])[1] ?? null
        ];
    }
    
    // ========================================================
    // USER MANAGEMENT
    // ========================================================
    
    public function findOrCreateUser(array $googleData): array {
        // Check if user exists
        $user = $this->db->fetch(
            'SELECT * FROM users WHERE google_id = ?',
            [$googleData['google_id']]
        );
        
        if ($user) {
            // Update last login and any changed info
            $this->db->update('users', [
                'name' => $googleData['name'],
                'picture' => $googleData['picture'],
                'last_login' => date('Y-m-d H:i:s')
            ], 'id = ?', [$user['id']]);
            
            return $this->getUserById($user['id']);
        }
        
        // Create new user
        $role = 'editor'; // Default role
        
        // Check if super admin
        $superAdmins = $this->config['security']['super_admins'] ?? [];
        if (in_array($googleData['email'], $superAdmins)) {
            $role = 'super_admin';
        }
        
        $userId = $this->db->insert('users', [
            'google_id' => $googleData['google_id'],
            'email' => $googleData['email'],
            'name' => $googleData['name'],
            'picture' => $googleData['picture'],
            'domain' => $googleData['domain'],
            'role' => $role,
            'quota_reset_date' => date('Y-m-d'),
            'last_login' => date('Y-m-d H:i:s')
        ]);
        
        Logger::info('New user created', ['user_id' => $userId, 'email' => $googleData['email']]);
        
        return $this->getUserById($userId);
    }
    
    public function getUserById(int $id): ?array {
        $user = $this->db->fetch('SELECT * FROM users WHERE id = ?', [$id]);
        if ($user) {
            // Remove sensitive fields
            unset($user['cloudinary_api_secret']);
            
            // Add computed fields
            $user['is_super_admin'] = $user['role'] === 'super_admin';
            $user['is_admin'] = in_array($user['role'], ['admin', 'super_admin']);
            $user['has_byok'] = !empty($user['cloudinary_api_key']);
            
            // Get quota status
            $quotaLimit = $user['has_byok'] ? 999999 : 25;
            $user['quota_limit'] = $quotaLimit;
            $user['quota_percent'] = $quotaLimit > 0 
                ? min(100, round(($user['quota_transforms_used'] / $quotaLimit) * 100, 1))
                : 0;
        }
        return $user;
    }
    
    // ========================================================
    // SESSION MANAGEMENT
    // ========================================================
    
    public function createSession(int $userId, ?string $deviceFingerprint = null): string {
        // Generate secure session token
        $token = bin2hex(random_bytes(32));
        
        // Session lifetime
        $lifetimeDays = $this->config['security']['session_lifetime_days'] ?? 7;
        $expiresAt = date('Y-m-d H:i:s', strtotime("+{$lifetimeDays} days"));
        
        // Get request info
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;
        
        $this->db->insert('user_sessions', [
            'user_id' => $userId,
            'session_token' => $token,
            'device_fingerprint' => $deviceFingerprint,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'expires_at' => $expiresAt
        ]);
        
        // Clean up old sessions for this user (keep last 5)
        $this->db->query(
            'DELETE FROM user_sessions 
             WHERE user_id = ? AND id NOT IN (
                 SELECT id FROM (
                     SELECT id FROM user_sessions 
                     WHERE user_id = ? 
                     ORDER BY created_at DESC LIMIT 5
                 ) AS recent
             )',
            [$userId, $userId]
        );
        
        Logger::info('Session created', ['user_id' => $userId]);
        
        return $token;
    }
    
    public function validateSession(string $token): ?array {
        $session = $this->db->fetch(
            'SELECT * FROM user_sessions WHERE session_token = ? AND expires_at > NOW()',
            [$token]
        );
        
        if (!$session) {
            return null;
        }
        
        // Optionally verify device fingerprint
        if ($this->config['security']['require_device_binding'] ?? false) {
            $deviceFingerprint = $_SERVER['HTTP_X_DEVICE_FINGERPRINT'] ?? null;
            if ($session['device_fingerprint'] && $session['device_fingerprint'] !== $deviceFingerprint) {
                Logger::warning('Device fingerprint mismatch', ['session_id' => $session['id']]);
                return null;
            }
        }
        
        $this->sessionToken = $token;
        $this->currentUser = $this->getUserById($session['user_id']);
        
        return $this->currentUser;
    }
    
    public function destroySession(?string $token = null): void {
        $token = $token ?? $this->sessionToken;
        if ($token) {
            $this->db->delete('user_sessions', 'session_token = ?', [$token]);
        }
    }
    
    public function destroyAllSessions(int $userId): void {
        $this->db->delete('user_sessions', 'user_id = ?', [$userId]);
    }
    
    // ========================================================
    // AUTHORIZATION
    // ========================================================
    
    public function getCurrentUser(): ?array {
        return $this->currentUser;
    }
    
    public function requireAuth(): array {
        if (!$this->currentUser) {
            throw new ApiException('Authentication required', 401);
        }
        return $this->currentUser;
    }
    
    public function requireRole(string ...$roles): array {
        $user = $this->requireAuth();
        
        // Super admin has access to everything
        if ($user['role'] === 'super_admin') {
            return $user;
        }
        
        if (!in_array($user['role'], $roles)) {
            throw new ApiException('Insufficient permissions', 403);
        }
        
        return $user;
    }
    
    public function requireSuperAdmin(): array {
        return $this->requireRole('super_admin');
    }
    
    public function requireAdmin(): array {
        return $this->requireRole('admin', 'super_admin');
    }
    
    public function canAccessUser(int $targetUserId): bool {
        if (!$this->currentUser) return false;
        
        // Can access own data
        if ($this->currentUser['id'] === $targetUserId) return true;
        
        // Super admin can access all
        if ($this->currentUser['role'] === 'super_admin') return true;
        
        // Admin can access users in same domain
        if ($this->currentUser['role'] === 'admin') {
            $targetUser = $this->getUserById($targetUserId);
            return $targetUser && $targetUser['domain'] === $this->currentUser['domain'];
        }
        
        return false;
    }
    
    public function canAccessEntity(string $entityType, array $entity): bool {
        if (!$this->currentUser) return false;
        
        $userId = $this->currentUser['id'];
        
        // Owner has full access
        if (($entity['owner_id'] ?? null) === $userId) return true;
        
        // Super admin has full access
        if ($this->currentUser['role'] === 'super_admin') return true;
        
        // Check sharing
        $shareLevel = $entity['share_level'] ?? 'private';
        
        if ($shareLevel === 'public') return true;
        
        if ($shareLevel === 'team') {
            // Check if same team
            $teamId = $this->currentUser['team_id'] ?? null;
            return $teamId && ($entity['team_id'] ?? null) === $teamId;
        }
        
        // Check explicit sharing
        $sharedWith = json_decode($entity['shared_with'] ?? '[]', true);
        foreach ($sharedWith as $share) {
            if (($share['user_id'] ?? null) === $userId) return true;
            if (($share['email'] ?? null) === $this->currentUser['email']) return true;
        }
        
        return false;
    }
}

