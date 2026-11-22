// Casillas resaltadas (pool fijo) y cursor de turno. Solo vista.
window.TT = window.TT || {};
(function () {
  var P = TT.PAL, M = TT.Map, hex = TT.hex;

  TT.Highlight = {
    build: function (scene) {
      var pool = [], used = 0;
      function mat(col, op) { return new THREE.MeshBasicMaterial({ color: hex(col), transparent: true, opacity: op, depthWrite: false }); }
      var mats = {
        move: mat(P.tile.move, 0.45), faint: mat(P.tile.attack, 0.16), target: mat(P.tile.attack, 0.6),
        face: mat(P.side.select, 0.5), area: mat(P.tile.area, 0.55), heal: mat(P.tile.heal, 0.5)
      };
      var geo = new THREE.PlaneGeometry(0.94, 0.94);
      for (var i = 0; i < 120; i++) {
        var m = new THREE.Mesh(geo, mats.move);
        m.rotation.x = -Math.PI / 2; m.visible = false; m.renderOrder = 2;
        scene.add(m); pool.push(m);
      }
      var frame = TT.PX.fromRows([
        'XXXX....XXXX', 'X..........X', 'X..........X', 'X..........X', '............', '............',
        '............', '............', 'X..........X', 'X..........X', 'X..........X', 'XXXX....XXXX'
      ], { X: '#FFFFFF' }, 2);
      var cursor = new THREE.Mesh(new THREE.PlaneGeometry(1.02, 1.02), new THREE.MeshBasicMaterial({
        map: TT.PX.tex(frame), color: hex(P.side.select), transparent: true, depthWrite: false
      }));
      cursor.rotation.x = -Math.PI / 2; cursor.renderOrder = 3; cursor.visible = false;
      scene.add(cursor);

      function surf(x, y) { return (M.get(x, y).type === 'ford' ? 0.32 : M.topY(x, y)) + 0.02; }

      return {
        clear: function () { for (var i = 0; i < used; i++) pool[i].visible = false; used = 0; },
        add: function (x, y, key) {
          if (used >= pool.length || !M.inBounds(x, y)) return;
          var h = pool[used++]; h.material = mats[key];
          h.position.set(x, surf(x, y), y); h.visible = true;
        },
        cursorShow: function (v) { cursor.visible = v; },
        cursorAt: function (p, ford, time) {
          cursor.position.set(p.x, p.y + (ford ? 0.19 : 0.04), p.z);
          cursor.material.opacity = 0.75 + 0.25 * Math.sin(time * 5);
        }
      };
    }
  };
})();
// FIN DE ARCHIVO
