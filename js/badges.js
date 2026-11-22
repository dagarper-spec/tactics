// Insignias sobre las unidades: escudos, debilidades (ocultas con "?" hasta acertarlas), ROTO y puntos de Potenciar.
window.TT = window.TT || {};
(function () {
  var P = TT.PAL, PX = TT.PX;
  var W = 128, H = 40;

  TT.Badges = {
    build: function (scene, view) {
      var list = TT.Units.list.map(function (u) {
        var c = PX.canvas(W, H), t = PX.tex(c);
        var s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false, depthWrite: false }));
        s.scale.set(1.6, 0.5, 1); s.renderOrder = 15; s.visible = false;
        scene.add(s);
        return { u: u, c: c, t: t, s: s };
      });

      function text(g, str, x, y, size, color) {
        g.font = 'bold ' + size + 'px "Courier New", monospace';
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.lineWidth = 4; g.strokeStyle = '#14121F'; g.lineJoin = 'round';
        g.strokeText(str, x, y); g.fillStyle = color; g.fillText(str, x, y);
      }

      function draw(b) {
        var u = b.u, g = b.c.getContext('2d'), has = false;
        g.clearRect(0, 0, W, H);
        if (u.hp > 0 && u.shieldMax > 0) {
          has = true;
          if (u.broken) {
            text(g, 'ROTO', W / 2, 12, 18, P.state.broken);
          } else {
            var n = u.weak.length, w = 24 + n * 19, x0 = Math.round((W - w) / 2);
            var sh = TT.Icons.shield(P.state.shield, 2);
            g.drawImage(sh, x0, 1);
            text(g, String(u.shield), x0 + sh.width / 2, 11, 13, '#14121F');
            for (var i = 0; i < n; i++) {
              var t = u.weak[i], ix = x0 + 24 + i * 19;
              if (u.known[t]) g.drawImage(TT.Icons.canvas(t, 2), ix, 2);
              else text(g, '?', ix + 8, 12, 16, P.ui.dim);
            }
          }
        }
        if (u.hp > 0 && u.boost > 0) {                         // puntos de Potenciar
          has = true;
          var pw = u.boost * 10, px0 = Math.round((W - pw) / 2);
          for (var k = 0; k < u.boost; k++) {
            g.fillStyle = '#14121F'; g.fillRect(px0 + k * 10, 27, 9, 9);
            g.fillStyle = P.state.boost; g.fillRect(px0 + k * 10 + 1, 28, 7, 7);
          }
        }
        b.has = has; b.t.needsUpdate = true;
      }

      return {
        refresh: function () { list.forEach(draw); },
        update: function () {
          for (var i = 0; i < list.length; i++) {
            var b = list[i], p = view.posOf(b.u);
            b.s.visible = !!b.has && b.u.hp > 0;
            if (b.s.visible) b.s.position.set(p.x, p.y + 1.4, p.z);
          }
        }
      };
    }
  };
})();
// FIN DE ARCHIVO
