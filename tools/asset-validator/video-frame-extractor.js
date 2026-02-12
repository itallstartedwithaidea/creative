/**
 * Video Frame Extractor v1.0.0
 * Extracts frames from videos for AI analysis
 * Uses Cloudinary for video processing when available
 * Falls back to HTML5 canvas for direct URLs
 * 
 * January 18, 2026
 * 
 * ARCHITECTURE:
 * 1. Social media URLs (Instagram, TikTok, YouTube) → Cloudinary fetch + transform
 * 2. Direct video URLs → HTML5 video + canvas extraction
 * 3. User uploads → Process locally or upload to Cloudinary
 * 
 * OUTPUT: Array of frame URLs/data URIs ready for AI analysis
 */

(function() {
    'use strict';

    const VERSION = '1.0.0';
    
    // Frame extraction timestamps (in seconds)
    const DEFAULT_FRAME_TIMESTAMPS = [0, 1, 3, 5, 7, 10, 15, 20, 30, 45, 60];
    
    // Cloudinary video transformation for frame extraction
    const CLOUDINARY_FRAME_PARAMS = {
        resource_type: 'video',
        format: 'jpg',
        quality: 'auto:good',
        width: 1280,
        height: 720,
        crop: 'limit'
    };

    class VideoFrameExtractor {
        constructor() {
            this.cloudinaryConfig = null;
            this.extractedFrames = new Map();
            this.initCloudinary();
            console.log(`[VideoFrameExtractor] v${VERSION} initialized`);
        }

        initCloudinary() {
            // Get Cloudinary config from settings
            const settings = JSON.parse(localStorage.getItem('cav_v3_settings') || '{}');
            if (settings.cloudinaryCloudName) {
                this.cloudinaryConfig = {
                    cloudName: settings.cloudinaryCloudName,
                    apiKey: settings.cloudinaryApiKey || null
                };
                console.log('[VideoFrameExtractor] Cloudinary configured:', this.cloudinaryConfig.cloudName);
            } else {
                console.warn('[VideoFrameExtractor] Cloudinary not configured - limited extraction available');
            }
        }

        /**
         * Main extraction method - routes to appropriate extractor based on source
         */
        async extractFrames(source, options = {}) {
            const {
                timestamps = DEFAULT_FRAME_TIMESTAMPS,
                maxFrames = 10,
                thumbnailOnly = false,
                progressCallback = null
            } = options;

            console.log('[VideoFrameExtractor] Starting extraction for:', typeof source === 'string' ? source : 'File upload');

            // Determine source type
            if (source instanceof File) {
                return this.extractFromFile(source, timestamps, maxFrames, progressCallback);
            }

            if (typeof source === 'string') {
                const platform = this.detectPlatform(source);
                
                if (platform === 'direct') {
                    return this.extractFromDirectUrl(source, timestamps, maxFrames, progressCallback);
                }
                
                // Social media URLs need special handling
                if (thumbnailOnly || !this.cloudinaryConfig) {
                    return this.extractThumbnailOnly(source, platform, progressCallback);
                }
                
                return this.extractFromSocialMedia(source, platform, timestamps, maxFrames, progressCallback);
            }

            throw new Error('Invalid source: must be a File or URL string');
        }

        /**
         * Detect platform from URL
         */
        detectPlatform(url) {
            if (/youtube\.com|youtu\.be/i.test(url)) return 'youtube';
            if (/instagram\.com/i.test(url)) return 'instagram';
            if (/tiktok\.com|vm\.tiktok/i.test(url)) return 'tiktok';
            if (/facebook\.com|fb\.watch/i.test(url)) return 'facebook';
            if (/twitter\.com|x\.com/i.test(url)) return 'twitter';
            if (/vimeo\.com/i.test(url)) return 'vimeo';
            if (/linkedin\.com/i.test(url)) return 'linkedin';
            if (/\.(mp4|mov|webm|avi|mkv|m4v)(\?.*)?$/i.test(url)) return 'direct';
            return 'unknown';
        }

        /**
         * Extract video ID from URL
         */
        extractVideoId(url, platform) {
            const patterns = {
                youtube: [
                    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
                    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
                ],
                instagram: [/(?:p|reel|reels|tv)\/([a-zA-Z0-9_-]+)/],
                tiktok: [/video\/(\d+)/, /vm\.tiktok\.com\/([a-zA-Z0-9]+)/, /\/t\/([a-zA-Z0-9]+)/],
                facebook: [/watch\/?\?v=(\d+)/, /videos\/(\d+)/, /reel\/(\d+)/],
                twitter: [/status\/(\d+)/],
                vimeo: [/vimeo\.com\/(\d+)/]
            };

            const platformPatterns = patterns[platform] || [];
            for (const pattern of platformPatterns) {
                const match = url.match(pattern);
                if (match) return match[1];
            }
            return null;
        }

        /**
         * Extract frames from uploaded file using HTML5 Video + Canvas
         */
        async extractFromFile(file, timestamps, maxFrames, progressCallback) {
            console.log('[VideoFrameExtractor] Extracting from file:', file.name);
            
            return new Promise((resolve, reject) => {
                const video = document.createElement('video');
                video.muted = true;
                video.preload = 'metadata';
                
                const frames = [];
                const url = URL.createObjectURL(file);
                
                video.onloadedmetadata = async () => {
                    const duration = video.duration;
                    console.log(`[VideoFrameExtractor] Video duration: ${duration}s`);
                    
                    // Adjust timestamps based on video duration
                    const validTimestamps = timestamps
                        .filter(t => t < duration)
                        .slice(0, maxFrames);
                    
                    // Add end frame if not already included
                    if (validTimestamps[validTimestamps.length - 1] < duration - 1) {
                        validTimestamps.push(Math.max(0, duration - 1));
                    }
                    
                    try {
                        for (let i = 0; i < validTimestamps.length; i++) {
                            const timestamp = validTimestamps[i];
                            if (progressCallback) {
                                progressCallback(`Extracting frame ${i + 1}/${validTimestamps.length}`, (i / validTimestamps.length) * 100);
                            }
                            
                            const frameData = await this.captureFrame(video, timestamp);
                            frames.push({
                                timestamp,
                                dataUrl: frameData,
                                source: 'file',
                                label: this.getFrameLabel(timestamp, duration)
                            });
                        }
                        
                        URL.revokeObjectURL(url);
                        
                        resolve({
                            success: true,
                            frames,
                            duration,
                            source: 'file',
                            fileName: file.name,
                            fileSize: file.size,
                            metadata: {
                                width: video.videoWidth,
                                height: video.videoHeight,
                                duration: video.duration
                            }
                        });
                    } catch (error) {
                        URL.revokeObjectURL(url);
                        reject(error);
                    }
                };
                
                video.onerror = () => {
                    URL.revokeObjectURL(url);
                    reject(new Error('Failed to load video file'));
                };
                
                video.src = url;
            });
        }

        /**
         * Capture a single frame from video at timestamp
         */
        captureFrame(video, timestamp) {
            return new Promise((resolve, reject) => {
                video.currentTime = timestamp;
                
                video.onseeked = () => {
                    try {
                        const canvas = document.createElement('canvas');
                        canvas.width = Math.min(video.videoWidth, 1280);
                        canvas.height = Math.min(video.videoHeight, 720);
                        
                        // Maintain aspect ratio
                        const scale = Math.min(
                            canvas.width / video.videoWidth,
                            canvas.height / video.videoHeight
                        );
                        const scaledWidth = video.videoWidth * scale;
                        const scaledHeight = video.videoHeight * scale;
                        const offsetX = (canvas.width - scaledWidth) / 2;
                        const offsetY = (canvas.height - scaledHeight) / 2;
                        
                        const ctx = canvas.getContext('2d');
                        ctx.fillStyle = '#000';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(video, offsetX, offsetY, scaledWidth, scaledHeight);
                        
                        resolve(canvas.toDataURL('image/jpeg', 0.85));
                    } catch (error) {
                        reject(error);
                    }
                };
                
                video.onerror = () => reject(new Error(`Failed to seek to ${timestamp}s`));
            });
        }

        /**
         * Extract frames from direct video URL (CORS permitting)
         */
        async extractFromDirectUrl(url, timestamps, maxFrames, progressCallback) {
            console.log('[VideoFrameExtractor] Extracting from direct URL:', url);
            
            // If we have Cloudinary, use it for better reliability
            if (this.cloudinaryConfig) {
                return this.extractViaCloudinary(url, timestamps, maxFrames, progressCallback);
            }
            
            // Try HTML5 video (may fail due to CORS)
            return new Promise((resolve, reject) => {
                const video = document.createElement('video');
                video.crossOrigin = 'anonymous';
                video.muted = true;
                video.preload = 'metadata';
                
                video.onloadedmetadata = async () => {
                    try {
                        const duration = video.duration;
                        const validTimestamps = timestamps.filter(t => t < duration).slice(0, maxFrames);
                        const frames = [];
                        
                        for (let i = 0; i < validTimestamps.length; i++) {
                            const timestamp = validTimestamps[i];
                            if (progressCallback) {
                                progressCallback(`Extracting frame ${i + 1}/${validTimestamps.length}`, (i / validTimestamps.length) * 100);
                            }
                            
                            const frameData = await this.captureFrame(video, timestamp);
                            frames.push({
                                timestamp,
                                dataUrl: frameData,
                                source: 'direct_url',
                                label: this.getFrameLabel(timestamp, duration)
                            });
                        }
                        
                        resolve({
                            success: true,
                            frames,
                            duration,
                            source: 'direct_url',
                            url,
                            metadata: {
                                width: video.videoWidth,
                                height: video.videoHeight,
                                duration: video.duration
                            }
                        });
                    } catch (error) {
                        // CORS likely blocked - suggest upload
                        resolve({
                            success: false,
                            error: 'CORS_BLOCKED',
                            message: 'Cannot access video due to cross-origin restrictions. Please upload the video file directly.',
                            suggestUpload: true
                        });
                    }
                };
                
                video.onerror = () => {
                    resolve({
                        success: false,
                        error: 'LOAD_FAILED',
                        message: 'Could not load video from URL. Please upload the video file directly.',
                        suggestUpload: true
                    });
                };
                
                video.src = url;
            });
        }

        /**
         * Extract frames from social media platforms using Cloudinary
         */
        async extractFromSocialMedia(url, platform, timestamps, maxFrames, progressCallback) {
            console.log(`[VideoFrameExtractor] Extracting from ${platform}:`, url);
            
            if (!this.cloudinaryConfig) {
                return this.extractThumbnailOnly(url, platform, progressCallback);
            }
            
            // For YouTube, we can use Cloudinary's fetch to get video frames
            if (platform === 'youtube') {
                return this.extractYouTubeFrames(url, timestamps, maxFrames, progressCallback);
            }
            
            // For Instagram, TikTok, etc. - these platforms block automated access
            // Best we can do is get thumbnail + metadata
            if (progressCallback) {
                progressCallback('Fetching video metadata...', 10);
            }
            
            const metadata = await this.fetchVideoMetadata(url, platform);
            
            if (!metadata.success) {
                return {
                    success: false,
                    error: 'PLATFORM_RESTRICTED',
                    platform,
                    message: `${this.getPlatformName(platform)} restricts automated video access. Please download the video and upload it directly for full analysis.`,
                    suggestUpload: true,
                    partialData: metadata
                };
            }
            
            // Return thumbnail-only result with clear messaging
            return {
                success: true,
                partial: true,
                frames: metadata.thumbnail ? [{
                    timestamp: 0,
                    url: metadata.thumbnail,
                    source: platform,
                    label: 'Thumbnail (Platform restricted - upload for full analysis)'
                }] : [],
                metadata,
                platform,
                limitation: `${this.getPlatformName(platform)} doesn't allow automated video access. For full frame-by-frame analysis, please download and upload the video.`,
                suggestUpload: true
            };
        }

        /**
         * Extract frames from YouTube using thumbnail URLs
         * YouTube exposes frame thumbnails at specific timestamps
         */
        async extractYouTubeFrames(url, timestamps, maxFrames, progressCallback) {
            const videoId = this.extractVideoId(url, 'youtube');
            if (!videoId) {
                return { success: false, error: 'INVALID_URL', message: 'Could not extract YouTube video ID' };
            }
            
            console.log('[VideoFrameExtractor] Extracting YouTube frames for:', videoId);
            
            const frames = [];
            
            // YouTube thumbnail endpoints
            const thumbnailQualities = [
                { suffix: 'maxresdefault', width: 1280, height: 720 },
                { suffix: 'sddefault', width: 640, height: 480 },
                { suffix: 'hqdefault', width: 480, height: 360 }
            ];
            
            // Get main thumbnail
            if (progressCallback) progressCallback('Fetching YouTube thumbnail...', 20);
            
            for (const quality of thumbnailQualities) {
                const thumbUrl = `https://img.youtube.com/vi/${videoId}/${quality.suffix}.jpg`;
                const isValid = await this.validateImageUrl(thumbUrl);
                
                if (isValid) {
                    frames.push({
                        timestamp: 0,
                        url: thumbUrl,
                        source: 'youtube',
                        label: 'Video Thumbnail',
                        resolution: `${quality.width}x${quality.height}`
                    });
                    break;
                }
            }
            
            // YouTube also has storyboard images - try to get them
            // These are at specific timestamps: 1, 2, 3 (thumbnail URLs)
            const storyboardFrames = ['1', '2', '3'];
            for (let i = 0; i < storyboardFrames.length; i++) {
                if (progressCallback) progressCallback(`Fetching frame ${i + 2}/${storyboardFrames.length + 1}...`, 30 + (i * 20));
                
                const frameUrl = `https://img.youtube.com/vi/${videoId}/${storyboardFrames[i]}.jpg`;
                const isValid = await this.validateImageUrl(frameUrl);
                
                if (isValid) {
                    frames.push({
                        timestamp: (i + 1) * 30, // Approximate timestamps
                        url: frameUrl,
                        source: 'youtube',
                        label: `Frame ${i + 1}`
                    });
                }
            }
            
            // Get oEmbed metadata
            const metadata = await this.fetchVideoMetadata(url, 'youtube');
            
            if (frames.length === 0) {
                return {
                    success: false,
                    error: 'NO_FRAMES',
                    message: 'Could not extract any frames from this YouTube video. It may be private or restricted.',
                    suggestUpload: true
                };
            }
            
            return {
                success: true,
                frames: frames.slice(0, maxFrames),
                metadata,
                platform: 'youtube',
                videoId,
                limitation: frames.length < maxFrames ? 
                    'YouTube limits frame access. For complete frame-by-frame analysis, download and upload the video.' : null
            };
        }

        /**
         * Extract via Cloudinary's fetch transformation
         */
        async extractViaCloudinary(videoUrl, timestamps, maxFrames, progressCallback) {
            if (!this.cloudinaryConfig) {
                return { success: false, error: 'NO_CLOUDINARY', message: 'Cloudinary not configured' };
            }
            
            const frames = [];
            const { cloudName } = this.cloudinaryConfig;
            
            // Cloudinary can fetch external videos and extract frames
            // Format: https://res.cloudinary.com/{cloud}/video/fetch/so_{seconds}/{encoded_url}.jpg
            const encodedUrl = encodeURIComponent(videoUrl);
            
            for (let i = 0; i < Math.min(timestamps.length, maxFrames); i++) {
                const timestamp = timestamps[i];
                if (progressCallback) {
                    progressCallback(`Extracting frame at ${timestamp}s...`, (i / maxFrames) * 100);
                }
                
                // Cloudinary fetch URL for video frame
                const frameUrl = `https://res.cloudinary.com/${cloudName}/video/fetch/w_1280,h_720,c_limit,so_${timestamp}/${encodedUrl}.jpg`;
                
                // Validate the frame URL
                const isValid = await this.validateImageUrl(frameUrl);
                
                if (isValid) {
                    frames.push({
                        timestamp,
                        url: frameUrl,
                        source: 'cloudinary_fetch',
                        label: this.getFrameLabel(timestamp, null)
                    });
                }
            }
            
            return {
                success: frames.length > 0,
                frames,
                source: 'cloudinary_fetch',
                originalUrl: videoUrl
            };
        }

        /**
         * Fallback: Get thumbnail only
         */
        async extractThumbnailOnly(url, platform, progressCallback) {
            if (progressCallback) progressCallback('Fetching thumbnail...', 50);
            
            const metadata = await this.fetchVideoMetadata(url, platform);
            
            return {
                success: metadata.success,
                partial: true,
                frames: metadata.thumbnail ? [{
                    timestamp: 0,
                    url: metadata.thumbnail,
                    source: platform,
                    label: 'Video Thumbnail'
                }] : [],
                metadata,
                platform,
                limitation: 'Only thumbnail available. Upload video file for full frame analysis.'
            };
        }

        /**
         * Fetch video metadata via oEmbed
         */
        async fetchVideoMetadata(url, platform) {
            const oEmbedEndpoints = {
                youtube: `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
                vimeo: `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`,
                tiktok: `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
                instagram: `https://api.instagram.com/oembed?url=${encodeURIComponent(url)}`
            };
            
            const endpoint = oEmbedEndpoints[platform];
            if (!endpoint) {
                return { success: false, error: 'NO_OEMBED', platform };
            }
            
            try {
                const response = await fetch(endpoint);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                
                const data = await response.json();
                
                return {
                    success: true,
                    title: data.title || null,
                    author: data.author_name || null,
                    authorUrl: data.author_url || null,
                    thumbnail: data.thumbnail_url || null,
                    thumbnailWidth: data.thumbnail_width || null,
                    thumbnailHeight: data.thumbnail_height || null,
                    duration: data.duration || null,
                    html: data.html || null,
                    providerName: data.provider_name || platform,
                    raw: data
                };
            } catch (error) {
                console.warn(`[VideoFrameExtractor] oEmbed failed for ${platform}:`, error.message);
                
                // Try noembed as fallback
                try {
                    const noembedResponse = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
                    if (noembedResponse.ok) {
                        const noembedData = await noembedResponse.json();
                        if (!noembedData.error) {
                            return {
                                success: true,
                                title: noembedData.title || null,
                                author: noembedData.author_name || null,
                                thumbnail: noembedData.thumbnail_url || null,
                                providerName: noembedData.provider_name || platform,
                                raw: noembedData
                            };
                        }
                    }
                } catch (e) {
                    // Ignore noembed error
                }
                
                return { success: false, error: error.message, platform };
            }
        }

        /**
         * Validate an image URL is accessible
         */
        validateImageUrl(url) {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve(img.width > 1 && img.height > 1);
                img.onerror = () => resolve(false);
                img.src = url;
                
                // Timeout after 5 seconds
                setTimeout(() => resolve(false), 5000);
            });
        }

        /**
         * Get human-readable frame label
         */
        getFrameLabel(timestamp, duration) {
            if (timestamp === 0) return 'Opening Frame (0s)';
            if (timestamp <= 3) return `Hook (${timestamp}s)`;
            if (timestamp <= 7) return `Early (${timestamp}s)`;
            if (duration && timestamp >= duration - 5) return `Closing (${timestamp}s)`;
            return `${timestamp}s`;
        }

        /**
         * Get platform display name
         */
        getPlatformName(platform) {
            const names = {
                youtube: 'YouTube',
                instagram: 'Instagram',
                tiktok: 'TikTok',
                facebook: 'Facebook',
                twitter: 'X (Twitter)',
                vimeo: 'Vimeo',
                linkedin: 'LinkedIn',
                direct: 'Direct Video'
            };
            return names[platform] || platform;
        }

        /**
         * Convert data URL to Blob for upload
         */
        dataUrlToBlob(dataUrl) {
            const parts = dataUrl.split(',');
            const mime = parts[0].match(/:(.*?);/)[1];
            const bstr = atob(parts[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], { type: mime });
        }

        /**
         * Upload extracted frames to Cloudinary for storage
         */
        async uploadFramesToCloudinary(frames, analysisId) {
            if (!this.cloudinaryConfig || !this.cloudinaryConfig.apiKey) {
                console.warn('[VideoFrameExtractor] Cannot upload - Cloudinary API key not configured');
                return frames; // Return as-is
            }
            
            const uploadedFrames = [];
            
            for (const frame of frames) {
                if (frame.dataUrl) {
                    try {
                        const blob = this.dataUrlToBlob(frame.dataUrl);
                        const formData = new FormData();
                        formData.append('file', blob, `frame_${frame.timestamp}s.jpg`);
                        formData.append('upload_preset', 'cav_frames');
                        formData.append('folder', `video_analysis/${analysisId}`);
                        
                        const response = await fetch(
                            `https://api.cloudinary.com/v1_1/${this.cloudinaryConfig.cloudName}/image/upload`,
                            { method: 'POST', body: formData }
                        );
                        
                        if (response.ok) {
                            const data = await response.json();
                            uploadedFrames.push({
                                ...frame,
                                cloudinaryUrl: data.secure_url,
                                publicId: data.public_id
                            });
                        } else {
                            uploadedFrames.push(frame);
                        }
                    } catch (error) {
                        console.warn('[VideoFrameExtractor] Frame upload failed:', error);
                        uploadedFrames.push(frame);
                    }
                } else {
                    uploadedFrames.push(frame);
                }
            }
            
            return uploadedFrames;
        }
    }

    // Export globally
    window.VideoFrameExtractor = new VideoFrameExtractor();
    
    console.log('[VideoFrameExtractor] Module loaded v' + VERSION);

})();
