<?php
/**
 * Creative Asset Validator - Sync Service
 * Bidirectional sync, conflict resolution, audit logging
 */

namespace CAV\Services;

use CAV\Core\{Database, ApiException, Logger};

class SyncService {
    private Database $db;
    private array $config;
    
    // Entity types that can be synced (includes all CRM entities)
    private const SYNC_ENTITIES = [
        'assets' => 'assets',
        'companies' => 'companies',
        'projects' => 'projects',
        'brand_kits' => 'brand_kits',
        'swipe_files' => 'swipe_files',
        // CRM entities
        'contacts' => 'contacts',
        'deals' => 'deals',
        'activities' => 'crm_activities',
        'tags' => 'crm_tags',
        'competitors' => 'competitors',
        'custom_fields' => 'crm_custom_fields'
    ];
    
    public function __construct(Database $db, array $config) {
        $this->db = $db;
        $this->config = $config;
    }
    
    // ========================================================
    // SYNC STATUS
    // ========================================================
    
    public function getStatus(array $user): array {
        $status = [];
        
        foreach (self::SYNC_ENTITIES as $key => $table) {
            // Get count and latest version
            $result = $this->db->fetch(
                "SELECT COUNT(*) as count, MAX(sync_version) as max_version, MAX(updated_at) as last_updated
                 FROM `{$table}` 
                 WHERE owner_id = ? AND deleted_at IS NULL",
                [$user['id']]
            );
            
            $status[$key] = [
                'count' => (int) ($result['count'] ?? 0),
                'max_version' => (int) ($result['max_version'] ?? 0),
                'last_updated' => $result['last_updated']
            ];
        }
        
        // Get pending sync count
        $pendingCount = 0;
        foreach (self::SYNC_ENTITIES as $key => $table) {
            $count = $this->db->fetchColumn(
                "SELECT COUNT(*) FROM `{$table}` WHERE owner_id = ? AND needs_sync = 1",
                [$user['id']]
            );
            $pendingCount += (int) $count;
        }
        
        return [
            'entities' => $status,
            'pending_count' => $pendingCount,
            'last_sync' => $this->getLastSyncTime($user['id']),
            'server_time' => date('Y-m-d\TH:i:s\Z')
        ];
    }
    
    private function getLastSyncTime(int $userId): ?string {
        return $this->db->fetchColumn(
            'SELECT MAX(created_at) FROM sync_log WHERE user_id = ?',
            [$userId]
        );
    }
    
    // ========================================================
    // PULL (Server → Client)
    // ========================================================
    
    public function pull(array $user, ?string $since = null, ?array $entityTypes = null): array {
        $userId = $user['id'];
        $teamId = $user['team_id'] ?? null;
        
        // Parse since timestamp
        $sinceTime = $since ? date('Y-m-d H:i:s', strtotime($since)) : '1970-01-01 00:00:00';
        
        $changes = [];
        $entities = $entityTypes ?? array_keys(self::SYNC_ENTITIES);
        
        foreach ($entities as $entityType) {
            if (!isset(self::SYNC_ENTITIES[$entityType])) {
                continue;
            }
            
            $table = self::SYNC_ENTITIES[$entityType];
            
            // Get all changes since timestamp
            // Include: owned, team-shared, and explicitly shared
            $sql = "SELECT * FROM `{$table}` 
                    WHERE updated_at > ?
                    AND (
                        owner_id = ?
                        " . ($teamId ? "OR (team_id = ? AND share_level IN ('team', 'public'))" : "") . "
                    )
                    ORDER BY updated_at ASC
                    LIMIT 1000";
            
            $params = [$sinceTime, $userId];
            if ($teamId) {
                $params[] = $teamId;
            }
            
            $rows = $this->db->fetchAll($sql, $params);
            
            foreach ($rows as $row) {
                $changes[] = [
                    'entity_type' => $entityType,
                    'uuid' => $row['uuid'],
                    'action' => $row['deleted_at'] ? 'delete' : 'upsert',
                    'data' => $this->sanitizeForClient($row),
                    'version' => (int) $row['sync_version'],
                    'updated_at' => $row['updated_at']
                ];
            }
        }
        
        // Sort all changes by updated_at
        usort($changes, fn($a, $b) => $a['updated_at'] <=> $b['updated_at']);
        
        return [
            'changes' => $changes,
            'server_time' => date('Y-m-d\TH:i:s\Z'),
            'has_more' => count($changes) >= 1000
        ];
    }
    
    private function sanitizeForClient(array $row): array {
        // Remove internal-only fields
        unset($row['id']);
        unset($row['needs_sync']);
        
        // Parse JSON fields
        $jsonFields = ['validation_issues', 'validation_results', 'tags', 'ai_analysis', 'metadata',
                       'brand_colors', 'brand_fonts', 'shared_with', 'target_platforms', 'generated_sizes',
                       'design_patterns', 'color_palette',
                       // CRM JSON fields
                       'custom_fields', 'strengths', 'weaknesses', 'options', 'details'];
        
        foreach ($jsonFields as $field) {
            if (isset($row[$field]) && is_string($row[$field])) {
                $row[$field] = json_decode($row[$field], true);
            }
        }
        
        return $row;
    }
    
    // ========================================================
    // PUSH (Client → Server)
    // ========================================================
    
    public function push(array $user, array $changes): array {
        $userId = $user['id'];
        $results = [];
        $conflicts = [];
        
        $this->db->beginTransaction();
        
        try {
            foreach ($changes as $change) {
                $entityType = $change['entity_type'] ?? null;
                $uuid = $change['uuid'] ?? null;
                $action = $change['action'] ?? 'upsert';
                $data = $change['data'] ?? [];
                $clientVersion = (int) ($change['version'] ?? 0);
                
                if (!$entityType || !$uuid || !isset(self::SYNC_ENTITIES[$entityType])) {
                    $results[] = ['uuid' => $uuid, 'status' => 'error', 'message' => 'Invalid entity'];
                    continue;
                }
                
                $table = self::SYNC_ENTITIES[$entityType];
                
                // Check for conflicts
                $existing = $this->db->fetch(
                    "SELECT id, sync_version, owner_id FROM `{$table}` WHERE uuid = ?",
                    [$uuid]
                );
                
                if ($existing) {
                    // Check ownership
                    if ($existing['owner_id'] !== $userId && $user['role'] !== 'super_admin') {
                        $results[] = ['uuid' => $uuid, 'status' => 'error', 'message' => 'Permission denied'];
                        continue;
                    }
                    
                    // Check for conflict
                    if ($existing['sync_version'] > $clientVersion) {
                        $resolution = $this->resolveConflict($entityType, $existing, $data);
                        $conflicts[] = [
                            'uuid' => $uuid,
                            'entity_type' => $entityType,
                            'server_version' => $existing['sync_version'],
                            'client_version' => $clientVersion,
                            'resolution' => $resolution['strategy']
                        ];
                        
                        if ($resolution['strategy'] === 'server_wins') {
                            $results[] = ['uuid' => $uuid, 'status' => 'conflict', 'resolution' => 'server_wins'];
                            continue;
                        }
                    }
                    
                    // Update existing
                    if ($action === 'delete') {
                        $this->softDelete($table, $uuid, $userId);
                        $results[] = ['uuid' => $uuid, 'status' => 'deleted'];
                    } else {
                        $this->updateEntity($table, $uuid, $data, $userId);
                        $results[] = ['uuid' => $uuid, 'status' => 'updated'];
                    }
                } else {
                    // Create new
                    if ($action !== 'delete') {
                        $this->createEntity($table, $uuid, $data, $userId, $user['team_id'] ?? null);
                        $results[] = ['uuid' => $uuid, 'status' => 'created'];
                    }
                }
                
                // Log the sync
                $this->logSync($userId, $entityType, $uuid, $action, $clientVersion);
            }
            
            $this->db->commit();
            
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
        
        return [
            'results' => $results,
            'conflicts' => $conflicts,
            'server_time' => date('Y-m-d\TH:i:s\Z')
        ];
    }
    
    private function resolveConflict(string $entityType, array $server, array $client): array {
        $strategy = $this->config['sync']['conflict_resolution'] ?? 'server_wins';
        
        // Could implement more sophisticated resolution here
        // For now, just use configured strategy
        
        return [
            'strategy' => $strategy,
            'server_version' => $server['sync_version']
        ];
    }
    
    private function createEntity(string $table, string $uuid, array $data, int $userId, ?int $teamId): void {
        // Filter allowed fields
        $allowed = $this->getAllowedFields($table);
        $filtered = array_intersect_key($data, array_flip($allowed));
        
        // Encode JSON fields
        $filtered = $this->encodeJsonFields($filtered);
        
        $filtered['uuid'] = $uuid;
        $filtered['owner_id'] = $userId;
        $filtered['team_id'] = $teamId;
        $filtered['sync_version'] = 1;
        $filtered['needs_sync'] = 0;
        $filtered['last_synced_at'] = date('Y-m-d H:i:s');
        
        $this->db->insert($table, $filtered);
    }
    
    private function updateEntity(string $table, string $uuid, array $data, int $userId): void {
        $allowed = $this->getAllowedFields($table);
        $filtered = array_intersect_key($data, array_flip($allowed));
        $filtered = $this->encodeJsonFields($filtered);
        
        // Increment version
        $this->db->query(
            "UPDATE `{$table}` SET sync_version = sync_version + 1, needs_sync = 0, last_synced_at = NOW() WHERE uuid = ?",
            [$uuid]
        );
        
        if (!empty($filtered)) {
            $this->db->update($table, $filtered, 'uuid = ?', [$uuid]);
        }
    }
    
    private function softDelete(string $table, string $uuid, int $userId): void {
        $this->db->update($table, [
            'deleted_at' => date('Y-m-d H:i:s'),
            'needs_sync' => 0
        ], 'uuid = ?', [$uuid]);
    }
    
    private function getAllowedFields(string $table): array {
        $common = ['name', 'description', 'share_level', 'shared_with'];
        
        $specific = [
            'assets' => ['type', 'mime_type', 'file_size', 'width', 'height', 'duration',
                        'storage_type', 'cloudinary_id', 'cloudinary_url', 'thumbnail_url', 'original_url',
                        'validation_score', 'validation_issues', 'validation_results',
                        'tags', 'ai_analysis', 'metadata', 'company_id', 'project_id'],
            'companies' => ['industry', 'website', 'brand_colors', 'brand_fonts', 'brand_guidelines', 'logo_url'],
            'projects' => ['status', 'target_platforms', 'due_date', 'company_id'],
            'brand_kits' => ['logo_primary_url', 'logo_secondary_url', 'logo_icon_url', 
                            'logo_dark_url', 'logo_light_url', 'generated_sizes', 'company_id'],
            'swipe_files' => ['title', 'source_url', 'image_url', 'thumbnail_url', 'category',
                             'tags', 'ai_analysis', 'design_patterns', 'color_palette', 'company_id'],
            // CRM entities
            'contacts' => ['email', 'phone', 'title', 'notes', 'custom_fields', 'tags', 'company_id'],
            'deals' => ['value', 'currency', 'stage', 'probability', 'expected_close_date', 'notes',
                       'custom_fields', 'tags', 'company_id', 'contact_id'],
            'crm_activities' => ['activity_type', 'details', 'company_id', 'contact_id', 'deal_id'],
            'crm_tags' => ['color', 'category'],
            'competitors' => ['website', 'strengths', 'weaknesses', 'notes', 'company_id'],
            'crm_custom_fields' => ['entity_type', 'field_name', 'field_type', 'options', 'is_required', 'display_order']
        ];
        
        return array_merge($common, $specific[$table] ?? []);
    }
    
    private function encodeJsonFields(array $data): array {
        $jsonFields = ['validation_issues', 'validation_results', 'tags', 'ai_analysis', 'metadata',
                       'brand_colors', 'brand_fonts', 'shared_with', 'target_platforms', 'generated_sizes',
                       'design_patterns', 'color_palette',
                       // CRM JSON fields
                       'custom_fields', 'strengths', 'weaknesses', 'options', 'details'];
        
        foreach ($jsonFields as $field) {
            if (isset($data[$field]) && is_array($data[$field])) {
                $data[$field] = json_encode($data[$field]);
            }
        }
        
        return $data;
    }
    
    private function logSync(int $userId, string $entityType, string $uuid, string $action, int $version): void {
        $this->db->insert('sync_log', [
            'user_id' => $userId,
            'entity_type' => $entityType,
            'entity_uuid' => $uuid,
            'action' => $action,
            'old_version' => $version,
            'new_version' => $version + 1,
            'device_id' => $_SERVER['HTTP_X_DEVICE_ID'] ?? null
        ]);
    }
    
    // ========================================================
    // HELPERS
    // ========================================================
    
    public function markForSync(string $table, string $uuid): void {
        $this->db->update($table, [
            'needs_sync' => 1,
            'sync_version' => $this->db->fetchColumn(
                "SELECT sync_version FROM `{$table}` WHERE uuid = ?",
                [$uuid]
            ) + 1
        ], 'uuid = ?', [$uuid]);
    }
}

