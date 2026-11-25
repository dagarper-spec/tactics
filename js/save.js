// Partida guardada en localStorage: hechos de la historia, resultados de batallas y habilidades ganadas. Sin dependencias de vista.
window.TT = window.TT || {};
(function () {
  var KEY = 'tt_save', S = TT.Save = { data: null };

  S.load = function () {
    var d = null;
    try { var t = localStorage.getItem(KEY); d = t ? JSON.parse(t) : null; } catch (e) { d = null; }
    S.data = d && d.v === 1 ? d : null;
    return S.data;
  };
  S.exists = function () { return !!S.data; };
  S.commit = function () { try { localStorage.setItem(KEY, JSON.stringify(S.data)); } catch (e) {} };
  S.fresh = function () { S.data = { v: 1, flags: {}, battles: {}, skills: {}, t: Date.now() }; S.commit(); return S.data; };
  S.wipe = function () { S.data = null; try { localStorage.removeItem(KEY); } catch (e) {} };

  // Hechos de la historia: flag('x') lee, flag('x', valor) escribe.
  S.flag = function (k, v) {
    if (v === undefined) return S.data ? S.data.flags[k] : undefined;
    if (!S.data) S.fresh();
    S.data.flags[k] = v; S.commit();
  };
  // Resultado de una batalla (se llama al terminar).
  S.battleDone = function (id, winner, rounds) {
    if (!S.data) S.fresh();
    var b = S.data.battles[id] || (S.data.battles[id] = { played: 0, won: 0, best: 0 });
    b.played++;
    if (winner === 'hero') { b.won++; if (!b.best || rounds < b.best) b.best = rounds; }
    S.commit();
  };
  S.summary = function () {
    if (!S.data) return '';
    var b = S.data.battles.river;
    return b ? 'El paso del río: ' + b.won + ' victoria' + (b.won === 1 ? '' : 's') + ' en ' + b.played + ' intento' + (b.played === 1 ? '' : 's') : 'Partida nueva';
  };
})();
// FIN DE ARCHIVO
