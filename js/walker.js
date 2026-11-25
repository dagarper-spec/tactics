// Personaje del modo historia (protagonista y NPC): sprite que mira a la cámara, sombra y paseo por casillas. Solo vista.
window.TT = window.TT || {};
(function () {
  var UA = TT.UnitArt, SPEED = 3.4;                         // casillas por segundo

  TT.Walker = {
    make: function (scene, type, x, y, face) {
      var z = UA.size(type), s = z.s, shadowTex = TT.Sprites.shadow();
      var geo = new THREE.PlaneGeometry(z.w * s, z.h * s); geo.translate(0, z.h * s / 2 - (z.m || 3) * s, 0);
      var mat = new THREE.MeshBasicMaterial({ map: UA.tex(type, false), transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, color: 0xf2eefa });
      var w = { type: type, face: face === undefined ? 2 : face, pos: new THREE.Vector3(x, 0, y), path: null, idx: 0, t: 0, phase: 0, done: null, group: new THREE.Group() };
      w.sprite = new THREE.Mesh(geo, mat);
      w.shadow = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ map: shadowTex, color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false }));
      w.shadow.rotation.x = -Math.PI / 2; w.shadow.position.y = 0.02;
      w.pick = new THREE.Mesh(new THREE.BoxGeometry(0.7, z.h * s * 0.9, 0.7), new THREE.MeshBasicMaterial({ visible: false }));
      w.pick.position.y = z.h * s * 0.45; w.pick.userData.walker = w;
      w.group.add(w.shadow, w.sprite, w.pick); w.group.position.copy(w.pos);
      scene.add(w.group);

      w.moving = function () { return !!w.path; };
      w.cell = function () { return { x: Math.round(w.pos.x), y: Math.round(w.pos.z) }; };
      w.place = function (cx, cy, face) { w.path = null; w.pos.set(cx, 0, cy); if (face !== undefined) w.face = face; };
      // cells: [{x,y}] a recorrer desde la posición actual; done() al llegar.
      w.walk = function (cells, done) {
        if (!cells || !cells.length) { if (done) done(); return; }
        w.path = [w.pos.clone()].concat(cells.map(function (c) { return new THREE.Vector3(c.x, 0, c.y); }));
        w.idx = 0; w.t = 0; w.done = done || null;
      };
      w.look = function (dx, dy) { w.face = TT.faceOf(dx, dy); };
      w.update = function (dt, yaw, time) {
        var hop = 0;
        if (w.path) {
          var a = w.path[w.idx], b = w.path[w.idx + 1];
          w.t += dt * SPEED; w.phase += dt * 7;
          var t = Math.min(1, w.t);
          w.pos.lerpVectors(a, b, t);
          w.face = TT.faceOf(b.x - a.x, b.z - a.z);
          hop = 0.02 * Math.abs(Math.sin(Math.PI * w.phase));
          if (w.t >= 1) {
            w.t -= 1; w.idx++;
            if (w.idx >= w.path.length - 1) { w.pos.copy(w.path[w.path.length - 1]); w.path = null; var d = w.done; w.done = null; if (d) d(); }
          }
        }
        w.group.position.copy(w.pos);
        var f = TT.DIR[w.face], sy = Math.sin(yaw), cy = Math.cos(yaw);
        var toCam = f[0] * sy + f[1] * cy, side = f[0] * cy - f[1] * sy;
        var pose = w.path ? 'walk' + (Math.floor(w.phase) % 4) : ((time * 1.8) % 2 < 1 ? 'idle0' : 'idle1');
        var ang = Math.atan2(Math.abs(side), toCam);
        var dir = ang < 0.39 ? 'F' : ang < 1.18 ? 'FS' : ang < 1.96 ? 'S' : ang < 2.75 ? 'BS' : 'B';
        var m = UA.tex(type, toCam < 0, pose, dir);
        if (mat.map !== m) mat.map = m;
        w.sprite.scale.set(side < 0 ? -1 : 1, 1, 1);
        w.sprite.rotation.y = yaw; w.sprite.position.y = hop;
      };
      return w;
    }
  };
})();
// FIN DE ARCHIVO
