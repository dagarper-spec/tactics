// Orden de turnos por velocidad y máquina de fases. Lógica pura.
// Fases: 'act' (mover y/o actuar) -> 'face' (elegir orientación) -> siguiente unidad. 'over' = batalla terminada.
window.TT = window.TT || {};
(function () {
  var U = TT.Units;

  function alive() { return U.list.filter(function (u) { return u.hp > 0; }); }
  // VL descendente; en empate van primero los héroes; después, orden de creación.
  function order() {
    return alive().map(function (u, i) { return { u: u, i: i }; }).sort(function (a, b) {
      if (b.u.st.vl !== a.u.st.vl) return b.u.st.vl - a.u.st.vl;
      if (a.u.side !== b.u.side) return a.u.side === 'hero' ? -1 : 1;
      return a.i - b.i;
    }).map(function (o) { return o.u; });
  }

  var T = TT.Turns = { round: 1, order: [], idx: 0, cur: null, phase: 'act', acted: false, winner: null };

  T.init = function () { T.round = 1; T.order = order(); T.idx = -1; T.winner = null; T.next(); };

  T.checkOver = function () {
    var h = alive().some(function (u) { return u.side === 'hero'; });
    var e = alive().some(function (u) { return u.side === 'enemy'; });
    if (h && e) return false;
    T.phase = 'over'; T.winner = h ? 'hero' : 'enemy';
    return true;
  };

  T.next = function () {
    if (T.checkOver()) return;
    do {
      T.idx++;
      if (T.idx >= T.order.length) { T.round++; T.order = order(); T.idx = 0; }
    } while (T.order[T.idx].hp <= 0);
    T.cur = T.order[T.idx];
    T.cur.moved = false; T.cur.undo = null;
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
