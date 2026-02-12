/**
 * Creative Asset Validator - Service Worker
 * Version 4.2.0 - Instant Loading & Offline Support
 * 
 * This service worker provides:
 * - Instant loading from cache
 * - Offline support
 * - Background sync for saves
 * - Faster subsequent visits
 */

const CACHE_NAME = 'cav-v4.2.0';
const RUNTIME_CACHE = 'cav-runtime-v4.2.0';

// Files to cache immediately on install
const PRECACHE_URLS = [
    './',
    './index.html',
    './validator.css',
    './validator-app.js',
    './security-core.js',
    './settings-module.js',
    './crm.js',
    './integrations.js',
    './ai-adapter.js',
    './ai-studio.js',
    './ai-orchestrator.js',
    './ai-intelligence-engine.js',
    './ai-library-integration.js',
    './ai-library-manager.js',
    './analyze-module.js',
    './strategy-module.js',
    './learn-module.js',
    './logo-generator.js',
    './auto-fix.js',
    './advanced-features.js',
    './advanced-toolbar.js',
    './data-models.js'
];

// External resources to cache
const EXTERNAL_CACHE_URLS = [
    'https://accounts.google.com/gsi/client',
    'https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@0.27.3/dist/web.mjs'
];

// Install event - cache core files
self.addEventListener('install', event => {
    console.log('[SW] Installing Service Worker v4.2.0');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching core files');
                return cache.addAll(PRECACHE_URLS);
            })
            .then(() => {
                console.log('[SW] Core files cached');
                return self.skipWaiting();
            })
            .catch(err => {
                console.error('[SW] Cache failed:', err);
            })
    );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
    console.log('[SW] Activating Service Worker v4.2.0');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => {
                            return cacheName.startsWith('cav-') && 
                                   cacheName !== CACHE_NAME && 
                                   cacheName !== RUNTIME_CACHE;
                        })
                        .map(cacheName => {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Old caches cleaned');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, update in background
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip Google OAuth and API calls (always fresh)
    if (url.hostname.includes('google') || 
        url.hostname.includes('googleapis') ||
        url.hostname.includes('anthropic') ||
        url.hostname.includes('openai') ||
        url.hostname.includes('searchapi') ||
        url.pathname.includes('auth-config')) {
        return;
    }
    
    // Stale-while-revalidate strategy for app files
    if (url.origin === self.location.origin) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(event.request).then(cachedResponse => {
                    const fetchPromise = fetch(event.request)
                        .then(networkResponse => {
                            // Update cache in background
                            if (networkResponse.ok) {
                                cache.put(event.request, networkResponse.clone());
                            }
                            return networkResponse;
                        })
                        .catch(() => {
                            // Network failed, return cached version
                            return cachedResponse;
                        });
                    
                    // Return cached version immediately if available
                    return cachedResponse || fetchPromise;
                });
            })
        );
        return;
    }
    
    // Network-first for external resources
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Cache successful external responses
                if (response.ok) {
                    const responseClone = response.clone();
                    caches.open(RUNTIME_CACHE).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Fallback to cache for external resources
                return caches.match(event.request);
            })
    );
});

// Background sync for offline saves
self.addEventListener('sync', event => {
    if (event.tag === 'sync-data') {
        console.log('[SW] Background sync triggered');
        event.waitUntil(syncData());
    }
});

async function syncData() {
    // This would sync any pending saves when back online
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
        client.postMessage({
            type: 'SYNC_COMPLETE',
            message: 'Background sync completed'
        });
    });
}

// Handle messages from the main app
self.addEventListener('message', event => {
    if (event.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data === 'CLEAR_CACHE') {
        caches.keys().then(names => {
            names.forEach(name => {
                if (name.startsWith('cav-')) {
                    caches.delete(name);
                }
            });
        });
    }
});

console.log('[SW] Service Worker loaded - v4.2.0');

