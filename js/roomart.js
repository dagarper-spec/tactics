// Compone una sala interior en 2D con recortes del pack: devuelve el fondo (suelo, pared, alfombras) y la lista de objetos con su fila (para ordenar por profundidad).
// Sin THREE: solo canvas. 1 casilla = 16 px. Coordenadas de salida en píxeles de arte.
window.TT = window.TT || {};
(function () {
  var Ar = TT.Areas, T = 16, SIDE = 6, WALLH = 56, BOT = 4;
  var RA = TT.RoomArt = { T: T, SIDE: SIDE, WALLH: WALLH };

  function img(id) { return TT.Pack && TT.Pack.img(id); }
  function cv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').imageSmoothingEnabled = false; return c; }
  function R(g, c, x, y, w, h) { g.fillStyle = c; g.fillRect(x, y, w, h); }
  function tileFill(g, id, x, y, w, h, fallback) {
    var t = img(id); if (!t) { R(g, fallback, x, y, w, h); return; }
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    for (var yy = y; yy < y + h; yy += t.height) for (var xx = x; xx < x + w; xx += t.width) g.drawImage(t, xx, yy);
    g.restore();
  }
  // Recorte de un mueble: trozo (sx, sw) del recorte id, opcionalmente girado.
  function piece(id, sx, sw, flip) {
    var f = img('furn_' + id); if (!f) return null;
    var c = cv(sw || f.width, f.height), g = c.getContext('2d');
    if (flip) { g.translate(c.width, 0); g.scale(-1, 1); }
    g.drawImage(f, sx || 0, 0, c.width, f.height, 0, 0, c.width, f.height); return c;
  }

  // compose(a) -> { base, props: [{ c, x, yb, row }], w, h, ox, oy }
  //   x = borde izquierdo, yb = borde inferior del objeto (píxeles); ox, oy = píxel del centro de la casilla (0,0).
  RA.compose = function (a) {
    var W = a.W, H = a.H, CW = SIDE * 2 + W * T, CH = WALLH + H * T + BOT, base = cv(CW, CH), g = base.getContext('2d'), props = [], x, y;
    function cx(i) { return SIDE + i * T; }
    function ry(j) { return WALLH + j * T; }
    function add(c, left, yb, row) { if (c) props.push({ c: c, x: left, yb: yb, row: row }); }
    tileFill(g, 'room_floor', SIDE, WALLH, CW - SIDE * 2, H * T, '#6A4A2A');
    tileFill(g, 'room_wall', SIDE, 0, CW - SIDE * 2, WALLH, '#BA9E6E');
    R(g, '#2A180C', 0, 0, SIDE, CH); R(g, '#2A180C', CW - SIDE, 0, SIDE, CH);                 // marcos laterales
    R(g, '#7D4C28', 1, 0, SIDE - 3, CH); R(g, '#7D4C28', CW - SIDE + 2, 0, SIDE - 3, CH); R(g, '#A06131', 1, 0, 1, CH); R(g, '#A06131', CW - SIDE + 2, 0, 1, CH);
    R(g, '#2A180C', 0, CH - BOT, CW, BOT); R(g, '#7D4C28', 0, CH - BOT + 1, CW, 2);
    function run(c, i, j) { var n = 0; while (Ar.ch(a, i - 1 - n, j) === c) n++; return n; }    // casillas iguales a la izquierda
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
      var c = Ar.ch(a, x, y), L = Ar.ch(a, x - 1, y) === c, Rr = Ar.ch(a, x + 1, y) === c, px = cx(x), yb = ry(y + 1), k, f;
      if (c === 'r') {                                                                           // alfombra: relleno verde con borde amarillo en los lados libres
        R(g, '#48621E', px, ry(y), T, T);
        if (Ar.ch(a, x, y - 1) !== 'r') R(g, '#A0831C', px, ry(y), T, 2);
        if (Ar.ch(a, x, y + 1) !== 'r') R(g, '#A0831C', px, ry(y) + T - 2, T, 2);
        if (!L) R(g, '#A0831C', px, ry(y), 2, T);
        if (!Rr) R(g, '#A0831C', px + T - 2, ry(y), 2, T);
      } else if (c === 'e') {                                                                    // felpudo de la salida
        R(g, '#2A180C', px + 1, ry(y) + 3, T - 2, T - 5); R(g, '#8A5A32', px + 2, ry(y) + 4, T - 4, T - 7); R(g, '#B8814A', px + 4, ry(y) + 6, T - 8, 1);
      } else if (c === 'k') {                                                                    // armarios contra la pared (3 módulos de 16 px)
        add(piece('shelf', (x % 3) * 16, T), px, yb, y);
      } else if (c === 'c') {                                                                    // mostrador: extremo izquierdo, tramos y extremo derecho (girado)
        add(!L ? piece('counter', 0, T, false) : !Rr ? piece('counter', 0, T, true) : piece('counter', T, T), px, yb, y);
      } else if (c === 's' || c === 'o' || c === 'y') {
        f = c === 's' ? piece('stool') : c === 'o' ? piece('barrel') : piece('plant' + ((x + y) % 4));
        if (f) add(f, px + (T - f.width) / 2, yb, y);
      } else if (c === 't' || c === 'g' || c === 'a' || c === 'p') {                             // objetos de 2 (o 3) casillas: se dibujan al llegar a su primera casilla
        var id = { t: 'table', g: 'wardrobe', a: 'chest', p: 'hearth' }[c], n = c === 'p' ? 3 : 2;
        if (run(c, x, y) % n) continue;
        k = 1; while (k < n && Ar.ch(a, x + k, y) === c) k++;
        f = c === 'p' ? (img('furn_hearth') && (function () { var s = img('furn_hearth'), d = cv(s.width, 58); d.getContext('2d').drawImage(s, 0, s.height - 58, s.width, 58, 0, 0, s.width, 58); return d; })()) : piece(id);
        if (f) add(f, px + (k * T - f.width) / 2, yb - (c === 'a' ? 2 : 0), y);
      }
    }
    return { base: base, props: props, w: CW, h: CH, ox: SIDE + T / 2, oy: WALLH + T / 2 };
  };
})();
// FIN DE ARCHIVO
