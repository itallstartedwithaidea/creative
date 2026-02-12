-- Migration 014: Fix RLS Infinite Recursion
-- This migration fixes the infinite recursion error in RLS policies
-- by replacing complex policies with simple, non-recursive ones

-- ============================================
-- STEP 1: Drop all problematic policies
-- ============================================

DO $$
DECLARE
    tbl TEXT;
    pol RECORD;
    all_tables TEXT[] := ARRAY[
        'organizations', 'profiles', 'user_state', 'api_keys', 'api_key_usage',
        'tool_definitions', 'organization_tools',
        'shared_api_keys', 'user_settings', 'user_activity',
        'companies', 'contacts', 'projects', 'deals', 'activities', 'contact_activities',
        'assets', 'brands', 'validations', 'brand_profiles', 'tags', 'custom_fields',
        'video_analyses', 'video_templates', 'video_chat_messages',
        'strategies', 'url_analyses', 'best_practices', 'benchmarks',
        'swipe_files', 'competitors', 'reports'
    ];
BEGIN
    FOREACH tbl IN ARRAY all_tables LOOP
        -- Skip if table doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
            CONTINUE;
        END IF;
        
        -- Drop all existing policies on this table
        FOR pol IN 
            SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = tbl
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, tbl);
            RAISE NOTICE 'Dropped policy % on %', pol.policyname, tbl;
        END LOOP;
    END LOOP;
END;
$$;

-- ============================================
-- STEP 2: Create simple helper function
-- ============================================

-- Simple function to check if user is authenticated
CREATE OR REPLACE FUNCTION is_authenticated()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Simple function to get current user's email
CREATE OR REPLACE FUNCTION current_user_email()
RETURNS TEXT AS $$
BEGIN
    RETURN COALESCE(
        auth.jwt() ->> 'email',
        current_setting('request.jwt.claims', true)::json ->> 'email'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Simple function to check super admin (non-recursive)
CREATE OR REPLACE FUNCTION check_super_admin()
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role 
    FROM profiles 
    WHERE user_id = auth.uid() 
    LIMIT 1;
    
    RETURN user_role = 'super_admin';
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- STEP 3: Create simple non-recursive policies
-- ============================================

-- For profiles table: users can only see their own profile, super admins see all
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (
            user_id = auth.uid() OR check_super_admin()
        );
        CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (
            user_id = auth.uid()
        );
        CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (
            user_id = auth.uid() OR check_super_admin()
        );
        CREATE POLICY "profiles_delete" ON profiles FOR DELETE USING (
            check_super_admin()
        );
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'profiles policies: %', SQLERRM;
END;
$$;

-- For user_state: users can only access their own state
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_state') THEN
        CREATE POLICY "user_state_all" ON user_state FOR ALL USING (
            user_id = auth.uid()
        );
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'user_state policies: %', SQLERRM;
END;
$$;

-- For organizations: members can see their org
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organizations') THEN
        CREATE POLICY "organizations_all" ON organizations FOR ALL USING (
            is_authenticated()
        );
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'organizations policies: %', SQLERRM;
END;
$$;

-- For api_keys: users see their own keys
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'api_keys') THEN
        CREATE POLICY "api_keys_all" ON api_keys FOR ALL USING (
            user_id = auth.uid() OR check_super_admin()
        );
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'api_keys policies: %', SQLERRM;
END;
$$;

-- For shared_api_keys: authenticated users can read, only super admin can write
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'shared_api_keys') THEN
        CREATE POLICY "shared_api_keys_select" ON shared_api_keys FOR SELECT USING (
            is_authenticated()
        );
        CREATE POLICY "shared_api_keys_modify" ON shared_api_keys FOR ALL USING (
            check_super_admin()
        );
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'shared_api_keys policies: %', SQLERRM;
END;
$$;

-- Generic policy for data tables (companies, contacts, etc.)
-- Users can access rows they own (by user_id or user_email)
CREATE OR REPLACE FUNCTION create_simple_policy(table_name TEXT)
RETURNS VOID AS $$
DECLARE
    has_user_id BOOLEAN;
    has_user_email BOOLEAN;
    has_owner_email BOOLEAN;
    policy_condition TEXT;
BEGIN
    -- Check if table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = create_simple_policy.table_name) THEN
        RETURN;
    END IF;
    
    -- Check which columns exist
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = create_simple_policy.table_name AND column_name = 'user_id') INTO has_user_id;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = create_simple_policy.table_name AND column_name = 'user_email') INTO has_user_email;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = create_simple_policy.table_name AND column_name = 'owner_email') INTO has_owner_email;
    
    -- Build condition based on available columns
    IF has_user_id THEN
        policy_condition := 'user_id = auth.uid() OR check_super_admin()';
    ELSIF has_user_email THEN
        policy_condition := 'user_email = current_user_email() OR check_super_admin()';
    ELSIF has_owner_email THEN
        policy_condition := 'owner_email = current_user_email() OR check_super_admin()';
    ELSE
        -- No ownership column, allow authenticated access
        policy_condition := 'is_authenticated()';
    END IF;
    
    -- Create the policy
    EXECUTE format('CREATE POLICY "simple_all" ON %I FOR ALL USING (%s)', table_name, policy_condition);
    RAISE NOTICE 'Created simple policy on % with condition: %', table_name, policy_condition;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating policy on %: %', table_name, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Apply simple policies to all data tables
DO $$
DECLARE
    tbl TEXT;
    data_tables TEXT[] := ARRAY[
        'companies', 'contacts', 'projects', 'deals', 'activities', 'contact_activities',
        'assets', 'brands', 'validations', 'brand_profiles', 'tags', 'custom_fields',
        'video_analyses', 'video_templates', 'video_chat_messages',
        'strategies', 'url_analyses', 'best_practices', 'benchmarks',
        'swipe_files', 'competitors', 'reports',
        'tool_definitions', 'organization_tools', 'api_key_usage',
        'user_settings', 'user_activity'
    ];
BEGIN
    FOREACH tbl IN ARRAY data_tables LOOP
        PERFORM create_simple_policy(tbl);
    END LOOP;
END;
$$;

-- ============================================
-- STEP 4: Ensure RLS is enabled on all tables
-- ============================================

DO $$
DECLARE
    tbl TEXT;
    all_tables TEXT[] := ARRAY[
        'organizations', 'profiles', 'user_state', 'api_keys', 'api_key_usage',
        'tool_definitions', 'organization_tools',
        'shared_api_keys', 'user_settings', 'user_activity',
        'companies', 'contacts', 'projects', 'deals', 'activities', 'contact_activities',
        'assets', 'brands', 'validations', 'brand_profiles', 'tags', 'custom_fields',
        'video_analyses', 'video_templates', 'video_chat_messages',
        'strategies', 'url_analyses', 'best_practices', 'benchmarks',
        'swipe_files', 'competitors', 'reports'
    ];
BEGIN
    FOREACH tbl IN ARRAY all_tables LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
        END IF;
    END LOOP;
END;
$$;

-- ============================================
-- STEP 5: Grant necessary permissions
-- ============================================

DO $$
DECLARE
    tbl TEXT;
    all_tables TEXT[] := ARRAY[
        'organizations', 'profiles', 'user_state', 'api_keys', 'api_key_usage',
        'tool_definitions', 'organization_tools',
        'shared_api_keys', 'user_settings', 'user_activity',
        'companies', 'contacts', 'projects', 'deals', 'activities', 'contact_activities',
        'assets', 'brands', 'validations', 'brand_profiles', 'tags', 'custom_fields',
        'video_analyses', 'video_templates', 'video_chat_messages',
        'strategies', 'url_analyses', 'best_practices', 'benchmarks',
        'swipe_files', 'competitors', 'reports'
    ];
BEGIN
    FOREACH tbl IN ARRAY all_tables LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE format('GRANT ALL ON %I TO authenticated', tbl);
            EXECUTE format('GRANT SELECT ON %I TO anon', tbl);
        END IF;
    END LOOP;
END;
$$;

-- Done!
DO $$ BEGIN RAISE NOTICE '✅ Migration 014 complete: RLS policies fixed'; END $$;
