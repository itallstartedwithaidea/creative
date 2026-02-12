-- Migration 020: Add ALL Missing Columns
-- Fixes: creative_analyses.asset_dimensions, companies.address, and other missing columns

-- ============================================
-- PART 1: creative_analyses table
-- ============================================

ALTER TABLE creative_analyses ADD COLUMN IF NOT EXISTS asset_dimensions JSONB DEFAULT '{}';
ALTER TABLE creative_analyses ADD COLUMN IF NOT EXISTS audio_strategy JSONB DEFAULT '{}';
ALTER TABLE creative_analyses ADD COLUMN IF NOT EXISTS overall_score INTEGER;
ALTER TABLE creative_analyses ADD COLUMN IF NOT EXISTS confidence_level TEXT DEFAULT 'medium';

-- ============================================
-- PART 2: companies table
-- ============================================

ALTER TABLE companies ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS size TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS revenue TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS founded TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS headquarters TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS stock_symbol TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS market_cap TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS employees TEXT;

-- AI-generated data columns (if not already added)
ALTER TABLE companies ADD COLUMN IF NOT EXISTS enriched_data JSONB DEFAULT '{}';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS strategy_insights JSONB DEFAULT '{}';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS chat_history JSONB DEFAULT '[]';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS benchmarks JSONB DEFAULT '[]';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS best_practices JSONB DEFAULT '[]';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS competitors JSONB DEFAULT '[]';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS ai_analyses JSONB DEFAULT '[]';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS notes_list JSONB DEFAULT '[]';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS linked_assets JSONB DEFAULT '[]';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS swipe_files JSONB DEFAULT '[]';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS url_analyses JSONB DEFAULT '[]';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS analyses JSONB DEFAULT '[]';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'client';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS sharing JSONB DEFAULT '{}';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';

-- ============================================
-- PART 3: strategies table
-- ============================================

ALTER TABLE strategies ADD COLUMN IF NOT EXISTS placement_matrix JSONB DEFAULT '{}';
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS derivative_ideas JSONB DEFAULT '[]';
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS fatigue_prediction JSONB DEFAULT '{}';
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS ab_test_recommendations JSONB DEFAULT '[]';

-- ============================================
-- PART 4: video_analyses table
-- ============================================

ALTER TABLE video_analyses ADD COLUMN IF NOT EXISTS v2_creative_brief TEXT;
ALTER TABLE video_analyses ADD COLUMN IF NOT EXISTS ad_copy_suggestions JSONB DEFAULT '{}';
ALTER TABLE video_analyses ADD COLUMN IF NOT EXISTS benchmark_comparison JSONB DEFAULT '{}';

-- ============================================
-- PART 5: url_analyses table  
-- ============================================

ALTER TABLE url_analyses ADD COLUMN IF NOT EXISTS colors JSONB DEFAULT '[]';
ALTER TABLE url_analyses ADD COLUMN IF NOT EXISTS fonts JSONB DEFAULT '[]';
ALTER TABLE url_analyses ADD COLUMN IF NOT EXISTS scores JSONB DEFAULT '{}';

-- ============================================
-- PART 6: Ensure unique constraints exist
-- ============================================

DO $$
BEGIN
    -- user_api_keys.uuid unique constraint
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_api_keys_uuid_unique') THEN
        ALTER TABLE user_api_keys ADD CONSTRAINT user_api_keys_uuid_unique UNIQUE (uuid);
    END IF;
    
    -- companies.uuid unique constraint
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'companies_uuid_unique') THEN
        ALTER TABLE companies ADD CONSTRAINT companies_uuid_unique UNIQUE (uuid);
    END IF;
    
    -- creative_analyses - ensure id is unique (it's the primary key)
    -- No action needed if id is already primary key
END $$;

-- ============================================
-- PART 7: Create indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_creative_analyses_user_email ON creative_analyses(user_email);
CREATE INDEX IF NOT EXISTS idx_creative_analyses_asset_id ON creative_analyses(asset_id);
CREATE INDEX IF NOT EXISTS idx_companies_user_email ON companies(user_email);
CREATE INDEX IF NOT EXISTS idx_companies_type ON companies(type);

-- ============================================
-- PART 8: Refresh PostgREST schema cache
-- ============================================

NOTIFY pgrst, 'reload schema';

-- Done!
DO $$ BEGIN RAISE NOTICE '✅ Migration 020 complete: All missing columns added'; END $$;
