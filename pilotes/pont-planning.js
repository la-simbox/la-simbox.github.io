/* Pont SimBox Pilotes → SimBox Planning.
   S'exécute DANS la page du Planning (favori « SimBox ⇄ Pilotes ») avec la session déjà ouverte :
   récupère les posts prêts dans l'Espace pilotes, fabrique les visuels et les ajoute au calendrier.
   Aucun mot de passe n'est stocké : on utilise la connexion du Planning déjà ouverte dans le navigateur. */
(async function () {
  "use strict";
  const APP = "https://la-simbox.github.io/pilotes/";
  const AUTH = "https://ep-bold-paper-b90hj6av.neonauth.c-7.eu-central-1.aws.neon.tech/neondb/auth";
  const REST = "https://ep-bold-paper-b90hj6av.apirest.c-7.eu-central-1.aws.neon.tech/neondb/rest/v1";
  const TAG = "[pilotes:";

  // ---- petit panneau d'avancement
  let box = document.getElementById("sbPont");
  if (box) box.remove();
  box = document.createElement("div"); box.id = "sbPont";
  box.style.cssText = "position:fixed;z-index:99999;right:16px;top:16px;width:min(380px,calc(100vw - 32px));background:#111116;color:#f4f4f6;border:2px solid #e10600;border-radius:14px;padding:14px 16px;font:500 14px/1.45 Inter,system-ui,sans-serif;box-shadow:0 20px 60px rgba(0,0,0,.6)";
  box.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><b style="font:800 18px/1 \'Barlow Condensed\',sans-serif;letter-spacing:1px;text-transform:uppercase">SimBox ⇄ Pilotes</b><button type="button" id="sbPontX" style="background:none;border:0;color:#aaa;font-size:20px;cursor:pointer" aria-label="Fermer">×</button></div><div id="sbPontLog"></div>';
  document.body.appendChild(box);
  box.querySelector("#sbPontX").onclick = () => box.remove();
  const log = (t, c) => { const p = document.createElement("div"); p.textContent = t; if (c) p.style.color = c; box.querySelector("#sbPontLog").appendChild(p); };

  try {
    if (!/planning-simbox\.netlify\.app$/.test(location.hostname)) { log("Ouvre d'abord le Planning SimBox, puis clique sur le favori.", "#ff6b6b"); return; }
    log("Connexion à l'Espace pilotes…");
    // ---- outils Planning (même session que la page)
    const papi = async (path, opts = {}) => {
      const h = Object.assign({ "x-sb-name": encodeURIComponent(localStorage.getItem("simbox.name") || "Espace pilotes") }, opts.headers || {});
      const r = await fetch("/api/" + path, Object.assign({ credentials: "same-origin" }, opts, { headers: h }));
      if (r.status === 401) throw new Error("Tu n'es pas connecté au Planning : connecte-toi puis reclique sur le favori.");
      if (!r.ok) throw new Error("Planning : erreur " + r.status);
      return r.json();
    };
    // ---- données de l'Espace pilotes
    const tok = (await (await fetch(AUTH + "/token/anonymous")).json()).token;
    const rpc = async (n, a) => { const r = await fetch(REST + "/rpc/" + n, { method: "POST", headers: { authorization: "Bearer " + tok, "content-type": "application/json", "content-profile": "api", "accept-profile": "api" }, body: JSON.stringify(a || {}) }); if (!r.ok) throw new Error("Espace pilotes : " + n + " " + r.status); return r.json(); };
    const [data, feed, items0] = await Promise.all([rpc("public_data"), rpc("social_feed"), papi("items")]);
    const items = Array.isArray(items0) ? items0 : (items0.items || []);
    const has = tag => items.some(i => String(i.notes || "").includes(tag));

    // ---- moteur de visuels (le même que l'appli)
    if (!window.SimboxVisuel) {
      window.SIMBOX_BASE = APP;
      if (!document.getElementById("sbPontFonts")) { const l = document.createElement("link"); l.id = "sbPontFonts"; l.rel = "stylesheet"; l.href = "https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,600;0,700;0,800;1,800;1,900&family=Inter:wght@500;600;700&display=swap"; document.head.appendChild(l); }
      await new Promise((ok, ko) => { const s = document.createElement("script"); s.src = APP + "visuels.js?v=" + Date.now(); s.onload = ok; s.onerror = () => ko(new Error("Moteur de visuels introuvable")); document.head.appendChild(s); });
    }
    const png = async spec => { const c = document.createElement("canvas"); await SimboxVisuel.render(c, spec, data); return new Promise(r => c.toBlob(r, "image/png")); };
    const upload = async blob => (await papi("upload", { method: "POST", headers: { "content-type": "image/png" }, body: blob })).id;

    // ---- dates : prochain jour sans post à 18 h 30 (à partir d'aujourd'hui, ou demain après 18 h)
    const ymd = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    const taken = new Set(items.filter(i => i.kind === "post").map(i => i.date));
    const nextSlot = () => { const d = new Date(); if (d.getHours() >= 18) d.setDate(d.getDate() + 1); for (let k = 0; k < 14; k++) { const s = ymd(d); if (!taken.has(s)) { taken.add(s); return s; } d.setDate(d.getDate() + 1); } return ymd(new Date()); };
    const base = (extra) => Object.assign({ networks: ["Instagram", "Facebook"], owner: "", needs: "", done: false, price: null, paid: false, pillar: "Challenge chrono", format: "Visuel", createdBy: "Espace pilotes", createdAt: new Date().toISOString() }, extra);
    let added = 0, updated = 0;

    // 1) posts automatiques (nouveau leader, record One Lap, nouvelle référence)
    for (const ev of feed) {
      const tag = TAG + "ev" + ev.id + "]";
      if (has(tag)) continue;
      const spec = { type: ev.kind, event: ev };
      const id = await upload(await png(spec));
      const r = await papi("items", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(base({ kind: "post", date: nextSlot(), time: "18:30", title: SimboxVisuel.title(spec), text: SimboxVisuel.caption(spec, data), visualAsset: id, notes: "Préparé automatiquement par l'Espace pilotes. Vérifie puis publie. " + tag })) });
      try { await rpc("social_planned", { id: ev.id, planner_id: String(r.id || "") }); } catch (e) {}
      added++; log("✅ " + SimboxVisuel.title(spec));
    }

    // 2) résultats de la dernière soirée → story le lendemain midi
    try {
      const night = await rpc("night_laps", {});
      const tag = TAG + "soiree:" + night.jour + "]";
      if (night.laps && night.laps.length && !has(tag)) {
        const spec = { type: "soiree", night };
        const id = await upload(await png(spec));
        const d = new Date(night.jour + "T12:00:00"); d.setDate(d.getDate() + 1);
        await papi("items", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(base({ kind: "story", date: ymd(d), time: "12:30", title: "Résultats de la soirée", text: SimboxVisuel.caption(spec, data), visualAsset: id, format: "Story", notes: "Préparé automatiquement par l'Espace pilotes. " + tag })) });
        added++; log("✅ Story « Résultats de la soirée »");
      }
    } catch (e) { log("Soirée : " + e.message, "#ffb347"); }

    // 3) posts « Classement » en attente du top 3 ([PILOTE]) dans les 4 prochains jours → remplis avec le vrai classement
    const today = ymd(new Date()), lim = new Date(); lim.setDate(lim.getDate() + 4); const limS = ymd(lim);
    const waiting = items.filter(i => !i.done && i.date >= today && i.date <= limS && /\[PILOTE\]/.test(i.text || ""));
    if (waiting.length) {
      const spec = { type: "classement" }, id = await upload(await png(spec)), text = SimboxVisuel.caption(spec, data);
      for (const it of waiting) {
        await papi("items/" + encodeURIComponent(it.id), { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ text, visualAsset: id, needs: "", notes: (it.notes ? it.notes + " " : "") + TAG + "classement:" + today + "]" }) });
        updated++; log("🔄 « " + it.title + " » rempli avec le vrai classement");
      }
    }

    log(added || updated ? "Terminé : " + added + " ajouté(s), " + updated + " mis à jour. Le calendrier se met à jour dans quelques secondes." : "Rien de nouveau : le Planning est déjà à jour.", "#7CFF6B");
    try { window.dispatchEvent(new Event("focus")); } catch (e) {}
  } catch (e) { log("⚠️ " + e.message, "#ff6b6b"); }
})();
