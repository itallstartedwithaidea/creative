-- Migration 017: Add Missing Columns to Existing Tables
-- Fixes schema mismatch between existing tables and application code

-- ============================================
-- STEP 1: Add missing columns to user_api_keys
-- ============================================

DO $$
BEGIN
    -- Add 'key' column to user_api_keys (code expects this)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_api_keys' AND column_name = 'key') THEN
        ALTER TABLE user_api_keys ADD COLUMN key TEXT;
        RAISE NOTICE 'Added key column to user_api_keys';
    END IF;
    
    -- Add 'uuid' column to user_api_keys
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_api_keys' AND column_name = 'uuid') THEN
        ALTER TABLE user_api_keys ADD COLUMN uuid TEXT UNIQUE;
        RAISE NOTICE 'Added uuid column to user_api_keys';
    END IF;
    
    -- Add 'owner_email' column to user_api_keys
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_api_keys' AND column_name = 'owner_email') THEN
        ALTER TABLE user_api_keys ADD COLUMN owner_email TEXT;
        RAISE NOTICE 'Added owner_email column to user_api_keys';
    END IF;
    
    -- Add 'domain' column to user_api_keys
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_api_keys' AND column_name = 'domain') THEN
        ALTER TABLE user_api_keys ADD COLUMN domain TEXT;
        RAISE NOTICE 'Added domain column to user_api_keys';
    END IF;
    
    -- Add 'is_admin_key' column to user_api_keys
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_api_keys' AND column_name = 'is_admin_key') THEN
        ALTER TABLE user_api_keys ADD COLUMN is_admin_key BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_admin_key column to user_api_keys';
    END IF;
    
    -- Add 'share_with_domain' column to user_api_keys
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_api_keys' AND column_name = 'share_with_domain') THEN
        ALTER TABLE user_api_keys ADD COLUMN share_with_domain BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added share_with_domain column to user_api_keys';
    END IF;
    
    -- Add 'share_globally' column to user_api_keys
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_api_keys' AND column_name = 'share_globally') THEN
        ALTER TABLE user_api_keys ADD COLUMN share_globally BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added share_globally column to user_api_keys';
    END IF;
END;
$$;

-- ============================================
-- STEP 2: Add missing columns to api_keys
-- ============================================

DO $$
BEGIN
    -- Add 'uuid' column to api_keys (for upsert conflict)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'uuid') THEN
        ALTER TABLE api_keys ADD COLUMN uuid TEXT;
        RAISE NOTICE 'Added uuid column to api_keys';
    END IF;
END;
$$;

-- ============================================
-- STEP 3: Add missing columns to user_settings
-- ============================================

DO $$
BEGIN
    -- Add 'uuid' column to user_settings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'uuid') THEN
        ALTER TABLE user_settings ADD COLUMN uuid TEXT UNIQUE;
        RAISE NOTICE 'Added uuid column to user_settings';
    END IF;
    
    -- Add 'settings_type' column to user_settings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'settings_type') THEN
        ALTER TABLE user_settings ADD COLUMN settings_type TEXT;
        RAISE NOTICE 'Added settings_type column to user_settings';
    END IF;
    
    -- Add 'data' column to user_settings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'data') THEN
        ALTER TABLE user_settings ADD COLUMN data JSONB DEFAULT '{}';
        RAISE NOTICE 'Added data column to user_settings';
    END IF;
END;
$$;

-- ============================================
-- STEP 4: Create unique index on uuid columns
-- ============================================

-- Create unique index on api_keys.uuid if column exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'uuid') THEN
        CREATE UNIQUE INDEX IF NOT EXISTS idx_api_keys_uuid ON api_keys(uuid) WHERE uuid IS NOT NULL;
    END IF;
END;
$$;

-- ============================================
-- STEP 5: Notify PostgREST to reload schema
-- This is done automatically but let's ensure cache is cleared
-- ============================================

NOTIFY pgrst, 'reload schema';

-- Done!
DO $$ BEGIN RAISE NOTICE '✅ Migration 017 complete: Missing columns added to existing tables'; END $$;
