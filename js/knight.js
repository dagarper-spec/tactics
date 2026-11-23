// Guerrero "caballero" 48x60: dibujo propio con más detalle (hombreras, tabardo, capa, espada con ángulo). Piloto de calidad.
window.TT = window.TT || {};
(function () {
  var A = TT.Art, W = 48, H = 60, FY = 56, R = A.ramp;
  var ST = R('#B4BCC9'), S2 = R('#8D96A8'), GD = R('#E0B24D'), RD = R('#B33A3A'), RK = R('#7E2530'), SK = R('#EDBB90'), HR = R('#D9B26A'), LT = R('#6B4A2F');
  // Parámetros por pose: b = bajada del cuerpo, l/r = pierna levantada, al = brazo izq., c = vaivén de la capa, sw = [mano x, y, ángulo].
  var P = {
    idle0: { b: 0, l: 0, r: 0, al: 0, c: 0, sw: [35, 38, 6] }, idle1: { b: 1, l: 0, r: 0, al: 1, c: 1, sw: [35, 39, 6] },
    walk0: { b: 0, l: 0, r: 2, al: 1, c: 1, sw: [35, 37, 14] }, walk1: { b: -1, l: 1, r: 1, al: 0, c: 0, sw: [35, 37, 8] },
    walk2: { b: 0, l: 2, r: 0, al: -1, c: -1, sw: [35, 38, 2] }, walk3: { b: -1, l: 1, r: 1, al: 0, c: 0, sw: [35, 37, 8] },
    atk0: { b: -1, l: 0, r: 0, al: 0, c: 2, sw: [35, 22, 12] }, atk1: { b: 2, l: 0, r: 0, al: 2, c: -2, sw: [37, 34, 160] }
  };
  function mx(back, x) { return back ? W - 1 - x : x; }

  function cape(g, back, p) {
    var by = p.b, y0 = (back ? 20 : 22) + by, yE = back ? 50 : 49;
    for (var y = y0; y <= yE + 1; y++) {
      var half = 9 + Math.floor((y - y0) * (back ? 0.15 : 0.12)), sway = Math.round(p.c * (y - y0) / 28);
      var x0 = 23 - half + sway, x1 = 24 + half + sway;
      if (y === yE + 1) { for (var h = x0; h <= x1; h++) if ((h * 7) % 3 !== 0) A.px(g, h, y, RK[4]); continue; }
      for (var x = x0; x <= x1; x++) {
        var k = (x - x0) % 6, c = x === x0 ? 1 : x >= x1 - 1 ? 4 : (k === 3 || k === 4 ? 3 : 2);
        A.px(g, x, y, c === 1 ? RD[2] : RK[c]);
        if (c === 2 && k === 1) A.px(g, x, y, RD[3]);
      }
    }
    if (back) { A.px(g, 20, 19 + by, GD[2], 8, 2); A.px(g, 23, 21 + by, GD[1], 2, 1); }
  }

  function legs(g, p) {
    [[18, p.l], [25, p.r]].forEach(function (L) {
      var bot = FY - L[1];
      A.box(g, L[0], 38, 6, bot - 38 - 3, S2);
      A.blob(g, L[0] - 1, 44, 8, 5, ST); A.px(g, L[0] + 1, 45, ST[0], 2, 1);                      // rodillera
      A.box(g, L[0] - 1, bot - 4, 8, 5, R('#4A3828'), true);                                      // bota
      A.px(g, L[0], bot - 4, GD[2], 6, 1); A.px(g, L[0], bot - 3, '#7A5A3A', 2, 1);
    });
  }

  // Brazo izquierdo (fijo) y derecho (sigue a la mano de la espada).
  function arm(g, x, al, b, hy) {
    var gy = hy === undefined ? 33 + b + al : hy - 3;
    if (gy > 29) A.box(g, x + 1, 25 + b, 6, gy - 25 - b + 3, S2); else A.box(g, x + 1, gy + 3, 6, 6, S2);
    A.box(g, x, gy, 8, 7, ST, true);
    A.px(g, x, gy, GD[2], 8, 1); A.px(g, x + 1, gy + 5, S2[3], 6, 1); A.px(g, x + 1, gy + 2, ST[0], 2, 1);
  }

  function head(g, back, b) {
    if (back) {
      A.blob(g, 16, 3 + b, 16, 15, HR); A.px(g, 20, 14 + b, HR[3], 8, 2);
      [[20, 6], [24, 5], [27, 8], [19, 10], [23, 10], [26, 12]].forEach(function (q) { A.px(g, q[0], q[1] + b, HR[3], 1, 3); A.px(g, q[0] + 1, q[1] + b, HR[1], 1, 2); });
      return;
    }
    A.blob(g, 17, 5 + b, 14, 13, SK);
    var y = 12 + b;
    [20, 26].forEach(function (x) { A.px(g, x - 1, y, '#2B2142', 2, 2); A.px(g, x - 1, y, '#7A68B0'); });
    A.px(g, 19, y + 2, '#F4B3A0'); A.px(g, 28, y + 2, '#F4B3A0'); A.px(g, 23, y + 3, '#C46F5E', 2, 1);
    [[19, 2], [23, 1], [27, 2]].forEach(function (q) { A.px(g, q[0], q[1] + b, HR[1], 2, 2); });
    A.stamp(g, 16, 3 + b, ['....01122222....', '..0111222222223.', '.01112222222233.', '.01122222222233.', '.0112222.2222233', '.011222...222233', '.01122.....22233', '.0112.......2233', '.011.........233', '.01..........23.'], HR);
  }

  function pauldrons(g, b) {
    [8, 30].forEach(function (x) {
      A.blob(g, x, 18 + b, 10, 9, ST);
      A.px(g, x + 2, 25 + b, GD[2], 6, 1); A.px(g, x + 3, 26 + b, GD[3], 4, 1);   // ribete dorado
      A.px(g, x + 2, 21 + b, ST[0], 2, 1); A.px(g, x + 6, 21 + b, ST[0], 1, 1);   // remaches
    });
  }

  function body(g, p) {
    var b = p.b;
    A.box(g, 17, 20 + b, 14, 14 - b, ST, true);
    A.px(g, 23, 21 + b, ST[0], 2, 9);                                     // cresta central
    A.box(g, 19, 17 + b, 10, 4, ST, true); A.px(g, 19, 20 + b, GD[2], 10, 1);   // gorjal
    A.box(g, 20, 22 + b, 8, 22 - b, RD, false);                           // tabardo
    A.px(g, 20, 43, GD[2], 8, 1); A.px(g, 21, 44, RK[3], 6, 1);
    A.stamp(g, 22, 27 + b, ['.gg.', 'gGGg', '.gg.', '.gg.'], null, { g: '#E0B24D', G: '#F5D060' });
    A.box(g, 16, 34, 16, 6, ST, true); A.px(g, 16, 34, LT[2], 16, 1); A.px(g, 16, 35, LT[3], 16, 1);   // cinturón y faldón
    for (var i = 0; i < 3; i++) A.px(g, 18 + i * 5, 36, S2[3], 1, 3);
    A.px(g, 16, 39, GD[2], 16, 1); A.px(g, 22, 34, GD[2], 4, 2);
    A.box(g, 21, 36, 6, 7, RD, false); A.px(g, 21, 42, GD[2], 6, 1);
  }

  TT.Specs.warrior = {
    w: W, h: H, sc: 1 / 46,
    draw: function (g, back, pose) {
      var p = P[pose] || P.idle0, b = p.b, sw = p.sw, hx = mx(back, sw[0]), th = back ? -sw[2] : sw[2];
      if (!back) { cape(g, back, p); legs(g, p); body(g, p); } else { legs(g, p); cape(g, back, p); }
      var rx = back ? 9 : 31, lx = back ? 31 : 9;
      arm(g, lx, p.al, b); arm(g, rx, 0, b, sw[1]);
      pauldrons(g, b);
      head(g, back, b);
      A.sword(g, hx, sw[1], th, 22);
    }
  };
})();
// FIN DE ARCHIVO
