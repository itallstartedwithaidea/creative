/**
 * Advanced Features Module
 * ========================
 * Version 2.2.0
 * 
 * Features:
 * 1. Processing Queue - Track AI jobs in progress
 * 2. Batch AI Operations - Apply AI to multiple assets
 * 3. Comparison View - Side-by-side original vs modified
 * 4. Folders/Collections - Organize assets into groups
 * 5. Download Derivatives - Export AI-created versions
 * 6. Asset Versioning - Track version history
 * 7. PDF Reports - Export validation reports
 * 8. True Pagination - Page numbers
 * 9. Scheduled Scans - Auto-scan integrations
 * 10. Undo/Revert - Revert to previous versions
 */

(function() {
    'use strict';

    // ============================================
    // 1. PROCESSING QUEUE
    // ============================================
    const ProcessingQueue = {
        jobs: [],
        maxConcurrent: 3,
        activeJobs: 0,
        listeners: [],

        addJob(job) {
            const newJob = {
                id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: job.type, // 'animate', 'outpaint', 'extract-still', 'analysis'
                assetId: job.assetId,
                assetName: job.assetName,
                status: 'queued', // queued, processing, completed, failed
                progress: 0,
                result: null,
                error: null,
                createdAt: new Date().toISOString(),
                startedAt: null,
                completedAt: null,
                ...job
            };
            
            this.jobs.unshift(newJob);
            this.saveJobs();
            this.notifyListeners('job_added', newJob);
            this.processNext();
            this.showQueueUI();
            
            return newJob.id;
        },

        async processNext() {
            if (this.activeJobs >= this.maxConcurrent) return;
            
            const nextJob = this.jobs.find(j => j.status === 'queued');
            if (!nextJob) return;

            this.activeJobs++;
            nextJob.status = 'processing';
            nextJob.startedAt = new Date().toISOString();
            this.notifyListeners('job_started', nextJob);
            this.updateQueueUI();

            try {
                // Simulate progress updates
                const progressInterval = setInterval(() => {
                    if (nextJob.progress < 90) {
                        nextJob.progress += Math.random() * 15;
                        this.updateQueueUI();
                    }
                }, 500);

                // Execute the job based on type
                let result;
                switch (nextJob.type) {
                    case 'animate':
                        result = await this.executeAnimateJob(nextJob);
                        break;
                    case 'outpaint':
                        result = await this.executeOutpaintJob(nextJob);
                        break;
                    case 'extract-still':
                        result = await this.executeExtractStillJob(nextJob);
                        break;
                    case 'analysis':
                        result = await this.executeAnalysisJob(nextJob);
                        break;
                    default:
                        result = { success: true };
                }

                clearInterval(progressInterval);
                nextJob.progress = 100;
                nextJob.status = 'completed';
                nextJob.result = result;
                nextJob.completedAt = new Date().toISOString();
                this.notifyListeners('job_completed', nextJob);

            } catch (error) {
                nextJob.status = 'failed';
                nextJob.error = error.message;
                nextJob.completedAt = new Date().toISOString();
                this.notifyListeners('job_failed', nextJob);
            }

            this.activeJobs--;
            this.saveJobs();
            this.updateQueueUI();
            this.processNext();
        },

        async executeAnimateJob(job) {
            if (window.cavAIStudio && window.cavAIStudio.hasApiKey()) {
                return await window.cavAIStudio.generateVideo(
                    job.imageData,
                    job.prompt || 'Animate this image with natural motion',
                    { duration: job.duration || 6, motionStyle: job.motionStyle || 'auto' }
                );
            }
            throw new Error('AI Studio not configured');
        },

        async executeOutpaintJob(job) {
            if (window.cavAIStudio && window.cavAIStudio.hasApiKey()) {
                return await window.cavAIStudio.outpaintImage(
                    job.imageData,
                    job.targetAspectRatio,
                    job.prompt
                );
            }
            throw new Error('AI Studio not configured');
        },

        async executeExtractStillJob(job) {
            // Extract frame from video
            return new Promise((resolve, reject) => {
                const video = document.createElement('video');
                video.crossOrigin = 'anonymous';
                video.src = job.videoData;
                
                video.onloadedmetadata = () => {
                    video.currentTime = job.timestamp || video.duration / 2;
                };
                
                video.onseeked = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(video, 0, 0);
                    resolve({ dataUrl: canvas.toDataURL('image/jpeg', 0.9) });
                };
                
                video.onerror = () => reject(new Error('Failed to load video'));
            });
        },

        async executeAnalysisJob(job) {
            if (window.cavAIStudio && window.cavAIStudio.hasApiKey()) {
                return await window.cavAIStudio.generateImage(job.prompt);
            }
            throw new Error('AI Studio not configured');
        },

        getJobs(filter = {}) {
            let filtered = [...this.jobs];
            if (filter.status) {
                filtered = filtered.filter(j => j.status === filter.status);
            }
            if (filter.type) {
                filtered = filtered.filter(j => j.type === filter.type);
            }
            return filtered;
        },

        clearCompleted() {
            this.jobs = this.jobs.filter(j => j.status !== 'completed' && j.status !== 'failed');
            this.saveJobs();
            this.updateQueueUI();
        },

        saveJobs() {
            try {
                // Only save last 50 jobs
                const toSave = this.jobs.slice(0, 50);
                localStorage.setItem('cav_processing_queue', JSON.stringify(toSave));
            } catch (e) {
                console.warn('Failed to save queue:', e);
            }
        },

        loadJobs() {
            try {
                const saved = localStorage.getItem('cav_processing_queue');
                if (saved) {
                    this.jobs = JSON.parse(saved);
                    // Reset any stuck jobs
                    this.jobs.forEach(j => {
                        if (j.status === 'processing') {
                            j.status = 'queued';
                            j.progress = 0;
                        }
                    });
                }
            } catch (e) {
                console.warn('Failed to load queue:', e);
            }
        },

        addListener(callback) {
            this.listeners.push(callback);
        },

        notifyListeners(event, data) {
            this.listeners.forEach(cb => cb(event, data));
        },

        showQueueUI() {
            if (document.getElementById('cav-queue-panel')) return;
            
            const panel = document.createElement('div');
            panel.id = 'cav-queue-panel';
            panel.innerHTML = `
                <div class="cav-queue-header">
                    <span>🔄 Processing Queue</span>
                    <div class="cav-queue-actions">
                        <button class="cav-queue-clear" title="Clear completed">🗑️</button>
                        <button class="cav-queue-minimize" title="Minimize">−</button>
                        <button class="cav-queue-close" title="Close">✕</button>
                    </div>
                </div>
                <div class="cav-queue-body"></div>
            `;
            document.body.appendChild(panel);

            panel.querySelector('.cav-queue-close').onclick = () => panel.remove();
            panel.querySelector('.cav-queue-minimize').onclick = () => {
                panel.classList.toggle('minimized');
            };
            panel.querySelector('.cav-queue-clear').onclick = () => this.clearCompleted();

            this.updateQueueUI();
        },

        updateQueueUI() {
            const panel = document.getElementById('cav-queue-panel');
            if (!panel) return;

            const body = panel.querySelector('.cav-queue-body');
            const activeJobs = this.jobs.filter(j => j.status === 'processing' || j.status === 'queued');
            const recentJobs = this.jobs.slice(0, 10);

            if (recentJobs.length === 0) {
                body.innerHTML = '<div class="cav-queue-empty">No jobs in queue</div>';
                return;
            }

            body.innerHTML = recentJobs.map(job => `
                <div class="cav-queue-job ${job.status}">
                    <div class="cav-queue-job-icon">${this.getJobIcon(job.type)}</div>
                    <div class="cav-queue-job-info">
                        <div class="cav-queue-job-name">${job.assetName || 'Asset'}</div>
                        <div class="cav-queue-job-type">${job.type}</div>
                    </div>
                    <div class="cav-queue-job-status">
                        ${job.status === 'processing' ? `
                            <div class="cav-queue-progress">
                                <div class="cav-queue-progress-bar" style="width: ${job.progress}%"></div>
                            </div>
                            <span>${Math.round(job.progress)}%</span>
                        ` : job.status === 'completed' ? '✅' : job.status === 'failed' ? '❌' : '⏳'}
                    </div>
                </div>
            `).join('');
        },

        getJobIcon(type) {
            switch (type) {
                case 'animate': return '🎬';
                case 'outpaint': return '🔧';
                case 'extract-still': return '📸';
                case 'analysis': return '🤖';
                default: return '⚙️';
            }
        }
    };

    // ============================================
    // 2. BATCH AI OPERATIONS
    // ============================================
    const BatchOperations = {
        showBatchPanel(selectedAssets) {
            if (selectedAssets.length === 0) {
                alert('Please select assets first');
                return;
            }

            const modal = document.createElement('div');
            modal.className = 'cav-batch-modal-overlay';
            modal.innerHTML = `
                <div class="cav-batch-modal">
                    <div class="cav-batch-header">
                        <h3><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--cav-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 8px;"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4" fill="currentColor"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>Batch AI Operations</h3>
                        <button class="cav-batch-close">✕</button>
                    </div>
                    <div class="cav-batch-body">
                        <div class="cav-batch-selection">
                            <span class="cav-batch-count">${selectedAssets.length} assets selected</span>
                        </div>
                        
                        <div class="cav-batch-operations">
                            <h4>Choose Operation</h4>
                            
                            <div class="cav-batch-op" data-op="animate">
                                <div class="cav-batch-op-icon">🎬</div>
                                <div class="cav-batch-op-info">
                                    <strong>Animate All</strong>
                                    <span>Create animated videos from all selected images</span>
                                </div>
                            </div>
                            
                            <div class="cav-batch-op" data-op="fix-aspect">
                                <div class="cav-batch-op-icon">🔧</div>
                                <div class="cav-batch-op-info">
                                    <strong>AI Fix Aspect Ratios</strong>
                                    <span>Resize all to fit specific channel requirements</span>
                                </div>
                            </div>
                            
                            <div class="cav-batch-op" data-op="extract-stills">
                                <div class="cav-batch-op-icon">📸</div>
                                <div class="cav-batch-op-info">
                                    <strong>Extract Stills</strong>
                                    <span>Extract best frames from all selected videos</span>
                                </div>
                            </div>
                            
                            <div class="cav-batch-op" data-op="analyze">
                                <div class="cav-batch-op-icon">🤖</div>
                                <div class="cav-batch-op-info">
                                    <strong>AI Analysis</strong>
                                    <span>Get AI recommendations for all assets</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="cav-batch-options" style="display: none;">
                            <!-- Dynamic options based on operation -->
                        </div>
                    </div>
                    <div class="cav-batch-footer">
                        <button class="cav-batch-cancel">Cancel</button>
                        <button class="cav-batch-start" disabled>Start Batch (0)</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            let selectedOp = null;

            // Event handlers
            modal.querySelector('.cav-batch-close').onclick = () => modal.remove();
            modal.querySelector('.cav-batch-cancel').onclick = () => modal.remove();

            modal.querySelectorAll('.cav-batch-op').forEach(op => {
                op.onclick = () => {
                    modal.querySelectorAll('.cav-batch-op').forEach(o => o.classList.remove('selected'));
                    op.classList.add('selected');
                    selectedOp = op.dataset.op;
                    modal.querySelector('.cav-batch-start').disabled = false;
                    modal.querySelector('.cav-batch-start').textContent = `Start Batch (${selectedAssets.length})`;
                    this.showOptionsForOp(modal, selectedOp);
                };
            });

            modal.querySelector('.cav-batch-start').onclick = () => {
                this.executeBatch(selectedAssets, selectedOp, modal);
            };
        },

        showOptionsForOp(modal, op) {
            const optionsDiv = modal.querySelector('.cav-batch-options');
            optionsDiv.style.display = 'block';

            switch (op) {
                case 'animate':
                    optionsDiv.innerHTML = `
                        <h4>Animation Settings</h4>
                        <div class="cav-batch-option">
                            <label>Duration</label>
                            <select id="batch-duration">
                                <option value="4">4 seconds</option>
                                <option value="6" selected>6 seconds</option>
                                <option value="8">8 seconds</option>
                                <option value="10">10 seconds</option>
                            </select>
                        </div>
                        <div class="cav-batch-option">
                            <label>Motion Style</label>
                            <select id="batch-motion">
                                <option value="auto">Auto (AI decides)</option>
                                <option value="zoom">Slow Zoom</option>
                                <option value="pan">Pan/Slide</option>
                                <option value="parallax">Parallax</option>
                            </select>
                        </div>
                    `;
                    break;
                case 'fix-aspect':
                    optionsDiv.innerHTML = `
                        <h4>Target Aspect Ratio</h4>
                        <div class="cav-batch-option">
                            <label>Channel</label>
                            <select id="batch-channel">
                                <option value="16:9">YouTube (16:9)</option>
                                <option value="9:16">TikTok/Reels (9:16)</option>
                                <option value="1:1">Instagram Square (1:1)</option>
                                <option value="4:5">Instagram Portrait (4:5)</option>
                                <option value="1.91:1">Meta Feed (1.91:1)</option>
                            </select>
                        </div>
                    `;
                    break;
                default:
                    optionsDiv.innerHTML = '';
                    optionsDiv.style.display = 'none';
            }
        },

        async executeBatch(assets, operation, modal) {
            modal.querySelector('.cav-batch-start').disabled = true;
            modal.querySelector('.cav-batch-start').innerHTML = '<span class="cav-spinner"></span> Processing...';

            const options = this.getOptionsFromModal(modal, operation);

            for (const asset of assets) {
                const job = {
                    type: operation === 'fix-aspect' ? 'outpaint' : operation === 'extract-stills' ? 'extract-still' : operation,
                    assetId: asset.id,
                    assetName: asset.filename,
                    imageData: asset.thumbnail_url || asset.dataUrl,
                    videoData: asset.file_url || asset.dataUrl,
                    ...options
                };
                ProcessingQueue.addJob(job);
            }

            modal.remove();
            
            // Show notification
            this.showNotification(`Added ${assets.length} jobs to processing queue`);
        },

        getOptionsFromModal(modal, operation) {
            const options = {};
            
            if (operation === 'animate') {
                options.duration = parseInt(modal.querySelector('#batch-duration')?.value || '6');
                options.motionStyle = modal.querySelector('#batch-motion')?.value || 'auto';
            } else if (operation === 'fix-aspect') {
                options.targetAspectRatio = modal.querySelector('#batch-channel')?.value || '16:9';
            }
            
            return options;
        },

        showNotification(message) {
            const notif = document.createElement('div');
            notif.className = 'cav-batch-notification';
            notif.innerHTML = `<span>✅</span> ${message}`;
            document.body.appendChild(notif);
            
            setTimeout(() => {
                notif.classList.add('fade-out');
                setTimeout(() => notif.remove(), 300);
            }, 3000);
        }
    };

    // ============================================
    // 3. COMPARISON VIEW
    // ============================================
    const ComparisonView = {
        open(originalAsset, derivativeAsset) {
            const modal = document.createElement('div');
            modal.className = 'cav-comparison-overlay';
            modal.innerHTML = `
                <div class="cav-comparison-modal">
                    <div class="cav-comparison-header">
                        <h3>🔍 Compare: Original vs AI Modified</h3>
                        <button class="cav-comparison-close">✕</button>
                    </div>
                    <div class="cav-comparison-body">
                        <div class="cav-comparison-pane original">
                            <div class="cav-comparison-label">Original</div>
                            <div class="cav-comparison-image">
                                <img src="${originalAsset.thumbnail_url || originalAsset.dataUrl}" alt="Original">
                            </div>
                            <div class="cav-comparison-info">
                                <p><strong>${originalAsset.filename}</strong></p>
                                <p>${originalAsset.width}×${originalAsset.height}</p>
                            </div>
                        </div>
                        <div class="cav-comparison-divider">
                            <div class="cav-comparison-slider-handle" id="comparison-slider"></div>
                        </div>
                        <div class="cav-comparison-pane modified">
                            <div class="cav-comparison-label">AI Modified</div>
                            <div class="cav-comparison-image">
                                <img src="${derivativeAsset.thumbnail_url || derivativeAsset.dataUrl}" alt="Modified">
                            </div>
                            <div class="cav-comparison-info">
                                <p><strong>${derivativeAsset.filename}</strong></p>
                                <p>${derivativeAsset.width}×${derivativeAsset.height}</p>
                                <p class="cav-comparison-badge">🤖 ${derivativeAsset.createdBy || 'AI Generated'}</p>
                            </div>
                        </div>
                    </div>
                    <div class="cav-comparison-footer">
                        <button class="cav-comparison-download-orig">Download Original</button>
                        <button class="cav-comparison-download-mod">Download Modified</button>
                        <button class="cav-comparison-use-mod">Use Modified</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            modal.querySelector('.cav-comparison-close').onclick = () => modal.remove();
            modal.querySelector('.cav-comparison-download-orig').onclick = () => {
                this.downloadAsset(originalAsset);
            };
            modal.querySelector('.cav-comparison-download-mod').onclick = () => {
                this.downloadAsset(derivativeAsset);
            };

            // Slider functionality for overlay comparison
            this.initSlider(modal);
        },

        initSlider(modal) {
            // Could implement a fancy overlay slider here
        },

        downloadAsset(asset) {
            const link = document.createElement('a');
            link.href = asset.thumbnail_url || asset.dataUrl || asset.file_url;
            link.download = asset.filename;
            link.click();
        }
    };

    // ============================================
    // 4. FOLDERS/COLLECTIONS
    // ============================================
    const FoldersCollections = {
        folders: [],
        STORAGE_KEY: 'cav_folders',

        init() {
            this.loadFolders();
        },

        loadFolders() {
            try {
                const saved = localStorage.getItem(this.STORAGE_KEY);
                this.folders = saved ? JSON.parse(saved) : [];
            } catch (e) {
                this.folders = [];
            }
        },

        saveFolders() {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.folders));
        },

        createFolder(name, color = '#8b5cf6') {
            const folder = {
                id: `folder_${Date.now()}`,
                name,
                color,
                assetIds: [],
                createdAt: new Date().toISOString(),
            };
            this.folders.push(folder);
            this.saveFolders();
            return folder;
        },

        deleteFolder(folderId) {
            this.folders = this.folders.filter(f => f.id !== folderId);
            this.saveFolders();
        },

        renameFolder(folderId, newName) {
            const folder = this.folders.find(f => f.id === folderId);
            if (folder) {
                folder.name = newName;
                this.saveFolders();
            }
        },

        addAssetToFolder(folderId, assetId) {
            const folder = this.folders.find(f => f.id === folderId);
            if (folder && !folder.assetIds.includes(assetId)) {
                folder.assetIds.push(assetId);
                this.saveFolders();
            }
        },

        removeAssetFromFolder(folderId, assetId) {
            const folder = this.folders.find(f => f.id === folderId);
            if (folder) {
                folder.assetIds = folder.assetIds.filter(id => id !== assetId);
                this.saveFolders();
            }
        },

        getAssetFolders(assetId) {
            return this.folders.filter(f => f.assetIds.includes(assetId));
        },

        showFolderManager() {
            const self = this; // Preserve context
            
            // Remove any existing modal
            const existingModal = document.querySelector('.cav-folders-overlay');
            if (existingModal) existingModal.remove();
            
            const modal = document.createElement('div');
            modal.className = 'cav-folders-overlay';
            modal.innerHTML = `
                <div class="cav-folders-modal">
                    <div class="cav-folders-header">
                        <h3><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--cav-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 8px;"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>Folders & Collections</h3>
                        <button class="cav-folders-close">✕</button>
                    </div>
                    <div class="cav-folders-body">
                        <div class="cav-folders-create">
                            <input type="text" id="new-folder-name" placeholder="New folder name..." autocomplete="off">
                            <input type="color" id="new-folder-color" value="#8b5cf6">
                            <button type="button" id="create-folder-btn">+ Create</button>
                        </div>
                        <div class="cav-folders-list" id="folders-list"></div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                self.renderFoldersList(modal);
                
                // Close button
                const closeBtn = modal.querySelector('.cav-folders-close');
                if (closeBtn) {
                    closeBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        modal.remove();
                    });
                }
                
                // Create folder button
                const createBtn = modal.querySelector('#create-folder-btn');
                const nameInput = modal.querySelector('#new-folder-name');
                const colorInput = modal.querySelector('#new-folder-color');
                
                if (createBtn && nameInput && colorInput) {
                    createBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        const name = nameInput.value.trim();
                        const color = colorInput.value;
                        
                        console.log('[Folders] Creating folder:', name, color);
                        
                        if (name) {
                            self.createFolder(name, color);
                            self.renderFoldersList(modal);
                            nameInput.value = '';
                            nameInput.focus();
                        } else {
                            nameInput.placeholder = 'Enter a name...';
                            nameInput.focus();
                        }
                    });
                    
                    // Also handle Enter key
                    nameInput.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            createBtn.click();
                        }
                    });
                }
                
                // Click outside to close
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.remove();
                    }
                });
            }, 50);
        },

        renderFoldersList(modal) {
            const list = modal.querySelector('#folders-list');
            if (this.folders.length === 0) {
                list.innerHTML = '<div class="cav-folders-empty">No folders yet. Create one above!</div>';
                return;
            }

            list.innerHTML = this.folders.map(folder => `
                <div class="cav-folder-item" data-id="${folder.id}">
                    <div class="cav-folder-color" style="background: ${folder.color || '#8b5cf6'}"></div>
                    <div class="cav-folder-info">
                        <strong>${folder.name}</strong>
                        <span>${(folder.assetIds || []).length} assets</span>
                    </div>
                    <div class="cav-folder-actions">
                        <button class="cav-folder-view" title="View">👁️</button>
                        <button class="cav-folder-delete" title="Delete">🗑️</button>
                    </div>
                </div>
            `).join('');

            // Add event listeners
            list.querySelectorAll('.cav-folder-delete').forEach(btn => {
                btn.onclick = (e) => {
                    const folderId = e.target.closest('.cav-folder-item').dataset.id;
                    if (confirm('Delete this folder?')) {
                        this.deleteFolder(folderId);
                        this.renderFoldersList(modal);
                    }
                };
            });
        }
    };

    // ============================================
    // 5. DOWNLOAD DERIVATIVES
    // ============================================
    const DownloadManager = {
        downloadAsset(asset) {
            const link = document.createElement('a');
            link.href = asset.file_url || asset.thumbnail_url || asset.dataUrl;
            link.download = asset.filename || 'asset';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },

        downloadMultiple(assets) {
            // Download each with a small delay
            assets.forEach((asset, index) => {
                setTimeout(() => {
                    this.downloadAsset(asset);
                }, index * 500);
            });
        },

        async downloadAsZip(assets, zipName = 'assets.zip') {
            // Note: Requires JSZip library for actual implementation
            alert(`Downloading ${assets.length} assets as ${zipName}...\n(ZIP functionality requires JSZip library)`);
        }
    };

    // ============================================
    // 6. ASSET VERSIONING
    // ============================================
    const VersionHistory = {
        STORAGE_KEY: 'cav_versions',
        versions: {},

        init() {
            this.loadVersions();
        },

        loadVersions() {
            try {
                const saved = localStorage.getItem(this.STORAGE_KEY);
                this.versions = saved ? JSON.parse(saved) : {};
            } catch (e) {
                this.versions = {};
            }
        },

        saveVersions() {
            try {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.versions));
            } catch (e) {
                console.warn('Failed to save versions:', e);
            }
        },

        addVersion(assetId, versionData) {
            if (!this.versions[assetId]) {
                this.versions[assetId] = [];
            }
            
            const version = {
                id: `v_${Date.now()}`,
                version: this.versions[assetId].length + 1,
                data: versionData,
                createdAt: new Date().toISOString(),
                note: versionData.note || ''
            };
            
            this.versions[assetId].push(version);
            this.saveVersions();
            return version;
        },

        getVersions(assetId) {
            return this.versions[assetId] || [];
        },

        revertToVersion(assetId, versionId) {
            const versions = this.versions[assetId];
            if (!versions) return null;
            
            const version = versions.find(v => v.id === versionId);
            return version ? version.data : null;
        },

        showVersionHistory(asset) {
            const versions = this.getVersions(asset.id);
            
            const modal = document.createElement('div');
            modal.className = 'cav-versions-overlay';
            modal.innerHTML = `
                <div class="cav-versions-modal">
                    <div class="cav-versions-header">
                        <h3>📚 Version History: ${asset.filename}</h3>
                        <button class="cav-versions-close">✕</button>
                    </div>
                    <div class="cav-versions-body">
                        ${versions.length === 0 ? `
                            <div class="cav-versions-empty">No version history available</div>
                        ` : versions.map(v => `
                            <div class="cav-version-item" data-id="${v.id}">
                                <div class="cav-version-number">v${v.version}</div>
                                <div class="cav-version-info">
                                    <span class="cav-version-date">${new Date(v.createdAt).toLocaleString()}</span>
                                    ${v.note ? `<span class="cav-version-note">${v.note}</span>` : ''}
                                </div>
                                <button class="cav-version-revert">Revert</button>
                            </div>
                        `).reverse().join('')}
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            modal.querySelector('.cav-versions-close').onclick = () => modal.remove();
        }
    };

    // ============================================
    // 7. PDF REPORTS
    // ============================================
    const PDFReports = {
        async generateReport(assets, options = {}) {
            const reportTitle = options.title || 'Creative Asset Validation Report';
            const includeImages = options.includeImages !== false;
            
            // Create HTML report (can be printed to PDF)
            const report = document.createElement('div');
            report.className = 'cav-pdf-report';
            report.innerHTML = `
                <style>
                    @media print {
                        .cav-pdf-report { padding: 20px; }
                        .cav-report-header { text-align: center; margin-bottom: 30px; }
                        .cav-report-asset { page-break-inside: avoid; margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; }
                        .cav-report-thumb { max-width: 200px; max-height: 150px; }
                        .cav-compatible { color: green; }
                        .cav-incompatible { color: red; }
                    }
                </style>
                <div class="cav-report-header">
                    <h1>${reportTitle}</h1>
                    <p>Generated: ${new Date().toLocaleString()}</p>
                    <p>Total Assets: ${assets.length}</p>
                </div>
                <div class="cav-report-summary">
                    <h2>Summary</h2>
                    <p>✅ Compatible: ${assets.filter(a => !a.validation?.isOffSize).length}</p>
                    <p>⚠️ Off-Size: ${assets.filter(a => a.validation?.isOffSize).length}</p>
                </div>
                <div class="cav-report-assets">
                    <h2>Asset Details</h2>
                    ${assets.map(asset => `
                        <div class="cav-report-asset">
                            ${includeImages ? `<img class="cav-report-thumb" src="${asset.thumbnail_url || ''}" alt="${asset.filename}">` : ''}
                            <h3>${asset.filename}</h3>
                            <p><strong>Dimensions:</strong> ${asset.width}×${asset.height}</p>
                            <p><strong>Aspect Ratio:</strong> ${asset.validation?.aspectRatio || 'N/A'}</p>
                            <p><strong>Status:</strong> ${asset.validation?.isOffSize ? '<span class="cav-incompatible">Off-Size</span>' : '<span class="cav-compatible">Compatible</span>'}</p>
                            ${asset.validation?.compatible?.length > 0 ? `
                                <p><strong>Compatible Channels:</strong> ${asset.validation.compatible.join(', ')}</p>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            `;

            // Open print dialog
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head><title>${reportTitle}</title></head>
                <body>${report.innerHTML}</body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        },

        showReportOptions(assets) {
            const modal = document.createElement('div');
            modal.className = 'cav-report-overlay';
            modal.innerHTML = `
                <div class="cav-report-modal">
                    <div class="cav-report-header">
                        <h3>📊 Generate PDF Report</h3>
                        <button class="cav-report-close">✕</button>
                    </div>
                    <div class="cav-report-body">
                        <div class="cav-report-option">
                            <label>Report Title</label>
                            <input type="text" id="report-title" value="Creative Asset Validation Report">
                        </div>
                        <div class="cav-report-option">
                            <label>
                                <input type="checkbox" id="report-images" checked>
                                Include thumbnails
                            </label>
                        </div>
                        <div class="cav-report-preview">
                            <p>${assets.length} assets will be included</p>
                        </div>
                    </div>
                    <div class="cav-report-footer">
                        <button class="cav-report-cancel">Cancel</button>
                        <button class="cav-report-generate">📄 Generate PDF</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            modal.querySelector('.cav-report-close').onclick = () => modal.remove();
            modal.querySelector('.cav-report-cancel').onclick = () => modal.remove();
            modal.querySelector('.cav-report-generate').onclick = () => {
                const title = modal.querySelector('#report-title').value;
                const includeImages = modal.querySelector('#report-images').checked;
                modal.remove();
                this.generateReport(assets, { title, includeImages });
            };
        }
    };

    // ============================================
    // 8. TRUE PAGINATION
    // ============================================
    const TruePagination = {
        currentPage: 1,
        itemsPerPage: 12,
        totalItems: 0,
        initialized: false,

        init(totalItems) {
            this.totalItems = totalItems;
            // Only reset to page 1 if this is a new initialization (different total)
            // or if current page is beyond total pages
            const totalPages = this.getTotalPages();
            if (!this.initialized || this.currentPage > totalPages) {
                this.currentPage = 1;
            }
            this.initialized = true;
        },
        
        reset() {
            this.currentPage = 1;
            this.initialized = false;
        },

        getTotalPages() {
            return Math.ceil(this.totalItems / this.itemsPerPage);
        },

        getPageItems(items) {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return items.slice(start, end);
        },

        goToPage(page) {
            const totalPages = this.getTotalPages();
            if (page >= 1 && page <= totalPages) {
                this.currentPage = page;
                return true;
            }
            return false;
        },

        nextPage() {
            return this.goToPage(this.currentPage + 1);
        },

        prevPage() {
            return this.goToPage(this.currentPage - 1);
        },

        renderPaginationUI() {
            const totalPages = this.getTotalPages();
            if (totalPages <= 1) return '';

            let pages = [];
            const maxVisible = 5;
            let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
            let endPage = Math.min(totalPages, startPage + maxVisible - 1);
            
            if (endPage - startPage < maxVisible - 1) {
                startPage = Math.max(1, endPage - maxVisible + 1);
            }

            // First page
            if (startPage > 1) {
                pages.push(`<button class="cav-page-btn" data-page="1">1</button>`);
                if (startPage > 2) {
                    pages.push(`<span class="cav-page-ellipsis">...</span>`);
                }
            }

            // Page numbers
            for (let i = startPage; i <= endPage; i++) {
                pages.push(`<button class="cav-page-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`);
            }

            // Last page
            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    pages.push(`<span class="cav-page-ellipsis">...</span>`);
                }
                pages.push(`<button class="cav-page-btn" data-page="${totalPages}">${totalPages}</button>`);
            }

            return `
                <div class="cav-pagination">
                    <button class="cav-page-nav" data-action="prev" ${this.currentPage === 1 ? 'disabled' : ''}>← Prev</button>
                    <div class="cav-page-numbers">
                        ${pages.join('')}
                    </div>
                    <button class="cav-page-nav" data-action="next" ${this.currentPage === totalPages ? 'disabled' : ''}>Next →</button>
                    <span class="cav-page-info">Page ${this.currentPage} of ${totalPages}</span>
                </div>
            `;
        }
    };

    // ============================================
    // 9. SCHEDULED SCANS
    // ============================================
    const ScheduledScans = {
        schedules: [],
        STORAGE_KEY: 'cav_schedules',
        timers: {},

        init() {
            this.loadSchedules();
            this.startSchedules();
        },

        loadSchedules() {
            try {
                const saved = localStorage.getItem(this.STORAGE_KEY);
                this.schedules = saved ? JSON.parse(saved) : [];
            } catch (e) {
                this.schedules = [];
            }
        },

        saveSchedules() {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.schedules));
        },

        createSchedule(options) {
            const schedule = {
                id: `sched_${Date.now()}`,
                name: options.name,
                integration: options.integration, // 'google-drive', 'dropbox', etc.
                interval: options.interval, // in minutes
                enabled: true,
                lastRun: null,
                nextRun: new Date(Date.now() + options.interval * 60000).toISOString(),
                createdAt: new Date().toISOString(),
            };
            
            this.schedules.push(schedule);
            this.saveSchedules();
            this.startSchedule(schedule);
            return schedule;
        },

        deleteSchedule(scheduleId) {
            if (this.timers[scheduleId]) {
                clearInterval(this.timers[scheduleId]);
                delete this.timers[scheduleId];
            }
            this.schedules = this.schedules.filter(s => s.id !== scheduleId);
            this.saveSchedules();
        },

        startSchedules() {
            this.schedules.filter(s => s.enabled).forEach(s => this.startSchedule(s));
        },

        startSchedule(schedule) {
            if (this.timers[schedule.id]) {
                clearInterval(this.timers[schedule.id]);
            }

            this.timers[schedule.id] = setInterval(() => {
                this.runScheduledScan(schedule);
            }, schedule.interval * 60000);
        },

        async runScheduledScan(schedule) {
            console.log(`🔄 Running scheduled scan: ${schedule.name}`);
            schedule.lastRun = new Date().toISOString();
            schedule.nextRun = new Date(Date.now() + schedule.interval * 60000).toISOString();
            this.saveSchedules();

            // Trigger integration scan
            if (window.cavIntegrations) {
                try {
                    await window.cavIntegrations.scanService(schedule.integration);
                } catch (e) {
                    console.error('Scheduled scan failed:', e);
                }
            }
        },

        showScheduleManager() {
            const modal = document.createElement('div');
            modal.className = 'cav-schedules-overlay';
            modal.innerHTML = `
                <div class="cav-schedules-modal">
                    <div class="cav-schedules-header">
                        <h3><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--cav-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 8px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Scheduled Scans</h3>
                        <button class="cav-schedules-close">✕</button>
                    </div>
                    <div class="cav-schedules-body">
                        <div class="cav-schedules-create">
                            <input type="text" id="sched-name" placeholder="Schedule name">
                            <select id="sched-integration">
                                <option value="google-drive">Google Drive</option>
                                <option value="dropbox">Dropbox</option>
                                <option value="onedrive">OneDrive</option>
                            </select>
                            <select id="sched-interval">
                                <option value="15">Every 15 mins</option>
                                <option value="60">Every hour</option>
                                <option value="360">Every 6 hours</option>
                                <option value="1440">Daily</option>
                            </select>
                            <button id="create-sched-btn">+ Create</button>
                        </div>
                        <div class="cav-schedules-list" id="schedules-list"></div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            this.renderSchedulesList(modal);

            modal.querySelector('.cav-schedules-close').onclick = () => modal.remove();
            modal.querySelector('#create-sched-btn').onclick = () => {
                const name = modal.querySelector('#sched-name').value.trim();
                const integration = modal.querySelector('#sched-integration').value;
                const interval = parseInt(modal.querySelector('#sched-interval').value);
                
                if (name) {
                    this.createSchedule({ name, integration, interval });
                    this.renderSchedulesList(modal);
                    modal.querySelector('#sched-name').value = '';
                }
            };
        },

        renderSchedulesList(modal) {
            const list = modal.querySelector('#schedules-list');
            if (this.schedules.length === 0) {
                list.innerHTML = '<div class="cav-schedules-empty">No scheduled scans</div>';
                return;
            }

            list.innerHTML = this.schedules.map(s => `
                <div class="cav-schedule-item">
                    <div class="cav-schedule-info">
                        <strong>${s.name}</strong>
                        <span>${s.integration} • Every ${s.interval} mins</span>
                        <span class="cav-schedule-next">Next: ${new Date(s.nextRun).toLocaleString()}</span>
                    </div>
                    <button class="cav-schedule-delete" data-id="${s.id}">🗑️</button>
                </div>
            `).join('');

            list.querySelectorAll('.cav-schedule-delete').forEach(btn => {
                btn.onclick = () => {
                    if (confirm('Delete this schedule?')) {
                        this.deleteSchedule(btn.dataset.id);
                        this.renderSchedulesList(modal);
                    }
                };
            });
        }
    };

    // ============================================
    // 10. UNDO/REVERT
    // ============================================
    const UndoRevert = {
        history: [],
        maxHistory: 50,

        recordAction(action) {
            this.history.unshift({
                id: `action_${Date.now()}`,
                type: action.type,
                data: action.data,
                timestamp: new Date().toISOString(),
                description: action.description,
            });
            
            // Keep only last N actions
            if (this.history.length > this.maxHistory) {
                this.history = this.history.slice(0, this.maxHistory);
            }
        },

        canUndo() {
            return this.history.length > 0;
        },

        getLastAction() {
            return this.history[0] || null;
        },

        undo() {
            if (!this.canUndo()) return null;
            return this.history.shift();
        },

        showUndoNotification(action) {
            const notif = document.createElement('div');
            notif.className = 'cav-undo-notification';
            notif.innerHTML = `
                <span>${action.description}</span>
                <button class="cav-undo-btn">Undo</button>
            `;
            document.body.appendChild(notif);

            notif.querySelector('.cav-undo-btn').onclick = () => {
                this.undo();
                notif.remove();
                // Trigger undo logic here
            };

            setTimeout(() => {
                notif.classList.add('fade-out');
                setTimeout(() => notif.remove(), 300);
            }, 5000);
        }
    };

    // ============================================
    // INJECT STYLES
    // ============================================
    const advancedStyles = `
        /* Processing Queue */
        #cav-queue-panel {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 350px;
            background: linear-gradient(135deg, #1a1a2e 0%, #2d1f4e 100%);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            z-index: 500000;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        #cav-queue-panel.minimized .cav-queue-body {
            display: none;
        }

        .cav-queue-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background: rgba(0, 0, 0, 0.3);
            color: #fff;
            font-weight: 600;
        }

        .cav-queue-actions {
            display: flex;
            gap: 0.5rem;
        }

        .cav-queue-actions button {
            background: none;
            border: none;
            color: #888;
            cursor: pointer;
            padding: 0.25rem;
        }

        .cav-queue-body {
            max-height: 300px;
            overflow-y: auto;
        }

        .cav-queue-job {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .cav-queue-job.completed { opacity: 0.6; }
        .cav-queue-job.failed { background: rgba(239, 68, 68, 0.1); }

        .cav-queue-job-icon { font-size: 1.25rem; }

        .cav-queue-job-info {
            flex: 1;
        }

        .cav-queue-job-name {
            color: #fff;
            font-size: 0.85rem;
        }

        .cav-queue-job-type {
            color: #888;
            font-size: 0.75rem;
            text-transform: capitalize;
        }

        .cav-queue-job-status {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.8rem;
        }

        .cav-queue-progress {
            width: 60px;
            height: 4px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px;
            overflow: hidden;
        }

        .cav-queue-progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #8b5cf6, #ec4899);
            transition: width 0.3s ease;
        }

        .cav-queue-empty {
            padding: 2rem;
            text-align: center;
            color: #666;
        }

        /* Batch Operations */
        .cav-batch-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 600000;
        }

        .cav-batch-modal {
            background: linear-gradient(135deg, #1a1a2e 0%, #2d1f4e 100%);
            border-radius: 16px;
            width: 500px;
            max-width: 90vw;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .cav-batch-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.25rem 1.5rem;
            background: rgba(0, 0, 0, 0.3);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .cav-batch-header h3 {
            color: #fff;
            margin: 0;
        }

        .cav-batch-close {
            background: none;
            border: none;
            color: #888;
            font-size: 1.5rem;
            cursor: pointer;
        }

        .cav-batch-body {
            padding: 1.5rem;
        }

        .cav-batch-count {
            color: #c4b5fd;
            font-weight: 600;
        }

        .cav-batch-operations {
            margin-top: 1.5rem;
        }

        .cav-batch-operations h4 {
            color: #fff;
            margin-bottom: 1rem;
        }

        .cav-batch-op {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            margin-bottom: 0.5rem;
            cursor: pointer;
            border: 2px solid transparent;
            transition: all 0.2s ease;
        }

        .cav-batch-op:hover {
            background: rgba(139, 92, 246, 0.1);
        }

        .cav-batch-op.selected {
            border-color: #8b5cf6;
            background: rgba(139, 92, 246, 0.2);
        }

        .cav-batch-op-icon {
            font-size: 1.5rem;
        }

        .cav-batch-op-info strong {
            display: block;
            color: #fff;
            margin-bottom: 0.25rem;
        }

        .cav-batch-op-info span {
            color: #888;
            font-size: 0.85rem;
        }

        .cav-batch-options {
            margin-top: 1.5rem;
            padding: 1rem;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
        }

        .cav-batch-options h4 {
            color: #c4b5fd;
            margin-bottom: 1rem;
        }

        .cav-batch-option {
            margin-bottom: 1rem;
        }

        .cav-batch-option label {
            display: block;
            color: #888;
            font-size: 0.85rem;
            margin-bottom: 0.5rem;
        }

        .cav-batch-option select {
            width: 100%;
            padding: 0.5rem;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            color: #fff;
        }

        .cav-batch-footer {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            padding: 1.25rem 1.5rem;
            background: rgba(0, 0, 0, 0.2);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .cav-batch-cancel {
            padding: 0.75rem 1.5rem;
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            color: #c4b5fd;
            cursor: pointer;
        }

        .cav-batch-start {
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
            border: none;
            border-radius: 8px;
            color: #fff;
            font-weight: 600;
            cursor: pointer;
        }

        .cav-batch-start:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .cav-batch-notification {
            position: fixed;
            bottom: 100px;
            right: 20px;
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            color: #fff;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            z-index: 600000;
            animation: slideIn 0.3s ease;
        }

        .cav-batch-notification.fade-out {
            animation: slideOut 0.3s ease forwards;
        }

        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }

        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }

        /* Comparison View */
        .cav-comparison-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 600000;
        }

        .cav-comparison-modal {
            background: linear-gradient(135deg, #1a1a2e 0%, #2d1f4e 100%);
            border-radius: 16px;
            width: 900px;
            max-width: 95vw;
            max-height: 90vh;
            overflow: hidden;
        }

        .cav-comparison-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 1.5rem;
            background: rgba(0, 0, 0, 0.3);
        }

        .cav-comparison-header h3 {
            color: #fff;
            margin: 0;
        }

        .cav-comparison-body {
            display: flex;
            padding: 1.5rem;
            gap: 1rem;
        }

        .cav-comparison-pane {
            flex: 1;
            text-align: center;
        }

        .cav-comparison-label {
            color: #c4b5fd;
            font-weight: 600;
            margin-bottom: 1rem;
        }

        .cav-comparison-image img {
            max-width: 100%;
            max-height: 400px;
            border-radius: 8px;
        }

        .cav-comparison-info {
            margin-top: 1rem;
            color: #888;
        }

        .cav-comparison-info p {
            margin: 0.25rem 0;
        }

        .cav-comparison-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background: rgba(139, 92, 246, 0.2);
            border-radius: 12px;
            color: #c4b5fd;
            font-size: 0.8rem;
            margin-top: 0.5rem;
        }

        .cav-comparison-divider {
            width: 2px;
            background: rgba(255, 255, 255, 0.1);
            position: relative;
        }

        .cav-comparison-footer {
            display: flex;
            justify-content: center;
            gap: 1rem;
            padding: 1rem 1.5rem;
            background: rgba(0, 0, 0, 0.2);
        }

        .cav-comparison-footer button {
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
        }

        .cav-comparison-download-orig,
        .cav-comparison-download-mod {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #fff;
        }

        .cav-comparison-use-mod {
            background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
            border: none;
            color: #fff;
        }

        /* Pagination */
        .cav-pagination {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 1.5rem;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 12px;
            margin-top: 1rem;
        }

        .cav-page-nav {
            padding: 0.5rem 1rem;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            color: #c4b5fd;
            cursor: pointer;
        }

        .cav-page-nav:disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }

        .cav-page-numbers {
            display: flex;
            gap: 0.25rem;
        }

        .cav-page-btn {
            min-width: 36px;
            height: 36px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            color: #c4b5fd;
            cursor: pointer;
        }

        .cav-page-btn.active {
            background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
            border-color: #8b5cf6;
            color: #fff;
        }

        .cav-page-ellipsis {
            padding: 0 0.5rem;
            color: #666;
        }

        .cav-page-info {
            color: #888;
            font-size: 0.85rem;
            margin-left: 1rem;
        }

        /* Folders */
        .cav-folders-overlay,
        .cav-versions-overlay,
        .cav-schedules-overlay,
        .cav-report-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 600000;
        }

        .cav-folders-modal,
        .cav-versions-modal,
        .cav-schedules-modal,
        .cav-report-modal {
            background: linear-gradient(135deg, #1a1a2e 0%, #2d1f4e 100%);
            border-radius: 16px;
            width: 500px;
            max-width: 90vw;
            max-height: 80vh;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .cav-folders-header,
        .cav-versions-header,
        .cav-schedules-header,
        .cav-report-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 1.5rem;
            background: rgba(0, 0, 0, 0.3);
        }

        .cav-folders-header h3,
        .cav-versions-header h3,
        .cav-schedules-header h3,
        .cav-report-header h3 {
            color: #fff;
            margin: 0;
        }

        .cav-folders-close,
        .cav-versions-close,
        .cav-schedules-close,
        .cav-report-close {
            background: none;
            border: none;
            color: #888;
            font-size: 1.5rem;
            cursor: pointer;
        }

        .cav-folders-body,
        .cav-versions-body,
        .cav-schedules-body,
        .cav-report-body {
            padding: 1.5rem;
            max-height: 400px;
            overflow-y: auto;
        }

        .cav-folders-create,
        .cav-schedules-create {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
        }

        .cav-folders-create input[type="text"],
        .cav-schedules-create input,
        .cav-schedules-create select {
            flex: 1;
            padding: 0.5rem;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            color: #fff;
        }

        .cav-folders-create input[type="color"] {
            width: 40px;
            padding: 0;
            border: none;
        }

        #create-folder-btn,
        #create-sched-btn {
            padding: 0.5rem 1rem;
            background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
            border: none;
            border-radius: 6px;
            color: #fff;
            cursor: pointer;
        }

        .cav-folder-item,
        .cav-schedule-item,
        .cav-version-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.75rem;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            margin-bottom: 0.5rem;
        }

        .cav-folder-color {
            width: 12px;
            height: 12px;
            border-radius: 50%;
        }

        .cav-folder-info,
        .cav-schedule-info {
            flex: 1;
        }

        .cav-folder-info strong,
        .cav-schedule-info strong {
            display: block;
            color: #fff;
        }

        .cav-folder-info span,
        .cav-schedule-info span {
            color: #888;
            font-size: 0.8rem;
        }

        .cav-folder-actions button,
        .cav-schedule-delete,
        .cav-version-revert {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 1rem;
        }

        .cav-version-number {
            background: rgba(139, 92, 246, 0.2);
            color: #c4b5fd;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
        }

        .cav-version-info {
            flex: 1;
        }

        .cav-version-date {
            display: block;
            color: #888;
            font-size: 0.8rem;
        }

        .cav-report-option {
            margin-bottom: 1rem;
        }

        .cav-report-option label {
            display: block;
            color: #c4b5fd;
            margin-bottom: 0.5rem;
        }

        .cav-report-option input[type="text"] {
            width: 100%;
            padding: 0.5rem;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            color: #fff;
        }

        .cav-report-footer {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            padding: 1rem 1.5rem;
            background: rgba(0, 0, 0, 0.2);
        }

        .cav-report-cancel {
            padding: 0.75rem 1.5rem;
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            color: #c4b5fd;
            cursor: pointer;
        }

        .cav-report-generate {
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
            border: none;
            border-radius: 8px;
            color: #fff;
            font-weight: 600;
            cursor: pointer;
        }

        /* Undo Notification */
        .cav-undo-notification {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #1a1a2e 0%, #2d1f4e 100%);
            color: #fff;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 1rem;
            z-index: 600000;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .cav-undo-btn {
            padding: 0.5rem 1rem;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 6px;
            color: #c4b5fd;
            cursor: pointer;
        }

        /* Spinner */
        .cav-spinner {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = advancedStyles;
    document.head.appendChild(styleSheet);

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        ProcessingQueue.loadJobs();
        FoldersCollections.init();
        VersionHistory.init();
        ScheduledScans.init();
        
        console.log('🚀 Advanced Features loaded - Version 2.2.0');
        console.log('   Features: Queue, Batch Ops, Comparison, Folders, Downloads, Versions, PDF Reports, Pagination, Schedules, Undo');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ============================================
    // EXPORTS
    // ============================================
    window.cavAdvanced = {
        ProcessingQueue,
        BatchOperations,
        ComparisonView,
        FoldersCollections,
        DownloadManager,
        VersionHistory,
        PDFReports,
        TruePagination,
        ScheduledScans,
        UndoRevert,
    };

})();


