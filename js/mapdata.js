// Mapa "El paso del río". Lógica pura: sin THREE ni DOM.
// Fila = y (norte a sur), columna = x (oeste a este, A-J).
window.TT = window.TT || {};
(function () {
  var ROWS = [
    '1 1 2 2 2 2 1 1 1 1',
    '1 1 2 2 2 2 1 T1 1 0',
    '0 1 1 1 1 1 1 1 1 0',
    '0 0 1 1 1 1 R1 1 1 0',
    '~ ~ ~ ~ B ~ ~ w w ~',
    '~ ~ ~ ~ B ~ ~ w w ~',
    '1 2 2 1 1 0 0 0 0 0',
    '1 1 1 0 0 0 T0 0 0 0',
    '0 0 0 0 0 0 0 0 1 1',
    '0 0 0 0 0 0 0 0 1 2'
  ];
  var LV = 0.5; // altura de un nivel en unidades de mundo
  var N = 10;
  var cells = [];

  function parse(tok) {
    if (tok === '~') return { h: -1, type: 'deep' };
    if (tok === 'w') return { h: 0, type: 'ford' };
    if (tok === 'B') return { h: 1, type: 'bridge' };
    if (tok.charAt(0) === 'T') return { h: +tok.charAt(1), type: 'tree' };
    if (tok.charAt(0) === 'R') return { h: +tok.charAt(1), type: 'rock' };
    return { h: +tok, type: 'ground' };
  }
  for (var y = 0; y < N; y++) {
    var row = [], toks = ROWS[y].split(' ');
    for (var x = 0; x < N; x++) { var c = parse(toks[x]); c.x = x; c.y = y; row.push(c); }
    cells.push(row);
  }

  var M = TT.Map = {
    N: N, LV: LV, cells: cells,
    inBounds: function (x, y) { return x >= 0 && y >= 0 && x < N && y < N; },
    get: function (x, y) { return M.inBounds(x, y) ? cells[y][x] : null; },
    // Altura de la superficie donde se pisa (en unidades de mundo).
    topY: function (x, y) {
      var c = M.get(x, y);
      if (c.type === 'deep') return -0.1;
      if (c.type === 'ford') return 0.15;
      return (c.h + 1) * LV;
    },
    walkable: function (x, y) {
      var c = M.get(x, y);
      return !!c && c.type !== 'deep' && c.type !== 'tree' && c.type !== 'rock';
    },
    cost: function (x, y) { return M.get(x, y).type === 'ford' ? 2 : 1; },
    // Paso permitido entre vecinas: diferencia de nivel <= 1.
    canStep: function (x1, y1, x2, y2) {
      if (!M.walkable(x2, y2)) return false;
      return Math.abs(M.get(x1, y1).h - M.get(x2, y2).h) <= 1;
    },
    // Casillas alcanzables con presupuesto de movimiento (Dijkstra simple).
    reach: function (sx, sy, mv, blocked) {
      var best = {}, open = [{ x: sx, y: sy, c: 0 }], out = [];
      best[sx + ',' + sy] = 0;
      var D = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      while (open.length) {
        open.sort(function (a, b) { return a.c - b.c; });
        var cur = open.shift();
        out.push(cur);
        for (var i = 0; i < 4; i++) {
          var nx = cur.x + D[i][0], ny = cur.y + D[i][1];
          if (!M.inBounds(nx, ny) || !M.canStep(cur.x, cur.y, nx, ny)) continue;
          if (blocked && blocked(nx, ny)) continue;
          var nc = cur.c + M.cost(nx, ny), k = nx + ',' + ny;
          if (nc > mv || (best[k] !== undefined && best[k] <= nc)) continue;
          best[k] = nc;
          open.push({ x: nx, y: ny, c: nc });
        }
      }
      return out;
    },
    label: function (x, y) { return 'ABCDEFGHIJ'.charAt(x) + (y + 1); }
  };

  // Posiciones iniciales (Hito 2 las usará).
  TT.Start = {
    heroes: { warrior: [4, 7], archer: [2, 7], mage: [3, 8], cleric: [5, 8] },
    enemies: { captain: [4, 2], soldier: [2, 2], sorcerer: [3, 1], crossbow: [5, 1] }
  };
  // Decorado no ligado a casillas: x,y de casilla + desplazamiento en mundo.
  TT.Props = {
    torches: [[2, 0, -0.4, -0.4], [5, 0, 0.4, -0.4], [3, 3, -0.45, 0.45], [5, 3, 0.45, 0.45], [3, 6, -0.45, -0.45], [5, 6, 0.45, -0.45]],
    flags: [[3, 0, 0, -0.4], [4, 0, 0, -0.4]]
  };
})();
// FIN DE ARCHIVO
