// Lógica de unidades (sin THREE ni DOM): datos base, posiciones, movimiento y deshacer.
window.TT = window.TT || {};
(function () {
  var M = TT.Map;
  TT.DIR = [[0, -1], [1, 0], [0, 1], [-1, 0]];           // 0 N, 1 E, 2 S, 3 O
  TT.DIR_NAMES = ['norte', 'este', 'sur', 'oeste'];
  TT.faceOf = function (dx, dy) {
    return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0);
  };

  // Estadísticas base aprobadas. Más adelante irán a js/balance.js.
  TT.Defs = {
    warrior:  { name: 'Guerrero',   side: 'hero',  hp: 120, at: 18, mg: 6,  df: 16, rs: 8,  vl: 8,  mv: 4 },
    archer:   { name: 'Arquero',    side: 'hero',  hp: 80,  at: 20, mg: 6,  df: 8,  rs: 8,  vl: 12, mv: 4 },
    mage:     { name: 'Mago',       side: 'hero',  hp: 70,  at: 6,  mg: 22, df: 6,  rs: 14, vl: 9,  mv: 3 },
    cleric:   { name: 'Clérigo',    side: 'hero',  hp: 85,  at: 8,  mg: 18, df: 9,  rs: 16, vl: 10, mv: 4 },
    soldier:  { weak: ['pierce', 'fire', 'ice'], name: 'Soldado',    side: 'enemy', hp: 100, at: 17, mg: 4,  df: 14, rs: 6,  vl: 7,  mv: 4 },
    crossbow: { weak: ['slash', 'light'], name: 'Ballestero', side: 'enemy', hp: 70,  at: 18, mg: 4,  df: 8,  rs: 8,  vl: 11, mv: 3 },
    sorcerer: { weak: ['blunt', 'pierce'], name: 'Hechicero',  side: 'enemy', hp: 65,  at: 5,  mg: 20, df: 6,  rs: 14, vl: 9,  mv: 3 },
    captain:  { weak: ['ice', 'light', 'blunt'], name: 'Capitán',    side: 'enemy', hp: 140, at: 20, mg: 6,  df: 18, rs: 10, vl: 6,  mv: 3 }
  };

  var U = TT.Units = { list: [] };

  U.init = function () {
    U.list = [];
    [['heroes', 0], ['enemies', 2]].forEach(function (g) {
      var grp = TT.Start[g[0]];
      Object.keys(grp).forEach(function (t) {
        var d = TT.Defs[t];
        U.list.push({
          id: t, type: t, name: d.name, side: d.side, hp: d.hp, maxHp: d.hp,
          st: { at: d.at, mg: d.mg, df: d.df, rs: d.rs, vl: d.vl, mv: d.mv },
          x: grp[t][0], y: grp[t][1], face: g[1], moved: false, undo: null,
          weak: (d.weak || []).slice(), shield: (d.weak || []).length, shieldMax: (d.weak || []).length,
          known: {}, broken: false, boost: 0, cd: {}, taunt: 0, slow: 0
        });
      });
    });
  };

  U.at = function (x, y) {
    for (var i = 0; i < U.list.length; i++) {
      var u = U.list[i];
      if (u.hp > 0 && u.x === x && u.y === y) return u;
    }
    return null;
  };

  // Casillas donde puede terminar: pasa por aliados, no por enemigos, y no acaba sobre nadie.
  U.reach = function (u, mv) {
    var raw = M.reach(u.x, u.y, mv === undefined ? u.st.mv : mv, function (x, y) {
      var o = U.at(x, y);
      return o && o.side !== u.side;
    });
    return raw.filter(function (c) { var o = U.at(c.x, c.y); return !o || o === u; });
  };

  // Camino (sin la casilla inicial) hasta x,y dentro de una lista de U.reach; null si no se puede.
  U.path = function (reach, x, y) {
    var t = null;
    for (var i = 0; i < reach.length; i++) if (reach[i].x === x && reach[i].y === y) t = reach[i];
    if (!t || t.c === 0) return null;
    var p = [];
    while (t && t.p) { p.unshift({ x: t.x, y: t.y }); t = t.p; }
    return p;
  };

  U.move = function (u, path) {
    var last = path[path.length - 1];
    var prev = path.length > 1 ? path[path.length - 2] : { x: u.x, y: u.y };
    u.undo = { x: u.x, y: u.y, face: u.face };
    u.face = TT.faceOf(last.x - prev.x, last.y - prev.y);
    u.x = last.x; u.y = last.y; u.moved = true;
  };

  U.undoMove = function (u) {
    if (!u.moved || !u.undo) return false;
    u.x = u.undo.x; u.y = u.undo.y; u.face = u.undo.face;
    u.moved = false; u.undo = null;
    return true;
  };

  U.resetRound = function () {
    U.list.forEach(function (u) { u.moved = false; u.undo = null; });
  };
})();
// FIN DE ARCHIVO
