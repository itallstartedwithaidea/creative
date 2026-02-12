/**
 * Authentication Configuration
 * ============================
 * Version 3.1.0 - Enterprise Security Edition
 * 
 * ⚠️ IMPORTANT: GOOGLE SIGN-IN SETUP FOR LIVE HOST
 * ================================================
 * If you see a blank screen when clicking "Sign in with Google",
 * your live domain is not authorized in Google Cloud Console.
 * 
 * QUICK FIX:
 * 1. Go to https://console.cloud.google.com/apis/credentials
 * 2. Click on your OAuth 2.0 Client ID
 * 3. Under "Authorized JavaScript origins", add:
 *    - https://yourdomain.com (your live site)
 *    - http://yourdomain.com (if using http)
 * 4. Click SAVE
 * 5. Wait 5-10 minutes for changes to propagate
 * 
 * FULL SETUP INSTRUCTIONS:
 * 1. Go to https://console.cloud.google.com/
 * 2. Create a new project (or use existing)
 * 3. Enable "Google Identity" API
 * 4. Go to APIs & Services > Credentials
 * 5. Create Credentials > OAuth 2.0 Client ID
 * 6. Application type: Web application
 * 7. Add ALL domains to "Authorized JavaScript origins":
 *    - http://localhost:8800 (for local testing)
 *    - https://yourdomain.com (your live domain)
 *    - http://yourdomain.com (if using http)
 * 8. Copy the Client ID and paste below
 * 
 * TROUBLESHOOTING:
 * - Blank screen = domain not authorized (fix above)
 * - Popup blocked = user needs to allow popups
 * - "Sign in manually" link = fallback for any issues
 * 
 * SECURITY FEATURES:
 * - Corporate domain enforcement (personal emails BLOCKED by default)
 * - AES-256 encrypted session storage
 * - Anti-tampering protection with HMAC signatures
 * - Device fingerprinting for session binding
 * - Admin approval system for whitelisted emails
 * - Full activity audit logging
 */

window.AUTH_CONFIG = {
    
    // =============================================
    // GOOGLE OAUTH CLIENT ID
    // =============================================
    // Get this from Google Cloud Console > Credentials
    // IMPORTANT: Replace this with your actual Google OAuth Client ID
    GOOGLE_CLIENT_ID: '487493187407-tpdf56sd9elitl7fke0votho17h7m7gs.apps.googleusercontent.com',
    
    // =============================================
    // ADMIN EMAILS (Full Access)
    // =============================================
    // These users have FULL access:
    // - Admin dashboard
    // - User management
    // - Approve/deny whitelist requests
    // - All settings
    // - Can upload, edit, delete any asset
    ADMIN_EMAILS: [
        'john@itallstartedwithaidea.com',
        // Add more admin emails here:
        'brittani.hunsaker@seerinteractive.com','john.williams@seerinteractive.com'
    ],
    
    // =============================================
    // CORPORATE DOMAINS (Auto-Approved)
    // =============================================
    // Users with these email domains get AUTOMATIC access:
    // - No approval needed
    // - Team sharing access (can see/share team assets)
    // - Corporate badge in UI
    // - Editor role by default
    CORPORATE_DOMAINS: [
        'itallstartedwithaidea.com',
        // Add more corporate domains:
        'seerinteractive.com',
        // 'subsidiary.com',
    ],
    
    // =============================================
    // WHITELISTED EMAILS (Pre-Approved Personal Emails)
    // =============================================
    // IMPORTANT: Personal emails (Gmail, Yahoo, Hotmail, etc.) are BLOCKED by default.
    // Add specific personal emails here to grant them access.
    // These users can also be approved via the Admin Dashboard > Access Requests
    WHITELISTED_EMAILS: [
        // 'trusted.contractor@gmail.com',
        // 'partner@yahoo.com',
    ],
    
    // =============================================
    // BLOCKED EMAILS & DOMAINS
    // =============================================
    // Explicitly block specific emails or entire domains
    // These override all other settings
    BLOCKED_EMAILS: [
        // 'baduser@example.com',
    ],
    BLOCKED_DOMAINS: [
        // 'competitor.com',
        // 'spammer.net',
    ],
    
    // =============================================
    // FEATURE FLAGS
    // =============================================
    FEATURES: {
        // Allow team sharing for corporate users
        TEAM_SHARING_ENABLED: true,
        
        // ⚠️ CRITICAL SECURITY SETTING:
        // false = BLOCK all personal emails (Gmail, Yahoo, Hotmail, etc.)
        //         Only WHITELISTED_EMAILS or admin-approved emails can access
        // true = ALLOW personal emails (NOT RECOMMENDED for corporate use)
        PERSONAL_USERS_ENABLED: false,  // SET TO FALSE FOR SECURITY
        
        // Show activity log in admin dashboard
        ACTIVITY_LOG_ENABLED: true,
        
        // Maximum days to keep activity logs
        ACTIVITY_LOG_RETENTION_DAYS: 360,
        
        // Require admin approval for new users from unknown domains
        // When true, new users from non-corporate domains need approval
        REQUIRE_APPROVAL: false,
        
        // Default role for new users (viewer, editor)
        DEFAULT_ROLE: 'editor',
        
        // Enable AI asset adaptation features
        AI_ADAPTER_ENABLED: true,
        
        // Enable custom AI prompts
        AI_CUSTOM_PROMPTS_ENABLED: true,
        
        // Default video duration for image-to-video (seconds)
        AI_DEFAULT_VIDEO_DURATION: 6,
        
        // Items per page for pagination
        ITEMS_PER_PAGE: 24,
        
        // Enable asset expiration (days, 0 = never)
        ASSET_EXPIRATION_DAYS: 0,
        
        // Session duration in days (default 30)
        SESSION_DURATION_DAYS: 30,
        
        // Enable anti-tampering protection
        ANTI_TAMPERING_ENABLED: true,
        
        // Enable device fingerprinting
        DEVICE_FINGERPRINTING_ENABLED: true
    }
};

/**
 * ROLE PERMISSIONS REFERENCE:
 * 
 * VIEWER (Read Only):
 * - View assets
 * - Add to favorites
 * - Download assets
 * 
 * EDITOR (Can Create & Edit):
 * - All Viewer permissions
 * - Upload assets
 * - Edit asset tags
 * - Rename files
 * - Delete own assets
 * - Access team assets (if corporate)
 * 
 * ADMIN (Full Access):
 * - All Editor permissions
 * - Delete any asset
 * - Access Admin Dashboard
 * - Manage users
 * - Change settings
 * - View activity logs
 * - Approve/Deny access requests
 * 
 * ===================================
 * PERSONAL EMAIL DOMAINS (BLOCKED)
 * ===================================
 * These are automatically treated as personal accounts and BLOCKED unless whitelisted:
 * - gmail.com, googlemail.com
 * - hotmail.com, outlook.com, live.com, msn.com
 * - yahoo.com, ymail.com
 * - aol.com, protonmail.com, icloud.com, me.com
 * - mail.com, zoho.com, gmx.com
 * - And many more...
 * 
 * Any OTHER domain is treated as CORPORATE by default and allowed.
 * 
 * To allow a personal email:
 * 1. Add it to WHITELISTED_EMAILS above, OR
 * 2. Have the user request access and approve via Admin Dashboard
 */
