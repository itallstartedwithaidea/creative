<?php
/**
 * Video Processor API - Server-side video analysis
 * Requires: yt-dlp, ffmpeg (install on server)
 * 
 * January 18, 2026
 * 
 * ENDPOINTS:
 * POST /api/video-processor.php?action=download   - Download video with yt-dlp
 * POST /api/video-processor.php?action=extract    - Extract frames with ffmpeg
 * POST /api/video-processor.php?action=transcribe - Get transcript
 * POST /api/video-processor.php?action=analyze    - Full analysis pipeline
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Configuration
$config = [
    'ytdlp_path' => '/usr/local/bin/yt-dlp',  // Adjust path as needed
    'ffmpeg_path' => '/usr/local/bin/ffmpeg',  // Adjust path as needed
    'temp_dir' => __DIR__ . '/../temp/videos/',
    'output_dir' => __DIR__ . '/../temp/frames/',
    'max_video_duration' => 600,  // 10 minutes max
    'frame_timestamps' => [0, 1, 3, 5, 7, 10, 15, 20, 30, 45, 60],
    'frame_quality' => 2,  // 1-31, lower is better
    'frame_width' => 1280
];

// Create temp directories
if (!is_dir($config['temp_dir'])) mkdir($config['temp_dir'], 0755, true);
if (!is_dir($config['output_dir'])) mkdir($config['output_dir'], 0755, true);

// Get action
$action = $_GET['action'] ?? 'analyze';
$input = json_decode(file_get_contents('php://input'), true) ?? [];

try {
    switch ($action) {
        case 'download':
            echo json_encode(downloadVideo($input['url'] ?? '', $config));
            break;
            
        case 'extract':
            echo json_encode(extractFrames($input['video_path'] ?? '', $input['timestamps'] ?? null, $config));
            break;
            
        case 'metadata':
            echo json_encode(getVideoMetadata($input['url'] ?? '', $config));
            break;
            
        case 'transcript':
            echo json_encode(getTranscript($input['url'] ?? '', $input['video_id'] ?? '', $config));
            break;
            
        case 'analyze':
        default:
            echo json_encode(fullAnalysis($input['url'] ?? '', $config));
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

/**
 * Download video using yt-dlp
 */
function downloadVideo($url, $config) {
    if (empty($url)) {
        return ['success' => false, 'error' => 'URL required'];
    }
    
    // Check if yt-dlp is available
    if (!file_exists($config['ytdlp_path'])) {
        // Try to find yt-dlp in PATH
        $ytdlp = trim(shell_exec('which yt-dlp 2>/dev/null'));
        if (empty($ytdlp)) {
            return [
                'success' => false,
                'error' => 'yt-dlp not installed. Install with: pip install yt-dlp',
                'install_instructions' => [
                    'pip' => 'pip install yt-dlp',
                    'brew' => 'brew install yt-dlp',
                    'apt' => 'sudo apt install yt-dlp'
                ]
            ];
        }
        $config['ytdlp_path'] = $ytdlp;
    }
    
    $videoId = uniqid('vid_');
    $outputPath = $config['temp_dir'] . $videoId . '.%(ext)s';
    
    // Build yt-dlp command
    $cmd = sprintf(
        '%s -f "best[height<=720]" --max-filesize 100M --no-playlist -o %s %s 2>&1',
        escapeshellcmd($config['ytdlp_path']),
        escapeshellarg($outputPath),
        escapeshellarg($url)
    );
    
    $output = [];
    $returnCode = 0;
    exec($cmd, $output, $returnCode);
    
    if ($returnCode !== 0) {
        return [
            'success' => false,
            'error' => 'Download failed',
            'details' => implode("\n", $output)
        ];
    }
    
    // Find the downloaded file
    $files = glob($config['temp_dir'] . $videoId . '.*');
    $videoFile = !empty($files) ? $files[0] : null;
    
    if (!$videoFile || !file_exists($videoFile)) {
        return ['success' => false, 'error' => 'Video file not found after download'];
    }
    
    return [
        'success' => true,
        'video_id' => $videoId,
        'video_path' => $videoFile,
        'filename' => basename($videoFile),
        'size' => filesize($videoFile)
    ];
}

/**
 * Extract frames using ffmpeg
 */
function extractFrames($videoPath, $timestamps = null, $config) {
    if (empty($videoPath) || !file_exists($videoPath)) {
        return ['success' => false, 'error' => 'Video file not found'];
    }
    
    // Check if ffmpeg is available
    if (!file_exists($config['ffmpeg_path'])) {
        $ffmpeg = trim(shell_exec('which ffmpeg 2>/dev/null'));
        if (empty($ffmpeg)) {
            return [
                'success' => false,
                'error' => 'ffmpeg not installed',
                'install_instructions' => [
                    'brew' => 'brew install ffmpeg',
                    'apt' => 'sudo apt install ffmpeg'
                ]
            ];
        }
        $config['ffmpeg_path'] = $ffmpeg;
    }
    
    // Get video duration
    $durationCmd = sprintf(
        '%s -i %s 2>&1 | grep "Duration"',
        escapeshellcmd($config['ffmpeg_path']),
        escapeshellarg($videoPath)
    );
    $durationOutput = shell_exec($durationCmd);
    preg_match('/Duration: (\d{2}):(\d{2}):(\d{2})/', $durationOutput, $matches);
    $duration = isset($matches[1]) ? ($matches[1] * 3600 + $matches[2] * 60 + $matches[3]) : 60;
    
    // Use provided timestamps or defaults
    $timestamps = $timestamps ?? $config['frame_timestamps'];
    $timestamps = array_filter($timestamps, function($t) use ($duration) {
        return $t < $duration;
    });
    
    $frameId = uniqid('frames_');
    $frameDir = $config['output_dir'] . $frameId . '/';
    mkdir($frameDir, 0755, true);
    
    $frames = [];
    
    foreach ($timestamps as $timestamp) {
        $outputFile = $frameDir . sprintf('frame_%05.1f.jpg', $timestamp);
        
        $cmd = sprintf(
            '%s -ss %s -i %s -vframes 1 -q:v %d -vf "scale=%d:-1" %s 2>&1',
            escapeshellcmd($config['ffmpeg_path']),
            escapeshellarg($timestamp),
            escapeshellarg($videoPath),
            $config['frame_quality'],
            $config['frame_width'],
            escapeshellarg($outputFile)
        );
        
        exec($cmd, $output, $returnCode);
        
        if ($returnCode === 0 && file_exists($outputFile)) {
            // Convert to base64 for direct use
            $imageData = base64_encode(file_get_contents($outputFile));
            
            $frames[] = [
                'timestamp' => $timestamp,
                'label' => formatFrameLabel($timestamp, $duration),
                'path' => $outputFile,
                'url' => str_replace(__DIR__ . '/..', '', $outputFile),
                'dataUrl' => 'data:image/jpeg;base64,' . $imageData
            ];
        }
    }
    
    return [
        'success' => count($frames) > 0,
        'frame_id' => $frameId,
        'frame_dir' => $frameDir,
        'frames' => $frames,
        'duration' => $duration,
        'total_frames' => count($frames)
    ];
}

/**
 * Get video metadata using yt-dlp
 */
function getVideoMetadata($url, $config) {
    if (empty($url)) {
        return ['success' => false, 'error' => 'URL required'];
    }
    
    $ytdlp = $config['ytdlp_path'];
    if (!file_exists($ytdlp)) {
        $ytdlp = trim(shell_exec('which yt-dlp 2>/dev/null'));
        if (empty($ytdlp)) {
            // Fallback to oEmbed
            return getOEmbedMetadata($url);
        }
    }
    
    $cmd = sprintf(
        '%s --dump-json --no-download %s 2>&1',
        escapeshellcmd($ytdlp),
        escapeshellarg($url)
    );
    
    $output = shell_exec($cmd);
    $data = json_decode($output, true);
    
    if (!$data) {
        return getOEmbedMetadata($url);
    }
    
    return [
        'success' => true,
        'title' => $data['title'] ?? null,
        'description' => $data['description'] ?? null,
        'duration' => $data['duration'] ?? null,
        'thumbnail' => $data['thumbnail'] ?? null,
        'uploader' => $data['uploader'] ?? null,
        'uploader_url' => $data['uploader_url'] ?? null,
        'view_count' => $data['view_count'] ?? null,
        'like_count' => $data['like_count'] ?? null,
        'upload_date' => $data['upload_date'] ?? null,
        'platform' => $data['extractor'] ?? null,
        'video_id' => $data['id'] ?? null,
        'subtitles' => array_keys($data['subtitles'] ?? []),
        'automatic_captions' => array_keys($data['automatic_captions'] ?? []),
        'raw' => $data
    ];
}

/**
 * Fallback to oEmbed for metadata
 */
function getOEmbedMetadata($url) {
    $platform = detectPlatform($url);
    
    $endpoints = [
        'youtube' => 'https://www.youtube.com/oembed?url=' . urlencode($url) . '&format=json',
        'vimeo' => 'https://vimeo.com/api/oembed.json?url=' . urlencode($url),
        'tiktok' => 'https://www.tiktok.com/oembed?url=' . urlencode($url),
    ];
    
    $endpoint = $endpoints[$platform] ?? 'https://noembed.com/embed?url=' . urlencode($url);
    
    $response = @file_get_contents($endpoint);
    if ($response) {
        $data = json_decode($response, true);
        return [
            'success' => true,
            'title' => $data['title'] ?? null,
            'author' => $data['author_name'] ?? null,
            'thumbnail' => $data['thumbnail_url'] ?? null,
            'provider' => $data['provider_name'] ?? $platform,
            'source' => 'oembed'
        ];
    }
    
    return ['success' => false, 'error' => 'Could not fetch metadata'];
}

/**
 * Get transcript (auto-captions)
 */
function getTranscript($url, $videoId = null, $config) {
    $platform = detectPlatform($url);
    
    if ($platform === 'youtube') {
        return getYouTubeTranscript($url, $videoId, $config);
    }
    
    return [
        'success' => false,
        'error' => "Transcripts not available for $platform. Upload video for Whisper transcription.",
        'platform' => $platform
    ];
}

/**
 * Get YouTube transcript using yt-dlp
 */
function getYouTubeTranscript($url, $videoId = null, $config) {
    $ytdlp = $config['ytdlp_path'];
    if (!file_exists($ytdlp)) {
        $ytdlp = trim(shell_exec('which yt-dlp 2>/dev/null'));
        if (empty($ytdlp)) {
            return ['success' => false, 'error' => 'yt-dlp not available'];
        }
    }
    
    $subId = uniqid('sub_');
    $subDir = $config['temp_dir'] . $subId . '/';
    mkdir($subDir, 0755, true);
    
    // Download auto-generated subtitles
    $cmd = sprintf(
        '%s --write-auto-subs --sub-lang en --skip-download -o %s %s 2>&1',
        escapeshellcmd($ytdlp),
        escapeshellarg($subDir . 'subs'),
        escapeshellarg($url)
    );
    
    exec($cmd, $output, $returnCode);
    
    // Find subtitle file
    $subFiles = glob($subDir . '*.vtt') ?: glob($subDir . '*.srt');
    
    if (empty($subFiles)) {
        // Cleanup
        array_map('unlink', glob($subDir . '*'));
        rmdir($subDir);
        return ['success' => false, 'error' => 'No subtitles available'];
    }
    
    $subFile = $subFiles[0];
    $subContent = file_get_contents($subFile);
    
    // Parse VTT/SRT to segments
    $segments = parseSubtitles($subContent);
    
    // Cleanup
    array_map('unlink', glob($subDir . '*'));
    rmdir($subDir);
    
    return [
        'success' => true,
        'segments' => $segments,
        'fullText' => implode(' ', array_column($segments, 'text')),
        'language' => 'en',
        'source' => 'youtube_auto',
        'segment_count' => count($segments)
    ];
}

/**
 * Parse VTT/SRT subtitles to segments
 */
function parseSubtitles($content) {
    $segments = [];
    
    // VTT format: timestamps like "00:00:00.000 --> 00:00:05.000"
    // SRT format: "00:00:00,000 --> 00:00:05,000"
    
    $pattern = '/(\d{2}:\d{2}:\d{2}[.,]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[.,]\d{3})/';
    
    $parts = preg_split($pattern, $content, -1, PREG_SPLIT_DELIM_CAPTURE);
    
    for ($i = 1; $i < count($parts); $i += 3) {
        $start = parseTimestamp($parts[$i]);
        $end = parseTimestamp($parts[$i + 1]);
        $text = isset($parts[$i + 2]) ? trim(strip_tags($parts[$i + 2])) : '';
        
        // Remove VTT styling tags
        $text = preg_replace('/<[^>]+>/', '', $text);
        $text = preg_replace('/\{[^}]+\}/', '', $text);
        
        if (!empty($text)) {
            $segments[] = [
                'start' => $start,
                'end' => $end,
                'text' => $text,
                'startFormatted' => formatTime($start),
                'endFormatted' => formatTime($end)
            ];
        }
    }
    
    return $segments;
}

/**
 * Parse timestamp string to seconds
 */
function parseTimestamp($timestamp) {
    $timestamp = str_replace(',', '.', $timestamp);
    $parts = explode(':', $timestamp);
    
    if (count($parts) === 3) {
        return floatval($parts[0]) * 3600 + floatval($parts[1]) * 60 + floatval($parts[2]);
    } elseif (count($parts) === 2) {
        return floatval($parts[0]) * 60 + floatval($parts[1]);
    }
    
    return 0;
}

/**
 * Format seconds to MM:SS
 */
function formatTime($seconds) {
    $mins = floor($seconds / 60);
    $secs = floor($seconds % 60);
    return sprintf('%02d:%02d', $mins, $secs);
}

/**
 * Format frame label
 */
function formatFrameLabel($timestamp, $duration) {
    if ($timestamp <= 0) return 'Opening (0s)';
    if ($timestamp <= 3) return "Hook ({$timestamp}s)";
    if ($timestamp <= 7) return "Early ({$timestamp}s)";
    if ($duration && $timestamp >= $duration - 5) return "Closing ({$timestamp}s)";
    return "{$timestamp}s";
}

/**
 * Detect platform from URL
 */
function detectPlatform($url) {
    if (preg_match('/youtube\.com|youtu\.be/i', $url)) return 'youtube';
    if (preg_match('/tiktok\.com/i', $url)) return 'tiktok';
    if (preg_match('/instagram\.com/i', $url)) return 'instagram';
    if (preg_match('/twitter\.com|x\.com/i', $url)) return 'twitter';
    if (preg_match('/vimeo\.com/i', $url)) return 'vimeo';
    if (preg_match('/facebook\.com|fb\.watch/i', $url)) return 'facebook';
    return 'unknown';
}

/**
 * Full analysis pipeline
 */
function fullAnalysis($url, $config) {
    $result = [
        'success' => false,
        'url' => $url,
        'platform' => detectPlatform($url),
        'metadata' => null,
        'transcript' => null,
        'frames' => [],
        'video_file' => null,
        'errors' => []
    ];
    
    // Step 1: Get metadata
    $metadata = getVideoMetadata($url, $config);
    $result['metadata'] = $metadata['success'] ? $metadata : null;
    if (!$metadata['success']) {
        $result['errors'][] = 'Metadata: ' . ($metadata['error'] ?? 'Failed');
    }
    
    // Step 2: Try to get transcript
    $transcript = getTranscript($url, null, $config);
    $result['transcript'] = $transcript['success'] ? $transcript : null;
    if (!$transcript['success']) {
        $result['errors'][] = 'Transcript: ' . ($transcript['error'] ?? 'Not available');
    }
    
    // Step 3: Download video and extract frames
    $download = downloadVideo($url, $config);
    if ($download['success']) {
        $result['video_file'] = $download['video_path'];
        
        // Extract frames
        $frames = extractFrames($download['video_path'], null, $config);
        if ($frames['success']) {
            $result['frames'] = $frames['frames'];
        } else {
            $result['errors'][] = 'Frames: ' . ($frames['error'] ?? 'Failed');
        }
        
        // Cleanup video file after extracting frames
        if (file_exists($download['video_path'])) {
            unlink($download['video_path']);
        }
    } else {
        $result['errors'][] = 'Download: ' . ($download['error'] ?? 'Failed');
    }
    
    $result['success'] = !empty($result['metadata']) || !empty($result['transcript']) || !empty($result['frames']);
    
    return $result;
}

// Cleanup old temp files (run occasionally)
function cleanupOldFiles($config, $maxAge = 3600) {
    $dirs = [$config['temp_dir'], $config['output_dir']];
    
    foreach ($dirs as $dir) {
        if (!is_dir($dir)) continue;
        
        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::CHILD_FIRST
        );
        
        foreach ($files as $file) {
            if (time() - $file->getMTime() >= $maxAge) {
                if ($file->isDir()) {
                    @rmdir($file->getRealPath());
                } else {
                    @unlink($file->getRealPath());
                }
            }
        }
    }
}

// Run cleanup 1% of the time
if (rand(1, 100) === 1) {
    cleanupOldFiles($config);
}
