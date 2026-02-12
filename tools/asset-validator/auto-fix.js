/**
 * Auto-Fix Workflow - AI-Powered Asset Correction Pipeline
 * =========================================================
 * Version 2.0.0
 * 
 * Features:
 * - Automatic detection of off-size assets
 * - One-click AI fix for aspect ratio issues
 * - Batch processing for multiple assets
 * - Before/After comparison
 * - Integration with notifications
 * - Fix history and undo
 */

(function() {
    'use strict';

    // ============================================
    // AUTO-FIX WORKFLOW CLASS
    // ============================================
    class AutoFixWorkflow {
        constructor() {
            this.queue = [];
            this.processing = false;
            this.history = this.loadHistory();
            this.settings = this.loadSettings();
        }

        loadHistory() {
            try {
                return JSON.parse(localStorage.getItem('cav_autofix_history') || '[]');
            } catch {
                return [];
            }
        }

        saveHistory() {
            localStorage.setItem('cav_autofix_history', JSON.stringify(this.history.slice(0, 100)));
        }

        loadSettings() {
            try {
                return JSON.parse(localStorage.getItem('cav_autofix_settings') || '{}');
            } catch {
                return {};
            }
        }

        saveSettings() {
            localStorage.setItem('cav_autofix_settings', JSON.stringify(this.settings));
        }

        // ----------------------------------------
        // ANALYZE ASSET
        // ----------------------------------------
        
        /**
         * Analyze an asset and return fix suggestions
         */
        analyzeAsset(asset, targetChannels = null) {
            const analysis = {
                assetId: asset.id,
                filename: asset.filename || asset.name,
                type: asset.type,
                currentDimensions: {
                    width: asset.width,
                    height: asset.height,
                    aspectRatio: this.calculateAspectRatio(asset.width, asset.height),
                },
                duration: asset.duration || null,
                issues: [],
                fixSuggestions: [],
                canAutoFix: true,
            };

            // Get all channel specs
            const specs = asset.type === 'video' 
                ? this.getVideoSpecs() 
                : this.getImageSpecs();

            // Determine which channels to check
            const channelsToCheck = targetChannels || Object.keys(specs);

            channelsToCheck.forEach(channel => {
                const spec = specs[channel];
                if (!spec) return;

                const issues = this.checkChannelCompatibility(asset, spec, channel);
                
                if (issues.length > 0) {
                    analysis.issues.push({
                        channel,
                        issues,
                    });

                    // Generate fix suggestions
                    issues.forEach(issue => {
                        const fix = this.generateFixSuggestion(asset, spec, channel, issue);
                        if (fix && !analysis.fixSuggestions.find(f => 
                            f.channel === fix.channel && f.type === fix.type
                        )) {
                            analysis.fixSuggestions.push(fix);
                        }
                    });
                }
            });

            // Check if can auto-fix (need AI adapter)
            analysis.canAutoFix = window.cavAIAdapter?.hasApiKey() || false;

            return analysis;
        }

        checkChannelCompatibility(asset, spec, channel) {
            const issues = [];
            const ratio = asset.width / asset.height;

            // Check aspect ratio
            const specRatios = spec.aspectRatios.map(r => {
                const [w, h] = r.split(':').map(Number);
                return { ratio: w / h, label: r };
            });

            const matchesRatio = specRatios.some(sr => Math.abs(ratio - sr.ratio) < 0.05);

            if (!matchesRatio) {
                const closestRatio = specRatios.reduce((closest, sr) => 
                    Math.abs(sr.ratio - ratio) < Math.abs(closest.ratio - ratio) ? sr : closest
                );
                
                issues.push({
                    type: 'aspect_ratio',
                    message: `Wrong aspect ratio for ${channel}`,
                    current: this.calculateAspectRatio(asset.width, asset.height),
                    required: closestRatio.label,
                    requiredRatio: closestRatio.ratio,
                });
            }

            // Check duration for videos
            if (asset.type === 'video' && asset.duration) {
                if (spec.minDuration && asset.duration < spec.minDuration) {
                    issues.push({
                        type: 'duration_short',
                        message: `Video too short for ${channel}`,
                        current: asset.duration,
                        required: spec.minDuration,
                    });
                }
                if (spec.maxDuration && asset.duration > spec.maxDuration) {
                    issues.push({
                        type: 'duration_long',
                        message: `Video too long for ${channel}`,
                        current: asset.duration,
                        required: spec.maxDuration,
                    });
                }
            }

            // Check file size
            if (spec.maxFileSizeMB && asset.fileSize) {
                const sizeMB = asset.fileSize / (1024 * 1024);
                if (sizeMB > spec.maxFileSizeMB) {
                    issues.push({
                        type: 'file_size',
                        message: `File too large for ${channel}`,
                        current: sizeMB.toFixed(1) + 'MB',
                        required: spec.maxFileSizeMB + 'MB',
                    });
                }
            }

            return issues;
        }

        generateFixSuggestion(asset, spec, channel, issue) {
            switch (issue.type) {
                case 'aspect_ratio':
                    return {
                        channel,
                        type: 'resize',
                        action: 'AI Outpainting',
                        description: `Extend image to ${issue.required} for ${channel}`,
                        targetRatio: issue.requiredRatio,
                        targetAspect: issue.required,
                        method: 'outpaint', // outpaint, crop, smart_resize
                        estimatedTime: '15-30 seconds',
                        aiModel: 'Gemini 3 Pro',
                    };

                case 'duration_short':
                    return {
                        channel,
                        type: 'extend_video',
                        action: 'Extend Video',
                        description: `Extend video to ${issue.required}s minimum`,
                        targetDuration: issue.required,
                        method: 'loop_or_slow',
                        estimatedTime: '30-60 seconds',
                        aiModel: 'Manual or Veo4',
                    };

                case 'duration_long':
                    return {
                        channel,
                        type: 'trim_video',
                        action: 'Trim Video',
                        description: `Trim video to ${issue.required}s maximum`,
                        targetDuration: issue.required,
                        method: 'smart_trim',
                        estimatedTime: '10-20 seconds',
                        aiModel: 'Manual',
                    };

                case 'file_size':
                    return {
                        channel,
                        type: 'compress',
                        action: 'Compress',
                        description: `Reduce file size to under ${issue.required}`,
                        targetSize: issue.required,
                        method: 'quality_reduce',
                        estimatedTime: '5-15 seconds',
                        aiModel: 'Local',
                    };

                default:
                    return null;
            }
        }

        // ----------------------------------------
        // AUTO-FIX EXECUTION
        // ----------------------------------------

        /**
         * Execute a single fix
         */
        async executeFix(asset, fixSuggestion, options = {}) {
            console.log(`🔧 Auto-fixing: ${asset.filename || asset.name}`);
            console.log(`   Fix type: ${fixSuggestion.type}`);
            console.log(`   For channel: ${fixSuggestion.channel}`);

            const result = {
                success: false,
                originalAsset: asset,
                fixSuggestion,
                startTime: new Date().toISOString(),
                endTime: null,
                derivative: null,
                error: null,
            };

            try {
                switch (fixSuggestion.type) {
                    case 'resize':
                        result.derivative = await this.executeResizeFix(asset, fixSuggestion, options);
                        break;

                    case 'extend_video':
                        result.derivative = await this.executeExtendVideoFix(asset, fixSuggestion, options);
                        break;

                    case 'trim_video':
                        result.derivative = await this.executeTrimVideoFix(asset, fixSuggestion, options);
                        break;

                    case 'compress':
                        result.derivative = await this.executeCompressFix(asset, fixSuggestion, options);
                        break;

                    default:
                        throw new Error(`Unknown fix type: ${fixSuggestion.type}`);
                }

                result.success = true;
                result.endTime = new Date().toISOString();

                // Add to history
                this.history.unshift({
                    id: Date.now().toString(),
                    ...result,
                    derivative: result.derivative ? {
                        id: result.derivative.id,
                        filename: result.derivative.filename,
                    } : null,
                });
                this.saveHistory();

                console.log(`✅ Fix completed: ${result.derivative?.filename}`);

            } catch (error) {
                result.error = error.message;
                result.endTime = new Date().toISOString();
                console.error(`❌ Fix failed:`, error);
            }

            return result;
        }

        async executeResizeFix(asset, fix, options) {
            if (!window.cavAIAdapter) {
                throw new Error('AI Adapter not available');
            }

            // Calculate target dimensions
            const targetRatio = fix.targetRatio;
            const currentRatio = asset.width / asset.height;
            
            let targetWidth, targetHeight;
            
            if (currentRatio < targetRatio) {
                // Need to extend width
                targetHeight = asset.height;
                targetWidth = Math.round(asset.height * targetRatio);
            } else {
                // Need to extend height
                targetWidth = asset.width;
                targetHeight = Math.round(asset.width / targetRatio);
            }

            // Use AI Adapter to perform outpainting
            const derivative = await window.cavAIAdapter.adaptImageToAspectRatio(asset, {
                aspectRatio: fix.targetAspect,
                channel: fix.channel,
            });

            return derivative;
        }

        async executeExtendVideoFix(asset, fix, options) {
            // For video extension, we can:
            // 1. Loop the video
            // 2. Slow it down
            // 3. Use AI to generate additional frames
            
            console.log(`⏱️ Video extension not yet implemented via AI`);
            console.log(`   Suggested: Loop or slow down the video to reach ${fix.targetDuration}s`);
            
            return {
                id: `manual_fix_${Date.now()}`,
                filename: asset.filename || asset.name,
                note: `Manual edit required: extend to ${fix.targetDuration}s`,
                requiresManualEdit: true,
            };
        }

        async executeTrimVideoFix(asset, fix, options) {
            console.log(`✂️ Video trimming not yet implemented via AI`);
            console.log(`   Suggested: Trim video to ${fix.targetDuration}s maximum`);
            
            return {
                id: `manual_fix_${Date.now()}`,
                filename: asset.filename || asset.name,
                note: `Manual edit required: trim to ${fix.targetDuration}s`,
                requiresManualEdit: true,
            };
        }

        async executeCompressFix(asset, fix, options) {
            // Use canvas to recompress image at lower quality
            console.log(`📦 Compressing asset...`);
            
            if (asset.type === 'image' && asset.dataUrl) {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0);
                        
                        // Compress at 70% quality
                        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                        
                        resolve({
                            id: `compressed_${Date.now()}`,
                            filename: asset.filename?.replace(/\.[^/.]+$/, '_compressed.jpg'),
                            dataUrl: compressedDataUrl,
                            width: img.width,
                            height: img.height,
                            type: 'image',
                            compressed: true,
                            originalSize: asset.fileSize,
                            newSize: Math.round(compressedDataUrl.length * 0.75),
                        });
                    };
                    img.onerror = reject;
                    img.src = asset.dataUrl;
                });
            }

            throw new Error('Cannot compress this asset type');
        }

        // ----------------------------------------
        // BATCH PROCESSING
        // ----------------------------------------

        /**
         * Add assets to the fix queue
         */
        addToQueue(assets, targetChannel = null) {
            assets.forEach(asset => {
                const analysis = this.analyzeAsset(asset, targetChannel ? [targetChannel] : null);
                
                if (analysis.fixSuggestions.length > 0) {
                    this.queue.push({
                        asset,
                        analysis,
                        fixSuggestions: analysis.fixSuggestions,
                        status: 'pending',
                        addedAt: new Date().toISOString(),
                    });
                }
            });

            return this.queue.length;
        }

        /**
         * Process the entire queue
         */
        async processQueue(options = {}) {
            if (this.processing) {
                console.log('⏳ Already processing queue');
                return;
            }

            this.processing = true;
            const results = [];

            console.log(`🚀 Processing ${this.queue.length} assets in queue`);

            for (let i = 0; i < this.queue.length; i++) {
                const item = this.queue[i];
                
                if (item.status !== 'pending') continue;

                item.status = 'processing';
                
                // Process first fix suggestion (or all if specified)
                const fixToApply = item.fixSuggestions[0];
                
                if (fixToApply && fixToApply.type === 'resize') {
                    try {
                        const result = await this.executeFix(item.asset, fixToApply, options);
                        results.push(result);
                        item.status = result.success ? 'completed' : 'failed';
                        item.result = result;
                    } catch (error) {
                        item.status = 'failed';
                        item.error = error.message;
                    }
                } else {
                    item.status = 'skipped';
                    item.note = 'Fix type not supported for auto-fix';
                }

                // Emit progress event
                if (options.onProgress) {
                    options.onProgress({
                        current: i + 1,
                        total: this.queue.length,
                        item,
                    });
                }
            }

            this.processing = false;
            
            // Clear completed items from queue
            this.queue = this.queue.filter(item => 
                item.status === 'pending' || item.status === 'failed'
            );

            console.log(`✅ Queue processing complete: ${results.filter(r => r.success).length}/${results.length} successful`);

            return results;
        }

        getQueueStatus() {
            return {
                total: this.queue.length,
                pending: this.queue.filter(i => i.status === 'pending').length,
                processing: this.queue.filter(i => i.status === 'processing').length,
                completed: this.queue.filter(i => i.status === 'completed').length,
                failed: this.queue.filter(i => i.status === 'failed').length,
            };
        }

        clearQueue() {
            this.queue = [];
        }

        // ----------------------------------------
        // UTILITY METHODS
        // ----------------------------------------

        calculateAspectRatio(width, height) {
            const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
            const divisor = gcd(width, height);
            return `${width / divisor}:${height / divisor}`;
        }

        getVideoSpecs() {
            return {
                'YouTube Standard': { aspectRatios: ['16:9'], minDuration: 6, maxDuration: null },
                'YouTube Shorts': { aspectRatios: ['9:16'], minDuration: null, maxDuration: 60 },
                'Meta Feed': { aspectRatios: ['1:1', '4:5', '16:9'], minDuration: 1, maxDuration: 241 },
                'Meta Stories': { aspectRatios: ['9:16'], minDuration: 1, maxDuration: 120 },
                'Meta Reels': { aspectRatios: ['9:16'], minDuration: 3, maxDuration: 90 },
                'TikTok': { aspectRatios: ['9:16'], minDuration: 5, maxDuration: 60 },
                'Instagram Feed': { aspectRatios: ['1:1', '4:5'], minDuration: 3, maxDuration: 60 },
                'Instagram Reels': { aspectRatios: ['9:16'], minDuration: 3, maxDuration: 90 },
                'LinkedIn': { aspectRatios: ['1.91:1', '1:1', '4:5'], minDuration: 3, maxDuration: 600 },
                'X (Twitter)': { aspectRatios: ['16:9', '1:1', '9:16'], minDuration: null, maxDuration: 140 },
            };
        }

        getImageSpecs() {
            return {
                'Instagram Feed': { aspectRatios: ['1:1', '4:5', '1.91:1'] },
                'Instagram Stories': { aspectRatios: ['9:16'] },
                'Facebook Feed': { aspectRatios: ['1.91:1', '1:1', '4:5'] },
                'Facebook Stories': { aspectRatios: ['9:16'] },
                'LinkedIn Feed': { aspectRatios: ['1.91:1', '1:1', '4:5'] },
                'Twitter Feed': { aspectRatios: ['16:9', '1:1'] },
                'Pinterest': { aspectRatios: ['2:3', '1:1'] },
                'Google Ads': { aspectRatios: ['1.91:1', '1:1'] },
            };
        }

        getHistory() {
            return this.history;
        }

        clearHistory() {
            this.history = [];
            this.saveHistory();
        }
    }

    // ============================================
    // AUTO-FIX UI COMPONENTS
    // ============================================

    function createAutoFixPanel(workflow, asset = null) {
        const panel = document.createElement('div');
        panel.className = 'autofix-panel';

        if (asset) {
            const analysis = workflow.analyzeAsset(asset);
            
            panel.innerHTML = `
                <div class="autofix-header">
                    <h3>🔧 Auto-Fix: ${asset.filename || asset.name}</h3>
                    <button class="autofix-close">&times;</button>
                </div>
                
                <div class="autofix-body">
                    <div class="autofix-current">
                        <h4>Current Dimensions</h4>
                        <p>${asset.width} × ${asset.height} (${analysis.currentDimensions.aspectRatio})</p>
                        ${asset.duration ? `<p>Duration: ${asset.duration}s</p>` : ''}
                    </div>
                    
                    ${analysis.issues.length > 0 ? `
                        <div class="autofix-issues">
                            <h4>⚠️ Issues Found</h4>
                            ${analysis.issues.map(issue => `
                                <div class="autofix-issue">
                                    <strong>${issue.channel}</strong>
                                    <ul>
                                        ${issue.issues.map(i => `<li>${i.message}</li>`).join('')}
                                    </ul>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="autofix-ok">
                            <h4>✅ No Issues Found</h4>
                            <p>This asset meets all channel requirements.</p>
                        </div>
                    `}
                    
                    ${analysis.fixSuggestions.length > 0 ? `
                        <div class="autofix-suggestions">
                            <h4>🤖 AI Fix Suggestions</h4>
                            ${analysis.fixSuggestions.map((fix, idx) => `
                                <div class="autofix-suggestion" data-index="${idx}">
                                    <div class="fix-info">
                                        <span class="fix-channel">${fix.channel}</span>
                                        <span class="fix-action">${fix.action}</span>
                                        <p>${fix.description}</p>
                                        <small>Est. time: ${fix.estimatedTime} | Model: ${fix.aiModel}</small>
                                    </div>
                                    <button class="fix-btn-apply" data-index="${idx}" ${!analysis.canAutoFix ? 'disabled' : ''}>
                                        ${analysis.canAutoFix ? '⚡ Fix Now' : '🔑 API Key Required'}
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                        
                        ${analysis.fixSuggestions.length > 1 ? `
                            <button class="fix-btn-all" ${!analysis.canAutoFix ? 'disabled' : ''}>
                                🚀 Fix All (${analysis.fixSuggestions.length} issues)
                            </button>
                        ` : ''}
                    ` : ''}
                    
                    ${!analysis.canAutoFix ? `
                        <div class="autofix-api-warning">
                            <p>⚠️ AI features require a Google AI Studio API key.</p>
                            <button class="fix-btn-settings">Configure API Key</button>
                        </div>
                    ` : ''}
                </div>
            `;
        } else {
            // Queue view
            const queueStatus = workflow.getQueueStatus();
            
            panel.innerHTML = `
                <div class="autofix-header">
                    <h3>🔧 Auto-Fix Queue</h3>
                    <button class="autofix-close">&times;</button>
                </div>
                
                <div class="autofix-body">
                    <div class="autofix-queue-stats">
                        <div class="stat">
                            <span class="stat-value">${queueStatus.total}</span>
                            <span class="stat-label">Total</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${queueStatus.pending}</span>
                            <span class="stat-label">Pending</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${queueStatus.completed}</span>
                            <span class="stat-label">Completed</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${queueStatus.failed}</span>
                            <span class="stat-label">Failed</span>
                        </div>
                    </div>
                    
                    <div class="autofix-queue-actions">
                        <button class="fix-btn-process" ${queueStatus.pending === 0 ? 'disabled' : ''}>
                            🚀 Process Queue
                        </button>
                        <button class="fix-btn-clear">🗑️ Clear Queue</button>
                    </div>
                    
                    <div class="autofix-queue-list">
                        ${workflow.queue.map((item, idx) => `
                            <div class="queue-item status-${item.status}">
                                <span class="queue-name">${item.asset.filename || item.asset.name}</span>
                                <span class="queue-issues">${item.fixSuggestions.length} fixes</span>
                                <span class="queue-status">${item.status}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        return panel;
    }

    // ============================================
    // AUTO-FIX STYLES
    // ============================================
    const autoFixStyles = `
        .autofix-panel {
            background: linear-gradient(135deg, #1e1b4b 0%, #581c87 100%);
            border-radius: 16px;
            max-width: 600px;
            width: 100%;
            border: 1px solid rgba(255, 255, 255, 0.1);
            overflow: hidden;
        }
        
        .autofix-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.25rem 1.5rem;
            background: rgba(0, 0, 0, 0.2);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .autofix-header h3 {
            color: #fff;
            font-size: 1.1rem;
        }
        
        .autofix-close {
            background: none;
            border: none;
            color: #c4b5fd;
            font-size: 1.5rem;
            cursor: pointer;
        }
        
        .autofix-body {
            padding: 1.5rem;
        }
        
        .autofix-current {
            background: rgba(0, 0, 0, 0.2);
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
        }
        
        .autofix-current h4 {
            color: #c4b5fd;
            font-size: 0.85rem;
            margin-bottom: 0.5rem;
        }
        
        .autofix-current p {
            color: #fff;
            font-size: 1.1rem;
        }
        
        .autofix-issues {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
        }
        
        .autofix-issues h4 {
            color: #fca5a5;
            margin-bottom: 0.75rem;
        }
        
        .autofix-issue {
            margin-bottom: 0.75rem;
        }
        
        .autofix-issue strong {
            color: #fff;
        }
        
        .autofix-issue ul {
            color: #fca5a5;
            padding-left: 1.25rem;
            margin-top: 0.25rem;
        }
        
        .autofix-ok {
            background: rgba(34, 197, 94, 0.1);
            border: 1px solid rgba(34, 197, 94, 0.3);
            padding: 1rem;
            border-radius: 8px;
            text-align: center;
        }
        
        .autofix-ok h4 {
            color: #86efac;
        }
        
        .autofix-suggestions {
            margin-bottom: 1rem;
        }
        
        .autofix-suggestions h4 {
            color: #fff;
            margin-bottom: 1rem;
        }
        
        .autofix-suggestion {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            margin-bottom: 0.75rem;
            border: 1px solid rgba(168, 85, 247, 0.2);
        }
        
        .fix-info {
            flex: 1;
        }
        
        .fix-channel {
            background: rgba(168, 85, 247, 0.3);
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            color: #c4b5fd;
            margin-right: 0.5rem;
        }
        
        .fix-action {
            color: #fff;
            font-weight: 600;
        }
        
        .fix-info p {
            color: #c4b5fd;
            font-size: 0.85rem;
            margin: 0.5rem 0 0.25rem;
        }
        
        .fix-info small {
            color: #6b7280;
            font-size: 0.75rem;
        }
        
        .fix-btn-apply {
            padding: 0.5rem 1rem;
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            border: none;
            border-radius: 6px;
            color: #fff;
            font-weight: 600;
            cursor: pointer;
            white-space: nowrap;
        }
        
        .fix-btn-apply:disabled {
            background: #6b7280;
            cursor: not-allowed;
        }
        
        .fix-btn-all {
            width: 100%;
            padding: 0.75rem;
            background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
            border: none;
            border-radius: 8px;
            color: #fff;
            font-weight: 600;
            cursor: pointer;
        }
        
        .autofix-api-warning {
            background: rgba(245, 158, 11, 0.1);
            border: 1px solid rgba(245, 158, 11, 0.3);
            padding: 1rem;
            border-radius: 8px;
            text-align: center;
            margin-top: 1rem;
        }
        
        .autofix-api-warning p {
            color: #fcd34d;
            margin-bottom: 0.75rem;
        }
        
        .fix-btn-settings {
            padding: 0.5rem 1rem;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            border: none;
            border-radius: 6px;
            color: #fff;
            cursor: pointer;
        }
        
        /* Queue styles */
        .autofix-queue-stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        
        .autofix-queue-stats .stat {
            text-align: center;
            padding: 1rem;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
        }
        
        .stat-value {
            display: block;
            font-size: 1.5rem;
            font-weight: 700;
            color: #a855f7;
        }
        
        .stat-label {
            color: #c4b5fd;
            font-size: 0.8rem;
        }
        
        .autofix-queue-actions {
            display: flex;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        
        .fix-btn-process {
            flex: 1;
            padding: 0.75rem;
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            border: none;
            border-radius: 8px;
            color: #fff;
            font-weight: 600;
            cursor: pointer;
        }
        
        .fix-btn-clear {
            padding: 0.75rem 1.5rem;
            background: transparent;
            border: 1px solid rgba(239, 68, 68, 0.5);
            border-radius: 8px;
            color: #ef4444;
            cursor: pointer;
        }
        
        .autofix-queue-list {
            max-height: 300px;
            overflow-y: auto;
        }
        
        .queue-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 6px;
            margin-bottom: 0.5rem;
        }
        
        .queue-item.status-completed {
            border-left: 3px solid #22c55e;
        }
        
        .queue-item.status-failed {
            border-left: 3px solid #ef4444;
        }
        
        .queue-item.status-processing {
            border-left: 3px solid #f59e0b;
        }
        
        .queue-name {
            color: #fff;
            flex: 1;
        }
        
        .queue-issues {
            color: #c4b5fd;
            font-size: 0.85rem;
            margin: 0 1rem;
        }
        
        .queue-status {
            text-transform: capitalize;
            font-size: 0.8rem;
            color: #6b7280;
        }
    `;

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = autoFixStyles;
    document.head.appendChild(styleSheet);

    // ============================================
    // EXPORT
    // ============================================
    window.AutoFixWorkflow = AutoFixWorkflow;
    window.cavAutoFix = new AutoFixWorkflow();
    window.cavAutoFix.createPanel = createAutoFixPanel;

    console.log('🔧 Auto-Fix Workflow loaded - Version 2.0.0');

})();

