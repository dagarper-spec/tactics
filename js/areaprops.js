// Piezas sueltas del pueblo y los interiores: tejado a dos aguas, mobiliario, arbustos, flores y humo. Solo vista.
window.TT = window.TT || {};
(function () {
  var PX = TT.PX, AT = TT.AreaTex, Ar = TT.Areas, B = THREE;

  var P = TT.AreaProps = {};

  // Tejado a dos aguas de w x h casillas (la cumbrera va por el lado largo). Grupo 0: vertientes · grupo 1: hastiales.
  P.roof = function (w, h, roofMat, gableMat) {
    var turn = h > w, a = turn ? h : w, b = turn ? w : h, hw = a / 2 + 0.3, hd = b / 2 + 0.3, H = hd * 0.85, i;
    var V = [-hw, 0, hd, hw, 0, hd, hw, H, 0, -hw, 0, hd, hw, H, 0, -hw, H, 0,
      hw, 0, -hd, -hw, 0, -hd, -hw, H, 0, hw, 0, -hd, -hw, H, 0, hw, H, 0,
      hw, 0, hd, hw, 0, -hd, hw, H, 0, -hw, 0, -hd, -hw, 0, hd, -hw, H, 0];
    var sl = Math.sqrt(hd * hd + H * H), U = [], u, v;
    for (i = 0; i < 12; i++) { u = V[i * 3] + hw; v = V[i * 3 + 1] ? sl : 0; U.push(u, v); }
    for (i = 12; i < 18; i++) U.push(0.3 + (V[i * 3 + 2] + hd) / (2 * hd) * 0.4, 0.6 + V[i * 3 + 1] / H * 0.3);
    var g = new B.BufferGeometry();
    g.setAttribute('position', new B.Float32BufferAttribute(V, 3)); g.setAttribute('uv', new B.Float32BufferAttribute(U, 2));
    g.addGroup(0, 12, 0); g.addGroup(12, 6, 1); g.computeVertexNormals();
    var m = new B.Mesh(g, [roofMat, gableMat]); if (turn) m.rotation.y = Math.PI / 2;
    return m;
  };

  function lam(c) { return new B.MeshLambertMaterial({ map: PX.tex(c) }); }

  // X = { mesh(geo, mat, x, y, z, cast), billboard(canvas, scale, x, z, mat), blob(x, z, r), glow(x, y, z, size, color), wood, stone, group }
  // Devuelve true si el carácter c de la casilla (x, y) es una pieza de este archivo.
  P.cell = function (X, c, x, y, out) {
    if (out) {
      if (c === 'q') { X.mesh(new B.BoxGeometry(0.7, 0.6, 0.7), X.wood, x, 0.3, y); X.mesh(new B.BoxGeometry(0.72, 0.08, 0.72), X.stone, x, 0.62, y, false); return true; }
      if (c === 'o') { X.mesh(new B.CylinderGeometry(0.34, 0.3, 0.75, 10), X.wood, x, 0.37, y); X.mesh(new B.CylinderGeometry(0.35, 0.35, 0.06, 10), X.stone, x, 0.55, y, false); return true; }
      if (c === 'v') { X.mesh(new B.BoxGeometry(0.95, 0.08, 0.36), X.wood, x, 0.4, y); X.mesh(new B.BoxGeometry(0.95, 0.3, 0.06), X.wood, x, 0.62, y - 0.17); X.mesh(new B.BoxGeometry(0.08, 0.4, 0.3), X.wood, x - 0.4, 0.2, y); X.mesh(new B.BoxGeometry(0.08, 0.4, 0.3), X.wood, x + 0.4, 0.2, y); return true; }
      if (c === 'u') { if (!X.bush) X.bush = AT.bush(); X.billboard(X.bush, 1 / 20, x, y); X.blob(x, y, 0.5); return true; }
      return false;
    }
    if (c === 'r') { if (!X.rug) X.rug = lam(AT.rug()); var m = X.mesh(new B.PlaneGeometry(0.96, 0.96), X.rug, x, 0.015, y, false); m.rotation.x = -Math.PI / 2; m.castShadow = false; return true; }
    if (c === 's') { X.mesh(new B.CylinderGeometry(0.2, 0.22, 0.45, 8), X.wood, x, 0.22, y); return true; }
    if (c === 'p') {                                                   // chimenea con fuego
      X.mesh(new B.BoxGeometry(1, 1.3, 0.5), X.stone, x, 0.65, y - 0.25);
      X.mesh(new B.BoxGeometry(0.6, 0.55, 0.1), new B.MeshBasicMaterial({ color: 0x140a06 }), x, 0.35, y + 0.01, false);
      X.glow(x, 0.4, y + 0.1, 1.3, 0xff8a30); X.glow(x, 0.3, y + 0.1, 0.7, 0xffd070);
      return true;
    }
    return false;
  };

  // Flores sueltas sobre la hierba (sitios fijos por casilla, sin tocar caminos ni edificios).
  P.flowers = function (X, a) {
    var cv = [0, 1, 2, 3].map(AT.flower), mats = cv.map(function (c) { return new B.MeshBasicMaterial({ map: PX.tex(c), transparent: true, alphaTest: 0.4, color: 0xe8e2f2 }); });
    for (var y = 0; y < a.H; y++) for (var x = 0; x < a.W; x++) {
      var h = (x * 73 + y * 151 + x * y * 7) % 11;
      if (Ar.ch(a, x, y) !== '.' || h > 2) continue;
      var near = false;                                                // lejos de puertas y casas
      for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) { var q = Ar.ch(a, x + dx, y + dy); if (a.def.doors[q] || (a.def.b && a.def.b[q])) near = true; }
      if (near) continue;
      var k = (x + y * 3) % 4;
      X.billboard(cv[k], 1 / 16, x + ((h - 1) * 0.18), y + ((x % 3) - 1) * 0.15, mats[k]);
    }
  };

  // Humo de chimenea: tres bocanadas que suben y se desvanecen. Devuelve la función update(tiempo).
  P.smoke = function (X, x, y, z) {
    var tex = PX.glowTex(32), puffs = [];
    for (var i = 0; i < 3; i++) {
      var m = new B.Mesh(new B.PlaneGeometry(1, 1), new B.MeshBasicMaterial({ map: tex, color: 0xd8d8e4, transparent: true, depthWrite: false, opacity: 0 }));
      m.position.set(x, y, z); X.group.add(m); X.bills.push(m); puffs.push(m);
    }
    return function (time) {
      puffs.forEach(function (m, i) {
        var t = (time * 0.35 + i / 3) % 1;
        m.position.y = y + t * 1.3; m.position.x = x + t * 0.3; m.scale.set(0.3 + t * 0.5, 0.3 + t * 0.5, 1); m.material.opacity = 0.4 * (1 - t) * Math.min(1, t * 6);
      });
    };
  };
})();
// FIN DE ARCHIVO
