-- ============================================
-- Missing Tables Migration for CAV v5.14.0
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DEALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uuid VARCHAR(255) UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID,
    name VARCHAR(500) NOT NULL,
    value DECIMAL(15, 2) DEFAULT 0,
    stage VARCHAR(100) DEFAULT 'lead',
    probability INTEGER DEFAULT 0,
    expected_close_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    is_shared BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deals
DROP POLICY IF EXISTS "Users can view own deals" ON deals;
CREATE POLICY "Users can view own deals" ON deals
    FOR SELECT USING (
        auth.uid() = user_id OR 
        is_shared = true OR
        auth.jwt() ->> 'email' IN (SELECT unnest(string_to_array(current_setting('app.super_admins', true), ',')))
    );

DROP POLICY IF EXISTS "Users can insert own deals" ON deals;
CREATE POLICY "Users can insert own deals" ON deals
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update own deals" ON deals;
CREATE POLICY "Users can update own deals" ON deals
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own deals" ON deals;
CREATE POLICY "Users can delete own deals" ON deals
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- STRATEGIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS strategies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uuid VARCHAR(255) UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    asset_id VARCHAR(255),
    asset_filename VARCHAR(500),
    strategy_type VARCHAR(100) DEFAULT 'general',
    content JSONB DEFAULT '{}',
    recommendations JSONB DEFAULT '[]',
    scores JSONB DEFAULT '{}',
    is_shared BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for strategies
DROP POLICY IF EXISTS "Users can view own strategies" ON strategies;
CREATE POLICY "Users can view own strategies" ON strategies
    FOR SELECT USING (
        auth.uid() = user_id OR 
        is_shared = true
    );

DROP POLICY IF EXISTS "Users can insert own strategies" ON strategies;
CREATE POLICY "Users can insert own strategies" ON strategies
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update own strategies" ON strategies;
CREATE POLICY "Users can update own strategies" ON strategies
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own strategies" ON strategies;
CREATE POLICY "Users can delete own strategies" ON strategies
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- URL_ANALYSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS url_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uuid VARCHAR(255) UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    url_type VARCHAR(50) DEFAULT 'webpage',
    title VARCHAR(500),
    thumbnail TEXT,
    analysis JSONB DEFAULT '{}',
    colors JSONB DEFAULT '[]',
    fonts JSONB DEFAULT '[]',
    scores JSONB DEFAULT '{}',
    is_shared BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE url_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for url_analyses
DROP POLICY IF EXISTS "Users can view own url_analyses" ON url_analyses;
CREATE POLICY "Users can view own url_analyses" ON url_analyses
    FOR SELECT USING (
        auth.uid() = user_id OR 
        is_shared = true
    );

DROP POLICY IF EXISTS "Users can insert own url_analyses" ON url_analyses;
CREATE POLICY "Users can insert own url_analyses" ON url_analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update own url_analyses" ON url_analyses;
CREATE POLICY "Users can update own url_analyses" ON url_analyses
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own url_analyses" ON url_analyses;
CREATE POLICY "Users can delete own url_analyses" ON url_analyses
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- CREATIVE_ANALYSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS creative_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uuid VARCHAR(255) UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    asset_id VARCHAR(255),
    asset_filename VARCHAR(500),
    asset_type VARCHAR(50) DEFAULT 'image',
    width INTEGER,
    height INTEGER,
    hook_analysis JSONB DEFAULT '{}',
    cta_analysis JSONB DEFAULT '{}',
    brand_compliance JSONB DEFAULT '{}',
    thumb_stop_score JSONB DEFAULT '{}',
    performance_prediction JSONB DEFAULT '{}',
    enhanced_analysis JSONB DEFAULT '{}',
    confidence VARCHAR(50) DEFAULT 'low',
    processing_time INTEGER DEFAULT 0,
    linked_company_id UUID,
    detected_brand VARCHAR(255),
    is_shared BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE creative_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for creative_analyses
DROP POLICY IF EXISTS "Users can view own creative_analyses" ON creative_analyses;
CREATE POLICY "Users can view own creative_analyses" ON creative_analyses
    FOR SELECT USING (
        auth.uid() = user_id OR 
        is_shared = true
    );

DROP POLICY IF EXISTS "Users can insert own creative_analyses" ON creative_analyses;
CREATE POLICY "Users can insert own creative_analyses" ON creative_analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update own creative_analyses" ON creative_analyses;
CREATE POLICY "Users can update own creative_analyses" ON creative_analyses
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own creative_analyses" ON creative_analyses;
CREATE POLICY "Users can delete own creative_analyses" ON creative_analyses
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_deals_user_id ON deals(user_id);
CREATE INDEX IF NOT EXISTS idx_deals_company_id ON deals(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_deleted_at ON deals(deleted_at);

CREATE INDEX IF NOT EXISTS idx_strategies_user_id ON strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_strategies_asset_id ON strategies(asset_id);
CREATE INDEX IF NOT EXISTS idx_strategies_deleted_at ON strategies(deleted_at);

CREATE INDEX IF NOT EXISTS idx_url_analyses_user_id ON url_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_url_analyses_url ON url_analyses(url);
CREATE INDEX IF NOT EXISTS idx_url_analyses_deleted_at ON url_analyses(deleted_at);

CREATE INDEX IF NOT EXISTS idx_creative_analyses_user_id ON creative_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_creative_analyses_asset_id ON creative_analyses(asset_id);
CREATE INDEX IF NOT EXISTS idx_creative_analyses_deleted_at ON creative_analyses(deleted_at);

-- ============================================
-- FIX shared_api_keys TABLE (if exists)
-- ============================================

-- Add missing columns if table exists
DO $$
BEGIN
    -- Ensure organization_id allows null or has default
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'shared_api_keys') THEN
        ALTER TABLE shared_api_keys ALTER COLUMN organization_id SET DEFAULT 'global';
    END IF;
EXCEPTION
    WHEN others THEN
        NULL;
END $$;

-- Create shared_api_keys if not exists
CREATE TABLE IF NOT EXISTS shared_api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id VARCHAR(255) NOT NULL DEFAULT 'global',
    admin_user_id UUID,
    encrypted_keys JSONB DEFAULT '{}',
    allowed_emails TEXT[] DEFAULT '{}',
    allowed_domains TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id)
);

-- Enable RLS
ALTER TABLE shared_api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policy for shared_api_keys - allow reading for anyone authenticated
DROP POLICY IF EXISTS "Authenticated users can read shared keys" ON shared_api_keys;
CREATE POLICY "Authenticated users can read shared keys" ON shared_api_keys
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage shared keys" ON shared_api_keys;
CREATE POLICY "Admins can manage shared keys" ON shared_api_keys
    FOR ALL USING (
        auth.uid() = admin_user_id OR
        auth.jwt() ->> 'email' IN (SELECT unnest(string_to_array(current_setting('app.super_admins', true), ',')))
    );

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT ALL ON deals TO authenticated;
GRANT ALL ON strategies TO authenticated;
GRANT ALL ON url_analyses TO authenticated;
GRANT ALL ON creative_analyses TO authenticated;
GRANT ALL ON shared_api_keys TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 004_missing_tables.sql completed successfully!';
    RAISE NOTICE 'Created tables: deals, strategies, url_analyses, creative_analyses, shared_api_keys';
END $$;
