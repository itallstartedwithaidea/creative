# 🚀 Deployment Guide: Creative Asset Validator v4.1.1

This guide walks you through deploying Creative Asset Validator to your website for live user access.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] Web hosting with HTTPS (SSL certificate required for OAuth)
- [ ] Google Cloud Console account (for OAuth setup)
- [ ] FTP/SFTP access or hosting control panel
- [ ] Domain name configured

---

## 🔧 Step 1: Configure Google OAuth

### 1.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select existing project
3. Name it (e.g., "Creative Asset Validator")

### 1.2 Enable APIs

Enable these APIs in your project:
- **Google Identity Services API** (required for sign-in)
- **Google Drive API** (for Drive integration)
- **Gmail API** (for email scanning)
- **Google Sheets API** (for spreadsheet scanning)

### 1.3 Configure OAuth Consent Screen

1. Go to **APIs & Services > OAuth consent screen**
2. Choose "External" user type
3. Fill in:
   - App name: "Creative Asset Validator"
   - User support email: your email
   - Developer contact: your email
4. Add scopes:
   - `openid`
   - `email`
   - `profile`
   - `https://www.googleapis.com/auth/drive.readonly`
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/spreadsheets.readonly`

### 1.4 Create OAuth Credentials

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Name: "Creative Asset Validator Web"
5. Add **Authorized JavaScript origins**:
   ```
   https://yourdomain.com
   https://www.yourdomain.com
   ```
6. Copy the **Client ID** (looks like: `123456789-abc.apps.googleusercontent.com`)

---

## 🔧 Step 2: Update Configuration

### 2.1 Copy and Edit auth-config.js

First, copy the example template:

```bash
cp auth-config.example.js auth-config.js
```

Then open `auth-config.js` and update:

```javascript
window.AUTH_CONFIG = {
    // Replace with your Client ID from Step 1.4
    GOOGLE_CLIENT_ID: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
    
    // Your corporate domains (users with these emails get auto-approved)
    CORPORATE_DOMAINS: [
        'yourdomain.com',
        'yourcompany.com'
    ],
    
    // Super admin emails (full access to everything)
    ADMIN_EMAILS: [
        'admin@yourdomain.com',
        'john@yourdomain.com'
    ],
    
    // Pre-approved personal emails (optional)
    WHITELISTED_EMAILS: [],
    
    // Feature toggles
    FEATURES: {
        TEAM_SHARING_ENABLED: true,
        PERSONAL_USERS_ENABLED: false,  // Block personal emails
        ACTIVITY_LOG_ENABLED: true,
        AI_ADAPTER_ENABLED: true,
        SESSION_DURATION_DAYS: 30,
        ITEMS_PER_PAGE: 24
    }
};
```

---

## 🔧 Step 3: Upload Files

### Required Files (All must be uploaded)

```
/your-app-folder/
├── index.html              # Main application
├── validator.css           # All styling
├── security-core.js        # Security module (REQUIRED)
├── auth-config.js          # Your configuration
├── validator-app.js        # Core library
├── ai-adapter.js
├── ai-intelligence-engine.js
├── ai-library-integration.js
├── ai-library-manager.js
├── ai-orchestrator.js
├── ai-studio.js
├── analyze-module.js
├── strategy-module.js
├── learn-module.js
├── crm.js
├── integrations.js
├── logo-generator.js
├── auto-fix.js
├── advanced-features.js
├── advanced-toolbar.js
├── settings-module.js
└── data-models.js
```

---

## 🔒 Security Recommendations

### Domain Restrictions

For production, ensure only your domains can access:

```javascript
// In auth-config.js
CORPORATE_DOMAINS: ['yourdomain.com'],
PERSONAL_USERS_ENABLED: false,  // Block Gmail, Yahoo, etc.
```

### HTTPS Required

OAuth only works on HTTPS. Ensure your SSL certificate is valid.

---

**Deployed with ❤️ - Creative Asset Validator v4.1.1**
