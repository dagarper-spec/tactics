// Orden de turnos por velocidad y máquina de fases. Lógica pura.
// Fases: 'act' (mover y/o actuar) -> 'face' (elegir orientación) -> siguiente unidad. 'over' = batalla terminada.
window.TT = window.TT || {};
(function () {
  var U = TT.Units;

  function alive() { return U.list.filter(function (u) { return u.hp > 0; }); }
  // VL descendente; en empate van primero los héroes; después, orden de creación.
  function vl(u) { return u.slow > 0 ? u.st.vl * 0.7 : u.st.vl; }   // Escarcha: VL x0,7
  function order() {
    return alive().map(function (u, i) { return { u: u, i: i }; }).sort(function (a, b) {
      if (vl(b.u) !== vl(a.u)) return vl(b.u) - vl(a.u);
      if (a.u.side !== b.u.side) return a.u.side === 'hero' ? -1 : 1;
      return a.i - b.i;
    }).map(function (o) { return o.u; });
  }

  var T = TT.Turns = { round: 1, order: [], idx: 0, cur: null, phase: 'act', acted: false, winner: null, skipped: [] };

  T.init = function () { T.round = 1; T.order = order(); T.idx = -1; T.winner = null; T.next(); };

  T.checkOver = function () {
    var h = alive().some(function (u) { return u.side === 'hero'; });
    var e = alive().some(function (u) { return u.side === 'enemy'; });
    if (h && e) return false;
    T.phase = 'over'; T.winner = h ? 'hero' : 'enemy';
    return true;
  };

  // Avanza al siguiente turno. Una unidad rota pierde ese turno y recupera todos sus escudos.
  T.next = function () {
    T.skipped = [];
    if (T.checkOver()) return;
    for (;;) {
      do {
        T.idx++;
        if (T.idx >= T.order.length) {
          T.round++; T.order = order(); T.idx = 0;
          alive().forEach(function (x) { if (x.slow > 0) x.slow--; });   // la ralentización dura una ronda
        }
      } while (T.order[T.idx].hp <= 0);
      var u = T.order[T.idx];
      if (!u.broken) break;
      u.broken = false; u.shield = u.shieldMax; T.skipped.push(u);
    }
    T.cur = T.order[T.idx];
    T.cur.moved = false; T.cur.undo = null;
    T.cur.boost = Math.min(TT.Bal.boostMax, T.cur.boost + 1);   // +1 punto de Potenciar por turno
    Object.keys(T.cur.cd).forEach(function (k) { if (T.cur.cd[k] > 0) T.cur.cd[k]--; });   // recargas
    if (T.cur.taunt > 0) T.cur.taunt--;
    T.phase = 'act'; T.acted = false;
  };

  T.wait = function () { if (T.phase === 'act') T.phase = 'face'; };
  T.attackDone = function () { T.acted = true; T.phase = T.checkOver() ? 'over' : 'face'; };
  T.endTurn = function () { if (T.phase === 'face') T.next(); };

  // Cola para mostrar: lo que queda de esta ronda (incluye al actual) y la ronda siguiente.
  T.upcoming = function () {
    var now = T.order.slice(T.idx).filter(function (u) { return u.hp > 0; });
    return { round: T.round, now: now, next: order() };
  };
})();
// FIN DE ARCHIVO
