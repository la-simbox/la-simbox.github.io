/* Classement et défis en direct depuis l'Espace pilotes (base Neon « lasimbox »).
   Si le chargement échoue, la page garde le contenu écrit à la main. */
(function () {
  "use strict";
  var AUTH = "https://ep-bold-paper-b90hj6av.neonauth.c-7.eu-central-1.aws.neon.tech/neondb/auth";
  var REST = "https://ep-bold-paper-b90hj6av.apirest.c-7.eu-central-1.aws.neon.tech/neondb/rest/v1";
  var APP = "pilotes/";
  var MOIS = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
  var $ = function (id) { return document.getElementById(id); };
  if (!$("ch-table")) return;

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function chrono(ms) { if (ms == null) return "–"; var m = Math.floor(ms / 60000), s = Math.floor(ms % 60000 / 1000), r = ms % 1000; return m + "'" + String(s).padStart(2, "0") + '"' + String(r).padStart(3, "0"); }
  function ecart(ms) { if (!ms) return "–"; var s = Math.floor(ms / 1000), r = ms % 1000; return "+" + (s >= 60 ? Math.floor(s / 60) + "'" + String(s % 60).padStart(2, "0") : s) + '"' + String(r).padStart(3, "0"); }
  function moisDe(iso) { var p = String(iso).split("-"); return { nom: MOIS[+p[1] - 1], annee: p[0] }; }
  function sansPays(c) { return String(c || "").replace(/\s*\(.*\)\s*/, ""); }
  function de(nom) { return /^[aeiouyéèêh]/i.test(nom) ? "d'" + nom : "de " + nom; }

  function podium(top, libres, titre) {
    var ordre = [[1, "marche-2"], [0, "marche-1"], [2, "marche-3"]];
    return ordre.map(function (o) {
      var r = top[o[0]];
      return '<div class="marche ' + o[1] + '">' + (o[0] === 0 ? '<span class="marche-couronne">' + (titre || (r ? "Leader" : "À prendre")) + "</span>" : "") +
        '<span class="marche-nom">' + (r ? esc(r.pseudo) : (libres ? "Libre" : "–")) + "</span>" +
        '<span class="marche-temps">' + (r ? chrono(r.ms) : "–") + "</span>" +
        '<span class="marche-bloc">' + (o[0] + 1) + "</span></div>";
    }).join("");
  }

  function afficher(d) {
    var c = d.current, arch = d.archive || [];
    if (c) {
      var m = moisDe(c.mois), board = (c.groups && c.groups[0] && c.groups[0].board) || [];
      $("ch-eyebrow").textContent = "Challenge chrono · " + m.nom.charAt(0).toUpperCase() + m.nom.slice(1) + " " + m.annee + " · en direct";
      $("ch-sub").textContent = c.circuit + " en " + c.voiture + ". " + (c.tarif || "8 € les 5 min") + ", " + (c.lot || "60 € de lots") + " pour le plus rapide du mois.";
      var cap = "Classement " + de(m.nom) + " · " + sansPays(c.circuit) + " · " + c.voiture;
      var rows;
      if (board.length) {
        rows = board.slice(0, 10).map(function (r) {
          return '<tr class="pos-' + r.rank + '"><td>' + r.rank + '</td><th scope="row">' + esc(r.pseudo) + "</th><td>" + chrono(r.ms) + "</td><td>" + ecart(r.gap) + "</td></tr>";
        }).join("");
        $("ch-podium").innerHTML = podium(board.slice(0, 3), true);
      } else {
        rows = '<tr><td>1</td><th scope="row">Place libre</th><td>–</td><td>–</td></tr>';
        var prev = arch[0];
        $("ch-podium").innerHTML = podium(prev ? prev.podium : [], false, prev ? "Champion " + de(moisDe(prev.mois).nom) : "");
        if (prev) { var pm = moisDe(prev.mois); cap += " · podium ci-dessus : champions " + de(pm.nom); }
      }
      $("ch-table").innerHTML = "<caption>" + esc(cap) + '</caption><thead><tr><th scope="col">Pos.</th><th scope="col">Pilote</th><th scope="col">Temps</th><th scope="col">Écart</th></tr></thead><tbody>' + rows + "</tbody>";
      $("ch-note").innerHTML = (board.length ? "Votre nom ici ? " : "Personne n'a encore roulé ce mois-ci : la 1re place est à vous. ") +
        'Classement mis à jour en direct sur <a href="' + APP + '">l\'Espace pilotes</a>.';
    }
    var sp = (d.specials || [])[0];
    if (sp && $("defi-refs")) {
      $("defi-titre").textContent = sp.titre;
      if (sp.tarif) $("defi-prix").innerHTML = "<strong>" + esc(sp.tarif.split(" ")[0] + " " + (sp.tarif.split(" ")[1] || "")) + "</strong> " + esc(sp.tarif.split(" ").slice(2).join(" "));
      var groups = (sp.groups || []).filter(function (g) { return g.voiture; }).sort(function (a, b) { return (a.refMs || 9e9) - (b.refMs || 9e9); });
      var avecClients = groups.some(function (g) { return g.board && g.board.length; });
      $("defi-refs").innerHTML = "<caption>Chronos de référence de la maison, " + esc(sp.circuit || "") + '</caption><thead><tr><th scope="col">Voiture</th><th scope="col">Chrono à battre</th>' + (avecClients ? '<th scope="col">Meilleur client</th>' : "") + "</tr></thead><tbody>" +
        groups.map(function (g) {
          var b = g.board && g.board[0];
          return '<tr><th scope="row">' + esc(g.voiture) + "</th><td>" + chrono(g.refMs) + "</td>" + (avecClients ? "<td>" + (b ? esc(b.pseudo) + " · " + chrono(b.ms) : "–") + "</td>" : "") + "</tr>";
        }).join("") + "</tbody>";
    }
  }

  function charger() {
    fetch(AUTH + "/token/anonymous").then(function (r) { return r.json(); }).then(function (t) {
      return fetch(REST + "/rpc/public_data", { method: "POST", headers: { authorization: "Bearer " + t.token, "content-type": "application/json", "content-profile": "api", "accept-profile": "api" }, body: "{}" });
    }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(afficher).catch(function () {});
  }
  charger();
  setInterval(function () { if (!document.hidden) charger(); }, 60000);
})();
