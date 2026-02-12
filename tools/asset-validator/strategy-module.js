/**
 * Strategy Module - Creative Asset Validator v3.0.7
 * Deployment Planning with Placement Matrix, Derivative Roadmap,
 * Budget Allocation, A/B Test Recommendations, and Creative Fatigue Prediction
 * 
 * v3.0.7 FIXES:
 * - Persist strategy results to localStorage
 * - Save strategy history across sessions
 * - Link strategies to CRM projects
 * - Load previous strategies
 */

(function() {
    'use strict';

    const STRATEGY_VERSION = '3.0.9';
    
    // User-specific storage key prefix
    function getStrategyStoragePrefix() {
        const session = JSON.parse(localStorage.getItem('cav_user_session') || 'null');
        if (session?.email) {
            const userKey = session.email.toLowerCase().replace(/[^a-z0-9]/g, '_');
            return `cav_strategy_${userKey}_`;
        }
        return 'cav_strategy_anonymous_';
    }
    
    // Dynamic storage keys - user-specific
    const STORAGE_KEYS = {
        get STRATEGY_HISTORY() { return `${getStrategyStoragePrefix()}history`; },
        get CURRENT_STRATEGY() { return `${getStrategyStoragePrefix()}current`; },
    };

    // Platform configurations for placement matrix
    const PLATFORM_CONFIG = {
        'meta_feed': { platform: 'Meta', placement: 'Feed', ratios: ['1:1', '4:5', '16:9'], formats: ['image', 'video'], maxDuration: 241 },
        'meta_stories': { platform: 'Meta', placement: 'Stories', ratios: ['9:16'], formats: ['image', 'video'], maxDuration: 120 },
        'meta_reels': { platform: 'Meta', placement: 'Reels', ratios: ['9:16'], formats: ['video'], maxDuration: 90 },
        'instagram_feed': { platform: 'Instagram', placement: 'Feed', ratios: ['1:1', '4:5'], formats: ['image', 'video'], maxDuration: 60 },
        'instagram_reels': { platform: 'Instagram', placement: 'Reels', ratios: ['9:16'], formats: ['video'], maxDuration: 90 },
        'tiktok': { platform: 'TikTok', placement: 'For You', ratios: ['9:16'], formats: ['video'], maxDuration: 60 },
        'youtube_standard': { platform: 'YouTube', placement: 'In-Stream', ratios: ['16:9'], formats: ['video'], minDuration: 6 },
        'youtube_shorts': { platform: 'YouTube', placement: 'Shorts', ratios: ['9:16'], formats: ['video'], maxDuration: 60 },
        'linkedin_feed': { platform: 'LinkedIn', placement: 'Feed', ratios: ['1.91:1', '1:1', '4:5'], formats: ['image', 'video'], maxDuration: 600 },
        'twitter_feed': { platform: 'X (Twitter)', placement: 'Feed', ratios: ['16:9', '1:1'], formats: ['image', 'video'], maxDuration: 140 },
        'google_display': { platform: 'Google Ads', placement: 'Display', ratios: ['1.91:1', '1:1'], formats: ['image'], sizes: ['300x250', '728x90', '160x600'] },
        'google_video': { platform: 'Google Ads', placement: 'Video', ratios: ['16:9', '1:1', '9:16'], formats: ['video'], minDuration: 10 },
        'pinterest': { platform: 'Pinterest', placement: 'Pin', ratios: ['2:3', '1:1'], formats: ['image', 'video'] },
        'snapchat': { platform: 'Snapchat', placement: 'Stories', ratios: ['9:16'], formats: ['image', 'video'], maxDuration: 180 }
    };

    // ============================================
    // STRATEGY MODULE CLASS
    // ============================================

    class StrategyModule {
        constructor() {
            this.currentAsset = null;
            this.currentStrategy = this.loadCurrentStrategy();
            this.strategyHistory = this.loadStrategyHistory();
            
            console.log(`[Strategy] Initialized v${STRATEGY_VERSION} - ${this.strategyHistory.length} strategies in history`);
        }
        
        // Load current strategy from storage
        loadCurrentStrategy() {
            try {
                return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_STRATEGY) || 'null');
            } catch {
                return null;
            }
        }
        
        // Save current strategy to storage
        saveCurrentStrategy(strategy) {
            try {
                localStorage.setItem(STORAGE_KEYS.CURRENT_STRATEGY, JSON.stringify(strategy));
            } catch (e) {
                console.warn('[Strategy] Failed to save current strategy:', e);
            }
        }
        
        // Load strategy history from storage
        loadStrategyHistory() {
            try {
                return JSON.parse(localStorage.getItem(STORAGE_KEYS.STRATEGY_HISTORY) || '[]');
            } catch {
                return [];
            }
        }
        
        // Save strategy to history
        saveStrategyToHistory(strategy) {
            // Remove any existing strategy for this asset
            this.strategyHistory = this.strategyHistory.filter(s => s.assetId !== strategy.assetId);
            
            // Add new strategy at the beginning
            this.strategyHistory.unshift(strategy);
            
            // Keep last 50 strategies
            if (this.strategyHistory.length > 50) {
                this.strategyHistory = this.strategyHistory.slice(0, 50);
            }
            
            // Save to localStorage
            try {
                localStorage.setItem(STORAGE_KEYS.STRATEGY_HISTORY, JSON.stringify(this.strategyHistory));
                
                // Also save to unified storage for cross-device sync
                if (window.UnifiedStorage) {
                    window.UnifiedStorage.saveStrategy({
                        ...strategy,
                        id: strategy.id || strategy.assetId || `strategy_${Date.now()}`
                    }).catch(e => console.warn('[Strategy] Unified storage save failed:', e));
                }
            } catch (e) {
                console.warn('[Strategy] Failed to save strategy history:', e);
            }
        }
        
        // Get strategy for an asset from cache
        getStrategyForAsset(assetId) {
            return this.strategyHistory.find(s => s.assetId === assetId);
        }
        
        // Link strategy to CRM
        async linkStrategyToCRM(strategy, asset) {
            if (!window.cavCRM) return null;
            
            try {
                // Find or create project for this asset
                let project = null;
                
                // Check if asset has a linked company
                const companies = Object.values(window.cavCRM.companies || {});
                for (const company of companies) {
                    if (company.linkedAssets?.includes(asset.id)) {
                        // Found company, get or create project
                        const projects = window.cavCRM.getAllProjects({ client: company.id });
                        project = projects.find(p => p.status === 'active') || projects[0];
                        
                        if (!project) {
                            project = window.cavCRM.createProject({
                                name: `${company.name} Strategy`,
                                client: company.id,
                                clientName: company.name,
                                type: 'campaign',
                                status: 'active',
                                description: 'Auto-created from strategy generation'
                            });
                        }
                        break;
                    }
                }
                
                if (project) {
                    // Link asset to project
                    window.cavCRM.linkAssetToProject(project.id, asset.id);
                    
                    // Log activity
                    window.cavCRM.logActivity('strategy_generated', {
                        assetId: asset.id,
                        assetFilename: asset.filename,
                        projectId: project.id,
                        projectName: project.name,
                        readyPlacements: strategy.placementMatrix?.placements?.filter(p => p.specMatch === 'ready').length || 0,
                        derivativesNeeded: strategy.derivativeRoadmap?.derivatives?.length || 0
                    });
                    
                    return { projectId: project.id };
                }
            } catch (e) {
                console.warn('[Strategy] CRM linking error:', e);
            }
            return null;
        }

        // ============================================
        // PLACEMENT MATRIX ENGINE
        // ============================================

        async generatePlacementMatrix(asset, analysis = null) {
            const placements = [];
            const assetRatio = asset.width && asset.height ? this.calculateAspectRatio(asset.width, asset.height) : null;
            const assetType = asset.type || (asset.duration ? 'video' : 'image');

            for (const [key, config] of Object.entries(PLATFORM_CONFIG)) {
                const placement = {
                    platform: config.platform,
                    placement: config.placement,
                    key: key,
                    specMatch: 'incompatible',
                    specIssues: [],
                    creativeFit: 0,
                    fitFactors: {
                        platformCulture: 50,
                        audienceAlignment: 50,
                        formatOptimization: 50,
                        algorithmPreference: 50
                    },
                    predictedPerformance: 'medium',
                    recommendedAction: 'avoid',
                    priority: 0
                };

                // Check format compatibility
                if (!config.formats.includes(assetType)) {
                    placement.specIssues.push(`Requires ${config.formats.join(' or ')}, got ${assetType}`);
                }

                // Check aspect ratio
                if (assetRatio && config.ratios) {
                    const ratioMatch = config.ratios.some(r => this.ratioMatches(assetRatio, r));
                    if (!ratioMatch) {
                        placement.specIssues.push(`Needs ${config.ratios.join(' or ')}, got ${assetRatio}`);
                    }
                }

                // Check duration for videos
                if (assetType === 'video' && asset.duration) {
                    if (config.maxDuration && asset.duration > config.maxDuration) {
                        placement.specIssues.push(`Max ${config.maxDuration}s, got ${asset.duration}s`);
                    }
                    if (config.minDuration && asset.duration < config.minDuration) {
                        placement.specIssues.push(`Min ${config.minDuration}s, got ${asset.duration}s`);
                    }
                }

                // Determine spec match status
                if (placement.specIssues.length === 0) {
                    placement.specMatch = 'ready';
                    placement.recommendedAction = 'download';
                    placement.priority = 1;
                } else if (placement.specIssues.length === 1 && placement.specIssues[0] && !placement.specIssues[0].includes('Requires')) {
                    placement.specMatch = 'needs-work';
                    placement.recommendedAction = 'create-derivative';
                    placement.priority = 2;
                } else {
                    placement.specMatch = 'incompatible';
                    placement.recommendedAction = 'avoid';
                    placement.priority = 3;
                }

                placements.push(placement);
            }

            // If we have AI analysis, get creative fit scores
            if (analysis && window.AIOrchestrator?.isProviderAvailable('claude')) {
                try {
                    const fitScores = await this.getCreativeFitScores(asset, analysis, placements);
                    placements.forEach((p, i) => {
                        if (fitScores[i]) {
                            p.creativeFit = fitScores[i].creativeFit || p.creativeFit;
                            p.fitFactors = fitScores[i].fitFactors || p.fitFactors;
                            p.predictedPerformance = fitScores[i].predictedPerformance || p.predictedPerformance;
                        }
                    });
                } catch (e) {
                    console.warn('[Strategy] Could not get AI fit scores:', e);
                }
            }

            // Sort by priority and fit
            placements.sort((a, b) => {
                if (a.priority !== b.priority) return a.priority - b.priority;
                return b.creativeFit - a.creativeFit;
            });

            return window.CAVDataModels?.PlacementMatrix?.create({
                assetId: asset.id,
                placements
            }) || { assetId: asset.id, placements };
        }

        async getCreativeFitScores(asset, analysis, placements) {
            const prompt = `Based on this creative asset analysis, score the creative fit for each platform placement.

Asset Analysis:
${JSON.stringify({
    hookScore: analysis.hookAnalysis?.overallScore,
    ctaScore: analysis.ctaAnalysis?.overallEffectiveness,
    thumbStopScore: analysis.thumbStopScore?.overallScore,
    brandCompliance: analysis.brandCompliance?.overallCompliance
}, null, 2)}

Placements to score:
${placements.map(p => `- ${p.platform} ${p.placement}`).join('\n')}

For each placement, provide:
1. creativeFit (0-100): How well the creative style matches the platform
2. fitFactors: platformCulture, audienceAlignment, formatOptimization, algorithmPreference (each 0-100)
3. predictedPerformance: "high", "medium", or "low"

Consider:
- TikTok: casual, authentic, trending sounds, fast-paced
- LinkedIn: professional, educational, thought leadership
- Instagram: aesthetic, polished, lifestyle
- YouTube: longer form, informative, entertainment
- Meta Feed: broad appeal, clear messaging
- Google Ads: direct response, clear CTA

Return ONLY valid JSON array:
[
    {
        "platform": "Meta",
        "placement": "Feed",
        "creativeFit": 75,
        "fitFactors": {
            "platformCulture": 80,
            "audienceAlignment": 70,
            "formatOptimization": 75,
            "algorithmPreference": 72
        },
        "predictedPerformance": "medium"
    }
]`;

            const result = await window.AIOrchestrator.callClaude(prompt, { temperature: 0.3 });
            return this.parseJSON(result.content) || [];
        }

        // ============================================
        // DERIVATIVE ROADMAP GENERATOR
        // ============================================

        async generateDerivativeRoadmap(asset, placementMatrix = null) {
            if (!placementMatrix) {
                placementMatrix = await this.generatePlacementMatrix(asset);
            }

            const derivatives = [];
            const neededRatios = new Set();
            const neededDurations = new Set();

            // Analyze what's needed
            placementMatrix.placements.forEach(p => {
                if (p.specMatch === 'needs-work' || p.specMatch === 'incompatible') {
                    p.specIssues.forEach(issue => {
                        // Extract needed ratios
                        const ratioMatch = issue.match(/Needs ([\d:, \/or]+)/);
                        if (ratioMatch) {
                            ratioMatch[1].split(/,| or /).forEach(r => neededRatios.add(r.trim()));
                        }
                        // Extract needed durations
                        const durationMatch = issue.match(/(Max|Min) (\d+)s/);
                        if (durationMatch) {
                            neededDurations.add({ type: durationMatch[1].toLowerCase(), value: parseInt(durationMatch[2]) });
                        }
                    });
                }
            });

            const currentRatio = this.calculateAspectRatio(asset.width, asset.height);

            // Create derivative entries for needed ratios
            const ratioDerivatives = {
                '9:16': { name: 'Vertical (9:16)', placements: ['Stories', 'Reels', 'TikTok', 'Shorts'], priority: 'critical' },
                '1:1': { name: 'Square (1:1)', placements: ['Feed', 'Carousel'], priority: 'high' },
                '16:9': { name: 'Landscape (16:9)', placements: ['YouTube', 'Pre-roll'], priority: 'high' },
                '4:5': { name: 'Portrait (4:5)', placements: ['Instagram Feed'], priority: 'medium' },
                '2:3': { name: 'Pinterest (2:3)', placements: ['Pinterest'], priority: 'medium' },
                '1.91:1': { name: 'Wide (1.91:1)', placements: ['LinkedIn', 'Display'], priority: 'medium' }
            };

            neededRatios.forEach(ratio => {
                const config = ratioDerivatives[ratio];
                if (config && ratio !== currentRatio) {
                    derivatives.push(window.CAVDataModels?.DerivativeRoadmap?.createDerivative({
                        targetSpec: config.name,
                        targetPlacements: config.placements,
                        transformationType: 'outpaint',
                        priority: config.priority,
                        canAutoFix: asset.type !== 'video',
                        estimatedEffort: asset.type === 'video' ? 'manual' : 'auto'
                    }) || {
                        id: `deriv_${Date.now()}_${ratio.replace(':', '')}`,
                        targetSpec: config.name,
                        targetPlacements: config.placements,
                        transformationType: 'outpaint',
                        priority: config.priority,
                        canAutoFix: asset.type !== 'video'
                    });
                }
            });

            // Duration-based derivatives for video
            if (asset.type === 'video' || asset.duration) {
                neededDurations.forEach(dur => {
                    if (dur.type === 'max' && asset.duration > dur.value) {
                        derivatives.push({
                            id: `deriv_${Date.now()}_trim${dur.value}`,
                            targetSpec: `${dur.value}s Short Cut`,
                            targetPlacements: ['Stories', 'Reels', 'TikTok'],
                            transformationType: 'trim',
                            priority: 'high',
                            canAutoFix: false,
                            estimatedEffort: 'manual'
                        });
                    }
                });

                // Add standard video derivatives
                if (asset.duration > 30) {
                    derivatives.push({
                        id: `deriv_${Date.now()}_15s`,
                        targetSpec: '15s Short Cut',
                        targetPlacements: ['Pre-roll', 'Stories'],
                        transformationType: 'trim',
                        priority: 'high',
                        canAutoFix: false,
                        estimatedEffort: 'manual'
                    });
                }
                if (asset.duration > 10) {
                    derivatives.push({
                        id: `deriv_${Date.now()}_6s`,
                        targetSpec: '6s Bumper',
                        targetPlacements: ['YouTube Bumper'],
                        transformationType: 'trim',
                        priority: 'medium',
                        canAutoFix: false,
                        estimatedEffort: 'manual'
                    });
                }
            }

            // Add static thumbnail from video
            if (asset.type === 'video') {
                derivatives.push({
                    id: `deriv_${Date.now()}_thumb`,
                    targetSpec: 'Static Thumbnail',
                    targetPlacements: ['Display', 'Social Preview'],
                    transformationType: 'extract',
                    priority: 'medium',
                    canAutoFix: true,
                    estimatedEffort: 'auto'
                });
            }

            // Sort by priority
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            derivatives.sort((a, b) => (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3));

            return window.CAVDataModels?.DerivativeRoadmap?.create({
                assetId: asset.id,
                originalSpecs: { width: asset.width, height: asset.height, duration: asset.duration },
                derivatives
            }) || { assetId: asset.id, derivatives };
        }

        // ============================================
        // BUDGET ALLOCATION OPTIMIZER
        // ============================================

        async optimizeBudgetAllocation(totalBudget, assets, placementMatrix, options = {}) {
            const allocation = {
                totalBudget,
                currency: options.currency || 'USD',
                period: options.period || 'monthly',
                platformAllocations: [],
                creativeAllocations: [],
                estimatedResults: null,
                generatedAt: new Date().toISOString()
            };

            // Get benchmark data
            const benchmarks = window.CAVDataModels?.Storage?.getBenchmarks() || [];
            
            // Calculate platform weights based on creative fit
            const platformScores = {};
            placementMatrix.placements.forEach(p => {
                if (p.specMatch === 'ready' && p.creativeFit >= 50) {
                    const key = p.platform;
                    if (!platformScores[key]) {
                        platformScores[key] = { totalFit: 0, count: 0, placements: [] };
                    }
                    platformScores[key].totalFit += p.creativeFit;
                    platformScores[key].count++;
                    platformScores[key].placements.push(p);
                }
            });

            // Calculate allocations
            const totalScore = Object.values(platformScores).reduce((sum, p) => sum + p.totalFit, 0);
            
            for (const [platform, data] of Object.entries(platformScores)) {
                const percentage = totalScore > 0 ? (data.totalFit / totalScore) * 100 : 0;
                const amount = (totalBudget * percentage) / 100;
                
                // Get CPM benchmark for estimates
                const cpmBenchmark = benchmarks.find(b => b.metric === 'cpm' && b.platform === platform);
                const avgCPM = cpmBenchmark?.value?.median || 10;
                
                allocation.platformAllocations.push({
                    platform,
                    amount: Math.round(amount * 100) / 100,
                    percentage: Math.round(percentage * 10) / 10,
                    placements: data.placements.map(p => p.placement),
                    estimatedReach: Math.round((amount / avgCPM) * 1000),
                    estimatedClicks: Math.round((amount / avgCPM) * 1000 * 0.01) // Assuming 1% CTR
                });
            }

            // If we have Claude, get AI-optimized recommendations
            if (window.AIOrchestrator?.isProviderAvailable('claude')) {
                try {
                    const aiAllocation = await this.getAIBudgetRecommendation(totalBudget, allocation, options);
                    if (aiAllocation) {
                        allocation.aiRecommendation = aiAllocation;
                    }
                } catch (e) {
                    console.warn('[Strategy] AI budget optimization failed:', e);
                }
            }

            return allocation;
        }

        async getAIBudgetRecommendation(totalBudget, currentAllocation, options) {
            const prompt = `As a paid media strategist, optimize this budget allocation for maximum ROI.

Total Budget: $${totalBudget} ${options.period || 'monthly'}
Campaign Objective: ${options.objective || 'awareness'}
Target Audience: ${options.audience || 'general'}

Current Allocation:
${JSON.stringify(currentAllocation.platformAllocations, null, 2)}

Provide optimized allocation with:
1. Platform percentages (should sum to 100%)
2. Reasoning for each allocation
3. Expected outcomes

Return ONLY valid JSON:
{
    "optimizedAllocations": [
        {"platform": "Meta", "percentage": 40, "reasoning": "High creative fit, broad reach"},
        {"platform": "Google Ads", "percentage": 30, "reasoning": "Strong intent signals"},
        {"platform": "YouTube", "percentage": 20, "reasoning": "Video completion rates"},
        {"platform": "LinkedIn", "percentage": 10, "reasoning": "B2B targeting"}
    ],
    "expectedOutcomes": {
        "estimatedReach": 500000,
        "estimatedClicks": 5000,
        "estimatedConversions": 150,
        "estimatedCPA": 20
    },
    "recommendations": ["Focus on video content for Meta", "Use retargeting on Google"]
}`;

            const result = await window.AIOrchestrator.callClaude(prompt, { temperature: 0.4 });
            return this.parseJSON(result.content);
        }

        // ============================================
        // A/B TEST RECOMMENDATION ENGINE
        // ============================================

        async generateABTestRecommendations(asset, analysis) {
            const recommendations = [];

            // Hook variations (high impact)
            if (analysis?.hookAnalysis?.overallScore < 80) {
                recommendations.push(window.CAVDataModels?.ABTestRecommendation?.create({
                    assetId: asset.id,
                    testElement: 'hook',
                    hypothesis: 'Testing alternative opening visuals will improve thumb-stop rate',
                    expectedImpact: 'high',
                    expectedLift: { low: 15, high: 40 },
                    effortLevel: 'medium',
                    priority: 'P1',
                    variants: ['Original hook', 'Face-first hook', 'Product-first hook', 'Text overlay hook'],
                    minimumSampleSize: 5000,
                    estimatedDuration: '7 days',
                    successMetrics: ['CTR', 'View-through rate', 'Engagement rate']
                }) || { testElement: 'hook', priority: 'P1' });
            }

            // CTA variations (medium-high impact)
            if (analysis?.ctaAnalysis) {
                const cta = analysis.ctaAnalysis;
                if (!cta.ctaDetected || cta.overallEffectiveness < 70) {
                    recommendations.push({
                        testId: `test_${Date.now()}_cta`,
                        testElement: 'cta',
                        hypothesis: 'A stronger CTA will improve click-through rate',
                        expectedImpact: 'medium',
                        expectedLift: { low: 5, high: 20 },
                        effortLevel: 'low',
                        priority: 'P1',
                        variants: ['Current CTA', '"Shop Now" button', '"Learn More" soft CTA', 'Urgency CTA with timer'],
                        minimumSampleSize: 3000,
                        estimatedDuration: '5 days',
                        successMetrics: ['CTR', 'Conversion rate']
                    });
                }
            }

            // Headline variations
            recommendations.push({
                testId: `test_${Date.now()}_headline`,
                testElement: 'headline',
                hypothesis: 'Testing headline copy variations will identify best messaging',
                expectedImpact: 'medium',
                expectedLift: { low: 10, high: 25 },
                effortLevel: 'low',
                priority: 'P2',
                variants: ['Benefit-focused', 'Problem-focused', 'Social proof', 'Question hook'],
                minimumSampleSize: 4000,
                estimatedDuration: '7 days',
                successMetrics: ['CTR', 'Engagement']
            });

            // Color/Background variations
            recommendations.push({
                testId: `test_${Date.now()}_color`,
                testElement: 'background_color',
                hypothesis: 'Background color affects visual standout and engagement',
                expectedImpact: 'low',
                expectedLift: { low: 3, high: 15 },
                effortLevel: 'low',
                priority: 'P2',
                variants: ['Original', 'High contrast', 'Brand color', 'Dark mode variant'],
                minimumSampleSize: 5000,
                estimatedDuration: '5 days',
                successMetrics: ['CTR', 'Thumb-stop rate']
            });

            // Duration variations (video only)
            if (asset.type === 'video' && asset.duration > 15) {
                recommendations.push({
                    testId: `test_${Date.now()}_duration`,
                    testElement: 'duration',
                    hypothesis: 'Shorter video cuts may improve completion and engagement',
                    expectedImpact: 'medium',
                    expectedLift: { low: 10, high: 30 },
                    effortLevel: 'medium',
                    priority: 'P3',
                    variants: ['Full length', '30s cut', '15s cut', '6s bumper'],
                    minimumSampleSize: 3000,
                    estimatedDuration: '10 days',
                    successMetrics: ['View-through rate', 'Engagement', 'CTR']
                });
            }

            // Get AI recommendations if available
            if (window.AIOrchestrator?.isProviderAvailable('claude') && analysis) {
                try {
                    const aiTests = await this.getAITestRecommendations(asset, analysis);
                    if (aiTests?.length) {
                        recommendations.push(...aiTests);
                    }
                } catch (e) {
                    console.warn('[Strategy] AI test recommendations failed:', e);
                }
            }

            // Sort by priority
            recommendations.sort((a, b) => {
                const priorityOrder = { 'P1': 0, 'P2': 1, 'P3': 2 };
                return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
            });

            return recommendations;
        }

        async getAITestRecommendations(asset, analysis) {
            const prompt = `Based on this creative analysis, recommend specific A/B tests:

Analysis:
${JSON.stringify({
    hookScore: analysis.hookAnalysis?.overallScore,
    ctaEffectiveness: analysis.ctaAnalysis?.overallEffectiveness,
    thumbStopScore: analysis.thumbStopScore?.overallScore,
    improvementSuggestions: analysis.hookAnalysis?.improvementSuggestions
}, null, 2)}

Provide 2-3 specific test recommendations beyond the standard tests.
Focus on the weakest areas identified in the analysis.

Return ONLY valid JSON array:
[
    {
        "testElement": "specific element to test",
        "hypothesis": "clear hypothesis statement",
        "expectedImpact": "high/medium/low",
        "expectedLift": {"low": 5, "high": 25},
        "effortLevel": "low/medium/high",
        "priority": "P1/P2/P3",
        "variants": ["variant 1", "variant 2"],
        "rationale": "why this test matters"
    }
]`;

            const result = await window.AIOrchestrator.callClaude(prompt, { temperature: 0.5 });
            return this.parseJSON(result.content) || [];
        }

        // ============================================
        // CREATIVE FATIGUE PREDICTOR
        // ============================================

        async predictCreativeFatigue(asset, options = {}) {
            const prediction = {
                assetId: asset.id,
                estimatedDaysToFatigue: 30,
                fatigueDate: null,
                refreshRecommendationDate: null,
                fatigueFactors: {
                    audienceSize: options.audienceSize || 'medium',
                    frequencyCap: options.frequencyCap || null,
                    creativeDistinctiveness: 'medium',
                    platform: options.platform || null,
                    contentType: asset.type || 'image',
                    seasonality: this.getCurrentSeasonality()
                },
                earlyWarningIndicators: [
                    'CTR dropping 20% from peak',
                    'CPM increasing 30%',
                    'Frequency reaching 3+',
                    'Engagement rate declining'
                ],
                predictedAt: new Date().toISOString()
            };

            // Base fatigue timeline by platform
            const platformFatigue = {
                'TikTok': 14, // Fatigues fastest
                'Instagram': 21,
                'Meta': 28,
                'LinkedIn': 45,
                'YouTube': 60 // Fatigues slowest
            };

            let baseDays = platformFatigue[options.platform] || 30;

            // Adjust based on audience size
            const audienceMultiplier = {
                'small': 0.7, // Smaller audiences fatigue faster
                'medium': 1.0,
                'large': 1.3,
                'very_large': 1.5
            };
            baseDays *= audienceMultiplier[prediction.fatigueFactors.audienceSize] || 1.0;

            // Adjust for frequency cap
            if (prediction.fatigueFactors.frequencyCap) {
                const freqCap = prediction.fatigueFactors.frequencyCap;
                if (freqCap <= 2) baseDays *= 1.2;
                else if (freqCap >= 5) baseDays *= 0.7;
            }

            // Adjust for seasonality
            if (prediction.fatigueFactors.seasonality === 'holiday') {
                baseDays *= 0.6; // Holiday creative fatigues faster due to competition
            }

            // Adjust for content type
            if (asset.type === 'video') {
                baseDays *= 1.1; // Video typically lasts slightly longer
            }

            prediction.estimatedDaysToFatigue = Math.round(baseDays);
            
            // Calculate dates
            const now = new Date();
            prediction.fatigueDate = new Date(now.getTime() + (baseDays * 24 * 60 * 60 * 1000)).toISOString();
            prediction.refreshRecommendationDate = new Date(now.getTime() + ((baseDays - 7) * 24 * 60 * 60 * 1000)).toISOString();

            // Get AI enhancement if available
            if (window.AIOrchestrator?.isProviderAvailable('claude')) {
                try {
                    const aiPrediction = await this.getAIFatiguePrediction(asset, prediction, options);
                    if (aiPrediction) {
                        prediction.aiInsights = aiPrediction;
                    }
                } catch (e) {
                    console.warn('[Strategy] AI fatigue prediction failed:', e);
                }
            }

            return prediction;
        }

        getCurrentSeasonality() {
            const month = new Date().getMonth();
            if (month === 10 || month === 11) return 'holiday'; // Nov-Dec
            if (month >= 5 && month <= 7) return 'summer';
            return 'normal';
        }

        async getAIFatiguePrediction(asset, basePrediction, options) {
            const prompt = `Analyze creative fatigue potential for this asset:

Asset Type: ${asset.type || 'image'}
Platform: ${options.platform || 'multi-platform'}
Audience Size: ${basePrediction.fatigueFactors.audienceSize}
Current Season: ${basePrediction.fatigueFactors.seasonality}
Base Fatigue Estimate: ${basePrediction.estimatedDaysToFatigue} days

Provide:
1. Refined fatigue timeline estimate
2. Key factors that could accelerate or delay fatigue
3. Specific warning signs to monitor
4. Recommendations to extend creative lifespan

Return ONLY valid JSON:
{
    "refinedEstimate": 25,
    "acceleratingFactors": ["High competition in vertical", "Similar creative in market"],
    "delayingFactors": ["Unique visual style", "Strong emotional hook"],
    "warningSignals": ["CTR drop >15%", "Frequency >2.5"],
    "lifespanExtensions": ["Create 3 variants", "Refresh CTA monthly", "A/B test backgrounds"]
}`;

            const result = await window.AIOrchestrator.callClaude(prompt, { temperature: 0.3 });
            return this.parseJSON(result.content);
        }

        // ============================================
        // COMPREHENSIVE STRATEGY GENERATION
        // ============================================

        async generateComprehensiveStrategy(asset, analysis = null) {
            const startTime = Date.now();

            const strategy = {
                assetId: asset.id,
                assetFilename: asset.filename,
                assetType: asset.type || 'image',
                assetDimensions: { width: asset.width, height: asset.height },
                generatedAt: new Date().toISOString(),
                placementMatrix: null,
                derivativeRoadmap: null,
                abTestRecommendations: null,
                fatiguePrediction: null,
                processingTime: 0,
                // NEW: CRM linking
                linkedProjectId: null
            };

            try {
                // Generate all strategy components
                const [placementMatrix, derivativeRoadmap, abTests, fatigue] = await Promise.allSettled([
                    this.generatePlacementMatrix(asset, analysis),
                    this.generateDerivativeRoadmap(asset),
                    this.generateABTestRecommendations(asset, analysis),
                    this.predictCreativeFatigue(asset)
                ]);

                strategy.placementMatrix = placementMatrix.status === 'fulfilled' ? placementMatrix.value : null;
                strategy.derivativeRoadmap = derivativeRoadmap.status === 'fulfilled' ? derivativeRoadmap.value : null;
                strategy.abTestRecommendations = abTests.status === 'fulfilled' ? abTests.value : null;
                strategy.fatiguePrediction = fatigue.status === 'fulfilled' ? fatigue.value : null;

            } catch (error) {
                console.error('[Strategy] Strategy generation error:', error);
            }

            strategy.processingTime = Date.now() - startTime;
            this.currentStrategy = strategy;
            
            // PERSIST: Save to localStorage and history
            this.saveCurrentStrategy(strategy);
            this.saveStrategyToHistory(strategy);
            
            // Link to CRM
            const crmLink = await this.linkStrategyToCRM(strategy, asset);
            if (crmLink) {
                strategy.linkedProjectId = crmLink.projectId;
            }
            
            console.log(`[Strategy] Strategy generated for ${asset.filename}`);

            return strategy;
        }

        // ============================================
        // UI RENDERING
        // ============================================

        render(container, asset = null, analysis = null) {
            this.container = container;
            const history = this.strategyHistory || [];
            
            container.innerHTML = `
                <div class="cav-strategy-page">
                    <!-- Action Cards - Library Style -->
                    <div class="cav-action-cards">
                        <div class="cav-action-card" id="action-placement-matrix" data-tooltip="Generate placement recommendations">
                            <div class="cav-action-card-icon"><svg class="cav-icon" style="width:32px;height:32px;"><use href="#icon-strategy"/></svg></div>
                            <h3 class="cav-action-card-title">Placement Matrix</h3>
                            <p class="cav-action-card-description">Channel fit analysis</p>
                        </div>
                        <div class="cav-action-card" id="action-derivative-roadmap" data-tooltip="Create size derivatives">
                            <div class="cav-action-card-icon"><svg class="cav-icon" style="width:32px;height:32px;"><use href="#icon-library"/></svg></div>
                            <h3 class="cav-action-card-title">Derivatives</h3>
                            <p class="cav-action-card-description">Create variations</p>
                        </div>
                        <div class="cav-action-card" id="action-ab-tests" data-tooltip="Get A/B test recommendations">
                            <div class="cav-action-card-icon"><svg class="cav-icon" style="width:32px;height:32px;"><use href="#icon-analyze"/></svg></div>
                            <h3 class="cav-action-card-title">A/B Tests</h3>
                            <p class="cav-action-card-description">Test recommendations</p>
                        </div>
                        <div class="cav-action-card" id="action-fatigue" data-tooltip="Predict creative fatigue timeline">
                            <div class="cav-action-card-icon"><svg class="cav-icon" style="width:32px;height:32px;"><use href="#icon-usage"/></svg></div>
                            <h3 class="cav-action-card-title">Fatigue</h3>
                            <p class="cav-action-card-description">Predict refresh timing</p>
                        </div>
                    </div>
                    
                    <!-- Quick Stats -->
                    <div class="cav-section-header">
                        <div>
                            <h3 class="cav-section-title">Strategy Dashboard</h3>
                            <p class="cav-section-subtitle">Deploy creatives across channels with AI recommendations</p>
                        </div>
                    </div>
                    <div class="cav-quick-actions">
                        <button class="cav-quick-pill" id="select-asset-strategy" data-tooltip="Choose an asset to analyze">
                            <svg class="cav-icon cav-quick-pill-icon purple"><use href="#icon-library"/></svg>
                            <span>Select Asset</span>
                        </button>
                        <button class="cav-quick-pill" data-tooltip="View strategy history">
                            <svg class="cav-icon cav-quick-pill-icon blue"><use href="#icon-usage"/></svg>
                            <span>${history.length} Strategies</span>
                        </button>
                        <button class="cav-quick-pill" id="generate-full-strategy" data-tooltip="Generate comprehensive strategy">
                            <svg class="cav-icon cav-quick-pill-icon green"><use href="#icon-ai-studio"/></svg>
                            <span>Full Analysis</span>
                        </button>
                    </div>
                    
                    <!-- Module Tabs -->
                    <div class="cav-module-tabs">
                        <button class="cav-module-tab active" data-tab="overview" data-tooltip="View strategy overview">
                            <svg class="cav-icon"><use href="#icon-strategy"/></svg> Overview
                        </button>
                        <button class="cav-module-tab" data-tab="placement" data-tooltip="View placement matrix">
                            <svg class="cav-icon"><use href="#icon-strategy"/></svg> Placements
                        </button>
                        <button class="cav-module-tab" data-tab="derivatives" data-tooltip="View derivative roadmap">
                            <svg class="cav-icon"><use href="#icon-library"/></svg> Derivatives
                        </button>
                        <button class="cav-module-tab" data-tab="tests" data-tooltip="View A/B test ideas">
                            <svg class="cav-icon"><use href="#icon-analyze"/></svg> A/B Tests
                        </button>
                        <button class="cav-module-tab" data-tab="history" data-tooltip="View strategy history">
                            <svg class="cav-icon"><use href="#icon-usage"/></svg> History
                        </button>
                    </div>
                    
                    <div class="cav-strategy-content">
                        ${asset ? this.renderStrategyView(asset, analysis) : this.renderEmptyState()}
                    </div>
                </div>
            `;

            this.attachEventHandlers(container);
            
            if (asset) {
                this.currentAsset = asset;
            }
        }

        renderEmptyState() {
            const history = this.strategyHistory || [];
            
            return `
                <div class="cav-strategy-empty">
                    <div class="cav-empty-icon"><svg class="cav-icon" style="width:64px;height:64px;opacity:0.5;"><use href="#icon-strategy"/></svg></div>
                    <h2>Generate Strategy for an Asset</h2>
                    <p>Select an asset to generate deployment recommendations, derivative roadmaps, and A/B test suggestions.</p>
                    <button class="cav-btn cav-btn-primary" id="select-asset-strategy-empty">
                        <svg class="cav-icon"><use href="#icon-library"/></svg> Select Asset
                    </button>
                    
                    <!-- Strategy History Section -->
                    ${history.length > 0 ? `
                        <div class="cav-strategy-history-section">
                            <h3>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--cav-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px;">
                                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                                </svg>
                                Recent Strategies (${history.length})
                            </h3>
                            <p class="cav-section-hint">Your strategy history is saved and persists across sessions</p>
                            <div class="cav-history-list">
                                ${history.slice(0, 6).map(s => {
                                    const readyCount = s.placementMatrix?.placements?.filter(p => p.specMatch === 'ready').length || 0;
                                    const needsWorkCount = s.placementMatrix?.placements?.filter(p => p.specMatch === 'needs-work').length || 0;
                                    const derivCount = s.derivativeRoadmap?.derivatives?.length || 0;
                                    
                                    return `
                                    <div class="cav-history-item cav-strategy-history-item" data-asset-id="${s.assetId}">
                                        <div class="cav-history-info">
                                            <span class="cav-history-filename">${s.assetFilename || 'Unknown'}</span>
                                            <span class="cav-history-date">${new Date(s.generatedAt).toLocaleString()}</span>
                                        </div>
                                        <div class="cav-history-scores">
                                            <span class="cav-stat-badge cav-stat-good"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> ${readyCount} ready</span>
                                            <span class="cav-stat-badge cav-stat-warning"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> ${needsWorkCount} need work</span>
                                            <span class="cav-stat-badge cav-stat-info"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg> ${derivCount} derivatives</span>
                                        </div>
                                        ${s.fatiguePrediction ? `
                                            <div class="cav-fatigue-mini">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                                ${s.fatiguePrediction.estimatedDaysToFatigue} days to fatigue
                                            </div>
                                        ` : ''}
                                        <div class="cav-history-actions">
                                            <button class="cav-btn cav-btn-small" data-action="view-history-strategy" data-asset-id="${s.assetId}">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                                View
                                            </button>
                                            ${s.linkedProjectId ? `
                                                <button class="cav-btn cav-btn-small" data-action="view-in-crm-project" data-project-id="${s.linkedProjectId}">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                                                    CRM
                                                </button>
                                            ` : ''}
                                        </div>
                                    </div>
                                `}).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }

        renderStrategyView(asset, analysis) {
            const strategy = this.currentStrategy;
            
            return `
                <div class="cav-strategy-layout">
                    <div class="cav-strategy-sidebar">
                        <div class="cav-asset-card">
                            ${(() => {
                                // FIX: Multiple image source fallbacks
                                const imgSrc = asset.thumbnail_url || asset.thumbnail || asset.dataUrl || 
                                              (asset.file ? URL.createObjectURL(asset.file) : null);
                                return imgSrc ? 
                                    `<img src="${imgSrc}" alt="${asset.filename}" class="cav-asset-thumb" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                     <div class="cav-no-preview" style="display:none;"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>` : 
                                    '<div class="cav-no-preview"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span>No Preview</span></div>';
                            })()}
                            <h3 title="${asset.filename}">${asset.filename?.length > 25 ? asset.filename.substring(0, 22) + '...' : asset.filename}</h3>
                            <p>${asset.width || '?'}×${asset.height || '?'}</p>
                        </div>
                        
                        <button class="cav-btn cav-btn-primary cav-btn-large" id="generate-strategy" ${strategy ? 'disabled' : ''}>
                            ${strategy ? `
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px;">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                Strategy Generated
                            ` : `
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px;">
                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                </svg>
                                Generate Strategy
                            `}
                        </button>
                        
                        ${strategy ? `
                            <button class="cav-btn cav-btn-secondary" id="regenerate-strategy">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px;">
                                    <polyline points="23 4 23 10 17 10"></polyline>
                                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                                </svg>
                                Regenerate
                            </button>
                            <button class="cav-btn cav-btn-secondary" id="save-to-crm-strategy">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px;">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                    <polyline points="7 3 7 8 15 8"></polyline>
                                </svg>
                                Save to CRM
                            </button>
                        ` : ''}
                    </div>
                    
                    <div class="cav-strategy-main">
                        ${strategy ? this.renderStrategyResults(strategy) : this.renderStrategyPending()}
                    </div>
                </div>
            `;
        }

        renderStrategyPending() {
            return `
                <div class="cav-strategy-pending">
                    <div class="cav-pending-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--cav-text-muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                            <polyline points="2 17 12 22 22 17"></polyline>
                            <polyline points="2 12 12 17 22 12"></polyline>
                        </svg>
                    </div>
                    <p>Click "Generate Strategy" to get:</p>
                    <ul class="cav-analysis-list">
                        <li><span class="cav-list-icon">📊</span> Placement Matrix - Platform deployment recommendations</li>
                        <li><span class="cav-list-icon">🗺️</span> Derivative Roadmap - Required creative variations</li>
                        <li><span class="cav-list-icon">🧪</span> A/B Test Recommendations - Testing opportunities</li>
                        <li><span class="cav-list-icon">⏰</span> Fatigue Prediction - Creative lifespan estimate</li>
                    </ul>
                </div>
            `;
        }

        renderStrategyResults(strategy) {
            return `
                <div class="cav-strategy-results">
                    ${this.renderPlacementMatrixCard(strategy.placementMatrix)}
                    ${this.renderDerivativeRoadmapCard(strategy.derivativeRoadmap)}
                    ${this.renderABTestCard(strategy.abTestRecommendations)}
                    ${this.renderFatigueCard(strategy.fatiguePrediction)}
                </div>
            `;
        }

        renderPlacementMatrixCard(matrix) {
            if (!matrix?.placements) return '';
            
            const ready = matrix.placements.filter(p => p.specMatch === 'ready');
            const needsWork = matrix.placements.filter(p => p.specMatch === 'needs-work');
            
            return `
                <div class="cav-strategy-card">
                    <h2>📊 Placement Matrix</h2>
                    <div class="cav-placement-summary">
                        <span class="cav-stat cav-stat-good">✅ ${ready.length} Ready</span>
                        <span class="cav-stat cav-stat-warning">⚠️ ${needsWork.length} Need Work</span>
                    </div>
                    <div class="cav-placement-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Platform</th>
                                    <th>Placement</th>
                                    <th>Status</th>
                                    <th>Fit</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${matrix.placements.slice(0, 10).map(p => `
                                    <tr class="cav-placement-row cav-placement-${p.specMatch}">
                                        <td>${p.platform}</td>
                                        <td>${p.placement}</td>
                                        <td>
                                            <span class="cav-status cav-status-${p.specMatch}">
                                                ${p.specMatch === 'ready' ? '✅' : p.specMatch === 'needs-work' ? '⚠️' : '❌'}
                                            </span>
                                        </td>
                                        <td>${p.creativeFit}%</td>
                                        <td>
                                            <button class="cav-btn cav-btn-small" data-action="${p.recommendedAction}" data-spec="${p.targetSpec || p.spec || ''}">
                                                ${p.recommendedAction === 'download' ? '⬇️ Download' : 
                                                  p.recommendedAction === 'create-derivative' ? '✨ Create' : '❌ N/A'}
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        renderDerivativeRoadmapCard(roadmap) {
            if (!roadmap?.derivatives?.length) return '';
            
            return `
                <div class="cav-strategy-card">
                    <h2>📦 Derivative Roadmap</h2>
                    <p class="cav-roadmap-summary">${roadmap.derivatives.length} variations needed for full coverage</p>
                    <div class="cav-derivatives-grid">
                        ${roadmap.derivatives.map(d => `
                            <div class="cav-derivative-card cav-priority-${d.priority}">
                                <div class="cav-derivative-header">
                                    <h4>${d.targetSpec}</h4>
                                </div>
                                <div class="cav-derivative-body">
                                    <span class="cav-placements">${d.targetPlacements?.join(', ') || 'Multiple'}</span>
                                </div>
                                <div class="cav-derivative-footer">
                                    <span class="cav-priority-badge cav-priority-${d.priority}">${d.priority || 'P1'}</span>
                                    ${d.canAutoFix ? '<span class="cav-auto-badge">🤖 Auto</span>' : '<span class="cav-manual-badge">✋ Manual</span>'}
                                </div>
                                <button class="cav-btn cav-btn-primary cav-btn-small cav-create-btn" data-action="create-derivative" data-spec="${d.targetSpec || d.spec || '1080x1080'}">
                                    ${d.canAutoFix ? '✨ Create' : '📝 View Specs'}
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        renderABTestCard(tests) {
            if (!tests?.length) return '';
            
            return `
                <div class="cav-strategy-card">
                    <h2>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--cav-secondary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 8px;">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                        </svg>
                        A/B Test Recommendations
                    </h2>
                    <div class="cav-tests-list">
                        ${tests.slice(0, 5).map(t => `
                            <div class="cav-test-item cav-test-${t.priority}">
                                <div class="cav-test-header">
                                    <span class="cav-test-element">${t.testElement}</span>
                                    <span class="cav-test-priority">${t.priority}</span>
                                </div>
                                <p class="cav-test-hypothesis">${t.hypothesis}</p>
                                <div class="cav-test-meta">
                                    <span>Expected lift: ${t.expectedLift?.low}-${t.expectedLift?.high}%</span>
                                    <span>Duration: ${t.estimatedDuration}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        renderFatigueCard(fatigue) {
            if (!fatigue) return '';
            
            const daysLeft = fatigue.estimatedDaysToFatigue || 30;
            const urgency = daysLeft < 14 ? 'urgent' : daysLeft < 30 ? 'warning' : 'good';
            
            // Generate reasoning based on factors
            const reasoning = this.generateFatigueReasoning(fatigue, daysLeft);
            
            return `
                <div class="cav-strategy-card cav-fatigue-card cav-fatigue-${urgency}">
                    <h2>⏰ Creative Fatigue Prediction</h2>
                    <div class="cav-fatigue-main">
                        <div class="cav-fatigue-days">
                            <span class="cav-days-number">${daysLeft}</span>
                            <span class="cav-days-label">days until fatigue</span>
                        </div>
                        <div class="cav-fatigue-dates">
                            <p><strong>Fatigue Date:</strong> ${fatigue.fatigueDate ? new Date(fatigue.fatigueDate).toLocaleDateString() : 'TBD'}</p>
                            <p><strong>Refresh By:</strong> ${fatigue.refreshRecommendationDate ? new Date(fatigue.refreshRecommendationDate).toLocaleDateString() : 'TBD'}</p>
                        </div>
                    </div>
                    
                    <!-- NEW: Reasoning Section -->
                    <div class="cav-fatigue-reasoning">
                        <h4>📊 Why This Prediction?</h4>
                        <div class="cav-reasoning-content">
                            <p>${reasoning.summary}</p>
                            <ul class="cav-reasoning-factors">
                                ${reasoning.factors.map(f => `
                                    <li class="cav-factor cav-factor-${f.impact}">
                                        <span class="cav-factor-icon">${f.icon}</span>
                                        <span class="cav-factor-text">${f.text}</span>
                                        <span class="cav-factor-impact">${f.impact === 'positive' ? '+' : f.impact === 'negative' ? '-' : '='}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                    
                    <div class="cav-fatigue-warnings">
                        <h4>⚠️ Early Warning Signs to Watch</h4>
                        <ul>
                            ${(fatigue.earlyWarningIndicators || ['CTR drops below 1%', 'Frequency exceeds 3x', 'Engagement rate declines 20%']).map(w => `<li>${w}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="cav-fatigue-recommendations">
                        <h4>💡 Recommendations</h4>
                        <ul>
                            <li>Schedule creative refresh ${Math.max(7, daysLeft - 7)} days from now</li>
                            <li>Prepare ${daysLeft < 21 ? '2-3' : '1-2'} variant creatives in advance</li>
                            <li>Monitor performance weekly for early fatigue signs</li>
                            ${daysLeft < 14 ? '<li class="cav-urgent"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Consider immediate A/B testing with fresh creative</li>' : ''}
                        </ul>
                    </div>
                </div>
            `;
        }
        
        // NEW: Generate reasoning for fatigue prediction
        generateFatigueReasoning(fatigue, daysLeft) {
            const factors = [];
            
            // Visual complexity factor
            factors.push({
                icon: '🎨',
                text: 'Visual complexity affects ad blindness rate',
                impact: daysLeft > 30 ? 'positive' : 'neutral'
            });
            
            // Industry benchmark factor
            factors.push({
                icon: '📈',
                text: 'Industry average creative lifespan: 21-35 days',
                impact: daysLeft >= 21 ? 'positive' : 'negative'
            });
            
            // Placement diversity factor
            factors.push({
                icon: '📱',
                text: 'Multiple placements extend creative life through varied exposure',
                impact: 'positive'
            });
            
            // Audience factor
            factors.push({
                icon: '👥',
                text: 'Broader audiences fatigue slower than narrow targeting',
                impact: 'neutral'
            });
            
            // Seasonal factor
            const month = new Date().getMonth();
            const isBusySeason = month >= 9 && month <= 11; // Q4
            if (isBusySeason) {
                factors.push({
                    icon: '🎄',
                    text: 'Q4 high-competition period - faster fatigue expected',
                    impact: 'negative'
                });
            }
            
            const summary = daysLeft < 14 
                ? 'Based on creative analysis and industry benchmarks, this asset may fatigue quickly. Consider preparing alternatives now.'
                : daysLeft < 30
                ? 'This creative has moderate longevity. Plan a refresh strategy within the next few weeks.'
                : 'This creative shows good potential for extended use. Monitor performance metrics for optimization opportunities.';
            
            return { summary, factors };
        }

        attachEventHandlers(container) {
            // Generate strategy
            container.querySelector('#generate-strategy')?.addEventListener('click', async () => {
                if (!this.currentAsset) return;
                
                const btn = container.querySelector('#generate-strategy');
                btn.disabled = true;
                btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="cav-spinner"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg> Generating...';
                
                try {
                    await this.generateComprehensiveStrategy(this.currentAsset);
                    this.render(container, this.currentAsset);
                } catch (error) {
                    console.error('[Strategy] Generation error:', error);
                    btn.disabled = false;
                    btn.innerHTML = '❌ Error - Try Again';
                }
            });

            // Regenerate
            container.querySelector('#regenerate-strategy')?.addEventListener('click', () => {
                this.currentStrategy = null;
                this.render(container, this.currentAsset);
            });

            // Select asset (multiple entry points)
            container.querySelector('#select-asset-strategy')?.addEventListener('click', () => {
                this.showAssetPicker();
            });
            container.querySelector('#select-asset-strategy-empty')?.addEventListener('click', () => {
                this.showAssetPicker();
            });
            
            // Generate full strategy from quick pill
            container.querySelector('#generate-full-strategy')?.addEventListener('click', async () => {
                if (!this.currentAsset) {
                    this.showAssetPicker();
                    return;
                }
                const btn = container.querySelector('#generate-full-strategy');
                if (btn) btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="cav-spinner"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg> Generating...';
                try {
                    await this.generateComprehensiveStrategy(this.currentAsset);
                    this.render(container, this.currentAsset);
                } catch (error) {
                    console.error('[Strategy] Generation error:', error);
                    if (btn) btn.innerHTML = 'Full Analysis';
                }
            });
            
            // Action card clicks
            container.querySelectorAll('.cav-action-card[id^="action-"]').forEach(card => {
                card.addEventListener('click', () => {
                    if (!this.currentAsset) {
                        this.showAssetPicker();
                        return;
                    }
                    // Activate corresponding tab
                    const actionId = card.id.replace('action-', '');
                    const tabMap = {
                        'placement-matrix': 'placement',
                        'derivative-roadmap': 'derivatives',
                        'ab-tests': 'tests',
                        'fatigue': 'overview'
                    };
                    const targetTab = tabMap[actionId] || 'overview';
                    container.querySelectorAll('.cav-module-tab').forEach(t => t.classList.remove('active'));
                    container.querySelector(`.cav-module-tab[data-tab="${targetTab}"]`)?.classList.add('active');
                });
            });
            
            // Module tab clicks
            container.querySelectorAll('.cav-module-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    container.querySelectorAll('.cav-module-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    // Could trigger content changes here if needed
                });
            });
            
            // Save to CRM button
            container.querySelector('#save-to-crm-strategy')?.addEventListener('click', () => {
                this.showSaveToCRMModal();
            });
            
            // View history strategy buttons
            container.querySelectorAll('[data-action="view-history-strategy"]').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const assetId = btn.dataset.assetId;
                    const historyEntry = this.strategyHistory.find(s => s.assetId === assetId);
                    
                    if (historyEntry) {
                        // Load the strategy from history
                        this.currentStrategy = historyEntry;
                        
                        // Try to find the asset
                        const assets = await this.getAllAssets();
                        const asset = assets.find(a => a.id === assetId);
                        
                        if (asset) {
                            this.currentAsset = asset;
                            this.render(container, asset);
                        } else {
                            // Asset not found, but we can still show the strategy
                            this.currentAsset = {
                                id: assetId,
                                filename: historyEntry.assetFilename || 'Unknown',
                                width: historyEntry.assetDimensions?.width,
                                height: historyEntry.assetDimensions?.height
                            };
                            this.render(container, this.currentAsset);
                        }
                    }
                });
            });
            
            // View in CRM project buttons
            container.querySelectorAll('[data-action="view-in-crm-project"]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const projectId = btn.dataset.projectId;
                    if (projectId && window.cavCRM) {
                        // Navigate to CRM and show project
                        const navButtons = document.querySelectorAll('.main-nav button');
                        const crmBtn = Array.from(navButtons).find(b => b.textContent.includes('CRM'));
                        if (crmBtn) crmBtn.click();
                        
                        setTimeout(() => {
                            // Try to highlight the project in the CRM view
                            const projectEl = document.querySelector(`[data-project-id="${projectId}"]`);
                            if (projectEl) {
                                projectEl.scrollIntoView({ behavior: 'smooth' });
                                projectEl.classList.add('cav-highlight');
                                setTimeout(() => projectEl.classList.remove('cav-highlight'), 2000);
                            }
                        }, 500);
                    }
                });
            });
            
            // Create derivative buttons (from Placement Matrix and Derivative Roadmap)
            container.querySelectorAll('[data-action="create-derivative"]').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const spec = btn.dataset.spec || '';
                    if (!this.currentAsset) {
                        alert('No asset selected. Please select an asset first.');
                        return;
                    }
                    
                    // If no spec provided, show spec picker
                    if (!spec) {
                        const userSpec = prompt('Enter target size (e.g., 1080x1920, 9:16, story, square):', '1080x1080');
                        if (!userSpec) return;
                        btn.dataset.spec = userSpec;
                    }
                    
                    const finalSpec = (btn.dataset.spec || '1080x1080').trim();
                    
                    // Validate spec is not empty
                    if (!finalSpec || finalSpec === '') {
                        alert('No target specification provided. Please try again.');
                        return;
                    }
                    
                    // Show loading state
                    const originalText = btn.innerHTML;
                    btn.disabled = true;
                    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="cav-spinner"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg> Creating...';
                    
                    try {
                        // Parse the target spec (e.g., "1080x1920" or "9:16")
                        let targetWidth, targetHeight;
                        
                        if (finalSpec && finalSpec.includes('x')) {
                            const parts = finalSpec.split('x').map(Number);
                            targetWidth = parts[0] || 1080;
                            targetHeight = parts[1] || 1080;
                        } else if (finalSpec && finalSpec.includes(':')) {
                            const parts = finalSpec.split(':').map(Number);
                            const w = parts[0] || 1;
                            const h = parts[1] || 1;
                            // Calculate dimensions based on aspect ratio and original size
                            const maxDim = Math.max(this.currentAsset?.width || 1080, this.currentAsset?.height || 1920);
                            if (w > h) {
                                targetWidth = maxDim;
                                targetHeight = Math.round(maxDim * h / w) || 1080;
                            } else {
                                targetHeight = maxDim;
                                targetWidth = Math.round(maxDim * w / h) || 1080;
                            }
                        } else if (finalSpec) {
                            // Default to common sizes based on spec name
                            const specLower = finalSpec.toLowerCase();
                            if (specLower.includes('story') || specLower.includes('reel') || specLower.includes('9:16')) {
                                targetWidth = 1080;
                                targetHeight = 1920;
                            } else if (specLower.includes('square') || specLower.includes('1:1')) {
                                targetWidth = 1080;
                                targetHeight = 1080;
                            } else if (specLower.includes('landscape') || specLower.includes('16:9')) {
                                targetWidth = 1920;
                                targetHeight = 1080;
                            } else {
                                targetWidth = 1080;
                                targetHeight = 1080;
                            }
                        }
                        
                        // Use AI Adapter if available - try multiple methods
                        const adapter = window.cavAIAdapter || (window.AIAssetAdapter ? new window.AIAssetAdapter() : null);
                        
                        if (adapter?.adaptImageToAspectRatio) {
                            // Check for API key first
                            if (!adapter.hasApiKey || !adapter.hasApiKey()) {
                                // Try to get key from settings
                                const geminiKey = localStorage.getItem('cav_gemini_api_key') || 
                                                 localStorage.getItem('cav_ai_api_key') || '';
                                if (geminiKey) {
                                    adapter.setApiKey?.(geminiKey);
                                } else {
                                    throw new Error('No API key configured. Please set your Gemini API key in Settings.');
                                }
                            }
                            
                            const targetSpec = {
                                aspectRatio: `${targetWidth}:${targetHeight}`,
                                width: targetWidth,
                                height: targetHeight,
                                platform: finalSpec,
                                channel: finalSpec
                            };
                            
                            const derivative = await adapter.adaptImageToAspectRatio(this.currentAsset, targetSpec);
                            
                            if (derivative) {
                                alert(`✅ Created ${targetWidth}x${targetHeight} derivative for ${finalSpec}!`);
                                btn.innerHTML = '✅ Created';
                                
                                // Refresh after a short delay
                                setTimeout(() => {
                                    btn.innerHTML = originalText;
                                    btn.disabled = false;
                                }, 2000);
                            } else {
                                throw new Error('Derivative creation returned null');
                            }
                        } else if (adapter?.smartResize) {
                            // Try smartResize method
                            const derivative = await adapter.smartResize(this.currentAsset, targetWidth, targetHeight);
                            if (derivative) {
                                alert(`✅ Created ${targetWidth}x${targetHeight} derivative!`);
                                btn.innerHTML = '✅ Created';
                            }
                        } else if (window.AdvancedFeatures?.AIIntegration?.resizeWithOutpaint) {
                            // Fallback to advanced features
                            await window.AdvancedFeatures.AIIntegration.resizeWithOutpaint(
                                this.currentAsset.id, 
                                targetWidth, 
                                targetHeight
                            );
                            alert(`✅ Created ${targetWidth}x${targetHeight} derivative!`);
                            btn.innerHTML = '✅ Created';
                        } else {
                            throw new Error('AI Adapter not available. Please configure API keys in Settings and refresh the page.');
                        }
                    } catch (error) {
                        console.error('[Strategy] Create derivative error:', error);
                        alert(`❌ Failed to create derivative: ${error.message}`);
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                    }
                });
            });
            
            // Download buttons (from Placement Matrix)
            container.querySelectorAll('[data-action="download"]').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (!this.currentAsset) {
                        alert('No asset selected.');
                        return;
                    }
                    
                    // Download the asset
                    const link = document.createElement('a');
                    link.href = this.currentAsset.dataUrl || this.currentAsset.thumbnail_url || this.currentAsset.video_url || '';
                    link.download = this.currentAsset.filename || 'asset.png';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    alert('✅ Asset downloaded! Ready for upload to your ad platform.');
                });
            });
            
            // Avoid buttons (for incompatible)
            container.querySelectorAll('[data-action="avoid"]').forEach(btn => {
                btn.addEventListener('click', () => {
                    alert('❌ This asset does not meet the platform requirements. Consider creating a derivative with the correct specifications.');
                });
            });
        }

        async showAssetPicker() {
            const assets = await this.getAllAssets();
            
            const modal = document.createElement('div');
            modal.className = 'cav-modal-overlay';
            modal.innerHTML = `
                <div class="cav-modal">
                    <div class="cav-modal-header">
                        <h2>Select Asset for Strategy</h2>
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
                                      `<img src="${thumbSrc}" alt="${a.filename}" onerror="this.style.display='none'; this.parentElement.querySelector('.no-thumb')?.style.removeProperty('display')">` : 
                                      ''}<div class="no-thumb" ${thumbSrc ? 'style="display:none"' : ''}>📷</div>
                                    <span>${a.filename}</span>
                                    <span class="cav-asset-size">${a.width || 0}×${a.height || 0}</span>
                                </div>
                            `}).join('')}
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            modal.querySelector('.cav-modal-close').addEventListener('click', () => modal.remove());
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

            modal.querySelectorAll('.cav-asset-option').forEach(opt => {
                opt.addEventListener('click', () => {
                    const asset = assets.find(a => a.id === opt.dataset.assetId);
                    if (asset) {
                        this.currentAsset = asset;
                        this.currentStrategy = null;
                        this.render(this.container, asset);
                    }
                    modal.remove();
                });
            });
        }

        // Get assets from ALL storage locations
        async getAllAssets() {
            // Method 1: window.cavValidatorApp
            if (window.cavValidatorApp?.state?.assets?.length > 0) {
                return window.cavValidatorApp.state.assets;
            }
            
            // Method 2: window.cavApp
            if (window.cavApp?.state?.assets?.length > 0) {
                return window.cavApp.state.assets;
            }
            
            // Method 3: IndexedDB via storage
            if (window.cavApp?.storage?.getAssets) {
                try {
                    const dbAssets = await window.cavApp.storage.getAssets();
                    if (dbAssets?.length > 0) return dbAssets;
                } catch (e) { /* continue */ }
            }
            
            // Method 4: localStorage search
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.includes('cav_') && key.includes('asset')) {
                    try {
                        const parsed = JSON.parse(localStorage.getItem(key));
                        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                    } catch (e) { /* continue */ }
                }
            }
            
            return [];
        }

        // ============================================
        // UTILITY METHODS
        // ============================================

        calculateAspectRatio(width, height) {
            if (!width || !height) return null;
            const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
            const divisor = gcd(width, height);
            return `${width / divisor}:${height / divisor}`;
        }

        ratioMatches(actual, required) {
            if (!actual || !required) return false;
            
            const parseRatio = (r) => {
                if (!r || typeof r !== 'string' || !r.includes(':')) return 1;
                const parts = r.split(':').map(Number);
                const w = parts[0] || 1;
                const h = parts[1] || 1;
                return w / h;
            };
            
            const actualVal = parseRatio(actual);
            const requiredVal = parseRatio(required);
            
            return Math.abs(actualVal - requiredVal) < 0.1;
        }

        parseJSON(content) {
            if (!content) return null;
            const match = content.match(/```json\s*([\s\S]*?)\s*```/);
            try {
                return JSON.parse(match ? match[1] : content);
            } catch (e) {
                return null;
            }
        }
    }

    // ============================================
    // ENHANCED STRATEGY WITH AI INTELLIGENCE ENGINE
    // ============================================

    StrategyModule.prototype.generateAdvancedStrategy = async function(asset, analysis) {
        // Use AI Intelligence Engine if available
        if (!window.CAVAIEngine) {
            console.warn('[Strategy] AI Intelligence Engine not available, using standard strategy');
            return this.generateComprehensiveStrategy(asset, analysis);
        }

        console.log('[Strategy] Generating advanced strategy with AI Intelligence Engine...');
        const startTime = Date.now();

        // Get brand guidelines and audience persona for context
        const brandGuidelines = window.CAVAIEngine.getBrandGuidelines();
        const audiencePersona = window.CAVAIEngine.getAudiencePersona();

        // Use strategic synthesis from advanced analysis if available
        const strategicSynthesis = analysis?.strategicSynthesis;
        
        const strategy = {
            assetId: asset.id,
            assetFilename: asset.filename,
            assetType: asset.type || 'image',
            assetDimensions: { width: asset.width, height: asset.height },
            generatedAt: new Date().toISOString(),
            strategyMode: 'advanced',
            
            // Standard strategy components
            placementMatrix: null,
            derivativeRoadmap: null,
            abTestRecommendations: null,
            fatiguePrediction: null,
            
            // Enhanced components from AI Engine
            platformFit: strategicSynthesis?.platformFit || null,
            competitiveDifferentiation: strategicSynthesis?.competitiveDifferentiation || null,
            actionableRecommendations: strategicSynthesis?.actionableRecommendations || null,
            
            // Brand & Audience context
            brandGuidelinesUsed: !!brandGuidelines,
            audiencePersonaUsed: !!audiencePersona,
            
            // Localization & Accessibility
            localizationNotes: null,
            accessibilityAudit: strategicSynthesis?.accessibilityAudit || null,
            complianceFlags: strategicSynthesis?.complianceFlags || null,
            
            processingTime: 0,
            linkedProjectId: null
        };

        try {
            // Generate standard components in parallel
            const [placementMatrix, derivativeRoadmap, abTests, fatigue] = await Promise.allSettled([
                this.generatePlacementMatrix(asset, analysis),
                this.generateDerivativeRoadmap(asset),
                this.generateABTestRecommendations(asset, analysis),
                this.predictCreativeFatigue(asset)
            ]);

            strategy.placementMatrix = placementMatrix.status === 'fulfilled' ? placementMatrix.value : null;
            strategy.derivativeRoadmap = derivativeRoadmap.status === 'fulfilled' ? derivativeRoadmap.value : null;
            strategy.abTestRecommendations = abTests.status === 'fulfilled' ? abTests.value : null;
            strategy.fatiguePrediction = fatigue.status === 'fulfilled' ? fatigue.value : null;

            // Generate derivative suggestions using AI Engine
            if (window.CAVAIEngine?.generateDerivatives) {
                strategy.aiDerivatives = await window.CAVAIEngine.generateDerivatives(analysis);
            }

            // Generate localization notes
            strategy.localizationNotes = await this.generateLocalizationNotes(asset, analysis, audiencePersona);

        } catch (error) {
            console.error('[Strategy] Advanced strategy error:', error);
        }

        strategy.processingTime = Date.now() - startTime;
        this.currentStrategy = strategy;

        // Save to history
        this.saveStrategyToHistory(strategy);

        console.log(`[Strategy] Advanced strategy complete in ${strategy.processingTime}ms`);
        return strategy;
    };

    // Generate localization notes
    StrategyModule.prototype.generateLocalizationNotes = async function(asset, analysis, audiencePersona) {
        const orchestrator = window.AIOrchestrator;
        if (!orchestrator?.isProviderAvailable('claude')) return null;

        const textContent = analysis?.visualExtraction?.text_extracted?.all_text?.join(' ') || '';
        if (!textContent) return null;

        const prompt = `Analyze this creative's text content for localization potential:

Text content: "${textContent}"

Target audience: ${audiencePersona?.demographics?.location || 'Global'}

Evaluate:
1. Text length issues for translation (German typically 30% longer)
2. Cultural references that may not translate
3. Idioms or phrases requiring localization
4. Date/number format considerations
5. Color meanings in different cultures

Return JSON:
{
    "translatable": true,
    "textLengthRisk": "low|medium|high",
    "culturalConsiderations": [],
    "idiomFlags": [],
    "recommendations": []
}`;

        try {
            const result = await orchestrator.callClaude(prompt, { temperature: 0.3, maxTokens: 500 });
            return this.parseJSON(result.content);
        } catch (e) {
            return null;
        }
    };

    // ============================================
    // BRAND GUIDELINES & AUDIENCE INTEGRATION
    // ============================================

    StrategyModule.prototype.setBrandContext = function(brandGuidelines, audiencePersona) {
        if (window.CAVAIEngine) {
            if (brandGuidelines) window.CAVAIEngine.setBrandGuidelines(brandGuidelines);
            if (audiencePersona) window.CAVAIEngine.setAudiencePersona(audiencePersona);
        }
        return { brandGuidelines, audiencePersona };
    };

    StrategyModule.prototype.getBrandContext = function() {
        if (window.CAVAIEngine) {
            return {
                brandGuidelines: window.CAVAIEngine.getBrandGuidelines(),
                audiencePersona: window.CAVAIEngine.getAudiencePersona()
            };
        }
        return { brandGuidelines: null, audiencePersona: null };
    };

    // ============================================
    // COMPETITOR COMPARISON
    // ============================================

    StrategyModule.prototype.compareWithCompetitors = async function(asset, analysis, competitors = []) {
        const orchestrator = window.AIOrchestrator;
        if (!orchestrator?.isProviderAvailable('searchapi')) {
            return { available: false, message: 'SearchAPI not configured for competitor research' };
        }

        const results = {
            competitors: [],
            differentiators: [],
            marketPosition: null,
            researchedAt: new Date().toISOString()
        };

        try {
            // Set industry context for future analyses
            const industry = analysis?.visualExtraction?.brand_signals?.industry || 'advertising';
            window.CAVAIEngine?.setIndustryContext(industry, competitors);

            // Research each competitor
            for (const competitor of competitors.slice(0, 3)) {
                const query = `${competitor} advertising creatives examples 2024 2025`;
                const searchResult = await orchestrator.searchWeb(query, 'competitor_ads');
                
                results.competitors.push({
                    name: competitor,
                    adsFound: searchResult?.results?.length || 0,
                    topResults: searchResult?.results?.slice(0, 3) || []
                });
            }

            // Generate differentiators using Claude
            if (orchestrator.isProviderAvailable('claude') && results.competitors.length > 0) {
                const diffPrompt = `Based on this creative's analysis and competitor research, identify key differentiators:

Our Creative Analysis:
${JSON.stringify(analysis?.strategicSynthesis || analysis, null, 2)}

Competitor Research:
${JSON.stringify(results.competitors, null, 2)}

Identify:
1. What makes our creative stand out
2. What competitors are doing that we're not
3. Market positioning opportunity
4. Recommendations for competitive advantage

Return JSON:
{
    "ourStrengths": [],
    "competitorStrengths": [],
    "opportunities": [],
    "recommendations": []
}`;

                const diffResult = await orchestrator.callClaude(diffPrompt, { temperature: 0.4 });
                const diffData = this.parseJSON(diffResult.content);
                if (diffData) {
                    results.differentiators = diffData.ourStrengths || [];
                    results.marketPosition = diffData;
                }
            }

        } catch (error) {
            console.error('[Strategy] Competitor comparison error:', error);
        }

        return results;
    };

    // ============================================
    // INITIALIZE & EXPORT
    // ============================================

    const strategyModule = new StrategyModule();

    window.CAVStrategy = {
        module: strategyModule,
        render: (container, asset, analysis) => strategyModule.render(container, asset, analysis),
        
        // Standard strategy
        generatePlacementMatrix: (asset, analysis) => strategyModule.generatePlacementMatrix(asset, analysis),
        generateDerivativeRoadmap: (asset, matrix) => strategyModule.generateDerivativeRoadmap(asset, matrix),
        generateABTestRecommendations: (asset, analysis) => strategyModule.generateABTestRecommendations(asset, analysis),
        predictCreativeFatigue: (asset, options) => strategyModule.predictCreativeFatigue(asset, options),
        generateComprehensiveStrategy: (asset, analysis) => strategyModule.generateComprehensiveStrategy(asset, analysis),
        optimizeBudgetAllocation: (budget, assets, matrix, options) => strategyModule.optimizeBudgetAllocation(budget, assets, matrix, options),
        showSaveToCRMModal: () => strategyModule.showSaveToCRMModal(),
        
        // Advanced strategy with AI Intelligence Engine
        generateAdvancedStrategy: (asset, analysis) => strategyModule.generateAdvancedStrategy(asset, analysis),
        
        // Brand & Audience context
        setBrandContext: (brand, audience) => strategyModule.setBrandContext(brand, audience),
        getBrandContext: () => strategyModule.getBrandContext(),
        
        // Competitor comparison
        compareWithCompetitors: (asset, analysis, competitors) => strategyModule.compareWithCompetitors(asset, analysis, competitors)
    };

    // ============================================
    // SAVE TO CRM MODAL (standalone function wrapper)
    // ============================================
    StrategyModule.prototype.showSaveToCRMModal = function() {
            if (!this.currentAsset || !this.currentStrategy) {
                alert('No strategy to save. Generate a strategy first.');
                return;
            }
            
            // Get existing CRM companies
            const companies = window.cavCRM ? Object.values(window.cavCRM.companies || {}) : [];
            
            const modal = document.createElement('div');
            modal.className = 'cav-modal-overlay';
            modal.innerHTML = `
                <div class="cav-modal" style="max-width: 500px;">
                    <div class="cav-modal-header">
                        <h2>💾 Save Strategy to CRM</h2>
                        <button class="cav-modal-close">&times;</button>
                    </div>
                    <div class="cav-modal-body">
                        <div class="cav-form-group">
                            <label>Select Company/Client:</label>
                            <select id="crm-company-select" class="cav-select">
                                <option value="">-- Select Existing Company --</option>
                                ${companies.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                                <option value="new">➕ Create New Company</option>
                            </select>
                        </div>
                        
                        <div id="new-company-fields" style="display: none;">
                            <div class="cav-form-group">
                                <label>Company Name:</label>
                                <input type="text" id="new-company-name" class="cav-input" placeholder="Enter company name">
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
                                    <option value="Entertainment">Entertainment</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div class="cav-form-group">
                                <label>Company Type:</label>
                                <select id="new-company-type" class="cav-select">
                                    <option value="client">Client (Your Customer)</option>
                                    <option value="agency">Agency</option>
                                    <option value="vendor">Vendor</option>
                                    <option value="partner">Partner</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="cav-form-group">
                            <label>Project Name (optional):</label>
                            <input type="text" id="project-name" class="cav-input" placeholder="e.g., Q1 Campaign, Product Launch">
                        </div>
                        
                        <div class="cav-form-group">
                            <label>
                                <input type="checkbox" id="link-asset-checkbox" checked>
                                Link asset "${this.currentAsset.filename}" to this company
                            </label>
                        </div>
                    </div>
                    <div class="cav-modal-footer">
                        <button class="cav-btn cav-btn-secondary" id="cancel-save">Cancel</button>
                        <button class="cav-btn cav-btn-primary" id="confirm-save">💾 Save to CRM</button>
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
                const projectName = modal.querySelector('#project-name').value;
                const linkAsset = modal.querySelector('#link-asset-checkbox').checked;
                
                let companyId = selectedCompanyId;
                
                if (selectedCompanyId === 'new') {
                    const newName = modal.querySelector('#new-company-name').value;
                    const industry = modal.querySelector('#new-company-industry').value;
                    const type = modal.querySelector('#new-company-type').value;
                    
                    if (!newName) {
                        alert('Please enter a company name');
                        return;
                    }
                    
                    // Create new company
                    if (window.cavCRM?.createCompany) {
                        const newCompany = window.cavCRM.createCompany({
                            name: newName,
                            industry: industry,
                            type: type,
                            status: 'active'
                        });
                        companyId = newCompany.id;
                    }
                }
                
                if (!companyId) {
                    alert('Please select or create a company');
                    return;
                }
                
                // Create project if name provided
                let projectId = null;
                if (projectName && window.cavCRM?.createProject) {
                    const company = window.cavCRM.companies[companyId];
                    const project = window.cavCRM.createProject({
                        name: projectName,
                        client: companyId,
                        clientName: company?.name || 'Unknown',
                        type: 'campaign',
                        status: 'active'
                    });
                    projectId = project.id;
                }
                
                // Link asset to company
                if (linkAsset && window.cavCRM?.linkAssetToCompany) {
                    window.cavCRM.linkAssetToCompany(companyId, this.currentAsset.id);
                }
                
                // Link strategy to project
                if (projectId) {
                    this.currentStrategy.linkedProjectId = projectId;
                    this.currentStrategy.linkedCompanyId = companyId;
                    this.saveStrategyToHistory(this.currentStrategy);
                }
                
                // Log activity
                if (window.cavCRM?.logActivity) {
                    window.cavCRM.logActivity('strategy_saved', {
                        assetId: this.currentAsset.id,
                        assetFilename: this.currentAsset.filename,
                        companyId: companyId,
                        projectId: projectId
                    });
                }
                
                modal.remove();
                alert('✅ Strategy saved to CRM!');
            });
    };

    window.StrategyModule = StrategyModule;

    console.warn(`🎯 Strategy Module loaded - Version ${STRATEGY_VERSION}`);
    console.warn('   Features: Placement Matrix, Derivatives, A/B Tests, Fatigue Prediction');
    console.warn('   v3.0.8: Persistence, CRM linking, history tracking, Save to CRM');

})();

