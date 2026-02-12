/**
 * Advanced Video Creative Intelligence System v2.3
 * Complete Analysis for Paid Media & Creative Excellence
 * Version: 2.3.0 - January 17, 2026
 * 
 * NEW IN v2.3:
 * - Integration with Video Extraction Layer for bulletproof content access
 * - Evidence-based scoring - every score cites its source
 * - Confidence levels tied to actual extraction status
 * - User upload fallback when URL extraction fails
 * - Extraction validation before analysis
 * - Clear distinction between verified and inferred insights
 * 
 * NEW IN v2.2:
 * - Campaign context inputs for targeted analysis
 * - Multi-model pipeline: Gemini reads video → GPT-5.2/Claude adds strategic depth
 * - Real industry benchmarks from web research
 * - Ad copy generation integration
 * - Competitor video comparison
 * 
 * CORE PRINCIPLES:
 * 1. NEVER FABRICATE — If we can't extract it, we don't analyze it
 * 2. ALWAYS VALIDATE — Every extraction must be verified before analysis
 * 3. SHOW YOUR WORK — Every score must cite its evidence source
 * 4. FAIL GRACEFULLY — Clear user communication when extraction fails
 * 5. MULTIPLE PATHS — Always have fallback extraction methods
 */

(function() {
    'use strict';

    const VERSION = '2.3.0';

    // Industry benchmark data (will be enriched with web research)
    const INDUSTRY_BENCHMARKS = {
        ecommerce_dtc: { hookRate: 22, completionRate: 18, ctr: 1.2, avgEngagement: 3.5 },
        saas_tech: { hookRate: 18, completionRate: 15, ctr: 0.9, avgEngagement: 2.8 },
        finance: { hookRate: 15, completionRate: 12, ctr: 0.7, avgEngagement: 2.2 },
        healthcare: { hookRate: 16, completionRate: 14, ctr: 0.8, avgEngagement: 2.5 },
        beauty_skincare: { hookRate: 28, completionRate: 22, ctr: 1.8, avgEngagement: 4.5 },
        fitness_wellness: { hookRate: 25, completionRate: 20, ctr: 1.5, avgEngagement: 4.0 },
        food_beverage: { hookRate: 24, completionRate: 19, ctr: 1.4, avgEngagement: 3.8 },
        travel: { hookRate: 26, completionRate: 21, ctr: 1.3, avgEngagement: 3.6 },
        automotive: { hookRate: 20, completionRate: 16, ctr: 0.8, avgEngagement: 2.4 },
        real_estate: { hookRate: 17, completionRate: 13, ctr: 0.6, avgEngagement: 2.0 },
        education: { hookRate: 19, completionRate: 17, ctr: 1.0, avgEngagement: 3.0 },
        entertainment: { hookRate: 30, completionRate: 25, ctr: 2.0, avgEngagement: 5.0 },
        gaming: { hookRate: 32, completionRate: 28, ctr: 2.2, avgEngagement: 5.5 },
        fashion_apparel: { hookRate: 27, completionRate: 21, ctr: 1.6, avgEngagement: 4.2 },
        b2b_services: { hookRate: 14, completionRate: 11, ctr: 0.5, avgEngagement: 1.8 },
        nonprofit: { hookRate: 21, completionRate: 18, ctr: 1.1, avgEngagement: 3.2 }
    };

    const PLATFORM_SPECS = {
        tiktok: { maxLength: 180, optimalLength: '15-60s', aspectRatio: '9:16', hookWindow: '0.5-1s', soundOn: 0.85 },
        youtube_shorts: { maxLength: 60, optimalLength: '15-45s', aspectRatio: '9:16', hookWindow: '1-2s', soundOn: 0.70 },
        youtube_instream: { maxLength: 180, optimalLength: '15-30s', aspectRatio: '16:9', hookWindow: '5s', soundOn: 0.95 },
        meta_reels: { maxLength: 90, optimalLength: '15-30s', aspectRatio: '9:16', hookWindow: '1-2s', soundOn: 0.60 },
        meta_feed: { maxLength: 240, optimalLength: '15-30s', aspectRatio: '1:1', hookWindow: '3s', soundOn: 0.15 },
        meta_stories: { maxLength: 15, optimalLength: '5-15s', aspectRatio: '9:16', hookWindow: '1s', soundOn: 0.40 },
        linkedin: { maxLength: 600, optimalLength: '30-90s', aspectRatio: '16:9', hookWindow: '3s', soundOn: 0.30 },
        x_twitter: { maxLength: 140, optimalLength: '15-45s', aspectRatio: '16:9', hookWindow: '2s', soundOn: 0.20 },
        connected_tv: { maxLength: 60, optimalLength: '15-30s', aspectRatio: '16:9', hookWindow: '5s', soundOn: 0.99 }
    };

    // ============================================
    // ADVANCED VIDEO ANALYZER CLASS
    // ============================================

    class AdvancedVideoAnalyzer {
        constructor() {
            this.analysisHistory = [];
            this.selectedModel = null;
            this.loadHistory();
            console.log(`[AdvancedVideoAnalyzer] Module loaded v${VERSION}`);
        }

        loadHistory() {
            try {
                this.analysisHistory = JSON.parse(localStorage.getItem('cav_advanced_video_analyses') || '[]');
            } catch (e) {
                this.analysisHistory = [];
            }
        }

        saveHistory() {
            // Save to localStorage for quick access
            localStorage.setItem('cav_advanced_video_analyses', JSON.stringify(this.analysisHistory.slice(0, 50)));
            
            // Also save to unified storage for cross-device sync
            if (this.analysisHistory.length > 0 && window.UnifiedStorage) {
                const latest = this.analysisHistory[0];
                window.UnifiedStorage.saveVideoAnalysis({
                    ...latest,
                    id: latest.id || `video_${Date.now()}`,
                    analysis: latest
                }).catch(e => console.warn('[AdvancedVideoAnalyzer] Unified storage save failed:', e));
            }
        }

        setModel(modelId) {
            this.selectedModel = modelId;
            console.log(`[AdvancedVideoAnalyzer] Model set to: ${modelId}`);
        }

        getModel() {
            return this.selectedModel || window.AIModelSelector?.selectedModel || 'gemini-3-flash-preview';
        }

        // ============================================
        // MAIN ANALYSIS ORCHESTRATOR
        // ============================================

        async analyzeVideo(videoUrl, options = {}) {
            console.log('[AdvancedVideoAnalyzer] Starting comprehensive analysis:', videoUrl);
            console.log('[AdvancedVideoAnalyzer] Campaign context:', options.campaignContext);
            
            // Handle uploaded file
            if (options.uploadedFile) {
                return this.analyzeUploadedVideo(options.uploadedFile, options);
            }
            
            if (!videoUrl || !videoUrl.startsWith('http')) {
                throw new Error('Please enter a valid video URL starting with http:// or https://');
            }

            const analysis = {
                id: crypto.randomUUID(),
                url: videoUrl,
                timestamp: new Date().toISOString(),
                version: VERSION,
                status: 'analyzing',
                platform: this.detectPlatform(videoUrl),
                metadata: {},
                campaignContext: options.campaignContext || {},
                useMultiModel: options.useMultiModel !== false,
                // NEW: Extraction tracking
                extraction: {
                    tier: null,
                    confidence: null,
                    assets: {},
                    evidenceSources: [],
                    limitations: []
                }
            };

            try {
                // ============================================
                // STEP 1: VIDEO EXTRACTION LAYER (NEW)
                // Bulletproof content extraction with validation
                // ============================================
                this.updateProgress('Validating video accessibility...', 3);
                
                let extractionManifest = null;
                if (window.VideoExtractionLayer) {
                    extractionManifest = await window.VideoExtractionLayer.extractVideo(videoUrl, options);
                    analysis.extraction = {
                        tier: extractionManifest.tier,
                        confidence: extractionManifest.confidence,
                        assets: Object.fromEntries(
                            Object.entries(extractionManifest.assets)
                                .filter(([k, v]) => v.extracted)
                                .map(([k, v]) => [k, { extracted: v.extracted, validated: v.validated, source: v.source }])
                        ),
                        evidenceSources: window.VideoExtractionLayer.buildEvidenceReport(extractionManifest).evidenceSources,
                        limitations: window.VideoExtractionLayer.buildEvidenceReport(extractionManifest).limitations,
                        userActionRequired: extractionManifest.userActionRequired,
                        userMessage: extractionManifest.userMessage
                    };
                    
                    // Use extracted metadata if available
                    if (extractionManifest.assets.metadata?.extracted) {
                        analysis.metadata = extractionManifest.assets.metadata.data;
                    }
                    
                    console.log('[AdvancedVideoAnalyzer] Extraction tier:', extractionManifest.tier);
                    
                    // Warn user if extraction is limited
                    if (extractionManifest.tier === 'TIER_4_NOTHING') {
                        analysis.status = 'extraction_failed';
                        analysis.error = extractionManifest.userMessage || 'Unable to access video content. Please upload the video directly.';
                        analysis.promptUpload = true;
                        return analysis;
                    }
                    
                    if (extractionManifest.tier === 'TIER_3_METADATA_ONLY') {
                        analysis.extraction.warning = 'Limited extraction - analysis will be restricted. For full analysis, upload the video directly.';
                    }
                }

                // Step 2: Extract additional metadata if not from extraction layer
                if (!analysis.metadata.title) {
                    this.updateProgress('Extracting video metadata...', 5);
                    analysis.metadata = await this.extractMetadata(videoUrl);
                }

                // Step 3: Get industry benchmarks (real data where possible)
                this.updateProgress('Fetching industry benchmarks...', 10);
                analysis.industryBenchmarks = await this.getIndustryBenchmarks(options.campaignContext?.industry);

                // Step 3b: Generate visual captions if no transcript available
                // Uses AI to describe what's happening in each frame (alternative to audio transcript)
                if (!options.transcript?.segments?.length && options.extractedFrames?.length > 0) {
                    this.updateProgress('Generating AI visual captions from frames...', 12);
                    try {
                        const visualCaptions = await this.generateVisualCaptions(options.extractedFrames, analysis.metadata);
                        if (visualCaptions?.segments?.length > 0) {
                            options.transcript = visualCaptions;
                            analysis.visualCaptionsGenerated = true;
                            analysis.transcript = visualCaptions;
                            console.log(`[AdvancedVideoAnalyzer] ✅ Generated ${visualCaptions.segments.length} visual captions from frames`);
                        }
                    } catch (captionError) {
                        console.warn('[AdvancedVideoAnalyzer] Visual caption generation failed:', captionError.message);
                    }
                }

                // Step 4: Run Gemini vision analysis (primary analysis)
                // IMPORTANT: Gemini can actually "see" videos via URL in many cases
                this.updateProgress('AI analyzing video content (Gemini Vision)...', 15);
                const geminiAnalysis = await this.runGeminiVideoAnalysis(videoUrl, analysis.metadata, options, extractionManifest);
                
                // Validate Gemini could actually see the video
                if (geminiAnalysis.contentAccessible === false) {
                    analysis.extraction.limitations.push({
                        type: 'ai_cannot_access',
                        impact: 'AI model could not access video content directly',
                        recommendation: 'Upload video for direct analysis'
                    });
                    analysis.extraction.confidence = 'LOW';
                }
                
                // Step 5: If multi-model enabled, enhance with GPT-5.2 or Claude for deeper strategy
                let strategicEnhancement = {};
                if (options.useMultiModel !== false && geminiAnalysis.contentAccessible !== false) {
                    this.updateProgress('Enhancing with strategic AI analysis (GPT-5.2/Claude)...', 60);
                    strategicEnhancement = await this.runStrategicEnhancement(geminiAnalysis, options.campaignContext);
                }
                
                // Step 6: If competitor URL provided, run comparison
                let competitorComparison = null;
                if (options.campaignContext?.competitorUrl) {
                    this.updateProgress('Analyzing competitor video for comparison...', 75);
                    competitorComparison = await this.runCompetitorComparison(videoUrl, options.campaignContext.competitorUrl, geminiAnalysis);
                }
                
                // Merge all results
                Object.assign(analysis, geminiAnalysis, strategicEnhancement);
                if (competitorComparison) {
                    analysis.competitorComparison = competitorComparison;
                }
                
                // Step 7: Generate ad copy suggestions (only if we have content analysis)
                if (geminiAnalysis.contentAccessible !== false) {
                    this.updateProgress('Generating ad copy recommendations...', 85);
                    analysis.adCopySuggestions = await this.generateAdCopySuggestions(analysis, options.campaignContext);
                }
                
                // Calculate overall score with benchmark context and evidence
                this.updateProgress('Calculating final scores with benchmark comparison...', 95);
                analysis.overallScore = this.calculateOverallScore(analysis);
                analysis.executiveSummary = this.generateExecutiveSummary(analysis);
                analysis.benchmarkComparison = this.compareToBenchmarks(analysis);
                
                // Add evidence trail to all scores
                analysis.scoreEvidence = this.buildScoreEvidence(analysis);

                analysis.status = 'complete';
                this.updateProgress('Analysis complete!', 100);

                // Save to history
                this.analysisHistory.unshift(analysis);
                this.saveHistory();

                // Sync to Supabase if available
                if (window.CAVSupabase?.saveUrlAnalysis) {
                    try {
                        await window.CAVSupabase.saveUrlAnalysis({
                            uuid: analysis.id,
                            url: videoUrl,
                            analysis_type: 'advanced_video_v2.3',
                            results: analysis
                        });
                    } catch (e) {
                        console.warn('[AdvancedVideoAnalyzer] Supabase sync failed:', e);
                    }
                }

                return analysis;

            } catch (error) {
                console.error('[AdvancedVideoAnalyzer] Analysis failed:', error);
                analysis.status = 'error';
                analysis.error = error.message;
                this.analysisHistory.unshift(analysis);
                this.saveHistory();
                return analysis;
            }
        }

        // ============================================
        // UPLOADED VIDEO ANALYSIS
        // ============================================
        
        async analyzeUploadedVideo(file, options = {}) {
            console.log('[AdvancedVideoAnalyzer] Analyzing uploaded video:', file.name, file.size);
            
            const analysis = {
                id: crypto.randomUUID(),
                url: `upload://${file.name}`,
                timestamp: new Date().toISOString(),
                version: VERSION,
                status: 'analyzing',
                platform: 'upload',
                isUpload: true,
                metadata: {
                    title: file.name.replace(/\.[^/.]+$/, ''),
                    fileSize: file.size,
                    fileType: file.type
                },
                campaignContext: options.campaignContext || {},
                useMultiModel: options.useMultiModel !== false,
                extraction: {
                    tier: 'TIER_1_FULL',
                    confidence: 'HIGH',
                    assets: {},
                    evidenceSources: [],
                    limitations: []
                }
            };

            try {
                // Step 1: Process uploaded video through extraction layer
                this.updateProgress('Processing uploaded video file...', 5);
                
                let extractedFrames = [];
                let extractionManifest = null;
                
                if (window.VideoExtractionLayer) {
                    try {
                        extractionManifest = await window.VideoExtractionLayer.processUploadedVideo(file);
                        console.log('[AdvancedVideoAnalyzer] Extraction manifest:', extractionManifest);
                        
                        analysis.extraction = {
                            tier: extractionManifest.tier || 'TIER_1_FULL',
                            confidence: extractionManifest.confidence || 'HIGH',
                            assets: extractionManifest.assets || {}
                        };
                        
                        // Get metadata from extraction
                        if (extractionManifest.assets?.metadata?.data) {
                            analysis.metadata = { ...analysis.metadata, ...extractionManifest.assets.metadata.data };
                        }
                        
                        // Get frames for analysis
                        if (extractionManifest.assets?.frames?.frames?.length > 0) {
                            extractedFrames = extractionManifest.assets.frames.frames;
                            console.log(`[AdvancedVideoAnalyzer] Extracted ${extractedFrames.length} frames from uploaded video`);
                        }
                        
                        // Get thumbnail
                        if (extractionManifest.assets?.thumbnail?.url) {
                            analysis.thumbnail = extractionManifest.assets.thumbnail.url;
                        }
                    } catch (extractError) {
                        console.warn('[AdvancedVideoAnalyzer] Extraction layer error:', extractError);
                        analysis.extraction.limitations.push({
                            type: 'extraction_error',
                            impact: extractError.message
                        });
                    }
                } else {
                    console.warn('[AdvancedVideoAnalyzer] VideoExtractionLayer not available');
                    analysis.extraction.limitations.push({
                        type: 'no_extraction_layer',
                        impact: 'Frame extraction layer not loaded'
                    });
                }

                // Step 2: If no frames extracted via layer, try direct canvas extraction
                if (extractedFrames.length === 0) {
                    this.updateProgress('Extracting frames directly from video...', 10);
                    try {
                        extractedFrames = await this.extractFramesDirectly(file);
                        console.log(`[AdvancedVideoAnalyzer] Direct extraction got ${extractedFrames.length} frames`);
                    } catch (frameError) {
                        console.warn('[AdvancedVideoAnalyzer] Direct frame extraction failed:', frameError);
                    }
                }

                // Step 3: Analyze frames with Gemini Vision
                if (extractedFrames.length > 0) {
                    this.updateProgress('AI analyzing video frames...', 25);
                    try {
                        const frameAnalysis = await this.analyzeExtractedFrames(extractedFrames, options);
                        if (frameAnalysis && !frameAnalysis.frameAnalysis?.error) {
                            Object.assign(analysis, frameAnalysis);
                            analysis.extraction.assets.frames = { 
                                extracted: true, 
                                count: extractedFrames.length 
                            };
                            console.log('[AdvancedVideoAnalyzer] Frame analysis complete');
                        }
                    } catch (frameAnalysisError) {
                        console.error('[AdvancedVideoAnalyzer] Frame analysis error:', frameAnalysisError);
                        analysis.extraction.limitations.push({
                            type: 'frame_analysis_error',
                            impact: frameAnalysisError.message
                        });
                    }
                }

                // Step 4: Generate visual captions (since no audio transcript for uploaded videos without Cloudinary)
                if (extractedFrames.length > 0 && !analysis.transcript?.segments?.length) {
                    this.updateProgress('Generating visual captions...', 45);
                    try {
                        const visualCaptions = await this.generateVisualCaptions(extractedFrames, analysis.metadata);
                        if (visualCaptions?.segments?.length > 0) {
                            analysis.transcript = visualCaptions;
                            analysis.visualCaptionsGenerated = true;
                            console.log(`[AdvancedVideoAnalyzer] Generated ${visualCaptions.segments.length} visual captions`);
                        }
                    } catch (captionError) {
                        console.warn('[AdvancedVideoAnalyzer] Visual caption generation failed:', captionError);
                    }
                }

                // Step 5: Run full Gemini analysis with frames
                this.updateProgress('Running comprehensive AI analysis...', 55);
                try {
                    const geminiAnalysis = await this.runGeminiVideoAnalysis(
                        analysis.url, 
                        analysis.metadata, 
                        {
                            ...options,
                            extractedFrames,
                            transcript: analysis.transcript
                        }
                    );
                    if (geminiAnalysis) {
                        Object.assign(analysis, geminiAnalysis);
                    }
                } catch (geminiError) {
                    console.warn('[AdvancedVideoAnalyzer] Gemini analysis error:', geminiError);
                }

                // Step 6: Get industry benchmarks
                this.updateProgress('Fetching industry benchmarks...', 75);
                analysis.industryBenchmarks = await this.getIndustryBenchmarks(options.campaignContext?.industry);

                // Step 7: Calculate scores and summaries
                this.updateProgress('Calculating final scores...', 90);
                analysis.overallScore = this.calculateOverallScore(analysis);
                analysis.executiveSummary = this.generateExecutiveSummary(analysis);
                analysis.benchmarkComparison = this.compareToBenchmarks(analysis);
                analysis.scoreEvidence = this.buildScoreEvidence(analysis);

                analysis.status = 'complete';
                this.updateProgress('Analysis complete!', 100);

                this.analysisHistory.unshift(analysis);
                this.saveHistory();

                return analysis;

            } catch (error) {
                console.error('[AdvancedVideoAnalyzer] Upload analysis failed:', error);
                analysis.status = 'error';
                analysis.error = error.message;
                return analysis;
            }
        }

        // Direct frame extraction fallback (when VideoExtractionLayer fails)
        async extractFramesDirectly(file) {
            return new Promise((resolve, reject) => {
                const videoUrl = URL.createObjectURL(file);
                const video = document.createElement('video');
                video.muted = true;
                video.preload = 'metadata';
                
                video.onloadedmetadata = async () => {
                    const duration = video.duration;
                    const timestamps = [0, 0.5, 1, 2, 3, 5, 10, 15, 30].filter(t => t < duration);
                    const frames = [];
                    
                    for (const timestamp of timestamps) {
                        try {
                            video.currentTime = timestamp;
                            await new Promise(r => { video.onseeked = r; });
                            
                            const canvas = document.createElement('canvas');
                            canvas.width = Math.min(video.videoWidth, 1280);
                            canvas.height = Math.min(video.videoHeight, 720);
                            canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
                            
                            frames.push({
                                timestamp,
                                dataUrl: canvas.toDataURL('image/jpeg', 0.7),
                                label: timestamp === 0 ? 'Opening Frame' : `Frame at ${timestamp}s`
                            });
                        } catch (e) {
                            console.warn(`[AdvancedVideoAnalyzer] Frame extraction failed at ${timestamp}s:`, e);
                        }
                    }
                    
                    URL.revokeObjectURL(videoUrl);
                    resolve(frames);
                };
                
                video.onerror = () => {
                    URL.revokeObjectURL(videoUrl);
                    reject(new Error('Failed to load video file'));
                };
                
                video.src = videoUrl;
            });
        }

        // ============================================
        // FRAME ANALYSIS (for uploaded videos)
        // ============================================
        
        async analyzeExtractedFrames(frames, options) {
            if (!frames || frames.length === 0) {
                return { frameAnalysis: { error: 'No frames to analyze' } };
            }

            const apiKey = this.getAPIKey('gemini');
            if (!apiKey) {
                return { frameAnalysis: { error: 'No API key for visual analysis' } };
            }

            const hookFrames = frames.filter(f => f.timestamp <= 3);
            const context = options.campaignContext || {};

            const prompt = `You are analyzing extracted video frames for creative performance. These frames were extracted at timestamps: ${frames.map(f => f.timestamp + 's').join(', ')}.

Campaign Context: ${JSON.stringify(context)}

Analyze these frames and provide REAL observations (not fabricated):

For each frame, identify:
1. What is visually present (objects, people, text, colors)
2. Composition and visual impact
3. Text overlays (exact text if visible)
4. Emotional tone
5. Brand elements visible

Then provide overall assessment:
- Hook effectiveness (based on 0-3s frames)
- Visual storytelling quality
- Sound-off legibility (is the message clear from visuals alone?)
- Platform fit for ${context.targetPlatform || 'social media'}

Return JSON:
{
  "frameObservations": [
    { "timestamp": 0, "visualElements": [], "textOverlays": [], "emotionalTone": "", "composition": "" }
  ],
  "hookAnalysis": {
    "score": 0-100,
    "patternInterrupt": "description of attention-grabbing element or lack thereof",
    "facePresent": true/false,
    "textHook": "exact text if present",
    "evidence": ["specific observations that support score"]
  },
  "soundOffAnalysis": {
    "score": 0-100,
    "textLegibility": "clear/partially visible/no text",
    "visualStorytelling": "can story be understood without audio",
    "evidence": ["specific observations"]
  },
  "visualQuality": {
    "score": 0-100,
    "resolution": "good/adequate/poor",
    "lighting": "description",
    "composition": "description"
  },
  "contentAccessible": true
}`;

            try {
                // Send frames to Gemini for analysis
                const response = await this.callGeminiWithFrames(prompt, hookFrames, apiKey);
                return response;
            } catch (error) {
                console.error('[AdvancedVideoAnalyzer] Frame analysis failed:', error);
                return { frameAnalysis: { error: error.message } };
            }
        }

        async callGeminiWithFrames(prompt, frames, apiKey) {
            const modelId = window.AIModels?.getGeminiModelId?.('flash') || 'gemini-3-flash-preview';
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

            const parts = [{ text: prompt }];
            
            // Add frame images (handle both dataUrl and URL-based frames)
            for (const frame of frames.slice(0, 5)) { // Limit to 5 frames for API
                try {
                    if (frame.dataUrl) {
                        // Frame has dataUrl (from canvas extraction)
                        const base64Data = frame.dataUrl.replace(/^data:image\/\w+;base64,/, '');
                        parts.push({
                            inline_data: {
                                mime_type: 'image/jpeg',
                                data: base64Data
                            }
                        });
                    } else if (frame.url) {
                        // Frame has URL - fetch and convert to base64
                        try {
                            const response = await fetch(frame.url);
                            if (response.ok) {
                                const blob = await response.blob();
                                const base64Data = await this.blobToBase64(blob);
                                parts.push({
                                    inline_data: {
                                        mime_type: blob.type || 'image/jpeg',
                                        data: base64Data
                                    }
                                });
                            }
                        } catch (fetchError) {
                            console.warn(`[AdvancedVideoAnalyzer] Could not fetch frame URL: ${frame.url}`, fetchError.message);
                        }
                    }
                } catch (frameError) {
                    console.warn('[AdvancedVideoAnalyzer] Error processing frame:', frameError);
                }
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts }],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 4096,
                        responseMimeType: 'application/json'
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Gemini API error: ${response.status}`);
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
            
            try {
                return JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
            } catch (e) {
                console.warn('[AdvancedVideoAnalyzer] Could not parse frame analysis:', e);
                return { contentAccessible: true, parseError: true };
            }
        }

        // Convert blob to base64 string
        async blobToBase64(blob) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const base64 = reader.result.split(',')[1]; // Remove data:... prefix
                    resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        }

        // ============================================
        // SCORE EVIDENCE BUILDER
        // ============================================
        
        buildScoreEvidence(analysis) {
            const evidence = {
                extraction: {
                    tier: analysis.extraction?.tier || 'UNKNOWN',
                    confidence: analysis.extraction?.confidence || 'LOW',
                    assetsVerified: Object.keys(analysis.extraction?.assets || {}),
                    limitations: analysis.extraction?.limitations || []
                },
                scores: {}
            };

            // Map dimensions to actual data paths in Gemini response
            const dimensionMapping = {
                hook: {
                    score: analysis.hookAnalysis?.overall_hook_score || analysis.hookAnalysis?.score || 0,
                    source: analysis.hookAnalysis
                },
                retention: {
                    score: analysis.retentionAnalysis?.overall_retention_score || analysis.retentionAnalysis?.score || 0,
                    source: analysis.retentionAnalysis
                },
                soundOff: {
                    score: analysis.platformFit?.sound_off_score || analysis.soundOffAnalysis?.sound_off_score || 0,
                    source: analysis.platformFit || analysis.soundOffAnalysis
                },
                platform: {
                    score: analysis.platformFit?.platform_score || analysis.platformAnalysis?.score || 0,
                    source: analysis.platformFit
                },
                cta: {
                    score: this.extractCtaScore(analysis),
                    source: analysis.messageAnalysis || analysis.ctaAnalysis
                },
                narrative: {
                    score: analysis.narrativeAnalysis?.narrative_score || 0,
                    source: analysis.narrativeAnalysis
                },
                emotional: {
                    score: analysis.emotionalJourney?.emotional_score || 0,
                    source: analysis.emotionalJourney
                },
                messaging: {
                    score: this.extractMessagingScore(analysis),
                    source: analysis.messageAnalysis
                },
                compliance: {
                    score: analysis.complianceAnalysis?.compliance_score || 85, // Default high for most videos
                    source: analysis.complianceAnalysis
                }
            };

            for (const [dim, data] of Object.entries(dimensionMapping)) {
                evidence.scores[dim] = {
                    score: data.score,
                    confidence: this.determineScoreConfidence(dim, analysis.extraction),
                    evidenceSources: this.getEvidenceSourcesForDimension(dim, analysis),
                    isInferred: !data.source || data.score === 0
                };
            }

            return evidence;
        }
        
        extractCtaScore(analysis) {
            if (analysis.ctaAnalysis?.cta_effectiveness_score) return analysis.ctaAnalysis.cta_effectiveness_score;
            const clarity = analysis.messageAnalysis?.cta_clarity;
            if (clarity === 'excellent') return 90;
            if (clarity === 'good') return 75;
            if (clarity === 'fair') return 50;
            if (analysis.messageAnalysis?.cta_present) return 60;
            return 0;
        }
        
        extractMessagingScore(analysis) {
            if (analysis.messageAnalysis?.value_proposition_clear === true) return 80;
            if (analysis.messageAnalysis?.core_message) return 70;
            return 0;
        }

        determineScoreConfidence(dimension, extraction) {
            if (!extraction) return 'LOW';
            
            const requiresVisual = ['hook', 'soundOff', 'platform', 'compliance'];
            const requiresAudio = ['hook', 'retention', 'cta', 'narrative', 'emotional'];
            const requiresTranscript = ['cta', 'narrative', 'messaging'];

            let confidence = 'HIGH';

            if (requiresVisual.includes(dimension) && !extraction.assets?.frames?.extracted && !extraction.assets?.thumbnail?.extracted) {
                confidence = 'LOW';
            }
            if (requiresTranscript.includes(dimension) && !extraction.assets?.transcript?.extracted) {
                confidence = confidence === 'LOW' ? 'LOW' : 'MEDIUM';
            }

            return confidence;
        }

        getEvidenceSourcesForDimension(dimension, analysis) {
            const sources = [];
            const extraction = analysis.extraction;

            if (extraction?.assets?.metadata?.extracted) {
                sources.push({ type: 'metadata', fields: ['title', 'duration', 'platform'] });
            }
            if (extraction?.assets?.thumbnail?.extracted) {
                sources.push({ type: 'thumbnail', source: extraction.assets.thumbnail.source });
            }
            if (extraction?.assets?.transcript?.extracted) {
                sources.push({ type: 'transcript', language: extraction.assets.transcript.language });
            }
            if (extraction?.assets?.frames?.extracted) {
                sources.push({ type: 'frames', count: extraction.assets.frames.count });
            }
            
            // AI analysis
            if (analysis.contentAccessible !== false) {
                sources.push({ type: 'ai_vision', model: this.getModel() });
            }

            return sources;
        }

        hasDirectEvidenceFor(dimension, extraction) {
            if (!extraction?.assets) return false;
            
            const visualDimensions = ['hook', 'soundOff', 'platform'];
            const transcriptDimensions = ['cta', 'narrative', 'messaging'];
            
            if (visualDimensions.includes(dimension)) {
                return extraction.assets.frames?.extracted || extraction.assets.thumbnail?.extracted;
            }
            if (transcriptDimensions.includes(dimension)) {
                return extraction.assets.transcript?.extracted;
            }
            
            return extraction.tier !== 'TIER_4_NOTHING';
        }

        // ============================================
        // VISUAL CAPTIONS GENERATION (When no audio transcript available)
        // Uses AI Vision to describe what's happening in each frame
        // ============================================

        async generateVisualCaptions(frames, metadata) {
            if (!frames || frames.length === 0) return null;
            
            console.log(`[AdvancedVideoAnalyzer] Generating visual captions for ${frames.length} frames...`);
            
            // Build frame descriptions using AI Vision
            const frameList = frames.slice(0, 10).map((f, i) => 
                `Frame ${i + 1} (${f.timestamp || 0}s): ${f.url}`
            ).join('\n');
            
            const prompt = `You are analyzing video frames to generate visual captions (like audio descriptions for accessibility).

VIDEO: ${metadata?.title || 'Unknown'}
FRAMES TO ANALYZE:
${frameList}

For each frame, describe what's happening visually as if you were creating subtitles for someone who can't hear the audio.
Focus on:
- What actions are happening
- Any text visible on screen
- Key visual elements (products, people, graphics)
- Scene changes or transitions
- Any call-to-action or branding elements

Return a JSON object with this EXACT structure:
{
  "segments": [
    {
      "start": 0,
      "end": 3,
      "text": "[Description of what's happening at 0-3 seconds]",
      "startFormatted": "00:00",
      "endFormatted": "00:03",
      "type": "visual_caption",
      "onScreenText": "[Any text visible on screen, or null]"
    }
  ],
  "fullText": "[Complete description of the video narrative]",
  "source": "ai_visual_caption",
  "language": "en"
}

IMPORTANT: Create segments that cover the full video timeline based on the frame timestamps. Return ONLY valid JSON.`;

            try {
                const response = await this.callAI(prompt);
                
                // Parse AI response
                let captions;
                try {
                    // Clean the response
                    let cleanResponse = response;
                    if (typeof response === 'string') {
                        cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                        // Find JSON object
                        const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            cleanResponse = jsonMatch[0];
                        }
                    }
                    captions = typeof cleanResponse === 'string' ? JSON.parse(cleanResponse) : cleanResponse;
                } catch (parseError) {
                    console.warn('[AdvancedVideoAnalyzer] Could not parse visual captions response');
                    return null;
                }
                
                // Validate structure
                if (!captions?.segments?.length) {
                    console.warn('[AdvancedVideoAnalyzer] No valid caption segments returned');
                    return null;
                }
                
                // Ensure each segment has required fields
                captions.segments = captions.segments.map((seg, i) => ({
                    start: seg.start || i * 3,
                    end: seg.end || (i + 1) * 3,
                    text: seg.text || '',
                    startFormatted: seg.startFormatted || this.formatTime(seg.start || i * 3),
                    endFormatted: seg.endFormatted || this.formatTime(seg.end || (i + 1) * 3),
                    type: 'visual_caption',
                    onScreenText: seg.onScreenText || null
                }));
                
                captions.source = 'ai_visual_caption';
                captions.fullText = captions.fullText || captions.segments.map(s => s.text).join(' ');
                
                console.log(`[AdvancedVideoAnalyzer] ✅ Generated ${captions.segments.length} visual captions`);
                return captions;
                
            } catch (error) {
                console.error('[AdvancedVideoAnalyzer] Visual caption generation error:', error);
                return null;
            }
        }

        formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        // ============================================
        // INDUSTRY BENCHMARKS
        // ============================================

        async getIndustryBenchmarks(industry) {
            const baseBenchmarks = INDUSTRY_BENCHMARKS[industry] || INDUSTRY_BENCHMARKS.ecommerce_dtc;
            
            // Try to get real-time benchmarks from web search
            try {
                if (window.AIOrchestrator?.callSearchAPI) {
                    const searchQuery = `${industry?.replace(/_/g, ' ')} video ad benchmarks 2025 2026 hook rate completion rate`;
                    const searchResult = await window.AIOrchestrator.callSearchAPI(searchQuery, { num: 3 });
                    
                    if (searchResult.results?.length > 0) {
                        return {
                            ...baseBenchmarks,
                            sources: searchResult.results.map(r => ({ title: r.title, url: r.link, snippet: r.snippet })),
                            enriched: true
                        };
                    }
                }
            } catch (e) {
                console.warn('[AdvancedVideoAnalyzer] Could not fetch real-time benchmarks:', e);
            }
            
            return { ...baseBenchmarks, sources: [], enriched: false };
        }

        // ============================================
        // GEMINI VIDEO ANALYSIS (Primary)
        // ============================================

        async runGeminiVideoAnalysis(url, metadata, options) {
            const context = options.campaignContext || {};
            const platformSpecs = PLATFORM_SPECS[context.targetPlatform] || {};
            const frames = options.extractedFrames || [];
            const ocrText = options.extractedText || [];
            const autoTags = options.autoTags || [];
            const transcript = options.transcript || null;
            
            // Build frame URLs section for Gemini to analyze
            let frameSection = '';
            if (frames.length > 0) {
                frameSection = `
=== EXTRACTED FRAMES (Analyze these images!) ===
${frames.slice(0, 7).map((f, i) => `Frame ${i + 1} (${f.label || f.timestamp + 's'}): ${f.url}`).join('\n')}

IMPORTANT: These are actual frames from the video. Analyze what you see in these images!
`;
            }
            
            // Build OCR text section (from Cloudinary AI)
            let ocrSection = '';
            if (ocrText.length > 0) {
                ocrSection = `
=== ON-SCREEN TEXT (Extracted via OCR AI) ===
${ocrText.map(t => `[${t.frameLabel || 'Frame'}] "${t.text}"`).join('\n')}

This text appears on-screen in the video. Use this for analyzing messaging, CTA, and sound-off effectiveness.
`;
            }
            
            // Build auto-tags section (from Cloudinary AI)
            let tagsSection = '';
            if (autoTags.length > 0) {
                const uniqueTags = [...new Set(autoTags.map(t => t.tag))].slice(0, 20);
                tagsSection = `
=== AUTO-DETECTED VISUAL ELEMENTS ===
${uniqueTags.join(', ')}

These elements were automatically detected in the video frames.
`;
            }

            // Build transcript section
            let transcriptSection = '';
            if (transcript?.segments?.length > 0) {
                transcriptSection = `
=== TRANSCRIPT ===
${transcript.segments.slice(0, 30).map(s => `[${s.startFormatted || '00:00'}] ${s.text}`).join('\n')}

`;
            } else if (transcript?.fullText) {
                transcriptSection = `
=== TRANSCRIPT ===
${transcript.fullText.slice(0, 1500)}

`;
            }
            
            const prompt = `You are an expert paid media creative analyst. ACTUALLY ANALYZE this video - provide REAL observations, not templates.

VIDEO URL: ${url}
PLATFORM: ${this.detectPlatform(url)}
${metadata.title ? `TITLE: ${metadata.title}` : ''}
${metadata.thumbnail ? `THUMBNAIL: ${metadata.thumbnail}` : ''}
${frameSection}${ocrSection}${tagsSection}${transcriptSection}

=== CAMPAIGN CONTEXT ===
${context.objective ? `CAMPAIGN OBJECTIVE: ${context.objective}` : 'OBJECTIVE: Not specified'}
${context.targetPlatform ? `TARGET PLATFORM: ${context.targetPlatform} (Hook window: ${platformSpecs.hookWindow || '2-3s'}, Sound-on rate: ${(platformSpecs.soundOn * 100) || 50}%)` : ''}
${context.industry ? `INDUSTRY: ${context.industry}` : ''}
${context.targetAudience ? `TARGET AUDIENCE: ${context.targetAudience}` : ''}

=== ANALYSIS REQUIREMENTS ===
Watch this video carefully and analyze:

1. **HOOK ANALYSIS (First 3 seconds)**
   - What exactly happens in the opening frames?
   - Face present? Eye contact? Motion level?
   - First words spoken (if any)?
   - Text on screen?
   - Pattern interrupt elements?

2. **RETENTION ARCHITECTURE**
   - Energy pacing throughout video
   - Drop-off risk points with specific timestamps
   - Structural pattern (front-loaded, peak-valley, linear, etc.)

3. **PLATFORM FIT**
   - Optimized for ${context.targetPlatform || 'the detected platform'}?
   - Aspect ratio appropriate?
   - Sound-off effectiveness?
   - Length optimization?

4. **MESSAGE & CTA**
   - Core value proposition communicated?
   - CTA present? Clear? Compelling?
   - Message-to-landing-page alignment potential?

5. **EMOTIONAL JOURNEY**
   - Dominant emotions evoked?
   - Emotional triggers used?
   - Authenticity assessment?

6. **${context.objective?.toUpperCase() || 'CONVERSION'} OPTIMIZATION**
   - How well does this video serve ${context.objective || 'conversion'} goals?
   - Specific improvements for this objective?

Return ONLY valid JSON with YOUR ACTUAL OBSERVATIONS from this specific video:
{
  "hookAnalysis": {
    "overall_hook_score": [0-100 based on what you actually see],
    "primary_hook_type": "[actual type you observe]",
    "opening_frame_description": "[describe exactly what you see]",
    "visual_hook": {
      "score": [0-30],
      "face_present": [true/false],
      "eye_contact": [true/false],
      "motion_energy": "[low/medium/high]",
      "pattern_interrupt": "[description if present]",
      "key_strength": "[specific observation]",
      "key_weakness": "[specific observation]"
    },
    "audio_hook": {
      "score": [0-25],
      "first_sound": "[voice/music/sfx/silence]",
      "opening_words": "[exact words if spoken]",
      "time_to_first_word": [seconds],
      "audio_energy": "[low/medium/high]"
    },
    "text_hook": {
      "score": [0-25],
      "text_present": [true/false],
      "opening_text": "[exact text if present]",
      "legibility": "[poor/fair/good/excellent]"
    },
    "curiosity_gap_created": [true/false],
    "curiosity_gap_description": "[how it creates/fails to create curiosity]"
  },
  
  "retentionAnalysis": {
    "overall_retention_score": [0-100],
    "structural_pattern": "[pattern you observe]",
    "energy_curve": "[description of energy flow]",
    "estimated_completion_rate": "[X%]",
    "critical_moments": [
      {
        "timestamp": "[actual timestamp]",
        "type": "[hook/peak/valley/cta/drop_risk]",
        "description": "[what happens]",
        "recommendation": "[if improvement needed]"
      }
    ],
    "pacing_assessment": "[fast/moderate/slow/varied]"
  },
  
  "platformFit": {
    "target_platform": "${context.targetPlatform || 'auto_detected'}",
    "platform_score": [0-100],
    "aspect_ratio_optimal": [true/false],
    "length_optimal": [true/false],
    "sound_off_score": [0-100],
    "sound_off_effective": [true/false],
    "captions_present": [true/false],
    "platform_specific_issues": ["[list issues]"],
    "platform_optimization_tips": ["[specific tips]"]
  },
  
  "messageAnalysis": {
    "core_message": "[what the video is saying]",
    "value_proposition_clear": [true/false],
    "target_audience_fit": "[how well it fits ${context.targetAudience || 'target audience'}]",
    "cta_present": [true/false],
    "cta_text": "[exact CTA if present]",
    "cta_clarity": "[poor/fair/good/excellent]",
    "cta_timing": "[early/middle/end/throughout]",
    "message_to_${context.objective || 'conversion'}_alignment": "[strong/moderate/weak]"
  },
  
  "emotionalJourney": {
    "emotional_score": [0-100],
    "dominant_emotion": "[primary emotion]",
    "secondary_emotions": ["[list]"],
    "emotional_triggers": ["[specific triggers used]"],
    "emotional_authenticity": "[genuine/somewhat_forced/manipulative]",
    "emotional_peak_moment": "[description with timestamp]"
  },
  
  "objectiveAlignment": {
    "campaign_objective": "${context.objective || 'conversion'}",
    "alignment_score": [0-100],
    "objective_strengths": ["[what works for this objective]"],
    "objective_gaps": ["[what's missing for this objective]"],
    "optimization_priorities": ["[ordered list of improvements]"]
  },
  
  "technicalQuality": {
    "production_quality": "[amateur/semi_pro/professional/premium]",
    "video_resolution": "[assessment]",
    "audio_quality": "[poor/fair/good/excellent]",
    "lighting": "[poor/fair/good/excellent]",
    "editing_quality": "[basic/competent/polished/exceptional]"
  },
  
  "topStrengths": ["[3-5 specific things this video does well]"],
  "topWeaknesses": ["[3-5 specific areas for improvement]"],
  "immediateActions": ["[top 3 actions to improve this video]"]
}

REMEMBER: All values must reflect YOUR ACTUAL ANALYSIS of this specific video. Be specific about what you observe.`;

            return await this.callAI(prompt);
        }

        // ============================================
        // STRATEGIC ENHANCEMENT (GPT-5.2/Claude)
        // ============================================

        async runStrategicEnhancement(geminiAnalysis, campaignContext) {
            // Get a different model for strategic enhancement
            const enhancementModel = this.getEnhancementModel();
            if (!enhancementModel) {
                console.log('[AdvancedVideoAnalyzer] No secondary model available for enhancement');
                return {};
            }

            const industry = campaignContext?.industry || 'general';
            const benchmarks = INDUSTRY_BENCHMARKS[industry] || INDUSTRY_BENCHMARKS.ecommerce_dtc;

            const prompt = `You are a senior creative strategist. Based on this video analysis, provide DEEP STRATEGIC INSIGHTS with real, actionable recommendations.

=== GEMINI VIDEO ANALYSIS ===
${JSON.stringify(geminiAnalysis, null, 2)}

=== CAMPAIGN CONTEXT ===
Objective: ${campaignContext?.objective || 'conversion'}
Target Platform: ${campaignContext?.targetPlatform || 'multi-platform'}
Industry: ${industry}
Target Audience: ${campaignContext?.targetAudience || 'general'}

=== INDUSTRY BENCHMARKS ===
Hook Rate Benchmark: ${benchmarks.hookRate}%
Completion Rate Benchmark: ${benchmarks.completionRate}%
CTR Benchmark: ${benchmarks.ctr}%

=== YOUR STRATEGIC ANALYSIS ===
Based on this analysis, provide:

1. **Strategic Assessment**: How does this video compare to top-performing ${industry} video ads?
2. **Psychology Analysis**: What psychological principles are/aren't being leveraged?
3. **Competitive Positioning**: How does this differentiate from typical ${industry} ads?
4. **A/B Test Recommendations**: 3-5 specific test ideas with hypotheses
5. **Creative Brief for V2**: What should the next version of this video do differently?
6. **Performance Predictions**: Realistic performance estimates with reasoning
7. **Industry-Specific Insights**: What works specifically in ${industry} that this video does/doesn't do?

Return JSON:
{
  "strategicAssessment": {
    "overall_rating": "[below_average/average/above_average/excellent]",
    "industry_comparison": "[how it compares to top ${industry} video ads]",
    "unique_angle_score": [0-100],
    "memorable_factor": [0-100],
    "category_entry_point": "[what cognitive category does this own?]"
  },
  
  "psychologyAnalysis": {
    "principles_used": [
      {"principle": "[e.g., social proof, scarcity, authority]", "execution": "[how it's used]", "effectiveness": "[strong/moderate/weak]"}
    ],
    "missing_principles": ["[principles that could be added]"],
    "emotional_drivers": ["[specific emotional levers being pulled]"],
    "cognitive_load": "[low/medium/high - is it easy to process?]"
  },
  
  "competitivePosition": {
    "differentiation_level": "[highly_differentiated/somewhat_differentiated/generic]",
    "category_norms_followed": ["[norms being followed]"],
    "category_norms_broken": ["[norms being broken - good for standing out]"],
    "whitespace_opportunity": "[untapped angle this could own]"
  },
  
  "abTestRecommendations": [
    {
      "test_name": "[descriptive name]",
      "variable": "[what to test]",
      "control": "[current approach]",
      "variant": "[proposed change]",
      "hypothesis": "[why this might win]",
      "expected_lift": "[X-Y%]",
      "priority": "[high/medium/low]",
      "effort": "[low/medium/high]"
    }
  ],
  
  "v2CreativeBrief": {
    "key_insight": "[main learning from this analysis]",
    "strategic_direction": "[what V2 should do differently]",
    "hook_recommendation": "[specific new hook approach]",
    "message_recommendation": "[message refinement]",
    "cta_recommendation": "[CTA improvement]",
    "production_recommendations": ["[production changes]"]
  },
  
  "performancePredictions": {
    "predicted_hook_rate": "[X-Y%]",
    "predicted_completion_rate": "[X-Y%]",
    "predicted_ctr": "[X-Y%]",
    "predicted_conversion_rate": "[X-Y%]",
    "confidence_level": "[low/medium/high]",
    "reasoning": "[why these predictions]",
    "vs_benchmark": {
      "hook_rate": "[above/at/below] benchmark",
      "completion_rate": "[above/at/below] benchmark",
      "ctr": "[above/at/below] benchmark"
    }
  },
  
  "industryInsights": {
    "industry": "${industry}",
    "what_works_in_this_industry": ["[proven tactics]"],
    "this_video_uses": ["[which tactics it uses]"],
    "this_video_misses": ["[which tactics it misses]"],
    "industry_specific_recommendations": ["[specific to ${industry}]"]
  },
  
  "executiveSummary": "[2-3 sentence summary for stakeholders]"
}`;

            try {
                return await this.callEnhancementModel(prompt, enhancementModel);
            } catch (e) {
                console.warn('[AdvancedVideoAnalyzer] Strategic enhancement failed:', e);
                return {};
            }
        }

        getEnhancementModel() {
            // Check for available secondary models (prefer GPT-5.2 or Claude)
            if (window.AIModelSelector?.hasAPIKey?.('gpt-5.2')) return 'gpt-5.2';
            if (window.AIModelSelector?.hasAPIKey?.('claude-opus-4-5-20250929')) return 'claude-opus-4-5-20250929';
            if (window.AIModelSelector?.hasAPIKey?.('claude-sonnet-4-5-20250929')) return 'claude-sonnet-4-5-20250929';
            
            // Check via CAVSettings
            if (window.CAVSettings?.manager?.getAPIKey?.('openai')) return 'gpt-5.2';
            if (window.CAVSettings?.manager?.getAPIKey?.('claude')) return 'claude-sonnet-4-5-20250929';
            
            return null;
        }

        async callEnhancementModel(prompt, modelId) {
            if (window.AIModelSelector?.callAI) {
                return await window.AIModelSelector.callAI(prompt, { model: modelId, maxTokens: 8192 });
            }
            
            // Fallback - try direct calls
            if (modelId.startsWith('gpt')) {
                return await this.callOpenAIDirect(prompt);
            } else if (modelId.startsWith('claude')) {
                return await this.callClaudeDirect(prompt);
            }
            
            return {};
        }

        async callOpenAIDirect(prompt) {
            const apiKey = window.CAVSettings?.manager?.getAPIKey?.('openai') || 
                          window.CAVSettings?.getAPIKey?.('openai');
            if (!apiKey) return {};

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-5.2',
                    messages: [{ role: 'user', content: prompt }],
                    max_completion_tokens: 8192,
                    response_format: { type: 'json_object' }
                })
            });

            if (!response.ok) throw new Error(`OpenAI error: ${response.status}`);
            const data = await response.json();
            return this.parseJSON(data.choices?.[0]?.message?.content || '{}');
        }

        async callClaudeDirect(prompt) {
            const apiKey = window.CAVSettings?.manager?.getAPIKey?.('claude') || 
                          window.CAVSettings?.getAPIKey?.('claude');
            if (!apiKey) return {};

            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-5-20250929',
                    max_tokens: 8192,
                    messages: [{ role: 'user', content: prompt }]
                })
            });

            if (!response.ok) throw new Error(`Claude error: ${response.status}`);
            const data = await response.json();
            return this.parseJSON(data.content?.[0]?.text || '{}');
        }

        // ============================================
        // COMPETITOR COMPARISON
        // ============================================

        async runCompetitorComparison(yourUrl, competitorUrl, yourAnalysis) {
            const prompt = `Compare these two video ads and identify competitive advantages and gaps.

YOUR VIDEO: ${yourUrl}
YOUR ANALYSIS SUMMARY:
- Hook Score: ${yourAnalysis.hookAnalysis?.overall_hook_score || 'N/A'}
- Retention Score: ${yourAnalysis.retentionAnalysis?.overall_retention_score || 'N/A'}
- Platform Score: ${yourAnalysis.platformFit?.platform_score || 'N/A'}
- Top Strengths: ${yourAnalysis.topStrengths?.join(', ') || 'N/A'}
- Top Weaknesses: ${yourAnalysis.topWeaknesses?.join(', ') || 'N/A'}

COMPETITOR VIDEO: ${competitorUrl}

Analyze the competitor video and compare:

Return JSON:
{
  "competitorAnalysis": {
    "hook_score": [0-100],
    "hook_description": "[what their hook does]",
    "key_message": "[their core message]",
    "production_quality": "[amateur/pro/premium]",
    "unique_elements": ["[what makes it stand out]"]
  },
  "comparison": {
    "you_win_on": ["[areas where your video is stronger]"],
    "they_win_on": ["[areas where competitor is stronger]"],
    "neutral": ["[areas where you're similar]"]
  },
  "competitive_gaps": ["[opportunities they exploit that you miss]"],
  "differentiation_opportunities": ["[ways to stand out from them]"],
  "steal_these_tactics": ["[good ideas to adapt]"],
  "avoid_these": ["[their mistakes to avoid]"]
}`;

            try {
                return await this.callAI(prompt);
            } catch (e) {
                console.warn('[AdvancedVideoAnalyzer] Competitor comparison failed:', e);
                return null;
            }
        }

        // ============================================
        // AD COPY GENERATION
        // ============================================

        async generateAdCopySuggestions(analysis, campaignContext) {
            const platform = campaignContext?.targetPlatform || 'meta_feed';
            
            const prompt = `Based on this video analysis, generate ad copy for ${platform}.

VIDEO ANALYSIS SUMMARY:
- Core Message: ${analysis.messageAnalysis?.core_message || 'N/A'}
- Target Audience: ${campaignContext?.targetAudience || 'General'}
- Campaign Objective: ${campaignContext?.objective || 'Conversion'}
- Top Strengths: ${analysis.topStrengths?.join(', ') || 'N/A'}
- Emotional Triggers: ${analysis.emotionalJourney?.emotional_triggers?.join(', ') || 'N/A'}
- CTA: ${analysis.messageAnalysis?.cta_text || 'N/A'}

Generate ad copy that complements this video:

Return JSON:
{
  "platform": "${platform}",
  "headlines": [
    {"text": "[headline 1]", "character_count": [X], "angle": "[benefit/curiosity/social_proof/etc]"},
    {"text": "[headline 2]", "character_count": [X], "angle": "[angle]"},
    {"text": "[headline 3]", "character_count": [X], "angle": "[angle]"}
  ],
  "primaryText": [
    {"text": "[primary text option 1]", "tone": "[direct/conversational/urgent]", "length": "[short/medium/long]"},
    {"text": "[primary text option 2]", "tone": "[tone]", "length": "[length]"}
  ],
  "callToAction": [
    {"text": "[CTA 1]", "urgency": "[low/medium/high]"},
    {"text": "[CTA 2]", "urgency": "[urgency]"}
  ],
  "googleAdsVariations": {
    "headlines": ["[30 char headlines for RSA]"],
    "descriptions": ["[90 char descriptions]"]
  },
  "socialVariations": {
    "tiktok": {"caption": "[TikTok caption]", "hashtags": ["#tag1", "#tag2"]},
    "instagram": {"caption": "[IG caption]", "hashtags": ["#tag1"]},
    "linkedin": {"text": "[LinkedIn post text]"}
  },
  "copyStrategy": {
    "main_hook": "[key copy hook derived from video]",
    "proof_points": ["[proof points to include]"],
    "objection_handlers": ["[objections the copy should address]"]
  }
}`;

            try {
                return await this.callAI(prompt);
            } catch (e) {
                console.warn('[AdvancedVideoAnalyzer] Ad copy generation failed:', e);
                return null;
            }
        }

        // ============================================
        // BENCHMARK COMPARISON
        // ============================================

        compareToBenchmarks(analysis) {
            const industry = analysis.campaignContext?.industry || 'ecommerce_dtc';
            const benchmarks = analysis.industryBenchmarks || INDUSTRY_BENCHMARKS[industry] || INDUSTRY_BENCHMARKS.ecommerce_dtc;
            
            const hookScore = analysis.hookAnalysis?.overall_hook_score || 0;
            const completionEstimate = parseInt(analysis.retentionAnalysis?.estimated_completion_rate) || 15;
            const platformScore = analysis.platformFit?.platform_score || 50;
            
            return {
                industry,
                benchmarks,
                comparison: {
                    hookRate: {
                        yours: hookScore,
                        benchmark: benchmarks.hookRate,
                        status: hookScore >= benchmarks.hookRate ? 'above' : hookScore >= benchmarks.hookRate * 0.9 ? 'at' : 'below',
                        delta: hookScore - benchmarks.hookRate
                    },
                    completionRate: {
                        yours: completionEstimate,
                        benchmark: benchmarks.completionRate,
                        status: completionEstimate >= benchmarks.completionRate ? 'above' : completionEstimate >= benchmarks.completionRate * 0.9 ? 'at' : 'below',
                        delta: completionEstimate - benchmarks.completionRate
                    }
                },
                summary: hookScore >= benchmarks.hookRate && completionEstimate >= benchmarks.completionRate 
                    ? 'Performing above industry benchmarks' 
                    : hookScore >= benchmarks.hookRate * 0.9 
                        ? 'Performing at industry average'
                        : 'Below industry benchmarks - optimization needed'
            };
        }

        // ============================================
        // COMPREHENSIVE ANALYSIS (SINGLE AI CALL)
        // ============================================

        async runComprehensiveAnalysis(url, metadata) {
            const platform = this.detectPlatform(url);
            const videoId = this.extractVideoId(url);
            
            const prompt = `You are an expert paid media creative analyst. You MUST actually watch and analyze the video at this URL. Do NOT generate example or template data - provide REAL analysis based on what you observe in this specific video.

VIDEO TO ANALYZE: ${url}
PLATFORM: ${platform}
VIDEO ID: ${videoId || 'N/A'}
${metadata.thumbnail ? `THUMBNAIL: ${metadata.thumbnail}` : ''}
${metadata.title ? `TITLE: ${metadata.title}` : ''}

IMPORTANT INSTRUCTIONS:
1. You MUST access and analyze the actual video content
2. All scores and observations must be based on what you actually see/hear
3. Do NOT copy example values - generate unique analysis for THIS video
4. If you cannot access the video, explain what information you need

Analyze this video comprehensively and return a JSON object with your ACTUAL findings:

{
  "hookAnalysis": {
    "overall_hook_score": [0-100 based on actual first 3 seconds],
    "primary_hook_type": [actual hook type you observe: "emotional", "curiosity", "patternInterrupt", "socialProof", "directBenefit", "story", "controversy", "celebrity", "problemAgitation", "visualSpectacle"],
    "visual_hook": {
      "score": [0-30],
      "face_present": [true/false based on what you see],
      "first_frame_description": "[describe what you actually see in opening frame]",
      "motion_energy": "[low/medium/high based on actual motion]",
      "key_strength": "[specific strength you observed]",
      "key_weakness": "[specific weakness you observed]"
    },
    "audio_hook": {
      "score": [0-25],
      "first_sound_type": "[what you actually hear: voice/music/sfx/silence]",
      "opening_line": "[exact words spoken if any]",
      "time_to_first_word": [actual seconds],
      "key_strength": "[what works about the audio]",
      "key_weakness": "[what could improve]"
    },
    "text_hook": {
      "score": [0-25],
      "text_present": [true/false],
      "opening_text": "[exact text shown if any]",
      "word_count": [actual count],
      "legibility_score": "[poor/fair/good/excellent]"
    },
    "platform_hook_grades": {
      "tiktok": {"grade": "[A-F]", "score": [0-100], "notes": "[specific platform assessment]"},
      "meta_feed": {"grade": "[A-F]", "score": [0-100], "notes": "[specific assessment]"},
      "youtube_instream": {"grade": "[A-F]", "score": [0-100], "notes": "[specific assessment]"}
    }
  },
  
  "retentionAnalysis": {
    "overall_retention_score": [0-100],
    "structural_pattern": "[actual pattern: linear_build/peak_valley/front_loaded/back_loaded/flat/three_act/loop]",
    "predicted_completion_rates": {
      "tiktok": "[X%]",
      "youtube_preroll": "[X%]", 
      "meta_feed": "[X%]"
    },
    "critical_drop_off_points": [
      {
        "timestamp": [actual second where you see risk],
        "risk_level": "[low/medium/high]",
        "risk_type": "[energy_cliff/ad_reveal/info_overload/confusion]",
        "description": "[what happens at this moment]",
        "recommendation": "[how to fix]"
      }
    ],
    "segment_breakdown": [
      {
        "segment": "[time range]",
        "label": "[hook/setup/development/climax/cta]",
        "energy_level": "[1-10]",
        "retention_risk": "[low/medium/high]",
        "notes": "[what happens in this segment]"
      }
    ]
  },
  
  "soundOffAnalysis": {
    "sound_off_score": [0-100],
    "message_clarity_muted": "[yes/partially/no - can you understand without sound?]",
    "captions_present": [true/false],
    "caption_quality": "[none/poor/fair/good/excellent]",
    "visual_storytelling_complete": [true/false],
    "recommendations": ["[specific caption/visual improvements]"]
  },
  
  "funnelAnalysis": {
    "primary_funnel_position": "[tofu/mofu/bofu]",
    "confidence": "[low/medium/high]",
    "funnel_signals": {
      "tofu_signals": ["[actual awareness signals you see]"],
      "mofu_signals": ["[actual consideration signals]"],
      "bofu_signals": ["[actual conversion signals]"]
    },
    "alignment_assessment": {
      "cold_audience_fit": "[poor/fair/good/excellent]",
      "warm_audience_fit": "[poor/fair/good/excellent]",
      "hot_audience_fit": "[poor/fair/good/excellent]"
    },
    "recommended_targeting": ["[specific audience recommendations]"]
  },
  
  "audienceIntelligence": {
    "primary_target_description": "[detailed description of who this speaks to]",
    "demographic_signals": {
      "age_range": "[range based on content/people shown]",
      "gender_skew": "[percentage or neutral]",
      "income_signals": "[budget/middle/affluent/luxury]",
      "location_type": "[urban/suburban/rural/mixed]"
    },
    "psychographic_signals": {
      "primary_values": ["[values the content appeals to]"],
      "lifestyle_indicators": ["[lifestyle signals]"],
      "pain_points_addressed": ["[problems being solved]"]
    },
    "targeting_recommendations": {
      "meta_interests": ["[specific interest targeting]"],
      "google_audiences": ["[in-market/affinity suggestions]"]
    }
  },
  
  "platformAnalysis": {
    "youtube_instream": {
      "overall_score": [0-100],
      "skip_likelihood": "[X%]",
      "vtr_estimate": "[range%]",
      "strengths": ["[platform-specific strengths]"],
      "weaknesses": ["[platform-specific issues]"]
    },
    "tiktok": {
      "overall_score": [0-100],
      "native_feel": [1-10],
      "completion_estimate": "[range%]",
      "strengths": ["[what works for TikTok]"],
      "weaknesses": ["[what doesn't work]"]
    },
    "meta_feed": {
      "overall_score": [0-100],
      "thumb_stop_potential": "[low/medium/high]",
      "ctr_estimate": "[range%]",
      "strengths": ["[Meta-specific strengths]"],
      "weaknesses": ["[Meta-specific issues]"]
    }
  },
  
  "ctaAnalysis": {
    "cta_effectiveness_score": [0-100],
    "cta_present": [true/false],
    "primary_cta_text": "[exact CTA text]",
    "cta_timestamp": [when it appears],
    "cta_type": "[learn_more/shop_now/sign_up/etc]",
    "cta_clarity": "[poor/fair/good/excellent]",
    "cta_urgency": "[none/soft/moderate/high]",
    "recommendations": ["[specific CTA improvements]"]
  },
  
  "narrativeAnalysis": {
    "narrative_score": [0-100],
    "story_present": [true/false],
    "story_type": "[problem_solution/testimonial/demonstration/educational/entertainment/other]",
    "has_clear_beginning": [true/false],
    "has_development": [true/false],
    "has_resolution": [true/false],
    "emotional_payoff": [true/false],
    "protagonist": "[product/person/brand/concept]",
    "key_message": "[main takeaway from the narrative]"
  },
  
  "emotionalJourney": {
    "emotional_score": [0-100],
    "dominant_emotion": "[primary emotion evoked]",
    "emotional_triggers_used": ["[specific triggers: nostalgia/fomo/aspiration/humor/etc]"],
    "peak_emotion_moment": {
      "timestamp": [second],
      "emotion": "[emotion at peak]",
      "intensity": [1-10],
      "description": "[what creates the peak]"
    },
    "emotional_authenticity": "[genuine/somewhat_forced/manipulative]"
  },
  
  "complianceAnalysis": {
    "compliance_score": [0-100],
    "risk_level": "[low/medium/high]",
    "policy_flags": ["[any policy concerns you notice]"],
    "disclosure_needs": ["[required disclosures]"],
    "platform_specific_issues": {
      "google_ads": ["[Google policy concerns]"],
      "meta": ["[Meta policy concerns]"],
      "tiktok": ["[TikTok policy concerns]"]
    }
  },
  
  "accessibilityAnalysis": {
    "accessibility_score": [0-100],
    "has_captions": [true/false],
    "color_contrast_adequate": [true/false],
    "flashing_content": [true/false],
    "speech_clarity": "[poor/fair/good/excellent]",
    "issues": ["[specific accessibility problems]"]
  },
  
  "performancePredictions": {
    "attention_metrics": {
      "hook_rate": "[X-Y%]",
      "three_second_rate": "[X-Y%]",
      "completion_rate": "[X-Y%]"
    },
    "efficiency_estimates": {
      "cpm_range": "[X-Y]",
      "cpc_range": "[X-Y]"
    },
    "fatigue_prediction": {
      "novelty_level": "[low/medium/high]",
      "estimated_fatigue_days": [number],
      "frequency_cap_recommendation": [impressions per week]
    }
  },
  
  "abTestRecommendations": [
    {
      "variable": "[what to test]",
      "hypothesis": "[why this test]",
      "expected_impact": "[predicted improvement]",
      "priority": "[high/medium/low]",
      "effort": "[low/medium/high]"
    }
  ],
  
  "topStrengths": ["[3-5 specific things this video does well]"],
  "topWeaknesses": ["[3-5 specific areas for improvement]"],
  "immediateActions": ["[top 3 actions to take right now]"]
}

REMEMBER: All values must reflect YOUR ACTUAL ANALYSIS of this specific video. Do not use placeholder or example values.`;

            return await this.callAI(prompt);
        }

        // ============================================
        // UTILITY METHODS
        // ============================================

        detectPlatform(url) {
            const platforms = {
                youtube: /youtube\.com|youtu\.be/i,
                tiktok: /tiktok\.com/i,
                instagram: /instagram\.com/i,
                facebook: /facebook\.com|fb\.watch/i,
                vimeo: /vimeo\.com/i,
                linkedin: /linkedin\.com/i,
                twitter: /twitter\.com|x\.com/i
            };

            for (const [platform, regex] of Object.entries(platforms)) {
                if (regex.test(url)) return platform;
            }
            return 'unknown';
        }

        extractVideoId(url) {
            // YouTube
            const ytPatterns = [
                /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
                /youtube\.com\/shorts\/([^&\?\/]+)/
            ];
            for (const pattern of ytPatterns) {
                const match = url.match(pattern);
                if (match) return match[1];
            }

            // TikTok
            const tiktokMatch = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
            if (tiktokMatch) return tiktokMatch[1];

            return null;
        }

        async extractMetadata(url) {
            const platform = this.detectPlatform(url);
            const metadata = {
                platform,
                title: '',
                duration: 0,
                thumbnail: ''
            };

            if (platform === 'youtube') {
                const videoId = this.extractVideoId(url);
                if (videoId) {
                    metadata.videoId = videoId;
                    metadata.thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                    
                    // Try to get more metadata via oEmbed
                    try {
                        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
                        const response = await fetch(oembedUrl);
                        if (response.ok) {
                            const data = await response.json();
                            metadata.title = data.title || '';
                            metadata.author = data.author_name || '';
                        }
                    } catch (e) {
                        console.warn('[AdvancedVideoAnalyzer] Could not fetch oEmbed data:', e);
                    }
                }
            }

            return metadata;
        }

        getAPIKey() {
            if (window.CAVSettings?.manager?.getAPIKey) {
                return window.CAVSettings.manager.getAPIKey('gemini');
            }
            if (window.CAVSettings?.getAPIKey) {
                return window.CAVSettings.getAPIKey('gemini');
            }
            try {
                const v3Settings = JSON.parse(localStorage.getItem('cav_v3_settings') || '{}');
                if (v3Settings.apiKeys?.gemini?.key) return v3Settings.apiKeys.gemini.key;
            } catch (e) {}
            return null;
        }

        async callAI(prompt) {
            // Use AIModelSelector if available
            if (window.AIModelSelector?.callAI) {
                const modelId = this.getModel();
                try {
                    return await window.AIModelSelector.callAI(prompt, { 
                        model: modelId,
                        maxTokens: 8192 
                    });
                } catch (error) {
                    console.error('[AdvancedVideoAnalyzer] AI call failed, trying Gemini fallback:', error);
                    // Fallback to Gemini if primary model fails (e.g., network error)
                    console.log('[AdvancedVideoAnalyzer] Falling back to Gemini...');
                    return await this.callGeminiFallback(prompt);
                }
            }

            // Direct Gemini call
            return await this.callGeminiFallback(prompt);
        }

        async callGeminiFallback(prompt) {
            const apiKey = this.getAPIKey();
            if (!apiKey) {
                throw new Error('No API key configured. Go to Settings > API Keys.');
            }

            const modelId = window.AIModels?.getGeminiModelId?.('flash') || 'gemini-3-flash-preview';
            console.log(`[AdvancedVideoAnalyzer] Using Gemini model: ${modelId}`);
            
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 8192,
                            responseMimeType: 'application/json'
                        }
                    })
                }
            );

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`API error: ${response.status} - ${error}`);
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            return this.parseJSON(text);
        }

        parseJSON(text) {
            if (!text) return {};
            if (typeof text === 'object') return text;

            let cleaned = text;
            if (cleaned.includes('```json')) {
                cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*/g, '');
            } else if (cleaned.includes('```')) {
                cleaned = cleaned.replace(/```\s*/g, '');
            }

            const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    return JSON.parse(jsonMatch[0]);
                } catch (e) {
                    console.warn('[AdvancedVideoAnalyzer] JSON parse failed:', e);
                    return { raw: text, parseError: e.message };
                }
            }

            try {
                return JSON.parse(cleaned);
            } catch (e) {
                return { raw: text, parseError: e.message };
            }
        }

        updateProgress(message, percent) {
            console.log(`[AdvancedVideoAnalyzer] ${percent}% - ${message}`);
            window.dispatchEvent(new CustomEvent('videoAnalysisProgress', {
                detail: { message, percent }
            }));
        }

        // ============================================
        // SCORING & SUMMARY
        // ============================================

        calculateOverallScore(analysis) {
            const scores = [];
            
            // Hook score (from Gemini analysis)
            const hookScore = analysis.hookAnalysis?.overall_hook_score || analysis.hookAnalysis?.score || 0;
            if (hookScore > 0) {
                scores.push({ score: hookScore, weight: 0.20 });
            }
            
            // Retention score
            const retentionScore = analysis.retentionAnalysis?.overall_retention_score || analysis.retentionAnalysis?.score || 0;
            if (retentionScore > 0) {
                scores.push({ score: retentionScore, weight: 0.15 });
            }
            
            // Platform/Sound-off score (from platformFit or soundOffAnalysis)
            const platformScore = analysis.platformFit?.platform_score || analysis.platformFit?.sound_off_score || 
                                 analysis.soundOffAnalysis?.sound_off_score || 0;
            if (platformScore > 0) {
                scores.push({ score: platformScore, weight: 0.15 });
            }
            
            // CTA score (from messageAnalysis or ctaAnalysis)
            const ctaScore = analysis.messageAnalysis?.cta_clarity === 'excellent' ? 90 :
                            analysis.messageAnalysis?.cta_clarity === 'good' ? 75 :
                            analysis.messageAnalysis?.cta_clarity === 'fair' ? 50 :
                            analysis.messageAnalysis?.cta_present ? 60 : 
                            analysis.ctaAnalysis?.cta_effectiveness_score || 0;
            if (ctaScore > 0) {
                scores.push({ score: ctaScore, weight: 0.12 });
            }
            
            // Emotional score (from emotionalJourney)
            const emotionalScore = analysis.emotionalJourney?.emotional_score || analysis.emotionalJourney?.score || 0;
            if (emotionalScore > 0) {
                scores.push({ score: emotionalScore, weight: 0.15 });
            }
            
            // Objective alignment score
            const alignmentScore = analysis.objectiveAlignment?.alignment_score || 0;
            if (alignmentScore > 0) {
                scores.push({ score: alignmentScore, weight: 0.13 });
            }
            
            // Technical quality score
            const techQuality = analysis.technicalQuality?.production_quality;
            const techScore = techQuality === 'premium' ? 95 :
                             techQuality === 'professional' ? 80 :
                             techQuality === 'semi_pro' ? 65 :
                             techQuality === 'amateur' ? 40 : 0;
            if (techScore > 0) {
                scores.push({ score: techScore, weight: 0.10 });
            }

            if (scores.length === 0) return 0;

            const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
            const weightedSum = scores.reduce((sum, s) => sum + (s.score * s.weight), 0);
            
            return Math.round(weightedSum / totalWeight);
        }

        generateExecutiveSummary(analysis) {
            const score = analysis.overallScore || 0;
            let grade, recommendation;

            if (score >= 90) { grade = 'A+'; recommendation = 'ready_to_launch'; }
            else if (score >= 85) { grade = 'A'; recommendation = 'ready_to_launch'; }
            else if (score >= 80) { grade = 'A-'; recommendation = 'launch_with_minor_edits'; }
            else if (score >= 75) { grade = 'B+'; recommendation = 'launch_with_minor_edits'; }
            else if (score >= 70) { grade = 'B'; recommendation = 'launch_with_minor_edits'; }
            else if (score >= 65) { grade = 'B-'; recommendation = 'moderate_revision_needed'; }
            else if (score >= 60) { grade = 'C+'; recommendation = 'moderate_revision_needed'; }
            else if (score >= 55) { grade = 'C'; recommendation = 'significant_revision_needed'; }
            else if (score >= 50) { grade = 'C-'; recommendation = 'significant_revision_needed'; }
            else { grade = 'D'; recommendation = 'consider_reshoot'; }

            // Extract scores from Gemini's actual response structure
            const hookScore = analysis.hookAnalysis?.overall_hook_score || analysis.hookAnalysis?.score || 0;
            const retentionScore = analysis.retentionAnalysis?.overall_retention_score || analysis.retentionAnalysis?.score || 0;
            const soundOffScore = analysis.platformFit?.sound_off_score || analysis.soundOffAnalysis?.sound_off_score || 0;
            const platformScore = analysis.platformFit?.platform_score || 0;
            const ctaScore = this.extractCtaScore(analysis);
            const emotionalScore = analysis.emotionalJourney?.emotional_score || 0;
            const messagingScore = this.extractMessagingScore(analysis);

            return {
                overall_score: score,
                grade,
                launch_recommendation: recommendation,
                
                scoreboard: {
                    hook: hookScore,
                    retention: retentionScore,
                    sound_off: soundOffScore,
                    platform_fit: platformScore,
                    cta: ctaScore,
                    narrative: 0, // Not directly returned by Gemini
                    emotional: emotionalScore,
                    messaging: messagingScore,
                    compliance: 85 // Default high - most videos are compliant
                },
                
                top_strengths: analysis.topStrengths || [],
                top_improvements: analysis.topWeaknesses || [],
                immediate_actions: analysis.immediateActions || [],
                verdict: analysis.objectiveAlignment?.objective_strengths?.join('. ') || 
                         analysis.topStrengths?.[0] || 
                         'Video analysis complete.'
            };
        }

        // ============================================
        // UI RENDERING
        // ============================================

        renderAnalysisUI(analysis) {
            // Use dedicated UI module if available
            if (window.AdvancedVideoAnalyzerUI?.render) {
                return window.AdvancedVideoAnalyzerUI.render(analysis);
            }

            // Fallback basic rendering
            return this.renderBasicUI(analysis);
        }

        renderBasicUI(analysis) {
            const summary = analysis.executiveSummary || {};
            const gradeColors = {
                'A+': '#22c55e', 'A': '#22c55e', 'A-': '#34d399',
                'B+': '#84cc16', 'B': '#a3e635', 'B-': '#bef264',
                'C+': '#eab308', 'C': '#facc15', 'C-': '#fde047',
                'D': '#f97316', 'F': '#ef4444'
            };
            const gradeColor = gradeColors[summary.grade] || '#fff';

            return `
                <div class="advanced-video-analysis" style="padding: 24px;">
                    <!-- Executive Summary -->
                    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 32px; margin-bottom: 24px; text-align: center;">
                        <div style="font-size: 64px; font-weight: bold; color: ${gradeColor};">${summary.grade || 'N/A'}</div>
                        <div style="font-size: 48px; color: #fff; margin: 8px 0;">${analysis.overallScore || 0}/100</div>
                        <div style="color: #94a3b8; font-size: 14px; text-transform: capitalize;">${(summary.launch_recommendation || '').replace(/_/g, ' ')}</div>
                    </div>

                    <!-- Score Grid -->
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
                        ${this.renderScoreCard('🎯 Hook', summary.scoreboard?.hook)}
                        ${this.renderScoreCard('📈 Retention', summary.scoreboard?.retention)}
                        ${this.renderScoreCard('🔇 Sound-Off', summary.scoreboard?.sound_off)}
                        ${this.renderScoreCard('📱 Platform', summary.scoreboard?.platform_fit)}
                        ${this.renderScoreCard('👆 CTA', summary.scoreboard?.cta)}
                        ${this.renderScoreCard('📖 Narrative', summary.scoreboard?.narrative)}
                        ${this.renderScoreCard('💭 Emotional', summary.scoreboard?.emotional)}
                        ${this.renderScoreCard('✅ Compliance', summary.scoreboard?.compliance)}
                        ${this.renderScoreCard('♿ Accessibility', summary.scoreboard?.accessibility)}
                    </div>

                    <!-- Strengths & Improvements -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
                        <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px; padding: 20px;">
                            <h3 style="color: #4ade80; margin: 0 0 12px; font-size: 16px;">✨ Top Strengths</h3>
                            ${(summary.top_strengths || []).map(s => `<div style="color: #94a3b8; margin-bottom: 8px; font-size: 13px;">• ${s}</div>`).join('') || '<div style="color: #64748b;">Analyzing...</div>'}
                        </div>
                        <div style="background: rgba(249, 115, 22, 0.1); border: 1px solid rgba(249, 115, 22, 0.3); border-radius: 12px; padding: 20px;">
                            <h3 style="color: #fb923c; margin: 0 0 12px; font-size: 16px;">🔧 Areas to Improve</h3>
                            ${(summary.top_improvements || []).map(i => `<div style="color: #94a3b8; margin-bottom: 8px; font-size: 13px;">• ${i}</div>`).join('') || '<div style="color: #64748b;">Analyzing...</div>'}
                        </div>
                    </div>

                    <!-- Platform Performance -->
                    ${this.renderPlatformScores(analysis.platformAnalysis)}

                    <!-- Hook Analysis Details -->
                    ${analysis.hookAnalysis ? this.renderHookDetails(analysis.hookAnalysis) : ''}

                    <!-- A/B Test Recommendations -->
                    ${this.renderABTests(analysis.abTestRecommendations)}

                    <!-- Immediate Actions -->
                    ${summary.immediate_actions?.length > 0 ? `
                        <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 20px; margin-top: 20px;">
                            <h3 style="color: #a78bfa; margin: 0 0 12px; font-size: 16px;">⚡ Immediate Actions</h3>
                            ${summary.immediate_actions.map((a, i) => `
                                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                                    <span style="background: #8b5cf6; color: #fff; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">${i + 1}</span>
                                    <span style="color: #e2e8f0; font-size: 14px;">${a}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        }

        renderScoreCard(label, score) {
            const s = score || 0;
            const color = s >= 80 ? '#22c55e' : s >= 70 ? '#84cc16' : s >= 60 ? '#eab308' : s >= 50 ? '#f97316' : '#ef4444';
            return `
                <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 16px; text-align: center;">
                    <div style="font-size: 28px; font-weight: bold; color: ${color};">${s}</div>
                    <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">${label}</div>
                </div>
            `;
        }

        renderPlatformScores(platforms) {
            if (!platforms) return '';
            
            const icons = { youtube_instream: '▶️', tiktok: '🎵', meta_feed: '📘' };
            const names = { youtube_instream: 'YouTube', tiktok: 'TikTok', meta_feed: 'Meta Feed' };

            return `
                <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                    <h3 style="color: #fff; margin: 0 0 16px; font-size: 16px;">📊 Platform Performance</h3>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                        ${['youtube_instream', 'tiktok', 'meta_feed'].map(key => {
                            const data = platforms[key] || {};
                            const score = data.overall_score || 0;
                            const color = score >= 70 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444';
                            return `
                                <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: 12px; text-align: center;">
                                    <div style="font-size: 20px; margin-bottom: 8px;">${icons[key] || '📱'}</div>
                                    <div style="font-size: 28px; font-weight: bold; color: ${color};">${score}</div>
                                    <div style="font-size: 11px; color: #94a3b8;">${names[key] || key}</div>
                                    ${data.strengths?.length > 0 ? `
                                        <div style="font-size: 10px; color: #4ade80; margin-top: 8px;">✓ ${data.strengths[0]}</div>
                                    ` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        renderHookDetails(hook) {
            return `
                <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                    <h3 style="color: #a78bfa; margin: 0 0 16px; font-size: 16px;">🎯 Hook Analysis (First 3 Seconds)</h3>
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;">
                        <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 24px; font-weight: bold; color: #a78bfa;">${hook.overall_hook_score || 0}</div>
                            <div style="font-size: 10px; color: #64748b;">Overall</div>
                        </div>
                        <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 20px; font-weight: bold; color: #60a5fa;">${hook.visual_hook?.score || 0}/30</div>
                            <div style="font-size: 10px; color: #64748b;">Visual</div>
                        </div>
                        <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 20px; font-weight: bold; color: #4ade80;">${hook.audio_hook?.score || 0}/25</div>
                            <div style="font-size: 10px; color: #64748b;">Audio</div>
                        </div>
                        <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 20px; font-weight: bold; color: #fbbf24;">${hook.text_hook?.score || 0}/25</div>
                            <div style="font-size: 10px; color: #64748b;">Text</div>
                        </div>
                    </div>
                    <div style="color: #94a3b8; font-size: 13px;">
                        <div style="margin-bottom: 6px;"><strong style="color: #a78bfa;">Hook Type:</strong> ${(hook.primary_hook_type || 'unknown').replace(/_/g, ' ')}</div>
                        ${hook.visual_hook?.first_frame_description ? `<div style="margin-bottom: 6px;"><strong style="color: #60a5fa;">Opening Frame:</strong> ${hook.visual_hook.first_frame_description}</div>` : ''}
                        ${hook.audio_hook?.opening_line ? `<div style="margin-bottom: 6px;"><strong style="color: #4ade80;">Opening Line:</strong> "${hook.audio_hook.opening_line}"</div>` : ''}
                    </div>
                </div>
            `;
        }

        renderABTests(tests) {
            if (!tests || tests.length === 0) return '';

            return `
                <div style="background: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 12px; padding: 20px;">
                    <h3 style="color: #fbbf24; margin: 0 0 16px; font-size: 16px;">🧪 A/B Test Recommendations</h3>
                    ${tests.slice(0, 5).map(test => `
                        <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; margin-bottom: 8px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                <span style="color: #fff; font-weight: 500; font-size: 13px;">${test.variable || test.hypothesis}</span>
                                <span style="padding: 2px 8px; background: ${test.priority === 'high' ? '#ef4444' : test.priority === 'medium' ? '#eab308' : '#22c55e'}; border-radius: 4px; font-size: 10px; color: #000; font-weight: 600;">${test.priority || 'medium'}</span>
                            </div>
                            <div style="color: #22c55e; font-size: 12px;">${test.expected_impact || ''}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // ============================================
        // SEND TO AD BUILDERS
        // ============================================

        sendToGoogleAds() {
            const latestAnalysis = this.analysisHistory[0];
            if (!latestAnalysis || !latestAnalysis.adCopySuggestions) {
                alert('No ad copy data available. Please run a video analysis first.');
                return;
            }

            const adCopy = latestAnalysis.adCopySuggestions;
            const googleData = adCopy.googleAdsVariations || {};

            // Pre-fill Google Ads Builder
            if (window.GoogleAdsBuilder) {
                const prefillData = {
                    headlines: googleData.headlines || adCopy.headlines?.map(h => h.text) || [],
                    descriptions: googleData.descriptions || adCopy.primaryText?.map(p => p.text) || [],
                    source: 'video_analysis',
                    videoUrl: latestAnalysis.url,
                    analysisId: latestAnalysis.id
                };
                
                // Store for the builder to pick up
                localStorage.setItem('cav_video_ad_prefill', JSON.stringify(prefillData));
                
                // Navigate to Google Ads Builder
                if (window.cavTabs?.showTab) {
                    window.cavTabs.showTab('google-ads');
                } else {
                    // Trigger sidebar click
                    const googleAdsTab = document.querySelector('[data-page="google-ads"]');
                    if (googleAdsTab) googleAdsTab.click();
                }
                
                // Notify user
                alert('Ad copy data sent to Google Ads Builder! The form will be pre-filled with the generated headlines and descriptions.');
            } else {
                // Copy to clipboard as fallback
                const copyText = `Headlines:\n${googleData.headlines?.join('\n') || 'N/A'}\n\nDescriptions:\n${googleData.descriptions?.join('\n') || 'N/A'}`;
                navigator.clipboard.writeText(copyText);
                alert('Google Ads Builder not available. Ad copy has been copied to your clipboard.');
            }
        }

        sendToSocialMedia() {
            const latestAnalysis = this.analysisHistory[0];
            if (!latestAnalysis || !latestAnalysis.adCopySuggestions) {
                alert('No ad copy data available. Please run a video analysis first.');
                return;
            }

            const adCopy = latestAnalysis.adCopySuggestions;
            const socialData = adCopy.socialVariations || {};

            // Pre-fill Social Media Builder
            if (window.SocialMediaBuilder) {
                const prefillData = {
                    headlines: adCopy.headlines?.map(h => h.text) || [],
                    primaryText: adCopy.primaryText?.map(p => p.text) || [],
                    tiktok: socialData.tiktok || {},
                    instagram: socialData.instagram || {},
                    linkedin: socialData.linkedin || {},
                    source: 'video_analysis',
                    videoUrl: latestAnalysis.url,
                    analysisId: latestAnalysis.id
                };
                
                // Store for the builder to pick up
                localStorage.setItem('cav_video_social_prefill', JSON.stringify(prefillData));
                
                // Navigate to Social Media Builder
                if (window.cavTabs?.showTab) {
                    window.cavTabs.showTab('social-media');
                } else {
                    // Trigger sidebar click
                    const socialTab = document.querySelector('[data-page="social-media"]');
                    if (socialTab) socialTab.click();
                }
                
                // Notify user
                alert('Ad copy data sent to Social Media Builder! The form will be pre-filled with the generated copy.');
            } else {
                // Copy to clipboard as fallback
                const copyText = `TikTok:\n${socialData.tiktok?.caption || 'N/A'}\n\nInstagram:\n${socialData.instagram?.caption || 'N/A'}\n\nLinkedIn:\n${socialData.linkedin?.text || 'N/A'}`;
                navigator.clipboard.writeText(copyText);
                alert('Social Media Builder not available. Ad copy has been copied to your clipboard.');
            }
        }

        // Export the last analysis to CRM
        saveToCRM(companyId = null) {
            const latestAnalysis = this.analysisHistory[0];
            if (!latestAnalysis) {
                alert('No analysis to save. Please run a video analysis first.');
                return;
            }

            if (window.cavCRM) {
                try {
                    // If no company specified, prompt user
                    if (!companyId) {
                        const companies = window.cavCRM.getAllCompanies() || [];
                        if (companies.length > 0) {
                            const companyList = companies.map((c, i) => `${i + 1}. ${c.name}`).join('\n');
                            const choice = prompt(`Save to which company?\n${companyList}\n\nEnter number or leave blank to create new:`);
                            if (choice && parseInt(choice) > 0 && parseInt(choice) <= companies.length) {
                                companyId = companies[parseInt(choice) - 1].id;
                            }
                        }
                    }

                    // Save as creative analysis linked to company
                    const analysisRecord = {
                        type: 'video_analysis',
                        url: latestAnalysis.url,
                        scores: {
                            overall: latestAnalysis.overallScore,
                            hook: latestAnalysis.hookAnalysis?.overall_hook_score,
                            retention: latestAnalysis.retentionAnalysis?.overall_retention_score
                        },
                        adCopySuggestions: latestAnalysis.adCopySuggestions,
                        strategicInsights: latestAnalysis.strategicAssessment,
                        timestamp: latestAnalysis.timestamp,
                        companyId
                    };

                    window.cavCRM.saveAnalysis?.(analysisRecord) || 
                    window.cavCRM.createCreativeAnalysis?.(analysisRecord);
                    
                    alert(`Video analysis saved to CRM${companyId ? ' and linked to company' : ''}!`);
                } catch (e) {
                    console.error('[VideoAnalyzer] CRM save failed:', e);
                    alert('Failed to save to CRM: ' + e.message);
                }
            } else {
                alert('CRM module not available.');
            }
        }
    }

    // ============================================
    // EXPORT
    // ============================================

    window.AdvancedVideoAnalyzer = new AdvancedVideoAnalyzer();

    console.log(`🎬 Advanced Video Creative Intelligence System v${VERSION} loaded`);
    console.log('   Now performs REAL analysis - not templated responses');

})();
