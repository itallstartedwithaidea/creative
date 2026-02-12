/**
 * Data Models - Creative Asset Validator v3.0
 * Extended data schemas for Analysis, Strategy, and Learn modules
 */

(function() {
    'use strict';

    const DATA_MODELS_VERSION = '3.0.0';

    // ============================================
    // ANALYSIS DATA MODELS
    // ============================================

    /**
     * Hook Analysis Result
     * Evaluates first 3 seconds / initial impression
     */
    const HookAnalysis = {
        create: (data = {}) => ({
            assetId: data.assetId || null,
            overallScore: data.overallScore || 0, // 0-100
            visualDisruptionScore: data.visualDisruptionScore || 0,
            motionQualityScore: data.motionQualityScore || 0,
            emotionalTriggerScore: data.emotionalTriggerScore || 0,
            textHookScore: data.textHookScore || 0,
            audioHookScore: data.audioHookScore || null, // null for images
            faceDetected: data.faceDetected || false,
            eyeContact: data.eyeContact || false,
            firstFrameElements: data.firstFrameElements || [],
            improvementSuggestions: data.improvementSuggestions || [],
            confidenceLevel: data.confidenceLevel || 'medium', // high, medium, low
            analyzedAt: data.analyzedAt || new Date().toISOString()
        }),
        
        getScoreInterpretation: (score) => {
            if (score >= 90) return { level: 'elite', description: 'Elite hook - high thumb-stop potential' };
            if (score >= 70) return { level: 'strong', description: 'Strong hook - good stopping power' };
            if (score >= 50) return { level: 'average', description: 'Average hook - benchmark performance expected' };
            if (score >= 30) return { level: 'weak', description: 'Weak hook - below average expected' };
            return { level: 'critical', description: 'Critical - unlikely to perform, needs revision' };
        }
    };

    /**
     * CTA Analysis Result
     * Call-to-action effectiveness evaluation
     */
    const CTAAnalysis = {
        create: (data = {}) => ({
            assetId: data.assetId || null,
            ctaDetected: data.ctaDetected || false,
            ctaText: data.ctaText || null,
            ctaType: data.ctaType || 'none', // hard, soft, engagement, none
            presenceScore: data.presenceScore || 0, // 0-100, weight 25%
            clarityScore: data.clarityScore || 0, // 0-100, weight 30%
            placementScore: data.placementScore || 0, // 0-100, weight 20%
            urgencyScore: data.urgencyScore || 0, // 0-100, weight 15%
            platformAlignmentScore: data.platformAlignmentScore || 0, // 0-100, weight 10%
            overallEffectiveness: data.overallEffectiveness || 0, // 0-100
            platformAlignment: data.platformAlignment || [], // [{platform, aligned}]
            recommendations: data.recommendations || [],
            analyzedAt: data.analyzedAt || new Date().toISOString()
        }),

        calculateOverallScore: (analysis) => {
            return Math.round(
                (analysis.presenceScore * 0.25) +
                (analysis.clarityScore * 0.30) +
                (analysis.placementScore * 0.20) +
                (analysis.urgencyScore * 0.15) +
                (analysis.platformAlignmentScore * 0.10)
            );
        },

        ctaTypes: {
            hard: ['Buy Now', 'Sign Up Today', 'Get Started', 'Shop Now', 'Order Now', 'Subscribe'],
            soft: ['Learn More', 'See How', 'Discover', 'Explore', 'Find Out'],
            engagement: ['Comment Below', 'Share With Friends', 'Follow Us', 'Tag a Friend', 'Like & Subscribe']
        }
    };

    /**
     * Brand Compliance Result
     * Brand guideline adherence check
     */
    const BrandComplianceResult = {
        create: (data = {}) => ({
            assetId: data.assetId || null,
            brandProfileId: data.brandProfileId || null,
            overallCompliance: data.overallCompliance || 0, // 0-100
            logoPresent: data.logoPresent || false,
            logoCorrectVersion: data.logoCorrectVersion || false,
            logoPlacementValid: data.logoPlacementValid || false,
            logoScore: data.logoScore || 0,
            colorMatch: data.colorMatch || {
                primary: { detected: null, expected: null, match: false, tolerance: 5 },
                secondary: { detected: null, expected: null, match: false, tolerance: 5 },
                accent: { detected: null, expected: null, match: false, tolerance: 5 }
            },
            colorScore: data.colorScore || 0,
            fontsDetected: data.fontsDetected || [],
            fontMatch: data.fontMatch || false,
            fontScore: data.fontScore || 0,
            toneOfVoice: data.toneOfVoice || {
                detected: null,
                expected: null,
                match: false
            },
            toneScore: data.toneScore || 0,
            visualStyleMatch: data.visualStyleMatch || false,
            visualStyleScore: data.visualStyleScore || 0,
            issues: data.issues || [],
            recommendations: data.recommendations || [],
            analyzedAt: data.analyzedAt || new Date().toISOString()
        })
    };

    /**
     * Audio Strategy Result (Video only)
     * Sound-on vs sound-off optimization
     */
    const AudioStrategyResult = {
        create: (data = {}) => ({
            assetId: data.assetId || null,
            hasAudio: data.hasAudio || false,
            soundOffViable: data.soundOffViable || false,
            soundOffScore: data.soundOffScore || 0, // 0-100
            captionsPresent: data.captionsPresent || false,
            captionQuality: data.captionQuality || 0, // 0-100
            captionCoverage: data.captionCoverage || 0, // percentage
            musicPresent: data.musicPresent || false,
            musicMoodMatch: data.musicMoodMatch || null,
            isTrendingSound: data.isTrendingSound || false,
            voiceOverPresent: data.voiceOverPresent || false,
            voiceOverClarity: data.voiceOverClarity || 0,
            soundEffects: data.soundEffects || [],
            platformRecommendations: data.platformRecommendations || {
                tiktok: null,
                instagram_reels: null,
                facebook_feed: null,
                youtube: null,
                linkedin: null
            },
            overallScore: data.overallScore || 0,
            recommendations: data.recommendations || [],
            analyzedAt: data.analyzedAt || new Date().toISOString()
        })
    };

    /**
     * Thumb-Stop Score
     * Scroll-stopping potential prediction
     */
    const ThumbStopScore = {
        create: (data = {}) => ({
            assetId: data.assetId || null,
            overallScore: data.overallScore || 0, // 0-100
            visualSalience: data.visualSalience || 0, // weight 35%
            patternInterrupt: data.patternInterrupt || 0, // weight 25%
            emotionalHook: data.emotionalHook || 0, // weight 25%
            relevanceSignal: data.relevanceSignal || 0, // weight 15%
            colorContrast: data.colorContrast || 0,
            visualComplexity: data.visualComplexity || 0,
            focalPointClarity: data.focalPointClarity || 0,
            noveltyFactor: data.noveltyFactor || 0,
            facialExpressions: data.facialExpressions || null,
            bodyLanguage: data.bodyLanguage || null,
            productVisibility: data.productVisibility || 0,
            targetingCues: data.targetingCues || [],
            analyzedAt: data.analyzedAt || new Date().toISOString()
        }),

        calculateScore: (data) => {
            return Math.round(
                (data.visualSalience * 0.35) +
                (data.patternInterrupt * 0.25) +
                (data.emotionalHook * 0.25) +
                (data.relevanceSignal * 0.15)
            );
        }
    };

    /**
     * Performance Prediction
     * Expected performance metrics
     */
    const PerformancePrediction = {
        create: (data = {}) => ({
            assetId: data.assetId || null,
            ctr: {
                low: data.ctr?.low || 0,
                expected: data.ctr?.expected || 0,
                high: data.ctr?.high || 0
            },
            cpm: {
                low: data.cpm?.low || 0,
                expected: data.cpm?.expected || 0,
                high: data.cpm?.high || 0
            },
            engagementRate: {
                low: data.engagementRate?.low || 0,
                expected: data.engagementRate?.expected || 0,
                high: data.engagementRate?.high || 0
            },
            viewThroughRate: data.viewThroughRate || null, // for video
            conversionPotential: data.conversionPotential || 'medium', // high, medium, low
            confidenceFactors: data.confidenceFactors || [],
            calibrationData: data.calibrationData || null, // user's historical data
            predictedAt: data.predictedAt || new Date().toISOString()
        })
    };

    /**
     * Full Analysis Result
     * Complete analysis combining all modules
     */
    const FullAnalysis = {
        create: (data = {}) => ({
            assetId: data.assetId || null,
            analyzedAt: data.analyzedAt || new Date().toISOString(),
            hookAnalysis: data.hookAnalysis || null,
            ctaAnalysis: data.ctaAnalysis || null,
            brandCompliance: data.brandCompliance || null,
            audioStrategy: data.audioStrategy || null,
            thumbStopScore: data.thumbStopScore || null,
            performancePrediction: data.performancePrediction || null,
            placementMatrix: data.placementMatrix || null,
            derivativeRoadmap: data.derivativeRoadmap || null,
            aiProvider: data.aiProvider || { primary: null, secondary: null },
            processingTime: data.processingTime || 0,
            confidence: data.confidence || 'medium' // high, medium, low
        })
    };

    // ============================================
    // STRATEGY DATA MODELS
    // ============================================

    /**
     * Placement Matrix
     * Platform deployment recommendations
     */
    const PlacementMatrix = {
        create: (data = {}) => ({
            assetId: data.assetId || null,
            placements: data.placements || [],
            generatedAt: data.generatedAt || new Date().toISOString()
        }),

        createPlacement: (data = {}) => ({
            platform: data.platform || '',
            placement: data.placement || '',
            specMatch: data.specMatch || 'incompatible', // ready, needs-work, incompatible
            specIssues: data.specIssues || [],
            creativeFit: data.creativeFit || 0, // 0-100
            fitFactors: {
                platformCulture: data.fitFactors?.platformCulture || 0,
                audienceAlignment: data.fitFactors?.audienceAlignment || 0,
                formatOptimization: data.fitFactors?.formatOptimization || 0,
                algorithmPreference: data.fitFactors?.algorithmPreference || 0
            },
            predictedPerformance: data.predictedPerformance || 'medium', // high, medium, low
            recommendedAction: data.recommendedAction || 'avoid', // deploy, create-derivative, test, avoid
            priority: data.priority || 0
        })
    };

    /**
     * Derivative Roadmap
     * Required creative variations
     */
    const DerivativeRoadmap = {
        create: (data = {}) => ({
            assetId: data.assetId || null,
            originalSpecs: data.originalSpecs || { width: 0, height: 0, duration: null },
            derivatives: data.derivatives || [],
            generatedAt: data.generatedAt || new Date().toISOString()
        }),

        createDerivative: (data = {}) => ({
            id: data.id || `deriv_${Date.now()}`,
            targetSpec: data.targetSpec || '', // e.g., "9:16 Vertical"
            targetPlacements: data.targetPlacements || [],
            fromOriginal: data.fromOriginal || true,
            transformationType: data.transformationType || 'crop', // crop, outpaint, trim, extend
            priority: data.priority || 'medium', // critical, high, medium, low
            canAutoFix: data.canAutoFix || false,
            estimatedEffort: data.estimatedEffort || 'manual'
        })
    };

    /**
     * Budget Allocation
     * Recommended budget distribution
     */
    const BudgetAllocation = {
        create: (data = {}) => ({
            totalBudget: data.totalBudget || 0,
            currency: data.currency || 'USD',
            period: data.period || 'monthly',
            platformAllocations: data.platformAllocations || [],
            creativeAllocations: data.creativeAllocations || [],
            estimatedResults: data.estimatedResults || null,
            generatedAt: data.generatedAt || new Date().toISOString()
        }),

        createPlatformAllocation: (data = {}) => ({
            platform: data.platform || '',
            amount: data.amount || 0,
            percentage: data.percentage || 0,
            placements: data.placements || [],
            estimatedReach: data.estimatedReach || 0,
            estimatedClicks: data.estimatedClicks || 0
        })
    };

    /**
     * A/B Test Recommendation
     * Testing suggestions
     */
    const ABTestRecommendation = {
        create: (data = {}) => ({
            assetId: data.assetId || null,
            testId: data.testId || `test_${Date.now()}`,
            testElement: data.testElement || '', // hook, cta, headline, etc.
            hypothesis: data.hypothesis || '',
            expectedImpact: data.expectedImpact || 'medium', // high, medium, low
            expectedLift: data.expectedLift || { low: 0, high: 0 },
            effortLevel: data.effortLevel || 'medium',
            priority: data.priority || 'P2',
            variants: data.variants || [],
            minimumSampleSize: data.minimumSampleSize || 1000,
            estimatedDuration: data.estimatedDuration || '7 days',
            successMetrics: data.successMetrics || [],
            generatedAt: data.generatedAt || new Date().toISOString()
        })
    };

    /**
     * Creative Fatigue Prediction
     * Performance degradation timeline
     */
    const CreativeFatiguePrediction = {
        create: (data = {}) => ({
            assetId: data.assetId || null,
            estimatedDaysToFatigue: data.estimatedDaysToFatigue || 30,
            fatigueDate: data.fatigueDate || null,
            refreshRecommendationDate: data.refreshRecommendationDate || null,
            fatigueFactors: {
                audienceSize: data.fatigueFactors?.audienceSize || 'medium',
                frequencyCap: data.fatigueFactors?.frequencyCap || null,
                creativeDistinctiveness: data.fatigueFactors?.creativeDistinctiveness || 'medium',
                platform: data.fatigueFactors?.platform || null,
                contentType: data.fatigueFactors?.contentType || null,
                seasonality: data.fatigueFactors?.seasonality || null
            },
            earlyWarningIndicators: data.earlyWarningIndicators || [],
            predictedAt: data.predictedAt || new Date().toISOString()
        })
    };

    // ============================================
    // LEARN DATA MODELS
    // ============================================

    /**
     * Swipe File Entry
     * Saved creative inspiration
     */
    const SwipeFileEntry = {
        create: (data = {}) => ({
            id: data.id || `swipe_${Date.now()}`,
            source: data.source || 'upload', // upload, url
            sourceUrl: data.sourceUrl || null,
            thumbnailData: data.thumbnailData || null, // base64
            assetData: data.assetData || null,
            analysis: data.analysis || null,
            tags: data.tags || [],
            collections: data.collections || [],
            notes: data.notes || '',
            savedAt: data.savedAt || new Date().toISOString(),
            savedBy: data.savedBy || null,
            performance: data.performance || null, // [{metric, value, date}]
            isCompetitor: data.isCompetitor || false,
            competitorId: data.competitorId || null
        })
    };

    /**
     * Competitor Profile
     * Competitor tracking configuration
     */
    const Competitor = {
        create: (data = {}) => ({
            id: data.id || `comp_${Date.now()}`,
            name: data.name || '',
            domain: data.domain || '',
            adLibraryUrls: data.adLibraryUrls || [], // [{platform, url}]
            monitoringFrequency: data.monitoringFrequency || 'weekly',
            lastChecked: data.lastChecked || null,
            alerts: data.alerts || [], // [{type, threshold}]
            tags: data.tags || [],
            notes: data.notes || '',
            createdAt: data.createdAt || new Date().toISOString()
        })
    };

    /**
     * Best Practice Entry
     * Curated knowledge base item
     */
    const BestPractice = {
        create: (data = {}) => ({
            id: data.id || `bp_${Date.now()}`,
            category: data.category || 'general',
            platform: data.platform || 'all',
            title: data.title || '',
            content: data.content || '',
            source: data.source || '',
            sourceUrl: data.sourceUrl || '',
            publishedAt: data.publishedAt || null,
            addedAt: data.addedAt || new Date().toISOString(),
            lastVerified: data.lastVerified || null,
            tags: data.tags || [],
            relevanceScore: data.relevanceScore || 50
        }),

        categories: [
            'platform_guidelines',
            'format_best_practices',
            'industry_benchmarks',
            'creative_frameworks',
            'case_studies',
            'algorithm_updates'
        ]
    };

    /**
     * Performance Benchmark
     * Industry benchmark data
     */
    const Benchmark = {
        create: (data = {}) => ({
            id: data.id || `bench_${Date.now()}`,
            metric: data.metric || '', // ctr, cpm, cpc, etc.
            platform: data.platform || 'all',
            placement: data.placement || null,
            industry: data.industry || null,
            region: data.region || null,
            value: {
                low: data.value?.low || 0,
                median: data.value?.median || 0,
                high: data.value?.high || 0
            },
            source: data.source || 'research', // searchapi, user-input, research
            lastUpdated: data.lastUpdated || new Date().toISOString(),
            sampleSize: data.sampleSize || null
        }),

        metrics: ['ctr', 'cpm', 'cpc', 'conversion_rate', 'engagement_rate', 'view_through_rate']
    };

    /**
     * URL Analysis Result
     * Analysis of external URL content
     */
    const URLAnalysisResult = {
        create: (data = {}) => ({
            id: data.id || `url_${Date.now()}`,
            url: data.url || '',
            urlType: data.urlType || 'unknown', // ad_library, landing_page, social_post, video, image
            analyzedAt: data.analyzedAt || new Date().toISOString(),
            creativeSummary: data.creativeSummary || null,
            hookAnalysis: data.hookAnalysis || null,
            messageArchitecture: data.messageArchitecture || null,
            visualStrategy: data.visualStrategy || null,
            ctaEvaluation: data.ctaEvaluation || null,
            platformOptimization: data.platformOptimization || null,
            performanceIndicators: data.performanceIndicators || null,
            takeaways: data.takeaways || [],
            savedToSwipeFile: data.savedToSwipeFile || false
        })
    };

    /**
     * Landing Page Sync Check
     * Message alignment between ad and landing page
     */
    const LandingPageSync = {
        create: (data = {}) => ({
            assetId: data.assetId || null,
            landingPageUrl: data.landingPageUrl || '',
            syncScore: data.syncScore || 0, // 0-100
            headlineMatch: data.headlineMatch || { adText: null, lpText: null, match: false },
            visualContinuity: data.visualContinuity || { score: 0, issues: [] },
            offerConsistency: data.offerConsistency || { adOffer: null, lpOffer: null, match: false },
            ctaAlignment: data.ctaAlignment || { adCta: null, lpCta: null, match: false },
            keywordRelevance: data.keywordRelevance || { keywords: [], present: [] },
            trustSignals: data.trustSignals || { adSignals: [], lpSignals: [], overlap: [] },
            recommendations: data.recommendations || [],
            analyzedAt: data.analyzedAt || new Date().toISOString()
        })
    };

    // ============================================
    // STORAGE HELPERS
    // ============================================

    const StorageHelpers = {
        // Save analysis to IndexedDB
        saveAnalysis: async (analysis) => {
            try {
                if (window.cavApp?.storage?.saveAnalysis) {
                    return await window.cavApp.storage.saveAnalysis(analysis);
                }
                // Fallback to localStorage
                const key = `analysis_${analysis.assetId}`;
                localStorage.setItem(key, JSON.stringify(analysis));
                return true;
            } catch (e) {
                console.error('[DataModels] Error saving analysis:', e);
                return false;
            }
        },

        // Get analysis from storage
        getAnalysis: async (assetId) => {
            try {
                if (window.cavApp?.storage?.getAnalysis) {
                    return await window.cavApp.storage.getAnalysis(assetId);
                }
                const key = `analysis_${assetId}`;
                const stored = localStorage.getItem(key);
                return stored ? JSON.parse(stored) : null;
            } catch (e) {
                console.error('[DataModels] Error getting analysis:', e);
                return null;
            }
        },

        // Save swipe file entry
        saveSwipeEntry: (entry) => {
            try {
                const entries = JSON.parse(localStorage.getItem('cav_swipe_file') || '[]');
                const index = entries.findIndex(e => e.id === entry.id);
                if (index >= 0) {
                    entries[index] = entry;
                } else {
                    entries.push(entry);
                }
                localStorage.setItem('cav_swipe_file', JSON.stringify(entries));
                return true;
            } catch (e) {
                console.error('[DataModels] Error saving swipe entry:', e);
                return false;
            }
        },

        // Get all swipe entries
        getSwipeEntries: () => {
            try {
                return JSON.parse(localStorage.getItem('cav_swipe_file') || '[]');
            } catch (e) {
                return [];
            }
        },

        // Save benchmark data
        saveBenchmark: (benchmark) => {
            try {
                const benchmarks = JSON.parse(localStorage.getItem('cav_benchmarks') || '[]');
                const index = benchmarks.findIndex(b => b.id === benchmark.id);
                if (index >= 0) {
                    benchmarks[index] = benchmark;
                } else {
                    benchmarks.push(benchmark);
                }
                localStorage.setItem('cav_benchmarks', JSON.stringify(benchmarks));
                return true;
            } catch (e) {
                console.error('[DataModels] Error saving benchmark:', e);
                return false;
            }
        },

        // Get benchmarks
        getBenchmarks: (filters = {}) => {
            try {
                let benchmarks = JSON.parse(localStorage.getItem('cav_benchmarks') || '[]');
                if (filters.metric) benchmarks = benchmarks.filter(b => b.metric === filters.metric);
                if (filters.platform) benchmarks = benchmarks.filter(b => b.platform === filters.platform || b.platform === 'all');
                if (filters.industry) benchmarks = benchmarks.filter(b => b.industry === filters.industry || !b.industry);
                return benchmarks;
            } catch (e) {
                return [];
            }
        },

        // Save best practice
        saveBestPractice: (practice) => {
            try {
                const practices = JSON.parse(localStorage.getItem('cav_best_practices') || '[]');
                const index = practices.findIndex(p => p.id === practice.id);
                if (index >= 0) {
                    practices[index] = practice;
                } else {
                    practices.push(practice);
                }
                localStorage.setItem('cav_best_practices', JSON.stringify(practices));
                return true;
            } catch (e) {
                console.error('[DataModels] Error saving best practice:', e);
                return false;
            }
        },

        // Get best practices
        getBestPractices: (filters = {}) => {
            try {
                let practices = JSON.parse(localStorage.getItem('cav_best_practices') || '[]');
                if (filters.category) practices = practices.filter(p => p.category === filters.category);
                if (filters.platform) practices = practices.filter(p => p.platform === filters.platform || p.platform === 'all');
                return practices.sort((a, b) => b.relevanceScore - a.relevanceScore);
            } catch (e) {
                return [];
            }
        }
    };

    // ============================================
    // EXPORT
    // ============================================

    window.CAVDataModels = {
        version: DATA_MODELS_VERSION,
        
        // Analysis Models
        HookAnalysis,
        CTAAnalysis,
        BrandComplianceResult,
        AudioStrategyResult,
        ThumbStopScore,
        PerformancePrediction,
        FullAnalysis,
        
        // Strategy Models
        PlacementMatrix,
        DerivativeRoadmap,
        BudgetAllocation,
        ABTestRecommendation,
        CreativeFatiguePrediction,
        
        // Learn Models
        SwipeFileEntry,
        Competitor,
        BestPractice,
        Benchmark,
        URLAnalysisResult,
        LandingPageSync,
        
        // Storage Helpers
        Storage: StorageHelpers
    };

    console.warn('📦 Data Models loaded - Version 3.0.0');
    console.warn('   Models: Analysis, Strategy, Learn');

})();

