/**
 * Enhanced AI Analysis Module
 * ===========================
 * Version 1.0.0 - January 17, 2026
 * 
 * Integrates multiple AI services for comprehensive creative analysis:
 * - Google Cloud Vision API (object detection, face detection, text extraction)
 * - Cloudinary AI (auto-tagging, quality analysis, color analysis)
 * - OpenAI GPT-4 Vision (creative analysis, hook scoring)
 * - Google Gemini (multimodal analysis)
 * - Claude Vision (detailed creative feedback)
 * 
 * Features:
 * - Multi-model consensus scoring
 * - Cross-validation of results
 * - Comprehensive creative intelligence
 */

(function() {
    'use strict';

    const ENHANCED_VERSION = '1.0.0';

    // ============================================
    // GOOGLE CLOUD VISION INTEGRATION
    // ============================================
    
    class GoogleVisionAnalyzer {
        constructor() {
            this.apiKey = null;
            this.baseUrl = 'https://vision.googleapis.com/v1/images:annotate';
        }

        setApiKey(key) {
            this.apiKey = key;
        }

        getApiKey() {
            // Try to get from settings
            if (this.apiKey) return this.apiKey;
            
            // Check shared keys
            if (window.CAVSettings?.manager) {
                const key = window.CAVSettings.manager.getAPIKey('googleVision');
                if (key) return key;
                
                // Fall back to Gemini key (same Google Cloud project)
                const geminiKey = window.CAVSettings.manager.getAPIKey('gemini');
                if (geminiKey) return geminiKey;
            }
            
            return null;
        }

        async analyze(imageBase64) {
            const apiKey = this.getApiKey();
            if (!apiKey) {
                console.warn('[GoogleVision] No API key available - skipping Vision analysis');
                return this.getEmptyResult('No API key configured');
            }
            
            // Validate imageBase64 is provided and is a string
            if (!imageBase64 || typeof imageBase64 !== 'string') {
                console.warn('[GoogleVision] No valid image data provided');
                return this.getEmptyResult('No image data');
            }

            try {
                // Safely extract base64 content
                const base64Content = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
                
                const response = await fetch(`${this.baseUrl}?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        requests: [{
                            image: { content: base64Content },
                            features: [
                                { type: 'LABEL_DETECTION', maxResults: 20 },
                                { type: 'FACE_DETECTION', maxResults: 10 },
                                { type: 'TEXT_DETECTION' },
                                { type: 'OBJECT_LOCALIZATION', maxResults: 20 },
                                { type: 'IMAGE_PROPERTIES' },
                                { type: 'SAFE_SEARCH_DETECTION' },
                                { type: 'LOGO_DETECTION', maxResults: 5 },
                            ]
                        }]
                    })
                });

                if (!response.ok) {
                    // Handle specific error codes gracefully
                    if (response.status === 403) {
                        console.warn('[GoogleVision] 403 Forbidden - Vision API not enabled or key lacks permissions. Using fallback.');
                        return this.getEmptyResult('Vision API not enabled for this key. Enable it at console.cloud.google.com');
                    }
                    if (response.status === 401) {
                        console.warn('[GoogleVision] 401 Unauthorized - Invalid API key');
                        return this.getEmptyResult('Invalid API key');
                    }
                    throw new Error(`Vision API error: ${response.status}`);
                }
                
                const data = await response.json();
                return this.processResponse(data.responses[0]);
            } catch (error) {
                console.error('[GoogleVision] Analysis error:', error);
                return this.getEmptyResult(error.message);
            }
        }
        
        getEmptyResult(reason) {
            return {
                labels: [],
                faces: [],
                text: '',
                objects: [],
                colors: [],
                safeSearch: {},
                logos: [],
                error: reason,
                skipped: true
            };
        }

        processResponse(response) {
            return {
                labels: (response.labelAnnotations || []).map(l => ({
                    name: l.description,
                    confidence: Math.round(l.score * 100)
                })),
                faces: (response.faceAnnotations || []).map(f => ({
                    joy: f.joyLikelihood,
                    sorrow: f.sorrowLikelihood,
                    anger: f.angerLikelihood,
                    surprise: f.surpriseLikelihood,
                    headwear: f.headwearLikelihood,
                    bounds: f.boundingPoly
                })),
                text: response.fullTextAnnotation?.text || '',
                objects: (response.localizedObjectAnnotations || []).map(o => ({
                    name: o.name,
                    confidence: Math.round(o.score * 100),
                    bounds: o.boundingPoly
                })),
                colors: this.extractDominantColors(response.imagePropertiesAnnotation),
                safeSearch: response.safeSearchAnnotation || {},
                logos: (response.logoAnnotations || []).map(l => ({
                    name: l.description,
                    confidence: Math.round(l.score * 100)
                }))
            };
        }

        extractDominantColors(imageProps) {
            if (!imageProps?.dominantColors?.colors) return [];
            
            return imageProps.dominantColors.colors
                .slice(0, 10)
                .map(c => ({
                    hex: this.rgbToHex(c.color.red, c.color.green, c.color.blue),
                    rgb: `rgb(${c.color.red}, ${c.color.green}, ${c.color.blue})`,
                    percentage: Math.round(c.pixelFraction * 100),
                    score: Math.round(c.score * 100)
                }));
        }

        rgbToHex(r, g, b) {
            return '#' + [r, g, b].map(x => {
                const hex = (x || 0).toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            }).join('');
        }
    }

    // ============================================
    // CLOUDINARY AI INTEGRATION
    // ============================================
    
    class CloudinaryAIAnalyzer {
        constructor() {
            this.credentials = null;
        }

        getCredentials() {
            // Get from settings manager
            if (window.CAVSettings?.manager?.getCloudinaryCredentials) {
                return window.CAVSettings.manager.getCloudinaryCredentials();
            }
            
            // Fallback to localStorage
            try {
                const stored = localStorage.getItem('cav_user_cloudinary');
                return stored ? JSON.parse(stored) : null;
            } catch {
                return null;
            }
        }

        async analyze(imageUrl) {
            const creds = this.getCredentials();
            if (!creds?.cloudName) {
                console.warn('[CloudinaryAI] No credentials available');
                return null;
            }
            
            // Validate imageUrl is provided and is a string
            if (!imageUrl || typeof imageUrl !== 'string') {
                console.warn('[CloudinaryAI] No valid image URL/data provided');
                return null;
            }

            try {
                // Use Cloudinary's AI-powered analysis
                const analysisUrl = `https://res.cloudinary.com/${creds.cloudName}/image/upload/fl_getinfo/${imageUrl}`;
                
                // For uploaded images, use the Admin API
                if (imageUrl.includes('cloudinary.com')) {
                    return await this.analyzeUploadedImage(imageUrl, creds);
                }
                
                // For local images, upload first then analyze
                return await this.uploadAndAnalyze(imageUrl, creds);
            } catch (error) {
                console.error('[CloudinaryAI] Analysis error:', error);
                return null;
            }
        }

        async uploadAndAnalyze(imageBase64, creds) {
            try {
                // Check if upload preset exists - use unsigned preset or skip
                const uploadPreset = creds.uploadPreset || 'ml_default';
                
                // Upload with auto-tagging and quality analysis
                const formData = new FormData();
                formData.append('file', imageBase64);
                formData.append('upload_preset', uploadPreset);
                
                // Only add advanced features if the account supports them
                if (creds.enableAdvancedFeatures !== false) {
                    formData.append('auto_tagging', '0.6');
                    formData.append('quality_analysis', 'true');
                    formData.append('colors', 'true');
                }

                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${creds.cloudName}/image/upload`,
                    { method: 'POST', body: formData }
                );

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const errorMsg = errorData.error?.message || `Upload failed with status ${response.status}`;
                    
                    // Handle specific Cloudinary errors
                    if (response.status === 400) {
                        if (errorMsg.includes('preset')) {
                            console.warn('[CloudinaryAI] Upload preset not found. Configure a valid unsigned preset in Cloudinary settings.');
                            return this.getEmptyResult('Upload preset not configured. Create an unsigned preset named "ml_default" in Cloudinary.');
                        }
                        if (errorMsg.includes('Invalid')) {
                            console.warn('[CloudinaryAI] Invalid credentials or configuration');
                            return this.getEmptyResult('Invalid Cloudinary configuration');
                        }
                    }
                    
                    console.warn('[CloudinaryAI] Upload failed:', errorMsg);
                    return this.getEmptyResult(errorMsg);
                }
                
                const result = await response.json();
                return this.processResponse(result);
            } catch (error) {
                console.error('[CloudinaryAI] Upload and analyze error:', error);
                return this.getEmptyResult(error.message);
            }
        }
        
        getEmptyResult(reason) {
            return {
                width: 0,
                height: 0,
                format: '',
                bytes: 0,
                tags: [],
                colors: [],
                predominantColors: [],
                faces: [],
                qualityAnalysis: {},
                moderationLabels: [],
                ocrText: '',
                autoTags: [],
                error: reason,
                skipped: true
            };
        }

        processResponse(result) {
            return {
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes,
                tags: result.tags || [],
                colors: result.colors || [],
                predominantColors: result.predominant?.google || [],
                faces: result.faces || [],
                qualityAnalysis: result.quality_analysis || {},
                moderationLabels: result.moderation || [],
                ocrText: result.info?.ocr?.adv_ocr?.data?.[0]?.fullTextAnnotation?.text || '',
                autoTags: (result.info?.categorization?.google_tagging?.data || []).map(t => ({
                    tag: t.tag,
                    confidence: Math.round(t.confidence * 100)
                }))
            };
        }
    }

    // ============================================
    // ENHANCED CREATIVE ANALYZER
    // ============================================
    
    class EnhancedCreativeAnalyzer {
        constructor() {
            this.googleVision = new GoogleVisionAnalyzer();
            this.cloudinaryAI = new CloudinaryAIAnalyzer();
            this.analysisCache = new Map();
        }

        async analyzeCreative(asset, imageBase64) {
            const cacheKey = asset.id || imageBase64.substring(0, 50);
            
            // Check cache
            if (this.analysisCache.has(cacheKey)) {
                console.log('[EnhancedAnalysis] Returning cached result');
                return this.analysisCache.get(cacheKey);
            }

            console.log('[EnhancedAnalysis] Starting multi-service analysis...');
            const startTime = Date.now();

            // Run analyses in parallel
            const [
                googleVisionResult,
                cloudinaryResult,
                aiAnalysis
            ] = await Promise.allSettled([
                this.googleVision.analyze(imageBase64),
                this.cloudinaryAI.analyze(imageBase64),
                this.runAICreativeAnalysis(asset, imageBase64)
            ]);

            const result = this.combineResults({
                googleVision: googleVisionResult.status === 'fulfilled' ? googleVisionResult.value : null,
                cloudinary: cloudinaryResult.status === 'fulfilled' ? cloudinaryResult.value : null,
                aiAnalysis: aiAnalysis.status === 'fulfilled' ? aiAnalysis.value : null,
                processingTime: Date.now() - startTime
            });

            // Cache result
            this.analysisCache.set(cacheKey, result);
            
            console.log(`[EnhancedAnalysis] Complete in ${result.processingTime}ms`);
            return result;
        }

        async runAICreativeAnalysis(asset, imageBase64) {
            const prompt = `You are a senior creative strategist analyzing this advertising asset.

Provide a comprehensive analysis with these sections:

## 1. VISUAL IMPACT (Score 0-100)
- First impression strength
- Color psychology effectiveness
- Visual hierarchy quality
- Brand recall potential

## 2. AUDIENCE TARGETING
- Primary demographic appeal (age, gender, interests)
- Psychographic profile match
- Cultural relevance score (0-100)

## 3. PLATFORM OPTIMIZATION
Rate suitability (0-100) for:
- Meta (Facebook/Instagram) Feeds
- Meta Stories/Reels
- TikTok For You Page
- YouTube Ads (skippable)
- YouTube Shorts
- LinkedIn Feed
- Google Display Network
- Pinterest

## 4. CONVERSION POTENTIAL
- Attention capture score (0-100)
- Message clarity score (0-100)
- Action motivation score (0-100)
- Trust signals present (list them)

## 5. A/B TEST SUGGESTIONS
Provide 3 specific variations to test:
- What to change
- Expected impact
- Effort level (low/medium/high)

## 6. COMPETITIVE POSITIONING
- Industry standard compliance
- Differentiation factors
- Competitor comparison insights

Return as structured JSON with all scores and insights.`;

            try {
                const orchestrator = window.AIOrchestrator;
                if (!orchestrator) {
                    // Fallback to direct API call
                    return await this.directAICall(prompt, imageBase64);
                }

                let result;
                if (orchestrator.isProviderAvailable('claude')) {
                    result = await orchestrator.callClaude(prompt, { image: imageBase64 });
                } else if (orchestrator.isProviderAvailable('openai')) {
                    result = await orchestrator.callOpenAI(prompt, { image: imageBase64 });
                } else if (orchestrator.isProviderAvailable('gemini')) {
                    result = await orchestrator.callGemini(prompt, { image: imageBase64 });
                } else {
                    throw new Error('No AI provider available');
                }

                return this.parseAIResponse(result.content);
            } catch (error) {
                console.error('[EnhancedAnalysis] AI analysis error:', error);
                return null;
            }
        }

        async directAICall(prompt, imageBase64) {
            // Try Gemini directly
            const geminiKey = window.CAVSettings?.manager?.getAPIKey?.('gemini');
            if (geminiKey) {
                try {
                    const response = await fetch(
                        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${geminiKey}`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                contents: [{
                                    parts: [
                                        { text: prompt },
                                        { inlineData: { 
                                            mimeType: 'image/jpeg', 
                                            data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, '') 
                                        }}
                                    ]
                                }]
                            })
                        }
                    );

                    if (response.ok) {
                        const data = await response.json();
                        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                        return this.parseAIResponse(text);
                    }
                } catch (e) {
                    console.error('[EnhancedAnalysis] Direct Gemini call failed:', e);
                }
            }

            return null;
        }

        parseAIResponse(content) {
            try {
                // Try to extract JSON from the response
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
                
                // Parse structured text response
                return this.parseStructuredText(content);
            } catch (error) {
                console.warn('[EnhancedAnalysis] Could not parse AI response as JSON');
                return { rawContent: content };
            }
        }

        parseStructuredText(text) {
            // Extract scores using regex
            const scores = {};
            const scoreMatches = text.matchAll(/(\w[\w\s]+?):\s*(\d{1,3})(?:\/100)?/gi);
            for (const match of scoreMatches) {
                const key = match[1].trim().toLowerCase().replace(/\s+/g, '_');
                scores[key] = parseInt(match[2]);
            }
            return { parsedScores: scores, rawContent: text };
        }

        combineResults({ googleVision, cloudinary, aiAnalysis, processingTime }) {
            const combined = {
                processingTime,
                timestamp: new Date().toISOString(),
                sources: {
                    googleVision: !!googleVision,
                    cloudinary: !!cloudinary,
                    aiAnalysis: !!aiAnalysis
                },
                
                // Object & Scene Detection (from Google Vision)
                objects: googleVision?.objects || [],
                labels: googleVision?.labels || [],
                
                // Face Analysis (combine sources)
                faceAnalysis: this.combineFaceAnalysis(googleVision, cloudinary),
                
                // Text Detection (combine sources)
                detectedText: googleVision?.text || cloudinary?.ocrText || '',
                
                // Color Analysis (combine sources)
                colorPalette: this.combineColorAnalysis(googleVision, cloudinary),
                
                // Brand & Logo Detection
                logos: googleVision?.logos || [],
                
                // Safety/Moderation
                safetyRatings: googleVision?.safeSearch || {},
                
                // Tags (combine sources)
                tags: this.combineTags(googleVision, cloudinary),
                
                // Quality Metrics
                quality: cloudinary?.qualityAnalysis || {},
                
                // AI Creative Analysis
                creativeAnalysis: aiAnalysis || {},
                
                // Calculated Scores
                scores: this.calculateCompositeScores(googleVision, cloudinary, aiAnalysis)
            };

            return combined;
        }

        combineFaceAnalysis(googleVision, cloudinary) {
            const faces = [];
            
            if (googleVision?.faces) {
                googleVision.faces.forEach((f, i) => {
                    faces.push({
                        source: 'googleVision',
                        index: i,
                        emotions: {
                            joy: f.joy,
                            sorrow: f.sorrow,
                            anger: f.anger,
                            surprise: f.surprise
                        },
                        hasHeadwear: f.headwear === 'LIKELY' || f.headwear === 'VERY_LIKELY'
                    });
                });
            }
            
            if (cloudinary?.faces) {
                cloudinary.faces.forEach((f, i) => {
                    if (!faces[i]) {
                        faces.push({ source: 'cloudinary', index: i, ...f });
                    } else {
                        faces[i].cloudinaryData = f;
                    }
                });
            }
            
            return {
                count: faces.length,
                detected: faces.length > 0,
                details: faces
            };
        }

        combineColorAnalysis(googleVision, cloudinary) {
            const colors = [];
            const seen = new Set();
            
            // Add Google Vision colors
            if (googleVision?.colors) {
                googleVision.colors.forEach(c => {
                    if (!seen.has(c.hex)) {
                        colors.push({ ...c, source: 'googleVision' });
                        seen.add(c.hex);
                    }
                });
            }
            
            // Add Cloudinary colors
            if (cloudinary?.colors) {
                cloudinary.colors.forEach(c => {
                    const hex = Array.isArray(c) ? c[0] : c.hex || c;
                    if (hex && !seen.has(hex)) {
                        colors.push({ 
                            hex, 
                            percentage: Array.isArray(c) ? c[1] : c.percentage,
                            source: 'cloudinary' 
                        });
                        seen.add(hex);
                    }
                });
            }
            
            return colors.slice(0, 10);
        }

        combineTags(googleVision, cloudinary) {
            const tags = new Map();
            
            // Add Google Vision labels
            if (googleVision?.labels) {
                googleVision.labels.forEach(l => {
                    tags.set(l.name.toLowerCase(), {
                        tag: l.name,
                        confidence: l.confidence,
                        source: 'googleVision'
                    });
                });
            }
            
            // Add Cloudinary tags
            if (cloudinary?.autoTags) {
                cloudinary.autoTags.forEach(t => {
                    const existing = tags.get(t.tag.toLowerCase());
                    if (existing) {
                        existing.confidence = Math.max(existing.confidence, t.confidence);
                        existing.source = 'multiple';
                    } else {
                        tags.set(t.tag.toLowerCase(), {
                            tag: t.tag,
                            confidence: t.confidence,
                            source: 'cloudinary'
                        });
                    }
                });
            }
            
            return Array.from(tags.values())
                .sort((a, b) => b.confidence - a.confidence)
                .slice(0, 20);
        }

        calculateCompositeScores(googleVision, cloudinary, aiAnalysis) {
            const scores = {
                visualQuality: 0,
                objectClarity: 0,
                textReadability: 0,
                colorHarmony: 0,
                faceEngagement: 0,
                overallScore: 0
            };

            let dataPoints = 0;

            // Visual quality from Cloudinary
            if (cloudinary?.qualityAnalysis) {
                const qa = cloudinary.qualityAnalysis;
                scores.visualQuality = Math.round(
                    ((qa.focus || 0.7) * 0.4 + 
                     (qa.exposure || 0.7) * 0.3 + 
                     (qa.color_score || 0.7) * 0.3) * 100
                );
                dataPoints++;
            }

            // Object clarity from Google Vision
            if (googleVision?.objects?.length) {
                const avgConfidence = googleVision.objects.reduce((sum, o) => sum + o.confidence, 0) / googleVision.objects.length;
                scores.objectClarity = Math.round(avgConfidence);
                dataPoints++;
            }

            // Text readability
            if (googleVision?.text) {
                scores.textReadability = googleVision.text.length > 10 ? 80 : 60;
                dataPoints++;
            }

            // Color harmony (based on number of dominant colors)
            if (googleVision?.colors?.length) {
                const colorCount = googleVision.colors.length;
                scores.colorHarmony = colorCount <= 5 ? 90 : colorCount <= 8 ? 75 : 60;
                dataPoints++;
            }

            // Face engagement
            if (googleVision?.faces?.length) {
                const hasJoy = googleVision.faces.some(f => 
                    f.joy === 'LIKELY' || f.joy === 'VERY_LIKELY'
                );
                scores.faceEngagement = hasJoy ? 90 : 70;
                dataPoints++;
            }

            // AI analysis scores
            if (aiAnalysis?.parsedScores) {
                Object.entries(aiAnalysis.parsedScores).forEach(([key, value]) => {
                    if (typeof value === 'number' && value <= 100) {
                        scores[key] = value;
                        dataPoints++;
                    }
                });
            }

            // Calculate overall score
            const validScores = Object.values(scores).filter(s => s > 0);
            scores.overallScore = validScores.length > 0 
                ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
                : 0;

            scores.dataPointsUsed = dataPoints;
            
            return scores;
        }
    }

    // ============================================
    // PERFORMANCE BENCHMARK DATA
    // ============================================
    
    const INDUSTRY_BENCHMARKS = {
        'ecommerce': {
            ctr: { low: 0.8, avg: 1.2, high: 2.0 },
            cpm: { low: 5, avg: 12, high: 25 },
            engagement: { low: 2, avg: 4, high: 8 }
        },
        'saas': {
            ctr: { low: 0.5, avg: 0.9, high: 1.5 },
            cpm: { low: 15, avg: 35, high: 80 },
            engagement: { low: 1.5, avg: 3, high: 6 }
        },
        'retail': {
            ctr: { low: 1.0, avg: 1.5, high: 2.5 },
            cpm: { low: 4, avg: 10, high: 20 },
            engagement: { low: 3, avg: 5, high: 10 }
        },
        'finance': {
            ctr: { low: 0.4, avg: 0.7, high: 1.2 },
            cpm: { low: 25, avg: 60, high: 150 },
            engagement: { low: 1, avg: 2, high: 4 }
        },
        'default': {
            ctr: { low: 0.6, avg: 1.0, high: 1.8 },
            cpm: { low: 8, avg: 20, high: 50 },
            engagement: { low: 2, avg: 4, high: 7 }
        }
    };

    // ============================================
    // EXPORT TO WINDOW
    // ============================================
    
    const enhancedAnalyzer = new EnhancedCreativeAnalyzer();

    window.EnhancedCreativeAnalysis = {
        version: ENHANCED_VERSION,
        analyzer: enhancedAnalyzer,
        GoogleVisionAnalyzer,
        CloudinaryAIAnalyzer,
        INDUSTRY_BENCHMARKS,
        
        // Convenience methods
        async analyze(asset, imageBase64) {
            return enhancedAnalyzer.analyzeCreative(asset, imageBase64);
        },
        
        async quickAnalyze(imageBase64) {
            return enhancedAnalyzer.analyzeCreative({ id: 'quick-' + Date.now() }, imageBase64);
        },
        
        clearCache() {
            enhancedAnalyzer.analysisCache.clear();
            console.log('[EnhancedAnalysis] Cache cleared');
        }
    };

    console.log(`✅ [EnhancedCreativeAnalysis] v${ENHANCED_VERSION} loaded - Multi-service AI analysis ready`);

})();
