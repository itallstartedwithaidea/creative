/**
 * Real-Time Cross-Device Sync Module
 * Creative Innovate Tool v1.0.0
 * 
 * Provides TRUE real-time synchronization across all devices:
 * - Desktop browsers
 * - Mobile browsers
 * - Multiple tabs
 * 
 * Uses Supabase Realtime for instant updates.
 */

(function() {
    'use strict';

    const VERSION = '1.0.0';
    console.log(`[RealtimeSync] Loading v${VERSION}...`);

    // ============================================
    // CONFIGURATION
    // ============================================

    const SYNC_CONFIG = {
        // Tables to subscribe to for real-time updates
        REALTIME_TABLES: [
            'companies',
            'contacts', 
            'projects',
            'deals',
            'creative_analyses',
            'strategies',
            'video_analyses',
            'url_analyses',
            'swipe_files',
            'benchmarks',
            'google_ads_builds',
            'social_media_builds',
            'keyword_research',
            'user_settings',
            'brand_profiles'
        ],
        
        // How often to check sync status (ms)
        HEARTBEAT_INTERVAL: 30000,
        
        // Reconnect delay on disconnect (ms)
        RECONNECT_DELAY: 5000,
        
        // Max reconnect attempts
        MAX_RECONNECT_ATTEMPTS: 10
    };

    // ============================================
    // STATE
    // ============================================

    let supabase = null;
    let userEmail = null;
    let channels = {};
    let isConnected = false;
    let reconnectAttempts = 0;
    let lastSyncTime = null;
    let pendingChanges = [];
    let syncStatusCallbacks = [];

    // ============================================
    // INITIALIZATION
    // ============================================

    class RealtimeSync {
        constructor() {
            this.initialized = false;
            this.subscriptions = new Map();
            this.localChangeListeners = [];
        }

        async init() {
            if (this.initialized) return true;

            // Wait for Supabase
            if (!window.CAVSupabase?.isConfigured?.()) {
                console.log('[RealtimeSync] Waiting for Supabase...');
                await this.waitForSupabase();
            }

            supabase = window.CAVSupabase?.getClient?.();
            if (!supabase) {
                console.warn('[RealtimeSync] Supabase client not available');
                return false;
            }

            // Get user email
            userEmail = window.cavUserSession?.email || 
                       localStorage.getItem('cav_user_email') ||
                       'anonymous';

            console.log(`[RealtimeSync] Initializing for user: ${userEmail}`);

            // Set up real-time subscriptions
            await this.subscribeToAllTables();

            // Set up broadcast channel for cross-tab sync
            this.setupBroadcastChannel();

            // Set up sync status UI
            this.setupSyncStatusUI();

            // Set up heartbeat
            this.startHeartbeat();

            // Listen for online/offline
            this.setupConnectivityListeners();

            this.initialized = true;
            this.updateSyncStatus('connected');
            
            console.log('[RealtimeSync] ✅ Initialized successfully');
            return true;
        }

        async waitForSupabase(maxWait = 10000) {
            const start = Date.now();
            while (!window.CAVSupabase?.isConfigured?.()) {
                if (Date.now() - start > maxWait) {
                    throw new Error('Supabase not available');
                }
                await new Promise(r => setTimeout(r, 500));
            }
        }

        // ============================================
        // REAL-TIME SUBSCRIPTIONS
        // ============================================

        async subscribeToAllTables() {
            console.log('[RealtimeSync] Setting up real-time subscriptions...');

            for (const table of SYNC_CONFIG.REALTIME_TABLES) {
                await this.subscribeToTable(table);
            }

            console.log(`[RealtimeSync] Subscribed to ${SYNC_CONFIG.REALTIME_TABLES.length} tables`);
        }

        async subscribeToTable(tableName) {
            try {
                const channel = supabase
                    .channel(`realtime_${tableName}`)
                    .on('postgres_changes', {
                        event: '*', // INSERT, UPDATE, DELETE
                        schema: 'public',
                        table: tableName,
                        filter: `user_email=eq.${userEmail}`
                    }, (payload) => {
                        this.handleRealtimeChange(tableName, payload);
                    })
                    .subscribe((status) => {
                        if (status === 'SUBSCRIBED') {
                            console.log(`[RealtimeSync] ✓ Subscribed to ${tableName}`);
                            channels[tableName] = channel;
                        } else if (status === 'CHANNEL_ERROR') {
                            console.warn(`[RealtimeSync] ✗ Failed to subscribe to ${tableName}`);
                        }
                    });

                this.subscriptions.set(tableName, channel);

            } catch (error) {
                console.warn(`[RealtimeSync] Error subscribing to ${tableName}:`, error);
            }
        }

        handleRealtimeChange(tableName, payload) {
            console.log(`[RealtimeSync] Change in ${tableName}:`, payload.eventType);

            const { eventType, new: newRecord, old: oldRecord } = payload;

            // Update local storage
            this.updateLocalStorage(tableName, eventType, newRecord, oldRecord);

            // Notify listeners
            this.notifyChangeListeners(tableName, eventType, newRecord, oldRecord);

            // Update sync status
            lastSyncTime = new Date();
            this.updateSyncStatus('synced');

            // Broadcast to other tabs
            this.broadcastChange(tableName, eventType, newRecord);
        }

        // ============================================
        // LOCAL STORAGE SYNC
        // ============================================

        async updateLocalStorage(tableName, eventType, newRecord, oldRecord) {
            // Update IndexedDB via UnifiedStorage
            if (window.UnifiedStorage) {
                try {
                    const storeName = this.tableToStoreName(tableName);
                    
                    // Check if this store exists in IndexedDB (might not if DB version is old)
                    const supportedStores = [
                        'video_analyses', 'creative_analyses', 'strategies', 'url_analyses',
                        'swipe_files', 'benchmarks', 'google_ads_builds', 'social_media_builds',
                        'keyword_research', 'ai_studio_history', 'activity_log', 'auto_fix_history',
                        'api_keys', 'user_api_keys', 'user_settings', 'companies', 'contacts', 'projects'
                    ];
                    
                    if (!supportedStores.includes(storeName)) {
                        // Skip tables we don't sync to IndexedDB
                        console.log(`[RealtimeSync] Skipping IndexedDB update for ${tableName}`);
                        return;
                    }
                    
                    if (eventType === 'DELETE') {
                        await window.UnifiedStorage.delete(storeName, oldRecord?.id, false);
                    } else {
                        // Don't trigger cloud sync since this came from cloud
                        const data = { ...newRecord, needs_sync: false };
                        await window.UnifiedStorage.save(storeName, data, false);
                    }
                } catch (e) {
                    // Gracefully handle missing stores (can happen if DB hasn't upgraded yet)
                    if (e.name === 'NotFoundError' || e.message?.includes('not found')) {
                        console.log(`[RealtimeSync] Store ${tableName} not in IndexedDB yet, skipping local update`);
                    } else {
                        console.warn('[RealtimeSync] Local update failed:', e);
                    }
                }
            }
        }

        checkIsSuperAdmin() {
            // Check if current user is super admin
            const superAdmins = [
                'john@itallstartedwithaidea.com'
                // Add more super admin emails here
            ];
            
            const currentEmail = (userEmail || '').toLowerCase();
            return superAdmins.includes(currentEmail);
        }

        tableToStoreName(tableName) {
            // Map table names to IndexedDB store names
            const map = {
                'creative_analyses': 'creative_analyses',
                'video_analyses': 'video_analyses',
                'strategies': 'strategies',
                'url_analyses': 'url_analyses',
                'swipe_files': 'swipe_files',
                'benchmarks': 'benchmarks',
                'google_ads_builds': 'google_ads_builds',
                'social_media_builds': 'social_media_builds',
                'keyword_research': 'keyword_research',
                'companies': 'companies',
                'contacts': 'contacts',
                'projects': 'projects',
                'deals': 'deals',
                'user_settings': 'user_settings',
                'brand_profiles': 'brand_profiles'
            };
            return map[tableName] || tableName;
        }

        // ============================================
        // CROSS-TAB SYNC (BroadcastChannel)
        // ============================================

        setupBroadcastChannel() {
            if (typeof BroadcastChannel === 'undefined') {
                console.log('[RealtimeSync] BroadcastChannel not supported');
                return;
            }

            this.broadcastChannel = new BroadcastChannel('cav_realtime_sync');
            
            this.broadcastChannel.onmessage = (event) => {
                const { type, tableName, eventType, data } = event.data;
                
                if (type === 'SYNC_CHANGE') {
                    console.log(`[RealtimeSync] Cross-tab update: ${tableName}`);
                    this.updateLocalStorage(tableName, eventType, data, null);
                    this.notifyChangeListeners(tableName, eventType, data, null);
                } else if (type === 'SYNC_STATUS') {
                    // Another tab updated sync status
                    this.updateSyncStatus(event.data.status, false);
                }
            };
        }

        broadcastChange(tableName, eventType, data) {
            if (this.broadcastChannel) {
                this.broadcastChannel.postMessage({
                    type: 'SYNC_CHANGE',
                    tableName,
                    eventType,
                    data,
                    timestamp: Date.now()
                });
            }
        }

        // ============================================
        // CHANGE LISTENERS
        // ============================================

        onDataChange(callback) {
            this.localChangeListeners.push(callback);
            return () => {
                const idx = this.localChangeListeners.indexOf(callback);
                if (idx > -1) this.localChangeListeners.splice(idx, 1);
            };
        }

        notifyChangeListeners(tableName, eventType, newRecord, oldRecord) {
            for (const callback of this.localChangeListeners) {
                try {
                    callback({ tableName, eventType, newRecord, oldRecord });
                } catch (e) {
                    console.warn('[RealtimeSync] Listener error:', e);
                }
            }

            // Dispatch custom event for UI updates
            window.dispatchEvent(new CustomEvent('cav:data-changed', {
                detail: { tableName, eventType, newRecord, oldRecord }
            }));
        }

        // ============================================
        // SYNC STATUS UI
        // ============================================

        setupSyncStatusUI() {
            // Sync status is now shown ONLY in the Super Admin dashboard
            // No floating indicator - status is displayed in Settings > API Sharing section
            console.log('[RealtimeSync] Sync status available in Admin Dashboard only');
            
            // Add CSS for spin animation used in admin panel
            if (!document.getElementById('sync-status-styles')) {
                const style = document.createElement('style');
                style.id = 'sync-status-styles';
                style.textContent = `
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    .spin {
                        animation: spin 1s linear infinite;
                    }
                `;
                document.head.appendChild(style);
            }
        }

        updateSyncStatus(status, broadcast = true) {
            // Update internal state
            isConnected = (status === 'synced' || status === 'connected');
            
            console.log(`[RealtimeSync] Status: ${status}`);

            // Broadcast to other tabs
            if (broadcast && this.broadcastChannel) {
                this.broadcastChannel.postMessage({
                    type: 'SYNC_STATUS',
                    status
                });
            }

            // Notify callbacks (used by admin dashboard)
            for (const cb of syncStatusCallbacks) {
                try { cb(status); } catch (e) {}
            }
            
            // Dispatch event for any listeners
            window.dispatchEvent(new CustomEvent('cav:sync-status', {
                detail: { status, connected: isConnected }
            }));
        }

        onSyncStatusChange(callback) {
            syncStatusCallbacks.push(callback);
            return () => {
                const idx = syncStatusCallbacks.indexOf(callback);
                if (idx > -1) syncStatusCallbacks.splice(idx, 1);
            };
        }

        // ============================================
        // HEARTBEAT & CONNECTIVITY
        // ============================================

        startHeartbeat() {
            setInterval(() => {
                if (navigator.onLine && this.initialized) {
                    this.checkConnection();
                }
            }, SYNC_CONFIG.HEARTBEAT_INTERVAL);
        }

        async checkConnection() {
            try {
                // Quick health check
                const { error } = await supabase
                    .from('organizations')
                    .select('id')
                    .limit(1);

                if (error && error.code !== 'PGRST116') {
                    // PGRST116 = no rows, which is fine
                    throw error;
                }

                if (!isConnected) {
                    this.updateSyncStatus('connected');
                    reconnectAttempts = 0;
                }

            } catch (e) {
                // Only log once per disconnect, not on every health check failure
                if (isConnected) {
                    console.warn('[RealtimeSync] Connection lost, will retry');
                    this.updateSyncStatus('error');
                    this.attemptReconnect();
                }
                // Silent fail for repeated health checks when already disconnected
            }
        }

        setupConnectivityListeners() {
            window.addEventListener('online', () => {
                console.log('[RealtimeSync] Back online');
                this.updateSyncStatus('reconnecting');
                this.reconnect();
            });

            window.addEventListener('offline', () => {
                console.log('[RealtimeSync] Gone offline');
                this.updateSyncStatus('offline');
            });

            // Reconnect on visibility change
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden && !isConnected && navigator.onLine) {
                    this.reconnect();
                }
            });
        }

        async attemptReconnect() {
            if (reconnectAttempts >= SYNC_CONFIG.MAX_RECONNECT_ATTEMPTS) {
                console.warn('[RealtimeSync] Max reconnect attempts reached');
                this.updateSyncStatus('error');
                return;
            }

            reconnectAttempts++;
            console.log(`[RealtimeSync] Reconnect attempt ${reconnectAttempts}...`);

            setTimeout(() => {
                this.reconnect();
            }, SYNC_CONFIG.RECONNECT_DELAY * reconnectAttempts);
        }

        async reconnect() {
            this.updateSyncStatus('reconnecting');

            // Unsubscribe from all channels
            for (const [table, channel] of this.subscriptions) {
                try {
                    await supabase.removeChannel(channel);
                } catch (e) {}
            }
            this.subscriptions.clear();
            channels = {};

            // Re-subscribe
            await this.subscribeToAllTables();

            // Sync any pending changes
            await this.syncPendingChanges();

            this.updateSyncStatus('connected');
            reconnectAttempts = 0;
        }

        // ============================================
        // PENDING CHANGES (OFFLINE SUPPORT)
        // ============================================

        async syncPendingChanges() {
            if (pendingChanges.length === 0) return;

            console.log(`[RealtimeSync] Syncing ${pendingChanges.length} pending changes...`);
            this.updateSyncStatus('syncing');

            const toSync = [...pendingChanges];
            pendingChanges = [];

            for (const change of toSync) {
                try {
                    const { tableName, data, operation } = change;

                    if (operation === 'delete') {
                        await supabase
                            .from(tableName)
                            .update({ deleted_at: new Date().toISOString() })
                            .eq('id', data.id);
                    } else {
                        await supabase
                            .from(tableName)
                            .upsert(data, { onConflict: 'id' });
                    }
                } catch (e) {
                    console.warn('[RealtimeSync] Failed to sync pending change:', e);
                    pendingChanges.push(change); // Re-queue
                }
            }

            this.updateSyncStatus('synced');
        }

        queuePendingChange(tableName, data, operation = 'upsert') {
            pendingChanges.push({ tableName, data, operation, timestamp: Date.now() });
            
            // Store in localStorage for persistence
            localStorage.setItem('cav_pending_sync', JSON.stringify(pendingChanges));
        }

        loadPendingChanges() {
            try {
                const stored = localStorage.getItem('cav_pending_sync');
                if (stored) {
                    pendingChanges = JSON.parse(stored);
                }
            } catch (e) {}
        }

        // ============================================
        // MANUAL SYNC TRIGGER
        // ============================================

        async forceSync() {
            console.log('[RealtimeSync] Force sync triggered');
            this.updateSyncStatus('syncing');

            try {
                // Sync pending changes
                await this.syncPendingChanges();

                // Trigger UnifiedStorage sync
                if (window.UnifiedStorage) {
                    await window.UnifiedStorage.syncToCloud();
                }

                // Pull latest from cloud
                await this.pullLatestFromCloud();

                this.updateSyncStatus('synced');
                return { success: true };

            } catch (e) {
                console.error('[RealtimeSync] Force sync failed:', e);
                this.updateSyncStatus('error');
                return { success: false, error: e.message };
            }
        }

        async pullLatestFromCloud() {
            if (!window.UnifiedStorage) return;

            for (const table of SYNC_CONFIG.REALTIME_TABLES) {
                try {
                    const storeName = this.tableToStoreName(table);
                    await window.UnifiedStorage.loadFromCloud(storeName);
                } catch (e) {
                    console.warn(`[RealtimeSync] Failed to pull ${table}:`, e);
                }
            }
        }

        // ============================================
        // STATUS & DIAGNOSTICS
        // ============================================

        getStatus() {
            return {
                initialized: this.initialized,
                connected: isConnected,
                userEmail,
                subscribedTables: Array.from(this.subscriptions.keys()),
                pendingChanges: pendingChanges.length,
                lastSyncTime,
                reconnectAttempts
            };
        }

        async runDiagnostics() {
            console.log('============================================');
            console.log('[RealtimeSync] Diagnostics');
            console.log('============================================');
            console.log('Initialized:', this.initialized);
            console.log('Connected:', isConnected);
            console.log('User:', userEmail);
            console.log('Subscriptions:', Array.from(this.subscriptions.keys()));
            console.log('Pending changes:', pendingChanges.length);
            console.log('Last sync:', lastSyncTime);
            console.log('Reconnect attempts:', reconnectAttempts);
            console.log('============================================');

            // Test each subscription
            for (const [table, channel] of this.subscriptions) {
                console.log(`  ${table}: ${channel.state || 'unknown'}`);
            }

            return this.getStatus();
        }
    }

    // ============================================
    // GLOBAL INSTANCE
    // ============================================

    const instance = new RealtimeSync();

    // Auto-initialize when ready
    let initAttempts = 0;
    const maxAttempts = 20;

    function tryInit() {
        initAttempts++;

        if (document.readyState === 'complete' && window.CAVSupabase) {
            instance.init().catch(e => {
                console.warn('[RealtimeSync] Init failed:', e);
            });
        } else if (initAttempts < maxAttempts) {
            setTimeout(tryInit, 500);
        }
    }

    if (document.readyState === 'complete') {
        tryInit();
    } else {
        window.addEventListener('load', tryInit);
    }

    // Export
    window.RealtimeSync = instance;

    // Convenience methods
    window.forceSync = () => instance.forceSync();
    window.getSyncStatus = () => instance.getStatus();
    window.onDataChange = (cb) => instance.onDataChange(cb);
    window.onSyncStatusChange = (cb) => instance.onSyncStatusChange(cb);

    console.log('[RealtimeSync] Module loaded');

})();
