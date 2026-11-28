// Texturas dibujadas por código para el pueblo y los interiores (suelo, paredes, tejados, puertas, muebles).
window.TT = window.TT || {};
(function () {
  var PX = TT.PX, P = TT.PAL, T = TT.AreaTex = {};

  function noise(g, w, h, col, seed, n) {
    var r = PX.rng(seed);
    for (var i = 0; i < n; i++) { g.fillStyle = PX.shade(col, r() < 0.5 ? 0.88 : 1.1); g.fillRect((r() * w) | 0, (r() * h) | 0, 1, 1); }
  }
  function ctx(w, h) { var c = PX.canvas(w, h); return { c: c, g: c.getContext('2d') }; }

  // Suelo del pueblo: hierba y caminos en un solo lienzo de 16 px por casilla (con margen de hierba alrededor).
  T.ground = function (a, M) {
    var W = a.W + 2 * M, H = a.H + 2 * M, o = ctx(W * 16, H * 16), gr = [PX.topTile(P.terrain[0].top, 3), PX.topTile(P.terrain[0].top, 9)], pa = [PX.topTile('#8A6A44', 4), PX.topTile('#7C5E3C', 8)], co = [PX.stoneTile('#9A9488', 2), PX.stoneTile('#8A8478', 6)];
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var c = TT.Areas.ch(a, x - M, y - M), path = c === ',' || (a.def.doors[c] && c !== 'x') || c === 'x';
      o.g.drawImage((c === ':' ? co : path ? pa : gr)[(x * 7 + y * 3) % 2], x * 16, y * 16);
    }
    return o.c;
  };
  // Suelo de madera de un interior.
  T.floor = function (a) {
    var f = a.def.theme.floor, wood = { dark: PX.shade(f, 0.7), mid: f, light: PX.shade(f, 1.2) }, o = ctx(a.W * 16, a.H * 16);
    for (var y = 0; y < a.H; y++) for (var x = 0; x < a.W; x++) o.g.drawImage(PX.plankTile(wood, 5 + (x * 3 + y) % 4), x * 16, y * 16);
    return o.c;
  };
  // Pared lisa (interior) con zócalo oscuro.
  T.plaster = function (col) {
    var o = ctx(16, 32); o.g.fillStyle = col; o.g.fillRect(0, 0, 16, 32); noise(o.g, 16, 32, col, 12, 40);
    o.g.fillStyle = PX.shade(col, 0.7); o.g.fillRect(0, 22, 16, 10); o.g.fillStyle = PX.shade(col, 0.5); o.g.fillRect(0, 22, 16, 1);
    return o.c;
  };
  function R(g, c, x, y, w, h) { g.fillStyle = c; g.fillRect(x, y, w, h); }
  // Ventana de entramado con cristales cálidos (luz de dentro).
  function win(g, cx, y, w, h) {
    R(g, '#3B2214', cx - w / 2 - 2, y - 2, w + 4, h + 4); R(g, '#E8962E', cx - w / 2, y, w, h); R(g, '#FFC24D', cx - w / 2, y, w, h >> 1); R(g, '#FFE9A8', cx - w / 2 + 1, y + 1, 3, 2);
    R(g, '#3B2214', cx - 1, y, 2, h); R(g, '#3B2214', cx - w / 2, y + (h >> 1) - 1, w, 2);
  }
  // Fachada de w casillas (32 px por casilla, estilo casa de entramado). opt: { door: columna o -1, label, blank, roof }
  T.facade = function (w, col, opt) {
    var W = w * 32, o = ctx(W, 64), g = o.g, i, k, D = '#3B2214', M = '#5E3A22', st = '#6A7079';
    R(g, col, 0, 0, W, 64); noise(g, W, 64, col, 21 + w, w * 60);
    R(g, st, 0, 50, W, 14); noise(g, W, 64, st, 5, w * 24);                              // zócalo de piedra
    for (k = 50; k < 64; k += 5) { R(g, '#3F454E', 0, k, W, 1); for (i = (k % 10 ? 0 : 6); i < W; i += 12) R(g, '#3F454E', i, k, 1, 5); }
    R(g, '#98A0AB', 0, 51, W, 1);
    R(g, D, 0, 0, W, 5); R(g, M, 0, 1, W, 1); R(g, D, 0, 46, W, 4); R(g, M, 0, 47, W, 1);   // vigas
    R(g, D, 0, 0, 4, 50); R(g, M, 1, 0, 1, 50); R(g, D, W - 4, 0, 4, 50); R(g, M, W - 3, 0, 1, 50);
    for (i = 1; i < w; i++) { R(g, D, i * 32 - 2, 0, 4, 50); R(g, M, i * 32 - 1, 0, 1, 50); }
    for (i = 0; i < w; i++) {
      var cx = i * 32 + 16;
      for (k = 0; k < 7; k++) { R(g, D, i * 32 + 4 + k, 5 + k, 2, 2); R(g, D, i * 32 + 26 - k, 5 + k, 2, 2); }   // tornapuntas
      if (opt.door === i) {
        var rf = opt.roof || '#9C4A3A';
        R(g, D, cx - 8, 16, 16, 34); R(g, '#7A3A22', cx - 7, 17, 14, 33); R(g, '#4E2414', cx - 3, 17, 1, 33); R(g, '#4E2414', cx + 2, 17, 1, 33); R(g, '#A0603A', cx - 7, 17, 14, 1);
        R(g, '#1B1020', cx + 3, 33, 4, 4); R(g, '#C9A24B', cx + 4, 34, 2, 2);                                      // aldaba
        R(g, PX.shade(rf, 0.55), cx - 13, 8, 26, 8); R(g, rf, cx - 12, 9, 24, 5); R(g, PX.shade(rf, 1.25), cx - 12, 9, 24, 1); R(g, PX.shade(rf, 0.75), cx - 12, 12, 24, 1);   // tejadillo
        for (k = -12; k < 12; k += 6) R(g, PX.shade(rf, 0.75), cx + k, 9, 1, 5);
      } else if (!opt.blank) {
        win(g, cx, 14, 12, 18); R(g, M, cx - 10, 34, 20, 3); R(g, '#8A6038', cx - 10, 34, 20, 1);
        for (k = 0; k < 6; k++) R(g, ['#E0587A', '#F2E070', '#F2F2F2'][(k + i) % 3], cx - 8 + k * 3, 32, 2, 2);        // flores en el alféizar
      }
    }
    if (opt.label) {                                                  // rótulo sobre la puerta
      var n = opt.label.length * 7 + 6, x0 = opt.door * 32 + 16 - n / 2;
      R(g, D, x0, 0, n, 9); R(g, '#E8C868', x0 + 1, 1, n - 2, 1); g.fillStyle = '#E8C868'; g.font = 'bold 8px monospace'; g.textBaseline = 'top'; g.fillText(opt.label, x0 + 3, 1);
    }
    return o.c;
  };
  // Hastial del tejado (se ve la zona central de la textura): entramado con una ventana encendida.
  T.gable = function (col) {
    var o = ctx(64, 64), g = o.g, k, D = '#3B2214';
    R(g, col, 0, 0, 64, 64); noise(g, 64, 64, col, 33, 120);
    R(g, D, 0, 24, 64, 5); R(g, '#5E3A22', 0, 25, 64, 1); R(g, D, 31, 0, 3, 24);
    for (k = 0; k < 9; k++) { R(g, D, 19 + k, 23 - k, 2, 2); R(g, D, 43 - k, 23 - k, 2, 2); }
    win(g, 32, 12, 8, 9);
    return o.c;
  };
  // Tejado de tejas redondeadas (32 px por unidad): filas desplazadas, borde inferior curvo oscuro y brillo.
  T.roof = function (col) {
    var o = ctx(32, 32), g = o.g, V = [0.92, 1.06, 1.0, 1.12], B = [5, 5, 6, 6, 7, 7, 8, 8, 8, 8, 7, 7, 6, 6, 5, 5], dk = PX.shade(col, 0.6), row, t, i;
    function tile(x, y, c) {
      for (i = 0; i < 16; i++) { R(g, c, x + i, y, 1, B[i]); R(g, dk, x + i, y + B[i] - 1, 1, 1); R(g, dk, x + i, y + B[i] - 2, 1, 1); }
      R(g, PX.shade(col, 1.25), x + 1, y, 14, 1); R(g, PX.shade(col, 1.15), x + 4, y + 2, 4, 1); R(g, dk, x, y, 1, 7);
    }
    for (t = -1; t < 2; t++) tile(t * 16 + 8, -8, PX.shade(col, V[(6 + (t & 1)) % 4]));      // copia de la última fila para que las tejas enlacen
    for (row = 3; row >= 0; row--) for (t = -1; t < 2; t++) tile(t * 16 + (row % 2) * 8, row * 8, PX.shade(col, V[(row * 2 + (t & 1)) % 4]));
    return o.c;
  };
  T.stone = function () { return PX.stoneTile(P.stone.top, 7); };
  T.wood = function () { return PX.plankTile(P.wood, 3); };
  // Estantería con mercancías de colores.
  T.shelf = function () {
    var o = ctx(16, 16), g = o.g, r = PX.rng(4), cols = ['#C8423A', '#4A78C2', '#E0B24D', '#7FD6A0', '#B58CFF', '#F2E9D8'];
    g.fillStyle = '#3A2616'; g.fillRect(0, 0, 16, 16);
    for (var s = 0; s < 3; s++) {
      g.fillStyle = '#7A5634'; g.fillRect(0, s * 5 + 4, 16, 1);
      for (var x = 1; x < 15; x += 3) { g.fillStyle = cols[(r() * cols.length) | 0]; g.fillRect(x, s * 5 + 1, 2, 3); }
    }
    return o.c;
  };
  T.flower = function (i) {
    var o = ctx(8, 8), g = o.g, c = ['#E0587A', '#F2E070', '#F2F2F2', '#B58CFF'][i % 4];
    g.fillStyle = '#3F7A34'; g.fillRect(3, 4, 1, 4); g.fillRect(1, 6, 2, 1); g.fillRect(5, 5, 2, 1);
    g.fillStyle = c; g.fillRect(2, 1, 3, 3); g.fillStyle = '#FFF6C0'; g.fillRect(3, 2, 1, 1);
    return o.c;
  };
  T.bush = function () {
    var o = ctx(20, 16), g = o.g, r = PX.rng(9), L = ['#2F5A2E', '#4C8A3A', '#7DB356'];
    [[10, 10, 8, 0], [6, 9, 5, 1], [14, 9, 5, 1], [10, 6, 5, 2]].forEach(function (b) {
      g.fillStyle = L[b[3]]; for (var y = -b[2]; y <= b[2]; y++) for (var x = -b[2]; x <= b[2]; x++) if (x * x + y * y <= b[2] * b[2]) g.fillRect(b[0] + x, b[1] + y, 1, 1);
    });
    for (var i = 0; i < 6; i++) { g.fillStyle = '#E0587A'; g.fillRect((4 + r() * 12) | 0, (4 + r() * 8) | 0, 1, 1); }
    return o.c;
  };
  T.rug = function () {
    var o = ctx(16, 16), g = o.g; g.fillStyle = '#8A2E34'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#E0B24D'; g.fillRect(0, 0, 16, 1); g.fillRect(0, 15, 16, 1);
    g.fillStyle = '#B8484E'; for (var x = 2; x < 14; x += 4) g.fillRect(x, 6, 2, 4);
    return o.c;
  };
  T.mat = function () {
    var o = ctx(16, 16), g = o.g; g.fillStyle = '#7A2E2E'; g.fillRect(0, 0, 16, 16); g.strokeStyle = '#E0B24D'; g.strokeRect(1.5, 1.5, 13, 13);
    g.fillStyle = '#E0B24D'; g.fillRect(7, 5, 2, 6); g.fillRect(5, 9, 6, 2);
    return o.c;
  };
})();
// FIN DE ARCHIVO
