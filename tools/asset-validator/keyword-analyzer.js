/**
 * Keyword & Landing Page Analyzer Module
 * Version: 2.3.2 - January 17, 2026
 * Advanced Keyword & Landing Page Intelligence System
 * Comprehensive PPC, SEO, Quality Score, and Conversion Analysis
 * 
 * v2.3.2 ENHANCEMENTS:
 * - FIXED ICON STYLING: Icons now display as rounded squares not circles
 * - FIXED TEXT SIZING: Projected Impact cards now handle long text gracefully
 * - Added consistent icon-box CSS classes
 * - Improved line-height and letter-spacing consistency
 * 
 * v2.3.1 ENHANCEMENTS:
 * - STANDARDIZED TYPOGRAPHY: Uses CSS variables from main app
 * - Font inheritance for all form elements (buttons, inputs, selects)
 * - Improved font smoothing and letter-spacing
 * - Consistent monospace font for code/keyword inputs
 * 
 * v2.3.0 ENHANCEMENTS:
 * - CONSISTENT SVG ICONS: Replaced all emoji icons with proper SVG stroke icons
 * - Improved visual consistency with the rest of the application
 * - Better icon rendering at all sizes
 * 
 * v2.2.0 ENHANCEMENTS:
 * - TWO-PHASE AI ANALYSIS: Keywords first, then deep strategic insights
 * - Increased max tokens to 16384 for comprehensive responses
 * - Lower temperature (0.3) for more consistent, focused output
 * - Content Strategy Blueprint with messaging hierarchy
 * - Better error handling and fallbacks
 * 
 * v2.1.0 ENHANCEMENTS:
 * - Strategic narrative with "big picture" overview
 * - Market context and competitive positioning
 * - Audience psychology insights (WHY people search)
 * - Priority keyword strategies with reasoning
 * - Projected impact estimates
 * - Ad copy insights with emotional triggers
 * - Competitive intelligence
 * - Risk factors analysis
 */

window.KeywordAnalyzer = (function() {
    'use strict';

    // ==================== CONFIGURATION ====================
    const CONFIG = {
        version: '2.3.2',
        maxKeywords: 500,
        maxCompetitors: 5,
        scoringWeights: {
            withVolume: {
                pageRelevance: 0.25,
                intentAlignment: 0.20,
                searchVolume: 0.20,
                cpcValue: 0.15,
                competition: 0.10,
                qualityScore: 0.10
            },
            withoutVolume: {
                pageRelevance: 0.35,
                intentAlignment: 0.25,
                serpCompetition: 0.15,
                keywordStructure: 0.10,
                relatedFrequency: 0.10,
                semanticCentrality: 0.05
            }
        },
        // Enhanced analysis features
        enhancedFeatures: {
            serpAnalysis: true,
            paaQuestions: true,
            relatedSearches: true,
            competitorKeywords: true,
            contentGaps: true,
            technicalSEO: true,
            qualityScorePrediction: true,
            conversionArchitecture: true,
            valuePropositionAnalysis: true,
            negativeKeywords: true,
            adCopyGeneration: true
        }
    };

    // ==================== ANALYSIS KNOWLEDGE FRAMEWORK ====================
    // This framework guides AI analysis - not hardcoded results
    const ANALYSIS_FRAMEWORK = {
        // Intent classification system
        intentTypes: {
            know: { signals: ['what is', 'how to', 'why', 'guide', 'tutorial', 'tips', 'learn'], pageType: 'educational' },
            knowSimple: { signals: ['price', 'hours', 'phone', 'address'], pageType: 'direct answer' },
            do: { signals: ['buy', 'order', 'purchase', 'download', 'sign up', 'register'], pageType: 'transactional' },
            website: { signals: ['login', 'account', 'brand name'], pageType: 'navigational' }
        },
        
        // Quality Score component factors
        qualityScoreFactors: {
            expectedCTR: ['keyword in headline', 'keyword in description', 'keyword in display URL', 'ad extensions'],
            adRelevance: ['semantic theme alignment', 'intent alignment', 'ad group structure'],
            landingPageExperience: ['keyword presence', 'content depth', 'mobile-friendly', 'page speed', 'transparency']
        },
        
        // Value proposition frameworks to detect
        valuePropositionFrameworks: ['BAB', 'PAS', 'FAB', 'UVP', 'AIDA'],
        
        // Keyword categorization
        keywordCategories: {
            head: { wordCount: '1-2', volumeLevel: 'high', intent: 'broad' },
            body: { wordCount: '2-3', volumeLevel: 'medium', intent: 'moderate' },
            longTail: { wordCount: '4+', volumeLevel: 'low', intent: 'specific' }
        },
        
        // Funnel stages
        funnelStages: {
            tofu: { signals: ['what is', 'guide', 'examples', 'tips'], intent: 'awareness' },
            mofu: { signals: ['best', 'comparison', 'review', 'vs', 'alternative'], intent: 'consideration' },
            bofu: { signals: ['buy', 'price', 'discount', 'coupon', 'demo', 'trial'], intent: 'decision' }
        },
        
        // Negative keyword patterns
        negativePatterns: {
            intentMismatch: ['free', 'jobs', 'careers', 'tutorial', 'DIY', 'how to make'],
            support: ['login', 'password', 'cancel', 'refund', 'customer service'],
            competitor: ['competitor brand names'],
            geographic: ['cities/states not served']
        }
    };

    // ==================== SEARCHAPI INTEGRATION ====================
    async function fetchSERPData(keyword) {
        const searchApiKey = getSearchAPIKey();
        if (!searchApiKey) {
            console.log('[KWA] No SearchAPI key, skipping SERP data');
            return null;
        }

        try {
            const response = await fetch(`https://www.searchapi.io/api/v1/search?api_key=${searchApiKey}&engine=google&q=${encodeURIComponent(keyword)}&num=10`);
            if (!response.ok) return null;
            
            const data = await response.json();
            return {
                organic: data.organic_results?.slice(0, 10) || [],
                paa: data.related_questions || [],
                relatedSearches: data.related_searches || [],
                adsCount: data.ads?.length || 0,
                featuredSnippet: data.answer_box ? true : false
            };
        } catch (e) {
            console.error('[KWA] SearchAPI error:', e);
            return null;
        }
    }

    function getSearchAPIKey() {
        if (window.CAVSettings?.manager?.getAPIKey) {
            return window.CAVSettings.manager.getAPIKey('searchapi');
        }
        try {
            const session = JSON.parse(localStorage.getItem('cav_session') || '{}');
            const userEmail = session?.user?.email;
            if (userEmail) {
                const userKey = `cav_v3_settings_${userEmail.toLowerCase().replace(/[^a-z0-9]/gi, '_')}`;
                const settings = JSON.parse(localStorage.getItem(userKey) || '{}');
                return settings.apiKeys?.searchapi?.key;
            }
        } catch (e) {}
        return null;
    }

    // ==================== INTENT TYPES ====================
    const INTENT_TYPES = {
        informational: { label: 'Informational', color: '#60a5fa', icon: 'ℹ', description: 'User wants to learn' },
        navigational: { label: 'Navigational', color: '#a78bfa', icon: '↗', description: 'User looking for specific site' },
        commercial: { label: 'Commercial', color: '#fbbf24', icon: '🔍', description: 'User researching before purchase' },
        transactional: { label: 'Transactional', color: '#34d399', icon: '💳', description: 'User ready to buy/act' }
    };

    // ==================== GOOGLE ADS COLUMN MAPPINGS ====================
    const GOOGLE_ADS_MAPPING = {
        "Keyword": "keyword",
        "Search term": "keyword",
        "Avg. monthly searches": "volume",
        "Avg monthly searches": "volume",
        "Competition": "competition",
        "Top of page bid (low range)": "cpc_low",
        "Top of page bid (high range)": "cpc_high",
        "Impr.": "impressions",
        "Impressions": "impressions",
        "Clicks": "clicks",
        "CTR": "ctr",
        "Avg. CPC": "avg_cpc",
        "Cost": "cost",
        "Conversions": "conversions",
        "Quality Score": "quality_score",
        "Quality score": "quality_score",
        "Conv. value": "conv_value",
        "Search impr. share": "impression_share"
    };

    // ==================== STATE ====================
    let state = {
        mode: 'page-to-keywords', // 'page-to-keywords', 'keywords-to-page', 'competitor'
        landingPageUrl: '',
        landingPageData: null,
        keywords: [],
        keywordData: [], // Enriched keyword data with scores
        competitorUrls: [],
        competitorData: [],
        uploadedFiles: [],
        analysisResults: null,
        isAnalyzing: false
    };

    // ==================== UI CREATION ====================
    function createUI() {
        return `
<style>
/* Base Typography - Uses CSS Variables from main app */
.kwa-container { 
    font-family: var(--cav-font-sans, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif); 
    color: #e5e7eb; 
    max-width: 1400px; 
    margin: 0 auto; 
    padding: 24px;
    font-size: 14px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
.kwa-container *, .kwa-container *::before, .kwa-container *::after { box-sizing: border-box; }
.kwa-container button, .kwa-container input, .kwa-container select, .kwa-container textarea { font-family: inherit; }
.kwa-container h3, .kwa-container h4 { font-weight: 600; letter-spacing: -0.01em; }
.kwa-container p { line-height: 1.6; }

/* Consistent icon containers */
.kwa-icon-box { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border-radius: 6px; }
.kwa-icon-box svg { width: 16px; height: 16px; }
.kwa-icon-box.info { background: rgba(96, 165, 250, 0.15); color: #60a5fa; }
.kwa-icon-box.warning { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
.kwa-icon-box.success { background: rgba(34, 197, 94, 0.15); color: #4ade80; }
.kwa-icon-box.error { background: rgba(239, 68, 68, 0.15); color: #f87171; }
.kwa-icon-box.purple { background: rgba(139, 92, 246, 0.15); color: #a78bfa; }
.kwa-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #374151; }
.kwa-logo { width: 48px; height: 48px; color: #9ca3af; }
.kwa-header h1 { font-size: 28px; font-weight: 700; color: #f9fafb; margin: 0; letter-spacing: -0.025em; }
.kwa-header p { color: #9ca3af; margin: 4px 0 0 0; font-size: 14px; }

/* Mode Tabs */
.kwa-mode-tabs { display: flex; gap: 8px; margin-bottom: 24px; background: #1f2937; padding: 8px; border-radius: 12px; }
.kwa-mode-tab { flex: 1; background: transparent; border: none; padding: 14px 20px; border-radius: 8px; color: #9ca3af; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
.kwa-mode-tab:hover { background: #374151; color: #e5e7eb; }
.kwa-mode-tab.active { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; }
.kwa-mode-tab svg { width: 18px; height: 18px; }

.kwa-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
@media (max-width: 1024px) { .kwa-grid { grid-template-columns: 1fr; } }

.kwa-card { background: #1f2937; border-radius: 12px; padding: 24px; border: 1px solid #374151; }
.kwa-card-title { font-size: 16px; font-weight: 600; color: #f9fafb; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px; }
.kwa-card-title svg { width: 20px; height: 20px; color: #60a5fa; }

/* Form Elements */
.kwa-form-group { margin-bottom: 16px; }
.kwa-label { display: block; font-size: 13px; font-weight: 500; color: #9ca3af; margin-bottom: 6px; }
.kwa-label-info { font-weight: 400; color: #6b7280; }
.kwa-input { width: 100%; background: #111827; border: 1px solid #374151; border-radius: 8px; padding: 12px; color: #e5e7eb; font-size: 14px; box-sizing: border-box; }
.kwa-input:focus { outline: none; border-color: #3b82f6; }
.kwa-input::placeholder { color: #4b5563; }
.kwa-textarea { min-height: 120px; resize: vertical; font-family: 'SF Mono', 'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace; font-size: 13px; line-height: 1.5; }

/* URL Input with Scrape Button */
.kwa-url-group { display: flex; gap: 8px; }
.kwa-url-group .kwa-input { flex: 1; }
.kwa-scrape-btn { background: #374151; border: 1px solid #4b5563; border-radius: 8px; padding: 12px 16px; color: #e5e7eb; font-size: 13px; cursor: pointer; white-space: nowrap; display: flex; align-items: center; gap: 6px; transition: all 0.2s; }
.kwa-scrape-btn:hover { background: #4b5563; }
.kwa-scrape-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.kwa-scrape-btn svg { width: 16px; height: 16px; }

/* File Upload */
.kwa-upload-zone { border: 2px dashed #374151; border-radius: 12px; padding: 32px; text-align: center; cursor: pointer; transition: all 0.2s; }
.kwa-upload-zone:hover { border-color: #4b5563; background: rgba(55, 65, 81, 0.3); }
.kwa-upload-zone.dragover { border-color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
.kwa-upload-zone svg { width: 40px; height: 40px; color: #6b7280; margin-bottom: 12px; }
.kwa-upload-zone p { margin: 0; color: #9ca3af; font-size: 14px; }
.kwa-upload-zone .kwa-upload-formats { font-size: 12px; color: #6b7280; margin-top: 8px; }
.kwa-upload-input { display: none; }

/* Uploaded Files List */
.kwa-files-list { margin-top: 12px; }
.kwa-file-item { display: flex; align-items: center; justify-content: space-between; background: #111827; border: 1px solid #374151; border-radius: 8px; padding: 10px 12px; margin-bottom: 8px; }
.kwa-file-info { display: flex; align-items: center; gap: 10px; }
.kwa-file-icon { width: 32px; height: 32px; background: #374151; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #9ca3af; }
.kwa-file-name { font-size: 13px; color: #e5e7eb; }
.kwa-file-size { font-size: 11px; color: #6b7280; }
.kwa-file-remove { background: none; border: none; color: #6b7280; cursor: pointer; padding: 4px; }
.kwa-file-remove:hover { color: #ef4444; }

/* Competitor URLs */
.kwa-competitor-list { margin-top: 12px; }
.kwa-competitor-item { display: flex; gap: 8px; margin-bottom: 8px; }
.kwa-competitor-item .kwa-input { flex: 1; }
.kwa-add-competitor { background: #374151; border: 1px dashed #4b5563; border-radius: 8px; padding: 10px; color: #9ca3af; font-size: 13px; cursor: pointer; width: 100%; text-align: center; }
.kwa-add-competitor:hover { background: #4b5563; color: #e5e7eb; }

/* Page Preview */
.kwa-page-preview { background: #111827; border: 1px solid #374151; border-radius: 12px; overflow: hidden; }
.kwa-page-screenshot { width: 100%; height: 200px; object-fit: cover; object-position: top; background: #1f2937; }
.kwa-page-meta { padding: 16px; }
.kwa-page-url { font-size: 12px; color: #6b7280; margin-bottom: 8px; word-break: break-all; }
.kwa-page-title { font-size: 16px; font-weight: 600; color: #3b82f6; margin-bottom: 4px; }
.kwa-page-desc { font-size: 13px; color: #9ca3af; line-height: 1.5; }
.kwa-page-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #374151; }
.kwa-page-stat { text-align: center; }
.kwa-page-stat-value { font-size: 20px; font-weight: 700; color: #f9fafb; }
.kwa-page-stat-label { font-size: 11px; color: #6b7280; text-transform: uppercase; }

/* Analyze Button */
.kwa-analyze-btn { width: 100%; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border: none; border-radius: 10px; padding: 16px 24px; font-size: 16px; font-weight: 600; color: white; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 20px; }
.kwa-analyze-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3); }
.kwa-analyze-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }
.kwa-analyze-btn svg { width: 20px; height: 20px; }

/* Results Section */
.kwa-results { margin-top: 24px; }
.kwa-results-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.kwa-results-title { font-size: 18px; font-weight: 600; color: #f9fafb; }
.kwa-results-actions { display: flex; gap: 8px; }

/* Score Summary */
.kwa-score-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
@media (max-width: 768px) { .kwa-score-summary { grid-template-columns: repeat(2, 1fr); } }
.kwa-score-card { background: #111827; border: 1px solid #374151; border-radius: 12px; padding: 20px; text-align: center; }
.kwa-score-value { font-size: 32px; font-weight: 700; color: #f9fafb; }
.kwa-score-value.high { color: #34d399; }
.kwa-score-value.medium { color: #fbbf24; }
.kwa-score-value.low { color: #f87171; }
.kwa-score-label { font-size: 12px; color: #6b7280; margin-top: 4px; }

/* Issues Panel */
.kwa-issues { background: #111827; border: 1px solid #374151; border-radius: 12px; margin-bottom: 24px; }
.kwa-issue-group { padding: 16px; border-bottom: 1px solid #374151; }
.kwa-issue-group:last-child { border-bottom: none; }
.kwa-issue-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.kwa-issue-icon { width: 24px; height: 24px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.kwa-issue-icon svg { width: 16px; height: 16px; }
.kwa-issue-icon.critical { background: rgba(239, 68, 68, 0.2); color: #f87171; }
.kwa-issue-icon.warning { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
.kwa-issue-icon.info { background: rgba(96, 165, 250, 0.2); color: #60a5fa; }
.kwa-issue-title { font-size: 14px; font-weight: 600; color: #f9fafb; }
.kwa-issue-count { font-size: 12px; color: #6b7280; margin-left: auto; }
.kwa-issue-desc { font-size: 13px; color: #9ca3af; line-height: 1.6; }
.kwa-issue-action { font-size: 12px; color: #60a5fa; margin-top: 8px; display: flex; align-items: flex-start; gap: 6px; }

/* Keywords Table */
.kwa-table-wrapper { overflow-x: auto; }
.kwa-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.kwa-table th { background: #111827; padding: 12px; text-align: left; font-weight: 600; color: #9ca3af; border-bottom: 1px solid #374151; white-space: nowrap; }
.kwa-table td { padding: 12px; border-bottom: 1px solid #374151; color: #e5e7eb; }
.kwa-table tr:hover td { background: rgba(55, 65, 81, 0.3); }
.kwa-table .kwa-keyword { font-weight: 500; }
.kwa-table .kwa-score { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 8px; font-weight: 700; font-size: 14px; }
.kwa-table .kwa-score.high { background: rgba(52, 211, 153, 0.2); color: #34d399; }
.kwa-table .kwa-score.medium { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
.kwa-table .kwa-score.low { background: rgba(248, 113, 113, 0.2); color: #f87171; }
.kwa-intent-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; }
.kwa-intent-badge.informational { background: rgba(96, 165, 250, 0.2); color: #60a5fa; }
.kwa-intent-badge.navigational { background: rgba(167, 139, 250, 0.2); color: #a78bfa; }
.kwa-intent-badge.commercial { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
.kwa-intent-badge.transactional { background: rgba(52, 211, 153, 0.2); color: #34d399; }

/* Keyword Location Tags */
.kwa-locations { display: flex; flex-wrap: wrap; gap: 4px; }
.kwa-location-tag { background: #374151; padding: 2px 6px; border-radius: 4px; font-size: 10px; color: #9ca3af; }
.kwa-location-tag.found { background: rgba(52, 211, 153, 0.2); color: #34d399; }

/* Expandable Row */
.kwa-expand-btn { background: none; border: none; color: #6b7280; cursor: pointer; padding: 4px; }
.kwa-expand-btn:hover { color: #e5e7eb; }
.kwa-expanded-row { background: #111827; }
.kwa-expanded-content { padding: 16px 24px; }
.kwa-recommendations { margin-top: 12px; }
.kwa-recommendation { display: flex; align-items: flex-start; gap: 8px; padding: 8px 12px; background: #1f2937; border-radius: 6px; margin-bottom: 8px; }
.kwa-recommendation svg { width: 16px; height: 16px; color: #60a5fa; flex-shrink: 0; margin-top: 2px; }
.kwa-recommendation p { margin: 0; font-size: 12px; color: #9ca3af; }

/* Competitor Comparison */
.kwa-comparison-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; }
.kwa-comparison-card { background: #111827; border: 1px solid #374151; border-radius: 12px; overflow: hidden; }
.kwa-comparison-header { padding: 16px; border-bottom: 1px solid #374151; }
.kwa-comparison-header.yours { background: rgba(59, 130, 246, 0.1); border-left: 3px solid #3b82f6; }
.kwa-comparison-label { font-size: 11px; color: #6b7280; text-transform: uppercase; margin-bottom: 4px; }
.kwa-comparison-url { font-size: 13px; color: #e5e7eb; word-break: break-all; }
.kwa-comparison-body { padding: 16px; }
.kwa-comparison-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #374151; }
.kwa-comparison-row:last-child { border-bottom: none; }
.kwa-comparison-metric { font-size: 12px; color: #6b7280; }
.kwa-comparison-value { font-size: 13px; color: #e5e7eb; font-weight: 500; }
.kwa-comparison-value.better { color: #34d399; }
.kwa-comparison-value.worse { color: #f87171; }

/* Actions */
.kwa-action-btn { background: #374151; border: 1px solid #4b5563; border-radius: 8px; padding: 10px 16px; font-size: 13px; color: #e5e7eb; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
.kwa-action-btn:hover { background: #4b5563; }
.kwa-action-btn svg { width: 16px; height: 16px; }
.kwa-action-btn.primary { background: #3b82f6; border-color: #3b82f6; }
.kwa-action-btn.primary:hover { background: #2563eb; }

/* Loading */
.kwa-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 40px; }
.kwa-spinner { width: 40px; height: 40px; border: 4px solid #374151; border-top-color: #3b82f6; border-radius: 50%; animation: kwa-spin 1s linear infinite; margin-bottom: 16px; }
@keyframes kwa-spin { to { transform: rotate(360deg); } }
.kwa-loading-text { color: #9ca3af; font-size: 14px; }
.kwa-loading-step { color: #6b7280; font-size: 12px; margin-top: 8px; }

/* Empty State */
.kwa-empty { text-align: center; padding: 60px 40px; }
.kwa-empty svg { width: 64px; height: 64px; color: #374151; margin-bottom: 16px; }
.kwa-empty h3 { font-size: 18px; color: #f9fafb; margin: 0 0 8px 0; }
.kwa-empty p { color: #6b7280; font-size: 14px; margin: 0; }

/* Tab content */
.kwa-tab-content { display: none; }
.kwa-tab-content.active { display: block; }
</style>

<div class="kwa-container">
    <div class="kwa-header">
        <svg class="kwa-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
            <path d="M11 8v6M8 11h6"/>
        </svg>
        <div>
            <h1>Keyword & Landing Page Analyzer</h1>
            <p>Analyze keywords, landing pages, and competitor gaps with AI-powered insights</p>
        </div>
    </div>

    <!-- Mode Tabs -->
    <div class="kwa-mode-tabs">
        <button type="button" class="kwa-mode-tab active" data-mode="page-to-keywords">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            Landing Page → Keywords
        </button>
        <button type="button" class="kwa-mode-tab" data-mode="keywords-to-page">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Keywords → Landing Page
        </button>
        <button type="button" class="kwa-mode-tab" data-mode="competitor">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Competitor Analysis
        </button>
    </div>

    <div class="kwa-grid">
        <!-- Left Column: Inputs -->
        <div>
            <!-- Landing Page Input -->
            <div class="kwa-card" id="kwa-page-input">
                <h3 class="kwa-card-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    Landing Page URL
                </h3>
                <div class="kwa-form-group">
                    <div class="kwa-url-group">
                        <input type="url" class="kwa-input" id="kwa-landing-url" placeholder="https://example.com/landing-page">
                        <button type="button" class="kwa-scrape-btn" id="kwa-scrape-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4-3-9s1.34-9 3-9"/></svg>
                            Analyze
                        </button>
                    </div>
                </div>
                
                <!-- Page Preview (shown after scrape) -->
                <div id="kwa-page-preview" style="display: none;"></div>
            </div>

            <!-- Keywords Input (for keywords-to-page mode) -->
            <div class="kwa-card kwa-tab-content" data-tab="keywords-to-page" style="margin-top: 16px;">
                <h3 class="kwa-card-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    Keywords to Analyze
                </h3>
                <div class="kwa-form-group">
                    <label class="kwa-label">Paste keywords <span class="kwa-label-info">(one per line)</span></label>
                    <textarea class="kwa-input kwa-textarea" id="kwa-keywords-input" placeholder="crm software&#10;best crm for small business&#10;free crm trial&#10;sales pipeline tool"></textarea>
                </div>
            </div>

            <!-- Competitor URLs (for competitor mode) -->
            <div class="kwa-card kwa-tab-content" data-tab="competitor" style="margin-top: 16px;">
                <h3 class="kwa-card-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    Competitor URLs
                </h3>
                <div id="kwa-competitor-list">
                    <div class="kwa-competitor-item">
                        <input type="url" class="kwa-input" placeholder="https://competitor1.com/page">
                        <button type="button" class="kwa-scrape-btn" style="padding: 12px;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                    </div>
                </div>
                <button type="button" class="kwa-add-competitor" id="kwa-add-competitor">+ Add Competitor (max 5)</button>
            </div>

            <!-- File Upload -->
            <div class="kwa-card" style="margin-top: 16px;">
                <h3 class="kwa-card-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Upload Data <span class="kwa-label-info">(optional)</span>
                </h3>
                <div class="kwa-upload-zone" id="kwa-upload-zone">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <p>Drop files here or click to upload</p>
                    <div class="kwa-upload-formats">CSV, Excel, PDF • Google Ads Export, Keyword Planner</div>
                    <input type="file" class="kwa-upload-input" id="kwa-file-input" multiple accept=".csv,.xlsx,.xls,.pdf">
                </div>
                <div class="kwa-files-list" id="kwa-files-list"></div>
            </div>

            <!-- AI Model Selector -->
            <div id="kwa-model-selector" style="margin-bottom: 16px;"></div>

            <!-- Analyze Button -->
            <button type="button" class="kwa-analyze-btn" id="kwa-analyze-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                Run Full Analysis
            </button>
        </div>

        <!-- Right Column: Results -->
        <div>
            <div class="kwa-card">
                <h3 class="kwa-card-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                    Analysis Results
                </h3>
                <div id="kwa-results">
                    <div class="kwa-empty">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                        <h3>Ready to Analyze</h3>
                        <p>Enter a landing page URL and click "Run Full Analysis" to get keyword insights</p>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="kwa-card" style="margin-top: 16px;" id="kwa-quick-actions" style="display: none;">
                <h3 class="kwa-card-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    Quick Actions
                </h3>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    <button type="button" class="kwa-action-btn" id="kwa-generate-ads">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
                        Generate Ad Copy
                    </button>
                    <button type="button" class="kwa-action-btn" id="kwa-export-csv">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Export CSV
                    </button>
                    <button type="button" class="kwa-action-btn" id="kwa-save-crm">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                        Save to CRM
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>`;
    }

    // ==================== ATTACH EVENT HANDLERS ====================
    function attachEventHandlers(container) {
        // Mode tabs
        container.querySelectorAll('.kwa-mode-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                state.mode = tab.dataset.mode;
                container.querySelectorAll('.kwa-mode-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                updateUIForMode(container);
            });
        });

        // Scrape button
        container.querySelector('#kwa-scrape-btn')?.addEventListener('click', () => scrapeLandingPage(container));

        // URL input enter key
        container.querySelector('#kwa-landing-url')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') scrapeLandingPage(container);
        });

        // Add competitor button
        container.querySelector('#kwa-add-competitor')?.addEventListener('click', () => addCompetitorInput(container));

        // File upload
        const uploadZone = container.querySelector('#kwa-upload-zone');
        const fileInput = container.querySelector('#kwa-file-input');
        
        uploadZone?.addEventListener('click', () => fileInput?.click());
        uploadZone?.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });
        uploadZone?.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });
        uploadZone?.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            handleFiles(e.dataTransfer.files, container);
        });
        fileInput?.addEventListener('change', () => {
            handleFiles(fileInput.files, container);
        });

        // Initialize AI Model Selector
        if (window.AIModelSelector) {
            window.AIModelSelector.renderSelector('kwa-model-selector', (modelId, model) => {
                console.log('[KWA] Model changed to:', modelId);
                state.selectedModel = modelId;
            }, { showDescription: true, compact: false });
        }

        // Analyze button
        container.querySelector('#kwa-analyze-btn')?.addEventListener('click', () => runAnalysis(container));

        // Quick actions
        container.querySelector('#kwa-generate-ads')?.addEventListener('click', () => generateAdCopy(container));
        container.querySelector('#kwa-export-csv')?.addEventListener('click', () => exportCSV());
        container.querySelector('#kwa-save-crm')?.addEventListener('click', () => saveToCRM(container));
    }

    // ==================== UPDATE UI FOR MODE ====================
    function updateUIForMode(container) {
        // Show/hide tab-specific content
        container.querySelectorAll('.kwa-tab-content').forEach(el => {
            el.classList.remove('active');
            if (el.dataset.tab === state.mode || 
                (state.mode === 'page-to-keywords' && el.dataset.tab === 'page-to-keywords')) {
                el.classList.add('active');
            }
        });

        // Update analyze button text
        const analyzeBtn = container.querySelector('#kwa-analyze-btn');
        if (analyzeBtn) {
            const texts = {
                'page-to-keywords': 'Extract Keywords from Page',
                'keywords-to-page': 'Analyze Keyword-Page Fit',
                'competitor': 'Compare Competitors'
            };
            analyzeBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                ${texts[state.mode] || 'Run Analysis'}
            `;
        }
    }

    // ==================== SCRAPE LANDING PAGE ====================
    async function scrapeLandingPage(container) {
        const urlInput = container.querySelector('#kwa-landing-url');
        const url = urlInput?.value?.trim();
        
        if (!url) {
            alert('Please enter a landing page URL');
            return;
        }

        // Validate URL
        try {
            new URL(url);
        } catch {
            alert('Please enter a valid URL');
            return;
        }

        const scrapeBtn = container.querySelector('#kwa-scrape-btn');
        const previewDiv = container.querySelector('#kwa-page-preview');
        
        scrapeBtn.disabled = true;
        scrapeBtn.innerHTML = `<div class="kwa-spinner" style="width:16px;height:16px;border-width:2px;margin:0;"></div> Analyzing...`;

        try {
            // Use AI to analyze the URL
            const pageData = await analyzeUrlWithAI(url);
            state.landingPageUrl = url;
            state.landingPageData = pageData;
            
            // Render preview
            previewDiv.innerHTML = renderPagePreview(pageData);
            previewDiv.style.display = 'block';
            
        } catch (error) {
            console.error('Scrape error:', error);
            alert('Error analyzing page: ' + error.message);
        } finally {
            scrapeBtn.disabled = false;
            scrapeBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4-3-9s1.34-9 3-9"/></svg> Analyze`;
        }
    }

    // ==================== ANALYZE URL WITH AI ====================
    async function analyzeUrlWithAI(url) {
        const apiKey = getAPIKey();
        if (!apiKey) throw new Error('No API key configured');

        const prompt = `Analyze this landing page URL and provide a detailed breakdown.

URL: ${url}

Based on what you know about this URL/domain, provide:

1. **Page Analysis**:
   - Likely H1/main headline
   - Meta title (what would appear in search results)
   - Meta description
   - Primary CTA (call-to-action)
   - Page type (homepage, product page, landing page, blog, etc.)

2. **Target Audience**:
   - Primary persona
   - Industry vertical
   - Buyer stage

3. **Content Signals**:
   - Main value propositions (3-5)
   - Trust signals likely present
   - Key features mentioned

4. **SEO Indicators**:
   - Primary topic/theme
   - Estimated word count range
   - Content depth (thin/medium/comprehensive)

Return as JSON:
{
  "url": "${url}",
  "domain": "extracted domain",
  "pageType": "type",
  "title": "likely title",
  "metaDescription": "likely description",
  "h1": "likely h1",
  "primaryCTA": "main CTA text",
  "persona": "target persona",
  "industry": "industry",
  "buyerStage": "awareness/consideration/decision",
  "valueProps": ["prop1", "prop2", "prop3"],
  "trustSignals": ["signal1", "signal2"],
  "features": ["feature1", "feature2"],
  "primaryTopic": "main topic",
  "contentDepth": "thin/medium/comprehensive",
  "estimatedWordCount": "500-1000"
}`;

        const response = await callAI(prompt);
        return parseJSON(response);
    }

    // ==================== RENDER PAGE PREVIEW ====================
    function renderPagePreview(data) {
        return `
            <div class="kwa-page-preview">
                <div class="kwa-page-meta">
                    <div class="kwa-page-url">${escapeHtml(data.url || '')}</div>
                    <div class="kwa-page-title">${escapeHtml(data.title || 'Analyzing...')}</div>
                    <div class="kwa-page-desc">${escapeHtml(data.metaDescription || '')}</div>
                    <div class="kwa-page-stats">
                        <div class="kwa-page-stat">
                            <div class="kwa-page-stat-value">${data.pageType || '-'}</div>
                            <div class="kwa-page-stat-label">Page Type</div>
                        </div>
                        <div class="kwa-page-stat">
                            <div class="kwa-page-stat-value">${data.buyerStage || '-'}</div>
                            <div class="kwa-page-stat-label">Buyer Stage</div>
                        </div>
                        <div class="kwa-page-stat">
                            <div class="kwa-page-stat-value">${data.contentDepth || '-'}</div>
                            <div class="kwa-page-stat-label">Content Depth</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ==================== ADD COMPETITOR INPUT ====================
    function addCompetitorInput(container) {
        const list = container.querySelector('#kwa-competitor-list');
        const count = list.querySelectorAll('.kwa-competitor-item').length;
        
        if (count >= 5) {
            alert('Maximum 5 competitors allowed');
            return;
        }

        const item = document.createElement('div');
        item.className = 'kwa-competitor-item';
        item.innerHTML = `
            <input type="url" class="kwa-input" placeholder="https://competitor${count + 1}.com/page">
            <button type="button" class="kwa-scrape-btn" style="padding: 12px;" onclick="this.parentElement.remove()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        `;
        list.appendChild(item);
    }

    // ==================== HANDLE FILES ====================
    async function handleFiles(files, container) {
        const filesList = container.querySelector('#kwa-files-list');
        
        for (const file of files) {
            const fileItem = document.createElement('div');
            fileItem.className = 'kwa-file-item';
            
            const ext = file.name.split('.').pop().toUpperCase();
            const size = formatFileSize(file.size);
            
            fileItem.innerHTML = `
                <div class="kwa-file-info">
                    <div class="kwa-file-icon">${ext}</div>
                    <div>
                        <div class="kwa-file-name">${escapeHtml(file.name)}</div>
                        <div class="kwa-file-size">${size}</div>
                    </div>
                </div>
                <button type="button" class="kwa-file-remove">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            `;
            
            fileItem.querySelector('.kwa-file-remove').addEventListener('click', () => {
                fileItem.remove();
                state.uploadedFiles = state.uploadedFiles.filter(f => f.name !== file.name);
            });
            
            filesList.appendChild(fileItem);
            
            // Parse file
            try {
                const parsed = await parseFile(file);
                state.uploadedFiles.push({ name: file.name, data: parsed });
            } catch (error) {
                console.error('Error parsing file:', error);
            }
        }
    }

    // ==================== PARSE FILE ====================
    async function parseFile(file) {
        const ext = file.name.split('.').pop().toLowerCase();
        
        if (ext === 'csv') {
            return parseCSV(await file.text());
        } else if (ext === 'xlsx' || ext === 'xls') {
            // For Excel, we'll use AI to help parse
            return { type: 'excel', name: file.name, raw: await file.text() };
        } else if (ext === 'pdf') {
            // For PDF, we'll extract text using AI
            return { type: 'pdf', name: file.name };
        }
        
        return { type: 'unknown', name: file.name };
    }

    // ==================== PARSE CSV ====================
    function parseCSV(text) {
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length === 0) return { headers: [], rows: [] };
        
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const rows = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const row = {};
            headers.forEach((h, idx) => {
                // Map Google Ads columns
                const mappedKey = GOOGLE_ADS_MAPPING[h] || h.toLowerCase().replace(/\s+/g, '_');
                row[mappedKey] = values[idx] || '';
            });
            rows.push(row);
        }
        
        return { type: 'csv', headers, rows, mappedRows: rows };
    }

    // ==================== RUN ANALYSIS ====================
    async function runAnalysis(container) {
        const resultsDiv = container.querySelector('#kwa-results');
        const analyzeBtn = container.querySelector('#kwa-analyze-btn');
        
        // Validate inputs
        if (!state.landingPageUrl && state.mode !== 'keywords-to-page') {
            alert('Please enter and analyze a landing page URL first');
            return;
        }

        if (state.mode === 'keywords-to-page') {
            const keywordsInput = container.querySelector('#kwa-keywords-input')?.value;
            if (!keywordsInput?.trim()) {
                alert('Please enter keywords to analyze');
                return;
            }
            state.keywords = keywordsInput.split('\n').map(k => k.trim()).filter(k => k);
        }

        // Show loading
        analyzeBtn.disabled = true;
        resultsDiv.innerHTML = `
            <div class="kwa-loading">
                <div class="kwa-spinner"></div>
                <div class="kwa-loading-text">Running Analysis...</div>
                <div class="kwa-loading-step" id="kwa-loading-step">Extracting page content...</div>
            </div>
        `;

        try {
            let results;
            
            switch (state.mode) {
                case 'page-to-keywords':
                    results = await analyzePageToKeywords(container);
                    break;
                case 'keywords-to-page':
                    results = await analyzeKeywordsToPage(container);
                    break;
                case 'competitor':
                    results = await analyzeCompetitors(container);
                    break;
            }
            
            console.log('[KWA] Analysis results:', results);
            
            // Check if we got valid results
            if (!results || (Object.keys(results).length === 0)) {
                throw new Error('Analysis returned empty results. Please try again.');
            }
            
            state.analysisResults = results;
            renderResults(container, results);
            
            // Show quick actions only if we have results
            if (results.keywords?.length > 0 || results.comparison) {
                container.querySelector('#kwa-quick-actions').style.display = 'block';
            }
            
        } catch (error) {
            console.error('[KWA] Analysis error:', error);
            resultsDiv.innerHTML = `
                <div class="kwa-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <h3>Analysis Error</h3>
                    <p>${escapeHtml(error.message)}</p>
                    <button type="button" class="kwa-action-btn" style="margin-top: 16px;" onclick="document.querySelector('#kwa-analyze-btn').click()">
                        🔄 Try Again
                    </button>
                </div>
            `;
        } finally {
            analyzeBtn.disabled = false;
        }
    }

    // ==================== ANALYZE PAGE TO KEYWORDS ====================
    async function analyzePageToKeywords(container) {
        const updateStep = (step) => {
            const stepEl = container.querySelector('#kwa-loading-step');
            if (stepEl) stepEl.textContent = step;
        };

        updateStep('Analyzing page content with AI...');

        // Try to get SERP data for top keywords if SearchAPI available
        let serpData = null;
        const searchApiKey = getSearchAPIKey();
        if (searchApiKey && state.landingPageData?.primaryTopic) {
            updateStep('Fetching SERP data...');
            serpData = await fetchSERPData(state.landingPageData.primaryTopic);
        }
        
        const prompt = `You are an expert SEO, PPC, and Quality Score analyst. Perform a COMPREHENSIVE analysis of this landing page for paid search excellence.

**CRITICAL: Provide REAL analysis based on the actual page data - do NOT use placeholder or example values.**

=== PAGE DATA TO ANALYZE ===
URL: ${state.landingPageUrl}
Title: ${state.landingPageData?.title || 'Unknown'}
H1: ${state.landingPageData?.h1 || 'Unknown'}
Description: ${state.landingPageData?.metaDescription || 'Unknown'}
Industry: ${state.landingPageData?.industry || 'Unknown'}
Value Props: ${state.landingPageData?.valueProps?.join(', ') || 'Unknown'}
Features: ${state.landingPageData?.features?.join(', ') || 'Unknown'}
Primary Topic: ${state.landingPageData?.primaryTopic || 'Unknown'}
Buyer Stage: ${state.landingPageData?.buyerStage || 'Unknown'}
Persona: ${state.landingPageData?.persona || 'Unknown'}
CTAs Found: ${state.landingPageData?.ctas?.join(', ') || 'Unknown'}
Trust Signals: ${state.landingPageData?.trustSignals?.join(', ') || 'Unknown'}

${state.uploadedFiles.length > 0 ? `
UPLOADED DATA (use for volume/CPC if available):
${JSON.stringify(state.uploadedFiles.slice(0, 2).map(f => ({ name: f.name, sample: f.data?.rows?.slice(0, 10) })))}
` : ''}

${serpData ? `
SERP INTELLIGENCE:
- Related Questions (PAA): ${serpData.paa?.map(q => q.question).slice(0, 5).join('; ') || 'None'}
- Related Searches: ${serpData.relatedSearches?.map(r => r.query).slice(0, 5).join(', ') || 'None'}
- Ads on SERP: ${serpData.adsCount} (indicates commercial intent)
- Featured Snippet: ${serpData.featuredSnippet ? 'Yes' : 'No'}
- Top Organic Results: ${serpData.organic?.slice(0, 3).map(r => r.title).join('; ') || 'None'}
` : ''}

=== ANALYSIS FRAMEWORK (use as knowledge, not templates) ===

**PART 1: LANDING PAGE DEEP ANALYSIS**
Analyze these elements:
1. Content & Semantic Analysis: URL structure, title tag, meta description, H1, heading hierarchy, word count, semantic themes, LSI keywords
2. Value Proposition: Primary value prop, target audience clarity, problem/pain addressed, differentiation, proof/credibility elements
3. Conversion Architecture: CTA inventory (text, location, prominence), form analysis (fields, friction), trust signals, social proof
4. Technical Performance: Mobile-friendly signals, page speed indicators, structured data presence

**PART 2: KEYWORD EXTRACTION**
Extract keywords from:
- Meta elements (title, description, keywords)
- Headings (H1-H6)
- Body content (high-frequency terms, 2-4 word phrases)
- Alt text, anchor text, CTAs
- Semantic expansion (synonyms, long-tail, questions)

**KEYWORD SCORING (0-100)**
Calculate for each keyword:
- Page Relevance (35%): Direct mention in key locations, prominence
- Intent Alignment (25%): Does page intent match keyword intent?
- SERP Competition (15%): Competitive difficulty
- Keyword Structure (10%): Well-formed, appropriate length
- Related Frequency (10%): Appears in PAA/related searches
- Semantic Centrality (5%): Core to page topic

**KEYWORD CATEGORIZATION**
For each keyword, classify:
- Intent Type: informational (learn), navigational (find site), commercial (research), transactional (buy)
- Funnel Stage: TOFU (awareness), MOFU (consideration), BOFU (decision)
- Priority Tier: 1 (immediate target), 2 (secondary), 3 (expansion), 4 (long-term)

**PART 3: QUALITY SCORE PREDICTION**
Predict Google Ads Quality Score components:
- Expected CTR: Based on keyword-ad alignment potential
- Ad Relevance: Based on message match potential
- Landing Page Experience: Based on content relevance, speed, mobile

**PART 4: NEGATIVE KEYWORD SUGGESTIONS**
Identify negatives based on:
- Intent mismatch (e.g., "free" if no free tier)
- Support intent (login, password, cancel)
- Wrong audience (jobs, careers if not hiring)
- Geographic exclusions if not serving certain areas

=== KEYWORD DIVERSITY ===
Include a balanced mix:
- Head terms (1-2 words, high volume) - 15%
- Body terms (2-3 words, medium volume) - 35%
- Long-tail (4+ words, specific intent) - 30%
- Question keywords (how, what, why, best) - 20%
- Mix of intents and funnel stages

Return JSON with YOUR ACTUAL ANALYSIS:
{
  "pageAnalysis": {
    "overallScore": [0-100],
    "primaryIntent": "[actual detected intent]",
    "secondaryIntent": "[if applicable]",
    "detectedPersona": "[specific persona based on page]",
    "detectedIndustry": "[specific industry]",
    "valueProposition": {
      "primaryValueProp": "[actual value prop from page]",
      "clarity": "[clear/somewhat clear/unclear]",
      "differentiators": ["[actual differentiators found]"],
      "proofElements": ["[testimonials/logos/stats found]"]
    },
    "conversionArchitecture": {
      "primaryCTA": "[actual CTA text]",
      "ctaPlacement": "[above fold/below fold/multiple]",
      "formFields": [number if form exists],
      "frictionScore": "[low/medium/high]",
      "trustSignals": ["[actual signals found]"]
    },
    "technicalAssessment": {
      "urlStructure": "[clean/has parameters/issues]",
      "mobileIndicators": "[appears mobile-friendly/issues]",
      "contentDepth": "[shallow/moderate/deep/comprehensive]"
    },
    "qualityScorePrediction": {
      "expectedCTR": "[above average/average/below average]",
      "adRelevance": "[above average/average/below average]",
      "landingPageExperience": "[above average/average/below average]",
      "predictedQS": [1-10],
      "improvements": ["[specific improvements]"]
    }
  },
  "keywords": [
    {
      "keyword": "[extracted keyword]",
      "intent": "[informational/navigational/commercial/transactional]",
      "funnelStage": "[TOFU/MOFU/BOFU]",
      "relevanceScore": [0-100],
      "scoreBreakdown": {
        "pageRelevance": [0-100],
        "intentAlignment": [0-100],
        "serpCompetition": [0-100],
        "keywordStructure": [0-100],
        "relatedFrequency": [0-100],
        "semanticCentrality": [0-100]
      },
      "priorityTier": [1-4],
      "location": ["[where found on page]"],
      "volume": "[estimate or from data]",
      "cpc": "[estimate or from data]",
      "competition": "[low/medium/high]",
      "qualityScorePotential": [1-10],
      "matchTypeRecommendation": "[exact/phrase/broad]",
      "adGroupSuggestion": "[suggested ad group name]",
      "recommendation": "[specific action]"
    }
  ],
  "negativeKeywords": [
    {
      "keyword": "[negative to add]",
      "reason": "[why this is a negative]",
      "matchType": "[exact/phrase/broad]",
      "priority": "[high/medium/low]"
    }
  ],
  "keywordClusters": [
    {
      "name": "[cluster name]",
      "theme": "[cluster theme]",
      "keywords": ["[keywords in this cluster]"],
      "suggestedAdGroup": "[ad group name]"
    }
  ],
  "paaQuestions": ["[actual PAA questions if available]"],
  "relatedSearches": ["[actual related searches if available]"],
  "contentGaps": [
    {
      "gap": "[missing content topic]",
      "keywordsAffected": ["[keywords that need this content]"],
      "priority": "[high/medium/low]",
      "recommendation": "[how to fill the gap]"
    }
  ],
  "conversionRecommendations": ["[CTA/form/trust improvements]"],
  "technicalRecommendations": ["[SEO/speed/mobile improvements]"],
  "quickWins": ["[easy immediate improvements]"],
  
  "strategicNarrative": {
    "bigPicture": "[2-3 sentence overview: What is this page trying to accomplish? Who is it for? What's the core opportunity?]",
    "marketContext": "[What's happening in this industry/market? Why does this matter now?]",
    "competitivePosition": "[Where does this page stand vs competitors? What's the opportunity gap?]",
    "audiencePsychology": "[Why do people search for these terms? What's the underlying need/pain/desire?]",
    "winningStrategy": "[The 3-5 key actions that will make the biggest impact and WHY]"
  },
  
  "keywordStrategies": [
    {
      "keyword": "[priority keyword]",
      "whyThisMatters": "[Strategic reasoning for this keyword]",
      "userIntent": "[What the searcher really wants when they search this]",
      "competitiveOpportunity": "[Why you can win with this keyword]",
      "contentAngle": "[How to position content/ads for this keyword]",
      "expectedImpact": "[Traffic/conversion potential]",
      "priorityReason": "[Why this should be prioritized over others]"
    }
  ],
  
  "contentStrategyBlueprint": {
    "currentState": "[What the page currently does well/poorly]",
    "targetState": "[What the page should become]",
    "messagingHierarchy": "[Primary message > Secondary > Tertiary]",
    "proofRequired": ["[What evidence/proof is needed]"],
    "objectionsToAddress": ["[Common objections to handle]"],
    "contentPillars": [
      {
        "pillar": "[content theme]",
        "purpose": "[why this matters]",
        "keywordsSupported": ["[keywords this enables]"],
        "contentIdeas": ["[specific content to create]"]
      }
    ]
  },
  
  "adCopyInsights": {
    "primaryAngle": "[Main messaging angle for ads]",
    "emotionalTriggers": ["[Emotions to tap into]"],
    "uniqueSellingPoints": ["[What to emphasize in ads]"],
    "ctaRecommendations": ["[Best CTAs for this audience]"],
    "headlineFormulas": ["[Specific headline approaches that would work]"],
    "descriptionThemes": ["[Key themes for descriptions]"]
  },
  
  "projectedImpact": {
    "estimatedMonthlySearches": "[total search volume for recommended keywords]",
    "estimatedTrafficPotential": "[with 5% CTR assumption]",
    "conversionEstimate": "[with industry benchmark CVR]",
    "timeToResults": "[realistic timeline]",
    "quickWinImpact": "[what quick wins will deliver]",
    "confidenceLevel": "[low/medium/high based on data quality]"
  },
  
  "competitorInsights": {
    "likelyCompetitors": ["[who's competing for these keywords]"],
    "competitorStrengths": ["[what they do well]"],
    "competitorWeaknesses": ["[where you can beat them]"],
    "differentiationOpportunity": "[how to stand out]",
    "pricingPositionRecommendation": "[how to position on pricing/value]"
  },
  
  "riskFactors": [
    {
      "risk": "[potential issue]",
      "likelihood": "[low/medium/high]",
      "impact": "[low/medium/high]",
      "mitigation": "[how to address]"
    }
  ],
  
  "executiveSummary": {
    "totalKeywordsFound": [number],
    "tier1Keywords": [number],
    "averageRelevanceScore": [0-100],
    "topStrengths": ["[page strengths]"],
    "topWeaknesses": ["[areas to improve]"],
    "launchReadiness": "[ready/minor work needed/significant work needed]",
    "oneLineRecommendation": "[Single most important action to take]",
    "expectedOutcome": "[What success looks like if recommendations are followed]"
  }
}`;

        updateStep('Running AI analysis...');
        const response = await callAI(prompt, { maxTokens: 16384, temperature: 0.3 });
        console.log('[KWA] AI Response length:', response?.length || 0);
        
        let results = parseJSON(response);
        
        // Validate we got keywords
        if (!results.keywords || results.keywords.length === 0) {
            console.warn('[KWA] No keywords in results, attempting simplified analysis');
            // Try a simpler prompt
            const simplePrompt = `Extract 25 relevant Google Ads keywords from this page.

URL: ${state.landingPageUrl}
Title: ${state.landingPageData?.title || 'Unknown'}
Description: ${state.landingPageData?.metaDescription || 'Unknown'}
Industry: ${state.landingPageData?.industry || 'Unknown'}

For each keyword provide: keyword, intent (informational/commercial/transactional), relevanceScore (0-100), volume (estimate), cpc (estimate), competition (low/medium/high).

Return ONLY valid JSON:
{"pageAnalysis":{"overallScore":75,"primaryIntent":"commercial"},"keywords":[{"keyword":"example keyword","intent":"commercial","relevanceScore":85,"volume":1000,"cpc":5.00,"competition":"medium"}]}`;

            const simpleResponse = await callAI(simplePrompt);
            const simpleResults = parseJSON(simpleResponse);
            
            if (simpleResults.keywords?.length > 0) {
                results = simpleResults;
            }
        }
        
        // STEP 2: Generate strategic insights if missing
        if (!results.strategicNarrative?.bigPicture || !results.keywordStrategies?.length) {
            updateStep('Generating strategic insights with AI...');
            const strategicInsights = await generateStrategicInsights(results, state.landingPageData, state.landingPageUrl);
            
            if (strategicInsights) {
                // Merge strategic insights into results
                results.strategicNarrative = strategicInsights.strategicNarrative || results.strategicNarrative;
                results.keywordStrategies = strategicInsights.keywordStrategies || results.keywordStrategies;
                results.contentStrategyBlueprint = strategicInsights.contentStrategyBlueprint || results.contentStrategyBlueprint;
                results.adCopyInsights = strategicInsights.adCopyInsights || results.adCopyInsights;
                results.projectedImpact = strategicInsights.projectedImpact || results.projectedImpact;
                results.competitorInsights = strategicInsights.competitorInsights || results.competitorInsights;
                results.riskFactors = strategicInsights.riskFactors || results.riskFactors;
                
                // Update page analysis details if provided
                if (strategicInsights.pageAnalysisDetails) {
                    results.pageAnalysis = results.pageAnalysis || {};
                    results.pageAnalysis.detectedPersona = strategicInsights.pageAnalysisDetails.detectedPersona;
                    results.pageAnalysis.detectedIndustry = strategicInsights.pageAnalysisDetails.detectedIndustry;
                    results.pageAnalysis.ctaEffectiveness = strategicInsights.pageAnalysisDetails.ctaEffectiveness;
                    results.pageAnalysis.contentDepth = strategicInsights.pageAnalysisDetails.contentDepth;
                    results.pageAnalysis.trustSignals = strategicInsights.pageAnalysisDetails.trustSignals;
                    results.pageAnalysis.conversionBarriers = strategicInsights.pageAnalysisDetails.conversionBarriers;
                }
                
                // Update executive summary
                if (strategicInsights.executiveSummary) {
                    results.executiveSummary = { ...results.executiveSummary, ...strategicInsights.executiveSummary };
                }
                
                console.log('[KWA] Strategic insights merged successfully');
            }
        }
        
        return results;
    }

    // ==================== ANALYZE KEYWORDS TO PAGE ====================
    async function analyzeKeywordsToPage(container) {
        const updateStep = (step) => {
            const stepEl = container.querySelector('#kwa-loading-step');
            if (stepEl) stepEl.textContent = step;
        };

        updateStep('Analyzing keyword-to-page relevance...');
        
        const prompt = `You are an expert Quality Score and PPC analyst. Analyze how well each keyword matches this landing page and predict Quality Score components.

**CRITICAL: Provide REAL analysis - assess each keyword against the actual page content.**

=== PAGE DATA ===
URL: ${state.landingPageUrl}
Title: ${state.landingPageData?.title || 'Unknown'}
H1: ${state.landingPageData?.h1 || 'Unknown'}
Description: ${state.landingPageData?.metaDescription || 'Unknown'}
Primary Topic: ${state.landingPageData?.primaryTopic || 'Unknown'}
Value Props: ${state.landingPageData?.valueProps?.join(', ') || 'Unknown'}
Features: ${state.landingPageData?.features?.join(', ') || 'Unknown'}
CTAs: ${state.landingPageData?.ctas?.join(', ') || 'Unknown'}

=== KEYWORDS TO ANALYZE ===
${state.keywords.join('\n')}

=== ANALYSIS FRAMEWORK ===

**For EACH keyword, analyze:**

1. **KEYWORD PRESENCE**
   - Exact match found: yes/no
   - Locations found: Title, H1, H2, Meta, Body, URL, None
   - Frequency: how many times
   - Prominence score: based on location importance

2. **INTENT ALIGNMENT**
   - Keyword intent: Know (informational), Know Simple, Do (transactional), Website (navigational)
   - Page intent: what the page is designed for
   - Match assessment: strong match / partial match / mismatch

3. **QUALITY SCORE PREDICTION**
   For each keyword, predict Google Ads QS components:
   - Expected CTR: Above Average / Average / Below Average
   - Ad Relevance: Above Average / Average / Below Average  
   - Landing Page Experience: Above Average / Average / Below Average
   - Predicted QS: 1-10

4. **CONTENT GAP ANALYSIS**
   - Is content sufficient for this keyword?
   - What content is missing?
   - What should be added?

5. **RECOMMENDATIONS**
   - Should this keyword use this page? yes/no/different page
   - What optimizations would improve relevance?
   - Should keyword be exact/phrase/broad match?

=== SCORING METHODOLOGY ===

**Fit Score (0-100)**
- Direct presence in key locations: +40 max
- Supporting content depth: +25 max
- Semantic relevance: +20 max
- User intent match: +15 max

**Quality Score Prediction Factors**
Landing Page Experience considers:
- Keyword relevance to page content
- Page load speed indicators
- Mobile-friendliness signals
- Transparency (contact info, privacy policy)
- Navigation clarity

Return JSON with YOUR ACTUAL ANALYSIS:
{
  "summary": {
    "totalKeywords": ${state.keywords.length},
    "averageFitScore": [calculated average],
    "averagePredictedQS": [1-10],
    "highFit": [count score >= 70],
    "mediumFit": [count 40-69],
    "lowFit": [count < 40],
    "intentMatches": [count],
    "intentMismatches": [count]
  },
  "overallAssessment": {
    "pageKeywordFit": "[excellent/good/fair/poor]",
    "primaryStrength": "[main strength of this page for these keywords]",
    "primaryWeakness": "[main issue to address]",
    "recommendedActions": ["[prioritized action 1]", "[action 2]", "[action 3]"]
  },
  "qualityScoreSummary": {
    "expectedCTROverall": "[above/average/below]",
    "adRelevanceOverall": "[above/average/below]",
    "landingPageExpOverall": "[above/average/below]",
    "keywordsWithHighQS": [count with QS >= 7],
    "keywordsWithLowQS": [count with QS <= 4]
  },
  "issues": [
    {
      "type": "[intent_mismatch/content_gap/keyword_absent/poor_placement]",
      "severity": "[critical/high/medium/low]",
      "count": [affected keywords],
      "description": "[specific issue description]",
      "affectedKeywords": ["[keyword list]"],
      "recommendation": "[how to fix]",
      "expectedImpact": "[QS lift, CPC reduction, etc.]"
    }
  ],
  "keywords": [
    {
      "keyword": "[keyword]",
      "fitScore": [0-100],
      "intent": "[informational/navigational/commercial/transactional]",
      "pageIntent": "[detected page intent]",
      "intentMatch": [true/false],
      "foundIn": ["[locations where found]"],
      "frequency": [count],
      "prominenceScore": [0-100],
      "qualityScorePrediction": {
        "expectedCTR": "[above/average/below]",
        "adRelevance": "[above/average/below]",
        "landingPageExp": "[above/average/below]",
        "predictedQS": [1-10]
      },
      "contentSufficiency": "[sufficient/needs improvement/insufficient]",
      "issues": ["[specific issues for this keyword]"],
      "fixes": ["[specific fixes]"],
      "matchTypeRecommendation": "[exact/phrase/broad]",
      "useThisPage": "[yes/no/create new page]",
      "alternatePageSuggestion": "[if different page recommended]"
    }
  ],
  "contentGaps": [
    {
      "gapType": "[missing_content/weak_coverage/intent_mismatch]",
      "keywordsAffected": ["[keywords needing this content]"],
      "recommendation": "[specific content to add]",
      "priority": "[high/medium/low]",
      "potentialQSLift": "[estimated improvement]"
    }
  ],
  "optimizationRoadmap": {
    "immediateActions": ["[do today - low effort, high impact]"],
    "shortTermActions": ["[this week - medium effort]"],
    "longTermActions": ["[this month - higher effort]"],
    "expectedResults": {
      "averageQSLift": "[estimated lift]",
      "cpcReduction": "[estimated %]",
      "conversionImprovement": "[estimated %]"
    }
  }
}`;

        const response = await callAI(prompt);
        return parseJSON(response);
    }

    // ==================== ANALYZE COMPETITORS ====================
    async function analyzeCompetitors(container) {
        const updateStep = (step) => {
            const stepEl = container.querySelector('#kwa-loading-step');
            if (stepEl) stepEl.textContent = step;
        };

        // Get competitor URLs
        const competitorInputs = container.querySelectorAll('#kwa-competitor-list input');
        const competitorUrls = Array.from(competitorInputs).map(i => i.value.trim()).filter(u => u);
        
        if (competitorUrls.length === 0) {
            throw new Error('Please add at least one competitor URL');
        }

        updateStep('Analyzing competitor pages...');
        
        const prompt = `You are an expert competitive intelligence analyst. Perform comprehensive competitive analysis for paid search excellence.

**CRITICAL: Provide REAL analysis comparing these actual pages - identify genuine gaps and opportunities.**

=== YOUR PAGE ===
URL: ${state.landingPageUrl}
Title: ${state.landingPageData?.title || 'Unknown'}
H1: ${state.landingPageData?.h1 || 'Unknown'}
Description: ${state.landingPageData?.metaDescription || 'Unknown'}
Value Props: ${state.landingPageData?.valueProps?.join(', ') || 'Unknown'}
Features: ${state.landingPageData?.features?.join(', ') || 'Unknown'}
Industry: ${state.landingPageData?.industry || 'Unknown'}
Primary Topic: ${state.landingPageData?.primaryTopic || 'Unknown'}

=== COMPETITOR URLS (analyze each) ===
${competitorUrls.map((url, i) => `${i + 1}. ${url}`).join('\n')}

=== COMPETITIVE ANALYSIS FRAMEWORK ===

**1. PAGE STRUCTURE COMPARISON**
For each page, assess:
- Content depth (estimated word count)
- Number of trust signals (testimonials, logos, certifications)
- CTA presence and strength
- Form friction (number of fields)
- Pricing visibility
- Social proof elements
- Video/demo presence

**2. VALUE PROPOSITION ANALYSIS**
- What claim does each make?
- How do they differentiate?
- What benefits do they emphasize?
- What proof do they provide?

**3. KEYWORD GAP ANALYSIS**
- Keywords all pages target
- Keywords unique to your page
- Keywords competitors have that you're missing (GAPS)

**4. MESSAGING DIFFERENTIATION**
- Unclaimed positioning opportunities
- Overused messages to avoid
- Unique angles available

**5. COMPETITIVE POSITION MAP**
Place each competitor on a 2D map based on key dimensions

Return JSON with YOUR ACTUAL COMPETITIVE ANALYSIS:
{
  "competitivePosition": {
    "overallScore": [0-100],
    "marketPosition": "[leader/challenger/niche/new entrant]",
    "primaryAdvantage": "[your main advantage over competitors]",
    "primaryThreat": "[biggest competitive threat]"
  },
  "comparison": {
    "yourPage": {
      "url": "${state.landingPageUrl}",
      "wordCount": "[estimate]",
      "trustSignals": [count],
      "socialProofElements": ["[types found]"],
      "pricingShown": [true/false],
      "ctaType": "[CTA description]",
      "ctaStrength": "[strong/moderate/weak]",
      "formFields": [count or N/A],
      "uniqueSellingPoint": "[main USP]",
      "strengths": ["[actual strengths]"],
      "weaknesses": ["[actual weaknesses]"]
    },
    "competitors": [
      {
        "url": "[competitor URL]",
        "domain": "[domain]",
        "wordCount": "[estimate]",
        "trustSignals": [count],
        "socialProofElements": ["[types found]"],
        "pricingShown": [true/false],
        "ctaType": "[CTA description]",
        "ctaStrength": "[strong/moderate/weak]",
        "formFields": [count or N/A],
        "uniqueSellingPoint": "[their USP]",
        "strengths": ["[their strengths]"],
        "weaknesses": ["[their weaknesses]"],
        "threatLevel": "[high/medium/low]"
      }
    ]
  },
  "keywordAnalysis": {
    "sharedKeywords": ["[keywords everyone targets]"],
    "yourUniqueKeywords": ["[keywords only you cover]"],
    "competitorOnlyKeywords": ["[GAPS - keywords they have that you need]"],
    "keywordOpportunities": ["[uncovered keywords to target]"]
  },
  "messagingAnalysis": {
    "yourPosition": "[how you position]",
    "competitorPositions": ["[how each competitor positions]"],
    "differentiationOpportunities": [
      {
        "opportunity": "[unclaimed message territory]",
        "recommendation": "[how to claim it]"
      }
    ],
    "overusedMessages": ["[messages to differentiate from]"]
  },
  "gaps": [
    {
      "area": "[area of gap]",
      "issue": "[specific gap description]",
      "competitorAdvantage": "[who does this better]",
      "priority": "[critical/high/medium/low]",
      "recommendation": "[how to close the gap]",
      "effort": "[low/medium/high]"
    }
  ],
  "advantages": [
    {
      "area": "[area of advantage]",
      "advantage": "[specific advantage]",
      "leverage": "[how to leverage in ads/messaging]"
    }
  ],
  "positionMap": {
    "xAxisLabel": "[dimension 1, e.g., Price]",
    "yAxisLabel": "[dimension 2, e.g., Features]",
    "yourPosition": {"x": [1-10], "y": [1-10]},
    "competitors": [{"name": "[domain]", "x": [1-10], "y": [1-10]}],
    "whiteSpace": "[where opportunity exists]"
  },
  "actionPlan": [
    {
      "priority": [1-5],
      "action": "[specific action]",
      "area": "[content/messaging/technical/conversion]",
      "expectedImpact": "[expected improvement]",
      "effort": "[low/medium/high]"
    }
  ],
  "executiveSummary": {
    "competitiveGrade": "[A/B/C/D/F]",
    "winningStrategy": "[how to beat competitors]",
    "immediateActions": ["[top 3 immediate actions]"]
  }
}`;

        const response = await callAI(prompt);
        return parseJSON(response);
    }

    // ==================== RENDER RESULTS ====================
    function renderResults(container, results) {
        const resultsDiv = container.querySelector('#kwa-results');
        
        if (!results) {
            resultsDiv.innerHTML = `<div class="kwa-empty"><p>No results to display</p></div>`;
            return;
        }

        let html = '';

        if (state.mode === 'page-to-keywords') {
            html = renderPageToKeywordsResults(results);
        } else if (state.mode === 'keywords-to-page') {
            html = renderKeywordsToPageResults(results);
        } else if (state.mode === 'competitor') {
            html = renderCompetitorResults(results);
        }

        resultsDiv.innerHTML = html;
    }

    // ==================== SVG ICONS ====================
    const ICONS = {
        target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
        lightbulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>',
        trendUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
        barChart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>',
        swords: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/><line x1="5" y1="14" x2="9" y2="18"/><line x1="7" y1="17" x2="4" y2="20"/><line x1="3" y1="19" x2="5" y2="21"/></svg>',
        brain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.54"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.54"/></svg>',
        trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
        pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',
        heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
        star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        cursor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m4 4 7.07 17 2.51-7.39L21 11.07z"/></svg>',
        flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>',
        zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
        check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
        alertTriangle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>',
        users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
        compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
        search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
        link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
        file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
        messageCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>'
    };

    // ==================== RENDER PAGE TO KEYWORDS RESULTS ====================
    function renderPageToKeywordsResults(results) {
        const analysis = results.pageAnalysis || {};
        const keywords = results.keywords || [];
        const paaQuestions = results.paaQuestions || [];
        const relatedSearches = results.relatedSearches || [];
        const quickWins = results.quickWins || [];
        const gaps = results.gaps || [];
        const narrative = results.strategicNarrative || {};
        const keywordStrategies = results.keywordStrategies || [];
        const contentBlueprint = results.contentStrategyBlueprint || {};
        const adCopyInsights = results.adCopyInsights || {};
        const projectedImpact = results.projectedImpact || {};
        const competitorInsights = results.competitorInsights || {};
        const riskFactors = results.riskFactors || [];
        const execSummary = results.executiveSummary || {};
        
        return `
            <div class="kwa-results">
                <!-- Executive Summary with Strategic Context -->
                ${narrative.bigPicture || execSummary.oneLineRecommendation ? `
                <div class="kwa-strategic-overview" style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #8b5cf6, #3b82f6); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff;">${ICONS.target}</div>
                        <div>
                            <h3 style="margin: 0; color: #fff; font-size: 18px; font-weight: 600;">Strategic Overview</h3>
                            <p style="margin: 4px 0 0; color: #a78bfa; font-size: 13px;">${execSummary.launchReadiness || 'Analyzing...'}</p>
                        </div>
                    </div>
                    
                    ${narrative.bigPicture ? `
                    <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 16px; margin-bottom: 16px;">
                        <div style="color: #e2e8f0; font-size: 15px; line-height: 1.6;">${escapeHtml(narrative.bigPicture)}</div>
                    </div>
                    ` : ''}
                    
                    ${execSummary.oneLineRecommendation ? `
                    <div style="display: flex; align-items: flex-start; gap: 12px; padding: 16px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 10px;">
                        <div style="width: 24px; height: 24px; color: #4ade80; flex-shrink: 0;">${ICONS.lightbulb}</div>
                        <div>
                            <div style="color: #4ade80; font-size: 11px; font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">Primary Recommendation</div>
                            <div style="color: #e2e8f0; font-size: 14px;">${escapeHtml(execSummary.oneLineRecommendation)}</div>
                        </div>
                    </div>
                    ` : ''}
                    
                    ${execSummary.expectedOutcome ? `
                    <div style="margin-top: 12px; padding: 12px 16px; background: rgba(59, 130, 246, 0.1); border-radius: 8px; display: flex; align-items: flex-start; gap: 10px;">
                        <div style="width: 18px; height: 18px; color: #60a5fa; flex-shrink: 0; margin-top: 2px;">${ICONS.trendUp}</div>
                        <div>
                            <div style="color: #60a5fa; font-size: 11px; font-weight: 600; margin-bottom: 4px;">Expected Outcome</div>
                            <div style="color: #94a3b8; font-size: 13px;">${escapeHtml(execSummary.expectedOutcome)}</div>
                        </div>
                    </div>
                    ` : ''}
                </div>
                ` : ''}

                <!-- Score Summary -->
                <div class="kwa-score-summary">
                    <div class="kwa-score-card">
                        <div class="kwa-score-value ${getScoreClass(analysis.overallScore || 0)}">${analysis.overallScore || '-'}</div>
                        <div class="kwa-score-label">Page Score</div>
                    </div>
                    <div class="kwa-score-card">
                        <div class="kwa-score-value">${keywords.length}</div>
                        <div class="kwa-score-label">Keywords Found</div>
                    </div>
                    <div class="kwa-score-card">
                        <div class="kwa-score-value">${keywords.filter(k => k.relevanceScore >= 80).length}</div>
                        <div class="kwa-score-label">High Relevance</div>
                    </div>
                    <div class="kwa-score-card">
                        <div class="kwa-score-value">${analysis.primaryIntent || '-'}</div>
                        <div class="kwa-score-label">Primary Intent</div>
                    </div>
                </div>

                <!-- Strategic Context: Market & Competition -->
                ${narrative.marketContext || narrative.competitivePosition ? `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin-top: 20px;">
                    ${narrative.marketContext ? `
                    <div style="background: rgba(249, 115, 22, 0.1); border: 1px solid rgba(249, 115, 22, 0.3); border-radius: 12px; padding: 16px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                            <div style="width: 20px; height: 20px; color: #fb923c;">${ICONS.barChart}</div>
                            <span style="color: #fb923c; font-size: 13px; font-weight: 600;">Market Context</span>
                        </div>
                        <div style="color: #e2e8f0; font-size: 13px; line-height: 1.6;">${escapeHtml(narrative.marketContext)}</div>
                    </div>
                    ` : ''}
                    
                    ${narrative.competitivePosition ? `
                    <div style="background: rgba(236, 72, 153, 0.1); border: 1px solid rgba(236, 72, 153, 0.3); border-radius: 12px; padding: 16px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                            <div style="width: 20px; height: 20px; color: #f472b6;">${ICONS.swords}</div>
                            <span style="color: #f472b6; font-size: 13px; font-weight: 600;">Competitive Position</span>
                        </div>
                        <div style="color: #e2e8f0; font-size: 13px; line-height: 1.6;">${escapeHtml(narrative.competitivePosition)}</div>
                    </div>
                    ` : ''}
                </div>
                ` : ''}

                <!-- Audience Psychology -->
                ${narrative.audiencePsychology ? `
                <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px; padding: 16px; margin-top: 16px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                        <div style="width: 20px; height: 20px; color: #4ade80;">${ICONS.brain}</div>
                        <span style="color: #4ade80; font-size: 13px; font-weight: 600;">Audience Psychology: Why They Search</span>
                    </div>
                    <div style="color: #e2e8f0; font-size: 13px; line-height: 1.6;">${escapeHtml(narrative.audiencePsychology)}</div>
                </div>
                ` : ''}

                <!-- Winning Strategy -->
                ${narrative.winningStrategy ? `
                <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(20, 184, 166, 0.1) 100%); border: 1px solid rgba(34, 197, 94, 0.4); border-radius: 12px; padding: 20px; margin-top: 16px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                        <div style="width: 24px; height: 24px; color: #4ade80;">${ICONS.trophy}</div>
                        <span style="color: #4ade80; font-size: 15px; font-weight: 600;">Winning Strategy</span>
                    </div>
                    <div style="color: #e2e8f0; font-size: 14px; line-height: 1.7;">${escapeHtml(narrative.winningStrategy)}</div>
                </div>
                ` : ''}

                <!-- Projected Impact -->
                ${projectedImpact.estimatedMonthlySearches || projectedImpact.estimatedTrafficPotential || projectedImpact.timeToResults ? `
                <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin-top: 20px;">
                    <h4 style="color: #fff; margin: 0 0 16px; font-size: 14px; display: flex; align-items: center; gap: 8px;">
                        <div style="width: 20px; height: 20px; color: #a78bfa;">${ICONS.trendUp}</div> Projected Impact
                        <span style="background: rgba(139, 92, 246, 0.3); color: #a78bfa; padding: 2px 8px; border-radius: 4px; font-size: 10px; margin-left: auto;">${projectedImpact.confidenceLevel || 'medium'} confidence</span>
                    </h4>
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
                        ${projectedImpact.estimatedMonthlySearches ? `
                        <div style="text-align: center; padding: 16px 12px; background: rgba(139, 92, 246, 0.1); border-radius: 8px;">
                            <div style="font-size: ${isNaN(projectedImpact.estimatedMonthlySearches) || String(projectedImpact.estimatedMonthlySearches).length > 10 ? '13px' : '20px'}; font-weight: 600; color: #a78bfa; line-height: 1.3;">${escapeHtml(String(projectedImpact.estimatedMonthlySearches).substring(0, 50))}</div>
                            <div style="font-size: 11px; color: #94a3b8; margin-top: 6px; font-weight: 500;">Monthly Searches</div>
                        </div>
                        ` : ''}
                        ${projectedImpact.estimatedTrafficPotential ? `
                        <div style="text-align: center; padding: 16px 12px; background: rgba(59, 130, 246, 0.1); border-radius: 8px;">
                            <div style="font-size: ${isNaN(projectedImpact.estimatedTrafficPotential) || String(projectedImpact.estimatedTrafficPotential).length > 10 ? '13px' : '20px'}; font-weight: 600; color: #60a5fa; line-height: 1.3;">${escapeHtml(String(projectedImpact.estimatedTrafficPotential).substring(0, 50))}</div>
                            <div style="font-size: 11px; color: #94a3b8; margin-top: 6px; font-weight: 500;">Traffic Potential</div>
                        </div>
                        ` : ''}
                        ${projectedImpact.conversionEstimate ? `
                        <div style="text-align: center; padding: 16px 12px; background: rgba(34, 197, 94, 0.1); border-radius: 8px;">
                            <div style="font-size: ${isNaN(projectedImpact.conversionEstimate) || String(projectedImpact.conversionEstimate).length > 10 ? '13px' : '20px'}; font-weight: 600; color: #4ade80; line-height: 1.3;">${escapeHtml(String(projectedImpact.conversionEstimate).substring(0, 50))}</div>
                            <div style="font-size: 11px; color: #94a3b8; margin-top: 6px; font-weight: 500;">Est. Conversions</div>
                        </div>
                        ` : ''}
                        ${projectedImpact.timeToResults ? `
                        <div style="text-align: center; padding: 16px 12px; background: rgba(249, 115, 22, 0.1); border-radius: 8px;">
                            <div style="font-size: ${String(projectedImpact.timeToResults).length > 15 ? '12px' : '14px'}; font-weight: 600; color: #fb923c; line-height: 1.3;">${escapeHtml(String(projectedImpact.timeToResults).substring(0, 60))}</div>
                            <div style="font-size: 11px; color: #94a3b8; margin-top: 6px; font-weight: 500;">Time to Results</div>
                        </div>
                        ` : ''}
                    </div>
                </div>
                ` : ''}

                <!-- Priority Keyword Strategies (WHY these keywords matter) -->
                ${keywordStrategies.length > 0 ? `
                <div style="margin-top: 24px;">
                    <h4 style="color: #fff; margin: 0 0 16px; font-size: 15px; display: flex; align-items: center; gap: 8px;">
                        <div style="width: 20px; height: 20px; color: #a78bfa;">${ICONS.target}</div> Priority Keyword Strategies
                    </h4>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        ${keywordStrategies.slice(0, 5).map((ks, idx) => `
                            <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 16px;">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <span style="background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: #fff; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700;">${idx + 1}</span>
                                        <span style="color: #fff; font-size: 15px; font-weight: 600;">${escapeHtml(ks.keyword)}</span>
                                    </div>
                                    ${ks.expectedImpact ? `<span style="background: rgba(34, 197, 94, 0.2); color: #4ade80; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 500;">${escapeHtml(ks.expectedImpact)}</span>` : ''}
                                </div>
                                
                                <div style="display: grid; gap: 10px;">
                                    ${ks.whyThisMatters ? `
                                    <div style="padding: 10px; background: rgba(139, 92, 246, 0.1); border-radius: 8px;">
                                        <div style="color: #a78bfa; font-size: 10px; font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">Why This Matters</div>
                                        <div style="color: #e2e8f0; font-size: 12px; line-height: 1.5;">${escapeHtml(ks.whyThisMatters)}</div>
                                    </div>
                                    ` : ''}
                                    
                                    ${ks.userIntent ? `
                                    <div style="padding: 10px; background: rgba(59, 130, 246, 0.1); border-radius: 8px;">
                                        <div style="color: #60a5fa; font-size: 10px; font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">User Intent</div>
                                        <div style="color: #e2e8f0; font-size: 12px; line-height: 1.5;">${escapeHtml(ks.userIntent)}</div>
                                    </div>
                                    ` : ''}
                                    
                                    ${ks.contentAngle ? `
                                    <div style="padding: 10px; background: rgba(34, 197, 94, 0.1); border-radius: 8px;">
                                        <div style="color: #4ade80; font-size: 10px; font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">Content/Ad Angle</div>
                                        <div style="color: #e2e8f0; font-size: 12px; line-height: 1.5;">${escapeHtml(ks.contentAngle)}</div>
                                    </div>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <!-- Ad Copy Insights -->
                ${adCopyInsights.primaryAngle || adCopyInsights.emotionalTriggers?.length ? `
                <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 20px; margin-top: 20px;">
                    <h4 style="color: #fff; margin: 0 0 16px; font-size: 14px; display: flex; align-items: center; gap: 8px;">
                        <div style="width: 20px; height: 20px; color: #60a5fa;">${ICONS.pencil}</div> Ad Copy Insights
                    </h4>
                    
                    ${adCopyInsights.primaryAngle ? `
                    <div style="margin-bottom: 16px;">
                        <div style="color: #60a5fa; font-size: 11px; font-weight: 600; text-transform: uppercase; margin-bottom: 6px;">Primary Messaging Angle</div>
                        <div style="color: #e2e8f0; font-size: 14px; padding: 12px; background: rgba(0,0,0,0.3); border-radius: 8px;">${escapeHtml(adCopyInsights.primaryAngle)}</div>
                    </div>
                    ` : ''}
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                        ${adCopyInsights.emotionalTriggers?.length ? `
                        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;">
                            <div style="color: #f472b6; font-size: 11px; font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;"><span style="width: 14px; height: 14px;">${ICONS.heart}</span> Emotional Triggers</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                                ${adCopyInsights.emotionalTriggers.map(t => `<span style="background: rgba(236, 72, 153, 0.2); color: #f9a8d4; padding: 3px 8px; border-radius: 4px; font-size: 11px;">${escapeHtml(t)}</span>`).join('')}
                            </div>
                        </div>
                        ` : ''}
                        
                        ${adCopyInsights.uniqueSellingPoints?.length ? `
                        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;">
                            <div style="color: #4ade80; font-size: 11px; font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;"><span style="width: 14px; height: 14px;">${ICONS.star}</span> USPs to Emphasize</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                                ${adCopyInsights.uniqueSellingPoints.map(u => `<span style="background: rgba(34, 197, 94, 0.2); color: #86efac; padding: 3px 8px; border-radius: 4px; font-size: 11px;">${escapeHtml(u)}</span>`).join('')}
                            </div>
                        </div>
                        ` : ''}
                        
                        ${adCopyInsights.ctaRecommendations?.length ? `
                        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;">
                            <div style="color: #fbbf24; font-size: 11px; font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;"><span style="width: 14px; height: 14px;">${ICONS.cursor}</span> CTA Recommendations</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                                ${adCopyInsights.ctaRecommendations.map(c => `<span style="background: rgba(251, 191, 36, 0.2); color: #fde68a; padding: 3px 8px; border-radius: 4px; font-size: 11px;">${escapeHtml(c)}</span>`).join('')}
                            </div>
                        </div>
                        ` : ''}
                    </div>
                    
                    ${adCopyInsights.headlineFormulas?.length ? `
                    <div style="margin-top: 16px;">
                        <div style="color: #a78bfa; font-size: 11px; font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;"><span style="width: 14px; height: 14px;">${ICONS.file}</span> Headline Approaches</div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            ${adCopyInsights.headlineFormulas.slice(0, 5).map(h => `
                                <div style="background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 6px; font-size: 12px; color: #e2e8f0; display: flex; align-items: center; gap: 8px;">
                                    <span style="color: #a78bfa;">•</span> ${escapeHtml(h)}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>
                ` : ''}

                <!-- Competitor Insights -->
                ${competitorInsights.likelyCompetitors?.length || competitorInsights.differentiationOpportunity ? `
                <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 20px; margin-top: 20px;">
                    <h4 style="color: #fff; margin: 0 0 16px; font-size: 14px; display: flex; align-items: center; gap: 8px;">
                        <div style="width: 20px; height: 20px; color: #f87171;">${ICONS.flag}</div> Competitive Intelligence
                    </h4>
                    
                    ${competitorInsights.likelyCompetitors?.length ? `
                    <div style="margin-bottom: 12px;">
                        <div style="color: #f87171; font-size: 11px; font-weight: 600; margin-bottom: 6px;">Likely Competitors</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                            ${competitorInsights.likelyCompetitors.map(c => `<span style="background: rgba(239, 68, 68, 0.2); color: #fca5a5; padding: 4px 10px; border-radius: 6px; font-size: 12px;">${escapeHtml(c)}</span>`).join('')}
                        </div>
                    </div>
                    ` : ''}
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        ${competitorInsights.competitorWeaknesses?.length ? `
                        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;">
                            <div style="color: #4ade80; font-size: 11px; font-weight: 600; margin-bottom: 6px;">Their Weaknesses (Your Opportunity)</div>
                            ${competitorInsights.competitorWeaknesses.map(w => `<div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">✓ ${escapeHtml(w)}</div>`).join('')}
                        </div>
                        ` : ''}
                        
                        ${competitorInsights.competitorStrengths?.length ? `
                        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;">
                            <div style="color: #f87171; font-size: 11px; font-weight: 600; margin-bottom: 6px;">Their Strengths (Learn From)</div>
                            ${competitorInsights.competitorStrengths.map(s => `<div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">• ${escapeHtml(s)}</div>`).join('')}
                        </div>
                        ` : ''}
                    </div>
                    
                    ${competitorInsights.differentiationOpportunity ? `
                    <div style="margin-top: 12px; padding: 12px; background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px;">
                        <div style="color: #4ade80; font-size: 11px; font-weight: 600; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;"><span style="width: 14px; height: 14px;">${ICONS.star}</span> Differentiation Opportunity</div>
                        <div style="color: #e2e8f0; font-size: 13px;">${escapeHtml(competitorInsights.differentiationOpportunity)}</div>
                    </div>
                    ` : ''}
                </div>
                ` : ''}

                <!-- Risk Factors -->
                ${riskFactors.length > 0 ? `
                <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 12px; padding: 16px; margin-top: 16px;">
                    <h4 style="color: #fbbf24; margin: 0 0 12px; font-size: 13px; display: flex; align-items: center; gap: 8px;">
                        <div style="width: 18px; height: 18px;">${ICONS.alertTriangle}</div> Risk Factors to Consider
                    </h4>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${riskFactors.slice(0, 4).map(r => `
                            <div style="display: flex; align-items: flex-start; gap: 10px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 6px;">
                                <span style="background: ${r.impact === 'high' ? '#ef4444' : r.impact === 'medium' ? '#f59e0b' : '#22c55e'}; color: #000; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600;">${escapeHtml(r.impact || 'medium')}</span>
                                <div style="flex: 1;">
                                    <div style="color: #e2e8f0; font-size: 12px;">${escapeHtml(r.risk)}</div>
                                    ${r.mitigation ? `<div style="color: #94a3b8; font-size: 11px; margin-top: 4px;">→ ${escapeHtml(r.mitigation)}</div>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <!-- Quick Wins -->
                ${quickWins.length ? `
                <div class="kwa-issues" style="border-left: 3px solid #34d399;">
                    <div class="kwa-issue-group">
                        <div class="kwa-issue-header">
                            <div class="kwa-issue-icon" style="background: rgba(52, 211, 153, 0.2); color: #34d399; width: 24px; height: 24px;">${ICONS.zap}</div>
                            <span class="kwa-issue-title">Quick Wins</span>
                        </div>
                        ${quickWins.map(w => `<div class="kwa-issue-desc" style="margin-top: 8px; display: flex; align-items: flex-start; gap: 8px;"><span style="width: 14px; height: 14px; color: #34d399; flex-shrink: 0;">${ICONS.check}</span> ${escapeHtml(w)}</div>`).join('')}
                    </div>
                </div>
                ` : ''}

                <!-- Content Gaps -->
                ${gaps.length ? `
                <div class="kwa-issues" style="margin-top: 12px;">
                    <div class="kwa-issue-group">
                        <div class="kwa-issue-header">
                            <div class="kwa-issue-icon warning" style="width: 24px; height: 24px;">${ICONS.target}</div>
                            <span class="kwa-issue-title">Content Gaps to Fill</span>
                            <span class="kwa-issue-count">${gaps.length} opportunities</span>
                        </div>
                        ${gaps.map(g => `<div class="kwa-issue-desc" style="margin-top: 8px;">• ${escapeHtml(g)}</div>`).join('')}
                    </div>
                </div>
                ` : ''}

                <!-- PAA Questions (if available) -->
                ${paaQuestions.length ? `
                <div class="kwa-issues" style="margin-top: 12px;">
                    <div class="kwa-issue-group">
                        <div class="kwa-issue-header">
                            <div class="kwa-issue-icon info" style="width: 24px; height: 24px;">${ICONS.messageCircle}</div>
                            <span class="kwa-issue-title">People Also Ask (Content Ideas)</span>
                        </div>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px;">
                            ${paaQuestions.slice(0, 8).map(q => `
                                <span style="background: #111827; border: 1px solid #374151; border-radius: 6px; padding: 6px 12px; font-size: 12px; color: #9ca3af;">
                                    ${escapeHtml(q)}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                </div>
                ` : ''}

                <!-- Related Searches (if available) -->
                ${relatedSearches.length ? `
                <div class="kwa-issues" style="margin-top: 12px;">
                    <div class="kwa-issue-group">
                        <div class="kwa-issue-header">
                            <div class="kwa-issue-icon info" style="width: 24px; height: 24px;">${ICONS.link}</div>
                            <span class="kwa-issue-title">Related Searches</span>
                        </div>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px;">
                            ${relatedSearches.slice(0, 10).map(r => `
                                <span style="background: #1f2937; border: 1px solid #374151; border-radius: 20px; padding: 4px 12px; font-size: 11px; color: #60a5fa;">
                                    ${escapeHtml(r)}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                </div>
                ` : ''}

                <!-- Recommendations -->
                ${results.contentRecommendations?.length || results.technicalRecommendations?.length ? `
                <div class="kwa-issues" style="margin-top: 12px;">
                    ${results.contentRecommendations?.length ? `
                    <div class="kwa-issue-group">
                        <div class="kwa-issue-header">
                            <div class="kwa-issue-icon info" style="width: 24px; height: 24px;">${ICONS.file}</div>
                            <span class="kwa-issue-title">Content Recommendations</span>
                        </div>
                        ${results.contentRecommendations.map(r => `<div class="kwa-issue-desc" style="margin-top: 8px;">• ${escapeHtml(r)}</div>`).join('')}
                    </div>
                    ` : ''}
                    ${results.technicalRecommendations?.length ? `
                    <div class="kwa-issue-group" style="border-top: 1px solid #374151; padding-top: 16px; margin-top: 16px;">
                        <div class="kwa-issue-header">
                            <div class="kwa-issue-icon warning" style="width: 24px; height: 24px;">${ICONS.compass}</div>
                            <span class="kwa-issue-title">Technical SEO Notes</span>
                        </div>
                        ${results.technicalRecommendations.map(r => `<div class="kwa-issue-desc" style="margin-top: 8px;">• ${escapeHtml(r)}</div>`).join('')}
                    </div>
                    ` : ''}
                </div>
                ` : ''}

                <!-- Keywords Table -->
                <div class="kwa-results-header" style="margin-top: 24px;">
                    <span class="kwa-results-title">Top ${Math.min(keywords.length, 50)} Keywords</span>
                    <div class="kwa-results-actions">
                        <select class="kwa-input" style="width: auto; padding: 8px 12px;" id="kwa-intent-filter">
                            <option value="all">All Intents</option>
                            <option value="transactional">Transactional</option>
                            <option value="commercial">Commercial</option>
                            <option value="informational">Informational</option>
                            <option value="navigational">Navigational</option>
                        </select>
                    </div>
                </div>
                <div class="kwa-table-wrapper">
                    <table class="kwa-table" id="kwa-keywords-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Keyword</th>
                                <th>Intent</th>
                                <th>Volume</th>
                                <th>CPC</th>
                                <th>Competition</th>
                                <th>Opportunity</th>
                                <th>Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${keywords.slice(0, 50).map((kw, idx) => `
                                <tr data-intent="${kw.intent}">
                                    <td>${idx + 1}</td>
                                    <td class="kwa-keyword">
                                        ${escapeHtml(kw.keyword)}
                                        ${kw.recommendation ? `<div style="font-size: 10px; color: #6b7280; margin-top: 2px; display: flex; align-items: flex-start; gap: 4px;"><span style="width: 12px; height: 12px; flex-shrink: 0; color: #60a5fa;">${ICONS.lightbulb}</span> ${escapeHtml(kw.recommendation.substring(0, 60))}...</div>` : ''}
                                    </td>
                                    <td><span class="kwa-intent-badge ${kw.intent}">${INTENT_TYPES[kw.intent]?.icon || ''} ${kw.intent}</span></td>
                                    <td>${formatNumber(kw.volume)}</td>
                                    <td>${kw.cpc ? '$' + parseFloat(kw.cpc).toFixed(2) : '-'}</td>
                                    <td>
                                        <span style="color: ${kw.competition === 'low' ? '#34d399' : kw.competition === 'high' ? '#f87171' : '#fbbf24'}">
                                            ${kw.competition || '-'}
                                        </span>
                                    </td>
                                    <td>
                                        <span style="color: ${kw.opportunity === 'high' ? '#34d399' : kw.opportunity === 'low' ? '#f87171' : '#fbbf24'}">
                                            ${kw.opportunity || '-'}
                                        </span>
                                    </td>
                                    <td><span class="kwa-score ${getScoreClass(kw.relevanceScore)}">${kw.relevanceScore}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Content Strategy Blueprint -->
                ${contentBlueprint.currentState || contentBlueprint.messagingHierarchy ? `
                <div style="margin-top: 24px; background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 12px; padding: 20px;">
                    <h4 style="color: #22d3ee; margin: 0 0 16px; font-size: 15px; display: flex; align-items: center; gap: 8px;">
                        <div style="width: 20px; height: 20px;">${ICONS.layers}</div> Content Strategy Blueprint
                    </h4>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                        ${contentBlueprint.currentState ? `
                        <div style="background: rgba(0,0,0,0.2); padding: 14px; border-radius: 8px;">
                            <div style="color: #f87171; font-size: 11px; font-weight: 600; margin-bottom: 6px;">📍 Current State</div>
                            <div style="color: #e2e8f0; font-size: 12px; line-height: 1.5;">${escapeHtml(contentBlueprint.currentState)}</div>
                        </div>
                        ` : ''}
                        
                        ${contentBlueprint.targetState ? `
                        <div style="background: rgba(0,0,0,0.2); padding: 14px; border-radius: 8px;">
                            <div style="color: #4ade80; font-size: 11px; font-weight: 600; margin-bottom: 6px;">🎯 Target State</div>
                            <div style="color: #e2e8f0; font-size: 12px; line-height: 1.5;">${escapeHtml(contentBlueprint.targetState)}</div>
                        </div>
                        ` : ''}
                    </div>
                    
                    ${contentBlueprint.messagingHierarchy ? `
                    <div style="padding: 14px; background: rgba(139, 92, 246, 0.1); border-radius: 8px; margin-bottom: 12px;">
                        <div style="color: #a78bfa; font-size: 11px; font-weight: 600; margin-bottom: 6px;">📢 Messaging Hierarchy</div>
                        <div style="color: #e2e8f0; font-size: 13px;">${escapeHtml(contentBlueprint.messagingHierarchy)}</div>
                    </div>
                    ` : ''}
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        ${contentBlueprint.proofRequired?.length ? `
                        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;">
                            <div style="color: #fbbf24; font-size: 11px; font-weight: 600; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;"><span style="width: 14px; height: 14px;">${ICONS.check}</span> Proof Needed</div>
                            ${contentBlueprint.proofRequired.map(p => `<div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">• ${escapeHtml(p)}</div>`).join('')}
                        </div>
                        ` : ''}
                        
                        ${contentBlueprint.objectionsToAddress?.length ? `
                        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;">
                            <div style="color: #f472b6; font-size: 11px; font-weight: 600; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;"><span style="width: 14px; height: 14px;">${ICONS.alertTriangle}</span> Objections to Address</div>
                            ${contentBlueprint.objectionsToAddress.map(o => `<div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">• ${escapeHtml(o)}</div>`).join('')}
                        </div>
                        ` : ''}
                    </div>
                    
                    ${contentBlueprint.contentPillars?.length ? `
                    <div style="margin-top: 16px;">
                        <div style="color: #22d3ee; font-size: 12px; font-weight: 600; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;"><span style="width: 14px; height: 14px;">${ICONS.layers}</span> Content Pillars</div>
                        <div style="display: grid; gap: 10px;">
                            ${contentBlueprint.contentPillars.map(pillar => `
                                <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; border-left: 3px solid #22d3ee;">
                                    <div style="color: #fff; font-size: 13px; font-weight: 500; margin-bottom: 4px;">${escapeHtml(pillar.pillar)}</div>
                                    ${pillar.purpose ? `<div style="color: #94a3b8; font-size: 11px; margin-bottom: 6px;">${escapeHtml(pillar.purpose)}</div>` : ''}
                                    ${pillar.contentIdeas?.length ? `
                                    <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                                        ${pillar.contentIdeas.map(idea => `<span style="background: rgba(34, 211, 238, 0.2); color: #67e8f9; padding: 2px 6px; border-radius: 4px; font-size: 10px;">${escapeHtml(idea)}</span>`).join('')}
                                    </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>
                ` : ''}

                <!-- Analysis Details -->
                <div style="margin-top: 24px; padding: 16px; background: #111827; border-radius: 12px; border: 1px solid #374151;">
                    <h4 style="color: #f9fafb; margin: 0 0 12px 0; font-size: 14px; display: flex; align-items: center; gap: 8px;"><div style="width: 18px; height: 18px; color: #60a5fa;">${ICONS.barChart}</div> Page Analysis Details</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                        <div>
                            <div style="font-size: 11px; color: #6b7280; text-transform: uppercase;">Detected Persona</div>
                            <div style="font-size: 13px; color: ${analysis.detectedPersona && analysis.detectedPersona !== 'Not detected' ? '#e5e7eb' : '#f87171'}; margin-top: 4px;">${escapeHtml(analysis.detectedPersona || 'Analyzing...')}</div>
                        </div>
                        <div>
                            <div style="font-size: 11px; color: #6b7280; text-transform: uppercase;">Industry</div>
                            <div style="font-size: 13px; color: ${analysis.detectedIndustry && analysis.detectedIndustry !== 'Not detected' ? '#e5e7eb' : '#fbbf24'}; margin-top: 4px;">${escapeHtml(analysis.detectedIndustry || 'Analyzing...')}</div>
                        </div>
                        <div>
                            <div style="font-size: 11px; color: #6b7280; text-transform: uppercase;">CTA Effectiveness</div>
                            <div style="font-size: 13px; color: ${analysis.ctaEffectiveness === 'high' ? '#34d399' : analysis.ctaEffectiveness === 'low' ? '#f87171' : '#fbbf24'}; margin-top: 4px;">
                                ${analysis.ctaEffectiveness || 'Not analyzed'}
                            </div>
                        </div>
                        <div>
                            <div style="font-size: 11px; color: #6b7280; text-transform: uppercase;">Content Depth</div>
                            <div style="font-size: 13px; color: #e5e7eb; margin-top: 4px;">
                                ${analysis.contentDepthScore ? `${analysis.contentDepthScore}/100` : 'Not scored'}
                            </div>
                        </div>
                    </div>
                    ${analysis.trustSignals?.length ? `
                    <div style="margin-top: 16px;">
                        <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; margin-bottom: 8px;">Trust Signals Detected</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                            ${analysis.trustSignals.map(s => `
                                <span style="background: rgba(52, 211, 153, 0.1); border: 1px solid rgba(52, 211, 153, 0.3); border-radius: 4px; padding: 4px 8px; font-size: 11px; color: #34d399; display: inline-flex; align-items: center; gap: 4px;">
                                    <span style="width: 12px; height: 12px;">${ICONS.check}</span> ${escapeHtml(s)}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // ==================== RENDER KEYWORDS TO PAGE RESULTS ====================
    function renderKeywordsToPageResults(results) {
        const summary = results.summary || {};
        const issues = results.issues || [];
        const keywords = results.keywords || [];
        
        return `
            <div class="kwa-results">
                <!-- Score Summary -->
                <div class="kwa-score-summary">
                    <div class="kwa-score-card">
                        <div class="kwa-score-value ${getScoreClass(summary.averageFitScore || 0)}">${summary.averageFitScore || '-'}</div>
                        <div class="kwa-score-label">Avg Fit Score</div>
                    </div>
                    <div class="kwa-score-card">
                        <div class="kwa-score-value high">${summary.highFit || 0}</div>
                        <div class="kwa-score-label">High Fit (80+)</div>
                    </div>
                    <div class="kwa-score-card">
                        <div class="kwa-score-value medium">${summary.mediumFit || 0}</div>
                        <div class="kwa-score-label">Medium (50-79)</div>
                    </div>
                    <div class="kwa-score-card">
                        <div class="kwa-score-value low">${summary.lowFit || 0}</div>
                        <div class="kwa-score-label">Low (&lt;50)</div>
                    </div>
                </div>

                <!-- Issues -->
                ${issues.length ? `
                <div class="kwa-issues">
                    ${issues.map(issue => `
                        <div class="kwa-issue-group">
                            <div class="kwa-issue-header">
                                <div class="kwa-issue-icon ${issue.severity === 'critical' ? 'critical' : 'warning'}">
                                    ${issue.severity === 'critical' ? '🔴' : '🟡'}
                                </div>
                                <span class="kwa-issue-title">${escapeHtml(issue.type.replace(/_/g, ' ').toUpperCase())}</span>
                                <span class="kwa-issue-count">${issue.count} keywords</span>
                            </div>
                            <div class="kwa-issue-desc">${escapeHtml(issue.description)}</div>
                            <div class="kwa-issue-action" style="display: flex; align-items: flex-start; gap: 6px;"><span style="width: 14px; height: 14px; flex-shrink: 0;">${ICONS.lightbulb}</span> ${escapeHtml(issue.recommendation)}</div>
                        </div>
                    `).join('')}
                </div>
                ` : ''}

                <!-- Keywords Table -->
                <div class="kwa-table-wrapper">
                    <table class="kwa-table">
                        <thead>
                            <tr>
                                <th>Keyword</th>
                                <th>Intent</th>
                                <th>Found In</th>
                                <th>Issues</th>
                                <th>Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${keywords.map(kw => `
                                <tr>
                                    <td class="kwa-keyword">${escapeHtml(kw.keyword)}</td>
                                    <td>
                                        <span class="kwa-intent-badge ${kw.intent}">${kw.intent}</span>
                                        ${!kw.intentMatch ? '<span title="Intent mismatch">⚠️</span>' : ''}
                                    </td>
                                    <td>
                                        <div class="kwa-locations">
                                            ${(kw.foundIn || []).map(loc => `<span class="kwa-location-tag found">${loc}</span>`).join('')}
                                            ${(!kw.foundIn || kw.foundIn.length === 0) ? '<span class="kwa-location-tag">Not found</span>' : ''}
                                        </div>
                                    </td>
                                    <td>${(kw.issues || []).length || '-'}</td>
                                    <td><span class="kwa-score ${getScoreClass(kw.fitScore)}">${kw.fitScore}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // ==================== RENDER COMPETITOR RESULTS ====================
    function renderCompetitorResults(results) {
        const comparison = results.comparison || {};
        const gaps = results.gaps || [];
        const advantages = results.advantages || [];
        
        return `
            <div class="kwa-results">
                <!-- Comparison Grid -->
                <div class="kwa-comparison-grid">
                    <!-- Your Page -->
                    <div class="kwa-comparison-card">
                        <div class="kwa-comparison-header yours">
                            <div class="kwa-comparison-label">Your Page</div>
                            <div class="kwa-comparison-url">${escapeHtml(comparison.yourPage?.url || state.landingPageUrl)}</div>
                        </div>
                        <div class="kwa-comparison-body">
                            <div class="kwa-comparison-row">
                                <span class="kwa-comparison-metric">Word Count</span>
                                <span class="kwa-comparison-value">${comparison.yourPage?.wordCount || '-'}</span>
                            </div>
                            <div class="kwa-comparison-row">
                                <span class="kwa-comparison-metric">Trust Signals</span>
                                <span class="kwa-comparison-value">${comparison.yourPage?.trustSignals || 0}</span>
                            </div>
                            <div class="kwa-comparison-row">
                                <span class="kwa-comparison-metric">Pricing Shown</span>
                                <span class="kwa-comparison-value">${comparison.yourPage?.pricingShown ? 'Yes' : 'No'}</span>
                            </div>
                            <div class="kwa-comparison-row">
                                <span class="kwa-comparison-metric">CTA Type</span>
                                <span class="kwa-comparison-value">${comparison.yourPage?.ctaType || '-'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Competitors -->
                    ${(comparison.competitors || []).map((comp, idx) => `
                        <div class="kwa-comparison-card">
                            <div class="kwa-comparison-header">
                                <div class="kwa-comparison-label">Competitor ${idx + 1}</div>
                                <div class="kwa-comparison-url">${escapeHtml(comp.url)}</div>
                            </div>
                            <div class="kwa-comparison-body">
                                <div class="kwa-comparison-row">
                                    <span class="kwa-comparison-metric">Word Count</span>
                                    <span class="kwa-comparison-value">${comp.wordCount || '-'}</span>
                                </div>
                                <div class="kwa-comparison-row">
                                    <span class="kwa-comparison-metric">Trust Signals</span>
                                    <span class="kwa-comparison-value">${comp.trustSignals || 0}</span>
                                </div>
                                <div class="kwa-comparison-row">
                                    <span class="kwa-comparison-metric">Pricing Shown</span>
                                    <span class="kwa-comparison-value">${comp.pricingShown ? 'Yes' : 'No'}</span>
                                </div>
                                <div class="kwa-comparison-row">
                                    <span class="kwa-comparison-metric">CTA Type</span>
                                    <span class="kwa-comparison-value">${comp.ctaType || '-'}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Gaps to Close -->
                ${gaps.length ? `
                <div class="kwa-issues" style="margin-top: 24px;">
                    <div class="kwa-issue-group">
                        <div class="kwa-issue-header">
                            <div class="kwa-issue-icon warning">🎯</div>
                            <span class="kwa-issue-title">Gaps to Close</span>
                        </div>
                        ${gaps.map(g => `
                            <div style="margin-top: 12px;">
                                <strong style="color: #f9fafb;">${escapeHtml(g.area)}</strong>
                                <div class="kwa-issue-desc">${escapeHtml(g.issue)}</div>
                                <div class="kwa-issue-action" style="display: flex; align-items: flex-start; gap: 6px;"><span style="width: 14px; height: 14px; flex-shrink: 0; color: #60a5fa;">${ICONS.lightbulb}</span> ${escapeHtml(g.recommendation)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <!-- Your Advantages -->
                ${advantages.length ? `
                <div class="kwa-issues" style="margin-top: 16px;">
                    <div class="kwa-issue-group">
                        <div class="kwa-issue-header">
                            <div class="kwa-issue-icon info">✅</div>
                            <span class="kwa-issue-title">Your Advantages</span>
                        </div>
                        ${advantages.map(a => `
                            <div style="margin-top: 12px;">
                                <strong style="color: #34d399;">${escapeHtml(a.area)}</strong>
                                <div class="kwa-issue-desc">${escapeHtml(a.advantage)}</div>
                                <div class="kwa-issue-action" style="display: flex; align-items: flex-start; gap: 6px;"><span style="width: 14px; height: 14px; flex-shrink: 0; color: #60a5fa;">${ICONS.lightbulb}</span> ${escapeHtml(a.leverage)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    }

    // ==================== GENERATE AD COPY ====================
    async function generateAdCopy(container) {
        if (!state.analysisResults) {
            alert('Please run an analysis first');
            return;
        }

        const keywords = state.analysisResults.keywords || [];
        if (keywords.length === 0) {
            alert('No keywords found to generate ads from');
            return;
        }

        // Show ad type selection modal
        showAdTypeModal(container);
    }

    // ==================== AD TYPE SELECTION MODAL ====================
    function showAdTypeModal(container) {
        const modal = document.createElement('div');
        modal.className = 'kwa-modal-overlay';
        modal.innerHTML = `
            <div class="kwa-modal">
                <div class="kwa-modal-header">
                    <h3>Generate Ad Copy</h3>
                    <button type="button" class="kwa-modal-close">&times;</button>
                </div>
                <div class="kwa-modal-body">
                    <p style="color: #9ca3af; margin-bottom: 16px;">Select the ad platform and type to generate optimized copy from your keyword analysis:</p>
                    
                    <div class="kwa-ad-platform-section">
                        <h4 style="color: #f9fafb; margin-bottom: 12px; font-size: 14px;">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; vertical-align: middle; margin-right: 6px;"><path d="M3 11l18-5v12L3 13v-2z"/></svg>
                            Google Ads
                        </h4>
                        <div class="kwa-ad-type-grid">
                            <button type="button" class="kwa-ad-type-btn" data-platform="google" data-type="rsa">
                                <span class="kwa-ad-type-icon">🔍</span>
                                <span class="kwa-ad-type-name">Search (RSA)</span>
                                <span class="kwa-ad-type-desc">15 headlines, 4 descriptions</span>
                            </button>
                            <button type="button" class="kwa-ad-type-btn" data-platform="google" data-type="pmax">
                                <span class="kwa-ad-type-icon" style="width: 18px; height: 18px;">${ICONS.zap}</span>
                                <span class="kwa-ad-type-name">Performance Max</span>
                                <span class="kwa-ad-type-desc">5 headlines, 5 descriptions</span>
                            </button>
                            <button type="button" class="kwa-ad-type-btn" data-platform="google" data-type="display">
                                <span class="kwa-ad-type-icon">🖼️</span>
                                <span class="kwa-ad-type-name">Display</span>
                                <span class="kwa-ad-type-desc">Short & long headlines</span>
                            </button>
                            <button type="button" class="kwa-ad-type-btn" data-platform="google" data-type="shopping">
                                <span class="kwa-ad-type-icon">🛒</span>
                                <span class="kwa-ad-type-name">Shopping</span>
                                <span class="kwa-ad-type-desc">Product feed data</span>
                            </button>
                        </div>
                    </div>

                    <div class="kwa-ad-platform-section" style="margin-top: 20px;">
                        <h4 style="color: #f9fafb; margin-bottom: 12px; font-size: 14px;">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; vertical-align: middle; margin-right: 6px;"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>
                            Social Media
                        </h4>
                        <div class="kwa-ad-type-grid">
                            <button type="button" class="kwa-ad-type-btn" data-platform="social" data-type="meta">
                                <span class="kwa-ad-type-icon">📘</span>
                                <span class="kwa-ad-type-name">Meta (FB/IG)</span>
                                <span class="kwa-ad-type-desc">Feed, Stories, Carousel</span>
                            </button>
                            <button type="button" class="kwa-ad-type-btn" data-platform="social" data-type="linkedin">
                                <span class="kwa-ad-type-icon">💼</span>
                                <span class="kwa-ad-type-name">LinkedIn</span>
                                <span class="kwa-ad-type-desc">Single Image, InMail</span>
                            </button>
                            <button type="button" class="kwa-ad-type-btn" data-platform="social" data-type="twitter">
                                <span class="kwa-ad-type-icon">𝕏</span>
                                <span class="kwa-ad-type-name">X (Twitter)</span>
                                <span class="kwa-ad-type-desc">Promoted Tweets</span>
                            </button>
                            <button type="button" class="kwa-ad-type-btn" data-platform="social" data-type="tiktok">
                                <span class="kwa-ad-type-icon">🎵</span>
                                <span class="kwa-ad-type-name">TikTok</span>
                                <span class="kwa-ad-type-desc">In-Feed, Spark Ads</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .kwa-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 10000; }
            .kwa-modal { background: #1f2937; border-radius: 16px; width: 90%; max-width: 600px; max-height: 90vh; overflow: hidden; border: 1px solid #374151; }
            .kwa-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #374151; }
            .kwa-modal-header h3 { margin: 0; font-size: 18px; color: #f9fafb; }
            .kwa-modal-close { background: none; border: none; color: #6b7280; font-size: 24px; cursor: pointer; padding: 0; line-height: 1; }
            .kwa-modal-close:hover { color: #f9fafb; }
            .kwa-modal-body { padding: 24px; overflow-y: auto; max-height: calc(90vh - 80px); }
            .kwa-ad-type-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
            .kwa-ad-type-btn { background: #111827; border: 1px solid #374151; border-radius: 12px; padding: 16px; cursor: pointer; text-align: left; transition: all 0.2s; }
            .kwa-ad-type-btn:hover { border-color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
            .kwa-ad-type-icon { font-size: 24px; display: block; margin-bottom: 8px; }
            .kwa-ad-type-name { font-size: 14px; font-weight: 600; color: #f9fafb; display: block; margin-bottom: 4px; }
            .kwa-ad-type-desc { font-size: 11px; color: #6b7280; display: block; }
        `;
        modal.appendChild(style);

        document.body.appendChild(modal);

        // Event handlers
        modal.querySelector('.kwa-modal-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        modal.querySelectorAll('.kwa-ad-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const platform = btn.dataset.platform;
                const adType = btn.dataset.type;
                modal.remove();
                navigateToAdBuilder(platform, adType);
            });
        });
    }

    // ==================== NAVIGATE TO AD BUILDER ====================
    function navigateToAdBuilder(platform, adType) {
        // Prepare data to pass to the ad builder
        const keywords = state.analysisResults?.keywords || [];
        const topKeywords = keywords.slice(0, 10).map(k => k.keyword);
        const pageData = state.landingPageData || {};

        // Store data for the ad builder to pick up
        const adBuilderData = {
            source: 'keyword-analyzer',
            url: state.landingPageUrl,
            brandName: pageData.domain || '',
            product: pageData.primaryTopic || '',
            audience: pageData.persona || '',
            benefits: pageData.valueProps?.join('\n') || '',
            keywords: topKeywords,
            industry: pageData.industry || ''
        };

        localStorage.setItem('kwa_ad_builder_data', JSON.stringify(adBuilderData));

        if (platform === 'google') {
            // Navigate to Google Ads Builder
            if (window.GoogleAdsBuilder) {
                // Pre-select the ad type
                localStorage.setItem('kwa_google_ad_type', adType);
            }
            // Trigger navigation
            document.getElementById('nav-google-ads')?.click();
        } else if (platform === 'social') {
            // Navigate to Social Media Builder
            if (window.SocialMediaBuilder) {
                localStorage.setItem('kwa_social_platform', adType);
            }
            document.getElementById('nav-social-media')?.click();
        }
    }

    // ==================== EXPORT CSV ====================
    function exportCSV() {
        if (!state.analysisResults?.keywords) {
            alert('No keyword data to export');
            return;
        }

        const keywords = state.analysisResults.keywords;
        const headers = ['Keyword', 'Intent', 'Relevance Score', 'Volume', 'CPC', 'Competition', 'Recommendation'];
        
        const rows = keywords.map(kw => [
            `"${kw.keyword}"`,
            kw.intent,
            kw.relevanceScore || kw.fitScore || '',
            kw.volume || '',
            kw.cpc || '',
            kw.competition || '',
            `"${kw.recommendation || ''}"`
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `keyword-analysis-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // ==================== SAVE TO CRM ====================
    function saveToCRM(container) {
        if (!state.analysisResults) {
            alert('No analysis data to save');
            return;
        }

        // Show company selection modal
        showCRMModal(container);
    }

    // ==================== CRM COMPANY MODAL ====================
    function showCRMModal(container) {
        // Get existing companies from CRM
        let companies = [];
        try {
            const crmData = localStorage.getItem('cav_crm_companies');
            if (crmData) {
                companies = JSON.parse(crmData);
            }
        } catch (e) {
            console.error('Error loading companies:', e);
        }

        const modal = document.createElement('div');
        modal.className = 'kwa-modal-overlay';
        modal.innerHTML = `
            <div class="kwa-modal">
                <div class="kwa-modal-header">
                    <h3>Save to CRM</h3>
                    <button type="button" class="kwa-modal-close">&times;</button>
                </div>
                <div class="kwa-modal-body">
                    <div class="kwa-crm-tabs">
                        <button type="button" class="kwa-crm-tab active" data-tab="existing">
                            📁 Add to Existing Company
                        </button>
                        <button type="button" class="kwa-crm-tab" data-tab="new">
                            ➕ Create New Company
                        </button>
                    </div>

                    <!-- Existing Company Tab -->
                    <div class="kwa-crm-tab-content active" data-content="existing">
                        ${companies.length > 0 ? `
                            <div class="kwa-form-group">
                                <label class="kwa-label">Select Company</label>
                                <select class="kwa-input" id="kwa-crm-company-select">
                                    <option value="">-- Select a company --</option>
                                    ${companies.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('')}
                                </select>
                            </div>
                            <div class="kwa-form-group">
                                <label class="kwa-label">Analysis Name</label>
                                <input type="text" class="kwa-input" id="kwa-crm-analysis-name" 
                                    value="Keyword Analysis - ${new Date().toLocaleDateString()}" 
                                    placeholder="Name this analysis">
                            </div>
                        ` : `
                            <div style="text-align: center; padding: 30px; color: #6b7280;">
                                <p>No companies found in CRM.</p>
                                <p style="margin-top: 8px;">Create a new company to save this analysis.</p>
                            </div>
                        `}
                    </div>

                    <!-- New Company Tab -->
                    <div class="kwa-crm-tab-content" data-content="new">
                        <div class="kwa-form-group">
                            <label class="kwa-label">Company Name *</label>
                            <input type="text" class="kwa-input" id="kwa-crm-new-company-name" 
                                value="${escapeHtml(state.landingPageData?.domain || '')}"
                                placeholder="Enter company name">
                        </div>
                        <div class="kwa-form-group">
                            <label class="kwa-label">Website</label>
                            <input type="url" class="kwa-input" id="kwa-crm-new-company-website" 
                                value="${escapeHtml(state.landingPageUrl || '')}"
                                placeholder="https://example.com">
                        </div>
                        <div class="kwa-form-group">
                            <label class="kwa-label">Industry</label>
                            <input type="text" class="kwa-input" id="kwa-crm-new-company-industry" 
                                value="${escapeHtml(state.landingPageData?.industry || '')}"
                                placeholder="Industry vertical">
                        </div>
                        <div class="kwa-form-group">
                            <label class="kwa-label">Analysis Name</label>
                            <input type="text" class="kwa-input" id="kwa-crm-new-analysis-name" 
                                value="Keyword Analysis - ${new Date().toLocaleDateString()}"
                                placeholder="Name this analysis">
                        </div>
                    </div>

                    <div class="kwa-crm-actions">
                        <button type="button" class="kwa-action-btn" id="kwa-crm-cancel">Cancel</button>
                        <button type="button" class="kwa-action-btn primary" id="kwa-crm-save">
                            💾 Save to CRM
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .kwa-crm-tabs { display: flex; gap: 8px; margin-bottom: 20px; }
            .kwa-crm-tab { flex: 1; background: #111827; border: 1px solid #374151; border-radius: 8px; padding: 12px; color: #9ca3af; font-size: 13px; cursor: pointer; transition: all 0.2s; }
            .kwa-crm-tab:hover { border-color: #4b5563; color: #e5e7eb; }
            .kwa-crm-tab.active { background: #3b82f6; border-color: #3b82f6; color: white; }
            .kwa-crm-tab-content { display: none; }
            .kwa-crm-tab-content.active { display: block; }
            .kwa-crm-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 20px; border-top: 1px solid #374151; }
        `;
        modal.appendChild(style);

        document.body.appendChild(modal);

        // Track active tab
        let activeTab = 'existing';

        // Event handlers
        modal.querySelector('.kwa-modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('#kwa-crm-cancel').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        // Tab switching
        modal.querySelectorAll('.kwa-crm-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                activeTab = tab.dataset.tab;
                modal.querySelectorAll('.kwa-crm-tab').forEach(t => t.classList.remove('active'));
                modal.querySelectorAll('.kwa-crm-tab-content').forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                modal.querySelector(`[data-content="${activeTab}"]`).classList.add('active');
            });
        });

        // Save button
        modal.querySelector('#kwa-crm-save').addEventListener('click', () => {
            if (activeTab === 'existing') {
                const companyId = modal.querySelector('#kwa-crm-company-select')?.value;
                const analysisName = modal.querySelector('#kwa-crm-analysis-name')?.value || 'Keyword Analysis';
                
                if (!companyId) {
                    alert('Please select a company');
                    return;
                }
                
                saveAnalysisToCompany(companyId, analysisName);
            } else {
                const companyName = modal.querySelector('#kwa-crm-new-company-name')?.value?.trim();
                const website = modal.querySelector('#kwa-crm-new-company-website')?.value?.trim();
                const industry = modal.querySelector('#kwa-crm-new-company-industry')?.value?.trim();
                const analysisName = modal.querySelector('#kwa-crm-new-analysis-name')?.value || 'Keyword Analysis';
                
                if (!companyName) {
                    alert('Please enter a company name');
                    return;
                }
                
                // Create new company and save
                const newCompany = createNewCompany(companyName, website, industry);
                saveAnalysisToCompany(newCompany.id, analysisName);
            }
            
            modal.remove();
            alert('✅ Analysis saved to CRM successfully!');
        });
    }

    // ==================== CREATE NEW COMPANY ====================
    function createNewCompany(name, website, industry) {
        const newCompany = {
            id: 'company_' + Date.now(),
            name: name,
            website: website || '',
            industry: industry || '',
            createdAt: new Date().toISOString(),
            contacts: [],
            projects: [],
            analyses: []
        };

        // Save to localStorage
        let companies = [];
        try {
            companies = JSON.parse(localStorage.getItem('cav_crm_companies') || '[]');
        } catch (e) {}
        
        companies.unshift(newCompany);
        localStorage.setItem('cav_crm_companies', JSON.stringify(companies));

        // Also add to CRM module if available
        if (window.CAV_CRM?.addCompany) {
            window.CAV_CRM.addCompany(newCompany);
        }

        console.log('[KeywordAnalyzer] Created new company:', newCompany.name);
        return newCompany;
    }

    // ==================== SAVE ANALYSIS TO COMPANY ====================
    function saveAnalysisToCompany(companyId, analysisName) {
        const analysis = {
            id: 'analysis_' + Date.now(),
            name: analysisName,
            type: 'keyword_analysis',
            mode: state.mode,
            url: state.landingPageUrl,
            pageData: state.landingPageData,
            results: state.analysisResults,
            keywords: state.analysisResults?.keywords?.slice(0, 50) || [],
            createdAt: new Date().toISOString()
        };

        // Update company in localStorage
        try {
            let companies = JSON.parse(localStorage.getItem('cav_crm_companies') || '[]');
            const companyIndex = companies.findIndex(c => c.id === companyId);
            
            if (companyIndex >= 0) {
                if (!companies[companyIndex].analyses) {
                    companies[companyIndex].analyses = [];
                }
                companies[companyIndex].analyses.unshift(analysis);
                companies[companyIndex].updatedAt = new Date().toISOString();
                localStorage.setItem('cav_crm_companies', JSON.stringify(companies));
            }
        } catch (e) {
            console.error('Error saving to company:', e);
        }

        // Also save to standalone analyses
        const saved = JSON.parse(localStorage.getItem('kwa_saved_analyses') || '[]');
        saved.unshift({ ...analysis, companyId });
        localStorage.setItem('kwa_saved_analyses', JSON.stringify(saved.slice(0, 100)));
        
        // Also save to unified storage for cross-device sync
        if (window.UnifiedStorage) {
            window.UnifiedStorage.saveKeywordResearch({
                ...analysis,
                company_id: companyId,
                id: analysis.id || `keyword_${Date.now()}`
            }).catch(e => console.warn('[KeywordAnalyzer] Unified storage save failed:', e));
        }

        // Log activity
        if (window.CAV_CRM?.logActivity) {
            window.CAV_CRM.logActivity('keyword_analysis_saved', {
                companyId,
                analysisName,
                url: state.landingPageUrl,
                keywordCount: analysis.keywords.length
            });
        }

        console.log('[KeywordAnalyzer] Saved analysis to company:', companyId);
    }

    // ==================== UTILITY FUNCTIONS ====================
    function getAPIKey() {
        // Use same method as other modules
        if (window.CAVSettings?.manager?.getAPIKey) {
            return window.CAVSettings.manager.getAPIKey('gemini') || 
                   window.CAVSettings.manager.getAPIKey('openai');
        }
        if (window.CAVSettings?.manager?.accessControl?.getAPIKey) {
            const r = window.CAVSettings.manager.accessControl.getAPIKey('gemini', window.CAVSettings.manager);
            return r?.key;
        }
        return null;
    }

    async function callAI(prompt, options = {}) {
        // Use AIModelSelector if available for multi-model support
        const selectedModel = options.model || state.selectedModel || window.AIModelSelector?.selectedModel || 'gemini-3-flash-preview';
        const maxTokens = options.maxTokens || 16384; // Increased for comprehensive responses
        const temperature = options.temperature || 0.3; // Lower for more consistent output
        
        if (window.AIModelSelector && !options.directCall) {
            console.log(`[KWA] Using AIModelSelector with model: ${selectedModel}`);
            try {
                const result = await window.AIModelSelector.callAI(prompt, { 
                    model: selectedModel,
                    maxTokens,
                    temperature
                });
                return typeof result === 'string' ? result : JSON.stringify(result);
            } catch (error) {
                console.error('[KWA] AIModelSelector call failed:', error);
                // Fall through to direct call
            }
        }

        // Fallback to direct Gemini call
        const apiKey = getAPIKey();
        if (!apiKey) throw new Error('No API key configured. Go to Settings to add one.');

        console.log('[KWA] Calling AI with prompt length:', prompt.length, 'maxTokens:', maxTokens);

        // Try Gemini 3 Flash first, fallback to Gemini 2.0 Flash
        const models = ['gemini-3-flash-preview', 'gemini-2.0-flash-exp'];
        let lastError = null;

        for (const model of models) {
            try {
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }],
                            generationConfig: { 
                                temperature, 
                                maxOutputTokens: maxTokens,
                                responseMimeType: 'application/json'
                            }
                        })
                    }
                );

                if (!response.ok) {
                    const err = await response.json();
                    lastError = err.error?.message || 'AI API error';
                    console.warn(`[KWA] Model ${model} failed:`, lastError);
                    continue;
                }

                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                
                if (text) {
                    console.log('[KWA] AI response received, length:', text.length);
                    return text;
                }
            } catch (e) {
                lastError = e.message;
                console.warn(`[KWA] Model ${model} error:`, e.message);
            }
        }

        throw new Error(lastError || 'All AI models failed');
    }
    
    // Generate strategic insights in a separate call for comprehensive depth
    async function generateStrategicInsights(baseResults, pageData, landingPageUrl) {
        console.log('[KWA] Generating strategic insights...');
        
        const prompt = `You are a world-class marketing strategist and PPC expert. Based on this landing page analysis, provide DEEP strategic insights.

=== CONTEXT ===
URL: ${landingPageUrl}
Title: ${pageData?.title || 'Unknown'}
Description: ${pageData?.metaDescription || 'Unknown'}
Industry: ${pageData?.industry || 'Unknown'}
Page Type: ${pageData?.pageType || 'Unknown'}
Primary Topic: ${pageData?.primaryTopic || 'Unknown'}
Key Features: ${pageData?.features?.slice(0, 5).join(', ') || 'Unknown'}
CTAs Found: ${pageData?.ctas?.join(', ') || 'Unknown'}

=== TOP KEYWORDS IDENTIFIED ===
${(baseResults.keywords || []).slice(0, 10).map(k => `- ${k.keyword} (${k.intent}, score: ${k.relevanceScore})`).join('\n')}

=== YOUR TASK ===
Provide comprehensive strategic analysis. Be SPECIFIC to this business - no generic advice. Research this company/industry and provide REAL insights.

Return JSON:
{
  "strategicNarrative": {
    "bigPicture": "[3-4 sentences about what this page is trying to accomplish, who it serves, and the core market opportunity. Be specific to THIS business.]",
    "marketContext": "[2-3 sentences about the current state of this industry/market. What trends are happening? Why does this page matter now? Include real industry context.]",
    "competitivePosition": "[Where does this business/page stand vs competitors? What's their unique angle? What opportunity gap exists? Name likely competitors if you can identify them.]",
    "audiencePsychology": "[Why do people search for these terms? What's the underlying need, pain, or desire? What emotional drivers are at play? Be specific about the buyer persona.]",
    "winningStrategy": "[5 specific, actionable recommendations that will make the biggest impact for THIS business. Explain WHY each matters.]"
  },
  "keywordStrategies": [
    {
      "keyword": "[top priority keyword]",
      "whyThisMatters": "[2-3 sentences on strategic reasoning - why this keyword is valuable for this specific business]",
      "userIntent": "[What the searcher really wants - be specific about their situation, not generic]",
      "competitiveOpportunity": "[Why this business can win with this keyword vs competitors]",
      "contentAngle": "[Specific messaging/content angle that would resonate]",
      "expectedImpact": "[Estimated traffic and conversion potential]",
      "priorityReason": "[Why prioritize this over other keywords]"
    }
  ],
  "contentStrategyBlueprint": {
    "currentState": "[What the page currently does well and what it's missing - be specific]",
    "targetState": "[What the ideal version of this page would look like]",
    "messagingHierarchy": "[Primary message that should lead > Secondary supporting points > Tertiary details]",
    "proofRequired": ["[Specific proof/evidence this page needs to be more convincing]"],
    "objectionsToAddress": ["[Common objections or concerns visitors likely have]"],
    "contentPillars": [
      {
        "pillar": "[content theme]",
        "purpose": "[why this content matters for conversions/SEO]",
        "keywordsSupported": ["[keywords this helps rank for]"],
        "contentIdeas": ["[2-3 specific content pieces to create]"]
      }
    ]
  },
  "adCopyInsights": {
    "primaryAngle": "[The main hook/angle that would work best for ads]",
    "emotionalTriggers": ["[3-5 specific emotions to tap into]"],
    "uniqueSellingPoints": ["[3-5 USPs to emphasize based on the page]"],
    "ctaRecommendations": ["[3-5 CTAs that would work for this audience]"],
    "headlineFormulas": ["[5 specific headline approaches with examples]"],
    "descriptionThemes": ["[3-4 key themes for ad descriptions]"]
  },
  "projectedImpact": {
    "estimatedMonthlySearches": "[sum of monthly searches for recommended keywords]",
    "estimatedTrafficPotential": "[monthly traffic estimate with 3-5% CTR]",
    "conversionEstimate": "[monthly conversions with industry benchmark CVR]",
    "revenueImpact": "[estimated monthly revenue impact if applicable]",
    "timeToResults": "[realistic timeline for seeing results]",
    "quickWinImpact": "[what can be achieved in 30 days]",
    "confidenceLevel": "[low/medium/high with explanation]"
  },
  "competitorInsights": {
    "likelyCompetitors": ["[3-5 specific competitors for these keywords]"],
    "competitorStrengths": ["[what competitors do well]"],
    "competitorWeaknesses": ["[where you can beat them]"],
    "differentiationOpportunity": "[specific way to stand out in this market]",
    "pricingPositionRecommendation": "[how to position on pricing/value]"
  },
  "riskFactors": [
    {
      "risk": "[specific risk or challenge]",
      "likelihood": "high/medium/low",
      "impact": "high/medium/low",
      "mitigation": "[how to address this risk]"
    }
  ],
  "pageAnalysisDetails": {
    "detectedPersona": "[specific buyer persona based on page content]",
    "detectedIndustry": "[industry/vertical]",
    "ctaEffectiveness": "[score 1-10 with explanation]",
    "contentDepth": "[comprehensive/adequate/shallow with explanation]",
    "trustSignals": ["[trust elements found on page]"],
    "conversionBarriers": ["[things that might prevent conversion]"]
  },
  "executiveSummary": {
    "oneLineRecommendation": "[The single most important thing to do right now]",
    "expectedOutcome": "[What success looks like if recommendations are followed]",
    "topStrengths": ["[3 key strengths of this page]"],
    "topWeaknesses": ["[3 key areas to improve]"],
    "launchReadiness": "[ready/minor work needed/significant work needed]"
  }
}`;

        try {
            const response = await callAI(prompt, { directCall: true, maxTokens: 16384, temperature: 0.3 });
            const insights = parseJSON(response);
            console.log('[KWA] Strategic insights generated:', Object.keys(insights || {}));
            return insights;
        } catch (error) {
            console.error('[KWA] Strategic insights generation failed:', error);
            return null;
        }
    }

    function parseJSON(text) {
        if (!text) {
            console.error('[KWA] Empty response from AI');
            return {};
        }
        
        try {
            // Try to extract JSON from the response
            // First, try to find JSON object
            let match = text.match(/\{[\s\S]*\}/);
            if (match) {
                // Clean up the JSON - remove any markdown code blocks
                let jsonStr = match[0]
                    .replace(/```json\s*/g, '')
                    .replace(/```\s*/g, '')
                    .trim();
                
                const result = JSON.parse(jsonStr);
                console.log('[KWA] Parsed JSON successfully:', Object.keys(result));
                return result;
            }
            
            // If no object found, try array
            match = text.match(/\[[\s\S]*\]/);
            if (match) {
                const result = JSON.parse(match[0]);
                console.log('[KWA] Parsed JSON array');
                return { keywords: result };
            }
            
            console.error('[KWA] No JSON found in response:', text.substring(0, 200));
            return {};
        } catch (e) {
            console.error('[KWA] JSON parse error:', e.message);
            console.error('[KWA] Response text:', text.substring(0, 500));
            return {};
        }
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function formatNumber(num) {
        if (!num) return '-';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    function getScoreClass(score) {
        if (score >= 80) return 'high';
        if (score >= 50) return 'medium';
        return 'low';
    }

    // ==================== PUBLIC API ====================
    return {
        createUI,
        attachEventHandlers,
        state,
        expandAll: () => console.log('Expand all not implemented yet')
    };
})();
