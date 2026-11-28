// Arranque: render compartido, ajustes, bucle con delta time y gestor de escenas.
window.TT = window.TT || {};
(function () {
  function $(id) { return document.getElementById(id); }

  function start() {
    if (typeof THREE === 'undefined' || !THREE.EffectComposer || !THREE.UnrealBloomPass || !THREE.FXAAShader) {
      $('hSave').textContent = 'No se pudo cargar three.js. Comprueba la conexión.';
      document.body.className = 'scene-title';
      return;
    }
    TT.Sheets.load(boot);
  }

  function boot() {
    var qKey = TT.Quality.pick();
    var R = TT.R = TT.Render.init($('game'), qKey);

    $('rotL').addEventListener('click', function () { TT.Cam.rotate(-1); });
    $('rotR').addEventListener('click', function () { TT.Cam.rotate(1); });
    $('cfgBtn').addEventListener('click', function () { var c = $('cfg'); c.hidden = !c.hidden; });
    var A = TT.Audio; A.init();
    var sb = $('snd');
    function sndLook() { sb.style.opacity = A.enabled ? 1 : 0.4; sb.textContent = (A.enabled ? '\u266A ' : '\u2715 ') + 'Sonido'; }
    sndLook();
    sb.addEventListener('click', function () { A.unlock(); A.toggle(); sndLook(); if (A.enabled) A.play('ui_select'); });
    document.addEventListener('pointerdown', function first() { A.unlock(); document.removeEventListener('pointerdown', first); });
    var qb = $('qual');
    qb.textContent = 'Calidad: ' + R.q.name;
    qb.addEventListener('click', function () {
      var o = TT.Quality.order, k = o[(o.indexOf(qKey) + 1) % o.length];
      TT.Quality.save(k); location.reload();
    });

    // Bucle con delta time (limitado para no dar saltos tras una pausa).
    var last = performance.now(), fpsAcc = 0, fpsN = 0, fpsEl = $('fps');
    function frameLoop(now) {
      requestAnimationFrame(frameLoop);
      var raw = Math.max(0, Math.min(0.1, (now - last) / 1000)); last = now;
      TT.Scenes.update(raw, now);
      if (TT.Scenes.is3d()) R.render();
      fpsAcc += raw; fpsN++;
      if (fpsAcc >= 0.5) { fpsEl.textContent = Math.round(fpsN / fpsAcc) + ' FPS'; fpsAcc = 0; fpsN = 0; }
    }
    requestAnimationFrame(frameLoop);

    var retry = false;                                        // "Jugar de nuevo" salta el título
    try { retry = sessionStorage.getItem('tt_retry') === '1'; sessionStorage.removeItem('tt_retry'); } catch (e) {}
    TT.Dialog.init(); TT.Save.load(); TT.Party.load();
    TT.Pack.load(function () { TT.Scenes.go(retry ? 'battle' : 'title', null, true); });
  }

  window.addEventListener('load', start);
})();
// FIN DE ARCHIVO
