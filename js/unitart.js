// Dibujo de unidades 40x48: figura genérica (piernas, torso, brazos, cabeza) + detalles de cada clase (TT.Specs).
// Vistas de frente y de espaldas; poses: idle0, idle1, walk0, walk1, atk. El espejo lo hace la vista.
window.TT = window.TT || {};
(function () {
  var PX = TT.PX, A = TT.Art, W = 40, H = 48, EYE = '#2B2142';
  var U = TT.UnitArt = { cache: {}, texs: {}, W: W, H: H };
  var Specs = TT.Specs = TT.Specs || {};
  var POSES = {
    idle0: { bob: 0, l: 0, r: 0, al: 0, ar: 0 }, idle1: { bob: 1, l: 0, r: 0, al: 0, ar: 0 },
    walk0: { bob: 0, l: 3, r: 0, al: 2, ar: -2 }, walk1: { bob: 1, l: 1, r: 1, al: 0, ar: 0 },
    walk2: { bob: 0, l: 0, r: 3, al: -2, ar: 2 }, walk3: { bob: 1, l: 1, r: 1, al: 0, ar: 0 },
    atk0: { bob: 0, l: 0, r: 0, al: 0, ar: -6, atk: 1 }, atk1: { bob: 1, l: 0, r: 0, al: 0, ar: -3, atk: 1 },
    cast: { bob: 0, l: 0, r: 0, al: 0, ar: -7, atk: 1, both: 1 }
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
    var ar = p.ar, al = p.al, cast = (S.cast || p.both) && p.atk;
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

  // Hoja de sprites: elige el fotograma de la pose y la orientación (F, FS, S, BS, B), con alternativas si falta.
  function frameFor(d, back, pose, dir) {
    var f = d.frames, s = dir || (back ? 'B' : 'F');
    var chain = s === 'FS' ? ['FS', 'F'] : s === 'BS' ? ['BS', 'B'] : s === 'S' ? ['S', back ? 'B' : 'F'] : [s];
    var ps = [pose === 'cast' ? 'atk0' : pose];
    if (pose.indexOf('walk') === 0 || pose === 'idle1') ps.push('idle0');
    if (f[ps[0]]) return ps[0];
    for (var i = 0; i < chain.length; i++) for (var k = 0; k < ps.length; k++) if (f[ps[k] + chain[i]]) return ps[k] + chain[i];
    return 'idle0' + (back ? 'B' : 'F');
  }
  U.has = function (type, pose) { return TT.Sheets.has(type) ? !!(TT.SheetData[type].frames[pose] || TT.SheetData[type].frames[pose + 'F']) : false; };
  // Retrato para la cola de turnos: cabeza y torso, 28x34.
  U.portrait = function (type, src) {
    var c = PX.canvas(28, 34), g = c.getContext('2d'), z = TT.Sheets.has(type) ? TT.SheetData[type] : null;
    if (z) { var q = z.por || [28, 34, 55]; g.drawImage(src, z.cell / 2 - q[0] / 2, z.feet - q[2], q[0], q[1], 0, 0, 28, 34); } else g.drawImage(src, (src.width - 28) / 2, 0, 28, 34, 0, 0, 28, 34);
    return c;
  };

  U.canvas = function (type, back, pose, dir) {
    pose = pose || 'idle0';
    if (TT.Sheets.has(type)) {
      var d = TT.SheetData[type], fn = frameFor(d, back, pose, dir), k2 = type + '|' + fn;
      if (!U.cache[k2]) {
        var f = d.frames[fn], cv = PX.canvas(d.cell, d.cell);
        cv.getContext('2d').drawImage(TT.Sheets.img[type], f[0] * d.cell, f[1] * d.cell, d.cell, d.cell, 0, 0, d.cell, d.cell);
        U.cache[k2] = cv;
      }
      return U.cache[k2];
    }
    var k = type + (back ? 'B' : 'F') + pose;
    if (!U.cache[k]) {
      var Sp = Specs[type], c = PX.canvas(Sp.w || W, Sp.h || H), g = c.getContext('2d');
      if (Sp.draw) Sp.draw(g, !!back, pose); else figure(g, Sp, !!back, POSES[pose] || POSES.idle0);
      U.cache[k] = A.outline(c);
    }
    return U.cache[k];
  };
  U.size = function (type) {
    if (TT.Sheets.has(type)) { var d = TT.SheetData[type]; return { w: d.cell, h: d.cell, s: d.sc || 1 / 42, m: d.cell - d.feet - 1 }; }
    var Sp = Specs[type]; return { w: Sp.w || W, h: Sp.h || H, s: Sp.sc || 1 / 40 }; };
  U.tex = function (type, back, pose, dir) {
    var k = type + (back ? 'B' : 'F') + (pose || 'idle0');
    if (TT.Sheets.has(type)) k = type + '|' + frameFor(TT.SheetData[type], back, pose || 'idle0', dir);
    return U.texs[k] || (U.texs[k] = PX.tex(U.canvas(type, back, pose, dir)));
  };
})();
// FIN DE ARCHIVO
