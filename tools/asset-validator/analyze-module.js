/**
 * Analyze Module - Creative Asset Validator v3.0.7
 * Creative Intelligence Module with Hook Analysis, CTA Audit, Brand Compliance,
 * Audio Strategy, Thumb-Stop Scoring, and Performance Prediction
 * 
 * v3.0.7 FIXES:
 * - Persist analysis results to localStorage
 * - Save analysis history that persists across sessions
 * - Link analysis to CRM companies
 * - Fix blank image/screenshot issue
 * - Auto-detect brand and create CRM entry
 */

(function() {
    'use strict';

    const ANALYZE_VERSION = '4.0.0'; // January 17, 2026 - Multi-service AI integration
    
    // User-specific storage key prefix - ROBUST multi-source check
    function getAnalyzeStoragePrefix() {
        try {
            // Try multiple session sources
            let email = null;
            
            // 1. Check window.cavUserSession
            if (window.cavUserSession?.email) {
                email = window.cavUserSession.email;
            }
            
            // 2. Check CAVSecurity SecureSessionManager
            if (!email) {
                const secureSession = window.CAVSecurity?.SecureSessionManager?.getSession?.();
                if (secureSession?.email) email = secureSession.email;
            }
            
            // 3. Check localStorage cav_user_session
            if (!email) {
                try {
                    const session = JSON.parse(localStorage.getItem('cav_user_session') || 'null');
                    if (session?.email) email = session.email;
                } catch (e) {}
            }
            
            // 4. Check localStorage cav_secure_session_v3
            if (!email) {
                try {
                    const secureV3 = JSON.parse(localStorage.getItem('cav_secure_session_v3') || 'null');
                    if (secureV3?.email) email = secureV3.email;
                } catch (e) {}
            }
            
            // 5. Check localStorage cav_last_user_email
            if (!email) {
                const lastEmail = localStorage.getItem('cav_last_user_email');
                if (lastEmail && lastEmail !== 'anonymous') email = lastEmail;
            }
            
            if (email) {
                const userKey = email.toLowerCase().replace(/[^a-z0-9]/g, '_');
                return `cav_analyze_${userKey}_`;
            }
        } catch (e) {
            console.warn('[Analyze] Error getting user prefix:', e);
        }
        return 'cav_analyze_anonymous_';
    }
    
    // Dynamic storage keys - user-specific
    const STORAGE_KEYS = {
        get ANALYSIS_HISTORY() { return `${getAnalyzeStoragePrefix()}history`; },
        get CURRENT_ANALYSIS() { return `${getAnalyzeStoragePrefix()}current`; },
        get ANALYSIS_CACHE() { return `${getAnalyzeStoragePrefix()}cache`; },
    };

    // ============================================
    // ANALYZE MODULE CLASS
    // ============================================

    class AnalyzeModule {
        constructor() {
            this.currentAsset = null;
            this.currentAnalysis = this.loadCurrentAnalysis();
            this.analysisHistory = this.loadAnalysisHistory();
            
            console.log(`[Analyze] Initialized v${ANALYZE_VERSION} - ${this.analysisHistory.length} analyses in history`);
        }
        
        // Load current analysis from storage
        loadCurrentAnalysis() {
            try {
                return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_ANALYSIS) || 'null');
            } catch {
                return null;
            }
        }
        
        // Save current analysis to storage
        saveCurrentAnalysis(analysis) {
            try {
                localStorage.setItem(STORAGE_KEYS.CURRENT_ANALYSIS, JSON.stringify(analysis));
            } catch (e) {
                console.warn('[Analyze] Failed to save current analysis:', e);
            }
        }
        
        // Load analysis history from storage
        loadAnalysisHistory() {
            try {
                return JSON.parse(localStorage.getItem(STORAGE_KEYS.ANALYSIS_HISTORY) || '[]');
            } catch {
                return [];
            }
        }
        
        // Save analysis to history
        saveAnalysisToHistory(analysis) {
            // Remove any existing analysis for this asset
            this.analysisHistory = this.analysisHistory.filter(a => a.assetId !== analysis.assetId);
            
            // Add new analysis at the beginning
            this.analysisHistory.unshift(analysis);
            
            // Keep last 100 analyses
            if (this.analysisHistory.length > 100) {
                this.analysisHistory = this.analysisHistory.slice(0, 100);
            }
            
            // Save to localStorage
            try {
                localStorage.setItem(STORAGE_KEYS.ANALYSIS_HISTORY, JSON.stringify(this.analysisHistory));
                
                // Also save to unified storage for cross-device sync
                if (window.UnifiedStorage) {
                    window.UnifiedStorage.saveCreativeAnalysis({
                        ...analysis,
                        id: analysis.id || analysis.assetId || `analysis_${Date.now()}`
                    }).catch(e => console.warn('[Analyze] Unified storage save failed:', e));
                }
            } catch (e) {
                console.warn('[Analyze] Failed to save analysis history:', e);
            }
        }
        
        // Get analysis for an asset from cache
        getAnalysisForAsset(assetId) {
            return this.analysisHistory.find(a => a.assetId === assetId);
        }
        
        // Clear analysis history
        clearAnalysisHistory() {
            this.analysisHistory = [];
            localStorage.removeItem(STORAGE_KEYS.ANALYSIS_HISTORY);
        }

        // ============================================
        // HOOK ANALYSIS ENGINE
        // ============================================

        async analyzeHook(asset, imageBase64) {
            const prompt = `Analyze this creative asset for its "hook" or scroll-stopping potential in paid media advertising.

Evaluate and score (0-100) each dimension:

1. **Visual Disruption** (weight 35%): Pattern interrupt elements, unexpected visuals, contrast with typical feed content
2. **Motion Quality** (weight 20%): For images, assess implied motion. First frame composition and energy.
3. **Emotional Trigger** (weight 25%): Curiosity, urgency, surprise, relatability, fear of missing out
4. **Text Hook** (weight 10%): First visible text impact, headline strength, font prominence
5. **Audio Hook** (weight 10%): For video, assess opening sound. For images, mark as N/A.

Also identify:
- Face detected: Is there a human face in the first view? (yes/no)
- Eye contact: Does the face make eye contact with viewer? (yes/no)
- First frame elements: List 3-5 key visual elements
- Improvement suggestions: 3 specific ways to improve the hook

Return ONLY valid JSON in this exact format:
{
    "overallScore": 75,
    "visualDisruptionScore": 80,
    "motionQualityScore": 70,
    "emotionalTriggerScore": 75,
    "textHookScore": 65,
    "audioHookScore": null,
    "faceDetected": true,
    "eyeContact": false,
    "firstFrameElements": ["product shot", "bold headline", "vibrant colors"],
    "improvementSuggestions": ["Add human face for emotional connection", "Increase text contrast", "Add motion blur for energy"],
    "confidenceLevel": "high"
}`;

            try {
                const orchestrator = window.AIOrchestrator;
                if (!orchestrator) throw new Error('AI Orchestrator not available');

                let result;
                if (orchestrator.isProviderAvailable('openai')) {
                    result = await orchestrator.callOpenAI(prompt, { image: imageBase64 });
                } else if (orchestrator.isProviderAvailable('gemini')) {
                    result = await orchestrator.callGemini(prompt, { image: imageBase64 });
                } else {
                    throw new Error('No vision-capable AI provider available');
                }

                const analysis = this.parseJSON(result.content);
                return window.CAVDataModels.HookAnalysis.create({
                    assetId: asset.id,
                    ...analysis
                });

            } catch (error) {
                console.error('[Analyze] Hook analysis error:', error);
                return window.CAVDataModels.HookAnalysis.create({
                    assetId: asset.id,
                    confidenceLevel: 'low',
                    improvementSuggestions: ['Analysis failed - please try again']
                });
            }
        }

        // ============================================
        // CTA AUDIT SYSTEM
        // ============================================

        async analyzeCTA(asset, imageBase64) {
            const prompt = `Analyze this creative asset's Call-to-Action (CTA) effectiveness for paid advertising.

Evaluate:
1. **CTA Presence** (25%): Is there a clear CTA? Is it visible without scrolling?
2. **CTA Clarity** (30%): Does it use action verbs? Single clear action? No ambiguity?
3. **CTA Placement** (20%): Location in frame, prominence, visual hierarchy
4. **CTA Urgency** (15%): Time-limited language? Scarcity indicators? Motivation?
5. **Platform Alignment** (10%): Does format match platform best practices?

Classify CTA type:
- "hard": Buy Now, Sign Up, Get Started, Shop Now
- "soft": Learn More, See How, Discover
- "engagement": Comment, Share, Follow, Tag a Friend
- "none": No clear CTA detected

Check platform alignment for: Meta, TikTok, YouTube, LinkedIn, Google Ads

Return ONLY valid JSON:
{
    "ctaDetected": true,
    "ctaText": "Shop Now",
    "ctaType": "hard",
    "presenceScore": 85,
    "clarityScore": 90,
    "placementScore": 75,
    "urgencyScore": 60,
    "platformAlignmentScore": 80,
    "overallEffectiveness": 80,
    "platformAlignment": [
        {"platform": "Meta", "aligned": true},
        {"platform": "TikTok", "aligned": false},
        {"platform": "YouTube", "aligned": true},
        {"platform": "LinkedIn", "aligned": true},
        {"platform": "Google Ads", "aligned": true}
    ],
    "recommendations": ["Add urgency with limited-time offer", "Make CTA button larger", "Use contrasting color for CTA"]
}`;

            try {
                const orchestrator = window.AIOrchestrator;
                if (!orchestrator) throw new Error('AI Orchestrator not available');

                let result;
                if (orchestrator.isProviderAvailable('openai')) {
                    result = await orchestrator.callOpenAI(prompt, { image: imageBase64 });
                } else if (orchestrator.isProviderAvailable('gemini')) {
                    result = await orchestrator.callGemini(prompt, { image: imageBase64 });
                } else {
                    throw new Error('No vision-capable AI provider available');
                }

                const analysis = this.parseJSON(result.content);
                return window.CAVDataModels.CTAAnalysis.create({
                    assetId: asset.id,
                    ...analysis
                });

            } catch (error) {
                console.error('[Analyze] CTA analysis error:', error);
                return window.CAVDataModels.CTAAnalysis.create({
                    assetId: asset.id,
                    ctaDetected: false,
                    recommendations: ['Analysis failed - please try again']
                });
            }
        }

        // ============================================
        // BRAND COMPLIANCE SCANNER
        // ============================================

        async analyzeBrandCompliance(asset, imageBase64, brandProfile = null) {
            // Get default brand profile if not provided
            if (!brandProfile && window.CAVSettings) {
                brandProfile = window.CAVSettings.manager.getDefaultBrandProfile();
            }

            const brandContext = brandProfile ? `
Brand Guidelines to Check Against:
- Brand Name: ${brandProfile.name}
- Primary Color: ${brandProfile.colors?.primary || 'Not specified'}
- Secondary Color: ${brandProfile.colors?.secondary || 'Not specified'}
- Accent Color: ${brandProfile.colors?.accent || 'Not specified'}
- Fonts: ${brandProfile.fonts?.join(', ') || 'Not specified'}
- Voice Keywords: ${brandProfile.voiceKeywords?.join(', ') || 'Not specified'}
` : 'No brand profile configured - do general brand analysis.';

            const prompt = `Analyze this creative asset for brand compliance and consistency.

${brandContext}

Evaluate:
1. **Logo Presence**: Is a logo visible? Is it the correct version? Proper placement and clear space?
2. **Color Match**: Do the dominant colors match the brand palette? Detect actual hex codes.
3. **Typography**: What fonts are visible? Do they match brand guidelines?
4. **Tone of Voice**: Does any text match the brand voice keywords?
5. **Visual Style**: Is the overall aesthetic consistent with brand identity?

Score each dimension 0-100 and calculate overall compliance.

Return ONLY valid JSON:
{
    "overallCompliance": 75,
    "logoPresent": true,
    "logoCorrectVersion": true,
    "logoPlacementValid": true,
    "logoScore": 85,
    "colorMatch": {
        "primary": {"detected": "#FF5733", "expected": "${brandProfile?.colors?.primary || '#000000'}", "match": false},
        "secondary": {"detected": "#FFFFFF", "expected": "${brandProfile?.colors?.secondary || '#FFFFFF'}", "match": true},
        "accent": {"detected": "#3498DB", "expected": "${brandProfile?.colors?.accent || '#0066CC'}", "match": false}
    },
    "colorScore": 60,
    "fontsDetected": ["Helvetica", "Arial"],
    "fontMatch": false,
    "fontScore": 40,
    "toneOfVoice": {
        "detected": "casual, friendly",
        "expected": "${brandProfile?.voiceKeywords?.join(', ') || 'professional'}",
        "match": true
    },
    "toneScore": 80,
    "visualStyleMatch": true,
    "visualStyleScore": 75,
    "issues": ["Primary color doesn't match brand guidelines", "Non-brand font detected"],
    "recommendations": ["Update primary color to brand color", "Use approved brand fonts"]
}`;

            try {
                const orchestrator = window.AIOrchestrator;
                if (!orchestrator) throw new Error('AI Orchestrator not available');

                let result;
                if (orchestrator.isProviderAvailable('openai')) {
                    result = await orchestrator.callOpenAI(prompt, { image: imageBase64 });
                } else if (orchestrator.isProviderAvailable('gemini')) {
                    result = await orchestrator.callGemini(prompt, { image: imageBase64 });
                } else {
                    throw new Error('No vision-capable AI provider available');
                }

                const analysis = this.parseJSON(result.content);
                return window.CAVDataModels.BrandComplianceResult.create({
                    assetId: asset.id,
                    brandProfileId: brandProfile?.id || null,
                    ...analysis
                });

            } catch (error) {
                console.error('[Analyze] Brand compliance error:', error);
                return window.CAVDataModels.BrandComplianceResult.create({
                    assetId: asset.id,
                    issues: ['Analysis failed - please try again']
                });
            }
        }

        // ============================================
        // AUDIO STRATEGY ANALYZER (Video Only)
        // ============================================

        async analyzeAudioStrategy(asset, videoBase64OrUrl = null) {
            if (asset.type !== 'video' && !asset.duration) {
                return window.CAVDataModels.AudioStrategyResult.create({
                    assetId: asset.id,
                    hasAudio: false,
                    recommendations: ['This analysis is for video assets only']
                });
            }

            const prompt = `Analyze this video's audio strategy for paid media advertising.

Consider that 85% of Facebook video is watched without sound, and different platforms have different audio expectations.

Evaluate:
1. **Sound-Off Viability**: Can the message be understood without audio? Are text overlays sufficient?
2. **Caption Quality**: Are captions present? Readable? Properly timed? Full coverage?
3. **Music Selection**: Is there background music? Does it match the mood? Is it a trending sound?
4. **Voice Over**: Is there voice over? Is it clear? Good pacing? Professional quality?
5. **Sound Effects**: Are there sound effects? Do they enhance or distract?

Provide platform-specific recommendations for:
- TikTok (sound-on critical, trending sounds important)
- Instagram Reels (music integration, voice + music balance)
- Facebook Feed (sound-off optimization mandatory)
- YouTube (full audio experience expected)
- LinkedIn (professional audio, minimal music)

Return ONLY valid JSON:
{
    "hasAudio": true,
    "soundOffViable": true,
    "soundOffScore": 75,
    "captionsPresent": true,
    "captionQuality": 80,
    "captionCoverage": 95,
    "musicPresent": true,
    "musicMoodMatch": "energetic, upbeat - matches content well",
    "isTrendingSound": false,
    "voiceOverPresent": true,
    "voiceOverClarity": 85,
    "soundEffects": ["swoosh transition", "click sound"],
    "platformRecommendations": {
        "tiktok": "Consider using trending sound for better reach",
        "instagram_reels": "Good balance of voice and music",
        "facebook_feed": "Sound-off optimization is good with captions",
        "youtube": "Audio quality is appropriate",
        "linkedin": "May be too energetic for LinkedIn audience"
    },
    "overallScore": 78,
    "recommendations": ["Add trending TikTok sound variant", "Increase caption size", "Add sound wave animation for sound-on engagement"]
}`;

            try {
                const orchestrator = window.AIOrchestrator;
                if (!orchestrator) throw new Error('AI Orchestrator not available');

                // For video, we'd ideally extract frames and audio
                // For now, use Claude for text-based analysis if we have metadata
                let result;
                if (orchestrator.isProviderAvailable('claude')) {
                    const contextPrompt = `Based on a video asset with the following characteristics:
- Duration: ${asset.duration || 'unknown'} seconds
- Has audio track: assumed yes
- Type: promotional video

${prompt}`;
                    result = await orchestrator.callClaude(contextPrompt);
                } else {
                    throw new Error('Claude not available for audio strategy analysis');
                }

                const analysis = this.parseJSON(result.content);
                return window.CAVDataModels.AudioStrategyResult.create({
                    assetId: asset.id,
                    ...analysis
                });

            } catch (error) {
                console.error('[Analyze] Audio strategy error:', error);
                return window.CAVDataModels.AudioStrategyResult.create({
                    assetId: asset.id,
                    recommendations: ['Analysis failed - please try again']
                });
            }
        }

        // ============================================
        // THUMB-STOP SCORING
        // ============================================

        async analyzeThumbStop(asset, imageBase64) {
            const prompt = `Analyze this creative's "thumb-stop" potential - the likelihood a user will stop scrolling to engage with this content in a social media feed.

Score each factor (0-100):

1. **Visual Salience** (weight 35%):
   - Color contrast with typical feed content
   - Visual complexity (not too busy, not too simple)
   - Focal point clarity

2. **Pattern Interrupt** (weight 25%):
   - Deviation from feed norms
   - Unexpected elements
   - Novelty factor

3. **Emotional Hook** (weight 25%):
   - Facial expressions (if faces present)
   - Body language cues
   - Emotional content triggers

4. **Relevance Signal** (weight 15%):
   - Product visibility
   - Audience targeting cues
   - Context match indicators

Calculate overall thumb-stop score using the weighted formula.

Return ONLY valid JSON:
{
    "overallScore": 72,
    "visualSalience": 80,
    "patternInterrupt": 65,
    "emotionalHook": 75,
    "relevanceSignal": 60,
    "colorContrast": 85,
    "visualComplexity": 70,
    "focalPointClarity": 78,
    "noveltyFactor": 62,
    "facialExpressions": "confident smile, engaging",
    "bodyLanguage": "open, welcoming posture",
    "productVisibility": 75,
    "targetingCues": ["young professionals", "tech-savvy", "urban lifestyle"]
}`;

            try {
                const orchestrator = window.AIOrchestrator;
                if (!orchestrator) throw new Error('AI Orchestrator not available');

                let result;
                if (orchestrator.isProviderAvailable('openai')) {
                    result = await orchestrator.callOpenAI(prompt, { image: imageBase64 });
                } else if (orchestrator.isProviderAvailable('gemini')) {
                    result = await orchestrator.callGemini(prompt, { image: imageBase64 });
                } else {
                    throw new Error('No vision-capable AI provider available');
                }

                const analysis = this.parseJSON(result.content);
                
                // Calculate weighted score if not provided
                if (!analysis.overallScore && analysis.visualSalience) {
                    analysis.overallScore = Math.round(
                        (analysis.visualSalience * 0.35) +
                        (analysis.patternInterrupt * 0.25) +
                        (analysis.emotionalHook * 0.25) +
                        (analysis.relevanceSignal * 0.15)
                    );
                }

                return window.CAVDataModels.ThumbStopScore.create({
                    assetId: asset.id,
                    ...analysis
                });

            } catch (error) {
                console.error('[Analyze] Thumb-stop analysis error:', error);
                return window.CAVDataModels.ThumbStopScore.create({
                    assetId: asset.id
                });
            }
        }

        // ============================================
        // PERFORMANCE PREDICTION MODEL
        // ============================================

        async predictPerformance(asset, analysisResults) {
            const context = {
                asset: {
                    type: asset.type || 'image',
                    width: asset.width,
                    height: asset.height,
                    aspectRatio: asset.width && asset.height ? (asset.width / asset.height).toFixed(2) : null,
                    duration: asset.duration
                },
                hookScore: analysisResults.hookAnalysis?.overallScore || null,
                ctaScore: analysisResults.ctaAnalysis?.overallEffectiveness || null,
                thumbStopScore: analysisResults.thumbStopScore?.overallScore || null,
                brandCompliance: analysisResults.brandCompliance?.overallCompliance || null
            };

            const prompt = `Based on this creative asset analysis, predict expected performance metrics for paid media campaigns.

Asset Context:
${JSON.stringify(context, null, 2)}

Predict ranges for:
1. **CTR (Click-Through Rate)**: low/expected/high percentages
2. **CPM (Cost Per Mille)**: low/expected/high in USD
3. **Engagement Rate**: low/expected/high percentages
4. **View-Through Rate**: for video, completion rate ranges
5. **Conversion Potential**: high/medium/low relative assessment

Also provide:
- Confidence level: high/medium/low based on data quality
- Key factors influencing predictions
- Calibration notes for user's specific account (if any historical data)

Return ONLY valid JSON:
{
    "ctr": {
        "low": 0.8,
        "expected": 1.2,
        "high": 1.8
    },
    "cpm": {
        "low": 5.00,
        "expected": 8.50,
        "high": 14.00
    },
    "engagementRate": {
        "low": 2.0,
        "expected": 3.5,
        "high": 5.5
    },
    "viewThroughRate": null,
    "conversionPotential": "medium",
    "confidenceFactors": [
        "Strong hook score indicates good initial engagement",
        "CTA clarity suggests decent click intent",
        "Brand compliance may affect quality score"
    ],
    "calibrationData": null
}`;

            try {
                const orchestrator = window.AIOrchestrator;
                if (!orchestrator) throw new Error('AI Orchestrator not available');

                let result;
                if (orchestrator.isProviderAvailable('claude')) {
                    result = await orchestrator.callClaude(prompt, { temperature: 0.3 });
                } else if (orchestrator.isProviderAvailable('openai')) {
                    result = await orchestrator.callOpenAI(prompt, { temperature: 0.3 });
                } else {
                    throw new Error('No reasoning AI provider available');
                }

                const prediction = this.parseJSON(result.content);
                return window.CAVDataModels.PerformancePrediction.create({
                    assetId: asset.id,
                    ...prediction
                });

            } catch (error) {
                console.error('[Analyze] Performance prediction error:', error);
                return window.CAVDataModels.PerformancePrediction.create({
                    assetId: asset.id
                });
            }
        }

        // ============================================
        // FULL COMPREHENSIVE ANALYSIS
        // ============================================

        async analyzeComprehensive(asset, imageBase64) {
            const startTime = Date.now();
            
            const results = {
                assetId: asset.id,
                assetFilename: asset.filename,
                assetType: asset.type || 'image',
                assetDimensions: { width: asset.width, height: asset.height },
                analyzedAt: new Date().toISOString(),
                hookAnalysis: null,
                ctaAnalysis: null,
                brandCompliance: null,
                audioStrategy: null,
                thumbStopScore: null,
                performancePrediction: null,
                confidence: 'low',
                processingTime: 0,
                // NEW: CRM linking
                detectedBrand: null,
                linkedCompanyId: null,
                linkedProjectId: null
            };

            try {
                // Run ENHANCED multi-service analysis if available (Google Vision, Cloudinary AI, etc.)
                let enhancedData = null;
                if (window.EnhancedCreativeAnalysis?.analyze) {
                    console.log('[Analyze] Running enhanced multi-service analysis...');
                    try {
                        enhancedData = await window.EnhancedCreativeAnalysis.analyze(asset, imageBase64);
                        results.enhancedAnalysis = enhancedData;
                        console.log('[Analyze] Enhanced analysis complete:', enhancedData?.sources);
                    } catch (e) {
                        console.warn('[Analyze] Enhanced analysis unavailable:', e.message);
                    }
                }
                
                // Run visual analyses in parallel
                const [hookAnalysis, ctaAnalysis, brandCompliance, thumbStopScore] = await Promise.allSettled([
                    this.analyzeHook(asset, imageBase64),
                    this.analyzeCTA(asset, imageBase64),
                    this.analyzeBrandCompliance(asset, imageBase64, enhancedData),
                    this.analyzeThumbStop(asset, imageBase64, enhancedData)
                ]);

                results.hookAnalysis = hookAnalysis.status === 'fulfilled' ? hookAnalysis.value : null;
                results.ctaAnalysis = ctaAnalysis.status === 'fulfilled' ? ctaAnalysis.value : null;
                results.brandCompliance = brandCompliance.status === 'fulfilled' ? brandCompliance.value : null;
                results.thumbStopScore = thumbStopScore.status === 'fulfilled' ? thumbStopScore.value : null;
                
                // Merge enhanced data into results if available
                if (enhancedData) {
                    // Add detected objects and labels
                    results.detectedObjects = enhancedData.objects || [];
                    results.detectedLabels = enhancedData.labels || [];
                    results.extractedText = enhancedData.detectedText || '';
                    results.colorPalette = enhancedData.colorPalette || [];
                    results.detectedLogos = enhancedData.logos || [];
                    results.faceData = enhancedData.faceAnalysis || null;
                    results.tags = enhancedData.tags || [];
                    
                    // Enhanced scores
                    if (enhancedData.scores) {
                        results.enhancedScores = enhancedData.scores;
                    }
                }

                // Audio strategy for videos
                if (asset.type === 'video' || asset.duration) {
                    results.audioStrategy = await this.analyzeAudioStrategy(asset);
                }

                // Performance prediction based on other analyses
                results.performancePrediction = await this.predictPerformance(asset, results);

                // Calculate confidence
                const successCount = [results.hookAnalysis, results.ctaAnalysis, results.thumbStopScore]
                    .filter(r => r && r.overallScore !== undefined).length;
                results.confidence = successCount >= 3 ? 'high' : successCount >= 2 ? 'medium' : 'low';
                
                // AUTO-DETECT BRAND from the creative
                const brandInfo = await this.detectBrandFromCreative(asset, imageBase64);
                if (brandInfo && brandInfo.brandName && brandInfo.brandName !== 'unknown') {
                    results.detectedBrand = brandInfo;
                    
                    // Auto-create/link CRM entry
                    const crmLink = await this.linkAnalysisToCRM(brandInfo, asset, results);
                    results.linkedCompanyId = crmLink?.companyId;
                    results.linkedProjectId = crmLink?.projectId;
                }

            } catch (error) {
                console.error('[Analyze] Comprehensive analysis error:', error);
            }

            results.processingTime = Date.now() - startTime;
            
            // Store current analysis
            this.currentAnalysis = results;
            
            // PERSIST: Save to localStorage and history
            this.saveCurrentAnalysis(results);
            this.saveAnalysisToHistory(results);

            // Also save via data models if available
            if (window.CAVDataModels?.Storage) {
                window.CAVDataModels.Storage.saveAnalysis(results);
            }
            
            console.log(`[Analyze] Analysis complete for ${asset.filename}, confidence: ${results.confidence}`);
            if (results.detectedBrand) {
                console.log(`[Analyze] Brand detected: ${results.detectedBrand.brandName}`);
            }

            return results;
        }
        
        // Detect brand from creative using AI vision
        async detectBrandFromCreative(asset, imageBase64) {
            try {
                const apiKey = localStorage.getItem('cav_gemini_api_key');
                if (!apiKey || !imageBase64) return null;
                
                const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
                const mimeType = imageBase64.match(/^data:(image\/[a-z]+);base64,/)?.[1] || 'image/jpeg';
                
                const prompt = `Analyze this creative asset and identify any brand information.

Identify:
1. **Brand Name**: What company, product, or organization is featured? If it's a sports team, school, or organization, identify that.
2. **Brand Type**: company, product, sports_team, school, organization, personal_brand, or unknown
3. **Industry**: What industry or sector?
4. **Website**: What is the likely official website? (e.g., "nordvpn.com")
5. **Logo Visible**: Is there a visible logo? (yes/no)
6. **Brand Confidence**: How confident are you? (high/medium/low)

Return ONLY valid JSON:
{
    "brandName": "NordVPN",
    "brandType": "company",
    "industry": "Cybersecurity/VPN",
    "website": "nordvpn.com",
    "logoVisible": true,
    "confidence": "high",
    "brandDescription": "VPN and cybersecurity service"
}

If no brand is detectable, return:
{"brandName": "unknown", "confidence": "low"}`;

                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{
                                parts: [
                                    { text: prompt },
                                    { inlineData: { mimeType, data: cleanBase64 } }
                                ]
                            }],
                            generationConfig: { temperature: 0.2, maxOutputTokens: 500 }
                        })
                    }
                );
                
                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
            } catch (e) {
                console.warn('[Analyze] Brand detection error:', e);
            }
            return null;
        }
        
        // Link analysis to CRM
        async linkAnalysisToCRM(brandInfo, asset, analysis) {
            if (!window.cavCRM || !brandInfo.brandName) return null;
            
            try {
                // Check if company exists
                let company = window.cavCRM.getAllCompanies({ search: brandInfo.brandName })[0];
                
                // If not, create it
                if (!company) {
                    company = window.cavCRM.createCompany({
                        name: brandInfo.brandName,
                        industry: brandInfo.industry || 'Unknown',
                        website: brandInfo.website ? `https://${brandInfo.website}` : '',
                        type: 'client',
                        description: brandInfo.brandDescription || `Auto-detected from creative: ${asset.filename}`,
                        tags: ['auto-detected', 'from-analysis'],
                        source: 'creative_analysis'
                    });
                    console.log(`[Analyze] Created CRM company: ${brandInfo.brandName}`);
                }
                
                // Link asset to company
                if (company && !company.linkedAssets?.includes(asset.id)) {
                    const linkedAssets = company.linkedAssets || [];
                    linkedAssets.push(asset.id);
                    window.cavCRM.updateCompany(company.id, { linkedAssets });
                }
                
                // Check for or create a project
                let project = window.cavCRM.getAllProjects({ client: company.id })[0];
                if (!project) {
                    project = window.cavCRM.createProject({
                        name: `${brandInfo.brandName} Creative Analysis`,
                        client: company.id,
                        clientName: company.name,
                        type: 'campaign',
                        status: 'active',
                        description: `Auto-created project for creative assets from ${brandInfo.brandName}`,
                        tags: ['auto-created', 'creative-analysis']
                    });
                    console.log(`[Analyze] Created CRM project for ${brandInfo.brandName}`);
                }
                
                // Link asset to project
                if (project) {
                    window.cavCRM.linkAssetToProject(project.id, asset.id);
                }
                
                // Log activity
                window.cavCRM.logActivity('creative_analyzed', {
                    assetId: asset.id,
                    assetFilename: asset.filename,
                    companyId: company.id,
                    companyName: company.name,
                    hookScore: analysis.hookAnalysis?.overallScore,
                    ctaScore: analysis.ctaAnalysis?.overallEffectiveness,
                    confidence: analysis.confidence
                });
                
                return {
                    companyId: company.id,
                    projectId: project?.id
                };
            } catch (e) {
                console.warn('[Analyze] CRM linking error:', e);
                return null;
            }
        }

        // ============================================
        // UI RENDERING
        // ============================================

        render(container, asset = null) {
            this.container = container;
            
            container.innerHTML = `
                <div class="cav-analyze-page">
                    <div class="cav-analyze-header">
                        <h1 class="cav-analyze-title">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--cav-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 8px;">
                                <line x1="18" y1="20" x2="18" y2="10"></line>
                                <line x1="12" y1="20" x2="12" y2="4"></line>
                                <line x1="6" y1="20" x2="6" y2="14"></line>
                            </svg>
                            Analyze
                        </h1>
                        <p class="cav-analyze-subtitle">AI-powered creative intelligence analysis</p>
                    </div>
                    
                    ${!asset ? this.renderAssetSelector() : ''}
                    
                    <div class="cav-analyze-content">
                        ${asset ? this.renderAnalysisView(asset) : this.renderEmptyState()}
                    </div>
                </div>
            `;

            this.attachEventHandlers(container);
            
            if (asset) {
                this.currentAsset = asset;
            }
        }

        renderEmptyState() {
            const history = this.analysisHistory || [];
            
            return `
                <div class="cav-analyze-empty">
                    <div class="cav-empty-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--cav-primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <circle cx="12" cy="12" r="4" fill="var(--cav-primary-soft)"></circle>
                            <line x1="12" y1="2" x2="12" y2="6"></line>
                            <line x1="12" y1="18" x2="12" y2="22"></line>
                            <line x1="2" y1="12" x2="6" y2="12"></line>
                            <line x1="18" y1="12" x2="22" y2="12"></line>
                        </svg>
                    </div>
                    <h2>Select an Asset to Analyze</h2>
                    <p>Choose an asset from your library or upload a new one to get AI-powered creative insights.</p>
                    <div class="cav-analyze-actions">
                        <button class="cav-btn cav-btn-primary" id="select-from-library">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px;">
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                            </svg>
                            Select from Library
                        </button>
                        <button class="cav-btn cav-btn-secondary" id="upload-for-analysis">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px;">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                            Upload New Asset
                        </button>
                    </div>
                    
                    <!-- Analysis History Section -->
                    ${history.length > 0 ? `
                        <div class="cav-analysis-history-section">
                            <h3>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--cav-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px;">
                                    <line x1="18" y1="20" x2="18" y2="10"></line>
                                    <line x1="12" y1="20" x2="12" y2="4"></line>
                                    <line x1="6" y1="20" x2="6" y2="14"></line>
                                </svg>
                                Recent Analyses (${history.length})
                            </h3>
                            <p class="cav-section-hint">Your analysis history is saved and persists across sessions</p>
                            <div class="cav-history-list">
                                ${history.slice(0, 8).map(a => `
                                    <div class="cav-history-item" data-asset-id="${a.assetId}">
                                        <div class="cav-history-info">
                                            <span class="cav-history-filename">${a.assetFilename || 'Unknown'}</span>
                                            <span class="cav-history-date">${new Date(a.analyzedAt).toLocaleString()}</span>
                                        </div>
                                        <div class="cav-history-scores">
                                            ${a.hookAnalysis?.overallScore ? `<span class="cav-score-badge">🎣 ${a.hookAnalysis.overallScore}</span>` : ''}
                                            ${a.ctaAnalysis?.overallEffectiveness ? `<span class="cav-score-badge">📢 ${a.ctaAnalysis.overallEffectiveness}</span>` : ''}
                                            ${a.thumbStopScore?.overallScore ? `<span class="cav-score-badge">👆 ${a.thumbStopScore.overallScore}</span>` : ''}
                                        </div>
                                        <div class="cav-history-meta">
                                            <span class="cav-confidence-badge cav-confidence-${a.confidence}">${a.confidence}</span>
                                            ${a.detectedBrand?.brandName && a.detectedBrand.brandName !== 'unknown' ? 
                                              `<span class="cav-brand-mini">${a.detectedBrand.brandName}</span>` : ''}
                                        </div>
                                        <div class="cav-history-actions">
                                            <button class="cav-btn cav-btn-small" data-action="view-history-analysis" data-asset-id="${a.assetId}">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                                View
                                            </button>
                                            ${a.linkedCompanyId ? `
                                                <button class="cav-btn cav-btn-small" data-action="view-in-crm" data-company-id="${a.linkedCompanyId}">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                                                    CRM
                                                </button>
                                            ` : ''}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            ${history.length > 8 ? `
                                <button class="cav-btn cav-btn-link" id="show-all-history">
                                    Show all ${history.length} analyses →
                                </button>
                            ` : ''}
                            <button class="cav-btn cav-btn-link cav-btn-danger" id="clear-history">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                                Clear History
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        }

        renderAssetSelector() {
            return `
                <div class="cav-asset-selector">
                    <button class="cav-btn cav-btn-outline" id="change-asset">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px;">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <polyline points="1 20 1 14 7 14"></polyline>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                        </svg>
                        Change Asset
                    </button>
                </div>
            `;
        }

        renderAnalysisView(asset) {
            const analysis = this.currentAnalysis;
            
            // FIX: Get the correct image source - check multiple properties
            const imageSrc = asset.thumbnail_url || asset.thumbnail || asset.dataUrl || asset.video_url || 
                            (asset.file ? URL.createObjectURL(asset.file) : null);
            
            return `
                <div class="cav-analyze-layout">
                    <div class="cav-analyze-preview">
                        <div class="cav-preview-card">
                            ${imageSrc ? 
                              `<img src="${imageSrc}" alt="${asset.filename}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                               <div class="cav-no-preview" style="display:none;">📷 Preview unavailable</div>` : 
                              '<div class="cav-no-preview">📷 No Preview Available</div>'}
                            <div class="cav-preview-info">
                                <h3>${asset.filename}</h3>
                                <p>${asset.width || '?'}×${asset.height || '?'} • ${asset.type || asset.file_type || 'image'}</p>
                            </div>
                        </div>
                        
                        ${analysis?.detectedBrand && analysis.detectedBrand.brandName !== 'unknown' ? `
                            <div class="cav-detected-brand-card">
                                <span class="cav-brand-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>Detected Brand</span>
                                <h4>${analysis.detectedBrand.brandName}</h4>
                                <p>${analysis.detectedBrand.industry || ''}</p>
                                ${analysis.linkedCompanyId ? `
                                    <button class="cav-btn cav-btn-small cav-btn-secondary" data-action="view-in-crm" data-company-id="${analysis.linkedCompanyId}">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>View in CRM
                                    </button>
                                ` : ''}
                            </div>
                        ` : ''}
                        
                        <button class="cav-btn cav-btn-primary cav-btn-large" id="run-analysis" ${analysis ? 'disabled' : ''}>
                            ${analysis ? `
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px;">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                Analysis Complete
                            ` : `
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px;">
                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                </svg>
                                Run Full Analysis
                            `}
                        </button>
                        
                        ${analysis ? `
                            <button class="cav-btn cav-btn-secondary" id="rerun-analysis">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px;">
                                    <polyline points="23 4 23 10 17 10"></polyline>
                                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                                </svg>
                                Re-analyze
                            </button>
                            <button class="cav-btn cav-btn-secondary" id="save-analysis">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px;">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                    <polyline points="7 3 7 8 15 8"></polyline>
                                </svg>
                                Save to History
                            </button>
                            <button class="cav-btn cav-btn-primary" id="save-to-crm-analysis">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px;">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                Save to CRM
                            </button>
                        ` : ''}
                    </div>
                    
                    <div class="cav-analyze-results">
                        ${analysis ? this.renderAnalysisResults(analysis) : this.renderAnalysisPending()}
                    </div>
                </div>
            `;
        }

        renderAnalysisPending() {
            return `
                <div class="cav-analysis-pending">
                    <div class="cav-pending-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--cav-text-muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                    </div>
                    <p>Click "Run Full Analysis" to get AI-powered insights</p>
                    <ul class="cav-analysis-list">
                        <li><span class="cav-list-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></span> Hook Analysis - Scroll-stopping potential</li>
                        <li><span class="cav-list-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg></span> CTA Audit - Call-to-action effectiveness</li>
                        <li><span class="cav-list-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/><circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="12.5" r="2.5"/></svg></span> Brand Compliance - Brand guideline adherence</li>
                        <li><span class="cav-list-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></span> Thumb-Stop Score - Engagement prediction</li>
                        <li><span class="cav-list-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></span> Performance Prediction - CTR, CPM estimates</li>
                    </ul>
                </div>
            `;
        }

        renderAnalysisResults(analysis) {
            return `
                <div class="cav-analysis-results">
                    <div class="cav-analysis-header">
                        <h2>Analysis Results</h2>
                        <span class="cav-confidence cav-confidence-${analysis.confidence}">
                            Confidence: ${analysis.confidence}
                        </span>
                        <span class="cav-processing-time">
                            Processed in ${(analysis.processingTime / 1000).toFixed(1)}s
                        </span>
                        ${analysis.enhancedAnalysis?.sources ? `
                            <span class="cav-analysis-sources" title="Analysis services used">
                                ${analysis.enhancedAnalysis.sources.googleVision ? '🔍 Vision' : ''}
                                ${analysis.enhancedAnalysis.sources.cloudinary ? '☁️ Cloudinary' : ''}
                                ${analysis.enhancedAnalysis.sources.aiAnalysis ? '🤖 AI' : ''}
                            </span>
                        ` : ''}
                    </div>
                    
                    <div class="cav-analysis-sections">
                        ${this.renderHookSection(analysis.hookAnalysis)}
                        ${this.renderCTASection(analysis.ctaAnalysis)}
                        ${this.renderBrandSection(analysis.brandCompliance)}
                        ${this.renderThumbStopSection(analysis.thumbStopScore)}
                        ${analysis.audioStrategy ? this.renderAudioSection(analysis.audioStrategy) : ''}
                        ${this.renderPredictionSection(analysis.performancePrediction)}
                        ${this.renderEnhancedDataSection(analysis)}
                    </div>
                </div>
            `;
        }
        
        renderEnhancedDataSection(analysis) {
            // Only show if we have enhanced data
            const hasObjects = analysis.detectedObjects?.length > 0;
            const hasLabels = analysis.detectedLabels?.length > 0 || analysis.tags?.length > 0;
            const hasColors = analysis.colorPalette?.length > 0;
            const hasLogos = analysis.detectedLogos?.length > 0;
            const hasText = analysis.extractedText?.length > 0;
            const hasFaces = analysis.faceData?.detected;
            
            if (!hasObjects && !hasLabels && !hasColors && !hasLogos && !hasText && !hasFaces) {
                return ''; // No enhanced data available
            }
            
            return `
                <div class="cav-section cav-section-collapsible" data-section="enhanced">
                    <div class="cav-section-header">
                        <h3>🔬 Advanced Detection</h3>
                        <div class="cav-badge cav-badge-info">Multi-Service AI</div>
                    </div>
                    <div class="cav-section-content">
                        ${hasObjects ? `
                            <div class="cav-enhanced-subsection">
                                <h4>📦 Detected Objects</h4>
                                <div class="cav-tags">
                                    ${analysis.detectedObjects.slice(0, 10).map(obj => `
                                        <span class="cav-tag" title="${obj.confidence}% confidence">
                                            ${obj.name} <small>${obj.confidence}%</small>
                                        </span>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${hasLabels ? `
                            <div class="cav-enhanced-subsection">
                                <h4>🏷️ Scene Labels</h4>
                                <div class="cav-tags">
                                    ${(analysis.detectedLabels || analysis.tags || []).slice(0, 15).map(label => `
                                        <span class="cav-tag cav-tag-label" title="${label.confidence || label.score || 0}% confidence">
                                            ${label.name || label.tag}
                                        </span>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${hasLogos ? `
                            <div class="cav-enhanced-subsection">
                                <h4>🏢 Brand/Logo Detection</h4>
                                <div class="cav-tags">
                                    ${analysis.detectedLogos.map(logo => `
                                        <span class="cav-tag cav-tag-brand">
                                            ${logo.name} <small>${logo.confidence}%</small>
                                        </span>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${hasColors ? `
                            <div class="cav-enhanced-subsection">
                                <h4>🎨 Color Palette</h4>
                                <div class="cav-color-palette">
                                    ${analysis.colorPalette.slice(0, 8).map(color => `
                                        <div class="cav-color-item" title="${color.hex} (${color.percentage || 0}%)">
                                            <span class="cav-color-swatch" style="background: ${color.hex}"></span>
                                            <span class="cav-color-hex">${color.hex}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${hasFaces ? `
                            <div class="cav-enhanced-subsection">
                                <h4>👤 Face Analysis</h4>
                                <div class="cav-face-info">
                                    <span class="cav-stat">
                                        <strong>${analysis.faceData.count}</strong> face(s) detected
                                    </span>
                                    ${analysis.faceData.details?.[0]?.emotions ? `
                                        <div class="cav-emotions">
                                            ${Object.entries(analysis.faceData.details[0].emotions)
                                                .filter(([k, v]) => v && v !== 'VERY_UNLIKELY' && v !== 'UNLIKELY')
                                                .map(([emotion, likelihood]) => `
                                                    <span class="cav-emotion cav-emotion-${likelihood.toLowerCase()}">
                                                        ${emotion}: ${likelihood}
                                                    </span>
                                                `).join('')}
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${hasText ? `
                            <div class="cav-enhanced-subsection">
                                <h4>📝 Detected Text (OCR)</h4>
                                <div class="cav-extracted-text">
                                    <pre>${analysis.extractedText.substring(0, 500)}${analysis.extractedText.length > 500 ? '...' : ''}</pre>
                                </div>
                            </div>
                        ` : ''}
                        
                        ${analysis.enhancedScores ? `
                            <div class="cav-enhanced-subsection">
                                <h4>📊 Composite Scores</h4>
                                <div class="cav-score-breakdown">
                                    ${this.renderScoreBar('Visual Quality', analysis.enhancedScores.visualQuality)}
                                    ${this.renderScoreBar('Object Clarity', analysis.enhancedScores.objectClarity)}
                                    ${analysis.enhancedScores.colorHarmony ? this.renderScoreBar('Color Harmony', analysis.enhancedScores.colorHarmony) : ''}
                                    ${analysis.enhancedScores.faceEngagement ? this.renderScoreBar('Face Engagement', analysis.enhancedScores.faceEngagement) : ''}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        renderHookSection(hook) {
            if (!hook) return '<div class="cav-section cav-section-error">Hook analysis not available</div>';
            
            const interpretation = window.CAVDataModels?.HookAnalysis?.getScoreInterpretation(hook.overallScore) || {};
            
            return `
                <div class="cav-section cav-section-collapsible" data-section="hook">
                    <div class="cav-section-header">
                        <h3>🎣 Hook Analysis</h3>
                        <div class="cav-score-badge cav-score-${this.getScoreClass(hook.overallScore)}">
                            ${hook.overallScore}/100
                        </div>
                    </div>
                    <div class="cav-section-content">
                        <p class="cav-interpretation">${interpretation.description || ''}</p>
                        
                        <div class="cav-score-breakdown">
                            ${this.renderScoreBar('Visual Disruption', hook.visualDisruptionScore, 35)}
                            ${this.renderScoreBar('Motion Quality', hook.motionQualityScore, 20)}
                            ${this.renderScoreBar('Emotional Trigger', hook.emotionalTriggerScore, 25)}
                            ${this.renderScoreBar('Text Hook', hook.textHookScore, 10)}
                            ${hook.audioHookScore !== null ? this.renderScoreBar('Audio Hook', hook.audioHookScore, 10) : ''}
                        </div>
                        
                        <div class="cav-details-grid">
                            <div class="cav-detail">
                                <span class="cav-detail-label">Face Detected</span>
                                <span class="cav-detail-value">${hook.faceDetected ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Yes' : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> No'}</span>
                            </div>
                            <div class="cav-detail">
                                <span class="cav-detail-label">Eye Contact</span>
                                <span class="cav-detail-value">${hook.eyeContact ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Yes' : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> No'}</span>
                            </div>
                        </div>
                        
                        ${hook.firstFrameElements?.length ? `
                            <div class="cav-tags">
                                <span class="cav-tags-label">Key Elements:</span>
                                ${hook.firstFrameElements.map(el => `<span class="cav-tag">${el}</span>`).join('')}
                            </div>
                        ` : ''}
                        
                        ${hook.improvementSuggestions?.length ? `
                            <div class="cav-suggestions">
                                <h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 4 12.9V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.1A7 7 0 0 1 12 2z"/></svg>Suggestions</h4>
                                <ul>
                                    ${hook.improvementSuggestions.map(s => `<li>${s}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        renderCTASection(cta) {
            if (!cta) return '<div class="cav-section cav-section-error">CTA analysis not available</div>';
            
            return `
                <div class="cav-section cav-section-collapsible" data-section="cta">
                    <div class="cav-section-header">
                        <h3>📢 CTA Audit</h3>
                        <div class="cav-score-badge cav-score-${this.getScoreClass(cta.overallEffectiveness)}">
                            ${cta.overallEffectiveness}/100
                        </div>
                    </div>
                    <div class="cav-section-content">
                        <div class="cav-cta-status">
                            <span class="cav-cta-detected ${cta.ctaDetected ? 'yes' : 'no'}">
                                ${cta.ctaDetected ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><polyline points="20 6 9 17 4 12"/></svg>CTA Detected' : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>No CTA Found'}
                            </span>
                            ${cta.ctaText ? `<span class="cav-cta-text">"${cta.ctaText}"</span>` : ''}
                            ${cta.ctaType && cta.ctaType !== 'none' ? `
                                <span class="cav-cta-type cav-cta-type-${cta.ctaType}">${cta.ctaType} CTA</span>
                            ` : ''}
                        </div>
                        
                        <div class="cav-score-breakdown">
                            ${this.renderScoreBar('Presence', cta.presenceScore, 25)}
                            ${this.renderScoreBar('Clarity', cta.clarityScore, 30)}
                            ${this.renderScoreBar('Placement', cta.placementScore, 20)}
                            ${this.renderScoreBar('Urgency', cta.urgencyScore, 15)}
                            ${this.renderScoreBar('Platform Fit', cta.platformAlignmentScore, 10)}
                        </div>
                        
                        ${cta.platformAlignment?.length ? `
                            <div class="cav-platform-alignment">
                                <h4>Platform Alignment</h4>
                                <div class="cav-platforms">
                                    ${cta.platformAlignment.map(p => `
                                        <span class="cav-platform ${p.aligned ? 'aligned' : 'misaligned'}">
                                            ${p.aligned ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" style="margin-right:4px;"><polyline points="20 6 9 17 4 12"/></svg>' : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" style="margin-right:4px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'} ${p.platform}
                                        </span>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${cta.recommendations?.length ? `
                            <div class="cav-suggestions">
                                <h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 4 12.9V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.1A7 7 0 0 1 12 2z"/></svg>Suggestions</h4>
                                <ul>
                                    ${cta.recommendations.map(r => `<li>${r}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        renderBrandSection(brand) {
            if (!brand) return '<div class="cav-section cav-section-error">Brand analysis not available</div>';
            
            return `
                <div class="cav-section cav-section-collapsible" data-section="brand">
                    <div class="cav-section-header">
                        <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:6px;vertical-align:middle;"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/><circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="12.5" r="2.5"/></svg>Brand Compliance</h3>
                        <div class="cav-score-badge cav-score-${this.getScoreClass(brand.overallCompliance)}">
                            ${brand.overallCompliance}/100
                        </div>
                    </div>
                    <div class="cav-section-content">
                        <div class="cav-score-breakdown">
                            ${this.renderScoreBar('Logo', brand.logoScore)}
                            ${this.renderScoreBar('Colors', brand.colorScore)}
                            ${this.renderScoreBar('Typography', brand.fontScore)}
                            ${this.renderScoreBar('Tone of Voice', brand.toneScore)}
                            ${this.renderScoreBar('Visual Style', brand.visualStyleScore)}
                        </div>
                        
                        <div class="cav-brand-checks">
                            <div class="cav-check ${brand.logoPresent ? 'pass' : 'fail'}">
                                ${brand.logoPresent ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'} Logo Present
                            </div>
                            <div class="cav-check ${brand.logoCorrectVersion ? 'pass' : 'fail'}">
                                ${brand.logoCorrectVersion ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'} Correct Version
                            </div>
                            <div class="cav-check ${brand.fontMatch ? 'pass' : 'fail'}">
                                ${brand.fontMatch ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'} Font Match
                            </div>
                            <div class="cav-check ${brand.visualStyleMatch ? 'pass' : 'fail'}">
                                ${brand.visualStyleMatch ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'} Visual Style
                            </div>
                        </div>
                        
                        ${brand.colorMatch ? `
                            <div class="cav-color-match">
                                <h4>Color Analysis</h4>
                                <div class="cav-colors">
                                    ${['primary', 'secondary', 'accent'].map(type => {
                                        const color = brand.colorMatch[type];
                                        return color ? `
                                            <div class="cav-color-item ${color.match ? 'match' : 'mismatch'}">
                                                <span class="cav-color-swatch" style="background: ${color.detected}"></span>
                                                <span class="cav-color-label">${type}</span>
                                                <span class="cav-color-status">${color.match ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'}</span>
                                            </div>
                                        ` : '';
                                    }).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${brand.issues?.length ? `
                            <div class="cav-issues">
                                <h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>Issues</h4>
                                <ul>
                                    ${brand.issues.map(i => `<li>${i}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        renderThumbStopSection(thumbStop) {
            if (!thumbStop) return '<div class="cav-section cav-section-error">Thumb-stop analysis not available</div>';
            
            return `
                <div class="cav-section cav-section-collapsible" data-section="thumbstop">
                    <div class="cav-section-header">
                        <h3>👆 Thumb-Stop Score</h3>
                        <div class="cav-score-badge cav-score-${this.getScoreClass(thumbStop.overallScore)}">
                            ${thumbStop.overallScore}/100
                        </div>
                    </div>
                    <div class="cav-section-content">
                        <div class="cav-score-breakdown">
                            ${this.renderScoreBar('Visual Salience', thumbStop.visualSalience, 35)}
                            ${this.renderScoreBar('Pattern Interrupt', thumbStop.patternInterrupt, 25)}
                            ${this.renderScoreBar('Emotional Hook', thumbStop.emotionalHook, 25)}
                            ${this.renderScoreBar('Relevance Signal', thumbStop.relevanceSignal, 15)}
                        </div>
                        
                        <div class="cav-details-grid">
                            <div class="cav-detail">
                                <span class="cav-detail-label">Color Contrast</span>
                                <span class="cav-detail-value">${thumbStop.colorContrast}/100</span>
                            </div>
                            <div class="cav-detail">
                                <span class="cav-detail-label">Focal Clarity</span>
                                <span class="cav-detail-value">${thumbStop.focalPointClarity}/100</span>
                            </div>
                            <div class="cav-detail">
                                <span class="cav-detail-label">Novelty</span>
                                <span class="cav-detail-value">${thumbStop.noveltyFactor}/100</span>
                            </div>
                            <div class="cav-detail">
                                <span class="cav-detail-label">Product Visibility</span>
                                <span class="cav-detail-value">${thumbStop.productVisibility}/100</span>
                            </div>
                        </div>
                        
                        ${thumbStop.targetingCues?.length ? `
                            <div class="cav-tags">
                                <span class="cav-tags-label">Target Audience:</span>
                                ${thumbStop.targetingCues.map(cue => `<span class="cav-tag">${cue}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        renderAudioSection(audio) {
            if (!audio) return '';
            
            return `
                <div class="cav-section cav-section-collapsible" data-section="audio">
                    <div class="cav-section-header">
                        <h3><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;vertical-align:middle;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>Audio Strategy</h3>
                        <div class="cav-score-badge cav-score-${this.getScoreClass(audio.overallScore)}">
                            ${audio.overallScore}/100
                        </div>
                    </div>
                    <div class="cav-section-content">
                        <div class="cav-audio-status">
                            <span class="${audio.soundOffViable ? 'good' : 'warning'}">
                                ${audio.soundOffViable ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><polyline points="20 6 9 17 4 12"/></svg>Sound-Off Viable' : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>Needs Sound-Off Optimization'}
                            </span>
                            ${audio.captionsPresent ? `<span class="good"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Captions</span>` : `<span class="bad"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> No Captions</span>`}
                        </div>
                        
                        <div class="cav-score-breakdown">
                            ${this.renderScoreBar('Sound-Off Score', audio.soundOffScore)}
                            ${this.renderScoreBar('Caption Quality', audio.captionQuality)}
                            ${this.renderScoreBar('Voice Clarity', audio.voiceOverClarity)}
                        </div>
                        
                        ${audio.platformRecommendations ? `
                            <div class="cav-platform-recs">
                                <h4>Platform Recommendations</h4>
                                ${Object.entries(audio.platformRecommendations).map(([platform, rec]) => `
                                    <div class="cav-platform-rec">
                                        <strong>${platform.replace('_', ' ')}</strong>: ${rec || 'No specific recommendation'}
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        renderPredictionSection(prediction) {
            if (!prediction) return '<div class="cav-section cav-section-error">Performance prediction not available</div>';
            
            return `
                <div class="cav-section cav-section-collapsible" data-section="prediction">
                    <div class="cav-section-header">
                        <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:6px;vertical-align:middle;"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>Performance Prediction</h3>
                        <span class="cav-prediction-badge cav-prediction-${prediction.conversionPotential}">
                            ${prediction.conversionPotential} potential
                        </span>
                    </div>
                    <div class="cav-section-content">
                        <div class="cav-prediction-grid">
                            <div class="cav-prediction-card">
                                <h4>CTR</h4>
                                <div class="cav-prediction-range">
                                    <span class="low">${prediction.ctr?.low}%</span>
                                    <span class="expected">${prediction.ctr?.expected}%</span>
                                    <span class="high">${prediction.ctr?.high}%</span>
                                </div>
                                <div class="cav-range-labels">
                                    <span>Low</span><span>Expected</span><span>High</span>
                                </div>
                            </div>
                            
                            <div class="cav-prediction-card">
                                <h4>CPM</h4>
                                <div class="cav-prediction-range">
                                    <span class="low">$${prediction.cpm?.low}</span>
                                    <span class="expected">$${prediction.cpm?.expected}</span>
                                    <span class="high">$${prediction.cpm?.high}</span>
                                </div>
                                <div class="cav-range-labels">
                                    <span>Low</span><span>Expected</span><span>High</span>
                                </div>
                            </div>
                            
                            <div class="cav-prediction-card">
                                <h4>Engagement</h4>
                                <div class="cav-prediction-range">
                                    <span class="low">${prediction.engagementRate?.low}%</span>
                                    <span class="expected">${prediction.engagementRate?.expected}%</span>
                                    <span class="high">${prediction.engagementRate?.high}%</span>
                                </div>
                                <div class="cav-range-labels">
                                    <span>Low</span><span>Expected</span><span>High</span>
                                </div>
                            </div>
                        </div>
                        
                        ${prediction.confidenceFactors?.length ? `
                            <div class="cav-confidence-factors">
                                <h4>Key Factors</h4>
                                <ul>
                                    ${prediction.confidenceFactors.map(f => `<li>${f}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        renderScoreBar(label, score, weight = null) {
            const scoreClass = this.getScoreClass(score);
            return `
                <div class="cav-score-bar">
                    <div class="cav-score-bar-label">
                        ${label}
                        ${weight ? `<span class="weight">(${weight}%)</span>` : ''}
                    </div>
                    <div class="cav-score-bar-track">
                        <div class="cav-score-bar-fill cav-score-${scoreClass}" style="width: ${score}%"></div>
                    </div>
                    <div class="cav-score-bar-value">${score}</div>
                </div>
            `;
        }

        getScoreClass(score) {
            if (score >= 80) return 'excellent';
            if (score >= 60) return 'good';
            if (score >= 40) return 'fair';
            return 'poor';
        }

        // ============================================
        // EVENT HANDLERS
        // ============================================

        // Get image data from asset (checks all possible sources)
        async getAssetImageData(asset) {
            console.log('[Analyze] Getting image data from asset:', asset?.filename);
            
            // Check all possible image data sources
            let imageData = null;
            
            // 1. Check dataUrl (most common for library assets)
            if (asset.dataUrl && asset.dataUrl.startsWith('data:image')) {
                console.log('[Analyze] Using asset.dataUrl');
                imageData = asset.dataUrl;
            }
            // 2. Check thumbnail
            else if (asset.thumbnail && asset.thumbnail.startsWith('data:image')) {
                console.log('[Analyze] Using asset.thumbnail');
                imageData = asset.thumbnail;
            }
            // 3. Check file object
            else if (asset.file) {
                console.log('[Analyze] Converting file object to base64');
                imageData = await this.fileToBase64(asset.file);
            }
            // 4. Try to fetch from URL
            else if (asset.url && !asset.url.startsWith('blob:')) {
                console.log('[Analyze] Fetching from URL:', asset.url);
                try {
                    const response = await fetch(asset.url);
                    const blob = await response.blob();
                    imageData = await this.blobToBase64(blob);
                } catch (e) {
                    console.warn('[Analyze] Failed to fetch from URL:', e);
                }
            }
            // 5. Try to get from image element in DOM
            else {
                console.log('[Analyze] Trying to extract from DOM image');
                const imgEl = document.querySelector(`img[data-asset-id="${asset.id}"]`) || 
                              document.querySelector('.cav-analyze-preview img');
                if (imgEl && imgEl.src) {
                    if (imgEl.src.startsWith('data:image')) {
                        imageData = imgEl.src;
                    } else {
                        // Try to convert to canvas
                        try {
                            const canvas = document.createElement('canvas');
                            canvas.width = imgEl.naturalWidth || imgEl.width;
                            canvas.height = imgEl.naturalHeight || imgEl.height;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(imgEl, 0, 0);
                            imageData = canvas.toDataURL('image/jpeg', 0.9);
                            console.log('[Analyze] Extracted from canvas');
                        } catch (e) {
                            console.warn('[Analyze] Canvas extraction failed:', e);
                        }
                    }
                }
            }
            
            if (imageData) {
                console.log('[Analyze] Image data obtained, length:', imageData.length);
            } else {
                console.warn('[Analyze] No image data found for asset');
            }
            
            return imageData;
        }
        
        // Convert blob to base64
        blobToBase64(blob) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        }

        attachEventHandlers(container) {
            // Run analysis button
            container.querySelector('#run-analysis')?.addEventListener('click', async () => {
                if (!this.currentAsset) return;
                
                const btn = container.querySelector('#run-analysis');
                btn.disabled = true;
                btn.innerHTML = '⏳ Analyzing...';
                
                try {
                    // Get image data from all possible sources
                    const imageBase64 = await this.getAssetImageData(this.currentAsset);
                    
                    if (!imageBase64) {
                        throw new Error('Could not get image data from asset. Please re-upload the asset.');
                    }
                    
                    console.log('[Analyze] Starting comprehensive analysis with image data');
                    const analysis = await this.analyzeComprehensive(this.currentAsset, imageBase64);
                    
                    // Re-render with results
                    this.render(container, this.currentAsset);
                    
                } catch (error) {
                    console.error('[Analyze] Analysis error:', error);
                    btn.disabled = false;
                    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Error - Try Again';
                    // Show user-friendly error
                    alert(`Analysis failed: ${error.message}`);
                }
            });

            // Re-run analysis
            container.querySelector('#rerun-analysis')?.addEventListener('click', async () => {
                this.currentAnalysis = null;
                
                const btn = container.querySelector('#rerun-analysis');
                const originalHTML = btn.innerHTML;
                btn.disabled = true;
                btn.innerHTML = '⏳ Re-analyzing...';
                
                try {
                    // Get image data from all possible sources
                    const imageBase64 = await this.getAssetImageData(this.currentAsset);
                    
                    if (!imageBase64) {
                        throw new Error('Could not get image data from asset');
                    }
                    
                    console.log('[Analyze] Re-running comprehensive analysis');
                    await this.analyzeComprehensive(this.currentAsset, imageBase64);
                    
                    this.render(container, this.currentAsset);
                } catch (error) {
                    console.error('[Analyze] Re-analysis error:', error);
                    btn.disabled = false;
                    btn.innerHTML = originalHTML;
                    alert(`Re-analysis failed: ${error.message}`);
                }
            });

            // Collapsible sections
            container.querySelectorAll('.cav-section-header').forEach(header => {
                header.addEventListener('click', () => {
                    const section = header.closest('.cav-section-collapsible');
                    section?.classList.toggle('collapsed');
                });
            });

            // Select from library
            container.querySelector('#select-from-library')?.addEventListener('click', () => {
                this.showAssetPicker();
            });
            
            // Save analysis to history - with feedback
            container.querySelector('#save-analysis')?.addEventListener('click', async () => {
                const saveBtn = container.querySelector('#save-analysis');
                
                if (!this.currentAnalysis) {
                    if (window.PersistenceUI) {
                        window.PersistenceUI.showError('Nothing to Save', 'Analyze an asset first, then save');
                    }
                    return;
                }
                
                const originalText = saveBtn?.textContent;
                if (saveBtn) {
                    saveBtn.disabled = true;
                    saveBtn.textContent = 'Saving...';
                }
                
                try {
                    this.saveAnalysisToHistory(this.currentAnalysis);
                    
                    if (window.PersistenceUI) {
                        window.PersistenceUI.showSuccess('Analysis Saved', `Analysis for "${this.currentAnalysis.assetFilename || 'asset'}" saved to history`);
                    }
                    
                    if (saveBtn) {
                        saveBtn.textContent = 'Saved!';
                        setTimeout(() => {
                            saveBtn.textContent = originalText;
                            saveBtn.disabled = false;
                        }, 2000);
                    }
                } catch (error) {
                    console.error('[Analyze] Save error:', error);
                    if (window.PersistenceUI) {
                        window.PersistenceUI.showError('Save Failed', error.message || 'Could not save analysis');
                    }
                    if (saveBtn) {
                        saveBtn.textContent = originalText;
                        saveBtn.disabled = false;
                    }
                }
            });
            
            // Clear history button - with confirmation
            container.querySelector('#clear-history')?.addEventListener('click', async () => {
                const confirmed = window.PersistenceUI
                    ? await window.PersistenceUI.confirm({
                        title: 'Clear All History?',
                        message: `This will delete all ${this.analysisHistory.length} saved analyses. This action cannot be undone.`,
                        confirmText: 'Clear All',
                        cancelText: 'Cancel'
                    })
                    : confirm('Are you sure you want to clear all analysis history?');
                
                if (confirmed) {
                    this.analysisHistory = [];
                    try {
                        localStorage.removeItem(STORAGE_KEYS.ANALYSIS_HISTORY);
                        localStorage.removeItem(STORAGE_KEYS.CURRENT_ANALYSIS);
                        
                        if (window.PersistenceUI) {
                            window.PersistenceUI.showSuccess('History Cleared', 'All analysis history has been deleted');
                        }
                    } catch (e) {
                        console.warn('[Analyze] Failed to clear history:', e);
                        if (window.PersistenceUI) {
                            window.PersistenceUI.showError('Clear Failed', 'Could not clear history');
                        }
                    }
                    this.render(container);
                }
            });
            
            // View history analysis buttons
            container.querySelectorAll('[data-action="view-history-analysis"]').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const assetId = btn.dataset.assetId;
                    const historyEntry = this.analysisHistory.find(a => a.assetId === assetId);
                    
                    if (historyEntry) {
                        // Load the analysis from history
                        this.currentAnalysis = historyEntry;
                        
                        // Try to find the asset
                        const assets = await this.getAllAssets();
                        const asset = assets.find(a => a.id === assetId);
                        
                        if (asset) {
                            this.currentAsset = asset;
                            this.render(container, asset);
                        } else {
                            // Asset not found, but we can still show the analysis
                            this.currentAsset = {
                                id: assetId,
                                filename: historyEntry.assetFilename || 'Unknown',
                                width: historyEntry.width,
                                height: historyEntry.height
                            };
                            this.render(container, this.currentAsset);
                        }
                    }
                });
            });
            
            // View in CRM buttons
            container.querySelectorAll('[data-action="view-in-crm"]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const companyId = btn.dataset.companyId;
                    if (companyId && window.cavCRM) {
                        // Navigate to CRM and show company
                        const navButtons = document.querySelectorAll('.main-nav button');
                        const crmBtn = Array.from(navButtons).find(b => b.textContent.includes('CRM'));
                        if (crmBtn) crmBtn.click();
                        
                        setTimeout(() => {
                            // Try to highlight the company in the CRM view
                            const companyEl = document.querySelector(`[data-company-id="${companyId}"]`);
                            if (companyEl) {
                                companyEl.scrollIntoView({ behavior: 'smooth' });
                                companyEl.classList.add('cav-highlight');
                                setTimeout(() => companyEl.classList.remove('cav-highlight'), 2000);
                            }
                        }, 500);
                    }
                });
            });
            
            // Show all history button
            container.querySelector('#show-all-history')?.addEventListener('click', () => {
                this.showFullHistoryModal();
            });
            
            // Save to CRM button
            container.querySelector('#save-to-crm-analysis')?.addEventListener('click', () => {
                this.showSaveToCRMModal();
            });
        }
        
        // Show Save to CRM Modal for Analysis
        showSaveToCRMModal() {
            if (!this.currentAsset || !this.currentAnalysis) {
                alert('No analysis to save. Run an analysis first.');
                return;
            }
            
            // Get existing CRM companies
            const companies = window.cavCRM ? Object.values(window.cavCRM.companies || {}) : [];
            
            // Pre-populate with detected brand if available
            const detectedBrand = this.currentAnalysis.detectedBrand?.brandName;
            const isKnownBrand = detectedBrand && detectedBrand !== 'unknown';
            
            const modal = document.createElement('div');
            modal.className = 'cav-modal-overlay';
            modal.innerHTML = `
                <div class="cav-modal" style="max-width: 500px;">
                    <div class="cav-modal-header">
                        <h2><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;vertical-align:middle;"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>Save Analysis to CRM</h2>
                        <button class="cav-modal-close">&times;</button>
                    </div>
                    <div class="cav-modal-body">
                        ${isKnownBrand ? `
                            <div class="cav-detected-brand-info">
                                <span class="cav-brand-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>Detected Brand</span>
                                <h4>${detectedBrand}</h4>
                                <p class="cav-hint">This brand was detected in the creative. It can be saved as a client company.</p>
                            </div>
                        ` : ''}
                        
                        <div class="cav-form-group">
                            <label>Assign to Company/Client:</label>
                            <select id="crm-company-select" class="cav-select">
                                <option value="">-- Select Existing Company --</option>
                                ${companies.map(c => `<option value="${c.id}" ${isKnownBrand && c.name.toLowerCase() === detectedBrand.toLowerCase() ? 'selected' : ''}>${c.name}</option>`).join('')}
                                <option value="new" ${isKnownBrand && !companies.find(c => c.name.toLowerCase() === detectedBrand.toLowerCase()) ? 'selected' : ''}>➕ Create New Company</option>
                            </select>
                        </div>
                        
                        <div id="new-company-fields" style="display: ${isKnownBrand && !companies.find(c => c.name.toLowerCase() === detectedBrand.toLowerCase()) ? 'block' : 'none'};">
                            <div class="cav-form-group">
                                <label>Company Name:</label>
                                <input type="text" id="new-company-name" class="cav-input" placeholder="Enter company name" value="${isKnownBrand ? detectedBrand : ''}">
                            </div>
                            <div class="cav-form-group">
                                <label>Industry:</label>
                                <select id="new-company-industry" class="cav-select">
                                    <option value="">Select Industry</option>
                                    <option value="Technology">Technology</option>
                                    <option value="Retail">Retail</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Healthcare">Healthcare</option>
                                    <option value="Education">Education</option>
                                    <option value="Security" ${detectedBrand?.toLowerCase().includes('vpn') || detectedBrand?.toLowerCase().includes('norton') ? 'selected' : ''}>Security/Cybersecurity</option>
                                    <option value="Entertainment">Entertainment</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div class="cav-form-group">
                                <label>Company Type:</label>
                                <select id="new-company-type" class="cav-select">
                                    <option value="client" selected>Client (Brand in Creative)</option>
                                    <option value="agency">Agency</option>
                                    <option value="vendor">Vendor</option>
                                    <option value="partner">Partner</option>
                                </select>
                                <p class="cav-hint">ℹ️ This is NOT a competitor - it's the brand featured in the creative.</p>
                            </div>
                        </div>
                        
                        <div class="cav-form-group">
                            <label>
                                <input type="checkbox" id="link-asset-checkbox" checked>
                                Link asset "${this.currentAsset.filename}" to this company
                            </label>
                        </div>
                        
                        <div class="cav-form-group">
                            <label>
                                <input type="checkbox" id="save-analysis-checkbox" checked>
                                Save analysis results with this company record
                            </label>
                        </div>
                    </div>
                    <div class="cav-modal-footer">
                        <button class="cav-btn cav-btn-secondary" id="cancel-save">Cancel</button>
                        <button class="cav-btn cav-btn-primary" id="confirm-save"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>Save to CRM</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Toggle new company fields
            const companySelect = modal.querySelector('#crm-company-select');
            const newCompanyFields = modal.querySelector('#new-company-fields');
            
            companySelect.addEventListener('change', () => {
                newCompanyFields.style.display = companySelect.value === 'new' ? 'block' : 'none';
            });
            
            // Close handlers
            modal.querySelector('.cav-modal-close').addEventListener('click', () => modal.remove());
            modal.querySelector('#cancel-save').addEventListener('click', () => modal.remove());
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.remove();
            });
            
            // Save handler
            modal.querySelector('#confirm-save').addEventListener('click', async () => {
                const selectedCompanyId = companySelect.value;
                const linkAsset = modal.querySelector('#link-asset-checkbox').checked;
                const saveAnalysis = modal.querySelector('#save-analysis-checkbox').checked;
                
                let companyId = selectedCompanyId;
                
                if (selectedCompanyId === 'new') {
                    const newName = modal.querySelector('#new-company-name').value;
                    const industry = modal.querySelector('#new-company-industry').value;
                    const type = modal.querySelector('#new-company-type').value;
                    
                    if (!newName) {
                        alert('Please enter a company name');
                        return;
                    }
                    
                    // Create new company (NOT as competitor)
                    if (window.cavCRM?.createCompany) {
                        const newCompany = window.cavCRM.createCompany({
                            name: newName,
                            industry: industry,
                            type: type, // client, agency, vendor, partner - NOT competitor
                            status: 'active',
                            isCompetitor: false // Explicitly mark as NOT a competitor
                        });
                        companyId = newCompany.id;
                        console.log(`[Analyze] Created new company: ${newName} (${companyId})`);
                    }
                }
                
                if (!companyId) {
                    alert('Please select or create a company');
                    return;
                }
                
                // Link asset to company
                if (linkAsset && window.cavCRM?.linkAssetToCompany) {
                    window.cavCRM.linkAssetToCompany(companyId, this.currentAsset.id);
                }
                
                // Save analysis with company
                if (saveAnalysis) {
                    this.currentAnalysis.linkedCompanyId = companyId;
                    this.saveAnalysisToHistory(this.currentAnalysis);
                    
                    // Also save to company record
                    if (window.cavCRM?.addAnalysisToCompany) {
                        window.cavCRM.addAnalysisToCompany(companyId, {
                            assetId: this.currentAsset.id,
                            assetFilename: this.currentAsset.filename,
                            analyzedAt: this.currentAnalysis.analyzedAt,
                            hookScore: this.currentAnalysis.hookAnalysis?.overallScore,
                            ctaScore: this.currentAnalysis.ctaAnalysis?.overallEffectiveness,
                            thumbStopScore: this.currentAnalysis.thumbStopScore?.overallScore
                        });
                    }
                }
                
                // Log activity
                if (window.cavCRM?.logActivity) {
                    window.cavCRM.logActivity('analysis_saved', {
                        assetId: this.currentAsset.id,
                        assetFilename: this.currentAsset.filename,
                        companyId: companyId,
                        detectedBrand: detectedBrand
                    });
                }
                
                modal.remove();
                alert('Analysis saved to CRM!');
            });
        }
        
        // Show full history modal
        showFullHistoryModal() {
            const history = this.analysisHistory || [];
            
            const modal = document.createElement('div');
            modal.className = 'cav-modal-overlay';
            modal.innerHTML = `
                <div class="cav-modal" style="max-width: 800px;">
                    <div class="cav-modal-header">
                        <h2><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:8px;vertical-align:middle;"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>Full Analysis History (${history.length})</h2>
                        <button class="cav-modal-close">&times;</button>
                    </div>
                    <div class="cav-modal-body" style="max-height: 60vh; overflow-y: auto;">
                        <table class="cav-history-table" style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: var(--cav-bg-secondary); text-align: left;">
                                    <th style="padding: 8px;">Asset</th>
                                    <th style="padding: 8px;">Date</th>
                                    <th style="padding: 8px;">Scores</th>
                                    <th style="padding: 8px;">Brand</th>
                                    <th style="padding: 8px;">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${history.map(a => `
                                    <tr style="border-bottom: 1px solid var(--cav-border);">
                                        <td style="padding: 8px;">${a.assetFilename || 'Unknown'}</td>
                                        <td style="padding: 8px;">${new Date(a.analyzedAt).toLocaleString()}</td>
                                        <td style="padding: 8px;">
                                            ${a.hookAnalysis?.overallScore ? `🎣 ${a.hookAnalysis.overallScore}` : ''}
                                            ${a.thumbStopScore?.overallScore ? ` 👆 ${a.thumbStopScore.overallScore}` : ''}
                                        </td>
                                        <td style="padding: 8px;">${a.detectedBrand?.brandName || '-'}</td>
                                        <td style="padding: 8px;">
                                            <button class="cav-btn cav-btn-small" data-load-analysis="${a.assetId}">Load</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            modal.querySelector('.cav-modal-close').addEventListener('click', () => modal.remove());
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.remove();
            });
            
            modal.querySelectorAll('[data-load-analysis]').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const assetId = btn.dataset.loadAnalysis;
                    const historyEntry = this.analysisHistory.find(a => a.assetId === assetId);
                    
                    if (historyEntry) {
                        this.currentAnalysis = historyEntry;
                        const assets = await this.getAllAssets();
                        const asset = assets.find(a => a.id === assetId) || {
                            id: assetId,
                            filename: historyEntry.assetFilename || 'Unknown'
                        };
                        this.currentAsset = asset;
                        modal.remove();
                        this.render(this.container, asset);
                    }
                });
            });
        }

        async showAssetPicker() {
            // Show modal to pick asset from library - check ALL storage locations
            const assets = await this.getAllAssets();
            
            const modal = document.createElement('div');
            modal.className = 'cav-modal-overlay';
            modal.innerHTML = `
                <div class="cav-modal cav-asset-picker-modal">
                    <div class="cav-modal-header">
                        <h2>Select Asset to Analyze</h2>
                        <button class="cav-modal-close">&times;</button>
                    </div>
                    <div class="cav-modal-body">
                        <div class="cav-asset-grid">
                            ${assets.length === 0 ? '<p>No assets in library. Upload an asset first.</p>' :
                              assets.slice(0, 50).map(a => {
                                const thumbSrc = a.thumbnail_url || a.thumbnail || a.dataUrl || a.video_url || '';
                                return `
                                <div class="cav-asset-option" data-asset-id="${a.id}">
                                    ${thumbSrc ? 
                                      `<img src="${thumbSrc}" alt="${a.filename}" onerror="this.parentElement.innerHTML = '<div class=\\'no-thumb\\'>📷</div>' + this.parentElement.innerHTML.split('</img>')[1]">` : 
                                      '<div class="no-thumb">📷</div>'}
                                    <span class="cav-asset-name">${a.filename}</span>
                                    <span class="cav-asset-size">${a.width || 0}×${a.height || 0}</span>
                                </div>
                              `}).join('')}
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            modal.querySelector('.cav-modal-close').addEventListener('click', () => modal.remove());
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.remove();
            });

            modal.querySelectorAll('.cav-asset-option').forEach(opt => {
                opt.addEventListener('click', () => {
                    const assetId = opt.dataset.assetId;
                    const asset = assets.find(a => a.id === assetId);
                    if (asset) {
                        this.currentAsset = asset;
                        this.currentAnalysis = null;
                        this.render(this.container, asset);
                    }
                    modal.remove();
                });
            });
        }

        // Get assets from ALL storage locations
        async getAllAssets() {
            let assets = [];
            
            // Method 1: window.cavValidatorApp
            if (window.cavValidatorApp?.state?.assets?.length > 0) {
                console.log('[Analyze] Found assets in cavValidatorApp');
                return window.cavValidatorApp.state.assets;
            }
            
            // Method 2: window.cavApp
            if (window.cavApp?.state?.assets?.length > 0) {
                console.log('[Analyze] Found assets in cavApp');
                return window.cavApp.state.assets;
            }
            
            // Method 3: IndexedDB via storage
            if (window.cavApp?.storage?.getAssets) {
                try {
                    const dbAssets = await window.cavApp.storage.getAssets();
                    if (dbAssets && dbAssets.length > 0) {
                        console.log('[Analyze] Found assets in IndexedDB');
                        return dbAssets;
                    }
                } catch (e) {
                    console.warn('[Analyze] IndexedDB access failed:', e);
                }
            }
            
            // Method 4: localStorage with various keys
            const storageKeys = [
                'cav_assets',
                `cav_assets_${this.getUserId()}`,
                `cav_team_${this.getDomain()}`
            ];
            
            for (const key of storageKeys) {
                try {
                    const stored = localStorage.getItem(key);
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            console.log(`[Analyze] Found assets in localStorage: ${key}`);
                            return parsed;
                        }
                    }
                } catch (e) {
                    // Continue to next key
                }
            }
            
            // Method 5: Try to find ANY localStorage key with 'asset' in it
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.includes('cav_') && key.includes('asset'))) {
                    try {
                        const stored = localStorage.getItem(key);
                        const parsed = JSON.parse(stored);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            console.log(`[Analyze] Found assets in localStorage: ${key}`);
                            return parsed;
                        }
                    } catch (e) {
                        // Continue
                    }
                }
            }
            
            console.warn('[Analyze] No assets found in any storage location');
            return [];
        }
        
        getUserId() {
            return window.cavApp?.userManager?.currentUser?.email?.split('@')[0] || 'user';
        }
        
        getDomain() {
            const domain = window.cavApp?.userManager?.currentUser?.email?.split('@')[1] || '';
            return domain.replace(/\./g, '_');
        }

        // ============================================
        // UTILITY METHODS
        // ============================================

        parseJSON(content) {
            if (!content) return {};
            
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
                console.warn('[Analyze] Could not parse JSON:', e);
                return { raw: content };
            }
        }

        async fileToBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }
    }

    // ============================================
    // ADVANCED CHAINED ANALYSIS (AI Intelligence Engine)
    // ============================================

    AnalyzeModule.prototype.analyzeAdvanced = async function(asset, imageBase64) {
        // Use the new AI Intelligence Engine for chained analysis
        if (!window.CAVAIEngine) {
            console.warn('[Analyze] AI Intelligence Engine not loaded, falling back to standard analysis');
            return this.analyzeComprehensive(asset, imageBase64);
        }

        console.log('[Analyze] Running Advanced Chained Analysis...');
        const startTime = Date.now();

        try {
            // Run the chained pipeline: GPT → SearchAPI → Claude
            const advancedAnalysis = await window.CAVAIEngine.analyze(asset, imageBase64);
            
            // Merge with standard analysis for backwards compatibility
            const results = {
                assetId: asset.id,
                assetFilename: asset.filename,
                assetType: advancedAnalysis.contentType,
                assetDimensions: { width: asset.width, height: asset.height },
                analyzedAt: new Date().toISOString(),
                
                // Standard analysis fields (from strategic synthesis)
                hookAnalysis: advancedAnalysis.strategicSynthesis?.hookAnalysis ? {
                    overallScore: advancedAnalysis.strategicSynthesis.hookAnalysis.score,
                    ...advancedAnalysis.strategicSynthesis.hookAnalysis
                } : null,
                ctaAnalysis: advancedAnalysis.strategicSynthesis?.ctaAudit ? {
                    overallEffectiveness: advancedAnalysis.strategicSynthesis.ctaAudit.score,
                    ...advancedAnalysis.strategicSynthesis.ctaAudit
                } : null,
                brandCompliance: advancedAnalysis.strategicSynthesis?.brandCompliance ? {
                    overallCompliance: advancedAnalysis.strategicSynthesis.brandCompliance.score,
                    ...advancedAnalysis.strategicSynthesis.brandCompliance
                } : null,
                thumbStopScore: advancedAnalysis.strategicSynthesis?.hookAnalysis ? {
                    overallScore: advancedAnalysis.strategicSynthesis.hookAnalysis.score
                } : null,
                performancePrediction: advancedAnalysis.strategicSynthesis?.performancePrediction,
                
                // New advanced fields
                visualExtraction: advancedAnalysis.visualExtraction,
                researchContext: advancedAnalysis.researchContext,
                strategicSynthesis: advancedAnalysis.strategicSynthesis,
                platformFit: advancedAnalysis.strategicSynthesis?.platformFit,
                competitiveDifferentiation: advancedAnalysis.strategicSynthesis?.competitiveDifferentiation,
                actionableRecommendations: advancedAnalysis.strategicSynthesis?.actionableRecommendations,
                accessibilityAudit: advancedAnalysis.strategicSynthesis?.accessibilityAudit,
                complianceFlags: advancedAnalysis.strategicSynthesis?.complianceFlags,
                contentTypeSpecific: advancedAnalysis.strategicSynthesis?.contentTypeSpecific,
                
                // Pipeline metadata
                pipelineSteps: advancedAnalysis.pipelineSteps,
                analysisVersion: advancedAnalysis.analysisVersion,
                promptVersion: advancedAnalysis.promptVersion,
                
                // Confidence from synthesis
                confidence: advancedAnalysis.strategicSynthesis?.analysisMetadata?.confidenceLevel > 0.7 ? 'high' : 
                           advancedAnalysis.strategicSynthesis?.analysisMetadata?.confidenceLevel > 0.4 ? 'medium' : 'low',
                processingTime: Date.now() - startTime,
                
                // Analysis mode marker
                analysisMode: 'advanced_chained',
                
                // CRM fields
                detectedBrand: advancedAnalysis.visualExtraction?.brand_signals?.brand_name ? {
                    brandName: advancedAnalysis.visualExtraction.brand_signals.brand_name,
                    logoVisible: advancedAnalysis.visualExtraction.brand_signals.logo_present
                } : null,
                linkedCompanyId: null,
                linkedProjectId: null
            };

            // Store and save
            this.currentAnalysis = results;
            this.saveCurrentAnalysis(results);
            this.saveAnalysisToHistory(results);

            console.log(`[Analyze] Advanced analysis complete in ${results.processingTime}ms`);
            return results;

        } catch (error) {
            console.error('[Analyze] Advanced analysis error:', error);
            // Fallback to standard analysis
            return this.analyzeComprehensive(asset, imageBase64);
        }
    };

    // ============================================
    // BRAND GUIDELINES & AUDIENCE PERSONA MANAGEMENT
    // ============================================

    AnalyzeModule.prototype.setBrandGuidelines = function(guidelines) {
        if (window.CAVAIEngine) {
            return window.CAVAIEngine.setBrandGuidelines(guidelines);
        }
        // Fallback: store locally
        localStorage.setItem('cav_brand_guidelines', JSON.stringify(guidelines));
        return guidelines;
    };

    AnalyzeModule.prototype.getBrandGuidelines = function() {
        if (window.CAVAIEngine) {
            return window.CAVAIEngine.getBrandGuidelines();
        }
        try {
            return JSON.parse(localStorage.getItem('cav_brand_guidelines') || 'null');
        } catch { return null; }
    };

    AnalyzeModule.prototype.setAudiencePersona = function(persona) {
        if (window.CAVAIEngine) {
            return window.CAVAIEngine.setAudiencePersona(persona);
        }
        localStorage.setItem('cav_audience_persona', JSON.stringify(persona));
        return persona;
    };

    AnalyzeModule.prototype.getAudiencePersona = function() {
        if (window.CAVAIEngine) {
            return window.CAVAIEngine.getAudiencePersona();
        }
        try {
            return JSON.parse(localStorage.getItem('cav_audience_persona') || 'null');
        } catch { return null; }
    };

    // ============================================
    // VERSION COMPARISON
    // ============================================

    AnalyzeModule.prototype.compareAnalysisVersions = function(assetId) {
        if (window.CAVAIEngine) {
            return window.CAVAIEngine.compareVersions(assetId);
        }
        
        // Fallback: compare from local history
        const versions = this.analysisHistory.filter(a => a.assetId === assetId);
        if (versions.length < 2) return null;
        
        const latest = versions[0];
        const previous = versions[1];
        const latestScore = latest.hookAnalysis?.overallScore || 0;
        const previousScore = previous.hookAnalysis?.overallScore || 0;
        
        return {
            assetId,
            scoreDelta: latestScore - previousScore,
            previousScore,
            currentScore: latestScore,
            trend: latestScore > previousScore ? 'improving' : 'declining'
        };
    };

    // ============================================
    // INITIALIZE & EXPORT
    // ============================================

    const analyzeModule = new AnalyzeModule();

    window.CAVAnalyze = {
        module: analyzeModule,
        render: (container, asset) => analyzeModule.render(container, asset),
        
        // Standard analysis
        analyzeComprehensive: (asset, imageBase64) => analyzeModule.analyzeComprehensive(asset, imageBase64),
        analyzeHook: (asset, imageBase64) => analyzeModule.analyzeHook(asset, imageBase64),
        analyzeCTA: (asset, imageBase64) => analyzeModule.analyzeCTA(asset, imageBase64),
        analyzeBrandCompliance: (asset, imageBase64, brandProfile) => analyzeModule.analyzeBrandCompliance(asset, imageBase64, brandProfile),
        analyzeThumbStop: (asset, imageBase64) => analyzeModule.analyzeThumbStop(asset, imageBase64),
        predictPerformance: (asset, results) => analyzeModule.predictPerformance(asset, results),
        
        // Advanced chained analysis
        analyzeAdvanced: (asset, imageBase64) => analyzeModule.analyzeAdvanced(asset, imageBase64),
        
        // Brand & Audience management
        setBrandGuidelines: (guidelines) => analyzeModule.setBrandGuidelines(guidelines),
        getBrandGuidelines: () => analyzeModule.getBrandGuidelines(),
        setAudiencePersona: (persona) => analyzeModule.setAudiencePersona(persona),
        getAudiencePersona: () => analyzeModule.getAudiencePersona(),
        
        // Version tracking
        compareVersions: (assetId) => analyzeModule.compareAnalysisVersions(assetId),
        
        // History access
        getHistory: () => analyzeModule.analysisHistory,
        clearHistory: () => analyzeModule.clearAnalysisHistory()
    };

    console.log(`🔬 Analyze Module loaded - Version ${ANALYZE_VERSION}`);
    console.log('   Features: Hook, CTA, Brand, Audio, Thumb-Stop, Predictions');
    console.log('   v3.0.7: Persistence, CRM linking, brand detection, history tracking');
    console.log('   v4.0: Advanced chained analysis, brand guidelines, audience personas');

})();


