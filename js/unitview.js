// Vista de unidades: sprites que miran a la cámara, anillo de bando, sombra y animación de paso.
window.TT = window.TT || {};
(function () {
  var P = TT.PAL, M = TT.Map, hex = TT.hex, UA = TT.UnitArt, S = 1 / 40;
  var STEP = 0.2;                                   // segundos por casilla

  function wpos(x, y) { return new THREE.Vector3(x, M.topY(x, y), y); }

  TT.UnitView = {
    build: function (scene) {
      var items = [], byId = {}, picks = [], selected = null;
      var shadowTex = TT.Sprites.shadow(), ringGeo = new THREE.RingGeometry(0.3, 0.42, 24);
      var geo = new THREE.PlaneGeometry(UA.W * S, UA.H * S); geo.translate(0, UA.H * S / 2 - 3 * S, 0);
      var shGeo = new THREE.PlaneGeometry(0.9, 0.9);

      TT.Units.list.forEach(function (u, i) {
        var v = { u: u, i: i, path: null, t: 0, idx: 0, done: null, pos: wpos(u.x, u.y), face: u.face };
        v.atk = 0; v.walk = 0; v.big = u.type === 'captain' ? 1.15 : 1;
        v.group = new THREE.Group();
        v.mat = new THREE.MeshBasicMaterial({ map: UA.tex(u.type, false), transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, color: 0xf2eefa });
        v.sprite = new THREE.Mesh(geo, v.mat);
        v.baseCol = hex(u.side === 'hero' ? P.side.hero : P.side.enemy);
        v.ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: v.baseCol, transparent: true, opacity: 0.9, depthWrite: false }));
        v.ring.rotation.x = -Math.PI / 2; v.ring.position.y = 0.03;
        v.shadow = new THREE.Mesh(shGeo, new THREE.MeshBasicMaterial({ map: shadowTex, color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false }));
        v.shadow.rotation.x = -Math.PI / 2; v.shadow.position.y = 0.02;
        v.pick = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.1, 0.7), new THREE.MeshBasicMaterial({ visible: false }));
        v.pick.position.y = 0.55; v.pick.userData.unit = u;
        v.group.add(v.shadow, v.ring, v.sprite, v.pick);
        v.group.position.copy(v.pos);
        v.flash = 0; v.dying = 0;
        scene.add(v.group);
        items.push(v); byId[u.id] = v; picks.push(v.pick);
      });

      var V = {
        picks: picks, items: items,
        busy: function () { return items.some(function (v) { return !!v.path; }); },
        select: function (u) { selected = u; },
        face: function (u) { byId[u.id].face = u.face; },
        flash: function (u) { byId[u.id].flash = 0.3; },
        kill: function (u) { byId[u.id].dying = 0.5; },
        attack: function (u) { byId[u.id].atk = 0.5; },
        // Posición actual en el mundo (para efectos).
        posOf: function (u) { return byId[u.id].pos; },
        // Coloca la vista en la casilla lógica actual (tras deshacer).
        snap: function (u) { var v = byId[u.id]; v.path = null; v.pos.copy(wpos(u.x, u.y)); v.face = u.face; },
        // La lógica ya movió a la unidad; esto solo anima el recorrido.
        moveAlong: function (u, path, done) {
          var v = byId[u.id], pts = [v.pos.clone()];
          path.forEach(function (c) { pts.push(wpos(c.x, c.y)); });
          v.path = pts; v.idx = 0; v.t = 0; v.done = done || null;
        },
        update: function (dt, yaw, time) {
          var sy = Math.sin(yaw), cy = Math.cos(yaw);
          for (var k = 0; k < items.length; k++) {
            var v = items[k], hop = 0;
            if (v.path) {
              var a = v.path[v.idx], b = v.path[v.idx + 1], dy = Math.abs(b.y - a.y);
              var dur = STEP + (dy > 0.01 ? 0.08 : 0);
              v.t += dt / dur;
              var t = Math.min(1, v.t);
              v.pos.lerpVectors(a, b, t);
              hop = Math.sin(Math.PI * t) * (0.16 + dy * 0.5);
              v.face = TT.faceOf(b.x - a.x, b.z - a.z);
              if (v.t >= 1) {
                v.idx++; v.t = 0; TT.Audio.play('step', 0.7);
                if (v.idx >= v.path.length - 1) {
                  v.pos.copy(v.path[v.path.length - 1]); v.path = null;
                  if (v.done) { var d = v.done; v.done = null; d(); }
                }
              }
            }
            v.group.position.copy(v.pos);
            if (v.atk > 0) {                                     // acometida breve hacia donde mira
              v.atk -= dt; var q = Math.sin(Math.PI * Math.max(0, Math.min(1, 1 - v.atk / 0.5))) * 0.2, fd = TT.DIR[v.face];
              v.group.position.x += fd[0] * q; v.group.position.z += fd[1] * q;
            }
            // Frente/espalda según hacia dónde mira respecto a la cámara; espejo según el lado de la pantalla.
            var f = TT.DIR[v.face];
            var toCam = f[0] * sy + f[1] * cy, side = f[0] * cy - f[1] * sy;
            var pose = v.atk > 0.12 ? 'atk' : v.path ? (v.idx % 2 ? 'walk1' : 'walk0') : ((time * 1.8 + v.i * 0.7) % 2 < 1 ? 'idle0' : 'idle1');
            var m = UA.tex(v.u.type, toCam < 0, pose);
            if (v.mat.map !== m) v.mat.map = m;
            v.sprite.scale.set(side < 0 ? -v.big : v.big, v.big, 1);
            v.sprite.rotation.y = yaw;
            v.sprite.position.y = hop;
            var sel = selected === v.u;
            v.ring.material.color.setHex(sel ? hex(P.side.select) : v.baseCol);
            var pulse = sel ? 1 + 0.08 * Math.sin(time * 6) : 1;
            v.ring.scale.set(pulse, pulse, 1);
            v.shadow.scale.set(1 - hop, 1 - hop, 1);
            if (v.flash > 0) v.flash -= dt;                      // destello rojo al recibir daño
            v.mat.color.setHex(v.flash > 0 ? 0xff7070 : (v.u.broken ? 0x8a98d0 : 0xf2eefa));   // azulado si está roto
            if (v.dying > 0) {                                   // desvanecer al morir
              v.dying -= dt;
              v.mat.opacity = Math.max(0, v.dying / 0.5);
              if (v.dying <= 0) { v.dying = -1; v.group.visible = false; }
            }
          }
        }
      };
      return V;
    }
  };
})();
// FIN DE ARCHIVO
