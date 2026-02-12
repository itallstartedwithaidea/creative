/**
 * AI Library Manager - Session-Based Asset Organization
 * =====================================================
 * Version 1.0.0
 * 
 * Features:
 * - AI Master Library with session-based folders
 * - Automatic pairing of AI-generated images and videos
 * - Smart CRM integration with auto-filing
 * - Claude + ChatGPT cross-analysis for company/project matching
 * - Web search validation for company names
 * - Persistent storage in IndexedDB
 */

(function() {
    'use strict';

    // ============================================
    // CONSTANTS
    // ============================================
    const AI_LIBRARY_VERSION = '1.0.0';
    const SESSION_STORAGE_KEY = 'cav_ai_current_session';
    const LIBRARY_INDEX_KEY = 'cav_ai_library_index';

    // ============================================
    // AI SESSION CLASS
    // ============================================
    class AISession {
        constructor(id = null) {
            this.id = id || this.generateSessionId();
            this.createdAt = new Date().toISOString();
            this.name = `Session ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
            this.images = [];
            this.videos = [];
            this.pairs = []; // { imageId, videoId, prompt, createdAt }
            this.metadata = {
                totalImages: 0,
                totalVideos: 0,
                prompts: [],
                detectedCompany: null,
                detectedProject: null,
                crmFolderId: null,
                tags: [],
                analysisResults: null
            };
        }

        generateSessionId() {
            const timestamp = Date.now().toString(36);
            const random = Math.random().toString(36).substring(2, 10);
            return `sess_${timestamp}_${random}`;
        }

        addImage(imageData) {
            const imageEntry = {
                id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
                type: 'image',
                data: imageData.base64 || imageData.url,
                thumbnail: imageData.thumbnail || imageData.base64,
                prompt: imageData.prompt || '',
                model: imageData.model || 'gemini',
                width: imageData.width || null,
                height: imageData.height || null,
                format: imageData.format || 'png',
                createdAt: new Date().toISOString(),
                metadata: imageData.metadata || {}
            };
            this.images.push(imageEntry);
            this.metadata.totalImages++;
            if (imageData.prompt) {
                this.metadata.prompts.push(imageData.prompt);
            }
            return imageEntry;
        }

        addVideo(videoData, pairedImageId = null) {
            const videoEntry = {
                id: `vid_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
                type: 'video',
                data: videoData.base64 || videoData.url,
                thumbnail: videoData.thumbnail,
                prompt: videoData.prompt || '',
                model: videoData.model || 'veo',
                duration: videoData.duration || null,
                width: videoData.width || null,
                height: videoData.height || null,
                format: videoData.format || 'mp4',
                createdAt: new Date().toISOString(),
                pairedImageId: pairedImageId,
                metadata: videoData.metadata || {}
            };
            this.videos.push(videoEntry);
            this.metadata.totalVideos++;

            // Auto-pair with image if specified
            if (pairedImageId) {
                this.pairs.push({
                    imageId: pairedImageId,
                    videoId: videoEntry.id,
                    prompt: videoData.prompt,
                    createdAt: new Date().toISOString()
                });
            } else if (this.images.length > 0) {
                // Auto-pair with most recent image if prompt matches
                const matchingImage = this.images.find(img => 
                    img.prompt && videoData.prompt && 
                    this.promptSimilarity(img.prompt, videoData.prompt) > 0.7
                );
                if (matchingImage) {
                    this.pairs.push({
                        imageId: matchingImage.id,
                        videoId: videoEntry.id,
                        prompt: videoData.prompt,
                        similarity: this.promptSimilarity(matchingImage.prompt, videoData.prompt),
                        createdAt: new Date().toISOString()
                    });
                    videoEntry.pairedImageId = matchingImage.id;
                }
            }

            return videoEntry;
        }

        promptSimilarity(prompt1, prompt2) {
            const words1 = new Set(prompt1.toLowerCase().split(/\s+/));
            const words2 = new Set(prompt2.toLowerCase().split(/\s+/));
            const intersection = new Set([...words1].filter(x => words2.has(x)));
            const union = new Set([...words1, ...words2]);
            return intersection.size / union.size;
        }

        toJSON() {
            return {
                id: this.id,
                name: this.name,
                createdAt: this.createdAt,
                images: this.images,
                videos: this.videos,
                pairs: this.pairs,
                metadata: this.metadata
            };
        }

        static fromJSON(json) {
            const session = new AISession(json.id);
            session.name = json.name;
            session.createdAt = json.createdAt;
            session.images = json.images || [];
            session.videos = json.videos || [];
            session.pairs = json.pairs || [];
            session.metadata = json.metadata || {};
            return session;
        }
    }

    // ============================================
    // AI LIBRARY MANAGER CLASS
    // ============================================
    class AILibraryManager {
        constructor() {
            this.currentSession = null;
            this.libraryIndex = {};
            this.db = null;
            this.dbReady = this.initDatabase();
            this.analysisCache = new Map();
            
            // Load current session if exists
            this.loadCurrentSession();
            
            console.log('[AI Library] Manager initialized');
        }

        // ----------------------------------------
        // DATABASE INITIALIZATION
        // ----------------------------------------
        async initDatabase() {
            return new Promise((resolve) => {
                // Wait for security module's IndexedDB
                const checkDb = setInterval(() => {
                    if (window.CAVSecurity?.SecureDataPersistence?.db) {
                        this.db = window.CAVSecurity.SecureDataPersistence.db;
                        clearInterval(checkDb);
                        console.log('[AI Library] Connected to IndexedDB');
                        this.loadLibraryIndex();
                        resolve(true);
                    }
                }, 100);

                // Timeout after 5 seconds
                setTimeout(() => {
                    clearInterval(checkDb);
                    if (!this.db) {
                        console.warn('[AI Library] IndexedDB not available, using localStorage');
                    }
                    resolve(false);
                }, 5000);
            });
        }

        // ----------------------------------------
        // SESSION MANAGEMENT
        // ----------------------------------------
        startNewSession(name = null) {
            // Save current session before starting new one
            if (this.currentSession && (this.currentSession.images.length > 0 || this.currentSession.videos.length > 0)) {
                this.saveSession(this.currentSession);
            }

            this.currentSession = new AISession();
            if (name) {
                this.currentSession.name = name;
            }
            this.saveCurrentSession();
            console.log('[AI Library] New session started:', this.currentSession.id);
            return this.currentSession;
        }

        getCurrentSession() {
            if (!this.currentSession) {
                this.currentSession = new AISession();
                this.saveCurrentSession();
            }
            return this.currentSession;
        }

        loadCurrentSession() {
            try {
                const stored = localStorage.getItem(SESSION_STORAGE_KEY);
                if (stored) {
                    const json = JSON.parse(stored);
                    this.currentSession = AISession.fromJSON(json);
                    console.log('[AI Library] Current session loaded:', this.currentSession.id);
                }
            } catch (e) {
                console.error('[AI Library] Failed to load current session:', e);
            }
        }

        saveCurrentSession() {
            try {
                if (this.currentSession) {
                    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.currentSession.toJSON()));
                }
            } catch (e) {
                console.error('[AI Library] Failed to save current session:', e);
            }
        }

        // ----------------------------------------
        // ASSET ADDITION
        // ----------------------------------------
        addGeneratedImage(imageData) {
            const session = this.getCurrentSession();
            const entry = session.addImage(imageData);
            this.saveCurrentSession();
            
            // Trigger async analysis
            this.analyzeAssetForCRM(entry, 'image');
            
            return entry;
        }

        addGeneratedVideo(videoData, pairedImageId = null) {
            const session = this.getCurrentSession();
            const entry = session.addVideo(videoData, pairedImageId);
            this.saveCurrentSession();
            
            // Trigger async analysis
            this.analyzeAssetForCRM(entry, 'video');
            
            return entry;
        }

        // ----------------------------------------
        // LIBRARY STORAGE
        // ----------------------------------------
        async saveSession(session) {
            const sessionData = session.toJSON();
            
            // Update library index
            this.libraryIndex[session.id] = {
                id: session.id,
                name: session.name,
                createdAt: session.createdAt,
                imageCount: session.images.length,
                videoCount: session.videos.length,
                pairCount: session.pairs.length,
                detectedCompany: session.metadata.detectedCompany,
                detectedProject: session.metadata.detectedProject,
                crmFolderId: session.metadata.crmFolderId
            };

            // Save to IndexedDB if available
            if (this.db) {
                try {
                    const tx = this.db.transaction('assets', 'readwrite');
                    const store = tx.objectStore('assets');
                    
                    store.put({
                        id: `ai_session_${session.id}`,
                        type: 'ai_session',
                        user_key: this.getUserKey(),
                        session_id: session.id,
                        data: sessionData,
                        created_at: session.createdAt,
                        updated_at: new Date().toISOString()
                    });

                    console.log('[AI Library] Session saved to IndexedDB:', session.id);
                } catch (e) {
                    console.error('[AI Library] Failed to save session to IndexedDB:', e);
                }
            }

            // Also save to localStorage as backup
            try {
                const allSessions = JSON.parse(localStorage.getItem('cav_ai_sessions') || '{}');
                allSessions[session.id] = sessionData;
                localStorage.setItem('cav_ai_sessions', JSON.stringify(allSessions));
            } catch (e) {
                console.warn('[AI Library] Failed to save session to localStorage:', e);
            }

            this.saveLibraryIndex();
        }

        async loadSession(sessionId) {
            // Try IndexedDB first
            if (this.db) {
                try {
                    const tx = this.db.transaction('assets', 'readonly');
                    const store = tx.objectStore('assets');
                    const request = store.get(`ai_session_${sessionId}`);
                    
                    return new Promise((resolve) => {
                        request.onsuccess = () => {
                            if (request.result?.data) {
                                resolve(AISession.fromJSON(request.result.data));
                            } else {
                                resolve(null);
                            }
                        };
                        request.onerror = () => resolve(null);
                    });
                } catch (e) {
                    console.error('[AI Library] Failed to load session from IndexedDB:', e);
                }
            }

            // Fallback to localStorage
            try {
                const allSessions = JSON.parse(localStorage.getItem('cav_ai_sessions') || '{}');
                if (allSessions[sessionId]) {
                    return AISession.fromJSON(allSessions[sessionId]);
                }
            } catch (e) {
                console.error('[AI Library] Failed to load session from localStorage:', e);
            }

            return null;
        }

        loadLibraryIndex() {
            try {
                const stored = localStorage.getItem(LIBRARY_INDEX_KEY);
                if (stored) {
                    this.libraryIndex = JSON.parse(stored);
                }
            } catch (e) {
                console.error('[AI Library] Failed to load library index:', e);
            }
        }

        saveLibraryIndex() {
            try {
                localStorage.setItem(LIBRARY_INDEX_KEY, JSON.stringify(this.libraryIndex));
            } catch (e) {
                console.error('[AI Library] Failed to save library index:', e);
            }
        }

        getAllSessions() {
            return Object.values(this.libraryIndex).sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            );
        }

        getUserKey() {
            const session = window.cavUserSession || 
                window.CAVSecurity?.SecureSessionManager?.getSession?.();
            if (session?.email) {
                return `user_${session.email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
            }
            return 'user_anonymous';
        }

        // ----------------------------------------
        // CRM INTEGRATION & AI ANALYSIS
        // ----------------------------------------
        async analyzeAssetForCRM(asset, type) {
            if (!asset.prompt) return null;

            const cacheKey = `${asset.prompt.substring(0, 50)}`;
            if (this.analysisCache.has(cacheKey)) {
                const cached = this.analysisCache.get(cacheKey);
                await this.applyAnalysisToSession(cached);
                await this.fileInCRM(cached, asset.id);
                return cached;
            }

            console.log('[AI Library] Analyzing asset for CRM:', type, asset.id);

            try {
                // Try cross-analysis with available AI models
                const analysis = await this.crossAnalyzeWithAI(asset.prompt, type);
                
                if (analysis) {
                    this.analysisCache.set(cacheKey, analysis);
                    await this.applyAnalysisToSession(analysis);
                    await this.fileInCRM(analysis, asset.id);
                }

                return analysis;
            } catch (e) {
                console.error('[AI Library] Analysis failed:', e);
                return null;
            }
        }

        async crossAnalyzeWithAI(prompt, assetType) {
            const analysisPrompt = `Analyze this creative asset prompt and extract:
1. Company/Brand name (if mentioned or implied)
2. Project/Campaign name (if identifiable)
3. Industry/Vertical
4. Target audience
5. Key themes and tags

Prompt: "${prompt}"
Asset type: ${assetType}

Respond in JSON format:
{
    "company": { "name": "", "confidence": 0.0, "website": "" },
    "project": { "name": "", "type": "", "confidence": 0.0 },
    "industry": "",
    "targetAudience": "",
    "tags": [],
    "suggestedFolderName": ""
}`;

            let result = null;
            
            // Helper to get API key from settings or legacy storage
            const getKey = (provider) => {
                // Try settings manager first
                if (window.cavSettings?.getAPIKey) {
                    const key = window.cavSettings.getAPIKey(provider);
                    if (key && key.length >= 10) return key;
                }
                // Try CAVSettings
                if (window.CAVSettings?.getAPIKey) {
                    const key = window.CAVSettings.getAPIKey(provider);
                    if (key && key.length >= 10) return key;
                }
                // Try localStorage fallbacks
                if (provider === 'gemini') {
                    return localStorage.getItem('cav_gemini_api_key') || 
                           localStorage.getItem('cav_ai_api_key') || '';
                }
                return '';
            };

            // Try OpenAI first (GPT-5.2 / GPT-4o for best analysis)
            const openaiKey = getKey('openai');
            if (!result && openaiKey) {
                try {
                    console.log('[AI Library] Analyzing with OpenAI (GPT-4o)...');
                    const response = await this.callOpenAIAnalysis(analysisPrompt, openaiKey);
                    if (response) {
                        result = this.parseJSONResponse(response);
                        if (result) result.analyzedBy = 'openai-gpt4o';
                    }
                } catch (e) {
                    console.warn('[AI Library] OpenAI analysis failed:', e);
                }
            }

            // Try Claude as fallback (Claude 4.5 for deep analysis)
            const claudeKey = getKey('claude');
            if (!result && claudeKey) {
                try {
                    console.log('[AI Library] Analyzing with Claude...');
                    const response = await this.callClaudeAnalysis(analysisPrompt, claudeKey);
                    if (response) {
                        result = this.parseJSONResponse(response);
                        if (result) result.analyzedBy = 'claude';
                    }
                } catch (e) {
                    console.warn('[AI Library] Claude analysis failed:', e);
                }
            }

            // Try Gemini as fallback
            const geminiKey = getKey('gemini') || window.cavAIStudio?.apiKey;
            if (!result && geminiKey) {
                try {
                    console.log('[AI Library] Analyzing with Gemini...');
                    const response = await this.callGeminiAnalysis(analysisPrompt, geminiKey);
                    if (response) {
                        result = this.parseJSONResponse(response);
                        if (result) result.analyzedBy = 'gemini';
                    }
                } catch (e) {
                    console.warn('[AI Library] Gemini analysis failed:', e);
                }
            }

            // Validate company name with web search if detected
            if (result?.company?.name && result.company.confidence > 0.5) {
                const searchKey = getKey('searchapi');
                if (searchKey) {
                    console.log('[AI Library] Validating company with SearchAPI...');
                    const validated = await this.validateCompanyWithSearch(result.company.name, searchKey);
                    if (validated) {
                        result.company = { ...result.company, ...validated };
                        result.company.validated = true;
                    }
                }
            }
            
            if (result) {
                console.log('[AI Library] CRM Analysis complete:', result.analyzedBy, result.company?.name || 'no company detected');
            } else {
                console.warn('[AI Library] No AI analysis available - check API key configuration');
            }

            return result;
        }
        
        // Helper to safely parse JSON from AI responses
        parseJSONResponse(text) {
            if (!text) return null;
            try {
                return JSON.parse(text);
            } catch (e) {
                // Try to extract JSON from text
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        return JSON.parse(jsonMatch[0]);
                    } catch (e2) {}
                }
                return null;
            }
        }

        async callGeminiAnalysis(prompt, apiKey = null) {
            const key = apiKey || window.cavAIStudio?.apiKey;
            if (!key) return null;

            try {
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${key}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }],
                            generationConfig: { 
                                temperature: 0.2,
                                responseMimeType: 'application/json'
                            }
                        })
                    }
                );

                const data = await response.json();
                return data?.candidates?.[0]?.content?.parts?.[0]?.text;
            } catch (e) {
                console.error('[AI Library] Gemini call failed:', e);
                return null;
            }
        }

        async callOpenAIAnalysis(prompt, apiKey = null) {
            const key = apiKey || window.cavSettings?.getAPIKey?.('openai');
            if (!key) return null;

            try {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${key}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o',  // Use GPT-4o for best analysis
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.2,
                        response_format: { type: 'json_object' }
                    })
                });

                const data = await response.json();
                if (data.error) {
                    console.error('[AI Library] OpenAI error:', data.error.message);
                    return null;
                }
                return data?.choices?.[0]?.message?.content;
            } catch (e) {
                console.error('[AI Library] OpenAI call failed:', e);
                return null;
            }
        }

        async callClaudeAnalysis(prompt, apiKey = null) {
            const key = apiKey || window.cavSettings?.getAPIKey?.('claude');
            if (!key) return null;

            try {
                const response = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': key,
                        'anthropic-version': '2023-06-01'
                    },
                    body: JSON.stringify({
                        model: 'claude-sonnet-4-5-20250929',  // Use Claude 4.5 Sonnet
                        max_tokens: 1024,
                        messages: [{ role: 'user', content: prompt }]
                    })
                });

                const data = await response.json();
                if (data.error) {
                    console.error('[AI Library] Claude error:', data.error.message);
                    return null;
                }
                const content = data?.content?.[0]?.text || '';
                return content;
            } catch (e) {
                console.error('[AI Library] Claude call failed:', e);
                return null;
            }
        }

        async validateCompanyWithSearch(companyName, apiKey = null) {
            // Use SearchAPI if available
            const searchKey = apiKey || window.cavSettings?.getAPIKey?.('searchapi');
            if (!searchKey) return null;

            try {
                const response = await fetch(
                    `https://www.searchapi.io/api/v1/search?engine=google&q=${encodeURIComponent(companyName + ' company')}&api_key=${searchKey}`
                );
                
                const data = await response.json();
                
                if (data?.organic_results?.length > 0) {
                    const topResult = data.organic_results[0];
                    return {
                        validatedName: companyName,
                        website: topResult.link || '',
                        description: topResult.snippet || '',
                        searchConfidence: 0.9
                    };
                }
            } catch (e) {
                console.warn('[AI Library] Search validation failed:', e);
            }

            return null;
        }

        async applyAnalysisToSession(analysis) {
            if (!this.currentSession || !analysis) return;

            if (analysis.company?.name) {
                this.currentSession.metadata.detectedCompany = analysis.company;
            }
            if (analysis.project?.name) {
                this.currentSession.metadata.detectedProject = analysis.project;
            }
            if (analysis.tags?.length > 0) {
                this.currentSession.metadata.tags = [
                    ...new Set([...this.currentSession.metadata.tags, ...analysis.tags])
                ];
            }
            this.currentSession.metadata.analysisResults = analysis;
            
            this.saveCurrentSession();
        }

        async fileInCRM(analysis, assetId = null) {
            if (!analysis?.company?.name || !window.cavCRM) return;

            const crm = window.cavCRM;
            const companyName = analysis.company.name;
            const projectName = analysis.project?.name || `AI Generated - ${new Date().toLocaleDateString()}`;

            // Find or create company
            let company = null;
            const existingCompanies = Object.values(crm.companies || {});
            company = existingCompanies.find(c => 
                c.name.toLowerCase() === companyName.toLowerCase()
            );

            if (!company) {
                console.log('[AI Library] Creating new CRM company:', companyName);
                company = crm.createCompany({
                    name: companyName,
                    website: analysis.company.website || '',
                    industry: analysis.industry || '',
                    type: 'client',
                    description: `Auto-created from AI generation. ${analysis.company.description || ''}`,
                    tags: ['ai-generated', ...(analysis.tags || [])]
                });
            }

            // Find or create project
            let project = null;
            const existingProjects = Object.values(crm.projects || {});
            project = existingProjects.find(p => 
                p.name.toLowerCase() === projectName.toLowerCase() &&
                p.client === company.id
            );

            if (!project) {
                console.log('[AI Library] Creating new CRM project:', projectName);
                project = crm.createProject({
                    name: projectName,
                    client: company.id,
                    clientName: company.name,
                    type: analysis.project?.type || 'campaign',
                    status: 'active',
                    description: `AI-generated content. Analyzed by: ${analysis.analyzedBy || 'AI'}`,
                    tags: ['ai-generated', ...(analysis.tags || [])]
                });
            }

            // Link asset to project and company if we have an assetId
            if (assetId) {
                crm.linkAssetToProject(project.id, assetId);
                crm.linkAssetToCompany(company.id, assetId);
                console.log('[AI Library] Asset linked to CRM:', assetId);
            }

            // Also link all assets from current session
            if (this.currentSession) {
                // Link all images
                this.currentSession.images.forEach(img => {
                    crm.linkAssetToProject(project.id, img.id);
                    crm.linkAssetToCompany(company.id, img.id);
                });
                
                // Link all videos
                this.currentSession.videos.forEach(vid => {
                    crm.linkAssetToProject(project.id, vid.id);
                    crm.linkAssetToCompany(company.id, vid.id);
                });

                this.currentSession.metadata.crmFolderId = project.id;
                this.currentSession.metadata.crmCompanyId = company.id;
                this.saveCurrentSession();
            }

            console.log('[AI Library] Filed in CRM - Company:', company.name, 'Project:', project.name);
            return { company, project };
        }

        // ----------------------------------------
        // UPLOAD ANALYSIS (For regular uploads too)
        // ----------------------------------------
        async analyzeUploadForFiling(asset) {
            if (!asset) return null;

            console.log('[AI Library] Analyzing upload for CRM filing:', asset.filename);

            // Build analysis prompt from available metadata
            const analysisData = {
                filename: asset.filename,
                tags: asset.tags || {},
                campaign: asset.tags?.campaign || '',
                client: asset.tags?.client || '',
                project: asset.tags?.project || ''
            };

            // If we already have client/campaign info, use it directly
            if (analysisData.client || analysisData.campaign) {
                return this.fileUploadInCRM(asset, analysisData);
            }

            // Otherwise, try AI analysis of the filename and any available metadata
            try {
                const analysisPrompt = `Analyze this file and determine the appropriate company and project:

Filename: ${asset.filename}
${asset.tags?.campaign ? `Campaign: ${asset.tags.campaign}` : ''}
${asset.tags?.client ? `Client: ${asset.tags.client}` : ''}
${asset.tags?.project ? `Project: ${asset.tags.project}` : ''}

Extract:
1. Company/Brand name
2. Project/Campaign name
3. Suggested folder path

Respond in JSON:
{
    "company": { "name": "", "confidence": 0.0 },
    "project": { "name": "", "confidence": 0.0 },
    "folderPath": ""
}`;

                const analysis = await this.crossAnalyzeWithAI(analysisPrompt, 'upload');
                
                if (analysis) {
                    return this.fileUploadInCRM(asset, {
                        ...analysisData,
                        ...analysis
                    });
                }
            } catch (e) {
                console.error('[AI Library] Upload analysis failed:', e);
            }

            return null;
        }

        async fileUploadInCRM(asset, analysisData) {
            if (!window.cavCRM) return null;

            const crm = window.cavCRM;
            let companyName = analysisData.client || analysisData.company?.name;
            let projectName = analysisData.campaign || analysisData.project?.name || analysisData.project;

            if (!companyName) return null;

            // Find or create company
            let company = null;
            const existingCompanies = Object.values(crm.companies || {});
            company = existingCompanies.find(c => 
                c.name.toLowerCase() === companyName.toLowerCase()
            );

            if (!company) {
                console.log('[AI Library] Creating CRM company for upload:', companyName);
                company = crm.createCompany({
                    name: companyName,
                    type: 'client',
                    tags: ['from-upload']
                });
            }

            // Find or create project if we have a project/campaign name
            let project = null;
            if (projectName) {
                const existingProjects = Object.values(crm.projects || {});
                project = existingProjects.find(p => 
                    p.name.toLowerCase() === projectName.toLowerCase() &&
                    p.client === company.id
                );

                if (!project) {
                    console.log('[AI Library] Creating CRM project for upload:', projectName);
                    project = crm.createProject({
                        name: projectName,
                        client: company.id,
                        clientName: company.name,
                        type: 'campaign',
                        status: 'active',
                        tags: ['from-upload']
                    });
                }
            }

            // Link asset to company
            if (asset.id) {
                crm.linkAssetToCompany(company.id, asset.id);
                console.log('[AI Library] Asset linked to company:', company.name);
            }

            // Link asset to project
            if (project && asset.id) {
                crm.linkAssetToProject(project.id, asset.id);
                console.log('[AI Library] Asset linked to project:', project.name);
            }

            console.log('[AI Library] Upload filed - Company:', company.name, 
                project ? `Project: ${project.name}` : '(no project)');

            return { company, project };
        }

        // ----------------------------------------
        // UI RENDERING
        // ----------------------------------------
        renderLibraryView() {
            const sessions = this.getAllSessions();
            
            return `
                <div class="ai-library-container">
                    <div class="ai-library-header">
                        <h2>🎨 AI Master Library</h2>
                        <p>All AI-generated images and videos organized by session</p>
                        <button class="ai-library-new-session" onclick="window.cavAILibrary.startNewSession()">
                            + New Session
                        </button>
                    </div>
                    
                    <div class="ai-library-current">
                        <h3>📂 Current Session</h3>
                        ${this.renderSessionCard(this.currentSession?.toJSON())}
                    </div>
                    
                    <div class="ai-library-history">
                        <h3>📚 Session History (${sessions.length} sessions)</h3>
                        <div class="ai-library-grid">
                            ${sessions.map(s => this.renderSessionCard(s, true)).join('')}
                        </div>
                    </div>
                </div>
            `;
        }

        renderSessionCard(session, isHistorical = false) {
            if (!session) {
                return `
                    <div class="ai-session-card empty">
                        <p>No assets in current session yet.</p>
                        <p>Generate images or videos in AI Studio to start.</p>
                    </div>
                `;
            }

            const imageCount = session.imageCount ?? session.images?.length ?? 0;
            const videoCount = session.videoCount ?? session.videos?.length ?? 0;
            const pairCount = session.pairCount ?? session.pairs?.length ?? 0;

            return `
                <div class="ai-session-card ${isHistorical ? 'historical' : 'current'}" 
                     data-session-id="${session.id}">
                    <div class="ai-session-header">
                        <span class="ai-session-name">${session.name}</span>
                        <span class="ai-session-date">${new Date(session.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div class="ai-session-stats">
                        <span>🖼️ ${imageCount} images</span>
                        <span>🎬 ${videoCount} videos</span>
                        <span>🔗 ${pairCount} pairs</span>
                    </div>
                    ${session.detectedCompany ? `
                        <div class="ai-session-crm">
                            <span class="crm-badge">📁 ${session.detectedCompany.name || session.detectedCompany}</span>
                        </div>
                    ` : ''}
                    <div class="ai-session-actions">
                        <button onclick="window.cavAILibrary.viewSession('${session.id}')">View</button>
                        ${!isHistorical ? `
                            <button onclick="window.cavAILibrary.saveAndNewSession()">Save & New</button>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        async viewSession(sessionId) {
            const session = await this.loadSession(sessionId);
            if (session) {
                // Emit event for UI to handle
                window.dispatchEvent(new CustomEvent('ai-library-view-session', {
                    detail: { session }
                }));
            }
        }

        async saveAndNewSession() {
            if (this.currentSession) {
                await this.saveSession(this.currentSession);
            }
            this.startNewSession();
            window.dispatchEvent(new CustomEvent('ai-library-session-changed'));
        }
    }

    // ============================================
    // GLOBAL INSTANCE
    // ============================================
    window.cavAILibrary = new AILibraryManager();

    // Expose session class for external use
    window.AISession = AISession;

    console.log('[AI Library] Module loaded - Version', AI_LIBRARY_VERSION);

})();

