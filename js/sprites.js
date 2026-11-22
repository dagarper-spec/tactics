// Sprites de decorado en pixel art (árbol, roca, antorcha, llama, bandera, sombra).
window.TT = window.TT || {};
(function () {
  var PX = TT.PX, P = TT.PAL;
  var OUT = '#1B1A2E';
  var S = TT.Sprites = {};

  // Contorno de 1 px alrededor de los píxeles opacos.
  S.outline = function (src, color) {
    var w = src.width, h = src.height, c = PX.canvas(w + 2, h + 2), g = c.getContext('2d');
    var d = src.getContext('2d').getImageData(0, 0, w, h).data;
    g.fillStyle = color || OUT;
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        if (d[(y * w + x) * 4 + 3] < 128) continue;
        g.fillRect(x, y + 1, 1, 1); g.fillRect(x + 2, y + 1, 1, 1);
        g.fillRect(x + 1, y, 1, 1); g.fillRect(x + 1, y + 2, 1, 1);
      }
    }
    g.drawImage(src, 1, 1);
    return c;
  };

  // Bola sombreada con luz arriba-izquierda y 3 tonos.
  function blob(g, cx, cy, r, pal, rnd) {
    for (var y = -r; y <= r; y++) {
      for (var x = -r; x <= r; x++) {
        var d = Math.sqrt(x * x + y * y);
        if (d > r + (rnd() < 0.3 ? 0.4 : -0.3)) continue;
        var l = (-x - y) / (r * 1.4) + (rnd() - 0.5) * 0.35;
        g.fillStyle = l > 0.35 ? pal.light : l > -0.25 ? pal.mid : pal.dark;
        g.fillRect(cx + x, cy + y, 1, 1);
      }
    }
  }

  S.tree = function (seed) {
    var r = PX.rng(seed), c = PX.canvas(24, 32), g = c.getContext('2d');
    g.fillStyle = P.wood.mid; g.fillRect(10, 18, 4, 12);
    g.fillStyle = P.wood.dark; g.fillRect(13, 18, 1, 12); g.fillRect(9, 28, 6, 2);
    g.fillStyle = P.wood.light; g.fillRect(10, 19, 1, 9);
    blob(g, 12, 14, 8, P.leaf, r);
    blob(g, 7, 12, 5, P.leaf, r);
    blob(g, 17, 12, 5, P.leaf, r);
    blob(g, 12, 7, 6, P.leaf, r);
    return S.outline(c, '#24452A');
  };

  S.rock = function (seed) {
    var r = PX.rng(seed), c = PX.canvas(18, 14), g = c.getContext('2d');
    var pal = { light: '#B0AA9C', mid: P.stone.top, dark: P.stone.side };
    blob(g, 9, 8, 5, pal, r);
    blob(g, 5, 9, 3, pal, r);
    blob(g, 13, 9, 3, pal, r);
    g.fillStyle = pal.dark; g.fillRect(3, 12, 12, 1);
    return S.outline(c, '#4A463F');
  };

  S.torch = function () {
    return S.outline(PX.fromRows([
      '.kk.', 'klwk', 'klwk', '.kk.', '.wk.', '.wk.', '.wk.', '.wk.', '.wk.', '.wk.', '.wk.', 'kwwk'
    ], { k: P.wood.dark, w: P.wood.mid, l: P.wood.light }), '#3A2818');
  };

  S.flame = function (frame) {
    var a = frame ? [
      '..e...', '.eme..', '.emme.', 'emcme.', 'emccme', 'emccme', '.emme.'
    ] : [
      '...e..', '..eme.', '.emme.', '.emcme', 'emccme', 'emccme', '.emme.'
    ];
    return PX.fromRows(a, { e: P.flame.edge, m: P.flame.mid, c: P.flame.core });
  };

  S.flag = function () {
    var rows = [
      'ppppppppppp', 'pRRRRRRRRRR', 'pRRRRRRRRRR', 'pRRRGGRRRRR', 'pRRGGGGRRRR', 'pRRRGGRRRRR',
      'pRRRRRRRRRR', 'pRRRRRRRRRR', 'pRRRRRRRRRR', 'p.R.R.R.R.R', 'p', 'p', 'p', 'p'
    ];
    var c = PX.fromRows(rows.map(function (s) { return (s + '...........').slice(0, 11); }), {
      p: P.wood.mid, R: P.side.enemy, G: P.gold || '#C9A24B'
    });
    return c;
  };

  // Sombra circular suave bajo los objetos (sustituye sombras de sprites).
  S.shadow = function () { return PX.glowTex(32, true); };
})();
// FIN DE ARCHIVO
