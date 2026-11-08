// KART TRACKER — service worker minimal.
// Rien n'est mis en cache : en course on veut toujours la dernière version et
// des données live. Il sert seulement à rendre l'appli installable et à
// afficher un message clair quand il n'y a plus de réseau.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.mode !== 'navigate') return;
  e.respondWith(fetch(e.request).catch(() => new Response(
    '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<body style="margin:0;background:#03050D;color:#E0EAFF;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center;padding:16px">' +
    '<div><div style="font-size:48px">📡</div><h2>Pas de connexion internet</h2><p style="color:#8AA0CC">KART TRACKER a besoin du réseau pour le live et la salle d\'équipe.<br>Vérifie la 4G ou le Wi-Fi puis recharge.</p></div>',
    { headers: { 'content-type': 'text/html; charset=utf-8' } })));
});
