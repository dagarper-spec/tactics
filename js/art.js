// Herramientas de pixel art para personajes: rampas de color con cambio de tono, formas sombreadas y contorno selectivo.
window.TT = window.TT || {};
(function () {
  var PX = TT.PX, A = TT.Art = { rc: {} };

  function hx(c) { return '#' + c.map(function (v) { return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
  // Mezcla dos colores '#RRGGBB'; t = 0 devuelve a, t = 1 devuelve b.
  A.mix = function (a, b, t) {
    var x = PX.rgb(a), y = PX.rgb(b);
    return hx([0, 1, 2].map(function (i) { return Math.round(x[i] + (y[i] - x[i]) * t); }));
  };
  // Rampa [brillo, luz, base, sombra, oscuro]: las sombras tiran a violeta y las luces a cálido.
  A.ramp = function (hex) {
    return A.rc[hex] || (A.rc[hex] = [A.mix(hex, '#FFFFFF', 0.5), A.mix(hex, '#FFF0C8', 0.28), hex,
      A.mix(hex, '#3B3470', 0.36), A.mix(hex, '#1B1838', 0.62)]);
  };
  A.px = function (g, x, y, c, w, h) { g.fillStyle = c; g.fillRect(x, y, w || 1, h || 1); };

  // Elipse sombreada con luz arriba-izquierda.
  A.blob = function (g, x, y, w, h, R) {
    for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) {
      var dx = (i + 0.5 - w / 2) / (w / 2), dy = (j + 0.5 - h / 2) / (h / 2);
      if (dx * dx + dy * dy > 1) continue;
      var l = -(dx + dy) * 0.7;
      A.px(g, x + i, y + j, R[l > 0.8 ? 0 : l > 0.25 ? 1 : l > -0.35 ? 2 : l > -0.8 ? 3 : 4]);
    }
  };
  // Caja con luz a la izquierda y arriba, sombra a la derecha y abajo. round = recorta las esquinas.
  A.box = function (g, x, y, w, h, R, round) {
    for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) {
      if (round && (i === 0 || i === w - 1) && (j === 0 || j === h - 1)) continue;
      var c = 2;
      if (i === 0) c = 1; else if (i === w - 1) c = 3; else if (w > 4 && i === w - 2) c = 3;
      if (j === 0 && c === 2) c = 1;
      if (j === h - 1 && h > 3) c = Math.min(4, c + 1);
      A.px(g, x + i, y + j, R[c]);
    }
  };
  // Estampa filas de texto: letras 0-4 = índices de la rampa R (0 brillo ... 4 oscuro), otras = mapa m.
  A.stamp = function (g, x, y, rows, R, m) {
    for (var j = 0; j < rows.length; j++) for (var i = 0; i < rows[j].length; i++) {
      var k = rows[j].charAt(i);
      if (k === '.') continue;
      var c = k >= '0' && k <= '4' ? R[+k] : m && m[k];
      if (c) A.px(g, x + i, y + j, c);
    }
  };
  // Espeja filas de texto (para la vista de espaldas).
  A.flip = function (rows) { return rows.map(function (r) { return r.split('').reverse().join(''); }); };

  // Línea gruesa (cuadrados de t x t a lo largo del trazo).
  A.line = function (g, x0, y0, x1, y1, c, t) {
    t = t || 1; var n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1) * 2;
    for (var i = 0; i <= n; i++) A.px(g, Math.round(x0 + (x1 - x0) * i / n - (t - 1) / 2), Math.round(y0 + (y1 - y0) * i / n - (t - 1) / 2), c, t, t);
  };
  // Espada en la mano (hx,hy) con ángulo th (grados, 0 = arriba, positivo = hacia la derecha) y largo L.
  A.sword = function (g, hx, hy, th, L) {
    var r = th * Math.PI / 180, dx = Math.sin(r), dy = -Math.cos(r), px = Math.cos(r), py = Math.sin(r);
    function at(d, o) { return [hx + dx * d + px * o, hy + dy * d + py * o]; }
    var a = at(5, 0), b = at(L, 0), c;
    A.line(g, a[0], a[1], b[0], b[1], '#8792A3', 3);                         // filo en sombra
    c = at(5, -1); b = at(L - 1, -1); A.line(g, c[0], c[1], b[0], b[1], '#C9D0DA', 2);
    c = at(6, -1); b = at(L - 2, -1); A.line(g, c[0], c[1], b[0], b[1], '#F4F7FB', 1);
    c = at(-3, 0); b = at(5, 0); A.line(g, c[0], c[1], b[0], b[1], '#6B4A2F', 2);   // empuñadura
    c = at(4, -5); b = at(4, 5); A.line(g, c[0], c[1], b[0], b[1], '#E0B24D', 2);    // guarda
    c = at(4, -5); A.px(g, Math.round(c[0]), Math.round(c[1]), '#F5D060');
    c = at(-4, 0); A.px(g, Math.round(c[0]), Math.round(c[1]), '#E0B24D', 2, 2);     // pomo
  };

  // Contorno selectivo: cada píxel de borde toma el color oscurecido del relleno vecino.
  A.outline = function (src, dark) {
    var w = src.width, h = src.height, c = PX.canvas(w, h), g = c.getContext('2d');
    var d = src.getContext('2d').getImageData(0, 0, w, h).data;
    g.drawImage(src, 0, 0);
    function at(x, y) { return x < 0 || y < 0 || x >= w || y >= h ? -1 : (y * w + x) * 4; }
    var N = [[1, 0], [-1, 0], [0, -1], [0, 1]];
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      if (d[(y * w + x) * 4 + 3] > 60) continue;
      for (var k = 0; k < 4; k++) {
        var o = at(x + N[k][0], y + N[k][1]);
        if (o < 0 || d[o + 3] < 128) continue;
        A.px(g, x, y, A.mix(hx([d[o], d[o + 1], d[o + 2]]), dark || '#1B1838', 0.72));
        break;
      }
    }
    return c;
  };
})();
// FIN DE ARCHIVO
