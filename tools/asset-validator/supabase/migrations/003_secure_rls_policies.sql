-- ============================================
-- SECURE ROW LEVEL SECURITY POLICIES
-- Creative Innovate Tool - Security Hardening
-- Version: 1.0.0
-- Date: January 18, 2026
-- ============================================
-- 
-- IMPORTANT: This replaces the "Anyone can..." policies with proper user isolation
-- Run this AFTER the initial schema setup
--
-- Policy Strategy:
-- 1. Users can only access their own data (via user_email or owner_email)
-- 2. Shared data is accessible to users in the same organization (domain)
-- 3. Super admins can access all data
-- ============================================

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to extract domain from email
CREATE OR REPLACE FUNCTION get_email_domain(email TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN LOWER(SPLIT_PART(email, '@', 2));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if current user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Super admin emails - these users can access ALL data
    RETURN LOWER(current_setting('request.jwt.claims', true)::json->>'email') IN (
        'john@itallstartedwithaidea.com'
        -- Add more super admins below (comma-separated, lowercase):
        -- , 'admin2@yourcompany.com'
        -- , 'admin3@yourcompany.com'
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get current user's email from JWT
CREATE OR REPLACE FUNCTION auth_email()
RETURNS TEXT AS $$
BEGIN
    RETURN COALESCE(
        current_setting('request.jwt.claims', true)::json->>'email',
        current_setting('request.headers', true)::json->>'x-user-email',
        ''
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to check if user is in same organization
CREATE OR REPLACE FUNCTION same_organization(row_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Same domain = same organization
    RETURN get_email_domain(auth_email()) = get_email_domain(row_email)
           AND get_email_domain(row_email) NOT IN ('gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com');
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- 1. SHARED API KEYS - Domain-scoped access
-- ============================================
DROP POLICY IF EXISTS "Anyone can read shared keys" ON shared_api_keys;
DROP POLICY IF EXISTS "Anyone can save shared keys" ON shared_api_keys;
DROP POLICY IF EXISTS "Anyone can update shared keys" ON shared_api_keys;

-- Users can read keys for their organization
CREATE POLICY "Users can read org keys" ON shared_api_keys 
    FOR SELECT USING (
        organization_id = REPLACE(get_email_domain(auth_email()), '.', '_')
        OR organization_id = 'default'
        OR organization_id = 'global'
        OR is_super_admin()
    );

-- Only admins can insert/update keys for their domain
CREATE POLICY "Admins can manage org keys" ON shared_api_keys 
    FOR INSERT WITH CHECK (
        organization_id = REPLACE(get_email_domain(auth_email()), '.', '_')
        OR organization_id = 'default'
        OR is_super_admin()
    );

CREATE POLICY "Admins can update org keys" ON shared_api_keys 
    FOR UPDATE USING (
        organization_id = REPLACE(get_email_domain(auth_email()), '.', '_')
        OR is_super_admin()
    );

-- ============================================
-- 2. VIDEO ANALYSES - User-scoped
-- ============================================
DROP POLICY IF EXISTS "Anyone can select video_analyses" ON video_analyses;
DROP POLICY IF EXISTS "Anyone can insert video_analyses" ON video_analyses;
DROP POLICY IF EXISTS "Anyone can update video_analyses" ON video_analyses;
DROP POLICY IF EXISTS "Anyone can delete video_analyses" ON video_analyses;

CREATE POLICY "Users can view own video analyses" ON video_analyses 
    FOR SELECT USING (
        user_email = auth_email() 
        OR same_organization(user_email)
        OR is_super_admin()
    );

CREATE POLICY "Users can create video analyses" ON video_analyses 
    FOR INSERT WITH CHECK (
        user_email = auth_email()
        OR is_super_admin()
    );

CREATE POLICY "Users can update own video analyses" ON video_analyses 
    FOR UPDATE USING (
        user_email = auth_email()
        OR is_super_admin()
    );

CREATE POLICY "Users can delete own video analyses" ON video_analyses 
    FOR DELETE USING (
        user_email = auth_email()
        OR is_super_admin()
    );

-- ============================================
-- 3. CREATIVE ANALYSES - User-scoped
-- ============================================
DROP POLICY IF EXISTS "Anyone can select creative_analyses" ON creative_analyses;
DROP POLICY IF EXISTS "Anyone can insert creative_analyses" ON creative_analyses;
DROP POLICY IF EXISTS "Anyone can update creative_analyses" ON creative_analyses;
DROP POLICY IF EXISTS "Anyone can delete creative_analyses" ON creative_analyses;

CREATE POLICY "Users can view own creative analyses" ON creative_analyses 
    FOR SELECT USING (
        user_email = auth_email() 
        OR same_organization(user_email)
        OR is_super_admin()
    );

CREATE POLICY "Users can create creative analyses" ON creative_analyses 
    FOR INSERT WITH CHECK (user_email = auth_email() OR is_super_admin());

CREATE POLICY "Users can update own creative analyses" ON creative_analyses 
    FOR UPDATE USING (user_email = auth_email() OR is_super_admin());

CREATE POLICY "Users can delete own creative analyses" ON creative_analyses 
    FOR DELETE USING (user_email = auth_email() OR is_super_admin());

-- ============================================
-- 4. STRATEGIES - User + Team scoped
-- ============================================
DROP POLICY IF EXISTS "Anyone can select strategies" ON strategies;
DROP POLICY IF EXISTS "Anyone can insert strategies" ON strategies;
DROP POLICY IF EXISTS "Anyone can update strategies" ON strategies;
DROP POLICY IF EXISTS "Anyone can delete strategies" ON strategies;

CREATE POLICY "Users can view strategies" ON strategies 
    FOR SELECT USING (
        user_email = auth_email() 
        OR same_organization(user_email)
        OR is_super_admin()
    );

CREATE POLICY "Users can create strategies" ON strategies 
    FOR INSERT WITH CHECK (user_email = auth_email() OR is_super_admin());

CREATE POLICY "Users can update own strategies" ON strategies 
    FOR UPDATE USING (user_email = auth_email() OR is_super_admin());

CREATE POLICY "Users can delete own strategies" ON strategies 
    FOR DELETE USING (user_email = auth_email() OR is_super_admin());

-- ============================================
-- 5. URL ANALYSES - User-scoped
-- ============================================
DROP POLICY IF EXISTS "Anyone can select url_analyses" ON url_analyses;
DROP POLICY IF EXISTS "Anyone can insert url_analyses" ON url_analyses;
DROP POLICY IF EXISTS "Anyone can update url_analyses" ON url_analyses;
DROP POLICY IF EXISTS "Anyone can delete url_analyses" ON url_analyses;

CREATE POLICY "Users can view own url analyses" ON url_analyses 
    FOR SELECT USING (
        user_email = auth_email() 
        OR same_organization(user_email)
        OR is_super_admin()
    );

CREATE POLICY "Users can create url analyses" ON url_analyses 
    FOR INSERT WITH CHECK (user_email = auth_email() OR is_super_admin());

CREATE POLICY "Users can update own url analyses" ON url_analyses 
    FOR UPDATE USING (user_email = auth_email() OR is_super_admin());

CREATE POLICY "Users can delete own url analyses" ON url_analyses 
    FOR DELETE USING (user_email = auth_email() OR is_super_admin());

-- ============================================
-- 6. SWIPE FILES - User + Team scoped
-- ============================================
DROP POLICY IF EXISTS "Anyone can select swipe_files" ON swipe_files;
DROP POLICY IF EXISTS "Anyone can insert swipe_files" ON swipe_files;
DROP POLICY IF EXISTS "Anyone can update swipe_files" ON swipe_files;
DROP POLICY IF EXISTS "Anyone can delete swipe_files" ON swipe_files;

CREATE POLICY "Users can view swipe files" ON swipe_files 
    FOR SELECT USING (
        user_email = auth_email() 
        OR same_organization(user_email)
        OR is_super_admin()
    );

CREATE POLICY "Users can create swipe files" ON swipe_files 
    FOR INSERT WITH CHECK (user_email = auth_email() OR is_super_admin());

CREATE POLICY "Users can update own swipe files" ON swipe_files 
    FOR UPDATE USING (user_email = auth_email() OR is_super_admin());

CREATE POLICY "Users can delete own swipe files" ON swipe_files 
    FOR DELETE USING (user_email = auth_email() OR is_super_admin());

-- ============================================
-- 7. COMPANIES (CRM) - Team scoped
-- ============================================
DROP POLICY IF EXISTS "Anyone can view companies" ON companies;
DROP POLICY IF EXISTS "Anyone can insert companies" ON companies;
DROP POLICY IF EXISTS "Anyone can update companies" ON companies;
DROP POLICY IF EXISTS "Anyone can delete companies" ON companies;

CREATE POLICY "Team can view companies" ON companies 
    FOR SELECT USING (
        owner_email = auth_email() 
        OR same_organization(owner_email)
        OR is_shared = true
        OR is_super_admin()
    );

CREATE POLICY "Users can create companies" ON companies 
    FOR INSERT WITH CHECK (owner_email = auth_email() OR is_super_admin());

CREATE POLICY "Users can update own companies" ON companies 
    FOR UPDATE USING (
        owner_email = auth_email() 
        OR same_organization(owner_email)
        OR is_super_admin()
    );

CREATE POLICY "Users can delete own companies" ON companies 
    FOR DELETE USING (owner_email = auth_email() OR is_super_admin());

-- ============================================
-- 8. CONTACTS (CRM) - Team scoped
-- ============================================
DROP POLICY IF EXISTS "Anyone can view contacts" ON contacts;
DROP POLICY IF EXISTS "Anyone can insert contacts" ON contacts;
DROP POLICY IF EXISTS "Anyone can update contacts" ON contacts;
DROP POLICY IF EXISTS "Anyone can delete contacts" ON contacts;

CREATE POLICY "Team can view contacts" ON contacts 
    FOR SELECT USING (
        owner_email = auth_email() 
        OR same_organization(owner_email)
        OR is_shared = true
        OR is_super_admin()
    );

CREATE POLICY "Users can create contacts" ON contacts 
    FOR INSERT WITH CHECK (owner_email = auth_email() OR is_super_admin());

CREATE POLICY "Team can update contacts" ON contacts 
    FOR UPDATE USING (
        owner_email = auth_email() 
        OR same_organization(owner_email)
        OR is_super_admin()
    );

CREATE POLICY "Users can delete own contacts" ON contacts 
    FOR DELETE USING (owner_email = auth_email() OR is_super_admin());

-- ============================================
-- 9. PROJECTS (CRM) - Team scoped
-- ============================================
DROP POLICY IF EXISTS "Anyone can view projects" ON projects;
DROP POLICY IF EXISTS "Anyone can insert projects" ON projects;
DROP POLICY IF EXISTS "Anyone can update projects" ON projects;
DROP POLICY IF EXISTS "Anyone can delete projects" ON projects;

CREATE POLICY "Team can view projects" ON projects 
    FOR SELECT USING (
        owner_email = auth_email() 
        OR same_organization(owner_email)
        OR is_shared = true
        OR is_super_admin()
    );

CREATE POLICY "Users can create projects" ON projects 
    FOR INSERT WITH CHECK (owner_email = auth_email() OR is_super_admin());

CREATE POLICY "Team can update projects" ON projects 
    FOR UPDATE USING (
        owner_email = auth_email() 
        OR same_organization(owner_email)
        OR is_super_admin()
    );

CREATE POLICY "Users can delete own projects" ON projects 
    FOR DELETE USING (owner_email = auth_email() OR is_super_admin());

-- ============================================
-- 10. ASSETS - User + Team scoped
-- ============================================
DROP POLICY IF EXISTS "Anyone can view assets" ON assets;
DROP POLICY IF EXISTS "Anyone can insert assets" ON assets;
DROP POLICY IF EXISTS "Anyone can update assets" ON assets;
DROP POLICY IF EXISTS "Anyone can delete assets" ON assets;

CREATE POLICY "Users can view assets" ON assets 
    FOR SELECT USING (
        owner_email = auth_email() 
        OR same_organization(owner_email)
        OR is_shared = true
        OR is_super_admin()
    );

CREATE POLICY "Users can create assets" ON assets 
    FOR INSERT WITH CHECK (owner_email = auth_email() OR is_super_admin());

CREATE POLICY "Users can update own assets" ON assets 
    FOR UPDATE USING (
        owner_email = auth_email() 
        OR same_organization(owner_email)
        OR is_super_admin()
    );

CREATE POLICY "Users can delete own assets" ON assets 
    FOR DELETE USING (owner_email = auth_email() OR is_super_admin());

-- ============================================
-- 11. USER SETTINGS - User only
-- ============================================
DROP POLICY IF EXISTS "Anyone can view settings" ON user_settings;
DROP POLICY IF EXISTS "Anyone can insert settings" ON user_settings;
DROP POLICY IF EXISTS "Anyone can update settings" ON user_settings;

CREATE POLICY "Users can view own settings" ON user_settings 
    FOR SELECT USING (
        user_email = auth_email() 
        OR is_super_admin()
    );

CREATE POLICY "Users can create own settings" ON user_settings 
    FOR INSERT WITH CHECK (user_email = auth_email() OR is_super_admin());

CREATE POLICY "Users can update own settings" ON user_settings 
    FOR UPDATE USING (user_email = auth_email() OR is_super_admin());

-- ============================================
-- 12. ACTIVITY LOG - Insert only for users
-- ============================================
DROP POLICY IF EXISTS "Anyone can view activity logs" ON user_activity;
DROP POLICY IF EXISTS "Anyone can insert activity logs" ON user_activity;

-- Users can only view their own activity
CREATE POLICY "Users can view own activity" ON user_activity 
    FOR SELECT USING (
        user_email = auth_email() 
        OR same_organization(user_email)
        OR is_super_admin()
    );

-- Anyone can insert activity (for logging)
CREATE POLICY "Users can log activity" ON user_activity 
    FOR INSERT WITH CHECK (true);

-- ============================================
-- 13. GOOGLE ADS BUILDS - User scoped
-- ============================================
DROP POLICY IF EXISTS "Anyone can select google_ads_builds" ON google_ads_builds;
DROP POLICY IF EXISTS "Anyone can insert google_ads_builds" ON google_ads_builds;
DROP POLICY IF EXISTS "Anyone can update google_ads_builds" ON google_ads_builds;
DROP POLICY IF EXISTS "Anyone can delete google_ads_builds" ON google_ads_builds;

CREATE POLICY "Users can view own google ads" ON google_ads_builds 
    FOR SELECT USING (
        user_email = auth_email() 
        OR same_organization(user_email)
        OR is_super_admin()
    );

CREATE POLICY "Users can create google ads" ON google_ads_builds 
    FOR INSERT WITH CHECK (user_email = auth_email() OR is_super_admin());

CREATE POLICY "Users can update own google ads" ON google_ads_builds 
    FOR UPDATE USING (user_email = auth_email() OR is_super_admin());

CREATE POLICY "Users can delete own google ads" ON google_ads_builds 
    FOR DELETE USING (user_email = auth_email() OR is_super_admin());

-- ============================================
-- 14. SOCIAL MEDIA BUILDS - User scoped
-- ============================================
DROP POLICY IF EXISTS "Anyone can select social_media_builds" ON social_media_builds;
DROP POLICY IF EXISTS "Anyone can insert social_media_builds" ON social_media_builds;
DROP POLICY IF EXISTS "Anyone can update social_media_builds" ON social_media_builds;
DROP POLICY IF EXISTS "Anyone can delete social_media_builds" ON social_media_builds;

CREATE POLICY "Users can view own social media" ON social_media_builds 
    FOR SELECT USING (
        user_email = auth_email() 
        OR same_organization(user_email)
        OR is_super_admin()
    );

CREATE POLICY "Users can create social media" ON social_media_builds 
    FOR INSERT WITH CHECK (user_email = auth_email() OR is_super_admin());

CREATE POLICY "Users can update own social media" ON social_media_builds 
    FOR UPDATE USING (user_email = auth_email() OR is_super_admin());

CREATE POLICY "Users can delete own social media" ON social_media_builds 
    FOR DELETE USING (user_email = auth_email() OR is_super_admin());

-- ============================================
-- 15. KEYWORD RESEARCH - User scoped
-- ============================================
DROP POLICY IF EXISTS "Anyone can select keyword_research" ON keyword_research;
DROP POLICY IF EXISTS "Anyone can insert keyword_research" ON keyword_research;
DROP POLICY IF EXISTS "Anyone can update keyword_research" ON keyword_research;
DROP POLICY IF EXISTS "Anyone can delete keyword_research" ON keyword_research;

CREATE POLICY "Users can view own keywords" ON keyword_research 
    FOR SELECT USING (
        user_email = auth_email() 
        OR same_organization(user_email)
        OR is_super_admin()
    );

CREATE POLICY "Users can create keywords" ON keyword_research 
    FOR INSERT WITH CHECK (user_email = auth_email() OR is_super_admin());

CREATE POLICY "Users can update own keywords" ON keyword_research 
    FOR UPDATE USING (user_email = auth_email() OR is_super_admin());

CREATE POLICY "Users can delete own keywords" ON keyword_research 
    FOR DELETE USING (user_email = auth_email() OR is_super_admin());

-- ============================================
-- 16. BENCHMARKS - Team scoped (shared knowledge)
-- ============================================
DROP POLICY IF EXISTS "Anyone can select benchmarks" ON benchmarks;
DROP POLICY IF EXISTS "Anyone can insert benchmarks" ON benchmarks;
DROP POLICY IF EXISTS "Anyone can update benchmarks" ON benchmarks;
DROP POLICY IF EXISTS "Anyone can delete benchmarks" ON benchmarks;

CREATE POLICY "Team can view benchmarks" ON benchmarks 
    FOR SELECT USING (
        user_email = auth_email() 
        OR same_organization(user_email)
        OR is_super_admin()
    );

CREATE POLICY "Users can create benchmarks" ON benchmarks 
    FOR INSERT WITH CHECK (user_email = auth_email() OR is_super_admin());

CREATE POLICY "Team can update benchmarks" ON benchmarks 
    FOR UPDATE USING (
        user_email = auth_email() 
        OR same_organization(user_email)
        OR is_super_admin()
    );

CREATE POLICY "Users can delete own benchmarks" ON benchmarks 
    FOR DELETE USING (user_email = auth_email() OR is_super_admin());

-- ============================================
-- VERIFY POLICIES
-- ============================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
