-- Migration 025: Fix Assets Table for Cross-Device Sync
-- Ensure assets table has all columns needed for library sync

-- Create table if not exists
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid TEXT UNIQUE,
    user_email TEXT,
    owner_email TEXT,
    filename TEXT,
    name TEXT,
    file_type TEXT,
    mime_type TEXT,
    file_size BIGINT,
    width INTEGER,
    height INTEGER,
    duration REAL,
    aspect_ratio TEXT,
    tags JSONB DEFAULT '{}',
    channels TEXT[],
    status TEXT DEFAULT 'ready',
    is_favorite BOOLEAN DEFAULT false,
    is_team BOOLEAN DEFAULT false,
    is_trashed BOOLEAN DEFAULT false,
    thumbnail_url TEXT,
    external_url TEXT,
    cloudinary_url TEXT,
    cloudinary_id TEXT,
    metadata JSONB DEFAULT '{}',
    validation_results JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Add missing columns
ALTER TABLE assets ADD COLUMN IF NOT EXISTS uuid TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS owner_email TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS filename TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS file_type TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS mime_type TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS file_size BIGINT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS width INTEGER;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS height INTEGER;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS duration REAL;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS aspect_ratio TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '{}';
ALTER TABLE assets ADD COLUMN IF NOT EXISTS channels TEXT[];
ALTER TABLE assets ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ready';
ALTER TABLE assets ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS is_team BOOLEAN DEFAULT false;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS is_trashed BOOLEAN DEFAULT false;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS external_url TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS cloudinary_url TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS cloudinary_id TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE assets ADD COLUMN IF NOT EXISTS validation_results JSONB DEFAULT '{}';
ALTER TABLE assets ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add unique constraint on uuid
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assets_uuid_unique') THEN
        ALTER TABLE assets ADD CONSTRAINT assets_uuid_unique UNIQUE (uuid);
    END IF;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_assets" ON assets;
CREATE POLICY "allow_all_assets" ON assets FOR ALL USING (true) WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_assets_uuid ON assets(uuid);
CREATE INDEX IF NOT EXISTS idx_assets_user_email ON assets(user_email);
CREATE INDEX IF NOT EXISTS idx_assets_file_type ON assets(file_type);
CREATE INDEX IF NOT EXISTS idx_assets_is_team ON assets(is_team);
CREATE INDEX IF NOT EXISTS idx_assets_created_at ON assets(created_at);

-- Refresh schema
NOTIFY pgrst, 'reload schema';

DO $$ BEGIN RAISE NOTICE '✅ Migration 025 complete: Assets table ready for cross-device sync'; END $$;
