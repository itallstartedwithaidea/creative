/**
 * Supabase Video Intelligence Client v1.0.0
 * Connects Video Intelligence Engine to Supabase backend
 * 
 * January 18, 2026
 */

(function() {
    'use strict';

    const VERSION = '1.0.0';

    class SupabaseVideoClient {
        constructor() {
            this.supabase = null;
            this.edgeFunctionUrl = null;
            this.initialized = false;
            
            // Auto-initialize when Supabase is ready
            this.init();
        }

        async init() {
            // Wait for Supabase to be available (try multiple sources)
            let attempts = 0;
            while (attempts < 30) {
                // Try multiple possible locations for Supabase client
                if (window.CAVSupabase?.client) {
                    this.supabase = window.CAVSupabase.client;
                    break;
                }
                if (window.supabase) {
                    this.supabase = window.supabase;
                    break;
                }
                await new Promise(r => setTimeout(r, 200));
                attempts++;
            }

            if (this.supabase) {
                this.edgeFunctionUrl = this.getEdgeFunctionUrl();
                this.initialized = true;
                console.log(`[SupabaseVideo] Initialized v${VERSION}`);
                console.log(`[SupabaseVideo] Edge Function URL: ${this.edgeFunctionUrl}`);
            } else {
                console.warn('[SupabaseVideo] Supabase client not available - using direct API calls');
                // Still mark as initialized so we can use fallback methods
                this.initialized = true;
                this.edgeFunctionUrl = this.getEdgeFunctionUrl();
            }
        }

        getEdgeFunctionUrl() {
            // Get Supabase project URL from the client
            const url = this.supabase?.supabaseUrl || 
                        localStorage.getItem('supabase_url') ||
                        'https://fgqubdsievdhawaihshz.supabase.co';
            return `${url}/functions/v1/video-process`;
        }

        /**
         * Process video through Supabase Edge Function
         */
        async processVideo(url, options = {}) {
            if (!this.initialized) {
                await this.init();
            }

            console.log(`[SupabaseVideo] Processing: ${url}`);

            try {
                // Get auth token if available
                const { data: { session } } = await this.supabase.auth.getSession();
                const headers = {
                    'Content-Type': 'application/json'
                };
                
                if (session?.access_token) {
                    headers['Authorization'] = `Bearer ${session.access_token}`;
                }

                const response = await fetch(this.edgeFunctionUrl, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        url,
                        action: options.action || 'analyze'
                    })
                });

                if (!response.ok) {
                    throw new Error(`Edge function error: ${response.status}`);
                }

                const result = await response.json();
                console.log('[SupabaseVideo] Edge function result:', result);

                // Store in database
                if (result.success) {
                    await this.saveAnalysis(url, result);
                }

                return result;

            } catch (error) {
                console.error('[SupabaseVideo] Process error:', error);
                
                // Fallback to direct oEmbed if Edge Function fails
                console.log('[SupabaseVideo] Falling back to direct oEmbed...');
                return await this.fallbackProcess(url);
            }
        }

        /**
         * Fallback processing when Edge Function is unavailable
         */
        async fallbackProcess(url) {
            const platform = this.detectPlatform(url);
            const videoId = this.extractVideoId(url, platform);

            const result = {
                success: true,
                url,
                platform,
                videoId,
                metadata: null,
                transcript: null,
                thumbnails: [],
                source: 'fallback'
            };

            // Get metadata via oEmbed
            result.metadata = await this.fetchOEmbed(url, platform);

            // Get thumbnails for YouTube
            if (platform === 'youtube' && videoId) {
                result.thumbnails = this.getYouTubeThumbnails(videoId);
            }

            return result;
        }

        /**
         * Fetch oEmbed metadata directly
         */
        async fetchOEmbed(url, platform) {
            const endpoints = {
                youtube: `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
                vimeo: `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`,
                tiktok: `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`
            };

            const endpoint = endpoints[platform] || `https://noembed.com/embed?url=${encodeURIComponent(url)}`;

            try {
                const response = await fetch(endpoint);
                if (!response.ok) throw new Error('oEmbed failed');
                
                const data = await response.json();
                return {
                    title: data.title,
                    author: data.author_name,
                    authorUrl: data.author_url,
                    thumbnail: data.thumbnail_url,
                    provider: data.provider_name || platform,
                    source: 'oembed'
                };
            } catch (error) {
                console.warn('[SupabaseVideo] oEmbed error:', error);
                return null;
            }
        }

        /**
         * Get YouTube thumbnail URLs
         */
        getYouTubeThumbnails(videoId) {
            return [
                { type: 'maxres', url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` },
                { type: 'sd', url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg` },
                { type: 'hq', url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` },
                { type: 'mq', url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` },
                { type: 'default', url: `https://img.youtube.com/vi/${videoId}/default.jpg` },
                // Frame-specific
                { type: 'frame1', url: `https://img.youtube.com/vi/${videoId}/1.jpg` },
                { type: 'frame2', url: `https://img.youtube.com/vi/${videoId}/2.jpg` },
                { type: 'frame3', url: `https://img.youtube.com/vi/${videoId}/3.jpg` }
            ];
        }

        /**
         * Save analysis to Supabase
         */
        async saveAnalysis(url, data) {
            if (!this.supabase) return;

            try {
                const user = await this.getCurrentUser();
                const userEmail = user?.email || 
                                  window.cavUserSession?.email || 
                                  'anonymous';
                
                const { error } = await this.supabase
                    .from('video_analyses')
                    .upsert({
                        url,
                        platform: data.platform,
                        video_id: data.videoId,
                        metadata: data.metadata,
                        transcript: data.transcript,
                        frames: data.thumbnails || [],
                        user_email: userEmail,
                        owner_email: userEmail,
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'url'
                    });

                if (error) throw error;
                console.log('[SupabaseVideo] Analysis saved to Supabase');

            } catch (error) {
                console.warn('[SupabaseVideo] Save error:', error);
            }
        }

        /**
         * Save template output
         */
        async saveTemplateOutput(videoAnalysisId, templateType, output, modelUsed = null) {
            if (!this.supabase) return;

            try {
                const userEmail = window.cavUserSession?.email || 
                                  window.CAVSecurity?.SecureSessionManager?.getSession()?.email || 
                                  'anonymous';
                
                const { error } = await this.supabase
                    .from('video_templates')
                    .upsert({
                        video_analysis_id: videoAnalysisId,
                        template_type: templateType,
                        output: typeof output === 'string' ? output : null,
                        output_json: typeof output === 'object' ? output : null,
                        model_used: modelUsed,
                        user_email: userEmail,
                        owner_email: userEmail
                    }, {
                        onConflict: 'video_analysis_id,template_type'
                    });

                if (error) throw error;
                console.log(`[SupabaseVideo] Template '${templateType}' saved`);

            } catch (error) {
                console.warn('[SupabaseVideo] Template save error:', error);
            }
        }

        /**
         * Save chat message
         */
        async saveChatMessage(videoAnalysisId, role, content) {
            if (!this.supabase) return;

            try {
                const user = await this.getCurrentUser();
                const userEmail = user?.email || 
                                  window.cavUserSession?.email || 
                                  'anonymous';
                
                const { error } = await this.supabase
                    .from('video_chat_messages')
                    .insert({
                        video_analysis_id: videoAnalysisId,
                        role,
                        content,
                        user_email: userEmail,
                        owner_email: userEmail
                    });

                if (error) throw error;

            } catch (error) {
                console.warn('[SupabaseVideo] Chat save error:', error);
            }
        }

        /**
         * Get analysis history
         */
        async getAnalysisHistory(limit = 20) {
            if (!this.supabase) return [];

            try {
                const { data, error } = await this.supabase
                    .from('video_analyses')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(limit);

                if (error) throw error;
                return data || [];

            } catch (error) {
                console.warn('[SupabaseVideo] History error:', error);
                return [];
            }
        }

        /**
         * Get analysis by URL
         */
        async getAnalysisByUrl(url) {
            if (!this.supabase) return null;

            try {
                const { data, error } = await this.supabase
                    .from('video_analyses')
                    .select('*')
                    .eq('url', url)
                    .single();

                if (error && error.code !== 'PGRST116') throw error;
                return data;

            } catch (error) {
                console.warn('[SupabaseVideo] Get analysis error:', error);
                return null;
            }
        }

        /**
         * Get chat history for a video
         */
        async getChatHistory(videoAnalysisId) {
            if (!this.supabase) return [];

            try {
                const { data, error } = await this.supabase
                    .from('video_chat_messages')
                    .select('*')
                    .eq('video_analysis_id', videoAnalysisId)
                    .order('created_at', { ascending: true });

                if (error) throw error;
                return data || [];

            } catch (error) {
                console.warn('[SupabaseVideo] Chat history error:', error);
                return [];
            }
        }

        /**
         * Get current user
         */
        async getCurrentUser() {
            if (!this.supabase) return null;
            
            try {
                const { data: { user } } = await this.supabase.auth.getUser();
                if (user) return user;
            } catch {
                // Supabase auth failed, try fallback
            }
            
            // Fallback to Google Sign-In session
            const session = window.cavUserSession || 
                           window.CAVSecurity?.SecureSessionManager?.getSession() ||
                           JSON.parse(localStorage.getItem('cav_user_session') || 'null');
            
            return session ? { 
                id: null, 
                email: session.email,
                user_metadata: { name: session.name, avatar_url: session.picture }
            } : null;
        }

        /**
         * Detect platform from URL
         */
        detectPlatform(url) {
            if (/youtube\.com|youtu\.be/i.test(url)) return 'youtube';
            if (/tiktok\.com/i.test(url)) return 'tiktok';
            if (/instagram\.com/i.test(url)) return 'instagram';
            if (/twitter\.com|x\.com/i.test(url)) return 'twitter';
            if (/vimeo\.com/i.test(url)) return 'vimeo';
            if (/facebook\.com|fb\.watch/i.test(url)) return 'facebook';
            return 'unknown';
        }

        /**
         * Extract video ID from URL
         */
        extractVideoId(url, platform) {
            const patterns = {
                youtube: /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
                vimeo: /vimeo\.com\/(\d+)/,
                tiktok: /video\/(\d+)/
            };
            
            const match = url.match(patterns[platform]);
            return match ? match[1] : null;
        }

        /**
         * Check if Edge Function is available
         */
        async checkEdgeFunction() {
            try {
                const response = await fetch(this.edgeFunctionUrl, {
                    method: 'OPTIONS'
                });
                return response.ok;
            } catch {
                return false;
            }
        }
    }

    // Initialize and export
    window.SupabaseVideoClient = new SupabaseVideoClient();
    
    console.log('[SupabaseVideo] Client loaded v' + VERSION);

})();
