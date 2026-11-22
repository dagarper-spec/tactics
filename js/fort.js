// Fuerte enemigo sobre la meseta (casillas C1-F2): muros, almenas y dos torres. Solo vista.
window.TT = window.TT || {};
(function () {
  var P = TT.PAL, PX = TT.PX, M = TT.Map, hex = TT.hex;

  TT.Fort = {
    build: function (scene, quality) {
      var shadows = !!(quality && quality.shadows), group = new THREE.Group();
      var top = M.topY(2, 0);                 // altura de la meseta (nivel 2)
      var x0 = 1.5, x1 = 5.5, z0 = -0.5, z1 = 1.5, T = 0.2, WH = 0.4;
      var stoneCanvas = PX.stoneTile(P.stone.top, 21);
      var roofMat = new THREE.MeshLambertMaterial({ color: hex(P.side.enemy) });

      function stoneMat(rx, ry) {
        var t = PX.tex(stoneCanvas, true); t.repeat.set(rx, ry);
        return new THREE.MeshLambertMaterial({ map: t });
      }
      function box(w, h, d, mat, x, y, z) {
        var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        m.position.set(x, y, z); m.castShadow = shadows; m.receiveShadow = shadows;
        group.add(m); return m;
      }
      function crenels(len, alongX, cx, cz) {  // almenas cada 0,5
        var mat = stoneMat(1, 1), n = Math.floor(len / 0.5);
        for (var i = 0; i < n; i++) {
          var o = -len / 2 + 0.25 + i * 0.5;
          if (alongX) box(0.26, 0.16, T, mat, cx + o, top + WH + 0.08, cz);
          else box(T, 0.16, 0.26, mat, cx, top + WH + 0.08, cz + o);
        }
      }

      // Muros norte, oeste y este (el sur queda abierto hacia el río).
      var lenX = x1 - x0, lenZ = z1 - z0;
      box(lenX, WH, T, stoneMat(lenX, WH), (x0 + x1) / 2, top + WH / 2, z0 + T / 2);
      crenels(lenX, true, (x0 + x1) / 2, z0 + T / 2);
      box(T, WH, lenZ, stoneMat(lenZ, WH), x0 + T / 2, top + WH / 2, (z0 + z1) / 2);
      crenels(lenZ, false, x0 + T / 2, (z0 + z1) / 2);
      box(T, WH, lenZ, stoneMat(lenZ, WH), x1 - T / 2, top + WH / 2, (z0 + z1) / 2);
      crenels(lenZ, false, x1 - T / 2, (z0 + z1) / 2);

      // Torres en las esquinas norte, con tejado rojo.
      [[x0 + 0.25, z0 + 0.25], [x1 - 0.25, z0 + 0.25]].forEach(function (c) {
        box(0.5, 1.0, 0.5, stoneMat(0.5, 1), c[0], top + 0.5, c[1]);
        box(0.58, 0.1, 0.58, stoneMat(1, 1), c[0], top + 1.0, c[1]);
        var roof = new THREE.Mesh(new THREE.ConeGeometry(0.46, 0.6, 4), roofMat);
        roof.position.set(c[0], top + 1.35, c[1]); roof.rotation.y = Math.PI / 4;
        roof.castShadow = shadows; group.add(roof);
      });

      // Dos pilares bajos que marcan la entrada sur.
      var pm = stoneMat(0.3, 0.5);
      box(0.3, 0.5, 0.3, pm, x0 + 0.15, top + 0.25, z1 - 0.15);
      box(0.3, 0.5, 0.3, pm, x1 - 0.15, top + 0.25, z1 - 0.15);

      scene.add(group);
      return group;
    }
  };
})();
// FIN DE ARCHIVO
