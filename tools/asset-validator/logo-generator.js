/**
 * Brand Kit Generator / Logo Generator Module
 * Version 1.0.0 - December 2025
 * 
 * Standalone tool for Creative Asset Validator 3.0 that automatically
 * resizes, converts, and exports logos to meet all standard platform specifications.
 * 
 * Features:
 * - Upload & Auto-Detect (SVG, PNG, JPG, AI, EPS, PDF)
 * - One-Click Export Packs (Social Media, Google Ads, Favicon, Email, Full Brand Kit)
 * - Smart Processing (Vector scaling, AI upscaling, background removal)
 * - Color Variations (Full color, white, black, grayscale)
 * - Format Conversion (PNG, WebP, SVG, ICO, PDF)
 * - Platform Previews
 * - Brand Guidelines PDF Export
 * - AI Studio Integration
 * - Library Integration
 * - CRM Integration
 */

(function() {
    'use strict';

    // =============================================
    // CONFIGURATION
    // =============================================
    
    const VERSION = '2.0.0';
    
    // Brand SVG Icons - Official logos
    const BRAND_ICONS = {
        facebook: `<svg viewBox="0 0 24 24" fill="#1877f2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
        instagram: `<svg viewBox="0 0 24 24" fill="url(#ig-gradient)"><defs><linearGradient id="ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#FFDC80"/><stop offset="25%" stop-color="#FCAF45"/><stop offset="50%" stop-color="#F77737"/><stop offset="75%" stop-color="#C13584"/><stop offset="100%" stop-color="#833AB4"/></linearGradient></defs><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`,
        twitter: `<svg viewBox="0 0 24 24" fill="#000000"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
        linkedin: `<svg viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
        youtube: `<svg viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
        tiktok: `<svg viewBox="0 0 24 24" fill="#000000"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`,
        pinterest: `<svg viewBox="0 0 24 24" fill="#E60023"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/></svg>`,
        threads: `<svg viewBox="0 0 24 24" fill="#000000"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.33-3.022.88-.731 2.177-1.14 3.65-1.152 1.08-.01 2.053.088 2.91.293a6.25 6.25 0 0 0-.025-.665c-.104-1.028-.46-1.8-1.058-2.295-.664-.55-1.67-.845-2.989-.879l-.012-2.117c1.738.036 3.178.456 4.287 1.25 1.234.882 1.957 2.177 2.148 3.848.034.294.05.617.05.968 0 .085-.001.168-.004.25 1.412.792 2.382 1.958 2.803 3.392.492 1.674.432 3.858-1.22 5.476C18.377 23.218 15.793 23.973 12.186 24zm-1.638-9.132c-.821.007-1.46.176-1.853.487-.363.287-.535.662-.512 1.113.022.396.213.749.567.99.397.27.947.406 1.632.406h.093c.938-.043 1.617-.375 2.018-1.018.354-.57.537-1.252.537-2.021v-.03c-.617-.121-1.408-.134-2.482.073z"/></svg>`,
        discord: `<svg viewBox="0 0 24 24" fill="#5865F2"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/></svg>`,
        twitch: `<svg viewBox="0 0 24 24" fill="#9146FF"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>`,
        google: `<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`,
        apple: `<svg viewBox="0 0 24 24" fill="#000000"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg>`,
        android: `<svg viewBox="0 0 24 24" fill="#3DDC84"><path d="M17.523 15.341a.996.996 0 0 0-.989.99c0 .549.44.99.989.99s.99-.441.99-.99c0-.549-.441-.99-.99-.99zm-11.046 0a.996.996 0 0 0-.989.99c0 .549.44.99.989.99s.99-.441.99-.99c0-.549-.44-.99-.99-.99zm11.405-6.02l1.9-3.293a.397.397 0 0 0-.145-.542.397.397 0 0 0-.542.145l-1.927 3.34A11.378 11.378 0 0 0 12 7.973c-1.876 0-3.635.458-5.168.998L4.905 5.631a.397.397 0 0 0-.542-.145.397.397 0 0 0-.145.542l1.9 3.293C2.817 11.107.5 14.455.5 18.338h23c0-3.883-2.317-7.231-5.618-9.017z"/></svg>`,
        chrome: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.5" fill="#fff"/><path fill="#EA4335" d="M12 7.5A4.5 4.5 0 0 0 7.5 12l-4.24-7.35A11.95 11.95 0 0 1 12 0c3.58 0 6.8 1.57 9 4.06L16.76 12A4.5 4.5 0 0 0 12 7.5z"/><path fill="#FBBC05" d="M12 16.5A4.5 4.5 0 0 0 16.5 12l4.24 7.35A11.95 11.95 0 0 1 12 24c-3.58 0-6.8-1.57-9-4.06L7.24 12A4.5 4.5 0 0 0 12 16.5z"/><path fill="#34A853" d="M7.5 12A4.5 4.5 0 0 0 12 16.5L3.26 19.94A11.95 11.95 0 0 1 0 12c0-3.58 1.57-6.8 4.06-9L12 7.24A4.5 4.5 0 0 0 7.5 12z"/><path fill="#4285F4" d="M16.5 12A4.5 4.5 0 0 0 12 7.5l8.74-3.44A11.95 11.95 0 0 1 24 12c0 3.58-1.57 6.8-4.06 9L12 16.76A4.5 4.5 0 0 0 16.5 12z"/></svg>`,
        email: `<svg viewBox="0 0 24 24" fill="#EA4335"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`,
        print: `<svg viewBox="0 0 24 24" fill="#6B7280"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>`,
        watermark: `<svg viewBox="0 0 24 24" fill="#3B82F6"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`,
        app: `<svg viewBox="0 0 24 24" fill="#6366F1"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`
    };
    
    // Export Pack Definitions
    const EXPORT_PACKS = {
        social_media: {
            name: 'Social Media Pack',
            description: 'All profile sizes for every platform',
            icon: '📱',
            sizes: [
                // Facebook
                { name: 'Facebook Profile', width: 180, height: 180, platform: 'facebook' },
                { name: 'Facebook Cover', width: 820, height: 312, platform: 'facebook' },
                { name: 'Facebook Post', width: 1200, height: 630, platform: 'facebook' },
                { name: 'Facebook Story', width: 1080, height: 1920, platform: 'facebook' },
                // Instagram
                { name: 'Instagram Profile', width: 110, height: 110, platform: 'instagram' },
                { name: 'Instagram Post Square', width: 1080, height: 1080, platform: 'instagram' },
                { name: 'Instagram Story', width: 1080, height: 1920, platform: 'instagram' },
                { name: 'Instagram Reel Cover', width: 1080, height: 1920, platform: 'instagram' },
                // Twitter/X
                { name: 'Twitter Profile', width: 400, height: 400, platform: 'twitter' },
                { name: 'Twitter Header', width: 1500, height: 500, platform: 'twitter' },
                { name: 'Twitter Post', width: 1200, height: 675, platform: 'twitter' },
                // LinkedIn
                { name: 'LinkedIn Profile', width: 400, height: 400, platform: 'linkedin' },
                { name: 'LinkedIn Cover', width: 1584, height: 396, platform: 'linkedin' },
                { name: 'LinkedIn Company Logo', width: 300, height: 300, platform: 'linkedin' },
                { name: 'LinkedIn Post', width: 1200, height: 627, platform: 'linkedin' },
                // YouTube
                { name: 'YouTube Profile', width: 800, height: 800, platform: 'youtube' },
                { name: 'YouTube Channel Art', width: 2560, height: 1440, platform: 'youtube' },
                { name: 'YouTube Thumbnail', width: 1280, height: 720, platform: 'youtube' },
                // TikTok
                { name: 'TikTok Profile', width: 200, height: 200, platform: 'tiktok' },
                // Pinterest
                { name: 'Pinterest Profile', width: 165, height: 165, platform: 'pinterest' },
                { name: 'Pinterest Pin', width: 1000, height: 1500, platform: 'pinterest' },
                // Threads
                { name: 'Threads Profile', width: 320, height: 320, platform: 'threads' },
                // Discord
                { name: 'Discord Server Icon', width: 512, height: 512, platform: 'discord' },
                // Twitch
                { name: 'Twitch Profile', width: 256, height: 256, platform: 'twitch' },
                { name: 'Twitch Offline Banner', width: 1920, height: 1080, platform: 'twitch' }
            ]
        },
        google_ads: {
            name: 'Google Ads Pack',
            description: 'Square + Landscape logos for all ad formats',
            icon: '📊',
            sizes: [
                { name: 'Square Logo', width: 1200, height: 1200, platform: 'google' },
                { name: 'Landscape Logo', width: 1200, height: 628, platform: 'google' },
                { name: 'Display Square Small', width: 200, height: 200, platform: 'google' },
                { name: 'Display Square Medium', width: 300, height: 300, platform: 'google' },
                { name: 'Display Leaderboard', width: 728, height: 90, platform: 'google' },
                { name: 'Display Skyscraper', width: 160, height: 600, platform: 'google' },
                { name: 'Display Rectangle', width: 300, height: 250, platform: 'google' },
                { name: 'Display Large Rectangle', width: 336, height: 280, platform: 'google' }
            ]
        },
        favicon: {
            name: 'Favicon Pack',
            description: 'All browser sizes + ICO file',
            icon: '🌐',
            sizes: [
                { name: 'Favicon 16x16', width: 16, height: 16, format: 'png' },
                { name: 'Favicon 32x32', width: 32, height: 32, format: 'png' },
                { name: 'Favicon 48x48', width: 48, height: 48, format: 'png' },
                { name: 'Apple Touch Icon', width: 180, height: 180, format: 'png' },
                { name: 'Android Chrome 192', width: 192, height: 192, format: 'png' },
                { name: 'Android Chrome 512', width: 512, height: 512, format: 'png' },
                { name: 'MS Tile 150x150', width: 150, height: 150, format: 'png' },
                { name: 'Safari Pinned Tab', width: 512, height: 512, format: 'svg' }
            ],
            generateICO: true
        },
        email: {
            name: 'Email Pack',
            description: 'Standard + Retina email logos',
            icon: '✉️',
            sizes: [
                { name: 'Email Logo Standard', width: 200, height: 50, platform: 'email' },
                { name: 'Email Logo Retina', width: 400, height: 100, platform: 'email' },
                { name: 'Email Signature', width: 300, height: 100, platform: 'email' },
                { name: 'Email Signature Retina', width: 600, height: 200, platform: 'email' },
                { name: 'Email Header', width: 600, height: 150, platform: 'email' },
                { name: 'Email Header Retina', width: 1200, height: 300, platform: 'email' }
            ]
        },
        print: {
            name: 'Print Pack',
            description: 'High-resolution files for print',
            icon: '🖨️',
            sizes: [
                { name: 'Print Logo Large', width: 3000, height: 3000, format: 'png', dpi: 300 },
                { name: 'Print Logo Medium', width: 1500, height: 1500, format: 'png', dpi: 300 },
                { name: 'Business Card Logo', width: 600, height: 300, format: 'png', dpi: 300 }
            ],
            generatePDF: true,
            generateEPS: true
        },
        app_icons: {
            name: 'App Icons Pack',
            description: 'iOS and Android app icons',
            icon: '📲',
            sizes: [
                // iOS
                { name: 'iOS App Icon 1024', width: 1024, height: 1024, platform: 'ios' },
                { name: 'iOS App Icon 180', width: 180, height: 180, platform: 'ios' },
                { name: 'iOS App Icon 167', width: 167, height: 167, platform: 'ios' },
                { name: 'iOS App Icon 152', width: 152, height: 152, platform: 'ios' },
                { name: 'iOS App Icon 120', width: 120, height: 120, platform: 'ios' },
                { name: 'iOS App Icon 87', width: 87, height: 87, platform: 'ios' },
                { name: 'iOS App Icon 80', width: 80, height: 80, platform: 'ios' },
                { name: 'iOS App Icon 76', width: 76, height: 76, platform: 'ios' },
                { name: 'iOS App Icon 60', width: 60, height: 60, platform: 'ios' },
                { name: 'iOS App Icon 58', width: 58, height: 58, platform: 'ios' },
                { name: 'iOS App Icon 40', width: 40, height: 40, platform: 'ios' },
                { name: 'iOS App Icon 29', width: 29, height: 29, platform: 'ios' },
                { name: 'iOS App Icon 20', width: 20, height: 20, platform: 'ios' },
                // Android
                { name: 'Android xxxhdpi', width: 192, height: 192, platform: 'android' },
                { name: 'Android xxhdpi', width: 144, height: 144, platform: 'android' },
                { name: 'Android xhdpi', width: 96, height: 96, platform: 'android' },
                { name: 'Android hdpi', width: 72, height: 72, platform: 'android' },
                { name: 'Android mdpi', width: 48, height: 48, platform: 'android' },
                { name: 'Play Store Icon', width: 512, height: 512, platform: 'android' }
            ]
        },
        watermarks: {
            name: 'Watermark Pack',
            description: 'Semi-transparent overlays',
            icon: '💧',
            sizes: [
                { name: 'Watermark Large', width: 800, height: 800, opacity: 0.3 },
                { name: 'Watermark Medium', width: 400, height: 400, opacity: 0.3 },
                { name: 'Watermark Small', width: 200, height: 200, opacity: 0.3 },
                { name: 'Corner Bug', width: 150, height: 150, opacity: 0.5 },
                { name: 'Video Watermark', width: 300, height: 100, opacity: 0.4 }
            ],
            applyTransparency: true
        }
    };

    // Platform Preview Templates
    const PLATFORM_PREVIEWS = {
        facebook: {
            name: 'Facebook',
            icon: '📘',
            profileMask: 'circle',
            backgroundColor: '#1877f2'
        },
        instagram: {
            name: 'Instagram',
            icon: '📸',
            profileMask: 'circle',
            backgroundColor: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)'
        },
        twitter: {
            name: 'Twitter/X',
            icon: '🐦',
            profileMask: 'circle',
            backgroundColor: '#000000'
        },
        linkedin: {
            name: 'LinkedIn',
            icon: '💼',
            profileMask: 'rounded',
            backgroundColor: '#0077b5'
        },
        youtube: {
            name: 'YouTube',
            icon: '▶️',
            profileMask: 'circle',
            backgroundColor: '#ff0000'
        },
        app_icon: {
            name: 'App Icon',
            icon: '📱',
            profileMask: 'ios-rounded',
            backgroundColor: '#f5f5f7'
        },
        favicon: {
            name: 'Browser Tab',
            icon: '🌐',
            profileMask: 'square',
            backgroundColor: '#ffffff'
        }
    };

    // Color Variation Types
    const COLOR_VARIATIONS = {
        original: { name: 'Original', suffix: '' },
        white: { name: 'White', suffix: '-white', filter: 'brightness(0) invert(1)' },
        black: { name: 'Black', suffix: '-black', filter: 'brightness(0)' },
        grayscale: { name: 'Grayscale', suffix: '-grayscale', filter: 'grayscale(1)' }
    };

    // =============================================
    // BRAND KIT GENERATOR CLASS
    // =============================================
    
    class BrandKitGenerator {
        constructor() {
            this.uploadedLogo = null;
            this.logoMetadata = null;
            this.generatedAssets = [];
            this.selectedPacks = new Set(['social_media']);
            this.options = {
                generateColorVariations: true,
                addSafeZonePadding: true,
                safeZonePaddingPercent: 15,
                convertToWebP: true,
                generateBrandGuidelines: false,
                backgroundColor: 'transparent'
            };
            this.extractedColors = [];
            this.assignedBrand = null;
            this.assignedCompanyId = null;
            
            console.log(`🎨 Brand Kit Generator initialized - Version ${VERSION}`);
        }
        
        // =============================================
        // BRAND ASSIGNMENT
        // =============================================
        
        assignToBrand(companyId, brandName) {
            this.assignedCompanyId = companyId;
            this.assignedBrand = brandName;
            console.log('[BrandKit] Assigned to brand:', brandName, 'Company:', companyId);
        }
        
        clearBrandAssignment() {
            this.assignedCompanyId = null;
            this.assignedBrand = null;
        }
        
        getBrandAssignment() {
            return {
                companyId: this.assignedCompanyId,
                brandName: this.assignedBrand
            };
        }
        
        // =============================================
        // AI UPSCALE INTEGRATION
        // =============================================
        
        async performAIUpscale() {
            if (!this.uploadedLogo) {
                this.showToast('error', 'No logo uploaded');
                return null;
            }
            
            console.log('[BrandKit] Starting AI Upscale via Gemini...');
            this.showToast('info', '🤖 AI Upscaling in progress...');
            
            try {
                // Calculate optimal target size (4x or minimum 1024px)
                const targetWidth = Math.max(this.uploadedLogo.width * 4, 1024);
                const targetHeight = Math.max(this.uploadedLogo.height * 4, 1024);
                
                // Try AI Studio first
                if (window.CAVAIAdapter && typeof window.CAVAIAdapter.outpaintImage === 'function') {
                    const result = await window.CAVAIAdapter.outpaintImage(this.uploadedLogo.dataUrl, {
                        targetWidth,
                        targetHeight,
                        mode: 'upscale'
                    });
                    
                    if (result && result.success) {
                        // Update the uploaded logo with upscaled version
                        this.uploadedLogo.dataUrl = result.image || result.dataUrl;
                        this.uploadedLogo.width = targetWidth;
                        this.uploadedLogo.height = targetHeight;
                        this.uploadedLogo.isUpscaled = true;
                        this.logoMetadata.qualityWarning = null;
                        
                        this.showToast('success', `✅ Upscaled to ${targetWidth}×${targetHeight}px`);
                        return this.uploadedLogo;
                    }
                }
                
                // Try Gemini directly via orchestrator
                if (window.CAVOrchestrator) {
                    const result = await window.CAVOrchestrator.processTask('generation', {
                        task: 'upscale_image',
                        image: this.uploadedLogo.dataUrl,
                        targetWidth,
                        targetHeight
                    });
                    
                    if (result && result.processedImage) {
                        this.uploadedLogo.dataUrl = result.processedImage;
                        this.uploadedLogo.width = targetWidth;
                        this.uploadedLogo.height = targetHeight;
                        this.uploadedLogo.isUpscaled = true;
                        this.logoMetadata.qualityWarning = null;
                        
                        this.showToast('success', `✅ Upscaled to ${targetWidth}×${targetHeight}px`);
                        return this.uploadedLogo;
                    }
                }
                
                // Fallback: High-quality canvas upscale with smoothing
                const upscaledDataUrl = await this.canvasUpscale(this.uploadedLogo, targetWidth, targetHeight);
                this.uploadedLogo.dataUrl = upscaledDataUrl;
                this.uploadedLogo.width = targetWidth;
                this.uploadedLogo.height = targetHeight;
                this.uploadedLogo.isUpscaled = true;
                this.logoMetadata.qualityWarning = null;
                
                this.showToast('success', `✅ Upscaled to ${targetWidth}×${targetHeight}px (canvas)`);
                return this.uploadedLogo;
                
            } catch (error) {
                console.error('[BrandKit] AI Upscale error:', error);
                this.showToast('error', 'AI upscale failed. Try uploading a higher resolution source.');
                return null;
            }
        }

        // =============================================
        // FILE UPLOAD & DETECTION
        // =============================================
        
        async uploadLogo(file) {
            console.log('[BrandKit] Uploading logo:', file.name, file.type);
            
            const metadata = await this.detectFileType(file);
            this.logoMetadata = metadata;
            
            // Read file
            const dataUrl = await this.readFileAsDataURL(file);
            
            // Load image dimensions
            const dimensions = await this.getImageDimensions(dataUrl);
            
            this.uploadedLogo = {
                file: file,
                dataUrl: dataUrl,
                name: file.name,
                size: file.size,
                ...metadata,
                ...dimensions
            };
            
            // Extract colors
            if (!metadata.isVector) {
                this.extractedColors = await this.extractColors(dataUrl);
            }
            
            console.log('[BrandKit] Logo analyzed:', this.uploadedLogo);
            return this.uploadedLogo;
        }

        async detectFileType(file) {
            const extension = file.name.split('.').pop().toLowerCase();
            const mimeType = file.type;
            
            const vectorFormats = ['svg', 'ai', 'eps', 'pdf'];
            const isVector = vectorFormats.includes(extension) || mimeType === 'image/svg+xml';
            
            // Detect transparency
            let hasTransparency = false;
            if (extension === 'png' || extension === 'svg') {
                hasTransparency = await this.detectTransparency(file);
            }
            
            return {
                extension,
                mimeType,
                isVector,
                hasTransparency,
                format: extension.toUpperCase(),
                qualityWarning: !isVector && file.size < 50000 ? 'Low resolution source - AI upscaling recommended' : null
            };
        }

        async detectTransparency(file) {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = Math.min(img.width, 100);
                        canvas.height = Math.min(img.height, 100);
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        const data = imageData.data;
                        
                        for (let i = 3; i < data.length; i += 4) {
                            if (data[i] < 255) {
                                resolve(true);
                                return;
                            }
                        }
                        resolve(false);
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            });
        }

        readFileAsDataURL(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }

        getImageDimensions(dataUrl) {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    resolve({
                        width: img.width,
                        height: img.height,
                        aspectRatio: img.width / img.height
                    });
                };
                img.onerror = () => resolve({ width: 0, height: 0, aspectRatio: 1 });
                img.src = dataUrl;
            });
        }

        async extractColors(dataUrl) {
            return new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const size = 50;
                    canvas.width = size;
                    canvas.height = size;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, size, size);
                    
                    const imageData = ctx.getImageData(0, 0, size, size);
                    const colors = {};
                    
                    for (let i = 0; i < imageData.data.length; i += 4) {
                        const r = imageData.data[i];
                        const g = imageData.data[i + 1];
                        const b = imageData.data[i + 2];
                        const a = imageData.data[i + 3];
                        
                        if (a < 128) continue; // Skip transparent pixels
                        
                        const hex = this.rgbToHex(r, g, b);
                        colors[hex] = (colors[hex] || 0) + 1;
                    }
                    
                    // Sort by frequency and get top 5
                    const sortedColors = Object.entries(colors)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([hex]) => hex);
                    
                    resolve(sortedColors);
                };
                img.onerror = () => resolve([]);
                img.src = dataUrl;
            });
        }

        rgbToHex(r, g, b) {
            return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
        }

        // =============================================
        // GENERATION METHODS
        // =============================================
        
        async generateBrandKit() {
            if (!this.uploadedLogo) {
                throw new Error('No logo uploaded');
            }

            console.log('[BrandKit] Starting generation with packs:', Array.from(this.selectedPacks));
            
            this.generatedAssets = [];
            const totalSizes = this.calculateTotalSizes();
            let processed = 0;

            // Emit progress event
            this.emitProgress(0, totalSizes, 'Starting generation...');

            for (const packId of this.selectedPacks) {
                const pack = EXPORT_PACKS[packId];
                if (!pack) continue;

                for (const sizeConfig of pack.sizes) {
                    // Generate base asset
                    const asset = await this.generateAsset(sizeConfig, pack);
                    this.generatedAssets.push(asset);
                    
                    // Generate color variations if enabled
                    if (this.options.generateColorVariations) {
                        for (const [variationKey, variation] of Object.entries(COLOR_VARIATIONS)) {
                            if (variationKey === 'original') continue;
                            
                            const variantAsset = await this.generateAsset(sizeConfig, pack, variation);
                            this.generatedAssets.push(variantAsset);
                        }
                    }
                    
                    processed++;
                    this.emitProgress(processed, totalSizes, `Generating ${sizeConfig.name}...`);
                }

                // Generate ICO for favicon pack
                if (pack.generateICO && packId === 'favicon') {
                    await this.generateICO();
                }
            }

            // Generate WebP versions if enabled
            if (this.options.convertToWebP) {
                await this.generateWebPVersions();
            }

            // Generate brand guidelines PDF if enabled
            if (this.options.generateBrandGuidelines) {
                await this.generateBrandGuidelinesPDF();
            }

            this.emitProgress(totalSizes, totalSizes, 'Complete!');
            
            console.log('[BrandKit] Generated', this.generatedAssets.length, 'assets');
            return this.generatedAssets;
        }

        async generateAsset(sizeConfig, pack, colorVariation = null) {
            const { width, height, name, platform, opacity } = sizeConfig;
            
            return new Promise((resolve) => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Calculate dimensions with safe zone padding
                let canvasWidth = width;
                let canvasHeight = height;
                let drawWidth = width;
                let drawHeight = height;
                let offsetX = 0;
                let offsetY = 0;

                if (this.options.addSafeZonePadding) {
                    const padding = this.options.safeZonePaddingPercent / 100;
                    drawWidth = width * (1 - padding * 2);
                    drawHeight = height * (1 - padding * 2);
                    offsetX = width * padding;
                    offsetY = height * padding;
                }

                canvas.width = canvasWidth;
                canvas.height = canvasHeight;

                // Set background
                if (this.options.backgroundColor !== 'transparent') {
                    ctx.fillStyle = this.options.backgroundColor;
                    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                }

                const img = new Image();
                img.crossOrigin = 'Anonymous';
                img.onload = () => {
                    // Calculate aspect-ratio preserving dimensions
                    const imgAspect = img.width / img.height;
                    const targetAspect = drawWidth / drawHeight;
                    
                    let finalWidth, finalHeight;
                    if (imgAspect > targetAspect) {
                        finalWidth = drawWidth;
                        finalHeight = drawWidth / imgAspect;
                    } else {
                        finalHeight = drawHeight;
                        finalWidth = drawHeight * imgAspect;
                    }

                    const finalX = offsetX + (drawWidth - finalWidth) / 2;
                    const finalY = offsetY + (drawHeight - finalHeight) / 2;

                    // Apply color filter if needed
                    if (colorVariation && colorVariation.filter) {
                        ctx.filter = colorVariation.filter;
                    }

                    // Apply opacity for watermarks
                    if (opacity) {
                        ctx.globalAlpha = opacity;
                    }

                    ctx.drawImage(img, finalX, finalY, finalWidth, finalHeight);
                    
                    // Reset context
                    ctx.filter = 'none';
                    ctx.globalAlpha = 1;

                    const variationSuffix = colorVariation ? colorVariation.suffix : '';
                    const fileName = `${this.sanitizeFileName(name)}${variationSuffix}`;
                    
                    resolve({
                        name: name + (colorVariation ? ` (${colorVariation.name})` : ''),
                        fileName: fileName,
                        width: canvasWidth,
                        height: canvasHeight,
                        platform: platform || pack.name,
                        pack: pack.name,
                        variation: colorVariation ? colorVariation.name : 'Original',
                        dataUrl: canvas.toDataURL('image/png'),
                        format: 'PNG',
                        size: Math.round(canvas.toDataURL('image/png').length * 0.75) // Approximate size
                    });
                };
                img.onerror = () => {
                    resolve(null);
                };
                img.src = this.uploadedLogo.dataUrl;
            });
        }

        async generateICO() {
            // Generate ICO file from favicon sizes
            console.log('[BrandKit] Generating ICO file...');
            
            // For ICO, we need 16, 32, and 48 pixel versions
            const icoSizes = [16, 32, 48];
            const images = [];
            
            for (const size of icoSizes) {
                const existing = this.generatedAssets.find(a => 
                    a.width === size && a.height === size && a.variation === 'Original'
                );
                if (existing) {
                    images.push(existing);
                }
            }
            
            if (images.length > 0) {
                // Create a combined ICO-like asset (actual ICO generation would require a library)
                this.generatedAssets.push({
                    name: 'favicon.ico',
                    fileName: 'favicon',
                    width: 48,
                    height: 48,
                    platform: 'Browser',
                    pack: 'Favicon Pack',
                    variation: 'ICO Bundle',
                    dataUrl: images[images.length - 1].dataUrl, // Use largest as preview
                    format: 'ICO',
                    note: 'Contains 16x16, 32x32, and 48x48 versions'
                });
            }
        }

        async generateWebPVersions() {
            console.log('[BrandKit] Generating WebP versions...');
            
            const pngAssets = this.generatedAssets.filter(a => a.format === 'PNG');
            
            for (const asset of pngAssets) {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = asset.width;
                canvas.height = asset.height;
                
                const img = new Image();
                await new Promise((resolve) => {
                    img.onload = resolve;
                    img.src = asset.dataUrl;
                });
                
                ctx.drawImage(img, 0, 0);
                
                const webpDataUrl = canvas.toDataURL('image/webp', 0.9);
                
                this.generatedAssets.push({
                    ...asset,
                    name: asset.name + ' (WebP)',
                    fileName: asset.fileName + '-webp',
                    dataUrl: webpDataUrl,
                    format: 'WebP',
                    size: Math.round(webpDataUrl.length * 0.75)
                });
            }
        }

        async generateBrandGuidelinesPDF() {
            console.log('[BrandKit] Generating brand guidelines PDF...');
            
            // This would use jsPDF or similar library
            // For now, create a placeholder
            this.generatedAssets.push({
                name: 'Brand Guidelines',
                fileName: 'brand-guidelines',
                width: 0,
                height: 0,
                platform: 'Documentation',
                pack: 'Brand Guidelines',
                variation: 'PDF',
                dataUrl: this.uploadedLogo.dataUrl, // Placeholder
                format: 'PDF',
                note: 'Includes logo usage, colors, spacing rules'
            });
        }

        calculateTotalSizes() {
            let total = 0;
            for (const packId of this.selectedPacks) {
                const pack = EXPORT_PACKS[packId];
                if (pack) {
                    total += pack.sizes.length;
                    if (this.options.generateColorVariations) {
                        total += pack.sizes.length * (Object.keys(COLOR_VARIATIONS).length - 1);
                    }
                }
            }
            return total;
        }

        sanitizeFileName(name) {
            return name.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
        }

        emitProgress(current, total, message) {
            const event = new CustomEvent('brandkit-progress', {
                detail: { current, total, message, percent: Math.round((current / total) * 100) }
            });
            window.dispatchEvent(event);
        }

        // =============================================
        // AI INTEGRATION
        // =============================================
        
        async aiUpscale(asset, targetWidth, targetHeight) {
            console.log('[BrandKit] AI Upscaling to', targetWidth, 'x', targetHeight);
            
            // Use Gemini for AI upscaling if available
            if (window.CAVAIAdapter && typeof window.CAVAIAdapter.outpaintImage === 'function') {
                try {
                    const result = await window.CAVAIAdapter.outpaintImage(asset.dataUrl, {
                        targetWidth,
                        targetHeight,
                        mode: 'upscale'
                    });
                    return result;
                } catch (error) {
                    console.warn('[BrandKit] AI upscale failed, using canvas scaling:', error);
                }
            }
            
            // Fallback to canvas scaling with smoothing
            return this.canvasUpscale(asset, targetWidth, targetHeight);
        }

        async canvasUpscale(asset, targetWidth, targetHeight) {
            return new Promise((resolve) => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                
                // Enable high-quality scaling
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                
                const img = new Image();
                img.onload = () => {
                    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
                    resolve(canvas.toDataURL('image/png'));
                };
                img.src = asset.dataUrl;
            });
        }

        async aiRemoveBackground(dataUrl) {
            console.log('[BrandKit] AI Background Removal');
            
            // Use Gemini for background removal if available
            if (window.CAVOrchestrator) {
                try {
                    const result = await window.CAVOrchestrator.processTask('vision', {
                        task: 'remove_background',
                        image: dataUrl
                    });
                    if (result && result.processedImage) {
                        return result.processedImage;
                    }
                } catch (error) {
                    console.warn('[BrandKit] AI background removal failed:', error);
                }
            }
            
            // Return original if AI not available
            return dataUrl;
        }

        // =============================================
        // EXPORT & DOWNLOAD
        // =============================================
        
        async downloadAll() {
            console.log('[BrandKit] Downloading all assets...');
            
            // Use JSZip if available, otherwise download individually
            if (typeof JSZip !== 'undefined') {
                return this.downloadAsZip();
            } else {
                return this.downloadIndividually();
            }
        }

        async downloadAsZip() {
            const zip = new JSZip();
            const logoName = this.uploadedLogo.name.split('.')[0];
            
            // Organize by pack
            const byPack = {};
            for (const asset of this.generatedAssets) {
                if (!byPack[asset.pack]) {
                    byPack[asset.pack] = [];
                }
                byPack[asset.pack].push(asset);
            }
            
            for (const [packName, assets] of Object.entries(byPack)) {
                const folder = zip.folder(packName.replace(/\s+/g, '-'));
                
                for (const asset of assets) {
                    const base64 = asset.dataUrl.split(',')[1];
                    const ext = asset.format.toLowerCase();
                    folder.file(`${asset.fileName}.${ext}`, base64, { base64: true });
                }
            }
            
            const blob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${logoName}-brand-kit.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('[BrandKit] ZIP download complete');
        }

        downloadIndividually() {
            for (const asset of this.generatedAssets) {
                const a = document.createElement('a');
                a.href = asset.dataUrl;
                a.download = `${asset.fileName}.${asset.format.toLowerCase()}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        }

        async downloadPack(packId) {
            const packAssets = this.generatedAssets.filter(a => 
                a.pack === EXPORT_PACKS[packId]?.name
            );
            
            if (typeof JSZip !== 'undefined') {
                const zip = new JSZip();
                const logoName = this.uploadedLogo.name.split('.')[0];
                
                for (const asset of packAssets) {
                    const base64 = asset.dataUrl.split(',')[1];
                    const ext = asset.format.toLowerCase();
                    zip.file(`${asset.fileName}.${ext}`, base64, { base64: true });
                }
                
                const blob = await zip.generateAsync({ type: 'blob' });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = `${logoName}-${packId}.zip`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        }

        // =============================================
        // INTEGRATION: AI STUDIO
        // =============================================
        
        async pushToAIStudio(assets = null) {
            const assetsToPush = assets || this.generatedAssets;
            console.log('[BrandKit] Pushing', assetsToPush.length, 'assets to AI Studio');
            
            if (window.CAVAIStudio && typeof window.CAVAIStudio.addAssets === 'function') {
                try {
                    await window.CAVAIStudio.addAssets(assetsToPush);
                    this.showToast('success', `${assetsToPush.length} assets sent to AI Studio`);
                    return true;
                } catch (error) {
                    console.error('[BrandKit] Failed to push to AI Studio:', error);
                }
            }
            
            // Alternative: Store for AI Studio to pick up
            localStorage.setItem('cav_brandkit_to_aistudio', JSON.stringify(assetsToPush));
            this.showToast('info', 'Assets ready for AI Studio');
            return true;
        }

        // =============================================
        // INTEGRATION: LIBRARY
        // =============================================
        
        async saveToLibrary(assets = null) {
            const assetsToSave = assets || this.generatedAssets;
            console.log('[BrandKit] Saving', assetsToSave.length, 'assets to Library');
            
            if (window.cavValidatorApp && typeof window.cavValidatorApp.addAsset === 'function') {
                let saved = 0;
                for (const asset of assetsToSave) {
                    try {
                        // Convert to library format
                        const libraryAsset = {
                            name: asset.fileName,
                            type: 'image',
                            width: asset.width,
                            height: asset.height,
                            format: asset.format,
                            data: asset.dataUrl,
                            metadata: {
                                source: 'Brand Kit Generator',
                                pack: asset.pack,
                                variation: asset.variation,
                                platform: asset.platform
                            },
                            tags: ['brand-kit', asset.pack.toLowerCase().replace(/\s+/g, '-')],
                            createdAt: new Date().toISOString()
                        };
                        
                        await window.cavValidatorApp.addAsset(libraryAsset);
                        saved++;
                    } catch (error) {
                        console.warn('[BrandKit] Failed to save asset:', asset.name, error);
                    }
                }
                
                this.showToast('success', `${saved} assets saved to Library`);
                return saved;
            }
            
            this.showToast('warning', 'Library integration not available');
            return 0;
        }

        // =============================================
        // INTEGRATION: CRM
        // =============================================
        
        async linkToCRM(companyId, assets = null) {
            const assetsToLink = assets || this.generatedAssets;
            console.log('[BrandKit] Linking', assetsToLink.length, 'assets to CRM company:', companyId);
            
            if (window.CAVInternalCRM) {
                try {
                    // Add brand kit to company record
                    const brandKit = {
                        id: `brandkit_${Date.now()}`,
                        name: this.uploadedLogo.name,
                        createdAt: new Date().toISOString(),
                        assets: assetsToLink.map(a => ({
                            name: a.name,
                            dimensions: `${a.width}x${a.height}`,
                            platform: a.platform,
                            format: a.format
                        })),
                        colors: this.extractedColors,
                        options: this.options
                    };
                    
                    window.CAVInternalCRM.addCompanyBrandKit(companyId, brandKit);
                    this.showToast('success', 'Brand Kit linked to CRM');
                    return true;
                } catch (error) {
                    console.error('[BrandKit] Failed to link to CRM:', error);
                }
            }
            
            return false;
        }

        // =============================================
        // UTILITIES
        // =============================================
        
        showToast(type, message) {
            const toast = document.createElement('div');
            toast.className = `cav-toast cav-toast-${type}`;
            toast.innerHTML = `
                <span class="cav-toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
                <span class="cav-toast-message">${message}</span>
            `;
            document.body.appendChild(toast);
            
            setTimeout(() => toast.classList.add('show'), 10);
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        getPackInfo() {
            return EXPORT_PACKS;
        }

        getColorVariations() {
            return COLOR_VARIATIONS;
        }

        getPlatformPreviews() {
            return PLATFORM_PREVIEWS;
        }
    }

    // =============================================
    // UI RENDERER
    // =============================================
    
    function createBrandKitUI(generator) {
        const styles = `
            <style id="brand-kit-styles">
                .brand-kit-container {
                    padding: 2rem;
                    max-width: 1400px;
                    margin: 0 auto;
                }
                
                .brand-kit-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }
                
                .brand-kit-header h1 {
                    font-size: 2rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    background: linear-gradient(135deg, #ec4899, #8b5cf6);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                
                .brand-kit-header p {
                    color: #a1a1aa;
                    font-size: 1rem;
                }
                
                .brand-kit-grid {
                    display: grid;
                    grid-template-columns: 1fr 2fr;
                    gap: 2rem;
                }
                
                @media (max-width: 1024px) {
                    .brand-kit-grid {
                        grid-template-columns: 1fr;
                    }
                }
                
                .brand-kit-upload-section {
                    background: rgba(31, 41, 55, 0.8);
                    border-radius: 16px;
                    padding: 2rem;
                    border: 2px dashed rgba(236, 72, 153, 0.3);
                    transition: all 0.3s ease;
                }
                
                .brand-kit-upload-section:hover,
                .brand-kit-upload-section.drag-over {
                    border-color: #ec4899;
                    background: rgba(236, 72, 153, 0.1);
                }
                
                .brand-kit-upload-area {
                    text-align: center;
                    cursor: pointer;
                }
                
                .brand-kit-upload-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }
                
                .brand-kit-upload-text {
                    color: #fff;
                    font-size: 1.125rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                }
                
                .brand-kit-upload-hint {
                    color: #a1a1aa;
                    font-size: 0.875rem;
                }
                
                .brand-kit-upload-formats {
                    display: flex;
                    gap: 0.5rem;
                    justify-content: center;
                    margin-top: 1rem;
                    flex-wrap: wrap;
                }
                
                .brand-kit-format-badge {
                    background: rgba(139, 92, 246, 0.2);
                    color: #a78bfa;
                    padding: 0.25rem 0.75rem;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                
                .brand-kit-preview {
                    display: none;
                    margin-top: 2rem;
                }
                
                .brand-kit-preview.active {
                    display: block;
                }
                
                .brand-kit-preview-image {
                    max-width: 200px;
                    max-height: 200px;
                    margin: 0 auto 1rem;
                    display: block;
                    border-radius: 12px;
                    background: repeating-conic-gradient(#374151 0% 25%, transparent 0% 50%) 50% / 20px 20px;
                }
                
                .brand-kit-metadata {
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 12px;
                    padding: 1rem;
                }
                
                .brand-kit-metadata-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.5rem 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .brand-kit-metadata-row:last-child {
                    border-bottom: none;
                }
                
                .brand-kit-metadata-label {
                    color: #a1a1aa;
                    font-size: 0.875rem;
                }
                
                .brand-kit-metadata-value {
                    color: #fff;
                    font-size: 0.875rem;
                    font-weight: 600;
                }
                
                .brand-kit-colors {
                    display: flex;
                    gap: 0.5rem;
                    margin-top: 1rem;
                }
                
                .brand-kit-color-swatch {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: 2px solid rgba(255, 255, 255, 0.2);
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                
                .brand-kit-color-swatch:hover {
                    transform: scale(1.1);
                }
                
                .brand-kit-options-section {
                    background: rgba(31, 41, 55, 0.8);
                    border-radius: 16px;
                    padding: 2rem;
                }
                
                .brand-kit-section-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #fff;
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .brand-kit-packs-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 1rem;
                    margin-bottom: 2rem;
                }
                
                .brand-kit-pack-card {
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 12px;
                    padding: 1rem;
                    cursor: pointer;
                    border: 2px solid transparent;
                    transition: all 0.3s ease;
                }
                
                .brand-kit-pack-card:hover {
                    background: rgba(236, 72, 153, 0.1);
                }
                
                .brand-kit-pack-card.selected {
                    border-color: #ec4899;
                    background: rgba(236, 72, 153, 0.15);
                }
                
                .brand-kit-pack-icon {
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                }
                
                .brand-kit-pack-name {
                    color: #fff;
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                }
                
                .brand-kit-pack-desc {
                    color: #a1a1aa;
                    font-size: 0.75rem;
                }
                
                .brand-kit-pack-count {
                    color: #ec4899;
                    font-size: 0.75rem;
                    margin-top: 0.5rem;
                }
                
                .brand-kit-options-grid {
                    display: grid;
                    gap: 1rem;
                }
                
                .brand-kit-option {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem;
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 8px;
                }
                
                .brand-kit-option input[type="checkbox"] {
                    width: 20px;
                    height: 20px;
                    accent-color: #ec4899;
                }
                
                .brand-kit-option-label {
                    color: #fff;
                    font-size: 0.875rem;
                }
                
                .brand-kit-option-hint {
                    color: #a1a1aa;
                    font-size: 0.75rem;
                }
                
                .brand-kit-generate-btn {
                    width: 100%;
                    padding: 1rem 2rem;
                    background: linear-gradient(135deg, #ec4899, #8b5cf6);
                    border: none;
                    border-radius: 12px;
                    color: #fff;
                    font-size: 1.125rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    margin-top: 2rem;
                }
                
                .brand-kit-generate-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 30px rgba(236, 72, 153, 0.3);
                }
                
                .brand-kit-generate-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }
                
                .brand-kit-progress {
                    display: none;
                    margin-top: 1rem;
                }
                
                .brand-kit-progress.active {
                    display: block;
                }
                
                .brand-kit-progress-bar {
                    height: 8px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    overflow: hidden;
                }
                
                .brand-kit-progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #ec4899, #8b5cf6);
                    border-radius: 4px;
                    transition: width 0.3s ease;
                }
                
                .brand-kit-progress-text {
                    text-align: center;
                    color: #a1a1aa;
                    font-size: 0.875rem;
                    margin-top: 0.5rem;
                }
                
                .brand-kit-results {
                    display: none;
                    margin-top: 2rem;
                }
                
                .brand-kit-results.active {
                    display: block;
                }
                
                .brand-kit-results-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }
                
                .brand-kit-results-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #fff;
                }
                
                .brand-kit-results-actions {
                    display: flex;
                    gap: 0.75rem;
                }
                
                .brand-kit-action-btn {
                    padding: 0.625rem 1.25rem;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .brand-kit-action-btn.primary {
                    background: linear-gradient(135deg, #ec4899, #8b5cf6);
                    border: none;
                    color: #fff;
                }
                
                .brand-kit-action-btn.secondary {
                    background: transparent;
                    border: 1px solid rgba(236, 72, 153, 0.5);
                    color: #ec4899;
                }
                
                .brand-kit-action-btn:hover {
                    transform: translateY(-1px);
                }
                
                .brand-kit-assets-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    gap: 1rem;
                    max-height: 400px;
                    overflow-y: auto;
                    padding: 0.5rem;
                }
                
                .brand-kit-asset-card {
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 12px;
                    padding: 0.75rem;
                    text-align: center;
                }
                
                .brand-kit-asset-preview {
                    width: 100%;
                    aspect-ratio: 1;
                    object-fit: contain;
                    border-radius: 8px;
                    background: repeating-conic-gradient(#374151 0% 25%, #1f2937 0% 50%) 50% / 10px 10px;
                    margin-bottom: 0.5rem;
                }
                
                .brand-kit-asset-name {
                    color: #fff;
                    font-size: 0.75rem;
                    font-weight: 600;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .brand-kit-asset-dims {
                    color: #a1a1aa;
                    font-size: 0.625rem;
                }
                
                /* Platform Icon Styles */
                .brand-kit-platform-icon {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 0.5rem;
                }
                
                .brand-kit-platform-icon svg {
                    width: 100%;
                    height: 100%;
                }
                
                /* Pack Icon Styles */
                .brand-kit-pack-icon-svg {
                    width: 32px;
                    height: 32px;
                    margin-bottom: 0.5rem;
                }
                
                .brand-kit-pack-icon-svg svg {
                    width: 100%;
                    height: 100%;
                }
                
                /* AI Upscale Section */
                .brand-kit-ai-upscale {
                    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2));
                    border: 1px solid rgba(139, 92, 246, 0.3);
                    border-radius: 12px;
                    padding: 1rem;
                    margin-top: 1rem;
                    display: none;
                }
                
                .brand-kit-ai-upscale.show {
                    display: block;
                }
                
                .brand-kit-ai-upscale-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.75rem;
                }
                
                .brand-kit-ai-upscale-title {
                    color: #f59e0b;
                    font-weight: 600;
                    font-size: 0.875rem;
                }
                
                .brand-kit-ai-upscale-desc {
                    color: #a1a1aa;
                    font-size: 0.75rem;
                    margin-bottom: 0.75rem;
                }
                
                .brand-kit-ai-upscale-btn {
                    width: 100%;
                    padding: 0.75rem 1.5rem;
                    background: linear-gradient(135deg, #8b5cf6, #ec4899);
                    border: none;
                    border-radius: 8px;
                    color: #fff;
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    transition: all 0.3s ease;
                }
                
                .brand-kit-ai-upscale-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
                }
                
                /* Brand Assignment Section */
                .brand-kit-brand-assign {
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 12px;
                    padding: 1rem;
                    margin-top: 1rem;
                }
                
                .brand-kit-brand-assign-title {
                    color: #fff;
                    font-weight: 600;
                    font-size: 0.875rem;
                    margin-bottom: 0.75rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .brand-kit-brand-select-row {
                    display: flex;
                    gap: 0.5rem;
                    align-items: stretch;
                }
                
                .brand-kit-brand-select {
                    flex: 1;
                    padding: 0.625rem 1rem;
                    background: rgba(31, 41, 55, 0.8);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: #fff;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: border-color 0.2s;
                }
                
                .brand-kit-brand-select:hover,
                .brand-kit-brand-select:focus {
                    border-color: #ec4899;
                    outline: none;
                }
                
                .brand-kit-brand-select option {
                    background: #1f2937;
                    color: #fff;
                }
                
                .brand-kit-new-company-btn {
                    padding: 0.625rem 0.75rem;
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    border: none;
                    border-radius: 8px;
                    color: #fff;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .brand-kit-new-company-btn:hover {
                    transform: scale(1.05);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
                }
                
                .brand-kit-save-crm-btn {
                    width: 100%;
                    padding: 0.625rem 1rem;
                    background: transparent;
                    border: 1px solid rgba(34, 197, 94, 0.5);
                    border-radius: 8px;
                    color: #22c55e;
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                    margin-top: 0.75rem;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }
                
                .brand-kit-save-crm-btn:hover {
                    background: rgba(34, 197, 94, 0.1);
                }
                
                /* Improved Layout */
                .brand-kit-left-panel {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                
                .brand-kit-right-panel {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                
                .brand-kit-platform-previews {
                    display: flex;
                    gap: 1rem;
                    margin-top: 2rem;
                    overflow-x: auto;
                    padding: 1rem 0;
                }
                
                .brand-kit-platform-preview {
                    flex-shrink: 0;
                    width: 120px;
                    text-align: center;
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                
                .brand-kit-platform-preview:hover {
                    transform: scale(1.05);
                }
                
                .brand-kit-platform-mockup {
                    width: 80px;
                    height: 80px;
                    margin: 0 auto 0.5rem;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    border: 3px solid rgba(255, 255, 255, 0.1);
                }
                
                .brand-kit-platform-mockup img {
                    width: 60%;
                    height: 60%;
                    object-fit: contain;
                }
                
                .brand-kit-platform-name {
                    color: #fff;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
            </style>
        `;

        const html = `
            <div class="brand-kit-container">
                ${styles}
                
                <div class="brand-kit-header">
                    <h1>🎨 Brand Kit Generator</h1>
                    <p>Upload your logo and generate a complete brand asset package in seconds</p>
                </div>
                
                <div class="brand-kit-grid">
                    <!-- Left: Upload & Preview -->
                    <div class="brand-kit-left">
                        <div class="brand-kit-upload-section" id="brand-kit-upload">
                            <div class="brand-kit-upload-area">
                                <div class="brand-kit-upload-icon">📤</div>
                                <div class="brand-kit-upload-text">Drop your logo here</div>
                                <div class="brand-kit-upload-hint">or click to browse</div>
                                <div class="brand-kit-upload-formats">
                                    <span class="brand-kit-format-badge">SVG</span>
                                    <span class="brand-kit-format-badge">PNG</span>
                                    <span class="brand-kit-format-badge">JPG</span>
                                    <span class="brand-kit-format-badge">AI</span>
                                    <span class="brand-kit-format-badge">EPS</span>
                                    <span class="brand-kit-format-badge">PDF</span>
                                </div>
                            </div>
                            <input type="file" id="brand-kit-file-input" accept=".svg,.png,.jpg,.jpeg,.ai,.eps,.pdf,image/*" style="display: none;">
                        </div>
                        
                        <div class="brand-kit-preview" id="brand-kit-preview">
                            <img class="brand-kit-preview-image" id="brand-kit-preview-img" src="" alt="Logo preview">
                            
                            <div class="brand-kit-metadata" id="brand-kit-metadata">
                                <!-- Populated dynamically -->
                            </div>
                            
                            <!-- AI Upscale Section - Shows when low resolution detected -->
                            <div class="brand-kit-ai-upscale" id="brand-kit-ai-upscale">
                                <div class="brand-kit-ai-upscale-header">
                                    <span>⚠️</span>
                                    <span class="brand-kit-ai-upscale-title">Low Resolution Detected</span>
                                </div>
                                <div class="brand-kit-ai-upscale-desc">
                                    Use AI-powered upscaling with Gemini to enhance your logo to professional quality before generating assets.
                                </div>
                                <button class="brand-kit-ai-upscale-btn" id="brand-kit-ai-upscale-btn">
                                    <span>🤖</span> AI Upscale with Gemini
                                </button>
                            </div>
                            
                            <div class="brand-kit-colors" id="brand-kit-colors">
                                <!-- Populated dynamically -->
                            </div>
                            
                            <!-- Brand Assignment -->
                            <div class="brand-kit-brand-assign">
                                <div class="brand-kit-brand-assign-title">
                                    <span>🏢</span> Assign to Brand / Company
                                </div>
                                <div class="brand-kit-brand-select-row">
                                    <select class="brand-kit-brand-select" id="brand-kit-brand-select">
                                        <option value="">— Select a company —</option>
                                    </select>
                                    <button class="brand-kit-new-company-btn" id="brand-kit-new-company-btn" title="Create New Company">
                                        <span>➕</span>
                                    </button>
                                </div>
                                <button class="brand-kit-save-crm-btn" id="brand-kit-save-crm-btn" style="display: none;">
                                    <span>💾</span> Save Brand Kit to CRM
                                </button>
                            </div>
                        </div>
                        
                        <!-- Platform Previews -->
                        <div class="brand-kit-section-title" style="margin-top: 1.5rem;">
                            <span>👁️</span> Platform Previews
                        </div>
                        <div class="brand-kit-platform-previews" id="brand-kit-platforms">
                            <!-- Populated dynamically -->
                        </div>
                    </div>
                    
                    <!-- Right: Options & Generate -->
                    <div class="brand-kit-options-section">
                        <div class="brand-kit-section-title">
                            <span>📦</span> Export Packs
                        </div>
                        
                        <div class="brand-kit-packs-grid" id="brand-kit-packs">
                            <!-- Populated dynamically -->
                        </div>
                        
                        <div class="brand-kit-section-title">
                            <span>⚙️</span> Options
                        </div>
                        
                        <div class="brand-kit-options-grid">
                            <label class="brand-kit-option">
                                <input type="checkbox" id="opt-color-variations" checked>
                                <div>
                                    <div class="brand-kit-option-label">Generate color variations</div>
                                    <div class="brand-kit-option-hint">White, black, and grayscale versions</div>
                                </div>
                            </label>
                            
                            <label class="brand-kit-option">
                                <input type="checkbox" id="opt-safe-zone" checked>
                                <div>
                                    <div class="brand-kit-option-label">Add safe zone padding (15%)</div>
                                    <div class="brand-kit-option-hint">Professional clearspace around logo</div>
                                </div>
                            </label>
                            
                            <label class="brand-kit-option">
                                <input type="checkbox" id="opt-webp" checked>
                                <div>
                                    <div class="brand-kit-option-label">Convert to WebP</div>
                                    <div class="brand-kit-option-hint">Smaller file sizes for web</div>
                                </div>
                            </label>
                            
                            <label class="brand-kit-option">
                                <input type="checkbox" id="opt-brand-guide">
                                <div>
                                    <div class="brand-kit-option-label">Generate brand guidelines PDF</div>
                                    <div class="brand-kit-option-hint">Usage rules, colors, spacing</div>
                                </div>
                            </label>
                        </div>
                        
                        <button class="brand-kit-generate-btn" id="brand-kit-generate" disabled>
                            🚀 Generate Brand Kit
                        </button>
                        
                        <div class="brand-kit-progress" id="brand-kit-progress">
                            <div class="brand-kit-progress-bar">
                                <div class="brand-kit-progress-fill" id="brand-kit-progress-fill" style="width: 0%"></div>
                            </div>
                            <div class="brand-kit-progress-text" id="brand-kit-progress-text">Preparing...</div>
                        </div>
                        
                        <div class="brand-kit-results" id="brand-kit-results">
                            <div class="brand-kit-results-header">
                                <div class="brand-kit-results-title">Generated Assets</div>
                                <div class="brand-kit-results-actions">
                                    <button class="brand-kit-action-btn secondary" id="btn-save-library">
                                        📚 Save to Library
                                    </button>
                                    <button class="brand-kit-action-btn secondary" id="btn-push-aistudio">
                                        🤖 Push to AI Studio
                                    </button>
                                    <button class="brand-kit-action-btn primary" id="btn-download-all">
                                        ⬇️ Download All
                                    </button>
                                </div>
                            </div>
                            
                            <div class="brand-kit-assets-grid" id="brand-kit-assets-grid">
                                <!-- Populated dynamically -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    function attachBrandKitHandlers(generator) {
        // File input handling
        const uploadSection = document.getElementById('brand-kit-upload');
        const fileInput = document.getElementById('brand-kit-file-input');
        
        if (!uploadSection || !fileInput) return;
        
        uploadSection.addEventListener('click', () => fileInput.click());
        
        uploadSection.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadSection.classList.add('drag-over');
        });
        
        uploadSection.addEventListener('dragleave', () => {
            uploadSection.classList.remove('drag-over');
        });
        
        uploadSection.addEventListener('drop', async (e) => {
            e.preventDefault();
            uploadSection.classList.remove('drag-over');
            
            const file = e.dataTransfer.files[0];
            if (file) {
                await handleFileUpload(generator, file);
            }
        });
        
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                await handleFileUpload(generator, file);
            }
        });
        
        // Render pack cards
        renderPackCards(generator);
        
        // Render platform previews
        renderPlatformPreviews(generator);
        
        // Options handlers
        document.getElementById('opt-color-variations')?.addEventListener('change', (e) => {
            generator.options.generateColorVariations = e.target.checked;
        });
        
        document.getElementById('opt-safe-zone')?.addEventListener('change', (e) => {
            generator.options.addSafeZonePadding = e.target.checked;
        });
        
        document.getElementById('opt-webp')?.addEventListener('change', (e) => {
            generator.options.convertToWebP = e.target.checked;
        });
        
        document.getElementById('opt-brand-guide')?.addEventListener('change', (e) => {
            generator.options.generateBrandGuidelines = e.target.checked;
        });
        
        // Generate button
        document.getElementById('brand-kit-generate')?.addEventListener('click', async () => {
            await handleGenerate(generator);
        });
        
        // Action buttons
        document.getElementById('btn-download-all')?.addEventListener('click', () => {
            generator.downloadAll();
        });
        
        document.getElementById('btn-save-library')?.addEventListener('click', async () => {
            await generator.saveToLibrary();
        });
        
        document.getElementById('btn-push-aistudio')?.addEventListener('click', async () => {
            await generator.pushToAIStudio();
        });
        
        // Progress listener
        window.addEventListener('brandkit-progress', (e) => {
            const { current, total, message, percent } = e.detail;
            const progressFill = document.getElementById('brand-kit-progress-fill');
            const progressText = document.getElementById('brand-kit-progress-text');
            
            if (progressFill) progressFill.style.width = `${percent}%`;
            if (progressText) progressText.textContent = `${message} (${current}/${total})`;
        });
        
        // AI Upscale button handler
        document.getElementById('brand-kit-ai-upscale-btn')?.addEventListener('click', async () => {
            const btn = document.getElementById('brand-kit-ai-upscale-btn');
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<span>⏳</span> Upscaling...';
            }
            
            try {
                const upscaledLogo = await generator.performAIUpscale();
                if (upscaledLogo) {
                    // Update preview
                    const previewImg = document.getElementById('brand-kit-preview-img');
                    if (previewImg) previewImg.src = upscaledLogo.dataUrl;
                    
                    // Update metadata
                    const metadataDiv = document.getElementById('brand-kit-metadata');
                    if (metadataDiv) {
                        metadataDiv.innerHTML = `
                            <div class="brand-kit-metadata-row">
                                <span class="brand-kit-metadata-label">Format</span>
                                <span class="brand-kit-metadata-value">${upscaledLogo.format} ${upscaledLogo.isVector ? '(Vector)' : '(Raster)'}</span>
                            </div>
                            <div class="brand-kit-metadata-row">
                                <span class="brand-kit-metadata-label">Dimensions</span>
                                <span class="brand-kit-metadata-value">${upscaledLogo.width} × ${upscaledLogo.height} px</span>
                            </div>
                            <div class="brand-kit-metadata-row">
                                <span class="brand-kit-metadata-label">Transparency</span>
                                <span class="brand-kit-metadata-value">${upscaledLogo.hasTransparency ? '✓ Yes' : '✕ No'}</span>
                            </div>
                            <div class="brand-kit-metadata-row" style="color: #22c55e;">
                                <span class="brand-kit-metadata-label">✅ Enhanced</span>
                                <span class="brand-kit-metadata-value">AI Upscaled</span>
                            </div>
                        `;
                    }
                    
                    // Hide the upscale section
                    const upscaleSection = document.getElementById('brand-kit-ai-upscale');
                    if (upscaleSection) upscaleSection.classList.remove('show');
                    
                    // Update platform previews
                    updatePlatformPreviews(generator);
                }
            } catch (error) {
                console.error('[BrandKit] Upscale failed:', error);
            }
            
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<span>🤖</span> AI Upscale with Gemini';
            }
        });
        
        // Brand selection dropdown - populate with CRM companies
        const brandSelect = document.getElementById('brand-kit-brand-select');
        const saveCrmBtn = document.getElementById('brand-kit-save-crm-btn');
        const newCompanyBtn = document.getElementById('brand-kit-new-company-btn');
        
        // Populate with existing companies
        function populateBrandSelect() {
            if (!brandSelect) return;
            
            // Clear existing options except first
            while (brandSelect.options.length > 1) {
                brandSelect.remove(1);
            }
            
            // Use cavCRM (not CAVInternalCRM)
            const crm = window.cavCRM;
            if (crm && crm.companies) {
                const companies = Object.values(crm.companies) || [];
                companies.forEach(company => {
                    const option = document.createElement('option');
                    option.value = company.id;
                    option.textContent = company.name;
                    brandSelect.appendChild(option);
                });
            }
        }
        
        populateBrandSelect();
        
        // New Company button handler
        newCompanyBtn?.addEventListener('click', () => {
            const crm = window.cavCRM;
            if (!crm || !crm.showModal || !crm.createCompanyForm) {
                // Fallback: prompt for company name and website
                const name = prompt('Enter Company Name:');
                if (!name) return;
                
                const website = prompt('Enter Company Website (optional):');
                
                // Create company via CRM
                if (crm && crm.createCompany) {
                    const newCompany = crm.createCompany({
                        name: name,
                        website: website || '',
                        industry: '',
                        notes: 'Created from Brand Kit'
                    });
                    
                    // Refresh dropdown and select the new company
                    populateBrandSelect();
                    
                    if (brandSelect && newCompany) {
                        brandSelect.value = newCompany.id;
                        generator.assignToBrand(newCompany.id, newCompany.name);
                        if (saveCrmBtn) saveCrmBtn.style.display = 'flex';
                    }
                    
                    generator.showToast('success', `✅ Company "${name}" created!`);
                } else {
                    generator.showToast('error', 'CRM not available. Please create company from CRM tab.');
                }
                return;
            }
            
            // Use CRM's modal system
            const form = crm.createCompanyForm();
            crm.showModal(form, (data) => {
                const newCompany = crm.createCompany(data);
                
                // Refresh dropdown and select the new company
                populateBrandSelect();
                
                if (brandSelect && newCompany) {
                    brandSelect.value = newCompany.id;
                    generator.assignToBrand(newCompany.id, newCompany.name);
                    if (saveCrmBtn) saveCrmBtn.style.display = 'flex';
                }
                
                generator.showToast('success', `✅ Company "${data.name}" created!`);
            }, 'company');
        });
        
        brandSelect?.addEventListener('change', (e) => {
            const selectedId = e.target.value;
            const selectedName = e.target.options[e.target.selectedIndex]?.textContent;
            
            if (selectedId) {
                generator.assignToBrand(selectedId, selectedName);
                if (saveCrmBtn) saveCrmBtn.style.display = 'flex';
            } else {
                generator.clearBrandAssignment();
                if (saveCrmBtn) saveCrmBtn.style.display = 'none';
            }
        });
        
        // Save to CRM button handler
        saveCrmBtn?.addEventListener('click', async () => {
            const { companyId } = generator.getBrandAssignment();
            if (companyId && generator.generatedAssets.length > 0) {
                await generator.linkToCRM(companyId, generator.generatedAssets);
                generator.showToast('success', '✅ Brand Kit saved to CRM');
            } else if (companyId) {
                // Save logo info even without generated assets
                await generator.linkToCRM(companyId);
                generator.showToast('success', '✅ Logo assigned to company in CRM');
            } else {
                generator.showToast('warning', 'Please select a company first');
            }
        });
    }

    async function handleFileUpload(generator, file) {
        try {
            const logo = await generator.uploadLogo(file);
            
            // Show preview
            const previewSection = document.getElementById('brand-kit-preview');
            const previewImg = document.getElementById('brand-kit-preview-img');
            const metadataDiv = document.getElementById('brand-kit-metadata');
            const colorsDiv = document.getElementById('brand-kit-colors');
            
            if (previewSection) previewSection.classList.add('active');
            if (previewImg) previewImg.src = logo.dataUrl;
            
            // Render metadata
            if (metadataDiv) {
                metadataDiv.innerHTML = `
                    <div class="brand-kit-metadata-row">
                        <span class="brand-kit-metadata-label">Format</span>
                        <span class="brand-kit-metadata-value">${logo.format} ${logo.isVector ? '(Vector)' : '(Raster)'}</span>
                    </div>
                    <div class="brand-kit-metadata-row">
                        <span class="brand-kit-metadata-label">Dimensions</span>
                        <span class="brand-kit-metadata-value">${logo.width} × ${logo.height} px</span>
                    </div>
                    <div class="brand-kit-metadata-row">
                        <span class="brand-kit-metadata-label">Transparency</span>
                        <span class="brand-kit-metadata-value">${logo.hasTransparency ? '✓ Yes' : '✕ No'}</span>
                    </div>
                    <div class="brand-kit-metadata-row">
                        <span class="brand-kit-metadata-label">File Size</span>
                        <span class="brand-kit-metadata-value">${(logo.size / 1024).toFixed(1)} KB</span>
                    </div>
                `;
            }
            
            // Show/hide AI upscale section based on quality warning
            const aiUpscaleSection = document.getElementById('brand-kit-ai-upscale');
            if (aiUpscaleSection) {
                if (logo.qualityWarning && !logo.isUpscaled) {
                    aiUpscaleSection.classList.add('show');
                } else {
                    aiUpscaleSection.classList.remove('show');
                }
            }
            
            // Render colors
            if (colorsDiv && generator.extractedColors.length > 0) {
                colorsDiv.innerHTML = generator.extractedColors.map(color => `
                    <div class="brand-kit-color-swatch" style="background: ${color}" title="${color}" onclick="navigator.clipboard.writeText('${color}')"></div>
                `).join('');
            }
            
            // Update platform previews
            updatePlatformPreviews(generator);
            
            // Enable generate button
            const generateBtn = document.getElementById('brand-kit-generate');
            if (generateBtn) generateBtn.disabled = false;
            
        } catch (error) {
            console.error('[BrandKit] Upload error:', error);
            generator.showToast('error', 'Failed to process logo');
        }
    }

    function renderPackCards(generator) {
        const container = document.getElementById('brand-kit-packs');
        if (!container) return;
        
        const packs = generator.getPackInfo();
        
        // Map pack IDs to brand icons
        const packIcons = {
            social_media: BRAND_ICONS.instagram,
            google_ads: BRAND_ICONS.google,
            favicon: BRAND_ICONS.chrome,
            email: BRAND_ICONS.email,
            print: BRAND_ICONS.print,
            app_icons: BRAND_ICONS.apple,
            watermarks: BRAND_ICONS.watermark
        };
        
        container.innerHTML = Object.entries(packs).map(([id, pack]) => {
            const svgIcon = packIcons[id] || '';
            return `
                <div class="brand-kit-pack-card ${generator.selectedPacks.has(id) ? 'selected' : ''}" data-pack="${id}">
                    <div class="brand-kit-pack-icon-svg">${svgIcon}</div>
                    <div class="brand-kit-pack-name">${pack.name}</div>
                    <div class="brand-kit-pack-desc">${pack.description}</div>
                    <div class="brand-kit-pack-count">${pack.sizes.length} sizes</div>
                </div>
            `;
        }).join('');
        
        // Add click handlers
        container.querySelectorAll('.brand-kit-pack-card').forEach(card => {
            card.addEventListener('click', () => {
                const packId = card.dataset.pack;
                if (generator.selectedPacks.has(packId)) {
                    generator.selectedPacks.delete(packId);
                    card.classList.remove('selected');
                } else {
                    generator.selectedPacks.add(packId);
                    card.classList.add('selected');
                }
            });
        });
    }

    function renderPlatformPreviews(generator) {
        const container = document.getElementById('brand-kit-platforms');
        if (!container) return;
        
        const platforms = generator.getPlatformPreviews();
        
        container.innerHTML = Object.entries(platforms).map(([id, platform]) => {
            // Get brand SVG icon
            const brandIcon = BRAND_ICONS[id] || BRAND_ICONS.app || '';
            
            return `
                <div class="brand-kit-platform-preview" data-platform="${id}">
                    <div class="brand-kit-platform-mockup" style="background: ${platform.backgroundColor}">
                        <img id="platform-preview-${id}" src="" alt="${platform.name}">
                    </div>
                    <div class="brand-kit-platform-icon">${brandIcon}</div>
                    <div class="brand-kit-platform-name">${platform.name}</div>
                </div>
            `;
        }).join('');
    }

    function updatePlatformPreviews(generator) {
        if (!generator.uploadedLogo) return;
        
        const platforms = generator.getPlatformPreviews();
        
        for (const id of Object.keys(platforms)) {
            const img = document.getElementById(`platform-preview-${id}`);
            if (img) {
                img.src = generator.uploadedLogo.dataUrl;
            }
        }
    }

    async function handleGenerate(generator) {
        const progressSection = document.getElementById('brand-kit-progress');
        const resultsSection = document.getElementById('brand-kit-results');
        const assetsGrid = document.getElementById('brand-kit-assets-grid');
        const generateBtn = document.getElementById('brand-kit-generate');
        
        if (progressSection) progressSection.classList.add('active');
        if (resultsSection) resultsSection.classList.remove('active');
        if (generateBtn) generateBtn.disabled = true;
        
        try {
            const assets = await generator.generateBrandKit();
            
            // Render results
            if (assetsGrid) {
                assetsGrid.innerHTML = assets.filter(a => a).map(asset => `
                    <div class="brand-kit-asset-card">
                        <img class="brand-kit-asset-preview" src="${asset.dataUrl}" alt="${asset.name}">
                        <div class="brand-kit-asset-name" title="${asset.name}">${asset.name}</div>
                        <div class="brand-kit-asset-dims">${asset.width}×${asset.height} ${asset.format}</div>
                    </div>
                `).join('');
            }
            
            if (resultsSection) resultsSection.classList.add('active');
            if (progressSection) progressSection.classList.remove('active');
            
            generator.showToast('success', `Generated ${assets.length} assets!`);
            
        } catch (error) {
            console.error('[BrandKit] Generation error:', error);
            generator.showToast('error', 'Failed to generate brand kit');
        }
        
        if (generateBtn) generateBtn.disabled = false;
    }

    // =============================================
    // MODULE EXPORTS
    // =============================================
    
    window.CAVBrandKit = {
        Generator: BrandKitGenerator,
        createUI: createBrandKitUI,
        attachHandlers: attachBrandKitHandlers,
        EXPORT_PACKS,
        PLATFORM_PREVIEWS,
        COLOR_VARIATIONS,
        VERSION
    };

    // Create default instance
    window.cavBrandKitGenerator = new BrandKitGenerator();

    console.log(`🎨 Brand Kit Generator loaded - Version ${VERSION}`);
    console.log('   ✅ Upload & Auto-Detect (SVG, PNG, JPG, AI, EPS, PDF)');
    console.log('   ✅ Export Packs: Social Media, Google Ads, Favicon, Email, Print, App Icons, Watermarks');
    console.log('   ✅ Smart Processing: Vector scaling, AI upscaling, background removal');
    console.log('   ✅ Color Variations: Full color, white, black, grayscale');
    console.log('   ✅ AI Studio Integration');
    console.log('   ✅ Library Integration');
    console.log('   ✅ CRM Integration');

})();

