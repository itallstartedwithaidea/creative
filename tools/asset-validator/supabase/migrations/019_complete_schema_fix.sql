-- Migration 019: Complete Schema Fix
-- Adds missing columns to companies table and unique constraints for upserts

-- ============================================
-- PART 1: Add missing columns to companies table
-- ============================================

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

-- ============================================
-- PART 2: Add unique constraints for upserts
-- ============================================

-- profiles.email - needed for onConflict: 'email'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_email_key' OR conname = 'profiles_email_unique'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);
        RAISE NOTICE 'Added unique constraint on profiles.email';
    END IF;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'profiles.email unique constraint already exists or cannot be added';
END $$;

-- shared_api_keys.organization_id - needed for onConflict: 'organization_id'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'shared_api_keys_organization_id_key' OR conname = 'shared_api_keys_organization_id_unique'
    ) THEN
        ALTER TABLE shared_api_keys ADD CONSTRAINT shared_api_keys_organization_id_unique UNIQUE (organization_id);
        RAISE NOTICE 'Added unique constraint on shared_api_keys.organization_id';
    END IF;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'shared_api_keys.organization_id unique constraint already exists or cannot be added';
END $$;

-- user_state.user_email - needed for onConflict: 'user_email'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_state_user_email_key' OR conname = 'user_state_user_email_unique'
    ) THEN
        ALTER TABLE user_state ADD CONSTRAINT user_state_user_email_unique UNIQUE (user_email);
        RAISE NOTICE 'Added unique constraint on user_state.user_email';
    END IF;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'user_state.user_email unique constraint already exists or cannot be added';
END $$;

-- user_api_keys.uuid - needed for onConflict: 'uuid'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_api_keys_uuid_key' OR conname = 'user_api_keys_uuid_unique'
    ) THEN
        ALTER TABLE user_api_keys ADD CONSTRAINT user_api_keys_uuid_unique UNIQUE (uuid);
        RAISE NOTICE 'Added unique constraint on user_api_keys.uuid';
    END IF;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'user_api_keys.uuid unique constraint already exists or cannot be added';
END $$;

-- api_keys.uuid - needed for some operations
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'api_keys_uuid_key' OR conname = 'api_keys_uuid_unique'
    ) THEN
        ALTER TABLE api_keys ADD CONSTRAINT api_keys_uuid_unique UNIQUE (uuid);
        RAISE NOTICE 'Added unique constraint on api_keys.uuid';
    END IF;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'api_keys.uuid unique constraint already exists or cannot be added';
END $$;

-- user_settings.uuid - needed for onConflict: 'uuid'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_settings_uuid_key' OR conname = 'user_settings_uuid_unique'
    ) THEN
        ALTER TABLE user_settings ADD CONSTRAINT user_settings_uuid_unique UNIQUE (uuid);
        RAISE NOTICE 'Added unique constraint on user_settings.uuid';
    END IF;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'user_settings.uuid unique constraint already exists or cannot be added';
END $$;

-- companies.uuid - needed for onConflict: 'uuid'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'companies_uuid_key' OR conname = 'companies_uuid_unique'
    ) THEN
        ALTER TABLE companies ADD CONSTRAINT companies_uuid_unique UNIQUE (uuid);
        RAISE NOTICE 'Added unique constraint on companies.uuid';
    END IF;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'companies.uuid unique constraint already exists or cannot be added';
END $$;

-- contacts.uuid - needed for onConflict: 'uuid'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'contacts_uuid_key' OR conname = 'contacts_uuid_unique'
    ) THEN
        ALTER TABLE contacts ADD CONSTRAINT contacts_uuid_unique UNIQUE (uuid);
        RAISE NOTICE 'Added unique constraint on contacts.uuid';
    END IF;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'contacts.uuid unique constraint already exists or cannot be added';
END $$;

-- projects.uuid - needed for onConflict: 'uuid'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'projects_uuid_key' OR conname = 'projects_uuid_unique'
    ) THEN
        ALTER TABLE projects ADD CONSTRAINT projects_uuid_unique UNIQUE (uuid);
        RAISE NOTICE 'Added unique constraint on projects.uuid';
    END IF;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'projects.uuid unique constraint already exists or cannot be added';
END $$;

-- ============================================
-- PART 3: Create indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_companies_enriched_data ON companies USING GIN (enriched_data);
CREATE INDEX IF NOT EXISTS idx_companies_strategy_insights ON companies USING GIN (strategy_insights);
CREATE INDEX IF NOT EXISTS idx_companies_type ON companies(type);
CREATE INDEX IF NOT EXISTS idx_companies_user_email ON companies(user_email);

-- ============================================
-- PART 4: Refresh schema cache
-- ============================================

NOTIFY pgrst, 'reload schema';

-- Done!
DO $$ BEGIN RAISE NOTICE '✅ Migration 019 complete: Schema is now aligned with code'; END $$;
