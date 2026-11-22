// Decorado: árboles, rocas, antorchas con brillo y banderas. Solo vista.
window.TT = window.TT || {};
(function () {
  var P = TT.PAL, PX = TT.PX, S = TT.Sprites, M = TT.Map;

  function texOf(canvas) { return PX.tex(canvas); }

  TT.Scenery = {
    build: function (scene, quality) {
      var bills = [], flames = [], flags = [], glows = [];
      var shadowTex = S.shadow(), glowTex = PX.glowTex(64);
      var group = new THREE.Group();
      var tint = 0xe8e2f2;

      // Plano vertical con la base en el origen; gira hacia la cámara.
      function billboard(canvas, scale, x, y, z, mat) {
        var w = canvas.width * scale, h = canvas.height * scale;
        var g = new THREE.PlaneGeometry(w, h); g.translate(0, h / 2, 0);
        var m = new THREE.Mesh(g, mat || new THREE.MeshBasicMaterial({ map: texOf(canvas), transparent: true, alphaTest: 0.4, color: tint }));
        m.position.set(x, y, z);
        group.add(m); bills.push(m);
        return m;
      }
      function blobShadow(x, y, z, r) {
        var m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), new THREE.MeshBasicMaterial({
          map: shadowTex, color: 0x000000, transparent: true, opacity: 0.4, depthWrite: false
        }));
        m.rotation.x = -Math.PI / 2; m.position.set(x, y + 0.02, z);
        group.add(m);
      }

      // Árboles y rocas desde el mapa.
      var seed = 5;
      for (var y = 0; y < M.N; y++) {
        for (var x = 0; x < M.N; x++) {
          var c = M.cells[y][x], ty = M.topY(x, y);
          if (c.type === 'tree') {
            billboard(S.tree(seed++), 1 / 20, x, ty, y);
            blobShadow(x, ty, y, 0.55);
          } else if (c.type === 'rock') {
            billboard(S.rock(seed++), 1 / 22, x, ty, y);
            blobShadow(x, ty, y, 0.5);
          }
        }
      }

      // Antorchas: poste + llama (2 fotogramas) + brillo aditivo (sin luces reales).
      var tc = S.torch(), f0 = texOf(S.flame(0)), f1 = texOf(S.flame(1));
      TT.Props.torches.forEach(function (t, i) {
        var px = t[0] + t[2], pz = t[1] + t[3], py = M.topY(t[0], t[1]);
        billboard(tc, 1 / 16, px, py, pz);
        var fm = new THREE.MeshBasicMaterial({ map: f0, transparent: true, alphaTest: 0.3 });
        var fg = new THREE.PlaneGeometry(0.34, 0.4); fg.translate(0, 0.2, 0);
        var fl = new THREE.Mesh(fg, fm);
        fl.position.set(px, py + 0.72, pz);
        group.add(fl); bills.push(fl);
        flames.push({ mesh: fl, mat: fm, phase: i * 0.7, next: 0 });
        var gl = new THREE.Sprite(new THREE.SpriteMaterial({
          map: glowTex, color: TT.hex(P.flame.edge), transparent: true, opacity: 0.55,
          blending: THREE.AdditiveBlending, depthWrite: false
        }));
        gl.scale.set(1.3, 1.3, 1); gl.position.set(px, py + 0.95, pz);
        group.add(gl); glows.push({ s: gl, phase: i * 1.3 });
      });
      var ftex = [f0, f1];

      // Banderas del fuerte con onda en los vértices.
      var fc = S.flag(), ftx = texOf(fc);
      TT.Props.flags.forEach(function (f, i) {
        var w = fc.width / 14, h = fc.height / 14;
        var g = new THREE.PlaneGeometry(w, h, 6, 1); g.translate(w / 2, h / 2, 0);
        var m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: ftx, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, color: tint }));
        m.position.set(f[0] + f[2] - w / 2 + 0.1, M.topY(f[0], f[1]) + 0.3, f[1] + f[3]);
        group.add(m); bills.push(m);
        flags.push({ mesh: m, base: g.attributes.position.array.slice(), phase: i * 1.1, w: w });
      });

      scene.add(group);
      var time = 0;
      return {
        group: group,
        update: function (dt, yaw) {
          time += dt;
          for (var i = 0; i < bills.length; i++) bills[i].rotation.y = yaw;
          for (i = 0; i < flames.length; i++) {
            var f = flames[i];
            f.next -= dt;
            if (f.next <= 0) { f.next = 0.1 + Math.random() * 0.08; f.mat.map = ftex[Math.random() < 0.5 ? 0 : 1]; }
            var k = 1 + 0.12 * Math.sin(time * 14 + f.phase);
            f.mesh.scale.set(k, 1.05 - (k - 1), 1);
          }
          for (i = 0; i < glows.length; i++) {
            var gl = glows[i];
            gl.s.material.opacity = 0.5 + 0.12 * Math.sin(time * 9 + gl.phase) + 0.05 * Math.sin(time * 23 + gl.phase);
          }
          for (i = 0; i < flags.length; i++) {
            var fl = flags[i], pos = fl.mesh.geometry.attributes.position, a = pos.array;
            for (var j = 0; j < a.length; j += 3) {
              var u = fl.base[j] / fl.w;
              a[j + 1] = fl.base[j + 1] + Math.sin(time * 4 + fl.phase + u * 5) * 0.05 * u;
            }
            pos.needsUpdate = true;
          }
        }
      };
    }
  };
})();
// FIN DE ARCHIVO
