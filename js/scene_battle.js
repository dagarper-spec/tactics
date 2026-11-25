// Escena de batalla: construye el mapa, las unidades y la interfaz de combate (antes en main.js).
window.TT = window.TT || {};
(function () {
  TT.Scenes.add('battle', {
    three: true,
    enter: function () {
      var R = TT.R, A = TT.Audio, time = 0;
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

      A.playList(['music_battle', 'music_battle2']);
      return function (raw) {                                  // delta time (con parada de golpe)
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
      };
    }
  });
  function $(id) { return document.getElementById(id); }
})();
// FIN DE ARCHIVO
