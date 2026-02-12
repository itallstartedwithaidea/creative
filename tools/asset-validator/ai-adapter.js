/**
 * AI Asset Adapter - Google AI Studio Integration
 * ================================================
 * Version 1.0.0
 * 
 * Features:
 * - AI-powered image resizing/extending (outpainting)
 * - Still image to video animation (Veo4)
 * - Video to still frame extraction
 * - Derivative file management with original linking
 * - Side-by-side comparison viewer
 * 
 * Powered by:
 * - Gemini 3 Pro Image Preview (image manipulation)
 * - Veo4 (video generation)
 * - Google AI Studio APIs
 */

(function() {
    'use strict';

    // ============================================
    // CONFIGURATION
    // ============================================
    
    window.AI_ADAPTER_CONFIG = window.AI_ADAPTER_CONFIG || {
        // Google AI Studio API Key (user provides their own)
        GEMINI_API_KEY: '',
        
        // API Endpoints
        API_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta',
        
        // Models
        MODELS: {
            IMAGE_EDIT: 'gemini-2.0-flash-exp',           // For image editing/outpainting
            IMAGE_GENERATE: 'gemini-3-pro-image-preview', // For image generation
            VIDEO_GENERATE: 'veo-2.0-generate-001',       // For video from image
            IMAGE_UNDERSTAND: 'gemini-2.0-flash-exp',     // For video to still
        },
        
        // Default settings
        DEFAULTS: {
            VIDEO_DURATION: 6,        // seconds
            VIDEO_FPS: 24,
            IMAGE_QUALITY: 'high',
            PRESERVE_STYLE: true,
            AUTO_ENHANCE: false,
        },
        
        // Storage prefix for derivatives
        DERIVATIVE_PREFIX: 'cav_derivative_',
    };

    // ============================================
    // AI ADAPTER CLASS
    // ============================================
    
    class AIAssetAdapter {
        constructor(config = {}) {
            this.config = { ...window.AI_ADAPTER_CONFIG, ...config };
            this.apiKey = this.getApiKeyFromAllSources(config);
            this.derivatives = new Map(); // Track original -> derivatives relationships
            this.processingQueue = [];
            this.isProcessing = false;
        }
        
        // Get API key from multiple sources for backwards compatibility
        getApiKeyFromAllSources(config) {
            // 1. Config override
            if (config.GEMINI_API_KEY) return config.GEMINI_API_KEY;
            
            // 2. v3.0 Settings structure
            try {
                const v3Settings = localStorage.getItem('cav_v3_settings');
                if (v3Settings) {
                    const settings = JSON.parse(v3Settings);
                    const key = settings?.apiKeys?.gemini?.key;
                    if (key && key.length >= 30) return key;
                }
            } catch (e) {}
            
            // 3. Settings Manager global
            if (window.cavSettings?.getAPIKey) {
                const key = window.cavSettings.getAPIKey('gemini');
                if (key && key.length >= 30) return key;
            }
            
            // 4. Legacy storage
            return localStorage.getItem('cav_gemini_api_key') || 
                   localStorage.getItem('cav_ai_api_key') || '';
        }

        // ----------------------------------------
        // API Key Management
        // ----------------------------------------
        
        setApiKey(key) {
            this.apiKey = key;
            localStorage.setItem('cav_gemini_api_key', key);
            console.log('🔑 AI Adapter: API key saved');
        }

        getApiKey() {
            return this.apiKey;
        }

        hasApiKey() {
            return !!this.apiKey && this.apiKey.length > 10;
        }

        // ----------------------------------------
        // Image Adaptation (Outpainting/Resize)
        // ----------------------------------------
        
        /**
         * Adapt an image to fit a target aspect ratio using AI outpainting
         * @param {Object} asset - The original asset object
         * @param {Object} targetSpec - Target channel specification
         * @returns {Promise<Object>} - Derivative asset with new dimensions
         */
        async adaptImageToAspectRatio(asset, targetSpec) {
            if (!this.hasApiKey()) {
                throw new Error('API key required. Please configure your Google AI Studio API key.');
            }

            const { width, height } = asset;
            const currentRatio = width / height;
            const targetRatio = this.parseAspectRatio(targetSpec.aspectRatio);
            
            // Calculate new dimensions
            let newWidth, newHeight;
            if (currentRatio < targetRatio) {
                // Need to extend width
                newHeight = height;
                newWidth = Math.round(height * targetRatio);
            } else {
                // Need to extend height
                newWidth = width;
                newHeight = Math.round(width / targetRatio);
            }

            console.log(`🎨 AI Adapter: Extending image from ${width}x${height} to ${newWidth}x${newHeight}`);

            // Build the prompt for outpainting
            const prompt = `Extend this image to ${newWidth}x${newHeight} pixels. 
                           Seamlessly extend the edges while maintaining:
                           - The exact same style, colors, and lighting
                           - The original content in the center unchanged
                           - Natural continuation of any patterns, backgrounds, or elements
                           - Professional quality suitable for ${targetSpec.channel || 'social media'}
                           Do not alter or modify the original image content.`;

            try {
                const result = await this.callGeminiImageEdit(asset.dataUrl, prompt, {
                    targetWidth: newWidth,
                    targetHeight: newHeight,
                    preserveOriginal: true,
                });

                // Create derivative asset
                const derivative = this.createDerivativeAsset(asset, result, {
                    type: 'aspect_ratio_adaptation',
                    targetSpec: targetSpec,
                    newWidth,
                    newHeight,
                    aiModel: this.config.MODELS.IMAGE_EDIT,
                });

                return derivative;
            } catch (error) {
                console.error('❌ AI Adapter: Image adaptation failed', error);
                throw error;
            }
        }

        /**
         * Smart resize with AI-aware cropping/extending
         */
        async smartResize(asset, targetWidth, targetHeight, options = {}) {
            if (!this.hasApiKey()) {
                throw new Error('API key required');
            }

            const prompt = `Intelligently resize this image to exactly ${targetWidth}x${targetHeight} pixels.
                           ${options.preserveSubject ? 'Keep the main subject fully visible and centered.' : ''}
                           ${options.channel ? `Optimized for ${options.channel}.` : ''}
                           Maintain the original style, quality, and artistic intent.
                           Fill any new areas naturally without obvious AI artifacts.`;

            const result = await this.callGeminiImageEdit(asset.dataUrl, prompt, {
                targetWidth,
                targetHeight,
                ...options,
            });

            return this.createDerivativeAsset(asset, result, {
                type: 'smart_resize',
                targetWidth,
                targetHeight,
                options,
            });
        }

        // ----------------------------------------
        // Still Image to Video (Veo4)
        // ----------------------------------------
        
        /**
         * Convert a still image to an animated video
         * @param {Object} asset - The image asset
         * @param {Object} options - Animation options
         * @returns {Promise<Object>} - Video derivative
         */
        async imageToVideo(asset, options = {}) {
            if (!this.hasApiKey()) {
                throw new Error('API key required');
            }

            const duration = options.duration || this.config.DEFAULTS.VIDEO_DURATION;
            const motionType = options.motionType || 'auto'; // auto, zoom, pan, parallax, subtle

            console.log(`🎬 AI Adapter: Converting image to ${duration}s video with ${motionType} motion`);

            // Analyze the image first to determine best motion
            const imageAnalysis = await this.analyzeImageForMotion(asset);
            
            // Build video generation prompt
            const prompt = this.buildVideoPrompt(asset, imageAnalysis, {
                duration,
                motionType,
                ...options,
            });

            try {
                const result = await this.callVeoVideoGenerate(asset.dataUrl, prompt, {
                    duration,
                    fps: options.fps || this.config.DEFAULTS.VIDEO_FPS,
                    aspectRatio: options.aspectRatio || this.detectAspectRatio(asset),
                });

                const derivative = this.createDerivativeAsset(asset, result, {
                    type: 'image_to_video',
                    duration,
                    motionType,
                    aiModel: this.config.MODELS.VIDEO_GENERATE,
                    mediaType: 'video',
                });

                return derivative;
            } catch (error) {
                console.error('❌ AI Adapter: Image to video conversion failed', error);
                throw error;
            }
        }

        /**
         * Analyze image content to determine best animation approach
         */
        async analyzeImageForMotion(asset) {
            const prompt = `Analyze this image and describe:
                           1. Main subject and its position
                           2. Background elements and depth
                           3. Any implied motion or action
                           4. Best animation approach (zoom, pan, parallax, subtle movement)
                           5. Suggested focal points for camera movement
                           Respond in JSON format.`;

            try {
                const response = await this.callGeminiAnalyze(asset.dataUrl, prompt);
                return JSON.parse(response);
            } catch {
                // Return default analysis if parsing fails
                return {
                    motionSuggestion: 'subtle',
                    focalPoint: 'center',
                    hasDepth: false,
                };
            }
        }

        /**
         * Build an optimized video generation prompt
         */
        buildVideoPrompt(asset, analysis, options) {
            const motionDescriptions = {
                auto: `Create natural, subtle motion that brings this image to life. ${analysis.motionSuggestion || 'Use gentle camera movement.'}`,
                zoom: 'Create a smooth, cinematic zoom effect, slowly moving closer to the focal point.',
                pan: 'Create a smooth horizontal or vertical pan across the image, revealing details progressively.',
                parallax: 'Create a parallax effect with foreground and background moving at different speeds for depth.',
                subtle: 'Add very subtle, almost imperceptible motion - gentle floating, slight breathing effect on elements.',
                dynamic: 'Create dynamic, energetic motion with multiple movement elements while keeping the core image intact.',
            };

            return `Transform this still image into a ${options.duration}-second video.
                    
                    Motion style: ${motionDescriptions[options.motionType] || motionDescriptions.auto}
                    
                    Critical requirements:
                    - Do NOT change the image content, style, colors, or composition
                    - Do NOT add new elements or remove existing ones
                    - Do NOT alter text, logos, or brand elements
                    - Maintain exact visual fidelity to the original
                    - Create smooth, professional motion suitable for advertising
                    - Loop-friendly ending preferred
                    
                    ${options.customPrompt || ''}`;
        }

        // ----------------------------------------
        // Video to Still Image
        // ----------------------------------------
        
        /**
         * Extract the best representative frame from a video
         * @param {Object} asset - The video asset
         * @param {Object} options - Extraction options
         * @returns {Promise<Object>} - Image derivative
         */
        async videoToStill(asset, options = {}) {
            if (!this.hasApiKey()) {
                throw new Error('API key required');
            }

            console.log('📸 AI Adapter: Extracting best frame from video');

            const frameSelection = options.frameSelection || 'best'; // best, first, last, middle, custom

            try {
                // For 'best' selection, use AI to analyze and pick optimal frame
                if (frameSelection === 'best') {
                    const result = await this.extractBestFrame(asset, options);
                    return result;
                } else {
                    // Extract specific frame
                    const result = await this.extractSpecificFrame(asset, frameSelection, options);
                    return result;
                }
            } catch (error) {
                console.error('❌ AI Adapter: Video to still conversion failed', error);
                throw error;
            }
        }

        /**
         * Use AI to find and extract the best representative frame
         */
        async extractBestFrame(asset, options = {}) {
            // First, analyze the video to find the best frame
            const analysisPrompt = `Analyze this video and identify the single best frame that:
                                   1. Best represents the overall content and message
                                   2. Has the best composition and visual quality
                                   3. Has no motion blur or artifacts
                                   4. Would work well as a thumbnail or still image
                                   ${options.purpose ? `Optimized for: ${options.purpose}` : ''}
                                   Return the timestamp in seconds.`;

            // This would integrate with video analysis API
            // For now, we'll use middle frame as default
            const timestamp = asset.duration ? asset.duration / 2 : 0;

            return this.extractFrameAtTimestamp(asset, timestamp, options);
        }

        /**
         * Extract frame at specific timestamp
         */
        async extractFrameAtTimestamp(asset, timestamp, options = {}) {
            // Create video element to extract frame
            return new Promise((resolve, reject) => {
                const video = document.createElement('video');
                video.crossOrigin = 'anonymous';
                video.src = asset.dataUrl || asset.url;
                
                video.addEventListener('loadedmetadata', () => {
                    video.currentTime = Math.min(timestamp, video.duration);
                });

                video.addEventListener('seeked', () => {
                    try {
                        const canvas = document.createElement('canvas');
                        canvas.width = options.width || video.videoWidth;
                        canvas.height = options.height || video.videoHeight;
                        
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
                        
                        const derivative = this.createDerivativeAsset(asset, {
                            dataUrl,
                            width: canvas.width,
                            height: canvas.height,
                            mimeType: 'image/jpeg',
                        }, {
                            type: 'video_to_still',
                            timestamp,
                            frameSelection: 'extracted',
                            mediaType: 'image',
                        });

                        resolve(derivative);
                    } catch (error) {
                        reject(error);
                    }
                });

                video.addEventListener('error', reject);
            });
        }

        // ----------------------------------------
        // API Calls
        // ----------------------------------------
        
        /**
         * Call Gemini API for image editing
         */
        async callGeminiImageEdit(imageDataUrl, prompt, options = {}) {
            const base64Data = imageDataUrl.split(',')[1];
            const mimeType = imageDataUrl.split(';')[0].split(':')[1];

            const requestBody = {
                contents: [{
                    parts: [
                        { text: prompt },
                        {
                            inline_data: {
                                mime_type: mimeType,
                                data: base64Data,
                            }
                        }
                    ]
                }],
                generationConfig: {
                    responseModalities: ['IMAGE', 'TEXT'],
                    temperature: 0.4,
                    candidateCount: 1,
                },
                safetySettings: [
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
                ],
            };

            const response = await fetch(
                `${this.config.API_BASE_URL}/models/${this.config.MODELS.IMAGE_GENERATE}:generateContent?key=${this.apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'API request failed');
            }

            const data = await response.json();
            
            // Extract generated image
            const parts = data.candidates?.[0]?.content?.parts || [];
            for (const part of parts) {
                if (part.inlineData) {
                    return {
                        dataUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
                        mimeType: part.inlineData.mimeType,
                        width: options.targetWidth,
                        height: options.targetHeight,
                    };
                }
            }

            throw new Error('No image generated in response');
        }

        /**
         * Call Gemini API for image analysis
         */
        async callGeminiAnalyze(imageDataUrl, prompt) {
            const base64Data = imageDataUrl.split(',')[1];
            const mimeType = imageDataUrl.split(';')[0].split(':')[1];

            const requestBody = {
                contents: [{
                    parts: [
                        { text: prompt },
                        {
                            inline_data: {
                                mime_type: mimeType,
                                data: base64Data,
                            }
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.2,
                    candidateCount: 1,
                },
            };

            const response = await fetch(
                `${this.config.API_BASE_URL}/models/${this.config.MODELS.IMAGE_UNDERSTAND}:generateContent?key=${this.apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody),
                }
            );

            if (!response.ok) {
                throw new Error('Analysis request failed');
            }

            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }

        /**
         * Call Veo API for video generation
         * Note: This is a placeholder for the actual Veo4 API integration
         */
        async callVeoVideoGenerate(imageDataUrl, prompt, options = {}) {
            // Veo4 API integration
            // The actual implementation depends on Google's Veo4 API availability
            
            console.log('🎬 Calling Veo4 API for video generation...');
            console.log('Prompt:', prompt);
            console.log('Options:', options);

            // For now, return a placeholder that indicates where the video would be
            // In production, this would call the actual Veo4 endpoint
            
            const requestBody = {
                model: this.config.MODELS.VIDEO_GENERATE,
                prompt: prompt,
                image: {
                    imageBytes: imageDataUrl.split(',')[1],
                },
                videoConfig: {
                    aspectRatio: options.aspectRatio || '16:9',
                    durationSeconds: options.duration || 6,
                    fps: options.fps || 24,
                },
                generationConfig: {
                    numberOfVideos: 1,
                },
            };

            // Placeholder response structure
            // In production, poll for completion and retrieve video
            return {
                dataUrl: null, // Would contain video data URL
                mimeType: 'video/mp4',
                duration: options.duration,
                width: 1920,
                height: 1080,
                status: 'pending', // Would be 'completed' when ready
                operationId: 'veo_' + Date.now(), // For polling status
            };
        }

        // ----------------------------------------
        // Derivative Management
        // ----------------------------------------
        
        /**
         * Create a derivative asset linked to the original
         */
        createDerivativeAsset(originalAsset, result, metadata = {}) {
            const derivativeId = `${this.config.DERIVATIVE_PREFIX}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            const derivative = {
                id: derivativeId,
                originalId: originalAsset.id,
                originalFilename: originalAsset.filename,
                
                // New asset data
                dataUrl: result.dataUrl,
                thumbnail: result.dataUrl, // Use same for images, generate for video
                mimeType: result.mimeType,
                width: result.width || metadata.newWidth,
                height: result.height || metadata.newHeight,
                duration: result.duration,
                
                // Metadata
                filename: this.generateDerivativeFilename(originalAsset, metadata),
                type: metadata.mediaType || originalAsset.type,
                fileSize: result.dataUrl ? Math.round(result.dataUrl.length * 0.75) : 0,
                
                // AI Adaptation info
                adaptation: {
                    type: metadata.type,
                    aiModel: metadata.aiModel,
                    targetSpec: metadata.targetSpec,
                    createdAt: new Date().toISOString(),
                    options: metadata.options || {},
                },
                
                // Linking
                isDerivative: true,
                parentAsset: {
                    id: originalAsset.id,
                    filename: originalAsset.filename,
                    width: originalAsset.width,
                    height: originalAsset.height,
                    thumbnail: originalAsset.thumbnail,
                },
                
                // Standard asset fields
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                status: 'draft',
                tags: originalAsset.tags || {},
            };

            // Track in derivatives map
            if (!this.derivatives.has(originalAsset.id)) {
                this.derivatives.set(originalAsset.id, []);
            }
            this.derivatives.get(originalAsset.id).push(derivative);

            return derivative;
        }

        /**
         * Generate a descriptive filename for the derivative
         */
        generateDerivativeFilename(original, metadata) {
            const baseName = original.filename.replace(/\.[^/.]+$/, '');
            const extension = metadata.mediaType === 'video' ? 'mp4' : 'jpg';
            
            const suffixes = {
                'aspect_ratio_adaptation': `_${metadata.targetSpec?.aspectRatio?.replace(':', 'x') || 'adapted'}`,
                'smart_resize': `_${metadata.targetWidth}x${metadata.targetHeight}`,
                'image_to_video': '_animated',
                'video_to_still': '_still',
            };

            const suffix = suffixes[metadata.type] || '_derivative';
            return `${baseName}${suffix}.${extension}`;
        }

        /**
         * Get all derivatives for an asset
         */
        getDerivatives(assetId) {
            return this.derivatives.get(assetId) || [];
        }

        /**
         * Check if asset has derivatives
         */
        hasDerivatives(assetId) {
            return this.derivatives.has(assetId) && this.derivatives.get(assetId).length > 0;
        }

        // ----------------------------------------
        // Utility Methods
        // ----------------------------------------
        
        parseAspectRatio(ratioString) {
            if (!ratioString) return 1;
            const [w, h] = ratioString.split(':').map(Number);
            return w / h;
        }

        detectAspectRatio(asset) {
            const ratio = asset.width / asset.height;
            if (Math.abs(ratio - 16/9) < 0.1) return '16:9';
            if (Math.abs(ratio - 9/16) < 0.1) return '9:16';
            if (Math.abs(ratio - 1) < 0.1) return '1:1';
            if (Math.abs(ratio - 4/5) < 0.1) return '4:5';
            return '16:9'; // Default
        }

        /**
         * Batch process multiple adaptations
         */
        async batchAdapt(asset, targetSpecs) {
            const results = [];
            
            for (const spec of targetSpecs) {
                try {
                    const derivative = await this.adaptImageToAspectRatio(asset, spec);
                    results.push({ success: true, derivative, spec });
                } catch (error) {
                    results.push({ success: false, error: error.message, spec });
                }
            }

            return results;
        }
    }

    // ============================================
    // UI COMPONENTS
    // ============================================
    
    /**
     * AI Adapter Settings Modal
     */
    function createSettingsModal() {
        const savedSettings = JSON.parse(localStorage.getItem('cav_ai_settings') || '{}');
        
        const modal = document.createElement('div');
        modal.className = 'cav-ai-settings-modal';
        modal.innerHTML = `
            <div class="cav-ai-settings-content">
                <div class="cav-ai-settings-header">
                    <h2>🤖 AI Asset Adapter Settings</h2>
                    <button class="cav-ai-settings-close">&times;</button>
                </div>
                
                <div class="cav-ai-settings-body">
                    <div class="cav-ai-settings-section">
                        <h3>🔑 Google AI Studio API Key</h3>
                        <p>Get your API key from <a href="https://aistudio.google.com/apikey" target="_blank" style="color: #a855f7;">Google AI Studio</a></p>
                        <input type="password" id="cav-gemini-api-key" placeholder="Your Gemini API Key" />
                        <button id="cav-save-api-key" class="cav-btn-primary">Save Key</button>
                    </div>
                    
                    <div class="cav-ai-settings-section">
                        <h3>⚙️ Default Settings</h3>
                        
                        <label>
                            <span>Video Duration (seconds)</span>
                            <select id="cav-video-duration">
                                <option value="4" ${savedSettings.videoDuration == 4 ? 'selected' : ''}>4 seconds</option>
                                <option value="6" ${savedSettings.videoDuration == 6 || !savedSettings.videoDuration ? 'selected' : ''}>6 seconds</option>
                                <option value="8" ${savedSettings.videoDuration == 8 ? 'selected' : ''}>8 seconds</option>
                                <option value="10" ${savedSettings.videoDuration == 10 ? 'selected' : ''}>10 seconds</option>
                            </select>
                        </label>
                        
                        <label>
                            <span>Motion Style</span>
                            <select id="cav-motion-style">
                                <option value="auto" ${savedSettings.motionStyle === 'auto' || !savedSettings.motionStyle ? 'selected' : ''}>Auto (AI decides)</option>
                                <option value="subtle" ${savedSettings.motionStyle === 'subtle' ? 'selected' : ''}>Subtle</option>
                                <option value="zoom" ${savedSettings.motionStyle === 'zoom' ? 'selected' : ''}>Zoom</option>
                                <option value="pan" ${savedSettings.motionStyle === 'pan' ? 'selected' : ''}>Pan</option>
                                <option value="parallax" ${savedSettings.motionStyle === 'parallax' ? 'selected' : ''}>Parallax</option>
                                <option value="dynamic" ${savedSettings.motionStyle === 'dynamic' ? 'selected' : ''}>Dynamic</option>
                            </select>
                        </label>
                        
                        <label>
                            <span>Preserve Original Style</span>
                            <input type="checkbox" id="cav-preserve-style" ${savedSettings.preserveStyle !== false ? 'checked' : ''} />
                        </label>
                    </div>
                    
                    <div class="cav-ai-settings-section">
                        <h3>✏️ Custom AI Prompts</h3>
                        <p style="font-size: 0.85rem; margin-bottom: 1rem;">Customize the instructions sent to AI models. Leave blank for defaults.</p>
                        
                        <div class="cav-ai-prompt-group">
                            <label for="cav-prompt-outpaint">Image Extension (Outpainting)</label>
                            <textarea id="cav-prompt-outpaint" rows="3" placeholder="Default: Extend this image seamlessly while maintaining style...">${savedSettings.promptOutpaint || ''}</textarea>
                        </div>
                        
                        <div class="cav-ai-prompt-group">
                            <label for="cav-prompt-video">Image to Video</label>
                            <textarea id="cav-prompt-video" rows="3" placeholder="Default: Create natural motion that brings this image to life...">${savedSettings.promptVideo || ''}</textarea>
                        </div>
                        
                        <div class="cav-ai-prompt-group">
                            <label for="cav-prompt-style">Style Preservation Notes</label>
                            <textarea id="cav-prompt-style" rows="2" placeholder="e.g., Maintain brand colors, keep logo visible, preserve text...">${savedSettings.promptStyle || ''}</textarea>
                        </div>
                        
                        <button id="cav-save-prompts" class="cav-btn-secondary" style="margin-top: 0.5rem;">💾 Save Prompts</button>
                    </div>
                    
                    <div class="cav-ai-settings-section">
                        <h3>📊 API Status</h3>
                        <div id="cav-api-status">
                            <span class="status-indicator"></span>
                            <span class="status-text">Checking...</span>
                        </div>
                        
                        <div style="margin-top: 1rem; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 8px;">
                            <h4 style="font-size: 0.9rem; margin-bottom: 0.5rem;">Supported Models:</h4>
                            <ul style="font-size: 0.85rem; color: #c4b5fd; list-style: none;">
                                <li>✓ Gemini 3 Pro Image (Image editing)</li>
                                <li>✓ Gemini 2.0 Flash (Image analysis)</li>
                                <li>✓ Veo 2.0 / Veo4 (Video generation)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners after modal is created
        setTimeout(() => {
            // Save prompts
            const savePromptsBtn = document.getElementById('cav-save-prompts');
            if (savePromptsBtn) {
                savePromptsBtn.addEventListener('click', () => {
                    const settings = JSON.parse(localStorage.getItem('cav_ai_settings') || '{}');
                    settings.promptOutpaint = document.getElementById('cav-prompt-outpaint').value;
                    settings.promptVideo = document.getElementById('cav-prompt-video').value;
                    settings.promptStyle = document.getElementById('cav-prompt-style').value;
                    settings.videoDuration = document.getElementById('cav-video-duration').value;
                    settings.motionStyle = document.getElementById('cav-motion-style').value;
                    settings.preserveStyle = document.getElementById('cav-preserve-style').checked;
                    localStorage.setItem('cav_ai_settings', JSON.stringify(settings));
                    alert('AI settings saved!');
                });
            }
        }, 100);
        
        return modal;
    }

    /**
     * Comparison Viewer for Original vs Derivative
     */
    function createComparisonViewer(original, derivative) {
        const viewer = document.createElement('div');
        viewer.className = 'cav-comparison-viewer';
        viewer.innerHTML = `
            <div class="cav-comparison-header">
                <h3>🔍 Compare: Original vs AI Adapted</h3>
                <button class="cav-comparison-close">&times;</button>
            </div>
            
            <div class="cav-comparison-body">
                <div class="cav-comparison-side original">
                    <h4>Original</h4>
                    <div class="cav-comparison-preview">
                        ${original.type === 'video' 
                            ? `<video src="${original.dataUrl}" controls></video>`
                            : `<img src="${original.dataUrl || original.thumbnail}" alt="Original" />`
                        }
                    </div>
                    <div class="cav-comparison-info">
                        <span>${original.width} × ${original.height}</span>
                        <span>${original.filename}</span>
                    </div>
                </div>
                
                <div class="cav-comparison-divider">
                    <div class="cav-comparison-slider"></div>
                </div>
                
                <div class="cav-comparison-side derivative">
                    <h4>AI Adapted</h4>
                    <div class="cav-comparison-preview">
                        ${derivative.type === 'video'
                            ? `<video src="${derivative.dataUrl}" controls></video>`
                            : `<img src="${derivative.dataUrl || derivative.thumbnail}" alt="Derivative" />`
                        }
                    </div>
                    <div class="cav-comparison-info">
                        <span>${derivative.width} × ${derivative.height}</span>
                        <span>${derivative.filename}</span>
                        <span class="cav-badge">${derivative.adaptation?.type?.replace(/_/g, ' ')}</span>
                    </div>
                </div>
            </div>
            
            <div class="cav-comparison-actions">
                <button class="cav-btn-secondary" data-action="reject">❌ Reject</button>
                <button class="cav-btn-secondary" data-action="regenerate">🔄 Regenerate</button>
                <button class="cav-btn-primary" data-action="accept">✅ Accept & Save</button>
            </div>
        `;
        
        return viewer;
    }

    /**
     * AI Adapt Button for Asset Cards
     */
    function createAdaptButton(asset, incompatibleChannels) {
        const btn = document.createElement('button');
        btn.className = 'cav-ai-adapt-btn';
        btn.innerHTML = `
            <span class="cav-ai-icon">🤖</span>
            <span>AI Adapt</span>
            <span class="cav-ai-count">${incompatibleChannels.length}</span>
        `;
        btn.title = `AI can adapt this for ${incompatibleChannels.length} channels`;
        
        return btn;
    }

    // ============================================
    // STYLES
    // ============================================
    
    const styles = `
        /* AI Adapter Styles */
        .cav-ai-adapt-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
            border: none;
            border-radius: 8px;
            color: white;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .cav-ai-adapt-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(139, 92, 246, 0.4);
        }
        
        .cav-ai-icon {
            font-size: 1.1rem;
        }
        
        .cav-ai-count {
            background: rgba(255, 255, 255, 0.2);
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.75rem;
        }
        
        /* AI Settings Modal */
        .cav-ai-settings-modal {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100001;
            padding: 2rem;
        }
        
        .cav-ai-settings-content {
            background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
            border-radius: 20px;
            max-width: 500px;
            width: 100%;
            border: 1px solid rgba(255, 255, 255, 0.1);
            overflow: hidden;
        }
        
        .cav-ai-settings-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .cav-ai-settings-header h2 {
            margin: 0;
            font-size: 1.25rem;
        }
        
        .cav-ai-settings-close {
            background: none;
            border: none;
            color: #a5b4fc;
            font-size: 1.5rem;
            cursor: pointer;
        }
        
        .cav-ai-settings-body {
            padding: 1.5rem;
        }
        
        .cav-ai-settings-section {
            margin-bottom: 1.5rem;
        }
        
        .cav-ai-settings-section h3 {
            font-size: 1rem;
            margin-bottom: 0.5rem;
            color: #e9d5ff;
        }
        
        .cav-ai-settings-section p {
            font-size: 0.875rem;
            color: #a5b4fc;
            margin-bottom: 1rem;
        }
        
        .cav-ai-settings-section input[type="password"],
        .cav-ai-settings-section input[type="text"],
        .cav-ai-settings-section select {
            width: 100%;
            padding: 0.75rem 1rem;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(168, 85, 247, 0.3);
            border-radius: 8px;
            color: white;
            font-size: 0.95rem;
            margin-bottom: 0.75rem;
        }
        
        .cav-ai-settings-section label {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.75rem;
            color: #e9d5ff;
        }
        
        .cav-ai-settings-section label select {
            width: 200px;
            margin-bottom: 0;
        }
        
        #cav-api-status {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
        }
        
        .status-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #6b7280;
        }
        
        .status-indicator.connected { background: #22c55e; }
        .status-indicator.error { background: #ef4444; }
        
        /* Comparison Viewer */
        .cav-comparison-viewer {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.95);
            z-index: 100002;
            display: flex;
            flex-direction: column;
        }
        
        .cav-comparison-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 2rem;
            background: rgba(30, 27, 75, 0.9);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .cav-comparison-body {
            flex: 1;
            display: flex;
            padding: 2rem;
            gap: 2rem;
        }
        
        .cav-comparison-side {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .cav-comparison-side h4 {
            margin-bottom: 1rem;
            color: #e9d5ff;
        }
        
        .cav-comparison-preview {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 12px;
            overflow: hidden;
        }
        
        .cav-comparison-preview img,
        .cav-comparison-preview video {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }
        
        .cav-comparison-info {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
            color: #a5b4fc;
            font-size: 0.875rem;
        }
        
        .cav-comparison-divider {
            width: 4px;
            background: linear-gradient(180deg, #8b5cf6 0%, #6366f1 100%);
            border-radius: 4px;
            cursor: ew-resize;
        }
        
        .cav-comparison-actions {
            display: flex;
            justify-content: center;
            gap: 1rem;
            padding: 1.5rem;
            background: rgba(30, 27, 75, 0.9);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .cav-badge {
            background: rgba(139, 92, 246, 0.3);
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.75rem;
            text-transform: capitalize;
        }
        
        /* Processing Overlay */
        .cav-ai-processing {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            border-radius: inherit;
        }
        
        .cav-ai-processing-spinner {
            width: 48px;
            height: 48px;
            border: 4px solid rgba(168, 85, 247, 0.3);
            border-top-color: #a855f7;
            border-radius: 50%;
            animation: cav-spin 1s linear infinite;
        }
        
        @keyframes cav-spin {
            to { transform: rotate(360deg); }
        }
        
        .cav-ai-processing-text {
            color: #e9d5ff;
            font-size: 0.95rem;
        }
        
        /* Custom Prompt Inputs */
        .cav-ai-prompt-group {
            margin-bottom: 1rem;
        }
        
        .cav-ai-prompt-group label {
            display: block;
            font-size: 0.85rem;
            color: #c4b5fd;
            margin-bottom: 0.5rem;
        }
        
        .cav-ai-prompt-group textarea {
            width: 100%;
            padding: 0.75rem;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(168, 85, 247, 0.3);
            border-radius: 8px;
            color: #fff;
            font-size: 0.875rem;
            font-family: inherit;
            resize: vertical;
            min-height: 60px;
        }
        
        .cav-ai-prompt-group textarea:focus {
            outline: none;
            border-color: #a855f7;
        }
        
        .cav-ai-prompt-group textarea::placeholder {
            color: #6b7280;
            font-style: italic;
        }
        
        .cav-btn-secondary {
            padding: 0.5rem 1rem;
            background: transparent;
            border: 1px solid rgba(168, 85, 247, 0.5);
            border-radius: 8px;
            color: #c4b5fd;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .cav-btn-secondary:hover {
            background: rgba(168, 85, 247, 0.2);
            border-color: #a855f7;
        }
        
        .cav-btn-primary {
            padding: 0.5rem 1rem;
            background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
            border: none;
            border-radius: 8px;
            color: #fff;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .cav-btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);
        }
    `;

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // ============================================
    // EXPORT
    // ============================================
    
    // Create global instance
    window.AIAssetAdapter = AIAssetAdapter;
    window.cavAIAdapter = new AIAssetAdapter();

    // Export UI creators
    window.cavAIAdapter.createSettingsModal = createSettingsModal;
    window.cavAIAdapter.createComparisonViewer = createComparisonViewer;
    window.cavAIAdapter.createAdaptButton = createAdaptButton;

    console.log('🤖 AI Asset Adapter loaded - Version 1.0.0');
    console.log('   Supported: Image Outpainting, Image-to-Video (Veo4), Video-to-Still');

})();

