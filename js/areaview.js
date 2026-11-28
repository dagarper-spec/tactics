// Construye en 3D un área (pueblo o interior) a partir de TT.Areas. Solo vista: devuelve picks y una función update.
window.TT = window.TT || {};
(function () {
  var PX = TT.PX, AT = TT.AreaTex, Ar = TT.Areas, WALL_H = 2.0, MARGIN = 4;

  function lam(canvas, rx, ry) {
    var t = PX.tex(canvas, true); t.repeat.set(rx || 1, ry || 1);
    return new THREE.MeshLambertMaterial({ map: t });
  }

  TT.AreaView = {
    build: function (scene, a, q) {
      var group = new THREE.Group(), picks = [], bills = [], glows = [], walls = [], sh = !!(q && q.shadows), out = a.kind === 'out';
      var shadowTex = TT.Sprites.shadow(), glowTex = PX.glowTex(64);
      scene.add(group);

      function mesh(geo, mat, x, y, z, cast) {
        var m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
        m.castShadow = sh && cast !== false; m.receiveShadow = sh; group.add(m); return m;
      }
      function billboard(canvas, scale, x, z, mat) {
        var w = canvas.width * scale, h = canvas.height * scale, g = new THREE.PlaneGeometry(w, h); g.translate(0, h / 2, 0);
        var m = new THREE.Mesh(g, mat || new THREE.MeshBasicMaterial({ map: PX.tex(canvas), transparent: true, alphaTest: 0.4, color: 0xe8e2f2 }));
        m.position.set(x, 0, z); group.add(m); bills.push(m); return m;
      }
      function blob(x, z, r) {
        var m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), new THREE.MeshBasicMaterial({ map: shadowTex, color: 0x000000, transparent: true, opacity: 0.4, depthWrite: false }));
        m.rotation.x = -Math.PI / 2; m.position.set(x, 0.02, z); group.add(m);
      }
      function glow(x, y, z, size, col) {
        var m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: glowTex, color: col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
        m.position.set(x, y, z); group.add(m); bills.push(m); glows.push(m);
      }
      var cx = a.W / 2 - 0.5, cz = a.H / 2 - 0.5, smokes = [];
      var X = { mesh: mesh, billboard: billboard, blob: blob, glow: glow, group: group, bills: bills };

      // Suelo
      var fl;
      if (out) fl = new THREE.Mesh(new THREE.PlaneGeometry(a.W + 2 * MARGIN, a.H + 2 * MARGIN), lam(AT.ground(a, MARGIN)));
      else fl = new THREE.Mesh(new THREE.PlaneGeometry(a.W, a.H), lam(AT.floor(a)));
      fl.rotation.x = -Math.PI / 2; fl.position.set(cx, 0, cz); fl.receiveShadow = sh; group.add(fl);
      fl.material.map.repeat.set(1, 1); fl.material.map.wrapS = fl.material.map.wrapT = THREE.ClampToEdgeWrapping;
      picks.push(fl);

      var wood = lam(AT.wood()), stone = lam(AT.stone()); X.wood = wood; X.stone = stone;
      var gx, gy;
      if (out) {
        // Edificios: paredes con puerta al sur, ventanas y tejado a cuatro aguas.
        a.buildings.forEach(function (b) {
          var d = b.def, door = b.door ? b.door.x - b.x0 : -1;
          var side = lam(AT.facade(b.h, d.wall, {}), 1, 1), back = lam(AT.facade(b.w, d.wall, { blank: true }), 1, 1);
          var mats = [side, side, lam(AT.roof(d.roof)), lam(AT.roof(d.roof)), lam(AT.facade(b.w, d.wall, { door: door, label: d.label, roof: d.roof }), 1, 1), back];
          var body = mesh(new THREE.BoxGeometry(b.w, WALL_H, b.h), mats, b.x0 + (b.w - 1) / 2, WALL_H / 2, b.y0 + (b.h - 1) / 2);
          body.userData.building = b; picks.push(body);
          var roof = TT.AreaProps.roof(b.w, b.h, lam(AT.roof(d.roof)), lam(AT.gable(d.wall)));
          roof.position.set(body.position.x, WALL_H, body.position.z); roof.castShadow = sh; roof.receiveShadow = sh; roof.userData.building = b; group.add(roof); picks.push(roof);
          var chx = body.position.x + (b.w >= b.h ? b.w * 0.25 : 0), chz = body.position.z + (b.w >= b.h ? -0.2 : b.h * 0.25);
          mesh(new THREE.BoxGeometry(0.34, 1.3, 0.34), stone, chx, WALL_H + 0.95, chz);                       // chimenea y humo
          smokes.push(TT.AreaProps.smoke(X, chx, WALL_H + 1.7, chz));
          if (b.door) mesh(new THREE.BoxGeometry(0.9, 0.1, 0.45), stone, b.door.x, 0.05, b.door.y - 0.25, false);   // peldaño
          if (b.door) glow(b.door.x, 1.1, b.door.y + 0.2, 1.1, 0xffb868);
        });
        var seed = 11, tc = [], tm = [];
        for (gy = 0; gy < a.H; gy++) for (gx = 0; gx < a.W; gx++) {
          var c = Ar.ch(a, gx, gy);
          if (TT.AreaProps.cell(X, c, gx, gy, true)) continue;
          if (c === 'T') { var ts = seed++ % 5; if (!tc[ts]) { tc[ts] = TT.Sprites.tree(ts); tm[ts] = new THREE.MeshBasicMaterial({ map: PX.tex(tc[ts]), transparent: true, alphaTest: 0.4, color: 0xe8e2f2 }); } billboard(tc[ts], 1 / 20, gx, gy, tm[ts]); blob(gx, gy, 0.55); }
          else if (c === 'f') {
            var along = Ar.ch(a, gx - 1, gy) === 'f' || Ar.ch(a, gx + 1, gy) === 'f';
            var rail = mesh(new THREE.BoxGeometry(along ? 1 : 0.1, 0.12, along ? 0.1 : 1), wood, gx, 0.45, gy);
            mesh(new THREE.BoxGeometry(0.12, 0.6, 0.12), wood, gx, 0.3, gy); rail.castShadow = false;
          } else if (c === 'w') {
            mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.55, 12), stone, gx, 0.27, gy);
            mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.02, 12), new THREE.MeshBasicMaterial({ color: 0x3a7fb0 }), gx, 0.52, gy, false);
            mesh(new THREE.BoxGeometry(0.07, 1.1, 0.07), wood, gx - 0.4, 0.8, gy); mesh(new THREE.BoxGeometry(0.07, 1.1, 0.07), wood, gx + 0.4, 0.8, gy);
            mesh(new THREE.BoxGeometry(1.0, 0.07, 0.6), wood, gx, 1.38, gy);
          } else if (c === 'l') {
            mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.5, 6), wood, gx, 0.75, gy);
            mesh(new THREE.BoxGeometry(0.18, 0.22, 0.18), new THREE.MeshBasicMaterial({ color: 0xffd98a }), gx, 1.6, gy, false);
            glow(gx, 1.6, gy, 1.6, 0xff9a40);
          }
        }
        TT.AreaProps.flowers(X, a);
        // Sol: la sombra cubre todo el pueblo.
        var sun = scene.userData.sun; sun.target.position.set(cx, 0, cz); sun.position.set(cx + 3, 8, cz + 11);
        var sc = sun.shadow.camera; if (sc) { var r = Math.max(a.W, a.H) / 2 + 3; sc.left = -r; sc.right = r; sc.top = r; sc.bottom = -r; sc.far = 60; sc.updateProjectionMatrix(); }
      } else {
        // Interior: cuatro paredes (las que dan a la cámara se ocultan), muebles y luz cálida.
        scene.background = new THREE.Color(0x120c08); scene.fog = null;
        scene.children.forEach(function (o) { if (o.isAmbientLight) { o.color.set(0xffd9a8); o.intensity = 1.25; } if (o.isDirectionalLight) o.intensity = 0.3; });
        var lamp = new THREE.PointLight(0xffb866, 1.2, 16); lamp.position.set(cx, 2.1, cz); group.add(lamp);
        var wc = a.def.theme.wall, ex = Ar.doorByCh(a, 'e');
        function wall(name, x, z, len, alongX, test) {
          var m = lam(AT.plaster(wc), len, 1);
          var w = mesh(new THREE.BoxGeometry(alongX ? len : 0.2, WALL_H, alongX ? 0.2 : len), m, x, WALL_H / 2, z, false);
          walls.push({ m: w, test: test }); return w;
        }
        wall('N', cx, -0.6, a.W + 0.4, true, function (p) { return p.z > cz; });
        wall('W', -0.6, cz, a.H + 0.4, false, function (p) { return p.x > cx; });
        wall('E', a.W - 0.4, cz, a.H + 0.4, false, function (p) { return p.x < cx; });
        var le = ex.x - 0.5, rs = ex.x + 0.5;                          // pared sur con hueco en la salida
        wall('S1', (le - 0.7) / 2, a.H - 0.4, le + 0.7, true, function (p) { return p.z < cz; });
        wall('S2', (rs + a.W - 0.3) / 2, a.H - 0.4, a.W - 0.3 - rs, true, function (p) { return p.z < cz; });
        var mat = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ map: PX.tex(AT.mat()) }));
        mat.rotation.x = -Math.PI / 2; mat.position.set(ex.x, 0.02, ex.y); group.add(mat);
        var shelf = lam(AT.shelf());
        for (gy = 0; gy < a.H; gy++) for (gx = 0; gx < a.W; gx++) {
          var c2 = Ar.ch(a, gx, gy);
          if (TT.AreaProps.cell(X, c2, gx, gy, false)) continue;
          if (c2 === 'k') mesh(new THREE.BoxGeometry(1, 1.7, 0.45), shelf, gx, 0.85, gy - 0.25);
          else if (c2 === 'c') { mesh(new THREE.BoxGeometry(1, 0.9, 0.9), wood, gx, 0.45, gy); mesh(new THREE.BoxGeometry(1.02, 0.07, 0.96), stone, gx, 0.92, gy); }
          else if (c2 === 't') { mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.75, 6), wood, gx, 0.37, gy); mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.07, 12), wood, gx, 0.78, gy); }
          else if (c2 === 'o') mesh(new THREE.CylinderGeometry(0.34, 0.3, 0.75, 10), wood, gx, 0.37, gy);
        }
        glow(1, 1.8, 0.2, 1.8, 0xffa850); glow(a.W - 2, 1.8, 0.2, 1.8, 0xffa850);
        var sun2 = scene.userData.sun; sun2.target.position.set(cx, 0, cz); sun2.position.set(cx + 3, 8, cz + 11);
        var sc2 = sun2.shadow.camera; if (sc2) { var r3 = Math.max(a.W, a.H) / 2 + 2; sc2.left = -r3; sc2.right = r3; sc2.top = r3; sc2.bottom = -r3; sc2.updateProjectionMatrix(); }
      }

      return {
        picks: picks, group: group,
        update: function (dt, yaw, time, cam) {
          for (var i = 0; i < bills.length; i++) bills[i].rotation.y = yaw;
          for (i = 0; i < glows.length; i++) glows[i].material.opacity = 0.75 + 0.2 * Math.sin(time * 5 + i * 2.1);
          for (i = 0; i < smokes.length; i++) smokes[i](time);
          for (i = 0; i < walls.length; i++) walls[i].m.visible = walls[i].test(cam);
        },
        dispose: function () {
          scene.remove(group);
          group.traverse(function (o) {
            if (o.geometry) o.geometry.dispose();
            var ms = o.material ? (o.material.length ? o.material : [o.material]) : [];
            ms.forEach(function (m) { if (m.map) m.map.dispose(); m.dispose(); });
          });
        }
      };
    }
  };
})();
// FIN DE ARCHIVO
