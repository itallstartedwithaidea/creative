/**
 * Advanced Video Creative Intelligence UI v2.3
 * Comprehensive UI rendering for paid media video analysis
 * Version: 2.3.0 - January 17, 2026
 * 
 * NEW IN v2.3:
 * - Extraction status display with confidence levels
 * - Evidence source citations for all scores
 * - Upload fallback UI when URL extraction fails
 * - Clear distinction between verified and inferred insights
 * - Limitations disclosure
 * 
 * NEW IN v2.2: Industry benchmarks, strategic insights, ad copy, competitor comparison
 */

(function() {
    'use strict';

    const VERSION = '2.3.0';

    // Grade color mapping
    const GRADE_COLORS = {
        'A+': '#22c55e', 'A': '#22c55e', 'A-': '#34d399',
        'B+': '#84cc16', 'B': '#a3e635', 'B-': '#bef264',
        'C+': '#eab308', 'C': '#facc15', 'C-': '#fde047',
        'D+': '#f97316', 'D': '#fb923c', 'D-': '#fdba74',
        'F': '#ef4444'
    };

    // Score color function
    function scoreColor(score) {
        if (score >= 80) return '#22c55e';
        if (score >= 70) return '#84cc16';
        if (score >= 60) return '#eab308';
        if (score >= 50) return '#f97316';
        return '#ef4444';
    }

    // Confidence colors
    const CONFIDENCE_COLORS = {
        HIGH: '#22c55e',
        MEDIUM: '#eab308',
        LOW: '#f97316',
        UNAVAILABLE: '#6b7280'
    };

    const CONFIDENCE_LABELS = {
        HIGH: { label: 'Full Analysis', icon: '████████████', tooltip: 'Based on verified video content' },
        MEDIUM: { label: 'Partial Analysis', icon: '████████░░░░', tooltip: 'Some content could not be verified' },
        LOW: { label: 'Limited Analysis', icon: '████░░░░░░░░', tooltip: 'Analysis based on metadata only' },
        UNAVAILABLE: { label: 'Not Available', icon: '░░░░░░░░░░░░', tooltip: 'Content not accessible' }
    };

    // Render the complete analysis
    function render(analysis) {
        if (!analysis) return '<div style="color:#ef4444;padding:20px;">No analysis data</div>';

        // Check if extraction failed - show upload prompt
        if (analysis.status === 'extraction_failed' || analysis.promptUpload) {
            return renderUploadPrompt(analysis);
        }

        return `
            <div class="vid-analysis-v2" style="--primary: #8b5cf6; --success: #22c55e; --warning: #eab308; --danger: #ef4444;">
                <style>
                    .vid-analysis-v2 { color: #e2e8f0; font-family: system-ui, -apple-system, sans-serif; }
                    .vid-analysis-v2 * { box-sizing: border-box; }
                    .vid-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px; margin-bottom: 20px; }
                    .vid-card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); }
                    .vid-card-header h3 { margin: 0; font-size: 16px; font-weight: 600; color: #fff; }
                    .vid-card-header .icon { font-size: 20px; }
                    .vid-grid { display: grid; gap: 16px; }
                    .vid-grid-2 { grid-template-columns: repeat(2, 1fr); }
                    .vid-grid-3 { grid-template-columns: repeat(3, 1fr); }
                    .vid-grid-4 { grid-template-columns: repeat(4, 1fr); }
                    .vid-score-pill { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }
                    .vid-mini-card { background: rgba(0,0,0,0.3); padding: 16px; border-radius: 12px; text-align: center; }
                    .vid-progress-bar { height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; }
                    .vid-progress-fill { height: 100%; border-radius: 4px; transition: width 0.5s ease; }
                    .vid-tabs { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
                    .vid-tab { padding: 8px 16px; border-radius: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; cursor: pointer; font-size: 13px; transition: all 0.2s; }
                    .vid-tab:hover { background: rgba(139,92,246,0.2); color: #fff; }
                    .vid-tab.active { background: rgba(139,92,246,0.3); border-color: rgba(139,92,246,0.5); color: #fff; }
                    .vid-tab-content { display: none; }
                    .vid-tab-content.active { display: block; }
                    .vid-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
                    .vid-badge-high { background: rgba(239,68,68,0.2); color: #f87171; }
                    .vid-badge-medium { background: rgba(234,179,8,0.2); color: #fbbf24; }
                    .vid-badge-low { background: rgba(34,197,94,0.2); color: #4ade80; }
                    .vid-list { list-style: none; padding: 0; margin: 0; }
                    .vid-list li { padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; }
                    .vid-list li:last-child { border-bottom: none; }
                    .vid-evidence-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 6px; background: rgba(139,92,246,0.2); border-radius: 4px; font-size: 10px; color: #a78bfa; }
                    .vid-confidence-bar { font-family: monospace; font-size: 10px; letter-spacing: -1px; }
                    @media (max-width: 768px) {
                        .vid-grid-2, .vid-grid-3, .vid-grid-4 { grid-template-columns: 1fr; }
                    }
                </style>

                ${renderExtractionStatus(analysis)}
                ${renderCloudinaryAIData(analysis)}
                ${renderExecutiveSummary(analysis)}
                ${renderBenchmarkComparison(analysis)}
                ${renderHookAnalysis(analysis.hookAnalysis)}
                ${renderRetentionAnalysis(analysis.retentionAnalysis)}
                ${renderSoundOffAnalysis(analysis.soundOffAnalysis)}
                ${renderPlatformAnalysis(analysis.platformAnalysis || analysis.platformFit)}
                ${renderStrategicInsights(analysis)}
                ${renderFunnelAnalysis(analysis.funnelAnalysis)}
                ${renderAudienceIntelligence(analysis.audienceIntelligence)}
                ${renderPerformancePredictions(analysis.performancePredictions)}
                ${renderAdCopySuggestions(analysis.adCopySuggestions)}
                ${renderCompetitorComparison(analysis.competitorComparison)}
                ${renderCreativeElements(analysis)}
                ${renderComplianceAccessibility(analysis)}
                ${renderRecommendations(analysis)}
                ${renderScoreEvidence(analysis)}
            </div>
        `;
    }

    // Upload prompt when extraction fails
    function renderUploadPrompt(analysis) {
        return `
            <div class="vid-analysis-v2">
                <div class="vid-card" style="background: linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(249,115,22,0.1) 100%); border-color: rgba(239,68,68,0.3);">
                    <div style="text-align: center; padding: 40px 20px;">
                        <div style="margin-bottom: 20px;"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
                        <h2 style="color: #fff; margin: 0 0 12px; font-size: 24px;">Unable to Access Video Content</h2>
                        <p style="color: #94a3b8; margin: 0 0 24px; max-width: 500px; margin-left: auto; margin-right: auto;">
                            ${analysis.error || 'We couldn\'t extract the video content from this URL. This could be due to privacy settings, regional restrictions, or platform limitations.'}
                        </p>
                        
                        <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 24px; max-width: 400px; margin: 0 auto;">
                            <h3 style="color: #fff; margin: 0 0 16px; font-size: 16px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:6px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Upload Video for Full Analysis</h3>
                            <p style="color: #94a3b8; font-size: 13px; margin: 0 0 16px;">
                                Upload your video file directly and we'll perform a complete analysis with frame extraction, visual hooks, and more.
                            </p>
                            <div id="video-upload-dropzone" style="border: 2px dashed rgba(139,92,246,0.5); border-radius: 12px; padding: 32px; cursor: pointer; transition: all 0.2s;">
                                <input type="file" id="video-file-upload" accept="video/*" style="display: none;">
                                <div style="margin-bottom: 8px;"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg></div>
                                <div style="color: #a78bfa; font-weight: 500;">Drop video here or click to upload</div>
                                <div style="color: #64748b; font-size: 12px; margin-top: 4px;">MP4, MOV, WebM • Max 500MB</div>
                            </div>
                        </div>
                        
                        <div style="margin-top: 24px; padding: 16px; background: rgba(139,92,246,0.1); border-radius: 8px; max-width: 500px; margin-left: auto; margin-right: auto;">
                            <h4 style="color: #a78bfa; margin: 0 0 8px; font-size: 13px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>Alternatively, try a different URL format:</h4>
                            <ul style="color: #94a3b8; font-size: 12px; text-align: left; margin: 0; padding-left: 20px;">
                                <li>Use the full video URL (not shortened links)</li>
                                <li>For YouTube: https://www.youtube.com/watch?v=VIDEO_ID</li>
                                <li>For TikTok: https://www.tiktok.com/@user/video/VIDEO_ID</li>
                                <li>Ensure the video is publicly accessible</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Extraction status display
    function renderExtractionStatus(analysis) {
        const extraction = analysis.extraction;
        if (!extraction || !extraction.tier) return '';

        const confidence = extraction.confidence || 'MEDIUM';
        const confColor = CONFIDENCE_COLORS[confidence] || CONFIDENCE_COLORS.MEDIUM;
        const confLabel = CONFIDENCE_LABELS[confidence] || CONFIDENCE_LABELS.MEDIUM;
        
        // Count extracted assets
        const assets = extraction.assets || {};
        const extractedCount = Object.keys(assets).length;
        const assetNames = Object.keys(assets);

        // Check for limitations
        const limitations = extraction.limitations || [];
        const hasLimitations = limitations.length > 0;

        // Don't show for TIER_1_FULL with no limitations
        if (extraction.tier === 'TIER_1_FULL' && !hasLimitations && !extraction.warning) {
            return '';
        }

        return `
            <div class="vid-card" style="background: ${confidence === 'HIGH' ? 'rgba(34,197,94,0.1)' : confidence === 'MEDIUM' ? 'rgba(234,179,8,0.1)' : 'rgba(249,115,22,0.1)'}; border-color: ${confColor}40;">
                <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                            <span style="font-size: 20px;">${confidence === 'HIGH' ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' : confidence === 'MEDIUM' ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'}</span>
                            <h3 style="margin: 0; color: #fff; font-size: 15px;">Analysis Confidence: <span style="color: ${confColor}">${confLabel.label}</span></h3>
                        </div>
                        <p style="margin: 0 0 12px; color: #94a3b8; font-size: 13px;">
                            ${confLabel.tooltip}
                        </p>
                        
                        <!-- Confidence bar -->
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                            <span class="vid-confidence-bar" style="color: ${confColor};">${confLabel.icon}</span>
                            <span style="color: #64748b; font-size: 11px;">Extraction Tier: ${extraction.tier?.replace('TIER_', '').replace('_', ' ')}</span>
                        </div>
                        
                        <!-- Extracted assets -->
                        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                            ${assetNames.map(asset => `
                                <span class="vid-evidence-badge">
                                    ${asset} ${assets[asset]?.count ? `(${assets[asset].count})` : ''}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                    
                    ${hasLimitations ? `
                    <div style="flex: 1; min-width: 250px; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 8px;">
                        <div style="color: #fbbf24; font-size: 11px; font-weight: 600; margin-bottom: 8px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>Analysis Limitations</div>
                        ${limitations.map(l => `
                            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">
                                • ${l.impact || l.type}
                                ${l.recommendation ? `<br><span style="color: #60a5fa; margin-left: 12px;">→ ${l.recommendation}</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}
                </div>
                
                ${extraction.warning ? `
                <div style="margin-top: 12px; padding: 10px 12px; background: rgba(234,179,8,0.15); border-radius: 6px; font-size: 12px; color: #fbbf24;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>${extraction.warning}
                </div>
                ` : ''}
            </div>
        `;
    }

    // Cloudinary AI extracted data (OCR, Auto-Tags, Content Analysis)
    function renderCloudinaryAIData(analysis) {
        const ocrText = analysis.extractedText || analysis.serverExtraction?.extractedText || [];
        const autoTags = analysis.autoTags || analysis.serverExtraction?.autoTags || [];
        const contentAnalysis = analysis.contentAnalysis || analysis.serverExtraction?.contentAnalysis || [];
        
        // Only show if we have Cloudinary AI data
        if (ocrText.length === 0 && autoTags.length === 0 && contentAnalysis.length === 0) {
            return '';
        }

        // Deduplicate tags
        const uniqueTags = [...new Set(autoTags.map(t => t.tag || t))].slice(0, 15);

        return `
            <div class="vid-card" style="background: linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(59,130,246,0.1) 100%);">
                <div class="vid-card-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2">
                        <path d="M2 12l5 5L22 2"/>
                    </svg>
                    <h3>AI Visual Intelligence (Cloudinary)</h3>
                    <span style="margin-left: auto; font-size: 10px; color: #a78bfa; background: rgba(139,92,246,0.2); padding: 4px 8px; border-radius: 4px;">OCR + Auto-Tagging</span>
                </div>
                
                ${ocrText.length > 0 ? `
                <div style="margin-bottom: 16px;">
                    <div style="color: #a78bfa; font-size: 12px; font-weight: 600; margin-bottom: 8px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px;"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>
                        On-Screen Text (OCR Extracted)
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${ocrText.slice(0, 5).map(item => `
                            <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; border-left: 3px solid #a78bfa;">
                                <div style="color: #64748b; font-size: 10px; margin-bottom: 4px;">${item.frameLabel || 'Frame'}</div>
                                <div style="color: #e2e8f0; font-size: 14px;">"${item.text}"</div>
                                ${item.confidence ? `<div style="color: #4ade80; font-size: 10px; margin-top: 4px;">Confidence: ${Math.round(item.confidence * 100)}%</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${uniqueTags.length > 0 ? `
                <div style="margin-bottom: 16px;">
                    <div style="color: #60a5fa; font-size: 12px; font-weight: 600; margin-bottom: 8px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px;"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                        Auto-Detected Visual Elements
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                        ${uniqueTags.map(tag => `
                            <span style="background: rgba(59,130,246,0.2); color: #93c5fd; padding: 4px 10px; border-radius: 12px; font-size: 12px;">
                                ${tag}
                            </span>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${contentAnalysis.length > 0 ? `
                <div>
                    <div style="color: #4ade80; font-size: 12px; font-weight: 600; margin-bottom: 8px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px;"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                        Frame Analysis
                    </div>
                    <div class="vid-grid vid-grid-3" style="gap: 10px;">
                        ${contentAnalysis.slice(0, 3).map(item => `
                            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px; text-align: center;">
                                <div style="color: #64748b; font-size: 10px; margin-bottom: 6px;">${item.frameLabel || 'Frame'}</div>
                                <div style="color: #fff; font-size: 13px; font-weight: 500;">
                                    ${item.faces > 0 ? `<span style="margin-right: 8px;">👤 ${item.faces} face${item.faces > 1 ? 's' : ''}</span>` : ''}
                                    ${item.width ? `${item.width}×${item.height}` : ''}
                                </div>
                                ${item.predominantColors?.dominant ? `
                                <div style="display: flex; justify-content: center; gap: 4px; margin-top: 6px;">
                                    ${Object.entries(item.predominantColors.dominant || {}).slice(0, 3).map(([color, pct]) => `
                                        <div style="width: 16px; height: 16px; background: ${color}; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2);" title="${color}: ${pct}%"></div>
                                    `).join('')}
                                </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    }

    // Score evidence transparency
    function renderScoreEvidence(analysis) {
        // Build evidence from analysis if not already present
        const evidence = analysis.scoreEvidence || buildEvidenceFromAnalysis(analysis);
        if (!evidence || !evidence.scores) return '';

        return `
            <div class="vid-card" style="margin-top: 20px;">
                <div class="vid-card-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                    <h3>Analysis Evidence & Sources</h3>
                    <span style="margin-left: auto; font-size: 11px; color: #64748b; background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 4px;">Transparency Report</span>
                </div>
                
                <p style="color: #94a3b8; font-size: 13px; margin: 0 0 16px;">
                    Every score is tied to verified extracted content. Scores marked as "inferred" are based on limited data.
                </p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px;">
                    ${Object.entries(evidence.scores || {}).map(([dim, data]) => `
                        <div style="padding: 12px; background: rgba(0,0,0,0.2); border-radius: 8px; ${data.isInferred ? 'border: 1px dashed rgba(234,179,8,0.3);' : ''}">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                <span style="color: #fff; font-size: 12px; font-weight: 500; text-transform: capitalize;">${dim}</span>
                                <span style="font-size: 18px; font-weight: 700; color: ${scoreColor(data.score || 0)};">${data.score || 0}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
                                <span class="vid-confidence-bar" style="color: ${CONFIDENCE_COLORS[data.confidence] || '#64748b'}; font-size: 8px;">${CONFIDENCE_LABELS[data.confidence]?.icon || '░░░░░░░░░░░░'}</span>
                                <span style="font-size: 9px; color: ${CONFIDENCE_COLORS[data.confidence] || '#64748b'};">${data.confidence || 'MEDIUM'}</span>
                            </div>
                            ${data.isInferred ? '<div style="font-size: 9px; color: #fbbf24;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:2px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Inferred (limited data)</div>' : ''}
                            <div style="font-size: 9px; color: #64748b; margin-top: 4px;">
                                Sources: ${(data.evidenceSources || ['metadata', 'thumbnail', 'ai_vision']).map(s => typeof s === 'object' ? s.type : s).join(', ')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Helper to build evidence from analysis if scoreEvidence is missing
    function buildEvidenceFromAnalysis(analysis) {
        const dimensions = {
            hook: { 
                paths: ['hookAnalysis.overall_hook_score', 'hookAnalysis.score', 'hook.score'],
                confidence: analysis.extraction?.assets?.frames ? 'HIGH' : 'MEDIUM'
            },
            retention: { 
                paths: ['retentionAnalysis.retention_score', 'retentionAnalysis.score', 'retention.score'],
                confidence: 'HIGH'
            },
            soundOff: { 
                paths: ['soundOffAnalysis.sound_off_score', 'soundOffAnalysis.score', 'soundOff.score'],
                confidence: analysis.extraction?.assets?.frames ? 'HIGH' : 'MEDIUM'
            },
            platform: { 
                paths: ['platformFit.platform_score', 'platformAnalysis.score', 'platform.score'],
                confidence: 'HIGH'
            },
            cta: { 
                paths: ['ctaAnalysis.cta_effectiveness_score', 'messageAnalysis.cta_score', 'cta.score'],
                confidence: analysis.extraction?.assets?.transcript ? 'HIGH' : 'MEDIUM'
            },
            narrative: { 
                paths: ['narrativeAnalysis.narrative_score', 'narrative.score'],
                confidence: 'MEDIUM'
            },
            emotional: { 
                paths: ['emotionalJourney.emotional_journey_score', 'emotional.score'],
                confidence: 'HIGH'
            },
            messaging: { 
                paths: ['messageAnalysis.clarity_score', 'messaging.score'],
                confidence: analysis.extraction?.assets?.transcript ? 'HIGH' : 'MEDIUM'
            },
            compliance: { 
                paths: ['complianceAnalysis.compliance_score', 'compliance.score'],
                confidence: 'HIGH'
            }
        };

        const scores = {};
        for (const [dim, config] of Object.entries(dimensions)) {
            let score = 0;
            for (const path of config.paths) {
                const parts = path.split('.');
                let val = analysis;
                for (const part of parts) {
                    val = val?.[part];
                }
                if (typeof val === 'number') {
                    score = val;
                    break;
                }
            }
            scores[dim] = {
                score,
                confidence: score > 0 ? config.confidence : 'LOW',
                isInferred: score === 0,
                evidenceSources: ['metadata', 'thumbnail', 'ai_vision']
            };
        }

        return { scores };
    }

    // Executive Summary
    function renderExecutiveSummary(analysis) {
        const summary = analysis.executiveSummary || {};
        const score = analysis.overallScore || 0;
        const grade = summary.grade || 'N/A';
        const gradeColor = GRADE_COLORS[grade] || '#fff';

        return `
            <div class="vid-card" style="background: linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(59,130,246,0.1) 100%);">
                <div style="text-align: center; padding: 20px 0;">
                    <div style="font-size: 80px; font-weight: 800; color: ${gradeColor}; line-height: 1;">${grade}</div>
                    <div style="font-size: 56px; font-weight: 600; color: #fff; margin: 8px 0;">${score}/100</div>
                    <div style="color: #94a3b8; font-size: 14px; text-transform: capitalize; margin-bottom: 16px;">
                        ${(summary.launch_recommendation || 'analyzing').replace(/_/g, ' ')}
                    </div>
                    <div style="display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;">
                        <span class="vid-badge" style="background: rgba(139,92,246,0.2); color: #a78bfa;">
                            ${analysis.platform || 'Video'} Analysis
                        </span>
                        <span class="vid-badge" style="background: rgba(59,130,246,0.2); color: #60a5fa;">
                            v${VERSION}
                        </span>
                    </div>
                </div>

                <!-- Score Grid -->
                <div class="vid-grid vid-grid-3" style="margin-top: 24px;">
                    ${renderMiniScore('Hook', summary.scoreboard?.hook)}
                    ${renderMiniScore('Retention', summary.scoreboard?.retention)}
                    ${renderMiniScore('Sound-Off', summary.scoreboard?.sound_off)}
                    ${renderMiniScore('Platform', summary.scoreboard?.platform_fit)}
                    ${renderMiniScore('CTA', summary.scoreboard?.cta)}
                    ${renderMiniScore('Narrative', summary.scoreboard?.narrative)}
                    ${renderMiniScore('Emotional', summary.scoreboard?.emotional)}
                    ${renderMiniScore('Messaging', summary.scoreboard?.messaging)}
                    ${renderMiniScore('Compliance', summary.scoreboard?.compliance)}
                </div>

                <!-- Strengths & Improvements -->
                <div class="vid-grid vid-grid-2" style="margin-top: 20px;">
                    <div style="background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2); border-radius: 12px; padding: 16px;">
                        <h4 style="color: #4ade80; margin: 0 0 12px; font-size: 14px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Top Strengths</h4>
                        ${(summary.top_strengths || []).map(s => `<div style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">• ${s}</div>`).join('') || '<div style="color:#64748b;">Analyzing...</div>'}
                    </div>
                    <div style="background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.2); border-radius: 12px; padding: 16px;">
                        <h4 style="color: #fb923c; margin: 0 0 12px; font-size: 14px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>Top Improvements</h4>
                        ${(summary.top_improvements || []).map(i => `<div style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">• ${i}</div>`).join('') || '<div style="color:#64748b;">Analyzing...</div>'}
                    </div>
                </div>
            </div>
        `;
    }

    function renderMiniScore(label, score) {
        const s = score || 0;
        return `
            <div class="vid-mini-card">
                <div style="font-size: 28px; font-weight: 700; color: ${scoreColor(s)};">${s}</div>
                <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">${label}</div>
            </div>
        `;
    }

    // Hook Analysis
    function renderHookAnalysis(hook) {
        if (!hook || !hook.overall_hook_score) return '';

        return `
            <div class="vid-card">
                <div class="vid-card-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                    <h3>Hook Analysis (0-3 Seconds)</h3>
                    <span class="vid-score-pill" style="margin-left: auto; background: ${scoreColor(hook.overall_hook_score)}20; color: ${scoreColor(hook.overall_hook_score)};">
                        ${hook.overall_hook_score}/100
                    </span>
                </div>

                <div style="margin-bottom: 16px; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 8px;">
                    <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
                        <div>
                            <span style="color: #94a3b8; font-size: 12px;">Primary Hook Type:</span>
                            <div style="color: #a78bfa; font-weight: 600; text-transform: capitalize;">${(hook.primary_hook_type || '').replace(/_/g, ' ')}</div>
                        </div>
                        ${hook.secondary_hook_type ? `
                        <div>
                            <span style="color: #94a3b8; font-size: 12px;">Secondary:</span>
                            <div style="color: #60a5fa; text-transform: capitalize;">${hook.secondary_hook_type.replace(/_/g, ' ')}</div>
                        </div>
                        ` : ''}
                        <div style="margin-left: auto;">
                            <span style="color: #94a3b8; font-size: 12px;">Percentile:</span>
                            <div style="color: #22c55e;">${hook.hook_score_percentile || 'Analyzing...'}</div>
                        </div>
                    </div>
                </div>

                <div class="vid-grid vid-grid-4" style="margin-bottom: 16px;">
                    ${renderHookComponent('Visual', hook.visual_hook?.score, hook.visual_hook?.max_possible || 30, '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>')}
                    ${renderHookComponent('Audio', hook.audio_hook?.score, hook.audio_hook?.max_possible || 25, '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>')}
                    ${renderHookComponent('Text', hook.text_hook?.score, hook.text_hook?.max_possible || 25, '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>')}
                    ${renderHookComponent('Curiosity', hook.curiosity_gap?.score, hook.curiosity_gap?.max_possible || 20, '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>')}
                </div>

                <!-- Hook Details -->
                <div class="vid-grid vid-grid-2">
                    ${hook.visual_hook ? `
                    <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;">
                        <div style="color: #a78bfa; font-size: 12px; font-weight: 600; margin-bottom: 8px;">Visual Hook Details</div>
                        <div style="font-size: 11px; color: #94a3b8; line-height: 1.5;">
                            ${hook.visual_hook.key_strength ? `<div><strong style="color:#4ade80;">✓</strong> ${hook.visual_hook.key_strength}</div>` : ''}
                            ${hook.visual_hook.key_weakness ? `<div><strong style="color:#f87171;">✗</strong> ${hook.visual_hook.key_weakness}</div>` : ''}
                            ${hook.visual_hook.face_present ? `<div>Face present: ${hook.visual_hook.face_details?.expression || 'Yes'}</div>` : ''}
                        </div>
                    </div>
                    ` : ''}
                    ${hook.audio_hook ? `
                    <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;">
                        <div style="color: #60a5fa; font-size: 12px; font-weight: 600; margin-bottom: 8px;">Audio Hook Details</div>
                        <div style="font-size: 11px; color: #94a3b8; line-height: 1.5;">
                            ${hook.audio_hook.opening_line ? `<div>Opening: "${hook.audio_hook.opening_line}"</div>` : ''}
                            ${hook.audio_hook.time_to_first_word ? `<div>First word at: ${hook.audio_hook.time_to_first_word}s</div>` : ''}
                            ${hook.audio_hook.first_sound_type ? `<div>First sound: ${hook.audio_hook.first_sound_type}</div>` : ''}
                        </div>
                    </div>
                    ` : ''}
                </div>

                <!-- Platform Hook Grades -->
                ${hook.platform_hook_grades ? `
                <div style="margin-top: 16px;">
                    <div style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">Platform Hook Grades</div>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        ${Object.entries(hook.platform_hook_grades).map(([platform, data]) => `
                            <div style="background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 8px; text-align: center; min-width: 80px;">
                                <div style="font-size: 18px; font-weight: 700; color: ${scoreColor(data.score || 0)};">${data.grade}</div>
                                <div style="font-size: 10px; color: #64748b; text-transform: capitalize;">${platform.replace(/_/g, ' ')}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    }

    function renderHookComponent(label, score, max, icon) {
        const s = score || 0;
        const pct = max ? Math.round((s / max) * 100) : 0;
        return `
            <div class="vid-mini-card">
                <div style="font-size: 16px; margin-bottom: 4px;">${icon}</div>
                <div style="font-size: 20px; font-weight: 700; color: ${scoreColor(pct)};">${s}/${max}</div>
                <div style="font-size: 10px; color: #64748b;">${label}</div>
            </div>
        `;
    }

    // Retention Analysis
    function renderRetentionAnalysis(retention) {
        if (!retention || !retention.overall_retention_score) return '';

        return `
            <div class="vid-card">
                <div class="vid-card-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                    <h3>Retention Architecture</h3>
                    <span class="vid-score-pill" style="margin-left: auto; background: ${scoreColor(retention.overall_retention_score)}20; color: ${scoreColor(retention.overall_retention_score)};">
                        ${retention.overall_retention_score}/100
                    </span>
                </div>

                <!-- Predicted Completion Rates -->
                ${retention.predicted_completion_rates ? `
                <div class="vid-grid vid-grid-3" style="margin-bottom: 16px;">
                    ${Object.entries(retention.predicted_completion_rates).filter(([k]) => !k.includes('benchmark')).map(([platform, rate]) => `
                        <div class="vid-mini-card">
                            <div style="font-size: 22px; font-weight: 700; color: #22c55e;">${rate}</div>
                            <div style="font-size: 10px; color: #64748b; text-transform: capitalize;">${platform.replace(/_/g, ' ')} Completion</div>
                        </div>
                    `).join('')}
                </div>
                ` : ''}

                <!-- Structure Pattern -->
                <div style="background: rgba(139,92,246,0.1); padding: 12px; border-radius: 8px; margin-bottom: 16px;">
                    <div style="color: #a78bfa; font-size: 12px; font-weight: 600;">Structural Pattern</div>
                    <div style="color: #fff; font-size: 14px; text-transform: capitalize;">${(retention.structural_pattern || '').replace(/_/g, ' ')}</div>
                    ${retention.structural_pattern_description ? `<div style="color: #94a3b8; font-size: 11px; margin-top: 4px;">${retention.structural_pattern_description}</div>` : ''}
                </div>

                <!-- Critical Drop-Off Points -->
                ${retention.critical_drop_off_points && retention.critical_drop_off_points.length > 0 ? `
                <div style="margin-top: 16px;">
                    <div style="color: #f87171; font-size: 12px; font-weight: 600; margin-bottom: 8px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>Critical Drop-Off Points</div>
                    ${retention.critical_drop_off_points.map(point => `
                        <div style="background: rgba(239,68,68,0.1); border-left: 3px solid #ef4444; padding: 10px 12px; margin-bottom: 8px; border-radius: 0 8px 8px 0;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                <span style="color: #fff; font-weight: 600;">At ${point.timestamp}s</span>
                                <span class="vid-badge vid-badge-${point.risk_level}">${point.risk_level}</span>
                            </div>
                            <div style="color: #94a3b8; font-size: 12px;">${point.description}</div>
                            <div style="color: #f87171; font-size: 11px; margin-top: 4px;">Est. loss: ${point.predicted_loss}</div>
                        </div>
                    `).join('')}
                </div>
                ` : ''}

                <!-- Retention Curve -->
                ${retention.retention_curve_data ? renderRetentionCurve(retention.retention_curve_data) : ''}
            </div>
        `;
    }

    function renderRetentionCurve(data) {
        if (!data || data.length === 0) return '';
        
        const maxSecond = Math.max(...data.map(d => d.second));
        const width = 100;
        const height = 60;

        const points = data.map(d => {
            const x = (d.second / maxSecond) * width;
            const y = height - (d.predicted_retention / 100) * height;
            return `${x},${y}`;
        }).join(' ');

        return `
            <div style="margin-top: 16px;">
                <div style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">Predicted Retention Curve</div>
                <div style="background: rgba(0,0,0,0.3); padding: 16px; border-radius: 8px;">
                    <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: 80px;">
                        <defs>
                            <linearGradient id="retentionGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.3"/>
                                <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/>
                            </linearGradient>
                        </defs>
                        <polygon points="0,${height} ${points} ${width},${height}" fill="url(#retentionGrad)"/>
                        <polyline points="${points}" fill="none" stroke="#8b5cf6" stroke-width="2"/>
                    </svg>
                    <div style="display: flex; justify-content: space-between; font-size: 10px; color: #64748b; margin-top: 4px;">
                        <span>0s</span>
                        <span>${maxSecond}s</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Sound-Off Analysis
    function renderSoundOffAnalysis(soundOff) {
        if (!soundOff || !soundOff.sound_off_score) return '';

        return `
            <div class="vid-card">
                <div class="vid-card-header">
                    <span class="icon">🔇</span>
                    <h3>Sound-Off Effectiveness</h3>
                    <span class="vid-score-pill" style="margin-left: auto; background: ${scoreColor(soundOff.sound_off_score)}20; color: ${scoreColor(soundOff.sound_off_score)};">
                        ${soundOff.sound_off_score}/100
                    </span>
                </div>

                <div style="background: rgba(234,179,8,0.1); padding: 12px; border-radius: 8px; margin-bottom: 16px;">
                    <div style="color: #fbbf24; font-size: 12px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>85% of Meta/Instagram videos start muted</div>
                </div>

                <div class="vid-grid vid-grid-2">
                    ${soundOff.visual_storytelling ? `
                    <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #a78bfa; font-size: 12px; font-weight: 600;">Visual Storytelling</span>
                            <span style="color: ${scoreColor((soundOff.visual_storytelling.score / soundOff.visual_storytelling.max) * 100)};">${soundOff.visual_storytelling.score}/${soundOff.visual_storytelling.max}</span>
                        </div>
                        <div style="font-size: 11px; color: #94a3b8;">
                            <div>Message clarity muted: <span style="text-transform: capitalize;">${soundOff.visual_storytelling.message_clarity_muted}</span></div>
                            <div>Visual demo: ${soundOff.visual_storytelling.visual_demo_present ? '✓' : '✗'}</div>
                        </div>
                    </div>
                    ` : ''}
                    
                    ${soundOff.caption_analysis ? `
                    <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #60a5fa; font-size: 12px; font-weight: 600;">Captions</span>
                            <span style="color: ${scoreColor((soundOff.caption_analysis.score / soundOff.caption_analysis.max) * 100)};">${soundOff.caption_analysis.score}/${soundOff.caption_analysis.max}</span>
                        </div>
                        <div style="font-size: 11px; color: #94a3b8;">
                            <div>Present: ${soundOff.caption_analysis.captions_present ? '✓' : '✗'}</div>
                            <div>Reading speed: ${soundOff.caption_analysis.reading_speed_wpm || 'N/A'} WPM</div>
                        </div>
                    </div>
                    ` : ''}
                </div>

                ${soundOff.platform_sound_off_grades ? `
                <div style="margin-top: 16px;">
                    <div style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">Platform Sound-Off Grades</div>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        ${Object.entries(soundOff.platform_sound_off_grades).map(([platform, data]) => `
                            <div style="background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 8px; text-align: center; min-width: 80px;">
                                <div style="font-size: 18px; font-weight: 700; color: ${scoreColor(data.score || 0)};">${data.grade}</div>
                                <div style="font-size: 10px; color: #64748b; text-transform: capitalize;">${platform.replace(/_/g, ' ')}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    }

    // Platform Analysis
    function renderPlatformAnalysis(platformData) {
        if (!platformData || !platformData.platform_analysis) return '';

        const platforms = platformData.platform_analysis;
        const icons = {
            youtube_instream: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>', 
            youtube_shorts: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>', 
            tiktok: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
            meta_feed: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>', 
            meta_stories_reels: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>', 
            linkedin: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>'
        };

        return `
            <div class="vid-card">
                <div class="vid-card-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                    <h3>Platform Performance Prediction</h3>
                </div>

                ${platformData.best_platform ? `
                <div style="display: flex; gap: 16px; margin-bottom: 16px;">
                    <div style="flex: 1; background: rgba(34,197,94,0.1); padding: 12px; border-radius: 8px; text-align: center;">
                        <div style="color: #4ade80; font-size: 11px; font-weight: 600;">BEST FIT</div>
                        <div style="color: #fff; font-size: 14px; text-transform: capitalize;">${platformData.best_platform.replace(/_/g, ' ')}</div>
                    </div>
                    <div style="flex: 1; background: rgba(239,68,68,0.1); padding: 12px; border-radius: 8px; text-align: center;">
                        <div style="color: #f87171; font-size: 11px; font-weight: 600;">WEAKEST FIT</div>
                        <div style="color: #fff; font-size: 14px; text-transform: capitalize;">${platformData.worst_platform?.replace(/_/g, ' ') || 'N/A'}</div>
                    </div>
                </div>
                ` : ''}

                <div class="vid-grid vid-grid-3">
                    ${Object.entries(platforms).map(([key, data]) => `
                        <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: 12px;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                                <span style="font-size: 20px;">${icons[key] || '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>'}</span>
                                <span style="color: #fff; font-size: 12px; text-transform: capitalize;">${key.replace(/_/g, ' ')}</span>
                            </div>
                            <div style="font-size: 32px; font-weight: 700; color: ${scoreColor(data.overall_score || 0)}; margin-bottom: 8px;">
                                ${data.overall_score || 0}
                            </div>
                            ${data.predicted_metrics ? `
                            <div style="font-size: 10px; color: #94a3b8; line-height: 1.6;">
                                ${Object.entries(data.predicted_metrics).slice(0, 3).map(([k, v]) => `
                                    <div>${k.replace(/_/g, ' ')}: <span style="color: #fff;">${v}</span></div>
                                `).join('')}
                            </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Funnel Analysis
    function renderFunnelAnalysis(funnel) {
        if (!funnel || !funnel.primary_funnel_position) return '';

        const funnelColors = { tofu: '#8b5cf6', mofu: '#3b82f6', bofu: '#22c55e' };

        return `
            <div class="vid-card">
                <div class="vid-card-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                    <h3>Funnel Position Classification</h3>
                </div>

                <div style="display: flex; gap: 16px; margin-bottom: 16px;">
                    <div style="flex: 1; background: ${funnelColors[funnel.primary_funnel_position]}20; border: 1px solid ${funnelColors[funnel.primary_funnel_position]}40; padding: 16px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 11px; color: #94a3b8;">Primary Position</div>
                        <div style="font-size: 24px; font-weight: 700; color: ${funnelColors[funnel.primary_funnel_position]}; text-transform: uppercase;">${funnel.primary_funnel_position}</div>
                    </div>
                    ${funnel.secondary_funnel_position ? `
                    <div style="flex: 1; background: rgba(0,0,0,0.2); padding: 16px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 11px; color: #94a3b8;">Secondary Position</div>
                        <div style="font-size: 24px; font-weight: 700; color: #fff; text-transform: uppercase;">${funnel.secondary_funnel_position}</div>
                    </div>
                    ` : ''}
                </div>

                <!-- Signal Strength -->
                ${funnel.signal_strength ? `
                <div style="margin-bottom: 16px;">
                    <div style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">Signal Strength</div>
                    ${Object.entries(funnel.signal_strength).map(([stage, strength]) => `
                        <div style="margin-bottom: 6px;">
                            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
                                <span style="color: #94a3b8; text-transform: uppercase;">${stage}</span>
                                <span style="color: #fff;">${strength}%</span>
                            </div>
                            <div class="vid-progress-bar">
                                <div class="vid-progress-fill" style="width: ${strength}%; background: ${funnelColors[stage]};"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                ` : ''}

                <!-- Audience Alignment -->
                ${funnel.alignment_assessment ? `
                <div class="vid-grid vid-grid-3">
                    ${Object.entries(funnel.alignment_assessment).map(([audience, data]) => `
                        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 11px; color: #94a3b8; text-transform: capitalize; margin-bottom: 4px;">${audience.replace(/_/g, ' ')}</div>
                            <div style="color: ${data.rating === 'excellent' ? '#22c55e' : data.rating === 'good' ? '#84cc16' : data.rating === 'poor' ? '#ef4444' : '#eab308'}; font-weight: 600; text-transform: capitalize;">${data.rating}</div>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
            </div>
        `;
    }

    // Audience Intelligence
    function renderAudienceIntelligence(audience) {
        if (!audience || !audience.primary_target_audience) return '';

        return `
            <div class="vid-card">
                <div class="vid-card-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <h3>Audience Intelligence</h3>
                </div>

                <div style="background: rgba(139,92,246,0.1); padding: 16px; border-radius: 12px; margin-bottom: 16px;">
                    <div style="color: #a78bfa; font-size: 12px; font-weight: 600; margin-bottom: 4px;">Primary Target Audience</div>
                    <div style="color: #fff; font-size: 14px; line-height: 1.5;">${audience.primary_target_audience.description}</div>
                </div>

                <div class="vid-grid vid-grid-2">
                    ${audience.demographic_profile ? `
                    <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: 12px;">
                        <div style="color: #60a5fa; font-size: 12px; font-weight: 600; margin-bottom: 8px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>Demographics</div>
                        <div style="font-size: 11px; color: #94a3b8; line-height: 1.8;">
                            ${Object.entries(audience.demographic_profile).map(([k, v]) => `
                                <div><span style="color: #64748b;">${k.replace(/_/g, ' ')}:</span> ${v}</div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                    
                    ${audience.psychographic_profile ? `
                    <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: 12px;">
                        <div style="color: #f472b6; font-size: 12px; font-weight: 600; margin-bottom: 8px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>Psychographics</div>
                        <div style="font-size: 11px; color: #94a3b8; line-height: 1.8;">
                            ${audience.psychographic_profile.primary_values ? `<div>Values: ${audience.psychographic_profile.primary_values.join(', ')}</div>` : ''}
                            ${audience.psychographic_profile.lifestyle_indicators ? `<div>Lifestyle: ${audience.psychographic_profile.lifestyle_indicators.join(', ')}</div>` : ''}
                            ${audience.psychographic_profile.pain_points_addressed ? `<div>Pain points: ${audience.psychographic_profile.pain_points_addressed.join(', ')}</div>` : ''}
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // Performance Predictions
    function renderPerformancePredictions(predictions) {
        if (!predictions) return '';

        // Extract metrics from various possible formats
        const hookRate = predictions.predicted_hook_rate || predictions.attention_metrics?.hook_rate || 'N/A';
        const completionRate = predictions.predicted_completion_rate || predictions.attention_metrics?.completion_rate || 'N/A';
        const ctr = predictions.predicted_ctr || predictions.efficiency_estimates?.ctr || 'N/A';
        const cvr = predictions.predicted_conversion_rate || 'N/A';
        const reasoning = predictions.reasoning || predictions.prediction_rationale || '';
        const vsBenchmark = predictions.vs_benchmark || {};
        const fatigue = predictions.fatigue_prediction || {};

        return `
            <div class="vid-card">
                <div class="vid-card-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2"><path d="M3 3v18h18"/><path d="M18 9l-5 5-4-4-4 4"/></svg>
                    <h3>Performance Predictions</h3>
                </div>

                <div class="vid-grid vid-grid-4" style="margin-bottom: 16px;">
                    <div class="vid-mini-card">
                        <div style="color: #22c55e; font-size: 20px; font-weight: 700;">${hookRate}</div>
                        <div style="font-size: 11px; color: #94a3b8;">Hook Rate</div>
                        ${vsBenchmark.hook_rate ? `<div style="font-size: 10px; color: ${vsBenchmark.hook_rate.includes('above') ? '#4ade80' : '#fbbf24'};">${vsBenchmark.hook_rate}</div>` : ''}
                    </div>
                    <div class="vid-mini-card">
                        <div style="color: #60a5fa; font-size: 20px; font-weight: 700;">${completionRate}</div>
                        <div style="font-size: 11px; color: #94a3b8;">Completion Rate</div>
                        ${vsBenchmark.completion_rate ? `<div style="font-size: 10px; color: ${vsBenchmark.completion_rate.includes('above') ? '#4ade80' : '#fbbf24'};">${vsBenchmark.completion_rate}</div>` : ''}
                    </div>
                    <div class="vid-mini-card">
                        <div style="color: #a78bfa; font-size: 20px; font-weight: 700;">${ctr}</div>
                        <div style="font-size: 11px; color: #94a3b8;">CTR</div>
                        ${vsBenchmark.ctr ? `<div style="font-size: 10px; color: ${vsBenchmark.ctr.includes('above') ? '#4ade80' : '#fbbf24'};">${vsBenchmark.ctr}</div>` : ''}
                    </div>
                    <div class="vid-mini-card">
                        <div style="color: #f472b6; font-size: 20px; font-weight: 700;">${cvr}</div>
                        <div style="font-size: 11px; color: #94a3b8;">Conversion Rate</div>
                    </div>
                </div>

                ${reasoning ? `
                <div style="background: rgba(139,92,246,0.1); padding: 16px; border-radius: 12px; margin-bottom: 16px;">
                    <div style="color: #a78bfa; font-size: 12px; font-weight: 600; margin-bottom: 8px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>Prediction Rationale</div>
                    <div style="color: #e2e8f0; font-size: 13px; line-height: 1.6;">${reasoning}</div>
                </div>
                ` : ''}

                ${(fatigue.novelty_level || fatigue.estimated_fatigue_days) ? `
                <div style="background: rgba(234,179,8,0.1); padding: 16px; border-radius: 12px;">
                    <div style="color: #fbbf24; font-size: 12px; font-weight: 600; margin-bottom: 8px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Creative Fatigue Prediction</div>
                    <div style="display: flex; gap: 24px; flex-wrap: wrap;">
                        <div>
                            <div style="font-size: 11px; color: #94a3b8;">Novelty Level</div>
                            <div style="color: #fff; font-weight: 600; font-size: 16px; text-transform: capitalize;">${fatigue.novelty_level || 'N/A'}</div>
                        </div>
                        <div>
                            <div style="font-size: 11px; color: #94a3b8;">Est. Fatigue</div>
                            <div style="color: #fff; font-weight: 600; font-size: 16px;">${fatigue.estimated_fatigue_days || 'N/A'} days</div>
                        </div>
                        <div>
                            <div style="font-size: 11px; color: #94a3b8;">Freq. Cap</div>
                            <div style="color: #fff; font-weight: 600; font-size: 16px;">${fatigue.frequency_cap_recommendation || 'N/A'} imp/week</div>
                        </div>
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    }

    // Creative Elements
    function renderCreativeElements(analysis) {
        // Extract from multiple possible locations - Gemini returns messageAnalysis, not ctaAnalysis
        const messageData = analysis.messageAnalysis || {};
        const cta = analysis.ctaAnalysis || messageData || analysis.cta || {};
        const narrative = analysis.narrativeAnalysis || analysis.narrative || {};
        const emotional = analysis.emotionalJourney || analysis.emotional || {};
        
        // Extract CTA score from clarity rating
        const clarityMap = { excellent: 90, good: 75, fair: 50, poor: 25 };
        const ctaScore = cta.cta_effectiveness_score || clarityMap[messageData.cta_clarity] || (messageData.cta_present ? 60 : 0);
        const ctaText = messageData.cta_text || cta.visual_cta?.text || cta.cta_text || cta.primary_cta || '';
        const ctaClarity = messageData.cta_clarity || cta.cta_type || '';
        const ctaTiming = messageData.cta_timing || '';
        const coreMessage = messageData.core_message || '';
        
        const narrativeScore = narrative.narrative_score || narrative.score || narrative.story_score || 0;
        const storyType = narrative.story_type || narrative.structure || narrative.format || '';
        const narrativeStrengths = narrative.strengths || [];
        
        const emotionalScore = emotional.emotional_journey_score || emotional.score || emotional.emotional_score || 0;
        const peakEmotion = emotional.peak_emotion_moment || emotional.peak_moment || emotional.emotional_peak_moment || '';
        const emotionalTriggers = emotional.emotional_triggers || [];
        const dominantEmotion = emotional.dominant_emotion || '';

        // Show section even with partial data
        const hasAnyData = ctaScore || ctaText || coreMessage || narrativeScore || storyType || emotionalScore;

        return `
            <div class="vid-card">
                <div class="vid-card-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f472b6" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <h3>Creative Elements</h3>
                </div>

                <div class="vid-tabs">
                    <button class="vid-tab active" onclick="document.querySelectorAll('.vid-creative-tab').forEach(t=>t.classList.remove('active'));document.querySelector('#creative-cta').classList.add('active');document.querySelectorAll('.vid-tab').forEach(t=>t.classList.remove('active'));this.classList.add('active');">CTA</button>
                    <button class="vid-tab" onclick="document.querySelectorAll('.vid-creative-tab').forEach(t=>t.classList.remove('active'));document.querySelector('#creative-narrative').classList.add('active');document.querySelectorAll('.vid-tab').forEach(t=>t.classList.remove('active'));this.classList.add('active');">Narrative</button>
                    <button class="vid-tab" onclick="document.querySelectorAll('.vid-creative-tab').forEach(t=>t.classList.remove('active'));document.querySelector('#creative-emotional').classList.add('active');document.querySelectorAll('.vid-tab').forEach(t=>t.classList.remove('active'));this.classList.add('active');">Emotional</button>
                </div>

                <div id="creative-cta" class="vid-tab-content vid-creative-tab active">
                    <div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 12px;">
                        <div style="flex: 0 0 100px; background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px; text-align: center;">
                            <div style="color: #94a3b8; font-size: 10px;">CTA Score</div>
                            <div style="color: ${scoreColor(ctaScore)}; font-size: 28px; font-weight: 700;">${ctaScore || 'N/A'}</div>
                        </div>
                        <div style="flex: 1; min-width: 200px; background: rgba(139,92,246,0.1); padding: 12px; border-radius: 8px;">
                            <div style="color: #a78bfa; font-size: 10px;">Primary CTA</div>
                            <div style="color: #fff; font-size: 16px; font-weight: 600;">${ctaText ? `"${ctaText}"` : (messageData.cta_present ? 'CTA Present' : 'No CTA Detected')}</div>
                            ${ctaClarity ? `<div style="color: #94a3b8; font-size: 11px; margin-top: 4px; text-transform: capitalize;">Clarity: ${ctaClarity.replace(/_/g, ' ')}</div>` : ''}
                            ${ctaTiming ? `<div style="color: #64748b; font-size: 10px; margin-top: 2px; text-transform: capitalize;">Timing: ${ctaTiming}</div>` : ''}
                        </div>
                    </div>
                    ${coreMessage ? `
                    <div style="padding: 12px; background: rgba(59,130,246,0.1); border-radius: 8px; margin-top: 8px;">
                        <div style="color: #60a5fa; font-size: 10px;">Core Message</div>
                        <div style="color: #e2e8f0; font-size: 13px; margin-top: 4px;">${coreMessage}</div>
                    </div>
                    ` : ''}
                </div>

                <div id="creative-narrative" class="vid-tab-content vid-creative-tab">
                    <div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 12px;">
                        <div style="flex: 0 0 100px; background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px; text-align: center;">
                            <div style="color: #94a3b8; font-size: 10px;">Narrative Score</div>
                            <div style="color: ${scoreColor(narrativeScore)}; font-size: 28px; font-weight: 700;">${narrativeScore || 'N/A'}</div>
                        </div>
                        <div style="flex: 1; min-width: 200px; background: rgba(59,130,246,0.1); padding: 12px; border-radius: 8px;">
                            <div style="color: #60a5fa; font-size: 10px;">Story Type</div>
                            <div style="color: #fff; font-size: 16px; text-transform: capitalize;">${storyType ? storyType.replace(/_/g, ' ') : 'Analyzing...'}</div>
                            ${narrativeStrengths.length > 0 ? `
                            <div style="margin-top: 8px; font-size: 11px; color: #94a3b8;">
                                Strengths: ${narrativeStrengths.slice(0, 2).join(', ')}
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>

                <div id="creative-emotional" class="vid-tab-content vid-creative-tab">
                    <div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 12px;">
                        <div style="flex: 0 0 100px; background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px; text-align: center;">
                            <div style="color: #94a3b8; font-size: 10px;">Emotional Score</div>
                            <div style="color: ${scoreColor(emotionalScore)}; font-size: 28px; font-weight: 700;">${emotionalScore || 'N/A'}</div>
                        </div>
                        <div style="flex: 1; min-width: 200px; background: rgba(236,72,153,0.1); padding: 12px; border-radius: 8px;">
                            ${dominantEmotion ? `
                            <div style="color: #f472b6; font-size: 10px;">Dominant Emotion</div>
                            <div style="color: #fff; font-size: 16px; text-transform: capitalize;">${dominantEmotion}</div>
                            ` : ''}
                            ${peakEmotion ? `
                            <div style="color: #f472b6; font-size: 10px; margin-top: 8px;">Peak Moment</div>
                            <div style="color: #e2e8f0; font-size: 13px;">${typeof peakEmotion === 'string' ? peakEmotion : (peakEmotion.emotion_type || peakEmotion.emotion || 'N/A')}</div>
                            ` : ''}
                            ${emotionalTriggers.length > 0 ? `
                            <div style="color: #f472b6; font-size: 10px; margin-top: 8px;">Emotional Triggers</div>
                            <div style="color: #94a3b8; font-size: 12px;">${emotionalTriggers.slice(0, 3).join(', ')}</div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Compliance & Accessibility
    function renderComplianceAccessibility(analysis) {
        const compliance = analysis.complianceAnalysis;
        const accessibility = analysis.accessibilityAnalysis;

        if (!compliance && !accessibility) return '';

        return `
            <div class="vid-card">
                <div class="vid-card-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    <h3>Compliance & Accessibility</h3>
                </div>

                <div class="vid-grid vid-grid-2">
                    ${compliance ? `
                    <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: 12px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                            <span style="color: #fff; font-weight: 600;">Policy Compliance</span>
                            <span style="color: ${scoreColor(compliance.compliance_score || 0)}; font-weight: 700;">${compliance.compliance_score || 0}/100</span>
                        </div>
                        <div style="margin-bottom: 8px;">
                            <span class="vid-badge vid-badge-${compliance.overall_risk_level}" style="text-transform: capitalize;">${compliance.overall_risk_level || 'unknown'} risk</span>
                        </div>
                        ${compliance.google_ads?.restricted_flags?.length > 0 ? `
                        <div style="font-size: 11px; color: #f87171; margin-top: 8px;">
                            Google Ads flags: ${compliance.google_ads.restricted_flags.join(', ')}
                        </div>
                        ` : ''}
                    </div>
                    ` : ''}

                    ${accessibility ? `
                    <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: 12px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                            <span style="color: #fff; font-weight: 600;">Accessibility</span>
                            <span style="color: ${scoreColor(accessibility.accessibility_score || 0)}; font-weight: 700;">${accessibility.accessibility_score || 0}/100</span>
                        </div>
                        <div style="font-size: 11px; color: #94a3b8; line-height: 1.6;">
                            <div>Captions: ${accessibility.caption_analysis?.captions_present ? '✓' : '✗'}</div>
                            <div>WCAG: ${accessibility.visual_accessibility?.wcag_compliance || 'N/A'}</div>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // Recommendations
    function renderRecommendations(analysis) {
        const abTests = analysis.abTestRecommendations || [];
        const roadmap = analysis.iterationRoadmap || {};

        if (abTests.length === 0 && !roadmap.quick_wins) return '';

        return `
            <div class="vid-card">
                <div class="vid-card-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"/><path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/><path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z"/><path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z"/></svg>
                    <h3>Strategic Recommendations</h3>
                </div>

                ${abTests.length > 0 ? `
                <div style="margin-bottom: 20px;">
                    <div style="color: #a78bfa; font-size: 12px; font-weight: 600; margin-bottom: 12px;">A/B Test Recommendations</div>
                    ${abTests.slice(0, 5).map(test => `
                        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px; margin-bottom: 8px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                <span style="color: #fff; font-size: 13px;">${test.hypothesis || test.variable || test.test || 'Test variation'}</span>
                                <span class="vid-badge vid-badge-${(test.priority || 'medium').toLowerCase()}">${test.priority || 'MEDIUM'}</span>
                            </div>
                            <div style="color: #22c55e; font-size: 11px;">${test.expected_impact || test.impact || 'Potential improvement'}</div>
                        </div>
                    `).join('')}
                </div>
                ` : ''}

                ${roadmap.quick_wins ? `
                <div class="vid-grid vid-grid-3">
                    <div style="background: rgba(34,197,94,0.1); padding: 12px; border-radius: 8px;">
                        <div style="color: #4ade80; font-size: 11px; font-weight: 600; margin-bottom: 8px;"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>Quick Wins</div>
                        ${roadmap.quick_wins.slice(0, 4).map(w => `<div style="font-size: 10px; color: #94a3b8; margin-bottom: 4px;">• ${w}</div>`).join('')}
                    </div>
                    <div style="background: rgba(234,179,8,0.1); padding: 12px; border-radius: 8px;">
                        <div style="color: #fbbf24; font-size: 11px; font-weight: 600; margin-bottom: 8px;"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>Medium Effort</div>
                        ${(roadmap.medium_effort || []).slice(0, 4).map(m => `<div style="font-size: 10px; color: #94a3b8; margin-bottom: 4px;">• ${m}</div>`).join('')}
                    </div>
                    <div style="background: rgba(239,68,68,0.1); padding: 12px; border-radius: 8px;">
                        <div style="color: #f87171; font-size: 11px; font-weight: 600; margin-bottom: 8px;"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>Consider Reshoot</div>
                        ${(roadmap.reshoot_considerations || []).slice(0, 4).map(r => `<div style="font-size: 10px; color: #94a3b8; margin-bottom: 4px;">• ${r}</div>`).join('') || '<div style="font-size: 10px; color: #64748b;">None required</div>'}
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    }

    // ============================================
    // NEW v2.2 SECTIONS: Benchmarks, Strategy, Ad Copy
    // ============================================

    // Industry Benchmark Comparison
    function renderBenchmarkComparison(analysis) {
        const benchmarkData = analysis.benchmarkComparison;
        if (!benchmarkData) return '';

        const comparison = benchmarkData.comparison || {};
        const industry = benchmarkData.industry || 'general';
        
        return `
            <div class="vid-card" style="background: linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(20,184,166,0.1) 100%); border-color: rgba(34,197,94,0.3);">
                <div class="vid-card-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                    <h3>Industry Benchmark Comparison</h3>
                    <span class="vid-badge" style="background: rgba(34,197,94,0.2); color: #4ade80; margin-left: auto;">${industry.replace(/_/g, ' ')}</span>
                </div>

                <div style="padding: 12px 16px; background: rgba(0,0,0,0.2); border-radius: 10px; margin-bottom: 16px;">
                    <div style="font-size: 14px; color: ${benchmarkData.summary?.includes('above') ? '#4ade80' : benchmarkData.summary?.includes('Below') ? '#f87171' : '#fbbf24'}; font-weight: 600;">
                        ${benchmarkData.summary || 'Analyzing against benchmarks...'}
                    </div>
                </div>

                <div class="vid-grid vid-grid-2" style="gap: 12px;">
                    ${comparison.hookRate ? `
                    <div style="background: rgba(0,0,0,0.3); padding: 16px; border-radius: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span style="color: #94a3b8; font-size: 12px;">Hook Rate</span>
                            <span class="vid-badge ${comparison.hookRate.status === 'above' ? 'vid-badge-low' : comparison.hookRate.status === 'below' ? 'vid-badge-high' : 'vid-badge-medium'}">
                                ${comparison.hookRate.status}
                            </span>
                        </div>
                        <div style="display: flex; align-items: baseline; gap: 8px;">
                            <span style="font-size: 32px; font-weight: 700; color: #fff;">${comparison.hookRate.yours}%</span>
                            <span style="color: #64748b; font-size: 12px;">vs ${comparison.hookRate.benchmark}% benchmark</span>
                        </div>
                        <div style="font-size: 11px; color: ${comparison.hookRate.delta >= 0 ? '#4ade80' : '#f87171'}; margin-top: 4px;">
                            ${comparison.hookRate.delta >= 0 ? '↑' : '↓'} ${Math.abs(comparison.hookRate.delta)}% ${comparison.hookRate.delta >= 0 ? 'above' : 'below'}
                        </div>
                    </div>
                    ` : ''}

                    ${comparison.completionRate ? `
                    <div style="background: rgba(0,0,0,0.3); padding: 16px; border-radius: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span style="color: #94a3b8; font-size: 12px;">Completion Rate</span>
                            <span class="vid-badge ${comparison.completionRate.status === 'above' ? 'vid-badge-low' : comparison.completionRate.status === 'below' ? 'vid-badge-high' : 'vid-badge-medium'}">
                                ${comparison.completionRate.status}
                            </span>
                        </div>
                        <div style="display: flex; align-items: baseline; gap: 8px;">
                            <span style="font-size: 32px; font-weight: 700; color: #fff;">${comparison.completionRate.yours}%</span>
                            <span style="color: #64748b; font-size: 12px;">vs ${comparison.completionRate.benchmark}% benchmark</span>
                        </div>
                        <div style="font-size: 11px; color: ${comparison.completionRate.delta >= 0 ? '#4ade80' : '#f87171'}; margin-top: 4px;">
                            ${comparison.completionRate.delta >= 0 ? '↑' : '↓'} ${Math.abs(comparison.completionRate.delta)}% ${comparison.completionRate.delta >= 0 ? 'above' : 'below'}
                        </div>
                    </div>
                    ` : ''}
                </div>

                ${benchmarkData.benchmarks?.sources?.length > 0 ? `
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <div style="font-size: 10px; color: #64748b; margin-bottom: 8px;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>Benchmark Sources:</div>
                    ${benchmarkData.benchmarks.sources.slice(0, 2).map(s => `
                        <a href="${s.url}" target="_blank" style="display: block; font-size: 10px; color: #60a5fa; text-decoration: none; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            ${s.title}
                        </a>
                    `).join('')}
                </div>
                ` : ''}
            </div>
        `;
    }

    // Strategic Insights (from multi-model enhancement)
    function renderStrategicInsights(analysis) {
        const strategy = analysis.strategicAssessment || {};
        const psychology = analysis.psychologyAnalysis || {};
        const abTests = analysis.abTestRecommendations || [];
        const v2Brief = analysis.v2CreativeBrief || {};
        const predictions = analysis.performancePredictions || {};

        if (!strategy.overall_rating && !psychology.principles_used?.length && abTests.length === 0) return '';

        return `
            <div class="vid-card" style="background: linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(236,72,153,0.1) 100%); border-color: rgba(139,92,246,0.3);">
                <div class="vid-card-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                    <h3>Strategic Deep Analysis</h3>
                    <span class="vid-badge" style="background: rgba(139,92,246,0.3); color: #a78bfa; margin-left: auto;">Multi-Model AI</span>
                </div>

                ${strategy.overall_rating ? `
                <div class="vid-grid vid-grid-4" style="margin-bottom: 20px;">
                    <div class="vid-mini-card">
                        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 4px;">Overall Rating</div>
                        <div style="font-size: 14px; font-weight: 600; color: ${strategy.overall_rating === 'excellent' ? '#4ade80' : strategy.overall_rating === 'above_average' ? '#22c55e' : strategy.overall_rating === 'average' ? '#fbbf24' : '#f87171'}; text-transform: capitalize;">
                            ${(strategy.overall_rating || 'N/A').replace(/_/g, ' ')}
                        </div>
                    </div>
                    <div class="vid-mini-card">
                        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 4px;">Uniqueness</div>
                        <div style="font-size: 24px; font-weight: 700; color: ${scoreColor(strategy.unique_angle_score || 0)};">${strategy.unique_angle_score || 0}</div>
                    </div>
                    <div class="vid-mini-card">
                        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 4px;">Memorable</div>
                        <div style="font-size: 24px; font-weight: 700; color: ${scoreColor(strategy.memorable_factor || 0)};">${strategy.memorable_factor || 0}</div>
                    </div>
                    <div class="vid-mini-card">
                        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 4px;">Category</div>
                        <div style="font-size: 11px; color: #e2e8f0; word-break: break-word;">${strategy.category_entry_point || 'N/A'}</div>
                    </div>
                </div>
                ` : ''}

                ${psychology.principles_used?.length > 0 ? `
                <div style="margin-bottom: 20px;">
                    <div style="color: #a78bfa; font-size: 12px; font-weight: 600; margin-bottom: 12px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"/><path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/><path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z"/><path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z"/><path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z"/><path d="M15.5 19H14v1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/><path d="M10 9.5C10 8.67 9.33 8 8.5 8h-5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5z"/><path d="M8.5 5H10V3.5C10 2.67 9.33 2 8.5 2S7 2.67 7 3.5 7.67 5 8.5 5z"/></svg>Psychology Principles Used</div>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${psychology.principles_used.map(p => `
                            <div style="background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 8px; flex: 1; min-width: 200px;">
                                <div style="color: #fff; font-size: 13px; font-weight: 500;">${p.principle}</div>
                                <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">${p.execution}</div>
                                <span class="vid-badge ${p.effectiveness === 'strong' ? 'vid-badge-low' : p.effectiveness === 'weak' ? 'vid-badge-high' : 'vid-badge-medium'}" style="margin-top: 6px;">
                                    ${p.effectiveness}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                    ${psychology.missing_principles?.length > 0 ? `
                    <div style="margin-top: 12px; padding: 10px; background: rgba(249,115,22,0.1); border-radius: 6px;">
                        <div style="font-size: 11px; color: #fb923c; font-weight: 600;">Missing Principles:</div>
                        <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">${psychology.missing_principles.join(', ')}</div>
                    </div>
                    ` : ''}
                </div>
                ` : ''}

                ${predictions.predicted_hook_rate ? `
                <div style="margin-bottom: 20px;">
                    <div style="color: #60a5fa; font-size: 12px; font-weight: 600; margin-bottom: 12px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>Performance Predictions</div>
                    <div class="vid-grid vid-grid-4">
                        <div style="text-align: center; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 8px;">
                            <div style="font-size: 18px; font-weight: 700; color: #fff;">${predictions.predicted_hook_rate}</div>
                            <div style="font-size: 10px; color: #94a3b8;">Hook Rate</div>
                        </div>
                        <div style="text-align: center; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 8px;">
                            <div style="font-size: 18px; font-weight: 700; color: #fff;">${predictions.predicted_completion_rate}</div>
                            <div style="font-size: 10px; color: #94a3b8;">Completion</div>
                        </div>
                        <div style="text-align: center; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 8px;">
                            <div style="font-size: 18px; font-weight: 700; color: #fff;">${predictions.predicted_ctr}</div>
                            <div style="font-size: 10px; color: #94a3b8;">CTR</div>
                        </div>
                        <div style="text-align: center; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 8px;">
                            <div style="font-size: 18px; font-weight: 700; color: #fff;">${predictions.predicted_conversion_rate || 'N/A'}</div>
                            <div style="font-size: 10px; color: #94a3b8;">CVR</div>
                        </div>
                    </div>
                    ${predictions.reasoning ? `
                    <div style="font-size: 11px; color: #64748b; margin-top: 8px; font-style: italic;">${predictions.reasoning}</div>
                    ` : ''}
                </div>
                ` : ''}

                ${v2Brief.key_insight ? `
                <div style="background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); border-radius: 10px; padding: 16px;">
                    <div style="color: #4ade80; font-size: 12px; font-weight: 600; margin-bottom: 8px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>V2 Creative Brief</div>
                    <div style="color: #fff; font-size: 14px; font-weight: 500; margin-bottom: 12px;">${v2Brief.key_insight}</div>
                    <div style="display: grid; gap: 8px; font-size: 12px; color: #94a3b8;">
                        ${v2Brief.hook_recommendation ? `<div><strong style="color:#a78bfa;">Hook:</strong> ${v2Brief.hook_recommendation}</div>` : ''}
                        ${v2Brief.message_recommendation ? `<div><strong style="color:#a78bfa;">Message:</strong> ${v2Brief.message_recommendation}</div>` : ''}
                        ${v2Brief.cta_recommendation ? `<div><strong style="color:#a78bfa;">CTA:</strong> ${v2Brief.cta_recommendation}</div>` : ''}
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    }

    // Ad Copy Suggestions with "Send to Builder" buttons
    function renderAdCopySuggestions(adCopy) {
        if (!adCopy) return '';

        return `
            <div class="vid-card" style="background: linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(6,182,212,0.1) 100%); border-color: rgba(59,130,246,0.3);">
                <div class="vid-card-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
                    <h3>Generated Ad Copy</h3>
                    <div style="margin-left: auto; display: flex; gap: 8px;">
                        <button type="button" onclick="window.VideoAnalyzer?.sendToGoogleAds?.()" style="background: rgba(66,133,244,0.2); color: #60a5fa; border: 1px solid rgba(66,133,244,0.4); padding: 6px 12px; border-radius: 6px; font-size: 11px; cursor: pointer;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Send to Google Ads
                        </button>
                        <button type="button" onclick="window.VideoAnalyzer?.sendToSocialMedia?.()" style="background: rgba(236,72,153,0.2); color: #f472b6; border: 1px solid rgba(236,72,153,0.4); padding: 6px 12px; border-radius: 6px; font-size: 11px; cursor: pointer;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Send to Social Ads
                        </button>
                    </div>
                </div>

                ${adCopy.headlines?.length > 0 ? `
                <div style="margin-bottom: 20px;">
                    <div style="color: #60a5fa; font-size: 12px; font-weight: 600; margin-bottom: 10px;">Headlines</div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${adCopy.headlines.map(h => `
                            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.2); padding: 10px 14px; border-radius: 8px;">
                                <span style="color: #fff; font-size: 14px;">"${h.text}"</span>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="color: #64748b; font-size: 10px;">${h.character_count} chars</span>
                                    <span class="vid-badge" style="background: rgba(139,92,246,0.2); color: #a78bfa;">${h.angle}</span>
                                    <button type="button" onclick="navigator.clipboard.writeText('${h.text.replace(/'/g, "\\'")}'); this.innerText='✓'" style="background: none; border: 1px solid rgba(255,255,255,0.2); color: #94a3b8; padding: 4px 8px; border-radius: 4px; font-size: 10px; cursor: pointer;">Copy</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                ${adCopy.primaryText?.length > 0 ? `
                <div style="margin-bottom: 20px;">
                    <div style="color: #60a5fa; font-size: 12px; font-weight: 600; margin-bottom: 10px;">Primary Text</div>
                    ${adCopy.primaryText.map(p => `
                        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px; margin-bottom: 8px;">
                            <div style="color: #e2e8f0; font-size: 13px; line-height: 1.5; margin-bottom: 8px;">${p.text}</div>
                            <div style="display: flex; gap: 8px;">
                                <span class="vid-badge vid-badge-medium">${p.tone}</span>
                                <span style="color: #64748b; font-size: 10px;">${p.length} length</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                ` : ''}

                ${adCopy.googleAdsVariations?.headlines?.length > 0 ? `
                <div style="background: rgba(66,133,244,0.1); border: 1px solid rgba(66,133,244,0.2); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
                    <div style="color: #60a5fa; font-size: 11px; font-weight: 600; margin-bottom: 8px;">Google RSA Headlines (30 chars)</div>
                    <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                        ${adCopy.googleAdsVariations.headlines.slice(0, 8).map(h => `
                            <span style="background: rgba(0,0,0,0.3); padding: 4px 10px; border-radius: 4px; font-size: 11px; color: #e2e8f0;">${h}</span>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                ${adCopy.socialVariations ? `
                <div class="vid-grid vid-grid-3">
                    ${adCopy.socialVariations.tiktok?.caption ? `
                    <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;">
                        <div style="color: #f472b6; font-size: 11px; font-weight: 600; margin-bottom: 6px;"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>TikTok</div>
                        <div style="color: #94a3b8; font-size: 11px;">${adCopy.socialVariations.tiktok.caption}</div>
                        ${adCopy.socialVariations.tiktok.hashtags?.length > 0 ? `
                        <div style="margin-top: 6px; font-size: 10px; color: #60a5fa;">${adCopy.socialVariations.tiktok.hashtags.join(' ')}</div>
                        ` : ''}
                    </div>
                    ` : ''}
                    ${adCopy.socialVariations.instagram?.caption ? `
                    <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;">
                        <div style="color: #e879f9; font-size: 11px; font-weight: 600; margin-bottom: 6px;"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>Instagram</div>
                        <div style="color: #94a3b8; font-size: 11px;">${adCopy.socialVariations.instagram.caption}</div>
                    </div>
                    ` : ''}
                    ${adCopy.socialVariations.linkedin?.text ? `
                    <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;">
                        <div style="color: #60a5fa; font-size: 11px; font-weight: 600; margin-bottom: 6px;"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>LinkedIn</div>
                        <div style="color: #94a3b8; font-size: 11px;">${adCopy.socialVariations.linkedin.text}</div>
                    </div>
                    ` : ''}
                </div>
                ` : ''}

                ${adCopy.copyStrategy?.main_hook ? `
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <div style="color: #4ade80; font-size: 12px; font-weight: 600; margin-bottom: 8px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>Copy Strategy</div>
                    <div style="color: #fff; font-size: 13px; margin-bottom: 8px;"><strong>Main Hook:</strong> ${adCopy.copyStrategy.main_hook}</div>
                    ${adCopy.copyStrategy.objection_handlers?.length > 0 ? `
                    <div style="font-size: 11px; color: #94a3b8;">
                        <strong>Objection Handlers:</strong> ${adCopy.copyStrategy.objection_handlers.join(', ')}
                    </div>
                    ` : ''}
                </div>
                ` : ''}
            </div>
        `;
    }

    // Competitor Comparison
    function renderCompetitorComparison(comparison) {
        if (!comparison) return '';

        return `
            <div class="vid-card" style="background: linear-gradient(135deg, rgba(249,115,22,0.1) 0%, rgba(239,68,68,0.1) 100%); border-color: rgba(249,115,22,0.3);">
                <div class="vid-card-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fb923c" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                    <h3>Competitor Comparison</h3>
                </div>

                ${comparison.competitorAnalysis ? `
                <div style="background: rgba(0,0,0,0.2); padding: 14px; border-radius: 10px; margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="color: #fb923c; font-size: 13px; font-weight: 600;">Competitor Video</span>
                        <span style="font-size: 24px; font-weight: 700; color: ${scoreColor(comparison.competitorAnalysis.hook_score || 0)};">${comparison.competitorAnalysis.hook_score || 0}</span>
                    </div>
                    <div style="font-size: 12px; color: #94a3b8; margin-bottom: 8px;">${comparison.competitorAnalysis.key_message || 'N/A'}</div>
                    ${comparison.competitorAnalysis.unique_elements?.length > 0 ? `
                    <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                        ${comparison.competitorAnalysis.unique_elements.map(e => `
                            <span style="background: rgba(249,115,22,0.2); color: #fbbf24; padding: 3px 8px; border-radius: 4px; font-size: 10px;">${e}</span>
                        `).join('')}
                    </div>
                    ` : ''}
                </div>
                ` : ''}

                ${comparison.comparison ? `
                <div class="vid-grid vid-grid-3" style="margin-bottom: 16px;">
                    <div style="background: rgba(34,197,94,0.1); padding: 12px; border-radius: 8px;">
                        <div style="color: #4ade80; font-size: 11px; font-weight: 600; margin-bottom: 8px;"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><polyline points="20 6 9 17 4 12"/></svg>You Win On</div>
                        ${(comparison.comparison.you_win_on || []).map(w => `<div style="font-size: 10px; color: #94a3b8; margin-bottom: 4px;">• ${w}</div>`).join('')}
                    </div>
                    <div style="background: rgba(239,68,68,0.1); padding: 12px; border-radius: 8px;">
                        <div style="color: #f87171; font-size: 11px; font-weight: 600; margin-bottom: 8px;"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>They Win On</div>
                        ${(comparison.comparison.they_win_on || []).map(l => `<div style="font-size: 10px; color: #94a3b8; margin-bottom: 4px;">• ${l}</div>`).join('')}
                    </div>
                    <div style="background: rgba(148,163,184,0.1); padding: 12px; border-radius: 8px;">
                        <div style="color: #94a3b8; font-size: 11px; font-weight: 600; margin-bottom: 8px;">〰️ Even</div>
                        ${(comparison.comparison.neutral || []).map(n => `<div style="font-size: 10px; color: #64748b; margin-bottom: 4px;">• ${n}</div>`).join('')}
                    </div>
                </div>
                ` : ''}

                ${comparison.steal_these_tactics?.length > 0 ? `
                <div style="background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.2); border-radius: 8px; padding: 12px;">
                    <div style="color: #a78bfa; font-size: 11px; font-weight: 600; margin-bottom: 6px;"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>Steal These Tactics</div>
                    <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                        ${comparison.steal_these_tactics.map(t => `
                            <span style="background: rgba(0,0,0,0.3); color: #e2e8f0; padding: 4px 10px; border-radius: 4px; font-size: 11px;">${t}</span>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                ${comparison.differentiation_opportunities?.length > 0 ? `
                <div style="margin-top: 12px;">
                    <div style="color: #22c55e; font-size: 11px; font-weight: 600; margin-bottom: 6px;"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>Differentiation Opportunities</div>
                    ${comparison.differentiation_opportunities.map(o => `<div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">→ ${o}</div>`).join('')}
                </div>
                ` : ''}
            </div>
        `;
    }

    // Export
    window.AdvancedVideoAnalyzerUI = { render, VERSION };

    console.log(`🎨 Advanced Video Analyzer UI v${VERSION} loaded`);

})();
