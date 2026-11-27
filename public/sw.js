// space150 offline support: keeps the app itself on the device so it opens without a connection.
// Your data (decks, quizzes…) is kept separately by the app; this file never caches Supabase.
const CACHE = "space150-app-v1";
const M = { ignoreVary: true };   // a script asked for differently is still the same file
const SHELL = "/index.html";

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const res = await fetch(SHELL, { cache: "no-store" });
    await cache.put(SHELL, res.clone());
    // The scripts and styles the page loads, so the first offline visit works too.
    const html = await res.text();
    const urls = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1]);
    await Promise.all(urls.map((u) => cache.add(u).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

// Save the newest app page and drop built files from older versions.
async function keepShell(res) {
  const cache = await caches.open(CACHE);
  const html = await res.clone().text();
  await cache.put(SHELL, res);
  const live = new Set([...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1]));
  if (!live.size) return;
  for (const r of await cache.keys()) { const p = new URL(r.url).pathname; if (p.startsWith("/assets/") && !live.has(p)) await cache.delete(r); }
}

const isFont = (url) => url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // Pages: use the network, and fall back to the saved app when offline.
  if (req.mode === "navigate" && sameOrigin) {
    event.respondWith((async () => {
      try {
        const res = await fetch(req);
        if (res.ok) event.waitUntil(keepShell(res.clone()));
        return res;
      } catch {
        return (await caches.match(SHELL, M)) || Response.error();
      }
    })());
    return;
  }
  // Built files have the version in their name, so a saved copy is always right.
  if (sameOrigin && url.pathname.startsWith("/assets/")) {
    event.respondWith((async () => {
      const hit = await caches.match(req.url, M);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) (await caches.open(CACHE)).put(req, res.clone());
      return res;
    })());
    return;
  }
  // Fonts and other files of the site: the saved copy now, refreshed in the background.
  if ((sameOrigin && url.pathname !== "/sw.js") || isFont(url)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(req.url, M);
      const net = fetch(req).then((res) => { if (res.ok || res.type === "opaque") cache.put(req, res.clone()); return res; }).catch(() => null);
      return hit || (await net) || Response.error();
    })());
  }
});
