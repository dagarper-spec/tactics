// Acciones: apuntado, áreas, previsualización y resolución de habilidades. Lógica pura.
window.TT = window.TT || {};
(function () {
  var M = TT.Map, U = TT.Units, C = TT.Combat, B = TT.Bal;
  var A = TT.Actions = {};

  A.kit = function (u) { return TT.Kit[u.type].map(function (id) { return TT.Skills[id]; }); };
  A.cd = function (u, sk) { return u.cd[sk.id] || 0; };
  A.needsAim = function (sk) { return sk.shape !== 'self' && sk.shape !== 'around'; };
  A.isAlly = function (sk) { return sk.kind === 'heal' || sk.kind === 'bless'; };

  function dist(a, x, y) { return Math.abs(a.x - x) + Math.abs(a.y - y); }
  function rangeTo(att, sk, x, y) {          // alcance efectivo (+1 por nivel de ventaja si no es cuerpo a cuerpo)
    return sk.range + (sk.melee ? 0 : Math.max(0, C.level(att) - C.levelAt(x, y)) * B.heightRange);
  }

  // Casillas donde se puede apuntar.
  A.aims = function (att, sk) {
    var out = [];
    if (!A.needsAim(sk)) return out;
    if (sk.shape === 'single') {
      U.list.forEach(function (t) {
        if (t.hp <= 0) return;
        var ok = A.isAlly(sk) ? t.side === att.side : t.side !== att.side;
        if (ok && dist(att, t.x, t.y) <= rangeTo(att, sk, t.x, t.y)) out.push({ x: t.x, y: t.y });
      });
      return out;
    }
    for (var x = 0; x < M.N; x++) {
      for (var y = 0; y < M.N; y++) {
        var d = dist(att, x, y);
        if (sk.shape === 'line') { if (d >= 1 && d <= sk.range && (x === att.x || y === att.y)) out.push({ x: x, y: y }); }
        else if (d <= rangeTo(att, sk, x, y)) out.push({ x: x, y: y });
      }
    }
    return out;
  };
  A.isAim = function (att, sk, x, y) {
    return A.aims(att, sk).some(function (a) { return a.x === x && a.y === y; });
  };
  // Disponible: sin recarga y, si hace falta apuntar, con algún objetivo posible.
  A.available = function (att, sk) {
    if (A.cd(att, sk) > 0) return false;
    if (sk.shape === 'single') return A.aims(att, sk).length > 0;
    return true;
  };

  // Casillas afectadas. Para 'self' y 'around' no se usa aim.
  A.area = function (att, sk, aim) {
    var t = [], i, j;
    function add(x, y) { if (M.inBounds(x, y)) t.push({ x: x, y: y }); }
    if (sk.shape === 'single') add(aim.x, aim.y);
    else if (sk.shape === 'burst') { for (i = -1; i <= 1; i++) for (j = -1; j <= 1; j++) add(aim.x + i, aim.y + j); }
    else if (sk.shape === 'cross') { add(aim.x, aim.y); TT.DIR.forEach(function (d) { add(aim.x + d[0], aim.y + d[1]); }); }
    else if (sk.shape === 'line') {
      var dx = Math.sign(aim.x - att.x), dy = Math.sign(aim.y - att.y);
      for (i = 1; i <= sk.len; i++) add(att.x + dx * i, att.y + dy * i);
    } else if (sk.shape === 'around') TT.DIR.forEach(function (d) { add(att.x + d[0], att.y + d[1]); });
    return t;
  };

  A.healAmt = function (att, sk, spend) { return Math.round(sk.pot * att.st.mg * (1 + B.boostPer * (spend || 0))); };
  A.tauntTargets = function (att, sk) {
    return U.list.filter(function (u) { return u.hp > 0 && u.side !== att.side && dist(att, u.x, u.y) <= sk.radius; });
  };

  // Efectos previstos sin aplicarlos: [{ u, kind: 'dmg'|'heal'|'bless', r | amt }]
  A.preview = function (att, sk, aim, spend) {
    var out = [];
    if (sk.kind === 'taunt') return out;
    var tiles = A.area(att, sk, aim);
    U.list.forEach(function (u) {
      if (u.hp <= 0 || !tiles.some(function (t) { return t.x === u.x && t.y === u.y; })) return;
      var foe = u.side !== att.side;
      if (sk.kind === 'bless') { if (!foe) out.push({ u: u, kind: 'bless' }); }
      else if (sk.kind === 'heal' || (sk.kind === 'mix' && !foe)) {
        var amt = Math.min(u.maxHp - u.hp, A.healAmt(att, sk, spend));
        if (!foe && !(sk.kind === 'mix' && amt === 0)) out.push({ u: u, kind: 'heal', amt: amt });
      } else if (foe || (B.friendlyFire && u !== att)) out.push({ u: u, kind: 'dmg', r: C.calc(att, u, sk, { boost: spend }) });
    });
    return out;
  };

  // Aplica la habilidad. Gasta Potenciar una sola vez, aunque haya varios objetivos.
  A.resolve = function (att, sk, aim, spend) {
    spend = (sk.kind === 'taunt' || sk.kind === 'bless') ? 0 : Math.min(spend || 0, att.boost);
    var res = [];
    A.preview(att, sk, aim, spend).forEach(function (e) {
      var u = e.u;
      if (e.kind === 'dmg') {
        var r = C.apply(att, u, sk, { boost: spend });
        if (sk.slow && u.hp > 0) { u.slow = 1; r.slowed = true; }
        res.push({ u: u, kind: 'dmg', r: r });
      } else if (e.kind === 'heal') { u.hp += e.amt; res.push({ u: u, kind: 'heal', amt: e.amt }); }
      else { u.boost = Math.min(B.boostMax, u.boost + 1); res.push({ u: u, kind: 'bless' }); }
    });
    if (sk.kind === 'taunt') { att.taunt = sk.turns; res.push({ u: att, kind: 'taunt', n: A.tauntTargets(att, sk).length }); }
    att.boost -= spend;
    if (sk.cd) att.cd[sk.id] = sk.cd;
    return res;
  };
})();
// FIN DE ARCHIVO
