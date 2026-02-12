/**
 * Learn Module - Creative Asset Validator v3.0.7
 * Knowledge Intelligence with URL Analyzer, Competitor Tracking,
 * Best Practices Library, Benchmarks Database, and Swipe File System
 * 
 * v3.0.7 FIXES:
 * - Auto-save to swipe file after URL analysis
 * - Extract benchmarks from URL analysis automatically
 * - Detect and track competitors from URL analysis
 * - Persist all analysis history to localStorage and CRM
 * - Link URL analyses to CRM companies
 * - Show sources for benchmarks
 */

(function() {
    'use strict';

    const LEARN_VERSION = '3.3.0';

    // User-specific storage key prefix - ROBUST multi-source check
    function getLearnStoragePrefix() {
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
                return `cav_learn_${userKey}_`;
            }
        } catch (e) {
            console.warn('[Learn] Error getting user prefix:', e);
        }
        return 'cav_learn_anonymous_';
    }
    
    // Dynamic storage keys - user-specific
    const STORAGE_KEYS = {
        get SWIPE_FILE() { return `${getLearnStoragePrefix()}swipe_file`; },
        get BENCHMARKS() { return `${getLearnStoragePrefix()}benchmarks`; },
        get BEST_PRACTICES() { return `${getLearnStoragePrefix()}best_practices`; },
        get URL_HISTORY() { return `${getLearnStoragePrefix()}url_history`; },
        get COMPETITORS() { return `${getLearnStoragePrefix()}competitors`; },
    };

    // ============================================
    // STANDARDIZED ICONS (SVG - No Emojis)
    // ============================================
    const ICONS = {
        link: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
        image: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
        video: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>',
        folder: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
        book: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
        chart: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
        eye: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
        search: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
        target: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
        lightbulb: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 4 12.9V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.1A7 7 0 0 1 12 2z"/></svg>',
        hook: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M8 12l2 2 4-4"/></svg>',
        megaphone: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v-2a4 4 0 0 0-4-4H9l4-7"/><path d="M8 9v10c0 .55.45 1 1 1h2"/><line x1="3" y1="9" x2="3" y2="14"/></svg>',
        palette: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="8" r="1.5"/><circle cx="8" cy="12" r="1.5"/><circle cx="16" cy="12" r="1.5"/><circle cx="12" cy="16" r="1.5"/></svg>',
        smartphone: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
        check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        x: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
        trash: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
        refresh: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',
        copy: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
        save: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
        upload: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
        download: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
        externalLink: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
        file: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
        star: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        sparkle: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z"/></svg>',
        building: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>',
        clock: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
        play: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
        auto: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/></svg>',
        competitor: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        globe: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
        compare: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>',
        chat: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
        send: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    };
    
    // ============================================
    // STANDARDIZED STYLES
    // ============================================
    const STYLES = {
        // Section headers
        sectionHeader: 'margin: 0 0 var(--cav-space-4, 16px); color: var(--cav-text-primary, #fff); font-size: 1.125rem; font-weight: 600; font-family: var(--cav-font-sans, Inter, sans-serif); display: flex; align-items: center; gap: 8px;',
        // Card containers
        card: 'background: var(--cav-bg-card, #1a1a1a); border-radius: var(--cav-radius, 12px); padding: var(--cav-space-5, 20px); border: 1px solid var(--cav-glass-border, rgba(255,255,255,0.08));',
        cardElevated: 'background: var(--cav-bg-elevated, #252525); border-radius: var(--cav-radius-sm, 10px); padding: var(--cav-space-4, 16px); border: 1px solid var(--cav-glass-border, rgba(255,255,255,0.08));',
        // Text styles
        textPrimary: 'color: var(--cav-text-primary, #fff); font-family: var(--cav-font-sans, Inter, sans-serif);',
        textSecondary: 'color: var(--cav-text-secondary, #a1a1aa); font-family: var(--cav-font-sans, Inter, sans-serif);',
        textMuted: 'color: var(--cav-text-muted, #71717a); font-family: var(--cav-font-sans, Inter, sans-serif);',
        textLabel: 'color: var(--cav-text-muted, #71717a); font-size: 0.6875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; font-family: var(--cav-font-sans, Inter, sans-serif);',
        // Button base
        btnBase: 'display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 18px; border-radius: var(--cav-radius-sm, 10px); font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; border: none; font-family: var(--cav-font-sans, Inter, sans-serif);',
        btnPrimary: 'background: var(--cav-primary, #ec4899); color: #fff;',
        btnSecondary: 'background: var(--cav-bg-elevated, #252525); border: 1px solid var(--cav-glass-border, rgba(255,255,255,0.08)); color: var(--cav-text-secondary, #a1a1aa);',
        btnGhost: 'background: transparent; color: var(--cav-text-muted, #71717a); padding: 8px 14px;',
        btnDanger: 'background: transparent; border: 1px solid var(--cav-error, #ef4444); color: var(--cav-error, #ef4444);',
        btnSmall: 'padding: 6px 12px; font-size: 0.8125rem;',
        // Input styles
        input: 'width: 100%; padding: 12px 16px; background: var(--cav-bg-elevated, #252525); border: 1px solid var(--cav-glass-border, rgba(255,255,255,0.08)); border-radius: var(--cav-radius-sm, 10px); color: var(--cav-text-primary, #fff); font-size: 0.9375rem; font-family: var(--cav-font-sans, Inter, sans-serif); outline: none; transition: border-color 0.2s ease;',
        select: 'padding: 10px 14px; background: var(--cav-bg-elevated, #252525); border: 1px solid var(--cav-glass-border, rgba(255,255,255,0.08)); border-radius: var(--cav-radius-sm, 10px); color: var(--cav-text-primary, #fff); font-size: 0.875rem; font-family: var(--cav-font-sans, Inter, sans-serif); cursor: pointer;',
        // Badge styles
        badge: 'display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 9999px; font-size: 0.6875rem; font-weight: 600; font-family: var(--cav-font-sans, Inter, sans-serif);',
        badgeSuccess: 'background: var(--cav-success-bg, rgba(16,185,129,0.12)); color: var(--cav-success, #10b981);',
        badgeWarning: 'background: var(--cav-warning-bg, rgba(245,158,11,0.12)); color: var(--cav-warning, #f59e0b);',
        badgeError: 'background: var(--cav-error-bg, rgba(239,68,68,0.12)); color: var(--cav-error, #ef4444);',
        badgeInfo: 'background: var(--cav-info-bg, rgba(59,130,246,0.12)); color: var(--cav-info, #3b82f6);',
        badgePrimary: 'background: var(--cav-primary-soft, rgba(236,72,153,0.12)); color: var(--cav-primary, #ec4899);',
        // Grid
        grid: 'display: grid; gap: var(--cav-space-4, 16px);',
        gridAuto: 'grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));',
        // Flexbox
        flexRow: 'display: flex; align-items: center; gap: var(--cav-space-3, 12px);',
        flexCol: 'display: flex; flex-direction: column; gap: var(--cav-space-3, 12px);',
        flexBetween: 'display: flex; align-items: center; justify-content: space-between; gap: var(--cav-space-3, 12px);',
        flexWrap: 'flex-wrap: wrap;',
        // Score display
        scoreLarge: 'font-size: 2rem; font-weight: 700; font-family: var(--cav-font-sans, Inter, sans-serif);',
        scoreGood: 'color: var(--cav-success, #10b981);',
        scoreMedium: 'color: var(--cav-warning, #f59e0b);',
        scoreLow: 'color: var(--cav-error, #ef4444);',
    };

    // ============================================
    // LEARN MODULE CLASS
    // ============================================

    class LearnModule {
        constructor() {
            this.currentView = 'url-analyzer';
            this.swipeFile = this.loadSwipeFile();
            this.benchmarks = this.loadBenchmarks();
            this.bestPractices = this.loadBestPractices();
            this.urlAnalysisHistory = this.loadURLHistory();
            this.detectedCompetitors = this.loadDetectedCompetitors();
            this.comparisonImage = null; // Selected image for creative comparison
            this.icons = ICONS; // Reference to icons
            this.styles = STYLES; // Reference to styles
            
            console.log(`[Learn] Initialized v${LEARN_VERSION} - ${this.swipeFile.length} swipes, ${this.benchmarks.length} benchmarks, ${this.urlAnalysisHistory.length} URL analyses`);
        }
        
        // Load URL analysis history
        loadURLHistory() {
            try {
                return JSON.parse(localStorage.getItem(STORAGE_KEYS.URL_HISTORY) || '[]');
            } catch {
                return [];
            }
        }
        
        // Save URL analysis to history
        saveURLHistory(result) {
            this.urlAnalysisHistory.unshift(result);
            // Keep last 100 analyses
            if (this.urlAnalysisHistory.length > 100) {
                this.urlAnalysisHistory = this.urlAnalysisHistory.slice(0, 100);
            }
            localStorage.setItem(STORAGE_KEYS.URL_HISTORY, JSON.stringify(this.urlAnalysisHistory));
        }
        
        // Load detected competitors
        loadDetectedCompetitors() {
            try {
                return JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPETITORS) || '[]');
            } catch {
                return [];
            }
        }
        
        // Save detected competitor
        saveDetectedCompetitor(competitor) {
            if (!competitor) return null;
            
            // Check if already exists - with null safety
            const competitorName = competitor.name || '';
            const competitorDomain = competitor.domain || '';
            
            const existing = this.detectedCompetitors.find(c => {
                const cName = c?.name || '';
                const cDomain = c?.domain || '';
                return (cDomain && competitorDomain && cDomain === competitorDomain) || 
                       (cName && competitorName && cName.toLowerCase() === competitorName.toLowerCase());
            });
            
            if (!existing && competitorName) {
                this.detectedCompetitors.push({
                    ...competitor,
                    id: `comp_${Date.now()}`,
                    detectedAt: new Date().toISOString()
                });
                localStorage.setItem(STORAGE_KEYS.COMPETITORS, JSON.stringify(this.detectedCompetitors));
                
                // Also add to CRM as a company if available
                this.addCompetitorToCRM(competitor);
            }
            return competitor;
        }
        
        // Add competitor to CRM
        async addCompetitorToCRM(competitor) {
            if (!window.cavCRM) return;
            
            try {
                // Check if company already exists
                const existingCompanies = window.cavCRM.getAllCompanies({ search: competitor.name });
                if (existingCompanies.length > 0) {
                    console.log(`[Learn] Company ${competitor.name} already exists in CRM`);
                    return existingCompanies[0];
                }
                
                // Create new company
                const company = window.cavCRM.createCompany({
                    name: competitor.name,
                    domain: competitor.domain,
                    website: competitor.website || `https://${competitor.domain}`,
                    industry: competitor.industry || 'Unknown',
                    type: 'competitor',
                    description: `Auto-detected competitor from URL analysis`,
                    tags: ['competitor', 'auto-detected'],
                    source: 'url_analyzer'
                });
                
                console.log(`[Learn] Created CRM company for competitor: ${competitor.name}`);
                return company;
            } catch (e) {
                console.warn('[Learn] Failed to add competitor to CRM:', e);
            }
        }

        // ============================================
        // URL ANALYZER
        // ============================================

        async analyzeURL(url, comparisonImage = null) {
            const result = {
                id: `url_${Date.now()}`,
                url,
                urlType: this.detectURLType(url),
                analyzedAt: new Date().toISOString(),
                creativeSummary: null,
                hookAnalysis: null,
                messageArchitecture: null,
                visualStrategy: null,
                ctaEvaluation: null,
                platformOptimization: null,
                performanceIndicators: null,
                takeaways: [],
                savedToSwipeFile: false,
                comparisonResult: null,
                // NEW: Additional extracted data
                extractedBenchmarks: [],
                detectedCompetitor: null,
                linkedCompanyId: null,
                sources: []
            };

            try {
                const urlObj = new URL(url);
                const domain = urlObj.hostname.replace('www.', '');
                
                // Use SearchAPI to get page content and additional context
                if (window.AIOrchestrator?.isProviderAvailable('searchapi')) {
                    // Get page info
                    const searchResult = await window.AIOrchestrator.callSearchAPI(`site:${domain}`, {
                        num: 3
                    });
                    result.pageSnippet = searchResult.results?.[0]?.snippet;
                    result.sources = searchResult.results?.map(r => ({
                        title: r.title,
                        url: r.link,
                        snippet: r.snippet
                    })) || [];
                    
                    // Search for company/brand info
                    const brandSearch = await window.AIOrchestrator.callSearchAPI(`${domain} company about`, {
                        num: 3
                    });
                    result.brandSources = brandSearch.results?.map(r => ({
                        title: r.title,
                        url: r.link,
                        snippet: r.snippet
                    })) || [];
                }

                // Use Claude/Gemini for deep analysis
                const analysis = await this.getEnhancedURLAnalysis(url, result.urlType, result.sources);
                Object.assign(result, analysis);

                // AUTO-DETECT BRAND (NOT competitor - this is the analyzed brand/client)
                if (analysis.detectedBrand && analysis.detectedBrand !== 'unknown') {
                    // This is the BRAND being analyzed - add as CLIENT, not competitor
                    const brand = {
                        name: analysis.detectedBrand,
                        domain: domain,
                        website: `https://${domain}`,
                        industry: analysis.creativeSummary?.industry || analysis.detectedIndustry || 'Unknown',
                        advertisingChannels: analysis.platformOptimization?.detectedChannels || [],
                        messageThemes: analysis.messageArchitecture?.supporting || []
                    };
                    
                    // Save brand as a company/client (NOT competitor)
                    result.detectedBrand = brand;
                    
                    // Link to CRM as CLIENT
                    if (window.cavCRM) {
                        let companyId = null;
                        const companies = window.cavCRM.getAllCompanies({ search: brand.name });
                        
                        if (companies.length > 0) {
                            companyId = companies[0].id;
                        } else {
                            // Create as CLIENT, not competitor
                            const newCompany = window.cavCRM.createCompany({
                                name: brand.name,
                                domain: brand.domain,
                                website: brand.website,
                                industry: brand.industry,
                                type: 'client', // IMPORTANT: Client, not competitor!
                                description: `Auto-detected from URL analysis: ${url}`,
                                tags: ['auto-detected', 'url-analysis']
                            });
                            companyId = newCompany.id;
                            console.log(`[Learn] Created company for brand: ${brand.name}`);
                        }
                        result.linkedCompanyId = companyId;
                    }
                    
                    // NOW auto-fetch actual competitors for this brand
                    result.competitors = await this.autoFetchCompetitors(brand.name, brand.industry);
                }

                // AUTO-EXTRACT BENCHMARKS from the analysis
                if (analysis.performanceIndicators) {
                    await this.extractAndSaveBenchmarks(analysis, domain);
                    result.extractedBenchmarks = analysis.extractedBenchmarks || [];
                }

                // If comparison image is provided, run comparison analysis
                if (comparisonImage) {
                    result.comparisonResult = await this.compareCreatives(result, comparisonImage);
                }

                // AUTO-SAVE to URL history
                this.saveURLHistory(result);
                
                // AUTO-SAVE to swipe file with analysis data
                this.autoSaveToSwipeFile(result);

            } catch (error) {
                console.error('[Learn] URL analysis error:', error);
                result.error = error.message;
            }

            return result;
        }
        
        // AUTO-FETCH COMPETITORS for a brand using AI (3 competitors)
        async autoFetchCompetitors(brandName, industry) {
            if (!brandName || brandName === 'unknown') return [];
            
            console.log(`[Learn] Auto-fetching competitors for ${brandName} in ${industry}`);
            
            const competitors = [];
            
            try {
                // First, use SearchAPI to find competitors
                if (window.AIOrchestrator?.callSearchAPI) {
                    const searchResults = await window.AIOrchestrator.callSearchAPI(
                        `${brandName} competitors ${industry} alternative companies`,
                        { num: 10 }
                    );
                    
                    // Use AI to extract competitors from search results
                    if (searchResults.results?.length > 0 && window.AIOrchestrator?.callAI) {
                        const prompt = `Based on these search results, identify the TOP 3 main competitors of ${brandName} in the ${industry || 'same'} industry.

Search Results:
${searchResults.results.map(r => `- ${r.title}: ${r.snippet}`).join('\n')}

Return ONLY a JSON array with exactly 3 competitors. Each competitor should have:
- name: Company name
- website: Website URL if found
- description: Brief 1-sentence description
- strengths: Array of 2-3 key strengths
- marketPosition: "leader", "challenger", "niche", or "emerging"

Example format:
[{"name":"CompanyA","website":"https://companya.com","description":"Leading provider...","strengths":["Innovation","Price"],"marketPosition":"leader"}]

JSON only, no markdown:`;

                        const aiResponse = await window.AIOrchestrator.callAI(prompt, {
                            model: 'claude',
                            format: 'json'
                        });
                        
                        // Parse competitors from AI response
                        let parsedCompetitors = [];
                        try {
                            const jsonMatch = aiResponse.match(/\[[\s\S]*?\]/);
                            if (jsonMatch) {
                                parsedCompetitors = JSON.parse(jsonMatch[0]);
                            }
                        } catch (e) {
                            console.warn('[Learn] Failed to parse competitor JSON:', e);
                        }
                        
                        // Save each competitor to CRM
                        for (const comp of parsedCompetitors.slice(0, 3)) {
                            const savedCompetitor = this.saveCompetitorToCRM(comp, brandName, industry);
                            if (savedCompetitor) {
                                competitors.push(savedCompetitor);
                            }
                        }
                    }
                }
                
                // Fallback: Use Gemini for competitor detection if SearchAPI unavailable
                if (competitors.length === 0 && window.AIOrchestrator?.callAI) {
                    const fallbackPrompt = `Name the top 3 direct competitors of ${brandName} in the ${industry || 'technology'} industry.

Return ONLY a JSON array with 3 competitors:
[{"name":"Company Name","description":"Brief description","marketPosition":"leader/challenger/niche"}]

JSON only:`;

                    const fallbackResponse = await window.AIOrchestrator.callAI(fallbackPrompt, {
                        model: 'gemini',
                        format: 'json'
                    });
                    
                    try {
                        const jsonMatch = fallbackResponse.match(/\[[\s\S]*?\]/);
                        if (jsonMatch) {
                            const fallbackCompetitors = JSON.parse(jsonMatch[0]);
                            for (const comp of fallbackCompetitors.slice(0, 3)) {
                                const savedCompetitor = this.saveCompetitorToCRM(comp, brandName, industry);
                                if (savedCompetitor) {
                                    competitors.push(savedCompetitor);
                                }
                            }
                        }
                    } catch (e) {
                        console.warn('[Learn] Fallback competitor parsing failed:', e);
                    }
                }
                
                console.log(`[Learn] Found ${competitors.length} competitors for ${brandName}`);
                
            } catch (error) {
                console.error('[Learn] Error fetching competitors:', error);
            }
            
            return competitors;
        }
        
        // Save competitor to CRM (separate from companies!)
        saveCompetitorToCRM(competitor, relatedBrandName, industry) {
            if (!competitor?.name) return null;
            
            try {
                // Use the CRM's competitor management (separate from companies)
                if (window.cavCRM?.createCompetitor) {
                    // Check if competitor already exists
                    const existing = window.cavCRM.getAllCompetitors({ search: competitor.name });
                    if (existing.length > 0) {
                        // Update existing
                        return window.cavCRM.updateCompetitor(existing[0].id, {
                            ...competitor,
                            lastChecked: new Date().toISOString()
                        });
                    }
                    
                    // Create new competitor
                    return window.cavCRM.createCompetitor({
                        name: competitor.name,
                        website: competitor.website || '',
                        industry: industry || competitor.industry || 'Unknown',
                        description: competitor.description || `Competitor of ${relatedBrandName}`,
                        strengths: competitor.strengths || [],
                        marketShare: competitor.marketPosition || '',
                        source: 'ai_detected',
                        notes: `Auto-detected as competitor of ${relatedBrandName}`
                    });
                }
                
                // Fallback: Save to detected competitors storage
                const detected = {
                    id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    name: competitor.name,
                    website: competitor.website || '',
                    industry: industry,
                    description: competitor.description,
                    strengths: competitor.strengths || [],
                    marketPosition: competitor.marketPosition,
                    relatedTo: relatedBrandName,
                    detectedAt: new Date().toISOString(),
                    source: 'ai_detected'
                };
                
                this.saveDetectedCompetitor(detected);
                return detected;
                
            } catch (e) {
                console.warn('[Learn] Failed to save competitor:', e);
                return null;
            }
        }

        // Enhanced URL analysis that extracts more data - with VISUAL analysis for images
        async getEnhancedURLAnalysis(url, urlType, sources = []) {
            const sourcesContext = sources.length > 0 ? 
                `\nRelated search results:\n${sources.map(s => `- ${s.title}: ${s.snippet}`).join('\n')}` : '';
            
            const isImageUrl = urlType === 'image' || url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
            
            const prompt = isImageUrl ? 
            `You are an expert creative strategist and visual analyst. Analyze this image in comprehensive detail for advertising and marketing intelligence.

Provide a THOROUGH analysis covering:

1. **Visual Elements**: Describe everything you see - subjects, objects, colors, composition, typography, logos
2. **Brand Detection**: What company/brand is this from? Look for logos, watermarks, brand colors
3. **Creative Type**: Is this a product shot, lifestyle image, ad creative, social post, infographic?
4. **Message Analysis**: What is the primary message? What emotions does it evoke?
5. **Target Audience**: Who is this creative designed to appeal to?
6. **Visual Quality**: Professional quality assessment (lighting, composition, focus, color grading)
7. **Hook/Attention**: What grabs attention first? Rate the "thumb-stop" potential 0-100
8. **CTA Presence**: Any call-to-action visible? Text overlays?
9. **Platform Fit**: Which platforms would this work best on? (Instagram, Facebook, LinkedIn, etc.)
10. **Strengths**: What works well about this creative?
11. **Improvements**: What could be improved?
12. **Similar Examples**: What style/trend does this follow?

Return ONLY valid JSON with this structure:
{
    "detectedBrand": "Brand Name or unknown",
    "detectedIndustry": "Industry name",
    "visualDescription": "Detailed description of what's in the image",
    "creativeType": "product_shot/lifestyle/ad_creative/social_post/infographic/other",
    "creativeSummary": {
        "product": "Product/service shown",
        "keyMessage": "Main value proposition or message",
        "targetAudience": "Who this is designed for",
        "industry": "Industry",
        "emotionalTone": "Emotions evoked"
    },
    "hookAnalysis": {
        "score": 75,
        "element": "What grabs attention first",
        "effectiveness": "Why it works or doesn't",
        "thumbStopPotential": "high/medium/low"
    },
    "visualStrategy": {
        "colors": ["#hex1", "#hex2", "#hex3"],
        "colorMood": "Warm/Cool/Neutral/Vibrant",
        "imageryApproach": "Lifestyle/Product/Abstract/UGC/Professional",
        "composition": "Layout and composition analysis",
        "typography": "Any text styles observed",
        "qualityScore": 85
    },
    "ctaEvaluation": {
        "present": true,
        "text": "CTA text if visible",
        "type": "hard/soft/engagement/none",
        "clarity": 80,
        "urgency": 60,
        "visibility": "prominent/subtle/none"
    },
    "platformOptimization": {
        "bestPlatforms": ["Instagram", "Facebook"],
        "aspectRatio": "1:1/4:5/16:9/9:16/other",
        "platformScores": {"instagram": 85, "facebook": 80, "linkedin": 70, "tiktok": 60},
        "improvements": ["Suggestion 1", "Suggestion 2"]
    },
    "performanceIndicators": {
        "qualitySignals": ["High production value", "Professional lighting"],
        "weaknesses": ["Low contrast", "Busy composition"],
        "predictedEngagement": "high/medium/low"
    },
    "benchmarkEstimates": {
        "ctr": {"low": 0.5, "expected": 1.2, "high": 2.5},
        "engagementRate": {"low": 1.5, "expected": 3.0, "high": 5.5}
    },
    "strengths": ["Strength 1", "Strength 2", "Strength 3"],
    "improvements": ["Improvement 1", "Improvement 2", "Improvement 3"],
    "takeaways": [
        "Actionable insight 1",
        "Actionable insight 2",
        "Actionable insight 3",
        "Actionable insight 4"
    ]
}`
            : `Analyze this URL for creative intelligence. Extract as much information as possible.

URL: ${url}
URL Type: ${urlType}
${sourcesContext}

Provide comprehensive analysis including:

1. **Brand Detection**: What company/brand is this from? Identify the exact brand name.
2. **Industry**: What industry is this in?
3. **Creative Summary**: Product, key message, target audience
4. **Hook Analysis**: Attention-grabbing elements, score 0-100
5. **Message Architecture**: Primary message, supporting points, proof points
6. **Visual Strategy**: Colors, imagery approach, composition
7. **CTA Evaluation**: Call-to-action presence, clarity (0-100), urgency (0-100)
8. **Platform Optimization**: Detected channels, optimization score
9. **Performance Indicators**: Quality signals, estimated metrics
10. **Key Takeaways**: 3-5 actionable insights
11. **Benchmark Estimates**: CTR range, CPM range, engagement rate range (based on industry/platform)

Return ONLY valid JSON:
{
    "detectedBrand": "Brand Name or unknown",
    "detectedIndustry": "Industry name",
    "creativeSummary": {
        "product": "Product/service",
        "keyMessage": "Main value proposition",
        "targetAudience": "Who this is for",
        "industry": "Industry"
    },
    "hookAnalysis": {
        "score": 75,
        "element": "What grabs attention",
        "effectiveness": "Why it works"
    },
    "messageArchitecture": {
        "primary": "Main message",
        "supporting": ["Point 1", "Point 2"],
        "proofPoints": ["Social proof", "Statistics"]
    },
    "visualStrategy": {
        "colors": ["#hex1", "#hex2"],
        "imageryApproach": "Lifestyle/Product/Abstract",
        "composition": "Layout description"
    },
    "ctaEvaluation": {
        "present": true,
        "text": "CTA text",
        "type": "hard/soft/engagement",
        "clarity": 80,
        "urgency": 60
    },
    "platformOptimization": {
        "detectedChannels": ["Facebook", "Google"],
        "platform": "Primary platform",
        "optimizationScore": 70,
        "improvements": ["Suggestion 1"]
    },
    "performanceIndicators": {
        "qualitySignals": ["High production value"],
        "engagementSignals": ["Active comments"]
    },
    "benchmarkEstimates": {
        "ctr": {"low": 0.5, "expected": 1.2, "high": 2.5},
        "cpm": {"low": 5, "expected": 12, "high": 25},
        "engagementRate": {"low": 1.5, "expected": 3.0, "high": 5.5}
    },
    "takeaways": [
        "Actionable insight 1",
        "Actionable insight 2",
        "Actionable insight 3"
    ]
}`;

            try {
                let result;
                const apiKey = localStorage.getItem('cav_gemini_api_key');
                
                if (apiKey) {
                    // Build request parts
                    const parts = [{ text: prompt }];
                    
                    // For image URLs, fetch and include the actual image for visual analysis
                    if (isImageUrl) {
                        try {
                            console.log('[Learn] Fetching image for visual analysis:', url);
                            const imageResponse = await fetch(url);
                            const blob = await imageResponse.blob();
                            const base64 = await this.blobToBase64(blob);
                            const mimeType = blob.type || 'image/jpeg';
                            
                            parts.push({
                                inline_data: {
                                    mime_type: mimeType,
                                    data: base64.split(',')[1] // Remove data URL prefix
                                }
                            });
                            console.log('[Learn] Image loaded for analysis, size:', blob.size);
                        } catch (imgError) {
                            console.warn('[Learn] Could not fetch image, using text-only analysis:', imgError);
                        }
                    }
                    
                    // Use Gemini for analysis (vision model for images)
                    const response = await fetch(
                        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                contents: [{ parts }],
                                generationConfig: { temperature: 0.3, maxOutputTokens: 4000 }
                            })
                        }
                    );
                    const data = await response.json();
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    result = this.parseJSON(text);
                    
                    // Store thumbnail for swipe file
                    if (isImageUrl) {
                        result.thumbnailData = url;
                    }
                } else if (window.AIOrchestrator?.isProviderAvailable('claude')) {
                    const claudeResult = await window.AIOrchestrator.callClaude(prompt, { temperature: 0.3 });
                    result = this.parseJSON(claudeResult.content);
                }
                
                return result || {};
            } catch (e) {
                console.error('[Learn] Enhanced analysis error:', e);
                return {};
            }
        }
        
        // Helper to convert blob to base64
        blobToBase64(blob) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        }
        
        // Extract benchmarks from analysis and save them
        async extractAndSaveBenchmarks(analysis, sourceDomain) {
            const benchmarks = [];
            
            if (analysis.benchmarkEstimates) {
                const be = analysis.benchmarkEstimates;
                const platform = analysis.platformOptimization?.platform || 'all';
                const industry = analysis.detectedIndustry || analysis.creativeSummary?.industry || null;
                
                // Save CTR benchmark
                if (be.ctr) {
                    const ctrBench = {
                        id: `bench_ctr_${Date.now()}`,
                        metric: 'ctr',
                        platform: platform,
                        industry: industry,
                        value: be.ctr,
                        source: `URL Analysis: ${sourceDomain}`,
                        sourceUrl: analysis.url,
                        lastUpdated: new Date().toISOString()
                    };
                    this.saveBenchmark(ctrBench);
                    benchmarks.push(ctrBench);
                }
                
                // Save CPM benchmark
                if (be.cpm) {
                    const cpmBench = {
                        id: `bench_cpm_${Date.now()}`,
                        metric: 'cpm',
                        platform: platform,
                        industry: industry,
                        value: be.cpm,
                        source: `URL Analysis: ${sourceDomain}`,
                        sourceUrl: analysis.url,
                        lastUpdated: new Date().toISOString()
                    };
                    this.saveBenchmark(cpmBench);
                    benchmarks.push(cpmBench);
                }
                
                // Save engagement rate benchmark
                if (be.engagementRate) {
                    const engBench = {
                        id: `bench_engagement_${Date.now()}`,
                        metric: 'engagement_rate',
                        platform: platform,
                        industry: industry,
                        value: be.engagementRate,
                        source: `URL Analysis: ${sourceDomain}`,
                        sourceUrl: analysis.url,
                        lastUpdated: new Date().toISOString()
                    };
                    this.saveBenchmark(engBench);
                    benchmarks.push(engBench);
                }
            }
            
            analysis.extractedBenchmarks = benchmarks;
            console.log(`[Learn] Extracted ${benchmarks.length} benchmarks from URL analysis`);
        }
        
        // Auto-save URL analysis to swipe file AND to CRM company
        autoSaveToSwipeFile(result) {
            if (result.error) return; // Don't save failed analyses
            
            // Handle data URLs - they ARE the image/thumbnail
            const isDataUrl = result.url?.startsWith('data:');
            const thumbnailData = isDataUrl ? result.url : (result.thumbnailData || null);
            
            // For display URL, truncate data URLs
            let displayUrl = result.url;
            let hostname = 'data-url';
            if (!isDataUrl) {
                try {
                    hostname = new URL(result.url).hostname;
                } catch (e) {
                    hostname = 'unknown';
                }
            }
            
            const swipeEntry = {
                id: result.id,
                source: 'url_analyzer',
                sourceUrl: isDataUrl ? `Data URL (${result.urlType})` : result.url,
                originalUrl: result.url, // Keep original for re-analysis
                urlType: result.urlType,
                title: result.creativeSummary?.keyMessage?.substring(0, 50) || `Analysis: ${hostname}`,
                thumbnailData: thumbnailData,
                analysis: {
                    creativeSummary: result.creativeSummary,
                    hookAnalysis: result.hookAnalysis,
                    ctaEvaluation: result.ctaEvaluation,
                    visualStrategy: result.visualStrategy,
                    platformOptimization: result.platformOptimization,
                    strengths: result.strengths,
                    improvements: result.improvements,
                    takeaways: result.takeaways,
                    visualDescription: result.visualDescription
                },
                tags: [
                    result.urlType,
                    result.detectedBrand?.name || result.detectedBrand,
                    result.detectedIndustry,
                    ...(result.platformOptimization?.detectedChannels || result.platformOptimization?.bestPlatforms || [])
                ].filter(Boolean),
                collections: ['Auto-Saved URL Analyses'],
                notes: result.creativeSummary?.keyMessage || result.takeaways?.[0] || '',
                savedAt: new Date().toISOString(),
                savedBy: 'auto',
                isCompetitor: !!result.detectedCompetitor,
                competitorId: result.detectedCompetitor?.id,
                linkedCompanyId: result.linkedCompanyId,
                sources: result.sources
            };
            
            // Save to swipe file
            this.swipeFile.unshift(swipeEntry);
            localStorage.setItem(STORAGE_KEYS.SWIPE_FILE, JSON.stringify(this.swipeFile));
            
            // Also save to unified storage for cross-device sync
            if (window.UnifiedStorage) {
                window.UnifiedStorage.saveSwipeFile(swipeEntry).catch(e => console.warn('[Learn] Unified storage save failed:', e));
                window.UnifiedStorage.saveURLAnalysis(result).catch(e => console.warn('[Learn] URL analysis save failed:', e));
            }
            
            result.savedToSwipeFile = true;
            console.log(`[Learn] Auto-saved URL analysis to swipe file: ${result.url}`);
            
            // ALSO SAVE TO CRM COMPANY if linked
            if (result.linkedCompanyId && window.cavCRM) {
                try {
                    // Save swipe file entry to company
                    window.cavCRM.addSwipeFileToCompany(result.linkedCompanyId, swipeEntry);
                    
                    // Save URL analysis to company
                    window.cavCRM.addURLAnalysisToCompany(result.linkedCompanyId, {
                        id: result.id,
                        url: result.url,
                        urlType: result.urlType,
                        analyzedAt: result.analyzedAt,
                        creativeSummary: result.creativeSummary,
                        hookAnalysis: result.hookAnalysis,
                        ctaEvaluation: result.ctaEvaluation,
                        performanceIndicators: result.performanceIndicators,
                        takeaways: result.takeaways
                    });
                    
                    // Save benchmarks to company if any
                    if (result.extractedBenchmarks?.length > 0) {
                        for (const benchmark of result.extractedBenchmarks) {
                            window.cavCRM.addBenchmarkToCompany(result.linkedCompanyId, benchmark);
                        }
                    }
                    
                    // Save best practices extracted from analysis
                    if (result.takeaways?.length > 0) {
                        for (const takeaway of result.takeaways.slice(0, 5)) {
                            window.cavCRM.addBestPracticeToCompany(result.linkedCompanyId, {
                                category: result.urlType || 'General',
                                practice: takeaway,
                                source: result.url,
                                extractedAt: new Date().toISOString()
                            });
                        }
                    }
                    
                    // Save detected competitors to the company
                    if (result.competitors?.length > 0) {
                        for (const competitor of result.competitors) {
                            window.cavCRM.addCompetitorToCompany(result.linkedCompanyId, competitor);
                        }
                    }
                    
                    console.log(`[Learn] Saved URL analysis data to CRM company: ${result.linkedCompanyId}`);
                } catch (e) {
                    console.warn('[Learn] Failed to save to CRM company:', e);
                }
            }
        }
        
        // Compare user's creative against URL analysis
        async compareCreatives(urlAnalysis, userImage) {
            const comparison = {
                overallScore: 0,
                strengths: [],
                improvements: [],
                detailedComparison: {}
            };
            
            try {
                const imageData = userImage.thumbnail_url || userImage.dataUrl || '';
                if (!imageData) return comparison;
                
                // Use Gemini or Claude for visual comparison
                const apiKey = localStorage.getItem('cav_gemini_api_key');
                if (apiKey && imageData.startsWith('data:')) {
                    const cleanBase64 = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
                    const mimeType = imageData.match(/^data:(image\/[a-z]+);base64,/)?.[1] || 'image/jpeg';
                    
                    const prompt = `You are a creative director comparing a user's creative asset against competitor insights.

URL Analysis Summary:
- Product/Service: ${urlAnalysis.creativeSummary?.product || 'Unknown'}
- Key Message: ${urlAnalysis.creativeSummary?.keyMessage || 'Unknown'}
- Target Audience: ${urlAnalysis.creativeSummary?.targetAudience || 'Unknown'}
- Hook Score: ${urlAnalysis.hookAnalysis?.score || 'N/A'}
- Visual Strategy: ${urlAnalysis.visualStrategy?.imageryApproach || 'Unknown'}
- CTA: ${urlAnalysis.ctaEvaluation?.type || 'Unknown'}

Analyze the uploaded image and compare it against the competitor creative insights:

1. **Overall Score (0-100)**: How well does this creative compete?
2. **Strengths**: What does this creative do well compared to competitor insights?
3. **Improvements**: What could be improved based on competitor best practices?
4. **Detailed Comparison**:
   - Hook Comparison: How does the attention-grabbing element compare?
   - Message Clarity: Is the value proposition clear?
   - Visual Quality: Professional quality comparison
   - CTA Effectiveness: Is there a clear call to action?
   - Brand Presence: Is branding clear?

Return ONLY valid JSON:
{
    "overallScore": 75,
    "strengths": ["Strength 1", "Strength 2"],
    "improvements": ["Improvement 1", "Improvement 2"],
    "detailedComparison": {
        "hookComparison": { "score": 70, "notes": "Explanation" },
        "messageClarity": { "score": 80, "notes": "Explanation" },
        "visualQuality": { "score": 75, "notes": "Explanation" },
        "ctaEffectiveness": { "score": 60, "notes": "Explanation" },
        "brandPresence": { "score": 85, "notes": "Explanation" }
    }
}`;
                    
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
                                generationConfig: { temperature: 0.3, maxOutputTokens: 2000 }
                            })
                        }
                    );
                    
                    const data = await response.json();
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    const jsonMatch = text.match(/\{[\s\S]*\}/);
                    
                    if (jsonMatch) {
                        const parsed = JSON.parse(jsonMatch[0]);
                        Object.assign(comparison, parsed);
                    }
                }
            } catch (error) {
                console.error('[Learn] Comparison error:', error);
                comparison.error = error.message;
            }
            
            return comparison;
        }
        
        // Update comparison preview in UI
        updateComparisonPreview(container, asset) {
            const previewContainer = container.querySelector('#selected-comparison-image');
            const previewImg = container.querySelector('#comparison-image-preview');
            const previewName = container.querySelector('#comparison-image-name');
            
            if (previewContainer && previewImg && previewName) {
                const thumbSrc = asset.thumbnail_url || asset.dataUrl || asset.video_url || '';
                previewImg.src = thumbSrc;
                previewName.textContent = `${asset.filename} (${asset.width || '?'}×${asset.height || '?'})`;
                previewContainer.style.display = 'flex';
            }
        }
        
        // Render transcript UI (memories.ai style)
        renderTranscriptUI(transcript) {
            if (!transcript || !transcript.segments?.length) {
                return '<div style="color: #94a3b8; text-align: center; padding: 20px;">No transcript available for this video.</div>';
            }
            
            // Check if these are visual captions (not audio transcript)
            const isVisualCaption = transcript.source === 'visual_caption_generated' || 
                                   transcript.source === 'ai_visual_caption' ||
                                   transcript.segments[0]?.type === 'visual_caption';
            
            const headerIcon = isVisualCaption ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>' : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';
            const headerColor = isVisualCaption ? '#60a5fa' : '#a78bfa';
            const sourceLabel = isVisualCaption ? 'AI Visual Descriptions' : (transcript.source || 'auto');
            
            return `
                ${isVisualCaption ? `
                <div style="margin-bottom: 12px; padding: 12px; background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px; color: #60a5fa; font-size: 13px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                        <strong>Visual Captions Generated</strong>
                    </div>
                    <p style="margin: 8px 0 0; color: #94a3b8; font-size: 12px;">
                        This video doesn't have audio captions available. These are AI-generated descriptions of what's happening visually in each scene.
                    </p>
                </div>
                ` : ''}
                <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="color: ${headerColor}; font-size: 13px; font-weight: 600;">
                        ${headerIcon} ${transcript.segments.length} segments • ${sourceLabel}
                    </div>
                    <button id="vi-copy-transcript" style="padding: 6px 12px; background: rgba(139, 92, 246, 0.2); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 6px; color: #a78bfa; cursor: pointer; font-size: 12px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy All</button>
                </div>
                <div style="max-height: 400px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
                    ${transcript.segments.map(seg => `
                        <div style="padding: 12px; background: rgba(0,0,0,0.2); border-radius: 8px; cursor: pointer; transition: all 0.2s; ${seg.type === 'visual_caption' ? 'border-left: 3px solid #60a5fa;' : ''}" onmouseover="this.style.background='rgba(139, 92, 246, 0.15)'" onmouseout="this.style.background='rgba(0,0,0,0.2)'">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                                <span style="color: ${seg.type === 'visual_caption' ? '#60a5fa' : '#a78bfa'}; font-size: 11px; font-family: monospace; background: ${seg.type === 'visual_caption' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(139, 92, 246, 0.2)'}; padding: 2px 6px; border-radius: 4px;">● ${seg.startFormatted || this.formatTimestamp(seg.start)} - ${seg.endFormatted || this.formatTimestamp(seg.end)}</span>
                                ${seg.type === 'visual_caption' ? '<span style="color: #60a5fa; font-size: 10px; background: rgba(59, 130, 246, 0.2); padding: 2px 6px; border-radius: 4px;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:2px;vertical-align:middle;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> Visual</span>' : ''}
                            </div>
                            <p style="color: #e2e8f0; margin: 0; font-size: 14px; line-height: 1.5;">${seg.text}</p>
                            ${seg.onScreenText ? `<p style="color: #4ade80; margin: 6px 0 0; font-size: 12px;">🔤 On-screen: "${seg.onScreenText}"</p>` : ''}
                        </div>
                    `).join('')}
                </div>
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <div style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">${isVisualCaption ? 'Full Visual Description:' : 'Full Transcript:'}</div>
                    <div style="color: #e2e8f0; font-size: 13px; line-height: 1.6; max-height: 150px; overflow-y: auto; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 8px;">${transcript.fullText || transcript.segments.map(s => s.text).join(' ')}</div>
                </div>
            `;
        }
        
        // Render merged timeline UI
        renderTimelineUI(timeline) {
            if (!timeline || !timeline.length) {
                return '<div style="color: #94a3b8; text-align: center; padding: 20px;">No timeline data available.</div>';
            }
            
            return `
                <div style="margin-bottom: 12px; color: #a78bfa; font-size: 13px; font-weight: 600;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;vertical-align:middle;"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg> ${timeline.length} timeline segments (transcript + visual analysis merged)
                </div>
                <div style="max-height: 500px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px;">
                    ${timeline.map(entry => `
                        <div style="padding: 16px; background: rgba(0,0,0,0.2); border-radius: 12px; border-left: 3px solid ${entry.transcript ? '#a78bfa' : '#60a5fa'};">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                                <span style="color: #a78bfa; font-size: 11px; font-family: monospace; background: rgba(139, 92, 246, 0.2); padding: 2px 8px; border-radius: 4px;">${entry.startFormatted} - ${entry.endFormatted}</span>
                                ${entry.sceneIndex ? `<span style="color: #60a5fa; font-size: 10px; background: rgba(59, 130, 246, 0.2); padding: 2px 6px; border-radius: 4px;">Scene ${entry.sceneIndex}</span>` : ''}
                            </div>
                            ${entry.transcript ? `<p style="color: #e2e8f0; margin: 0 0 8px; font-size: 14px; line-height: 1.5;">"${entry.transcript}"</p>` : ''}
                            ${entry.vision?.sceneDescription ? `<p style="color: #94a3b8; margin: 0; font-size: 13px; line-height: 1.4;"><span style="color: #60a5fa;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> Visual:</span> ${entry.vision.sceneDescription}</p>` : ''}
                            ${entry.vision?.textOnScreen?.length > 0 ? `<p style="color: #fbbf24; margin: 4px 0 0; font-size: 12px;"><span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> On-screen text:</span> ${entry.vision.textOnScreen.join(', ')}</p>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        // Format timestamp helper
        formatTimestamp(seconds) {
            if (!seconds && seconds !== 0) return '00:00';
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        
        // Render simple transcript (no timestamps)
        renderSimpleTranscript(fullText) {
            return `
                <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="color: #a78bfa; font-size: 13px; font-weight: 600;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;vertical-align:middle;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> Full Transcript</div>
                    <button id="vi-copy-transcript" style="padding: 6px 12px; background: rgba(139, 92, 246, 0.2); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 6px; color: #a78bfa; cursor: pointer; font-size: 12px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy</button>
                </div>
                <div style="max-height: 400px; overflow-y: auto; padding: 16px; background: rgba(0,0,0,0.2); border-radius: 8px;">
                    <p style="color: #e2e8f0; margin: 0; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${fullText}</p>
                </div>
            `;
        }
        
        // Render video summary when no transcript available
        renderVideoSummaryUI(analysis) {
            const metadata = analysis.metadata || {};
            const summary = analysis.executiveSummary || {};
            const message = analysis.messageAnalysis || {};
            const serverData = analysis.serverExtraction || {};
            
            // Check what data we got from server
            const hasServerMetadata = !!serverData.metadata;
            const hasServerFrames = serverData.frames?.length > 0;
            const hadCaptionError = !serverData.transcript && serverData.success;
            
            return `
                <div style="margin-bottom: 16px;">
                    <div style="color: #fbbf24; font-size: 13px; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        Transcript Not Available
                    </div>
                    <p style="color: #94a3b8; font-size: 13px; margin: 0 0 16px;">
                        ${hadCaptionError ? 
                            'This video doesn\'t have captions/subtitles available, or they couldn\'t be extracted.' : 
                            'Transcript extraction is not available for this video URL.'}
                        <strong style="color: #a78bfa;"> Upload the video directly for full transcript extraction with AI transcription.</strong>
                    </p>
                </div>
                
                <!-- Server extraction status -->
                <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 12px; margin-bottom: 16px;">
                    <div style="color: #64748b; font-size: 11px; font-weight: 600; margin-bottom: 8px;">Server Extraction Status</div>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        <span style="padding: 4px 8px; border-radius: 4px; font-size: 11px; ${hasServerMetadata ? 'background: rgba(34,197,94,0.2); color: #4ade80;' : 'background: rgba(239,68,68,0.2); color: #fca5a5;'}">
                            ${hasServerMetadata ? '✓' : '✗'} Metadata
                        </span>
                        <span style="padding: 4px 8px; border-radius: 4px; font-size: 11px; ${hasServerFrames ? 'background: rgba(34,197,94,0.2); color: #4ade80;' : 'background: rgba(239,68,68,0.2); color: #fca5a5;'}">
                            ${hasServerFrames ? '✓' : '✗'} Frames (${serverData.frames?.length || 0})
                        </span>
                        <span style="padding: 4px 8px; border-radius: 4px; font-size: 11px; background: rgba(239,68,68,0.2); color: #fca5a5;">
                            ✗ Transcript
                        </span>
                    </div>
                </div>
                
                <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 12px; padding: 16px; margin-bottom: 16px;">
                    <div style="color: #a78bfa; font-size: 12px; font-weight: 600; margin-bottom: 12px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;vertical-align:middle;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> Video Summary (AI Generated)</div>
                    
                    ${metadata.title ? `
                    <div style="margin-bottom: 12px;">
                        <div style="color: #64748b; font-size: 11px;">Title</div>
                        <div style="color: #fff; font-size: 15px; font-weight: 500;">${metadata.title}</div>
                    </div>
                    ` : ''}
                    
                    ${metadata.author ? `
                    <div style="margin-bottom: 12px;">
                        <div style="color: #64748b; font-size: 11px;">Creator</div>
                        <div style="color: #e2e8f0; font-size: 14px;">${metadata.author}</div>
                    </div>
                    ` : ''}
                    
                    ${message.core_message ? `
                    <div style="margin-bottom: 12px;">
                        <div style="color: #64748b; font-size: 11px;">Core Message (AI Inferred)</div>
                        <div style="color: #e2e8f0; font-size: 14px;">${message.core_message}</div>
                    </div>
                    ` : ''}
                    
                    ${summary.verdict ? `
                    <div style="margin-bottom: 12px;">
                        <div style="color: #64748b; font-size: 11px;">AI Verdict</div>
                        <div style="color: #e2e8f0; font-size: 14px;">${summary.verdict}</div>
                    </div>
                    ` : ''}
                    
                    ${message.key_talking_points?.length > 0 ? `
                    <div>
                        <div style="color: #64748b; font-size: 11px; margin-bottom: 8px;">Key Talking Points</div>
                        ${message.key_talking_points.map(point => `
                            <div style="color: #e2e8f0; font-size: 13px; margin-bottom: 4px; padding-left: 12px; border-left: 2px solid rgba(139, 92, 246, 0.5);">• ${point}</div>
                        `).join('')}
                    </div>
                    ` : ''}
                </div>
                
                <div style="text-align: center; padding: 16px; background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2); border-radius: 8px;">
                    <div style="color: #60a5fa; font-size: 13px; font-weight: 600; margin-bottom: 8px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;vertical-align:middle;"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2v1"/><path d="M12 22V12"/><path d="M12 12a4 4 0 1 0 0-8"/></svg> Want Full Transcript?</div>
                    <div style="color: #94a3b8; font-size: 12px; margin-bottom: 12px;">Upload the video file directly for complete AI transcription with timestamps.</div>
                    <div style="color: #64748b; font-size: 11px;">Or check if the video has captions enabled on the platform.</div>
                </div>
            `;
        }

        detectURLType(url) {
            const urlLower = url.toLowerCase();
            
            // Handle data URLs (base64 images)
            if (urlLower.startsWith('data:image/')) {
                return 'image';
            }
            if (urlLower.startsWith('data:video/')) {
                return 'video';
            }
            
            if (urlLower.includes('facebook.com/ads/library') || urlLower.includes('fb.com/ads')) {
                return 'ad_library';
            }
            if (urlLower.includes('ads.google.com/transparency') || urlLower.includes('adstransparency')) {
                return 'ad_library';
            }
            if (urlLower.includes('tiktok.com/business/creativecenter')) {
                return 'ad_library';
            }
            if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
                return 'video';
            }
            if (urlLower.includes('instagram.com') || urlLower.includes('twitter.com') || urlLower.includes('linkedin.com/posts')) {
                return 'social_post';
            }
            if (urlLower.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)) {
                return 'image';
            }
            if (urlLower.match(/\.(mp4|mov|webm)(\?.*)?$/i)) {
                return 'video';
            }
            
            return 'landing_page';
        }

        async getURLAnalysis(url, urlType) {
            const typePrompts = {
                ad_library: `Analyze this ad library URL and the creative it contains:`,
                landing_page: `Analyze this landing page for conversion optimization:`,
                social_post: `Analyze this social media post for engagement potential:`,
                video: `Analyze this video content for advertising effectiveness:`,
                image: `Analyze this image for creative effectiveness:`
            };

            const prompt = `${typePrompts[urlType] || 'Analyze this URL:'}

URL: ${url}

Provide a comprehensive creative intelligence analysis including:

1. **Creative Summary**: What is being advertised? Key message? Target audience?
2. **Hook Analysis**: What's the attention-grabbing element? Rating 0-100
3. **Message Architecture**: Primary message, supporting points, proof points
4. **Visual Strategy**: Colors, imagery approach, composition decisions
5. **CTA Evaluation**: Call-to-action presence, clarity, urgency
6. **Platform Optimization**: How well optimized for its platform?
7. **Performance Indicators**: Signs of success (engagement, professional quality)
8. **Key Takeaways**: 3-5 actionable insights

Return ONLY valid JSON:
{
    "creativeSummary": {
        "product": "Product/service being advertised",
        "keyMessage": "Main value proposition",
        "targetAudience": "Who this is for"
    },
    "hookAnalysis": {
        "score": 75,
        "element": "What grabs attention",
        "effectiveness": "Why it works or doesn't"
    },
    "messageArchitecture": {
        "primary": "Main message",
        "supporting": ["Point 1", "Point 2"],
        "proofPoints": ["Social proof", "Statistics"]
    },
    "visualStrategy": {
        "colors": ["#hex1", "#hex2"],
        "imageryApproach": "Lifestyle/Product/Abstract",
        "composition": "Layout description"
    },
    "ctaEvaluation": {
        "present": true,
        "text": "CTA text",
        "clarity": 80,
        "urgency": 60
    },
    "platformOptimization": {
        "platform": "Detected platform",
        "optimizationScore": 70,
        "improvements": ["Suggestion 1"]
    },
    "performanceIndicators": {
        "qualitySignals": ["High production value"],
        "engagementSignals": ["Comments enabled"]
    },
    "takeaways": [
        "Actionable insight 1",
        "Actionable insight 2",
        "Actionable insight 3"
    ]
}`;

            const result = await window.AIOrchestrator.callClaude(prompt, { temperature: 0.3 });
            return this.parseJSON(result.content) || {};
        }

        // ============================================
        // COMPETITOR AD ANALYZER
        // ============================================

        async analyzeCompetitorAds(competitorId) {
            const competitor = window.CAVSettings?.manager?.settings?.competitors?.find(c => c.id === competitorId);
            if (!competitor) {
                throw new Error('Competitor not found');
            }

            const results = {
                competitorId,
                competitorName: competitor.name,
                analyzedAt: new Date().toISOString(),
                adsFound: [],
                insights: null
            };

            try {
                // Search for competitor ads using SearchAPI
                if (window.AIOrchestrator?.isProviderAvailable('searchapi')) {
                    // Search Google Ads Transparency
                    const googleAds = await window.AIOrchestrator.callSearchAPI(
                        `${competitor.name} advertising site:adstransparency.google.com`,
                        { num: 5 }
                    );
                    
                    // Search for competitor on social
                    const socialSearch = await window.AIOrchestrator.callSearchAPI(
                        `${competitor.name} ${competitor.domain} advertisement`,
                        { num: 10 }
                    );

                    results.searchResults = {
                        googleAds: googleAds.results || [],
                        socialAds: socialSearch.results || []
                    };

                    // Get AI insights
                    if (window.AIOrchestrator.isProviderAvailable('claude')) {
                        results.insights = await this.getCompetitorInsights(competitor, results.searchResults);
                    }
                }

            } catch (error) {
                console.error('[Learn] Competitor analysis error:', error);
                results.error = error.message;
            }

            return results;
        }

        async getCompetitorInsights(competitor, searchResults) {
            const prompt = `Analyze these search results about competitor advertising:

Competitor: ${competitor.name} (${competitor.domain})

Search Results:
${JSON.stringify(searchResults, null, 2)}

Provide competitive intelligence insights:

1. **Advertising Channels**: Where are they advertising?
2. **Message Themes**: What themes/messages do they emphasize?
3. **Creative Approaches**: What creative styles do they use?
4. **Targeting Signals**: Who are they targeting?
5. **Frequency/Activity**: How active is their advertising?
6. **Opportunities**: What gaps can you exploit?

Return ONLY valid JSON:
{
    "advertisingChannels": ["Google", "Facebook", "LinkedIn"],
    "messageThemes": ["Value proposition 1", "Value proposition 2"],
    "creativeApproaches": ["UGC style", "Professional production"],
    "targetingSignals": ["B2B", "Enterprise", "Decision makers"],
    "activityLevel": "high/medium/low",
    "opportunities": ["Gap 1 you can exploit", "Angle they're missing"],
    "recommendations": ["How to differentiate", "What to test against them"]
}`;

            const result = await window.AIOrchestrator.callClaude(prompt, { temperature: 0.4 });
            return this.parseJSON(result.content);
        }

        // ============================================
        // BEST PRACTICES LIBRARY
        // ============================================

        async updateBestPractices() {
            if (!window.AIOrchestrator?.isProviderAvailable('searchapi')) {
                return { error: 'SearchAPI required for best practices updates' };
            }

            const queries = [
                { query: 'paid media creative best practices 2024', category: 'creative_frameworks' },
                { query: 'Facebook ads creative guidelines 2024', category: 'platform_guidelines', platform: 'Meta' },
                { query: 'TikTok advertising best practices', category: 'platform_guidelines', platform: 'TikTok' },
                { query: 'Google Ads creative specifications', category: 'platform_guidelines', platform: 'Google Ads' },
                { query: 'video ad hook techniques', category: 'creative_frameworks' },
                { query: 'social media ad benchmarks 2024', category: 'industry_benchmarks' }
            ];

            const updates = [];

            for (const q of queries) {
                try {
                    const results = await window.AIOrchestrator.callSearchAPI(q.query, { num: 5 });
                    
                    for (const result of (results.results || []).slice(0, 3)) {
                        const practice = window.CAVDataModels?.BestPractice?.create({
                            category: q.category,
                            platform: q.platform || 'all',
                            title: result.title,
                            content: result.snippet,
                            source: result.displayed_link || result.link,
                            sourceUrl: result.link,
                            publishedAt: result.date || null,
                            tags: [q.category, q.platform].filter(Boolean),
                            relevanceScore: 70
                        });
                        
                        this.saveBestPractice(practice);
                        updates.push(practice);
                    }
                } catch (e) {
                    console.warn(`[Learn] Best practices query failed: ${q.query}`, e);
                }
            }

            return { updated: updates.length, practices: updates };
        }

        loadBestPractices() {
            try {
                return JSON.parse(localStorage.getItem('cav_best_practices') || '[]');
            } catch {
                return [];
            }
        }

        saveBestPractice(practice) {
            const practices = this.loadBestPractices();
            const existing = practices.findIndex(p => p.sourceUrl === practice.sourceUrl);
            if (existing >= 0) {
                practices[existing] = { ...practices[existing], ...practice, lastVerified: new Date().toISOString() };
            } else {
                practices.push(practice);
            }
            localStorage.setItem('cav_best_practices', JSON.stringify(practices));
            this.bestPractices = practices;
        }

        getBestPractices(filters = {}) {
            let practices = [...this.bestPractices];
            
            if (filters.category) {
                practices = practices.filter(p => p.category === filters.category);
            }
            if (filters.platform) {
                practices = practices.filter(p => p.platform === filters.platform || p.platform === 'all');
            }
            if (filters.search) {
                const search = filters.search.toLowerCase();
                practices = practices.filter(p => 
                    p.title?.toLowerCase().includes(search) || 
                    p.content?.toLowerCase().includes(search)
                );
            }
            
            return practices.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
        }

        // ============================================
        // PERFORMANCE BENCHMARKS DATABASE
        // ============================================

        async updateBenchmarks() {
            if (!window.AIOrchestrator?.isProviderAvailable('searchapi')) {
                return { error: 'SearchAPI required for benchmark updates' };
            }

            const benchmarkQueries = [
                { metric: 'ctr', query: 'average CTR Facebook ads 2024' },
                { metric: 'ctr', query: 'average CTR Google Display ads 2024' },
                { metric: 'cpm', query: 'average CPM social media advertising 2024' },
                { metric: 'engagement_rate', query: 'average engagement rate Instagram 2024' },
                { metric: 'view_through_rate', query: 'video completion rate benchmarks 2024' }
            ];

            const updates = [];

            for (const bq of benchmarkQueries) {
                try {
                    const results = await window.AIOrchestrator.callSearchAPI(bq.query, { num: 3 });
                    
                    // Use Claude to extract benchmark numbers
                    if (window.AIOrchestrator.isProviderAvailable('claude') && results.results?.length) {
                        const extracted = await this.extractBenchmarkFromSearch(bq.metric, results.results);
                        if (extracted) {
                            this.saveBenchmark(extracted);
                            updates.push(extracted);
                        }
                    }
                } catch (e) {
                    console.warn(`[Learn] Benchmark query failed: ${bq.query}`, e);
                }
            }

            return { updated: updates.length, benchmarks: updates };
        }

        async extractBenchmarkFromSearch(metric, searchResults) {
            const prompt = `Extract benchmark data for "${metric}" from these search results:

${searchResults.map(r => `Title: ${r.title}\nSnippet: ${r.snippet}`).join('\n\n')}

Return ONLY valid JSON with numeric values:
{
    "metric": "${metric}",
    "platform": "all or specific platform",
    "value": {
        "low": 0.5,
        "median": 1.0,
        "high": 2.0
    },
    "source": "where this data came from",
    "confidence": "high/medium/low"
}

If no clear benchmark data found, return null.`;

            const result = await window.AIOrchestrator.callClaude(prompt, { temperature: 0.1 });
            const parsed = this.parseJSON(result.content);
            
            if (parsed && parsed.value) {
                return window.CAVDataModels?.Benchmark?.create({
                    metric: parsed.metric,
                    platform: parsed.platform || 'all',
                    value: parsed.value,
                    source: 'searchapi',
                    lastUpdated: new Date().toISOString()
                });
            }
            return null;
        }

        loadBenchmarks() {
            try {
                return JSON.parse(localStorage.getItem('cav_benchmarks') || '[]');
            } catch {
                return [];
            }
        }

        saveBenchmark(benchmark) {
            const benchmarks = this.loadBenchmarks();
            const existing = benchmarks.findIndex(b => b.metric === benchmark.metric && b.platform === benchmark.platform);
            if (existing >= 0) {
                benchmarks[existing] = benchmark;
            } else {
                benchmarks.push(benchmark);
            }
            localStorage.setItem('cav_benchmarks', JSON.stringify(benchmarks));
            this.benchmarks = benchmarks;
        }

        getBenchmark(metric, platform = 'all') {
            return this.benchmarks.find(b => b.metric === metric && (b.platform === platform || b.platform === 'all'));
        }

        // ============================================
        // SWIPE FILE SYSTEM
        // ============================================

        loadSwipeFile() {
            try {
                return JSON.parse(localStorage.getItem('cav_swipe_file') || '[]');
            } catch {
                return [];
            }
        }

        saveToSwipeFile(entry) {
            const swipeEntry = window.CAVDataModels?.SwipeFileEntry?.create(entry) || {
                id: `swipe_${Date.now()}`,
                ...entry,
                savedAt: new Date().toISOString()
            };

            this.swipeFile.push(swipeEntry);
            localStorage.setItem('cav_swipe_file', JSON.stringify(this.swipeFile));
            
            return swipeEntry;
        }

        updateSwipeEntry(id, updates) {
            const index = this.swipeFile.findIndex(e => e.id === id);
            if (index >= 0) {
                this.swipeFile[index] = { ...this.swipeFile[index], ...updates };
                localStorage.setItem('cav_swipe_file', JSON.stringify(this.swipeFile));
                return this.swipeFile[index];
            }
            return null;
        }

        deleteSwipeEntry(id) {
            this.swipeFile = this.swipeFile.filter(e => e.id !== id);
            localStorage.setItem('cav_swipe_file', JSON.stringify(this.swipeFile));
        }

        getSwipeFile(filters = {}) {
            let entries = [...this.swipeFile];
            
            if (filters.tags?.length) {
                entries = entries.filter(e => filters.tags.some(t => e.tags?.includes(t)));
            }
            if (filters.collection) {
                entries = entries.filter(e => e.collections?.includes(filters.collection));
            }
            if (filters.search) {
                const search = filters.search.toLowerCase();
                entries = entries.filter(e => 
                    e.notes?.toLowerCase().includes(search) ||
                    e.sourceUrl?.toLowerCase().includes(search)
                );
            }
            if (filters.isCompetitor !== undefined) {
                entries = entries.filter(e => e.isCompetitor === filters.isCompetitor);
            }
            
            return entries.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
        }

        getSwipeCollections() {
            const collections = new Set();
            this.swipeFile.forEach(e => {
                (e.collections || []).forEach(c => collections.add(c));
            });
            return Array.from(collections);
        }

        getSwipeTags() {
            const tags = new Map();
            this.swipeFile.forEach(e => {
                (e.tags || []).forEach(t => tags.set(t, (tags.get(t) || 0) + 1));
            });
            return Array.from(tags.entries()).sort((a, b) => b[1] - a[1]);
        }

        // ============================================
        // LANDING PAGE SYNC CHECK
        // ============================================

        async checkLandingPageSync(asset, landingPageUrl) {
            const syncCheck = {
                assetId: asset.id,
                landingPageUrl,
                syncScore: 0,
                headlineMatch: { adText: null, lpText: null, match: false },
                visualContinuity: { score: 0, issues: [] },
                offerConsistency: { adOffer: null, lpOffer: null, match: false },
                ctaAlignment: { adCta: null, lpCta: null, match: false },
                keywordRelevance: { keywords: [], present: [] },
                trustSignals: { adSignals: [], lpSignals: [], overlap: [] },
                recommendations: [],
                analyzedAt: new Date().toISOString()
            };

            try {
                if (!window.AIOrchestrator?.isProviderAvailable('claude')) {
                    throw new Error('Claude required for landing page sync analysis');
                }

                // Get landing page data via SearchAPI
                let lpData = null;
                if (window.AIOrchestrator.isProviderAvailable('searchapi')) {
                    const searchResult = await window.AIOrchestrator.callSearchAPI(`site:${landingPageUrl}`, { num: 1 });
                    lpData = searchResult.results?.[0];
                }

                const prompt = `Analyze message sync between an ad creative and its landing page.

Ad Creative Details:
- Filename: ${asset.filename}
- Type: ${asset.type}
- Dimensions: ${asset.width}×${asset.height}

Landing Page URL: ${landingPageUrl}
${lpData ? `Landing Page Snippet: ${lpData.snippet}` : ''}

Check for alignment on:
1. Headline/Message Match - Does the ad message continue on LP?
2. Visual Continuity - Would colors/style feel connected?
3. Offer Consistency - Same offer/promotion in both?
4. CTA Alignment - Do CTAs match and make sense?
5. Keyword Relevance - Key terms present in both?
6. Trust Signals - Consistent credibility elements?

Return ONLY valid JSON:
{
    "syncScore": 75,
    "headlineMatch": {
        "adText": "Assumed ad headline",
        "lpText": "Landing page headline",
        "match": true
    },
    "visualContinuity": {
        "score": 70,
        "issues": ["Color scheme may differ"]
    },
    "offerConsistency": {
        "adOffer": "20% off",
        "lpOffer": "20% off first order",
        "match": true
    },
    "ctaAlignment": {
        "adCta": "Shop Now",
        "lpCta": "Add to Cart",
        "match": false
    },
    "keywordRelevance": {
        "keywords": ["keyword1", "keyword2"],
        "present": ["keyword1"]
    },
    "trustSignals": {
        "adSignals": ["Free shipping"],
        "lpSignals": ["Free shipping", "Money back guarantee"],
        "overlap": ["Free shipping"]
    },
    "recommendations": [
        "Match CTA text between ad and LP",
        "Add trust signals from LP to ad"
    ]
}`;

                const result = await window.AIOrchestrator.callClaude(prompt, { temperature: 0.2 });
                Object.assign(syncCheck, this.parseJSON(result.content) || {});

            } catch (error) {
                console.error('[Learn] Landing page sync error:', error);
                syncCheck.error = error.message;
            }

            return syncCheck;
        }

        // ============================================
        // UI RENDERING
        // ============================================

        render(container) {
            this.container = container;
            
            // Get stats for action cards
            const swipeCount = this.swipeFile?.length || 0;
            const benchmarkCount = this.benchmarks?.length || 0;
            const urlHistoryCount = this.urlAnalysisHistory?.length || 0;
            const competitorCount = this.detectedCompetitors?.length || 0;
            
            container.innerHTML = `
                <div class="cav-learn-page">
                    <!-- Action Cards - Library Style -->
                    <div class="cav-action-cards">
                        <div class="cav-action-card" data-view="url-analyzer" data-tooltip="Analyze any URL for creative insights">
                            <div class="cav-action-card-icon"><svg class="cav-icon" style="width:32px;height:32px;"><use href="#icon-link"/></svg></div>
                            <h3 class="cav-action-card-title">Image & Creative Analyzer</h3>
                            <p class="cav-action-card-description">Analyze images & creatives</p>
                        </div>
                        <div class="cav-action-card" data-view="swipe-file" data-tooltip="Browse your saved creative examples">
                            <div class="cav-action-card-icon"><svg class="cav-icon" style="width:32px;height:32px;"><use href="#icon-library"/></svg></div>
                            <h3 class="cav-action-card-title">Swipe File</h3>
                            <p class="cav-action-card-description">${swipeCount} saved examples</p>
                        </div>
                        <div class="cav-action-card" data-view="benchmarks" data-tooltip="View industry benchmarks">
                            <div class="cav-action-card-icon"><svg class="cav-icon" style="width:32px;height:32px;"><use href="#icon-analyze"/></svg></div>
                            <h3 class="cav-action-card-title">Benchmarks</h3>
                            <p class="cav-action-card-description">${benchmarkCount} data points</p>
                        </div>
                        <div class="cav-action-card" data-view="competitors" data-tooltip="Track competitor insights">
                            <div class="cav-action-card-icon"><svg class="cav-icon" style="width:32px;height:32px;"><use href="#icon-eye"/></svg></div>
                            <h3 class="cav-action-card-title">Competitors</h3>
                            <p class="cav-action-card-description">${competitorCount} tracked</p>
                        </div>
                    </div>
                    
                    <!-- Quick Stats Pills -->
                    <div class="cav-section-header">
                        <div>
                            <h3 class="cav-section-title">Knowledge Base</h3>
                            <p class="cav-section-subtitle">Your competitive intelligence hub</p>
                        </div>
                    </div>
                    <div class="cav-quick-actions">
                        <button class="cav-quick-pill" data-view="url-analyzer" data-tooltip="View recent URL analyses">
                            <svg class="cav-icon cav-quick-pill-icon purple"><use href="#icon-link"/></svg>
                            <span>${urlHistoryCount} URL Analyses</span>
                        </button>
                        <button class="cav-quick-pill" data-view="swipe-file" data-tooltip="Browse saved creatives">
                            <svg class="cav-icon cav-quick-pill-icon blue"><use href="#icon-library"/></svg>
                            <span>${swipeCount} Swipe Examples</span>
                        </button>
                        <button class="cav-quick-pill" data-view="best-practices" data-tooltip="View best practices">
                            <svg class="cav-icon cav-quick-pill-icon green"><use href="#icon-check"/></svg>
                            <span>Best Practices</span>
                        </button>
                    </div>
                    
                    <!-- Tabs - Module style -->
                    <div class="cav-module-tabs">
                        <button class="cav-module-tab ${this.currentView === 'url-analyzer' ? 'active' : ''}" data-view="url-analyzer" data-tooltip="Analyze URLs for creative insights">
                            <svg class="cav-icon"><use href="#icon-link"/></svg> Creative Analyzer
                        </button>
                        <button class="cav-module-tab ${this.currentView === 'swipe-file' ? 'active' : ''}" data-view="swipe-file" data-tooltip="Browse saved creative examples">
                            <svg class="cav-icon"><use href="#icon-library"/></svg> Swipe File
                        </button>
                        <button class="cav-module-tab ${this.currentView === 'best-practices' ? 'active' : ''}" data-view="best-practices" data-tooltip="Learn from best practices">
                            <svg class="cav-icon"><use href="#icon-check"/></svg> Best Practices
                        </button>
                        <button class="cav-module-tab ${this.currentView === 'benchmarks' ? 'active' : ''}" data-view="benchmarks" data-tooltip="View industry benchmarks">
                            <svg class="cav-icon"><use href="#icon-analyze"/></svg> Benchmarks
                        </button>
                        <button class="cav-module-tab ${this.currentView === 'competitors' ? 'active' : ''}" data-view="competitors" data-tooltip="Track competitor insights">
                            <svg class="cav-icon"><use href="#icon-eye"/></svg> Competitors
                        </button>
                    </div>
                    
                    <div class="cav-learn-content">
                        ${this.renderCurrentView()}
                    </div>
                </div>
            `;

            this.attachEventHandlers(container);
        }

        renderCurrentView() {
            switch (this.currentView) {
                case 'url-analyzer': return this.renderURLAnalyzer();
                case 'swipe-file': return this.renderSwipeFile();
                case 'best-practices': return this.renderBestPractices();
                case 'benchmarks': return this.renderBenchmarks();
                case 'competitors': return this.renderCompetitors();
                default: return this.renderURLAnalyzer();
            }
        }

        renderURLAnalyzer() {
            const videoHistory = window.VideoAnalyzer?.analysisHistory || [];
            
            return `
                <div class="cav-url-analyzer">
                    <div class="cav-url-input-section">
                        <h2><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:8px;vertical-align:middle;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>Image & Creative Analyzer</h2>
                        <p>Paste an image URL or landing page to get detailed AI-powered creative analysis</p>
                        <div class="cav-url-input-group">
                            <input type="url" id="url-input" placeholder="https://example.com/ad or Facebook Ad Library URL..." class="cav-url-input">
                            <button class="cav-btn cav-btn-primary" id="analyze-url">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>Analyze
                            </button>
                        </div>
                        <div class="cav-url-types">
                            <span>Supported:</span>
                            <span class="cav-url-type">Facebook Ad Library</span>
                            <span class="cav-url-type">Google Ads Transparency</span>
                            <span class="cav-url-type">Landing Pages</span>
                            <span class="cav-url-type">Social Posts</span>
                            <span class="cav-url-type">Direct Image/Video URLs</span>
                        </div>
                    </div>
                    
                    <!-- Enhanced Video Analysis Section -->
                    <div class="cav-video-analysis-section" style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 24px; margin-top: 20px;">
                        <h3 style="color: #a78bfa; margin: 0 0 8px; display: flex; align-items: center; gap: 8px;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                            Advanced Video Creative Intelligence
                        </h3>
                        <p style="color: #94a3b8; margin: 0 0 16px; font-size: 14px;">Multi-model deep analysis with real industry benchmarks, strategic insights, and ad copy generation</p>
                        
                        <!-- Campaign Context Inputs -->
                        <div style="background: rgba(0,0,0,0.2); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                                <span style="color: #a78bfa; font-size: 13px; font-weight: 600;">Campaign Context (Improves Analysis Accuracy)</span>
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                                <div>
                                    <label style="display: block; color: var(--cav-text-muted, #94a3b8); font-size: 0.6875rem; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Campaign Objective</label>
                                    <select id="video-campaign-objective" style="width: 100%; background: var(--cav-bg-elevated, #252525); border: 1px solid var(--cav-glass-border, rgba(255,255,255,0.08)); border-radius: var(--cav-radius-sm, 8px); color: var(--cav-text-primary, #fff); padding: 10px 12px; font-size: 0.875rem; font-family: inherit;">
                                        <option value="">Select objective...</option>
                                        <option value="awareness">Brand Awareness</option>
                                        <option value="consideration">Consideration</option>
                                        <option value="conversion">Conversion/Sales</option>
                                        <option value="retention">Retention/Engagement</option>
                                        <option value="app_install">App Install</option>
                                        <option value="lead_gen">Lead Generation</option>
                                    </select>
                                </div>
                                <div>
                                    <label style="display: block; color: var(--cav-text-muted, #94a3b8); font-size: 0.6875rem; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Target Platform</label>
                                    <select id="video-target-platform" style="width: 100%; background: var(--cav-bg-elevated, #252525); border: 1px solid var(--cav-glass-border, rgba(255,255,255,0.08)); border-radius: var(--cav-radius-sm, 8px); color: var(--cav-text-primary, #fff); padding: 10px 12px; font-size: 0.875rem; font-family: inherit;">
                                        <option value="">Select platform...</option>
                                        <option value="tiktok">TikTok</option>
                                        <option value="youtube_shorts">YouTube Shorts</option>
                                        <option value="youtube_instream">YouTube In-Stream</option>
                                        <option value="meta_reels">Meta Reels</option>
                                        <option value="meta_feed">Meta Feed</option>
                                        <option value="meta_stories">Meta Stories</option>
                                        <option value="linkedin">LinkedIn</option>
                                        <option value="x_twitter">X (Twitter)</option>
                                        <option value="connected_tv">Connected TV</option>
                                        <option value="multi_platform">Multi-Platform</option>
                                    </select>
                                </div>
                                <div>
                                    <label style="display: block; color: var(--cav-text-muted, #94a3b8); font-size: 0.6875rem; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Industry/Vertical</label>
                                    <select id="video-industry" style="width: 100%; background: var(--cav-bg-elevated, #252525); border: 1px solid var(--cav-glass-border, rgba(255,255,255,0.08)); border-radius: var(--cav-radius-sm, 8px); color: var(--cav-text-primary, #fff); padding: 10px 12px; font-size: 0.875rem; font-family: inherit;">
                                        <option value="">Select industry...</option>
                                        <option value="ecommerce_dtc">E-commerce/DTC</option>
                                        <option value="saas_tech">SaaS/Tech</option>
                                        <option value="finance">Finance/FinTech</option>
                                        <option value="healthcare">Healthcare</option>
                                        <option value="beauty_skincare">Beauty/Skincare</option>
                                        <option value="fitness_wellness">Fitness/Wellness</option>
                                        <option value="food_beverage">Food & Beverage</option>
                                        <option value="travel">Travel/Hospitality</option>
                                        <option value="automotive">Automotive</option>
                                        <option value="real_estate">Real Estate</option>
                                        <option value="education">Education</option>
                                        <option value="entertainment">Entertainment</option>
                                        <option value="gaming">Gaming</option>
                                        <option value="fashion_apparel">Fashion/Apparel</option>
                                        <option value="b2b_services">B2B Services</option>
                                        <option value="nonprofit">Non-profit</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label style="display: block; color: #94a3b8; font-size: 11px; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Target Audience</label>
                                    <input type="text" id="video-target-audience" placeholder="e.g., Women 25-45, busy professionals..." style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #e2e8f0; padding: 10px 12px; font-size: 13px; box-sizing: border-box;">
                                </div>
                            </div>
                            <div style="margin-top: 12px;">
                                <label style="display: block; color: #94a3b8; font-size: 11px; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Competitor Video URL (Optional - for comparison)</label>
                                <input type="url" id="video-competitor-url" placeholder="Paste competitor video URL for side-by-side analysis..." style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #e2e8f0; padding: 10px 12px; font-size: 13px; box-sizing: border-box;">
                            </div>
                        </div>
                        
                        <!-- AI Model Selector -->
                        <div id="video-model-selector" style="margin-bottom: 12px;"></div>
                        
                        <!-- Multi-Model Analysis Toggle -->
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding: 10px 14px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px;">
                            <input type="checkbox" id="video-multi-model" checked style="accent-color: #22c55e; width: 18px; height: 18px;">
                            <div style="flex: 1;">
                                <span style="color: #4ade80; font-size: 13px; font-weight: 600;">🧠 Multi-Model Deep Analysis</span>
                                <span style="color: #86efac; font-size: 11px; display: block;">Gemini reads video → GPT-5.2/Claude adds strategic depth with real research</span>
                            </div>
                        </div>
                        
                        <div class="cav-url-input-group" style="margin-bottom: 16px;">
                            <input type="url" id="video-url-input" placeholder="Paste YouTube, TikTok, Instagram, or any video URL..." class="cav-url-input" style="flex: 1;">
                            <button class="cav-btn" id="analyze-video-btn" style="background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); border: none; padding: 12px 24px;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;vertical-align:middle;"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                Deep Analyze Video
                            </button>
                        </div>
                        
                        <!-- OR Upload Video -->
                        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                            <div style="flex: 1; height: 1px; background: rgba(255,255,255,0.1);"></div>
                            <span style="color: #64748b; font-size: 12px; font-weight: 500;">OR</span>
                            <div style="flex: 1; height: 1px; background: rgba(255,255,255,0.1);"></div>
                        </div>
                        
                        <div id="video-upload-zone" style="border: 2px dashed rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 24px; text-align: center; cursor: pointer; transition: all 0.2s; background: rgba(139, 92, 246, 0.05);" 
                             onmouseover="this.style.borderColor='rgba(139, 92, 246, 0.6)';this.style.background='rgba(139, 92, 246, 0.1)';" 
                             onmouseout="this.style.borderColor='rgba(139, 92, 246, 0.3)';this.style.background='rgba(139, 92, 246, 0.05)';">
                            <input type="file" id="video-file-input" accept="video/*" style="display: none;">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="1.5" style="margin-bottom: 12px;">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="17 8 12 3 7 8"/>
                                <line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                            <div style="color: #a78bfa; font-weight: 500; margin-bottom: 4px;">📤 Upload Video for Full Analysis</div>
                            <div style="color: #64748b; font-size: 12px;">Drop file or click to browse • MP4, MOV, WebM • Max 500MB</div>
                            <div style="color: #94a3b8; font-size: 0.6875rem; margin-top: 8px; display: flex; align-items: center; gap: 4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Direct upload guarantees frame extraction & complete analysis</div>
                        </div>
                        
                        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
                            <span style="display: inline-flex; align-items: center; padding: 6px 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; font-size: 12px; color: #fca5a5;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:6px;"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                                YouTube
                            </span>
                            <span style="display: inline-flex; align-items: center; padding: 6px 12px; background: rgba(236, 72, 153, 0.1); border: 1px solid rgba(236, 72, 153, 0.3); border-radius: 6px; font-size: 12px; color: #f9a8d4;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:6px;"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
                                TikTok
                            </span>
                            <span style="display: inline-flex; align-items: center; padding: 6px 12px; background: rgba(232, 121, 249, 0.1); border: 1px solid rgba(232, 121, 249, 0.3); border-radius: 6px; font-size: 12px; color: #e879f9;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:6px;"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/></svg>
                                Instagram
                            </span>
                            <span style="display: inline-flex; align-items: center; padding: 6px 12px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 6px; font-size: 12px; color: #93c5fd;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:6px;"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                                Facebook
                            </span>
                            <span style="display: inline-flex; align-items: center; padding: 6px 12px; background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 6px; font-size: 12px; color: #67e8f9;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:6px;"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
                                Vimeo
                            </span>
                            <span style="display: inline-flex; align-items: center; padding: 6px 12px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 6px; font-size: 12px; color: #86efac;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:6px;"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                                Loom
                            </span>
                            <span style="display: inline-flex; align-items: center; padding: 6px 12px; background: rgba(148, 163, 184, 0.1); border: 1px solid rgba(148, 163, 184, 0.3); border-radius: 6px; font-size: 12px; color: #cbd5e1;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:6px;"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                                MP4/WebM
                            </span>
                        </div>
                        
                        <!-- Analysis Type Selection -->
                        <div style="margin-top: 16px; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
                            <label style="display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                                <input type="checkbox" id="video-analyze-visual" checked style="accent-color: #8b5cf6; width: 16px; height: 16px;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                                <span style="color: #e2e8f0; font-size: 13px; font-weight: 500;">Visual</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                                <input type="checkbox" id="video-analyze-audio" checked style="accent-color: #3b82f6; width: 16px; height: 16px;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                                <span style="color: #e2e8f0; font-size: 13px; font-weight: 500;">Audio</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                                <input type="checkbox" id="video-analyze-content" checked style="accent-color: #22c55e; width: 16px; height: 16px;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                <span style="color: #e2e8f0; font-size: 13px; font-weight: 500;">Content</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: rgba(249, 115, 22, 0.15); border: 1px solid rgba(249, 115, 22, 0.3); border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                                <input type="checkbox" id="video-analyze-sentiment" checked style="accent-color: #f97316; width: 16px; height: 16px;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fb923c" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                                <span style="color: #e2e8f0; font-size: 13px; font-weight: 500;">Sentiment</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: rgba(236, 72, 153, 0.15); border: 1px solid rgba(236, 72, 153, 0.3); border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                                <input type="checkbox" id="video-analyze-experience" checked style="accent-color: #ec4899; width: 16px; height: 16px;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f472b6" stroke-width="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                <span style="color: #e2e8f0; font-size: 13px; font-weight: 500;">Experience</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: rgba(20, 184, 166, 0.15); border: 1px solid rgba(20, 184, 166, 0.3); border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                                <input type="checkbox" id="video-analyze-strategy" checked style="accent-color: #14b8a6; width: 16px; height: 16px;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                                <span style="color: #e2e8f0; font-size: 13px; font-weight: 500;">Strategy</span>
                            </label>
                        </div>
                        
                        <!-- Progress indicator (hidden by default) -->
                        <div id="video-analysis-progress" style="display: none; margin-top: 20px;">
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                                <div class="spinner" style="width: 20px; height: 20px; border: 2px solid rgba(139, 92, 246, 0.3); border-top-color: #8b5cf6; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                                <span id="video-progress-text" style="color: #a78bfa;">Initializing analysis...</span>
                            </div>
                            <div style="background: rgba(0,0,0,0.3); border-radius: 8px; height: 8px; overflow: hidden;">
                                <div id="video-progress-bar" style="height: 100%; background: linear-gradient(90deg, #8b5cf6, #3b82f6); width: 0%; transition: width 0.3s ease;"></div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Video Analysis Results Container -->
                    <div id="video-analysis-results" style="margin-top: 20px;"></div>
                    
                    <!-- Video Intelligence Templates & Chat (memories.ai style) -->
                    <div id="video-intelligence-panel" style="display: none; margin-top: 24px;">
                        <!-- Tab Navigation -->
                        <div style="display: flex; gap: 8px; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px;">
                            <button class="vi-tab-btn active" data-tab="transcript" style="padding: 10px 20px; background: rgba(139, 92, 246, 0.2); border: none; border-radius: 8px 8px 0 0; color: #a78bfa; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 6px;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                Video to Text
                            </button>
                            <button class="vi-tab-btn" data-tab="templates" style="padding: 10px 20px; background: transparent; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px 8px 0 0; color: #94a3b8; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 6px;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                                Templates
                            </button>
                            <button class="vi-tab-btn" data-tab="chat" style="padding: 10px 20px; background: transparent; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px 8px 0 0; color: #94a3b8; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 6px;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                Ask AI
                            </button>
                        </div>
                        
                        <!-- Transcript Tab -->
                        <div class="vi-tab-content" data-content="transcript" style="display: block;">
                            <div id="vi-transcript-container" style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 20px;">
                                <p style="color: #94a3b8; text-align: center;">Analyze a video to see timestamped transcript</p>
                            </div>
                        </div>
                        
                        <!-- Templates Tab -->
                        <div class="vi-tab-content" data-content="templates" style="display: none;">
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;">
                                <button class="vi-template-btn" data-template="storyboard" style="display: flex; align-items: flex-start; gap: 12px; padding: 16px; background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; cursor: pointer; text-align: left; transition: all 0.2s;">
                                    <span style="font-size: 24px;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg></span>
                                    <div>
                                        <div style="color: #e2e8f0; font-weight: 600; font-size: 14px;">Generate Storyboard Script</div>
                                        <div style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Extract production-ready storyboard</div>
                                    </div>
                                </button>
                                <button class="vi-template-btn" data-template="marketingImpact" style="display: flex; align-items: flex-start; gap: 12px; padding: 16px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; cursor: pointer; text-align: left; transition: all 0.2s;">
                                    <span style="font-size: 24px;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></span>
                                    <div>
                                        <div style="color: #e2e8f0; font-weight: 600; font-size: 14px;">Marketing Impact Analysis</div>
                                        <div style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Analyze strategy and potential reach</div>
                                    </div>
                                </button>
                                <button class="vi-template-btn" data-template="keyHighlights" style="display: flex; align-items: flex-start; gap: 12px; padding: 16px; background: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 12px; cursor: pointer; text-align: left; transition: all 0.2s;">
                                    <span style="font-size: 24px;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span>
                                    <div>
                                        <div style="color: #e2e8f0; font-weight: 600; font-size: 14px;">Summarize Key Highlights</div>
                                        <div style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Extract 3 key moments</div>
                                    </div>
                                </button>
                                <button class="vi-template-btn" data-template="targetAudience" style="display: flex; align-items: flex-start; gap: 12px; padding: 16px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px; cursor: pointer; text-align: left; transition: all 0.2s;">
                                    <span style="font-size: 24px;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>
                                    <div>
                                        <div style="color: #e2e8f0; font-weight: 600; font-size: 14px;">Target Audience Profile</div>
                                        <div style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Identify who this video is for</div>
                                    </div>
                                </button>
                                <button class="vi-template-btn" data-template="adCopy" style="display: flex; align-items: flex-start; gap: 12px; padding: 16px; background: rgba(249, 115, 22, 0.1); border: 1px solid rgba(249, 115, 22, 0.3); border-radius: 12px; cursor: pointer; text-align: left; transition: all 0.2s;">
                                    <span style="font-size: 24px;">✍️</span>
                                    <div>
                                        <div style="color: #e2e8f0; font-weight: 600; font-size: 14px;">Generate Ad Copy</div>
                                        <div style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Create ads for all platforms</div>
                                    </div>
                                </button>
                                <button class="vi-template-btn" data-template="competitorAnalysis" style="display: flex; align-items: flex-start; gap: 12px; padding: 16px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; cursor: pointer; text-align: left; transition: all 0.2s;">
                                    <span style="font-size: 24px;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
                                    <div>
                                        <div style="color: #e2e8f0; font-weight: 600; font-size: 14px;">Competitor Breakdown</div>
                                        <div style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Analyze as competitor content</div>
                                    </div>
                                </button>
                                <button class="vi-template-btn" data-template="socialPosts" style="display: flex; align-items: flex-start; gap: 12px; padding: 16px; background: rgba(236, 72, 153, 0.1); border: 1px solid rgba(236, 72, 153, 0.3); border-radius: 12px; cursor: pointer; text-align: left; transition: all 0.2s;">
                                    <span style="font-size: 24px;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg></span>
                                    <div>
                                        <div style="color: #e2e8f0; font-weight: 600; font-size: 14px;">Social Media Posts</div>
                                        <div style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Generate posts for all platforms</div>
                                    </div>
                                </button>
                                <button class="vi-template-btn" data-template="scriptExtract" style="display: flex; align-items: flex-start; gap: 12px; padding: 16px; background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 12px; cursor: pointer; text-align: left; transition: all 0.2s;">
                                    <span style="font-size: 24px;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></span>
                                    <div>
                                        <div style="color: #e2e8f0; font-weight: 600; font-size: 14px;">Extract Script/Dialogue</div>
                                        <div style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Get full spoken script</div>
                                    </div>
                                </button>
                                <button class="vi-template-btn" data-template="thumbnailIdeas" style="display: flex; align-items: flex-start; gap: 12px; padding: 16px; background: rgba(20, 184, 166, 0.1); border: 1px solid rgba(20, 184, 166, 0.3); border-radius: 12px; cursor: pointer; text-align: left; transition: all 0.2s;">
                                    <span style="font-size: 24px;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></span>
                                    <div>
                                        <div style="color: #e2e8f0; font-weight: 600; font-size: 14px;">Thumbnail Ideas</div>
                                        <div style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Generate thumbnail concepts</div>
                                    </div>
                                </button>
                            </div>
                            <div id="vi-template-result" style="margin-top: 20px; display: none;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                    <h4 style="color: #a78bfa; margin: 0; font-size: 14px;" id="vi-template-title">Template Result</h4>
                                    <button id="vi-copy-template" style="padding: 6px 12px; background: rgba(139, 92, 246, 0.2); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 6px; color: #a78bfa; cursor: pointer; font-size: 12px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy</button>
                                </div>
                                <div id="vi-template-output" style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 20px; max-height: 500px; overflow-y: auto; white-space: pre-wrap; font-size: 13px; line-height: 1.6; color: #e2e8f0;"></div>
                            </div>
                        </div>
                        
                        <!-- Chat Tab -->
                        <div class="vi-tab-content" data-content="chat" style="display: none;">
                            <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 20px;">
                                <div id="vi-chat-messages" style="max-height: 400px; overflow-y: auto; margin-bottom: 16px; display: flex; flex-direction: column; gap: 12px;">
                                    <div style="padding: 12px 16px; background: rgba(139, 92, 246, 0.2); border-radius: 12px; color: #e2e8f0; font-size: 14px;">
                                        <strong style="color: #a78bfa;">AI Assistant:</strong> I've analyzed your video. Ask me anything about its content, strategy, or how to improve it!
                                    </div>
                                </div>
                                <div style="display: flex; gap: 12px;">
                                    <input type="text" id="vi-chat-input" placeholder="Ask about the video..." style="flex: 1; padding: 12px 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 14px;">
                                    <button id="vi-chat-send" style="padding: 12px 20px; background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); border: none; border-radius: 8px; color: #fff; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 6px;">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                                        Send
                                    </button>
                                </div>
                                <div style="margin-top: 12px; display: flex; flex-wrap: wrap; gap: 8px;">
                                    <button class="vi-quick-question" style="padding: 6px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; color: #94a3b8; cursor: pointer; font-size: 12px;">What happens in the first 5 seconds?</button>
                                    <button class="vi-quick-question" style="padding: 6px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; color: #94a3b8; cursor: pointer; font-size: 12px;">What's the main message?</button>
                                    <button class="vi-quick-question" style="padding: 6px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; color: #94a3b8; cursor: pointer; font-size: 12px;">How can I improve the hook?</button>
                                    <button class="vi-quick-question" style="padding: 6px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; color: #94a3b8; cursor: pointer; font-size: 12px;">Who is the target audience?</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Recent Video Analyses -->
                    ${videoHistory.length > 0 ? `
                        <div style="margin-top: 24px; background: rgba(255,255,255,0.03); border-radius: 12px; padding: 20px;">
                            <h4 style="color: #e2e8f0; margin: 0 0 16px; display: flex; align-items: center; gap: 8px;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                Recent Video Analyses
                            </h4>
                            <div style="display: flex; flex-direction: column; gap: 12px;">
                                ${videoHistory.slice(0, 5).map(h => `
                                    <div class="video-history-item" data-id="${h.id}" style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 8px; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(139, 92, 246, 0.2)'" onmouseout="this.style.background='rgba(0,0,0,0.2)'">
                                        <div style="display: flex; align-items: center; gap: 12px;">
                                            <span style="padding: 6px 10px; background: rgba(139, 92, 246, 0.3); border-radius: 6px; font-size: 11px; text-transform: capitalize; color: #a78bfa;">${h.platform}</span>
                                            <span style="color: #e2e8f0; font-size: 14px;">${h.url?.substring(0, 50)}...</span>
                                        </div>
                                        <div style="display: flex; align-items: center; gap: 16px;">
                                            <span style="font-size: 24px; font-weight: bold; color: ${h.creativeScore?.overall >= 70 ? '#22c55e' : h.creativeScore?.overall >= 50 ? '#eab308' : '#ef4444'};">${h.creativeScore?.overall || '-'}</span>
                                            <span style="color: #64748b; font-size: 12px;">${new Date(h.timestamp).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Image Comparison Section -->
                    <div class="cav-image-comparison-section">
                        <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:6px;vertical-align:middle;"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>Compare Your Creative</h3>
                        <p>Select an image from your library to compare against the URL's creative insights</p>
                        <div class="cav-comparison-controls">
                            <button class="cav-btn cav-btn-secondary" id="select-comparison-image">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> Select Image from Library
                            </button>
                            <button class="cav-btn cav-btn-secondary" id="upload-comparison-image">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Upload Image
                            </button>
                            <input type="file" id="comparison-image-upload" accept="image/*" style="display:none;">
                        </div>
                        <div id="selected-comparison-image" class="cav-selected-comparison" style="display:none;">
                            <img id="comparison-image-preview" src="" alt="Selected for comparison">
                            <div class="cav-comparison-info">
                                <span id="comparison-image-name">No image selected</span>
                                <button class="cav-btn cav-btn-small cav-btn-danger" id="clear-comparison-image">✕</button>
                            </div>
                        </div>
                    </div>
                    
                    <div id="url-analysis-results"></div>
                </div>
            `;
        }

        renderSwipeFile() {
            const entries = this.getSwipeFile();
            const collections = this.getSwipeCollections();
            const tags = this.getSwipeTags().slice(0, 10);
            const urlHistory = this.urlAnalysisHistory || [];
            
            // Separate auto-saved and manual entries
            const autoSaved = entries.filter(e => e.savedBy === 'auto' || e.source === 'url_analyzer');
            const manualSaved = entries.filter(e => e.savedBy !== 'auto' && e.source !== 'url_analyzer');

            return `
                <div class="cav-swipe-file">
                    <div class="cav-swipe-header">
                        <h2><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:8px;vertical-align:middle;"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>Swipe File</h2>
                        <div class="cav-swipe-stats">
                            <span>${entries.length} saved examples</span>
                            <span class="cav-auto-badge" style="display: inline-flex; align-items: center; gap: 4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/></svg>${autoSaved.length} auto-saved</span>
                        </div>
                    </div>
                    
                    <div class="cav-swipe-filters">
                        <input type="search" id="swipe-search" placeholder="Search swipe file..." class="cav-search-input">
                        <select id="swipe-source-filter">
                            <option value="">All Sources</option>
                            <option value="auto">Auto-Saved from URLs</option>
                            <option value="manual">Manually Saved</option>
                            <option value="competitor">Competitor Examples</option>
                        </select>
                        ${collections.length ? `
                            <select id="swipe-collection">
                                <option value="">All Collections</option>
                                ${collections.map(c => `<option value="${c}">${c}</option>`).join('')}
                            </select>
                        ` : ''}
                    </div>
                    
                    ${tags.length ? `
                        <div class="cav-swipe-tags">
                            ${tags.map(([tag, count]) => `
                                <span class="cav-filter-tag" data-tag="${tag}">${tag} (${count})</span>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <!-- URL Analysis History Section -->
                    ${urlHistory.length > 0 ? `
                        <div class="cav-url-history-section">
                            <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:6px;vertical-align:middle;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>Recent URL Analyses (${urlHistory.length})</h3>
                            <div class="cav-url-history-list">
                                ${urlHistory.slice(0, 5).map(h => `
                                    <div class="cav-url-history-item" data-id="${h.id}">
                                        <div class="cav-url-info">
                                            <span class="cav-url-type-badge">${h.urlType?.replace(/_/g, ' ')}</span>
                                            <a href="${h.url}" target="_blank" class="cav-url-link">${new URL(h.url).hostname}</a>
                                            ${h.detectedCompetitor ? `<span class="cav-competitor-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>${h.detectedCompetitor.name}</span>` : ''}
                                        </div>
                                        <div class="cav-url-meta">
                                            <span>${new Date(h.analyzedAt).toLocaleString()}</span>
                                            ${h.hookAnalysis?.score ? `<span class="cav-hook-score">Hook: ${h.hookAnalysis.score}/100</span>` : ''}
                                        </div>
                                        <div class="cav-url-actions">
                                            <button class="cav-btn cav-btn-small" data-action="view-url-analysis" data-id="${h.id}" style="display: inline-flex; align-items: center; gap: 4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>View</button>
                                            <button class="cav-btn cav-btn-small" data-action="reanalyze-url" data-url="${h.url}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg></button>
                                        </div>
                                    </div>
                                `).join('')}
                                ${urlHistory.length > 5 ? `
                                    <button class="cav-btn cav-btn-link" id="show-all-url-history">
                                        Show all ${urlHistory.length} analyses →
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="cav-swipe-grid">
                        ${entries.length === 0 ? `
                            <div class="cav-empty-state">
                                <p>No saved examples yet</p>
                                <p>Analyze a URL to auto-save to your swipe file, or manually save creative inspiration</p>
                            </div>
                        ` : entries.slice(0, 20).map(e => `
                            <div class="cav-swipe-card ${e.savedBy === 'auto' ? 'cav-auto-saved' : ''} ${e.isCompetitor ? 'cav-competitor-swipe' : ''}" data-id="${e.id}">
                                <div class="cav-swipe-badges">
                                    ${e.savedBy === 'auto' ? '<span class="cav-badge-auto" style="display: inline-flex; align-items: center; gap: 3px;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/></svg>Auto</span>' : ''}
                                    ${e.isCompetitor ? '<span class="cav-badge-competitor" style="display: inline-flex; align-items: center; gap: 3px;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>Competitor</span>' : ''}
                                </div>
                                ${e.thumbnailData ? `<img src="${e.thumbnailData}" alt="Swipe" style="width: 100%; height: 140px; object-fit: cover; border-radius: 8px;">` : 
                                  `<div class="cav-swipe-placeholder" style="width: 100%; height: 140px; background: #252525; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 2.5rem;">
                                      ${e.urlType === 'video' ? '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#71717a" stroke-width="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>' : e.urlType === 'landing_page' ? '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#71717a" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>' : '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#71717a" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>'}
                                   </div>`}
                                <div class="cav-swipe-info">
                                    <span class="cav-swipe-source">${e.source === 'url_analyzer' ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>URL' : e.source}</span>
                                    ${e.sourceUrl && !e.sourceUrl.startsWith('data:') && !e.sourceUrl.startsWith('Data URL') ? `
                                        <a href="${e.sourceUrl}" target="_blank" class="cav-swipe-url" title="${e.sourceUrl}">
                                            ${(() => { try { return new URL(e.sourceUrl).hostname.substring(0, 20); } catch(err) { return 'Link'; } })()}↗️
                                        </a>
                                    ` : e.urlType === 'image' ? '<span style="color: #a78bfa; font-size: 0.6875rem; display: inline-flex; align-items: center; gap: 3px;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>Image</span>' : ''}
                                </div>
                                ${e.analysis?.creativeSummary?.keyMessage ? `
                                    <div class="cav-swipe-message">
                                        ${e.analysis.creativeSummary.keyMessage.substring(0, 60)}...
                                    </div>
                                ` : e.notes ? `
                                    <div class="cav-swipe-message">${e.notes.substring(0, 60)}...</div>
                                ` : ''}
                                ${e.tags?.length ? `
                                    <div class="cav-swipe-tags-mini">
                                        ${e.tags.filter(Boolean).slice(0, 3).map(t => `<span>${t}</span>`).join('')}
                                    </div>
                                ` : ''}
                                <div class="cav-swipe-footer">
                                    <span class="cav-swipe-date">${new Date(e.savedAt).toLocaleDateString()}</span>
                                    <div class="cav-swipe-actions">
                                        <button class="cav-btn cav-btn-small" data-action="view-swipe" data-id="${e.id}" title="View Details" style="display: inline-flex; align-items: center; gap: 4px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
                                        ${e.linkedCompanyId ? `
                                            <button class="cav-btn cav-btn-small" data-action="view-in-crm" data-id="${e.linkedCompanyId}" title="View in CRM"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></button>
                                        ` : ''}
                                        <button class="cav-btn cav-btn-small cav-btn-danger" data-action="delete-swipe" data-id="${e.id}" title="Delete">🗑️</button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        renderBestPractices() {
            const practices = this.getBestPractices();
            const categories = ['platform_guidelines', 'creative_frameworks', 'industry_benchmarks', 'case_studies'];

            return `
                <div class="cav-best-practices">
                    <div class="cav-bp-header">
                        <h2><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:8px;vertical-align:middle;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>Best Practices Library</h2>
                        <button class="cav-btn cav-btn-secondary" id="update-best-practices">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Update from Web
                        </button>
                    </div>
                    
                    <div class="cav-bp-filters">
                        <select id="bp-category">
                            <option value="">All Categories</option>
                            ${categories.map(c => `<option value="${c}">${c.replace(/_/g, ' ')}</option>`).join('')}
                        </select>
                        <select id="bp-platform">
                            <option value="">All Platforms</option>
                            <option value="Meta">Meta</option>
                            <option value="TikTok">TikTok</option>
                            <option value="Google Ads">Google Ads</option>
                            <option value="YouTube">YouTube</option>
                            <option value="LinkedIn">LinkedIn</option>
                        </select>
                        <input type="search" id="bp-search" placeholder="Search..." class="cav-search-input">
                    </div>
                    
                    <div class="cav-bp-list">
                        ${practices.length === 0 ? `
                            <div class="cav-empty-state">
                                <p>No best practices saved yet</p>
                                <p>Click "Update from Web" to fetch latest best practices</p>
                            </div>
                        ` : practices.slice(0, 20).map(p => `
                            <div class="cav-bp-card">
                                <div class="cav-bp-meta">
                                    <span class="cav-bp-category">${p.category?.replace(/_/g, ' ')}</span>
                                    ${p.platform !== 'all' ? `<span class="cav-bp-platform">${p.platform}</span>` : ''}
                                </div>
                                <h3>${p.title}</h3>
                                <p>${p.content}</p>
                                ${p.sourceUrl ? `<a href="${p.sourceUrl}" target="_blank" class="cav-bp-source">Source ↗️</a>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        renderBenchmarks() {
            const benchmarks = this.benchmarks;
            const metrics = ['ctr', 'cpm', 'cpc', 'engagement_rate', 'view_through_rate', 'conversion_rate'];

            // Group benchmarks by metric
            const groupedBenchmarks = {};
            benchmarks.forEach(b => {
                if (!groupedBenchmarks[b.metric]) {
                    groupedBenchmarks[b.metric] = [];
                }
                groupedBenchmarks[b.metric].push(b);
            });

            return `
                <div class="cav-benchmarks">
                    <div class="cav-bench-header">
                        <h2><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:8px;vertical-align:middle;"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>Performance Benchmarks</h2>
                        <div class="cav-bench-actions">
                            <span class="cav-bench-count">${benchmarks.length} benchmarks from ${new Set(benchmarks.map(b => b.source)).size} sources</span>
                            <button class="cav-btn cav-btn-ai" id="save-benchmarks-to-crm">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>Save to CRM
                            </button>
                            <button class="cav-btn cav-btn-secondary" id="update-benchmarks">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Update from Web
                            </button>
                        </div>
                    </div>
                    
                    <div class="cav-bench-grid">
                        ${metrics.map(metric => {
                            const metricBenchmarks = groupedBenchmarks[metric] || [];
                            const latestBench = metricBenchmarks.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))[0];
                            const isMonetary = metric === 'cpm' || metric === 'cpc';
                            const unit = isMonetary ? '$' : '%';
                            
                            return `
                                <div class="cav-bench-card ${latestBench ? '' : 'cav-bench-empty'}">
                                    <h3>${metric.replace(/_/g, ' ').toUpperCase()}</h3>
                                    ${latestBench ? `
                                        <div class="cav-bench-values">
                                            <div class="cav-bench-range">
                                                <span class="low">${isMonetary ? unit : ''}${latestBench.value?.low || latestBench.value?.expected * 0.5 || 0}${!isMonetary ? unit : ''}</span>
                                                <span class="median">${isMonetary ? unit : ''}${latestBench.value?.median || latestBench.value?.expected || 0}${!isMonetary ? unit : ''}</span>
                                                <span class="high">${isMonetary ? unit : ''}${latestBench.value?.high || latestBench.value?.expected * 1.5 || 0}${!isMonetary ? unit : ''}</span>
                                            </div>
                                            <div class="cav-bench-labels">
                                                <span>Low</span><span>Median</span><span>High</span>
                                            </div>
                                        </div>
                                        <div class="cav-bench-meta">
                                            ${latestBench.platform && latestBench.platform !== 'all' ? `<span class="cav-bench-platform" style="display: inline-flex; align-items: center; gap: 4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>${latestBench.platform}</span>` : ''}
                                            ${latestBench.industry ? `<span class="cav-bench-industry">🏭 ${latestBench.industry}</span>` : ''}
                                        </div>
                                        <div class="cav-bench-source">
                                            <span title="${latestBench.sourceUrl || ''}"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>${latestBench.source || 'Unknown'}</span>
                                            <span class="cav-bench-updated">Updated: ${new Date(latestBench.lastUpdated).toLocaleDateString()}</span>
                                        </div>
                                        ${metricBenchmarks.length > 1 ? `
                                            <div class="cav-bench-more">
                                                <button class="cav-btn-link" data-action="show-all-benchmarks" data-metric="${metric}">
                                                    +${metricBenchmarks.length - 1} more sources
                                                </button>
                                            </div>
                                        ` : ''}
                                    ` : `
                                        <p class="cav-no-data">No data available</p>
                                        <p class="cav-no-data-hint">Analyze a URL to auto-extract benchmarks</p>
                                    `}
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <!-- All Sources Section -->
                    <div class="cav-bench-sources-section">
                        <h3>📚 Benchmark Sources</h3>
                        <div class="cav-bench-sources-list">
                            ${[...new Set(benchmarks.map(b => b.source))].map(source => {
                                const sourceBenchmarks = benchmarks.filter(b => b.source === source);
                                return `
                                    <div class="cav-bench-source-item">
                                        <span class="cav-source-name">${source}</span>
                                        <span class="cav-source-count">${sourceBenchmarks.length} benchmarks</span>
                                        <span class="cav-source-date">Last: ${new Date(Math.max(...sourceBenchmarks.map(b => new Date(b.lastUpdated)))).toLocaleDateString()}</span>
                                    </div>
                                `;
                            }).join('')}
                            ${benchmarks.length === 0 ? '<p class="cav-no-data">No benchmark sources yet. Analyze URLs or click "Update from Web".</p>' : ''}
                        </div>
                    </div>
                    
                    <div class="cav-bench-custom">
                        <h3>Add Custom Benchmark</h3>
                        <div class="cav-bench-form">
                            <select id="custom-metric">
                                ${metrics.map(m => `<option value="${m}">${m.replace(/_/g, ' ')}</option>`).join('')}
                            </select>
                            <input type="text" id="custom-source" placeholder="Source (e.g., Company Report)">
                            <input type="number" id="custom-low" placeholder="Low" step="0.01">
                            <input type="number" id="custom-median" placeholder="Median" step="0.01">
                            <input type="number" id="custom-high" placeholder="High" step="0.01">
                            <button class="cav-btn cav-btn-primary" id="save-custom-benchmark">Save</button>
                        </div>
                    </div>
                </div>
            `;
        }

        renderCompetitors() {
            const configuredCompetitors = window.CAVSettings?.manager?.settings?.competitors || [];
            const detectedCompetitors = this.detectedCompetitors || [];
            
            // Get CRM competitors (separate competitor storage, NOT companies)
            const crmCompetitors = window.cavCRM?.getAllCompetitors ? window.cavCRM.getAllCompetitors() : [];
            
            // Also check for companies marked as competitors (for backwards compatibility)
            const crmCompetitorCompanies = window.cavCRM ? window.cavCRM.getAllCompanies({ type: 'competitor' }) : [];
            
            // Merge all competitor sources (dedupe by name)
            const seenNames = new Set();
            const allCompetitors = [];
            
            // Priority: CRM competitors > Detected > Configured
            // Added null checks to prevent "Cannot read properties of undefined (reading 'toLowerCase')"
            for (const c of crmCompetitors) {
                const name = c?.name || c?.company_name || '';
                if (name && !seenNames.has(name.toLowerCase())) {
                    seenNames.add(name.toLowerCase());
                    allCompetitors.push({ ...c, name, source: 'crm_competitor' });
                }
            }
            for (const c of detectedCompetitors) {
                const name = c?.name || c?.company_name || '';
                if (name && !seenNames.has(name.toLowerCase())) {
                    seenNames.add(name.toLowerCase());
                    allCompetitors.push({ ...c, name, source: 'ai_detected' });
                }
            }
            for (const c of crmCompetitorCompanies) {
                const name = c?.name || c?.company_name || '';
                if (name && !seenNames.has(name.toLowerCase())) {
                    seenNames.add(name.toLowerCase());
                    allCompetitors.push({ ...c, name, source: 'crm_company' });
                }
            }
            for (const c of configuredCompetitors) {
                const name = c?.name || c?.company_name || '';
                if (name && !seenNames.has(name.toLowerCase())) {
                    seenNames.add(name.toLowerCase());
                    allCompetitors.push({ ...c, name, source: 'manual' });
                }
            }

            return `
                <div class="cav-competitors">
                    <div class="cav-comp-header">
                        <h2 style="display: flex; align-items: center; gap: 10px;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>Competitor Intelligence</h2>
                        <div class="cav-comp-stats">
                            <span class="cav-comp-count">${allCompetitors.length} competitors tracked</span>
                            ${crmCompetitors.length > 0 || detectedCompetitors.length > 0 ? 
                              `<span class="cav-comp-detected" style="display: inline-flex; align-items: center; gap: 4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/></svg>${crmCompetitors.length + detectedCompetitors.length} auto-detected</span>` : ''}
                        </div>
                        <div class="cav-comp-actions">
                            <button class="cav-btn cav-btn-secondary" id="refresh-competitors-learn">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Refresh from AI
                            </button>
                            <button class="cav-btn cav-btn-primary" id="add-competitor-learn">
                                ➕ Add Competitor
                            </button>
                        </div>
                    </div>
                    
                    <p class="cav-section-hint">
                        Competitors are auto-detected when you analyze URLs. They persist until cleared and can be reloaded anytime.
                        ${allCompetitors.length === 0 ? '<strong>Analyze a URL to auto-detect competitors!</strong>' : ''}
                    </p>
                    
                    <!-- All Competitors Grid (up to 3 shown prominently) -->
                    ${detectedCompetitors.length > 0 ? `
                        <div class="cav-comp-section">
                            <h3 style="display: flex; align-items: center; gap: 8px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/></svg>Auto-Detected from URL Analysis</h3>
                            <p class="cav-section-hint">These competitors were automatically detected when you analyzed URLs</p>
                            <div class="cav-comp-list">
                                ${detectedCompetitors.map(c => `
                                    <div class="cav-comp-card cav-comp-detected" data-id="${c.id}">
                                        <div class="cav-comp-info">
                                            <h3>${c.name}</h3>
                                            <span class="cav-comp-domain">${c.domain}</span>
                                            ${c.industry ? `<span class="cav-comp-industry">🏭 ${c.industry}</span>` : ''}
                                        </div>
                                        <div class="cav-comp-meta">
                                            <span class="cav-detected-date">Detected: ${new Date(c.detectedAt).toLocaleDateString()}</span>
                                            ${c.advertisingChannels?.length ? `
                                                <div class="cav-comp-channels">
                                                    ${c.advertisingChannels.slice(0, 3).map(ch => `<span class="cav-channel-badge">${ch}</span>`).join('')}
                                                </div>
                                            ` : ''}
                                        </div>
                                        <div class="cav-comp-actions">
                                            <button class="cav-btn cav-btn-primary cav-btn-small" data-action="analyze-competitor-url" data-domain="${c.domain}">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>Analyze
                                            </button>
                                            <button class="cav-btn cav-btn-secondary cav-btn-small" data-action="view-in-crm" data-name="${c.name}">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>CRM
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Configured Competitors -->
                    <div class="cav-comp-section">
                        <h3><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;vertical-align:middle;"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> Configured Competitors</h3>
                        <div class="cav-comp-list">
                            ${configuredCompetitors.length === 0 ? `
                                <div class="cav-empty-state">
                                    <p>No competitors manually configured</p>
                                    <p>Analyze URLs to auto-detect competitors or click "Add Competitor"</p>
                                </div>
                            ` : configuredCompetitors.map(c => `
                                <div class="cav-comp-card" data-id="${c.id}">
                                    <div class="cav-comp-info">
                                        <h3>${c.name}</h3>
                                        <span class="cav-comp-domain">${c.domain}</span>
                                        <span class="cav-comp-freq">Monitor: ${c.monitoringFrequency}</span>
                                    </div>
                                    <div class="cav-comp-actions">
                                        <button class="cav-btn cav-btn-primary" data-action="analyze-competitor" data-id="${c.id}">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>Analyze Ads
                                        </button>
                                        ${c.lastChecked ? `<span class="cav-last-check">Last: ${new Date(c.lastChecked).toLocaleDateString()}</span>` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- CRM Companies marked as Competitors -->
                    ${crmCompetitors.length > 0 ? `
                        <div class="cav-comp-section">
                            <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:6px;vertical-align:middle;"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>From CRM</h3>
                            <div class="cav-comp-list">
                                ${crmCompetitors.map(c => `
                                    <div class="cav-comp-card cav-comp-crm" data-id="${c.id}">
                                        <div class="cav-comp-info">
                                            <h3>${c.name}</h3>
                                            <span class="cav-comp-domain">${c.domain || c.website || 'No domain'}</span>
                                            ${c.industry ? `<span class="cav-comp-industry">🏭 ${c.industry}</span>` : ''}
                                        </div>
                                        <div class="cav-comp-actions">
                                            <button class="cav-btn cav-btn-primary cav-btn-small" data-action="analyze-competitor-url" data-domain="${c.domain || new URL(c.website || 'https://example.com').hostname}">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>Analyze
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div id="competitor-analysis-results"></div>
                </div>
            `;
        }

        attachEventHandlers(container) {
            // Action card navigation
            container.querySelectorAll('.cav-action-card[data-view]').forEach(card => {
                card.addEventListener('click', (e) => {
                    const view = card.dataset.view;
                    if (view) {
                        this.currentView = view;
                        this.render(container);
                    }
                });
            });
            
            // Quick pill navigation
            container.querySelectorAll('.cav-quick-pill[data-view]').forEach(pill => {
                pill.addEventListener('click', (e) => {
                    const view = pill.dataset.view;
                    if (view) {
                        this.currentView = view;
                        this.render(container);
                    }
                });
            });
            
            // Module tab navigation (new style)
            container.querySelectorAll('.cav-module-tab[data-view]').forEach(tab => {
                tab.addEventListener('click', (e) => {
                    const view = tab.dataset.view;
                    if (view) {
                        this.currentView = view;
                        this.render(container);
                    }
                });
            });
            
            // Legacy tab navigation (keep for backwards compatibility)
            container.querySelectorAll('.cav-learn-tab').forEach(tab => {
                tab.addEventListener('click', (e) => {
                    this.currentView = e.target.dataset.view;
                    this.render(container);
                });
            });

            // URL Analyzer
            container.querySelector('#analyze-url')?.addEventListener('click', async () => {
                const urlInput = container.querySelector('#url-input');
                const url = urlInput?.value?.trim();
                if (!url) return;

                const resultsDiv = container.querySelector('#url-analysis-results');
                resultsDiv.innerHTML = '<div class="cav-loading" style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 24px; color: var(--cav-text-secondary, #a1a1aa);"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="cav-spin"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>Analyzing...</div>';

                try {
                    const result = await this.analyzeURL(url, this.comparisonImage);
                    resultsDiv.innerHTML = this.renderURLAnalysisResult(result);
                    this.attachURLResultHandlers(container, result);
                } catch (error) {
                    resultsDiv.innerHTML = `<div class="cav-error"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>Analysis failed: ${error.message}</div>`;
                }
            });
            
            // Initialize AI Model Selector for video analysis
            if (window.AIModelSelector) {
                window.AIModelSelector.renderSelector('video-model-selector', (modelId, model) => {
                    console.log('[Learn] Video analysis model changed to:', modelId);
                    if (window.VideoAnalyzer) {
                        window.VideoAnalyzer.setModel(modelId);
                    }
                }, { showDescription: true, compact: false });
            }

            // Advanced Video Analysis
            const analyzeVideoBtn = container.querySelector('#analyze-video-btn');
            if (analyzeVideoBtn) {
                analyzeVideoBtn.addEventListener('click', async () => {
                    console.log('[Learn] Video analyze button clicked');
                    
                    const urlInput = container.querySelector('#video-url-input');
                    const url = urlInput?.value?.trim();
                    
                    if (!url) {
                        alert('Please enter a video URL to analyze');
                        return;
                    }
                    
                    // Set the selected model from the selector
                    const modelSelect = container.querySelector('#video-model-selector-select');
                    if (modelSelect && window.VideoAnalyzer) {
                        window.VideoAnalyzer.setModel(modelSelect.value);
                    }
                    
                    console.log('[Learn] Analyzing video URL:', url);

                    const progressDiv = container.querySelector('#video-analysis-progress');
                    const resultsDiv = container.querySelector('#video-analysis-results');
                    const progressBar = container.querySelector('#video-progress-bar');
                    const progressText = container.querySelector('#video-progress-text');
                    
                    // Check if VideoAnalyzer is loaded
                    if (!window.VideoAnalyzer) {
                        resultsDiv.innerHTML = `<div class="cav-error" style="padding:20px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:12px;color:#fca5a5;">
                            <strong>Error</strong><br>
                            Video Analyzer module not loaded. Please refresh the page.
                        </div>`;
                        return;
                    }
                    
                    // Show progress
                    if (progressDiv) progressDiv.style.display = 'block';
                    if (resultsDiv) resultsDiv.innerHTML = '';
                    analyzeVideoBtn.disabled = true;
                    analyzeVideoBtn.innerHTML = '<span class="spinner" style="display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 1s linear infinite;margin-right:8px;"></span>Analyzing...';
                    
                    // Listen for progress updates
                    const progressHandler = (e) => {
                        if (progressBar) progressBar.style.width = e.detail.percent + '%';
                        if (progressText) progressText.textContent = e.detail.message;
                    };
                    window.addEventListener('videoAnalysisProgress', progressHandler);

                    try {
                        // Gather analysis dimension options
                        const options = {
                            analyzeVisual: container.querySelector('#video-analyze-visual')?.checked ?? true,
                            analyzeAudio: container.querySelector('#video-analyze-audio')?.checked ?? true,
                            analyzeContent: container.querySelector('#video-analyze-content')?.checked ?? true,
                            analyzeSentiment: container.querySelector('#video-analyze-sentiment')?.checked ?? true,
                            analyzeExperience: container.querySelector('#video-analyze-experience')?.checked ?? true,
                            analyzeStrategy: container.querySelector('#video-analyze-strategy')?.checked ?? true,
                            
                            // Campaign context for better analysis
                            campaignContext: {
                                objective: container.querySelector('#video-campaign-objective')?.value || '',
                                targetPlatform: container.querySelector('#video-target-platform')?.value || '',
                                industry: container.querySelector('#video-industry')?.value || '',
                                targetAudience: container.querySelector('#video-target-audience')?.value || '',
                                competitorUrl: container.querySelector('#video-competitor-url')?.value || ''
                            },
                            
                            // Multi-model deep analysis
                            useMultiModel: container.querySelector('#video-multi-model')?.checked ?? true
                        };

                        console.log('[Learn] Running video analysis with options:', options);
                        
                        // STEP 1: Get server-side extraction FIRST (frames, metadata, transcript)
                        let serverData = null;
                        if (window.VideoIntelligenceClient) {
                            try {
                                console.log('[Learn] Step 1: Fetching server-side data (frames, metadata)...');
                                serverData = await window.VideoIntelligenceClient.callEdgeFunction('full_analysis', { url, options });
                                console.log('[Learn] Server data received:', {
                                    success: serverData.success,
                                    frames: serverData.frames?.length || 0,
                                    hasTranscript: !!serverData.transcript?.segments?.length,
                                    metadata: !!serverData.metadata
                                });
                                
                                // Pass frames to the analyzer so AI can see them
                                if (serverData.frames?.length > 0) {
                                    options.extractedFrames = serverData.frames;
                                    console.log(`[Learn] ✅ Passing ${serverData.frames.length} frames to AI analyzer`);
                                }
                                
                                // Pass Cloudinary AI data (OCR text, auto tags, content analysis)
                                if (serverData.extractedText?.length > 0) {
                                    options.extractedText = serverData.extractedText;
                                    console.log(`[Learn] ✅ Passing ${serverData.extractedText.length} OCR text extractions to AI`);
                                }
                                if (serverData.autoTags?.length > 0) {
                                    options.autoTags = serverData.autoTags;
                                    console.log(`[Learn] ✅ Passing ${serverData.autoTags.length} auto-detected tags to AI`);
                                }
                                if (serverData.contentAnalysis?.length > 0) {
                                    options.contentAnalysis = serverData.contentAnalysis;
                                    console.log(`[Learn] ✅ Passing ${serverData.contentAnalysis.length} content analyses to AI`);
                                }
                                if (serverData.transcript?.segments?.length > 0) {
                                    options.transcript = serverData.transcript;
                                    console.log(`[Learn] ✅ Passing transcript with ${serverData.transcript.segments.length} segments to AI`);
                                }
                            } catch (serverError) {
                                console.warn('[Learn] Server extraction failed:', serverError.message);
                            }
                        }
                        
                        // STEP 2: Run AI analysis WITH the extracted frames
                        console.log('[Learn] Step 2: Running AI analysis...');
                        let result = await window.VideoAnalyzer.analyzeVideo(url, options);
                        
                        // STEP 3: Merge server data into result
                        if (serverData?.success && result.status === 'complete') {
                            console.log('[Learn] Step 3: Merging server data into analysis result...');
                            
                            // Merge server data (frames, transcript, etc.) into result
                            result.serverExtraction = serverData;
                            result.extraction = result.extraction || {};
                            
                            // Frames from server
                            if (serverData.frames?.length > 0) {
                                result.extractedFrames = serverData.frames;
                                result.extraction.assets = result.extraction.assets || {};
                                result.extraction.assets.frames = { extracted: true, count: serverData.frames.length };
                                console.log(`[Learn] ✅ Merged ${serverData.frames.length} frames`);
                            }
                            
                            // Transcript from server (captions)
                            if (serverData.transcript?.segments?.length > 0) {
                                result.transcript = serverData.transcript;
                                result.extraction.assets = result.extraction.assets || {};
                                result.extraction.assets.transcript = { 
                                    extracted: true, 
                                    source: serverData.transcript.source || 'server',
                                    language: serverData.transcript.language || 'en'
                                };
                                console.log(`[Learn] ✅ Merged transcript with ${serverData.transcript.segments.length} segments`);
                                
                                // Update extraction tier if we now have transcript
                                result.extraction.tier = serverData.extractionTier || 'TIER_2_PARTIAL';
                                result.extraction.confidence = 'HIGH';
                            } else {
                                // Store the reason why no transcript
                                result.transcriptReason = serverData.transcript?.reason || 'Video does not have captions';
                                console.log('[Learn] ⚠️ No transcript:', result.transcriptReason);
                            }
                            
                            // Metadata from server
                            if (serverData.metadata) {
                                result.metadata = { ...result.metadata, ...serverData.metadata };
                            }
                            
                            // Scene analysis
                            if (serverData.sceneAnalysis?.length > 0) {
                                result.sceneAnalysis = serverData.sceneAnalysis;
                            }
                            
                            // Comments from server (for YouTube)
                            if (serverData.comments?.length > 0) {
                                result.comments = serverData.comments;
                                console.log(`[Learn] ✅ Merged ${serverData.comments.length} comments`);
                            }
                            
                            // CLOUDINARY AI DATA
                            // OCR extracted text from frames
                            if (serverData.extractedText?.length > 0) {
                                result.extractedText = serverData.extractedText;
                                result.extraction.assets = result.extraction.assets || {};
                                result.extraction.assets.ocr = { extracted: true, count: serverData.extractedText.length };
                                console.log(`[Learn] ✅ Merged ${serverData.extractedText.length} OCR extractions`);
                            }
                            
                            // Auto-detected visual tags
                            if (serverData.autoTags?.length > 0) {
                                result.autoTags = serverData.autoTags;
                                result.extraction.assets = result.extraction.assets || {};
                                result.extraction.assets.autoTags = { extracted: true, count: serverData.autoTags.length };
                                console.log(`[Learn] ✅ Merged ${serverData.autoTags.length} auto-tags`);
                            }
                            
                            // Content analysis from frames
                            if (serverData.contentAnalysis?.length > 0) {
                                result.contentAnalysis = serverData.contentAnalysis;
                                console.log(`[Learn] ✅ Merged ${serverData.contentAnalysis.length} content analyses`);
                            }
                            
                            // Full Cloudinary AI data
                            if (serverData.cloudinaryAI) {
                                result.cloudinaryAI = serverData.cloudinaryAI;
                                console.log('[Learn] ✅ Merged Cloudinary AI analysis data');
                            }
                            
                            // Update extraction tier based on what we got
                            const hasOCR = serverData.extractedText?.length > 0;
                            const hasTags = serverData.autoTags?.length > 0;
                            const hasTranscript = serverData.transcript?.segments?.length > 0;
                            const hasFrames = serverData.frames?.length > 3;
                            
                            // Determine tier based on available data
                            if (hasTranscript && hasFrames && (hasOCR || hasTags)) {
                                result.extraction.tier = 'TIER_1_FULL';
                            } else if ((hasTranscript || hasOCR) && hasFrames) {
                                result.extraction.tier = 'TIER_1_PARTIAL';
                            } else if (hasFrames || hasTags) {
                                result.extraction.tier = serverData.extractionTier || 'TIER_2_PARTIAL';
                            } else {
                                result.extraction.tier = serverData.extractionTier || result.extraction.tier || 'TIER_3_METADATA_ONLY';
                            }
                        }
                        
                        console.log('[Learn] Video analysis result:', result.status);
                        
                        // Hide progress
                        if (progressDiv) progressDiv.style.display = 'none';
                        
                        // Render results
                        if (result.status === 'complete') {
                            if (resultsDiv) resultsDiv.innerHTML = window.VideoAnalyzer.renderAnalysisUI(result);
                            
                            // Show Video Intelligence panel
                            const viPanel = container.querySelector('#video-intelligence-panel');
                            if (viPanel) {
                                viPanel.style.display = 'block';
                                // Store result for templates/chat
                                window._currentVideoAnalysis = result;
                                
                                // Populate transcript if available - check multiple sources
                                const transcriptContainer = container.querySelector('#vi-transcript-container');
                                if (transcriptContainer) {
                                    // Try different transcript sources
                                    const transcript = result.transcript || result.serverExtraction?.transcript;
                                    const timeline = result.mergedTimeline;
                                    const metadata = result.metadata || result.serverExtraction?.metadata;
                                    
                                    if (transcript?.segments?.length > 0) {
                                        transcriptContainer.innerHTML = this.renderTranscriptUI(transcript);
                                    } else if (transcript?.fullText) {
                                        // Simple full text without timestamps
                                        transcriptContainer.innerHTML = this.renderSimpleTranscript(transcript.fullText);
                                    } else if (timeline?.length > 0) {
                                        transcriptContainer.innerHTML = this.renderTimelineUI(timeline);
                                    } else {
                                        // No transcript available - show video summary instead
                                        transcriptContainer.innerHTML = this.renderVideoSummaryUI(result);
                                    }
                                }
                            }
                        } else {
                            if (resultsDiv) resultsDiv.innerHTML = `<div class="cav-error" style="padding:20px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:12px;color:#fca5a5;">
                                <strong>Analysis Error</strong><br>
                                ${result.error || 'Unknown error occurred. Check browser console for details.'}
                            </div>`;
                        }
                        
                    } catch (error) {
                        console.error('[Learn] Video analysis error:', error);
                        if (progressDiv) progressDiv.style.display = 'none';
                        if (resultsDiv) resultsDiv.innerHTML = `<div class="cav-error" style="padding:20px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:12px;color:#fca5a5;">
                            <strong>Analysis Failed</strong><br>
                            ${error.message || 'Unknown error occurred'}
                        </div>`;
                    } finally {
                        window.removeEventListener('videoAnalysisProgress', progressHandler);
                        analyzeVideoBtn.disabled = false;
                        analyzeVideoBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;vertical-align:middle;"><polygon points="5 3 19 12 5 21 5 3"/></svg>Deep Analyze Video';
                    }
                });
                console.log('[Learn] Video analyze button handler attached');
            } else {
                console.warn('[Learn] Video analyze button not found in DOM');
            }
            
            // Video Upload Handler
            const videoUploadZone = container.querySelector('#video-upload-zone');
            const videoFileInput = container.querySelector('#video-file-input');
            const learnModuleInstance = this; // Capture reference for nested function
            
            if (videoUploadZone && videoFileInput) {
                // Click to select file
                videoUploadZone.addEventListener('click', () => videoFileInput.click());
                
                // Drag and drop
                videoUploadZone.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    videoUploadZone.style.borderColor = 'rgba(139, 92, 246, 0.8)';
                    videoUploadZone.style.background = 'rgba(139, 92, 246, 0.2)';
                });
                
                videoUploadZone.addEventListener('dragleave', () => {
                    videoUploadZone.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                    videoUploadZone.style.background = 'rgba(139, 92, 246, 0.05)';
                });
                
                videoUploadZone.addEventListener('drop', async (e) => {
                    e.preventDefault();
                    videoUploadZone.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                    videoUploadZone.style.background = 'rgba(139, 92, 246, 0.05)';
                    
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('video/')) {
                        await handleVideoUpload(file);
                    } else {
                        alert('Please upload a valid video file (MP4, MOV, WebM)');
                    }
                });
                
                // File input change
                videoFileInput.addEventListener('change', async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        await handleVideoUpload(file);
                    }
                });
                
                async function handleVideoUpload(file) {
                    console.log('[Learn] Processing uploaded video:', file.name, file.size);
                    
                    const progressDiv = container.querySelector('#video-analysis-progress');
                    const progressBar = container.querySelector('#video-progress-bar');
                    const progressText = container.querySelector('#video-progress-text');
                    const resultsDiv = container.querySelector('#video-analysis-results');
                    
                    // Update upload zone to show file selected
                    videoUploadZone.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="17 8 12 3 7 8"/>
                                <line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                            <div style="text-align: left;">
                                <div style="color: #4ade80; font-weight: 500;">${file.name}</div>
                                <div style="color: #64748b; font-size: 12px;">${(file.size / 1024 / 1024).toFixed(2)} MB • Processing...</div>
                            </div>
                        </div>
                    `;
                    
                    if (progressDiv) progressDiv.style.display = 'block';
                    if (resultsDiv) resultsDiv.innerHTML = '';
                    
                    // Progress handler
                    const progressHandler = (e) => {
                        if (progressBar) progressBar.style.width = e.detail.percent + '%';
                        if (progressText) progressText.textContent = e.detail.message;
                    };
                    window.addEventListener('videoAnalysisProgress', progressHandler);
                    
                    try {
                        // Build options
                        const options = {
                            uploadedFile: file,
                            campaignContext: {
                                objective: container.querySelector('#campaign-objective-select')?.value,
                                targetPlatform: container.querySelector('#target-platform-select')?.value,
                                industry: container.querySelector('#industry-vertical-select')?.value,
                                targetAudience: container.querySelector('#target-audience-input')?.value
                            },
                            useMultiModel: container.querySelector('#video-multi-model')?.checked ?? true
                        };
                        
                        console.log('[Learn] Starting uploaded video analysis...');
                        const result = await window.VideoAnalyzer.analyzeVideo(null, options);
                        console.log('[Learn] Upload analysis result:', result.status);
                        
                        if (progressDiv) progressDiv.style.display = 'none';
                        
                        if (result.status === 'complete') {
                            // Render analysis results
                            if (resultsDiv) resultsDiv.innerHTML = window.VideoAnalyzer.renderAnalysisUI(result);
                            
                            // Show Video Intelligence panel for uploaded videos too
                            const viPanel = container.querySelector('#video-intelligence-panel');
                            if (viPanel) {
                                viPanel.style.display = 'block';
                                // Store result for templates/chat
                                window._currentVideoAnalysis = result;
                                
                                // Populate transcript/visual captions
                                const transcriptContainer = container.querySelector('#vi-transcript-container');
                                if (transcriptContainer) {
                                    const transcript = result.transcript;
                                    
                                    if (transcript?.segments?.length > 0) {
                                        transcriptContainer.innerHTML = learnModuleInstance.renderTranscriptUI(transcript);
                                    } else {
                                        // No transcript - show video summary
                                        transcriptContainer.innerHTML = learnModuleInstance.renderVideoSummaryUI(result);
                                    }
                                }
                            }
                        } else {
                            if (resultsDiv) resultsDiv.innerHTML = `<div class="cav-error" style="padding:20px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:12px;color:#fca5a5;">
                                <strong>Analysis Error</strong><br>
                                ${result.error || 'Unknown error occurred.'}
                            </div>`;
                        }
                        
                    } catch (error) {
                        console.error('[Learn] Video upload analysis error:', error);
                        if (progressDiv) progressDiv.style.display = 'none';
                        if (resultsDiv) resultsDiv.innerHTML = `<div class="cav-error" style="padding:20px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:12px;color:#fca5a5;">
                            <strong>Analysis Failed</strong><br>
                            ${error.message || 'Unknown error occurred'}
                        </div>`;
                    } finally {
                        window.removeEventListener('videoAnalysisProgress', progressHandler);
                        // Reset upload zone
                        videoUploadZone.innerHTML = `
                            <input type="file" id="video-file-input" accept="video/*" style="display: none;">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="1.5" style="margin-bottom: 12px;">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="17 8 12 3 7 8"/>
                                <line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                            <div style="color: #a78bfa; font-weight: 500; margin-bottom: 4px;">📤 Upload Video for Full Analysis</div>
                            <div style="color: #64748b; font-size: 12px;">Drop file or click to browse • MP4, MOV, WebM • Max 500MB</div>
                            <div style="color: #94a3b8; font-size: 0.6875rem; margin-top: 8px; display: flex; align-items: center; gap: 4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Direct upload guarantees frame extraction & complete analysis</div>
                        `;
                        // Re-attach file input
                        const newInput = videoUploadZone.querySelector('#video-file-input');
                        if (newInput) {
                            newInput.addEventListener('change', async (e) => {
                                const file = e.target.files[0];
                                if (file) await handleVideoUpload(file);
                            });
                        }
                    }
                }
                
                console.log('[Learn] Video upload handler attached');
            }
            
            // Video history item click
            container.querySelectorAll('.video-history-item')?.forEach(item => {
                item.addEventListener('click', () => {
                    const id = item.dataset.id;
                    const history = window.VideoAnalyzer?.analysisHistory || [];
                    const analysis = history.find(h => h.id === id);
                    if (analysis) {
                        const resultsDiv = container.querySelector('#video-analysis-results');
                        if (resultsDiv) {
                            resultsDiv.innerHTML = window.VideoAnalyzer.renderAnalysisUI(analysis);
                        }
                        // Store for templates/chat
                        window._currentVideoAnalysis = analysis;
                        const viPanel = container.querySelector('#video-intelligence-panel');
                        if (viPanel) viPanel.style.display = 'block';
                    }
                });
            });
            
            // ===== VIDEO INTELLIGENCE PANEL HANDLERS =====
            
            // Tab switching
            container.querySelectorAll('.vi-tab-btn')?.forEach(btn => {
                btn.addEventListener('click', () => {
                    const tab = btn.dataset.tab;
                    // Update buttons
                    container.querySelectorAll('.vi-tab-btn').forEach(b => {
                        b.classList.remove('active');
                        b.style.background = 'transparent';
                        b.style.color = '#94a3b8';
                    });
                    btn.classList.add('active');
                    btn.style.background = 'rgba(139, 92, 246, 0.2)';
                    btn.style.color = '#a78bfa';
                    // Update content
                    container.querySelectorAll('.vi-tab-content').forEach(c => c.style.display = 'none');
                    const content = container.querySelector(`.vi-tab-content[data-content="${tab}"]`);
                    if (content) content.style.display = 'block';
                });
            });
            
            // Template buttons
            container.querySelectorAll('.vi-template-btn')?.forEach(btn => {
                btn.addEventListener('click', async () => {
                    const templateId = btn.dataset.template;
                    const resultDiv = container.querySelector('#vi-template-result');
                    const outputDiv = container.querySelector('#vi-template-output');
                    const titleEl = container.querySelector('#vi-template-title');
                    
                    if (!window._currentVideoAnalysis) {
                        alert('Please analyze a video first');
                        return;
                    }
                    
                    if (!window.VideoIntelligenceEngine) {
                        alert('Video Intelligence Engine not loaded. Please refresh.');
                        return;
                    }
                    
                    // Show loading
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                    if (resultDiv) resultDiv.style.display = 'block';
                    if (outputDiv) outputDiv.innerHTML = '<div style="text-align:center;padding:40px;"><div class="spinner" style="display:inline-block;width:24px;height:24px;border:2px solid rgba(139,92,246,0.3);border-top-color:#8b5cf6;border-radius:50%;animation:spin 1s linear infinite;"></div><div style="color:#94a3b8;margin-top:12px;">Generating...</div></div>';
                    
                    try {
                        const templates = window.VIDEO_TEMPLATES || window.VideoIntelligenceEngine.getTemplates();
                        const template = templates[templateId];
                        if (titleEl) titleEl.textContent = template?.name || templateId;
                        
                        const result = await window.VideoIntelligenceEngine.generateFromTemplate(templateId, window._currentVideoAnalysis);
                        
                        if (outputDiv) {
                            outputDiv.innerHTML = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
                        }
                    } catch (error) {
                        console.error('[Learn] Template generation error:', error);
                        if (outputDiv) outputDiv.innerHTML = `<div style="color:#fca5a5;">Error: ${error.message}</div>`;
                    } finally {
                        btn.disabled = false;
                        btn.style.opacity = '1';
                    }
                });
            });
            
            // Copy template result
            container.querySelector('#vi-copy-template')?.addEventListener('click', () => {
                const output = container.querySelector('#vi-template-output')?.textContent;
                if (output) {
                    navigator.clipboard.writeText(output);
                    const btn = container.querySelector('#vi-copy-template');
                    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><polyline points="20 6 9 17 4 12"/></svg> Copied!';
                    setTimeout(() => btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy', 2000);
                }
            });
            
            // Chat send
            const chatSend = async (message) => {
                if (!message?.trim()) return;
                
                const messagesDiv = container.querySelector('#vi-chat-messages');
                const input = container.querySelector('#vi-chat-input');
                
                if (!window._currentVideoAnalysis) {
                    alert('Please analyze a video first');
                    return;
                }
                
                // Add user message
                messagesDiv.innerHTML += `
                    <div style="padding: 12px 16px; background: rgba(59, 130, 246, 0.2); border-radius: 12px; color: #e2e8f0; font-size: 14px; align-self: flex-end; max-width: 80%;">
                        <strong style="color: #60a5fa;">You:</strong> ${message}
                    </div>
                `;
                
                // Clear input
                if (input) input.value = '';
                
                // Add loading
                const loadingId = 'chat-loading-' + Date.now();
                messagesDiv.innerHTML += `
                    <div id="${loadingId}" style="padding: 12px 16px; background: rgba(139, 92, 246, 0.2); border-radius: 12px; color: #94a3b8; font-size: 14px;">
                        <div class="spinner" style="display:inline-block;width:14px;height:14px;border:2px solid rgba(139,92,246,0.3);border-top-color:#8b5cf6;border-radius:50%;animation:spin 1s linear infinite;margin-right:8px;vertical-align:middle;"></div>
                        Thinking...
                    </div>
                `;
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
                
                try {
                    let response;
                    // Try VideoIntelligenceClient (server-side) first, then VideoIntelligenceEngine
                    if (window.VideoIntelligenceClient?.currentAnalysis || window._currentVideoAnalysis) {
                        if (window.VideoIntelligenceClient) {
                            response = await window.VideoIntelligenceClient.chat(message, window._currentVideoAnalysis);
                        } else if (window.VideoIntelligenceEngine) {
                            response = await window.VideoIntelligenceEngine.chat(message, window._currentVideoAnalysis);
                        }
                    } else {
                        response = { content: 'Please analyze a video first before asking questions about it.' };
                    }
                    
                    // Remove loading
                    const loading = document.getElementById(loadingId);
                    if (loading) loading.remove();
                    
                    // Add AI response - ensure we get a string
                    let responseText = response?.content || response;
                    // Handle case where response is an object (stringify it nicely)
                    if (typeof responseText === 'object') {
                        responseText = JSON.stringify(responseText, null, 2);
                    }
                    messagesDiv.innerHTML += `
                        <div style="padding: 12px 16px; background: rgba(139, 92, 246, 0.2); border-radius: 12px; color: #e2e8f0; font-size: 14px; white-space: pre-wrap;">
                            <strong style="color: #a78bfa;">AI Assistant:</strong> ${responseText}
                        </div>
                    `;
                    messagesDiv.scrollTop = messagesDiv.scrollHeight;
                    
                } catch (error) {
                    console.error('[Learn] Chat error:', error);
                    const loading = document.getElementById(loadingId);
                    if (loading) loading.innerHTML = `<span style="color:#fca5a5;">Error: ${error.message}</span>`;
                }
            };
            
            container.querySelector('#vi-chat-send')?.addEventListener('click', () => {
                const input = container.querySelector('#vi-chat-input');
                chatSend(input?.value);
            });
            
            container.querySelector('#vi-chat-input')?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    chatSend(e.target.value);
                }
            });
            
            // Quick questions
            container.querySelectorAll('.vi-quick-question')?.forEach(btn => {
                btn.addEventListener('click', () => chatSend(btn.textContent));
            });
            
            // Image Comparison - Select from library
            container.querySelector('#select-comparison-image')?.addEventListener('click', () => {
                this.showAssetPicker((asset) => {
                    this.comparisonImage = asset;
                    this.updateComparisonPreview(container, asset);
                });
            });
            
            // Image Comparison - Upload
            container.querySelector('#upload-comparison-image')?.addEventListener('click', () => {
                container.querySelector('#comparison-image-upload')?.click();
            });
            
            container.querySelector('#comparison-image-upload')?.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file && file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const asset = {
                            id: `upload_${Date.now()}`,
                            filename: file.name,
                            thumbnail_url: event.target.result,
                            dataUrl: event.target.result,
                            width: 0,
                            height: 0,
                            file_type: 'image'
                        };
                        
                        // Get dimensions from image
                        const img = new Image();
                        img.onload = () => {
                            asset.width = img.width;
                            asset.height = img.height;
                            this.comparisonImage = asset;
                            this.updateComparisonPreview(container, asset);
                        };
                        img.src = event.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
            
            // Clear comparison image
            container.querySelector('#clear-comparison-image')?.addEventListener('click', () => {
                this.comparisonImage = null;
                container.querySelector('#selected-comparison-image').style.display = 'none';
            });

            // Update best practices
            container.querySelector('#update-best-practices')?.addEventListener('click', async (e) => {
                e.target.disabled = true;
                e.target.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;animation:spin 1s linear infinite;"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Updating...';
                
                await this.updateBestPractices();
                
                e.target.disabled = false;
                e.target.textContent = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Update from Web';
                this.render(container);
            });

            // Update benchmarks
            container.querySelector('#update-benchmarks')?.addEventListener('click', async (e) => {
                e.target.disabled = true;
                e.target.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;animation:spin 1s linear infinite;"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Updating...';
                
                await this.updateBenchmarks();
                
                e.target.disabled = false;
                e.target.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Update Benchmarks';
                this.render(container);
            });
            
            // Save benchmarks to CRM
            container.querySelector('#save-benchmarks-to-crm')?.addEventListener('click', () => {
                this.showSaveBenchmarksToCRMModal(container);
            });

            // Save custom benchmark
            container.querySelector('#save-custom-benchmark')?.addEventListener('click', () => {
                const metric = container.querySelector('#custom-metric')?.value;
                const low = parseFloat(container.querySelector('#custom-low')?.value);
                const median = parseFloat(container.querySelector('#custom-median')?.value);
                const high = parseFloat(container.querySelector('#custom-high')?.value);

                if (metric && !isNaN(median)) {
                    this.saveBenchmark({
                        id: `bench_${Date.now()}`,
                        metric,
                        platform: 'all',
                        value: { low: low || median * 0.5, median, high: high || median * 1.5 },
                        source: 'user-input',
                        lastUpdated: new Date().toISOString()
                    });
                    this.render(container);
                }
            });

            // Analyze competitor
            container.querySelectorAll('[data-action="analyze-competitor"]').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const competitorId = e.target.dataset.id;
                    const resultsDiv = container.querySelector('#competitor-analysis-results');
                    resultsDiv.innerHTML = '<div class="cav-loading" style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 24px; color: var(--cav-text-secondary, #a1a1aa);"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="cav-spin"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>Analyzing competitor ads...</div>';

                    try {
                        const result = await this.analyzeCompetitorAds(competitorId);
                        resultsDiv.innerHTML = this.renderCompetitorAnalysisResult(result);
                    } catch (error) {
                        resultsDiv.innerHTML = `<div class="cav-error"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>Analysis failed: ${error.message}</div>`;
                    }
                });
            });

            // Delete swipe entry - with enhanced confirmation
            container.querySelectorAll('[data-action="delete-swipe"]').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const button = e.target.closest('[data-action="delete-swipe"]');
                    const id = button?.dataset?.id;
                    if (!id) return;
                    
                    const entry = this.swipeFile.find(s => s.id === id);
                    const entryName = entry?.title || entry?.sourceUrl || 'this entry';
                    
                    const confirmed = window.PersistenceUI
                        ? await window.PersistenceUI.confirm({
                            title: 'Delete Swipe File Entry?',
                            message: `Are you sure you want to delete "${entryName}"? This action cannot be undone.`,
                            confirmText: 'Delete',
                            cancelText: 'Cancel'
                        })
                        : confirm('Delete this swipe file entry?');
                    
                    if (confirmed) {
                        this.deleteSwipeEntry(id);
                        this.render(container);
                        
                        if (window.PersistenceUI) {
                            window.PersistenceUI.showSuccess('Entry Deleted', 'Swipe file entry has been removed');
                        }
                    }
                });
            });
            
            // View swipe entry details
            container.querySelectorAll('[data-action="view-swipe"]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // Use closest() to get the button element in case we clicked on the emoji
                    const button = e.target.closest('[data-action="view-swipe"]');
                    const id = button?.dataset?.id;
                    console.log('[Learn] View swipe clicked, id:', id);
                    const entry = this.swipeFile.find(s => s.id === id);
                    if (entry) {
                        console.log('[Learn] Found entry:', entry);
                        this.showSwipeDetailModal(entry);
                    } else {
                        console.warn('[Learn] Entry not found for id:', id, 'Swipe file:', this.swipeFile);
                    }
                });
            });
            
            // View in CRM
            container.querySelectorAll('[data-action="view-in-crm"]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const companyId = e.target.dataset.id;
                    if (companyId && window.cavCRM) {
                        const company = window.cavCRM.getCompany(companyId);
                        if (company) {
                            // Trigger the CRM company detail view
                            if (window.cavCRM.showCompanyDetail) {
                                window.cavCRM.showCompanyDetail(window.cavCRM, companyId, document.body);
                            } else {
                                alert(`Company: ${company.name}\nAssets: ${company.linkedAssets?.length || 0}\nAnalyses: ${company.analyses?.length || 0}`);
                            }
                        }
                    }
                });
            });

            // Filter swipe file
            container.querySelector('#swipe-search')?.addEventListener('input', (e) => {
                this.filterSwipeFile(container, { search: e.target.value });
            });

            // Filter best practices
            container.querySelector('#bp-category')?.addEventListener('change', () => this.filterBestPractices(container));
            container.querySelector('#bp-platform')?.addEventListener('change', () => this.filterBestPractices(container));
            container.querySelector('#bp-search')?.addEventListener('input', () => this.filterBestPractices(container));
        }

        // Show swipe entry detail modal
        showSwipeDetailModal(entry) {
            const modal = document.createElement('div');
            modal.className = 'cav-modal-overlay';
            modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 100000; display: flex; align-items: center; justify-content: center;';
            
            const analysis = entry.analysis || {};
            const creativeSummary = analysis.creativeSummary || {};
            const hookAnalysis = analysis.hookAnalysis || {};
            const ctaEvaluation = analysis.ctaEvaluation || {};
            const visualStrategy = analysis.visualStrategy || {};
            const platformOptimization = analysis.platformOptimization || {};
            const takeaways = analysis.takeaways || [];
            const strengths = analysis.strengths || [];
            const improvements = analysis.improvements || [];
            const visualDescription = analysis.visualDescription || '';
            
            // Determine display URL (handle data URLs)
            const isDataUrl = entry.sourceUrl?.startsWith('data:') || entry.originalUrl?.startsWith('data:');
            const displayUrl = isDataUrl ? 'Pasted Image (Data URL)' : (entry.sourceUrl || entry.originalUrl || '');
            
            modal.innerHTML = `
                <div class="cav-modal" style="max-width: 900px; max-height: 90vh; overflow: hidden; background: #1a1a1a; border-radius: 24px; box-shadow: 0 25px 60px rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.08);">
                    <div class="cav-modal-header" style="padding: 1.5rem 2rem; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; background: #252525;">
                        <h2 style="margin: 0; font-size: 1.25rem; color: #fff; font-weight: 600; display: flex; align-items: center; gap: 8px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>Creative Analysis Details</h2>
                        <button class="cav-modal-close" style="background: transparent; border: 1px solid rgba(255,255,255,0.08); color: #71717a; width: 36px; height: 36px; border-radius: 8px; cursor: pointer; font-size: 1.25rem; transition: all 0.2s;">×</button>
                    </div>
                    <div class="cav-modal-body" style="padding: 2rem; overflow-y: auto; max-height: calc(90vh - 100px);">
                        <!-- Entry Header with Image -->
                        <div style="display: flex; gap: 1.5rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
                            <div style="flex-shrink: 0;">
                                ${entry.thumbnailData ? 
                                  `<img src="${entry.thumbnailData}" alt="Creative" style="max-width: 280px; max-height: 280px; object-fit: contain; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">` :
                                  `<div style="width: 200px; height: 150px; background: #252525; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 3rem; border: 1px solid rgba(255,255,255,0.08);">
                                      ${entry.urlType === 'video' ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>' : entry.urlType === 'landing_page' ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>' : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>'}
                                  </div>`}
                            </div>
                            <div style="flex: 1; min-width: 250px;">
                                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.75rem;">
                                    ${entry.savedBy === 'auto' ? '<span style="background: rgba(16,185,129,0.15); color: #10b981; padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.6875rem; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/></svg>Auto-saved</span>' : ''}
                                    ${entry.isCompetitor ? '<span style="background: rgba(249,115,22,0.15); color: #f97316; padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> Competitor</span>' : ''}
                                    <span style="background: rgba(236,72,153,0.15); color: #f472b6; padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">${entry.urlType?.replace(/_/g, ' ') || 'Unknown'}</span>
                                </div>
                                <p style="margin: 0.5rem 0; color: #94a3b8; font-size: 0.85rem;">${displayUrl}</p>
                                <p style="margin: 0.5rem 0; color: #71717a; font-size: 0.85rem;">Saved: ${new Date(entry.savedAt).toLocaleString()}</p>
                                ${entry.linkedCompanyId ? `<p style="margin: 0.5rem 0; color: #10b981; font-size: 0.85rem;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Linked to CRM</p>` : ''}
                                
                                ${visualDescription ? `
                                    <div style="margin-top: 12px; padding: 12px; background: rgba(139,92,246,0.1); border-radius: 8px; border: 1px solid rgba(139,92,246,0.2);">
                                        <h4 style="margin: 0 0 6px; color: #a78bfa; font-size: 12px; font-weight: 600;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> VISUAL DESCRIPTION</h4>
                                        <p style="margin: 0; color: #e5e5e5; font-size: 13px; line-height: 1.5;">${visualDescription}</p>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        
                        <!-- Creative Summary -->
                        ${Object.keys(creativeSummary).length > 0 ? `
                            <div style="background: #252525; border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; border: 1px solid rgba(255,255,255,0.08);">
                                <h3 style="margin: 0 0 0.75rem; color: #fff; font-size: 1rem; font-weight: 600; display: flex; align-items: center; gap: 6px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 4 12.9V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.1A7 7 0 0 1 12 2z"/></svg>Creative Summary</h3>
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
                                    ${creativeSummary.product ? `<div><span style="color: #71717a; font-size: 11px; text-transform: uppercase;">Product</span><p style="margin: 4px 0 0; color: #e5e5e5; font-size: 14px;">${creativeSummary.product}</p></div>` : ''}
                                    ${creativeSummary.targetAudience ? `<div><span style="color: #71717a; font-size: 11px; text-transform: uppercase;">Target Audience</span><p style="margin: 4px 0 0; color: #e5e5e5; font-size: 14px;">${creativeSummary.targetAudience}</p></div>` : ''}
                                    ${creativeSummary.industry ? `<div><span style="color: #71717a; font-size: 11px; text-transform: uppercase;">Industry</span><p style="margin: 4px 0 0; color: #e5e5e5; font-size: 14px;">${creativeSummary.industry}</p></div>` : ''}
                                    ${creativeSummary.emotionalTone ? `<div><span style="color: #71717a; font-size: 11px; text-transform: uppercase;">Emotional Tone</span><p style="margin: 4px 0 0; color: #e5e5e5; font-size: 14px;">${creativeSummary.emotionalTone}</p></div>` : ''}
                                </div>
                                ${creativeSummary.keyMessage ? `<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.05);"><span style="color: #71717a; font-size: 11px; text-transform: uppercase;">Key Message</span><p style="margin: 4px 0 0; color: #10b981; font-size: 14px; font-weight: 500;">"${creativeSummary.keyMessage}"</p></div>` : ''}
                            </div>
                        ` : ''}
                        
                        <!-- Hook Analysis -->
                        ${hookAnalysis.score ? `
                            <div style="background: #252525; border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; border: 1px solid rgba(255,255,255,0.08);">
                                <h3 style="margin: 0 0 0.75rem; color: #fff; font-size: 1rem; font-weight: 600; display: flex; align-items: center; gap: 6px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12l2 2 4-4"/></svg>Hook Analysis</h3>
                                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                                    <div style="background: ${hookAnalysis.score >= 70 ? 'rgba(16,185,129,0.15)' : hookAnalysis.score >= 50 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)'}; padding: 10px 16px; border-radius: 10px; text-align: center;">
                                        <span style="font-size: 1.75rem; font-weight: 700; color: ${hookAnalysis.score >= 70 ? '#10b981' : hookAnalysis.score >= 50 ? '#f59e0b' : '#ef4444'};">${hookAnalysis.score}</span>
                                        <span style="color: #71717a; font-size: 11px; display: block;">/100</span>
                                    </div>
                                    <div>
                                        ${hookAnalysis.element ? `<p style="margin: 0 0 4px; color: #e5e5e5; font-size: 14px;"><strong>Attention:</strong> ${hookAnalysis.element}</p>` : ''}
                                        ${hookAnalysis.thumbStopPotential ? `<span style="background: rgba(139,92,246,0.15); color: #a78bfa; padding: 4px 10px; border-radius: 6px; font-size: 0.6875rem; font-weight: 600;">${hookAnalysis.thumbStopPotential.toUpperCase()} Thumb-Stop</span>` : ''}
                                    </div>
                                </div>
                                ${hookAnalysis.effectiveness ? `<p style="margin: 0; color: #a1a1aa; font-size: 0.9rem;">${hookAnalysis.effectiveness}</p>` : ''}
                            </div>
                        ` : ''}
                        
                        <!-- Visual Strategy -->
                        ${Object.keys(visualStrategy).length > 0 ? `
                            <div style="background: #252525; border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; border: 1px solid rgba(255,255,255,0.08);">
                                <h3 style="margin: 0 0 0.75rem; color: #fff; font-size: 1rem; font-weight: 600; display: flex; align-items: center; gap: 6px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="8" r="1.5"/><circle cx="8" cy="12" r="1.5"/><circle cx="16" cy="12" r="1.5"/><circle cx="12" cy="16" r="1.5"/></svg>Visual Strategy</h3>
                                <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
                                    ${visualStrategy.colors?.length ? `
                                        <div>
                                            <span style="color: #71717a; font-size: 11px; text-transform: uppercase; display: block; margin-bottom: 6px;">Colors</span>
                                            <div style="display: flex; gap: 4px;">${visualStrategy.colors.slice(0, 6).map(c => `<div style="width: 24px; height: 24px; background: ${c}; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1);" title="${c}"></div>`).join('')}</div>
                                        </div>
                                    ` : ''}
                                    ${visualStrategy.imageryApproach ? `<div><span style="color: #71717a; font-size: 11px; text-transform: uppercase; display: block; margin-bottom: 4px;">Style</span><span style="color: #e5e5e5; font-size: 13px;">${visualStrategy.imageryApproach}</span></div>` : ''}
                                    ${visualStrategy.qualityScore ? `<div><span style="color: #71717a; font-size: 11px; text-transform: uppercase; display: block; margin-bottom: 4px;">Quality</span><span style="color: #10b981; font-size: 13px; font-weight: 600;">${visualStrategy.qualityScore}/100</span></div>` : ''}
                                </div>
                                ${visualStrategy.composition ? `<p style="margin: 10px 0 0; color: #a1a1aa; font-size: 13px;">${visualStrategy.composition}</p>` : ''}
                            </div>
                        ` : ''}
                        
                        <!-- CTA Evaluation -->
                        ${ctaEvaluation.type || ctaEvaluation.text ? `
                            <div style="background: #252525; border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; border: 1px solid rgba(255,255,255,0.08);">
                                <h3 style="margin: 0 0 0.75rem; color: #fff; font-size: 1rem; font-weight: 600; display: flex; align-items: center; gap: 6px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v-2a4 4 0 0 0-4-4H9l4-7"/><path d="M8 9v10c0 .55.45 1 1 1h2"/><line x1="3" y1="9" x2="3" y2="14"/></svg>CTA Evaluation</h3>
                                ${ctaEvaluation.text ? `<p style="margin: 0 0 10px; color: #10b981; font-size: 15px; font-weight: 600;">"${ctaEvaluation.text}"</p>` : ''}
                                <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                                    ${ctaEvaluation.clarity ? `<div><span style="color: #71717a; font-size: 11px;">Clarity:</span> <span style="color: #e5e5e5; font-weight: 600;">${ctaEvaluation.clarity}/100</span></div>` : ''}
                                    ${ctaEvaluation.urgency ? `<div><span style="color: #71717a; font-size: 11px;">Urgency:</span> <span style="color: #e5e5e5; font-weight: 600;">${ctaEvaluation.urgency}/100</span></div>` : ''}
                                    ${ctaEvaluation.type ? `<div><span style="color: #71717a; font-size: 11px;">Type:</span> <span style="color: #e5e5e5;">${ctaEvaluation.type}</span></div>` : ''}
                                </div>
                            </div>
                        ` : ''}
                        
                        <!-- Platform Fit -->
                        ${platformOptimization.platformScores || platformOptimization.bestPlatforms?.length ? `
                            <div style="background: #252525; border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; border: 1px solid rgba(255,255,255,0.08);">
                                <h3 style="margin: 0 0 0.75rem; color: #fff; font-size: 1rem; font-weight: 600;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;vertical-align:middle;"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> Platform Fit</h3>
                                ${platformOptimization.platformScores ? `
                                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                        ${Object.entries(platformOptimization.platformScores).map(([platform, score]) => `
                                            <div style="background: ${score >= 70 ? 'rgba(16,185,129,0.15)' : score >= 50 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)'}; padding: 6px 12px; border-radius: 6px;">
                                                <span style="color: ${score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'}; font-size: 12px; font-weight: 600;">${platform}: ${score}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : platformOptimization.bestPlatforms?.length ? `
                                    <p style="margin: 0; color: #a1a1aa;">Best for: ${platformOptimization.bestPlatforms.join(', ')}</p>
                                ` : ''}
                            </div>
                        ` : ''}
                        
                        <!-- Strengths & Improvements -->
                        ${strengths.length > 0 || improvements.length > 0 ? `
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 1rem;">
                                ${strengths.length > 0 ? `
                                    <div style="background: rgba(16,185,129,0.08); border-radius: 12px; padding: 1rem; border: 1px solid rgba(16,185,129,0.2);">
                                        <h4 style="margin: 0 0 8px; color: #10b981; font-size: 0.8125rem; font-weight: 600; display: flex; align-items: center; gap: 4px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Strengths</h4>
                                        <ul style="margin: 0; padding-left: 16px; color: #a1a1aa; font-size: 12px; line-height: 1.5;">
                                            ${strengths.map(s => `<li style="margin-bottom: 4px;">${s}</li>`).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                                ${improvements.length > 0 ? `
                                    <div style="background: rgba(245,158,11,0.08); border-radius: 12px; padding: 1rem; border: 1px solid rgba(245,158,11,0.2);">
                                        <h4 style="margin: 0 0 8px; color: #f59e0b; font-size: 0.8125rem; font-weight: 600; display: flex; align-items: center; gap: 4px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 4 12.9V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.1A7 7 0 0 1 12 2z"/></svg>Improvements</h4>
                                        <ul style="margin: 0; padding-left: 16px; color: #a1a1aa; font-size: 12px; line-height: 1.5;">
                                            ${improvements.map(i => `<li style="margin-bottom: 4px;">${i}</li>`).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                            </div>
                        ` : ''}
                        
                        <!-- Key Takeaways -->
                        ${takeaways.length > 0 ? `
                            <div style="background: linear-gradient(135deg, rgba(139,92,246,0.1), rgba(236,72,153,0.1)); border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; border: 1px solid rgba(139,92,246,0.2);">
                                <h3 style="margin: 0 0 0.75rem; color: #a78bfa; font-size: 1rem; font-weight: 600;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;vertical-align:middle;"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> Key Takeaways</h3>
                                <ul style="margin: 0; padding-left: 1.25rem; color: #e5e5e5; font-size: 13px; line-height: 1.6;">
                                    ${takeaways.map(t => `<li style="margin-bottom: 6px;">${t}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        
                        <!-- Tags -->
                        ${entry.tags?.length > 0 ? `
                            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;">
                                ${entry.tags.filter(Boolean).map(t => `<span style="background: rgba(236,72,153,0.15); color: #f472b6; padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">${t}</span>`).join('')}
                            </div>
                        ` : ''}
                        
                        ${entry.notes && entry.notes !== creativeSummary.keyMessage ? `
                            <div style="margin-top: 1.25rem; padding-top: 1.25rem; border-top: 1px solid rgba(255,255,255,0.08);">
                                <h3 style="margin: 0 0 0.75rem; color: #fff; font-size: 1rem; font-weight: 600; display: flex; align-items: center; gap: 6px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>Notes</h3>
                                <p style="margin: 0; color: #71717a; font-style: italic;">${entry.notes}</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            modal.querySelector('.cav-modal-close').addEventListener('click', () => modal.remove());
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
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

        async showAssetPicker(callback) {
            const assets = await this.getAllAssets();
            
            const modal = document.createElement('div');
            modal.className = 'cav-modal-overlay';
            modal.innerHTML = `
                <div class="cav-modal">
                    <div class="cav-modal-header">
                        <h2>Select Asset to Compare</h2>
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
                                      ''}<div class="no-thumb" ${thumbSrc ? 'style="display:none"' : ''}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
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
                    if (asset && callback) callback(asset);
                    modal.remove();
                });
            });
        }
        
        // Save benchmarks to CRM modal
        showSaveBenchmarksToCRMModal(container) {
            if (!this.benchmarks.length) {
                alert('No benchmarks to save. Analyze a URL first to extract benchmarks.');
                return;
            }
            
            const companies = window.cavCRM ? Object.values(window.cavCRM.companies || {}) : [];
            
            const modal = document.createElement('div');
            modal.className = 'cav-modal-overlay';
            modal.innerHTML = `
                <div class="cav-modal" style="max-width: 500px;">
                    <div class="cav-modal-header">
                        <h2><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;vertical-align:middle;"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>Save Benchmarks to CRM</h2>
                        <button class="cav-modal-close">&times;</button>
                    </div>
                    <div class="cav-modal-body">
                        <p class="cav-hint">${this.benchmarks.length} benchmarks will be saved to the selected company.</p>
                        
                        <div class="cav-form-group">
                            <label>Select Company:</label>
                            <select id="benchmark-company-select" class="cav-select">
                                <option value="">-- Select Company --</option>
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
                                <input type="text" id="new-company-industry" class="cav-input" placeholder="e.g., Technology, Retail">
                            </div>
                        </div>
                    </div>
                    <div class="cav-modal-footer">
                        <button class="cav-btn cav-btn-secondary" id="cancel-save">Cancel</button>
                        <button class="cav-btn cav-btn-primary" id="confirm-save-benchmarks"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>Save to CRM</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Toggle new company fields
            const companySelect = modal.querySelector('#benchmark-company-select');
            const newCompanyFields = modal.querySelector('#new-company-fields');
            
            companySelect.addEventListener('change', () => {
                newCompanyFields.style.display = companySelect.value === 'new' ? 'block' : 'none';
            });
            
            // Close handlers
            modal.querySelector('.cav-modal-close').addEventListener('click', () => modal.remove());
            modal.querySelector('#cancel-save').addEventListener('click', () => modal.remove());
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
            
            // Save handler
            modal.querySelector('#confirm-save-benchmarks').addEventListener('click', () => {
                let companyId = companySelect.value;
                
                if (companyId === 'new') {
                    const newName = modal.querySelector('#new-company-name').value;
                    const industry = modal.querySelector('#new-company-industry').value;
                    
                    if (!newName) {
                        alert('Please enter a company name');
                        return;
                    }
                    
                    if (window.cavCRM?.createCompany) {
                        const newCompany = window.cavCRM.createCompany({
                            name: newName,
                            industry: industry,
                            type: 'client',
                            status: 'active'
                        });
                        companyId = newCompany.id;
                    }
                }
                
                if (!companyId) {
                    alert('Please select a company');
                    return;
                }
                
                // Save benchmarks to company
                if (window.cavCRM) {
                    const company = window.cavCRM.getCompany(companyId);
                    if (company) {
                        if (!company.benchmarks) company.benchmarks = [];
                        company.benchmarks.push({
                            savedAt: new Date().toISOString(),
                            data: this.benchmarks
                        });
                        window.cavCRM.updateCompany(companyId, { benchmarks: company.benchmarks });
                        
                        // Log activity
                        window.cavCRM.logActivity('benchmarks_saved', {
                            companyId: companyId,
                            count: this.benchmarks.length
                        });
                    }
                }
                
                modal.remove();
                alert(`${this.benchmarks.length} benchmarks saved to CRM!`);
            });
        }

        renderURLAnalysisResult(result) {
            if (result.error) {
                return `<div class="cav-error"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>${result.error}</div>`;
            }
            
            const isImage = result.urlType === 'image' || result.thumbnailData;

            return `
                <div class="cav-url-result" style="background: #1a1a1a; border-radius: 16px; padding: 24px; border: 1px solid rgba(255,255,255,0.08);">
                    <div class="cav-url-result-header" style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
                        <h3 style="margin: 0; color: #fff; font-size: 1.25rem; display: flex; align-items: center; gap: 8px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Analysis Complete</h3>
                        <span class="cav-url-type-badge" style="background: rgba(236,72,153,0.15); color: #f472b6; padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase;">${result.urlType?.replace(/_/g, ' ')}</span>
                        ${result.detectedBrand && result.detectedBrand !== 'unknown' ? `<span style="background: rgba(16,185,129,0.15); color: #10b981; padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>${result.detectedBrand}</span>` : ''}
                        <div style="margin-left: auto; display: flex; gap: 8px;">
                            <button class="cav-btn cav-btn-secondary" id="compare-with-creative" data-url="${result.url}" style="padding: 8px 16px; background: transparent; border: 1px solid rgba(139,92,246,0.4); color: #a78bfa; border-radius: 8px; cursor: pointer; font-size: 13px;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>Compare
                            </button>
                            <button class="cav-btn cav-btn-primary" id="save-to-swipe" data-url="${result.url}" style="padding: 8px 16px; background: var(--cav-primary, #ec4899); border: none; color: white; border-radius: 8px; cursor: pointer; font-size: 0.8125rem; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Save to Swipe File
                            </button>
                        </div>
                    </div>
                    
                    <!-- Image Preview (for image URLs) -->
                    ${isImage && result.thumbnailData ? `
                        <div style="margin-bottom: 20px; display: flex; gap: 20px; flex-wrap: wrap;">
                            <div style="flex-shrink: 0;">
                                <img src="${result.thumbnailData}" alt="Analyzed Image" style="max-width: 300px; max-height: 300px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); object-fit: contain;">
                            </div>
                            ${result.visualDescription ? `
                                <div style="flex: 1; min-width: 250px;">
                                    <h4 style="margin: 0 0 8px; color: #a78bfa; font-size: 0.875rem; font-weight: 600; display: flex; align-items: center; gap: 6px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>Visual Description</h4>
                                    <p style="margin: 0; color: #a1a1aa; font-size: 14px; line-height: 1.6;">${result.visualDescription}</p>
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}
                    
                    ${result.creativeSummary ? `
                        <div class="cav-result-section" style="background: #252525; border-radius: 12px; padding: 16px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.05);">
                            <h4 style="margin: 0 0 12px; color: #fff; font-size: 15px; display: flex; align-items: center; gap: 8px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 4 12.9V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.1A7 7 0 0 1 12 2z"/></svg>Creative Summary</h4>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                                <div><span style="color: #71717a; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Product/Service</span><p style="margin: 4px 0 0; color: #e5e5e5; font-size: 14px;">${result.creativeSummary.product || 'N/A'}</p></div>
                                <div><span style="color: #71717a; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Target Audience</span><p style="margin: 4px 0 0; color: #e5e5e5; font-size: 14px;">${result.creativeSummary.targetAudience || 'N/A'}</p></div>
                                <div><span style="color: #71717a; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Industry</span><p style="margin: 4px 0 0; color: #e5e5e5; font-size: 14px;">${result.creativeSummary.industry || result.detectedIndustry || 'N/A'}</p></div>
                                ${result.creativeSummary.emotionalTone ? `<div><span style="color: #71717a; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Emotional Tone</span><p style="margin: 4px 0 0; color: #e5e5e5; font-size: 14px;">${result.creativeSummary.emotionalTone}</p></div>` : ''}
                            </div>
                            ${result.creativeSummary.keyMessage ? `<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.05);"><span style="color: #71717a; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Key Message</span><p style="margin: 4px 0 0; color: #10b981; font-size: 14px; font-weight: 500;">"${result.creativeSummary.keyMessage}"</p></div>` : ''}
                        </div>
                    ` : ''}
                    
                    ${result.hookAnalysis ? `
                        <div class="cav-result-section" style="background: #252525; border-radius: 12px; padding: 16px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.05);">
                            <h4 style="margin: 0 0 12px; color: #fff; font-size: 0.9375rem; font-weight: 600; display: flex; align-items: center; gap: 8px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12l2 2 4-4"/></svg>Hook Analysis</h4>
                            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 12px;">
                                <div style="background: ${result.hookAnalysis.score >= 70 ? 'rgba(16,185,129,0.15)' : result.hookAnalysis.score >= 50 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)'}; padding: 12px 20px; border-radius: 10px; text-align: center;">
                                    <div style="font-size: 28px; font-weight: 700; color: ${result.hookAnalysis.score >= 70 ? '#10b981' : result.hookAnalysis.score >= 50 ? '#f59e0b' : '#ef4444'};">${result.hookAnalysis.score}</div>
                                    <div style="font-size: 11px; color: #71717a; text-transform: uppercase;">Score</div>
                                </div>
                                ${result.hookAnalysis.thumbStopPotential ? `
                                    <div style="background: rgba(139,92,246,0.15); padding: 8px 14px; border-radius: 8px;">
                                        <span style="color: #a78bfa; font-size: 0.75rem; font-weight: 600;">${result.hookAnalysis.thumbStopPotential.toUpperCase()} Thumb-Stop</span>
                                    </div>
                                ` : ''}
                            </div>
                            <p style="margin: 0 0 8px; color: #e5e5e5; font-size: 14px;"><strong style="color: #a78bfa;">Attention Grabber:</strong> ${result.hookAnalysis.element || 'N/A'}</p>
                            <p style="margin: 0; color: #a1a1aa; font-size: 13px;">${result.hookAnalysis.effectiveness || ''}</p>
                        </div>
                    ` : ''}
                    
                    ${result.visualStrategy ? `
                        <div class="cav-result-section" style="background: #252525; border-radius: 12px; padding: 16px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.05);">
                            <h4 style="margin: 0 0 12px; color: #fff; font-size: 0.9375rem; font-weight: 600; display: flex; align-items: center; gap: 8px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f472b6" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="8" r="1.5"/><circle cx="8" cy="12" r="1.5"/><circle cx="16" cy="12" r="1.5"/><circle cx="12" cy="16" r="1.5"/></svg>Visual Strategy</h4>
                            <div style="display: flex; flex-wrap: wrap; gap: 16px;">
                                ${result.visualStrategy.colors?.length ? `
                                    <div>
                                        <span style="color: #71717a; font-size: 11px; text-transform: uppercase; display: block; margin-bottom: 6px;">Color Palette</span>
                                        <div style="display: flex; gap: 4px;">
                                            ${result.visualStrategy.colors.slice(0, 5).map(c => `<div style="width: 28px; height: 28px; background: ${c}; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);" title="${c}"></div>`).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                                ${result.visualStrategy.imageryApproach ? `<div><span style="color: #71717a; font-size: 11px; text-transform: uppercase; display: block; margin-bottom: 4px;">Style</span><span style="color: #e5e5e5; font-size: 14px;">${result.visualStrategy.imageryApproach}</span></div>` : ''}
                                ${result.visualStrategy.colorMood ? `<div><span style="color: #71717a; font-size: 11px; text-transform: uppercase; display: block; margin-bottom: 4px;">Mood</span><span style="color: #e5e5e5; font-size: 14px;">${result.visualStrategy.colorMood}</span></div>` : ''}
                                ${result.visualStrategy.qualityScore ? `<div><span style="color: #71717a; font-size: 11px; text-transform: uppercase; display: block; margin-bottom: 4px;">Quality</span><span style="color: #10b981; font-size: 14px; font-weight: 600;">${result.visualStrategy.qualityScore}/100</span></div>` : ''}
                            </div>
                            ${result.visualStrategy.composition ? `<p style="margin: 12px 0 0; color: #a1a1aa; font-size: 13px;"><strong style="color: #71717a;">Composition:</strong> ${result.visualStrategy.composition}</p>` : ''}
                        </div>
                    ` : ''}
                    
                    ${result.ctaEvaluation ? `
                        <div class="cav-result-section" style="background: #252525; border-radius: 12px; padding: 16px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.05);">
                            <h4 style="margin: 0 0 12px; color: #fff; font-size: 15px; display: flex; align-items: center; gap: 8px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg> CTA Evaluation</h4>
                            ${result.ctaEvaluation.text ? `<p style="margin: 0 0 12px; color: #10b981; font-size: 16px; font-weight: 600;">"${result.ctaEvaluation.text}"</p>` : '<p style="margin: 0 0 12px; color: #71717a;">No CTA detected</p>'}
                            <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                                <div style="flex: 1; min-width: 100px;">
                                    <span style="color: #71717a; font-size: 11px; text-transform: uppercase; display: block; margin-bottom: 4px;">Clarity</span>
                                    <div style="background: #1a1a1a; border-radius: 6px; height: 8px; overflow: hidden;"><div style="width: ${result.ctaEvaluation.clarity || 0}%; height: 100%; background: linear-gradient(90deg, #ec4899, #8b5cf6);"></div></div>
                                    <span style="color: #e5e5e5; font-size: 13px;">${result.ctaEvaluation.clarity || 0}/100</span>
                                </div>
                                <div style="flex: 1; min-width: 100px;">
                                    <span style="color: #71717a; font-size: 11px; text-transform: uppercase; display: block; margin-bottom: 4px;">Urgency</span>
                                    <div style="background: #1a1a1a; border-radius: 6px; height: 8px; overflow: hidden;"><div style="width: ${result.ctaEvaluation.urgency || 0}%; height: 100%; background: linear-gradient(90deg, #f59e0b, #ef4444);"></div></div>
                                    <span style="color: #e5e5e5; font-size: 13px;">${result.ctaEvaluation.urgency || 0}/100</span>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${result.platformOptimization?.bestPlatforms?.length || result.platformOptimization?.platformScores ? `
                        <div class="cav-result-section" style="background: #252525; border-radius: 12px; padding: 16px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.05);">
                            <h4 style="margin: 0 0 12px; color: #fff; font-size: 15px; display: flex; align-items: center; gap: 8px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> Platform Fit</h4>
                            ${result.platformOptimization.platformScores ? `
                                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;">
                                    ${Object.entries(result.platformOptimization.platformScores).map(([platform, score]) => `
                                        <div style="background: ${score >= 70 ? 'rgba(16,185,129,0.15)' : score >= 50 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)'}; padding: 8px 14px; border-radius: 8px;">
                                            <span style="color: ${score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'}; font-size: 13px; font-weight: 600;">${platform.charAt(0).toUpperCase() + platform.slice(1)}: ${score}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                            ${result.platformOptimization.improvements?.length ? `
                                <div style="margin-top: 8px;">
                                    <span style="color: #71717a; font-size: 11px; text-transform: uppercase;">Optimization Tips:</span>
                                    <ul style="margin: 6px 0 0; padding-left: 16px; color: #a1a1aa; font-size: 13px;">
                                        ${result.platformOptimization.improvements.map(i => `<li style="margin-bottom: 4px;">${i}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}
                    
                    ${result.strengths?.length || result.improvements?.length ? `
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px; margin-bottom: 12px;">
                            ${result.strengths?.length ? `
                                <div style="background: rgba(16,185,129,0.08); border-radius: 12px; padding: 16px; border: 1px solid rgba(16,185,129,0.2);">
                                    <h4 style="margin: 0 0 10px; color: #10b981; font-size: 14px; font-weight: 600;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><polyline points="20 6 9 17 4 12"/></svg> Strengths</h4>
                                    <ul style="margin: 0; padding-left: 16px; color: #a1a1aa; font-size: 13px; line-height: 1.6;">
                                        ${result.strengths.map(s => `<li style="margin-bottom: 4px;">${s}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                            ${result.improvements?.length ? `
                                <div style="background: rgba(245,158,11,0.08); border-radius: 12px; padding: 16px; border: 1px solid rgba(245,158,11,0.2);">
                                    <h4 style="margin: 0 0 10px; color: #f59e0b; font-size: 14px; font-weight: 600;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2v1"/><path d="M12 22V12"/><path d="M12 12a4 4 0 1 0 0-8"/></svg> Improvements</h4>
                                    <ul style="margin: 0; padding-left: 16px; color: #a1a1aa; font-size: 13px; line-height: 1.6;">
                                        ${result.improvements.map(i => `<li style="margin-bottom: 4px;">${i}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}
                    
                    ${result.takeaways?.length ? `
                        <div class="cav-result-section" style="background: linear-gradient(135deg, rgba(139,92,246,0.1), rgba(236,72,153,0.1)); border-radius: 12px; padding: 16px; margin-bottom: 12px; border: 1px solid rgba(139,92,246,0.2);">
                            <h4 style="margin: 0 0 12px; color: #a78bfa; font-size: 15px; display: flex; align-items: center; gap: 8px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> Key Takeaways</h4>
                            <ul style="margin: 0; padding-left: 20px; color: #e5e5e5; font-size: 14px; line-height: 1.7;">
                                ${result.takeaways.map(t => `<li style="margin-bottom: 6px;">${t}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${result.comparisonResult && !result.comparisonResult.error ? `
                        <div class="cav-comparison-results">
                            <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:6px;vertical-align:middle;"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>Creative Comparison Results</h3>
                            <div class="cav-comparison-score">
                                <div class="cav-big-score ${result.comparisonResult.overallScore >= 70 ? 'good' : result.comparisonResult.overallScore >= 50 ? 'medium' : 'low'}">
                                    ${result.comparisonResult.overallScore}
                                </div>
                                <span>Overall Competitive Score</span>
                            </div>
                            
                            ${result.comparisonResult.strengths?.length ? `
                                <div class="cav-comparison-section cav-strengths">
                                    <h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Your Strengths</h4>
                                    <ul>
                                        ${result.comparisonResult.strengths.map(s => `<li>${s}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                            
                            ${result.comparisonResult.improvements?.length ? `
                                <div class="cav-comparison-section cav-improvements">
                                    <h4><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:6px;vertical-align:middle;"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>Areas for Improvement</h4>
                                    <ul>
                                        ${result.comparisonResult.improvements.map(i => `<li>${i}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                            
                            ${result.comparisonResult.detailedComparison ? `
                                <div class="cav-detailed-comparison">
                                    <h4>Detailed Breakdown</h4>
                                    <div class="cav-comparison-grid">
                                        ${Object.entries(result.comparisonResult.detailedComparison).map(([key, val]) => `
                                            <div class="cav-comparison-item">
                                                <span class="cav-comparison-label">${key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                <div class="cav-comparison-bar">
                                                    <div class="cav-comparison-fill ${val.score >= 70 ? 'good' : val.score >= 50 ? 'medium' : 'low'}" style="width: ${val.score}%"></div>
                                                    <span>${val.score}/100</span>
                                                </div>
                                                <p class="cav-comparison-notes">${val.notes}</p>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}
                </div>
            `;
        }

        attachURLResultHandlers(container, result) {
            container.querySelector('#save-to-swipe')?.addEventListener('click', () => {
                this.saveToSwipeFile({
                    source: 'url',
                    sourceUrl: result.url,
                    analysis: result,
                    tags: [result.urlType],
                    notes: result.creativeSummary?.keyMessage || ''
                });
                
                alert('Saved to Swipe File!');
            });
        }

        renderCompetitorAnalysisResult(result) {
            if (result.error) {
                return `<div class="cav-error"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>${result.error}</div>`;
            }

            return `
                <div class="cav-competitor-result">
                    <h3>Competitor Analysis: ${result.competitorName}</h3>
                    
                    ${result.insights ? `
                        <div class="cav-comp-insights">
                            ${result.insights.advertisingChannels?.length ? `
                                <div class="cav-insight-section">
                                    <h4>Advertising Channels</h4>
                                    <div class="cav-tags">${result.insights.advertisingChannels.map(c => `<span class="cav-tag">${c}</span>`).join('')}</div>
                                </div>
                            ` : ''}
                            
                            ${result.insights.messageThemes?.length ? `
                                <div class="cav-insight-section">
                                    <h4>Message Themes</h4>
                                    <ul>${result.insights.messageThemes.map(t => `<li>${t}</li>`).join('')}</ul>
                                </div>
                            ` : ''}
                            
                            ${result.insights.opportunities?.length ? `
                                <div class="cav-insight-section cav-opportunities">
                                    <h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 4 12.9V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.1A7 7 0 0 1 12 2z"/></svg>Opportunities</h4>
                                    <ul>${result.insights.opportunities.map(o => `<li>${o}</li>`).join('')}</ul>
                                </div>
                            ` : ''}
                            
                            ${result.insights.recommendations?.length ? `
                                <div class="cav-insight-section">
                                    <h4>Recommendations</h4>
                                    <ul>${result.insights.recommendations.map(r => `<li>${r}</li>`).join('')}</ul>
                                </div>
                            ` : ''}
                        </div>
                    ` : '<p>No insights available. Make sure SearchAPI is configured.</p>'}
                </div>
            `;
        }

        filterSwipeFile(container, filters) {
            // Re-render just the swipe grid
            const entries = this.getSwipeFile(filters);
            const grid = container.querySelector('.cav-swipe-grid');
            if (grid) {
                // Simplified re-render of entries
            }
        }

        filterBestPractices(container) {
            const category = container.querySelector('#bp-category')?.value;
            const platform = container.querySelector('#bp-platform')?.value;
            const search = container.querySelector('#bp-search')?.value;
            
            const practices = this.getBestPractices({ category, platform, search });
            // Re-render practices list
        }

        parseJSON(content) {
            if (!content) return null;
            const match = content.match(/```json\s*([\s\S]*?)\s*```/);
            try {
                return JSON.parse(match ? match[1] : content);
            } catch {
                return null;
            }
        }
    }

    // ============================================
    // COMPETITOR CREATIVE COMPARISON (AI Intelligence Engine Integration)
    // ============================================

    LearnModule.prototype.compareCreatives = async function(ourAsset, ourAnalysis, competitors = []) {
        console.log('[Learn] Starting competitor creative comparison...');
        
        const comparison = {
            ourAsset: {
                id: ourAsset.id,
                filename: ourAsset.filename,
                overallScore: ourAnalysis?.strategicSynthesis?.overallScore || ourAnalysis?.hookAnalysis?.overallScore,
                hookScore: ourAnalysis?.hookAnalysis?.overallScore || ourAnalysis?.strategicSynthesis?.hookAnalysis?.score,
                ctaScore: ourAnalysis?.ctaAnalysis?.overallEffectiveness || ourAnalysis?.strategicSynthesis?.ctaAudit?.score
            },
            competitors: [],
            differentiators: {
                ourStrengths: [],
                ourWeaknesses: [],
                competitorPatterns: [],
                opportunities: [],
                threats: []
            },
            recommendations: [],
            analyzedAt: new Date().toISOString()
        };

        const orchestrator = window.AIOrchestrator;
        
        // Fetch competitor ad data via SearchAPI
        if (orchestrator?.isProviderAvailable('searchapi')) {
            for (const competitor of competitors.slice(0, 5)) {
                try {
                    const query = `${competitor} advertising creative examples Facebook Google Ads 2024 2025`;
                    const results = await orchestrator.searchWeb(query, 'competitor_ads');
                    
                    comparison.competitors.push({
                        name: competitor,
                        adsFound: results?.results?.length || 0,
                        topAds: results?.results?.slice(0, 5).map(r => ({
                            title: r.title,
                            url: r.url,
                            snippet: r.snippet
                        })) || [],
                        platforms: this.extractPlatformsFromResults(results?.results || [])
                    });
                } catch (e) {
                    console.warn(`[Learn] Failed to fetch competitor ${competitor}:`, e);
                }
            }
        }

        // Generate SWOT analysis using Claude
        if (orchestrator?.isProviderAvailable('claude') && comparison.competitors.length > 0) {
            const swotPrompt = `Perform a SWOT analysis comparing our creative against competitors.

OUR CREATIVE ANALYSIS:
${JSON.stringify(ourAnalysis?.strategicSynthesis || ourAnalysis, null, 2)}

COMPETITOR RESEARCH:
${JSON.stringify(comparison.competitors, null, 2)}

Provide a detailed competitive analysis:

1. OUR STRENGTHS: What does our creative do better than typical competitor ads?
2. OUR WEAKNESSES: Where do competitors outperform us based on their messaging patterns?
3. COMPETITOR PATTERNS: What common approaches are competitors using?
4. OPPORTUNITIES: Market gaps we can exploit
5. THREATS: Competitor strengths we need to address

Also provide 5 specific, actionable recommendations to improve our competitive position.

Return ONLY valid JSON:
{
    "swot": {
        "strengths": ["Specific strength 1", "Specific strength 2"],
        "weaknesses": ["Specific weakness 1", "Specific weakness 2"],
        "opportunities": ["Market opportunity 1", "Market opportunity 2"],
        "threats": ["Competitive threat 1", "Competitive threat 2"]
    },
    "competitorPatterns": [
        { "pattern": "Pattern name", "prevalence": "high|medium|low", "effectiveness": "high|medium|low" }
    ],
    "recommendations": [
        { "action": "Specific action", "impact": "high|medium|low", "effort": "high|medium|low", "rationale": "Why this matters" }
    ],
    "marketPositioning": {
        "currentPosition": "Description of where we stand",
        "targetPosition": "Where we should aim",
        "differentiator": "Our unique value proposition"
    }
}`;

            try {
                const result = await orchestrator.callClaude(swotPrompt, { temperature: 0.4 });
                const swotData = this.parseJSON(result.content);
                
                if (swotData) {
                    comparison.differentiators = {
                        ourStrengths: swotData.swot?.strengths || [],
                        ourWeaknesses: swotData.swot?.weaknesses || [],
                        competitorPatterns: swotData.competitorPatterns || [],
                        opportunities: swotData.swot?.opportunities || [],
                        threats: swotData.swot?.threats || []
                    };
                    comparison.recommendations = swotData.recommendations || [];
                    comparison.marketPositioning = swotData.marketPositioning;
                }
            } catch (e) {
                console.warn('[Learn] SWOT analysis failed:', e);
            }
        }

        // Save to history
        this.saveComparisonToHistory(comparison);

        return comparison;
    };

    LearnModule.prototype.extractPlatformsFromResults = function(results) {
        const platforms = new Set();
        results.forEach(r => {
            const text = (r.title + ' ' + r.snippet).toLowerCase();
            if (text.includes('facebook') || text.includes('meta')) platforms.add('Facebook');
            if (text.includes('instagram')) platforms.add('Instagram');
            if (text.includes('tiktok')) platforms.add('TikTok');
            if (text.includes('youtube')) platforms.add('YouTube');
            if (text.includes('linkedin')) platforms.add('LinkedIn');
            if (text.includes('google ads') || text.includes('display')) platforms.add('Google Ads');
            if (text.includes('twitter') || text.includes(' x ')) platforms.add('Twitter/X');
        });
        return Array.from(platforms);
    };

    LearnModule.prototype.saveComparisonToHistory = function(comparison) {
        try {
            const key = `${getLearnStoragePrefix()}competitor_comparisons`;
            const history = JSON.parse(localStorage.getItem(key) || '[]');
            history.unshift(comparison);
            if (history.length > 20) history.pop();
            localStorage.setItem(key, JSON.stringify(history));
        } catch (e) {
            console.warn('[Learn] Failed to save comparison:', e);
        }
    };

    LearnModule.prototype.getComparisonHistory = function() {
        try {
            const key = `${getLearnStoragePrefix()}competitor_comparisons`;
            return JSON.parse(localStorage.getItem(key) || '[]');
        } catch {
            return [];
        }
    };

    // ============================================
    // BENCHMARK INTEGRATION WITH AI ENGINE
    // ============================================

    LearnModule.prototype.getIndustryBenchmarks = async function(industry, platform = null) {
        const orchestrator = window.AIOrchestrator;
        if (!orchestrator?.isProviderAvailable('searchapi')) {
            return this.getBenchmark(null, platform); // Fallback to cached benchmarks
        }

        const query = platform 
            ? `${industry} ${platform} advertising benchmarks CTR CPM engagement 2024 2025`
            : `${industry} advertising benchmarks CTR CPM engagement rate 2024 2025`;

        try {
            const results = await orchestrator.searchWeb(query, 'benchmark_research');
            
            const benchmarks = {
                industry,
                platform,
                ctr: { average: null, good: null, excellent: null },
                cpm: { low: null, average: null, high: null },
                engagementRate: { average: null, good: null },
                sources: [],
                fetchedAt: new Date().toISOString()
            };

            // Extract numeric benchmarks from search results
            results?.results?.forEach(r => {
                const text = (r.snippet || '') + ' ' + (r.title || '');
                
                // CTR extraction
                const ctrMatch = text.match(/(\d+\.?\d*)%?\s*(?:CTR|click.through)/i);
                if (ctrMatch && !benchmarks.ctr.average) {
                    benchmarks.ctr.average = parseFloat(ctrMatch[1]);
                }
                
                // CPM extraction
                const cpmMatch = text.match(/\$?(\d+\.?\d*)\s*CPM/i);
                if (cpmMatch && !benchmarks.cpm.average) {
                    benchmarks.cpm.average = parseFloat(cpmMatch[1]);
                }

                // Engagement rate
                const engMatch = text.match(/(\d+\.?\d*)%?\s*engagement/i);
                if (engMatch && !benchmarks.engagementRate.average) {
                    benchmarks.engagementRate.average = parseFloat(engMatch[1]);
                }

                benchmarks.sources.push({
                    title: r.title,
                    url: r.url
                });
            });

            // Cache these benchmarks
            this.cacheBenchmark(industry, platform, benchmarks);

            return benchmarks;

        } catch (e) {
            console.warn('[Learn] Benchmark fetch failed:', e);
            return this.getBenchmark(null, platform);
        }
    };

    LearnModule.prototype.cacheBenchmark = function(industry, platform, benchmarks) {
        try {
            const key = `${getLearnStoragePrefix()}benchmark_${industry}_${platform || 'all'}`;
            localStorage.setItem(key, JSON.stringify(benchmarks));
        } catch (e) {
            // Cache full, continue
        }
    };

    // ============================================
    // LEGAL/COMPLIANCE FLAGS
    // ============================================

    LearnModule.prototype.checkComplianceRequirements = async function(asset, analysis) {
        const orchestrator = window.AIOrchestrator;
        if (!orchestrator?.isProviderAvailable('claude')) {
            return { available: false, message: 'Claude not configured for compliance check' };
        }

        const prompt = `Analyze this creative asset for advertising compliance requirements.

Visual Elements Detected:
${JSON.stringify(analysis?.visualExtraction || {}, null, 2)}

Check for:
1. **Disclaimer Requirements**: Does this need disclaimers? (testimonials, results claims, financial products, healthcare, alcohol, gambling)
2. **Testimonial Disclosures**: If there's a testimonial, does it need "Results not typical" or similar?
3. **Platform Policy Risks**: Any elements that might violate Meta, Google, TikTok, or LinkedIn ad policies?
4. **Legal Considerations**: Trademark usage, copyright concerns, model release needs?
5. **Industry-Specific**: FDA, FTC, SEC, or other regulatory considerations?

Return ONLY valid JSON:
{
    "overallRisk": "low|medium|high",
    "disclaimerNeeded": true,
    "disclaimerType": ["results_claim", "testimonial"],
    "suggestedDisclaimer": "Results may vary. Individual results not guaranteed.",
    "platformRisks": [
        { "platform": "Meta", "risk": "low|medium|high", "issue": "Description", "recommendation": "Action" }
    ],
    "legalConsiderations": [],
    "industryRegulations": [],
    "recommendations": ["Action 1", "Action 2"]
}`;

        try {
            const result = await orchestrator.callClaude(prompt, { temperature: 0.2 });
            return this.parseJSON(result.content);
        } catch (e) {
            console.warn('[Learn] Compliance check failed:', e);
            return { available: false, error: e.message };
        }
    };

    // ============================================
    // INITIALIZE & EXPORT
    // ============================================

    const learnModule = new LearnModule();

    window.CAVLearn = {
        module: learnModule,
        render: (container) => learnModule.render(container),
        analyzeURL: (url) => learnModule.analyzeURL(url),
        analyzeCompetitorAds: (competitorId) => learnModule.analyzeCompetitorAds(competitorId),
        updateBestPractices: () => learnModule.updateBestPractices(),
        updateBenchmarks: () => learnModule.updateBenchmarks(),
        saveToSwipeFile: (entry) => learnModule.saveToSwipeFile(entry),
        getSwipeFile: (filters) => learnModule.getSwipeFile(filters),
        getBestPractices: (filters) => learnModule.getBestPractices(filters),
        getBenchmark: (metric, platform) => learnModule.getBenchmark(metric, platform),
        checkLandingPageSync: (asset, url) => learnModule.checkLandingPageSync(asset, url),
        
        // Competitor detection
        autoFetchCompetitors: (brandName, industry) => learnModule.autoFetchCompetitors(brandName, industry),
        reinitialize: () => learnModule.reinitialize(),
        
        // NEW: Competitor Creative Comparison
        compareCreatives: (asset, analysis, competitors) => learnModule.compareCreatives(asset, analysis, competitors),
        getComparisonHistory: () => learnModule.getComparisonHistory(),
        
        // NEW: Industry Benchmarks with AI
        getIndustryBenchmarks: (industry, platform) => learnModule.getIndustryBenchmarks(industry, platform),
        
        // NEW: Compliance Checking
        checkCompliance: (asset, analysis) => learnModule.checkComplianceRequirements(asset, analysis)
    };

    console.log(`📚 Learn Module loaded - Version ${LEARN_VERSION}`);
    console.log('   Features: URL Analyzer, Swipe File, Best Practices, Benchmarks, Competitors');
    console.log('   v3.0.7: Auto-save, benchmark extraction, competitor detection, CRM linking');
    console.log('   v4.0: Competitor creative comparison, industry benchmarks, compliance checking');

})();

