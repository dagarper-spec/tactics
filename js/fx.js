// Efectos de vista con pooling: números de daño flotantes. Solo vista.
window.TT = window.TT || {};
(function () {
  var P = TT.PAL, hex = TT.hex;

  TT.FX = {
    build: function (scene) {
      var N = 10, pool = [], cursor = 0;
      for (var i = 0; i < N; i++) {
        var c = TT.PX.canvas(192, 48), t = new THREE.CanvasTexture(c);
        t.minFilter = THREE.LinearFilter; t.generateMipmaps = false;
        var s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false, depthWrite: false }));
        s.renderOrder = 20; s.visible = false; s.scale.set(2.4, 0.6, 1);
        scene.add(s);
        pool.push({ s: s, c: c, t: t, life: 0, max: 1, y0: 0 });
      }

      function draw(p, text, color, size) {
        var g = p.c.getContext('2d');
        g.clearRect(0, 0, 192, 48);
        g.font = 'bold ' + size + 'px "Courier New", monospace';
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.lineWidth = 6; g.strokeStyle = '#14121F'; g.lineJoin = 'round';
        g.strokeText(text, 96, 26); g.fillStyle = color; g.fillText(text, 96, 26);
        p.t.needsUpdate = true;
      }

      return {
        // Reutiliza el siguiente hueco del pool (el más antiguo si todos están en uso).
        number: function (pos, text, color, big, dy) {
          var p = pool[cursor]; cursor = (cursor + 1) % N;
          draw(p, String(text), color, big ? 40 : 30);
          p.y0 = pos.y + 1.4 + (dy || 0); p.s.position.set(pos.x, p.y0, pos.z); p.life = p.max = big ? 1.1 : 0.9; p.s.visible = true;
        },
        damage: function (pos, r) {
          var crit = r.orient === 'back' || r.orient === 'flank';
          this.number(pos, r.dmg, crit ? P.state.crit : P.dmg[r.type], crit);
        },
        update: function (dt) {
          for (var i = 0; i < N; i++) {
            var p = pool[i];
            if (p.life <= 0) continue;
            p.life -= dt;
            if (p.life <= 0) { p.s.visible = false; continue; }
            var k = 1 - p.life / p.max;                       // 0 -> 1
            p.s.position.y = p.y0 + 0.9 * (1 - Math.pow(1 - k, 2));
            p.s.material.opacity = k > 0.7 ? (1 - k) / 0.3 : 1;
          }
        }
      };
    }
  };
})();
// FIN DE ARCHIVO
