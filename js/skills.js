// Habilidades y kits de cada unidad. Datos puros.
// kind: dmg | heal | bless | taunt | mix (daña a enemigos y cura a aliados).
// shape: single | burst (3x3) | cross (5) | line (recta desde el lanzador) | around (4 vecinas) | self.
// cd = turnos propios de recarga. stat: phys (AT/DF) o mag (MG/RS).
window.TT = window.TT || {};
(function () {
  var S = TT.Skills = {
    // Guerrero
    slash:   { name: 'Tajo',            type: 'slash',  stat: 'phys', pot: 1.0, range: 1, melee: true },
    shield:  { name: 'Golpe de escudo', type: 'blunt',  stat: 'phys', pot: 1.2, range: 1, melee: true, cd: 2 },
    taunt:   { name: 'Provocar',        kind: 'taunt',  shape: 'self', radius: 3, turns: 2, cd: 3 },
    whirl:   { name: 'Remolino',        type: 'slash',  stat: 'phys', pot: 0.9, range: 1, melee: true, shape: 'around', cd: 3 },
    // Arquero
    shot:    { name: 'Disparo',         type: 'pierce', stat: 'phys', pot: 1.0, range: 4 },
    aimed:   { name: 'Tiro certero',    type: 'pierce', stat: 'phys', pot: 1.4, range: 5, cd: 2 },
    rain:    { name: 'Lluvia de flechas', type: 'pierce', stat: 'phys', pot: 0.8, range: 4, shape: 'cross', cd: 4 },
    retreat: { name: 'Retirada',        type: 'pierce', stat: 'phys', pot: 0.8, range: 4, cd: 3, retreat: 2 },
    // Mago
    flame:   { name: 'Llama',           type: 'fire',   stat: 'mag',  pot: 1.0, range: 3 },
    fireball:{ name: 'Bola de fuego',   type: 'fire',   stat: 'mag',  pot: 1.2, range: 3, shape: 'burst', cd: 3 },
    icelance:{ name: 'Lanza de hielo',  type: 'ice',    stat: 'mag',  pot: 1.3, range: 3, shape: 'line', cd: 2 },
    frost:   { name: 'Escarcha',        type: 'ice',    stat: 'mag',  pot: 0.9, range: 3, shape: 'burst', cd: 4, slow: true },
    // Clérigo
    ray:     { name: 'Rayo',            type: 'light',  stat: 'mag',  pot: 0.7, range: 3 },
    heal:    { name: 'Curar',           kind: 'heal',   stat: 'mag',  pot: 1.4, range: 3 },
    bless:   { name: 'Bendición',       kind: 'bless',  range: 3, cd: 3 },
    holy:    { name: 'Luz sagrada',     kind: 'mix',    type: 'light', stat: 'mag', pot: 0.8, range: 3, shape: 'burst', cd: 4 },
    // Enemigos
    stab:    { name: 'Lanzada',         type: 'pierce', stat: 'phys', pot: 1.0, range: 1, melee: true },
    bolt:    { name: 'Virote',          type: 'pierce', stat: 'phys', pot: 1.0, range: 4 },
    dark:    { name: 'Fuego oscuro',    type: 'fire',   stat: 'mag',  pot: 1.0, range: 3 },
    blaze:   { name: 'Llamarada',       type: 'fire',   stat: 'mag',  pot: 0.8, range: 3, shape: 'burst', cd: 3 },
    cleave:  { name: 'Hachazo',         type: 'slash',  stat: 'phys', pot: 1.0, range: 1, melee: true }
  };
  Object.keys(S).forEach(function (id) {       // valores por defecto
    var s = S[id];
    s.id = id; s.kind = s.kind || 'dmg'; s.shape = s.shape || 'single'; s.cd = s.cd || 0; s.len = s.len || 3;
  });

  // El primero de cada kit es el ataque básico.
  TT.Kit = {
    warrior:  ['slash', 'shield', 'taunt', 'whirl'],
    archer:   ['shot', 'aimed', 'rain', 'retreat'],
    mage:     ['flame', 'fireball', 'icelance', 'frost'],
    cleric:   ['ray', 'heal', 'bless', 'holy'],
    soldier:  ['stab'],
    crossbow: ['bolt'],
    sorcerer: ['dark', 'blaze'],
    captain:  ['cleave', 'taunt']
  };
  TT.Basic = {};
  Object.keys(TT.Kit).forEach(function (t) { TT.Basic[t] = TT.Kit[t][0]; });
})();
// FIN DE ARCHIVO
