// Reglas de combate puras: alcance, orientación y fórmula de daño. Sin THREE ni DOM.
window.TT = window.TT || {};
(function () {
  var M = TT.Map, B = TT.Bal;

  var C = TT.Combat = {};

  C.level = function (u) { return Math.max(0, M.get(u.x, u.y).h); };
  C.skill = function (u) { return TT.Skills[TT.Basic[u.type]]; };
  C.dist = function (a, b) { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); };

  // Alcance efectivo contra un objetivo concreto (la ventaja de altura suma alcance).
  C.range = function (att, tgt, sk) {
    var bonus = sk.melee ? 0 : Math.max(0, C.level(att) - C.level(tgt)) * B.heightRange;
    return sk.range + bonus;
  };

  C.targets = function (att, sk) {
    sk = sk || C.skill(att);
    return TT.Units.list.filter(function (t) {
      return t.hp > 0 && t.side !== att.side && C.dist(att, t) <= C.range(att, t, sk);
    });
  };

  // 'front' | 'flank' | 'back' según dónde está el atacante respecto a hacia dónde mira el objetivo.
  C.orientation = function (att, tgt) {
    var dx = att.x - tgt.x, dy = att.y - tgt.y;
    var ax = Math.abs(dx), ay = Math.abs(dy);
    if (ax === ay) return 'flank';                     // diagonal exacta
    var mx = ax > ay ? Math.sign(dx) : 0, my = ax > ay ? 0 : Math.sign(dy);
    var f = TT.DIR[tgt.face];
    if (mx === f[0] && my === f[1]) return 'front';
    if (mx === -f[0] && my === -f[1]) return 'back';
    return 'flank';
  };

  // Daño exacto (sin azar). opts: { boost, broken } reservados para el Hito 4.
  C.calc = function (att, tgt, sk, opts) {
    sk = sk || C.skill(att); opts = opts || {};
    var atk = sk.stat === 'phys' ? att.st.at : att.st.mg;
    var def = sk.stat === 'phys' ? tgt.st.df : tgt.st.rs;
    var base = sk.pot * atk * 100 / (100 + def);
    var dl = C.level(att) - C.level(tgt);
    var mH = 1 + B.heightDmg * dl;
    var orient = C.orientation(att, tgt);
    var mO = orient === 'back' ? B.back : orient === 'flank' ? B.flank : 1;
    var mB = (opts.broken !== undefined ? opts.broken : tgt.broken) ? B.brk : 1;
    var mP = 1 + B.boostPer * (opts.boost || 0);
    var raw = mH * mO * mB * mP, mult = Math.min(B.cap, raw);
    var dmg = Math.max(B.minDmg, Math.round(base * mult));
    return {
      dmg: dmg, base: base, mH: mH, dl: dl, orient: orient, mO: mO, mB: mB, mP: mP,
      mult: mult, capped: raw > B.cap, type: sk.type, skill: sk,
      hpAfter: Math.max(0, tgt.hp - dmg), kill: tgt.hp - dmg <= 0
    };
  };

  // ¿Este tipo de daño quita escudo ahora mismo? (no si ya está roto o sin escudos)
  C.hitsWeak = function (tgt, type) {
    return tgt.shieldMax > 0 && !tgt.broken && tgt.shield > 0 && tgt.weak.indexOf(type) >= 0;
  };

  // Aplica el daño y, si acierta una debilidad, quita 1 escudo y la revela. Con 0 escudos queda roto.
  // El golpe que rompe NO recibe el x1,5 (se calcula antes de romper). Los muertos no pierden escudos.
  C.apply = function (att, tgt, sk, opts) {
    opts = opts || {};
    var r = C.calc(att, tgt, sk, { boost: opts.boost, broken: tgt.broken });
    var weak = C.hitsWeak(tgt, r.type);
    tgt.hp = r.hpAfter;
    r.weak = weak; r.broke = false;
    if (weak && tgt.hp > 0) {
      tgt.known[r.type] = true; tgt.shield--;
      if (tgt.shield === 0) { tgt.broken = true; r.broke = true; }
    }
    if (att.boost >= 0 && opts.boost) att.boost = Math.max(0, att.boost - opts.boost);
    return r;
  };
})();
// FIN DE ARCHIVO
