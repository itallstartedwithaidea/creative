/**
 * Internal CRM Module - HubSpot-Style Contact & Project Management
 * ================================================================
 * Version 5.11.1 - January 17, 2026
 * 
 * Features:
 * - Contact Management (clients, team members, vendors)
 * - Company/Organization Management
 * - Project Management with asset linking
 * - Deal/Opportunity Tracking
 * - Activity Timeline
 * - Notes & Comments
 * - Custom Fields
 * - Tags & Categories
 * - Search & Filters
 * - Import/Export
 */

(function() {
    'use strict';

    // ============================================
    // STORAGE KEYS (User-Specific)
    // ============================================
    // Generate user-specific storage key prefix
    function getUserStoragePrefix() {
        // Try multiple session sources in priority order
        let email = null;
        
        // 1. Security module's secure session (encrypted)
        try {
            const secureSession = window.CAVSecurity?.SecureSessionManager?.getSession();
            if (secureSession?.email) {
                email = secureSession.email;
            }
        } catch (e) {}
        
        // 2. Global cavUserSession (dev mode or legacy)
        if (!email && window.cavUserSession?.email) {
            email = window.cavUserSession.email;
        }
        
        // 3. Legacy localStorage session
        if (!email) {
            try {
                const session = JSON.parse(localStorage.getItem('cav_user_session') || 'null');
                if (session?.email) {
                    email = session.email;
                }
            } catch (e) {}
        }
        
        if (email) {
            const userKey = email.toLowerCase().replace(/[^a-z0-9]/g, '_');
            return `cav_crm_${userKey}_`;
        }
        return 'cav_crm_anonymous_';
    }
    
    // Dynamic storage keys - ALWAYS call this function to get current user's keys
    // Note: This is a getter that returns fresh keys based on current session
    const CRM_STORAGE = {
        get CONTACTS() { return `${getUserStoragePrefix()}contacts`; },
        get COMPANIES() { return `${getUserStoragePrefix()}companies`; },
        get PROJECTS() { return `${getUserStoragePrefix()}projects`; },
        get DEALS() { return `${getUserStoragePrefix()}deals`; },
        get ACTIVITIES() { return `${getUserStoragePrefix()}activities`; },
        get TAGS() { return `${getUserStoragePrefix()}tags`; },
        get CUSTOM_FIELDS() { return `${getUserStoragePrefix()}custom_fields`; },
        get SETTINGS() { return `${getUserStoragePrefix()}settings`; },
        get COMPETITORS() { return `${getUserStoragePrefix()}competitors`; },
    };

    // ============================================
    // CRM CLASS
    // ============================================
    class InternalCRM {
        constructor() {
            this._loadUserData();
            console.log('[CRM] Initialized with user prefix:', getUserStoragePrefix());
            
            // Auto-load from IndexedDB when available (async)
            this._autoLoadFromBackend();
        }
        
        // Auto-load from backend/IndexedDB AND Supabase on initialization
        async _autoLoadFromBackend() {
            // Wait a bit for syncEngine to be ready
            await new Promise(resolve => setTimeout(resolve, 500));
            
            if (window.syncEngine?.isAuthenticated?.()) {
                console.log('[CRM] Auto-loading from IndexedDB...');
                await this.loadFromIndexedDB();
            } else {
                console.log('[CRM] SyncEngine not authenticated yet, will load on sync_complete');
            }
            
            // Also try to load from Supabase (most reliable for cross-device)
            await this.loadFromSupabase();
        }
        
        // Load CRM data directly from Supabase
        async loadFromSupabase() {
            if (!window.CAVSupabase?.getClient) {
                // Retry after a delay
                setTimeout(() => this.loadFromSupabase(), 2000);
                return;
            }
            
            try {
                const supabase = window.CAVSupabase.getClient();
                if (!supabase) return;
                
                // Get user info - support both Supabase Auth and Google Sign-In
                const supabaseUser = await supabase.auth.getUser();
                const userId = supabaseUser?.data?.user?.id;
                const userEmail = supabaseUser?.data?.user?.email || window.cavUserSession?.email;
                
                // Must have at least user_email to load data
                if (!userEmail) {
                    console.warn('[CRM] No user email, skipping Supabase load');
                    return;
                }
                
                console.log('[CRM] Loading data from Supabase for:', userEmail);
                
                // Load companies - filter by user_email (works for Google Sign-In)
                let query = supabase.from('companies').select('*').is('deleted_at', null);
                
                // Use user_id if available, otherwise user_email
                if (userId) {
                    query = query.eq('user_id', userId);
                } else {
                    query = query.eq('user_email', userEmail);
                }
                
                const { data: companies, error: compError } = await query;
                
                if (!compError && companies?.length > 0) {
                    console.log(`[CRM] ☁️ Loaded ${companies.length} companies from Supabase`);
                    
                    for (const c of companies) {
                        // Parse JSON fields
                        const company = {
                            id: c.uuid || c.id,
                            uuid: c.uuid || c.id,
                            name: c.name,
                            industry: c.industry,
                            website: c.website,
                            type: c.type,
                            description: c.description,
                            tags: c.tags || [],
                            metadata: this._parseJSON(c.metadata),
                            enrichedData: this._parseJSON(c.enriched_data),
                            strategyInsights: this._parseJSON(c.strategy_insights),
                            chatHistory: this._parseJSON(c.chat_history) || [],
                            benchmarks: this._parseJSON(c.benchmarks) || [],
                            bestPractices: this._parseJSON(c.best_practices) || [],
                            competitors: this._parseJSON(c.competitors) || [],
                            sharing: { isShared: c.is_shared },
                            createdAt: c.created_at,
                            updatedAt: c.updated_at
                        };
                        
                        // Only add if not already present (local takes precedence)
                        if (!this.companies[company.id]) {
                            this.companies[company.id] = company;
                        }
                    }
                    
                    // Save merged data to localStorage
                    this.saveData(CRM_STORAGE.COMPANIES, this.companies);
                }
                
                // Load contacts - filter by user_email (works for Google Sign-In)
                let contactQuery = supabase.from('contacts').select('*').is('deleted_at', null);
                if (userId) {
                    contactQuery = contactQuery.eq('user_id', userId);
                } else {
                    contactQuery = contactQuery.eq('user_email', userEmail);
                }
                const { data: contacts, error: contError } = await contactQuery;
                
                if (!contError && contacts?.length > 0) {
                    console.log(`[CRM] ☁️ Loaded ${contacts.length} contacts from Supabase`);
                    for (const c of contacts) {
                        if (!this.contacts[c.uuid || c.id]) {
                            this.contacts[c.uuid || c.id] = {
                                id: c.uuid || c.id,
                                firstName: c.first_name,
                                lastName: c.last_name,
                                email: c.email,
                                phone: c.phone,
                                company: c.company_id,
                                companyName: c.company_name,
                                title: c.title,
                                tags: c.tags || [],
                                metadata: this._parseJSON(c.metadata),
                                createdAt: c.created_at,
                                updatedAt: c.updated_at
                            };
                        }
                    }
                    this.saveData(CRM_STORAGE.CONTACTS, this.contacts);
                }
                
                console.log('[CRM] ☁️ Supabase data load complete');
                
            } catch (e) {
                console.warn('[CRM] Supabase load error:', e);
            }
        }
        
        // Helper to safely parse JSON
        _parseJSON(value) {
            if (!value) return {};
            if (typeof value === 'object') return value;
            try {
                return JSON.parse(value);
            } catch (e) {
                return {};
            }
        }
        
        // Load user-specific data - called on init and when user changes
        _loadUserData() {
            this.contacts = this.loadData(CRM_STORAGE.CONTACTS, {});
            this.companies = this.loadData(CRM_STORAGE.COMPANIES, {});
            this.projects = this.loadData(CRM_STORAGE.PROJECTS, {});
            this.deals = this.loadData(CRM_STORAGE.DEALS, {});
            this.activities = this.loadData(CRM_STORAGE.ACTIVITIES, []);
            this.tags = this.loadData(CRM_STORAGE.TAGS, []);
            this.customFields = this.loadData(CRM_STORAGE.CUSTOM_FIELDS, {});
            this.settings = this.loadData(CRM_STORAGE.SETTINGS, this.defaultSettings());
            this.competitors = this.loadData(CRM_STORAGE.COMPETITORS, {});
        }
        
        // Reload CRM data for current user (call this after login)
        reloadForCurrentUser() {
            console.log('[CRM] Reloading data for user prefix:', getUserStoragePrefix());
            this._loadUserData();
            return this;
        }
        
        // Load data from IndexedDB (via sync-engine) and merge with localStorage
        async loadFromIndexedDB() {
            if (!window.syncEngine) {
                console.log('[CRM] SyncEngine not available, using localStorage only');
                return;
            }
            
            try {
                console.log('[CRM] Loading data from IndexedDB...');
                
                // Load companies from IndexedDB
                const idbCompanies = await window.syncEngine.getAllCompanies();
                if (idbCompanies && idbCompanies.length > 0) {
                    console.log(`[CRM] Loaded ${idbCompanies.length} companies from IndexedDB`);
                    // Convert array to object with uuid as key
                    const companiesObj = {};
                    idbCompanies.forEach(company => {
                        // Ensure id is set for UI compatibility
                        company.id = company.uuid || company.id;
                        companiesObj[company.id] = company;
                    });
                    this.companies = companiesObj;
                    // Save to localStorage for faster subsequent loads
                    this.saveData(CRM_STORAGE.COMPANIES, this.companies);
                }
                
                // Load contacts from IndexedDB
                const idbContacts = await window.syncEngine.getAllContacts();
                if (idbContacts && idbContacts.length > 0) {
                    console.log(`[CRM] Loaded ${idbContacts.length} contacts from IndexedDB`);
                    const contactsObj = {};
                    idbContacts.forEach(contact => {
                        contact.id = contact.uuid || contact.id;
                        contactsObj[contact.id] = contact;
                    });
                    this.contacts = contactsObj;
                    this.saveData(CRM_STORAGE.CONTACTS, this.contacts);
                }
                
                // Load projects from IndexedDB
                const idbProjects = await window.syncEngine.getAllProjects();
                if (idbProjects && idbProjects.length > 0) {
                    console.log(`[CRM] Loaded ${idbProjects.length} projects from IndexedDB`);
                    const projectsObj = {};
                    idbProjects.forEach(project => {
                        project.id = project.uuid || project.id;
                        projectsObj[project.id] = project;
                    });
                    this.projects = projectsObj;
                    this.saveData(CRM_STORAGE.PROJECTS, this.projects);
                }
                
                // Load deals from IndexedDB
                const idbDeals = await window.syncEngine.getAllDeals();
                if (idbDeals && idbDeals.length > 0) {
                    console.log(`[CRM] Loaded ${idbDeals.length} deals from IndexedDB`);
                    const dealsObj = {};
                    idbDeals.forEach(deal => {
                        deal.id = deal.uuid || deal.id;
                        dealsObj[deal.id] = deal;
                    });
                    this.deals = dealsObj;
                    this.saveData(CRM_STORAGE.DEALS, this.deals);
                }
                
                console.log('[CRM] Successfully loaded data from IndexedDB');
            } catch (error) {
                console.error('[CRM] Failed to load from IndexedDB:', error);
            }
        }
        
        // Get current user's storage prefix (for debugging)
        getCurrentUserPrefix() {
            return getUserStoragePrefix();
        }
        
        // ----------------------------------------
        // COMPETITORS (Separate from Companies!)
        // ----------------------------------------
        createCompetitor(data) {
            const id = this.generateId();
            const competitor = {
                id,
                name: data.name || '',
                website: data.website || '',
                industry: data.industry || '',
                description: data.description || '',
                strengths: data.strengths || [],
                weaknesses: data.weaknesses || [],
                marketShare: data.marketShare || '',
                targetAudience: data.targetAudience || '',
                keyProducts: data.keyProducts || [],
                adExamples: data.adExamples || [], // URLs or asset references
                socialProfiles: data.socialProfiles || {},
                notes: data.notes || '',
                source: data.source || 'manual', // manual, ai_detected, url_analysis
                sourceUrl: data.sourceUrl || '',
                lastChecked: new Date().toISOString(),
                monitoringFrequency: data.monitoringFrequency || 'weekly',
                linkedCompanyId: data.linkedCompanyId || null, // Which company this competitor is relevant to
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            
            this.competitors[id] = competitor;
            this.saveData(CRM_STORAGE.COMPETITORS, this.competitors);
            this.logActivity('competitor_created', { competitorId: id, name: competitor.name });
            
            // Sync to Supabase
            this.saveCompetitorToSupabase(competitor);
            
            return competitor;
        }
        
        updateCompetitor(id, updates) {
            if (!this.competitors[id]) return null;
            
            this.competitors[id] = {
                ...this.competitors[id],
                ...updates,
                updatedAt: new Date().toISOString(),
            };
            
            this.saveData(CRM_STORAGE.COMPETITORS, this.competitors);
            this.logActivity('competitor_updated', { competitorId: id });
            
            // Sync to Supabase
            this.saveCompetitorToSupabase(this.competitors[id]);
            
            return this.competitors[id];
        }
        
        deleteCompetitor(id) {
            if (!this.competitors[id]) return false;
            
            const competitor = this.competitors[id];
            delete this.competitors[id];
            this.saveData(CRM_STORAGE.COMPETITORS, this.competitors);
            this.logActivity('competitor_deleted', { competitorId: id, name: competitor.name });
            
            // Delete from Supabase
            if (window.CAVSupabase?.deleteCompetitor) {
                window.CAVSupabase.deleteCompetitor(competitor.uuid || id).catch(e => 
                    console.warn('[CRM] Failed to delete competitor from Supabase:', e)
                );
            }
            
            return true;
        }
        
        getCompetitor(id) {
            return this.competitors[id] || null;
        }
        
        getAllCompetitors(filters = {}) {
            let results = Object.values(this.competitors);
            
            if (filters.linkedCompanyId) {
                results = results.filter(c => c.linkedCompanyId === filters.linkedCompanyId);
            }
            if (filters.industry) {
                results = results.filter(c => c.industry === filters.industry);
            }
            if (filters.source) {
                results = results.filter(c => c.source === filters.source);
            }
            if (filters.search) {
                const search = filters.search.toLowerCase();
                results = results.filter(c => {
                    const name = c?.name || '';
                    const website = c?.website || '';
                    return name.toLowerCase().includes(search) ||
                           website.toLowerCase().includes(search);
                });
            }
            
            results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            return results;
        }
        
        // Link competitor to a company (for reference)
        linkCompetitorToCompany(competitorId, companyId) {
            if (!this.competitors[competitorId]) return false;
            
            this.competitors[competitorId].linkedCompanyId = companyId;
            this.competitors[competitorId].updatedAt = new Date().toISOString();
            this.saveData(CRM_STORAGE.COMPETITORS, this.competitors);
            
            return true;
        }

        defaultSettings() {
            return {
                defaultContactType: 'client',
                defaultDealStage: 'lead',
                enableActivityTracking: true,
                enableEmailIntegration: true,
                enableSlackNotifications: false,
                slackWebhookUrl: '',
                emailNotificationAddress: '',
            };
        }

        loadData(key, defaultValue) {
            try {
                const data = localStorage.getItem(key);
                return data ? JSON.parse(data) : defaultValue;
            } catch {
                return defaultValue;
            }
        }

        saveData(key, data) {
            localStorage.setItem(key, JSON.stringify(data));
        }

        generateId() {
            return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }

        // ----------------------------------------
        // CONTACTS
        // ----------------------------------------
        createContact(data) {
            const id = this.generateId();
            const contact = {
                id,
                type: data.type || 'client', // client, team, vendor, partner
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                email: data.email || '',
                phone: data.phone || '',
                company: data.company || '', // Company ID
                companyName: data.companyName || '',
                title: data.title || '',
                department: data.department || '',
                address: data.address || {},
                website: data.website || '',
                socialProfiles: data.socialProfiles || {},
                tags: data.tags || [],
                customFields: data.customFields || {},
                notes: data.notes || '',
                source: data.source || 'manual', // manual, import, email, integration
                status: data.status || 'active', // active, inactive, archived
                linkedAssets: [], // Asset IDs
                linkedProjects: [], // Project IDs
                linkedDeals: [], // Deal IDs
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: data.createdBy || window.cavUserSession?.email || 'system',
            };

            this.contacts[id] = contact;
            this.saveData(CRM_STORAGE.CONTACTS, this.contacts);
            this.logActivity('contact_created', { contactId: id, name: `${contact.firstName} ${contact.lastName}` });
            
            // Also save to sync-engine/IndexedDB for persistence
            if (window.syncEngine) {
                contact.uuid = contact.id; // Ensure uuid is set
                window.syncEngine.saveContact(contact).catch(e => 
                    console.warn('[CRM] Failed to save contact to sync-engine:', e)
                );
            }
            
            return contact;
        }

        updateContact(id, updates) {
            if (!this.contacts[id]) return null;
            
            this.contacts[id] = {
                ...this.contacts[id],
                ...updates,
                updatedAt: new Date().toISOString(),
            };
            
            this.saveData(CRM_STORAGE.CONTACTS, this.contacts);
            this.logActivity('contact_updated', { contactId: id });
            
            // Also save to sync-engine/IndexedDB for persistence
            if (window.syncEngine) {
                const contact = this.contacts[id];
                contact.uuid = contact.id; // Ensure uuid is set
                window.syncEngine.saveContact(contact).catch(e => 
                    console.warn('[CRM] Failed to update contact in sync-engine:', e)
                );
            }
            
            return this.contacts[id];
        }

        deleteContact(id) {
            if (!this.contacts[id]) return false;
            
            const contact = this.contacts[id];
            delete this.contacts[id];
            this.saveData(CRM_STORAGE.CONTACTS, this.contacts);
            this.logActivity('contact_deleted', { contactId: id, name: `${contact.firstName} ${contact.lastName}` });
            
            // Also delete from sync-engine/IndexedDB
            if (window.syncEngine && contact.uuid) {
                window.syncEngine.deleteContact(contact.uuid).catch(e => 
                    console.warn('[CRM] Failed to delete contact from sync-engine:', e)
                );
            }
            
            return true;
        }

        getContact(id) {
            return this.contacts[id] || null;
        }

        getAllContacts(filters = {}) {
            let results = Object.values(this.contacts);

            if (filters.type) {
                results = results.filter(c => c.type === filters.type);
            }
            if (filters.status) {
                results = results.filter(c => c.status === filters.status);
            }
            if (filters.company) {
                results = results.filter(c => c.company === filters.company);
            }
            if (filters.tag) {
                results = results.filter(c => c.tags.includes(filters.tag));
            }
            if (filters.search) {
                const search = filters.search.toLowerCase();
                results = results.filter(c => {
                    const firstName = c?.firstName || '';
                    const lastName = c?.lastName || '';
                    const email = c?.email || '';
                    const companyName = c?.companyName || '';
                    return firstName.toLowerCase().includes(search) ||
                           lastName.toLowerCase().includes(search) ||
                           email.toLowerCase().includes(search) ||
                           companyName.toLowerCase().includes(search);
                });
            }

            // Sort
            results.sort((a, b) => {
                if (filters.sortBy === 'name') {
                    return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
                }
                return new Date(b.createdAt) - new Date(a.createdAt);
            });

            return results;
        }

        // ----------------------------------------
        // COMPANIES
        // ----------------------------------------
        createCompany(data) {
            const id = this.generateId();
            const ownerEmail = data.createdBy || window.cavUserSession?.email || 'system';
            const ownerDomain = ownerEmail.includes('@') ? ownerEmail.split('@')[1] : '';
            
            const company = {
                id,
                name: data.name || '',
                domain: data.domain || '',
                industry: data.industry || '',
                size: data.size || '', // startup, small, medium, enterprise
                type: data.type || 'client', // client, agency, vendor, partner, competitor
                website: data.website || '',
                phone: data.phone || '',
                address: data.address || {},
                description: data.description || '',
                logo: data.logo || '',
                tags: data.tags || [],
                customFields: data.customFields || {},
                socialProfiles: data.socialProfiles || {},
                status: data.status || 'active',
                linkedContacts: [], // Contact IDs
                linkedProjects: [], // Project IDs
                linkedDeals: [], // Deal IDs
                linkedAssets: data.linkedAssets || [], // Asset IDs (images/videos)
                // NEW: Extended fields for benchmarks, swipe files, competitors, best practices
                analyses: data.analyses || [], // Creative analyses
                benchmarks: data.benchmarks || [], // Industry benchmarks
                swipeFiles: data.swipeFiles || [], // Saved swipe file entries
                competitors: data.competitors || [], // Linked competitor info
                bestPractices: data.bestPractices || [], // Best practices for this company
                urlAnalyses: data.urlAnalyses || [], // URL analysis results linked to company
                totalRevenue: 0,
                source: data.source || 'manual', // manual, url_analyzer, ai_detected
                // SHARING SETTINGS
                sharing: data.sharing || {
                    isShared: false,               // Is this shared with team?
                    shareWithDomain: true,         // Share with all domain users?
                    sharedWith: [],                // Specific emails to share with
                    shareLevel: 'view',            // view, edit, admin
                    ownerDomain: ownerDomain,      // The domain that owns this company
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: ownerEmail,
            };

            this.companies[id] = company;
            this.saveData(CRM_STORAGE.COMPANIES, this.companies);
            this.logActivity('company_created', { companyId: id, name: company.name });
            
            // Also save to sync-engine/IndexedDB for persistence
            if (window.syncEngine) {
                company.uuid = company.id; // Ensure uuid is set
                window.syncEngine.saveCompany(company).catch(e => 
                    console.warn('[CRM] Failed to save company to sync-engine:', e)
                );
            }
            
            // ALSO save directly to Supabase for cross-device sync
            this.saveCompanyToSupabase(company);
            
            return company;
        }

        updateCompany(id, updates) {
            if (!this.companies[id]) return null;
            
            this.companies[id] = {
                ...this.companies[id],
                ...updates,
                updatedAt: new Date().toISOString(),
            };
            
            this.saveData(CRM_STORAGE.COMPANIES, this.companies);
            this.logActivity('company_updated', { companyId: id });
            
            // Also save to sync-engine/IndexedDB for persistence
            if (window.syncEngine) {
                const company = this.companies[id];
                company.uuid = company.id; // Ensure uuid is set
                window.syncEngine.saveCompany(company).catch(e => 
                    console.warn('[CRM] Failed to update company in sync-engine:', e)
                );
            }
            
            // ALSO save directly to Supabase for cross-device sync
            this.saveCompanyToSupabase(this.companies[id]);
            
            return this.companies[id];
        }
        
        // Save company directly to Supabase for reliable cross-device sync
        async saveCompanyToSupabase(company) {
            if (!window.CAVSupabase?.getClient) return;
            
            try {
                const supabase = window.CAVSupabase.getClient();
                if (!supabase) return;
                
                // Get user info - support both Supabase Auth and Google Sign-In
                const supabaseUser = await supabase.auth.getUser();
                const userId = supabaseUser?.data?.user?.id || null;
                const userEmail = supabaseUser?.data?.user?.email || window.cavUserSession?.email;
                
                // Must have at least user_email to save
                if (!userEmail) {
                    console.warn('[CRM] No user email available, skipping Supabase save');
                    return;
                }
                
                const companyData = {
                    uuid: company.id || company.uuid,
                    user_email: userEmail,
                    owner_email: userEmail,
                    name: company.name,
                    industry: company.industry || null,
                    website: company.website || null,
                    type: company.type || 'client',
                    description: company.description || null,
                    tags: company.tags || [],
                    metadata: company.metadata || {},
                    enriched_data: company.enrichedData || {},
                    strategy_insights: company.strategyInsights || {},
                    chat_history: company.chatHistory || [],
                    benchmarks: company.benchmarks || [],
                    best_practices: company.bestPractices || [],
                    competitors: company.competitors || [],
                    is_shared: company.sharing?.isShared || false,
                    updated_at: new Date().toISOString()
                };
                
                // Add user_id only if available (from Supabase Auth)
                if (userId) {
                    companyData.user_id = userId;
                }
                
                console.log('[CRM] Saving company to Supabase:', companyData.name, 'uuid:', companyData.uuid);
                
                const { error } = await supabase
                    .from('companies')
                    .upsert(companyData, { onConflict: 'uuid' });
                
                if (error) {
                    console.error('[CRM] Supabase save error:', error.message, error);
                } else {
                    console.log('[CRM] ☁️ Company saved to Supabase:', company.name);
                }
            } catch (e) {
                console.warn('[CRM] Supabase sync error:', e);
            }
        }

        // Save competitor directly to Supabase
        async saveCompetitorToSupabase(competitor) {
            if (!window.CAVSupabase?.saveCompetitor) return;
            
            try {
                const userEmail = window.cavUserSession?.email;
                if (!userEmail) return;
                
                const competitorData = {
                    uuid: competitor.id || competitor.uuid,
                    name: competitor.name,
                    domain: competitor.domain || null,
                    website: competitor.website || competitor.url || null,
                    industry: competitor.industry || null,
                    company_id: competitor.linkedCompanyId || null,
                    ad_library_urls: competitor.adLibraryUrl ? [competitor.adLibraryUrl] : [],
                    monitoring_frequency: competitor.monitoringFrequency || 'weekly',
                    notes: competitor.notes || null,
                    tags: competitor.tags || [],
                    metadata: competitor.metadata || {},
                    is_shared: false
                };
                
                await window.CAVSupabase.saveCompetitor(competitorData);
                console.log('[CRM] ☁️ Competitor saved to Supabase:', competitor.name);
            } catch (e) {
                console.warn('[CRM] Competitor Supabase sync error:', e);
            }
        }

        // Save activity directly to Supabase
        async saveActivityToSupabase(activity) {
            if (!window.CAVSupabase?.saveActivity) return;
            
            try {
                const userEmail = window.cavUserSession?.email;
                if (!userEmail) return;
                
                const activityData = {
                    uuid: activity.id || activity.uuid,
                    action: activity.type || activity.action,
                    entity_type: activity.entity_type || 'general',
                    entity_id: activity.entity_id || null,
                    metadata: activity.data || activity.metadata || {}
                };
                
                await window.CAVSupabase.saveActivity(activityData);
            } catch (e) {
                // Don't spam console for activity sync errors
            }
        }

        // Save tag directly to Supabase
        async saveTagToSupabase(tag) {
            if (!window.CAVSupabase?.saveTag) return;
            
            try {
                const userEmail = window.cavUserSession?.email;
                if (!userEmail) return;
                
                const tagData = {
                    uuid: tag.id || tag.uuid,
                    name: tag.name,
                    color: tag.color || '#ec4899',
                    category: tag.category || null,
                    usage_count: tag.usage_count || 0
                };
                
                await window.CAVSupabase.saveTag(tagData);
                console.log('[CRM] ☁️ Tag saved to Supabase:', tag.name);
            } catch (e) {
                console.warn('[CRM] Tag Supabase sync error:', e);
            }
        }

        deleteCompany(id) {
            if (!this.companies[id]) return false;
            
            const company = this.companies[id];
            delete this.companies[id];
            this.saveData(CRM_STORAGE.COMPANIES, this.companies);
            this.logActivity('company_deleted', { companyId: id, name: company.name });
            
            // Also delete from sync-engine/IndexedDB
            if (window.syncEngine && company.uuid) {
                window.syncEngine.deleteCompany(company.uuid).catch(e => 
                    console.warn('[CRM] Failed to delete company from sync-engine:', e)
                );
            }
            
            return true;
        }

        // Link an asset to a company
        linkAssetToCompany(companyId, assetId) {
            if (!this.companies[companyId]) return false;
            
            if (!this.companies[companyId].linkedAssets) {
                this.companies[companyId].linkedAssets = [];
            }
            
            if (!this.companies[companyId].linkedAssets.includes(assetId)) {
                this.companies[companyId].linkedAssets.push(assetId);
                this.companies[companyId].updatedAt = new Date().toISOString();
                this.saveData(CRM_STORAGE.COMPANIES, this.companies);
                this.logActivity('asset_linked', { companyId, assetId });
            }
            
            return true;
        }

        // ----------------------------------------
        // SHARING MANAGEMENT
        // ----------------------------------------
        
        // Update sharing settings for a company
        updateCompanySharing(companyId, sharingSettings) {
            if (!this.companies[companyId]) return null;
            
            this.companies[companyId].sharing = {
                ...this.companies[companyId].sharing,
                ...sharingSettings,
            };
            this.companies[companyId].updatedAt = new Date().toISOString();
            this.saveData(CRM_STORAGE.COMPANIES, this.companies);
            this.logActivity('company_sharing_updated', { companyId, settings: sharingSettings });
            
            return this.companies[companyId];
        }
        
        // Share company with specific users
        shareCompanyWith(companyId, emails, shareLevel = 'view') {
            if (!this.companies[companyId]) return false;
            
            const company = this.companies[companyId];
            if (!company.sharing) {
                company.sharing = { isShared: false, sharedWith: [], shareLevel: 'view' };
            }
            
            // Add new emails (avoid duplicates)
            const newEmails = emails.filter(e => !company.sharing.sharedWith.includes(e));
            company.sharing.sharedWith = [...company.sharing.sharedWith, ...newEmails];
            company.sharing.isShared = true;
            company.sharing.shareLevel = shareLevel;
            company.updatedAt = new Date().toISOString();
            
            this.saveData(CRM_STORAGE.COMPANIES, this.companies);
            this.logActivity('company_shared', { companyId, sharedWith: newEmails, shareLevel });
            
            return true;
        }
        
        // Remove sharing from specific users
        unshareCompanyFrom(companyId, emails) {
            if (!this.companies[companyId]) return false;
            
            const company = this.companies[companyId];
            if (!company.sharing?.sharedWith) return false;
            
            company.sharing.sharedWith = company.sharing.sharedWith.filter(e => !emails.includes(e));
            if (company.sharing.sharedWith.length === 0 && !company.sharing.shareWithDomain) {
                company.sharing.isShared = false;
            }
            company.updatedAt = new Date().toISOString();
            
            this.saveData(CRM_STORAGE.COMPANIES, this.companies);
            this.logActivity('company_unshared', { companyId, removedFrom: emails });
            
            return true;
        }
        
        // Get companies accessible to current user
        getAccessibleCompanies(userEmail) {
            const userDomain = userEmail?.split('@')[1] || '';
            const allCompanies = Object.values(this.companies);
            
            return allCompanies.filter(company => {
                // Owner always has access
                if (company.createdBy === userEmail) return true;
                
                // Check sharing settings
                if (!company.sharing?.isShared) return false;
                
                // Shared with domain?
                if (company.sharing.shareWithDomain && company.sharing.ownerDomain === userDomain) {
                    return true;
                }
                
                // Shared with specific user?
                if (company.sharing.sharedWith?.includes(userEmail)) return true;
                
                return false;
            });
        }
        
        // Check if user can access company
        canAccessCompany(companyId, userEmail) {
            const company = this.companies[companyId];
            if (!company) return false;
            
            const userDomain = userEmail?.split('@')[1] || '';
            
            // Owner always has access
            if (company.createdBy === userEmail) return { access: true, level: 'admin' };
            
            // Check sharing
            if (!company.sharing?.isShared) return { access: false };
            
            // Shared with domain?
            if (company.sharing.shareWithDomain && company.sharing.ownerDomain === userDomain) {
                return { access: true, level: company.sharing.shareLevel || 'view' };
            }
            
            // Shared with specific user?
            if (company.sharing.sharedWith?.includes(userEmail)) {
                return { access: true, level: company.sharing.shareLevel || 'view' };
            }
            
            return { access: false };
        }
        
        // Get list of team members for sharing (from managed users)
        getTeamMembersForSharing() {
            const managedUsers = window.getManagedUsers ? window.getManagedUsers() : {};
            const currentUser = window.cavUserSession;
            const currentDomain = currentUser?.email?.split('@')[1] || '';
            
            // Filter to same domain users
            return Object.values(managedUsers)
                .filter(user => {
                    const userDomain = user.email?.split('@')[1] || '';
                    return userDomain === currentDomain && user.email !== currentUser?.email;
                })
                .map(user => ({
                    email: user.email,
                    name: user.name,
                    role: user.role
                }));
        }
        
        // Show sharing modal for a company
        showSharingModal(companyId) {
            const company = this.companies[companyId];
            if (!company) return;
            
            const teamMembers = this.getTeamMembersForSharing();
            const currentSharing = company.sharing || { isShared: false, sharedWith: [], shareWithDomain: false };
            
            const modal = document.createElement('div');
            modal.className = 'crm-modal';
            modal.innerHTML = `
                <div class="crm-modal-overlay" style="position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 10000;"></div>
                <div class="crm-modal-content" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #1f2937; border-radius: 12px; padding: 2rem; max-width: 500px; width: 90%; z-index: 10001; max-height: 80vh; overflow-y: auto;">
                    <div class="crm-modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <h3 style="color: #fff; margin: 0;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;vertical-align:middle;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> Share "${company.name}"</h3>
                        <button class="crm-modal-close" style="background: none; border: none; color: #9ca3af; font-size: 1.5rem; cursor: pointer;">&times;</button>
                    </div>
                    
                    <div class="sharing-options" style="margin-bottom: 1.5rem;">
                        <label style="display: flex; align-items: center; gap: 0.75rem; padding: 1rem; background: rgba(0,0,0,0.3); border-radius: 8px; cursor: pointer; margin-bottom: 0.5rem;">
                            <input type="checkbox" id="share-with-domain" ${currentSharing.shareWithDomain ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: #a855f7;">
                            <div>
                                <div style="color: #fff; font-weight: 500;">Share with entire team</div>
                                <div style="color: #9ca3af; font-size: 0.875rem;">All @${company.sharing?.ownerDomain || 'company'} users can access</div>
                            </div>
                        </label>
                        
                        <div style="display: flex; gap: 0.5rem; align-items: center; margin-top: 1rem; margin-bottom: 0.5rem;">
                            <span style="color: #e9d5ff;">Share level:</span>
                            <select id="share-level" style="padding: 0.5rem; border-radius: 6px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: #fff;">
                                <option value="view" ${currentSharing.shareLevel === 'view' ? 'selected' : ''}>View only</option>
                                <option value="edit" ${currentSharing.shareLevel === 'edit' ? 'selected' : ''}>Can edit</option>
                                <option value="admin" ${currentSharing.shareLevel === 'admin' ? 'selected' : ''}>Full access</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 1.5rem;">
                        <div style="color: #e9d5ff; font-weight: 500; margin-bottom: 0.5rem;">Share with specific people:</div>
                        <div id="team-members-list" style="max-height: 200px; overflow-y: auto; background: rgba(0,0,0,0.2); border-radius: 8px; padding: 0.5rem;">
                            ${teamMembers.length === 0 ? 
                                '<p style="color: #9ca3af; text-align: center; padding: 1rem;">No team members found. Add users in Admin Dashboard.</p>' :
                                teamMembers.map(member => `
                                    <label style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; cursor: pointer; border-radius: 6px; transition: background 0.2s;" class="team-member-item">
                                        <input type="checkbox" name="share-member" value="${member.email}" ${currentSharing.sharedWith?.includes(member.email) ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: #a855f7;">
                                        <div style="flex: 1;">
                                            <div style="color: #fff;">${member.name}</div>
                                            <div style="color: #9ca3af; font-size: 0.75rem;">${member.email}</div>
                                        </div>
                                        <span style="background: ${member.role === 'admin' ? 'rgba(168,85,247,0.3)' : 'rgba(147,51,234,0.2)'}; color: #e9d5ff; padding: 2px 8px; border-radius: 10px; font-size: 0.7rem;">${member.role}</span>
                                    </label>
                                `).join('')
                            }
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                        <button class="cancel-btn" style="padding: 0.75rem 1.5rem; background: transparent; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: #fff; cursor: pointer;">Cancel</button>
                        <button class="save-btn" style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #a855f7, #6366f1); border: none; border-radius: 8px; color: #fff; cursor: pointer; font-weight: 500;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;vertical-align:middle;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save Sharing Settings</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Event listeners
            modal.querySelector('.crm-modal-close').addEventListener('click', () => modal.remove());
            modal.querySelector('.crm-modal-overlay').addEventListener('click', () => modal.remove());
            modal.querySelector('.cancel-btn').addEventListener('click', () => modal.remove());
            
            // Hover effect for team members
            modal.querySelectorAll('.team-member-item').forEach(item => {
                item.addEventListener('mouseenter', () => item.style.background = 'rgba(168,85,247,0.1)');
                item.addEventListener('mouseleave', () => item.style.background = 'transparent');
            });
            
            // Save button
            modal.querySelector('.save-btn').addEventListener('click', () => {
                const shareWithDomain = modal.querySelector('#share-with-domain').checked;
                const shareLevel = modal.querySelector('#share-level').value;
                const selectedMembers = Array.from(modal.querySelectorAll('input[name="share-member"]:checked'))
                    .map(cb => cb.value);
                
                this.updateCompanySharing(companyId, {
                    isShared: shareWithDomain || selectedMembers.length > 0,
                    shareWithDomain: shareWithDomain,
                    sharedWith: selectedMembers,
                    shareLevel: shareLevel,
                });
                
                this.showToast('success', 'Sharing settings saved!');
                modal.remove();
            });
        }
        
        // Add analysis to company record
        addAnalysisToCompany(companyId, analysis) {
            if (!this.companies[companyId]) return false;
            
            if (!this.companies[companyId].analyses) {
                this.companies[companyId].analyses = [];
            }
            
            // Check if analysis for this asset already exists
            const existingIndex = this.companies[companyId].analyses.findIndex(
                a => a.assetId === analysis.assetId
            );
            
            if (existingIndex >= 0) {
                // Update existing
                this.companies[companyId].analyses[existingIndex] = {
                    ...this.companies[companyId].analyses[existingIndex],
                    ...analysis,
                    updatedAt: new Date().toISOString()
                };
            } else {
                // Add new
                this.companies[companyId].analyses.push({
                    ...analysis,
                    savedAt: new Date().toISOString()
                });
            }
            
            this.companies[companyId].updatedAt = new Date().toISOString();
            this.saveData(CRM_STORAGE.COMPANIES, this.companies);
            this.logActivity('analysis_saved_to_company', { companyId, assetId: analysis.assetId });
            
            return true;
        }
        
        // Add benchmark to company record
        addBenchmarkToCompany(companyId, benchmark) {
            if (!this.companies[companyId]) return false;
            
            if (!this.companies[companyId].benchmarks) {
                this.companies[companyId].benchmarks = [];
            }
            
            // Check if benchmark already exists
            const existingIndex = this.companies[companyId].benchmarks.findIndex(
                b => b.metric === benchmark.metric && b.source === benchmark.source
            );
            
            if (existingIndex >= 0) {
                this.companies[companyId].benchmarks[existingIndex] = {
                    ...this.companies[companyId].benchmarks[existingIndex],
                    ...benchmark,
                    updatedAt: new Date().toISOString()
                };
            } else {
                this.companies[companyId].benchmarks.push({
                    ...benchmark,
                    id: this.generateId(),
                    savedAt: new Date().toISOString()
                });
            }
            
            this.companies[companyId].updatedAt = new Date().toISOString();
            this.saveData(CRM_STORAGE.COMPANIES, this.companies);
            this.logActivity('benchmark_saved_to_company', { companyId, metric: benchmark.metric });
            
            return true;
        }
        
        // Add swipe file entry to company record
        addSwipeFileToCompany(companyId, swipeEntry) {
            if (!this.companies[companyId]) return false;
            
            if (!this.companies[companyId].swipeFiles) {
                this.companies[companyId].swipeFiles = [];
            }
            
            // Check if swipe file already exists
            const existingIndex = this.companies[companyId].swipeFiles.findIndex(
                s => s.sourceUrl === swipeEntry.sourceUrl
            );
            
            if (existingIndex < 0) {
                this.companies[companyId].swipeFiles.push({
                    ...swipeEntry,
                    id: swipeEntry.id || this.generateId(),
                    savedAt: new Date().toISOString()
                });
            }
            
            this.companies[companyId].updatedAt = new Date().toISOString();
            this.saveData(CRM_STORAGE.COMPANIES, this.companies);
            this.logActivity('swipe_file_saved_to_company', { companyId });
            
            return true;
        }
        
        // Add competitor to company record
        addCompetitorToCompany(companyId, competitor) {
            if (!this.companies[companyId]) return false;
            
            if (!this.companies[companyId].competitors) {
                this.companies[companyId].competitors = [];
            }
            
            // Check if competitor already exists (with null safety)
            const competitorName = competitor?.name || '';
            const competitorDomain = competitor?.domain || '';
            const existingIndex = this.companies[companyId].competitors.findIndex(c => {
                const cName = c?.name || '';
                const cDomain = c?.domain || '';
                return (cName && competitorName && cName.toLowerCase() === competitorName.toLowerCase()) || 
                       (cDomain && competitorDomain && cDomain === competitorDomain);
            });
            
            if (existingIndex >= 0) {
                this.companies[companyId].competitors[existingIndex] = {
                    ...this.companies[companyId].competitors[existingIndex],
                    ...competitor,
                    updatedAt: new Date().toISOString()
                };
            } else {
                this.companies[companyId].competitors.push({
                    ...competitor,
                    id: competitor.id || this.generateId(),
                    savedAt: new Date().toISOString()
                });
            }
            
            this.companies[companyId].updatedAt = new Date().toISOString();
            this.saveData(CRM_STORAGE.COMPANIES, this.companies);
            this.logActivity('competitor_saved_to_company', { companyId, competitorName: competitor.name });
            
            return true;
        }
        
        // Add best practice to company record
        addBestPracticeToCompany(companyId, practice) {
            if (!this.companies[companyId]) return false;
            
            if (!this.companies[companyId].bestPractices) {
                this.companies[companyId].bestPractices = [];
            }
            
            this.companies[companyId].bestPractices.push({
                ...practice,
                id: practice.id || this.generateId(),
                savedAt: new Date().toISOString()
            });
            
            this.companies[companyId].updatedAt = new Date().toISOString();
            this.saveData(CRM_STORAGE.COMPANIES, this.companies);
            this.logActivity('best_practice_saved_to_company', { companyId });
            
            return true;
        }
        
        // Add URL analysis to company record
        addURLAnalysisToCompany(companyId, urlAnalysis) {
            if (!this.companies[companyId]) return false;
            
            if (!this.companies[companyId].urlAnalyses) {
                this.companies[companyId].urlAnalyses = [];
            }
            
            // Check if URL analysis already exists
            const existingIndex = this.companies[companyId].urlAnalyses.findIndex(
                u => u.url === urlAnalysis.url
            );
            
            if (existingIndex >= 0) {
                this.companies[companyId].urlAnalyses[existingIndex] = {
                    ...this.companies[companyId].urlAnalyses[existingIndex],
                    ...urlAnalysis,
                    updatedAt: new Date().toISOString()
                };
            } else {
                this.companies[companyId].urlAnalyses.push({
                    ...urlAnalysis,
                    id: urlAnalysis.id || this.generateId(),
                    savedAt: new Date().toISOString()
                });
            }
            
            this.companies[companyId].updatedAt = new Date().toISOString();
            this.saveData(CRM_STORAGE.COMPANIES, this.companies);
            this.logActivity('url_analysis_saved_to_company', { companyId, url: urlAnalysis.url });
            
            return true;
        }

        getCompany(id) {
            return this.companies[id] || null;
        }

        getAllCompanies(filters = {}) {
            let results = Object.values(this.companies);

            if (filters.type) {
                results = results.filter(c => c.type === filters.type);
            }
            if (filters.industry) {
                results = results.filter(c => c.industry === filters.industry);
            }
            if (filters.status) {
                results = results.filter(c => c.status === filters.status);
            }
            if (filters.search) {
                const search = filters.search.toLowerCase();
                results = results.filter(c => {
                    const name = c?.name || '';
                    const domain = c?.domain || '';
                    return name.toLowerCase().includes(search) ||
                           domain.toLowerCase().includes(search);
                });
            }

            results.sort((a, b) => a.name.localeCompare(b.name));
            return results;
        }

        // ----------------------------------------
        // PROJECTS
        // ----------------------------------------
        createProject(data) {
            const id = this.generateId();
            const ownerEmail = data.createdBy || window.cavUserSession?.email || 'system';
            const ownerDomain = ownerEmail.includes('@') ? ownerEmail.split('@')[1] : '';
            
            const project = {
                id,
                name: data.name || '',
                description: data.description || '',
                client: data.client || '', // Company ID
                clientName: data.clientName || '',
                type: data.type || 'campaign', // campaign, brand, social, video, other
                status: data.status || 'planning', // planning, active, review, completed, archived
                priority: data.priority || 'normal', // low, normal, high, urgent
                startDate: data.startDate || null,
                endDate: data.endDate || null,
                dueDate: data.dueDate || null,
                budget: data.budget || 0,
                tags: data.tags || [],
                channels: data.channels || [], // Target channels (YouTube, Instagram, etc.)
                team: data.team || [], // Contact IDs
                customFields: data.customFields || {},
                linkedAssets: [], // Asset IDs
                linkedDeals: [], // Deal IDs
                assetRequirements: data.assetRequirements || [], // What assets are needed
                completedAssets: 0,
                totalAssets: 0,
                // SHARING SETTINGS
                sharing: data.sharing || {
                    isShared: false,
                    shareWithDomain: true,
                    sharedWith: [],
                    shareLevel: 'view',
                    ownerDomain: ownerDomain,
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: ownerEmail,
            };

            this.projects[id] = project;
            this.saveData(CRM_STORAGE.PROJECTS, this.projects);
            this.logActivity('project_created', { projectId: id, name: project.name });
            
            // Also save to sync-engine/IndexedDB for persistence
            if (window.syncEngine) {
                project.uuid = project.id; // Ensure uuid is set
                window.syncEngine.saveProject(project).catch(e => 
                    console.warn('[CRM] Failed to save project to sync-engine:', e)
                );
            }
            
            return project;
        }
        
        // Update project sharing settings
        updateProjectSharing(projectId, sharingSettings) {
            if (!this.projects[projectId]) return null;
            
            this.projects[projectId].sharing = {
                ...this.projects[projectId].sharing,
                ...sharingSettings,
            };
            this.projects[projectId].updatedAt = new Date().toISOString();
            this.saveData(CRM_STORAGE.PROJECTS, this.projects);
            this.logActivity('project_sharing_updated', { projectId, settings: sharingSettings });
            
            return this.projects[projectId];
        }
        
        // Show sharing modal for a project
        showProjectSharingModal(projectId) {
            const project = this.projects[projectId];
            if (!project) return;
            
            const teamMembers = this.getTeamMembersForSharing();
            const currentSharing = project.sharing || { isShared: false, sharedWith: [], shareWithDomain: false };
            
            const modal = document.createElement('div');
            modal.className = 'crm-modal';
            modal.innerHTML = `
                <div class="crm-modal-overlay" style="position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 10000;"></div>
                <div class="crm-modal-content" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #1f2937; border-radius: 12px; padding: 2rem; max-width: 500px; width: 90%; z-index: 10001; max-height: 80vh; overflow-y: auto;">
                    <div class="crm-modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <h3 style="color: #fff; margin: 0;">📂 Share Project: "${project.name}"</h3>
                        <button class="crm-modal-close" style="background: none; border: none; color: #9ca3af; font-size: 1.5rem; cursor: pointer;">&times;</button>
                    </div>
                    
                    <div class="sharing-options" style="margin-bottom: 1.5rem;">
                        <label style="display: flex; align-items: center; gap: 0.75rem; padding: 1rem; background: rgba(0,0,0,0.3); border-radius: 8px; cursor: pointer; margin-bottom: 0.5rem;">
                            <input type="checkbox" id="project-share-with-domain" ${currentSharing.shareWithDomain ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: #a855f7;">
                            <div>
                                <div style="color: #fff; font-weight: 500;">Share with entire team</div>
                                <div style="color: #9ca3af; font-size: 0.875rem;">All team members can access this project</div>
                            </div>
                        </label>
                        
                        <div style="display: flex; gap: 0.5rem; align-items: center; margin-top: 1rem; margin-bottom: 0.5rem;">
                            <span style="color: #e9d5ff;">Share level:</span>
                            <select id="project-share-level" style="padding: 0.5rem; border-radius: 6px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: #fff;">
                                <option value="view" ${currentSharing.shareLevel === 'view' ? 'selected' : ''}>View only</option>
                                <option value="edit" ${currentSharing.shareLevel === 'edit' ? 'selected' : ''}>Can edit</option>
                                <option value="admin" ${currentSharing.shareLevel === 'admin' ? 'selected' : ''}>Full access</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 1.5rem;">
                        <div style="color: #e9d5ff; font-weight: 500; margin-bottom: 0.5rem;">Share with specific people:</div>
                        <div id="project-team-members-list" style="max-height: 200px; overflow-y: auto; background: rgba(0,0,0,0.2); border-radius: 8px; padding: 0.5rem;">
                            ${teamMembers.length === 0 ? 
                                '<p style="color: #9ca3af; text-align: center; padding: 1rem;">No team members found.</p>' :
                                teamMembers.map(member => `
                                    <label style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; cursor: pointer; border-radius: 6px; transition: background 0.2s;" class="project-team-member-item">
                                        <input type="checkbox" name="project-share-member" value="${member.email}" ${currentSharing.sharedWith?.includes(member.email) ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: #a855f7;">
                                        <div style="flex: 1;">
                                            <div style="color: #fff;">${member.name}</div>
                                            <div style="color: #9ca3af; font-size: 0.75rem;">${member.email}</div>
                                        </div>
                                    </label>
                                `).join('')
                            }
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                        <button class="project-cancel-btn" style="padding: 0.75rem 1.5rem; background: transparent; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: #fff; cursor: pointer;">Cancel</button>
                        <button class="project-save-btn" style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #a855f7, #6366f1); border: none; border-radius: 8px; color: #fff; cursor: pointer; font-weight: 500;">💾 Save</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            modal.querySelector('.crm-modal-close').addEventListener('click', () => modal.remove());
            modal.querySelector('.crm-modal-overlay').addEventListener('click', () => modal.remove());
            modal.querySelector('.project-cancel-btn').addEventListener('click', () => modal.remove());
            
            modal.querySelector('.project-save-btn').addEventListener('click', () => {
                const shareWithDomain = modal.querySelector('#project-share-with-domain').checked;
                const shareLevel = modal.querySelector('#project-share-level').value;
                const selectedMembers = Array.from(modal.querySelectorAll('input[name="project-share-member"]:checked'))
                    .map(cb => cb.value);
                
                this.updateProjectSharing(projectId, {
                    isShared: shareWithDomain || selectedMembers.length > 0,
                    shareWithDomain: shareWithDomain,
                    sharedWith: selectedMembers,
                    shareLevel: shareLevel,
                });
                
                this.showToast('success', 'Project sharing settings saved!');
                modal.remove();
            });
        }

        updateProject(id, updates) {
            if (!this.projects[id]) return null;
            
            this.projects[id] = {
                ...this.projects[id],
                ...updates,
                updatedAt: new Date().toISOString(),
            };
            
            this.saveData(CRM_STORAGE.PROJECTS, this.projects);
            this.logActivity('project_updated', { projectId: id });
            
            // Also save to sync-engine/IndexedDB for persistence
            if (window.syncEngine) {
                const project = this.projects[id];
                project.uuid = project.id; // Ensure uuid is set
                window.syncEngine.saveProject(project).catch(e => 
                    console.warn('[CRM] Failed to update project in sync-engine:', e)
                );
            }
            
            return this.projects[id];
        }

        deleteProject(id) {
            if (!this.projects[id]) return false;
            
            const project = this.projects[id];
            delete this.projects[id];
            this.saveData(CRM_STORAGE.PROJECTS, this.projects);
            this.logActivity('project_deleted', { projectId: id, name: project.name });
            
            // Also delete from sync-engine/IndexedDB
            if (window.syncEngine && project.uuid) {
                window.syncEngine.deleteProject(project.uuid).catch(e => 
                    console.warn('[CRM] Failed to delete project from sync-engine:', e)
                );
            }
            
            return true;
        }

        getProject(id) {
            return this.projects[id] || null;
        }

        getAllProjects(filters = {}) {
            let results = Object.values(this.projects);

            if (filters.status) {
                results = results.filter(p => p.status === filters.status);
            }
            if (filters.client) {
                results = results.filter(p => p.client === filters.client);
            }
            if (filters.type) {
                results = results.filter(p => p.type === filters.type);
            }
            if (filters.search) {
                const search = filters.search.toLowerCase();
                results = results.filter(p => {
                    const name = p?.name || '';
                    const clientName = p?.clientName || '';
                    return name.toLowerCase().includes(search) ||
                           clientName.toLowerCase().includes(search);
                });
            }

            results.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            return results;
        }

        linkAssetToProject(projectId, assetId) {
            if (!this.projects[projectId]) return false;
            
            if (!this.projects[projectId].linkedAssets.includes(assetId)) {
                this.projects[projectId].linkedAssets.push(assetId);
                this.projects[projectId].totalAssets = this.projects[projectId].linkedAssets.length;
                this.saveData(CRM_STORAGE.PROJECTS, this.projects);
                this.logActivity('asset_linked', { projectId, assetId });
            }
            return true;
        }

        // ----------------------------------------
        // UNCATEGORIZED ASSET MANAGEMENT
        // ----------------------------------------
        
        /**
         * Get the Uncategorized Imports project
         */
        getUncategorizedProject() {
            const allProjects = Object.values(this.projects);
            return allProjects.find(p => p.name === '📥 Uncategorized Imports' || p.isUncategorized);
        }
        
        /**
         * Get all uncategorized asset IDs
         */
        getUncategorizedAssetIds() {
            const uncategorized = this.getUncategorizedProject();
            return uncategorized ? (uncategorized.linkedAssets || []) : [];
        }
        
        /**
         * Assign an asset from Uncategorized to a brand (company)
         * If the brand doesn't exist, create it with provided details
         * @param {string} assetId - The asset ID to assign
         * @param {object} brandInfo - Brand info: { name, website, id (if existing) }
         * @param {string} projectId - Optional project ID to assign to (within the brand)
         * @returns {object} - { company, project, asset } 
         */
        async assignAssetToBrand(assetId, brandInfo, projectId = null) {
            console.log('[CRM] Assigning asset to brand:', assetId, brandInfo);
            
            let company = null;
            let project = null;
            
            // Step 1: Get or create the company/brand
            if (brandInfo.id) {
                // Use existing company
                company = this.getCompany(brandInfo.id);
            } else if (brandInfo.name) {
                // Check if company with same name exists
                const existingCompanies = this.searchCompanies(brandInfo.name);
                const exactMatch = existingCompanies.find(c => 
                    c.name.toLowerCase() === brandInfo.name.toLowerCase()
                );
                
                if (exactMatch) {
                    company = exactMatch;
                    console.log('[CRM] Found existing company:', company.name);
                } else {
                    // Create new company
                    console.log('[CRM] Creating new company:', brandInfo.name);
                    
                    // Try to auto-populate details from website if provided
                    let companyData = {
                        name: brandInfo.name,
                        website: brandInfo.website || '',
                        source: 'asset_assignment',
                        type: 'client',
                    };
                    
                    // If website provided, try to extract domain
                    if (brandInfo.website) {
                        try {
                            const url = new URL(brandInfo.website.startsWith('http') ? brandInfo.website : `https://${brandInfo.website}`);
                            companyData.domain = url.hostname.replace('www.', '');
                        } catch (e) {
                            // Invalid URL, use as-is
                            companyData.domain = brandInfo.website;
                        }
                    }
                    
                    company = this.createCompany(companyData);
                    console.log('[CRM] ✅ Created new company:', company.name, company.id);
                }
            }
            
            if (!company) {
                throw new Error('No brand information provided');
            }
            
            // Step 2: Get or create project if specified
            if (projectId) {
                project = this.getProject(projectId);
            } else if (brandInfo.projectName) {
                // Create a new project for this brand
                project = this.createProject({
                    name: brandInfo.projectName,
                    client: company.id,
                    clientName: company.name,
                    type: 'campaign',
                    status: 'active',
                });
                console.log('[CRM] ✅ Created new project:', project.name);
            }
            
            // Step 3: Link asset to company
            this.linkAssetToCompany(company.id, assetId);
            
            // Step 4: Link asset to project if we have one
            if (project) {
                this.linkAssetToProject(project.id, assetId);
            }
            
            // Step 5: Remove asset from Uncategorized project
            const uncategorized = this.getUncategorizedProject();
            if (uncategorized) {
                const assetIndex = uncategorized.linkedAssets?.indexOf(assetId);
                if (assetIndex > -1) {
                    uncategorized.linkedAssets.splice(assetIndex, 1);
                    uncategorized.totalAssets = uncategorized.linkedAssets.length;
                    this.saveData(CRM_STORAGE.PROJECTS, this.projects);
                    console.log('[CRM] ✅ Removed asset from Uncategorized');
                }
            }
            
            // Step 6: Update the asset's CRM status in library
            await this.updateAssetCRMStatus(assetId, {
                crmStatus: 'categorized',
                crmCompanyId: company.id,
                crmProjectId: project?.id || null,
            });
            
            this.logActivity('asset_categorized', {
                assetId,
                companyId: company.id,
                companyName: company.name,
                projectId: project?.id,
            });
            
            return { company, project, assetId };
        }
        
        /**
         * Update asset's CRM status in the library storage
         */
        async updateAssetCRMStatus(assetId, updates) {
            // Try to update via cavApp storage
            if (window.cavApp?.storage?.updateAsset) {
                try {
                    await window.cavApp.storage.updateAsset(assetId, updates);
                    return true;
                } catch (e) {
                    console.warn('[CRM] Failed to update asset via cavApp:', e);
                }
            }
            
            // Try direct IndexedDB
            try {
                const dbRequest = indexedDB.open('CAVStorage', 4);
                await new Promise((resolve, reject) => {
                    dbRequest.onerror = reject;
                    dbRequest.onsuccess = () => {
                        const db = dbRequest.result;
                        const tx = db.transaction('assets', 'readwrite');
                        const store = tx.objectStore('assets');
                        
                        const getRequest = store.get(assetId);
                        getRequest.onsuccess = () => {
                            const asset = getRequest.result;
                            if (asset) {
                                Object.assign(asset, updates, { updated_at: new Date().toISOString() });
                                store.put(asset);
                            }
                        };
                        
                        tx.oncomplete = resolve;
                        tx.onerror = reject;
                    };
                });
                return true;
            } catch (e) {
                console.warn('[CRM] Failed to update asset in IndexedDB:', e);
                return false;
            }
        }
        
        /**
         * Quick assign - show modal to assign asset to brand
         */
        showAssignToBrandModal(assetId, assetInfo = {}) {
            const companies = Object.values(this.companies);
            
            const modal = document.createElement('div');
            modal.className = 'crm-modal';
            modal.innerHTML = `
                <div class="crm-modal-content" style="max-width: 500px;">
                    <div class="crm-modal-header">
                        <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;vertical-align:middle;"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> Assign to Brand</h3>
                        <button class="crm-modal-close">&times;</button>
                    </div>
                    <div class="crm-modal-body">
                        <p style="margin-bottom: 1rem; color: #a1a1aa;">
                            ${assetInfo.filename ? `Assigning: <strong>${assetInfo.filename}</strong>` : 'Select a brand to assign this asset to:'}
                        </p>
                        
                        <div class="crm-form-group">
                            <label>Select Existing Brand</label>
                            <select id="assign-brand-select" class="crm-select" style="width: 100%;">
                                <option value="">— Choose a brand —</option>
                                ${companies.map(c => `<option value="${c.id}">${c.name}${c.website ? ` (${c.website})` : ''}</option>`).join('')}
                            </select>
                        </div>
                        
                        <div style="text-align: center; margin: 1rem 0; color: #666;">— OR —</div>
                        
                        <div class="crm-form-group">
                            <label>Create New Brand</label>
                            <input type="text" id="assign-brand-name" class="crm-input" placeholder="Brand/Company Name">
                        </div>
                        
                        <div class="crm-form-group">
                            <label>Website (optional - for auto-filling details)</label>
                            <input type="text" id="assign-brand-website" class="crm-input" placeholder="https://example.com">
                        </div>
                    </div>
                    <div class="crm-modal-footer">
                        <button class="crm-btn crm-btn-cancel">Cancel</button>
                        <button class="crm-btn crm-btn-primary" id="assign-brand-submit">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;vertical-align:middle;"><polyline points="20 6 9 17 4 12"/></svg> Assign to Brand
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Event handlers
            const close = () => modal.remove();
            modal.querySelector('.crm-modal-close').addEventListener('click', close);
            modal.querySelector('.crm-btn-cancel').addEventListener('click', close);
            modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
            
            // Clear other field when one is used
            const brandSelect = modal.querySelector('#assign-brand-select');
            const brandNameInput = modal.querySelector('#assign-brand-name');
            
            brandSelect.addEventListener('change', () => {
                if (brandSelect.value) brandNameInput.value = '';
            });
            brandNameInput.addEventListener('input', () => {
                if (brandNameInput.value) brandSelect.value = '';
            });
            
            // Submit handler
            modal.querySelector('#assign-brand-submit').addEventListener('click', async () => {
                const selectedId = brandSelect.value;
                const newName = brandNameInput.value.trim();
                const website = modal.querySelector('#assign-brand-website').value.trim();
                
                if (!selectedId && !newName) {
                    alert('Please select an existing brand or enter a new brand name.');
                    return;
                }
                
                try {
                    const brandInfo = selectedId 
                        ? { id: selectedId }
                        : { name: newName, website };
                    
                    const result = await this.assignAssetToBrand(assetId, brandInfo);
                    
                    // Show success message
                    alert(`Asset assigned to ${result.company.name}!`);
                    close();
                    
                    // Refresh displays
                    if (window.cavApp?.refreshAssets) window.cavApp.refreshAssets();
                    
                } catch (error) {
                    console.error('[CRM] Assignment failed:', error);
                    alert(`Failed to assign: ${error.message}`);
                }
            });
        }

        // ----------------------------------------
        // DEALS/OPPORTUNITIES
        // ----------------------------------------
        createDeal(data) {
            const id = this.generateId();
            const deal = {
                id,
                name: data.name || '',
                company: data.company || '',
                companyName: data.companyName || '',
                contact: data.contact || '',
                contactName: data.contactName || '',
                value: data.value || 0,
                currency: data.currency || 'USD',
                stage: data.stage || 'lead', // lead, qualified, proposal, negotiation, closed_won, closed_lost
                probability: data.probability || 0,
                expectedCloseDate: data.expectedCloseDate || null,
                actualCloseDate: data.actualCloseDate || null,
                source: data.source || 'direct', // direct, referral, website, social, email
                description: data.description || '',
                tags: data.tags || [],
                customFields: data.customFields || {},
                linkedProjects: [],
                linkedAssets: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: data.createdBy || window.cavUserSession?.email || 'system',
            };

            this.deals[id] = deal;
            this.saveData(CRM_STORAGE.DEALS, this.deals);
            this.logActivity('deal_created', { dealId: id, name: deal.name, value: deal.value });
            
            return deal;
        }

        updateDeal(id, updates) {
            if (!this.deals[id]) return null;
            
            const oldStage = this.deals[id].stage;
            this.deals[id] = {
                ...this.deals[id],
                ...updates,
                updatedAt: new Date().toISOString(),
            };
            
            this.saveData(CRM_STORAGE.DEALS, this.deals);
            
            if (oldStage !== updates.stage) {
                this.logActivity('deal_stage_changed', { 
                    dealId: id, 
                    oldStage, 
                    newStage: updates.stage 
                });
            } else {
                this.logActivity('deal_updated', { dealId: id });
            }
            
            return this.deals[id];
        }

        getAllDeals(filters = {}) {
            let results = Object.values(this.deals);

            if (filters.stage) {
                results = results.filter(d => d.stage === filters.stage);
            }
            if (filters.company) {
                results = results.filter(d => d.company === filters.company);
            }

            results.sort((a, b) => b.value - a.value);
            return results;
        }

        getDealPipeline() {
            const stages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
            const pipeline = {};
            
            stages.forEach(stage => {
                const deals = this.getAllDeals({ stage });
                pipeline[stage] = {
                    deals,
                    count: deals.length,
                    totalValue: deals.reduce((sum, d) => sum + d.value, 0),
                };
            });
            
            return pipeline;
        }

        // ----------------------------------------
        // BRIEFS (Enhanced Deals with Documents)
        // ----------------------------------------
        createBrief(data) {
            const id = this.generateId();
            const uuid = 'brief_' + id;
            
            const brief = {
                id,
                uuid,
                name: data.name || '',
                company: data.company || '',
                project: data.project || '',
                type: data.type || 'creative', // creative, campaign, brand, strategy, research, other
                description: data.description || '',
                tags: data.tags || [],
                aiOptions: data.aiOptions || {},
                files: [], // File references (stored separately)
                analyses: [], // AI analysis results
                extractedData: {}, // Data extracted by AI
                recommendations: [], // AI-generated recommendations
                status: 'active', // active, archived, completed
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: data.createdBy || window.cavUserSession?.email || 'system',
            };
            
            // Store file metadata (not the actual files)
            if (data.files && data.files.length > 0) {
                brief.files = data.files.map(f => ({
                    name: f.name,
                    type: f.type,
                    size: f.size,
                    uploadedAt: new Date().toISOString()
                }));
            }

            this.deals[id] = brief;
            this.saveData(CRM_STORAGE.DEALS, this.deals);
            this.logActivity('brief_created', { briefId: id, name: brief.name, fileCount: brief.files.length });
            
            // Sync to backend
            if (window.syncEngine) {
                const syncData = { ...brief, uuid, entity_type: 'deals' };
                window.syncEngine.saveDeal(syncData).catch(e => console.error('[CRM] Brief sync error:', e));
            }
            
            return brief;
        }
        
        addBriefAnalysis(briefId, analysis) {
            if (!this.deals[briefId]) return null;
            
            if (!this.deals[briefId].analyses) {
                this.deals[briefId].analyses = [];
            }
            
            this.deals[briefId].analyses.push({
                ...analysis,
                analyzedAt: new Date().toISOString()
            });
            
            this.deals[briefId].updatedAt = new Date().toISOString();
            this.saveData(CRM_STORAGE.DEALS, this.deals);
            
            this.logActivity('brief_analysis_added', { briefId, fileName: analysis.fileName });
            
            return this.deals[briefId];
        }
        
        updateBriefExtractedData(briefId, extractedData) {
            if (!this.deals[briefId]) return null;
            
            this.deals[briefId].extractedData = {
                ...this.deals[briefId].extractedData,
                ...extractedData
            };
            
            this.deals[briefId].updatedAt = new Date().toISOString();
            this.saveData(CRM_STORAGE.DEALS, this.deals);
            
            return this.deals[briefId];
        }
        
        getAllBriefs(filters = {}) {
            // Briefs are stored in deals but have type field
            let results = Object.values(this.deals).filter(d => 
                d.type && ['creative', 'campaign', 'brand', 'strategy', 'research', 'other'].includes(d.type)
            );
            
            if (filters.status) {
                results = results.filter(b => b.status === filters.status);
            }
            if (filters.company) {
                results = results.filter(b => b.company === filters.company);
            }
            if (filters.project) {
                results = results.filter(b => b.project === filters.project);
            }
            
            results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            return results;
        }

        // ----------------------------------------
        // ACTIVITY LOGGING
        // ----------------------------------------
        logActivity(type, data) {
            if (!this.settings.enableActivityTracking) return;

            const activity = {
                id: this.generateId(),
                uuid: this.generateId(),
                type,
                action: type,
                data,
                metadata: data,
                entity_type: data?.companyId ? 'company' : data?.contactId ? 'contact' : data?.projectId ? 'project' : 'general',
                entity_id: data?.companyId || data?.contactId || data?.projectId || null,
                user: window.cavUserSession?.email || 'system',
                userName: window.cavUserSession?.name || 'System',
                timestamp: new Date().toISOString(),
            };

            this.activities.unshift(activity);
            
            // Keep last 1000 activities
            if (this.activities.length > 1000) {
                this.activities = this.activities.slice(0, 1000);
            }
            
            this.saveData(CRM_STORAGE.ACTIVITIES, this.activities);
            
            // Sync to Supabase
            this.saveActivityToSupabase(activity);
        }

        getActivities(filters = {}) {
            let results = [...this.activities];

            if (filters.type) {
                results = results.filter(a => a.type === filters.type);
            }
            if (filters.contactId) {
                results = results.filter(a => a.data?.contactId === filters.contactId);
            }
            if (filters.companyId) {
                results = results.filter(a => a.data?.companyId === filters.companyId);
            }
            if (filters.projectId) {
                results = results.filter(a => a.data?.projectId === filters.projectId);
            }
            if (filters.limit) {
                results = results.slice(0, filters.limit);
            }

            return results;
        }

        // ----------------------------------------
        // TAGS
        // ----------------------------------------
        createTag(name, color = '#a855f7') {
            const id = this.generateId();
            const tag = {
                id,
                uuid: id,
                name,
                color,
                usage_count: 0,
                createdAt: new Date().toISOString(),
            };
            this.tags.push(tag);
            this.saveData(CRM_STORAGE.TAGS, this.tags);
            
            // Sync to Supabase
            this.saveTagToSupabase(tag);
            
            return tag;
        }

        getAllTags() {
            return this.tags;
        }

        deleteTag(id) {
            const tag = this.tags.find(t => t.id === id);
            this.tags = this.tags.filter(t => t.id !== id);
            this.saveData(CRM_STORAGE.TAGS, this.tags);
            
            // Delete from Supabase
            if (tag && window.CAVSupabase?.deleteTag) {
                window.CAVSupabase.deleteTag(tag.uuid || id).catch(e => 
                    console.warn('[CRM] Failed to delete tag from Supabase:', e)
                );
            }
        }

        // ----------------------------------------
        // STATISTICS
        // ----------------------------------------
        getStats() {
            const contacts = Object.values(this.contacts);
            const companies = Object.values(this.companies);
            const projects = Object.values(this.projects);
            const deals = Object.values(this.deals);

            return {
                totalContacts: contacts.length,
                activeContacts: contacts.filter(c => c.status === 'active').length,
                contactsByType: {
                    client: contacts.filter(c => c.type === 'client').length,
                    team: contacts.filter(c => c.type === 'team').length,
                    vendor: contacts.filter(c => c.type === 'vendor').length,
                    partner: contacts.filter(c => c.type === 'partner').length,
                },
                totalCompanies: companies.length,
                totalProjects: projects.length,
                activeProjects: projects.filter(p => p.status === 'active').length,
                totalDeals: deals.length,
                totalDealValue: deals.reduce((sum, d) => sum + d.value, 0),
                wonDeals: deals.filter(d => d.stage === 'closed_won').length,
                wonValue: deals.filter(d => d.stage === 'closed_won').reduce((sum, d) => sum + d.value, 0),
                recentActivities: this.activities.slice(0, 10),
            };
        }

        // ----------------------------------------
        // IMPORT/EXPORT
        // ----------------------------------------
        exportAll() {
            return {
                contacts: this.contacts,
                companies: this.companies,
                projects: this.projects,
                deals: this.deals,
                tags: this.tags,
                customFields: this.customFields,
                exportedAt: new Date().toISOString(),
                version: '2.0.0',
            };
        }

        importData(data) {
            if (data.contacts) {
                this.contacts = { ...this.contacts, ...data.contacts };
                this.saveData(CRM_STORAGE.CONTACTS, this.contacts);
            }
            if (data.companies) {
                this.companies = { ...this.companies, ...data.companies };
                this.saveData(CRM_STORAGE.COMPANIES, this.companies);
            }
            if (data.projects) {
                this.projects = { ...this.projects, ...data.projects };
                this.saveData(CRM_STORAGE.PROJECTS, this.projects);
            }
            if (data.deals) {
                this.deals = { ...this.deals, ...data.deals };
                this.saveData(CRM_STORAGE.DEALS, this.deals);
            }
            if (data.tags) {
                this.tags = [...this.tags, ...data.tags.filter(t => !this.tags.find(et => et.name === t.name))];
                this.saveData(CRM_STORAGE.TAGS, this.tags);
            }
            
            this.logActivity('data_imported', { 
                contacts: Object.keys(data.contacts || {}).length,
                companies: Object.keys(data.companies || {}).length,
            });
        }

        // ----------------------------------------
        // SETTINGS
        // ----------------------------------------
        updateSettings(updates) {
            this.settings = { ...this.settings, ...updates };
            this.saveData(CRM_STORAGE.SETTINGS, this.settings);
            return this.settings;
        }

        getSettings() {
            return this.settings;
        }
    }

    // ============================================
    // CRM UI COMPONENTS
    // ============================================

    function createCRMDashboard(crm) {
        const stats = crm.getStats();
        
        const dashboard = document.createElement('div');
        dashboard.className = 'crm-dashboard';
        dashboard.innerHTML = `
            <div class="crm-header">
                <h2><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right: 8px; vertical-align: middle;"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>CRM Dashboard</h2>
                <div class="crm-header-actions">
                    <button class="crm-btn-primary" id="crm-add-contact"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Contact</button>
                    <button class="crm-btn-secondary" id="crm-add-company"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Company</button>
                    <button class="crm-btn-secondary" id="crm-add-project"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Project</button>
                </div>
            </div>
            
            <div class="crm-stats-grid">
                <div class="crm-stat-card">
                    <div class="crm-stat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
                    <div class="crm-stat-value">${stats.totalContacts}</div>
                    <div class="crm-stat-label">Contacts</div>
                </div>
                <div class="crm-stat-card">
                    <div class="crm-stat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><line x1="8" y1="6" x2="8" y2="6.01"/><line x1="16" y1="6" x2="16" y2="6.01"/><line x1="12" y1="6" x2="12" y2="6.01"/><line x1="8" y1="10" x2="8" y2="10.01"/><line x1="16" y1="10" x2="16" y2="10.01"/><line x1="12" y1="10" x2="12" y2="10.01"/></svg></div>
                    <div class="crm-stat-value">${stats.totalCompanies}</div>
                    <div class="crm-stat-label">Companies</div>
                </div>
                <div class="crm-stat-card">
                    <div class="crm-stat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div>
                    <div class="crm-stat-value">${stats.activeProjects}</div>
                    <div class="crm-stat-label">Active Projects</div>
                </div>
                <div class="crm-stat-card">
                    <div class="crm-stat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
                    <div class="crm-stat-value">$${(stats.totalDealValue / 1000).toFixed(0)}k</div>
                    <div class="crm-stat-label">Pipeline Value</div>
                </div>
            </div>
            
            <div class="crm-tabs">
                <button class="crm-tab active" data-tab="contacts"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Contacts</button>
                <button class="crm-tab" data-tab="companies"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><line x1="8" y1="6" x2="8" y2="6.01"/><line x1="16" y1="6" x2="16" y2="6.01"/></svg> Companies</button>
                <button class="crm-tab" data-tab="projects"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> Projects</button>
                <button class="crm-tab" data-tab="deals"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> Deals</button>
                <button class="crm-tab" data-tab="activity"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Activity</button>
            </div>
            
            <div class="crm-content">
                <div class="crm-tab-content active" id="crm-tab-contacts">
                    <div class="crm-search-bar">
                        <input type="text" placeholder="Search contacts..." id="crm-contact-search">
                        <select id="crm-contact-filter">
                            <option value="">All Types</option>
                            <option value="client">Clients</option>
                            <option value="team">Team</option>
                            <option value="vendor">Vendors</option>
                            <option value="partner">Partners</option>
                        </select>
                    </div>
                    <div class="crm-list" id="crm-contacts-list"></div>
                </div>
                
                <div class="crm-tab-content" id="crm-tab-companies">
                    <div class="crm-search-bar">
                        <input type="text" placeholder="Search companies..." id="crm-company-search">
                    </div>
                    <div class="crm-list" id="crm-companies-list"></div>
                </div>
                
                <div class="crm-tab-content" id="crm-tab-projects">
                    <div class="crm-search-bar">
                        <input type="text" placeholder="Search projects..." id="crm-project-search">
                        <select id="crm-project-filter">
                            <option value="">All Statuses</option>
                            <option value="planning">Planning</option>
                            <option value="active">Active</option>
                            <option value="review">In Review</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <div class="crm-list" id="crm-projects-list"></div>
                </div>
                
                <div class="crm-tab-content" id="crm-tab-deals">
                    <div class="crm-pipeline" id="crm-deal-pipeline"></div>
                </div>
                
                <div class="crm-tab-content" id="crm-tab-activity">
                    <div class="crm-activity-feed" id="crm-activity-feed"></div>
                </div>
            </div>
        `;
        
        return dashboard;
    }

    function createContactForm(contact = null) {
        const isEdit = !!contact;
        
        const form = document.createElement('div');
        form.className = 'crm-modal';
        form.innerHTML = `
            <div class="crm-modal-content">
                <div class="crm-modal-header">
                    <h3>${isEdit ? 'Edit Contact' : 'Add New Contact'}</h3>
                    <button class="crm-modal-close">&times;</button>
                </div>
                <div class="crm-modal-body">
                    <div class="crm-form-row">
                        <div class="crm-form-group">
                            <label>First Name *</label>
                            <input type="text" id="contact-firstName" value="${contact?.firstName || ''}" required>
                        </div>
                        <div class="crm-form-group">
                            <label>Last Name *</label>
                            <input type="text" id="contact-lastName" value="${contact?.lastName || ''}" required>
                        </div>
                    </div>
                    <div class="crm-form-row">
                        <div class="crm-form-group">
                            <label>Email *</label>
                            <input type="email" id="contact-email" value="${contact?.email || ''}" required>
                        </div>
                        <div class="crm-form-group">
                            <label>Phone</label>
                            <input type="tel" id="contact-phone" value="${contact?.phone || ''}">
                        </div>
                    </div>
                    <div class="crm-form-row">
                        <div class="crm-form-group">
                            <label>Company</label>
                            <input type="text" id="contact-company" value="${contact?.companyName || ''}">
                        </div>
                        <div class="crm-form-group">
                            <label>Title</label>
                            <input type="text" id="contact-title" value="${contact?.title || ''}">
                        </div>
                    </div>
                    <div class="crm-form-group">
                        <label>Type</label>
                        <select id="contact-type">
                            <option value="client" ${contact?.type === 'client' ? 'selected' : ''}>Client</option>
                            <option value="team" ${contact?.type === 'team' ? 'selected' : ''}>Team Member</option>
                            <option value="vendor" ${contact?.type === 'vendor' ? 'selected' : ''}>Vendor</option>
                            <option value="partner" ${contact?.type === 'partner' ? 'selected' : ''}>Partner</option>
                        </select>
                    </div>
                    <div class="crm-form-group">
                        <label>Notes</label>
                        <textarea id="contact-notes" rows="3">${contact?.notes || ''}</textarea>
                    </div>
                </div>
                <div class="crm-modal-footer">
                    <button class="crm-btn-secondary crm-modal-cancel">Cancel</button>
                    <button class="crm-btn-primary crm-modal-save">${isEdit ? 'Update' : 'Create'} Contact</button>
                </div>
            </div>
        `;
        
        return form;
    }

    // ============================================
    // CREATE COMPANY FORM
    // ============================================
    function createCompanyForm(company = null) {
        const isEdit = !!company;
        
        const form = document.createElement('div');
        form.className = 'crm-modal';
        form.innerHTML = `
            <div class="crm-modal-content">
                <div class="crm-modal-header">
                    <h3>${isEdit ? 'Edit Company' : 'Add New Company'}</h3>
                    <button class="crm-modal-close">&times;</button>
                </div>
                <div class="crm-modal-body">
                    <div class="crm-form-row">
                        <div class="crm-form-group">
                            <label>Company Name *</label>
                            <input type="text" id="company-name" value="${company?.name || ''}" required>
                        </div>
                        <div class="crm-form-group">
                            <label>Industry</label>
                            <select id="company-industry">
                                <option value="Technology" ${company?.industry === 'Technology' ? 'selected' : ''}>Technology</option>
                                <option value="Retail" ${company?.industry === 'Retail' ? 'selected' : ''}>Retail</option>
                                <option value="Finance" ${company?.industry === 'Finance' ? 'selected' : ''}>Finance</option>
                                <option value="Healthcare" ${company?.industry === 'Healthcare' ? 'selected' : ''}>Healthcare</option>
                                <option value="Education" ${company?.industry === 'Education' ? 'selected' : ''}>Education</option>
                                <option value="Media" ${company?.industry === 'Media' ? 'selected' : ''}>Media/Entertainment</option>
                                <option value="Food" ${company?.industry === 'Food' ? 'selected' : ''}>Food & Beverage</option>
                                <option value="Sports" ${company?.industry === 'Sports' ? 'selected' : ''}>Sports</option>
                                <option value="Cybersecurity" ${company?.industry === 'Cybersecurity' ? 'selected' : ''}>Cybersecurity</option>
                                <option value="Other" ${company?.industry === 'Other' ? 'selected' : ''}>Other</option>
                            </select>
                        </div>
                    </div>
                    <div class="crm-form-row">
                        <div class="crm-form-group">
                            <label>Website</label>
                            <input type="url" id="company-website" value="${company?.website || ''}" placeholder="https://...">
                        </div>
                        <div class="crm-form-group">
                            <label>Phone</label>
                            <input type="tel" id="company-phone" value="${company?.phone || ''}">
                        </div>
                    </div>
                    <div class="crm-form-row">
                        <div class="crm-form-group">
                            <label>Email</label>
                            <input type="email" id="company-email" value="${company?.email || ''}">
                        </div>
                        <div class="crm-form-group">
                            <label>Location</label>
                            <input type="text" id="company-location" value="${company?.location || ''}" placeholder="City, State">
                        </div>
                    </div>
                    <div class="crm-form-group">
                        <label>Type</label>
                        <select id="company-type">
                            <option value="client" ${company?.type === 'client' ? 'selected' : ''}>Client</option>
                            <option value="agency" ${company?.type === 'agency' ? 'selected' : ''}>Agency</option>
                            <option value="vendor" ${company?.type === 'vendor' ? 'selected' : ''}>Vendor</option>
                            <option value="partner" ${company?.type === 'partner' ? 'selected' : ''}>Partner</option>
                        </select>
                    </div>
                    <div class="crm-form-group">
                        <label>Description</label>
                        <textarea id="company-description" rows="3">${company?.description || ''}</textarea>
                    </div>
                    <div class="crm-form-group">
                        <label>Tags (comma separated)</label>
                        <input type="text" id="company-tags" value="${(company?.tags || []).join(', ')}">
                    </div>
                    <div class="crm-form-group">
                        <label>Notes</label>
                        <textarea id="company-notes" rows="3">${company?.notes || ''}</textarea>
                    </div>
                </div>
                <div class="crm-modal-footer">
                    <button class="crm-btn-secondary crm-modal-cancel">Cancel</button>
                    <button class="crm-btn-primary crm-modal-save">${isEdit ? 'Update' : 'Create'} Company</button>
                </div>
            </div>
        `;
        
        return form;
    }

    // ============================================
    // CREATE PROJECT FORM
    // ============================================
    function createProjectForm(project = null) {
        const isEdit = !!project;
        const companies = window.cavCRM ? Object.values(window.cavCRM.companies) : [];
        
        const form = document.createElement('div');
        form.className = 'crm-modal';
        form.innerHTML = `
            <div class="crm-modal-content">
                <div class="crm-modal-header">
                    <h3>${isEdit ? 'Edit Project' : 'Add New Project'}</h3>
                    <button class="crm-modal-close">&times;</button>
                </div>
                <div class="crm-modal-body">
                    <div class="crm-form-row">
                        <div class="crm-form-group">
                            <label>Project Name *</label>
                            <input type="text" id="project-name" value="${project?.name || ''}" required>
                        </div>
                        <div class="crm-form-group">
                            <label>Client/Company</label>
                            <select id="project-client">
                                <option value="">Select Company...</option>
                                ${companies.map(c => `
                                    <option value="${c.id}" ${project?.client === c.id ? 'selected' : ''}>${c.name}</option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="crm-form-row">
                        <div class="crm-form-group">
                            <label>Project Type</label>
                            <select id="project-type">
                                <option value="campaign" ${project?.type === 'campaign' ? 'selected' : ''}>Campaign</option>
                                <option value="brand" ${project?.type === 'brand' ? 'selected' : ''}>Brand</option>
                                <option value="social" ${project?.type === 'social' ? 'selected' : ''}>Social Media</option>
                                <option value="video" ${project?.type === 'video' ? 'selected' : ''}>Video Production</option>
                                <option value="other" ${project?.type === 'other' ? 'selected' : ''}>Other</option>
                            </select>
                        </div>
                        <div class="crm-form-group">
                            <label>Status</label>
                            <select id="project-status">
                                <option value="planning" ${project?.status === 'planning' ? 'selected' : ''}>Planning</option>
                                <option value="active" ${project?.status === 'active' ? 'selected' : ''}>Active</option>
                                <option value="review" ${project?.status === 'review' ? 'selected' : ''}>In Review</option>
                                <option value="completed" ${project?.status === 'completed' ? 'selected' : ''}>Completed</option>
                                <option value="on_hold" ${project?.status === 'on_hold' ? 'selected' : ''}>On Hold</option>
                            </select>
                        </div>
                    </div>
                    <div class="crm-form-row">
                        <div class="crm-form-group">
                            <label>Start Date</label>
                            <input type="date" id="project-start" value="${project?.startDate?.split('T')[0] || ''}">
                        </div>
                        <div class="crm-form-group">
                            <label>Deadline</label>
                            <input type="date" id="project-deadline" value="${project?.deadline?.split('T')[0] || ''}">
                        </div>
                    </div>
                    <div class="crm-form-row">
                        <div class="crm-form-group">
                            <label>Budget ($)</label>
                            <input type="number" id="project-budget" value="${project?.budget || ''}" placeholder="0.00">
                        </div>
                        <div class="crm-form-group">
                            <label>Priority</label>
                            <select id="project-priority">
                                <option value="low" ${project?.priority === 'low' ? 'selected' : ''}>Low</option>
                                <option value="medium" ${project?.priority === 'medium' ? 'selected' : ''}>Medium</option>
                                <option value="high" ${project?.priority === 'high' ? 'selected' : ''}>High</option>
                                <option value="urgent" ${project?.priority === 'urgent' ? 'selected' : ''}>Urgent</option>
                            </select>
                        </div>
                    </div>
                    <div class="crm-form-group">
                        <label>Description</label>
                        <textarea id="project-description" rows="3">${project?.description || ''}</textarea>
                    </div>
                    <div class="crm-form-group">
                        <label>Tags (comma separated)</label>
                        <input type="text" id="project-tags" value="${(project?.tags || []).join(', ')}">
                    </div>
                </div>
                <div class="crm-modal-footer">
                    <button class="crm-btn-secondary crm-modal-cancel">Cancel</button>
                    <button class="crm-btn-primary crm-modal-save">${isEdit ? 'Update' : 'Create'} Project</button>
                </div>
            </div>
        `;
        
        return form;
    }

    // ============================================
    // CRM EVENT HANDLERS
    // ============================================
    function attachCRMEventHandlers(container, crm) {
        // Add Contact button
        container.querySelector('#crm-add-contact')?.addEventListener('click', () => {
            showCRMModal(createContactForm(), (data) => {
                crm.createContact(data);
                refreshCRMList(container, crm, 'contacts');
            }, 'contact');
        });

        // Add Company button
        container.querySelector('#crm-add-company')?.addEventListener('click', () => {
            showCRMModal(createCompanyForm(), (data) => {
                crm.createCompany(data);
                refreshCRMList(container, crm, 'companies');
            }, 'company');
        });

        // Add Project button
        container.querySelector('#crm-add-project')?.addEventListener('click', () => {
            showCRMModal(createProjectForm(), (data) => {
                crm.createProject(data);
                refreshCRMList(container, crm, 'projects');
            }, 'project');
        });

        // Tab navigation
        container.querySelectorAll('.crm-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                container.querySelectorAll('.crm-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                container.querySelectorAll('.crm-tab-content').forEach(c => c.classList.remove('active'));
                container.querySelector(`#crm-tab-${tabName}`)?.classList.add('active');
                refreshCRMList(container, crm, tabName);
            });
        });

        // Initial list render
        refreshCRMList(container, crm, 'contacts');
    }

    function showCRMModal(form, onSave, type) {
        document.body.appendChild(form);

        // Close button
        form.querySelector('.crm-modal-close')?.addEventListener('click', () => form.remove());
        form.querySelector('.crm-modal-cancel')?.addEventListener('click', () => form.remove());

        // Backdrop click
        form.addEventListener('click', (e) => {
            if (e.target === form) form.remove();
        });

        // Save button - with enhanced feedback
        const saveBtn = form.querySelector('.crm-modal-save');
        saveBtn?.addEventListener('click', async () => {
            const data = {};
            const entityNames = { contact: 'Contact', company: 'Company', project: 'Project' };
            
            if (type === 'contact') {
                data.firstName = form.querySelector('#contact-firstName')?.value;
                data.lastName = form.querySelector('#contact-lastName')?.value;
                data.email = form.querySelector('#contact-email')?.value;
                data.phone = form.querySelector('#contact-phone')?.value;
                data.companyName = form.querySelector('#contact-company')?.value;
                data.title = form.querySelector('#contact-title')?.value;
                data.type = form.querySelector('#contact-type')?.value;
                data.notes = form.querySelector('#contact-notes')?.value;
                
                // Validation
                if (!data.firstName && !data.lastName) {
                    if (window.PersistenceUI) {
                        window.PersistenceUI.showError('Validation Error', 'Please enter a name for the contact');
                    }
                    return;
                }
            } else if (type === 'company') {
                data.name = form.querySelector('#company-name')?.value;
                data.industry = form.querySelector('#company-industry')?.value;
                data.website = form.querySelector('#company-website')?.value;
                data.phone = form.querySelector('#company-phone')?.value;
                data.email = form.querySelector('#company-email')?.value;
                data.location = form.querySelector('#company-location')?.value;
                data.type = form.querySelector('#company-type')?.value;
                data.description = form.querySelector('#company-description')?.value;
                data.tags = form.querySelector('#company-tags')?.value.split(',').map(t => t.trim()).filter(Boolean);
                data.notes = form.querySelector('#company-notes')?.value;
                
                // Validation
                if (!data.name) {
                    if (window.PersistenceUI) {
                        window.PersistenceUI.showError('Validation Error', 'Please enter a company name');
                    }
                    return;
                }
            } else if (type === 'project') {
                data.name = form.querySelector('#project-name')?.value;
                data.client = form.querySelector('#project-client')?.value;
                data.clientName = form.querySelector('#project-client')?.selectedOptions[0]?.text || '';
                data.type = form.querySelector('#project-type')?.value;
                data.status = form.querySelector('#project-status')?.value;
                data.startDate = form.querySelector('#project-start')?.value;
                data.deadline = form.querySelector('#project-deadline')?.value;
                data.budget = parseFloat(form.querySelector('#project-budget')?.value) || 0;
                data.priority = form.querySelector('#project-priority')?.value;
                data.description = form.querySelector('#project-description')?.value;
                data.tags = form.querySelector('#project-tags')?.value.split(',').map(t => t.trim()).filter(Boolean);
                
                // Validation
                if (!data.name) {
                    if (window.PersistenceUI) {
                        window.PersistenceUI.showError('Validation Error', 'Please enter a project name');
                    }
                    return;
                }
            }

            // Show saving state
            const originalText = saveBtn.textContent;
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<span class="crm-spinner"></span> Saving...';
            
            try {
                if (onSave) await onSave(data);
                
                // Show success feedback
                if (window.PersistenceUI) {
                    const name = data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || entityNames[type];
                    window.PersistenceUI.showSuccess(`${entityNames[type]} Saved`, `"${name}" has been saved successfully`);
                }
                
                form.remove();
            } catch (error) {
                console.error('[CRM] Save error:', error);
                saveBtn.disabled = false;
                saveBtn.textContent = originalText;
                
                if (window.PersistenceUI) {
                    window.PersistenceUI.showError('Save Failed', error.message || 'Could not save data');
                }
            }
        });
    }

    function refreshCRMList(container, crm, type) {
        if (type === 'contacts') {
            const list = container.querySelector('#crm-contacts-list');
            if (list) {
                const contacts = crm.getAllContacts();
                list.innerHTML = contacts.length === 0 ? 
                    '<p class="crm-empty">No contacts yet. Click "Add Contact" to create one.</p>' :
                    contacts.map(c => `
                        <div class="crm-list-item" data-id="${c.id}">
                            <div class="crm-list-avatar">${c.firstName?.[0] || '?'}${c.lastName?.[0] || ''}</div>
                            <div class="crm-list-info">
                                <h4>${c.firstName} ${c.lastName}</h4>
                                <p>${c.email} ${c.companyName ? `• ${c.companyName}` : ''}</p>
                            </div>
                            <div class="crm-list-actions">
                                <button class="crm-btn-small" data-action="edit-contact" data-id="${c.id}">✏️</button>
                                <button class="crm-btn-small crm-btn-danger" data-action="delete-contact" data-id="${c.id}">🗑️</button>
                            </div>
                        </div>
                    `).join('');
                attachListActions(list, crm, container, 'contact');
            }
        } else if (type === 'companies') {
            const list = container.querySelector('#crm-companies-list');
            if (list) {
                const companies = crm.getAllCompanies();
                list.innerHTML = companies.length === 0 ? 
                    '<p class="crm-empty">No companies yet. Click "Add Company" to create one.</p>' :
                    companies.map(c => `
                        <div class="crm-list-item crm-clickable" data-id="${c.id}" data-company-id="${c.id}">
                            <div class="crm-list-avatar crm-company-avatar">${c.logo ? `<img src="${c.logo}" alt="${c.name}">` : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><line x1="8" y1="6" x2="8" y2="6.01"/><line x1="16" y1="6" x2="16" y2="6.01"/></svg>'}</div>
                            <div class="crm-list-info">
                                <h4>${c.name}</h4>
                                <p>
                                    ${c.industry || 'Industry not set'} 
                                    ${c.type ? `• <span class="crm-type-badge crm-type-${c.type}">${c.type}</span>` : ''}
                                    ${c.website ? `• <a href="${c.website}" target="_blank" onclick="event.stopPropagation();">${c.website}</a>` : ''}
                                </p>
                                ${c.description ? `<p class="crm-description">${c.description.substring(0, 100)}...</p>` : ''}
                            </div>
                            <div class="crm-list-meta">
                                <span class="crm-badge crm-badge-${c.status || 'active'}">${c.status || 'active'}</span>
                                ${c.linkedAssets?.length ? `<span class="crm-badge crm-badge-info"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg> ${c.linkedAssets.length} assets</span>` : ''}
                                ${c.linkedProjects?.length ? `<span class="crm-badge crm-badge-project"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> ${c.linkedProjects.length} projects</span>` : ''}
                                ${c.analyses?.length ? `<span class="crm-badge crm-badge-analysis"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> ${c.analyses.length} analyses</span>` : ''}
                            </div>
                            <div class="crm-list-actions">
                                <button class="crm-btn-small crm-btn-share" data-action="share-company" data-id="${c.id}" title="Share with Team">${c.sharing?.isShared ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>' : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>'}</button>
                                <button class="crm-btn-small crm-btn-view" data-action="view-company" data-id="${c.id}" title="View Details"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
                                <button class="crm-btn-small" data-action="edit-company" data-id="${c.id}" title="Edit"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                                <button class="crm-btn-small crm-btn-danger" data-action="delete-company" data-id="${c.id}" title="Delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                            </div>
                        </div>
                    `).join('');
                attachListActions(list, crm, container, 'company');
                
                // Add share button handlers
                list.querySelectorAll('[data-action="share-company"]').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const id = e.target.closest('button').dataset.id;
                        crm.showSharingModal(id);
                    });
                });
                
                // Add click handlers for view detail
                list.querySelectorAll('[data-action="view-company"]').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const id = e.target.dataset.id;
                        showCompanyDetail(crm, id, container);
                    });
                });
                
                // Also make the whole row clickable
                list.querySelectorAll('.crm-clickable').forEach(item => {
                    item.addEventListener('click', () => {
                        const id = item.dataset.id;
                        showCompanyDetail(crm, id, container);
                    });
                });
            }
        } else if (type === 'projects') {
            const list = container.querySelector('#crm-projects-list');
            if (list) {
                const projects = crm.getAllProjects();
                list.innerHTML = projects.length === 0 ? 
                    '<p class="crm-empty">No projects yet. Click "Add Project" to create one.</p>' :
                    projects.map(p => `
                        <div class="crm-list-item" data-id="${p.id}">
                            <div class="crm-list-avatar crm-project-avatar"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div>
                            <div class="crm-list-info">
                                <h4>${p.name}</h4>
                                <p>${p.clientName || 'No client'} • ${p.type}</p>
                            </div>
                            <div class="crm-list-meta">
                                <span class="crm-badge crm-status-${p.status}">${p.status}</span>
                                ${p.deadline ? `<span class="crm-deadline">Due: ${new Date(p.deadline).toLocaleDateString()}</span>` : ''}
                            </div>
                            <div class="crm-list-actions">
                                <button class="crm-btn-small crm-btn-share" data-action="share-project" data-id="${p.id}" title="Share with Team">${p.sharing?.isShared ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>' : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>'}</button>
                                <button class="crm-btn-small" data-action="edit-project" data-id="${p.id}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                                <button class="crm-btn-small crm-btn-danger" data-action="delete-project" data-id="${p.id}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                            </div>
                        </div>
                    `).join('');
                attachListActions(list, crm, container, 'project');
                
                // Add share button handlers for projects
                list.querySelectorAll('[data-action="share-project"]').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const id = e.target.closest('button').dataset.id;
                        crm.showProjectSharingModal(id);
                    });
                });
            }
        }
    }

    // ============================================
    // COMPANY DETAIL VIEW - ENHANCED SINGLE PAGE
    // ============================================
    function showCompanyDetail(crm, companyId, container) {
        const company = crm.getCompany(companyId);
        if (!company) return;
        
        // Get all related data
        const projects = crm.getAllProjects({ client: companyId });
        const contacts = crm.getAllContacts({ company: companyId });
        const assets = getCompanyAssets(company.linkedAssets || []);
        const analyses = company.analyses || [];
        const benchmarks = company.benchmarks || [];
        const swipeFiles = company.swipeFiles || [];
        const competitors = company.competitors || [];
        const bestPractices = company.bestPractices || [];
        const urlAnalyses = company.urlAnalyses || [];
        const aiAnalyses = company.aiAnalyses || [];
        
        // Calculate missing fields
        const missingFields = [];
        if (!company.industry) missingFields.push('industry');
        if (!company.website) missingFields.push('website');
        if (!company.description) missingFields.push('description');
        if (!company.phone) missingFields.push('phone');
        
        const detailView = document.createElement('div');
        detailView.className = 'crm-modal crm-detail-modal crm-fullpage';
        detailView.innerHTML = `
            <div class="crm-modal-content crm-detail-content" style="max-width: 1200px; max-height: 95vh; overflow: hidden;">
                <div class="crm-modal-header" style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 1.25rem 1.5rem;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="font-size: 2.5rem;">${company.logo ? `<img src="${company.logo}" style="width:50px;height:50px;border-radius:50%;object-fit:cover;">` : '<svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><line x1="8" y1="6" x2="8" y2="6.01"/><line x1="16" y1="6" x2="16" y2="6.01"/></svg>'}</div>
                        <div>
                            <h3 style="margin: 0; font-size: 1.5rem;">${company.name}</h3>
                            <div style="display: flex; gap: 0.5rem; margin-top: 0.25rem;">
                                <span class="crm-type-badge crm-type-${company.type}" style="font-size: 0.75rem;">${company.type || 'client'}</span>
                                <span style="font-size: 0.85rem; color: rgba(255,255,255,0.8);">${company.industry || 'Industry not set'}</span>
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        ${missingFields.length > 0 ? `<button class="crm-btn-ai" id="auto-populate-btn" style="font-size: 0.85rem;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>Auto-Populate (${missingFields.length} missing)</button>` : ''}
                        <button class="crm-modal-close" style="background: rgba(255,255,255,0.1); border: none; width: 36px; height: 36px; border-radius: 50%; color: #fff; cursor: pointer; font-size: 1.5rem;">&times;</button>
                    </div>
                </div>
                
                <!-- Tabs Navigation -->
                <div class="crm-detail-tabs" style="display: flex; gap: 0; background: rgba(0,0,0,0.3); border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <button class="crm-detail-tab active" data-tab="overview" style="padding: 1rem 1.5rem; border: none; background: rgba(168,85,247,0.2); color: #fff; cursor: pointer; border-bottom: 2px solid #a855f7;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>Overview</button>
                    <button class="crm-detail-tab" data-tab="assets" style="padding: 1rem 1.5rem; border: none; background: transparent; color: #9ca3af; cursor: pointer;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg> Assets (${assets.length})</button>
                    <button class="crm-detail-tab" data-tab="analyses" style="padding: 1rem 1.5rem; border: none; background: transparent; color: #9ca3af; cursor: pointer;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>Analyses (${analyses.length})</button>
                    <button class="crm-detail-tab" data-tab="strategy" style="padding: 1rem 1.5rem; border: none; background: transparent; color: #9ca3af; cursor: pointer;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>Strategy</button>
                    <button class="crm-detail-tab" data-tab="competitors" style="padding: 1rem 1.5rem; border: none; background: transparent; color: #9ca3af; cursor: pointer;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> Competitors (${competitors.length})</button>
                    <button class="crm-detail-tab" data-tab="ai-chat" style="padding: 1rem 1.5rem; border: none; background: transparent; color: #9ca3af; cursor: pointer;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><circle cx="12" cy="12" r="3"/><path d="M12 1v4"/><path d="M12 19v4"/><path d="M4.22 4.22l2.83 2.83"/><path d="M16.95 16.95l2.83 2.83"/><path d="M1 12h4"/><path d="M19 12h4"/><path d="M4.22 19.78l2.83-2.83"/><path d="M16.95 7.05l2.83-2.83"/></svg> AI Chat</button>
                </div>
                
                <div class="crm-detail-body" style="overflow-y: auto; max-height: calc(95vh - 150px); padding: 0;">
                    
                    <!-- Overview Tab -->
                    <div class="crm-tab-content" id="tab-overview" style="padding: 1.5rem;">
                        <div style="display: grid; grid-template-columns: 300px 1fr; gap: 2rem;">
                            <!-- Sidebar Info -->
                            <div>
                                <div style="background: rgba(0,0,0,0.2); border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem;">
                                    <h4 style="margin: 0 0 1rem; color: #fff;">Company Info</h4>
                                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                                        <p style="margin: 0; color: #c4b5fd;"><strong>Industry:</strong> ${company.industry || '<span style="color:#6b7280">Not set</span>'}</p>
                                        <p style="margin: 0; color: #c4b5fd;"><strong>Website:</strong> ${company.website ? `<a href="${company.website}" target="_blank" style="color:#a78bfa">${company.website}</a>` : '<span style="color:#6b7280">Not set</span>'}</p>
                                        <p style="margin: 0; color: #c4b5fd;"><strong>Phone:</strong> ${company.phone || '<span style="color:#6b7280">Not set</span>'}</p>
                                        <p style="margin: 0; color: #c4b5fd;"><strong>Status:</strong> ${company.status || 'active'}</p>
                                        <p style="margin: 0; color: #c4b5fd;"><strong>Created:</strong> ${new Date(company.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    ${company.description ? `<p style="margin: 1rem 0 0; color: #9ca3af; font-style: italic; font-size: 0.9rem;">${company.description}</p>` : ''}
                                </div>
                                
                                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                                    <button class="crm-btn-primary" data-action="edit-this-company" style="width: 100%;">✏️ Edit Company</button>
                                    <button class="crm-btn-secondary" data-action="add-project-for-company" style="width: 100%;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>Add Project</button>
                                    <button class="crm-btn-ai" data-action="ai-analyze-company" style="width: 100%;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;vertical-align:middle;"><circle cx="12" cy="12" r="3"/><path d="M12 1v4"/><path d="M12 19v4"/><path d="M4.22 4.22l2.83 2.83"/><path d="M16.95 16.95l2.83 2.83"/><path d="M1 12h4"/><path d="M19 12h4"/><path d="M4.22 19.78l2.83-2.83"/><path d="M16.95 7.05l2.83-2.83"/></svg> Full AI Analysis</button>
                                </div>
                            </div>
                            
                            <!-- Main Stats -->
                            <div>
                                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
                                    <div style="background: rgba(168,85,247,0.2); border-radius: 12px; padding: 1rem; text-align: center;">
                                        <div style="font-size: 2rem; font-weight: 700; color: #fff;">${assets.length}</div>
                                        <div style="font-size: 0.85rem; color: #c4b5fd;">Assets</div>
                                    </div>
                                    <div style="background: rgba(59,130,246,0.2); border-radius: 12px; padding: 1rem; text-align: center;">
                                        <div style="font-size: 2rem; font-weight: 700; color: #fff;">${analyses.length}</div>
                                        <div style="font-size: 0.85rem; color: #93c5fd;">Analyses</div>
                                    </div>
                                    <div style="background: rgba(34,197,94,0.2); border-radius: 12px; padding: 1rem; text-align: center;">
                                        <div style="font-size: 2rem; font-weight: 700; color: #fff;">${projects.length}</div>
                                        <div style="font-size: 0.85rem; color: #86efac;">Projects</div>
                                    </div>
                                    <div style="background: rgba(249,115,22,0.2); border-radius: 12px; padding: 1rem; text-align: center;">
                                        <div style="font-size: 2rem; font-weight: 700; color: #fff;">${competitors.length}</div>
                                        <div style="font-size: 0.85rem; color: #fb923c;">Competitors</div>
                                    </div>
                                </div>
                                
                                <!-- Quick Stats from Analyses -->
                                ${analyses.length > 0 ? `
                                    <div style="background: rgba(0,0,0,0.2); border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem;">
                                        <h4 style="margin: 0 0 1rem; color: #fff;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:6px;vertical-align:middle;"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>Average Scores</h4>
                                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                                            <div style="text-align: center;">
                                                <div style="font-size: 1.5rem; font-weight: 600; color: #22c55e;">
                                                    ${Math.round(analyses.reduce((sum, a) => sum + (a.hookScore || 0), 0) / analyses.filter(a => a.hookScore).length) || 'N/A'}
                                                </div>
                                                <div style="font-size: 0.8rem; color: #9ca3af;">Avg Hook Score</div>
                                            </div>
                                            <div style="text-align: center;">
                                                <div style="font-size: 1.5rem; font-weight: 600; color: #3b82f6;">
                                                    ${Math.round(analyses.reduce((sum, a) => sum + (a.ctaScore || 0), 0) / analyses.filter(a => a.ctaScore).length) || 'N/A'}
                                                </div>
                                                <div style="font-size: 0.8rem; color: #9ca3af;">Avg CTA Score</div>
                                            </div>
                                            <div style="text-align: center;">
                                                <div style="font-size: 1.5rem; font-weight: 600; color: #a855f7;">
                                                    ${Math.round(analyses.reduce((sum, a) => sum + (a.thumbStopScore || 0), 0) / analyses.filter(a => a.thumbStopScore).length) || 'N/A'}
                                                </div>
                                                <div style="font-size: 0.8rem; color: #9ca3af;">Avg Thumb-Stop</div>
                                            </div>
                                        </div>
                                    </div>
                                ` : ''}
                                
                                <!-- Recent Activity -->
                                <div style="background: rgba(0,0,0,0.2); border-radius: 12px; padding: 1.25rem;">
                                    <h4 style="margin: 0 0 1rem; color: #fff;">⏰ Recent Activity</h4>
                                    ${[...analyses, ...urlAnalyses].slice(0, 5).length > 0 ? `
                                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                                            ${[...analyses.map(a => ({...a, type: 'analysis'})), ...urlAnalyses.map(u => ({...u, type: 'url'}))].sort((a, b) => new Date(b.analyzedAt || b.savedAt) - new Date(a.analyzedAt || a.savedAt)).slice(0, 5).map(item => `
                                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: rgba(0,0,0,0.2); border-radius: 6px;">
                                                    <span style="color: #fff;">${item.type === 'analysis' ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>' : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>'} ${item.assetFilename || item.url?.substring(0, 30) || 'Unknown'}</span>
                                                    <span style="font-size: 0.75rem; color: #6b7280;">${new Date(item.analyzedAt || item.savedAt).toLocaleDateString()}</span>
                                                </div>
                                            `).join('')}
                                        </div>
                                    ` : '<p style="color: #6b7280; margin: 0;">No recent activity</p>'}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Assets Tab -->
                    <div class="crm-tab-content" id="tab-assets" style="display: none; padding: 1.5rem;">
                        <h3 style="margin: 0 0 1rem; color: #fff;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;vertical-align:middle;"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg> Linked Assets (${assets.length})</h3>
                        ${assets.length === 0 ? '<p style="color: #6b7280; text-align: center; padding: 2rem;">No assets linked yet. Analyze creatives to link them to this company.</p>' : `
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem;">
                                ${assets.map(a => `
                                    <div style="background: rgba(0,0,0,0.3); border-radius: 8px; overflow: hidden;">
                                        ${a.thumbnail_url || a.thumbnail || a.dataUrl ? 
                                          `<img src="${a.thumbnail_url || a.thumbnail || a.dataUrl}" style="width: 100%; height: 120px; object-fit: cover;">` : 
                                          `<div style="width: 100%; height: 120px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.2);"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity:0.5;">${a.file_type === 'video' ? '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>' : '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>'}</svg></div>`}
                                        <div style="padding: 0.75rem;">
                                            <p style="margin: 0 0 0.25rem; font-size: 0.85rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${a.filename || 'Unknown'}</p>
                                            <p style="margin: 0; font-size: 0.75rem; color: #6b7280;">${a.width || '?'}×${a.height || '?'}</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>
                    
                    <!-- Analyses Tab -->
                    <div class="crm-tab-content" id="tab-analyses" style="display: none; padding: 1.5rem;">
                        <h3 style="margin: 0 0 1rem; color: #fff;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:6px;vertical-align:middle;"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>Creative Analyses (${analyses.length})</h3>
                        ${analyses.length === 0 ? '<p style="color: #6b7280; text-align: center; padding: 2rem;">No analyses yet. Use the Analyze module to analyze creatives.</p>' : `
                            <div style="display: flex; flex-direction: column; gap: 1rem;">
                                ${analyses.map(a => `
                                    <div style="background: rgba(0,0,0,0.2); border-radius: 12px; padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
                                        <div>
                                            <h4 style="margin: 0 0 0.25rem; color: #fff;">${a.assetFilename || 'Unknown Asset'}</h4>
                                            <p style="margin: 0; font-size: 0.85rem; color: #6b7280;">${new Date(a.analyzedAt).toLocaleString()}</p>
                                        </div>
                                        <div style="display: flex; gap: 1rem;">
                                            ${a.hookScore ? `<div style="text-align: center;"><div style="font-size: 1.25rem; font-weight: 600; color: #22c55e;">${a.hookScore}</div><div style="font-size: 0.7rem; color: #6b7280;">Hook</div></div>` : ''}
                                            ${a.ctaScore ? `<div style="text-align: center;"><div style="font-size: 1.25rem; font-weight: 600; color: #3b82f6;">${a.ctaScore}</div><div style="font-size: 0.7rem; color: #6b7280;">CTA</div></div>` : ''}
                                            ${a.thumbStopScore ? `<div style="text-align: center;"><div style="font-size: 1.25rem; font-weight: 600; color: #a855f7;">${a.thumbStopScore}</div><div style="font-size: 0.7rem; color: #6b7280;">Thumb-Stop</div></div>` : ''}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                        
                        ${benchmarks.length > 0 ? `
                            <h3 style="margin: 2rem 0 1rem; color: #fff;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:6px;vertical-align:middle;"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>Benchmarks (${benchmarks.length})</h3>
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem;">
                                ${benchmarks.map(b => `
                                    <div style="background: rgba(34,197,94,0.15); border-radius: 8px; padding: 1rem; text-align: center;">
                                        <div style="font-size: 0.85rem; color: #9ca3af; margin-bottom: 0.25rem;">${b.metric || b.name}</div>
                                        <div style="font-size: 1.5rem; font-weight: 700; color: #22c55e;">${b.value}</div>
                                        ${b.source ? `<div style="font-size: 0.7rem; color: #6b7280; margin-top: 0.25rem;">Source: ${b.source}</div>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Strategy Tab -->
                    <div class="crm-tab-content" id="tab-strategy" style="display: none; padding: 1.5rem;">
                        <h3 style="margin: 0 0 1rem; color: #fff;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:6px;vertical-align:middle;"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>Strategy & Best Practices</h3>
                        
                        ${bestPractices.length > 0 ? `
                            <div style="background: rgba(0,0,0,0.2); border-radius: 12px; padding: 1.25rem; margin-bottom: 1.5rem;">
                                <h4 style="margin: 0 0 1rem; color: #fff;">📖 Best Practices (${bestPractices.length})</h4>
                                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                                    ${bestPractices.map(p => `
                                        <div style="padding: 0.75rem; background: rgba(34,197,94,0.1); border-radius: 8px; border-left: 3px solid #22c55e;">
                                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                                                <span style="background: rgba(34,197,94,0.2); padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.7rem; color: #86efac;">${p.category || 'General'}</span>
                                            </div>
                                            <p style="margin: 0; color: #e9d5ff;">${p.practice || p.description}</p>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : '<p style="color: #6b7280; text-align: center; padding: 2rem;">No best practices saved yet. Analyze URLs to extract best practices.</p>'}
                        
                        ${swipeFiles.length > 0 ? `
                            <div style="background: rgba(0,0,0,0.2); border-radius: 12px; padding: 1.25rem;">
                                <h4 style="margin: 0 0 1rem; color: #fff;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:6px;vertical-align:middle;"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>Swipe Files (${swipeFiles.length})</h4>
                                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
                                    ${swipeFiles.map(s => `
                                        <div style="background: rgba(0,0,0,0.3); border-radius: 8px; overflow: hidden;">
                                            ${s.thumbnailData ? `<img src="${s.thumbnailData}" style="width: 100%; height: 100px; object-fit: cover;">` : '<div style="width: 100%; height: 100px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.2);"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>'}
                                            <div style="padding: 0.75rem;">
                                                <p style="margin: 0 0 0.25rem; font-size: 0.85rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${s.title || 'Swipe'}</p>
                                                ${s.sourceUrl ? `<a href="${s.sourceUrl}" target="_blank" style="font-size: 0.7rem; color: #a78bfa;">View source ↗️</a>` : ''}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Competitors Tab -->
                    <div class="crm-tab-content" id="tab-competitors" style="display: none; padding: 1.5rem;">
                        <h3 style="margin: 0 0 1rem; color: #fff;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;vertical-align:middle;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> Competitors (${competitors.length})</h3>
                        ${competitors.length === 0 ? '<p style="color: #6b7280; text-align: center; padding: 2rem;">No competitors tracked yet. Use URL analysis or AI to detect competitors.</p>' : `
                            <div style="display: flex; flex-direction: column; gap: 1rem;">
                                ${competitors.map(c => `
                                    <div style="background: rgba(249,115,22,0.1); border-radius: 12px; padding: 1rem; border: 1px solid rgba(249,115,22,0.3);">
                                        <div style="display: flex; align-items: center; gap: 1rem;">
                                            <div style="font-size: 2.5rem;"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.5"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><line x1="8" y1="6" x2="8" y2="6.01"/><line x1="16" y1="6" x2="16" y2="6.01"/></svg></div>
                                            <div style="flex: 1;">
                                                <h4 style="margin: 0; color: #fff;">${c.name}</h4>
                                                <p style="margin: 0.25rem 0 0; font-size: 0.85rem; color: #9ca3af;">${c.website || c.domain || 'No website'}</p>
                                                ${c.description ? `<p style="margin: 0.5rem 0 0; font-size: 0.85rem; color: #c4b5fd;">${c.description}</p>` : ''}
                                            </div>
                                            ${c.industry ? `<span style="background: rgba(168,85,247,0.2); padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; color: #c4b5fd;">${c.industry}</span>` : ''}
                                        </div>
                                        ${c.strengths?.length > 0 ? `
                                            <div style="margin-top: 0.75rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                                ${c.strengths.map(s => `<span style="background: rgba(34,197,94,0.2); padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.7rem; color: #86efac;">${s}</span>`).join('')}
                                            </div>
                                        ` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        `}
                        
                        <button class="crm-btn-secondary" id="fetch-competitors-btn" style="margin-top: 1.5rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>Auto-Detect Competitors with AI</button>
                    </div>
                    
                    <!-- AI Chat Tab -->
                    <div class="crm-tab-content" id="tab-ai-chat" style="display: none; padding: 1.5rem;">
                        <h3 style="margin: 0 0 1rem; color: #fff;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;vertical-align:middle;"><circle cx="12" cy="12" r="3"/><path d="M12 1v4"/><path d="M12 19v4"/><path d="M4.22 4.22l2.83 2.83"/><path d="M16.95 16.95l2.83 2.83"/><path d="M1 12h4"/><path d="M19 12h4"/><path d="M4.22 19.78l2.83-2.83"/><path d="M16.95 7.05l2.83-2.83"/></svg> AI Strategy Chat</h3>
                        <p style="color: #9ca3af; margin-bottom: 1rem;">Ask Claude or GPT questions about this company's creative strategy, competitive positioning, or media planning.</p>
                        
                        <div id="ai-chat-messages" style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 1rem; min-height: 300px; max-height: 400px; overflow-y: auto; margin-bottom: 1rem;">
                            <div style="text-align: center; color: #6b7280; padding: 2rem;">
                                <p style="font-size: 2rem; margin: 0;"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity:0.6;"><circle cx="12" cy="12" r="3"/><path d="M12 1v4"/><path d="M12 19v4"/><path d="M4.22 4.22l2.83 2.83"/><path d="M16.95 16.95l2.83 2.83"/><path d="M1 12h4"/><path d="M19 12h4"/><path d="M4.22 19.78l2.83-2.83"/><path d="M16.95 7.05l2.83-2.83"/></svg></p>
                                <p>Start a conversation about ${company.name}</p>
                            </div>
                        </div>
                        
                        <div style="display: flex; gap: 0.5rem;">
                            <input type="text" id="ai-chat-input" placeholder="Ask about creative strategy, competitors, media planning..." style="flex: 1; padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); color: #fff; font-size: 0.9rem;">
                            <button id="ai-chat-send" class="crm-btn-ai" style="padding: 0.75rem 1.5rem;">Send</button>
                        </div>
                        
                        <div style="display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap;">
                            <button class="crm-chat-suggestion" data-prompt="What are the key creative strengths of ${company.name}?" style="padding: 0.5rem 1rem; border-radius: 999px; border: 1px solid rgba(168,85,247,0.3); background: rgba(168,85,247,0.1); color: #c4b5fd; cursor: pointer; font-size: 0.8rem;">💪 Creative Strengths</button>
                            <button class="crm-chat-suggestion" data-prompt="Suggest a paid media strategy for ${company.name}" style="padding: 0.5rem 1rem; border-radius: 999px; border: 1px solid rgba(59,130,246,0.3); background: rgba(59,130,246,0.1); color: #93c5fd; cursor: pointer; font-size: 0.8rem;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>Media Strategy</button>
                            <button class="crm-chat-suggestion" data-prompt="How should ${company.name} position against competitors?" style="padding: 0.5rem 1rem; border-radius: 999px; border: 1px solid rgba(249,115,22,0.3); background: rgba(249,115,22,0.1); color: #fb923c; cursor: pointer; font-size: 0.8rem;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> Competitive Position</button>
                            <button class="crm-chat-suggestion" data-prompt="What creative formats should ${company.name} prioritize?" style="padding: 0.5rem 1rem; border-radius: 999px; border: 1px solid rgba(34,197,94,0.3); background: rgba(34,197,94,0.1); color: #86efac; cursor: pointer; font-size: 0.8rem;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>Creative Formats</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(detailView);
        
        // Tab switching
        detailView.querySelectorAll('.crm-detail-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                detailView.querySelectorAll('.crm-detail-tab').forEach(t => {
                    t.style.background = 'transparent';
                    t.style.color = '#9ca3af';
                    t.style.borderBottom = '2px solid transparent';
                    t.classList.remove('active');
                });
                detailView.querySelectorAll('.crm-tab-content').forEach(c => c.style.display = 'none');
                
                tab.style.background = 'rgba(168,85,247,0.2)';
                tab.style.color = '#fff';
                tab.style.borderBottom = '2px solid #a855f7';
                tab.classList.add('active');
                
                detailView.querySelector(`#tab-${tab.dataset.tab}`).style.display = 'block';
            });
        });
        
        // Close handlers
        detailView.querySelector('.crm-modal-close').addEventListener('click', () => detailView.remove());
        detailView.addEventListener('click', (e) => {
            if (e.target === detailView) detailView.remove();
        });
        
        // Edit company button
        detailView.querySelector('[data-action="edit-this-company"]')?.addEventListener('click', () => {
            detailView.remove();
            const form = createCompanyForm(company);
            showCRMModal(form, (data) => {
                crm.updateCompany(companyId, data);
                refreshCRMList(container, crm, 'companies');
            }, 'company');
        });
        
        // Add project button
        detailView.querySelector('[data-action="add-project-for-company"]')?.addEventListener('click', () => {
            detailView.remove();
            const form = createProjectForm(null, company);
            showCRMModal(form, (data) => {
                data.client = companyId;
                data.clientName = company.name;
                crm.createProject(data);
                refreshCRMList(container, crm, 'projects');
            }, 'project');
        });
        
        // AI Analyze button
        detailView.querySelector('[data-action="ai-analyze-company"]')?.addEventListener('click', async () => {
            await runCompanyAIAnalysis(crm, company, assets, analyses, detailView);
        });
        
        // Auto-populate button
        detailView.querySelector('#auto-populate-btn')?.addEventListener('click', async () => {
            await autoPopulateCompanyFields(crm, company, detailView);
        });
        
        // Fetch competitors button
        detailView.querySelector('#fetch-competitors-btn')?.addEventListener('click', async () => {
            const btn = detailView.querySelector('#fetch-competitors-btn');
            btn.disabled = true;
            btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;vertical-align:middle;animation:spin 1s linear infinite;"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Detecting...';
            
            try {
                if (window.CAVLearn?.autoFetchCompetitors) {
                    const newCompetitors = await window.CAVLearn.autoFetchCompetitors(company.name, company.industry);
                    if (newCompetitors?.length > 0) {
                        for (const comp of newCompetitors) {
                            crm.addCompetitorToCompany(companyId, comp);
                        }
                        alert(`Found ${newCompetitors.length} competitors!`);
                        detailView.remove();
                        showCompanyDetail(crm, companyId, container);
                    } else {
                        alert('No new competitors found.');
                    }
                } else {
                    alert('AI competitor detection not available. Please configure API keys.');
                }
            } catch (e) {
                alert('Error: ' + e.message);
            } finally {
                btn.disabled = false;
                btn.textContent = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>Auto-Detect Competitors with AI';
            }
        });
        
        // AI Chat functionality
        const chatInput = detailView.querySelector('#ai-chat-input');
        const chatSend = detailView.querySelector('#ai-chat-send');
        const chatMessages = detailView.querySelector('#ai-chat-messages');
        
        async function sendChatMessage(message) {
            if (!message.trim()) return;
            
            // Add user message
            chatMessages.innerHTML += `
                <div style="display: flex; justify-content: flex-end; margin-bottom: 0.75rem;">
                    <div style="background: rgba(168,85,247,0.3); padding: 0.75rem 1rem; border-radius: 12px 12px 0 12px; max-width: 70%;">
                        <p style="margin: 0; color: #fff;">${message}</p>
                    </div>
                </div>
            `;
            
            // Add loading
            const loadingId = 'loading-' + Date.now();
            chatMessages.innerHTML += `
                <div id="${loadingId}" style="display: flex; margin-bottom: 0.75rem;">
                    <div style="background: rgba(59,130,246,0.2); padding: 0.75rem 1rem; border-radius: 12px 12px 12px 0; max-width: 70%;">
                        <p style="margin: 0; color: #9ca3af;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;vertical-align:middle;animation:spin 1s linear infinite;"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Thinking...</p>
                    </div>
                </div>
            `;
            chatMessages.scrollTop = chatMessages.scrollHeight;
            chatInput.value = '';
            
            try {
                const contextPrompt = `You are an AI creative strategist assistant for ${company.name}.

Company Context:
- Industry: ${company.industry || 'Unknown'}
- Type: ${company.type || 'client'}
- Assets: ${assets.length} linked assets
- Analyses: ${analyses.length} creative analyses
- Competitors: ${competitors.map(c => c.name).join(', ') || 'None tracked'}
- Best Practices: ${bestPractices.length} saved

User Question: ${message}

Provide a helpful, actionable response focused on creative strategy and paid media optimization.`;

                let response = '';
                
                if (window.AIOrchestrator?.callAI) {
                    response = await window.AIOrchestrator.callAI(contextPrompt, { model: 'claude' });
                } else if (window.CAVSettings?.getAPIKey('gemini')) {
                    const apiKey = window.CAVSettings.getAPIKey('gemini');
                    const res = await fetch(
                        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                contents: [{ parts: [{ text: contextPrompt }] }],
                                generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
                            })
                        }
                    );
                    const data = await res.json();
                    response = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
                } else {
                    response = 'AI not configured. Please set up API keys in Settings.';
                }
                
                // Remove loading and add response
                document.getElementById(loadingId)?.remove();
                chatMessages.innerHTML += `
                    <div style="display: flex; margin-bottom: 0.75rem;">
                        <div style="background: rgba(59,130,246,0.2); padding: 0.75rem 1rem; border-radius: 12px 12px 12px 0; max-width: 70%;">
                            <p style="margin: 0; color: #fff; white-space: pre-wrap;">${response}</p>
                        </div>
                    </div>
                `;
                chatMessages.scrollTop = chatMessages.scrollHeight;
                
            } catch (e) {
                document.getElementById(loadingId)?.remove();
                chatMessages.innerHTML += `
                    <div style="display: flex; margin-bottom: 0.75rem;">
                        <div style="background: rgba(239,68,68,0.2); padding: 0.75rem 1rem; border-radius: 12px 12px 12px 0; max-width: 70%;">
                            <p style="margin: 0; color: #fca5a5;">Error: ${e.message}</p>
                        </div>
                    </div>
                `;
            }
        }
        
        chatSend?.addEventListener('click', () => sendChatMessage(chatInput.value));
        chatInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendChatMessage(chatInput.value);
        });
        
        // Chat suggestion buttons
        detailView.querySelectorAll('.crm-chat-suggestion').forEach(btn => {
            btn.addEventListener('click', () => {
                sendChatMessage(btn.dataset.prompt);
            });
        });
    }
    
    // Auto-populate missing company fields using AI/Search
    async function autoPopulateCompanyFields(crm, company, detailView) {
        const btn = detailView.querySelector('#auto-populate-btn');
        btn.disabled = true;
        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;vertical-align:middle;animation:spin 1s linear infinite;"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Searching...';
        
        try {
            let updates = {};
            
            // Use SearchAPI if available
            if (window.AIOrchestrator?.callSearchAPI) {
                const searchResults = await window.AIOrchestrator.callSearchAPI(`${company.name} company about`, { num: 5 });
                
                if (searchResults.results?.length > 0) {
                    // Use AI to extract info
                    const prompt = `Based on these search results about ${company.name}, extract company information.

Search Results:
${searchResults.results.map(r => `- ${r.title}: ${r.snippet}`).join('\n')}

Return ONLY a JSON object with these fields (leave blank if not found):
{
    "industry": "detected industry",
    "description": "brief company description",
    "website": "company website URL"
}`;

                    const aiResponse = await window.AIOrchestrator.callAI(prompt, { model: 'gemini', format: 'json' });
                    
                    try {
                        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            const parsed = JSON.parse(jsonMatch[0]);
                            if (parsed.industry && !company.industry) updates.industry = parsed.industry;
                            if (parsed.description && !company.description) updates.description = parsed.description;
                            if (parsed.website && !company.website) updates.website = parsed.website;
                        }
                    } catch (e) {
                        console.warn('Failed to parse AI response:', e);
                    }
                }
            }
            
            if (Object.keys(updates).length > 0) {
                crm.updateCompany(company.id, updates);
                alert(`Updated ${Object.keys(updates).length} fields!`);
                detailView.remove();
                showCompanyDetail(crm, company.id, detailView.parentElement);
            } else {
                alert('No new information found.');
            }
            
        } catch (e) {
            alert('Error: ' + e.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>Auto-Populate';
        }
    }
    
    // ============================================
    // AI-POWERED COMPANY ANALYSIS
    // ============================================
    async function runCompanyAIAnalysis(crm, company, assets, existingAnalyses, detailView) {
        // Show loading state
        const analysisSection = detailView.querySelector('.crm-detail-main');
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'crm-ai-loading';
        loadingDiv.innerHTML = `
            <div class="crm-ai-loading-content">
                <div class="crm-spinner"></div>
                <h4><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;vertical-align:middle;animation:spin 1s linear infinite;"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Running AI Analysis...</h4>
                <p>Analyzing ${company.name}'s creative assets, landing pages, and market position...</p>
            </div>
        `;
        analysisSection.prepend(loadingDiv);
        
        try {
            // Get API key
            const apiKey = localStorage.getItem('cav_ai_api_key') || 
                          window.CAVSettings?.getAPIKey('gemini') ||
                          window.CAVSettings?.getAPIKey('claude') ||
                          window.CAVSettings?.getAPIKey('openai');
            
            if (!apiKey) {
                throw new Error('No API key configured. Please set up an API key in Settings.');
            }
            
            // Build comprehensive prompt
            const prompt = buildCompanyAnalysisPrompt(company, assets, existingAnalyses);
            
            // Try Claude first (preferred), then Gemini, then OpenAI
            let analysis = null;
            
            if (window.CAVSettings?.getAPIKey('claude')) {
                analysis = await runClaudeAnalysis(prompt, window.CAVSettings.getAPIKey('claude'));
            } else if (apiKey) {
                analysis = await runGeminiAnalysis(prompt, apiKey);
            }
            
            if (!analysis) {
                throw new Error('Failed to run AI analysis. Please check your API configuration.');
            }
            
            // Save analysis to company
            const fullAnalysis = {
                id: Date.now().toString(),
                type: 'company_ai_analysis',
                analyzedAt: new Date().toISOString(),
                companyId: company.id,
                assetCount: assets.length,
                analysis: analysis,
            };
            
            if (!company.aiAnalyses) company.aiAnalyses = [];
            company.aiAnalyses.unshift(fullAnalysis);
            crm.updateCompany(company.id, { aiAnalyses: company.aiAnalyses });
            
            // Remove loading and show results
            loadingDiv.remove();
            showAIAnalysisResults(analysis, analysisSection, company);
            
        } catch (error) {
            loadingDiv.remove();
            alert('AI Analysis Error: ' + error.message);
            console.error('AI Analysis error:', error);
        }
    }
    
    function buildCompanyAnalysisPrompt(company, assets, existingAnalyses) {
        return `You are a senior creative strategist and media buyer expert. Analyze this company and provide comprehensive creative and media strategy recommendations.

## Company Information
- **Name:** ${company.name}
- **Industry:** ${company.industry || 'Unknown'}
- **Website:** ${company.website || 'Not provided'}
- **Type:** ${company.type || 'client'}
- **Description:** ${company.description || 'No description available'}

## Creative Assets (${assets.length} total)
${assets.map(a => `- ${a.filename}: ${a.file_type || 'image'}, ${a.dimensions?.width || 'unknown'}x${a.dimensions?.height || 'unknown'}`).join('\n')}

## Previous Analyses Summary
${existingAnalyses.length > 0 ? existingAnalyses.map(a => `- Asset: ${a.assetFilename}, Hook Score: ${a.hookScore || 'N/A'}, CTA Score: ${a.ctaScore || 'N/A'}`).join('\n') : 'No previous analyses'}

Please provide a comprehensive analysis in JSON format with these sections:

{
  "executiveSummary": "2-3 sentence overview of creative strategy status",
  "creativeStrategy": {
    "strengths": ["list of 3-5 creative strengths"],
    "weaknesses": ["list of 3-5 areas for improvement"],
    "recommendations": ["list of 5 specific actionable recommendations"]
  },
  "paidMediaStrategy": {
    "searchAds": {
      "recommended": true/false,
      "budget_allocation": "percentage of budget",
      "key_tactics": ["list of tactics"],
      "expected_cpa": "estimated CPA range"
    },
    "socialAds": {
      "recommended_platforms": ["Meta", "TikTok", etc],
      "budget_allocation": "percentage of budget",
      "creative_formats": ["Recommended formats"],
      "audience_targeting": ["Key audience segments"]
    },
    "displayAds": {
      "recommended_networks": ["GDN", "TTD", "DV360"],
      "budget_allocation": "percentage",
      "placements": ["Recommended placements"],
      "retargeting_strategy": "Brief retargeting approach"
    }
  },
  "competitiveInsights": {
    "positioning": "How company should position vs competitors",
    "differentiators": ["Key differentiators to highlight"],
    "market_opportunities": ["Untapped opportunities"]
  },
  "contentCalendar": {
    "immediate_priorities": ["Next 2 weeks actions"],
    "monthly_themes": ["Suggested monthly content themes"],
    "seasonal_opportunities": ["Upcoming seasonal opportunities"]
  },
  "kpiTargets": {
    "awareness": {"metric": "CPM", "target": "target range"},
    "consideration": {"metric": "CTR", "target": "target range"},
    "conversion": {"metric": "CPA", "target": "target range"}
  },
  "overallScore": 85,
  "confidenceLevel": "high/medium/low"
}

Respond ONLY with the JSON object, no additional text.`;
    }
    
    async function runGeminiAnalysis(prompt, apiKey) {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 8192,
                    }
                })
            }
        );
        
        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }
        
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        // Parse JSON from response - sanitize control characters first
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            // Remove control characters that break JSON parsing
            const sanitized = jsonMatch[0]
                .replace(/[\x00-\x1F\x7F]/g, (char) => {
                    // Keep newlines and tabs but escape them properly
                    if (char === '\n') return '\\n';
                    if (char === '\r') return '\\r';
                    if (char === '\t') return '\\t';
                    return ''; // Remove other control characters
                })
                .replace(/\n/g, '\\n')
                .replace(/\r/g, '\\r')
                .replace(/\t/g, '\\t');
            
            try {
                return JSON.parse(sanitized);
            } catch (e) {
                // Try parsing with more aggressive sanitization
                const aggressive = jsonMatch[0]
                    .replace(/[\x00-\x1F\x7F]/g, ' ')
                    .replace(/\s+/g, ' ');
                return JSON.parse(aggressive);
            }
        }
        
        throw new Error('Failed to parse AI response');
    }
    
    async function runClaudeAnalysis(prompt, apiKey) {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-5-20250929',
                max_tokens: 8192,
                messages: [{ role: 'user', content: prompt }]
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Claude API error: ${error.error?.message || response.status}`);
        }
        
        const data = await response.json();
        const text = data.content?.[0]?.text || '';
        
        // Parse JSON from response - sanitize control characters first
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            // Remove control characters that break JSON parsing
            const sanitized = jsonMatch[0]
                .replace(/[\x00-\x1F\x7F]/g, (char) => {
                    // Keep newlines and tabs but escape them properly
                    if (char === '\n') return '\\n';
                    if (char === '\r') return '\\r';
                    if (char === '\t') return '\\t';
                    return ''; // Remove other control characters
                })
                .replace(/\n/g, '\\n')
                .replace(/\r/g, '\\r')
                .replace(/\t/g, '\\t');
            
            try {
                return JSON.parse(sanitized);
            } catch (e) {
                // Try parsing with more aggressive sanitization
                const aggressive = jsonMatch[0]
                    .replace(/[\x00-\x1F\x7F]/g, ' ')
                    .replace(/\s+/g, ' ');
                return JSON.parse(aggressive);
            }
        }
        
        throw new Error('Failed to parse Claude response');
    }
    
    function showAIAnalysisResults(analysis, container, company) {
        const resultsDiv = document.createElement('div');
        resultsDiv.className = 'crm-ai-results';
        resultsDiv.innerHTML = `
            <div class="crm-ai-header">
                <h4><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;vertical-align:middle;"><circle cx="12" cy="12" r="3"/><path d="M12 1v4"/><path d="M12 19v4"/><path d="M4.22 4.22l2.83 2.83"/><path d="M16.95 16.95l2.83 2.83"/><path d="M1 12h4"/><path d="M19 12h4"/><path d="M4.22 19.78l2.83-2.83"/><path d="M16.95 7.05l2.83-2.83"/></svg> AI Strategy Analysis for ${company.name}</h4>
                <span class="crm-ai-score">Score: ${analysis.overallScore || 'N/A'}/100</span>
                <span class="crm-ai-confidence">${analysis.confidenceLevel || 'medium'} confidence</span>
            </div>
            
            <div class="crm-ai-summary">
                <p>${analysis.executiveSummary}</p>
            </div>
            
            <!-- Creative Strategy -->
            <div class="crm-ai-section">
                <h5><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>Creative Strategy</h5>
                <div class="crm-ai-columns">
                    <div class="crm-ai-column">
                        <h6><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Strengths</h6>
                        <ul>${(analysis.creativeStrategy?.strengths || []).map(s => `<li>${s}</li>`).join('')}</ul>
                    </div>
                    <div class="crm-ai-column">
                        <h6><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:4px;vertical-align:middle;color:#f59e0b;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>Areas to Improve</h6>
                        <ul>${(analysis.creativeStrategy?.weaknesses || []).map(w => `<li>${w}</li>`).join('')}</ul>
                    </div>
                </div>
                <div class="crm-ai-recommendations">
                    <h6><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 4 12.9V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.1A7 7 0 0 1 12 2z"/></svg>Recommendations</h6>
                    <ol>${(analysis.creativeStrategy?.recommendations || []).map(r => `<li>${r}</li>`).join('')}</ol>
                </div>
            </div>
            
            <!-- Paid Media Strategy -->
            <div class="crm-ai-section">
                <h5>📣 Paid Media Strategy</h5>
                <div class="crm-ai-media-grid">
                    ${analysis.paidMediaStrategy?.searchAds ? `
                        <div class="crm-ai-media-card">
                            <h6><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>Search Ads</h6>
                            <p><strong>Budget:</strong> ${analysis.paidMediaStrategy.searchAds.budget_allocation}</p>
                            <p><strong>Expected CPA:</strong> ${analysis.paidMediaStrategy.searchAds.expected_cpa || 'TBD'}</p>
                            <ul>${(analysis.paidMediaStrategy.searchAds.key_tactics || []).map(t => `<li>${t}</li>`).join('')}</ul>
                        </div>
                    ` : ''}
                    ${analysis.paidMediaStrategy?.socialAds ? `
                        <div class="crm-ai-media-card">
                            <h6><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> Social Ads</h6>
                            <p><strong>Platforms:</strong> ${(analysis.paidMediaStrategy.socialAds.recommended_platforms || []).join(', ')}</p>
                            <p><strong>Budget:</strong> ${analysis.paidMediaStrategy.socialAds.budget_allocation}</p>
                            <p><strong>Formats:</strong> ${(analysis.paidMediaStrategy.socialAds.creative_formats || []).join(', ')}</p>
                        </div>
                    ` : ''}
                    ${analysis.paidMediaStrategy?.displayAds ? `
                        <div class="crm-ai-media-card">
                            <h6><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>Display Ads</h6>
                            <p><strong>Networks:</strong> ${(analysis.paidMediaStrategy.displayAds.recommended_networks || []).join(', ')}</p>
                            <p><strong>Budget:</strong> ${analysis.paidMediaStrategy.displayAds.budget_allocation}</p>
                            <p><strong>Retargeting:</strong> ${analysis.paidMediaStrategy.displayAds.retargeting_strategy || 'N/A'}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- KPI Targets -->
            ${analysis.kpiTargets ? `
                <div class="crm-ai-section">
                    <h5><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:4px;vertical-align:middle;"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>KPI Targets</h5>
                    <div class="crm-ai-kpi-grid">
                        ${analysis.kpiTargets.awareness ? `
                            <div class="crm-ai-kpi">
                                <span class="crm-ai-kpi-label">Awareness</span>
                                <span class="crm-ai-kpi-metric">${analysis.kpiTargets.awareness.metric}</span>
                                <span class="crm-ai-kpi-target">${analysis.kpiTargets.awareness.target}</span>
                            </div>
                        ` : ''}
                        ${analysis.kpiTargets.consideration ? `
                            <div class="crm-ai-kpi">
                                <span class="crm-ai-kpi-label">Consideration</span>
                                <span class="crm-ai-kpi-metric">${analysis.kpiTargets.consideration.metric}</span>
                                <span class="crm-ai-kpi-target">${analysis.kpiTargets.consideration.target}</span>
                            </div>
                        ` : ''}
                        ${analysis.kpiTargets.conversion ? `
                            <div class="crm-ai-kpi">
                                <span class="crm-ai-kpi-label">Conversion</span>
                                <span class="crm-ai-kpi-metric">${analysis.kpiTargets.conversion.metric}</span>
                                <span class="crm-ai-kpi-target">${analysis.kpiTargets.conversion.target}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            ` : ''}
            
            <!-- Competitive Insights -->
            ${analysis.competitiveInsights ? `
                <div class="crm-ai-section">
                    <h5><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:4px;vertical-align:middle;color:#fbbf24;"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>Competitive Insights</h5>
                    <p><strong>Positioning:</strong> ${analysis.competitiveInsights.positioning}</p>
                    <p><strong>Key Differentiators:</strong> ${(analysis.competitiveInsights.differentiators || []).join(', ')}</p>
                </div>
            ` : ''}
            
            <div class="crm-ai-timestamp">
                <small>Generated ${new Date().toLocaleString()}</small>
            </div>
        `;
        
        container.prepend(resultsDiv);
    }
    
    // Helper to get assets by IDs
    function getCompanyAssets(assetIds) {
        if (!assetIds || assetIds.length === 0) return [];
        
        const assets = [];
        
        // Try to get from cavValidatorApp
        if (window.cavValidatorApp?.state?.assets) {
            assetIds.forEach(id => {
                const asset = window.cavValidatorApp.state.assets.find(a => a.id === id);
                if (asset) assets.push(asset);
            });
        }
        
        // Try cavApp
        if (assets.length < assetIds.length && window.cavApp?.state?.assets) {
            assetIds.forEach(id => {
                if (!assets.find(a => a.id === id)) {
                    const asset = window.cavApp.state.assets.find(a => a.id === id);
                    if (asset) assets.push(asset);
                }
            });
        }
        
        return assets;
    }

    function attachListActions(list, crm, container, type) {
        // Edit buttons
        list.querySelectorAll(`[data-action="edit-${type}"]`).forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                let item, form;
                if (type === 'contact') {
                    item = crm.getContact(id);
                    form = createContactForm(item);
                } else if (type === 'company') {
                    item = crm.getCompany(id);
                    form = createCompanyForm(item);
                } else if (type === 'project') {
                    item = crm.getProject(id);
                    form = createProjectForm(item);
                }
                
                if (item && form) {
                    showCRMModal(form, (data) => {
                        if (type === 'contact') crm.updateContact(id, data);
                        else if (type === 'company') crm.updateCompany(id, data);
                        else if (type === 'project') crm.updateProject(id, data);
                        refreshCRMList(container, crm, type + 's');
                    }, type);
                }
            });
        });

        // Delete buttons - with enhanced confirmation
        list.querySelectorAll(`[data-action="delete-${type}"]`).forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = e.target.closest('[data-id]')?.dataset.id || e.target.dataset.id;
                const entityNames = { contact: 'Contact', company: 'Company', project: 'Project' };
                
                // Get the item name for the confirmation message
                let itemName = type;
                if (type === 'contact') {
                    const contact = crm.contacts[id];
                    itemName = contact ? `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'this contact' : 'this contact';
                } else if (type === 'company') {
                    const company = crm.companies[id];
                    itemName = company?.name || 'this company';
                } else if (type === 'project') {
                    const project = crm.projects[id];
                    itemName = project?.name || 'this project';
                }
                
                // Use PersistenceUI for nice confirm dialog, fall back to confirm()
                const confirmed = window.PersistenceUI 
                    ? await window.PersistenceUI.confirm({
                        title: `Delete ${entityNames[type]}?`,
                        message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
                        confirmText: 'Delete',
                        cancelText: 'Cancel'
                    })
                    : confirm(`Delete ${itemName}?`);
                
                if (confirmed) {
                    try {
                        if (type === 'contact') crm.deleteContact(id);
                        else if (type === 'company') crm.deleteCompany(id);
                        else if (type === 'project') crm.deleteProject(id);
                        
                        refreshCRMList(container, crm, type + 's');
                        
                        // Show success feedback
                        if (window.PersistenceUI) {
                            window.PersistenceUI.showSuccess(`${entityNames[type]} Deleted`, `"${itemName}" has been removed`);
                        }
                    } catch (error) {
                        console.error('[CRM] Delete error:', error);
                        if (window.PersistenceUI) {
                            window.PersistenceUI.showError('Delete Failed', error.message || 'Could not delete item');
                        }
                    }
                }
            });
        });
    }

    // ============================================
    // CRM STYLES
    // ============================================
    const crmStyles = `
        .crm-dashboard {
            padding: 2rem;
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .crm-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }
        
        .crm-header h2 {
            font-size: 1.75rem;
            color: #fff;
        }
        
        .crm-header-actions {
            display: flex;
            gap: 0.75rem;
        }
        
        .crm-btn-primary {
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
            border: none;
            border-radius: 8px;
            color: #fff;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .crm-btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(168, 85, 247, 0.4);
        }
        
        .crm-btn-secondary {
            padding: 0.75rem 1.5rem;
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            color: #e9d5ff;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .crm-btn-secondary:hover {
            background: rgba(255, 255, 255, 0.1);
        }
        
        .crm-stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .crm-stat-card {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 16px;
            padding: 1.5rem;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .crm-stat-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }
        
        .crm-stat-value {
            font-size: 2.5rem;
            font-weight: 700;
            color: #a855f7;
        }
        
        .crm-stat-label {
            color: #c4b5fd;
            font-size: 0.9rem;
        }
        
        .crm-tabs {
            display: flex;
            gap: 0;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 12px 12px 0 0;
            overflow: hidden;
        }
        
        .crm-tab {
            padding: 1rem 1.5rem;
            background: none;
            border: none;
            color: #c4b5fd;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            border-bottom: 2px solid transparent;
        }
        
        .crm-tab:hover {
            background: rgba(255, 255, 255, 0.05);
        }
        
        .crm-tab.active {
            color: #fff;
            background: rgba(168, 85, 247, 0.2);
            border-bottom-color: #a855f7;
        }
        
        .crm-content {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 0 0 12px 12px;
            padding: 1.5rem;
            min-height: 400px;
        }
        
        .crm-tab-content {
            display: none;
        }
        
        .crm-tab-content.active {
            display: block;
        }
        
        .crm-search-bar {
            display: flex;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        
        .crm-search-bar input {
            flex: 1;
            padding: 0.75rem 1rem;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: #fff;
            font-size: 0.9rem;
        }
        
        .crm-search-bar select {
            padding: 0.75rem 1rem;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: #fff;
            font-size: 0.9rem;
        }
        
        .crm-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }
        
        .crm-list-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.05);
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .crm-list-item:hover {
            background: rgba(168, 85, 247, 0.1);
            border-color: rgba(168, 85, 247, 0.3);
        }
        
        .crm-list-avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
            color: #fff;
            font-weight: 600;
        }
        
        .crm-list-info {
            flex: 1;
        }
        
        .crm-list-name {
            font-weight: 600;
            color: #fff;
            margin-bottom: 0.25rem;
        }
        
        .crm-list-meta {
            font-size: 0.85rem;
            color: #c4b5fd;
        }
        
        .crm-list-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        
        .crm-badge-client { background: #22c55e; color: #fff; }
        .crm-badge-team { background: #3b82f6; color: #fff; }
        .crm-badge-vendor { background: #f59e0b; color: #fff; }
        .crm-badge-partner { background: #8b5cf6; color: #fff; }
        
        /* Modal */
        .crm-modal {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 200000;
            padding: 2rem;
        }
        
        .crm-modal-content {
            background: linear-gradient(135deg, #1e1b4b 0%, #581c87 100%);
            border-radius: 16px;
            max-width: 600px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .crm-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .crm-modal-header h3 {
            color: #fff;
            font-size: 1.25rem;
        }
        
        .crm-modal-close {
            background: none;
            border: none;
            color: #c4b5fd;
            font-size: 1.5rem;
            cursor: pointer;
        }
        
        .crm-modal-body {
            padding: 1.5rem;
        }
        
        .crm-form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }
        
        .crm-form-group {
            margin-bottom: 1rem;
        }
        
        .crm-form-group label {
            display: block;
            color: #e9d5ff;
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
        }
        
        .crm-form-group input,
        .crm-form-group select,
        .crm-form-group textarea {
            width: 100%;
            padding: 0.75rem;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: #fff;
            font-size: 0.9rem;
        }
        
        .crm-modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            padding: 1.5rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        /* Pipeline */
        .crm-pipeline {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 1rem;
            overflow-x: auto;
        }
        
        .crm-pipeline-stage {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            padding: 1rem;
            min-width: 200px;
        }
        
        .crm-pipeline-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .crm-pipeline-title {
            font-weight: 600;
            color: #fff;
            font-size: 0.9rem;
        }
        
        .crm-pipeline-value {
            font-size: 0.8rem;
            color: #22c55e;
        }
        
        /* Activity Feed */
        .crm-activity-feed {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        .crm-activity-item {
            display: flex;
            gap: 1rem;
            padding: 1rem;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
        }
        
        .crm-activity-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(168, 85, 247, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .crm-activity-content {
            flex: 1;
        }
        
        .crm-activity-text {
            color: #fff;
            margin-bottom: 0.25rem;
        }
        
        .crm-activity-time {
            font-size: 0.8rem;
            color: #6b7280;
        }
        
        /* List Items */
        .crm-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }
        
        .crm-list-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem 1.25rem;
            background: rgba(0, 0, 0, 0.25);
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.2s ease;
        }
        
        .crm-list-item:hover {
            background: rgba(0, 0, 0, 0.35);
            border-color: rgba(168, 85, 247, 0.3);
        }
        
        .crm-list-avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1.1rem;
            color: #fff;
            flex-shrink: 0;
        }
        
        .crm-company-avatar, .crm-project-avatar {
            font-size: 1.4rem;
            background: rgba(168, 85, 247, 0.2);
        }
        
        .crm-list-info {
            flex: 1;
            min-width: 0;
        }
        
        .crm-list-info h4 {
            margin: 0 0 0.25rem 0;
            font-size: 1rem;
            font-weight: 600;
            color: #fff;
        }
        
        .crm-list-info p {
            margin: 0;
            font-size: 0.85rem;
            color: #a1a1aa;
        }
        
        .crm-list-info a {
            color: #a855f7;
            text-decoration: none;
        }
        
        .crm-list-info a:hover {
            text-decoration: underline;
        }
        
        .crm-list-meta {
            display: flex;
            gap: 0.5rem;
            align-items: center;
            flex-shrink: 0;
        }
        
        .crm-list-actions {
            display: flex;
            gap: 0.5rem;
            flex-shrink: 0;
        }
        
        .crm-btn-small {
            width: 36px;
            height: 36px;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.15);
            background: rgba(255, 255, 255, 0.05);
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .crm-btn-small:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(168, 85, 247, 0.5);
        }
        
        .crm-btn-danger:hover {
            background: rgba(239, 68, 68, 0.2);
            border-color: rgba(239, 68, 68, 0.5);
        }
        
        .crm-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 999px;
            font-size: 0.75rem;
            font-weight: 500;
            text-transform: capitalize;
            background: rgba(168, 85, 247, 0.2);
            color: #e9d5ff;
        }
        
        .crm-badge-info {
            background: rgba(59, 130, 246, 0.2);
            color: #93c5fd;
        }
        
        .crm-status-planning { background: rgba(234, 179, 8, 0.2); color: #fde047; }
        .crm-status-active { background: rgba(34, 197, 94, 0.2); color: #86efac; }
        .crm-status-review { background: rgba(59, 130, 246, 0.2); color: #93c5fd; }
        .crm-status-completed { background: rgba(156, 163, 175, 0.2); color: #d1d5db; }
        .crm-status-on_hold { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
        
        .crm-deadline {
            font-size: 0.8rem;
            color: #9ca3af;
        }
        
        .crm-empty {
            text-align: center;
            padding: 3rem;
            color: #6b7280;
            font-style: italic;
        }
        
        /* ============================================
           CLICKABLE LIST ITEMS & COMPANY DETAIL VIEW
           ============================================ */
        .crm-clickable {
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .crm-clickable:hover {
            background: rgba(168, 85, 247, 0.15);
            border-color: rgba(168, 85, 247, 0.3);
        }
        
        .crm-type-badge {
            font-size: 0.7rem;
            padding: 0.15rem 0.4rem;
            border-radius: 3px;
            text-transform: uppercase;
            font-weight: 600;
        }
        
        .crm-type-client { background: rgba(52, 211, 153, 0.2); color: #34d399; }
        .crm-type-agency { background: rgba(96, 165, 250, 0.2); color: #60a5fa; }
        .crm-type-vendor { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
        .crm-type-partner { background: rgba(244, 114, 182, 0.2); color: #f472b6; }
        
        .crm-description {
            font-size: 0.8rem;
            color: #9ca3af;
            margin-top: 0.25rem;
        }
        
        .crm-badge-project { background: rgba(59, 130, 246, 0.2); color: #93c5fd; }
        .crm-badge-analysis { background: rgba(168, 85, 247, 0.2); color: #c4b5fd; }
        
        .crm-btn-view {
            background: rgba(59, 130, 246, 0.2) !important;
            color: #93c5fd !important;
        }
        
        /* Company Detail Modal */
        .crm-detail-modal .crm-modal-content {
            max-width: 900px;
            width: 90vw;
        }
        
        .crm-detail-content {
            max-height: 80vh;
        }
        
        .crm-detail-body {
            display: grid;
            grid-template-columns: 280px 1fr;
            gap: 2rem;
            padding: 1.5rem;
            max-height: 60vh;
            overflow-y: auto;
        }
        
        .crm-detail-sidebar {
            border-right: 1px solid rgba(255, 255, 255, 0.1);
            padding-right: 1.5rem;
        }
        
        .crm-detail-avatar {
            font-size: 4rem;
            text-align: center;
            margin-bottom: 1rem;
        }
        
        .crm-detail-avatar img {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
        }
        
        .crm-detail-info p {
            margin: 0.5rem 0;
            font-size: 0.9rem;
            color: #c4b5fd;
        }
        
        .crm-detail-info a {
            color: #a78bfa;
        }
        
        .crm-detail-description {
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .crm-detail-description h4 {
            margin: 0 0 0.5rem 0;
            color: #fff;
            font-size: 0.9rem;
        }
        
        .crm-detail-description p {
            font-size: 0.85rem;
            color: #9ca3af;
        }
        
        .crm-detail-actions {
            margin-top: 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        
        .crm-detail-section {
            margin-bottom: 1.5rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .crm-detail-section:last-child {
            border-bottom: none;
        }
        
        .crm-detail-section h4 {
            margin: 0 0 1rem 0;
            color: #fff;
            font-size: 1rem;
        }
        
        .crm-asset-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 0.75rem;
        }
        
        .crm-asset-card {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            padding: 0.5rem;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .crm-asset-card:hover {
            background: rgba(168, 85, 247, 0.2);
        }
        
        .crm-asset-card img {
            width: 100%;
            height: 60px;
            object-fit: cover;
            border-radius: 4px;
        }
        
        .crm-asset-placeholder {
            width: 100%;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 4px;
            font-size: 1.5rem;
        }
        
        .crm-asset-name {
            display: block;
            font-size: 0.7rem;
            color: #9ca3af;
            margin-top: 0.25rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .crm-project-list,
        .crm-analysis-list,
        .crm-contact-list {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        
        .crm-project-item,
        .crm-analysis-item,
        .crm-contact-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0.75rem;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 6px;
        }
        
        .crm-project-name,
        .crm-analysis-asset,
        .crm-contact-name {
            font-weight: 500;
            color: #fff;
        }
        
        .crm-analysis-date,
        .crm-contact-email {
            font-size: 0.8rem;
            color: #9ca3af;
        }
        
        .crm-analysis-scores {
            display: flex;
            gap: 0.5rem;
        }
        
        .crm-score {
            font-size: 0.75rem;
            padding: 0.15rem 0.4rem;
            background: rgba(168, 85, 247, 0.2);
            border-radius: 3px;
            color: #c4b5fd;
        }
        
        /* AI Button */
        .crm-btn-ai {
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
            border: none;
            border-radius: 8px;
            color: #fff;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .crm-btn-ai:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
        }
        
        /* AI Loading State */
        .crm-ai-loading {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%);
            border-radius: 12px;
            padding: 2rem;
            text-align: center;
            margin-bottom: 1.5rem;
            border: 1px solid rgba(139, 92, 246, 0.3);
        }
        
        .crm-ai-loading-content h4 {
            color: #fff;
            margin: 0.5rem 0;
        }
        
        .crm-ai-loading-content p {
            color: #c4b5fd;
            font-size: 0.9rem;
        }
        
        .crm-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255, 255, 255, 0.2);
            border-top-color: #a855f7;
            border-radius: 50%;
            animation: crm-spin 1s linear infinite;
            margin: 0 auto 1rem;
        }
        
        @keyframes crm-spin {
            to { transform: rotate(360deg); }
        }
        
        /* AI Results */
        .crm-ai-results {
            background: linear-gradient(135deg, rgba(30, 27, 75, 0.8) 0%, rgba(88, 28, 135, 0.6) 100%);
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border: 1px solid rgba(168, 85, 247, 0.3);
        }
        
        .crm-ai-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
            flex-wrap: wrap;
        }
        
        .crm-ai-header h4 {
            margin: 0;
            color: #fff;
            font-size: 1.1rem;
        }
        
        .crm-ai-score {
            background: linear-gradient(135deg, #22c55e, #16a34a);
            color: #fff;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-weight: 600;
            font-size: 0.85rem;
        }
        
        .crm-ai-confidence {
            background: rgba(0, 0, 0, 0.3);
            color: #c4b5fd;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.8rem;
        }
        
        .crm-ai-summary {
            background: rgba(0, 0, 0, 0.2);
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
        }
        
        .crm-ai-summary p {
            color: #e9d5ff;
            margin: 0;
            line-height: 1.5;
        }
        
        .crm-ai-section {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 12px;
            padding: 1rem 1.5rem;
            margin-bottom: 1rem;
        }
        
        .crm-ai-section h5 {
            color: #fff;
            margin: 0 0 1rem 0;
            font-size: 1rem;
        }
        
        .crm-ai-section h6 {
            color: #c4b5fd;
            margin: 0 0 0.5rem 0;
            font-size: 0.875rem;
        }
        
        .crm-ai-columns {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 1rem;
        }
        
        .crm-ai-column ul {
            margin: 0;
            padding-left: 1.2rem;
            color: #d1d5db;
        }
        
        .crm-ai-column li {
            margin-bottom: 0.35rem;
            font-size: 0.875rem;
        }
        
        .crm-ai-recommendations ol {
            margin: 0;
            padding-left: 1.5rem;
            color: #d1d5db;
        }
        
        .crm-ai-recommendations li {
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
        }
        
        .crm-ai-media-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1rem;
        }
        
        .crm-ai-media-card {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 10px;
            padding: 1rem;
        }
        
        .crm-ai-media-card h6 {
            color: #fff;
            margin: 0 0 0.75rem 0;
        }
        
        .crm-ai-media-card p {
            color: #9ca3af;
            font-size: 0.8rem;
            margin: 0.25rem 0;
        }
        
        .crm-ai-media-card strong {
            color: #c4b5fd;
        }
        
        .crm-ai-media-card ul {
            margin: 0.5rem 0 0 0;
            padding-left: 1rem;
            color: #d1d5db;
            font-size: 0.8rem;
        }
        
        .crm-ai-kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
        }
        
        .crm-ai-kpi {
            background: rgba(0, 0, 0, 0.3);
            padding: 1rem;
            border-radius: 8px;
            text-align: center;
        }
        
        .crm-ai-kpi-label {
            display: block;
            color: #9ca3af;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.25rem;
        }
        
        .crm-ai-kpi-metric {
            display: block;
            color: #a855f7;
            font-size: 0.9rem;
            font-weight: 600;
        }
        
        .crm-ai-kpi-target {
            display: block;
            color: #fff;
            font-size: 1.1rem;
            font-weight: 700;
            margin-top: 0.25rem;
        }
        
        .crm-ai-timestamp {
            text-align: right;
            margin-top: 1rem;
            color: #6b7280;
        }
        
        /* Clickable company items */
        .crm-clickable {
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .crm-clickable:hover {
            background: rgba(168, 85, 247, 0.1);
            border-color: rgba(168, 85, 247, 0.3);
        }
        
        .crm-btn-view {
            background: rgba(59, 130, 246, 0.2);
        }
        
        .crm-btn-view:hover {
            background: rgba(59, 130, 246, 0.4);
        }
        
        @media (max-width: 768px) {
            .crm-form-row {
                grid-template-columns: 1fr;
            }
            .crm-pipeline {
                grid-template-columns: repeat(2, 1fr);
            }
            .crm-detail-body {
                grid-template-columns: 1fr;
            }
            .crm-detail-sidebar {
                border-right: none;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                padding-right: 0;
                padding-bottom: 1.5rem;
            }
        }
    `;

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = crmStyles;
    document.head.appendChild(styleSheet);

    // ============================================
    // EXPORT
    // ============================================
    window.InternalCRM = InternalCRM;
    window.cavCRM = new InternalCRM();
    window.cavCRM.createDashboard = createCRMDashboard;
    window.cavCRM.createContactForm = createContactForm;
    window.cavCRM.createCompanyForm = createCompanyForm;
    window.cavCRM.createProjectForm = createProjectForm;
    window.cavCRM.attachEventHandlers = attachCRMEventHandlers;
    window.cavCRM.showModal = showCRMModal;
    window.cavCRM.refreshList = refreshCRMList;
    window.cavCRM.showCompanyDetail = showCompanyDetail;
    window.cavCRM.getCompanyAssets = getCompanyAssets;

    console.log('Internal CRM Module loaded - Version 5.11.1 (January 17, 2026)');
    console.log('   ✅ Full sync with MySQL backend, Briefs with document upload, AI analysis');

})();

