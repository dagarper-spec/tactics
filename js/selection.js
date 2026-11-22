// Controlador de turno: entrada -> lógica -> vista. Modos: move, attack, preview, face, busy, over.
window.TT = window.TT || {};
(function () {
  var P = TT.PAL, M = TT.Map, U = TT.Units, C = TT.Combat, T = TT.Turns, hex = TT.hex;

  TT.Selection = {
    init: function (scene, terrain, view, fx, camera) {
      var mode = 'move', insp = null, reach = [], tgt = null, pool = [];
      var ray = new THREE.Raycaster(), ndc = new THREE.Vector2();

      var frame = TT.PX.fromRows([
        'XXXX....XXXX', 'X..........X', 'X..........X', 'X..........X', '............', '............',
        '............', '............', 'X..........X', 'X..........X', 'X..........X', 'XXXX....XXXX'
      ], { X: '#FFFFFF' }, 2);
      var cursor = new THREE.Mesh(new THREE.PlaneGeometry(1.02, 1.02), new THREE.MeshBasicMaterial({
        map: TT.PX.tex(frame), color: hex(P.side.select), transparent: true, depthWrite: false
      }));
      cursor.rotation.x = -Math.PI / 2; cursor.renderOrder = 3;
      scene.add(cursor);

      function mat(col, op) { return new THREE.MeshBasicMaterial({ color: hex(col), transparent: true, opacity: op, depthWrite: false }); }
      var mats = { move: mat(P.tile.move, 0.45), faint: mat(P.tile.attack, 0.18), target: mat(P.tile.attack, 0.6), face: mat(P.side.select, 0.5) };
      var hlGeo = new THREE.PlaneGeometry(0.94, 0.94);
      for (var i = 0; i < 100; i++) {                // pool fijo de casillas resaltadas
        var m = new THREE.Mesh(hlGeo, mats.move);
        m.rotation.x = -Math.PI / 2; m.visible = false; m.renderOrder = 2;
        scene.add(m); pool.push(m);
      }
      var used = 0;
      function clearHl() { for (var i = 0; i < used; i++) pool[i].visible = false; used = 0; }
      function surf(x, y) { return (M.get(x, y).type === 'ford' ? 0.32 : M.topY(x, y)) + 0.02; }
      function hl(x, y, key) {
        if (used >= pool.length) return;
        var h = pool[used++]; h.material = mats[key];
        h.position.set(x, surf(x, y), y); h.visible = true;
      }

      function startTurn() {
        insp = T.cur; mode = 'move'; tgt = null;
        var p = view.posOf(T.cur); camera.focus(p.x, p.y, p.z);
        TT.QueueUI.refresh();
        refresh();
      }

      function refresh() {
        clearHl();
        var cur = T.cur;
        if (mode === 'over') {
          cursor.visible = false;
          TT.HUD.text(T.winner === 'hero' ? '<b>¡Victoria!</b> Todos los enemigos han caído.' : '<b>Derrota.</b> Los héroes han caído.');
          TT.HUD.buttons([{ label: 'Reiniciar', fn: function () { location.reload(); } }]);
          view.select(null); return;
        }
        view.select(cur); cursor.visible = true;
        var head = TT.HUD.turnLine(), btn = [];
        if (mode === 'move') {
          reach = cur.moved ? [] : U.reach(cur);
          reach.forEach(function (r) { if (r.c > 0) hl(r.x, r.y, 'move'); });
          TT.HUD.text(head + '<br>' + TT.HUD.card(insp || cur) + (cur.moved ? '' : '<br>Toca una casilla azul para moverte.'));
          btn = [{ label: 'Atacar', fn: function () { mode = 'attack'; refresh(); } },
                 { label: 'Esperar', fn: function () { T.wait(); mode = 'face'; refresh(); } }];
          if (cur.moved) btn.push({ label: 'Deshacer', fn: function () { U.undoMove(cur); view.snap(cur); refresh(); } });
        } else if (mode === 'attack') {
          var sk = C.skill(cur), ts = C.targets(cur, sk);
          for (var x = 0; x < M.N; x++) for (var y = 0; y < M.N; y++) {
            var d = Math.abs(x - cur.x) + Math.abs(y - cur.y);
            if (d >= 1 && d <= sk.range) hl(x, y, 'faint');
          }
          ts.forEach(function (t) { hl(t.x, t.y, 'target'); });
          TT.HUD.text(head + '<br>' + sk.name + ' (' + TT.TypeNames[sk.type] + ') · alcance ' + sk.range +
            (sk.melee ? '' : ' (+1 por nivel de ventaja)') + '<br>' + (ts.length ? 'Toca un enemigo marcado en rojo.' : 'Nadie a tiro desde aquí.'));
          btn = [{ label: 'Cancelar', fn: function () { mode = 'move'; refresh(); } }];
        } else if (mode === 'preview') {
          hl(tgt.x, tgt.y, 'target');
          TT.HUD.text(TT.HUD.preview(cur, tgt, C.calc(cur, tgt)));
          btn = [{ label: 'Confirmar', fn: doAttack }, { label: 'Cancelar', fn: function () { mode = 'attack'; refresh(); } }];
        } else if (mode === 'face') {
          TT.DIR.forEach(function (d) { if (M.inBounds(cur.x + d[0], cur.y + d[1])) hl(cur.x + d[0], cur.y + d[1], 'face'); });
          TT.HUD.text(head + '<br>Toca una casilla vecina para cambiar hacia dónde mira (ahora: ' + TT.DIR_NAMES[cur.face] + ').');
          btn = [{ label: 'Terminar turno', fn: function () { T.endTurn(); afterTurnChange(); } }];
        } else btn = [];
        TT.HUD.buttons(btn);
      }

      function afterTurnChange() { if (T.phase === 'over') { mode = 'over'; TT.QueueUI.refresh(); refresh(); } else startTurn(); }

      function doAttack() {
        var cur = T.cur, r = C.apply(cur, tgt);
        cur.face = TT.faceOf(tgt.x - cur.x, tgt.y - cur.y); view.face(cur);
        var p = view.posOf(tgt);
        fx.damage(p, r); view.flash(tgt); camera.shake(r.kill ? 0.18 : 0.1, 0.2);
        if (r.kill) view.kill(tgt);
        T.attackDone(); TT.QueueUI.refresh();
        mode = T.phase === 'over' ? 'over' : 'face'; tgt = null; refresh();
      }

      function pick(cx, cy) {
        ndc.set((cx / window.innerWidth) * 2 - 1, -(cy / window.innerHeight) * 2 + 1);
        ray.setFromCamera(ndc, camera.camera);
        var hits = ray.intersectObjects(view.picks.concat(terrain.pickables), false);
        for (var i = 0; i < hits.length; i++) {
          var h = hits[i], o = h.object;
          if (o.userData.unit) { if (o.userData.unit.hp > 0) return { unit: o.userData.unit }; continue; }
          var cell = o.userData.cell || M.get(Math.round(h.point.x), Math.round(h.point.z));
          if (cell) { var u = U.at(cell.x, cell.y); return u ? { unit: u } : { cell: cell }; }
        }
        return null;
      }

      function onTap(cx, cy) {
        if (mode === 'busy' || mode === 'over' || view.busy()) return;
        var p = pick(cx, cy), cur = T.cur;
        if (!p) return;
        if (mode === 'move') {
          if (p.unit) { insp = p.unit; refresh(); return; }
          var path = cur.moved ? null : U.path(reach, p.cell.x, p.cell.y);
          if (path) {
            U.move(cur, path); mode = 'busy'; clearHl(); cursor.visible = false;
            view.moveAlong(cur, path, function () { mode = 'move'; insp = cur; refresh(); });
          } else { insp = cur; refresh(); TT.HUD.text(TT.HUD.tile(p.cell)); }
        } else if (mode === 'attack' || mode === 'preview') {
          if (p.unit && C.targets(cur).indexOf(p.unit) >= 0) { tgt = p.unit; mode = 'preview'; refresh(); }
        } else if (mode === 'face') {
          var c = p.cell || p.unit;
          var dx = c.x - cur.x, dy = c.y - cur.y;
          if (Math.abs(dx) + Math.abs(dy) === 1) { cur.face = TT.faceOf(dx, dy); view.face(cur); refresh(); }
        }
      }

      T.init(); startTurn();

      return {
        onTap: onTap,
        update: function (time) {
          if (!cursor.visible) return;
          var p = view.posOf(T.cur);
          cursor.position.set(p.x, p.y + (M.get(T.cur.x, T.cur.y).type === 'ford' ? 0.19 : 0.04), p.z);
          cursor.material.opacity = 0.75 + 0.25 * Math.sin(time * 5);
        }
      };
    }
  };
})();
// FIN DE ARCHIVO
