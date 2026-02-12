/**
 * Supabase Backend Integration for Creative Asset Validator
 * Version: 1.0.0
 * 
 * This module provides real-time sync and persistent storage using Supabase.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a free account at https://supabase.com
 * 2. Create a new project
 * 3. Go to Settings > API and copy your URL and anon key
 * 4. Update SUPABASE_URL and SUPABASE_ANON_KEY below
 * 5. Run the SQL schema in your Supabase SQL Editor (see bottom of this file)
 */

(function() {
    'use strict';

    // ============================================
    // CONFIGURATION - UPDATE THESE VALUES
    // ============================================
    const SUPABASE_URL = 'https://fgqubdsievdhawaihshz.supabase.co'; // e.g., 'https://xxxxx.supabase.co'
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZncXViZHNpZXZkaGF3YWloc2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MjAzODgsImV4cCI6MjA4NDE5NjM4OH0.ukNLfqAfLIuB8KgT4OdbYyzZcJf8UTTS60Mav2bGm8A'; // From Settings > API

    // Check if Supabase is configured
    const isConfigured = () => {
        return SUPABASE_URL !== 'YOUR_SUPABASE_URL' && 
               SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
    };

    // ============================================
    // SUPABASE CLIENT
    // ============================================
    let supabase = null;

    async function initSupabase() {
        if (!isConfigured()) {
            console.warn('[Supabase] Not configured. Using local storage only.');
            return null;
        }

        // Load Supabase client library if not already loaded
        if (!window.supabase) {
            await loadSupabaseLibrary();
        }

        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('[Supabase] ✅ Client initialized');
        
        // Set up auth state listener
        supabase.auth.onAuthStateChange((event, session) => {
            console.log('[Supabase] Auth state changed:', event);
            if (session) {
                window.supabaseSession = session;
                // Sync local data to cloud on login
                syncLocalToCloud();
            }
        });

        return supabase;
    }

    async function loadSupabaseLibrary() {
        return new Promise((resolve, reject) => {
            if (window.supabase) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // ============================================
    // AUTHENTICATION
    // ============================================
    
    // Sign in with Google (integrates with existing Google OAuth)
    async function signInWithGoogle(googleCredential) {
        if (!supabase) return { error: 'Supabase not initialized' };
        
        try {
            const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: googleCredential
            });
            
            if (error) throw error;
            
            console.log('[Supabase] ✅ Signed in with Google');
            return { data };
        } catch (error) {
            console.error('[Supabase] Google sign-in error:', error);
            return { error };
        }
    }

    // Get current user - works with both Supabase Auth and Google Sign-In
    async function getCurrentUser() {
        if (!supabase) {
            console.warn('[Supabase] Client not initialized');
            return null;
        }
        
        try {
            // First try Supabase Auth
            const { data, error } = await supabase.auth.getUser();
            
            if (!error && data?.user) {
                // Return Supabase auth user
                return { data: { user: data.user } };
            }
            
            // Fallback to Google Sign-In session (cavUserSession)
            const googleSession = window.cavUserSession || 
                                  window.CAVSecurity?.SecureSessionManager?.getSession();
            
            if (googleSession?.email) {
                // Return a user-like object from Google Sign-In
                return { 
                    data: { 
                        user: {
                            id: null, // No Supabase auth.uid() for Google Sign-In
                            email: googleSession.email,
                            user_metadata: {
                                name: googleSession.name,
                                full_name: googleSession.name,
                                avatar_url: googleSession.picture
                            }
                        }
                    },
                    source: 'google_signin'
                };
            }
            
            if (error) {
                // Only log if we have no fallback
                console.log('[Supabase] No auth session, using user_email for queries');
            }
            
            return null;
        } catch (e) {
            console.warn('[Supabase] Exception getting user:', e.message);
            return null;
        }
    }
    
    // Get current user email - works with both auth methods
    // ROBUST: Checks multiple sources to ensure we always get the current user
    function getCurrentUserEmail() {
        try {
            // 1. Check window.cavUserSession (set after Google Sign-In)
            if (window.cavUserSession?.email) {
                return window.cavUserSession.email;
            }
            
            // 2. Check CAVSecurity SecureSessionManager
            const secureSession = window.CAVSecurity?.SecureSessionManager?.getSession?.();
            if (secureSession?.email) {
                return secureSession.email;
            }
            
            // 3. Check localStorage cav_session (encrypted session)
            try {
                const cavSession = JSON.parse(localStorage.getItem('cav_session') || 'null');
                if (cavSession?.email) {
                    return cavSession.email;
                }
            } catch (e) {}
            
            // 4. Check localStorage cav_user_session (plain session)
            try {
                const userSession = JSON.parse(localStorage.getItem('cav_user_session') || 'null');
                if (userSession?.email) {
                    return userSession.email;
                }
            } catch (e) {}
            
            // 5. Check localStorage cav_auth_session (auth session)
            try {
                const authSession = JSON.parse(localStorage.getItem('cav_auth_session') || 'null');
                if (authSession?.email) {
                    return authSession.email;
                }
            } catch (e) {}
            
            // 6. Check localStorage cav_secure_session_v3 (secure session)
            try {
                const secureSession = JSON.parse(localStorage.getItem('cav_secure_session_v3') || 'null');
                if (secureSession?.email) {
                    return secureSession.email;
                }
            } catch (e) {}
            
            // 7. Check localStorage cav_last_user_email (fallback)
            const lastEmail = localStorage.getItem('cav_last_user_email');
            if (lastEmail && lastEmail !== 'anonymous') {
                return lastEmail;
            }
            
            return null;
        } catch (e) {
            console.warn('[Supabase] Error getting user email:', e);
            return null;
        }
    }

    // ============================================
    // SHARED API KEYS (Encrypted)
    // ============================================
    
    // Simple encryption for API keys (use a proper encryption library in production)
    function encryptKey(key, salt) {
        // Basic XOR encryption - replace with AES in production
        const encoded = btoa(key);
        return encoded.split('').map((c, i) => 
            String.fromCharCode(c.charCodeAt(0) ^ salt.charCodeAt(i % salt.length))
        ).join('');
    }

    function decryptKey(encrypted, salt) {
        const decrypted = encrypted.split('').map((c, i) => 
            String.fromCharCode(c.charCodeAt(0) ^ salt.charCodeAt(i % salt.length))
        ).join('');
        return atob(decrypted);
    }

    // Save shared API keys (admin only)
    async function saveSharedKeys(keys, organizationId) {
        if (!supabase) {
            // Fallback to localStorage
            localStorage.setItem('cav_platform_credentials', JSON.stringify({
                sharedKeys: keys,
                sharing: { enabled: true }
            }));
            return { success: true, source: 'local' };
        }

        try {
            const user = await getCurrentUser();
            if (!user?.data?.user) throw new Error('Not authenticated');

            // Encrypt keys before storing
            const salt = user.data.user.id;
            const encryptedKeys = {};
            for (const [provider, key] of Object.entries(keys)) {
                if (key) {
                    encryptedKeys[provider] = encryptKey(key, salt);
                }
            }

            const { error } = await supabase
                .from('shared_api_keys')
                .upsert({
                    organization_id: organizationId || 'default',
                    admin_user_id: user.data.user.id,
                    encrypted_keys: encryptedKeys,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'organization_id'
                });

            if (error) throw error;

            console.log('[Supabase] ✅ Shared keys saved');
            return { success: true, source: 'cloud' };
        } catch (error) {
            console.error('[Supabase] Error saving shared keys:', error);
            // Fallback to localStorage
            localStorage.setItem('cav_platform_credentials', JSON.stringify({
                sharedKeys: keys,
                sharing: { enabled: true }
            }));
            return { success: true, source: 'local', error };
        }
    }

    // Load shared API keys (for team members)
    async function loadSharedKeys(organizationId) {
        if (!supabase) {
            // Fallback to localStorage
            const local = JSON.parse(localStorage.getItem('cav_platform_credentials') || '{}');
            return local.sharedKeys || {};
        }

        try {
            const user = await getCurrentUser();
            if (!user?.data?.user) return {};

            const { data, error } = await supabase
                .from('shared_api_keys')
                .select('*')
                .eq('organization_id', organizationId || 'default')
                .single();

            if (error) throw error;
            if (!data) return {};

            // Decrypt keys
            const salt = data.admin_user_id;
            const decryptedKeys = {};
            for (const [provider, encrypted] of Object.entries(data.encrypted_keys || {})) {
                try {
                    decryptedKeys[provider] = decryptKey(encrypted, salt);
                } catch (e) {
                    console.warn(`[Supabase] Could not decrypt ${provider} key`);
                }
            }

            console.log('[Supabase] ✅ Shared keys loaded');
            return decryptedKeys;
        } catch (error) {
            console.error('[Supabase] Error loading shared keys:', error);
            // Fallback to localStorage
            const local = JSON.parse(localStorage.getItem('cav_platform_credentials') || '{}');
            return local.sharedKeys || {};
        }
    }

    // Subscribe to real-time key updates
    function subscribeToSharedKeys(organizationId, callback) {
        if (!supabase) return null;

        const subscription = supabase
            .channel('shared_keys_changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'shared_api_keys',
                filter: `organization_id=eq.${organizationId || 'default'}`
            }, (payload) => {
                console.log('[Supabase] Shared keys updated in real-time');
                loadSharedKeys(organizationId).then(callback);
            })
            .subscribe();

        return subscription;
    }

    // ============================================
    // CRM DATA SYNC
    // ============================================
    
    // Save company
    async function saveCompany(company) {
        // Always save to local sync engine first for reliability
        if (window.syncEngine?.saveCompany) {
            await window.syncEngine.saveCompany(company).catch(e => 
                console.warn('[Supabase] Local save failed:', e)
            );
        }
        
        if (!supabase) {
            console.log('[Supabase] Not initialized, saved locally only');
            return { success: true, source: 'local' };
        }

        try {
            const user = await getCurrentUser();
            const userId = user?.data?.user?.id;
            const userEmail = user?.data?.user?.email || getCurrentUserEmail();
            
            // Must have at least user_email to save to cloud
            if (!userId && !userEmail) {
                console.warn('[Supabase] No user credentials, saved locally only');
                return { success: true, source: 'local' };
            }
            
            // Build upsert data with snake_case column names
            const upsertData = {
                uuid: company.uuid || company.id,
                name: company.name,
                industry: company.industry || null,
                website: company.website || null,
                logo_url: company.logoUrl || company.logo_url || null,
                description: company.description || null,
                type: company.type || 'client',
                tags: company.tags || [],
                is_shared: company.isShared || company.is_shared || false,
                // JSONB fields - Supabase handles objects automatically
                metadata: company.metadata || {},
                enriched_data: company.enrichedData || company.enriched_data || {},
                strategy_insights: company.strategyInsights || company.strategy_insights || {},
                chat_history: company.chatHistory || company.chat_history || [],
                benchmarks: company.benchmarks || [],
                best_practices: company.bestPractices || company.best_practices || [],
                competitors: company.competitors || [],
                ai_analyses: company.aiAnalyses || company.ai_analyses || [],
                notes_list: company.notesList || company.notes_list || [],
                linked_assets: company.linkedAssets || company.linked_assets || [],
                sharing: company.sharing || {},
                // User info
                user_email: userEmail,
                owner_email: userEmail,
                updated_at: new Date().toISOString()
            };
            
            // Only include user_id if we have it (from Supabase Auth)
            if (userId) {
                upsertData.user_id = userId;
            }
            
            console.log('[Supabase] Saving company:', upsertData.name, 'uuid:', upsertData.uuid);
            
            const { error } = await supabase
                .from('companies')
                .upsert(upsertData, {
                    onConflict: 'uuid'
                });

            if (error) throw error;
            console.log('[Supabase] ✅ Company saved to cloud:', company.name);
            return { success: true, source: 'cloud' };
        } catch (error) {
            console.error('[Supabase] Cloud save error (data saved locally):', error.message);
            return { success: true, source: 'local', error: error.message };
        }
    }

    // Get all companies
    async function getCompanies() {
        // First try local for speed
        const localCompanies = await window.syncEngine?.getAllCompanies() || [];
        
        if (!supabase) {
            return localCompanies;
        }

        try {
            const user = await getCurrentUser();
            const userId = user?.data?.user?.id;
            const userEmail = user?.data?.user?.email || getCurrentUserEmail();
            
            // Must have at least user_email to query
            if (!userId && !userEmail) {
                console.log('[Supabase] No user credentials, using local data');
                return localCompanies;
            }
            
            // Build query based on available credentials
            let query = supabase
                .from('companies')
                .select('*')
                .is('deleted_at', null)
                .order('created_at', { ascending: false });
            
            // Filter by user - use user_id if available, otherwise user_email
            if (userId) {
                query = query.or(`user_id.eq.${userId},is_shared.eq.true`);
            } else if (userEmail) {
                query = query.or(`user_email.eq.${userEmail},is_shared.eq.true`);
            }
            
            const { data, error } = await query;

            if (error) throw error;
            
            // Parse JSON fields back to objects
            const parsed = (data || []).map(company => {
                const jsonFields = ['enrichedData', 'strategyInsights', 'aiAnalyses', 'chatHistory', 
                                   'benchmarks', 'bestPractices', 'competitors', 'sharing', 'metadata'];
                jsonFields.forEach(field => {
                    if (company[field] && typeof company[field] === 'string') {
                        try {
                            company[field] = JSON.parse(company[field]);
                        } catch (e) {}
                    }
                });
                return company;
            });
            
            // Merge with local - cloud takes precedence
            const mergedMap = new Map();
            localCompanies.forEach(c => mergedMap.set(c.uuid || c.id, c));
            parsed.forEach(c => mergedMap.set(c.uuid || c.id, c));
            
            console.log(`[Supabase] Loaded ${parsed.length} companies from cloud`);
            return Array.from(mergedMap.values());
        } catch (error) {
            console.error('[Supabase] Error getting companies:', error.message);
            return localCompanies;
        }
    }

    // Save contact
    async function saveContact(contact) {
        if (!supabase) {
            return window.syncEngine?.saveContact(contact);
        }

        try {
            const user = await getCurrentUser();
            const userId = user?.data?.user?.id;
            const userEmail = user?.data?.user?.email || getCurrentUserEmail();
            
            const upsertData = {
                ...contact,
                user_email: userEmail,
                updated_at: new Date().toISOString()
            };
            if (userId) upsertData.user_id = userId;
            
            const { error } = await supabase
                .from('contacts')
                .upsert(upsertData, { onConflict: 'uuid' });

            if (error) throw error;
            console.log('[Supabase] ✅ Contact saved to cloud');
            return { success: true };
        } catch (error) {
            console.warn('[Supabase] Contact save error:', error.message);
            return window.syncEngine?.saveContact(contact);
        }
    }

    // Get all contacts
    async function getContacts() {
        const localContacts = window.syncEngine?.getAllContacts() || [];
        
        if (!supabase) {
            return localContacts;
        }

        try {
            const user = await getCurrentUser();
            const userId = user?.data?.user?.id;
            const userEmail = user?.data?.user?.email || getCurrentUserEmail();
            
            if (!userId && !userEmail) {
                return localContacts;
            }
            
            let query = supabase
                .from('contacts')
                .select('*')
                .is('deleted_at', null);
            
            if (userId) {
                query = query.or(`user_id.eq.${userId},is_shared.eq.true`);
            } else if (userEmail) {
                query = query.eq('user_email', userEmail);
            }
            
            const { data, error } = await query;

            if (error) throw error;
            
            // Merge with local
            const mergedMap = new Map();
            localContacts.forEach(c => mergedMap.set(c.uuid || c.id, c));
            (data || []).forEach(c => mergedMap.set(c.uuid || c.id, c));
            
            return Array.from(mergedMap.values());
        } catch (error) {
            return localContacts;
        }
    }

    // Save project
    async function saveProject(project) {
        if (!supabase) {
            return window.syncEngine?.saveProject(project);
        }

        try {
            const user = await getCurrentUser();
            const userId = user?.data?.user?.id;
            const userEmail = user?.data?.user?.email || getCurrentUserEmail();
            
            const upsertData = {
                ...project,
                user_email: userEmail,
                updated_at: new Date().toISOString()
            };
            if (userId) upsertData.user_id = userId;
            
            const { error } = await supabase
                .from('projects')
                .upsert(upsertData, { onConflict: 'uuid' });

            if (error) throw error;
            console.log('[Supabase] ✅ Project saved to cloud');
            return { success: true };
        } catch (error) {
            console.warn('[Supabase] Project save error:', error.message);
            return window.syncEngine?.saveProject(project);
        }
    }

    // Get all projects
    async function getProjects() {
        const localProjects = window.syncEngine?.getAllProjects() || [];
        
        if (!supabase) {
            return localProjects;
        }

        try {
            const user = await getCurrentUser();
            const userId = user?.data?.user?.id;
            const userEmail = user?.data?.user?.email || getCurrentUserEmail();
            
            if (!userId && !userEmail) {
                return localProjects;
            }
            
            let query = supabase
                .from('projects')
                .select('*')
                .is('deleted_at', null);
            
            if (userId) {
                query = query.or(`user_id.eq.${userId},is_shared.eq.true`);
            } else if (userEmail) {
                query = query.eq('user_email', userEmail);
            }
            
            const { data, error } = await query;

            if (error) throw error;
            return data || [];
        } catch (error) {
            return window.syncEngine?.getAllProjects() || [];
        }
    }

    // ============================================
    // USER ACTIVITY LOGGING
    // ============================================
    
    async function logUserActivity(activity) {
        if (!supabase) {
            // Store in localStorage
            const logs = JSON.parse(localStorage.getItem('cav_user_activity') || '[]');
            logs.push({ ...activity, timestamp: new Date().toISOString() });
            localStorage.setItem('cav_user_activity', JSON.stringify(logs.slice(-1000))); // Keep last 1000
            return;
        }

        try {
            const user = await getCurrentUser();
            const userEmail = user?.data?.user?.email || getCurrentUserEmail() || 'anonymous';
            
            await supabase.from('user_activity').insert({
                user_id: user?.data?.user?.id,
                user_email: userEmail,
                owner_email: userEmail,
                action: activity.action,
                details: activity.details,
                ip_address: activity.ip,
                user_agent: navigator.userAgent,
                created_at: new Date().toISOString()
            });
        } catch (error) {
            console.warn('[Supabase] Error logging activity:', error);
        }
    }

    async function getUserActivityLogs(limit = 100) {
        if (!supabase) {
            return JSON.parse(localStorage.getItem('cav_user_activity') || '[]').slice(-limit);
        }

        try {
            const { data, error } = await supabase
                .from('user_activity')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            return JSON.parse(localStorage.getItem('cav_user_activity') || '[]').slice(-limit);
        }
    }

    // ============================================
    // SETTINGS SYNC
    // ============================================
    
    async function saveSettings(settings) {
        if (!supabase) {
            localStorage.setItem('cav_v3_settings', JSON.stringify(settings));
            return { success: true, source: 'local' };
        }

        try {
            const user = await getCurrentUser();
            if (!user?.data?.user) {
                localStorage.setItem('cav_v3_settings', JSON.stringify(settings));
                return { success: true, source: 'local' };
            }

            const { error } = await supabase
                .from('user_settings')
                .upsert({
                    user_id: user.data.user.id,
                    settings: settings,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id'
                });

            if (error) throw error;
            
            // Also save locally for offline access
            localStorage.setItem('cav_v3_settings', JSON.stringify(settings));
            
            return { success: true, source: 'cloud' };
        } catch (error) {
            localStorage.setItem('cav_v3_settings', JSON.stringify(settings));
            return { success: true, source: 'local', error };
        }
    }

    async function loadSettings() {
        const localSettings = JSON.parse(localStorage.getItem('cav_v3_settings') || '{}');
        
        if (!supabase) {
            return localSettings;
        }

        try {
            const user = await getCurrentUser();
            const userId = user?.data?.user?.id;
            const userEmail = user?.data?.user?.email || getCurrentUserEmail();
            
            if (!userId && !userEmail) return localSettings;

            // Query by user_id if available, otherwise by user_email
            let query = supabase.from('user_settings').select('settings, data');
            if (userId) {
                query = query.eq('user_id', userId);
            } else {
                query = query.eq('user_email', userEmail);
            }
            
            const { data, error } = await query.maybeSingle();

            if (error || !data) return localSettings;

            // Merge cloud settings with local (cloud takes precedence)
            const cloudSettings = data.settings || data.data || {};
            const merged = { ...localSettings, ...cloudSettings };
            localStorage.setItem('cav_v3_settings', JSON.stringify(merged));
            
            return merged;
        } catch (error) {
            return localSettings;
        }
    }

    // ============================================
    // DATA MIGRATION (localStorage → Supabase)
    // ============================================
    
    async function syncLocalToCloud() {
        if (!supabase) return;

        console.log('[Supabase] Starting local → cloud sync...');

        try {
            // Sync companies
            const localCompanies = await window.syncEngine?.getAllCompanies() || [];
            for (const company of localCompanies) {
                await saveCompany(company);
            }

            // Sync contacts
            const localContacts = await window.syncEngine?.getAllContacts() || [];
            for (const contact of localContacts) {
                await saveContact(contact);
            }

            // Sync projects
            const localProjects = await window.syncEngine?.getAllProjects() || [];
            for (const project of localProjects) {
                await saveProject(project);
            }

            // Sync settings
            const localSettings = JSON.parse(localStorage.getItem('cav_v3_settings') || '{}');
            if (Object.keys(localSettings).length > 0) {
                await saveSettings(localSettings);
            }

            console.log('[Supabase] ✅ Local → cloud sync complete');
        } catch (error) {
            console.error('[Supabase] Sync error:', error);
        }
    }

    // ============================================
    // EXPORT API
    // ============================================
    
    // ============================================
    // DIAGNOSTIC TOOL
    // ============================================
    
    async function runDiagnostics() {
        console.log('═══════════════════════════════════════════');
        console.log('   CAV SUPABASE DIAGNOSTICS');
        console.log('═══════════════════════════════════════════');
        
        const results = {
            configured: isConfigured(),
            connected: false,
            authenticated: false,
            canReadKeys: false,
            canWriteKeys: false,
            tablesExist: false,
            errors: []
        };
        
        // 1. Check configuration
        console.log('\n📋 Configuration:');
        console.log(`   URL: ${SUPABASE_URL.substring(0, 30)}...`);
        console.log(`   Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
        console.log(`   Configured: ${results.configured ? '✅ Yes' : '❌ No'}`);
        
        if (!results.configured) {
            results.errors.push('Supabase not configured');
            return results;
        }
        
        // 2. Check connection
        console.log('\n🔌 Connection:');
        try {
            if (!supabase) await initSupabase();
            const { data, error } = await supabase.from('shared_api_keys').select('count').limit(1);
            if (error && error.code === '42P01') {
                console.log('   ❌ Tables not created - run the SQL schema');
                results.errors.push('Tables not created');
            } else if (error) {
                console.log(`   ❌ Connection error: ${error.message}`);
                results.errors.push(error.message);
            } else {
                console.log('   ✅ Connected to Supabase');
                results.connected = true;
                results.tablesExist = true;
            }
        } catch (e) {
            console.log(`   ❌ Connection failed: ${e.message}`);
            results.errors.push(e.message);
        }
        
        // 3. Check authentication
        console.log('\n🔐 Authentication:');
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                console.log(`   ✅ Authenticated as: ${user.email}`);
                results.authenticated = true;
            } else {
                console.log('   ⚠️ Not authenticated (anonymous access)');
                console.log('   → Users can still read shared keys');
                console.log('   → To enable full sync, set up Google Auth in Supabase');
            }
        } catch (e) {
            console.log(`   ⚠️ Auth check: ${e.message}`);
        }
        
        // 4. Check shared keys
        console.log('\n🔑 Shared Keys:');
        try {
            const { data, error } = await supabase
                .from('shared_api_keys')
                .select('*')
                .eq('organization_id', 'default');
            
            if (error) {
                console.log(`   ❌ Cannot read: ${error.message}`);
            } else if (data && data.length > 0) {
                console.log(`   ✅ Found shared keys for organization`);
                console.log(`   Providers configured: ${Object.keys(data[0].encrypted_keys || {}).join(', ') || 'none'}`);
                results.canReadKeys = true;
            } else {
                console.log('   ⚠️ No shared keys saved yet');
                console.log('   → Go to Settings > API Sharing to configure');
            }
        } catch (e) {
            console.log(`   ❌ Error: ${e.message}`);
        }
        
        // 5. Check localStorage fallback
        console.log('\n💾 Local Storage:');
        const localCreds = JSON.parse(localStorage.getItem('cav_platform_credentials') || '{}');
        const localKeys = localCreds.sharedKeys || {};
        console.log(`   Local shared keys: ${Object.keys(localKeys).filter(k => localKeys[k]).join(', ') || 'none'}`);
        console.log(`   Sharing enabled: ${localCreds.sharing?.enabled ? 'Yes' : 'No'}`);
        
        // 6. Summary
        console.log('\n═══════════════════════════════════════════');
        console.log('   SUMMARY');
        console.log('═══════════════════════════════════════════');
        
        if (results.connected && results.tablesExist) {
            console.log('✅ Supabase is ready for cloud sync!');
            if (!results.canReadKeys) {
                console.log('→ Save your API keys in Settings > API Sharing');
            }
        } else if (results.configured) {
            console.log('⚠️ Supabase configured but not fully connected');
            console.log('→ Check if tables are created');
            console.log('→ Check Supabase dashboard for errors');
        } else {
            console.log('❌ Using local storage only (no cloud sync)');
        }
        
        console.log('\n═══════════════════════════════════════════\n');
        
        return results;
    }
    
    // ============================================
    // DIRECT SAVE (NO AUTH REQUIRED)
    // ============================================
    
    // Save shared keys directly (for admin use without full auth)
    async function saveSharedKeysDirect(keys, organizationId = 'default') {
        if (!supabase) {
            await initSupabase();
        }
        
        if (!supabase) {
            console.error('[Supabase] Cannot initialize client');
            return { success: false, error: 'Supabase not initialized' };
        }
        
        try {
            // Get admin email from session
            const adminEmail = window.cavUserSession?.email || 'unknown';
            
            const { data, error } = await supabase
                .from('shared_api_keys')
                .upsert({
                    organization_id: organizationId,
                    admin_user_id: null, // Anonymous save
                    encrypted_keys: keys, // Store keys (consider encryption for production)
                    allowed_domains: [],
                    allowed_emails: [],
                    is_global_share: true,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'organization_id'
                })
                .select();

            if (error) {
                console.error('[Supabase] Save error:', error);
                return { success: false, error: error.message };
            }
            
            console.log('[Supabase] ✅ Shared keys saved directly');
            return { success: true, data };
        } catch (e) {
            console.error('[Supabase] Exception:', e);
            return { success: false, error: e.message };
        }
    }
    
    // Load shared keys directly (no auth required)
    async function loadSharedKeysDirect(organizationId = 'default') {
        if (!supabase) {
            await initSupabase();
        }
        
        if (!supabase) {
            return { success: false, keys: {} };
        }
        
        try {
            // Use maybeSingle() instead of single() to avoid 406 errors when no rows exist
            const { data, error } = await supabase
                .from('shared_api_keys')
                .select('encrypted_keys')
                .eq('organization_id', organizationId)
                .maybeSingle();

            if (error) {
                // Handle common errors gracefully
                if (error.code === 'PGRST116' || error.code === '406' || error.message?.includes('406')) {
                    // No rows found - not an error
                    return { success: true, keys: {} };
                }
                // Table doesn't exist yet
                if (error.code === '42P01' || error.message?.includes('does not exist')) {
                    console.warn('[Supabase] shared_api_keys table not created yet');
                    return { success: true, keys: {} };
                }
                console.error('[Supabase] Load error:', error);
                return { success: false, keys: {}, error: error.message };
            }
            
            // data can be null if no rows match
            if (!data) {
                return { success: true, keys: {} };
            }
            
            console.log('[Supabase] ✅ Shared keys loaded');
            return { success: true, keys: data.encrypted_keys || {} };
        } catch (e) {
            console.error('[Supabase] Exception:', e);
            return { success: false, keys: {}, error: e.message };
        }
    }

    // ============================================
    // GENERIC ENTITY OPERATIONS
    // ============================================
    
    // Prepare entity data for Supabase - filter out problematic fields
    function prepareEntityData(data) {
        const prepared = { ...data };
        
        // Fields that commonly cause schema errors (don't exist in DB)
        // These get stored in metadata instead
        const problematicFields = [
            // Video analysis fields
            'adCopySuggestions', 'ad_copy_suggestions', 'benchmarkComparison', 'benchmark_comparison',
            'analysis', 'frames', 'transcript', 'keyMoments', 'key_moments',
            'sceneBreakdown', 'scene_breakdown', 'emotionalArc', 'emotional_arc',
            'brandMentions', 'brand_mentions', 'competitorMentions', 'competitor_mentions',
            'callToActions', 'call_to_actions', 'hooks', 'audienceSignals', 'audience_signals',
            'rawAIResponse', 'raw_ai_response',
            // URL/Creative analysis fields
            'creativeSummary', 'creative_summary', 'analyzed_at', 'analyzedAt',
            'hookAnalysis', 'messageArchitecture', 'message_architecture',
            'visualStrategy', 'visual_strategy', 'ctaEvaluation', 'cta_evaluation',
            'platformOptimization', 'platform_optimization',
            'performanceIndicators', 'performance_indicators',
            'takeaways', 'comparisonResult', 'comparison_result',
            'extractedBenchmarks', 'extracted_benchmarks',
            'detectedCompetitor', 'detected_competitor', 'sources', 'savedToSwipeFile',
            'colorPalette', 'color_palette', 'imageMetrics', 'image_metrics',
            // Swipe file fields
            'collections', 'isCompetitor', 'is_competitor', 'swipeEntries', 'swipe_entries',
            // Benchmark fields
            'lastUpdated', 'last_updated', 'dataPoints', 'data_points',
            // General
            'enrichedData', 'enriched_data', 'strategyInsights', 'strategy_insights',
            'aiAnalyses', 'ai_analyses', 'rawResponse', 'raw_response',
            // Asset-specific fields that may not exist in schema
            'cloudinary_data', 'cloudinaryData', 'videoFrames', 'video_frames',
            'extractedText', 'extracted_text', 'ocrResults', 'ocr_results',
            'video_url', 'has_video_blob', 'user_key', 'team_key', 'user_domain',
            'comments', 'history', 'channels', 'validations', 'aiDescription', 'aiSubject',
            'targetChannel', 'targetSize', 'targetRatio', 'aiModel', 'folderId', 'projectId',
            'contactId', 'category', 'orientation', 'aiGenerated', 'is_ai_derivative',
            'sourceAssetId', 'sourceFilename', 'createdBy', 'derivativeId',
            // Local-only fields
            'needs_sync', 'dataUrl', 'imageData', 'thumbnail_data', 'localOnly',
            'file_url', 'blob_url', 'data_url'
        ];
        
        // Initialize metadata if needed
        if (!prepared.metadata || typeof prepared.metadata !== 'object') {
            prepared.metadata = {};
        }
        if (typeof prepared.metadata === 'string') {
            try { prepared.metadata = JSON.parse(prepared.metadata); } catch (e) { prepared.metadata = {}; }
        }
        
        // Move problematic fields to metadata
        problematicFields.forEach(field => {
            if (prepared[field] !== undefined) {
                prepared.metadata[field] = prepared[field];
                delete prepared[field];
            }
        });
        
        // Stringify metadata
        if (Object.keys(prepared.metadata).length > 0) {
            prepared.metadata = JSON.stringify(prepared.metadata);
        } else {
            prepared.metadata = '{}';
        }
        
        return prepared;
    }
    
    async function saveEntity(table, data) {
        if (!supabase) await initSupabase();
        if (!supabase) return { success: false, error: 'Not initialized' };
        
        try {
            // Get user email for Google Sign-In (uses robust multi-source check)
            const userEmail = getCurrentUserEmail() || 'anonymous';
            
            // Tables that should INSERT only (no upsert - no uuid column)
            const insertOnlyTables = [
                'activity_log', 'activities', 'api_key_usage', 
                'video_frames', 'video_transcript_segments', 'contact_activities',
                'video_chat_messages'
            ];
            
            // Prepare data - filter out problematic fields that don't exist in schema
            const saveData = prepareEntityData(data);
            delete saveData.id; // Always remove id - let Supabase auto-generate
            
            // Add user identification
            saveData.user_email = userEmail;
            saveData.owner_email = userEmail;
            saveData.updated_at = new Date().toISOString();
            
            // For insert-only tables, just insert
            if (insertOnlyTables.includes(table)) {
                const { data: result, error } = await supabase
                    .from(table)
                    .insert(saveData)
                    .select();
                
                if (error) return { success: false, error: error.message };
                return { success: true, data: result };
            }
            
            // For upsert tables, determine conflict column
            let onConflictColumn = 'uuid';
            if (table === 'user_api_keys' || table === 'api_keys') {
                onConflictColumn = 'uuid';
            } else if (table === 'user_settings') {
                onConflictColumn = 'uuid';
            } else if (table === 'profiles') {
                onConflictColumn = 'email';
            } else if (table === 'user_state') {
                onConflictColumn = 'user_email';
            }
            
            const { data: result, error } = await supabase
                .from(table)
                .upsert(saveData, { onConflict: onConflictColumn })
                .select();
            
            if (error) return { success: false, error: error.message };
            return { success: true, data: result };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }
    
    async function getEntities(table, options = {}) {
        if (!supabase) await initSupabase();
        if (!supabase) return [];
        
        try {
            let query = supabase.from(table).select('*');
            
            // Check if table has deleted_at column (most tables do)
            const tablesWithSoftDelete = [
                'companies', 'contacts', 'projects', 'deals', 'strategies', 
                'creative_analyses', 'url_analyses', 'swipe_file', 'best_practices',
                'competitor_analyses', 'benchmarks', 'competitors', 'assets',
                'google_ads_campaigns', 'social_media_campaigns', 'keyword_research',
                'google_ads_builds', 'social_media_builds', 'swipe_files'
            ];
            if (tablesWithSoftDelete.includes(table)) {
                query = query.is('deleted_at', null);
            }
            
            // Apply standard filters
            if (options.owner_email) {
                query = query.eq('owner_email', options.owner_email);
            }
            if (options.company_id) {
                query = query.eq('company_id', options.company_id);
            }
            if (options.is_shared) {
                query = query.or(`owner_email.eq.${options.owner_email},is_shared.eq.true`);
            }
            
            // Apply custom filters (e.g., { filter: { contact_id: '123' } })
            if (options.filter && typeof options.filter === 'object') {
                for (const [key, value] of Object.entries(options.filter)) {
                    if (value !== undefined && value !== null) {
                        query = query.eq(key, value);
                    }
                }
            }
            
            // Apply ordering
            const orderBy = options.orderBy || 'created_at';
            const ascending = options.orderDesc === true ? false : false; // Default desc
            query = query.order(orderBy, { ascending });
            
            // Apply limit
            if (options.limit) {
                query = query.limit(options.limit);
            }
            
            const { data, error } = await query;
            
            if (error) {
                console.warn(`[Supabase] Error fetching ${table}:`, error);
                return [];
            }
            return data || [];
        } catch (e) {
            console.warn(`[Supabase] Exception fetching ${table}:`, e);
            return [];
        }
    }
    
    async function deleteEntity(table, uuid) {
        if (!supabase) await initSupabase();
        if (!supabase) return { success: false };
        
        try {
            const { error } = await supabase
                .from(table)
                .update({ deleted_at: new Date().toISOString() })
                .eq('uuid', uuid);
            
            if (error) return { success: false, error: error.message };
            return { success: true };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }
    
    // Specific entity helpers
    async function saveDeal(data) { return saveEntity('deals', data); }
    async function getDeals() { return getEntities('deals'); }
    async function deleteDeal(uuid) { return deleteEntity('deals', uuid); }
    
    async function saveStrategy(data) { return saveEntity('strategies', data); }
    async function getStrategies() { return getEntities('strategies'); }
    async function deleteStrategy(uuid) { return deleteEntity('strategies', uuid); }
    
    async function saveCreativeAnalysis(data) { return saveEntity('creative_analyses', data); }
    async function getCreativeAnalyses() { return getEntities('creative_analyses'); }
    async function deleteCreativeAnalysis(uuid) { return deleteEntity('creative_analyses', uuid); }
    
    async function saveUrlAnalysis(data) { return saveEntity('url_analyses', data); }
    async function getUrlAnalyses() { return getEntities('url_analyses'); }
    
    async function saveGeneratedAd(data) { return saveEntity('generated_ads', data); }
    async function getGeneratedAds(filters) { return getEntities('generated_ads', filters); }
    
    async function saveProductFeed(data) { return saveEntity('product_feeds', data); }
    async function getProductFeeds() { return getEntities('product_feeds'); }
    
    // Google Ads Campaigns
    async function saveGoogleAdsCampaign(data) { return saveEntity('google_ads_campaigns', data); }
    async function getGoogleAdsCampaigns() { return getEntities('google_ads_campaigns'); }
    async function deleteGoogleAdsCampaign(uuid) { return deleteEntity('google_ads_campaigns', uuid); }
    
    // Social Media Campaigns
    async function saveSocialMediaCampaign(data) { return saveEntity('social_media_campaigns', data); }
    async function getSocialMediaCampaigns() { return getEntities('social_media_campaigns'); }
    async function deleteSocialMediaCampaign(uuid) { return deleteEntity('social_media_campaigns', uuid); }
    
    // Swipe File
    async function saveSwipeEntry(data) { return saveEntity('swipe_file', data); }
    async function getSwipeFile() { return getEntities('swipe_file'); }
    async function deleteSwipeEntry(uuid) { return deleteEntity('swipe_file', uuid); }
    
    // Best Practices
    async function saveBestPractice(data) { return saveEntity('best_practices', data); }
    async function getBestPractices() { return getEntities('best_practices'); }
    
    // Competitor Analyses
    async function saveCompetitorAnalysis(data) { return saveEntity('competitor_analyses', data); }
    async function getCompetitorAnalyses() { return getEntities('competitor_analyses'); }
    
    // URL Analysis History
    async function saveUrlHistory(data) { return saveEntity('url_analysis_history', data); }
    async function getUrlHistory() { return getEntities('url_analysis_history'); }
    
    // User Notifications
    async function saveNotification(data) { return saveEntity('user_notifications', data); }
    async function getNotifications(userEmail) { 
        return getEntities('user_notifications', { owner_email: userEmail }); 
    }
    async function markNotificationRead(uuid) {
        if (!supabase) return { success: false };
        try {
            const { error } = await supabase
                .from('user_notifications')
                .update({ is_read: true })
                .eq('uuid', uuid);
            return { success: !error };
        } catch (e) {
            return { success: false };
        }
    }
    
    // Integration Credentials
    async function saveIntegrationCredentials(data) { return saveEntity('integration_credentials', data); }
    async function getIntegrationCredentials(orgId = 'default') {
        if (!supabase) await initSupabase();
        if (!supabase) return [];
        try {
            const { data, error } = await supabase
                .from('integration_credentials')
                .select('*')
                .eq('organization_id', orgId)
                .eq('is_active', true);
            return data || [];
        } catch (e) {
            return [];
        }
    }

    // ============================================
    // CRM ACTIVITIES & ADDITIONAL TABLES
    // ============================================
    
    // Activities (CRM activity tracking)
    async function saveActivity(data) { return saveEntity('activities', data); }
    async function getActivities(limit = 100) { 
        return getEntities('activities', { limit, orderBy: 'created_at', orderDesc: true }); 
    }
    
    // Activity Log (general logging)
    async function saveActivityLog(data) { return saveEntity('activity_log', data); }
    async function getActivityLog(limit = 100) { 
        return getEntities('activity_log', { limit, orderBy: 'logged_at', orderDesc: true }); 
    }
    
    // Competitors (CRM competitors)
    async function saveCompetitor(data) { return saveEntity('competitors', data); }
    async function getCompetitors() { return getEntities('competitors'); }
    async function deleteCompetitor(uuid) { return deleteEntity('competitors', uuid); }
    
    // Tags
    async function saveTag(data) { return saveEntity('tags', data); }
    async function getTags() { return getEntities('tags'); }
    async function deleteTag(uuid) { return deleteEntity('tags', uuid); }
    
    // Custom Fields
    async function saveCustomField(data) { return saveEntity('custom_fields', data); }
    async function getCustomFields() { return getEntities('custom_fields'); }
    async function deleteCustomField(uuid) { return deleteEntity('custom_fields', uuid); }
    
    // Brand Profiles
    async function saveBrandProfile(data) { return saveEntity('brand_profiles', data); }
    async function getBrandProfiles() { return getEntities('brand_profiles'); }
    async function deleteBrandProfile(uuid) { return deleteEntity('brand_profiles', uuid); }
    
    // Brands
    async function saveBrand(data) { return saveEntity('brands', data); }
    async function getBrands() { return getEntities('brands'); }
    async function deleteBrand(uuid) { return deleteEntity('brands', uuid); }
    
    // Assets
    async function saveAsset(data) { return saveEntity('assets', data); }
    async function getAssets() { return getEntities('assets'); }
    async function deleteAsset(uuid) { return deleteEntity('assets', uuid); }
    
    // Validations
    async function saveValidation(data) { return saveEntity('validations', data); }
    async function getValidations() { return getEntities('validations'); }
    
    // Auto Fix History
    async function saveAutoFixHistory(data) { return saveEntity('auto_fix_history', data); }
    async function getAutoFixHistory() { return getEntities('auto_fix_history'); }
    
    // AI Studio History
    async function saveAIStudioHistory(data) { return saveEntity('ai_studio_history', data); }
    async function getAIStudioHistory() { return getEntities('ai_studio_history'); }
    
    // Keyword Research
    async function saveKeywordResearch(data) { return saveEntity('keyword_research', data); }
    async function getKeywordResearch() { return getEntities('keyword_research'); }
    
    // Google Ads Builds
    async function saveGoogleAdsBuild(data) { return saveEntity('google_ads_builds', data); }
    async function getGoogleAdsBuilds() { return getEntities('google_ads_builds'); }
    
    // Social Media Builds
    async function saveSocialMediaBuild(data) { return saveEntity('social_media_builds', data); }
    async function getSocialMediaBuilds() { return getEntities('social_media_builds'); }
    
    // Contact Activities
    async function saveContactActivity(data) { return saveEntity('contact_activities', data); }
    async function getContactActivities(contactId) { 
        return getEntities('contact_activities', { filter: { contact_id: contactId } }); 
    }
    
    // Benchmarks
    async function saveBenchmark(data) { return saveEntity('benchmarks', data); }
    async function getBenchmarks() { return getEntities('benchmarks'); }
    
    // API Key Usage (tracking)
    async function saveAPIKeyUsage(data) { return saveEntity('api_key_usage', data); }
    async function getAPIKeyUsage(limit = 100) { 
        return getEntities('api_key_usage', { limit, orderBy: 'created_at', orderDesc: true }); 
    }
    
    // Video Frames (child of video_analyses)
    async function saveVideoFrame(data) { return saveEntity('video_frames', data); }
    async function getVideoFrames(videoAnalysisId) { 
        return getEntities('video_frames', { filter: { video_analysis_id: videoAnalysisId } }); 
    }
    
    // Video Transcript Segments (child of video_analyses)
    async function saveTranscriptSegment(data) { return saveEntity('video_transcript_segments', data); }
    async function getTranscriptSegments(videoAnalysisId) { 
        return getEntities('video_transcript_segments', { filter: { video_analysis_id: videoAnalysisId } }); 
    }
    
    // Swipe Files (plural - different from swipe_file)
    async function saveSwipeFile(data) { return saveEntity('swipe_files', data); }
    async function getSwipeFiles() { return getEntities('swipe_files'); }

    window.CAVSupabase = {
        init: initSupabase,
        isConfigured,
        
        // Expose client for advanced use
        _client: supabase,
        getClient: () => supabase,
        
        // Diagnostics
        runDiagnostics,
        
        // Auth
        signInWithGoogle,
        getCurrentUser,
        getCurrentUserEmail,
        
        // Shared Keys (with auth)
        saveSharedKeys,
        loadSharedKeys,
        subscribeToSharedKeys,
        
        // Shared Keys (direct - no auth required)
        saveSharedKeysDirect,
        loadSharedKeysDirect,
        
        // Generic entity operations
        saveEntity,
        getEntities,
        deleteEntity,
        
        // CRM - Companies
        saveCompany,
        getCompanies,
        
        // CRM - Contacts
        saveContact,
        getContacts,
        
        // CRM - Projects
        saveProject,
        getProjects,
        
        // CRM - Deals/Briefs
        saveDeal,
        getDeals,
        deleteDeal,
        
        // Strategies
        saveStrategy,
        getStrategies,
        deleteStrategy,
        
        // Creative Analyses
        saveCreativeAnalysis,
        getCreativeAnalyses,
        deleteCreativeAnalysis,
        
        // URL/Keyword Analyses
        saveUrlAnalysis,
        getUrlAnalyses,
        
        // Generated Ads (Google/Social)
        saveGeneratedAd,
        getGeneratedAds,
        
        // Product Feeds (Merchant Center)
        saveProductFeed,
        getProductFeeds,
        
        // Google Ads Campaigns
        saveGoogleAdsCampaign,
        getGoogleAdsCampaigns,
        deleteGoogleAdsCampaign,
        
        // Social Media Campaigns
        saveSocialMediaCampaign,
        getSocialMediaCampaigns,
        deleteSocialMediaCampaign,
        
        // Swipe File (Learn Module)
        saveSwipeEntry,
        getSwipeFile,
        deleteSwipeEntry,
        
        // Best Practices
        saveBestPractice,
        getBestPractices,
        
        // Competitor Analyses
        saveCompetitorAnalysis,
        getCompetitorAnalyses,
        
        // URL Analysis History
        saveUrlHistory,
        getUrlHistory,
        
        // Notifications
        saveNotification,
        getNotifications,
        markNotificationRead,
        
        // Integration Credentials
        saveIntegrationCredentials,
        getIntegrationCredentials,
        
        // Activity (user_activity table)
        logUserActivity,
        getUserActivityLogs,
        
        // Settings
        saveSettings,
        loadSettings,
        
        // Migration
        syncLocalToCloud,
        
        // ============================================
        // NEW: All Additional Tables
        // ============================================
        
        // CRM Activities (activities table)
        saveActivity,
        getActivities,
        
        // Activity Log (activity_log table)
        saveActivityLog,
        getActivityLog,
        
        // CRM Competitors
        saveCompetitor,
        getCompetitors,
        deleteCompetitor,
        
        // Tags
        saveTag,
        getTags,
        deleteTag,
        
        // Custom Fields
        saveCustomField,
        getCustomFields,
        deleteCustomField,
        
        // Brand Profiles
        saveBrandProfile,
        getBrandProfiles,
        deleteBrandProfile,
        
        // Brands
        saveBrand,
        getBrands,
        deleteBrand,
        
        // Assets
        saveAsset,
        getAssets,
        deleteAsset,
        
        // Validations
        saveValidation,
        getValidations,
        
        // Auto Fix History
        saveAutoFixHistory,
        getAutoFixHistory,
        
        // AI Studio History
        saveAIStudioHistory,
        getAIStudioHistory,
        
        // Keyword Research
        saveKeywordResearch,
        getKeywordResearch,
        
        // Google Ads Builds
        saveGoogleAdsBuild,
        getGoogleAdsBuilds,
        
        // Social Media Builds
        saveSocialMediaBuild,
        getSocialMediaBuilds,
        
        // Contact Activities
        saveContactActivity,
        getContactActivities,
        
        // Benchmarks
        saveBenchmark,
        getBenchmarks,
        
        // API Key Usage
        saveAPIKeyUsage,
        getAPIKeyUsage,
        
        // Video Frames
        saveVideoFrame,
        getVideoFrames,
        
        // Video Transcript Segments
        saveTranscriptSegment,
        getTranscriptSegments,
        
        // Swipe Files (plural)
        saveSwipeFile,
        getSwipeFiles
    };

    // Auto-initialize if configured
    if (isConfigured()) {
        initSupabase().then(() => {
            console.log('[Supabase] Ready for use');
        });
    } else {
        console.log('[Supabase] Not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY to enable cloud sync.');
    }

    console.log('☁️ Supabase Backend Module loaded - Version 1.0.0');

})();

/*
============================================
SUPABASE SQL SCHEMA
============================================
Run this in your Supabase SQL Editor to create the required tables:

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Shared API Keys (for team sharing)
CREATE TABLE shared_api_keys (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id TEXT NOT NULL UNIQUE,
    admin_user_id UUID REFERENCES auth.users(id),
    encrypted_keys JSONB DEFAULT '{}',
    allowed_domains TEXT[] DEFAULT '{}',
    allowed_emails TEXT[] DEFAULT '{}',
    is_global_share BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Companies
CREATE TABLE companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    uuid TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    industry TEXT,
    website TEXT,
    logo_url TEXT,
    description TEXT,
    is_shared BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Contacts
CREATE TABLE contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    uuid TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    company_id TEXT REFERENCES companies(uuid),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    role TEXT,
    is_shared BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Projects
CREATE TABLE projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    uuid TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    company_id TEXT REFERENCES companies(uuid),
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    description TEXT,
    is_shared BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- User Settings
CREATE TABLE user_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Activity Logs
CREATE TABLE user_activity (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    user_email TEXT,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets
CREATE TABLE assets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    uuid TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    company_id TEXT,
    project_id TEXT,
    filename TEXT NOT NULL,
    file_url TEXT,
    thumbnail_url TEXT,
    file_type TEXT,
    file_size INTEGER,
    dimensions JSONB,
    analysis JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    is_shared BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Row Level Security (RLS) Policies
ALTER TABLE shared_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Policies for shared_api_keys
CREATE POLICY "Users can read shared keys from their org" ON shared_api_keys
    FOR SELECT USING (true); -- Anyone authenticated can read

CREATE POLICY "Admins can manage shared keys" ON shared_api_keys
    FOR ALL USING (auth.uid() = admin_user_id);

-- Policies for companies (users see their own + shared)
CREATE POLICY "Users can view own and shared companies" ON companies
    FOR SELECT USING (user_id = auth.uid() OR is_shared = true);

CREATE POLICY "Users can manage own companies" ON companies
    FOR ALL USING (user_id = auth.uid());

-- Similar policies for other tables...
CREATE POLICY "Users can view own and shared contacts" ON contacts
    FOR SELECT USING (user_id = auth.uid() OR is_shared = true);
CREATE POLICY "Users can manage own contacts" ON contacts
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view own and shared projects" ON projects
    FOR SELECT USING (user_id = auth.uid() OR is_shared = true);
CREATE POLICY "Users can manage own projects" ON projects
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage own settings" ON user_settings
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view activity logs" ON user_activity
    FOR SELECT USING (true);
CREATE POLICY "Users can insert activity logs" ON user_activity
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own and shared assets" ON assets
    FOR SELECT USING (user_id = auth.uid() OR is_shared = true);
CREATE POLICY "Users can manage own assets" ON assets
    FOR ALL USING (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX idx_companies_user ON companies(user_id);
CREATE INDEX idx_contacts_user ON contacts(user_id);
CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_assets_user ON assets(user_id);
CREATE INDEX idx_user_activity_user ON user_activity(user_id);
CREATE INDEX idx_user_activity_created ON user_activity(created_at DESC);

*/
