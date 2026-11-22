// Controlador de selección y movimiento (entrada -> lógica -> vista). Aquí no hay reglas de combate.
window.TT = window.TT || {};
(function () {
  var P = TT.PAL, M = TT.Map, U = TT.Units, hex = TT.hex;
  var SIDE = { hero: 'Héroe', enemy: 'Enemigo' };
  var TILE = { ground: 'Terreno', deep: 'Agua profunda (no se pisa)', ford: 'Vado (coste 2)', bridge: 'Puente', tree: 'Árbol (bloquea)', rock: 'Roca (bloquea)' };

  function $(id) { return document.getElementById(id); }

  TT.Selection = {
    init: function (scene, terrain, view, camera) {
      var sel = null, reach = [], pool = [];
      var ray = new THREE.Raycaster(), ndc = new THREE.Vector2();

      var frame = TT.PX.fromRows([
        'XXXX....XXXX', 'X..........X', 'X..........X', 'X..........X', '............', '............',
        '............', '............', 'X..........X', 'X..........X', 'X..........X', 'XXXX....XXXX'
      ], { X: '#FFFFFF' }, 2);
      var cursor = new THREE.Mesh(new THREE.PlaneGeometry(1.02, 1.02), new THREE.MeshBasicMaterial({
        map: TT.PX.tex(frame), color: hex(P.side.select), transparent: true, depthWrite: false
      }));
      cursor.rotation.x = -Math.PI / 2; cursor.visible = false; cursor.renderOrder = 3;
      scene.add(cursor);

      var matMove = new THREE.MeshBasicMaterial({ color: hex(P.tile.move), transparent: true, opacity: 0.45, depthWrite: false });
      var matThreat = new THREE.MeshBasicMaterial({ color: hex(P.tile.attack), transparent: true, opacity: 0.35, depthWrite: false });
      var hlGeo = new THREE.PlaneGeometry(0.94, 0.94);
      for (var i = 0; i < 64; i++) {            // pool fijo de casillas resaltadas
        var m = new THREE.Mesh(hlGeo, matMove);
        m.rotation.x = -Math.PI / 2; m.visible = false; m.renderOrder = 2;
        scene.add(m); pool.push(m);
      }

      function surf(x, y) { return (M.get(x, y).type === 'ford' ? 0.32 : M.topY(x, y)) + 0.02; }

      function info(text) { $('info').innerHTML = text; }

      function unitInfo(u) {
        var s = u.st, c = M.get(u.x, u.y);
        var head = '<b>' + u.name + '</b> · ' + SIDE[u.side] + ' · ' + M.label(u.x, u.y) + ' · altura ' + Math.max(0, c.h) + ' · mira al ' + TT.DIR_NAMES[u.face];
        var stats = '<br>HP ' + u.hp + '/' + u.maxHp + ' · AT ' + s.at + ' · MG ' + s.mg + ' · DF ' + s.df + ' · RS ' + s.rs + ' · VL ' + s.vl + ' · MV ' + s.mv;
        var tip = u.side === 'enemy' ? '<br>Rojo: hasta dónde podría moverse.' :
          (u.moved ? '<br>Ya se ha movido. Puedes deshacerlo.' : '<br>Toca una casilla azul para moverlo.');
        return head + stats + tip;
      }

      function refresh() {
        for (var i = 0; i < pool.length; i++) pool[i].visible = false;
        if (!sel) { cursor.visible = false; view.select(null); return; }
        view.select(sel);
        cursor.visible = true;
        var showReach = sel.side === 'enemy' || !sel.moved;
        reach = showReach ? U.reach(sel) : [];
        var n = 0;
        for (i = 0; i < reach.length && n < pool.length; i++) {
          var r = reach[i];
          if (r.c === 0) continue;
          var h = pool[n++];
          h.material = sel.side === 'enemy' ? matThreat : matMove;
          h.position.set(r.x, surf(r.x, r.y), r.y); h.visible = true;
        }
        info(unitInfo(sel));
      }

      function pick(cx, cy) {
        ndc.set((cx / window.innerWidth) * 2 - 1, -(cy / window.innerHeight) * 2 + 1);
        ray.setFromCamera(ndc, camera);
        var hits = ray.intersectObjects(view.picks.concat(terrain.pickables), false);
        if (!hits.length) return null;
        var h = hits[0], o = h.object;
        if (o.userData.unit) return { unit: o.userData.unit };
        var cell = o.userData.cell || M.get(Math.round(h.point.x), Math.round(h.point.z));
        return cell ? { cell: cell } : null;
      }

      function onTap(cx, cy) {
        if (view.busy()) return;
        var p = pick(cx, cy);
        if (!p) return;
        if (p.unit) { sel = p.unit; refresh(); return; }
        var c = p.cell, u = U.at(c.x, c.y);
        if (u) { sel = u; refresh(); return; }
        if (sel && sel.side === 'hero' && !sel.moved) {
          var path = U.path(reach, c.x, c.y);
          if (path) {
            var mover = sel;
            U.move(mover, path);
            for (var i = 0; i < pool.length; i++) pool[i].visible = false;
            cursor.visible = false;
            view.moveAlong(mover, path, function () { if (sel === mover) refresh(); });
            return;
          }
        }
        sel = null; refresh();
        info('<b>' + M.label(c.x, c.y) + '</b> · ' + TILE[c.type] + ' · altura ' + Math.max(0, c.h));
      }

      $('undo').addEventListener('click', function () {
        if (view.busy() || !sel || !U.undoMove(sel)) return;
        view.snap(sel); refresh();
      });
      $('reset').addEventListener('click', function () {
        if (view.busy()) return;
        U.resetRound(); refresh();
      });

      return {
        onTap: onTap,
        update: function (time, dt) {
          if (!sel || !cursor.visible) return;
          var v = null, items = view.items;
          for (var i = 0; i < items.length; i++) if (items[i].u === sel) v = items[i];
          cursor.position.set(v.pos.x, v.pos.y + (M.get(sel.x, sel.y).type === 'ford' ? 0.19 : 0.04), v.pos.z);
          cursor.material.opacity = 0.75 + 0.25 * Math.sin(time * 5);
        }
      };
    }
  };
})();
// FIN DE ARCHIVO
