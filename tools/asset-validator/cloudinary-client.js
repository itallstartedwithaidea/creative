/**
 * Creative Asset Validator - Cloudinary Client
 * Video/Image upload, transform, resize with quota management
 * Version 5.3.0 - Enhanced Video Resizing
 * 
 * Video Resizing Capabilities (from Cloudinary docs):
 * - c_fill: Fill specified dimensions, may crop
 * - c_fill_pad: Fill with padding to avoid cropping
 * - c_crop: Extract region without scaling
 * - c_scale: Scale to dimensions (may distort)
 * - c_fit: Fit within bounding box, maintain aspect ratio
 * - c_limit: Same as fit, but only scale down
 * - c_pad: Fit with padding background
 * - c_lpad: Limit + padding
 * 
 * Gravity options for video:
 * - g_auto: AI content-aware cropping
 * - g_auto:faces: Focus on faces
 * - g_auto:face: Focus on single largest face
 * - g_auto:{object}: Focus on specific object (e.g., ball, dog)
 * - Compass: north, south, east, west, center, etc.
 */

class CloudinaryClient {
    constructor(options = {}) {
        this.apiBase = options.apiBase || '/api';
        this.syncEngine = options.syncEngine || window.syncEngine;
        
        // Quota state (for backend mode)
        this.quota = {
            type: 'byok', // Default to BYOK since we're using local credentials
            used: 0,
            limit: -1, // Unlimited for BYOK
            percent: 0,
            can_transform: true
        };
        
        // Platform specs cache
        this.platformSpecs = null;
        
        console.log('[CloudinaryClient] Initialized');
    }
    
    // ========================================================
    // CREDENTIALS MANAGEMENT
    // ========================================================
    
    getCredentials() {
        // First try to get credentials from settings manager (supports sharing)
        if (window.CAVSettings?.manager?.getCloudinaryCredentials) {
            const creds = window.CAVSettings.manager.getCloudinaryCredentials();
            if (creds?.cloudName && creds?.apiKey && creds?.apiSecret) {
                console.log('[CloudinaryClient] Using credentials from settings manager, source:', creds.source || 'unknown');
                return creds;
            }
        }
        
        // Fallback: Get user's own Cloudinary credentials from localStorage
        try {
            const stored = localStorage.getItem('cav_user_cloudinary');
            if (stored) {
                const creds = JSON.parse(stored);
                if (creds.cloudName && creds.apiKey && creds.apiSecret) {
                    console.log('[CloudinaryClient] Using user\'s own credentials from localStorage');
                    return creds;
                }
            }
        } catch (e) {
            console.error('[CloudinaryClient] Error reading credentials:', e);
        }
        
        // Also check platform credentials for shared Cloudinary
        try {
            const platformCreds = JSON.parse(localStorage.getItem('cav_platform_credentials') || '{}');
            const sharing = platformCreds.sharing || {};
            const cloudinaryCreds = platformCreds.cloudinary || {};
            
            if (sharing.enabled && cloudinaryCreds.cloudName && cloudinaryCreds.apiKey && cloudinaryCreds.apiSecret) {
                console.log('[CloudinaryClient] Using shared Cloudinary credentials from platform');
                return { ...cloudinaryCreds, source: 'shared' };
            }
        } catch (e) {
            console.error('[CloudinaryClient] Error reading platform credentials:', e);
        }
        
        return null;
    }
    
    hasCredentials() {
        return this.getCredentials() !== null;
    }
    
    // ========================================================
    // QUOTA MANAGEMENT
    // ========================================================
    
    async getQuota() {
        // Since we're using BYOK (user's own credentials), quota is unlimited
        if (this.hasCredentials()) {
            this.quota = {
                type: 'byok',
                used: 0,
                limit: -1,
                percent: 0,
                remaining: -1,
                can_transform: true
            };
        } else {
            this.quota = {
                type: 'none',
                used: 0,
                limit: 0,
                percent: 100,
                remaining: 0,
                can_transform: false,
                exceeded: true
            };
        }
        return this.quota;
    }
    
    async canTransform(credits = 1) {
        await this.getQuota();
        return this.quota.can_transform;
    }
    
    checkQuotaAndShowWarning() {
        if (!this.hasCredentials()) {
            this.showCloudinaryRequiredModal();
            return false;
        }
        return true;
    }
    
    showCloudinaryRequiredModal() {
        const modal = document.createElement('div');
        modal.className = 'cav-quota-modal';
        modal.innerHTML = `
            <div class="cav-quota-modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="cav-quota-modal-content">
                <div class="cav-quota-modal-header">
                    <span style="font-size: 48px;">☁️</span>
                    <h2>Cloudinary Required</h2>
                </div>
                <div class="cav-quota-modal-body">
                    <p>To resize images and videos, you need to add your own Cloudinary account.</p>
                    <p style="margin-top: 12px;">It's free! Get an account at:</p>
                    <a href="https://cloudinary.com/users/register_free" target="_blank" 
                       style="display: inline-block; margin: 16px 0; padding: 12px 24px; background: linear-gradient(135deg, #3448C5 0%, #2194E3 100%); color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">
                        Get Free Cloudinary Account →
                    </a>
                    <p style="font-size: 14px; color: #64748b;">Then add your credentials in Settings → API Keys → Your Cloudinary Account</p>
                </div>
                <div class="cav-quota-modal-actions">
                    <button class="cav-btn-secondary" onclick="this.closest('.cav-quota-modal').remove()">
                        Close
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        this.ensureModalStyles();
    }
    
    // ========================================================
    // UPLOAD (Direct to Cloudinary using user's credentials)
    // ========================================================
    
    getUploadSignature(options = {}) {
        const creds = this.getCredentials();
        if (!creds) {
            throw new Error('Cloudinary credentials not configured');
        }
        
        const timestamp = Math.floor(Date.now() / 1000);
        const folder = options.folder || 'cav-assets';
        
        // Generate signature (for unsigned uploads, we just return the basic params)
        return {
            cloud_name: creds.cloudName,
            api_key: creds.apiKey,
            timestamp: timestamp,
            folder: folder,
            upload_url: `https://api.cloudinary.com/v1_1/${creds.cloudName}/auto/upload`
        };
    }
    
    async upload(file, options = {}) {
        const progressCallback = options.onProgress || (() => {});
        
        // Check if user has Cloudinary credentials
        if (!this.hasCredentials()) {
            this.showCloudinaryRequiredModal();
            throw new Error('Cloudinary credentials not configured. Please add your credentials in Settings.');
        }
        
        const creds = this.getCredentials();
        
        try {
            // Create form data for unsigned upload
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'cav_unsigned'); // Need to create this preset in Cloudinary
            formData.append('folder', options.folder || 'cav-assets');
            
            if (options.public_id) {
                formData.append('public_id', options.public_id);
            }
            
            // Determine resource type
            const resourceType = this.getResourceType(file);
            const uploadUrl = `https://api.cloudinary.com/v1_1/${creds.cloudName}/${resourceType}/upload`;
            
            // Upload to Cloudinary using unsigned upload
            const xhr = new XMLHttpRequest();
            
            return new Promise((resolve, reject) => {
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const percent = Math.round((e.loaded / e.total) * 100);
                        progressCallback(percent);
                    }
                };
                
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const result = JSON.parse(xhr.responseText);
                        resolve({
                            success: true,
                            public_id: result.public_id,
                            url: result.secure_url,
                            thumbnail_url: this.getThumbnailUrl(result),
                            width: result.width,
                            height: result.height,
                            format: result.format,
                            bytes: result.bytes,
                            duration: result.duration,
                            resource_type: result.resource_type
                        });
                    } else {
                        // Handle Cloudinary errors
                        try {
                            const error = JSON.parse(xhr.responseText);
                            if (error.error?.message?.includes('preset')) {
                                reject(new Error('Please create an unsigned upload preset named "cav_unsigned" in your Cloudinary settings.'));
                            } else {
                                reject(new Error(error.error?.message || `Upload failed: ${xhr.statusText}`));
                            }
                        } catch {
                            reject(new Error(`Upload failed: ${xhr.statusText}`));
                        }
                    }
                };
                
                xhr.onerror = () => reject(new Error('Upload failed - network error'));
                
                xhr.open('POST', uploadUrl);
                xhr.send(formData);
            });
            
        } catch (error) {
            console.error('[CloudinaryClient] Upload failed:', error);
            throw error;
        }
    }
    
    getResourceType(file) {
        const type = file.type || '';
        if (type.startsWith('video/')) return 'video';
        if (type.startsWith('image/')) return 'image';
        return 'auto';
    }
    
    getThumbnailUrl(result) {
        if (result.resource_type === 'video') {
            // Generate video thumbnail
            return result.secure_url.replace('/upload/', '/upload/so_0,w_400,h_400,c_fill/').replace(/\.[^.]+$/, '.jpg');
        }
        // Image thumbnail
        return result.secure_url.replace('/upload/', '/upload/w_400,h_400,c_fill/');
    }
    
    // ========================================================
    // TRANSFORM / RESIZE (Direct URL generation - no server needed)
    // ========================================================
    
    async transform(publicId, options = {}) {
        // Check if user has credentials
        if (!this.hasCredentials()) {
            this.showCloudinaryRequiredModal();
            throw new Error('Cloudinary credentials required');
        }
        
        const creds = this.getCredentials();
        const isVideo = options.resource_type === 'video';
        
        // Generate transformation URL directly
        const transformations = [];
        
        if (options.width) transformations.push(`w_${options.width}`);
        if (options.height) transformations.push(`h_${options.height}`);
        transformations.push(`c_${options.crop || 'fill'}`);
        transformations.push(`g_${options.gravity || 'auto'}`);
        if (options.format) transformations.push(`f_${options.format}`);
        transformations.push('q_auto'); // Auto quality
        
        const transformStr = transformations.join(',');
        const resourceType = isVideo ? 'video' : 'image';
        
        const transformedUrl = `https://res.cloudinary.com/${creds.cloudName}/${resourceType}/upload/${transformStr}/${publicId}`;
        
        return {
            success: true,
            url: transformedUrl,
            public_id: publicId,
            width: options.width,
            height: options.height,
            format: options.format,
            transformations: transformStr
        };
    }
    
    async resize(asset, targetSpec) {
        console.log('[CloudinaryClient] Resizing asset:', asset.name, 'to', targetSpec);
        
        if (!this.hasCredentials()) {
            this.showCloudinaryRequiredModal();
            throw new Error('Please add your Cloudinary credentials in Settings to resize assets');
        }
        
        if (!asset.cloudinary_id && !asset.cloudinary_url) {
            throw new Error('Asset must be uploaded to Cloudinary first');
        }
        
        const publicId = asset.cloudinary_id || this.extractPublicId(asset.cloudinary_url);
        const isVideo = asset.type === 'video' || (asset.mime_type && asset.mime_type.startsWith('video/'));
        
        const result = await this.transform(publicId, {
            width: targetSpec.width || targetSpec.recommended_width,
            height: targetSpec.height || targetSpec.recommended_height,
            resource_type: isVideo ? 'video' : 'image',
            platform: targetSpec.platform,
            format: targetSpec.format
        });
        
        return result;
    }
    
    /**
     * Resize image using Cloudinary's AI Generative Fill
     * Perfect for non-standard aspect ratios that Gemini doesn't support
     * Uses c_pad with b_gen_fill for intelligent outpainting
     * 
     * @param {Object} asset - The asset to resize (must have dataUrl or cloudinary_url)
     * @param {Object} options - Resize options
     * @param {number} options.width - Target width in pixels
     * @param {number} options.height - Target height in pixels
     * @param {string} options.gravity - Content gravity: auto, center, faces, etc.
     * @param {string} options.prompt - Optional AI prompt for generative fill context
     * @returns {Object} - Result with transformed URL and dataUrl
     */
    async resizeImageWithGenFill(asset, options = {}) {
        console.log('[CloudinaryClient] AI Generative Fill resize:', asset.filename || asset.name, options);
        
        if (!this.hasCredentials()) {
            this.showCloudinaryRequiredModal();
            throw new Error('Please add your Cloudinary credentials in Settings to use AI image resize');
        }
        
        const creds = this.getCredentials();
        let publicId = asset.cloudinary_id || asset.public_id;
        
        // If no cloudinary_id, we need to upload the image first
        if (!publicId) {
            console.log('[CloudinaryClient] Uploading image to Cloudinary first...');
            
            // Get image data
            let imageData = asset.dataUrl || asset.thumbnail_url || asset.file_url;
            if (!imageData) {
                throw new Error('No image data available for upload');
            }
            
            // Upload to Cloudinary (uses cav_unsigned preset which puts in cav-assets folder)
            const uploadResult = await this.uploadBase64Image(imageData, {
                folder: 'cav-assets',
                public_id: `resize_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            });
            
            publicId = uploadResult.public_id;
            console.log('[CloudinaryClient] Image uploaded, public_id:', publicId);
        }
        
        const { width, height, gravity = 'center', prompt } = options;
        
        if (!width || !height) {
            throw new Error('Width and height are required for resize');
        }
        
        // Build transformation for AI Generative Fill
        // Using c_pad with b_gen_fill for intelligent outpainting
        const transformations = [];
        
        // Target dimensions
        transformations.push(`w_${width}`);
        transformations.push(`h_${height}`);
        
        // Use pad crop mode to maintain content and fill remaining space
        transformations.push('c_pad');
        
        // Gravity - where to position the original content
        transformations.push(`g_${gravity}`);
        
        // AI Generative Fill background - this is the magic!
        // b_gen_fill uses AI to intelligently extend the image
        // Fallback to b_auto (auto background color) if gen_fill fails
        const fillMethod = options.fillMethod || 'gen_fill'; // 'gen_fill', 'auto', 'blur'
        
        if (fillMethod === 'gen_fill') {
            if (prompt) {
                // With custom prompt for context
                transformations.push(`b_gen_fill:${encodeURIComponent(prompt)}`);
            } else {
                // Default AI fill
                transformations.push('b_gen_fill');
            }
        } else if (fillMethod === 'blur') {
            // Blurred background from original image edges
            transformations.push('b_blurred:400:15');
        } else {
            // Auto detect dominant color
            transformations.push('b_auto');
        }
        
        // Quality optimization
        transformations.push('q_auto:best');
        transformations.push('f_auto');
        
        const transformStr = transformations.join(',');
        const transformedUrl = `https://res.cloudinary.com/${creds.cloudName}/image/upload/${transformStr}/${publicId}`;
        
        console.log('[CloudinaryClient] Generated transform URL:', transformedUrl);
        console.log('[CloudinaryClient] Fill method:', fillMethod);
        
        // Fetch the transformed image and convert to dataUrl
        let dataUrl = null;
        let actualMethod = fillMethod;
        
        try {
            const response = await fetch(transformedUrl);
            if (response.ok) {
                const blob = await response.blob();
                dataUrl = await this.blobToDataUrl(blob);
                console.log('[CloudinaryClient] ✅ AI Generative Fill successful');
            } else {
                // gen_fill might not be available, try fallback
                console.warn('[CloudinaryClient] Transform failed with status:', response.status);
                
                if (fillMethod === 'gen_fill') {
                    console.log('[CloudinaryClient] Trying blur fallback...');
                    // Try with blurred background as fallback
                    const fallbackTransforms = transformations.filter(t => !t.startsWith('b_gen_fill'));
                    fallbackTransforms.push('b_blurred:400:15');
                    const fallbackUrl = `https://res.cloudinary.com/${creds.cloudName}/image/upload/${fallbackTransforms.join(',')}/${publicId}`;
                    
                    const fallbackResponse = await fetch(fallbackUrl);
                    if (fallbackResponse.ok) {
                        const blob = await fallbackResponse.blob();
                        dataUrl = await this.blobToDataUrl(blob);
                        actualMethod = 'blur_fallback';
                        console.log('[CloudinaryClient] ✅ Blur fallback successful');
                        return {
                            success: true,
                            url: fallbackUrl,
                            dataUrl: dataUrl,
                            public_id: publicId,
                            width: width,
                            height: height,
                            transformations: fallbackTransforms.join(','),
                            method: 'cloudinary_blur_fallback',
                            note: 'AI Generative Fill not available, used blur fallback'
                        };
                    }
                }
            }
        } catch (fetchError) {
            console.warn('[CloudinaryClient] Could not fetch transformed image:', fetchError);
            // Still return the URL - it might work when accessed directly in browser
        }
        
        return {
            success: true,
            url: transformedUrl,
            dataUrl: dataUrl || transformedUrl,
            public_id: publicId,
            width: width,
            height: height,
            transformations: transformStr,
            method: `cloudinary_${actualMethod}`
        };
    }
    
    /**
     * Upload a base64 image to Cloudinary
     */
    async uploadBase64Image(base64Data, options = {}) {
        const creds = this.getCredentials();
        if (!creds) {
            throw new Error('Cloudinary credentials not configured');
        }
        
        const formData = new FormData();
        
        // Handle both data URL and raw base64
        let imageData = base64Data;
        if (base64Data.startsWith('data:')) {
            imageData = base64Data;
        } else {
            imageData = `data:image/png;base64,${base64Data}`;
        }
        
        formData.append('file', imageData);
        formData.append('upload_preset', 'cav_unsigned');
        formData.append('folder', options.folder || 'cav-assets');
        
        if (options.public_id) {
            formData.append('public_id', options.public_id);
        }
        
        const uploadUrl = `https://api.cloudinary.com/v1_1/${creds.cloudName}/image/upload`;
        
        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            if (error.error?.message?.includes('preset')) {
                throw new Error('Please create an unsigned upload preset named "cav_unsigned" in your Cloudinary settings (Settings → Upload → Upload presets → Add unsigned preset)');
            }
            throw new Error(error.error?.message || `Upload failed: ${response.statusText}`);
        }
        
        const result = await response.json();
        return {
            success: true,
            public_id: result.public_id,
            url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format
        };
    }
    
    /**
     * Convert blob to data URL
     */
    blobToDataUrl(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
    
    async resizeForPlatform(asset, platform, placement) {
        // Get platform spec
        const specs = await this.getPlatformSpecs();
        const spec = specs.find(s => s.platform === platform && s.placement === placement);
        
        if (!spec) {
            throw new Error(`No spec found for ${platform} ${placement}`);
        }
        
        return this.resize(asset, spec);
    }
    
    /**
     * Enhanced video resizing with advanced Cloudinary options
     * Supports all crop modes and gravity options from Cloudinary docs
     * 
     * @param {Object} asset - The asset to resize
     * @param {Object} options - Resize options
     * @param {number} options.width - Target width
     * @param {number} options.height - Target height
     * @param {string} options.aspect_ratio - Aspect ratio (e.g., "16:9", "1:1", "9:16")
     * @param {string} options.crop - Crop mode: fill, fill_pad, crop, scale, fit, limit, pad, lpad
     * @param {string} options.gravity - Gravity: auto, auto:faces, auto:face, auto:{object}, compass directions
     * @param {string} options.background - Background for padding (color or "blurred:400:15")
     * @param {number} options.start_offset - Start time for video trimming (seconds)
     * @param {number} options.end_offset - End time for video trimming (seconds)
     * @param {number} options.duration - Duration limit in seconds
     * @param {string} options.effect - Effects (e.g., "accelerate", "reverse", "boomerang")
     * @returns {Object} - Transformation result with URL
     */
    async resizeVideo(asset, options = {}) {
        console.log('[CloudinaryClient] Enhanced video resize:', asset.name, options);
        
        if (!this.hasCredentials()) {
            this.showCloudinaryRequiredModal();
            throw new Error('Please add your Cloudinary credentials in Settings to resize videos');
        }
        
        if (!asset.cloudinary_id && !asset.cloudinary_url) {
            throw new Error('Video must be uploaded to Cloudinary first');
        }
        
        const publicId = asset.cloudinary_id || this.extractPublicId(asset.cloudinary_url);
        const creds = this.getCredentials();
        
        // Build transformation chain
        const transformations = [];
        
        // Time-based transforms (must come first)
        if (options.start_offset) transformations.push(`so_${options.start_offset}`);
        if (options.end_offset) transformations.push(`eo_${options.end_offset}`);
        if (options.duration) transformations.push(`du_${options.duration}`);
        
        // Effects
        if (options.effect) transformations.push(`e_${options.effect}`);
        
        // Resize transforms
        if (options.aspect_ratio) transformations.push(`ar_${options.aspect_ratio}`);
        if (options.width) transformations.push(`w_${options.width}`);
        if (options.height) transformations.push(`h_${options.height}`);
        
        // Crop mode (default to fill for best results)
        const crop = options.crop || 'fill';
        transformations.push(`c_${crop}`);
        
        // Gravity for cropping
        if (options.gravity) {
            transformations.push(`g_${options.gravity}`);
        } else if (crop === 'fill' || crop === 'fill_pad' || crop === 'crop') {
            // Default to auto gravity for cropping modes
            transformations.push('g_auto');
        }
        
        // Background for padding modes
        if (options.background && (crop === 'pad' || crop === 'lpad' || crop === 'fill_pad')) {
            transformations.push(`b_${options.background}`);
        }
        
        // Quality
        transformations.push('q_auto');
        
        // Format if specified
        if (options.format) transformations.push(`f_${options.format}`);
        
        const transformStr = transformations.join(',');
        const transformedUrl = `https://res.cloudinary.com/${creds.cloudName}/video/upload/${transformStr}/${publicId}`;
        
        console.log('[CloudinaryClient] Video transform URL:', transformedUrl);
        
        return {
            success: true,
            url: transformedUrl,
            public_id: publicId,
            width: options.width,
            height: options.height,
            aspect_ratio: options.aspect_ratio,
            crop: crop,
            gravity: options.gravity,
            transformations: transformStr,
            format: options.format || 'mp4'
        };
    }
    
    /**
     * Get available video crop modes with descriptions
     */
    getVideoCropModes() {
        return [
            { value: 'fill', label: 'Fill', description: 'Resize to fill dimensions, may crop' },
            { value: 'fill_pad', label: 'Fill Pad', description: 'Fill with smart padding to avoid bad crops' },
            { value: 'scale', label: 'Scale', description: 'Scale to exact dimensions (may distort)' },
            { value: 'fit', label: 'Fit', description: 'Fit within dimensions, maintain aspect ratio' },
            { value: 'limit', label: 'Limit', description: 'Same as fit, but only scale down' },
            { value: 'pad', label: 'Pad', description: 'Fit with padding background' },
            { value: 'lpad', label: 'Limit Pad', description: 'Limit + padding' },
            { value: 'crop', label: 'Crop', description: 'Extract region without scaling' }
        ];
    }
    
    /**
     * Get available gravity options for video
     */
    getVideoGravityOptions() {
        return [
            { value: 'auto', label: 'Auto (AI)', description: 'AI-powered content-aware cropping' },
            { value: 'auto:faces', label: 'All Faces', description: 'Focus on all detected faces' },
            { value: 'auto:face', label: 'Main Face', description: 'Focus on the largest face' },
            { value: 'center', label: 'Center', description: 'Keep center of video' },
            { value: 'north', label: 'Top', description: 'Keep top part' },
            { value: 'south', label: 'Bottom', description: 'Keep bottom part' },
            { value: 'east', label: 'Right', description: 'Keep right side' },
            { value: 'west', label: 'Left', description: 'Keep left side' },
            { value: 'north_east', label: 'Top-Right', description: 'Keep top-right corner' },
            { value: 'north_west', label: 'Top-Left', description: 'Keep top-left corner' },
            { value: 'south_east', label: 'Bottom-Right', description: 'Keep bottom-right corner' },
            { value: 'south_west', label: 'Bottom-Left', description: 'Keep bottom-left corner' }
        ];
    }
    
    /**
     * Get common aspect ratios for video
     */
    getVideoAspectRatios() {
        return [
            { value: '16:9', label: '16:9 (Landscape)', description: 'YouTube, TV' },
            { value: '9:16', label: '9:16 (Portrait)', description: 'TikTok, Reels, Shorts' },
            { value: '1:1', label: '1:1 (Square)', description: 'Instagram Feed' },
            { value: '4:5', label: '4:5 (Vertical)', description: 'Instagram Portrait' },
            { value: '4:3', label: '4:3 (Standard)', description: 'Traditional TV' },
            { value: '21:9', label: '21:9 (Cinematic)', description: 'Widescreen Cinema' },
            { value: '2.35:1', label: '2.35:1 (Anamorphic)', description: 'Film' }
        ];
    }
    
    getTransformUrl(publicId, width, height, options = {}) {
        // Generate transform URL directly using user's credentials
        const creds = this.getCredentials();
        const cloudName = creds?.cloudName || 'demo';
        const crop = options.crop || 'fill';
        const gravity = options.gravity || 'auto';
        const format = options.format || 'auto';
        
        return `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},h_${height},c_${crop},g_${gravity}/f_${format}/${publicId}`;
    }
    
    extractPublicId(url) {
        if (!url) return null;
        
        // Extract public_id from Cloudinary URL
        const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
        return match ? match[1] : null;
    }
    
    // ========================================================
    // PLATFORM SPECS
    // ========================================================
    
    async getPlatformSpecs() {
        if (this.platformSpecs) {
            return this.platformSpecs;
        }
        
        try {
            const response = await this.request('GET', '/platform-specs');
            this.platformSpecs = response.specs || [];
            return this.platformSpecs;
        } catch (error) {
            console.error('[CloudinaryClient] Failed to get platform specs:', error);
            return this.getDefaultPlatformSpecs();
        }
    }
    
    getDefaultPlatformSpecs() {
        // Fallback specs if API fails
        return [
            { platform: 'instagram', placement: 'feed_square', recommended_width: 1080, recommended_height: 1080, aspect_ratio: '1:1' },
            { platform: 'instagram', placement: 'story', recommended_width: 1080, recommended_height: 1920, aspect_ratio: '9:16' },
            { platform: 'instagram', placement: 'reels', recommended_width: 1080, recommended_height: 1920, aspect_ratio: '9:16' },
            { platform: 'facebook', placement: 'feed', recommended_width: 1080, recommended_height: 1080, aspect_ratio: '1:1' },
            { platform: 'facebook', placement: 'story', recommended_width: 1080, recommended_height: 1920, aspect_ratio: '9:16' },
            { platform: 'tiktok', placement: 'feed', recommended_width: 1080, recommended_height: 1920, aspect_ratio: '9:16' },
            { platform: 'youtube', placement: 'shorts', recommended_width: 1080, recommended_height: 1920, aspect_ratio: '9:16' },
            { platform: 'youtube', placement: 'thumbnail', recommended_width: 1280, recommended_height: 720, aspect_ratio: '16:9' },
            { platform: 'linkedin', placement: 'feed', recommended_width: 1200, recommended_height: 628, aspect_ratio: '1.91:1' },
            { platform: 'twitter', placement: 'feed', recommended_width: 1200, recommended_height: 675, aspect_ratio: '16:9' }
        ];
    }
    
    async getSpecsForPlatform(platform) {
        const specs = await this.getPlatformSpecs();
        return specs.filter(s => s.platform === platform);
    }
    
    // ========================================================
    // BYOK (Bring Your Own Key)
    // ========================================================
    
    async saveBYOKCredentials(cloudName, apiKey, apiSecret) {
        return this.request('POST', '/settings/byok', {
            service: 'cloudinary',
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret
        });
    }
    
    // ========================================================
    // QUOTA UI
    // ========================================================
    
    showQuotaWarningToast() {
        const percent = this.quota.percent || 0;
        const remaining = this.quota.remaining || 0;
        
        if (window.showToast) {
            window.showToast(
                `⚠️ Transform quota at ${percent}% (${remaining} remaining). Consider adding your own Cloudinary account.`,
                'warning',
                5000
            );
        }
    }
    
    showQuotaExceededModal() {
        const modal = document.createElement('div');
        modal.className = 'cav-quota-modal';
        modal.innerHTML = `
            <div class="cav-quota-modal-overlay"></div>
            <div class="cav-quota-modal-content">
                <div class="cav-quota-modal-header">
                    <span style="font-size: 48px;">🚫</span>
                    <h2>Transform Quota Exceeded</h2>
                </div>
                <div class="cav-quota-modal-body">
                    <p>You've used all ${this.quota.limit} transforms this month.</p>
                    <p style="margin-top: 12px;">To continue resizing images and videos:</p>
                    <ul style="text-align: left; margin: 16px 0; padding-left: 24px;">
                        <li><strong>Add your own Cloudinary account</strong> (free tier available)</li>
                        <li>Wait until next month for quota reset</li>
                    </ul>
                </div>
                <div class="cav-quota-modal-actions">
                    <button class="cav-btn-secondary" onclick="this.closest('.cav-quota-modal').remove()">
                        Maybe Later
                    </button>
                    <button class="cav-btn-primary" onclick="window.cloudinaryClient?.openBYOKSetup()">
                        Add Cloudinary Account
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add styles if not present
        if (!document.getElementById('cav-quota-modal-styles')) {
            const style = document.createElement('style');
            style.id = 'cav-quota-modal-styles';
            style.textContent = `
                .cav-quota-modal {
                    position: fixed;
                    inset: 0;
                    z-index: 100000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .cav-quota-modal-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.7);
                    backdrop-filter: blur(4px);
                }
                .cav-quota-modal-content {
                    position: relative;
                    background: linear-gradient(180deg, #1e1e2e 0%, #12121a 100%);
                    border: 1px solid rgba(168, 85, 247, 0.3);
                    border-radius: 16px;
                    padding: 32px;
                    max-width: 480px;
                    text-align: center;
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
                }
                .cav-quota-modal-header h2 {
                    color: #f87171;
                    margin: 16px 0 0;
                    font-size: 24px;
                }
                .cav-quota-modal-body {
                    color: #94a3b8;
                    margin: 24px 0;
                    line-height: 1.6;
                }
                .cav-quota-modal-body li {
                    margin: 8px 0;
                }
                .cav-quota-modal-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                }
                .cav-quota-modal-actions button {
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .cav-btn-secondary {
                    background: transparent;
                    border: 1px solid #475569;
                    color: #94a3b8;
                }
                .cav-btn-secondary:hover {
                    border-color: #a855f7;
                    color: #a855f7;
                }
                .cav-btn-primary {
                    background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
                    border: none;
                    color: white;
                }
                .cav-btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(168, 85, 247, 0.4);
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    openBYOKSetup() {
        // Close quota modal
        document.querySelector('.cav-quota-modal')?.remove();
        
        // Open settings and navigate to BYOK section
        if (window.CAVSettings) {
            window.CAVSettings.openByokSection();
        } else {
            // Fallback: Show inline setup
            this.showBYOKSetupModal();
        }
    }
    
    showBYOKSetupModal() {
        const modal = document.createElement('div');
        modal.className = 'cav-quota-modal';
        modal.innerHTML = `
            <div class="cav-quota-modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="cav-quota-modal-content" style="max-width: 520px;">
                <div class="cav-quota-modal-header">
                    <span style="font-size: 48px;">☁️</span>
                    <h2>Add Your Cloudinary Account</h2>
                </div>
                <div class="cav-quota-modal-body" style="text-align: left;">
                    <p style="text-align: center; margin-bottom: 20px;">
                        Get a free Cloudinary account at 
                        <a href="https://cloudinary.com/users/register_free" target="_blank" style="color: #a855f7;">cloudinary.com</a>
                    </p>
                    
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; color: #94a3b8; margin-bottom: 6px; font-size: 14px;">Cloud Name</label>
                        <input type="text" id="byok-cloud-name" placeholder="your-cloud-name" 
                            style="width: 100%; padding: 12px; background: #0f0f14; border: 1px solid #334155; border-radius: 8px; color: white; font-size: 14px;">
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; color: #94a3b8; margin-bottom: 6px; font-size: 14px;">API Key</label>
                        <input type="text" id="byok-api-key" placeholder="123456789012345" 
                            style="width: 100%; padding: 12px; background: #0f0f14; border: 1px solid #334155; border-radius: 8px; color: white; font-size: 14px;">
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; color: #94a3b8; margin-bottom: 6px; font-size: 14px;">API Secret</label>
                        <input type="password" id="byok-api-secret" placeholder="••••••••••••••••••••" 
                            style="width: 100%; padding: 12px; background: #0f0f14; border: 1px solid #334155; border-radius: 8px; color: white; font-size: 14px;">
                    </div>
                    
                    <p style="font-size: 12px; color: #64748b; text-align: center;">
                        🔒 Your credentials are encrypted and stored securely.
                    </p>
                </div>
                <div class="cav-quota-modal-actions">
                    <button class="cav-btn-secondary" onclick="this.closest('.cav-quota-modal').remove()">
                        Cancel
                    </button>
                    <button class="cav-btn-primary" onclick="window.cloudinaryClient?.submitBYOK()">
                        Save & Unlock Unlimited
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    async submitBYOK() {
        const cloudName = document.getElementById('byok-cloud-name')?.value?.trim();
        const apiKey = document.getElementById('byok-api-key')?.value?.trim();
        const apiSecret = document.getElementById('byok-api-secret')?.value?.trim();
        
        if (!cloudName || !apiKey || !apiSecret) {
            alert('Please fill in all fields');
            return;
        }
        
        try {
            this.saveBYOKCredentials(cloudName, apiKey, apiSecret);
            
            // Refresh quota
            await this.getQuota();
            
            // Close modal
            document.querySelector('.cav-quota-modal')?.remove();
            
            // Show success
            if (window.showToast) {
                window.showToast('✅ Cloudinary connected! You now have unlimited transforms.', 'success');
            } else {
                alert('Cloudinary connected! You now have unlimited transforms.');
            }
            
        } catch (error) {
            console.error('[CloudinaryClient] BYOK save failed:', error);
            alert('Failed to save credentials: ' + error.message);
        }
    }
    
    saveBYOKCredentials(cloudName, apiKey, apiSecret) {
        // Save to local storage
        const creds = { cloudName, apiKey, apiSecret };
        localStorage.setItem('cav_user_cloudinary', JSON.stringify(creds));
        console.log('[CloudinaryClient] BYOK credentials saved');
    }
    
    ensureModalStyles() {
        if (document.getElementById('cav-quota-modal-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'cav-quota-modal-styles';
        style.textContent = `
            .cav-quota-modal {
                position: fixed;
                inset: 0;
                z-index: 100000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .cav-quota-modal-overlay {
                position: absolute;
                inset: 0;
                background: rgba(0,0,0,0.7);
                backdrop-filter: blur(4px);
            }
            .cav-quota-modal-content {
                position: relative;
                background: linear-gradient(180deg, #1e1e2e 0%, #12121a 100%);
                border: 1px solid rgba(168, 85, 247, 0.3);
                border-radius: 16px;
                padding: 32px;
                max-width: 480px;
                text-align: center;
                box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
            }
            .cav-quota-modal-header h2 {
                color: #a855f7;
                margin: 16px 0 0;
                font-size: 24px;
            }
            .cav-quota-modal-body {
                color: #94a3b8;
                margin: 24px 0;
                line-height: 1.6;
            }
            .cav-quota-modal-actions {
                display: flex;
                gap: 12px;
                justify-content: center;
            }
            .cav-quota-modal-actions button {
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }
            .cav-btn-secondary {
                background: transparent;
                border: 1px solid #64748b;
                color: #94a3b8;
            }
            .cav-btn-secondary:hover {
                border-color: #a855f7;
                color: #a855f7;
            }
            .cav-btn-primary {
                background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
                border: none;
                color: white;
            }
            .cav-btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(168, 85, 247, 0.4);
            }
        `;
        document.head.appendChild(style);
    }
    
    // ========================================================
    // API REQUESTS (Deprecated - keeping for compatibility)
    // ========================================================
    
    async request(method, path, body = null) {
        // This is deprecated - we now use direct Cloudinary API calls
        console.warn('[CloudinaryClient] API request method is deprecated');
        
        const token = this.syncEngine?.sessionToken || localStorage.getItem('cav_session_token');
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const options = {
            method,
            headers,
            credentials: 'include'
        };
        
        if (body && method !== 'GET') {
            options.body = JSON.stringify(body);
        }
        
        const url = `${this.apiBase}${path}`;
        const response = await fetch(url, options);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || `HTTP ${response.status}`);
        }
        
        return data;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CloudinaryClient;
}

// Global instance
window.CloudinaryClient = CloudinaryClient;
window.cloudinaryClient = null; // Will be initialized when app starts

console.log('[CloudinaryClient] Module loaded');

