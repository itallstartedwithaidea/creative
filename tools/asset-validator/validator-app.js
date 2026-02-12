/**
 * Creative Asset Validator - Enhanced React Application
 * Version 5.11.0 - January 16, 2026
 * 
 * Features:
 * - Drag & Drop Upload
 * - Bulk Actions & Batch Tagging
 * - Sorting & Filtering
 * - Video Preview with Playback
 * - Duplicate Detection
 * - User Attribution
 * - Confirmation Dialogs
 * - Favorites/Starred Assets
 * - Archive/Trash (Soft Delete)
 * - Resolution Recommendations
 * - Keyboard Shortcuts
 * - Storage Quota Display
 * - Download Original
 * - File Rename
 * - WordPress REST API Integration
 * - LocalStorage Fallback
 * - Role-Based Access Control (Admin/Editor/Viewer)
 * - Permission-Based UI
 * - TRUE PAGINATION (v2.2.0)
 * - Processing Queue Integration (v2.2.0)
 * - Batch Operations Integration (v2.2.0)
 * - Folders/Collections Integration (v2.2.0)
 */

(function() {
  'use strict';

  // ============================================
  // CHANNEL SPECIFICATIONS
  // ============================================
  const CHANNEL_SPECS = {
    'YouTube Standard': {
      aspectRatios: ['16:9'],
      minDuration: 6,
      maxDuration: null,
      maxFileSizeMB: null,
      resolutions: [{ width: 1920, height: 1080, label: 'HD' }, { width: 1280, height: 720, label: 'HD' }]
    },
    'YouTube Shorts': {
      aspectRatios: ['9:16'],
      minDuration: null,
      maxDuration: 60,
      maxFileSizeMB: null,
      resolutions: [{ width: 1080, height: 1920, label: 'Vertical' }]
    },
    'Meta Feed (Video)': {
      aspectRatios: ['1:1', '4:5', '16:9'],
      minDuration: 1,
      maxDuration: 241,
      maxFileSizeMB: 4096,
      resolutions: [
        { width: 1080, height: 1080, label: 'Square' },
        { width: 1080, height: 1350, label: 'Vertical' },
        { width: 1080, height: 566, label: 'Landscape' }
      ]
    },
    'Meta Stories': {
      aspectRatios: ['9:16'],
      minDuration: 1,
      maxDuration: 120,
      maxFileSizeMB: 4096,
      resolutions: [{ width: 1080, height: 1920, label: 'Vertical' }]
    },
    'Meta Reels': {
      aspectRatios: ['9:16'],
      minDuration: 3,
      maxDuration: 90,
      maxFileSizeMB: 4096,
      resolutions: [{ width: 1080, height: 1920, label: 'Vertical' }]
    },
    'TikTok': {
      aspectRatios: ['9:16'],
      minDuration: 5,
      maxDuration: 60,
      maxFileSizeMB: 287,
      resolutions: [{ width: 1080, height: 1920, label: 'Vertical' }]
    },
    'Instagram Feed': {
      aspectRatios: ['1:1', '4:5', '1.91:1'],
      minDuration: 3,
      maxDuration: 60,
      maxFileSizeMB: null,
      resolutions: [
        { width: 1080, height: 1080, label: 'Square' },
        { width: 1080, height: 1350, label: 'Vertical' },
        { width: 1080, height: 566, label: 'Landscape' }
      ]
    },
    'Instagram Stories': {
      aspectRatios: ['9:16'],
      minDuration: 3,
      maxDuration: 60,
      maxFileSizeMB: null,
      resolutions: [{ width: 1080, height: 1920, label: 'Vertical' }]
    },
    'Instagram Reels': {
      aspectRatios: ['9:16'],
      minDuration: 3,
      maxDuration: 90,
      maxFileSizeMB: null,
      resolutions: [{ width: 1080, height: 1920, label: 'Vertical' }]
    },
    'LinkedIn Feed': {
      aspectRatios: ['1.91:1', '1:1', '4:5'],
      minDuration: 3,
      maxDuration: 600,
      maxFileSizeMB: null,
      resolutions: [
        { width: 1200, height: 627, label: 'Landscape' },
        { width: 1200, height: 1200, label: 'Square' },
        { width: 720, height: 900, label: 'Vertical' }
      ]
    },
    'X (Twitter) Feed': {
      aspectRatios: ['16:9', '1:1', '9:16'],
      minDuration: null,
      maxDuration: 140,
      maxFileSizeMB: 512,
      resolutions: [
        { width: 1280, height: 720, label: 'Landscape' },
        { width: 720, height: 720, label: 'Square' },
        { width: 720, height: 1280, label: 'Vertical' }
      ]
    },
    'Google Ads Display': {
      aspectRatios: ['1.91:1', '1:1'],
      minDuration: null,
      maxDuration: null,
      maxFileSizeMB: null,
      resolutions: [
        { width: 1200, height: 628, label: 'Horizontal' },
        { width: 1200, height: 1200, label: 'Square' }
      ]
    },
    'Google Ads Video': {
      aspectRatios: ['16:9', '1:1', '9:16'],
      minDuration: 10,
      maxDuration: null,
      maxFileSizeMB: null,
      resolutions: [
        { width: 1920, height: 1080, label: 'Horizontal' },
        { width: 1080, height: 1080, label: 'Square' },
        { width: 1080, height: 1920, label: 'Vertical' }
      ]
    }
  };

  const IMAGE_SPECS = {
    'Instagram Feed': {
      aspectRatios: ['1:1', '4:5', '1.91:1'],
      resolutions: [
        { width: 1080, height: 1080, label: 'Square' },
        { width: 1080, height: 1350, label: 'Vertical' },
        { width: 1080, height: 566, label: 'Landscape' }
      ],
      maxFileSizeMB: null
    },
    'Instagram Stories': {
      aspectRatios: ['9:16'],
      resolutions: [{ width: 1080, height: 1920, label: 'Vertical' }],
      maxFileSizeMB: null
    },
    'Facebook Feed': {
      aspectRatios: ['1.91:1', '1:1', '4:5'],
      resolutions: [
        { width: 1080, height: 566, label: 'Landscape' },
        { width: 1080, height: 1080, label: 'Square' },
        { width: 1080, height: 1350, label: 'Vertical' }
      ],
      maxFileSizeMB: null
    },
    'Facebook Stories': {
      aspectRatios: ['9:16'],
      resolutions: [{ width: 1080, height: 1920, label: 'Vertical' }],
      maxFileSizeMB: 30
    },
    'LinkedIn Feed': {
      aspectRatios: ['1.91:1', '1:1', '4:5'],
      resolutions: [
        { width: 1200, height: 627, label: 'Landscape' },
        { width: 1200, height: 1200, label: 'Square' },
        { width: 720, height: 900, label: 'Vertical' }
      ],
      maxFileSizeMB: 5
    },
    'X (Twitter) Feed': {
      aspectRatios: ['16:9', '1:1', '9:16'],
      resolutions: [
        { width: 1280, height: 720, label: 'Landscape' },
        { width: 720, height: 720, label: 'Square' },
        { width: 720, height: 1280, label: 'Vertical' }
      ],
      maxFileSizeMB: 5
    },
    'Pinterest': {
      aspectRatios: ['2:3', '9:16', '1:1'],
      resolutions: [
        { width: 1000, height: 1500, label: 'Standard Pin' },
        { width: 1080, height: 1920, label: 'Story Pin' },
        { width: 1000, height: 1000, label: 'Square' }
      ],
      maxFileSizeMB: 20
    },
    'Google Ads Display': {
      aspectRatios: ['1.91:1', '1:1', '4:5'],
      resolutions: [
        { width: 1200, height: 628, label: 'Horizontal' },
        { width: 1200, height: 1200, label: 'Square' },
        { width: 960, height: 1200, label: 'Vertical' }
      ],
      maxFileSizeMB: 5
    },
    'TikTok Profile': {
      aspectRatios: ['1:1'],
      resolutions: [{ width: 20, height: 20, label: 'Minimum' }],
      maxFileSizeMB: null
    }
  };

  // ============================================
  // STORAGE ABSTRACTION LAYER (v3.0 - Secure)
  // ============================================
  class StorageManager {
    constructor() {
      // Only use WordPress mode if cavSettings has a valid apiUrl
      // This prevents false positive detection in standalone mode
      this.isWordPress = typeof cavSettings !== 'undefined' && 
                         cavSettings !== null && 
                         typeof cavSettings.apiUrl === 'string' && 
                         cavSettings.apiUrl.length > 0;
      this.apiUrl = this.isWordPress ? cavSettings.apiUrl : null;
      this.nonce = this.isWordPress ? cavSettings.nonce : null;
      
      // Check for secure session from security module, then Google SSO, then WordPress
      let userIdentifier = 'anonymous';
      let userEmail = null;
      let userDomain = null;
      
      // Priority 1: Security module secure session
      const secureSession = window.CAVSecurity?.SecureSessionManager?.getSession();
      
      if (secureSession && secureSession.email) {
        userIdentifier = secureSession.email;
        userEmail = secureSession.email;
        userDomain = userEmail.split('@')[1]?.toLowerCase() || null;
        this.userSession = secureSession;
        console.log('[CAV Storage] Using secure session:', secureSession.id?.substring(0, 15) + '...');
      } else if (window.cavUserSession && window.cavUserSession.email) {
        // Priority 2: Legacy Google SSO session
        userIdentifier = window.cavUserSession.email;
        userEmail = window.cavUserSession.email;
        userDomain = userEmail.split('@')[1]?.toLowerCase() || null;
        this.userSession = window.cavUserSession;
      } else if (this.isWordPress) {
        userIdentifier = cavSettings.userName || 'default';
      } else {
        userIdentifier = localStorage.getItem('cav_user_name') || 'anonymous';
      }
      
      // User-specific storage key for data separation between users
      const userKey = userIdentifier.toLowerCase().replace(/[^a-z0-9]/g, '_');
      this.localStorageKey = `cav_assets_${userKey}`;
      this.userEmail = userEmail;
      this.userDomain = userDomain;
      
      // Team storage key - based on domain for corporate users
      // Each corporate domain has its own team storage
      this.teamStorageKey = userDomain ? `cav_team_${userDomain.replace(/[^a-z0-9]/g, '_')}` : null;
      
      // Team access based on user type - check secure session first
      this.canAccessTeam = secureSession?.canAccessTeam || window.cavUserSession?.canAccessTeam || false;
      this.userType = secureSession?.userType || window.cavUserSession?.userType || 'personal';
      this.userRole = secureSession?.role || window.cavUserSession?.role || 'viewer';
      
      // Permissions from session - merge secure session permissions
      // Get role first to derive permissions if not explicitly set
      const sessionRole = this.userRole;
      const defaultPerms = {
        canUpload: sessionRole === 'admin' || sessionRole === 'editor',
        canEdit: sessionRole === 'admin' || sessionRole === 'editor',
        canDelete: sessionRole === 'admin',
        canManageUsers: sessionRole === 'admin',
        canAccessTeam: this.canAccessTeam
      };
      
      this.permissions = {
        ...defaultPerms,
        ...(secureSession?.permissions || window.cavUserSession?.permissions || {})
      };
      
      console.log('[CAV Storage] User role:', sessionRole, 'Derived permissions:', this.permissions);
      
      // Video storage limits - Using IndexedDB for larger storage
      this.maxVideoUploadMB = 100; // Max 100MB per video upload
      this.maxVideoUploadBytes = this.maxVideoUploadMB * 1024 * 1024;
      this.maxVideoStorageMB = 500; // Max 500MB total video storage per user
      this.maxVideoStorageBytes = this.maxVideoStorageMB * 1024 * 1024;
      
      // IndexedDB database name and version - Use v4 for complete schema
      this.dbName = 'CAV_SecureDB_v4';
      this.dbVersion = 4;
      this.db = null;
      this.dbReady = this.initIndexedDB();
      
      // Debug logging
      if (this.isWordPress) {
        console.log('[CAV Storage] WordPress mode detected');
        console.log('[CAV Storage] API URL:', this.apiUrl);
        console.log('[CAV Storage] User:', cavSettings.userName);
      } else if (secureSession) {
        console.log('[CAV Storage] Secure session mode (encrypted)');
        console.log('[CAV Storage] User:', secureSession.name);
        console.log('[CAV Storage] Session ID:', secureSession.id?.substring(0, 20) + '...');
        console.log('[CAV Storage] Expires:', new Date(secureSession.expiresAt).toLocaleString());
        console.log('[CAV Storage] User domain:', this.userDomain);
        console.log('[CAV Storage] User type:', this.userType);
        console.log('[CAV Storage] Permissions:', this.permissions);
      } else if (window.cavUserSession) {
        console.log('[CAV Storage] Legacy SSO mode with IndexedDB storage');
        console.log('[CAV Storage] User:', window.cavUserSession.name);
        console.log('[CAV Storage] User domain:', this.userDomain);
      } else {
        console.log('[CAV Storage] Standalone mode (no session)');
      }
      console.log('[CAV Storage] User storage key:', this.localStorageKey);
    }
    
    // ============================================
    // INDEXEDDB INITIALIZATION (v3.0 - Shared with Security Module)
    // ============================================
    async initIndexedDB() {
      return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
          console.warn('[CAV Storage] IndexedDB not supported, falling back to localStorage');
          this.useIndexedDB = false;
          resolve(false);
          return;
        }
        
        // First, try to get DB from security module if available
        if (window.CAVSecurity?.SecureDataPersistence?.db) {
          this.db = window.CAVSecurity.SecureDataPersistence.db;
          this.useIndexedDB = true;
          console.log('[CAV Storage] Using security module IndexedDB instance');
          console.log('[CAV Storage] Available stores:', Array.from(this.db.objectStoreNames));
          resolve(true);
          return;
        }
        
        // Otherwise open our own connection
        const request = indexedDB.open(this.dbName, this.dbVersion);
        
        request.onerror = (event) => {
          console.error('[CAV Storage] IndexedDB error:', event.target.error);
          this.useIndexedDB = false;
          resolve(false);
        };
        
        request.onsuccess = (event) => {
          this.db = event.target.result;
          this.useIndexedDB = true;
          console.log('[CAV Storage] IndexedDB v4 initialized successfully');
          
          // Verify database has required stores
          const storeNames = Array.from(this.db.objectStoreNames);
          console.log('[CAV Storage] Available stores:', storeNames.join(', '));
          
          // Verify required stores exist
          const requiredStores = ['assets', 'video_blobs', 'preferences'];
          const missingStores = requiredStores.filter(s => !storeNames.includes(s));
          if (missingStores.length > 0) {
            console.warn('[CAV Storage] Missing stores:', missingStores.join(', '));
            console.warn('[CAV Storage] Database may need upgrade. Attempting recovery...');
            // Close and delete the database to force a clean upgrade
            this.db.close();
            indexedDB.deleteDatabase(this.dbName);
            // Retry
            setTimeout(() => {
              this.initIndexedDB().then(resolve);
            }, 100);
            return;
          }
          
          resolve(true);
        };
        
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          const oldVersion = event.oldVersion;
          console.log('[CAV Storage] Upgrading from v' + oldVersion + ' to v' + this.dbVersion);
          
          // Delete old stores for clean upgrade
          ['assets', 'video_blobs', 'preferences', 'api_keys'].forEach(storeName => {
            if (db.objectStoreNames.contains(storeName)) {
              try {
                db.deleteObjectStore(storeName);
                console.log('[CAV Storage] Deleted old store:', storeName);
              } catch (e) {
                console.warn('[CAV Storage] Could not delete store:', storeName);
              }
            }
          });
          
          // Create assets store with ALL indexes
          const assetsStore = db.createObjectStore('assets', { keyPath: 'id' });
          assetsStore.createIndex('user_key', 'user_key', { unique: false });
          assetsStore.createIndex('team_key', 'team_key', { unique: false });
          assetsStore.createIndex('is_team', 'is_team', { unique: false });
          assetsStore.createIndex('file_hash', 'file_hash', { unique: false });
          assetsStore.createIndex('created_at', 'created_at', { unique: false });
          assetsStore.createIndex('status', 'status', { unique: false });
          console.log('[CAV Storage] Created assets store');
          
          // Create video blobs store
          const videosStore = db.createObjectStore('video_blobs', { keyPath: 'asset_id' });
          videosStore.createIndex('user_key', 'user_key', { unique: false });
          console.log('[CAV Storage] Created video_blobs store');
          
          // Create preferences store
          db.createObjectStore('preferences', { keyPath: 'user_key' });
          console.log('[CAV Storage] Created preferences store');
          
          // Create API keys store
          const apiKeysStore = db.createObjectStore('api_keys', { keyPath: 'user_key' });
          apiKeysStore.createIndex('updated_at', 'updated_at', { unique: false });
          console.log('[CAV Storage] Created api_keys store');
          
          console.log('[CAV Storage] IndexedDB v4 schema complete');
        };
      });
    }
    
    // ============================================
    // PERMISSION CHECKS
    // ============================================
    canUpload() {
      // Always allow upload if no session system or if permissions explicitly allow
      if (!window.cavUserSession) return true;
      
      // Get fresh permissions from session
      const session = window.cavUserSession;
      const role = session.role || 'viewer';
      
      // Admin and editor can always upload
      if (role === 'admin' || role === 'editor') return true;
      
      // Fall back to permissions object
      return this.permissions.canUpload === true;
    }
    
    canEdit() {
      if (!window.cavUserSession) return true;
      
      const session = window.cavUserSession;
      const role = session.role || 'viewer';
      
      if (role === 'admin' || role === 'editor') return true;
      
      return this.permissions.canEdit === true;
    }
    
    canDelete() {
      if (!window.cavUserSession) return true;
      
      const session = window.cavUserSession;
      const role = session.role || 'viewer';
      
      // Only admin can delete
      if (role === 'admin') return true;
      
      return this.permissions.canDelete === true;
    }
    
    canDeleteAsset(asset) {
      if (!window.cavUserSession) return true;
      if (this.canDelete()) return true;
      // Editors can delete their own assets
      if (this.canEdit() && asset.user_email === this.userEmail) return true;
      return false;
    }
    
    // ============================================
    // API KEY STORAGE (Persistent per user)
    // ============================================
    async saveApiKeys(keys) {
      if (!this.db || !this.userEmail) {
        console.warn('[CAV Storage] Cannot save API keys - no DB or user');
        return false;
      }
      
      const userKey = this.localStorageKey;
      
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction('api_keys', 'readwrite');
          const store = tx.objectStore('api_keys');
          
          store.put({
            user_key: userKey,
            keys: keys,
            user_email: this.userEmail,
            updated_at: new Date().toISOString()
          });
          
          tx.oncomplete = () => {
            console.log('[CAV Storage] API keys saved for:', this.userEmail);
            resolve(true);
          };
          tx.onerror = (e) => {
            console.error('[CAV Storage] Failed to save API keys:', e);
            resolve(false);
          };
        } catch (e) {
          console.error('[CAV Storage] API key save error:', e);
          resolve(false);
        }
      });
    }
    
    async loadApiKeys() {
      if (!this.db) {
        console.warn('[CAV Storage] Cannot load API keys - no DB');
        return null;
      }
      
      const userKey = this.localStorageKey;
      
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction('api_keys', 'readonly');
          const store = tx.objectStore('api_keys');
          const request = store.get(userKey);
          
          request.onsuccess = () => {
            const result = request.result;
            if (result && result.keys) {
              console.log('[CAV Storage] API keys loaded for:', this.userEmail);
              resolve(result.keys);
            } else {
              resolve(null);
            }
          };
          request.onerror = () => resolve(null);
        } catch (e) {
          console.error('[CAV Storage] API key load error:', e);
          resolve(null);
        }
      });
    }
    
    // ============================================
    // VIDEO STORAGE CHECKS
    // ============================================
    isVideoTooLarge(fileSize) {
      return fileSize > this.maxVideoUploadBytes;
    }
    
    async getVideoStorageUsed() {
      await this.dbReady;
      
      if (this.useIndexedDB && this.db) {
        return new Promise((resolve) => {
          const transaction = this.db.transaction(['video_blobs'], 'readonly');
          const store = transaction.objectStore('video_blobs');
          const request = store.getAll();
          
          request.onsuccess = () => {
            let totalSize = 0;
            request.result.forEach(blob => {
              if (blob.user_key === this.localStorageKey) {
                totalSize += blob.size || 0;
              }
            });
            resolve(totalSize);
          };
          
          request.onerror = () => resolve(0);
        });
      }
      
      // Fallback to localStorage calculation
      const assets = this.getAllLocalAssets();
      let totalVideoSize = 0;
      assets.forEach(asset => {
        if (asset.file_type === 'video' && asset.video_url) {
          const base64Length = asset.video_url.length - (asset.video_url.indexOf(',') + 1);
          totalVideoSize += (base64Length * 3) / 4;
        }
      });
      return totalVideoSize;
    }
    
    async getVideoStorageRemaining() {
      const used = await this.getVideoStorageUsed();
      return Math.max(0, this.maxVideoStorageBytes - used);
    }
    
    async canStoreVideo(videoFileSize) {
      if (videoFileSize > this.maxVideoUploadBytes) {
        return { 
          allowed: false, 
          reason: `Video exceeds ${this.maxVideoUploadMB}MB upload limit` 
        };
      }
      
      const remaining = await this.getVideoStorageRemaining();
      if (videoFileSize > remaining) {
        const used = await this.getVideoStorageUsed();
        const usedMB = (used / (1024 * 1024)).toFixed(1);
        return { 
          allowed: false, 
          reason: `Video storage full (${usedMB}MB of ${this.maxVideoStorageMB}MB used). Delete some videos to free space.` 
        };
      }
      
      return { allowed: true };
    }
    
    async getVideoStorageInfo() {
      const used = await this.getVideoStorageUsed();
      return {
        usedBytes: used,
        usedMB: (used / (1024 * 1024)).toFixed(1),
        maxMB: this.maxVideoStorageMB,
        remainingMB: ((this.maxVideoStorageBytes - used) / (1024 * 1024)).toFixed(1),
        percentUsed: Math.round((used / this.maxVideoStorageBytes) * 100)
      };
    }
    
    getMaxVideoSizeMB() {
      return this.maxVideoUploadMB;
    }

    // ============================================
    // MAIN STORAGE METHODS
    // ============================================
    async getAssets(params = {}) {
      if (this.isWordPress) {
        return this.wpGetAssets(params);
      }
      return this.idbGetAssets(params);
    }

    async saveAsset(asset) {
      if (this.isWordPress) {
        return this.wpSaveAsset(asset);
      }
      return this.idbSaveAsset(asset);
    }

    async updateAsset(id, data) {
      if (this.isWordPress) {
        return this.wpUpdateAsset(id, data);
      }
      return this.idbUpdateAsset(id, data);
    }

    async deleteAsset(id) {
      if (this.isWordPress) {
        return this.wpDeleteAsset(id);
      }
      return this.idbDeleteAsset(id);
    }

    async bulkOperation(operation, assetIds, data = {}) {
      if (this.isWordPress) {
        return this.wpBulkOperation(operation, assetIds, data);
      }
      return this.idbBulkOperation(operation, assetIds, data);
    }
    
    // ============================================
    // INDEXEDDB STORAGE METHODS
    // ============================================
    async idbGetAssets(params = {}) {
      await this.dbReady;
      
      if (!this.useIndexedDB || !this.db) {
        return this.localGetAssets(params);
      }
      
      return new Promise(async (resolve) => {
        const transaction = this.db.transaction(['assets', 'video_blobs'], 'readonly');
        const assetsStore = transaction.objectStore('assets');
        const videosStore = transaction.objectStore('video_blobs');
        const request = assetsStore.getAll();
        
        // Load cloud assets in parallel
        const cloudAssetsPromise = this.loadAssetsFromSupabase();
        
        request.onsuccess = async () => {
          let assets = request.result || [];
          
          // Merge with cloud assets (for cross-device sync)
          try {
            const cloudAssets = await cloudAssetsPromise;
            if (cloudAssets && cloudAssets.length > 0) {
              // Get existing asset UUIDs
              const localUuids = new Set(assets.map(a => a.uuid || a.id));
              
              // Add cloud assets that don't exist locally
              for (const cloudAsset of cloudAssets) {
                if (!localUuids.has(cloudAsset.uuid)) {
                  // Convert cloud asset format to local format
                  assets.push({
                    ...cloudAsset,
                    id: cloudAsset.uuid,
                    user_key: this.localStorageKey,
                    from_cloud: true
                  });
                }
              }
            }
          } catch (e) {
            console.warn('[CAV] Cloud asset merge failed:', e);
          }
          
          // Filter out deleted assets (from sync-engine)
          assets = assets.filter(a => !a.deleted_at);
          
          // Filter by user or team
          const isTeamMode = params.is_team === true || params.is_team === 'true';
          
          if (isTeamMode && this.canAccessTeam && this.teamStorageKey) {
            // Team mode: show assets from same domain
            assets = assets.filter(a => a.is_team && a.team_key === this.teamStorageKey);
          } else {
            // Personal mode: show only user's assets
            assets = assets.filter(a => !a.is_team && a.user_key === this.localStorageKey);
          }
          
          // Filter out trashed unless specifically requested
          // Check both is_trashed and is_archived for backwards compatibility
          if (!params.include_trash) {
            assets = assets.filter(a => !a.is_trashed && !a.is_archived);
          } else if (params.trash_only) {
            assets = assets.filter(a => a.is_trashed || a.is_archived);
          }
          
          // Filter favorites
          if (params.favorites_only) {
            assets = assets.filter(a => a.is_favorite);
          }
          
          // Attach video URLs from video_blobs store
          for (let asset of assets) {
            if (asset.file_type === 'video' && asset.has_video_blob) {
              const videoRequest = videosStore.get(asset.id);
              await new Promise((res) => {
                videoRequest.onsuccess = () => {
                  if (videoRequest.result) {
                    asset.video_url = videoRequest.result.data_url;
                  }
                  res();
                };
                videoRequest.onerror = () => res();
              });
            }
          }
          
          // Sort
          const sortBy = params.sort_by || 'created_at';
          const sortOrder = params.sort_order || 'DESC';
          assets.sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];
            if (sortBy === 'created_at') {
              aVal = new Date(aVal).getTime();
              bVal = new Date(bVal).getTime();
            }
            return sortOrder === 'DESC' ? bVal - aVal : aVal - bVal;
          });
          
          resolve({
            assets,
            total: assets.length,
            page: 1,
            per_page: assets.length
          });
        };
        
        request.onerror = () => {
          console.error('[CAV] IndexedDB getAssets error');
          resolve(this.localGetAssets(params));
        };
      });
    }
    
    async idbSaveAsset(asset) {
      await this.dbReady;
      
      // For videos, we MUST use IndexedDB - localStorage can't handle the size
      if (!this.useIndexedDB || !this.db) {
        if (asset.file_type === 'video' && asset.video_url) {
          console.error('[CAV] IndexedDB not available - cannot store video');
          return { success: false, message: 'IndexedDB required for video storage. Please use a modern browser.' };
        }
        return this.localSaveAsset(asset);
      }
      
      // Generate UUID for Supabase sync
      const assetUuid = asset.uuid || asset.id || `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      return new Promise((resolve) => {
        const newAsset = {
          ...asset,
          uuid: assetUuid, // Ensure UUID exists for Supabase
          id: asset.id || `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          user_key: this.localStorageKey,
          team_key: asset.is_team ? this.teamStorageKey : null,
          user_email: this.userEmail,
          user_domain: this.userDomain,
          created_at: asset.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          comments: asset.comments || [],
          history: asset.history || [{ action: 'uploaded', timestamp: new Date().toISOString(), user_name: this.getCurrentUserName() }]
        };
        
        // Store video data separately if it's a video
        let videoDataUrl = null;
        if (asset.file_type === 'video' && asset.video_url) {
          videoDataUrl = asset.video_url;
          newAsset.has_video_blob = true;
          delete newAsset.video_url; // Don't store in main assets store
        }
        
        const transaction = this.db.transaction(['assets', 'video_blobs'], 'readwrite');
        const assetsStore = transaction.objectStore('assets');
        
        // Use put() instead of add() to handle updates/duplicates gracefully
        const request = assetsStore.put(newAsset);
        
        request.onsuccess = () => {
          // If video, also store the video blob
          if (videoDataUrl) {
            const videosStore = transaction.objectStore('video_blobs');
            const base64Length = videoDataUrl.length - (videoDataUrl.indexOf(',') + 1);
            const estimatedSize = (base64Length * 3) / 4;
            
            videosStore.add({
              asset_id: newAsset.id,
              user_key: this.localStorageKey,
              data_url: videoDataUrl,
              size: estimatedSize
            });
          }
          
          // SYNC TO SUPABASE for cross-device access (images only - videos too large)
          if (newAsset.file_type !== 'video') {
            this.syncAssetToSupabase(newAsset).catch(e => 
              console.warn('[CAV] Supabase asset sync failed:', e)
            );
          }
          
          // Return asset with video_url attached for immediate use
          newAsset.video_url = videoDataUrl;
          resolve({ success: true, asset: newAsset });
        };
        
        request.onerror = (event) => {
          console.error('[CAV] IndexedDB save error:', event.target.error);
          resolve({ success: false, message: 'Failed to save asset' });
        };
      });
    }
    
    // Sync asset metadata to Supabase for cross-device access
    async syncAssetToSupabase(asset) {
      if (!window.CAVSupabase?.saveAsset) return;
      
      // ROBUST: Get user email from multiple sources
      const userEmail = this.getCurrentUserEmail();
      if (!userEmail || userEmail === 'anonymous') {
        console.warn('[CAV] No user email for asset sync, skipping');
        return;
      }
      
      try {
        // Create a metadata-only version (no large data URLs)
        const assetMetadata = {
          uuid: asset.uuid || asset.id,
          user_email: userEmail,
          owner_email: userEmail,
          filename: asset.filename || asset.name,
          name: asset.name || asset.filename,
          file_type: asset.file_type,
          mime_type: asset.mime_type,
          file_size: asset.file_size,
          width: asset.width,
          height: asset.height,
          duration: asset.duration,
          aspect_ratio: asset.aspect_ratio,
          tags: asset.tags || {},
          channels: asset.channels || [],
          status: asset.status || 'ready',
          is_favorite: asset.is_favorite || false,
          is_team: asset.is_team || false,
          thumbnail_url: asset.thumbnail_url || null, // Small thumbnail is OK
          external_url: asset.external_url || asset.cloudinary_url || null,
          metadata: {
            original_filename: asset.filename,
            created_by: asset.created_by || userEmail,
            source: asset.source || 'upload'
          },
          created_at: asset.created_at,
          updated_at: new Date().toISOString()
        };
        
        await window.CAVSupabase.saveAsset(assetMetadata);
        console.log('[CAV] ☁️ Asset metadata synced to Supabase:', asset.filename);
      } catch (e) {
        console.warn('[CAV] Supabase asset sync error:', e);
      }
    }
    
    // Load assets from Supabase and merge with local
    async loadAssetsFromSupabase() {
      if (!window.CAVSupabase?.getAssets) return [];
      
      try {
        const cloudAssets = await window.CAVSupabase.getAssets();
        console.log('[CAV] ☁️ Loaded', cloudAssets?.length || 0, 'assets from Supabase');
        return cloudAssets || [];
      } catch (e) {
        console.warn('[CAV] Failed to load assets from Supabase:', e);
        return [];
      }
    }
    
    async idbUpdateAsset(id, data) {
      await this.dbReady;
      
      if (!this.useIndexedDB || !this.db) {
        return this.localUpdateAsset(id, data);
      }
      
      return new Promise((resolve) => {
        const transaction = this.db.transaction(['assets'], 'readwrite');
        const store = transaction.objectStore('assets');
        const getRequest = store.get(id);
        
        getRequest.onsuccess = () => {
          if (!getRequest.result) {
            resolve({ success: false, message: 'Asset not found' });
            return;
          }
          
          const asset = getRequest.result;
          const updated = {
            ...asset,
            ...data,
            tags: { ...asset.tags, ...data.tags },
            updated_at: new Date().toISOString(),
            history: [...(asset.history || []), {
              action: 'updated',
              timestamp: new Date().toISOString(),
              user_name: this.getCurrentUserName(),
              details: data
            }]
          };
          
          const putRequest = store.put(updated);
          putRequest.onsuccess = () => resolve({ success: true, asset: updated });
          putRequest.onerror = () => resolve({ success: false, message: 'Failed to update' });
        };
        
        getRequest.onerror = () => resolve({ success: false, message: 'Asset not found' });
      });
    }
    
    async idbDeleteAsset(id) {
      await this.dbReady;
      
      if (!this.useIndexedDB || !this.db) {
        return this.localDeleteAsset(id);
      }
      
      return new Promise((resolve) => {
        const transaction = this.db.transaction(['assets', 'video_blobs'], 'readwrite');
        const assetsStore = transaction.objectStore('assets');
        const videosStore = transaction.objectStore('video_blobs');
        
        // Get asset first to get UUID for Supabase deletion
        const getRequest = assetsStore.get(id);
        getRequest.onsuccess = () => {
          const asset = getRequest.result;
          const assetUuid = asset?.uuid || id;
          
          // Delete asset from IndexedDB
          assetsStore.delete(id);
          
          // Also delete video blob if exists
          videosStore.delete(id);
          
          // ALSO delete from Supabase
          this.deleteAssetFromSupabase(assetUuid).catch(e => 
            console.warn('[CAV] Supabase asset delete failed:', e)
          );
        };
        
        transaction.oncomplete = () => resolve({ success: true });
        transaction.onerror = () => resolve({ success: false, message: 'Failed to delete' });
      });
    }
    
    // Delete asset from Supabase
    async deleteAssetFromSupabase(uuid) {
      if (!window.CAVSupabase?.deleteAsset) return;
      
      try {
        await window.CAVSupabase.deleteAsset(uuid);
        console.log('[CAV] ☁️ Asset deleted from Supabase:', uuid);
      } catch (e) {
        console.warn('[CAV] Supabase asset delete error:', e);
      }
    }
    
    async idbBulkOperation(operation, assetIds, data = {}) {
      const results = { success: 0, failed: 0, errors: [] };
      
      for (const id of assetIds) {
        try {
          switch (operation) {
            case 'delete':
              await this.idbDeleteAsset(id);
              results.success++;
              break;
            case 'update_status':
              await this.idbUpdateAsset(id, { tags: { status: data.status } });
              results.success++;
              break;
            case 'update_tags':
              await this.idbUpdateAsset(id, { tags: data });
              results.success++;
              break;
            case 'move_to_team':
              await this.idbUpdateAsset(id, { is_team: true, team_key: this.teamStorageKey });
              results.success++;
              break;
            case 'move_to_personal':
              await this.idbUpdateAsset(id, { is_team: false, team_key: null });
              results.success++;
              break;
            case 'toggle_favorite':
              const asset = await this.idbGetAssetById(id);
              if (asset) {
                await this.idbUpdateAsset(id, { is_favorite: !asset.is_favorite });
                results.success++;
              }
              break;
            default:
              results.failed++;
          }
        } catch (e) {
          results.failed++;
          results.errors.push(e.message);
        }
      }
      
      return results;
    }
    
    async idbGetAssetById(id) {
      await this.dbReady;
      
      if (!this.useIndexedDB || !this.db) {
        const assets = this.getAllLocalAssets();
        return assets.find(a => a.id === id);
      }
      
      return new Promise((resolve) => {
        const transaction = this.db.transaction(['assets'], 'readonly');
        const store = transaction.objectStore('assets');
        const request = store.get(id);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
      });
    }

    async checkDuplicate(fileHash, isTeam) {
      if (this.isWordPress) {
        return this.wpCheckDuplicate(fileHash, isTeam);
      }
      return this.idbCheckDuplicate(fileHash, isTeam);
    }
    
    async idbCheckDuplicate(fileHash, isTeam) {
      await this.dbReady;
      
      if (!this.useIndexedDB || !this.db) {
        return this.localCheckDuplicate(fileHash, isTeam);
      }
      
      return new Promise((resolve) => {
        const transaction = this.db.transaction(['assets'], 'readonly');
        const store = transaction.objectStore('assets');
        const index = store.index('file_hash');
        const request = index.getAll(fileHash);
        
        request.onsuccess = () => {
          const matches = request.result || [];
          // Filter by user/team context
          const existing = matches.find(a => {
            if (isTeam && this.teamStorageKey) {
              return a.is_team && a.team_key === this.teamStorageKey;
            }
            return !a.is_team && a.user_key === this.localStorageKey;
          });
          
          resolve({
            is_duplicate: !!existing,
            existing_id: existing?.id,
            existing_filename: existing?.filename
          });
        };
        
        request.onerror = () => resolve({ is_duplicate: false });
      });
    }

    async addComment(assetId, comment) {
      if (this.isWordPress) {
        return this.wpAddComment(assetId, comment);
      }
      return this.idbAddComment(assetId, comment);
    }
    
    async idbAddComment(assetId, commentText) {
      const asset = await this.idbGetAssetById(assetId);
      if (!asset) {
        return { success: false, message: 'Asset not found' };
      }
      
      const comment = {
        id: `comment-${Date.now()}`,
        text: commentText,
        user_name: this.getCurrentUserName(),
        user_avatar: this.getCurrentUserAvatar(),
        created_at: new Date().toISOString()
      };
      
      asset.comments = asset.comments || [];
      asset.comments.push(comment);
      asset.history = asset.history || [];
      asset.history.push({
        action: 'comment_added',
        timestamp: new Date().toISOString(),
        user_name: this.getCurrentUserName()
      });
      
      await this.idbUpdateAsset(assetId, { comments: asset.comments, history: asset.history });
      return { success: true, comment };
    }

    async getComments(assetId) {
      if (this.isWordPress) {
        return this.wpGetComments(assetId);
      }
      const asset = await this.idbGetAssetById(assetId);
      return asset?.comments || [];
    }

    async getHistory(assetId) {
      if (this.isWordPress) {
        return this.wpGetHistory(assetId);
      }
      const asset = await this.idbGetAssetById(assetId);
      return asset?.history || [];
    }

    // WordPress API Methods
    async wpGetAssets(params) {
      try {
        const queryParams = new URLSearchParams(params).toString();
        console.log('[CAV] Fetching assets from:', `${this.apiUrl}/assets?${queryParams}`);
        const response = await fetch(`${this.apiUrl}/assets?${queryParams}`, {
          headers: { 'X-WP-Nonce': this.nonce }
        });
        if (!response.ok) {
          console.error('[CAV] API Error:', response.status, response.statusText);
          // Fallback to localStorage if WordPress API fails
          console.log('[CAV] Falling back to localStorage');
          return this.localGetAssets(params);
        }
        const data = await response.json();
        console.log('[CAV] Assets loaded:', data);
        return data;
      } catch (error) {
        console.error('[CAV] Network error:', error);
        // Fallback to localStorage
        return this.localGetAssets(params);
      }
    }

    async wpSaveAsset(asset) {
      try {
        console.log('[CAV] Saving asset to WordPress:', asset.filename);
        const response = await fetch(`${this.apiUrl}/assets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': this.nonce
          },
          body: JSON.stringify(asset)
        });
        if (!response.ok) {
          console.error('[CAV] Save error:', response.status);
          // Fallback to localStorage
          return this.localSaveAsset(asset);
        }
        return response.json();
      } catch (error) {
        console.error('[CAV] Save network error:', error);
        return this.localSaveAsset(asset);
      }
    }

    async wpUpdateAsset(id, data) {
      const response = await fetch(`${this.apiUrl}/assets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': this.nonce
        },
        body: JSON.stringify(data)
      });
      return response.json();
    }

    async wpDeleteAsset(id) {
      const response = await fetch(`${this.apiUrl}/assets/${id}`, {
        method: 'DELETE',
        headers: { 'X-WP-Nonce': this.nonce }
      });
      return response.json();
    }

    async wpBulkOperation(operation, assetIds, data) {
      const response = await fetch(`${this.apiUrl}/assets/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': this.nonce
        },
        body: JSON.stringify({ operation, asset_ids: assetIds, ...data })
      });
      return response.json();
    }

    async wpCheckDuplicate(fileHash, isTeam) {
      const response = await fetch(`${this.apiUrl}/assets/check-duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': this.nonce
        },
        body: JSON.stringify({ file_hash: fileHash, is_team: isTeam })
      });
      return response.json();
    }

    async wpAddComment(assetId, comment) {
      const response = await fetch(`${this.apiUrl}/assets/${assetId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': this.nonce
        },
        body: JSON.stringify({ comment })
      });
      return response.json();
    }

    async wpGetComments(assetId) {
      const response = await fetch(`${this.apiUrl}/assets/${assetId}/comments`, {
        headers: { 'X-WP-Nonce': this.nonce }
      });
      return response.json();
    }

    async wpGetHistory(assetId) {
      const response = await fetch(`${this.apiUrl}/assets/${assetId}/history`, {
        headers: { 'X-WP-Nonce': this.nonce }
      });
      return response.json();
    }

    // LocalStorage Methods
    localGetAssets(params) {
      const allAssets = this.getAllLocalAssets();
      const isTeam = params.is_team === 'true' || params.is_team === true;
      const includeTrash = params.include_trash === true || params.include_trash === 'true';
      const trashOnly = params.trash_only === true || params.trash_only === 'true';
      
      // Filter by team and trash status
      let filtered = allAssets.filter(a => {
        const matchesTeam = a.is_team === isTeam;
        // Check both is_trashed and is_archived for backwards compatibility
        const isTrashed = a.is_trashed === true || a.is_archived === true;
        
        if (trashOnly) {
          return matchesTeam && isTrashed;
        } else if (!includeTrash) {
          return matchesTeam && !isTrashed;
        }
        return matchesTeam;
      });
      
      // Search
      if (params.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(a => 
          a.filename.toLowerCase().includes(search) ||
          (a.tags?.campaign || '').toLowerCase().includes(search) ||
          (a.tags?.client || '').toLowerCase().includes(search) ||
          (a.tags?.project || '').toLowerCase().includes(search)
        );
      }
      
      // Status filter
      if (params.status) {
        filtered = filtered.filter(a => a.tags?.status === params.status);
      }
      
      // Channel filter
      if (params.channel) {
        filtered = filtered.filter(a => 
          a.validation?.compatible?.includes(params.channel)
        );
      }
      
      // Favorites filter
      if (params.favorites_only) {
        filtered = filtered.filter(a => a.is_favorite === true);
      }
      
      // Sort - favorites first if not explicitly sorting
      const sortBy = params.sort_by || 'created_at';
      const sortOrder = params.sort_order || 'DESC';
      filtered.sort((a, b) => {
        // Favorites always first
        if (a.is_favorite && !b.is_favorite) return -1;
        if (!a.is_favorite && b.is_favorite) return 1;
        
        let aVal = a[sortBy] || a.tags?.[sortBy] || '';
        let bVal = b[sortBy] || b.tags?.[sortBy] || '';
        if (sortBy === 'created_at') {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        }
        if (sortOrder === 'DESC') {
          return bVal > aVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
      });
      
      // Pagination
      const page = parseInt(params.page) || 1;
      const perPage = parseInt(params.per_page) || 10;
      const start = (page - 1) * perPage;
      const paginated = filtered.slice(start, start + perPage);
      
      return {
        assets: paginated,
        total: filtered.length,
        pages: Math.ceil(filtered.length / perPage),
        page,
        per_page: perPage
      };
    }

    localSaveAsset(asset) {
      const allAssets = this.getAllLocalAssets();
      
      // IMPORTANT: Don't store video_url in localStorage - it's too large!
      // Only store metadata. Videos require IndexedDB.
      const newAsset = {
        ...asset,
        id: asset.id || `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        created_at: asset.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        comments: asset.comments || [],
        history: asset.history || [{ action: 'uploaded', timestamp: new Date().toISOString(), user_name: this.getCurrentUserName() }]
      };
      
      // Remove video data to prevent quota exceeded error
      if (newAsset.video_url && newAsset.file_type === 'video') {
        console.warn('[CAV] Video data stripped for localStorage fallback - video preview will not work');
        delete newAsset.video_url;
        newAsset.video_stripped = true;
      }
      
      try {
        allAssets.push(newAsset);
        localStorage.setItem(this.localStorageKey, JSON.stringify(allAssets));
        return { success: true, asset: newAsset };
      } catch (e) {
        // Remove the asset we just added
        allAssets.pop();
        if (e.name === 'QuotaExceededError' || e.code === 22) {
          console.error('[CAV] localStorage quota exceeded');
          return { success: false, message: 'Storage full. Please delete some assets.' };
        }
        throw e;
      }
    }

    localUpdateAsset(id, data) {
      const allAssets = this.getAllLocalAssets();
      const index = allAssets.findIndex(a => a.id === id);
      if (index === -1) {
        return { success: false, message: 'Asset not found' };
      }
      
      const asset = allAssets[index];
      const updated = {
        ...asset,
        ...data,
        tags: { ...asset.tags, ...data.tags },
        updated_at: new Date().toISOString(),
        history: [...(asset.history || []), {
          action: 'updated',
          timestamp: new Date().toISOString(),
          user_name: this.getCurrentUserName(),
          details: data
        }]
      };
      allAssets[index] = updated;
      localStorage.setItem(this.localStorageKey, JSON.stringify(allAssets));
      return { success: true, asset: updated };
    }

    localDeleteAsset(id) {
      const allAssets = this.getAllLocalAssets();
      const filtered = allAssets.filter(a => a.id !== id);
      localStorage.setItem(this.localStorageKey, JSON.stringify(filtered));
      return { success: true };
    }

    localBulkOperation(operation, assetIds, data) {
      const results = { success: 0, failed: 0, errors: [] };
      
      assetIds.forEach(id => {
        try {
          switch (operation) {
            case 'delete':
              this.localDeleteAsset(id);
              results.success++;
              break;
            case 'update_status':
              this.localUpdateAsset(id, { tags: { status: data.status } });
              results.success++;
              break;
            case 'update_tags':
              this.localUpdateAsset(id, { tags: data });
              results.success++;
              break;
            case 'move_to_team':
              this.localUpdateAsset(id, { is_team: true });
              results.success++;
              break;
            case 'move_to_personal':
              this.localUpdateAsset(id, { is_team: false });
              results.success++;
              break;
            default:
              results.failed++;
          }
        } catch (e) {
          results.failed++;
          results.errors.push(e.message);
        }
      });
      
      return results;
    }

    localCheckDuplicate(fileHash, isTeam) {
      const allAssets = this.getAllLocalAssets();
      const existing = allAssets.find(a => 
        a.file_hash === fileHash && a.is_team === isTeam
      );
      return {
        is_duplicate: !!existing,
        existing_id: existing?.id,
        existing_filename: existing?.filename
      };
    }

    localAddComment(assetId, commentText) {
      const allAssets = this.getAllLocalAssets();
      const index = allAssets.findIndex(a => a.id === assetId);
      if (index === -1) {
        return { success: false, message: 'Asset not found' };
      }
      
      const comment = {
        id: `comment-${Date.now()}`,
        text: commentText,
        user_name: this.getCurrentUserName(),
        user_avatar: this.getCurrentUserAvatar(),
        created_at: new Date().toISOString()
      };
      
      allAssets[index].comments = allAssets[index].comments || [];
      allAssets[index].comments.push(comment);
      allAssets[index].history = allAssets[index].history || [];
      allAssets[index].history.push({
        action: 'comment_added',
        timestamp: new Date().toISOString(),
        user_name: this.getCurrentUserName()
      });
      
      localStorage.setItem(this.localStorageKey, JSON.stringify(allAssets));
      return { success: true, comment };
    }

    localGetComments(assetId) {
      const allAssets = this.getAllLocalAssets();
      const asset = allAssets.find(a => a.id === assetId);
      return asset?.comments || [];
    }

    localGetHistory(assetId) {
      const allAssets = this.getAllLocalAssets();
      const asset = allAssets.find(a => a.id === assetId);
      return asset?.history || [];
    }

    getAllLocalAssets() {
      try {
        return JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');
      } catch {
        return [];
      }
    }

    getCurrentUserName() {
      // Google SSO session takes priority
      if (window.cavUserSession && window.cavUserSession.name) {
        return window.cavUserSession.name;
      }
      if (this.isWordPress && cavSettings.userName) {
        return cavSettings.userName;
      }
      return localStorage.getItem('cav_user_name') || 'Anonymous';
    }

    getCurrentUserEmail() {
      // ROBUST: Check multiple sources for user email
      try {
        // 1. Check window.cavUserSession
        if (window.cavUserSession?.email) {
          return window.cavUserSession.email;
        }
        
        // 2. Check this.userEmail
        if (this.userEmail) {
          return this.userEmail;
        }
        
        // 3. Check CAVSecurity SecureSessionManager
        const secureSession = window.CAVSecurity?.SecureSessionManager?.getSession?.();
        if (secureSession?.email) {
          return secureSession.email;
        }
        
        // 4. Check localStorage cav_session
        try {
          const cavSession = JSON.parse(localStorage.getItem('cav_session') || 'null');
          if (cavSession?.email) return cavSession.email;
        } catch (e) {}
        
        // 5. Check localStorage cav_user_session
        try {
          const userSession = JSON.parse(localStorage.getItem('cav_user_session') || 'null');
          if (userSession?.email) return userSession.email;
        } catch (e) {}
        
        // 6. Check localStorage cav_secure_session_v3
        try {
          const secureV3 = JSON.parse(localStorage.getItem('cav_secure_session_v3') || 'null');
          if (secureV3?.email) return secureV3.email;
        } catch (e) {}
        
        // 7. Check localStorage cav_last_user_email
        const lastEmail = localStorage.getItem('cav_last_user_email');
        if (lastEmail && lastEmail !== 'anonymous') return lastEmail;
        
        return null;
      } catch (e) {
        return null;
      }
    }

    getCurrentUserAvatar() {
      // Google SSO session takes priority
      if (window.cavUserSession && window.cavUserSession.picture) {
        return window.cavUserSession.picture;
      }
      if (this.isWordPress && cavSettings.userAvatar) {
        return cavSettings.userAvatar;
      }
      return null;
    }

    getCurrentUserType() {
      if (window.cavUserSession) {
        return window.cavUserSession.userType;
      }
      return 'personal';
    }

    canAccessTeamAssets() {
      if (window.cavUserSession) {
        return window.cavUserSession.canAccessTeam === true;
      }
      return false;
    }

    isLoggedIn() {
      // Google SSO session takes priority
      if (window.cavUserSession && window.cavUserSession.email) {
        return true;
      }
      if (this.isWordPress) {
        return cavSettings.isLoggedIn;
      }
      return !!localStorage.getItem('cav_user_name');
    }
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  function calculateAspectRatio(width, height) {
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(width, height);
    const ratioWidth = width / divisor;
    const ratioHeight = height / divisor;
    
    const commonRatios = {
      '16:9': [16, 9],
      '9:16': [9, 16],
      '1:1': [1, 1],
      '4:5': [4, 5],
      '1.91:1': [1.91, 1],
      '2:3': [2, 3],
      '3:4': [3, 4]
    };
    
    for (const [label, [w, h]] of Object.entries(commonRatios)) {
      const tolerance = 0.05;
      const targetRatio = w / h;
      const actualRatio = ratioWidth / ratioHeight;
      if (Math.abs(targetRatio - actualRatio) < tolerance) {
        return label;
      }
    }
    
    return `${ratioWidth}:${ratioHeight}`;
  }

  function validateVideo(file, metadata) {
    const { width, height, duration, size } = metadata;
    const aspectRatio = calculateAspectRatio(width, height);
    const fileSizeMB = size / (1024 * 1024);
    const compatibleChannels = [];
    const incompatibleReasons = {};

    for (const [channel, specs] of Object.entries(CHANNEL_SPECS)) {
      const reasons = [];
      let compatible = true;

      if (!specs.aspectRatios.includes(aspectRatio)) {
        reasons.push(`Aspect ratio ${aspectRatio} not supported (needs ${specs.aspectRatios.join(' or ')})`);
        compatible = false;
      }

      if (specs.minDuration && duration < specs.minDuration) {
        reasons.push(`Duration ${duration}s too short (min ${specs.minDuration}s)`);
        compatible = false;
      }

      if (specs.maxDuration && duration > specs.maxDuration) {
        reasons.push(`Duration ${duration}s too long (max ${specs.maxDuration}s)`);
        compatible = false;
      }

      if (specs.maxFileSizeMB && fileSizeMB > specs.maxFileSizeMB) {
        reasons.push(`File size ${fileSizeMB.toFixed(2)}MB exceeds limit (max ${specs.maxFileSizeMB}MB)`);
        compatible = false;
      }

      if (compatible) {
        compatibleChannels.push(channel);
      } else {
        incompatibleReasons[channel] = reasons;
      }
    }

    return {
      type: 'video',
      aspectRatio,
      compatible: compatibleChannels,
      incompatible: incompatibleReasons,
      isOffSize: compatibleChannels.length === 0
    };
  }

  function validateImage(file, metadata) {
    const { width, height, size } = metadata;
    const aspectRatio = calculateAspectRatio(width, height);
    const fileSizeMB = size / (1024 * 1024);
    const compatibleChannels = [];
    const incompatibleReasons = {};

    for (const [channel, specs] of Object.entries(IMAGE_SPECS)) {
      const reasons = [];
      let compatible = true;

      if (!specs.aspectRatios.includes(aspectRatio)) {
        reasons.push(`Aspect ratio ${aspectRatio} not supported (needs ${specs.aspectRatios.join(' or ')})`);
        compatible = false;
      }

      if (specs.maxFileSizeMB && fileSizeMB > specs.maxFileSizeMB) {
        reasons.push(`File size ${fileSizeMB.toFixed(2)}MB exceeds limit (max ${specs.maxFileSizeMB}MB)`);
        compatible = false;
      }

      if (compatible) {
        compatibleChannels.push(channel);
      } else {
        incompatibleReasons[channel] = reasons;
      }
    }

    return {
      type: 'image',
      aspectRatio,
      compatible: compatibleChannels,
      incompatible: incompatibleReasons,
      isOffSize: compatibleChannels.length === 0
    };
  }

  async function calculateFileHash(file) {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ============================================
  // ICON COMPONENTS (SVG)
  // ============================================
  const Icons = {
    Upload: () => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
    CheckCircle: () => `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    XCircle: () => `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    AlertCircle: () => `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    Eye: () => `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
    Download: () => `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    Trash2: () => `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`,
    Search: () => `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    Filter: () => `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
    Tag: () => `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
    Folder: () => `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
    Users: () => `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    User: () => `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    MessageSquare: () => `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    Clock: () => `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    ChevronDown: () => `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
    ChevronRight: () => `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
    X: () => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    Play: () => `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
    ArrowUpDown: () => `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>`,
    CheckSquare: () => `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
    Square: () => `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>`,
    Copy: () => `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
    Maximize: () => `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`
  };

  // ============================================
  // MAIN APPLICATION
  // ============================================
  class AssetValidatorApp {
    constructor(container) {
      this.container = container;
      this.storage = new StorageManager();
      
      // State
      this.state = {
        assets: [],
        trashedAssets: [],
        loading: true,
        currentPage: 1,
        totalPages: 1,
        totalAssets: 0,
        selectedAsset: null,
        previewAsset: null,
        storageMode: 'personal',
        searchTerm: '',
        filterChannel: 'all',
        filterStatus: 'all',
        filterFavorites: false,
        showFilters: false,
        editingAsset: null,
        selectedAssets: new Set(),
        showBulkActions: false,
        sortBy: 'created_at',
        sortOrder: 'DESC',
        isDragging: false,
        showDeleteConfirm: null,
        showTrash: false,
        showBatchTagModal: false,
        batchTags: { campaign: '', client: '', project: '' },
        uploadProgress: [],
        duplicateWarning: null,
        storageUsed: 0,
        storageLimit: 100 * 1024 * 1024, // 100MB IndexedDB limit for videos
        videoStorageInfo: { usedMB: '0', maxMB: 100, percentUsed: 0 },
        keyboardNavIndex: -1,
        renamingAsset: null,
        renameValue: '',
        expandedGroups: new Set()
      };
      
      this.itemsPerPage = 10;
      this.keyboardShortcuts = {
        'Escape': () => this.handleEscape(),
        'ArrowUp': () => this.navigateAssets(-1),
        'ArrowDown': () => this.navigateAssets(1),
        'Enter': () => this.openSelectedAsset(),
        'Delete': () => this.deleteSelectedAsset(),
        'f': () => this.toggleFavoriteSelected(),
        's': () => this.focusSearch(),
        '?': () => this.showKeyboardHelp()
      };
      this.init();
    }

    async init() {
      this.render();
      await this.loadAssets();
      this.calculateStorageUsage();
      this.setupKeyboardShortcuts();
      this.setupEventListeners();
    }

    async loadAssets() {
      this.state.loading = true;
      this.render();
      
      try {
        const result = await this.storage.getAssets({
          page: this.state.currentPage,
          per_page: this.itemsPerPage,
          search: this.state.searchTerm,
          channel: this.state.filterChannel !== 'all' ? this.state.filterChannel : '',
          status: this.state.filterStatus !== 'all' ? this.state.filterStatus : '',
          is_team: this.state.storageMode === 'team',
          sort_by: this.state.sortBy,
          sort_order: this.state.sortOrder,
          favorites_only: this.state.filterFavorites
        });
        
        this.state.assets = result.assets || [];
        this.state.totalPages = result.pages || 1;
        this.state.totalAssets = result.total || 0;
        
        // Update video storage info
        this.state.videoStorageInfo = await this.storage.getVideoStorageInfo();
      } catch (error) {
        console.error('Failed to load assets:', error);
        this.state.assets = [];
      }
      
      this.state.loading = false;
      this.state.selectedAssets = new Set();
      this.state.keyboardNavIndex = -1;
      this.render();
    }

    setupEventListeners() {
      // Legacy - kept for compatibility
    }

    setupKeyboardShortcuts() {
      document.addEventListener('keydown', (e) => {
        // Don't trigger shortcuts when typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
          if (e.key === 'Escape') {
            e.target.blur();
          }
          return;
        }

        const handler = this.keyboardShortcuts[e.key];
        if (handler) {
          e.preventDefault();
          handler();
        }
      });
    }

    handleEscape() {
      if (this.state.previewAsset) {
        this.state.previewAsset = null;
        this.render();
      } else if (this.state.showDeleteConfirm) {
        this.state.showDeleteConfirm = null;
        this.render();
      } else if (this.state.showBatchTagModal) {
        this.state.showBatchTagModal = false;
        this.render();
      } else if (this.state.showTrash) {
        this.state.showTrash = false;
        this.loadAssets();
      } else if (this.state.selectedAssets.size > 0) {
        this.state.selectedAssets = new Set();
        this.render();
      }
    }

    navigateAssets(direction) {
      const maxIndex = this.state.assets.length - 1;
      if (maxIndex < 0) return;
      
      this.state.keyboardNavIndex = Math.max(0, Math.min(maxIndex, this.state.keyboardNavIndex + direction));
      this.render();
      
      // Scroll to visible
      const card = this.container.querySelector(`[data-nav-index="${this.state.keyboardNavIndex}"]`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    openSelectedAsset() {
      if (this.state.keyboardNavIndex >= 0 && this.state.assets[this.state.keyboardNavIndex]) {
        this.state.previewAsset = this.state.assets[this.state.keyboardNavIndex];
        this.render();
      }
    }

    deleteSelectedAsset() {
      if (this.state.keyboardNavIndex >= 0 && this.state.assets[this.state.keyboardNavIndex]) {
        this.state.showDeleteConfirm = this.state.assets[this.state.keyboardNavIndex].id;
        this.render();
      }
    }

    toggleFavoriteSelected() {
      if (this.state.keyboardNavIndex >= 0 && this.state.assets[this.state.keyboardNavIndex]) {
        this.toggleFavorite(this.state.assets[this.state.keyboardNavIndex].id);
      }
    }

    focusSearch() {
      const searchInput = this.container.querySelector('#cav-search');
      if (searchInput) {
        searchInput.focus();
      }
    }

    showKeyboardHelp() {
      alert(`Keyboard Shortcuts:
      
↑/↓ - Navigate assets
Enter - Preview selected asset
Delete - Delete selected asset
F - Toggle favorite
S - Focus search
Esc - Close modal/clear selection
? - Show this help`);
    }

    calculateStorageUsage() {
      if (!this.storage.isWordPress) {
        let total = 0;
        for (let key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            total += localStorage[key].length * 2; // UTF-16 = 2 bytes per char
          }
        }
        this.state.storageUsed = total;
      }
    }

    async toggleFavorite(assetId) {
      const asset = this.state.assets.find(a => a.id === assetId);
      if (asset) {
        const isFavorite = !asset.is_favorite;
        await this.storage.updateAsset(assetId, { is_favorite: isFavorite });
        asset.is_favorite = isFavorite;
        this.render();
      }
    }

    async archiveAsset(assetId) {
      const asset = this.state.assets.find(a => a.id === assetId);
      if (asset) {
        asset.is_trashed = true;
        asset.is_archived = true;
        asset.trashed_at = new Date().toISOString();
        asset.archived_at = asset.trashed_at;
        await this.storage.updateAsset(assetId, { 
          is_trashed: true,
          is_archived: true, 
          trashed_at: asset.trashed_at,
          archived_at: asset.trashed_at 
        });
        this.state.showDeleteConfirm = null;
        await this.loadAssets();
        // Show success notification
        window.showNotification?.(`"${asset.filename}" moved to trash`, 'success');
      }
    }

    async restoreAsset(assetId) {
      const asset = this.state.trashedAssets?.find(a => a.id === assetId);
      await this.storage.updateAsset(assetId, { 
        is_trashed: false,
        is_archived: false, 
        trashed_at: null,
        archived_at: null 
      });
      await this.loadTrashedAssets();
      // Show success notification
      window.showNotification?.(`"${asset?.filename || 'Asset'}" restored`, 'success');
    }

    async permanentlyDeleteAsset(assetId) {
      await this.storage.deleteAsset(assetId);
      await this.loadTrashedAssets();
    }

    async loadTrashedAssets() {
      try {
        const result = await this.storage.getAssets({
          page: 1,
          per_page: 100,
          is_team: this.state.storageMode === 'team',
          include_trash: true,
          trash_only: true
        });
        // Filter by both is_trashed and is_archived for backwards compatibility
        this.state.trashedAssets = (result.assets || []).filter(a => a.is_trashed || a.is_archived);
        this.render();
      } catch (e) {
        console.error('Failed to load trashed assets:', e);
        this.state.trashedAssets = [];
        this.render();
      }
    }

    async emptyTrash() {
      if (confirm('Permanently delete all items in trash? This cannot be undone.')) {
        for (const asset of this.state.trashedAssets) {
          await this.storage.deleteAsset(asset.id);
        }
        this.state.trashedAssets = [];
        this.render();
      }
    }

    downloadAsset(asset) {
      if (asset.video_url || asset.thumbnail_url) {
        const dataUrl = asset.video_url || asset.thumbnail_url;
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = asset.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert('Original file not available for download. Only metadata was stored.');
      }
    }

    startRename(assetId) {
      const asset = this.state.assets.find(a => a.id === assetId);
      if (asset) {
        this.state.renamingAsset = assetId;
        this.state.renameValue = asset.filename;
        this.render();
        // Focus the input after render
        setTimeout(() => {
          const input = this.container.querySelector(`#cav-rename-input-${assetId}`);
          if (input) {
            input.focus();
            input.select();
          }
        }, 50);
      }
    }

    async saveRename(assetId) {
      const newFilename = this.state.renameValue.trim();
      if (!newFilename) {
        alert('Filename cannot be empty');
        return;
      }
      
      try {
        await this.storage.updateAsset(assetId, { filename: newFilename });
        this.state.renamingAsset = null;
        this.state.renameValue = '';
        await this.loadAssets();
      } catch (error) {
        console.error('Failed to rename asset:', error);
        alert('Failed to rename asset');
      }
    }

    cancelRename() {
      this.state.renamingAsset = null;
      this.state.renameValue = '';
      this.render();
    }

    getResolutionRecommendations(asset) {
      const recommendations = [];
      const validation = asset.validation || {};
      const incompatible = validation.incompatible || {};
      
      for (const [channel, reasons] of Object.entries(incompatible)) {
        const specs = CHANNEL_SPECS[channel] || IMAGE_SPECS[channel];
        if (!specs) continue;
        
        const rec = { channel, suggestions: [] };
        
        for (const reason of reasons) {
          if (reason.includes('Aspect ratio')) {
            const targetRatios = specs.aspectRatios;
            const bestRes = specs.resolutions?.[0];
            if (bestRes) {
              rec.suggestions.push(`Resize to ${bestRes.width}×${bestRes.height} (${targetRatios[0]})`);
            }
          }
          if (reason.includes('too short')) {
            rec.suggestions.push(`Extend duration to at least ${specs.minDuration}s`);
          }
          if (reason.includes('too long')) {
            rec.suggestions.push(`Trim to under ${specs.maxDuration}s`);
          }
          if (reason.includes('File size')) {
            rec.suggestions.push(`Compress to under ${specs.maxFileSizeMB}MB`);
          }
        }
        
        if (rec.suggestions.length > 0) {
          recommendations.push(rec);
        }
      }
      
      return recommendations;
    }

    openBatchTagModal() {
      this.state.showBatchTagModal = true;
      this.state.batchTags = { campaign: '', client: '', project: '' };
      this.render();
    }

    async applyBatchTags() {
      const { campaign, client, project } = this.state.batchTags;
      const updates = {};
      if (campaign) updates.campaign = campaign;
      if (client) updates.client = client;
      if (project) updates.project = project;
      
      if (Object.keys(updates).length === 0) {
        alert('Please enter at least one tag to apply.');
        return;
      }
      
      for (const assetId of this.state.selectedAssets) {
        await this.storage.updateAsset(assetId, { tags: updates });
      }
      
      this.state.showBatchTagModal = false;
      this.state.selectedAssets = new Set();
      await this.loadAssets();
    }

    async processFile(file) {
      return new Promise(async (resolve) => {
        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');
        
        // Check video limits (10MB per file, 100MB total storage)
        if (isVideo) {
          const storageCheck = await this.storage.canStoreVideo(file.size);
          if (!storageCheck.allowed) {
            this.showNotification(`Cannot upload "${file.name}": ${storageCheck.reason}`, 'error');
            resolve(null);
            return;
          }
        }
        
        // Calculate file hash for duplicate detection
        let fileHash = null;
        try {
          fileHash = await calculateFileHash(file);
        } catch (e) {
          console.warn('Could not calculate file hash:', e);
        }

        // WordPress Media Library upload
        if (this.storage.isWordPress && typeof cavSettings !== 'undefined') {
          try {
            const wpResult = await this.uploadToWordPressMedia(file);
            if (wpResult) {
              // Get validation from local processing
              const localResult = await this.processFileLocally(file, fileHash);
              if (localResult) {
                // Merge WordPress URLs with local validation
                resolve({
                  ...localResult,
                  file_url: wpResult.file_url,
                  thumbnail_url: wpResult.thumbnail_url || localResult.thumbnail_url,
                  video_url: wpResult.file_type === 'video' ? wpResult.file_url : localResult.video_url,
                  attachment_id: wpResult.attachment_id,
                });
                return;
              }
            }
          } catch (wpError) {
            console.warn('[CAV] WordPress upload failed, using local storage:', wpError);
          }
        }

        // Local processing (standalone or fallback)
        const localResult = await this.processFileLocally(file, fileHash);
        resolve(localResult);
      });
    }

    async uploadToWordPressMedia(file) {
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('action', 'cav_upload_asset');
        formData.append('nonce', cavSettings.ajaxNonce);
        formData.append('file', file);

        fetch(cavSettings.ajaxUrl, {
          method: 'POST',
          body: formData,
          credentials: 'same-origin'
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            console.log('[CAV] WordPress Media upload success:', data.data);
            resolve(data.data);
          } else {
            console.error('[CAV] WordPress Media upload failed:', data.data?.message);
            reject(new Error(data.data?.message || 'Upload failed'));
          }
        })
        .catch(error => {
          console.error('[CAV] WordPress Media upload error:', error);
          reject(error);
        });
      });
    }

    async processFileLocally(file, fileHash) {
      return new Promise((resolve) => {
        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');

        if (isVideo) {
          const video = document.createElement('video');
          video.preload = 'metadata';
          video.muted = true;
          
          // Read video as base64 for storage and playback
          const videoReader = new FileReader();
          videoReader.onload = (videoDataEvent) => {
            const videoDataUrl = videoDataEvent.target.result;
            
            video.onloadedmetadata = () => {
              // Seek to 1 second or 25% of duration for thumbnail
              video.currentTime = Math.min(1, video.duration * 0.25);
            };
            
            video.onseeked = () => {
              // Generate thumbnail from video frame
              const canvas = document.createElement('canvas');
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              
              let thumbnailUrl = null;
              try {
                thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);
              } catch (e) {
                console.warn('Could not generate video thumbnail:', e);
              }
              
              const metadata = {
                width: video.videoWidth,
                height: video.videoHeight,
                duration: Math.round(video.duration),
                size: file.size
              };
              const validation = validateVideo(file, metadata);
              
              resolve({
                filename: file.name,
                file_hash: fileHash,
                file_type: 'video',
                file_size: file.size,
                width: metadata.width,
                height: metadata.height,
                duration: metadata.duration,
                aspect_ratio: validation.aspectRatio,
                validation,
                thumbnail_url: thumbnailUrl,
                video_url: videoDataUrl,
                is_team: this.state.storageMode === 'team',
                tags: {
                  campaign: '',
                  client: '',
                  project: '',
                  status: 'draft',
                  version: '1.0'
                }
              });
            };
            
            video.onerror = () => {
              resolve(null);
            };
            
            video.src = videoDataUrl;
          };
          
          videoReader.onerror = () => {
            resolve(null);
          };
          
          videoReader.readAsDataURL(file);
        } else if (isImage) {
          const img = new Image();
          const reader = new FileReader();
          
          reader.onload = (e) => {
            img.onload = () => {
              const metadata = {
                width: img.width,
                height: img.height,
                size: file.size
              };
              const validation = validateImage(file, metadata);
              resolve({
                filename: file.name,
                file_hash: fileHash,
                file_type: 'image',
                file_size: file.size,
                width: metadata.width,
                height: metadata.height,
                duration: null,
                aspect_ratio: validation.aspectRatio,
                validation,
                thumbnail_url: e.target.result,
                video_url: null,
                is_team: this.state.storageMode === 'team',
                tags: {
                  campaign: '',
                  client: '',
                  project: '',
                  status: 'draft',
                  version: '1.0'
                }
              });
            };
            img.onerror = () => {
              resolve(null);
            };
            img.src = e.target.result;
          };
          reader.onerror = () => {
            resolve(null);
          };
          reader.readAsDataURL(file);
        } else {
          resolve(null);
        }
      });
    }

    async handleFileUpload(files) {
      const fileList = Array.from(files).slice(0, 10);
      this.state.uploadProgress = fileList.map(f => ({ name: f.name, status: 'processing' }));
      this.render();
      
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        
        try {
          const processed = await this.processFile(file);
          
          if (!processed) {
            this.state.uploadProgress[i].status = 'error';
            this.state.uploadProgress[i].message = 'Invalid file type';
            this.render();
            continue;
          }
          
          // Check for duplicate
          if (processed.file_hash) {
            const dupCheck = await this.storage.checkDuplicate(
              processed.file_hash, 
              this.state.storageMode === 'team'
            );
            
            if (dupCheck.is_duplicate) {
              this.state.uploadProgress[i].status = 'duplicate';
              this.state.uploadProgress[i].message = `Duplicate of "${dupCheck.existing_filename}"`;
              this.render();
              continue;
            }
          }
          
          // Save asset
          const result = await this.storage.saveAsset(processed);
          
          if (result.success) {
            this.state.uploadProgress[i].status = 'success';
            
            // Analyze upload for CRM filing (async, non-blocking)
            if (window.cavAILibrary && result.asset) {
              window.cavAILibrary.analyzeUploadForFiling(result.asset).then(crmResult => {
                if (crmResult) {
                  console.log('[CAV] Upload filed in CRM:', crmResult.company?.name, crmResult.project?.name);
                }
              }).catch(e => console.warn('[CAV] CRM filing analysis failed:', e));
            }
          } else {
            this.state.uploadProgress[i].status = 'error';
            this.state.uploadProgress[i].message = result.message || 'Failed to save';
          }
        } catch (error) {
          this.state.uploadProgress[i].status = 'error';
          this.state.uploadProgress[i].message = error.message;
        }
        
        this.render();
      }
      
      // Clear progress after delay and reload
      setTimeout(() => {
        this.state.uploadProgress = [];
        this.loadAssets();
      }, 2000);
    }

    async deleteAsset(assetId) {
      try {
        await this.storage.deleteAsset(assetId);
        this.state.showDeleteConfirm = null;
        if (this.state.selectedAsset === assetId) {
          this.state.selectedAsset = null;
        }
        this.state.selectedAssets.delete(assetId);
        await this.loadAssets();
      } catch (error) {
        console.error('Failed to delete asset:', error);
        alert('Failed to delete asset');
      }
    }

    async bulkDelete() {
      if (this.state.selectedAssets.size === 0) return;
      
      try {
        await this.storage.bulkOperation('delete', Array.from(this.state.selectedAssets));
        this.state.selectedAssets = new Set();
        this.state.showBulkActions = false;
        await this.loadAssets();
      } catch (error) {
        console.error('Failed to bulk delete:', error);
        alert('Failed to delete some assets');
      }
    }

    async bulkUpdateStatus(status) {
      if (this.state.selectedAssets.size === 0) return;
      
      try {
        await this.storage.bulkOperation('update_status', Array.from(this.state.selectedAssets), { status });
        this.state.selectedAssets = new Set();
        this.state.showBulkActions = false;
        await this.loadAssets();
      } catch (error) {
        console.error('Failed to bulk update status:', error);
        alert('Failed to update some assets');
      }
    }

    async updateAssetTags(assetId, tags) {
      try {
        // Extract CRM link IDs for special handling
        const linkedCompanyId = tags.linkedCompanyId;
        const linkedProjectId = tags.linkedProjectId;
        
        // Save asset with tags
        await this.storage.updateAsset(assetId, { tags });
        
        // If linked to a CRM company, also update the company's linked assets
        if (linkedCompanyId && window.cavCRM) {
          const company = window.cavCRM.getCompany(linkedCompanyId);
          if (company) {
            const linkedAssets = company.linkedAssets || [];
            if (!linkedAssets.includes(assetId)) {
              linkedAssets.push(assetId);
              window.cavCRM.updateCompany(linkedCompanyId, { linkedAssets });
              console.log(`[CAV] Asset ${assetId} linked to company ${company.name}`);
            }
          }
        }
        
        // If linked to a CRM project, also update the project's linked assets
        if (linkedProjectId && window.cavCRM) {
          const project = window.cavCRM.getProject(linkedProjectId);
          if (project) {
            const linkedAssets = project.linkedAssets || [];
            if (!linkedAssets.includes(assetId)) {
              linkedAssets.push(assetId);
              window.cavCRM.updateProject(linkedProjectId, { linkedAssets });
              console.log(`[CAV] Asset ${assetId} linked to project ${project.name}`);
            }
          }
        }
        
        await this.loadAssets();
      } catch (error) {
        console.error('Failed to update tags:', error);
      }
    }

    async addComment(assetId, commentText) {
      if (!commentText.trim()) return;
      
      try {
        await this.storage.addComment(assetId, commentText);
        // Refresh the asset details
        const asset = this.state.assets.find(a => a.id === assetId);
        if (asset) {
          asset.comments = await this.storage.getComments(assetId);
        }
        this.render();
      } catch (error) {
        console.error('Failed to add comment:', error);
      }
    }

    exportReport() {
      const report = this.state.assets.map((asset) => ({
        filename: asset.filename,
        campaign: asset.tags?.campaign || '',
        client: asset.tags?.client || '',
        project: asset.tags?.project || '',
        status: asset.tags?.status || 'draft',
        version: asset.tags?.version || '1.0',
        type: asset.validation?.type || asset.file_type,
        dimensions: `${asset.width}x${asset.height}`,
        aspectRatio: asset.validation?.aspectRatio || asset.aspect_ratio,
        duration: asset.duration || 'N/A',
        fileSize: `${(asset.file_size / (1024 * 1024)).toFixed(2)}MB`,
        compatibleChannels: (asset.validation?.compatible || []).join('; '),
        isOffSize: asset.validation?.isOffSize ? 'Yes' : 'No',
        uploadedAt: new Date(asset.created_at).toLocaleDateString()
      }));

      if (report.length === 0) {
        alert('No assets to export');
        return;
      }

      const csv = [
        Object.keys(report[0]).join(','),
        ...report.map(r => Object.values(r).map(v => `"${v}"`).join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `asset-validation-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }

    getAllChannels() {
      return [...new Set([
        ...Object.keys(CHANNEL_SPECS),
        ...Object.keys(IMAGE_SPECS)
      ])].sort();
    }

    toggleSelectAll() {
      if (this.state.selectedAssets.size === this.state.assets.length) {
        this.state.selectedAssets = new Set();
      } else {
        this.state.selectedAssets = new Set(this.state.assets.map(a => a.id));
      }
      this.render();
    }

    toggleSelectAsset(assetId) {
      if (this.state.selectedAssets.has(assetId)) {
        this.state.selectedAssets.delete(assetId);
      } else {
        this.state.selectedAssets.add(assetId);
      }
      this.render();
    }

    render() {
      const html = this.generateHTML();
      this.container.innerHTML = html;
      this.attachEventHandlers();
    }

    generateHTML() {
      if (this.state.loading && this.state.assets.length === 0) {
        return this.renderLoading();
      }

      if (this.state.showTrash) {
        return this.renderTrashView();
      }

      return `
        <div class="cav-app">
          ${this.renderHeader()}
          ${this.renderStorageQuota()}
          ${this.renderActionCards()}
          ${this.renderSearchFilter()}
          ${this.renderUploadSection()}
          ${this.state.uploadProgress.length > 0 ? this.renderUploadProgress() : ''}
          ${this.state.selectedAssets.size > 0 ? this.renderBulkActions() : ''}
          ${this.renderAssetsList()}
          ${this.renderPagination()}
          ${this.renderKeyboardHint()}
          ${this.state.previewAsset ? this.renderPreviewModal() : ''}
          ${this.state.showDeleteConfirm ? this.renderDeleteConfirm() : ''}
          ${this.state.showBatchTagModal ? this.renderBatchTagModal() : ''}
        </div>
      `;
    }

    renderStorageQuota() {
      // IndexedDB storage info is shown in the upload section
      // This method is kept for backwards compatibility but returns empty
      return '';
    }

    renderKeyboardHint() {
      return `
        <div class="cav-keyboard-hint">
          <span>Press <kbd>?</kbd> for keyboard shortcuts</span>
        </div>
      `;
    }

    renderTrashView() {
      return `
        <div class="cav-app">
          <div class="cav-trash-header">
            <button class="cav-back-btn" id="cav-back-from-trash">
              ← Back to Library
            </button>
            <h2><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 8px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>Trash</h2>
            <p>${this.state.trashedAssets.length} item${this.state.trashedAssets.length !== 1 ? 's' : ''} in trash</p>
            ${this.state.trashedAssets.length > 0 ? `
              <button class="cav-empty-trash-btn" id="cav-empty-trash">
                Empty Trash
              </button>
            ` : ''}
          </div>
          
          ${this.state.trashedAssets.length === 0 ? `
            <div class="cav-empty-state">
              ${Icons.Trash2()}
              <h3>Trash is Empty</h3>
              <p>Deleted items will appear here for 30 days before being permanently removed.</p>
            </div>
          ` : `
            <div class="cav-trash-list">
              ${this.state.trashedAssets.map(asset => `
                <div class="cav-trash-item">
                  <div class="cav-trash-info">
                    <span class="cav-trash-filename">${asset.filename}</span>
                    <span class="cav-trash-date">Deleted ${new Date(asset.archived_at).toLocaleDateString()}</span>
                  </div>
                  <div class="cav-trash-actions">
                    <button class="cav-restore-btn" data-id="${asset.id}">Restore</button>
                    <button class="cav-permanent-delete-btn" data-id="${asset.id}">Delete Forever</button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      `;
    }

    renderBatchTagModal() {
      return `
        <div class="cav-modal-overlay" id="cav-batch-modal-overlay">
          <div class="cav-batch-modal">
            <h3>Apply Tags to ${this.state.selectedAssets.size} Selected Assets</h3>
            <p class="cav-batch-hint">Leave fields empty to keep existing values</p>
            
            <div class="cav-batch-fields">
              <div class="cav-batch-field">
                <label>Campaign</label>
                <input type="text" id="cav-batch-campaign" placeholder="Campaign name..." value="${this.state.batchTags.campaign}">
              </div>
              <div class="cav-batch-field">
                <label>Client</label>
                <input type="text" id="cav-batch-client" placeholder="Client name..." value="${this.state.batchTags.client}">
              </div>
              <div class="cav-batch-field">
                <label>Project</label>
                <input type="text" id="cav-batch-project" placeholder="Project name..." value="${this.state.batchTags.project}">
              </div>
            </div>
            
            <div class="cav-batch-actions">
              <button class="cav-batch-cancel" id="cav-batch-cancel">Cancel</button>
              <button class="cav-batch-apply" id="cav-batch-apply">Apply Tags</button>
            </div>
          </div>
        </div>
      `;
    }

    renderLoading() {
      return `
        <div class="cav-loading-container">
          <div class="cav-spinner"></div>
          <p>Loading assets...</p>
        </div>
      `;
    }

    renderHeader() {
      return `
        <div class="cav-header">
          <div class="cav-header-content">
            <div>
              <h1 class="cav-title">Creative Asset Library</h1>
              <p class="cav-subtitle">Persistent storage • Channel validation • Team collaboration</p>
            </div>
            <div class="cav-header-actions">
              <div class="cav-storage-toggle">
                <button class="cav-toggle-btn ${this.state.storageMode === 'personal' ? 'active' : ''}" data-mode="personal">
                  ${Icons.User()} Personal
                </button>
                <button class="cav-toggle-btn ${this.state.storageMode === 'team' ? 'active' : ''}" data-mode="team">
                  ${Icons.Users()} Team
                </button>
              </div>
              <button class="cav-trash-link" id="cav-open-trash" title="View Trash">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                Trash
              </button>
            </div>
          </div>
          ${this.state.storageMode === 'team' ? `
            <div class="cav-team-warning">
              ${Icons.AlertCircle()} Team mode: Assets uploaded here are visible to all users
            </div>
          ` : ''}
        </div>
      `;
    }

    renderSearchFilter() {
      return `
        <div class="cav-search-filter">
          <div class="cav-search-row">
            <div class="cav-search-input-wrapper">
              ${Icons.Search()}
              <input type="text" 
                     class="cav-search-input" 
                     placeholder="Search by filename, campaign, client, or project..."
                     value="${this.state.searchTerm}"
                     id="cav-search">
            </div>
            <button class="cav-favorites-btn ${this.state.filterFavorites ? 'active' : ''}" id="cav-toggle-favorites" title="Show favorites only">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="${this.state.filterFavorites ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Favorites
            </button>
            <button class="cav-filter-btn" id="cav-toggle-filters">
              ${Icons.Filter()} Filters
              ${this.state.showFilters ? Icons.ChevronDown() : Icons.ChevronRight()}
            </button>
            <div class="cav-sort-wrapper">
              <select class="cav-sort-select" id="cav-sort">
                <option value="created_at-DESC" ${this.state.sortBy === 'created_at' && this.state.sortOrder === 'DESC' ? 'selected' : ''}>Newest First</option>
                <option value="created_at-ASC" ${this.state.sortBy === 'created_at' && this.state.sortOrder === 'ASC' ? 'selected' : ''}>Oldest First</option>
                <option value="filename-ASC" ${this.state.sortBy === 'filename' && this.state.sortOrder === 'ASC' ? 'selected' : ''}>Name A-Z</option>
                <option value="filename-DESC" ${this.state.sortBy === 'filename' && this.state.sortOrder === 'DESC' ? 'selected' : ''}>Name Z-A</option>
                <option value="file_size-DESC" ${this.state.sortBy === 'file_size' && this.state.sortOrder === 'DESC' ? 'selected' : ''}>Largest First</option>
                <option value="file_size-ASC" ${this.state.sortBy === 'file_size' && this.state.sortOrder === 'ASC' ? 'selected' : ''}>Smallest First</option>
              </select>
              ${Icons.ArrowUpDown()}
            </div>
          </div>
          
          ${this.state.showFilters ? `
            <div class="cav-filters-panel">
              <div class="cav-filter-group">
                <label>Channel</label>
                <select class="cav-filter-select" id="cav-filter-channel">
                  <option value="all">All Channels</option>
                  ${this.getAllChannels().map(ch => `
                    <option value="${ch}" ${this.state.filterChannel === ch ? 'selected' : ''}>${ch}</option>
                  `).join('')}
                </select>
              </div>
              <div class="cav-filter-group">
                <label>Status</label>
                <select class="cav-filter-select" id="cav-filter-status">
                  <option value="all">All Status</option>
                  <option value="draft" ${this.state.filterStatus === 'draft' ? 'selected' : ''}>Draft</option>
                  <option value="review" ${this.state.filterStatus === 'review' ? 'selected' : ''}>In Review</option>
                  <option value="approved" ${this.state.filterStatus === 'approved' ? 'selected' : ''}>Approved</option>
                  <option value="rejected" ${this.state.filterStatus === 'rejected' ? 'selected' : ''}>Rejected</option>
                </select>
              </div>
              <button class="cav-clear-filters" id="cav-clear-filters">Clear Filters</button>
            </div>
          ` : ''}
          
          <div class="cav-results-bar">
            <p>Showing ${this.state.assets.length} of ${this.state.totalAssets} assets ${this.state.filterFavorites ? '(favorites only)' : ''}</p>
            ${this.state.assets.length > 0 ? `
              <button class="cav-export-btn" id="cav-export">
                ${Icons.Download()} Export Report
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }

    renderActionCards() {
      // Adobe Express-style action cards with consistent SVG line icons
      return `
        <div class="cav-action-cards">
          <div class="cav-action-card" data-action="upload" id="cav-action-upload">
            <div class="cav-action-card-icon">
              <svg class="cav-icon" style="width:32px;height:32px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <h3 class="cav-action-card-title">Upload Content</h3>
            <p class="cav-action-card-description">Add images & videos</p>
          </div>
          <div class="cav-action-card" data-action="ai-analyze" id="cav-action-analyze">
            <div class="cav-action-card-icon">
              <svg class="cav-icon" style="width:32px;height:32px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <h3 class="cav-action-card-title">AI Analyze</h3>
            <p class="cav-action-card-description">Get creative insights</p>
          </div>
          <div class="cav-action-card" data-action="batch-fix" id="cav-action-batch">
            <div class="cav-action-card-icon">
              <svg class="cav-icon" style="width:32px;height:32px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
            </div>
            <h3 class="cav-action-card-title">Batch AI Fix</h3>
            <p class="cav-action-card-description">Resize for all channels</p>
          </div>
          <div class="cav-action-card" data-action="templates" id="cav-action-templates">
            <div class="cav-action-card-icon">
              <svg class="cav-icon" style="width:32px;height:32px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="9" y1="21" x2="9" y2="9"/>
              </svg>
            </div>
            <h3 class="cav-action-card-title">Templates</h3>
            <p class="cav-action-card-description">Browse pre-made sizes</p>
          </div>
        </div>
        ${this.renderQuickPills()}
      `;
    }

    renderQuickPills() {
      // Adobe Express-style quick action pills with tooltips
      const pills = [
        { icon: '📱', label: 'Instagram Story', size: '1080×1920', iconClass: 'purple', tooltip: 'Create a vertical 9:16 story for Instagram' },
        { icon: '🖼️', label: 'Facebook Post', size: '1200×630', iconClass: 'blue', tooltip: 'Create a horizontal image for Facebook feed posts' },
        { icon: '📺', label: 'YouTube Thumb', size: '1280×720', iconClass: 'red', tooltip: 'Create a 16:9 thumbnail for YouTube videos' },
        { icon: '🎬', label: 'TikTok Video', size: '1080×1920', iconClass: 'teal', tooltip: 'Create a vertical 9:16 video for TikTok' },
        { icon: '📣', label: 'LinkedIn Banner', size: '1584×396', iconClass: 'blue', tooltip: 'Create a wide banner for LinkedIn profile or company page' },
        { icon: '🎨', label: 'Google Display', size: '300×250', iconClass: 'orange', tooltip: 'Create a medium rectangle ad for Google Display Network' },
        { icon: '📲', label: 'App Store', size: '1024×1024', iconClass: 'green', tooltip: 'Create a square icon for App Store or Play Store' },
      ];

      const pillsHtml = pills.map(pill => 
        '<button class="cav-quick-pill" data-size="' + pill.size + '" data-label="' + pill.label + '" data-tooltip="' + pill.tooltip + '">' +
          '<svg class="cav-icon cav-quick-pill-icon ' + pill.iconClass + '"><use href="#icon-' + pill.label.toLowerCase().replace(/\s+/g, '-') + '"/></svg>' +
          '<span>' + pill.label + '</span>' +
        '</button>'
      ).join('');

      return `
        <div class="cav-section-header">
          <div>
            <h3 class="cav-section-title">Quick Start</h3>
            <p class="cav-section-subtitle">Popular formats based on your channels</p>
          </div>
          <a href="#" class="cav-section-link" id="view-all-formats" data-tooltip="Browse all available format templates">View all →</a>
        </div>
        <div class="cav-quick-actions">
          ${pillsHtml}
        </div>
      `;
    }

    renderUploadSection() {
      const canUpload = this.storage.canUpload();
      const videoStorage = this.state.videoStorageInfo || { usedMB: '0', maxMB: 100, percentUsed: 0 };
      const isStorageLow = videoStorage.percentUsed > 80;
      
      if (!canUpload) {
        return `
          <div class="cav-upload-section cav-upload-disabled">
            <div class="cav-upload-content">
              <svg class="cav-icon cav-icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <p class="cav-upload-title">Upload Access Restricted</p>
              <p class="cav-upload-subtitle">You have viewer access. Contact an admin to request upload permissions.</p>
            </div>
          </div>
        `;
      }
      
      return `
        <div class="cav-upload-section ${this.state.isDragging ? 'dragging' : ''}" id="cav-drop-zone">
          <input type="file" id="cav-file-input" multiple accept="video/*,image/*" hidden>
          <div class="cav-upload-content">
            ${Icons.Upload()}
            <p class="cav-upload-title">Drag & drop files here or click to upload</p>
            <p class="cav-upload-subtitle">
              Video (max ${this.storage.maxVideoUploadMB}MB each, ${this.storage.maxVideoStorageMB}MB total) or Image files • Saved to ${this.state.storageMode} library
            </p>
            <div class="cav-video-storage-bar ${isStorageLow ? 'warning' : ''}">
              <span class="cav-storage-label">🎬 Video Storage:</span>
              <span class="cav-storage-bar-track">
                <span class="cav-storage-bar-fill" style="width: ${Math.min(100, videoStorage.percentUsed)}%"></span>
              </span>
              <span class="cav-storage-text">${videoStorage.usedMB}MB / ${videoStorage.maxMB}MB</span>
            </div>
          </div>
        </div>
      `;
    }

    renderUploadProgress() {
      return `
        <div class="cav-upload-progress">
          ${this.state.uploadProgress.map((item, i) => `
            <div class="cav-progress-item ${item.status}">
              <span class="cav-progress-name">${item.name}</span>
              <span class="cav-progress-status">
                ${item.status === 'processing' ? 'Processing...' : ''}
                ${item.status === 'success' ? Icons.CheckCircle() + ' Uploaded' : ''}
                ${item.status === 'error' ? Icons.XCircle() + ' ' + (item.message || 'Error') : ''}
                ${item.status === 'duplicate' ? Icons.Copy() + ' ' + (item.message || 'Duplicate') : ''}
              </span>
            </div>
          `).join('')}
        </div>
      `;
    }

    renderBulkActions() {
      const canEdit = this.storage.canEdit();
      const canDelete = this.storage.canDelete();
      
      return `
        <div class="cav-bulk-actions">
          <div class="cav-bulk-info">
            ${Icons.CheckSquare()} ${this.state.selectedAssets.size} asset${this.state.selectedAssets.size !== 1 ? 's' : ''} selected
          </div>
          <div class="cav-bulk-buttons">
            ${canEdit ? `
              <button class="cav-bulk-tag" id="cav-bulk-tag">
                ${Icons.Tag()} Apply Tags
              </button>
              <select class="cav-bulk-status" id="cav-bulk-status">
                <option value="">Change Status...</option>
                <option value="draft">Draft</option>
                <option value="review">In Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            ` : ''}
            <button class="cav-bulk-favorite" id="cav-bulk-favorite">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Toggle Favorite
            </button>
            ${canDelete ? `
              <button class="cav-bulk-delete" id="cav-bulk-delete">
                ${Icons.Trash2()} Move to Trash
              </button>
            ` : ''}
            <button class="cav-bulk-clear" id="cav-bulk-clear">
              Clear Selection
            </button>
          </div>
        </div>
      `;
    }

    renderAssetsList() {
      if (this.state.assets.length === 0) {
        return this.renderEmptyState();
      }

      // Group derivatives with their source assets
      const groupedAssets = this.groupAssetsBySource(this.state.assets);
      
      // Use true pagination if available
      let assetsToDisplay = groupedAssets;
      let paginationUI = '';
      
      if (window.cavAdvanced?.TruePagination) {
        const pagination = window.cavAdvanced.TruePagination;
        pagination.init(groupedAssets.length);
        assetsToDisplay = pagination.getPageItems(groupedAssets);
        paginationUI = pagination.renderPaginationUI();
      }

      return `
        <div class="cav-assets-list">
          <div class="cav-select-all">
            <button class="cav-select-all-btn" id="cav-select-all">
              ${this.state.selectedAssets.size === this.state.assets.length ? Icons.CheckSquare() : Icons.Square()}
              Select All (${this.state.assets.length})
            </button>
          </div>
          ${assetsToDisplay.map(item => this.renderAssetOrGroup(item)).join('')}
          ${paginationUI}
        </div>
      `;
    }
    
    // Group derivatives with their source assets
    groupAssetsBySource(assets) {
      const sourceAssets = [];
      const derivativeMap = new Map();
      
      // First pass: separate source assets and derivatives
      assets.forEach(asset => {
        if (asset.isDerivative || asset.is_ai_derivative) {
          const sourceId = asset.sourceAssetId || asset.assetGroupId;
          if (sourceId) {
            if (!derivativeMap.has(sourceId)) {
              derivativeMap.set(sourceId, []);
            }
            derivativeMap.get(sourceId).push(asset);
          } else {
            // Derivative without source - show as standalone
            sourceAssets.push({ type: 'single', asset });
          }
        } else {
          sourceAssets.push({ type: 'source', asset });
        }
      });
      
      // Second pass: attach derivatives to source assets
      const result = sourceAssets.map(item => {
        if (item.type === 'source') {
          const derivatives = derivativeMap.get(item.asset.id) || [];
          if (derivatives.length > 0) {
            return { type: 'group', source: item.asset, derivatives };
          }
        }
        return item;
      });
      
      return result;
    }
    
    // Render either a single asset or a grouped asset with derivatives
    renderAssetOrGroup(item) {
      if (item.type === 'group') {
        return this.renderAssetGroup(item.source, item.derivatives);
      } else {
        return this.renderAssetCard(item.asset || item.source);
      }
    }
    
    // Render an asset group (source + derivatives)
    renderAssetGroup(source, derivatives) {
      const isExpanded = this.state.expandedGroups?.has(source.id);
      
      return `
        <div class="cav-asset-group" data-group-id="${source.id}">
          ${this.renderAssetCard(source)}
          <div class="cav-derivatives-toggle-bar">
            <button class="cav-group-toggle" data-action="toggle-group" data-id="${source.id}">
              <span class="cav-derivative-badge">🤖 ${derivatives.length} AI Version${derivatives.length !== 1 ? 's' : ''}</span>
              <span class="cav-group-arrow">${isExpanded ? '▲ Hide' : '▼ Show'}</span>
            </button>
          </div>
          ${isExpanded ? `
            <div class="cav-derivatives-grid">
              ${derivatives.map(d => this.renderDerivativeCard(d)).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }
    
    // Render a simplified derivative card (cleaner than full asset card)
    renderDerivativeCard(asset) {
      const thumbnailSrc = asset.thumbnail_url || asset.dataUrl || '';
      const dimensions = asset.width && asset.height ? `${asset.width}×${asset.height}` : 'Unknown';
      const channel = asset.targetChannel || asset.channel || '';
      const targetSize = asset.targetSize || asset.targetRatio || dimensions;
      const modelUsed = asset.aiModel || asset.createdBy || 'AI Generated';
      
      return `
        <div class="cav-derivative-card" data-asset-id="${asset.id}">
          <div class="cav-derivative-thumb">
            ${thumbnailSrc ? `<img src="${thumbnailSrc}" alt="${asset.filename}">` : '<div class="cav-no-thumb">🖼️</div>'}
            ${asset.file_type === 'video' ? '<span class="cav-video-badge">▶</span>' : ''}
          </div>
          <div class="cav-derivative-info">
            <div class="cav-derivative-size">${targetSize}</div>
            <div class="cav-derivative-channel">${channel || 'Custom'}</div>
            <div class="cav-derivative-dims">${dimensions}</div>
          </div>
          <div class="cav-derivative-actions">
            <button class="cav-deriv-btn" data-action="preview" data-id="${asset.id}" title="Preview"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
            <button class="cav-deriv-btn" data-action="download" data-id="${asset.id}" title="Download"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></button>
            <button class="cav-deriv-btn delete" data-action="delete" data-id="${asset.id}" title="Delete"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
          </div>
        </div>
      `;
    }

    renderAssetCard(asset) {
      const isSelected = this.state.selectedAssets.has(asset.id);
      const isExpanded = this.state.selectedAsset === asset.id;
      const isEditing = this.state.editingAsset === asset.id;
      const isRenaming = this.state.renamingAsset === asset.id;
      const isKeyboardSelected = this.state.keyboardNavIndex >= 0 && 
        this.state.assets[this.state.keyboardNavIndex]?.id === asset.id;
      const validation = asset.validation || {};
      const tags = asset.tags || {};
      const isFavorite = asset.is_favorite;
      const navIndex = this.state.assets.findIndex(a => a.id === asset.id);
      
      // Permission checks
      const canEdit = this.storage.canEdit();
      const canDeleteThis = this.storage.canDeleteAsset(asset);

      return `
        <div class="cav-asset-card ${isSelected ? 'selected' : ''} ${isKeyboardSelected ? 'keyboard-focus' : ''}" 
             data-asset-id="${asset.id}" 
             data-nav-index="${navIndex}">
          <div class="cav-asset-main">
            <div class="cav-asset-checkbox">
              <button class="cav-checkbox-btn" data-action="toggle-select" data-id="${asset.id}">
                ${isSelected ? Icons.CheckSquare() : Icons.Square()}
              </button>
            </div>
            
            <button class="cav-asset-thumbnail" data-action="preview" data-id="${asset.id}" type="button" title="Click to preview">
              ${asset.thumbnail_url ? `
                <img src="${asset.thumbnail_url}" alt="${asset.filename}">
                ${asset.file_type === 'video' ? `
                  <div class="cav-video-indicator">▶ Video</div>
                ` : ''}
              ` : `
                <div class="cav-video-placeholder">
                  ${asset.file_type === 'video' ? Icons.Play() : Icons.AlertCircle()}
                  <span>${asset.file_type === 'video' ? 'Video' : 'No Preview'}</span>
                </div>
              `}
              <div class="cav-preview-overlay">
                ${Icons.Maximize()}
              </div>
            </button>
            
            <div class="cav-asset-details">
              <div class="cav-asset-header">
                <div class="cav-asset-title-row">
                  <button class="cav-favorite-btn ${isFavorite ? 'active' : ''}" data-action="favorite" data-id="${asset.id}" title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </button>
                  ${isRenaming ? `
                    <div class="cav-rename-form">
                      <input type="text" 
                             id="cav-rename-input-${asset.id}"
                             class="cav-rename-input" 
                             value="${this.state.renameValue}"
                             data-id="${asset.id}">
                      <button class="cav-rename-save" data-id="${asset.id}" title="Save">✓</button>
                      <button class="cav-rename-cancel" data-id="${asset.id}" title="Cancel">✕</button>
                    </div>
                  ` : `
                    <h3 class="cav-asset-filename ${canEdit ? '' : 'no-edit'}" ${canEdit ? `data-action="rename" data-id="${asset.id}" title="Click to rename"` : ''}>${asset.filename}</h3>
                  `}
                </div>
                <div class="cav-asset-actions">
                  ${(asset.status === 'uncategorized' || asset.crmStatus === 'uncategorized' || asset.source === 'Google Drive' || asset.integrationId) && !asset.crmCompanyId ? `
                    <button class="cav-action-btn assign-brand" data-action="assign-brand" data-id="${asset.id}" title="Assign to Brand/Company" style="background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white;">
                      🏢
                    </button>
                  ` : ''}
                  ${canEdit ? `
                    <button class="cav-action-btn rename" data-action="rename" data-id="${asset.id}" title="Rename File">
                      ✏️
                    </button>
                  ` : ''}
                  <button class="cav-action-btn download" data-action="download" data-id="${asset.id}" title="Download Original">
                    ${Icons.Download()}
                  </button>
                  ${canEdit ? `
                    <button class="cav-action-btn" data-action="edit" data-id="${asset.id}" title="Edit Tags">
                      ${Icons.Tag()}
                    </button>
                  ` : ''}
                  <button class="cav-action-btn" data-action="expand" data-id="${asset.id}" title="View Details">
                    ${Icons.Eye()}
                  </button>
                  ${canDeleteThis ? `
                    <button class="cav-action-btn delete" data-action="delete" data-id="${asset.id}" title="Move to Trash">
                      ${Icons.Trash2()}
                    </button>
                  ` : ''}
                </div>
              </div>
              
              <div class="cav-asset-meta">
                <span>${asset.width}x${asset.height}</span>
                <span>${validation.aspectRatio || asset.aspect_ratio}</span>
                ${asset.duration ? `<span>${asset.duration}s</span>` : ''}
                <span>${((asset.file_size || 0) / (1024 * 1024)).toFixed(2)}MB</span>
              </div>
              
              <div class="cav-asset-tags">
                ${tags.campaign ? `<span class="cav-tag campaign">${Icons.Folder()} ${tags.campaign}</span>` : ''}
                ${tags.client ? `<span class="cav-tag client">${tags.client}</span>` : ''}
                ${tags.project ? `<span class="cav-tag project">${tags.project}</span>` : ''}
                <span class="cav-tag status ${tags.status || 'draft'}">${(tags.status || 'draft').toUpperCase()}</span>
                <span class="cav-tag version">v${tags.version || '1.0'}</span>
                ${tags.linkedCompanyId ? `<span class="cav-tag crm-link" title="Linked to CRM Company"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/></svg>${(() => { const c = window.cavCRM?.getCompany(tags.linkedCompanyId); return c ? c.name : 'Company'; })()}</span>` : ''}
                ${tags.linkedProjectId ? `<span class="cav-tag crm-link" title="Linked to CRM Project"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>${(() => { const p = window.cavCRM?.getProject(tags.linkedProjectId); return p ? p.name : 'Project'; })()}</span>` : ''}
              </div>
              
              <div class="cav-asset-uploaded">
                ${Icons.Clock()} Uploaded ${new Date(asset.created_at).toLocaleString()}
                ${asset.user_name ? `by ${asset.user_name}` : ''}
              </div>
              
              <div class="cav-validation-badge ${validation.isOffSize ? 'off-size' : 'compatible'}">
                ${validation.isOffSize ? `
                  ${Icons.XCircle()} OFF-SIZE: Does not fit any standard channel
                ` : `
                  ${Icons.CheckCircle()} Compatible with ${(validation.compatible || []).length} channel${(validation.compatible || []).length !== 1 ? 's' : ''}
                `}
              </div>
              
              ${(validation.compatible || []).length > 0 ? `
                <div class="cav-compatible-channels">
                  <span class="cav-channels-label">✓ Compatible:</span>
                  <div class="cav-channels-list">
                    ${validation.compatible.map(ch => `<span class="cav-channel-tag">${ch}</span>`).join('')}
                  </div>
                </div>
              ` : ''}
              
              <!-- AI Actions Section -->
              ${this.renderAIActions(asset)}
            </div>
          </div>
          
          ${isEditing ? this.renderEditForm(asset) : ''}
          ${isExpanded ? this.renderExpandedDetails(asset) : ''}
        </div>
      `;
    }

    renderAIActions(asset) {
      // Use the enhanced AI Library Integration v2.7.0
      if (window.aiLibraryIntegration?.renderAIActionsHTML) {
        const analysis = window.aiLibraryIntegration.analyzeAsset(asset);
        
        // Check if this is an AI-generated derivative
        let derivativeInfo = '';
        if (asset.isDerivative || asset.sourceAssetId || asset.createdBy || asset.is_ai_derivative) {
          // Build comprehensive derivative info
          let aiDetails = [];
          if (asset.aiModel) aiDetails.push(asset.aiModel);
          if (asset.targetChannel) aiDetails.push(`for ${asset.targetChannel}`);
          if (asset.targetRatio) aiDetails.push(asset.targetRatio);
          
          derivativeInfo = `
            <div class="cav-derivative-badge">
              <span class="deriv-icon">🤖</span>
              <div class="deriv-info">
                <span class="deriv-label">AI Generated</span>
                ${asset.createdBy ? `<span class="deriv-method">${asset.createdBy}</span>` : ''}
                ${asset.aiDescription ? `<span class="deriv-desc">${asset.aiDescription}</span>` : ''}
              </div>
              ${asset.sourceFilename ? `
                <span class="cav-derivative-link">
                  <span class="link-arrow">←</span> from <strong>${asset.sourceFilename}</strong>
                </span>
              ` : ''}
            </div>
          `;
        }
        
        // Check if this asset has derivatives (to show grouped indicator)
        let derivativesIndicator = '';
        if (asset.derivatives && asset.derivatives.length > 0) {
          derivativesIndicator = `
            <div class="cav-derivatives-indicator">
              <span class="deriv-count-icon">📦</span>
              <span class="deriv-count">${asset.derivatives.length} AI Derivative${asset.derivatives.length > 1 ? 's' : ''}</span>
              <button class="deriv-view-btn" data-action="view-derivatives" data-id="${asset.id}" title="View all derivatives">
                View All →
              </button>
            </div>
          `;
        }
        
        // Show orientation badge if set
        let orientationBadge = '';
        if (asset.orientation) {
          const orientIcons = { Vertical: '📱', Horizontal: '🖥️', Square: '⬛' };
          orientationBadge = `<span class="cav-orient-badge">${orientIcons[asset.orientation] || ''} ${asset.orientation}</span>`;
        }
        
        return derivativeInfo + derivativesIndicator + orientationBadge + window.aiLibraryIntegration.renderAIActionsHTML(asset, analysis);
      }
      
      // Fallback: Basic buttons only
      const isImage = asset.file_type === 'image' || asset.type === 'image' || (!asset.duration && asset.thumbnail_url);
      const isVideo = asset.file_type === 'video' || asset.type === 'video' || asset.duration > 0;
      
      return `
        <div class="cav-ai-section-basic">
          <div class="cav-ai-buttons">
            ${isImage ? `
              <button class="cav-ai-btn cav-ai-animate" data-action="ai-animate" data-id="${asset.id}">
                🎬 Animate
              </button>
            ` : ''}
            ${isVideo ? `
              <button class="cav-ai-btn cav-ai-still" data-action="ai-extract-still" data-id="${asset.id}">
                📸 Extract Still
              </button>
            ` : ''}
            <button class="cav-ai-btn cav-ai-studio" data-action="ai-studio" data-id="${asset.id}">
              🤖 AI Studio
            </button>
          </div>
        </div>
      `;
    }
    
    // View all derivatives for an asset
    viewAssetDerivatives(assetId) {
      const asset = this.state.assets.find(a => a.id === assetId);
      if (!asset || !asset.derivatives) return;
      
      // Filter assets to show only this asset and its derivatives
      const derivativeAssets = this.state.assets.filter(a => 
        a.id === assetId || 
        a.sourceAssetId === assetId ||
        asset.derivatives.includes(a.id)
      );
      
      // Show in modal
      const modal = document.createElement('div');
      modal.className = 'cav-derivatives-modal-overlay';
      modal.innerHTML = `
        <div class="cav-derivatives-modal">
          <div class="cav-derivatives-header">
            <h3>📦 Asset Group: ${asset.filename}</h3>
            <button class="cav-close-btn" onclick="this.closest('.cav-derivatives-modal-overlay').remove()">✕</button>
          </div>
          <div class="cav-derivatives-content">
            <div class="cav-derivatives-original">
              <h4>Original Asset</h4>
              <div class="cav-deriv-card">
                <img src="${asset.thumbnail_url || asset.dataUrl}" alt="${asset.filename}">
                <div class="cav-deriv-info">
                  <strong>${asset.filename}</strong>
                  <span>${asset.width}×${asset.height}</span>
                </div>
              </div>
            </div>
            <div class="cav-derivatives-list">
              <h4>AI Derivatives (${asset.derivatives.length})</h4>
              ${derivativeAssets.filter(d => d.id !== assetId).map(d => `
                <div class="cav-deriv-card ${d.file_type === 'video' ? 'is-video' : ''}">
                  ${d.file_type === 'video' ? `
                    <video src="${d.videoUrl || d.dataUrl}" class="cav-deriv-video"></video>
                    <span class="video-badge">▶ Video</span>
                  ` : `
                    <img src="${d.thumbnail_url || d.dataUrl}" alt="${d.filename}">
                  `}
                  <div class="cav-deriv-info">
                    <strong>${d.filename}</strong>
                    <span>${d.width}×${d.height}${d.duration ? ` • ${d.duration}s` : ''}</span>
                    ${d.aiModel ? `<span class="ai-model">${d.aiModel}</span>` : ''}
                    ${d.targetChannel ? `<span class="channel-tag">${d.targetChannel}</span>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
      };
    }

    renderEditForm(asset) {
      const tags = asset.tags || {};
      
      // Get CRM companies and projects for dropdowns
      const companies = window.cavCRM ? window.cavCRM.getCompanies() : [];
      const projects = window.cavCRM ? window.cavCRM.getProjects() : [];
      
      return `
        <div class="cav-edit-form">
          <h4><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:6px;vertical-align:middle;"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>Edit Asset Tags</h4>
          <div class="cav-edit-grid">
            <input type="text" placeholder="Campaign" value="${tags.campaign || ''}" data-field="campaign" class="cav-edit-input">
            <input type="text" placeholder="Client" value="${tags.client || ''}" data-field="client" class="cav-edit-input">
            <input type="text" placeholder="Project" value="${tags.project || ''}" data-field="project" class="cav-edit-input">
            <select data-field="status" class="cav-edit-select">
              <option value="draft" ${tags.status === 'draft' ? 'selected' : ''}>Draft</option>
              <option value="review" ${tags.status === 'review' ? 'selected' : ''}>In Review</option>
              <option value="approved" ${tags.status === 'approved' ? 'selected' : ''}>Approved</option>
              <option value="rejected" ${tags.status === 'rejected' ? 'selected' : ''}>Rejected</option>
            </select>
            <input type="text" placeholder="Version (e.g., 1.0)" value="${tags.version || '1.0'}" data-field="version" class="cav-edit-input">
          </div>
          
          <h5 style="margin: 1rem 0 0.5rem; color: var(--cav-pink); display: flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            Link to CRM
          </h5>
          <div class="cav-edit-grid cav-crm-links">
            <select data-field="linkedCompanyId" class="cav-edit-select">
              <option value="">Select Company...</option>
              ${companies.map(c => `<option value="${c.id}" ${tags.linkedCompanyId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
            <select data-field="linkedProjectId" class="cav-edit-select">
              <option value="">Select Project...</option>
              ${projects.map(p => `<option value="${p.id}" ${tags.linkedProjectId === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
            </select>
          </div>
          
          <div class="cav-edit-actions">
            <button class="cav-save-tags" data-id="${asset.id}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><polyline points="20 6 9 17 4 12"/></svg>Save Changes</button>
            <button class="cav-cancel-edit" data-id="${asset.id}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Cancel</button>
          </div>
        </div>
      `;
    }

    renderExpandedDetails(asset) {
      const validation = asset.validation || {};
      const incompatible = validation.incompatible || {};
      const comments = asset.comments || [];
      const history = asset.history || [];
      const recommendations = this.getResolutionRecommendations(asset);

      return `
        <div class="cav-expanded-details">
          ${recommendations.length > 0 ? `
            <div class="cav-recommendations-section">
              <h4>💡 Recommendations to Fix Compatibility:</h4>
              <div class="cav-recommendations-list">
                ${recommendations.slice(0, 5).map(rec => `
                  <div class="cav-recommendation-item">
                    <strong>${rec.channel}:</strong>
                    <ul>
                      ${rec.suggestions.map(s => `<li>${s}</li>`).join('')}
                    </ul>
                  </div>
                `).join('')}
                ${recommendations.length > 5 ? `
                  <p class="cav-more-recs">+ ${recommendations.length - 5} more channels with recommendations</p>
                ` : ''}
              </div>
            </div>
          ` : ''}
          
          ${Object.keys(incompatible).length > 0 ? `
            <div class="cav-incompatible-section">
              <h4>✗ Incompatible Channels:</h4>
              <div class="cav-incompatible-list">
                ${Object.entries(incompatible).map(([channel, reasons]) => `
                  <div class="cav-incompatible-item">
                    <strong>${channel}:</strong>
                    <ul>
                      ${reasons.map(r => `<li>${r}</li>`).join('')}
                    </ul>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          <div class="cav-comments-section">
            <h4>${Icons.MessageSquare()} Comments (${comments.length})</h4>
            ${comments.length > 0 ? `
              <div class="cav-comments-list">
                ${comments.map(c => `
                  <div class="cav-comment">
                    <div class="cav-comment-header">
                      ${c.user_avatar ? `<img src="${c.user_avatar}" class="cav-comment-avatar">` : ''}
                      <span class="cav-comment-author">${c.user_name || 'Anonymous'}</span>
                      <span class="cav-comment-date">${new Date(c.created_at).toLocaleString()}</span>
                    </div>
                    <p class="cav-comment-text">${c.text}</p>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            <div class="cav-add-comment">
              <input type="text" placeholder="Add a comment..." class="cav-comment-input" data-asset-id="${asset.id}">
              <button class="cav-comment-submit" data-id="${asset.id}">Add</button>
            </div>
          </div>
          
          ${history.length > 0 ? `
            <div class="cav-history-section">
              <h4>${Icons.Clock()} History</h4>
              <div class="cav-history-list">
                ${history.slice().reverse().map(h => `
                  <div class="cav-history-item">
                    <span class="cav-history-action">${(h.action || '').replace(/_/g, ' ')}</span>
                    ${h.user_name ? `<span class="cav-history-user">by ${h.user_name}</span>` : ''}
                    <span class="cav-history-date">${new Date(h.timestamp || h.created_at).toLocaleString()}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }

    renderEmptyState() {
      if (this.state.searchTerm || this.state.filterChannel !== 'all' || this.state.filterStatus !== 'all') {
        return `
          <div class="cav-empty-state">
            ${Icons.AlertCircle()}
            <h3>No Matching Assets</h3>
            <p>Try adjusting your search or filters</p>
            <button class="cav-clear-btn" id="cav-clear-all">Clear Filters</button>
          </div>
        `;
      }

      return `
        <div class="cav-empty-state">
          ${Icons.AlertCircle()}
          <h3>No Assets in Library</h3>
          <p>Upload videos or images to start building your ${this.state.storageMode} asset library</p>
        </div>
      `;
    }

    renderPagination() {
      if (this.state.totalPages <= 1) return '';

      return `
        <div class="cav-pagination">
          <button class="cav-page-btn" ${this.state.currentPage === 1 ? 'disabled' : ''} data-page="${this.state.currentPage - 1}">
            Previous
          </button>
          <span class="cav-page-info">Page ${this.state.currentPage} of ${this.state.totalPages}</span>
          <button class="cav-page-btn" ${this.state.currentPage === this.state.totalPages ? 'disabled' : ''} data-page="${this.state.currentPage + 1}">
            Next
          </button>
        </div>
      `;
    }

    renderPreviewModal() {
      const asset = this.state.previewAsset;
      if (!asset) return '';
      
      const isVideo = asset.file_type === 'video' || asset.type === 'video' || asset.duration > 0;
      // Check multiple possible video URL sources (for AI-generated videos)
      const videoUrl = asset.video_url || asset.videoUrl || (isVideo ? asset.dataUrl : null);
      const hasVideoUrl = !!videoUrl;
      
      // Calculate aspect ratio for proper sizing
      const aspectRatio = asset.width && asset.height ? (asset.width / asset.height) : 1;
      const isVertical = aspectRatio < 1;
      const isSquare = Math.abs(aspectRatio - 1) < 0.1;

      return `
        <div class="cav-modal-overlay" id="cav-modal-overlay">
          <div class="cav-preview-modal ${isVertical ? 'vertical' : ''} ${isSquare ? 'square' : ''}">
            <button class="cav-modal-close" id="cav-close-preview">${Icons.X()}</button>
            <div class="cav-preview-content" style="aspect-ratio: ${asset.width}/${asset.height};">
              ${isVideo && hasVideoUrl ? `
                <video 
                  src="${videoUrl}" 
                  class="cav-preview-video"
                  controls
                  autoplay
                  loop
                  playsinline
                  style="width: 100%; height: 100%; object-fit: contain;">
                  Your browser does not support video playback.
                </video>
              ` : isVideo && !hasVideoUrl ? `
                <div class="cav-preview-video-placeholder">
                  ${Icons.Play()}
                  <p>Video Preview Unavailable</p>
                  <small>Video data not available for preview</small>
                  <small class="cav-preview-filename">${asset.filename}</small>
                  ${asset.aiModel ? `<small class="cav-preview-ai">Generated with ${asset.aiModel}</small>` : ''}
                </div>
              ` : asset.thumbnail_url || asset.dataUrl ? `
                <img src="${asset.thumbnail_url || asset.dataUrl}" alt="${asset.filename}" class="cav-preview-image">
              ` : `
                <div class="cav-preview-video-placeholder">
                  ${Icons.AlertCircle()}
                  <p>Preview Unavailable</p>
                  <small>${asset.filename}</small>
                </div>
              `}
            </div>
            <div class="cav-preview-info">
              <h3>${asset.filename}</h3>
              <div class="cav-preview-meta">
                <span class="cav-preview-badge ${isVideo ? 'video' : 'image'}">${isVideo ? '🎬 Video' : '🖼️ Image'}</span>
                <span>${asset.width} × ${asset.height}</span>
                <span>${asset.validation?.aspectRatio || asset.aspect_ratio}</span>
                ${asset.duration ? `<span>${asset.duration}s</span>` : ''}
                <span>${((asset.file_size || 0) / (1024 * 1024)).toFixed(2)} MB</span>
              </div>
              ${(asset.validation?.compatible || []).length > 0 ? `
                <div class="cav-preview-channels">
                  <span class="cav-preview-channels-label">Compatible with:</span>
                  ${asset.validation.compatible.slice(0, 5).map(ch => `<span class="cav-preview-channel">${ch}</span>`).join('')}
                  ${asset.validation.compatible.length > 5 ? `<span class="cav-preview-channel more">+${asset.validation.compatible.length - 5} more</span>` : ''}
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }

    renderDeleteConfirm() {
      const assetId = this.state.showDeleteConfirm;
      const asset = this.state.assets.find(a => a.id === assetId);
      if (!asset) return '';

      return `
        <div class="cav-modal-overlay" id="cav-delete-overlay">
          <div class="cav-confirm-modal">
            <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>Move to Trash?</h3>
            <p>Move "<strong>${asset.filename}</strong>" to trash?</p>
            <p class="cav-confirm-info">You can restore it from the trash later.</p>
            <div class="cav-confirm-actions">
              <button class="cav-confirm-cancel" id="cav-cancel-delete">Cancel</button>
              <button class="cav-confirm-archive" id="cav-confirm-archive" data-id="${assetId}">Move to Trash</button>
            </div>
          </div>
        </div>
      `;
    }

    attachEventHandlers() {
      // Action cards (Adobe Express style)
      this.container.querySelectorAll('.cav-action-card').forEach(card => {
        card.addEventListener('click', () => {
          const action = card.dataset.action;
          switch(action) {
            case 'upload':
              document.getElementById('cav-file-input')?.click();
              break;
            case 'ai-analyze':
              // Navigate to Analyze module
              document.querySelector('#nav-analyze')?.click();
              break;
            case 'batch-fix':
              // Navigate to AI Studio or trigger batch AI
              document.querySelector('#nav-ai-studio')?.click();
              break;
            case 'templates':
              // Show templates modal or navigate
              window.showNotification?.('Templates coming soon!', 'info');
              break;
          }
        });
      });

      // Quick pills (Adobe Express style)
      this.container.querySelectorAll('.cav-quick-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          const size = pill.dataset.size;
          const label = pill.dataset.label;
          // Show notification or navigate to create with this size
          window.showNotification?.('Create ' + label + ' (' + size + ') - Select an asset first', 'info');
        });
      });

      // View all formats link
      const viewAllFormats = this.container.querySelector('#view-all-formats');
      if (viewAllFormats) {
        viewAllFormats.addEventListener('click', (e) => {
          e.preventDefault();
          // Could show a modal with all format options or navigate to AI Studio
          document.querySelector('#nav-ai-studio')?.click();
        });
      }

      // Storage mode toggle
      this.container.querySelectorAll('.cav-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.state.storageMode = btn.dataset.mode;
          this.state.currentPage = 1;
          this.loadAssets();
        });
      });

      // Search
      const searchInput = this.container.querySelector('#cav-search');
      if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
          clearTimeout(searchTimeout);
          searchTimeout = setTimeout(() => {
            this.state.searchTerm = e.target.value;
            this.state.currentPage = 1;
            this.loadAssets();
          }, 300);
        });
      }

      // Toggle filters
      const toggleFilters = this.container.querySelector('#cav-toggle-filters');
      if (toggleFilters) {
        toggleFilters.addEventListener('click', () => {
          this.state.showFilters = !this.state.showFilters;
          this.render();
        });
      }

      // Sort
      const sortSelect = this.container.querySelector('#cav-sort');
      if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
          const [sortBy, sortOrder] = e.target.value.split('-');
          this.state.sortBy = sortBy;
          this.state.sortOrder = sortOrder;
          this.loadAssets();
        });
      }

      // Filter channel
      const filterChannel = this.container.querySelector('#cav-filter-channel');
      if (filterChannel) {
        filterChannel.addEventListener('change', (e) => {
          this.state.filterChannel = e.target.value;
          this.state.currentPage = 1;
          this.loadAssets();
        });
      }

      // Filter status
      const filterStatus = this.container.querySelector('#cav-filter-status');
      if (filterStatus) {
        filterStatus.addEventListener('change', (e) => {
          this.state.filterStatus = e.target.value;
          this.state.currentPage = 1;
          this.loadAssets();
        });
      }

      // Clear filters
      const clearFilters = this.container.querySelector('#cav-clear-filters');
      if (clearFilters) {
        clearFilters.addEventListener('click', () => {
          this.state.searchTerm = '';
          this.state.filterChannel = 'all';
          this.state.filterStatus = 'all';
          this.state.currentPage = 1;
          this.loadAssets();
        });
      }

      // Clear all (from empty state)
      const clearAll = this.container.querySelector('#cav-clear-all');
      if (clearAll) {
        clearAll.addEventListener('click', () => {
          this.state.searchTerm = '';
          this.state.filterChannel = 'all';
          this.state.filterStatus = 'all';
          this.state.currentPage = 1;
          this.loadAssets();
        });
      }

      // Export
      const exportBtn = this.container.querySelector('#cav-export');
      if (exportBtn) {
        exportBtn.addEventListener('click', () => this.exportReport());
      }

      // File upload - drag and drop
      const dropZone = this.container.querySelector('#cav-drop-zone');
      if (dropZone) {
        dropZone.addEventListener('click', () => {
          this.container.querySelector('#cav-file-input').click();
        });

        dropZone.addEventListener('dragover', (e) => {
          e.preventDefault();
          this.state.isDragging = true;
          dropZone.classList.add('dragging');
        });

        dropZone.addEventListener('dragleave', (e) => {
          e.preventDefault();
          this.state.isDragging = false;
          dropZone.classList.remove('dragging');
        });

        dropZone.addEventListener('drop', (e) => {
          e.preventDefault();
          this.state.isDragging = false;
          dropZone.classList.remove('dragging');
          if (e.dataTransfer.files.length > 0) {
            this.handleFileUpload(e.dataTransfer.files);
          }
        });
      }

      // File input change
      const fileInput = this.container.querySelector('#cav-file-input');
      if (fileInput) {
        fileInput.addEventListener('change', (e) => {
          if (e.target.files.length > 0) {
            this.handleFileUpload(e.target.files);
          }
        });
      }

      // Select all
      const selectAll = this.container.querySelector('#cav-select-all');
      if (selectAll) {
        selectAll.addEventListener('click', () => this.toggleSelectAll());
      }

      // Bulk status change
      const bulkStatus = this.container.querySelector('#cav-bulk-status');
      if (bulkStatus) {
        bulkStatus.addEventListener('change', (e) => {
          if (e.target.value) {
            this.bulkUpdateStatus(e.target.value);
          }
        });
      }

      // Bulk delete
      const bulkDelete = this.container.querySelector('#cav-bulk-delete');
      if (bulkDelete) {
        bulkDelete.addEventListener('click', () => {
          if (confirm(`Delete ${this.state.selectedAssets.size} selected assets?`)) {
            this.bulkDelete();
          }
        });
      }

      // Bulk clear
      const bulkClear = this.container.querySelector('#cav-bulk-clear');
      if (bulkClear) {
        bulkClear.addEventListener('click', () => {
          this.state.selectedAssets = new Set();
          this.render();
        });
      }

      // True Pagination event handlers
      this.container.querySelectorAll('.cav-page-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const page = parseInt(btn.dataset.page);
          if (window.cavAdvanced?.TruePagination && page) {
            window.cavAdvanced.TruePagination.goToPage(page);
            this.render();
            // Scroll to top of assets
            this.container.querySelector('.cav-assets-list')?.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });

      this.container.querySelectorAll('.cav-page-nav').forEach(btn => {
        btn.addEventListener('click', () => {
          const action = btn.dataset.action;
          if (window.cavAdvanced?.TruePagination) {
            if (action === 'prev') {
              window.cavAdvanced.TruePagination.prevPage();
            } else if (action === 'next') {
              window.cavAdvanced.TruePagination.nextPage();
            }
            this.render();
            this.container.querySelector('.cav-assets-list')?.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });

      // Asset actions (using event delegation)
      this.container.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = btn.dataset.action;
          const id = btn.dataset.id;

          switch (action) {
            case 'toggle-select':
              this.toggleSelectAsset(id);
              break;
            case 'toggle-group':
              // Toggle expand/collapse of asset group
              if (this.state.expandedGroups.has(id)) {
                this.state.expandedGroups.delete(id);
              } else {
                this.state.expandedGroups.add(id);
              }
              this.render();
              break;
            case 'preview':
              const previewAsset = this.state.assets.find(a => a.id === id);
              if (previewAsset) {
                this.state.previewAsset = previewAsset;
                this.render();
              }
              break;
            case 'edit':
              this.state.editingAsset = this.state.editingAsset === id ? null : id;
              this.render();
              break;
            case 'expand':
              this.state.selectedAsset = this.state.selectedAsset === id ? null : id;
              this.render();
              break;
            case 'delete':
              this.state.showDeleteConfirm = id;
              this.render();
              break;
            case 'favorite':
              this.toggleFavorite(id);
              break;
            case 'download':
              const downloadAsset = this.state.assets.find(a => a.id === id);
              if (downloadAsset) this.downloadAsset(downloadAsset);
              break;
            case 'rename':
              this.startRename(id);
              break;
            // AI Action handlers
            case 'ai-fix':
            case 'ai-fix-all':
              const fixAsset = this.state.assets.find(a => a.id === id);
              if (fixAsset && window.aiLibraryIntegration) {
                const analysis = window.aiLibraryIntegration.analyzeAsset(fixAsset);
                window.aiLibraryIntegration.openAIFixPanel(fixAsset, analysis);
              }
              break;
            case 'ai-fix-single':
              const singleFixAsset = this.state.assets.find(a => a.id === id);
              if (singleFixAsset && window.aiLibraryIntegration) {
                const channel = btn.dataset.channel;
                const ratio = btn.dataset.ratio;
                const ratioDecimal = parseFloat(btn.dataset.ratioDecimal);
                window.aiLibraryIntegration.openSingleChannelFix(singleFixAsset, channel, ratio, ratioDecimal);
              }
              break;
            case 'ai-animate':
              const animAsset = this.state.assets.find(a => a.id === id);
              if (animAsset && window.aiLibraryIntegration) {
                const analysis = window.aiLibraryIntegration.analyzeAsset(animAsset);
                window.aiLibraryIntegration.openAnimationPanel(animAsset, analysis);
              }
              break;
            case 'ai-extract-still':
              const stillAsset = this.state.assets.find(a => a.id === id);
              if (stillAsset && window.aiLibraryIntegration) {
                const analysis = window.aiLibraryIntegration.analyzeAsset(stillAsset);
                window.aiLibraryIntegration.openExtractStillPanel(stillAsset, analysis);
              }
              break;
            case 'ai-studio':
              const studioAsset = this.state.assets.find(a => a.id === id);
              if (studioAsset && window.cavAIStudio) {
                window.cavAIStudio.openStudio(studioAsset);
              }
              break;
            case 'view-derivatives':
              this.viewAssetDerivatives(id);
              break;
            case 'assign-brand':
              // Show CRM assign to brand modal
              const assignAsset = this.state.assets.find(a => a.id === id);
              if (assignAsset && window.cavCRM?.showAssignToBrandModal) {
                window.cavCRM.showAssignToBrandModal(id, {
                  filename: assignAsset.filename,
                  thumbnail: assignAsset.thumbnail_url || assignAsset.dataUrl,
                });
              } else if (window.cavCRM) {
                // Fallback: Basic prompt-based assignment
                const companies = Object.values(window.cavCRM.companies || {});
                const existingNames = companies.map(c => c.name).join(', ');
                
                const brandName = prompt(
                  `Assign "${assignAsset?.filename || 'asset'}" to a brand:\n\n` +
                  `Existing brands: ${existingNames || 'None'}\n\n` +
                  `Enter brand name (new or existing):`
                );
                
                if (brandName) {
                  window.cavCRM.assignAssetToBrand(id, { name: brandName })
                    .then(result => {
                      alert(`✅ Assigned to ${result.company.name}!`);
                      this.refreshAssets();
                    })
                    .catch(err => alert(`❌ Failed: ${err.message}`));
                }
              } else {
                alert('CRM module not available. Please ensure it is loaded.');
              }
              break;
          }
        });
      });

      // Rename form handlers
      this.container.querySelectorAll('.cav-rename-input').forEach(input => {
        input.addEventListener('input', (e) => {
          this.state.renameValue = e.target.value;
        });
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            this.saveRename(input.dataset.id);
          }
        });
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            this.cancelRename();
          }
        });
      });

      this.container.querySelectorAll('.cav-rename-save').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.saveRename(btn.dataset.id);
        });
      });

      this.container.querySelectorAll('.cav-rename-cancel').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.cancelRename();
        });
      });

      // Favorites toggle
      const toggleFavorites = this.container.querySelector('#cav-toggle-favorites');
      if (toggleFavorites) {
        toggleFavorites.addEventListener('click', () => {
          this.state.filterFavorites = !this.state.filterFavorites;
          this.state.currentPage = 1;
          this.loadAssets();
        });
      }

      // Open trash
      const openTrash = this.container.querySelector('#cav-open-trash');
      if (openTrash) {
        openTrash.addEventListener('click', () => {
          this.state.showTrash = true;
          this.loadTrashedAssets();
        });
      }

      // Back from trash
      const backFromTrash = this.container.querySelector('#cav-back-from-trash');
      if (backFromTrash) {
        backFromTrash.addEventListener('click', () => {
          this.state.showTrash = false;
          this.loadAssets();
        });
      }

      // Empty trash
      const emptyTrash = this.container.querySelector('#cav-empty-trash');
      if (emptyTrash) {
        emptyTrash.addEventListener('click', () => this.emptyTrash());
      }

      // Restore from trash
      this.container.querySelectorAll('.cav-restore-btn').forEach(btn => {
        btn.addEventListener('click', () => this.restoreAsset(btn.dataset.id));
      });

      // Permanent delete
      this.container.querySelectorAll('.cav-permanent-delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (confirm('Permanently delete this asset? This cannot be undone.')) {
            this.permanentlyDeleteAsset(btn.dataset.id);
          }
        });
      });

      // Bulk tag button
      const bulkTag = this.container.querySelector('#cav-bulk-tag');
      if (bulkTag) {
        bulkTag.addEventListener('click', () => this.openBatchTagModal());
      }

      // Bulk favorite
      const bulkFavorite = this.container.querySelector('#cav-bulk-favorite');
      if (bulkFavorite) {
        bulkFavorite.addEventListener('click', async () => {
          for (const id of this.state.selectedAssets) {
            await this.toggleFavorite(id);
          }
          this.state.selectedAssets = new Set();
          this.loadAssets();
        });
      }

      // Batch tag modal
      const batchCancel = this.container.querySelector('#cav-batch-cancel');
      if (batchCancel) {
        batchCancel.addEventListener('click', () => {
          this.state.showBatchTagModal = false;
          this.render();
        });
      }

      const batchApply = this.container.querySelector('#cav-batch-apply');
      if (batchApply) {
        batchApply.addEventListener('click', () => {
          this.state.batchTags = {
            campaign: this.container.querySelector('#cav-batch-campaign')?.value || '',
            client: this.container.querySelector('#cav-batch-client')?.value || '',
            project: this.container.querySelector('#cav-batch-project')?.value || ''
          };
          this.applyBatchTags();
        });
      }

      const batchOverlay = this.container.querySelector('#cav-batch-modal-overlay');
      if (batchOverlay) {
        batchOverlay.addEventListener('click', (e) => {
          if (e.target === batchOverlay) {
            this.state.showBatchTagModal = false;
            this.render();
          }
        });
      }

      // Save tags
      this.container.querySelectorAll('.cav-save-tags').forEach(btn => {
        btn.addEventListener('click', () => {
          const assetId = btn.dataset.id;
          const card = btn.closest('.cav-asset-card');
          const tags = {};
          
          card.querySelectorAll('.cav-edit-input, .cav-edit-select').forEach(input => {
            tags[input.dataset.field] = input.value;
          });
          
          this.updateAssetTags(assetId, tags);
          this.state.editingAsset = null;
        });
      });

      // Cancel edit
      this.container.querySelectorAll('.cav-cancel-edit').forEach(btn => {
        btn.addEventListener('click', () => {
          this.state.editingAsset = null;
          this.render();
        });
      });

      // Add comment
      this.container.querySelectorAll('.cav-comment-submit').forEach(btn => {
        btn.addEventListener('click', () => {
          const assetId = btn.dataset.id;
          const input = this.container.querySelector(`.cav-comment-input[data-asset-id="${assetId}"]`);
          if (input && input.value.trim()) {
            this.addComment(assetId, input.value.trim());
            input.value = '';
          }
        });
      });

      // Comment input enter key
      this.container.querySelectorAll('.cav-comment-input').forEach(input => {
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter' && input.value.trim()) {
            this.addComment(input.dataset.assetId, input.value.trim());
            input.value = '';
          }
        });
      });

      // Pagination
      this.container.querySelectorAll('.cav-page-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (!btn.disabled) {
            this.state.currentPage = parseInt(btn.dataset.page);
            this.loadAssets();
          }
        });
      });

      // Preview modal close
      const closePreview = this.container.querySelector('#cav-close-preview');
      if (closePreview) {
        closePreview.addEventListener('click', () => {
          this.state.previewAsset = null;
          this.render();
        });
      }

      const modalOverlay = this.container.querySelector('#cav-modal-overlay');
      if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
          if (e.target === modalOverlay) {
            this.state.previewAsset = null;
            this.render();
          }
        });
      }

      // Delete confirm
      const cancelDelete = this.container.querySelector('#cav-cancel-delete');
      if (cancelDelete) {
        cancelDelete.addEventListener('click', () => {
          this.state.showDeleteConfirm = null;
          this.render();
        });
      }

      const confirmArchive = this.container.querySelector('#cav-confirm-archive');
      if (confirmArchive) {
        confirmArchive.addEventListener('click', () => {
          this.archiveAsset(confirmArchive.dataset.id);
        });
      }

      const deleteOverlay = this.container.querySelector('#cav-delete-overlay');
      if (deleteOverlay) {
        deleteOverlay.addEventListener('click', (e) => {
          if (e.target === deleteOverlay) {
            this.state.showDeleteConfirm = null;
            this.render();
          }
        });
      }
    }
  }

  // ============================================
  // INITIALIZE ON DOM READY
  // ============================================
  function initializeApp() {
    const container = document.getElementById('creative-asset-validator-root');
    if (container) {
      // Check for WordPress environment - only if cavSettings has valid apiUrl
      const isWordPress = typeof cavSettings !== 'undefined' && 
                          cavSettings !== null && 
                          typeof cavSettings.apiUrl === 'string' && 
                          cavSettings.apiUrl.length > 0;
      
      if (isWordPress) {
        console.log('[CAV] Initializing in WordPress mode');
        console.log('[CAV] User:', cavSettings.userName || cavSettings.wpUserName);
        console.log('[CAV] API URL:', cavSettings.apiUrl);
        
        // Set user name from WordPress if available
        if (cavSettings.wpUserName) {
          localStorage.setItem('cav_user_name', cavSettings.wpUserName);
        }
      } else {
        console.log('[CAV] Initializing in standalone mode (IndexedDB storage)');
      }
      
      const app = new AssetValidatorApp(container);
      
      // Expose refresh function for AI integration
      window.refreshAssetLibrary = () => {
        if (app && app.loadAssets) {
          app.loadAssets();
        }
      };
      
      // Expose the app instance for advanced integrations
      // window.cavApp gives direct access to the app instance with all properties
      window.cavApp = app;
      
      // Expose assets getter for toolbar/batch operations and module integration
      // window.cavValidatorApp is a safe wrapper with getters
      window.cavValidatorApp = {
        get assets() { return app.state.assets; },
        get state() { return app.state; },
        refresh: () => app.loadAssets(),
        render: () => app.render(),
        getAssetById: (id) => app.state.assets.find(a => a.id === id),
        addAsset: async (asset) => {
          // CRITICAL FIX: Persist to IndexedDB AND add to in-memory state
          try {
            // First save to IndexedDB for persistence
            const result = await app.storage.saveAsset(asset);
            if (result?.success === false) {
              console.error('[CAV] Failed to save asset to IndexedDB:', result.message);
            } else {
              console.log('[CAV] Asset saved to IndexedDB:', asset.filename || asset.id);
            }
          } catch (err) {
            console.error('[CAV] Error saving asset to IndexedDB:', err);
            // Fallback to localStorage
            try {
              const storageKey = app.localStorageKey;
              const assets = JSON.parse(localStorage.getItem(storageKey) || '[]');
              assets.unshift(asset);
              localStorage.setItem(storageKey, JSON.stringify(assets));
              console.log('[CAV] Asset saved to localStorage (fallback):', asset.filename || asset.id);
            } catch (e) {
              console.error('[CAV] LocalStorage fallback also failed:', e);
            }
          }
          
          // Also add to in-memory state for immediate display
          if (!app.state.assets.find(a => a.id === asset.id)) {
            app.state.assets.unshift(asset);
          }
          app.render();
        },
        storage: app.storage
      };
    } else {
      console.warn('[CAV] Container element not found: creative-asset-validator-root');
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    // DOM is already ready, but wait a tick for WordPress scripts
    setTimeout(initializeApp, 10);
  }

})();

