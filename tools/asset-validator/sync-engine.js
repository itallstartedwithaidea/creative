/**
 * Creative Asset Validator - Sync Engine
 * Real-time bidirectional sync with MySQL backend
 * Version 5.11.0 - January 16, 2026
 */

class SyncEngine {
    constructor(options = {}) {
        this.apiBase = options.apiBase || '/api';
        this.autoSyncInterval = options.autoSyncInterval || 30000; // 30 seconds
        this.sessionToken = null;
        this.lastSyncTime = null;
        this.syncInProgress = false;
        this.pendingChanges = [];
        this.listeners = {};
        this.isOnline = navigator.onLine;
        this.syncTimer = null;
        this.deviceId = this.getDeviceId();
        
        // Track sync status
        this.status = {
            connected: false,
            lastSync: null,
            pendingCount: 0,
            error: null
        };
        
        // Bind event handlers
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        
        console.log('[SyncEngine] Initialized', { apiBase: this.apiBase });
    }
    
    // ========================================================
    // EVENT SYSTEM
    // ========================================================
    
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
        return () => this.off(event, callback);
    }
    
    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }
    
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => {
                try {
                    cb(data);
                } catch (e) {
                    console.error('[SyncEngine] Event handler error:', e);
                }
            });
        }
    }
    
    // ========================================================
    // AUTHENTICATION
    // ========================================================
    
    setSessionToken(token) {
        this.sessionToken = token;
        this.status.connected = !!token;
        
        if (token) {
            this.startAutoSync();
        } else {
            this.stopAutoSync();
        }
    }
    
    isAuthenticated() {
        return !!this.sessionToken;
    }
    
    async authenticate(googleIdToken, deviceFingerprint = null) {
        try {
            const response = await this.request('POST', '/auth/google', {
                id_token: googleIdToken,
                device_fingerprint: deviceFingerprint || this.deviceId
            });
            
            if (response.session_token) {
                this.sessionToken = response.session_token;
                localStorage.setItem('cav_session_token', response.session_token);
                this.status.connected = true;
                
                // Start syncing
                this.startAutoSync();
                await this.sync();
                
                this.emit('authenticated', response.user);
                return response;
            }
            
            throw new Error('No session token received');
        } catch (error) {
            console.error('[SyncEngine] Authentication failed:', error);
            this.status.error = error.message;
            throw error;
        }
    }
    
    // Authenticate with session data directly (for Google Sign-In flow)
    async authenticateWithSession(sessionData) {
        try {
            const response = await this.request('POST', '/auth/session', {
                google_id: sessionData.google_id,
                email: sessionData.email,
                name: sessionData.name,
                picture: sessionData.picture,
                role: sessionData.role,
                device_fingerprint: sessionData.device_fingerprint || this.deviceId
            });
            
            if (response.session_token) {
                this.sessionToken = response.session_token;
                localStorage.setItem('cav_session_token', response.session_token);
                this.status.connected = true;
                
                // Start syncing
                this.startAutoSync();
                
                this.emit('authenticated', response.user);
                console.log('[SyncEngine] Session authenticated successfully');
                return response;
            }
            
            throw new Error('No session token received');
        } catch (error) {
            console.error('[SyncEngine] Session authentication failed:', error);
            this.status.error = error.message;
            throw error;
        }
    }
    
    async logout() {
        try {
            await this.request('POST', '/auth/logout');
        } catch (e) {
            // Ignore logout errors
        }
        
        this.sessionToken = null;
        localStorage.removeItem('cav_session_token');
        this.stopAutoSync();
        this.status.connected = false;
        this.emit('logged_out');
    }
    
    async getCurrentUser() {
        return this.request('GET', '/auth/me');
    }
    
    // ========================================================
    // SYNC OPERATIONS
    // ========================================================
    
    async sync() {
        if (this.syncInProgress || !this.sessionToken) {
            return null;
        }
        
        this.syncInProgress = true;
        this.emit('sync_start');
        
        try {
            // Step 1: Push local changes
            if (this.pendingChanges.length > 0) {
                await this.pushChanges();
            }
            
            // Step 2: Pull server changes
            const pullResult = await this.pullChanges();
            
            // Step 3: Apply changes to local storage
            if (pullResult.changes && pullResult.changes.length > 0) {
                await this.applyChanges(pullResult.changes);
            }
            
            // Update status
            this.lastSyncTime = new Date().toISOString();
            this.status.lastSync = this.lastSyncTime;
            this.status.error = null;
            
            localStorage.setItem('cav_last_sync', this.lastSyncTime);
            
            this.emit('sync_complete', {
                pulled: pullResult.changes?.length || 0,
                pushed: this.pendingChanges.length
            });
            
            return pullResult;
            
        } catch (error) {
            console.error('[SyncEngine] Sync failed:', error);
            this.status.error = error.message;
            this.emit('sync_error', error);
            throw error;
            
        } finally {
            this.syncInProgress = false;
        }
    }
    
    async pullChanges() {
        const since = localStorage.getItem('cav_last_sync');
        const url = since ? `/sync/pull?since=${encodeURIComponent(since)}` : '/sync/pull';
        
        return this.request('GET', url);
    }
    
    async pushChanges() {
        if (this.pendingChanges.length === 0) {
            return { results: [] };
        }
        
        const changes = [...this.pendingChanges];
        
        try {
            const result = await this.request('POST', '/sync/push', { changes });
            
            // Clear successfully pushed changes
            this.pendingChanges = this.pendingChanges.filter(c => {
                const pushed = result.results.find(r => r.uuid === c.uuid);
                return !pushed || pushed.status === 'error';
            });
            
            this.status.pendingCount = this.pendingChanges.length;
            this.savePendingChanges();
            
            // Handle conflicts
            if (result.conflicts && result.conflicts.length > 0) {
                this.emit('sync_conflict', result.conflicts);
            }
            
            return result;
            
        } catch (error) {
            console.error('[SyncEngine] Push failed:', error);
            throw error;
        }
    }
    
    async applyChanges(changes) {
        for (const change of changes) {
            try {
                const { entity_type, uuid, action, data } = change;
                
                if (action === 'delete') {
                    await this.deleteFromLocal(entity_type, uuid);
                } else {
                    await this.saveToLocal(entity_type, uuid, data);
                }
                
                this.emit('entity_updated', { entity_type, uuid, action, data });
                
            } catch (error) {
                console.error('[SyncEngine] Failed to apply change:', change, error);
            }
        }
    }
    
    // ========================================================
    // LOCAL STORAGE (IndexedDB)
    // ========================================================
    
    async getDB() {
        if (this._db) return this._db;
        
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('CreativeAssetValidator', 3);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this._db = request.result;
                resolve(this._db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create stores for each entity type
                const stores = [
                    'assets', 
                    'companies', 
                    'contacts',
                    'projects', 
                    'deals',
                    'activities',
                    'creative_analyses',
                    'strategies',
                    'url_analyses',
                    'benchmarks',
                    'brand_kits', 
                    'swipe_files',
                    'user_settings'
                ];
                
                stores.forEach(storeName => {
                    if (!db.objectStoreNames.contains(storeName)) {
                        const store = db.createObjectStore(storeName, { keyPath: 'uuid' });
                        store.createIndex('sync_version', 'sync_version', { unique: false });
                        store.createIndex('needs_sync', 'needs_sync', { unique: false });
                        store.createIndex('deleted_at', 'deleted_at', { unique: false });
                    }
                });
                
                // Pending changes store
                if (!db.objectStoreNames.contains('pending_changes')) {
                    db.createObjectStore('pending_changes', { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    }
    
    async saveToLocal(entityType, uuid, data) {
        const db = await this.getDB();
        
        return new Promise((resolve, reject) => {
            const tx = db.transaction(entityType, 'readwrite');
            const store = tx.objectStore(entityType);
            
            data.uuid = uuid;
            data.needs_sync = 0;
            
            const request = store.put(data);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    async deleteFromLocal(entityType, uuid) {
        const db = await this.getDB();
        
        return new Promise((resolve, reject) => {
            const tx = db.transaction(entityType, 'readwrite');
            const store = tx.objectStore(entityType);
            
            const request = store.delete(uuid);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    async getFromLocal(entityType, uuid) {
        const db = await this.getDB();
        
        return new Promise((resolve, reject) => {
            const tx = db.transaction(entityType, 'readonly');
            const store = tx.objectStore(entityType);
            
            const request = store.get(uuid);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async getAllFromLocal(entityType) {
        const db = await this.getDB();
        
        return new Promise((resolve, reject) => {
            const tx = db.transaction(entityType, 'readonly');
            const store = tx.objectStore(entityType);
            
            const request = store.getAll();
            request.onsuccess = () => {
                // Filter out items marked as deleted
                const allItems = request.result || [];
                const activeItems = allItems.filter(item => !item.deleted_at);
                resolve(activeItems);
            };
            request.onerror = () => reject(request.error);
        });
    }
    
    // ========================================================
    // SAVE WITH SYNC
    // ========================================================
    
    async save(entityType, data) {
        const uuid = data.uuid || this.generateUUID();
        data.uuid = uuid;
        data.needs_sync = 1;
        data.updated_at = new Date().toISOString();
        data.sync_version = (data.sync_version || 0) + 1;
        
        // Save locally first
        await this.saveToLocal(entityType, uuid, data);
        
        // Queue for sync
        this.queueChange({
            entity_type: entityType,
            uuid: uuid,
            action: 'upsert',
            data: data,
            version: data.sync_version
        });
        
        // Try to sync immediately if online
        if (this.isOnline && this.sessionToken) {
            this.sync().catch(e => console.log('[SyncEngine] Background sync failed:', e));
        }
        
        return uuid;
    }
    
    async delete(entityType, uuid) {
        // Mark as deleted locally (for sync purposes)
        const existing = await this.getFromLocal(entityType, uuid);
        if (existing) {
            existing.deleted_at = new Date().toISOString();
            existing.needs_sync = 1;
            await this.saveToLocal(entityType, uuid, existing);
        }
        
        // Queue for sync
        this.queueChange({
            entity_type: entityType,
            uuid: uuid,
            action: 'delete',
            version: existing?.sync_version || 0
        });
        
        // Try to sync immediately
        if (this.isOnline && this.sessionToken) {
            try {
                await this.sync();
                // After successful sync, actually remove from IndexedDB
                await this.deleteFromLocal(entityType, uuid);
                console.log(`[SyncEngine] Successfully deleted ${entityType} ${uuid}`);
            } catch (e) {
                console.log('[SyncEngine] Background sync failed:', e);
                // Keep the deleted_at mark so it will be filtered out
            }
        }
    }
    
    queueChange(change) {
        // Avoid duplicates
        this.pendingChanges = this.pendingChanges.filter(c => 
            !(c.entity_type === change.entity_type && c.uuid === change.uuid)
        );
        
        this.pendingChanges.push(change);
        this.status.pendingCount = this.pendingChanges.length;
        this.savePendingChanges();
        
        this.emit('pending_change', change);
    }
    
    savePendingChanges() {
        localStorage.setItem('cav_pending_changes', JSON.stringify(this.pendingChanges));
    }
    
    loadPendingChanges() {
        try {
            const saved = localStorage.getItem('cav_pending_changes');
            this.pendingChanges = saved ? JSON.parse(saved) : [];
            this.status.pendingCount = this.pendingChanges.length;
        } catch (e) {
            this.pendingChanges = [];
        }
    }
    
    // ========================================================
    // AUTO SYNC
    // ========================================================
    
    startAutoSync() {
        this.stopAutoSync();
        
        this.loadPendingChanges();
        this.lastSyncTime = localStorage.getItem('cav_last_sync');
        
        // Initial sync
        this.sync().catch(e => console.log('[SyncEngine] Initial sync failed:', e));
        
        // Set up interval
        this.syncTimer = setInterval(() => {
            if (this.isOnline) {
                this.sync().catch(e => console.log('[SyncEngine] Auto sync failed:', e));
            }
        }, this.autoSyncInterval);
        
        console.log('[SyncEngine] Auto sync started');
    }
    
    stopAutoSync() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = null;
        }
        console.log('[SyncEngine] Auto sync stopped');
    }
    
    // ========================================================
    // NETWORK STATUS
    // ========================================================
    
    handleOnline() {
        console.log('[SyncEngine] Back online');
        this.isOnline = true;
        this.emit('online');
        
        // Sync pending changes
        if (this.sessionToken && this.pendingChanges.length > 0) {
            this.sync().catch(e => console.log('[SyncEngine] Reconnect sync failed:', e));
        }
    }
    
    handleOffline() {
        console.log('[SyncEngine] Offline');
        this.isOnline = false;
        this.emit('offline');
    }
    
    // ========================================================
    // API REQUESTS
    // ========================================================
    
    async request(method, path, body = null) {
        const url = `${this.apiBase}${path}`;
        
        const headers = {
            'Content-Type': 'application/json',
            'X-Device-Id': this.deviceId
        };
        
        if (this.sessionToken) {
            headers['Authorization'] = `Bearer ${this.sessionToken}`;
        }
        
        const options = {
            method,
            headers,
            credentials: 'include'
        };
        
        if (body && method !== 'GET') {
            options.body = JSON.stringify(body);
        }
        
        try {
            const response = await fetch(url, options);
            const data = await response.json();
            
            if (!response.ok) {
                if (response.status === 401) {
                    this.emit('auth_required');
                }
                throw new Error(data.message || `HTTP ${response.status}`);
            }
            
            return data;
            
        } catch (error) {
            console.error('[SyncEngine] Request failed:', method, path, error);
            throw error;
        }
    }
    
    // ========================================================
    // UTILITIES
    // ========================================================
    
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    getDeviceId() {
        let deviceId = localStorage.getItem('cav_device_id');
        if (!deviceId) {
            deviceId = this.generateUUID();
            localStorage.setItem('cav_device_id', deviceId);
        }
        return deviceId;
    }
    
    getStatus() {
        return {
            ...this.status,
            isOnline: this.isOnline,
            syncInProgress: this.syncInProgress,
            lastSync: this.lastSyncTime
        };
    }
    
    // ========================================================
    // CONVENIENCE METHODS
    // ========================================================
    
    // Assets
    async saveAsset(data) { return this.save('assets', data); }
    async getAsset(uuid) { return this.getFromLocal('assets', uuid); }
    async getAllAssets() { return this.getAllFromLocal('assets'); }
    async deleteAsset(uuid) { return this.delete('assets', uuid); }
    
    // Companies
    async saveCompany(data) { return this.save('companies', data); }
    async getCompany(uuid) { return this.getFromLocal('companies', uuid); }
    async getAllCompanies() { return this.getAllFromLocal('companies'); }
    async deleteCompany(uuid) { return this.delete('companies', uuid); }
    
    // Projects
    async saveProject(data) { return this.save('projects', data); }
    async getProject(uuid) { return this.getFromLocal('projects', uuid); }
    async getAllProjects() { return this.getAllFromLocal('projects'); }
    async deleteProject(uuid) { return this.delete('projects', uuid); }
    
    // Contacts
    async saveContact(data) { return this.save('contacts', data); }
    async getContact(uuid) { return this.getFromLocal('contacts', uuid); }
    async getAllContacts() { return this.getAllFromLocal('contacts'); }
    async deleteContact(uuid) { return this.delete('contacts', uuid); }
    
    // Deals
    async saveDeal(data) { return this.save('deals', data); }
    async getDeal(uuid) { return this.getFromLocal('deals', uuid); }
    async getAllDeals() { return this.getAllFromLocal('deals'); }
    async deleteDeal(uuid) { return this.delete('deals', uuid); }
    
    // Strategies
    async saveStrategy(data) { return this.save('strategies', data); }
    async getStrategy(uuid) { return this.getFromLocal('strategies', uuid); }
    async getAllStrategies() { return this.getAllFromLocal('strategies'); }
    async deleteStrategy(uuid) { return this.delete('strategies', uuid); }
    
    // Creative Analyses
    async saveCreativeAnalysis(data) { return this.save('creative_analyses', data); }
    async getCreativeAnalysis(uuid) { return this.getFromLocal('creative_analyses', uuid); }
    async getAllCreativeAnalyses() { return this.getAllFromLocal('creative_analyses'); }
    async deleteCreativeAnalysis(uuid) { return this.delete('creative_analyses', uuid); }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SyncEngine;
}

// Global instance
window.SyncEngine = SyncEngine;
window.syncEngine = null; // Will be initialized when app starts

console.log('[SyncEngine] Module loaded');

