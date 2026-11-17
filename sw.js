/* أَثَر — عامل خدمة بسيط: يجعل التطبيق يعمل بلا إنترنت بعد أول زيارة.
   استراتيجية: الشبكة أولًا للصفحة (لتصل التحديثات من GitHub Pages فورًا)،
   وكاش احتياطي عند انقطاع الشبكة. لا يخزّن أي بيانات مستخدم — البيانات في localStorage. */
const CACHE = 'athar-v2';
const ASSETS = [
  './', './index.html', './manifest.webmanifest',
  './icons/favicon.png', './icons/icon-180.png',
  './icons/icon-192.png', './icons/icon-512.png',
  './icons/icon-512-rounded.png', './icons/maskable-512.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(()=>{}).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{});
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
