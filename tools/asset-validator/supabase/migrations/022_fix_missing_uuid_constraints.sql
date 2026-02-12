-- Migration 022: Fix Missing UUID Constraints
-- These tables need unique constraints on 'uuid' for upsert operations

-- ============================================
-- PART 1: Add uuid column if missing
-- ============================================

ALTER TABLE strategies ADD COLUMN IF NOT EXISTS uuid TEXT;
ALTER TABLE creative_analyses ADD COLUMN IF NOT EXISTS uuid TEXT;
ALTER TABLE tags ADD COLUMN IF NOT EXISTS uuid TEXT;
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS uuid TEXT;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS uuid TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS uuid TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS uuid TEXT;

-- ============================================
-- PART 2: Add unique constraints for upserts
-- ============================================

-- Strategies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'strategies_uuid_unique') THEN
        ALTER TABLE strategies ADD CONSTRAINT strategies_uuid_unique UNIQUE (uuid);
    END IF;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Creative Analyses
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'creative_analyses_uuid_unique') THEN
        ALTER TABLE creative_analyses ADD CONSTRAINT creative_analyses_uuid_unique UNIQUE (uuid);
    END IF;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Tags
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tags_uuid_unique') THEN
        ALTER TABLE tags ADD CONSTRAINT tags_uuid_unique UNIQUE (uuid);
    END IF;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Competitors
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'competitors_uuid_unique') THEN
        ALTER TABLE competitors ADD CONSTRAINT competitors_uuid_unique UNIQUE (uuid);
    END IF;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Deals
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'deals_uuid_unique') THEN
        ALTER TABLE deals ADD CONSTRAINT deals_uuid_unique UNIQUE (uuid);
    END IF;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Contacts (already has uuid column but may need constraint)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contacts_uuid_unique') THEN
        ALTER TABLE contacts ADD CONSTRAINT contacts_uuid_unique UNIQUE (uuid);
    END IF;
EXCEPTION WHEN others THEN NULL;
END $$;

-- ============================================
-- PART 3: Add missing columns to tables
-- ============================================

-- Strategies
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS owner_email TEXT;

-- Creative Analyses
ALTER TABLE creative_analyses ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE creative_analyses ADD COLUMN IF NOT EXISTS analysis_data JSONB DEFAULT '{}';
ALTER TABLE creative_analyses ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE creative_analyses ADD COLUMN IF NOT EXISTS owner_email TEXT;

-- Tags
ALTER TABLE tags ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE tags ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#ec4899';
ALTER TABLE tags ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE tags ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;
ALTER TABLE tags ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE tags ADD COLUMN IF NOT EXISTS owner_email TEXT;

-- Competitors
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS domain TEXT;
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS company_id TEXT;
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS ad_library_urls TEXT[];
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS monitoring_frequency TEXT DEFAULT 'weekly';
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT false;
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS owner_email TEXT;

-- Activity Log
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS action TEXT;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS entity_type TEXT;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS entity_id TEXT;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}';
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS owner_email TEXT;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS logged_at TIMESTAMPTZ DEFAULT NOW();

-- Contacts
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS company_id TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS owner_email TEXT;

-- ============================================
-- PART 4: Enable RLS and add permissive policies
-- ============================================

ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "allow_all_strategies" ON strategies;
DROP POLICY IF EXISTS "allow_all_creative_analyses" ON creative_analyses;
DROP POLICY IF EXISTS "allow_all_tags" ON tags;
DROP POLICY IF EXISTS "allow_all_competitors" ON competitors;
DROP POLICY IF EXISTS "allow_all_activity_log" ON activity_log;

-- Create permissive policies
CREATE POLICY "allow_all_strategies" ON strategies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_creative_analyses" ON creative_analyses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_tags" ON tags FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_competitors" ON competitors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_activity_log" ON activity_log FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- PART 5: Create indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_strategies_uuid ON strategies(uuid);
CREATE INDEX IF NOT EXISTS idx_strategies_user_email ON strategies(user_email);
CREATE INDEX IF NOT EXISTS idx_creative_analyses_uuid ON creative_analyses(uuid);
CREATE INDEX IF NOT EXISTS idx_tags_uuid ON tags(uuid);
CREATE INDEX IF NOT EXISTS idx_competitors_uuid ON competitors(uuid);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_email ON activity_log(user_email);

-- Refresh schema
NOTIFY pgrst, 'reload schema';

DO $$ BEGIN RAISE NOTICE '✅ Migration 022 complete: UUID constraints and columns added'; END $$;
