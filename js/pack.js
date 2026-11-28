// Recortes de pixel art externos (carpeta img/env): se cargan antes de empezar; si falta alguno se usa el dibujo por código. Solo datos.
// canvas.sc = escala en unidades de mundo por píxel (los billboards la usan en lugar de la suya).
window.TT = window.TT || {};
(function () {
  var N = { tree: 4, bush: 4, flower: 4 }, SC = { tree: 1 / 48, bush: 1 / 34 }, cv = {};
  var FURN = ['chest', 'table', 'round', 'stool', 'barrel', 'wardrobe', 'hearth', 'counter', 'plant0', 'plant1', 'plant2', 'plant3'];
  var K = TT.Pack = { ready: false };

  // load(cb): descarga las imágenes y llama a cb (siempre, aunque alguna falle).
  K.load = function (cb) {
    var left = 0, done = false;
    function fin() { if (done) return; done = true; K.ready = true; cb(); }
    Object.keys(N).forEach(function (k) {
      for (var i = 0; i < N[k]; i++) (function (id) {
        left++;
        var im = new Image();
        im.onload = function () { var c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0); if (SC[id.split('_')[0]]) c.sc = SC[id.split('_')[0]]; cv[id] = c; if (!--left) fin(); };
        im.onerror = function () { if (!--left) fin(); };
        im.src = 'img/env/' + id + '.png';
      })(k + '_' + i);
    });
    FURN.forEach(function (n) {
      left++;
      var im = new Image();
      im.onload = function () { var c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0); c.sc = n === 'hearth' ? 1 / 48 : 1 / 32; cv['furn_' + n] = c; if (!--left) fin(); };
      im.onerror = function () { if (!--left) fin(); };
      im.src = 'img/env/furn_' + n + '.png';
    });
    setTimeout(fin, 4000);
  };
  // Mueble por nombre (o null).
  K.furn = function (n) { return cv['furn_' + n] || null; };
  // Devuelve el recorte nº i (cíclico) o null si no está cargado.
  var TREE = [0, 0, 1, 0, 0, 2, 0, 3];                          // sobre todo verdes, con algún árbol de otoño
  K.get = function (kind, i) { return cv[kind + '_' + (kind === 'tree' ? TREE[i % TREE.length] : i % N[kind])] || null; };
})();
// FIN DE ARCHIVO
