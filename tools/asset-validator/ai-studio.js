/**
 * AI Studio Interface - Official Google Gemini API
 * =================================================
 * Version 2.6.0 - January 17, 2026
 * - Added shared API key support from admin settings
 * - Added multi-image generation (up to 8 images)
 * - Added Google Ads PMax preset sizes
 * - Improved UI for multiple image display
 * 
 * Based on official Google Gemini API documentation (Dec 2025):
 * - https://ai.google.dev/gemini-api/docs/imagen
 * - https://ai.google.dev/gemini-api/docs/video
 * - https://ai.google.dev/gemini-api/docs/thinking
 * - https://github.com/google-gemini/veo-3-nano-banana-gemini-api-quickstart
 * 
 * Models:
 * - Nano Banana (gemini-2.5-flash-image) - Fast image generation
 * - Nano Banana Pro (gemini-3-pro-image-preview) - Advanced 4K images with thinking
 * - Veo 3.1 (veo-3.1-generate-preview) - Video with native audio
 * - Veo 3.1 Fast (veo-3.1-fast-generate-preview) - Fast video generation
 * - Gemini 3 Flash (gemini-3-flash-preview) - Analysis and extraction
 * 
 * Features:
 * - Prompt input with system instructions
 * - Model selection with official model IDs
 * - Temperature, aspect ratio, resolution controls
 * - Thinking level configuration for Gemini 3
 * - Google Search grounding support
 * - Real-time generation preview
 * - History of generations
 */

(function() {
    'use strict';

    // ============================================
    // STORAGE KEYS
    // ============================================
    const AI_STORAGE = {
        API_KEY: 'cav_ai_api_key',
        SETTINGS: 'cav_ai_studio_settings',
        HISTORY: 'cav_ai_generation_history',
    };
    
    // Google Ads Performance Max (PMax) Image Specifications
    // Source: https://support.google.com/google-ads/answer/10724817
    const PMAX_SPECS = {
        'pmax-landscape': { width: 1200, height: 628, aspectRatio: '1.91:1', name: 'Landscape', minWidth: 600, minHeight: 314 },
        'pmax-square': { width: 1200, height: 1200, aspectRatio: '1:1', name: 'Square', minWidth: 300, minHeight: 300 },
        'pmax-portrait': { width: 960, height: 1200, aspectRatio: '4:5', name: 'Portrait', minWidth: 480, minHeight: 600 },
        'pmax-logo-square': { width: 1200, height: 1200, aspectRatio: '1:1', name: 'Logo Square', minWidth: 128, minHeight: 128 },
        'pmax-logo-landscape': { width: 1200, height: 300, aspectRatio: '4:1', name: 'Logo Landscape', minWidth: 512, minHeight: 128 },
    };
    
    // Helper function to get PMax aspect ratio for API
    function getPMaxAspectRatio(pmaxType) {
        if (pmaxType === 'pmax-all') {
            return null; // Will generate multiple
        }
        const spec = PMAX_SPECS[pmaxType];
        return spec ? spec.aspectRatio : null;
    }

    // ============================================
    // AI MODELS CONFIGURATION - Official Google API (Dec 2025)
    // Based on: https://ai.google.dev/gemini-api/docs/imagen
    //           https://ai.google.dev/gemini-api/docs/video
    // ============================================
    const AI_MODELS = {
        // Nano Banana - Fast image generation (Gemini 2.5 Flash Image)
        'gemini-2.5-flash-image': {
            name: 'Nano Banana',
            subtitle: 'gemini-2.5-flash-image',
            description: 'Fast, efficient image generation. 1024px max resolution. Best for high-volume, low-latency tasks.',
            capabilities: ['image_generation', 'image_editing', 'text_rendering'],
            icon: '🍌',
            color: '#f59e0b',
            endpoints: {
                generate: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent',
            },
            maxTokens: 32768,
            supportsAspectRatio: true,
            supportsResolution: false,
            maxInputImages: 3,
            resolution: '1K',
            aspectRatios: ['1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9'],
        },
        // Nano Banana Pro - Advanced image generation (Gemini 3 Pro Image)
        'gemini-3-pro-image-preview': {
            name: 'Nano Banana Pro',
            subtitle: 'gemini-3-pro-image-preview',
            description: 'State-of-the-art image generation. Up to 4K resolution. Google Search grounding. "Thinking" mode.',
            capabilities: ['image_generation', 'image_editing', 'outpainting', 'aspect_ratio_change', 'grounding', 'thinking'],
            icon: '🖼️',
            color: '#a855f7',
            endpoints: {
                generate: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent',
            },
            maxTokens: 32768,
            supportsAspectRatio: true,
            supportsResolution: true,
            maxInputImages: 14, // 6 objects + 5 humans + 3 style
            resolutions: ['1K', '2K', '4K'],
            aspectRatios: ['1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9'],
        },
        // Veo 3.1 - Video generation with native audio
        // Docs: https://ai.google.dev/gemini-api/docs/video
        // Quickstart: https://github.com/google-gemini/veo-3-nano-banana-gemini-api-quickstart
        'veo-3.1-generate-preview': {
            name: 'Veo 3.1',
            subtitle: 'veo-3.1-generate-preview',
            description: 'State-of-the-art video generation with native audio. 720p/1080p. 4-8 seconds, extendable to 148s.',
            capabilities: ['text_to_video', 'image_to_video', 'video_extension', 'native_audio', 'reference_images', 'interpolation'],
            icon: '🎬',
            color: '#22c55e',
            // Uses SDK: ai.models.generateVideos() - async polling required
            sdkMethod: 'generateVideos',
            paidOnly: true, // Veo requires billing-enabled API key
            maxDuration: 148, // With extensions
            baseDuration: 8,
            durationOptions: [4, 6, 8],
            supportsMotionStyle: true,
            supportsAudio: true,
            supportsReferenceImages: true,
            maxReferenceImages: 3,
            resolutions: ['720p', '1080p'], // 1080p only for 8s duration
            aspectRatios: ['16:9', '9:16'],
            frameRate: 24,
            // Limitations per docs:
            // - Request latency: Min 11s, Max 6 minutes
            // - Videos stored for 2 days then deleted
            // - SynthID watermarking applied
        },
        // Veo 3.1 Fast - Faster video generation
        'veo-3.1-fast-generate-preview': {
            name: 'Veo 3.1 Fast',
            subtitle: 'veo-3.1-fast-generate-preview',
            description: 'Fast video generation optimized for speed. Best for rapid A/B testing, ads, and social content.',
            capabilities: ['text_to_video', 'image_to_video', 'native_audio'],
            icon: '⚡',
            color: '#10b981',
            sdkMethod: 'generateVideos',
            paidOnly: true,
            maxDuration: 8,
            durationOptions: [4, 6, 8],
            supportsAudio: true,
            resolutions: ['720p', '1080p'],
            aspectRatios: ['16:9', '9:16'],
            frameRate: 24,
        },
        // Gemini 3 Flash - Analysis, extraction, and image generation
        'gemini-3-flash-preview': {
            name: 'Gemini 3 Flash',
            subtitle: 'gemini-3-flash-preview',
            description: 'Fast multimodal model for analysis, extraction, content understanding, and image generation.',
            capabilities: ['video_to_still', 'image_analysis', 'content_extraction', 'text_analysis', 'document_understanding', 'image_generation'],
            icon: '⚡',
            color: '#3b82f6',
            endpoints: {
                analyze: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent',
            },
        },
    };

    // ============================================
    // DEFAULT SETTINGS
    // ============================================
    const DEFAULT_SETTINGS = {
        selectedModel: 'gemini-3-pro-image-preview', // Nano Banana Pro
        temperature: 1.0,
        aspectRatio: 'auto',
        numImages: 1,
        resolution: '1K',
        outputLength: 32768,
        topP: 0.95,
        systemInstructions: '',
        groundingEnabled: false,
        thinkingLevel: 'high', // Gemini 3 thinking level
    };

    // ============================================
    // AI STUDIO CLASS
    // ============================================
    class AIStudio {
        constructor() {
            this.apiKey = this.loadApiKey();
            this.apiKeySource = 'none';
            this.settings = this.loadSettings();
            this.history = this.loadHistory();
            this.isGenerating = false;
            this.currentAsset = null;
        }
        
        // Load API key - check shared first, then user's own
        loadApiKey() {
            // First check for shared Gemini key from platform settings
            try {
                if (window.CAVSettings?.manager?.accessControl) {
                    const sharedKeyResult = window.CAVSettings.manager.accessControl.getAPIKey('gemini', window.CAVSettings.manager);
                    if (sharedKeyResult?.key && sharedKeyResult.key.length > 10) {
                        console.log('[AI Studio] ✅ Using shared Gemini API key from admin');
                        this.apiKeySource = 'shared';
                        return sharedKeyResult.key;
                    }
                }
                
                // Also check settings manager directly for Gemini key
                if (window.CAVSettings?.manager?.getAPIKey) {
                    const geminiKey = window.CAVSettings.manager.getAPIKey('gemini');
                    if (geminiKey && geminiKey.length > 10) {
                        console.log('[AI Studio] ✅ Using Gemini API key from settings');
                        this.apiKeySource = 'settings';
                        return geminiKey;
                    }
                }
            } catch (e) {
                console.warn('[AI Studio] Error loading shared key:', e);
            }
            
            // Fall back to user's own AI Studio key
            const userKey = localStorage.getItem(AI_STORAGE.API_KEY) || '';
            if (userKey && userKey.length > 10) {
                console.log('[AI Studio] Using user\'s own AI Studio API key');
                this.apiKeySource = 'own';
            }
            return userKey;
        }
        
        // Refresh API key (useful after login or settings change)
        refreshApiKey() {
            this.apiKey = this.loadApiKey();
            return this.apiKey;
        }
        
        // Check if using shared key
        isUsingSharedKey() {
            return this.apiKeySource === 'shared' || this.apiKeySource === 'settings';
        }

        loadSettings() {
            try {
                const saved = localStorage.getItem(AI_STORAGE.SETTINGS);
                return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : { ...DEFAULT_SETTINGS };
            } catch {
                return { ...DEFAULT_SETTINGS };
            }
        }

        saveSettings() {
            localStorage.setItem(AI_STORAGE.SETTINGS, JSON.stringify(this.settings));
        }

        loadHistory() {
            try {
                return JSON.parse(localStorage.getItem(AI_STORAGE.HISTORY) || '[]');
            } catch {
                return [];
            }
        }

        saveHistory() {
            try {
                // Strip large base64 data from history to prevent quota issues
                const cleanHistory = this.history.slice(0, 30).map(entry => {
                    const clean = { ...entry };
                    // Remove large base64 data
                    delete clean.result;
                    delete clean.imageData;
                    delete clean.videoData;
                    delete clean.base64;
                    // Keep only essential settings
                    if (clean.settings) {
                        clean.settings = {
                            selectedModel: clean.settings.selectedModel,
                            aspectRatio: clean.settings.aspectRatio,
                            resolution: clean.settings.resolution,
                        };
                    }
                    return clean;
                });
                localStorage.setItem(AI_STORAGE.HISTORY, JSON.stringify(cleanHistory));
            } catch (e) {
                console.warn('⚠️ Failed to save AI history (quota exceeded), clearing old entries:', e.message);
                // If quota exceeded, clear history and try again
                try {
                    this.history = this.history.slice(0, 10);
                    localStorage.setItem(AI_STORAGE.HISTORY, JSON.stringify(this.history));
                } catch {
                    // Last resort: clear all history
                    localStorage.removeItem(AI_STORAGE.HISTORY);
                    this.history = [];
                }
            }
        }

        setApiKey(key) {
            this.apiKey = key;
            this.apiKeySource = 'own';
            localStorage.setItem(AI_STORAGE.API_KEY, key);
        }

        getApiKey() {
            // Refresh to get latest shared key if available
            if (!this.apiKey || this.apiKey.length < 10) {
                this.refreshApiKey();
            }
            return this.apiKey;
        }

        hasApiKey() {
            // Refresh to check for shared keys
            if (!this.apiKey || this.apiKey.length < 10) {
                this.refreshApiKey();
            }
            return !!this.apiKey && this.apiKey.length > 10;
        }

        updateSetting(key, value) {
            this.settings[key] = value;
            this.saveSettings();
        }

        // ----------------------------------------
        // IMAGE GENERATION / EDITING
        // ----------------------------------------
        async generateImage(prompt, options = {}) {
            if (!this.hasApiKey()) {
                throw new Error('API key required. Configure in AI Studio settings.');
            }

            this.isGenerating = true;
            
            // Get the selected model, default to Nano Banana Pro
            const selectedModelKey = this.settings.selectedModel || 'gemini-3-pro-image-preview';
            const model = AI_MODELS[selectedModelKey] || AI_MODELS['gemini-3-pro-image-preview'];
            
            if (!model) {
                throw new Error(`Model ${selectedModelKey} not found`);
            }
            
            // Ensure the model has a generate endpoint
            const endpoint = model.endpoints?.generate || model.endpoints?.analyze;
            if (!endpoint) {
                throw new Error(`Model ${model.name} does not support generation. Try Nano Banana or Nano Banana Pro.`);
            }
            
            console.log(`🖼️ Generating image with ${model.name}...`);
            console.log('   Prompt:', prompt);
            console.log('   Settings:', this.settings);

            try {
                const requestBody = {
                    contents: [{
                        parts: [{
                            text: this.settings.systemInstructions 
                                ? `${this.settings.systemInstructions}\n\n${prompt}`
                                : prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: this.settings.temperature,
                        responseModalities: ["TEXT", "IMAGE"],
                    },
                };
                
                // Add aspect ratio if supported and configured
                if (model.supportsAspectRatio && this.settings.aspectRatio && this.settings.aspectRatio !== 'auto') {
                    let apiAspectRatio = this.settings.aspectRatio;
                    
                    // Handle PMax presets - convert to API-compatible aspect ratios
                    if (this.settings.aspectRatio.startsWith('pmax-') && this.settings.aspectRatio !== 'pmax-all') {
                        const pmaxSpec = PMAX_SPECS[this.settings.aspectRatio];
                        if (pmaxSpec) {
                            // Map PMax aspect ratios to closest API-supported ratios
                            const ratioMap = {
                                '1.91:1': '16:9',  // Close enough for landscape
                                '1:1': '1:1',
                                '4:5': '4:5',
                                '4:1': '4:3',  // For logo, use wider
                            };
                            apiAspectRatio = ratioMap[pmaxSpec.aspectRatio] || '1:1';
                        }
                    }
                    
                    if (apiAspectRatio !== 'pmax-all') {
                        requestBody.generationConfig.imageConfig = {
                            aspectRatio: apiAspectRatio,
                        };
                        
                        // Add resolution if supported
                        if (model.supportsResolution && this.settings.resolution) {
                            requestBody.generationConfig.imageConfig.imageSize = this.settings.resolution;
                        }
                    }
                }

                // Add image if provided (for editing)
                if (options.sourceImage) {
                    requestBody.contents[0].parts.unshift({
                        inlineData: {
                            mimeType: options.sourceImage.mimeType || 'image/jpeg',
                            data: options.sourceImage.base64,
                        }
                    });
                }

                const response = await fetch(
                    `${endpoint}?key=${this.apiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(requestBody),
                    }
                );

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error?.message || 'Generation failed');
                }

                const result = await response.json();
                console.log('📥 API Response:', result);
                
                // Process the response to extract image and text
                const processedResult = {
                    success: true,
                    model: selectedModelKey,
                    modelName: model.name,
                    text: null,
                    images: [],
                    raw: result
                };
                
                // Extract parts from response
                if (result.candidates && result.candidates[0]?.content?.parts) {
                    for (const part of result.candidates[0].content.parts) {
                        if (part.text) {
                            processedResult.text = part.text;
                        }
                        if (part.inlineData) {
                            processedResult.images.push({
                                mimeType: part.inlineData.mimeType,
                                data: part.inlineData.data,
                                dataUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
                            });
                        }
                    }
                }
                
                // Log to history
                this.addToHistory({
                    type: 'image_generation',
                    model: selectedModelKey,
                    modelName: model.name,
                    prompt,
                    settings: { ...this.settings },
                    result: processedResult,
                    timestamp: new Date().toISOString(),
                });

                console.log(`✅ ${model.name} generation complete:`, 
                    processedResult.images.length, 'image(s)',
                    processedResult.text ? 'with text' : '');
                return processedResult;

            } catch (error) {
                console.error('❌ Generation failed:', error);
                throw error;
            } finally {
                this.isGenerating = false;
            }
        }

        // ----------------------------------------
        // MULTI-IMAGE GENERATION (up to 8 images)
        // ----------------------------------------
        async generateMultipleImages(prompt, options = {}) {
            const numImages = this.settings.numImages || 1;
            const aspectRatio = this.settings.aspectRatio;
            
            console.log(`🎨 Generating ${numImages} image(s)...`);
            
            // Special handling for PMax All - generates 3 sizes
            if (aspectRatio === 'pmax-all') {
                return this.generatePMaxSet(prompt, options);
            }
            
            // Generate multiple images sequentially to avoid rate limits
            const results = {
                success: true,
                images: [],
                texts: [],
                pmaxSizes: null,
                model: this.settings.selectedModel,
            };
            
            for (let i = 0; i < numImages; i++) {
                try {
                    console.log(`   Generating image ${i + 1}/${numImages}...`);
                    const result = await this.generateImage(prompt, options);
                    if (result.images?.length > 0) {
                        results.images.push(...result.images.map((img, idx) => ({
                            ...img,
                            index: results.images.length + idx,
                            variation: i + 1,
                        })));
                    }
                    if (result.text) {
                        results.texts.push(result.text);
                    }
                    
                    // Small delay between requests to avoid rate limits
                    if (i < numImages - 1) {
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                } catch (error) {
                    console.error(`   Failed to generate image ${i + 1}:`, error);
                    // Continue with remaining images
                }
            }
            
            console.log(`✅ Generated ${results.images.length} images total`);
            return results;
        }

        // ----------------------------------------
        // GOOGLE ADS PMAX SET GENERATION
        // Generates landscape (1.91:1), square (1:1), and portrait (4:5)
        // ----------------------------------------
        async generatePMaxSet(prompt, options = {}) {
            console.log('📢 Generating Google Ads PMax image set...');
            
            const pmaxSizes = [
                { key: 'pmax-landscape', name: 'Landscape', aspectRatio: '16:9', dimensions: '1200×628' },
                { key: 'pmax-square', name: 'Square', aspectRatio: '1:1', dimensions: '1200×1200' },
                { key: 'pmax-portrait', name: 'Portrait', aspectRatio: '4:5', dimensions: '960×1200' },
            ];
            
            const results = {
                success: true,
                images: [],
                texts: [],
                pmaxSizes: pmaxSizes,
                model: this.settings.selectedModel,
            };
            
            // Temporarily override aspect ratio for each generation
            const originalAspectRatio = this.settings.aspectRatio;
            
            for (const size of pmaxSizes) {
                try {
                    console.log(`   Generating ${size.name} (${size.dimensions})...`);
                    this.settings.aspectRatio = size.aspectRatio;
                    
                    const result = await this.generateImage(prompt, options);
                    if (result.images?.length > 0) {
                        results.images.push({
                            ...result.images[0],
                            pmaxType: size.key,
                            pmaxName: size.name,
                            pmaxDimensions: size.dimensions,
                            pmaxAspectRatio: size.aspectRatio,
                        });
                    }
                    if (result.text) {
                        results.texts.push(`${size.name}: ${result.text}`);
                    }
                    
                    // Small delay between requests
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch (error) {
                    console.error(`   Failed to generate ${size.name}:`, error);
                }
            }
            
            // Restore original aspect ratio
            this.settings.aspectRatio = originalAspectRatio;
            
            console.log(`✅ PMax set complete: ${results.images.length}/3 images generated`);
            return results;
        }

        // ----------------------------------------
        // CLOUDINARY RESIZE (for exact PMax dimensions)
        // ----------------------------------------
        async resizeForPMax(imageBase64, targetSize) {
            const spec = PMAX_SPECS[targetSize];
            if (!spec) {
                console.warn(`Unknown PMax size: ${targetSize}`);
                return imageBase64;
            }
            
            // Check if Cloudinary is available
            if (window.cavCloudinaryClient?.hasCredentials()) {
                try {
                    console.log(`📐 Resizing to ${spec.width}×${spec.height} via Cloudinary...`);
                    
                    // Upload and transform via Cloudinary
                    const result = await window.cavCloudinaryClient.uploadAndTransform(
                        imageBase64,
                        {
                            width: spec.width,
                            height: spec.height,
                            crop: 'fill',
                            quality: 'auto:best',
                        }
                    );
                    
                    return result.secure_url || result.url || imageBase64;
                } catch (e) {
                    console.warn('Cloudinary resize failed, returning original:', e);
                }
            }
            
            return imageBase64;
        }

        // ----------------------------------------
        // IMAGE OUTPAINTING (Extend to new aspect ratio)
        // ----------------------------------------
        async outpaintImage(imageBase64, targetAspectRatio, customPrompt = '') {
            if (!this.hasApiKey()) {
                throw new Error('API key required. Configure in AI Studio settings.');
            }

            this.isGenerating = true;
            
            const prompt = customPrompt || 
                `Extend this image to fit a ${targetAspectRatio} aspect ratio. ` +
                `Seamlessly continue the existing content, style, colors, and composition. ` +
                `Do not change the original image content - only add new content to fill the extended areas. ` +
                `Maintain perfect visual continuity.`;

            console.log('🖼️ Outpainting image to', targetAspectRatio);

            try {
                const result = await this.generateImage(prompt, {
                    sourceImage: {
                        base64: imageBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
                        mimeType: 'image/jpeg',
                    }
                });

                return result;
            } finally {
                this.isGenerating = false;
            }
        }

        // ----------------------------------------
        // VIDEO GENERATION (Veo 3.1) - Based on official Google documentation
        // https://ai.google.dev/gemini-api/docs/video
        // https://github.com/google-gemini/veo-3-nano-banana-gemini-api-quickstart
        // ----------------------------------------
        async generateVideo(prompt, options = {}) {
            if (!this.hasApiKey()) {
                throw new Error('API key required. Configure in AI Studio settings.');
            }

            this.isGenerating = true;
            
            // Support both Veo 3.1 and Veo 3.1 Fast
            const useFastModel = this.settings.selectedModel === 'veo-3.1-fast-generate-preview';
            const modelName = useFastModel ? 'veo-3.1-fast-generate-preview' : 'veo-3.1-generate-preview';
            const modelDisplayName = useFastModel ? 'Veo 3.1 Fast' : 'Veo 3.1';
            
            const imageBase64 = options.sourceImage?.base64 || null;
            const hasImage = !!imageBase64;
            
            // Get aspect ratio - Veo only supports 16:9 and 9:16
            let aspectRatio = this.settings.aspectRatio;
            if (aspectRatio === 'auto' || !['16:9', '9:16'].includes(aspectRatio)) {
                aspectRatio = '16:9'; // Default to landscape
            }
            
            // Resolution: Veo only supports 720p or 1080p (NOT 1K, 2K, 4K like images)
            // Convert image resolution to video resolution if needed
            let resolution = this.settings.resolution || '720p';
            if (!['720p', '1080p'].includes(resolution)) {
                // Image resolutions need to be converted to video resolutions
                // 512px, 1K -> 720p, 2K+ -> 1080p
                if (resolution === '4K' || resolution === '2K' || resolution === '4096px' || resolution === '2048px') {
                    resolution = '1080p';
                } else {
                    resolution = '720p'; // Default for 512px, 1K, or any other value
                }
                console.log(`📐 Converted image resolution "${this.settings.resolution}" to video resolution "${resolution}"`);
            }

            const fullPrompt = this.settings.systemInstructions
                ? `${this.settings.systemInstructions}\n\n${prompt}`
                : prompt;

            console.log(`🎬 Generating video with ${modelDisplayName}...`);
            console.log('   Mode:', hasImage ? 'Image-to-Video' : 'Text-to-Video');
            console.log('   Prompt:', fullPrompt);
            console.log('   Aspect Ratio:', aspectRatio);
            console.log('   Resolution:', resolution);

            try {
                // Check if GoogleGenAI SDK is available
                if (window.GoogleGenAI) {
                    console.log(`🎥 Using Google GenAI SDK for ${modelDisplayName}...`);
                    
                    const ai = new window.GoogleGenAI({ apiKey: this.apiKey });
                    
                    // Build payload per official documentation
                    const generateVideoPayload = {
                        model: modelName,
                        prompt: fullPrompt,
                        config: {
                            numberOfVideos: 1,
                            resolution: resolution,
                            aspectRatio: aspectRatio,
                        }
                    };
                    
                    // Add image if available (image-to-video)
                    // Per docs: image parameter for initial frame
                    if (hasImage) {
                        const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
                        generateVideoPayload.image = {
                            imageBytes: cleanBase64,
                            mimeType: options.sourceImage?.mimeType || 'image/jpeg'
                        };
                        console.log('📷 Using source image for image-to-video');
                    } else {
                        console.log('📝 Text-to-video mode (no source image)');
                    }
                    
                    console.log('📤 Submitting video generation request...', generateVideoPayload);
                    let operation = await ai.models.generateVideos(generateVideoPayload);
                    console.log('⏳ Video generation operation started:', operation);
                    
                    // Poll until done - per docs, check operation.done
                    let pollCount = 0;
                    const maxPolls = 60; // 10 minutes max (Veo can take up to 6 minutes)
                    while (!operation.done && pollCount < maxPolls) {
                        await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second intervals
                        pollCount++;
                        console.log(`⏳ Generating video... (${pollCount * 10}s elapsed)`);
                        
                        try {
                            operation = await ai.operations.getVideosOperation({ operation: operation });
                        } catch (pollError) {
                            console.warn('Poll error (retrying):', pollError);
                        }
                    }
                    
                    console.log('📦 Operation result:', JSON.stringify(operation, null, 2));
                    
                    if (operation?.response) {
                        // Handle both camelCase and snake_case property names
                        const videos = operation.response.generatedVideos || 
                                      operation.response.generated_videos ||
                                      [];
                        
                        console.log(`📹 Found ${videos.length} generated video(s)`);
                        
                        if (videos.length > 0) {
                            const firstVideo = videos[0];
                            const videoObj = firstVideo?.video || firstVideo;
                            const videoUri = videoObj?.uri;
                            
                            console.log('📦 Video object:', videoObj);
                            
                            if (videoUri) {
                                console.log('📥 Fetching video from:', videoUri);
                                
                                // Try SDK download first, then fallback to fetch
                                let videoBlob = null;
                                
                                try {
                                    // Use SDK's files.download if available
                                    if (ai.files?.download && videoObj) {
                                        console.log('📥 Using SDK files.download...');
                                        await ai.files.download({ file: videoObj });
                                        // SDK should save the file, but we need a URL for display
                                    }
                                } catch (downloadErr) {
                                    console.warn('SDK download not available:', downloadErr.message);
                                }
                                
                                // Fallback: Direct fetch
                                if (!videoBlob) {
                                    const decodedUri = decodeURIComponent(videoUri);
                                    const fetchUrl = decodedUri.includes('?') 
                                        ? `${decodedUri}&key=${this.apiKey}`
                                        : `${decodedUri}?key=${this.apiKey}`;
                                    
                                    console.log('📥 Fetching video via URL...');
                                    const res = await fetch(fetchUrl);
                                    
                                    if (!res.ok) {
                                        throw new Error(`Failed to download video: ${res.status} ${res.statusText}`);
                                    }
                                    
                                    videoBlob = await res.blob();
                                }
                                
                                if (videoBlob) {
                                    const objectUrl = URL.createObjectURL(videoBlob);
                                    console.log(`✅ ${modelDisplayName} video generation successful!`);
                                    
                                    // Log to history (without large data)
                                    this.addToHistory({
                                        type: 'video_generation',
                                        model: modelName,
                                        modelName: modelDisplayName,
                                        prompt: fullPrompt,
                                        mode: hasImage ? 'image-to-video' : 'text-to-video',
                                        aspectRatio: aspectRatio,
                                        resolution: resolution,
                                        timestamp: new Date().toISOString(),
                                        status: 'completed',
                                    });
                                    
                                    return {
                                        success: true,
                                        model: modelName,
                                        modelName: modelDisplayName,
                                        mode: hasImage ? 'image-to-video' : 'text-to-video',
                                        videoUrl: objectUrl,
                                        videoBlob: videoBlob,
                                        text: null,
                                        images: [],
                                    };
                                }
                            } else {
                                console.error('❌ No video URI in response:', firstVideo);
                            }
                        } else {
                            console.error('❌ No videos in response. Full response:', operation.response);
                            
                            // Check for error/blocked reason
                            if (operation.response.blockedReason) {
                                throw new Error(`Video blocked: ${operation.response.blockedReason}`);
                            }
                        }
                    } else {
                        console.error('❌ No response in operation:', operation);
                        
                        // Check if operation has error
                        if (operation?.error) {
                            throw new Error(`Generation error: ${operation.error.message || JSON.stringify(operation.error)}`);
                        }
                    }
                    
                    // If we get here, something went wrong
                    throw new Error(
                        'Video generation completed but no video was returned.\n\n' +
                        'Possible reasons:\n' +
                        '• The prompt may have been blocked by safety filters\n' +
                        '• Audio processing issues (Veo 3.1 includes audio)\n' +
                        '• API quota or permission issues\n\n' +
                        'Try a different prompt or check your API access at https://aistudio.google.com'
                    );
                }
                
                // Fallback: REST API (note: video generation is async and needs polling)
                console.log('⚠️ GoogleGenAI SDK not available, trying REST API...');
                throw new Error(
                    'Video generation requires the Google GenAI SDK.\n\n' +
                    'The SDK should auto-load. Please refresh the page and try again.\n' +
                    'Alternatively, use Google AI Studio directly: https://aistudio.google.com'
                );

            } catch (error) {
                console.error('❌ Video generation failed:', error);
                
                // Provide helpful error messages
                let userMessage = error.message;
                
                if (error.message.includes('Requested entity was not found')) {
                    userMessage = 'Model not found. Your API key may not have access to Veo 3.1.\n\n' +
                        'Veo is a paid-only model. Make sure:\n' +
                        '• Your API key has billing enabled\n' +
                        '• You have access to Veo models\n\n' +
                        'Check your access at https://aistudio.google.com';
                } else if (error.message.includes('API_KEY_INVALID') || error.message.includes('permission')) {
                    userMessage = 'Invalid API key or permission denied.\n\n' +
                        'Please configure a valid, billing-enabled API key in Settings.';
                } else if (error.message.includes('CORS') || error.message.includes('fetch')) {
                    userMessage = 'Network error during video generation.\n\n' +
                        'Try refreshing the page or use Google AI Studio directly:\n' +
                        'https://aistudio.google.com';
                }
                
                throw new Error(userMessage);
            } finally {
                this.isGenerating = false;
            }
        }

        // ----------------------------------------
        // CONTENT ANALYSIS (Gemini 2.0 Flash)
        // ----------------------------------------
        async analyzeContent(prompt, options = {}) {
            if (!this.hasApiKey()) {
                throw new Error('API key required. Configure in AI Studio settings.');
            }

            this.isGenerating = true;
            const model = AI_MODELS['gemini-3-flash-preview'];
            const endpoint = model.endpoints.analyze;
            
            console.log('🔍 Analyzing content with Gemini 3 Flash...');
            console.log('   Prompt:', prompt);

            try {
                const requestBody = {
                    contents: [{
                        parts: [{
                            text: this.settings.systemInstructions 
                                ? `${this.settings.systemInstructions}\n\n${prompt}`
                                : prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: this.settings.temperature,
                        maxOutputTokens: this.settings.outputLength || 8192,
                    },
                };

                // Add image if provided
                if (options.sourceImage) {
                    requestBody.contents[0].parts.unshift({
                        inlineData: {
                            mimeType: options.sourceImage.mimeType || 'image/jpeg',
                            data: options.sourceImage.base64,
                        }
                    });
                }

                const response = await fetch(
                    `${endpoint}?key=${this.apiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(requestBody),
                    }
                );

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error?.message || 'Analysis failed');
                }

                const result = await response.json();
                console.log('📥 Analysis Response:', result);
                
                // Process the response
                const processedResult = {
                    success: true,
                    model: 'gemini-3-flash-preview',
                    modelName: 'Gemini 3 Flash',
                    text: null,
                    images: [],
                    raw: result
                };
                
                // Extract text from response
                if (result.candidates && result.candidates[0]?.content?.parts) {
                    for (const part of result.candidates[0].content.parts) {
                        if (part.text) {
                            processedResult.text = part.text;
                        }
                    }
                }
                
                // Log to history
                this.addToHistory({
                    type: 'content_analysis',
                    model: 'gemini-3-flash-preview',
                    modelName: 'Gemini 3 Flash',
                    prompt,
                    settings: { ...this.settings },
                    result: processedResult,
                    timestamp: new Date().toISOString(),
                });

                console.log('✅ Analysis complete');
                return processedResult;

            } catch (error) {
                console.error('❌ Analysis failed:', error);
                throw error;
            } finally {
                this.isGenerating = false;
            }
        }

        // ----------------------------------------
        // VIDEO TO STILL (Best frame extraction)
        // ----------------------------------------
        async extractStillFromVideo(videoBase64, customPrompt = '') {
            if (!this.hasApiKey()) {
                throw new Error('API key required. Configure in AI Studio settings.');
            }

            this.isGenerating = true;
            
            const prompt = customPrompt ||
                `Analyze this video and identify the single best frame that would work as a still image. ` +
                `Consider composition, clarity, visual appeal, and representativeness of the video content. ` +
                `Describe the ideal frame and its timestamp.`;

            console.log('⚡ Extracting still from video...');

            try {
                const result = await this.generateImage(prompt, {
                    sourceImage: {
                        base64: videoBase64.replace(/^data:video\/[a-z]+;base64,/, ''),
                        mimeType: 'video/mp4',
                    }
                });

                this.addToHistory({
                    type: 'video_to_still',
                    model: 'gemini-2-flash',
                    prompt,
                    timestamp: new Date().toISOString(),
                });

                return result;
            } finally {
                this.isGenerating = false;
            }
        }

        // ----------------------------------------
        // HISTORY MANAGEMENT
        // ----------------------------------------
        addToHistory(entry) {
            this.history.unshift({
                id: Date.now().toString(),
                ...entry,
            });
            this.saveHistory();
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
    // AI STUDIO UI
    // ============================================
    function createAIStudioInterface(studio, asset = null) {
        const models = Object.entries(AI_MODELS);
        const currentModel = AI_MODELS[studio.settings.selectedModel];
        
        const container = document.createElement('div');
        container.id = 'ai-studio-modal';
        container.className = 'ai-studio-overlay';
        container.innerHTML = `
            <div class="ai-studio-container">
                <!-- Header -->
                <div class="ai-studio-header">
                    <div class="ai-studio-title">
                        <span class="ai-studio-icon">🤖</span>
                        <span>AI Studio</span>
                        <span class="ai-studio-tokens">Ready</span>
                    </div>
                    <div class="ai-studio-header-actions">
                        <button class="ai-studio-btn-secondary" id="ai-run-settings">Run settings</button>
                        <button class="ai-studio-btn-secondary" id="ai-get-code">&lt;/&gt; Get code</button>
                        <button class="ai-studio-close" id="ai-studio-close">✕</button>
                    </div>
                </div>
                
                <!-- Main Content -->
                <div class="ai-studio-main">
                    <!-- Left Panel - Content Area -->
                    <div class="ai-studio-content-area">
                        <!-- Status Banner -->
                        ${!studio.hasApiKey() ? `
                            <div class="ai-studio-status-banner ai-status-warning">
                                <span>⚠️</span>
                                <span>Enter your API key in settings to enable AI features</span>
                                <button class="ai-status-close" onclick="this.parentElement.style.display='none'">✕</button>
                            </div>
                        ` : studio.isUsingSharedKey() ? `
                            <div class="ai-studio-status-banner ai-status-success">
                                <span>✅</span>
                                <span>Using shared API key from your admin. All requests will be charged to their account.</span>
                                <button class="ai-status-close" onclick="this.parentElement.style.display='none'">✕</button>
                            </div>
                        ` : `
                            <div class="ai-studio-status-banner ai-status-success">
                                <span>✓</span>
                                <span>Using your API key. All requests will be charged to your account.</span>
                                <button class="ai-status-close" onclick="this.parentElement.style.display='none'">✕</button>
                            </div>
                        `}
                        
                        <!-- Output Area (main content) -->
                        <div class="ai-studio-output-area">
                            ${asset ? `
                                <div class="ai-studio-asset-attached">
                                    <img src="${asset.thumbnail_url || asset.thumbnail || asset.dataUrl || ''}" alt="${asset.filename || 'Asset'}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                    <div class="ai-studio-asset-fallback" style="display:none;">🖼️</div>
                                    <div class="ai-studio-asset-info">
                                        <strong>${asset.filename || 'Selected Asset'}</strong>
                                        <span>${asset.width || '?'}×${asset.height || '?'} • ${asset.file_type || asset.type || 'image'}</span>
                                    </div>
                                    <button class="ai-studio-remove-asset" id="ai-remove-asset">✕</button>
                                </div>
                            ` : ''}
                            
                            <!-- Output Display -->
                            <div class="ai-studio-output" id="ai-output">
                                <div class="ai-studio-output-placeholder">
                                    <div class="ai-output-icon">🎨</div>
                                    <p>Generated content will appear here</p>
                                    <p class="ai-output-hint">Enter a prompt below and click "Run" to generate</p>
                                </div>
                            </div>
                            
                            <!-- Thoughts Section (collapsible) -->
                            <div class="ai-studio-thoughts-section" id="ai-thoughts">
                                <button class="ai-thoughts-toggle" id="ai-expand-thoughts">
                                    <span class="ai-thoughts-icon">✨</span>
                                    <span>Thoughts</span>
                                    <span class="ai-thoughts-hint">Expand to view model thoughts</span>
                                    <span class="ai-expand-icon">▼</span>
                                </button>
                                <div class="ai-studio-thoughts-content" id="ai-thoughts-content" style="display: none;">
                                    <p>Model thoughts will appear here during generation...</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Bottom Actions & Disclaimer -->
                        <div class="ai-studio-bottom-section">
                            <div class="ai-studio-feedback">
                                <button class="ai-feedback-btn" id="ai-like-btn" title="Good response">👍</button>
                                <button class="ai-feedback-btn" id="ai-dislike-btn" title="Bad response">👎</button>
                            </div>
                            <div class="ai-studio-disclaimer">
                                <span>ℹ️ Google AI models may make mistakes, so double-check outputs.</span>
                            </div>
                        </div>
                        
                        <!-- Prompt Input Bar - Google AI Studio style -->
                        <div class="ai-studio-prompt-bar">
                            <!-- Single attachment button with dropdown menu -->
                            <div class="ai-attach-dropdown">
                                <button class="ai-attach-btn" id="ai-attach-btn" title="Add image or file">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                                </button>
                                <div class="ai-attach-menu" id="ai-attach-menu" style="display: none;">
                                    <button class="ai-attach-option" id="ai-upload-file">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                        Upload from computer
                                    </button>
                                    <button class="ai-attach-option" id="ai-attach-file">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                        Select from Library
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Tools badge (like Google) -->
                            <button class="ai-tools-badge" id="ai-tools-toggle">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                                Tools
                            </button>
                            
                            <!-- Grounding badge (shows when enabled) -->
                            ${studio.settings.groundingEnabled ? `
                                <button class="ai-grounding-badge" id="ai-grounding-toggle">
                                    <img src="https://www.google.com/favicon.ico" alt="" width="14" height="14">
                                    Grounding with Google Search
                                    <span class="ai-badge-close">✕</span>
                                </button>
                            ` : ''}
                            
                            <!-- Prompt input -->
                            <div class="ai-prompt-input-wrapper">
                                <textarea id="ai-prompt-input" class="ai-prompt-textarea" placeholder="Start typing a prompt..." rows="1"></textarea>
                            </div>
                            
                            <!-- Run button -->
                            <button class="ai-run-btn ${!studio.hasApiKey() ? 'disabled' : ''}" id="ai-run-btn">
                                Run ⌘↵
                            </button>
                        </div>
                    </div>
                    
                    <!-- Right Panel - Settings -->
                    <div class="ai-studio-settings-panel">
                        <!-- Model Selection -->
                        <div class="ai-settings-group">
                            <label class="ai-settings-label">Model</label>
                            ${models.map(([id, model]) => `
                                <div class="ai-model-option ${studio.settings.selectedModel === id ? 'selected' : ''}" data-model="${id}">
                                    <div class="ai-model-info">
                                        <div class="ai-model-name">${model.name}</div>
                                        <div class="ai-model-subtitle">${model.subtitle}</div>
                                        <div class="ai-model-desc">${model.description}</div>
                                    </div>
                                    ${studio.settings.selectedModel === id ? '<span class="ai-model-status">● In use</span>' : ''}
                                </div>
                            `).join('')}
                        </div>
                        
                        <!-- System Instructions -->
                        <div class="ai-settings-group">
                            <label class="ai-settings-label">System instructions</label>
                            <textarea 
                                id="ai-system-instructions" 
                                class="ai-settings-textarea"
                                placeholder="Optional tone and style instructions for the model"
                                rows="3"
                            >${studio.settings.systemInstructions}</textarea>
                        </div>
                        
                        <!-- API Key -->
                        <div class="ai-settings-group">
                            <label class="ai-settings-label">API Key</label>
                            ${studio.isUsingSharedKey() ? `
                                <div class="ai-shared-key-notice" style="padding: 12px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px; margin-bottom: 8px;">
                                    <p style="margin: 0; color: #22c55e; font-size: 13px;">✅ Using shared API key from your admin</p>
                                    <p style="margin: 4px 0 0; color: #94a3b8; font-size: 11px;">You can optionally enter your own key below to use instead.</p>
                                </div>
                            ` : !studio.hasApiKey() ? `
                                <div class="ai-no-key-notice" style="padding: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; margin-bottom: 8px;">
                                    <p style="margin: 0; color: #ef4444; font-size: 13px;">⚠️ No API key configured</p>
                                    <p style="margin: 4px 0 0; color: #94a3b8; font-size: 11px;">Enter your Google AI Studio API key below or ask your admin to share access.</p>
                                </div>
                            ` : ''}
                            <input 
                                type="password" 
                                id="ai-api-key-input" 
                                class="ai-settings-input"
                                placeholder="${studio.isUsingSharedKey() ? 'Optional: Enter your own API key...' : 'Enter your Google AI Studio API key'}"
                                value="${studio.apiKey && !studio.isUsingSharedKey() ? '••••••••••••' + studio.apiKey.slice(-4) : ''}"
                            >
                            <button class="ai-settings-btn-small" id="ai-save-api-key">Save Key</button>
                        </div>
                        
                        <!-- Temperature -->
                        <div class="ai-settings-group">
                            <label class="ai-settings-label">Temperature</label>
                            <div class="ai-settings-slider-row">
                                <input 
                                    type="range" 
                                    id="ai-temperature" 
                                    min="0" 
                                    max="2" 
                                    step="0.1" 
                                    value="${studio.settings.temperature}"
                                    class="ai-settings-slider"
                                >
                                <input 
                                    type="number" 
                                    id="ai-temperature-value" 
                                    value="${studio.settings.temperature}"
                                    class="ai-settings-number"
                                    min="0"
                                    max="2"
                                    step="0.1"
                                >
                            </div>
                        </div>
                        
                        <!-- Aspect Ratio -->
                        <div class="ai-settings-group">
                            <label class="ai-settings-label">Aspect ratio</label>
                            <select id="ai-aspect-ratio" class="ai-settings-select">
                                <optgroup label="Standard">
                                    <option value="auto" ${studio.settings.aspectRatio === 'auto' ? 'selected' : ''}>Auto</option>
                                    <option value="16:9" ${studio.settings.aspectRatio === '16:9' ? 'selected' : ''}>16:9 (Landscape)</option>
                                    <option value="9:16" ${studio.settings.aspectRatio === '9:16' ? 'selected' : ''}>9:16 (Portrait)</option>
                                    <option value="1:1" ${studio.settings.aspectRatio === '1:1' ? 'selected' : ''}>1:1 (Square)</option>
                                    <option value="4:5" ${studio.settings.aspectRatio === '4:5' ? 'selected' : ''}>4:5 (Instagram)</option>
                                    <option value="4:3" ${studio.settings.aspectRatio === '4:3' ? 'selected' : ''}>4:3 (Standard)</option>
                                </optgroup>
                                <optgroup label="📢 Google Ads PMax">
                                    <option value="pmax-landscape" ${studio.settings.aspectRatio === 'pmax-landscape' ? 'selected' : ''}>PMax Landscape (1200×628)</option>
                                    <option value="pmax-square" ${studio.settings.aspectRatio === 'pmax-square' ? 'selected' : ''}>PMax Square (1200×1200)</option>
                                    <option value="pmax-portrait" ${studio.settings.aspectRatio === 'pmax-portrait' ? 'selected' : ''}>PMax Portrait (960×1200)</option>
                                    <option value="pmax-all" ${studio.settings.aspectRatio === 'pmax-all' ? 'selected' : ''}>🎯 PMax All Sizes (3 images)</option>
                                </optgroup>
                            </select>
                        </div>
                        
                        <!-- Number of Images -->
                        <div class="ai-settings-group">
                            <label class="ai-settings-label">Number of images</label>
                            <select id="ai-num-images" class="ai-settings-select">
                                <option value="1" ${(studio.settings.numImages || 1) === 1 ? 'selected' : ''}>1 image</option>
                                <option value="2" ${studio.settings.numImages === 2 ? 'selected' : ''}>2 images</option>
                                <option value="4" ${studio.settings.numImages === 4 ? 'selected' : ''}>4 images</option>
                                <option value="6" ${studio.settings.numImages === 6 ? 'selected' : ''}>6 images</option>
                                <option value="8" ${studio.settings.numImages === 8 ? 'selected' : ''}>8 images (batch)</option>
                            </select>
                            <p style="font-size: 11px; color: #64748b; margin-top: 4px;">Generate multiple variations at once</p>
                        </div>
                        
                        <!-- Resolution -->
                        <div class="ai-settings-group">
                            <label class="ai-settings-label">Resolution</label>
                            <select id="ai-resolution" class="ai-settings-select">
                                <option value="512" ${studio.settings.resolution === '512' ? 'selected' : ''}>512px</option>
                                <option value="1K" ${studio.settings.resolution === '1K' ? 'selected' : ''}>1K (1024px)</option>
                                <option value="2K" ${studio.settings.resolution === '2K' ? 'selected' : ''}>2K (2048px)</option>
                                <option value="4K" ${studio.settings.resolution === '4K' ? 'selected' : ''}>4K (4096px)</option>
                            </select>
                        </div>
                        
                        <!-- Tools Section -->
                        <div class="ai-settings-group ai-settings-collapsible">
                            <div class="ai-settings-collapse-header" id="ai-tools-toggle">
                                <span>Tools</span>
                                <span class="ai-collapse-icon">▲</span>
                            </div>
                            <div class="ai-settings-collapse-content" id="ai-tools-content">
                                <div class="ai-settings-toggle-row">
                                    <span>Grounding with Google Search</span>
                                    <label class="ai-toggle-switch">
                                        <input type="checkbox" id="ai-grounding" ${studio.settings.groundingEnabled ? 'checked' : ''}>
                                        <span class="ai-toggle-slider"></span>
                                    </label>
                                </div>
                                <div class="ai-grounding-source">
                                    Source: <img src="https://www.google.com/favicon.ico" alt="" style="width: 14px; height: 14px; vertical-align: middle;"> Google Search
                                </div>
                            </div>
                        </div>
                        
                        <!-- Advanced Settings -->
                        <div class="ai-settings-group ai-settings-collapsible">
                            <div class="ai-settings-collapse-header" id="ai-advanced-toggle">
                                <span>Advanced settings</span>
                                <span class="ai-collapse-icon">▲</span>
                            </div>
                            <div class="ai-settings-collapse-content" id="ai-advanced-content">
                                <div class="ai-settings-subgroup">
                                    <label>Add stop sequence</label>
                                    <input type="text" class="ai-settings-input" placeholder="Add stop...">
                                </div>
                                <div class="ai-settings-subgroup">
                                    <label>Output length</label>
                                    <input type="number" id="ai-output-length" value="${studio.settings.outputLength}" class="ai-settings-input">
                                </div>
                                <div class="ai-settings-subgroup">
                                    <label>Top P</label>
                                    <div class="ai-settings-slider-row">
                                        <input type="range" id="ai-top-p" min="0" max="1" step="0.01" value="${studio.settings.topP}" class="ai-settings-slider">
                                        <input type="number" id="ai-top-p-value" value="${studio.settings.topP}" class="ai-settings-number" min="0" max="1" step="0.01">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return container;
    }

    // ============================================
    // AI STUDIO STYLES
    // ============================================
    const aiStudioStyles = `
        .ai-studio-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.95);
            z-index: 300000;
            display: flex;
            align-items: stretch;
            justify-content: center;
        }
        
        .ai-studio-container {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            background: var(--cav-bg-body, #121212);
            color: var(--cav-text-primary, #f5f5f5);
            font-family: var(--cav-font-sans, 'Inter', -apple-system, sans-serif);
        }
        
        /* Header - Updated to match main app */
        .ai-studio-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 1.5rem;
            background: var(--cav-bg-dark, #0d0d0d);
            border-bottom: 1px solid var(--cav-glass-border, rgba(255, 255, 255, 0.1));
        }
        
        .ai-studio-title {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-size: 1rem;
            font-weight: 500;
        }
        
        .ai-studio-icon {
            font-size: 1.25rem;
        }
        
        .ai-studio-tokens {
            background: #2a2a3e;
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
            font-size: 0.75rem;
            color: #888;
        }
        
        .ai-studio-header-actions {
            display: flex;
            gap: 0.5rem;
            align-items: center;
        }
        
        .ai-studio-btn-secondary {
            padding: 0.5rem 1rem;
            background: transparent;
            border: 1px solid #3a3a4e;
            border-radius: 6px;
            color: #e0e0e0;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .ai-studio-btn-secondary:hover {
            background: #2a2a3e;
        }
        
        .ai-studio-close {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: none;
            border: none;
            color: #888;
            font-size: 1.25rem;
            cursor: pointer;
            border-radius: 6px;
        }
        
        .ai-studio-close:hover {
            background: #2a2a3e;
            color: #fff;
        }
        
        /* Main Layout */
        .ai-studio-main {
            flex: 1;
            display: flex;
            overflow: hidden;
        }
        
        /* Content Area (Left) - Google AI Studio style */
        .ai-studio-content-area {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        
        /* Status Banner - Google style */
        .ai-studio-status-banner {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.875rem 1.25rem;
            font-size: 0.875rem;
            border-bottom: 1px solid var(--cav-glass-border, rgba(255, 255, 255, 0.1));
        }
        
        .ai-status-warning {
            background: var(--cav-warning-bg, rgba(245, 158, 11, 0.1));
            color: var(--cav-warning, #f59e0b);
        }
        
        .ai-status-success {
            background: var(--cav-success-bg, rgba(34, 197, 94, 0.08));
            color: var(--cav-success, #22c55e);
        }
        
        .ai-status-close {
            margin-left: auto;
            background: none;
            border: none;
            color: inherit;
            opacity: 0.6;
            cursor: pointer;
            font-size: 1rem;
            padding: 4px;
        }
        
        .ai-status-close:hover {
            opacity: 1;
        }
        
        /* Output Area */
        .ai-studio-output-area {
            flex: 1;
            display: flex;
            flex-direction: column;
            padding: 1.5rem;
            overflow-y: auto;
        }
        
        .ai-studio-asset-attached {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: var(--cav-bg-card, #1e1e1e);
            border: 1px solid var(--cav-glass-border, rgba(255, 255, 255, 0.1));
            border-radius: var(--cav-radius, 14px);
            margin-bottom: 1rem;
        }
        
        .ai-studio-asset-attached img {
            width: 80px;
            height: 60px;
            object-fit: cover;
            border-radius: 8px;
        }
        
        .ai-studio-asset-attached .ai-studio-asset-fallback {
            width: 80px;
            height: 60px;
            background: var(--cav-bg-elevated, #2a2a2a);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
        }
        
        .ai-studio-asset-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        
        .ai-studio-asset-info strong {
            color: var(--cav-text-primary, #f5f5f5);
            font-size: 0.9rem;
        }
        
        .ai-studio-asset-info span {
            color: var(--cav-text-secondary, #a3a3a3);
            font-size: 0.8rem;
        }
        
        .ai-studio-remove-asset {
            background: none;
            border: none;
            color: var(--cav-text-muted, #737373);
            cursor: pointer;
            padding: 8px;
            font-size: 1rem;
        }
        
        .ai-studio-remove-asset:hover {
            color: var(--cav-error, #ef4444);
        }
        
        /* Sections */
        .ai-studio-section {
            margin-bottom: 1.5rem;
        }
        
        .ai-studio-section-label {
            font-size: 0.75rem;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.75rem;
        }
        
        /* Asset Preview */
        .ai-studio-asset-preview {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: #2a2a3e;
            border-radius: 8px;
            margin-bottom: 1rem;
        }
        
        .ai-studio-asset-preview img {
            width: 80px;
            height: 60px;
            object-fit: cover;
            border-radius: 4px;
        }
        
        .ai-studio-asset-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }
        
        .ai-studio-asset-info strong {
            color: #fff;
        }
        
        .ai-studio-asset-info span {
            font-size: 0.8rem;
            color: #888;
        }
        
        .ai-studio-remove-asset {
            background: none;
            border: none;
            color: #888;
            cursor: pointer;
            padding: 0.25rem;
        }
        
        /* Prompt Input */
        .ai-studio-prompt-input {
            width: 100%;
            padding: 1rem;
            background: #2a2a3e;
            border: 1px solid #3a3a4e;
            border-radius: 8px;
            color: #fff;
            font-size: 1rem;
            resize: vertical;
            min-height: 100px;
        }
        
        .ai-studio-prompt-input:focus {
            outline: none;
            border-color: #8b5cf6;
        }
        
        .ai-studio-prompt-input::placeholder {
            color: #666;
        }
        
        /* Thoughts Section */
        .ai-studio-thoughts {
            background: #2a2a3e;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .ai-studio-thoughts-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 1rem;
            border-bottom: 1px solid #3a3a4e;
        }
        
        .ai-thoughts-icon {
            color: #8b5cf6;
        }
        
        .ai-thoughts-expand {
            margin-left: auto;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: none;
            border: none;
            color: #888;
            font-size: 0.85rem;
            cursor: pointer;
        }
        
        .ai-studio-thoughts-content {
            padding: 1rem;
            color: #aaa;
            font-size: 0.9rem;
        }
        
        /* Output Display */
        .ai-studio-output {
            flex: 1;
            background: var(--cav-bg-card, #1e1e1e);
            border: 1px solid var(--cav-glass-border, rgba(255, 255, 255, 0.1));
            border-radius: var(--cav-radius, 14px);
            min-height: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: auto;
        }
        
        .ai-studio-output-placeholder {
            text-align: center;
            color: var(--cav-text-muted, #737373);
            padding: 2rem;
        }
        
        .ai-output-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            opacity: 0.4;
        }
        
        .ai-output-hint {
            font-size: 0.85rem;
            color: var(--cav-text-disabled, #525252);
            margin-top: 0.5rem;
        }
        
        .ai-studio-output img {
            max-width: 100%;
            max-height: 500px;
            border-radius: var(--cav-radius-sm, 10px);
        }
        
        /* Thoughts Section */
        .ai-studio-thoughts-section {
            margin-top: 1rem;
            border: 1px solid var(--cav-glass-border, rgba(255, 255, 255, 0.1));
            border-radius: var(--cav-radius, 14px);
            overflow: hidden;
        }
        
        .ai-thoughts-toggle {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.875rem 1rem;
            background: var(--cav-bg-card, #1e1e1e);
            border: none;
            color: var(--cav-text-primary, #f5f5f5);
            cursor: pointer;
            font-size: 0.9rem;
        }
        
        .ai-thoughts-toggle:hover {
            background: var(--cav-bg-hover, #333333);
        }
        
        .ai-thoughts-icon {
            font-size: 1rem;
        }
        
        .ai-thoughts-hint {
            flex: 1;
            text-align: right;
            color: var(--cav-text-muted, #737373);
            font-size: 0.8rem;
        }
        
        .ai-expand-icon {
            color: var(--cav-text-muted, #737373);
            font-size: 0.75rem;
            transition: transform 0.2s;
        }
        
        .ai-studio-thoughts-content {
            padding: 1rem;
            background: var(--cav-bg-slate, #181818);
            color: var(--cav-text-secondary, #a3a3a3);
            font-size: 0.875rem;
            border-top: 1px solid var(--cav-glass-border, rgba(255, 255, 255, 0.1));
        }
        
        /* Bottom Section */
        .ai-studio-bottom-section {
            display: flex;
            align-items: center;
            padding: 0.75rem 1.5rem;
            gap: 1rem;
        }
        
        .ai-studio-feedback {
            display: flex;
            gap: 0.5rem;
        }
        
        .ai-feedback-btn {
            padding: 0.5rem;
            background: var(--cav-bg-card, #1e1e1e);
            border: 1px solid var(--cav-glass-border, rgba(255, 255, 255, 0.1));
            border-radius: var(--cav-radius-sm, 10px);
            cursor: pointer;
            font-size: 1rem;
            transition: var(--cav-transition, all 0.2s);
        }
        
        .ai-feedback-btn:hover {
            background: var(--cav-bg-hover, #333333);
            border-color: var(--cav-glass-border-hover, rgba(255, 255, 255, 0.2));
        }
        
        .ai-studio-disclaimer {
            color: var(--cav-text-muted, #737373);
            font-size: 0.75rem;
        }
        
        /* AI Generation Result Styles */
        .ai-generation-result {
            padding: 1.5rem;
            color: #e9d5ff;
        }
        
        .ai-generation-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid #3a3a4e;
        }
        
        .ai-generation-icon {
            font-size: 1.5rem;
        }
        
        .ai-generation-title {
            color: #22c55e;
            font-weight: 600;
        }
        
        .ai-generated-images {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
        }
        
        .ai-generated-image-container {
            border-radius: 12px;
            overflow: hidden;
            background: #1a1a2e;
            border: 1px solid #3a3a4e;
        }
        
        .ai-generated-image {
            width: 100%;
            height: auto;
            display: block;
            border-radius: 12px 12px 0 0;
        }
        
        .ai-image-actions {
            display: flex;
            gap: 0.5rem;
            padding: 0.75rem;
            background: #2a2a3e;
        }
        
        .ai-image-download, .ai-image-copy {
            flex: 1;
            padding: 0.5rem;
            background: #3a3a4e;
            border: none;
            border-radius: 6px;
            color: #e9d5ff;
            text-align: center;
            cursor: pointer;
            font-size: 0.75rem;
            text-decoration: none;
            transition: all 0.2s;
        }
        
        .ai-image-download:hover, .ai-image-copy:hover {
            background: #4a4a5e;
            color: #fff;
        }
        
        /* AI Analysis Result Styles */
        .ai-analysis-result {
            padding: 1.5rem;
            color: #e9d5ff;
        }
        
        .ai-analysis-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid #3a3a4e;
        }
        
        .ai-analysis-icon {
            font-size: 1.5rem;
        }
        
        .ai-analysis-title {
            color: #c084fc;
            font-weight: 600;
            font-size: 1.1rem;
        }
        
        .ai-analysis-content {
            line-height: 1.7;
            color: #c4b5fd;
        }
        
        .ai-analysis-content p {
            margin-bottom: 0.75rem;
        }
        
        .ai-analysis-content li {
            margin-bottom: 0.35rem;
        }
        
        .ai-analysis-note {
            display: flex;
            align-items: flex-start;
            gap: 0.5rem;
            margin-top: 1.5rem;
            padding: 1rem;
            background: rgba(139, 92, 246, 0.1);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 8px;
            font-size: 0.85rem;
            color: #a5b4fc;
        }
        
        .ai-analysis-note strong {
            color: #c084fc;
        }
        
        /* Action Buttons */
        .ai-studio-actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 1rem;
        }
        
        .ai-studio-action-btn {
            padding: 0.5rem;
            background: #2a2a3e;
            border: 1px solid #3a3a4e;
            border-radius: 6px;
            font-size: 1rem;
            cursor: pointer;
        }
        
        .ai-studio-action-btn:hover {
            background: #3a3a4e;
        }
        
        /* Disclaimer */
        .ai-studio-disclaimer {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem;
            color: #666;
            font-size: 0.8rem;
            margin-top: 1rem;
        }
        
        /* Bottom Prompt Bar - Google AI Studio style */
        .ai-studio-prompt-bar {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 1rem 1.5rem;
            background: var(--cav-bg-card, #1e1e1e);
            border-top: 1px solid var(--cav-glass-border, rgba(255, 255, 255, 0.1));
        }
        
        /* Attachment dropdown */
        .ai-attach-dropdown {
            position: relative;
        }
        
        .ai-attach-btn {
            padding: 0.625rem;
            background: none;
            border: 1px solid transparent;
            border-radius: var(--cav-radius-sm, 10px);
            color: var(--cav-text-secondary, #a3a3a3);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: var(--cav-transition, all 0.2s);
        }
        
        .ai-attach-btn:hover {
            background: var(--cav-bg-elevated, #2a2a2a);
            border-color: var(--cav-glass-border, rgba(255, 255, 255, 0.1));
            color: var(--cav-text-primary, #f5f5f5);
        }
        
        .ai-attach-menu {
            position: absolute;
            bottom: 100%;
            left: 0;
            margin-bottom: 8px;
            background: var(--cav-bg-card, #1e1e1e);
            border: 1px solid var(--cav-glass-border, rgba(255, 255, 255, 0.1));
            border-radius: var(--cav-radius, 14px);
            box-shadow: var(--cav-shadow-lg, 0 8px 32px rgba(0, 0, 0, 0.35));
            overflow: hidden;
            min-width: 200px;
            z-index: 100;
        }
        
        .ai-attach-option {
            width: 100%;
            padding: 0.75rem 1rem;
            background: none;
            border: none;
            color: var(--cav-text-primary, #f5f5f5);
            font-size: 0.875rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            transition: var(--cav-transition-fast, all 0.15s);
            text-align: left;
        }
        
        .ai-attach-option:hover {
            background: var(--cav-bg-hover, #333333);
        }
        
        .ai-attach-option svg {
            color: var(--cav-text-secondary, #a3a3a3);
        }
        
        /* Tools badge */
        .ai-tools-badge {
            padding: 0.5rem 0.875rem;
            background: var(--cav-bg-elevated, #2a2a2a);
            border: 1px solid var(--cav-glass-border, rgba(255, 255, 255, 0.1));
            border-radius: var(--cav-radius-full, 9999px);
            color: var(--cav-text-primary, #f5f5f5);
            font-size: 0.8rem;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: var(--cav-transition, all 0.2s);
        }
        
        .ai-tools-badge:hover {
            background: var(--cav-bg-hover, #333333);
            border-color: var(--cav-glass-border-hover, rgba(255, 255, 255, 0.2));
        }
        
        /* Grounding badge */
        .ai-grounding-badge {
            padding: 0.5rem 0.875rem;
            background: rgba(66, 133, 244, 0.15);
            border: 1px solid rgba(66, 133, 244, 0.3);
            border-radius: var(--cav-radius-full, 9999px);
            color: #4285f4;
            font-size: 0.8rem;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: var(--cav-transition, all 0.2s);
        }
        
        .ai-grounding-badge img {
            border-radius: 2px;
        }
        
        .ai-badge-close {
            margin-left: 4px;
            opacity: 0.6;
            font-size: 0.75rem;
        }
        
        .ai-grounding-badge:hover .ai-badge-close {
            opacity: 1;
        }
        
        /* Prompt input */
        .ai-prompt-input-wrapper {
            flex: 1;
            background: var(--cav-bg-slate, #181818);
            border: 1px solid var(--cav-glass-border, rgba(255, 255, 255, 0.1));
            border-radius: var(--cav-radius-full, 9999px);
            padding: 0.625rem 1.25rem;
        }
        
        .ai-prompt-textarea {
            width: 100%;
            background: none;
            border: none;
            color: var(--cav-text-primary, #f5f5f5);
            font-size: 0.9rem;
            font-family: inherit;
            resize: none;
            outline: none;
            line-height: 1.5;
        }
        
        .ai-prompt-textarea::placeholder {
            color: var(--cav-text-muted, #737373);
        }
        
        /* Run button */
        .ai-run-btn {
            padding: 0.625rem 1.25rem;
            background: var(--cav-primary-gradient, linear-gradient(135deg, #e1306c 0%, #ff6b9d 100%));
            border: none;
            border-radius: var(--cav-radius-full, 9999px);
            color: #fff;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: var(--cav-transition, all 0.2s);
            white-space: nowrap;
        }
        
        .ai-run-btn:hover:not(.disabled) {
            transform: var(--cav-lift-sm, translateY(-2px));
            box-shadow: var(--cav-shadow-pink, 0 8px 32px rgba(225, 48, 108, 0.3));
        }
        
        .ai-run-btn.disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        /* Legacy compatibility - remove these if not needed */
        .ai-quick-prompt-input {
            flex: 1;
            background: none;
            border: none;
            color: #fff;
            font-size: 0.95rem;
            padding: 0.75rem 0;
        }
        
        .ai-quick-prompt-input:focus {
            outline: none;
        }
        
        .ai-quick-prompt-input::placeholder {
            color: #666;
        }
        
        .ai-prompt-bar-actions {
            display: flex;
            gap: 0.5rem;
        }
        
        .ai-prompt-upload {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #2a2a3e;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            color: #888;
            transition: all 0.2s;
        }
        
        .ai-prompt-upload:hover {
            background: #3a3a4e;
            color: var(--cav-accent, #a855f7);
            transform: scale(1.05);
        }
        
        /* Settings Panel (Right) - Updated to match main app */
        .ai-studio-settings-panel {
            width: 320px;
            background: var(--cav-bg-dark, #0d0d0d);
            border-left: 1px solid #2a2a3e;
            padding: 1.5rem;
            overflow-y: auto;
        }
        
        .ai-settings-group {
            margin-bottom: 1.5rem;
        }
        
        .ai-settings-label {
            display: block;
            font-size: 0.85rem;
            color: #888;
            margin-bottom: 0.75rem;
        }
        
        /* Model Selection - Updated to match main app */
        .ai-model-option {
            padding: 1rem;
            background: var(--cav-bg-card, #1e1e1e);
            border: 1px solid var(--cav-glass-border, rgba(255, 255, 255, 0.1));
            border-radius: var(--cav-radius, 14px);
            margin-bottom: 0.5rem;
            cursor: pointer;
            transition: var(--cav-transition, all 0.2s cubic-bezier(0.4, 0, 0.2, 1));
        }
        
        .ai-model-option:hover {
            border-color: var(--cav-glass-border-hover, rgba(255, 255, 255, 0.2));
            transform: var(--cav-lift-sm, translateY(-2px));
        }
        
        .ai-model-option.selected {
            border-color: var(--cav-primary, #e1306c);
            background: var(--cav-primary-soft, rgba(225, 48, 108, 0.12));
            box-shadow: 0 0 20px var(--cav-primary-soft, rgba(225, 48, 108, 0.2));
        }
        
        .ai-model-name {
            font-weight: 600;
            color: #fff;
            margin-bottom: 0.25rem;
        }
        
        .ai-model-subtitle {
            font-size: 0.75rem;
            color: #666;
            font-family: monospace;
        }
        
        .ai-model-desc {
            font-size: 0.8rem;
            color: #888;
            margin-top: 0.5rem;
        }
        
        .ai-model-status {
            display: inline-block;
            margin-top: 0.5rem;
            color: #22c55e;
            font-size: 0.75rem;
        }
        
        /* Settings Inputs */
        .ai-settings-input,
        .ai-settings-select,
        .ai-settings-textarea {
            width: 100%;
            padding: 0.75rem;
            background: #1a1a2e;
            border: 1px solid #2a2a3e;
            border-radius: 6px;
            color: #fff;
            font-size: 0.9rem;
        }
        
        .ai-settings-input:focus,
        .ai-settings-select:focus,
        .ai-settings-textarea:focus {
            outline: none;
            border-color: #8b5cf6;
        }
        
        .ai-settings-textarea {
            resize: vertical;
            min-height: 80px;
        }
        
        .ai-settings-btn-small {
            margin-top: 0.5rem;
            padding: 0.5rem 1rem;
            background: #8b5cf6;
            border: none;
            border-radius: 6px;
            color: #fff;
            font-size: 0.8rem;
            cursor: pointer;
        }
        
        /* Slider */
        .ai-settings-slider-row {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .ai-settings-slider {
            flex: 1;
            -webkit-appearance: none;
            height: 4px;
            background: #2a2a3e;
            border-radius: 2px;
        }
        
        .ai-settings-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 16px;
            height: 16px;
            background: #8b5cf6;
            border-radius: 50%;
            cursor: pointer;
        }
        
        .ai-settings-number {
            width: 60px;
            padding: 0.5rem;
            background: #1a1a2e;
            border: 1px solid #2a2a3e;
            border-radius: 6px;
            color: #fff;
            text-align: center;
        }
        
        /* Collapsible Sections */
        .ai-settings-collapsible {
            border: 1px solid #2a2a3e;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .ai-settings-collapse-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background: #1a1a2e;
            cursor: pointer;
            font-size: 0.9rem;
        }
        
        .ai-settings-collapse-content {
            padding: 1rem;
            background: #0f0f1a;
            border-top: 1px solid #2a2a3e;
        }
        
        .ai-collapse-icon {
            font-size: 0.75rem;
            color: #666;
            transition: transform 0.2s;
        }
        
        .ai-settings-collapse-header.collapsed .ai-collapse-icon {
            transform: rotate(180deg);
        }
        
        /* Toggle Switch */
        .ai-settings-toggle-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        }
        
        .ai-toggle-switch {
            position: relative;
            width: 44px;
            height: 24px;
        }
        
        .ai-toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        .ai-toggle-slider {
            position: absolute;
            cursor: pointer;
            inset: 0;
            background: #2a2a3e;
            border-radius: 24px;
            transition: 0.3s;
        }
        
        .ai-toggle-slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
            background: #fff;
            border-radius: 50%;
            transition: 0.3s;
        }
        
        .ai-toggle-switch input:checked + .ai-toggle-slider {
            background: #8b5cf6;
        }
        
        .ai-toggle-switch input:checked + .ai-toggle-slider:before {
            transform: translateX(20px);
        }
        
        .ai-grounding-source {
            font-size: 0.75rem;
            color: #666;
            margin-top: 0.25rem;
        }
        
        .ai-settings-subgroup {
            margin-bottom: 1rem;
        }
        
        .ai-settings-subgroup label {
            display: block;
            font-size: 0.8rem;
            color: #888;
            margin-bottom: 0.5rem;
        }
        
        /* Loading State */
        .ai-studio-generating {
            pointer-events: none;
            opacity: 0.7;
        }
        
        .ai-generating-spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: ai-spin 1s linear infinite;
        }
        
        @keyframes ai-spin {
            to { transform: rotate(360deg); }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .ai-studio-main {
                flex-direction: column;
            }
            
            .ai-studio-settings-panel {
                width: 100%;
                border-left: none;
                border-top: 1px solid #2a2a3e;
                max-height: 300px;
            }
        }
    `;

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = aiStudioStyles;
    document.head.appendChild(styleSheet);

    // ============================================
    // EVENT HANDLERS
    // ============================================
    function attachAIStudioEvents(studio, container) {
        // Close button
        container.querySelector('#ai-studio-close').addEventListener('click', () => {
            container.remove();
        });

        // Model selection
        container.querySelectorAll('.ai-model-option').forEach(option => {
            option.addEventListener('click', () => {
                // Remove selected state and "In use" label from ALL options
                container.querySelectorAll('.ai-model-option').forEach(o => {
                    o.classList.remove('selected');
                    o.querySelector('.ai-model-status')?.remove();
                });
                // Add selected state and "In use" label to clicked option
                option.classList.add('selected');
                option.insertAdjacentHTML('beforeend', '<span class="ai-model-status">● In use</span>');
                studio.updateSetting('selectedModel', option.dataset.model);
                console.log('🔄 Model changed to:', option.dataset.model);
            });
        });

        // Temperature slider
        const tempSlider = container.querySelector('#ai-temperature');
        const tempValue = container.querySelector('#ai-temperature-value');
        tempSlider.addEventListener('input', (e) => {
            tempValue.value = e.target.value;
            studio.updateSetting('temperature', parseFloat(e.target.value));
        });
        tempValue.addEventListener('change', (e) => {
            tempSlider.value = e.target.value;
            studio.updateSetting('temperature', parseFloat(e.target.value));
        });

        // Top P slider
        const topPSlider = container.querySelector('#ai-top-p');
        const topPValue = container.querySelector('#ai-top-p-value');
        if (topPSlider && topPValue) {
            topPSlider.addEventListener('input', (e) => {
                topPValue.value = e.target.value;
                studio.updateSetting('topP', parseFloat(e.target.value));
            });
            topPValue.addEventListener('change', (e) => {
                topPSlider.value = e.target.value;
                studio.updateSetting('topP', parseFloat(e.target.value));
            });
        }

        // Aspect ratio
        container.querySelector('#ai-aspect-ratio').addEventListener('change', (e) => {
            studio.updateSetting('aspectRatio', e.target.value);
            // If PMax All is selected, update the number of images hint
            const numImagesSelect = container.querySelector('#ai-num-images');
            if (e.target.value === 'pmax-all' && numImagesSelect) {
                numImagesSelect.parentElement.querySelector('p').textContent = 'PMax All will generate 3 images (landscape, square, portrait)';
            } else if (numImagesSelect) {
                numImagesSelect.parentElement.querySelector('p').textContent = 'Generate multiple variations at once';
            }
        });

        // Number of images
        container.querySelector('#ai-num-images')?.addEventListener('change', (e) => {
            studio.updateSetting('numImages', parseInt(e.target.value, 10));
        });

        // Resolution
        container.querySelector('#ai-resolution').addEventListener('change', (e) => {
            studio.updateSetting('resolution', e.target.value);
        });

        // System instructions
        container.querySelector('#ai-system-instructions').addEventListener('change', (e) => {
            studio.updateSetting('systemInstructions', e.target.value);
        });

        // API Key save
        container.querySelector('#ai-save-api-key').addEventListener('click', () => {
            const input = container.querySelector('#ai-api-key-input');
            const key = input.value.trim();
            if (key && !key.includes('•')) {
                studio.setApiKey(key);
                input.value = '••••••••••••' + key.slice(-4);
                
                // Update notice
                const notice = container.querySelector('.ai-studio-api-notice');
                notice.classList.add('ai-studio-api-connected');
                notice.innerHTML = '<span>✓</span><span>Using Paid API key. All requests in this session will be charged.</span>';
                
                // Enable run button
                container.querySelector('#ai-run-btn').classList.remove('disabled');
                
                alert('API key saved successfully!');
            }
        });

        // Grounding toggle
        container.querySelector('#ai-grounding')?.addEventListener('change', (e) => {
            studio.updateSetting('groundingEnabled', e.target.checked);
        });

        // Output length
        container.querySelector('#ai-output-length')?.addEventListener('change', (e) => {
            studio.updateSetting('outputLength', parseInt(e.target.value));
        });

        // Expand thoughts
        container.querySelector('#ai-expand-thoughts').addEventListener('click', () => {
            const content = container.querySelector('#ai-thoughts-content');
            const icon = container.querySelector('#ai-expand-thoughts .ai-expand-icon');
            if (content.style.display === 'none') {
                content.style.display = 'block';
                icon.textContent = '▲';
            } else {
                content.style.display = 'none';
                icon.textContent = '▼';
            }
        });

        // Collapsible sections
        container.querySelectorAll('.ai-settings-collapse-header').forEach(header => {
            header.addEventListener('click', () => {
                header.classList.toggle('collapsed');
                const content = header.nextElementSibling;
                content.style.display = content.style.display === 'none' ? 'block' : 'none';
            });
        });

        // Run button
        container.querySelector('#ai-run-btn').addEventListener('click', async () => {
            // Refresh API key to check for shared keys
            studio.refreshApiKey();
            
            if (!studio.hasApiKey()) {
                alert('No API key available. Please enter your own API key in settings, or ask your admin to share API access.');
                return;
            }

            const prompt = container.querySelector('#ai-prompt-input').value.trim();
            
            if (!prompt) {
                alert('Please enter a prompt.');
                return;
            }

            const runBtn = container.querySelector('#ai-run-btn');
            const output = container.querySelector('#ai-output');
            const thoughts = container.querySelector('#ai-thoughts-content');
            
            // Determine model type and appropriate action
            const selectedModel = studio.settings.selectedModel || 'gemini-3-pro-image-preview';
            const isVideoModel = selectedModel.includes('veo');
            const isImageModel = selectedModel.includes('image') || selectedModel.includes('flash-image');
            const isAnalysisModel = selectedModel === 'gemini-3-flash-preview';
            
            // Check for previously generated image (for image-to-video)
            const lastGeneratedImage = window.cavAIStudioLastImage || null;

            // Show loading state based on model type
            let actionText = 'Analyzing...';
            let actionMessage = 'analyzing your request';
            
            if (isVideoModel) {
                actionText = 'Generating Video...';
                actionMessage = lastGeneratedImage 
                    ? 'creating video from your image (30-60 seconds)' 
                    : 'generating video from text (30-60 seconds)';
            } else if (isImageModel) {
                actionText = 'Generating...';
                actionMessage = 'generating your image';
            }
            
            runBtn.innerHTML = `<span class="ai-generating-spinner"></span> ${actionText}`;
            runBtn.classList.add('disabled');
            thoughts.style.display = 'block';
            thoughts.innerHTML = `<p>🤖 AI is ${actionMessage}...</p>`;

            try {
                let result;
                
                // Route to appropriate generation method based on model type
                if (isVideoModel) {
                    // Video generation with Veo 3.1
                    console.log('🎬 Routing to video generation...');
                    console.log('   Has previous image:', !!lastGeneratedImage);
                    
                    // Update thoughts to show mode
                    if (lastGeneratedImage) {
                        thoughts.innerHTML = `<p>🎬 Creating video from previously generated image...</p>`;
                    } else {
                        thoughts.innerHTML = `<p>🎬 Creating video from text prompt (no source image)...</p>`;
                    }
                    
                    // Actually generate the video
                    result = await studio.generateVideo(prompt, {
                        sourceImage: lastGeneratedImage ? { base64: lastGeneratedImage } : null,
                        duration: 8,
                    });
                    
                } else if (isAnalysisModel) {
                    // Analysis with Gemini 2.0 Flash
                    console.log('🔍 Routing to analysis...');
                    result = await studio.analyzeContent(prompt);
                } else {
                    // Image generation with Nano Banana / Nano Banana Pro
                    const numImages = studio.settings.numImages || 1;
                    const aspectRatio = studio.settings.aspectRatio;
                    const isPMaxAll = aspectRatio === 'pmax-all';
                    const isMultiImage = numImages > 1 || isPMaxAll;
                    
                    if (isMultiImage) {
                        // Multi-image generation (or PMax set)
                        console.log(`🎨 Routing to multi-image generation (${isPMaxAll ? 'PMax All' : numImages + ' images'})...`);
                        thoughts.innerHTML = `<p>🎨 Generating ${isPMaxAll ? 'Google Ads PMax set (3 sizes)' : numImages + ' image variations'}...</p>`;
                        result = await studio.generateMultipleImages(prompt);
                    } else {
                        // Single image generation
                        console.log('🖼️ Routing to image generation...');
                        result = await studio.generateImage(prompt);
                    }
                    
                    // Store the generated image for potential video conversion
                    if (result.images && result.images.length > 0) {
                        window.cavAIStudioLastImage = result.images[0].dataUrl;
                        console.log('📷 Stored generated image for potential video conversion');
                        
                        // Save to AI Library Manager
                        if (window.cavAILibrary) {
                            result.images.forEach((img, idx) => {
                                const entry = window.cavAILibrary.addGeneratedImage({
                                    base64: img.dataUrl,
                                    thumbnail: img.dataUrl,
                                    prompt: prompt + (img.pmaxName ? ` [${img.pmaxName}]` : ` [${idx + 1}/${result.images.length}]`),
                                    model: result.modelName || 'gemini',
                                    width: img.width,
                                    height: img.height,
                                    format: 'png',
                                    metadata: { 
                                        generatedAt: new Date().toISOString(),
                                        mode: isPMaxAll ? 'pmax-set' : (isMultiImage ? 'multi-image' : 'text-to-image'),
                                        pmaxType: img.pmaxType || null,
                                        pmaxDimensions: img.pmaxDimensions || null,
                                        variationIndex: idx + 1,
                                        totalVariations: result.images.length,
                                    }
                                });
                                console.log('📚 Image saved to AI Library:', entry.id);
                            });
                        }
                    }
                }
                
                console.log('🎨 Generation result:', result);
                
                // Build the output HTML
                let outputHTML = '';
                
                // Check if we got a video in the response
                if (result.videoUrl) {
                    // Save to AI Library Manager (pair with last image if available)
                    let videoLibraryEntry = null;
                    if (window.cavAILibrary) {
                        const session = window.cavAILibrary.getCurrentSession();
                        const lastImageId = session.images.length > 0 ? 
                            session.images[session.images.length - 1].id : null;
                        
                        videoLibraryEntry = window.cavAILibrary.addGeneratedVideo({
                            url: result.videoUrl,
                            thumbnail: result.thumbnail || window.cavAIStudioLastImage,
                            prompt: prompt,
                            model: result.modelName || 'veo-3.1',
                            duration: result.duration,
                            format: 'mp4',
                            metadata: {
                                generatedAt: new Date().toISOString(),
                                mode: result.mode || 'text-to-video',
                                sourceImageId: lastImageId
                            }
                        }, lastImageId);
                        console.log('📚 Video saved to AI Library:', videoLibraryEntry.id);
                    }
                    
                    outputHTML += `
                        <div class="ai-generation-result">
                            <div class="ai-generation-header">
                                <span class="ai-generation-icon">🎬</span>
                                <span class="ai-generation-title">Video Generated with ${result.modelName || 'Veo 3.1'}</span>
                                <span class="ai-generation-mode" style="margin-left: auto; font-size: 0.75rem; color: #94a3b8;">
                                    ${result.mode === 'image-to-video' ? '📷→🎬 Image-to-Video' : '📝→🎬 Text-to-Video'}
                                </span>
                            </div>
                            <div class="ai-generated-video-container" style="margin-top: 1rem;">
                                <video controls autoplay muted loop style="width: 100%; border-radius: 8px; max-height: 400px;">
                                    <source src="${result.videoUrl}" type="video/mp4">
                                    Your browser does not support video playback.
                                </video>
                                <div class="ai-video-actions" style="display: flex; gap: 0.5rem; padding: 0.75rem; background: #2a2a3e; border-radius: 0 0 8px 8px;">
                                    <a href="${result.videoUrl}" download="generated-video-${Date.now()}.mp4" class="ai-image-download" style="flex: 1; text-align: center;">⬇️ Download Video</a>
                                    ${videoLibraryEntry ? `<span style="color: #22c55e; font-size: 0.8rem;">📚 Saved to Library</span>` : ''}
                                </div>
                            </div>
                            <p style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.75rem; text-align: center;">
                                💡 This video is now available. You can switch to Nano Banana to generate a new image, then convert it to video!
                            </p>
                        </div>
                    `;
                    thoughts.innerHTML = `<p>✅ Video generated successfully!</p>`;
                }
                // Check for video processing status
                else if (result.status === 'processing') {
                    outputHTML += `
                        <div class="ai-generation-result">
                            <div class="ai-generation-header">
                                <span class="ai-generation-icon">⏳</span>
                                <span class="ai-generation-title">Video Generation In Progress</span>
                            </div>
                            <div style="padding: 2rem; text-align: center;">
                                <div class="ai-generating-spinner" style="width: 40px; height: 40px; margin: 0 auto 1rem;"></div>
                                <p style="color: #f59e0b;">${result.message}</p>
                                <p style="font-size: 0.8rem; color: #94a3b8; margin-top: 1rem;">
                                    Video generation takes 30-60 seconds. Check back shortly!
                                </p>
                            </div>
                        </div>
                    `;
                    thoughts.innerHTML = `<p style="color: #f59e0b;">⏳ Video generation in progress...</p>`;
                }
                // Check if we got images in the response
                else if (result.images && result.images.length > 0) {
                    const isPMaxSet = result.pmaxSizes && result.pmaxSizes.length > 0;
                    const isMultiGen = result.images.length > 1;
                    
                    outputHTML += `
                        <div class="ai-generation-result">
                            <div class="ai-generation-header">
                                <span class="ai-generation-icon">${isPMaxSet ? '📢' : '🎨'}</span>
                                <span class="ai-generation-title">
                                    ${isPMaxSet ? 'Google Ads PMax Set' : `Generated with ${result.modelName || 'AI'}`}
                                    ${isMultiGen && !isPMaxSet ? ` (${result.images.length} images)` : ''}
                                </span>
                            </div>
                            ${isPMaxSet ? `
                                <div style="padding: 8px 16px; background: rgba(16, 185, 129, 0.1); border-radius: 8px; margin-bottom: 12px;">
                                    <p style="margin: 0; color: #10b981; font-size: 13px;">✅ Generated all 3 Google Ads PMax sizes - ready for your campaigns!</p>
                                </div>
                            ` : ''}
                            <div class="ai-generated-images" style="${isMultiGen ? 'display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;' : ''}">
                                ${result.images.map((img, idx) => `
                                    <div class="ai-generated-image-container" style="position: relative;">
                                        ${img.pmaxName ? `
                                            <div style="position: absolute; top: 8px; left: 8px; z-index: 10; background: rgba(0,0,0,0.8); color: #10b981; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;">
                                                📢 ${img.pmaxName} <span style="color: #94a3b8;">(${img.pmaxDimensions})</span>
                                            </div>
                                        ` : isMultiGen ? `
                                            <div style="position: absolute; top: 8px; left: 8px; z-index: 10; background: rgba(0,0,0,0.8); color: #a78bfa; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;">
                                                #${idx + 1}
                                            </div>
                                        ` : ''}
                                        <img src="${img.dataUrl}" alt="Generated image ${idx + 1}" class="ai-generated-image" style="width: 100%; border-radius: 8px;" />
                                        <div class="ai-image-actions" style="display: flex; gap: 8px; margin-top: 8px;">
                                            <a href="${img.dataUrl}" download="${img.pmaxName ? `pmax-${img.pmaxName.toLowerCase()}-${Date.now()}.png` : `generated-${idx + 1}-${Date.now()}.png`}" class="ai-image-download" style="flex: 1; text-align: center; padding: 8px; background: #1a1a2e; border-radius: 6px; text-decoration: none; color: white; font-size: 12px;">⬇️ Download</a>
                                            <button class="ai-image-copy" onclick="navigator.clipboard.writeText(this.closest('.ai-generated-image-container').querySelector('img').src).then(() => this.textContent = '✓ Copied!')" style="flex: 1; padding: 8px; background: #1a1a2e; border-radius: 6px; border: none; color: white; cursor: pointer; font-size: 12px;">📋 Copy</button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            <p style="font-size: 0.8rem; color: #22c55e; margin-top: 0.75rem; text-align: center;">
                                ${isPMaxSet ? '💡 Upload these to Google Ads for your Performance Max campaigns!' : '💡 Want to animate this image? Select <strong>Veo 3.1</strong> and describe the motion!'}
                            </p>
                        </div>
                    `;
                    thoughts.innerHTML = `<p>✅ Generated ${result.images.length} image(s)${isPMaxSet ? ' for Google Ads PMax' : ''} - Ready!</p>`;
                }
                
                // Add any text content
                if (result.text) {
                    const formattedText = formatAIResponse(result.text);
                    outputHTML += `
                        <div class="ai-analysis-result">
                            <div class="ai-analysis-header">
                                <span class="ai-analysis-icon">🤖</span>
                                <span class="ai-analysis-title">AI Response</span>
                            </div>
                            <div class="ai-analysis-content">
                                ${formattedText}
                            </div>
                        </div>
                    `;
                    if (!result.images?.length) {
                        thoughts.innerHTML = `<p>✅ Analysis complete</p>`;
                    }
                }
                
                // If nothing was returned
                if (!outputHTML) {
                    outputHTML = `
                        <div style="padding: 1.5rem; color: #f59e0b;">
                            <p>⚠️ Request processed but no content returned.</p>
                            <p style="font-size: 0.875rem; margin-top: 0.5rem;">
                                Try rephrasing your prompt or selecting a different model.
                            </p>
                        </div>
                    `;
                }
                
                output.innerHTML = outputHTML;

            } catch (error) {
                console.error('Generation error:', error);
                output.innerHTML = `
                    <div style="padding: 1.5rem; color: #ef4444;">
                        <p>❌ Error: ${error.message}</p>
                        <p style="font-size: 0.875rem; margin-top: 0.5rem; opacity: 0.8;">
                            Make sure your API key has access to the selected model. 
                            Visit <a href="https://aistudio.google.com" target="_blank" style="color: #60a5fa;">AI Studio</a> to check your access.
                        </p>
                    </div>
                `;
                thoughts.innerHTML = `<p style="color: #ef4444;">Error occurred during generation</p>`;
            } finally {
                runBtn.innerHTML = 'Analyze ⌘↵';
                runBtn.classList.remove('disabled');
            }
        });
        
        // Helper function to format AI responses
        function formatAIResponse(text) {
            // Convert markdown-style formatting
            let formatted = text
                // Headers
                .replace(/^### (.*$)/gm, '<h4 style="color: #a855f7; margin-top: 1rem;">$1</h4>')
                .replace(/^## (.*$)/gm, '<h3 style="color: #c084fc; margin-top: 1rem;">$1</h3>')
                .replace(/^# (.*$)/gm, '<h2 style="color: #e9d5ff; margin-top: 1rem;">$1</h2>')
                // Bold
                .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #fff;">$1</strong>')
                // Bullet points
                .replace(/^\* (.*$)/gm, '<li style="margin-left: 1rem;">$1</li>')
                .replace(/^- (.*$)/gm, '<li style="margin-left: 1rem;">$1</li>')
                // Numbered lists
                .replace(/^\d+\. (.*$)/gm, '<li style="margin-left: 1rem;">$1</li>')
                // Line breaks
                .replace(/\n\n/g, '</p><p>')
                .replace(/\n/g, '<br>');
            
            return `<p>${formatted}</p>`;
        }

        // ========================================
        // ASSET PREVIEW UPDATE HELPER
        // ========================================
        function updateAssetPreviewUI(asset) {
            // First, check if preview container exists, if not create it
            let previewContainer = container.querySelector('.ai-studio-asset-preview');
            const promptInputContainer = container.querySelector('.ai-studio-prompt-input-container');
            
            if (!previewContainer && promptInputContainer) {
                // Create preview container
                const previewDiv = document.createElement('div');
                previewDiv.className = 'ai-studio-asset-preview';
                promptInputContainer.insertBefore(previewDiv, promptInputContainer.firstChild);
                previewContainer = previewDiv;
            }
            
            if (previewContainer) {
                const imgSrc = asset.thumbnail_url || asset.thumbnail || asset.dataUrl || '';
                previewContainer.innerHTML = `
                    <img src="${imgSrc}" alt="${asset.filename || 'Asset'}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="ai-studio-asset-fallback" style="display:none; width:80px; height:60px; background:#3a3a4e; border-radius:4px; align-items:center; justify-content:center;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </div>
                    <div class="ai-studio-asset-info">
                        <strong>${asset.filename || 'Selected Asset'}</strong>
                        <span>${asset.width || '?'}×${asset.height || '?'} • ${asset.file_type || asset.type || 'image'}</span>
                    </div>
                    <button class="ai-studio-remove-asset" onclick="this.parentElement.remove(); window.cavAIStudio.selectedAsset = null;">✕</button>
                `;
                previewContainer.style.display = 'flex';
            }
            
            studio.selectedAsset = asset;
            console.log('✅ Asset loaded to AI Studio:', asset.filename);
        }

        // ========================================
        // ATTACHMENT DROPDOWN
        // ========================================
        const attachBtn = container.querySelector('#ai-attach-btn');
        const attachMenu = container.querySelector('#ai-attach-menu');
        
        if (attachBtn && attachMenu) {
            attachBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isVisible = attachMenu.style.display !== 'none';
                attachMenu.style.display = isVisible ? 'none' : 'block';
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!attachBtn.contains(e.target) && !attachMenu.contains(e.target)) {
                    attachMenu.style.display = 'none';
                }
            });
        }
        
        // Tools badge click - scroll to settings
        container.querySelector('#ai-tools-toggle')?.addEventListener('click', () => {
            const settingsPanel = container.querySelector('.ai-studio-settings-panel');
            const toolsSection = container.querySelector('#ai-tools-content');
            if (settingsPanel && toolsSection) {
                settingsPanel.scrollTo({ top: toolsSection.offsetTop - 100, behavior: 'smooth' });
                // Expand the tools section if collapsed
                if (toolsSection.style.display === 'none') {
                    toolsSection.style.display = 'block';
                }
            }
        });
        
        // Grounding badge click - toggle grounding
        container.querySelector('#ai-grounding-toggle')?.addEventListener('click', () => {
            studio.updateSetting('groundingEnabled', false);
            container.querySelector('#ai-grounding-toggle')?.remove();
            const groundingCheckbox = container.querySelector('#ai-grounding');
            if (groundingCheckbox) groundingCheckbox.checked = false;
        });

        // ========================================
        // ATTACH FILE - SELECT FROM LIBRARY
        // ========================================
        container.querySelector('#ai-attach-file')?.addEventListener('click', () => {
            // Close the dropdown menu
            if (attachMenu) attachMenu.style.display = 'none';
            // Get assets from library
            let assets = window.cavValidatorApp?.assets || [];
            
            // Also try localStorage fallback
            if (assets.length === 0) {
                try {
                    const userEmail = window.cavUserSession?.email || 'anonymous';
                    const sanitizedEmail = userEmail.replace(/[^a-z0-9]/g, '_');
                    const storageKey = `cav_assets_${sanitizedEmail}`;
                    const storedAssets = localStorage.getItem(storageKey);
                    if (storedAssets) {
                        assets = JSON.parse(storedAssets);
                    }
                } catch (e) {
                    console.warn('Failed to load assets from localStorage:', e);
                }
            }
            
            if (assets.length === 0) {
                // Show empty state with option to upload
                const emptyModal = document.createElement('div');
                emptyModal.className = 'ai-asset-picker-modal';
                emptyModal.innerHTML = `
                    <div class="ai-asset-picker-overlay" onclick="this.parentElement.remove()"></div>
                    <div class="ai-asset-picker-content" style="text-align: center; padding: 2rem;">
                        <button class="ai-asset-picker-close" onclick="this.closest('.ai-asset-picker-modal').remove()">×</button>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="1.5" style="margin-bottom: 1rem;">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <h3 style="color: #fff; margin-bottom: 0.5rem;">No Assets in Library</h3>
                        <p style="color: #888; margin-bottom: 1.5rem;">Upload an image or video to get started</p>
                        <button id="ai-picker-upload-btn" style="background: var(--cav-accent, #a855f7); color: #fff; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-size: 1rem;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 0.5rem;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            Upload File
                        </button>
                    </div>
                `;
                document.body.appendChild(emptyModal);
                
                // Handle upload from empty state
                emptyModal.querySelector('#ai-picker-upload-btn')?.addEventListener('click', () => {
                    emptyModal.remove();
                    container.querySelector('#ai-upload-file')?.click();
                });
                return;
            }
            
            // Create picker modal with assets
            const pickerModal = document.createElement('div');
            pickerModal.className = 'ai-asset-picker-modal';
            pickerModal.innerHTML = `
                <div class="ai-asset-picker-overlay" onclick="this.parentElement.remove()"></div>
                <div class="ai-asset-picker-content">
                    <button class="ai-asset-picker-close" onclick="this.closest('.ai-asset-picker-modal').remove()">×</button>
                    <h3 style="display: flex; align-items: center; gap: 0.5rem;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        Select Asset from Library
                    </h3>
                    <p style="color: #888; margin-bottom: 1rem; font-size: 0.9rem;">${assets.length} asset${assets.length !== 1 ? 's' : ''} available</p>
                    <div class="ai-asset-picker-grid">
                        ${assets.map(a => {
                            const imgSrc = a.thumbnail_url || a.thumbnail || a.dataUrl || '';
                            const fallbackSvg = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#333" width="100" height="100"/><text x="50" y="55" fill="#888" text-anchor="middle" font-size="30">?</text></svg>');
                            return `
                                <div class="ai-asset-picker-item" data-asset-id="${a.id}">
                                    <img src="${imgSrc}" alt="${a.filename || 'Asset'}" onerror="this.src='${fallbackSvg}'">
                                    <span>${a.filename || 'Untitled'}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
            
            // Add picker styles if not already added
            if (!document.getElementById('ai-asset-picker-styles')) {
                const style = document.createElement('style');
                style.id = 'ai-asset-picker-styles';
                style.textContent = `
                    .ai-asset-picker-modal { position: fixed; inset: 0; z-index: 400000; display: flex; align-items: center; justify-content: center; }
                    .ai-asset-picker-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); }
                    .ai-asset-picker-content { position: relative; background: var(--cav-card-bg, #1e1e2e); border-radius: 16px; padding: 1.5rem; max-width: 700px; width: 95%; max-height: 80vh; overflow-y: auto; border: 1px solid var(--cav-border, rgba(255,255,255,0.1)); }
                    .ai-asset-picker-close { position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: #888; font-size: 1.5rem; cursor: pointer; transition: color 0.2s; }
                    .ai-asset-picker-close:hover { color: #fff; }
                    .ai-asset-picker-content h3 { margin: 0 0 0.5rem; color: #fff; font-size: 1.25rem; }
                    .ai-asset-picker-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 1rem; }
                    .ai-asset-picker-item { background: rgba(255,255,255,0.05); border-radius: 12px; padding: 0.75rem; cursor: pointer; text-align: center; transition: all 0.2s; border: 2px solid transparent; }
                    .ai-asset-picker-item:hover { background: rgba(168,85,247,0.15); border-color: var(--cav-accent, #a855f7); transform: translateY(-2px); }
                    .ai-asset-picker-item img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 8px; background: #222; }
                    .ai-asset-picker-item span { display: block; font-size: 0.75rem; color: #aaa; margin-top: 0.5rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                `;
                document.head.appendChild(style);
            }
            
            document.body.appendChild(pickerModal);
            
            // Handle asset selection
            pickerModal.querySelectorAll('.ai-asset-picker-item').forEach(item => {
                item.addEventListener('click', () => {
                    const assetId = item.dataset.assetId;
                    const asset = assets.find(a => a.id === assetId);
                    if (asset) {
                        updateAssetPreviewUI(asset);
                    }
                    pickerModal.remove();
                });
            });
        });

        // ========================================
        // UPLOAD FILE - FROM COMPUTER/DRIVE
        // ========================================
        const uploadBtn = container.querySelector('#ai-upload-file');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Close the dropdown menu
                if (attachMenu) attachMenu.style.display = 'none';
                
                // Create and configure file input
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'image/*,video/*';
                fileInput.style.cssText = 'position:absolute;left:-9999px;';
                
                fileInput.onchange = async function(event) {
                    const file = event.target.files?.[0];
                    if (!file) {
                        fileInput.remove();
                        return;
                    }
                    
                    console.log('📂 File selected:', file.name, file.type, file.size);
                    
                    try {
                        const reader = new FileReader();
                        reader.onload = function(readerEvent) {
                            const dataUrl = readerEvent.target.result;
                            
                            // Create asset object
                            const asset = {
                                id: 'ai-upload-' + Date.now(),
                                filename: file.name,
                                file_type: file.type.startsWith('video/') ? 'video' : 'image',
                                type: file.type,
                                dataUrl: dataUrl,
                                thumbnail: dataUrl,
                                size: file.size
                            };
                            
                            // Get dimensions for images
                            if (file.type.startsWith('image/')) {
                                const img = new Image();
                                img.onload = function() {
                                    asset.width = img.width;
                                    asset.height = img.height;
                                    updateAssetPreviewUI(asset);
                                };
                                img.onerror = function() {
                                    updateAssetPreviewUI(asset);
                                };
                                img.src = dataUrl;
                            } else if (file.type.startsWith('video/')) {
                                // Get video dimensions
                                const video = document.createElement('video');
                                video.preload = 'metadata';
                                video.onloadedmetadata = function() {
                                    asset.width = video.videoWidth;
                                    asset.height = video.videoHeight;
                                    asset.duration = video.duration;
                                    updateAssetPreviewUI(asset);
                                };
                                video.onerror = function() {
                                    updateAssetPreviewUI(asset);
                                };
                                video.src = dataUrl;
                            } else {
                                updateAssetPreviewUI(asset);
                            }
                        };
                        
                        reader.onerror = function(error) {
                            console.error('Failed to read file:', error);
                            alert('Failed to read file. Please try again.');
                        };
                        
                        reader.readAsDataURL(file);
                    } catch (error) {
                        console.error('Failed to process file:', error);
                        alert('Failed to process file: ' + error.message);
                    } finally {
                        fileInput.remove();
                    }
                };
                
                // Append to body and trigger click
                document.body.appendChild(fileInput);
                fileInput.click();
            });
        }

        // ========================================
        // URL INPUT - GENERATE FROM LANDING PAGE
        // ========================================
        container.querySelector('#ai-url-input-btn')?.addEventListener('click', () => {
            // Create URL input modal
            const urlModal = document.createElement('div');
            urlModal.className = 'ai-asset-picker-modal';
            urlModal.innerHTML = `
                <div class="ai-asset-picker-overlay" onclick="this.parentElement.remove()"></div>
                <div class="ai-asset-picker-content" style="max-width: 600px;">
                    <button class="ai-asset-picker-close" onclick="this.closest('.ai-asset-picker-modal').remove()">×</button>
                    <h3 style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--cav-accent, #a855f7)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        Generate Images from Landing Page
                    </h3>
                    <p style="color: #888; margin-bottom: 1.5rem; font-size: 0.9rem;">
                        Enter a landing page URL to analyze and generate creative assets based on its design, content, and brand.
                    </p>
                    
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; color: #aaa; font-size: 0.85rem; margin-bottom: 0.5rem;">Landing Page URL</label>
                        <input type="url" id="ai-landing-page-url" placeholder="https://example.com/landing-page" style="width: 100%; padding: 0.75rem 1rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 1rem;">
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; color: #aaa; font-size: 0.85rem; margin-bottom: 0.5rem;">Additional Instructions (optional)</label>
                        <textarea id="ai-landing-page-instructions" placeholder="e.g., Create a Facebook ad, focus on the hero section, match the color scheme..." style="width: 100%; padding: 0.75rem 1rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 0.95rem; resize: vertical; min-height: 80px;"></textarea>
                    </div>
                    
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; color: #aaa; font-size: 0.85rem; margin-bottom: 0.5rem;">Output Type</label>
                        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.5rem 1rem; background: rgba(168,85,247,0.2); border: 1px solid var(--cav-accent, #a855f7); border-radius: 8px; color: #fff;">
                                <input type="radio" name="ai-output-type" value="ad" checked style="accent-color: var(--cav-accent, #a855f7);">
                                <span>Ad Creative</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.5rem 1rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #aaa;">
                                <input type="radio" name="ai-output-type" value="banner" style="accent-color: var(--cav-accent, #a855f7);">
                                <span>Display Banner</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.5rem 1rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #aaa;">
                                <input type="radio" name="ai-output-type" value="social" style="accent-color: var(--cav-accent, #a855f7);">
                                <span>Social Post</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.5rem 1rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #aaa;">
                                <input type="radio" name="ai-output-type" value="hero" style="accent-color: var(--cav-accent, #a855f7);">
                                <span>Hero Image</span>
                            </label>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                        <button id="ai-url-cancel" style="padding: 0.75rem 1.5rem; background: transparent; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: #aaa; cursor: pointer;">Cancel</button>
                        <button id="ai-url-generate" style="padding: 0.75rem 1.5rem; background: var(--cav-accent, #a855f7); border: none; border-radius: 8px; color: #fff; cursor: pointer; font-weight: 500;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 0.5rem;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                            Analyze & Generate
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(urlModal);
            
            // Style radio buttons on selection
            urlModal.querySelectorAll('input[name="ai-output-type"]').forEach(radio => {
                radio.addEventListener('change', () => {
                    urlModal.querySelectorAll('input[name="ai-output-type"]').forEach(r => {
                        const label = r.closest('label');
                        if (r.checked) {
                            label.style.background = 'rgba(168,85,247,0.2)';
                            label.style.borderColor = 'var(--cav-accent, #a855f7)';
                            label.style.color = '#fff';
                        } else {
                            label.style.background = 'rgba(255,255,255,0.05)';
                            label.style.borderColor = 'rgba(255,255,255,0.1)';
                            label.style.color = '#aaa';
                        }
                    });
                });
            });
            
            // Cancel button
            urlModal.querySelector('#ai-url-cancel')?.addEventListener('click', () => urlModal.remove());
            
            // Generate button
            urlModal.querySelector('#ai-url-generate')?.addEventListener('click', async () => {
                const urlInput = urlModal.querySelector('#ai-landing-page-url');
                const instructionsInput = urlModal.querySelector('#ai-landing-page-instructions');
                const outputType = urlModal.querySelector('input[name="ai-output-type"]:checked')?.value || 'ad';
                
                const url = urlInput?.value?.trim();
                const instructions = instructionsInput?.value?.trim();
                
                if (!url) {
                    alert('Please enter a landing page URL');
                    urlInput?.focus();
                    return;
                }
                
                // Validate URL
                try {
                    new URL(url);
                } catch {
                    alert('Please enter a valid URL (e.g., https://example.com)');
                    urlInput?.focus();
                    return;
                }
                
                // Update button to loading state
                const generateBtn = urlModal.querySelector('#ai-url-generate');
                const originalBtnContent = generateBtn.innerHTML;
                generateBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite; vertical-align: middle; margin-right: 0.5rem;"><circle cx="12" cy="12" r="10" stroke-dasharray="30 60"/></svg> Analyzing...';
                generateBtn.disabled = true;
                
                try {
                    // Build the prompt for landing page analysis and generation
                    const outputTypePrompts = {
                        ad: 'a compelling ad creative suitable for Facebook/Instagram ads',
                        banner: 'a display banner ad (300x250 or 728x90 style)',
                        social: 'a social media post image',
                        hero: 'a hero section image'
                    };
                    
                    const prompt = `Analyze the landing page at ${url} and create ${outputTypePrompts[outputType]}.

Instructions: ${instructions || 'Match the brand colors, typography style, and overall aesthetic of the landing page.'}

Requirements:
1. Extract the brand colors and visual style from the landing page
2. Identify the main value proposition and key messaging
3. Create a visually compelling image that:
   - Matches the brand identity
   - Highlights the main product/service
   - Includes appropriate call-to-action elements
   - Is optimized for ${outputType === 'ad' ? 'paid advertising' : outputType === 'banner' ? 'display networks' : outputType === 'social' ? 'social media engagement' : 'hero sections'}

Generate a professional, high-quality image based on this analysis.`;

                    // Store the URL info in studio
                    studio.landingPageUrl = url;
                    studio.landingPageOutputType = outputType;
                    
                    // Close the modal
                    urlModal.remove();
                    
                    // Set the prompt in the main input
                    const promptInput = container.querySelector('#ai-prompt-input');
                    if (promptInput) {
                        promptInput.value = prompt;
                    }
                    
                    // Also set quick prompt
                    const quickPrompt = container.querySelector('#ai-quick-prompt');
                    if (quickPrompt) {
                        quickPrompt.value = `Generate ${outputTypePrompts[outputType]} from ${url}`;
                    }
                    
                    // Update the output area to show we're processing
                    const outputArea = container.querySelector('#ai-output');
                    if (outputArea) {
                        outputArea.innerHTML = `
                            <div style="text-align: center; padding: 2rem;">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--cav-accent, #a855f7)" stroke-width="2" style="animation: spin 2s linear infinite; margin-bottom: 1rem;">
                                    <circle cx="12" cy="12" r="10" stroke-dasharray="30 60"/>
                                </svg>
                                <h4 style="color: #fff; margin-bottom: 0.5rem;">Analyzing Landing Page...</h4>
                                <p style="color: #888; font-size: 0.9rem;">${url}</p>
                                <p style="color: #aaa; font-size: 0.85rem; margin-top: 1rem;">Extracting brand elements, colors, and content to generate your ${outputTypePrompts[outputType]}.</p>
                            </div>
                        `;
                    }
                    
                    // Trigger the generation
                    try {
                        const result = await studio.generateImage(prompt);
                        
                        // Display the result
                        if (result.images && result.images.length > 0) {
                            outputArea.innerHTML = `
                                <div style="padding: 1rem;">
                                    <h4 style="color: #fff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                                        Generated from Landing Page
                                    </h4>
                                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
                                        ${result.images.map((img, i) => `
                                            <div style="background: rgba(255,255,255,0.05); border-radius: 12px; overflow: hidden;">
                                                <img src="${img.dataUrl}" alt="Generated ${i + 1}" style="width: 100%; display: block;">
                                                <div style="padding: 0.75rem; display: flex; gap: 0.5rem;">
                                                    <a href="${img.dataUrl}" download="landing-page-${outputType}-${Date.now()}.png" style="flex: 1; padding: 0.5rem; background: var(--cav-accent, #a855f7); color: #fff; text-align: center; border-radius: 6px; text-decoration: none; font-size: 0.85rem;">Download</a>
                                                    <button onclick="navigator.clipboard.writeText('${img.dataUrl.substring(0, 50)}...'); this.textContent='Copied!'" style="padding: 0.5rem 0.75rem; background: rgba(255,255,255,0.1); border: none; border-radius: 6px; color: #aaa; cursor: pointer; font-size: 0.85rem;">Copy</button>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                    ${result.text ? `<div style="margin-top: 1rem; padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px; color: #aaa; font-size: 0.9rem;">${result.text}</div>` : ''}
                                </div>
                            `;
                        } else if (result.text) {
                            outputArea.innerHTML = `
                                <div style="padding: 1rem;">
                                    <h4 style="color: #fff; margin-bottom: 1rem;">Analysis Result</h4>
                                    <div style="padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px; color: #ccc; line-height: 1.6;">${formatMarkdown(result.text)}</div>
                                </div>
                            `;
                        }
                    } catch (genError) {
                        outputArea.innerHTML = `
                            <div style="text-align: center; padding: 2rem;">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" style="margin-bottom: 1rem;">
                                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                                </svg>
                                <h4 style="color: #fff; margin-bottom: 0.5rem;">Generation Failed</h4>
                                <p style="color: #888; font-size: 0.9rem;">${genError.message || 'An error occurred'}</p>
                                <button onclick="document.querySelector('#ai-run-btn')?.click()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--cav-accent, #a855f7); border: none; border-radius: 6px; color: #fff; cursor: pointer;">Try Again</button>
                            </div>
                        `;
                    }
                } catch (error) {
                    console.error('Landing page analysis failed:', error);
                    generateBtn.innerHTML = originalBtnContent;
                    generateBtn.disabled = false;
                    alert('Failed to analyze landing page: ' + error.message);
                }
            });
            
            // Focus URL input
            setTimeout(() => urlModal.querySelector('#ai-landing-page-url')?.focus(), 100);
        });

        // Quick prompt enter key
        container.querySelector('#ai-quick-prompt')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                container.querySelector('#ai-run-btn').click();
            }
        });
        
        // Also detect URL paste in quick prompt
        container.querySelector('#ai-quick-prompt')?.addEventListener('paste', (e) => {
            setTimeout(() => {
                const value = e.target.value.trim();
                if (value.match(/^https?:\/\//)) {
                    // It's a URL - offer to use landing page generator
                    const useGenerator = confirm('Would you like to analyze this landing page and generate images from it?');
                    if (useGenerator) {
                        container.querySelector('#ai-url-input-btn')?.click();
                        setTimeout(() => {
                            const urlInput = document.querySelector('#ai-landing-page-url');
                            if (urlInput) urlInput.value = value;
                        }, 100);
                    }
                }
            }, 10);
        });
    }

    // ============================================
    // EXPORT
    // ============================================
    window.AIStudio = AIStudio;
    window.cavAIStudio = new AIStudio();
    
    window.cavAIStudio.openStudio = function(asset = null) {
        const existing = document.getElementById('ai-studio-modal');
        if (existing) existing.remove();
        
        const container = createAIStudioInterface(window.cavAIStudio, asset);
        document.body.appendChild(container);
        attachAIStudioEvents(window.cavAIStudio, container);
        
        // Focus prompt input
        setTimeout(() => {
            container.querySelector('#ai-prompt-input')?.focus();
        }, 100);
    };

    window.AI_MODELS = AI_MODELS;

    console.log('🤖 AI Studio Interface loaded - Version 3.0.0');
    console.log('   Models: Nano Banana Pro, Veo4, Gemini 2.0 Flash');
    console.log('   Features: Library picker, File upload, Landing page to image');

})();

