-- Migration 024: Fix Integration Credentials Table
-- Required for storing Cloudinary and other service credentials

-- Create table if not exists
CREATE TABLE IF NOT EXISTS integration_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid TEXT UNIQUE,
    user_email TEXT NOT NULL,
    owner_email TEXT,
    organization_id TEXT DEFAULT 'default',
    service TEXT NOT NULL,
    provider TEXT,
    credentials JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns
ALTER TABLE integration_credentials ADD COLUMN IF NOT EXISTS uuid TEXT;
ALTER TABLE integration_credentials ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE integration_credentials ADD COLUMN IF NOT EXISTS owner_email TEXT;
ALTER TABLE integration_credentials ADD COLUMN IF NOT EXISTS service TEXT;
ALTER TABLE integration_credentials ADD COLUMN IF NOT EXISTS provider TEXT;
ALTER TABLE integration_credentials ADD COLUMN IF NOT EXISTS credentials JSONB DEFAULT '{}';
ALTER TABLE integration_credentials ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE integration_credentials ADD COLUMN IF NOT EXISTS organization_id TEXT DEFAULT 'default';

-- Add unique constraint on uuid
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'integration_credentials_uuid_unique') THEN
        ALTER TABLE integration_credentials ADD CONSTRAINT integration_credentials_uuid_unique UNIQUE (uuid);
    END IF;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE integration_credentials ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policy
DROP POLICY IF EXISTS "allow_all_integration_credentials" ON integration_credentials;
CREATE POLICY "allow_all_integration_credentials" ON integration_credentials FOR ALL USING (true) WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_integration_credentials_user_email ON integration_credentials(user_email);
CREATE INDEX IF NOT EXISTS idx_integration_credentials_service ON integration_credentials(service);
CREATE INDEX IF NOT EXISTS idx_integration_credentials_uuid ON integration_credentials(uuid);

-- Also ensure user_settings has proper structure
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS uuid TEXT;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS owner_email TEXT;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS settings_type TEXT DEFAULT 'app_settings';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}';

-- Add unique constraint on user_settings.uuid
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_settings_uuid_unique') THEN
        ALTER TABLE user_settings ADD CONSTRAINT user_settings_uuid_unique UNIQUE (uuid);
    END IF;
EXCEPTION WHEN others THEN NULL;
END $$;

-- RLS for user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_user_settings" ON user_settings;
CREATE POLICY "allow_all_user_settings" ON user_settings FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- PART 6: Fix shared_api_keys table
-- ============================================

-- Create table if not exists
CREATE TABLE IF NOT EXISTS shared_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id TEXT UNIQUE NOT NULL DEFAULT 'default',
    admin_user_id UUID,
    encrypted_keys JSONB DEFAULT '{}',
    allowed_domains TEXT[],
    allowed_emails TEXT[],
    is_global_share BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns
ALTER TABLE shared_api_keys ADD COLUMN IF NOT EXISTS organization_id TEXT DEFAULT 'default';
ALTER TABLE shared_api_keys ADD COLUMN IF NOT EXISTS admin_user_id UUID;
ALTER TABLE shared_api_keys ADD COLUMN IF NOT EXISTS encrypted_keys JSONB DEFAULT '{}';
ALTER TABLE shared_api_keys ADD COLUMN IF NOT EXISTS allowed_domains TEXT[];
ALTER TABLE shared_api_keys ADD COLUMN IF NOT EXISTS allowed_emails TEXT[];
ALTER TABLE shared_api_keys ADD COLUMN IF NOT EXISTS is_global_share BOOLEAN DEFAULT true;

-- Add unique constraint if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'shared_api_keys_organization_id_key') THEN
        ALTER TABLE shared_api_keys ADD CONSTRAINT shared_api_keys_organization_id_key UNIQUE (organization_id);
    END IF;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE shared_api_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_shared_api_keys" ON shared_api_keys;
CREATE POLICY "allow_all_shared_api_keys" ON shared_api_keys FOR ALL USING (true) WITH CHECK (true);

-- Refresh schema
NOTIFY pgrst, 'reload schema';

DO $$ BEGIN RAISE NOTICE '✅ Migration 024 complete: Integration credentials, user_settings, and shared_api_keys fixed'; END $$;
