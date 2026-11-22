// Arranque y bucle principal (delta time). Hito 1: escena, cámara y prueba de casillas.
window.TT = window.TT || {};
(function () {
  var P = TT.PAL, M = TT.Map, hex = TT.hex;
  var NAMES = { ground: 'Terreno', deep: 'Agua profunda (no se pisa)', ford: 'Vado (coste 2)', bridge: 'Puente', tree: 'Árbol (bloquea)', rock: 'Roca (bloquea)' };

  function $(id) { return document.getElementById(id); }

  function start() {
    if (typeof THREE === 'undefined' || !THREE.EffectComposer || !THREE.UnrealBloomPass || !THREE.FXAAShader) {
      $('hud').textContent = 'No se pudo cargar three.js. Comprueba la conexión.';
      return;
    }
    var qKey = TT.Quality.pick();
    var R = TT.Render.init($('game'), qKey);
    var scene = R.scene;
    var terrain = TT.Terrain.build(scene, R.q);
    TT.Fort.build(scene, R.q);
    var scenery = TT.Scenery.build(scene, R.q);
    var parts = TT.Particles.build(scene, R.q);
    TT.Cam.bind($('game'), onTap);

    // Cursor de selección y casillas de movimiento (pool fijo).
    var frame = TT.PX.fromRows([
      'XXXX....XXXX', 'X..........X', 'X..........X', 'X..........X', '............', '............',
      '............', '............', 'X..........X', 'X..........X', 'X..........X', 'XXXX....XXXX'
    ], { X: '#FFFFFF' }, 2);
    var cursor = new THREE.Mesh(new THREE.PlaneGeometry(1.02, 1.02), new THREE.MeshBasicMaterial({
      map: TT.PX.tex(frame), color: hex(P.side.select), transparent: true, depthWrite: false
    }));
    cursor.rotation.x = -Math.PI / 2; cursor.visible = false; cursor.renderOrder = 3;
    scene.add(cursor);

    var hlMat = new THREE.MeshBasicMaterial({ color: hex(P.tile.move), transparent: true, opacity: 0.45, depthWrite: false });
    var hlGeo = new THREE.PlaneGeometry(0.94, 0.94), pool = [];
    for (var i = 0; i < 64; i++) {
      var m = new THREE.Mesh(hlGeo, hlMat);
      m.rotation.x = -Math.PI / 2; m.visible = false; m.renderOrder = 2;
      scene.add(m); pool.push(m);
    }

    function surf(c) { return (c.type === 'ford' ? 0.32 : M.topY(c.x, c.y)) + 0.02; }

    var ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    function onTap(cx, cy) {
      ndc.set((cx / window.innerWidth) * 2 - 1, -(cy / window.innerHeight) * 2 + 1);
      ray.setFromCamera(ndc, TT.Cam.camera);
      var hits = ray.intersectObjects(terrain.pickables, false);
      if (!hits.length) return;
      var h = hits[0], cell = h.object.userData.cell;
      if (!cell) { cell = M.get(Math.round(h.point.x), Math.round(h.point.z)); }
      if (!cell) return;
      select(cell);
    }

    function select(c) {
      cursor.position.set(c.x, surf(c) + 0.01, c.y); cursor.visible = true;
      for (var i = 0; i < pool.length; i++) pool[i].visible = false;
      var reach = M.walkable(c.x, c.y) ? M.reach(c.x, c.y, 4) : [];
      for (i = 0; i < reach.length && i < pool.length; i++) {
        var r = M.get(reach[i].x, reach[i].y);
        pool[i].position.set(r.x, surf(r), r.y); pool[i].visible = true;
      }
      $('hud').innerHTML = '<b>' + M.label(c.x, c.y) + '</b> · ' + NAMES[c.type] + ' · altura ' + Math.max(0, c.h) +
        (reach.length ? '<br>Alcance de prueba (MV 4): ' + reach.length + ' casillas' : '');
    }

    // Botones.
    $('rotL').addEventListener('click', function () { TT.Cam.rotate(-1); });
    $('rotR').addEventListener('click', function () { TT.Cam.rotate(1); });
    var qb = $('qual');
    qb.textContent = 'Calidad: ' + R.q.name;
    qb.addEventListener('click', function () {
      var o = TT.Quality.order, k = o[(o.indexOf(qKey) + 1) % o.length];
      TT.Quality.save(k); location.reload();
    });

    // Bucle con delta time (limitado para no dar saltos tras una pausa).
    var last = performance.now(), time = 0, fpsAcc = 0, fpsN = 0, fpsEl = $('fps');
    function frameLoop(now) {
      requestAnimationFrame(frameLoop);
      var dt = Math.max(0, Math.min(0.1, (now - last) / 1000)); last = now; time += dt;
      TT.Cam.update(dt);
      terrain.update(dt);
      scenery.update(dt, TT.Cam.yaw);
      parts.update(dt, time);
      cursor.material.opacity = 0.75 + 0.25 * Math.sin(time * 5);
      R.render();
      fpsAcc += dt; fpsN++;
      if (fpsAcc >= 0.5) { fpsEl.textContent = Math.round(fpsN / fpsAcc) + ' FPS'; fpsAcc = 0; fpsN = 0; }
    }
    requestAnimationFrame(frameLoop);
  }

  window.addEventListener('load', start);
})();
// FIN DE ARCHIVO
