<?php
/**
 * Creative Asset Validator - Configuration Template
 * Copy this file to config.php and fill in your values
 * 
 * IMPORTANT: config.php should NEVER be committed to git!
 */

return [
    // ========================================================
    // DATABASE (SiteGround MySQL)
    // ========================================================
    'database' => [
        'host' => 'localhost',
        'name' => 'dbl5tvsio9ogwd',  // Your SiteGround database name
        'user' => 'your_db_user',     // Database user
        'pass' => 'your_db_password', // Database password
        'charset' => 'utf8mb4',
        'port' => 3306,
    ],

    // ========================================================
    // GOOGLE OAUTH
    // ========================================================
    'google' => [
        'client_id' => 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
        'allowed_domains' => ['*'], // ['yourcompany.com'] to restrict
    ],

    // ========================================================
    // SECURITY
    // ========================================================
    'security' => [
        // Generate with: bin2hex(random_bytes(32))
        'encryption_key' => 'your_64_character_hex_encryption_key_here_generate_new_one',
        
        // Session settings
        'session_lifetime_days' => 7,
        'require_device_binding' => false,
        
        // Super admin emails
        'super_admins' => [
            'your-email@yourcompany.com',
        ],
    ],

    // ========================================================
    // CORS (Cross-Origin Resource Sharing)
    // ========================================================
    'cors' => [
        'allowed_origins' => [
            'https://yourdomain.com',
            'https://www.yourdomain.com',
            'http://localhost:8500', // Development
        ],
    ],

    // ========================================================
    // CLOUDINARY (Shared Account - Optional)
    // These can also be set via Super Admin settings UI
    // ========================================================
    'cloudinary' => [
        'cloud_name' => null,  // Set via admin UI
        'api_key' => null,     // Set via admin UI
        'api_secret' => null,  // Set via admin UI
        
        // Quotas for free tier
        'free_transforms_monthly' => 25,
        'free_storage_mb' => 100,
    ],

    // ========================================================
    // RATE LIMITING
    // ========================================================
    'rate_limits' => [
        'auth' => ['requests' => 10, 'window_seconds' => 60],
        'sync' => ['requests' => 60, 'window_seconds' => 60],
        'transform' => ['requests' => 20, 'window_seconds' => 60],
        'default' => ['requests' => 100, 'window_seconds' => 60],
    ],

    // ========================================================
    // SYNC SETTINGS
    // ========================================================
    'sync' => [
        'conflict_resolution' => 'server_wins', // 'server_wins', 'client_wins', 'newest_wins'
        'max_batch_size' => 100,
        'auto_sync_interval_seconds' => 30,
    ],

    // ========================================================
    // FEATURES
    // ========================================================
    'features' => [
        'video_resize' => true,
        'ai_analysis' => true,
        'team_sync' => true,
        'byok_cloudinary' => true, // Allow users to use their own Cloudinary
    ],

    // ========================================================
    // LOGGING
    // ========================================================
    'logging' => [
        'level' => 'info', // 'debug', 'info', 'warning', 'error'
        'file' => __DIR__ . '/../logs/app.log',
    ],
];

