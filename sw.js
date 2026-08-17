const CACHE_NAME = 'genkouchou-v1';
const ASSETS = ['./index.html', './manifest.json'];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e=>{
  if(e.request.url.includes('api.github.com')) return; // 항상 최신 데이터
  e.respondWith(
    caches.match(e.request).then(cached=> cached || fetch(e.request))
  );
});
