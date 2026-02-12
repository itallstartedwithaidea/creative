/**
 * AI Orchestrator - Creative Asset Validator v3.0
 * Multi-AI Task Routing System
 * Routes tasks to Claude, OpenAI, SearchAPI, or Gemini based on task type
 */

(function() {
    'use strict';

    // ============================================
    // ORCHESTRATOR CONFIGURATION
    // ============================================

    const ORCHESTRATOR_VERSION = '3.0.0';

    // Task routing configuration
    const TASK_ROUTING = {
        // Visual Analysis Tasks → OpenAI GPT-4o
        'visual_analysis': { primary: 'openai', fallback: 'gemini', requiresVision: true },
        'element_detection': { primary: 'openai', fallback: 'gemini', requiresVision: true },
        'text_extraction': { primary: 'openai', fallback: 'gemini', requiresVision: true },
        'color_analysis': { primary: 'openai', fallback: 'gemini', requiresVision: true },
        'face_detection': { primary: 'openai', fallback: 'gemini', requiresVision: true },
        'logo_detection': { primary: 'openai', fallback: 'gemini', requiresVision: true },
        
        // Strategic Reasoning Tasks → Claude
        'hook_analysis': { primary: 'claude', fallback: 'openai', requiresVision: false },
        'cta_evaluation': { primary: 'claude', fallback: 'openai', requiresVision: false },
        'brand_compliance': { primary: 'claude', fallback: 'openai', requiresVision: false },
        'performance_prediction': { primary: 'claude', fallback: 'openai', requiresVision: false },
        'strategy_recommendation': { primary: 'claude', fallback: 'openai', requiresVision: false },
        'competitor_analysis': { primary: 'claude', fallback: 'openai', requiresVision: false },
        'report_generation': { primary: 'claude', fallback: null, requiresVision: false },
        
        // Web Research Tasks → SearchAPI
        'web_search': { primary: 'searchapi', fallback: null, requiresVision: false },
        'competitor_ads': { primary: 'searchapi', fallback: null, requiresVision: false },
        'benchmark_research': { primary: 'searchapi', fallback: null, requiresVision: false },
        'best_practices': { primary: 'searchapi', fallback: null, requiresVision: false },
        
        // Image Generation Tasks → Gemini
        'image_generation': { primary: 'gemini', fallback: null, requiresVision: false },
        'image_outpainting': { primary: 'gemini', fallback: null, requiresVision: true },
        'video_generation': { primary: 'gemini', fallback: null, requiresVision: false },
        
        // Quick Classification → OpenAI Mini
        'quick_classify': { primary: 'openai-mini', fallback: 'gemini', requiresVision: false },
        'sentiment_analysis': { primary: 'openai-mini', fallback: 'claude', requiresVision: false }
    };

    // API Endpoints
    const API_ENDPOINTS = {
        claude: 'https://api.anthropic.com/v1/messages',
        openai: 'https://api.openai.com/v1/chat/completions',
        searchapi: 'https://www.searchapi.io/api/v1/search',
        gemini: 'https://generativelanguage.googleapis.com/v1beta/models'
    };

    // ============================================
    // AI ORCHESTRATOR CLASS
    // ============================================

    class AIOrchestrator {
        constructor() {
            this.taskQueue = [];
            this.processing = false;
            this.results = new Map();
            this.listeners = [];
        }

        // Sanitize API key to remove invisible characters (fixes ISO-8859-1 errors)
        sanitizeAPIKey(key) {
            if (!key || typeof key !== 'string') return '';
            
            // Remove all non-ASCII printable characters and common invisible chars
            // This fixes "String contains non ISO-8859-1 code point" errors
            return key
                .replace(/[\u200B-\u200D\uFEFF]/g, '') // Zero-width characters
                .replace(/[\u00A0]/g, ' ')             // Non-breaking spaces
                .replace(/[^\x20-\x7E]/g, '')          // Keep only printable ASCII
                .trim();
        }
        
        // Convert unsupported image formats (AVIF, HEIC, etc.) to PNG
        async convertImageToPng(dataUrl) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                
                img.onload = () => {
                    try {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.naturalWidth || img.width;
                        canvas.height = img.naturalHeight || img.height;
                        
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0);
                        
                        const pngDataUrl = canvas.toDataURL('image/png', 1.0);
                        resolve(pngDataUrl);
                    } catch (e) {
                        reject(e);
                    }
                };
                
                img.onerror = () => reject(new Error('Failed to load image for conversion'));
                img.src = dataUrl;
            });
        }

        // Get API key from settings
        getAPIKey(provider) {
            let rawKey = '';
            
            // 1. Try Settings Manager global instance
            if (window.cavSettings?.getAPIKey) {
                rawKey = window.cavSettings.getAPIKey(provider);
                if (rawKey && rawKey.length >= 10) {
                    return this.sanitizeAPIKey(rawKey);
                }
            }
            
            // 2. Try CAVSettings (legacy)
            if (window.CAVSettings?.getAPIKey) {
                rawKey = window.CAVSettings.getAPIKey(provider);
                if (rawKey && rawKey.length >= 10) {
                    return this.sanitizeAPIKey(rawKey);
                }
            }
            
            // 3. For Gemini, check v3.0 Settings structure and legacy storage
            if (provider === 'gemini') {
                try {
                    const v3Settings = localStorage.getItem('cav_v3_settings');
                    if (v3Settings) {
                        const settings = JSON.parse(v3Settings);
                        rawKey = settings?.apiKeys?.gemini?.key;
                        if (rawKey && rawKey.length >= 30) {
                            return this.sanitizeAPIKey(rawKey);
                        }
                    }
                } catch (e) {}
                
                rawKey = localStorage.getItem('cav_gemini_api_key') || 
                         localStorage.getItem('cav_ai_api_key') || '';
                return this.sanitizeAPIKey(rawKey);
            }
            
            return '';
        }

        // Check if provider is available
        isProviderAvailable(provider) {
            const key = this.getAPIKey(provider === 'openai-mini' ? 'openai' : provider);
            return !!key;
        }

        // Get best available provider for task
        getBestProvider(taskType) {
            const routing = TASK_ROUTING[taskType];
            if (!routing) {
                console.warn(`[Orchestrator] Unknown task type: ${taskType}, defaulting to claude`);
                return 'claude';
            }

            // Try primary provider
            if (this.isProviderAvailable(routing.primary)) {
                return routing.primary;
            }

            // Try fallback
            if (routing.fallback && this.isProviderAvailable(routing.fallback)) {
                console.warn(`[Orchestrator] Using fallback provider ${routing.fallback} for ${taskType}`);
                return routing.fallback;
            }

            // No provider available
            console.error(`[Orchestrator] No provider available for ${taskType}`);
            return null;
        }

        // ============================================
        // CLAUDE API
        // ============================================

        async callClaude(prompt, options = {}) {
            const apiKey = this.getAPIKey('claude');
            if (!apiKey) {
                throw new Error('Claude API key not configured');
            }

            const modelConfig = window.CAVSettings?.getModelConfig() || {};
            const model = options.model || modelConfig.claudeModel || 'claude-sonnet-4-5-20250929';
            const temperature = options.temperature ?? modelConfig.analysisTemperature ?? 0.3;
            const maxTokens = options.maxTokens || modelConfig.maxTokens || 8192;

            const messages = Array.isArray(prompt) ? prompt : [{ role: 'user', content: prompt }];

            const response = await fetch(API_ENDPOINTS.claude, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'anthropic-dangerous-direct-browser-access': 'true'
                },
                body: JSON.stringify({
                    model,
                    max_tokens: maxTokens,  // Claude API requires 'max_tokens', not 'max_completion_tokens'
                    temperature,
                    messages
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Claude API error');
            }

            const data = await response.json();
            return {
                provider: 'claude',
                model,
                content: data.content[0]?.text || '',
                usage: data.usage
            };
        }

        // ============================================
        // OPENAI API
        // ============================================
        
        // Map user-friendly model names to actual OpenAI API model names
        mapOpenAIModel(userModel) {
            const modelMap = {
                'gpt-5.2': 'gpt-5.2',                       // GPT-5.2 flagship model
                'gpt-5.2-2025-12-11': 'gpt-5.2-2025-12-11', // GPT-5.2 snapshot
                'gpt-5': 'gpt-5',                           // GPT-5
                'gpt-5-mini': 'gpt-5-mini',                 // GPT-5 Mini
                'gpt-4o': 'gpt-4o',                         // GPT-4o (legacy)
                'gpt-4o-mini': 'gpt-4o-mini',               // GPT-4o Mini (legacy)
                'gpt-4-turbo': 'gpt-4-turbo',               // GPT-4 Turbo (legacy)
                'gpt-4': 'gpt-4'                            // GPT-4 (legacy)
            };
            return modelMap[userModel] || 'gpt-5.2'; // Default to gpt-5.2
        }

        async callOpenAI(prompt, options = {}) {
            const apiKey = this.getAPIKey('openai');
            if (!apiKey) {
                throw new Error('OpenAI API key not configured');
            }

            const modelConfig = window.CAVSettings?.getModelConfig() || {};
            const userModel = options.mini ? 'gpt-5-mini' : (options.model || modelConfig.openaiVisionModel || 'gpt-5.2-2025-12-11');
            const model = this.mapOpenAIModel(userModel);
            const temperature = options.temperature ?? modelConfig.analysisTemperature ?? 0.3;
            const maxTokens = options.maxTokens || modelConfig.maxTokens || 8192;

            let messages;
            if (options.image) {
                // Vision request - convert unsupported formats first
                let imageUrl = options.image;
                
                // Check if image format is supported by OpenAI (png, jpeg, gif, webp)
                const mimeMatch = imageUrl.match(/^data:(image\/[a-z+]+);base64,/);
                const mimeType = mimeMatch ? mimeMatch[1] : '';
                const supportedFormats = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
                
                if (mimeType && !supportedFormats.includes(mimeType)) {
                    console.log(`[AIOrchestrator] Converting ${mimeType} to PNG for OpenAI...`);
                    try {
                        imageUrl = await this.convertImageToPng(imageUrl);
                        console.log('[AIOrchestrator] Image converted to PNG');
                    } catch (convErr) {
                        console.warn('[AIOrchestrator] Image conversion failed:', convErr);
                    }
                }
                
                messages = [{
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        { type: 'image_url', image_url: { url: imageUrl, detail: options.detail || 'auto' } }
                    ]
                }];
            } else {
                messages = Array.isArray(prompt) ? prompt : [{ role: 'user', content: prompt }];
            }

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            };

            const settings = window.CAVSettings?.manager?.settings;
            if (settings?.apiKeys?.openai?.orgId) {
                headers['OpenAI-Organization'] = settings.apiKeys.openai.orgId;
            }

            const response = await fetch(API_ENDPOINTS.openai, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    model,
                    max_completion_tokens: maxTokens,
                    temperature,
                    messages
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'OpenAI API error');
            }

            const data = await response.json();
            return {
                provider: 'openai',
                model,
                content: data.choices[0]?.message?.content || '',
                usage: data.usage
            };
        }

        // ============================================
        // SEARCHAPI
        // ============================================

        async callSearchAPI(query, options = {}) {
            const apiKey = this.getAPIKey('searchapi');
            if (!apiKey) {
                throw new Error('SearchAPI key not configured');
            }

            const engine = options.engine || 'google';
            const num = options.num || 10;
            
            const params = new URLSearchParams({
                api_key: apiKey,
                engine,
                q: query,
                num: num.toString()
            });

            // Add engine-specific params
            if (options.tbm) params.append('tbm', options.tbm); // Search type
            if (options.tbs) params.append('tbs', options.tbs); // Time filter
            if (options.gl) params.append('gl', options.gl); // Country
            if (options.hl) params.append('hl', options.hl); // Language

            const response = await fetch(`${API_ENDPOINTS.searchapi}?${params}`);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'SearchAPI error');
            }

            const data = await response.json();
            return {
                provider: 'searchapi',
                query,
                results: data.organic_results || [],
                knowledge_graph: data.knowledge_graph,
                related_searches: data.related_searches,
                total_results: data.search_information?.total_results
            };
        }

        // ============================================
        // GEMINI API
        // ============================================

        async callGemini(prompt, options = {}) {
            const apiKey = this.getAPIKey('gemini');
            if (!apiKey) {
                throw new Error('Gemini API key not configured');
            }

            const model = options.model || 'gemini-3-flash-preview';
            let url = `${API_ENDPOINTS.gemini}/${model}:generateContent?key=${apiKey}`;

            let contents;
            if (options.image) {
                // Vision request with image
                const imageData = options.image.replace(/^data:image\/\w+;base64,/, '');
                contents = [{
                    parts: [
                        { text: prompt },
                        { inline_data: { mime_type: 'image/jpeg', data: imageData } }
                    ]
                }];
            } else {
                contents = [{ parts: [{ text: prompt }] }];
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents,
                    generationConfig: {
                        temperature: options.temperature ?? 0.3,
                        maxOutputTokens: options.maxTokens || 4096
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Gemini API error');
            }

            const data = await response.json();
            return {
                provider: 'gemini',
                model,
                content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
                usage: data.usageMetadata
            };
        }

        // ============================================
        // UNIFIED TASK EXECUTION
        // ============================================

        async executeTask(taskType, params = {}) {
            const startTime = Date.now();
            const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            try {
                const provider = this.getBestProvider(taskType);
                if (!provider) {
                    throw new Error(`No provider available for task: ${taskType}`);
                }

                this.notifyListeners('task_start', { taskId, taskType, provider });

                let result;
                switch (provider) {
                    case 'claude':
                        result = await this.callClaude(params.prompt, params.options);
                        break;
                    case 'openai':
                    case 'openai-mini':
                        result = await this.callOpenAI(params.prompt, { 
                            ...params.options, 
                            mini: provider === 'openai-mini' 
                        });
                        break;
                    case 'searchapi':
                        result = await this.callSearchAPI(params.query || params.prompt, params.options);
                        break;
                    case 'gemini':
                        result = await this.callGemini(params.prompt, params.options);
                        break;
                    default:
                        throw new Error(`Unknown provider: ${provider}`);
                }

                const duration = Date.now() - startTime;
                const taskResult = {
                    taskId,
                    taskType,
                    provider,
                    success: true,
                    result,
                    duration
                };

                this.results.set(taskId, taskResult);
                this.notifyListeners('task_complete', taskResult);
                return taskResult;

            } catch (error) {
                const duration = Date.now() - startTime;
                const taskResult = {
                    taskId,
                    taskType,
                    success: false,
                    error: error.message,
                    duration
                };

                this.results.set(taskId, taskResult);
                this.notifyListeners('task_error', taskResult);
                throw error;
            }
        }

        // ============================================
        // PARALLEL TASK EXECUTION
        // ============================================

        async executeParallel(tasks) {
            const results = await Promise.allSettled(
                tasks.map(task => this.executeTask(task.type, task.params))
            );

            return results.map((result, index) => ({
                task: tasks[index],
                status: result.status,
                value: result.status === 'fulfilled' ? result.value : null,
                error: result.status === 'rejected' ? result.reason.message : null
            }));
        }

        // ============================================
        // SPECIALIZED ANALYSIS METHODS
        // ============================================

        // Analyze image visually
        async analyzeImageVisual(imageBase64, analysisType = 'general') {
            const prompts = {
                general: `Analyze this image and provide a detailed breakdown of:
1. Main visual elements and composition
2. Colors and color palette (hex codes if possible)
3. Text content if any (exact text visible)
4. People/faces detected (count, expressions, eye contact)
5. Product or brand elements
6. Overall visual impact and quality
Return as JSON.`,
                
                hook: `Analyze this image for its "hook" or scroll-stopping potential:
1. Visual disruption score (1-10) - how attention-grabbing is this?
2. Pattern interrupt elements - what's unexpected?
3. Emotional triggers present
4. First impression assessment
5. Suggested improvements for better hook
Return as JSON with scores and explanations.`,
                
                brand: `Analyze this image for brand elements:
1. Logo presence and placement
2. Brand colors detected (hex codes)
3. Typography/fonts visible
4. Overall brand consistency assessment
5. Professional quality rating
Return as JSON.`,
                
                cta: `Analyze this image for call-to-action elements:
1. CTA text detected (exact text)
2. CTA button/element presence
3. CTA visibility and prominence
4. CTA clarity and actionability
5. Suggested CTA improvements
Return as JSON.`
            };

            const prompt = prompts[analysisType] || prompts.general;
            
            // Try OpenAI first (better vision), fall back to Gemini
            if (this.isProviderAvailable('openai')) {
                return await this.callOpenAI(prompt, { image: imageBase64 });
            } else if (this.isProviderAvailable('gemini')) {
                return await this.callGemini(prompt, { image: imageBase64 });
            } else {
                throw new Error('No vision-capable provider available');
            }
        }

        // Strategic analysis with Claude
        async analyzeStrategic(context, analysisType = 'general') {
            const prompts = {
                general: `Based on this creative asset analysis, provide strategic recommendations:

${JSON.stringify(context, null, 2)}

Provide:
1. Overall creative effectiveness score (0-100)
2. Key strengths
3. Areas for improvement
4. Platform-specific recommendations
5. A/B test suggestions
Return as JSON.`,
                
                performance: `Based on this creative asset data, predict performance:

${JSON.stringify(context, null, 2)}

Predict:
1. Expected CTR range (low, expected, high)
2. Expected CPM range
3. Engagement rate prediction
4. View-through rate (if video)
5. Confidence level for predictions
6. Key factors influencing predictions
Return as JSON.`,
                
                placement: `Analyze this creative for platform placement suitability:

${JSON.stringify(context, null, 2)}

For each major platform (Meta, TikTok, YouTube, LinkedIn, Google Ads), rate:
1. Spec compatibility (ready/needs-work/incompatible)
2. Creative fit score (0-100)
3. Predicted performance (high/medium/low)
4. Recommended action
5. Required modifications if any
Return as JSON.`
            };

            const prompt = prompts[analysisType] || prompts.general;
            return await this.callClaude(prompt, { temperature: 0.3 });
        }

        // Web research
        async researchWeb(topic, researchType = 'general') {
            const queries = {
                general: topic,
                benchmarks: `${topic} benchmark statistics 2024`,
                best_practices: `${topic} best practices guide`,
                competitor_ads: `${topic} advertising examples`,
                trends: `${topic} trends 2024`
            };

            const query = queries[researchType] || queries.general;
            return await this.callSearchAPI(query, { num: 10 });
        }

        // ============================================
        // COMPREHENSIVE ASSET ANALYSIS
        // ============================================

        async analyzeAssetComprehensive(asset, imageBase64) {
            const results = {
                assetId: asset.id,
                analyzedAt: new Date().toISOString(),
                visual: null,
                hook: null,
                cta: null,
                brand: null,
                strategic: null,
                predictions: null,
                placements: null,
                confidence: 'medium'
            };

            try {
                // Run visual analyses in parallel
                const visualTasks = [
                    this.analyzeImageVisual(imageBase64, 'general'),
                    this.analyzeImageVisual(imageBase64, 'hook'),
                    this.analyzeImageVisual(imageBase64, 'cta'),
                    this.analyzeImageVisual(imageBase64, 'brand')
                ];

                const [visual, hook, cta, brand] = await Promise.allSettled(visualTasks);
                
                results.visual = visual.status === 'fulfilled' ? this.parseJSON(visual.value.content) : null;
                results.hook = hook.status === 'fulfilled' ? this.parseJSON(hook.value.content) : null;
                results.cta = cta.status === 'fulfilled' ? this.parseJSON(cta.value.content) : null;
                results.brand = brand.status === 'fulfilled' ? this.parseJSON(brand.value.content) : null;

                // Build context for strategic analysis
                const context = {
                    asset: {
                        filename: asset.filename,
                        type: asset.type || 'image',
                        width: asset.width,
                        height: asset.height,
                        aspectRatio: asset.width && asset.height ? (asset.width / asset.height).toFixed(2) : null,
                        duration: asset.duration
                    },
                    visualAnalysis: results.visual,
                    hookAnalysis: results.hook,
                    ctaAnalysis: results.cta,
                    brandAnalysis: results.brand
                };

                // Run strategic analyses
                if (this.isProviderAvailable('claude')) {
                    const strategicTasks = [
                        this.analyzeStrategic(context, 'general'),
                        this.analyzeStrategic(context, 'performance'),
                        this.analyzeStrategic(context, 'placement')
                    ];

                    const [strategic, predictions, placements] = await Promise.allSettled(strategicTasks);
                    
                    results.strategic = strategic.status === 'fulfilled' ? this.parseJSON(strategic.value.content) : null;
                    results.predictions = predictions.status === 'fulfilled' ? this.parseJSON(predictions.value.content) : null;
                    results.placements = placements.status === 'fulfilled' ? this.parseJSON(placements.value.content) : null;
                }

                // Calculate overall confidence
                const successCount = [results.visual, results.hook, results.cta, results.strategic]
                    .filter(r => r !== null).length;
                results.confidence = successCount >= 3 ? 'high' : successCount >= 2 ? 'medium' : 'low';

            } catch (error) {
                console.error('[Orchestrator] Comprehensive analysis error:', error);
                results.error = error.message;
            }

            return results;
        }

        // Parse JSON from AI response
        parseJSON(content) {
            if (!content) return null;
            
            // Try to extract JSON from markdown code blocks
            const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
                try {
                    return JSON.parse(jsonMatch[1]);
                } catch (e) {
                    // Continue to try direct parse
                }
            }

            // Try direct parse
            try {
                return JSON.parse(content);
            } catch (e) {
                // Return as structured object if can't parse
                return { raw: content };
            }
        }

        // ============================================
        // EVENT LISTENERS
        // ============================================

        addListener(callback) {
            this.listeners.push(callback);
        }

        removeListener(callback) {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        }

        notifyListeners(event, data) {
            this.listeners.forEach(cb => {
                try {
                    cb(event, data);
                } catch (e) {
                    console.error('[Orchestrator] Listener error:', e);
                }
            });
        }

        // ============================================
        // PROVIDER STATUS
        // ============================================

        getProviderStatus() {
            return {
                claude: {
                    available: this.isProviderAvailable('claude'),
                    capabilities: ['reasoning', 'strategy', 'analysis', 'reports']
                },
                openai: {
                    available: this.isProviderAvailable('openai'),
                    capabilities: ['vision', 'image-analysis', 'text-extraction']
                },
                searchapi: {
                    available: this.isProviderAvailable('searchapi'),
                    capabilities: ['web-search', 'competitor-research', 'benchmarks']
                },
                gemini: {
                    available: this.isProviderAvailable('gemini'),
                    capabilities: ['vision', 'image-generation', 'video-generation']
                }
            };
        }

        // Get routing info for task
        getTaskRouting(taskType) {
            return TASK_ROUTING[taskType] || null;
        }

        // Get all available task types
        getAvailableTaskTypes() {
            return Object.keys(TASK_ROUTING).filter(taskType => {
                const provider = this.getBestProvider(taskType);
                return provider !== null;
            });
        }
    }

    // ============================================
    // INITIALIZE & EXPORT
    // ============================================

    const orchestrator = new AIOrchestrator();

    // Global export
    window.AIOrchestrator = orchestrator;

    // Also expose class for testing
    window.AIOrchestrator.Class = AIOrchestrator;

    console.warn('🎭 AI Orchestrator loaded - Version 3.0.0');
    console.warn('   Task routing: Claude (strategy) | OpenAI (vision) | SearchAPI (research) | Gemini (generation)');

})();

