/*
 * オフライン対応の Service Worker
 *
 * - インストール時に、index.html が読み込むファイル一式をキャッシュする
 * - 取得は常にネットワークを優先し、成功したらキャッシュを更新する（問題データの更新がすぐ反映される）
 * - 通信できない・応答が遅いときはキャッシュから返す
 * - 解説のリンク先など、別サイトへのリクエストには関与しない
 */
// Cache Storage は同じオリジンの他のアプリと共有されるため、このアプリの接頭辞が付いたものだけを扱う
const CACHE_PREFIX = 'pg_quiz-';
const CACHE = `${CACHE_PREFIX}v1`;
const TIMEOUT_MS = 4000;

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const res = await fetch('./index.html', { cache: 'no-store' });
    const html = await res.clone().text();
    // index.html が参照している同一サイト内のファイル（スクリプト・スタイル・アイコン・マニフェスト）
    const urls = [...html.matchAll(/(?:src|href)="([^"#:]+)"/g)].map((m) => m[1]);
    await cache.put('./index.html', res);
    await cache.addAll(['./', ...new Set(urls)]);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith(CACHE_PREFIX) && k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(networkFirst(req));
});

async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  try {
    const res = await Promise.race([
      fetch(req),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS))
    ]);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch (e) {
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    if (req.mode === 'navigate') {
      const page = await cache.match('./index.html');
      if (page) return page;
    }
    throw e;
  }
}
