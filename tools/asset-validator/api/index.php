<?php
/**
 * Creative Asset Validator - API Entry Point
 * Version 5.0.0
 * 
 * RESTful API with:
 * - Google OAuth authentication
 * - Bidirectional sync
 * - Cloudinary integration for video/image resize
 * - Team collaboration
 * - Super Admin settings
 */

declare(strict_types=1);

// Error reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', '0');

// Autoload
require_once __DIR__ . '/core/Database.php';
require_once __DIR__ . '/core/Auth.php';
require_once __DIR__ . '/core/Router.php';
require_once __DIR__ . '/services/CloudinaryService.php';
require_once __DIR__ . '/services/SyncService.php';

use CAV\Core\{Database, Auth, Logger, Encryption, ApiException, Router, Request, Response};
use CAV\Services\{CloudinaryService, SyncService};

// ============================================================
// CONFIGURATION
// ============================================================

$configFile = __DIR__ . '/config/config.php';
if (!file_exists($configFile)) {
    http_response_code(500);
    echo json_encode(['error' => 'Configuration not found. Copy config.example.php to config.php']);
    exit;
}

$config = require $configFile;

// Initialize logging
Logger::init(
    $config['logging']['file'] ?? __DIR__ . '/logs/app.log',
    $config['logging']['level'] ?? 'info'
);

// ============================================================
// CORS HANDLING
// ============================================================

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = $config['cors']['allowed_origins'] ?? [];

// Check if origin is allowed
$isAllowed = in_array($origin, $allowedOrigins) || in_array('*', $allowedOrigins);

if ($isAllowed && $origin) {
    header("Access-Control-Allow-Origin: {$origin}");
    header("Access-Control-Allow-Credentials: true");
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Device-Fingerprint, X-Device-Id");
header("Access-Control-Max-Age: 86400");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ============================================================
// INITIALIZATION
// ============================================================

try {
    $db = Database::getInstance($config);
    $encryption = new Encryption($config['security']['encryption_key']);
    $auth = new Auth($db, $config);
    $cloudinary = new CloudinaryService($db, $encryption, $config);
    $sync = new SyncService($db, $config);
} catch (\Exception $e) {
    Logger::error('Initialization failed', ['error' => $e->getMessage()]);
    http_response_code(500);
    echo json_encode(['error' => 'Service initialization failed']);
    exit;
}

// ============================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================

$request = new Request();

// Try to authenticate from bearer token
$token = $request->bearerToken();
if ($token) {
    $auth->validateSession($token);
}

// ============================================================
// ROUTES
// ============================================================

$router = new Router();

// ============================================================
// HEALTH CHECK
// ============================================================

$router->get('/health', function(Request $req) use ($db) {
    try {
        $db->query('SELECT 1');
        return [
            'status' => 'healthy',
            'database' => 'connected',
            'version' => '5.0.0',
            'timestamp' => date('Y-m-d\TH:i:s\Z')
        ];
    } catch (\Exception $e) {
        return Response::error('Database connection failed', 503);
    }
});

// ============================================================
// AUTHENTICATION
// ============================================================

$router->post('/auth/google', function(Request $req) use ($auth) {
    $data = $req->validate([
        'id_token' => 'required|string',
        'device_fingerprint' => 'string'
    ]);
    
    // Validate Google token
    $googleData = $auth->validateGoogleToken($data['id_token']);
    
    // Find or create user
    $user = $auth->findOrCreateUser($googleData);
    
    // Create session
    $sessionToken = $auth->createSession($user['id'], $data['device_fingerprint'] ?? null);
    
    Logger::info('User logged in', ['user_id' => $user['id'], 'email' => $user['email']]);
    
    return [
        'success' => true,
        'session_token' => $sessionToken,
        'user' => $user
    ];
});

// Session-based authentication (for client-side Google Sign-In)
$router->post('/auth/session', function(Request $req) use ($auth) {
    $data = $req->validate([
        'google_id' => 'required|string',
        'email' => 'required|string',
        'name' => 'required|string',
        'device_fingerprint' => 'string'
    ]);
    
    // Create/update user from session data
    $googleData = [
        'google_id' => $data['google_id'],
        'email' => $data['email'],
        'name' => $data['name'],
        'picture' => $req->input('picture'),
        'domain' => explode('@', $data['email'])[1] ?? null
    ];
    
    // Find or create user
    $user = $auth->findOrCreateUser($googleData);
    
    // Create session
    $sessionToken = $auth->createSession($user['id'], $data['device_fingerprint'] ?? null);
    
    Logger::info('Session authenticated', ['user_id' => $user['id'], 'email' => $user['email']]);
    
    return [
        'success' => true,
        'session_token' => $sessionToken,
        'user' => $user
    ];
});

$router->post('/auth/logout', function(Request $req) use ($auth) {
    $auth->destroySession($req->bearerToken());
    return Response::success('Logged out');
});

$router->get('/auth/me', function(Request $req) use ($auth, $cloudinary) {
    $user = $auth->requireAuth();
    $quota = $cloudinary->getQuota($user);
    
    return [
        'user' => $user,
        'quota' => $quota
    ];
});

// ============================================================
// SYNC
// ============================================================

$router->get('/sync/status', function(Request $req) use ($auth, $sync) {
    $user = $auth->requireAuth();
    return $sync->getStatus($user);
});

$router->get('/sync/pull', function(Request $req) use ($auth, $sync) {
    $user = $auth->requireAuth();
    
    $since = $req->get('since');
    $types = $req->get('types') ? explode(',', $req->get('types')) : null;
    
    return $sync->pull($user, $since, $types);
});

$router->post('/sync/push', function(Request $req) use ($auth, $sync) {
    $user = $auth->requireAuth();
    
    $changes = $req->input('changes');
    if (!is_array($changes)) {
        throw new ApiException('Changes must be an array', 400);
    }
    
    return $sync->push($user, $changes);
});

// ============================================================
// ASSETS
// ============================================================

$router->get('/assets', function(Request $req) use ($auth, $db) {
    $user = $auth->requireAuth();
    
    $page = $req->page();
    $perPage = $req->perPage();
    $offset = $req->offset();
    
    // Build query
    $where = ['owner_id = ?', 'deleted_at IS NULL'];
    $params = [$user['id']];
    
    if ($req->get('type')) {
        $where[] = 'type = ?';
        $params[] = $req->get('type');
    }
    
    if ($req->get('company_id')) {
        $where[] = 'company_id = (SELECT id FROM companies WHERE uuid = ?)';
        $params[] = $req->get('company_id');
    }
    
    if ($req->get('project_id')) {
        $where[] = 'project_id = (SELECT id FROM projects WHERE uuid = ?)';
        $params[] = $req->get('project_id');
    }
    
    $whereClause = implode(' AND ', $where);
    
    // Count total
    $total = $db->fetchColumn("SELECT COUNT(*) FROM assets WHERE {$whereClause}", $params);
    
    // Fetch page
    $assets = $db->fetchAll(
        "SELECT * FROM assets WHERE {$whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?",
        array_merge($params, [$perPage, $offset])
    );
    
    return Response::paginated($assets, (int) $total, $page, $perPage);
});

$router->post('/assets', function(Request $req) use ($auth, $db) {
    $user = $auth->requireAuth();
    
    $data = $req->validate([
        'uuid' => 'required|string',
        'name' => 'required|string|max:255',
        'type' => 'required|string'
    ]);
    
    // Check if exists
    $existing = $db->fetchColumn('SELECT id FROM assets WHERE uuid = ?', [$data['uuid']]);
    if ($existing) {
        throw new ApiException('Asset already exists', 409);
    }
    
    $db->insert('assets', [
        'uuid' => $data['uuid'],
        'owner_id' => $user['id'],
        'team_id' => $user['team_id'],
        'name' => $data['name'],
        'type' => $data['type'],
        'mime_type' => $req->input('mime_type'),
        'file_size' => $req->input('file_size'),
        'width' => $req->input('width'),
        'height' => $req->input('height'),
        'cloudinary_id' => $req->input('cloudinary_id'),
        'cloudinary_url' => $req->input('cloudinary_url'),
        'thumbnail_url' => $req->input('thumbnail_url'),
        'tags' => json_encode($req->input('tags', [])),
        'metadata' => json_encode($req->input('metadata', []))
    ]);
    
    return Response::success('Asset created');
});

$router->put('/assets/{uuid}', function(Request $req) use ($auth, $db) {
    $user = $auth->requireAuth();
    $uuid = $req->params['uuid'];
    
    // Verify ownership
    $asset = $db->fetch('SELECT * FROM assets WHERE uuid = ?', [$uuid]);
    if (!$asset || ($asset['owner_id'] !== $user['id'] && $user['role'] !== 'super_admin')) {
        throw new ApiException('Asset not found or access denied', 404);
    }
    
    $updateData = [];
    $allowedFields = ['name', 'validation_score', 'validation_issues', 'validation_results', 
                      'tags', 'company_id', 'project_id'];
    
    foreach ($allowedFields as $field) {
        $value = $req->input($field);
        if ($value !== null) {
            $updateData[$field] = is_array($value) ? json_encode($value) : $value;
        }
    }
    
    if (!empty($updateData)) {
        $updateData['sync_version'] = $asset['sync_version'] + 1;
        $db->update('assets', $updateData, 'uuid = ?', [$uuid]);
    }
    
    return Response::success('Asset updated');
});

$router->delete('/assets/{uuid}', function(Request $req) use ($auth, $db) {
    $user = $auth->requireAuth();
    $uuid = $req->params['uuid'];
    
    $asset = $db->fetch('SELECT * FROM assets WHERE uuid = ?', [$uuid]);
    if (!$asset || ($asset['owner_id'] !== $user['id'] && $user['role'] !== 'super_admin')) {
        throw new ApiException('Asset not found or access denied', 404);
    }
    
    // Soft delete
    $db->update('assets', [
        'deleted_at' => date('Y-m-d H:i:s'),
        'sync_version' => $asset['sync_version'] + 1
    ], 'uuid = ?', [$uuid]);
    
    return Response::noContent();
});

// ============================================================
// USER API KEYS (for cross-browser persistence)
// ============================================================

$router->get('/user/api-keys', function(Request $req) use ($auth, $db, $encryption) {
    $user = $auth->requireAuth();
    
    // Get user's API keys (decrypted)
    $keys = $db->fetchAll(
        "SELECT service, key_name, key_value FROM user_api_keys WHERE user_id = ? AND is_valid = 1",
        [$user['id']]
    );
    
    // Decrypt keys
    $decrypted = [];
    foreach ($keys as $key) {
        try {
            $decrypted[] = [
                'service' => $key['service'],
                'key_name' => $key['key_name'],
                'key_value' => $encryption->decrypt($key['key_value'])
            ];
        } catch (\Exception $e) {
            // Skip invalid keys
            Logger::warning('Failed to decrypt API key', ['service' => $key['service'], 'user' => $user['id']]);
        }
    }
    
    return ['keys' => $decrypted];
});

$router->post('/user/api-keys', function(Request $req) use ($auth, $db, $encryption) {
    $user = $auth->requireAuth();
    
    $data = $req->validate([
        'service' => 'required|string',
        'key_name' => 'string',
        'key_value' => 'required|string'
    ]);
    
    $service = $data['service'];
    $keyName = $data['key_name'] ?? 'api_key';
    $keyValue = $data['key_value'];
    
    // Encrypt the key
    $encrypted = $encryption->encrypt($keyValue);
    
    // Upsert
    $db->query(
        "INSERT INTO user_api_keys (user_id, service, key_name, key_value, is_valid)
         VALUES (?, ?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE key_value = ?, is_valid = 1, updated_at = NOW()",
        [$user['id'], $service, $keyName, $encrypted, $encrypted]
    );
    
    Logger::info('User API key saved', ['user' => $user['id'], 'service' => $service]);
    return Response::success("API key for {$service} saved");
});

$router->delete('/user/api-keys/{service}', function(Request $req) use ($auth, $db) {
    $user = $auth->requireAuth();
    $service = $req->params['service'];
    
    $db->query(
        "DELETE FROM user_api_keys WHERE user_id = ? AND service = ?",
        [$user['id'], $service]
    );
    
    return Response::success("API key for {$service} deleted");
});

// ============================================================
// CLOUDINARY
// ============================================================

$router->get('/cloudinary/quota', function(Request $req) use ($auth, $cloudinary) {
    $user = $auth->requireAuth();
    return $cloudinary->getQuota($user);
});

$router->post('/cloudinary/signature', function(Request $req) use ($auth, $cloudinary) {
    $user = $auth->requireAuth();
    
    $params = $req->body;
    return $cloudinary->generateUploadSignature($user, $params);
});

$router->post('/cloudinary/transform', function(Request $req) use ($auth, $cloudinary) {
    $user = $auth->requireAuth();
    
    $data = $req->validate([
        'public_id' => 'required|string',
        'width' => 'required',
        'height' => 'required'
    ]);
    
    return $cloudinary->transform($user, $data['public_id'], [
        'width' => (int) $data['width'],
        'height' => (int) $data['height'],
        'crop' => $req->input('crop', 'fill'),
        'gravity' => $req->input('gravity', 'auto'),
        'format' => $req->input('format'),
        'platform' => $req->input('platform')
    ]);
});

$router->post('/cloudinary/transform-video', function(Request $req) use ($auth, $cloudinary) {
    $user = $auth->requireAuth();
    
    $data = $req->validate([
        'public_id' => 'required|string',
        'width' => 'required',
        'height' => 'required'
    ]);
    
    return $cloudinary->transformVideo($user, $data['public_id'], [
        'width' => (int) $data['width'],
        'height' => (int) $data['height'],
        'crop' => $req->input('crop', 'fill'),
        'format' => $req->input('format', 'mp4'),
        'platform' => $req->input('platform')
    ]);
});

$router->get('/cloudinary/transform-url', function(Request $req) use ($auth, $cloudinary) {
    $user = $auth->requireAuth();
    
    $publicId = $req->get('public_id');
    $width = (int) $req->get('width');
    $height = (int) $req->get('height');
    
    if (!$publicId || !$width || !$height) {
        throw new ApiException('Missing required parameters', 400);
    }
    
    $url = $cloudinary->getTransformUrl($user, $publicId, [
        'width' => $width,
        'height' => $height,
        'crop' => $req->get('crop', 'fill'),
        'format' => $req->get('format')
    ]);
    
    return ['url' => $url];
});

// ============================================================
// SUPER ADMIN SETTINGS
// ============================================================

$router->get('/settings/api-keys', function(Request $req) use ($auth, $db) {
    $user = $auth->requireSuperAdmin();
    
    // Get system settings (masked)
    $settings = $db->fetchAll(
        "SELECT setting_key, 
                CASE WHEN setting_value IS NOT NULL THEN '••••••••' ELSE NULL END as setting_value,
                setting_type, description, is_public, updated_at
         FROM system_settings 
         WHERE setting_key LIKE '%api%' OR setting_key LIKE '%cloudinary%'"
    );
    
    return ['settings' => $settings];
});

$router->post('/settings/api-keys', function(Request $req) use ($auth, $db, $cloudinary, $encryption) {
    $user = $auth->requireSuperAdmin();
    
    $service = $req->input('service');
    
    if ($service === 'cloudinary') {
        $data = $req->validate([
            'cloud_name' => 'required|string',
            'api_key' => 'required|string',
            'api_secret' => 'required|string'
        ]);
        
        $cloudinary->saveSystemCredentials(
            $data['cloud_name'],
            $data['api_key'],
            $data['api_secret'],
            $user['id']
        );
        
        Logger::info('Cloudinary credentials updated by admin', ['admin_id' => $user['id']]);
        return Response::success('Cloudinary credentials saved');
    }
    
    if (in_array($service, ['openai', 'anthropic', 'google_ai'])) {
        $data = $req->validate([
            'api_key' => 'required|string'
        ]);
        
        $key = "{$service}_api_key";
        $encrypted = $encryption->encrypt($data['api_key']);
        
        $db->query(
            "INSERT INTO system_settings (setting_key, setting_value, setting_type, updated_by)
             VALUES (?, ?, 'encrypted', ?)
             ON DUPLICATE KEY UPDATE setting_value = ?, updated_by = ?",
            [$key, $encrypted, $user['id'], $encrypted, $user['id']]
        );
        
        Logger::info("{$service} API key updated by admin", ['admin_id' => $user['id']]);
        return Response::success("{$service} API key saved");
    }
    
    throw new ApiException('Unknown service', 400);
});

$router->delete('/settings/api-keys/{service}', function(Request $req) use ($auth, $db) {
    $user = $auth->requireSuperAdmin();
    $service = $req->params['service'];
    
    if ($service === 'cloudinary') {
        $db->query(
            "UPDATE system_settings SET setting_value = NULL, updated_by = ?
             WHERE setting_key IN ('cloudinary_cloud_name', 'cloudinary_api_key', 'cloudinary_api_secret')",
            [$user['id']]
        );
    } else {
        $db->query(
            "UPDATE system_settings SET setting_value = NULL, updated_by = ?
             WHERE setting_key = ?",
            [$user['id'], "{$service}_api_key"]
        );
    }
    
    Logger::info("{$service} credentials removed by admin", ['admin_id' => $user['id']]);
    return Response::success('Credentials removed');
});

// ============================================================
// USER BYOK SETTINGS
// ============================================================

$router->post('/settings/byok', function(Request $req) use ($auth, $cloudinary) {
    $user = $auth->requireAuth();
    
    $service = $req->input('service');
    
    if ($service === 'cloudinary') {
        $data = $req->validate([
            'cloud_name' => 'required|string',
            'api_key' => 'required|string',
            'api_secret' => 'required|string'
        ]);
        
        $cloudinary->saveUserCredentials(
            $user['id'],
            $data['cloud_name'],
            $data['api_key'],
            $data['api_secret']
        );
        
        return Response::success('Your Cloudinary credentials saved. You now have unlimited transforms!');
    }
    
    throw new ApiException('Unknown service', 400);
});

// ============================================================
// CRM: COMPANIES
// ============================================================

$router->get('/crm/companies', function(Request $req) use ($auth, $db) {
    $user = $auth->requireAuth();
    
    $companies = $db->fetchAll(
        "SELECT * FROM companies 
         WHERE owner_id = ? AND deleted_at IS NULL
         ORDER BY name ASC",
        [$user['id']]
    );
    
    return ['companies' => $companies];
});

$router->post('/crm/companies', function(Request $req) use ($auth, $db) {
    $user = $auth->requireAuth();
    
    $data = $req->validate([
        'uuid' => 'required|string',
        'name' => 'required|string|max:255'
    ]);
    
    $db->insert('companies', [
        'uuid' => $data['uuid'],
        'owner_id' => $user['id'],
        'team_id' => $user['team_id'],
        'name' => $data['name'],
        'industry' => $req->input('industry'),
        'website' => $req->input('website'),
        'description' => $req->input('description'),
        'brand_colors' => json_encode($req->input('brand_colors', [])),
        'brand_fonts' => json_encode($req->input('brand_fonts', []))
    ]);
    
    return Response::success('Company created');
});

$router->put('/crm/companies/{uuid}', function(Request $req) use ($auth, $db) {
    $user = $auth->requireAuth();
    $uuid = $req->params['uuid'];
    
    $company = $db->fetch('SELECT * FROM companies WHERE uuid = ?', [$uuid]);
    if (!$company || ($company['owner_id'] !== $user['id'] && $user['role'] !== 'super_admin')) {
        throw new ApiException('Company not found or access denied', 404);
    }
    
    $updateData = [];
    $allowedFields = ['name', 'industry', 'website', 'description', 'brand_colors', 
                      'brand_fonts', 'brand_guidelines', 'logo_url', 'share_level', 'shared_with'];
    
    foreach ($allowedFields as $field) {
        $value = $req->input($field);
        if ($value !== null) {
            $updateData[$field] = is_array($value) ? json_encode($value) : $value;
        }
    }
    
    if (!empty($updateData)) {
        $updateData['sync_version'] = $company['sync_version'] + 1;
        $db->update('companies', $updateData, 'uuid = ?', [$uuid]);
    }
    
    return Response::success('Company updated');
});

$router->delete('/crm/companies/{uuid}', function(Request $req) use ($auth, $db) {
    $user = $auth->requireAuth();
    $uuid = $req->params['uuid'];
    
    $company = $db->fetch('SELECT * FROM companies WHERE uuid = ?', [$uuid]);
    if (!$company || ($company['owner_id'] !== $user['id'] && $user['role'] !== 'super_admin')) {
        throw new ApiException('Company not found or access denied', 404);
    }
    
    $db->update('companies', [
        'deleted_at' => date('Y-m-d H:i:s'),
        'sync_version' => $company['sync_version'] + 1
    ], 'uuid = ?', [$uuid]);
    
    return Response::noContent();
});

// ============================================================
// CRM: PROJECTS
// ============================================================

$router->get('/crm/projects', function(Request $req) use ($auth, $db) {
    $user = $auth->requireAuth();
    
    $projects = $db->fetchAll(
        "SELECT p.*, c.name as company_name 
         FROM projects p
         LEFT JOIN companies c ON p.company_id = c.id
         WHERE p.owner_id = ? AND p.deleted_at IS NULL
         ORDER BY p.created_at DESC",
        [$user['id']]
    );
    
    return ['projects' => $projects];
});

$router->post('/crm/projects', function(Request $req) use ($auth, $db) {
    $user = $auth->requireAuth();
    
    $data = $req->validate([
        'uuid' => 'required|string',
        'name' => 'required|string|max:255'
    ]);
    
    // Get company ID from UUID if provided
    $companyId = null;
    if ($req->input('company_uuid')) {
        $companyId = $db->fetchColumn(
            'SELECT id FROM companies WHERE uuid = ?',
            [$req->input('company_uuid')]
        );
    }
    
    $db->insert('projects', [
        'uuid' => $data['uuid'],
        'owner_id' => $user['id'],
        'company_id' => $companyId,
        'name' => $data['name'],
        'description' => $req->input('description'),
        'status' => $req->input('status', 'active'),
        'target_platforms' => json_encode($req->input('target_platforms', [])),
        'due_date' => $req->input('due_date')
    ]);
    
    return Response::success('Project created');
});

// ============================================================
// PLATFORM SPECS
// ============================================================

$router->get('/platform-specs', function(Request $req) use ($db) {
    $specs = $db->fetchAll(
        'SELECT * FROM platform_specs WHERE is_active = 1 ORDER BY platform, placement'
    );
    
    return ['specs' => $specs];
});

// ============================================================
// ADMIN: USER MANAGEMENT
// ============================================================

$router->get('/admin/users', function(Request $req) use ($auth, $db) {
    $user = $auth->requireAdmin();
    
    $page = $req->page();
    $perPage = $req->perPage();
    $offset = $req->offset();
    
    // Super admin sees all, domain admin sees domain only
    $where = '1=1';
    $params = [];
    
    if ($user['role'] !== 'super_admin') {
        $where = 'domain = ?';
        $params = [$user['domain']];
    }
    
    $total = $db->fetchColumn("SELECT COUNT(*) FROM users WHERE {$where}", $params);
    $users = $db->fetchAll(
        "SELECT id, email, name, role, domain, created_at, last_login 
         FROM users WHERE {$where} 
         ORDER BY created_at DESC LIMIT ? OFFSET ?",
        array_merge($params, [$perPage, $offset])
    );
    
    return Response::paginated($users, (int) $total, $page, $perPage);
});

$router->put('/admin/users/{id}/role', function(Request $req) use ($auth, $db) {
    $user = $auth->requireAdmin();
    $targetId = (int) $req->params['id'];
    
    $targetUser = $db->fetch('SELECT * FROM users WHERE id = ?', [$targetId]);
    if (!$targetUser) {
        throw new ApiException('User not found', 404);
    }
    
    // Domain admin can only manage users in their domain
    if ($user['role'] !== 'super_admin' && $targetUser['domain'] !== $user['domain']) {
        throw new ApiException('Access denied', 403);
    }
    
    $newRole = $req->input('role');
    $allowedRoles = ['viewer', 'editor', 'admin'];
    
    // Only super admin can create super admins
    if ($user['role'] === 'super_admin') {
        $allowedRoles[] = 'super_admin';
    }
    
    if (!in_array($newRole, $allowedRoles)) {
        throw new ApiException('Invalid role', 400);
    }
    
    $db->update('users', ['role' => $newRole], 'id = ?', [$targetId]);
    
    Logger::info('User role updated', [
        'admin_id' => $user['id'],
        'target_id' => $targetId,
        'new_role' => $newRole
    ]);
    
    return Response::success('User role updated');
});

// ============================================================
// DISPATCH
// ============================================================

$response = $router->dispatch($request);
$response->send();

