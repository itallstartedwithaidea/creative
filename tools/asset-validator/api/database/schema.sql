-- ============================================================
-- Creative Asset Validator - SaaS Database Schema v5.0.0
-- MySQL 8.0+ Compatible
-- Database: dbl5tvsio9ogwd (creativeassetvalidator)
-- ============================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- ============================================================
-- USERS & AUTHENTICATION
-- ============================================================

CREATE TABLE IF NOT EXISTS `users` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `google_id` VARCHAR(255) UNIQUE NOT NULL,
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `picture` VARCHAR(500) DEFAULT NULL,
    `role` ENUM('viewer', 'editor', 'admin', 'super_admin') DEFAULT 'editor',
    `domain` VARCHAR(255) DEFAULT NULL,
    `team_id` INT UNSIGNED DEFAULT NULL,
    
    -- Cloudinary BYOK (Bring Your Own Key)
    `cloudinary_cloud_name` VARCHAR(255) DEFAULT NULL,
    `cloudinary_api_key` VARCHAR(255) DEFAULT NULL,
    `cloudinary_api_secret` TEXT DEFAULT NULL, -- Encrypted
    
    -- Quota tracking
    `quota_transforms_used` INT UNSIGNED DEFAULT 0,
    `quota_storage_used_mb` DECIMAL(10,2) DEFAULT 0,
    `quota_reset_date` DATE DEFAULT NULL,
    
    -- Timestamps
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `last_login` TIMESTAMP NULL,
    
    INDEX `idx_email` (`email`),
    INDEX `idx_domain` (`domain`),
    INDEX `idx_team` (`team_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_sessions` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT UNSIGNED NOT NULL,
    `session_token` VARCHAR(128) UNIQUE NOT NULL,
    `device_fingerprint` VARCHAR(64) DEFAULT NULL,
    `ip_address` VARCHAR(45) DEFAULT NULL,
    `user_agent` TEXT DEFAULT NULL,
    `expires_at` TIMESTAMP NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_token` (`session_token`),
    INDEX `idx_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TEAMS & SHARING
-- ============================================================

CREATE TABLE IF NOT EXISTS `teams` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `domain` VARCHAR(255) NOT NULL,
    `owner_id` INT UNSIGNED NOT NULL,
    `settings` JSON DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_domain` (`domain`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `team_members` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `team_id` INT UNSIGNED NOT NULL,
    `user_id` INT UNSIGNED NOT NULL,
    `role` ENUM('member', 'admin') DEFAULT 'member',
    `joined_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_member` (`team_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- CRM: COMPANIES & PROJECTS
-- ============================================================

CREATE TABLE IF NOT EXISTS `companies` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `uuid` VARCHAR(36) UNIQUE NOT NULL,
    `owner_id` INT UNSIGNED NOT NULL,
    `team_id` INT UNSIGNED DEFAULT NULL,
    
    -- Basic info
    `name` VARCHAR(255) NOT NULL,
    `industry` VARCHAR(100) DEFAULT NULL,
    `website` VARCHAR(500) DEFAULT NULL,
    `description` TEXT DEFAULT NULL,
    
    -- Brand guidelines
    `brand_colors` JSON DEFAULT NULL,
    `brand_fonts` JSON DEFAULT NULL,
    `brand_guidelines` TEXT DEFAULT NULL,
    `logo_url` VARCHAR(500) DEFAULT NULL,
    
    -- Sharing
    `share_level` ENUM('private', 'team', 'public') DEFAULT 'private',
    `shared_with` JSON DEFAULT NULL,
    
    -- Sync tracking
    `sync_version` INT UNSIGNED DEFAULT 1,
    `last_synced_at` TIMESTAMP NULL,
    `needs_sync` TINYINT(1) DEFAULT 0,
    `deleted_at` TIMESTAMP NULL,
    
    -- Timestamps
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE SET NULL,
    INDEX `idx_owner` (`owner_id`),
    INDEX `idx_sync` (`needs_sync`, `sync_version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `projects` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `uuid` VARCHAR(36) UNIQUE NOT NULL,
    `company_id` INT UNSIGNED DEFAULT NULL,
    `owner_id` INT UNSIGNED NOT NULL,
    
    -- Basic info
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `status` ENUM('active', 'completed', 'archived') DEFAULT 'active',
    `target_platforms` JSON DEFAULT NULL,
    `due_date` DATE DEFAULT NULL,
    
    -- Sharing
    `share_level` ENUM('private', 'team', 'public') DEFAULT 'private',
    `shared_with` JSON DEFAULT NULL,
    
    -- Sync tracking
    `sync_version` INT UNSIGNED DEFAULT 1,
    `last_synced_at` TIMESTAMP NULL,
    `needs_sync` TINYINT(1) DEFAULT 0,
    `deleted_at` TIMESTAMP NULL,
    
    -- Timestamps
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_company` (`company_id`),
    INDEX `idx_owner` (`owner_id`),
    INDEX `idx_sync` (`needs_sync`, `sync_version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- CRM: CONTACTS
-- ============================================================

CREATE TABLE IF NOT EXISTS `contacts` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `uuid` VARCHAR(36) UNIQUE NOT NULL,
    `owner_id` INT UNSIGNED NOT NULL,
    `company_id` INT UNSIGNED DEFAULT NULL,
    
    -- Contact info
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) DEFAULT NULL,
    `phone` VARCHAR(50) DEFAULT NULL,
    `title` VARCHAR(100) DEFAULT NULL,
    `notes` TEXT DEFAULT NULL,
    
    -- Custom fields (JSON)
    `custom_fields` JSON DEFAULT NULL,
    `tags` JSON DEFAULT NULL,
    
    -- Sharing
    `share_level` ENUM('private', 'team', 'public') DEFAULT 'private',
    `shared_with` JSON DEFAULT NULL,
    
    -- Sync tracking
    `sync_version` INT UNSIGNED DEFAULT 1,
    `needs_sync` TINYINT(1) DEFAULT 0,
    `deleted_at` TIMESTAMP NULL,
    
    -- Timestamps
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE SET NULL,
    INDEX `idx_owner` (`owner_id`),
    INDEX `idx_company` (`company_id`),
    INDEX `idx_sync` (`needs_sync`, `sync_version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- CRM: DEALS
-- ============================================================

CREATE TABLE IF NOT EXISTS `deals` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `uuid` VARCHAR(36) UNIQUE NOT NULL,
    `owner_id` INT UNSIGNED NOT NULL,
    `company_id` INT UNSIGNED DEFAULT NULL,
    `contact_id` INT UNSIGNED DEFAULT NULL,
    
    -- Deal info
    `name` VARCHAR(255) NOT NULL,
    `value` DECIMAL(15,2) DEFAULT 0,
    `currency` VARCHAR(3) DEFAULT 'USD',
    `stage` VARCHAR(50) DEFAULT 'lead',
    `probability` INT UNSIGNED DEFAULT 0,
    `expected_close_date` DATE DEFAULT NULL,
    `notes` TEXT DEFAULT NULL,
    
    -- Custom fields
    `custom_fields` JSON DEFAULT NULL,
    `tags` JSON DEFAULT NULL,
    
    -- Sharing
    `share_level` ENUM('private', 'team', 'public') DEFAULT 'private',
    `shared_with` JSON DEFAULT NULL,
    
    -- Sync tracking
    `sync_version` INT UNSIGNED DEFAULT 1,
    `needs_sync` TINYINT(1) DEFAULT 0,
    `deleted_at` TIMESTAMP NULL,
    
    -- Timestamps
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON DELETE SET NULL,
    INDEX `idx_owner` (`owner_id`),
    INDEX `idx_stage` (`stage`),
    INDEX `idx_sync` (`needs_sync`, `sync_version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- CRM: ACTIVITIES
-- ============================================================

CREATE TABLE IF NOT EXISTS `crm_activities` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `uuid` VARCHAR(36) UNIQUE NOT NULL,
    `owner_id` INT UNSIGNED NOT NULL,
    `company_id` INT UNSIGNED DEFAULT NULL,
    `contact_id` INT UNSIGNED DEFAULT NULL,
    `deal_id` INT UNSIGNED DEFAULT NULL,
    
    -- Activity info
    `activity_type` VARCHAR(50) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `details` JSON DEFAULT NULL,
    
    -- Sync tracking
    `sync_version` INT UNSIGNED DEFAULT 1,
    `needs_sync` TINYINT(1) DEFAULT 0,
    `deleted_at` TIMESTAMP NULL,
    
    -- Timestamps
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`deal_id`) REFERENCES `deals`(`id`) ON DELETE SET NULL,
    INDEX `idx_owner` (`owner_id`),
    INDEX `idx_type` (`activity_type`),
    INDEX `idx_sync` (`needs_sync`, `sync_version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- CRM: TAGS
-- ============================================================

CREATE TABLE IF NOT EXISTS `crm_tags` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `uuid` VARCHAR(36) UNIQUE NOT NULL,
    `owner_id` INT UNSIGNED NOT NULL,
    
    -- Tag info
    `name` VARCHAR(100) NOT NULL,
    `color` VARCHAR(20) DEFAULT '#3b82f6',
    `category` VARCHAR(50) DEFAULT 'general',
    
    -- Sync tracking
    `sync_version` INT UNSIGNED DEFAULT 1,
    `needs_sync` TINYINT(1) DEFAULT 0,
    `deleted_at` TIMESTAMP NULL,
    
    -- Timestamps
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_owner` (`owner_id`),
    UNIQUE KEY `unique_user_tag` (`owner_id`, `name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- CRM: COMPETITORS
-- ============================================================

CREATE TABLE IF NOT EXISTS `competitors` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `uuid` VARCHAR(36) UNIQUE NOT NULL,
    `owner_id` INT UNSIGNED NOT NULL,
    `company_id` INT UNSIGNED DEFAULT NULL,
    
    -- Competitor info
    `name` VARCHAR(255) NOT NULL,
    `website` VARCHAR(500) DEFAULT NULL,
    `description` TEXT DEFAULT NULL,
    `strengths` JSON DEFAULT NULL,
    `weaknesses` JSON DEFAULT NULL,
    `notes` TEXT DEFAULT NULL,
    
    -- Sharing
    `share_level` ENUM('private', 'team', 'public') DEFAULT 'private',
    `shared_with` JSON DEFAULT NULL,
    
    -- Sync tracking
    `sync_version` INT UNSIGNED DEFAULT 1,
    `needs_sync` TINYINT(1) DEFAULT 0,
    `deleted_at` TIMESTAMP NULL,
    
    -- Timestamps
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE SET NULL,
    INDEX `idx_owner` (`owner_id`),
    INDEX `idx_sync` (`needs_sync`, `sync_version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- CRM: CUSTOM FIELDS DEFINITIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS `crm_custom_fields` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `uuid` VARCHAR(36) UNIQUE NOT NULL,
    `owner_id` INT UNSIGNED NOT NULL,
    
    -- Field definition
    `entity_type` ENUM('contact', 'company', 'deal', 'project') NOT NULL,
    `field_name` VARCHAR(100) NOT NULL,
    `field_type` ENUM('text', 'number', 'date', 'select', 'multiselect', 'url', 'email') DEFAULT 'text',
    `options` JSON DEFAULT NULL, -- For select/multiselect
    `is_required` TINYINT(1) DEFAULT 0,
    `display_order` INT DEFAULT 0,
    
    -- Sync tracking
    `sync_version` INT UNSIGNED DEFAULT 1,
    `needs_sync` TINYINT(1) DEFAULT 0,
    `deleted_at` TIMESTAMP NULL,
    
    -- Timestamps
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_owner` (`owner_id`),
    UNIQUE KEY `unique_user_entity_field` (`owner_id`, `entity_type`, `field_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- ASSETS
-- ============================================================

CREATE TABLE IF NOT EXISTS `assets` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `uuid` VARCHAR(36) UNIQUE NOT NULL,
    `owner_id` INT UNSIGNED NOT NULL,
    `company_id` INT UNSIGNED DEFAULT NULL,
    `project_id` INT UNSIGNED DEFAULT NULL,
    
    -- Asset info
    `name` VARCHAR(255) NOT NULL,
    `type` ENUM('image', 'video', 'document') DEFAULT 'image',
    `mime_type` VARCHAR(100) DEFAULT NULL,
    `file_size` INT UNSIGNED DEFAULT 0,
    `width` INT UNSIGNED DEFAULT NULL,
    `height` INT UNSIGNED DEFAULT NULL,
    `duration` DECIMAL(10,2) DEFAULT NULL, -- For video
    
    -- Storage
    `storage_type` ENUM('indexeddb', 'cloudinary', 'url') DEFAULT 'indexeddb',
    `cloudinary_id` VARCHAR(255) DEFAULT NULL,
    `cloudinary_url` VARCHAR(500) DEFAULT NULL,
    `thumbnail_url` VARCHAR(500) DEFAULT NULL,
    `original_url` VARCHAR(500) DEFAULT NULL,
    
    -- Validation results (cached)
    `validation_score` INT UNSIGNED DEFAULT NULL,
    `validation_issues` JSON DEFAULT NULL,
    `validation_results` JSON DEFAULT NULL,
    `last_validated_at` TIMESTAMP NULL,
    
    -- Metadata
    `tags` JSON DEFAULT NULL,
    `ai_analysis` JSON DEFAULT NULL,
    `metadata` JSON DEFAULT NULL,
    
    -- Sync tracking
    `sync_version` INT UNSIGNED DEFAULT 1,
    `last_synced_at` TIMESTAMP NULL,
    `needs_sync` TINYINT(1) DEFAULT 0,
    `deleted_at` TIMESTAMP NULL,
    
    -- Timestamps
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE SET NULL,
    INDEX `idx_owner` (`owner_id`),
    INDEX `idx_cloudinary` (`cloudinary_id`),
    INDEX `idx_sync` (`needs_sync`, `sync_version`),
    INDEX `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `asset_shares` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `asset_id` INT UNSIGNED NOT NULL,
    `shared_by` INT UNSIGNED NOT NULL,
    `shared_with` INT UNSIGNED NOT NULL,
    `access_level` ENUM('view', 'edit', 'full') DEFAULT 'view',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`shared_by`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`shared_with`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_share` (`asset_id`, `shared_with`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `asset_transforms` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `uuid` VARCHAR(36) UNIQUE NOT NULL,
    `source_asset_id` INT UNSIGNED NOT NULL,
    `owner_id` INT UNSIGNED NOT NULL,
    
    -- Transform details
    `transform_type` ENUM('resize', 'crop', 'format', 'optimize') DEFAULT 'resize',
    `target_width` INT UNSIGNED DEFAULT NULL,
    `target_height` INT UNSIGNED DEFAULT NULL,
    `target_format` VARCHAR(10) DEFAULT NULL,
    `platform_name` VARCHAR(50) DEFAULT NULL,
    
    -- Result
    `cloudinary_id` VARCHAR(255) DEFAULT NULL,
    `result_url` VARCHAR(500) DEFAULT NULL,
    `result_size` INT UNSIGNED DEFAULT 0,
    `status` ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    `error_message` TEXT DEFAULT NULL,
    
    -- Credits used
    `credits_used` DECIMAL(5,2) DEFAULT 0,
    
    -- Timestamps
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `completed_at` TIMESTAMP NULL,
    
    FOREIGN KEY (`source_asset_id`) REFERENCES `assets`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_source` (`source_asset_id`),
    INDEX `idx_owner` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- BRAND KITS
-- ============================================================

CREATE TABLE IF NOT EXISTS `brand_kits` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `uuid` VARCHAR(36) UNIQUE NOT NULL,
    `company_id` INT UNSIGNED NOT NULL,
    `owner_id` INT UNSIGNED NOT NULL,
    
    -- Logo variations
    `logo_primary_url` VARCHAR(500) DEFAULT NULL,
    `logo_secondary_url` VARCHAR(500) DEFAULT NULL,
    `logo_icon_url` VARCHAR(500) DEFAULT NULL,
    `logo_dark_url` VARCHAR(500) DEFAULT NULL,
    `logo_light_url` VARCHAR(500) DEFAULT NULL,
    
    -- Generated sizes (JSON array of generated logo sizes)
    `generated_sizes` JSON DEFAULT NULL,
    
    -- Export history
    `last_export_at` TIMESTAMP NULL,
    `export_count` INT UNSIGNED DEFAULT 0,
    
    -- Sync tracking
    `sync_version` INT UNSIGNED DEFAULT 1,
    `needs_sync` TINYINT(1) DEFAULT 0,
    `deleted_at` TIMESTAMP NULL,
    
    -- Timestamps
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SYNC & AUDIT LOG
-- ============================================================

CREATE TABLE IF NOT EXISTS `sync_log` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT UNSIGNED NOT NULL,
    `entity_type` ENUM('asset', 'company', 'project', 'brand_kit') NOT NULL,
    `entity_uuid` VARCHAR(36) NOT NULL,
    `action` ENUM('create', 'update', 'delete') NOT NULL,
    `old_version` INT UNSIGNED DEFAULT NULL,
    `new_version` INT UNSIGNED DEFAULT NULL,
    `changes` JSON DEFAULT NULL,
    `conflict_detected` TINYINT(1) DEFAULT 0,
    `conflict_resolution` VARCHAR(50) DEFAULT NULL,
    `device_id` VARCHAR(64) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_user_entity` (`user_id`, `entity_type`),
    INDEX `idx_entity` (`entity_uuid`),
    INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- USAGE TRACKING
-- ============================================================

CREATE TABLE IF NOT EXISTS `usage_tracking` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT UNSIGNED NOT NULL,
    `usage_type` ENUM('transform', 'upload', 'ai_analysis', 'export') NOT NULL,
    `quantity` INT UNSIGNED DEFAULT 1,
    `credits_used` DECIMAL(5,2) DEFAULT 0,
    `details` JSON DEFAULT NULL,
    `billing_period` VARCHAR(7) NOT NULL, -- YYYY-MM format
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_user_period` (`user_id`, `billing_period`),
    INDEX `idx_type` (`usage_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- API KEYS (Encrypted - for BYOK)
-- ============================================================

CREATE TABLE IF NOT EXISTS `user_api_keys` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT UNSIGNED NOT NULL,
    `service` VARCHAR(50) NOT NULL, -- 'cloudinary', 'openai', 'anthropic', etc.
    `key_name` VARCHAR(100) DEFAULT NULL, -- e.g., 'cloud_name', 'api_key', 'api_secret'
    `key_value` TEXT NOT NULL, -- Encrypted value
    `is_valid` TINYINT(1) DEFAULT 1,
    `last_validated` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_user_service_key` (`user_id`, `service`, `key_name`),
    INDEX `idx_user_service` (`user_id`, `service`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PLATFORM SPECS (Reference Data)
-- ============================================================

CREATE TABLE IF NOT EXISTS `platform_specs` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `platform` VARCHAR(50) NOT NULL,
    `placement` VARCHAR(50) NOT NULL,
    `aspect_ratio` VARCHAR(20) DEFAULT NULL,
    `min_width` INT UNSIGNED DEFAULT NULL,
    `min_height` INT UNSIGNED DEFAULT NULL,
    `max_width` INT UNSIGNED DEFAULT NULL,
    `max_height` INT UNSIGNED DEFAULT NULL,
    `recommended_width` INT UNSIGNED DEFAULT NULL,
    `recommended_height` INT UNSIGNED DEFAULT NULL,
    `max_file_size_mb` DECIMAL(5,2) DEFAULT NULL,
    `allowed_formats` JSON DEFAULT NULL,
    `max_duration_seconds` INT UNSIGNED DEFAULT NULL,
    `notes` TEXT DEFAULT NULL,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY `unique_platform_placement` (`platform`, `placement`),
    INDEX `idx_platform` (`platform`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SWIPE FILES
-- ============================================================

CREATE TABLE IF NOT EXISTS `swipe_files` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `uuid` VARCHAR(36) UNIQUE NOT NULL,
    `owner_id` INT UNSIGNED NOT NULL,
    `company_id` INT UNSIGNED DEFAULT NULL,
    
    `title` VARCHAR(255) NOT NULL,
    `source_url` VARCHAR(500) DEFAULT NULL,
    `image_url` VARCHAR(500) DEFAULT NULL,
    `thumbnail_url` VARCHAR(500) DEFAULT NULL,
    `category` VARCHAR(100) DEFAULT NULL,
    `tags` JSON DEFAULT NULL,
    
    -- AI Analysis
    `ai_analysis` JSON DEFAULT NULL,
    `design_patterns` JSON DEFAULT NULL,
    `color_palette` JSON DEFAULT NULL,
    
    -- Sync
    `sync_version` INT UNSIGNED DEFAULT 1,
    `needs_sync` TINYINT(1) DEFAULT 0,
    `deleted_at` TIMESTAMP NULL,
    
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SYSTEM SETTINGS (Super Admin configurable)
-- ============================================================

CREATE TABLE IF NOT EXISTS `system_settings` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `setting_key` VARCHAR(100) UNIQUE NOT NULL,
    `setting_value` TEXT DEFAULT NULL,
    `setting_type` ENUM('string', 'number', 'boolean', 'json', 'encrypted') DEFAULT 'string',
    `description` TEXT DEFAULT NULL,
    `is_public` TINYINT(1) DEFAULT 0, -- If true, sent to client
    `updated_by` INT UNSIGNED DEFAULT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- VIEWS
-- ============================================================

CREATE OR REPLACE VIEW `v_user_quota_status` AS
SELECT 
    u.id,
    u.email,
    u.quota_transforms_used,
    u.quota_storage_used_mb,
    u.quota_reset_date,
    CASE 
        WHEN u.cloudinary_api_key IS NOT NULL THEN 'byok'
        ELSE 'shared'
    END AS quota_type,
    CASE 
        WHEN u.cloudinary_api_key IS NOT NULL THEN 999999
        ELSE 25
    END AS quota_limit,
    CASE 
        WHEN u.cloudinary_api_key IS NOT NULL THEN 0
        ELSE ROUND((u.quota_transforms_used / 25) * 100, 1)
    END AS quota_percent_used
FROM users u;

CREATE OR REPLACE VIEW `v_assets_with_owner` AS
SELECT 
    a.*,
    u.email AS owner_email,
    u.name AS owner_name,
    c.name AS company_name,
    p.name AS project_name
FROM assets a
JOIN users u ON a.owner_id = u.id
LEFT JOIN companies c ON a.company_id = c.id
LEFT JOIN projects p ON a.project_id = p.id
WHERE a.deleted_at IS NULL;

-- ============================================================
-- STORED PROCEDURES
-- ============================================================

DELIMITER //

-- Reset monthly quotas (run via cron on 1st of month)
CREATE PROCEDURE IF NOT EXISTS `sp_reset_monthly_quotas`()
BEGIN
    UPDATE users 
    SET 
        quota_transforms_used = 0,
        quota_reset_date = CURDATE()
    WHERE cloudinary_api_key IS NULL; -- Only reset for shared quota users
END //

-- Use a transform credit
CREATE PROCEDURE IF NOT EXISTS `sp_use_transform`(
    IN p_user_id INT UNSIGNED,
    IN p_credits DECIMAL(5,2)
)
BEGIN
    UPDATE users 
    SET quota_transforms_used = quota_transforms_used + p_credits
    WHERE id = p_user_id;
    
    INSERT INTO usage_tracking (user_id, usage_type, credits_used, billing_period)
    VALUES (p_user_id, 'transform', p_credits, DATE_FORMAT(NOW(), '%Y-%m'));
END //

-- Get changes since last sync
CREATE PROCEDURE IF NOT EXISTS `sp_get_sync_changes`(
    IN p_user_id INT UNSIGNED,
    IN p_since_version INT UNSIGNED,
    IN p_entity_type VARCHAR(50)
)
BEGIN
    IF p_entity_type = 'assets' THEN
        SELECT * FROM assets 
        WHERE owner_id = p_user_id 
        AND sync_version > p_since_version
        AND deleted_at IS NULL;
    ELSEIF p_entity_type = 'companies' THEN
        SELECT * FROM companies 
        WHERE owner_id = p_user_id 
        AND sync_version > p_since_version
        AND deleted_at IS NULL;
    ELSEIF p_entity_type = 'projects' THEN
        SELECT * FROM projects 
        WHERE owner_id = p_user_id 
        AND sync_version > p_since_version
        AND deleted_at IS NULL;
    END IF;
END //

DELIMITER ;

-- ============================================================
-- INSERT DEFAULT PLATFORM SPECS
-- ============================================================

INSERT INTO `platform_specs` (`platform`, `placement`, `aspect_ratio`, `recommended_width`, `recommended_height`, `max_file_size_mb`, `allowed_formats`, `max_duration_seconds`) VALUES
-- Meta (Facebook & Instagram)
('facebook', 'feed', '1:1', 1080, 1080, 30, '["jpg","png","gif","mp4"]', 120),
('facebook', 'story', '9:16', 1080, 1920, 30, '["jpg","png","mp4"]', 15),
('facebook', 'reels', '9:16', 1080, 1920, 4000, '["mp4"]', 90),
('facebook', 'cover', '16:9', 1640, 924, 10, '["jpg","png"]', NULL),
('instagram', 'feed_square', '1:1', 1080, 1080, 30, '["jpg","png"]', NULL),
('instagram', 'feed_portrait', '4:5', 1080, 1350, 30, '["jpg","png"]', NULL),
('instagram', 'story', '9:16', 1080, 1920, 30, '["jpg","png","mp4"]', 60),
('instagram', 'reels', '9:16', 1080, 1920, 4000, '["mp4"]', 90),

-- Google
('google_ads', 'display_banner', '16:9', 1200, 628, 5, '["jpg","png","gif"]', NULL),
('google_ads', 'display_square', '1:1', 1200, 1200, 5, '["jpg","png","gif"]', NULL),
('google_ads', 'responsive_landscape', '1.91:1', 1200, 628, 5, '["jpg","png"]', NULL),
('google_ads', 'responsive_square', '1:1', 1200, 1200, 5, '["jpg","png"]', NULL),
('youtube', 'thumbnail', '16:9', 1280, 720, 2, '["jpg","png"]', NULL),
('youtube', 'shorts', '9:16', 1080, 1920, 60000, '["mp4"]', 60),

-- TikTok
('tiktok', 'feed', '9:16', 1080, 1920, 287, '["mp4"]', 180),
('tiktok', 'ads', '9:16', 1080, 1920, 500, '["mp4"]', 60),

-- LinkedIn
('linkedin', 'feed', '1.91:1', 1200, 628, 10, '["jpg","png"]', NULL),
('linkedin', 'square', '1:1', 1080, 1080, 10, '["jpg","png"]', NULL),
('linkedin', 'video', '16:9', 1920, 1080, 200, '["mp4"]', 600),

-- Twitter/X
('twitter', 'feed', '16:9', 1200, 675, 5, '["jpg","png","gif"]', NULL),
('twitter', 'square', '1:1', 1080, 1080, 5, '["jpg","png","gif"]', NULL),
('twitter', 'video', '16:9', 1920, 1080, 512, '["mp4"]', 140),

-- Pinterest
('pinterest', 'pin', '2:3', 1000, 1500, 20, '["jpg","png"]', NULL),
('pinterest', 'video', '2:3', 1000, 1500, 2000, '["mp4"]', 900),

-- Snapchat
('snapchat', 'snap', '9:16', 1080, 1920, 5, '["jpg","png","mp4"]', 180),
('snapchat', 'story', '9:16', 1080, 1920, 5, '["jpg","png","mp4"]', 10),

-- Display
('display', 'leaderboard', '8:1', 728, 90, 2, '["jpg","png","gif"]', NULL),
('display', 'medium_rectangle', '1.2:1', 300, 250, 2, '["jpg","png","gif"]', NULL),
('display', 'skyscraper', '1:6', 160, 600, 2, '["jpg","png","gif"]', NULL),
('display', 'billboard', '3:1', 970, 250, 2, '["jpg","png","gif"]', NULL);

-- ============================================================
-- INSERT DEFAULT SYSTEM SETTINGS
-- ============================================================

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) VALUES
-- Cloudinary (Super Admin configurable - NOT hardcoded)
('cloudinary_cloud_name', NULL, 'encrypted', 'Cloudinary Cloud Name for shared account', 0),
('cloudinary_api_key', NULL, 'encrypted', 'Cloudinary API Key for shared account', 0),
('cloudinary_api_secret', NULL, 'encrypted', 'Cloudinary API Secret for shared account', 0),

-- Quota settings
('shared_quota_transforms', '25', 'number', 'Monthly transform limit for shared Cloudinary users', 1),
('shared_quota_storage_mb', '100', 'number', 'Storage limit in MB for shared users', 1),

-- Feature flags
('feature_video_resize', 'true', 'boolean', 'Enable video resizing feature', 1),
('feature_ai_analysis', 'true', 'boolean', 'Enable AI analysis features', 1),
('feature_team_sync', 'true', 'boolean', 'Enable team synchronization', 1),

-- API keys for AI (Super Admin configurable)
('openai_api_key', NULL, 'encrypted', 'OpenAI API Key for shared AI features', 0),
('anthropic_api_key', NULL, 'encrypted', 'Anthropic API Key for Claude', 0),
('google_ai_api_key', NULL, 'encrypted', 'Google AI API Key for Gemini', 0);

COMMIT;

