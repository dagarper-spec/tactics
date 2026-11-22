// Terreno 3D de bloques, agua y puente. Solo vista: lee TT.Map, no lo modifica.
window.TT = window.TT || {};
(function () {
  var P = TT.PAL, PX = TT.PX, M = TT.Map, LV = M.LV, hex = TT.hex;
  var BED_Y = -0.45, WATER_Y = 0.3, BASE_Y = -0.5;

  function lambert(canvas, repeatY) {
    var t = PX.tex(canvas, !!repeatY);
    if (repeatY) t.repeat.set(1, repeatY);
    return new THREE.MeshLambertMaterial({ map: t });
  }

  TT.Terrain = {
    build: function (scene, quality) {
      var group = new THREE.Group(), pick = [], shadows = !!(quality && quality.shadows);
      var topGeo = new THREE.BoxGeometry(1, LV, 1), baseGeo = {};
      var topM = [], sideM = [], baseM = {};

      // Materiales compartidos: 3 alturas x 2 variantes.
      for (var h = 0; h < 3; h++) {
        topM[h] = []; sideM[h] = [];
        for (var v = 0; v < 2; v++) {
          topM[h][v] = lambert(PX.topTile(P.terrain[h].top, 11 + h * 7 + v));
          sideM[h][v] = lambert(PX.sideTile(P.terrain[h].top, P.terrain[h].side, 31 + h * 5 + v));
        }
      }
      var dirtCanvas = PX.sideTile(P.dirt, P.dirt, 77);
      var sandTop = lambert(PX.topTile('#8C7A55', 5)), sandSide = lambert(PX.sideTile('#8C7A55', P.dirt, 6));

      function baseMat(n) {
        if (!baseM[n]) baseM[n] = lambert(dirtCanvas, n);
        return baseM[n];
      }
      function addMesh(geo, mat, x, y, z, cell, isPick) {
        var m = new THREE.Mesh(geo, mat);
        m.position.set(x, y, z);
        m.castShadow = shadows; m.receiveShadow = shadows;
        if (cell) m.userData.cell = cell;
        group.add(m);
        if (isPick) pick.push(m);
        return m;
      }

      for (var y = 0; y < M.N; y++) {
        for (var x = 0; x < M.N; x++) {
          var c = M.cells[y][x], v = (x + y) % 2, top = M.topY(x, y);
          if (c.type === 'deep') continue;
          if (c.type === 'ford') {
            var fh = top - BASE_Y, fg = new THREE.BoxGeometry(1, fh, 1);
            addMesh(fg, [sandSide, sandSide, sandTop, sandSide, sandSide, sandSide], x, BASE_Y + fh / 2, y, c, true);
            continue;
          }
          if (c.type === 'bridge') { TT.Terrain._bridge(group, x, y, top, shadows, pick, c); continue; }
          // Bloque superior (con hierba) + columna de tierra debajo.
          var s = sideM[c.h][v];
          addMesh(topGeo, [s, s, topM[c.h][v], s, s, s], x, top - LV / 2, y, c, true);
          var n = c.h + 1;
          if (!baseGeo[n]) baseGeo[n] = new THREE.BoxGeometry(1, n * LV, 1);
          var bm = baseMat(n);
          addMesh(baseGeo[n], bm, x, BASE_Y + (n * LV) / 2, y, null, false);
        }
      }

      // Lecho del río (oscuro) bajo el agua profunda.
      var bed = new THREE.Mesh(new THREE.PlaneGeometry(M.N, M.N), new THREE.MeshLambertMaterial({ color: 0x1d2b3a }));
      bed.rotation.x = -Math.PI / 2; bed.position.set(M.N / 2 - 0.5, BED_Y, M.N / 2 - 0.5);
      group.add(bed);

      // Agua: un solo plano animado por desplazamiento de textura.
      var wt = PX.tex(PX.waterTile(P.water.deep, P.water.foam, 9), true);
      wt.repeat.set(M.N / 2, M.N / 2);
      var wmat = new THREE.MeshBasicMaterial({ map: wt, color: 0xc8c8c8, transparent: true, opacity: 0.8 });
      var water = new THREE.Mesh(new THREE.PlaneGeometry(M.N, M.N), wmat);
      water.rotation.x = -Math.PI / 2; water.position.set(M.N / 2 - 0.5, WATER_Y, M.N / 2 - 0.5);
      water.userData.water = true;
      group.add(water); pick.push(water);

      scene.add(group);
      var acc = 0;
      return {
        group: group, pickables: pick, water: water,
        update: function (dt) {
          acc += dt * 0.6;
          var q = Math.floor(acc * 8) / 8; // pasos discretos: aspecto pixel
          wt.offset.set(q * 0.12, q * 0.05);
        }
      };
    },

    _bridge: function (group, x, y, top, shadows, pick, cell) {
      var plank = new THREE.MeshLambertMaterial({ map: (function () {
        var t = PX.tex(PX.plankTile(P.wood, 3), true); t.repeat.set(1, 1); return t;
      })() });
      var dark = new THREE.MeshLambertMaterial({ color: hex(P.wood.dark) });
      var mid = new THREE.MeshLambertMaterial({ color: hex(P.wood.mid) });
      function box(w, h, d, mat, px, py, pz, isPick) {
        var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        m.position.set(px, py, pz); m.castShadow = shadows; m.receiveShadow = shadows;
        group.add(m);
        if (isPick) { m.userData.cell = cell; pick.push(m); }
      }
      box(0.9, 0.1, 1, plank, x, top - 0.05, y, true);          // tablero
      box(0.06, 0.22, 1, mid, x - 0.42, top + 0.11, y);         // barandillas
      box(0.06, 0.22, 1, mid, x + 0.42, top + 0.11, y);
      var zs = [-0.45, 0.45];
      for (var i = 0; i < 2; i++) {                             // postes hasta el lecho
        var ph = top - BED_Y;
        box(0.1, ph, 0.1, dark, x - 0.42, BED_Y + ph / 2, y + zs[i]);
        box(0.1, ph, 0.1, dark, x + 0.42, BED_Y + ph / 2, y + zs[i]);
      }
    }
  };
})();
// FIN DE ARCHIVO
