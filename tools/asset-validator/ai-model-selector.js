/**
 * AI Model Selector Component
 * Allows users to select their preferred AI model for analysis tasks
 * Version: 1.0.0 - January 17, 2026
 */

(function() {
    'use strict';

    const VERSION = '1.0.0';

    // ============================================
    // AVAILABLE MODELS FOR USER SELECTION
    // ============================================

    const SELECTABLE_MODELS = {
        // Google Gemini Models
        'gemini-3-flash-preview': {
            id: 'gemini-3-flash-preview',
            name: 'Gemini 3 Flash',
            provider: 'google',
            icon: '⚡',
            color: '#4285f4',
            description: 'Fast, Pro-level intelligence',
            speed: 'Fast',
            quality: 'High',
            capabilities: ['text', 'vision', 'analysis', 'code'],
            apiKeyRequired: 'gemini'
        },
        'gemini-3-pro-preview': {
            id: 'gemini-3-pro-preview',
            name: 'Gemini 3 Pro',
            provider: 'google',
            icon: '🧠',
            color: '#4285f4',
            description: 'Most intelligent for complex reasoning',
            speed: 'Medium',
            quality: 'Highest',
            capabilities: ['text', 'vision', 'analysis', 'code', 'reasoning'],
            apiKeyRequired: 'gemini'
        },

        // OpenAI Models
        'gpt-5.2': {
            id: 'gpt-5.2',
            name: 'GPT-5.2',
            provider: 'openai',
            icon: '🤖',
            color: '#10a37f',
            description: 'Flagship model for coding & agentic tasks',
            speed: 'Medium',
            quality: 'Highest',
            capabilities: ['text', 'vision', 'analysis', 'code', 'reasoning'],
            apiKeyRequired: 'openai'
        },
        'gpt-5-mini': {
            id: 'gpt-5-mini',
            name: 'GPT-5 Mini',
            provider: 'openai',
            icon: '⚡',
            color: '#10a37f',
            description: 'Fast and cost-effective',
            speed: 'Fast',
            quality: 'High',
            capabilities: ['text', 'analysis', 'code'],
            apiKeyRequired: 'openai'
        },

        // Anthropic Claude Models
        'claude-opus-4-5-20250929': {
            id: 'claude-opus-4-5-20250929',
            name: 'Claude Opus 4.5',
            provider: 'anthropic',
            icon: '🎭',
            color: '#d97706',
            description: 'Most capable Claude for complex tasks',
            speed: 'Slow',
            quality: 'Highest',
            capabilities: ['text', 'vision', 'analysis', 'code', 'reasoning'],
            apiKeyRequired: 'claude'
        },
        'claude-sonnet-4-5-20250929': {
            id: 'claude-sonnet-4-5-20250929',
            name: 'Claude Sonnet 4.5',
            provider: 'anthropic',
            icon: '📝',
            color: '#d97706',
            description: 'Balanced performance and speed',
            speed: 'Medium',
            quality: 'High',
            capabilities: ['text', 'vision', 'analysis', 'code'],
            apiKeyRequired: 'claude'
        }
    };

    // Default model preference (stored in localStorage)
    const STORAGE_KEY = 'cav_preferred_ai_model';

    // ============================================
    // MODEL SELECTOR CLASS
    // ============================================

    class AIModelSelector {
        constructor() {
            this.selectedModel = this.loadPreference();
            console.log(`[AIModelSelector] Initialized with model: ${this.selectedModel}`);
        }

        // Load saved preference
        loadPreference() {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved && SELECTABLE_MODELS[saved]) {
                    return saved;
                }
            } catch (e) {}
            return 'gemini-3-flash-preview'; // Default
        }

        // Save preference
        savePreference(modelId) {
            if (SELECTABLE_MODELS[modelId]) {
                this.selectedModel = modelId;
                localStorage.setItem(STORAGE_KEY, modelId);
                console.log(`[AIModelSelector] Saved preference: ${modelId}`);
            }
        }

        // Get current model
        getSelectedModel() {
            return SELECTABLE_MODELS[this.selectedModel] || SELECTABLE_MODELS['gemini-3-flash-preview'];
        }

        // Get all available models
        getAvailableModels() {
            return SELECTABLE_MODELS;
        }

        // Check if API key is available for a model
        hasAPIKey(modelId) {
            const model = SELECTABLE_MODELS[modelId];
            if (!model) return false;

            const keyType = model.apiKeyRequired;
            
            // Check via CAVSettings
            if (window.CAVSettings?.manager?.getAPIKey) {
                const key = window.CAVSettings.manager.getAPIKey(keyType);
                if (key) return true;
            }
            
            if (window.CAVSettings?.getAPIKey) {
                const key = window.CAVSettings.getAPIKey(keyType);
                if (key) return true;
            }

            // Check localStorage
            try {
                const v3Settings = JSON.parse(localStorage.getItem('cav_v3_settings') || '{}');
                if (v3Settings.apiKeys?.[keyType]?.key) return true;
            } catch (e) {}

            return false;
        }

        // Get API key for a model
        getAPIKey(modelId) {
            const model = SELECTABLE_MODELS[modelId];
            if (!model) return null;

            const keyType = model.apiKeyRequired;
            
            // Try CAVSettings
            if (window.CAVSettings?.manager?.getAPIKey) {
                const key = window.CAVSettings.manager.getAPIKey(keyType);
                if (key) return key;
            }
            
            if (window.CAVSettings?.getAPIKey) {
                const key = window.CAVSettings.getAPIKey(keyType);
                if (key) return key;
            }

            // Try localStorage
            try {
                const v3Settings = JSON.parse(localStorage.getItem('cav_v3_settings') || '{}');
                if (v3Settings.apiKeys?.[keyType]?.key) {
                    return v3Settings.apiKeys[keyType].key;
                }
            } catch (e) {}

            return null;
        }

        // ============================================
        // UI RENDERING
        // ============================================

        /**
         * Render a compact model selector dropdown
         * @param {string} containerId - ID of container element
         * @param {function} onChange - Callback when model changes
         * @param {object} options - { showDescription: bool, compact: bool }
         */
        renderSelector(containerId, onChange, options = {}) {
            const container = document.getElementById(containerId);
            if (!container) {
                console.warn(`[AIModelSelector] Container not found: ${containerId}`);
                return;
            }

            const { showDescription = true, compact = false } = options;

            const html = `
                <div class="ai-model-selector" style="
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: ${compact ? '8px 12px' : '12px 16px'};
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                ">
                    <label style="
                        font-size: ${compact ? '12px' : '13px'};
                        color: #94a3b8;
                        white-space: nowrap;
                    ">
                        AI Model:
                    </label>
                    <select id="${containerId}-select" style="
                        flex: 1;
                        background: rgba(0, 0, 0, 0.3);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        border-radius: 6px;
                        color: #fff;
                        padding: ${compact ? '6px 10px' : '8px 12px'};
                        font-size: ${compact ? '12px' : '13px'};
                        cursor: pointer;
                        min-width: 180px;
                    ">
                        ${this._renderModelOptions()}
                    </select>
                    ${showDescription ? `
                        <span id="${containerId}-desc" style="
                            font-size: 11px;
                            color: #64748b;
                            max-width: 200px;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        ">
                            ${SELECTABLE_MODELS[this.selectedModel]?.description || ''}
                        </span>
                    ` : ''}
                </div>
            `;

            container.innerHTML = html;

            // Attach event listener
            const select = document.getElementById(`${containerId}-select`);
            if (select) {
                select.addEventListener('change', (e) => {
                    const newModel = e.target.value;
                    
                    // Check if API key is available
                    if (!this.hasAPIKey(newModel)) {
                        const model = SELECTABLE_MODELS[newModel];
                        alert(`⚠️ No ${model.apiKeyRequired.toUpperCase()} API key configured.\n\nGo to Settings > API Keys to add your ${model.provider} API key.`);
                        select.value = this.selectedModel; // Revert
                        return;
                    }

                    this.savePreference(newModel);
                    
                    // Update description
                    if (showDescription) {
                        const desc = document.getElementById(`${containerId}-desc`);
                        if (desc) {
                            desc.textContent = SELECTABLE_MODELS[newModel]?.description || '';
                        }
                    }

                    // Call onChange callback
                    if (typeof onChange === 'function') {
                        onChange(newModel, SELECTABLE_MODELS[newModel]);
                    }
                });
            }
        }

        /**
         * Render inline model selector (smaller, for embedding in forms)
         */
        renderInlineSelector(options = {}) {
            const { id = 'ai-model-inline', onChange = null } = options;
            
            return `
                <div class="ai-model-inline-selector" style="display: inline-flex; align-items: center; gap: 8px;">
                    <span style="font-size: 12px; color: #94a3b8;">Model:</span>
                    <select id="${id}" class="ai-model-select" style="
                        background: rgba(0, 0, 0, 0.3);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        border-radius: 4px;
                        color: #fff;
                        padding: 4px 8px;
                        font-size: 12px;
                        cursor: pointer;
                    ">
                        ${this._renderModelOptions()}
                    </select>
                </div>
            `;
        }

        /**
         * Render model options HTML
         */
        _renderModelOptions() {
            const groups = {
                google: { label: '🔷 Google Gemini', models: [] },
                openai: { label: '🟢 OpenAI GPT', models: [] },
                anthropic: { label: '🟠 Anthropic Claude', models: [] }
            };

            // Group models by provider
            Object.entries(SELECTABLE_MODELS).forEach(([id, model]) => {
                const hasKey = this.hasAPIKey(id);
                groups[model.provider].models.push({
                    id,
                    ...model,
                    hasKey
                });
            });

            let html = '';
            Object.values(groups).forEach(group => {
                if (group.models.length > 0) {
                    html += `<optgroup label="${group.label}">`;
                    group.models.forEach(model => {
                        const selected = model.id === this.selectedModel ? 'selected' : '';
                        const disabled = !model.hasKey ? 'disabled' : '';
                        const keyStatus = model.hasKey ? '' : ' (No API Key)';
                        html += `<option value="${model.id}" ${selected} ${disabled}>
                            ${model.icon} ${model.name}${keyStatus}
                        </option>`;
                    });
                    html += '</optgroup>';
                }
            });

            return html;
        }

        /**
         * Render model cards for selection (visual grid)
         */
        renderModelCards(containerId, onChange) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const groups = [
                { provider: 'google', label: 'Google Gemini', color: '#4285f4' },
                { provider: 'openai', label: 'OpenAI GPT', color: '#10a37f' },
                { provider: 'anthropic', label: 'Anthropic Claude', color: '#d97706' }
            ];

            let html = '<div style="display: flex; flex-direction: column; gap: 16px;">';

            groups.forEach(group => {
                const models = Object.entries(SELECTABLE_MODELS)
                    .filter(([_, m]) => m.provider === group.provider);

                if (models.length === 0) return;

                html += `
                    <div>
                        <h4 style="color: ${group.color}; margin: 0 0 8px; font-size: 13px; font-weight: 600;">
                            ${group.label}
                        </h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px;">
                `;

                models.forEach(([id, model]) => {
                    const isSelected = id === this.selectedModel;
                    const hasKey = this.hasAPIKey(id);

                    html += `
                        <div class="model-card" data-model="${id}" style="
                            padding: 12px;
                            background: ${isSelected ? `rgba(${this._hexToRgb(model.color)}, 0.15)` : 'rgba(255, 255, 255, 0.03)'};
                            border: 2px solid ${isSelected ? model.color : 'rgba(255, 255, 255, 0.1)'};
                            border-radius: 8px;
                            cursor: ${hasKey ? 'pointer' : 'not-allowed'};
                            opacity: ${hasKey ? 1 : 0.5};
                            transition: all 0.2s;
                        ">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                                <span style="font-size: 18px;">${model.icon}</span>
                                <span style="font-weight: 600; color: #fff; font-size: 13px;">${model.name}</span>
                                ${isSelected ? '<span style="margin-left: auto; color: #22c55e; font-size: 11px;">✓ Selected</span>' : ''}
                            </div>
                            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">
                                ${model.description}
                            </div>
                            <div style="display: flex; gap: 8px; font-size: 10px;">
                                <span style="padding: 2px 6px; background: rgba(255,255,255,0.1); border-radius: 4px;">
                                    Speed: ${model.speed}
                                </span>
                                <span style="padding: 2px 6px; background: rgba(255,255,255,0.1); border-radius: 4px;">
                                    Quality: ${model.quality}
                                </span>
                            </div>
                            ${!hasKey ? '<div style="color: #ef4444; font-size: 10px; margin-top: 6px;">⚠️ API Key Required</div>' : ''}
                        </div>
                    `;
                });

                html += '</div></div>';
            });

            html += '</div>';
            container.innerHTML = html;

            // Attach click handlers
            container.querySelectorAll('.model-card').forEach(card => {
                card.addEventListener('click', () => {
                    const modelId = card.dataset.model;
                    if (!this.hasAPIKey(modelId)) {
                        const model = SELECTABLE_MODELS[modelId];
                        alert(`⚠️ No ${model.apiKeyRequired.toUpperCase()} API key configured.\n\nGo to Settings > API Keys to add your ${model.provider} API key.`);
                        return;
                    }

                    this.savePreference(modelId);
                    this.renderModelCards(containerId, onChange); // Re-render

                    if (typeof onChange === 'function') {
                        onChange(modelId, SELECTABLE_MODELS[modelId]);
                    }
                });
            });
        }

        _hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result 
                ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
                : '255, 255, 255';
        }

        // ============================================
        // API CALL METHODS
        // ============================================

        /**
         * Call AI with the selected (or specified) model
         * @param {string} prompt - The prompt to send
         * @param {object} options - { model: string, temperature: number, maxTokens: number }
         * @returns {Promise<object>} - Parsed JSON response
         */
        async callAI(prompt, options = {}) {
            const modelId = options.model || this.selectedModel;
            const model = SELECTABLE_MODELS[modelId];
            
            if (!model) {
                throw new Error(`Unknown model: ${modelId}`);
            }

            const apiKey = this.getAPIKey(modelId);
            if (!apiKey) {
                throw new Error(`No API key configured for ${model.name}. Go to Settings > API Keys.`);
            }

            console.log(`[AIModelSelector] Calling ${model.name} (${modelId})`);

            switch (model.provider) {
                case 'google':
                    return this._callGemini(prompt, modelId, apiKey, options);
                case 'openai':
                    return this._callOpenAI(prompt, modelId, apiKey, options);
                case 'anthropic':
                    return this._callClaude(prompt, modelId, apiKey, options);
                default:
                    throw new Error(`Unsupported provider: ${model.provider}`);
            }
        }

        async _callGemini(prompt, modelId, apiKey, options = {}) {
            const { temperature = 0.7, maxTokens = 8192 } = options;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature,
                            maxOutputTokens: maxTokens,
                            responseMimeType: 'application/json'
                        }
                    })
                }
            );

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Gemini API error: ${response.status} - ${error}`);
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            
            return this._parseJSON(text);
        }

        async _callOpenAI(prompt, modelId, apiKey, options = {}) {
            const { temperature = 0.7, maxTokens = 4096 } = options;

            // GPT-5.x models use max_completion_tokens instead of max_tokens
            const isGPT5 = modelId.startsWith('gpt-5');
            const tokenParam = isGPT5 
                ? { max_completion_tokens: maxTokens }
                : { max_tokens: maxTokens };

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: modelId,
                    messages: [{ role: 'user', content: prompt }],
                    temperature,
                    ...tokenParam,
                    response_format: { type: 'json_object' }
                })
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`OpenAI API error: ${response.status} - ${error}`);
            }

            const data = await response.json();
            const text = data.choices?.[0]?.message?.content || '';
            
            return this._parseJSON(text);
        }

        async _callClaude(prompt, modelId, apiKey, options = {}) {
            const { temperature = 0.7, maxTokens = 4096 } = options;

            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: modelId,
                    max_tokens: maxTokens,
                    messages: [{ role: 'user', content: prompt }]
                })
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Claude API error: ${response.status} - ${error}`);
            }

            const data = await response.json();
            const text = data.content?.[0]?.text || '';
            
            return this._parseJSON(text);
        }

        _parseJSON(text) {
            if (!text) return {};

            // Clean up markdown code blocks
            let cleaned = text;
            if (cleaned.includes('```json')) {
                cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*/g, '');
            } else if (cleaned.includes('```')) {
                cleaned = cleaned.replace(/```\s*/g, '');
            }

            // Try to find JSON object
            const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    return JSON.parse(jsonMatch[0]);
                } catch (e) {
                    console.warn('[AIModelSelector] JSON parse error:', e);
                }
            }

            // Try direct parse
            try {
                return JSON.parse(cleaned);
            } catch (e) {
                console.warn('[AIModelSelector] Final JSON parse failed:', e);
                return { raw: text };
            }
        }
    }

    // ============================================
    // EXPORT
    // ============================================

    window.AIModelSelector = new AIModelSelector();
    window.SELECTABLE_AI_MODELS = SELECTABLE_MODELS;

    console.log(`🎛️ AI Model Selector loaded - v${VERSION}`);
    console.log(`   Default model: ${window.AIModelSelector.selectedModel}`);

})();
