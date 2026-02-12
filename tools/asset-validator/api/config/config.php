<?php
/**
 * Creative Asset Validator - Configuration
 * SiteGround MySQL + Cloudinary
 * 
 * IMPORTANT: 
 * - Cloudinary credentials are configured via Super Admin UI, NOT here
 * - This file contains only database and OAuth settings
 */

return [
    // ========================================================
    // DATABASE (SiteGround MySQL)
    // ========================================================
    'database' => [
        'host' => 'localhost',
        'name' => 'dbl5tvsio9ogwd',  // Your SiteGround database
        'user' => 'u_creativeasset', // Replace with your DB user
        'pass' => 'YOUR_DB_PASSWORD', // Replace with your DB password
        'charset' => 'utf8mb4',
        'port' => 3306,
    ],

    // ========================================================
    // GOOGLE OAUTH
    // ========================================================
    'google' => [
        'client_id' => '272954577285-q10s5t6v62p6amlhpn5od3u3oa1djh58.apps.googleusercontent.com',
        'allowed_domains' => ['*'], // Allow all domains
    ],

    // ========================================================
    // SECURITY
    // ========================================================
    'security' => [
        // 64-character hex key for AES-256-GCM encryption
        // Generate new one with: bin2hex(random_bytes(32))
        'encryption_key' => 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
        
        'session_lifetime_days' => 7,
        'require_device_binding' => false,
        
        // Super admin emails (full platform access)
        'super_admins' => [
            'john@itallstartedwithaidea.com',
        ],
    ],

    // ========================================================
    // CORS (Cross-Origin Resource Sharing)
    // ========================================================
    'cors' => [
        'allowed_origins' => [
            'https://itallstartedwithaidea.com',
            'https://www.itallstartedwithaidea.com',
            'http://localhost:8500', // Development
        ],
    ],

    // ========================================================
    // CLOUDINARY
    // Note: Credentials are set via Super Admin UI in the app
    // These are just fallback defaults if not configured
    // ========================================================
    'cloudinary' => [
        'cloud_name' => null,  // Set via Super Admin Settings
        'api_key' => null,     // Set via Super Admin Settings
        'api_secret' => null,  // Set via Super Admin Settings
        
        // Quota settings
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
        'conflict_resolution' => 'server_wins',
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
        'byok_cloudinary' => true,
    ],

    // ========================================================
    // LOGGING
    // ========================================================
    'logging' => [
        'level' => 'info',
        'file' => __DIR__ . '/../logs/app.log',
    ],
];

