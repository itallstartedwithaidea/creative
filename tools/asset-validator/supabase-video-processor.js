/**
 * Supabase Video Processor v1.0.0
 * Server-side video analysis using Supabase Edge Functions
 * 
 * January 18, 2026
 * 
 * CAPABILITIES:
 * 1. YouTube - Use official Data API v3 for captions/metadata
 * 2. Any Platform - Use noembed/oembed for metadata
 * 3. Transcription - AssemblyAI, Deepgram, or OpenAI Whisper
 * 4. Frame Extraction - Via Cloudinary fetch or backend
 * 5. Storage - Supabase Storage for frames, DB for results
 * 
 * This module calls Supabase Edge Functions for server-side processing
 */

(function() {
    'use strict';

    const VERSION = '1.0.0';

    // External service endpoints
    const SERVICES = {
        // YouTube Data API v3 - Get captions, metadata
        youtube: {
            captions: 'https://www.googleapis.com/youtube/v3/captions',
            videos: 'https://www.googleapis.com/youtube/v3/videos',
            // Subtitle download (via timedtext)
            timedText: 'https://www.youtube.com/api/timedtext'
        },
        // Transcription services
        transcription: {
            assemblyai: 'https://api.assemblyai.com/v2',
            deepgram: 'https://api.deepgram.com/v1/listen',
            openaiWhisper: 'https://api.openai.com/v1/audio/transcriptions'
        },
        // Video metadata/embed services (no auth needed)
        metadata: {
            noembed: 'https://noembed.com/embed',
            youtube_oembed: 'https://www.youtube.com/oembed',
            vimeo_oembed: 'https://vimeo.com/api/oembed.json',
            tiktok_oembed: 'https://www.tiktok.com/oembed'
        },
        // YouTube transcript extraction (community method)
        youtubeTranscript: {
            // Uses the innertube API that YouTube's player uses
            innertube: 'https://www.youtube.com/youtubei/v1/get_transcript'
        }
    };

    class SupabaseVideoProcessor {
        constructor() {
            this.supabase = window.CAVSupabase?.client || null;
            this.cache = new Map();
            console.log(`[SupabaseVideoProcessor] v${VERSION} initialized`);
        }

        /**
         * Main entry point - analyze video from any platform
         */
        async analyzeVideo(url, options = {}) {
            console.log('[SupabaseVideoProcessor] Analyzing:', url);
            
            const platform = this.detectPlatform(url);
            const videoId = this.extractVideoId(url, platform);
            
            const result = {
                success: false,
                platform,
                videoId,
                url,
                metadata: null,
                transcript: null,
                frames: [],
                analysis: null,
                error: null
            };

            try {
                // Step 1: Get metadata (works for most platforms)
                result.metadata = await this.fetchMetadata(url, platform);
                
                // Step 2: Get transcript (platform-specific)
                if (options.includeTranscript !== false) {
                    result.transcript = await this.fetchTranscript(url, platform, videoId, options);
                }
                
                // Step 3: Get frames (via our existing frame extractor or Supabase function)
                if (options.includeFrames !== false && window.VideoFrameExtractor) {
                    const frameResult = await window.VideoFrameExtractor.extractFrames(url, {
                        maxFrames: options.maxFrames || 8
                    });
                    result.frames = frameResult.frames || [];
                }
                
                // Step 4: If we have transcript + frames, run AI analysis
                if (options.runAnalysis !== false) {
                    result.analysis = await this.runAIAnalysis(result, options);
                }
                
                // Step 5: Store results in Supabase
                if (this.supabase && options.saveResults !== false) {
                    await this.saveToSupabase(result);
                }
                
                result.success = true;
                
            } catch (error) {
                console.error('[SupabaseVideoProcessor] Error:', error);
                result.error = error.message;
            }
            
            return result;
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
            if (/linkedin\.com/i.test(url)) return 'linkedin';
            if (/reddit\.com/i.test(url)) return 'reddit';
            if (/twitch\.tv/i.test(url)) return 'twitch';
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
                tiktok: [/video\/(\d+)/, /\/@[^\/]+\/video\/(\d+)/],
                instagram: [/(?:p|reel|reels|tv)\/([a-zA-Z0-9_-]+)/],
                vimeo: [/vimeo\.com\/(\d+)/],
                twitter: [/status\/(\d+)/]
            };

            for (const pattern of (patterns[platform] || [])) {
                const match = url.match(pattern);
                if (match) return match[1];
            }
            return null;
        }

        /**
         * Fetch video metadata via oEmbed (works for most platforms)
         */
        async fetchMetadata(url, platform) {
            console.log('[SupabaseVideoProcessor] Fetching metadata for:', platform);
            
            // Try platform-specific oEmbed first
            const oembedEndpoints = {
                youtube: `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
                vimeo: `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`,
                tiktok: `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
                twitter: `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`
            };

            const endpoint = oembedEndpoints[platform] || `https://noembed.com/embed?url=${encodeURIComponent(url)}`;
            
            try {
                const response = await fetch(endpoint);
                if (response.ok) {
                    const data = await response.json();
                    return {
                        title: data.title || null,
                        author: data.author_name || null,
                        authorUrl: data.author_url || null,
                        thumbnail: data.thumbnail_url || null,
                        thumbnailWidth: data.thumbnail_width || null,
                        thumbnailHeight: data.thumbnail_height || null,
                        duration: data.duration || null,
                        html: data.html || null,
                        provider: data.provider_name || platform,
                        raw: data
                    };
                }
            } catch (error) {
                console.warn('[SupabaseVideoProcessor] oEmbed failed:', error.message);
            }
            
            return { title: null, provider: platform };
        }

        /**
         * Fetch transcript - uses multiple methods
         */
        async fetchTranscript(url, platform, videoId, options = {}) {
            console.log('[SupabaseVideoProcessor] Fetching transcript for:', platform, videoId);
            
            // Method 1: YouTube - Try to get auto-captions
            if (platform === 'youtube' && videoId) {
                const ytTranscript = await this.fetchYouTubeTranscript(videoId);
                if (ytTranscript) return ytTranscript;
            }
            
            // Method 2: If user has AssemblyAI key, use that
            const assemblyKey = this.getAPIKey('assemblyai');
            if (assemblyKey && options.audioUrl) {
                return await this.transcribeWithAssemblyAI(options.audioUrl, assemblyKey);
            }
            
            // Method 3: If user has OpenAI key, could use Whisper API
            const openaiKey = this.getAPIKey('openai');
            if (openaiKey && options.audioFile) {
                return await this.transcribeWithWhisper(options.audioFile, openaiKey);
            }
            
            // Method 4: Call Supabase Edge Function (if deployed)
            if (this.supabase) {
                try {
                    const { data, error } = await this.supabase.functions.invoke('transcribe-video', {
                        body: { url, platform, videoId }
                    });
                    if (data && !error) return data;
                } catch (e) {
                    console.warn('[SupabaseVideoProcessor] Edge function not available:', e.message);
                }
            }
            
            return null;
        }

        /**
         * Fetch YouTube transcript using community method
         * This extracts the auto-generated captions that YouTube provides
         */
        async fetchYouTubeTranscript(videoId) {
            console.log('[SupabaseVideoProcessor] Fetching YouTube transcript for:', videoId);
            
            try {
                // Method 1: Try the video page to get caption tracks
                const videoPageUrl = `https://www.youtube.com/watch?v=${videoId}`;
                
                // We can't fetch YouTube pages directly due to CORS
                // But we can try the timedtext API if we know the language
                
                // Try common caption endpoints
                const captionUrls = [
                    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=json3`,
                    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en-US&fmt=json3`,
                    `https://www.youtube.com/api/timedtext?v=${videoId}&asr_langs=en&fmt=json3`
                ];
                
                for (const captionUrl of captionUrls) {
                    try {
                        const response = await fetch(captionUrl);
                        if (response.ok) {
                            const data = await response.json();
                            if (data.events) {
                                return this.parseYouTubeCaptions(data.events);
                            }
                        }
                    } catch (e) {
                        // Try next URL
                    }
                }
                
                // If direct API fails, try via a CORS proxy or Supabase function
                console.log('[SupabaseVideoProcessor] Direct caption fetch failed, trying alternative...');
                
                // Alternative: Use a transcript extraction service
                // Many exist: youtube-transcript-api, youtubetranscript.com, etc.
                
                return null;
                
            } catch (error) {
                console.warn('[SupabaseVideoProcessor] YouTube transcript fetch failed:', error);
                return null;
            }
        }

        /**
         * Parse YouTube caption format to our format
         */
        parseYouTubeCaptions(events) {
            const segments = [];
            
            for (const event of events) {
                if (event.segs) {
                    const text = event.segs.map(s => s.utf8).join('');
                    const startMs = event.tStartMs || 0;
                    const durationMs = event.dDurationMs || 0;
                    
                    segments.push({
                        text: text.trim(),
                        start: startMs / 1000,
                        end: (startMs + durationMs) / 1000,
                        startFormatted: this.formatTimestamp(startMs / 1000),
                        endFormatted: this.formatTimestamp((startMs + durationMs) / 1000)
                    });
                }
            }
            
            return {
                segments,
                fullText: segments.map(s => s.text).join(' '),
                language: 'en',
                source: 'youtube_auto'
            };
        }

        /**
         * Format timestamp as MM:SS or HH:MM:SS
         */
        formatTimestamp(seconds) {
            const hrs = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            const secs = Math.floor(seconds % 60);
            
            if (hrs > 0) {
                return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        /**
         * Transcribe with AssemblyAI
         */
        async transcribeWithAssemblyAI(audioUrl, apiKey) {
            console.log('[SupabaseVideoProcessor] Transcribing with AssemblyAI...');
            
            try {
                // Step 1: Submit transcription job
                const submitResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
                    method: 'POST',
                    headers: {
                        'Authorization': apiKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        audio_url: audioUrl,
                        auto_chapters: true,
                        speaker_labels: true
                    })
                });
                
                if (!submitResponse.ok) throw new Error('Failed to submit transcription');
                
                const { id } = await submitResponse.json();
                
                // Step 2: Poll for completion
                let transcript = null;
                let attempts = 0;
                
                while (attempts < 60) { // Max 5 minutes
                    await new Promise(r => setTimeout(r, 5000)); // Wait 5 seconds
                    
                    const pollResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
                        headers: { 'Authorization': apiKey }
                    });
                    
                    const result = await pollResponse.json();
                    
                    if (result.status === 'completed') {
                        transcript = {
                            segments: result.words?.map(w => ({
                                text: w.text,
                                start: w.start / 1000,
                                end: w.end / 1000,
                                confidence: w.confidence
                            })) || [],
                            fullText: result.text,
                            chapters: result.chapters,
                            speakers: result.utterances,
                            source: 'assemblyai'
                        };
                        break;
                    } else if (result.status === 'error') {
                        throw new Error(result.error);
                    }
                    
                    attempts++;
                }
                
                return transcript;
                
            } catch (error) {
                console.error('[SupabaseVideoProcessor] AssemblyAI error:', error);
                return null;
            }
        }

        /**
         * Transcribe with OpenAI Whisper API
         */
        async transcribeWithWhisper(audioFile, apiKey) {
            console.log('[SupabaseVideoProcessor] Transcribing with Whisper...');
            
            try {
                const formData = new FormData();
                formData.append('file', audioFile);
                formData.append('model', 'whisper-1');
                formData.append('response_format', 'verbose_json');
                formData.append('timestamp_granularities[]', 'segment');
                
                const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: formData
                });
                
                if (!response.ok) throw new Error('Whisper API failed');
                
                const result = await response.json();
                
                return {
                    segments: result.segments?.map(s => ({
                        text: s.text,
                        start: s.start,
                        end: s.end
                    })) || [],
                    fullText: result.text,
                    language: result.language,
                    duration: result.duration,
                    source: 'whisper'
                };
                
            } catch (error) {
                console.error('[SupabaseVideoProcessor] Whisper error:', error);
                return null;
            }
        }

        /**
         * Run AI analysis on video content
         */
        async runAIAnalysis(videoData, options = {}) {
            console.log('[SupabaseVideoProcessor] Running AI analysis...');
            
            const apiKey = this.getAPIKey('gemini') || this.getAPIKey('openai');
            if (!apiKey) {
                console.warn('[SupabaseVideoProcessor] No AI API key configured');
                return null;
            }
            
            // Build analysis prompt
            const prompt = this.buildAnalysisPrompt(videoData, options);
            
            // Call AI (use existing VideoAnalyzer if available)
            if (window.VideoAnalyzer) {
                return await window.VideoAnalyzer.callAI(prompt, videoData.frames);
            }
            
            // Fallback to direct API call
            const modelId = window.AIModels?.getGeminiModelId('flash') || 'gemini-3-flash-preview';
            
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 8192,
                            responseMimeType: 'application/json'
                        }
                    })
                });
                
                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                
                return JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
                
            } catch (error) {
                console.error('[SupabaseVideoProcessor] AI analysis failed:', error);
                return null;
            }
        }

        /**
         * Build analysis prompt with all available data
         */
        buildAnalysisPrompt(videoData, options = {}) {
            let prompt = `Analyze this video content comprehensively:

METADATA:
- Platform: ${videoData.platform}
- Title: ${videoData.metadata?.title || 'Unknown'}
- Creator: ${videoData.metadata?.author || 'Unknown'}
- Duration: ${videoData.metadata?.duration || 'Unknown'}

`;

            if (videoData.transcript) {
                prompt += `TRANSCRIPT:
${videoData.transcript.fullText || 'No transcript available'}

TRANSCRIPT SEGMENTS:
${videoData.transcript.segments?.slice(0, 20).map(s => `[${s.startFormatted || s.start}] ${s.text}`).join('\n') || 'None'}

`;
            }

            if (videoData.frames?.length > 0) {
                prompt += `FRAMES EXTRACTED: ${videoData.frames.length} frames at various timestamps
Frame timestamps: ${videoData.frames.map(f => f.label || `${f.timestamp}s`).join(', ')}

`;
            }

            prompt += `
Please provide a comprehensive analysis including:

1. **Content Summary**: What is this video about? Key topics, themes.

2. **Hook Analysis** (first 3 seconds):
   - How does it grab attention?
   - Thumb-stop potential (0-100)
   - What makes viewers stop scrolling?

3. **Messaging & Value Proposition**:
   - Main message/promise
   - Call-to-action clarity
   - Value proposition strength

4. **Audience & Intent**:
   - Target audience
   - Content intent (educate, entertain, sell, inspire)
   - Funnel stage (TOFU, MOFU, BOFU)

5. **Platform Optimization**:
   - Is it optimized for ${videoData.platform}?
   - Aspect ratio appropriateness
   - Length appropriateness

6. **Creative Effectiveness**:
   - Visual storytelling score (0-100)
   - Audio/music effectiveness
   - Brand integration

7. **Performance Prediction**:
   - Estimated engagement potential (low/medium/high)
   - Virality factors
   - Improvement opportunities

8. **Key Timestamps**: Notable moments and their timestamps

9. **Recommendations**: Top 3 actionable improvements

Return as JSON with these sections.`;

            return prompt;
        }

        /**
         * Save results to Supabase
         */
        async saveToSupabase(result) {
            if (!this.supabase) return;
            
            try {
                // Get user email for Google Sign-In
                const userEmail = window.cavUserSession?.email || 
                                  window.CAVSecurity?.SecureSessionManager?.getSession()?.email || 
                                  'anonymous';
                
                const { error } = await this.supabase
                    .from('video_analyses')
                    .upsert({
                        url: result.url,
                        platform: result.platform,
                        video_id: result.videoId,
                        metadata: result.metadata,
                        transcript: result.transcript,
                        analysis: result.analysis,
                        user_email: userEmail,
                        owner_email: userEmail,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'url' });
                    
                if (error) throw error;
                console.log('[SupabaseVideoProcessor] Saved to Supabase');
                
            } catch (error) {
                console.warn('[SupabaseVideoProcessor] Supabase save failed:', error);
            }
        }

        /**
         * Get API key from settings
         */
        getAPIKey(service) {
            const settings = JSON.parse(localStorage.getItem('cav_v3_settings') || '{}');
            const keyMap = {
                gemini: 'geminiApiKey',
                openai: 'openaiApiKey',
                assemblyai: 'assemblyaiApiKey',
                deepgram: 'deepgramApiKey'
            };
            return settings[keyMap[service]] || null;
        }

        /**
         * Render transcript UI with timestamps
         */
        renderTranscriptUI(transcript) {
            if (!transcript || !transcript.segments?.length) {
                return '<div style="color: #94a3b8; padding: 20px; text-align: center;">No transcript available</div>';
            }

            return `
                <div class="transcript-container" style="max-height: 400px; overflow-y: auto;">
                    <div style="display: flex; gap: 12px; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px;">
                        <button class="transcript-tab active" data-view="segments" style="padding: 8px 16px; background: rgba(139, 92, 246, 0.2); border: none; border-radius: 6px; color: #a78bfa; cursor: pointer;">
                            📝 Video to Text
                        </button>
                        <button class="transcript-tab" data-view="full" style="padding: 8px 16px; background: transparent; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #94a3b8; cursor: pointer;">
                            📄 Full Transcript
                        </button>
                    </div>
                    
                    <div class="transcript-segments" style="display: flex; flex-direction: column; gap: 12px;">
                        ${transcript.segments.map((seg, i) => `
                            <div class="transcript-segment" data-start="${seg.start}" style="padding: 12px; background: rgba(0,0,0,0.2); border-radius: 8px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(139, 92, 246, 0.2)'" onmouseout="this.style.background='rgba(0,0,0,0.2)'">
                                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                                    <span style="color: #a78bfa; font-size: 12px; font-family: monospace;">● ${seg.startFormatted || this.formatTimestamp(seg.start)} - ${seg.endFormatted || this.formatTimestamp(seg.end)}</span>
                                </div>
                                <p style="color: #e2e8f0; margin: 0; font-size: 14px; line-height: 1.5;">${seg.text}</p>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="transcript-full" style="display: none; padding: 16px; background: rgba(0,0,0,0.2); border-radius: 8px;">
                        <p style="color: #e2e8f0; margin: 0; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${transcript.fullText}</p>
                    </div>
                </div>
            `;
        }
    }

    // Export globally
    window.SupabaseVideoProcessor = new SupabaseVideoProcessor();
    
    console.log('[SupabaseVideoProcessor] Module loaded v' + VERSION);

})();
