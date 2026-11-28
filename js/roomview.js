// Vista 2D de las salas interiores dentro del render 3D: la sala es un plano de fondo y cada mueble/personaje un cartel plano; el orden de profundidad sale de la fila.
// Cámara fija de frente (sin giro). Casilla (x, y) = punto del mundo (x, -y). Solo vista.
window.TT = window.TT || {};
(function () {
  var RV = TT.RoomView = {};

  RV.build = function (scene, a) {
    var RA = TT.RoomArt, art = RA.compose(a), group = new THREE.Group(), E = 16;
    scene.background = new THREE.Color(0x0b0805); scene.fog = null; scene.add(group);
    function mat(c) { return new THREE.MeshBasicMaterial({ map: TT.PX.tex(c), transparent: true, alphaTest: 0.4, color: 0xf2eefa }); }
    function X(px) { return (px - art.ox) / E; }
    function Y(py) { return -(py - art.oy) / E; }

    var bg = new THREE.Mesh(new THREE.PlaneGeometry(art.w / E, art.h / E), new THREE.MeshBasicMaterial({ map: TT.PX.tex(art.base), color: 0xf2eefa }));
    bg.position.set(X(art.w / 2), Y(art.h / 2), -0.3); group.add(bg);
    art.props.forEach(function (p) {
      var w = p.c.width / E, h = p.c.height / E, g = new THREE.PlaneGeometry(w, h); g.translate(0, h / 2, 0);
      var m = new THREE.Mesh(g, mat(p.c)); m.position.set(X(Math.round(p.x) + p.c.width / 2), Y(p.yb), 0.01 * (p.row + 0.5)); group.add(m);
    });
    var light = new THREE.AmbientLight(0xffffff, 1); scene.add(light);

    return {
      flat: true, picks: [], group: group, size: { w: art.w, h: art.h }, center: { x: X(art.w / 2), y: Y(art.h / 2) },
      // Casilla de un punto del mundo (intersección del toque con el plano z = 0).
      cellOf: function (p) { return { x: Math.round(p.x), y: Math.round(-p.y) }; },
      // Coloca a los personajes en la sala (el Walker mueve pos en 3D: x, 0, fila).
      place: function (ws) {
        ws.forEach(function (w) { w.group.position.set(w.pos.x, -w.pos.z, 0.01 * w.pos.z + 0.003); w.shadow.visible = false; });
      },
      update: function () {}
    };
  };
})();
// FIN DE ARCHIVO
