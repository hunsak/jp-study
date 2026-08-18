const CACHE_NAME = 'genkouchou-v2';
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

  // HTML(문서)은 network-first: 최신 버전을 먼저 시도하고, 오프라인일 때만 캐시 사용
  if(e.request.mode === 'navigate' || e.request.url.endsWith('.html')){
    e.respondWith(
      fetch(e.request)
        .then(res=>{
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c=>c.put(e.request, clone));
          return res;
        })
        .catch(()=> caches.match(e.request))
    );
    return;
  }

  // 그 외 정적 파일은 기존처럼 cache-first
  e.respondWith(
    caches.match(e.request).then(cached=> cached || fetch(e.request))
  );
});
