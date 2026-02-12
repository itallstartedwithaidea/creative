/**
 * AI Intelligence Engine - Creative Asset Validator v4.0
 * Advanced Multi-AI Chained Analysis System
 * 
 * Architecture:
 * 1. GPT-5.2/GPT-4o: Visual extraction (raw data)
 * 2. SearchAPI: Contextual benchmarks & competitor research  
 * 3. Claude Opus 4.5: Strategic synthesis & recommendations
 * 
 * Features:
 * - Chained AI pipeline for unique insights each time
 * - Content-type specific analysis (Video, Motion, Static)
 * - Confidence scoring per AI
 * - Benchmark contextualization
 * - Before/after version tracking
 * - Brand guidelines integration
 * - Audience persona matching
 */

(function() {
    'use strict';

    const ENGINE_VERSION = '4.0.0';

    // ============================================
    // CONTENT TYPE DETECTION
    // ============================================
    
    const CONTENT_TYPES = {
        STATIC: 'static_image',
        VIDEO: 'video',
        MOTION: 'motion_graphics',
        GIF: 'gif'
    };

    function detectContentType(asset) {
        if (!asset) return CONTENT_TYPES.STATIC;
        
        const type = asset.type?.toLowerCase() || '';
        const filename = (asset.filename || asset.name || '').toLowerCase();
        
        if (type.includes('video') || filename.endsWith('.mp4') || filename.endsWith('.mov') || filename.endsWith('.webm')) {
            return CONTENT_TYPES.VIDEO;
        }
        if (filename.endsWith('.gif')) {
            return CONTENT_TYPES.GIF;
        }
        if (asset.isMotionGraphic || asset.hasAnimation) {
            return CONTENT_TYPES.MOTION;
        }
        return CONTENT_TYPES.STATIC;
    }

    // ============================================
    // VISUAL EXTRACTION PROMPTS (GPT-5.2)
    // ============================================
    
    const VISUAL_EXTRACTION_PROMPT = `You are a visual forensics analyst. Extract ONLY observable facts from this creative asset.

Return ONLY valid JSON:
{
    "text_extracted": {
        "headline": "",
        "subhead": "",
        "cta": "",
        "fine_print": "",
        "all_text": []
    },
    "visual_elements": {
        "primary_subject": "",
        "background": "",
        "props": [],
        "composition_type": ""
    },
    "people": {
        "count": 0,
        "eye_contact": false,
        "expressions": [],
        "demographics_apparent": "",
        "positioning": ""
    },
    "colors": {
        "dominant": "#hex",
        "accent": "#hex",
        "text_color": "#hex",
        "background_color": "#hex",
        "palette": []
    },
    "composition": {
        "layout_type": "",
        "focal_point": "",
        "visual_flow": "",
        "rule_of_thirds": false,
        "symmetry": ""
    },
    "brand_signals": {
        "logo_present": false,
        "logo_position": "",
        "brand_colors_detected": [],
        "brand_fonts_detected": false
    },
    "technical": {
        "aspect_ratio": "",
        "estimated_quality": "high|medium|low",
        "has_motion_blur": false,
        "lighting": ""
    },
    "confidence": {
        "text_extraction": 0.95,
        "people_detection": 0.90,
        "color_analysis": 0.98,
        "overall": 0.92
    }
}

Do NOT interpret effectiveness. Do NOT score anything. Just extract observable facts.`;

    // ============================================
    // CONTENT-TYPE SPECIFIC STRATEGIC PROMPTS
    // ============================================
    
    const STRATEGIC_PROMPTS = {
        [CONTENT_TYPES.STATIC]: `This is a STATIC IMAGE. It has ONE chance to stop the scroll.

INSTANT IMPACT ANALYSIS:
- What registers in first 0.5 seconds?
- Is there a clear visual hierarchy (1st, 2nd, 3rd read)?
- Does the eye know where to go?

THUMB-STOP FACTORS:
- Pattern interrupt: Does this break feed monotony?
- Relevance signal: Does target audience recognize "this is for me"?
- Curiosity gap: Is there unresolved tension that demands a click?

COMPETITIVE DIFFERENTIATION:
- Based on similar ads in market, what makes this stand out?
- What's the "only" factor? (Only ad showing X, only one using Y approach)
- Or is this visually generic?`,

        [CONTENT_TYPES.VIDEO]: `This is a VIDEO creative. Analyze with video-specific lens:

OPENING HOOK (0-3 seconds):
- What happens in first frame? Is it scroll-stopping?
- Does motion begin immediately or is there a static intro?
- If there's text, can it be read before average scroll-past time (1.7s)?

RETENTION PREDICTION:
- Frame analysis: What keeps viewer watching?
- Where would drop-off likely occur and why?
- Is there a mid-video hook to recapture attention?

CTA TIMING:
- When does CTA first appear? (timestamp)
- Is that too early (viewer not primed) or too late (already bounced)?
- Does CTA have enough screen time?

SOUND-OFF EFFECTIVENESS:
- Does this work on mute (85% of feed video is watched muted)?
- Are captions present? Readable at speed?
- Does motion carry the message without audio?`,

        [CONTENT_TYPES.MOTION]: `This is MOTION GRAPHICS. Analyze with animation-specific lens:

ANIMATION QUALITY:
- Frame delta analysis: Is motion smooth or choppy?
- Transition variety: Cut, fade, slide, zoom - or repetitive?
- Easing: Does motion feel natural or robotic?

TEXT ANIMATION:
- Words per animation: Can average reader keep up?
- Text screen time: Minimum 2 seconds per text block?
- Animation style: Does it enhance or distract from message?

LOOP ANALYSIS:
- Does final frame connect cleanly to first frame?
- Is there a visible seam or pause?
- Loop duration: Appropriate for platform autoplay rules?

ATTENTION RHYTHM:
- Where are the visual peaks?
- Is there variety or does energy flatline?
- Does pacing match platform expectations?`,

        [CONTENT_TYPES.GIF]: `This is an ANIMATED GIF. Analyze for loop-based impact:

LOOP EFFECTIVENESS:
- Does the animation tell a complete story per loop?
- Is loop length optimal (2-6 seconds)?
- Does seamless looping work or is there jarring reset?

FILE OPTIMIZATION:
- Is this appropriate for GIF format or should be video?
- Color palette optimization potential?
- Frame rate assessment

ATTENTION CAPTURE:
- Does motion naturally draw eye?
- Is the animation addictive/mesmerizing?
- Does it work without context?`
    };

    // ============================================
    // UNIQUE THINKING CONSTRAINTS
    // ============================================
    
    const STRATEGIC_CONSTRAINTS = `
CONSTRAINTS (FOLLOW STRICTLY):
- You MUST reference at least 3 specific visual elements from the extracted data
- You MUST cite at least 1 benchmark from the research data
- Your suggestions MUST be actionable in under 2 hours of design work
- If you give a score above 80, you MUST justify why it's exceptional
- If you give a score below 50, you MUST explain the fatal flaw
- Do NOT use these phrases: "consider adding", "you might want to", "it's important to"
- Instead use: "Add X because Y", "Remove X because Y", "Change X to Y"
- Be specific. Reference the actual elements you see. No generic advice.
- If this creative is similar to 90% of ads, call that out explicitly.`;

    // ============================================
    // AI INTELLIGENCE ENGINE CLASS
    // ============================================

    class AIIntelligenceEngine {
        constructor() {
            this.analysisVersion = 1;
            this.analysisHistory = [];
            this.brandGuidelines = null;
            this.audiencePersona = null;
            this.industryContext = null;
            this.promptVersion = '4.0.0';
            
            // Load persisted settings
            this.loadSettings();
            
            console.log(`🧠 AI Intelligence Engine v${ENGINE_VERSION} initialized`);
        }

        loadSettings() {
            try {
                const settings = JSON.parse(localStorage.getItem('cav_ai_intelligence_settings') || '{}');
                this.brandGuidelines = settings.brandGuidelines || null;
                this.audiencePersona = settings.audiencePersona || null;
                this.industryContext = settings.industryContext || null;
            } catch (e) {
                console.warn('[AIEngine] Failed to load settings:', e);
            }
        }

        saveSettings() {
            try {
                localStorage.setItem('cav_ai_intelligence_settings', JSON.stringify({
                    brandGuidelines: this.brandGuidelines,
                    audiencePersona: this.audiencePersona,
                    industryContext: this.industryContext
                }));
            } catch (e) {
                console.warn('[AIEngine] Failed to save settings:', e);
            }
        }

        // ============================================
        // BRAND GUIDELINES MANAGEMENT
        // ============================================

        setBrandGuidelines(guidelines) {
            this.brandGuidelines = {
                name: guidelines.name || 'Unknown Brand',
                primaryColors: guidelines.primaryColors || [],
                secondaryColors: guidelines.secondaryColors || [],
                fonts: guidelines.fonts || [],
                logoUsage: guidelines.logoUsage || '',
                toneOfVoice: guidelines.toneOfVoice || '',
                doNots: guidelines.doNots || [],
                requiredElements: guidelines.requiredElements || [],
                uploadedAt: new Date().toISOString()
            };
            this.saveSettings();
            console.log('[AIEngine] Brand guidelines set:', this.brandGuidelines.name);
            return this.brandGuidelines;
        }

        getBrandGuidelines() {
            return this.brandGuidelines;
        }

        // ============================================
        // AUDIENCE PERSONA MANAGEMENT
        // ============================================

        setAudiencePersona(persona) {
            this.audiencePersona = {
                name: persona.name || 'Target Audience',
                demographics: {
                    age: persona.ageRange || '25-45',
                    gender: persona.gender || 'All',
                    income: persona.income || 'Middle to upper',
                    location: persona.location || 'United States'
                },
                psychographics: {
                    interests: persona.interests || [],
                    values: persona.values || [],
                    painPoints: persona.painPoints || [],
                    goals: persona.goals || []
                },
                behavioralTraits: persona.behaviors || [],
                preferredPlatforms: persona.platforms || ['Instagram', 'Facebook', 'TikTok'],
                uploadedAt: new Date().toISOString()
            };
            this.saveSettings();
            console.log('[AIEngine] Audience persona set:', this.audiencePersona.name);
            return this.audiencePersona;
        }

        getAudiencePersona() {
            return this.audiencePersona;
        }

        // ============================================
        // INDUSTRY CONTEXT
        // ============================================

        setIndustryContext(industry, competitors = []) {
            this.industryContext = {
                industry: industry,
                competitors: competitors,
                setAt: new Date().toISOString()
            };
            this.saveSettings();
            return this.industryContext;
        }

        // ============================================
        // STEP 1: VISUAL EXTRACTION (GPT-5.2)
        // ============================================

        async extractVisualData(imageBase64, contentType) {
            console.log('[AIEngine] Step 1: Visual extraction with GPT...');
            
            const orchestrator = window.AIOrchestrator;
            if (!orchestrator) throw new Error('AI Orchestrator not available');

            // GPT is best for visual extraction
            let result;
            if (orchestrator.isProviderAvailable('openai')) {
                result = await orchestrator.callOpenAI(VISUAL_EXTRACTION_PROMPT, { 
                    image: imageBase64,
                    temperature: 0.1, // Low temp for factual extraction
                    model: 'gpt-5.2-2025-12-11' // Latest GPT-5.2 flagship model
                });
            } else if (orchestrator.isProviderAvailable('gemini')) {
                result = await orchestrator.callGemini(VISUAL_EXTRACTION_PROMPT, { 
                    image: imageBase64 
                });
            } else {
                throw new Error('No vision-capable AI provider available');
            }

            const extracted = this.parseJSON(result.content);
            extracted._extractedBy = 'gpt-5.2-2025-12-11';
            extracted._extractedAt = new Date().toISOString();
            extracted._contentType = contentType;
            
            console.log('[AIEngine] Visual extraction complete:', extracted?.confidence?.overall || 'N/A');
            return extracted;
        }

        // ============================================
        // STEP 2: CONTEXTUAL RESEARCH (SearchAPI)
        // ============================================

        async fetchBenchmarksAndContext(visualData, asset) {
            console.log('[AIEngine] Step 2: Fetching benchmarks with SearchAPI...');
            
            const orchestrator = window.AIOrchestrator;
            const searchResults = {
                benchmarks: null,
                competitorAds: null,
                bestPractices: null,
                _researchedAt: new Date().toISOString()
            };

            if (!orchestrator?.isProviderAvailable('searchapi')) {
                console.warn('[AIEngine] SearchAPI not available, skipping benchmark research');
                return searchResults;
            }

            try {
                // Determine industry from visual data or context
                const industry = this.industryContext?.industry || 
                                 visualData.brand_signals?.industry || 
                                 'general marketing';
                
                // Query 1: Industry benchmarks
                const benchmarkQuery = `${industry} advertising benchmarks CTR CPM engagement rate 2024 2025`;
                const benchmarks = await orchestrator.searchWeb(benchmarkQuery, 'benchmark_research');
                searchResults.benchmarks = this.extractBenchmarkData(benchmarks);

                // Query 2: Competitor ads (if competitors defined)
                if (this.industryContext?.competitors?.length > 0) {
                    const competitor = this.industryContext.competitors[0];
                    const competitorQuery = `${competitor} ads creative examples`;
                    searchResults.competitorAds = await orchestrator.searchWeb(competitorQuery, 'competitor_ads');
                }

                // Query 3: Best practices for content type
                const contentType = visualData._contentType;
                const practicesQuery = `${contentType} advertising best practices ${new Date().getFullYear()}`;
                searchResults.bestPractices = await orchestrator.searchWeb(practicesQuery, 'best_practices');

            } catch (error) {
                console.warn('[AIEngine] SearchAPI research failed:', error);
            }

            console.log('[AIEngine] Benchmark research complete');
            return searchResults;
        }

        extractBenchmarkData(searchResults) {
            if (!searchResults?.results) return null;
            
            // Extract numeric benchmarks from search results
            const benchmarks = {
                ctr: { average: null, good: null, excellent: null },
                cpm: { average: null, low: null, high: null },
                engagementRate: { average: null, good: null },
                viewThroughRate: { average: null },
                sources: []
            };

            // Parse search results for benchmark numbers
            searchResults.results?.forEach(result => {
                const text = (result.snippet || '') + ' ' + (result.title || '');
                
                // Extract CTR mentions
                const ctrMatch = text.match(/(\d+\.?\d*)%?\s*CTR/i);
                if (ctrMatch) {
                    benchmarks.ctr.average = parseFloat(ctrMatch[1]);
                }
                
                // Extract CPM mentions
                const cpmMatch = text.match(/\$?(\d+\.?\d*)\s*CPM/i);
                if (cpmMatch) {
                    benchmarks.cpm.average = parseFloat(cpmMatch[1]);
                }

                benchmarks.sources.push({
                    title: result.title,
                    url: result.url
                });
            });

            return benchmarks;
        }

        // ============================================
        // STEP 3: STRATEGIC SYNTHESIS (Claude Opus)
        // ============================================

        async synthesizeStrategy(visualData, researchData, asset) {
            console.log('[AIEngine] Step 3: Strategic synthesis with Claude...');
            
            const orchestrator = window.AIOrchestrator;
            if (!orchestrator) throw new Error('AI Orchestrator not available');

            const contentType = detectContentType(asset);
            const contentPrompt = STRATEGIC_PROMPTS[contentType] || STRATEGIC_PROMPTS[CONTENT_TYPES.STATIC];

            // Build comprehensive context for Claude
            const strategicPrompt = `You are a senior paid media strategist with 15 years experience. You've seen thousands of ads perform and fail.

## CONTEXT

### Raw Visual Data (extracted by GPT-5.2, treat as factual):
${JSON.stringify(visualData, null, 2)}

### Market Research & Benchmarks:
${JSON.stringify(researchData, null, 2)}

### Content Type: ${contentType}

${this.brandGuidelines ? `### Brand Guidelines:
${JSON.stringify(this.brandGuidelines, null, 2)}` : ''}

${this.audiencePersona ? `### Target Audience Persona:
${JSON.stringify(this.audiencePersona, null, 2)}` : ''}

## ANALYSIS FRAMEWORK

${contentPrompt}

${STRATEGIC_CONSTRAINTS}

## OUTPUT FORMAT

For each scoring category, SHOW YOUR REASONING before giving a score.
What specific elements support or hurt this score?
How does this compare to what's working in the market right now?
What would you change and why?

Return ONLY valid JSON:
{
    "overallScore": 75,
    "hookAnalysis": {
        "score": 70,
        "reasoning": "Specific reasoning referencing visual elements...",
        "thumbStopPotential": "medium",
        "firstSecondImpact": "Description of what happens in first second"
    },
    "ctaAudit": {
        "score": 65,
        "reasoning": "Specific reasoning...",
        "ctaDetected": true,
        "ctaText": "...",
        "ctaType": "hard|soft|engagement|none",
        "timingAssessment": "For video only"
    },
    "brandCompliance": {
        "score": 80,
        "reasoning": "Based on provided brand guidelines...",
        "colorMatch": true,
        "voiceMatch": true,
        "violations": []
    },
    "performancePrediction": {
        "ctrRange": { "low": 0.5, "expected": 1.2, "high": 2.1 },
        "cpmRange": { "low": 8, "expected": 12, "high": 18 },
        "engagementPrediction": "medium",
        "confidence": 0.75,
        "keyFactors": ["Factor 1", "Factor 2"]
    },
    "platformFit": {
        "meta": { "score": 85, "ready": true, "notes": "" },
        "tiktok": { "score": 60, "ready": false, "notes": "Too polished for TikTok aesthetic" },
        "youtube": { "score": 75, "ready": true, "notes": "" },
        "linkedin": { "score": 70, "ready": true, "notes": "" },
        "googleAds": { "score": 80, "ready": true, "notes": "" }
    },
    "competitiveDifferentiation": {
        "standoutFactor": "What makes this unique",
        "genericityRisk": "low|medium|high",
        "marketPositioning": "Description"
    },
    "actionableRecommendations": [
        {
            "action": "Add X because Y",
            "priority": "high|medium|low",
            "estimatedImpact": "+15% CTR",
            "timeToImplement": "30 minutes"
        }
    ],
    "contentTypeSpecific": {
        // For video: retention curve, sound-off viability
        // For motion: animation quality, loop analysis
        // For static: visual hierarchy, pattern interrupt
    },
    "accessibilityAudit": {
        "colorContrastOK": true,
        "textReadability": "good|needs-improvement|poor",
        "captionsPresent": false,
        "altTextSuggestion": "..."
    },
    "complianceFlags": {
        "disclaimerNeeded": false,
        "testimonialDisclosure": false,
        "platformPolicyRisks": []
    },
    "analysisMetadata": {
        "promptVersion": "${this.promptVersion}",
        "analyzedAt": "${new Date().toISOString()}",
        "analyzedBy": "claude-opus-4-5-20250929",
        "confidenceLevel": 0.85
    }
}`;

            let result;
            if (orchestrator.isProviderAvailable('claude')) {
                result = await orchestrator.callClaude(strategicPrompt, {
                    temperature: 0.4,
                    model: 'claude-sonnet-4-5-20250929'
                });
            } else if (orchestrator.isProviderAvailable('openai')) {
                // Fallback to OpenAI for strategic analysis
                result = await orchestrator.callOpenAI(strategicPrompt, {
                    temperature: 0.4
                });
            } else {
                throw new Error('No strategic AI provider available');
            }

            const synthesis = this.parseJSON(result.content);
            console.log('[AIEngine] Strategic synthesis complete, overall score:', synthesis?.overallScore);
            
            return synthesis;
        }

        // ============================================
        // FULL CHAINED ANALYSIS PIPELINE
        // ============================================

        async analyzeCreative(asset, imageBase64) {
            const startTime = Date.now();
            const contentType = detectContentType(asset);
            
            console.log(`🧠 [AIEngine] Starting chained analysis for ${contentType}...`);
            
            const analysis = {
                assetId: asset.id,
                assetFilename: asset.filename,
                contentType: contentType,
                analysisVersion: this.analysisVersion,
                promptVersion: this.promptVersion,
                startedAt: new Date().toISOString(),
                
                // Step results
                visualExtraction: null,
                researchContext: null,
                strategicSynthesis: null,
                
                // Pipeline metadata
                pipelineSteps: [],
                errors: [],
                processingTime: 0
            };

            try {
                // STEP 1: Visual Extraction (GPT)
                const step1Start = Date.now();
                analysis.visualExtraction = await this.extractVisualData(imageBase64, contentType);
                analysis.pipelineSteps.push({
                    step: 'visual_extraction',
                    provider: 'gpt-5.2-2025-12-11',
                    duration: Date.now() - step1Start,
                    success: true
                });

                // STEP 2: Benchmark Research (SearchAPI)
                const step2Start = Date.now();
                analysis.researchContext = await this.fetchBenchmarksAndContext(
                    analysis.visualExtraction, 
                    asset
                );
                analysis.pipelineSteps.push({
                    step: 'benchmark_research',
                    provider: 'searchapi',
                    duration: Date.now() - step2Start,
                    success: !!analysis.researchContext?.benchmarks
                });

                // STEP 3: Strategic Synthesis (Claude)
                const step3Start = Date.now();
                analysis.strategicSynthesis = await this.synthesizeStrategy(
                    analysis.visualExtraction,
                    analysis.researchContext,
                    asset
                );
                analysis.pipelineSteps.push({
                    step: 'strategic_synthesis',
                    provider: 'claude-opus-4-5-20250929',
                    duration: Date.now() - step3Start,
                    success: true
                });

            } catch (error) {
                console.error('[AIEngine] Analysis pipeline error:', error);
                analysis.errors.push({
                    step: 'pipeline',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }

            analysis.processingTime = Date.now() - startTime;
            analysis.completedAt = new Date().toISOString();

            // Save to history for version tracking
            this.saveToHistory(analysis);

            console.log(`🧠 [AIEngine] Analysis complete in ${analysis.processingTime}ms`);
            return analysis;
        }

        // ============================================
        // VERSION TRACKING & HISTORY
        // ============================================

        saveToHistory(analysis) {
            // Keep analysis history for before/after comparison
            this.analysisHistory.push({
                assetId: analysis.assetId,
                analysisVersion: analysis.analysisVersion,
                overallScore: analysis.strategicSynthesis?.overallScore,
                completedAt: analysis.completedAt,
                promptVersion: analysis.promptVersion
            });

            // Keep last 50 analyses
            if (this.analysisHistory.length > 50) {
                this.analysisHistory = this.analysisHistory.slice(-50);
            }

            // Persist to localStorage
            try {
                const prefix = this.getStoragePrefix();
                localStorage.setItem(`${prefix}analysis_history`, JSON.stringify(this.analysisHistory));
            } catch (e) {
                console.warn('[AIEngine] Failed to save history:', e);
            }
        }

        getPreviousAnalysis(assetId) {
            return this.analysisHistory.filter(a => a.assetId === assetId);
        }

        compareVersions(assetId) {
            const versions = this.getPreviousAnalysis(assetId);
            if (versions.length < 2) return null;

            const latest = versions[versions.length - 1];
            const previous = versions[versions.length - 2];

            return {
                assetId,
                scoreDelta: latest.overallScore - previous.overallScore,
                previousScore: previous.overallScore,
                currentScore: latest.overallScore,
                previousVersion: previous.analysisVersion,
                currentVersion: latest.analysisVersion,
                trend: latest.overallScore > previous.overallScore ? 'improving' : 'declining'
            };
        }

        getStoragePrefix() {
            try {
                const session = JSON.parse(localStorage.getItem('cav_user_session') || 'null');
                if (session?.email) {
                    return `cav_ai_engine_${session.email.toLowerCase().replace(/[^a-z0-9]/g, '_')}_`;
                }
            } catch (e) {}
            return 'cav_ai_engine_anonymous_';
        }

        // ============================================
        // QUICK CLASSIFICATION (GPT-4o-mini)
        // ============================================

        async quickClassify(imageBase64) {
            const prompt = `Quickly classify this creative asset:

Return ONLY valid JSON:
{
    "type": "ugc|testimonial|product_shot|lifestyle|animation|graphic|other",
    "format": "image|video|gif|carousel",
    "mood": "professional|casual|urgent|aspirational|educational",
    "industry": "auto-detect industry",
    "tags": ["tag1", "tag2", "tag3"]
}`;

            const orchestrator = window.AIOrchestrator;
            if (orchestrator?.isProviderAvailable('openai')) {
                const result = await orchestrator.callOpenAI(prompt, {
                    image: imageBase64,
                    model: 'gpt-5-mini', // Fast, efficient GPT-5 Mini model
                    temperature: 0.2
                });
                return this.parseJSON(result.content);
            }
            return null;
        }

        // ============================================
        // DERIVATIVE SUGGESTIONS
        // ============================================

        async generateDerivatives(analysis) {
            if (!analysis?.strategicSynthesis) return null;

            const prompt = `Based on this creative analysis, suggest derivatives and repurposing opportunities:

Original Analysis:
${JSON.stringify(analysis.strategicSynthesis, null, 2)}

Content Type: ${analysis.contentType}

Suggest:
1. How to repurpose for different platforms
2. A/B test variants to try
3. Format conversions (static→video, video→gif, etc.)
4. Headline/CTA variants

Return JSON:
{
    "platformRepurposing": [
        { "targetPlatform": "", "modification": "", "expectedLift": "" }
    ],
    "abTestVariants": [
        { "hypothesis": "", "change": "", "measureBy": "" }
    ],
    "formatConversions": [
        { "from": "", "to": "", "approach": "" }
    ],
    "copyVariants": [
        { "original": "", "variant": "", "rationale": "" }
    ]
}`;

            const orchestrator = window.AIOrchestrator;
            if (orchestrator?.isProviderAvailable('claude')) {
                const result = await orchestrator.callClaude(prompt, { temperature: 0.5 });
                return this.parseJSON(result.content);
            }
            return null;
        }

        // ============================================
        // UTILITIES
        // ============================================

        parseJSON(content) {
            if (!content) return null;
            try {
                // Handle markdown code blocks
                const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[1]);
                }
                return JSON.parse(content);
            } catch (e) {
                console.warn('[AIEngine] JSON parse failed:', e);
                return null;
            }
        }

        // Get summary for UI display
        getAnalysisSummary(analysis) {
            if (!analysis?.strategicSynthesis) return null;

            const synth = analysis.strategicSynthesis;
            return {
                overallScore: synth.overallScore,
                hookScore: synth.hookAnalysis?.score,
                ctaScore: synth.ctaAudit?.score,
                brandScore: synth.brandCompliance?.score,
                topRecommendation: synth.actionableRecommendations?.[0]?.action,
                predictedCTR: synth.performancePrediction?.ctrRange?.expected,
                bestPlatform: this.findBestPlatform(synth.platformFit),
                processingTime: analysis.processingTime,
                contentType: analysis.contentType
            };
        }

        findBestPlatform(platformFit) {
            if (!platformFit) return null;
            let best = { platform: null, score: 0 };
            for (const [platform, data] of Object.entries(platformFit)) {
                if (data.score > best.score) {
                    best = { platform, score: data.score };
                }
            }
            return best.platform;
        }
    }

    // ============================================
    // INITIALIZE & EXPORT
    // ============================================

    const engine = new AIIntelligenceEngine();

    window.CAVAIEngine = {
        engine,
        version: ENGINE_VERSION,
        
        // Core analysis
        analyze: (asset, imageBase64) => engine.analyzeCreative(asset, imageBase64),
        quickClassify: (imageBase64) => engine.quickClassify(imageBase64),
        
        // Context management
        setBrandGuidelines: (guidelines) => engine.setBrandGuidelines(guidelines),
        getBrandGuidelines: () => engine.getBrandGuidelines(),
        setAudiencePersona: (persona) => engine.setAudiencePersona(persona),
        getAudiencePersona: () => engine.getAudiencePersona(),
        setIndustryContext: (industry, competitors) => engine.setIndustryContext(industry, competitors),
        
        // Version tracking
        getPreviousAnalysis: (assetId) => engine.getPreviousAnalysis(assetId),
        compareVersions: (assetId) => engine.compareVersions(assetId),
        
        // Derivatives
        generateDerivatives: (analysis) => engine.generateDerivatives(analysis),
        
        // Utilities
        detectContentType: detectContentType,
        getAnalysisSummary: (analysis) => engine.getAnalysisSummary(analysis),
        
        // Constants
        CONTENT_TYPES
    };

    console.log(`🧠 AI Intelligence Engine v${ENGINE_VERSION} loaded`);
    console.log('   Features: Chained Analysis, Content-Type Prompts, Version Tracking');
    console.log('   Pipeline: GPT-5.2 → SearchAPI → Claude Opus 4.5');

})();

