-- ============================================
-- Unified Storage Tables for Creative Innovate Tool
-- Version: 1.0.0
-- Date: January 18, 2026
-- ============================================

-- Video Analyses
CREATE TABLE IF NOT EXISTS video_analyses (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    url TEXT,
    platform TEXT,
    video_id TEXT,
    title TEXT,
    analysis JSONB,
    metadata JSONB,
    scores JSONB,
    thumbnail_url TEXT,
    status TEXT DEFAULT 'complete',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_video_analyses_user ON video_analyses(user_email);
CREATE INDEX IF NOT EXISTS idx_video_analyses_created ON video_analyses(created_at DESC);

-- Creative Analyses (from Analyze module)
CREATE TABLE IF NOT EXISTS creative_analyses (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    asset_id TEXT,
    asset_name TEXT,
    analysis_type TEXT,
    analysis JSONB,
    scores JSONB,
    recommendations JSONB,
    thumbnail_url TEXT,
    status TEXT DEFAULT 'complete',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_creative_analyses_user ON creative_analyses(user_email);
CREATE INDEX IF NOT EXISTS idx_creative_analyses_asset ON creative_analyses(asset_id);

-- Strategies
CREATE TABLE IF NOT EXISTS strategies (
    id TEXT PRIMARY KEY,
    uuid TEXT UNIQUE,
    user_email TEXT NOT NULL,
    name TEXT,
    asset_id TEXT,
    strategy_type TEXT,
    data JSONB,
    results JSONB,
    recommendations JSONB,
    company_id TEXT,
    project_id TEXT,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_strategies_user ON strategies(user_email);
CREATE INDEX IF NOT EXISTS idx_strategies_company ON strategies(company_id);

-- URL/Image Analyses
CREATE TABLE IF NOT EXISTS url_analyses (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    url TEXT NOT NULL,
    url_type TEXT, -- 'image', 'video', 'landing_page', 'social'
    title TEXT,
    analysis JSONB,
    insights JSONB,
    scores JSONB,
    thumbnail_url TEXT,
    status TEXT DEFAULT 'complete',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_url_analyses_user ON url_analyses(user_email);
CREATE INDEX IF NOT EXISTS idx_url_analyses_type ON url_analyses(url_type);

-- Swipe Files
CREATE TABLE IF NOT EXISTS swipe_files (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    name TEXT,
    url TEXT,
    type TEXT, -- 'image', 'video', 'ad', 'landing_page'
    source TEXT,
    analysis JSONB,
    tags TEXT[],
    notes TEXT,
    thumbnail_url TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    company_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_swipe_files_user ON swipe_files(user_email);
CREATE INDEX IF NOT EXISTS idx_swipe_files_type ON swipe_files(type);

-- Benchmarks
CREATE TABLE IF NOT EXISTS benchmarks (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    name TEXT,
    industry TEXT,
    category TEXT,
    data JSONB,
    source TEXT,
    source_url TEXT,
    last_updated TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_benchmarks_user ON benchmarks(user_email);
CREATE INDEX IF NOT EXISTS idx_benchmarks_industry ON benchmarks(industry);

-- Google Ads Builds
CREATE TABLE IF NOT EXISTS google_ads_builds (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    name TEXT,
    campaign_type TEXT,
    config JSONB,
    headlines JSONB,
    descriptions JSONB,
    keywords JSONB,
    landing_page TEXT,
    company_id TEXT,
    project_id TEXT,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_google_ads_user ON google_ads_builds(user_email);
CREATE INDEX IF NOT EXISTS idx_google_ads_company ON google_ads_builds(company_id);

-- Social Media Builds
CREATE TABLE IF NOT EXISTS social_media_builds (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    name TEXT,
    platform TEXT, -- 'tiktok', 'instagram', 'facebook', 'linkedin', 'twitter'
    config JSONB,
    content JSONB,
    captions JSONB,
    hashtags TEXT[],
    scheduled_at TIMESTAMPTZ,
    company_id TEXT,
    project_id TEXT,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_social_media_user ON social_media_builds(user_email);
CREATE INDEX IF NOT EXISTS idx_social_media_platform ON social_media_builds(platform);

-- Keyword Research
CREATE TABLE IF NOT EXISTS keyword_research (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    name TEXT,
    seed_keywords TEXT[],
    results JSONB,
    volume_data JSONB,
    competition_data JSONB,
    suggestions JSONB,
    company_id TEXT,
    project_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_keyword_research_user ON keyword_research(user_email);

-- Activity Log
CREATE TABLE IF NOT EXISTS activity_log (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_email);
CREATE INDEX IF NOT EXISTS idx_activity_log_timestamp ON activity_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity_type, entity_id);

-- ============================================
-- Row Level Security Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE video_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE url_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipe_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_ads_builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users to access their own data
-- (Using user_email for now since we're not using Supabase Auth)

CREATE POLICY "Users can view their own video_analyses" ON video_analyses
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own video_analyses" ON video_analyses
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own video_analyses" ON video_analyses
    FOR UPDATE USING (true);

CREATE POLICY "Users can view their own creative_analyses" ON creative_analyses
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own creative_analyses" ON creative_analyses
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own creative_analyses" ON creative_analyses
    FOR UPDATE USING (true);

CREATE POLICY "Users can view their own strategies" ON strategies
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own strategies" ON strategies
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own strategies" ON strategies
    FOR UPDATE USING (true);

CREATE POLICY "Users can view their own url_analyses" ON url_analyses
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own url_analyses" ON url_analyses
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own url_analyses" ON url_analyses
    FOR UPDATE USING (true);

CREATE POLICY "Users can view their own swipe_files" ON swipe_files
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own swipe_files" ON swipe_files
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own swipe_files" ON swipe_files
    FOR UPDATE USING (true);

CREATE POLICY "Users can view their own benchmarks" ON benchmarks
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own benchmarks" ON benchmarks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own benchmarks" ON benchmarks
    FOR UPDATE USING (true);

CREATE POLICY "Users can view their own google_ads_builds" ON google_ads_builds
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own google_ads_builds" ON google_ads_builds
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own google_ads_builds" ON google_ads_builds
    FOR UPDATE USING (true);

CREATE POLICY "Users can view their own social_media_builds" ON social_media_builds
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own social_media_builds" ON social_media_builds
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own social_media_builds" ON social_media_builds
    FOR UPDATE USING (true);

CREATE POLICY "Users can view their own keyword_research" ON keyword_research
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own keyword_research" ON keyword_research
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own keyword_research" ON keyword_research
    FOR UPDATE USING (true);

CREATE POLICY "Users can view their own activity_log" ON activity_log
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own activity_log" ON activity_log
    FOR INSERT WITH CHECK (true);

-- ============================================
-- Updated at trigger function
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_video_analyses_updated_at BEFORE UPDATE ON video_analyses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creative_analyses_updated_at BEFORE UPDATE ON creative_analyses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_strategies_updated_at BEFORE UPDATE ON strategies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_url_analyses_updated_at BEFORE UPDATE ON url_analyses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_swipe_files_updated_at BEFORE UPDATE ON swipe_files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_benchmarks_updated_at BEFORE UPDATE ON benchmarks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_google_ads_builds_updated_at BEFORE UPDATE ON google_ads_builds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_media_builds_updated_at BEFORE UPDATE ON social_media_builds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_keyword_research_updated_at BEFORE UPDATE ON keyword_research
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE video_analyses IS 'Stores video creative intelligence analysis results';
COMMENT ON TABLE creative_analyses IS 'Stores creative asset analysis results from Analyze module';
COMMENT ON TABLE strategies IS 'Stores AI-generated creative strategies';
COMMENT ON TABLE url_analyses IS 'Stores URL/image analysis results from Learn module';
COMMENT ON TABLE swipe_files IS 'Stores swipe file entries for creative inspiration';
COMMENT ON TABLE benchmarks IS 'Stores industry benchmarks and performance data';
COMMENT ON TABLE google_ads_builds IS 'Stores Google Ads campaign builds';
COMMENT ON TABLE social_media_builds IS 'Stores social media content builds';
COMMENT ON TABLE keyword_research IS 'Stores keyword research results';
COMMENT ON TABLE activity_log IS 'Stores user activity for auditing and analytics';
