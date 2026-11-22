// Panel de información y botones de acción (DOM). No contiene reglas.
window.TT = window.TT || {};
(function () {
  var M = TT.Map;
  var SIDE = { hero: 'Héroe', enemy: 'Enemigo' };
  var TILE = { ground: 'Terreno', deep: 'Agua profunda (no se pisa)', ford: 'Vado (coste 2)', bridge: 'Puente', tree: 'Árbol (bloquea)', rock: 'Roca (bloquea)' };
  var ORIENT = { back: 'Espalda ×1,3', flank: 'Flanco ×1,15', front: 'Frente' };

  function $(id) { return document.getElementById(id); }
  function pct(x) { return (x >= 0 ? '+' : '−') + Math.abs(Math.round(x * 100)) + ' %'; }

  var H = TT.HUD = {};

  H.text = function (html) { $('info').innerHTML = html; };

  // buttons: [{ label, fn, off }]
  H.buttons = function (list) {
    var box = $('actions'); box.innerHTML = '';
    list.forEach(function (b) {
      var el = document.createElement('button');
      el.textContent = b.label; el.disabled = !!b.off;
      el.addEventListener('click', b.fn);
      box.appendChild(el);
    });
  };

  H.turnLine = function () {
    var T = TT.Turns, u = T.cur;
    return 'Ronda ' + T.round + ' · Turno de <b>' + u.name + '</b> (' + SIDE[u.side] + ')' +
      (u.side === 'enemy' ? ' · <i>manual hasta el Hito 5</i>' : '');
  };

  function ic(t) { return '<img class="ic" src="' + TT.Icons.url(t) + '" alt="">' + TT.TypeNames[t]; }
  function n2(x) { return String(+x.toFixed(2)).replace('.', ','); }

  H.card = function (u) {
    var s = u.st, c = M.get(u.x, u.y), ex = '<br>Potenciar ' + u.boost + '/' + TT.Bal.boostMax;
    if (u.shieldMax) {
      ex += ' · ' + (u.broken ? '<b style="color:#FF3B6B">ROTO</b> (pierde su próximo turno, recibe ×1,5)' : 'Escudos ' + u.shield + '/' + u.shieldMax) +
        '<br>Debilidades: ' + u.weak.map(function (t) { return u.known[t] ? ic(t) : '?'; }).join(' · ');
    }
    return '<b>' + u.name + '</b> · ' + SIDE[u.side] + ' · ' + M.label(u.x, u.y) + ' · altura ' + Math.max(0, c.h) +
      ' · mira al ' + TT.DIR_NAMES[u.face] + '<br>HP ' + u.hp + '/' + u.maxHp + ' · AT ' + s.at + ' · MG ' + s.mg +
      ' · DF ' + s.df + ' · RS ' + s.rs + ' · VL ' + s.vl + ' · MV ' + s.mv + ex;
  };

  H.tile = function (c) { return '<b>' + M.label(c.x, c.y) + '</b> · ' + TILE[c.type] + ' · altura ' + Math.max(0, c.h); };

  // Previsualización exacta del daño antes de confirmar.
  H.preview = function (att, tgt, r, spend) {
    var mods = [];
    if (r.dl !== 0) mods.push('Altura ' + pct(r.mH - 1));
    mods.push(ORIENT[r.orient]);
    if (tgt.broken) mods.push('Roto ×1,5');
    if (spend) mods.push('Potenciar ×' + n2(r.mP) + ' (' + spend + ' pt)');
    if (r.capped) mods.push('tope ×3,5');
    var wk = tgt.known[r.type] && TT.Combat.hitsWeak(tgt, r.type)     // solo si ya se conoce la debilidad
      ? '<br>' + ic(r.type) + ' <b>¡Débil!</b> −1 escudo' + (tgt.shield === 1 ? ' → <b>¡Rotura!</b>' : '') : '';
    return '<b>' + att.name + ' → ' + tgt.name + '</b> · ' + r.skill.name + ' (' + TT.TypeNames[r.type] + ')' +
      '<br>Daño <b>' + r.dmg + '</b> · HP ' + tgt.hp + ' → ' + r.hpAfter + (r.kill ? ' · <b>¡lo derrota!</b>' : '') +
      '<br>' + mods.join(' · ') + wk;
  };
})();
// FIN DE ARCHIVO
