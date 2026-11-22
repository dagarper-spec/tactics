// Partículas con pooling: luciérnagas (Points) y niebla baja sobre el río.
window.TT = window.TT || {};
(function () {
  var P = TT.PAL, PX = TT.PX, M = TT.Map;

  TT.Particles = {
    build: function (scene, quality) {
      var N = (quality && quality.fireflies) || 30;
      var pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
      var vel = new Float32Array(N * 3), life = new Float32Array(N), max = new Float32Array(N), ph = new Float32Array(N);
      var base = [1, 0.9, 0.45]; // amarillo cálido

      // Pool fijo: al morir, una partícula se reubica en vez de crearse otra.
      function spawn(i, first) {
        pos[i * 3] = Math.random() * (M.N - 1);
        pos[i * 3 + 2] = Math.random() * (M.N - 1);
        var gx = Math.round(pos[i * 3]), gz = Math.round(pos[i * 3 + 2]);
        pos[i * 3 + 1] = Math.max(0.3, M.topY(gx, gz)) + 0.3 + Math.random() * 1.2;
        vel[i * 3] = (Math.random() - 0.5) * 0.3;
        vel[i * 3 + 1] = (Math.random() - 0.5) * 0.12;
        vel[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
        max[i] = 4 + Math.random() * 5;
        life[i] = first ? Math.random() * max[i] : 0;
        ph[i] = Math.random() * 6.28;
      }
      for (var i = 0; i < N; i++) spawn(i, true);

      var geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      var pts = new THREE.Points(geo, new THREE.PointsMaterial({
        map: PX.glowTex(32), size: 0.28, vertexColors: true, transparent: true,
        blending: THREE.AdditiveBlending, depthWrite: false
      }));
      pts.frustumCulled = false;
      scene.add(pts);

      // Niebla: unos pocos planos suaves que derivan y reaparecen al otro lado.
      var mist = [], mtex = PX.glowTex(64);
      var MN = (quality && quality.mist) === 0 ? 0 : 7;
      for (i = 0; i < MN; i++) {
        var mm = new THREE.Mesh(new THREE.PlaneGeometry(3, 1.6), new THREE.MeshBasicMaterial({
          map: mtex, color: 0xaebfd8, transparent: true, opacity: 0.06, depthWrite: false
        }));
        mm.rotation.x = -Math.PI / 2;
        mm.position.set(-2 + i * 2, 0.45 + (i % 3) * 0.05, 4.5 + (i % 2) * 1 - 0.5);
        mm.userData.speed = 0.12 + (i % 3) * 0.05;
        scene.add(mm); mist.push(mm);
      }

      return {
        update: function (dt, t) {
          for (var i = 0; i < N; i++) {
            life[i] += dt;
            if (life[i] >= max[i]) spawn(i, false);
            var k = i * 3, s = Math.sin(t * 1.3 + ph[i]);
            pos[k] += (vel[k] + s * 0.12) * dt;
            pos[k + 1] += (vel[k + 1] + Math.cos(t * 1.7 + ph[i]) * 0.1) * dt;
            pos[k + 2] += (vel[k + 2] + Math.cos(t * 1.1 + ph[i]) * 0.12) * dt;
            var f = Math.sin(Math.PI * life[i] / max[i]);       // aparece y se apaga
            f *= 0.65 + 0.35 * Math.sin(t * 6 + ph[i] * 3);     // parpadeo
            col[k] = base[0] * f; col[k + 1] = base[1] * f; col[k + 2] = base[2] * f;
          }
          geo.attributes.position.needsUpdate = true;
          geo.attributes.color.needsUpdate = true;
          for (i = 0; i < mist.length; i++) {
            var m = mist[i];
            m.position.x += m.userData.speed * dt;
            if (m.position.x > M.N + 2) m.position.x = -3;
          }
        }
      };
    }
  };
})();
// FIN DE ARCHIVO
