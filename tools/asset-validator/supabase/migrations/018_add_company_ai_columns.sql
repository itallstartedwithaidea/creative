-- Migration 018: Add Missing AI Data Columns to Companies Table
-- These columns store all the AI-generated data from:
-- - Enrich Company Data
-- - Generate AI Strategy
-- - AI Chat History
-- - Benchmarks, Competitors, Best Practices linked to companies

-- ============================================
-- STEP 1: Add missing JSONB columns to companies
-- ============================================

DO $$
BEGIN
    -- enriched_data: Stores company research from "Enrich Company Data" button
    -- Fields: founded, employees, revenue, headquarters, stockSymbol, marketCap, description, recentNews, updatedAt
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'enriched_data') THEN
        ALTER TABLE companies ADD COLUMN enriched_data JSONB DEFAULT '{}';
        RAISE NOTICE 'Added enriched_data column to companies';
    END IF;

    -- strategy_insights: Stores AI strategy from "Generate AI Strategy" button
    -- Fields: creativeStrategy, paidMediaStrategy, performanceTrends, actionItems, recommendations, generatedAt
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'strategy_insights') THEN
        ALTER TABLE companies ADD COLUMN strategy_insights JSONB DEFAULT '{}';
        RAISE NOTICE 'Added strategy_insights column to companies';
    END IF;

    -- chat_history: Stores AI Strategy Chat conversation history
    -- Array of: { role, content, prompt, response, model, timestamp }
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'chat_history') THEN
        ALTER TABLE companies ADD COLUMN chat_history JSONB DEFAULT '[]';
        RAISE NOTICE 'Added chat_history column to companies';
    END IF;

    -- benchmarks: Stores industry benchmarks linked to this company
    -- Array of: { metric, value, industry, source, createdAt }
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'benchmarks') THEN
        ALTER TABLE companies ADD COLUMN benchmarks JSONB DEFAULT '[]';
        RAISE NOTICE 'Added benchmarks column to companies';
    END IF;

    -- best_practices: Stores best practices linked to this company
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'best_practices') THEN
        ALTER TABLE companies ADD COLUMN best_practices JSONB DEFAULT '[]';
        RAISE NOTICE 'Added best_practices column to companies';
    END IF;

    -- competitors: Stores competitors detected for this company
    -- Array of: { name, website, description, strengths, weaknesses, addedAt }
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'competitors') THEN
        ALTER TABLE companies ADD COLUMN competitors JSONB DEFAULT '[]';
        RAISE NOTICE 'Added competitors column to companies';
    END IF;

    -- ai_analyses: Stores AI analyses linked to this company
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'ai_analyses') THEN
        ALTER TABLE companies ADD COLUMN ai_analyses JSONB DEFAULT '[]';
        RAISE NOTICE 'Added ai_analyses column to companies';
    END IF;

    -- notes_list: Stores company notes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'notes_list') THEN
        ALTER TABLE companies ADD COLUMN notes_list JSONB DEFAULT '[]';
        RAISE NOTICE 'Added notes_list column to companies';
    END IF;

    -- linked_assets: Stores asset IDs linked to this company
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'linked_assets') THEN
        ALTER TABLE companies ADD COLUMN linked_assets JSONB DEFAULT '[]';
        RAISE NOTICE 'Added linked_assets column to companies';
    END IF;

    -- swipe_files: Stores swipe file entries linked to this company
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'swipe_files') THEN
        ALTER TABLE companies ADD COLUMN swipe_files JSONB DEFAULT '[]';
        RAISE NOTICE 'Added swipe_files column to companies';
    END IF;

    -- url_analyses: Stores URL analyses linked to this company
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'url_analyses') THEN
        ALTER TABLE companies ADD COLUMN url_analyses JSONB DEFAULT '[]';
        RAISE NOTICE 'Added url_analyses column to companies';
    END IF;

    -- analyses: Stores creative analyses linked to this company
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'analyses') THEN
        ALTER TABLE companies ADD COLUMN analyses JSONB DEFAULT '[]';
        RAISE NOTICE 'Added analyses column to companies';
    END IF;

    -- tags: Company tags
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'tags') THEN
        ALTER TABLE companies ADD COLUMN tags TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added tags column to companies';
    END IF;

    -- type: Company type (client, prospect, partner, competitor)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'type') THEN
        ALTER TABLE companies ADD COLUMN type TEXT DEFAULT 'client';
        RAISE NOTICE 'Added type column to companies';
    END IF;

    -- sharing: Sharing settings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'sharing') THEN
        ALTER TABLE companies ADD COLUMN sharing JSONB DEFAULT '{}';
        RAISE NOTICE 'Added sharing column to companies';
    END IF;
END;
$$;

-- ============================================
-- STEP 2: Create indexes for new columns
-- ============================================

CREATE INDEX IF NOT EXISTS idx_companies_enriched_data ON companies USING GIN (enriched_data);
CREATE INDEX IF NOT EXISTS idx_companies_strategy_insights ON companies USING GIN (strategy_insights);
CREATE INDEX IF NOT EXISTS idx_companies_type ON companies(type);

-- ============================================
-- STEP 3: Notify PostgREST to reload schema
-- ============================================

NOTIFY pgrst, 'reload schema';

-- Done!
DO $$ BEGIN RAISE NOTICE '✅ Migration 018 complete: Added AI data columns to companies table'; END $$;
