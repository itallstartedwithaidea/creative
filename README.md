# Creative Asset Validator

**Enterprise-Grade Creative Intelligence Platform**

![Version](https://img.shields.io/badge/version-5.11.0-blue.svg)
![Status](https://img.shields.io/badge/status-Production%20Ready-brightgreen.svg)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)
![Platform](https://img.shields.io/badge/platform-Web-green.svg)
![AI](https://img.shields.io/badge/AI-Multi--Model-purple.svg)
![Lines](https://img.shields.io/badge/lines_of_code-102%2C000%2B-orange.svg)

The complete solution for validating, organizing, and optimizing advertising creative assets across 50+ platforms. Built for marketing teams, agencies, and enterprises.

**Live:** [creativeassetvalidator.com](https://creativeassetvalidator.com)
**Repository:** [github.com/itallstartedwithaidea/creative](https://github.com/itallstartedwithaidea/creative)
**Parent Project:** [googleadsagent.ai](https://googleadsagent.ai)

---

## Table of Contents

- [Overview](#overview)
- [Modules](#modules)
  - [Asset Library](#1-asset-library)
  - [Analyze](#2-analyze--creative-intelligence)
  - [AI Studio](#3-ai-studio)
  - [Brand Kit Generator](#4-brand-kit-generator)
  - [Google Ads Builder](#5-google-ads-builder)
  - [Social Media Ad Builder](#6-social-media-ad-builder)
  - [Keyword & Landing Page Analyzer](#7-keyword--landing-page-analyzer)
  - [Strategy](#8-strategy--deployment-planning)
  - [Learn](#9-learn--knowledge-intelligence)
  - [CRM](#10-crm)
  - [Integrations](#11-integrations)
  - [Settings](#12-settings--api-keys)
  - [Admin Panel](#13-admin-panel)
- [Architecture](#architecture)
  - [Frontend](#frontend)
  - [Backend API](#backend-api-php)
  - [Database](#database-mysql)
  - [Supabase Edge Functions](#supabase-edge-functions)
  - [Storage](#storage-layer)
  - [Security](#security)
- [API Reference](#api-reference)
- [File Manifest](#file-manifest)
- [Deployment](#deployment)
  - [Prerequisites](#prerequisites)
  - [Google OAuth Setup](#step-1-google-oauth-setup)
  - [Configuration](#step-2-configuration)
  - [Hosting Options](#step-3-deploy)
- [Environment Variables](#environment-variables)
- [License](#license)

---

## Overview

Creative Asset Validator automates the creative asset workflow for digital advertising teams. Upload images and videos, validate them against platform specifications for YouTube, TikTok, Meta, Google Ads, DV360, The Trade Desk, connected TV networks, and 40+ more channels. Then analyze performance with multi-model AI, generate ad copy, plan strategy, and manage clients — all from a single browser-based platform.

The application runs entirely client-side with optional cloud synchronization, requiring no complex backend infrastructure for basic operation while supporting full SaaS deployment with MySQL, Cloudinary, and Supabase for enterprise teams.

### Key Capabilities

- **Asset validation** against 50+ advertising platform specifications
- **Multi-model AI analysis** via Claude, GPT-4, and Gemini
- **AI image/video generation** via Google Imagen and Veo 3.1
- **Google Ads and social media ad copy generation** with CSV export
- **Keyword and landing page intelligence** for PPC/SEO
- **Campaign strategy planning** with placement matrices and fatigue prediction
- **CRM** with company profiles, project tracking, and team sharing
- **Integration hub** connecting Google Drive, Gmail, Sheets, Dropbox, and Slack
- **Offline-first architecture** with IndexedDB and bidirectional cloud sync
- **Enterprise security** with Google SSO, AES-256-GCM encryption, and RBAC

---

## Modules

The platform is organized into 13 modules accessible from the sidebar navigation, grouped into three categories: **Create**, **Plan**, and **Manage**.

### Create

#### 1. Asset Library

**File:** `validator-app.js` (4,405 lines)

The central hub for all creative assets. Upload images and videos via drag-and-drop, and the system automatically validates them against specifications for every major advertising platform.

- Drag-and-drop upload with bulk support (10+ assets at once)
- Automatic metadata extraction (dimensions, duration, file size, aspect ratio, codec)
- Real-time validation against 50+ platform channel specifications
- Visual status badges: compatible (green), needs work (yellow), incompatible (red)
- Folder organization with tags, favorites, and archive
- Duplicate detection with perceptual hashing
- Batch tagging, bulk actions, and batch operations
- Processing queue for large uploads
- Sorting, filtering, and true pagination (configurable items per page)
- Video preview with inline playback
- Resolution recommendations per channel
- File rename, download original, soft delete with trash/archive
- Keyboard shortcuts for power users
- Storage quota display with visual progress bar
- User attribution on every asset
- Role-based UI (Admin sees everything, Viewer sees read-only)

#### 2. Analyze — Creative Intelligence

**File:** `analyze-module.js` (3,209 lines) + `ai-enhanced-analysis.js`

Multi-dimensional creative analysis powered by AI. Upload or select an asset and receive comprehensive scoring across six dimensions.

- **Hook Analysis** — Score the opening seconds for attention capture; evaluates pattern interrupt, curiosity gap, emotional trigger, and visual dynamism
- **CTA Audit** — Evaluate call-to-action clarity, urgency, placement, and contrast
- **Brand Compliance** — Verify logo placement, brand colors, font usage, and guideline adherence
- **Audio Strategy** — Analyze music selection, voiceover quality, sound effects, and audio-visual sync
- **Thumb-Stop Score** — Predict whether the asset will stop a user mid-scroll based on visual contrast, text overlay, facial presence, and motion
- **Performance Prediction** — Estimate engagement rate, CTR, conversion potential, and view-through rate with confidence intervals

Each analysis dimension produces a 0–100 score with evidence-based reasoning and actionable recommendations. The system can orchestrate Claude, GPT-4, and Gemini simultaneously to provide multi-perspective analysis.

#### 3. AI Studio

**File:** `ai-studio.js` (3,493 lines)

Direct access to Google's generative AI capabilities for creating new visual assets from text or existing images.

- **Text-to-Image** — Generate visuals from descriptions using Gemini Imagen (Nano Banana and Nano Banana Pro models)
- **Image-to-Video** — Convert still images to motion video with Veo 3.1 (with native audio generation)
- **Multi-Image Generation** — Generate up to 8 image variations in a single request
- **Google Ads PMax Presets** — One-click generation of all Performance Max required sizes
- **Outpainting** — Extend images to new aspect ratios
- **Background Removal** — Isolate subjects with AI segmentation
- Prompt input with system instructions and temperature control
- Model selection: Nano Banana, Nano Banana Pro, Veo 3.1, Veo 3.1 Fast, Gemini 3 Flash
- Aspect ratio, resolution, and thinking level controls
- Google Search grounding support
- Generation history with local persistence

#### 4. Brand Kit Generator

**File:** `logo-generator.js` (2,595 lines)

Upload a single high-resolution logo and automatically generate 100+ format variations for every major platform and use case.

- Social media profile images and cover photos (Facebook, Instagram, LinkedIn, X, TikTok, YouTube, Pinterest)
- Google Ads banner sizes (all standard IAB sizes)
- Favicons and app icons (16×16 through 512×512)
- Email signatures
- Print-ready formats (business card, letterhead, A4, US Letter)
- AI upscaling for low-resolution source images
- Proper aspect ratio maintenance across all variations
- Batch download as ZIP

#### 5. Google Ads Builder

**File:** `google-ads-builder.js` (1,909 lines)

AI-powered campaign builder supporting all major Google Ads campaign types with Google Ads Editor-compatible CSV export.

- **6 Campaign Types:** RSA (Responsive Search Ads), Performance Max, Display, Demand Gen, Video, Shopping
- AI-generated headlines and descriptions with proper character limits per type
- Headline type distribution: benefit, feature, urgency, social proof, question, problem, solution, offer/CTA
- Multi-provider AI: Anthropic Claude, OpenAI GPT-4, Google Gemini
- Campaign refinement with AI feedback loops
- Saved campaigns with local persistence
- Google Ads Editor CSV export format
- Merchant Center product feed generation (29 columns)

**Also available as a standalone tool:** [googleadsagent.ai/tools/google-ads-builder](https://googleadsagent.ai/tools/google-ads-builder/)

#### 6. Social Media Ad Builder

**File:** `social-media-builder.js` (1,937 lines)

Generate platform-specific ad copy for every major social platform with character limits, best practices, and format specifications built in.

- **Platforms:** Meta (Facebook/Instagram), TikTok, LinkedIn, X/Twitter, Pinterest, Snapchat, YouTube
- **Ad Types per Platform:** Feed, carousel, stories, reels, lead gen, messaging, collection, and more
- Character limit enforcement with optimal length guidance
- Mobile-safe text truncation warnings
- Platform-specific field sets (primary text, headline, description, CTA, etc.)
- AI-powered copy generation using Claude, GPT-4, or Gemini
- Export as CSV or copy individual fields

#### 7. Keyword & Landing Page Analyzer

**File:** `keyword-analyzer.js` (3,833 lines)

Advanced keyword and landing page intelligence for PPC and SEO. Analyze keywords for Quality Score potential, landing page conversion readiness, and competitive positioning.

- **Two-Phase AI Analysis:** Keywords first, then deep strategic insights
- PPC keyword analysis with Quality Score prediction
- Landing page conversion audit (load speed, CTA clarity, trust signals, mobile UX)
- Competitive keyword gap analysis
- Search intent classification
- Projected impact modeling with confidence intervals
- SERP feature opportunity detection
- Negative keyword recommendations
- Ad group structure suggestions
- Web research integration for real industry benchmarks

### Plan

#### 8. Strategy — Deployment Planning

**File:** `strategy-module.js` (2,542 lines)

Campaign planning tools for mapping creative assets to platform requirements, predicting performance, and optimizing budget allocation.

- **Placement Matrix** — Visual grid showing all platform requirements and asset readiness
- **Derivative Roadmap** — Map every resize and variation needed from master assets
- **A/B Test Planner** — Design hypothesis-driven creative tests with suggested variables, audiences, and success metrics
- **Budget Allocation** — AI-recommended spend distribution across platforms based on asset quality and audience fit
- **Creative Fatigue Prediction** — Estimate when assets need refreshing based on frequency, platform, content type, and seasonality
- **Platform Fit Scoring** — Rate assets against platform culture, audience alignment, and format optimization

#### 9. Learn — Knowledge Intelligence

**File:** `learn-module.js` (4,637 lines)

A knowledge base and competitive intelligence system for staying current on platform best practices, industry benchmarks, and competitor creative strategies.

- **URL Analyzer** — Paste any URL to extract and analyze creative assets, landing pages, or competitor ads
- **Competitor Tracking** — Monitor competitor ad libraries across platforms with change detection
- **Best Practices Library** — Curated and AI-updated repository of platform-specific creative guidelines
- **Benchmarks Database** — Industry benchmark data for CTR, CPC, CPM, conversion rates by platform and vertical
- **Swipe File System** — Save and organize inspiring creative examples with tags and annotations
- Auto-categorization by platform, industry, and format

#### 10. CRM

**File:** `crm.js` (4,862 lines)

Built-in client and project management with HubSpot-style contact management, eliminating the need for separate CRM tools.

- Company profiles with brand guidelines, colors, fonts, and logo
- Project tracking with timelines, budgets, and status
- Contact management with roles and communication history
- Asset linking — attach validated assets to companies and projects
- Version history and audit trail
- Team sharing with granular access levels (View, Edit, Full)
- Domain-based automatic sharing for corporate teams
- Search, filter, and sort across all CRM entities
- Notes and activity logging per entity

### Manage

#### 11. Integrations

**File:** `integrations.js` (5,682 lines)

Connect to external services to import assets from existing workflows. Each integration includes eligibility analysis showing which assets meet platform requirements.

- **Google Drive** — Browse folders, scan for image/video assets, import directly into library
- **Google Sheets** — Extract image URLs from spreadsheets and validate
- **Gmail** — Scan email attachments for creative assets
- **Dropbox** — Folder synchronization and asset import
- **Slack** — Channel file scanning for shared creative assets
- User-specific credential storage (encrypted)
- Eligibility analysis per imported asset
- Batch import with validation

#### 12. Settings — API Keys & Configuration

**File:** `settings-module.js` (5,820 lines)

Centralized configuration for AI providers, storage, security, and application preferences.

- API key management for Claude (Anthropic), GPT-4 (OpenAI), Gemini (Google), and SearchAPI
- Connection testing with live validation for each provider
- Encrypted key storage (AES-256-GCM)
- Admin-level API key sharing — admins can share keys with team members
- Cloudinary BYOK (Bring Your Own Key) configuration
- Supabase connection settings
- Pagination preferences (items per page)
- Session duration configuration
- Feature toggle management
- Usage tracking and quota display

#### 13. Admin Panel

**Built into:** `index.html` inline + `security-core.js`

Enterprise administration dashboard for user management, access control, and audit logging. Only visible to Super Admin and Domain Admin roles.

- User management with role assignment (Viewer, Editor, Domain Admin, Super Admin)
- Add users from any domain (Super Admin) or within own domain (Domain Admin)
- Access request approval/denial queue
- Whitelist management for personal email addresses
- Activity audit log with 360-day retention and export
- Domain enforcement configuration
- Session management and device binding

---

## Architecture

### Frontend

Single-page application loaded from `index.html` (9,049 lines) with modular JavaScript. No build step required — all modules load via `<script>` tags with cache-busting version parameters.

**Load order** (critical — modules depend on earlier scripts):

```
1.  security-production.js    — CSP and global error handlers
2.  ai-models-config.js       — AI model definitions
3.  ai-model-selector.js      — Model selection UI
4.  validator-app.js           — Core library and asset management
5.  ai-adapter.js              — AI provider abstraction layer
6.  crm.js                     — CRM module
7.  integrations.js            — External service connections
8.  auto-fix.js                — AI-powered asset correction pipeline
9.  ai-studio.js               — Generative AI interface
10. google-ads-builder.js      — Google Ads campaign builder
11. social-media-builder.js    — Social media ad copy generator
12. keyword-analyzer.js        — Keyword/landing page intelligence
13. logo-generator.js          — Brand kit generation
14. ai-library-manager.js      — AI library management
15. ai-library-integration.js  — AI library integration layer
16. advanced-features.js       — Extended feature set
17. advanced-toolbar.js        — Enhanced toolbar UI
18. data-models.js             — Data schemas for all modules
19. settings-module.js         — Configuration management
20. ai-orchestrator.js         — Multi-AI task routing
21. ai-intelligence-engine.js  — AI intelligence orchestration
22. analyze-module.js          — Creative analysis
23. ai-enhanced-analysis.js    — Enhanced AI analysis layer
24. strategy-module.js         — Campaign strategy planning
25. learn-module.js            — Knowledge intelligence
26. video-extraction-layer.js  — Video content extraction
27. video-frame-extractor.js   — Frame-level video analysis
28. supabase-video-processor.js — Server-side video processing
29. supabase-video-client.js   — Supabase video client
30. video-intelligence-engine.js — Video intelligence pipeline
31. video-intelligence-client.js — Video intelligence client
32. video-analyzer.js          — Video analysis v1
33. video-analyzer-v2.js       — Video analysis v2 (evidence-based)
34. video-analyzer-ui.js       — Video analyzer UI layer
35. security-core.js           — AES-256-GCM encryption, session management
36. auth-config.production.js  — Production auth config (optional override)
37. auth-config.js             — Auth configuration
38. sync-engine.js             — Bidirectional cloud sync
39. cloudinary-client.js       — Cloudinary upload/transform/resize
```

**Styling:** `validator.css` (15,704 lines) — Complete CSS with dark theme, responsive layout, glassmorphic cards, and component library.

**Service Worker:** `sw.js` — Offline support with precaching and runtime caching.

### Backend API (PHP)

RESTful API with Google OAuth authentication, located in the `api/` directory.

```
api/
├── index.php                 — Router and all endpoint handlers (622+ lines)
├── config/
│   ├── config.example.php    — Configuration template
│   └── config.php            — Local configuration (gitignored)
├── core/
│   ├── Auth.php              — Google OAuth token validation, session management
│   ├── Database.php          — MySQL connection with prepared statements
│   └── Router.php            — Lightweight request router with param extraction
├── database/
│   └── schema.sql            — Full MySQL schema (users, teams, assets, CRM, sync)
├── services/
│   ├── CloudinaryService.php — Image/video upload, transform, resize, quota
│   └── SyncService.php       — Bidirectional sync with conflict resolution
├── video-processor.php       — Server-side video processing
└── logs/
    └── app.log               — Application log
```

### Database (MySQL)

Full SaaS-ready schema with 10+ tables:

| Table | Purpose |
|---|---|
| `users` | User accounts with Google ID, role, domain, Cloudinary BYOK, quota tracking |
| `user_sessions` | Session tokens with device fingerprint binding and expiry |
| `teams` | Domain-based team groupings |
| `team_members` | Team membership with role (member, admin) |
| `companies` | CRM companies with brand guidelines, sharing, sync tracking |
| `projects` | CRM projects linked to companies with timelines and budgets |
| `contacts` | CRM contacts linked to companies |
| `assets` | Asset metadata with validation results, tags, folders |
| `asset_shares` | Granular asset sharing (view, edit, full) |
| `sync_log` | Bidirectional sync tracking with version numbers |
| `activity_log` | Full audit trail with 360-day retention |
| `settings` | Admin-level and user-level configuration |

### Supabase Edge Functions

Server-side processing functions deployed to Supabase for tasks that require backend execution.

```
supabase/
├── functions/
│   ├── api-keys/index.ts         — Secure API key storage with AES-256-GCM
│   ├── transcribe-video/index.ts — Video download + Whisper transcription
│   ├── video-intelligence/index.ts — YouTube API + AssemblyAI + Cloudinary frames
│   └── video-process/index.ts    — Full video processing pipeline
└── migrations/
    └── 002–025                   — Schema migrations, RLS policies, column fixes
```

### Storage Layer

The application supports three storage modes:

| Mode | Technology | Use Case |
|---|---|---|
| **Local** | IndexedDB | Browser-based, zero infrastructure, works offline |
| **Cloud** | Cloudinary | CDN-delivered assets with on-the-fly transforms |
| **Hybrid** | IndexedDB + MySQL + Cloudinary | Full SaaS with bidirectional sync |

**Sync Engine** (`sync-engine.js`) handles bidirectional synchronization between browser IndexedDB and the MySQL backend with conflict resolution via version tracking, offline queue for pending changes, and real-time status updates.

**Unified Storage** (`unified-storage.js`) provides a single API across all storage backends.

### Security

| Layer | Implementation |
|---|---|
| Authentication | Google SSO via Identity Services API |
| Session Encryption | AES-256-GCM with PBKDF2 key derivation |
| Domain Enforcement | Configurable corporate domain requirements |
| Device Binding | Sessions tied to browser fingerprints |
| Anti-Tampering | HMAC-SHA256 signature verification |
| API Key Storage | Encrypted at rest, never exposed to client |
| Activity Logging | 360-day audit trail with export |
| Data Isolation | User-specific encrypted storage |
| Role-Based Access | Super Admin, Domain Admin, Editor, Viewer |
| CSP | Strict Content Security Policy via `_headers`, `netlify.toml`, `vercel.json` |
| Personal Email Blocking | Gmail, Yahoo, Hotmail, etc. blocked by default |

**Roles:**

| Role | Capabilities |
|---|---|
| **Viewer** | View assets, favorites, download |
| **Editor** | Upload, edit tags, rename, delete own assets, team access |
| **Domain Admin** | Manage users within own domain |
| **Super Admin** | Full access: all users, all domains, all settings, audit logs |

---

## API Reference

Base URL: `https://yourdomain.com/api/`

All endpoints require authentication via Bearer token (obtained from Google OAuth flow) except `/health`.

### Health

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Server health check with database status |

### Authentication

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/google` | Exchange Google credential for session token |
| `POST` | `/auth/session` | Validate existing session |
| `POST` | `/auth/logout` | Destroy session |
| `GET` | `/auth/me` | Get current user profile with Cloudinary quota |

### Assets

| Method | Path | Description |
|---|---|---|
| `GET` | `/assets` | List assets (filterable by `type`, `company_id`, `project_id`) |
| `POST` | `/assets` | Create asset with metadata and validation results |
| `PUT` | `/assets/{uuid}` | Update asset metadata, tags, or folder |
| `DELETE` | `/assets/{uuid}` | Soft-delete asset |

### Sync

| Method | Path | Description |
|---|---|---|
| `GET` | `/sync/status` | Get sync status and pending changes count |
| `GET` | `/sync/pull` | Pull changes since timestamp (filterable by `types`) |
| `POST` | `/sync/push` | Push local changes with conflict resolution |

### API Keys

| Method | Path | Description |
|---|---|---|
| `GET` | `/user/api-keys` | Get user's encrypted API keys |
| `POST` | `/user/api-keys` | Store encrypted API key for a service |
| `DELETE` | `/user/api-keys/{service}` | Delete API key for a service |
| `GET` | `/settings/api-keys` | Get admin-shared API keys |
| `POST` | `/settings/api-keys` | Store admin-level shared API key |
| `DELETE` | `/settings/api-keys/{service}` | Delete admin shared key |

### Cloudinary

| Method | Path | Description |
|---|---|---|
| `GET` | `/cloudinary/quota` | Get usage quota and remaining transforms |
| `POST` | `/cloudinary/signature` | Generate signed upload parameters |
| `POST` | `/cloudinary/transform` | Transform image (resize, crop, format) |
| `POST` | `/cloudinary/transform-video` | Transform video with resize options |
| `GET` | `/cloudinary/transform-url` | Generate transformation URL |

### CRM

| Method | Path | Description |
|---|---|---|
| `GET` | `/crm/companies` | List companies for current user/team |
| `POST` | `/crm/companies` | Create company with brand guidelines |

### Settings (Admin)

| Method | Path | Description |
|---|---|---|
| `POST` | `/settings/byok` | Configure Cloudinary Bring Your Own Key |

---

## File Manifest

### Core Application (Required)

| File | Size | Description |
|---|---|---|
| `index.html` | 550 KB | Main application shell, navigation, login, inline admin |
| `validator.css` | 300 KB | Complete stylesheet with dark theme and responsive layout |
| `validator-app.js` | 173 KB | Core asset library, upload, validation, pagination |
| `security-core.js` | 43 KB | AES-256-GCM encryption, session management, RBAC |
| `security-production.js` | 13 KB | CSP enforcement and global error handling |
| `auth-config.js` | 7 KB | Your OAuth and domain configuration |
| `data-models.js` | 27 KB | Data schemas for all modules |

### Feature Modules

| File | Size | Description |
|---|---|---|
| `ai-adapter.js` | 48 KB | AI provider abstraction (Claude, GPT-4, Gemini) |
| `ai-orchestrator.js` | 32 KB | Multi-AI task routing system |
| `ai-intelligence-engine.js` | 33 KB | AI intelligence orchestration |
| `ai-enhanced-analysis.js` | 30 KB | Enhanced creative analysis layer |
| `ai-models-config.js` | 24 KB | AI model definitions and capabilities |
| `ai-model-selector.js` | 24 KB | Model selection UI component |
| `ai-library-manager.js` | 39 KB | AI asset library management |
| `ai-library-integration.js` | 267 KB | AI library integration layer |
| `ai-studio.js` | 159 KB | Generative AI (Imagen, Veo 3.1) |
| `analyze-module.js` | 133 KB | Creative intelligence (hook, CTA, brand, audio, thumb-stop) |
| `strategy-module.js` | 108 KB | Deployment planning, A/B tests, fatigue prediction |
| `learn-module.js` | 312 KB | Knowledge intelligence, benchmarks, swipe files |
| `crm.js` | 236 KB | CRM module (companies, projects, contacts) |
| `integrations.js` | 251 KB | Integration hub (Drive, Sheets, Gmail, Dropbox, Slack) |
| `settings-module.js` | 320 KB | API key management and configuration |
| `google-ads-builder.js` | 82 KB | Google Ads campaign builder (6 campaign types) |
| `social-media-builder.js` | 82 KB | Social media ad copy generator |
| `keyword-analyzer.js` | 169 KB | Keyword & landing page intelligence |
| `logo-generator.js` | 106 KB | Brand kit generation (100+ format variations) |
| `auto-fix.js` | 35 KB | AI-powered asset correction pipeline |
| `advanced-features.js` | 72 KB | Extended feature set |
| `advanced-toolbar.js` | 20 KB | Enhanced toolbar UI |

### Video Analysis Pipeline

| File | Size | Description |
|---|---|---|
| `video-analyzer.js` | 62 KB | Video analysis v1 |
| `video-analyzer-v2.js` | 107 KB | Video analysis v2 (evidence-based scoring) |
| `video-analyzer-ui.js` | 111 KB | Video analyzer UI layer |
| `video-extraction-layer.js` | 36 KB | Bulletproof video content extraction |
| `video-frame-extractor.js` | 29 KB | Frame-level video analysis |
| `video-intelligence-engine.js` | 51 KB | Video intelligence pipeline |
| `video-intelligence-client.js` | 30 KB | Video intelligence client |

### Storage & Sync

| File | Size | Description |
|---|---|---|
| `sync-engine.js` | 22 KB | Bidirectional MySQL sync with conflict resolution |
| `unified-storage.js` | 51 KB | Unified storage API across backends |
| `persistence-ui.js` | 34 KB | Save/delete UI system |
| `realtime-sync.js` | 24 KB | Cross-device real-time sync |
| `cloudinary-client.js` | 47 KB | Cloudinary upload, transform, resize, quota |
| `supabase-backend.js` | 67 KB | Supabase integration layer |
| `supabase-full-integration.js` | 38 KB | Complete Supabase integration |
| `supabase-video-client.js` | 15 KB | Supabase video client |
| `supabase-video-processor.js` | 26 KB | Server-side video processing |

### Infrastructure

| File | Size | Description |
|---|---|---|
| `sw.js` | 6 KB | Service worker (offline support, precaching) |
| `netlify.toml` | 1 KB | Netlify security headers and CSP |
| `vercel.json` | 1.5 KB | Vercel security headers and CSP |
| `_headers` | 1 KB | Cloudflare Pages security headers |
| `auth-config.example.js` | 8 KB | Configuration template with full documentation |
| `auth-config.production.js` | 1.5 KB | Production config override |

### Testing

| File | Description |
|---|---|
| `_tests/debug.html` | Debug and diagnostics page |
| `_tests/google-test.html` | Google OAuth testing page |
| `test-cloudinary.py` | Cloudinary integration tests |
| `test-supabase.js` | Supabase connection tests |

---

## Deployment

### Prerequisites

- Web hosting with HTTPS (SSL required for OAuth)
- Google Cloud Console account
- Domain name configured

**Optional for full SaaS:**
- MySQL 8.0+ database (SiteGround, PlanetScale, or similar)
- Cloudinary account (for image/video CDN and transforms)
- Supabase project (for edge functions and real-time features)

### Step 1: Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project named "Creative Asset Validator"
3. Enable APIs:
   - Google Identity Services API (required)
   - Google Drive API (for Drive integration)
   - Gmail API (for email scanning)
   - Google Sheets API (for spreadsheet scanning)
4. Configure OAuth consent screen → External → Add scopes:
   - `openid`, `email`, `profile`
   - `https://www.googleapis.com/auth/drive.readonly`
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/spreadsheets.readonly`
5. Create OAuth 2.0 Client ID → Web application
6. Add Authorized JavaScript origins:
   ```
   https://yourdomain.com
   https://www.yourdomain.com
   ```
7. Copy the Client ID

### Step 2: Configuration

```bash
cp auth-config.example.js auth-config.js
```

Edit `auth-config.js`:

```javascript
window.AUTH_CONFIG = {
    GOOGLE_CLIENT_ID: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
    
    CORPORATE_DOMAINS: ['yourcompany.com'],
    
    ADMIN_EMAILS: ['admin@yourcompany.com'],
    
    WHITELISTED_EMAILS: [],
    
    FEATURES: {
        TEAM_SHARING_ENABLED: true,
        PERSONAL_USERS_ENABLED: false,
        ACTIVITY_LOG_ENABLED: true,
        AI_ADAPTER_ENABLED: true,
        SESSION_DURATION_DAYS: 30,
        ITEMS_PER_PAGE: 24
    }
};
```

For SaaS deployment, also configure `api/config/config.php` from the example template.

### Step 3: Deploy

**Cloudflare Pages:**
Upload all files from the `tools/asset-validator/` directory. The `_headers` file is automatically recognized by Cloudflare Pages for security header configuration.

**Netlify:**
Deploy with `netlify.toml` for automatic security header configuration.

**Vercel:**
Deploy with `vercel.json` for automatic security header configuration.

**Traditional Hosting (SiteGround, etc.):**
Upload all files via SFTP. Configure the `api/` directory with PHP 8.0+ and set up the MySQL database using `api/database/schema.sql`.

### Required Files for Frontend-Only Deployment

At minimum, upload these files:

```
index.html
validator.css
security-production.js
security-core.js
auth-config.js
validator-app.js
ai-adapter.js
ai-models-config.js
ai-model-selector.js
ai-orchestrator.js
ai-intelligence-engine.js
ai-enhanced-analysis.js
ai-studio.js
analyze-module.js
strategy-module.js
learn-module.js
crm.js
integrations.js
auto-fix.js
advanced-features.js
advanced-toolbar.js
data-models.js
settings-module.js
google-ads-builder.js
social-media-builder.js
keyword-analyzer.js
logo-generator.js
ai-library-manager.js
ai-library-integration.js
video-extraction-layer.js
video-frame-extractor.js
video-analyzer.js
video-analyzer-v2.js
video-analyzer-ui.js
video-intelligence-engine.js
video-intelligence-client.js
supabase-video-processor.js
supabase-video-client.js
cloudinary-client.js
sync-engine.js
sw.js
```

---

## Environment Variables

### Frontend (`auth-config.js`)

| Variable | Required | Description |
|---|---|---|
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth 2.0 Client ID |
| `CORPORATE_DOMAINS` | Yes | Array of auto-approved email domains |
| `ADMIN_EMAILS` | Yes | Super admin email addresses |
| `WHITELISTED_EMAILS` | No | Pre-approved personal emails |
| `FEATURES.*` | No | Feature flags (see `auth-config.example.js`) |

### Backend (`api/config/config.php`)

| Variable | Required | Description |
|---|---|---|
| `database.host` | Yes | MySQL host |
| `database.name` | Yes | MySQL database name |
| `database.user` | Yes | MySQL username |
| `database.pass` | Yes | MySQL password |
| `google.client_id` | Yes | Google OAuth Client ID |
| `security.encryption_key` | Yes | 64-char hex key for AES-256-GCM |
| `security.super_admins` | Yes | Super admin email array |
| `cloudinary.cloud_name` | No | Cloudinary cloud name |
| `cloudinary.api_key` | No | Cloudinary API key |
| `cloudinary.api_secret` | No | Cloudinary API secret |
| `cors.allowed_origins` | Yes | Array of allowed CORS origins |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla JavaScript (no framework), HTML5, CSS3 |
| Styling | Custom CSS with CSS variables, dark theme, responsive |
| Backend | PHP 8.0+ with custom router |
| Database | MySQL 8.0+ |
| Edge Functions | Supabase (Deno/TypeScript) |
| Auth | Google Identity Services (OAuth 2.0) |
| AI Providers | Anthropic Claude, OpenAI GPT-4, Google Gemini |
| Image/Video CDN | Cloudinary |
| Local Storage | IndexedDB |
| Encryption | Web Crypto API (AES-256-GCM, PBKDF2) |
| Offline | Service Worker with precache + runtime cache |

---

## License

Proprietary Software — All Rights Reserved

Copyright 2024–2026 It All Started With An Idea

---

**Creative Asset Validator** — *Validate. Organize. Optimize.*

Built for creative teams who demand precision and efficiency.

[itallstartedwithaidea.com](https://itallstartedwithaidea.com) · [googleadsagent.ai](https://googleadsagent.ai) · [GitHub](https://github.com/itallstartedwithaidea/creative)
