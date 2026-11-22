// Insignias sobre las unidades (alta resolución, suavizadas): escudos restantes, debilidades
// ("?" = oculta hasta acertarla), ROTO y puntos de Potenciar (flecha dorada + cantidad).
window.TT = window.TT || {};
(function () {
  var P = TT.PAL, PX = TT.PX;
  var W = 256, H = 72, INK = '#14121F';

  TT.Badges = {
    build: function (scene, view) {
      var list = TT.Units.list.map(function (u) {
        var c = PX.canvas(W, H), t = new THREE.CanvasTexture(c);
        t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = false;
        var s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false, depthWrite: false }));
        s.scale.set(2.0, 0.56, 1); s.renderOrder = 15; s.visible = false;
        scene.add(s);
        return { u: u, c: c, t: t, s: s };
      });

      function text(g, str, x, y, size, fill) {
        g.font = 'bold ' + size + 'px system-ui, Arial, sans-serif';
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.lineWidth = Math.max(4, size / 4); g.strokeStyle = INK; g.lineJoin = 'round';
        g.strokeText(str, x, y); g.fillStyle = fill; g.fillText(str, x, y);
      }
      function draw(b) {
        var u = b.u, g = b.c.getContext('2d'), has = false, i;
        g.clearRect(0, 0, W, H);
        g.imageSmoothingEnabled = false;                         // los iconos escalan en bloques nítidos
        if (u.hp > 0 && u.shieldMax > 0) {
          has = true;
          if (u.broken) {
            text(g, 'ROTO', W / 2, 20, 34, P.state.broken);
          } else {
            var n = u.weak.length, sh = TT.Icons.shield(P.state.shield, 3), sw = sh.width;
            var w = sw + 10 + n * 36, x0 = Math.round((W - w) / 2);
            g.drawImage(sh, x0, 3);
            text(g, String(u.shield), x0 + sw / 2, 17, 24, '#FFFFFF');
            for (i = 0; i < n; i++) {
              var t = u.weak[i], cx = x0 + sw + 10 + i * 36 + 18;
              if (u.known[t]) { var ic = TT.Icons.canvas(t, 4); g.drawImage(ic, cx - ic.width / 2, 20 - ic.height / 2); }
              else {
                g.beginPath(); g.arc(cx, 20, 15, 0, 6.2832);
                g.fillStyle = P.ui.panel2; g.fill(); g.lineWidth = 2; g.strokeStyle = P.ui.dim; g.stroke();
                text(g, '?', cx, 21, 22, P.ui.text);
              }
            }
          }
        }
        if (u.hp > 0 && u.boost > 0) {                           // Potenciar: flecha dorada x N
          has = true;
          var ar = TT.Icons.boost(3), bx = Math.round(W / 2 - 28);
          g.drawImage(ar, bx, 44);
          text(g, '×' + u.boost, bx + ar.width + 22, 57, 22, P.state.boost);
        }
        b.has = has; b.t.needsUpdate = true;
      }

      return {
        refresh: function () { list.forEach(draw); },
        update: function () {
          for (var i = 0; i < list.length; i++) {
            var b = list[i], p = view.posOf(b.u);
            b.s.visible = !!b.has && b.u.hp > 0;
            if (b.s.visible) b.s.position.set(p.x, p.y + 1.45, p.z);
          }
        }
      };
    }
  };
})();
// FIN DE ARCHIVO
