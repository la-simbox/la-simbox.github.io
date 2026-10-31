// Service worker RK7 Team : affiche les notifications envoyées par l'espace pilotes
const AUTH_URL = "https://ep-spring-voice-b9slst0q.neonauth.c-7.eu-central-1.aws.neon.tech/neondb/auth";
const REST_URL = "https://ep-spring-voice-b9slst0q.apirest.c-7.eu-central-1.aws.neon.tech/neondb/rest/v1";

// Hors ligne : page et images gardées en cache (réseau d'abord pour la page, pour toujours avoir la dernière version)
const CACHE = "rk7-v3";
const SHELL = ["./", "index.html", "equipe.html", "manifest.webmanifest", "img/logo-rk7.png", "img/icon-192.png", "img/icon-512.png", "img/apple-touch-icon.png"];
self.addEventListener("install", (e) => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {})); });
self.addEventListener("activate", (e) => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener("fetch", (e) => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const font = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!sameOrigin && !font) return;
  if (req.mode === "navigate" || (sameOrigin && /\.html$|\/$/.test(url.pathname))) {
    e.respondWith(fetch(req).then((r) => { const c = r.clone(); caches.open(CACHE).then((x) => x.put(req, c)); return r; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match("index.html"))));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => {
    const net = fetch(req).then((r) => { if (r.ok || r.type === "opaque") { const c = r.clone(); caches.open(CACHE).then((x) => x.put(req, c)); } return r; }).catch(() => hit);
    return hit || net;
  }));
});

async function fetchInbox() {
  const sub = await self.registration.pushManager.getSubscription();
  if (!sub) return [];
  const t = await (await fetch(AUTH_URL + "/token/anonymous")).json();
  const r = await fetch(REST_URL + "/rpc/push_inbox", {
    method: "POST",
    headers: { authorization: "Bearer " + t.token, "content-type": "application/json", "content-profile": "api", "accept-profile": "api" },
    body: JSON.stringify({ sub_endpoint: sub.endpoint }),
  });
  const items = await r.json();
  return Array.isArray(items) ? items : [];
}

self.addEventListener("push", (event) => {
  event.waitUntil((async () => {
    let items = [];
    try { items = await fetchInbox(); } catch (e) {}
    if (!items.length) items = [{ titre: "RK7 Team", corps: "Du nouveau sur l'espace pilotes.", url: "" }];
    const shown = items.slice(-4);
    for (let i = 0; i < shown.length; i++) {
      const n = shown[i];
      await self.registration.showNotification(n.titre, {
        body: n.corps,
        icon: "img/icon-192.png",
        badge: "img/icon-192.png",
        tag: "rk7-" + Date.now() + "-" + i,
        data: { url: n.url || "" },
      });
    }
  })());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL("./" + (event.notification.data && event.notification.data.url || ""), self.registration.scope).href;
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of all) {
      if (c.url.startsWith(self.registration.scope)) { await c.focus(); try { await c.navigate(target); } catch (e) {} return; }
    }
    await self.clients.openWindow(target);
  })());
});
