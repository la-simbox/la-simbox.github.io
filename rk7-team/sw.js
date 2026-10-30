// Service worker RK7 Team : affiche les notifications envoyées par l'espace pilotes
const AUTH_URL = "https://ep-spring-voice-b9slst0q.neonauth.c-7.eu-central-1.aws.neon.tech/neondb/auth";
const REST_URL = "https://ep-spring-voice-b9slst0q.apirest.c-7.eu-central-1.aws.neon.tech/neondb/rest/v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

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
