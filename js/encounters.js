// Batallas como datos: quién lucha y dónde. Los enemigos usan TT.Defs (con multiplicadores opcionales "mod"); los héroes salen de TT.Party.
// heroes: [{ id, x, y }] · enemies: [{ type, x, y, id?, mod? }] (id solo si hay varios del mismo tipo).
window.TT = window.TT || {};
(function () {
  var E = TT.Encounters = { cur: null, list: {} };

  E.list.river = {
    id: 'river', name: 'El paso del río',
    heroes: [{ id: 'warrior', x: 4, y: 7 }, { id: 'archer', x: 2, y: 7 }, { id: 'mage', x: 3, y: 8 }, { id: 'cleric', x: 5, y: 8 }],
    enemies: [{ type: 'captain', x: 4, y: 2 }, { type: 'soldier', x: 2, y: 2 }, { type: 'sorcerer', x: 3, y: 1 }, { type: 'crossbow', x: 5, y: 1 }]
  };

  E.get = function (id) { return E.list[id || 'river'] || E.list.river; };
})();
// FIN DE ARCHIVO
