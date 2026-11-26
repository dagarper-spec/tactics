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
  // Fachada de w casillas de ancho. opt: { door: columna o -1, label, glass }
  T.facade = function (w, col, opt) {
    var o = ctx(w * 16, 32), g = o.g, i, wood = '#6B4A2F';
    g.fillStyle = col; g.fillRect(0, 0, w * 16, 32); noise(g, w * 16, 32, col, 21 + w, w * 30);
    g.fillStyle = '#8A8478'; g.fillRect(0, 27, w * 16, 5); noise(g, w * 16, 32, '#8A8478', 5, w * 10);
    g.fillStyle = '#4A3322'; g.fillRect(0, 0, 2, 32); g.fillRect(w * 16 - 2, 0, 2, 32); g.fillRect(0, 0, w * 16, 2); g.fillRect(0, 24, w * 16, 1);   // entramado de madera
    for (i = 1; i < w; i++) g.fillRect(i * 16 - 1, 0, 2, 27);
    for (i = 0; i < w; i++) {
      var cx = i * 16 + 8;
      if (opt.door === i) {
        g.fillStyle = '#2A1B10'; g.fillRect(cx - 6, 8, 12, 19); g.fillStyle = wood; g.fillRect(cx - 5, 9, 10, 18); g.fillStyle = '#8A6038'; g.fillRect(cx - 5, 9, 10, 2);
        g.fillStyle = '#2A1B10'; g.fillRect(cx, 9, 1, 18); g.fillStyle = '#E0B24D'; g.fillRect(cx + 2, 18, 2, 2);
      } else if (!opt.blank) {
        g.fillStyle = '#4A3322'; g.fillRect(cx - 4, 9, 8, 9); g.fillStyle = '#FFD98A'; g.fillRect(cx - 3, 10, 6, 7);
        g.fillStyle = '#4A3322'; g.fillRect(cx, 10, 1, 7); g.fillRect(cx - 3, 13, 6, 1);
        g.fillStyle = '#5A3A22'; g.fillRect(cx - 5, 18, 10, 3);                       // jardinera con flores
        for (var f = 0; f < 5; f++) { g.fillStyle = ['#E0587A', '#F2E070', '#F2F2F2'][(f + i) % 3]; g.fillRect(cx - 4 + f * 2, 17, 2, 2); }
      }
    }
    if (opt.label) {                                                  // rótulo sobre la puerta
      var n = opt.label.length * 5 + 4, x0 = opt.door * 16 + 8 - n / 2;
      g.fillStyle = '#4A3322'; g.fillRect(x0, 1, n, 7); g.fillStyle = '#E8C868'; g.font = 'bold 7px monospace'; g.textBaseline = 'top'; g.fillText(opt.label, x0 + 2, 1);
    }
    return o.c;
  };
  T.roof = function (col) {
    var o = ctx(16, 16), g = o.g; g.fillStyle = col; g.fillRect(0, 0, 16, 16);
    for (var y = 0; y < 16; y += 4) { g.fillStyle = PX.shade(col, 0.7); g.fillRect(0, y, 16, 1); for (var x = (y / 4 % 2) * 4; x < 16; x += 8) g.fillRect(x, y, 1, 4); g.fillStyle = PX.shade(col, 1.15); g.fillRect(0, y + 1, 16, 1); }
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
