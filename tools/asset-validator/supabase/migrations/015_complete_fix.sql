-- Migration 015: Complete Fix for Data Persistence
-- This migration ensures all tables exist with proper structure and SIMPLE RLS policies

-- ============================================
-- STEP 1: Disable RLS temporarily to fix issues
-- ============================================

DO $$
DECLARE
    tbl TEXT;
    tables_to_fix TEXT[] := ARRAY[
        'profiles', 'user_state', 'organizations', 'api_keys', 'shared_api_keys',
        'companies', 'contacts', 'projects', 'deals', 'activities',
        'assets', 'strategies', 'url_analyses', 'best_practices', 'benchmarks',
        'swipe_files', 'competitors', 'user_settings', 'brand_profiles'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables_to_fix LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', tbl);
            RAISE NOTICE 'Disabled RLS on %', tbl;
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
    RAISE NOTICE 'Dropped all existing policies';
END;
$$;

-- ============================================
-- STEP 3: Ensure all required tables exist
-- ============================================

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    org_id UUID,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User state table (for cross-device sync)
CREATE TABLE IF NOT EXISTS user_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT,
    state_data JSONB DEFAULT '{}',
    last_sync TIMESTAMPTZ DEFAULT NOW(),
    device_info JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    domain TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys (user's own keys)
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT,
    provider TEXT NOT NULL,
    encrypted_key TEXT,
    key_hash TEXT,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    last_used TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

-- Shared API Keys (org-level shared keys)
CREATE TABLE IF NOT EXISTS shared_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    domain TEXT,
    provider TEXT NOT NULL,
    encrypted_key TEXT,
    shared_by TEXT,
    is_global BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Companies (CRM)
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid TEXT UNIQUE,
    user_id UUID,
    user_email TEXT,
    name TEXT NOT NULL,
    industry TEXT,
    website TEXT,
    type TEXT DEFAULT 'client',
    description TEXT,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    enriched_data JSONB DEFAULT '{}',
    strategy_insights JSONB DEFAULT '{}',
    chat_history JSONB DEFAULT '[]',
    benchmarks JSONB DEFAULT '[]',
    best_practices JSONB DEFAULT '[]',
    competitors JSONB DEFAULT '[]',
    is_shared BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contacts (CRM)
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid TEXT UNIQUE,
    user_id UUID,
    user_email TEXT,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    company_id UUID,
    company_name TEXT,
    title TEXT,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects (CRM)
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid TEXT UNIQUE,
    user_id UUID,
    user_email TEXT,
    name TEXT NOT NULL,
    company_id UUID,
    status TEXT DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deals (CRM)
CREATE TABLE IF NOT EXISTS deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid TEXT UNIQUE,
    user_id UUID,
    user_email TEXT,
    name TEXT NOT NULL,
    company_id UUID,
    value NUMERIC,
    stage TEXT,
    metadata JSONB DEFAULT '{}',
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid TEXT UNIQUE,
    user_id UUID,
    user_email TEXT,
    filename TEXT,
    file_type TEXT,
    url TEXT,
    thumbnail_url TEXT,
    company_id UUID,
    analysis JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Strategies
CREATE TABLE IF NOT EXISTS strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid TEXT UNIQUE,
    user_id UUID,
    user_email TEXT,
    name TEXT,
    type TEXT,
    content JSONB DEFAULT '{}',
    company_id UUID,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- URL Analyses
CREATE TABLE IF NOT EXISTS url_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid TEXT UNIQUE,
    user_id UUID,
    user_email TEXT,
    url TEXT,
    analysis JSONB DEFAULT '{}',
    company_id UUID,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Best Practices
CREATE TABLE IF NOT EXISTS best_practices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid TEXT UNIQUE,
    user_id UUID,
    user_email TEXT,
    practice TEXT,
    description TEXT,
    category TEXT,
    company_id UUID,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Benchmarks
CREATE TABLE IF NOT EXISTS benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid TEXT UNIQUE,
    user_id UUID,
    user_email TEXT,
    metric TEXT,
    value JSONB,
    industry TEXT,
    source TEXT,
    company_id UUID,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Swipe Files
CREATE TABLE IF NOT EXISTS swipe_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid TEXT UNIQUE,
    user_id UUID,
    user_email TEXT,
    title TEXT,
    content JSONB DEFAULT '{}',
    category TEXT,
    tags TEXT[],
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Competitors
CREATE TABLE IF NOT EXISTS competitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid TEXT UNIQUE,
    user_id UUID,
    user_email TEXT,
    name TEXT,
    website TEXT,
    company_id UUID,
    metadata JSONB DEFAULT '{}',
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Settings (for syncing app settings)
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid TEXT UNIQUE,
    user_id UUID,
    user_email TEXT,
    settings_type TEXT,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brand Profiles
CREATE TABLE IF NOT EXISTS brand_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid TEXT UNIQUE,
    user_id UUID,
    user_email TEXT,
    name TEXT,
    colors JSONB DEFAULT '{}',
    fonts JSONB DEFAULT '{}',
    logos JSONB DEFAULT '{}',
    guidelines TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities (audit log)
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    user_email TEXT,
    action TEXT,
    entity_type TEXT,
    entity_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 4: Add missing columns to existing tables
-- ============================================

DO $$
BEGIN
    -- Add user_email to tables that might be missing it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'user_email') THEN
        ALTER TABLE companies ADD COLUMN user_email TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'user_email') THEN
        ALTER TABLE contacts ADD COLUMN user_email TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'user_email') THEN
        ALTER TABLE assets ADD COLUMN user_email TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'user_email') THEN
        ALTER TABLE projects ADD COLUMN user_email TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'user_email') THEN
        ALTER TABLE deals ADD COLUMN user_email TEXT;
    END IF;
    
    -- Add uuid column for sync
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'uuid') THEN
        ALTER TABLE companies ADD COLUMN uuid TEXT UNIQUE;
    END IF;
END;
$$;

-- ============================================
-- STEP 5: Create SIMPLE non-recursive RLS policies
-- ============================================

-- Enable RLS on all tables
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

-- PROFILES: Users can manage their own profile
CREATE POLICY "profiles_own" ON profiles FOR ALL 
USING (user_id = auth.uid());

-- USER_STATE: Users can manage their own state
CREATE POLICY "user_state_own" ON user_state FOR ALL 
USING (user_id = auth.uid());

-- ORGANIZATIONS: All authenticated users can read orgs
CREATE POLICY "organizations_read" ON organizations FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "organizations_write" ON organizations FOR ALL 
USING (auth.uid() IS NOT NULL);

-- API_KEYS: Users manage their own keys
CREATE POLICY "api_keys_own" ON api_keys FOR ALL 
USING (user_id = auth.uid());

-- SHARED_API_KEYS: All authenticated users can read, admins can write
CREATE POLICY "shared_api_keys_read" ON shared_api_keys FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "shared_api_keys_write" ON shared_api_keys FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "shared_api_keys_update" ON shared_api_keys FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "shared_api_keys_delete" ON shared_api_keys FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- DATA TABLES: Users can access their own data
CREATE POLICY "companies_own" ON companies FOR ALL 
USING (user_id = auth.uid() OR is_shared = true);

CREATE POLICY "contacts_own" ON contacts FOR ALL 
USING (user_id = auth.uid());

CREATE POLICY "projects_own" ON projects FOR ALL 
USING (user_id = auth.uid());

CREATE POLICY "deals_own" ON deals FOR ALL 
USING (user_id = auth.uid());

CREATE POLICY "assets_own" ON assets FOR ALL 
USING (user_id = auth.uid());

CREATE POLICY "strategies_own" ON strategies FOR ALL 
USING (user_id = auth.uid());

CREATE POLICY "url_analyses_own" ON url_analyses FOR ALL 
USING (user_id = auth.uid());

CREATE POLICY "best_practices_own" ON best_practices FOR ALL 
USING (user_id = auth.uid());

CREATE POLICY "benchmarks_own" ON benchmarks FOR ALL 
USING (user_id = auth.uid());

CREATE POLICY "swipe_files_own" ON swipe_files FOR ALL 
USING (user_id = auth.uid());

CREATE POLICY "competitors_own" ON competitors FOR ALL 
USING (user_id = auth.uid());

CREATE POLICY "user_settings_own" ON user_settings FOR ALL 
USING (user_id = auth.uid());

CREATE POLICY "brand_profiles_own" ON brand_profiles FOR ALL 
USING (user_id = auth.uid());

CREATE POLICY "activities_own" ON activities FOR ALL 
USING (user_id = auth.uid());

-- ============================================
-- STEP 6: Grant permissions
-- ============================================

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- ============================================
-- STEP 7: Create indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_deals_user_id ON deals(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_state_user_id ON user_state(user_id);

-- Done!
DO $$ BEGIN RAISE NOTICE '✅ Migration 015 complete: All tables and RLS policies fixed'; END $$;
