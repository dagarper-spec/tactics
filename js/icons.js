// Iconos de tipos de daño (forma propia + color, para no depender solo del color). Solo vista.
window.TT = window.TT || {};
(function () {
  var PX = TT.PX, P = TT.PAL;
  var ROWS = {
    slash:  ['.....##', '....###', '...###.', '..###..', '.###...', '###....', '##.....'],
    blunt:  ['.#####.', '.#####.', '.#####.', '...#...', '...#...', '...#...', '...#...'],
    pierce: ['...#...', '..###..', '.#.#.#.', '...#...', '...#...', '...#...', '...#...'],
    fire:   ['...#...', '..##...', '..###..', '.#####.', '.#####.', '.#####.', '..###..'],
    ice:    ['...#...', '.#.#.#.', '..###..', '#######', '..###..', '.#.#.#.', '...#...'],
    light:  ['#..#..#', '.#.#.#.', '..###..', '###.###', '..###..', '.#.#.#.', '#..#..#']
  };
  var BOOST = ['...#...', '..###..', '.#####.', '#######', '..###..', '..###..', '..###..'];
  var SHIELD = ['.#######.', '#########', '#########', '#########', '#########', '.#######.', '..#####..', '...###...', '....#....'];
  var OUT = '#14121F';
  var cache = {}, urls = {};

  var I = TT.Icons = {};

  // Icono de un tipo con contorno oscuro. scale = píxeles por celda.
  I.canvas = function (type, scale) {
    var k = type + scale;
    if (!cache[k]) cache[k] = TT.Sprites.outline(PX.fromRows(ROWS[type], { '#': P.dmg[type] }, scale), OUT);
    return cache[k];
  };
  I.shield = function (color, scale) {
    return TT.Sprites.outline(PX.fromRows(SHIELD, { '#': color }, scale), OUT);
  };
  // Flecha hacia arriba: puntos de Potenciar.
  I.boost = function (scale) { return TT.Sprites.outline(PX.fromRows(BOOST, { '#': P.state.boost }, scale), OUT); };
  // Data URL para usar en <img> dentro del HUD.
  I.url = function (type) {
    if (!urls[type]) urls[type] = I.canvas(type, 3).toDataURL();
    return urls[type];
  };
})();
// FIN DE ARCHIVO
