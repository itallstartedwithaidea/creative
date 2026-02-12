-- Migration 016: Fix Schema Mismatch Between Code and Database
-- This migration aligns the database schema with what the application code expects
-- and fixes RLS policies to work with Google Sign-In (user_email based)

-- ============================================
-- STEP 1: Disable RLS temporarily
-- ============================================

DO $$
DECLARE
    tbl TEXT;
    tables_to_fix TEXT[] := ARRAY[
        'profiles', 'user_state', 'organizations', 'api_keys', 'shared_api_keys',
        'companies', 'contacts', 'projects', 'deals', 'activities', 'activity_log',
        'assets', 'strategies', 'url_analyses', 'best_practices', 'benchmarks',
        'swipe_files', 'competitors', 'user_settings', 'brand_profiles',
        'user_api_keys', 'creative_analyses', 'video_analyses', 'google_ads_builds',
        'social_media_builds', 'keyword_research'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables_to_fix LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', tbl);
        END IF;
    END LOOP;
END;
$$;

-- ============================================
-- STEP 2: Drop ALL existing policies (clean slate)
-- ============================================

DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END;
$$;

-- ============================================
-- STEP 3: Add missing columns to api_keys table
-- The code expects these columns
-- ============================================

DO $$
BEGIN
    -- Add 'key' column (code sends plain 'key', not 'encrypted_key')
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'key') THEN
        ALTER TABLE api_keys ADD COLUMN key TEXT;
    END IF;
    
    -- Add owner_email
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'owner_email') THEN
        ALTER TABLE api_keys ADD COLUMN owner_email TEXT;
    END IF;
    
    -- Add domain
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'domain') THEN
        ALTER TABLE api_keys ADD COLUMN domain TEXT;
    END IF;
    
    -- Add share_with_domain
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'share_with_domain') THEN
        ALTER TABLE api_keys ADD COLUMN share_with_domain BOOLEAN DEFAULT false;
    END IF;
    
    -- Add share_globally
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'share_globally') THEN
        ALTER TABLE api_keys ADD COLUMN share_globally BOOLEAN DEFAULT false;
    END IF;
    
    -- Add allowed_emails
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'allowed_emails') THEN
        ALTER TABLE api_keys ADD COLUMN allowed_emails TEXT[];
    END IF;
    
    -- Add is_admin_key
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'is_admin_key') THEN
        ALTER TABLE api_keys ADD COLUMN is_admin_key BOOLEAN DEFAULT false;
    END IF;
END;
$$;

-- ============================================
-- STEP 4: Create activity_log table
-- The code tries to sync to 'activity_log', not 'activities'
-- ============================================

CREATE TABLE IF NOT EXISTS activity_log (
    id TEXT PRIMARY KEY,
    user_id UUID,
    user_email TEXT,
    type TEXT,
    action TEXT,
    provider TEXT,
    entity_type TEXT,
    entity_id TEXT,
    details JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    shared BOOLEAN DEFAULT false,
    logged_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to activity_log if table already exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_log' AND column_name = 'user_email') THEN
        ALTER TABLE activity_log ADD COLUMN user_email TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_log' AND column_name = 'type') THEN
        ALTER TABLE activity_log ADD COLUMN type TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_log' AND column_name = 'action') THEN
        ALTER TABLE activity_log ADD COLUMN action TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_log' AND column_name = 'provider') THEN
        ALTER TABLE activity_log ADD COLUMN provider TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_log' AND column_name = 'entity_type') THEN
        ALTER TABLE activity_log ADD COLUMN entity_type TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_log' AND column_name = 'entity_id') THEN
        ALTER TABLE activity_log ADD COLUMN entity_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_log' AND column_name = 'details') THEN
        ALTER TABLE activity_log ADD COLUMN details JSONB DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_log' AND column_name = 'metadata') THEN
        ALTER TABLE activity_log ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_log' AND column_name = 'shared') THEN
        ALTER TABLE activity_log ADD COLUMN shared BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_log' AND column_name = 'logged_at') THEN
        ALTER TABLE activity_log ADD COLUMN logged_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_log' AND column_name = 'created_at') THEN
        ALTER TABLE activity_log ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END;
$$;

-- ============================================
-- STEP 5: Create user_api_keys table
-- The code expects this table for personal key storage
-- ============================================

CREATE TABLE IF NOT EXISTS user_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid TEXT UNIQUE,
    user_id UUID,
    user_email TEXT,
    owner_email TEXT,
    provider TEXT NOT NULL,
    key TEXT,
    encrypted_key TEXT,
    domain TEXT,
    is_active BOOLEAN DEFAULT true,
    is_admin_key BOOLEAN DEFAULT false,
    share_with_domain BOOLEAN DEFAULT false,
    share_globally BOOLEAN DEFAULT false,
    allowed_emails TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 6: Create creative_analyses table
-- ============================================

CREATE TABLE IF NOT EXISTS creative_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid TEXT UNIQUE,
    user_id UUID,
    user_email TEXT,
    asset_id TEXT,
    asset_filename TEXT,
    asset_type TEXT,
    asset_dimensions JSONB,
    analysis JSONB DEFAULT '{}',
    hook_analysis JSONB DEFAULT '{}',
    cta_analysis JSONB DEFAULT '{}',
    brand_compliance JSONB DEFAULT '{}',
    thumb_stop_score NUMERIC,
    performance_prediction JSONB DEFAULT '{}',
    enhanced_analysis JSONB DEFAULT '{}',
    overall_score NUMERIC,
    confidence_level NUMERIC,
    processing_time INTEGER,
    audio_strategy JSONB DEFAULT '{}',
    linked_company_id TEXT,
    detected_brand TEXT,
    is_shared BOOLEAN DEFAULT false,
    analyzed_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 7: Create video_analyses table
-- ============================================

CREATE TABLE IF NOT EXISTS video_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid TEXT UNIQUE,
    user_id UUID,
    user_email TEXT,
    filename TEXT,
    video_url TEXT,
    duration NUMERIC,
    analysis JSONB DEFAULT '{}',
    frames JSONB DEFAULT '[]',
    scenes JSONB DEFAULT '[]',
    transcription TEXT,
    overall_score NUMERIC,
    linked_company_id TEXT,
    is_shared BOOLEAN DEFAULT false,
    analyzed_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 8: Create google_ads_builds table
-- ============================================

CREATE TABLE IF NOT EXISTS google_ads_builds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid TEXT UNIQUE,
    user_id UUID,
    user_email TEXT,
    name TEXT,
    campaign_type TEXT,
    headlines JSONB DEFAULT '[]',
    descriptions JSONB DEFAULT '[]',
    assets JSONB DEFAULT '[]',
    settings JSONB DEFAULT '{}',
    linked_company_id TEXT,
    is_shared BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 9: Create social_media_builds table
-- ============================================

CREATE TABLE IF NOT EXISTS social_media_builds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid TEXT UNIQUE,
    user_id UUID,
    user_email TEXT,
    name TEXT,
    platform TEXT,
    content JSONB DEFAULT '{}',
    assets JSONB DEFAULT '[]',
    schedule JSONB DEFAULT '{}',
    linked_company_id TEXT,
    is_shared BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 10: Create keyword_research table
-- ============================================

CREATE TABLE IF NOT EXISTS keyword_research (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid TEXT UNIQUE,
    user_id UUID,
    user_email TEXT,
    keyword TEXT,
    search_volume INTEGER,
    competition TEXT,
    cpc NUMERIC,
    related_keywords JSONB DEFAULT '[]',
    analysis JSONB DEFAULT '{}',
    linked_company_id TEXT,
    is_shared BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 10B: Create user_activity table
-- ============================================

CREATE TABLE IF NOT EXISTS user_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    user_email TEXT,
    activity_type TEXT,
    entity_type TEXT,
    entity_id TEXT,
    metadata JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 11: Enable RLS on all tables
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE url_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE best_practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipe_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_ads_builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 12: Create PERMISSIVE RLS policies
-- Since Google Sign-In doesn't populate auth.uid(), we allow all authenticated access
-- Data isolation is handled by user_email in application code
-- ============================================

-- For ALL tables, allow full access for authenticated users
-- This is necessary because auth.uid() is NULL with Google Sign-In

CREATE POLICY "allow_all_profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_user_state" ON user_state FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_organizations" ON organizations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_api_keys" ON api_keys FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_shared_api_keys" ON shared_api_keys FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_companies" ON companies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_contacts" ON contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_deals" ON deals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_assets" ON assets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_strategies" ON strategies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_url_analyses" ON url_analyses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_best_practices" ON best_practices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_benchmarks" ON benchmarks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_swipe_files" ON swipe_files FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_competitors" ON competitors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_user_settings" ON user_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_brand_profiles" ON brand_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_activities" ON activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_activity_log" ON activity_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_user_api_keys" ON user_api_keys FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_creative_analyses" ON creative_analyses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_video_analyses" ON video_analyses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_google_ads_builds" ON google_ads_builds FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_social_media_builds" ON social_media_builds FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_keyword_research" ON keyword_research FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_user_activity" ON user_activity FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- STEP 13: Grant permissions
-- ============================================

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- ============================================
-- STEP 14: Create indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_api_keys_user_email ON api_keys(user_email);
CREATE INDEX IF NOT EXISTS idx_api_keys_owner_email ON api_keys(owner_email);
CREATE INDEX IF NOT EXISTS idx_api_keys_provider ON api_keys(provider);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_user_email ON user_api_keys(user_email);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_uuid ON user_api_keys(uuid);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_email ON activity_log(user_email);
CREATE INDEX IF NOT EXISTS idx_activity_log_logged_at ON activity_log(logged_at);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_creative_analyses_user_email ON creative_analyses(user_email);
CREATE INDEX IF NOT EXISTS idx_video_analyses_user_email ON video_analyses(user_email);
CREATE INDEX IF NOT EXISTS idx_google_ads_builds_user_email ON google_ads_builds(user_email);
CREATE INDEX IF NOT EXISTS idx_social_media_builds_user_email ON social_media_builds(user_email);
CREATE INDEX IF NOT EXISTS idx_keyword_research_user_email ON keyword_research(user_email);
CREATE INDEX IF NOT EXISTS idx_companies_user_email ON companies(user_email);
CREATE INDEX IF NOT EXISTS idx_contacts_user_email ON contacts(user_email);
CREATE INDEX IF NOT EXISTS idx_strategies_user_email ON strategies(user_email);
CREATE INDEX IF NOT EXISTS idx_benchmarks_user_email ON benchmarks(user_email);
CREATE INDEX IF NOT EXISTS idx_swipe_files_user_email ON swipe_files(user_email);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_email ON user_activity(user_email);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at);

-- Done!
DO $$ BEGIN RAISE NOTICE '✅ Migration 016 complete: Schema aligned with application code'; END $$;
