// Números de equilibrio: todo lo ajustable vive aquí. Sin dependencias.
window.TT = window.TT || {};
TT.Bal = {
  heightDmg: 0.10,      // +/-10 % de daño por nivel de diferencia (la desventaja resta)
  heightRange: 1,       // +1 de alcance por nivel de ventaja (solo ataques a distancia)
  back: 1.3,            // espalda
  flank: 1.15,          // flanco
  brk: 1.5,             // objetivo roto (Hito 4)
  boostPer: 0.30,       // por punto de Potenciar (Hito 4)
  cap: 3.5,             // tope del multiplicador total
  minDmg: 1,
  friendlyFire: false   // el área no daña a aliados (Hito 4); cambiable
};

// stat: 'phys' usa AT/DF; 'mag' usa MG/RS. melee: no recibe bonus de alcance por altura.
TT.Skills = {
  slash:  { name: 'Tajo',         type: 'slash',  stat: 'phys', pot: 1.0, range: 1, melee: true },
  shot:   { name: 'Disparo',      type: 'pierce', stat: 'phys', pot: 1.0, range: 4 },
  flame:  { name: 'Llama',        type: 'fire',   stat: 'mag',  pot: 1.0, range: 3 },
  ray:    { name: 'Rayo',         type: 'light',  stat: 'mag',  pot: 0.7, range: 3 },
  stab:   { name: 'Lanzada',      type: 'pierce', stat: 'phys', pot: 1.0, range: 1, melee: true },
  bolt:   { name: 'Virote',       type: 'pierce', stat: 'phys', pot: 1.0, range: 4 },
  dark:   { name: 'Fuego oscuro', type: 'fire',   stat: 'mag',  pot: 1.0, range: 3 },
  cleave: { name: 'Hachazo',      type: 'slash',  stat: 'phys', pot: 1.0, range: 1, melee: true }
};
// Ataque básico de cada unidad.
TT.Basic = {
  warrior: 'slash', archer: 'shot', mage: 'flame', cleric: 'ray',
  soldier: 'stab', crossbow: 'bolt', sorcerer: 'dark', captain: 'cleave'
};
TT.TypeNames = { slash: 'Tajo', blunt: 'Contundente', pierce: 'Perforante', fire: 'Fuego', ice: 'Hielo', light: 'Luz' };
// FIN DE ARCHIVO
