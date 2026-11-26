// Grupo del jugador: héroes como datos que se guardan (clase, nivel, experiencia, equipo, habilidades). Sin dependencias de vista.
window.TT = window.TT || {};
(function () {
  var KEYS = ['hp', 'at', 'mg', 'df', 'rs', 'vl', 'mv'];
  TT.MAXLV = 8;

  // Mejora por nivel de cada clase (el nivel 1 es la base de TT.Defs, ya equilibrada).
  TT.Growth = {
    warrior: { hp: 12, at: 2, mg: 1, df: 2, rs: 1, vl: 0, mv: 0 },
    archer:  { hp: 8,  at: 2, mg: 1, df: 1, rs: 1, vl: 1, mv: 0 },
    mage:    { hp: 7,  at: 1, mg: 3, df: 1, rs: 2, vl: 0, mv: 0 },
    cleric:  { hp: 8,  at: 1, mg: 2, df: 1, rs: 2, vl: 0, mv: 0 }
  };
  // Objetos de equipo: { id: { slot: 'weapon'|'armor', name, mod: { at: 2 }, price } }. Se rellena en el hito de equipo.
  TT.Items = TT.Items || {};

  var P = TT.Party = { roster: {} };

  function fresh(id, name) { return { id: id, cls: id, name: name, level: 1, xp: 0, equip: { weapon: null, armor: null }, skills: null, joined: true }; }
  P.defaults = function () {
    return { warrior: fresh('warrior', 'David'), archer: fresh('archer', 'Helen'), mage: fresh('mage', 'Marta'), cleric: fresh('cleric', 'Clara') };
  };

  // Carga el grupo de la partida guardada (o el inicial).
  P.load = function () {
    var s = TT.Save && TT.Save.data && TT.Save.data.party;
    P.roster = s ? JSON.parse(JSON.stringify(s)) : P.defaults();
  };
  P.commit = function () { if (TT.Save && TT.Save.data) { TT.Save.data.party = P.roster; TT.Save.commit(); } };
  P.get = function (id) { if (!P.roster[id]) P.roster = P.roster && Object.keys(P.roster).length ? P.roster : P.defaults(); return P.roster[id]; };

  // Estadísticas = base de la clase + mejora por nivel + modificadores del equipo.
  P.stats = function (r) {
    var d = TT.Defs[r.cls], g = TT.Growth[r.cls], n = r.level - 1, s = {};
    KEYS.forEach(function (k) { s[k] = d[k] + (g[k] || 0) * n; });
    ['weapon', 'armor'].forEach(function (slot) {
      var it = r.equip[slot] && TT.Items[r.equip[slot]];
      if (it) KEYS.forEach(function (k) { s[k] += (it.mod && it.mod[k]) || 0; });
    });
    return s;
  };
})();
// FIN DE ARCHIVO
