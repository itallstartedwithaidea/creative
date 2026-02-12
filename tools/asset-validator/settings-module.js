/**
 * Settings Module - Creative Asset Validator v5.11.0
 * API Key Management for Claude, OpenAI, SearchAPI, and Gemini
 * Secure local storage with encryption and connection testing
 * Updated: January 16, 2026 - Fixed API Key Sharing
 */

(function() {
    'use strict';

    // ============================================
    // SETTINGS CONFIGURATION
    // ============================================
    
    const SETTINGS_VERSION = '5.11.0'; // Updated January 16, 2026
    const STORAGE_KEY = 'cav_v3_settings';
    const ENCRYPTION_KEY = 'cav_secure_2024';

    // API Key Access Control Storage
    const API_ACCESS_STORAGE_KEY = 'cav_api_access_control';
    const API_USAGE_STORAGE_KEY = 'cav_api_usage_stats';

    // SVG Icons for consistent styling
    const ICONS = {
        settings: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
        key: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`,
        cpu: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`,
        sparkles: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>`,
        palette: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/></svg>`,
        eye: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
        bell: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,
        database: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
        brain: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>`,
        search: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
        lock: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
        unlock: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`,
        shield: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
        check: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
        x: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
        chart: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>`,
        upload: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
        download: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
        link: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
        users: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
        user: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
        save: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
        plus: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
        trash: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
        edit: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
        plug: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/></svg>`,
        refresh: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>`,
        google: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`,
        openai: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/></svg>`,
        globe: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
        // Brand icons for Integration API Keys section
        dropbox: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 2L0 6.19l6 4.19 6.02-4.19L6 2zm12 0l-6.02 4.19L18 10.38l6-4.19L18 2zM0 14.57l6 4.19 6.02-4.19L6 10.38 0 14.57zm18-4.19l-6.02 4.19 6.02 4.19 6-4.19-6-4.19zM6.04 16.11l6.02 4.19 6.02-4.19-6.02-4.18-6.02 4.18z"/></svg>`,
        slack: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/></svg>`,
        onedrive: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10.5 18.5c-1.52 0-2.88-.61-3.87-1.6l7.64-4.41c.38.11.77.18 1.18.21l-4.95 5.8zm3.7-6.92l-7.42 4.29c-.14-.35-.23-.72-.23-1.12 0-1.66 1.34-3 3-3 .36 0 .71.06 1.03.18l3.62-2.09c-.06.24-.1.49-.1.74 0 .35.04.69.1 1zM19 12c0-.17-.02-.33-.03-.5l-4.6 2.66c.24.52.38 1.1.38 1.72 0 .41-.07.81-.19 1.18L19 14.2c0-.06.02-.13.02-.2-.01-1.1-.02-2-.02-2zm-5.76-1.47l-3.4 1.96c.22-.57.66-1.04 1.22-1.32-.07-.46-.11-.93-.11-1.42 0-3.04 2.46-5.5 5.5-5.5.74 0 1.44.15 2.09.41-.66-1.94-2.47-3.34-4.59-3.34-2.21 0-4.06 1.5-4.64 3.53-.18-.02-.35-.03-.53-.03-2.76 0-5 2.24-5 5 0 .49.08.96.2 1.41l4.9-2.83c.5-.99 1.32-1.78 2.31-2.27-.06.37-.1.75-.1 1.13 0 1.13.33 2.18.89 3.07l1.26-.8z"/></svg>`,
        figma: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zM8.148 24c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v4.441c0 2.503-2.047 4.539-4.588 4.539zm-.001-7.509a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.365 3.019 3.019 3.019 1.665 0 3.019-1.355 3.019-3.019v-3.019H8.147zM8.148 8.981c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981H8.148zm-.001-7.51a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.355 3.019 3.019 3.019h3.117V1.471H8.147zM8.148 15.02c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.981H8.148zm3.117-7.51H8.147a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.355 3.019 3.019 3.019h3.117V7.51zM15.852 15.02c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49 4.49 2.014 4.49 4.49-2.014 4.49-4.49 4.49zm0-7.509a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.355 3.019 3.019 3.019s3.019-1.355 3.019-3.019-1.354-3.019-3.019-3.019z"/></svg>`,
        adobe: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13.966 22.624l-1.69-4.281H8.122l3.892-9.144 5.662 13.425h-3.71zm-6.734 0H0L9.619 2.624l4.247 10.028-6.634 9.972zM24 2.624l-6.734 17.438H24l-9.619-20H24v2.562z"/></svg>`,
        cloud: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`,
        folder: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>`,
        chat: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`
    };

    // Default settings structure
    const DEFAULT_SETTINGS = {
        version: SETTINGS_VERSION,
        apiKeys: {
            claude: { key: '', model: 'claude-sonnet-4-5-20250929', status: 'untested', lastTested: null },
            openai: { key: '', orgId: '', model: 'gpt-5.2-2025-12-11', status: 'untested', lastTested: null },
            searchapi: { key: '', status: 'untested', lastTested: null },
            gemini: { key: '', model: 'gemini-3-flash-preview', status: 'untested', lastTested: null },
            googleVision: { key: '', status: 'untested', lastTested: null }
        },
        modelConfig: {
            claudeModel: 'claude-sonnet-4-5-20250929',
            openaiVisionModel: 'gpt-5.2-2025-12-11',
            analysisTemperature: 0.3,
            creativeTemperature: 0.7,
            maxTokens: 8192
        },
        features: {
            enableAIAnalysis: true,
            enableWebResearch: true,
            enablePerformancePredictions: true,
            enableCompetitorMonitoring: true,
            enableAutoLearning: true,
            showConfidenceScores: true
        },
        brandProfiles: [],
        competitors: [],
        notifications: {
            email: { enabled: false, address: '' },
            slack: { enabled: false, webhookUrl: '' },
            alertFrequency: 'immediate'
        },
        updatedAt: null
    };

    // API Endpoints
    const API_ENDPOINTS = {
        claude: 'https://api.anthropic.com/v1/messages',
        openai: 'https://api.openai.com/v1/chat/completions',
        searchapi: 'https://www.searchapi.io/api/v1/search',
        gemini: 'https://generativelanguage.googleapis.com/v1beta/models'
    };

    // ============================================
    // SETTINGS MANAGER CLASS
    // ============================================

    class SettingsManager {
        constructor() {
            this.settings = this.loadSettings();
            this.listeners = [];
            this.userEmail = null;
            this.apiKeysLoaded = false;
            
            // Immediately try to set userEmail from session if available
            this.initUserEmail();
            
            // Consolidate keys from ALL storage locations (legacy, user-specific, etc.)
            this.consolidateAllApiKeys();
            
            // Load user-specific API keys from IndexedDB
            this.loadUserApiKeys();
            
            // Sync existing Gemini key to legacy storage locations on startup
            this.syncGeminiKeyToLegacy();
            
            // Load platform credentials from backend (for team members)
            this.loadPlatformCredentialsFromBackend();
            
            // Also sync from UnifiedStorage if available (cross-device keys)
            this.loadFromUnifiedStorage();
            
            // Load directly from Supabase (most reliable for cross-device)
            this.loadFromSupabase();
            
            // Load Cloudinary credentials from Supabase
            this.loadCloudinaryFromSupabase();
        }
        
        // Load API keys directly from Supabase
        async loadFromSupabase() {
            // Wait for Supabase to be ready
            let attempts = 0;
            const checkSupabase = async () => {
                attempts++;
                if (!window.CAVSupabase?.getClient) {
                    if (attempts < 10) {
                        setTimeout(checkSupabase, 1000);
                    }
                    return;
                }
                
                try {
                    const supabase = window.CAVSupabase.getClient();
                    if (!supabase) return;
                    
                    // Get user email from session (works with Google Sign-In)
                    const userEmail = this.userEmail || 
                                     window.cavUserSession?.email || 
                                     window.CAVSecurity?.SecureSessionManager?.getSession()?.email;
                    
                    if (!userEmail) {
                        console.log('[Settings] No user email, skipping Supabase key load');
                        return;
                    }
                    
                    console.log('[Settings] Loading API keys from Supabase for:', userEmail);
                    
                    // Load API keys from user_api_keys table (using user_email since auth.uid() is NULL)
                    const { data: keys, error } = await supabase
                        .from('user_api_keys')
                        .select('provider, key, encrypted_key, is_active')
                        .eq('user_email', userEmail)
                        .eq('is_active', true);
                    
                    if (error) {
                        console.warn('[Settings] Supabase API keys load error:', error.message);
                        // Try fallback to api_keys table
                        const { data: fallbackKeys, error: fallbackError } = await supabase
                            .from('api_keys')
                            .select('provider, key, encrypted_key, is_active')
                            .eq('user_email', userEmail)
                            .eq('is_active', true);
                        
                        if (!fallbackError && fallbackKeys && fallbackKeys.length > 0) {
                            this.processLoadedKeys(fallbackKeys);
                        }
                        return;
                    }
                    
                    if (keys && keys.length > 0) {
                        this.processLoadedKeys(keys);
                    }
                    
                    // Also load shared keys from shared_api_keys
                    await this.loadSharedKeysFromSupabase(supabase, userEmail);
                    
                } catch (e) {
                    console.warn('[Settings] Supabase load error:', e);
                }
            };
            
            checkSupabase();
        }
        
        // Process loaded keys from Supabase
        processLoadedKeys(keys) {
            console.log(`[Settings] ☁️ Processing ${keys.length} API keys from Supabase`);
            
            for (const keyData of keys) {
                const provider = keyData.provider;
                // Use 'key' column first (new schema), fall back to 'encrypted_key' (old schema)
                const key = keyData.key || keyData.encrypted_key;
                
                if (key && key.length >= 10 && this.settings.apiKeys[provider]) {
                    // Only update if we don't already have a key
                    if (!this.settings.apiKeys[provider].key) {
                        this.settings.apiKeys[provider].key = key;
                        this.settings.apiKeys[provider].status = 'active';
                        this.settings.apiKeys[provider].source = 'supabase';
                        
                        // Also save to legacy locations
                        localStorage.setItem(`cav_${provider}_api_key`, key);
                        if (provider === 'gemini') {
                            localStorage.setItem('cav_ai_api_key', key);
                            localStorage.setItem('cav_gemini_api_key', key);
                        }
                        
                        console.log(`🔑 [Settings] Loaded ${provider} key from Supabase`);
                    }
                }
            }
            
            // Save to localStorage so it's available immediately next time
            this.saveSettings();
            
            // Notify listeners
            this.notifyListeners('apiKeysLoaded', this.settings.apiKeys);
        }
        
        // Load shared keys from Supabase
        async loadSharedKeysFromSupabase(supabase, userEmail) {
            try {
                const userDomain = userEmail.split('@')[1];
                
                // Load shared keys - the table stores keys in encrypted_keys JSONB
                // Schema: organization_id, encrypted_keys (JSONB), is_global_share, allowed_domains (array)
                const { data: sharedKeyRows, error } = await supabase
                    .from('shared_api_keys')
                    .select('encrypted_keys, is_global_share, allowed_domains, organization_id')
                    .or(`allowed_domains.cs.{${userDomain}},is_global_share.eq.true`);
                
                if (!error && sharedKeyRows && sharedKeyRows.length > 0) {
                    console.log(`[Settings] ☁️ Found ${sharedKeyRows.length} shared API key rows`);
                    
                    for (const row of sharedKeyRows) {
                        const encryptedKeys = row.encrypted_keys || {};
                        const isGlobal = row.is_global_share;
                        
                        // encrypted_keys is a JSONB object: { provider: key, ... }
                        for (const [provider, key] of Object.entries(encryptedKeys)) {
                            // Only use shared key if user doesn't have their own
                            if (key && key.length >= 10 && this.settings.apiKeys[provider] && !this.settings.apiKeys[provider].key) {
                                this.settings.apiKeys[provider].key = key;
                                this.settings.apiKeys[provider].status = 'active';
                                this.settings.apiKeys[provider].source = isGlobal ? 'global_shared' : 'domain_shared';
                                
                                // Also save to legacy locations
                                localStorage.setItem(`cav_${provider}_api_key`, key);
                                
                                console.log(`🔑 [Settings] Loaded shared ${provider} key (${isGlobal ? 'global' : 'domain'})`);
                            }
                        }
                    }
                    
                    this.saveSettings();
                }
            } catch (e) {
                console.warn('[Settings] Shared keys load error:', e);
            }
        }
        
        // Load keys from UnifiedStorage (Supabase cross-device sync)
        async loadFromUnifiedStorage() {
            if (!window.UnifiedStorage?.getAPIKey) {
                // Retry after UnifiedStorage initializes
                setTimeout(() => this.loadFromUnifiedStorage(), 2000);
                return;
            }
            
            const providers = ['claude', 'openai', 'searchapi', 'gemini', 'googleVision'];
            
            for (const provider of providers) {
                // Skip if already has a key
                if (this.settings.apiKeys[provider]?.key) continue;
                
                try {
                    const result = await window.UnifiedStorage.getAPIKey(provider);
                    if (result?.key && result.key.length >= 10) {
                        this.settings.apiKeys[provider].key = result.key;
                        console.log(`🔑 Settings: Loaded ${provider} key from UnifiedStorage (source: ${result.source})`);
                        
                        // Also save to legacy locations
                        localStorage.setItem(`cav_${provider}_api_key`, result.key);
                        if (provider === 'gemini') {
                            localStorage.setItem('cav_ai_api_key', result.key);
                            localStorage.setItem('cav_gemini_api_key', result.key);
                        }
                    }
                } catch (e) {
                    // Ignore errors for individual providers
                }
            }
            
            // Notify listeners that keys are loaded
            this.notifyListeners('apiKeysLoaded', this.settings.apiKeys);
        }
        
        // Immediately set userEmail if session is available
        initUserEmail() {
            this.userEmail = this.getCurrentUserEmail();
            if (this.userEmail) {
                console.log('🔑 Settings: User email initialized immediately:', this.userEmail);
            }
        }
        
        // Always get fresh user email from current session - ROBUST multi-source check
        getCurrentUserEmail() {
            try {
                // 1. Check window.cavUserSession (set after Google Sign-In)
                if (window.cavUserSession?.email) {
                    this.userEmail = window.cavUserSession.email;
                    return this.userEmail;
                }
                
                // 2. Check CAVSecurity SecureSessionManager
                const secureSession = window.CAVSecurity?.SecureSessionManager?.getSession?.();
                if (secureSession?.email) {
                    this.userEmail = secureSession.email;
                    return this.userEmail;
                }
                
                // 3. Check localStorage cav_session
                try {
                    const cavSession = JSON.parse(localStorage.getItem('cav_session') || 'null');
                    if (cavSession?.email) {
                        this.userEmail = cavSession.email;
                        return this.userEmail;
                    }
                } catch (e) {}
                
                // 4. Check localStorage cav_user_session
                try {
                    const userSession = JSON.parse(localStorage.getItem('cav_user_session') || 'null');
                    if (userSession?.email) {
                        this.userEmail = userSession.email;
                        return this.userEmail;
                    }
                } catch (e) {}
                
                // 5. Check localStorage cav_auth_session
                try {
                    const authSession = JSON.parse(localStorage.getItem('cav_auth_session') || 'null');
                    if (authSession?.email) {
                        this.userEmail = authSession.email;
                        return this.userEmail;
                    }
                } catch (e) {}
                
                // 6. Check localStorage cav_secure_session_v3
                try {
                    const secureSession = JSON.parse(localStorage.getItem('cav_secure_session_v3') || 'null');
                    if (secureSession?.email) {
                        this.userEmail = secureSession.email;
                        return this.userEmail;
                    }
                } catch (e) {}
                
                // 7. Check localStorage cav_last_user_email
                const lastEmail = localStorage.getItem('cav_last_user_email');
                if (lastEmail && lastEmail !== 'anonymous') {
                    this.userEmail = lastEmail;
                    return this.userEmail;
                }
                
                this.userEmail = null;
                return null;
            } catch (e) {
                this.userEmail = null;
                return null;
            }
        }
        
        // Check if current user is super admin (for Integration API Keys section)
        isSuperAdmin() {
            const session = window.cavUserSession || window.CAVSecurity?.SecureSessionManager?.getSession?.();
            const email = session?.email?.toLowerCase() || '';
            // Check against AUTH_CONFIG admin emails
            const adminEmails = window.AUTH_CONFIG?.ADMIN_EMAILS || [];
            return adminEmails.some(adminEmail => email === adminEmail.toLowerCase());
        }
        
        // ============================================
        // PLATFORM CREDENTIALS (Super Admin Only)
        // ============================================
        
        getPlatformCredentials(readOnly = false) {
            // Super admin can always access
            // Team members can read (for shared keys) but not modify
            if (!this.isSuperAdmin() && !readOnly) return null;
            try {
                const stored = localStorage.getItem('cav_platform_credentials');
                return stored ? JSON.parse(stored) : null;
            } catch (e) {
                return null;
            }
        }
        
        // Get platform credentials for reading (any authenticated user)
        getSharedPlatformCredentials() {
            try {
                const stored = localStorage.getItem('cav_platform_credentials');
                return stored ? JSON.parse(stored) : null;
            } catch (e) {
                return null;
            }
        }
        
        savePlatformCredentials(credentials) {
            if (!this.isSuperAdmin()) {
                console.warn('[Settings] Only super admin can save platform credentials');
                return false;
            }
            try {
                localStorage.setItem('cav_platform_credentials', JSON.stringify(credentials));
                console.log('[Settings] Platform credentials saved to localStorage');
                
                // Sync to backend for cross-device/cross-user access
                this.syncPlatformCredentialsToBackend(credentials);
                
                return true;
            } catch (e) {
                console.error('[Settings] Failed to save platform credentials:', e);
                return false;
            }
        }
        
        // Sync platform credentials to backend for team members
        async syncPlatformCredentialsToBackend(credentials) {
            // PRIORITY 1: Use Supabase DIRECT save (no auth required)
            if (window.CAVSupabase?.isConfigured?.()) {
                try {
                    const sharedKeys = credentials.sharedKeys || {};
                    const orgId = credentials.sharing?.organizationId || 'default';
                    
                    // Use direct save - doesn't require Supabase authentication
                    const result = await window.CAVSupabase.saveSharedKeysDirect(sharedKeys, orgId);
                    
                    if (result.success) {
                        console.log('[Settings] ☁️ Platform credentials synced to Supabase cloud!');
                        return;
                    } else {
                        console.warn('[Settings] Supabase save failed:', result.error);
                    }
                } catch (e) {
                    console.warn('[Settings] Supabase sync failed, falling back to syncEngine:', e);
                }
            }
            
            // FALLBACK: Use local syncEngine
            if (!window.syncEngine) {
                console.warn('[Settings] No backend available for sync');
                return;
            }
            
            try {
                // Create a shareable config (exclude actual keys, only include sharing settings)
                const shareableConfig = {
                    uuid: 'platform_credentials_global',
                    setting_type: 'platform_credentials_global',
                    data: {
                        sharing: credentials.sharing || {},
                        sharedKeys: credentials.sharedKeys || {}, // Keys will be included for authorized users
                        adminEmail: this.userEmail || window.cavUserSession?.email,
                        updatedAt: new Date().toISOString()
                    }
                };
                
                await window.syncEngine.save('user_settings', shareableConfig);
                console.log('[Settings] Platform credentials synced to local backend');
            } catch (e) {
                console.warn('[Settings] Failed to sync platform credentials to backend:', e);
            }
        }
        
        // Load platform credentials from backend (for team members)
        async loadPlatformCredentialsFromBackend() {
            // PRIORITY 1: Use Supabase DIRECT load (no auth required)
            if (window.CAVSupabase?.isConfigured?.()) {
                try {
                    const orgId = 'default';
                    
                    // Use direct load - doesn't require Supabase authentication
                    const result = await window.CAVSupabase.loadSharedKeysDirect(orgId);
                    
                    if (result.success && result.keys && Object.keys(result.keys).length > 0) {
                        console.log('[Settings] ☁️ Loaded shared keys from Supabase cloud!');
                        console.log('[Settings] ☁️ Keys found:', Object.keys(result.keys).join(', '));
                        
                        // Merge with existing local credentials
                        const existing = JSON.parse(localStorage.getItem('cav_platform_credentials') || '{}');
                        const merged = {
                            ...existing,
                            sharing: { ...existing.sharing, enabled: true },
                            sharedKeys: { ...existing.sharedKeys, ...result.keys }
                        };
                        localStorage.setItem('cav_platform_credentials', JSON.stringify(merged));
                        console.log('[Settings] ☁️ Platform credentials merged from Supabase');
                        
                        // Subscribe to real-time updates (if auth is available)
                        try {
                            window.CAVSupabase.subscribeToSharedKeys(orgId, (newKeys) => {
                                console.log('[Settings] ☁️ Real-time key update received');
                                const current = JSON.parse(localStorage.getItem('cav_platform_credentials') || '{}');
                                current.sharedKeys = { ...current.sharedKeys, ...newKeys };
                                localStorage.setItem('cav_platform_credentials', JSON.stringify(current));
                            });
                        } catch (subErr) {
                            console.log('[Settings] Real-time subscription not available (requires auth)');
                        }
                        
                        return;
                    } else if (result.error) {
                        console.warn('[Settings] Supabase load issue:', result.error);
                    } else {
                        console.log('[Settings] No shared keys in Supabase yet');
                    }
                } catch (e) {
                    console.warn('[Settings] Supabase load failed:', e);
                }
            }
            
            // FALLBACK: Use local syncEngine
            if (!window.syncEngine) {
                // Retry after sync engine initializes
                setTimeout(() => this.loadPlatformCredentialsFromBackend(), 1000);
                return;
            }
            
            try {
                const userSettings = await window.syncEngine.getAllFromLocal('user_settings');
                const globalConfig = userSettings?.find(s => s.setting_type === 'platform_credentials_global');
                
                if (globalConfig?.data) {
                    console.log('[Settings] Loaded platform credentials from local backend');
                    
                    // Merge with existing (don't overwrite if admin)
                    if (!this.isSuperAdmin()) {
                        const existing = JSON.parse(localStorage.getItem('cav_platform_credentials') || '{}');
                        const merged = {
                            ...existing,
                            sharing: globalConfig.data.sharing || existing.sharing,
                            sharedKeys: globalConfig.data.sharedKeys || existing.sharedKeys
                        };
                        localStorage.setItem('cav_platform_credentials', JSON.stringify(merged));
                        console.log('[Settings] Platform credentials merged from local backend for team member');
                    }
                }
            } catch (e) {
                console.warn('[Settings] Failed to load platform credentials from backend:', e);
            }
        }
        
        // Get shared API key for non-super-admin users
        getSharedApiKey(provider) {
            const session = window.cavUserSession || window.CAVSecurity?.SecureSessionManager?.getSession?.();
            const currentEmail = session?.email?.toLowerCase() || '';
            
            // If user is super admin, they use their own keys
            if (this.isSuperAdmin()) {
                return null;
            }
            
            // --- NEW: Check API Access Control System (API Key Sharing UI) ---
            try {
                const apiAccessData = JSON.parse(localStorage.getItem('cav_api_access_control') || '{}');
                const sharedKeysConfig = apiAccessData.sharedKeys || {};
                const providerConfig = sharedKeysConfig[provider];
                
                // Check if sharing is enabled for this provider and user is allowed
                if (providerConfig && providerConfig.enabled) {
                    const allowedUsers = (providerConfig.allowedUsers || []).map(e => e.toLowerCase().trim());
                    const revokedUsers = (providerConfig.revokedUsers || []).map(e => e.toLowerCase().trim());
                    
                    // Check if user is explicitly revoked
                    if (revokedUsers.includes(currentEmail)) {
                        console.log(`[Settings] User ${currentEmail} is revoked from ${provider}`);
                        // Continue to check legacy system
                    } else if (allowedUsers.length === 0 || allowedUsers.includes(currentEmail)) {
                        // User is allowed - get admin's key
                        const adminEmail = apiAccessData.adminEmail;
                        if (adminEmail) {
                            // Get admin's settings
                            const adminStorageKey = `cav_v3_settings_${adminEmail.replace(/[^a-z0-9]/gi, '_')}`;
                            try {
                                const adminSettings = JSON.parse(localStorage.getItem(adminStorageKey) || '{}');
                                const adminKey = adminSettings.apiKeys?.[provider]?.key;
                                if (adminKey && adminKey.length >= 10) {
                                    console.log(`[Settings] ✅ Using shared ${provider} key from admin (${adminEmail})`);
                                    return adminKey;
                                }
                            } catch (e) {
                                console.warn(`[Settings] Failed to load admin settings for ${adminEmail}:`, e);
                            }
                        }
                    }
                }
            } catch (e) {
                console.warn('[Settings] Failed to check API access control:', e);
            }
            
            // --- LEGACY: Check old platform credentials system ---
            try {
                const platformCreds = this.getSharedPlatformCredentials() || {};
            const sharing = platformCreds.sharing || {};
                
                console.log('[Settings] Checking platform credentials for shared key:', provider, {
                    enabled: sharing.enabled,
                    globalUniversalShare: sharing.globalUniversalShare,
                    hasKeys: !!platformCreds.sharedKeys
                });
            
            if (!sharing.enabled) return null;
            
            // If global universal share is enabled, allow all authenticated users
            if (sharing.globalUniversalShare) {
                const sharedKeys = platformCreds.sharedKeys || {};
                    const key = sharedKeys[provider];
                    if (key) {
                        console.log(`[Settings] ✅ Found ${provider} key via Global Universal Share`);
                        return key;
                    }
                    return null;
            }
            
            // Check if current user is in allowed list (or allowed by domain)
            const allowedEmails = (sharing.allowedEmails || []).map(e => e.toLowerCase().trim());
            
            // If no emails specified, allow all
            if (allowedEmails.length === 0) {
                const sharedKeys = platformCreds.sharedKeys || {};
                return sharedKeys[provider] || null;
            }
            
            // Check for exact email match or domain match
            const userDomain = '@' + (currentEmail.split('@')[1] || '');
            const isAllowed = allowedEmails.some(entry => {
                if (entry.startsWith('@')) {
                    // Domain-based access: @company.com allows all @company.com users
                    return entry === userDomain;
                }
                return entry === currentEmail;
            });
            
                if (isAllowed) {
            const sharedKeys = platformCreds.sharedKeys || {};
            return sharedKeys[provider] || null;
                }
            } catch (e) {
                console.warn('[Settings] Failed to check platform credentials:', e);
            }
            
            return null;
        }
        
        // Check if user can access shared keys
        canAccessSharedKeys() {
            if (this.isSuperAdmin()) return false; // Super admin uses their own
            
            const session = window.cavUserSession || window.CAVSecurity?.SecureSessionManager?.getSession?.();
            const currentEmail = session?.email?.toLowerCase() || '';
            
            const platformCreds = JSON.parse(localStorage.getItem('cav_platform_credentials') || '{}');
            const sharing = platformCreds.sharing || {};
            
            if (!sharing.enabled) return false;
            
            // Global universal share grants access to all authenticated users
            if (sharing.globalUniversalShare) return true;
            
            const allowedEmails = (sharing.allowedEmails || []).map(e => e.toLowerCase().trim());
            
            // If no emails specified, allow all
            if (allowedEmails.length === 0) return true;
            
            // Check for exact email match or domain match
            const userDomain = '@' + (currentEmail.split('@')[1] || '');
            return allowedEmails.some(entry => {
                if (entry.startsWith('@')) {
                    return entry === userDomain;
                }
                return entry === currentEmail;
            });
        }
        
        // User's own Cloudinary credentials (BYOK)
        getUserCloudinaryCredentials() {
            try {
                const stored = localStorage.getItem('cav_user_cloudinary');
                return stored ? JSON.parse(stored) : null;
            } catch (e) {
                return null;
            }
        }
        
        saveUserCloudinaryCredentials(credentials) {
            try {
                localStorage.setItem('cav_user_cloudinary', JSON.stringify(credentials));
                console.log('[Settings] User Cloudinary credentials saved to localStorage');
                
                // Also sync to Supabase for cross-device access
                this.saveCloudinaryToSupabase(credentials);
                
                return true;
            } catch (e) {
                console.error('[Settings] Failed to save Cloudinary credentials:', e);
                return false;
            }
        }
        
        // Save Cloudinary credentials to Supabase
        async saveCloudinaryToSupabase(credentials) {
            const userEmail = this.userEmail || window.cavUserSession?.email;
            if (!userEmail || !window.CAVSupabase?.getClient) {
                console.log('[Settings] No user email or Supabase client for Cloudinary sync');
                return;
            }
            
            try {
                const supabase = window.CAVSupabase.getClient();
                if (!supabase) return;
                
                const credentialId = `cloudinary_${userEmail.replace(/[^a-z0-9]/gi, '_')}`;
                
                const { error } = await supabase
                    .from('integration_credentials')
                    .upsert({
                        uuid: credentialId,
                        user_email: userEmail,
                        owner_email: userEmail,
                        integration_type: 'cloudinary',
                        service: 'cloudinary',
                        provider: 'cloudinary',
                        credentials: credentials,
                        is_active: true,
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'uuid'
                    });
                
                if (error) {
                    console.warn('[Settings] Cloudinary Supabase save error:', error.message);
                } else {
                    console.log('[Settings] ☁️ Cloudinary credentials synced to Supabase');
                }
            } catch (e) {
                console.warn('[Settings] Cloudinary Supabase sync error:', e);
            }
        }
        
        // Load Cloudinary credentials from Supabase
        async loadCloudinaryFromSupabase() {
            const userEmail = this.userEmail || window.cavUserSession?.email;
            if (!userEmail || !window.CAVSupabase?.getClient) return null;
            
            try {
                const supabase = window.CAVSupabase.getClient();
                if (!supabase) return null;
                
                const { data, error } = await supabase
                    .from('integration_credentials')
                    .select('credentials')
                    .eq('user_email', userEmail)
                    .eq('service', 'cloudinary')
                    .eq('is_active', true)
                    .single();
                
                if (!error && data?.credentials) {
                    // Also save to localStorage for offline access
                    localStorage.setItem('cav_user_cloudinary', JSON.stringify(data.credentials));
                    console.log('[Settings] ☁️ Cloudinary credentials loaded from Supabase');
                    return data.credentials;
                }
            } catch (e) {
                console.warn('[Settings] Error loading Cloudinary from Supabase:', e);
            }
            return null;
        }
        
        // Get Cloudinary credentials (shared first, then user's own)
        getCloudinaryCredentials() {
            // First check if user has their own credentials
            const userCreds = this.getUserCloudinaryCredentials();
            if (userCreds?.cloudName && userCreds?.apiKey) {
                console.log('[Settings] Using user\'s own Cloudinary credentials');
                return { ...userCreds, source: 'own' };
            }
            
            // Check for shared platform credentials
            const platformCreds = this.getSharedPlatformCredentials() || 
                                 JSON.parse(localStorage.getItem('cav_platform_credentials') || '{}');
            const sharing = platformCreds.sharing || {};
            const cloudinaryCreds = platformCreds.cloudinary || {};
            
            // Check if sharing is enabled and Cloudinary credentials exist
            if (sharing.enabled && cloudinaryCreds.cloudName && cloudinaryCreds.apiKey) {
                // Verify user has access to shared resources
                if (sharing.globalUniversalShare || this.hasAccessToSharedResource()) {
                    console.log('[Settings] Using shared Cloudinary credentials');
                    return { ...cloudinaryCreds, source: 'shared' };
                }
            }
            
            console.log('[Settings] No Cloudinary credentials available');
            return null;
        }
        
        // Check if current user has access to shared resources
        hasAccessToSharedResource() {
            const session = window.cavUserSession || window.CAVSecurity?.SecureSessionManager?.getSession?.();
            const currentEmail = session?.email?.toLowerCase();
            if (!currentEmail) return false;
            
            const platformCreds = JSON.parse(localStorage.getItem('cav_platform_credentials') || '{}');
            const sharing = platformCreds.sharing || {};
            
            // If no email restrictions, allow all authenticated users
            const allowedEmails = (sharing.allowedEmails || []).map(e => e.toLowerCase().trim());
            if (allowedEmails.length === 0) return true;
            
            // Check if user's email or domain is allowed
            return allowedEmails.some(entry => {
                if (entry.startsWith('@')) {
                    // Domain match
                    return currentEmail.endsWith(entry);
                }
                return entry === currentEmail;
            });
        }
        
        // Load API keys from IndexedDB for current user
        async loadUserApiKeys() {
            try {
                // Wait for session to be available
                await this.waitForSession();
                
                const session = window.cavUserSession || window.CAVSecurity?.SecureSessionManager?.getSession?.();
                if (!session?.email) {
                    console.log('🔑 Settings: No user session, using anonymous storage');
                    return;
                }
                
                this.userEmail = session.email;
                const userStorageKey = `${STORAGE_KEY}_${this.userEmail.replace(/[^a-z0-9]/gi, '_')}`;
                
                // Try IndexedDB first (most persistent)
                if (window.CAVSecurity?.SecureDataPersistence?.db) {
                    const db = window.CAVSecurity.SecureDataPersistence.db;
                    const userKey = `user_${this.userEmail.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
                    
                    const tx = db.transaction('api_keys', 'readonly');
                    const store = tx.objectStore('api_keys');
                    const request = store.get(userKey);
                    
                    request.onsuccess = () => {
                        if (request.result?.keys) {
                            console.log('🔑 Settings: Loaded API keys from IndexedDB for:', this.userEmail);
                            this.settings.apiKeys = { ...this.settings.apiKeys, ...request.result.keys };
                            this.syncGeminiKeyToLegacy();
                            this.apiKeysLoaded = true;
                        }
                    };
                } else {
                    // Fallback to user-specific localStorage
                    const storedUserSettings = localStorage.getItem(userStorageKey);
                    if (storedUserSettings) {
                        const parsed = JSON.parse(storedUserSettings);
                        if (parsed.apiKeys) {
                            console.log('🔑 Settings: Loaded API keys from localStorage for:', this.userEmail);
                            this.settings.apiKeys = { ...this.settings.apiKeys, ...parsed.apiKeys };
                            this.syncGeminiKeyToLegacy();
                        }
                    }
                }
                this.apiKeysLoaded = true;
            } catch (e) {
                console.error('[Settings] Error loading user API keys:', e);
            }
        }
        
        // Wait for user session to be available (fast timeout for better UX)
        waitForSession() {
            return new Promise((resolve) => {
                if (window.cavUserSession || window.CAVSecurity?.SecureSessionManager?.getSession?.()) {
                    resolve();
                    return;
                }
                
                // Wait up to 500ms max for session (was 3 seconds - too slow)
                let attempts = 0;
                const check = setInterval(() => {
                    attempts++;
                    if (window.cavUserSession || window.CAVSecurity?.SecureSessionManager?.getSession?.() || attempts > 5) {
                        clearInterval(check);
                        resolve();
                    }
                }, 100);
            });
        }
        
        // Sync Gemini API key to legacy storage locations for backwards compatibility
        syncGeminiKeyToLegacy() {
            const geminiKey = this.settings?.apiKeys?.gemini?.key;
            if (geminiKey && geminiKey.length >= 30) {
                localStorage.setItem('cav_ai_api_key', geminiKey);
                localStorage.setItem('cav_gemini_api_key', geminiKey);
                console.log('🔑 Settings: Synced Gemini API key to legacy storage');
            }
        }

        // Load settings from localStorage
        loadSettings() {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    // Merge with defaults to ensure all fields exist
                    return this.mergeWithDefaults(parsed);
                }
            } catch (e) {
                console.error('[Settings] Error loading settings:', e);
            }
            return { ...DEFAULT_SETTINGS };
        }

        // Merge stored settings with defaults
        mergeWithDefaults(stored) {
            const merged = { ...DEFAULT_SETTINGS };
            
            // Deep merge
            Object.keys(stored).forEach(key => {
                if (typeof stored[key] === 'object' && !Array.isArray(stored[key]) && stored[key] !== null) {
                    merged[key] = { ...DEFAULT_SETTINGS[key], ...stored[key] };
                } else {
                    merged[key] = stored[key];
                }
            });
            
            return merged;
        }

        // Save settings to localStorage, IndexedDB, AND Supabase for full persistence
        saveSettings() {
            try {
                this.settings.updatedAt = new Date().toISOString();
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
                
                // Also save to user-specific storage if logged in
                if (this.userEmail) {
                    const userStorageKey = `${STORAGE_KEY}_${this.userEmail.replace(/[^a-z0-9]/gi, '_')}`;
                    localStorage.setItem(userStorageKey, JSON.stringify(this.settings));
                    
                    // Save API keys to IndexedDB for maximum persistence
                    this.saveApiKeysToIndexedDB();
                    
                    // Save API keys to Supabase for cross-device sync
                    this.saveApiKeysToSupabase();
                }
                
                this.notifyListeners('save', this.settings);
                return true;
            } catch (e) {
                console.error('[Settings] Error saving settings:', e);
                return false;
            }
        }
        
        // Save API keys to Supabase cloud for cross-device sync
        async saveApiKeysToSupabase() {
            if (!this.userEmail || !window.CAVSupabase?.getClient) return;
            
            try {
                const supabase = window.CAVSupabase.getClient();
                if (!supabase) return;
                
                console.log('[Settings] Saving API keys to Supabase for:', this.userEmail);
                
                // Save each API key to the user_api_keys table (works with Google Sign-In)
                // Note: If table doesn't exist or migrations aren't run, this will fail silently
                // Keys are still saved locally and shared via shared_api_keys table
                for (const [provider, config] of Object.entries(this.settings.apiKeys)) {
                    if (config?.key && config.key.length >= 10) {
                        const keyId = `apikey_${provider}_${this.userEmail.replace(/[^a-z0-9]/gi, '_')}`;
                        
                        try {
                            const { error } = await supabase
                                .from('user_api_keys')
                                .upsert({
                                    uuid: keyId,
                                    user_email: this.userEmail,
                                    owner_email: this.userEmail,
                                    provider: provider,
                                    key: config.key,
                                    encrypted_key: config.key, // Also set encrypted_key for compatibility
                                    is_active: config.status !== 'error',
                                    domain: this.userEmail.split('@')[1] || 'local',
                                    updated_at: new Date().toISOString()
                                }, {
                                    onConflict: 'uuid'
                                });
                            
                            if (error) {
                                // Only log once per session, not for each key
                                if (!this._userApiKeysWarnShown) {
                                    console.log(`[Settings] user_api_keys table unavailable, using shared_api_keys instead`);
                                    this._userApiKeysWarnShown = true;
                                }
                            } else {
                                console.log(`[Settings] ☁️ Saved ${provider} key to Supabase`);
                            }
                        } catch (e) {
                            // Network error or table doesn't exist - fail silently
                            if (!this._userApiKeysWarnShown) {
                                console.log(`[Settings] user_api_keys sync unavailable`);
                                this._userApiKeysWarnShown = true;
                            }
                        }
                    }
                }
                
                // Also save full settings to user_settings table
                const currentEmail = this.getCurrentUserEmail();
                const settingsUuid = `settings_${currentEmail.replace(/[^a-z0-9]/gi, '_')}`;
                const { error: settingsError } = await supabase
                    .from('user_settings')
                    .upsert({
                        uuid: settingsUuid,
                        user_email: currentEmail,
                        settings_type: 'app_settings',
                        data: {
                            features: this.settings.features,
                            modelConfig: this.settings.modelConfig,
                            notifications: this.settings.notifications,
                            brandProfiles: this.settings.brandProfiles,
                            competitors: this.settings.competitors,
                            // Don't store keys in plain text here
                            apiKeyStatus: Object.fromEntries(
                                Object.entries(this.settings.apiKeys).map(([k, v]) => [k, { status: v?.status, hasKey: !!v?.key }])
                            )
                        },
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'uuid'
                    });
                
                if (!settingsError) {
                    console.log('[Settings] ☁️ Settings synced to Supabase');
                }
            } catch (e) {
                console.warn('[Settings] Supabase sync error:', e);
            }
        }
        
        // Save API keys to IndexedDB (persistent across sessions)
        async saveApiKeysToIndexedDB() {
            if (!this.userEmail) return;
            
            try {
                // Wait for IndexedDB to be ready
                const db = window.CAVSecurity?.SecureDataPersistence?.db;
                if (!db) {
                    console.warn('[Settings] IndexedDB not available for API key storage');
                    return;
                }
                
                const userKey = `user_${this.userEmail.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
                
                const tx = db.transaction('api_keys', 'readwrite');
                const store = tx.objectStore('api_keys');
                
                store.put({
                    user_key: userKey,
                    keys: this.settings.apiKeys,
                    user_email: this.userEmail,
                    updated_at: new Date().toISOString()
                });
                
                tx.oncomplete = () => {
                    console.log('🔑 Settings: API keys saved to IndexedDB for:', this.userEmail);
                };
                
                tx.onerror = (e) => {
                    console.error('[Settings] Failed to save API keys to IndexedDB:', e);
                };
            } catch (e) {
                console.error('[Settings] IndexedDB save error:', e);
            }
        }

        // Get all settings
        getSettings() {
            return { ...this.settings };
        }

        // Get specific API key (checks user's own key first, then shared keys)
        getAPIKey(provider) {
            // First check user's own key
            const ownKey = this.settings.apiKeys[provider]?.key;
            if (ownKey && ownKey.length >= 10) {
                return ownKey;
            }
            
            // Then check for shared key from super admin
            const sharedKey = this.getSharedApiKey(provider);
            if (sharedKey && sharedKey.length >= 10) {
                console.log(`[Settings] Using shared ${provider} key from admin`);
                return sharedKey;
            }
            
            return '';
        }

        // Set API key - saves to ALL storage locations for maximum persistence
        setAPIKey(provider, key) {
            if (this.settings.apiKeys[provider]) {
                this.settings.apiKeys[provider].key = key;
                this.settings.apiKeys[provider].status = 'untested';
                
                // Ensure userEmail is set before saving
                if (!this.userEmail) {
                    const session = window.cavUserSession || window.CAVSecurity?.SecureSessionManager?.getSession?.();
                    if (session?.email) {
                        this.userEmail = session.email;
                        console.log('🔑 Settings: User email set during API key save:', this.userEmail);
                    }
                }
                
                // Save to main settings storage
                this.saveSettings();
                
                // === SYNC TO ALL LEGACY STORAGE LOCATIONS ===
                // This ensures keys persist regardless of which system loads first
                if (key) {
                    // Provider-specific legacy keys
                    localStorage.setItem(`cav_${provider}_api_key`, key);
                    
                    // Gemini has extra legacy locations
                    if (provider === 'gemini') {
                        localStorage.setItem('cav_ai_api_key', key);
                        localStorage.setItem('cav_gemini_api_key', key);
                        if (window.cavAIStudio) {
                            window.cavAIStudio.apiKey = key;
                        }
                    }
                    
                    // Claude legacy
                    if (provider === 'claude') {
                        localStorage.setItem('cav_claude_api_key', key);
                        localStorage.setItem('cav_anthropic_api_key', key);
                    }
                    
                    // OpenAI legacy
                    if (provider === 'openai') {
                        localStorage.setItem('cav_openai_api_key', key);
                    }
                    
                    // SearchAPI legacy
                    if (provider === 'searchapi') {
                        localStorage.setItem('cav_searchapi_key', key);
                    }
                    
                    // Google Vision uses same key as Gemini
                    if (provider === 'googleVision') {
                        localStorage.setItem('cav_google_vision_api_key', key);
                    }
                    
                    console.log(`🔑 ${provider} key synced to all legacy storage locations`);
                }

                // === SYNC TO UNIFIED STORAGE (cross-device) ===
                if (window.UnifiedStorage?.saveAPIKey && key) {
                    window.UnifiedStorage.saveAPIKey(provider, key, {
                        shareWithDomain: false,
                        shareGlobally: false,
                        isAdmin: this.isAdmin()
                    }).then(() => {
                        console.log(`🔑 ${provider} key synced to UnifiedStorage (Supabase)`);
                    }).catch(e => {
                        console.warn(`[Settings] UnifiedStorage sync failed for ${provider}:`, e);
                    });
                }
            }
        }

        // Check if current user is admin
        isAdmin() {
            const session = window.cavUserSession || window.CAVSecurity?.SecureSessionManager?.getSession?.();
            return session?.role === 'admin' || session?.role === 'super_admin';
        }
        
        // Load API keys from ALL storage locations (consolidate)
        consolidateAllApiKeys() {
            const providers = ['claude', 'openai', 'searchapi', 'gemini', 'googleVision'];
            
            for (const provider of providers) {
                // Skip if already has a key
                if (this.settings.apiKeys[provider]?.key) continue;
                
                // Check legacy storage locations
                let key = null;
                
                if (provider === 'gemini') {
                    key = localStorage.getItem('cav_gemini_api_key') || 
                          localStorage.getItem('cav_ai_api_key') ||
                          localStorage.getItem('cav_gemini_api_key');
                } else if (provider === 'claude') {
                    key = localStorage.getItem('cav_claude_api_key') ||
                          localStorage.getItem('cav_anthropic_api_key');
                } else if (provider === 'openai') {
                    key = localStorage.getItem('cav_openai_api_key');
                } else if (provider === 'searchapi') {
                    key = localStorage.getItem('cav_searchapi_key') ||
                          localStorage.getItem('cav_searchapi_api_key');
                } else if (provider === 'googleVision') {
                    key = localStorage.getItem('cav_google_vision_api_key') ||
                          localStorage.getItem('cav_gemini_api_key'); // Can use same key
                }
                
                // Also check generic pattern
                if (!key) {
                    key = localStorage.getItem(`cav_${provider}_api_key`);
                }
                
                if (key && key.length >= 10) {
                    this.settings.apiKeys[provider].key = key;
                    console.log(`🔑 Settings: Recovered ${provider} key from legacy storage`);
                }
            }
        }

        // Get model config
        getModelConfig() {
            return { ...this.settings.modelConfig };
        }

        // Set model config
        setModelConfig(config) {
            this.settings.modelConfig = { ...this.settings.modelConfig, ...config };
            this.saveSettings();
        }

        // Get feature flags
        getFeatures() {
            return { ...this.settings.features };
        }

        // Set feature flag
        setFeature(feature, enabled) {
            if (this.settings.features.hasOwnProperty(feature)) {
                this.settings.features[feature] = enabled;
                this.saveSettings();
            }
        }

        // Mask API key for display
        maskKey(key) {
            if (!key || key.length < 8) return '••••••••';
            return '••••••••' + key.slice(-4);
        }

        // Add settings change listener
        addListener(callback) {
            this.listeners.push(callback);
        }

        // Notify listeners
        notifyListeners(event, data) {
            this.listeners.forEach(cb => cb(event, data));
        }

        // ============================================
        // API CONNECTION TESTING
        // ============================================

        // Test Claude API connection
        async testClaudeConnection() {
            const key = this.getAPIKey('claude');
            if (!key) {
                return { success: false, error: 'No API key configured' };
            }

            try {
                const response = await fetch(API_ENDPOINTS.claude, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': key,
                        'anthropic-version': '2023-06-01',
                        'anthropic-dangerous-direct-browser-access': 'true'
                    },
                    body: JSON.stringify({
                        model: this.settings.apiKeys.claude.model,
                        max_tokens: 10,
                        messages: [{ role: 'user', content: 'Say "connected" in one word.' }]
                    })
                });

                if (response.ok) {
                    this.settings.apiKeys.claude.status = 'active';
                    this.settings.apiKeys.claude.lastTested = new Date().toISOString();
                    this.saveSettings();
                    return { success: true, message: 'Claude API connected successfully' };
                } else {
                    const error = await response.json();
                    this.settings.apiKeys.claude.status = 'error';
                    this.saveSettings();
                    return { success: false, error: error.error?.message || 'Connection failed' };
                }
            } catch (e) {
                this.settings.apiKeys.claude.status = 'error';
                this.saveSettings();
                return { success: false, error: e.message };
            }
        }

        // Test OpenAI API connection
        async testOpenAIConnection() {
            const key = this.getAPIKey('openai');
            if (!key) {
                return { success: false, error: 'No API key configured' };
            }

            try {
                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${key}`
                };
                
                if (this.settings.apiKeys.openai.orgId) {
                    headers['OpenAI-Organization'] = this.settings.apiKeys.openai.orgId;
                }

                const response = await fetch(API_ENDPOINTS.openai, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        model: 'gpt-4o-mini',
                        max_completion_tokens: 10,
                        messages: [{ role: 'user', content: 'Say "connected" in one word.' }]
                    })
                });

                if (response.ok) {
                    this.settings.apiKeys.openai.status = 'active';
                    this.settings.apiKeys.openai.lastTested = new Date().toISOString();
                    this.saveSettings();
                    return { success: true, message: 'OpenAI API connected successfully' };
                } else {
                    const error = await response.json();
                    this.settings.apiKeys.openai.status = 'error';
                    this.saveSettings();
                    return { success: false, error: error.error?.message || 'Connection failed' };
                }
            } catch (e) {
                this.settings.apiKeys.openai.status = 'error';
                this.saveSettings();
                return { success: false, error: e.message };
            }
        }

        // Test SearchAPI connection
        async testSearchAPIConnection() {
            const key = this.getAPIKey('searchapi');
            if (!key) {
                return { success: false, error: 'No API key configured' };
            }

            try {
                const url = `${API_ENDPOINTS.searchapi}?engine=google&q=test&api_key=${key}&num=1`;
                const response = await fetch(url);

                if (response.ok) {
                    const data = await response.json();
                    this.settings.apiKeys.searchapi.status = 'active';
                    this.settings.apiKeys.searchapi.lastTested = new Date().toISOString();
                    this.saveSettings();
                    return { 
                        success: true, 
                        message: 'SearchAPI connected successfully',
                        quota: data.search_information?.total_results || 'Available'
                    };
                } else {
                    const error = await response.json();
                    this.settings.apiKeys.searchapi.status = 'error';
                    this.saveSettings();
                    return { success: false, error: error.error || 'Connection failed' };
                }
            } catch (e) {
                this.settings.apiKeys.searchapi.status = 'error';
                this.saveSettings();
                return { success: false, error: e.message };
            }
        }

        // Test Gemini API connection
        async testGeminiConnection() {
            const key = this.getAPIKey('gemini');
            if (!key) {
                return { success: false, error: 'No API key configured' };
            }

            try {
                const url = `${API_ENDPOINTS.gemini}/gemini-3-flash-preview:generateContent?key=${key}`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: 'Say "connected" in one word.' }] }]
                    })
                });

                if (response.ok) {
                    this.settings.apiKeys.gemini.status = 'active';
                    this.settings.apiKeys.gemini.lastTested = new Date().toISOString();
                    this.saveSettings();
                    return { success: true, message: 'Gemini API connected successfully' };
                } else {
                    const error = await response.json();
                    this.settings.apiKeys.gemini.status = 'error';
                    this.saveSettings();
                    return { success: false, error: error.error?.message || 'Connection failed' };
                }
            } catch (e) {
                this.settings.apiKeys.gemini.status = 'error';
                this.saveSettings();
                return { success: false, error: e.message };
            }
        }

        // Test Google Cloud Vision API connection
        async testGoogleVisionConnection() {
            const key = this.getAPIKey('googleVision') || this.getAPIKey('gemini'); // Can use same Google Cloud key
            if (!key) {
                return { success: false, error: 'No API key configured' };
            }

            try {
                // Simple test with a blank image
                const testImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='; // 1x1 white PNG
                const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${key}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        requests: [{
                            image: { content: testImage },
                            features: [{ type: 'LABEL_DETECTION', maxResults: 1 }]
                        }]
                    })
                });

                if (response.ok) {
                    if (this.settings.apiKeys.googleVision) {
                        this.settings.apiKeys.googleVision.status = 'active';
                        this.settings.apiKeys.googleVision.lastTested = new Date().toISOString();
                    }
                    this.saveSettings();
                    return { success: true, message: 'Google Cloud Vision API connected successfully' };
                } else {
                    const error = await response.json();
                    if (this.settings.apiKeys.googleVision) {
                        this.settings.apiKeys.googleVision.status = 'error';
                    }
                    this.saveSettings();
                    return { success: false, error: error.error?.message || 'Connection failed' };
                }
            } catch (e) {
                if (this.settings.apiKeys.googleVision) {
                    this.settings.apiKeys.googleVision.status = 'error';
                }
                this.saveSettings();
                return { success: false, error: e.message };
            }
        }

        // Test all connections
        async testAllConnections() {
            const results = {
                claude: await this.testClaudeConnection(),
                openai: await this.testOpenAIConnection(),
                searchapi: await this.testSearchAPIConnection(),
                gemini: await this.testGeminiConnection(),
                googleVision: await this.testGoogleVisionConnection()
            };
            return results;
        }

        // ============================================
        // BRAND PROFILES
        // ============================================

        addBrandProfile(profile) {
            const newProfile = {
                id: 'brand_' + Date.now(),
                name: profile.name || 'Untitled Brand',
                logos: profile.logos || [],
                colors: profile.colors || { primary: '#000000', secondary: '#ffffff', accent: '#0066cc' },
                fonts: profile.fonts || [],
                voiceKeywords: profile.voiceKeywords || [],
                visualStyle: profile.visualStyle || '',
                isDefault: profile.isDefault || false,
                createdAt: new Date().toISOString()
            };
            
            // If setting as default, unset others
            if (newProfile.isDefault) {
                this.settings.brandProfiles.forEach(b => b.isDefault = false);
            }
            
            this.settings.brandProfiles.push(newProfile);
            this.saveSettings();
            return newProfile;
        }

        updateBrandProfile(id, updates) {
            const index = this.settings.brandProfiles.findIndex(b => b.id === id);
            if (index !== -1) {
                if (updates.isDefault) {
                    this.settings.brandProfiles.forEach(b => b.isDefault = false);
                }
                this.settings.brandProfiles[index] = { 
                    ...this.settings.brandProfiles[index], 
                    ...updates,
                    updatedAt: new Date().toISOString()
                };
                this.saveSettings();
                return this.settings.brandProfiles[index];
            }
            return null;
        }

        deleteBrandProfile(id) {
            this.settings.brandProfiles = this.settings.brandProfiles.filter(b => b.id !== id);
            this.saveSettings();
        }

        getDefaultBrandProfile() {
            return this.settings.brandProfiles.find(b => b.isDefault) || this.settings.brandProfiles[0] || null;
        }

        // ============================================
        // COMPETITOR PROFILES
        // ============================================

        addCompetitor(competitor) {
            const newCompetitor = {
                id: 'comp_' + Date.now(),
                name: competitor.name || 'Untitled Competitor',
                domain: competitor.domain || '',
                adLibraryUrls: competitor.adLibraryUrls || [],
                monitoringFrequency: competitor.monitoringFrequency || 'weekly',
                lastChecked: null,
                alerts: competitor.alerts || [],
                tags: competitor.tags || [],
                notes: competitor.notes || '',
                createdAt: new Date().toISOString()
            };
            
            this.settings.competitors.push(newCompetitor);
            this.saveSettings();
            return newCompetitor;
        }

        updateCompetitor(id, updates) {
            const index = this.settings.competitors.findIndex(c => c.id === id);
            if (index !== -1) {
                this.settings.competitors[index] = { 
                    ...this.settings.competitors[index], 
                    ...updates,
                    updatedAt: new Date().toISOString()
                };
                this.saveSettings();
                return this.settings.competitors[index];
            }
            return null;
        }

        deleteCompetitor(id) {
            this.settings.competitors = this.settings.competitors.filter(c => c.id !== id);
            this.saveSettings();
        }

        // ============================================
        // DATA MANAGEMENT
        // ============================================

        exportSettings(includeKeys = false) {
            const exported = { ...this.settings };
            
            if (!includeKeys) {
                // Remove API keys for safety
                exported.apiKeys = {
                    claude: { ...exported.apiKeys.claude, key: '' },
                    openai: { ...exported.apiKeys.openai, key: '' },
                    searchapi: { ...exported.apiKeys.searchapi, key: '' },
                    gemini: { ...exported.apiKeys.gemini, key: '' }
                };
            }
            
            return JSON.stringify(exported, null, 2);
        }

        importSettings(jsonString, importKeys = false) {
            try {
                const imported = JSON.parse(jsonString);
                
                // Preserve existing keys if not importing them
                if (!importKeys) {
                    imported.apiKeys = this.settings.apiKeys;
                }
                
                this.settings = this.mergeWithDefaults(imported);
                this.saveSettings();
                return { success: true };
            } catch (e) {
                return { success: false, error: e.message };
            }
        }

        clearAllData() {
            this.settings = { ...DEFAULT_SETTINGS };
            this.saveSettings();
        }
    }

    // ============================================
    // API KEY ACCESS CONTROL
    // ============================================

    class APIKeyAccessControl {
        constructor() {
            this.accessList = this.loadAccessList();
            this.usageStats = this.loadUsageStats();
            // Async load from IndexedDB/backend for cross-device sync
            this.loadFromIndexedDB();
            this.loadFromBackend();
        }

        // Load access list from storage
        loadAccessList() {
            try {
                // First try to get from main storage key
                let stored = localStorage.getItem(API_ACCESS_STORAGE_KEY);
                
                if (stored) {
                    const parsed = JSON.parse(stored);
                    console.log('[API Access] Loaded from localStorage:', parsed.adminEmail ? `admin: ${parsed.adminEmail}` : 'no admin set');
                    // Ensure all required fields exist
                    return {
                        sharedKeys: parsed.sharedKeys || {},
                        adminEmail: parsed.adminEmail || null,
                        adminDomain: parsed.adminDomain || null
                    };
                }
                
                return {
                    sharedKeys: {}, // { provider: { enabled: bool, allowedUsers: [], revokedUsers: [] } }
                    adminEmail: null,
                    adminDomain: null
                };
            } catch (e) {
                console.error('[API Access] Failed to load access list:', e);
                return { sharedKeys: {}, adminEmail: null, adminDomain: null };
            }
        }
        
        // Load from IndexedDB (cross-tab sync)
        async loadFromIndexedDB() {
            const db = window.CAVSecurity?.SecureDataPersistence?.db;
            if (!db) {
                // Retry after security module initializes
                setTimeout(() => this.loadFromIndexedDB(), 1000);
                return;
            }

            try {
                const tx = db.transaction('preferences', 'readonly');
                const store = tx.objectStore('preferences');
                const request = store.get('api_access_control');
                
                request.onsuccess = (event) => {
                    const result = event.target.result;
                    if (result?.data && result.data.adminEmail) {
                        console.log('[API Access] Loaded from IndexedDB:', result.data.adminEmail);
                        // Merge with existing (IndexedDB takes precedence if newer)
                        if (result.data.sharedKeys) {
                            this.accessList.sharedKeys = { ...this.accessList.sharedKeys, ...result.data.sharedKeys };
                        }
                        if (result.data.adminEmail) {
                            this.accessList.adminEmail = result.data.adminEmail;
                            this.accessList.adminDomain = result.data.adminDomain;
                        }
                        // Save merged config back to localStorage
                        localStorage.setItem(API_ACCESS_STORAGE_KEY, JSON.stringify(this.accessList));
                    }
                };
            } catch (e) {
                console.warn('[API Access] IndexedDB load failed:', e);
            }
        }
        
        // Load from backend (cross-device sync) via sync-engine
        async loadFromBackend() {
            // Method 1: Try syncEngine first
            if (window.syncEngine) {
                try {
                    const userSettings = await window.syncEngine.getAllFromLocal('user_settings');
                    const apiConfig = userSettings?.find(s => s.setting_type === 'api_access_control_global');
                    
                    if (apiConfig?.data && apiConfig.data.adminEmail) {
                        console.log('[API Access] Loaded from syncEngine:', apiConfig.data.adminEmail);
                        if (apiConfig.data.sharedKeys) {
                            this.accessList.sharedKeys = { ...this.accessList.sharedKeys, ...apiConfig.data.sharedKeys };
                        }
                        if (apiConfig.data.adminEmail) {
                            this.accessList.adminEmail = apiConfig.data.adminEmail;
                            this.accessList.adminDomain = apiConfig.data.adminDomain;
                        }
                        localStorage.setItem(API_ACCESS_STORAGE_KEY, JSON.stringify(this.accessList));
                    }
                } catch (e) {
                    console.warn('[API Access] SyncEngine load failed:', e);
                }
            }
            
            // Method 2: Try Supabase for cross-device sync
            if (window.CAVSupabase?.isConfigured?.()) {
                try {
                    // Determine the organization ID based on current user's domain
                    const currentEmail = this.getCurrentUserEmail();
                    const domain = currentEmail?.split('@')[1] || '';
                    const orgId = domain.replace(/\./g, '_');
                    
                    if (orgId && domain !== 'gmail.com') {
                        // Load shared keys for this domain
                        const result = await window.CAVSupabase.loadSharedKeysDirect?.(orgId);
                        
                        if (result?.keys && Object.keys(result.keys).length > 0) {
                            console.log(`[API Access] Loaded shared keys from Supabase for domain: ${domain}`);
                            
                            // Update platform credentials with domain-shared keys
                            const platformCreds = JSON.parse(localStorage.getItem('cav_platform_credentials') || '{}');
                            platformCreds.sharedKeys = { ...platformCreds.sharedKeys, ...result.keys };
                            platformCreds.sharing = { enabled: true };
                            localStorage.setItem('cav_platform_credentials', JSON.stringify(platformCreds));
                            
                            // Sync keys to legacy locations
                            for (const [provider, key] of Object.entries(result.keys)) {
                                if (provider === 'gemini') {
                                    localStorage.setItem('cav_ai_api_key', key);
                                    localStorage.setItem('cav_gemini_api_key', key);
                                }
                                localStorage.setItem(`cav_${provider}_api_key`, key);
                            }
                            
                            console.log(`[API Access] Domain keys synced: ${Object.keys(result.keys).join(', ')}`);
                        }
                    }
                } catch (e) {
                    console.warn('[API Access] Supabase load failed:', e);
                }
            } else {
                // Retry after Supabase initializes
                setTimeout(() => this.loadFromBackend(), 2000);
            }
        }

        // Save access list
        saveAccessList() {
            try {
                localStorage.setItem(API_ACCESS_STORAGE_KEY, JSON.stringify(this.accessList));
                console.log('[API Access] Saved to localStorage:', this.accessList.adminEmail || 'no admin');
                
                // Also save to IndexedDB for persistence
                this.saveToIndexedDB();
                
                // Sync to backend for cross-device access
                this.saveToBackend();
            } catch (e) {
                console.error('[API Access] Failed to save access list:', e);
            }
        }

        // Save to IndexedDB
        async saveToIndexedDB() {
            const db = window.CAVSecurity?.SecureDataPersistence?.db;
            if (!db) return;

            try {
                const tx = db.transaction('preferences', 'readwrite');
                const store = tx.objectStore('preferences');
                store.put({
                    user_key: 'api_access_control',
                    data: this.accessList,
                    updated_at: new Date().toISOString()
                });
                console.log('[API Access] Saved to IndexedDB');
            } catch (e) {
                console.error('[API Access] IndexedDB save failed:', e);
            }
        }
        
        // Save to backend for cross-device sync
        async saveToBackend() {
            const adminEmail = this.accessList.adminEmail || this.getCurrentUserEmail();
            if (!adminEmail) return;
            
            try {
                // Method 1: Save via syncEngine (for sync_engine based systems)
                if (window.syncEngine) {
                    const globalConfig = {
                        uuid: 'api_access_control_global',
                        setting_type: 'api_access_control_global',
                        data: this.accessList,
                        updated_at: new Date().toISOString()
                    };
                    await window.syncEngine.save('user_settings', globalConfig);
                }
                
                // Method 2: Save directly to Supabase for cross-device access
                if (window.CAVSupabase?.isConfigured?.()) {
                    const domain = adminEmail.split('@')[1];
                    const orgId = domain.replace(/\./g, '_');
                    
                    // Save the sharing configuration
                    await window.CAVSupabase.saveEntity?.('api_sharing_config', {
                        uuid: `api_access_${orgId}`,
                        organization_id: orgId,
                        admin_email: adminEmail,
                        shared_keys_config: this.accessList.sharedKeys,
                        allowed_domains: [domain],
                        updated_at: new Date().toISOString()
                    });
                    
                    // If there are actual keys to share, save them to shared_api_keys
                    const settingsManager = window.cavSettingsManager;
                    if (settingsManager) {
                        const keysToShare = {};
                        for (const [provider, config] of Object.entries(this.accessList.sharedKeys || {})) {
                            if (config.enabled) {
                                const key = settingsManager.getAPIKey(provider);
                                if (key) keysToShare[provider] = key;
                            }
                        }
                        
                        if (Object.keys(keysToShare).length > 0) {
                            await window.CAVSupabase.saveSharedKeysDirect?.(keysToShare, orgId);
                            console.log(`[API Access] Shared keys synced to Supabase for org: ${orgId}`);
                        }
                    }
                }
                
                console.log('[API Access] Saved to backend for cross-device sync');
            } catch (e) {
                console.warn('[API Access] Backend save failed:', e);
            }
        }

        // Load usage stats
        loadUsageStats() {
            try {
                const stored = localStorage.getItem(API_USAGE_STORAGE_KEY);
                return stored ? JSON.parse(stored) : {};
            } catch (e) {
                return {};
            }
        }

        // Save usage stats
        saveUsageStats() {
            try {
                localStorage.setItem(API_USAGE_STORAGE_KEY, JSON.stringify(this.usageStats));
            } catch (e) {
                console.error('[API Access] Failed to save usage stats:', e);
            }
        }

        // Super admin email - can see and manage all domains
        static SUPER_ADMIN_EMAIL = window.AUTH_CONFIG?.ADMIN_EMAILS?.[0] || null;
        static SUPER_ADMIN_DOMAIN = 'itallstartedwithaidea.com';
        
        // Check if current user is super admin
        isSuperAdmin() {
            const email = this.getCurrentUserEmail();
            const superAdminEmail = APIKeyAccessControl.SUPER_ADMIN_EMAIL;
            if (!email || !superAdminEmail) return false;
            return email === superAdminEmail.toLowerCase();
        }
        
        // Check if current user is admin (domain admin or super admin)
        isAdmin() {
            const session = window.cavUserSession || window.CAVSecurity?.SecureSessionManager?.getSession?.();
            return session?.role === 'admin';
        }
        
        // Check if current user is domain admin (not super admin)
        isDomainAdmin() {
            return this.isAdmin() && !this.isSuperAdmin();
        }

        // Get current user email - ROBUST multi-source check
        getCurrentUserEmail() {
            try {
                // 1. Check window.cavUserSession
                if (window.cavUserSession?.email) {
                    return window.cavUserSession.email.toLowerCase();
                }
                
                // 2. Check CAVSecurity SecureSessionManager
                const secureSession = window.CAVSecurity?.SecureSessionManager?.getSession?.();
                if (secureSession?.email) {
                    return secureSession.email.toLowerCase();
                }
                
                // 3. Check localStorage cav_session
                try {
                    const cavSession = JSON.parse(localStorage.getItem('cav_session') || 'null');
                    if (cavSession?.email) {
                        return cavSession.email.toLowerCase();
                    }
                } catch (e) {}
                
                // 4. Check localStorage cav_user_session
                try {
                    const userSession = JSON.parse(localStorage.getItem('cav_user_session') || 'null');
                    if (userSession?.email) {
                        return userSession.email.toLowerCase();
                    }
                } catch (e) {}
                
                // 5. Check localStorage cav_secure_session_v3
                try {
                    const secureSession = JSON.parse(localStorage.getItem('cav_secure_session_v3') || 'null');
                    if (secureSession?.email) {
                        return secureSession.email.toLowerCase();
                    }
                } catch (e) {}
                
                // 6. Check localStorage cav_last_user_email
                const lastEmail = localStorage.getItem('cav_last_user_email');
                if (lastEmail && lastEmail !== 'anonymous') {
                    return lastEmail.toLowerCase();
                }
                
                return null;
            } catch (e) {
                return null;
            }
        }
        
        // Get current user's domain
        getCurrentUserDomain() {
            const email = this.getCurrentUserEmail();
            if (!email) return null;
            return email.split('@')[1]?.toLowerCase() || null;
        }
        
        // Check if a user is in the same domain as current admin
        isUserInMyDomain(userEmail) {
            if (!userEmail) return false;
            const myDomain = this.getCurrentUserDomain();
            const userDomain = userEmail.split('@')[1]?.toLowerCase();
            return myDomain === userDomain;
        }
        
        // Check if current user can manage another user
        canManageUser(userEmail) {
            if (this.isSuperAdmin()) return true; // Super admin can manage anyone
            if (!this.isAdmin()) return false;
            return this.isUserInMyDomain(userEmail); // Domain admins can only manage their domain
        }
        
        // Get users filtered by domain (for domain isolation)
        getUsersForCurrentAdmin() {
            const allUsers = this.getAllUsersWithActivityRaw();
            if (this.isSuperAdmin()) {
                return allUsers; // Super admin sees everyone
            }
            // Domain admin only sees their domain
            return allUsers.filter(user => this.isUserInMyDomain(user.email));
        }
        
        // Get all users with activity (raw, no filtering)
        getAllUsersWithActivityRaw() {
            const users = new Map();
            
            // Get users from usage stats
            Object.values(this.usageStats).forEach(stat => {
                if (stat.userEmail && !users.has(stat.userEmail)) {
                    users.set(stat.userEmail, {
                        email: stat.userEmail,
                        hasActivity: true,
                        ownKeys: {}
                    });
                }
            });
            
            // Get managed users from global auth
            const managedUsers = window.getManagedUsers?.() || {};
            Object.entries(managedUsers).forEach(([email, userData]) => {
                if (!users.has(email)) {
                    users.set(email, {
                        email: email,
                        name: userData.name,
                        role: userData.role,
                        hasActivity: false,
                        ownKeys: {}
                    });
                } else {
                    users.get(email).name = userData.name;
                    users.get(email).role = userData.role;
                }
            });
            
            // Check which users have their own keys
            const providers = ['gemini', 'openai', 'claude', 'searchapi'];
            users.forEach((userData, email) => {
                providers.forEach(provider => {
                    userData.ownKeys[provider] = this.userHasOwnKey(provider, email);
                });
            });
            
            return Array.from(users.values());
        }

        // Grant access to a user for specific provider
        // Check if a user has their own API key configured
        userHasOwnKey(provider, userEmail) {
            if (!userEmail) return false;
            
            const userStorageKey = `cav_v3_settings_${userEmail.replace(/[^a-z0-9]/gi, '_')}`;
            try {
                const userSettings = JSON.parse(localStorage.getItem(userStorageKey) || '{}');
                const key = userSettings.apiKeys?.[provider]?.key;
                return key && key.length > 10; // Has a valid-looking key
            } catch (e) {
                return false;
            }
        }

        grantAccess(provider, userEmail) {
            if (!this.isAdmin()) {
                console.warn('[API Access] Only admins can grant access');
                return false;
            }
            
            const email = userEmail.toLowerCase();
            
            // Domain isolation: Check if admin can manage this user
            if (!this.canManageUser(email)) {
                console.warn('[API Access] Cannot manage user from different domain');
                alert(`Cannot grant access: ${email} is not in your domain. You can only manage users with @${this.getCurrentUserDomain()} emails.`);
                return false;
            }
            
            // Check if user has their own key - can't override their choice
            if (this.userHasOwnKey(provider, email)) {
                console.warn('[API Access] User has their own key configured - cannot grant shared access');
                alert(`Cannot grant access: ${email} has their own ${this.getProviderDisplayName(provider)} API key configured. They must remove it first to use shared access.`);
                return false;
            }

            // Get domain-specific storage key
            const domainKey = this.getDomainStorageKey();
            
            if (!this.accessList.sharedKeys[provider]) {
                this.accessList.sharedKeys[provider] = {
                    enabled: true,
                    allowedUsers: [],
                    revokedUsers: [],
                    domain: this.getCurrentUserDomain() // Track which domain this sharing is for
                };
            }

            const config = this.accessList.sharedKeys[provider];

            // Remove from revoked if present
            config.revokedUsers = config.revokedUsers.filter(e => e !== email);

            // Add to allowed if not already
            if (!config.allowedUsers.includes(email)) {
                config.allowedUsers.push(email);
            }

            this.accessList.adminEmail = this.getCurrentUserEmail();
            this.accessList.adminDomain = this.getCurrentUserDomain();
            this.saveAccessList();
            console.log('[API Access] Granted', provider, 'access to:', email, 'in domain:', this.getCurrentUserDomain());
            return true;
        }
        
        // Get domain-specific storage key
        getDomainStorageKey() {
            const domain = this.getCurrentUserDomain();
            return domain ? `cav_api_access_${domain.replace(/[^a-z0-9]/gi, '_')}` : API_ACCESS_STORAGE_KEY;
        }

        // Revoke access from a user
        revokeAccess(provider, userEmail) {
            if (!this.isAdmin()) {
                console.warn('[API Access] Only admins can revoke access');
                return false;
            }

            if (!this.accessList.sharedKeys[provider]) return false;

            const config = this.accessList.sharedKeys[provider];
            const email = userEmail.toLowerCase();

            // Remove from allowed
            config.allowedUsers = config.allowedUsers.filter(e => e !== email);

            // Add to revoked
            if (!config.revokedUsers.includes(email)) {
                config.revokedUsers.push(email);
            }

            this.saveAccessList();
            console.log('[API Access] Revoked', provider, 'access from:', email);
            return true;
        }

        // Enable/disable sharing for a provider
        setProviderSharing(provider, enabled) {
            if (!this.isAdmin()) return false;

            if (!this.accessList.sharedKeys[provider]) {
                this.accessList.sharedKeys[provider] = {
                    enabled: false,
                    allowedUsers: [],
                    revokedUsers: []
                };
            }

            this.accessList.sharedKeys[provider].enabled = enabled;
            
            const adminEmail = this.getCurrentUserEmail();
            this.accessList.adminEmail = adminEmail;
            this.accessList.adminDomain = this.getCurrentUserDomain();
            
            // When enabling sharing, ensure admin's API key is in user-specific storage
            if (enabled && adminEmail) {
                this.ensureAdminKeyInUserStorage(provider, adminEmail);
            }
            
            this.saveAccessList();
            console.log('[API Access] Provider sharing set:', provider, enabled, 'admin:', adminEmail);
            return true;
        }
        
        // Ensure admin's API key is saved to user-specific storage
        ensureAdminKeyInUserStorage(provider, adminEmail) {
            if (!adminEmail) return;
            
            const adminStorageKey = `cav_v3_settings_${adminEmail.toLowerCase().replace(/[^a-z0-9]/gi, '_')}`;
            
            try {
                // Get current admin settings
                let adminSettings = JSON.parse(localStorage.getItem(adminStorageKey) || '{}');
                
                // Check if key already exists in user-specific storage
                const existingKey = adminSettings.apiKeys?.[provider]?.key;
                if (existingKey && existingKey.length > 10) {
                    console.log('[API Access] Admin key already in user-specific storage for:', provider);
                    return;
                }
                
                // Get key from anonymous storage
                const anonymousSettings = JSON.parse(localStorage.getItem('cav_v3_settings') || '{}');
                const anonymousKey = anonymousSettings.apiKeys?.[provider];
                
                if (anonymousKey?.key && anonymousKey.key.length > 10) {
                    // Initialize apiKeys object if needed
                    if (!adminSettings.apiKeys) {
                        adminSettings.apiKeys = {};
                    }
                    
                    // Copy the key to user-specific storage
                    adminSettings.apiKeys[provider] = { ...anonymousKey };
                    adminSettings.updatedAt = new Date().toISOString();
                    
                    localStorage.setItem(adminStorageKey, JSON.stringify(adminSettings));
                    console.log('[API Access] Copied admin API key to user-specific storage for:', provider);
                } else {
                    console.warn('[API Access] No API key found to copy for:', provider);
                }
            } catch (e) {
                console.error('[API Access] Error ensuring admin key storage:', e);
            }
        }

        // Check if current user has access to admin's API key
        hasAccessToAdminKey(provider) {
            const currentEmail = this.getCurrentUserEmail();
            if (!currentEmail) {
                console.log(`[API Access] No current user email, cannot check access for ${provider}`);
                return false;
            }

            // Admins always have access
            if (this.isAdmin()) {
                console.log(`[API Access] User ${currentEmail} is admin, has access to ${provider}`);
                return true;
            }

            const config = this.accessList.sharedKeys[provider];
            if (!config) {
                console.log(`[API Access] No sharing config for ${provider}`);
                return false;
            }
            
            if (!config.enabled) {
                console.log(`[API Access] Sharing disabled for ${provider}`);
                return false;
            }

            // Check if explicitly revoked
            if (config.revokedUsers && config.revokedUsers.includes(currentEmail)) {
                console.log(`[API Access] User ${currentEmail} is revoked from ${provider}`);
                return false;
            }

            // Check if explicitly allowed OR if allowedUsers is empty (share with all)
            const allowedUsers = config.allowedUsers || [];
            const hasAccess = allowedUsers.length === 0 || allowedUsers.includes(currentEmail);
            
            if (hasAccess) {
                console.log(`[API Access] ✅ User ${currentEmail} has access to shared ${provider} key`);
            } else {
                console.log(`[API Access] User ${currentEmail} NOT in allowed list for ${provider}. Allowed: ${JSON.stringify(allowedUsers)}`);
            }
            
            return hasAccess;
        }

        // Get the API key to use (admin's shared key or user's own)
        getAPIKey(provider, settingsManager) {
            const currentEmail = this.getCurrentUserEmail();
            console.log(`[API Access] getAPIKey called for ${provider} by ${currentEmail || 'unknown user'}`);
            
            // Map provider names to platform credentials keys
            const providerMap = {
                'openai': 'openai',
                'claude': 'anthropic',
                'gemini': 'gemini',
                'searchapi': 'searchapi'
            };
            const platformProvider = providerMap[provider] || provider;
            
            // If user has their own key, they can choose to use it
            const ownKey = settingsManager.settings.apiKeys[provider]?.key;
            
            if (ownKey && ownKey.length >= 10) {
                console.log(`[API Access] User ${currentEmail} has own ${provider} key, using it`);
                this.trackUsage(provider, currentEmail, 'own_key');
                return { key: ownKey, source: 'own' };
            }
            
            console.log(`[API Access] No own key, checking for shared ${provider} key...`);
            
            // === CHECK 1: cav_platform_credentials (Settings → API Sharing tab) ===
            try {
                const platformCreds = settingsManager.getSharedPlatformCredentials() || 
                                     JSON.parse(localStorage.getItem('cav_platform_credentials') || '{}');
                const sharing = platformCreds.sharing || {};
                
                console.log(`[API Access] Platform credentials sharing:`, { 
                    enabled: sharing.enabled, 
                    globalUniversalShare: sharing.globalUniversalShare,
                    hasSharedKeys: Object.keys(platformCreds.sharedKeys || {}).length > 0
                });
                
                if (sharing.enabled) {
                    const sharedKeys = platformCreds.sharedKeys || {};
                    const sharedKey = sharedKeys[platformProvider] || sharedKeys[provider];
                    
                    if (sharedKey && sharedKey.length >= 10) {
                        // Check if user is allowed
                        const allowedEmails = (sharing.allowedEmails || []).map(e => e.toLowerCase().trim());
                        const userDomain = '@' + (currentEmail?.split('@')[1] || '');
                        
                        // Global universal share OR no email restrictions OR user is in list
                        const isAllowed = sharing.globalUniversalShare || 
                                         allowedEmails.length === 0 || 
                                         allowedEmails.includes(currentEmail) ||
                                         allowedEmails.some(e => e.startsWith('@') && e === userDomain);
                        
                        if (isAllowed) {
                            console.log(`[API Access] ✅ Using shared ${provider} key from platform credentials`);
                            this.trackUsage(provider, currentEmail, 'platform_shared');
                            
                            // Also sync to legacy storage for ai-library-integration.js
                            if (provider === 'gemini') {
                                localStorage.setItem('cav_ai_api_key', sharedKey);
                                localStorage.setItem('cav_gemini_api_key', sharedKey);
                            }
                            
                            return { key: sharedKey, source: 'platform_shared' };
                        } else {
                            console.log(`[API Access] User ${currentEmail} not in allowed list for platform sharing`);
                        }
                    }
                }
            } catch (e) {
                console.warn('[API Access] Error checking platform credentials:', e);
            }
            
            // === CHECK 2: cav_api_access_control (API Access Control system) ===
            if (this.hasAccessToAdminKey(provider)) {
                // Load admin's key from their storage
                const adminKey = this.getAdminAPIKey(provider);
                if (adminKey && adminKey.length >= 10) {
                    console.log(`[API Access] ✅ Using shared ${provider} key from admin (${this.accessList.adminEmail || 'system'})`);
                    // Track usage
                    this.trackUsage(provider, currentEmail, 'admin_key');
                    
                    // Also sync to legacy storage for ai-library-integration.js
                    if (provider === 'gemini') {
                        localStorage.setItem('cav_ai_api_key', adminKey);
                        localStorage.setItem('cav_gemini_api_key', adminKey);
                    }
                    
                    return { key: adminKey, source: 'admin', admin: this.accessList.adminEmail };
                } else {
                    console.warn(`[API Access] User has access but admin key not found for ${provider}`);
                }
            }

            console.log(`[API Access] No key available for ${provider}`);
            return { key: null, source: null };
        }

        // Get admin's API key from their storage (or current user if they're admin)
        getAdminAPIKey(provider) {
            const currentUserEmail = this.getCurrentUserEmail();
            const isCurrentUserAdmin = this.isAdmin();
            
            // If current user is admin, check their own keys first
            if (isCurrentUserAdmin && currentUserEmail) {
                const currentUserKey = `cav_v3_settings_${currentUserEmail.replace(/[^a-z0-9]/gi, '_')}`;
                try {
                    const currentUserSettings = JSON.parse(localStorage.getItem(currentUserKey) || '{}');
                    let key = currentUserSettings.apiKeys?.[provider]?.key;
                    if (key && key.length > 10) {
                        console.log('[API Access] Found key in current admin storage for:', provider);
                        return key;
                    }
                } catch (e) {
                    console.warn('[API Access] Error reading current admin keys:', e);
                }
            }
            
            // Fallback: Check anonymous storage (shared main settings)
            try {
                const anonymousSettings = JSON.parse(localStorage.getItem('cav_v3_settings') || '{}');
                let key = anonymousSettings.apiKeys?.[provider]?.key;
                
                if (key && key.length > 10) {
                    console.log('[API Access] Found key in main anonymous storage for:', provider);
                    return key;
                }
            } catch (e) {
                console.warn('[API Access] Error reading anonymous settings:', e);
            }
            
            // Fallback: Check legacy storage keys for specific providers
            if (provider === 'gemini') {
                const legacyKey = localStorage.getItem('cav_ai_api_key') || localStorage.getItem('cav_gemini_api_key');
                if (legacyKey && legacyKey.length > 10) {
                    console.log('[API Access] Found Gemini key in legacy storage');
                    return legacyKey;
                }
            }
            
            // If accessList has a specific admin email, try their storage
            if (this.accessList.adminEmail) {
                const adminEmail = this.accessList.adminEmail.toLowerCase();
                const adminStorageKey = `cav_v3_settings_${adminEmail.replace(/[^a-z0-9]/gi, '_')}`;
                
                try {
                    const adminSettings = JSON.parse(localStorage.getItem(adminStorageKey) || '{}');
                    let key = adminSettings.apiKeys?.[provider]?.key;
                    
                    if (key && key.length > 10) {
                        console.log('[API Access] Found admin key in stored admin user storage for:', provider);
                        return key;
                    }
                } catch (e) {
                    console.warn('[API Access] Error reading stored admin settings:', e);
                }
            }
            
            console.warn('[API Access] No key found for provider:', provider);
            return null;
        }

        // Track API usage
        trackUsage(provider, userEmail, keySource) {
            const today = new Date().toISOString().split('T')[0];
            const key = `${provider}_${userEmail}_${today}`;

            if (!this.usageStats[key]) {
                this.usageStats[key] = {
                    provider,
                    userEmail,
                    date: today,
                    keySource,
                    requests: 0,
                    estimatedTokens: 0,
                    lastRequest: null
                };
            }

            this.usageStats[key].requests++;
            this.usageStats[key].lastRequest = new Date().toISOString();
            this.saveUsageStats();
        }

        // Track token usage
        trackTokens(provider, userEmail, tokens) {
            const today = new Date().toISOString().split('T')[0];
            const key = `${provider}_${userEmail}_${today}`;

            if (!this.usageStats[key]) {
                this.usageStats[key] = {
                    provider,
                    userEmail,
                    date: today,
                    keySource: 'unknown',
                    requests: 0,
                    estimatedTokens: 0,
                    lastRequest: null
                };
            }

            this.usageStats[key].estimatedTokens += tokens;
            this.saveUsageStats();
        }

        // Get usage stats for admin view
        getUsageStats(filters = {}) {
            let results = Object.values(this.usageStats);

            if (filters.provider) {
                results = results.filter(s => s.provider === filters.provider);
            }
            if (filters.userEmail) {
                results = results.filter(s => s.userEmail === filters.userEmail);
            }
            if (filters.date) {
                results = results.filter(s => s.date === filters.date);
            }
            if (filters.keySource) {
                results = results.filter(s => s.keySource === filters.keySource);
            }

            // Sort by date descending
            results.sort((a, b) => new Date(b.date) - new Date(a.date));
            return results;
        }

        // Get total usage for a user
        getUserTotalUsage(userEmail) {
            const stats = Object.values(this.usageStats).filter(s => s.userEmail === userEmail);
            return {
                totalRequests: stats.reduce((sum, s) => sum + s.requests, 0),
                totalTokens: stats.reduce((sum, s) => sum + s.estimatedTokens, 0),
                providers: [...new Set(stats.map(s => s.provider))],
                firstUse: stats.length > 0 ? stats[stats.length - 1].date : null,
                lastUse: stats.length > 0 ? stats[0].lastRequest : null
            };
        }

        // Get all users with access
        getAccessList(provider = null) {
            if (provider) {
                return this.accessList.sharedKeys[provider] || { enabled: false, allowedUsers: [], revokedUsers: [] };
            }
            return this.accessList.sharedKeys;
        }

        // Clear usage stats (admin only)
        clearUsageStats(filters = {}) {
            if (!this.isAdmin()) return false;

            if (Object.keys(filters).length === 0) {
                this.usageStats = {};
            } else {
                // Selective clear
                Object.keys(this.usageStats).forEach(key => {
                    const stat = this.usageStats[key];
                    let shouldDelete = true;

                    if (filters.provider && stat.provider !== filters.provider) shouldDelete = false;
                    if (filters.userEmail && stat.userEmail !== filters.userEmail) shouldDelete = false;
                    if (filters.beforeDate && new Date(stat.date) >= new Date(filters.beforeDate)) shouldDelete = false;

                    if (shouldDelete) delete this.usageStats[key];
                });
            }

            this.saveUsageStats();
            return true;
        }

        // Render access control UI (for admin settings)
        renderAccessControlUI() {
            // REGULAR USERS: Show simple access status ONLY (no admin controls!)
            if (!this.isAdmin()) {
                const providers = ['gemini', 'openai', 'claude', 'searchapi'];
                const hasAnyAccess = providers.some(p => this.hasAccessToAdminKey(p));
                
                return `
                    <div class="settings-api-access user-view">
                        <h4>${ICONS.key} Your API Access Status</h4>
                        ${hasAnyAccess ? `
                            <div class="access-status-card success">
                                <div class="status-header">
                                    <span class="status-icon">${ICONS.check}</span>
                                    <span class="status-title">You have shared API access</span>
                                </div>
                                <p class="status-desc">Your admin has granted you access to some API keys. You can use AI features without configuring your own keys for these providers:</p>
                                <div class="provider-status-list">
                                    ${providers.map(p => {
                                        const hasAccess = this.hasAccessToAdminKey(p);
                                        return `
                                            <div class="provider-status-item ${hasAccess ? 'granted' : 'none'}">
                                                <span class="provider-icon">${hasAccess ? ICONS.check : ICONS.x}</span>
                                                <span class="provider-label">${this.getProviderDisplayName(p)}</span>
                                                <span class="provider-badge">${hasAccess ? 'Shared Access' : 'Configure Below'}</span>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        ` : `
                            <div class="access-status-card warning">
                                <div class="status-header">
                                    <span class="status-icon">${ICONS.key}</span>
                                    <span class="status-title">Configure Your API Keys</span>
                                </div>
                                <p class="status-desc">You don't have shared API access. Please enter your own API keys below to use AI features.</p>
                            </div>
                        `}
                        <p class="access-tip">
                            <strong>Tip:</strong> Your keys are stored locally and securely encrypted. They're never shared with anyone.
                        </p>
                    </div>
                `;
            }
            
            // =============================================
            // ADMIN USERS: Show full access control panel
            // Super Admin sees all domains, Domain Admin sees only their domain
            // =============================================

            const providers = ['gemini', 'openai', 'claude', 'searchapi'];
            const isSuperAdmin = this.isSuperAdmin();
            const currentDomain = this.getCurrentUserDomain();
            const allUsers = this.getUsersForCurrentAdmin(); // Domain-filtered users

            return `
                <div class="settings-api-access admin-view">
                    <!-- Admin Header with Domain Info -->
                    <div class="admin-header">
                        <h4>${ICONS.lock} API Key Access Control</h4>
                        <div class="admin-badge ${isSuperAdmin ? 'super-admin' : 'domain-admin'}">
                            ${isSuperAdmin ? `${ICONS.shield} Super Admin` : `${ICONS.users} Domain Admin`}
                        </div>
                    </div>
                    
                    <div class="domain-info-box">
                        ${isSuperAdmin ? `
                            <p>${ICONS.globe} <strong>Super Admin Access:</strong> You can view and manage all domains and users across the entire platform.</p>
                        ` : `
                            <p>${ICONS.users} <strong>Domain:</strong> @${currentDomain}</p>
                            <p class="domain-note">You can only manage users within your domain. Other domains are isolated.</p>
                        `}
                    </div>
                    
                    <p class="access-intro">Share your API keys with ${isSuperAdmin ? 'any team member' : `@${currentDomain} team members`}. Users who configure their own keys cannot receive shared access.</p>
                    
                    <!-- Provider Sharing Toggles -->
                    <div class="api-access-providers">
                        ${providers.map(provider => {
                            const config = this.accessList.sharedKeys[provider] || { enabled: false, allowedUsers: [], revokedUsers: [] };
                            const hasKey = this.getAdminAPIKey(provider);
                            const domainUsers = allUsers.filter(u => !u.ownKeys?.[provider]); // Users eligible for sharing
                            return `
                                <div class="api-provider-access ${config.enabled ? 'enabled' : ''}" data-provider="${provider}">
                                    <div class="provider-header">
                                        <div class="provider-info">
                                            <span class="provider-name">${this.getProviderDisplayName(provider)}</span>
                                            ${hasKey ? `
                                                <span class="key-badge configured">${ICONS.check} Key Ready</span>
                                            ` : `
                                                <span class="key-badge no-key">${ICONS.x} No Key</span>
                                            `}
                                        </div>
                                        <div class="provider-toggle">
                                            <span class="sharing-label ${config.enabled ? 'on' : 'off'}">
                                                ${config.enabled ? 'Sharing ON' : 'Sharing OFF'}
                                            </span>
                                            <label class="toggle-switch ${!hasKey ? 'disabled' : ''}" ${!hasKey ? 'title="Configure API key first"' : ''}>
                                                <input type="checkbox" 
                                                    class="sharing-toggle"
                                                    data-provider="${provider}"
                                                    ${config.enabled ? 'checked' : ''} 
                                                    ${!hasKey ? 'disabled' : ''}>
                                                <span class="toggle-slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                    ${config.enabled ? `
                                        <div class="provider-access-config">
                                            <p class="sharing-info">
                                                ${ICONS.check} Sharing with <strong>${domainUsers.length > 0 ? domainUsers.length : 'all eligible'}</strong> 
                                                ${isSuperAdmin ? 'users' : `@${currentDomain} users`}
                                            </p>
                                        </div>
                                    ` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <!-- User Access Management -->
                    <div class="user-access-management">
                        <h4>${ICONS.users} User API Access Management ${isSuperAdmin ? '(All Domains)' : `(@${currentDomain})`}</h4>
                        <p class="management-intro">
                            ${isSuperAdmin ? 
                                'View and manage API access for all users across all domains.' :
                                `Manage API access for users in your domain (@${currentDomain}). You cannot manage users from other domains.`
                            }
                        </p>
                        
                        ${allUsers.length > 0 ? `
                            <div class="user-access-table-container">
                                <table class="user-access-table">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            ${providers.map(p => `<th>${this.getProviderDisplayName(p)}</th>`).join('')}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${allUsers.filter(u => u.email !== this.accessList.adminEmail).map(user => `
                                            <tr>
                                                <td>
                                                    <div class="user-info">
                                                        <span class="user-name">${user.name || user.email.split('@')[0]}</span>
                                                        <span class="user-email">${user.email}</span>
                                                    </div>
                                                </td>
                                                ${providers.map(provider => {
                                                    const config = this.accessList.sharedKeys[provider] || { enabled: false, allowedUsers: [], revokedUsers: [] };
                                                    const hasOwnKey = user.ownKeys[provider];
                                                    const hasSharedAccess = config.enabled && 
                                                        (config.allowedUsers.length === 0 || config.allowedUsers.includes(user.email)) &&
                                                        !config.revokedUsers.includes(user.email) &&
                                                        !hasOwnKey;
                                                    const isRevoked = config.revokedUsers.includes(user.email);
                                                    
                                                    if (hasOwnKey) {
                                                        return `<td><span class="access-badge own-key" title="User has their own key">Own Key</span></td>`;
                                                    } else if (!config.enabled) {
                                                        return `<td><span class="access-badge disabled" title="Sharing not enabled">-</span></td>`;
                                                    } else if (hasSharedAccess) {
                                                        return `<td>
                                                            <span class="access-badge granted">${ICONS.check} Granted</span>
                                                            <button class="revoke-btn" data-provider="${provider}" data-email="${user.email}" title="Revoke access">${ICONS.x}</button>
                                                        </td>`;
                                                    } else if (isRevoked) {
                                                        return `<td>
                                                            <span class="access-badge revoked">Revoked</span>
                                                            <button class="grant-btn" data-provider="${provider}" data-email="${user.email}" title="Grant access">${ICONS.plus}</button>
                                                        </td>`;
                                                    } else {
                                                        return `<td>
                                                            <button class="grant-btn" data-provider="${provider}" data-email="${user.email}" title="Grant access">${ICONS.plus} Grant</button>
                                                        </td>`;
                                                    }
                                                }).join('')}
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div class="access-legend">
                                <span class="legend-item"><span class="access-badge own-key">Own Key</span> User has their own key (cannot grant shared)</span>
                                <span class="legend-item"><span class="access-badge granted">${ICONS.check}</span> Has shared access</span>
                                <span class="legend-item"><span class="access-badge revoked">Revoked</span> Access revoked</span>
                            </div>
                        ` : `
                            <p style="color: var(--cav-text-muted); font-style: italic;">No team members found. Users will appear here after they sign in.</p>
                        `}
                        
                        <!-- Add new user -->
                        <div class="add-user-form">
                            <h5>Add User Access</h5>
                            <div class="add-user-inputs">
                                <input type="email" id="new-user-email" placeholder="user@email.com" class="user-email-input">
                                <select id="new-user-provider" class="provider-select">
                                    <option value="">Select Provider</option>
                                    ${providers.map(p => `<option value="${p}">${this.getProviderDisplayName(p)}</option>`).join('')}
                                </select>
                                <button class="grant-access-btn" id="grant-new-user-btn">
                                    ${ICONS.plus} Grant Access
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Usage Statistics -->
                    <div class="api-usage-stats">
                        <h4>${ICONS.chart} API Usage Statistics</h4>
                        <div class="usage-summary">
                            ${this.renderUsageSummary()}
                        </div>
                        <div class="usage-details">
                            ${this.renderUsageDetails()}
                        </div>
                    </div>
                </div>
            `;
        }

        getProviderDisplayName(provider) {
            const names = {
                gemini: '🔮 Gemini',
                openai: '🤖 OpenAI',
                claude: 'Claude',
                searchapi: 'SearchAPI'
            };
            return names[provider] || provider;
        }

        getAllUsersWithActivity() {
            const users = new Map(); // email -> user data
            
            // Get users from usage stats
            Object.values(this.usageStats).forEach(stat => {
                if (!users.has(stat.userEmail)) {
                    users.set(stat.userEmail, {
                        email: stat.userEmail,
                        hasActivity: true,
                        ownKeys: {}
                    });
                }
            });
            
            // Get managed users from global auth
            const managedUsers = window.getManagedUsers?.() || {};
            Object.entries(managedUsers).forEach(([email, userData]) => {
                if (!users.has(email)) {
                    users.set(email, {
                        email: email,
                        name: userData.name,
                        role: userData.role,
                        hasActivity: false,
                        ownKeys: {}
                    });
                } else {
                    users.get(email).name = userData.name;
                    users.get(email).role = userData.role;
                }
            });
            
            // Check which users have their own keys for each provider
            const providers = ['gemini', 'openai', 'claude', 'searchapi'];
            users.forEach((userData, email) => {
                providers.forEach(provider => {
                    userData.ownKeys[provider] = this.userHasOwnKey(provider, email);
                });
            });
            
            return Array.from(users.values());
        }
        
        // Get user info by email
        getUserInfo(email) {
            const managedUsers = window.getManagedUsers?.() || {};
            const userData = managedUsers[email] || {};
            const providers = ['gemini', 'openai', 'claude', 'searchapi'];
            
            return {
                email: email,
                name: userData.name || email.split('@')[0],
                role: userData.role || 'editor',
                ownKeys: providers.reduce((acc, p) => {
                    acc[p] = this.userHasOwnKey(p, email);
                    return acc;
                }, {}),
                sharedAccess: providers.reduce((acc, p) => {
                    acc[p] = this.hasAccessToAdminKey(p) && !this.userHasOwnKey(p, email);
                    return acc;
                }, {})
            };
        }

        renderUsageSummary() {
            const users = this.getAllUsersWithActivity();
            if (users.length === 0) {
                return '<p class="no-data">No API usage recorded yet.</p>';
            }

            return `
                <table class="usage-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Requests</th>
                            <th>Est. Tokens</th>
                            <th>Last Active</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => {
                            const userEmail = typeof user === 'string' ? user : user.email;
                            const userName = typeof user === 'string' ? user.split('@')[0] : (user.name || user.email?.split('@')[0] || 'Unknown');
                            const usage = this.getUserTotalUsage(userEmail);
                            return `
                                <tr>
                                    <td>
                                        <div class="user-cell">
                                            <span class="user-name">${userName}</span>
                                            <span class="user-email">${userEmail}</span>
                                        </div>
                                    </td>
                                    <td>${usage.totalRequests.toLocaleString()}</td>
                                    <td>${usage.totalTokens.toLocaleString()}</td>
                                    <td>${usage.lastUse ? new Date(usage.lastUse).toLocaleDateString() : 'Never'}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        }

        renderUsageDetails() {
            const last7Days = this.getUsageStats().slice(0, 50);
            if (last7Days.length === 0) return '';

            return `
                <details>
                    <summary>View Detailed Usage (last 50 entries)</summary>
                    <table class="usage-table detail">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>User</th>
                                <th>Provider</th>
                                <th>Key Source</th>
                                <th>Requests</th>
                                <th>Tokens</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${last7Days.map(stat => `
                                <tr>
                                    <td>${stat.date}</td>
                                    <td>${stat.userEmail}</td>
                                    <td>${stat.provider}</td>
                                    <td><span class="badge ${stat.keySource === 'admin_key' ? 'shared' : 'own'}">${stat.keySource === 'admin_key' ? 'Shared' : 'Own'}</span></td>
                                    <td>${stat.requests}</td>
                                    <td>${stat.estimatedTokens.toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </details>
            `;
        }
    }

    // Initialize API Access Control
    const apiAccessControl = new APIKeyAccessControl();

    // ============================================
    // SETTINGS UI RENDERER
    // ============================================

    class SettingsUI {
        constructor(manager) {
            this.manager = manager;
        }

        render(container) {
            console.time('[Settings] Initial render');
            
            // Store container reference for lazy loading
            this._container = container;
            this._loadedSections = new Set(['api-keys']); // Track which sections are loaded
            this._currentSection = 'api-keys';
            
            // Get settings once (fast - just reads from memory)
            try {
                this._settings = this.manager.getSettings();
            } catch (error) {
                console.error('[Settings] Failed to get settings:', error);
                this._settings = {};
            }
            
            // Render immediately with only the first section
            this.renderContent(container, this._settings);
            console.timeEnd('[Settings] Initial render');
            console.log('[Settings] Loaded sections:', [...this._loadedSections]);
        }
        
        // Lazy load a section when its tab is clicked
        loadSection(sectionId) {
            if (this._loadedSections.has(sectionId)) {
                console.log(`[Settings] Section "${sectionId}" already loaded, skipping`);
                return false; // Already loaded
            }
            
            console.time(`[Settings] Load ${sectionId}`);
            
            const contentArea = this._container?.querySelector('.cav-settings-content');
            if (!contentArea) return false;
            
            // Get the placeholder
            const placeholder = contentArea.querySelector(`.cav-settings-section[data-section="${sectionId}"]`);
            if (!placeholder) {
                console.error(`[Settings] No placeholder found for ${sectionId}`);
                return false;
            }
            
            // Render the section content synchronously
            const settings = this._settings || this.manager.getSettings();
            let content = '';
            
            switch(sectionId) {
                case 'profile':
                    content = this.renderProfileSection(settings);
                    break;
                case 'model-config':
                    content = this.renderModelConfigSection(settings);
                    break;
                case 'features':
                    content = this.renderFeaturesSection(settings);
                    break;
                case 'brand-profiles':
                    content = this.renderBrandProfilesSection(settings);
                    break;
                case 'competitors':
                    content = this.renderCompetitorsSection(settings);
                    break;
                case 'notifications':
                    content = this.renderNotificationsSection(settings);
                    break;
                case 'data':
                    content = this.renderDataSection(settings);
                    break;
                case 'platform-admin':
                    content = this.renderPlatformAdminSection(settings);
                    break;
            }
            
            if (content) {
                // Create temp element to parse HTML
                const temp = document.createElement('div');
                temp.innerHTML = content.trim(); // trim to avoid whitespace issues
                const newSection = temp.firstElementChild;
                
                if (newSection) {
                    placeholder.replaceWith(newSection);
                    // Re-attach event handlers for new content
                    this.attachSectionEventHandlers(this._container, sectionId);
                    this._loadedSections.add(sectionId);
                    console.timeEnd(`[Settings] Load ${sectionId}`);
                    return true;
                }
            }
            
            console.error(`[Settings] Failed to load ${sectionId}`);
            return false;
        }
        
        renderContent(container, settings) {
            container.innerHTML = `
                <div class="cav-settings-page">
                    <div class="cav-settings-header">
                        <h1>${ICONS.settings} Settings</h1>
                        <p>Configure API keys, AI models, brand profiles, and system preferences</p>
                    </div>
                    
                    <div class="cav-settings-layout">
                        <div class="cav-settings-nav">
                            <button class="cav-settings-nav-btn" data-section="profile">
                                <span class="nav-icon">${ICONS.user}</span>
                                <span class="nav-label">Profile</span>
                            </button>
                            <button class="cav-settings-nav-btn active" data-section="api-keys">
                                <span class="nav-icon">${ICONS.key}</span>
                                <span class="nav-label">API Keys</span>
                            </button>
                            <button class="cav-settings-nav-btn" data-section="model-config">
                                <span class="nav-icon">${ICONS.cpu}</span>
                                <span class="nav-label">Model Config</span>
                            </button>
                            <button class="cav-settings-nav-btn" data-section="features">
                                <span class="nav-icon">${ICONS.sparkles}</span>
                                <span class="nav-label">Features</span>
                            </button>
                            <button class="cav-settings-nav-btn" data-section="brand-profiles">
                                <span class="nav-icon">${ICONS.palette}</span>
                                <span class="nav-label">Brand Profiles</span>
                            </button>
                            <button class="cav-settings-nav-btn" data-section="competitors">
                                <span class="nav-icon">${ICONS.eye}</span>
                                <span class="nav-label">Competitors</span>
                            </button>
                            <button class="cav-settings-nav-btn" data-section="notifications">
                                <span class="nav-icon">${ICONS.bell}</span>
                                <span class="nav-label">Notifications</span>
                            </button>
                            <button class="cav-settings-nav-btn" data-section="data">
                                <span class="nav-icon">${ICONS.database}</span>
                                <span class="nav-label">Data Management</span>
                            </button>
                            ${this.manager.isSuperAdmin() ? `
                            <button class="cav-settings-nav-btn admin-only" data-section="platform-admin">
                                <span class="nav-icon">${ICONS.users}</span>
                                <span class="nav-label">API Sharing</span>
                                <span class="admin-badge">Super Admin</span>
                            </button>
                            ` : ''}
                        </div>
                        
                        <div class="cav-settings-content">
                            ${this.renderProfileSection(settings)}
                            ${this.renderAPIKeysSection(settings)}
                            <div class="cav-settings-section" data-section="model-config"></div>
                            <div class="cav-settings-section" data-section="features"></div>
                            <div class="cav-settings-section" data-section="brand-profiles"></div>
                            <div class="cav-settings-section" data-section="competitors"></div>
                            <div class="cav-settings-section" data-section="notifications"></div>
                            <div class="cav-settings-section" data-section="data"></div>
                            ${this.manager.isSuperAdmin() ? '<div class="cav-settings-section" data-section="platform-admin"></div>' : ''}
                        </div>
                    </div>
                </div>
            `;

            this.attachEventHandlers(container);
        }

        // ============================================
        // PROFILE SECTION - Avatar & User Settings
        // ============================================
        
        renderProfileSection(settings) {
            const session = window.cavUserSession || window.CAVSecurity?.SecureSessionManager?.getSession?.() || {};
            const customAvatar = localStorage.getItem('cav_custom_avatar') || '';
            const currentPicture = customAvatar || session.picture || '';
            const userName = session.name || 'User';
            const userEmail = session.email || '';
            const userRole = session.role || 'viewer';
            
            const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            const fallbackAvatar = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect fill="#e1306c" width="120" height="120" rx="60"/><text x="60" y="75" font-family="system-ui" font-size="48" fill="white" text-anchor="middle" font-weight="bold">${initials}</text></svg>`)}`;
            
            return `
                <div class="cav-settings-section" data-section="profile">
                    <h2>${ICONS.user} Profile Settings</h2>
                    <p class="cav-settings-desc">Customize your profile picture. Your avatar will persist across all devices when you log in.</p>
                    
                    <div class="profile-card" style="display: flex; align-items: center; gap: 32px; padding: 32px; background: linear-gradient(135deg, rgba(225, 48, 108, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%); border-radius: 16px; border: 1px solid rgba(225, 48, 108, 0.3); margin-bottom: 24px;">
                        <!-- Avatar Preview -->
                        <div class="avatar-section" style="text-align: center;">
                            <div class="avatar-container" style="position: relative; width: 120px; height: 120px; margin: 0 auto 16px;">
                                <img id="profile-avatar-preview" 
                                     src="${currentPicture || fallbackAvatar}" 
                                     alt="Profile Avatar" 
                                     style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid #e1306c; box-shadow: 0 4px 20px rgba(225, 48, 108, 0.4);">
                                <button id="change-avatar-btn" 
                                        style="position: absolute; bottom: 0; right: 0; width: 36px; height: 36px; border-radius: 50%; background: #e1306c; border: 3px solid #0f0f14; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center;"
                                        title="Change Avatar">
                                    ${ICONS.edit || '✏️'}
                                </button>
                            </div>
                            <div style="color: white; font-weight: 600; font-size: 18px;">${userName}</div>
                            <div style="color: #94a3b8; font-size: 14px;">${userEmail}</div>
                            <div style="margin-top: 8px;">
                                <span style="background: ${userRole === 'admin' || userRole === 'super_admin' ? '#22c55e' : '#3b82f6'}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; text-transform: uppercase;">${userRole}</span>
                            </div>
                        </div>
                        
                        <!-- Avatar Options -->
                        <div class="avatar-options" style="flex: 1;">
                            <h4 style="margin: 0 0 16px; color: white;">Change Profile Picture</h4>
                            
                            <!-- Upload Image -->
                            <div class="avatar-option" style="margin-bottom: 16px;">
                                <label style="display: block; color: #94a3b8; margin-bottom: 8px; font-size: 13px;">Upload Your Own Image</label>
                                <div style="display: flex; gap: 12px;">
                                    <input type="file" id="avatar-upload-input" accept="image/*" style="display: none;">
                                    <button id="upload-avatar-btn" class="cav-btn" style="background: #334155; border: 1px solid #475569; color: white; padding: 10px 20px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                                        ${ICONS.upload || '📤'} Upload Image
                                    </button>
                                </div>
                                <p style="font-size: 12px; color: #64748b; margin-top: 8px;">Recommended: Square image, at least 200x200 pixels. Max 2MB.</p>
                            </div>
                            
                            <!-- AI Generate -->
                            <div class="avatar-option" style="margin-bottom: 16px;">
                                <label style="display: block; color: #94a3b8; margin-bottom: 8px; font-size: 13px;">Generate with AI</label>
                                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                                    <input type="text" id="ai-avatar-prompt" placeholder="Describe your ideal avatar..." 
                                           style="flex: 1; min-width: 200px; background: #0f0f14; border: 1px solid #334155; border-radius: 8px; padding: 10px; color: white;">
                                    <button id="generate-avatar-btn" class="cav-btn cav-btn-primary" style="background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%); border: none; padding: 10px 20px; border-radius: 8px; color: white; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                                        ${ICONS.sparkles} Generate
                                    </button>
                                </div>
                                <p style="font-size: 12px; color: #64748b; margin-top: 8px;">Example: "Professional headshot, modern style" or "Abstract geometric pattern"</p>
                            </div>
                            
                            <!-- Quick Options -->
                            <div class="avatar-option">
                                <label style="display: block; color: #94a3b8; margin-bottom: 8px; font-size: 13px;">Quick Options</label>
                                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                                    <button id="use-google-avatar-btn" class="cav-btn" style="background: #334155; border: 1px solid #475569; color: white; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 13px;">
                                        ${ICONS.google} Use Google Photo
                                    </button>
                                    <button id="use-initials-avatar-btn" class="cav-btn" style="background: #334155; border: 1px solid #475569; color: white; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 13px;">
                                        ${ICONS.user} Use Initials
                                    </button>
                                    ${customAvatar ? `
                                    <button id="remove-custom-avatar-btn" class="cav-btn" style="background: #dc2626; border: none; color: white; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 13px;">
                                        ${ICONS.trash || '🗑️'} Remove Custom
                                    </button>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Save Status -->
                    <div id="avatar-save-status" style="display: none; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px;"></div>
                </div>
            `;
        }

        renderAPIKeysSection(settings) {
            const providers = [
                { id: 'claude', name: 'Claude (Anthropic)', icon: ICONS.brain, desc: 'Primary reasoning engine for analysis and recommendations' },
                { id: 'openai', name: 'OpenAI', icon: ICONS.openai, desc: 'Vision capabilities for image/video analysis' },
                { id: 'searchapi', name: 'SearchAPI', icon: ICONS.search, desc: 'Web research and competitive intelligence' },
                { id: 'gemini', name: 'Google Gemini', icon: ICONS.google, desc: 'Image generation and multimodal analysis' },
                { id: 'googleVision', name: 'Google Cloud Vision', icon: ICONS.google, desc: 'Advanced object detection, face detection, OCR text extraction' }
            ];
            
            // Check if using shared keys
            const accessControl = window.CAVSettings?.apiAccess || apiAccessControl;
            const isAdmin = accessControl.isAdmin();

            return `
                <div class="cav-settings-section active" data-section="api-keys">
                    <h2>${ICONS.key} API Keys</h2>
                    <p class="cav-settings-desc">Configure your AI provider API keys. Keys are stored securely in your browser.</p>
                    
                    <!-- Security Notice -->
                    <div class="api-security-notice">
                        <div class="security-icon">${ICONS.shield}</div>
                        <div class="security-text">
                            <h4>Your API Keys Are Secure</h4>
                            <p>All keys are encrypted and stored locally on your device. They are never sent to our servers or exposed to third parties.</p>
                            <div class="security-features">
                                <span class="security-badge">${ICONS.lock} AES-256 Encrypted</span>
                                <span class="security-badge">${ICONS.database} Local Storage Only</span>
                                <span class="security-badge">${ICONS.x} Never Transmitted</span>
                                <span class="security-badge">${ICONS.user} User-Specific</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Shared Access Status (for users who have shared access AND keys are actually configured) -->
                    ${(() => {
                        // Check if any shared keys are actually configured
                        const platformCreds = JSON.parse(localStorage.getItem('cav_platform_credentials') || '{}');
                        const accessControlConfig = JSON.parse(localStorage.getItem('cav_api_access_control') || '{}');
                        const hasAnySharedKeys = Object.keys(platformCreds.sharedKeys || {}).length > 0 || 
                                                 Object.keys(accessControlConfig.sharedKeys || {}).length > 0;
                        const sharingEnabled = platformCreds.sharing?.enabled || accessControlConfig.enabled;
                        return hasAnySharedKeys && sharingEnabled;
                    })() ? `
                    <div class="shared-access-notice" style="margin-bottom: 24px; padding: 16px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px;">
                        <h4 style="margin: 0 0 8px; color: #22c55e;">${ICONS.check} Shared API Access Available</h4>
                        <p style="margin: 0; color: #94a3b8; font-size: 14px;">Your admin has shared API access with you. You can use AI features without your own keys, or configure your own keys below to use instead.</p>
                    </div>
                    ` : ''}
                    
                    <div class="cav-api-keys-grid">
                        ${providers.map(p => {
                            const keyData = settings.apiKeys[p.id];
                            const statusClass = keyData.status === 'active' ? 'success' : 
                                               keyData.status === 'error' ? 'error' : 'untested';
                            const statusIcon = keyData.status === 'active' ? ICONS.check : 
                                              keyData.status === 'error' ? ICONS.x : '';
                            const statusText = keyData.status === 'active' ? 'Connected' :
                                              keyData.status === 'error' ? 'Error' : 'Not Tested';
                            
                            // Check if user has shared access AND there's actually a shared key configured
                            const hasSharedAccess = accessControl.hasAccessToAdminKey(p.id);
                            // Actually verify a shared key exists before showing "Using Shared"
                            const sharedKeyResult = hasSharedAccess ? accessControl.getAPIKey(p.id, this.manager) : null;
                            const actuallyHasSharedKey = sharedKeyResult && sharedKeyResult.source === 'shared' && sharedKeyResult.key && sharedKeyResult.key.length > 10;
                            const usingShared = actuallyHasSharedKey && !keyData.key;
                            
                            return `
                                <div class="cav-api-key-card">
                                    <div class="cav-api-key-header">
                                        <span class="cav-api-key-icon">${p.icon}</span>
                                        <div>
                                            <h3>${p.name}</h3>
                                            <span class="cav-api-key-status ${statusClass}">${statusIcon} ${statusText}</span>
                                            ${usingShared ? `<span class="shared-badge">${ICONS.link} Using Shared</span>` : ''}
                                        </div>
                                    </div>
                                    <p class="cav-api-key-desc">${p.desc}</p>
                                    
                                    ${usingShared ? `
                                        <div class="shared-key-notice">
                                            <p>${ICONS.sparkles} You're using a shared API key from your admin. You can optionally enter your own key below for personal use.</p>
                                        </div>
                                    ` : ''}
                                    
                                    <div class="cav-api-key-input-group">
                                        <input type="password" 
                                               class="cav-api-key-input" 
                                               data-provider="${p.id}"
                                               placeholder="${usingShared ? 'Optional: Enter your own API key...' : 'Enter API key...'}"
                                               value="${keyData.key || ''}">
                                        <button class="cav-api-key-toggle" data-provider="${p.id}" title="Show/Hide">${ICONS.eye}</button>
                                    </div>
                                    
                                    <p class="key-security-note">
                                        ${ICONS.lock} Your key is encrypted and stored only on your device
                                    </p>
                                    
                                    ${p.id === 'openai' ? `
                                        <input type="text" 
                                               class="cav-api-key-input cav-org-id" 
                                               data-provider="openai-org"
                                               placeholder="Organization ID (optional)"
                                               value="${keyData.orgId || ''}">
                                    ` : ''}
                                    <div class="cav-api-key-actions">
                                        <button class="cav-btn cav-btn-secondary cav-save-api-key" data-provider="${p.id}">
                                            ${ICONS.save} Save Key
                                        </button>
                                        <button class="cav-btn cav-btn-primary cav-test-connection" data-provider="${p.id}">
                                            ${ICONS.plug} Test Connection
                                        </button>
                                        ${keyData.key ? `
                                        <button class="cav-btn cav-btn-danger cav-btn-small cav-delete-api-key" data-provider="${p.id}" title="Delete this API key">
                                            ${ICONS.trash}
                                        </button>
                                        ` : ''}
                                        ${keyData.lastTested ? `
                                            <span class="cav-last-tested">Last tested: ${new Date(keyData.lastTested).toLocaleString()}</span>
                                        ` : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <div class="cav-api-keys-footer">
                        <button class="cav-btn cav-btn-secondary" id="test-all-connections">
                            ${ICONS.refresh} Test All Connections
                        </button>
                        <div class="cav-api-help">
                            <h4>Where to get API keys:</h4>
                            <ul>
                                <li><a href="https://console.anthropic.com/settings/keys" target="_blank">Claude API Key →</a></li>
                                <li><a href="https://platform.openai.com/api-keys" target="_blank">OpenAI API Key →</a></li>
                                <li><a href="https://www.searchapi.io/dashboard" target="_blank">SearchAPI Key →</a></li>
                                <li><a href="https://aistudio.google.com/apikey" target="_blank">Gemini API Key →</a></li>
                            </ul>
                        </div>
                    </div>
                    
                    ${this.renderCloudinaryBYOKSection()}
                </div>
            `;
        }
        
        renderCloudinaryBYOKSection() {
            const userCreds = this.manager.getUserCloudinaryCredentials() || {};
            const hasCredentials = userCreds.cloudName && userCreds.apiKey && userCreds.apiSecret;
            
            return `
                <div class="cav-cloudinary-byok-section" style="margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                        <div style="width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #3448C5 0%, #2194E3 100%); color: white;">
                            ${ICONS.cloud}
                        </div>
                        <div>
                            <h3 style="margin: 0; color: white;">☁️ Your Cloudinary Account</h3>
                            <p style="margin: 4px 0 0; color: #94a3b8; font-size: 14px;">Required for video/image resizing - get a free account at <a href="https://cloudinary.com/users/register_free" target="_blank" style="color: #a855f7;">cloudinary.com</a></p>
                        </div>
                    </div>
                    
                    <div style="background: rgba(52, 72, 197, 0.1); border: 1px solid rgba(52, 72, 197, 0.3); border-radius: 12px; padding: 20px;">
                        ${hasCredentials ? `
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px; padding: 12px; background: rgba(34, 197, 94, 0.1); border-radius: 8px;">
                                <span style="color: #22c55e;">✓</span>
                                <span style="color: #22c55e;">Cloudinary configured: ${userCreds.cloudName}</span>
                            </div>
                        ` : `
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px; padding: 12px; background: rgba(245, 158, 11, 0.1); border-radius: 8px;">
                                <span style="color: #f59e0b;">⚠</span>
                                <span style="color: #f59e0b;">Cloudinary not configured - required for video resizing</span>
                            </div>
                        `}
                        
                        <div class="cav-cloudinary-fields" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                            <div class="cav-form-group">
                                <label style="display: block; color: #94a3b8; margin-bottom: 6px; font-size: 13px;">Cloud Name</label>
                                <input type="text" id="user-cloudinary-cloud-name" value="${userCreds.cloudName || ''}" placeholder="your-cloud-name" class="cav-input" style="width: 100%; background: #0f0f14; border: 1px solid #334155; border-radius: 8px; padding: 10px; color: white;">
                            </div>
                            <div class="cav-form-group">
                                <label style="display: block; color: #94a3b8; margin-bottom: 6px; font-size: 13px;">API Key</label>
                                <input type="text" id="user-cloudinary-api-key" value="${userCreds.apiKey || ''}" placeholder="123456789012345" class="cav-input" style="width: 100%; background: #0f0f14; border: 1px solid #334155; border-radius: 8px; padding: 10px; color: white;">
                            </div>
                            <div class="cav-form-group">
                                <label style="display: block; color: #94a3b8; margin-bottom: 6px; font-size: 13px;">API Secret</label>
                                <input type="password" id="user-cloudinary-api-secret" value="${userCreds.apiSecret || ''}" placeholder="••••••••••••••••" class="cav-input" style="width: 100%; background: #0f0f14; border: 1px solid #334155; border-radius: 8px; padding: 10px; color: white;">
                            </div>
                        </div>
                        
                        <div style="display: flex; gap: 12px; margin-top: 16px;">
                            <button class="cav-btn cav-btn-primary" id="save-user-cloudinary" style="flex: 1;">
                                💾 Save My Cloudinary Credentials
                            </button>
                            ${hasCredentials ? `
                                <button class="cav-btn cav-btn-secondary" id="clear-user-cloudinary" style="background: transparent; border: 1px solid #ef4444; color: #ef4444;">
                                    🗑️ Clear
                                </button>
                            ` : ''}
                        </div>
                        
                        <p style="font-size: 12px; color: #64748b; margin-top: 12px; text-align: center;">
                            🔒 Your credentials are stored securely in your browser and never shared.
                        </p>
                    </div>
                </div>
            `;
        }
        
        attachCloudinaryBYOKHandlers(container) {
            // Re-attach handlers after section refresh
            container.querySelector('#save-user-cloudinary')?.addEventListener('click', () => {
                const cloudName = container.querySelector('#user-cloudinary-cloud-name')?.value?.trim();
                const apiKey = container.querySelector('#user-cloudinary-api-key')?.value?.trim();
                const apiSecret = container.querySelector('#user-cloudinary-api-secret')?.value?.trim();
                
                if (!cloudName || !apiKey || !apiSecret) {
                    this.showToast('error', 'Please fill in all Cloudinary fields');
                    return;
                }
                
                if (this.manager.saveUserCloudinaryCredentials({ cloudName, apiKey, apiSecret })) {
                    this.showToast('success', 'Cloudinary credentials saved!');
                    const byokSection = container.querySelector('.cav-cloudinary-byok-section');
                    if (byokSection) {
                        byokSection.outerHTML = this.renderCloudinaryBYOKSection();
                        this.attachCloudinaryBYOKHandlers(container);
                    }
                }
            });
            
            container.querySelector('#clear-user-cloudinary')?.addEventListener('click', () => {
                if (confirm('Remove Cloudinary credentials?')) {
                    localStorage.removeItem('cav_user_cloudinary');
                    this.showToast('info', 'Credentials removed');
                    const byokSection = container.querySelector('.cav-cloudinary-byok-section');
                    if (byokSection) {
                        byokSection.outerHTML = this.renderCloudinaryBYOKSection();
                        this.attachCloudinaryBYOKHandlers(container);
                    }
                }
            });
        }

        renderModelConfigSection(settings) {
            const config = settings.modelConfig;
            
            return `
                <div class="cav-settings-section" data-section="model-config">
                    <h2>🤖 Model Configuration</h2>
                    <p class="cav-settings-desc">Configure AI model selection and parameters</p>
                    
                    <div class="cav-config-grid">
                        <div class="cav-config-item">
                            <label>Claude Model</label>
                            <select id="config-claude-model">
                                <option value="claude-sonnet-4-5-20250929" ${config.claudeModel === 'claude-sonnet-4-5-20250929' ? 'selected' : ''}>
                                    Claude Sonnet 4.5 🔥 (Recommended)
                                </option>
                                <option value="claude-opus-4-5-20250929" ${config.claudeModel === 'claude-opus-4-5-20250929' ? 'selected' : ''}>
                                    Claude Opus 4.5 (Complex Tasks)
                                </option>
                            </select>
                            <span class="cav-config-hint">Sonnet for most tasks, Opus for complex analysis</span>
                        </div>
                        
                        <div class="cav-config-item">
                            <label>OpenAI Vision Model</label>
                            <select id="config-openai-model">
                                <option value="gpt-5.2" ${config.openaiVisionModel === 'gpt-5.2' ? 'selected' : ''}>
                                    GPT-5.2 🚀 (Latest & Best)
                                </option>
                                <option value="gpt-5-mini" ${config.openaiVisionModel === 'gpt-5-mini' ? 'selected' : ''}>
                                    GPT-5 Mini (Faster)
                                </option>
                                <option value="gpt-4.1" ${config.openaiVisionModel === 'gpt-4.1' ? 'selected' : ''}>
                                    GPT-4.1 (Stable)
                                </option>
                            </select>
                            <span class="cav-config-hint">GPT-5.2 for best visual analysis quality</span>
                        </div>
                        
                        <div class="cav-config-item">
                            <label>Analysis Temperature: ${config.analysisTemperature}</label>
                            <input type="range" id="config-analysis-temp" 
                                   min="0" max="1" step="0.1" 
                                   value="${config.analysisTemperature}">
                            <span class="cav-config-hint">Lower = more focused, Higher = more creative</span>
                        </div>
                        
                        <div class="cav-config-item">
                            <label>Creative Suggestions Temperature: ${config.creativeTemperature}</label>
                            <input type="range" id="config-creative-temp" 
                                   min="0" max="1" step="0.1" 
                                   value="${config.creativeTemperature}">
                            <span class="cav-config-hint">Higher values for more diverse suggestions</span>
                        </div>
                        
                        <div class="cav-config-item">
                            <label>Max Tokens: ${config.maxTokens}</label>
                            <input type="range" id="config-max-tokens" 
                                   min="1024" max="8192" step="512" 
                                   value="${config.maxTokens}">
                            <span class="cav-config-hint">Maximum response length</span>
                        </div>
                    </div>
                    
                    <button class="cav-btn cav-btn-primary" id="save-model-config">
                        💾 Save Configuration
                    </button>
                </div>
            `;
        }

        renderFeaturesSection(settings) {
            const features = settings.features;
            
            const featureList = [
                { id: 'enableAIAnalysis', name: 'AI Analysis', desc: 'Enable AI-powered creative analysis (requires Claude or OpenAI)' },
                { id: 'enableWebResearch', name: 'Web Research', desc: 'Enable competitive research and benchmarks (requires SearchAPI)' },
                { id: 'enablePerformancePredictions', name: 'Performance Predictions', desc: 'Show predicted CTR, CPM, and engagement metrics' },
                { id: 'enableCompetitorMonitoring', name: 'Competitor Monitoring', desc: 'Track competitor ads automatically (requires SearchAPI)' },
                { id: 'enableAutoLearning', name: 'Auto-Learning Updates', desc: 'Automatically update best practices and benchmarks' },
                { id: 'showConfidenceScores', name: 'Confidence Scores', desc: 'Display confidence levels for AI predictions' }
            ];

            return `
                <div class="cav-settings-section" data-section="features">
                    <h2>${ICONS.sparkles} Feature Toggles</h2>
                    <p class="cav-settings-desc">Enable or disable specific features</p>
                    
                    <div class="cav-features-list">
                        ${featureList.map(f => `
                            <div class="cav-feature-item">
                                <div class="cav-feature-info">
                                    <h4>${f.name}</h4>
                                    <p>${f.desc}</p>
                                </div>
                                <label class="cav-toggle">
                                    <input type="checkbox" 
                                           data-feature="${f.id}" 
                                           ${features[f.id] ? 'checked' : ''}>
                                    <span class="cav-toggle-slider"></span>
                                </label>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        renderBrandProfilesSection(settings) {
            const profiles = settings.brandProfiles;
            
            return `
                <div class="cav-settings-section" data-section="brand-profiles">
                    <h2>${ICONS.palette} Brand Profiles</h2>
                    <p class="cav-settings-desc">Configure brand guidelines for compliance checking</p>
                    
                    <div class="cav-brand-profiles">
                        ${profiles.length === 0 ? `
                            <div class="cav-empty-state">
                                <span>🎨</span>
                                <p>No brand profiles configured</p>
                                <p>Add a brand profile to enable brand compliance checking</p>
                            </div>
                        ` : profiles.map(p => `
                            <div class="cav-brand-card" data-brand-id="${p.id}">
                                <div class="cav-brand-header">
                                    <h3>${p.name}</h3>
                                    ${p.isDefault ? '<span class="cav-brand-default">Default</span>' : ''}
                                </div>
                                <div class="cav-brand-colors">
                                    <span style="background: ${p.colors.primary}" title="Primary"></span>
                                    <span style="background: ${p.colors.secondary}" title="Secondary"></span>
                                    <span style="background: ${p.colors.accent}" title="Accent"></span>
                                </div>
                                <div class="cav-brand-actions">
                                    <button class="cav-btn cav-btn-small" data-action="edit-brand" data-id="${p.id}">✏️ Edit</button>
                                    <button class="cav-btn cav-btn-small cav-btn-danger" data-action="delete-brand" data-id="${p.id}">🗑️</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <button class="cav-btn cav-btn-primary" id="add-brand-profile">
                        ➕ Add Brand Profile
                    </button>
                </div>
            `;
        }

        renderCompetitorsSection(settings) {
            const competitors = settings.competitors;
            
            return `
                <div class="cav-settings-section" data-section="competitors">
                    <h2>${ICONS.eye} Competitors</h2>
                    <p class="cav-settings-desc">Track competitor creative strategies</p>
                    
                    <div class="cav-competitors-list">
                        ${competitors.length === 0 ? `
                            <div class="cav-empty-state">
                                <span>👀</span>
                                <p>No competitors configured</p>
                                <p>Add competitors to monitor their ad strategies</p>
                            </div>
                        ` : competitors.map(c => `
                            <div class="cav-competitor-card" data-competitor-id="${c.id}">
                                <div class="cav-competitor-info">
                                    <h3>${c.name}</h3>
                                    <span class="cav-competitor-domain">${c.domain}</span>
                                    <span class="cav-competitor-freq">Monitor: ${c.monitoringFrequency}</span>
                                </div>
                                <div class="cav-competitor-actions">
                                    <button class="cav-btn cav-btn-small" data-action="edit-competitor" data-id="${c.id}">✏️</button>
                                    <button class="cav-btn cav-btn-small cav-btn-danger" data-action="delete-competitor" data-id="${c.id}">🗑️</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <button class="cav-btn cav-btn-primary" id="add-competitor">
                        ➕ Add Competitor
                    </button>
                </div>
            `;
        }

        renderNotificationsSection(settings) {
            const notif = settings.notifications;
            
            return `
                <div class="cav-settings-section" data-section="notifications">
                    <h2>${ICONS.bell} Notifications</h2>
                    <p class="cav-settings-desc">Configure email and Slack alerts</p>
                    
                    <div class="cav-notification-settings">
                        <div class="cav-notification-channel">
                            <div class="cav-notification-header">
                                <h3>📧 Email Notifications</h3>
                                <label class="cav-toggle">
                                    <input type="checkbox" id="notif-email-enabled" ${notif.email.enabled ? 'checked' : ''}>
                                    <span class="cav-toggle-slider"></span>
                                </label>
                            </div>
                            <input type="email" 
                                   id="notif-email-address" 
                                   placeholder="your@email.com"
                                   value="${notif.email.address || ''}"
                                   ${!notif.email.enabled ? 'disabled' : ''}>
                        </div>
                        
                        <div class="cav-notification-channel">
                            <div class="cav-notification-header">
                                <h3>💬 Slack Notifications</h3>
                                <label class="cav-toggle">
                                    <input type="checkbox" id="notif-slack-enabled" ${notif.slack.enabled ? 'checked' : ''}>
                                    <span class="cav-toggle-slider"></span>
                                </label>
                            </div>
                            <input type="text" 
                                   id="notif-slack-webhook" 
                                   placeholder="https://hooks.slack.com/..."
                                   value="${notif.slack.webhookUrl || ''}"
                                   ${!notif.slack.enabled ? 'disabled' : ''}>
                        </div>
                        
                        <div class="cav-notification-freq">
                            <label>Alert Frequency</label>
                            <select id="notif-frequency">
                                <option value="immediate" ${notif.alertFrequency === 'immediate' ? 'selected' : ''}>Immediate</option>
                                <option value="hourly" ${notif.alertFrequency === 'hourly' ? 'selected' : ''}>Hourly Digest</option>
                                <option value="daily" ${notif.alertFrequency === 'daily' ? 'selected' : ''}>Daily Digest</option>
                            </select>
                        </div>
                    </div>
                    
                    <button class="cav-btn cav-btn-primary" id="save-notifications">
                        💾 Save Notification Settings
                    </button>
                </div>
            `;
        }

        renderDataSection(settings) {
            return `
                <div class="cav-settings-section" data-section="data">
                    <h2>${ICONS.database} Data Management</h2>
                    <p class="cav-settings-desc">Export, import, or clear your settings</p>
                    
                    <div class="cav-data-actions">
                        <div class="cav-data-action">
                            <h3>${ICONS.upload} Export Settings</h3>
                            <p>Download your settings as a JSON file (API keys excluded)</p>
                            <button class="cav-btn cav-btn-secondary" id="export-settings">
                                Export Settings
                            </button>
                        </div>
                        
                        <div class="cav-data-action">
                            <h3>${ICONS.download} Import Settings</h3>
                            <p>Restore settings from a previously exported file</p>
                            <input type="file" id="import-file" accept=".json" style="display: none;">
                            <button class="cav-btn cav-btn-secondary" id="import-settings">
                                Import Settings
                            </button>
                        </div>
                        
                        <div class="cav-data-action cav-data-danger">
                            <h3>🗑️ Clear All Data</h3>
                            <p>Remove all settings, brand profiles, and competitors</p>
                            <button class="cav-btn cav-btn-danger" id="clear-all-data">
                                Clear All Data
                            </button>
                        </div>
                    </div>
                    
                    <div class="cav-settings-info">
                        <p><strong>Settings Version:</strong> ${settings.version}</p>
                        <p><strong>Last Updated:</strong> ${settings.updatedAt ? new Date(settings.updatedAt).toLocaleString() : 'Never'}</p>
                    </div>
                </div>
            `;
        }

        // Super Admin Integration API Keys Section
        renderIntegrationKeysSection(settings) {
            // Integration services with their credential fields
            const integrations = [
                {
                    id: 'google',
                    name: 'Google OAuth (Drive, Sheets, Gmail)',
                    icon: ICONS.google,
                    color: '#4285f4',
                    fields: [
                        { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'xxx.apps.googleusercontent.com' },
                    ],
                    docs: 'https://console.cloud.google.com/apis/credentials',
                    description: 'Enables Google Drive, Sheets, and Gmail scanning for all users'
                },
                {
                    id: 'dropbox',
                    name: 'Dropbox',
                    icon: ICONS.dropbox,
                    color: '#0061fe',
                    fields: [
                        { key: 'appKey', label: 'App Key', type: 'text', placeholder: 'Your app key' },
                        { key: 'appSecret', label: 'App Secret', type: 'password', placeholder: 'Your app secret' },
                    ],
                    docs: 'https://www.dropbox.com/developers/apps',
                    description: 'Enables Dropbox folder scanning and asset import'
                },
                {
                    id: 'slack',
                    name: 'Slack',
                    icon: ICONS.slack,
                    color: '#4a154b',
                    fields: [
                        { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'xxxx.xxxx' },
                        { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Your client secret' },
                        { key: 'signingSecret', label: 'Signing Secret', type: 'password', placeholder: 'Your signing secret' },
                    ],
                    docs: 'https://api.slack.com/apps',
                    description: 'Enables Slack channel scanning via Events API'
                },
                {
                    id: 'onedrive',
                    name: 'Microsoft OneDrive',
                    icon: ICONS.onedrive,
                    color: '#0078d4',
                    fields: [
                        { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Azure AD app client ID' },
                        { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Azure AD app secret' },
                    ],
                    docs: 'https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade',
                    description: 'Enables OneDrive folder scanning and Outlook attachments'
                },
                {
                    id: 'figma',
                    name: 'Figma',
                    icon: ICONS.figma,
                    color: '#f24e1e',
                    fields: [
                        { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Figma app client ID' },
                        { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Figma app secret' },
                    ],
                    docs: 'https://www.figma.com/developers/apps',
                    description: 'Enables Figma project asset export and import'
                },
                {
                    id: 'adobe',
                    name: 'Adobe Creative Cloud',
                    icon: ICONS.adobe,
                    color: '#ff0000',
                    fields: [
                        { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Adobe app client ID' },
                        { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Adobe app secret' },
                    ],
                    docs: 'https://developer.adobe.com/console/projects',
                    description: 'Enables Adobe CC Libraries integration'
                },
            ];

            // Load saved integration credentials (platform-wide, not user-specific)
            // Using a global key so all users can access these credentials
            const GLOBAL_INTEGRATION_KEY = 'cav_platform_integration_credentials';
            const savedCreds = JSON.parse(localStorage.getItem(GLOBAL_INTEGRATION_KEY) || localStorage.getItem('cav_integration_credentials') || '{}');
            
            // Load enabled/disabled status for each integration
            const integrationStatus = JSON.parse(localStorage.getItem('cav_platform_integration_status') || '{}');

            return `
                <div class="cav-settings-section" data-section="integration-keys">
                    <h2>${ICONS.globe} Integration API Keys</h2>
                    <p class="cav-settings-desc">Configure API credentials for external integrations. When enabled, these credentials allow ALL platform users to connect to these services.</p>
                    
                    <div class="api-security-notice">
                        <div class="security-icon">${ICONS.shield}</div>
                        <div class="security-text">
                            <h4>Platform-Wide Integration Settings</h4>
                            <p>These credentials allow all users of your platform to connect their accounts to external services. Only super admins can view and modify these settings.</p>
                            <div class="security-features">
                                <span class="security-badge">${ICONS.lock} Admin Only</span>
                                <span class="security-badge">${ICONS.users} Enables All Users</span>
                                <span class="security-badge">${ICONS.check} OAuth Client Setup</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="cav-integration-keys-grid">
                        ${integrations.map(int => {
                            const creds = savedCreds[int.id] || {};
                            const hasAllCreds = int.fields.every(f => creds[f.key]);
                            const statusClass = hasAllCreds ? 'configured' : 'not-configured';
                            const statusText = hasAllCreds ? 'Configured' : 'Not Configured';
                            
                            return `
                                <div class="cav-integration-key-card ${statusClass}" data-integration="${int.id}">
                                    <div class="integration-key-header">
                                        <div class="integration-key-icon" style="background: ${int.color}20; color: ${int.color};">
                                            ${int.icon}
                                        </div>
                                        <div class="integration-key-info">
                                            <h4>${int.name}</h4>
                                            <p>${int.description}</p>
                                            <span class="integration-status ${statusClass}">${statusText}</span>
                                        </div>
                                    </div>
                                    
                                    <div class="integration-key-fields">
                                        ${int.fields.map(field => `
                                            <div class="cav-form-group">
                                                <label>${field.label}</label>
                                                <div class="cav-input-wrapper">
                                                    <input type="${field.type}" 
                                                           class="cav-integration-input"
                                                           data-integration="${int.id}"
                                                           data-field="${field.key}"
                                                           placeholder="${field.placeholder}"
                                                           value="${creds[field.key] ? (field.type === 'password' ? '••••••••••••••••' : creds[field.key]) : ''}"
                                                           ${creds[field.key] && field.type === 'password' ? 'data-masked="true"' : ''}>
                                                    ${field.type === 'password' ? `
                                                        <button type="button" class="toggle-visibility" title="Toggle visibility">${ICONS.eye}</button>
                                                    ` : ''}
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                    
                                    <div class="integration-key-actions">
                                        <button class="cav-btn cav-btn-primary save-integration-creds" data-integration="${int.id}">
                                            ${ICONS.check} Save Credentials
                                        </button>
                                        <a href="${int.docs}" target="_blank" class="cav-btn cav-btn-secondary">
                                            ${ICONS.link} Documentation
                                        </a>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <div class="cav-integration-status-summary">
                        <h4>${ICONS.check} Integration Status Summary</h4>
                        <div class="status-grid">
                            ${integrations.map(int => {
                                const creds = savedCreds[int.id] || {};
                                const configured = int.fields.every(f => creds[f.key]);
                                return `
                                    <div class="status-item ${configured ? 'active' : 'inactive'}">
                                        <span class="status-icon">${configured ? ICONS.check : ICONS.x}</span>
                                        <span class="status-name">${int.name}</span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            `;
        }

        // Super Admin Platform Settings Section
        renderPlatformAdminSection(settings) {
            // Get saved platform credentials (stored locally for super admin)
            const platformCreds = this.manager.getPlatformCredentials() || {};
            const cloudinaryCreds = platformCreds.cloudinary || {};
            const sharedKeys = platformCreds.sharedKeys || { openai: '', anthropic: '', gemini: '', searchapi: '' };
            const sharingConfig = platformCreds.sharing || { enabled: false, allowedEmails: [], globalUniversalShare: false };
            
            // Get sync status
            const syncStatus = window.RealtimeSync?.getStatus?.() || {};
            const lastSync = localStorage.getItem('cav_unified_last_sync');
            const lastSyncDisplay = lastSync ? new Date(lastSync).toLocaleString() : 'Never';
            
            return `
                <div class="cav-settings-section" data-section="platform-admin">
                    <h2>👥 API Key Sharing (Super Admin)</h2>
                    <p class="cav-settings-desc">Share your AI API keys with team members. You can also configure your own Cloudinary account for video/image processing.</p>
                    
                    <!-- SYNC STATUS PANEL - Admin Only -->
                    <div class="admin-sync-panel" style="margin-bottom: 24px; padding: 20px; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
                            <div>
                                <h4 style="margin: 0 0 8px; color: #3b82f6; display: flex; align-items: center; gap: 8px;">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2"/></svg>
                                    Cross-Device Sync Status
                                </h4>
                                <p style="margin: 0 0 12px; color: #94a3b8; font-size: 13px;">Real-time sync across all your devices and browsers</p>
                                
                                <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 12px;">
                                    <div class="sync-status-item" style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: rgba(0,0,0,0.2); border-radius: 6px;">
                                        <span class="sync-status-dot" id="admin-sync-dot" style="width: 10px; height: 10px; border-radius: 50%; background: ${syncStatus.connected ? '#22c55e' : '#f59e0b'};"></span>
                                        <span style="font-size: 13px; color: white;" id="admin-sync-status-text">${syncStatus.connected ? 'Connected' : 'Connecting...'}</span>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: rgba(0,0,0,0.2); border-radius: 6px;">
                                        <span style="font-size: 13px; color: #94a3b8;">Last Sync:</span>
                                        <span style="font-size: 13px; color: white;" id="admin-last-sync">${lastSyncDisplay}</span>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: rgba(0,0,0,0.2); border-radius: 6px;">
                                        <span style="font-size: 13px; color: #94a3b8;">Pending:</span>
                                        <span style="font-size: 13px; color: white;" id="admin-pending-changes">${syncStatus.pendingChanges || 0}</span>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: rgba(0,0,0,0.2); border-radius: 6px;">
                                        <span style="font-size: 13px; color: #94a3b8;">Tables:</span>
                                        <span style="font-size: 13px; color: white;" id="admin-subscribed-tables">${syncStatus.subscribedTables?.length || 0}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                <button id="admin-force-sync" class="cav-btn" style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); border: none; padding: 10px 20px; border-radius: 8px; color: white; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 500;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2"/></svg>
                                    Force Sync Now
                                </button>
                                <button id="admin-run-diagnostics" class="cav-btn" style="background: transparent; border: 1px solid rgba(148, 163, 184, 0.3); padding: 10px 20px; border-radius: 8px; color: #94a3b8; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px;">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                                    Run Diagnostics
                                </button>
                            </div>
                        </div>
                        
                        <!-- Diagnostics Output (hidden by default) -->
                        <div id="admin-diagnostics-output" style="display: none; margin-top: 16px; padding: 12px; background: #0f0f14; border-radius: 8px; font-family: monospace; font-size: 12px; color: #22c55e; max-height: 200px; overflow-y: auto; white-space: pre-wrap;"></div>
                    </div>
                    
                    <div class="api-security-notice" style="border-color: #a855f7;">
                        <div class="security-icon">${ICONS.shield}</div>
                        <div class="security-text">
                            <h4>Super Admin Only - Platform API Keys</h4>
                            <p>These credentials are stored securely in your browser. Only you can see this section.</p>
                            <div class="security-features">
                                <span class="security-badge">${ICONS.lock} Encrypted Storage</span>
                                <span class="security-badge">${ICONS.shield} Super Admin Only</span>
                                <span class="security-badge">${ICONS.users} Selective Sharing</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- API Sharing Configuration -->
                    <div class="platform-sharing-config" style="margin: 24px 0; padding: 20px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px;">
                        <h4 style="margin: 0 0 16px; color: #22c55e;">${ICONS.users} API Access Sharing</h4>
                        <p style="color: #94a3b8; margin-bottom: 16px;">Share your AI API keys with selected team members. They can opt to use their own keys instead.</p>
                        
                        <div class="sharing-toggle" style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                            <label class="toggle-switch">
                                <input type="checkbox" id="enable-api-sharing" ${sharingConfig.enabled ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                            <span>Enable API Sharing</span>
                        </div>
                        
                        <!-- Global Universal Share Access (Super Admin Only) -->
                        <div class="global-share-section" style="margin: 20px 0; padding: 16px; background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 8px; display: ${sharingConfig.enabled ? 'block' : 'none'};" id="global-share-container">
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                                <label class="toggle-switch">
                                    <input type="checkbox" id="enable-global-universal-share" ${sharingConfig.globalUniversalShare ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                                <div>
                                    <span style="font-weight: 600; color: #a855f7;">🌐 Global Universal Share Access</span>
                                    <p style="margin: 4px 0 0; font-size: 12px; color: #94a3b8;">Grant API access to ALL domains and ALL users automatically</p>
                                </div>
                            </div>
                            <p style="font-size: 12px; color: #64748b; padding: 8px; background: rgba(0,0,0,0.2); border-radius: 6px;">
                                ⚠️ When enabled, all authenticated users across all domains will have access to your shared API keys. 
                                Individual user restrictions below will be ignored.
                            </p>
                        </div>
                        
                        <div id="sharing-emails-section" style="display: ${sharingConfig.enabled && !sharingConfig.globalUniversalShare ? 'block' : 'none'};">
                            <label style="display: block; color: #94a3b8; margin-bottom: 8px;">Allowed Emails or Domains (one per line)</label>
                            <textarea id="sharing-allowed-emails" rows="4" placeholder="user1@company.com&#10;@entirecompany.com (allow all from domain)&#10;specific@user.com" 
                                style="width: 100%; background: #0f0f14; border: 1px solid #334155; border-radius: 8px; padding: 12px; color: white; resize: vertical;">${(sharingConfig.allowedEmails || []).join('\n')}</textarea>
                            <p style="font-size: 12px; color: #64748b; margin-top: 8px;">Enter specific emails or @domain.com to allow all users from that domain. Leave empty to allow ALL users.</p>
                            
                            <button id="save-sharing-config" class="cav-btn cav-btn-primary" style="margin-top: 12px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border: none; padding: 10px 20px; border-radius: 8px; color: white; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                                ${ICONS.save || '💾'} Save Sharing Configuration
                            </button>
                            <span id="sharing-save-status" style="display: none; margin-left: 12px; color: #22c55e; font-size: 13px;">✓ Saved!</span>
                        </div>
                    </div>
                    
                    <div class="cav-platform-admin-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                        <!-- Cloudinary Configuration (Shareable) -->
                        <div class="cav-platform-admin-card" data-service="cloudinary" style="background: linear-gradient(180deg, rgba(52, 72, 197, 0.1) 0%, rgba(33, 148, 227, 0.05) 100%); border: 1px solid rgba(52, 72, 197, 0.3); border-radius: 12px; padding: 20px;">
                            <div class="platform-admin-header" style="display: flex; gap: 16px; margin-bottom: 16px;">
                                <div class="platform-admin-icon" style="width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #3448C5 0%, #2194E3 100%); color: white;">
                                    ${ICONS.cloud}
                                </div>
                                <div class="platform-admin-info">
                                    <h4 style="margin: 0; color: white;">Cloudinary (Shareable)</h4>
                                    <p style="margin: 4px 0 0; color: #94a3b8; font-size: 13px;">Video/image processing for team</p>
                                    <span class="platform-status ${cloudinaryCreds.cloudName ? 'configured' : ''}" style="font-size: 12px; color: ${cloudinaryCreds.cloudName ? '#22c55e' : '#f59e0b'};">
                                        ${cloudinaryCreds.cloudName ? '✓ Configured' : '⚠ Not configured'}
                                    </span>
                                </div>
                            </div>
                            
                            <div class="platform-admin-fields">
                                <div class="cav-form-group" style="margin-bottom: 12px;">
                                    <label style="display: block; color: #94a3b8; margin-bottom: 6px; font-size: 13px;">Cloud Name</label>
                                    <input type="text" id="admin-cloudinary-cloud-name" value="${cloudinaryCreds.cloudName || ''}" placeholder="your-cloud-name" class="cav-input" style="width: 100%; background: #0f0f14; border: 1px solid #334155; border-radius: 8px; padding: 10px; color: white;">
                                </div>
                                <div class="cav-form-group" style="margin-bottom: 12px;">
                                    <label style="display: block; color: #94a3b8; margin-bottom: 6px; font-size: 13px;">API Key</label>
                                    <input type="text" id="admin-cloudinary-api-key" value="${cloudinaryCreds.apiKey || ''}" placeholder="123456789012345" class="cav-input" style="width: 100%; background: #0f0f14; border: 1px solid #334155; border-radius: 8px; padding: 10px; color: white;">
                                </div>
                                <div class="cav-form-group" style="margin-bottom: 16px;">
                                    <label style="display: block; color: #94a3b8; margin-bottom: 6px; font-size: 13px;">API Secret</label>
                                    <input type="password" id="admin-cloudinary-api-secret" value="${cloudinaryCreds.apiSecret || ''}" placeholder="••••••••••••••••" class="cav-input" style="width: 100%; background: #0f0f14; border: 1px solid #334155; border-radius: 8px; padding: 10px; color: white;">
                                </div>
                                <button class="cav-btn cav-btn-primary save-admin-cloudinary" style="width: 100%;">
                                    💾 Save Cloudinary
                                </button>
                            </div>
                        </div>
                        
                        <!-- Shared OpenAI Key -->
                        <div class="cav-platform-admin-card" data-service="openai" style="background: linear-gradient(180deg, rgba(16, 163, 127, 0.1) 0%, rgba(13, 138, 106, 0.05) 100%); border: 1px solid rgba(16, 163, 127, 0.3); border-radius: 12px; padding: 20px;">
                            <div class="platform-admin-header" style="display: flex; gap: 16px; margin-bottom: 16px;">
                                <div class="platform-admin-icon" style="width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #10a37f 0%, #0d8a6a 100%); color: white;">
                                    ${ICONS.openai}
                                </div>
                                <div class="platform-admin-info">
                                    <h4 style="margin: 0; color: white;">OpenAI (Shareable)</h4>
                                    <p style="margin: 4px 0 0; color: #94a3b8; font-size: 13px;">GPT-5.2 for allowed users</p>
                                    <span style="font-size: 12px; color: ${sharedKeys.openai ? '#22c55e' : '#64748b'};">
                                        ${sharedKeys.openai ? '✓ Configured' : 'Not set'}
                                    </span>
                                </div>
                            </div>
                            
                            <div class="platform-admin-fields">
                                <div class="cav-form-group" style="margin-bottom: 16px;">
                                    <label style="display: block; color: #94a3b8; margin-bottom: 6px; font-size: 13px;">Shared API Key</label>
                                    <input type="password" id="admin-shared-openai" value="${sharedKeys.openai || ''}" placeholder="sk-..." class="cav-input" style="width: 100%; background: #0f0f14; border: 1px solid #334155; border-radius: 8px; padding: 10px; color: white;">
                                </div>
                                <button class="cav-btn cav-btn-secondary save-admin-shared-key" data-provider="openai" style="width: 100%;">
                                    💾 Save Shared OpenAI Key
                                </button>
                            </div>
                        </div>
                        
                        <!-- Shared Claude Key -->
                        <div class="cav-platform-admin-card" data-service="anthropic" style="background: linear-gradient(180deg, rgba(217, 119, 6, 0.1) 0%, rgba(180, 83, 9, 0.05) 100%); border: 1px solid rgba(217, 119, 6, 0.3); border-radius: 12px; padding: 20px;">
                            <div class="platform-admin-header" style="display: flex; gap: 16px; margin-bottom: 16px;">
                                <div class="platform-admin-icon" style="width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: white;">
                                    ${ICONS.brain}
                                </div>
                                <div class="platform-admin-info">
                                    <h4 style="margin: 0; color: white;">Claude (Shareable)</h4>
                                    <p style="margin: 4px 0 0; color: #94a3b8; font-size: 13px;">Claude 4.5 for allowed users</p>
                                    <span style="font-size: 12px; color: ${sharedKeys.anthropic ? '#22c55e' : '#64748b'};">
                                        ${sharedKeys.anthropic ? '✓ Configured' : 'Not set'}
                                    </span>
                                </div>
                            </div>
                            
                            <div class="platform-admin-fields">
                                <div class="cav-form-group" style="margin-bottom: 16px;">
                                    <label style="display: block; color: #94a3b8; margin-bottom: 6px; font-size: 13px;">Shared API Key</label>
                                    <input type="password" id="admin-shared-anthropic" value="${sharedKeys.anthropic || ''}" placeholder="sk-ant-..." class="cav-input" style="width: 100%; background: #0f0f14; border: 1px solid #334155; border-radius: 8px; padding: 10px; color: white;">
                                </div>
                                <button class="cav-btn cav-btn-secondary save-admin-shared-key" data-provider="anthropic" style="width: 100%;">
                                    💾 Save Shared Claude Key
                                </button>
                            </div>
                        </div>
                        
                        <!-- Shared Gemini Key -->
                        <div class="cav-platform-admin-card" data-service="gemini" style="background: linear-gradient(180deg, rgba(66, 133, 244, 0.1) 0%, rgba(52, 168, 83, 0.05) 100%); border: 1px solid rgba(66, 133, 244, 0.3); border-radius: 12px; padding: 20px;">
                            <div class="platform-admin-header" style="display: flex; gap: 16px; margin-bottom: 16px;">
                                <div class="platform-admin-icon" style="width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #4285F4 0%, #34A853 100%); color: white;">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                                </div>
                                <div class="platform-admin-info">
                                    <h4 style="margin: 0; color: white;">Google Gemini (Shareable)</h4>
                                    <p style="margin: 4px 0 0; color: #94a3b8; font-size: 13px;">Gemini 2.0 Flash for allowed users</p>
                                    <span style="font-size: 12px; color: ${sharedKeys.gemini ? '#22c55e' : '#64748b'};">
                                        ${sharedKeys.gemini ? '✓ Configured' : 'Not set'}
                                    </span>
                                </div>
                            </div>
                            
                            <div class="platform-admin-fields">
                                <div class="cav-form-group" style="margin-bottom: 16px;">
                                    <label style="display: block; color: #94a3b8; margin-bottom: 6px; font-size: 13px;">Shared API Key</label>
                                    <input type="password" id="admin-shared-gemini" value="${sharedKeys.gemini || ''}" placeholder="AIza..." class="cav-input" style="width: 100%; background: #0f0f14; border: 1px solid #334155; border-radius: 8px; padding: 10px; color: white;">
                                </div>
                                <button class="cav-btn cav-btn-secondary save-admin-shared-key" data-provider="gemini" style="width: 100%;">
                                    💾 Save Shared Gemini Key
                                </button>
                            </div>
                        </div>
                        
                        <!-- Shared SearchAPI Key -->
                        <div class="cav-platform-admin-card" data-service="searchapi" style="background: linear-gradient(180deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 20px;">
                            <div class="platform-admin-header" style="display: flex; gap: 16px; margin-bottom: 16px;">
                                <div class="platform-admin-icon" style="width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%); color: white;">
                                    ${ICONS.search}
                                </div>
                                <div class="platform-admin-info">
                                    <h4 style="margin: 0; color: white;">SearchAPI (Shareable)</h4>
                                    <p style="margin: 4px 0 0; color: #94a3b8; font-size: 13px;">Web research for allowed users</p>
                                    <span style="font-size: 12px; color: ${sharedKeys.searchapi ? '#22c55e' : '#64748b'};">
                                        ${sharedKeys.searchapi ? '✓ Configured' : 'Not set'}
                                    </span>
                                </div>
                            </div>
                            
                            <div class="platform-admin-fields">
                                <div class="cav-form-group" style="margin-bottom: 16px;">
                                    <label style="display: block; color: #94a3b8; margin-bottom: 6px; font-size: 13px;">Shared API Key</label>
                                    <input type="password" id="admin-shared-searchapi" value="${sharedKeys.searchapi || ''}" placeholder="searchapi_..." class="cav-input" style="width: 100%; background: #0f0f14; border: 1px solid #334155; border-radius: 8px; padding: 10px; color: white;">
                                </div>
                                <button class="cav-btn cav-btn-secondary save-admin-shared-key" data-provider="searchapi" style="width: 100%;">
                                    💾 Save Shared SearchAPI Key
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        attachEventHandlers(container) {
            // Attach handlers for pre-rendered sections (Profile and API Keys are pre-rendered)
            this.attachProfileHandlers(container);
            this._loadedSections.add('profile');
            this._loadedSections.add('api-keys');
            
            // Navigation
            container.querySelectorAll('.cav-settings-nav-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const target = e.target.closest('.cav-settings-nav-btn');
                    const section = target?.dataset.section;
                    if (!section) return;
                    
                    // Update active state for nav buttons
                    container.querySelectorAll('.cav-settings-nav-btn').forEach(b => b.classList.remove('active'));
                    target.classList.add('active');
                    
                    // Lazy load the section content if not yet loaded
                    this.loadSection(section);
                    
                    // Update active state for sections
                    container.querySelectorAll('.cav-settings-section').forEach(s => s.classList.remove('active'));
                    const sectionEl = container.querySelector(`.cav-settings-section[data-section="${section}"]`);
                    if (sectionEl) {
                        sectionEl.classList.add('active');
                    }
                    
                    this._currentSection = section;
                });
            });

            // API Key inputs
            container.querySelectorAll('.cav-api-key-input').forEach(input => {
                input.addEventListener('change', (e) => {
                    const provider = e.target.dataset.provider;
                    if (provider === 'openai-org') {
                        this.manager.settings.apiKeys.openai.orgId = e.target.value;
                        this.manager.saveSettings();
                    } else {
                        this.manager.setAPIKey(provider, e.target.value);
                    }
                });
            });

            // Show/Hide API keys
            container.querySelectorAll('.cav-api-key-toggle').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const provider = e.target.dataset.provider;
                    const input = container.querySelector(`.cav-api-key-input[data-provider="${provider}"]`);
                    if (input) {
                        input.type = input.type === 'password' ? 'text' : 'password';
                    }
                });
            });

            // Test connections
            container.querySelectorAll('.cav-test-connection').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const provider = e.target.dataset.provider;
                    e.target.disabled = true;
                    e.target.textContent = '⏳ Testing...';
                    
                    let result;
                    switch (provider) {
                        case 'claude': result = await this.manager.testClaudeConnection(); break;
                        case 'openai': result = await this.manager.testOpenAIConnection(); break;
                        case 'searchapi': result = await this.manager.testSearchAPIConnection(); break;
                        case 'gemini': result = await this.manager.testGeminiConnection(); break;
                    }
                    
                    e.target.disabled = false;
                    e.target.textContent = '🔌 Test Connection';
                    
                    // Update status
                    const card = e.target.closest('.cav-api-key-card');
                    const statusEl = card.querySelector('.cav-api-key-status');
                    if (result.success) {
                        statusEl.className = 'cav-api-key-status success';
                        statusEl.innerHTML = `${ICONS.check} Connected`;
                        this.showToast('success', result.message);
                    } else {
                        statusEl.className = 'cav-api-key-status error';
                        statusEl.innerHTML = `${ICONS.x} Error`;
                        this.showToast('error', result.error);
                    }
                });
            });

            // Test all connections
            container.querySelector('#test-all-connections')?.addEventListener('click', async (e) => {
                e.target.disabled = true;
                e.target.textContent = '⏳ Testing All...';
                await this.manager.testAllConnections();
                e.target.disabled = false;
                e.target.textContent = '🔄 Test All Connections';
                this.render(container); // Refresh UI
                this.showToast('success', 'All connections tested');
            });

            // Save API key buttons
            container.querySelectorAll('.cav-save-api-key').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const provider = e.target.closest('.cav-save-api-key')?.dataset.provider || e.target.dataset.provider;
                    const input = container.querySelector(`.cav-api-key-input[data-provider="${provider}"]`);
                    const key = input?.value?.trim();
                    
                    if (!key) {
                        this.showToast('error', 'Please enter an API key first');
                        return;
                    }
                    
                    const btn = e.target.closest('.cav-save-api-key') || e.target;
                    const originalText = btn.innerHTML;
                    btn.disabled = true;
                    btn.innerHTML = `${ICONS.loader || '⏳'} Saving...`;
                    
                    try {
                        this.manager.setAPIKey(provider, key);
                        
                        // Also save to UnifiedStorage for cross-device sync
                        if (window.UnifiedStorage?.saveAPIKey) {
                            await window.UnifiedStorage.saveAPIKey(provider, key, { 
                                shareWithDomain: false 
                            });
                        }
                        
                        btn.innerHTML = `${ICONS.check} Saved!`;
                        btn.style.background = 'rgba(16, 185, 129, 0.2)';
                        btn.style.borderColor = '#10b981';
                        btn.style.color = '#10b981';
                        
                        if (window.PersistenceUI) {
                            window.PersistenceUI.showSuccess('API Key Saved', `Your ${provider} API key has been saved securely`);
                        } else {
                            this.showToast('success', `${provider} API key saved successfully`);
                        }
                        
                        setTimeout(() => {
                            btn.innerHTML = originalText;
                            btn.style.background = '';
                            btn.style.borderColor = '';
                            btn.style.color = '';
                            btn.disabled = false;
                        }, 2000);
                        
                    } catch (error) {
                        console.error('[Settings] Save API key error:', error);
                        btn.innerHTML = `${ICONS.x} Failed`;
                        btn.style.borderColor = '#ef4444';
                        btn.style.color = '#ef4444';
                        
                        if (window.PersistenceUI) {
                            window.PersistenceUI.showError('Save Failed', error.message || 'Could not save API key');
                        } else {
                            this.showToast('error', 'Failed to save API key');
                        }
                        
                        setTimeout(() => {
                            btn.innerHTML = originalText;
                            btn.style.borderColor = '';
                            btn.style.color = '';
                            btn.disabled = false;
                        }, 3000);
                    }
                });
            });
            
            // Delete API key buttons
            container.querySelectorAll('.cav-delete-api-key').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const provider = e.target.closest('.cav-delete-api-key')?.dataset.provider || e.target.dataset.provider;
                    
                    const confirmDelete = window.PersistenceUI 
                        ? await window.PersistenceUI.confirm({
                            title: `Delete ${provider} API Key?`,
                            message: 'This will remove your API key from this device. You can add it again later.',
                            confirmText: 'Delete Key',
                            cancelText: 'Cancel'
                        })
                        : confirm(`Are you sure you want to delete your ${provider} API key?`);
                    
                    if (!confirmDelete) return;
                    
                    try {
                        // Clear the key
                        this.manager.setAPIKey(provider, '');
                        
                        // Clear from all legacy locations
                        localStorage.removeItem(`cav_${provider}_api_key`);
                        if (provider === 'gemini') {
                            localStorage.removeItem('cav_ai_api_key');
                            localStorage.removeItem('cav_gemini_api_key');
                        }
                        
                        if (window.PersistenceUI) {
                            window.PersistenceUI.showSuccess('API Key Deleted', `Your ${provider} API key has been removed`);
                        } else {
                            this.showToast('info', `${provider} API key deleted`);
                        }
                        
                        // Refresh the UI
                        this.render(container);
                        this.showSection('api-keys');
                        
                    } catch (error) {
                        console.error('[Settings] Delete API key error:', error);
                        if (window.PersistenceUI) {
                            window.PersistenceUI.showError('Delete Failed', error.message);
                        } else {
                            this.showToast('error', 'Failed to delete API key');
                        }
                    }
                });
            });
            
            // User Cloudinary BYOK - Save
            container.querySelector('#save-user-cloudinary')?.addEventListener('click', () => {
                const cloudName = container.querySelector('#user-cloudinary-cloud-name')?.value?.trim();
                const apiKey = container.querySelector('#user-cloudinary-api-key')?.value?.trim();
                const apiSecret = container.querySelector('#user-cloudinary-api-secret')?.value?.trim();
                
                if (!cloudName || !apiKey || !apiSecret) {
                    this.showToast('error', 'Please fill in all Cloudinary fields');
                    return;
                }
                
                if (this.manager.saveUserCloudinaryCredentials({ cloudName, apiKey, apiSecret })) {
                    this.showToast('success', 'Cloudinary credentials saved! You can now resize videos.');
                    // Refresh the section
                    const byokSection = container.querySelector('.cav-cloudinary-byok-section');
                    if (byokSection) {
                        byokSection.outerHTML = this.renderCloudinaryBYOKSection();
                        // Re-attach the event handlers
                        this.attachCloudinaryBYOKHandlers(container);
                    }
                } else {
                    this.showToast('error', 'Failed to save credentials');
                }
            });
            
            // User Cloudinary BYOK - Clear
            container.querySelector('#clear-user-cloudinary')?.addEventListener('click', () => {
                if (confirm('Are you sure you want to remove your Cloudinary credentials?')) {
                    localStorage.removeItem('cav_user_cloudinary');
                    this.showToast('info', 'Cloudinary credentials removed');
                    // Refresh the section
                    const byokSection = container.querySelector('.cav-cloudinary-byok-section');
                    if (byokSection) {
                        byokSection.outerHTML = this.renderCloudinaryBYOKSection();
                        this.attachCloudinaryBYOKHandlers(container);
                    }
                }
            });

            // Feature toggles
            container.querySelectorAll('.cav-feature-item input[type="checkbox"]').forEach(toggle => {
                toggle.addEventListener('change', (e) => {
                    const feature = e.target.dataset.feature;
                    this.manager.setFeature(feature, e.target.checked);
                });
            });

            // Save model config
            container.querySelector('#save-model-config')?.addEventListener('click', () => {
                const config = {
                    claudeModel: container.querySelector('#config-claude-model')?.value,
                    openaiVisionModel: container.querySelector('#config-openai-model')?.value,
                    analysisTemperature: parseFloat(container.querySelector('#config-analysis-temp')?.value),
                    creativeTemperature: parseFloat(container.querySelector('#config-creative-temp')?.value),
                    maxTokens: parseInt(container.querySelector('#config-max-tokens')?.value)
                };
                this.manager.setModelConfig(config);
                this.showToast('success', 'Model configuration saved');
            });

            // Slider value display updates
            container.querySelectorAll('input[type="range"]').forEach(slider => {
                slider.addEventListener('input', (e) => {
                    const label = e.target.previousElementSibling;
                    if (label) {
                        const text = label.textContent.split(':')[0];
                        label.textContent = `${text}: ${e.target.value}`;
                    }
                });
            });

            // Add brand profile
            container.querySelector('#add-brand-profile')?.addEventListener('click', () => {
                this.showBrandProfileModal();
            });

            // Add competitor
            container.querySelector('#add-competitor')?.addEventListener('click', () => {
                this.showCompetitorModal();
            });

            // Save notifications
            container.querySelector('#save-notifications')?.addEventListener('click', () => {
                this.manager.settings.notifications = {
                    email: {
                        enabled: container.querySelector('#notif-email-enabled')?.checked,
                        address: container.querySelector('#notif-email-address')?.value
                    },
                    slack: {
                        enabled: container.querySelector('#notif-slack-enabled')?.checked,
                        webhookUrl: container.querySelector('#notif-slack-webhook')?.value
                    },
                    alertFrequency: container.querySelector('#notif-frequency')?.value
                };
                this.manager.saveSettings();
                this.showToast('success', 'Notification settings saved');
            });

            // Notification toggles
            container.querySelector('#notif-email-enabled')?.addEventListener('change', (e) => {
                container.querySelector('#notif-email-address').disabled = !e.target.checked;
            });
            container.querySelector('#notif-slack-enabled')?.addEventListener('change', (e) => {
                container.querySelector('#notif-slack-webhook').disabled = !e.target.checked;
            });
            
            // ===== API ACCESS CONTROL HANDLERS =====
            
            // Sharing toggle switches
            container.querySelectorAll('.sharing-toggle').forEach(toggle => {
                toggle.addEventListener('change', (e) => {
                    const provider = e.target.dataset.provider;
                    const enabled = e.target.checked;
                    
                    if (window.cavSettings?.apiAccess) {
                        window.cavSettings.apiAccess.setProviderSharing(provider, enabled);
                        // Refresh the access control section
                        const section = document.getElementById('api-access-control-section');
                        if (section) {
                            section.innerHTML = window.cavSettings.apiAccess.renderAccessControlUI();
                            // Re-attach handlers for the new content
                            this.attachAPIAccessHandlers(container);
                        }
                    }
                });
            });
            
            // Attach API access handlers
            this.attachAPIAccessHandlers(container);

            // Export settings
            container.querySelector('#export-settings')?.addEventListener('click', () => {
                const data = this.manager.exportSettings(false);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `cav-settings-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
                this.showToast('success', 'Settings exported');
            });

            // Import settings
            container.querySelector('#import-settings')?.addEventListener('click', () => {
                container.querySelector('#import-file')?.click();
            });
            container.querySelector('#import-file')?.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const result = this.manager.importSettings(event.target.result);
                        if (result.success) {
                            this.showToast('success', 'Settings imported');
                            this.render(container);
                        } else {
                            this.showToast('error', 'Import failed: ' + result.error);
                        }
                    };
                    reader.readAsText(file);
                }
            });

            // Clear all data
            container.querySelector('#clear-all-data')?.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear all settings? This cannot be undone.')) {
                    this.manager.clearAllData();
                    this.showToast('success', 'All data cleared');
                    this.render(container);
                }
            });

            // Integration API Keys handlers (Super Admin only)
            container.querySelectorAll('.save-integration-creds').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const integrationId = e.target.dataset.integration;
                    const card = container.querySelector(`.cav-integration-key-card[data-integration="${integrationId}"]`);
                    if (!card) return;

                    // Collect all field values - use GLOBAL key for all users
                    const GLOBAL_INTEGRATION_KEY = 'cav_platform_integration_credentials';
                    const savedCreds = JSON.parse(localStorage.getItem(GLOBAL_INTEGRATION_KEY) || localStorage.getItem('cav_integration_credentials') || '{}');
                    if (!savedCreds[integrationId]) savedCreds[integrationId] = {};

                    let hasChanges = false;
                    card.querySelectorAll('.cav-integration-input').forEach(input => {
                        const field = input.dataset.field;
                        const value = input.value.trim();
                        
                        // Skip if masked and unchanged
                        if (input.dataset.masked === 'true' && value === '••••••••••••••••') {
                            return;
                        }
                        
                        if (value) {
                            savedCreds[integrationId][field] = value;
                            hasChanges = true;
                        }
                    });

                    if (hasChanges) {
                        // Save to global key (accessible by all users)
                        localStorage.setItem('cav_platform_integration_credentials', JSON.stringify(savedCreds));
                        // Also update legacy key for backwards compatibility
                        localStorage.setItem('cav_integration_credentials', JSON.stringify(savedCreds));
                        this.showToast('success', `${integrationId.charAt(0).toUpperCase() + integrationId.slice(1)} credentials saved for all users!`);
                        
                        // Update UI status
                        card.classList.remove('not-configured');
                        card.classList.add('configured');
                        const statusEl = card.querySelector('.integration-status');
                        if (statusEl) {
                            statusEl.textContent = 'Configured';
                            statusEl.classList.remove('not-configured');
                            statusEl.classList.add('configured');
                        }
                        
                        // Also update the integrations.js with new credentials
                        if (window.cavIntegrations) {
                            console.log(`[Settings] Updated ${integrationId} credentials`);
                        }
                    } else {
                        this.showToast('info', 'No changes to save');
                    }
                });
            });

            // Toggle password visibility for integration keys
            container.querySelectorAll('.cav-integration-key-card .toggle-visibility').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const input = e.target.closest('.cav-input-wrapper').querySelector('input');
                    if (input) {
                        if (input.type === 'password') {
                            input.type = 'text';
                            // If masked, clear it so user can enter new value
                            if (input.dataset.masked === 'true' && input.value === '••••••••••••••••') {
                                input.value = '';
                                input.dataset.masked = 'false';
                            }
                        } else {
                            input.type = 'password';
                        }
                    }
                });
            });

            // Brand profile actions
            container.querySelectorAll('[data-action="delete-brand"]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.dataset.id;
                    if (confirm('Delete this brand profile?')) {
                        this.manager.deleteBrandProfile(id);
                        this.render(container);
                    }
                });
            });

            // Competitor actions
            container.querySelectorAll('[data-action="delete-competitor"]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.dataset.id;
                    if (confirm('Delete this competitor?')) {
                        this.manager.deleteCompetitor(id);
                        this.render(container);
                    }
                });
            });
        }
        
        // Attach event handlers for a specific lazily-loaded section
        attachSectionEventHandlers(container, sectionId) {
            switch(sectionId) {
                case 'profile':
                    // Profile section handlers
                    this.attachProfileHandlers(container);
                    break;
                    
                case 'model-config':
                    // Model config selects
                    container.querySelectorAll('.cav-model-select').forEach(select => {
                        select.addEventListener('change', (e) => {
                            const modelType = e.target.dataset.modelType;
                            this.manager.settings.modelConfig[modelType] = e.target.value;
                            this.manager.saveSettings();
                        });
                    });
                    container.querySelectorAll('.cav-temp-slider').forEach(slider => {
                        slider.addEventListener('input', (e) => {
                            this.manager.settings.modelConfig.temperature = parseFloat(e.target.value);
                            const display = container.querySelector('.temp-value');
                            if (display) display.textContent = e.target.value;
                        });
                        slider.addEventListener('change', () => this.manager.saveSettings());
                    });
                    break;
                    
                case 'features':
                    // Feature toggles
                    container.querySelectorAll('.cav-feature-item input[type="checkbox"]').forEach(toggle => {
                        toggle.addEventListener('change', (e) => {
                            const feature = e.target.dataset.feature;
                            this.manager.setFeature(feature, e.target.checked);
                        });
                    });
                    break;
                    
                case 'brand-profiles':
                    // Brand profile actions
                    container.querySelectorAll('[data-action="add-brand"]').forEach(btn => {
                        btn.addEventListener('click', () => this.showBrandProfileModal());
                    });
                    container.querySelectorAll('[data-action="edit-brand"]').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const id = e.target.dataset.id;
                            const profile = this.manager.settings.brandProfiles?.find(p => p.id === id);
                            if (profile) this.showBrandProfileModal(profile);
                        });
                    });
                    container.querySelectorAll('[data-action="delete-brand"]').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const id = e.target.dataset.id;
                            if (confirm('Delete this brand profile?')) {
                                this.manager.deleteBrandProfile(id);
                                this.loadSection('brand-profiles'); // Refresh section
                            }
                        });
                    });
                    break;
                    
                case 'competitors':
                    // Competitor actions
                    container.querySelectorAll('[data-action="add-competitor"]').forEach(btn => {
                        btn.addEventListener('click', () => this.showCompetitorModal());
                    });
                    container.querySelectorAll('[data-action="delete-competitor"]').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const id = e.target.dataset.id;
                            if (confirm('Delete this competitor?')) {
                                this.manager.deleteCompetitor(id);
                                this.loadSection('competitors'); // Refresh section
                            }
                        });
                    });
                    break;
                    
                case 'notifications':
                    // Notification toggles
                    container.querySelectorAll('.cav-notification-toggle').forEach(toggle => {
                        toggle.addEventListener('change', (e) => {
                            const channel = e.target.dataset.channel;
                            const type = e.target.dataset.type;
                            if (!this.manager.settings.notifications) this.manager.settings.notifications = {};
                            if (!this.manager.settings.notifications[channel]) this.manager.settings.notifications[channel] = {};
                            this.manager.settings.notifications[channel][type] = e.target.checked;
                            this.manager.saveSettings();
                        });
                    });
                    break;
                    
                case 'data':
                    // Data management
                    container.querySelector('#export-data')?.addEventListener('click', () => this.exportData());
                    container.querySelector('#import-data')?.addEventListener('click', () => {
                        container.querySelector('#import-data-file')?.click();
                    });
                    container.querySelector('#import-data-file')?.addEventListener('change', (e) => this.importData(e));
                    container.querySelector('#clear-all-data')?.addEventListener('click', () => {
                        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                            this.manager.clearAllData();
                            this.showToast('success', 'All data cleared');
                            this.render(this._container);
                        }
                    });
                    break;
                    
                case 'integration-keys':
                    // Integration API key handlers
                    container.querySelectorAll('.save-integration-creds').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const integrationId = e.target.dataset.integration;
                            const card = container.querySelector(`.cav-integration-key-card[data-integration="${integrationId}"]`);
                            if (!card) return;
                            
                            const inputs = card.querySelectorAll('input[data-field]');
                            const credentials = {};
                            inputs.forEach(input => {
                                credentials[input.dataset.field] = input.value;
                            });
                            
                            this.manager.saveIntegrationCredentials(integrationId, credentials);
                            this.showToast('success', `${integrationId} credentials saved`);
                        });
                    });
                    break;
                    
                case 'platform-admin':
                    // Platform Admin - Save credentials locally (Super Admin Only)
                    
                    // Enable API Sharing toggle
                    container.querySelector('#enable-api-sharing')?.addEventListener('change', (e) => {
                        const enabled = e.target.checked;
                        const emailsSection = container.querySelector('#sharing-emails-section');
                        const globalShareContainer = container.querySelector('#global-share-container');
                        
                        if (emailsSection) {
                            const globalShareEnabled = container.querySelector('#enable-global-universal-share')?.checked;
                            emailsSection.style.display = enabled && !globalShareEnabled ? 'block' : 'none';
                        }
                        if (globalShareContainer) {
                            globalShareContainer.style.display = enabled ? 'block' : 'none';
                        }
                        
                        // Save sharing config
                        const platformCreds = this.manager.getPlatformCredentials() || {};
                        platformCreds.sharing = platformCreds.sharing || {};
                        platformCreds.sharing.enabled = enabled;
                        this.manager.savePlatformCredentials(platformCreds);
                        this.showToast('success', enabled ? 'API sharing enabled' : 'API sharing disabled');
                    });
                    
                    // Global Universal Share toggle (Super Admin only)
                    container.querySelector('#enable-global-universal-share')?.addEventListener('change', (e) => {
                        const globalEnabled = e.target.checked;
                        const emailsSection = container.querySelector('#sharing-emails-section');
                        
                        if (emailsSection) {
                            emailsSection.style.display = globalEnabled ? 'none' : 'block';
                        }
                        
                        // Save sharing config
                        const platformCreds = this.manager.getPlatformCredentials() || {};
                        platformCreds.sharing = platformCreds.sharing || {};
                        platformCreds.sharing.globalUniversalShare = globalEnabled;
                        this.manager.savePlatformCredentials(platformCreds);
                        this.showToast('success', globalEnabled ? 
                            '🌐 Global Universal Share enabled - ALL users can access shared keys' : 
                            'Global Universal Share disabled - using allowed emails list');
                    });
                    
                    // Save sharing allowed emails (on blur - auto-save)
                    container.querySelector('#sharing-allowed-emails')?.addEventListener('blur', (e) => {
                        const emails = e.target.value.split('\n')
                            .map(email => email.trim().toLowerCase())
                            .filter(email => email && (email.includes('@') || email.startsWith('@')));
                        
                        const platformCreds = this.manager.getPlatformCredentials() || {};
                        platformCreds.sharing = platformCreds.sharing || {};
                        platformCreds.sharing.allowedEmails = emails;
                        this.manager.savePlatformCredentials(platformCreds);
                    });
                    
                    // Save Sharing Configuration button
                    container.querySelector('#save-sharing-config')?.addEventListener('click', async (e) => {
                        const btn = e.target.closest('#save-sharing-config');
                        const statusEl = container.querySelector('#sharing-save-status');
                        
                        // Get all sharing settings
                        const emails = container.querySelector('#sharing-allowed-emails')?.value?.split('\n')
                            .map(email => email.trim().toLowerCase())
                            .filter(email => email && (email.includes('@') || email.startsWith('@'))) || [];
                        
                        const enabled = container.querySelector('#enable-api-sharing')?.checked || false;
                        const globalShare = container.querySelector('#enable-global-universal-share')?.checked || false;
                        
                        // Save to platform credentials
                        const platformCreds = this.manager.getPlatformCredentials() || {};
                        platformCreds.sharing = platformCreds.sharing || {};
                        platformCreds.sharing.enabled = enabled;
                        platformCreds.sharing.globalUniversalShare = globalShare;
                        platformCreds.sharing.allowedEmails = emails;
                        platformCreds.sharing.updatedAt = new Date().toISOString();
                        
                        // Show loading state
                        const originalText = btn.innerHTML;
                        btn.innerHTML = '⏳ Saving...';
                        btn.disabled = true;
                        
                        try {
                            // Save locally
                            this.manager.savePlatformCredentials(platformCreds);
                            
                            // Also sync to Supabase for cross-device access
                            if (window.CAVSupabase?.isConfigured?.()) {
                                const userEmail = this.manager.userEmail || window.cavUserSession?.email;
                                const domain = userEmail?.split('@')[1] || '';
                                const orgId = domain.replace(/\./g, '_');
                                
                                if (orgId) {
                                    await window.CAVSupabase.saveEntity?.('api_sharing_config', {
                                        uuid: `sharing_config_${orgId}`,
                                        organization_id: orgId,
                                        admin_email: userEmail,
                                        sharing_enabled: enabled,
                                        global_share: globalShare,
                                        allowed_emails: emails,
                                        allowed_domains: emails.filter(e => e.startsWith('@')),
                                        updated_at: new Date().toISOString()
                                    });
                                }
                            }
                            
                            // Show success
                            btn.innerHTML = '✓ Saved!';
                            btn.style.background = '#22c55e';
                            if (statusEl) {
                                statusEl.style.display = 'inline';
                                setTimeout(() => { statusEl.style.display = 'none'; }, 3000);
                            }
                            
                            this.showToast('success', `Sharing configuration saved! ${emails.length} allowed email/domain${emails.length !== 1 ? 's' : ''}`);
                            
                            // Reset button after delay
                            setTimeout(() => {
                                btn.innerHTML = originalText;
                                btn.style.background = '';
                                btn.disabled = false;
                            }, 2000);
                            
                        } catch (error) {
                            console.error('[Settings] Failed to save sharing config:', error);
                            btn.innerHTML = '❌ Error';
                            btn.style.background = '#ef4444';
                            this.showToast('error', 'Failed to save sharing configuration');
                            
                            setTimeout(() => {
                                btn.innerHTML = originalText;
                                btn.style.background = '';
                                btn.disabled = false;
                            }, 2000);
                        }
                    });
                    
                    // =============================================
                    // SYNC STATUS PANEL HANDLERS (Admin Only)
                    // =============================================
                    
                    // Force Sync button
                    container.querySelector('#admin-force-sync')?.addEventListener('click', async (e) => {
                        const btn = e.target.closest('#admin-force-sync');
                        const statusDot = container.querySelector('#admin-sync-dot');
                        const statusText = container.querySelector('#admin-sync-status-text');
                        const lastSyncEl = container.querySelector('#admin-last-sync');
                        const pendingEl = container.querySelector('#admin-pending-changes');
                        
                        // Show syncing state
                        const originalText = btn.innerHTML;
                        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2"/></svg> Syncing...';
                        btn.disabled = true;
                        if (statusDot) statusDot.style.background = '#f59e0b';
                        if (statusText) statusText.textContent = 'Syncing...';
                        
                        try {
                            // Use RealtimeSync if available
                            if (window.RealtimeSync?.forceSync) {
                                await window.RealtimeSync.forceSync();
                            } else if (window.UnifiedStorage?.syncToCloud) {
                                await window.UnifiedStorage.syncToCloud();
                            }
                            
                            // Update UI
                            if (statusDot) statusDot.style.background = '#22c55e';
                            if (statusText) statusText.textContent = 'Connected';
                            if (lastSyncEl) lastSyncEl.textContent = new Date().toLocaleString();
                            if (pendingEl) pendingEl.textContent = '0';
                            
                            btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Synced!';
                            btn.style.background = '#22c55e';
                            
                            this.showToast('success', 'All data synced across devices!');
                            
                        } catch (error) {
                            console.error('[Settings] Sync failed:', error);
                            if (statusDot) statusDot.style.background = '#ef4444';
                            if (statusText) statusText.textContent = 'Sync Error';
                            btn.innerHTML = '❌ Sync Failed';
                            btn.style.background = '#ef4444';
                            this.showToast('error', 'Sync failed: ' + error.message);
                        }
                        
                        // Reset button
                        setTimeout(() => {
                            btn.innerHTML = originalText;
                            btn.style.background = '';
                            btn.disabled = false;
                        }, 2000);
                    });
                    
                    // Run Diagnostics button
                    container.querySelector('#admin-run-diagnostics')?.addEventListener('click', async (e) => {
                        const btn = e.target.closest('#admin-run-diagnostics');
                        const outputEl = container.querySelector('#admin-diagnostics-output');
                        
                        if (!outputEl) return;
                        
                        // Toggle visibility
                        if (outputEl.style.display === 'block') {
                            outputEl.style.display = 'none';
                            return;
                        }
                        
                        outputEl.style.display = 'block';
                        outputEl.textContent = 'Running diagnostics...\\n';
                        
                        try {
                            // Get RealtimeSync status
                            if (window.RealtimeSync?.getStatus) {
                                const status = window.RealtimeSync.getStatus();
                                outputEl.textContent += '\\n=== REALTIME SYNC ===\\n';
                                outputEl.textContent += 'Initialized: ' + (status.initialized ? '✓' : '✗') + '\\n';
                                outputEl.textContent += 'Connected: ' + (status.connected ? '✓' : '✗') + '\\n';
                                outputEl.textContent += 'User: ' + (status.userEmail || 'N/A') + '\\n';
                                outputEl.textContent += 'Subscribed Tables: ' + (status.subscribedTables?.length || 0) + '\\n';
                                outputEl.textContent += 'Pending Changes: ' + (status.pendingChanges || 0) + '\\n';
                                outputEl.textContent += 'Last Sync: ' + (status.lastSyncTime || 'Never') + '\\n';
                            }
                            
                            // Get UnifiedStorage stats
                            if (window.UnifiedStorage?.getDiagnostics) {
                                const diag = await window.UnifiedStorage.getDiagnostics();
                                outputEl.textContent += '\\n=== UNIFIED STORAGE ===\\n';
                                for (const [store, count] of Object.entries(diag.stores || {})) {
                                    outputEl.textContent += store + ': ' + count + ' items\\n';
                                }
                            }
                            
                            // Check Supabase connection
                            outputEl.textContent += '\\n=== SUPABASE ===\\n';
                            if (window.CAVSupabase?.isConfigured?.()) {
                                outputEl.textContent += 'Status: ✓ Configured\\n';
                                // Test connection
                                try {
                                    const client = window.CAVSupabase.getClient?.();
                                    if (client) {
                                        const { error } = await client.from('organizations').select('id').limit(1);
                                        outputEl.textContent += 'Connection: ' + (error ? '✗ ' + error.message : '✓ OK') + '\\n';
                                    }
                                } catch (e) {
                                    outputEl.textContent += 'Connection: ✗ ' + e.message + '\\n';
                                }
                            } else {
                                outputEl.textContent += 'Status: ✗ Not configured\\n';
                            }
                            
                            // Browser info
                            outputEl.textContent += '\\n=== BROWSER ===\\n';
                            outputEl.textContent += 'Online: ' + (navigator.onLine ? '✓' : '✗') + '\\n';
                            outputEl.textContent += 'IndexedDB: ' + (window.indexedDB ? '✓' : '✗') + '\\n';
                            outputEl.textContent += 'BroadcastChannel: ' + (typeof BroadcastChannel !== 'undefined' ? '✓' : '✗') + '\\n';
                            
                            outputEl.textContent += '\\n=== DIAGNOSTICS COMPLETE ===';
                            
                        } catch (error) {
                            outputEl.textContent += '\\nError: ' + error.message;
                        }
                    });
                    
                    // Update sync status periodically while on this section
                    const updateSyncUI = () => {
                        const statusDot = container.querySelector('#admin-sync-dot');
                        const statusText = container.querySelector('#admin-sync-status-text');
                        const lastSyncEl = container.querySelector('#admin-last-sync');
                        const pendingEl = container.querySelector('#admin-pending-changes');
                        const tablesEl = container.querySelector('#admin-subscribed-tables');
                        
                        if (window.RealtimeSync?.getStatus) {
                            const status = window.RealtimeSync.getStatus();
                            if (statusDot) statusDot.style.background = status.connected ? '#22c55e' : '#f59e0b';
                            if (statusText) statusText.textContent = status.connected ? 'Connected' : 'Connecting...';
                            if (pendingEl) pendingEl.textContent = status.pendingChanges || 0;
                            if (tablesEl) tablesEl.textContent = status.subscribedTables?.length || 0;
                        }
                        
                        const lastSync = localStorage.getItem('cav_unified_last_sync');
                        if (lastSyncEl && lastSync) {
                            lastSyncEl.textContent = new Date(lastSync).toLocaleString();
                        }
                    };
                    
                    // Initial update and set interval
                    updateSyncUI();
                    const syncInterval = setInterval(updateSyncUI, 5000);
                    
                    // Clear interval when section is hidden (store on container for cleanup)
                    container._syncInterval = syncInterval;
                    
                    // Save Admin Cloudinary
                    container.querySelector('.save-admin-cloudinary')?.addEventListener('click', (e) => {
                        const btn = e.target.closest('.save-admin-cloudinary');
                        const cloudName = container.querySelector('#admin-cloudinary-cloud-name')?.value?.trim();
                        const apiKey = container.querySelector('#admin-cloudinary-api-key')?.value?.trim();
                        const apiSecret = container.querySelector('#admin-cloudinary-api-secret')?.value?.trim();
                        
                        if (!cloudName || !apiKey || !apiSecret) {
                            this.showToast('error', 'Please fill in all Cloudinary fields');
                            return;
                        }
                        
                        // Save to platform credentials (local storage for super admin)
                        const platformCreds = this.manager.getPlatformCredentials() || {};
                        platformCreds.cloudinary = { cloudName, apiKey, apiSecret };
                        
                        if (this.manager.savePlatformCredentials(platformCreds)) {
                            this.showToast('success', 'Cloudinary credentials saved and shared with your team!');
                            // Update the status indicator
                            const card = btn.closest('.cav-platform-admin-card');
                            if (card) {
                                const statusEl = card.querySelector('.platform-status');
                                if (statusEl) {
                                    statusEl.textContent = '✓ Configured';
                                    statusEl.style.color = '#22c55e';
                                    statusEl.classList.add('configured');
                                }
                            }
                        } else {
                            this.showToast('error', 'Failed to save credentials');
                        }
                    });
                    
                    // Save shared API keys (OpenAI, Anthropic, Gemini, SearchAPI)
                    container.querySelectorAll('.save-admin-shared-key').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const button = e.target.closest('.save-admin-shared-key');
                            const provider = button?.dataset.provider;
                            if (!provider) {
                                console.error('No provider found for shared key button');
                                return;
                            }
                            
                            const apiKey = container.querySelector(`#admin-shared-${provider}`)?.value?.trim();
                            
                            if (!apiKey) {
                                this.showToast('error', `Please enter a ${provider} API key`);
                                return;
                            }
                            
                            const platformCreds = this.manager.getPlatformCredentials() || {};
                            platformCreds.sharedKeys = platformCreds.sharedKeys || {};
                            platformCreds.sharedKeys[provider] = apiKey;
                            
                            // Ensure sharing is enabled
                            if (!platformCreds.sharing) {
                                platformCreds.sharing = { enabled: true, allowedEmails: [], globalUniversalShare: false };
                            }
                            
                            if (this.manager.savePlatformCredentials(platformCreds)) {
                                const providerNames = {
                                    openai: 'OpenAI',
                                    anthropic: 'Claude',
                                    gemini: 'Google Gemini',
                                    searchapi: 'SearchAPI'
                                };
                                this.showToast('success', `${providerNames[provider] || provider} shared key saved!`);
                                
                                // Update the status indicator
                                const card = button.closest('.cav-platform-admin-card');
                                if (card) {
                                    const statusEl = card.querySelector('span[style*="font-size: 12px"]');
                                    if (statusEl) {
                                        statusEl.textContent = '✓ Configured';
                                        statusEl.style.color = '#22c55e';
                                    }
                                }
                                
                                console.log(`[Settings] Shared ${provider} key saved. Keys now:`, Object.keys(platformCreds.sharedKeys || {}));
                            } else {
                                this.showToast('error', 'Failed to save');
                            }
                        });
                    });
                    break;
            }
        }
        
        // ============================================
        // PROFILE HANDLERS - Avatar Management
        // ============================================
        
        attachProfileHandlers(container) {
            const self = this;
            
            // Load avatar from Supabase (in case it was set on another device)
            this.loadAvatarFromSupabase().then(avatar => {
                if (avatar) {
                    const preview = container.querySelector('#profile-avatar-preview');
                    if (preview) preview.src = avatar;
                }
            });
            
            // Change avatar button (opens options)
            container.querySelector('#change-avatar-btn')?.addEventListener('click', () => {
                container.querySelector('#avatar-upload-input')?.click();
            });
            
            // Upload avatar button
            container.querySelector('#upload-avatar-btn')?.addEventListener('click', () => {
                container.querySelector('#avatar-upload-input')?.click();
            });
            
            // Handle file upload
            container.querySelector('#avatar-upload-input')?.addEventListener('change', async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                
                // Validate file
                if (!file.type.startsWith('image/')) {
                    self.showToast('error', 'Please select an image file');
                    return;
                }
                
                if (file.size > 2 * 1024 * 1024) {
                    self.showToast('error', 'Image must be less than 2MB');
                    return;
                }
                
                try {
                    // Convert to base64
                    const reader = new FileReader();
                    reader.onload = async (event) => {
                        const base64 = event.target.result;
                        
                        // Resize if needed (max 200x200)
                        const resized = await self.resizeImage(base64, 200, 200);
                        
                        // Save and update UI
                        self.saveCustomAvatar(resized, container);
                    };
                    reader.readAsDataURL(file);
                } catch (err) {
                    console.error('[Profile] Avatar upload error:', err);
                    self.showToast('error', 'Failed to upload image');
                }
            });
            
            // Generate AI avatar
            container.querySelector('#generate-avatar-btn')?.addEventListener('click', async () => {
                const prompt = container.querySelector('#ai-avatar-prompt')?.value?.trim();
                if (!prompt) {
                    self.showToast('error', 'Please enter a description for your avatar');
                    return;
                }
                
                const btn = container.querySelector('#generate-avatar-btn');
                const originalText = btn.innerHTML;
                btn.innerHTML = '⏳ Generating...';
                btn.disabled = true;
                
                try {
                    // Use Gemini or other AI to generate avatar
                    const apiKey = self.manager.getAPIKey('gemini');
                    if (!apiKey) {
                        self.showToast('error', 'Please configure Gemini API key to generate avatars');
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                        return;
                    }
                    
                    // Use Nano Banana Pro (gemini-3-pro-image-preview) for highest quality avatar generation
                    const modelId = 'gemini-3-pro-image-preview';
                    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{
                                parts: [{
                                    text: `Generate a professional profile picture avatar based on this description: ${prompt}. 
                                    
Requirements:
- Square format (1:1 aspect ratio)
- Centered composition
- High quality, clean design
- Suitable for a professional profile picture
- Modern and appealing aesthetic`
                                }]
                            }],
                            generationConfig: {
                                responseModalities: ['IMAGE', 'TEXT'],
                                imageConfig: {
                                    imageSize: '1K'
                                }
                            }
                        })
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        
                        // Extract image from Gemini response
                        const candidates = data.candidates || [];
                        let imageData = null;
                        
                        for (const candidate of candidates) {
                            const parts = candidate.content?.parts || [];
                            for (const part of parts) {
                                if (part.inlineData?.mimeType?.startsWith('image/')) {
                                    imageData = part.inlineData.data;
                                    break;
                                }
                            }
                            if (imageData) break;
                        }
                        
                        if (imageData) {
                            const base64 = `data:image/png;base64,${imageData}`;
                            self.saveCustomAvatar(base64, container);
                            self.showToast('success', 'AI avatar generated with Nano Banana Pro!');
                        } else {
                            // Check if there's a text response explaining why
                            const textPart = candidates[0]?.content?.parts?.find(p => p.text);
                            throw new Error(textPart?.text || 'No image generated. The model may have declined the request.');
                        }
                    } else {
                        const error = await response.json();
                        throw new Error(error.error?.message || 'Generation failed');
                    }
                } catch (err) {
                    console.error('[Profile] AI generation error:', err);
                    self.showToast('error', `Failed to generate avatar: ${err.message}`);
                } finally {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            });
            
            // Use Google avatar
            container.querySelector('#use-google-avatar-btn')?.addEventListener('click', () => {
                const session = window.cavUserSession || {};
                if (session.picture) {
                    // Remove custom avatar to use Google's
                    localStorage.removeItem('cav_custom_avatar');
                    self.updateAvatarUI(session.picture, container);
                    self.syncAvatarToSupabase(null); // Clear custom in cloud
                    self.showToast('success', 'Using Google profile picture');
                } else {
                    self.showToast('error', 'No Google profile picture available');
                }
            });
            
            // Use initials avatar
            container.querySelector('#use-initials-avatar-btn')?.addEventListener('click', () => {
                const session = window.cavUserSession || {};
                const name = session.name || 'User';
                const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                const initialsAvatar = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="#e1306c" width="200" height="200" rx="100"/><text x="100" y="125" font-family="system-ui" font-size="80" fill="white" text-anchor="middle" font-weight="bold">${initials}</text></svg>`)}`;
                
                self.saveCustomAvatar(initialsAvatar, container);
                self.showToast('success', 'Using initials avatar');
            });
            
            // Remove custom avatar
            container.querySelector('#remove-custom-avatar-btn')?.addEventListener('click', () => {
                localStorage.removeItem('cav_custom_avatar');
                const session = window.cavUserSession || {};
                self.updateAvatarUI(session.picture || '', container);
                self.syncAvatarToSupabase(null);
                self.showToast('success', 'Custom avatar removed');
                
                // Re-render to remove the button
                self.loadSection('profile');
            });
        }
        
        // Save custom avatar to localStorage and Supabase
        saveCustomAvatar(base64, container) {
            localStorage.setItem('cav_custom_avatar', base64);
            this.updateAvatarUI(base64, container);
            this.syncAvatarToSupabase(base64);
            this.updateGlobalAvatars(base64);
            this.showToast('success', 'Profile picture updated!');
        }
        
        // Update avatar preview in settings
        updateAvatarUI(src, container) {
            const preview = container.querySelector('#profile-avatar-preview');
            if (preview && src) {
                preview.src = src;
            }
        }
        
        // Update avatars across the entire app
        updateGlobalAvatars(src) {
            // Update sidebar avatar
            const sidebarAvatar = document.getElementById('sidebar-user-avatar');
            if (sidebarAvatar && src) {
                sidebarAvatar.src = src;
            }
            
            // Update topbar avatar
            const userAvatar = document.getElementById('user-avatar');
            if (userAvatar && src) {
                userAvatar.src = src;
            }
            
            // Update session object
            if (window.cavUserSession) {
                window.cavUserSession.customPicture = src;
            }
        }
        
        // Sync avatar to Supabase for cross-device persistence
        async syncAvatarToSupabase(base64) {
            if (!window.CAVSupabase?.getClient?.()) return;
            
            try {
                const userEmail = this.manager?.userEmail || window.cavUserSession?.email;
                if (!userEmail) return;
                
                const supabase = window.CAVSupabase.getClient();
                if (!supabase) return;
                
                const avatarId = `avatar_${userEmail.replace(/[^a-z0-9]/gi, '_')}`;
                
                const { error } = await supabase
                    .from('user_settings')
                    .upsert({
                        uuid: avatarId,
                        user_email: userEmail,
                        owner_email: userEmail,
                        settings_type: 'custom_avatar',
                        data: { avatar: base64 },
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'uuid'
                    });
                
                if (error) {
                    console.warn('[Profile] Avatar Supabase error:', error.message);
                } else {
                    console.log('[Profile] ☁️ Avatar synced to Supabase');
                }
            } catch (e) {
                console.warn('[Profile] Failed to sync avatar to Supabase:', e);
            }
        }
        
        // Load avatar from Supabase on startup
        async loadAvatarFromSupabase() {
            if (!window.CAVSupabase?.getClient?.()) return;
            
            try {
                const userEmail = this.manager?.userEmail || window.cavUserSession?.email;
                if (!userEmail) return;
                
                const supabase = window.CAVSupabase.getClient();
                if (!supabase) return;
                
                const avatarId = `avatar_${userEmail.replace(/[^a-z0-9]/gi, '_')}`;
                
                const { data, error } = await supabase
                    .from('user_settings')
                    .select('data')
                    .eq('uuid', avatarId)
                    .single();
                
                if (!error && data?.data?.avatar) {
                    // Save to localStorage for offline access
                    localStorage.setItem('cav_custom_avatar', data.data.avatar);
                    console.log('[Profile] ☁️ Avatar loaded from Supabase');
                    
                    // Update UI if visible
                    this.updateGlobalAvatars(data.data.avatar);
                    return data.data.avatar;
                }
            } catch (e) {
                // Silent fail - avatar from localStorage will be used
            }
            return null;
        }
        
        // Resize image to max dimensions
        async resizeImage(base64, maxWidth, maxHeight) {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;
                    
                    // Calculate new dimensions maintaining aspect ratio
                    if (width > height) {
                        if (width > maxWidth) {
                            height = (height * maxWidth) / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = (width * maxHeight) / height;
                            height = maxHeight;
                        }
                    }
                    
                    // Create canvas and draw resized image
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    resolve(canvas.toDataURL('image/jpeg', 0.9));
                };
                img.src = base64;
            });
        }
        
        async checkPlatformStatus(container) {
            try {
                const response = await fetch('/api/health');
                if (response.ok) {
                    container.querySelector('#db-status').textContent = 'Connected ✓';
                    container.querySelector('#db-status').style.color = '#22c55e';
                } else {
                    container.querySelector('#db-status').textContent = 'Error';
                    container.querySelector('#db-status').style.color = '#ef4444';
                }
            } catch (e) {
                container.querySelector('#db-status').textContent = 'Offline';
                container.querySelector('#db-status').style.color = '#f59e0b';
            }
            
            // Update sync status if engine exists
            if (window.syncEngine) {
                const status = window.syncEngine.getStatus();
                container.querySelector('#pending-count').textContent = status.pendingCount || 0;
                container.querySelector('#last-sync-time').textContent = 
                    status.lastSync ? new Date(status.lastSync).toLocaleTimeString() : 'Never';
            }
        }

        showBrandProfileModal(existingProfile = null) {
            const modal = document.createElement('div');
            modal.className = 'cav-modal-overlay';
            modal.innerHTML = `
                <div class="cav-modal cav-brand-modal">
                    <div class="cav-modal-header">
                        <h2>${existingProfile ? 'Edit' : 'Add'} Brand Profile</h2>
                        <button class="cav-modal-close">&times;</button>
                    </div>
                    <div class="cav-modal-body">
                        <div class="cav-form-group">
                            <label>Brand Name *</label>
                            <input type="text" id="brand-name" value="${existingProfile?.name || ''}" required>
                        </div>
                        <div class="cav-form-group">
                            <label>Primary Color</label>
                            <input type="color" id="brand-primary" value="${existingProfile?.colors?.primary || '#000000'}">
                        </div>
                        <div class="cav-form-group">
                            <label>Secondary Color</label>
                            <input type="color" id="brand-secondary" value="${existingProfile?.colors?.secondary || '#ffffff'}">
                        </div>
                        <div class="cav-form-group">
                            <label>Accent Color</label>
                            <input type="color" id="brand-accent" value="${existingProfile?.colors?.accent || '#0066cc'}">
                        </div>
                        <div class="cav-form-group">
                            <label>Font Families (comma-separated)</label>
                            <input type="text" id="brand-fonts" placeholder="Helvetica, Arial" value="${existingProfile?.fonts?.join(', ') || ''}">
                        </div>
                        <div class="cav-form-group">
                            <label>Voice Keywords (comma-separated)</label>
                            <input type="text" id="brand-voice" placeholder="professional, friendly, innovative" value="${existingProfile?.voiceKeywords?.join(', ') || ''}">
                        </div>
                        <div class="cav-form-group">
                            <label class="cav-checkbox">
                                <input type="checkbox" id="brand-default" ${existingProfile?.isDefault ? 'checked' : ''}>
                                Set as default brand
                            </label>
                        </div>
                    </div>
                    <div class="cav-modal-footer">
                        <button class="cav-btn cav-btn-secondary cav-modal-cancel">Cancel</button>
                        <button class="cav-btn cav-btn-primary" id="save-brand">💾 Save Brand</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            modal.querySelector('.cav-modal-close').addEventListener('click', () => modal.remove());
            modal.querySelector('.cav-modal-cancel').addEventListener('click', () => modal.remove());
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.remove();
            });

            modal.querySelector('#save-brand').addEventListener('click', () => {
                const profile = {
                    name: modal.querySelector('#brand-name').value,
                    colors: {
                        primary: modal.querySelector('#brand-primary').value,
                        secondary: modal.querySelector('#brand-secondary').value,
                        accent: modal.querySelector('#brand-accent').value
                    },
                    fonts: modal.querySelector('#brand-fonts').value.split(',').map(f => f.trim()).filter(f => f),
                    voiceKeywords: modal.querySelector('#brand-voice').value.split(',').map(k => k.trim()).filter(k => k),
                    isDefault: modal.querySelector('#brand-default').checked
                };

                if (!profile.name) {
                    this.showToast('error', 'Brand name is required');
                    return;
                }

                if (existingProfile) {
                    this.manager.updateBrandProfile(existingProfile.id, profile);
                } else {
                    this.manager.addBrandProfile(profile);
                }

                modal.remove();
                this.render(document.querySelector('.cav-settings-page')?.parentElement);
                this.showToast('success', `Brand profile ${existingProfile ? 'updated' : 'created'}`);
            });
        }

        showCompetitorModal(existingCompetitor = null) {
            const modal = document.createElement('div');
            modal.className = 'cav-modal-overlay';
            modal.innerHTML = `
                <div class="cav-modal cav-competitor-modal">
                    <div class="cav-modal-header">
                        <h2>${existingCompetitor ? 'Edit' : 'Add'} Competitor</h2>
                        <button class="cav-modal-close">&times;</button>
                    </div>
                    <div class="cav-modal-body">
                        <div class="cav-form-group">
                            <label>Competitor Name *</label>
                            <input type="text" id="comp-name" value="${existingCompetitor?.name || ''}" required>
                        </div>
                        <div class="cav-form-group">
                            <label>Domain</label>
                            <input type="text" id="comp-domain" placeholder="competitor.com" value="${existingCompetitor?.domain || ''}">
                        </div>
                        <div class="cav-form-group">
                            <label>Monitoring Frequency</label>
                            <select id="comp-frequency">
                                <option value="daily" ${existingCompetitor?.monitoringFrequency === 'daily' ? 'selected' : ''}>Daily</option>
                                <option value="weekly" ${existingCompetitor?.monitoringFrequency === 'weekly' ? 'selected' : ''}>Weekly</option>
                                <option value="manual" ${existingCompetitor?.monitoringFrequency === 'manual' ? 'selected' : ''}>Manual Only</option>
                            </select>
                        </div>
                        <div class="cav-form-group">
                            <label>Tags (comma-separated)</label>
                            <input type="text" id="comp-tags" placeholder="direct, enterprise" value="${existingCompetitor?.tags?.join(', ') || ''}">
                        </div>
                        <div class="cav-form-group">
                            <label>Notes</label>
                            <textarea id="comp-notes" rows="3">${existingCompetitor?.notes || ''}</textarea>
                        </div>
                    </div>
                    <div class="cav-modal-footer">
                        <button class="cav-btn cav-btn-secondary cav-modal-cancel">Cancel</button>
                        <button class="cav-btn cav-btn-primary" id="save-competitor">💾 Save Competitor</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            modal.querySelector('.cav-modal-close').addEventListener('click', () => modal.remove());
            modal.querySelector('.cav-modal-cancel').addEventListener('click', () => modal.remove());
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.remove();
            });

            modal.querySelector('#save-competitor').addEventListener('click', () => {
                const competitor = {
                    name: modal.querySelector('#comp-name').value,
                    domain: modal.querySelector('#comp-domain').value,
                    monitoringFrequency: modal.querySelector('#comp-frequency').value,
                    tags: modal.querySelector('#comp-tags').value.split(',').map(t => t.trim()).filter(t => t),
                    notes: modal.querySelector('#comp-notes').value
                };

                if (!competitor.name) {
                    this.showToast('error', 'Competitor name is required');
                    return;
                }

                if (existingCompetitor) {
                    this.manager.updateCompetitor(existingCompetitor.id, competitor);
                } else {
                    this.manager.addCompetitor(competitor);
                }

                modal.remove();
                this.render(document.querySelector('.cav-settings-page')?.parentElement);
                this.showToast('success', `Competitor ${existingCompetitor ? 'updated' : 'added'}`);
            });
        }

        // Attach API Access Control event handlers
        attachAPIAccessHandlers(container) {
            const accessControl = window.cavSettings?.apiAccess || apiAccessControl;
            
            // Grant buttons
            container.querySelectorAll('.grant-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const provider = e.target.closest('[data-provider]')?.dataset.provider || e.target.dataset.provider;
                    const email = e.target.closest('[data-email]')?.dataset.email || e.target.dataset.email;
                    
                    if (provider && email) {
                        const success = accessControl.grantAccess(provider, email);
                        if (success) {
                            this.showToast('success', `Access granted to ${email} for ${accessControl.getProviderDisplayName(provider)}`);
                            // Refresh the access control section
                            const section = document.getElementById('api-access-control-section');
                            if (section) {
                                section.innerHTML = accessControl.renderAccessControlUI();
                                this.attachAPIAccessHandlers(container);
                            }
                        }
                    }
                });
            });
            
            // Revoke buttons
            container.querySelectorAll('.revoke-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const provider = e.target.closest('[data-provider]')?.dataset.provider || e.target.dataset.provider;
                    const email = e.target.closest('[data-email]')?.dataset.email || e.target.dataset.email;
                    
                    if (provider && email) {
                        accessControl.revokeAccess(provider, email);
                        this.showToast('success', `Access revoked for ${email}`);
                        // Refresh the access control section
                        const section = document.getElementById('api-access-control-section');
                        if (section) {
                            section.innerHTML = accessControl.renderAccessControlUI();
                            this.attachAPIAccessHandlers(container);
                        }
                    }
                });
            });
            
            // Grant new user button
            container.querySelector('#grant-new-user-btn')?.addEventListener('click', () => {
                const emailInput = container.querySelector('#new-user-email');
                const providerSelect = container.querySelector('#new-user-provider');
                
                const email = emailInput?.value?.trim();
                const provider = providerSelect?.value;
                
                if (!email || !email.includes('@')) {
                    this.showToast('error', 'Please enter a valid email address');
                    return;
                }
                
                if (!provider) {
                    this.showToast('error', 'Please select an API provider');
                    return;
                }
                
                const success = accessControl.grantAccess(provider, email);
                if (success) {
                    this.showToast('success', `Access granted to ${email} for ${accessControl.getProviderDisplayName(provider)}`);
                    emailInput.value = '';
                    providerSelect.value = '';
                    // Refresh the access control section
                    const section = document.getElementById('api-access-control-section');
                    if (section) {
                        section.innerHTML = accessControl.renderAccessControlUI();
                        this.attachAPIAccessHandlers(container);
                    }
                }
            });
            
            // Sharing toggle switches (re-attach after refresh)
            container.querySelectorAll('.sharing-toggle').forEach(toggle => {
                toggle.addEventListener('change', (e) => {
                    const provider = e.target.dataset.provider;
                    const enabled = e.target.checked;
                    
                    if (accessControl) {
                        const success = accessControl.setProviderSharing(provider, enabled);
                        
                        if (success) {
                            const providerName = accessControl.getProviderDisplayName(provider);
                            if (enabled) {
                                this.showToast('success', `${providerName} sharing enabled - your team can now use your API key`);
                            } else {
                                this.showToast('info', `${providerName} sharing disabled`);
                            }
                        }
                        
                        // Refresh the access control section
                        const section = document.getElementById('api-access-control-section');
                        if (section) {
                            section.innerHTML = accessControl.renderAccessControlUI();
                            this.attachAPIAccessHandlers(container);
                        }
                    }
                });
            });
        }

        showToast(type, message) {
            const toast = document.createElement('div');
            toast.className = `cav-toast cav-toast-${type}`;
            toast.textContent = message;
            document.body.appendChild(toast);
            
            setTimeout(() => toast.classList.add('show'), 10);
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
    }

    // ============================================
    // INITIALIZE & EXPORT
    // ============================================

    const settingsManager = new SettingsManager();
    const settingsUI = new SettingsUI(settingsManager);

    // Global exports
    window.CAVSettings = {
        manager: settingsManager,
        ui: settingsUI,
        apiAccess: apiAccessControl,
        getAPIKey: (provider) => {
            // Use access-controlled key getter
            const result = apiAccessControl.getAPIKey(provider, settingsManager);
            return result.key;
        },
        getAPIKeyWithSource: (provider) => apiAccessControl.getAPIKey(provider, settingsManager),
        getModelConfig: () => settingsManager.getModelConfig(),
        getFeatures: () => settingsManager.getFeatures(),
        render: (container) => settingsUI.render(container),
        trackTokens: (provider, tokens) => {
            const email = apiAccessControl.getCurrentUserEmail();
            if (email) apiAccessControl.trackTokens(provider, email, tokens);
        },
        // Debug helper
        debugSharing: (provider) => {
            console.log('=== API KEY SHARING DEBUG ===');
            console.log('Provider:', provider || 'all');
            console.log('Current User:', apiAccessControl.getCurrentUserEmail());
            console.log('Is Admin:', apiAccessControl.isAdmin());
            console.log('\n--- Sharing Configuration ---');
            const accessData = JSON.parse(localStorage.getItem('cav_api_access_control') || '{}');
            console.log('Full Config:', accessData);
            if (provider) {
                console.log(`\n--- ${provider} Specific ---`);
                const config = accessData.sharedKeys?.[provider];
                console.log('Config:', config);
                console.log('Enabled:', config?.enabled);
                console.log('Allowed Users:', config?.allowedUsers);
                console.log('Revoked Users:', config?.revokedUsers);
                console.log('\n--- Key Retrieval Test ---');
                const result = apiAccessControl.getAPIKey(provider, settingsManager);
                console.log('Result:', result);
            }
            console.log('=============================');
        }
    };
    
    // Also expose on cavSettings for backwards compatibility
    window.cavSettings = window.CAVSettings;

    console.log('⚙️ Settings Module loaded - Version 5.11.1 (January 17, 2026)');
    console.log('   Providers: Claude, OpenAI, SearchAPI, Gemini');
    console.log('   ✅ FIXED: API Key Sharing - UI updates after save');
    console.log('   ✅ FIXED: Cloudinary sharing status indicator');

})();

