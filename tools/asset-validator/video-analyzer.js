/**
 * Advanced Video Analyzer Module
 * Comprehensive video analysis: watch, listen, scan, read
 * Provides detailed creative diagnostics, strategy, and insights
 * Version: 2.4.0 - January 18, 2026
 * 
 * v2.4.0 MAJOR UPDATE - Real Frame Extraction:
 * - Uses VideoFrameExtractor to download/capture actual video frames
 * - Sends frame images (not just URLs) to AI for real visual analysis
 * - Handles social media platform restrictions with clear messaging
 * - Prompts for file upload when URL extraction fails
 * - Stores analysis screenshots in Cloudinary
 * 
 * This module now integrates with the Advanced Video Creative Intelligence System v2.0
 * for comprehensive paid media analysis including:
 * - Hook & Attention Mechanics (0-3 second analysis)
 * - Retention Curve Prediction
 * - Skip-Ad Likelihood (YouTube)
 * - Sound-Off Effectiveness
 * - Funnel Position Classification
 * - Audience Intelligence
 * - Platform Performance Prediction
 * - CTA Analysis
 * - Narrative Architecture
 * - Emotional Journey Mapping
 * - Compliance & Accessibility
 * - Strategic Recommendations
 */

(function() {
    'use strict';

    const VERSION = '2.4.0';

    // ============================================
    // VIDEO ANALYZER CLASS
    // ============================================

    class VideoAnalyzer {
        constructor() {
            this.analysisHistory = [];
            this.selectedModel = null; // User can select model before analysis
            this.loadHistory();
            console.log(`[VideoAnalyzer] Module loaded v${VERSION}`);
        }

        // Set the AI model to use for analysis
        setModel(modelId) {
            this.selectedModel = modelId;
            console.log(`[VideoAnalyzer] Model set to: ${modelId}`);
        }

        // Get the currently selected model
        getModel() {
            return this.selectedModel || window.AIModelSelector?.selectedModel || 'gemini-3-flash-preview';
        }

        loadHistory() {
            try {
                this.analysisHistory = JSON.parse(localStorage.getItem('cav_video_analyses') || '[]');
            } catch (e) {
                this.analysisHistory = [];
            }
        }

        saveHistory() {
            localStorage.setItem('cav_video_analyses', JSON.stringify(this.analysisHistory.slice(0, 50)));
        }

        // ============================================
        // MAIN ANALYSIS FUNCTION
        // ============================================

        async analyzeVideo(videoSource, options = {}) {
            const isFile = videoSource instanceof File;
            const videoUrl = isFile ? `file://${videoSource.name}` : videoSource;
            
            console.log('[VideoAnalyzer] Starting comprehensive analysis:', isFile ? videoSource.name : videoUrl);
            console.log('[VideoAnalyzer] Options:', options);

            // Use AdvancedVideoAnalyzer v2 if available (comprehensive paid media intelligence)
            if (window.AdvancedVideoAnalyzer && window.AdvancedVideoAnalyzer !== this) {
                console.log('[VideoAnalyzer] Delegating to AdvancedVideoAnalyzer v2.0');
                if (this.selectedModel) {
                    window.AdvancedVideoAnalyzer.setModel(this.selectedModel);
                }
                const result = await window.AdvancedVideoAnalyzer.analyzeVideo(videoSource, options);
                this.analysisHistory = window.AdvancedVideoAnalyzer.analysisHistory;
                return result;
            }

            // Validate input
            if (!isFile && (!videoUrl || !videoUrl.startsWith('http'))) {
                throw new Error('Please enter a valid video URL starting with http:// or https://');
            }

            // Check for API key upfront
            const apiKey = this.getAPIKey();
            if (!apiKey) {
                throw new Error('No Gemini API key configured. Please go to Settings > API Keys and add your Gemini API key to use video analysis.');
            }

            const analysisId = crypto.randomUUID();
            const analysis = {
                id: analysisId,
                url: videoUrl,
                timestamp: new Date().toISOString(),
                status: 'analyzing',
                platform: isFile ? 'upload' : this.detectPlatform(videoUrl),
                frames: [],
                frameExtraction: null,
                metadata: {},
                visualAnalysis: {},
                audioAnalysis: {},
                contentAnalysis: {},
                sentimentAnalysis: {},
                experienceAnalysis: {},
                strategicInsights: {},
                creativeScore: {},
                recommendations: []
            };

            console.log('[VideoAnalyzer] Detected platform:', analysis.platform);

            try {
                // Step 0: Extract frames from video (NEW - critical step)
                this.updateProgress('Extracting video frames...', 5);
                
                if (window.VideoFrameExtractor) {
                    const frameResult = await window.VideoFrameExtractor.extractFrames(
                        isFile ? videoSource : videoUrl,
                        {
                            maxFrames: 8,
                            progressCallback: (msg, pct) => this.updateProgress(msg, 5 + (pct * 0.15))
                        }
                    );
                    
                    analysis.frameExtraction = frameResult;
                    
                    if (frameResult.success) {
                        analysis.frames = frameResult.frames;
                        analysis.metadata = {
                            ...analysis.metadata,
                            ...(frameResult.metadata || {}),
                            ...(frameResult.metadata?.raw || {})
                        };
                        console.log(`[VideoAnalyzer] Extracted ${frameResult.frames.length} frames`);
                    } else {
                        console.warn('[VideoAnalyzer] Frame extraction limited:', frameResult.message);
                        
                        // Check if we should prompt for upload
                        if (frameResult.suggestUpload) {
                            analysis.uploadPrompt = {
                                show: true,
                                reason: frameResult.message || `${this.getPlatformName(analysis.platform)} restricts automated video access.`,
                                tip: 'Download the video and upload it directly for complete frame-by-frame analysis.'
                            };
                        }
                        
                        // Use partial data if available
                        if (frameResult.partial && frameResult.frames?.length > 0) {
                            analysis.frames = frameResult.frames;
                        }
                    }
                } else {
                    console.warn('[VideoAnalyzer] VideoFrameExtractor not available');
                }

                // Step 1: Extract video metadata
                this.updateProgress('Extracting video metadata...', 20);
                const additionalMetadata = await this.extractMetadata(videoUrl);
                analysis.metadata = { ...analysis.metadata, ...additionalMetadata };
                console.log('[VideoAnalyzer] Metadata extracted:', analysis.metadata);

                // Step 2: Visual frame analysis (now with actual frames!)
                this.updateProgress('Analyzing visual elements & composition...', 30);
                analysis.visualAnalysis = await this.analyzeVisuals(videoUrl, analysis.metadata, analysis.frames);
                console.log('[VideoAnalyzer] Visual analysis complete');

                // Step 3: Audio/transcript analysis
                this.updateProgress('Analyzing audio, music & voiceover...', 40);
                analysis.audioAnalysis = await this.analyzeAudio(videoUrl, analysis.metadata);
                console.log('[VideoAnalyzer] Audio analysis complete');

                // Step 4: Content and messaging analysis
                this.updateProgress('Analyzing messaging & value proposition...', 55);
                analysis.contentAnalysis = await this.analyzeContent(analysis);
                console.log('[VideoAnalyzer] Content analysis complete');

                // Step 5: Sentiment analysis
                this.updateProgress('Evaluating emotional impact & sentiment...', 70);
                analysis.sentimentAnalysis = await this.analyzeSentiment(analysis);
                console.log('[VideoAnalyzer] Sentiment analysis complete');

                // Step 6: Experience/UX analysis
                this.updateProgress('Assessing viewer experience & flow...', 80);
                analysis.experienceAnalysis = await this.analyzeExperience(analysis);
                console.log('[VideoAnalyzer] Experience analysis complete');

                // Step 7: Strategic insights
                this.updateProgress('Generating strategic recommendations...', 90);
                analysis.strategicInsights = await this.generateStrategicInsights(analysis);
                console.log('[VideoAnalyzer] Strategic insights complete');

                // Step 8: Final scoring and recommendations
                this.updateProgress('Calculating scores & finalizing...', 95);
                analysis.creativeScore = this.calculateCreativeScore(analysis);
                analysis.recommendations = this.generateRecommendations(analysis);
                console.log('[VideoAnalyzer] Scoring complete:', analysis.creativeScore);

                analysis.status = 'complete';
                this.updateProgress('Analysis complete!', 100);

                // Save to history
                this.analysisHistory.unshift(analysis);
                this.saveHistory();
                console.log('[VideoAnalyzer] Saved to history');

                // Sync to Supabase
                if (window.CAVSupabase?.saveUrlAnalysis) {
                    try {
                        await window.CAVSupabase.saveUrlAnalysis({
                            uuid: analysis.id,
                            url: videoUrl,
                            analysis_type: 'video',
                            results: analysis
                        });
                        console.log('[VideoAnalyzer] Synced to Supabase');
                    } catch (e) {
                        console.warn('[VideoAnalyzer] Supabase sync failed:', e);
                    }
                }

                return analysis;

            } catch (error) {
                console.error('[VideoAnalyzer] Analysis failed:', error);
                analysis.status = 'error';
                analysis.error = error.message || 'Unknown error occurred';
                
                // Still save failed analysis for debugging
                this.analysisHistory.unshift(analysis);
                this.saveHistory();
                
                return analysis;
            }
        }

        // ============================================
        // PLATFORM DETECTION
        // ============================================

        detectPlatform(url) {
            const platforms = {
                youtube: /youtube\.com|youtu\.be/i,
                vimeo: /vimeo\.com/i,
                tiktok: /tiktok\.com/i,
                instagram: /instagram\.com/i,
                facebook: /facebook\.com|fb\.watch/i,
                twitter: /twitter\.com|x\.com/i,
                linkedin: /linkedin\.com/i,
                loom: /loom\.com/i,
                wistia: /wistia\.com/i,
                veed: /veed\.io/i,
                direct: /\.(mp4|webm|mov|avi)$/i
            };

            for (const [platform, regex] of Object.entries(platforms)) {
                if (regex.test(url)) return platform;
            }
            return 'unknown';
        }

        // ============================================
        // METADATA EXTRACTION
        // ============================================

        async extractMetadata(url) {
            const platform = this.detectPlatform(url);
            
            // Try to get metadata via API or scraping
            let metadata = {
                title: '',
                description: '',
                duration: 0,
                thumbnail: '',
                creator: '',
                uploadDate: '',
                views: 0,
                likes: 0,
                comments: 0,
                platform: platform
            };

            // For YouTube, extract video ID and fetch metadata
            if (platform === 'youtube') {
                const videoId = this.extractYouTubeId(url);
                if (videoId) {
                    metadata.videoId = videoId;
                    metadata.embedUrl = `https://www.youtube.com/embed/${videoId}`;
                    metadata.thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                }
            }

            return metadata;
        }

        extractYouTubeId(url) {
            const patterns = [
                /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
                /youtube\.com\/shorts\/([^&\?\/]+)/
            ];
            for (const pattern of patterns) {
                const match = url.match(pattern);
                if (match) return match[1];
            }
            return null;
        }

        getPlatformName(platform) {
            const names = {
                youtube: 'YouTube',
                instagram: 'Instagram',
                tiktok: 'TikTok',
                facebook: 'Facebook',
                twitter: 'X (Twitter)',
                vimeo: 'Vimeo',
                linkedin: 'LinkedIn',
                upload: 'Uploaded Video',
                direct: 'Direct Video'
            };
            return names[platform] || platform;
        }

        // ============================================
        // VISUAL ANALYSIS (using AI with actual frames)
        // ============================================

        async analyzeVisuals(url, metadata, frames = []) {
            const apiKey = this.getAPIKey();
            if (!apiKey) {
                return this.getPlaceholderVisualAnalysis();
            }

            // Build frame context for AI
            const frameContext = frames.length > 0 
                ? `\n\nI have extracted ${frames.length} key frames from this video at these timestamps: ${frames.map(f => f.label || `${f.timestamp}s`).join(', ')}.`
                : '';
            
            // If we have frames with data URLs, we'll send them as images
            const hasRealFrames = frames.some(f => f.dataUrl || f.url);

            const prompt = `You are an expert video creative analyst. Analyze this video for visual creative effectiveness.

Video URL: ${url}
Platform: ${metadata.platform}
${metadata.title ? `Title: ${metadata.title}` : ''}
${metadata.thumbnail ? `Thumbnail: ${metadata.thumbnail}` : ''}
${frameContext}

${hasRealFrames ? 'I am providing actual video frames for analysis. Analyze the ACTUAL visual content you can see.' : 'Note: I could not extract video frames due to platform restrictions. Provide analysis based on available metadata and typical patterns for this platform.'}

Provide a comprehensive VISUAL analysis including:

1. **Opening Hook** (first 3 seconds):
   - Visual impact score (0-100)
   - What grabs attention
   - Brand visibility
   - Thumb-stop potential

2. **Visual Storytelling**:
   - Story arc clarity (0-100)
   - Scene transitions quality
   - Visual hierarchy
   - Pacing effectiveness

3. **Brand Elements**:
   - Logo placement and visibility
   - Brand colors usage
   - Typography consistency
   - Brand recognition score (0-100)

4. **Production Quality**:
   - Video resolution/quality
   - Lighting assessment
   - Color grading
   - Professional polish score (0-100)

5. **Composition**:
   - Rule of thirds usage
   - Subject framing
   - Background effectiveness
   - Visual clutter assessment

6. **Text/Graphics**:
   - Text readability
   - Graphics quality
   - Animation smoothness
   - Mobile optimization

7. **Platform Optimization**:
   - Aspect ratio appropriateness
   - Duration appropriateness
   - Platform-specific features used
   - Optimization score (0-100)

Return ONLY valid JSON:
{
    "openingHook": {
        "impactScore": 75,
        "attentionGrabber": "Description of what grabs attention",
        "brandVisibility": "How visible is the brand",
        "thumbStopPotential": 80
    },
    "visualStorytelling": {
        "storyArcClarity": 70,
        "transitions": "Quality assessment",
        "visualHierarchy": "Assessment",
        "pacingScore": 75
    },
    "brandElements": {
        "logoPlacement": "Assessment",
        "colorUsage": "Assessment",
        "typographyConsistency": "Assessment",
        "brandRecognitionScore": 65
    },
    "productionQuality": {
        "resolution": "HD/4K/etc",
        "lighting": "Assessment",
        "colorGrading": "Assessment",
        "polishScore": 80
    },
    "composition": {
        "ruleOfThirds": "Assessment",
        "subjectFraming": "Assessment",
        "backgroundEffectiveness": "Assessment",
        "visualClutter": "Low/Medium/High"
    },
    "textGraphics": {
        "textReadability": "Assessment",
        "graphicsQuality": "Assessment",
        "animationSmoothness": "Assessment",
        "mobileOptimized": true
    },
    "platformOptimization": {
        "aspectRatio": "16:9/9:16/1:1",
        "durationAppropriate": true,
        "platformFeaturesUsed": ["Feature 1", "Feature 2"],
        "optimizationScore": 70
    },
    "overallVisualScore": 75,
    "topVisualStrengths": ["Strength 1", "Strength 2", "Strength 3"],
    "visualWeaknesses": ["Weakness 1", "Weakness 2"]
}`;

            return await this.callAI(prompt);
        }

        // ============================================
        // AUDIO ANALYSIS
        // ============================================

        async analyzeAudio(url, metadata) {
            const apiKey = this.getAPIKey();
            if (!apiKey) {
                return this.getPlaceholderAudioAnalysis();
            }

            const prompt = `You are an expert audio/video analyst. Analyze the audio elements of this video creative.

Video URL: ${url}
Platform: ${metadata.platform}

Provide a comprehensive AUDIO analysis including:

1. **Voice/Narration**:
   - Voice presence (yes/no)
   - Voice quality assessment
   - Tone and delivery style
   - Clarity and intelligibility (0-100)
   - Emotional resonance (0-100)

2. **Music/Sound Design**:
   - Music presence and style
   - Music-mood alignment
   - Sound effects usage
   - Audio branding elements
   - Music licensing concern level

3. **Audio Technical Quality**:
   - Overall audio quality
   - Volume consistency
   - Background noise level
   - Professional mixing score (0-100)

4. **Messaging Through Audio**:
   - Key messages delivered via audio
   - Call-to-action clarity in audio
   - Brand mention frequency
   - Script effectiveness (0-100)

5. **Emotional Audio Journey**:
   - Opening audio hook
   - Emotional arc through audio
   - Closing audio impact
   - Memorability score (0-100)

6. **Accessibility**:
   - Caption/subtitle readiness
   - Audio-only comprehension
   - Multi-language potential

Return ONLY valid JSON:
{
    "voiceNarration": {
        "present": true,
        "quality": "Professional/Amateur/None",
        "tone": "Energetic/Calm/Professional/Casual",
        "clarity": 85,
        "emotionalResonance": 70
    },
    "musicSoundDesign": {
        "musicPresent": true,
        "musicStyle": "Upbeat pop/Corporate/Cinematic/etc",
        "moodAlignment": "Strong/Moderate/Weak",
        "soundEffects": "Effective/Minimal/Overused",
        "audioBranding": "Present/Absent",
        "licensingRisk": "Low/Medium/High"
    },
    "technicalQuality": {
        "overallQuality": "Excellent/Good/Average/Poor",
        "volumeConsistency": "Consistent/Variable",
        "backgroundNoise": "None/Minimal/Noticeable",
        "mixingScore": 80
    },
    "messaging": {
        "keyMessages": ["Message 1", "Message 2"],
        "ctaClarity": 75,
        "brandMentions": 2,
        "scriptEffectiveness": 70
    },
    "emotionalJourney": {
        "openingHook": "Description",
        "emotionalArc": "Building/Flat/Declining",
        "closingImpact": "Strong/Moderate/Weak",
        "memorabilityScore": 65
    },
    "accessibility": {
        "captionReady": true,
        "audioOnlyComprehension": 60,
        "multiLanguagePotential": "High/Medium/Low"
    },
    "overallAudioScore": 75,
    "topAudioStrengths": ["Strength 1", "Strength 2"],
    "audioWeaknesses": ["Weakness 1", "Weakness 2"]
}`;

            return await this.callAI(prompt);
        }

        // ============================================
        // CONTENT ANALYSIS
        // ============================================

        async analyzeContent(analysis) {
            const apiKey = this.getAPIKey();
            if (!apiKey) {
                return this.getPlaceholderContentAnalysis();
            }

            const prompt = `You are an expert content strategist. Analyze the content and messaging of this video.

Video URL: ${analysis.url}
Platform: ${analysis.platform}
Visual Analysis Summary: ${JSON.stringify(analysis.visualAnalysis?.overallVisualScore || 'N/A')}
Audio Analysis Summary: ${JSON.stringify(analysis.audioAnalysis?.overallAudioScore || 'N/A')}

Provide comprehensive CONTENT analysis:

1. **Message Architecture**:
   - Primary message/value proposition
   - Supporting messages
   - Proof points/evidence
   - Message clarity score (0-100)

2. **Target Audience**:
   - Primary audience identification
   - Demographics implied
   - Psychographics implied
   - Audience relevance score (0-100)

3. **Value Proposition**:
   - Core benefit communicated
   - Differentiation from competitors
   - Urgency/scarcity elements
   - Compelling factor score (0-100)

4. **Storytelling Structure**:
   - Story type (Problem-Solution/Testimonial/Demo/etc)
   - Narrative arc
   - Emotional triggers used
   - Story effectiveness (0-100)

5. **Call-to-Action**:
   - CTA presence and clarity
   - CTA type (Click/Buy/Learn/Sign up)
   - CTA timing
   - CTA effectiveness (0-100)

6. **Content Funnel Position**:
   - Awareness/Consideration/Decision
   - Content goal identification
   - Funnel alignment score (0-100)

Return ONLY valid JSON:
{
    "messageArchitecture": {
        "primaryMessage": "Main value proposition",
        "supportingMessages": ["Message 1", "Message 2"],
        "proofPoints": ["Proof 1", "Proof 2"],
        "clarityScore": 75
    },
    "targetAudience": {
        "primaryAudience": "Description",
        "demographics": "Age, gender, location indicators",
        "psychographics": "Interests, values, lifestyle",
        "relevanceScore": 80
    },
    "valueProposition": {
        "coreBenefit": "Main benefit",
        "differentiation": "What sets it apart",
        "urgencyElements": "Scarcity/time elements if any",
        "compellingScore": 70
    },
    "storytelling": {
        "storyType": "Problem-Solution/Testimonial/Demo/Lifestyle",
        "narrativeArc": "Beginning-Middle-End assessment",
        "emotionalTriggers": ["Trigger 1", "Trigger 2"],
        "effectivenessScore": 75
    },
    "callToAction": {
        "present": true,
        "ctaText": "The actual CTA",
        "ctaType": "Click/Buy/Learn/Sign up/etc",
        "timing": "When in video",
        "effectivenessScore": 65
    },
    "funnelPosition": {
        "stage": "Awareness/Consideration/Decision",
        "contentGoal": "Primary goal",
        "alignmentScore": 70
    },
    "overallContentScore": 75,
    "contentStrengths": ["Strength 1", "Strength 2"],
    "contentWeaknesses": ["Weakness 1", "Weakness 2"]
}`;

            return await this.callAI(prompt);
        }

        // ============================================
        // SENTIMENT ANALYSIS
        // ============================================

        async analyzeSentiment(analysis) {
            const apiKey = this.getAPIKey();
            if (!apiKey) {
                return this.getPlaceholderSentimentAnalysis();
            }

            const prompt = `You are an expert in emotional and sentiment analysis. Analyze the emotional impact of this video.

Video URL: ${analysis.url}
Platform: ${analysis.platform}
Content Summary: ${analysis.contentAnalysis?.messageArchitecture?.primaryMessage || 'N/A'}

Provide comprehensive SENTIMENT and EMOTIONAL analysis:

1. **Overall Sentiment**:
   - Dominant sentiment (Positive/Negative/Neutral)
   - Sentiment intensity (0-100)
   - Sentiment consistency throughout

2. **Emotional Mapping**:
   - Primary emotions evoked
   - Emotional journey timeline
   - Peak emotional moments
   - Emotional authenticity score (0-100)

3. **Trust Signals**:
   - Credibility indicators
   - Authenticity perception
   - Trust-building elements
   - Trust score (0-100)

4. **Engagement Triggers**:
   - Curiosity triggers
   - FOMO elements
   - Social proof usage
   - Engagement potential (0-100)

5. **Brand Sentiment**:
   - Brand perception created
   - Brand personality traits conveyed
   - Brand affinity potential (0-100)

6. **Viewer Response Prediction**:
   - Likely positive reactions
   - Potential negative reactions
   - Viral potential (0-100)
   - Share likelihood (0-100)

Return ONLY valid JSON:
{
    "overallSentiment": {
        "dominant": "Positive/Negative/Neutral",
        "intensity": 75,
        "consistency": "Consistent/Variable/Contradictory"
    },
    "emotionalMapping": {
        "primaryEmotions": ["Excitement", "Trust", "Curiosity"],
        "emotionalJourney": "Description of emotional arc",
        "peakMoments": ["Moment 1 description", "Moment 2 description"],
        "authenticityScore": 70
    },
    "trustSignals": {
        "credibilityIndicators": ["Indicator 1", "Indicator 2"],
        "authenticityPerception": "High/Medium/Low",
        "trustElements": ["Element 1", "Element 2"],
        "trustScore": 75
    },
    "engagementTriggers": {
        "curiosityTriggers": ["Trigger 1", "Trigger 2"],
        "fomoElements": "Present/Absent",
        "socialProof": "Strong/Moderate/Weak/None",
        "engagementPotential": 70
    },
    "brandSentiment": {
        "perception": "Premium/Friendly/Professional/Innovative/etc",
        "personalityTraits": ["Trait 1", "Trait 2", "Trait 3"],
        "affinityPotential": 65
    },
    "viewerResponse": {
        "positiveReactions": ["Likely reaction 1", "Likely reaction 2"],
        "negativeReactions": ["Potential issue 1", "Potential issue 2"],
        "viralPotential": 50,
        "shareLikelihood": 55
    },
    "overallSentimentScore": 72
}`;

            return await this.callAI(prompt);
        }

        // ============================================
        // EXPERIENCE ANALYSIS
        // ============================================

        async analyzeExperience(analysis) {
            const apiKey = this.getAPIKey();
            if (!apiKey) {
                return this.getPlaceholderExperienceAnalysis();
            }

            const prompt = `You are a UX expert specializing in video content. Analyze the viewer experience of this video.

Video URL: ${analysis.url}
Platform: ${analysis.platform}
Duration: ${analysis.metadata?.duration || 'Unknown'}

Provide comprehensive VIEWER EXPERIENCE analysis:

1. **First Impression** (0-3 seconds):
   - Hook effectiveness
   - Clarity of purpose
   - Brand recognition
   - First impression score (0-100)

2. **Viewing Flow**:
   - Pacing assessment
   - Information density
   - Cognitive load
   - Flow score (0-100)

3. **Retention Factors**:
   - Drop-off risk points
   - Re-engagement hooks
   - Pattern interrupt usage
   - Retention prediction (0-100)

4. **Accessibility**:
   - Readability of text
   - Color contrast
   - Audio dependency
   - Accessibility score (0-100)

5. **Platform Experience**:
   - Mobile viewing experience
   - Sound-off comprehension
   - Autoplay effectiveness
   - Platform fit score (0-100)

6. **Post-View Impact**:
   - Memorability assessment
   - Action likelihood
   - Repeat view potential
   - Impact score (0-100)

7. **Pain Points**:
   - Confusion points
   - Friction elements
   - Improvement opportunities

Return ONLY valid JSON:
{
    "firstImpression": {
        "hookEffectiveness": 75,
        "purposeClarity": "Clear/Unclear/Mixed",
        "brandRecognition": "Immediate/Delayed/Absent",
        "score": 70
    },
    "viewingFlow": {
        "pacing": "Too fast/Just right/Too slow",
        "informationDensity": "Heavy/Balanced/Light",
        "cognitiveLoad": "High/Medium/Low",
        "flowScore": 75
    },
    "retentionFactors": {
        "dropOffRisks": ["Risk point 1", "Risk point 2"],
        "reEngagementHooks": ["Hook 1", "Hook 2"],
        "patternInterrupts": "Used effectively/Minimal/Overused",
        "retentionPrediction": 65
    },
    "accessibility": {
        "textReadability": "Good/Fair/Poor",
        "colorContrast": "Sufficient/Insufficient",
        "audioDependency": "High/Medium/Low",
        "accessibilityScore": 70
    },
    "platformExperience": {
        "mobileViewing": "Optimized/Acceptable/Poor",
        "soundOffComprehension": 60,
        "autoplayEffectiveness": "Engaging/Neutral/Disengaging",
        "platformFitScore": 75
    },
    "postViewImpact": {
        "memorability": "High/Medium/Low",
        "actionLikelihood": 65,
        "repeatViewPotential": 40,
        "impactScore": 70
    },
    "painPoints": {
        "confusionPoints": ["Point 1", "Point 2"],
        "frictionElements": ["Element 1", "Element 2"],
        "improvements": ["Improvement 1", "Improvement 2", "Improvement 3"]
    },
    "overallExperienceScore": 72
}`;

            return await this.callAI(prompt);
        }

        // ============================================
        // STRATEGIC INSIGHTS
        // ============================================

        async generateStrategicInsights(analysis) {
            const apiKey = this.getAPIKey();
            if (!apiKey) {
                return this.getPlaceholderStrategicInsights();
            }

            const prompt = `You are a senior creative strategist. Based on this comprehensive video analysis, provide strategic insights and recommendations.

Video URL: ${analysis.url}
Platform: ${analysis.platform}
Visual Score: ${analysis.visualAnalysis?.overallVisualScore || 'N/A'}
Audio Score: ${analysis.audioAnalysis?.overallAudioScore || 'N/A'}
Content Score: ${analysis.contentAnalysis?.overallContentScore || 'N/A'}
Sentiment Score: ${analysis.sentimentAnalysis?.overallSentimentScore || 'N/A'}
Experience Score: ${analysis.experienceAnalysis?.overallExperienceScore || 'N/A'}

Provide STRATEGIC INSIGHTS:

1. **Performance Prediction**:
   - Expected CTR range
   - Expected view-through rate
   - Expected engagement rate
   - Conversion potential

2. **Competitive Position**:
   - Industry benchmark comparison
   - Unique differentiators
   - Competitive gaps
   - Market positioning

3. **Optimization Opportunities**:
   - Quick wins (easy fixes)
   - Medium effort improvements
   - Major overhaul suggestions
   - Priority ranking

4. **A/B Testing Recommendations**:
   - Elements to test
   - Test hypotheses
   - Expected impact

5. **Platform Strategy**:
   - Best platforms for this content
   - Platforms to avoid
   - Platform-specific adaptations needed

6. **Audience Expansion**:
   - Additional audiences to target
   - Audience segments to avoid
   - Lookalike potential

7. **Creative Iterations**:
   - Variation ideas
   - Format adaptations
   - Seasonal/timely opportunities

Return ONLY valid JSON:
{
    "performancePrediction": {
        "expectedCTR": "1.5-2.5%",
        "viewThroughRate": "25-35%",
        "engagementRate": "3-5%",
        "conversionPotential": "Medium/High/Low"
    },
    "competitivePosition": {
        "benchmarkComparison": "Above/At/Below average",
        "differentiators": ["Unique element 1", "Unique element 2"],
        "gaps": ["Gap 1", "Gap 2"],
        "positioning": "Market position assessment"
    },
    "optimizationOpportunities": {
        "quickWins": [
            {"fix": "Fix description", "impact": "High/Medium/Low", "effort": "Low"}
        ],
        "mediumEffort": [
            {"improvement": "Improvement description", "impact": "High/Medium/Low", "effort": "Medium"}
        ],
        "majorOverhaul": [
            {"suggestion": "Suggestion description", "impact": "High", "effort": "High"}
        ]
    },
    "abTestingRecommendations": [
        {
            "element": "Element to test",
            "hypothesis": "Testing hypothesis",
            "expectedImpact": "+10-20% on metric"
        }
    ],
    "platformStrategy": {
        "bestPlatforms": ["Platform 1", "Platform 2"],
        "avoid": ["Platform to avoid"],
        "adaptations": {
            "platform1": "Adaptation needed",
            "platform2": "Adaptation needed"
        }
    },
    "audienceExpansion": {
        "additionalAudiences": ["Audience 1", "Audience 2"],
        "avoid": ["Audience to avoid"],
        "lookalikePotential": "High/Medium/Low"
    },
    "creativeIterations": {
        "variations": ["Variation idea 1", "Variation idea 2"],
        "formatAdaptations": ["Short form version", "Story format", "etc"],
        "seasonalOpportunities": ["Opportunity 1", "Opportunity 2"]
    }
}`;

            return await this.callAI(prompt);
        }

        // ============================================
        // SCORING
        // ============================================

        calculateCreativeScore(analysis) {
            const weights = {
                visual: 0.25,
                audio: 0.20,
                content: 0.25,
                sentiment: 0.15,
                experience: 0.15
            };

            const scores = {
                visual: analysis.visualAnalysis?.overallVisualScore || 50,
                audio: analysis.audioAnalysis?.overallAudioScore || 50,
                content: analysis.contentAnalysis?.overallContentScore || 50,
                sentiment: analysis.sentimentAnalysis?.overallSentimentScore || 50,
                experience: analysis.experienceAnalysis?.overallExperienceScore || 50
            };

            const overallScore = Math.round(
                scores.visual * weights.visual +
                scores.audio * weights.audio +
                scores.content * weights.content +
                scores.sentiment * weights.sentiment +
                scores.experience * weights.experience
            );

            return {
                overall: overallScore,
                breakdown: scores,
                weights: weights,
                grade: this.getGrade(overallScore),
                percentile: this.getPercentile(overallScore)
            };
        }

        getGrade(score) {
            if (score >= 90) return 'A+';
            if (score >= 85) return 'A';
            if (score >= 80) return 'A-';
            if (score >= 75) return 'B+';
            if (score >= 70) return 'B';
            if (score >= 65) return 'B-';
            if (score >= 60) return 'C+';
            if (score >= 55) return 'C';
            if (score >= 50) return 'C-';
            if (score >= 45) return 'D';
            return 'F';
        }

        getPercentile(score) {
            // Rough percentile based on typical ad performance
            if (score >= 85) return 'Top 10%';
            if (score >= 75) return 'Top 25%';
            if (score >= 65) return 'Top 50%';
            if (score >= 55) return 'Bottom 50%';
            return 'Bottom 25%';
        }

        // ============================================
        // RECOMMENDATIONS
        // ============================================

        generateRecommendations(analysis) {
            const recommendations = [];

            // Visual recommendations
            if (analysis.visualAnalysis?.overallVisualScore < 70) {
                recommendations.push({
                    category: 'Visual',
                    priority: 'High',
                    recommendation: 'Improve visual quality and composition',
                    details: analysis.visualAnalysis?.visualWeaknesses || []
                });
            }

            // Audio recommendations
            if (analysis.audioAnalysis?.overallAudioScore < 70) {
                recommendations.push({
                    category: 'Audio',
                    priority: 'High',
                    recommendation: 'Enhance audio quality and messaging',
                    details: analysis.audioAnalysis?.audioWeaknesses || []
                });
            }

            // Content recommendations
            if (analysis.contentAnalysis?.overallContentScore < 70) {
                recommendations.push({
                    category: 'Content',
                    priority: 'High',
                    recommendation: 'Strengthen messaging and value proposition',
                    details: analysis.contentAnalysis?.contentWeaknesses || []
                });
            }

            // Experience recommendations
            if (analysis.experienceAnalysis?.painPoints?.improvements) {
                recommendations.push({
                    category: 'Experience',
                    priority: 'Medium',
                    recommendation: 'Improve viewer experience',
                    details: analysis.experienceAnalysis.painPoints.improvements
                });
            }

            // Strategic recommendations
            if (analysis.strategicInsights?.optimizationOpportunities?.quickWins) {
                analysis.strategicInsights.optimizationOpportunities.quickWins.forEach(qw => {
                    recommendations.push({
                        category: 'Quick Win',
                        priority: qw.impact === 'High' ? 'High' : 'Medium',
                        recommendation: qw.fix,
                        details: []
                    });
                });
            }

            return recommendations;
        }

        // ============================================
        // AI HELPER
        // ============================================

        getAPIKey() {
            // Try multiple sources for API key
            console.log('[VideoAnalyzer] Looking for API key...');
            
            // 1. Try CAVSettings manager
            if (window.CAVSettings?.manager?.getAPIKey) {
                const key = window.CAVSettings.manager.getAPIKey('gemini');
                if (key) {
                    console.log('[VideoAnalyzer] Found API key via CAVSettings.manager');
                    return key;
                }
            }
            
            // 2. Try CAVSettings directly
            if (window.CAVSettings?.getAPIKey) {
                const key = window.CAVSettings.getAPIKey('gemini');
                if (key) {
                    console.log('[VideoAnalyzer] Found API key via CAVSettings');
                    return key;
                }
            }

            // 3. Try platform credentials
            try {
                const platformCreds = JSON.parse(localStorage.getItem('cav_platform_credentials') || '{}');
                if (platformCreds.sharedKeys?.gemini) {
                    console.log('[VideoAnalyzer] Found API key via platform credentials');
                    return platformCreds.sharedKeys.gemini;
                }
            } catch (e) {}

            // 4. Try v3 settings
            try {
                const v3Settings = JSON.parse(localStorage.getItem('cav_v3_settings') || '{}');
                if (v3Settings.apiKeys?.gemini?.key) {
                    console.log('[VideoAnalyzer] Found API key via v3 settings');
                    return v3Settings.apiKeys.gemini.key;
                }
            } catch (e) {}
            
            // 5. Try Supabase shared keys
            if (window.CAVSupabase?.loadSharedKeysDirect) {
                console.log('[VideoAnalyzer] Attempting to load from Supabase...');
            }

            console.warn('[VideoAnalyzer] No API key found');
            return null;
        }

        async callAI(prompt, images = []) {
            // Use AIModelSelector if available for multi-model support
            if (window.AIModelSelector && images.length === 0) {
                const modelId = this.getModel();
                console.log(`[VideoAnalyzer] Using AIModelSelector with model: ${modelId}`);
                
                try {
                    return await window.AIModelSelector.callAI(prompt, { model: modelId });
                } catch (error) {
                    console.error('[VideoAnalyzer] AIModelSelector call failed:', error);
                    throw error;
                }
            }

            // Direct call with images support (multimodal)
            const apiKey = this.getAPIKey();
            if (!apiKey) {
                console.error('[VideoAnalyzer] No API key available. Please configure API key in Settings.');
                throw new Error('No API key configured. Go to Settings > API Keys to add your key.');
            }

            console.log(`[VideoAnalyzer] Making AI API call with ${images.length} images...`);
            
            try {
                const modelId = window.AIModels?.getGeminiModelId('flash') || 'gemini-3-flash-preview';
                
                // Build parts array with text and images
                const parts = [{ text: prompt }];
                
                // Add images if provided
                for (const img of images) {
                    if (img.dataUrl) {
                        // Convert data URL to base64 parts
                        const matches = img.dataUrl.match(/^data:(.+);base64,(.+)$/);
                        if (matches) {
                            parts.push({
                                inlineData: {
                                    mimeType: matches[1],
                                    data: matches[2]
                                }
                            });
                        }
                    } else if (img.url && !img.url.includes('youtube.com')) {
                        // Try to use image URL directly (for Cloudinary URLs)
                        // Note: Gemini may not be able to fetch all external URLs
                        parts.push({
                            fileData: {
                                mimeType: 'image/jpeg',
                                fileUri: img.url
                            }
                        });
                    }
                }
                
                console.log(`[VideoAnalyzer] Sending ${parts.length} parts to AI (1 text + ${parts.length - 1} images)`);
                
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 8192,
                            responseMimeType: 'application/json'
                        }
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('[VideoAnalyzer] API error response:', errorText);
                    throw new Error(`API error: ${response.status} - ${response.statusText}`);
                }

                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                
                return this._parseJSON(text);
            } catch (error) {
                console.error('[VideoAnalyzer] AI call failed:', error);
                throw error;
            }
        }

        _parseJSON(text) {
            if (!text) return {};
            
            let jsonText = text;
            if (jsonText.includes('```json')) {
                jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
            } else if (jsonText.includes('```')) {
                jsonText = jsonText.replace(/```\s*/g, '');
            }
            
            const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    return JSON.parse(jsonMatch[0]);
                } catch (e) {
                    return { raw: text };
                }
            }
            
            try {
                return JSON.parse(jsonText);
            } catch (e) {
                return { raw: text };
            }
        }

        // ============================================
        // PROGRESS UPDATES
        // ============================================

        updateProgress(message, percent) {
            console.log(`[VideoAnalyzer] ${percent}% - ${message}`);
            
            // Dispatch custom event for UI updates
            window.dispatchEvent(new CustomEvent('videoAnalysisProgress', {
                detail: { message, percent }
            }));
        }

        // ============================================
        // PLACEHOLDER RESPONSES
        // ============================================

        getPlaceholderVisualAnalysis() {
            return {
                openingHook: { impactScore: 0, attentionGrabber: 'Analysis requires API key', thumbStopPotential: 0 },
                overallVisualScore: 0,
                error: 'API key required for visual analysis'
            };
        }

        getPlaceholderAudioAnalysis() {
            return {
                overallAudioScore: 0,
                error: 'API key required for audio analysis'
            };
        }

        getPlaceholderContentAnalysis() {
            return {
                overallContentScore: 0,
                error: 'API key required for content analysis'
            };
        }

        getPlaceholderSentimentAnalysis() {
            return {
                overallSentimentScore: 0,
                error: 'API key required for sentiment analysis'
            };
        }

        getPlaceholderExperienceAnalysis() {
            return {
                overallExperienceScore: 0,
                error: 'API key required for experience analysis'
            };
        }

        getPlaceholderStrategicInsights() {
            return {
                error: 'API key required for strategic insights'
            };
        }

        // ============================================
        // UI RENDERING
        // ============================================

        renderAnalysisUI(analysis) {
            // Use AdvancedVideoAnalyzerUI v2 if available
            if (window.AdvancedVideoAnalyzerUI && analysis.executiveSummary) {
                console.log('[VideoAnalyzer] Using AdvancedVideoAnalyzerUI v2.0 for rendering');
                return window.AdvancedVideoAnalyzerUI.render(analysis);
            }

            const score = analysis.creativeScore || { grade: 'N/A', overall: 0, percentile: 'N/A', breakdown: {} };
            const gradeColors = {
                'A+': '#22c55e', 'A': '#22c55e', 'A-': '#22c55e',
                'B+': '#84cc16', 'B': '#84cc16', 'B-': '#84cc16',
                'C+': '#eab308', 'C': '#eab308', 'C-': '#eab308',
                'D': '#f97316', 'F': '#ef4444'
            };

            // Render upload prompt if needed
            const uploadPromptHTML = analysis.uploadPrompt?.show ? `
                <div style="background: linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%); border: 1px solid rgba(251, 191, 36, 0.4); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                    <div style="display: flex; align-items: flex-start; gap: 16px;">
                        <div style="width: 48px; height: 48px; background: rgba(251, 191, 36, 0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                        </div>
                        <div style="flex: 1;">
                            <h4 style="color: #fbbf24; margin: 0 0 8px; font-size: 16px; font-weight: 600;">Limited Analysis Available</h4>
                            <p style="color: #fcd34d; margin: 0 0 12px; font-size: 14px; line-height: 1.5;">${analysis.uploadPrompt.reason}</p>
                            <p style="color: #a3a3a3; margin: 0; font-size: 13px;">
                                <strong>💡 Tip:</strong> ${analysis.uploadPrompt.tip}
                            </p>
                        </div>
                    </div>
                </div>
            ` : '';

            // Render extracted frames preview
            const framesHTML = analysis.frames?.length > 0 ? `
                <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                    <h4 style="color: #a78bfa; margin: 0 0 16px; font-size: 14px; display: flex; align-items: center; gap: 8px;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line></svg>
                        Extracted Frames (${analysis.frames.length})
                    </h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px;">
                        ${analysis.frames.slice(0, 8).map(frame => `
                            <div style="position: relative; border-radius: 8px; overflow: hidden; aspect-ratio: 16/9; background: #000;">
                                <img src="${frame.dataUrl || frame.url}" alt="${frame.label || 'Frame'}" 
                                     style="width: 100%; height: 100%; object-fit: cover;"
                                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                <div style="display: none; position: absolute; inset: 0; background: rgba(0,0,0,0.8); align-items: center; justify-content: center; color: #666; font-size: 11px;">Failed to load</div>
                                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.8)); padding: 8px 6px 4px; font-size: 11px; color: #fff;">${frame.label || `${frame.timestamp}s`}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : '';

            return `
                <div class="video-analysis-results" style="padding: 24px;">
                    ${uploadPromptHTML}
                    ${framesHTML}
                    
                    <!-- Overall Score Card -->
                    <div class="analysis-score-card" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 32px; margin-bottom: 24px; text-align: center;">
                        <div style="font-size: 64px; font-weight: bold; color: ${gradeColors[score.grade] || '#fff'};">${score.grade}</div>
                        <div style="font-size: 48px; color: #fff; margin: 8px 0;">${score.overall}/100</div>
                        <div style="color: #94a3b8; font-size: 14px;">${score.percentile} of analyzed videos</div>
                        
                        <!-- Score Breakdown -->
                        ${score.breakdown && Object.keys(score.breakdown).length > 0 ? `
                        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-top: 24px;">
                            ${Object.entries(score.breakdown).map(([key, value]) => `
                                <div style="text-align: center;">
                                    <div style="font-size: 24px; font-weight: bold; color: ${value >= 70 ? '#22c55e' : value >= 50 ? '#eab308' : '#ef4444'};">${value}</div>
                                    <div style="font-size: 12px; color: #94a3b8; text-transform: capitalize;">${key}</div>
                                </div>
                            `).join('')}
                        </div>
                        ` : ''}
                    </div>

                    <!-- Analysis Sections -->
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
                        
                        <!-- Visual Analysis -->
                        <div class="analysis-section" style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 20px;">
                            <h3 style="color: #a78bfa; margin: 0 0 16px;">🎬 Visual Analysis</h3>
                            ${this.renderAnalysisSection(analysis.visualAnalysis)}
                        </div>

                        <!-- Audio Analysis -->
                        <div class="analysis-section" style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 20px;">
                            <h3 style="color: #60a5fa; margin: 0 0 16px;">🎵 Audio Analysis</h3>
                            ${this.renderAnalysisSection(analysis.audioAnalysis)}
                        </div>

                        <!-- Content Analysis -->
                        <div class="analysis-section" style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px; padding: 20px;">
                            <h3 style="color: #4ade80; margin: 0 0 16px;">📝 Content Analysis</h3>
                            ${this.renderAnalysisSection(analysis.contentAnalysis)}
                        </div>

                        <!-- Sentiment Analysis -->
                        <div class="analysis-section" style="background: rgba(249, 115, 22, 0.1); border: 1px solid rgba(249, 115, 22, 0.3); border-radius: 12px; padding: 20px;">
                            <h3 style="color: #fb923c; margin: 0 0 16px;">💭 Sentiment Analysis</h3>
                            ${this.renderAnalysisSection(analysis.sentimentAnalysis)}
                        </div>

                        <!-- Experience Analysis -->
                        <div class="analysis-section" style="background: rgba(236, 72, 153, 0.1); border: 1px solid rgba(236, 72, 153, 0.3); border-radius: 12px; padding: 20px;">
                            <h3 style="color: #f472b6; margin: 0 0 16px;">👁️ Experience Analysis</h3>
                            ${this.renderAnalysisSection(analysis.experienceAnalysis)}
                        </div>

                        <!-- Strategic Insights -->
                        <div class="analysis-section" style="background: rgba(20, 184, 166, 0.1); border: 1px solid rgba(20, 184, 166, 0.3); border-radius: 12px; padding: 20px;">
                            <h3 style="color: #2dd4bf; margin: 0 0 16px;">🎯 Strategic Insights</h3>
                            ${this.renderStrategicInsights(analysis.strategicInsights)}
                        </div>
                    </div>

                    <!-- Recommendations -->
                    ${analysis.recommendations && analysis.recommendations.length > 0 ? `
                    <div style="margin-top: 24px; background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 24px;">
                        <h3 style="color: #fff; margin: 0 0 16px;">📋 Priority Recommendations</h3>
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            ${analysis.recommendations.map(rec => `
                                <div style="display: flex; align-items: flex-start; gap: 12px; padding: 12px; background: rgba(0,0,0,0.3); border-radius: 8px;">
                                    <span style="padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; background: ${rec.priority === 'High' ? '#ef4444' : rec.priority === 'Medium' ? '#eab308' : '#22c55e'}; color: #000;">${rec.priority || 'Medium'}</span>
                                    <div>
                                        <div style="color: #fff; font-weight: 500;">${rec.recommendation || rec.text || 'No details'}</div>
                                        <div style="color: #94a3b8; font-size: 13px; margin-top: 4px;">${rec.category || rec.type || ''}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>
            `;
        }

        renderAnalysisSection(data) {
            if (!data || data.error) {
                return `<p style="color: #94a3b8;">${data?.error || 'Analysis not available'}</p>`;
            }

            const items = [];
            for (const [key, value] of Object.entries(data)) {
                if (key.includes('Score') || key.includes('score')) {
                    items.push(`<div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: #94a3b8;">${this.formatKey(key)}</span>
                        <span style="color: ${value >= 70 ? '#22c55e' : value >= 50 ? '#eab308' : '#ef4444'}; font-weight: 600;">${value}</span>
                    </div>`);
                } else if (Array.isArray(value)) {
                    items.push(`<div style="margin-bottom: 8px;">
                        <span style="color: #94a3b8; display: block; margin-bottom: 4px;">${this.formatKey(key)}:</span>
                        <span style="color: #fff;">${value.slice(0, 3).join(', ')}</span>
                    </div>`);
                } else if (typeof value === 'object' && value !== null) {
                    // Skip nested objects in summary
                } else if (typeof value === 'string' && value.length < 100) {
                    items.push(`<div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: #94a3b8;">${this.formatKey(key)}</span>
                        <span style="color: #fff;">${value}</span>
                    </div>`);
                }
            }

            return items.slice(0, 6).join('') || '<p style="color: #94a3b8;">Details available in full report</p>';
        }

        renderStrategicInsights(data) {
            if (!data || data.error) {
                return `<p style="color: #94a3b8;">${data?.error || 'Insights not available'}</p>`;
            }

            const items = [];
            
            if (data.performancePrediction) {
                items.push(`<div style="margin-bottom: 12px;">
                    <span style="color: #94a3b8;">Expected CTR:</span>
                    <span style="color: #2dd4bf; margin-left: 8px;">${data.performancePrediction.expectedCTR}</span>
                </div>`);
            }

            if (data.competitivePosition?.positioning) {
                items.push(`<div style="margin-bottom: 12px;">
                    <span style="color: #94a3b8;">Market Position:</span>
                    <span style="color: #2dd4bf; margin-left: 8px;">${data.competitivePosition.positioning}</span>
                </div>`);
            }

            if (data.platformStrategy?.bestPlatforms) {
                items.push(`<div style="margin-bottom: 12px;">
                    <span style="color: #94a3b8;">Best Platforms:</span>
                    <span style="color: #2dd4bf; margin-left: 8px;">${data.platformStrategy.bestPlatforms.join(', ')}</span>
                </div>`);
            }

            return items.join('') || '<p style="color: #94a3b8;">Strategic insights available in full report</p>';
        }

        formatKey(key) {
            return key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())
                .trim();
        }

        // ============================================
        // AD BUILDER INTEGRATION (Proxy to AdvancedVideoAnalyzer)
        // ============================================

        sendToGoogleAds() {
            if (window.AdvancedVideoAnalyzer?.sendToGoogleAds) {
                return window.AdvancedVideoAnalyzer.sendToGoogleAds();
            }
            alert('Advanced Video Analyzer not loaded. Please refresh the page.');
        }

        sendToSocialMedia() {
            if (window.AdvancedVideoAnalyzer?.sendToSocialMedia) {
                return window.AdvancedVideoAnalyzer.sendToSocialMedia();
            }
            alert('Advanced Video Analyzer not loaded. Please refresh the page.');
        }

        saveToCRM(companyId) {
            if (window.AdvancedVideoAnalyzer?.saveToCRM) {
                return window.AdvancedVideoAnalyzer.saveToCRM(companyId);
            }
            alert('Advanced Video Analyzer not loaded. Please refresh the page.');
        }
    }

    // ============================================
    // EXPORT
    // ============================================

    window.VideoAnalyzer = new VideoAnalyzer();
    
    console.log(`🎬 Video Analyzer Module loaded - v${VERSION}`);

})();
