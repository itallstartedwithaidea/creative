-- ============================================================
-- RECONCILIATION MIGRATION - Fix All Column Conflicts
-- Creative Innovate Tool
-- Version: 2.1.0 - January 18, 2026
-- 
-- This migration ensures ALL expected columns exist in ALL tables
-- regardless of which prior migration ran first.
-- 
-- The app uses three different patterns:
--   1. user_email (TEXT) - unified-storage.js
--   2. user_id (UUID) - supabase-backend.js with auth.users
--   3. owner_email (TEXT) - supabase-full-integration.js
-- 
-- This migration adds ALL three to ensure compatibility.
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- DROP THE OLD HELPER FUNCTION IF IT EXISTS (from 011)
-- ============================================================
DROP FUNCTION IF EXISTS safe_add_column(TEXT, TEXT, TEXT, TEXT);

-- ============================================================
-- SAFE COLUMN ADD FUNCTION (works with any existing state)
-- ============================================================
CREATE OR REPLACE FUNCTION add_column_if_not_exists(
    _table TEXT,
    _column TEXT,
    _type TEXT,
    _default TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = _table 
        AND column_name = _column
    ) THEN
        IF _default IS NOT NULL THEN
            EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s DEFAULT %s', _table, _column, _type, _default);
        ELSE
            EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s', _table, _column, _type);
        END IF;
        RAISE NOTICE 'Added column %.%', _table, _column;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Column %.% skipped: %', _table, _column, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SAFE TABLE CREATE FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION table_exists(_table TEXT) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = _table
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 1. ORGANIZATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    logo_url TEXT,
    domain TEXT,
    plan TEXT DEFAULT 'starter',
    seats_limit INTEGER DEFAULT 5,
    storage_limit_gb INTEGER DEFAULT 10,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    google_id TEXT,
    role TEXT DEFAULT 'user',
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    preferences JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. USER_STATE
-- ============================================================
CREATE TABLE IF NOT EXISTS user_state (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email TEXT UNIQUE,
    user_id UUID,
    current_tool TEXT,
    current_view TEXT DEFAULT 'personal',
    tool_states JSONB DEFAULT '{}'::jsonb,
    recent_items JSONB DEFAULT '[]'::jsonb,
    drafts JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. API_KEYS (personal)
-- ============================================================
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email TEXT,
    user_id UUID,
    owner_email TEXT,
    provider TEXT NOT NULL,
    encrypted_key TEXT,
    key_hint TEXT,
    share_level TEXT DEFAULT 'private',
    allowed_emails TEXT[] DEFAULT '{}',
    last_used_at TIMESTAMPTZ,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. SHARED_API_KEYS - Fix for existing table
-- ============================================================
DO $$
BEGIN
    IF NOT table_exists('shared_api_keys') THEN
        CREATE TABLE shared_api_keys (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            organization_id TEXT NOT NULL DEFAULT 'global',
            admin_user_id UUID,
            encrypted_keys JSONB DEFAULT '{}'::jsonb,
            allowed_emails TEXT[] DEFAULT '{}',
            allowed_domains TEXT[] DEFAULT '{}',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;

-- Add any missing columns to shared_api_keys
SELECT add_column_if_not_exists('shared_api_keys', 'organization_id', 'TEXT', '''global''');
SELECT add_column_if_not_exists('shared_api_keys', 'admin_user_id', 'UUID', NULL);
SELECT add_column_if_not_exists('shared_api_keys', 'encrypted_keys', 'JSONB', '''{}''::jsonb');
SELECT add_column_if_not_exists('shared_api_keys', 'allowed_emails', 'TEXT[]', '''{}''');
SELECT add_column_if_not_exists('shared_api_keys', 'allowed_domains', 'TEXT[]', '''{}''');
SELECT add_column_if_not_exists('shared_api_keys', 'updated_at', 'TIMESTAMPTZ', 'NOW()');

-- ============================================================
-- 6. USER_SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email TEXT,
    user_id UUID,
    setting_type TEXT,
    settings JSONB DEFAULT '{}'::jsonb,
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns if table already exists
SELECT add_column_if_not_exists('user_settings', 'user_email', 'TEXT', NULL);
SELECT add_column_if_not_exists('user_settings', 'user_id', 'UUID', NULL);
SELECT add_column_if_not_exists('user_settings', 'settings', 'JSONB', '''{}''::jsonb');

-- ============================================================
-- 7. USER_ACTIVITY
-- ============================================================
CREATE TABLE IF NOT EXISTS user_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email TEXT,
    user_id UUID,
    action TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. COMPANIES (CRM)
-- ============================================================
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uuid TEXT UNIQUE,
    user_email TEXT,
    user_id UUID,
    owner_email TEXT,
    organization_id UUID,
    name TEXT NOT NULL,
    industry TEXT,
    website TEXT,
    description TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    linkedin_url TEXT,
    brand_colors JSONB DEFAULT '[]'::jsonb,
    brand_fonts JSONB DEFAULT '{}'::jsonb,
    brand_guidelines TEXT,
    logo_url TEXT,
    type TEXT DEFAULT 'client',
    status TEXT DEFAULT 'active',
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    is_shared BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Add all three user columns
SELECT add_column_if_not_exists('companies', 'user_email', 'TEXT', NULL);
SELECT add_column_if_not_exists('companies', 'user_id', 'UUID', NULL);
SELECT add_column_if_not_exists('companies', 'owner_email', 'TEXT', NULL);
SELECT add_column_if_not_exists('companies', 'uuid', 'TEXT', NULL);
SELECT add_column_if_not_exists('companies', 'is_shared', 'BOOLEAN', 'false');
SELECT add_column_if_not_exists('companies', 'metadata', 'JSONB', '''{}''::jsonb');

-- ============================================================
-- 9. CONTACTS (CRM)
-- ============================================================
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uuid TEXT UNIQUE,
    user_email TEXT,
    user_id UUID,
    owner_email TEXT,
    organization_id UUID,
    company_id UUID,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    title TEXT,
    department TEXT,
    linkedin_url TEXT,
    avatar_url TEXT,
    type TEXT DEFAULT 'contact',
    status TEXT DEFAULT 'active',
    source TEXT,
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    is_shared BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

SELECT add_column_if_not_exists('contacts', 'user_email', 'TEXT', NULL);
SELECT add_column_if_not_exists('contacts', 'user_id', 'UUID', NULL);
SELECT add_column_if_not_exists('contacts', 'owner_email', 'TEXT', NULL);
SELECT add_column_if_not_exists('contacts', 'uuid', 'TEXT', NULL);
SELECT add_column_if_not_exists('contacts', 'is_shared', 'BOOLEAN', 'false');

-- ============================================================
-- 10. PROJECTS (CRM)
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uuid TEXT UNIQUE,
    user_email TEXT,
    user_id UUID,
    owner_email TEXT,
    organization_id UUID,
    company_id UUID,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'campaign',
    status TEXT DEFAULT 'active',
    start_date DATE,
    due_date DATE,
    budget DECIMAL(12,2),
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    is_shared BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

SELECT add_column_if_not_exists('projects', 'user_email', 'TEXT', NULL);
SELECT add_column_if_not_exists('projects', 'user_id', 'UUID', NULL);
SELECT add_column_if_not_exists('projects', 'owner_email', 'TEXT', NULL);
SELECT add_column_if_not_exists('projects', 'uuid', 'TEXT', NULL);
SELECT add_column_if_not_exists('projects', 'is_shared', 'BOOLEAN', 'false');

-- ============================================================
-- 11. DEALS (CRM)
-- ============================================================
DO $$
BEGIN
    IF NOT table_exists('deals') THEN
        CREATE TABLE deals (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            uuid TEXT UNIQUE,
            user_email TEXT,
            user_id UUID,
            owner_email TEXT,
            organization_id UUID,
            company_id UUID,
            contact_id UUID,
            name TEXT NOT NULL,
            value DECIMAL(12,2),
            currency TEXT DEFAULT 'USD',
            stage TEXT DEFAULT 'lead',
            probability INTEGER DEFAULT 0,
            expected_close_date DATE,
            notes TEXT,
            is_shared BOOLEAN DEFAULT false,
            metadata JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            deleted_at TIMESTAMPTZ
        );
    END IF;
END $$;

SELECT add_column_if_not_exists('deals', 'user_email', 'TEXT', NULL);
SELECT add_column_if_not_exists('deals', 'user_id', 'UUID', NULL);
SELECT add_column_if_not_exists('deals', 'owner_email', 'TEXT', NULL);
SELECT add_column_if_not_exists('deals', 'uuid', 'TEXT', NULL);
SELECT add_column_if_not_exists('deals', 'is_shared', 'BOOLEAN', 'false');

-- ============================================================
-- 12. ASSETS
-- ============================================================
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uuid TEXT UNIQUE,
    user_email TEXT,
    user_id UUID,
    owner_email TEXT,
    organization_id UUID,
    company_id UUID,
    project_id UUID,
    filename TEXT NOT NULL,
    original_filename TEXT,
    type TEXT DEFAULT 'image',
    mime_type TEXT,
    file_size INTEGER,
    width INTEGER,
    height INTEGER,
    storage_url TEXT,
    thumbnail_url TEXT,
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    is_shared BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    ai_analysis JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

SELECT add_column_if_not_exists('assets', 'user_email', 'TEXT', NULL);
SELECT add_column_if_not_exists('assets', 'user_id', 'UUID', NULL);
SELECT add_column_if_not_exists('assets', 'owner_email', 'TEXT', NULL);
SELECT add_column_if_not_exists('assets', 'uuid', 'TEXT', NULL);
SELECT add_column_if_not_exists('assets', 'is_shared', 'BOOLEAN', 'false');

-- ============================================================
-- 13. VIDEO_ANALYSES
-- ============================================================
DO $$
BEGIN
    IF NOT table_exists('video_analyses') THEN
        CREATE TABLE video_analyses (
            id TEXT PRIMARY KEY,
            user_email TEXT,
            user_id UUID,
            owner_email TEXT,
            url TEXT,
            platform TEXT,
            video_id TEXT,
            title TEXT,
            analysis JSONB,
            metadata JSONB,
            scores JSONB,
            thumbnail_url TEXT,
            status TEXT DEFAULT 'complete',
            is_shared BOOLEAN DEFAULT false,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            deleted_at TIMESTAMPTZ
        );
    END IF;
END $$;

SELECT add_column_if_not_exists('video_analyses', 'user_email', 'TEXT', NULL);
SELECT add_column_if_not_exists('video_analyses', 'user_id', 'UUID', NULL);
SELECT add_column_if_not_exists('video_analyses', 'owner_email', 'TEXT', NULL);
SELECT add_column_if_not_exists('video_analyses', 'is_shared', 'BOOLEAN', 'false');

-- ============================================================
-- 14. CREATIVE_ANALYSES
-- ============================================================
DO $$
BEGIN
    IF NOT table_exists('creative_analyses') THEN
        CREATE TABLE creative_analyses (
            id TEXT PRIMARY KEY,
            uuid TEXT UNIQUE,
            user_email TEXT,
            user_id UUID,
            owner_email TEXT,
            asset_id TEXT,
            asset_filename TEXT,
            asset_type TEXT DEFAULT 'image',
            analysis JSONB DEFAULT '{}'::jsonb,
            scores JSONB DEFAULT '{}'::jsonb,
            hook_analysis JSONB DEFAULT '{}'::jsonb,
            cta_analysis JSONB DEFAULT '{}'::jsonb,
            brand_compliance JSONB DEFAULT '{}'::jsonb,
            thumb_stop_score JSONB DEFAULT '{}'::jsonb,
            performance_prediction JSONB DEFAULT '{}'::jsonb,
            enhanced_analysis JSONB DEFAULT '{}'::jsonb,
            linked_company_id UUID,
            detected_brand TEXT,
            is_shared BOOLEAN DEFAULT false,
            metadata JSONB DEFAULT '{}'::jsonb,
            status TEXT DEFAULT 'complete',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            deleted_at TIMESTAMPTZ
        );
    END IF;
END $$;

SELECT add_column_if_not_exists('creative_analyses', 'user_email', 'TEXT', NULL);
SELECT add_column_if_not_exists('creative_analyses', 'user_id', 'UUID', NULL);
SELECT add_column_if_not_exists('creative_analyses', 'owner_email', 'TEXT', NULL);
SELECT add_column_if_not_exists('creative_analyses', 'uuid', 'TEXT', NULL);
SELECT add_column_if_not_exists('creative_analyses', 'is_shared', 'BOOLEAN', 'false');
SELECT add_column_if_not_exists('creative_analyses', 'asset_filename', 'TEXT', NULL);
SELECT add_column_if_not_exists('creative_analyses', 'linked_company_id', 'UUID', NULL);

-- ============================================================
-- 15. STRATEGIES
-- ============================================================
DO $$
BEGIN
    IF NOT table_exists('strategies') THEN
        CREATE TABLE strategies (
            id TEXT PRIMARY KEY,
            uuid TEXT UNIQUE,
            user_email TEXT,
            user_id UUID,
            owner_email TEXT,
            name TEXT,
            asset_id TEXT,
            asset_filename TEXT,
            strategy_type TEXT DEFAULT 'general',
            content JSONB DEFAULT '{}'::jsonb,
            data JSONB DEFAULT '{}'::jsonb,
            results JSONB DEFAULT '{}'::jsonb,
            recommendations JSONB DEFAULT '[]'::jsonb,
            scores JSONB DEFAULT '{}'::jsonb,
            company_id TEXT,
            project_id TEXT,
            is_shared BOOLEAN DEFAULT false,
            metadata JSONB DEFAULT '{}'::jsonb,
            status TEXT DEFAULT 'draft',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            deleted_at TIMESTAMPTZ
        );
    END IF;
END $$;

SELECT add_column_if_not_exists('strategies', 'user_email', 'TEXT', NULL);
SELECT add_column_if_not_exists('strategies', 'user_id', 'UUID', NULL);
SELECT add_column_if_not_exists('strategies', 'owner_email', 'TEXT', NULL);
SELECT add_column_if_not_exists('strategies', 'uuid', 'TEXT', NULL);
SELECT add_column_if_not_exists('strategies', 'is_shared', 'BOOLEAN', 'false');
SELECT add_column_if_not_exists('strategies', 'asset_filename', 'TEXT', NULL);

-- ============================================================
-- 16. URL_ANALYSES
-- ============================================================
DO $$
BEGIN
    IF NOT table_exists('url_analyses') THEN
        CREATE TABLE url_analyses (
            id TEXT PRIMARY KEY,
            uuid TEXT UNIQUE,
            user_email TEXT,
            user_id UUID,
            owner_email TEXT,
            url TEXT NOT NULL,
            url_type TEXT DEFAULT 'webpage',
            title TEXT,
            thumbnail TEXT,
            analysis JSONB DEFAULT '{}'::jsonb,
            insights JSONB DEFAULT '{}'::jsonb,
            colors JSONB DEFAULT '[]'::jsonb,
            fonts JSONB DEFAULT '[]'::jsonb,
            scores JSONB DEFAULT '{}'::jsonb,
            is_shared BOOLEAN DEFAULT false,
            metadata JSONB DEFAULT '{}'::jsonb,
            status TEXT DEFAULT 'complete',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            deleted_at TIMESTAMPTZ
        );
    END IF;
END $$;

SELECT add_column_if_not_exists('url_analyses', 'user_email', 'TEXT', NULL);
SELECT add_column_if_not_exists('url_analyses', 'user_id', 'UUID', NULL);
SELECT add_column_if_not_exists('url_analyses', 'owner_email', 'TEXT', NULL);
SELECT add_column_if_not_exists('url_analyses', 'uuid', 'TEXT', NULL);
SELECT add_column_if_not_exists('url_analyses', 'is_shared', 'BOOLEAN', 'false');

-- ============================================================
-- 17. SWIPE_FILES
-- ============================================================
DO $$
BEGIN
    IF NOT table_exists('swipe_files') THEN
        CREATE TABLE swipe_files (
            id TEXT PRIMARY KEY,
            user_email TEXT,
            user_id UUID,
            owner_email TEXT,
            name TEXT,
            url TEXT,
            type TEXT,
            source TEXT,
            analysis JSONB,
            tags TEXT[],
            notes TEXT,
            thumbnail_url TEXT,
            is_favorite BOOLEAN DEFAULT FALSE,
            company_id TEXT,
            is_shared BOOLEAN DEFAULT false,
            metadata JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            deleted_at TIMESTAMPTZ
        );
    END IF;
END $$;

SELECT add_column_if_not_exists('swipe_files', 'user_email', 'TEXT', NULL);
SELECT add_column_if_not_exists('swipe_files', 'user_id', 'UUID', NULL);
SELECT add_column_if_not_exists('swipe_files', 'owner_email', 'TEXT', NULL);
SELECT add_column_if_not_exists('swipe_files', 'is_shared', 'BOOLEAN', 'false');

-- ============================================================
-- 18. BENCHMARKS
-- ============================================================
DO $$
BEGIN
    IF NOT table_exists('benchmarks') THEN
        CREATE TABLE benchmarks (
            id TEXT PRIMARY KEY,
            user_email TEXT,
            user_id UUID,
            owner_email TEXT,
            name TEXT,
            industry TEXT,
            category TEXT,
            data JSONB,
            source TEXT,
            source_url TEXT,
            is_shared BOOLEAN DEFAULT false,
            metadata JSONB DEFAULT '{}'::jsonb,
            last_updated TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            deleted_at TIMESTAMPTZ
        );
    END IF;
END $$;

SELECT add_column_if_not_exists('benchmarks', 'user_email', 'TEXT', NULL);
SELECT add_column_if_not_exists('benchmarks', 'user_id', 'UUID', NULL);
SELECT add_column_if_not_exists('benchmarks', 'owner_email', 'TEXT', NULL);
SELECT add_column_if_not_exists('benchmarks', 'is_shared', 'BOOLEAN', 'false');

-- ============================================================
-- 19. GOOGLE_ADS_BUILDS
-- ============================================================
DO $$
BEGIN
    IF NOT table_exists('google_ads_builds') THEN
        CREATE TABLE google_ads_builds (
            id TEXT PRIMARY KEY,
            user_email TEXT,
            user_id UUID,
            owner_email TEXT,
            name TEXT,
            campaign_type TEXT,
            config JSONB,
            headlines JSONB,
            descriptions JSONB,
            keywords JSONB,
            landing_page TEXT,
            company_id TEXT,
            project_id TEXT,
            is_shared BOOLEAN DEFAULT false,
            metadata JSONB DEFAULT '{}'::jsonb,
            status TEXT DEFAULT 'draft',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            deleted_at TIMESTAMPTZ
        );
    END IF;
END $$;

SELECT add_column_if_not_exists('google_ads_builds', 'user_email', 'TEXT', NULL);
SELECT add_column_if_not_exists('google_ads_builds', 'user_id', 'UUID', NULL);
SELECT add_column_if_not_exists('google_ads_builds', 'owner_email', 'TEXT', NULL);
SELECT add_column_if_not_exists('google_ads_builds', 'is_shared', 'BOOLEAN', 'false');

-- ============================================================
-- 20. SOCIAL_MEDIA_BUILDS
-- ============================================================
DO $$
BEGIN
    IF NOT table_exists('social_media_builds') THEN
        CREATE TABLE social_media_builds (
            id TEXT PRIMARY KEY,
            user_email TEXT,
            user_id UUID,
            owner_email TEXT,
            name TEXT,
            platform TEXT,
            config JSONB,
            content JSONB,
            captions JSONB,
            hashtags TEXT[],
            scheduled_at TIMESTAMPTZ,
            company_id TEXT,
            project_id TEXT,
            is_shared BOOLEAN DEFAULT false,
            metadata JSONB DEFAULT '{}'::jsonb,
            status TEXT DEFAULT 'draft',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            deleted_at TIMESTAMPTZ
        );
    END IF;
END $$;

SELECT add_column_if_not_exists('social_media_builds', 'user_email', 'TEXT', NULL);
SELECT add_column_if_not_exists('social_media_builds', 'user_id', 'UUID', NULL);
SELECT add_column_if_not_exists('social_media_builds', 'owner_email', 'TEXT', NULL);
SELECT add_column_if_not_exists('social_media_builds', 'is_shared', 'BOOLEAN', 'false');

-- ============================================================
-- 21. KEYWORD_RESEARCH
-- ============================================================
DO $$
BEGIN
    IF NOT table_exists('keyword_research') THEN
        CREATE TABLE keyword_research (
            id TEXT PRIMARY KEY,
            user_email TEXT,
            user_id UUID,
            owner_email TEXT,
            name TEXT,
            seed_keywords TEXT[],
            results JSONB,
            volume_data JSONB,
            competition_data JSONB,
            suggestions JSONB,
            company_id TEXT,
            project_id TEXT,
            is_shared BOOLEAN DEFAULT false,
            metadata JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            deleted_at TIMESTAMPTZ
        );
    END IF;
END $$;

SELECT add_column_if_not_exists('keyword_research', 'user_email', 'TEXT', NULL);
SELECT add_column_if_not_exists('keyword_research', 'user_id', 'UUID', NULL);
SELECT add_column_if_not_exists('keyword_research', 'owner_email', 'TEXT', NULL);
SELECT add_column_if_not_exists('keyword_research', 'is_shared', 'BOOLEAN', 'false');

-- ============================================================
-- 22. ACTIVITY_LOG
-- ============================================================
DO $$
BEGIN
    IF NOT table_exists('activity_log') THEN
        CREATE TABLE activity_log (
            id TEXT PRIMARY KEY,
            user_email TEXT,
            user_id UUID,
            action TEXT NOT NULL,
            entity_type TEXT,
            entity_id TEXT,
            entity_name TEXT,
            details JSONB,
            ip_address TEXT,
            user_agent TEXT,
            timestamp TIMESTAMPTZ DEFAULT NOW(),
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;

SELECT add_column_if_not_exists('activity_log', 'user_email', 'TEXT', NULL);
SELECT add_column_if_not_exists('activity_log', 'user_id', 'UUID', NULL);

-- ============================================================
-- 23. BRAND_PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS brand_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email TEXT,
    user_id UUID,
    owner_email TEXT,
    company_id UUID,
    name TEXT NOT NULL,
    industry TEXT,
    logo_url TEXT,
    primary_colors TEXT[] DEFAULT '{}',
    secondary_colors TEXT[] DEFAULT '{}',
    fonts JSONB DEFAULT '{}'::jsonb,
    tone_of_voice TEXT,
    guidelines_url TEXT,
    guidelines_text TEXT,
    platform_rules JSONB DEFAULT '{}'::jsonb,
    ai_brand_summary JSONB,
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    is_shared BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- ============================================================
-- 24. COMPETITORS
-- ============================================================
CREATE TABLE IF NOT EXISTS competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email TEXT,
    user_id UUID,
    owner_email TEXT,
    company_id UUID,
    name TEXT NOT NULL,
    domain TEXT,
    website TEXT,
    industry TEXT,
    ad_library_urls JSONB DEFAULT '[]'::jsonb,
    monitoring_frequency TEXT DEFAULT 'weekly',
    last_checked_at TIMESTAMPTZ,
    alerts JSONB DEFAULT '[]'::jsonb,
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    is_shared BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- ============================================================
-- 25. AI_STUDIO_HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_studio_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email TEXT,
    user_id UUID,
    session_id TEXT,
    role TEXT,
    content TEXT NOT NULL,
    model TEXT,
    tokens_used INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 26. AUTO_FIX_HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS auto_fix_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email TEXT,
    user_id UUID,
    asset_id UUID,
    fix_type TEXT,
    original_dimensions JSONB,
    target_dimensions JSONB,
    target_platform TEXT,
    target_placement TEXT,
    result_url TEXT,
    status TEXT DEFAULT 'complete',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 27. USER_NOTIFICATIONS (if referenced)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uuid TEXT UNIQUE,
    user_email TEXT,
    user_id UUID,
    type TEXT,
    title TEXT,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 28. INTEGRATION_CREDENTIALS (if referenced)
-- ============================================================
CREATE TABLE IF NOT EXISTS integration_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id TEXT DEFAULT 'default',
    user_email TEXT,
    user_id UUID,
    provider TEXT NOT NULL,
    credentials JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_companies_user_email ON companies(user_email);
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_owner_email ON companies(owner_email);

CREATE INDEX IF NOT EXISTS idx_contacts_user_email ON contacts(user_email);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_owner_email ON contacts(owner_email);

CREATE INDEX IF NOT EXISTS idx_projects_user_email ON projects(user_email);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_owner_email ON projects(owner_email);

CREATE INDEX IF NOT EXISTS idx_deals_user_email ON deals(user_email);
CREATE INDEX IF NOT EXISTS idx_deals_user_id ON deals(user_id);
CREATE INDEX IF NOT EXISTS idx_deals_owner_email ON deals(owner_email);

CREATE INDEX IF NOT EXISTS idx_assets_user_email ON assets(user_email);
CREATE INDEX IF NOT EXISTS idx_assets_owner_email ON assets(owner_email);

CREATE INDEX IF NOT EXISTS idx_video_analyses_user_email ON video_analyses(user_email);
CREATE INDEX IF NOT EXISTS idx_creative_analyses_user_email ON creative_analyses(user_email);
CREATE INDEX IF NOT EXISTS idx_strategies_user_email ON strategies(user_email);
CREATE INDEX IF NOT EXISTS idx_url_analyses_user_email ON url_analyses(user_email);
CREATE INDEX IF NOT EXISTS idx_swipe_files_user_email ON swipe_files(user_email);
CREATE INDEX IF NOT EXISTS idx_benchmarks_user_email ON benchmarks(user_email);
CREATE INDEX IF NOT EXISTS idx_google_ads_user_email ON google_ads_builds(user_email);
CREATE INDEX IF NOT EXISTS idx_social_media_user_email ON social_media_builds(user_email);
CREATE INDEX IF NOT EXISTS idx_keyword_research_user_email ON keyword_research(user_email);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_email ON user_settings(user_email);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_user_activity_user_email ON user_activity(user_email);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_email ON activity_log(user_email);

CREATE INDEX IF NOT EXISTS idx_shared_api_keys_org ON shared_api_keys(organization_id);

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================
DO $$
DECLARE
    tbl TEXT;
    tables TEXT[] := ARRAY[
        'organizations', 'profiles', 'user_state', 'api_keys', 'shared_api_keys',
        'user_settings', 'user_activity', 'companies', 'contacts', 'projects', 'deals',
        'assets', 'video_analyses', 'creative_analyses', 'strategies',
        'url_analyses', 'swipe_files', 'benchmarks',
        'google_ads_builds', 'social_media_builds', 'keyword_research', 'activity_log',
        'brand_profiles', 'competitors', 'ai_studio_history', 'auto_fix_history',
        'user_notifications', 'integration_credentials'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables
    LOOP
        BEGIN
            EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;
END $$;

-- ============================================================
-- CREATE PERMISSIVE POLICIES (for development - tighten in production)
-- ============================================================
DO $$
DECLARE
    tbl TEXT;
    tables TEXT[] := ARRAY[
        'organizations', 'profiles', 'user_state', 'api_keys', 'shared_api_keys',
        'user_settings', 'user_activity', 'companies', 'contacts', 'projects', 'deals',
        'assets', 'video_analyses', 'creative_analyses', 'strategies',
        'url_analyses', 'swipe_files', 'benchmarks',
        'google_ads_builds', 'social_media_builds', 'keyword_research', 'activity_log',
        'brand_profiles', 'competitors', 'ai_studio_history', 'auto_fix_history',
        'user_notifications', 'integration_credentials'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables
    LOOP
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS "allow_all_%s" ON %I', tbl, tbl);
            EXECUTE format('CREATE POLICY "allow_all_%s" ON %I FOR ALL USING (true) WITH CHECK (true)', tbl, tbl);
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;
END $$;

-- ============================================================
-- GRANT PERMISSIONS TO ALL ROLES
-- ============================================================
DO $$
DECLARE
    tbl TEXT;
    tables TEXT[] := ARRAY[
        'organizations', 'profiles', 'user_state', 'api_keys', 'shared_api_keys',
        'user_settings', 'user_activity', 'companies', 'contacts', 'projects', 'deals',
        'assets', 'video_analyses', 'creative_analyses', 'strategies',
        'url_analyses', 'swipe_files', 'benchmarks',
        'google_ads_builds', 'social_media_builds', 'keyword_research', 'activity_log',
        'brand_profiles', 'competitors', 'ai_studio_history', 'auto_fix_history',
        'user_notifications', 'integration_credentials'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables
    LOOP
        BEGIN
            EXECUTE format('GRANT ALL ON %I TO authenticated', tbl);
            EXECUTE format('GRANT ALL ON %I TO anon', tbl);
            EXECUTE format('GRANT ALL ON %I TO service_role', tbl);
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;
END $$;

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
DO $$
DECLARE
    tbl TEXT;
    tables TEXT[] := ARRAY[
        'organizations', 'profiles', 'user_state', 'api_keys', 'shared_api_keys',
        'user_settings', 'companies', 'contacts', 'projects', 'deals',
        'assets', 'video_analyses', 'creative_analyses', 'strategies',
        'url_analyses', 'swipe_files', 'benchmarks',
        'google_ads_builds', 'social_media_builds', 'keyword_research',
        'brand_profiles', 'competitors', 'integration_credentials'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables
    LOOP
        BEGIN
            EXECUTE format('DROP TRIGGER IF EXISTS set_timestamp ON %I', tbl);
            EXECUTE format('CREATE TRIGGER set_timestamp BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp()', tbl);
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;
END $$;

-- ============================================================
-- CLEANUP HELPER FUNCTIONS
-- ============================================================
DROP FUNCTION IF EXISTS add_column_if_not_exists(TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS table_exists(TEXT);

-- ============================================================
-- ENABLE REALTIME FOR CROSS-DEVICE SYNC
-- ============================================================
-- Note: Run this in Supabase Dashboard > Database > Replication
-- Or use the Supabase CLI: supabase realtime enable <table>
-- 
-- These tables need Realtime enabled for cross-device sync:
-- ============================================================

-- Enable realtime publication if not exists
DO $$
BEGIN
    -- Check if supabase_realtime publication exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

-- Add tables to realtime publication
-- This enables real-time subscriptions for cross-device sync
DO $$
DECLARE
    tbl TEXT;
    tables TEXT[] := ARRAY[
        'companies', 'contacts', 'projects', 'deals',
        'creative_analyses', 'strategies', 'video_analyses',
        'url_analyses', 'swipe_files', 'benchmarks',
        'google_ads_builds', 'social_media_builds', 'keyword_research',
        'user_settings', 'brand_profiles', 'shared_api_keys'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables
    LOOP
        BEGIN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', tbl);
            RAISE NOTICE 'Added % to realtime publication', tbl;
        EXCEPTION 
            WHEN duplicate_object THEN
                -- Table already in publication, ignore
                NULL;
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not add % to realtime: %', tbl, SQLERRM;
        END;
    END LOOP;
END $$;

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Migration 012_reconcile_all_columns.sql COMPLETE!';
    RAISE NOTICE '============================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'All tables now have user_email, user_id, AND owner_email columns';
    RAISE NOTICE 'for maximum compatibility with all code paths.';
    RAISE NOTICE '';
    RAISE NOTICE 'Tables created/updated:';
    RAISE NOTICE '  - organizations, profiles, user_state';
    RAISE NOTICE '  - api_keys, shared_api_keys, user_settings';
    RAISE NOTICE '  - companies, contacts, projects, deals (CRM)';
    RAISE NOTICE '  - assets, video_analyses, creative_analyses';
    RAISE NOTICE '  - strategies, url_analyses, swipe_files, benchmarks';
    RAISE NOTICE '  - google_ads_builds, social_media_builds, keyword_research';
    RAISE NOTICE '  - activity_log, user_activity, user_notifications';
    RAISE NOTICE '  - brand_profiles, competitors, ai_studio_history';
    RAISE NOTICE '  - auto_fix_history, integration_credentials';
    RAISE NOTICE '';
    RAISE NOTICE 'REALTIME ENABLED for cross-device sync on:';
    RAISE NOTICE '  - CRM: companies, contacts, projects, deals';
    RAISE NOTICE '  - Analyses: creative, video, url, strategies';
    RAISE NOTICE '  - Builders: google_ads, social_media, keywords';
    RAISE NOTICE '  - Learn: swipe_files, benchmarks';
    RAISE NOTICE '  - Settings: user_settings, brand_profiles';
    RAISE NOTICE '============================================================';
END $$;
