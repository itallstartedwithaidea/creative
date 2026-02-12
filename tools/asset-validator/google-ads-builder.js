/**
 * Google Ads AI Builder Module
 * ============================
 * Version 2.1.0 - January 17, 2026
 * 
 * AI-powered Google Ads creation with comprehensive best practices
 * Reference: https://support.google.com/google-ads/answer/13676244
 * 
 * Features:
 * - RSA: 15 headlines, 4 descriptions with proper CSV export
 * - Responsive Display Ads with full asset export
 * - Google Shopping/Merchant Center with ALL columns
 * - AI refinement of selected ad copy
 * - Industry & funnel stage optimization
 */

(function() {
    'use strict';

    const VERSION = '2.2.0';

    // ============================================
    // GOOGLE ADS SPECIFICATIONS
    // ============================================
    
    const SPECS = {
        RSA: {
            name: 'Responsive Search',
            desc: '15 headlines, 4 descriptions',
            headlines: { min: 3, max: 15, chars: 30, generate: 15 },
            descriptions: { min: 2, max: 4, chars: 90, generate: 4 },
            displayPath: { chars: 15, parts: 2 }
        },
        PMAX: {
            name: 'Performance Max',
            desc: 'Full asset groups',
            headlines: { min: 3, max: 15, chars: 30, generate: 15 },
            longHeadlines: { min: 1, max: 5, chars: 90, generate: 5 },
            descriptions: { min: 2, max: 5, chars: 90, generate: 5 },
            businessName: { chars: 25 }
        },
        DISPLAY: {
            name: 'Responsive Display',
            desc: 'Visual ads across web',
            headlines: { min: 1, max: 5, chars: 30, generate: 5 },
            longHeadline: { chars: 90, generate: 1 },
            descriptions: { min: 1, max: 5, chars: 90, generate: 5 }
        },
        DEMAND_GEN: {
            name: 'Demand Gen',
            desc: 'YouTube, Gmail, Discover',
            headlines: { min: 1, max: 5, chars: 40, generate: 5 },
            descriptions: { min: 1, max: 5, chars: 90, generate: 5 }
        },
        VIDEO: {
            name: 'Video Campaigns',
            desc: 'YouTube & video ads',
            headline: { chars: 30 },
            longHeadline: { chars: 90 },
            description: { chars: 90 },
            cta: { chars: 10 }
        },
        SHOPPING: {
            name: 'Google Shopping',
            desc: 'Merchant Center product feed'
        }
    };

    // Merchant Center columns (required + optional)
    const MERCHANT_COLUMNS = {
        required: ['id', 'title', 'description', 'link', 'image_link', 'availability', 'price', 'brand'],
        optional: ['gtin', 'mpn', 'condition', 'google_product_category', 'product_type', 'additional_image_link', 
                   'sale_price', 'sale_price_effective_date', 'availability_date', 'unit_pricing_measure', 
                   'unit_pricing_base_measure', 'installment', 'subscription_cost', 'identifier_exists',
                   'color', 'size', 'gender', 'age_group', 'material', 'pattern', 'item_group_id',
                   'shipping', 'shipping_weight', 'shipping_length', 'shipping_width', 'shipping_height',
                   'custom_label_0', 'custom_label_1', 'custom_label_2', 'custom_label_3', 'custom_label_4']
    };

    const INDUSTRIES = [
        { id: 'home_services', name: 'Home Services' },
        { id: 'ecommerce', name: 'E-commerce' },
        { id: 'saas', name: 'SaaS / Technology' },
        { id: 'professional', name: 'Professional Services' },
        { id: 'healthcare', name: 'Healthcare' },
        { id: 'education', name: 'Education' },
        { id: 'local', name: 'Local Business' },
        { id: 'finance', name: 'Finance' },
        { id: 'real_estate', name: 'Real Estate' }
    ];

    const FUNNEL_STAGES = [
        { id: 'awareness', name: 'Awareness (TOFU)' },
        { id: 'consideration', name: 'Consideration (MOFU)' },
        { id: 'conversion', name: 'Conversion (BOFU)' }
    ];

    const TONES = ['Professional', 'Friendly', 'Urgent', 'Playful', 'Authoritative', 'Empathetic'];

    // ============================================
    // BUILDER CLASS
    // ============================================

    class GoogleAdsAIBuilder {
        constructor() {
            this.currentType = null;
            this.results = null;
            this.campaigns = this.loadCampaigns();
            this.selectedItems = new Set();
        }

        loadCampaigns() {
            try {
                return JSON.parse(localStorage.getItem('gads_campaigns') || '[]');
            } catch { return []; }
        }

        saveCampaigns() {
            localStorage.setItem('gads_campaigns', JSON.stringify(this.campaigns));
            
            // Also save to unified storage for cross-device sync
            if (window.UnifiedStorage && this.campaigns.length > 0) {
                this.campaigns.forEach(campaign => {
                    window.UnifiedStorage.saveGoogleAdsBuild({
                        ...campaign,
                        id: campaign.id || `gads_${Date.now()}`
                    }).catch(e => console.warn('[GoogleAds] Unified storage save failed:', e));
                });
            }
        }

        // Selected AI model (user can choose)
        selectedModel = 'gemini-3-flash-preview';

        setModel(modelId) {
            this.selectedModel = modelId;
            console.log(`[GoogleAds] Model set to: ${modelId}`);
        }

        getModel() {
            return this.selectedModel || window.AIModelSelector?.selectedModel || 'gemini-3-flash-preview';
        }

        getAPIKey() {
            if (window.CAVSettings?.manager?.getAPIKey) {
                return window.CAVSettings.manager.getAPIKey('gemini') || 
                       window.CAVSettings.manager.getAPIKey('openai');
            }
            if (window.CAVSettings?.manager?.accessControl?.getAPIKey) {
                const r = window.CAVSettings.manager.accessControl.getAPIKey('gemini', window.CAVSettings.manager);
                return r?.key;
            }
            return null;
        }

        async generateAds(config) {
            const prompt = this.buildPrompt(config);
            
            // Use AIModelSelector if available for multi-model support
            if (window.AIModelSelector) {
                const modelId = this.getModel();
                console.log(`[GoogleAds] Using AIModelSelector with model: ${modelId}`);
                try {
                    const result = await window.AIModelSelector.callAI(prompt, { 
                        model: modelId,
                        temperature: 0.85,
                        maxTokens: 8192
                    });
                    return this.parseResponse(typeof result === 'string' ? result : JSON.stringify(result), config);
                } catch (error) {
                    console.error('[GoogleAds] AIModelSelector call failed:', error);
                    throw error;
                }
            }

            // Fallback to direct Gemini call
            const apiKey = this.getAPIKey();
            if (!apiKey) throw new Error('No AI API key configured. Go to Settings to add one.');
            
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.85, maxOutputTokens: 8192 }
                    })
                }
            );

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || 'AI API error');
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            
            return this.parseResponse(text, config);
        }

        buildPrompt(config) {
            const { adType, variations, industry, funnel, tone, audience, product, company, url, keywords, benefits, usp, offer } = config;
            const spec = SPECS[adType];
            
            let requirements = '';
            
            if (adType === 'RSA') {
                requirements = `
=== RESPONSIVE SEARCH ADS ===
Generate ${variations} complete ad variations.

FOR EACH VARIATION, GENERATE:
- EXACTLY 15 headlines (max 30 characters each)
- EXACTLY 4 descriptions (max 90 characters each)
- 2 display path parts (max 15 characters each)

HEADLINE TYPES TO INCLUDE:
1-3: Benefit-focused headlines
4-6: Feature-focused headlines  
7-8: Urgency/time-sensitive headlines
9-10: Social proof/credibility headlines
11-12: Question-based headlines
13: Problem-agitation headline
14: Solution-oriented headline
15: Offer/CTA-focused headline

CRITICAL RULES:
- Count characters EXACTLY - headlines over 30 chars will be REJECTED
- Each headline must be UNIQUE - no duplicates
- Mix short (15-20 chars) and longer (25-30 chars) headlines
- Front-load important keywords
- Use specific numbers: "Save 47%" not "Save Big"`;
            } else if (adType === 'PMAX') {
                requirements = `
=== PERFORMANCE MAX ===
Generate ${variations} complete asset groups.

FOR EACH VARIATION:
- 15 short headlines (max 30 chars)
- 5 long headlines (max 90 chars)
- 5 descriptions (max 90 chars)
- Business name suggestion (max 25 chars)`;
            } else if (adType === 'DISPLAY') {
                requirements = `
=== RESPONSIVE DISPLAY ADS ===
Generate ${variations} ad sets.

FOR EACH VARIATION:
- 5 short headlines (max 30 chars)
- 1 long headline (max 90 chars)
- 5 descriptions (max 90 chars)`;
            } else if (adType === 'DEMAND_GEN') {
                requirements = `
=== DEMAND GEN ===
Generate ${variations} ad sets.

FOR EACH VARIATION:
- 5 headlines (max 40 chars - note: higher limit!)
- 5 descriptions (max 90 chars)`;
            }

            return `You are an expert Google Ads copywriter. Generate high-converting ad assets following EXACT Google specifications.

${requirements}

=== BUSINESS CONTEXT ===
Company/Campaign: ${company || 'Not specified'}
Product/Service: ${product || 'Not specified'}
Key Benefits: ${benefits || 'Not specified'}
USP: ${usp || 'Not specified'}
Special Offer: ${offer || 'None'}
Website: ${url || 'Not specified'}
Industry: ${industry || 'General'}
Target Audience: ${audience || 'General audience'}
Funnel Stage: ${funnel || 'Consideration'}
Target Keywords: ${keywords || 'Not specified'}
Tone: ${tone || 'Professional'}

=== OUTPUT FORMAT ===
Return ONLY valid JSON (no markdown, no backticks):
{
  "variations": [
    {
      "id": 1,
      "headlines": ["h1", "h2", "h3", "h4", "h5", "h6", "h7", "h8", "h9", "h10", "h11", "h12", "h13", "h14", "h15"],
      "longHeadlines": ["long headline 1"],
      "descriptions": ["desc1", "desc2", "desc3", "desc4"],
      "displayPaths": ["path1", "path2"],
      "businessName": "Company Name",
      "ctas": ["Get Started", "Learn More"]
    }
  ],
  "adStrength": "Excellent",
  "tips": ["tip 1", "tip 2", "tip 3"]
}

IMPORTANT: Generate ALL ${adType === 'RSA' ? '15 headlines and 4 descriptions' : 'requested assets'} for each variation!`;
        }

        async refineWithAI(items, context, instruction) {
            const apiKey = this.getAPIKey();
            if (!apiKey) throw new Error('No AI API key');

            const prompt = `You are an expert Google Ads copywriter. Refine the following ad copy based on the instruction.

CURRENT ITEMS TO REFINE:
${items.map((item, i) => `${i + 1}. "${item.text}" (${item.type}, ${item.text.length} chars)`).join('\n')}

ADDITIONAL CONTEXT:
${context}

INSTRUCTION:
${instruction}

RULES:
- Maintain exact character limits (Headlines: 30 chars, Descriptions: 90 chars)
- Keep the same number of items
- Make each item unique
- Return ONLY the refined text, one per line, in order

Return as JSON array:
["refined item 1", "refined item 2", ...]`;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.7 }
                    })
                }
            );

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const match = text.match(/\[[\s\S]*\]/);
            return match ? JSON.parse(match[0]) : [];
        }

        async scrapeProduct(url) {
            const apiKey = this.getAPIKey();
            if (!apiKey) throw new Error('No AI API key');

            const prompt = `Analyze this product URL and extract ALL Google Merchant Center data fields.

URL: ${url}

Return JSON with ALL these fields (use null if not found):
{
  "id": "unique SKU",
  "title": "product title (max 150 chars)",
  "description": "detailed description (max 5000 chars)",
  "link": "${url}",
  "image_link": "main image URL",
  "additional_image_link": "additional image URL",
  "availability": "in_stock|out_of_stock|preorder|backorder",
  "availability_date": "ISO date if preorder",
  "price": "price with currency (e.g., 29.99 USD)",
  "sale_price": "sale price if applicable",
  "sale_price_effective_date": "date range if sale",
  "unit_pricing_measure": "e.g., 100ml",
  "unit_pricing_base_measure": "e.g., 100ml",
  "brand": "brand name",
  "gtin": "GTIN/UPC/EAN (12-14 digits)",
  "mpn": "manufacturer part number",
  "condition": "new|refurbished|used",
  "google_product_category": "Google category path or ID",
  "product_type": "your category path",
  "identifier_exists": "yes|no",
  "color": "color",
  "size": "size",
  "gender": "male|female|unisex",
  "age_group": "newborn|infant|toddler|kids|adult",
  "material": "material",
  "pattern": "pattern",
  "item_group_id": "for variants",
  "shipping_weight": "weight with unit",
  "shipping_length": "length",
  "shipping_width": "width", 
  "shipping_height": "height",
  "custom_label_0": "",
  "custom_label_1": "",
  "custom_label_2": "",
  "custom_label_3": "",
  "custom_label_4": ""
}`;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.3 }
                    })
                }
            );

            const data = await response.json();
            const txt = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const match = txt.match(/\{[\s\S]*\}/);
            return match ? JSON.parse(match[0]) : null;
        }

        parseResponse(text, config) {
            try {
                // Try to extract JSON
                let jsonStr = text;
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) jsonStr = jsonMatch[0];
                
                const parsed = JSON.parse(jsonStr);
                return parsed;
            } catch (e) {
                console.warn('[GoogleAds] Parse error:', e);
                return { raw: text, variations: [] };
            }
        }

        saveCampaign(campaign) {
            campaign.id = 'camp_' + Date.now();
            campaign.createdAt = new Date().toISOString();
            this.campaigns.unshift(campaign);
            this.saveCampaigns();
            return campaign;
        }

        // ============================================
        // CSV EXPORT METHODS
        // ============================================

        exportRSA(campaign) {
            // Google Ads Editor RSA format
            const headers = [
                'Campaign', 'Ad group', 'Ad type', 'Status', 'Final URL',
                'Headline 1', 'Headline 2', 'Headline 3', 'Headline 4', 'Headline 5',
                'Headline 6', 'Headline 7', 'Headline 8', 'Headline 9', 'Headline 10',
                'Headline 11', 'Headline 12', 'Headline 13', 'Headline 14', 'Headline 15',
                'Description 1', 'Description 2', 'Description 3', 'Description 4',
                'Path 1', 'Path 2'
            ];

            const rows = [headers];
            
            (campaign.variations || []).forEach((v, i) => {
                const row = [
                    campaign.name || 'Campaign',
                    `Ad Group ${i + 1}`,
                    'Responsive search ad',
                    'Enabled',
                    campaign.finalUrl || 'https://example.com'
                ];
                
                // Add 15 headlines
                for (let j = 0; j < 15; j++) {
                    row.push(v.headlines?.[j] || '');
                }
                
                // Add 4 descriptions
                for (let j = 0; j < 4; j++) {
                    row.push(v.descriptions?.[j] || '');
                }
                
                // Add paths
                row.push(v.displayPaths?.[0] || '');
                row.push(v.displayPaths?.[1] || '');
                
                rows.push(row);
            });

            return this.toCSV(rows);
        }

        exportDisplay(campaign) {
            // Google Ads Editor Responsive Display format
            const headers = [
                'Campaign', 'Ad group', 'Ad type', 'Status', 'Final URL',
                'Short headline 1', 'Short headline 2', 'Short headline 3', 'Short headline 4', 'Short headline 5',
                'Long headline',
                'Description 1', 'Description 2', 'Description 3', 'Description 4', 'Description 5',
                'Business name', 'Call to action text',
                'Marketing image', 'Square marketing image', 'Logo', 'Square logo'
            ];

            const rows = [headers];
            
            (campaign.variations || []).forEach((v, i) => {
                const row = [
                    campaign.name || 'Campaign',
                    `Ad Group ${i + 1}`,
                    'Responsive display ad',
                    'Enabled',
                    campaign.finalUrl || 'https://example.com'
                ];
                
                // 5 short headlines
                for (let j = 0; j < 5; j++) {
                    row.push(v.headlines?.[j] || '');
                }
                
                // Long headline
                row.push(v.longHeadlines?.[0] || v.longHeadline || '');
                
                // 5 descriptions
                for (let j = 0; j < 5; j++) {
                    row.push(v.descriptions?.[j] || '');
                }
                
                // Business name, CTA
                row.push(v.businessName || campaign.name || '');
                row.push(v.ctas?.[0] || 'Learn more');
                
                // Image placeholders
                row.push(''); // Marketing image
                row.push(''); // Square marketing image
                row.push(''); // Logo
                row.push(''); // Square logo
                
                rows.push(row);
            });

            return this.toCSV(rows);
        }

        exportShopping(products) {
            // Google Merchant Center format with ALL columns
            const allColumns = [...MERCHANT_COLUMNS.required, ...MERCHANT_COLUMNS.optional];
            const rows = [allColumns];
            
            (products || []).forEach(p => {
                const row = allColumns.map(col => {
                    const key = col.replace(/_([a-z])/g, (m, c) => c.toUpperCase()); // snake_case to camelCase
                    return p[col] || p[key] || '';
                });
                rows.push(row);
            });

            return this.toCSV(rows);
        }

        toCSV(rows) {
            return rows.map(row => 
                row.map(cell => {
                    const str = String(cell || '').replace(/"/g, '""');
                    return str.includes(',') || str.includes('"') || str.includes('\n') 
                        ? `"${str}"` 
                        : str;
                }).join(',')
            ).join('\n');
        }

        exportCSV(campaign) {
            if (campaign.adType === 'SHOPPING') {
                return this.exportShopping(campaign.products);
            } else if (campaign.adType === 'RSA') {
                return this.exportRSA(campaign);
            } else if (campaign.adType === 'DISPLAY') {
                return this.exportDisplay(campaign);
            } else {
                // Generic export
                return this.exportRSA(campaign);
            }
        }
    }

    // ============================================
    // UI CREATION
    // ============================================

    function createUI(builder) {
        const companies = window.cavCRM?.getAllCompanies?.() || [];
        const projects = window.cavCRM?.getAllProjects?.() || [];

        return `
<style>
.gads-builder { padding: 1.5rem; max-width: 1100px; margin: 0 auto; font-family: var(--cav-font, -apple-system, BlinkMacSystemFont, sans-serif); }
.gads-builder * { box-sizing: border-box; }
.gads-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
.gads-logo { width: 48px; height: 48px; flex-shrink: 0; color: #9ca3af; }
.gads-header h1 { margin: 0; font-size: 1.5rem; color: #fff; font-weight: 600; }
.gads-header p { margin: 0.25rem 0 0; font-size: 0.85rem; color: #9ca3af; }
.gads-section { background: rgba(0,0,0,0.25); border-radius: 12px; padding: 1.25rem; margin-bottom: 1.25rem; border: 1px solid rgba(255,255,255,0.08); }
.gads-section-title { display: flex; align-items: center; gap: 0.5rem; margin: 0 0 1rem; font-size: 1rem; color: #fff; font-weight: 600; }
.gads-section-title span { font-size: 1.1rem; }
.gads-types { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.75rem; }
.gads-type-card { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1rem; background: rgba(0,0,0,0.3); border: 2px solid rgba(255,255,255,0.1); border-radius: 10px; cursor: pointer; transition: all 0.2s; color: #fff; text-align: center; }
.gads-type-card:hover { border-color: rgba(66,133,244,0.5); background: rgba(66,133,244,0.1); }
.gads-type-card.active { border-color: #4285f4; background: rgba(66,133,244,0.15); box-shadow: 0 0 20px rgba(66,133,244,0.2); }
.gads-type-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: rgba(66,133,244,0.15); border-radius: 8px; }
.gads-type-icon svg { width: 20px; height: 20px; stroke: #4285f4; fill: none; stroke-width: 2; }
.gads-type-name { font-size: 0.85rem; font-weight: 500; }
.gads-type-desc { font-size: 0.7rem; color: #9ca3af; }
.gads-specs { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.75rem; padding: 1rem; background: rgba(66,133,244,0.08); border-radius: 8px; }
.gads-spec { text-align: center; }
.gads-spec-label { font-size: 0.7rem; color: #4285f4; text-transform: uppercase; font-weight: 600; margin-bottom: 0.25rem; }
.gads-spec-value { font-size: 0.85rem; color: #fff; }
.gads-form { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.gads-form.cols-4 { grid-template-columns: repeat(4, 1fr); }
.gads-field { display: flex; flex-direction: column; gap: 0.375rem; }
.gads-field.full { grid-column: span 2; }
.gads-field label { font-size: 0.8rem; color: #9ca3af; font-weight: 500; }
.gads-field input, .gads-field select, .gads-field textarea { padding: 0.625rem 0.75rem; background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #fff; font-size: 0.875rem; font-family: inherit; outline: none; transition: border-color 0.2s; }
.gads-field input:focus, .gads-field select:focus, .gads-field textarea:focus { border-color: #4285f4; }
.gads-field input::placeholder, .gads-field textarea::placeholder { color: rgba(255,255,255,0.4); }
.gads-field textarea { resize: vertical; min-height: 70px; }
.gads-field select { cursor: pointer; }
.gads-field select option { background: #1a1a2e; color: #fff; }
.gads-generate-wrap { text-align: center; padding: 0.5rem 0; }
.gads-generate-btn { display: inline-flex; align-items: center; gap: 0.75rem; padding: 0.875rem 2rem; background: linear-gradient(135deg, #4285f4 0%, #34a853 50%, #fbbc04 75%, #ea4335 100%); background-size: 300% 300%; animation: gads-gradient 5s ease infinite; border: none; border-radius: 10px; color: #fff; font-size: 1rem; font-weight: 600; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
@keyframes gads-gradient { 0%,100%{background-position:0 50%} 50%{background-position:100% 50%} }
.gads-generate-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(66,133,244,0.4); }
.gads-generate-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
.gads-generate-btn svg { width: 20px; height: 20px; stroke: currentColor; fill: none; stroke-width: 2; }
.gads-hint { margin-top: 0.5rem; font-size: 0.8rem; color: #9ca3af; }
.gads-spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: gads-spin 0.8s linear infinite; display: inline-block; }
@keyframes gads-spin { to { transform: rotate(360deg); } }
.gads-results { border-color: #4285f4; }
.gads-results-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem; }
.gads-results-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.gads-btn { padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 500; cursor: pointer; border: none; transition: all 0.2s; }
.gads-btn-primary { background: #4285f4; color: #fff; }
.gads-btn-primary:hover { background: #3367d6; }
.gads-btn-secondary { background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2); }
.gads-btn-secondary:hover { background: rgba(255,255,255,0.15); }
.gads-btn-success { background: #34a853; color: #fff; }
.gads-tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
.gads-tab { padding: 0.5rem 1rem; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #9ca3af; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; }
.gads-tab:hover { border-color: rgba(66,133,244,0.5); }
.gads-tab.active { background: rgba(66,133,244,0.2); border-color: #4285f4; color: #fff; }
.gads-tab-panel { display: none; }
.gads-tab-panel.active { display: block; }
.gads-group { margin-bottom: 1.25rem; }
.gads-group-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.gads-group h3 { display: flex; align-items: center; gap: 0.5rem; margin: 0; font-size: 0.9rem; color: #fff; }
.gads-group h3 .chars { font-size: 0.75rem; color: #9ca3af; font-weight: normal; }
.gads-select-actions { display: flex; gap: 0.5rem; }
.gads-select-actions button { padding: 0.25rem 0.5rem; font-size: 0.7rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); border-radius: 4px; color: #fff; cursor: pointer; }
.gads-select-actions button:hover { background: rgba(255,255,255,0.15); }
.gads-copy-list { display: flex; flex-direction: column; gap: 0.5rem; }
.gads-copy-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.625rem 0.75rem; background: rgba(0,0,0,0.3); border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); transition: border-color 0.2s; }
.gads-copy-item.selected { border-color: #4285f4; background: rgba(66,133,244,0.1); }
.gads-copy-check { width: 18px; height: 18px; cursor: pointer; accent-color: #4285f4; }
.gads-copy-num { width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; background: rgba(66,133,244,0.2); color: #4285f4; border-radius: 50%; font-size: 0.7rem; font-weight: 600; flex-shrink: 0; }
.gads-copy-text { flex: 1; color: #fff; font-size: 0.875rem; outline: none; padding: 0.25rem; border-radius: 4px; background: transparent; border: none; }
.gads-copy-text:focus { background: rgba(66,133,244,0.1); }
.gads-char-count { font-size: 0.7rem; color: #9ca3af; min-width: 45px; text-align: right; }
.gads-char-count.over { color: #ea4335; font-weight: 600; }
.gads-copy-btn { background: none; border: none; cursor: pointer; font-size: 0.9rem; opacity: 0.6; transition: opacity 0.2s; padding: 0.25rem; }
.gads-copy-btn:hover { opacity: 1; }
.gads-ctas { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.gads-cta { padding: 0.375rem 0.75rem; background: rgba(52,168,83,0.2); color: #34a853; border-radius: 16px; font-size: 0.8rem; font-weight: 500; }
.gads-path { display: inline-flex; align-items: center; gap: 0.25rem; font-family: monospace; padding: 0.5rem 0.75rem; background: rgba(0,0,0,0.3); border-radius: 6px; font-size: 0.85rem; }
.gads-path-domain { color: #34a853; }
.gads-path-part { color: #fff; }
.gads-path-sep { color: #9ca3af; }
.gads-refine-bar { display: flex; gap: 0.5rem; margin-bottom: 1rem; padding: 0.75rem; background: rgba(66,133,244,0.1); border-radius: 8px; border: 1px solid rgba(66,133,244,0.2); }
.gads-refine-input { flex: 1; padding: 0.5rem 0.75rem; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #fff; font-size: 0.85rem; outline: none; }
.gads-refine-input:focus { border-color: #4285f4; }
.gads-refine-input::placeholder { color: rgba(255,255,255,0.4); }
.gads-shopping { display: none; }
.gads-shopping.visible { display: block; }
.gads-products { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; margin-top: 1rem; }
.gads-product { background: rgba(0,0,0,0.25); border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); overflow: hidden; }
.gads-product-header { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; background: rgba(66,133,244,0.1); border-bottom: 1px solid rgba(255,255,255,0.05); }
.gads-product-num { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background: rgba(66,133,244,0.3); color: #4285f4; border-radius: 50%; font-size: 0.7rem; font-weight: 600; }
.gads-product-title { font-size: 0.85rem; color: #fff; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.gads-product-body { padding: 0.75rem 1rem; font-size: 0.8rem; }
.gads-product-row { display: flex; gap: 0.5rem; margin-bottom: 0.375rem; }
.gads-product-row label { color: #9ca3af; min-width: 70px; }
.gads-product-row span { color: #fff; word-break: break-word; }
.gads-saved { display: flex; flex-direction: column; gap: 0.75rem; }
.gads-saved-empty { text-align: center; padding: 2rem; color: #9ca3af; }
.gads-campaign { display: flex; justify-content: space-between; align-items: center; padding: 0.875rem 1rem; background: rgba(0,0,0,0.3); border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); }
.gads-campaign-info strong { display: block; color: #fff; font-size: 0.9rem; }
.gads-campaign-meta { font-size: 0.75rem; color: #9ca3af; margin-top: 0.25rem; }
.gads-campaign-actions { display: flex; gap: 0.5rem; }
.gads-btn-sm { padding: 0.35rem 0.75rem; font-size: 0.75rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #fff; cursor: pointer; transition: all 0.2s ease; }
.gads-btn-sm:hover { background: rgba(255,255,255,0.15); }
.gads-btn-danger { background: transparent; border-color: rgba(239, 68, 68, 0.5); color: #ef4444; }
.gads-btn-danger:hover { background: rgba(239, 68, 68, 0.1); border-color: #ef4444; }
@keyframes persist-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.persist-spinner { animation: persist-spin 1s linear infinite; }
.gads-tips { padding: 0.75rem 1rem; background: rgba(52,168,83,0.1); border-radius: 8px; margin-top: 1rem; }
.gads-tips h4 { margin: 0 0 0.5rem; font-size: 0.85rem; color: #34a853; }
.gads-tips ul { margin: 0; padding-left: 1.25rem; font-size: 0.8rem; color: #fff; }
.gads-tips li { margin-bottom: 0.25rem; }
.gads-strength { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: rgba(52,168,83,0.15); border-radius: 20px; font-size: 0.85rem; color: #34a853; font-weight: 500; }
.gads-strength.good { background: rgba(251,188,4,0.15); color: #fbbc04; }
.gads-strength.average { background: rgba(234,67,53,0.15); color: #ea4335; }
@media (max-width: 768px) { .gads-form { grid-template-columns: 1fr; } .gads-form.cols-4 { grid-template-columns: repeat(2, 1fr); } .gads-field.full { grid-column: span 1; } .gads-types { grid-template-columns: repeat(2, 1fr); } }
</style>

<div class="gads-builder">
    <div class="gads-header">
        <svg class="gads-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 11l18-5v12L3 13v-2z"/>
            <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
        </svg>
        <div>
            <h1>Google Ads AI Builder</h1>
            <p>Generate high-converting ads with ALL headlines & descriptions</p>
        </div>
    </div>

    <section class="gads-section">
        <h2 class="gads-section-title"><span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg></span> Campaign Type</h2>
        <div class="gads-types" id="gads-types">
            ${Object.entries(SPECS).map(([key, s]) => `
                <div class="gads-type-card" data-type="${key}">
                    <div class="gads-type-icon">${getTypeIcon(key)}</div>
                    <div class="gads-type-name">${s.name}</div>
                    <div class="gads-type-desc">${s.desc}</div>
                </div>
            `).join('')}
        </div>
    </section>

    <section class="gads-section" id="gads-specs-section" style="display:none;">
        <h2 class="gads-section-title"><span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></span> <span id="gads-specs-name">Specifications</span></h2>
        <div class="gads-specs" id="gads-specs-content"></div>
    </section>

    <section class="gads-section gads-shopping" id="gads-shopping-section">
        <h2 class="gads-section-title"><span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg></span> Product URL Scraper</h2>
        <p style="margin:-0.5rem 0 1rem;font-size:0.85rem;color:#9ca3af;">Enter product URLs to generate Merchant Center feed with ALL columns</p>
        <div class="gads-field full">
            <textarea id="gads-urls" rows="4" placeholder="Enter product URLs (one per line)"></textarea>
        </div>
        <div style="display:flex;align-items:center;gap:1rem;margin-top:0.75rem;">
            <button type="button" class="gads-btn gads-btn-primary" id="gads-scrape-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;vertical-align:middle;"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Scrape Products</button>
            <span class="gads-hint">Exports: id, title, description, link, condition, price, availability, image_link, gtin, mpn, brand, google_product_category + 20 more columns</span>
        </div>
        <div class="gads-products" id="gads-products"></div>
    </section>

    <section class="gads-section" id="gads-context-section">
        <h2 class="gads-section-title"><span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg></span> Campaign Context</h2>
        <div class="gads-form">
            <div class="gads-field">
                <label>Link to Company (CRM)</label>
                <select id="gads-company">
                    <option value="">Select company...</option>
                    ${companies.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                </select>
            </div>
            <div class="gads-field">
                <label>Link to Project</label>
                <select id="gads-project">
                    <option value="">Select project...</option>
                    ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                </select>
            </div>
            <div class="gads-field">
                <label>Campaign Name</label>
                <input type="text" id="gads-name" placeholder="e.g., Q1 2026 Brand Campaign">
            </div>
            <div class="gads-field">
                <label>Final URL</label>
                <input type="text" id="gads-url" placeholder="https://example.com/landing">
            </div>
        </div>
    </section>

    <section class="gads-section" id="gads-product-section">
        <h2 class="gads-section-title"><span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></span> Product/Service Details</h2>
        <div class="gads-form">
            <div class="gads-field">
                <label>Product/Service Name</label>
                <input type="text" id="gads-product" placeholder="e.g., Creative Asset Validator Pro">
            </div>
            <div class="gads-field">
                <label>Key Benefits</label>
                <input type="text" id="gads-benefits" placeholder="Save time, Improve ROI, AI-powered">
            </div>
            <div class="gads-field full">
                <label>Unique Selling Points</label>
                <textarea id="gads-usp" rows="2" placeholder="What makes your product/service unique?"></textarea>
            </div>
            <div class="gads-field">
                <label>Special Offer (optional)</label>
                <input type="text" id="gads-offer" placeholder="e.g., 20% off, Free trial">
            </div>
            <div class="gads-field">
                <label>Target Keywords</label>
                <input type="text" id="gads-keywords" placeholder="e.g., ad validator, creative tool">
            </div>
            <div class="gads-field full">
                <label>Target Audience</label>
                <input type="text" id="gads-audience" placeholder="e.g., Marketing managers, agencies">
            </div>
        </div>
    </section>

    <section class="gads-section" id="gads-settings-section">
        <h2 class="gads-section-title"><span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></span> Generation Settings</h2>
        <div class="gads-form cols-4">
            <div class="gads-field">
                <label>Ad Variations</label>
                <select id="gads-variations">
                    <option value="1">1 variation</option>
                    <option value="2">2 variations</option>
                    <option value="3" selected>3 variations</option>
                    <option value="5">5 variations</option>
                </select>
            </div>
            <div class="gads-field">
                <label>Industry</label>
                <select id="gads-industry">
                    ${INDUSTRIES.map(i => `<option value="${i.id}">${i.name}</option>`).join('')}
                </select>
            </div>
            <div class="gads-field">
                <label>Funnel Stage</label>
                <select id="gads-funnel">
                    ${FUNNEL_STAGES.map(f => `<option value="${f.id}">${f.name}</option>`).join('')}
                </select>
            </div>
            <div class="gads-field">
                <label>Tone</label>
                <select id="gads-tone">
                    ${TONES.map(t => `<option value="${t}">${t}</option>`).join('')}
                </select>
            </div>
        </div>
    </section>

    <section class="gads-section">
        <!-- AI Model Selector -->
        <div id="gads-model-selector" style="margin-bottom: 16px;"></div>
        
        <div class="gads-generate-wrap">
            <button type="button" class="gads-generate-btn" id="gads-generate-btn">
                <svg viewBox="0 0 24 24"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                <span id="gads-btn-text">Generate Ad Copy</span>
            </button>
            <p class="gads-hint" id="gads-hint">RSA: Generates 15 headlines + 4 descriptions per variation</p>
        </div>
    </section>

    <section class="gads-section gads-results" id="gads-results" style="display:none;">
        <div class="gads-results-header">
            <h2 class="gads-section-title"><span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span> Generated Ad Copy</h2>
            <div class="gads-results-actions">
                <button type="button" class="gads-btn gads-btn-secondary" id="gads-regenerate"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Regenerate</button>
                <button type="button" class="gads-btn gads-btn-secondary" id="gads-export"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Export CSV</button>
                <button type="button" class="gads-btn gads-btn-primary" id="gads-save"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save to CRM</button>
            </div>
        </div>
        <div id="gads-strength-badge"></div>
        
        <!-- AI Refinement Bar -->
        <div class="gads-refine-bar" id="gads-refine-bar" style="display:none;">
            <input type="text" class="gads-refine-input" id="gads-refine-input" placeholder="Enter instruction to refine selected items (e.g., 'Make more urgent', 'Add social proof')">
            <button type="button" class="gads-btn gads-btn-success" id="gads-refine-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Refine with AI</button>
        </div>
        
        <div class="gads-tabs" id="gads-tabs"></div>
        <div id="gads-results-content"></div>
        <div id="gads-tips"></div>
    </section>

    <section class="gads-section">
        <h2 class="gads-section-title"><span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></span> Saved Campaigns</h2>
        <div class="gads-saved" id="gads-saved">
            ${builder.campaigns.length === 0 ? 
                '<p class="gads-saved-empty">No saved campaigns yet.</p>' :
                renderSavedList(builder.campaigns)}
        </div>
    </section>
</div>`;
    }

    function getTypeIcon(type) {
        const icons = {
            RSA: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
            PMAX: '<svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
            DISPLAY: '<svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
            DEMAND_GEN: '<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
            VIDEO: '<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
            SHOPPING: '<svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>'
        };
        return icons[type] || icons.RSA;
    }

    function renderSavedList(campaigns) {
        return campaigns.slice(0, 10).map(c => `
            <div class="gads-campaign" data-id="${c.id}">
                <div class="gads-campaign-info">
                    <strong>${c.name || 'Untitled'}</strong>
                    <div class="gads-campaign-meta">${SPECS[c.adType]?.name || c.adType} • ${c.variations?.length || 0} variations • ${new Date(c.createdAt).toLocaleDateString()}</div>
                </div>
                <div class="gads-campaign-actions">
                    <button type="button" class="gads-btn-sm" data-action="view">View</button>
                    <button type="button" class="gads-btn-sm" data-action="export">Export</button>
                    <button type="button" class="gads-btn-sm gads-btn-danger" data-action="delete" title="Delete Campaign">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================

    function attachEventHandlers(container, builder) {
        if (!container) return;

        let selectedType = null;
        let currentResults = null;
        let selectedItems = new Map(); // track selected items for AI refinement

        // Check for pre-filled data from Keyword Analyzer
        try {
            const kwaData = localStorage.getItem('kwa_ad_builder_data');
            const kwaAdType = localStorage.getItem('kwa_google_ad_type');
            
            if (kwaData) {
                const data = JSON.parse(kwaData);
                console.log('[GoogleAds] Pre-filling from Keyword Analyzer:', data);
                
                // Pre-fill form fields
                setTimeout(() => {
                    if (data.brandName) {
                        const nameInput = container.querySelector('#gads-name');
                        if (nameInput) nameInput.value = data.brandName + ' Campaign';
                    }
                    if (data.product) {
                        const productInput = container.querySelector('#gads-product');
                        if (productInput) productInput.value = data.product;
                    }
                    if (data.audience) {
                        const audienceInput = container.querySelector('#gads-audience');
                        if (audienceInput) audienceInput.value = data.audience;
                    }
                    if (data.benefits) {
                        const benefitsInput = container.querySelector('#gads-benefits');
                        if (benefitsInput) benefitsInput.value = data.benefits;
                    }
                    if (data.url) {
                        const urlInput = container.querySelector('#gads-url');
                        if (urlInput) urlInput.value = data.url;
                    }
                    if (data.keywords?.length) {
                        // Add keywords to benefits or a separate field
                        const keywordsNote = container.querySelector('#gads-benefits');
                        if (keywordsNote && !keywordsNote.value) {
                            keywordsNote.value = 'Top Keywords: ' + data.keywords.slice(0, 5).join(', ');
                        }
                    }
                    
                    // Pre-select ad type if specified
                    if (kwaAdType) {
                        const typeMap = { 'rsa': 'RSA', 'pmax': 'PMAX', 'display': 'DISPLAY', 'shopping': 'SHOPPING' };
                        const mappedType = typeMap[kwaAdType] || kwaAdType.toUpperCase();
                        const typeCard = container.querySelector(`.gads-type-card[data-type="${mappedType}"]`);
                        if (typeCard) typeCard.click();
                    }
                }, 100);
                
                // Clear the data after using it
                localStorage.removeItem('kwa_ad_builder_data');
                localStorage.removeItem('kwa_google_ad_type');
            }
        } catch (e) {
            console.error('[GoogleAds] Error loading pre-fill data:', e);
        }

        // Type selection
        container.querySelectorAll('.gads-type-card').forEach(card => {
            card.addEventListener('click', function(e) {
                e.preventDefault();
                container.querySelectorAll('.gads-type-card').forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                
                selectedType = this.dataset.type;
                builder.currentType = selectedType;

                const shoppingSection = container.querySelector('#gads-shopping-section');
                const productSection = container.querySelector('#gads-product-section');
                const settingsSection = container.querySelector('#gads-settings-section');
                const btnText = container.querySelector('#gads-btn-text');
                const hint = container.querySelector('#gads-hint');

                if (selectedType === 'SHOPPING') {
                    shoppingSection?.classList.add('visible');
                    productSection && (productSection.style.display = 'none');
                    settingsSection && (settingsSection.style.display = 'none');
                    btnText && (btnText.textContent = 'Generate Product Feed');
                    hint && (hint.textContent = 'Exports ALL Merchant Center columns');
                } else {
                    shoppingSection?.classList.remove('visible');
                    productSection && (productSection.style.display = 'block');
                    settingsSection && (settingsSection.style.display = 'block');
                    btnText && (btnText.textContent = 'Generate Ad Copy');
                    const spec = SPECS[selectedType];
                    hint && (hint.textContent = `${spec.name}: Generates ${spec.headlines?.generate || 5} headlines + ${spec.descriptions?.generate || 4} descriptions`);
                }

                updateSpecs(container, selectedType);
            });
        });

        function updateSpecs(container, type) {
            const specsSection = container.querySelector('#gads-specs-section');
            const specsName = container.querySelector('#gads-specs-name');
            const specsContent = container.querySelector('#gads-specs-content');
            
            if (!specsSection) return;
            
            const spec = SPECS[type];
            specsName.textContent = `${spec.name} Specifications`;
            
            let html = '';
            if (type === 'SHOPPING') {
                html = `
                    <div class="gads-spec"><div class="gads-spec-label">Required</div><div class="gads-spec-value">id, title, description, link, image_link, availability, price, brand</div></div>
                    <div class="gads-spec"><div class="gads-spec-label">Recommended</div><div class="gads-spec-value">gtin, mpn, condition, google_product_category</div></div>
                    <div class="gads-spec"><div class="gads-spec-label">Optional</div><div class="gads-spec-value">color, size, gender, age_group, material, pattern + 15 more</div></div>
                `;
            } else {
                if (spec.headlines) {
                    html += `<div class="gads-spec"><div class="gads-spec-label">Headlines</div><div class="gads-spec-value">${spec.headlines.generate} (max ${spec.headlines.chars} chars)</div></div>`;
                }
                if (spec.longHeadlines) {
                    html += `<div class="gads-spec"><div class="gads-spec-label">Long Headlines</div><div class="gads-spec-value">${spec.longHeadlines.generate} (max ${spec.longHeadlines.chars} chars)</div></div>`;
                }
                if (spec.descriptions) {
                    html += `<div class="gads-spec"><div class="gads-spec-label">Descriptions</div><div class="gads-spec-value">${spec.descriptions.generate} (max ${spec.descriptions.chars} chars)</div></div>`;
                }
                if (spec.displayPath) {
                    html += `<div class="gads-spec"><div class="gads-spec-label">Display Path</div><div class="gads-spec-value">2 parts (${spec.displayPath.chars} chars)</div></div>`;
                }
            }
            
            specsContent.innerHTML = html;
            specsSection.style.display = 'block';
        }

        // Scrape products
        container.querySelector('#gads-scrape-btn')?.addEventListener('click', async function() {
            const urlsEl = container.querySelector('#gads-urls');
            const urlsText = urlsEl?.value?.trim();
            if (!urlsText) {
                alert('Please enter product URLs');
                return;
            }

            const urls = urlsText.split('\n').filter(u => u.trim().startsWith('http'));
            if (!urls.length) {
                alert('No valid URLs found');
                return;
            }

            this.disabled = true;
            this.innerHTML = '<span class="gads-spinner"></span> Scraping...';

            const products = [];
            for (let i = 0; i < Math.min(urls.length, 30); i++) {
                this.innerHTML = `<span class="gads-spinner"></span> ${i + 1}/${urls.length}...`;
                try {
                    const p = await builder.scrapeProduct(urls[i].trim());
                    if (p) products.push(p);
                } catch (err) {
                    products.push({ error: err.message, url: urls[i] });
                }
            }

            currentResults = { products, adType: 'SHOPPING', name: container.querySelector('#gads-name')?.value || 'Product Feed' };
            renderProducts(container, products);

            this.disabled = false;
            this.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;vertical-align:middle;"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Scrape Products';

            const resultsSection = container.querySelector('#gads-results');
            if (resultsSection) resultsSection.style.display = 'block';
        });

        function renderProducts(container, products) {
            const productsEl = container.querySelector('#gads-products');
            if (!productsEl) return;

            productsEl.innerHTML = products.map((p, i) => `
                <div class="gads-product">
                    ${p.error ? `
                        <div class="gads-product-header"><span class="gads-product-num"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span><span class="gads-product-title">Error</span></div>
                        <div class="gads-product-body"><p style="color:#ea4335;">${p.error}</p></div>
                    ` : `
                        <div class="gads-product-header">
                            <span class="gads-product-num">${i + 1}</span>
                            <span class="gads-product-title">${p.title || 'Product'}</span>
                        </div>
                        <div class="gads-product-body">
                            <div class="gads-product-row"><label>ID:</label><span>${p.id || 'N/A'}</span></div>
                            <div class="gads-product-row"><label>Price:</label><span>${p.price || 'N/A'}</span></div>
                            <div class="gads-product-row"><label>Brand:</label><span>${p.brand || 'N/A'}</span></div>
                            <div class="gads-product-row"><label>GTIN:</label><span>${p.gtin || 'N/A'}</span></div>
                            <div class="gads-product-row"><label>Condition:</label><span>${p.condition || 'new'}</span></div>
                        </div>
                    `}
                </div>
            `).join('');
        }

        // Generate ads
        // Initialize AI Model Selector
        if (window.AIModelSelector) {
            window.AIModelSelector.renderSelector('gads-model-selector', (modelId, model) => {
                console.log('[GoogleAds] Model changed to:', modelId);
                builder.setModel(modelId);
            }, { showDescription: true, compact: false });
        }

        container.querySelector('#gads-generate-btn')?.addEventListener('click', async function() {
            if (!selectedType) {
                alert('Please select a campaign type');
                return;
            }

            // Set the selected model before generating
            const modelSelect = container.querySelector('#gads-model-selector-select');
            if (modelSelect) {
                builder.setModel(modelSelect.value);
            }

            if (selectedType === 'SHOPPING') return;

            this.disabled = true;
            const btnText = container.querySelector('#gads-btn-text');
            const origText = btnText?.textContent;
            if (btnText) btnText.innerHTML = '<span class="gads-spinner"></span> Generating...';

            try {
                const config = {
                    adType: selectedType,
                    variations: parseInt(container.querySelector('#gads-variations')?.value || '3'),
                    industry: container.querySelector('#gads-industry')?.value,
                    funnel: container.querySelector('#gads-funnel')?.value,
                    tone: container.querySelector('#gads-tone')?.value,
                    company: container.querySelector('#gads-name')?.value,
                    url: container.querySelector('#gads-url')?.value,
                    product: container.querySelector('#gads-product')?.value,
                    benefits: container.querySelector('#gads-benefits')?.value,
                    usp: container.querySelector('#gads-usp')?.value,
                    offer: container.querySelector('#gads-offer')?.value,
                    keywords: container.querySelector('#gads-keywords')?.value,
                    audience: container.querySelector('#gads-audience')?.value
                };

                currentResults = await builder.generateAds(config);
                currentResults.adType = selectedType;
                currentResults.name = config.company || 'Untitled';
                currentResults.finalUrl = config.url;
                
                renderResults(container, currentResults, selectedType);

            } catch (err) {
                alert('Error: ' + err.message);
            } finally {
                this.disabled = false;
                if (btnText) btnText.textContent = origText;
            }
        });

        function renderResults(container, results, type) {
            const resultsSection = container.querySelector('#gads-results');
            const tabsEl = container.querySelector('#gads-tabs');
            const contentEl = container.querySelector('#gads-results-content');
            const strengthEl = container.querySelector('#gads-strength-badge');
            const tipsEl = container.querySelector('#gads-tips');
            const refineBar = container.querySelector('#gads-refine-bar');

            if (!resultsSection || !results?.variations?.length) {
                if (results?.raw) {
                    contentEl.innerHTML = `<pre style="white-space:pre-wrap;color:#fff;">${results.raw}</pre>`;
                    resultsSection.style.display = 'block';
                }
                return;
            }

            selectedItems.clear();

            // Ad strength
            if (strengthEl && results.adStrength) {
                const cls = results.adStrength === 'Excellent' ? '' : results.adStrength === 'Good' ? 'good' : 'average';
                strengthEl.innerHTML = `<span class="gads-strength ${cls}">Ad Strength: ${results.adStrength}</span>`;
            }

            // Show refine bar
            if (refineBar) refineBar.style.display = 'flex';

            // Tabs
            tabsEl.innerHTML = results.variations.map((v, i) => 
                `<button type="button" class="gads-tab ${i === 0 ? 'active' : ''}" data-tab="${i}">Variation ${i + 1}</button>`
            ).join('');

            // Content - show ALL headlines and descriptions
            const spec = SPECS[type];
            contentEl.innerHTML = results.variations.map((v, i) => `
                <div class="gads-tab-panel ${i === 0 ? 'active' : ''}" data-panel="${i}">
                    ${v.headlines?.length ? `
                        <div class="gads-group">
                            <div class="gads-group-header">
                                <h3><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Headlines <span class="chars">(max ${spec.headlines?.chars || 30} chars)</span></h3>
                                <div class="gads-select-actions">
                                    <button type="button" data-action="select-all" data-group="headlines" data-var="${i}">Select All</button>
                                    <button type="button" data-action="deselect-all" data-group="headlines" data-var="${i}">Deselect</button>
                                </div>
                            </div>
                            <div class="gads-copy-list">
                                ${v.headlines.map((h, j) => renderCopyItem(h, j, 'headline', i, spec.headlines?.chars || 30)).join('')}
                            </div>
                        </div>
                    ` : ''}
                    ${v.longHeadlines?.length ? `
                        <div class="gads-group">
                            <div class="gads-group-header">
                                <h3><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Long Headlines <span class="chars">(max 90 chars)</span></h3>
                            </div>
                            <div class="gads-copy-list">
                                ${v.longHeadlines.map((h, j) => renderCopyItem(h, j, 'longHeadline', i, 90)).join('')}
                            </div>
                        </div>
                    ` : ''}
                    ${v.descriptions?.length ? `
                        <div class="gads-group">
                            <div class="gads-group-header">
                                <h3>💬 Descriptions <span class="chars">(max 90 chars)</span></h3>
                                <div class="gads-select-actions">
                                    <button type="button" data-action="select-all" data-group="descriptions" data-var="${i}">Select All</button>
                                    <button type="button" data-action="deselect-all" data-group="descriptions" data-var="${i}">Deselect</button>
                                </div>
                            </div>
                            <div class="gads-copy-list">
                                ${v.descriptions.map((d, j) => renderCopyItem(d, j, 'description', i, 90)).join('')}
                            </div>
                        </div>
                    ` : ''}
                    ${v.ctas?.length ? `
                        <div class="gads-group">
                            <h3><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> Call-to-Action</h3>
                            <div class="gads-ctas">${v.ctas.map(c => `<span class="gads-cta">${c}</span>`).join('')}</div>
                        </div>
                    ` : ''}
                    ${v.displayPaths?.length ? `
                        <div class="gads-group">
                            <h3><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> Display Path</h3>
                            <div class="gads-path">
                                <span class="gads-path-domain">example.com/</span>
                                <span class="gads-path-part">${v.displayPaths[0] || ''}</span>
                                <span class="gads-path-sep">/</span>
                                <span class="gads-path-part">${v.displayPaths[1] || ''}</span>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `).join('');

            // Tips
            if (tipsEl && results.tips?.length) {
                tipsEl.innerHTML = `<div class="gads-tips"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2v1"/><path d="M12 22V12"/><path d="M12 12a4 4 0 1 0 0-8"/></svg> Tips</h4><ul>${results.tips.map(t => `<li>${t}</li>`).join('')}</ul></div>`;
            }

            // Attach handlers
            attachResultHandlers(container, results);

            resultsSection.style.display = 'block';
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }

        function renderCopyItem(text, index, type, varIndex, limit) {
            const isOver = text.length > limit;
            const safe = String(text).replace(/"/g, '&quot;').replace(/</g, '&lt;');
            const key = `${varIndex}-${type}-${index}`;
            return `
                <div class="gads-copy-item" data-key="${key}">
                    <input type="checkbox" class="gads-copy-check" data-key="${key}" data-type="${type}" data-var="${varIndex}" data-index="${index}">
                    <span class="gads-copy-num">${index + 1}</span>
                    <input type="text" class="gads-copy-text" value="${safe}" data-key="${key}">
                    <span class="gads-char-count ${isOver ? 'over' : ''}">${text.length}/${limit}</span>
                    <button type="button" class="gads-copy-btn" data-copy="${safe}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
                </div>
            `;
        }

        function attachResultHandlers(container, results) {
            // Tab switching
            container.querySelectorAll('.gads-tab').forEach(tab => {
                tab.addEventListener('click', function() {
                    container.querySelectorAll('.gads-tab').forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    container.querySelectorAll('.gads-tab-panel').forEach(p => p.classList.remove('active'));
                    container.querySelector(`[data-panel="${this.dataset.tab}"]`)?.classList.add('active');
                });
            });

            // Copy buttons
            container.querySelectorAll('.gads-copy-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    navigator.clipboard.writeText(this.dataset.copy).then(() => {
                        this.textContent = '✓';
                        setTimeout(() => this.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>', 1000);
                    });
                });
            });

            // Checkbox selection
            container.querySelectorAll('.gads-copy-check').forEach(check => {
                check.addEventListener('change', function() {
                    const item = this.closest('.gads-copy-item');
                    if (this.checked) {
                        item.classList.add('selected');
                        selectedItems.set(this.dataset.key, {
                            type: this.dataset.type,
                            varIndex: parseInt(this.dataset.var),
                            index: parseInt(this.dataset.index),
                            text: item.querySelector('.gads-copy-text').value
                        });
                    } else {
                        item.classList.remove('selected');
                        selectedItems.delete(this.dataset.key);
                    }
                });
            });

            // Select all / Deselect all
            container.querySelectorAll('[data-action="select-all"], [data-action="deselect-all"]').forEach(btn => {
                btn.addEventListener('click', function() {
                    const group = this.dataset.group;
                    const varIndex = this.dataset.var;
                    const isSelect = this.dataset.action === 'select-all';
                    const panel = container.querySelector(`[data-panel="${varIndex}"]`);
                    
                    panel.querySelectorAll(`.gads-copy-check[data-type="${group === 'headlines' ? 'headline' : 'description'}"]`).forEach(check => {
                        check.checked = isSelect;
                        check.dispatchEvent(new Event('change'));
                    });
                });
            });

            // Text input changes
            container.querySelectorAll('.gads-copy-text').forEach(input => {
                input.addEventListener('input', function() {
                    const limit = this.closest('.gads-group').querySelector('.chars')?.textContent.match(/\d+/)?.[0] || 90;
                    const countEl = this.closest('.gads-copy-item').querySelector('.gads-char-count');
                    countEl.textContent = `${this.value.length}/${limit}`;
                    countEl.classList.toggle('over', this.value.length > parseInt(limit));
                    
                    // Update results
                    const key = this.dataset.key;
                    if (selectedItems.has(key)) {
                        selectedItems.get(key).text = this.value;
                    }
                });
            });
        }

        // AI Refinement
        container.querySelector('#gads-refine-btn')?.addEventListener('click', async function() {
            if (selectedItems.size === 0) {
                alert('Please select items to refine');
                return;
            }

            const instruction = container.querySelector('#gads-refine-input')?.value?.trim();
            if (!instruction) {
                alert('Please enter a refinement instruction');
                return;
            }

            this.disabled = true;
            this.innerHTML = '<span class="gads-spinner"></span> Refining...';

            try {
                const items = Array.from(selectedItems.values());
                const context = `Campaign: ${currentResults.name}, Product: ${container.querySelector('#gads-product')?.value}`;
                
                const refined = await builder.refineWithAI(items, context, instruction);
                
                // Update the UI with refined text
                items.forEach((item, i) => {
                    if (refined[i]) {
                        const key = `${item.varIndex}-${item.type}-${item.index}`;
                        const input = container.querySelector(`.gads-copy-text[data-key="${key}"]`);
                        if (input) {
                            input.value = refined[i];
                            input.dispatchEvent(new Event('input'));
                            
                            // Update results object
                            const v = currentResults.variations[item.varIndex];
                            if (item.type === 'headline' && v.headlines) {
                                v.headlines[item.index] = refined[i];
                            } else if (item.type === 'description' && v.descriptions) {
                                v.descriptions[item.index] = refined[i];
                            }
                        }
                    }
                });

            } catch (err) {
                alert('Refinement error: ' + err.message);
            } finally {
                this.disabled = false;
                this.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Refine with AI';
            }
        });

        // Regenerate
        container.querySelector('#gads-regenerate')?.addEventListener('click', () => {
            container.querySelector('#gads-generate-btn')?.click();
        });

        // Export
        container.querySelector('#gads-export')?.addEventListener('click', function() {
            if (!currentResults) {
                alert('No results to export');
                return;
            }
            const csv = builder.exportCSV(currentResults);
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const filename = currentResults.adType === 'SHOPPING' 
                ? 'merchant_center_feed.csv'
                : `google_ads_${currentResults.adType?.toLowerCase() || 'campaign'}.csv`;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        });

        // Save - with enhanced feedback
        container.querySelector('#gads-save')?.addEventListener('click', async function() {
            const saveBtn = this;
            
            if (!currentResults) {
                if (window.PersistenceUI) {
                    window.PersistenceUI.showError('Nothing to Save', 'Generate ad copy first, then save');
                } else {
                    alert('No results to save');
                }
                return;
            }
            
            const originalHTML = saveBtn.innerHTML;
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="persist-spinner" style="margin-right:4px;vertical-align:middle;animation:persist-spin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg> Saving...';
            
            try {
                builder.saveCampaign(currentResults);
                container.querySelector('#gads-saved').innerHTML = renderSavedList(builder.campaigns);
                
                if (window.PersistenceUI) {
                    window.PersistenceUI.showSuccess('Campaign Saved', `Your ${currentResults.adType || 'Google Ads'} campaign has been saved`);
                }
                
                saveBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;color:#10b981;"><polyline points="20 6 9 17 4 12"/></svg> Saved!';
                
                setTimeout(() => {
                    saveBtn.innerHTML = originalHTML;
                    saveBtn.disabled = false;
                }, 2000);
                
            } catch (error) {
                console.error('[GoogleAds] Save error:', error);
                saveBtn.innerHTML = originalHTML;
                saveBtn.disabled = false;
                
                if (window.PersistenceUI) {
                    window.PersistenceUI.showError('Save Failed', error.message || 'Could not save campaign');
                }
            }
        });

        // Saved campaign actions - with delete support
        container.querySelector('#gads-saved')?.addEventListener('click', async function(e) {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            
            const card = btn.closest('.gads-campaign');
            const campaignId = card?.dataset.id;
            const campaign = builder.campaigns.find(c => c.id === campaignId);
            if (!campaign) return;

            if (btn.dataset.action === 'view') {
                currentResults = campaign;
                renderResults(container, campaign, campaign.adType);
            } else if (btn.dataset.action === 'export') {
                const csv = builder.exportCSV(campaign);
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${campaign.name?.replace(/\s+/g, '_') || 'campaign'}.csv`;
                a.click();
                URL.revokeObjectURL(url);
                
                if (window.PersistenceUI) {
                    window.PersistenceUI.showSuccess('Exported', 'CSV file downloaded');
                }
            } else if (btn.dataset.action === 'delete') {
                const campaignName = campaign.name || campaign.adType || 'this campaign';
                
                const confirmed = window.PersistenceUI
                    ? await window.PersistenceUI.confirm({
                        title: 'Delete Campaign?',
                        message: `Are you sure you want to delete "${campaignName}"? This action cannot be undone.`,
                        confirmText: 'Delete',
                        cancelText: 'Cancel'
                    })
                    : confirm(`Delete "${campaignName}"?`);
                
                if (confirmed) {
                    builder.campaigns = builder.campaigns.filter(c => c.id !== campaignId);
                    builder.saveCampaigns();
                    container.querySelector('#gads-saved').innerHTML = renderSavedList(builder.campaigns);
                    
                    if (window.PersistenceUI) {
                        window.PersistenceUI.showSuccess('Campaign Deleted', `"${campaignName}" has been removed`);
                    }
                }
            }
        });

        console.log('[GoogleAds] v2.1.0 handlers attached');
    }

    // ============================================
    // EXPORT
    // ============================================

    const builder = new GoogleAdsAIBuilder();

    window.GoogleAdsBuilder = {
        version: VERSION,
        builder: builder,
        SPECS: SPECS,
        MERCHANT_COLUMNS: MERCHANT_COLUMNS,
        createUI: createUI,
        attachEventHandlers: attachEventHandlers
    };

    console.log(`✅ [Google Ads AI Builder] v${VERSION} - Full headlines/descriptions + AI refinement`);

})();
