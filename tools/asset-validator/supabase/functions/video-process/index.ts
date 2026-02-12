/**
 * Supabase Edge Function: video-process
 * Full video processing pipeline for memories.ai-style analysis
 * 
 * January 18, 2026
 * 
 * Deploy: supabase functions deploy video-process
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { url, action = 'analyze' } = await req.json();
        
        if (!url) {
            return new Response(
                JSON.stringify({ success: false, error: 'URL required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const platform = detectPlatform(url);
        const videoId = extractVideoId(url, platform);
        
        let result: any = {
            success: false,
            url,
            platform,
            videoId,
            metadata: null,
            transcript: null,
            thumbnails: []
        };

        switch (action) {
            case 'metadata':
                result.metadata = await getMetadata(url, platform);
                result.success = !!result.metadata;
                break;
                
            case 'transcript':
                result.transcript = await getTranscript(url, platform, videoId);
                result.success = !!result.transcript?.segments?.length;
                break;
                
            case 'thumbnails':
                result.thumbnails = await getThumbnails(platform, videoId);
                result.success = result.thumbnails.length > 0;
                break;
                
            case 'analyze':
            default:
                // Full analysis
                result.metadata = await getMetadata(url, platform);
                
                if (platform === 'youtube') {
                    result.transcript = await getTranscript(url, platform, videoId);
                }
                
                result.thumbnails = await getThumbnails(platform, videoId);
                result.success = true;
                break;
        }

        // Store in Supabase if we have auth
        const authHeader = req.headers.get('Authorization');
        if (authHeader) {
            const supabase = createClient(
                Deno.env.get('SUPABASE_URL') ?? '',
                Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
                { auth: { persistSession: false } }
            );
            
            try {
                await supabase.from('video_analyses').upsert({
                    url,
                    platform,
                    video_id: videoId,
                    metadata: result.metadata,
                    transcript: result.transcript,
                    created_at: new Date().toISOString()
                });
            } catch (e) {
                console.error('Storage error:', e);
            }
        }

        return new Response(
            JSON.stringify(result),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Error:', error);
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});

/**
 * Detect video platform
 */
function detectPlatform(url: string): string {
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
function extractVideoId(url: string, platform: string): string | null {
    const patterns: Record<string, RegExp> = {
        youtube: /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
        vimeo: /vimeo\.com\/(\d+)/,
        tiktok: /video\/(\d+)/
    };
    
    const match = url.match(patterns[platform] || /./);
    return match ? match[1] : null;
}

/**
 * Get video metadata via oEmbed
 */
async function getMetadata(url: string, platform: string) {
    const endpoints: Record<string, string> = {
        youtube: `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
        vimeo: `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`,
        tiktok: `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
    };
    
    const endpoint = endpoints[platform] || `https://noembed.com/embed?url=${encodeURIComponent(url)}`;
    
    try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        
        return {
            title: data.title || null,
            author: data.author_name || null,
            authorUrl: data.author_url || null,
            thumbnail: data.thumbnail_url || null,
            thumbnailWidth: data.thumbnail_width || null,
            thumbnailHeight: data.thumbnail_height || null,
            provider: data.provider_name || platform,
            html: data.html || null,
            source: 'oembed'
        };
    } catch (error) {
        console.error('Metadata error:', error);
        return null;
    }
}

/**
 * Get transcript (YouTube auto-captions via external service)
 */
async function getTranscript(url: string, platform: string, videoId: string | null) {
    if (platform !== 'youtube' || !videoId) {
        return null;
    }
    
    // Use YouTube transcript API (multiple fallback services)
    const services = [
        // RapidAPI YouTube Transcript
        async () => {
            const response = await fetch(`https://youtube-transcriptor.p.rapidapi.com/transcript?video_id=${videoId}&lang=en`, {
                headers: {
                    'X-RapidAPI-Key': Deno.env.get('RAPIDAPI_KEY') || '',
                    'X-RapidAPI-Host': 'youtube-transcriptor.p.rapidapi.com'
                }
            });
            if (!response.ok) throw new Error('RapidAPI failed');
            return await response.json();
        },
        
        // Fallback: YouTube captions endpoint (unofficial)
        async () => {
            // Try to fetch the video page and extract caption track
            const pageResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
            const html = await pageResponse.text();
            
            // Extract caption track URL from page
            const captionMatch = html.match(/"captionTracks":\s*\[([^\]]+)\]/);
            if (!captionMatch) throw new Error('No captions found');
            
            const captionData = JSON.parse(`[${captionMatch[1]}]`);
            const englishTrack = captionData.find((t: any) => t.languageCode === 'en');
            
            if (!englishTrack?.baseUrl) throw new Error('No English captions');
            
            // Fetch caption XML
            const captionResponse = await fetch(englishTrack.baseUrl);
            const captionXml = await captionResponse.text();
            
            // Parse XML to segments
            return parseYouTubeCaptions(captionXml);
        }
    ];
    
    for (const service of services) {
        try {
            const transcript = await service();
            if (transcript && (transcript.segments?.length || transcript.length)) {
                return {
                    segments: transcript.segments || transcript.map((t: any) => ({
                        text: t.text || t.subtitle,
                        start: parseFloat(t.start || t.startMs / 1000),
                        end: parseFloat(t.end || t.endMs / 1000),
                        startFormatted: formatTime(t.start || t.startMs / 1000),
                        endFormatted: formatTime(t.end || t.endMs / 1000)
                    })),
                    fullText: (transcript.segments || transcript).map((t: any) => t.text || t.subtitle).join(' '),
                    language: 'en',
                    source: 'youtube'
                };
            }
        } catch (e) {
            console.log('Transcript service failed:', e);
            continue;
        }
    }
    
    return null;
}

/**
 * Parse YouTube caption XML
 */
function parseYouTubeCaptions(xml: string) {
    const segments: any[] = [];
    const regex = /<text start="([^"]+)" dur="([^"]+)"[^>]*>([^<]+)<\/text>/g;
    let match;
    
    while ((match = regex.exec(xml)) !== null) {
        const start = parseFloat(match[1]);
        const dur = parseFloat(match[2]);
        const text = decodeHTMLEntities(match[3]);
        
        segments.push({
            text,
            start,
            end: start + dur,
            startFormatted: formatTime(start),
            endFormatted: formatTime(start + dur)
        });
    }
    
    return { segments };
}

/**
 * Decode HTML entities
 */
function decodeHTMLEntities(text: string): string {
    return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/\n/g, ' ')
        .trim();
}

/**
 * Get available thumbnails
 */
async function getThumbnails(platform: string, videoId: string | null): Promise<any[]> {
    if (!videoId) return [];
    
    const thumbnails: any[] = [];
    
    if (platform === 'youtube') {
        // YouTube has standard thumbnail URLs
        const sizes = [
            { name: 'maxres', url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` },
            { name: 'sd', url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg` },
            { name: 'hq', url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` },
            { name: 'mq', url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` },
            { name: 'default', url: `https://img.youtube.com/vi/${videoId}/default.jpg` },
            // Frame-specific thumbnails
            { name: 'frame1', url: `https://img.youtube.com/vi/${videoId}/1.jpg` },
            { name: 'frame2', url: `https://img.youtube.com/vi/${videoId}/2.jpg` },
            { name: 'frame3', url: `https://img.youtube.com/vi/${videoId}/3.jpg` },
        ];
        
        // Verify which thumbnails exist
        for (const size of sizes) {
            try {
                const response = await fetch(size.url, { method: 'HEAD' });
                if (response.ok) {
                    thumbnails.push({
                        type: size.name,
                        url: size.url,
                        available: true
                    });
                }
            } catch (e) {
                // Skip unavailable
            }
        }
    }
    
    return thumbnails;
}

/**
 * Format seconds to MM:SS
 */
function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
