// Dibujo de unidades 40x48: figura genérica (piernas, torso, brazos, cabeza) + detalles de cada clase (TT.Specs).
// Vistas de frente y de espaldas; poses: idle0, idle1, walk0, walk1, atk. El espejo lo hace la vista.
window.TT = window.TT || {};
(function () {
  var PX = TT.PX, A = TT.Art, W = 40, H = 48, EYE = '#2B2142';
  var U = TT.UnitArt = { cache: {}, texs: {}, W: W, H: H };
  var Specs = TT.Specs = TT.Specs || {};
  var POSES = {
    idle0: { bob: 0, l: 0, r: 0, al: 0, ar: 0 }, idle1: { bob: 1, l: 0, r: 0, al: 0, ar: 0 },
    walk0: { bob: 0, l: 2, r: 0, al: 1, ar: -1 }, walk1: { bob: 0, l: 0, r: 2, al: -1, ar: 1 },
    atk: { bob: 0, l: 0, r: 0, al: 0, ar: -6, atk: 1 }
  };
  U.poses = Object.keys(POSES);

  function legs(g, S, back, p, by) {
    var pa = A.ramp(S.pants || S.cloth), bo = A.ramp(S.boots || '#5A3A28'), i, y;
    if (S.robe) {
      var R = A.ramp(S.cloth), T = A.ramp(S.trim || S.cloth);
      for (y = 29; y <= 44; y++) {
        var half = 6 + Math.floor((y - 29) * 0.36), x0 = 20 - half, x1 = 19 + half, hem = y >= 43;
        for (var x = x0; x <= x1; x++) {
          var c = x === x0 ? 1 : x >= x1 - 1 ? 3 : ((x - x0) % 5 === 3 ? 3 : 2);
          if (x === x1) c = 4;
          A.px(g, x, y, hem ? T[c === 4 ? 4 : c === 3 ? 3 : 2] : R[c]);
        }
      }
      A.box(g, 15, 44 - p.l, 4, 2, bo, true); A.box(g, 21, 44 - p.r, 4, 2, bo, true);
      return;
    }
    [[15, p.l, 14], [21, p.r, 21]].forEach(function (L) {
      var b = 44 - L[1];
      A.box(g, L[0], 32, 5, b - 32 - 2, pa);
      A.box(g, L[2], b - 3, 6, 4, bo, true);
      A.px(g, L[2] + 1, b - 3, bo[1], 4, 1);
    });
  }

  function arm(g, S, x, ao, by, hand) {
    var sl = A.ramp(S.sleeve || S.cloth), y0 = 20 + by + ao, y1 = 29 + ao;
    A.box(g, x, y0, 3, y1 - y0 + 1, sl, true);
    if (S.cuff) A.px(g, x, y1 - 1, A.ramp(S.cuff)[2], 3, 1);
    if (hand !== false) A.box(g, x, y1 + 1, 3, 2, A.ramp(S.skin || '#EDBB90'), true);
  }

  function head(g, S, back, by) {
    var sk = A.ramp(S.skin || '#EDBB90'), hr = A.ramp(S.hair || '#5A3A22');
    if (back) {
      A.blob(g, 14, 7 + by, 12, 12, sk);
      A.blob(g, 13, 5 + by, 14, 13, hr);
      if (S.hairBack) A.box(g, 14, 15 + by, 12, 8, hr, true);
      return;
    }
    A.blob(g, 14, 7 + by, 12, 12, sk);
    var y = 13 + by;
    [16, 22].forEach(function (x) {
      A.px(g, x, y, S.eye || EYE, 2, 2); A.px(g, x, y, S.eye ? '#FFE0A0' : '#7A68B0');
    });
    A.px(g, 15, y + 2, '#F4B3A0'); A.px(g, 24, y + 2, '#F4B3A0');
    A.px(g, 19, y + 3, '#C46F5E', 2, 1);
    if (S.hairStyle !== 'none') A.stamp(g, 13, 5 + by, FRINGE[S.hairStyle || 'short'], hr);
  }
  // Flequillos de 14 columnas (13..26), filas desde y = 5.
  var FRINGE = {
    short: ['...11222222...', '..1122222223..', '.112222222233.', '.112222222233.', '.12222.2222233', '.1222...22233.', '.122.....2233.', '.12.......23..'],
    swept: ['....11222222..', '..1122222222..', '.112222222233.', '.112222222233.', '1122222.222233', '.12222...22233', '.1222.....2233', '.122.......23.'],
    long: ['...11222222...', '..1122222223..', '.112222222233.', '.112222222233.', '.1222222.22233', '.122222...2233', '.1222......233', '.122.......233', '.12........23.', '.12........23.']
  };

  // Dibuja una figura completa.
  function figure(g, S, back, p) {
    var by = p.bob, cl = A.ramp(S.cloth), sk = A.ramp(S.skin || '#EDBB90'), bt = A.ramp(S.belt || '#5A3A28');
    if (S.pre) S.pre(g, back, p, by);
    legs(g, S, back, p, by);
    if (S.hairBack && !back) A.blob(g, 12, 6 + by, 16, 17, A.ramp(S.hair));
    A.box(g, 14, 19 + by, 12, 12 - by, cl, true);
    if (!S.robe) { A.px(g, 14, 29, bt[2], 12, 1); A.px(g, 14, 30, bt[3], 12, 1); if (!back) A.px(g, 19, 29, '#E0B24D', 2, 2); }
    if (S.post) S.post(g, back, p, by);
    var ar = p.ar, al = p.al, cast = S.cast && p.atk;
    arm(g, S, 11, cast ? -6 : al, by); arm(g, S, 26, ar, by);
    if (S.pads) { var pd = A.ramp(S.pads); A.blob(g, 10, 18 + by, 6, 5, pd); A.blob(g, 24, 18 + by, 6, 5, pd); }
    head(g, S, back, by);
    if (S.gear) S.gear(g, back, p, by);
    var o = S.off, pr = S.prop;
    if (o) drawProp(g, o, back, back ? 27 : 12, 30 + (cast ? -6 : al), 0);
    if (pr) drawProp(g, pr, back, back ? 12 : 27, 30 + ar, p.atk ? -2 : 0);
  }

  // Objeto en la mano: rows con letras de color (mapa m). grip = [columna, fila] que coincide con la mano.
  function drawProp(g, o, back, hx, hy, dy) {
    var rows = back ? A.flip(o.rows) : o.rows, gx = back ? o.rows[0].length - 1 - o.grip[0] : o.grip[0];
    var m = back && o.bmap ? o.bmap : o.map;
    A.stamp(g, hx - gx, hy - o.grip[1] + dy, rows, null, m);
  }

  U.canvas = function (type, back, pose) {
    pose = pose || 'idle0';
    var k = type + (back ? 'B' : 'F') + pose;
    if (!U.cache[k]) {
      var c = PX.canvas(W, H), g = c.getContext('2d');
      figure(g, Specs[type], !!back, POSES[pose]);
      U.cache[k] = A.outline(c);
    }
    return U.cache[k];
  };
  U.tex = function (type, back, pose) {
    var k = type + (back ? 'B' : 'F') + (pose || 'idle0');
    return U.texs[k] || (U.texs[k] = PX.tex(U.canvas(type, back, pose)));
  };
})();
// FIN DE ARCHIVO
