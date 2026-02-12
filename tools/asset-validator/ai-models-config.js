/**
 * AI Models Configuration
 * Centralized configuration for all AI models used across the Creative Asset Validator
 * Version: 1.0.1 - January 17, 2026
 * 
 * Updated with latest model IDs from official documentation:
 * - Gemini 3: https://ai.google.dev/gemini-api/docs (Jan 2026)
 * - GPT-5.2: OpenAI API Reference (Dec 2025)
 * - Veo 3.1: Google AI Studio
 * - Claude: Anthropic API Reference
 * 
 * This file ensures all modules use the latest AI models consistently.
 */

(function() {
    'use strict';

    const VERSION = '1.0.1';

    // ============================================
    // LATEST AI MODELS CONFIGURATION
    // Based on official documentation as of January 2026
    // ============================================

    const AIModels = {

        // ============================================
        // GOOGLE GEMINI 3 MODELS
        // Docs: https://ai.google.dev/gemini-api/docs
        // Knowledge Cutoff: January 2025
        // Context Window: 1M input / 64k output
        // ============================================
        gemini: {
            // Gemini 3 Pro - Most capable for complex tasks
            pro: {
                id: 'gemini-3-pro-preview',
                name: 'Gemini 3 Pro',
                subtitle: 'gemini-3-pro-preview',
                description: 'Most intelligent model for complex tasks requiring broad world knowledge and advanced reasoning',
                endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent',
                maxInputTokens: 1000000,
                maxOutputTokens: 64000,
                knowledgeCutoff: 'January 2025',
                pricing: { input: 2, output: 12 }, // per 1M tokens
                capabilities: ['text', 'analysis', 'json', 'code', 'reasoning', 'vision', 'thinking'],
                thinkingLevels: ['low', 'high'],
                defaultThinking: 'high',
                icon: '🧠',
                color: '#4285f4'
            },
            
            // Gemini 3 Flash - Pro-level intelligence at Flash speed
            flash: {
                id: 'gemini-3-flash-preview',
                name: 'Gemini 3 Flash',
                subtitle: 'gemini-3-flash-preview',
                description: 'Pro-level intelligence at the speed and pricing of Flash',
                endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent',
                maxInputTokens: 1000000,
                maxOutputTokens: 64000,
                knowledgeCutoff: 'January 2025',
                pricing: { input: 0.5, output: 3 }, // per 1M tokens
                capabilities: ['text', 'analysis', 'json', 'code', 'reasoning', 'vision', 'thinking'],
                thinkingLevels: ['minimal', 'low', 'medium', 'high'],
                defaultThinking: 'high',
                icon: '⚡',
                color: '#4285f4'
            },

            // Gemini 2.0 Flash (Legacy/Fallback)
            flash2: {
                id: 'gemini-2.0-flash-exp',
                name: 'Gemini 2.0 Flash',
                subtitle: 'gemini-2.0-flash-exp',
                description: 'Fast and efficient model for quick analysis (legacy)',
                endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
                maxOutputTokens: 8192,
                capabilities: ['text', 'analysis', 'json', 'code'],
                icon: '⚡',
                color: '#4285f4'
            }
        },

        // ============================================
        // GOOGLE IMAGEN / NANO BANANA MODELS
        // Docs: https://ai.google.dev/gemini-api/docs/imagen
        // ============================================
        imagen: {
            // Nano Banana - Fast image generation (Gemini 2.5 Flash Image)
            nanoBanana: {
                id: 'gemini-2.5-flash-image',
                name: 'Nano Banana',
                subtitle: 'gemini-2.5-flash-image',
                description: 'Fast, efficient image generation',
                endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent',
                maxImages: 4,
                maxResolution: '1536x1536',
                capabilities: ['image-generation', 'image-editing'],
                icon: '🍌',
                color: '#fbbc04'
            },

            // Nano Banana Pro - Highest quality image generation (Gemini 3 Pro Image)
            nanoBananaPro: {
                id: 'gemini-3-pro-image-preview',
                name: 'Nano Banana Pro',
                subtitle: 'gemini-3-pro-image-preview',
                description: 'Highest quality image generation. 4K resolution. Google Search grounding. Thinking mode.',
                endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent',
                maxImages: 8,
                maxResolution: '4096x4096',
                knowledgeCutoff: 'January 2025',
                pricing: { input: 2, imageOutput: 0.134 }, // per 1M tokens / per image
                capabilities: ['image-generation', 'image-editing', '4k', 'thinking', 'text-rendering', 'grounded-generation', 'conversational-editing'],
                aspectRatios: ['1:1', '3:4', '4:3', '9:16', '16:9'],
                imageSizes: ['1K', '2K', '4K'],
                icon: '🍌✨',
                color: '#fbbc04'
            },

            // Imagen 3
            imagen3: {
                id: 'imagen-3.0-generate-002',
                name: 'Imagen 3',
                subtitle: 'imagen-3.0-generate-002',
                description: 'Google\'s photorealistic image generation model',
                endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict',
                maxImages: 4,
                maxResolution: '1024x1024',
                capabilities: ['image-generation', 'photorealistic'],
                icon: '🎨',
                color: '#ea4335'
            }
        },

        // ============================================
        // GOOGLE VEO 3.1 MODELS (Video Generation)
        // Docs: https://ai.google.dev/gemini-api/docs/video
        // ============================================
        veo: {
            // Veo 3.1 - State-of-the-art video generation with native audio
            veo31: {
                id: 'veo-3.1-generate-preview',
                name: 'Veo 3.1',
                subtitle: 'veo-3.1-generate-preview',
                description: 'State-of-the-art video generation with native audio. 720p/1080p. 4-8 seconds, extendable to 148s.',
                endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:predict',
                maxDuration: 148,
                resolutions: ['720p', '1080p'],
                capabilities: ['video-generation', 'native-audio', 'text-to-video', 'image-to-video', 'video-extension'],
                aspectRatios: ['16:9', '9:16', '1:1'],
                icon: '🎬',
                color: '#34a853'
            },

            // Veo 3.1 Fast - Faster video generation
            veo31Fast: {
                id: 'veo-3.1-fast-generate-preview',
                name: 'Veo 3.1 Fast',
                subtitle: 'veo-3.1-fast-generate-preview',
                description: 'Fast video generation optimized for speed. Best for rapid A/B testing, ads, and social content.',
                endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-fast-generate-preview:predict',
                maxDuration: 8,
                resolutions: ['720p'],
                capabilities: ['video-generation', 'fast', 'text-to-video'],
                aspectRatios: ['16:9', '9:16', '1:1'],
                icon: '⚡🎬',
                color: '#34a853'
            }
        },

        // ============================================
        // ANTHROPIC CLAUDE MODELS
        // Docs: https://docs.anthropic.com/en/docs/models
        // ============================================
        claude: {
            // Claude Opus 4.5 - Most capable
            opus: {
                id: 'claude-opus-4-5-20250929',
                name: 'Claude Opus 4.5',
                subtitle: 'claude-opus-4-5-20250929',
                description: 'Most capable Claude model for complex tasks and extended thinking',
                endpoint: 'https://api.anthropic.com/v1/messages',
                maxTokens: 32768,
                capabilities: ['text', 'analysis', 'vision', 'code', 'reasoning', 'extended-thinking'],
                icon: '🎭',
                color: '#d97706'
            },

            // Claude Sonnet 4.5 - Balanced performance
            sonnet: {
                id: 'claude-sonnet-4-5-20250929',
                name: 'Claude Sonnet 4.5',
                subtitle: 'claude-sonnet-4-5-20250929',
                description: 'Balanced performance and speed for most tasks',
                endpoint: 'https://api.anthropic.com/v1/messages',
                maxTokens: 16384,
                capabilities: ['text', 'analysis', 'vision', 'code'],
                icon: '📝',
                color: '#d97706'
            },

            // Claude Haiku 4 - Fast
            haiku: {
                id: 'claude-haiku-4-20250929',
                name: 'Claude Haiku 4',
                subtitle: 'claude-haiku-4-20250929',
                description: 'Fastest Claude model for quick responses',
                endpoint: 'https://api.anthropic.com/v1/messages',
                maxTokens: 8192,
                capabilities: ['text', 'analysis'],
                icon: '⚡',
                color: '#d97706'
            }
        },

        // ============================================
        // OPENAI GPT-5 MODELS
        // Docs: https://platform.openai.com/docs/models
        // GPT-5.2 Knowledge Cutoff: August 31, 2025
        // ============================================
        openai: {
            // GPT-5.2 - Flagship model for coding and agentic tasks
            gpt52: {
                id: 'gpt-5.2',
                snapshotId: 'gpt-5.2-2025-12-11',
                name: 'GPT-5.2',
                subtitle: 'gpt-5.2-2025-12-11',
                description: 'Flagship model for coding and agentic tasks across industries. Highest reasoning capability.',
                endpoint: 'https://api.openai.com/v1/chat/completions',
                maxInputTokens: 400000,
                maxOutputTokens: 128000,
                knowledgeCutoff: 'August 31, 2025',
                pricing: { input: 1.75, cachedInput: 0.175, output: 14 }, // per 1M tokens
                capabilities: ['text', 'analysis', 'vision', 'code', 'reasoning', 'function-calling', 'structured-outputs'],
                reasoningEffort: ['none', 'low', 'medium', 'high', 'xhigh'],
                icon: '🤖',
                color: '#10a37f'
            },

            // GPT-5 - Previous flagship
            gpt5: {
                id: 'gpt-5',
                name: 'GPT-5',
                subtitle: 'gpt-5',
                description: 'Previous flagship model',
                endpoint: 'https://api.openai.com/v1/chat/completions',
                maxInputTokens: 400000,
                maxOutputTokens: 128000,
                pricing: { input: 1.25, output: 10 },
                capabilities: ['text', 'analysis', 'vision', 'code', 'reasoning'],
                icon: '🤖',
                color: '#10a37f'
            },

            // GPT-5 Mini - Fast and cost-effective
            gpt5Mini: {
                id: 'gpt-5-mini',
                name: 'GPT-5 Mini',
                subtitle: 'gpt-5-mini',
                description: 'Fast and cost-effective for simpler tasks',
                endpoint: 'https://api.openai.com/v1/chat/completions',
                maxOutputTokens: 32000,
                pricing: { input: 0.25, output: 1 },
                capabilities: ['text', 'analysis', 'code'],
                icon: '⚡',
                color: '#10a37f'
            },

            // GPT-4o - Multimodal (for backward compatibility)
            gpt4o: {
                id: 'gpt-4o',
                name: 'GPT-4o',
                subtitle: 'gpt-4o',
                description: 'Multimodal model (legacy)',
                endpoint: 'https://api.openai.com/v1/chat/completions',
                maxTokens: 16384,
                capabilities: ['text', 'analysis', 'vision', 'code'],
                icon: '👁️',
                color: '#10a37f'
            },

            // DALL-E 3 - Image generation
            dalle3: {
                id: 'dall-e-3',
                name: 'DALL-E 3',
                subtitle: 'dall-e-3',
                description: 'OpenAI image generation',
                endpoint: 'https://api.openai.com/v1/images/generations',
                maxImages: 1,
                maxResolution: '1024x1792',
                capabilities: ['image-generation'],
                icon: '🎨',
                color: '#10a37f'
            }
        },

        // ============================================
        // CLOUDINARY AI
        // Docs: https://cloudinary.com/documentation/ai_in_action
        // ============================================
        cloudinary: {
            backgroundRemoval: {
                id: 'cloudinary_ai',
                name: 'Background Removal',
                description: 'AI-powered background removal',
                transformation: 'e_background_removal',
                capabilities: ['background-removal']
            },
            objectDetection: {
                id: 'cld-fashion',
                name: 'Object Detection',
                description: 'Detect objects in images',
                addon: 'cld-fashion',
                capabilities: ['object-detection', 'fashion']
            },
            autoTagging: {
                id: 'google_tagging',
                name: 'Auto-Tagging',
                description: 'AI-powered automatic tagging',
                addon: 'google_tagging',
                capabilities: ['auto-tagging', 'categorization']
            },
            moderation: {
                id: 'aws_rek_moderation',
                name: 'Content Moderation',
                description: 'Detect inappropriate content',
                addon: 'aws_rek_moderation',
                capabilities: ['moderation', 'nsfw-detection']
            },
            ocr: {
                id: 'ocr_text',
                name: 'OCR Text Detection',
                description: 'Extract text from images',
                addon: 'ocr_text',
                capabilities: ['ocr', 'text-extraction']
            },
            faceDetection: {
                id: 'adv_face',
                name: 'Face Detection',
                description: 'Detect and analyze faces',
                addon: 'adv_face',
                capabilities: ['face-detection', 'face-attributes']
            }
        },

        // ============================================
        // GOOGLE CLOUD VISION
        // Docs: https://cloud.google.com/vision/docs
        // ============================================
        googleVision: {
            labelDetection: {
                id: 'LABEL_DETECTION',
                name: 'Label Detection',
                description: 'Identify objects and scenes',
                maxResults: 20,
                capabilities: ['labels', 'objects', 'scenes']
            },
            textDetection: {
                id: 'TEXT_DETECTION',
                name: 'Text Detection',
                description: 'Extract text from images',
                capabilities: ['ocr', 'text-extraction']
            },
            faceDetection: {
                id: 'FACE_DETECTION',
                name: 'Face Detection',
                description: 'Detect faces and emotions',
                maxResults: 10,
                capabilities: ['face-detection', 'emotions', 'landmarks']
            },
            logoDetection: {
                id: 'LOGO_DETECTION',
                name: 'Logo Detection',
                description: 'Detect brand logos',
                maxResults: 10,
                capabilities: ['logo-detection', 'brand-recognition']
            },
            safeSearch: {
                id: 'SAFE_SEARCH_DETECTION',
                name: 'Safe Search',
                description: 'Detect adult/violent content',
                capabilities: ['content-moderation', 'nsfw-detection']
            },
            imageProperties: {
                id: 'IMAGE_PROPERTIES',
                name: 'Image Properties',
                description: 'Extract colors and properties',
                capabilities: ['colors', 'properties']
            },
            webDetection: {
                id: 'WEB_DETECTION',
                name: 'Web Detection',
                description: 'Find similar images online',
                capabilities: ['reverse-image-search', 'web-entities']
            }
        }
    };

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    /**
     * Get the best model for a specific task
     */
    function getModelForTask(task) {
        const taskModels = {
            // Text/Analysis tasks - Use Gemini 3 Flash (fast) or Pro (complex)
            'analysis': AIModels.gemini.flash,
            'text-generation': AIModels.gemini.flash,
            'json-extraction': AIModels.gemini.flash,
            'complex-reasoning': AIModels.gemini.pro,
            'code-generation': AIModels.openai.gpt52,
            
            // Image tasks - Use Nano Banana Pro for highest quality
            'image-generation': AIModels.imagen.nanoBananaPro,
            'image-editing': AIModels.imagen.nanoBananaPro,
            'image-analysis': AIModels.gemini.flash,
            
            // Video tasks - Use Veo 3.1
            'video-generation': AIModels.veo.veo31,
            'video-fast': AIModels.veo.veo31Fast,
            'video-analysis': AIModels.gemini.flash,
            
            // Vision/Multimodal
            'vision': AIModels.openai.gpt52,
            'multimodal': AIModels.gemini.pro,
            
            // Cloud services
            'background-removal': AIModels.cloudinary.backgroundRemoval,
            'object-detection': AIModels.googleVision.labelDetection,
            'face-detection': AIModels.googleVision.faceDetection,
            'text-extraction': AIModels.googleVision.textDetection,
            'logo-detection': AIModels.googleVision.logoDetection,
            'content-moderation': AIModels.googleVision.safeSearch
        };

        return taskModels[task] || AIModels.gemini.flash;
    }

    /**
     * Get the Gemini endpoint URL for a specific model
     */
    function getGeminiEndpoint(modelKey = 'flash') {
        const model = AIModels.gemini[modelKey] || AIModels.gemini.flash;
        return model.endpoint;
    }

    /**
     * Get the Gemini model ID
     */
    function getGeminiModelId(modelKey = 'flash') {
        const model = AIModels.gemini[modelKey] || AIModels.gemini.flash;
        return model.id;
    }

    /**
     * Build Gemini API URL with key
     */
    function buildGeminiUrl(apiKey, modelKey = 'flash') {
        const modelId = getGeminiModelId(modelKey);
        return `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
    }

    /**
     * Get Claude model configuration
     */
    function getClaudeModel(tier = 'sonnet') {
        return AIModels.claude[tier] || AIModels.claude.sonnet;
    }

    /**
     * Get OpenAI model configuration
     */
    function getOpenAIModel(tier = 'gpt52') {
        return AIModels.openai[tier] || AIModels.openai.gpt52;
    }

    /**
     * Get the actual OpenAI model ID to use in API calls
     * Maps user-friendly names to actual API model IDs
     */
    function getOpenAIActualModelId(requestedModel) {
        const modelMap = {
            'gpt-5.2': 'gpt-5.2',
            'gpt-5.2-2025-12-11': 'gpt-5.2-2025-12-11',
            'gpt-5': 'gpt-5',
            'gpt-5-mini': 'gpt-5-mini',
            'gpt-4o': 'gpt-4o',
            'gpt-4o-mini': 'gpt-4o-mini',
            'gpt-4-turbo': 'gpt-4-turbo',
            'gpt-4': 'gpt-4'
        };
        return modelMap[requestedModel] || 'gpt-5.2';
    }

    /**
     * Get Veo model configuration
     */
    function getVeoModel(speed = 'full') {
        return speed === 'fast' ? AIModels.veo.veo31Fast : AIModels.veo.veo31;
    }

    /**
     * Get Imagen/Nano Banana model configuration
     */
    function getImagenModel(quality = 'pro') {
        return quality === 'fast' ? AIModels.imagen.nanoBanana : AIModels.imagen.nanoBananaPro;
    }

    /**
     * Get Cloudinary AI capability
     */
    function getCloudinaryCapability(capability) {
        return AIModels.cloudinary[capability] || null;
    }

    /**
     * Get Google Vision feature
     */
    function getGoogleVisionFeature(feature) {
        return AIModels.googleVision[feature] || null;
    }

    /**
     * Build Google Vision request features array
     */
    function buildVisionFeatures(features = ['labelDetection', 'textDetection', 'faceDetection']) {
        return features.map(f => {
            const feature = AIModels.googleVision[f];
            if (!feature) return null;
            return {
                type: feature.id,
                maxResults: feature.maxResults || 10
            };
        }).filter(Boolean);
    }

    // ============================================
    // EXPORT
    // ============================================

    window.AIModels = {
        config: AIModels,
        version: VERSION,
        
        // Model getters
        getModelForTask,
        getGeminiEndpoint,
        getGeminiModelId,
        buildGeminiUrl,
        getClaudeModel,
        getOpenAIModel,
        getOpenAIActualModelId,
        getVeoModel,
        getImagenModel,
        getCloudinaryCapability,
        getGoogleVisionFeature,
        buildVisionFeatures,

        // Quick access to models
        gemini: {
            pro: AIModels.gemini.pro,           // gemini-3-pro-preview
            flash: AIModels.gemini.flash,       // gemini-3-flash-preview
            flash2: AIModels.gemini.flash2      // gemini-2.0-flash-exp (legacy)
        },
        imagen: {
            nanoBanana: AIModels.imagen.nanoBanana,           // gemini-2.5-flash-image
            nanoBananaPro: AIModels.imagen.nanoBananaPro,     // gemini-3-pro-image-preview
            imagen3: AIModels.imagen.imagen3
        },
        veo: {
            veo31: AIModels.veo.veo31,           // veo-3.1-generate-preview
            veo31Fast: AIModels.veo.veo31Fast    // veo-3.1-fast-generate-preview
        },
        claude: {
            opus: AIModels.claude.opus,          // claude-opus-4-5-20250929
            sonnet: AIModels.claude.sonnet,      // claude-sonnet-4-5-20250929
            haiku: AIModels.claude.haiku         // claude-haiku-4-20250929
        },
        openai: {
            gpt52: AIModels.openai.gpt52,        // gpt-5.2-2025-12-11
            gpt5: AIModels.openai.gpt5,          // gpt-5
            gpt5Mini: AIModels.openai.gpt5Mini,  // gpt-5-mini
            gpt4o: AIModels.openai.gpt4o,        // gpt-4o (legacy)
            dalle3: AIModels.openai.dalle3
        },
        cloudinary: AIModels.cloudinary,
        googleVision: AIModels.googleVision
    };

    console.log(`🤖 AI Models Config loaded - v${VERSION}`);
    console.log('📊 Available Models:');
    console.log('   Gemini 3:', AIModels.gemini.pro.id, '|', AIModels.gemini.flash.id);
    console.log('   Imagen:', AIModels.imagen.nanoBananaPro.id);
    console.log('   Veo:', AIModels.veo.veo31.id, '|', AIModels.veo.veo31Fast.id);
    console.log('   Claude:', AIModels.claude.opus.id);
    console.log('   OpenAI:', AIModels.openai.gpt52.id);

})();
