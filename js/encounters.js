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

  // Prólogo: emboscada 1 (David, Helen y Marta) y emboscada 2 (con Clara). Enemigos algo más flojos; ajustar al probar.
  E.list.ambush1 = {
    id: 'ambush1', name: 'Emboscada en el bosque',
    heroes: [{ id: 'warrior', x: 4, y: 7 }, { id: 'archer', x: 2, y: 7 }, { id: 'mage', x: 3, y: 8 }],
    enemies: [{ type: 'soldier', id: 'soldier1', x: 3, y: 2, mod: { hp: 0.8, at: 0.85 } }, { type: 'soldier', id: 'soldier2', x: 5, y: 2, mod: { hp: 0.8, at: 0.85 } }, { type: 'crossbow', x: 4, y: 1, mod: { hp: 0.8 } }]
  };
  E.list.ambush2 = {
    id: 'ambush2', name: 'El camino cortado',
    heroes: [{ id: 'warrior', x: 4, y: 7 }, { id: 'archer', x: 2, y: 7 }, { id: 'mage', x: 3, y: 8 }, { id: 'cleric', x: 5, y: 8 }],
    enemies: [{ type: 'soldier', x: 3, y: 2, mod: { hp: 0.9, at: 0.9 } }, { type: 'crossbow', id: 'crossbow1', x: 2, y: 1 }, { type: 'crossbow', id: 'crossbow2', x: 5, y: 1 }, { type: 'captain', x: 4, y: 2, mod: { hp: 0.7, at: 0.85 } }]
  };

  E.get = function (id) { return E.list[id || 'river'] || E.list.river; };
})();
// FIN DE ARCHIVO
