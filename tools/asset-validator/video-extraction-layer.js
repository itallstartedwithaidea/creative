/**
 * Video Extraction Layer v1.0.0
 * Bulletproof video content extraction with multi-method fallbacks
 * Based on Video Creative Intelligence Tool Specification
 * 
 * Core Principles:
 * 1. NEVER FABRICATE — If we can't extract it, we don't analyze it
 * 2. ALWAYS VALIDATE — Every extraction must be verified before analysis
 * 3. SHOW YOUR WORK — Every score must cite its evidence source
 * 4. FAIL GRACEFULLY — Clear user communication when extraction fails
 * 5. MULTIPLE PATHS — Always have fallback extraction methods
 */

(function() {
    'use strict';

    const VERSION = '1.0.0';

    // ==================== PLATFORM PATTERNS ====================
    const PLATFORM_PATTERNS = {
        youtube: {
            patterns: [
                /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/live\/|m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
                /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
            ],
            extractId: (url) => {
                for (const pattern of PLATFORM_PATTERNS.youtube.patterns) {
                    const match = url.match(pattern);
                    if (match) return match[1];
                }
                return null;
            },
            canonical: (id) => `https://www.youtube.com/watch?v=${id}`,
            apiEndpoints: {
                oembed: (id) => `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`,
                thumbnail: (id) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
                thumbnailFallback: (id) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`
            }
        },
        tiktok: {
            patterns: [
                /tiktok\.com\/@([^\/]+)\/video\/(\d+)/,
                /vm\.tiktok\.com\/([a-zA-Z0-9]+)/,
                /tiktok\.com\/t\/([a-zA-Z0-9]+)/
            ],
            extractId: (url) => {
                const match = url.match(/video\/(\d+)/) || url.match(/vm\.tiktok\.com\/([a-zA-Z0-9]+)/) || url.match(/\/t\/([a-zA-Z0-9]+)/);
                return match ? match[1] : null;
            },
            canonical: (id, username) => `https://www.tiktok.com/@${username}/video/${id}`,
            apiEndpoints: {
                oembed: (url) => `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`
            }
        },
        instagram: {
            patterns: [
                /instagram\.com\/(?:p|reel|reels|tv)\/([a-zA-Z0-9_-]+)/
            ],
            extractId: (url) => {
                const match = url.match(/(?:p|reel|reels|tv)\/([a-zA-Z0-9_-]+)/);
                return match ? match[1] : null;
            },
            canonical: (id) => `https://www.instagram.com/reel/${id}/`,
            apiEndpoints: {
                oembed: (url) => `https://api.instagram.com/oembed?url=${encodeURIComponent(url)}`
            }
        },
        facebook: {
            patterns: [
                /facebook\.com\/watch\/?\?v=(\d+)/,
                /facebook\.com\/[^\/]+\/videos\/(\d+)/,
                /facebook\.com\/reel\/(\d+)/,
                /fb\.watch\/([a-zA-Z0-9]+)/
            ],
            extractId: (url) => {
                for (const pattern of PLATFORM_PATTERNS.facebook.patterns) {
                    const match = url.match(pattern);
                    if (match) return match[1];
                }
                return null;
            },
            canonical: (id) => `https://www.facebook.com/watch/?v=${id}`
        },
        twitter: {
            patterns: [
                /(?:twitter\.com|x\.com)\/[^\/]+\/status\/(\d+)/
            ],
            extractId: (url) => {
                const match = url.match(/status\/(\d+)/);
                return match ? match[1] : null;
            },
            canonical: (id, username) => `https://x.com/${username}/status/${id}`
        },
        vimeo: {
            patterns: [
                /vimeo\.com\/(\d+)/,
                /player\.vimeo\.com\/video\/(\d+)/
            ],
            extractId: (url) => {
                const match = url.match(/vimeo\.com\/(\d+)/) || url.match(/video\/(\d+)/);
                return match ? match[1] : null;
            },
            canonical: (id) => `https://vimeo.com/${id}`,
            apiEndpoints: {
                oembed: (id) => `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${id}`
            }
        },
        loom: {
            patterns: [
                /loom\.com\/share\/([a-zA-Z0-9]+)/,
                /loom\.com\/embed\/([a-zA-Z0-9]+)/
            ],
            extractId: (url) => {
                const match = url.match(/(?:share|embed)\/([a-zA-Z0-9]+)/);
                return match ? match[1] : null;
            },
            canonical: (id) => `https://www.loom.com/share/${id}`
        },
        linkedin: {
            patterns: [
                /linkedin\.com\/posts\/([^\/]+)/,
                /linkedin\.com\/feed\/update\/urn:li:activity:(\d+)/
            ],
            extractId: (url) => {
                const match = url.match(/activity:(\d+)/) || url.match(/posts\/([^\/\?]+)/);
                return match ? match[1] : null;
            },
            note: 'LinkedIn is restrictive - often need user upload'
        },
        directVideo: {
            patterns: [
                /\.(mp4|mov|webm|avi|mkv|m4v)(\?.*)?$/i
            ],
            extractId: (url) => url,
            canonical: (url) => url
        }
    };

    // ==================== ACCESSIBILITY STATUS CODES ====================
    const ACCESSIBILITY_STATUS = {
        ACCESSIBLE: { code: 200, message: 'Video is publicly accessible', action: 'proceed' },
        REQUIRES_AUTH: { code: 401, message: 'Login required to view this video', action: 'prompt_upload' },
        AGE_GATED: { code: '403_AGE', message: 'Age verification required', action: 'try_alternative' },
        GEO_BLOCKED: { code: '403_GEO', message: 'Video not available in your region', action: 'prompt_upload' },
        PRIVATE: { code: '403_PRIVATE', message: 'This is a private video', action: 'prompt_upload' },
        DELETED: { code: 404, message: 'Video has been removed or deleted', action: 'abort' },
        PROCESSING: { code: 202, message: 'Video is still processing', action: 'retry_later' },
        LIVE_STREAM: { code: 206, message: 'This is a live stream', action: 'limited_analysis' },
        RATE_LIMITED: { code: 429, message: 'Too many requests to platform', action: 'retry_later' },
        DRM_PROTECTED: { code: '403_DRM', message: 'Video is DRM protected', action: 'prompt_upload' },
        PLATFORM_UNSUPPORTED: { code: 501, message: 'Platform not yet fully supported', action: 'prompt_upload' },
        UNKNOWN_ERROR: { code: 500, message: 'Unknown error accessing video', action: 'prompt_upload' }
    };

    // ==================== EXTRACTION TIERS ====================
    const EXTRACTION_TIERS = {
        TIER_1_FULL: {
            name: 'Full Analysis',
            required: ['metadata', 'thumbnail'],
            preferred: ['transcript', 'frames'],
            confidence: 'HIGH',
            analysisEnabled: {
                visual: true, audio: true, transcript: true, 
                hook: true, retention: true, soundOff: true,
                platform: true, cta: true, narrative: true,
                emotional: true, messaging: true, compliance: true
            }
        },
        TIER_2_PARTIAL: {
            name: 'Partial Analysis',
            required: ['metadata'],
            preferred: ['thumbnail'],
            confidence: 'MEDIUM',
            analysisEnabled: {
                visual: false, audio: false, transcript: false,
                hook: 'limited', retention: 'limited', soundOff: false,
                platform: true, cta: 'limited', narrative: 'limited',
                emotional: 'limited', messaging: true, compliance: 'limited'
            }
        },
        TIER_3_METADATA_ONLY: {
            name: 'Limited Analysis',
            required: ['metadata'],
            confidence: 'LOW',
            analysisEnabled: {
                visual: false, audio: false, transcript: false,
                hook: false, retention: false, soundOff: false,
                platform: 'inferred', cta: false, narrative: false,
                emotional: false, messaging: 'inferred', compliance: false
            }
        },
        TIER_4_NOTHING: {
            name: 'No Analysis Available',
            required: [],
            confidence: 'UNAVAILABLE',
            analysisEnabled: {},
            action: 'prompt_upload'
        }
    };

    // ==================== VIDEO EXTRACTION LAYER CLASS ====================
    class VideoExtractionLayer {
        constructor() {
            this.cache = new Map();
            console.log(`[VideoExtraction] Layer initialized v${VERSION}`);
        }

        // ==================== URL NORMALIZATION ====================
        normalizeUrl(input) {
            if (!input || typeof input !== 'string') {
                return { success: false, error: 'Invalid input' };
            }

            const url = input.trim();
            
            // Detect platform
            for (const [platform, config] of Object.entries(PLATFORM_PATTERNS)) {
                for (const pattern of config.patterns) {
                    if (pattern.test(url)) {
                        const videoId = config.extractId(url);
                        const username = this.extractUsername(url, platform);
                        
                        return {
                            success: true,
                            platform,
                            videoId,
                            username,
                            originalUrl: url,
                            canonicalUrl: config.canonical ? config.canonical(videoId, username) : url,
                            urlType: this.detectUrlType(url),
                            apiEndpoints: config.apiEndpoints || {},
                            platformNote: config.note || null
                        };
                    }
                }
            }

            // Check if it's a direct video URL
            if (/\.(mp4|mov|webm|avi|mkv|m4v)(\?.*)?$/i.test(url)) {
                return {
                    success: true,
                    platform: 'direct',
                    videoId: url,
                    originalUrl: url,
                    canonicalUrl: url,
                    urlType: 'direct'
                };
            }

            return {
                success: false,
                error: 'Unrecognized URL format',
                originalUrl: url,
                suggestedAction: 'upload'
            };
        }

        extractUsername(url, platform) {
            if (platform === 'tiktok') {
                const match = url.match(/@([^\/]+)/);
                return match ? match[1] : null;
            }
            if (platform === 'twitter') {
                const match = url.match(/(?:twitter\.com|x\.com)\/([^\/]+)\/status/);
                return match ? match[1] : null;
            }
            return null;
        }

        detectUrlType(url) {
            if (url.includes('/shorts/') || url.includes('vm.tiktok') || url.includes('/t/')) return 'short';
            if (url.includes('/embed/') || url.includes('player.')) return 'embed';
            if (url.includes('m.youtube') || url.includes('m.tiktok')) return 'mobile';
            if (url.includes('youtu.be') || url.includes('fb.watch')) return 'share';
            return 'full';
        }

        // ==================== PRE-FLIGHT ACCESSIBILITY CHECK ====================
        async checkAccessibility(normalizedUrl) {
            console.log('[VideoExtraction] Running pre-flight accessibility check...');
            
            const result = {
                accessible: false,
                status: null,
                checks: {
                    urlValid: false,
                    platformReachable: false,
                    videoExists: false,
                    publiclyAccessible: false
                },
                restrictions: [],
                userMessage: null
            };

            try {
                // Check 1: URL validity
                result.checks.urlValid = normalizedUrl.success && normalizedUrl.videoId;
                if (!result.checks.urlValid) {
                    result.status = ACCESSIBILITY_STATUS.UNKNOWN_ERROR;
                    result.userMessage = 'Invalid video URL format';
                    return result;
                }

                // Check 2: Try to fetch metadata via oEmbed or similar
                const metadata = await this.fetchMetadata(normalizedUrl);
                
                if (metadata.success) {
                    result.checks.platformReachable = true;
                    result.checks.videoExists = true;
                    result.checks.publiclyAccessible = true;
                    result.accessible = true;
                    result.status = ACCESSIBILITY_STATUS.ACCESSIBLE;
                    result.metadata = metadata.data;
                } else {
                    // Determine specific error
                    result.status = this.determineAccessibilityStatus(metadata.error, normalizedUrl.platform);
                    result.userMessage = result.status.message;
                    
                    if (result.status.action === 'prompt_upload') {
                        result.suggestedAction = 'upload';
                    }
                }

            } catch (error) {
                console.error('[VideoExtraction] Accessibility check failed:', error);
                result.status = ACCESSIBILITY_STATUS.UNKNOWN_ERROR;
                result.userMessage = 'Unable to check video accessibility';
            }

            return result;
        }

        determineAccessibilityStatus(error, platform) {
            const errorStr = String(error).toLowerCase();
            
            if (errorStr.includes('404') || errorStr.includes('not found')) {
                return ACCESSIBILITY_STATUS.DELETED;
            }
            if (errorStr.includes('private')) {
                return ACCESSIBILITY_STATUS.PRIVATE;
            }
            if (errorStr.includes('age') || errorStr.includes('restricted')) {
                return ACCESSIBILITY_STATUS.AGE_GATED;
            }
            if (errorStr.includes('login') || errorStr.includes('auth')) {
                return ACCESSIBILITY_STATUS.REQUIRES_AUTH;
            }
            if (errorStr.includes('region') || errorStr.includes('geo') || errorStr.includes('country')) {
                return ACCESSIBILITY_STATUS.GEO_BLOCKED;
            }
            if (errorStr.includes('rate') || errorStr.includes('429')) {
                return ACCESSIBILITY_STATUS.RATE_LIMITED;
            }
            if (errorStr.includes('live')) {
                return ACCESSIBILITY_STATUS.LIVE_STREAM;
            }
            
            // Platform-specific fallbacks
            if (platform === 'linkedin') {
                return ACCESSIBILITY_STATUS.PLATFORM_UNSUPPORTED;
            }
            
            return ACCESSIBILITY_STATUS.UNKNOWN_ERROR;
        }

        // ==================== METADATA EXTRACTION ====================
        async fetchMetadata(normalizedUrl) {
            const { platform, videoId, apiEndpoints, canonicalUrl, originalUrl } = normalizedUrl;
            
            console.log(`[VideoExtraction] Fetching metadata for ${platform} video: ${videoId}`);

            // Try oEmbed first (most reliable for public videos)
            if (apiEndpoints?.oembed) {
                try {
                    const oembedUrl = typeof apiEndpoints.oembed === 'function' 
                        ? apiEndpoints.oembed(videoId) 
                        : apiEndpoints.oembed;
                    
                    const response = await fetch(oembedUrl);
                    if (response.ok) {
                        const data = await response.json();
                        return {
                            success: true,
                            source: 'oembed',
                            data: this.normalizeOembedData(data, platform, normalizedUrl)
                        };
                    }
                } catch (e) {
                    console.warn('[VideoExtraction] oEmbed fetch failed:', e);
                }
            }

            // Try noembed as fallback (supports many platforms)
            try {
                const noembedUrl = `https://noembed.com/embed?url=${encodeURIComponent(canonicalUrl || originalUrl)}`;
                const response = await fetch(noembedUrl);
                if (response.ok) {
                    const data = await response.json();
                    if (!data.error) {
                        return {
                            success: true,
                            source: 'noembed',
                            data: this.normalizeOembedData(data, platform, normalizedUrl)
                        };
                    }
                }
            } catch (e) {
                console.warn('[VideoExtraction] noembed fetch failed:', e);
            }

            // Platform-specific fallbacks
            if (platform === 'youtube') {
                return await this.fetchYouTubeMetadata(videoId, apiEndpoints);
            }

            return {
                success: false,
                error: 'Could not fetch metadata'
            };
        }

        normalizeOembedData(data, platform, normalizedUrl) {
            return {
                title: data.title || 'Unknown Title',
                description: data.description || '',
                thumbnail: data.thumbnail_url || normalizedUrl.apiEndpoints?.thumbnail?.(normalizedUrl.videoId) || null,
                duration: data.duration || null,
                author: data.author_name || data.author || null,
                authorUrl: data.author_url || null,
                platform,
                videoId: normalizedUrl.videoId,
                canonicalUrl: normalizedUrl.canonicalUrl,
                width: data.width,
                height: data.height,
                extractedAt: new Date().toISOString(),
                source: 'oembed'
            };
        }

        async fetchYouTubeMetadata(videoId, apiEndpoints) {
            // Try to get thumbnail as proof of existence
            const thumbnailUrl = apiEndpoints?.thumbnail?.(videoId) || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            
            try {
                const thumbResponse = await fetch(thumbnailUrl, { method: 'HEAD' });
                if (thumbResponse.ok) {
                    return {
                        success: true,
                        source: 'thumbnail_probe',
                        data: {
                            title: 'YouTube Video',
                            thumbnail: thumbnailUrl,
                            platform: 'youtube',
                            videoId,
                            canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`,
                            extractedAt: new Date().toISOString(),
                            source: 'thumbnail_probe',
                            partialExtraction: true
                        }
                    };
                }
            } catch (e) {
                console.warn('[VideoExtraction] YouTube thumbnail probe failed:', e);
            }

            return { success: false, error: 'YouTube video not accessible' };
        }

        // ==================== FULL EXTRACTION ORCHESTRATION ====================
        async extractVideo(url, options = {}) {
            console.log('[VideoExtraction] Starting extraction for:', url);
            
            const manifest = {
                extractionId: crypto.randomUUID(),
                sourceUrl: url,
                extractionTimestamp: new Date().toISOString(),
                methodsAttempted: [],
                assets: {
                    metadata: { extracted: false, validated: false },
                    thumbnail: { extracted: false, validated: false },
                    transcript: { extracted: false, validated: false },
                    frames: { extracted: false, validated: false }
                },
                tier: 'TIER_4_NOTHING',
                analysisEnabled: {},
                errors: [],
                warnings: [],
                userActionRequired: null
            };

            // Step 1: Normalize URL
            const normalized = this.normalizeUrl(url);
            manifest.normalizedUrl = normalized;
            
            if (!normalized.success) {
                manifest.errors.push({ step: 'normalization', error: normalized.error });
                manifest.userActionRequired = 'INVALID_URL';
                manifest.userMessage = 'We couldn\'t recognize this URL format. Please check the URL or upload the video directly.';
                return manifest;
            }

            manifest.platform = normalized.platform;
            manifest.videoId = normalized.videoId;

            // Step 2: Pre-flight accessibility check
            const accessibility = await this.checkAccessibility(normalized);
            manifest.accessibility = accessibility;

            if (!accessibility.accessible) {
                manifest.userActionRequired = 'UPLOAD_REQUIRED';
                manifest.userMessage = accessibility.userMessage || 'Unable to access this video. Please upload it directly.';
                
                // Still try to use any partial data we got
                if (accessibility.metadata) {
                    manifest.assets.metadata = {
                        extracted: true,
                        validated: true,
                        data: accessibility.metadata,
                        source: 'accessibility_check'
                    };
                }
            }

            // Step 3: Extract metadata (if not already done)
            if (!manifest.assets.metadata.extracted && accessibility.accessible) {
                const metadataResult = await this.fetchMetadata(normalized);
                if (metadataResult.success) {
                    manifest.assets.metadata = {
                        extracted: true,
                        validated: true,
                        data: metadataResult.data,
                        source: metadataResult.source
                    };
                    manifest.methodsAttempted.push({ method: metadataResult.source, success: true, assets: ['metadata'] });
                }
            }

            // Step 4: Extract thumbnail
            const thumbnailResult = await this.extractThumbnail(normalized, manifest.assets.metadata.data);
            if (thumbnailResult.success) {
                manifest.assets.thumbnail = {
                    extracted: true,
                    validated: true,
                    url: thumbnailResult.url,
                    source: thumbnailResult.source
                };
            }

            // Step 5: Try to get transcript (YouTube has auto-captions)
            if (normalized.platform === 'youtube') {
                const transcriptResult = await this.tryExtractYouTubeTranscript(normalized.videoId);
                if (transcriptResult.success) {
                    manifest.assets.transcript = {
                        extracted: true,
                        validated: true,
                        text: transcriptResult.text,
                        timestamped: transcriptResult.timestamped,
                        source: transcriptResult.source,
                        language: transcriptResult.language
                    };
                }
            }

            // Step 6: Determine extraction tier
            manifest.tier = this.determineExtractionTier(manifest.assets);
            manifest.analysisEnabled = EXTRACTION_TIERS[manifest.tier].analysisEnabled;
            manifest.confidence = EXTRACTION_TIERS[manifest.tier].confidence;

            // Step 7: If tier is too low, suggest upload
            if (manifest.tier === 'TIER_4_NOTHING' || manifest.tier === 'TIER_3_METADATA_ONLY') {
                manifest.userActionRequired = manifest.userActionRequired || 'UPLOAD_SUGGESTED';
                manifest.userMessage = manifest.userMessage || 'For full analysis, please upload the video directly.';
            }

            console.log('[VideoExtraction] Extraction complete:', {
                tier: manifest.tier,
                assets: Object.entries(manifest.assets).filter(([k, v]) => v.extracted).map(([k]) => k)
            });

            return manifest;
        }

        async extractThumbnail(normalized, metadata) {
            // Try from metadata first
            if (metadata?.thumbnail) {
                try {
                    const response = await fetch(metadata.thumbnail, { method: 'HEAD' });
                    if (response.ok) {
                        return { success: true, url: metadata.thumbnail, source: 'metadata' };
                    }
                } catch (e) {}
            }

            // Platform-specific thumbnail URLs
            if (normalized.platform === 'youtube') {
                const urls = [
                    `https://img.youtube.com/vi/${normalized.videoId}/maxresdefault.jpg`,
                    `https://img.youtube.com/vi/${normalized.videoId}/hqdefault.jpg`,
                    `https://img.youtube.com/vi/${normalized.videoId}/default.jpg`
                ];
                
                for (const url of urls) {
                    try {
                        const response = await fetch(url, { method: 'HEAD' });
                        if (response.ok) {
                            return { success: true, url, source: 'youtube_api' };
                        }
                    } catch (e) {}
                }
            }

            return { success: false };
        }

        async tryExtractYouTubeTranscript(videoId) {
            // Note: YouTube transcript extraction typically requires server-side processing
            // or the youtube-transcript-api. For client-side, we can only indicate it's available.
            console.log('[VideoExtraction] Transcript extraction would require server-side processing');
            return { 
                success: false, 
                note: 'Transcript extraction requires server-side processing. Upload video for transcript analysis.' 
            };
        }

        determineExtractionTier(assets) {
            const hasMetadata = assets.metadata?.extracted && assets.metadata?.validated;
            const hasThumbnail = assets.thumbnail?.extracted && assets.thumbnail?.validated;
            const hasTranscript = assets.transcript?.extracted && assets.transcript?.validated;
            const hasFrames = assets.frames?.extracted && assets.frames?.validated;

            if (hasMetadata && hasThumbnail && (hasTranscript || hasFrames)) {
                return 'TIER_1_FULL';
            }
            if (hasMetadata && hasThumbnail) {
                return 'TIER_2_PARTIAL';
            }
            if (hasMetadata) {
                return 'TIER_3_METADATA_ONLY';
            }
            return 'TIER_4_NOTHING';
        }

        // ==================== USER UPLOAD HANDLING ====================
        async processUploadedVideo(file) {
            console.log('[VideoExtraction] Processing uploaded video:', file.name);
            
            const manifest = {
                extractionId: crypto.randomUUID(),
                sourceUrl: `upload://${file.name}`,
                extractionTimestamp: new Date().toISOString(),
                uploadedFile: {
                    name: file.name,
                    size: file.size,
                    type: file.type
                },
                assets: {
                    metadata: { extracted: false, validated: false },
                    thumbnail: { extracted: false, validated: false },
                    videoFile: { extracted: true, validated: false, file }
                },
                tier: 'TIER_1_FULL',
                confidence: 'HIGH'
            };

            // Validate video file
            try {
                const videoUrl = URL.createObjectURL(file);
                const video = document.createElement('video');
                
                await new Promise((resolve, reject) => {
                    video.onloadedmetadata = () => {
                        manifest.assets.metadata = {
                            extracted: true,
                            validated: true,
                            data: {
                                title: file.name.replace(/\.[^/.]+$/, ''),
                                duration: video.duration,
                                width: video.videoWidth,
                                height: video.videoHeight,
                                aspectRatio: video.videoWidth / video.videoHeight,
                                platform: 'upload',
                                source: 'file_metadata'
                            }
                        };
                        manifest.assets.videoFile.validated = true;
                        manifest.assets.videoFile.videoUrl = videoUrl;
                        manifest.assets.videoFile.duration = video.duration;
                        resolve();
                    };
                    video.onerror = () => reject(new Error('Invalid video file'));
                    video.src = videoUrl;
                });

                // Extract thumbnail from first frame
                const canvas = document.createElement('canvas');
                const video2 = document.createElement('video');
                video2.src = videoUrl;
                
                await new Promise((resolve) => {
                    video2.onloadeddata = () => {
                        video2.currentTime = 0.5; // Get frame at 0.5s
                    };
                    video2.onseeked = () => {
                        canvas.width = video2.videoWidth;
                        canvas.height = video2.videoHeight;
                        canvas.getContext('2d').drawImage(video2, 0, 0);
                        manifest.assets.thumbnail = {
                            extracted: true,
                            validated: true,
                            url: canvas.toDataURL('image/jpeg', 0.8),
                            source: 'video_frame'
                        };
                        resolve();
                    };
                });

                // Extract key frames
                manifest.assets.frames = await this.extractFramesFromVideo(videoUrl, manifest.assets.metadata.data.duration);

                manifest.analysisEnabled = EXTRACTION_TIERS.TIER_1_FULL.analysisEnabled;

            } catch (error) {
                console.error('[VideoExtraction] Video processing error:', error);
                manifest.errors = [{ step: 'video_processing', error: error.message }];
                manifest.tier = 'TIER_4_NOTHING';
            }

            return manifest;
        }

        async extractFramesFromVideo(videoUrl, duration) {
            const timestamps = [0, 0.5, 1, 2, 3, 5, 10, 15, 30, 60].filter(t => t < duration);
            const frames = [];
            
            const video = document.createElement('video');
            video.src = videoUrl;
            video.muted = true;
            
            await new Promise(resolve => {
                video.onloadeddata = resolve;
            });

            for (const timestamp of timestamps) {
                try {
                    video.currentTime = timestamp;
                    await new Promise(resolve => {
                        video.onseeked = resolve;
                    });
                    
                    const canvas = document.createElement('canvas');
                    canvas.width = Math.min(video.videoWidth, 1280);
                    canvas.height = Math.min(video.videoHeight, 720);
                    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
                    
                    frames.push({
                        timestamp,
                        dataUrl: canvas.toDataURL('image/jpeg', 0.7)
                    });
                } catch (e) {
                    console.warn(`[VideoExtraction] Failed to extract frame at ${timestamp}s:`, e);
                }
            }

            return {
                extracted: frames.length > 0,
                validated: frames.length >= 3,
                frames,
                count: frames.length,
                timestamps: frames.map(f => f.timestamp)
            };
        }

        // ==================== EVIDENCE BUILDER ====================
        buildEvidenceReport(manifest) {
            const report = {
                extractionTier: manifest.tier,
                confidence: manifest.confidence,
                evidenceSources: [],
                limitations: [],
                analysisCapabilities: manifest.analysisEnabled
            };

            // Document what we extracted
            if (manifest.assets.metadata?.extracted) {
                report.evidenceSources.push({
                    type: 'metadata',
                    source: manifest.assets.metadata.source,
                    fields: Object.keys(manifest.assets.metadata.data || {})
                });
            }

            if (manifest.assets.thumbnail?.extracted) {
                report.evidenceSources.push({
                    type: 'thumbnail',
                    source: manifest.assets.thumbnail.source
                });
            }

            if (manifest.assets.transcript?.extracted) {
                report.evidenceSources.push({
                    type: 'transcript',
                    source: manifest.assets.transcript.source,
                    language: manifest.assets.transcript.language,
                    hasTimestamps: manifest.assets.transcript.timestamped
                });
            }

            if (manifest.assets.frames?.extracted) {
                report.evidenceSources.push({
                    type: 'frames',
                    count: manifest.assets.frames.count,
                    timestamps: manifest.assets.frames.timestamps
                });
            }

            // Document limitations
            if (!manifest.assets.transcript?.extracted) {
                report.limitations.push({
                    type: 'no_transcript',
                    impact: 'Cannot analyze spoken content, hook text, CTA wording',
                    recommendation: 'Upload video for transcript extraction'
                });
            }

            if (!manifest.assets.frames?.extracted) {
                report.limitations.push({
                    type: 'no_frames',
                    impact: 'Cannot analyze visual hook, scene composition, text overlays',
                    recommendation: 'Upload video for frame extraction'
                });
            }

            return report;
        }
    }

    // ==================== EXPORT ====================
    window.VideoExtractionLayer = new VideoExtractionLayer();
    window.EXTRACTION_TIERS = EXTRACTION_TIERS;
    window.ACCESSIBILITY_STATUS = ACCESSIBILITY_STATUS;

    console.log(`🎬 Video Extraction Layer v${VERSION} loaded`);
    console.log('   Principles: Never fabricate, Always validate, Show evidence');

})();
