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

  H.card = function (u) {
    var s = u.st, c = M.get(u.x, u.y);
    return '<b>' + u.name + '</b> · ' + SIDE[u.side] + ' · ' + M.label(u.x, u.y) + ' · altura ' + Math.max(0, c.h) +
      ' · mira al ' + TT.DIR_NAMES[u.face] + '<br>HP ' + u.hp + '/' + u.maxHp + ' · AT ' + s.at + ' · MG ' + s.mg +
      ' · DF ' + s.df + ' · RS ' + s.rs + ' · VL ' + s.vl + ' · MV ' + s.mv;
  };

  H.tile = function (c) { return '<b>' + M.label(c.x, c.y) + '</b> · ' + TILE[c.type] + ' · altura ' + Math.max(0, c.h); };

  // Previsualización exacta del daño antes de confirmar.
  H.preview = function (att, tgt, r) {
    var mods = [];
    if (r.dl !== 0) mods.push('Altura ' + pct(r.mH - 1));
    mods.push(ORIENT[r.orient]);
    if (r.capped) mods.push('tope ×3,5');
    return '<b>' + att.name + ' → ' + tgt.name + '</b> · ' + r.skill.name + ' (' + TT.TypeNames[r.type] + ')' +
      '<br>Daño <b>' + r.dmg + '</b> · HP ' + tgt.hp + ' → ' + r.hpAfter + (r.kill ? ' · <b>¡lo derrota!</b>' : '') +
      '<br>' + mods.join(' · ');
  };
})();
// FIN DE ARCHIVO
