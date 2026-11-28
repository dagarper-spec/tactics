// Cámara orbital con giro en pasos de 90°, arrastre para mover y zoom (ratón y táctil).
window.TT = window.TT || {};
(function () {
  var M = TT.Map;
  var TAU = Math.PI * 2;

  var C = TT.Cam = {
    camera: new THREE.PerspectiveCamera(30, 1, 0.5, 120),
    target: new THREE.Vector3(4.5, 0.8, 4.5),
    goal: new THREE.Vector3(4.5, 0.8, 4.5),
    step: 0,                 // 0..3 (pasos de 90°)
    yaw: Math.PI / 4,        // yaw suavizado actual
    yawGoal: Math.PI / 4,
    pitch: 0.82,
    dist: 17, distGoal: 17,
    minDist: 8, maxDist: 26,
    viewH: 600,
    shakeA: 0, shakeT: 0, shakeD: 0.2,

    resize: function (w, h) {
      C.camera.aspect = w / h; C.viewH = h;
      C.camera.updateProjectionMatrix();
    },
    // flat(true, dist): vista frontal fija (interiores 2D); flat(false): vuelve a la cámara isométrica.
    flat: function (on, dist) {
      if (on) { C.pitch = 0; C.yaw = C.yawGoal = 0; C.step = 0; C.minDist = C.maxDist = C.dist = C.distGoal = dist; }
      else if (C.isFlat) { C.pitch = 0.82; C.yaw = C.yawGoal = Math.PI / 4; C.step = 0; C.minDist = 8; C.maxDist = 26; }
      C.isFlat = !!on;
    },
    rotate: function (dir) {
      if (C.isFlat) return;
      C.step = (C.step + dir + 4) % 4;
      C.yawGoal += dir * Math.PI / 2; // acumulado: gira por el camino corto
    },
    // Centra suavemente la cámara en una casilla/posición del mundo.
    focus: function (x, y, z) {
      C.goal.set(Math.max(-1, Math.min(M.N, x)), y, Math.max(-1, Math.min(M.N, z)));
    },
    shake: function (amount, dur) { C.shakeA = amount; C.shakeT = C.shakeD = dur || 0.2; },
    zoom: function (f) {
      C.distGoal = Math.max(C.minDist, Math.min(C.maxDist, C.distGoal * f));
    },
    pan: function (dx, dy) {
      if (C.noPan) return;                                  // en el pueblo la cámara sigue al personaje
      var s = (2 * C.dist * Math.tan(C.camera.fov * Math.PI / 360)) / C.viewH;
      var sy = Math.sin(C.yaw), cy = Math.cos(C.yaw);
      var k = s / Math.sin(C.pitch);
      C.goal.x += -cy * dx * s - sy * dy * k;
      C.goal.z += sy * dx * s - cy * dy * k;
      C.goal.x = Math.max(-1, Math.min(M.N, C.goal.x));
      C.goal.z = Math.max(-1, Math.min(M.N, C.goal.z));
    },

    update: function (dt) {
      var a = 1 - Math.exp(-dt * 9);
      C.yaw += (C.yawGoal - C.yaw) * a;
      C.dist += (C.distGoal - C.dist) * a;
      C.target.lerp(C.goal, a);
      var cp = Math.cos(C.pitch), sp = Math.sin(C.pitch);
      C.camera.position.set(
        C.target.x + Math.sin(C.yaw) * cp * C.dist,
        C.target.y + sp * C.dist,
        C.target.z + Math.cos(C.yaw) * cp * C.dist
      );
      if (C.shakeT > 0) {
        C.shakeT = Math.max(0, C.shakeT - dt);
        var k = C.shakeA * (C.shakeT / C.shakeD);
        C.camera.position.x += (Math.random() - 0.5) * 2 * k;
        C.camera.position.y += (Math.random() - 0.5) * 2 * k;
      }
      C.camera.lookAt(C.target);
    },

    // Enlaza entradas. onTap(clientX, clientY) se llama en un toque corto sin arrastre.
    bind: function (el, onTap) {
      C.onTap = onTap;                                      // se puede volver a llamar al cambiar de escena
      if (C.bound) return;
      C.bound = true;
      var ptrs = {}, count = 0, pinch = 0, down = null;
      function dist2() {
        var k = Object.keys(ptrs), a = ptrs[k[0]], b = ptrs[k[1]];
        return Math.hypot(a.x - b.x, a.y - b.y);
      }
      el.addEventListener('pointerdown', function (e) {
        el.setPointerCapture(e.pointerId);
        ptrs[e.pointerId] = { x: e.clientX, y: e.clientY }; count++;
        if (count === 1) down = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0 };
        if (count === 2) { pinch = dist2(); down = null; }
      });
      el.addEventListener('pointermove', function (e) {
        var p = ptrs[e.pointerId]; if (!p) return;
        var dx = e.clientX - p.x, dy = e.clientY - p.y;
        p.x = e.clientX; p.y = e.clientY;
        if (count === 1) {
          if (down) down.moved += Math.abs(dx) + Math.abs(dy);
          if (!down || down.moved > 8) C.pan(dx, dy);
        } else if (count === 2) {
          var d = dist2();
          if (pinch > 0) C.zoom(pinch / d);
          pinch = d;
        }
      });
      function up(e) {
        if (!ptrs[e.pointerId]) return;
        delete ptrs[e.pointerId]; count = Math.max(0, count - 1);
        if (down && count === 0 && e.type === 'pointerup' && down.moved <= 8 && performance.now() - down.t < 400 && C.onTap) C.onTap(e.clientX, e.clientY);
        if (count === 0) down = null;
        pinch = 0;
      }
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
      el.addEventListener('wheel', function (e) {
        e.preventDefault(); C.zoom(e.deltaY > 0 ? 1.1 : 0.9);
      }, { passive: false });
      window.addEventListener('keydown', function (e) {
        var k = e.key.toLowerCase();
        if (k === 'q') C.rotate(-1); else if (k === 'e') C.rotate(1);
        else if (k === '+' || k === '=') C.zoom(0.9); else if (k === '-') C.zoom(1.1);
      });
    }
  };
})();
// FIN DE ARCHIVO
