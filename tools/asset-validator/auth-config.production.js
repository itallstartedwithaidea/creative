/**
 * Production Authentication Configuration
 * This file IS committed to git and deployed to Cloudflare
 */

window.AUTH_CONFIG = {
    
    // Google OAuth Client ID
    GOOGLE_CLIENT_ID: '487493187407-tpdf56sd9elitl7fke0votho17h7m7gs.apps.googleusercontent.com',
    
    // Admin Emails (Full Access)
    ADMIN_EMAILS: [
        'john@itallstartedwithaidea.com',
        'brittani.hunsaker@seerinteractive.com',
        'john.williams@seerinteractive.com'
    ],
    
    // Corporate Domains (Auto-Approved)
    CORPORATE_DOMAINS: [
        'itallstartedwithaidea.com',
        'seerinteractive.com'
    ],
    
    // Whitelisted Personal Emails
    WHITELISTED_EMAILS: [],
    
    // Blocked
    BLOCKED_EMAILS: [],
    BLOCKED_DOMAINS: [],
    
    // Features
    FEATURES: {
        TEAM_SHARING_ENABLED: true,
        PERSONAL_USERS_ENABLED: false,
        ACTIVITY_LOG_ENABLED: true,
        ACTIVITY_LOG_RETENTION_DAYS: 360,
        REQUIRE_APPROVAL: false,
        DEFAULT_ROLE: 'editor',
        AI_ADAPTER_ENABLED: true,
        AI_CUSTOM_PROMPTS_ENABLED: true,
        AI_DEFAULT_VIDEO_DURATION: 6,
        ITEMS_PER_PAGE: 24,
        ASSET_EXPIRATION_DAYS: 0,
        SESSION_DURATION_DAYS: 30,
        ANTI_TAMPERING_ENABLED: true,
        DEVICE_FINGERPRINTING_ENABLED: true
    }
};
