// Arranque y bucle principal (delta time). Hito 5: IA enemiga y cierre de batalla.
window.TT = window.TT || {};
(function () {
  function $(id) { return document.getElementById(id); }

  function start() {
    if (typeof THREE === 'undefined' || !THREE.EffectComposer || !THREE.UnrealBloomPass || !THREE.FXAAShader) {
      $('info').textContent = 'No se pudo cargar three.js. Comprueba la conexión.';
      return;
    }
    TT.Sheets.load(boot);
  }

  function boot() {
    var qKey = TT.Quality.pick();
    var R = TT.Render.init($('game'), qKey);
    var terrain = TT.Terrain.build(R.scene, R.q);
    TT.Fort.build(R.scene, R.q);
    var scenery = TT.Scenery.build(R.scene, R.q);
    var parts = TT.Particles.build(R.scene, R.q);

    TT.Units.init();
    var view = TT.UnitView.build(R.scene);
    var fx = TT.FX.build(R.scene);
    TT.Impact.build(R.scene);
    TT.QueueUI.init($('queue'));
    var badges = TT.Badges.build(R.scene, view);
    var hl = TT.Highlight.build(R.scene);
    var sel = TT.Selection.init(terrain, view, fx, TT.Cam, badges, hl);
    TT.Cam.bind($('game'), sel.onTap);

    $('rotL').addEventListener('click', function () { TT.Cam.rotate(-1); });
    $('rotR').addEventListener('click', function () { TT.Cam.rotate(1); });
    var A = TT.Audio; A.init();
    var sb = $('snd');
    function sndLook() { sb.style.opacity = A.enabled ? 1 : 0.4; sb.textContent = A.enabled ? '\u266A' : '\u2715'; }
    sndLook();
    sb.addEventListener('click', function () { A.unlock(); A.toggle(); sndLook(); if (A.enabled) A.play('ui_select'); });
    function first() { A.unlock(); A.playList(['music_battle', 'music_battle2']); document.removeEventListener('pointerdown', first); }
    document.addEventListener('pointerdown', first);
    var qb = $('qual');
    qb.textContent = 'Cal. ' + R.q.name;
    qb.addEventListener('click', function () {
      var o = TT.Quality.order, k = o[(o.indexOf(qKey) + 1) % o.length];
      TT.Quality.save(k); location.reload();
    });

    // Bucle con delta time (limitado para no dar saltos tras una pausa).
    var last = performance.now(), time = 0, fpsAcc = 0, fpsN = 0, fpsEl = $('fps');
    function frameLoop(now) {
      requestAnimationFrame(frameLoop);
      var raw = Math.max(0, Math.min(0.1, (now - last) / 1000)); last = now;
      var dt = raw * TT.Impact.scale(raw); time += dt;
      TT.Impact.update(raw);
      TT.Cam.update(dt);
      terrain.update(dt);
      scenery.update(dt, TT.Cam.yaw);
      parts.update(dt, time);
      view.update(dt, TT.Cam.yaw, time);
      fx.update(dt);
      badges.update();
      sel.update(time, dt);
      R.render();
      fpsAcc += dt; fpsN++;
      if (fpsAcc >= 0.5) { fpsEl.textContent = Math.round(fpsN / fpsAcc) + ' FPS'; fpsAcc = 0; fpsN = 0; }
    }
    requestAnimationFrame(frameLoop);
  }

  window.addEventListener('load', start);
})();
// FIN DE ARCHIVO
