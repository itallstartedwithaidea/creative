/**
 * Advanced Features Toolbar
 * =========================
 * Version 2.2.0
 * 
 * Provides quick access to all advanced features:
 * - Batch Operations
 * - Folders/Collections  
 * - PDF Reports
 * - Scheduled Scans
 * - Selection Mode
 */

(function() {
    'use strict';

    const Toolbar = {
        selectedAssets: [],
        selectionMode: false,

        init() {
            this.createToolbar();
            this.bindEvents();
            console.log('📋 Advanced Toolbar initialized');
        },

        createToolbar() {
            // Remove existing toolbar if any
            const existing = document.getElementById('cav-advanced-toolbar');
            if (existing) existing.remove();

            const toolbar = document.createElement('div');
            toolbar.id = 'cav-advanced-toolbar';
            toolbar.innerHTML = `
                <div class="cav-toolbar-main">
                    <div class="cav-toolbar-left">
                        <button class="cav-toolbar-btn" id="tb-select-mode" title="Selection Mode">
                            <svg class="cav-toolbar-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="9 11 12 14 22 4"></polyline>
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                            </svg>
                            <span class="cav-toolbar-label">Select</span>
                        </button>
                        <div class="cav-toolbar-divider"></div>
                        <button class="cav-toolbar-btn" id="tb-folders" title="Folders & Collections">
                            <svg class="cav-toolbar-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                            </svg>
                            <span class="cav-toolbar-label">Folders</span>
                        </button>
                        <button class="cav-toolbar-btn" id="tb-batch" title="Batch AI Operations" disabled>
                            <svg class="cav-toolbar-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <circle cx="12" cy="12" r="4" fill="currentColor"></circle>
                                <line x1="12" y1="2" x2="12" y2="6"></line>
                                <line x1="12" y1="18" x2="12" y2="22"></line>
                                <line x1="2" y1="12" x2="6" y2="12"></line>
                                <line x1="18" y1="12" x2="22" y2="12"></line>
                            </svg>
                            <span class="cav-toolbar-label">Batch AI</span>
                        </button>
                        <div class="cav-toolbar-divider"></div>
                        <button class="cav-toolbar-btn" id="tb-report" title="Generate PDF Report">
                            <svg class="cav-toolbar-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="20" x2="18" y2="10"></line>
                                <line x1="12" y1="20" x2="12" y2="4"></line>
                                <line x1="6" y1="20" x2="6" y2="14"></line>
                            </svg>
                            <span class="cav-toolbar-label">Report</span>
                        </button>
                        <button class="cav-toolbar-btn" id="tb-schedules" title="Scheduled Scans">
                            <svg class="cav-toolbar-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            <span class="cav-toolbar-label">Schedule</span>
                        </button>
                        <button class="cav-toolbar-btn" id="tb-queue" title="Processing Queue">
                            <svg class="cav-toolbar-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="23 4 23 10 17 10"></polyline>
                                <polyline points="1 20 1 14 7 14"></polyline>
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                            </svg>
                            <span class="cav-toolbar-label">Queue</span>
                            <span class="cav-toolbar-badge" id="queue-badge" style="display:none">0</span>
                        </button>
                    </div>
                    <div class="cav-toolbar-right">
                        <div class="cav-toolbar-selection" id="selection-info" style="display:none">
                            <span id="selection-count">0 selected</span>
                            <button class="cav-toolbar-btn-sm" id="tb-clear-selection">Clear</button>
                        </div>
                    </div>
                </div>
            `;

            // Insert after header or at top of main content
            const header = document.querySelector('.cav-header');
            if (header) {
                header.after(toolbar);
            } else {
                document.body.insertBefore(toolbar, document.body.firstChild);
            }
        },

        bindEvents() {
            // Selection mode toggle
            document.getElementById('tb-select-mode')?.addEventListener('click', () => {
                this.toggleSelectionMode();
            });

            // Folders
            document.getElementById('tb-folders')?.addEventListener('click', () => {
                if (window.cavAdvanced?.FoldersCollections) {
                    window.cavAdvanced.FoldersCollections.showFolderManager();
                }
            });

            // Batch operations
            document.getElementById('tb-batch')?.addEventListener('click', () => {
                if (this.selectedAssets.length > 0 && window.cavAdvanced?.BatchOperations) {
                    window.cavAdvanced.BatchOperations.showBatchPanel(this.selectedAssets);
                }
            });

            // PDF Report
            document.getElementById('tb-report')?.addEventListener('click', () => {
                this.showReportDialog();
            });

            // Schedules
            document.getElementById('tb-schedules')?.addEventListener('click', () => {
                if (window.cavAdvanced?.ScheduledScans) {
                    window.cavAdvanced.ScheduledScans.showScheduleManager();
                }
            });

            // Queue
            document.getElementById('tb-queue')?.addEventListener('click', () => {
                if (window.cavAdvanced?.ProcessingQueue) {
                    window.cavAdvanced.ProcessingQueue.showQueueUI();
                }
            });

            // Clear selection
            document.getElementById('tb-clear-selection')?.addEventListener('click', () => {
                this.clearSelection();
            });

            // Listen for queue updates
            if (window.cavAdvanced?.ProcessingQueue) {
                window.cavAdvanced.ProcessingQueue.addListener((event, data) => {
                    this.updateQueueBadge();
                });
            }
        },

        toggleSelectionMode() {
            this.selectionMode = !this.selectionMode;
            const btn = document.getElementById('tb-select-mode');
            
            if (this.selectionMode) {
                btn.classList.add('active');
                document.body.classList.add('cav-selection-mode');
                this.enableAssetSelection();
            } else {
                btn.classList.remove('active');
                document.body.classList.remove('cav-selection-mode');
                this.disableAssetSelection();
            }
        },

        enableAssetSelection() {
            // Add selection checkboxes to all asset cards
            document.querySelectorAll('.cav-asset-card').forEach(card => {
                if (card.querySelector('.cav-asset-checkbox')) return;
                
                const checkbox = document.createElement('div');
                checkbox.className = 'cav-asset-checkbox';
                checkbox.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                card.appendChild(checkbox);

                card.addEventListener('click', this.handleAssetClick.bind(this));
            });
        },

        disableAssetSelection() {
            document.querySelectorAll('.cav-asset-checkbox').forEach(cb => cb.remove());
            document.querySelectorAll('.cav-asset-card').forEach(card => {
                card.classList.remove('selected');
                card.removeEventListener('click', this.handleAssetClick);
            });
            this.clearSelection();
        },

        handleAssetClick(e) {
            if (!this.selectionMode) return;
            e.preventDefault();
            e.stopPropagation();

            const card = e.currentTarget;
            const assetId = card.dataset.assetId;
            
            if (!assetId) return;

            const isSelected = card.classList.toggle('selected');
            
            if (isSelected) {
                // Get asset data
                const asset = this.getAssetById(assetId);
                if (asset && !this.selectedAssets.find(a => a.id === asset.id)) {
                    this.selectedAssets.push(asset);
                }
            } else {
                this.selectedAssets = this.selectedAssets.filter(a => a.id !== assetId);
            }

            this.updateSelectionUI();
        },

        getAssetById(id) {
            // Try to get from validator app
            if (window.cavValidatorApp?.assets) {
                return window.cavValidatorApp.assets.find(a => a.id === id);
            }
            // Fallback: construct from card data
            const card = document.querySelector(`.cav-asset-card[data-asset-id="${id}"]`);
            if (card) {
                return {
                    id: id,
                    filename: card.querySelector('.cav-asset-name')?.textContent || 'Unknown',
                    thumbnail_url: card.querySelector('img')?.src || '',
                };
            }
            return null;
        },

        updateSelectionUI() {
            const info = document.getElementById('selection-info');
            const count = document.getElementById('selection-count');
            const batchBtn = document.getElementById('tb-batch');

            if (this.selectedAssets.length > 0) {
                info.style.display = 'flex';
                count.textContent = `${this.selectedAssets.length} selected`;
                batchBtn.disabled = false;
            } else {
                info.style.display = 'none';
                batchBtn.disabled = true;
            }
        },

        clearSelection() {
            this.selectedAssets = [];
            document.querySelectorAll('.cav-asset-card.selected').forEach(card => {
                card.classList.remove('selected');
            });
            this.updateSelectionUI();
        },

        updateQueueBadge() {
            const badge = document.getElementById('queue-badge');
            if (!badge || !window.cavAdvanced?.ProcessingQueue) return;

            const activeJobs = window.cavAdvanced.ProcessingQueue.jobs.filter(
                j => j.status === 'processing' || j.status === 'queued'
            ).length;

            if (activeJobs > 0) {
                badge.style.display = 'inline-flex';
                badge.textContent = activeJobs;
            } else {
                badge.style.display = 'none';
            }
        },

        showReportDialog() {
            // Get all assets from validator app
            let assets = [];
            if (window.cavValidatorApp?.assets) {
                assets = window.cavValidatorApp.assets;
            }

            if (assets.length === 0) {
                alert('No assets to generate report for');
                return;
            }

            // If in selection mode and has selections, ask user
            if (this.selectionMode && this.selectedAssets.length > 0) {
                const useSelected = confirm(`Generate report for ${this.selectedAssets.length} selected assets?\n\nClick Cancel to generate for all ${assets.length} assets.`);
                if (useSelected) {
                    assets = this.selectedAssets;
                }
            }

            if (window.cavAdvanced?.PDFReports) {
                window.cavAdvanced.PDFReports.showReportOptions(assets);
            }
        },

        // Allow external access to selection
        getSelectedAssets() {
            return this.selectedAssets;
        }
    };

    // Styles for toolbar
    const toolbarStyles = `
        #cav-advanced-toolbar {
            position: sticky;
            top: 0;
            z-index: 100;
            background: var(--cav-bg-card, #1e1e1e);
            border-bottom: 1px solid var(--cav-glass-border, rgba(255, 255, 255, 0.1));
            padding: 0.75rem 1.5rem;
            display: none; /* Hide by default, show only in library */
        }

        .cav-app[data-module="library"] #cav-advanced-toolbar {
            display: block;
        }

        .cav-toolbar-main {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1400px;
            margin: 0 auto;
        }

        .cav-toolbar-left,
        .cav-toolbar-right {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .cav-toolbar-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 0.75rem;
            background: var(--cav-glass-bg, rgba(255, 255, 255, 0.05));
            border: 1px solid var(--cav-glass-border, rgba(255, 255, 255, 0.1));
            border-radius: var(--cav-radius-sm, 10px);
            color: var(--cav-text-secondary, #a3a3a3);
            cursor: pointer;
            transition: var(--cav-transition, all 0.2s ease);
            position: relative;
            font-family: var(--cav-font-sans, inherit);
            font-size: 0.85rem;
        }

        .cav-toolbar-btn:hover:not(:disabled) {
            background: var(--cav-primary-soft, rgba(225, 48, 108, 0.12));
            border-color: var(--cav-primary, #e1306c);
            color: var(--cav-text-primary, #f5f5f5);
        }

        .cav-toolbar-btn:disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }

        .cav-toolbar-btn.active {
            background: var(--cav-primary-gradient, linear-gradient(135deg, #e1306c 0%, #ff6b9d 100%));
            border-color: var(--cav-primary, #e1306c);
            color: #fff;
        }

        .cav-toolbar-icon {
            width: 18px;
            height: 18px;
            flex-shrink: 0;
        }

        .cav-toolbar-label {
            font-size: 0.85rem;
            font-weight: 500;
        }

        .cav-toolbar-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            min-width: 18px;
            height: 18px;
            background: var(--cav-error, #ef4444);
            color: #fff;
            font-size: 0.7rem;
            font-weight: 600;
            border-radius: 9px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0 4px;
        }

        .cav-toolbar-divider {
            width: 1px;
            height: 24px;
            background: var(--cav-glass-border, rgba(255, 255, 255, 0.1));
            margin: 0 0.5rem;
        }

        .cav-toolbar-selection {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.5rem 1rem;
            background: var(--cav-primary-soft, rgba(225, 48, 108, 0.12));
            border-radius: var(--cav-radius-sm, 10px);
        }

        #selection-count {
            color: var(--cav-primary-light, #f06292);
            font-weight: 600;
        }

        .cav-toolbar-btn-sm {
            padding: 0.25rem 0.5rem;
            background: var(--cav-glass-bg, rgba(255, 255, 255, 0.1));
            border: none;
            border-radius: var(--cav-radius-xs, 6px);
            color: #fff;
            font-size: 0.75rem;
            cursor: pointer;
            transition: var(--cav-transition-fast, all 0.15s ease);
        }

        .cav-toolbar-btn-sm:hover {
            background: var(--cav-primary, #e1306c);
        }

        /* Selection Mode Styles */
        .cav-selection-mode .cav-asset-card {
            cursor: pointer;
        }

        .cav-asset-checkbox {
            position: absolute;
            top: 8px;
            left: 8px;
            width: 24px;
            height: 24px;
            background: rgba(0, 0, 0, 0.6);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: var(--cav-radius-xs, 6px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
            transition: var(--cav-transition-fast, all 0.15s ease);
        }

        .cav-asset-checkbox svg {
            opacity: 0;
            transition: opacity 0.15s ease;
        }

        .cav-asset-card.selected .cav-asset-checkbox {
            background: var(--cav-primary, #e1306c);
            border-color: var(--cav-primary, #e1306c);
        }

        .cav-asset-card.selected .cav-asset-checkbox svg {
            opacity: 1;
            color: #fff;
        }

        .cav-asset-card.selected {
            outline: 3px solid var(--cav-primary, #e1306c);
            outline-offset: -3px;
        }

        /* Ensure asset cards have relative positioning for checkbox */
        .cav-selection-mode .cav-asset-card {
            position: relative;
        }

        @media (max-width: 768px) {
            .cav-toolbar-label {
                display: none;
            }
            
            .cav-toolbar-btn {
                padding: 0.5rem;
            }

            #cav-advanced-toolbar {
                padding: 0.5rem;
            }
        }
    `;

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = toolbarStyles;
    document.head.appendChild(styleSheet);

    // Initialize when DOM is ready and advanced features are loaded
    function initToolbar() {
        // Wait for advanced features to be available
        if (!window.cavAdvanced) {
            setTimeout(initToolbar, 100);
            return;
        }
        Toolbar.init();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initToolbar);
    } else {
        initToolbar();
    }

    // Export
    window.cavToolbar = Toolbar;

})();


