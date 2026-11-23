// Efectos de impacto: partículas por tipo de daño (pool fijo) y congelado breve (hit-stop). Solo vista.
window.TT = window.TT || {};
(function () {
  var N = 160;
  // Parámetros por tipo: n partículas, velocidad, empuje vertical, gravedad, vida, tamaño.
  var K = {
    slash:  { n: 10, v: 3.2, up: 1.0, g: 6,   l: 0.35, s: 0.09 },
    blunt:  { n: 12, v: 2.2, up: 1.4, g: 8,   l: 0.45, s: 0.13 },
    pierce: { n: 8,  v: 4.0, up: 0.6, g: 4,   l: 0.30, s: 0.07 },
    fire:   { n: 14, v: 1.4, up: 2.4, g: -3,  l: 0.60, s: 0.13 },
    ice:    { n: 12, v: 2.6, up: 1.6, g: 6,   l: 0.55, s: 0.10 },
    light:  { n: 12, v: 1.2, up: 2.8, g: -2,  l: 0.65, s: 0.11 },
    heal:   { n: 10, v: 0.8, up: 2.2, g: -2,  l: 0.70, s: 0.10 }
  };

  TT.Impact = {
    stop: 0,
    // Congela el tiempo del juego unos milisegundos (se nota en golpes fuertes).
    hitstop: function (sec) { if (sec > this.stop) this.stop = sec; },
    // Factor de tiempo para el bucle: 0 mientras dura el congelado.
    scale: function (dt) { if (this.stop > 0) { this.stop -= dt; return 0.04; } return 1; },

    build: function (scene) {
      var pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
      var geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      var mat = new THREE.PointsMaterial({ size: 0.12, vertexColors: true, transparent: true, depthWrite: false, sizeAttenuation: true });
      var pts = new THREE.Points(geo, mat); pts.frustumCulled = false; scene.add(pts);
      var ps = [], head = 0, i;
      for (i = 0; i < N; i++) { ps.push({ x: 0, y: -99, z: 0, vx: 0, vy: 0, vz: 0, g: 0, t: 0, l: 1 }); pos[i * 3 + 1] = -99; }
      var self = this;

      self.burst = function (p, type, big, color) {
        var k = K[type] || K.slash, c = new THREE.Color(color || '#ffffff'), n = Math.round(k.n * (big ? 1.6 : 1));
        for (var j = 0; j < n; j++) {
          var q = ps[head]; head = (head + 1) % N;
          var a = Math.random() * 6.283, sp = k.v * (0.5 + Math.random() * 0.7);
          q.x = p.x; q.y = p.y + 0.35; q.z = p.z;
          q.vx = Math.cos(a) * sp; q.vz = Math.sin(a) * sp; q.vy = k.up * (0.5 + Math.random());
          q.g = k.g; q.l = k.l * (0.7 + Math.random() * 0.6); q.t = q.l;
          var o = head === 0 ? N - 1 : head - 1;
          col[o * 3] = c.r; col[o * 3 + 1] = c.g; col[o * 3 + 2] = c.b;
        }
      };

      self.update = function (dt) {
        for (var j = 0; j < N; j++) {
          var q = ps[j];
          if (q.t > 0) {
            q.t -= dt; q.vy -= q.g * dt;
            q.x += q.vx * dt; q.y += q.vy * dt; q.z += q.vz * dt;
            pos[j * 3] = q.x; pos[j * 3 + 1] = q.t > 0 ? q.y : -99; pos[j * 3 + 2] = q.z;
          }
        }
        geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true;
      };
      return self;
    }
  };
})();
// FIN DE ARCHIVO
