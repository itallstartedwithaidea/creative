-- ============================================
-- Fix Missing Columns Migration for CAV v5.14.0
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- FIX creative_analyses TABLE - Add missing columns
-- ============================================

-- Add analyzedAt column (the app uses camelCase but we stored as snake_case)
DO $$
BEGIN
    -- Check if analyzed_at exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'creative_analyses' AND column_name = 'analyzed_at') THEN
        ALTER TABLE creative_analyses ADD COLUMN analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Also add camelCase version for compatibility
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'creative_analyses' AND column_name = 'analyzedat') THEN
        ALTER TABLE creative_analyses ADD COLUMN "analyzedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Add any other potentially missing columns to creative_analyses
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'creative_analyses' AND column_name = 'asset_dimensions') THEN
        ALTER TABLE creative_analyses ADD COLUMN asset_dimensions JSONB DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'creative_analyses' AND column_name = 'audio_strategy') THEN
        ALTER TABLE creative_analyses ADD COLUMN audio_strategy JSONB DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'creative_analyses' AND column_name = 'overall_score') THEN
        ALTER TABLE creative_analyses ADD COLUMN overall_score INTEGER DEFAULT 0;
    END IF;
END $$;

-- ============================================
-- FIX strategies TABLE - Add missing columns
-- ============================================

-- Add abTestRecommendations column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'strategies' AND column_name = 'ab_test_recommendations') THEN
        ALTER TABLE strategies ADD COLUMN ab_test_recommendations JSONB DEFAULT '[]';
    END IF;
    
    -- Also add camelCase version for compatibility
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'strategies' AND column_name = 'abtestRecommendations') THEN
        ALTER TABLE strategies ADD COLUMN "abTestRecommendations" JSONB DEFAULT '[]';
    END IF;
END $$;

-- Add other potentially missing columns to strategies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'strategies' AND column_name = 'placement_matrix') THEN
        ALTER TABLE strategies ADD COLUMN placement_matrix JSONB DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'strategies' AND column_name = 'derivative_ideas') THEN
        ALTER TABLE strategies ADD COLUMN derivative_ideas JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'strategies' AND column_name = 'fatigue_prediction') THEN
        ALTER TABLE strategies ADD COLUMN fatigue_prediction JSONB DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'strategies' AND column_name = 'confidence_level') THEN
        ALTER TABLE strategies ADD COLUMN confidence_level VARCHAR(50) DEFAULT 'medium';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'strategies' AND column_name = 'processing_time') THEN
        ALTER TABLE strategies ADD COLUMN processing_time INTEGER DEFAULT 0;
    END IF;
    
    -- CamelCase versions
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'strategies' AND column_name = 'placementMatrix') THEN
        ALTER TABLE strategies ADD COLUMN "placementMatrix" JSONB DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'strategies' AND column_name = 'derivativeIdeas') THEN
        ALTER TABLE strategies ADD COLUMN "derivativeIdeas" JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'strategies' AND column_name = 'fatiguePrediction') THEN
        ALTER TABLE strategies ADD COLUMN "fatiguePrediction" JSONB DEFAULT '{}';
    END IF;
END $$;

-- ============================================
-- FIX url_analyses TABLE - Add missing columns
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'url_analyses' AND column_name = 'analyzed_at') THEN
        ALTER TABLE url_analyses ADD COLUMN analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'url_analyses' AND column_name = 'analyzedat') THEN
        ALTER TABLE url_analyses ADD COLUMN "analyzedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 005_fix_missing_columns.sql completed!';
    RAISE NOTICE '✅ Added: analyzedAt to creative_analyses';
    RAISE NOTICE '✅ Added: abTestRecommendations to strategies';
    RAISE NOTICE '✅ Added: other missing columns for compatibility';
END $$;
