// Números de equilibrio: todo lo ajustable vive aquí. Sin dependencias.
window.TT = window.TT || {};
TT.Bal = {
  heightDmg: 0.10,      // +/-10 % de daño por nivel de diferencia (la desventaja resta)
  heightRange: 1,       // +1 de alcance por nivel de ventaja (solo ataques a distancia)
  back: 1.3,            // espalda
  flank: 1.15,          // flanco
  brk: 1.5,             // objetivo roto
  boostPer: 0.30,       // por punto de Potenciar
  boostMax: 3,          // máximo de puntos acumulables
  cap: 3.5,             // tope del multiplicador total
  minDmg: 1,
  friendlyFire: false   // el área no daña a aliados (Hito 4); cambiable
};

TT.TypeNames = { slash: 'Tajo', blunt: 'Contundente', pierce: 'Perforante', fire: 'Fuego', ice: 'Hielo', light: 'Luz' };
// FIN DE ARCHIVO
