/* SimBox · visuels réseaux sociaux (1080 × 1350), style « Race Result » en D.A. SimBox.
   Utilisé par l'onglet Réseaux de l'Espace pilotes et par visuel.html (tâche de nuit). */
(function () {
  "use strict";
  const W = 1080, H = 1350;
  const F = '"Barlow Condensed","Arial Narrow",sans-serif', B = '"Inter",Arial,sans-serif';
  const RED = "#e10600", GOLD = "#f09600";
  const PHOTOS = { "2026-11": { src: "img/challenge-2026-11.jpg", credit: "Photo : Iain A Wanless, CC BY 2.0, modifiée" } };
  const NIVEAUX = [[0,"Rookie du simu"],[20,"Apprenti pilote"],[50,"Habitué du vendredi soir"],[90,"Chasseur de chrono"],[150,"Roi du freinage tardif"],[240,"Mangeur de vibreurs"],[360,"Sniper du tour lancé"],[520,"Seigneur de la nuit"],[750,"Légende de La Gorgue"],[1000,"Immortel SimBox"]];
  const NEON = ["#7CFF6B","#00F0FF","#3D8BFF","#B26BFF","#FF4FD8","#FF8A1F","#FFE81F","#FF3B3B","#FFD54A","#FFFFFF"];
  const MOIS = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
  const imgs = {};
  const BASE = () => window.SIMBOX_BASE || "";
  const load = src => imgs[src] || (imgs[src] = new Promise(r => { if (!src) return r(null); const i = new Image(); i.crossOrigin = "anonymous"; i.onload = () => r(i); i.onerror = () => r(null); i.src = /^https?:/.test(src) ? src : BASE() + src; }));
  const fmt = ms => ms == null ? "–" : Math.floor(ms / 60000) + "'" + String(Math.floor(ms / 1000) % 60).padStart(2, "0") + '"' + String(ms % 1000).padStart(3, "0");
  const gapTxt = ms => { if (!ms) return ""; const s = Math.floor(ms / 1000), r = ms % 1000; return "+" + (s >= 60 ? Math.floor(s / 60) + "'" + String(s % 60).padStart(2, "0") : s) + '"' + String(r).padStart(3, "0"); };
  const moisNom = iso => MOIS[+String(iso).split("-")[1] - 1];
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  const sansPays = c => String(c || "").replace(/\s*\(.*\)\s*/, "");
  const xpOf = p => (p.tours||0)*10 + (p.participations||0)*20 + (p.podiums||0)*60 + (p.victoires||0)*120;
  function niveau(p){ if (!p) return { i: 0, t: NIVEAUX[0][1] }; const xp = xpOf(p); let i = 0; NIVEAUX.forEach((n, k) => { if (xp >= n[0]) i = k; }); return { i, t: NIVEAUX[i][1] }; }
  function initials(ps){ const w = String(ps).replace(/[^\p{L}\p{N} ]/gu, " ").trim().split(/\s+/); return ((w[0] || "?")[0] + (w[1] ? w[1][0] : (w[0] || "").slice(1, 2))).toUpperCase(); }
  function rr(g, x, y, w, h, r){ g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function fit(g, t, max, size, style){ let s = size; do { g.font = style.replace("#", s); if (g.measureText(t).width <= max) break; s -= 2; } while (s > 14); return s; }

  async function fonts(){ try { await Promise.all(['italic 900 80px "Barlow Condensed"','800 40px "Barlow Condensed"','700 30px "Barlow Condensed"','600 20px "Inter"','500 20px "Inter"'].map(f => document.fonts.load(f))); } catch (e) {} }

  async function background(g, photo){
    g.fillStyle = "#0a0a0d"; g.fillRect(0, 0, W, H);
    const im = photo ? await load(photo.src) : null;
    if (im) {
      g.save(); g.filter = "blur(10px) saturate(1.1)"; const k = Math.max(W / im.width, H / im.height) * 1.08, w = im.width * k, h = im.height * k;
      g.drawImage(im, (W - w) / 2, (H - h) * 0.45, w, h); g.restore();
      g.fillStyle = "rgba(8,8,11,.68)"; g.fillRect(0, 0, W, H);
    } else {
      const lg = await load("img/logo-simbox.jpg");
      if (lg) { g.save(); g.globalCompositeOperation = "lighten"; g.globalAlpha = .1; g.translate(W * .62, H * .42); g.rotate(-.12); g.drawImage(lg, -520, -520, 1040, 1040); g.restore(); }
    }
    let gr = g.createRadialGradient(W * .85, 0, 40, W * .85, 0, 900); gr.addColorStop(0, "rgba(225,6,0,.45)"); gr.addColorStop(1, "rgba(225,6,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    gr = g.createLinearGradient(0, 0, 260, 0); gr.addColorStop(0, "rgba(0,0,0,.55)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, 260, H);
    g.save(); g.globalAlpha = .035; g.strokeStyle = "#fff"; g.lineWidth = 14; for (let x = -H; x < W; x += 52) { g.beginPath(); g.moveTo(x, H); g.lineTo(x + H, 0); g.stroke(); } g.restore();
  }

  // Titre vertical façon « RACE RESULT » : mot manuscrit rouge + mot en capitales
  function verticalTitle(g, script, big){
    // de bas en haut : mot manuscrit rouge puis grand mot en capitales (comme « RACE RESULT »)
    const L = H - 150, BIG = big.toUpperCase();
    let s = 168, sw, bw;
    for (;;) { g.font = "italic 900 " + Math.round(s * .58) + "px " + F; sw = g.measureText(script).width; g.font = "italic 900 " + s + "px " + F; bw = g.measureText(BIG).width; if (sw * .9 + bw <= L || s < 70) break; s -= 4; }
    const x = 26 + s * .74;
    g.save(); g.translate(x, H - 96); g.rotate(-Math.PI / 2); g.textBaseline = "alphabetic";
    g.font = "italic 900 " + s + "px " + F; g.fillStyle = "#fff"; g.fillText(BIG, sw * .9, 0);
    g.font = "italic 900 " + Math.round(s * .58) + "px " + F; g.fillStyle = RED; g.shadowColor = "rgba(0,0,0,.6)"; g.shadowBlur = 12;
    g.save(); g.translate(0, s * .16); g.rotate(-.06); g.fillText(script, 0, 0); g.restore();
    g.restore();
  }

  async function header(g, left, right){
    const logo = await load("img/logo-volant.jpg");
    if (logo) { g.save(); g.globalCompositeOperation = "lighten"; g.drawImage(logo, 196, 34, 104, 104 * logo.height / logo.width); g.restore(); }
    g.textBaseline = "alphabetic"; g.font = "italic 900 44px " + F; g.fillStyle = "#fff"; g.fillText("SIM", 312, 84); const w = g.measureText("SIM ").width; g.fillStyle = RED; g.fillText("BOX", 312 + w, 84);
    g.save(); g.letterSpacing = "3px"; fit(g, left.toUpperCase(), 470, 22, "700 #px " + F); g.fillStyle = "#c9c9d1"; g.fillText(left.toUpperCase(), 314, 116); g.restore();
    g.textAlign = "right"; g.font = "700 24px " + F; g.fillStyle = GOLD; g.save(); g.letterSpacing = "3px";
    String(right || "").toUpperCase().split("\n").forEach((l, i) => g.fillText(l, W - 52, 78 + i * 30)); g.restore(); g.textAlign = "left";
  }

  function footer(g, credit){
    g.fillStyle = RED; g.fillRect(0, H - 14, W, 14);
    g.font = "600 22px " + B; g.fillStyle = "#d9d9df"; g.fillText("📲 la-simbox.github.io/pilotes", 196, H - 40);
    g.textAlign = "right"; g.fillText("@lasimbox · La Gorgue", W - 52, H - 40); g.textAlign = "left";
    if (credit) { g.font = "500 12px " + B; g.fillStyle = "rgba(255,255,255,.25)"; g.save(); g.translate(18, H - 30); g.rotate(-Math.PI / 2); g.fillText(credit, 0, 0); g.restore(); }
  }

  // Podium : 3 tuiles (P2, P1, P3) avec étiquette verticale
  function podium(g, top, cards, y){
    const order = [[1, 200, y + 40, 262, 300], [0, 480, y, 290, 340], [2, 788, y + 60, 240, 280]];
    order.forEach(([k, x, yy, w, h]) => {
      const r = top[k]; const nv = niveau(cards[r ? r.pilotId : ""]); const col = r ? NEON[nv.i] : "#3a3a42";
      rr(g, x, yy, w, h, 22); const gr = g.createLinearGradient(0, yy, 0, yy + h); gr.addColorStop(0, r ? hexA(col, .55) : "rgba(255,255,255,.06)"); gr.addColorStop(.55, "rgba(20,20,26,.92)"); gr.addColorStop(1, "rgba(14,14,18,.98)");
      g.fillStyle = gr; g.fill(); g.lineWidth = k === 0 ? 4 : 2.5; g.strokeStyle = k === 0 ? GOLD : hexA(col, .8); g.stroke();
      g.textAlign = "center";
      g.font = "italic 900 " + (k === 0 ? 150 : 120) + "px " + F; g.fillStyle = r ? "#fff" : "rgba(255,255,255,.25)"; g.fillText(r ? initials(r.pseudo) : "?", x + w / 2, yy + h * .55);
      const nm = r ? r.pseudo.toUpperCase() : "PLACE LIBRE"; fit(g, nm, w - 30, k === 0 ? 40 : 34, "800 #px " + F); g.fillStyle = "#fff"; g.fillText(nm, x + w / 2, yy + h - 58);
      g.font = "600 " + (k === 0 ? 26 : 22) + "px " + B; g.fillStyle = k === 0 ? GOLD : "#c9c9d1"; g.fillText(r ? fmt(r.ms) : "–", x + w / 2, yy + h - 24);
      g.textAlign = "left";
      // étiquette P verticale dans la tuile, comme sur l'inspiration
      g.save(); g.translate(x + (k === 0 ? 58 : 48), yy + 16); g.rotate(-Math.PI / 2); g.textAlign = "right"; g.font = "italic 900 " + (k === 0 ? 58 : 46) + "px " + F; g.fillStyle = k === 0 ? GOLD : "rgba(255,255,255,.9)"; g.fillText("P" + (k + 1), 0, 0); g.restore();
    });
  }
  function hexA(hex, a){ const n = parseInt(hex.slice(1), 16); return "rgba(" + (n >> 16) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")"; }

  // Lignes de classement
  function rows(g, list, y0, opts){
    opts = opts || {}; const x0 = 196, x1 = W - 52, max = opts.max || 10, n = Math.min(list.length, max);
    const h = Math.max(opts.h || 76, Math.min(104, n ? (H - 120 - y0) / Math.max(n, 6) : 76));
    list.slice(0, max).forEach((r, i) => {
      const y = y0 + i * h, pos = r.pos != null ? r.pos : i + 1;
      if (r.hl) { rr(g, x0 - 10, y + 4, x1 - x0 + 20, h - 8, 12); g.fillStyle = "rgba(225,6,0,.28)"; g.fill(); g.lineWidth = 2; g.strokeStyle = "rgba(255,70,70,.8)"; g.stroke(); }
      // case position
      const pc = pos === 1 ? GOLD : pos === 2 ? "#c9ccd6" : pos === 3 ? "#cd7f32" : null;
      rr(g, x0, y + 14, 48, h - 28, 8); g.fillStyle = pc || "rgba(255,255,255,.08)"; g.fill();
      g.textAlign = "center"; g.font = "800 30px " + F; g.fillStyle = pc ? "#111" : "#fff"; g.fillText(r.posTxt || String(pos), x0 + 24, y + h / 2 + 10);
      // pastille niveau (remplace le logo d'écurie)
      const col = r.color || "#555"; rr(g, x0 + 62, y + 14, 48, h - 28, 8); g.fillStyle = hexA(col, .2); g.fill(); g.lineWidth = 2; g.strokeStyle = col; g.stroke();
      g.font = "800 " + (r.badge && r.badge.length > 2 ? 18 : 24) + "px " + F; g.fillStyle = col; g.fillText(r.badge || "", x0 + 86, y + h / 2 + 8);
      g.textAlign = "left";
      // nom
      g.font = "500 17px " + B; g.fillStyle = "#a9a9b3"; g.fillText(r.sub || "", x0 + 128, y + h / 2 - 8);
      fit(g, String(r.name).toUpperCase(), opts.nameW || 420, 34, "800 #px " + F); g.fillStyle = "#fff"; g.fillText(String(r.name).toUpperCase(), x0 + 128, y + h / 2 + 22);
      // temps + écart
      g.textAlign = "right"; g.font = "800 36px " + F; g.fillStyle = r.hl ? "#fff" : (pos === 1 ? GOLD : "#fff"); g.fillText(r.time || "", x1 - (opts.gapW || 120), y + h / 2 + 12);
      g.font = "600 20px " + B; g.fillStyle = "#a9a9b3"; g.fillText(r.gap || "", x1, y + h / 2 + 10); g.textAlign = "left";
      if (i < Math.min(list.length, max) - 1) { g.fillStyle = "rgba(255,255,255,.1)"; g.fillRect(x0, y + h - 1, x1 - x0, 1); }
    });
  }

  function banner(g, y, big, small, color){
    rr(g, 196, y, W - 248, 120, 18); g.fillStyle = "rgba(14,14,18,.85)"; g.fill(); g.lineWidth = 3; g.strokeStyle = color || RED; g.stroke();
    fit(g, big, W - 300, 54, "italic 900 #px " + F); g.fillStyle = "#fff"; g.fillText(big, 222, y + 60);
    g.font = "500 22px " + B; g.fillStyle = "#c9c9d1"; g.fillText(small || "", 222, y + 96);
  }

  function boardRows(data){
    const cur = data.current, cards = cardMap(data), b = cur ? cur.groups[0].board : [];
    return b.map(r => { const nv = niveau(cards[r.pilotId]); return { pos: r.rank, name: r.pseudo, sub: "Niv. " + (nv.i + 1) + " · " + nv.t, badge: "N" + (nv.i + 1), color: NEON[nv.i], time: fmt(r.ms), gap: r.rank === 1 ? "" : gapTxt(r.gap), pilotId: r.pilotId }; });
  }
  function cardMap(data){ const m = {}; (data.cards || []).forEach(c => m[c.id] = c); return m; }
  function special(data, id){ return (data.specials || []).find(s => !id || s.id === id) || (data.specials || [])[0]; }
  function onelapRows(data, sp, hlCar){
    return (sp.groups || []).filter(g => g.voiture).sort((a, b) => (a.refMs || 9e9) - (b.refMs || 9e9)).map((gr, i) => {
      const best = gr.board && gr.board[0]; const beat = best && gr.refMs && best.ms < gr.refMs;
      return { pos: i + 1, posTxt: String(i + 1), name: gr.voiture, sub: best ? "Meilleur client : " + best.pseudo + " · " + fmt(best.ms) + (beat ? " 🔥" : "") : "Personne ne l'a encore battue", badge: beat ? "✓" : "REF", color: beat ? "#2ee06f" : RED, time: fmt(gr.refMs), gap: "", hl: hlCar && gr.voiture === hlCar };
    });
  }

  // ---------- Rendu des 5 types ----------
  async function render(canvas, spec, data){
    await fonts();
    canvas.width = W; canvas.height = H; const g = canvas.getContext("2d");
    const cur = data.current, cards = cardMap(data);
    const photo = (spec.type === "classement" || spec.type === "leader") && cur ? PHOTOS[String(cur.mois).slice(0, 7)] : null;
    await background(g, photo);
    if (spec.type === "classement" || spec.type === "leader") {
      const list = boardRows(data);
      const left = cur ? cap(moisNom(cur.mois)) + " " + String(cur.mois).slice(0, 4) + " · " + sansPays(cur.circuit) : "Challenge chrono";
      await header(g, left, cur ? cur.voiture.replace(/ (GT3|GT4)$/i, "\n$1") : "");
      if (spec.type === "classement") {
        verticalTitle(g, "Challenge", "Classement");
        podium(g, list.slice(0, 3).map(r => ({ pseudo: r.name, ms: parseMs(r.time), pilotId: r.pilotId })), cards, 170);
        rows(g, list, 560, { max: 9, h: 78 });
        if (!list.length) banner(g, 600, "LA 1RE PLACE EST LIBRE", "8 € les 5 minutes · 60 € de lots pour le plus rapide du mois");
      } else {
        const e = spec.event.payload;
        verticalTitle(g, "Nouveau", "Leader");
        podium(g, list.slice(0, 3).map(r => ({ pseudo: r.name, ms: parseMs(r.time), pilotId: r.pilotId })), cards, 170);
        const diff = e.prev_ms ? (e.prev_ms - e.ms) : null;
        banner(g, 548, e.pseudo.toUpperCase() + " PREND LA TÊTE EN " + fmt(e.ms), e.prev_pseudo ? (diff >= 0 ? "Devant " : "") + e.prev_pseudo + (diff > 0 ? " de " + gapTxt(diff).slice(1) : "") + " · qui va faire mieux ?" : "Premier chrono du mois : la référence est posée", GOLD);
        rows(g, list.map(r => Object.assign({}, r, { hl: r.name === e.pseudo })), 690, { max: 7, h: 78 });
      }
      footer(g, photo && photo.credit);
    } else if (spec.type === "onelap_record" || spec.type === "new_ref") {
      const e = spec.event.payload, sp = special(data, spec.event.challenge_id) || { groups: [], titre: e.titre };
      await header(g, (e.titre || sp.titre || "One Lap Nürburgring"), "Défi spécial\n" + (sp.tarif || "8 € la tentative"));
      if (spec.type === "onelap_record") {
        verticalTitle(g, e.beat_ref ? "Référence" : "One Lap", e.beat_ref ? "Battue" : "Record");
        banner(g, 180, e.pseudo.toUpperCase() + " · " + fmt(e.ms), spec.event.voiture + (e.beat_ref ? " · sous notre chrono maison (" + fmt(e.ref_ms) + ") 🎁" : e.ref_ms ? " · référence à battre : " + fmt(e.ref_ms) : ""), e.beat_ref ? "#2ee06f" : GOLD);
      } else {
        verticalTitle(g, "One Lap", e.nouvelle ? "Nouveauté" : "Référence");
        banner(g, 180, (e.nouvelle ? "NOUVELLE VOITURE · " : "NOUVEAU CHRONO À BATTRE · ") + fmt(e.ms), spec.event.voiture + " · " + (e.lot || "5 sessions de 25 min offertes si tu fais mieux"), RED);
      }
      g.font = "700 22px " + F; g.fillStyle = GOLD; g.save(); g.letterSpacing = "3px"; g.fillText("CHRONOS À BATTRE", 196, 350); g.restore();
      rows(g, onelapRows(data, sp, spec.event.voiture), 370, { max: 11, h: 78, nameW: 470, gapW: 0 });
      footer(g, null);
    } else if (spec.type === "soiree") {
      const n = spec.night || { laps: [], pilotes: 0 }, j = new Date(n.jour + "T12:00:00");
      await header(g, "Soirée du " + j.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }), n.pilotes + " pilote" + (n.pilotes > 1 ? "s" : "") + "\nen piste");
      verticalTitle(g, "Résultats", "Soirée");
      const list = (n.laps || []).map((l, i) => { const c = (data.cards || []).find(x => x.pseudo === l.pseudo); const nv = niveau(c); return { pos: i + 1, name: l.pseudo, sub: (l.kind === "special" ? l.titre + " · " : sansPays(l.titre) + " · ") + l.voiture, badge: "N" + (nv.i + 1), color: NEON[nv.i], time: l.chrono, gap: "" }; });
      rows(g, list, 190, { max: 13, h: 80, gapW: 0, nameW: 460 });
      if (!list.length) banner(g, 220, "PAS DE CHRONO CE SOIR", "Rendez-vous vendredi et samedi dès 20 h");
      footer(g, null);
    }
    return canvas;
  }
  function parseMs(t){ const m = /^(\d+)'(\d+)"(\d+)$/.exec(t || ""); return m ? (+m[1]) * 60000 + (+m[2]) * 1000 + (+m[3]) : null; }

  // ---------- Textes des posts ----------
  const TAGS = "\n\n📍 LaSimBox · 3854 rue du Grand Chemin, La Gorgue · 07 77 46 49 59\n📲 Classement en direct : lien en bio\n\n#simracing #lasimbox #lagorgue #nord59 #challengechrono #simulateur";
  function joursRestants(){ const d = new Date(), fin = new Date(d.getFullYear(), d.getMonth() + 1, 0); return Math.max(0, fin.getDate() - d.getDate()); }
  function caption(spec, data){
    const cur = data.current;
    if (spec.type === "classement") {
      const b = cur ? cur.groups[0].board : []; const med = ["🥇","🥈","🥉"];
      const top = b.slice(0, 3).map((r, i) => med[i] + " " + r.pseudo + " · " + fmt(r.ms) + (i ? " (" + gapTxt(r.gap) + ")" : "")).join("\n");
      const n = joursRestants();
      return "📊 CLASSEMENT DU CHALLENGE · " + (cur ? moisNom(cur.mois).toUpperCase() : "") + "\n\n" + (top || "Personne n'a encore signé de chrono : la 1re place est libre !") + "\n\n" + (cur ? sansPays(cur.circuit) + " en " + cur.voiture + ". " : "") + (n ? "Encore " + n + " jour" + (n > 1 ? "s" : "") + " pour faire tomber ce temps" : "Dernier jour pour faire tomber ce temps") + " : 8 € les 5 minutes, 60 € de lots au plus rapide." + TAGS;
    }
    const e = spec.event && spec.event.payload;
    if (spec.type === "leader") return "👑 NOUVEAU LEADER !\n\n" + e.pseudo + " prend la tête du challenge en " + fmt(e.ms) + (e.prev_pseudo ? " et passe devant " + e.prev_pseudo + (e.prev_ms ? " (" + fmt(e.prev_ms) + ")" : "") : "") + ".\n\n" + sansPays(e.circuit) + " en " + e.voiture + ". Qui va faire mieux ? 8 € les 5 minutes, 60 € de lots pour le plus rapide du mois." + TAGS;
    if (spec.type === "onelap_record") return (e.beat_ref ? "🔥 RÉFÉRENCE BATTUE !\n\n" + e.pseudo + " signe " + fmt(e.ms) + " en " + spec.event.voiture + " sur le One Lap Nürburgring et passe sous notre chrono maison (" + fmt(e.ref_ms) + "). Bravo, 5 sessions de 25 minutes offertes 🎁" : "⏱️ NOUVEAU MEILLEUR TEMPS CLIENT\n\n" + e.pseudo + " signe " + fmt(e.ms) + " en " + spec.event.voiture + " sur le One Lap Nürburgring." + (e.ref_ms ? " Il reste " + gapTxt(e.ms - e.ref_ms).slice(1) + " pour battre notre référence (" + fmt(e.ref_ms) + ")." : "")) + "\n\nUn seul tour, aucune seconde chance. 8 € la tentative." + TAGS.replace("#challengechrono", "#nordschleife #onelap");
    if (spec.type === "new_ref") return (e.nouvelle ? "🆕 NOUVELLE VOITURE SUR LE ONE LAP\n\n" + spec.event.voiture + " : chrono à battre " + fmt(e.ms) + "." : "⚡ RÉFÉRENCE AMÉLIORÉE\n\nEn " + spec.event.voiture + ", le chrono à battre passe à " + fmt(e.ms) + (e.prev_ms ? " (avant : " + fmt(e.prev_ms) + ")" : "") + ".") + "\n\nFais mieux et gagne 5 sessions de 25 minutes à utiliser dans le mois. Un seul tour, 8 € la tentative." + TAGS.replace("#challengechrono", "#nordschleife #onelap");
    if (spec.type === "soiree") { const n = spec.night || { laps: [] }; return "🏁 RÉSULTATS DE LA SOIRÉE\n\n" + n.pilotes + " pilote" + (n.pilotes > 1 ? "s" : "") + " en piste. Les meilleurs tours :\n" + (n.laps || []).slice(0, 5).map(l => "• " + l.pseudo + " · " + l.chrono + " (" + (l.kind === "special" ? "One Lap, " + l.voiture : sansPays(l.titre)) + ")").join("\n") + "\n\nMerci à tous, rendez-vous ce week-end !" + TAGS; }
    return "";
  }
  const title = spec => ({ classement: "Classement du challenge", leader: "Nouveau leader : " + (spec.event && spec.event.payload.pseudo), onelap_record: (spec.event && spec.event.payload.beat_ref ? "Référence battue : " : "Record One Lap : ") + (spec.event && spec.event.voiture), new_ref: "One Lap · " + (spec.event && spec.event.voiture), soiree: "Résultats de la soirée" })[spec.type] || "Post";

  window.SimboxVisuel = { render, caption, title, W, H };
})();
