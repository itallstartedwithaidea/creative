/**
 * Video Intelligence Engine v1.0.0
 * Full-stack video analysis matching memories.ai capabilities
 * 
 * January 18, 2026
 * 
 * ARCHITECTURE:
 * ┌──────────────────────────────────────────────────────────────┐
 * │ 1. VIDEO INGESTION LAYER                                    │
 * │    - URL parsing & platform detection                       │
 * │    - yt-dlp integration (via backend)                       │
 * │    - Direct upload support                                  │
 * ├──────────────────────────────────────────────────────────────┤
 * │ 2. EXTRACTION LAYER                                         │
 * │    - Audio extraction (ffmpeg)                              │
 * │    - Scene detection (frame diff analysis)                  │
 * │    - Key frame extraction                                   │
 * ├──────────────────────────────────────────────────────────────┤
 * │ 3. ANALYSIS LAYER                                           │
 * │    - Whisper transcription (OpenAI/AssemblyAI)              │
 * │    - Vision analysis (Gemini/GPT-4V/Claude)                 │
 * │    - OCR extraction                                         │
 * │    - Object/scene recognition                               │
 * ├──────────────────────────────────────────────────────────────┤
 * │ 4. MERGE & ALIGNMENT LAYER                                  │
 * │    - Timestamp synchronization                              │
 * │    - Multi-modal data fusion                                │
 * ├──────────────────────────────────────────────────────────────┤
 * │ 5. MEMORY/STORAGE LAYER                                     │
 * │    - Supabase structured storage                            │
 * │    - Vector embeddings (for RAG)                            │
 * ├──────────────────────────────────────────────────────────────┤
 * │ 6. OUTPUT LAYER                                             │
 * │    - Video to Text (timestamped)                            │
 * │    - Summary generation                                     │
 * │    - Template generators                                    │
 * │    - Chat Q&A (RAG)                                         │
 * └──────────────────────────────────────────────────────────────┘
 */

(function() {
    'use strict';

    const VERSION = '1.2.0';

    // ═══════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════
    
    const CONFIG = {
        // Scene detection threshold (0-1, higher = more sensitive)
        sceneChangeThreshold: 0.3,
        // Minimum scene duration in seconds
        minSceneDuration: 1.0,
        // Max frames to extract per video
        maxFrames: 20,
        // Frame analysis batch size
        frameBatchSize: 5,
        // Whisper model
        whisperModel: 'whisper-1',
        // Vision model
        visionModel: 'gemini-3-flash-preview'
    };

    // ═══════════════════════════════════════════════════════════════════
    // TEMPLATE GENERATORS (Marketing-specific prompts)
    // ═══════════════════════════════════════════════════════════════════
    
    const TEMPLATES = {
        storyboard: {
            name: 'Generate Storyboard Script',
            description: 'Extract the storyboard script for recreating this video',
            prompt: `Based on the video analysis provided, generate a detailed storyboard script that could be used to recreate this video.

For each scene, include:
1. **Timestamp**: Start and end time
2. **Shot Type**: Wide, medium, close-up, etc.
3. **Visual Description**: What's shown on screen
4. **Audio/Dialogue**: What's being said or heard
5. **Text Overlays**: Any text shown on screen
6. **Transitions**: How it moves to the next scene
7. **Notes**: Director notes for emotion, pacing

Format as a production-ready storyboard document.`,
            icon: '🎬'
        },
        
        marketingImpact: {
            name: 'Marketing Impact Analysis',
            description: 'Analyze the marketing strategy and potential reach',
            prompt: `Analyze this video's marketing effectiveness:

1. **Hook Effectiveness** (0-100):
   - How well does it capture attention in first 3 seconds?
   - Thumb-stop potential

2. **Message Clarity**:
   - What's the core message?
   - Is the value proposition clear?

3. **Call-to-Action Analysis**:
   - Is there a clear CTA?
   - How compelling is it?

4. **Target Audience Fit**:
   - Who is this video for?
   - How well does it speak to them?

5. **Platform Optimization**:
   - Is it optimized for its platform?
   - Aspect ratio, length, pacing

6. **Viral Potential**:
   - Shareability factors
   - Emotional triggers
   - Trend alignment

7. **Improvement Recommendations**:
   - Top 3 changes to improve performance

Return structured JSON with scores and insights.`,
            icon: '📈'
        },
        
        keyHighlights: {
            name: 'Summarize Key Highlights',
            description: 'Extract the 3 key highlights from this video',
            prompt: `Summarize the 3 most important highlights from this video:

For each highlight:
1. **Timestamp**: When it occurs
2. **What Happens**: Brief description
3. **Why It Matters**: Significance/impact
4. **Quote/Text**: Any notable dialogue or text
5. **Visual**: Key visual element

Also provide:
- **One-Sentence Summary**: The video in one sentence
- **Key Takeaway**: What viewers should remember
- **Best Clip**: Timestamp of most shareable moment`,
            icon: '⭐'
        },
        
        targetAudience: {
            name: 'Target Audience Profile',
            description: 'Identify who this video is meant for',
            prompt: `Based on the video content and style, create a detailed target audience profile:

1. **Demographics**:
   - Age range
   - Gender
   - Location/Region
   - Income level

2. **Psychographics**:
   - Interests
   - Values
   - Pain points
   - Aspirations

3. **Behavioral**:
   - Platform preferences
   - Content consumption habits
   - Purchase behaviors

4. **Why This Audience**:
   - Evidence from video that supports this targeting
   - Visual cues
   - Language/tone indicators

5. **Lookalike Recommendations**:
   - Similar audiences to target
   - Expansion opportunities

Return as structured JSON.`,
            icon: '👥'
        },
        
        adCopy: {
            name: 'Generate Ad Copy',
            description: 'Create ad copy variations based on this video',
            prompt: `Based on this video's content and messaging, generate ad copy for multiple platforms:

**Facebook/Instagram**:
- Primary Text (125 chars)
- Headline (40 chars)
- Description (30 chars)
- 3 variations

**Google Ads (RSA)**:
- 15 Headlines (30 chars each)
- 4 Descriptions (90 chars each)

**TikTok**:
- Hook text (first line)
- Caption (150 chars)
- 3 hashtag sets

**LinkedIn**:
- Professional headline
- Body copy (300 chars)
- CTA

For each, match the video's tone and key messages.`,
            icon: '✍️'
        },
        
        competitorAnalysis: {
            name: 'Competitor Breakdown',
            description: 'Analyze this as competitor content',
            prompt: `Analyze this video as if it's competitor content:

1. **Content Strategy**:
   - What strategy are they using?
   - Content pillar/category
   - Posting pattern implications

2. **Production Analysis**:
   - Budget estimate (low/medium/high)
   - Production style
   - Tools/techniques used

3. **What's Working**:
   - Strengths to learn from
   - Engagement triggers
   - Unique approaches

4. **Weaknesses**:
   - Gaps to exploit
   - Missed opportunities
   - Areas we could do better

5. **Counter-Strategy**:
   - How to differentiate
   - Content we should create in response
   - Positioning opportunities

6. **Steal-Worthy Elements**:
   - Specific tactics to adopt
   - Formats to test
   - Hooks/CTAs to adapt`,
            icon: '🔍'
        },
        
        socialPosts: {
            name: 'Social Media Posts',
            description: 'Generate social posts about this video',
            prompt: `Create social media posts to promote or reference this video content:

**Twitter/X Thread** (5 tweets):
- Hook tweet
- 3 value tweets
- CTA tweet

**LinkedIn Post**:
- Professional insight post (1300 chars)
- Include relevant hashtags

**Instagram Caption**:
- Engaging caption (2200 chars max)
- Include emoji
- CTA
- 30 hashtags

**TikTok Comment Replies**:
- 5 engaging responses to potential comments

**YouTube Community Post**:
- Teaser/behind-the-scenes style`,
            icon: '📱'
        },
        
        scriptExtract: {
            name: 'Extract Script/Dialogue',
            description: 'Get the full spoken script with speaker labels',
            prompt: `Extract and format the complete spoken script from this video:

Format:
[TIMESTAMP] SPEAKER: "Dialogue"

Include:
1. All spoken dialogue with timestamps
2. Speaker identification (if multiple)
3. Tone/emotion indicators [excited], [serious], etc.
4. Sound effects or music cues [upbeat music plays]
5. On-screen text [TEXT ON SCREEN: "...]

Also provide:
- Word count
- Speaking pace (words per minute)
- Silence/pause durations
- Key quotes list`,
            icon: '📝'
        },
        
        thumbnailIdeas: {
            name: 'Thumbnail Ideas',
            description: 'Generate thumbnail concepts from video frames',
            prompt: `Based on the video frames and content, suggest 5 thumbnail concepts:

For each thumbnail:
1. **Frame Reference**: Which timestamp/frame to use
2. **Composition**: Layout and focal points
3. **Text Overlay**: Suggested text (if any)
4. **Expression/Emotion**: What feeling to capture
5. **Color Treatment**: Filters, saturation, contrast
6. **Click-Bait Level**: 1-10 (how attention-grabbing)
7. **A/B Test Hypothesis**: What to test

Also recommend:
- Best performing thumbnail style for this content type
- Platform-specific variations (YouTube vs TikTok vs IG)`,
            icon: '🖼️'
        }
    };

    // ═══════════════════════════════════════════════════════════════════
    // MAIN CLASS
    // ═══════════════════════════════════════════════════════════════════
    
    class VideoIntelligenceEngine {
        constructor() {
            this.analysisCache = new Map();
            this.chatHistory = [];
            this.currentVideoData = null;
            console.log(`[VideoIntelligence] Engine v${VERSION} initialized`);
        }

        // ═══════════════════════════════════════════════════════════════
        // LAYER 1: VIDEO INGESTION
        // ═══════════════════════════════════════════════════════════════
        
        async ingestVideo(source, options = {}) {
            console.log('[VideoIntelligence] Starting video ingestion...');
            
            const result = {
                id: crypto.randomUUID(),
                source: typeof source === 'string' ? source : 'file_upload',
                timestamp: new Date().toISOString(),
                platform: null,
                videoId: null,
                metadata: null,
                audio: null,
                frames: [],
                transcript: null,
                visionAnalysis: [],
                mergedTimeline: [],
                status: 'processing'
            };

            try {
                // Detect platform and extract video ID
                if (typeof source === 'string') {
                    result.platform = this.detectPlatform(source);
                    result.videoId = this.extractVideoId(source, result.platform);
                } else {
                    result.platform = 'upload';
                }

                // ═══════════════════════════════════════════════════════════
                // STEP 1: Try Supabase Edge Function first (most reliable)
                // ═══════════════════════════════════════════════════════════
                if (typeof source === 'string' && window.SupabaseVideoClient) {
                    options.onProgress?.('Connecting to Supabase...', 5);
                    
                    try {
                        const supabaseResult = await window.SupabaseVideoClient.processVideo(source, {
                            action: 'analyze'
                        });
                        
                        if (supabaseResult.success) {
                            console.log('[VideoIntelligence] Got Supabase data:', supabaseResult);
                            result.metadata = supabaseResult.metadata;
                            result.transcript = supabaseResult.transcript;
                            
                            // Convert thumbnails to frames format
                            if (supabaseResult.thumbnails?.length > 0) {
                                result.frames = supabaseResult.thumbnails.map((t, i) => ({
                                    timestamp: i,
                                    url: t.url,
                                    type: t.type,
                                    label: t.type
                                }));
                            }
                        }
                    } catch (supabaseError) {
                        console.warn('[VideoIntelligence] Supabase fallback:', supabaseError);
                    }
                }

                // ═══════════════════════════════════════════════════════════
                // STEP 2: Fill in missing data with local methods
                // ═══════════════════════════════════════════════════════════
                
                // Get metadata if not from Supabase
                if (!result.metadata) {
                    options.onProgress?.('Fetching metadata...', 10);
                    result.metadata = await this.fetchMetadata(source, result.platform);
                }

                // Extract frames if not from Supabase
                if (result.frames.length === 0) {
                    options.onProgress?.('Extracting key frames...', 20);
                    result.frames = await this.extractKeyFrames(source, options);
                }

                // Get transcript if not from Supabase
                if (!result.transcript) {
                    options.onProgress?.('Transcribing audio...', 35);
                    result.transcript = await this.transcribeAudio(source, result.platform, result.videoId, options);
                }

                // Run vision analysis on frames
                options.onProgress?.('Analyzing visual content...', 55);
                result.visionAnalysis = await this.analyzeFramesWithVision(result.frames, options);

                // Merge and align all data
                options.onProgress?.('Aligning timestamps...', 80);
                result.mergedTimeline = this.mergeAndAlign(result);

                // Store in Supabase
                options.onProgress?.('Saving analysis...', 95);
                await this.saveToStorage(result);

                result.status = 'complete';
                this.currentVideoData = result;
                options.onProgress?.('Complete!', 100);

            } catch (error) {
                console.error('[VideoIntelligence] Ingestion error:', error);
                result.status = 'error';
                result.error = error.message;
            }

            return result;
        }

        // ═══════════════════════════════════════════════════════════════
        // LAYER 2: EXTRACTION (Scene Detection & Key Frames)
        // ═══════════════════════════════════════════════════════════════
        
        async extractKeyFrames(source, options = {}) {
            console.log('[VideoIntelligence] Extracting key frames with scene detection...');
            
            // Use existing VideoFrameExtractor for basic extraction
            if (window.VideoFrameExtractor) {
                const basicFrames = await window.VideoFrameExtractor.extractFrames(source, {
                    maxFrames: CONFIG.maxFrames,
                    progressCallback: options.onProgress
                });

                if (basicFrames.success && basicFrames.frames?.length > 0) {
                    // Enhance with scene detection
                    return await this.detectSceneChanges(basicFrames.frames);
                }
            }

            return [];
        }

        async detectSceneChanges(frames) {
            console.log('[VideoIntelligence] Running scene detection...');
            
            // Client-side scene detection using frame comparison
            // This is a simplified version - production would use PySceneDetect on backend
            
            const enhancedFrames = [];
            let previousFrame = null;
            let sceneIndex = 1;

            for (let i = 0; i < frames.length; i++) {
                const frame = frames[i];
                
                // Calculate visual difference from previous frame
                let isSceneChange = i === 0; // First frame is always a scene start
                let sceneChangeScore = 0;

                if (previousFrame && frame.dataUrl && previousFrame.dataUrl) {
                    sceneChangeScore = await this.calculateFrameDifference(previousFrame.dataUrl, frame.dataUrl);
                    isSceneChange = sceneChangeScore > CONFIG.sceneChangeThreshold;
                }

                if (isSceneChange) {
                    sceneIndex++;
                }

                enhancedFrames.push({
                    ...frame,
                    sceneIndex,
                    isSceneChange,
                    sceneChangeScore,
                    frameType: this.classifyFrameType(frame.timestamp, frames)
                });

                previousFrame = frame;
            }

            console.log(`[VideoIntelligence] Detected ${sceneIndex} scenes`);
            return enhancedFrames;
        }

        async calculateFrameDifference(dataUrl1, dataUrl2) {
            // Simple histogram comparison for scene detection
            // Returns 0-1 (0 = identical, 1 = completely different)
            
            return new Promise((resolve) => {
                const img1 = new Image();
                const img2 = new Image();
                let loaded = 0;

                const onLoad = () => {
                    loaded++;
                    if (loaded === 2) {
                        try {
                            const canvas = document.createElement('canvas');
                            canvas.width = 64; // Small size for fast comparison
                            canvas.height = 64;
                            const ctx = canvas.getContext('2d');

                            // Get average colors for comparison
                            ctx.drawImage(img1, 0, 0, 64, 64);
                            const data1 = ctx.getImageData(0, 0, 64, 64).data;
                            
                            ctx.drawImage(img2, 0, 0, 64, 64);
                            const data2 = ctx.getImageData(0, 0, 64, 64).data;

                            // Calculate mean absolute difference
                            let diff = 0;
                            for (let i = 0; i < data1.length; i += 4) {
                                diff += Math.abs(data1[i] - data2[i]) / 255; // R
                                diff += Math.abs(data1[i+1] - data2[i+1]) / 255; // G
                                diff += Math.abs(data1[i+2] - data2[i+2]) / 255; // B
                            }
                            
                            const avgDiff = diff / (data1.length / 4 * 3);
                            resolve(avgDiff);
                        } catch (e) {
                            resolve(0);
                        }
                    }
                };

                img1.onload = onLoad;
                img2.onload = onLoad;
                img1.onerror = () => resolve(0);
                img2.onerror = () => resolve(0);
                
                img1.src = dataUrl1;
                img2.src = dataUrl2;
            });
        }

        classifyFrameType(timestamp, allFrames) {
            const duration = allFrames[allFrames.length - 1]?.timestamp || 60;
            
            if (timestamp <= 3) return 'hook';
            if (timestamp <= 7) return 'early';
            if (timestamp >= duration - 5) return 'closing';
            if (timestamp >= duration * 0.4 && timestamp <= duration * 0.6) return 'middle';
            return 'body';
        }

        // ═══════════════════════════════════════════════════════════════
        // LAYER 3: ANALYSIS (Transcription & Vision)
        // ═══════════════════════════════════════════════════════════════
        
        async transcribeAudio(source, platform, videoId, options = {}) {
            console.log('[VideoIntelligence] Transcribing audio...');
            
            // Try multiple transcription methods
            
            // Method 1: Use SupabaseVideoProcessor if available
            if (window.SupabaseVideoProcessor) {
                const transcript = await window.SupabaseVideoProcessor.fetchTranscript(
                    typeof source === 'string' ? source : null,
                    platform,
                    videoId,
                    options
                );
                if (transcript) return transcript;
            }

            // Method 2: Direct Whisper API if we have audio file
            if (source instanceof File && source.type.startsWith('video/')) {
                const whisperResult = await this.transcribeWithWhisper(source);
                if (whisperResult) return whisperResult;
            }

            // Method 3: AssemblyAI if configured
            const assemblyKey = this.getAPIKey('assemblyai');
            if (assemblyKey && options.audioUrl) {
                return await this.transcribeWithAssemblyAI(options.audioUrl, assemblyKey);
            }

            console.log('[VideoIntelligence] No transcription available');
            return null;
        }

        async transcribeWithWhisper(videoFile) {
            const apiKey = this.getAPIKey('openai');
            if (!apiKey) return null;

            try {
                // Extract audio from video (browser-side)
                const audioBlob = await this.extractAudioFromVideo(videoFile);
                if (!audioBlob) return null;

                const formData = new FormData();
                formData.append('file', audioBlob, 'audio.webm');
                formData.append('model', CONFIG.whisperModel);
                formData.append('response_format', 'verbose_json');
                formData.append('timestamp_granularities[]', 'segment');

                const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${apiKey}` },
                    body: formData
                });

                if (!response.ok) throw new Error('Whisper API failed');

                const result = await response.json();
                
                return {
                    segments: result.segments?.map(s => ({
                        text: s.text,
                        start: s.start,
                        end: s.end,
                        startFormatted: this.formatTimestamp(s.start),
                        endFormatted: this.formatTimestamp(s.end)
                    })) || [],
                    fullText: result.text,
                    language: result.language,
                    duration: result.duration,
                    source: 'whisper'
                };
            } catch (error) {
                console.error('[VideoIntelligence] Whisper error:', error);
                return null;
            }
        }

        async extractAudioFromVideo(videoFile) {
            // Use Web Audio API to extract audio
            // Note: This is limited - full extraction needs ffmpeg on backend
            
            return new Promise((resolve) => {
                const video = document.createElement('video');
                video.muted = true;
                video.src = URL.createObjectURL(videoFile);
                
                video.onloadedmetadata = async () => {
                    try {
                        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                        const source = audioContext.createMediaElementSource(video);
                        const destination = audioContext.createMediaStreamDestination();
                        source.connect(destination);
                        
                        const mediaRecorder = new MediaRecorder(destination.stream);
                        const chunks = [];
                        
                        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
                        mediaRecorder.onstop = () => {
                            const blob = new Blob(chunks, { type: 'audio/webm' });
                            URL.revokeObjectURL(video.src);
                            resolve(blob);
                        };
                        
                        mediaRecorder.start();
                        video.play();
                        
                        // Record for video duration (max 5 minutes for API limits)
                        setTimeout(() => {
                            mediaRecorder.stop();
                            video.pause();
                        }, Math.min(video.duration * 1000, 300000));
                        
                    } catch (e) {
                        console.error('[VideoIntelligence] Audio extraction error:', e);
                        resolve(null);
                    }
                };
                
                video.onerror = () => resolve(null);
            });
        }

        async analyzeFramesWithVision(frames, options = {}) {
            console.log(`[VideoIntelligence] Analyzing ${frames.length} frames with vision model...`);
            
            const apiKey = this.getAPIKey('gemini') || this.getAPIKey('openai');
            if (!apiKey || frames.length === 0) return [];

            const results = [];
            
            // Process in batches
            for (let i = 0; i < frames.length; i += CONFIG.frameBatchSize) {
                const batch = frames.slice(i, i + CONFIG.frameBatchSize);
                
                for (const frame of batch) {
                    if (!frame.dataUrl && !frame.url) continue;
                    
                    const analysis = await this.analyzeFrame(frame, apiKey);
                    results.push({
                        timestamp: frame.timestamp,
                        frameType: frame.frameType,
                        sceneIndex: frame.sceneIndex,
                        isSceneChange: frame.isSceneChange,
                        analysis
                    });
                }
                
                // Progress update
                const progress = Math.round((i + batch.length) / frames.length * 100);
                options.onProgress?.(`Analyzing frames (${progress}%)...`, 55 + progress * 0.2);
            }

            return results;
        }

        async analyzeFrame(frame, apiKey) {
            const prompt = `Analyze this video frame in detail:

1. **Scene Description**: What's happening in this frame?
2. **Objects Detected**: List all visible objects
3. **People**: Number of people, their actions, estimated ages, emotions
4. **Text/OCR**: Any text visible on screen (exact transcription)
5. **Branding**: Logo, brand colors, brand elements
6. **Composition**: Camera angle, framing, visual style
7. **Mood/Emotion**: Overall feeling of the scene
8. **Action**: What action is taking place?

Return as JSON:
{
  "sceneDescription": "",
  "objects": [],
  "people": { "count": 0, "details": [] },
  "textOnScreen": [],
  "branding": { "logos": [], "colors": [] },
  "composition": "",
  "mood": "",
  "action": ""
}`;

            try {
                const modelId = CONFIG.visionModel;
                const parts = [{ text: prompt }];
                
                // Add image
                if (frame.dataUrl) {
                    const matches = frame.dataUrl.match(/^data:(.+);base64,(.+)$/);
                    if (matches) {
                        parts.push({
                            inlineData: { mimeType: matches[1], data: matches[2] }
                        });
                    }
                }

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts }],
                        generationConfig: {
                            temperature: 0.3,
                            maxOutputTokens: 2048,
                            responseMimeType: 'application/json'
                        }
                    })
                });

                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
                return JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
                
            } catch (error) {
                console.warn('[VideoIntelligence] Frame analysis error:', error);
                return null;
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // LAYER 4: MERGE & ALIGNMENT
        // ═══════════════════════════════════════════════════════════════
        
        mergeAndAlign(videoData) {
            console.log('[VideoIntelligence] Merging and aligning timeline data...');
            
            const timeline = [];
            const transcriptSegments = videoData.transcript?.segments || [];
            const visionAnalysis = videoData.visionAnalysis || [];

            // Create unified timeline
            // Combine transcript segments with vision analysis at matching timestamps
            
            for (const segment of transcriptSegments) {
                const entry = {
                    start: segment.start,
                    end: segment.end,
                    startFormatted: segment.startFormatted,
                    endFormatted: segment.endFormatted,
                    transcript: segment.text,
                    vision: null,
                    sceneIndex: null
                };

                // Find matching vision analysis
                const matchingVision = visionAnalysis.find(v => 
                    v.timestamp >= segment.start && v.timestamp <= segment.end
                );
                
                if (matchingVision) {
                    entry.vision = matchingVision.analysis;
                    entry.sceneIndex = matchingVision.sceneIndex;
                }

                timeline.push(entry);
            }

            // Add vision-only entries (frames without transcript)
            for (const vision of visionAnalysis) {
                const hasTranscript = timeline.some(t => 
                    vision.timestamp >= t.start && vision.timestamp <= t.end
                );
                
                if (!hasTranscript) {
                    timeline.push({
                        start: vision.timestamp,
                        end: vision.timestamp + 1,
                        startFormatted: this.formatTimestamp(vision.timestamp),
                        endFormatted: this.formatTimestamp(vision.timestamp + 1),
                        transcript: null,
                        vision: vision.analysis,
                        sceneIndex: vision.sceneIndex
                    });
                }
            }

            // Sort by timestamp
            timeline.sort((a, b) => a.start - b.start);

            return timeline;
        }

        // ═══════════════════════════════════════════════════════════════
        // LAYER 5: STORAGE
        // ═══════════════════════════════════════════════════════════════
        
        async saveToStorage(videoData) {
            const supabase = window.CAVSupabase?.client;
            if (!supabase) return;

            try {
                // Get user email for Google Sign-In
                const userEmail = window.cavUserSession?.email || 
                                  window.CAVSecurity?.SecureSessionManager?.getSession()?.email || 
                                  'anonymous';
                
                await supabase.from('video_analyses').upsert({
                    url: videoData.source,
                    platform: videoData.platform,
                    video_id: videoData.videoId,
                    metadata: videoData.metadata,
                    transcript: videoData.transcript,
                    user_email: userEmail,
                    owner_email: userEmail,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'url' });
                
                console.log('[VideoIntelligence] Saved to Supabase');
            } catch (error) {
                console.warn('[VideoIntelligence] Storage error:', error);
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // LAYER 6: OUTPUT (Templates & Chat)
        // ═══════════════════════════════════════════════════════════════
        
        async generateFromTemplate(templateId, videoData = null) {
            const data = videoData || this.currentVideoData;
            if (!data) throw new Error('No video data available');

            const template = TEMPLATES[templateId];
            if (!template) throw new Error(`Unknown template: ${templateId}`);

            console.log(`[VideoIntelligence] Generating: ${template.name}`);

            // Build context from video data
            const context = this.buildVideoContext(data);
            
            // Create full prompt
            const fullPrompt = `${template.prompt}

VIDEO CONTEXT:
${context}

Generate the requested output based on this video analysis.`;

            // Call AI
            const apiKey = this.getAPIKey('gemini') || this.getAPIKey('openai');
            if (!apiKey) throw new Error('No AI API key configured');

            const response = await this.callAI(fullPrompt, apiKey);
            return response;
        }

        buildVideoContext(data) {
            let context = '';
            
            // Handle AdvancedVideoAnalyzer format
            if (data.executiveSummary || data.hookAnalysis) {
                context += `VIDEO ANALYSIS SUMMARY:\n`;
                
                // Executive Summary
                if (data.executiveSummary) {
                    context += `
EXECUTIVE SUMMARY:
- Overall Score: ${data.overallScore || data.executiveSummary.overallScore || 'N/A'}/100
- Grade: ${data.executiveSummary.grade || 'N/A'}
- Verdict: ${data.executiveSummary.verdict || 'N/A'}
- Platform: ${data.platform || 'Unknown'}
- Video URL: ${data.url || 'N/A'}
`;
                }
                
                // Hook Analysis
                if (data.hookAnalysis) {
                    context += `
HOOK ANALYSIS (First 3 Seconds):
- Hook Type: ${data.hookAnalysis.hookType || 'Unknown'}
- Hook Score: ${data.hookAnalysis.score || 'N/A'}/100
- Visual Score: ${data.hookAnalysis.visualScore || 'N/A'}/30
- Audio Score: ${data.hookAnalysis.audioScore || 'N/A'}/25
- Text Score: ${data.hookAnalysis.textScore || 'N/A'}/25
- Curiosity Score: ${data.hookAnalysis.curiosityScore || 'N/A'}/20
- Strengths: ${(data.hookAnalysis.strengths || []).join(', ') || 'None identified'}
- Weaknesses: ${(data.hookAnalysis.weaknesses || []).join(', ') || 'None identified'}
`;
                }
                
                // Retention Analysis
                if (data.retentionAnalysis) {
                    context += `
RETENTION ANALYSIS:
- Pattern: ${data.retentionAnalysis.structuralPattern || 'Unknown'}
- Score: ${data.retentionAnalysis.score || 'N/A'}/100
`;
                }
                
                // Strategic Insights
                if (data.strategicInsights) {
                    context += `
STRATEGIC INSIGHTS:
- Overall Rating: ${data.strategicInsights.overallRating || 'N/A'}
- Category: ${data.strategicInsights.category || 'Unknown'}
- Uniqueness: ${data.strategicInsights.uniqueness || 'N/A'}
- Memorability: ${data.strategicInsights.memorability || 'N/A'}
- Psychology Principles: ${(data.strategicInsights.psychologyPrinciples || []).map(p => p.principle || p).join(', ') || 'None'}
`;
                }
                
                // Ad Copy
                if (data.adCopySuggestions) {
                    context += `
GENERATED AD COPY:
Headlines: ${(data.adCopySuggestions.headlines || []).map(h => h.text || h).join(' | ') || 'None'}
Primary Text: ${(data.adCopySuggestions.primaryText || []).map(p => p.text || p).slice(0, 2).join(' | ') || 'None'}
`;
                }
                
                // A/B Test Recommendations
                if (data.abTestRecommendations?.length > 0) {
                    context += `
A/B TEST RECOMMENDATIONS:
${data.abTestRecommendations.slice(0, 5).map(t => `- ${t.hypothesis || t.variable}: ${t.expected_impact || 'Impact TBD'}`).join('\n')}
`;
                }
                
                // Creative Brief
                if (data.v2CreativeBrief) {
                    context += `
V2 CREATIVE BRIEF:
${data.v2CreativeBrief}
`;
                }
                
                return context;
            }
            
            // Handle VideoIntelligenceEngine format (legacy)
            // Metadata
            if (data.metadata) {
                context += `METADATA:
- Title: ${data.metadata.title || 'Unknown'}
- Creator: ${data.metadata.author || 'Unknown'}
- Platform: ${data.platform}
- Duration: ${data.metadata.duration || 'Unknown'}

`;
            }

            // Transcript
            if (data.transcript?.segments?.length > 0) {
                context += `TRANSCRIPT (with timestamps):
${data.transcript.segments.slice(0, 30).map(s => 
    `[${s.startFormatted}] ${s.text}`
).join('\n')}

`;
            }

            // Vision analysis
            if (data.visionAnalysis?.length > 0) {
                context += `VISUAL ANALYSIS (per frame):
${data.visionAnalysis.slice(0, 10).map(v => 
    `[${this.formatTimestamp(v.timestamp)}] Scene ${v.sceneIndex}: ${v.analysis?.sceneDescription || 'N/A'}`
).join('\n')}

`;
            }

            // Merged timeline
            if (data.mergedTimeline?.length > 0) {
                context += `MERGED TIMELINE:
${data.mergedTimeline.slice(0, 20).map(t => 
    `[${t.startFormatted}] ${t.transcript || ''} ${t.vision?.sceneDescription ? `| Visual: ${t.vision.sceneDescription}` : ''}`
).join('\n')}
`;
            }

            return context || 'No video data available.';
        }

        // ═══════════════════════════════════════════════════════════════
        // CHAT/RAG INTERFACE
        // ═══════════════════════════════════════════════════════════════
        
        async chat(userMessage, videoData = null) {
            const data = videoData || this.currentVideoData;
            if (!data) {
                return { 
                    role: 'assistant', 
                    content: 'Please analyze a video first before asking questions about it.' 
                };
            }

            // Add to history
            this.chatHistory.push({ role: 'user', content: userMessage });

            // Build RAG context
            const context = this.buildVideoContext(data);
            
            const systemPrompt = `You are an AI assistant analyzing a video. 
You have access to the video's transcript, visual analysis, and metadata.
Answer questions based on the actual video content. Be specific and cite timestamps when relevant.

VIDEO DATA:
${context}`;

            const messages = [
                { role: 'system', content: systemPrompt },
                ...this.chatHistory.slice(-10) // Last 10 messages for context
            ];

            // Call AI
            const apiKey = this.getAPIKey('gemini') || this.getAPIKey('openai');
            const response = await this.callChatAI(messages, apiKey);
            
            // Add response to history
            this.chatHistory.push({ role: 'assistant', content: response });

            return { role: 'assistant', content: response };
        }

        clearChat() {
            this.chatHistory = [];
        }

        // ═══════════════════════════════════════════════════════════════
        // UTILITIES
        // ═══════════════════════════════════════════════════════════════
        
        detectPlatform(url) {
            if (/youtube\.com|youtu\.be/i.test(url)) return 'youtube';
            if (/tiktok\.com/i.test(url)) return 'tiktok';
            if (/instagram\.com/i.test(url)) return 'instagram';
            if (/twitter\.com|x\.com/i.test(url)) return 'twitter';
            if (/vimeo\.com/i.test(url)) return 'vimeo';
            if (/facebook\.com|fb\.watch/i.test(url)) return 'facebook';
            return 'unknown';
        }

        extractVideoId(url, platform) {
            const patterns = {
                youtube: /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
                vimeo: /vimeo\.com\/(\d+)/,
                tiktok: /video\/(\d+)/
            };
            const match = url.match(patterns[platform]);
            return match ? match[1] : null;
        }

        async fetchMetadata(source, platform) {
            if (window.SupabaseVideoProcessor) {
                return await window.SupabaseVideoProcessor.fetchMetadata(
                    typeof source === 'string' ? source : '',
                    platform
                );
            }
            return null;
        }

        formatTimestamp(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        getAPIKey(service) {
            // Method 1: Use CAVSettings.manager.getAPIKey (MOST RELIABLE - handles shared keys)
            if (window.CAVSettings?.manager?.getAPIKey) {
                const key = window.CAVSettings.manager.getAPIKey(service);
                if (key) return key;
            }
            if (window.CAVSettings?.getAPIKey) {
                const key = window.CAVSettings.getAPIKey(service);
                if (key) return key;
            }

            // Method 2: Check platform credentials (shared keys from Supabase)
            try {
                const platformCreds = JSON.parse(localStorage.getItem('cav_platform_credentials') || '{}');
                if (platformCreds[service]?.key) return platformCreds[service].key;
                if (platformCreds[`${service}_api_key`]) return platformCreds[`${service}_api_key`];
                if (platformCreds[`${service}ApiKey`]) return platformCreds[`${service}ApiKey`];
                if (platformCreds[service]) return platformCreds[service];
            } catch (e) {}

            // Method 3: Check v3 settings structure
            try {
                const v3Settings = JSON.parse(localStorage.getItem('cav_v3_settings') || '{}');
                if (v3Settings.apiKeys?.[service]?.key) return v3Settings.apiKeys[service].key;
                if (v3Settings[`${service}ApiKey`]) return v3Settings[`${service}ApiKey`];
                if (v3Settings[`${service}_api_key`]) return v3Settings[`${service}_api_key`];
            } catch (e) {}

            // Method 4: Direct localStorage keys
            const directKey = localStorage.getItem(`${service}_api_key`) || localStorage.getItem(`${service}ApiKey`);
            if (directKey) return directKey;

            console.warn(`[VideoIntelligenceEngine] No API key found for ${service}`);
            return null;
        }

        async callAI(prompt, apiKey) {
            const modelId = window.AIModels?.getGeminiModelId('flash') || 'gemini-3-flash-preview';
            
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
                })
            });

            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }

        async callChatAI(messages, apiKey) {
            // Use Gemini for chat
            const modelId = window.AIModels?.getGeminiModelId('flash') || 'gemini-3-flash-preview';
            
            // Convert messages to Gemini format
            const contents = messages.map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }]
            }));

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents,
                    generationConfig: { temperature: 0.7, maxOutputTokens: 4096 }
                })
            });

            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || 'I encountered an error processing your request.';
        }

        // Get available templates
        getTemplates() {
            return TEMPLATES;
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // EXPORT
    // ═══════════════════════════════════════════════════════════════════
    
    window.VideoIntelligenceEngine = new VideoIntelligenceEngine();
    window.VIDEO_TEMPLATES = TEMPLATES;
    
    console.log('[VideoIntelligence] Engine loaded v' + VERSION);
    console.log('[VideoIntelligence] Available templates:', Object.keys(TEMPLATES).join(', '));

})();
