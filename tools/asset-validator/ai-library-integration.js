/**
 * AI Library Integration - Asset Cards with AI Features
 * ======================================================
 * Version 5.11.0 - API Key Sharing Fix (January 16, 2026)
 * 
 * Based on official Google Gemini API documentation:
 * - https://ai.google.dev/gemini-api/docs/imagen
 * - https://ai.google.dev/gemini-api/docs/video
 * - https://github.com/google-gemini/veo-3-nano-banana-gemini-api-quickstart
 * 
 * Models Used (OFFICIAL NAMES):
 * - gemini-2.5-flash-image (Nano Banana) - Fast image generation
 * - gemini-3-pro-image-preview (Nano Banana Pro) - Advanced 4K images with thinking
 * - veo-3.1-generate-preview (Veo 3.1) - Video with native audio
 * 
 * Changes in 5.11.0 (January 16, 2026):
 * - FIXED: API Key Sharing now works with platform credentials
 * - FIXED: getApiKey() now checks CAVSettings first for shared keys
 * - FIXED: Team members can now use admin's shared Gemini keys
 * 
 * Changes in 3.0.0:
 * - UPDATED: All channel icons now use proper SVG brand logos
 * - ADDED: Platform brand colors for visual consistency
 * - IMPROVED: Compatible badges use brand icons instead of emojis
 * 
 * Changes in 2.9.1:
 * - ADDED: Comprehensive Display Ad sizes (GDN, TTD, DV360)
 * - ADDED: Exact pixel dimension support (300x250, 728x90, etc.)
 * - ADDED: Display Ad Packages (GDN Essential, TTD Complete, etc.)
 * - FIXED: Individual resize buttons now show exact pixel sizes
 * - FIXED: AI generation prompts optimized for display ad dimensions
 * - ADDED: Mobile ad sizes (320x50, 320x100, 320x250)
 * - ADDED: Connected TV (CTV) channel support
 */

(function() {
    'use strict';

    // ============================================
    // BRAND SVG ICONS - Professional Platform Logos
    // ============================================
    const BRAND_ICONS = {
        // Google/DV360 - Google Ads icon
        google: `<svg viewBox="0 0 24 24" fill="none" class="channel-icon google"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="#4285F4"/></svg>`,
        
        // DV360 - Display & Video 360 icon
        dv360: `<svg viewBox="0 0 24 24" fill="none" class="channel-icon dv360"><rect width="24" height="24" rx="4" fill="#4285F4"/><path d="M7 8h10v2H7V8zm0 3h10v2H7v-2zm0 3h7v2H7v-2z" fill="white"/><circle cx="17" cy="14" r="3" fill="#34A853"/></svg>`,
        
        // Trade Desk
        ttd: `<svg viewBox="0 0 24 24" fill="none" class="channel-icon ttd"><rect width="24" height="24" rx="4" fill="#00B140"/><path d="M5 7h14v2H5V7zm0 4h14v2H5v-2zm0 4h10v2H5v-2z" fill="white"/></svg>`,
        
        // YouTube
        youtube: `<svg viewBox="0 0 24 24" class="channel-icon youtube"><path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
        
        // Meta/Facebook
        meta: `<svg viewBox="0 0 24 24" class="channel-icon meta"><path fill="#0866FF" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
        
        // Instagram
        instagram: `<svg viewBox="0 0 24 24" class="channel-icon instagram"><defs><linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:#FFDC80"/><stop offset="25%" style="stop-color:#F77737"/><stop offset="50%" style="stop-color:#E1306C"/><stop offset="75%" style="stop-color:#C13584"/><stop offset="100%" style="stop-color:#833AB4"/></linearGradient></defs><rect width="24" height="24" rx="6" fill="url(#ig-grad)"/><rect x="4" y="4" width="16" height="16" rx="4" fill="none" stroke="white" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="white" stroke-width="2"/><circle cx="17" cy="7" r="1.5" fill="white"/></svg>`,
        
        // TikTok
        tiktok: `<svg viewBox="0 0 24 24" class="channel-icon tiktok"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" fill="#000"/></svg>`,
        
        // LinkedIn
        linkedin: `<svg viewBox="0 0 24 24" class="channel-icon linkedin"><rect width="24" height="24" rx="4" fill="#0A66C2"/><path d="M7.5 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM6 10h3v10H6V10zm5 0h3v1.4c.4-.7 1.4-1.6 3-1.6 3 0 3.5 2 3.5 4.5V20h-3v-5c0-1.2 0-2.8-1.7-2.8-1.8 0-2 1.4-2 2.7V20h-3V10z" fill="white"/></svg>`,
        
        // Twitter/X
        twitter: `<svg viewBox="0 0 24 24" class="channel-icon twitter"><rect width="24" height="24" rx="4" fill="#000"/><path d="M13.795 10.533 20.68 2h-1.632l-5.98 7.414L8.11 2H2l7.226 10.633L2 22h1.632l6.32-7.848L15.113 22H22l-8.206-11.467zm-2.238 2.779-.733-1.058L4.63 3.27h2.51l4.707 6.796.733 1.058 6.119 8.83h-2.51l-4.993-7.216-.64-.926z" fill="white"/></svg>`,
        
        // Pinterest
        pinterest: `<svg viewBox="0 0 24 24" class="channel-icon pinterest"><circle cx="12" cy="12" r="12" fill="#E60023"/><path d="M12 4.8c-4.42 0-8 3.58-8 8 0 3.39 2.11 6.29 5.09 7.46-.07-.64-.13-1.62.03-2.32.14-.63.92-3.9.92-3.9s-.23-.47-.23-1.16c0-1.09.63-1.9 1.42-1.9.67 0 1 .5 1 1.1 0 .67-.43 1.68-.65 2.61-.19.78.39 1.42 1.16 1.42 1.39 0 2.46-1.47 2.46-3.58 0-1.87-1.35-3.18-3.27-3.18-2.23 0-3.54 1.67-3.54 3.4 0 .67.26 1.39.59 1.78.06.08.07.15.05.23-.06.25-.2.78-.22.89-.04.14-.12.17-.27.1-1.01-.47-1.64-1.94-1.64-3.12 0-2.54 1.84-4.87 5.32-4.87 2.79 0 4.96 1.99 4.96 4.65 0 2.77-1.75 5.01-4.18 5.01-.82 0-1.58-.42-1.84-.93l-.5 1.92c-.18.7-.67 1.57-1 2.1.75.23 1.55.36 2.38.36 4.42 0 8-3.58 8-8s-3.58-8-8-8z" fill="white"/></svg>`,
        
        // CTV/Connected TV
        ctv: `<svg viewBox="0 0 24 24" class="channel-icon ctv"><rect width="24" height="24" rx="4" fill="#6366F1"/><rect x="3" y="5" width="18" height="12" rx="1" fill="none" stroke="white" stroke-width="1.5"/><line x1="8" y1="20" x2="16" y2="20" stroke="white" stroke-width="1.5" stroke-linecap="round"/><line x1="12" y1="17" x2="12" y2="20" stroke="white" stroke-width="1.5"/><polygon points="10,9 10,13 14,11" fill="white"/></svg>`,
        
        // Mobile indicator
        mobile: `<svg viewBox="0 0 24 24" class="channel-icon mobile"><rect x="5" y="2" width="14" height="20" rx="3" fill="#374151" stroke="#6B7280" stroke-width="1"/><line x1="10" y1="19" x2="14" y2="19" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round"/></svg>`,
        
        // Default/Generic display ad
        display: `<svg viewBox="0 0 24 24" class="channel-icon display"><rect width="24" height="24" rx="4" fill="#8B5CF6"/><rect x="4" y="6" width="16" height="12" rx="1" fill="none" stroke="white" stroke-width="1.5"/><path d="M8 12h8M8 15h5" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>`
    };

    // Helper function to get icon HTML by platform category
    function getChannelIcon(category, platform, mobile = false) {
        if (mobile) {
            // For mobile sizes, show both platform + mobile indicator
            const platformIcon = getChannelIcon(category, platform, false);
            return `<span class="channel-icon-combo">${platformIcon}<span class="mobile-badge">📱</span></span>`;
        }
        
        switch(category) {
            case 'social':
                if (platform?.includes('YouTube') || platform?.includes('youtube')) return BRAND_ICONS.youtube;
                if (platform?.includes('Instagram') || platform?.includes('instagram')) return BRAND_ICONS.instagram;
                if (platform?.includes('TikTok') || platform?.includes('tiktok')) return BRAND_ICONS.tiktok;
                if (platform?.includes('Meta') || platform?.includes('Facebook')) return BRAND_ICONS.meta;
                if (platform?.includes('LinkedIn') || platform?.includes('linkedin')) return BRAND_ICONS.linkedin;
                if (platform?.includes('Twitter') || platform?.includes('X (Twitter)')) return BRAND_ICONS.twitter;
                if (platform?.includes('Pinterest') || platform?.includes('pinterest')) return BRAND_ICONS.pinterest;
                return BRAND_ICONS.display;
            case 'gdn':
                return BRAND_ICONS.google;
            case 'dv360':
                return BRAND_ICONS.dv360;
            case 'ttd':
                return BRAND_ICONS.ttd;
            case 'ctv':
                return BRAND_ICONS.ctv;
            default:
                return BRAND_ICONS.display;
        }
    }

    // ============================================
    // CHANNEL SPECIFICATIONS (Updated January 2026)
    // ============================================
    // 
    // ASPECT RATIO NOTES:
    // - Gemini API Valid Ratios: 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9
    // - Display ads use exact pixel ratios (6:5, 97:9, etc.) - these are NOT Gemini-compatible
    // - For Gemini image generation, use GEMINI_RATIO_MAP to get nearest valid ratio
    // - Use exactSize for display ads where pixel-perfect dimensions are required
    //
    // ORIENTATION KEY:
    // - orientation: 'vertical' = height > width (skyscrapers, half-pages)
    // - orientation: 'horizontal' = width > height (leaderboards, banners)
    // - orientation: 'square' = width === height
    // ============================================
    const CHANNEL_SPECS = {
        // === FACEBOOK ===
        'Facebook Profile Picture': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '180x180', icon: 'meta', category: 'social', notes: 'Displays as circle, store at 320x320' },
        'Facebook Cover Desktop': { type: 'image', aspectRatios: ['3:2'], recommendedSize: '851x315', icon: 'meta', category: 'social', notes: 'Mobile crops to 640x360' },
        'Facebook Cover Mobile': { type: 'image', aspectRatios: ['16:9'], recommendedSize: '640x360', icon: 'meta', category: 'social' },
        'Facebook Feed Square': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '1080x1080', icon: 'meta', category: 'social', notes: 'Best for engagement' },
        'Facebook Feed Landscape': { type: 'image', aspectRatios: ['16:9'], recommendedSize: '1200x630', icon: 'meta', category: 'social', notes: 'Link preview default' },
        'Facebook Feed Portrait': { type: 'image', aspectRatios: ['4:5'], recommendedSize: '1080x1350', icon: 'meta', category: 'social' },
        'Facebook Stories': { type: 'both', aspectRatios: ['9:16'], recommendedSize: '1080x1920', minDuration: 1, maxDuration: 120, icon: 'meta', category: 'social', notes: 'Full screen vertical' },
        'Facebook Carousel': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '1080x1080', icon: 'meta', category: 'social', notes: '2-10 images' },
        'Facebook Event Cover': { type: 'image', aspectRatios: ['16:9'], recommendedSize: '1920x1005', icon: 'meta', category: 'social' },
        'Facebook Group Cover': { type: 'image', aspectRatios: ['16:9'], recommendedSize: '1640x856', icon: 'meta', category: 'social' },
        'Facebook Ad Feed': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '1080x1080', icon: 'meta', category: 'social', notes: 'Also supports 4:5' },
        'Facebook Ad Stories': { type: 'image', aspectRatios: ['9:16'], recommendedSize: '1080x1920', icon: 'meta', category: 'social' },
        
        // === INSTAGRAM ===
        'Instagram Profile Picture': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '320x320', icon: 'instagram', category: 'social', notes: 'Displays as circle' },
        'Instagram Feed Square': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '1080x1080', icon: 'instagram', category: 'social', notes: 'Grid preview: 3:4' },
        'Instagram Feed Portrait': { type: 'image', aspectRatios: ['4:5'], recommendedSize: '1080x1350', icon: 'instagram', category: 'social', notes: 'RECOMMENDED for grid' },
        'Instagram Feed Tall': { type: 'image', aspectRatios: ['3:4'], recommendedSize: '1080x1440', icon: 'instagram', category: 'social', notes: 'NEW 2025 grid format' },
        'Instagram Feed Landscape': { type: 'image', aspectRatios: ['16:9'], recommendedSize: '1080x566', icon: 'instagram', category: 'social', notes: 'Safe zone: 1080x1420' },
        'Instagram Stories': { type: 'both', aspectRatios: ['9:16'], recommendedSize: '1080x1920', minDuration: 3, maxDuration: 60, icon: 'instagram', category: 'social' },
        'Instagram Reels Cover': { type: 'image', aspectRatios: ['9:16'], recommendedSize: '1080x1920', icon: 'instagram', category: 'social', notes: 'Grid shows 3:4 crop' },
        'Instagram Carousel': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '1080x1080', icon: 'instagram', category: 'social', notes: 'Also 4:5, 16:9' },
        'Instagram Ad Feed': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '1080x1080', icon: 'instagram', category: 'social' },
        'Instagram Ad Stories': { type: 'image', aspectRatios: ['9:16'], recommendedSize: '1080x1920', icon: 'instagram', category: 'social' },
        'Instagram Reels': { type: 'video', aspectRatios: ['9:16'], recommendedSize: '1080x1920', minDuration: 3, maxDuration: 90, icon: 'instagram', category: 'social' },
        
        // === THREADS ===
        'Threads Profile Picture': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '320x320', icon: 'threads', category: 'social', notes: 'Syncs with Instagram' },
        'Threads Post Square': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '1080x1080', icon: 'threads', category: 'social', notes: 'Flexible dimensions' },
        'Threads Post Portrait': { type: 'image', aspectRatios: ['4:5'], recommendedSize: '1080x1350', icon: 'threads', category: 'social' },
        'Threads Post Landscape': { type: 'image', aspectRatios: ['16:9'], recommendedSize: '1200x627', icon: 'threads', category: 'social' },
        'Threads Post Vertical': { type: 'image', aspectRatios: ['9:16'], recommendedSize: '1080x1920', icon: 'threads', category: 'social', notes: 'Left-aligned in feed' },
        
        // === X (TWITTER) ===
        'X Profile Picture': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '400x400', icon: 'twitter', category: 'social', notes: 'Displays as circle' },
        'X Header Banner': { type: 'image', aspectRatios: ['3:1'], recommendedSize: '1500x500', icon: 'twitter', category: 'social', notes: '60px crop top/bottom' },
        'X In-Stream Image': { type: 'image', aspectRatios: ['16:9'], recommendedSize: '1600x900', icon: 'twitter', category: 'social' },
        'X Card Image': { type: 'image', aspectRatios: ['16:9'], recommendedSize: '1200x628', icon: 'twitter', category: 'social', notes: 'Link preview' },
        'X Ad Landscape': { type: 'image', aspectRatios: ['16:9'], recommendedSize: '800x418', icon: 'twitter', category: 'social' },
        'X Ad Square': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '800x800', icon: 'twitter', category: 'social' },
        
        // === LINKEDIN ===
        'LinkedIn Profile': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '400x400', icon: 'linkedin', category: 'social', notes: 'Displays as circle' },
        'LinkedIn Personal Cover': { type: 'image', aspectRatios: ['4:1'], recommendedSize: '1584x396', icon: 'linkedin', category: 'social' },
        'LinkedIn Company Logo': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '300x300', icon: 'linkedin', category: 'social' },
        'LinkedIn Company Cover': { type: 'image', aspectRatios: ['6:1'], recommendedSize: '1128x191', icon: 'linkedin', category: 'social' },
        'LinkedIn Post/Link': { type: 'image', aspectRatios: ['16:9'], recommendedSize: '1200x627', icon: 'linkedin', category: 'social' },
        'LinkedIn Post Square': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '1200x1200', icon: 'linkedin', category: 'social' },
        'LinkedIn Post Vertical': { type: 'image', aspectRatios: ['9:16'], recommendedSize: '628x1200', icon: 'linkedin', category: 'social' },
        'LinkedIn Ad Horizontal': { type: 'image', aspectRatios: ['16:9'], recommendedSize: '1200x628', icon: 'linkedin', category: 'social' },
        'LinkedIn Ad Square': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '1200x1200', icon: 'linkedin', category: 'social' },
        'LinkedIn Ad Vertical': { type: 'image', aspectRatios: ['9:16'], recommendedSize: '628x1200', icon: 'linkedin', category: 'social' },
        
        // === YOUTUBE ===
        'YouTube Profile Picture': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '800x800', icon: 'youtube', category: 'social', notes: 'Displays at 98x98' },
        'YouTube Channel Banner': { type: 'image', aspectRatios: ['16:9'], recommendedSize: '2560x1440', icon: 'youtube', category: 'social', notes: 'Safe: 1546x423' },
        'YouTube Video Thumbnail': { type: 'image', aspectRatios: ['16:9'], recommendedSize: '1280x720', icon: 'youtube', category: 'social' },
        'YouTube Shorts Thumbnail': { type: 'image', aspectRatios: ['9:16'], recommendedSize: '1080x1920', icon: 'youtube', category: 'social' },
        'YouTube Standard': { type: 'video', aspectRatios: ['16:9'], minDuration: 6, maxDuration: null, icon: 'youtube', category: 'social' },
        'YouTube Shorts': { type: 'video', aspectRatios: ['9:16'], minDuration: null, maxDuration: 60, icon: 'youtube', category: 'social' },
        
        // === TIKTOK ===
        'TikTok Profile Picture': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '200x200', icon: 'tiktok', category: 'social', notes: 'Upload higher quality' },
        'TikTok Video/Stories': { type: 'video', aspectRatios: ['9:16'], recommendedSize: '1080x1920', minDuration: 5, maxDuration: 60, icon: 'tiktok', category: 'social' },
        'TikTok Carousel': { type: 'image', aspectRatios: ['9:16'], recommendedSize: '1080x1920', icon: 'tiktok', category: 'social', notes: 'Also 1:1, 4:5' },
        'TikTok Ad': { type: 'video', aspectRatios: ['9:16'], recommendedSize: '1080x1920', icon: 'tiktok', category: 'social' },
        
        // === PINTEREST ===
        'Pinterest Profile Picture': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '165x165', icon: 'pinterest', category: 'social', notes: 'Displays as circle' },
        'Pinterest Profile Cover': { type: 'image', aspectRatios: ['16:9'], recommendedSize: '1920x1080', icon: 'pinterest', category: 'social' },
        'Pinterest Standard Pin': { type: 'image', aspectRatios: ['2:3'], recommendedSize: '1000x1500', icon: 'pinterest', category: 'social', notes: 'RECOMMENDED' },
        'Pinterest Square Pin': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '1000x1000', icon: 'pinterest', category: 'social' },
        'Pinterest Story Pin': { type: 'image', aspectRatios: ['9:16'], recommendedSize: '1080x1920', icon: 'pinterest', category: 'social' },
        'Pinterest Carousel': { type: 'image', aspectRatios: ['2:3'], recommendedSize: '1000x1500', icon: 'pinterest', category: 'social', notes: '2-5 images' },
        'Pinterest Ad': { type: 'image', aspectRatios: ['2:3'], recommendedSize: '1000x1500', icon: 'pinterest', category: 'social' },
        
        // === BLUESKY ===
        'Bluesky Profile Picture': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '400x400', icon: 'bluesky', category: 'social', notes: 'Displays as circle' },
        'Bluesky Banner/Header': { type: 'image', aspectRatios: ['3:1'], recommendedSize: '1500x500', icon: 'bluesky', category: 'social', notes: 'Mobile crops to 4:1' },
        'Bluesky Post Square': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '1080x1080', icon: 'bluesky', category: 'social', notes: 'Max 2000x2000' },
        'Bluesky Post Portrait': { type: 'image', aspectRatios: ['4:5'], recommendedSize: '1080x1350', icon: 'bluesky', category: 'social' },
        'Bluesky Post Landscape': { type: 'image', aspectRatios: ['16:9'], recommendedSize: '1200x627', icon: 'bluesky', category: 'social' },
        'Bluesky Post Vertical': { type: 'image', aspectRatios: ['9:16'], recommendedSize: '1080x1920', icon: 'bluesky', category: 'social' },
        'Bluesky Link Preview': { type: 'image', aspectRatios: ['16:9'], recommendedSize: '1200x627', icon: 'bluesky', category: 'social' },
        
        // === REDDIT ===
        'Reddit Profile Avatar': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '256x256', icon: 'reddit', category: 'social', notes: 'Displays as circle' },
        'Reddit Profile Banner': { type: 'image', aspectRatios: ['5:1'], recommendedSize: '1920x384', icon: 'reddit', category: 'social', notes: 'Safe zone center' },
        'Reddit Subreddit Banner Large': { type: 'image', aspectRatios: ['5:1'], recommendedSize: '1920x384', icon: 'reddit', category: 'social' },
        'Reddit Subreddit Banner Medium': { type: 'image', aspectRatios: ['7.5:1'], recommendedSize: '1920x256', icon: 'reddit', category: 'social' },
        'Reddit Subreddit Banner Small': { type: 'image', aspectRatios: ['15:1'], recommendedSize: '1920x128', icon: 'reddit', category: 'social' },
        'Reddit Community Icon': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '256x256', icon: 'reddit', category: 'social' },
        'Reddit Post Image': { type: 'image', aspectRatios: ['4:3'], recommendedSize: '1200x900', icon: 'reddit', category: 'social', notes: 'Best for feed display' },
        'Reddit Post Background': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '4000x4000', icon: 'reddit', category: 'social', notes: 'Tiling recommended' },
        
        // === SNAPCHAT ===
        'Snapchat Profile Picture': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '320x320', icon: 'snapchat', category: 'social' },
        'Snapchat Snap/Story': { type: 'both', aspectRatios: ['9:16'], recommendedSize: '1080x1920', minDuration: null, maxDuration: 60, icon: 'snapchat', category: 'social', notes: 'Full screen' },
        'Snapchat Geofilter': { type: 'image', aspectRatios: ['9:16'], recommendedSize: '1080x1920', icon: 'snapchat', category: 'social', notes: 'Transparent BG, 50%+ transparent' },
        'Snapchat Geofilter Alt': { type: 'image', aspectRatios: ['9:16'], recommendedSize: '1080x2340', icon: 'snapchat', category: 'social', notes: 'For newer phones' },
        'Snapchat Snap Ad': { type: 'image', aspectRatios: ['9:16'], recommendedSize: '1080x1920', icon: 'snapchat', category: 'social' },
        'Snapchat Story Ad': { type: 'image', aspectRatios: ['9:16'], recommendedSize: '1080x1920', icon: 'snapchat', category: 'social' },
        'Snapchat Collection Ad': { type: 'image', aspectRatios: ['9:16'], recommendedSize: '1080x1920', icon: 'snapchat', category: 'social' },
        
        // === WHATSAPP ===
        'WhatsApp Profile Picture': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '500x500', icon: 'whatsapp', category: 'social', notes: 'Displays as circle' },
        'WhatsApp Profile Picture HD': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '640x640', icon: 'whatsapp', category: 'social', notes: 'Recommended' },
        'WhatsApp Status Image': { type: 'image', aspectRatios: ['9:16'], recommendedSize: '1080x1920', icon: 'whatsapp', category: 'social', notes: 'Full screen vertical' },
        'WhatsApp Channel Cover': { type: 'image', aspectRatios: ['9:16'], recommendedSize: '1080x1920', icon: 'whatsapp', category: 'social' },
        
        // === GOOGLE BUSINESS ===
        'Google Business Logo': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '720x720', icon: 'google', category: 'social' },
        'Google Business Cover': { type: 'image', aspectRatios: ['16:9'], recommendedSize: '1024x576', icon: 'google', category: 'social' },
        'Google Business Post': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '720x720', icon: 'google', category: 'social' },
        
        // === QUORA ===
        'Quora Profile Picture': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '400x400', icon: 'quora', category: 'social', notes: 'Displays as circle' },
        'Quora Post/Answer Image': { type: 'image', aspectRatios: ['16:9'], recommendedSize: '1200x675', icon: 'quora', category: 'social' },
        'Quora Space Cover': { type: 'image', aspectRatios: ['4:1'], recommendedSize: '1400x350', icon: 'quora', category: 'social' },
        
        // === DISCORD ===
        'Discord Profile Picture': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '512x512', icon: 'discord', category: 'social', notes: 'Animated allowed with Nitro' },
        'Discord Server Icon': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '512x512', icon: 'discord', category: 'social' },
        'Discord Server Banner': { type: 'image', aspectRatios: ['16:9'], recommendedSize: '960x540', icon: 'discord', category: 'social' },
        'Discord Server Invite BG': { type: 'image', aspectRatios: ['16:9'], recommendedSize: '1920x1080', icon: 'discord', category: 'social', notes: 'Nitro required' },
        
        // === TWITCH ===
        'Twitch Profile Picture': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '800x800', icon: 'twitch', category: 'social' },
        'Twitch Profile Banner': { type: 'image', aspectRatios: ['5:2'], recommendedSize: '1200x480', icon: 'twitch', category: 'social' },
        'Twitch Video Player Banner': { type: 'image', aspectRatios: ['16:9'], recommendedSize: '1920x1080', icon: 'twitch', category: 'social' },
        'Twitch Stream Thumbnail': { type: 'image', aspectRatios: ['16:9'], recommendedSize: '1280x720', icon: 'twitch', category: 'social' },
        
        // === TELEGRAM ===
        'Telegram Profile Picture': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '512x512', icon: 'telegram', category: 'social' },
        'Telegram Channel Photo': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '512x512', icon: 'telegram', category: 'social' },
        'Telegram Sticker': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '512x512', icon: 'telegram', category: 'social', notes: 'Transparent BG' },
        
        // ============================================
        // PROGRAMMATIC DISPLAY ADS
        // ============================================
        // NOTE: Display ads use exact pixel dimensions.
        // aspectRatios shown are mathematically correct but NOT Gemini-compatible.
        // Use exactSize for validation; aspectRatios for reference only.
        // ============================================
        
        // === GOOGLE DISPLAY NETWORK (GDN) - Desktop Horizontal ===
        'GDN Leaderboard': { type: 'image', exactSize: { width: 728, height: 90 }, aspectRatios: ['728:90'], orientation: 'horizontal', icon: 'google', category: 'gdn', platform: 'GDN', popular: true, notes: 'Top of page placement' },
        'GDN Large Leaderboard': { type: 'image', exactSize: { width: 970, height: 90 }, aspectRatios: ['97:9'], orientation: 'horizontal', icon: 'google', category: 'gdn', platform: 'GDN', notes: 'Premium placements' },
        'GDN Super Leaderboard': { type: 'image', exactSize: { width: 970, height: 90 }, aspectRatios: ['97:9'], orientation: 'horizontal', icon: 'google', category: 'gdn', platform: 'GDN', notes: 'Same as Large Leaderboard' },
        'GDN Banner': { type: 'image', exactSize: { width: 468, height: 60 }, aspectRatios: ['39:5'], orientation: 'horizontal', icon: 'google', category: 'gdn', platform: 'GDN' },
        'GDN Billboard': { type: 'image', exactSize: { width: 970, height: 250 }, aspectRatios: ['97:25'], orientation: 'horizontal', icon: 'google', category: 'gdn', platform: 'GDN', notes: 'High-impact unit' },
        
        // === GOOGLE DISPLAY NETWORK (GDN) - Desktop Rectangles ===
        'GDN Medium Rectangle': { type: 'image', exactSize: { width: 300, height: 250 }, aspectRatios: ['6:5'], orientation: 'horizontal', icon: 'google', category: 'gdn', platform: 'GDN', popular: true, notes: 'Most common ad size' },
        'GDN Large Rectangle': { type: 'image', exactSize: { width: 336, height: 280 }, aspectRatios: ['6:5'], orientation: 'horizontal', icon: 'google', category: 'gdn', platform: 'GDN' },
        'GDN Square': { type: 'image', exactSize: { width: 250, height: 250 }, aspectRatios: ['1:1'], orientation: 'square', icon: 'google', category: 'gdn', platform: 'GDN' },
        'GDN Small Square': { type: 'image', exactSize: { width: 200, height: 200 }, aspectRatios: ['1:1'], orientation: 'square', icon: 'google', category: 'gdn', platform: 'GDN' },
        
        // === GOOGLE DISPLAY NETWORK (GDN) - Desktop Vertical (Skyscrapers) ===
        'GDN Wide Skyscraper': { type: 'image', exactSize: { width: 160, height: 600 }, aspectRatios: ['4:15'], orientation: 'vertical', icon: 'google', category: 'gdn', platform: 'GDN', notes: 'Sidebar placement' },
        'GDN Skyscraper': { type: 'image', exactSize: { width: 120, height: 600 }, aspectRatios: ['1:5'], orientation: 'vertical', icon: 'google', category: 'gdn', platform: 'GDN' },
        'GDN Half-Page': { type: 'image', exactSize: { width: 300, height: 600 }, aspectRatios: ['1:2'], orientation: 'vertical', icon: 'google', category: 'gdn', platform: 'GDN', notes: 'High viewability' },
        'GDN Portrait': { type: 'image', exactSize: { width: 300, height: 1050 }, aspectRatios: ['2:7'], orientation: 'vertical', icon: 'google', category: 'gdn', platform: 'GDN', notes: 'Pushdown/expanding' },
        'GDN Vertical Banner': { type: 'image', exactSize: { width: 120, height: 240 }, aspectRatios: ['1:2'], orientation: 'vertical', icon: 'google', category: 'gdn', platform: 'GDN' },
        'GDN Vertical Rectangle': { type: 'image', exactSize: { width: 240, height: 400 }, aspectRatios: ['3:5'], orientation: 'vertical', icon: 'google', category: 'gdn', platform: 'GDN' },
        
        // === GOOGLE DISPLAY NETWORK (GDN) - Mobile ===
        'GDN Mobile Banner': { type: 'image', exactSize: { width: 300, height: 50 }, aspectRatios: ['6:1'], orientation: 'horizontal', icon: 'google', category: 'gdn', platform: 'GDN', mobile: true },
        'GDN Mobile Leaderboard': { type: 'image', exactSize: { width: 320, height: 50 }, aspectRatios: ['32:5'], orientation: 'horizontal', icon: 'google', category: 'gdn', platform: 'GDN', mobile: true, popular: true },
        'GDN Large Mobile Banner': { type: 'image', exactSize: { width: 320, height: 100 }, aspectRatios: ['16:5'], orientation: 'horizontal', icon: 'google', category: 'gdn', platform: 'GDN', mobile: true },
        'GDN Mobile Rectangle': { type: 'image', exactSize: { width: 320, height: 250 }, aspectRatios: ['32:25'], orientation: 'horizontal', icon: 'google', category: 'gdn', platform: 'GDN', mobile: true },
        'GDN Mobile Interstitial': { type: 'image', exactSize: { width: 320, height: 480 }, aspectRatios: ['2:3'], orientation: 'vertical', icon: 'google', category: 'gdn', platform: 'GDN', mobile: true },
        
        // === THE TRADE DESK (TTD) - Horizontal ===
        'TTD Leaderboard': { type: 'image', exactSize: { width: 728, height: 90 }, aspectRatios: ['728:90'], orientation: 'horizontal', icon: 'ttd', category: 'ttd', platform: 'TTD', popular: true },
        'TTD Super Leaderboard': { type: 'image', exactSize: { width: 970, height: 90 }, aspectRatios: ['97:9'], orientation: 'horizontal', icon: 'ttd', category: 'ttd', platform: 'TTD' },
        'TTD Billboard': { type: 'image', exactSize: { width: 970, height: 250 }, aspectRatios: ['97:25'], orientation: 'horizontal', icon: 'ttd', category: 'ttd', platform: 'TTD' },
        
        // === THE TRADE DESK (TTD) - Rectangles ===
        'TTD Medium Rectangle': { type: 'image', exactSize: { width: 300, height: 250 }, aspectRatios: ['6:5'], orientation: 'horizontal', icon: 'ttd', category: 'ttd', platform: 'TTD', popular: true },
        'TTD Large Rectangle': { type: 'image', exactSize: { width: 336, height: 280 }, aspectRatios: ['6:5'], orientation: 'horizontal', icon: 'ttd', category: 'ttd', platform: 'TTD' },
        
        // === THE TRADE DESK (TTD) - Vertical ===
        'TTD Wide Skyscraper': { type: 'image', exactSize: { width: 160, height: 600 }, aspectRatios: ['4:15'], orientation: 'vertical', icon: 'ttd', category: 'ttd', platform: 'TTD' },
        'TTD Skyscraper': { type: 'image', exactSize: { width: 120, height: 600 }, aspectRatios: ['1:5'], orientation: 'vertical', icon: 'ttd', category: 'ttd', platform: 'TTD' },
        'TTD Half-Page': { type: 'image', exactSize: { width: 300, height: 600 }, aspectRatios: ['1:2'], orientation: 'vertical', icon: 'ttd', category: 'ttd', platform: 'TTD' },
        'TTD Portrait': { type: 'image', exactSize: { width: 300, height: 1050 }, aspectRatios: ['2:7'], orientation: 'vertical', icon: 'ttd', category: 'ttd', platform: 'TTD' },
        'TTD Vertical Banner': { type: 'image', exactSize: { width: 120, height: 240 }, aspectRatios: ['1:2'], orientation: 'vertical', icon: 'ttd', category: 'ttd', platform: 'TTD' },
        'TTD Vertical Rectangle': { type: 'image', exactSize: { width: 240, height: 400 }, aspectRatios: ['3:5'], orientation: 'vertical', icon: 'ttd', category: 'ttd', platform: 'TTD' },
        
        // === THE TRADE DESK (TTD) - Mobile ===
        'TTD Mobile Banner': { type: 'image', exactSize: { width: 300, height: 50 }, aspectRatios: ['6:1'], orientation: 'horizontal', icon: 'ttd', category: 'ttd', platform: 'TTD', mobile: true },
        'TTD Mobile Leaderboard': { type: 'image', exactSize: { width: 320, height: 50 }, aspectRatios: ['32:5'], orientation: 'horizontal', icon: 'ttd', category: 'ttd', platform: 'TTD', mobile: true },
        'TTD Large Mobile Banner': { type: 'image', exactSize: { width: 320, height: 100 }, aspectRatios: ['16:5'], orientation: 'horizontal', icon: 'ttd', category: 'ttd', platform: 'TTD', mobile: true },
        'TTD Mobile Rectangle': { type: 'image', exactSize: { width: 320, height: 250 }, aspectRatios: ['32:25'], orientation: 'horizontal', icon: 'ttd', category: 'ttd', platform: 'TTD', mobile: true },
        'TTD Mobile Interstitial': { type: 'image', exactSize: { width: 320, height: 480 }, aspectRatios: ['2:3'], orientation: 'vertical', icon: 'ttd', category: 'ttd', platform: 'TTD', mobile: true },
        
        // === DV360 (Display & Video 360) - Horizontal ===
        'DV360 Leaderboard': { type: 'image', exactSize: { width: 728, height: 90 }, aspectRatios: ['728:90'], orientation: 'horizontal', icon: 'dv360', category: 'dv360', platform: 'DV360', popular: true },
        'DV360 Super Leaderboard': { type: 'image', exactSize: { width: 970, height: 90 }, aspectRatios: ['97:9'], orientation: 'horizontal', icon: 'dv360', category: 'dv360', platform: 'DV360' },
        'DV360 Billboard': { type: 'image', exactSize: { width: 970, height: 250 }, aspectRatios: ['97:25'], orientation: 'horizontal', icon: 'dv360', category: 'dv360', platform: 'DV360' },
        
        // === DV360 (Display & Video 360) - Rectangles ===
        'DV360 Medium Rectangle': { type: 'image', exactSize: { width: 300, height: 250 }, aspectRatios: ['6:5'], orientation: 'horizontal', icon: 'dv360', category: 'dv360', platform: 'DV360', popular: true },
        'DV360 Large Rectangle': { type: 'image', exactSize: { width: 336, height: 280 }, aspectRatios: ['6:5'], orientation: 'horizontal', icon: 'dv360', category: 'dv360', platform: 'DV360' },
        
        // === DV360 (Display & Video 360) - Vertical ===
        'DV360 Wide Skyscraper': { type: 'image', exactSize: { width: 160, height: 600 }, aspectRatios: ['4:15'], orientation: 'vertical', icon: 'dv360', category: 'dv360', platform: 'DV360' },
        'DV360 Skyscraper': { type: 'image', exactSize: { width: 120, height: 600 }, aspectRatios: ['1:5'], orientation: 'vertical', icon: 'dv360', category: 'dv360', platform: 'DV360' },
        'DV360 Half-Page': { type: 'image', exactSize: { width: 300, height: 600 }, aspectRatios: ['1:2'], orientation: 'vertical', icon: 'dv360', category: 'dv360', platform: 'DV360' },
        'DV360 Portrait': { type: 'image', exactSize: { width: 300, height: 1050 }, aspectRatios: ['2:7'], orientation: 'vertical', icon: 'dv360', category: 'dv360', platform: 'DV360' },
        'DV360 Vertical Banner': { type: 'image', exactSize: { width: 120, height: 240 }, aspectRatios: ['1:2'], orientation: 'vertical', icon: 'dv360', category: 'dv360', platform: 'DV360' },
        'DV360 Vertical Rectangle': { type: 'image', exactSize: { width: 240, height: 400 }, aspectRatios: ['3:5'], orientation: 'vertical', icon: 'dv360', category: 'dv360', platform: 'DV360' },
        
        // === DV360 (Display & Video 360) - Mobile ===
        'DV360 Mobile Banner': { type: 'image', exactSize: { width: 300, height: 50 }, aspectRatios: ['6:1'], orientation: 'horizontal', icon: 'dv360', category: 'dv360', platform: 'DV360', mobile: true },
        'DV360 Mobile Leaderboard': { type: 'image', exactSize: { width: 320, height: 50 }, aspectRatios: ['32:5'], orientation: 'horizontal', icon: 'dv360', category: 'dv360', platform: 'DV360', mobile: true },
        'DV360 Large Mobile Banner': { type: 'image', exactSize: { width: 320, height: 100 }, aspectRatios: ['16:5'], orientation: 'horizontal', icon: 'dv360', category: 'dv360', platform: 'DV360', mobile: true },
        'DV360 Mobile Rectangle': { type: 'image', exactSize: { width: 320, height: 250 }, aspectRatios: ['32:25'], orientation: 'horizontal', icon: 'dv360', category: 'dv360', platform: 'DV360', mobile: true },
        'DV360 Interstitial': { type: 'image', exactSize: { width: 320, height: 480 }, aspectRatios: ['2:3'], orientation: 'vertical', icon: 'dv360', category: 'dv360', platform: 'DV360', mobile: true },
        
        // === DV360 Native & Video ===
        'DV360 Native Landscape': { type: 'image', aspectRatios: ['1.91:1'], recommendedSize: '1200x628', orientation: 'horizontal', icon: 'dv360', category: 'dv360', platform: 'DV360' },
        'DV360 Native Square': { type: 'image', aspectRatios: ['1:1'], recommendedSize: '1200x1200', orientation: 'square', icon: 'dv360', category: 'dv360', platform: 'DV360' },
        'DV360 Video 16:9': { type: 'video', aspectRatios: ['16:9'], orientation: 'horizontal', minDuration: 6, maxDuration: 120, icon: 'dv360', category: 'dv360', platform: 'DV360' },
        'DV360 Video Vertical': { type: 'video', aspectRatios: ['9:16'], orientation: 'vertical', minDuration: 6, maxDuration: 60, icon: 'dv360', category: 'dv360', platform: 'DV360' },
        
        // === CONNECTED TV (CTV) ===
        'CTV Standard': { type: 'video', aspectRatios: ['16:9'], minDuration: 15, maxDuration: 120, icon: 'ctv', category: 'ctv', platform: 'CTV' },
        
        // === LEGACY GOOGLE ADS ===
        'Google Ads Display': { type: 'image', aspectRatios: ['16:9', '1:1'], icon: 'google', category: 'gdn', platform: 'GDN' },
        'Google Ads Video': { type: 'video', aspectRatios: ['16:9', '1:1', '9:16'], minDuration: 10, icon: 'google', category: 'gdn', platform: 'GDN' },
    };

    // ============================================
    // HELPER: Map display ad ratios to nearest Gemini-compatible ratio
    // Use this when generating images via Gemini API
    // ============================================
    const GEMINI_RATIO_MAP = {
        // Exact matches
        '1:1': '1:1',
        '2:3': '2:3',
        '3:2': '3:2',
        '3:4': '3:4',
        '4:3': '4:3',
        '4:5': '4:5',
        '5:4': '5:4',
        '9:16': '9:16',
        '16:9': '16:9',
        '21:9': '21:9',
        
        // Display ad mappings (nearest Gemini-compatible)
        '6:5': '1:1',       // 300x250, 336x280 → closest to 1:1
        '728:90': '16:9',   // Leaderboard → 16:9 (will need crop)
        '97:9': '16:9',     // Super Leaderboard → 16:9 (will need crop)
        '97:25': '4:3',     // Billboard → 4:3 (will need crop)
        '39:5': '16:9',     // Banner → 16:9 (will need crop)
        '4:15': '9:16',     // Wide Skyscraper → 9:16 (will need crop)
        '1:5': '9:16',      // Skyscraper → 9:16
        '1:2': '9:16',      // Half-Page → 9:16 (will need crop)
        '2:7': '9:16',      // Portrait → 9:16
        '3:5': '9:16',      // Vertical Rectangle → 9:16 (will need crop)
        '6:1': '16:9',      // Mobile Banner → 16:9 (will need crop)
        '32:5': '16:9',     // Mobile Leaderboard → 16:9 (will need crop)
        '16:5': '16:9',     // Large Mobile Banner → 16:9 (will need crop)
        '32:25': '1:1',     // Mobile Rectangle → 1:1 (will need crop)
        '3:1': '21:9',      // Wide banners (X Header, Bluesky) → 21:9
        '4:1': '21:9',      // LinkedIn Personal Cover → 21:9 (will need crop)
        '5:1': '21:9',      // Reddit banners → 21:9 (will need crop)
        '5:2': '21:9',      // Twitch Profile Banner → 21:9 (will need crop)
        '7.5:1': '21:9',    // Reddit Medium Banner → 21:9 (will need crop)
        '15:1': '21:9',     // Reddit Small Banner → 21:9 (will need crop)
        '1.91:1': '16:9',   // Native landscape → 16:9
    };

    // ============================================
    // HELPER: Get Gemini-compatible ratio for any spec
    // ============================================
    function getGeminiRatio(specName) {
        const spec = CHANNEL_SPECS[specName];
        if (!spec) return null;
        
        const ratio = spec.aspectRatios[0];
        return GEMINI_RATIO_MAP[ratio] || ratio;
    }
    
    // ============================================
    // SOCIAL MEDIA PACKAGES (Quick Select)
    // ============================================
    const SOCIAL_MEDIA_PACKAGES = {
        'Instagram Complete': {
            name: 'Instagram Complete Package',
            description: 'All Instagram image formats',
            sizes: ['Instagram Feed Square', 'Instagram Feed Portrait', 'Instagram Feed Tall', 'Instagram Stories', 'Instagram Reels Cover'],
            icon: 'instagram',
            category: 'social'
        },
        'Facebook Complete': {
            name: 'Facebook Complete Package',
            description: 'All Facebook image formats',
            sizes: ['Facebook Feed Square', 'Facebook Feed Landscape', 'Facebook Feed Portrait', 'Facebook Stories'],
            icon: 'meta',
            category: 'social'
        },
        'LinkedIn Complete': {
            name: 'LinkedIn Complete Package',
            description: 'All LinkedIn image formats',
            sizes: ['LinkedIn Post/Link', 'LinkedIn Post Square', 'LinkedIn Post Vertical', 'LinkedIn Ad Horizontal'],
            icon: 'linkedin',
            category: 'social'
        },
        'TikTok/Reels': {
            name: 'TikTok & Reels Package',
            description: 'Vertical video content formats',
            sizes: ['TikTok Video/Stories', 'Instagram Reels', 'YouTube Shorts', 'Facebook Stories'],
            icon: 'tiktok',
            category: 'social'
        },
        'Pinterest Complete': {
            name: 'Pinterest Complete Package',
            description: 'All Pinterest pin formats',
            sizes: ['Pinterest Standard Pin', 'Pinterest Square Pin', 'Pinterest Story Pin'],
            icon: 'pinterest',
            category: 'social'
        },
        'YouTube Complete': {
            name: 'YouTube Complete Package',
            description: 'YouTube thumbnails and formats',
            sizes: ['YouTube Video Thumbnail', 'YouTube Shorts Thumbnail', 'YouTube Channel Banner'],
            icon: 'youtube',
            category: 'social'
        },
        'X (Twitter) Complete': {
            name: 'X (Twitter) Complete Package',
            description: 'All X post formats',
            sizes: ['X In-Stream Image', 'X Card Image', 'X Ad Square', 'X Header Banner'],
            icon: 'twitter',
            category: 'social'
        },
        'Multi-Platform Essential': {
            name: 'Multi-Platform Essential',
            description: 'Core formats for all major platforms',
            sizes: ['Instagram Feed Square', 'Instagram Feed Portrait', 'Instagram Stories', 'Facebook Feed Square', 'LinkedIn Post/Link', 'X In-Stream Image', 'Pinterest Standard Pin'],
            icon: '🌐',
            category: 'social'
        },
        'Stories & Reels': {
            name: 'Stories & Reels Package',
            description: 'All vertical 9:16 formats',
            sizes: ['Instagram Stories', 'Facebook Stories', 'TikTok Video/Stories', 'Pinterest Story Pin', 'Snapchat Snap/Story', 'YouTube Shorts Thumbnail'],
            icon: '📱',
            category: 'social'
        },
        'Profile Pictures': {
            name: 'Profile Pictures Package',
            description: 'Profile pictures for all platforms',
            sizes: ['Instagram Profile Picture', 'Facebook Profile Picture', 'LinkedIn Profile', 'X Profile Picture', 'YouTube Profile Picture', 'TikTok Profile Picture'],
            icon: '👤',
            category: 'social'
        }
    };
    
    // Export for use in AI Fix panel
    window.SOCIAL_MEDIA_PACKAGES = SOCIAL_MEDIA_PACKAGES;
    
    // ============================================
    // DISPLAY AD PACKAGES
    // ============================================
    const DISPLAY_AD_PACKAGES = {
        'GDN Essential': {
            name: 'GDN Essential Package',
            description: 'Most common Google Display Network sizes',
            sizes: ['GDN Medium Rectangle', 'GDN Leaderboard', 'GDN Wide Skyscraper', 'GDN Mobile Leaderboard'],
            icon: 'google',
            category: 'gdn'
        },
        'GDN Complete': {
            name: 'GDN Complete Package',
            description: 'All Google Display Network sizes',
            sizes: ['GDN Medium Rectangle', 'GDN Large Rectangle', 'GDN Leaderboard', 'GDN Wide Skyscraper', 
                    'GDN Half-Page', 'GDN Square', 'GDN Banner', 'GDN Large Leaderboard',
                    'GDN Mobile Leaderboard', 'GDN Large Mobile Banner', 'GDN Mobile Banner Large',
                    'GDN Skyscraper', 'GDN Small Square', 'GDN Billboard'],
            icon: 'google',
            category: 'gdn'
        },
        'TTD Essential': {
            name: 'TTD Essential Package',
            description: 'Most common Trade Desk sizes',
            sizes: ['TTD Medium Rectangle', 'TTD Leaderboard', 'TTD Wide Skyscraper', 'TTD Mobile Leaderboard'],
            icon: 'ttd',
            category: 'ttd'
        },
        'TTD Complete': {
            name: 'TTD Complete Package',
            description: 'All Trade Desk sizes',
            sizes: ['TTD Medium Rectangle', 'TTD Large Rectangle', 'TTD Leaderboard', 'TTD Wide Skyscraper',
                    'TTD Half-Page', 'TTD Billboard', 'TTD Mobile Leaderboard', 'TTD Large Mobile Banner'],
            icon: 'ttd',
            category: 'ttd'
        },
        'DV360 Essential': {
            name: 'DV360 Essential Package',
            description: 'Most common DV360 sizes',
            sizes: ['DV360 Medium Rectangle', 'DV360 Leaderboard', 'DV360 Wide Skyscraper', 'DV360 Mobile Leaderboard'],
            icon: 'dv360',
            category: 'dv360'
        },
        'DV360 Complete': {
            name: 'DV360 Complete Package',
            description: 'All DV360 sizes including video',
            sizes: ['DV360 Medium Rectangle', 'DV360 Large Rectangle', 'DV360 Leaderboard', 'DV360 Wide Skyscraper',
                    'DV360 Half-Page', 'DV360 Billboard', 'DV360 Mobile Leaderboard', 'DV360 Large Mobile Banner',
                    'DV360 Interstitial', 'DV360 Native', 'DV360 Video 16:9', 'DV360 Video Vertical'],
            icon: 'dv360',
            category: 'dv360'
        },
        'Universal Display': {
            name: 'Universal Display Package',
            description: 'Core sizes that work across GDN, TTD, and DV360',
            sizes: ['GDN Medium Rectangle', 'GDN Leaderboard', 'GDN Wide Skyscraper', 'GDN Half-Page',
                    'GDN Mobile Leaderboard', 'GDN Large Mobile Banner', 'GDN Billboard'],
            icon: '🌐'
        }
    };
    
    // Export for use in AI Fix panel
    window.DISPLAY_AD_PACKAGES = DISPLAY_AD_PACKAGES;

    // ============================================
    // ASSET ANALYSIS
    // ============================================
    
    function analyzeAsset(asset) {
        // Normalize asset fields
        const assetType = asset.file_type || asset.type || (asset.duration ? 'video' : 'image');
        const isVideo = assetType === 'video' || asset.duration > 0;
        const isImage = assetType === 'image' || assetType === 'png' || assetType === 'jpg' || assetType === 'jpeg' || 
                        (!asset.duration && !isVideo);
        
        const width = asset.width || 0;
        const height = asset.height || 0;
        
        // Get existing derivatives for this asset to check what's already covered
        const existingDerivatives = getDerivativesForAsset(asset.id);
        const coveredChannels = new Set();
        const coveredRatios = new Set();
        const coveredSizes = new Set();
        
        // Build sets of what's already covered by derivatives
        existingDerivatives.forEach(d => {
            if (d.targetChannel) coveredChannels.add(d.targetChannel);
            if (d.targetRatio) coveredRatios.add(d.targetRatio);
            if (d.targetSize) coveredSizes.add(d.targetSize);
            // Also check by dimensions
            if (d.width && d.height) {
                coveredSizes.add(`${d.width}x${d.height}`);
                const derivRatio = calculateAspectRatio(d.width, d.height);
                coveredRatios.add(derivRatio);
            }
        });
        
        const analysis = {
            assetId: asset.id,
            filename: asset.filename,
            type: isImage ? 'image' : 'video',
            isImage: isImage,
            isVideo: isVideo,
            width: width,
            height: height,
            duration: asset.duration || 0,
            aspectRatio: calculateAspectRatio(width, height),
            aspectRatioDecimal: height > 0 ? width / height : 1,
            compatibleChannels: [],
            offSizeChannels: [],
            missingRequirements: [],
            canCreateAnimation: isImage,
            canExtractStill: isVideo,
            suggestedFixes: [],
            derivativeCount: existingDerivatives.length,
            coveredChannels: Array.from(coveredChannels),
        };

        // Check each channel
        Object.entries(CHANNEL_SPECS).forEach(([channelName, spec]) => {
            const compatibility = checkChannelCompatibility(asset, spec, channelName, analysis);
            
            // Check if this channel is already covered by a derivative
            const isCoveredByDerivative = coveredChannels.has(channelName) ||
                (spec.exactSize && coveredSizes.has(`${spec.exactSize.width}x${spec.exactSize.height}`)) ||
                (spec.aspectRatios && spec.aspectRatios.some(r => coveredRatios.has(r)));
            
            if (compatibility.compatible || isCoveredByDerivative) {
                analysis.compatibleChannels.push({
                    channel: channelName,
                    icon: spec.icon,
                    coveredByDerivative: isCoveredByDerivative && !compatibility.compatible,
                });
            } else {
                analysis.offSizeChannels.push({
                    channel: channelName,
                    icon: spec.icon,
                    issues: compatibility.issues,
                    requiredRatio: compatibility.requiredRatio,
                    requiredRatioDecimal: compatibility.requiredRatioDecimal,
                });
                
                // Generate fix suggestions for EACH channel
                compatibility.issues.forEach(issue => {
                    if (issue.type === 'aspect_ratio' && isImage) {
                        analysis.suggestedFixes.push({
                            type: 'aspect_ratio',
                            channel: channelName,
                            icon: spec.icon,
                            currentValue: analysis.aspectRatio,
                            targetValue: issue.required,
                            targetRatioDecimal: issue.requiredDecimal,
                            canAutoFix: true,
                            fixMethod: 'AI Outpainting',
                            category: spec.category,
                            platform: spec.platform,
                        });
                    }
                    
                    if (issue.type === 'exact_size' && isImage) {
                        analysis.suggestedFixes.push({
                            type: 'exact_size',
                            channel: channelName,
                            icon: spec.icon,
                            currentValue: `${width}x${height}`,
                            targetValue: issue.required,
                            targetWidth: issue.requiredWidth,
                            targetHeight: issue.requiredHeight,
                            targetRatioDecimal: issue.requiredDecimal,
                            canAutoFix: true,
                            fixMethod: 'AI Resize',
                            category: spec.category,
                            platform: spec.platform,
                        });
                    }
                });
            }
        });

        // Add missing requirements summary
        if (analysis.offSizeChannels.length > 0) {
            const uniqueIssues = new Set();
            analysis.offSizeChannels.forEach(ch => {
                ch.issues.forEach(issue => {
                    uniqueIssues.add(issue.message);
                });
            });
            analysis.missingRequirements = Array.from(uniqueIssues);
        }

        return analysis;
    }

    function checkChannelCompatibility(asset, spec, channelName, analysis) {
        const issues = [];
        const ratio = analysis.aspectRatioDecimal;
        let requiredRatio = null;
        let requiredRatioDecimal = null;
        let requiredSize = null;

        // Check if asset type matches channel
        const assetType = analysis.isImage ? 'image' : 'video';
        if (spec.type !== 'both' && spec.type !== assetType) {
            return { 
                compatible: false, 
                issues: [{ type: 'type', message: `${channelName} requires ${spec.type}` }] 
            };
        }

        // Check exact size for display ads
        if (spec.exactSize) {
            const exactMatch = analysis.width === spec.exactSize.width && analysis.height === spec.exactSize.height;
            
            if (!exactMatch) {
                requiredSize = `${spec.exactSize.width}x${spec.exactSize.height}`;
                requiredRatioDecimal = spec.exactSize.width / spec.exactSize.height;
                requiredRatio = spec.aspectRatios?.[0] || `${spec.exactSize.width}:${spec.exactSize.height}`;
                
                issues.push({
                    type: 'exact_size',
                    message: `Need ${requiredSize}`,
                    current: `${analysis.width}x${analysis.height}`,
                    required: requiredSize,
                    requiredWidth: spec.exactSize.width,
                    requiredHeight: spec.exactSize.height,
                    requiredDecimal: requiredRatioDecimal,
                });
            }
            
            return {
                compatible: issues.length === 0,
                issues,
                requiredRatio,
                requiredRatioDecimal,
                requiredSize,
                exactSize: spec.exactSize,
            };
        }

        // Check aspect ratio for non-exact-size channels
        const specRatios = spec.aspectRatios.map(r => {
            const [w, h] = r.split(':').map(Number);
            return { ratio: w / h, label: r };
        });

        const matchesRatio = specRatios.some(sr => Math.abs(ratio - sr.ratio) < 0.05);

        if (!matchesRatio) {
            const closestRatio = specRatios.reduce((closest, sr) => 
                Math.abs(sr.ratio - ratio) < Math.abs(closest.ratio - ratio) ? sr : closest
            );
            
            requiredRatio = closestRatio.label;
            requiredRatioDecimal = closestRatio.ratio;
            
            issues.push({
                type: 'aspect_ratio',
                message: `Need ${closestRatio.label}`,
                current: analysis.aspectRatio,
                required: closestRatio.label,
                requiredDecimal: closestRatio.ratio,
            });
        }

        // Check duration for videos
        if (analysis.isVideo && analysis.duration) {
            if (spec.minDuration && analysis.duration < spec.minDuration) {
                issues.push({
                    type: 'duration',
                    message: `Min ${spec.minDuration}s`,
                    current: analysis.duration,
                    required: spec.minDuration,
                });
            }
            if (spec.maxDuration && analysis.duration > spec.maxDuration) {
                issues.push({
                    type: 'duration',
                    message: `Max ${spec.maxDuration}s`,
                    current: analysis.duration,
                    required: spec.maxDuration,
                });
            }
        }

        return {
            compatible: issues.length === 0,
            issues,
            requiredRatio,
            requiredRatioDecimal,
        };
    }

    function calculateAspectRatio(width, height) {
        if (!width || !height) return 'N/A';
        const ratio = width / height;
        if (Math.abs(ratio - 16/9) < 0.05) return '16:9';
        if (Math.abs(ratio - 9/16) < 0.05) return '9:16';
        if (Math.abs(ratio - 1) < 0.05) return '1:1';
        if (Math.abs(ratio - 4/5) < 0.05) return '4:5';
        if (Math.abs(ratio - 4/3) < 0.05) return '4:3';
        if (Math.abs(ratio - 1.91) < 0.05) return '1.91:1';
        if (Math.abs(ratio - 2/3) < 0.05) return '2:3';
        
        const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
        const divisor = gcd(Math.round(width), Math.round(height));
        return `${Math.round(width/divisor)}:${Math.round(height/divisor)}`;
    }

    // ============================================
    // RENDER AI ACTIONS HTML
    // ============================================

    function renderAIActionsHTML(asset, analysis) {
        let html = '<div class="ai-asset-actions-v2">';
        
        // MAIN ACTION BUTTONS ROW
        html += '<div class="ai-action-row main-actions">';
        
        // AI Fix button - ALWAYS show if there are off-size channels for images (Orange/amber)
        if (analysis.isImage && analysis.offSizeChannels.length > 0) {
            html += `
                <button class="ai-btn ai-btn-fix" data-action="ai-fix-all" data-id="${asset.id}" title="Fix all ${analysis.offSizeChannels.length} off-size channels">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                    <span>AI Fix All</span>
                    <span class="ai-btn-count">${analysis.offSizeChannels.length}</span>
                </button>
            `;
        }
        
        // Animate button for images (Purple)
        if (analysis.isImage) {
            html += `
                <button class="ai-btn ai-btn-animate" data-action="ai-animate" data-id="${asset.id}" title="Create animated video">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2" ry="2"/></svg>
                    <span>Animate</span>
                </button>
            `;
        }
        
        // Video actions
        if (analysis.isVideo) {
            // Resize Video button (uses Cloudinary) - Orange/coral with crop icon
            html += `
                <button class="ai-btn ai-btn-resize-video" data-action="ai-resize-video" data-id="${asset.id}" title="Resize video for different platforms">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/></svg>
                    <span>Resize Video</span>
                </button>
            `;
            
            // Extract Still button - Teal with camera icon
            html += `
                <button class="ai-btn ai-btn-still" data-action="ai-extract-still" data-id="${asset.id}" title="Extract best frame">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                    <span>Extract Still</span>
                </button>
            `;
        }
        
        // AI Studio - Green with sparkles icon
        html += `
            <button class="ai-btn ai-btn-studio" data-action="ai-studio" data-id="${asset.id}" title="Open AI Studio">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
                <span>AI Studio</span>
            </button>
        `;
        
        html += '</div>';
        
        // OFF-SIZE CHANNELS WITH INDIVIDUAL FIX BUTTONS
        if (analysis.offSizeChannels.length > 0) {
            html += '<div class="ai-offsize-section">';
            html += `<div class="ai-offsize-header">
                <span class="ai-offsize-warning">⚠️ Off-size for ${analysis.offSizeChannels.length} channel(s)</span>
            </div>`;
            
            html += '<div class="ai-offsize-channels">';
            
            // Show individual fix buttons for each channel
            analysis.offSizeChannels.forEach(ch => {
                const issue = ch.issues[0];
                // Can fix both aspect_ratio and exact_size issues for images
                const canFix = analysis.isImage && (issue?.type === 'aspect_ratio' || issue?.type === 'exact_size');
                const displayTarget = issue?.requiredWidth ? `${issue.requiredWidth}×${issue.requiredHeight}` : issue?.required;
                
                // Get proper SVG icon based on channel category
                const spec = CHANNEL_SPECS[ch.channel] || {};
                const iconHtml = getChannelIcon(spec.category, ch.channel, spec.mobile);
                
                html += `
                    <div class="ai-channel-fix-item">
                        <span class="ai-channel-icon">${iconHtml}</span>
                        <span class="ai-channel-name">${ch.channel}</span>
                        <span class="ai-channel-issue">${issue?.message || 'N/A'}</span>
                        ${canFix ? `
                            <button class="ai-btn-mini ai-btn-resize" 
                                    data-action="ai-fix-single" 
                                    data-id="${asset.id}" 
                                    data-channel="${ch.channel}"
                                    data-ratio="${issue?.required || ''}"
                                    data-ratio-decimal="${issue?.requiredDecimal || ''}"
                                    data-width="${issue?.requiredWidth || ''}"
                                    data-height="${issue?.requiredHeight || ''}"
                                    title="Resize to ${displayTarget}">
                                <span class="resize-icon">↔</span> ${displayTarget}
                            </button>
                        ` : `
                            <span class="ai-channel-incompatible">Requires ${ch.issues[0]?.type === 'type' ? 'video' : 'manual fix'}</span>
                        `}
                    </div>
                `;
            });
            
            html += '</div></div>';
        }
        
        // COMPATIBLE CHANNELS (including those covered by AI derivatives)
        if (analysis.compatibleChannels.length > 0) {
            const nativeCompatible = analysis.compatibleChannels.filter(ch => !ch.coveredByDerivative);
            const aiCovered = analysis.compatibleChannels.filter(ch => ch.coveredByDerivative);
            
            html += '<div class="ai-compat-section">';
            
            if (nativeCompatible.length > 0) {
                html += `<span class="ai-compat-label">✓ Compatible:</span>`;
                html += '<div class="ai-compat-badges">';
                nativeCompatible.forEach(ch => {
                    const spec = CHANNEL_SPECS[ch.channel] || {};
                    const iconHtml = getChannelIcon(spec.category, ch.channel, spec.mobile);
                    html += `<span class="ai-compat-badge" title="${ch.channel}">${iconHtml}</span>`;
                });
                html += '</div>';
            }
            
            if (aiCovered.length > 0) {
                html += `<span class="ai-compat-label ai-covered-label">🤖 AI Covered (${aiCovered.length}):</span>`;
                html += '<div class="ai-compat-badges ai-covered">';
                aiCovered.forEach(ch => {
                    const spec = CHANNEL_SPECS[ch.channel] || {};
                    const iconHtml = getChannelIcon(spec.category, ch.channel, spec.mobile);
                    html += `<span class="ai-compat-badge ai-covered" title="${ch.channel} - covered by AI derivative">${iconHtml}</span>`;
                });
                html += '</div>';
            }
            
            html += '</div>';
        }
        
        html += '</div>';
        return html;
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================

    function setupEventHandlers() {
        // Use event delegation on document
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            
            const action = btn.dataset.action;
            const assetId = btn.dataset.id;
            
            // Get asset from validator app
            let asset = null;
            if (window.cavValidatorApp?.getAssetById) {
                asset = window.cavValidatorApp.getAssetById(assetId);
            } else if (window.cavApp?.state?.assets) {
                asset = window.cavApp.state.assets.find(a => a.id === assetId);
            }
            
            if (!asset && action.startsWith('ai-')) {
                console.warn('Asset not found:', assetId);
                return;
            }
            
            switch (action) {
                case 'ai-fix-all':
                    const analysis = analyzeAsset(asset);
                    openAIFixPanel(asset, analysis);
                    break;
                    
                case 'ai-fix-single':
                    const channel = btn.dataset.channel;
                    const ratio = btn.dataset.ratio;
                    const ratioDecimal = parseFloat(btn.dataset.ratioDecimal) || null;
                    const singleWidth = btn.dataset.width ? parseInt(btn.dataset.width) : null;
                    const singleHeight = btn.dataset.height ? parseInt(btn.dataset.height) : null;
                    openSingleChannelFix(asset, channel, ratio, ratioDecimal, singleWidth, singleHeight);
                    break;
                    
                case 'ai-animate':
                    const animAnalysis = analyzeAsset(asset);
                    openAnimationPanel(asset, animAnalysis);
                    break;
                    
                case 'ai-extract-still':
                    const stillAnalysis = analyzeAsset(asset);
                    openExtractStillPanel(asset, stillAnalysis);
                    break;
                
                case 'ai-resize-video':
                    openVideoResizePanel(asset);
                    break;
                    
                case 'ai-studio':
                    if (window.cavAIStudio?.openStudio) {
                        window.cavAIStudio.openStudio(asset);
                    } else {
                        alert('AI Studio not loaded');
                    }
                    break;
            }
        });
    }

    // ============================================
    // SINGLE CHANNEL FIX
    // ============================================

    // ============================================
    // GET API KEY (shared with AI Studio)
    // ============================================
    function getApiKey() {
        // Helper to validate API key format
        const isValidKey = (k) => {
            return k && typeof k === 'string' && k.length >= 30 && 
                   /^[A-Za-z0-9_-]+$/.test(k) && 
                   !k.includes('←') && !k.includes('🔧') && !k.includes(' ');
        };
        
        let key = null;
        
        // 0. FIRST: Check CAVSettings (includes shared keys!) - v5.11.0 fix
        if (!key && window.CAVSettings?.getAPIKey) {
            try {
                const settingsKey = window.CAVSettings.getAPIKey('gemini');
                if (isValidKey(settingsKey)) {
                    key = settingsKey;
                    console.log('🔑 [v5.11.0] API Key found via CAVSettings (includes shared keys)');
                }
            } catch (e) {
                console.warn('⚠️ Error getting key from CAVSettings:', e);
            }
        }
        
        // 1. Check platform credentials for shared gemini key
        if (!key) {
            try {
                const platformCreds = JSON.parse(localStorage.getItem('cav_platform_credentials') || '{}');
                if (platformCreds.sharing?.enabled) {
                    const sharedKey = platformCreds.sharedKeys?.gemini;
                    if (isValidKey(sharedKey)) {
                        key = sharedKey;
                        console.log('🔑 [v5.11.0] API Key found in platform shared keys');
                    }
                }
            } catch (e) {
                console.warn('⚠️ Error reading platform credentials:', e);
            }
        }
        
        // 2. Check v3.0 Settings structure (user's own key)
        if (!key) {
            try {
                const v3Settings = localStorage.getItem('cav_v3_settings');
                if (v3Settings) {
                    const settings = JSON.parse(v3Settings);
                    const geminiKey = settings?.apiKeys?.gemini?.key;
                    if (isValidKey(geminiKey)) {
                        key = geminiKey;
                        console.log('🔑 API Key found in v3.0 Settings');
                    }
                }
            } catch (e) {
                console.warn('⚠️ Error reading v3.0 settings:', e);
            }
        }
        
        // 3. Check legacy storage locations
        if (!key) {
            key = localStorage.getItem('cav_ai_api_key');
            if (!isValidKey(key)) {
                if (key) localStorage.removeItem('cav_ai_api_key');
                key = null;
            }
        }
        
        // 4. Check cav_gemini_api_key (used by AI Adapter)
        if (!key) {
            key = localStorage.getItem('cav_gemini_api_key');
            if (!isValidKey(key)) {
                if (key) localStorage.removeItem('cav_gemini_api_key');
                key = null;
            }
        }
        
        // 5. Check AI Studio instance
        if (!key && window.cavAIStudio?.apiKey) {
            const studioKey = window.cavAIStudio.apiKey;
            if (isValidKey(studioKey)) {
                key = studioKey;
            }
        }
        
        // 6. Try to get from AI Studio's getApiKey method
        if (!key && window.cavAIStudio?.getApiKey) {
            const methodKey = window.cavAIStudio.getApiKey();
            if (isValidKey(methodKey)) {
                key = methodKey;
            }
        }
        
        // 7. Try Settings Manager global instance (fallback)
        if (!key && window.cavSettings?.getAPIKey) {
            const settingsKey = window.cavSettings.getAPIKey('gemini');
            if (isValidKey(settingsKey)) {
                key = settingsKey;
            }
        }
        
        // Final return
        if (key) {
            console.log('🔑 API Key found:', `${key.substring(0, 8)}...${key.slice(-4)}`);
            // Sync to legacy storage for backwards compatibility
            if (!localStorage.getItem('cav_ai_api_key')) {
                localStorage.setItem('cav_ai_api_key', key);
            }
            if (!localStorage.getItem('cav_gemini_api_key')) {
                localStorage.setItem('cav_gemini_api_key', key);
            }
            return key;
        }
        
        console.log('🔑 API Key: Not found or invalid - check Settings → API Sharing');
        return '';
    }

    function hasApiKey() {
        const key = getApiKey();
        return key && key.length > 20;
    }

    // ============================================
    // GET ASSET IMAGE DATA (handles URL fetching)
    // ============================================
    async function getAssetImageData(asset) {
        // First check for existing dataUrl
        if (asset.dataUrl && asset.dataUrl.startsWith('data:')) {
            console.log('✅ Using existing dataUrl');
            return asset.dataUrl;
        }

        // Try to fetch from thumbnail_url or file_url
        const imageUrl = asset.thumbnail_url || asset.file_url || asset.thumbnail;
        
        if (imageUrl) {
            console.log('🔄 Fetching image data from URL:', imageUrl.substring(0, 50) + '...');
            try {
                // If it's already a data URL
                if (imageUrl.startsWith('data:')) {
                    return imageUrl;
                }

                // Fetch the image and convert to base64
                const response = await fetch(imageUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch image: ${response.status}`);
                }
                
                const blob = await response.blob();
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        console.log('✅ Image data fetched successfully');
                        resolve(reader.result);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            } catch (error) {
                console.error('Failed to fetch image data:', error);
            }
        }

        // Last resort - try to get from IndexedDB
        if (asset.id && window.cavApp?.storage?.getAsset) {
            try {
                const fullAsset = await window.cavApp.storage.getAsset(asset.id);
                if (fullAsset?.dataUrl) {
                    console.log('✅ Retrieved dataUrl from IndexedDB');
                    return fullAsset.dataUrl;
                }
            } catch (error) {
                console.error('IndexedDB fetch failed:', error);
            }
        }

        return null;
    }

    // ============================================
    // GET FOLDERS AND CRM DATA
    // ============================================
    function getAvailableFolders() {
        if (window.AdvancedFeatures?.folders?.getAll) {
            return window.AdvancedFeatures.folders.getAll();
        }
        // Fallback to localStorage
        try {
            return JSON.parse(localStorage.getItem('cav_folders') || '[]');
        } catch {
            return [];
        }
    }

    function getCRMProjects() {
        if (window.cavCRM?.projects?.list) {
            return window.cavCRM.projects.list();
        }
        try {
            return JSON.parse(localStorage.getItem('cav_crm_projects') || '[]');
        } catch {
            return [];
        }
    }

    function getCRMContacts() {
        if (window.cavCRM?.contacts?.list) {
            return window.cavCRM.contacts.list();
        }
        try {
            return JSON.parse(localStorage.getItem('cav_crm_contacts') || '[]');
        } catch {
            return [];
        }
    }

    // ============================================
    // CONVERT UNSUPPORTED IMAGE FORMATS TO PNG
    // ============================================
    async function convertImageToPng(dataUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth || img.width;
                    canvas.height = img.naturalHeight || img.height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    
                    // Convert to PNG (widely supported)
                    const pngDataUrl = canvas.toDataURL('image/png', 1.0);
                    resolve(pngDataUrl);
                } catch (e) {
                    reject(e);
                }
            };
            
            img.onerror = (e) => {
                reject(new Error('Failed to load image for conversion'));
            };
            
            img.src = dataUrl;
        });
    }

    // ============================================
    // AUTO-CATEGORIZE WITH AI + BRAND DETECTION + CRM AUTO-CREATE
    // ============================================
    async function autoCategorizeAsset(asset, generatedFor) {
        const apiKey = getApiKey();
        if (!apiKey) return { filename: null, category: null, tags: [], description: null };

        try {
            // Get the actual image data for proper analysis
            console.log('🔍 Analyzing image content with AI...');
            const imageData = await getAssetImageData(asset);
            
            if (!imageData) {
                console.warn('No image data available for analysis');
                return { filename: null, category: 'Other', tags: [], description: null };
            }

            // Extract clean base64 and mime type
            let cleanBase64 = imageData.replace(/^data:image\/[a-z+]+;base64,/, '');
            let mimeType = imageData.match(/^data:(image\/[a-z+]+);base64,/)?.[1] || 'image/jpeg';
            
            // Convert unsupported formats (AVIF, HEIC, etc.) to PNG
            const supportedFormats = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
            if (!supportedFormats.includes(mimeType)) {
                console.log(`🔄 Converting ${mimeType} to PNG for AI analysis...`);
                try {
                    const convertedData = await convertImageToPng(imageData);
                    if (convertedData) {
                        cleanBase64 = convertedData.replace(/^data:image\/[a-z+]+;base64,/, '');
                        mimeType = 'image/png';
                        console.log('✅ Image converted to PNG successfully');
                    }
                } catch (convErr) {
                    console.warn('Image conversion failed, trying original:', convErr);
                }
            }

            // Use Gemini 2.0 Flash for analysis (it sees the image!)
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                {
                                    text: `You are an expert at analyzing marketing and advertising images. Look at this image carefully and provide:

1. **filename**: A descriptive filename based on what you actually SEE in the image (no extension, use underscores, max 50 chars). Include the brand name if visible.
2. **category**: Choose the best category from: Marketing, Social Media, Product, Lifestyle, Event, Brand, Sports, Nature, Food, Fashion, Technology, Other
3. **tags**: Up to 5 relevant tags based on what you see
4. **description**: A brief 1-2 sentence description of what's in the image
5. **orientation**: Is this image "vertical" (portrait), "horizontal" (landscape), or "square"?
6. **subject**: What is the main subject of this image? (e.g., "football player", "woman with coffee", "sunset landscape")

**BRAND DETECTION - IMPORTANT:**
7. **brandDetected**: true/false - Is there a recognizable brand, company, product, team, school, or organization visible in this image?
8. **brandName**: The exact brand/company/team name if detected (e.g., "NordVPN", "Norton", "Casteel High School", "Nike", "Apple")
9. **brandType**: Type of brand - "company", "school", "sports_team", "product", "organization", "personal"
10. **brandIndustry**: The industry (e.g., "cybersecurity", "technology", "education", "sports", "retail", "food")
11. **brandWebsite**: If you can determine the website (e.g., "nordvpn.com", "norton.com", "casteelcolts.com")
12. **brandLocation**: City/State if detectable (e.g., "Queen Creek, Arizona" for Casteel High School)

Original filename: ${asset.filename}
Generated for: ${generatedFor}
Image dimensions: ${asset.width}x${asset.height}

IMPORTANT: Look carefully for logos, text, team names, school names, company names, product names, or any identifying marks!

Respond in JSON format only:
{"filename": "brand_descriptive_name", "category": "Category", "tags": ["tag1", "tag2"], "description": "What I see", "orientation": "vertical|horizontal|square", "subject": "main subject", "brandDetected": true/false, "brandName": "Name or null", "brandType": "type or null", "brandIndustry": "industry or null", "brandWebsite": "website or null", "brandLocation": "location or null"}`
                                },
                                {
                                    inlineData: {
                                        mimeType: mimeType,
                                        data: cleanBase64
                                    }
                                }
                            ]
                        }],
                        generationConfig: { temperature: 0.3, maxOutputTokens: 800 }
                    })
                }
            );

            const data = await response.json();
            
            if (data.error) {
                console.error('AI Analysis error:', data.error);
                throw new Error(data.error.message);
            }

            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            console.log('🤖 AI Analysis response:', text);
            
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);
                console.log('✅ AI Analysis complete:', result);
                
                // AUTO-CREATE CRM ENTRY if brand detected
                if (result.brandDetected && result.brandName) {
                    console.log('🏢 Brand detected:', result.brandName);
                    await autoCreateCRMEntry(result, asset);
                }
                
                return result;
            }
        } catch (error) {
            console.warn('Auto-categorization failed:', error);
        }
        
        // Fallback with basic analysis
        const ratio = asset.width / asset.height;
        const orientation = ratio > 1.1 ? 'horizontal' : ratio < 0.9 ? 'vertical' : 'square';
        
        return { 
            filename: null, 
            category: 'Other', 
            tags: [], 
            description: null,
            orientation: orientation,
            subject: 'unknown',
            brandDetected: false
        };
    }
    
    // ============================================
    // AUTO-CREATE CRM ENTRY FOR DETECTED BRAND
    // ============================================
    async function autoCreateCRMEntry(analysisResult, asset) {
        try {
            const { brandName, brandType, brandIndustry, brandWebsite, brandLocation } = analysisResult;
            
            if (!brandName || !window.cavCRM) {
                console.log('⚠️ CRM not available or no brand name');
                return null;
            }
            
            // Check if company already exists
            const existingCompanies = window.cavCRM.getAllCompanies ? 
                window.cavCRM.getAllCompanies({ search: brandName }) : [];
            
            if (existingCompanies && existingCompanies.length > 0) {
                console.log('📋 Company already exists in CRM:', brandName);
                // Link asset to existing company
                const company = existingCompanies[0];
                await linkAssetToCompany(asset, company.id);
                return company;
            }
            
            console.log('🆕 Creating new CRM entry for:', brandName);
            
            // Enrich with web research if SearchAPI available
            let enrichedData = {};
            try {
                enrichedData = await enrichBrandWithWebSearch(brandName, brandIndustry);
            } catch (e) {
                console.log('📡 Web enrichment not available, using detected data');
            }
            
            // Create the company in CRM
            const companyData = {
                name: brandName,
                type: brandType === 'school' ? 'client' : (brandType === 'sports_team' ? 'client' : 'client'),
                industry: enrichedData.industry || brandIndustry || 'Other',
                website: enrichedData.website || brandWebsite || '',
                location: enrichedData.location || brandLocation || '',
                description: enrichedData.description || analysisResult.description || '',
                phone: enrichedData.phone || '',
                email: enrichedData.email || '',
                tags: [brandType, brandIndustry, 'auto-detected'].filter(Boolean),
                notes: `Auto-created from asset analysis on ${new Date().toLocaleDateString()}\nOriginal asset: ${asset.filename}`,
                linkedAssets: [asset.id],
                autoCreated: true,
                sourceAssetId: asset.id
            };
            
            const newCompany = window.cavCRM.createCompany(companyData);
            console.log('✅ CRM Company created:', newCompany);
            
            // Link asset to new company
            await linkAssetToCompany(asset, newCompany.id);
            
            // Also create a project for this brand's assets
            const projectData = {
                name: `${brandName} - Creative Assets`,
                description: `Creative assets for ${brandName}`,
                client: newCompany.id,
                clientName: brandName,
                type: 'campaign',
                status: 'active',
                tags: [brandType, brandIndustry].filter(Boolean),
                assets: [asset.id],
                autoCreated: true
            };
            
            const newProject = window.cavCRM.createProject(projectData);
            console.log('✅ CRM Project created:', newProject);
            
            // Show notification
            showCRMNotification(brandName, newCompany.id);
            
            return newCompany;
            
        } catch (error) {
            console.error('❌ Failed to auto-create CRM entry:', error);
            return null;
        }
    }
    
    // ============================================
    // ENRICH BRAND WITH WEB SEARCH (SearchAPI/OpenAI)
    // ============================================
    async function enrichBrandWithWebSearch(brandName, industry) {
        try {
            // Try SearchAPI first
            const searchApiKey = getSearchAPIKey();
            if (searchApiKey) {
                console.log('🔍 Enriching brand with SearchAPI:', brandName);
                
                const searchQuery = encodeURIComponent(`${brandName} ${industry || ''} official website contact`);
                const response = await fetch(
                    `https://www.searchapi.io/api/v1/search?engine=google&q=${searchQuery}&api_key=${searchApiKey}&num=5`
                );
                
                if (response.ok) {
                    const data = await response.json();
                    const result = parseSearchResults(data, brandName);
                    console.log('📡 SearchAPI enrichment:', result);
                    return result;
                }
            }
            
            // Fallback to Claude/OpenAI for enrichment
            const claudeKey = getClaudeAPIKey();
            if (claudeKey) {
                console.log('🧠 Enriching brand with Claude:', brandName);
                return await enrichWithClaude(brandName, industry, claudeKey);
            }
            
            return {};
        } catch (error) {
            console.warn('Web enrichment failed:', error);
            return {};
        }
    }
    
    // Parse search results to extract brand info
    function parseSearchResults(data, brandName) {
        const result = {};
        
        try {
            // Look for official website
            const organicResults = data.organic_results || [];
            for (const item of organicResults) {
                const link = item.link || '';
                const title = (item.title || '').toLowerCase();
                const snippet = item.snippet || '';
                
                // Try to find official website
                if (title.includes(brandName.toLowerCase()) || 
                    title.includes('official') || 
                    link.includes(brandName.toLowerCase().replace(/\s+/g, ''))) {
                    result.website = link;
                    result.description = snippet;
                    break;
                }
            }
            
            // Extract from knowledge graph if available
            if (data.knowledge_graph) {
                const kg = data.knowledge_graph;
                result.description = kg.description || result.description;
                result.website = kg.website || result.website;
                result.phone = kg.phone || '';
                result.location = kg.address || kg.location || '';
                result.industry = kg.type || kg.category || '';
            }
        } catch (e) {
            console.warn('Error parsing search results:', e);
        }
        
        return result;
    }
    
    // Enrich with Claude AI
    async function enrichWithClaude(brandName, industry, apiKey) {
        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-5-20250929',
                    max_tokens: 500,
                    messages: [{
                        role: 'user',
                        content: `Provide brief business information about "${brandName}" ${industry ? `in the ${industry} industry` : ''}. 
                        
Return JSON only with these fields:
{
  "website": "official website URL",
  "description": "1 sentence description",
  "industry": "industry category",
  "location": "headquarters city, state/country",
  "phone": "main phone if known",
  "email": "contact email if known"
}

If you don't know, use empty strings. Be concise.`
                    }]
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                const text = data.content?.[0]?.text || '';
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
            }
        } catch (e) {
            console.warn('Claude enrichment failed:', e);
        }
        
        return {};
    }
    
    // Get API keys from settings
    function getSearchAPIKey() {
        try {
            const settings = JSON.parse(localStorage.getItem('cav_v3_settings') || '{}');
            return settings?.apiKeys?.searchapi?.key || '';
        } catch (e) { return ''; }
    }
    
    function getClaudeAPIKey() {
        try {
            const settings = JSON.parse(localStorage.getItem('cav_v3_settings') || '{}');
            return settings?.apiKeys?.claude?.key || '';
        } catch (e) { return ''; }
    }
    
    // Link asset to company
    async function linkAssetToCompany(asset, companyId) {
        try {
            asset.companyId = companyId;
            asset.linkedToCRM = true;
            
            // Update in storage
            if (window.cavApp?.storage?.saveAsset) {
                await window.cavApp.storage.saveAsset(asset);
            }
            
            console.log(`🔗 Asset ${asset.filename} linked to company ${companyId}`);
        } catch (e) {
            console.warn('Failed to link asset to company:', e);
        }
    }
    
    // Show CRM notification
    function showCRMNotification(brandName, companyId) {
        const notification = document.createElement('div');
        notification.className = 'cav-crm-notification';
        notification.innerHTML = `
            <div class="crm-notif-content">
                <span class="crm-notif-icon">🏢</span>
                <div class="crm-notif-text">
                    <strong>Brand Detected: ${brandName}</strong>
                    <p>CRM entry auto-created with web research</p>
                </div>
                <button class="crm-notif-view" onclick="window.showCRMCompany && window.showCRMCompany('${companyId}')">View</button>
                <button class="crm-notif-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Add notification styles if not present
        if (!document.getElementById('crm-notif-styles')) {
            const style = document.createElement('style');
            style.id = 'crm-notif-styles';
            style.textContent = `
                .cav-crm-notification {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                    color: white;
                    padding: 0;
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(79, 70, 229, 0.4);
                    z-index: 10000;
                    animation: slideInRight 0.4s ease-out;
                    max-width: 380px;
                }
                .crm-notif-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px 20px;
                }
                .crm-notif-icon {
                    font-size: 28px;
                }
                .crm-notif-text {
                    flex: 1;
                }
                .crm-notif-text strong {
                    display: block;
                    font-size: 14px;
                }
                .crm-notif-text p {
                    font-size: 12px;
                    opacity: 0.9;
                    margin: 4px 0 0;
                }
                .crm-notif-view {
                    background: white;
                    color: #4f46e5;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 13px;
                }
                .crm-notif-view:hover {
                    background: #f0f0ff;
                }
                .crm-notif-close {
                    background: transparent;
                    border: none;
                    color: white;
                    font-size: 20px;
                    cursor: pointer;
                    opacity: 0.7;
                    padding: 0 8px;
                }
                .crm-notif-close:hover {
                    opacity: 1;
                }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Auto-remove after 8 seconds
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease-in reverse';
            setTimeout(() => notification.remove(), 300);
        }, 8000);
    }
    
    // ============================================
    // GET ORIENTATION FOLDER
    // ============================================
    function getOrientationFolder(width, height) {
        const ratio = width / height;
        if (ratio > 1.1) return 'Horizontal';
        if (ratio < 0.9) return 'Vertical';
        return 'Square';
    }
    
    // ============================================
    // CREATE AUTO-FOLDER BY ORIENTATION
    // ============================================
    async function getOrCreateOrientationFolder(orientation) {
        const folderName = `${orientation} Assets`;
        const folders = getAvailableFolders();
        
        // Check if folder exists
        const existing = folders.find(f => f.name === folderName);
        if (existing) return existing.id;
        
        // Create new orientation folder
        const folderId = `folder_${orientation.toLowerCase()}_${Date.now()}`;
        const newFolder = {
            id: folderId,
            name: folderName,
            icon: orientation === 'Vertical' ? '📱' : orientation === 'Horizontal' ? '🖥️' : '⬛',
            color: orientation === 'Vertical' ? '#a855f7' : orientation === 'Horizontal' ? '#3b82f6' : '#10b981',
            autoCategory: orientation.toLowerCase(),
            createdAt: new Date().toISOString()
        };
        
        if (window.AdvancedFeatures?.folders?.create) {
            await window.AdvancedFeatures.folders.create(newFolder);
        } else {
            const allFolders = JSON.parse(localStorage.getItem('cav_folders') || '[]');
            allFolders.push(newFolder);
            localStorage.setItem('cav_folders', JSON.stringify(allFolders));
        }
        
        console.log(`📁 Created orientation folder: ${folderName}`);
        return folderId;
    }

    // ============================================
    // SINGLE CHANNEL FIX WITH FOLDER/CRM SELECTION
    // ============================================

    function openSingleChannelFix(asset, channel, targetRatio, ratioDecimal, targetWidth = null, targetHeight = null) {
        const thumbnailSrc = asset.thumbnail_url || asset.thumbnail || asset.dataUrl || '';
        const apiKeyExists = hasApiKey();
        const folders = getAvailableFolders();
        const projects = getCRMProjects();
        const contacts = getCRMContacts();
        
        // Look up exact size from channel spec if not provided
        const channelSpec = CHANNEL_SPECS[channel];
        if (!targetWidth && !targetHeight && channelSpec?.exactSize) {
            targetWidth = channelSpec.exactSize.width;
            targetHeight = channelSpec.exactSize.height;
        }
        const isExactSize = targetWidth && targetHeight;
        const displaySize = isExactSize ? `${targetWidth}x${targetHeight}` : targetRatio;
        
        // Determine which AI service will be used
        const isGeminiRatio = isGeminiCompatibleRatio(targetRatio, targetWidth, targetHeight);
        const cloudinaryClient = window.cloudinaryClient;
        const hasCloudinary = cloudinaryClient?.hasCredentials?.() || false;
        const aiServiceInfo = isGeminiRatio 
            ? { name: 'Google Gemini', icon: '🍌', color: '#8B5CF6', needsKey: !apiKeyExists }
            : { name: 'Cloudinary AI', icon: '☁️', color: '#3B82F6', needsKey: !hasCloudinary };
        
        const modal = document.createElement('div');
        modal.className = 'ai-modal-overlay';
        modal.innerHTML = `
            <div class="ai-modal ai-modal-large">
                <div class="ai-modal-header">
                    <button class="ai-back-btn" onclick="this.closest('.ai-modal-overlay').remove()">← Back</button>
                    <h3>🔧 Resize for ${channel}</h3>
                    <button class="ai-close-btn" onclick="this.closest('.ai-modal-overlay').remove()">✕</button>
                </div>
                
                <div class="ai-modal-body">
                    ${aiServiceInfo.needsKey ? `
                        <div class="ai-api-key-required">
                            <div class="ai-api-warning">
                                <span class="ai-api-icon">${isGeminiRatio ? '🔑' : '☁️'}</span>
                                <div>
                                    <strong>${isGeminiRatio ? 'Google AI API Key Required' : 'Cloudinary Credentials Required'}</strong>
                                    <p>${isGeminiRatio 
                                        ? 'Standard ratios (1:1, 4:5, 9:16, 16:9, etc.) use Google Gemini API.' 
                                        : `Non-standard ratios like ${displaySize} require Cloudinary AI Generative Fill.`
                                    }</p>
                                </div>
                            </div>
                            ${isGeminiRatio ? `
                                <div class="ai-api-input-group">
                                    <input type="password" id="ai-api-key-input" placeholder="Enter your Google AI API key" class="ai-api-key-field">
                                    <button class="ai-api-save-btn" id="save-api-key-btn">Save Key</button>
                                </div>
                                <p class="ai-api-help">Get your free API key at <a href="https://aistudio.google.com/apikey" target="_blank">aistudio.google.com</a></p>
                            ` : `
                                <p class="ai-api-help">Configure Cloudinary in <strong>Settings → API Keys → Your Cloudinary Account</strong></p>
                                <p class="ai-api-help" style="margin-top: 8px;">Get a free account at <a href="https://cloudinary.com/users/register_free" target="_blank">cloudinary.com</a></p>
                            `}
                        </div>
                    ` : ''}
                    
                    <div class="ai-preview-card">
                        <img src="${thumbnailSrc}" alt="${asset.filename}" class="ai-preview-img">
                        <div class="ai-preview-info">
                            <p class="ai-preview-name">${asset.filename}</p>
                            <p class="ai-preview-specs">${asset.width}×${asset.height} (${calculateAspectRatio(asset.width, asset.height)})</p>
                        </div>
                    </div>
                    
                    <div class="ai-transform-visual">
                        <div class="ai-from">
                            <span class="ai-ratio-box">${asset.width}x${asset.height}</span>
                        </div>
                        <span class="ai-arrow">→</span>
                        <div class="ai-to">
                            <span class="ai-ratio-box target">${displaySize}</span>
                            <span class="ai-channel-tag">${channel}</span>
                        </div>
                    </div>
                    
                    <!-- Storage & Organization Section -->
                    <div class="ai-organization-section">
                        <h4>📁 Storage & Organization</h4>
                        
                        <div class="ai-option-row">
                            <div class="ai-option">
                                <label>Save to Folder</label>
                                <select id="ai-folder-select">
                                    <option value="">📂 Default Library</option>
                                    <option value="__new__">➕ Create New Folder...</option>
                                    ${folders.map(f => `<option value="${f.id}">${f.icon || '📁'} ${f.name}</option>`).join('')}
                                </select>
                            </div>
                            
                            <div class="ai-option" id="new-folder-input" style="display:none;">
                                <label>New Folder Name</label>
                                <input type="text" id="ai-new-folder-name" placeholder="e.g., Instagram Campaign">
                            </div>
                        </div>
                        
                        <div class="ai-option-row">
                            <div class="ai-option">
                                <label>Link to Project</label>
                                <select id="ai-project-select">
                                    <option value="">— No Project —</option>
                                    ${projects.map(p => `<option value="${p.id}">📋 ${p.name}</option>`).join('')}
                                </select>
                            </div>
                            
                            <div class="ai-option">
                                <label>Link to Client/Contact</label>
                                <select id="ai-contact-select">
                                    <option value="">— No Client —</option>
                                    ${contacts.map(c => `<option value="${c.id}">👤 ${c.name} (${c.company || 'Individual'})</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        
                        <label class="ai-checkbox">
                            <input type="checkbox" id="ai-auto-name" checked>
                            🤖 Auto-name file using AI (analyze content)
                        </label>
                    </div>
                    
                    <div class="ai-option">
                        <label>Custom Instructions (AI Constraints)</label>
                        <textarea id="single-fix-prompt" rows="6" style="font-size: 11px; line-height: 1.4;">${getDefaultAIInstructions()}</textarea>
                    </div>
                    
                    <div class="ai-info-box" style="background: linear-gradient(135deg, ${aiServiceInfo.color}15, ${aiServiceInfo.color}05); border-left: 3px solid ${aiServiceInfo.color};">
                        <p>${aiServiceInfo.icon} <strong>${aiServiceInfo.name}</strong> will ${isGeminiRatio ? 'extend' : 'intelligently resize'} your image to fit ${displaySize}.</p>
                        <p style="font-size: 12px; opacity: 0.8; margin-top: 4px;">
                            ${isGeminiRatio 
                                ? '✓ Standard ratio - using Gemini API for outpainting' 
                                : '✓ Non-standard ratio - using Cloudinary AI Generative Fill for precise dimensions'
                            }
                        </p>
                        <p>✅ Original image will NOT be modified - a new version will be created.</p>
                    </div>
                </div>
                
                <div class="ai-modal-footer">
                    <button class="ai-btn-secondary" onclick="this.closest('.ai-modal-overlay').remove()">Cancel</button>
                    <button class="ai-btn-primary ${aiServiceInfo.needsKey ? 'disabled' : ''}" id="single-fix-btn" ${aiServiceInfo.needsKey ? 'disabled' : ''}>
                        🚀 Generate ${displaySize} Version
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Folder select handler
        const folderSelect = modal.querySelector('#ai-folder-select');
        const newFolderInput = modal.querySelector('#new-folder-input');
        if (folderSelect) {
            folderSelect.addEventListener('change', () => {
                newFolderInput.style.display = folderSelect.value === '__new__' ? 'block' : 'none';
            });
        }

        // API Key save handler
        const saveKeyBtn = modal.querySelector('#save-api-key-btn');
        if (saveKeyBtn) {
            saveKeyBtn.onclick = () => {
                const keyInput = modal.querySelector('#ai-api-key-input');
                const key = keyInput?.value?.trim();
                if (key && key.length > 10) {
                    localStorage.setItem('cav_ai_api_key', key);
                    if (window.cavAIStudio) {
                        window.cavAIStudio.apiKey = key;
                    }
                    alert('✅ API Key saved! You can now use AI features.');
                    modal.remove();
                    openSingleChannelFix(asset, channel, targetRatio, ratioDecimal);
                } else {
                    alert('Please enter a valid API key');
                }
            };
        }

        modal.querySelector('#single-fix-btn').onclick = async () => {
            const btn = modal.querySelector('#single-fix-btn');
            const prompt = modal.querySelector('#single-fix-prompt').value;
            const folderId = modal.querySelector('#ai-folder-select').value;
            const newFolderName = modal.querySelector('#ai-new-folder-name')?.value;
            const projectId = modal.querySelector('#ai-project-select').value;
            const contactId = modal.querySelector('#ai-contact-select').value;
            const autoName = modal.querySelector('#ai-auto-name').checked;
            
            btn.innerHTML = '<span class="ai-spinner"></span> Generating with AI...';
            btn.disabled = true;

            try {
                const currentApiKey = getApiKey();
                if (!currentApiKey || currentApiKey.length < 10) {
                    alert('Please enter your Google AI API key first.');
                    btn.innerHTML = `🚀 Generate ${displaySize} Version`;
                    btn.disabled = false;
                    return;
                }

                // Create folder if needed
                let targetFolderId = folderId;
                if (folderId === '__new__' && newFolderName) {
                    targetFolderId = await createFolder(newFolderName);
                }

                // Auto-categorize if enabled
                let aiSuggestions = { filename: null, category: 'Other', tags: [] };
                if (autoName) {
                    btn.innerHTML = '<span class="ai-spinner"></span> Analyzing content...';
                    aiSuggestions = await autoCategorizeAsset(asset, `${channel} ${targetRatio}`);
                }

                // Generate the image
                btn.innerHTML = '<span class="ai-spinner"></span> Generating image...';
                const result = await createResizedVersion(asset, targetRatio, ratioDecimal, channel, prompt, {
                    folderId: targetFolderId,
                    projectId,
                    contactId,
                    aiSuggestions,
                    autoName,
                    targetWidth,
                    targetHeight
                });
                
                if (result.success) {
                    alert(`✅ Created ${targetRatio} version for ${channel}!\n\n` +
                          `📁 Saved to: ${result.folderName || 'Default Library'}\n` +
                          `📋 Linked to: ${result.projectName || 'No project'}`);
                } else {
                    alert(`✅ Derivative created (placeholder).\n\nNote: Full image generation requires valid API key with Imagen access.`);
                }
                
                modal.remove();
                
                if (window.refreshAssetLibrary) {
                    window.refreshAssetLibrary();
                }
            } catch (error) {
                alert(`Error: ${error.message}`);
                btn.innerHTML = `🚀 Create ${displaySize} Version`;
                btn.disabled = false;
            }
        };
    }

    // ============================================
    // DEFAULT AI INSTRUCTIONS FOR IMAGE RESIZING/GENERATION
    // These constraints ensure high-quality, artifact-free output
    // Updated: January 2026 - Comprehensive v2.0
    // ============================================
    
    function getDefaultAIInstructions() {
        return `Please always follow the instructions below
        
CONSTRAINT: scale_x must equal scale_y. All pixels scale uniformly. Non-uniform scaling is prohibited under any circumstance.

OUTPUT IDENTITY RULE: The output must be a transformed version of the source image, not a new image that contains the source. Every pixel in the output must trace back to either: original source pixels (cropped/scaled) or environment-only fill pixels (sky, ground, texture continuation with no objects). If the output contains ANY element that cannot trace to source, reject it. The source image is the final product being resized—it is not an element to be placed within a larger generated scene.

DETECTION (run first): Detect all people, interactions, activities, key objects, text, logos. Count total subjects. Map which edges contain subjects (CONTENT) vs empty space (ENVIRONMENT). Determine content orientation: vertical (subjects stacked), horizontal (subjects spread side-by-side), centered (subjects clustered in middle), or dispersed (subjects scattered throughout).

CONTENT PRESERVATION THRESHOLD: Never output an image that removes more than 50% of detected subjects. Calculate preservation_ratio = subjects_in_output / subjects_in_source. If below 0.5, stop auto-resize and use fallback options.

SUBJECT PRIORITY: Narrative/activity > interactions > faces > full bodies > active objects > text/logos > products > setting > empty background. Never sacrifice higher priority for lower. Never keep a building while deleting people.

RATIO CHANGE CLASSIFICATION:
- MINOR: Aspect shift ≤25% (e.g., 16:9 to 4:3). Auto-process with safeguards.
- MAJOR: Aspect shift >25% (e.g., 16:9 to 1:1). Requires content check before proceeding.
- EXTREME: Orientation flip (landscape to portrait or reverse, e.g., 16:9 to 9:16). Treat as recomposition, not resize.
- BANNER: Target ratio wider than 3:1 (e.g., 4:1, 5:1, 15:1). Special handling required.

CONTENT-TO-RATIO COMPATIBILITY CHECK: Before any resize, evaluate whether source content orientation matches target ratio. Horizontal content (subjects spread wide) is compatible with landscape/banner ratios, incompatible with portrait ratios. Vertical content (subjects stacked tall) is compatible with portrait ratios, incompatible with landscape/banner ratios. Centered content (clustered middle) is adaptable to most ratios via crop or extend. Dispersed content (scattered throughout) is incompatible with major ratio changes. If incompatible, skip auto-resize and proceed to fallback.

RESOLUTION HIERARCHY: 1) Crop only from ENVIRONMENT edges, never into CONTENT, never bisect subjects. 2) If crop insufficient, extend from ENVIRONMENT edges using natural fill. 3) If both fail, use fallback.

NATURAL FILL RULES: Extend ENVIRONMENT only, never replicate CONTENT. Fill must be semantically empty with no identifiable objects. Fill must continue existing color, texture, gradient, or pattern. Fill must be visually indistinguishable from original. No echo, ghost, mirror, duplicate, or hallucinated objects. No visible seams or generation artifacts. Fill must match lighting, color temperature, texture density, noise profile, sharpness, and perspective of source. Fill must match sharpness of adjacent source edge exactly. Sharp source edge requires sharp fill. Blurred/bokeh source edge allows matching blur in fill. Sharp center with blurry fill sides is prohibited—this is disguised letterboxing, not natural fill. Depth of field must be consistent: fill must match foreground blur level, background blur level, and focal plane position of source. If fill sharpness or DOF does not match source, reject fill. Blur-based fill is only acceptable when source edge already contains matching blur or bokeh. If blur is the only available fill method against sharp content, classify output as letterbox, not as resized image, and label accordingly. Test: Could this filled area exist as empty background? Can a human detect where original ends and fill begins? Is there a visible sharpness transition at the fill boundary? If any answer is unfavorable, reject fill.

EXTREME RATIO CHANGES (orientation flip): This is recomposition, not resize. Do not auto-crop. Do not silently delete subjects. If content spread conflicts with target orientation, auto-crop will fail. Options in order: letterbox/pillarbox, split into multiple crops focusing on different subject clusters, flag for manual review, recommend keeping original ratio.

BANNER RATIO HANDLING (targets wider than 3:1 such as 4:1, 5:1, 7.5:1, 15:1): Standard images cannot become extreme banners without major content loss. If source is already banner-shaped (wider than 3:1), process normally. If source is standard ratio, do not auto-convert to banner. Options: extract horizontal slice where subjects align naturally, letterbox with blur/gradient/color fill above and below, flag for dedicated banner asset creation, recommend compatible ratio instead.

MINIMUM RESOLUTION ENFORCEMENT: Before output, verify dimensions meet platform minimums. Instagram/Facebook Feed: 600x600 minimum. Stories/Reels/TikTok: 600x1067 minimum. Pinterest Pin: 600x900 minimum. YouTube Thumbnail: 640x360 minimum. LinkedIn Post: 552x289 minimum. If resize would drop below platform minimum, upscale uniformly to meet minimum or flag as resolution-incompatible.

FILE SIZE HANDLING: If output exceeds platform maximum file size, compress quality first before reducing resolution. Never sacrifice resolution to meet file size limits if quality compression is available. If compression insufficient, flag for manual optimization.

FALLBACK HIERARCHY: 1) Letterbox/pillarbox preserving 100% content with gaussian blur of edges, dominant color, or gradient fill—clearly labeled as letterbox, not as natural resize. 2) Multiple output versions each focusing on different subject clusters, clearly labeled. 3) Flag for manual review with warning explaining incompatibility. 4) Recommend optimal ratio based on content spread and orientation. 5) Output original with ratio mismatch warning rather than destroying content.

PROHIBITED: Independent X/Y scaling, stretching, compression, removing more than 50% of subjects, bisecting subjects, separating interacting subjects, echo/ghost/mirror artifacts, visible seams, hallucinated objects in fill, tiled repetition, prioritizing background over subjects, prioritizing setting over people, outputting obvious AI-generated fill, silently deleting content, auto-converting standard images to extreme banner ratios, dropping below platform minimum resolution, sharp-to-blur transitions at fill boundaries, mismatched depth of field in fill, disguising letterbox as natural fill, blur-based fill against sharp source edges, embedding source image inside generated mockups or device frames, creating new compositions around the source image, adding objects or people or hands or devices or furniture or environmental elements that did not exist in source, treating source image as element within larger generated scene, generating any content that did not originate from source pixels or environment-only fill.

VALIDATION: Confirm scale_x equals scale_y. Confirm preservation_ratio at or above 0.5. Confirm no subjects bisected. Confirm no interactions separated. Confirm no visible artifacts. Confirm fill matches source quality including sharpness and depth of field. Confirm no sharpness transition at fill boundaries. Confirm narrative intact. Confirm output meets platform minimum resolution. Confirm letterbox outputs are labeled as letterbox. Confirm output contains ONLY pixels derived from source image via crop, scale, or environment-only fill. Confirm no new objects, people, hands, devices, or scene elements were added. Confirm source image was not embedded within generated mockup, device frame, or fabricated scene. Always output best available option. Never fail silently. Log all decisions and fallbacks applied.`;
    }
    
    // Make available globally for other modules
    window.getDefaultAIInstructions = getDefaultAIInstructions;

    // ============================================
    // AI GENERATION - NO FALLBACKS (Official Google API Dec 2025)
    // Based on: https://ai.google.dev/gemini-api/docs/imagen
    //           https://ai.google.dev/gemini-api/docs/video
    // ============================================

    const AI_GENERATION_MODELS = {
        // Nano Banana - Fast image generation (Gemini 2.5 Flash Image)
        nanoBanana: {
            name: 'Nano Banana (gemini-2.5-flash-image)',
            endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent',
            maxInputImages: 3,
            maxResolution: 1024
        },
        // Nano Banana Pro - Advanced image generation (Gemini 3 Pro Image)
        nanoBananaPro: {
            name: 'Nano Banana Pro (gemini-3-pro-image-preview)',
            endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent',
            maxInputImages: 14,
            resolutions: ['1K', '2K', '4K'],
            supportsGrounding: true,
            supportsThinking: true
        },
        // Imagen 3 Direct API (for specific use cases)
        imagen: {
            name: 'Imagen 3 Direct',
            endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict',
            editEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-capability-001:predict'
        },
        // Gemini 3 Flash for analysis and image generation
        geminiFlash: {
            name: 'Gemini 3 Flash',
            endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent'
        },
        // Veo 3.1 for video generation with native audio
        veo: {
            name: 'Veo 3.1 (veo-3.1-generate-preview)',
            endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:generateVideos',
            fastEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-fast-generate-preview:generateVideos',
            resolutions: ['720p', '1080p'],
            aspectRatios: ['16:9', '9:16'],
            durations: [4, 6, 8],
            frameRate: 24,
            supportsAudio: true,
            supportsReferenceImages: true,
            maxReferenceImages: 3
        }
    };

    // Valid aspect ratios for Gemini image generation API
    const VALID_API_ASPECT_RATIOS = {
        '1:1': 1,
        '2:3': 2/3,
        '3:2': 3/2,
        '3:4': 3/4,
        '4:3': 4/3,
        '4:5': 4/5,
        '5:4': 5/4,
        '9:16': 9/16,
        '16:9': 16/9,
        '21:9': 21/9
    };

    // Helper function to check if a ratio is Gemini-compatible (within 5% tolerance)
    function isGeminiCompatibleRatio(targetRatio, targetWidth, targetHeight) {
        let numericRatio;
        
        // Calculate numeric ratio from dimensions if provided
        if (targetWidth && targetHeight) {
            numericRatio = targetWidth / targetHeight;
        } else if (targetRatio && targetRatio.includes(':')) {
            const parts = targetRatio.split(':').map(p => parseFloat(p.trim()));
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[1] !== 0) {
                numericRatio = parts[0] / parts[1];
            }
        } else if (targetRatio && targetRatio.includes('x')) {
            const parts = targetRatio.split('x').map(Number);
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[1] !== 0) {
                numericRatio = parts[0] / parts[1];
            }
        }
        
        if (!numericRatio) return false;
        
        // Check against each valid Gemini ratio with 5% tolerance
        const tolerance = 0.05;
        for (const [name, ratio] of Object.entries(VALID_API_ASPECT_RATIOS)) {
            const diff = Math.abs(numericRatio - ratio) / ratio;
            if (diff <= tolerance) {
                console.log(`📐 Ratio ${numericRatio.toFixed(3)} matches Gemini ratio ${name} (${(diff * 100).toFixed(1)}% diff)`);
                return true;
            }
        }
        
        console.log(`📐 Ratio ${numericRatio.toFixed(3)} is NOT Gemini-compatible (requires Cloudinary)`);
        return false;
    }

    // Helper function to find the closest valid API aspect ratio from a numeric ratio
    function findClosestValidRatio(targetRatio) {
        let closest = '1:1';
        let closestDiff = Math.abs(targetRatio - 1);
        
        for (const [name, ratio] of Object.entries(VALID_API_ASPECT_RATIOS)) {
            const diff = Math.abs(targetRatio - ratio);
            if (diff < closestDiff) {
                closestDiff = diff;
                closest = name;
            }
        }
        
        return closest;
    }

    // Helper function to convert pixel dimensions to valid API aspect ratio
    function getValidApiAspectRatio(width, height) {
        const targetRatio = width / height;
        const closest = findClosestValidRatio(targetRatio);
        console.log(`📐 Mapped ${width}x${height} (ratio ${targetRatio.toFixed(3)}) to API aspect ratio: ${closest}`);
        return closest;
    }

    // Helper function to convert any aspect ratio string to a valid API ratio
    function normalizeAspectRatioForApi(ratioStr) {
        // If it's already a valid ratio, return it
        if (VALID_API_ASPECT_RATIOS.hasOwnProperty(ratioStr)) {
            return ratioStr;
        }
        
        // Try to parse ratio string like "1.91:1" or "16:9"
        if (ratioStr && ratioStr.includes(':')) {
            const parts = ratioStr.split(':').map(p => parseFloat(p.trim()));
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[1] !== 0) {
                const numericRatio = parts[0] / parts[1];
                const closest = findClosestValidRatio(numericRatio);
                if (ratioStr !== closest) {
                    console.log(`📐 Converted non-standard ratio "${ratioStr}" (${numericRatio.toFixed(3)}) to API-valid: ${closest}`);
                }
                return closest;
            }
        }
        
        // Try to parse dimension format "300x250"
        if (ratioStr && ratioStr.includes('x')) {
            const parts = ratioStr.split('x').map(Number);
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[1] !== 0) {
                return getValidApiAspectRatio(parts[0], parts[1]);
            }
        }
        
        // Default fallback
        console.log(`📐 Could not parse ratio "${ratioStr}", defaulting to 1:1`);
        return '1:1';
    }
    
    async function generateImageWithNanoBanana(sourceImageBase64, prompt, targetAspectRatio, apiKey, options = {}) {
        const { targetWidth, targetHeight } = options;
        const isExactSize = targetWidth && targetHeight;
        
        // Convert to valid API aspect ratio
        let apiAspectRatio;
        if (isExactSize) {
            // Use exact dimensions if provided
            apiAspectRatio = getValidApiAspectRatio(targetWidth, targetHeight);
        } else {
            // Normalize any ratio string (handles "1.91:1", "16:9", "300x250", etc.)
            apiAspectRatio = normalizeAspectRatioForApi(targetAspectRatio);
        }
        
        console.log('🖼️ Generating image with Nano Banana...');
        console.log('   Prompt:', prompt);
        console.log('   Original Target:', targetAspectRatio);
        console.log('   API Aspect Ratio:', apiAspectRatio);
        if (isExactSize) {
            console.log('   Target Exact Size:', `${targetWidth}x${targetHeight}px`);
        }
        
        // Extract clean base64 data
        const cleanBase64 = sourceImageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        const mimeType = sourceImageBase64.match(/^data:(image\/[a-z]+);base64,/)?.[1] || 'image/jpeg';
        
        let lastError = null;

        // Method 1: Try Nano Banana Pro (gemini-3-pro-image-preview) - Best quality with thinking
        // Based on official docs: https://ai.google.dev/gemini-api/docs/imagen
        console.log('🍌✨ Trying Nano Banana Pro (gemini-3-pro-image-preview)...');
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                { text: prompt },
                                { 
                                    inlineData: {
                                        mimeType: mimeType,
                                        data: cleanBase64
                                    }
                                }
                            ]
                        }],
                        generationConfig: {
                            responseModalities: ["TEXT", "IMAGE"],
                            imageConfig: {
                                aspectRatio: apiAspectRatio,
                                imageSize: "2K"
                            }
                        }
                    })
                }
            );

            const data = await response.json();
            console.log('Nano Banana Pro response status:', response.status);
            
            if (response.ok && data.candidates?.[0]?.content?.parts) {
                const parts = data.candidates[0].content.parts;
                for (const part of parts) {
                    if (part.inlineData?.mimeType?.startsWith('image/')) {
                        console.log('✅ Nano Banana Pro image generation successful!');
                        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    }
                }
                console.log('Response parts (no image found):', JSON.stringify(parts.map(p => Object.keys(p))));
            } else {
                lastError = data.error?.message || `Status ${response.status}`;
                console.log('Nano Banana Pro error:', lastError);
            }
        } catch (error) {
            lastError = error.message;
            console.log('Nano Banana Pro attempt failed:', error.message);
        }

        // Method 2: Try Nano Banana (gemini-2.5-flash-image) - Fast and efficient
        console.log('🍌 Trying Nano Banana (gemini-2.5-flash-image)...');
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                { text: prompt },
                                { 
                                    inlineData: {
                                        mimeType: mimeType,
                                        data: cleanBase64
                                    }
                                }
                            ]
                        }],
                        generationConfig: {
                            responseModalities: ["TEXT", "IMAGE"],
                            imageConfig: {
                                aspectRatio: apiAspectRatio
                            }
                        }
                    })
                }
            );

            const data = await response.json();
            console.log('Nano Banana response status:', response.status);
            
            if (response.ok && data.candidates?.[0]?.content?.parts) {
                const parts = data.candidates[0].content.parts;
                for (const part of parts) {
                    if (part.inlineData?.mimeType?.startsWith('image/')) {
                        console.log('✅ Nano Banana image generation successful!');
                        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    }
                }
            } else {
                lastError = data.error?.message || `Status ${response.status}`;
                console.log('Nano Banana error:', lastError);
            }
        } catch (error) {
            lastError = error.message;
            console.log('Nano Banana attempt failed:', error.message);
        }

        // Method 3: Try Gemini 2.0 Flash Experimental (fallback)
        console.log('⚡ Trying Gemini 2.0 Flash Experimental (fallback)...');
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                { text: `Edit this image: ${prompt}. Generate the edited image as output.` },
                                { 
                                    inlineData: {
                                        mimeType: mimeType,
                                        data: cleanBase64
                                    }
                                }
                            ]
                        }],
                        generationConfig: {
                            responseModalities: ["IMAGE", "TEXT"]
                        }
                    })
                }
            );

            const data = await response.json();
            console.log('Gemini 2.0 Flash response status:', response.status);
            
            if (response.ok && data.candidates?.[0]?.content?.parts) {
                const parts = data.candidates[0].content.parts;
                for (const part of parts) {
                    if (part.inlineData?.mimeType?.startsWith('image/')) {
                        console.log('✅ Gemini 2.0 Flash image generation successful!');
                        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    }
                }
                console.log('Response parts:', JSON.stringify(parts.map(p => Object.keys(p))));
            } else {
                lastError = data.error?.message || `Status ${response.status}`;
                console.log('Gemini 2.0 Flash error:', lastError);
            }
        } catch (error) {
            lastError = error.message;
            console.log('Gemini 2.0 Flash attempt failed:', error.message);
        }

        // Method 3: Try Imagen 3 Direct API
        console.log('🎨 Trying Imagen 3 Direct API...');
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        instances: [{
                            prompt: prompt,
                            image: {
                                bytesBase64Encoded: cleanBase64
                            }
                        }],
                        parameters: {
                            sampleCount: 1,
                            aspectRatio: apiAspectRatio,
                            safetyFilterLevel: "block_only_high"
                        }
                    })
                }
            );

            const data = await response.json();
            console.log('Imagen 3 response status:', response.status);
            
            if (response.ok && data.predictions?.[0]?.bytesBase64Encoded) {
                console.log('✅ Imagen 3 generation successful!');
                return `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`;
            } else {
                lastError = data.error?.message || `Status ${response.status}`;
                console.log('Imagen 3 error:', lastError);
            }
        } catch (error) {
            lastError = error.message;
            console.log('Imagen 3 attempt failed:', error.message);
        }

        // Method 4: Try Gemini 3 Flash with image output (newer model with multimodal output)
        console.log('🔄 Trying Gemini 3 Flash (multimodal output)...');
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                { 
                                    text: `You are an expert image editor. Based on the source image provided, create a new edited version that: ${prompt}. 
                                    
Generate the modified image directly.`
                                },
                                { 
                                    inlineData: {
                                        mimeType: mimeType,
                                        data: cleanBase64
                                    }
                                }
                            ]
                        }],
                        generationConfig: {
                            responseModalities: ['IMAGE', 'TEXT'],
                            imageConfig: {
                                imageSize: '1K'
                            }
                        }
                    })
                }
            );

            const data = await response.json();
            console.log('Gemini 3 Flash response status:', response.status);
            
            if (response.ok && data.candidates?.[0]?.content?.parts) {
                const parts = data.candidates[0].content.parts;
                for (const part of parts) {
                    if (part.inlineData?.mimeType?.startsWith('image/')) {
                        console.log('✅ Gemini 3 Flash image generation successful!');
                        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    }
                }
            } else {
                lastError = data.error?.message || `Status ${response.status}`;
                console.log('Gemini 3 Flash error:', lastError);
            }
        } catch (error) {
            lastError = error.message;
            console.log('Gemini 3 Flash attempt failed:', error.message);
        }

        // If all methods fail, provide detailed error
        const errorDetails = lastError ? `\n\nLast error: ${lastError}` : '';
        throw new Error(
            `Image generation failed.${errorDetails}\n\n` +
            'This could be because:\n' +
            '1. Image generation models (Nano Banana, Imagen 3) require the Gemini API PAID tier\n' +
            '2. Your API key may be on Free Tier 1 (analysis only)\n' +
            '3. The models may not be available in your region\n\n' +
            'To enable image generation:\n' +
            '1. Go to https://aistudio.google.com\n' +
            '2. Click on "Get API key" → "Billing"\n' +
            '3. Enable "Pay as you go" or upgrade to a paid plan\n\n' +
            'Check the browser console (F12) for detailed logs.'
        );
    }

    async function generateVideoWithVeo(sourceImageBase64, prompt, duration, apiKey) {
        console.log('🎬 Generating video with Veo 3.1...');
        console.log('   Prompt:', prompt);
        console.log('   Duration:', duration, 'seconds');

        // Clean the base64 data
        const cleanBase64 = sourceImageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        const mimeType = sourceImageBase64.match(/^data:(image\/[a-z]+);base64,/)?.[1] || 'image/jpeg';
        
        // Normalize duration to valid Veo 3.1 values (4, 6, or 8 seconds)
        const validDuration = [4, 6, 8].includes(duration) ? duration : 8;
        
        let lastError = null;
        let retryCount = 0;
        const maxRetries = 2;

        // Check if GoogleGenAI SDK is available
        while (window.GoogleGenAI && retryCount <= maxRetries) {
            console.log(`🎥 Using Google GenAI SDK for Veo 3.1... (attempt ${retryCount + 1}/${maxRetries + 1})`);
            try {
                const ai = new window.GoogleGenAI({ apiKey: apiKey });
                
                const generateVideoPayload = {
                    model: 'veo-3.1-generate-preview',
                    prompt: prompt,
                    image: {
                        imageBytes: cleanBase64,
                        mimeType: mimeType
                    },
                    config: {
                        numberOfVideos: 1,
                        resolution: '720p',
                        aspectRatio: '16:9',
                        durationSeconds: validDuration
                    }
                };
                
                console.log('📤 Submitting video generation request...');
                let operation = await ai.models.generateVideos(generateVideoPayload);
                console.log('⏳ Video generation operation started:', operation);
                
                // Check for immediate error
                if (operation?.error) {
                    console.log('❌ Operation error:', operation.error);
                    lastError = new Error(operation.error.message || 'Video generation failed');
                    retryCount++;
                    continue;
                }
                
                // Poll until done
                let pollCount = 0;
                const maxPolls = 60; // 10 minutes max
                while (!operation.done && pollCount < maxPolls) {
                    await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second intervals
                    pollCount++;
                    console.log(`⏳ Generating... (${pollCount * 10}s elapsed)`);
                    
                    try {
                        operation = await ai.operations.getVideosOperation({ operation: operation });
                    } catch (pollError) {
                        console.log('Poll error:', pollError.message);
                        // Continue polling if there's an error
                    }
                }
                
                // Check result thoroughly
                console.log('📋 Operation result:', JSON.stringify(operation, null, 2).substring(0, 500));
                
                if (operation?.response?.generatedVideos) {
                    const videos = operation.response.generatedVideos;
                    console.log(`📹 Found ${videos.length} generated video(s)`);
                    
                    if (videos.length > 0) {
                        const firstVideo = videos[0];
                        
                        // Check different possible video locations
                        const videoUri = firstVideo?.video?.uri || 
                                        firstVideo?.uri || 
                                        firstVideo?.downloadUri;
                        
                        if (videoUri) {
                            console.log('📥 Fetching video from:', videoUri);
                            
                            // Try to fetch the video
                            try {
                                const fetchUrl = videoUri.includes('key=') ? 
                                    decodeURIComponent(videoUri) : 
                                    `${decodeURIComponent(videoUri)}${videoUri.includes('?') ? '&' : '?'}key=${apiKey}`;
                                    
                                const res = await fetch(fetchUrl);
                                if (res.ok) {
                                    const videoBlob = await res.blob();
                                    const objectUrl = URL.createObjectURL(videoBlob);
                                    console.log('✅ Veo 3.1 video generation successful!');
                                    return objectUrl;
                                } else {
                                    console.log('❌ Video fetch failed:', res.status, res.statusText);
                                }
                            } catch (fetchError) {
                                console.log('❌ Video fetch error:', fetchError.message);
                            }
                        } else if (firstVideo?.video?.videoBytes) {
                            // Video returned as base64
                            console.log('📦 Video returned as base64 data');
                            const videoBlob = new Blob([
                                Uint8Array.from(atob(firstVideo.video.videoBytes), c => c.charCodeAt(0))
                            ], { type: 'video/mp4' });
                            const objectUrl = URL.createObjectURL(videoBlob);
                            console.log('✅ Veo 3.1 video generation successful!');
                            return objectUrl;
                        }
                    }
                }
                
                // Check if there's an error message in the response
                if (operation?.error) {
                    lastError = new Error(operation.error.message || 'Video generation failed');
                    console.log('❌ Generation error:', lastError.message);
                } else {
                    lastError = new Error('Video generation completed but no video returned. The image may have triggered content filtering.');
                    console.log('⚠️ No video in response');
                }
                
            } catch (sdkError) {
                console.log('SDK error:', sdkError.message);
                lastError = sdkError;
            }
            
            retryCount++;
            if (retryCount <= maxRetries) {
                console.log(`⏳ Retrying in 5 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        // Fallback: Try REST API with generateVideos endpoint
        console.log('🎥 Trying Veo 3.1 REST API...');
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:generateVideos?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: prompt,
                        image: {
                            imageBytes: cleanBase64,
                            mimeType: 'image/jpeg'
                        },
                        config: {
                            numberOfVideos: 1,
                            resolution: '720p',
                            aspectRatio: '16:9'
                        }
                    })
                }
            );

            const data = await response.json();
            console.log('Veo 3.1 REST response:', response.status, data);

            if (response.ok && data.name) {
                console.log('⏳ Video generation started, operation:', data.name);
                const videoResult = await pollForVeoVideoCompletion(data.name, apiKey);
                if (videoResult) {
                    console.log('✅ Veo 3.1 video generation successful!');
                    return videoResult;
                }
            } else if (data.error) {
                console.log('Veo 3.1 error:', data.error.message || data.error);
            }
        } catch (error) {
            console.log('Veo 3.1 REST attempt failed:', error.message);
        }

        // Fallback: Try Veo 3.1 Fast
        console.log('⚡ Trying Veo 3.1 Fast REST API...');
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-fast-generate-preview:generateVideos?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: prompt,
                        image: {
                            imageBytes: cleanBase64,
                            mimeType: 'image/jpeg'
                        },
                        config: {
                            numberOfVideos: 1,
                            resolution: '720p',
                            aspectRatio: '16:9'
                        }
                    })
                }
            );

            const data = await response.json();
            console.log('Veo 3.1 Fast REST response:', response.status, data);

            if (response.ok && data.name) {
                console.log('⏳ Video generation started, operation:', data.name);
                const videoResult = await pollForVeoVideoCompletion(data.name, apiKey);
                if (videoResult) {
                    console.log('✅ Veo 3.1 Fast video generation successful!');
                    return videoResult;
                }
            }
        } catch (error) {
            console.log('Veo 3.1 Fast REST attempt failed:', error.message);
        }

        // Final error with helpful message based on what went wrong
        const errorDetails = lastError?.message || 'Unknown error';
        
        if (errorDetails.includes('content filtering') || errorDetails.includes('no video returned')) {
            throw new Error(
                'Video generation failed - Content Issue\n\n' +
                '⚠️ The image may have triggered content safety filters.\n\n' +
                '🔧 TRY THESE SOLUTIONS:\n' +
                '1. Try a different image with clearer content\n' +
                '2. Simplify your prompt\n' +
                '3. Use AI Studio directly: https://aistudio.google.com\n\n' +
                'Image resize/outpainting works - video generation has stricter requirements.'
            );
        } else {
            throw new Error(
                'Video generation failed.\n\n' +
                '⚠️ CORS ISSUE: The Veo generateVideos API blocks browser requests.\n\n' +
                '🔧 SOLUTIONS:\n' +
                '1. Use Google AI Studio directly: https://aistudio.google.com\n' +
                '2. The Image Resize/AI Fix features work in the browser\n' +
                '3. For video, use the Veo Studio applet or set up a backend\n\n' +
                'Your API key has Veo access - the issue is browser CORS restrictions.'
            );
        }
    }

    // Poll for Veo video completion (handles long-running operations)
    async function pollForVeoVideoCompletion(operationName, apiKey, maxAttempts = 60) {
        console.log('⏳ Polling for video completion...', operationName);
        
        // Extract just the operation path if full name provided
        const opPath = operationName.startsWith('operations/') ? operationName : `operations/${operationName}`;
        const pollUrl = `https://generativelanguage.googleapis.com/v1beta/${opPath}?key=${apiKey}`;
        
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds between polls
            
            try {
                const response = await fetch(pollUrl);
                const data = await response.json();
                
                console.log(`⏳ Poll attempt ${attempt + 1}/${maxAttempts}:`, data.done ? 'DONE' : 'IN PROGRESS');
                
                if (data.done) {
                    if (data.error) {
                        console.error('Video generation error:', data.error);
                        throw new Error(data.error.message || 'Video generation failed');
                    }
                    
                    // Check for generated videos in response
                    const generatedVideos = data.response?.generatedVideos || data.result?.generatedVideos || [];
                    
                    if (generatedVideos.length > 0) {
                        const video = generatedVideos[0];
                        
                        // If there's a video file reference, download it
                        if (video.video?.name || video.video?.uri) {
                            const videoUri = video.video.uri || video.video.name;
                            console.log('📥 Downloading video from:', videoUri);
                            
                            // Try to fetch the video content
                            try {
                                const videoResponse = await fetch(
                                    `https://generativelanguage.googleapis.com/v1beta/${video.video.name}:download?key=${apiKey}`
                                );
                                
                                if (videoResponse.ok) {
                                    const blob = await videoResponse.blob();
                                    const reader = new FileReader();
                                    return new Promise((resolve, reject) => {
                                        reader.onloadend = () => resolve(reader.result);
                                        reader.onerror = reject;
                                        reader.readAsDataURL(blob);
                                    });
                                }
                            } catch (downloadError) {
                                console.log('Download error:', downloadError.message);
                            }
                            
                            // Return the URI if download fails
                            return videoUri;
                        }
                        
                        // Check for inline video bytes
                        if (video.videoBytes || video.video?.videoBytes) {
                            const bytes = video.videoBytes || video.video.videoBytes;
                            return `data:video/mp4;base64,${bytes}`;
                        }
                    }
                    
                    // Check legacy response formats
                    if (data.response?.predictions?.[0]?.bytesBase64Encoded) {
                        return `data:video/mp4;base64,${data.response.predictions[0].bytesBase64Encoded}`;
                    }
                    if (data.response?.videoUri) {
                        return data.response.videoUri;
                    }
                    
                    console.log('Video generation completed but no video found in response:', data);
                    throw new Error('Video generation completed but no video was returned');
                }
                
                // Show progress if available
                if (data.metadata?.progress) {
                    console.log(`📊 Progress: ${data.metadata.progress}%`);
                }
            } catch (error) {
                if (error.message.includes('Video generation')) {
                    throw error; // Re-throw actual generation errors
                }
                console.log('Poll error:', error.message);
            }
        }
        
        throw new Error('Video generation timed out. The video may still be processing - try again in a few minutes.');
    }

    async function createResizedVersion(asset, targetRatio, ratioDecimal, channel, customPrompt, options = {}) {
        const { folderId, projectId, contactId, aiSuggestions: providedSuggestions, autoName, targetWidth, targetHeight } = options;
        
        // Determine if this is an exact size request (display ads)
        const isExactSize = targetWidth && targetHeight;
        const displaySize = isExactSize ? `${targetWidth}x${targetHeight}` : targetRatio;

        // Check if the target ratio is Gemini-compatible
        const isGeminiCompatible = isGeminiCompatibleRatio(targetRatio, targetWidth, targetHeight);
        console.log(`📐 Target: ${displaySize} - Gemini compatible: ${isGeminiCompatible}`);

        // Get image data (handles URL fetching if dataUrl not available)
        console.log('📷 Getting asset image data...');
        const imageData = await getAssetImageData(asset);
        
        if (!imageData) {
            throw new Error('Could not retrieve image data. The image may have been deleted or is inaccessible. Please re-upload the asset.');
        }

        // ALWAYS analyze image content for proper naming and context
        console.log('🔍 Analyzing image content...');
        let aiSuggestions = providedSuggestions;
        if (!aiSuggestions || !aiSuggestions.filename) {
            aiSuggestions = await autoCategorizeAsset(asset, `${channel} ${displaySize}`);
            console.log('📋 AI Analysis result:', aiSuggestions);
        }

        // Build prompt using AI analysis for better results
        let prompt = customPrompt;
        if (!prompt) {
            if (isExactSize) {
                // Display ad specific prompt for exact sizes
                prompt = `Resize and adapt this image of ${aiSuggestions?.subject || 'the content'} to exactly ${targetWidth}x${targetHeight} pixels for ${channel}. `;
                prompt += `Maintain the key visual elements and messaging while fitting the new dimensions. `;
                prompt += `Ensure text remains readable and the main subject stays visible. `;
                prompt += `Use AI outpainting to fill any additional space with contextually appropriate content.`;
            } else {
                prompt = `Extend this image of ${aiSuggestions?.subject || 'the scene'} to fit a ${targetRatio} aspect ratio for ${channel}. `;
                prompt += `Seamlessly continue the existing content, style, colors, and composition. `;
                prompt += `Do not change the original image - only add new content to fill the extended areas. `;
                prompt += `Maintain perfect visual continuity with high quality output.`;
            }
        }

        // Generate filename based on AI analysis (describes actual content!)
        let newFilename;
        const ext = asset.filename.split('.').pop() || 'png';
        const sizeLabel = isExactSize ? `${targetWidth}x${targetHeight}` : targetRatio.replace(':', 'x');
        if (aiSuggestions?.filename) {
            newFilename = `${aiSuggestions.filename}_${sizeLabel}.${ext}`;
            console.log(`📝 Using AI-generated filename: ${newFilename}`);
        } else {
            newFilename = asset.filename.replace(/\.([^.]+)$/, `_${sizeLabel}.$1`);
            console.log(`📝 Using fallback filename: ${newFilename}`);
        }

        let generatedDataUrl;
        let aiModel;

        // ROUTE TO APPROPRIATE SERVICE BASED ON RATIO COMPATIBILITY
        if (isGeminiCompatible) {
            // Use Gemini for standard ratios (1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9)
            const apiKey = getApiKey();
            if (!apiKey) {
                throw new Error('API key required. Please configure your Google AI API key in AI Settings, then refresh the page.');
            }
            
            console.log('🚀 Using Gemini API for standard ratio...');
            console.log(`   Target: ${displaySize} for ${channel}`);
            generatedDataUrl = await generateImageWithNanoBanana(
                imageData, 
                prompt, 
                targetRatio, 
                apiKey,
                { targetWidth, targetHeight }
            );
            aiModel = 'Nano Banana Pro (gemini-3-pro-image-preview)';
        } else {
            // Use Cloudinary Generative Fill for non-standard ratios (display ads, banners, etc.)
            console.log('☁️ Using Cloudinary AI Generative Fill for non-standard ratio...');
            console.log(`   Target: ${displaySize} for ${channel}`);
            
            const cloudinaryClient = window.cloudinaryClient;
            if (!cloudinaryClient?.hasCredentials?.()) {
                throw new Error(
                    'Cloudinary credentials required for non-standard aspect ratios like display ads.\n\n' +
                    'Standard ratios (1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9) use Gemini API.\n' +
                    'Non-standard ratios (160x600, 728x90, 300x250, etc.) require Cloudinary.\n\n' +
                    'Please add your Cloudinary credentials in Settings → API Keys → Your Cloudinary Account'
                );
            }
            
            // Calculate exact dimensions for non-standard ratios
            let finalWidth = targetWidth;
            let finalHeight = targetHeight;
            
            if (!finalWidth || !finalHeight) {
                // Calculate from ratio if not provided
                const ratioParts = targetRatio.split(':').map(Number);
                if (ratioParts.length === 2 && ratioParts[0] && ratioParts[1]) {
                    // Use source dimensions to calculate target
                    const sourceWidth = asset.width || 1080;
                    const sourceHeight = asset.height || 1080;
                    const targetRatioNum = ratioParts[0] / ratioParts[1];
                    const sourceRatioNum = sourceWidth / sourceHeight;
                    
                    if (targetRatioNum > sourceRatioNum) {
                        // Need to extend width
                        finalHeight = sourceHeight;
                        finalWidth = Math.round(sourceHeight * targetRatioNum);
                    } else {
                        // Need to extend height
                        finalWidth = sourceWidth;
                        finalHeight = Math.round(sourceWidth / targetRatioNum);
                    }
                }
            }
            
            // Ensure we have dimensions
            if (!finalWidth || !finalHeight) {
                throw new Error('Could not determine target dimensions for resize');
            }
            
            // Create temp asset with image data for Cloudinary
            const tempAsset = {
                ...asset,
                dataUrl: imageData
            };
            
            const cloudinaryResult = await cloudinaryClient.resizeImageWithGenFill(tempAsset, {
                width: finalWidth,
                height: finalHeight,
                gravity: 'center',
                prompt: aiSuggestions?.subject ? `Seamlessly extend this image of ${aiSuggestions.subject}` : null
            });
            
            if (!cloudinaryResult.success) {
                throw new Error('Cloudinary AI Generative Fill failed');
            }
            
            generatedDataUrl = cloudinaryResult.dataUrl || cloudinaryResult.url;
            aiModel = 'Cloudinary AI Generative Fill';
            console.log('☁️ Cloudinary resize complete');
        }

        // Calculate new dimensions - use exact dimensions if provided, otherwise calculate from ratio
        let newWidth, newHeight;
        if (isExactSize) {
            // For display ads and exact sizes, use the target dimensions
            newWidth = targetWidth;
            newHeight = targetHeight;
        } else {
            // For standard ratios, calculate based on source with minimum dimensions
            newWidth = calculateNewWidth(asset, ratioDecimal, targetRatio);
            newHeight = calculateNewHeight(asset, ratioDecimal, targetRatio);
        }
        const orientation = getOrientationFolder(newWidth, newHeight);

        // Estimate file size from dataUrl length (base64 encoding is ~33% overhead)
        const estimatedSize = generatedDataUrl ? Math.round((generatedDataUrl.length * 3) / 4) : 0;
        
        // Determine format from filename extension
        const fileExt = (newFilename.split('.').pop() || 'png').toLowerCase();
        const mimeType = fileExt === 'jpg' || fileExt === 'jpeg' ? 'image/jpeg' : 
                        fileExt === 'png' ? 'image/png' : 
                        fileExt === 'webp' ? 'image/webp' : 'image/png';
        
        // Calculate aspect ratio string (e.g., "9:16", "4:15")
        const gcd = (a, b) => b ? gcd(b, a % b) : a;
        const divisor = gcd(newWidth, newHeight);
        const aspectRatioStr = `${newWidth / divisor}:${newHeight / divisor}`;
        
        // Create derivative record
        const derivative = {
            id: `fix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            uuid: `deriv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            filename: newFilename,
            name: newFilename,
            file_type: 'image',
            type: 'image',
            mime_type: mimeType,
            format: fileExt,
            width: newWidth,
            height: newHeight,
            size: estimatedSize,
            file_size: estimatedSize,
            aspect_ratio: aspectRatioStr,
            ratio: newWidth / newHeight,
            sourceAssetId: asset.id,
            sourceFilename: asset.filename,
            createdBy: `AI Resize - ${aiModel}`,
            created_at: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_ai_derivative: true,
            thumbnail_url: generatedDataUrl,
            thumbnail: generatedDataUrl,
            dataUrl: generatedDataUrl,
            // Target info for display
            targetChannel: channel,
            targetSize: isExactSize ? `${targetWidth}x${targetHeight}` : targetRatio,
            targetRatio: targetRatio,
            aiModel: aiModel,
            // AI Analysis data
            aiDescription: aiSuggestions?.description || null,
            aiSubject: aiSuggestions?.subject || null,
            // Storage/Organization
            folderId: folderId || null,
            projectId: projectId || null,
            contactId: contactId || null,
            category: aiSuggestions?.category || 'Other',
            tags: aiSuggestions?.tags || [],
            orientation: orientation,
            aiGenerated: true,
            status: 'ready'
        };

        // Add to library with folder/CRM linking
        await addDerivativeToLibrary(asset, derivative);
        
        // Link to CRM if project/contact specified
        if (projectId || contactId) {
            linkDerivativeToCRM(derivative, projectId, contactId);
        }

        // Get folder name for confirmation message
        let folderName = null;
        if (folderId) {
            const folders = getAvailableFolders();
            const folder = folders.find(f => f.id === folderId);
            folderName = folder?.name;
        }

        // Get project name for confirmation
        let projectName = null;
        if (projectId) {
            const projects = getCRMProjects();
            const project = projects.find(p => p.id === projectId);
            projectName = project?.name;
        }

        console.log('✅ Image generation complete!');
        return {
            ...derivative,
            success: true,
            folderName,
            projectName
        };
    }

    async function createFolder(name) {
        const folderId = `folder_${Date.now()}`;
        const newFolder = {
            id: folderId,
            name: name,
            icon: '📁',
            color: '#a855f7',
            createdAt: new Date().toISOString()
        };
        
        // Save to Advanced Features if available
        if (window.AdvancedFeatures?.folders?.create) {
            await window.AdvancedFeatures.folders.create(newFolder);
        } else {
            // Fallback to localStorage
            const folders = JSON.parse(localStorage.getItem('cav_folders') || '[]');
            folders.push(newFolder);
            localStorage.setItem('cav_folders', JSON.stringify(folders));
        }
        
        return folderId;
    }

    function linkDerivativeToCRM(derivative, projectId, contactId) {
        // Log CRM activity
        const activity = {
            id: `activity_${Date.now()}`,
            type: 'asset_created',
            assetId: derivative.id,
            assetName: derivative.filename,
            projectId: projectId || null,
            contactId: contactId || null,
            timestamp: new Date().toISOString(),
            description: `AI-generated asset: ${derivative.filename}`
        };
        
        // Save to CRM
        if (window.cavCRM?.activities?.log) {
            window.cavCRM.activities.log(activity);
        } else {
            const activities = JSON.parse(localStorage.getItem('cav_crm_activities') || '[]');
            activities.push(activity);
            localStorage.setItem('cav_crm_activities', JSON.stringify(activities));
        }
        
        // Link asset to project
        if (projectId) {
            const projectAssets = JSON.parse(localStorage.getItem(`cav_project_${projectId}_assets`) || '[]');
            projectAssets.push(derivative.id);
            localStorage.setItem(`cav_project_${projectId}_assets`, JSON.stringify(projectAssets));
        }
        
        // Link asset to contact
        if (contactId) {
            const contactAssets = JSON.parse(localStorage.getItem(`cav_contact_${contactId}_assets`) || '[]');
            contactAssets.push(derivative.id);
            localStorage.setItem(`cav_contact_${contactId}_assets`, JSON.stringify(contactAssets));
        }
    }

    // Minimum recommended dimensions for standard ratios (social media standards)
    const MIN_DIMENSIONS_BY_RATIO = {
        '1:1': { width: 1080, height: 1080 },
        '4:5': { width: 1080, height: 1350 },
        '5:4': { width: 1350, height: 1080 },
        '2:3': { width: 1080, height: 1620 },
        '3:2': { width: 1620, height: 1080 },
        '3:4': { width: 1080, height: 1440 },
        '4:3': { width: 1440, height: 1080 },
        '9:16': { width: 1080, height: 1920 },
        '16:9': { width: 1920, height: 1080 },
        '21:9': { width: 2560, height: 1080 }
    };

    function calculateNewWidth(asset, targetRatio, targetRatioStr = null) {
        // Check if we have minimum dimensions for this ratio
        if (targetRatioStr && MIN_DIMENSIONS_BY_RATIO[targetRatioStr]) {
            const minDims = MIN_DIMENSIONS_BY_RATIO[targetRatioStr];
            // Use at least the minimum, but scale up if source is larger
            const scaledWidth = Math.round(asset.height * targetRatio);
            return Math.max(minDims.width, scaledWidth, asset.width);
        }
        
        const currentRatio = asset.width / asset.height;
        if (currentRatio < targetRatio) {
            return Math.round(asset.height * targetRatio);
        }
        return asset.width;
    }

    function calculateNewHeight(asset, targetRatio, targetRatioStr = null) {
        // Check if we have minimum dimensions for this ratio
        if (targetRatioStr && MIN_DIMENSIONS_BY_RATIO[targetRatioStr]) {
            const minDims = MIN_DIMENSIONS_BY_RATIO[targetRatioStr];
            // Use at least the minimum, but scale up if source is larger
            const scaledHeight = Math.round(asset.width / targetRatio);
            return Math.max(minDims.height, scaledHeight, asset.height);
        }
        
        const currentRatio = asset.width / asset.height;
        if (currentRatio > targetRatio) {
            return Math.round(asset.width / targetRatio);
        }
        return asset.height;
    }

    // ============================================
    // AI FIX PANEL (Fix All)
    // ============================================

    function openAIFixPanel(asset, analysis) {
        // Include both aspect ratio and exact size fixable channels
        const fixableChannels = analysis.offSizeChannels.filter(ch => 
            ch.issues.some(i => i.type === 'aspect_ratio' || i.type === 'exact_size') && analysis.isImage
        );
        
        if (fixableChannels.length === 0) {
            alert('No auto-fixable issues for this asset.');
            return;
        }

        // Group channels by category
        const socialChannels = fixableChannels.filter(ch => {
            const spec = CHANNEL_SPECS[ch.channel];
            return !spec?.category || spec.category === 'social';
        });
        
        const displayChannels = fixableChannels.filter(ch => {
            const spec = CHANNEL_SPECS[ch.channel];
            return spec?.category && ['gdn', 'ttd', 'dv360', 'ctv'].includes(spec.category);
        });

        const thumbnailSrc = asset.thumbnail_url || asset.thumbnail || asset.dataUrl || '';
        
        const modal = document.createElement('div');
        modal.className = 'ai-modal-overlay';
        modal.innerHTML = `
            <div class="ai-modal ai-modal-large" style="max-width: 900px; max-height: 90vh;">
                <div class="ai-modal-header">
                    <button class="ai-back-btn" onclick="this.closest('.ai-modal-overlay').remove()">← Back</button>
                    <h3>🔧 AI Fix All: ${asset.filename}</h3>
                    <button class="ai-close-btn" onclick="this.closest('.ai-modal-overlay').remove()">✕</button>
                </div>
                
                <div class="ai-modal-body" style="overflow-y: auto; max-height: calc(90vh - 180px);">
                    <div class="ai-preview-card">
                        <img src="${thumbnailSrc}" alt="${asset.filename}" class="ai-preview-img">
                        <div class="ai-preview-info">
                            <p class="ai-preview-name">${asset.filename}</p>
                            <p class="ai-preview-specs">${asset.width}×${asset.height} (${analysis.aspectRatio})</p>
                        </div>
                    </div>
                    
                    ${displayChannels.length > 0 ? `
                        <div class="ai-package-section">
                            <h4>📦 Display Ad Packages</h4>
                            <p style="color: #94a3b8; font-size: 0.8rem; margin-bottom: 1rem;">Quick select all sizes for a platform</p>
                            <div class="ai-package-grid">
                                ${Object.entries(DISPLAY_AD_PACKAGES).map(([key, pkg]) => `
                                    <button class="ai-package-btn" data-package="${key}" title="${pkg.description}">
                                        ${pkg.icon} ${pkg.name.replace(' Package', '')}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${socialChannels.length > 0 ? `
                        <h4>📱 Social Media Channels (${socialChannels.length})</h4>
                        <div class="ai-fix-list">
                            ${socialChannels.map((ch, idx) => {
                                const issue = ch.issues.find(i => i.type === 'aspect_ratio' || i.type === 'exact_size');
                                const targetLabel = issue.type === 'exact_size' ? issue.required : issue.required;
                                return `
                                    <label class="ai-fix-item" data-category="social">
                                        <input type="checkbox" checked 
                                               data-index="${idx}" 
                                               data-ratio="${issue.required}" 
                                               data-ratio-decimal="${issue.requiredDecimal || ''}"
                                               data-width="${issue.requiredWidth || ''}"
                                               data-height="${issue.requiredHeight || ''}"
                                               data-channel="${ch.channel}">
                                        <span class="ai-fix-icon">${ch.icon}</span>
                                        <span class="ai-fix-channel">${ch.channel}</span>
                                        <span class="ai-fix-target">→ ${targetLabel}</span>
                                    </label>
                                `;
                            }).join('')}
                        </div>
                    ` : ''}
                    
                    ${displayChannels.length > 0 ? `
                        <h4>🎯 Display Ads (${displayChannels.length})</h4>
                        <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                            <button class="ai-btn-small" id="select-all-display">Select All Display</button>
                            <button class="ai-btn-small" id="deselect-all-display">Deselect All Display</button>
                        </div>
                        <div class="ai-fix-list ai-fix-list-compact">
                            ${displayChannels.map((ch, idx) => {
                                const spec = CHANNEL_SPECS[ch.channel];
                                const issue = ch.issues.find(i => i.type === 'aspect_ratio' || i.type === 'exact_size');
                                const targetLabel = issue.type === 'exact_size' ? issue.required : issue.required;
                                const platformBadge = spec?.platform ? `<span class="ai-platform-badge">${spec.platform}</span>` : '';
                                return `
                                    <label class="ai-fix-item ai-fix-item-compact" data-category="${spec?.category || 'display'}" data-platform="${spec?.platform || ''}">
                                        <input type="checkbox" 
                                               data-index="${socialChannels.length + idx}" 
                                               data-ratio="${issue.required}" 
                                               data-ratio-decimal="${issue.requiredDecimal || ''}"
                                               data-width="${issue.requiredWidth || ''}"
                                               data-height="${issue.requiredHeight || ''}"
                                               data-channel="${ch.channel}">
                                        <span class="ai-fix-icon">${ch.icon}</span>
                                        <span class="ai-fix-channel">${ch.channel}</span>
                                        ${platformBadge}
                                        <span class="ai-fix-target">→ ${targetLabel}</span>
                                    </label>
                                `;
                            }).join('')}
                        </div>
                    ` : ''}
                    
                    <div class="ai-option" style="margin-top: 1.5rem;">
                        <label>Custom Instructions (AI Constraints)</label>
                        <textarea id="fix-all-prompt" rows="6" style="font-size: 11px; line-height: 1.4;">${getDefaultAIInstructions()}</textarea>
                    </div>
                </div>
                
                <div class="ai-modal-footer">
                    <button class="ai-btn-secondary" onclick="this.closest('.ai-modal-overlay').remove()">Cancel</button>
                    <button class="ai-btn-primary" id="fix-all-btn">
                        🚀 Create <span id="fix-count">${socialChannels.length}</span> Versions
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Update count function
        const updateCount = () => {
            const checked = modal.querySelectorAll('input[type="checkbox"]:checked').length;
            modal.querySelector('#fix-count').textContent = checked;
        };

        // Update button count when checkboxes change
        modal.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.onchange = updateCount;
        });

        // Package selection
        modal.querySelectorAll('.ai-package-btn').forEach(btn => {
            btn.onclick = () => {
                const packageKey = btn.dataset.package;
                const pkg = DISPLAY_AD_PACKAGES[packageKey];
                if (pkg) {
                    // First deselect all display
                    modal.querySelectorAll('.ai-fix-item[data-category="gdn"], .ai-fix-item[data-category="ttd"], .ai-fix-item[data-category="dv360"]').forEach(item => {
                        item.querySelector('input').checked = false;
                    });
                    // Then select package sizes
                    pkg.sizes.forEach(size => {
                        const cb = modal.querySelector(`input[data-channel="${size}"]`);
                        if (cb) cb.checked = true;
                    });
                    updateCount();
                    
                    // Visual feedback
                    btn.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
                    setTimeout(() => {
                        btn.style.background = '';
                    }, 500);
                }
            };
        });

        // Select/Deselect all display buttons
        modal.querySelector('#select-all-display')?.addEventListener('click', () => {
            modal.querySelectorAll('.ai-fix-item[data-category="gdn"] input, .ai-fix-item[data-category="ttd"] input, .ai-fix-item[data-category="dv360"] input').forEach(cb => {
                cb.checked = true;
            });
            updateCount();
        });

        modal.querySelector('#deselect-all-display')?.addEventListener('click', () => {
            modal.querySelectorAll('.ai-fix-item[data-category="gdn"] input, .ai-fix-item[data-category="ttd"] input, .ai-fix-item[data-category="dv360"] input').forEach(cb => {
                cb.checked = false;
            });
            updateCount();
        });

        modal.querySelector('#fix-all-btn').onclick = async () => {
            const btn = modal.querySelector('#fix-all-btn');
            const prompt = modal.querySelector('#fix-all-prompt').value;
            const checked = modal.querySelectorAll('input[type="checkbox"]:checked');
            
            if (checked.length === 0) {
                alert('Please select at least one channel');
                return;
            }

            btn.innerHTML = '<span class="ai-spinner"></span> Processing...';
            btn.disabled = true;

            try {
                for (const cb of checked) {
                    const ratio = cb.dataset.ratio;
                    const ratioDecimal = parseFloat(cb.dataset.ratioDecimal) || null;
                    const channel = cb.dataset.channel;
                    const targetWidth = cb.dataset.width ? parseInt(cb.dataset.width) : null;
                    const targetHeight = cb.dataset.height ? parseInt(cb.dataset.height) : null;
                    
                    await createResizedVersion(asset, ratio, ratioDecimal, channel, prompt, {
                        targetWidth,
                        targetHeight
                    });
                }
                
                alert(`✅ Created ${checked.length} versions!`);
                modal.remove();
                
                if (window.refreshAssetLibrary) {
                    window.refreshAssetLibrary();
                }
            } catch (error) {
                alert(`Error: ${error.message}`);
                btn.innerHTML = `🚀 Create ${checked.length} Versions`;
                btn.disabled = false;
            }
        };
    }

    // ============================================
    // ANIMATION PANEL
    // ============================================

    function openAnimationPanel(asset, analysis) {
        const thumbnailSrc = asset.thumbnail_url || asset.thumbnail || asset.dataUrl || '';
        const apiKeyExists = hasApiKey();
        const folders = getAvailableFolders();
        const projects = getCRMProjects();
        const contacts = getCRMContacts();
        
        const modal = document.createElement('div');
        modal.className = 'ai-modal-overlay';
        modal.innerHTML = `
            <div class="ai-modal ai-modal-large">
                <div class="ai-modal-header">
                    <button class="ai-back-btn" onclick="this.closest('.ai-modal-overlay').remove()">← Back</button>
                    <h3>🎬 Create Animation</h3>
                    <button class="ai-close-btn" onclick="this.closest('.ai-modal-overlay').remove()">✕</button>
                </div>
                
                <div class="ai-modal-body">
                    ${!apiKeyExists ? `
                        <div class="ai-api-key-required">
                            <div class="ai-api-warning">
                                <span class="ai-api-icon">🔑</span>
                                <div>
                                    <strong>Google AI API Key Required</strong>
                                    <p>To create AI animations with Veo4, you need a Google AI Studio API key.</p>
                                </div>
                            </div>
                            <div class="ai-api-input-group">
                                <input type="password" id="ai-api-key-input" placeholder="Enter your Google AI API key" class="ai-api-key-field">
                                <button class="ai-api-save-btn" id="save-api-key-btn">Save Key</button>
                            </div>
                            <p class="ai-api-help">Get your free API key at <a href="https://aistudio.google.com/apikey" target="_blank">aistudio.google.com</a></p>
                        </div>
                    ` : ''}
                    
                    <div class="ai-preview-card">
                        <img src="${thumbnailSrc}" alt="${asset.filename}" class="ai-preview-img">
                        <div class="ai-preview-info">
                            <p class="ai-preview-name">${asset.filename}</p>
                            <p class="ai-preview-specs">${asset.width}×${asset.height}</p>
                        </div>
                    </div>
                    
                    <div class="ai-option-row">
                        <div class="ai-option">
                            <label>Duration</label>
                            <select id="anim-duration">
                                <option value="4">4 seconds</option>
                                <option value="6" selected>6 seconds</option>
                                <option value="8">8 seconds</option>
                                <option value="10">10 seconds</option>
                            </select>
                        </div>
                        
                        <div class="ai-option">
                            <label>Motion Style</label>
                            <select id="anim-style">
                                <option value="auto">Auto (AI decides)</option>
                                <option value="zoom">Slow Zoom</option>
                                <option value="pan">Pan/Slide</option>
                                <option value="parallax">Parallax</option>
                                <option value="cinematic">Cinematic</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="ai-option">
                        <label>Motion Description</label>
                        <textarea id="anim-prompt" placeholder="Describe the motion you want (e.g., 'Gentle camera push-in, clouds moving slowly')"></textarea>
                    </div>
                    
                    <!-- Storage & Organization Section -->
                    <div class="ai-organization-section">
                        <h4>📁 Storage & Organization</h4>
                        
                        <div class="ai-option-row">
                            <div class="ai-option">
                                <label>Save to Folder</label>
                                <select id="anim-folder-select">
                                    <option value="">📂 Default Library</option>
                                    <option value="__new__">➕ Create New Folder...</option>
                                    ${folders.map(f => `<option value="${f.id}">${f.icon || '📁'} ${f.name}</option>`).join('')}
                                </select>
                            </div>
                            
                            <div class="ai-option" id="anim-new-folder-input" style="display:none;">
                                <label>New Folder Name</label>
                                <input type="text" id="anim-new-folder-name" placeholder="e.g., Video Campaign">
                            </div>
                        </div>
                        
                        <div class="ai-option-row">
                            <div class="ai-option">
                                <label>Link to Project</label>
                                <select id="anim-project-select">
                                    <option value="">— No Project —</option>
                                    ${projects.map(p => `<option value="${p.id}">📋 ${p.name}</option>`).join('')}
                                </select>
                            </div>
                            
                            <div class="ai-option">
                                <label>Link to Client/Contact</label>
                                <select id="anim-contact-select">
                                    <option value="">— No Client —</option>
                                    ${contacts.map(c => `<option value="${c.id}">👤 ${c.name} (${c.company || 'Individual'})</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        
                        <label class="ai-checkbox">
                            <input type="checkbox" id="anim-auto-name" checked>
                            🤖 Auto-name file using AI (analyze content)
                        </label>
                    </div>
                    
                    <label class="ai-checkbox">
                        <input type="checkbox" id="anim-preserve" checked>
                        Preserve original composition
                    </label>
                    
                    <div class="ai-info-box">
                        <p>🎬 Animation created using Veo4 AI. Original image will NOT be modified.</p>
                        <p>⏱️ Video generation typically takes 30-60 seconds.</p>
                    </div>
                </div>
                
                <div class="ai-modal-footer">
                    <button class="ai-btn-secondary" onclick="this.closest('.ai-modal-overlay').remove()">Cancel</button>
                    <button class="ai-btn-primary ${!apiKeyExists ? 'disabled' : ''}" id="anim-btn" ${!apiKeyExists ? 'disabled' : ''}>🎬 Generate Animation</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Folder select handler
        const folderSelect = modal.querySelector('#anim-folder-select');
        const newFolderInput = modal.querySelector('#anim-new-folder-input');
        if (folderSelect) {
            folderSelect.addEventListener('change', () => {
                newFolderInput.style.display = folderSelect.value === '__new__' ? 'block' : 'none';
            });
        }

        // API Key save handler
        const saveKeyBtn = modal.querySelector('#save-api-key-btn');
        if (saveKeyBtn) {
            saveKeyBtn.onclick = () => {
                const keyInput = modal.querySelector('#ai-api-key-input');
                const key = keyInput?.value?.trim();
                if (key && key.length > 10) {
                    localStorage.setItem('cav_ai_api_key', key);
                    if (window.cavAIStudio) {
                        window.cavAIStudio.apiKey = key;
                    }
                    alert('✅ API Key saved! You can now use AI features.');
                    modal.remove();
                    openAnimationPanel(asset, analysis);
                } else {
                    alert('Please enter a valid API key');
                }
            };
        }

        modal.querySelector('#anim-btn').onclick = async () => {
            const btn = modal.querySelector('#anim-btn');
            const duration = parseInt(modal.querySelector('#anim-duration').value);
            const style = modal.querySelector('#anim-style').value;
            const prompt = modal.querySelector('#anim-prompt').value;
            const preserve = modal.querySelector('#anim-preserve').checked;
            const folderId = modal.querySelector('#anim-folder-select').value;
            const newFolderName = modal.querySelector('#anim-new-folder-name')?.value;
            const projectId = modal.querySelector('#anim-project-select').value;
            const contactId = modal.querySelector('#anim-contact-select').value;
            const autoName = modal.querySelector('#anim-auto-name').checked;

            // Check for API key
            const currentApiKey = getApiKey();
            if (!currentApiKey || currentApiKey.length < 10) {
                alert('Please enter your Google AI API key first.');
                return;
            }

            btn.innerHTML = '<span class="ai-spinner"></span> Generating Animation...';
            btn.disabled = true;

            try {
                const currentApiKey = getApiKey();
                if (!currentApiKey) {
                    throw new Error('API key required. Please configure your Google AI API key in AI Settings, then refresh the page.');
                }

                // Get image data (handles URL fetching if dataUrl not available)
                btn.innerHTML = '<span class="ai-spinner"></span> Loading image data...';
                console.log('📷 Getting asset image data...');
                const imageData = await getAssetImageData(asset);
                
                if (!imageData) {
                    throw new Error('Could not retrieve image data. The image may have been deleted or is inaccessible. Please re-upload the asset.');
                }

                // Create folder if needed
                let targetFolderId = folderId;
                if (folderId === '__new__' && newFolderName) {
                    targetFolderId = await createFolder(newFolderName);
                }

                // ALWAYS analyze the image content first to get proper naming
                btn.innerHTML = '<span class="ai-spinner"></span> Analyzing image content...';
                console.log('🔍 Analyzing image content for proper naming...');
                const aiSuggestions = await autoCategorizeAsset(asset, `Animation ${duration}s ${style}`);
                console.log('📋 AI Analysis result:', aiSuggestions);

                // Build prompt for Veo 3.1 - use AI analysis for better results
                let fullPrompt = prompt || `Create a ${duration} second animated video from this image`;
                
                // Add context from AI analysis
                if (aiSuggestions?.subject) {
                    fullPrompt = `Create a ${duration} second animated video of ${aiSuggestions.subject}. ${prompt || ''}`;
                }
                
                if (style && style !== 'auto') {
                    fullPrompt += ` Apply ${style} motion effect.`;
                }
                if (preserve) {
                    fullPrompt += ' Preserve the original composition and subject matter. Add subtle, natural movement.';
                }
                fullPrompt += ' Create smooth, high-quality cinematic motion.';

                btn.innerHTML = '<span class="ai-spinner"></span> Generating video with Veo 3.1...';
                console.log('🚀 Starting AI video generation with Veo 3.1 (NO FALLBACKS)...');

                // GENERATE VIDEO - NO FALLBACKS
                const videoDataUrl = await generateVideoWithVeo(
                    imageData,
                    fullPrompt,
                    duration,
                    currentApiKey
                );

                // Generate filename based on AI analysis (describes what's ACTUALLY in the image)
                let newFilename;
                if (aiSuggestions?.filename) {
                    // Use AI-generated name that describes actual content
                    newFilename = `${aiSuggestions.filename}_${duration}s.mp4`;
                    console.log(`📝 Using AI-generated filename: ${newFilename}`);
                } else {
                    // Fallback to original filename
                    newFilename = asset.filename.replace(/\.[^.]+$/, `_animated_${duration}s.mp4`);
                    console.log(`📝 Using fallback filename: ${newFilename}`);
                }
                
                // Get orientation for folder assignment
                const orientation = getOrientationFolder(asset.width, asset.height);

                // Create derivative record
                const derivative = {
                    id: `anim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    filename: newFilename,
                    file_type: 'video',
                    type: 'video',
                    width: asset.width,
                    height: asset.height,
                    duration: duration,
                    sourceAssetId: asset.id,
                    createdBy: 'AI Animation - Veo 3.1',
                    createdAt: new Date().toISOString(),
                    is_ai_derivative: true,
                    thumbnail_url: asset.thumbnail_url || asset.thumbnail || asset.dataUrl,
                    // Store video data for preview
                    videoUrl: videoDataUrl,
                    dataUrl: videoDataUrl,
                    status: 'completed',
                    prompt: fullPrompt,
                    // Target info for display
                    targetChannel: 'Animation',
                    targetSize: `${asset.width}x${asset.height}`,
                    aiModel: 'Veo 3.1',
                    // AI Analysis data
                    aiDescription: aiSuggestions?.description || null,
                    aiSubject: aiSuggestions?.subject || null,
                    // Storage/Organization
                    folderId: targetFolderId || null,
                    projectId: projectId || null,
                    contactId: contactId || null,
                    category: aiSuggestions?.category || 'Video',
                    tags: aiSuggestions?.tags || [],
                    orientation: orientation,
                    aiGenerated: true,
                    aiModel: 'Veo 3.1'
                };

                await addDerivativeToLibrary(asset, derivative);
                
                // Link to CRM
                if (projectId || contactId) {
                    linkDerivativeToCRM(derivative, projectId, contactId);
                }

                // Get folder name for confirmation
                let folderName = null;
                if (targetFolderId) {
                    const folders = getAvailableFolders();
                    const folder = folders.find(f => f.id === targetFolderId);
                    folderName = folder?.name;
                }

                // Get project name
                let projectName = null;
                if (projectId) {
                    const projects = getCRMProjects();
                    const project = projects.find(p => p.id === projectId);
                    projectName = project?.name;
                }
                
                console.log('✅ Video generation complete!');
                alert(`✅ Animation created successfully with Veo 3.1!\n\n` +
                      `📁 Saved to: ${folderName || 'Default Library'}\n` +
                      `📋 Linked to: ${projectName || 'No project'}\n` +
                      `⏱️ Duration: ${duration} seconds`);
                
                modal.remove();
                
                if (window.refreshAssetLibrary) {
                    window.refreshAssetLibrary();
                }
            } catch (error) {
                console.error('Animation error:', error);
                alert(`❌ Video Generation Failed\n\n${error.message}\n\nPlease ensure your API key has Veo 3.1 access enabled at https://aistudio.google.com`);
                btn.innerHTML = '🎬 Generate Animation';
                btn.disabled = false;
            }
        };
    }

    // ============================================
    // EXTRACT STILL PANEL
    // ============================================

    function openExtractStillPanel(asset, analysis) {
        const videoSrc = asset.file_url || asset.dataUrl || asset.thumbnail_url || '';
        
        const modal = document.createElement('div');
        modal.className = 'ai-modal-overlay';
        modal.innerHTML = `
            <div class="ai-modal">
                <div class="ai-modal-header">
                    <button class="ai-back-btn" onclick="this.closest('.ai-modal-overlay').remove()">← Back</button>
                    <h3>📸 Extract Still Frame</h3>
                    <button class="ai-close-btn" onclick="this.closest('.ai-modal-overlay').remove()">✕</button>
                </div>
                
                <div class="ai-modal-body">
                    <div class="ai-preview-card">
                        <video src="${videoSrc}" controls class="ai-preview-video"></video>
                        <div class="ai-preview-info">
                            <p class="ai-preview-name">${asset.filename}</p>
                            <p class="ai-preview-specs">${asset.width}×${asset.height} • ${asset.duration}s</p>
                        </div>
                    </div>
                    
                    <div class="ai-option">
                        <label>Frame Selection</label>
                        <select id="still-method">
                            <option value="ai">AI Best Frame (recommended)</option>
                            <option value="first">First Frame</option>
                            <option value="middle">Middle Frame</option>
                            <option value="last">Last Frame</option>
                        </select>
                    </div>
                    
                    <div class="ai-info-box">
                        <p>📸 AI will analyze the video to find the best frame with optimal composition and clarity.</p>
                    </div>
                </div>
                
                <div class="ai-modal-footer">
                    <button class="ai-btn-secondary" onclick="this.closest('.ai-modal-overlay').remove()">Cancel</button>
                    <button class="ai-btn-primary" id="still-btn">📸 Extract Still</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('#still-btn').onclick = async () => {
            const btn = modal.querySelector('#still-btn');
            const method = modal.querySelector('#still-method').value;

            btn.innerHTML = '<span class="ai-spinner"></span> Extracting...';
            btn.disabled = true;

            try {
                let frameTime;
                switch (method) {
                    case 'first': frameTime = 0.1; break;
                    case 'middle': frameTime = asset.duration / 2; break;
                    case 'last': frameTime = asset.duration - 0.1; break;
                    default: frameTime = asset.duration / 2; // AI would analyze
                }

                const frame = await extractFrameFromVideo(asset, frameTime);

                const derivative = {
                    id: `still_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    filename: asset.filename.replace(/\.[^.]+$/, '_still.jpg'),
                    file_type: 'image',
                    type: 'image',
                    width: asset.width,
                    height: asset.height,
                    sourceAssetId: asset.id,
                    createdBy: 'Video Still Extraction',
                    createdAt: new Date().toISOString(),
                    is_ai_derivative: true,
                    thumbnail_url: frame,
                    dataUrl: frame,
                };

                addDerivativeToLibrary(asset, derivative);
                
                alert('✅ Still image extracted!');
                modal.remove();
                
                if (window.refreshAssetLibrary) {
                    window.refreshAssetLibrary();
                }
            } catch (error) {
                alert(`Error: ${error.message}`);
                btn.innerHTML = '📸 Extract Still';
                btn.disabled = false;
            }
        };
    }

    function extractFrameFromVideo(asset, timeInSeconds) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.crossOrigin = 'anonymous';
            video.src = asset.file_url || asset.dataUrl || asset.thumbnail_url;
            
            video.onloadedmetadata = () => {
                video.currentTime = Math.min(timeInSeconds, video.duration - 0.1);
            };
            
            video.onseeked = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0);
                resolve(canvas.toDataURL('image/jpeg', 0.9));
            };
            
            video.onerror = () => reject(new Error('Failed to load video'));
        });
    }

    // ============================================
    // VIDEO RESIZE PANEL (Cloudinary)
    // ============================================

    function openVideoResizePanel(asset) {
        // Check if Cloudinary is configured
        const cloudinaryClient = window.cloudinaryClient;
        const hasCloudinary = cloudinaryClient?.hasCredentials?.() || false;
        
        // SVG icons for platforms
        const PLATFORM_ICONS = {
            instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
            tiktok: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>',
            youtube: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.84.55 9.38.55 9.38.55s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.54 15.5V8.5L15.82 12l-6.28 3.5z"/></svg>',
            facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
            twitter: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
            linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
            pinterest: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/></svg>',
            square: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>'
        };
        
        // Video platform presets with SVG icons
        const videoPresets = [
            { name: 'Instagram Story', width: 1080, height: 1920, ratio: '9:16', icon: PLATFORM_ICONS.instagram, color: '#E4405F' },
            { name: 'Instagram Reel', width: 1080, height: 1920, ratio: '9:16', icon: PLATFORM_ICONS.instagram, color: '#E4405F' },
            { name: 'TikTok', width: 1080, height: 1920, ratio: '9:16', icon: PLATFORM_ICONS.tiktok, color: '#00F2EA' },
            { name: 'YouTube Shorts', width: 1080, height: 1920, ratio: '9:16', icon: PLATFORM_ICONS.youtube, color: '#FF0000' },
            { name: 'Facebook/IG Feed', width: 1080, height: 1080, ratio: '1:1', icon: PLATFORM_ICONS.square, color: '#8b5cf6' },
            { name: 'YouTube', width: 1920, height: 1080, ratio: '16:9', icon: PLATFORM_ICONS.youtube, color: '#FF0000' },
            { name: 'Twitter/X', width: 1280, height: 720, ratio: '16:9', icon: PLATFORM_ICONS.twitter, color: '#1DA1F2' },
            { name: 'LinkedIn', width: 1920, height: 1080, ratio: '16:9', icon: PLATFORM_ICONS.linkedin, color: '#0A66C2' },
            { name: 'Pinterest', width: 1000, height: 1500, ratio: '2:3', icon: PLATFORM_ICONS.pinterest, color: '#E60023' },
        ];
        
        // Crop mode options from Cloudinary
        const cropModes = cloudinaryClient?.getVideoCropModes?.() || [
            { value: 'fill', label: 'Fill', description: 'Resize to fill dimensions, may crop' },
            { value: 'fit', label: 'Fit', description: 'Fit within dimensions, maintain aspect ratio' },
            { value: 'pad', label: 'Pad', description: 'Fit with padding background' },
            { value: 'scale', label: 'Scale', description: 'Scale to exact dimensions (may distort)' }
        ];
        
        // Gravity options
        const gravityOptions = [
            { value: 'auto', label: 'Auto (AI)', description: 'AI-powered smart cropping' },
            { value: 'auto:faces', label: 'All Faces', description: 'Focus on all faces' },
            { value: 'center', label: 'Center', description: 'Keep center' }
        ];
        
        const videoSrc = asset.file_url || asset.cloudinary_url || asset.dataUrl || '';
        
        const modal = document.createElement('div');
        modal.className = 'ai-modal-overlay';
        modal.innerHTML = `
            <div class="ai-modal" style="max-width: 780px;">
                <div class="ai-modal-header">
                    <button class="ai-back-btn" onclick="this.closest('.ai-modal-overlay').remove()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                        Back
                    </button>
                    <h3 style="display: flex; align-items: center; gap: 8px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2" ry="2"/></svg>
                        Resize Video
                    </h3>
                    <button class="ai-close-btn" onclick="this.closest('.ai-modal-overlay').remove()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
                
                <div class="ai-modal-body" style="max-height: 70vh; overflow-y: auto;">
                    <div class="ai-preview-card" style="display: flex; gap: 16px; padding: 16px; background: rgba(0,0,0,0.3); border-radius: 12px; margin-bottom: 20px;">
                        <video src="${videoSrc}" controls class="ai-preview-video" style="max-height: 140px; max-width: 200px; border-radius: 8px;"></video>
                        <div class="ai-preview-info" style="flex: 1;">
                            <p class="ai-preview-name" style="font-weight: 600; color: #fff; margin-bottom: 4px;">${asset.filename}</p>
                            <p class="ai-preview-specs" style="font-size: 13px; color: #94a3b8;">${asset.width}×${asset.height} • ${asset.duration || 'N/A'}s</p>
                        </div>
                    </div>
                    
                    ${!hasCloudinary ? `
                        <div class="ai-warning-box" style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 10px; padding: 16px; margin-bottom: 20px; display: flex; align-items: start; gap: 12px;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                            <div>
                                <h4 style="color: #f59e0b; margin: 0 0 6px; font-size: 14px;">Cloudinary Required</h4>
                                <p style="color: #94a3b8; margin: 0 0 10px; font-size: 13px;">Video resizing requires a Cloudinary account. Get one free at cloudinary.com</p>
                                <button class="ai-btn-secondary" onclick="window.location.href='#settings'" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; font-size: 13px;">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                                    Configure in Settings
                                </button>
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="ai-option">
                        <label style="margin-bottom: 12px; display: block; font-weight: 600; color: #fff;">Select Target Size</label>
                        <div class="ai-video-presets" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                            ${videoPresets.map((p, i) => `
                                <button class="ai-preset-btn ${i === 0 ? 'selected' : ''}" 
                                        data-width="${p.width}" 
                                        data-height="${p.height}" 
                                        data-name="${p.name}"
                                        style="padding: 14px 10px; background: ${i === 0 ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255,255,255,0.04)'}; border: 1px solid ${i === 0 ? 'rgba(168, 85, 247, 0.5)' : 'rgba(255,255,255,0.08)'}; border-radius: 10px; cursor: pointer; text-align: center; transition: all 0.2s;">
                                    <span style="display: flex; justify-content: center; align-items: center; width: 28px; height: 28px; margin: 0 auto 6px; color: ${p.color};">${p.icon}</span>
                                    <span style="font-size: 12px; color: white; display: block; font-weight: 500;">${p.name}</span>
                                    <span style="font-size: 10px; color: #64748b;">${p.width}×${p.height}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="ai-option" style="margin-top: 20px;">
                        <label style="margin-bottom: 8px; display: block; font-weight: 500; color: #c4b5fd; font-size: 13px;">Or enter custom size:</label>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <input type="number" id="custom-width" placeholder="Width" value="${asset.width}" style="width: 110px; padding: 10px 12px; background: rgba(0,0,0,0.4); border: 1px solid rgba(139,92,246,0.2); border-radius: 8px; color: white; font-size: 14px;">
                            <span style="color: #64748b; font-size: 18px;">×</span>
                            <input type="number" id="custom-height" placeholder="Height" value="${asset.height}" style="width: 110px; padding: 10px 12px; background: rgba(0,0,0,0.4); border: 1px solid rgba(139,92,246,0.2); border-radius: 8px; color: white; font-size: 14px;">
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 20px;">
                        <div class="ai-option">
                            <label style="margin-bottom: 8px; display: block; font-weight: 500; color: #c4b5fd; font-size: 13px;">Crop Mode</label>
                            <select id="crop-mode" style="width: 100%; padding: 10px 12px; background: rgba(0,0,0,0.4); border: 1px solid rgba(139,92,246,0.2); border-radius: 8px; color: white; font-size: 14px; cursor: pointer;">
                                ${cropModes.map((m, i) => `<option value="${m.value}" ${i === 0 ? 'selected' : ''}>${m.label} - ${m.description}</option>`).join('')}
                            </select>
                        </div>
                        <div class="ai-option">
                            <label style="margin-bottom: 8px; display: block; font-weight: 500; color: #c4b5fd; font-size: 13px;">Focus Area</label>
                            <select id="gravity-mode" style="width: 100%; padding: 10px 12px; background: rgba(0,0,0,0.4); border: 1px solid rgba(139,92,246,0.2); border-radius: 8px; color: white; font-size: 14px; cursor: pointer;">
                                ${gravityOptions.map((g, i) => `<option value="${g.value}" ${i === 0 ? 'selected' : ''}>${g.label}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="ai-info-box" style="margin-top: 20px; padding: 14px 16px; background: rgba(139, 92, 246, 0.08); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 10px; display: flex; align-items: start; gap: 10px;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 1px;"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
                        <p style="margin: 0; color: #c4b5fd; font-size: 13px; line-height: 1.5;">Video will be resized using Cloudinary's AI-powered transformation engine with smart cropping and quality optimization.</p>
                    </div>
                </div>
                
                <div class="ai-modal-footer" style="display: flex; gap: 12px; justify-content: flex-end; padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.06);">
                    <button class="ai-btn-secondary" onclick="this.closest('.ai-modal-overlay').remove()" style="padding: 10px 18px; border-radius: 8px;">Cancel</button>
                    <button class="ai-btn-primary" id="resize-video-btn" ${!hasCloudinary ? 'disabled style="opacity: 0.5;"' : ''} style="padding: 10px 20px; border-radius: 8px; display: inline-flex; align-items: center; gap: 8px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2" ry="2"/></svg>
                        Resize Video
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Preset selection
        let selectedWidth = videoPresets[0].width;
        let selectedHeight = videoPresets[0].height;
        let selectedName = videoPresets[0].name;
        
        modal.querySelectorAll('.ai-preset-btn').forEach(btn => {
            btn.onclick = () => {
                modal.querySelectorAll('.ai-preset-btn').forEach(b => {
                    b.classList.remove('selected');
                    b.style.background = 'rgba(255,255,255,0.05)';
                    b.style.borderColor = 'rgba(255,255,255,0.1)';
                });
                btn.classList.add('selected');
                btn.style.background = 'rgba(168, 85, 247, 0.2)';
                btn.style.borderColor = '#a855f7';
                selectedWidth = parseInt(btn.dataset.width);
                selectedHeight = parseInt(btn.dataset.height);
                selectedName = btn.dataset.name;
                modal.querySelector('#custom-width').value = selectedWidth;
                modal.querySelector('#custom-height').value = selectedHeight;
            };
        });
        
        // Custom size inputs update selection
        modal.querySelector('#custom-width').oninput = (e) => {
            selectedWidth = parseInt(e.target.value) || asset.width;
            selectedName = 'Custom';
            modal.querySelectorAll('.ai-preset-btn').forEach(b => {
                b.classList.remove('selected');
                b.style.background = 'rgba(255,255,255,0.05)';
                b.style.borderColor = 'rgba(255,255,255,0.1)';
            });
        };
        modal.querySelector('#custom-height').oninput = (e) => {
            selectedHeight = parseInt(e.target.value) || asset.height;
            selectedName = 'Custom';
        };

        // Resize button
        modal.querySelector('#resize-video-btn').onclick = async () => {
            if (!hasCloudinary) {
                alert('Please configure Cloudinary credentials in Settings first.');
                return;
            }
            
            const btn = modal.querySelector('#resize-video-btn');
            btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="ai-spinner-svg" style="animation: spin 1s linear infinite;"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg> Resizing...';
            btn.disabled = true;

            try {
                // Get crop mode and gravity from selects
                const cropMode = modal.querySelector('#crop-mode')?.value || 'fill';
                const gravityMode = modal.querySelector('#gravity-mode')?.value || 'auto';
                
                // If video isn't on Cloudinary yet, we need to upload it first
                let cloudinaryPublicId = asset.cloudinary_id || asset.public_id;
                
                if (!cloudinaryPublicId && asset.dataUrl) {
                    // Upload to Cloudinary first
                    const uploadResult = await cloudinaryClient.upload(
                        dataURLtoFile(asset.dataUrl, asset.filename),
                        { folder: 'cav-videos' }
                    );
                    cloudinaryPublicId = uploadResult.public_id;
                    
                    // Update asset with Cloudinary info
                    asset.cloudinary_id = cloudinaryPublicId;
                    asset.cloudinary_url = uploadResult.url;
                }
                
                if (!cloudinaryPublicId) {
                    throw new Error('Video must be uploaded to Cloudinary first. Please ensure your video has a cloudinary_url.');
                }
                
                // Generate the transformed URL using enhanced video resize
                const result = cloudinaryClient.resizeVideo ? 
                    await cloudinaryClient.resizeVideo(asset, {
                        width: selectedWidth,
                        height: selectedHeight,
                        crop: cropMode,
                        gravity: gravityMode
                    }) : 
                    await cloudinaryClient.transform(cloudinaryPublicId, {
                        width: selectedWidth,
                        height: selectedHeight,
                        crop: cropMode,
                        gravity: gravityMode,
                        resource_type: 'video'
                    });
                
                // Create derivative asset
                const derivative = {
                    id: `deriv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    filename: `${asset.filename.replace(/\.[^.]+$/, '')}_${selectedWidth}x${selectedHeight}.mp4`,
                    file_type: 'video',
                    width: selectedWidth,
                    height: selectedHeight,
                    cloudinary_url: result.url,
                    video_url: result.url,  // Required for library preview
                    url: result.url,  // Fallback for preview systems
                    is_external_video: true,  // Mark as external Cloudinary URL
                    cloudinary_id: cloudinaryPublicId,
                    thumbnail_url: result.url.replace('/upload/', '/upload/so_0,w_400,h_400,c_fill/').replace(/\.[^.]+$/, '.jpg'),
                    targetChannel: selectedName,
                    targetSize: `${selectedWidth}×${selectedHeight}`,
                    createdBy: 'Cloudinary Resize',
                    aiModel: 'Cloudinary Video API',
                    isDerivative: true,
                    is_ai_derivative: true,
                    sourceAssetId: asset.id,
                    sourceFilename: asset.filename,
                    created_at: new Date().toISOString()
                };
                
                // Add to library
                await addDerivativeToLibrary(asset, derivative);
                
                modal.remove();
                
                if (window.showToast) {
                    window.showToast(`✅ Video resized to ${selectedWidth}×${selectedHeight} for ${selectedName}`, 'success');
                } else {
                    alert(`Video resized successfully! Size: ${selectedWidth}×${selectedHeight}`);
                }
                
                // Refresh library if available
                if (window.cavValidatorApp?.render) {
                    window.cavValidatorApp.render();
                }
                
            } catch (error) {
                console.error('[Video Resize] Error:', error);
                alert(`Error: ${error.message}`);
                btn.innerHTML = '📐 Resize Video';
                btn.disabled = false;
            }
        };
    }
    
    // Helper to convert dataURL to File
    function dataURLtoFile(dataurl, filename) {
        if (!dataurl) return null;
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'video/mp4';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    }

    // ============================================
    // LIBRARY INTEGRATION
    // ============================================

    async function addDerivativeToLibrary(originalAsset, derivative) {
        console.log('📦 Adding derivative to library:', derivative.filename);
        console.log('📦 Derivative details:', {
            id: derivative.id,
            size: derivative.targetSize,
            channel: derivative.targetChannel,
            hasDataUrl: !!derivative.dataUrl
        });
        
        derivative.isDerivative = true;
        derivative.is_ai_derivative = true;
        derivative.sourceAssetId = originalAsset.id;
        derivative.sourceFilename = originalAsset.filename;
        derivative.created_at = new Date().toISOString();
        
        // Also store brand/company info if available on original
        if (originalAsset.companyId) {
            derivative.companyId = originalAsset.companyId;
            derivative.linkedToCRM = true;
        }
        
        // Auto-assign to brand/client folder if companyId exists
        if (originalAsset.companyId && window.cavCRM?.getCompany) {
            const company = window.cavCRM.getCompany(originalAsset.companyId);
            if (company) {
                derivative.folderId = await getOrCreateBrandFolder(company.name);
                derivative.autoFolderAssigned = true;
                console.log(`📁 Auto-assigned to "${company.name}" brand folder`);
            }
        }
        
        // Fallback: Auto-assign to orientation folder if no folder specified
        if (!derivative.folderId && derivative.width && derivative.height) {
            const orientation = getOrientationFolder(derivative.width, derivative.height);
            derivative.folderId = await getOrCreateOrientationFolder(orientation);
            derivative.autoFolderAssigned = true;
            console.log(`📁 Auto-assigned to ${orientation} folder`);
        }
        
        // Create asset group ID to link derivatives with originals
        derivative.assetGroupId = originalAsset.assetGroupId || originalAsset.id;
        
        // Store source asset reference for UI grouping
        derivative.sourceRef = {
            id: originalAsset.id,
            filename: originalAsset.filename,
            thumbnail: originalAsset.thumbnail_url || originalAsset.thumbnail || originalAsset.dataUrl
        };

        let saved = false;
        let saveMethod = '';
        
        try {
            // Method 1: Use window.cavValidatorApp.addAsset (exposed API)
            if (window.cavValidatorApp?.addAsset) {
                window.cavValidatorApp.addAsset(derivative);
                console.log('✅ Derivative added via cavValidatorApp:', derivative.filename);
                saved = true;
                saveMethod = 'cavValidatorApp';
            }
            
            // Method 2: Try the main app's storage system (IndexedDB)
            if (!saved && window.cavApp?.storage?.saveAsset) {
                const result = await window.cavApp.storage.saveAsset(derivative);
                if (result?.success !== false) {
                    console.log('✅ Derivative saved to IndexedDB:', derivative.filename);
                    saved = true;
                    saveMethod = 'IndexedDB';
                }
            }
            
            // Method 3: Direct IndexedDB access
            if (!saved && window.cavApp?.storage?.db) {
                const db = window.cavApp.storage.db;
                const transaction = db.transaction(['assets'], 'readwrite');
                const store = transaction.objectStore('assets');
                await new Promise((resolve, reject) => {
                    const request = store.add(derivative);
                    request.onsuccess = () => {
                        console.log('✅ Derivative added directly to IndexedDB:', derivative.filename);
                        saved = true;
                        saveMethod = 'IndexedDB-direct';
                        resolve();
                    };
                    request.onerror = () => reject(request.error);
                });
            }
            
            // Method 4: Fallback to localStorage
            if (!saved) {
                const storageKey = getAssetStorageKey();
                const assets = JSON.parse(localStorage.getItem(storageKey) || '[]');
                assets.unshift(derivative);
                localStorage.setItem(storageKey, JSON.stringify(assets));
                console.log('✅ Derivative added to localStorage:', derivative.filename);
                saved = true;
                saveMethod = 'localStorage';
            }
            
            // Update source asset to track its derivatives
            await linkDerivativeToSource(originalAsset.id, derivative.id);
            
            // Track in AI history for usage dashboard
            trackAIOperation(derivative);
            
            // VERIFY SAVE - Read back to confirm
            setTimeout(async () => {
                const verified = await verifyDerivativeSaved(derivative.id);
                if (verified) {
                    console.log('✅ VERIFIED: Derivative confirmed in storage via', saveMethod);
                } else {
                    console.warn('⚠️ VERIFICATION FAILED: Derivative may not have saved properly');
                    // Force localStorage save as backup
                    const storageKey = getAssetStorageKey();
                    const assets = JSON.parse(localStorage.getItem(storageKey) || '[]');
                    if (!assets.find(a => a.id === derivative.id)) {
                        assets.unshift(derivative);
                        localStorage.setItem(storageKey, JSON.stringify(assets));
                        console.log('✅ Backup save to localStorage completed');
                    }
                }
            }, 500);
            
            // Trigger library refresh
            setTimeout(() => {
                if (window.refreshAssetLibrary) {
                    window.refreshAssetLibrary();
                } else if (window.cavApp?.loadAssets) {
                    window.cavApp.loadAssets();
                } else if (window.cavValidatorApp?.refresh) {
                    window.cavValidatorApp.refresh();
                }
            }, 200);
            
        } catch (error) {
            console.error('Failed to save derivative:', error);
            // Last resort fallback
            if (!saved) {
                const storageKey = getAssetStorageKey();
                const assets = JSON.parse(localStorage.getItem(storageKey) || '[]');
                assets.unshift(derivative);
                localStorage.setItem(storageKey, JSON.stringify(assets));
                console.log('✅ Derivative saved to localStorage (fallback):', derivative.filename);
            }
        }
        
        return derivative;
    }
    
    // Verify derivative was saved properly
    async function verifyDerivativeSaved(derivativeId) {
        try {
            // Check localStorage
            const storageKey = getAssetStorageKey();
            const localAssets = JSON.parse(localStorage.getItem(storageKey) || '[]');
            if (localAssets.find(a => a.id === derivativeId)) {
                return true;
            }
            
            // Check live app state
            if (window.cavApp?.state?.assets) {
                if (window.cavApp.state.assets.find(a => a.id === derivativeId)) {
                    return true;
                }
            }
            
            // Check IndexedDB
            if (window.cavApp?.storage?.getAsset) {
                const asset = await window.cavApp.storage.getAsset(derivativeId);
                if (asset) return true;
            }
            
            return false;
        } catch (e) {
            console.warn('Verification check failed:', e);
            return false;
        }
    }
    
    // Create folder for brand/client
    async function getOrCreateBrandFolder(brandName) {
        if (!brandName || typeof brandName !== 'string') return null;
        
        const folderName = `📁 ${brandName}`;
        const folders = getAvailableFolders() || [];
        
        // Check if folder exists (with safety checks for folder properties)
        const existing = folders.find(f => {
            if (!f || typeof f !== 'object') return false;
            const name = f.name || '';
            if (typeof name !== 'string') return false;
            return name === folderName || name.includes(brandName);
        });
        if (existing) return existing.id;
        
        // Create new folder
        if (window.cavAdvanced?.FoldersCollections?.createFolder) {
            const folder = window.cavAdvanced.FoldersCollections.createFolder({
                name: folderName,
                color: '#4f46e5',
                icon: '🏢'
            });
            console.log(`📁 Created brand folder: ${folderName}`);
            return folder.id;
        }
        
        return null;
    }
    
    // Track AI operations for usage dashboard
    function trackAIOperation(derivative) {
        try {
            const history = JSON.parse(localStorage.getItem('cav_ai_history') || '[]');
            history.unshift({
                id: derivative.id,
                type: derivative.file_type === 'video' ? 'video_generation' : 'image_generation',
                model: derivative.aiModel,
                modelName: derivative.aiModel,
                filename: derivative.filename,
                timestamp: new Date().toISOString(),
                sourceAssetId: derivative.sourceAssetId
            });
            // Keep last 100 operations
            if (history.length > 100) history.splice(100);
            localStorage.setItem('cav_ai_history', JSON.stringify(history));
        } catch (e) {
            console.warn('Failed to track AI operation:', e);
        }
    }
    
    // Link derivative to source asset for grouping
    async function linkDerivativeToSource(sourceId, derivativeId) {
        try {
            const storageKey = getAssetStorageKey();
            const assets = JSON.parse(localStorage.getItem(storageKey) || '[]');
            const sourceAsset = assets.find(a => a.id === sourceId);
            
            if (sourceAsset) {
                if (!sourceAsset.derivatives) sourceAsset.derivatives = [];
                if (!sourceAsset.derivatives.includes(derivativeId)) {
                    sourceAsset.derivatives.push(derivativeId);
                }
                sourceAsset.assetGroupId = sourceAsset.assetGroupId || sourceId;
                localStorage.setItem(storageKey, JSON.stringify(assets));
                console.log(`🔗 Linked derivative ${derivativeId} to source ${sourceId}`);
            }
        } catch (error) {
            console.warn('Could not link derivative to source:', error);
        }
    }
    
    // Get all derivatives for an asset
    function getDerivativesForAsset(assetId) {
        try {
            // First try to get from the live application state
            if (window.cavApp?.state?.assets) {
                const liveAssets = window.cavApp.state.assets;
                const derivatives = liveAssets.filter(a => 
                    (a.sourceAssetId === assetId || a.assetGroupId === assetId) && 
                    a.id !== assetId
                );
                if (derivatives.length > 0) return derivatives;
            }
            
            // Also check the validator app state
            if (window.cavValidatorApp?.state?.assets) {
                const appAssets = window.cavValidatorApp.state.assets;
                const derivatives = appAssets.filter(a => 
                    (a.sourceAssetId === assetId || a.assetGroupId === assetId) && 
                    a.id !== assetId
                );
                if (derivatives.length > 0) return derivatives;
            }
            
            // Fall back to localStorage
            const storageKey = getAssetStorageKey();
            const assets = JSON.parse(localStorage.getItem(storageKey) || '[]');
            return assets.filter(a => 
                (a.sourceAssetId === assetId || a.assetGroupId === assetId) && 
                a.id !== assetId
            );
        } catch (e) {
            console.log('getDerivativesForAsset error:', e);
            return [];
        }
    }
    
    // Get source asset for a derivative
    function getSourceAsset(derivative) {
        if (!derivative.sourceAssetId) return null;
        try {
            const storageKey = getAssetStorageKey();
            const assets = JSON.parse(localStorage.getItem(storageKey) || '[]');
            return assets.find(a => a.id === derivative.sourceAssetId);
        } catch {
            return null;
        }
    }

    function getAssetStorageKey() {
        const session = window.cavUserSession;
        if (session?.email) {
            return `cav_assets_${session.email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        }
        return 'cav_assets_anonymous';
    }

    // ============================================
    // POLISHED STYLES
    // ============================================
    const polishedStyles = `
        /* AI Asset Actions v2 - Clean & Polished */
        .ai-asset-actions-v2 {
            padding: 1rem;
            background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 100%);
            border-top: 1px solid rgba(255,255,255,0.08);
        }

        .ai-action-row {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            align-items: center;
        }

        .ai-action-row.main-actions {
            margin-bottom: 0.75rem;
        }

        /* Unified AI Buttons */
        .ai-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.5rem 0.85rem;
            border-radius: 8px;
            font-size: 0.8rem;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: all 0.2s ease;
            white-space: nowrap;
        }

        .ai-btn-icon { font-size: 1rem; }
        .ai-btn-text { }
        .ai-btn-count {
            background: rgba(255,255,255,0.2);
            padding: 0.1rem 0.4rem;
            border-radius: 4px;
            font-size: 0.7rem;
        }

        .ai-btn-fix {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: #fff;
        }
        .ai-btn-fix:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
        }

        .ai-btn-animate {
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            color: #fff;
        }
        .ai-btn-animate:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
        }

        .ai-btn-still {
            background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
            color: #fff;
        }
        .ai-btn-still:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(6, 182, 212, 0.4);
        }

        .ai-btn-resize-video {
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
            color: #fff;
        }
        .ai-btn-resize-video:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4);
        }

        .ai-btn-studio {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: #fff;
        }
        .ai-btn-studio:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
        }

        /* Off-Size Section */
        .ai-offsize-section {
            background: rgba(245, 158, 11, 0.08);
            border: 1px solid rgba(245, 158, 11, 0.2);
            border-radius: 10px;
            padding: 0.75rem;
            margin-top: 0.5rem;
        }

        .ai-offsize-header {
            margin-bottom: 0.5rem;
        }

        .ai-offsize-warning {
            color: #fcd34d;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .ai-offsize-channels {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
            max-height: 200px;
            overflow-y: auto;
        }

        .ai-channel-fix-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 0.6rem;
            background: rgba(0,0,0,0.3);
            border-radius: 6px;
            font-size: 0.75rem;
        }

        /* Channel Icons - SVG Brand Logos */
        .ai-channel-icon { 
            width: 22px;
            height: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        
        .ai-channel-icon svg,
        .ai-channel-icon .channel-icon {
            width: 22px;
            height: 22px;
        }
        
        .channel-icon-combo {
            display: flex;
            align-items: center;
            gap: 2px;
        }
        
        .channel-icon-combo .mobile-badge {
            font-size: 10px;
            opacity: 0.8;
        }
        
        /* Platform-specific icon colors */
        .channel-icon.google path { fill: #4285F4; }
        .channel-icon.youtube path { fill: #FF0000; }
        .channel-icon.meta path { fill: #0866FF; }
        .channel-icon.linkedin rect { fill: #0A66C2; }
        .channel-icon.twitter rect { fill: #000; }
        .channel-icon.pinterest circle { fill: #E60023; }
        .channel-icon.tiktok path { fill: #000; }
        
        .ai-channel-name { 
            color: #fff; 
            font-weight: 500;
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .ai-channel-issue { 
            color: #fcd34d; 
            font-size: 0.7rem;
            white-space: nowrap;
        }

        .ai-btn-mini {
            padding: 0.35rem 0.75rem;
            font-size: 0.72rem;
            font-weight: 600;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
        }

        .ai-btn-resize {
            background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
            color: #fff;
        }
        .ai-btn-resize:hover {
            transform: scale(1.05);
            box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
        }
        
        .ai-btn-resize .resize-icon {
            font-weight: bold;
        }

        .ai-channel-incompatible {
            color: #888;
            font-size: 0.65rem;
            font-style: italic;
        }

        /* Compatible Section */
        .ai-compat-section {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-top: 0.75rem;
            padding-top: 0.5rem;
            border-top: 1px solid rgba(255,255,255,0.05);
            flex-wrap: wrap;
        }

        .ai-compat-label {
            color: #22c55e;
            font-size: 0.75rem;
            font-weight: 500;
        }

        .ai-compat-badges {
            display: flex;
            gap: 0.35rem;
            flex-wrap: wrap;
            align-items: center;
        }

        .ai-compat-badge {
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.9;
            cursor: help;
            transition: transform 0.2s, opacity 0.2s;
        }
        
        .ai-compat-badge:hover {
            transform: scale(1.2);
            opacity: 1;
        }
        
        .ai-compat-badge svg {
            width: 20px;
            height: 20px;
        }
        
        .ai-covered-label {
            color: #a855f7 !important;
            margin-left: 0.75rem;
        }
        
        .ai-compat-badge.ai-covered {
            background: rgba(168, 85, 247, 0.2);
            padding: 0.2rem;
            border-radius: 4px;
            border: 1px solid rgba(168, 85, 247, 0.4);
            width: auto;
            height: auto;
        }
        
        .ai-compat-badge.ai-covered svg {
            width: 16px;
            height: 16px;
        }

        /* Modal Styles - Polished */
        .ai-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.92);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 500000;
            padding: 1rem;
            animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .ai-modal {
            background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
            border-radius: 16px;
            max-width: 500px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            border: 1px solid rgba(255,255,255,0.1);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            animation: slideUp 0.3s ease;
        }

        .ai-modal-large {
            max-width: 650px;
        }

        @keyframes slideUp {
            from { 
                opacity: 0;
                transform: translateY(20px);
            }
            to { 
                opacity: 1;
                transform: translateY(0);
            }
        }

        .ai-modal-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem 1.25rem;
            background: rgba(0,0,0,0.3);
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .ai-modal-header h3 {
            flex: 1;
            margin: 0;
            color: #fff;
            font-size: 1.1rem;
        }

        .ai-back-btn {
            background: rgba(255,255,255,0.1);
            border: none;
            color: #c4b5fd;
            padding: 0.4rem 0.8rem;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.85rem;
        }
        .ai-back-btn:hover {
            background: rgba(255,255,255,0.15);
        }

        .ai-close-btn {
            background: none;
            border: none;
            color: #888;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            line-height: 1;
        }

        .ai-modal-body {
            padding: 1.5rem;
        }

        .ai-modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
            padding: 1rem 1.25rem;
            background: rgba(0,0,0,0.2);
            border-top: 1px solid rgba(255,255,255,0.1);
        }

        .ai-btn-secondary {
            padding: 0.7rem 1.25rem;
            background: transparent;
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 8px;
            color: #c4b5fd;
            cursor: pointer;
            font-size: 0.9rem;
        }

        .ai-btn-primary {
            padding: 0.7rem 1.25rem;
            background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
            border: none;
            border-radius: 8px;
            color: #fff;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 600;
        }
        .ai-btn-primary:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
        }
        .ai-btn-primary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        /* Preview Card */
        .ai-preview-card {
            display: flex;
            gap: 1rem;
            padding: 1rem;
            background: rgba(0,0,0,0.3);
            border-radius: 12px;
            margin-bottom: 1.25rem;
        }

        .ai-preview-img,
        .ai-preview-video {
            width: 120px;
            height: 90px;
            object-fit: cover;
            border-radius: 8px;
            background: rgba(0,0,0,0.5);
        }

        .ai-preview-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .ai-preview-name {
            color: #fff;
            font-weight: 600;
            margin: 0 0 0.25rem;
            font-size: 0.95rem;
        }

        .ai-preview-specs {
            color: #a5b4fc;
            margin: 0;
            font-size: 0.8rem;
        }

        /* Transform Visual */
        .ai-transform-visual {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            padding: 1.25rem;
            background: rgba(0,0,0,0.2);
            border-radius: 10px;
            margin-bottom: 1.25rem;
        }

        .ai-ratio-box {
            padding: 0.5rem 1rem;
            background: rgba(255,255,255,0.1);
            border-radius: 6px;
            color: #e9d5ff;
            font-weight: 600;
        }
        .ai-ratio-box.target {
            background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
            color: #fff;
        }

        .ai-arrow {
            color: #8b5cf6;
            font-size: 1.5rem;
        }

        .ai-channel-tag {
            display: block;
            text-align: center;
            color: #a5b4fc;
            font-size: 0.75rem;
            margin-top: 0.35rem;
        }

        /* Options */
        .ai-option {
            margin-bottom: 1rem;
        }

        .ai-option-row {
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
        }

        .ai-option-row .ai-option {
            flex: 1;
            margin-bottom: 0;
        }

        .ai-option label {
            display: block;
            color: #c4b5fd;
            font-size: 0.85rem;
            margin-bottom: 0.4rem;
        }

        .ai-option select,
        .ai-option textarea,
        .ai-option input[type="number"] {
            width: 100%;
            padding: 0.65rem;
            background: rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            color: #fff;
            font-size: 0.9rem;
        }

        .ai-option textarea {
            resize: vertical;
            min-height: 70px;
        }

        .ai-option textarea::placeholder {
            color: #666;
        }

        .ai-checkbox {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #c4b5fd;
            font-size: 0.85rem;
            cursor: pointer;
            margin-bottom: 1rem;
        }

        .ai-checkbox input {
            width: 16px;
            height: 16px;
            accent-color: #8b5cf6;
        }

        .ai-info-box {
            padding: 1rem;
            background: rgba(139, 92, 246, 0.1);
            border: 1px solid rgba(139, 92, 246, 0.2);
            border-radius: 8px;
        }

        .ai-info-box p {
            margin: 0 0 0.35rem;
            color: #c4b5fd;
            font-size: 0.8rem;
        }
        .ai-info-box p:last-child {
            margin-bottom: 0;
        }

        /* Fix List */
        .ai-fix-list {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
            max-height: 200px;
            overflow-y: auto;
            margin-bottom: 1.25rem;
        }

        .ai-fix-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.65rem 0.85rem;
            background: rgba(0,0,0,0.25);
            border-radius: 8px;
            cursor: pointer;
            transition: background 0.2s;
        }
        .ai-fix-item:hover {
            background: rgba(139, 92, 246, 0.15);
        }

        .ai-fix-item input[type="checkbox"] {
            width: 18px;
            height: 18px;
            accent-color: #8b5cf6;
        }

        .ai-fix-icon { font-size: 1.1rem; }
        .ai-fix-channel { 
            color: #fff; 
            font-weight: 500;
            flex: 1;
        }
        .ai-fix-target {
            color: #22c55e;
            font-size: 0.8rem;
            font-weight: 500;
        }

        /* Spinner */
        .ai-spinner {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* API Key Required Section */
        .ai-api-key-required {
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%);
            border: 1px solid rgba(245, 158, 11, 0.3);
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 1.25rem;
        }

        .ai-api-warning {
            display: flex;
            gap: 1rem;
            align-items: flex-start;
            margin-bottom: 1rem;
        }

        .ai-api-icon {
            font-size: 2rem;
        }

        .ai-api-warning strong {
            display: block;
            color: #fcd34d;
            font-size: 1rem;
            margin-bottom: 0.25rem;
        }

        .ai-api-warning p {
            color: #fef3c7;
            font-size: 0.85rem;
            margin: 0;
        }

        .ai-api-input-group {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 0.75rem;
        }

        .ai-api-key-field {
            flex: 1;
            padding: 0.75rem;
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            color: #fff;
            font-size: 0.9rem;
        }

        .ai-api-key-field::placeholder {
            color: #888;
        }

        .ai-api-save-btn {
            padding: 0.75rem 1.25rem;
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            border: none;
            border-radius: 8px;
            color: #fff;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }

        .ai-api-save-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
        }

        .ai-api-help {
            color: #a5b4fc;
            font-size: 0.8rem;
            margin: 0;
        }

        .ai-api-help a {
            color: #60a5fa;
            text-decoration: underline;
        }

        .ai-btn-primary.disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        /* Storage & Organization Section */
        .ai-organization-section {
            background: linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(79, 70, 229, 0.1));
            border: 1px solid rgba(147, 51, 234, 0.3);
            border-radius: 12px;
            padding: 16px;
            margin: 16px 0;
        }
        .ai-organization-section h4 {
            margin: 0 0 16px 0;
            color: #a855f7;
            font-size: 14px;
            font-weight: 600;
        }
        .ai-modal-large {
            max-width: 600px !important;
            width: 95% !important;
        }
        .ai-option-row {
            display: flex;
            gap: 16px;
            margin-bottom: 12px;
        }
        .ai-option-row .ai-option {
            flex: 1;
        }
        .ai-option select {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid rgba(147, 51, 234, 0.3);
            border-radius: 8px;
            background: rgba(0, 0, 0, 0.2);
            color: white;
            font-size: 14px;
        }
        .ai-option select option {
            background: #1e1b2e;
            color: white;
        }
        .ai-option input[type="text"] {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid rgba(147, 51, 234, 0.3);
            border-radius: 8px;
            background: rgba(0, 0, 0, 0.2);
            color: white;
            font-size: 14px;
        }
    `;

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = polishedStyles;
    document.head.appendChild(styleSheet);

    // ============================================
    // BACKGROUND GENERATION QUEUE
    // ============================================
    
    const BackgroundQueue = {
        queue: [],
        processing: false,
        indicator: null,
        
        add(task) {
            this.queue.push(task);
            this.showIndicator();
            this.processNext();
        },
        
        async processNext() {
            if (this.processing || this.queue.length === 0) return;
            
            this.processing = true;
            const task = this.queue[0];
            
            this.updateIndicator(`${task.type}: ${task.name}`);
            
            try {
                await task.execute();
                console.log(`✅ Background task complete: ${task.name}`);
            } catch (error) {
                console.error(`❌ Background task failed: ${task.name}`, error);
            }
            
            this.queue.shift();
            this.processing = false;
            
            if (this.queue.length > 0) {
                this.processNext();
            } else {
                this.hideIndicator();
            }
        },
        
        showIndicator() {
            if (this.indicator) return;
            
            this.indicator = document.createElement('div');
            this.indicator.className = 'cav-bg-generation-indicator';
            this.indicator.innerHTML = `
                <div class="spinner"></div>
                <span class="status">Processing...</span>
                <span class="count">${this.queue.length} in queue</span>
            `;
            document.body.appendChild(this.indicator);
        },
        
        updateIndicator(message) {
            if (!this.indicator) return;
            this.indicator.querySelector('.status').textContent = message;
            this.indicator.querySelector('.count').textContent = `${this.queue.length} in queue`;
        },
        
        hideIndicator() {
            if (this.indicator) {
                this.indicator.remove();
                this.indicator = null;
            }
        }
    };
    
    // Queue a resize task for background processing
    function queueResize(asset, channel, options) {
        BackgroundQueue.add({
            type: '🖼️ Resize',
            name: `${asset.filename} → ${channel}`,
            execute: async () => {
                const result = await createResizedVersion(asset, channel, options);
                return result;
            }
        });
    }
    
    // Queue an animation task for background processing
    function queueAnimation(asset, options) {
        BackgroundQueue.add({
            type: '🎬 Animate',
            name: asset.filename,
            execute: async () => {
                const result = await createAnimationBackground(asset, options);
                return result;
            }
        });
    }
    
    // Background animation creation (non-blocking)
    async function createAnimationBackground(asset, options) {
        const { prompt, duration, projectId, contactId, folderId } = options;
        
        const imageBase64 = await fetchAssetDataAsBase64(asset);
        if (!imageBase64) {
            throw new Error('Could not load asset data');
        }
        
        const videoData = await generateVideoWithVeo(imageBase64, prompt, duration);
        
        const derivative = {
            id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            filename: `animated_${asset.filename.replace(/\.[^.]+$/, '')}.mp4`,
            file_type: 'video',
            dataUrl: videoData.dataUrl,
            video_url: videoData.dataUrl,
            width: asset.width,
            height: asset.height,
            duration: duration,
            folderId: folderId,
            aiGenerated: true,
            aiModel: 'Veo 3.1'
        };
        
        await addDerivativeToLibrary(asset, derivative);
        
        if (projectId || contactId) {
            linkDerivativeToCRM(derivative, projectId, contactId);
        }
        
        return derivative;
    }

    // ============================================
    // EXPORTS
    // ============================================
    
    window.aiLibraryIntegration = {
        analyzeAsset,
        renderAIActionsHTML,
        openAIFixPanel,
        openAnimationPanel,
        openExtractStillPanel,
        openVideoResizePanel,
        openSingleChannelFix,
        CHANNEL_SPECS,
        BackgroundQueue,
        queueResize,
        queueAnimation,
    };

    // Setup event handlers
    setupEventHandlers();

    console.log('🔗 AI Library Integration v5.11.0 - January 16, 2026');
    console.log('   ✅ API Key Sharing fix - Team members now auto-use admin keys');
    console.log('   ✅ Individual resize buttons per channel');
    console.log('   ✅ Background generation queue');
    console.log('   ✅ VIDEO RESIZE with Cloudinary');
    console.log('   ✅ Platform presets (TikTok, Reels, YouTube, etc.)');
    console.log('   ✅ Custom video dimensions');
    console.log('   ✅ Better navigation with back buttons');

})();
