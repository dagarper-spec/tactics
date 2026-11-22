// Generador de pixel art por código (texturas pequeñas, filtro "nearest").
window.TT = window.TT || {};
(function () {
  var PX = TT.PX = {};

  PX.rng = function (seed) {
    var s = seed >>> 0 || 1;
    return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  };
  PX.rgb = function (hex) {
    var n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  // Multiplica el brillo de un color '#RRGGBB' y devuelve 'rgb(...)'.
  PX.shade = function (hex, f) {
    var c = PX.rgb(hex);
    return 'rgb(' + Math.min(255, Math.round(c[0] * f)) + ',' + Math.min(255, Math.round(c[1] * f)) + ',' + Math.min(255, Math.round(c[2] * f)) + ')';
  };
  PX.canvas = function (w, h) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  };
  PX.tex = function (canvas, repeat) {
    var t = new THREE.CanvasTexture(canvas);
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    t.generateMipmaps = false;
    if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  };

  // Dibuja filas de texto con un mapa letra->color. '.' es transparente.
  PX.fromRows = function (rows, map, scale) {
    scale = scale || 1;
    var w = rows[0].length, h = rows.length;
    var c = PX.canvas(w * scale, h * scale), g = c.getContext('2d');
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var k = rows[y].charAt(x);
        if (k === '.' || !map[k]) continue;
        g.fillStyle = map[k];
        g.fillRect(x * scale, y * scale, scale, scale);
      }
    }
    return c;
  };

  // Cara superior: hierba/tierra con motas claras y oscuras.
  PX.topTile = function (hex, seed, size) {
    size = size || 16;
    var r = PX.rng(seed), c = PX.canvas(size, size), g = c.getContext('2d');
    g.fillStyle = hex; g.fillRect(0, 0, size, size);
    for (var i = 0; i < size * 2; i++) {
      var f = r() < 0.5 ? 0.88 : 1.1;
      g.fillStyle = PX.shade(hex, f);
      g.fillRect((r() * size) | 0, (r() * size) | 0, 1, 1);
    }
    for (i = 0; i < 6; i++) { // briznas
      g.fillStyle = PX.shade(hex, 1.2);
      var x = (r() * size) | 0, y = (r() * (size - 2)) | 0;
      g.fillRect(x, y, 1, 2);
    }
    return c;
  };

  // Lateral: tierra en estratos con una franja de hierba arriba.
  PX.sideTile = function (hex, dirt, seed, size) {
    size = size || 16;
    var r = PX.rng(seed), c = PX.canvas(size, size), g = c.getContext('2d');
    g.fillStyle = dirt; g.fillRect(0, 0, size, size);
    for (var y = 0; y < size; y += 4) {
      g.fillStyle = PX.shade(dirt, y % 8 ? 0.9 : 1.05);
      g.fillRect(0, y + 3, size, 1);
    }
    for (var i = 0; i < size; i++) {
      g.fillStyle = PX.shade(dirt, r() < 0.5 ? 0.8 : 1.15);
      g.fillRect((r() * size) | 0, (r() * size) | 0, 1, 1);
    }
    g.fillStyle = hex; g.fillRect(0, 0, size, 4);
    for (i = 0; i < size; i++) { // borde irregular de la hierba
      if (r() < 0.45) g.fillRect(i, 4, 1, 1 + ((r() * 2) | 0));
    }
    g.fillStyle = PX.shade(hex, 0.8); g.fillRect(0, 3, size, 1);
    return c;
  };

  // Piedra para rocas y cimientos.
  PX.stoneTile = function (top, seed, size) {
    size = size || 16;
    var r = PX.rng(seed), c = PX.canvas(size, size), g = c.getContext('2d');
    g.fillStyle = top; g.fillRect(0, 0, size, size);
    for (var y = 0; y < size; y += 5) {
      g.fillStyle = PX.shade(top, 0.75); g.fillRect(0, y, size, 1);
      var off = (y / 5) % 2 ? 4 : 0;
      for (var x = off; x < size; x += 8) g.fillRect(x, y, 1, 5);
    }
    for (var i = 0; i < 14; i++) {
      g.fillStyle = PX.shade(top, r() < 0.5 ? 0.9 : 1.12);
      g.fillRect((r() * size) | 0, (r() * size) | 0, 1, 1);
    }
    return c;
  };

  // Agua tileable: bandas onduladas y espuma dispersa.
  PX.waterTile = function (base, foam, seed, size) {
    size = size || 32;
    var r = PX.rng(seed), c = PX.canvas(size, size), g = c.getContext('2d');
    g.fillStyle = base; g.fillRect(0, 0, size, size);
    for (var y = 0; y < size; y += 4) {
      g.fillStyle = PX.shade(base, 1.18);
      for (var x = 0; x < size; x++) {
        var yy = y + Math.round(Math.sin((x / size) * Math.PI * 4 + y) * 1);
        g.fillRect(x, (yy + size) % size, 1, 1);
      }
    }
    g.fillStyle = foam;
    for (var i = 0; i < 9; i++) {
      var fx = (r() * (size - 3)) | 0, fy = (r() * size) | 0;
      g.fillRect(fx, fy, 2 + ((r() * 2) | 0), 1);
    }
    return c;
  };

  // Tablones del puente.
  PX.plankTile = function (wood, seed, size) {
    size = size || 16;
    var r = PX.rng(seed), c = PX.canvas(size, size), g = c.getContext('2d');
    g.fillStyle = wood.mid; g.fillRect(0, 0, size, size);
    for (var x = 0; x < size; x += 4) {
      g.fillStyle = wood.dark; g.fillRect(x, 0, 1, size);
      g.fillStyle = PX.shade(wood.light, 0.95 + r() * 0.1); g.fillRect(x + 1, 0, 1, size);
    }
    for (var i = 0; i < 8; i++) {
      g.fillStyle = wood.dark; g.fillRect((r() * size) | 0, (r() * size) | 0, 1, 1);
    }
    return c;
  };

  // Punto de luz suave (luciérnagas, brillos, niebla).
  PX.glowTex = function (size, hard) {
    size = size || 32;
    var c = PX.canvas(size, size), g = c.getContext('2d');
    var gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(hard ? 0.5 : 0.25, 'rgba(255,255,255,' + (hard ? 0.9 : 0.5) + ')');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, size, size);
    var t = new THREE.CanvasTexture(c);
    return t;
  };

  // Degradado de cielo (de arriba a abajo).
  PX.skyTex = function (top, low) {
    var c = PX.canvas(2, 256), g = c.getContext('2d');
    var gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, top); gr.addColorStop(0.55, PX.shade(low, 0.55)); gr.addColorStop(1, low);
    g.fillStyle = gr; g.fillRect(0, 0, 2, 256);
    return new THREE.CanvasTexture(c);
  };
})();
// FIN DE ARCHIVO
