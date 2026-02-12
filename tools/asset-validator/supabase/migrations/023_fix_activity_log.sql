-- Migration 023: Fix Activity Log Table
-- The activity_log table needs proper columns for inserts

-- Check if table exists, if not create it
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT,
    owner_email TEXT,
    action TEXT,
    type TEXT,
    entity_type TEXT,
    entity_id TEXT,
    provider TEXT,
    details JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    shared BOOLEAN DEFAULT false,
    logged_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add any missing columns
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS owner_email TEXT;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS action TEXT;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS entity_type TEXT;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS entity_id TEXT;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS provider TEXT;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}';
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS shared BOOLEAN DEFAULT false;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS logged_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Enable RLS
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policy
DROP POLICY IF EXISTS "allow_all_activity_log" ON activity_log;
CREATE POLICY "allow_all_activity_log" ON activity_log FOR ALL USING (true) WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_activity_log_user_email ON activity_log(user_email);
CREATE INDEX IF NOT EXISTS idx_activity_log_logged_at ON activity_log(logged_at);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log(action);

-- Refresh schema
NOTIFY pgrst, 'reload schema';

DO $$ BEGIN RAISE NOTICE '✅ Migration 023 complete: activity_log table fixed'; END $$;
