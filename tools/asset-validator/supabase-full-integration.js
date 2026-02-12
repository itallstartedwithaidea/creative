/**
 * Supabase Full Integration - Wires Supabase into ALL app components
 * Version: 1.0.0
 * 
 * This module connects Supabase to:
 * - CRM (companies, contacts, projects, deals)
 * - Assets
 * - User sessions & activity
 * - Team collaboration
 * - Domain admin key sharing
 */

(function() {
    'use strict';

    console.log('[Supabase Integration] Loading full integration...');

    // Wait for both CAVSupabase and app to be ready
    let initAttempts = 0;
    const maxAttempts = 20;

    function waitForDependencies() {
        initAttempts++;
        
        if (!window.CAVSupabase?.isConfigured?.()) {
            if (initAttempts < maxAttempts) {
                setTimeout(waitForDependencies, 500);
            } else {
                console.warn('[Supabase Integration] CAVSupabase not available after timeout');
            }
            return;
        }

        console.log('[Supabase Integration] ✅ Dependencies ready, initializing...');
        initializeFullIntegration();
    }

    async function initializeFullIntegration() {
        // 1. Load shared keys on startup
        await loadSharedKeysOnStartup();
        
        // 2. Hook into CRM operations
        hookIntoCRM();
        
        // 3. Hook into asset operations
        hookIntoAssets();
        
        // 4. Hook into Ad Builders
        hookIntoAdBuilders();
        
        // 5. Hook into Learn Module
        hookIntoLearnModule();
        
        // 6. Hook into Keyword Analyzer
        hookIntoKeywordAnalyzer();
        
        // 7. Set up activity logging
        setupActivityLogging();
        
        // 8. Load user data from cloud
        await loadUserDataFromCloud();
        
        console.log('[Supabase Integration] ✅ Full integration complete!');
    }

    // ============================================
    // 1. SHARED KEYS ON STARTUP
    // ============================================
    
    async function loadSharedKeysOnStartup() {
        try {
            const result = await window.CAVSupabase.loadSharedKeysDirect('default');
            
            if (result.success && result.keys && Object.keys(result.keys).length > 0) {
                console.log('[Supabase Integration] ☁️ Loaded shared keys:', Object.keys(result.keys).join(', '));
                
                // Merge into local storage for immediate use
                const existing = JSON.parse(localStorage.getItem('cav_platform_credentials') || '{}');
                existing.sharedKeys = { ...existing.sharedKeys, ...result.keys };
                existing.sharing = { ...existing.sharing, enabled: true };
                localStorage.setItem('cav_platform_credentials', JSON.stringify(existing));
                
                // Also set in the v3 settings structure for modules that read from there
                const v3Settings = JSON.parse(localStorage.getItem('cav_v3_settings') || '{}');
                if (!v3Settings.apiKeys) v3Settings.apiKeys = {};
                
                // Only set if user doesn't have their own key
                for (const [provider, key] of Object.entries(result.keys)) {
                    if (!v3Settings.apiKeys[provider]?.key && key) {
                        v3Settings.apiKeys[provider] = { 
                            key: key, 
                            status: 'shared',
                            source: 'cloud'
                        };
                    }
                }
                localStorage.setItem('cav_v3_settings', JSON.stringify(v3Settings));
                
                console.log('[Supabase Integration] ✅ Shared keys merged into local storage');
            }
        } catch (e) {
            console.warn('[Supabase Integration] Could not load shared keys:', e);
        }
    }

    // ============================================
    // 2. CRM & ALL ENTITY INTEGRATION
    // ============================================
    
    function hookIntoCRM() {
        if (!window.syncEngine) {
            console.warn('[Supabase Integration] syncEngine not available yet');
            return;
        }
        
        // List of all entity types to hook
        const entityHooks = [
            { name: 'Company', method: 'saveCompany', table: 'companies' },
            { name: 'Contact', method: 'saveContact', table: 'contacts' },
            { name: 'Project', method: 'saveProject', table: 'projects' },
            { name: 'Deal', method: 'saveDeal', table: 'deals' },
            { name: 'Asset', method: 'saveAsset', table: 'assets' },
            { name: 'Strategy', method: 'saveStrategy', table: 'strategies' },
            { name: 'CreativeAnalysis', method: 'saveCreativeAnalysis', table: 'creative_analyses' }
        ];
        
        entityHooks.forEach(({ name, method, table }) => {
            const original = window.syncEngine[method]?.bind(window.syncEngine);
            
            if (original) {
                window.syncEngine[method] = async function(data) {
                    // Add owner email for filtering
                    data.owner_email = window.cavUserSession?.email || 'anonymous';
                    
                    // Save locally first
                    const localResult = await original(data);
                    
                    // Then sync to Supabase
                    syncToSupabase(table, data, name);
                    
                    return localResult;
                };
            }
        });
        
        // Also hook delete operations
        const deleteHooks = [
            { method: 'deleteCompany', table: 'companies' },
            { method: 'deleteContact', table: 'contacts' },
            { method: 'deleteProject', table: 'projects' },
            { method: 'deleteDeal', table: 'deals' },
            { method: 'deleteAsset', table: 'assets' },
            { method: 'deleteStrategy', table: 'strategies' },
            { method: 'deleteCreativeAnalysis', table: 'creative_analyses' }
        ];
        
        deleteHooks.forEach(({ method, table }) => {
            const original = window.syncEngine[method]?.bind(window.syncEngine);
            
            if (original) {
                window.syncEngine[method] = async function(uuid) {
                    // Delete locally first
                    const localResult = await original(uuid);
                    
                    // Soft delete in Supabase
                    softDeleteInSupabase(table, uuid);
                    
                    return localResult;
                };
            }
        });
        
        console.log('[Supabase Integration] ✅ All entity hooks installed');
    }
    
    // Generic sync function
    async function syncToSupabase(table, data, entityName) {
        if (!window.CAVSupabase?.isConfigured?.()) return;
        
        try {
            const supabase = await getSupabaseClient();
            if (!supabase) return;
            
            // Get current user - support both Supabase Auth and Google Sign-In
            const { data: userData, error: userError } = await supabase.auth.getUser();
            const userId = userData?.user?.id;
            const userEmail = userData?.user?.email || window.cavUserSession?.email;
            
            if (!userEmail) {
                console.warn(`[Supabase Integration] No user email, skipping cloud sync for ${entityName}`);
                return;
            }
            
            // Prepare data for Supabase
            const supabaseData = {
                ...data,
                user_email: userEmail,
                owner_email: userEmail,
                updated_at: new Date().toISOString()
            };
            
            // Only add user_id if available (Supabase Auth)
            if (userId) {
                supabaseData.user_id = userId;
            }
            
            // Remove local-only fields
            delete supabaseData.needs_sync;
            delete supabaseData.dataUrl; // Don't store base64 in DB
            delete supabaseData.imageData;
            delete supabaseData.thumbnail_data;
            
            // Convert complex objects to JSON strings for Supabase
            const jsonFields = [
                'analysis', 'metadata', 'enrichedData', 'strategyInsights', 
                'aiAnalyses', 'chatHistory', 'benchmarks', 'bestPractices', 
                'competitors', 'sharing', 'linkedAssets', 'content',
                'hook_analysis', 'cta_analysis', 'brand_compliance',
                'thumb_stop_score', 'performance_prediction', 'enhanced_analysis',
                'ab_test_recommendations', 'placement_matrix', 'derivative_ideas',
                'fatigue_prediction', 'recommendations', 'scores', 'results'
            ];
            
            jsonFields.forEach(field => {
                if (supabaseData[field] && typeof supabaseData[field] === 'object') {
                    supabaseData[field] = JSON.stringify(supabaseData[field]);
                }
            });
            
            const { error } = await supabase
                .from(table)
                .upsert(supabaseData, { onConflict: 'uuid' });
            
            if (error) {
                console.warn(`[Supabase Integration] ${entityName} sync error:`, error.message);
            } else {
                console.log(`[Supabase Integration] ☁️ ${entityName} synced:`, data.name || data.uuid);
            }
        } catch (e) {
            console.warn(`[Supabase Integration] ${entityName} sync failed:`, e.message);
        }
    }
    
    // Soft delete in Supabase
    async function softDeleteInSupabase(table, uuid) {
        if (!window.CAVSupabase?.isConfigured?.()) return;
        
        try {
            const supabase = await getSupabaseClient();
            if (!supabase) return;
            
            const { error } = await supabase
                .from(table)
                .update({ deleted_at: new Date().toISOString() })
                .eq('uuid', uuid);
            
            if (error) {
                console.warn(`[Supabase Integration] Delete sync error:`, error.message);
            } else {
                console.log(`[Supabase Integration] ☁️ Deleted ${table}:`, uuid);
            }
        } catch (e) {
            console.warn(`[Supabase Integration] Delete sync failed:`, e);
        }
    }
    
    // Parse JSON fields back to objects (for data loaded from Supabase)
    function parseJsonFields(data) {
        const jsonFields = [
            'analysis', 'metadata', 'enrichedData', 'strategyInsights', 
            'aiAnalyses', 'chatHistory', 'benchmarks', 'bestPractices', 
            'competitors', 'sharing', 'linkedAssets', 'content',
            'hook_analysis', 'cta_analysis', 'brand_compliance',
            'thumb_stop_score', 'performance_prediction', 'enhanced_analysis',
            'ab_test_recommendations', 'placement_matrix', 'derivative_ideas',
            'fatigue_prediction', 'recommendations', 'scores', 'results'
        ];
        
        jsonFields.forEach(field => {
            if (data[field] && typeof data[field] === 'string') {
                try {
                    data[field] = JSON.parse(data[field]);
                } catch (e) {
                    // Leave as string if parsing fails
                }
            }
        });
        
        return data;
    }
    
    // Get Supabase client
    async function getSupabaseClient() {
        if (!window.supabase) return null;
        
        // Initialize if needed
        if (!window._cavSupabaseClient) {
            const url = 'https://fgqubdsievdhawaihshz.supabase.co';
            const key = document.querySelector('script[src*="supabase-backend"]')?.dataset?.key;
            
            // Get from CAVSupabase module
            if (window.CAVSupabase?._client) {
                return window.CAVSupabase._client;
            }
            
            // Try to get from global
            try {
                const stored = localStorage.getItem('_supabase_client_ref');
                if (stored) {
                    return window.supabase.createClient(url, JSON.parse(stored).key);
                }
            } catch (e) {}
        }
        
        return window._cavSupabaseClient;
    }

    // ============================================
    // 3. ASSET INTEGRATION
    // ============================================
    
    function hookIntoAssets() {
        // Hook into asset save operations
        if (window.syncEngine) {
            const originalSaveAsset = window.syncEngine.saveAsset?.bind(window.syncEngine);
            
            if (originalSaveAsset) {
                window.syncEngine.saveAsset = async function(data) {
                    const localResult = await originalSaveAsset(data);
                    
                    // Sync asset metadata to Supabase (not the file itself)
                    try {
                        await saveAssetToSupabase(data);
                    } catch (e) {
                        console.warn('[Supabase Integration] Asset cloud sync failed:', e);
                    }
                    
                    return localResult;
                };
            }
            
            console.log('[Supabase Integration] ✅ Asset hooks installed');
        }
    }
    
    async function saveAssetToSupabase(asset) {
        if (!window.CAVSupabase?.isConfigured?.()) return;
        
        const supabase = window.CAVSupabase._getClient?.();
        if (!supabase) return;
        
        try {
            // Save asset metadata (not the actual file)
            const assetData = {
                uuid: asset.uuid,
                user_id: null, // Will be set if authenticated
                company_id: asset.company_id,
                project_id: asset.project_id,
                filename: asset.filename,
                file_url: asset.file_url || asset.thumbnail_url,
                thumbnail_url: asset.thumbnail_url,
                file_type: asset.type || asset.file_type,
                file_size: asset.size || asset.file_size,
                dimensions: asset.dimensions ? JSON.stringify(asset.dimensions) : null,
                analysis: asset.analysis ? JSON.stringify(asset.analysis) : null,
                tags: asset.tags || [],
                is_shared: asset.is_shared || false,
                metadata: JSON.stringify(asset.metadata || {}),
                updated_at: new Date().toISOString()
            };
            
            // This will work once we add the _getClient export
            console.log('[Supabase Integration] Asset metadata prepared for sync');
        } catch (e) {
            console.warn('[Supabase Integration] Asset save error:', e);
        }
    }

    // ============================================
    // 4. ACTIVITY LOGGING
    // ============================================
    
    function setupActivityLogging() {
        // Log page views
        logActivity('page_view', { page: window.location.pathname });
        
        // Log login
        if (window.cavUserSession?.email) {
            logActivity('login', { 
                email: window.cavUserSession.email,
                role: window.cavUserSession.role
            });
        }
        
        // Listen for important events
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (btn) {
                const action = btn.textContent?.trim().substring(0, 50);
                if (action && (
                    action.includes('Save') || 
                    action.includes('Delete') || 
                    action.includes('Generate') ||
                    action.includes('Analyze')
                )) {
                    logActivity('button_click', { action, page: window.location.pathname });
                }
            }
        });
        
        // Log navigation
        const originalPushState = history.pushState;
        history.pushState = function() {
            originalPushState.apply(this, arguments);
            logActivity('navigation', { to: arguments[2] });
        };
        
        console.log('[Supabase Integration] ✅ Activity logging enabled');
    }
    
    function logActivity(action, details) {
        if (window.CAVSupabase?.logUserActivity) {
            window.CAVSupabase.logUserActivity({ action, details });
        }
        
        // Also store locally for immediate access
        const logs = JSON.parse(localStorage.getItem('cav_user_activity') || '[]');
        logs.push({
            action,
            details,
            email: window.cavUserSession?.email || 'anonymous',
            timestamp: new Date().toISOString()
        });
        // Keep last 500 entries
        localStorage.setItem('cav_user_activity', JSON.stringify(logs.slice(-500)));
    }

    // ============================================
    // 5. LOAD USER DATA FROM CLOUD
    // ============================================
    
    async function loadUserDataFromCloud() {
        if (!window.CAVSupabase?.isConfigured?.()) return;
        
        try {
            // Load companies
            const companies = await window.CAVSupabase.getCompanies();
            if (companies?.length > 0) {
                console.log(`[Supabase Integration] ☁️ Loaded ${companies.length} companies from cloud`);
                for (const company of companies) {
                    // Parse JSON fields back to objects
                    parseJsonFields(company);
                    await saveToLocalOnly('companies', company);
                }
                
                // Reload CRM to pick up new data
                if (window.cavCRM?.reloadForCurrentUser) {
                    window.cavCRM.reloadForCurrentUser();
                }
            }
            
            // Load contacts
            const contacts = await window.CAVSupabase.getContacts();
            if (contacts?.length > 0) {
                console.log(`[Supabase Integration] ☁️ Loaded ${contacts.length} contacts from cloud`);
                for (const contact of contacts) {
                    await saveToLocalOnly('contacts', contact);
                }
            }
            
            // Load projects
            const projects = await window.CAVSupabase.getProjects();
            if (projects?.length > 0) {
                console.log(`[Supabase Integration] ☁️ Loaded ${projects.length} projects from cloud`);
                for (const project of projects) {
                    await saveToLocalOnly('projects', project);
                }
            }
            
            // Load deals
            const deals = await window.CAVSupabase.getDeals();
            if (deals?.length > 0) {
                console.log(`[Supabase Integration] ☁️ Loaded ${deals.length} deals from cloud`);
                for (const deal of deals) {
                    await saveToLocalOnly('deals', deal);
                }
            }
            
            // Load strategies
            const strategies = await window.CAVSupabase.getStrategies();
            if (strategies?.length > 0) {
                console.log(`[Supabase Integration] ☁️ Loaded ${strategies.length} strategies from cloud`);
                for (const strategy of strategies) {
                    await saveToLocalOnly('strategies', strategy);
                }
            }
            
            // Load Google Ads campaigns
            const gadsCampaigns = await window.CAVSupabase.getGoogleAdsCampaigns();
            if (gadsCampaigns?.length > 0) {
                console.log(`[Supabase Integration] ☁️ Loaded ${gadsCampaigns.length} Google Ads campaigns from cloud`);
                // Store in localStorage for Google Ads Builder
                localStorage.setItem('gads_campaigns', JSON.stringify(gadsCampaigns));
            }
            
            // Load Social Media campaigns
            const smbCampaigns = await window.CAVSupabase.getSocialMediaCampaigns();
            if (smbCampaigns?.length > 0) {
                console.log(`[Supabase Integration] ☁️ Loaded ${smbCampaigns.length} Social Media campaigns from cloud`);
                localStorage.setItem('smb_saved_campaigns', JSON.stringify(smbCampaigns));
            }
            
            // Load Swipe File
            const swipeFile = await window.CAVSupabase.getSwipeFile();
            if (swipeFile?.length > 0) {
                console.log(`[Supabase Integration] ☁️ Loaded ${swipeFile.length} swipe file entries from cloud`);
                localStorage.setItem('cav_swipe_file', JSON.stringify(swipeFile));
            }
            
            // Load Best Practices
            const bestPractices = await window.CAVSupabase.getBestPractices();
            if (bestPractices?.length > 0) {
                console.log(`[Supabase Integration] ☁️ Loaded ${bestPractices.length} best practices from cloud`);
                localStorage.setItem('cav_best_practices', JSON.stringify(bestPractices));
            }
            
            // Load Keyword Analyses
            const analyses = await window.CAVSupabase.getUrlAnalyses();
            if (analyses?.length > 0) {
                console.log(`[Supabase Integration] ☁️ Loaded ${analyses.length} keyword analyses from cloud`);
                localStorage.setItem('kwa_saved_analyses', JSON.stringify(analyses));
            }
            
            // Load Custom Avatar (for cross-device sync)
            await loadCustomAvatarFromCloud();
            
            console.log('[Supabase Integration] ✅ All user data loaded from cloud');
            
        } catch (e) {
            console.warn('[Supabase Integration] Could not load user data from cloud:', e);
        }
    }
    
    // Load custom avatar from cloud (cross-device sync)
    async function loadCustomAvatarFromCloud() {
        try {
            const userEmail = window.cavUserSession?.email;
            if (!userEmail) return;
            
            const avatarKey = `avatar_${userEmail.replace(/[^a-z0-9]/gi, '_')}`;
            const result = await window.CAVSupabase.supabase
                ?.from('user_settings')
                .select('data')
                .eq('uuid', avatarKey)
                .single();
            
            if (result?.data?.data?.avatar) {
                const cloudAvatar = result.data.data.avatar;
                const localAvatar = localStorage.getItem('cav_custom_avatar');
                
                // Only update if cloud has an avatar and local doesn't, or user explicitly changed
                if (cloudAvatar && !localAvatar) {
                    localStorage.setItem('cav_custom_avatar', cloudAvatar);
                    console.log('[Supabase Integration] ☁️ Custom avatar loaded from cloud');
                    
                    // Update UI immediately
                    const sidebarAvatar = document.getElementById('sidebar-user-avatar');
                    if (sidebarAvatar) sidebarAvatar.src = cloudAvatar;
                    const userAvatar = document.getElementById('user-avatar');
                    if (userAvatar) userAvatar.src = cloudAvatar;
                }
            }
        } catch (e) {
            // Silently fail - avatar is not critical
            console.log('[Supabase Integration] No custom avatar in cloud');
        }
    }
    
    // Save to local IndexedDB without triggering cloud sync
    async function saveToLocalOnly(entityType, data) {
        if (!window.syncEngine) return;
        
        try {
            const db = await window.syncEngine.getDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(entityType, 'readwrite');
                const store = tx.objectStore(entityType);
                const request = store.put(data);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (e) {
            console.warn(`[Supabase Integration] Could not save ${entityType} locally:`, e);
        }
    }

    // ============================================
    // 6. DOMAIN ADMIN KEY SHARING
    // ============================================
    
    // Get the organization ID for the current user's domain
    function getOrganizationId() {
        const email = window.cavUserSession?.email || '';
        const domain = email.split('@')[1] || 'default';
        return domain.replace(/\./g, '_'); // e.g., seerinteractive_com
    }
    
    // Save keys for domain admin (not just super admin)
    window.saveDomainAdminKeys = async function(keys) {
        const orgId = getOrganizationId();
        console.log(`[Supabase Integration] Saving keys for organization: ${orgId}`);
        
        const result = await window.CAVSupabase.saveSharedKeysDirect(keys, orgId);
        
        if (result.success) {
            console.log('[Supabase Integration] ✅ Domain admin keys saved');
        }
        
        return result;
    };
    
    // Load keys for current user's domain
    window.loadDomainKeys = async function() {
        const orgId = getOrganizationId();
        console.log(`[Supabase Integration] Loading keys for organization: ${orgId}`);
        
        // Try domain-specific first, then fall back to default
        let result = await window.CAVSupabase.loadSharedKeysDirect(orgId);
        
        if (!result.success || Object.keys(result.keys || {}).length === 0) {
            result = await window.CAVSupabase.loadSharedKeysDirect('default');
        }
        
        return result;
    };

    // ============================================
    // 7. TEAM COLLABORATION
    // ============================================
    
    // Share an item with team
    window.shareWithTeam = async function(entityType, uuid) {
        if (!window.CAVSupabase?.isConfigured?.()) {
            console.warn('Supabase not configured');
            return { success: false };
        }
        
        // Mark as shared in local storage
        if (window.syncEngine) {
            const item = await window.syncEngine.getFromLocal(entityType, uuid);
            if (item) {
                item.is_shared = true;
                await window.syncEngine.save(entityType, item);
                console.log(`[Supabase Integration] Shared ${entityType}:`, uuid);
                return { success: true };
            }
        }
        
        return { success: false };
    };
    
    // Get all shared items from team
    window.getTeamSharedItems = async function(entityType) {
        switch(entityType) {
            case 'companies':
                return await window.CAVSupabase.getCompanies();
            case 'contacts':
                return await window.CAVSupabase.getContacts();
            case 'projects':
                return await window.CAVSupabase.getProjects();
            default:
                return [];
        }
    };

    // ============================================
    // HOOK INTO AD BUILDERS
    // ============================================
    
    function hookIntoAdBuilders() {
        // Hook into Google Ads Builder
        if (window.GoogleAdsBuilder || window.GoogleAdsAIBuilder) {
            // Override localStorage for Google Ads campaigns
            const originalGadsSet = localStorage.setItem.bind(localStorage);
            const gadsProxy = new Proxy(localStorage, {
                set(target, prop, value) {
                    if (prop === 'setItem') return true;
                    target.setItem(prop, value);
                    
                    // Sync Google Ads campaigns to Supabase
                    if (prop === 'gads_campaigns') {
                        syncGoogleAdsCampaigns(value);
                    }
                    return true;
                }
            });
            
            // Intercept setItem for gads_campaigns
            const origSetItem = localStorage.setItem.bind(localStorage);
            localStorage.setItem = function(key, value) {
                origSetItem(key, value);
                if (key === 'gads_campaigns') {
                    syncGoogleAdsCampaigns(value);
                }
                if (key === 'smb_saved_campaigns') {
                    syncSocialMediaCampaigns(value);
                }
            };
            
            console.log('[Supabase Integration] ✅ Ad Builder hooks installed');
        }
    }
    
    async function syncGoogleAdsCampaigns(jsonValue) {
        if (!window.CAVSupabase?.isConfigured?.()) return;
        
        try {
            const campaigns = JSON.parse(jsonValue);
            for (const campaign of campaigns) {
                if (!campaign.uuid) campaign.uuid = crypto.randomUUID();
                await window.CAVSupabase.saveGoogleAdsCampaign(campaign);
            }
            console.log('[Supabase Integration] ☁️ Google Ads campaigns synced');
        } catch (e) {
            console.warn('[Supabase Integration] Google Ads sync error:', e);
        }
    }
    
    async function syncSocialMediaCampaigns(jsonValue) {
        if (!window.CAVSupabase?.isConfigured?.()) return;
        
        try {
            const campaigns = JSON.parse(jsonValue);
            for (const campaign of campaigns) {
                if (!campaign.uuid) campaign.uuid = crypto.randomUUID();
                await window.CAVSupabase.saveSocialMediaCampaign(campaign);
            }
            console.log('[Supabase Integration] ☁️ Social Media campaigns synced');
        } catch (e) {
            console.warn('[Supabase Integration] Social Media sync error:', e);
        }
    }
    
    // ============================================
    // HOOK INTO LEARN MODULE
    // ============================================
    
    function hookIntoLearnModule() {
        // Intercept localStorage for learn module data
        // NOTE: Learn module uses user-specific keys like cav_learn_john_example_com_swipe_file
        
        const origSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            origSetItem.call(localStorage, key, value);
            
            // Sync learn module data - match user-specific keys with patterns
            // Old format: cav_swipe_file, cav_best_practices, cav_benchmarks
            // New format: cav_learn_USER_swipe_file, cav_learn_USER_benchmarks, etc.
            
            if (key === 'cav_swipe_file' || key.includes('_swipe_file')) {
                syncSwipeFile(value);
            }
            if (key === 'cav_best_practices' || key.includes('_best_practices')) {
                syncBestPractices(value);
            }
            if (key === 'cav_benchmarks' || key.includes('_benchmarks')) {
                syncBenchmarks(value);
            }
            if (key.includes('_url_history') || key.includes('url_analyses')) {
                syncURLAnalyses(value);
            }
            if (key.includes('_competitors')) {
                syncCompetitors(value);
            }
            
            // Also sync analyze module data (creative analyses)
            // Format: cav_analyze_USER_history
            if (key.includes('_analyze_') && key.includes('_history')) {
                syncCreativeAnalyses(value);
            }
        };
        
        console.log('[Supabase Integration] ✅ Learn Module hooks installed (user-specific keys supported)');
    }
    
    async function syncSwipeFile(jsonValue) {
        if (!window.CAVSupabase?.isConfigured?.()) return;
        
        try {
            const entries = JSON.parse(jsonValue);
            for (const entry of entries.slice(0, 50)) { // Limit to 50
                if (!entry.uuid) entry.uuid = entry.id || crypto.randomUUID();
                await window.CAVSupabase.saveSwipeEntry(entry);
            }
            console.log('[Supabase Integration] ☁️ Swipe file synced');
        } catch (e) {
            console.warn('[Supabase Integration] Swipe file sync error:', e);
        }
    }
    
    async function syncBestPractices(jsonValue) {
        if (!window.CAVSupabase?.isConfigured?.()) return;
        
        try {
            const practices = JSON.parse(jsonValue);
            for (const practice of practices) {
                if (!practice.uuid) practice.uuid = practice.id || crypto.randomUUID();
                await window.CAVSupabase.saveBestPractice(practice);
            }
            console.log('[Supabase Integration] ☁️ Best practices synced');
        } catch (e) {
            console.warn('[Supabase Integration] Best practices sync error:', e);
        }
    }
    
    async function syncBenchmarks(jsonValue) {
        if (!window.CAVSupabase?.isConfigured?.()) return;
        
        try {
            const benchmarks = JSON.parse(jsonValue);
            for (const benchmark of benchmarks.slice(0, 100)) { // Limit to 100
                if (!benchmark.uuid) benchmark.uuid = benchmark.id || crypto.randomUUID();
                await window.CAVSupabase.saveBenchmark?.(benchmark);
            }
            console.log('[Supabase Integration] ☁️ Benchmarks synced');
        } catch (e) {
            console.warn('[Supabase Integration] Benchmarks sync error:', e);
        }
    }
    
    async function syncURLAnalyses(jsonValue) {
        if (!window.CAVSupabase?.isConfigured?.()) return;
        
        try {
            const analyses = JSON.parse(jsonValue);
            for (const analysis of analyses.slice(0, 100)) { // Limit to 100
                if (!analysis.uuid) analysis.uuid = analysis.id || crypto.randomUUID();
                // Use the correct function name: saveUrlAnalysis (not saveURLAnalysis)
                await window.CAVSupabase.saveUrlAnalysis?.(analysis);
            }
            console.log('[Supabase Integration] ☁️ URL analyses synced');
        } catch (e) {
            console.warn('[Supabase Integration] URL analyses sync error:', e);
        }
    }
    
    async function syncCompetitors(jsonValue) {
        if (!window.CAVSupabase?.isConfigured?.()) return;
        
        try {
            const competitors = JSON.parse(jsonValue);
            for (const competitor of competitors.slice(0, 50)) { // Limit to 50
                if (!competitor.uuid) competitor.uuid = competitor.id || crypto.randomUUID();
                await window.CAVSupabase.saveCompetitor?.(competitor);
            }
            console.log('[Supabase Integration] ☁️ Competitors synced');
        } catch (e) {
            console.warn('[Supabase Integration] Competitors sync error:', e);
        }
    }
    
    async function syncCreativeAnalyses(jsonValue) {
        if (!window.CAVSupabase?.isConfigured?.()) return;
        
        try {
            const analyses = JSON.parse(jsonValue);
            for (const analysis of analyses.slice(0, 100)) { // Limit to 100
                if (!analysis.uuid) analysis.uuid = analysis.id || analysis.assetId || crypto.randomUUID();
                await window.CAVSupabase.saveCreativeAnalysis?.(analysis);
            }
            console.log('[Supabase Integration] ☁️ Creative analyses synced');
        } catch (e) {
            console.warn('[Supabase Integration] Creative analyses sync error:', e);
        }
    }
    
    // ============================================
    // HOOK INTO KEYWORD ANALYZER
    // ============================================
    
    function hookIntoKeywordAnalyzer() {
        const origSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            origSetItem.call(localStorage, key, value);
            
            if (key === 'kwa_saved_analyses') {
                syncKeywordAnalyses(value);
            }
        };
        
        console.log('[Supabase Integration] ✅ Keyword Analyzer hooks installed');
    }
    
    async function syncKeywordAnalyses(jsonValue) {
        if (!window.CAVSupabase?.isConfigured?.()) return;
        
        try {
            const analyses = JSON.parse(jsonValue);
            for (const analysis of analyses.slice(0, 100)) {
                if (!analysis.uuid) analysis.uuid = analysis.id || crypto.randomUUID();
                await window.CAVSupabase.saveUrlAnalysis(analysis);
            }
            console.log('[Supabase Integration] ☁️ Keyword analyses synced');
        } catch (e) {
            console.warn('[Supabase Integration] Keyword analysis sync error:', e);
        }
    }
    
    // ============================================
    // 8. ADMIN ACTIVITY DASHBOARD DATA
    // ============================================
    
    window.getAdminActivityData = async function() {
        const logs = await window.CAVSupabase.getUserActivityLogs(500);
        
        // Group by user
        const byUser = {};
        logs.forEach(log => {
            const email = log.user_email || log.email || 'anonymous';
            if (!byUser[email]) {
                byUser[email] = {
                    email,
                    actions: [],
                    lastActive: log.created_at || log.timestamp,
                    totalActions: 0
                };
            }
            byUser[email].actions.push(log);
            byUser[email].totalActions++;
        });
        
        // Group by action type
        const byAction = {};
        logs.forEach(log => {
            const action = log.action || 'unknown';
            byAction[action] = (byAction[action] || 0) + 1;
        });
        
        return {
            totalLogs: logs.length,
            byUser: Object.values(byUser).sort((a, b) => b.totalActions - a.totalActions),
            byAction,
            recentLogs: logs.slice(0, 50)
        };
    };

    // ============================================
    // INITIALIZE
    // ============================================
    
    // Start initialization
    waitForDependencies();

    console.log('[Supabase Integration] Module loaded - v1.0.0');

})();
