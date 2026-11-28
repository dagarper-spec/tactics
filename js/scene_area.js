// Escena de exploración: el protagonista camina por el pueblo y entra en la tienda y la taberna. Toque en el suelo = ir allí.
window.TT = window.TT || {};
(function () {
  var Ar = TT.Areas, S = null;

  function $(id) { return document.getElementById(id); }
  function say(html) { TT.HUD.text(html); }

  TT.Scenes.add('area', {
    three: true,
    enter: function (arg) {
      arg = arg || {};
      var R = TT.R, A = TT.Audio, C = TT.Cam, a = Ar.get(arg.id || 'village'), out = a.kind === 'out', time = 0, phase = 0, entering = false;
      var scene = R.makeScene(); R.use(scene);
      var view = TT.AreaView.build(scene, a, R.q), flat = !!view.flat;
      var door = Ar.doorByCh(a, arg.spawn || a.def.spawn), step = (door.def.out) || (out ? [0, 1] : [0, -1]);
      var player = TT.Walker.make(scene, TT.Save.flag('armor') ? 'warrior' : 'traveler', door.x, door.y, TT.faceOf(step[0], step[1]));
      var npcs = a.npcs.map(function (n) { var w = TT.Walker.make(scene, n.type, n.x, n.y, n.face); w.npc = n; return w; });
      var picks = view.picks.concat(npcs.map(function (w) { return w.pick; }));
      var ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, flat ? 0 : 1, flat ? 1 : 0), 0), hit = new THREE.Vector3();
      S = { scene: scene, view: view }; TT.Scenes.ctx = { player: player, npcs: npcs, area: a };

      C.noPan = true; if (R.tilt) R.tilt.enabled = !flat;                       // sin efecto maqueta en las salas 2D
      if (flat) {                                                              // sala 2D: cámara fija de frente, con zoom entero de píxeles
        var pr = Math.min(window.devicePixelRatio || 1, R.q.pr), vh = C.viewH * pr, vw = C.camera.aspect * vh;
        var k = Math.max(1, Math.floor(Math.min(vw / view.size.w, vh * 0.86 / view.size.h)));
        C.flat(true, (vh / (16 * k)) / (2 * Math.tan(C.camera.fov * Math.PI / 360)));
        C.goal.set(view.center.x, view.center.y, 0); C.target.copy(C.goal); document.body.classList.add('flat');
        view.place([player].concat(npcs));
      } else {
        C.flat(false); C.dist = C.distGoal = out ? 21 : 12;                   // empieza con el zoom lejano
        C.goal.set(player.pos.x, 0.6, player.pos.z); C.target.copy(C.goal);
      }
      $('title').textContent = a.name;
      TT.HUD.buttons([]);
      function hint() {
        return '<b>' + a.name + '</b><br><span class="dim">Toca el suelo para moverte' + (out ? ' y las puertas para entrar.' : '; la alfombra de la entrada es la salida.') + '</span>' +
          (TT.Save.exists() ? '<br><span class="dim">' + TT.Story.goal() + '</span>' : '');
      }
      say(hint());
      if (TT.Save.exists()) TT.Save.flag('area', a.id);
      A.list = false; A.playMusic('music_town', true);
      player.walk([{ x: door.x + step[0], y: door.y + step[1] }]);          // acaba de salir por la puerta

      function arrive(cell) {
        var d = Ar.doorAt(a, cell.x, cell.y);
        if (!d) return;
        if (d.def.to) { entering = true; A.play('ui_confirm'); TT.Scenes.go('area', { id: d.def.to, spawn: d.def.at }); }
        else if (d.def.story) { var m = TT.Story.exit(); if (m) say('<b>' + a.name + '</b><br>' + m); }
        else say('<b>' + a.name + '</b><br>' + d.def.msg);
      }
      function goTo(t, after) {
        var from = player.cell(), p = Ar.path(a, from, t);
        if (!p) return;
        say(hint());
        if (!p.length) { if (after) after(); return; }
        player.walk(p, after);
      }
      function talk(w) {
        var n = w.npc, t = Ar.beside(a, n.x, n.y, player.cell());
        goTo(t || player.cell(), function () {
          player.look(n.x - player.pos.x, n.y - player.pos.z); w.look(player.pos.x - n.x, player.pos.z - n.y);
          if (TT.Save.exists() && n.id && TT.Story.talk(n, function () { say(hint()); })) return;
          A.play('ui_select'); say('<b>' + n.name + '</b><br>' + n.line);
        });
      }
      // David se pone la armadura: su sprite pasa de civil a guerrero.
      function dress() {
        var c = player.cell(), f = player.face, old = player;
        scene.remove(old.group); old.sprite.geometry.dispose(); old.sprite.material.dispose();
        player = TT.Walker.make(scene, 'warrior', c.x, c.y, f); TT.Scenes.ctx.player = player;
      }
      function useSpot(id, t) {
        goTo(Ar.beside(a, t.x, t.y, player.cell()) || player.cell(), function () {
          player.look(t.x - player.pos.x, t.y - player.pos.z);
          TT.Story.spot(id, function () { say(hint()); }, dress);
        });
      }
      C.bind($('game'), function (cx, cy) {
        if (entering || TT.Scenes.busy || TT.Dialog.open) return;
        var r = $('game').getBoundingClientRect();
        ray.setFromCamera({ x: ((cx - r.left) / r.width) * 2 - 1, y: -((cy - r.top) / r.height) * 2 + 1 }, C.camera);
        var h = ray.intersectObjects(picks, false)[0], o = h && h.object;
        if (o && o.userData.walker && o.userData.walker.npc) return talk(o.userData.walker);
        if (o && o.userData.building) { var bd = o.userData.building.door; return bd && goTo({ x: bd.x, y: bd.y }, function () { arrive(bd); }); }
        if (!ray.ray.intersectPlane(plane, hit)) return;
        var t = flat ? view.cellOf(hit) : { x: Math.round(hit.x), y: Math.round(hit.z) }, sp = a.def.spots && a.def.spots[Ar.ch(a, t.x, t.y)];
        if (sp && TT.Save.exists()) return useSpot(sp, t);
        goTo(t, function () { arrive(t); });
      });

      if (TT.Save.exists()) TT.Story.enter(a.id, function () { say(hint()); });

      return function (raw) {
        time += raw;
        player.update(raw, C.yaw, time);
        npcs.forEach(function (w) { w.update(raw, C.yaw, time); });
        if (player.moving()) { var ph = Math.floor(player.phase / 2); if (ph !== phase) { phase = ph; A.play('step', 0.45); } }
        if (flat) view.place([player].concat(npcs)); else C.goal.set(player.pos.x, 0.6, player.pos.z);
        C.update(raw);
        view.update(raw, C.yaw, time, C.camera.position);
      };
    },
    leave: function () {
      if (!S) return;
      S.scene.traverse(function (o) {
        if (o.geometry) o.geometry.dispose();
        var ms = o.material ? (o.material.length ? o.material : [o.material]) : [];
        ms.forEach(function (m) { if (m.map && !m.map.__keep) m.map.dispose(); m.dispose(); });
      });
      S = null;
    }
  });
})();
// FIN DE ARCHIVO
