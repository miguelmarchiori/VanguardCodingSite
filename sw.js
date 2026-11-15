/* =========================================================
   VanCode · service worker (app instalável + offline)
   Sempre tenta a rede primeiro: com internet, ninguém fica
   com versão velha. Sem internet, usa o que já está guardado.
   ========================================================= */
const CACHE = 'vancode-v1';
const BASICO = [
  './', 'index.html', 'manifest.webmanifest', 'favicon.ico', 'css/style.css',
  'js/utils.js', 'js/courses.js', 'js/courses-python-plus.js', 'js/courses-java-plus.js', 'js/arena.js',
  'js/firebase-config.js', 'js/cargos.js', 'js/cloud.js', 'js/app.js',
  'img/favicon.png', 'img/favicon-32.png', 'img/icon-192.png', 'img/vanguard-logo-sm.png', 'img/vanguard-logo.png',
  'img/python.svg', 'img/java.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(BASICO)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // Firebase e fontes vão direto para a rede
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) { const copia = res.clone(); caches.open(CACHE).then((c) => c.put(req, copia)); }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || (req.mode === 'navigate' ? caches.match('index.html') : undefined)))
  );
});
