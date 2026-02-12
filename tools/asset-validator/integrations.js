/**
 * Integration Hub - External Service Connections
 * ===============================================
 * Version 3.1.0 - COMPREHENSIVE INTEGRATIONS WITH USER-SPECIFIC STORAGE
 * 
 * KEY FEATURES:
 * - USER-SPECIFIC STORAGE: Each user has their own integrations (not shared)
 * - OAuth per documentation: Correct scopes & endpoints for all services
 * - SVG icons matching Creative Asset Validator design system
 * 
 * Supported Integrations:
 * - Google Drive (folder picker, real scanning)
 * - Google Sheets (scan cells for image URLs)
 * - OneDrive (folder picker, real scanning)
 * - Dropbox (folder picker, real scanning)
 * - Slack (Events API - scan channels for files)
 * - Figma (OAuth, import assets from projects)
 * - Adobe Creative Cloud (CC Libraries import)
 * - Zapier (incoming webhook receiver)
 * - Gmail (scan attachments)
 * - Outlook (scan attachments)
 * - Wrike (project management)
 * - Monday.com (project management)
 * - Basecamp (project management)
 * 
 * Features:
 * - OAuth2 seamless one-click authentication
 * - Folder picker for cloud storage services
 * - Automatic asset scanning with size analysis
 * - CRM logging for scan results (eligibility analysis)
 * - Validation against channel specs
 * - Import assets with one click
 * - Notification when assets don't meet specs
 * 
 * OAuth Documentation:
 * - Google Drive: https://developers.google.com/drive/api/v3/about-sdk
 * - Google Sheets: https://developers.google.com/sheets/api
 * - Gmail: https://developers.google.com/workspace/gmail/api/guides
 * - Slack Events: https://api.slack.com/apis/connections/events-api
 * - Figma: https://www.figma.com/developers/api
 * - Adobe CC: https://developer.adobe.com/creative-cloud-libraries/docs/
 * - Dropbox: https://www.dropbox.com/developers/documentation
 * - OneDrive: https://docs.microsoft.com/en-us/onedrive/developer/
 * - Outlook: https://learn.microsoft.com/en-us/graph/outlook-mail-concept-overview
 * - Zapier: https://platform.zapier.com/build/how-zapier-works
 */

(function() {
    'use strict';

    // ============================================
    // STORAGE KEYS (User-specific with email prefix)
    // ============================================
    function getUserStorageKey(baseKey) {
        const userEmail = window.cavUserSession?.email || 'anonymous';
        return `${baseKey}_${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
    }

    const INTEGRATION_STORAGE = {
        CONNECTIONS: 'cav_integrations_connections',
        SCAN_RESULTS: 'cav_integrations_scan_results',
        SCAN_HISTORY: 'cav_integrations_scan_history',
        SETTINGS: 'cav_integrations_settings',
    };

    // ============================================
    // SVG ICONS (Matching Creative Asset Validator style)
    // ============================================
    const INTEGRATION_ICONS = {
        google_drive: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
        google_sheets: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h18v18H3zM21 9H3M21 15H3M12 3v18"/></svg>`,
        onedrive: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`,
        dropbox: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>`,
        figma: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"/><path d="M12 2v4"/><path d="m6.8 6.8 2.9 2.9"/><path d="M2 12h4"/><path d="m6.8 17.2 2.9-2.9"/><path d="M12 18v4"/><path d="m17.2 17.2-2.9-2.9"/><path d="M22 12h-4"/><path d="m17.2 6.8-2.9 2.9"/></svg>`,
        adobe_cc: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>`,
        slack: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
        zapier: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
        gmail: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
        outlook: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
        wrike: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></svg>`,
        monday: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
        basecamp: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>`,
        // Common icons
        connect: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
        disconnect: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
        scan: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
        folder: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
        check: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
        download: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
        copy: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
        settings: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
        // Sheet picker icon
        sheet: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h18v18H3zM21 9H3M21 15H3M12 3v18"/></svg>`,
        // Email filter icon
        filter: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
    };

    // ============================================
    // INTEGRATION CONFIGURATIONS (OAuth per documentation)
    // configured: true = API is set up and working
    // comingSoon: true = Show "Coming Soon" button (requires admin setup)
    // superAdminOnly: true = Only super admins can access
    // ============================================
    const INTEGRATIONS = {
        // === CLOUD STORAGE (with folder pickers) ===
        google_drive: {
            name: 'Google Drive',
            iconSvg: INTEGRATION_ICONS.google_drive,
            color: '#4285f4',
            // Scopes per: https://developers.google.com/workspace/drive/api/guides/api-specific-auth
            scopes: [
                'https://www.googleapis.com/auth/drive.readonly',
                'https://www.googleapis.com/auth/drive.file',
                'https://www.googleapis.com/auth/drive.metadata.readonly'
            ],
            features: ['scan_folders', 'folder_picker', 'import_assets', 'crm_logging'],
            authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
            tokenUrl: 'https://oauth2.googleapis.com/token',
            apiBase: 'https://www.googleapis.com/drive/v3',
            endpoints: {
                files: 'https://www.googleapis.com/drive/v3/files',
                upload: 'https://www.googleapis.com/upload/drive/v3/files'
            },
            description: 'Scan folders for images & videos, select specific folders to monitor',
            category: 'cloud_storage',
            docs: 'https://developers.google.com/drive/api/v3/about-sdk',
            configured: true, // Uses AUTH_CONFIG.GOOGLE_CLIENT_ID
            comingSoon: false,
            superAdminOnly: false,
        },
        google_sheets: {
            name: 'Google Sheets',
            iconSvg: INTEGRATION_ICONS.google_sheets,
            color: '#0f9d58',
            // Scopes per: https://developers.google.com/sheets/api/guides/authorizing
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets.readonly',
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/drive.file'
            ],
            features: ['scan_cells', 'extract_images', 'import_assets', 'crm_logging'],
            authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
            tokenUrl: 'https://oauth2.googleapis.com/token',
            apiBase: 'https://sheets.googleapis.com/v4',
            endpoints: {
                spreadsheets: 'https://sheets.googleapis.com/v4/spreadsheets'
            },
            description: 'Scan spreadsheets for image URLs and embedded images',
            category: 'productivity',
            docs: 'https://developers.google.com/sheets/api/guides/concepts',
            configured: true, // Uses AUTH_CONFIG.GOOGLE_CLIENT_ID
            comingSoon: false,
            superAdminOnly: false,
        },
        onedrive: {
            name: 'OneDrive',
            iconSvg: INTEGRATION_ICONS.onedrive,
            color: '#0078d4',
            // Scopes per: https://learn.microsoft.com/en-us/graph/permissions-reference#files-permissions
            scopes: [
                'Files.Read',
                'Files.Read.All',
                'Files.ReadWrite',
                'offline_access',
                'User.Read'
            ],
            features: ['scan_folders', 'folder_picker', 'import_assets', 'crm_logging'],
            authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
            tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
            apiBase: 'https://graph.microsoft.com/v1.0',
            endpoints: {
                drive: 'https://graph.microsoft.com/v1.0/me/drive',
                driveItems: 'https://graph.microsoft.com/v1.0/me/drive/items',
                driveRoot: 'https://graph.microsoft.com/v1.0/me/drive/root/children'
            },
            description: 'Scan OneDrive folders for creative assets',
            category: 'cloud_storage',
            docs: 'https://learn.microsoft.com/en-us/onedrive/developer/',
            configured: false, // Requires Microsoft Azure AD app registration
            comingSoon: true,
            superAdminOnly: false,
        },
        dropbox: {
            name: 'Dropbox',
            iconSvg: INTEGRATION_ICONS.dropbox,
            color: '#0061fe',
            // Scopes per: https://www.dropbox.com/developers/reference/oauth-guide
            // SDK: https://github.com/dropbox/dropbox-sdk-python
            scopes: [
                'files.metadata.read',
                'files.metadata.write',
                'files.content.read',
                'files.content.write',
                'sharing.read'
            ],
            features: ['scan_folders', 'folder_picker', 'import_assets', 'crm_logging'],
            authUrl: 'https://www.dropbox.com/oauth2/authorize',
            tokenUrl: 'https://api.dropboxapi.com/oauth2/token',
            apiBase: 'https://api.dropboxapi.com/2',
            endpoints: {
                filesListFolder: 'https://api.dropboxapi.com/2/files/list_folder',
                filesDownload: 'https://content.dropboxapi.com/2/files/download',
                filesGetMetadata: 'https://api.dropboxapi.com/2/files/get_metadata'
            },
            description: 'Scan Dropbox folders for creative assets',
            category: 'cloud_storage',
            docs: 'https://www.dropbox.com/developers/documentation',
            // Dropbox API - Coming Soon while backend is configured
            configured: false,
            comingSoon: true,
            superAdminOnly: false,
            appKey: '9ubtkz6d24qftgg',
            appSecret: 'zw8ho8govz5dz86', // Stored securely, used server-side
            redirectUris: [
                'http://localhost:6400',
                'https://itallstartedwithaidea.com',
                'https://www.itallstartedwithaidea.com'
            ],
        },
        
        // === DESIGN TOOLS ===
        figma: {
            name: 'Figma',
            iconSvg: INTEGRATION_ICONS.figma,
            color: '#f24e1e',
            // Scopes per: https://developers.figma.com/docs/rest-api/authentication/
            scopes: [
                'file_content:read',
                'file_metadata:read',
                'file_dev_resources:read',
                'file_dev_resources:write',
                'webhooks:write'
            ],
            features: ['scan_projects', 'export_assets', 'import_assets', 'crm_logging'],
            authUrl: 'https://www.figma.com/oauth',
            tokenUrl: 'https://www.figma.com/api/oauth/token',
            refreshUrl: 'https://www.figma.com/api/oauth/refresh',
            apiBase: 'https://api.figma.com/v1',
            endpoints: {
                files: 'https://api.figma.com/v1/files/{file_key}',
                images: 'https://api.figma.com/v1/images/{file_key}',
                projects: 'https://api.figma.com/v1/projects/{project_id}/files',
                teamProjects: 'https://api.figma.com/v1/teams/{team_id}/projects'
            },
            description: 'Import assets directly from Figma projects and frames',
            category: 'design',
            docs: 'https://www.figma.com/developers/api',
            configured: false, // Requires Figma OAuth app registration
            comingSoon: true,
            superAdminOnly: false,
        },
        adobe_cc: {
            name: 'Adobe Creative Cloud',
            iconSvg: INTEGRATION_ICONS.adobe_cc,
            color: '#ff0000',
            // Scopes per: https://developer.adobe.com/creative-cloud-libraries/docs/integrate/setup/oauth/
            scopes: [
                'openid',
                'creative_sdk',
                'profile',
                'address',
                'AdobeID',
                'email',
                'cc_files',
                'cc_libraries'
            ],
            features: ['scan_libraries', 'import_assets', 'crm_logging'],
            authUrl: 'https://ims-na1.adobelogin.com/ims/authorize/v2',
            tokenUrl: 'https://ims-na1.adobelogin.com/ims/token/v3',
            apiBase: 'https://cc-libraries.adobe.io/api/v1',
            endpoints: {
                libraries: 'https://cc-libraries.adobe.io/api/v1/libraries',
                elements: 'https://cc-libraries.adobe.io/api/v1/libraries/{library_id}/elements'
            },
            description: 'Import assets from Adobe CC Libraries (Photoshop, Illustrator, etc.)',
            category: 'design',
            docs: 'https://developer.adobe.com/creative-cloud-libraries/docs/',
            configured: false, // Requires Adobe Developer Console app
            comingSoon: true,
            superAdminOnly: false,
        },
        
        // === COMMUNICATION & AUTOMATION ===
        slack: {
            name: 'Slack',
            iconSvg: INTEGRATION_ICONS.slack,
            color: '#4a154b',
            // Scopes per: https://api.slack.com/scopes
            scopes: {
                bot: [
                    'channels:read',
                    'channels:history',
                    'files:read',
                    'files:write',
                    'chat:write',
                    'groups:read',
                    'im:read',
                    'users:read'
                ],
                user: ['files:read', 'files:write']
            },
            features: ['scan_channels', 'webhook_scanning', 'notifications', 'crm_logging'],
            authUrl: 'https://slack.com/oauth/v2/authorize',
            tokenUrl: 'https://slack.com/api/oauth.v2.access',
            apiBase: 'https://slack.com/api',
            endpoints: {
                conversations: 'https://slack.com/api/conversations.list',
                files: 'https://slack.com/api/files.list',
                filesUpload: 'https://slack.com/api/files.upload'
            },
            description: 'Scan Slack channels for shared files via Events API',
            category: 'communication',
            docs: 'https://api.slack.com/apis/events-api',
            // Slack API - Coming Soon while backend is configured
            configured: false,
            comingSoon: true,
            superAdminOnly: false,
            // Slack App Credentials - Configure in environment or backend
            // See DEPLOYMENT.md for Slack App setup instructions
            appId: 'YOUR_SLACK_APP_ID',
            clientId: 'YOUR_SLACK_CLIENT_ID',
            clientSecret: null, // Server-side only - do not store in client code
            signingSecret: null, // Server-side only - do not store in client code
            appLevelToken: null, // Server-side only - do not store in client code
        },
        zapier: {
            name: 'Zapier',
            iconSvg: INTEGRATION_ICONS.zapier,
            color: '#ff4a00',
            scopes: [],
            features: ['webhook_receiver', 'import_assets', 'crm_logging'],
            authUrl: null, // Zapier uses webhook-based integration
            apiBase: null,
            endpoints: {
                webhookBase: 'https://hooks.zapier.com/hooks/catch/'
            },
            description: 'Receive assets from any Zapier-connected service via webhooks',
            category: 'automation',
            webhookBased: true,
            docs: 'https://platform.zapier.com/build/how-zapier-works',
            configured: false, // Requires Zapier webhook setup
            comingSoon: true,
            superAdminOnly: false,
        },
        
        // === EMAIL ===
        gmail: {
            name: 'Gmail',
            iconSvg: INTEGRATION_ICONS.gmail,
            color: '#ea4335',
            // Scopes per: https://developers.google.com/workspace/gmail/api/auth/scopes
            scopes: [
                'https://www.googleapis.com/auth/gmail.readonly',
                'https://www.googleapis.com/auth/gmail.modify',
                'https://mail.google.com/'
            ],
            features: ['scan_attachments', 'crm_logging'],
            authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
            tokenUrl: 'https://oauth2.googleapis.com/token',
            apiBase: 'https://gmail.googleapis.com/gmail/v1',
            endpoints: {
                messages: 'https://gmail.googleapis.com/gmail/v1/users/{userId}/messages',
                attachments: 'https://gmail.googleapis.com/gmail/v1/users/{userId}/messages/{messageId}/attachments/{id}'
            },
            description: 'Scan Gmail attachments for creative assets',
            category: 'email',
            docs: 'https://developers.google.com/workspace/gmail/api/guides',
            configured: true, // Uses AUTH_CONFIG.GOOGLE_CLIENT_ID
            comingSoon: false,
            superAdminOnly: false,
        },
        outlook: {
            name: 'Outlook',
            iconSvg: INTEGRATION_ICONS.outlook,
            color: '#0072c6',
            // Scopes per: https://learn.microsoft.com/en-us/graph/permissions-reference#mail-permissions
            scopes: [
                'Mail.Read',
                'Mail.ReadWrite',
                'Mail.Send',
                'offline_access',
                'User.Read'
            ],
            features: ['scan_attachments', 'crm_logging'],
            authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
            tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
            apiBase: 'https://graph.microsoft.com/v1.0',
            endpoints: {
                messages: 'https://graph.microsoft.com/v1.0/me/messages',
                mailFolders: 'https://graph.microsoft.com/v1.0/me/mailFolders',
                attachments: 'https://graph.microsoft.com/v1.0/me/messages/{message-id}/attachments'
            },
            description: 'Scan Outlook attachments for creative assets',
            category: 'email',
            docs: 'https://learn.microsoft.com/en-us/graph/outlook-mail-concept-overview',
            configured: false, // Requires Microsoft Azure AD app registration
            comingSoon: true,
            superAdminOnly: false,
        },
        
        // === PROJECT MANAGEMENT ===
        wrike: {
            name: 'Wrike',
            iconSvg: INTEGRATION_ICONS.wrike,
            color: '#28a745',
            scopes: ['wsReadOnly'],
            features: ['scan_attachments', 'sync_projects', 'crm_logging'],
            authUrl: 'https://www.wrike.com/oauth2/authorize/v4',
            tokenUrl: 'https://www.wrike.com/oauth2/token',
            apiBase: 'https://www.wrike.com/api/v4',
            description: 'Scan Wrike project attachments',
            category: 'project_management',
            docs: 'https://developers.wrike.com/',
            configured: false, // Requires Wrike API registration
            comingSoon: true,
            superAdminOnly: false,
        },
        monday: {
            name: 'Monday.com',
            iconSvg: INTEGRATION_ICONS.monday,
            color: '#ff3d57',
            scopes: ['boards:read', 'assets:read'],
            features: ['scan_attachments', 'sync_projects', 'crm_logging'],
            authUrl: 'https://auth.monday.com/oauth2/authorize',
            tokenUrl: 'https://auth.monday.com/oauth2/token',
            apiBase: 'https://api.monday.com/v2',
            description: 'Scan Monday.com board attachments',
            category: 'project_management',
            docs: 'https://monday.com/developers/v2',
            configured: false, // Requires Monday.com API registration
            comingSoon: true,
            superAdminOnly: false,
        },
        basecamp: {
            name: 'Basecamp',
            iconSvg: INTEGRATION_ICONS.basecamp,
            color: '#1d2d35',
            scopes: ['read'],
            features: ['scan_attachments', 'sync_projects', 'crm_logging'],
            authUrl: 'https://launchpad.37signals.com/authorization/new',
            tokenUrl: 'https://launchpad.37signals.com/authorization/token',
            apiBase: 'https://3.basecampapi.com',
            description: 'Scan Basecamp project files',
            category: 'project_management',
            docs: 'https://github.com/basecamp/bc3-api',
            configured: false, // Requires Basecamp API registration
            comingSoon: true,
            superAdminOnly: false,
        },
    };

    // ============================================
    // CHANNEL SPECIFICATIONS FOR VALIDATION
    // ============================================
    const CHANNEL_SIZE_SPECS = {
        'Instagram Feed': { width: 1080, height: 1080, aspectRatios: ['1:1', '4:5', '1.91:1'] },
        'Instagram Stories': { width: 1080, height: 1920, aspectRatios: ['9:16'] },
        'Instagram Reels': { width: 1080, height: 1920, aspectRatios: ['9:16'] },
        'Facebook Feed': { width: 1200, height: 630, aspectRatios: ['1.91:1', '1:1', '4:5'] },
        'Facebook Stories': { width: 1080, height: 1920, aspectRatios: ['9:16'] },
        'TikTok': { width: 1080, height: 1920, aspectRatios: ['9:16'] },
        'YouTube Thumbnail': { width: 1280, height: 720, aspectRatios: ['16:9'] },
        'YouTube Shorts': { width: 1080, height: 1920, aspectRatios: ['9:16'] },
        'LinkedIn Feed': { width: 1200, height: 627, aspectRatios: ['1.91:1', '1:1', '4:5'] },
        'LinkedIn Banner': { width: 1584, height: 396, aspectRatios: ['4:1'] },
        'Twitter/X Feed': { width: 1200, height: 675, aspectRatios: ['16:9', '1:1'] },
        'Pinterest Pin': { width: 1000, height: 1500, aspectRatios: ['2:3', '1:1'] },
        'Google Display': { width: 300, height: 250, aspectRatios: ['1.2:1'] },
    };

    // ============================================
    // INTEGRATION HUB CLASS
    // User-specific storage - each user has their own integrations
    // ============================================
    class IntegrationHub {
        constructor() {
            this.userEmail = window.cavUserSession?.email || 'anonymous';
            this.connections = this.loadUserData(INTEGRATION_STORAGE.CONNECTIONS, {});
            this.scanResults = this.loadUserData(INTEGRATION_STORAGE.SCAN_RESULTS, []);
            this.scanHistory = this.loadUserData(INTEGRATION_STORAGE.SCAN_HISTORY, []);
            this.settings = this.loadUserData(INTEGRATION_STORAGE.SETTINGS, this.defaultSettings());
            this.scanning = false;
            console.log(`🔗 IntegrationHub initialized for user: ${this.userEmail}`);
        }

        /**
         * Get user-specific storage key
         * Each user has their own namespace for integration data
         */
        getUserStorageKey(baseKey) {
            const sanitizedEmail = this.userEmail.replace(/[^a-zA-Z0-9]/g, '_');
            return `${baseKey}_${sanitizedEmail}`;
        }

        /**
         * Refresh user context (call when user session changes)
         */
        refreshUserContext() {
            const newEmail = window.cavUserSession?.email || 'anonymous';
            if (newEmail !== this.userEmail) {
                console.log(`🔗 IntegrationHub user changed: ${this.userEmail} -> ${newEmail}`);
                this.userEmail = newEmail;
                // Reload data for new user
                this.connections = this.loadUserData(INTEGRATION_STORAGE.CONNECTIONS, {});
                this.scanResults = this.loadUserData(INTEGRATION_STORAGE.SCAN_RESULTS, []);
                this.scanHistory = this.loadUserData(INTEGRATION_STORAGE.SCAN_HISTORY, []);
                this.settings = this.loadUserData(INTEGRATION_STORAGE.SETTINGS, this.defaultSettings());
            }
        }

        defaultSettings() {
            return {
                autoScanEnabled: false,
                scanInterval: 'daily', // hourly, daily, weekly
                notifyOnIssues: true,
                notifyVia: 'email', // email, slack, both
                emailAddress: this.userEmail !== 'anonymous' ? this.userEmail : '',
                slackWebhookUrl: '',
                importToLibrary: 'personal', // personal, team
                crmLogging: true,
            };
        }

        /**
         * Load data from user-specific storage
         */
        loadUserData(baseKey, defaultValue) {
            try {
                const key = this.getUserStorageKey(baseKey);
                const data = localStorage.getItem(key);
                return data ? JSON.parse(data) : defaultValue;
            } catch {
                return defaultValue;
            }
        }

        /**
         * Save data to user-specific storage
         */
        saveUserData(baseKey, data) {
            const key = this.getUserStorageKey(baseKey);
            localStorage.setItem(key, JSON.stringify(data));
        }

        /**
         * Legacy loadData for backward compatibility (uses user-specific storage)
         */
        loadData(key, defaultValue) {
            return this.loadUserData(key, defaultValue);
        }

        /**
         * Legacy saveData for backward compatibility (uses user-specific storage)
         */
        saveData(key, data) {
            this.saveUserData(key, data);
        }

        // ----------------------------------------
        // CONNECTION MANAGEMENT
        // ----------------------------------------
        getAvailableIntegrations() {
            return Object.entries(INTEGRATIONS).map(([key, config]) => ({
                id: key,
                ...config,
                connected: !!this.connections[key],
                connectionInfo: this.connections[key] || null,
            }));
        }

        isConnected(integrationId) {
            return !!this.connections[integrationId];
        }

        getConnection(integrationId) {
            return this.connections[integrationId] || null;
        }

        /**
         * Generate OAuth URL for a service
         */
        generateOAuthUrl(integrationId) {
            const config = INTEGRATIONS[integrationId];
            if (!config || !config.authUrl) {
                throw new Error(`Cannot generate OAuth URL for ${integrationId}`);
            }

            const clientId = this.getClientId(integrationId);
            if (!clientId) {
                throw new Error(`No OAuth client ID configured for ${integrationId}`);
            }

            const redirectUri = `${window.location.origin}/oauth/callback`;
            const state = btoa(JSON.stringify({ integrationId, timestamp: Date.now() }));
            
            // Handle scopes - can be array or object (for Slack which has bot/user scopes)
            let scopeString = '';
            if (Array.isArray(config.scopes)) {
                scopeString = config.scopes.join(' ');
            } else if (typeof config.scopes === 'object' && config.scopes.bot) {
                // For Slack, use bot scopes
                scopeString = config.scopes.bot.join(' ');
            } else if (typeof config.scopes === 'string') {
                scopeString = config.scopes;
            }
            
            const params = new URLSearchParams({
                client_id: clientId,
                redirect_uri: redirectUri,
                response_type: 'code',
                scope: scopeString,
                state: state,
                access_type: 'offline',
                prompt: 'consent',
            });

            return `${config.authUrl}?${params.toString()}`;
        }

        /**
         * Get OAuth client ID for a service
         * Priority: 1) Super admin configured credentials, 2) INTEGRATIONS config, 3) AUTH_CONFIG
         */
        getClientId(integrationId) {
            // 1. First check super admin configured credentials (platform-wide, not user-specific)
            // Check both global and legacy keys for backwards compatibility
            const savedCreds = JSON.parse(
                localStorage.getItem('cav_platform_integration_credentials') || 
                localStorage.getItem('cav_integration_credentials') || 
                '{}'
            );
            
            // Map integration IDs to credential storage keys
            const credMapping = {
                google_drive: 'google',
                google_sheets: 'google',
                gmail: 'google',
                dropbox: 'dropbox',
                slack: 'slack',
                onedrive: 'onedrive',
                outlook: 'onedrive',
                figma: 'figma',
                adobe_cc: 'adobe',
            };
            
            const credKey = credMapping[integrationId];
            if (credKey && savedCreds[credKey]?.clientId) {
                console.log(`[Integration Hub] Using super admin configured ${credKey} credentials`);
                return savedCreds[credKey].clientId;
            }
            
            // For Dropbox, use appKey instead of clientId
            if (integrationId === 'dropbox' && savedCreds.dropbox?.appKey) {
                console.log(`[Integration Hub] Using super admin configured Dropbox app key`);
                return savedCreds.dropbox.appKey;
            }
            
            // 2. Check stored settings (for custom configurations)
            const storedCreds = this.loadData('cav_oauth_credentials', {});
            if (storedCreds[integrationId]?.clientId) {
                return storedCreds[integrationId].clientId;
            }
            
            // 3. Get the Google Client ID from AUTH_CONFIG (same as used for SSO login)
            const googleClientId = window.AUTH_CONFIG?.GOOGLE_CLIENT_ID || '';
            
            // Client IDs for each service - use INTEGRATIONS config values first
            const defaultClientIds = {
                // All Google services use the same client ID from AUTH_CONFIG
                google_drive: googleClientId,
                google_sheets: googleClientId,
                gmail: googleClientId,
                // Microsoft services (need separate Azure AD app registration)
                onedrive: window.CAV_MICROSOFT_CLIENT_ID || window.AUTH_CONFIG?.MICROSOFT_CLIENT_ID || '',
                outlook: window.CAV_MICROSOFT_CLIENT_ID || window.AUTH_CONFIG?.MICROSOFT_CLIENT_ID || '',
                // Dropbox - uses appKey from INTEGRATIONS config (pre-configured)
                dropbox: INTEGRATIONS.dropbox?.appKey || window.CAV_DROPBOX_CLIENT_ID || window.AUTH_CONFIG?.DROPBOX_CLIENT_ID || '',
                // Slack - uses clientId from INTEGRATIONS config (pre-configured)
                slack: INTEGRATIONS.slack?.clientId || window.CAV_SLACK_CLIENT_ID || window.AUTH_CONFIG?.SLACK_CLIENT_ID || '',
                // Other services (need separate app registrations)
                figma: window.CAV_FIGMA_CLIENT_ID || window.AUTH_CONFIG?.FIGMA_CLIENT_ID || '',
                adobe_cc: window.CAV_ADOBE_CLIENT_ID || window.AUTH_CONFIG?.ADOBE_CLIENT_ID || '',
                wrike: window.CAV_WRIKE_CLIENT_ID || window.AUTH_CONFIG?.WRIKE_CLIENT_ID || '',
                monday: window.CAV_MONDAY_CLIENT_ID || window.AUTH_CONFIG?.MONDAY_CLIENT_ID || '',
                basecamp: window.CAV_BASECAMP_CLIENT_ID || window.AUTH_CONFIG?.BASECAMP_CLIENT_ID || '',
            };
            
            const clientId = defaultClientIds[integrationId] || '';
            
            // Log warning if no client ID found
            if (!clientId) {
                console.warn(`[Integration Hub] No OAuth client ID configured for ${integrationId}.`);
                if (['google_drive', 'google_sheets', 'gmail'].includes(integrationId)) {
                    console.warn(`[Integration Hub] Google services require AUTH_CONFIG.GOOGLE_CLIENT_ID to be set.`);
                }
            }
            
            return clientId;
        }

        /**
         * Initiate OAuth connection - uses Google Identity Services for Google products
         */
        async connect(integrationId, credentials = {}) {
            const config = INTEGRATIONS[integrationId];
            if (!config) {
                throw new Error(`Unknown integration: ${integrationId}`);
            }

            console.log(`🔗 Connecting to ${config.name}...`);

            // For Zapier (webhook-based), no OAuth needed
            if (config.webhookBased) {
                return this.setupWebhookIntegration(integrationId, credentials);
            }

            // If credentials provided (from OAuth callback), use them directly
            if (credentials.accessToken) {
                return this.completeOAuthConnection(integrationId, credentials);
            }

            // Check if this is a Google service - use Google Identity Services
            const googleServices = ['google_drive', 'google_sheets', 'gmail'];
            if (googleServices.includes(integrationId)) {
                return this.connectGoogleService(integrationId, config);
            }

            // For non-Google services, use traditional OAuth flow
            return this.connectWithOAuthPopup(integrationId, config);
        }

        /**
         * Connect to Google services using Google Identity Services (GIS)
         * Uses the same client ID as the main app SSO login
         */
        async connectGoogleService(integrationId, config) {
            const clientId = this.getClientId(integrationId);
            
            if (!clientId) {
                throw new Error(`Google OAuth not configured. Please ensure AUTH_CONFIG.GOOGLE_CLIENT_ID is set in auth-config.js`);
            }

            console.log(`🔗 Using Google Identity Services for ${config.name}`);
            console.log(`   Client ID: ${clientId.substring(0, 20)}...`);

            return new Promise((resolve, reject) => {
                // Load Google Identity Services library if not already loaded
                if (!window.google?.accounts?.oauth2) {
                    const script = document.createElement('script');
                    script.src = 'https://accounts.google.com/gsi/client';
                    script.async = true;
                    script.defer = true;
                    script.onload = () => {
                        this.initiateGoogleOAuth(integrationId, config, clientId, resolve, reject);
                    };
                    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
                    document.head.appendChild(script);
                } else {
                    this.initiateGoogleOAuth(integrationId, config, clientId, resolve, reject);
                }
            });
        }

        /**
         * Initiate Google OAuth using Token Client
         */
        initiateGoogleOAuth(integrationId, config, clientId, resolve, reject) {
            try {
                // Get scopes for this integration
                const scopes = Array.isArray(config.scopes) ? config.scopes.join(' ') : config.scopes;
                
                console.log(`🔗 Requesting scopes: ${scopes}`);

                const tokenClient = google.accounts.oauth2.initTokenClient({
                    client_id: clientId,
                    scope: scopes,
                    callback: async (tokenResponse) => {
                        if (tokenResponse.error) {
                            console.error('Google OAuth error:', tokenResponse.error);
                            reject(new Error(tokenResponse.error_description || tokenResponse.error));
                            return;
                        }

                        console.log('✅ Google OAuth successful');
                        
                        // Get user info
                        try {
                            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                                headers: { 'Authorization': `Bearer ${tokenResponse.access_token}` }
                            });
                            const userInfo = await userInfoResponse.json();

                            const connection = await this.completeOAuthConnection(integrationId, {
                                accessToken: tokenResponse.access_token,
                                expiresAt: new Date(Date.now() + (tokenResponse.expires_in * 1000)).toISOString(),
                                email: userInfo.email,
                                name: userInfo.name,
                                picture: userInfo.picture,
                            });
                            resolve(connection);
                        } catch (err) {
                            // Even if user info fails, we still have the token
                            const connection = await this.completeOAuthConnection(integrationId, {
                                accessToken: tokenResponse.access_token,
                                expiresAt: new Date(Date.now() + (tokenResponse.expires_in * 1000)).toISOString(),
                            });
                            resolve(connection);
                        }
                    },
                    error_callback: (error) => {
                        console.error('Google OAuth error callback:', error);
                        reject(new Error(error.message || 'Google OAuth failed'));
                    }
                });

                // Request the token - this opens the Google sign-in popup
                tokenClient.requestAccessToken({ prompt: 'consent' });
                
            } catch (err) {
                console.error('Failed to initiate Google OAuth:', err);
                reject(err);
            }
        }

        /**
         * Connect using traditional OAuth popup flow (for non-Google services)
         */
        async connectWithOAuthPopup(integrationId, config) {
            return new Promise((resolve, reject) => {
                const clientId = this.getClientId(integrationId);
                
                if (!clientId) {
                    // For services without client IDs, show setup instructions
                    this.showOAuthSetupInstructions(integrationId, config);
                    reject(new Error(`${config.name} requires OAuth configuration. See console for setup instructions.`));
                    return;
                }

                const oauthUrl = this.generateOAuthUrl(integrationId);
                const popup = window.open(oauthUrl, 'oauth', 'width=600,height=700,scrollbars=yes');
                
                if (!popup) {
                    reject(new Error('Popup blocked. Please allow popups for this site.'));
                    return;
                }

                // Listen for OAuth callback message
                const messageHandler = async (event) => {
                    if (event.origin !== window.location.origin) return;
                    
                    if (event.data.type === 'oauth_callback' && event.data.integrationId === integrationId) {
                        window.removeEventListener('message', messageHandler);
                        popup.close();
                        
                        if (event.data.error) {
                            reject(new Error(event.data.error));
                        } else {
                            try {
                                const connection = await this.completeOAuthConnection(integrationId, event.data);
                                resolve(connection);
                            } catch (err) {
                                reject(err);
                            }
                        }
                    }
                };

                window.addEventListener('message', messageHandler);

                // Fallback: check if popup closed without completing OAuth
                const checkClosed = setInterval(() => {
                    if (popup.closed) {
                        clearInterval(checkClosed);
                        window.removeEventListener('message', messageHandler);
                        // Don't reject immediately - user might have cancelled intentionally
                    }
                }, 1000);
            });
        }

        /**
         * Show OAuth setup instructions for services that need configuration
         */
        showOAuthSetupInstructions(integrationId, config) {
            console.log(`\n🔧 OAuth Setup Required for ${config.name}`);
            console.log(`${'='.repeat(50)}`);
            console.log(`Documentation: ${config.docs || 'See provider documentation'}`);
            console.log(`\nTo enable ${config.name} integration:`);
            console.log(`1. Create an OAuth app in the ${config.name} developer console`);
            console.log(`2. Add the client ID to auth-config.js:`);
            console.log(`   ${integrationId.toUpperCase()}_CLIENT_ID: 'your_client_id_here'`);
            console.log(`3. Add these redirect URIs to your OAuth app:`);
            console.log(`   - ${window.location.origin}/oauth/callback`);
            console.log(`   - ${window.location.origin}`);
            console.log(`\n`);
        }

        /**
         * Complete OAuth connection after receiving tokens
         */
        async completeOAuthConnection(integrationId, credentials) {
            const config = INTEGRATIONS[integrationId];
            
            const connection = {
                id: integrationId,
                name: config.name,
                connectedAt: new Date().toISOString(),
                connectedBy: window.cavUserSession?.email || 'anonymous',
                accessToken: credentials.accessToken,
                refreshToken: credentials.refreshToken || null,
                expiresAt: credentials.expiresAt || new Date(Date.now() + 3600000).toISOString(),
                accountEmail: credentials.email || window.cavUserSession?.email,
                accountName: credentials.name || window.cavUserSession?.name,
                status: 'active',
                lastSync: null,
                settings: {
                    foldersToScan: [],
                    selectedFolder: null,
                    selectedSpreadsheet: null,
                    selectedChannel: null,
                    selectedProject: null,
                    labelsToScan: [],
                    syncEnabled: true,
                },
            };

            this.connections[integrationId] = connection;
            this.saveData(INTEGRATION_STORAGE.CONNECTIONS, this.connections);

            console.log(`✅ Connected to ${config.name}`);
            return connection;
        }

        /**
         * Setup webhook-based integration (Zapier)
         */
        async setupWebhookIntegration(integrationId, options = {}) {
            const config = INTEGRATIONS[integrationId];
            
            // Generate unique webhook URL for this user
            const webhookId = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const webhookUrl = `${window.location.origin}/api/webhooks/${integrationId}/${webhookId}`;
            
            const connection = {
                id: integrationId,
                name: config.name,
                connectedAt: new Date().toISOString(),
                connectedBy: window.cavUserSession?.email || 'anonymous',
                webhookUrl: webhookUrl,
                webhookId: webhookId,
                status: 'active',
                lastSync: null,
                receivedAssets: [],
                settings: {
                    autoImport: options.autoImport || false,
                    notifyOnReceive: options.notifyOnReceive || true,
                },
            };

            this.connections[integrationId] = connection;
            this.saveData(INTEGRATION_STORAGE.CONNECTIONS, this.connections);

            console.log(`✅ ${config.name} webhook configured: ${webhookUrl}`);
            return connection;
        }

        // ----------------------------------------
        // FOLDER PICKER FUNCTIONALITY
        // ----------------------------------------
        
        /**
         * Open folder picker for cloud storage services
         */
        async openFolderPicker(integrationId) {
            const connection = this.connections[integrationId];
            if (!connection) {
                throw new Error(`Not connected to ${integrationId}`);
            }

            console.log(`📂 Opening folder picker for ${connection.name}...`);

            switch (integrationId) {
                case 'google_drive':
                    return this.openGoogleDrivePicker(connection);
                case 'dropbox':
                    return this.openDropboxChooser(connection);
                case 'onedrive':
                    return this.openOneDrivePicker(connection);
                default:
                    throw new Error(`Folder picker not available for ${integrationId}`);
            }
        }

        /**
         * Google Drive folder picker - uses custom picker built with Drive API
         * (More reliable than Google Picker API which has loading issues)
         */
        async openGoogleDrivePicker(connection) {
            // Show loading indicator
            this.showToast('📂 Loading folders...', 'info');
            
            return new Promise(async (resolve, reject) => {
                try {
                    // Use our own folder browser - more reliable than Google Picker
                    await this.showGoogleDriveFolderBrowser(connection, resolve, reject);
                } catch (error) {
                    console.error('[Integration] Folder picker error:', error);
                    this.showToast('Error loading folders: ' + error.message, 'error');
                    reject(error);
                }
            });
        }

        /**
         * Custom Google Drive folder browser using Drive API directly
         */
        async showGoogleDriveFolderBrowser(connection, resolve, reject) {
            // Show loading state first
            const loadingModal = document.createElement('div');
            loadingModal.className = 'cav-folder-picker-modal';
            loadingModal.innerHTML = `
                <div class="cav-folder-picker-content" style="text-align: center; padding: 2rem;">
                    <div class="cav-folder-loading"><svg class="cav-icon" style="width:16px;height:16px;margin-right:8px;animation:spin 1s linear infinite;"><use href="#icon-refresh"/></svg> Loading Google Drive folders...</div>
                </div>
            `;
            document.body.appendChild(loadingModal);
            
            // Fetch root folders
            const folders = await this.listGoogleDriveFolders(connection, 'root');
            
            // Remove loading modal
            loadingModal.remove();
            
            console.log('[Integration] Loaded', folders.length, 'folders');
            
            // Check if we got an authentication error (connection marked as expired)
            const isExpired = this.connections['google_drive']?.status === 'expired';
            
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'cav-folder-picker-modal';
            modal.innerHTML = `
                <div class="cav-folder-picker-content">
                    <div class="cav-folder-picker-header">
                        <h3><svg class="cav-icon" style="width:18px;height:18px;margin-right:8px;vertical-align:middle;"><use href="#icon-folder"/></svg> Select a Google Drive Folder</h3>
                        <button class="cav-folder-picker-close">&times;</button>
                    </div>
                    <div class="cav-folder-picker-breadcrumb" id="folder-breadcrumb">
                        <span class="cav-breadcrumb-item" data-id="root" data-name="My Drive"><svg class="cav-icon" style="width:14px;height:14px;margin-right:4px;vertical-align:middle;"><use href="#icon-folder"/></svg> My Drive</span>
                    </div>
                    <div class="cav-folder-picker-list" id="folder-list">
                        ${isExpired ? `
                            <div class="cav-folder-empty">
                                <p><svg class="cav-icon" style="width:16px;height:16px;margin-right:6px;vertical-align:middle;color:var(--cav-warning);"><use href="#icon-alert-triangle"/></svg> Google Drive session has expired.</p>
                                <button class="cav-btn cav-btn-primary cav-reconnect-btn" style="margin-top: 1rem;"><svg class="cav-icon" style="width:14px;height:14px;margin-right:4px;vertical-align:middle;"><use href="#icon-refresh"/></svg> Reconnect Google Drive</button>
                            </div>
                        ` : folders.length === 0 ? `
                            <div class="cav-folder-empty">
                                <p><svg class="cav-icon" style="width:16px;height:16px;margin-right:6px;vertical-align:middle;"><use href="#icon-folder"/></svg> No folders found in your Drive root.</p>
                                <p style="font-size: 0.85rem; opacity: 0.8; margin-top: 0.5rem;">This could mean:</p>
                                <ul style="font-size: 0.85rem; opacity: 0.8; text-align: left; margin: 0.5rem auto; max-width: 280px;">
                                    <li>Your Drive root has no folders (only files)</li>
                                    <li>Folders may be in "Shared with me"</li>
                                    <li>Try clicking "My Drive" to use the root folder</li>
                                </ul>
                                <button class="cav-btn cav-btn-secondary cav-show-all-items-btn" style="margin-top: 0.5rem;"><svg class="cav-icon" style="width:14px;height:14px;margin-right:4px;vertical-align:middle;"><use href="#icon-document"/></svg> Show All Items</button>
                            </div>
                        ` : ''}
                        ${folders.map(f => `
                            <div class="cav-folder-item" data-id="${f.id}" data-name="${f.name}">
                                <span class="cav-folder-icon"><svg style="width:16px;height:16px;vertical-align:middle;"><use href="#icon-folder"/></svg></span>
                                <span class="cav-folder-name">${f.name}</span>
                                <span class="cav-folder-arrow">→</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="cav-folder-picker-footer">
                        <button class="cav-btn-cancel">Cancel</button>
                        <button class="cav-btn-select-current" title="Select current folder (My Drive root)"><svg style="width:14px;height:14px;margin-right:4px;vertical-align:middle;"><use href="#icon-folder"/></svg> Use Current Folder</button>
                        <button class="cav-btn-select" disabled>Select Folder</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            
            // Handle reconnect button if present
            const reconnectBtn = modal.querySelector('.cav-reconnect-btn');
            if (reconnectBtn) {
                reconnectBtn.addEventListener('click', async () => {
                    modal.remove();
                    document.body.style.overflow = '';
                    // Disconnect and reconnect
                    this.disconnect('google_drive');
                    try {
                        await this.initiateOAuth('google_drive');
                        this.showToast('Reconnected to Google Drive!', 'success');
                        // Try opening the folder picker again
                        const newConnection = this.connections['google_drive'];
                        if (newConnection) {
                            await this.showGoogleDriveFolderBrowser(newConnection, resolve, reject);
                        }
                    } catch (err) {
                        this.showToast('Failed to reconnect: ' + err.message, 'error');
                        reject(err);
                    }
                });
            }
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';

            let selectedFolder = null;
            let currentFolderId = 'root';
            let currentFolderName = 'My Drive';
            const breadcrumbs = [{ id: 'root', name: 'My Drive' }];

            const updateFolderList = async (folderId, folderName) => {
                const listEl = modal.querySelector('#folder-list');
                listEl.innerHTML = '<div class="cav-folder-loading"><svg class="cav-icon" style="width:14px;height:14px;margin-right:6px;animation:spin 1s linear infinite;"><use href="#icon-refresh"/></svg> Loading...</div>';
                
                currentFolderId = folderId;
                currentFolderName = folderName;
                
                const subfolders = await this.listGoogleDriveFolders(connection, folderId);
                
                listEl.innerHTML = subfolders.length === 0 
                    ? '<div class="cav-folder-empty"><svg class="cav-icon" style="width:14px;height:14px;margin-right:6px;vertical-align:middle;"><use href="#icon-folder"/></svg> No subfolders. You can select this folder.</div>'
                    : subfolders.map(f => `
                        <div class="cav-folder-item" data-id="${f.id}" data-name="${f.name}">
                            <span class="cav-folder-icon"><svg style="width:16px;height:16px;vertical-align:middle;"><use href="#icon-folder"/></svg></span>
                            <span class="cav-folder-name">${f.name}</span>
                            <span class="cav-folder-arrow">→</span>
                        </div>
                    `).join('');
                
                // Re-attach click handlers
                attachFolderHandlers();
            };

            const updateBreadcrumb = () => {
                const bcEl = modal.querySelector('#folder-breadcrumb');
                bcEl.innerHTML = breadcrumbs.map((bc, i) => `
                    <span class="cav-breadcrumb-item ${i === breadcrumbs.length - 1 ? 'current' : ''}" data-id="${bc.id}" data-name="${bc.name}">
                        ${i === 0 ? '<svg style="width:12px;height:12px;margin-right:4px;vertical-align:middle;"><use href="#icon-folder"/></svg>' : '&rsaquo;'} ${bc.name}
                    </span>
                `).join('');
                
                // Attach breadcrumb click handlers
                bcEl.querySelectorAll('.cav-breadcrumb-item').forEach(item => {
                    item.addEventListener('click', async () => {
                        const idx = breadcrumbs.findIndex(b => b.id === item.dataset.id);
                        if (idx >= 0) {
                            breadcrumbs.splice(idx + 1);
                            updateBreadcrumb();
                            await updateFolderList(item.dataset.id, item.dataset.name);
                        }
                    });
                });
            };

            const attachFolderHandlers = () => {
                modal.querySelectorAll('.cav-folder-item').forEach(item => {
                    // Single click to select
                    item.addEventListener('click', (e) => {
                        e.stopPropagation();
                        modal.querySelectorAll('.cav-folder-item').forEach(i => i.classList.remove('selected'));
                        item.classList.add('selected');
                        selectedFolder = {
                            id: item.dataset.id,
                            name: item.dataset.name,
                        };
                        modal.querySelector('.cav-btn-select').disabled = false;
                    });

                    // Double click to navigate into
                    item.addEventListener('dblclick', async (e) => {
                        e.stopPropagation();
                        const folderId = item.dataset.id;
                        const folderName = item.dataset.name;
                        breadcrumbs.push({ id: folderId, name: folderName });
                        updateBreadcrumb();
                        await updateFolderList(folderId, folderName);
                    });
                });
            };

            // Initial attach
            attachFolderHandlers();

            // Cancel button
            modal.querySelector('.cav-btn-cancel').addEventListener('click', () => {
                document.body.style.overflow = '';
                modal.remove();
                resolve(null);
            });

            // Close button
            modal.querySelector('.cav-folder-picker-close').addEventListener('click', () => {
                document.body.style.overflow = '';
                modal.remove();
                resolve(null);
            });

            // Select current folder button
            modal.querySelector('.cav-btn-select-current').addEventListener('click', () => {
                const folder = { id: currentFolderId, name: currentFolderName };
                connection.settings.selectedFolder = folder;
                this.saveData(INTEGRATION_STORAGE.CONNECTIONS, this.connections);
                document.body.style.overflow = '';
                modal.remove();
                resolve(folder);
            });

            // Select button
            modal.querySelector('.cav-btn-select').addEventListener('click', () => {
                if (selectedFolder) {
                    connection.settings.selectedFolder = selectedFolder;
                    this.saveData(INTEGRATION_STORAGE.CONNECTIONS, this.connections);
                    document.body.style.overflow = '';
                    modal.remove();
                    resolve(selectedFolder);
                }
            });

            // Click outside to close
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    document.body.style.overflow = '';
                    modal.remove();
                    resolve(null);
                }
            });
            
            // Show All Items button handler (for debugging/when no folders exist)
            const showAllItemsBtn = modal.querySelector('.cav-show-all-items-btn');
            if (showAllItemsBtn) {
                showAllItemsBtn.addEventListener('click', async () => {
                    const listEl = modal.querySelector('#folder-list');
                    listEl.innerHTML = '<div class="cav-folder-loading"><svg class="cav-icon" style="width:14px;height:14px;margin-right:6px;animation:spin 1s linear infinite;"><use href="#icon-refresh"/></svg> Loading all items...</div>';
                    
                    try {
                        // Fetch all items (not just folders)
                        const allItemsQuery = "'root' in parents and trashed=false";
                        const apiUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(allItemsQuery)}&fields=files(id,name,mimeType,iconLink)&orderBy=folder,name&pageSize=100`;
                        
                        const response = await fetch(apiUrl, {
                            headers: { 
                                'Authorization': `Bearer ${connection.accessToken}`,
                                'Accept': 'application/json'
                            }
                        });
                        
                        if (!response.ok) {
                            throw new Error(`API error: ${response.status}`);
                        }
                        
                        const data = await response.json();
                        const items = data.files || [];
                        
                        console.log('[GoogleDrive] All items in root:', items);
                        
                        if (items.length === 0) {
                            listEl.innerHTML = `
                                <div class="cav-folder-empty">
                                    <p>📭 Your Google Drive root is completely empty.</p>
                                    <p style="font-size: 0.85rem; opacity: 0.8; margin-top: 0.5rem;">
                                        Add some files or folders to Google Drive first.
                                    </p>
                                </div>
                            `;
                        } else {
                            // Separate folders and files
                            const folders = items.filter(i => i.mimeType === 'application/vnd.google-apps.folder');
                            const files = items.filter(i => i.mimeType !== 'application/vnd.google-apps.folder');
                            
                            let html = '';
                            
                            if (folders.length > 0) {
                                html += folders.map(f => `
                                    <div class="cav-folder-item" data-id="${f.id}" data-name="${f.name}">
                                        <span class="cav-folder-icon"><svg style="width:16px;height:16px;vertical-align:middle;"><use href="#icon-folder"/></svg></span>
                                        <span class="cav-folder-name">${f.name}</span>
                                        <span class="cav-folder-arrow">→</span>
                                    </div>
                                `).join('');
                            }
                            
                            if (files.length > 0) {
                                html += `<div style="padding: 0.5rem; color: #888; font-size: 0.85rem; border-top: 1px solid #333; margin-top: 0.5rem;"><svg style="width:12px;height:12px;margin-right:4px;vertical-align:middle;"><use href="#icon-document"/></svg> Files (${files.length}):</div>`;
                                html += files.slice(0, 10).map(f => {
                                    const iconName = f.mimeType.includes('image') ? 'image' : 
                                                f.mimeType.includes('video') ? 'video' : 
                                                f.mimeType.includes('pdf') ? 'document' : 
                                                f.mimeType.includes('sheet') || f.mimeType.includes('excel') ? 'chart' : 
                                                f.mimeType.includes('doc') || f.mimeType.includes('word') ? 'document' : 'document';
                                    return `
                                        <div class="cav-file-item" style="padding: 0.5rem 0.75rem; display: flex; align-items: center; gap: 0.5rem; color: #aaa;">
                                            <span><svg style="width:14px;height:14px;vertical-align:middle;"><use href="#icon-${iconName}"/></svg></span>
                                            <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${f.name}</span>
                                        </div>
                                    `;
                                }).join('');
                                
                                if (files.length > 10) {
                                    html += `<div style="padding: 0.5rem; color: #666; font-size: 0.8rem;">...and ${files.length - 10} more files</div>`;
                                }
                            }
                            
                            listEl.innerHTML = html;
                            
                            // Re-attach handlers for folders
                            attachFolderHandlers();
                        }
                    } catch (err) {
                        console.error('[GoogleDrive] Error loading all items:', err);
                        listEl.innerHTML = `
                            <div class="cav-folder-empty">
                                <p><svg style="width:14px;height:14px;margin-right:6px;vertical-align:middle;color:var(--cav-danger);"><use href="#icon-x"/></svg> Error loading items: ${err.message}</p>
                            </div>
                        `;
                    }
                });
            }
        }

        /**
         * Dropbox folder chooser
         */
        async openDropboxChooser(connection) {
            return new Promise((resolve, reject) => {
                // Use Dropbox Chooser if available
                if (window.Dropbox) {
                    Dropbox.choose({
                        success: (files) => {
                            const folder = files[0];
                            connection.settings.selectedFolder = {
                                id: folder.id,
                                name: folder.name,
                                link: folder.link,
                            };
                            this.saveData(INTEGRATION_STORAGE.CONNECTIONS, this.connections);
                            resolve(folder);
                        },
                        cancel: () => resolve(null),
                        linkType: 'direct',
                        multiselect: false,
                        folderselect: true,
                    });
                } else {
                    // Fallback: show custom folder browser
                    this.showCustomFolderBrowser(connection, 'dropbox', resolve, reject);
                }
            });
        }

        /**
         * OneDrive folder picker using Microsoft Graph
         */
        async openOneDrivePicker(connection) {
            return new Promise((resolve, reject) => {
                // Use OneDrive File Picker SDK
                if (window.OneDrive) {
                    OneDrive.open({
                        clientId: this.getClientId('onedrive'),
                        action: 'query',
                        multiSelect: false,
                        advanced: {
                            filter: 'folder',
                        },
                        success: (files) => {
                            const folder = files.value[0];
                            connection.settings.selectedFolder = {
                                id: folder.id,
                                name: folder.name,
                                webUrl: folder.webUrl,
                            };
                            this.saveData(INTEGRATION_STORAGE.CONNECTIONS, this.connections);
                            resolve(folder);
                        },
                        cancel: () => resolve(null),
                        error: (err) => reject(err),
                    });
                } else {
                    // Fallback: show custom folder browser
                    this.showCustomFolderBrowser(connection, 'onedrive', resolve, reject);
                }
            });
        }

        /**
         * Custom folder browser modal (fallback)
         */
        async showCustomFolderBrowser(connection, integrationId, resolve, reject) {
            // Fetch root folder contents
            const folders = await this.listFolders(integrationId, connection, '');
            
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'cav-folder-picker-modal';
            modal.innerHTML = `
                <div class="cav-folder-picker-content">
                    <div class="cav-folder-picker-header">
                        <h3><svg class="cav-icon" style="width:18px;height:18px;margin-right:8px;vertical-align:middle;"><use href="#icon-folder"/></svg> Select a Folder</h3>
                        <button class="cav-folder-picker-close">&times;</button>
                    </div>
                    <div class="cav-folder-picker-breadcrumb">
                        <span class="cav-breadcrumb-item" data-path="">Root</span>
                    </div>
                    <div class="cav-folder-picker-list" id="folder-list">
                        ${folders.map(f => `
                            <div class="cav-folder-item" data-id="${f.id}" data-name="${f.name}" data-path="${f.path}">
                                <span class="cav-folder-icon"><svg style="width:16px;height:16px;vertical-align:middle;"><use href="#icon-folder"/></svg></span>
                                <span class="cav-folder-name">${f.name}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="cav-folder-picker-footer">
                        <button class="cav-btn-cancel">Cancel</button>
                        <button class="cav-btn-select" disabled>Select Folder</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            let selectedFolder = null;

            // Handle folder selection
            modal.querySelectorAll('.cav-folder-item').forEach(item => {
                item.addEventListener('click', () => {
                    modal.querySelectorAll('.cav-folder-item').forEach(i => i.classList.remove('selected'));
                    item.classList.add('selected');
                    selectedFolder = {
                        id: item.dataset.id,
                        name: item.dataset.name,
                        path: item.dataset.path,
                    };
                    modal.querySelector('.cav-btn-select').disabled = false;
                });

                item.addEventListener('dblclick', async () => {
                    // Navigate into folder
                    const subfolders = await this.listFolders(integrationId, connection, item.dataset.id);
                    // Update list...
                });
            });

            modal.querySelector('.cav-btn-cancel').addEventListener('click', () => {
                modal.remove();
                resolve(null);
            });

            modal.querySelector('.cav-folder-picker-close').addEventListener('click', () => {
                modal.remove();
                resolve(null);
            });

            modal.querySelector('.cav-btn-select').addEventListener('click', () => {
                if (selectedFolder) {
                    connection.settings.selectedFolder = selectedFolder;
                    this.saveData(INTEGRATION_STORAGE.CONNECTIONS, this.connections);
                    modal.remove();
                    resolve(selectedFolder);
                }
            });
        }

        /**
         * List folders from a cloud storage service
         */
        async listFolders(integrationId, connection, parentId = '') {
            switch (integrationId) {
                case 'google_drive':
                    return this.listGoogleDriveFolders(connection, parentId);
                case 'dropbox':
                    return this.listDropboxFolders(connection, parentId);
                case 'onedrive':
                    return this.listOneDriveFolders(connection, parentId);
                default:
                    return [];
            }
        }

        async listGoogleDriveFolders(connection, parentId = 'root') {
            try {
                // Check for valid access token
                if (!connection || !connection.accessToken) {
                    console.error('[GoogleDrive] No access token available');
                    this.showToast('Not authenticated. Please reconnect Google Drive.', 'error');
                    return [];
                }

                // Build query with trashed=false filter
                const parentClause = parentId === '' || parentId === 'root' 
                    ? "'root' in parents"
                    : `'${parentId}' in parents`;
                const query = `${parentClause} and mimeType='application/vnd.google-apps.folder' and trashed=false`;
                
                console.log('[GoogleDrive] Listing folders with query:', query);
                console.log('[GoogleDrive] Access token (first 20 chars):', connection.accessToken.substring(0, 20) + '...');
                
                const apiUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,parents,mimeType)&orderBy=name&pageSize=100`;
                
                console.log('[GoogleDrive] API URL:', apiUrl);
                
                const response = await fetch(apiUrl, {
                    headers: { 
                        'Authorization': `Bearer ${connection.accessToken}`,
                        'Accept': 'application/json'
                    }
                });
                
                // Check response status
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('[GoogleDrive] API Error:', response.status, errorText);
                    
                    // Handle specific error codes
                    if (response.status === 401) {
                        this.showToast('Google Drive session expired. Please reconnect.', 'warning');
                        // Mark connection as expired
                        if (this.connections['google_drive']) {
                            this.connections['google_drive'].status = 'expired';
                            this.saveData(INTEGRATION_STORAGE.CONNECTIONS, this.connections);
                        }
                    } else if (response.status === 403) {
                        this.showToast('Access denied. Please check Drive permissions.', 'error');
                    } else {
                        this.showToast(`Drive API error: ${response.status}`, 'error');
                    }
                    return [];
                }
                
                const data = await response.json();
                console.log('[GoogleDrive] API Response:', JSON.stringify(data, null, 2));
                
                // Check for error in response body
                if (data.error) {
                    console.error('[GoogleDrive] API returned error:', data.error);
                    this.showToast(`Drive error: ${data.error.message || 'Unknown error'}`, 'error');
                    return [];
                }
                
                const folders = (data.files || []).map(f => ({
                    id: f.id,
                    name: f.name,
                    path: f.id,
                    mimeType: f.mimeType,
                }));
                
                console.log('[GoogleDrive] Found', folders.length, 'folders');
                
                // If no folders found, also try listing all files to help debug
                if (folders.length === 0 && parentId === 'root') {
                    console.log('[GoogleDrive] No folders found, checking for any files...');
                    const allFilesQuery = "'root' in parents and trashed=false";
                    const allFilesUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(allFilesQuery)}&fields=files(id,name,mimeType)&pageSize=10`;
                    
                    try {
                        const allFilesResponse = await fetch(allFilesUrl, {
                            headers: { 
                                'Authorization': `Bearer ${connection.accessToken}`,
                                'Accept': 'application/json'
                            }
                        });
                        
                        if (allFilesResponse.ok) {
                            const allFilesData = await allFilesResponse.json();
                            console.log('[GoogleDrive] Sample of ALL items in root (first 10):', JSON.stringify(allFilesData.files, null, 2));
                            
                            // Count folders vs files
                            const itemFolders = (allFilesData.files || []).filter(f => f.mimeType === 'application/vnd.google-apps.folder');
                            const itemFiles = (allFilesData.files || []).filter(f => f.mimeType !== 'application/vnd.google-apps.folder');
                            
                            console.log(`[GoogleDrive] Found ${itemFolders.length} folders and ${itemFiles.length} files in sample`);
                            
                            if (allFilesData.files?.length === 0) {
                                console.log('[GoogleDrive] Your Google Drive root appears to be empty');
                            }
                        }
                    } catch (debugErr) {
                        console.log('[GoogleDrive] Debug query failed:', debugErr);
                    }
                }
                
                return folders;
                
            } catch (err) {
                console.error('[GoogleDrive] Error listing folders:', err);
                this.showToast(`Error loading folders: ${err.message}`, 'error');
                return [];
            }
        }

        async listDropboxFolders(connection, path = '') {
            try {
                const response = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${connection.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ path: path || '', recursive: false }),
                });
                const data = await response.json();
                return (data.entries || [])
                    .filter(e => e['.tag'] === 'folder')
                    .map(f => ({
                        id: f.id,
                        name: f.name,
                        path: f.path_lower,
                    }));
            } catch (err) {
                console.error('Error listing Dropbox folders:', err);
                return [];
            }
        }

        async listOneDriveFolders(connection, itemId = '') {
            try {
                const url = itemId 
                    ? `https://graph.microsoft.com/v1.0/me/drive/items/${itemId}/children?$filter=folder ne null`
                    : 'https://graph.microsoft.com/v1.0/me/drive/root/children?$filter=folder ne null';
                
                const response = await fetch(url, {
                    headers: { Authorization: `Bearer ${connection.accessToken}` }
                });
                const data = await response.json();
                return (data.value || []).map(f => ({
                    id: f.id,
                    name: f.name,
                    path: f.id,
                }));
            } catch (err) {
                console.error('Error listing OneDrive folders:', err);
                return [];
            }
        }

        disconnect(integrationId) {
            if (this.connections[integrationId]) {
                delete this.connections[integrationId];
                this.saveData(INTEGRATION_STORAGE.CONNECTIONS, this.connections);
                console.log(`🔌 Disconnected from ${INTEGRATIONS[integrationId]?.name}`);
                return true;
            }
            return false;
        }

        // ----------------------------------------
        // SCANNING FUNCTIONALITY
        // ----------------------------------------
        
        /**
         * Scan a connected service for assets
         */
        async scanService(integrationId, options = {}) {
            const connection = this.connections[integrationId];
            if (!connection) {
                throw new Error(`Not connected to ${integrationId}`);
            }

            this.scanning = true;
            console.log(`🔍 Scanning ${connection.name}...`);

            const results = {
                integrationId,
                integrationName: connection.name,
                scannedAt: new Date().toISOString(),
                totalFiles: 0,
                imagesFound: 0,
                videosFound: 0,
                issues: [],
                assets: [],
            };

            try {
                // Route to specific scanner based on integration type
                switch (integrationId) {
                    case 'google_drive':
                        await this.scanGoogleDrive(connection, results, options);
                        break;
                    case 'google_sheets':
                        await this.scanGoogleSheets(connection, results, options);
                        break;
                    case 'onedrive':
                        await this.scanOneDrive(connection, results, options);
                        break;
                    case 'gmail':
                        await this.scanGmail(connection, results, options);
                        break;
                    case 'outlook':
                        await this.scanOutlook(connection, results, options);
                        break;
                    case 'dropbox':
                        await this.scanDropbox(connection, results, options);
                        break;
                    case 'slack':
                        await this.scanSlack(connection, results, options);
                        break;
                    case 'figma':
                        await this.scanFigma(connection, results, options);
                        break;
                    case 'adobe_cc':
                        await this.scanAdobeCC(connection, results, options);
                        break;
                    case 'wrike':
                        await this.scanWrike(connection, results, options);
                        break;
                    case 'monday':
                        await this.scanMonday(connection, results, options);
                        break;
                    case 'basecamp':
                        await this.scanBasecamp(connection, results, options);
                        break;
                    case 'zapier':
                        // Zapier uses webhooks, not scanning
                        results.assets = connection.receivedAssets || [];
                        results.totalFiles = results.assets.length;
                        break;
                    default:
                        throw new Error(`No scanner for ${integrationId}`);
                }

                // Validate all found assets against channel specs
                results.assets = results.assets.map(asset => this.validateAsset(asset));
                results.issues = results.assets.filter(a => a.validationIssues.length > 0);

                // Update connection last sync
                this.connections[integrationId].lastSync = new Date().toISOString();
                this.saveData(INTEGRATION_STORAGE.CONNECTIONS, this.connections);

                // Save scan results
                this.scanResults = results.assets;
                this.saveData(INTEGRATION_STORAGE.SCAN_RESULTS, this.scanResults);

                // Add to history
                this.scanHistory.unshift({
                    id: Date.now().toString(),
                    ...results,
                    assets: results.assets.length, // Don't store full assets in history
                });
                if (this.scanHistory.length > 100) {
                    this.scanHistory = this.scanHistory.slice(0, 100);
                }
                this.saveData(INTEGRATION_STORAGE.SCAN_HISTORY, this.scanHistory);

                // Send notifications if issues found
                if (results.issues.length > 0 && this.settings.notifyOnIssues) {
                    await this.sendNotifications(results);
                }

                // Log to CRM with eligibility analysis
                await this.logToCRM(results, options.companyId);

                console.log(`✅ Scan complete: ${results.assets.length} assets found, ${results.issues.length} with issues`);
                
            } catch (error) {
                console.error(`❌ Scan failed:`, error);
                results.error = error.message;
            }

            this.scanning = false;
            return results;
        }

        // ----------------------------------------
        // SERVICE-SPECIFIC SCANNERS (REAL API IMPLEMENTATIONS)
        // ----------------------------------------

        /**
         * Scan Google Drive - with folder selection support
         * API: https://developers.google.com/drive/api/v3/about-sdk
         * Scans ALL files in a folder - images, videos, documents, everything
         */
        async scanGoogleDrive(connection, results, options) {
            console.log('📁 Scanning Google Drive...');
            console.log('📂 Folder:', connection.settings.selectedFolder?.name || 'Root');
            console.log('🔑 Token:', connection.accessToken ? 'Present (' + connection.accessToken.substring(0, 10) + '...)' : 'Missing');
            
            const folderId = connection.settings.selectedFolder?.id || 'root';
            
            // Show scanning toast
            this.showToast(`Scanning ${connection.settings.selectedFolder?.name || 'Drive'}...`, 'info');
            
            try {
                // Get ALL files in the folder (not just media)
                // Exclude Google Docs apps (they don't have downloadable content) but show everything else
                const query = folderId === 'root'
                    ? `trashed=false and mimeType != 'application/vnd.google-apps.folder'`
                    : `'${folderId}' in parents and trashed=false and mimeType != 'application/vnd.google-apps.folder'`;
                
                console.log('🔍 Query:', query);
                
                let allFiles = [];
                let pageToken = null;
                let pageCount = 0;
                
                // Paginate through all results (not just first 100)
                do {
                    const url = new URL('https://www.googleapis.com/drive/v3/files');
                    url.searchParams.set('q', query);
                    url.searchParams.set('fields', 'nextPageToken,files(id,name,mimeType,size,thumbnailLink,webContentLink,webViewLink,imageMediaMetadata,videoMediaMetadata,createdTime,modifiedTime,parents)');
                    url.searchParams.set('pageSize', '100');
                    url.searchParams.set('orderBy', 'modifiedTime desc');
                    if (pageToken) {
                        url.searchParams.set('pageToken', pageToken);
                    }
                    
                    console.log(`📄 Fetching page ${pageCount + 1}...`);
                    
                    const response = await fetch(url.toString(), {
                        headers: { 
                            'Authorization': `Bearer ${connection.accessToken}`,
                            'Accept': 'application/json'
                        }
                    });
                    
                    console.log('📡 Response status:', response.status);
                    
                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error('❌ API Error Response:', errorText);
                        
                        // Handle token expiration (401)
                        if (response.status === 401) {
                            this.showToast('Session expired. Please reconnect Google Drive.', 'warning');
                            // Mark as disconnected so user can reconnect
                            delete this.connections['google_drive'];
                            this.saveData(INTEGRATION_STORAGE.CONNECTIONS, this.connections);
                            throw new Error('Access token expired. Please reconnect Google Drive.');
                        }
                        
                        // Handle permission errors (403)
                        if (response.status === 403) {
                            this.showToast('Permission denied. Please reconnect with proper permissions.', 'error');
                            throw new Error('Permission denied. Please reconnect Google Drive with full access.');
                        }
                        
                        throw new Error(`Google Drive API error: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    console.log(`✅ Found ${(data.files || []).length} files on page ${pageCount + 1}`);
                    
                    if (data.files && data.files.length > 0) {
                        console.log('📋 Sample files:', data.files.slice(0, 3).map(f => f.name));
                    }
                    
                    allFiles = allFiles.concat(data.files || []);
                    pageToken = data.nextPageToken;
                    pageCount++;
                    
                    // Safety limit: max 10 pages (1000 files)
                    if (pageCount >= 10) {
                        console.log('⚠️ Reached pagination limit (1000 files)');
                        break;
                    }
                } while (pageToken);
                
                console.log(`📊 Total files found: ${allFiles.length}`);
                
                // Helper function to determine file type from mimeType
                const getFileType = (mimeType) => {
                    if (!mimeType) return 'file';
                    if (mimeType.startsWith('image/')) return 'image';
                    if (mimeType.startsWith('video/')) return 'video';
                    if (mimeType.startsWith('audio/')) return 'audio';
                    if (mimeType.includes('pdf')) return 'pdf';
                    if (mimeType.includes('adobe') || mimeType.includes('photoshop') || mimeType.includes('illustrator')) return 'design';
                    if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) return 'spreadsheet';
                    if (mimeType.includes('document') || mimeType.includes('word') || mimeType.includes('text')) return 'document';
                    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
                    if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('compressed')) return 'archive';
                    if (mimeType.startsWith('application/vnd.google-apps')) return 'google-doc';
                    return 'file';
                };
                
                // Helper function to get file icon name (SVG icon reference)
                const getFileIcon = (type) => {
                    const icons = {
                        'image': 'image',
                        'video': 'video',
                        'audio': 'video',
                        'pdf': 'document',
                        'design': 'image',
                        'spreadsheet': 'chart',
                        'document': 'document',
                        'presentation': 'document',
                        'archive': 'folder',
                        'google-doc': 'document',
                        'file': 'document'
                    };
                    return icons[type] || 'document';
                };

                results.totalFiles = allFiles.length;
                results.imagesFound = allFiles.filter(f => f.mimeType?.startsWith('image/')).length;
                results.videosFound = allFiles.filter(f => f.mimeType?.startsWith('video/')).length;
                results.documentsFound = allFiles.filter(f => !f.mimeType?.startsWith('image/') && !f.mimeType?.startsWith('video/')).length;
                
                results.assets = allFiles.map(f => {
                    const fileType = getFileType(f.mimeType);
                    
                    return {
                        id: `gdrive_${f.id}`,
                        externalId: f.id,
                        name: f.name,
                        type: fileType,
                        icon: getFileIcon(fileType),
                        mimeType: f.mimeType,
                        width: f.imageMediaMetadata?.width || f.videoMediaMetadata?.width || 0,
                        height: f.imageMediaMetadata?.height || f.videoMediaMetadata?.height || 0,
                        duration: f.videoMediaMetadata?.durationMillis ? f.videoMediaMetadata.durationMillis / 1000 : null,
                        size: parseInt(f.size) || 0,
                        thumbnailUrl: f.thumbnailLink,
                        downloadUrl: f.webContentLink || f.webViewLink,
                        viewUrl: f.webViewLink,
                        source: 'Google Drive',
                        sourcePath: connection.settings.selectedFolder?.name || 'Root',
                integrationId: 'google_drive',
                scannedAt: new Date().toISOString(),
                        createdAt: f.createdTime,
                        modifiedAt: f.modifiedTime,
                        canImport: fileType === 'image' || fileType === 'video' || fileType === 'pdf' || fileType === 'design',
                    };
                });
                
                console.log(`✅ Scan complete: ${results.imagesFound} images, ${results.videosFound} videos, ${results.documentsFound || 0} other files`);
                console.log(`📊 Total: ${results.totalFiles} files in folder`);
                
                // If no files found, provide helpful message
                if (results.totalFiles === 0) {
                    this.showToast(`No files found in ${connection.settings.selectedFolder?.name || 'Root'}. The folder may be empty or you may need to select a different folder.`, 'info');
                } else {
                    this.showToast(`Found ${results.totalFiles} files (${results.imagesFound} images, ${results.videosFound} videos)`, 'success');
                }
                
            } catch (error) {
                console.error('❌ Google Drive scan error:', error);
                results.assets = [];
                results.totalFiles = 0;
                results.error = error.message;
                this.showToast(`Google Drive error: ${error.message}`, 'error');
            }
        }

        /**
         * Scan Google Sheets for image URLs
         * API: https://developers.google.com/sheets/api
         * Supports: Direct URL input, sheet selection, and scanning all sheets
         */
        async scanGoogleSheets(connection, results, options) {
            console.log('📊 Scanning Google Sheets...');
            
            let spreadsheetId = connection.settings.selectedSpreadsheet?.id;
            
            // Check if user provided a URL directly
            if (options?.sheetUrl) {
                const urlMatch = options.sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
                if (urlMatch) {
                    spreadsheetId = urlMatch[1];
                    console.log('📋 Extracted sheet ID from URL:', spreadsheetId);
                }
            }
            
            if (!spreadsheetId) {
                // Show sheet picker with ability to enter URL
                console.log('📋 No sheet selected, listing available spreadsheets...');
                results.needsSelection = true;
                results.selectionType = 'sheets';
                results.availableSpreadsheets = await this.listGoogleSpreadsheets(connection);
                results.message = 'Select a spreadsheet or enter a Google Sheets URL';
                this.showToast('Please select a spreadsheet to scan', 'info');
                return;
            }
            
            this.showToast(`Scanning spreadsheet...`, 'info');
            
            try {
                // Get spreadsheet data
                const response = await fetch(
                    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?includeGridData=true`,
                    {
                        headers: { Authorization: `Bearer ${connection.accessToken}` }
                    }
                );
                
                if (!response.ok) {
                    if (response.status === 401) {
                        this.showToast('Session expired. Please reconnect Google Sheets.', 'warning');
                        throw new Error('Access token expired. Please reconnect.');
                    }
                    if (response.status === 403) {
                        throw new Error('Permission denied. Make sure you have access to this spreadsheet.');
                    }
                    throw new Error(`Google Sheets API error: ${response.status}`);
                }
                
                const spreadsheet = await response.json();
                console.log('📊 Spreadsheet:', spreadsheet.properties?.title);
                console.log('📋 Sheets:', spreadsheet.sheets?.map(s => s.properties?.title));
                
                const imageUrls = [];
                const videoUrls = [];
                const allUrls = [];
                
                // Scan all sheets for URLs
                for (const sheet of spreadsheet.sheets || []) {
                    const sheetName = sheet.properties?.title;
                    console.log(`📋 Scanning sheet: ${sheetName}`);
                    
                    const gridData = sheet.data?.[0];
                    if (!gridData?.rowData) continue;
                    
                    for (let rowIdx = 0; rowIdx < gridData.rowData.length; rowIdx++) {
                        const row = gridData.rowData[rowIdx];
                        for (let colIdx = 0; colIdx < (row.values || []).length; colIdx++) {
                            const cell = row.values[colIdx];
                            
                            // Get cell value
                            const value = cell.formattedValue || cell.userEnteredValue?.stringValue || '';
                            const hyperlink = cell.hyperlink;
                            const formula = cell.userEnteredValue?.formulaValue || '';
                            
                            // Detect image URLs
                            const imageMatch = value.match(/https?:\/\/[^\s"'<>]+\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)/gi);
                            if (imageMatch) {
                                imageUrls.push(...imageMatch.map(url => ({
                                    url, sheet: sheetName, row: rowIdx + 1, col: colIdx + 1, type: 'image'
                                })));
                            }
                            
                            // Detect video URLs
                            const videoMatch = value.match(/https?:\/\/[^\s"'<>]+\.(mp4|mov|avi|webm|mkv)/gi);
                            if (videoMatch) {
                                videoUrls.push(...videoMatch.map(url => ({
                                    url, sheet: sheetName, row: rowIdx + 1, col: colIdx + 1, type: 'video'
                                })));
                            }
                            
                            // Check hyperlinks
                            if (hyperlink) {
                                if (/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(hyperlink)) {
                                    imageUrls.push({ url: hyperlink, sheet: sheetName, row: rowIdx + 1, col: colIdx + 1, type: 'image' });
                                } else if (/\.(mp4|mov|avi|webm)(\?|$)/i.test(hyperlink)) {
                                    videoUrls.push({ url: hyperlink, sheet: sheetName, row: rowIdx + 1, col: colIdx + 1, type: 'video' });
                                } else {
                                    allUrls.push({ url: hyperlink, sheet: sheetName, row: rowIdx + 1, col: colIdx + 1, type: 'link' });
                                }
                            }
                            
                            // Check for IMAGE() formulas
                            if (formula.includes('IMAGE(')) {
                                const imgMatch = formula.match(/IMAGE\s*\(\s*"([^"]+)"/i);
                                if (imgMatch) {
                                    imageUrls.push({ url: imgMatch[1], sheet: sheetName, row: rowIdx + 1, col: colIdx + 1, type: 'image' });
                                }
                            }
                            
                            // Detect Google Drive links
                            const driveMatch = value.match(/https?:\/\/drive\.google\.com\/[^\s"'<>]+/gi);
                            if (driveMatch) {
                                allUrls.push(...driveMatch.map(url => ({
                                    url, sheet: sheetName, row: rowIdx + 1, col: colIdx + 1, type: 'drive'
                                })));
                            }
                        }
                    }
                }
                
                // Dedupe URLs
                const uniqueImages = [...new Map(imageUrls.map(item => [item.url, item])).values()];
                const uniqueVideos = [...new Map(videoUrls.map(item => [item.url, item])).values()];
                const uniqueOther = [...new Map(allUrls.map(item => [item.url, item])).values()];
                
                results.totalFiles = uniqueImages.length + uniqueVideos.length + uniqueOther.length;
                results.imagesFound = uniqueImages.length;
                results.videosFound = uniqueVideos.length;
                results.linksFound = uniqueOther.length;
                
                console.log(`✅ Found: ${results.imagesFound} images, ${results.videosFound} videos, ${results.linksFound} links`);
                
                // Build assets array
                const allAssets = [
                    ...uniqueImages.map((item, idx) => ({
                        id: `gsheets_img_${Date.now()}_${idx}`,
                        externalId: item.url,
                        name: item.url.split('/').pop()?.split('?')[0] || `image_${idx + 1}`,
                        type: 'image',
                        icon: '🖼️',
                        url: item.url,
                        width: 0,
                        height: 0,
                        size: 0,
                        source: 'Google Sheets',
                        sourcePath: `${spreadsheet.properties?.title} > ${item.sheet} (Row ${item.row})`,
                        integrationId: 'google_sheets',
                        scannedAt: new Date().toISOString(),
                        canImport: true,
                    })),
                    ...uniqueVideos.map((item, idx) => ({
                        id: `gsheets_vid_${Date.now()}_${idx}`,
                        externalId: item.url,
                        name: item.url.split('/').pop()?.split('?')[0] || `video_${idx + 1}`,
                        type: 'video',
                        icon: '🎬',
                        url: item.url,
                        width: 0,
                        height: 0,
                        size: 0,
                        source: 'Google Sheets',
                        sourcePath: `${spreadsheet.properties?.title} > ${item.sheet} (Row ${item.row})`,
                        integrationId: 'google_sheets',
                        scannedAt: new Date().toISOString(),
                        canImport: true,
                    })),
                    ...uniqueOther.map((item, idx) => ({
                        id: `gsheets_link_${Date.now()}_${idx}`,
                        externalId: item.url,
                        name: item.url.split('/').pop()?.split('?')[0] || `link_${idx + 1}`,
                        type: item.type === 'drive' ? 'drive-link' : 'link',
                        icon: item.type === 'drive' ? '📁' : '🔗',
                        url: item.url,
                        width: 0,
                        height: 0,
                        size: 0,
                        source: 'Google Sheets',
                        sourcePath: `${spreadsheet.properties?.title} > ${item.sheet} (Row ${item.row})`,
                        integrationId: 'google_sheets',
                        scannedAt: new Date().toISOString(),
                        canImport: item.type === 'drive',
                    })),
                ];
                
                results.assets = allAssets;
                
                if (results.totalFiles === 0) {
                    this.showToast(`No images or links found in "${spreadsheet.properties?.title}"`, 'info');
                } else {
                    this.showToast(`Found ${results.totalFiles} items in "${spreadsheet.properties?.title}"`, 'success');
                }
                
            } catch (error) {
                console.error('Google Sheets scan error:', error);
                results.error = error.message;
                this.showToast(`Error: ${error.message}`, 'error');
            }
        }

        /**
         * Open Google Sheets picker modal
         */
        async openSheetsPicker(connection) {
            return new Promise(async (resolve, reject) => {
                const sheets = await this.listGoogleSpreadsheets(connection);
                
                const modal = document.createElement('div');
                modal.className = 'cav-sheets-picker-modal';
                modal.innerHTML = `
                    <div class="cav-sheets-picker-content">
                        <div class="cav-sheets-picker-header">
                            <h3>📊 Select a Spreadsheet</h3>
                            <button class="cav-sheets-picker-close">&times;</button>
                        </div>
                        <div class="cav-sheets-url-input">
                            <label>Or paste a Google Sheets URL:</label>
                            <input type="url" id="sheets-url-input" placeholder="https://docs.google.com/spreadsheets/d/...">
                            <button class="cav-btn-use-url">Use URL</button>
                        </div>
                        <div class="cav-sheets-picker-list">
                            ${sheets.length > 0 ? sheets.map(s => `
                                <div class="cav-sheet-item" data-id="${s.id}" data-name="${s.name}">
                                    <span class="cav-sheet-icon">📊</span>
                                    <span class="cav-sheet-name">${s.name}</span>
                                    <span class="cav-sheet-date">${new Date(s.modifiedTime).toLocaleDateString()}</span>
                                </div>
                            `).join('') : '<p class="no-sheets">No spreadsheets found in your Drive</p>'}
                        </div>
                    </div>
                `;
                
                document.body.appendChild(modal);
                
                // Handle URL input
                modal.querySelector('.cav-btn-use-url').addEventListener('click', () => {
                    const url = modal.querySelector('#sheets-url-input').value;
                    if (url) {
                        const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
                        if (match) {
                            modal.remove();
                            resolve({ id: match[1], name: 'URL Import', url: url });
                        } else {
                            this.showToast('Invalid Google Sheets URL', 'error');
                        }
                    }
                });
                
                // Handle sheet selection
                modal.querySelectorAll('.cav-sheet-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const sheet = { id: item.dataset.id, name: item.dataset.name };
                        connection.settings.selectedSpreadsheet = sheet;
                        this.saveData(INTEGRATION_STORAGE.CONNECTIONS, this.connections);
                        modal.remove();
                        resolve(sheet);
                    });
                });
                
                // Handle close
                modal.querySelector('.cav-sheets-picker-close').addEventListener('click', () => {
                    modal.remove();
                    resolve(null);
                });
            });
        }

        async listGoogleSpreadsheets(connection) {
            try {
                const query = "mimeType='application/vnd.google-apps.spreadsheet'";
                const response = await fetch(
                    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,modifiedTime)&pageSize=50&orderBy=modifiedTime desc`,
                    {
                        headers: { Authorization: `Bearer ${connection.accessToken}` }
                    }
                );
                
                if (!response.ok) {
                    console.error('Error listing spreadsheets:', response.status);
                    return [];
                }
                
                const data = await response.json();
                console.log('📋 Found spreadsheets:', data.files?.length || 0);
                return data.files || [];
            } catch (error) {
                console.error('Error listing spreadsheets:', error);
                return [];
            }
        }

        /**
         * Scan Slack channels for shared files
         * API: https://api.slack.com/apis/connections/events-api
         */
        async scanSlack(connection, results, options) {
            console.log('💬 Scanning Slack for shared files...');
            
            const channelId = connection.settings.selectedChannel?.id;
            
            try {
                // If no channel selected, list available channels
                if (!channelId) {
                    results.needsSelection = true;
                    results.availableChannels = await this.listSlackChannels(connection);
                    return;
                }
                
                // Fetch files from channel
                const response = await fetch(
                    `https://slack.com/api/files.list?channel=${channelId}&types=images,videos&count=100`,
                    {
                        headers: { Authorization: `Bearer ${connection.accessToken}` }
                    }
                );
                
                const data = await response.json();
                
                if (!data.ok) {
                    throw new Error(data.error || 'Slack API error');
                }
                
                const files = data.files || [];
                
                results.totalFiles = files.length;
                results.imagesFound = files.filter(f => f.mimetype?.startsWith('image/')).length;
                results.videosFound = files.filter(f => f.mimetype?.startsWith('video/')).length;
                
                results.assets = files.map(f => ({
                    id: `slack_${f.id}`,
                    externalId: f.id,
                    name: f.name,
                    type: f.mimetype?.startsWith('video/') ? 'video' : 'image',
                    mimeType: f.mimetype,
                    width: f.original_w || 0,
                    height: f.original_h || 0,
                    size: f.size || 0,
                    thumbnailUrl: f.thumb_360 || f.thumb_160,
                    downloadUrl: f.url_private_download,
                    source: 'Slack',
                    sourcePath: connection.settings.selectedChannel?.name || 'Unknown',
                    sharedBy: f.user,
                    integrationId: 'slack',
                    scannedAt: new Date().toISOString(),
                    createdAt: new Date(f.created * 1000).toISOString(),
                canImport: true,
            }));
                
            } catch (error) {
                console.error('Slack scan error:', error);
                results.error = error.message;
            }
        }

        async listSlackChannels(connection) {
            try {
                const response = await fetch(
                    'https://slack.com/api/conversations.list?types=public_channel,private_channel&limit=100',
                    {
                        headers: { Authorization: `Bearer ${connection.accessToken}` }
                    }
                );
                const data = await response.json();
                return (data.channels || []).map(c => ({
                    id: c.id,
                    name: c.name,
                    isPrivate: c.is_private,
                    memberCount: c.num_members,
                }));
            } catch (error) {
                console.error('Error listing Slack channels:', error);
                return [];
            }
        }

        /**
         * Setup Slack webhook for real-time file scanning
         */
        async setupSlackWebhook(connection, webhookUrl) {
            connection.settings.incomingWebhookUrl = webhookUrl;
            this.saveData(INTEGRATION_STORAGE.CONNECTIONS, this.connections);
            
            console.log('🔗 Slack webhook configured for real-time file scanning');
            return { success: true, webhookUrl };
        }

        /**
         * Scan Figma projects for exportable assets
         * API: https://www.figma.com/developers/api
         */
        async scanFigma(connection, results, options) {
            console.log('🎨 Scanning Figma for assets...');
            
            const projectId = connection.settings.selectedProject?.id;
            
            try {
                if (!projectId) {
                    // List user's projects
                    results.needsSelection = true;
                    results.availableProjects = await this.listFigmaProjects(connection);
                    return;
                }
                
                // Get project files
                const filesResponse = await fetch(
                    `https://api.figma.com/v1/projects/${projectId}/files`,
                    {
                        headers: { 'X-Figma-Token': connection.accessToken }
                    }
                );
                
                const filesData = await filesResponse.json();
                const allAssets = [];
                
                // For each file, get frames/components
                for (const file of filesData.files || []) {
                    const fileResponse = await fetch(
                        `https://api.figma.com/v1/files/${file.key}?depth=2`,
                        {
                            headers: { 'X-Figma-Token': connection.accessToken }
                        }
                    );
                    
                    const fileData = await fileResponse.json();
                    
                    // Find exportable frames/components
                    const exportables = this.findFigmaExportables(fileData.document, file);
                    allAssets.push(...exportables);
                }
                
                results.totalFiles = allAssets.length;
                results.imagesFound = allAssets.length;
                results.videosFound = 0;
                results.assets = allAssets;
                
            } catch (error) {
                console.error('Figma scan error:', error);
                results.error = error.message;
            }
        }

        findFigmaExportables(node, file, parentPath = '') {
            const exportables = [];
            const path = parentPath ? `${parentPath}/${node.name}` : node.name;
            
            // Check if this node is exportable (frame, component, or has export settings)
            if (node.type === 'FRAME' || node.type === 'COMPONENT' || node.exportSettings?.length > 0) {
                exportables.push({
                    id: `figma_${file.key}_${node.id}`,
                    externalId: node.id,
                    fileKey: file.key,
                    name: node.name,
                    type: 'image',
                    nodeType: node.type,
                    width: Math.round(node.absoluteBoundingBox?.width || 0),
                    height: Math.round(node.absoluteBoundingBox?.height || 0),
                    size: 0,
                    source: 'Figma',
                    sourcePath: `${file.name}/${path}`,
                    integrationId: 'figma',
                    scannedAt: new Date().toISOString(),
                    canImport: true,
                    exportFormats: ['PNG', 'JPG', 'SVG', 'PDF'],
                });
            }
            
            // Recurse into children
            if (node.children) {
                for (const child of node.children) {
                    exportables.push(...this.findFigmaExportables(child, file, path));
                }
            }
            
            return exportables;
        }

        async listFigmaProjects(connection) {
            try {
                // Get user's teams first
                const teamsResponse = await fetch('https://api.figma.com/v1/me', {
                    headers: { 'X-Figma-Token': connection.accessToken }
                });
                const userData = await teamsResponse.json();
                
                // Then get projects for each team
                const projects = [];
                // For personal files
                projects.push({ id: 'recent', name: 'Recent Files', type: 'recent' });
                
                return projects;
            } catch (error) {
                console.error('Error listing Figma projects:', error);
                return [];
            }
        }

        /**
         * Scan Adobe Creative Cloud Libraries
         * API: https://developer.adobe.com/creative-cloud-libraries/docs/
         */
        async scanAdobeCC(connection, results, options) {
            console.log('🅰️ Scanning Adobe Creative Cloud Libraries...');
            
            try {
                // List CC Libraries
                const librariesResponse = await fetch(
                    'https://cc-libraries.adobe.io/api/v1/libraries',
                    {
                        headers: {
                            'Authorization': `Bearer ${connection.accessToken}`,
                            'x-api-key': this.getClientId('adobe_cc'),
                        }
                    }
                );
                
                const librariesData = await librariesResponse.json();
                const allAssets = [];
                
                // Get assets from each library
                for (const library of librariesData.libraries || []) {
                    const elementsResponse = await fetch(
                        `https://cc-libraries.adobe.io/api/v1/libraries/${library.id}/elements`,
                        {
                            headers: {
                                'Authorization': `Bearer ${connection.accessToken}`,
                                'x-api-key': this.getClientId('adobe_cc'),
                            }
                        }
                    );
                    
                    const elementsData = await elementsResponse.json();
                    
                    // Filter for image/graphic elements
                    const imageElements = (elementsData.elements || []).filter(e => 
                        e.type === 'image' || e.type === 'graphic' || e.type === 'color'
                    );
                    
                    for (const element of imageElements) {
                        allAssets.push({
                            id: `adobe_${library.id}_${element.id}`,
                            externalId: element.id,
                            libraryId: library.id,
                            name: element.name,
                            type: 'image',
                            elementType: element.type,
                            width: element.representations?.[0]?.width || 0,
                            height: element.representations?.[0]?.height || 0,
                            size: 0,
                            thumbnailUrl: element.representations?.[0]?.storage_href,
                            source: 'Adobe CC',
                            sourcePath: library.name,
                            integrationId: 'adobe_cc',
                            scannedAt: new Date().toISOString(),
                            canImport: true,
                        });
                    }
                }
                
                results.totalFiles = allAssets.length;
                results.imagesFound = allAssets.length;
                results.videosFound = 0;
                results.assets = allAssets;
                
            } catch (error) {
                console.error('Adobe CC scan error:', error);
                results.error = error.message;
            }
        }

        /**
         * Handle incoming Zapier webhook data
         */
        async handleZapierWebhook(webhookId, payload) {
            console.log('⚡ Received Zapier webhook:', webhookId);
            
            const connection = Object.values(this.connections).find(c => c.webhookId === webhookId);
            if (!connection) {
                throw new Error('Unknown webhook ID');
            }
            
            // Parse the payload for asset data
            const assets = this.parseZapierPayload(payload);
            
            // Add to received assets
            connection.receivedAssets = connection.receivedAssets || [];
            connection.receivedAssets.push(...assets);
            connection.lastSync = new Date().toISOString();
            
            this.saveData(INTEGRATION_STORAGE.CONNECTIONS, this.connections);
            
            // Auto-import if enabled
            if (connection.settings.autoImport) {
                await this.importMultiple(assets);
            }
            
            // Notify if enabled
            if (connection.settings.notifyOnReceive) {
                this.showToast(`📥 Received ${assets.length} asset(s) from Zapier`);
            }
            
            return { success: true, assetsReceived: assets.length };
        }

        parseZapierPayload(payload) {
            // Handle various Zapier payload formats
            const assets = [];
            
            // If payload is an array of files
            if (Array.isArray(payload)) {
                for (const item of payload) {
                    assets.push(this.normalizeAssetFromPayload(item, 'zapier'));
                }
            } 
            // If payload has a files array
            else if (payload.files) {
                for (const file of payload.files) {
                    assets.push(this.normalizeAssetFromPayload(file, 'zapier'));
                }
            }
            // If payload is a single file
            else if (payload.url || payload.file_url || payload.image_url) {
                assets.push(this.normalizeAssetFromPayload(payload, 'zapier'));
            }
            
            return assets;
        }

        normalizeAssetFromPayload(item, source) {
            const url = item.url || item.file_url || item.image_url || item.src;
            const name = item.name || item.filename || item.title || url?.split('/').pop() || 'untitled';
            
            return {
                id: `${source}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                externalId: item.id || null,
                name: name,
                type: this.detectAssetType(name, item.mime_type || item.mimeType),
                url: url,
                width: item.width || 0,
                height: item.height || 0,
                size: item.size || item.file_size || 0,
                source: source.charAt(0).toUpperCase() + source.slice(1),
                integrationId: source,
                scannedAt: new Date().toISOString(),
                canImport: !!url,
                metadata: item,
            };
        }

        detectAssetType(filename, mimeType) {
            if (mimeType?.startsWith('video/')) return 'video';
            if (mimeType?.startsWith('image/')) return 'image';
            
            const ext = filename?.split('.').pop()?.toLowerCase();
            const videoExts = ['mp4', 'mov', 'avi', 'webm', 'mkv'];
            const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
            
            if (videoExts.includes(ext)) return 'video';
            if (imageExts.includes(ext)) return 'image';
            
            return 'image'; // Default
        }

        /**
         * Get image dimensions from URL
         */
        async getImageDimensions(url) {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve({ width: img.width, height: img.height });
                img.onerror = () => resolve({ width: 0, height: 0 });
                img.src = url;
            });
        }

        /**
         * Return empty results when API fails (no demo data)
         */
        getEmptyResults(integrationId, errorMessage) {
            return [];
        }

        /**
         * Scan OneDrive with folder selection
         * API: https://docs.microsoft.com/en-us/onedrive/developer/
         */
        async scanOneDrive(connection, results, options) {
            console.log('☁️ Scanning OneDrive...');
            
            const folderId = connection.settings.selectedFolder?.id;
            
            try {
                const url = folderId 
                    ? `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}/children?$filter=file ne null`
                    : 'https://graph.microsoft.com/v1.0/me/drive/root/children?$filter=file ne null';
                
                const response = await fetch(url, {
                    headers: { Authorization: `Bearer ${connection.accessToken}` }
                });
                
                if (!response.ok) {
                    throw new Error(`OneDrive API error: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Filter for images and videos
                const mediaFiles = (data.value || []).filter(f => {
                    const mimeType = f.file?.mimeType || '';
                    return mimeType.startsWith('image/') || mimeType.startsWith('video/');
                });

                results.totalFiles = mediaFiles.length;
                results.imagesFound = mediaFiles.filter(f => f.file?.mimeType?.startsWith('image/')).length;
                results.videosFound = mediaFiles.filter(f => f.file?.mimeType?.startsWith('video/')).length;
                
                results.assets = mediaFiles.map(f => ({
                    id: `onedrive_${f.id}`,
                    externalId: f.id,
                    name: f.name,
                    type: f.file?.mimeType?.startsWith('video/') ? 'video' : 'image',
                    mimeType: f.file?.mimeType,
                    width: f.image?.width || f.video?.width || 0,
                    height: f.image?.height || f.video?.height || 0,
                    duration: f.video?.duration ? f.video.duration / 1000 : null,
                    size: f.size || 0,
                    thumbnailUrl: f.thumbnails?.[0]?.medium?.url,
                    downloadUrl: f['@microsoft.graph.downloadUrl'],
                    source: 'OneDrive',
                    sourcePath: connection.settings.selectedFolder?.name || 'Root',
                integrationId: 'onedrive',
                scannedAt: new Date().toISOString(),
                    createdAt: f.createdDateTime,
                canImport: true,
            }));
                
            } catch (error) {
                console.error('OneDrive scan error:', error);
                results.assets = [];
                results.totalFiles = 0;
                results.error = error.message;
                this.showToast(`OneDrive error: ${error.message}`, 'error');
            }
        }

        /**
         * Scan Gmail for attachments with advanced filtering
         * API: https://developers.google.com/gmail/api
         * Supports filtering by: domain, sender, label/folder, date range, subject
         */
        async scanGmail(connection, results, options) {
            console.log('✉️ Scanning Gmail attachments...');
            
            // Build Gmail search query based on filters
            const filters = connection.settings?.gmailFilters || {};
            let queryParts = ['has:attachment filename:(jpg OR jpeg OR png OR gif OR webp OR mp4 OR mov OR avi OR pdf)'];
            
            // Add domain filter (e.g., "from:@company.com")
            if (filters.domain) {
                queryParts.push(`from:@${filters.domain.replace('@', '')}`);
                console.log(`📧 Filtering by domain: ${filters.domain}`);
            }
            
            // Add specific sender filter (e.g., "from:john@example.com")
            if (filters.sender) {
                queryParts.push(`from:${filters.sender}`);
                console.log(`📧 Filtering by sender: ${filters.sender}`);
            }
            
            // Add label/folder filter (e.g., "label:inbox" or "label:work")
            if (filters.label) {
                queryParts.push(`label:${filters.label}`);
                console.log(`📁 Filtering by label: ${filters.label}`);
            }
            
            // Add subject filter
            if (filters.subject) {
                queryParts.push(`subject:${filters.subject}`);
                console.log(`📝 Filtering by subject: ${filters.subject}`);
            }
            
            // Add date range filter
            if (filters.afterDate) {
                queryParts.push(`after:${filters.afterDate}`);
                console.log(`📅 After date: ${filters.afterDate}`);
            }
            if (filters.beforeDate) {
                queryParts.push(`before:${filters.beforeDate}`);
                console.log(`📅 Before date: ${filters.beforeDate}`);
            }
            
            const searchQuery = queryParts.join(' ');
            console.log('🔍 Gmail query:', searchQuery);
            
            this.showToast(`Scanning Gmail${filters.domain ? ` (${filters.domain})` : ''}...`, 'info');
            
            try {
                // First, get available labels for reference
                if (!filters.domain && !filters.sender && !filters.label) {
                    results.needsFilter = true;
                    results.availableLabels = await this.listGmailLabels(connection);
                    results.filterMessage = 'Configure filters to scan specific emails';
                    this.showToast('📧 Set Gmail filters to narrow your search', 'info');
                }
                
                // Search for emails with attachments
                const listResponse = await fetch(
                    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(searchQuery)}&maxResults=100`,
                    {
                        headers: { Authorization: `Bearer ${connection.accessToken}` }
                    }
                );
                
                if (!listResponse.ok) {
                    if (listResponse.status === 401) {
                        this.showToast('Session expired. Please reconnect Gmail.', 'warning');
                        throw new Error('Access token expired. Please reconnect Gmail.');
                    }
                    throw new Error(`Gmail API error: ${listResponse.status}`);
                }
                
                const listData = await listResponse.json();
                const messages = listData.messages || [];
                console.log(`📬 Found ${messages.length} emails matching filters`);
                
                const attachments = [];
                
                // Get attachment details from each message (process up to 50)
                const maxMessages = Math.min(messages.length, 50);
                for (let i = 0; i < maxMessages; i++) {
                    const msg = messages[i];
                    
                    const msgResponse = await fetch(
                        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
                        {
                            headers: { Authorization: `Bearer ${connection.accessToken}` }
                        }
                    );
                    
                    if (msgResponse.ok) {
                        const msgData = await msgResponse.json();
                        const subject = msgData.payload?.headers?.find(h => h.name === 'Subject')?.value || 'No Subject';
                        const from = msgData.payload?.headers?.find(h => h.name === 'From')?.value || 'Unknown';
                        const date = msgData.payload?.headers?.find(h => h.name === 'Date')?.value || '';
                        const labels = msgData.labelIds || [];
                        
                        // Extract sender domain
                        const senderMatch = from.match(/@([^\s>]+)/);
                        const senderDomain = senderMatch ? senderMatch[1] : 'unknown';
                        
                        // Recursively find attachments in message parts
                        const findAttachments = (parts, parentPath = '') => {
                            if (!parts) return;
                            for (const part of parts) {
                                if (part.filename && part.body?.attachmentId) {
                                    const ext = part.filename.split('.').pop()?.toLowerCase();
                                    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
                                    const videoExts = ['mp4', 'mov', 'avi', 'webm', 'mkv'];
                                    const docExts = ['pdf'];
                                    
                                    let type = 'file';
                                    let icon = '📎';
                                    
                                    if (imageExts.includes(ext)) {
                                        type = 'image';
                                        icon = '🖼️';
                                    } else if (videoExts.includes(ext)) {
                                        type = 'video';
                                        icon = '🎬';
                                    } else if (docExts.includes(ext)) {
                                        type = 'pdf';
                                        icon = '📕';
                                    }
                                    
                                    attachments.push({
                                        id: `gmail_${msg.id}_${part.body.attachmentId}`,
                                        externalId: part.body.attachmentId,
                                        messageId: msg.id,
                                        name: part.filename,
                                        type: type,
                                        icon: icon,
                                        mimeType: part.mimeType,
                                        size: parseInt(part.body.size) || 0,
                                        width: 0,
                                        height: 0,
                                        source: 'Gmail',
                                        sourcePath: `From: ${from.split('<')[0].trim()}`,
                                        emailSubject: subject,
                                        emailFrom: from,
                                        emailDate: date,
                                        senderDomain: senderDomain,
                                        labels: labels,
                                        integrationId: 'gmail',
                                        scannedAt: new Date().toISOString(),
                                        canImport: type === 'image' || type === 'video' || type === 'pdf',
                                    });
                                }
                                
                                // Check nested parts
                                if (part.parts) {
                                    findAttachments(part.parts, part.partId);
                                }
                            }
                        };
                        
                        findAttachments(msgData.payload?.parts);
                        
                        // Also check direct body attachments
                        if (msgData.payload?.body?.attachmentId && msgData.payload?.filename) {
                            const ext = msgData.payload.filename.split('.').pop()?.toLowerCase();
                            const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
                            if (imageExts.includes(ext)) {
                                attachments.push({
                                    id: `gmail_${msg.id}_${msgData.payload.body.attachmentId}`,
                                    externalId: msgData.payload.body.attachmentId,
                                    messageId: msg.id,
                                    name: msgData.payload.filename,
                                    type: 'image',
                                    icon: '🖼️',
                                    mimeType: msgData.payload.mimeType,
                                    size: parseInt(msgData.payload.body.size) || 0,
                                    source: 'Gmail',
                                    sourcePath: `From: ${from.split('<')[0].trim()}`,
                                    emailSubject: subject,
                                    emailFrom: from,
                                    senderDomain: senderDomain,
                integrationId: 'gmail',
                scannedAt: new Date().toISOString(),
                canImport: true,
                                });
                            }
                        }
                    }
                }
                
                results.totalFiles = attachments.length;
                results.imagesFound = attachments.filter(a => a.type === 'image').length;
                results.videosFound = attachments.filter(a => a.type === 'video').length;
                results.documentsFound = attachments.filter(a => a.type === 'pdf').length;
                results.assets = attachments;
                results.emailsScanned = maxMessages;
                
                // Show unique domains found
                const domains = [...new Set(attachments.map(a => a.senderDomain))];
                results.uniqueDomains = domains;
                
                console.log(`✅ Found ${attachments.length} attachments from ${domains.length} unique domains`);
                
                if (attachments.length === 0) {
                    this.showToast(`📧 No attachments found matching your filters`, 'info');
                } else {
                    this.showToast(`Found ${attachments.length} attachments from ${maxMessages} emails`, 'success');
                }
                
            } catch (error) {
                console.error('Gmail scan error:', error);
                results.assets = [];
                results.totalFiles = 0;
                results.error = error.message;
                this.showToast(`Gmail error: ${error.message}`, 'error');
            }
        }

        /**
         * List Gmail labels (folders)
         */
        async listGmailLabels(connection) {
            try {
                const response = await fetch(
                    'https://gmail.googleapis.com/gmail/v1/users/me/labels',
                    {
                        headers: { Authorization: `Bearer ${connection.accessToken}` }
                    }
                );
                
                if (!response.ok) return [];
                
                const data = await response.json();
                return (data.labels || []).map(l => ({
                    id: l.id,
                    name: l.name,
                    type: l.type
                }));
            } catch (error) {
                console.error('Error listing Gmail labels:', error);
                return [];
            }
        }

        /**
         * Open Gmail filter settings modal
         */
        async openGmailFilters(connection) {
            return new Promise(async (resolve) => {
                const labels = await this.listGmailLabels(connection);
                const currentFilters = connection.settings?.gmailFilters || {};
                
                const modal = document.createElement('div');
                modal.className = 'cav-gmail-filter-modal';
                modal.innerHTML = `
                    <div class="cav-gmail-filter-content">
                        <div class="cav-gmail-filter-header">
                            <h3>📧 Gmail Scan Filters</h3>
                            <button class="cav-gmail-filter-close">&times;</button>
                        </div>
                        <div class="cav-gmail-filter-body">
                            <div class="filter-group">
                                <label>Filter by Domain</label>
                                <input type="text" id="gmail-filter-domain" value="${currentFilters.domain || ''}" placeholder="e.g., company.com">
                                <small>Only scan emails from this domain</small>
                            </div>
                            <div class="filter-group">
                                <label>Filter by Sender Email</label>
                                <input type="email" id="gmail-filter-sender" value="${currentFilters.sender || ''}" placeholder="e.g., john@company.com">
                                <small>Only scan emails from this specific sender</small>
                            </div>
                            <div class="filter-group">
                                <label>Filter by Label/Folder</label>
                                <select id="gmail-filter-label">
                                    <option value="">All Labels</option>
                                    ${labels.filter(l => l.type !== 'system' || ['INBOX', 'SENT', 'IMPORTANT', 'STARRED'].includes(l.id))
                                        .map(l => `<option value="${l.name}" ${currentFilters.label === l.name ? 'selected' : ''}>${l.name}</option>`).join('')}
                                </select>
                            </div>
                            <div class="filter-group">
                                <label>Filter by Subject</label>
                                <input type="text" id="gmail-filter-subject" value="${currentFilters.subject || ''}" placeholder="e.g., Creative Assets">
                            </div>
                            <div class="filter-group">
                                <label>Date Range</label>
                                <div class="date-range">
                                    <input type="date" id="gmail-filter-after" value="${currentFilters.afterDate || ''}">
                                    <span>to</span>
                                    <input type="date" id="gmail-filter-before" value="${currentFilters.beforeDate || ''}">
                                </div>
                            </div>
                        </div>
                        <div class="cav-gmail-filter-footer">
                            <button class="cav-btn-clear-filters">Clear All</button>
                            <button class="cav-btn-apply-filters">Apply & Scan</button>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(modal);
                
                // Handle clear filters
                modal.querySelector('.cav-btn-clear-filters').addEventListener('click', () => {
                    connection.settings.gmailFilters = {};
                    this.saveData(INTEGRATION_STORAGE.CONNECTIONS, this.connections);
                    modal.remove();
                    resolve(null);
                });
                
                // Handle apply filters
                modal.querySelector('.cav-btn-apply-filters').addEventListener('click', () => {
                    const filters = {
                        domain: modal.querySelector('#gmail-filter-domain').value.trim(),
                        sender: modal.querySelector('#gmail-filter-sender').value.trim(),
                        label: modal.querySelector('#gmail-filter-label').value,
                        subject: modal.querySelector('#gmail-filter-subject').value.trim(),
                        afterDate: modal.querySelector('#gmail-filter-after').value,
                        beforeDate: modal.querySelector('#gmail-filter-before').value,
                    };
                    
                    // Remove empty values
                    Object.keys(filters).forEach(key => {
                        if (!filters[key]) delete filters[key];
                    });
                    
                    connection.settings = connection.settings || {};
                    connection.settings.gmailFilters = filters;
                    this.saveData(INTEGRATION_STORAGE.CONNECTIONS, this.connections);
                    modal.remove();
                    resolve(filters);
                });
                
                // Handle close
                modal.querySelector('.cav-gmail-filter-close').addEventListener('click', () => {
                    modal.remove();
                    resolve(null);
                });
            });
        }

        /**
         * Scan Outlook for attachments
         * API: https://docs.microsoft.com/en-us/graph/api/resources/mail-api-overview
         */
        async scanOutlook(connection, results, options) {
            console.log('📧 Scanning Outlook attachments...');
            
            try {
                // Search for emails with attachments
                const response = await fetch(
                    'https://graph.microsoft.com/v1.0/me/messages?$filter=hasAttachments eq true&$top=50&$select=id,subject,from,receivedDateTime',
                    {
                        headers: { Authorization: `Bearer ${connection.accessToken}` }
                    }
                );
                
                if (!response.ok) {
                    throw new Error(`Outlook API error: ${response.status}`);
                }
                
                const data = await response.json();
                const messages = data.value || [];
                const attachments = [];
                
                // Get attachments from each message (limit to first 20)
                for (const msg of messages.slice(0, 20)) {
                    const attResponse = await fetch(
                        `https://graph.microsoft.com/v1.0/me/messages/${msg.id}/attachments`,
                        {
                            headers: { Authorization: `Bearer ${connection.accessToken}` }
                        }
                    );
                    
                    if (attResponse.ok) {
                        const attData = await attResponse.json();
                        
                        for (const att of attData.value || []) {
                            const ext = att.name?.split('.').pop()?.toLowerCase();
                            const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
                            const videoExts = ['mp4', 'mov', 'avi', 'webm'];
                            
                            if (imageExts.includes(ext) || videoExts.includes(ext)) {
                                attachments.push({
                                    id: `outlook_${msg.id}_${att.id}`,
                                    externalId: att.id,
                                    messageId: msg.id,
                                    name: att.name,
                                    type: videoExts.includes(ext) ? 'video' : 'image',
                                    mimeType: att.contentType,
                                    size: att.size || 0,
                                    width: 0,
                                    height: 0,
                                    source: 'Outlook',
                                    emailSubject: msg.subject,
                                    emailFrom: msg.from?.emailAddress?.address || 'Unknown',
                integrationId: 'outlook',
                scannedAt: new Date().toISOString(),
                canImport: true,
                                });
                            }
                        }
                    }
                }
                
                results.totalFiles = attachments.length;
                results.imagesFound = attachments.filter(a => a.type === 'image').length;
                results.videosFound = attachments.filter(a => a.type === 'video').length;
                results.assets = attachments;
                
            } catch (error) {
                console.error('Outlook scan error:', error);
                results.assets = [];
                results.totalFiles = 0;
                results.error = error.message;
                this.showToast(`Outlook error: ${error.message}`, 'error');
            }
        }

        /**
         * Scan Dropbox with folder selection
         * API: https://www.dropbox.com/developers/documentation
         */
        async scanDropbox(connection, results, options) {
            console.log('📦 Scanning Dropbox...');
            
            const folderPath = connection.settings.selectedFolder?.path || '';
            
            try {
                const response = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${connection.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        path: folderPath,
                        recursive: options.recursive || false,
                        include_media_info: true,
                    }),
                });
                
                if (!response.ok) {
                    throw new Error(`Dropbox API error: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Filter for images and videos
                const mediaFiles = (data.entries || []).filter(f => {
                    if (f['.tag'] !== 'file') return false;
                    const ext = f.name.split('.').pop()?.toLowerCase();
                    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
                    const videoExts = ['mp4', 'mov', 'avi', 'webm', 'mkv'];
                    return imageExts.includes(ext) || videoExts.includes(ext);
                });
                
                results.totalFiles = mediaFiles.length;
                
                // Get detailed media info
                results.assets = mediaFiles.map(f => {
                    const ext = f.name.split('.').pop()?.toLowerCase();
                    const videoExts = ['mp4', 'mov', 'avi', 'webm', 'mkv'];
                    const isVideo = videoExts.includes(ext);
                    const mediaInfo = f.media_info?.metadata;
                    
                    return {
                        id: `dropbox_${f.id}`,
                        externalId: f.id,
                        name: f.name,
                        type: isVideo ? 'video' : 'image',
                        width: mediaInfo?.dimensions?.width || 0,
                        height: mediaInfo?.dimensions?.height || 0,
                        duration: mediaInfo?.duration ? mediaInfo.duration / 1000 : null,
                        size: f.size || 0,
                        source: 'Dropbox',
                        sourcePath: connection.settings.selectedFolder?.name || 'Root',
                        path: f.path_lower,
                integrationId: 'dropbox',
                scannedAt: new Date().toISOString(),
                        createdAt: f.client_modified,
                canImport: true,
                    };
                });
                
                results.imagesFound = results.assets.filter(a => a.type === 'image').length;
                results.videosFound = results.assets.filter(a => a.type === 'video').length;
                
            } catch (error) {
                console.error('Dropbox scan error:', error);
                results.assets = [];
                results.totalFiles = 0;
                results.error = error.message;
                this.showToast(`Dropbox error: ${error.message}`, 'error');
        }
        }

        /**
         * Scan Wrike for project attachments
         * API: https://developers.wrike.com/api/v4/attachments/
         */
        async scanWrike(connection, results, options) {
            console.log('📋 Scanning Wrike projects...');
            
            try {
                // Get all attachments
                const response = await fetch(
                    'https://www.wrike.com/api/v4/attachments?withUrls=true',
                    {
                        headers: { Authorization: `Bearer ${connection.accessToken}` }
                    }
                );
                
                if (!response.ok) {
                    throw new Error(`Wrike API error: ${response.status}`);
                }
                
                const data = await response.json();
                const attachments = (data.data || []).filter(att => {
                    const ext = att.name?.split('.').pop()?.toLowerCase();
                    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
                    const videoExts = ['mp4', 'mov', 'avi', 'webm'];
                    return imageExts.includes(ext) || videoExts.includes(ext);
                });
                
                results.totalFiles = attachments.length;
                results.imagesFound = attachments.filter(a => {
                    const ext = a.name?.split('.').pop()?.toLowerCase();
                    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
                }).length;
                results.videosFound = attachments.length - results.imagesFound;
                
                results.assets = attachments.map(att => {
                    const ext = att.name?.split('.').pop()?.toLowerCase();
                    const isVideo = ['mp4', 'mov', 'avi', 'webm'].includes(ext);
                    return {
                        id: `wrike_${att.id}`,
                        externalId: att.id,
                        name: att.name,
                        type: isVideo ? 'video' : 'image',
                        size: att.size || 0,
                        width: att.width || 0,
                        height: att.height || 0,
                        downloadUrl: att.url,
                        source: 'Wrike',
                        taskId: att.taskId,
                integrationId: 'wrike',
                scannedAt: new Date().toISOString(),
                        createdAt: att.createdDate,
                canImport: true,
                    };
                });
                
            } catch (error) {
                console.error('Wrike scan error:', error);
                results.assets = [];
                results.totalFiles = 0;
                results.error = error.message;
                this.showToast(`Wrike error: ${error.message}`, 'error');
        }
        }

        /**
         * Scan Monday.com for board assets
         * API: https://api.developer.monday.com/docs
         */
        async scanMonday(connection, results, options) {
            console.log('📊 Scanning Monday.com boards...');
            
            try {
                // GraphQL query to get assets from all boards
                const query = `
                    query {
                        boards(limit: 20) {
                            id
                            name
                            items(limit: 50) {
                                id
                                name
                                assets {
                                    id
                                    name
                                    url
                                    file_size
                                    file_extension
                                    created_at
                                }
                            }
                        }
                    }
                `;
                
                const response = await fetch('https://api.monday.com/v2', {
                    method: 'POST',
                    headers: {
                        'Authorization': connection.accessToken,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query }),
                });
                
                if (!response.ok) {
                    throw new Error(`Monday.com API error: ${response.status}`);
                }
                
                const data = await response.json();
                const assets = [];
                
                // Extract assets from all boards
                for (const board of data.data?.boards || []) {
                    for (const item of board.items || []) {
                        for (const asset of item.assets || []) {
                            const ext = asset.file_extension?.toLowerCase();
                            const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
                            const videoExts = ['mp4', 'mov', 'avi', 'webm'];
                            
                            if (imageExts.includes(ext) || videoExts.includes(ext)) {
                                assets.push({
                                    id: `monday_${asset.id}`,
                                    externalId: asset.id,
                                    name: asset.name,
                                    type: videoExts.includes(ext) ? 'video' : 'image',
                                    size: asset.file_size || 0,
                                    width: 0,
                                    height: 0,
                                    downloadUrl: asset.url,
                                    source: 'Monday.com',
                                    boardName: board.name,
                                    itemName: item.name,
                integrationId: 'monday',
                scannedAt: new Date().toISOString(),
                                    createdAt: asset.created_at,
                canImport: true,
                                });
                            }
                        }
                    }
                }
                
                results.totalFiles = assets.length;
                results.imagesFound = assets.filter(a => a.type === 'image').length;
                results.videosFound = assets.filter(a => a.type === 'video').length;
                results.assets = assets;
                
            } catch (error) {
                console.error('Monday.com scan error:', error);
                results.assets = [];
                results.totalFiles = 0;
                results.error = error.message;
                this.showToast(`Monday.com error: ${error.message}`, 'error');
            }
        }

        /**
         * Scan Basecamp for project attachments
         * API: https://github.com/basecamp/bc3-api
         */
        async scanBasecamp(connection, results, options) {
            console.log('🏕️ Scanning Basecamp projects...');
            
            try {
                // Get authorization info first to get account ID
                const authResponse = await fetch('https://launchpad.37signals.com/authorization.json', {
                    headers: { Authorization: `Bearer ${connection.accessToken}` }
                });
                
                if (!authResponse.ok) {
                    throw new Error(`Basecamp auth error: ${authResponse.status}`);
                }
                
                const authData = await authResponse.json();
                const account = authData.accounts?.[0];
                
                if (!account) {
                    throw new Error('No Basecamp account found');
                }
                
                // Get projects
                const projectsResponse = await fetch(
                    `${account.href}/projects.json`,
                    {
                        headers: { Authorization: `Bearer ${connection.accessToken}` }
                    }
                );
                
                if (!projectsResponse.ok) {
                    throw new Error(`Basecamp projects error: ${projectsResponse.status}`);
                }
                
                const projects = await projectsResponse.json();
                const assets = [];
                
                // Get attachments from each project (limit to first 10 projects)
                for (const project of projects.slice(0, 10)) {
                    const vaultUrl = project.dock?.find(d => d.name === 'vault')?.url;
                    if (vaultUrl) {
                        const vaultResponse = await fetch(vaultUrl, {
                            headers: { Authorization: `Bearer ${connection.accessToken}` }
                        });
                        
                        if (vaultResponse.ok) {
                            const vaultData = await vaultResponse.json();
                            
                            for (const doc of vaultData || []) {
                                const ext = doc.filename?.split('.').pop()?.toLowerCase();
                                const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
                                const videoExts = ['mp4', 'mov', 'avi', 'webm'];
                                
                                if (imageExts.includes(ext) || videoExts.includes(ext)) {
                                    assets.push({
                                        id: `basecamp_${doc.id}`,
                                        externalId: doc.id,
                                        name: doc.filename || doc.title,
                                        type: videoExts.includes(ext) ? 'video' : 'image',
                                        size: doc.byte_size || 0,
                                        width: 0,
                                        height: 0,
                                        downloadUrl: doc.download_url,
                                        source: 'Basecamp',
                                        projectName: project.name,
                integrationId: 'basecamp',
                scannedAt: new Date().toISOString(),
                                        createdAt: doc.created_at,
                canImport: true,
                                    });
                                }
                            }
                        }
                    }
                }
                
                results.totalFiles = assets.length;
                results.imagesFound = assets.filter(a => a.type === 'image').length;
                results.videosFound = assets.filter(a => a.type === 'video').length;
                results.assets = assets;
                
            } catch (error) {
                console.error('Basecamp scan error:', error);
                results.assets = [];
                results.totalFiles = 0;
                results.error = error.message;
                this.showToast(`Basecamp error: ${error.message}`, 'error');
            }
        }

        // ----------------------------------------
        // ASSET VALIDATION
        // ----------------------------------------
        
        validateAsset(asset) {
            // Get channel specs (use same specs as main validator)
            const CHANNEL_SPECS = window.CHANNEL_SPECS || this.getDefaultSpecs();
            const IMAGE_SPECS = window.IMAGE_SPECS || this.getDefaultImageSpecs();
            
            const specs = asset.type === 'video' ? CHANNEL_SPECS : IMAGE_SPECS;
            const issues = [];
            const compatible = [];
            const offSize = [];

            Object.entries(specs).forEach(([channel, spec]) => {
                const ratio = asset.width / asset.height;
                const specRatios = spec.aspectRatios.map(r => {
                    const [w, h] = r.split(':').map(Number);
                    return w / h;
                });

                const matchesRatio = specRatios.some(sr => Math.abs(ratio - sr) < 0.1);

                if (matchesRatio) {
                    // Check duration for videos
                    if (asset.type === 'video') {
                        if (spec.minDuration && asset.duration < spec.minDuration) {
                            issues.push({
                                channel,
                                issue: 'duration_too_short',
                                message: `Video too short for ${channel} (min ${spec.minDuration}s)`,
                            });
                            offSize.push(channel);
                        } else if (spec.maxDuration && asset.duration > spec.maxDuration) {
                            issues.push({
                                channel,
                                issue: 'duration_too_long',
                                message: `Video too long for ${channel} (max ${spec.maxDuration}s)`,
                            });
                            offSize.push(channel);
                        } else {
                            compatible.push(channel);
                        }
                    } else {
                        compatible.push(channel);
                    }
                } else {
                    offSize.push(channel);
                }
            });

            return {
                ...asset,
                validationIssues: issues,
                compatibleChannels: compatible,
                offSizeChannels: offSize,
                validatedAt: new Date().toISOString(),
            };
        }

        getDefaultSpecs() {
            return {
                'YouTube Standard': { aspectRatios: ['16:9'], minDuration: 6, maxDuration: null },
                'YouTube Shorts': { aspectRatios: ['9:16'], minDuration: null, maxDuration: 60 },
                'Meta Feed': { aspectRatios: ['1:1', '4:5', '16:9'], minDuration: 1, maxDuration: 241 },
                'Meta Stories': { aspectRatios: ['9:16'], minDuration: 1, maxDuration: 120 },
                'Meta Reels': { aspectRatios: ['9:16'], minDuration: 3, maxDuration: 90 },
                'TikTok': { aspectRatios: ['9:16'], minDuration: 5, maxDuration: 60 },
                'Instagram Feed': { aspectRatios: ['1:1', '4:5'], minDuration: 3, maxDuration: 60 },
                'Instagram Reels': { aspectRatios: ['9:16'], minDuration: 3, maxDuration: 90 },
                'LinkedIn': { aspectRatios: ['1.91:1', '1:1', '4:5'], minDuration: 3, maxDuration: 600 },
            };
        }

        getDefaultImageSpecs() {
            return {
                'Instagram Feed': { aspectRatios: ['1:1', '4:5', '1.91:1'] },
                'Instagram Stories': { aspectRatios: ['9:16'] },
                'Facebook Feed': { aspectRatios: ['1.91:1', '1:1', '4:5'] },
                'Facebook Stories': { aspectRatios: ['9:16'] },
                'LinkedIn Feed': { aspectRatios: ['1.91:1', '1:1', '4:5'] },
                'Twitter Feed': { aspectRatios: ['16:9', '1:1'] },
                'Pinterest': { aspectRatios: ['2:3', '1:1'] },
            };
        }

        // ----------------------------------------
        // CRM LOGGING - ELIGIBILITY ANALYSIS
        // ----------------------------------------

        /**
         * Log scan results to CRM with detailed eligibility analysis
         */
        async logToCRM(scanResults, companyId = null) {
            console.log('📊 Logging scan results to CRM...');
            
            // Generate eligibility report
            const eligibilityReport = this.generateEligibilityReport(scanResults);
            
            // Create CRM entry
            const crmEntry = {
                id: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'integration_scan',
                timestamp: new Date().toISOString(),
                companyId: companyId || 'default',
                source: scanResults.integrationName,
                integrationId: scanResults.integrationId,
                summary: {
                    totalAssets: scanResults.totalFiles,
                    imagesFound: scanResults.imagesFound,
                    videosFound: scanResults.videosFound,
                    eligibleForUpload: eligibilityReport.eligible.length,
                    needsResizing: eligibilityReport.needsResizing.length,
                    incompatible: eligibilityReport.incompatible.length,
                },
                eligibilityReport: eligibilityReport,
                assets: scanResults.assets.map(a => ({
                    id: a.id,
                    name: a.name,
                    type: a.type,
                    dimensions: `${a.width}x${a.height}`,
                    status: a.eligibilityStatus,
                    compatibleChannels: a.compatibleChannels,
                    needsResizingFor: a.needsResizingFor,
                })),
                scannedBy: window.cavUserSession?.email || 'anonymous',
            };
            
            // Save to CRM storage
            await this.saveToCRMStorage(crmEntry);
            
            // Notify CRM module if available
            if (window.CAVCrm?.addScanReport) {
                window.CAVCrm.addScanReport(crmEntry);
            }
            
            console.log(`📊 CRM Report: ${eligibilityReport.eligible.length} eligible, ${eligibilityReport.needsResizing.length} need resizing`);
            
            return crmEntry;
        }

        /**
         * Generate detailed eligibility report
         */
        generateEligibilityReport(scanResults) {
            const report = {
                eligible: [],      // Ready to upload as-is
                needsResizing: [], // Can be uploaded but needs resize for some channels
                incompatible: [],  // Cannot be used for any channel
                channelCoverage: {}, // Which channels each asset supports
            };
            
            for (const asset of scanResults.assets || []) {
                const analysis = this.analyzeAssetEligibility(asset);
                
                asset.eligibilityStatus = analysis.status;
                asset.compatibleChannels = analysis.compatibleChannels;
                asset.needsResizingFor = analysis.needsResizingFor;
                asset.eligibilityScore = analysis.score;
                
                if (analysis.status === 'eligible') {
                    report.eligible.push({
                        id: asset.id,
                        name: asset.name,
                        channels: analysis.compatibleChannels,
                    });
                } else if (analysis.status === 'needs_resizing') {
                    report.needsResizing.push({
                        id: asset.id,
                        name: asset.name,
                        currentSize: `${asset.width}x${asset.height}`,
                        compatibleChannels: analysis.compatibleChannels,
                        needsResizingFor: analysis.needsResizingFor,
                        suggestedActions: analysis.suggestedActions,
                    });
                } else {
                    report.incompatible.push({
                        id: asset.id,
                        name: asset.name,
                        reason: analysis.reason,
                    });
                }
                
                // Track channel coverage
                for (const channel of analysis.compatibleChannels) {
                    report.channelCoverage[channel] = report.channelCoverage[channel] || [];
                    report.channelCoverage[channel].push(asset.id);
                }
            }
            
            return report;
        }

        /**
         * Analyze single asset eligibility
         */
        analyzeAssetEligibility(asset) {
            const result = {
                status: 'incompatible',
                score: 0,
                compatibleChannels: [],
                needsResizingFor: [],
                suggestedActions: [],
                reason: null,
            };
            
            if (!asset.width || !asset.height) {
                result.reason = 'Unknown dimensions';
                return result;
            }
            
            const aspectRatio = asset.width / asset.height;
            const specs = CHANNEL_SIZE_SPECS;
            
            for (const [channel, spec] of Object.entries(specs)) {
                const channelResult = this.checkChannelCompatibility(asset, channel, spec);
                
                if (channelResult.compatible) {
                    result.compatibleChannels.push(channel);
                    result.score += 10;
                } else if (channelResult.canResize) {
                    result.needsResizingFor.push({
                        channel,
                        targetSize: channelResult.targetSize,
                        action: channelResult.action,
                    });
                    result.score += 5;
                    result.suggestedActions.push(`Resize to ${channelResult.targetSize} for ${channel}`);
                }
            }
            
            // Determine overall status
            if (result.compatibleChannels.length >= 3) {
                result.status = 'eligible';
            } else if (result.compatibleChannels.length > 0 || result.needsResizingFor.length > 0) {
                result.status = 'needs_resizing';
            } else {
                result.status = 'incompatible';
                result.reason = 'Dimensions not suitable for any channel';
            }
            
            return result;
        }

        /**
         * Check if asset is compatible with a specific channel
         */
        checkChannelCompatibility(asset, channel, spec) {
            const assetRatio = asset.width / asset.height;
            
            // Parse spec aspect ratios
            for (const ratioStr of spec.aspectRatios) {
                const [w, h] = ratioStr.split(':').map(Number);
                const specRatio = w / h;
                
                // Allow 5% tolerance
                if (Math.abs(assetRatio - specRatio) < 0.05) {
                    // Check minimum dimensions
                    if (asset.width >= spec.width * 0.9 && asset.height >= spec.height * 0.9) {
                        return { compatible: true };
                    }
                }
            }
            
            // Check if can be resized/cropped
            const canResize = asset.width >= spec.width * 0.5 && asset.height >= spec.height * 0.5;
            
            if (canResize) {
                return {
                    compatible: false,
                    canResize: true,
                    targetSize: `${spec.width}x${spec.height}`,
                    action: 'crop_or_extend',
                };
            }
            
            return { compatible: false, canResize: false };
        }

        /**
         * Save CRM entry to storage
         */
        async saveToCRMStorage(entry) {
            const storageKey = 'cav_crm_integration_scans';
            const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
            existing.unshift(entry);
            
            // Keep last 100 entries
            if (existing.length > 100) {
                existing.splice(100);
            }
            
            localStorage.setItem(storageKey, JSON.stringify(existing));
            
            // Also save to IndexedDB if available
            if (window.CAVStorage?.saveToStore) {
                await window.CAVStorage.saveToStore('integration_scans', entry);
            }
        }

        /**
         * Get CRM scan history
         */
        getCRMScanHistory(companyId = null) {
            const storageKey = 'cav_crm_integration_scans';
            const all = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            if (companyId) {
                return all.filter(e => e.companyId === companyId);
            }
            
            return all;
        }

        /**
         * Show toast notification
         */
        showToast(message, type = 'info') {
            const toast = document.createElement('div');
            toast.className = `cav-toast cav-toast-${type}`;
            toast.textContent = message;
            toast.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 12px 20px;
                background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
                color: white;
                border-radius: 8px;
                z-index: 10000;
                animation: slideIn 0.3s ease;
            `;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }

        // ----------------------------------------
        // NOTIFICATIONS
        // ----------------------------------------

        async sendNotifications(scanResults) {
            const { notifyVia, emailAddress, slackWebhookUrl } = this.settings;

            if (notifyVia === 'email' || notifyVia === 'both') {
                if (emailAddress) {
                    await this.sendEmailNotification(emailAddress, scanResults);
                }
            }

            if (notifyVia === 'slack' || notifyVia === 'both') {
                if (slackWebhookUrl) {
                    await this.sendSlackNotification(slackWebhookUrl, scanResults);
                }
            }
        }

        async sendEmailNotification(email, results) {
            console.log(`📧 Sending email notification to ${email}`);
            
            // In production, use email API (SendGrid, AWS SES, etc.)
            const subject = `Asset Validation Report: ${results.issues.length} issues found`;
            const body = this.formatNotificationBody(results);
            
            console.log(`Email subject: ${subject}`);
            console.log(`Email body:`, body);
            
            // Store notification for UI display
            this.storeNotification('email', email, subject, body);
        }

        async sendSlackNotification(webhookUrl, results) {
            console.log(`💬 Sending Slack notification`);
            
            const message = {
                text: `🔍 Asset Validation Report`,
                blocks: [
                    {
                        type: 'header',
                        text: { type: 'plain_text', text: '🔍 Asset Validation Report' },
                    },
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `*${results.integrationName}* scan complete:\n` +
                                  `• Total files: ${results.totalFiles}\n` +
                                  `• Issues found: ${results.issues.length}`,
                        },
                    },
                ],
            };

            if (results.issues.length > 0) {
                message.blocks.push({
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: '*Assets with issues:*\n' + 
                              results.issues.slice(0, 5).map(a => 
                                  `• ${a.name}: ${a.validationIssues.map(i => i.message).join(', ')}`
                              ).join('\n'),
                    },
                });
            }

            // In production, POST to webhookUrl
            console.log('Slack message:', JSON.stringify(message, null, 2));
            
            this.storeNotification('slack', webhookUrl, 'Asset Validation Report', message);
        }

        storeNotification(type, destination, subject, body) {
            const notifications = JSON.parse(localStorage.getItem('cav_notifications') || '[]');
            notifications.unshift({
                id: Date.now().toString(),
                type,
                destination,
                subject,
                body,
                sentAt: new Date().toISOString(),
            });
            if (notifications.length > 50) {
                notifications.pop();
            }
            localStorage.setItem('cav_notifications', JSON.stringify(notifications));
        }

        formatNotificationBody(results) {
            let body = `Asset Validation Report\n`;
            body += `========================\n\n`;
            body += `Source: ${results.integrationName}\n`;
            body += `Scanned: ${new Date(results.scannedAt).toLocaleString()}\n\n`;
            body += `Summary:\n`;
            body += `- Total files scanned: ${results.totalFiles}\n`;
            body += `- Images found: ${results.imagesFound}\n`;
            body += `- Videos found: ${results.videosFound}\n`;
            body += `- Assets with issues: ${results.issues.length}\n\n`;

            if (results.issues.length > 0) {
                body += `Issues Found:\n`;
                body += `--------------\n`;
                results.issues.forEach(asset => {
                    body += `\n${asset.name}:\n`;
                    asset.validationIssues.forEach(issue => {
                        body += `  - ${issue.message}\n`;
                    });
                });
            }

            body += `\n\nTo fix these issues, import the assets into Creative Asset Validator `;
            body += `and use the AI Adapter to automatically resize/extend them.`;

            return body;
        }

        // ----------------------------------------
        // IMPORT ASSETS TO LIBRARY + CRM
        // ----------------------------------------

        /**
         * Get or create the "Uncategorized" CRM project for imported assets
         * This serves as a holding area for assets that haven't been organized yet
         */
        async getOrCreateUncategorizedProject() {
            if (!window.cavCRM) {
                console.warn('[Integration] CRM not available');
                return null;
            }

            const crm = window.cavCRM;
            
            // Check if Uncategorized project already exists
            const allProjects = crm.getProjects ? crm.getProjects() : Object.values(crm.projects || {});
            let uncategorized = allProjects.find(p => p.name === '📥 Uncategorized Imports' || p.isUncategorized);
            
            if (!uncategorized) {
                // Create the Uncategorized project with guidance
                console.log('[Integration] Creating Uncategorized Imports project...');
                uncategorized = crm.createProject({
                    name: '📥 Uncategorized Imports',
                    description: `**Welcome to Uncategorized Imports!**

This folder contains all assets imported from external integrations (Google Drive, Dropbox, etc.) that haven't been assigned to a brand or project yet.

**How to organize your assets:**
1. Click on any asset to view details
2. Click "Assign to Brand" to link to an existing brand or create a new one
3. Assets will automatically move out of Uncategorized once assigned

**Creating new brands:**
- When assigning, you can create a new brand if one doesn't exist
- The system will auto-populate brand details when possible
- You can also scan a website URL to auto-fill brand information

**Best practices:**
- Review this folder regularly to organize new imports
- Use tags to group similar assets before assigning
- Create projects within brands for campaign-specific assets`,
                    type: 'other',
                    status: 'active',
                    priority: 'normal',
                    isUncategorized: true, // Flag to identify this special project
                    linkedAssets: [],
                    tags: ['imports', 'uncategorized', 'integration'],
                });
                
                console.log('[Integration] ✅ Created Uncategorized Imports project:', uncategorized.id);
            }
            
            return uncategorized;
        }

        /**
         * Import asset from external service into the validator library AND CRM
         */
        async importAsset(asset) {
            console.log(`📥 Importing ${asset.name} from ${asset.source}...`);

            // Create the imported asset record
            const importedAsset = {
                id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                filename: asset.name,
                type: asset.type || 'image',
                width: asset.width,
                height: asset.height,
                duration: asset.duration,
                fileSize: asset.size,
                file_hash: `import_${asset.id || asset.name}_${Date.now()}`,
                source: asset.source,
                integrationId: asset.integrationId,
                externalId: asset.id, // Original ID from external service
                externalUrl: asset.viewUrl || asset.downloadUrl,
                thumbnail_url: asset.thumbnailUrl || asset.thumbnail,
                dataUrl: asset.thumbnailUrl || asset.thumbnail || null,
                importedAt: new Date().toISOString(),
                importedBy: window.cavUserSession?.email || 'unknown',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                validationIssues: asset.validationIssues || [],
                compatibleChannels: asset.compatibleChannels || [],
                offSizeChannels: asset.offSizeChannels || [],
                status: 'uncategorized', // Mark as uncategorized
                is_trashed: false,
                is_favorite: false,
                user_key: this.getUserStorageKey(INTEGRATION_STORAGE.CONNECTIONS).replace('_connections', ''),
                tags: {
                    source: asset.source,
                    integration: asset.integrationId,
                    imported: 'true',
                },
                metadata: {
                    mimeType: asset.mimeType,
                    originalPath: asset.path,
                    parentFolder: asset.parentFolder,
                },
                // CRM tracking
                crmStatus: 'uncategorized',
                crmProjectId: null,
                crmCompanyId: null,
            };

            // Try to fetch thumbnail if we have a URL but no dataUrl
            if (!importedAsset.dataUrl && importedAsset.thumbnail_url) {
                try {
                    // Use thumbnail URL directly as dataUrl for display
                    importedAsset.dataUrl = importedAsset.thumbnail_url;
                } catch (e) {
                    console.warn('[Integration] Could not fetch thumbnail:', e);
                }
            }

            // STEP 1: Save to main Library via storage system
            let savedToLibrary = false;
            
            // Method 1: Use window.cavApp.storage.saveAsset
            if (window.cavApp?.storage?.saveAsset) {
                try {
                    const result = await window.cavApp.storage.saveAsset(importedAsset);
                    if (result?.success !== false) {
                        console.log('[Integration] ✅ Asset saved to Library via cavApp.storage');
                        savedToLibrary = true;
                        
                        // Refresh the library display
                        if (window.cavApp.refreshAssets) {
                            await window.cavApp.refreshAssets();
                        }
                    }
                } catch (e) {
                    console.warn('[Integration] cavApp.storage.saveAsset failed:', e);
                }
            }
            
            // Method 2: Use window.cavValidatorApp.addAsset
            if (!savedToLibrary && window.cavValidatorApp?.addAsset) {
                try {
                    window.cavValidatorApp.addAsset(importedAsset);
                    console.log('[Integration] ✅ Asset added to Library via cavValidatorApp');
                    savedToLibrary = true;
                } catch (e) {
                    console.warn('[Integration] cavValidatorApp.addAsset failed:', e);
                }
            }
            
            // Method 3: Direct IndexedDB access
            if (!savedToLibrary) {
                try {
                    const dbRequest = indexedDB.open('CAVStorage', 4);
                    await new Promise((resolve, reject) => {
                        dbRequest.onerror = reject;
                        dbRequest.onsuccess = () => {
                            const db = dbRequest.result;
                            const tx = db.transaction('assets', 'readwrite');
                            const store = tx.objectStore('assets');
                            store.put(importedAsset);
                            tx.oncomplete = () => {
                                console.log('[Integration] ✅ Asset saved directly to IndexedDB');
                                savedToLibrary = true;
                                resolve();
                            };
                            tx.onerror = reject;
                        };
                    });
                } catch (e) {
                    console.warn('[Integration] Direct IndexedDB save failed:', e);
                }
            }
            
            if (!savedToLibrary) {
                console.error('[Integration] ❌ Failed to save asset to Library');
            }

            // STEP 2: Add to CRM "Uncategorized" project
            try {
                const uncategorizedProject = await this.getOrCreateUncategorizedProject();
                
                if (uncategorizedProject && window.cavCRM) {
                    // Link asset to the Uncategorized project
                    window.cavCRM.linkAssetToProject(uncategorizedProject.id, importedAsset.id);
                    importedAsset.crmProjectId = uncategorizedProject.id;
                    
                    // Log import activity
                    if (window.cavCRM.logActivity) {
                        window.cavCRM.logActivity('asset_imported', {
                            assetId: importedAsset.id,
                            filename: importedAsset.filename,
                            source: importedAsset.source,
                            projectId: uncategorizedProject.id,
                        });
                    }
                    
                    console.log('[Integration] ✅ Asset added to CRM Uncategorized project');
                }
            } catch (e) {
                console.warn('[Integration] CRM integration failed:', e);
            }

            console.log(`✅ Imported: ${importedAsset.filename} (Library: ${savedToLibrary}, CRM: ${!!importedAsset.crmProjectId})`);
            
            return importedAsset;
        }

        async importMultiple(assets) {
            const results = [];
            let successCount = 0;
            
            for (const asset of assets) {
                try {
                    const imported = await this.importAsset(asset);
                    results.push({ success: true, asset: imported });
                    successCount++;
                } catch (error) {
                    results.push({ success: false, asset, error: error.message });
                }
            }
            
            // Show summary toast
            if (successCount > 0) {
                this.showToast(`📥 Imported ${successCount}/${assets.length} assets to Library & CRM`, 'success');
            }
            
            // Refresh library display
            if (window.cavApp?.refreshAssets) {
                await window.cavApp.refreshAssets();
            } else if (window.cavValidatorApp?.render) {
                window.cavValidatorApp.render();
            }
            
            return results;
        }

        // ----------------------------------------
        // SETTINGS
        // ----------------------------------------

        updateSettings(updates) {
            this.settings = { ...this.settings, ...updates };
            this.saveData(INTEGRATION_STORAGE.SETTINGS, this.settings);
            return this.settings;
        }

        getSettings() {
            return this.settings;
        }

        // ----------------------------------------
        // SCAN RESULTS
        // ----------------------------------------

        getScanResults() {
            return this.scanResults;
        }

        getScanHistory() {
            return this.scanHistory;
        }

        clearScanResults() {
            this.scanResults = [];
            this.saveData(INTEGRATION_STORAGE.SCAN_RESULTS, this.scanResults);
        }
    }

    // ============================================
    // INTEGRATION UI COMPONENTS
    // ============================================

    function createIntegrationsPanel(hub) {
        // Refresh user context when panel is created
        hub.refreshUserContext();
        
        const integrations = hub.getAvailableIntegrations();
        const settings = hub.getSettings();
        const userEmail = hub.userEmail;
        
        // Check if current user is super admin
        const isSuperAdmin = window.AUTH_CONFIG?.ADMIN_EMAILS?.includes(userEmail) || false;
        
        // Filter integrations based on super admin access
        const filteredIntegrations = integrations.filter(int => {
            // If superAdminOnly, only show to super admins
            if (int.superAdminOnly && !isSuperAdmin) {
                return false;
            }
            return true;
        });
        
        // Group integrations by category
        const categories = {
            cloud_storage: { name: 'Cloud Storage', icon: INTEGRATION_ICONS.onedrive, integrations: [] },
            design: { name: 'Design Tools', icon: INTEGRATION_ICONS.figma, integrations: [] },
            communication: { name: 'Communication', icon: INTEGRATION_ICONS.slack, integrations: [] },
            automation: { name: 'Automation', icon: INTEGRATION_ICONS.zapier, integrations: [] },
            email: { name: 'Email', icon: INTEGRATION_ICONS.gmail, integrations: [] },
            project_management: { name: 'Project Management', icon: INTEGRATION_ICONS.wrike, integrations: [] },
            productivity: { name: 'Productivity', icon: INTEGRATION_ICONS.google_sheets, integrations: [] },
        };
        
        filteredIntegrations.forEach(int => {
            const category = int.category || 'other';
            if (categories[category]) {
                categories[category].integrations.push(int);
            }
        });
        
        const panel = document.createElement('div');
        panel.className = 'integrations-panel cav-page';
        panel.innerHTML = `
            <div class="integrations-header">
                <h2>${INTEGRATION_ICONS.connect} Integration Hub</h2>
                <p>Connect your tools to scan, analyze, and import creative assets automatically.</p>
                <div class="integrations-user-info">
                    <span class="user-badge">${INTEGRATION_ICONS.settings} ${userEmail}</span>
                </div>
                <div class="integrations-stats">
                    <span class="stat"><strong>${integrations.filter(i => i.connected).length}</strong> Connected</span>
                    <span class="stat"><strong>${Object.keys(INTEGRATIONS).length}</strong> Available</span>
                </div>
            </div>
            
            ${Object.entries(categories).filter(([_, cat]) => cat.integrations.length > 0).map(([key, category]) => `
                <div class="integration-category">
                    <h3 class="category-title">${category.icon} ${category.name}</h3>
            <div class="integrations-grid">
                        ${category.integrations.map(int => `
                    <div class="integration-card ${int.connected ? 'connected' : ''}" data-id="${int.id}">
                                <div class="integration-header">
                        <div class="integration-icon" style="background: ${int.color}20; color: ${int.color};">
                                        ${int.iconSvg || INTEGRATION_ICONS[int.id] || ''}
                        </div>
                        <div class="integration-info">
                                        <h4>${int.name}</h4>
                                        <p class="integration-desc">${int.description || int.features.map(f => f.replace(/_/g, ' ')).join(', ')}</p>
                        </div>
                        </div>
                                
                                ${int.connected ? `
                                    <div class="integration-connected-info">
                                        <span class="status-badge connected">${INTEGRATION_ICONS.check} Connected</span>
                                        ${int.connectionInfo?.accountEmail ? `<span class="account-email">${int.connectionInfo.accountEmail}</span>` : ''}
                                        ${int.connectionInfo?.settings?.selectedFolder ? `
                                            <span class="selected-folder">${INTEGRATION_ICONS.folder} ${int.connectionInfo.settings.selectedFolder.name}</span>
                                        ` : ''}
                                    </div>
                                    <div class="integration-actions">
                                        ${int.features.includes('folder_picker') ? `
                                            <button class="int-btn int-btn-folder" data-id="${int.id}" title="Select folder">${INTEGRATION_ICONS.folder} Folder</button>
                                        ` : ''}
                                        ${int.id === 'google_sheets' ? `
                                            <button class="int-btn int-btn-sheets-picker" data-id="${int.id}" title="Select spreadsheet">${INTEGRATION_ICONS.sheet || '📊'} Sheet</button>
                                        ` : ''}
                                        ${int.id === 'gmail' ? `
                                            <button class="int-btn int-btn-gmail-filter" data-id="${int.id}" title="Set email filters">${INTEGRATION_ICONS.filter || '🔍'} Filter</button>
                                        ` : ''}
                                        ${int.features.includes('scan_folders') || int.features.includes('scan_channels') || int.features.includes('scan_projects') || int.features.includes('scan_cells') || int.features.includes('scan_attachments') || int.features.includes('scan_libraries') ? `
                                            <button class="int-btn int-btn-scan" data-id="${int.id}">${INTEGRATION_ICONS.scan} Scan</button>
                                        ` : ''}
                                        <button class="int-btn int-btn-disconnect" data-id="${int.id}" title="Disconnect">${INTEGRATION_ICONS.disconnect}</button>
                                    </div>
                                ` : `
                                    <div class="integration-actions">
                                        ${int.comingSoon ? `
                                            <button class="int-btn int-btn-coming-soon" disabled data-id="${int.id}">
                                                🚀 Coming Soon
                                            </button>
                                            <span class="coming-soon-note">Requires admin API setup</span>
                                        ` : `
                                            <button class="int-btn int-btn-connect" data-id="${int.id}">
                                                ${int.webhookBased ? `${INTEGRATION_ICONS.connect} Setup Webhook` : `${INTEGRATION_ICONS.connect} Connect`}
                                            </button>
                                            ${int.superAdminOnly ? `<span class="admin-only-badge">🔒 Admin Only</span>` : ''}
                                        `}
                                    </div>
                                `}
                                
                                ${int.webhookBased && int.connected ? `
                                    <div class="webhook-info">
                                        <label>Webhook URL (copy to Zapier):</label>
                                        <input type="text" readonly value="${int.connectionInfo?.webhookUrl || ''}" class="webhook-url-input">
                                        <button class="int-btn-copy" data-url="${int.connectionInfo?.webhookUrl || ''}">${INTEGRATION_ICONS.copy} Copy</button>
                                    </div>
                                ` : ''}
                    </div>
                `).join('')}
            </div>
                </div>
            `).join('')}
            
            <div class="integrations-settings">
                <h3>${INTEGRATION_ICONS.settings} Scan & Notification Settings</h3>
                <div class="settings-grid">
                    <div class="settings-row">
                        <label>
                            <span>Auto-import scanned assets</span>
                            <input type="checkbox" id="int-auto-import" ${settings.autoImport ? 'checked' : ''}>
                        </label>
                    </div>
                <div class="settings-row">
                    <label>
                        <span>Notify when issues found</span>
                        <input type="checkbox" id="int-notify-issues" ${settings.notifyOnIssues ? 'checked' : ''}>
                    </label>
                </div>
                <div class="settings-row">
                    <label>
                        <span>Notification method</span>
                        <select id="int-notify-via">
                            <option value="email" ${settings.notifyVia === 'email' ? 'selected' : ''}>Email</option>
                            <option value="slack" ${settings.notifyVia === 'slack' ? 'selected' : ''}>Slack</option>
                            <option value="both" ${settings.notifyVia === 'both' ? 'selected' : ''}>Both</option>
                        </select>
                    </label>
                </div>
                <div class="settings-row">
                    <label>
                        <span>Email address</span>
                        <input type="email" id="int-email" value="${settings.emailAddress}" placeholder="you@company.com">
                    </label>
                </div>
                <div class="settings-row">
                    <label>
                        <span>Slack webhook URL</span>
                        <input type="url" id="int-slack-webhook" value="${settings.slackWebhookUrl}" placeholder="https://hooks.slack.com/...">
                    </label>
                </div>
                    <div class="settings-row">
                        <label>
                            <span>Log scans to CRM</span>
                            <input type="checkbox" id="int-crm-logging" ${settings.crmLogging !== false ? 'checked' : ''}>
                        </label>
                    </div>
                </div>
                <button class="int-btn-save-settings cav-btn cav-btn-primary" id="int-save-settings">${INTEGRATION_ICONS.check} Save Settings</button>
            </div>
            
            <div class="integrations-results" id="int-results" style="display: none;">
                <div class="results-header">
                    <h3>${INTEGRATION_ICONS.scan} Scan Results</h3>
                    <div class="results-summary" id="results-summary"></div>
                </div>
                <div class="results-tabs">
                    <button class="results-tab active" data-tab="eligible">${INTEGRATION_ICONS.check} Eligible</button>
                    <button class="results-tab" data-tab="resize">🔄 Needs Resize</button>
                    <button class="results-tab" data-tab="all">${INTEGRATION_ICONS.folder} All Assets</button>
                </div>
                <div id="int-results-content"></div>
                <div class="results-actions">
                    <button class="int-btn int-btn-import-all cav-btn cav-btn-primary" id="int-import-eligible">${INTEGRATION_ICONS.download} Import Eligible Assets</button>
                    <button class="int-btn int-btn-export cav-btn" id="int-export-report">${INTEGRATION_ICONS.copy} Export CRM Report</button>
                </div>
            </div>
        `;
        
        // Attach event handlers
        attachIntegrationHandlers(panel, hub);
        
        return panel;
    }

    function attachIntegrationHandlers(panel, hub) {
        // Connect buttons
        panel.querySelectorAll('.int-btn-connect').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                btn.disabled = true;
                btn.textContent = '⏳ Connecting...';
                
                try {
                    await hub.connect(id);
                    hub.showToast(`Connected to ${INTEGRATIONS[id].name}`, 'success');
                    // Refresh panel
                    const newPanel = createIntegrationsPanel(hub);
                    panel.replaceWith(newPanel);
                } catch (err) {
                    hub.showToast(`${err.message}`, 'error');
                    btn.disabled = false;
                    btn.textContent = '🔐 Connect';
                }
            });
        });

        // Disconnect buttons
        panel.querySelectorAll('.int-btn-disconnect').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                if (confirm(`Disconnect from ${INTEGRATIONS[id].name}?`)) {
                    hub.disconnect(id);
                    hub.showToast(`Disconnected from ${INTEGRATIONS[id].name}`);
                    const newPanel = createIntegrationsPanel(hub);
                    panel.replaceWith(newPanel);
                }
            });
        });

        // Folder picker buttons
        panel.querySelectorAll('.int-btn-folder').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                try {
                    const folder = await hub.openFolderPicker(id);
                    if (folder) {
                        hub.showToast(`Selected: ${folder.name}`, 'success');
                        const newPanel = createIntegrationsPanel(hub);
                        panel.replaceWith(newPanel);
                    }
                } catch (err) {
                    hub.showToast(`${err.message}`, 'error');
                }
            });
        });

        // Google Sheets picker buttons
        panel.querySelectorAll('.int-btn-sheets-picker').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                try {
                    const connection = hub.connections[id];
                    if (!connection) {
                        hub.showToast('Please connect first', 'error');
                        return;
                    }
                    const sheet = await hub.openSheetsPicker(connection);
                    if (sheet) {
                        hub.showToast(`Selected: ${sheet.name}`, 'success');
                        const newPanel = createIntegrationsPanel(hub);
                        panel.replaceWith(newPanel);
                    }
                } catch (err) {
                    hub.showToast(`${err.message}`, 'error');
                }
            });
        });

        // Gmail filter buttons
        panel.querySelectorAll('.int-btn-gmail-filter').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                try {
                    const connection = hub.connections[id];
                    if (!connection) {
                        hub.showToast('Please connect first', 'error');
                        return;
                    }
                    const filters = await hub.openGmailFilters(connection);
                    if (filters) {
                        hub.showToast(`📧 Filters updated`, 'success');
                        const newPanel = createIntegrationsPanel(hub);
                        panel.replaceWith(newPanel);
                    }
                } catch (err) {
                    hub.showToast(`${err.message}`, 'error');
                }
            });
        });

        // Scan buttons
        panel.querySelectorAll('.int-btn-scan').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                btn.disabled = true;
                btn.innerHTML = '⏳ Scanning...';
                
                try {
                    const results = await hub.scanService(id);
                    showScanResults(panel, results, hub);
                    hub.showToast(`Found ${results.totalFiles} assets`, 'success');
                } catch (err) {
                    hub.showToast(`${err.message}`, 'error');
                } finally {
                    btn.disabled = false;
                    btn.innerHTML = '🔍 Scan';
                }
            });
        });

        // Copy webhook URL
        panel.querySelectorAll('.int-btn-copy').forEach(btn => {
            btn.addEventListener('click', () => {
                navigator.clipboard.writeText(btn.dataset.url);
                hub.showToast('Webhook URL copied!', 'success');
            });
        });

        // Save settings
        panel.querySelector('#int-save-settings')?.addEventListener('click', () => {
            hub.updateSettings({
                autoImport: panel.querySelector('#int-auto-import')?.checked,
                notifyOnIssues: panel.querySelector('#int-notify-issues')?.checked,
                notifyVia: panel.querySelector('#int-notify-via')?.value,
                emailAddress: panel.querySelector('#int-email')?.value,
                slackWebhookUrl: panel.querySelector('#int-slack-webhook')?.value,
                crmLogging: panel.querySelector('#int-crm-logging')?.checked,
            });
            hub.showToast('Settings saved', 'success');
        });
    }

    function showScanResults(panel, results, hub) {
        const resultsDiv = panel.querySelector('#int-results');
        const contentDiv = panel.querySelector('#int-results-content');
        const summaryDiv = panel.querySelector('#results-summary');
        
        console.log('📊 Displaying scan results:', results);
        
        resultsDiv.style.display = 'block';
        
        // Show summary
        const eligible = results.assets?.filter(a => a.eligibilityStatus === 'eligible') || [];
        const needsResize = results.assets?.filter(a => a.eligibilityStatus === 'needs_resizing') || [];
        const images = results.imagesFound || results.assets?.filter(a => a.type === 'image').length || 0;
        const videos = results.videosFound || results.assets?.filter(a => a.type === 'video').length || 0;
        const documents = results.documentsFound || results.assets?.filter(a => a.type === 'document').length || 0;
        
        summaryDiv.innerHTML = `
            <span class="summary-stat images">🖼️ ${images} Images</span>
            <span class="summary-stat videos">🎬 ${videos} Videos</span>
            ${documents > 0 ? `<span class="summary-stat documents">📄 ${documents} Documents</span>` : ''}
            <span class="summary-stat eligible">✅ ${eligible.length} Eligible</span>
            <span class="summary-stat resize">🔄 ${needsResize.length} Need Resize</span>
            <span class="summary-stat total">📁 ${results.totalFiles || 0} Total</span>
        `;
        
        // Handle empty results
        if (!results.assets || results.assets.length === 0) {
            contentDiv.innerHTML = `
                <div class="scan-empty-state">
                    <div class="empty-icon">📂</div>
                    <h4>No Media Files Found</h4>
                    <p>${results.error ? `Error: ${results.error}` : 'The selected folder doesn\'t contain any images, videos, or documents.'}</p>
                    <div class="empty-suggestions">
                        <p><strong>Try:</strong></p>
                        <ul>
                            <li>Select a different folder using the "Folder" button</li>
                            <li>Check if your files are in a subfolder</li>
                            <li>Ensure the files are images (PNG, JPG, GIF) or videos (MP4, MOV)</li>
                        </ul>
                    </div>
                </div>
            `;
            // Scroll to results
            resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }
        
        // Show assets
        contentDiv.innerHTML = results.assets.map(asset => `
            <div class="scan-result-item ${asset.eligibilityStatus || ''}">
                <div class="result-preview">
                    ${asset.thumbnailUrl 
                        ? `<img src="${asset.thumbnailUrl}" alt="${asset.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                           <div class="result-icon fallback" style="display:none;">${asset.icon || '📁'}</div>`
                        : `<div class="result-icon">${asset.icon || '📁'}</div>`
                    }
                </div>
                <div class="result-info">
                    <h5 title="${asset.name}">${asset.name.length > 30 ? asset.name.substring(0, 30) + '...' : asset.name}</h5>
                    <p class="result-meta">
                        ${asset.width && asset.height ? `${asset.width}×${asset.height} • ` : ''}
                        ${asset.size ? `${(asset.size / 1024).toFixed(1)} KB` : 'Size unknown'}
                        ${asset.duration ? ` • ${Math.round(asset.duration)}s` : ''}
                    </p>
                    <p class="result-type">${asset.type?.charAt(0).toUpperCase() + asset.type?.slice(1) || 'File'} • ${asset.mimeType || 'Unknown type'}</p>
                    <div class="result-channels">
                        ${(asset.compatibleChannels || []).slice(0, 3).map(c => `<span class="channel-badge">${c}</span>`).join('')}
                        ${(asset.compatibleChannels || []).length > 3 ? `<span class="more">+${asset.compatibleChannels.length - 3}</span>` : ''}
                    </div>
                </div>
                <div class="result-actions">
                    ${asset.viewUrl ? `<a href="${asset.viewUrl}" target="_blank" class="int-btn-view" title="View in Google Drive">👁️</a>` : ''}
                    <button class="int-btn-import-single" data-asset='${JSON.stringify(asset).replace(/'/g, "&#39;")}' title="Import to Library">📥 Import</button>
                </div>
            </div>
        `).join('');
        
        // Import single asset handlers
        contentDiv.querySelectorAll('.int-btn-import-single').forEach(btn => {
            btn.addEventListener('click', async () => {
                try {
                    const asset = JSON.parse(btn.dataset.asset.replace(/&#39;/g, "'"));
                    btn.disabled = true;
                    btn.innerHTML = '⏳';
                    await hub.importAsset(asset);
                    hub.showToast(`📥 Imported: ${asset.name}`, 'success');
                    btn.innerHTML = '✅';
                } catch (err) {
                    hub.showToast(`Import failed: ${err.message}`, 'error');
                    btn.disabled = false;
                    btn.innerHTML = '📥 Import';
                }
            });
        });
        
        // Scroll to results
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // ============================================
    // INTEGRATION STYLES (Enhanced v3.0)
    // ============================================
    const integrationStyles = `
        .integrations-panel {
            padding: 1.5rem;
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .integrations-header {
            margin-bottom: 2rem;
            text-align: center;
        }
        
        .integrations-header h2 {
            font-size: 2rem;
            color: #fff;
            margin-bottom: 0.5rem;
        }
        
        .integrations-header p {
            color: #a5b4fc;
            margin-bottom: 1rem;
        }
        
        .integrations-user-info {
            margin-bottom: 0.75rem;
        }
        
        .integrations-user-info .user-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(168, 85, 247, 0.15);
            border: 1px solid rgba(168, 85, 247, 0.3);
            padding: 0.5rem 1rem;
            border-radius: var(--cav-radius, 10px);
            color: #c4b5fd;
            font-size: 0.85rem;
        }
        
        .integrations-user-info .user-badge svg {
            width: 16px;
            height: 16px;
            opacity: 0.8;
        }
        
        .integrations-stats {
            display: flex;
            gap: 2rem;
            justify-content: center;
        }
        
        .integrations-stats .stat {
            color: #c4b5fd;
            font-size: 0.9rem;
        }
        
        .integrations-stats .stat strong {
            color: #22c55e;
            font-size: 1.2rem;
        }
        
        /* SVG Icons in buttons */
        .int-btn svg,
        .integration-icon svg,
        .category-title svg,
        .status-badge svg {
            width: 16px;
            height: 16px;
            display: inline-block;
            vertical-align: middle;
            margin-right: 0.25rem;
        }
        
        .integration-icon svg {
            width: 24px;
            height: 24px;
            margin-right: 0;
        }
        
        .integration-category {
            margin-bottom: 2rem;
        }
        
        .category-title {
            color: #fff;
            font-size: 1.1rem;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .integrations-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 1rem;
        }
        
        .integration-card {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 12px;
            padding: 1.25rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            transition: all 0.3s ease;
        }
        
        .integration-card:hover {
            border-color: rgba(168, 85, 247, 0.4);
            transform: translateY(-2px);
        }
        
        .integration-card.connected {
            border-color: rgba(34, 197, 94, 0.5);
            background: rgba(34, 197, 94, 0.05);
        }
        
        .integration-header {
            display: flex;
            gap: 1rem;
            align-items: flex-start;
        }
        
        .integration-icon {
            width: 48px;
            height: 48px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            flex-shrink: 0;
        }
        
        .integration-info h4 {
            color: #fff;
            font-size: 1rem;
            margin-bottom: 0.25rem;
            font-weight: 600;
        }
        
        .integration-desc {
            color: #9ca3af;
            font-size: 0.8rem;
            line-height: 1.4;
        }
        
        .integration-connected-info {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            align-items: center;
        }
        
        .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        
        .status-badge.connected {
            background: rgba(34, 197, 94, 0.2);
            color: #22c55e;
        }
        
        .account-email {
            color: #9ca3af;
            font-size: 0.75rem;
        }
        
        .selected-folder {
            color: #60a5fa;
            font-size: 0.75rem;
            background: rgba(96, 165, 250, 0.1);
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
        }
        
        .integration-actions {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
            margin-top: auto;
        }
        
        .int-btn {
            padding: 0.5rem 0.75rem;
            border-radius: 6px;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.2s ease;
            border: none;
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
        }
        
        .int-btn-connect {
            background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
            color: #fff;
            font-weight: 600;
            flex: 1;
            justify-content: center;
        }
        
        .int-btn-connect:hover {
            filter: brightness(1.1);
        }
        
        .int-btn-scan {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: #fff;
        }
        
        .int-btn-folder {
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
        }
        
        .int-btn-disconnect {
            background: transparent;
            border: 1px solid rgba(239, 68, 68, 0.3) !important;
            color: #ef4444;
            padding: 0.5rem;
        }
        
        .int-btn-disconnect:hover {
            background: rgba(239, 68, 68, 0.1);
        }
        
        /* Coming Soon button */
        .int-btn-coming-soon {
            background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
            color: #d1d5db;
            font-weight: 600;
            flex: 1;
            justify-content: center;
            cursor: not-allowed;
            opacity: 0.8;
        }
        
        .coming-soon-note {
            display: block;
            color: #9ca3af;
            font-size: 0.7rem;
            font-style: italic;
            margin-top: 0.25rem;
            width: 100%;
        }
        
        /* Admin Only badge */
        .admin-only-badge {
            display: inline-flex;
            align-items: center;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #fca5a5;
            font-size: 0.7rem;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            margin-left: 0.5rem;
        }
        
        .webhook-info {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            padding: 0.75rem;
            margin-top: 0.5rem;
        }
        
        .webhook-info label {
            display: block;
            color: #9ca3af;
            font-size: 0.75rem;
            margin-bottom: 0.5rem;
        }
        
        .webhook-url-input {
            width: 100%;
            padding: 0.5rem;
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            color: #fff;
            font-size: 0.75rem;
            margin-bottom: 0.5rem;
        }
        
        .int-btn-copy {
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            border: none;
            padding: 0.4rem 0.75rem;
            border-radius: 4px;
            font-size: 0.75rem;
            cursor: pointer;
        }
        
        /* Settings */
        .integrations-settings {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .integrations-settings h3 {
            color: #fff;
            margin-bottom: 1rem;
        }
        
        .settings-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1rem;
        }
        
        .settings-row {
            margin-bottom: 0.5rem;
        }
        
        .settings-row label {
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: #e9d5ff;
            gap: 1rem;
        }
        
        .settings-row input[type="text"],
        .settings-row input[type="email"],
        .settings-row input[type="url"],
        .settings-row select {
            padding: 0.5rem 0.75rem;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            color: #fff;
            flex: 1;
            max-width: 250px;
        }
        
        .settings-row input[type="checkbox"] {
            width: 18px;
            height: 18px;
            accent-color: #a855f7;
        }
        
        .int-btn-save-settings {
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            border: none;
            border-radius: 8px;
            color: #fff;
            font-weight: 600;
            cursor: pointer;
            margin-top: 1rem;
        }
        
        /* Results */
        .integrations-results {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 12px;
            padding: 1.5rem;
        }
        
        .results-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }
        
        .results-header h3 {
            color: #fff;
            margin: 0;
        }
        
        .results-summary {
            display: flex;
            gap: 1rem;
        }
        
        .summary-stat {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.8rem;
        }
        
        .summary-stat.eligible {
            background: rgba(34, 197, 94, 0.2);
            color: #22c55e;
        }
        
        .summary-stat.resize {
            background: rgba(251, 191, 36, 0.2);
            color: #fbbf24;
        }
        
        .summary-stat.total {
            background: rgba(96, 165, 250, 0.2);
            color: #60a5fa;
        }
        
        .results-tabs {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding-bottom: 0.5rem;
        }
        
        .results-tab {
            padding: 0.5rem 1rem;
            background: transparent;
            border: none;
            color: #9ca3af;
            cursor: pointer;
            border-radius: 6px;
        }
        
        .results-tab.active {
            background: rgba(168, 85, 247, 0.2);
            color: #a855f7;
        }
        
        .scan-result-item {
            display: flex;
            gap: 1rem;
            padding: 1rem;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            margin-bottom: 0.5rem;
            align-items: center;
        }
        
        .scan-result-item.eligible {
            border-left: 3px solid #22c55e;
        }
        
        .scan-result-item.needs_resizing {
            border-left: 3px solid #fbbf24;
        }
        
        .result-preview {
            width: 60px;
            height: 60px;
            border-radius: 8px;
            overflow: hidden;
            background: rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .result-preview img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .result-icon {
            font-size: 1.5rem;
        }
        
        .result-info {
            flex: 1;
        }
        
        .result-info h5 {
            color: #fff;
            font-size: 0.9rem;
            margin-bottom: 0.25rem;
        }
        
        .result-info p {
            color: #9ca3af;
            font-size: 0.8rem;
            margin-bottom: 0.5rem;
        }
        
        .result-channels {
            display: flex;
            gap: 0.25rem;
            flex-wrap: wrap;
        }
        
        .channel-badge {
            padding: 0.15rem 0.5rem;
            background: rgba(96, 165, 250, 0.2);
            color: #60a5fa;
            border-radius: 4px;
            font-size: 0.7rem;
        }
        
        .result-actions .int-btn-import-single {
            padding: 0.4rem 0.75rem;
            background: rgba(34, 197, 94, 0.2);
            color: #22c55e;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.8rem;
        }
        
        .result-actions .int-btn-view {
            padding: 0.4rem 0.5rem;
            background: rgba(96, 165, 250, 0.2);
            color: #60a5fa;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.8rem;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
        }
        
        .result-actions {
            display: flex;
            gap: 0.5rem;
            align-items: center;
        }
        
        .result-info .result-meta {
            color: #9ca3af;
            font-size: 0.8rem;
            margin-bottom: 0.25rem;
        }
        
        .result-info .result-type {
            color: #6b7280;
            font-size: 0.75rem;
            margin-bottom: 0.5rem;
        }
        
        /* Summary stat additional types */
        .summary-stat.images {
            background: rgba(59, 130, 246, 0.2);
            color: #3b82f6;
        }
        
        .summary-stat.videos {
            background: rgba(168, 85, 247, 0.2);
            color: #a855f7;
        }
        
        .summary-stat.documents {
            background: rgba(251, 146, 60, 0.2);
            color: #fb923c;
        }
        
        /* Empty state for scan results */
        .scan-empty-state {
            text-align: center;
            padding: 3rem 2rem;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 12px;
            border: 2px dashed rgba(255, 255, 255, 0.1);
        }
        
        .scan-empty-state .empty-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
        }
        
        .scan-empty-state h4 {
            color: #fff;
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
        }
        
        .scan-empty-state p {
            color: #9ca3af;
            font-size: 0.9rem;
            margin-bottom: 1.5rem;
        }
        
        .empty-suggestions {
            text-align: left;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            padding: 1rem 1.5rem;
            max-width: 400px;
            margin: 0 auto;
        }
        
        .empty-suggestions p {
            color: #a5b4fc;
            font-size: 0.85rem;
            margin-bottom: 0.5rem;
        }
        
        .empty-suggestions ul {
            margin: 0;
            padding-left: 1.25rem;
        }
        
        .empty-suggestions li {
            color: #d1d5db;
            font-size: 0.85rem;
            margin-bottom: 0.35rem;
        }
        
        /* Scroll container for results */
        .results-content {
            max-height: 600px;
            overflow-y: auto;
        }
        
        .results-content::-webkit-scrollbar {
            width: 8px;
        }
        
        .results-content::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 4px;
        }
        
        .results-content::-webkit-scrollbar-thumb {
            background: rgba(168, 85, 247, 0.5);
            border-radius: 4px;
        }
        
        .results-actions {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .int-btn-import-all {
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            color: #fff;
        }
        
        .int-btn-export {
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
        }
        
        /* Folder Picker Modal */
        .cav-folder-picker-modal {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            background: rgba(0, 0, 0, 0.85) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 999999 !important;
            overflow: hidden !important;
        }
        
        .cav-folder-picker-content {
            background: #1f2937;
            border-radius: 12px;
            width: 90%;
            max-width: 500px;
            max-height: 80vh;
            display: flex;
            flex-direction: column;
            position: relative;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(168, 85, 247, 0.3);
        }
        
        .cav-folder-picker-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .cav-folder-picker-header h3 {
            color: #fff;
            margin: 0;
        }
        
        .cav-folder-picker-close {
            background: none;
            border: none;
            color: #9ca3af;
            font-size: 1.5rem;
            cursor: pointer;
        }
        
        .cav-folder-picker-breadcrumb {
            padding: 0.5rem 1rem;
            background: rgba(0, 0, 0, 0.2);
            color: #9ca3af;
            font-size: 0.85rem;
        }
        
        .cav-folder-picker-list {
            flex: 1;
            overflow-y: auto;
            padding: 0.5rem;
        }
        
        .cav-folder-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem;
            border-radius: 8px;
            cursor: pointer;
            color: #fff;
        }
        
        .cav-folder-item:hover {
            background: rgba(168, 85, 247, 0.1);
        }
        
        .cav-folder-item.selected {
            background: rgba(168, 85, 247, 0.2);
            border: 1px solid rgba(168, 85, 247, 0.5);
        }
        
        .cav-folder-arrow {
            margin-left: auto;
            color: #9ca3af;
            font-size: 0.85rem;
        }
        
        .cav-folder-item:hover .cav-folder-arrow {
            color: #a855f7;
        }
        
        .cav-folder-loading,
        .cav-folder-empty {
            padding: 2rem;
            text-align: center;
            color: #9ca3af;
        }
        
        .cav-breadcrumb-item {
            cursor: pointer;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            transition: background 0.2s;
        }
        
        .cav-breadcrumb-item:hover:not(.current) {
            background: rgba(168, 85, 247, 0.1);
        }
        
        .cav-breadcrumb-item.current {
            color: #a855f7;
            font-weight: 500;
        }
        
        .cav-btn-select-current {
            padding: 0.5rem 1rem;
            background: rgba(59, 130, 246, 0.2);
            border: 1px solid rgba(59, 130, 246, 0.5);
            border-radius: 6px;
            color: #93c5fd;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .cav-btn-select-current:hover {
            background: rgba(59, 130, 246, 0.3);
            border-color: rgba(59, 130, 246, 0.7);
        }
        
        .cav-folder-picker-footer {
            display: flex;
            justify-content: flex-end;
            gap: 0.5rem;
            padding: 1rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .cav-btn-cancel {
            padding: 0.5rem 1rem;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            border-radius: 6px;
            color: #fff;
            cursor: pointer;
        }
        
        .cav-btn-select {
            padding: 0.5rem 1rem;
            background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
            border: none;
            border-radius: 6px;
            color: #fff;
            cursor: pointer;
        }
        
        .cav-btn-select:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        /* Gmail Filter Modal */
        .cav-gmail-filter-modal {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        }
        
        .cav-gmail-filter-content {
            background: #1f2937;
            border-radius: 12px;
            width: 90%;
            max-width: 500px;
            max-height: 85vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        
        .cav-gmail-filter-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .cav-gmail-filter-header h3 {
            color: #fff;
            margin: 0;
        }
        
        .cav-gmail-filter-close {
            background: none;
            border: none;
            color: #9ca3af;
            font-size: 1.5rem;
            cursor: pointer;
        }
        
        .cav-gmail-filter-body {
            flex: 1;
            overflow-y: auto;
            padding: 1rem;
        }
        
        .cav-gmail-filter-body .filter-group {
            margin-bottom: 1rem;
        }
        
        .cav-gmail-filter-body .filter-group label {
            display: block;
            color: #e9d5ff;
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
        }
        
        .cav-gmail-filter-body .filter-group input,
        .cav-gmail-filter-body .filter-group select {
            width: 100%;
            padding: 0.6rem 0.75rem;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            color: #fff;
            font-size: 0.9rem;
        }
        
        .cav-gmail-filter-body .filter-group small {
            display: block;
            color: #6b7280;
            font-size: 0.75rem;
            margin-top: 0.25rem;
        }
        
        .cav-gmail-filter-body .date-range {
            display: flex;
            gap: 0.5rem;
            align-items: center;
        }
        
        .cav-gmail-filter-body .date-range span {
            color: #9ca3af;
        }
        
        .cav-gmail-filter-footer {
            display: flex;
            justify-content: space-between;
            padding: 1rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .cav-btn-clear-filters {
            padding: 0.5rem 1rem;
            background: transparent;
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 6px;
            color: #ef4444;
            cursor: pointer;
        }
        
        .cav-btn-apply-filters {
            padding: 0.5rem 1.5rem;
            background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
            border: none;
            border-radius: 6px;
            color: #fff;
            cursor: pointer;
            font-weight: 600;
        }
        
        /* Sheets Picker Modal */
        .cav-sheets-picker-modal {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        }
        
        .cav-sheets-picker-content {
            background: #1f2937;
            border-radius: 12px;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            display: flex;
            flex-direction: column;
        }
        
        .cav-sheets-picker-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .cav-sheets-picker-header h3 {
            color: #fff;
            margin: 0;
        }
        
        .cav-sheets-picker-close {
            background: none;
            border: none;
            color: #9ca3af;
            font-size: 1.5rem;
            cursor: pointer;
        }
        
        .cav-sheets-url-input {
            padding: 1rem;
            background: rgba(0, 0, 0, 0.2);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .cav-sheets-url-input label {
            display: block;
            color: #9ca3af;
            font-size: 0.85rem;
            margin-bottom: 0.5rem;
        }
        
        .cav-sheets-url-input input {
            width: calc(100% - 100px);
            padding: 0.5rem 0.75rem;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px 0 0 6px;
            color: #fff;
            font-size: 0.85rem;
        }
        
        .cav-btn-use-url {
            padding: 0.5rem 0.75rem;
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            border: none;
            border-radius: 0 6px 6px 0;
            color: #fff;
            cursor: pointer;
            font-weight: 500;
        }
        
        .cav-sheets-picker-list {
            flex: 1;
            overflow-y: auto;
            padding: 0.5rem;
        }
        
        .cav-sheet-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem;
            border-radius: 8px;
            cursor: pointer;
            color: #fff;
        }
        
        .cav-sheet-item:hover {
            background: rgba(34, 197, 94, 0.1);
        }
        
        .cav-sheet-icon {
            font-size: 1.2rem;
        }
        
        .cav-sheet-name {
            flex: 1;
        }
        
        .cav-sheet-date {
            color: #6b7280;
            font-size: 0.8rem;
        }
        
        .cav-sheets-picker-list .no-sheets {
            text-align: center;
            color: #6b7280;
            padding: 2rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .integrations-grid {
                grid-template-columns: 1fr;
            }
            
            .settings-grid {
                grid-template-columns: 1fr;
            }
            
            .results-actions {
                flex-direction: column;
            }
        }
    `;

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = integrationStyles;
    document.head.appendChild(styleSheet);

    // ============================================
    // EXPORT
    // ============================================
    window.IntegrationHub = IntegrationHub;
    window.cavIntegrations = new IntegrationHub();
    window.cavIntegrations.createPanel = createIntegrationsPanel;
    window.INTEGRATIONS = INTEGRATIONS;
    window.CHANNEL_SIZE_SPECS = CHANNEL_SIZE_SPECS;

    // Setup Zapier webhook endpoint listener
    window.cavIntegrations.webhookEndpoint = async (webhookId, payload) => {
        return window.cavIntegrations.handleZapierWebhook(webhookId, payload);
    };

    console.log('🔗 Integration Hub loaded - Version 3.3.0');
    console.log('   ✅ USER-SPECIFIC STORAGE: Each user has their own integrations (not shared)');
    console.log('   ✅ OAuth per documentation: Correct scopes & endpoints for all services');
    console.log('   ✅ CONFIGURED: Google Drive, Google Sheets, Gmail, Dropbox, Slack');
    console.log('   ✅ COMING SOON: OneDrive, Figma, Adobe CC, Zapier, Outlook, Wrike, Monday, Basecamp');
    console.log('   ✅ SUPER ADMIN: Integration API Keys settings section for credential management');
    console.log('   ✅ Cloud Storage: Google Drive, Dropbox, OneDrive (with folder pickers)');
    console.log('   ✅ Productivity: Google Sheets (image URL scanning)');
    console.log('   ✅ Design Tools: Figma, Adobe Creative Cloud');
    console.log('   ✅ Communication: Slack (Events API file scanning)');
    console.log('   ✅ Automation: Zapier (webhook receiver)');
    console.log('   ✅ Email: Gmail, Outlook');
    console.log('   ✅ Project Management: Wrike, Monday, Basecamp');
    console.log('   ✅ CRM Logging: Eligibility analysis & scan reports');
    console.log('   ✅ Styling: SVG icons matching Creative Asset Validator design');

})();

