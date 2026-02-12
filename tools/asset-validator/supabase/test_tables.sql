-- ============================================
-- COMPREHENSIVE DATABASE TEST SCRIPT
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. LIST ALL TABLES
SELECT '=== ALL TABLES ===' as section;
SELECT table_name, 
       (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. CHECK REQUIRED TABLES EXIST
SELECT '=== REQUIRED TABLES CHECK ===' as section;
SELECT 
    table_name,
    CASE WHEN table_name IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM (
    VALUES 
        ('profiles'), ('user_state'), ('organizations'), ('api_keys'), ('shared_api_keys'),
        ('companies'), ('contacts'), ('projects'), ('deals'), ('assets'),
        ('strategies'), ('url_analyses'), ('best_practices'), ('benchmarks'),
        ('swipe_files'), ('competitors'), ('user_settings'), ('brand_profiles'), ('activities')
) AS required(name)
LEFT JOIN information_schema.tables t 
    ON t.table_name = required.name AND t.table_schema = 'public';

-- 3. CHECK RLS IS ENABLED
SELECT '=== RLS STATUS ===' as section;
SELECT 
    schemaname,
    tablename,
    CASE WHEN rowsecurity THEN '✅ RLS ON' ELSE '❌ RLS OFF' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 4. CHECK POLICIES EXIST
SELECT '=== RLS POLICIES ===' as section;
SELECT 
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. CHECK KEY COLUMNS IN COMPANIES TABLE
SELECT '=== COMPANIES TABLE COLUMNS ===' as section;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'companies' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. CHECK KEY COLUMNS IN API_KEYS TABLE
SELECT '=== API_KEYS TABLE COLUMNS ===' as section;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'api_keys' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. CHECK DATA COUNTS
SELECT '=== DATA COUNTS ===' as section;
SELECT 'profiles' as table_name, count(*) as row_count FROM profiles
UNION ALL SELECT 'user_state', count(*) FROM user_state
UNION ALL SELECT 'api_keys', count(*) FROM api_keys
UNION ALL SELECT 'shared_api_keys', count(*) FROM shared_api_keys
UNION ALL SELECT 'companies', count(*) FROM companies
UNION ALL SELECT 'contacts', count(*) FROM contacts
UNION ALL SELECT 'projects', count(*) FROM projects
UNION ALL SELECT 'deals', count(*) FROM deals
UNION ALL SELECT 'assets', count(*) FROM assets
UNION ALL SELECT 'user_settings', count(*) FROM user_settings;

-- 8. TEST INSERT (will rollback)
SELECT '=== TEST INSERT/DELETE ===' as section;
DO $$
DECLARE
    test_id UUID;
BEGIN
    -- Test insert into companies
    INSERT INTO companies (uuid, name, user_email, created_at)
    VALUES ('test-' || gen_random_uuid()::text, 'TEST COMPANY - DELETE ME', 'test@test.com', NOW())
    RETURNING id INTO test_id;
    
    RAISE NOTICE '✅ INSERT works - created test company with id: %', test_id;
    
    -- Test delete
    DELETE FROM companies WHERE id = test_id;
    RAISE NOTICE '✅ DELETE works - removed test company';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ ERROR: %', SQLERRM;
END;
$$;

-- 9. CHECK INDEXES
SELECT '=== INDEXES ===' as section;
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- DONE
SELECT '=== TEST COMPLETE ===' as section;
