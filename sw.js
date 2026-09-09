const CACHE_NAME = "tablero-arduino-v1.0.0";
const CORE = [
  "./",
  "./index.html",
  "./offline.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./data/modules.js",
  "./data/modules.json",
  "./data/content.js",
  "./data/classification.csv",
  "./downloads/GUIA%20PARA%20LA%20WEB.docx",
  "./assets/icons/icon.svg",
  "./assets/icons/maskable.svg",
  "./assets/images/placeholder.svg",
  "./assets/images/manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE);
    const extras = [];
    try {
      const imageManifest = await fetch("./assets/images/manifest.json").then((response) => response.json());
      extras.push(...Object.values(imageManifest).map((item) => item.local).filter(Boolean).map((path) => `./${path}`));
    } catch {}
    try {
      const modules = await fetch("./data/modules.json").then((response) => response.json());
      extras.push(...modules.map((module) => `./modulos/${module.id}/index.html`));
      extras.push(...modules.map((module) => module.video?.src).filter((src) => src && !/^https?:/i.test(src)).map((src) => `./${src.replace(/^\.\//, "")}`));
    } catch {}
    await Promise.allSettled([...new Set(extras)].map((path) => cache.add(path)));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith("tablero-arduino-") && name !== CACHE_NAME).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
        return response;
      } catch {
        return (await caches.match(request)) || (await caches.match("./index.html")) || (await caches.match("./offline.html"));
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
      }
      return response;
    } catch {
      return new Response("Recurso no disponible sin conexión.", {status: 503, headers: {"Content-Type": "text/plain; charset=utf-8"}});
    }
  })());
});
