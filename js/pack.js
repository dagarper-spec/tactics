// Recortes de pixel art externos (carpeta img/env): se cargan antes de empezar; si falta alguno se usa el dibujo por código. Solo datos.
// canvas.sc = escala en unidades de mundo por píxel (los billboards la usan en lugar de la suya).
window.TT = window.TT || {};
(function () {
  var N = { tree: 4, bush: 4, flower: 4 }, SC = { tree: 1 / 48, bush: 1 / 34 }, cv = {};
  var EXTRA = ['room_floor', 'room_wall', 'furn_chest', 'furn_table', 'furn_stool', 'furn_barrel', 'furn_wardrobe', 'furn_hearth', 'furn_counter', 'furn_shelf', 'furn_plant0', 'furn_plant1', 'furn_plant2', 'furn_plant3'];
  var K = TT.Pack = { ready: false };

  // load(cb): descarga las imágenes y llama a cb (siempre, aunque alguna falle).
  K.load = function (cb) {
    var left = 0, done = false, ids = EXTRA.slice();
    function fin() { if (done) return; done = true; K.ready = true; cb(); }
    Object.keys(N).forEach(function (k) { for (var i = 0; i < N[k]; i++) ids.push(k + '_' + i); });
    ids.forEach(function (id) {
      left++;
      var im = new Image(), kind = id.split('_')[0];
      im.onload = function () {
        var c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0);
        if (SC[kind]) c.sc = SC[kind]; cv[id] = c; if (!--left) fin();
      };
      im.onerror = function () { if (!--left) fin(); };
      im.src = 'img/env/' + id + '.png';
    });
    setTimeout(fin, 4000);
  };
  // Recorte por nombre de archivo (sin .png) o null.
  K.img = function (id) { return cv[id] || null; };
  var TREE = [0, 0, 1, 0, 0, 2, 0, 3];                          // sobre todo verdes, con algún árbol de otoño
  K.get = function (kind, i) { return cv[kind + '_' + (kind === 'tree' ? TREE[i % TREE.length] : i % N[kind])] || null; };
})();
// FIN DE ARCHIVO
