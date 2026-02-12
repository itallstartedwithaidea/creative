# Supabase Implementation Checklist
## Creative Innovate Tool - Multi-Tenant SaaS

**Last Updated**: January 18, 2026  
**Migration Version**: 013

---

## Pre-Implementation Verification

### Run Order
```bash
# 1. First run (if not already done)
supabase db push --include-migrations 012_reconcile_all_columns.sql

# 2. Then run alignment migration
supabase db push --include-migrations 013_align_with_saas_spec.sql

# 3. Deploy edge function
supabase functions deploy api-keys
```

### Environment Variables Required
```bash
# In Supabase Dashboard > Edge Functions > Secrets
ENCRYPTION_KEY=your-32-character-encryption-key  # For API key encryption
```

---

## Complete Table Coverage

### Core Identity (6 tables)
| Table | Status | Notes |
|-------|--------|-------|
| `organizations` | ✅ Ready | Multi-tenant orgs |
| `profiles` | ✅ Ready | Extended user data |
| `user_state` | ✅ Ready | Cross-device state sync |
| `api_keys` | ✅ Ready | Encrypted key storage |
| `api_key_usage` | ✅ Ready | Usage tracking |
| `shared_api_keys` | ✅ Ready | Legacy compatibility |

### Tool Management (2 tables)
| Table | Status | Notes |
|-------|--------|-------|
| `tool_definitions` | ✅ Ready | 10 tools seeded |
| `organization_tools` | ✅ Ready | Per-org tool access |

### Creative Validator (3 tables)
| Table | Status | Notes |
|-------|--------|-------|
| `brands` | ✅ Ready | Brand configurations |
| `validations` | ✅ Ready | Validation runs |
| `assets` | ✅ Ready | All columns added |

### CRM Module (9 tables)
| Table | Status | Notes |
|-------|--------|-------|
| `companies` | ✅ Ready | Company records |
| `contacts` | ✅ Ready | Contact records |
| `projects` | ✅ Ready | Project tracking |
| `deals` | ✅ Ready | Deal pipeline |
| `activities` | ✅ Ready | Activity timeline |
| `contact_activities` | ✅ Ready | CRM-specific activities |
| `tags` | ✅ Ready | CRM tags |
| `custom_fields` | ✅ Ready | Custom field definitions |
| `competitors` | ✅ Ready | Competitor tracking |

### Analyze Module (4 tables)
| Table | Status | Notes |
|-------|--------|-------|
| `creative_analyses` | ✅ Ready | Image/creative analysis |
| `strategies` | ✅ Ready | Strategy documents |
| `brand_profiles` | ✅ Ready | Brand profile data |
| `video_analyses` | ✅ Ready | Video analysis results |

### Learn Module (4 tables)
| Table | Status | Notes |
|-------|--------|-------|
| `url_analyses` | ✅ Ready | URL analysis results |
| `swipe_files` | ✅ Ready | Swipe file entries |
| `benchmarks` | ✅ Ready | Industry benchmarks |
| `best_practices` | ✅ Ready | Best practice library |

### Builder Modules (3 tables)
| Table | Status | Notes |
|-------|--------|-------|
| `google_ads_builds` | ✅ Ready | Google Ads campaigns |
| `social_media_builds` | ✅ Ready | Social media content |
| `keyword_research` | ✅ Ready | Keyword data |

### Video Intelligence (3 tables)
| Table | Status | Notes |
|-------|--------|-------|
| `video_analyses` | ✅ Ready | Analysis results |
| `video_templates` | ✅ Ready | Video AI templates |
| `video_chat_messages` | ✅ Ready | Chat history |

### System (5 tables)
| Table | Status | Notes |
|-------|--------|-------|
| `user_settings` | ✅ Ready | User preferences |
| `activity_log` | ✅ Ready | System activity |
| `ai_studio_history` | ✅ Ready | AI conversation history |
| `auto_fix_history` | ✅ Ready | Auto-fix records |
| `user_notifications` | ✅ Ready | In-app notifications |
| `integration_credentials` | ✅ Ready | Third-party integrations |

**Total Tables: 39**

---

## API Key Architecture

### Hierarchy
```
┌─────────────────────────────────────────────────────────────┐
│                    SUPER ADMIN (You)                        │
│                                                             │
│  Store Keys → share_level = 'platform'                      │
│  Available to: ALL organizations                            │
│                                                             │
│  Actions:                                                   │
│  - Add platform keys in Admin Settings                      │
│  - Share to all orgs with one click                         │
│  - View usage across all organizations                      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    ORG ADMINS                               │
│                                                             │
│  Store Keys → share_level = 'organization'                  │
│  Available to: Their team only                              │
│                                                             │
│  Can also use: Platform keys (shared by super admin)        │
│                                                             │
│  Actions:                                                   │
│  - Add org-level keys                                       │
│  - Share with team members                                  │
│  - Cannot see other orgs' keys                              │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      USERS                                  │
│                                                             │
│  Store Keys → share_level = 'private'                       │
│  Available to: Only themselves                              │
│                                                             │
│  Can also use:                                              │
│  - Platform keys (from super admin)                         │
│  - Organization keys (from org admin)                       │
│                                                             │
│  Actions:                                                   │
│  - Add personal API keys                                    │
│  - Override org/platform keys if desired                    │
└─────────────────────────────────────────────────────────────┘
```

### Key Resolution Order
When a user requests a key (e.g., for Gemini):
1. Check for **platform** key (super admin shared) → Use if available
2. Check for **organization** key (org admin shared) → Use if #1 not available
3. Check for **private** key (user's own) → Use if #1 and #2 not available
4. If none found → Prompt user to add their own key

### Edge Function Endpoints
```
POST /api-keys/get-key     → Get decrypted key for service
POST /api-keys/save-key    → Save new encrypted key
POST /api-keys/share-key   → Update sharing level
POST /api-keys/list        → List accessible keys (no values)
POST /api-keys/delete      → Remove a key
POST /api-keys/usage       → Log API usage
```

---

## RLS Security Model

### Helper Functions Created
```sql
auth_role()           -- Returns: 'super_admin' | 'org_admin' | 'user'
auth_org()            -- Returns: user's organization_id
auth_email()          -- Returns: user's email
is_super_admin()      -- Returns: boolean
is_org_admin()        -- Returns: boolean (includes super_admin)
is_org_member(org_id) -- Returns: boolean
same_organization()   -- Checks domain-based org match
```

### Policy Summary
| Role | Own Data | Team Data | Other Orgs | Platform |
|------|----------|-----------|------------|----------|
| Super Admin | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Org Admin | ✅ Full | ✅ Full | ❌ No | ✅ Read shared |
| User | ✅ Full | ✅ Read (if visibility=org) | ❌ No | ✅ Read shared |

---

## Realtime Sync Enabled Tables
The following tables are in the `supabase_realtime` publication:
- user_state, profiles
- companies, contacts, projects, deals, tags
- brands, validations, assets
- creative_analyses, strategies, video_analyses
- video_templates, video_chat_messages
- url_analyses, swipe_files, benchmarks, best_practices
- google_ads_builds, social_media_builds, keyword_research
- user_settings, brand_profiles, shared_api_keys, api_keys

---

## Post-Migration Steps

### 1. Set Yourself as Super Admin
```sql
UPDATE profiles 
SET role = 'super_admin' 
WHERE email = 'john@itallstartedwithaidea.com';
```

### 2. Create Your Organization (Optional)
```sql
INSERT INTO organizations (name, slug, plan, seats_limit)
VALUES ('It All Started With An Idea', 'iaswai', 'enterprise', 100);
```

### 3. Add Platform API Keys (via UI or SQL)
```sql
-- Example: Add Gemini key for all users
INSERT INTO api_keys (name, service, encrypted_key, key_hint, share_level, user_email)
VALUES (
  'Production Gemini API',
  'gemini',
  'YOUR_ENCRYPTED_KEY_HERE',  -- Use edge function to encrypt
  '...xyz',
  'platform',
  'john@itallstartedwithaidea.com'
);
```

### 4. Enable Realtime in Dashboard
Go to Database > Replication and verify `supabase_realtime` publication includes all tables listed above.

---

## Security Checklist

- [x] All tables have RLS enabled
- [x] Service role key never exposed to client
- [x] API keys encrypted at rest (AES-256-GCM)
- [x] Hierarchical access control implemented
- [x] Auth helper functions are SECURITY DEFINER
- [x] Usage tracking for billing/monitoring
- [ ] Set ENCRYPTION_KEY in edge function secrets
- [ ] Enable email confirmation in Auth settings
- [ ] Configure password strength requirements
- [ ] Set up rate limiting on edge functions

---

## Troubleshooting

### "Column X does not exist"
Run both migrations in order. If still failing, run:
```sql
SELECT add_column_if_missing('table_name', 'column_name', 'TYPE', 'DEFAULT');
```

### "Permission denied"
Check that:
1. User has a profile with correct role
2. RLS policies are enabled
3. User is authenticated

### Keys not syncing
1. Check `supabase_realtime` publication includes the table
2. Verify client has realtime subscription set up
3. Check network/websocket connection
