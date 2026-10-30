/* ==========================================================================
   Décorations de saison
   - Halloween : du 20 octobre au 2 novembre
   - Noël      : du 15 novembre au 31 décembre (met en avant les cartes cadeaux)
   Le reste de l'année, rien ne s'affiche.
   Pour tester une saison : ajouter ?saison=halloween ou ?saison=noel à l'adresse
   (?saison=aucune pour tout couper).
   ========================================================================== */
(function () {
  "use strict";

  function saisonDuJour(date) {
    var m = date.getMonth() + 1; // 1 à 12
    var j = date.getDate();
    if ((m === 10 && j >= 20) || (m === 11 && j <= 2)) return "halloween";
    if ((m === 11 && j >= 15) || m === 12) return "noel";
    return null;
  }

  var forcee = null;
  try { forcee = new URLSearchParams(window.location.search).get("saison"); } catch (e) {}
  var saison = forcee === "aucune" ? null : (forcee === "halloween" || forcee === "noel" ? forcee : saisonDuJour(new Date()));
  if (!saison) return;

  document.documentElement.classList.add("saison-" + saison);

  /* ----- Dessins ----------------------------------------------------------- */
  function citrouille(classe) {
    return '<svg class="' + classe + '" viewBox="0 0 120 110" aria-hidden="true">' +
      '<path d="M58 22c0-9 4-15 11-18l4 5c-6 3-8 7-8 13z" fill="#3f6b1f"/>' +
      '<ellipse cx="38" cy="66" rx="30" ry="38" fill="var(--citrouille-sombre)"/>' +
      '<ellipse cx="82" cy="66" rx="30" ry="38" fill="var(--citrouille-sombre)"/>' +
      '<ellipse cx="60" cy="66" rx="34" ry="41" fill="var(--citrouille)"/>' +
      '<path d="M60 26v80M43 30c-6 22-6 50 0 72M77 30c6 22 6 50 0 72" stroke="var(--citrouille-sombre)" stroke-width="2.5" fill="none" opacity=".55"/>' +
      '<g class="yeux" fill="#ffd34d">' +
        '<path d="M36 56l14-2-6 13z"/><path d="M84 56l-14-2 6 13z"/>' +
        '<path d="M38 80c8 9 36 9 44 0l-6 2-4-5-5 6-4-6-5 6-4-5-4 5-6-3z"/>' +
      '</g></svg>';
  }

  var chauveSouris = '<svg viewBox="0 0 64 28" aria-hidden="true"><path fill="currentColor" d="M32 9c1.5-3 3-4 3-4l1 4c3 0 5 1 6 3 4-6 11-9 22-8-4 2-6 5-6 9-3-2-6-2-8 0-2-2-5-2-7 1-2 1-4 3-6 6-2 2-3 4-5 6-2-2-3-4-5-6-2-3-4-5-6-6-2-3-5-3-7-1-2-2-5-2-8 0 0-4-2-7-6-9 11-1 18 2 22 8 1-2 3-3 6-3l1-4s1.5 1 3 4z"/></svg>';

  var toile = '<svg class="saison-toile" viewBox="0 0 200 200" aria-hidden="true" fill="none" stroke="#fff" stroke-width="1.1">' +
    '<path d="M200 0L0 0M200 0L40 120M200 0L110 190M200 0L200 200M200 0L80 40"/>' +
    '<path d="M168 0C166 14 172 22 182 25 187 30 194 31 200 32"/>' +
    '<path d="M136 0C133 26 142 40 160 47 172 58 186 60 200 64"/>' +
    '<path d="M100 0C97 36 110 60 136 70 156 88 178 92 200 98"/>' +
    '<path d="M62 0C58 46 76 80 110 94 138 118 168 124 200 132"/>' +
    '<circle cx="152" cy="62" r="3.2" fill="#fff" stroke="none"/><path d="M152 0V59"/></svg>';

  /* ----- Bandeau ----------------------------------------------------------- */
  var bandeaux = {
    halloween: citrouille("") +
      '<span>Joyeux Halloween ! Venez vous faire peur au volant ce week-end. <a href="#horaires">Voir les horaires</a></span>',
    noel: '<span>Noël approche : offrez des sensations avec nos cartes cadeaux. <a href="#bons-cadeaux">Voir les cartes</a></span>'
  };
  var header = document.querySelector(".site-header");
  if (header) {
    var bandeau = document.createElement("div");
    bandeau.className = "saison-bandeau";
    bandeau.innerHTML = '<div class="wrap">' + bandeaux[saison] + "</div>";
    header.insertAdjacentElement("afterend", bandeau);
  }

  /* ----- Décor du haut de page --------------------------------------------- */
  var hero = document.querySelector(".hero");
  if (!hero) return;
  var decor = document.createElement("div");
  decor.className = "saison-decor";
  decor.setAttribute("aria-hidden", "true");

  if (saison === "halloween") {
    decor.innerHTML = toile +
      '<div class="saison-chauve-souris b1">' + chauveSouris + "</div>" +
      '<div class="saison-chauve-souris b2">' + chauveSouris + "</div>" +
      '<div class="saison-chauve-souris b3">' + chauveSouris + "</div>" +
      '<div class="saison-citrouilles">' + citrouille("petite") + citrouille("grande") + "</div>";
    hero.appendChild(decor);
  }

  if (saison === "noel") {
    var canvas = document.createElement("canvas");
    canvas.className = "saison-neige";
    decor.appendChild(canvas);
    hero.appendChild(decor);
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var flocons = [];
    var reduit = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function taille() {
      var r = hero.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = r.width * dpr; canvas.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(r.width / 18);
      flocons = [];
      for (var i = 0; i < n; i++) {
        flocons.push({ x: Math.random() * r.width, y: Math.random() * r.height, r: 1 + Math.random() * 2.4, v: .3 + Math.random() * .8, d: Math.random() * 6.28 });
      }
      dessiner(r);
    }
    function dessiner(r) {
      ctx.clearRect(0, 0, r.width, r.height);
      ctx.fillStyle = "rgba(244,247,255,.8)";
      for (var i = 0; i < flocons.length; i++) {
        var f = flocons[i];
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.283); ctx.fill();
      }
    }
    function animer() {
      var r = hero.getBoundingClientRect();
      for (var i = 0; i < flocons.length; i++) {
        var f = flocons[i];
        f.y += f.v; f.d += .01; f.x += Math.sin(f.d) * .3;
        if (f.y > r.height + 4) { f.y = -4; f.x = Math.random() * r.width; }
      }
      dessiner(r);
      window.requestAnimationFrame(animer);
    }
    taille();
    window.addEventListener("resize", taille);
    if (!reduit) window.requestAnimationFrame(animer);
  }
})();
