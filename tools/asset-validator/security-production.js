/**
 * Production Security Module
 * Add this FIRST in your HTML (before other scripts)
 * 
 * Features:
 * - Console lockdown
 * - DevTools detection
 * - Right-click protection
 * - View source protection
 * - Session validation
 * - HTTPS enforcement
 * - Content Security Policy
 */

(function() {
    'use strict';
    
    // ============================================
    // CONFIGURATION - Set these for your deployment
    // ============================================
    
    const SECURITY_CONFIG = {
        // Set to TRUE for production
        PRODUCTION_MODE: true,  // ← ENABLED FOR PRODUCTION
        
        // Allowed domains (add your production domain)
        ALLOWED_ORIGINS: [
            'https://itallstartedwithaidea.com',
            'https://www.itallstartedwithaidea.com',
            'https://creative-asset-validator.pages.dev',
            'https://creative.itallstartedwithaidea.com',  // Custom domain
            'http://localhost:8080',  // Keep for local testing
            'http://127.0.0.1:8080'
        ],
        
        // Block DevTools in production
        BLOCK_DEVTOOLS: true,
        
        // Block right-click context menu
        BLOCK_RIGHT_CLICK: true,
        
        // Block view-source keyboard shortcuts
        BLOCK_VIEW_SOURCE: true,
        
        // Force HTTPS (redirect HTTP to HTTPS)
        FORCE_HTTPS: true,
        
        // Session timeout in minutes (0 = no timeout)
        SESSION_TIMEOUT_MINUTES: 60,
        
        // Block if user is not logged in (after initial load)
        REQUIRE_AUTH_FOR_APP: true
    };
    
    // Make config available globally
    window.CAV_SECURITY_CONFIG = SECURITY_CONFIG;
    
    // ============================================
    // CONSOLE LOCKDOWN
    // ============================================
    
    if (SECURITY_CONFIG.PRODUCTION_MODE) {
        // Store original methods for internal use
        window._console = {
            log: console.log.bind(console),
            warn: console.warn.bind(console),
            error: console.error.bind(console),
            info: console.info.bind(console)
        };
        
        // Override console methods
        console.log = function() {};
        console.info = function() {};
        console.debug = function() {};
        console.table = function() {};
        console.dir = function() {};
        console.dirxml = function() {};
        console.group = function() {};
        console.groupCollapsed = function() {};
        console.groupEnd = function() {};
        console.time = function() {};
        console.timeEnd = function() {};
        console.trace = function() {};
        console.count = function() {};
        console.clear = function() {};
        
        // Keep warn and error for critical issues
        // Uncomment to hide those too:
        // console.warn = function() {};
        // console.error = function() {};
    }
    
    // ============================================
    // HTTPS ENFORCEMENT
    // ============================================
    
    if (SECURITY_CONFIG.PRODUCTION_MODE && SECURITY_CONFIG.FORCE_HTTPS) {
        if (window.location.protocol === 'http:' && 
            !window.location.hostname.includes('localhost') &&
            !window.location.hostname.includes('127.0.0.1')) {
            window.location.href = window.location.href.replace('http:', 'https:');
        }
    }
    
    // ============================================
    // ORIGIN VALIDATION
    // ============================================
    
    if (SECURITY_CONFIG.PRODUCTION_MODE) {
        const currentOrigin = window.location.origin;
        if (!SECURITY_CONFIG.ALLOWED_ORIGINS.includes(currentOrigin)) {
            document.body.innerHTML = `
                <div style="text-align: center; padding: 50px; font-family: system-ui;">
                    <h1 style="color: #ef4444;">⚠️ Unauthorized Access</h1>
                    <p>This application is not authorized to run on this domain.</p>
                </div>
            `;
            throw new Error('Unauthorized origin: ' + currentOrigin);
        }
    }
    
    // ============================================
    // DEVTOOLS DETECTION (Desktop only)
    // ============================================
    
    if (SECURITY_CONFIG.PRODUCTION_MODE && SECURITY_CONFIG.BLOCK_DEVTOOLS) {
        // Skip DevTools detection on mobile/tablet - causes false positives
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                         window.innerWidth < 1024;
        
        if (!isMobile) {
            let devToolsOpen = false;
            
            // Size detection (desktop only)
            const detectBySize = function() {
                // More conservative thresholds
                const widthThreshold = window.outerWidth - window.innerWidth > 200;
                const heightThreshold = window.outerHeight - window.innerHeight > 200;
                
                if (widthThreshold || heightThreshold) {
                    if (!devToolsOpen) {
                        devToolsOpen = true;
                        handleDevToolsOpen();
                    }
                } else {
                    devToolsOpen = false;
                    // Remove blur when DevTools closes
                    if (document.body.style.filter === 'blur(10px)') {
                        document.body.style.filter = '';
                        document.body.style.pointerEvents = '';
                    }
                }
            };
            
            function handleDevToolsOpen() {
                // Blur content when DevTools detected
                document.body.style.filter = 'blur(10px)';
                document.body.style.pointerEvents = 'none';
            }
            
            // Check periodically (desktop only)
            setInterval(detectBySize, 1000);
        }
    }
    
    // ============================================
    // RIGHT-CLICK PROTECTION
    // ============================================
    
    if (SECURITY_CONFIG.PRODUCTION_MODE && SECURITY_CONFIG.BLOCK_RIGHT_CLICK) {
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });
    }
    
    // ============================================
    // VIEW SOURCE PROTECTION
    // ============================================
    
    if (SECURITY_CONFIG.PRODUCTION_MODE && SECURITY_CONFIG.BLOCK_VIEW_SOURCE) {
        document.addEventListener('keydown', function(e) {
            // Block F12
            if (e.key === 'F12') {
                e.preventDefault();
                return false;
            }
            
            // Block Ctrl+Shift+I (DevTools)
            if (e.ctrlKey && e.shiftKey && e.key === 'I') {
                e.preventDefault();
                return false;
            }
            
            // Block Ctrl+Shift+J (Console)
            if (e.ctrlKey && e.shiftKey && e.key === 'J') {
                e.preventDefault();
                return false;
            }
            
            // Block Ctrl+U (View Source)
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault();
                return false;
            }
            
            // Block Ctrl+S (Save)
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                return false;
            }
            
            // Block Ctrl+Shift+C (Element Inspector)
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                return false;
            }
        });
    }
    
    // ============================================
    // SESSION TIMEOUT
    // ============================================
    
    if (SECURITY_CONFIG.PRODUCTION_MODE && SECURITY_CONFIG.SESSION_TIMEOUT_MINUTES > 0) {
        let lastActivity = Date.now();
        const timeoutMs = SECURITY_CONFIG.SESSION_TIMEOUT_MINUTES * 60 * 1000;
        
        // Track activity
        ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
            document.addEventListener(event, function() {
                lastActivity = Date.now();
            }, { passive: true });
        });
        
        // Check for timeout
        setInterval(function() {
            if (Date.now() - lastActivity > timeoutMs) {
                // Clear session
                localStorage.removeItem('cav_session');
                localStorage.removeItem('cav_session_encrypted');
                sessionStorage.clear();
                
                // Notify and redirect
                alert('Your session has expired. Please log in again.');
                window.location.reload();
            }
        }, 60000); // Check every minute
    }
    
    // ============================================
    // AUTH GATE (blocks app until logged in)
    // ============================================
    
    if (SECURITY_CONFIG.PRODUCTION_MODE && SECURITY_CONFIG.REQUIRE_AUTH_FOR_APP) {
        window.CAV_AUTH_GATE = {
            checkAuth: function() {
                const session = window.cavUserSession || 
                               JSON.parse(localStorage.getItem('cav_session') || 'null');
                return session && session.email;
            },
            
            enforceAuth: function() {
                if (!this.checkAuth()) {
                    // Hide main content, show login only
                    const mainContent = document.getElementById('cav-dynamic-content');
                    const sidebar = document.querySelector('.cav-sidebar');
                    
                    if (mainContent) mainContent.style.display = 'none';
                    if (sidebar) sidebar.style.display = 'none';
                }
            }
        };
        
        // Enforce on DOM ready
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() {
                window.CAV_AUTH_GATE?.enforceAuth();
            }, 100);
        });
    }
    
    // ============================================
    // CONTENT SECURITY POLICY (CSP) - Add via meta tag
    // ============================================
    
    // Note: Best to add CSP via HTTP headers on your server
    // This is a fallback meta tag approach
    if (SECURITY_CONFIG.PRODUCTION_MODE) {
        const cspMeta = document.createElement('meta');
        cspMeta.httpEquiv = 'Content-Security-Policy';
        cspMeta.content = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com https://www.gstatic.com https://cdn.jsdelivr.net https://esm.run https://esm.sh https://generativelanguage.googleapis.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: blob: https: http:",
            "connect-src 'self' https: wss://*.supabase.co",
            "frame-src 'self' https://accounts.google.com",
            "media-src 'self' data: blob: https:"
        ].join('; ');
        document.head.insertBefore(cspMeta, document.head.firstChild);
    }
    
    // ============================================
    // ANTI-IFRAME (Clickjacking Protection)
    // ============================================
    
    if (SECURITY_CONFIG.PRODUCTION_MODE) {
        // Prevent embedding in iframes
        if (window.top !== window.self) {
            window.top.location = window.self.location;
        }
        
        // X-Frame-Options must be set via HTTP header, not meta tag
        // Use _headers file for Cloudflare Pages instead
    }
    
    // ============================================
    // EXPOSE SECURITY STATUS
    // ============================================
    
    window.CAV_SECURITY_STATUS = {
        production: SECURITY_CONFIG.PRODUCTION_MODE,
        https: window.location.protocol === 'https:',
        origin: window.location.origin,
        initialized: true
    };
    
    // Log security status (only in dev mode)
    if (!SECURITY_CONFIG.PRODUCTION_MODE) {
        console.log('🔒 Security Module loaded (DEVELOPMENT MODE)');
        console.log('   Set PRODUCTION_MODE: true before deploying');
    }
    
})();
