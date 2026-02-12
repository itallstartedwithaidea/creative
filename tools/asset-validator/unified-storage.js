/**
 * Unified Storage Manager - Creative Innovate Tool
 * ================================================
 * Version: 1.0.0 - January 18, 2026
 * 
 * Ensures ALL data is properly persisted across:
 * - localStorage (fast access)
 * - IndexedDB (large data, offline)
 * - Supabase (cross-device sync)
 * 
 * Data Types Managed:
 * - Video Analyses
 * - Creative Analyses
 * - Strategies
 * - URL/Image Analyses
 * - Swipe Files
 * - Benchmarks
 * - Google Ads Builds
 * - Social Media Builds
 * - Keyword Research
 * - AI Studio History
 * - Activity Log
 */

(function() {
    'use strict';

    const VERSION = '1.0.2';
    const DB_NAME = 'CAVUnifiedStorage';
    const DB_VERSION = 3; // Incremented to add user_settings, companies, contacts, projects stores

    // Storage keys for different data types
    const STORAGE_KEYS = {
        VIDEO_ANALYSES: 'cav_video_analyses_v2',
        CREATIVE_ANALYSES: 'cav_creative_analyses_v2',
        STRATEGIES: 'cav_strategies_v2',
        URL_ANALYSES: 'cav_url_analyses_v2',
        SWIPE_FILES: 'cav_swipe_files_v2',
        BENCHMARKS: 'cav_benchmarks_v2',
        GOOGLE_ADS: 'cav_google_ads_v2',
        SOCIAL_MEDIA: 'cav_social_media_v2',
        KEYWORD_RESEARCH: 'cav_keyword_research_v2',
        AI_STUDIO: 'cav_ai_studio_v2',
        ACTIVITY_LOG: 'cav_activity_log_v2',
        AUTO_FIX: 'cav_auto_fix_v2',
        LAST_SYNC: 'cav_unified_last_sync'
    };

    // Supabase table mappings
    const SUPABASE_TABLES = {
        VIDEO_ANALYSES: 'video_analyses',
        CREATIVE_ANALYSES: 'creative_analyses',
        STRATEGIES: 'strategies',
        URL_ANALYSES: 'url_analyses',
        SWIPE_FILES: 'swipe_files',
        BENCHMARKS: 'benchmarks',
        GOOGLE_ADS: 'google_ads_builds',
        SOCIAL_MEDIA: 'social_media_builds',
        KEYWORD_RESEARCH: 'keyword_research',
        ACTIVITY_LOG: 'activity_log'
    };

    class UnifiedStorageManager {
        constructor() {
            this.db = null;
            this.dbReady = this.initDB();
            this.syncQueue = [];
            this.isSyncing = false;
            this.userEmail = null;
            
            // Set up user context
            this.initUserContext();
            
            // Set up periodic sync
            this.setupPeriodicSync();
            
            // Listen for online/offline
            this.setupConnectivityListeners();
            
            console.log(`[UnifiedStorage] v${VERSION} initialized`);
        }

        initUserContext() {
            // Initial setup - will be refreshed on each operation
            this.refreshUserEmail();
        }
        
        // Always get fresh user email from current session - ROBUST multi-source check
        refreshUserEmail() {
            try {
                // 1. Check window.cavUserSession (set after Google Sign-In)
                if (window.cavUserSession?.email) {
                    this.userEmail = window.cavUserSession.email;
                    return this.userEmail;
                }
                
                // 2. Check CAVSecurity SecureSessionManager
                const secureSession = window.CAVSecurity?.SecureSessionManager?.getSession?.();
                if (secureSession?.email) {
                    this.userEmail = secureSession.email;
                    return this.userEmail;
                }
                
                // 3. Check localStorage cav_session
                try {
                    const cavSession = JSON.parse(localStorage.getItem('cav_session') || 'null');
                    if (cavSession?.email) {
                        this.userEmail = cavSession.email;
                        return this.userEmail;
                    }
                } catch (e) {}
                
                // 4. Check localStorage cav_user_session
                try {
                    const userSession = JSON.parse(localStorage.getItem('cav_user_session') || 'null');
                    if (userSession?.email) {
                        this.userEmail = userSession.email;
                        return this.userEmail;
                    }
                } catch (e) {}
                
                // 5. Check localStorage cav_auth_session
                try {
                    const authSession = JSON.parse(localStorage.getItem('cav_auth_session') || 'null');
                    if (authSession?.email) {
                        this.userEmail = authSession.email;
                        return this.userEmail;
                    }
                } catch (e) {}
                
                // 6. Check localStorage cav_secure_session_v3 (used by index.html)
                try {
                    const secureV3 = JSON.parse(localStorage.getItem('cav_secure_session_v3') || 'null');
                    if (secureV3?.email) {
                        this.userEmail = secureV3.email;
                        return this.userEmail;
                    }
                } catch (e) {}
                
                // 7. Check localStorage cav_last_user_email (fallback)
                const lastEmail = localStorage.getItem('cav_last_user_email');
                if (lastEmail && lastEmail !== 'anonymous') {
                    this.userEmail = lastEmail;
                    return this.userEmail;
                }
                
                this.userEmail = 'anonymous';
                return 'anonymous';
            } catch (e) {
                this.userEmail = 'anonymous';
                return 'anonymous';
            }
        }
        
        // Get current user email - always fresh
        getCurrentUserEmail() {
            return this.refreshUserEmail();
        }

        async initDB() {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(DB_NAME, DB_VERSION);

                request.onerror = () => {
                    console.error('[UnifiedStorage] IndexedDB error');
                    resolve(false);
                };

                request.onsuccess = () => {
                    this.db = request.result;
                    console.log('[UnifiedStorage] IndexedDB ready');
                    resolve(true);
                };

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;

                    // Create stores for each data type
                    const stores = [
                        'video_analyses',
                        'creative_analyses',
                        'strategies',
                        'url_analyses',
                        'swipe_files',
                        'benchmarks',
                        'google_ads_builds',
                        'social_media_builds',
                        'keyword_research',
                        'ai_studio_history',
                        'activity_log',
                        'auto_fix_history',
                        'api_keys',  // Added: for API key storage
                        'user_api_keys',  // Added: for user-specific API keys
                        'user_settings',  // Added: for user settings sync
                        'companies',  // Added: for CRM companies
                        'contacts',  // Added: for CRM contacts
                        'projects'  // Added: for CRM projects
                    ];

                    stores.forEach(storeName => {
                        if (!db.objectStoreNames.contains(storeName)) {
                            const store = db.createObjectStore(storeName, { keyPath: 'id' });
                            store.createIndex('user_email', 'user_email', { unique: false });
                            store.createIndex('created_at', 'created_at', { unique: false });
                            store.createIndex('needs_sync', 'needs_sync', { unique: false });
                        }
                    });

                    console.log('[UnifiedStorage] IndexedDB schema created');
                };
            });
        }

        setupPeriodicSync() {
            // Sync every 5 minutes
            setInterval(() => {
                this.syncToCloud();
            }, 5 * 60 * 1000);

            // Also sync on page visibility change (when user comes back)
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) {
                    this.syncToCloud();
                }
            });
        }

        setupConnectivityListeners() {
            window.addEventListener('online', () => {
                console.log('[UnifiedStorage] Online - syncing pending changes');
                this.syncToCloud();
            });
        }

        // ============================================
        // GENERIC CRUD OPERATIONS
        // ============================================

        async save(storeName, data, syncToCloud = true) {
            await this.dbReady;

            // Generate ID if not present
            if (!data.id) {
                data.id = `${storeName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            }

            // Add metadata - always get fresh user email
            data.user_email = this.getCurrentUserEmail();
            data.updated_at = new Date().toISOString();
            data.created_at = data.created_at || data.updated_at;
            data.needs_sync = syncToCloud;

            // Save to IndexedDB
            if (this.db) {
                await this.saveToIndexedDB(storeName, data);
            }

            // Save to localStorage as fallback
            this.saveToLocalStorage(storeName, data);

            // Queue for cloud sync
            if (syncToCloud) {
                this.queueForSync(storeName, data);
            }

            return data;
        }

        async get(storeName, id) {
            await this.dbReady;

            // Try IndexedDB first
            if (this.db) {
                const item = await this.getFromIndexedDB(storeName, id);
                if (item) return item;
            }

            // Fall back to localStorage
            return this.getFromLocalStorage(storeName, id);
        }

        async getAll(storeName, options = {}) {
            await this.dbReady;

            let items = [];

            // Get from IndexedDB
            if (this.db) {
                items = await this.getAllFromIndexedDB(storeName);
            } else {
                items = this.getAllFromLocalStorage(storeName);
            }

            // Filter by user
            const currentEmail = this.getCurrentUserEmail();
            items = items.filter(item => item.user_email === currentEmail);

            // Filter deleted
            if (!options.includeDeleted) {
                items = items.filter(item => !item.deleted_at);
            }

            // Sort by created_at desc
            items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            // Limit
            if (options.limit) {
                items = items.slice(0, options.limit);
            }

            return items;
        }

        async delete(storeName, id, softDelete = true) {
            await this.dbReady;

            if (softDelete) {
                const item = await this.get(storeName, id);
                if (item) {
                    item.deleted_at = new Date().toISOString();
                    item.needs_sync = true;
                    await this.save(storeName, item, true);
                }
            } else {
                // Hard delete
                if (this.db) {
                    await this.deleteFromIndexedDB(storeName, id);
                }
                this.deleteFromLocalStorage(storeName, id);
            }
        }

        // ============================================
        // INDEXEDDB OPERATIONS
        // ============================================

        async saveToIndexedDB(storeName, data) {
            return new Promise((resolve, reject) => {
                try {
                    const transaction = this.db.transaction([storeName], 'readwrite');
                    const store = transaction.objectStore(storeName);
                    const request = store.put(data);

                    request.onsuccess = () => resolve(data);
                    request.onerror = () => reject(request.error);
                } catch (e) {
                    console.warn('[UnifiedStorage] IndexedDB save error:', e);
                    resolve(null);
                }
            });
        }

        async getFromIndexedDB(storeName, id) {
            return new Promise((resolve) => {
                try {
                    const transaction = this.db.transaction([storeName], 'readonly');
                    const store = transaction.objectStore(storeName);
                    const request = store.get(id);

                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => resolve(null);
                } catch (e) {
                    resolve(null);
                }
            });
        }

        async getAllFromIndexedDB(storeName) {
            return new Promise((resolve) => {
                try {
                    const transaction = this.db.transaction([storeName], 'readonly');
                    const store = transaction.objectStore(storeName);
                    const request = store.getAll();

                    request.onsuccess = () => resolve(request.result || []);
                    request.onerror = () => resolve([]);
                } catch (e) {
                    resolve([]);
                }
            });
        }

        async deleteFromIndexedDB(storeName, id) {
            return new Promise((resolve) => {
                try {
                    const transaction = this.db.transaction([storeName], 'readwrite');
                    const store = transaction.objectStore(storeName);
                    const request = store.delete(id);

                    request.onsuccess = () => resolve(true);
                    request.onerror = () => resolve(false);
                } catch (e) {
                    resolve(false);
                }
            });
        }

        // ============================================
        // LOCALSTORAGE OPERATIONS
        // ============================================

        saveToLocalStorage(storeName, data) {
            try {
                const key = `cav_unified_${storeName}`;
                const existing = JSON.parse(localStorage.getItem(key) || '[]');
                
                // Update or add
                const index = existing.findIndex(item => item.id === data.id);
                if (index >= 0) {
                    existing[index] = data;
                } else {
                    existing.unshift(data);
                }

                // Keep only last 100 items in localStorage to prevent quota issues
                const trimmed = existing.slice(0, 100);
                localStorage.setItem(key, JSON.stringify(trimmed));
            } catch (e) {
                if (e.name === 'QuotaExceededError') {
                    console.warn('[UnifiedStorage] localStorage quota exceeded, clearing old data');
                    this.clearOldLocalStorageData(storeName);
                }
            }
        }

        getFromLocalStorage(storeName, id) {
            try {
                const key = `cav_unified_${storeName}`;
                const items = JSON.parse(localStorage.getItem(key) || '[]');
                return items.find(item => item.id === id);
            } catch (e) {
                return null;
            }
        }

        getAllFromLocalStorage(storeName) {
            try {
                const key = `cav_unified_${storeName}`;
                return JSON.parse(localStorage.getItem(key) || '[]');
            } catch (e) {
                return [];
            }
        }

        deleteFromLocalStorage(storeName, id) {
            try {
                const key = `cav_unified_${storeName}`;
                const items = JSON.parse(localStorage.getItem(key) || '[]');
                const filtered = items.filter(item => item.id !== id);
                localStorage.setItem(key, JSON.stringify(filtered));
            } catch (e) {}
        }

        clearOldLocalStorageData(storeName) {
            const key = `cav_unified_${storeName}`;
            const items = JSON.parse(localStorage.getItem(key) || '[]');
            // Keep only last 50 items
            localStorage.setItem(key, JSON.stringify(items.slice(0, 50)));
        }

        // ============================================
        // CLOUD SYNC OPERATIONS
        // ============================================

        queueForSync(storeName, data) {
            this.syncQueue.push({ storeName, data, timestamp: Date.now() });
            
            // Debounced sync
            clearTimeout(this.syncTimeout);
            this.syncTimeout = setTimeout(() => {
                this.syncToCloud();
            }, 2000);
        }

        async syncToCloud() {
            if (this.isSyncing || this.syncQueue.length === 0) return;
            if (!navigator.onLine) return;
            if (!window.CAVSupabase?.isConfigured?.()) return;

            this.isSyncing = true;
            console.log(`[UnifiedStorage] Syncing ${this.syncQueue.length} items to cloud...`);

            const itemsToSync = [...this.syncQueue];
            this.syncQueue = [];

            try {
                const supabase = window.CAVSupabase.getClient?.();
                if (!supabase) {
                    this.syncQueue = itemsToSync; // Re-queue
                    return;
                }

                for (const item of itemsToSync) {
                    try {
                        const tableName = SUPABASE_TABLES[item.storeName.toUpperCase()] || item.storeName;
                        
                        // Skip api_keys sync - we use user_api_keys table instead
                        // The api_keys table has UUID id column but code uses text ids
                        if (item.storeName === 'api_keys') {
                            console.log(`[UnifiedStorage] Skipping api_keys sync (use user_api_keys instead)`);
                            item.data.needs_sync = false;
                            await this.saveToIndexedDB(item.storeName, item.data);
                            continue;
                        }
                        
                        // Prepare data for Supabase
                        const supabaseData = this.prepareForSupabase(item.data);
                        
                        // INSERT-only tables (no upsert - let Supabase generate UUID id)
                        const insertOnlyTables = ['activity_log'];
                        
                        let error;
                        if (insertOnlyTables.includes(tableName)) {
                            // For activity_log: INSERT only, remove 'id' so Supabase auto-generates UUID
                            delete supabaseData.id;
                            const result = await supabase
                                .from(tableName)
                                .insert(supabaseData);
                            error = result.error;
                        } else {
                            // Determine the correct onConflict column for each table
                            let onConflictColumn = 'id';
                            if (item.storeName === 'user_api_keys') {
                                // user_api_keys uses uuid column for upsert
                                onConflictColumn = 'uuid';
                            } else if (supabaseData.uuid) {
                                // Tables with uuid column
                                onConflictColumn = 'uuid';
                            }

                            const result = await supabase
                                .from(tableName)
                                .upsert(supabaseData, { onConflict: onConflictColumn, ignoreDuplicates: false });
                            error = result.error;
                        }

                        if (error) {
                            console.warn(`[UnifiedStorage] Sync error for ${tableName}:`, error.message);
                            // Only re-queue if it's not a schema error (those won't fix themselves)
                            if (!error.message.includes('column') && !error.message.includes('schema') && !error.message.includes('uuid')) {
                                this.syncQueue.push(item);
                            }
                        } else {
                            // Mark as synced
                            item.data.needs_sync = false;
                            await this.saveToIndexedDB(item.storeName, item.data);
                            console.log(`[UnifiedStorage] ✓ Synced to ${tableName}`);
                        }
                    } catch (e) {
                        console.warn('[UnifiedStorage] Item sync failed:', e);
                        this.syncQueue.push(item);
                    }
                }

                localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
                console.log('[UnifiedStorage] Cloud sync complete');

            } catch (e) {
                console.error('[UnifiedStorage] Cloud sync error:', e);
                this.syncQueue = [...itemsToSync, ...this.syncQueue];
            } finally {
                this.isSyncing = false;
            }
        }

        prepareForSupabase(data) {
            const prepared = { ...data };
            
            // Remove local-only fields
            delete prepared.needs_sync;
            
            // CRITICAL: Add user_email for Google Sign-In users
            const userEmail = window.cavUserSession?.email || 
                              window.CAVSecurity?.SecureSessionManager?.getSession()?.email || 
                              this.userEmail ||
                              'anonymous';
            prepared.user_email = prepared.user_email || userEmail;
            prepared.owner_email = prepared.owner_email || userEmail;
            
            // Transform camelCase to snake_case for Supabase compatibility
            // NOTE: analyzedAt removed - goes to metadata for tables that don't have it
            const camelToSnakeMap = {
                'abTestRecommendations': 'ab_test_recommendations',
                'placementMatrix': 'placement_matrix',
                'derivativeIdeas': 'derivative_ideas',
                'fatiguePrediction': 'fatigue_prediction',
                'hookAnalysis': 'hook_analysis',
                'ctaAnalysis': 'cta_analysis',
                'brandCompliance': 'brand_compliance',
                'thumbStopScore': 'thumb_stop_score',
                'performancePrediction': 'performance_prediction',
                'enhancedAnalysis': 'enhanced_analysis',
                'confidenceLevel': 'confidence_level',
                'processingTime': 'processing_time',
                'assetId': 'asset_id',
                'assetFilename': 'asset_filename',
                'assetType': 'asset_type',
                'assetDimensions': 'asset_dimensions',
                'audioStrategy': 'audio_strategy',
                'overallScore': 'overall_score',
                'linkedCompanyId': 'linked_company_id',
                'detectedBrand': 'detected_brand',
                'isShared': 'is_shared',
                'createdAt': 'created_at',
                'updatedAt': 'updated_at',
                'deletedAt': 'deleted_at',
                'userId': 'user_id',
                'userEmail': 'user_email',
                'strategyType': 'strategy_type',
                'urlType': 'url_type'
            };
            
            // Apply camelCase to snake_case transformation
            Object.keys(camelToSnakeMap).forEach(camelKey => {
                if (prepared[camelKey] !== undefined) {
                    prepared[camelToSnakeMap[camelKey]] = prepared[camelKey];
                    delete prepared[camelKey];
                }
            });
            
            // Convert complex objects to JSON strings (only for fields that exist in DB schema)
            // NOTE: 'analysis' removed - it goes to metadata instead for tables that don't have it
            const jsonFields = ['metadata', 'results', 'data', 'insights', 'config',
                               'hook_analysis', 'cta_analysis', 'brand_compliance', 'thumb_stop_score',
                               'performance_prediction', 'enhanced_analysis', 'ab_test_recommendations',
                               'placement_matrix', 'derivative_ideas', 'fatigue_prediction',
                               'asset_dimensions', 'audio_strategy', 'content', 'recommendations', 'scores'];
            jsonFields.forEach(field => {
                if (prepared[field] && typeof prepared[field] === 'object') {
                    prepared[field] = JSON.stringify(prepared[field]);
                }
            });

            // Remove base64 data - store reference instead
            if (prepared.dataUrl || prepared.imageData || prepared.thumbnail_data) {
                delete prepared.dataUrl;
                delete prepared.imageData;
                delete prepared.thumbnail_data;
            }
            
            // Remove fields that commonly cause schema errors
            // Store them in metadata instead
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
                // Asset-specific fields that may not exist
                'cloudinary_data', 'cloudinaryData', 'videoFrames', 'video_frames',
                'extractedText', 'extracted_text', 'ocrResults', 'ocr_results'
            ];
            
            // Move problematic fields into metadata
            if (!prepared.metadata || typeof prepared.metadata !== 'object') {
                prepared.metadata = {};
            }
            if (typeof prepared.metadata === 'string') {
                try { prepared.metadata = JSON.parse(prepared.metadata); } catch (e) { prepared.metadata = {}; }
            }
            
            problematicFields.forEach(field => {
                if (prepared[field] !== undefined) {
                    prepared.metadata[field] = prepared[field];
                    delete prepared[field];
                }
            });
            
            // Stringify metadata
            prepared.metadata = JSON.stringify(prepared.metadata);

            return prepared;
        }

        async loadFromCloud(storeName) {
            if (!window.CAVSupabase?.isConfigured?.()) return [];

            try {
                const supabase = window.CAVSupabase.getClient?.();
                if (!supabase) return [];

                const tableName = SUPABASE_TABLES[storeName.toUpperCase()] || storeName;

                const { data, error } = await supabase
                    .from(tableName)
                    .select('*')
                    .eq('user_email', this.getCurrentUserEmail())
                    .is('deleted_at', null)
                    .order('created_at', { ascending: false })
                    .limit(100);

                if (error) {
                    console.warn(`[UnifiedStorage] Cloud load error for ${tableName}:`, error.message);
                    return [];
                }

                // Parse JSON fields
                const parsed = (data || []).map(item => {
                    const jsonFields = ['analysis', 'metadata', 'results', 'data', 'insights', 'config'];
                    jsonFields.forEach(field => {
                        if (item[field] && typeof item[field] === 'string') {
                            try {
                                item[field] = JSON.parse(item[field]);
                            } catch (e) {}
                        }
                    });
                    return item;
                });

                // Merge with local data
                for (const item of parsed) {
                    await this.saveToIndexedDB(storeName, { ...item, needs_sync: false });
                }

                console.log(`[UnifiedStorage] Loaded ${parsed.length} items from cloud: ${storeName}`);
                return parsed;

            } catch (e) {
                console.error('[UnifiedStorage] Cloud load error:', e);
                return [];
            }
        }

        // ============================================
        // CONVENIENCE METHODS FOR SPECIFIC DATA TYPES
        // ============================================

        // Video Analyses
        async saveVideoAnalysis(analysis) {
            return this.save('video_analyses', analysis);
        }

        async getVideoAnalyses(limit = 50) {
            return this.getAll('video_analyses', { limit });
        }

        // Creative Analyses
        async saveCreativeAnalysis(analysis) {
            return this.save('creative_analyses', analysis);
        }

        async getCreativeAnalyses(limit = 100) {
            return this.getAll('creative_analyses', { limit });
        }

        // Strategies
        async saveStrategy(strategy) {
            return this.save('strategies', strategy);
        }

        async getStrategies(limit = 50) {
            return this.getAll('strategies', { limit });
        }

        // URL/Image Analyses
        async saveURLAnalysis(analysis) {
            return this.save('url_analyses', analysis);
        }

        async getURLAnalyses(limit = 50) {
            return this.getAll('url_analyses', { limit });
        }

        // Swipe Files
        async saveSwipeFile(swipe) {
            return this.save('swipe_files', swipe);
        }

        async getSwipeFiles(limit = 100) {
            return this.getAll('swipe_files', { limit });
        }

        // Benchmarks
        async saveBenchmark(benchmark) {
            return this.save('benchmarks', benchmark);
        }

        async getBenchmarks(limit = 50) {
            return this.getAll('benchmarks', { limit });
        }

        // Google Ads Builds
        async saveGoogleAdsBuild(build) {
            return this.save('google_ads_builds', build);
        }

        async getGoogleAdsBuilds(limit = 50) {
            return this.getAll('google_ads_builds', { limit });
        }

        // Social Media Builds
        async saveSocialMediaBuild(build) {
            return this.save('social_media_builds', build);
        }

        async getSocialMediaBuilds(limit = 50) {
            return this.getAll('social_media_builds', { limit });
        }

        // Keyword Research
        async saveKeywordResearch(research) {
            return this.save('keyword_research', research);
        }

        async getKeywordResearch(limit = 50) {
            return this.getAll('keyword_research', { limit });
        }

        // AI Studio History
        async saveAIStudioEntry(entry) {
            return this.save('ai_studio_history', entry);
        }

        async getAIStudioHistory(limit = 30) {
            return this.getAll('ai_studio_history', { limit });
        }

        // Activity Log
        async logActivity(activity) {
            const currentEmail = this.getCurrentUserEmail();
            const logEntry = {
                id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Local ID only
                user_email: currentEmail,
                owner_email: currentEmail,
                type: activity.type || 'unknown',
                action: activity.action || activity.type || 'unknown',
                provider: activity.provider || null,
                entity_type: activity.entity_type || null,
                entity_id: activity.entity_id || null,
                details: activity.details || {},
                metadata: activity.metadata || {},
                shared: activity.shared || false,
                logged_at: new Date().toISOString(),
                created_at: new Date().toISOString()
            };
            return this.save('activity_log', logEntry, true); // Sync activity to cloud (insert only)
        }

        async getActivityLog(limit = 100) {
            return this.getAll('activity_log', { limit });
        }

        // ============================================
        // API KEY SHARING & PERSISTENCE
        // ============================================

        /**
         * Save API keys - persists to localStorage + IndexedDB + Supabase
         * @param {string} provider - e.g., 'gemini', 'openai', 'claude', 'searchapi'
         * @param {string} key - The API key
         * @param {Object} options - Sharing options
         */
        async saveAPIKey(provider, key, options = {}) {
            const {
                shareWithDomain = false,
                shareGlobally = false,
                allowedEmails = [],
                isAdmin = false
            } = options;

            // Generate a text-based uuid for upsert conflict resolution
            // Note: user_api_keys.id is UUID type (auto-generated), uuid is TEXT type for our key
            const currentEmail = this.getCurrentUserEmail();
            const keyUuid = `apikey_${provider}_${currentEmail.replace(/[^a-z0-9]/gi, '_')}`;
            const keyData = {
                // Don't set 'id' - let Supabase auto-generate the UUID
                uuid: keyUuid, // TEXT column - used for upsert conflict resolution
                provider,
                key,
                encrypted_key: key, // Also set encrypted_key for compatibility
                user_email: currentEmail,
                owner_email: currentEmail,
                domain: currentEmail.split('@')[1] || 'local',
                share_with_domain: shareWithDomain,
                share_globally: shareGlobally,
                is_admin_key: isAdmin,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            // 1. Save to localStorage (immediate access)
            const localKeys = JSON.parse(localStorage.getItem('cav_api_keys_unified') || '{}');
            // Add id for local storage (not for Supabase)
            localKeys[provider] = { ...keyData, id: keyUuid };
            localStorage.setItem('cav_api_keys_unified', JSON.stringify(localKeys));

            // Also save to legacy locations for backwards compatibility
            if (provider === 'gemini') {
                localStorage.setItem('cav_ai_api_key', key);
                localStorage.setItem('cav_gemini_api_key', key);
            }
            localStorage.setItem(`cav_${provider}_api_key`, key);

            // 2. Save to IndexedDB (needs id for keyPath)
            await this.save('api_keys', { ...keyData, id: keyUuid }, false); // false = don't sync to cloud from here

            // 3. Save to Supabase for cross-device sync
            if (window.CAVSupabase?.isConfigured?.()) {
                try {
                    // Save personal key (keyData doesn't have id, Supabase will auto-generate)
                    await window.CAVSupabase.saveEntity?.('user_api_keys', keyData);

                    // If sharing with domain, also save to shared_api_keys
                    if (shareWithDomain || shareGlobally) {
                        const orgId = shareGlobally ? 'global' : keyData.domain.replace(/\./g, '_');
                        await window.CAVSupabase.saveSharedKeysDirect?.({ [provider]: key }, orgId);
                    }

                    console.log(`[UnifiedStorage] API key '${provider}' saved to cloud`);
                } catch (e) {
                    console.warn('[UnifiedStorage] Cloud save failed, local only:', e);
                }
            }

            // Log activity
            await this.logActivity({
                type: 'api_key_saved',
                provider,
                shared: shareWithDomain || shareGlobally
            });

            return { success: true };
        }

        /**
         * Get API key - checks user's own, then domain shared, then global
         * @param {string} provider - e.g., 'gemini', 'openai', 'claude'
         * @returns {Object} { key, source }
         */
        async getAPIKey(provider) {
            const currentEmail = this.getCurrentUserEmail();
            const userDomain = currentEmail.split('@')[1] || 'local';

            // 1. Check user's own key first
            const localKeys = JSON.parse(localStorage.getItem('cav_api_keys_unified') || '{}');
            if (localKeys[provider]?.key) {
                return { key: localKeys[provider].key, source: 'own' };
            }

            // Check legacy storage
            const legacyKey = localStorage.getItem(`cav_${provider}_api_key`) ||
                             (provider === 'gemini' ? localStorage.getItem('cav_ai_api_key') : null);
            if (legacyKey) {
                return { key: legacyKey, source: 'legacy' };
            }

            // 2. Check domain-shared keys from Supabase
            if (window.CAVSupabase?.isConfigured?.()) {
                try {
                    // Load domain keys
                    const orgId = userDomain.replace(/\./g, '_');
                    const domainResult = await window.CAVSupabase.loadSharedKeysDirect?.(orgId);
                    if (domainResult?.keys?.[provider]) {
                        console.log(`[UnifiedStorage] Using domain-shared ${provider} key`);
                        return { key: domainResult.keys[provider], source: 'domain_shared' };
                    }

                    // Load global keys
                    const globalResult = await window.CAVSupabase.loadSharedKeysDirect?.('global');
                    if (globalResult?.keys?.[provider]) {
                        console.log(`[UnifiedStorage] Using globally-shared ${provider} key`);
                        return { key: globalResult.keys[provider], source: 'global_shared' };
                    }

                    // Load default keys
                    const defaultResult = await window.CAVSupabase.loadSharedKeysDirect?.('default');
                    if (defaultResult?.keys?.[provider]) {
                        console.log(`[UnifiedStorage] Using default shared ${provider} key`);
                        return { key: defaultResult.keys[provider], source: 'default_shared' };
                    }
                } catch (e) {
                    console.warn('[UnifiedStorage] Cloud key lookup failed:', e);
                }
            }

            // 3. Check cav_platform_credentials (legacy sharing)
            try {
                const platformCreds = JSON.parse(localStorage.getItem('cav_platform_credentials') || '{}');
                if (platformCreds.sharedKeys?.[provider]) {
                    return { key: platformCreds.sharedKeys[provider], source: 'platform_shared' };
                }
            } catch (e) {}

            return { key: null, source: null };
        }

        /**
         * Share API key with domain (admin function)
         * Other admins on same domain can override with their keys
         */
        async shareKeyWithDomain(provider, key, options = {}) {
            const currentEmail = this.getCurrentUserEmail();
            const domain = currentEmail.split('@')[1];
            if (!domain || domain === 'gmail.com' || domain === 'local') {
                return { success: false, error: 'Cannot share with public domain' };
            }

            const orgId = domain.replace(/\./g, '_');
            
            // Save to localStorage for immediate access
            const sharedConfig = JSON.parse(localStorage.getItem('cav_domain_shared_keys') || '{}');
            if (!sharedConfig[orgId]) sharedConfig[orgId] = {};
            sharedConfig[orgId][provider] = {
                key,
                shared_by: currentEmail,
                shared_at: new Date().toISOString()
            };
            localStorage.setItem('cav_domain_shared_keys', JSON.stringify(sharedConfig));

            // Save to Supabase
            if (window.CAVSupabase?.isConfigured?.()) {
                try {
                    await window.CAVSupabase.saveSharedKeysDirect?.({ [provider]: key }, orgId);
                    console.log(`[UnifiedStorage] Key '${provider}' shared with domain: ${domain}`);
                } catch (e) {
                    console.warn('[UnifiedStorage] Failed to share to cloud:', e);
                }
            }

            return { success: true, domain };
        }

        /**
         * Get all shared keys for current user's domain
         */
        async getDomainSharedKeys() {
            const domain = this.getCurrentUserEmail().split('@')[1];
            if (!domain) return {};

            const orgId = domain.replace(/\./g, '_');
            let keys = {};

            // Check local first
            try {
                const localShared = JSON.parse(localStorage.getItem('cav_domain_shared_keys') || '{}');
                if (localShared[orgId]) {
                    for (const [provider, data] of Object.entries(localShared[orgId])) {
                        keys[provider] = data.key;
                    }
                }
            } catch (e) {}

            // Then check Supabase
            if (window.CAVSupabase?.isConfigured?.()) {
                try {
                    const result = await window.CAVSupabase.loadSharedKeysDirect?.(orgId);
                    if (result?.keys) {
                        keys = { ...keys, ...result.keys };
                    }
                } catch (e) {}
            }

            return keys;
        }

        /**
         * Sync all API keys from cloud on login
         */
        async syncAPIKeysFromCloud() {
            if (!window.CAVSupabase?.isConfigured?.()) return;

            console.log('[UnifiedStorage] Syncing API keys from cloud...');

            try {
                // Get domain keys
                const domainKeys = await this.getDomainSharedKeys();
                
                // Get global keys
                const globalResult = await window.CAVSupabase.loadSharedKeysDirect?.('global');
                const globalKeys = globalResult?.keys || {};

                // Get default keys
                const defaultResult = await window.CAVSupabase.loadSharedKeysDirect?.('default');
                const defaultKeys = defaultResult?.keys || {};

                // Merge into platform credentials (for backwards compatibility)
                const platformCreds = JSON.parse(localStorage.getItem('cav_platform_credentials') || '{}');
                platformCreds.sharedKeys = {
                    ...defaultKeys,
                    ...globalKeys,
                    ...domainKeys
                };
                platformCreds.sharing = { enabled: true };
                localStorage.setItem('cav_platform_credentials', JSON.stringify(platformCreds));

                // Also sync to legacy locations
                for (const [provider, key] of Object.entries(platformCreds.sharedKeys)) {
                    if (provider === 'gemini') {
                        localStorage.setItem('cav_ai_api_key', key);
                        localStorage.setItem('cav_gemini_api_key', key);
                    }
                    localStorage.setItem(`cav_${provider}_api_key`, key);
                }

                console.log(`[UnifiedStorage] Synced keys: ${Object.keys(platformCreds.sharedKeys).join(', ')}`);
                return platformCreds.sharedKeys;
            } catch (e) {
                console.warn('[UnifiedStorage] Cloud key sync failed:', e);
                return {};
            }
        }

        // ============================================
        // MIGRATION - Import from old localStorage keys
        // ============================================

        async migrateOldData() {
            console.log('[UnifiedStorage] Checking for data migration...');

            const migrations = [
                { oldKey: 'cav_advanced_video_analyses', storeName: 'video_analyses' },
                { oldKey: 'cav_video_analyses', storeName: 'video_analyses' },
                { oldKey: 'cav_creative_analyses', storeName: 'creative_analyses' },
                { oldKey: 'cav_strategies', storeName: 'strategies' },
                { oldKey: 'cav_url_analyses', storeName: 'url_analyses' },
                { oldKey: 'cav_swipe_file', storeName: 'swipe_files' },
                { oldKey: 'cav_benchmarks', storeName: 'benchmarks' },
                { oldKey: 'cav_ai_studio_history', storeName: 'ai_studio_history' },
                { oldKey: 'cav_autofix_history', storeName: 'auto_fix_history' }
            ];

            for (const { oldKey, storeName } of migrations) {
                try {
                    const oldData = JSON.parse(localStorage.getItem(oldKey) || '[]');
                    if (oldData.length > 0) {
                        console.log(`[UnifiedStorage] Migrating ${oldData.length} items from ${oldKey}`);
                        
                        for (const item of oldData) {
                            // Generate ID if missing
                            if (!item.id) {
                                item.id = `migrated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                            }
                            await this.save(storeName, item, true);
                        }

                        // Mark old data as migrated (don't delete in case of issues)
                        localStorage.setItem(`${oldKey}_migrated`, 'true');
                    }
                } catch (e) {
                    console.warn(`[UnifiedStorage] Migration error for ${oldKey}:`, e);
                }
            }

            console.log('[UnifiedStorage] Migration check complete');
        }

        // ============================================
        // DIAGNOSTICS
        // ============================================

        async getDiagnostics() {
            const stores = [
                'video_analyses', 'creative_analyses', 'strategies', 
                'url_analyses', 'swipe_files', 'benchmarks',
                'google_ads_builds', 'social_media_builds', 'keyword_research',
                'ai_studio_history', 'activity_log'
            ];

            const diagnostics = {
                version: VERSION,
                userEmail: this.getCurrentUserEmail(),
                indexedDBReady: !!this.db,
                supabaseConfigured: window.CAVSupabase?.isConfigured?.() || false,
                lastSync: localStorage.getItem(STORAGE_KEYS.LAST_SYNC),
                pendingSync: this.syncQueue.length,
                stores: {}
            };

            for (const storeName of stores) {
                const items = await this.getAll(storeName);
                const needsSync = items.filter(i => i.needs_sync).length;
                diagnostics.stores[storeName] = {
                    count: items.length,
                    needsSync
                };
            }

            return diagnostics;
        }
    }

    // ============================================
    // INITIALIZE AND EXPORT
    // ============================================

    const manager = new UnifiedStorageManager();

    // Run migration on first load
    manager.dbReady.then(() => {
        manager.migrateOldData();
    });

    // Export globally
    window.UnifiedStorage = manager;

    // Also provide hook methods for existing modules
    window.CAVStorageHooks = {
        saveVideoAnalysis: (data) => manager.saveVideoAnalysis(data),
        saveCreativeAnalysis: (data) => manager.saveCreativeAnalysis(data),
        saveStrategy: (data) => manager.saveStrategy(data),
        saveURLAnalysis: (data) => manager.saveURLAnalysis(data),
        saveSwipeFile: (data) => manager.saveSwipeFile(data),
        saveBenchmark: (data) => manager.saveBenchmark(data),
        saveGoogleAdsBuild: (data) => manager.saveGoogleAdsBuild(data),
        saveSocialMediaBuild: (data) => manager.saveSocialMediaBuild(data),
        saveKeywordResearch: (data) => manager.saveKeywordResearch(data),
        logActivity: (data) => manager.logActivity(data),
        getDiagnostics: () => manager.getDiagnostics(),
        
        // API Key Management
        saveAPIKey: (provider, key, options) => manager.saveAPIKey(provider, key, options),
        getAPIKey: (provider) => manager.getAPIKey(provider),
        shareKeyWithDomain: (provider, key, options) => manager.shareKeyWithDomain(provider, key, options),
        getDomainSharedKeys: () => manager.getDomainSharedKeys(),
        syncAPIKeysFromCloud: () => manager.syncAPIKeysFromCloud()
    };

    // Auto-sync API keys from cloud after initialization
    manager.dbReady.then(() => {
        // Delay to allow Supabase to initialize
        setTimeout(() => {
            if (window.CAVSupabase?.isConfigured?.()) {
                manager.syncAPIKeysFromCloud();
            }
        }, 2000);
    });

    // Listen for login events to sync keys
    window.addEventListener('cav_user_login', () => {
        manager.initUserContext();
        manager.syncAPIKeysFromCloud();
    });

    console.log(`📦 Unified Storage Manager v${VERSION} loaded`);
    console.log('   ✅ IndexedDB for large data & offline');
    console.log('   ✅ localStorage for fast access');
    console.log('   ✅ Supabase for cross-device sync');
    console.log('   ✅ Auto-migration from old keys');
    console.log('   ✅ Periodic cloud sync');
    console.log('   ✅ API Key sharing (domain & global)');

})();
