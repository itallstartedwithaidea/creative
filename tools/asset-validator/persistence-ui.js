/**
 * Persistence UI - Unified Save/Delete System
 * Creative Innovate Tool
 * Version: 1.0.0 - January 18, 2026
 * 
 * Provides consistent Save/Delete buttons and feedback across all modules:
 * - Profile Settings
 * - CRM (Companies, Contacts, Projects, Deals)
 * - Creative Analyses
 * - Strategies
 * - Learn Module (Swipe Files, Benchmarks, URL Analyses)
 * - Google Ads Builder
 * - Social Media Builder
 * - Keyword Analyzer
 * - Video Analyses
 */

(function() {
    'use strict';

    const VERSION = '1.0.0';

    // ============================================
    // ICONS
    // ============================================
    const ICONS = {
        save: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
        delete: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
        check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
        x: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
        loader: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="persist-spinner"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>',
        cloud: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>',
        cloudCheck: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/><polyline points="9 15 11 17 15 13"/></svg>',
        edit: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
        plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    };

    // ============================================
    // STYLES
    // ============================================
    const STYLES = `
        /* Persistence UI Styles */
        .persist-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 10px 18px;
            border-radius: 10px;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            border: none;
            font-family: var(--cav-font-sans, Inter, system-ui, sans-serif);
            position: relative;
            overflow: hidden;
        }
        
        .persist-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        .persist-btn-primary {
            background: linear-gradient(135deg, #ec4899, #a855f7);
            color: #fff;
        }
        
        .persist-btn-primary:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 20px rgba(236, 72, 153, 0.4);
        }
        
        .persist-btn-secondary {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #a1a1aa;
        }
        
        .persist-btn-secondary:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
        }
        
        .persist-btn-danger {
            background: transparent;
            border: 1px solid rgba(239, 68, 68, 0.5);
            color: #ef4444;
        }
        
        .persist-btn-danger:hover:not(:disabled) {
            background: rgba(239, 68, 68, 0.1);
            border-color: #ef4444;
        }
        
        .persist-btn-success {
            background: rgba(16, 185, 129, 0.15);
            border: 1px solid rgba(16, 185, 129, 0.3);
            color: #10b981;
        }
        
        .persist-btn-small {
            padding: 6px 12px;
            font-size: 0.8125rem;
        }
        
        .persist-btn-icon {
            padding: 8px;
            border-radius: 8px;
        }
        
        /* Spinner animation */
        .persist-spinner {
            animation: persist-spin 1s linear infinite;
        }
        
        @keyframes persist-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        /* Toast notifications */
        .persist-toast-container {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 100000;
            display: flex;
            flex-direction: column;
            gap: 12px;
            pointer-events: none;
        }
        
        .persist-toast {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 20px;
            border-radius: 12px;
            background: #1a1a1a;
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #fff;
            font-size: 0.9rem;
            font-family: var(--cav-font-sans, Inter, system-ui, sans-serif);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            animation: persist-toast-in 0.3s ease;
            pointer-events: auto;
            min-width: 280px;
            max-width: 400px;
        }
        
        .persist-toast.persist-toast-out {
            animation: persist-toast-out 0.3s ease forwards;
        }
        
        @keyframes persist-toast-in {
            from {
                opacity: 0;
                transform: translateY(20px) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        
        @keyframes persist-toast-out {
            from {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
            to {
                opacity: 0;
                transform: translateY(-10px) scale(0.95);
            }
        }
        
        .persist-toast-icon {
            flex-shrink: 0;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .persist-toast-success .persist-toast-icon {
            background: rgba(16, 185, 129, 0.2);
            color: #10b981;
        }
        
        .persist-toast-error .persist-toast-icon {
            background: rgba(239, 68, 68, 0.2);
            color: #ef4444;
        }
        
        .persist-toast-info .persist-toast-icon {
            background: rgba(59, 130, 246, 0.2);
            color: #3b82f6;
        }
        
        .persist-toast-content {
            flex: 1;
        }
        
        .persist-toast-title {
            font-weight: 600;
            margin-bottom: 2px;
        }
        
        .persist-toast-message {
            font-size: 0.8rem;
            color: #a1a1aa;
        }
        
        .persist-toast-close {
            background: none;
            border: none;
            color: #71717a;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            transition: all 0.2s;
        }
        
        .persist-toast-close:hover {
            color: #fff;
            background: rgba(255, 255, 255, 0.1);
        }
        
        /* Confirm dialog */
        .persist-confirm-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(4px);
            z-index: 100001;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: persist-fade-in 0.2s ease;
        }
        
        @keyframes persist-fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .persist-confirm-dialog {
            background: #1a1a1a;
            border-radius: 16px;
            padding: 24px;
            max-width: 400px;
            width: 90%;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
            animation: persist-scale-in 0.2s ease;
        }
        
        @keyframes persist-scale-in {
            from {
                opacity: 0;
                transform: scale(0.95);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }
        
        .persist-confirm-icon {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
            background: rgba(239, 68, 68, 0.15);
            color: #ef4444;
        }
        
        .persist-confirm-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #fff;
            text-align: center;
            margin-bottom: 8px;
        }
        
        .persist-confirm-message {
            color: #a1a1aa;
            text-align: center;
            margin-bottom: 24px;
            line-height: 1.5;
        }
        
        .persist-confirm-actions {
            display: flex;
            gap: 12px;
            justify-content: center;
        }
        
        /* Sync status indicator */
        .persist-sync-status {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 500;
        }
        
        .persist-sync-status.synced {
            background: rgba(16, 185, 129, 0.1);
            color: #10b981;
        }
        
        .persist-sync-status.syncing {
            background: rgba(59, 130, 246, 0.1);
            color: #3b82f6;
        }
        
        .persist-sync-status.pending {
            background: rgba(245, 158, 11, 0.1);
            color: #f59e0b;
        }
        
        .persist-sync-status.error {
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
        }
        
        /* Action bar */
        .persist-action-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 12px 16px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 12px;
            margin-bottom: 16px;
        }
        
        .persist-action-bar-left {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .persist-action-bar-right {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        /* Unsaved changes indicator */
        .persist-unsaved-indicator {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            color: #f59e0b;
            font-size: 0.8rem;
        }
        
        .persist-unsaved-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #f59e0b;
            animation: persist-pulse 2s infinite;
        }
        
        @keyframes persist-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    `;

    // ============================================
    // PERSISTENCE MANAGER CLASS
    // ============================================
    class PersistenceUI {
        constructor() {
            this.toastContainer = null;
            this.pendingChanges = new Map();
            this.syncStatus = 'synced';
            
            this.injectStyles();
            this.createToastContainer();
            this.setupAutoSave();
            
            console.log(`[PersistenceUI] v${VERSION} initialized`);
        }

        // Inject CSS styles
        injectStyles() {
            if (document.getElementById('persist-ui-styles')) return;
            
            const style = document.createElement('style');
            style.id = 'persist-ui-styles';
            style.textContent = STYLES;
            document.head.appendChild(style);
        }

        // Create toast container
        createToastContainer() {
            if (this.toastContainer) return;
            
            this.toastContainer = document.createElement('div');
            this.toastContainer.className = 'persist-toast-container';
            document.body.appendChild(this.toastContainer);
        }

        // Setup auto-save listeners
        setupAutoSave() {
            // Listen for visibility change to save pending changes
            document.addEventListener('visibilitychange', () => {
                if (document.hidden && this.pendingChanges.size > 0) {
                    this.flushPendingChanges();
                }
            });

            // Save before unload
            window.addEventListener('beforeunload', (e) => {
                if (this.pendingChanges.size > 0) {
                    this.flushPendingChanges();
                    e.preventDefault();
                    e.returnValue = '';
                }
            });
        }

        // ============================================
        // TOAST NOTIFICATIONS
        // ============================================

        showToast(type, title, message, duration = 4000) {
            const toast = document.createElement('div');
            toast.className = `persist-toast persist-toast-${type}`;
            
            let icon = ICONS.check;
            if (type === 'error') icon = ICONS.x;
            if (type === 'info') icon = ICONS.cloud;
            
            toast.innerHTML = `
                <div class="persist-toast-icon">${icon}</div>
                <div class="persist-toast-content">
                    <div class="persist-toast-title">${title}</div>
                    ${message ? `<div class="persist-toast-message">${message}</div>` : ''}
                </div>
                <button class="persist-toast-close">${ICONS.x}</button>
            `;
            
            this.toastContainer.appendChild(toast);
            
            // Close button
            toast.querySelector('.persist-toast-close').addEventListener('click', () => {
                this.removeToast(toast);
            });
            
            // Auto remove
            if (duration > 0) {
                setTimeout(() => this.removeToast(toast), duration);
            }
            
            return toast;
        }

        removeToast(toast) {
            if (!toast || !toast.parentNode) return;
            
            toast.classList.add('persist-toast-out');
            setTimeout(() => toast.remove(), 300);
        }

        showSuccess(title, message) {
            return this.showToast('success', title, message);
        }

        showError(title, message) {
            return this.showToast('error', title, message, 6000);
        }

        showInfo(title, message) {
            return this.showToast('info', title, message);
        }

        // ============================================
        // CONFIRM DIALOG
        // ============================================

        async confirm(options = {}) {
            const {
                title = 'Confirm Delete',
                message = 'Are you sure you want to delete this item? This action cannot be undone.',
                confirmText = 'Delete',
                cancelText = 'Cancel',
                isDanger = true
            } = options;

            return new Promise((resolve) => {
                const overlay = document.createElement('div');
                overlay.className = 'persist-confirm-overlay';
                overlay.innerHTML = `
                    <div class="persist-confirm-dialog">
                        <div class="persist-confirm-icon">${ICONS.delete}</div>
                        <div class="persist-confirm-title">${title}</div>
                        <div class="persist-confirm-message">${message}</div>
                        <div class="persist-confirm-actions">
                            <button class="persist-btn persist-btn-secondary persist-cancel">${cancelText}</button>
                            <button class="persist-btn ${isDanger ? 'persist-btn-danger' : 'persist-btn-primary'} persist-confirm">${confirmText}</button>
                        </div>
                    </div>
                `;

                document.body.appendChild(overlay);

                const cleanup = (result) => {
                    overlay.remove();
                    resolve(result);
                };

                overlay.querySelector('.persist-cancel').addEventListener('click', () => cleanup(false));
                overlay.querySelector('.persist-confirm').addEventListener('click', () => cleanup(true));
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) cleanup(false);
                });

                // ESC to cancel
                const escHandler = (e) => {
                    if (e.key === 'Escape') {
                        document.removeEventListener('keydown', escHandler);
                        cleanup(false);
                    }
                };
                document.addEventListener('keydown', escHandler);
            });
        }

        // ============================================
        // BUTTON GENERATORS
        // ============================================

        createSaveButton(options = {}) {
            const {
                text = 'Save',
                size = 'normal',
                onClick = null,
                showSyncStatus = false,
                entityType = null,
                entityId = null
            } = options;

            const btn = document.createElement('button');
            btn.className = `persist-btn persist-btn-primary ${size === 'small' ? 'persist-btn-small' : ''}`;
            btn.innerHTML = `${ICONS.save} <span>${text}</span>`;

            if (onClick) {
                btn.addEventListener('click', async () => {
                    btn.disabled = true;
                    btn.innerHTML = `${ICONS.loader} <span>Saving...</span>`;
                    
                    try {
                        await onClick();
                        btn.innerHTML = `${ICONS.check} <span>Saved!</span>`;
                        btn.classList.add('persist-btn-success');
                        btn.classList.remove('persist-btn-primary');
                        
                        setTimeout(() => {
                            btn.innerHTML = `${ICONS.save} <span>${text}</span>`;
                            btn.classList.remove('persist-btn-success');
                            btn.classList.add('persist-btn-primary');
                            btn.disabled = false;
                        }, 2000);
                        
                    } catch (error) {
                        console.error('[PersistenceUI] Save error:', error);
                        btn.innerHTML = `${ICONS.x} <span>Failed</span>`;
                        btn.classList.add('persist-btn-danger');
                        btn.classList.remove('persist-btn-primary');
                        
                        this.showError('Save Failed', error.message || 'Could not save changes');
                        
                        setTimeout(() => {
                            btn.innerHTML = `${ICONS.save} <span>${text}</span>`;
                            btn.classList.remove('persist-btn-danger');
                            btn.classList.add('persist-btn-primary');
                            btn.disabled = false;
                        }, 3000);
                    }
                });
            }

            return btn;
        }

        createDeleteButton(options = {}) {
            const {
                text = 'Delete',
                size = 'normal',
                onDelete = null,
                confirmMessage = 'Are you sure you want to delete this? This action cannot be undone.',
                entityName = 'this item',
                iconOnly = false
            } = options;

            const btn = document.createElement('button');
            btn.className = `persist-btn persist-btn-danger ${size === 'small' ? 'persist-btn-small' : ''} ${iconOnly ? 'persist-btn-icon' : ''}`;
            btn.innerHTML = iconOnly ? ICONS.delete : `${ICONS.delete} <span>${text}</span>`;
            btn.title = text;

            if (onDelete) {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    
                    const confirmed = await this.confirm({
                        title: `Delete ${entityName}?`,
                        message: confirmMessage
                    });

                    if (!confirmed) return;

                    btn.disabled = true;
                    btn.innerHTML = iconOnly ? ICONS.loader : `${ICONS.loader} <span>Deleting...</span>`;
                    
                    try {
                        await onDelete();
                        this.showSuccess('Deleted', `${entityName} has been deleted`);
                        
                    } catch (error) {
                        console.error('[PersistenceUI] Delete error:', error);
                        btn.innerHTML = iconOnly ? ICONS.delete : `${ICONS.delete} <span>${text}</span>`;
                        btn.disabled = false;
                        this.showError('Delete Failed', error.message || 'Could not delete item');
                    }
                });
            }

            return btn;
        }

        createActionBar(options = {}) {
            const {
                onSave = null,
                onDelete = null,
                saveText = 'Save Changes',
                deleteText = 'Delete',
                entityName = 'item',
                showSyncStatus = true,
                extraButtons = []
            } = options;

            const bar = document.createElement('div');
            bar.className = 'persist-action-bar';

            const left = document.createElement('div');
            left.className = 'persist-action-bar-left';

            const right = document.createElement('div');
            right.className = 'persist-action-bar-right';

            // Sync status
            if (showSyncStatus) {
                const status = this.createSyncStatus();
                left.appendChild(status);
            }

            // Extra buttons
            extraButtons.forEach(btnConfig => {
                const btn = document.createElement('button');
                btn.className = 'persist-btn persist-btn-secondary persist-btn-small';
                btn.innerHTML = btnConfig.icon ? `${btnConfig.icon} <span>${btnConfig.text}</span>` : btnConfig.text;
                if (btnConfig.onClick) btn.addEventListener('click', btnConfig.onClick);
                right.appendChild(btn);
            });

            // Delete button
            if (onDelete) {
                const deleteBtn = this.createDeleteButton({
                    text: deleteText,
                    size: 'small',
                    onDelete,
                    entityName
                });
                right.appendChild(deleteBtn);
            }

            // Save button
            if (onSave) {
                const saveBtn = this.createSaveButton({
                    text: saveText,
                    size: 'small',
                    onClick: onSave
                });
                right.appendChild(saveBtn);
            }

            bar.appendChild(left);
            bar.appendChild(right);

            return bar;
        }

        createSyncStatus(initialStatus = 'synced') {
            const status = document.createElement('div');
            status.className = `persist-sync-status ${initialStatus}`;
            
            const updateStatus = (newStatus) => {
                status.className = `persist-sync-status ${newStatus}`;
                
                const texts = {
                    synced: `${ICONS.cloudCheck} Synced`,
                    syncing: `${ICONS.loader} Syncing...`,
                    pending: `${ICONS.cloud} Changes pending`,
                    error: `${ICONS.x} Sync error`
                };
                
                status.innerHTML = texts[newStatus] || texts.synced;
            };

            updateStatus(initialStatus);
            status.update = updateStatus;

            return status;
        }

        // ============================================
        // DATA PERSISTENCE
        // ============================================

        async save(entityType, data, options = {}) {
            const { showToast = true, toastMessage = null } = options;

            try {
                // Generate ID if not present
                if (!data.id) {
                    data.id = `${entityType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                }

                // Add timestamps
                data.updated_at = new Date().toISOString();
                data.created_at = data.created_at || data.updated_at;

                // Get user email
                const userEmail = this.getUserEmail();
                if (userEmail) {
                    data.user_email = userEmail;
                }

                // Save to UnifiedStorage if available
                if (window.UnifiedStorage) {
                    await window.UnifiedStorage.save(entityType, data);
                    console.log(`[PersistenceUI] Saved ${entityType}:`, data.id);
                } else {
                    // Fallback to localStorage
                    const key = `cav_${entityType}`;
                    const existing = JSON.parse(localStorage.getItem(key) || '[]');
                    const index = existing.findIndex(item => item.id === data.id);
                    
                    if (index >= 0) {
                        existing[index] = data;
                    } else {
                        existing.unshift(data);
                    }
                    
                    localStorage.setItem(key, JSON.stringify(existing.slice(0, 100)));
                }

                // Show toast
                if (showToast) {
                    this.showSuccess('Saved', toastMessage || `${this.formatEntityType(entityType)} saved successfully`);
                }

                return data;

            } catch (error) {
                console.error(`[PersistenceUI] Error saving ${entityType}:`, error);
                if (showToast) {
                    this.showError('Save Failed', error.message || 'Could not save data');
                }
                throw error;
            }
        }

        async delete(entityType, id, options = {}) {
            const { showToast = true, softDelete = true } = options;

            try {
                // Delete from UnifiedStorage if available
                if (window.UnifiedStorage) {
                    await window.UnifiedStorage.delete(entityType, id, softDelete);
                    console.log(`[PersistenceUI] Deleted ${entityType}:`, id);
                } else {
                    // Fallback to localStorage
                    const key = `cav_${entityType}`;
                    const existing = JSON.parse(localStorage.getItem(key) || '[]');
                    const filtered = existing.filter(item => item.id !== id);
                    localStorage.setItem(key, JSON.stringify(filtered));
                }

                if (showToast) {
                    this.showSuccess('Deleted', `${this.formatEntityType(entityType)} deleted`);
                }

                return true;

            } catch (error) {
                console.error(`[PersistenceUI] Error deleting ${entityType}:`, error);
                if (showToast) {
                    this.showError('Delete Failed', error.message || 'Could not delete data');
                }
                throw error;
            }
        }

        async getAll(entityType, options = {}) {
            try {
                if (window.UnifiedStorage) {
                    return await window.UnifiedStorage.getAll(entityType, options);
                } else {
                    const key = `cav_${entityType}`;
                    return JSON.parse(localStorage.getItem(key) || '[]');
                }
            } catch (error) {
                console.error(`[PersistenceUI] Error getting ${entityType}:`, error);
                return [];
            }
        }

        // ============================================
        // UTILITIES
        // ============================================

        getUserEmail() {
            try {
                const session = window.CAVSecurity?.SecureSessionManager?.getSession() ||
                               window.cavUserSession ||
                               JSON.parse(localStorage.getItem('cav_user_session') || 'null');
                return session?.email || 'anonymous';
            } catch {
                return 'anonymous';
            }
        }

        formatEntityType(type) {
            const names = {
                companies: 'Company',
                contacts: 'Contact',
                projects: 'Project',
                deals: 'Deal',
                creative_analyses: 'Analysis',
                strategies: 'Strategy',
                url_analyses: 'URL Analysis',
                swipe_files: 'Swipe File',
                benchmarks: 'Benchmark',
                competitors: 'Competitor',
                brand_profiles: 'Brand Profile',
                google_ads_builds: 'Google Ads Build',
                social_media_builds: 'Social Media Build',
                keyword_research: 'Keyword Research',
                video_analyses: 'Video Analysis',
                user_settings: 'Settings',
                api_keys: 'API Key'
            };
            return names[type] || type.replace(/_/g, ' ');
        }

        // Track pending changes
        markPendingChange(entityType, entityId) {
            this.pendingChanges.set(`${entityType}:${entityId}`, Date.now());
        }

        clearPendingChange(entityType, entityId) {
            this.pendingChanges.delete(`${entityType}:${entityId}`);
        }

        flushPendingChanges() {
            console.log(`[PersistenceUI] Flushing ${this.pendingChanges.size} pending changes`);
            // Trigger sync
            if (window.UnifiedStorage?.syncToCloud) {
                window.UnifiedStorage.syncToCloud();
            }
            this.pendingChanges.clear();
        }

        // ============================================
        // QUICK ACTIONS FOR COMMON PATTERNS
        // ============================================

        // Add save/delete buttons to an existing container
        injectActionButtons(container, options = {}) {
            const actionBar = this.createActionBar(options);
            container.insertBefore(actionBar, container.firstChild);
            return actionBar;
        }

        // Create a full CRUD interface
        createCRUDInterface(options = {}) {
            const {
                entityType,
                entityName,
                container,
                onSave,
                onDelete,
                onEdit,
                onCreate,
                fields = []
            } = options;

            // This is a simplified CRUD interface generator
            // Can be expanded based on needs
            const wrapper = document.createElement('div');
            wrapper.className = 'persist-crud-interface';

            // Action bar
            const actionBar = this.createActionBar({
                onSave,
                onDelete,
                entityName,
                extraButtons: onCreate ? [{
                    text: `Add ${entityName}`,
                    icon: ICONS.plus,
                    onClick: onCreate
                }] : []
            });

            wrapper.appendChild(actionBar);

            if (container) {
                container.appendChild(wrapper);
            }

            return wrapper;
        }
    }

    // ============================================
    // INITIALIZE AND EXPORT
    // ============================================

    const persistenceUI = new PersistenceUI();

    // Export globally
    window.PersistenceUI = persistenceUI;

    // Also export class for extension
    window.PersistenceUIClass = PersistenceUI;

    console.log(`🔒 Persistence UI v${VERSION} loaded`);
    console.log('   ✅ Save/Delete buttons');
    console.log('   ✅ Toast notifications');
    console.log('   ✅ Confirm dialogs');
    console.log('   ✅ Sync status indicators');

})();
