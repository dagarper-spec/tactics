// Reproduce visualmente el resultado de una habilidad (números, destellos, sacudida). Solo vista.
window.TT = window.TT || {};
(function () {
  var P = TT.PAL;

  TT.PlayFX = {
    make: function (view, fx, camera) {
      return function play(res) {
        var shake = 0.1;
        res.forEach(function (e) {
          var p = view.posOf(e.u);
          if (e.kind === 'dmg') {
            var r = e.r;
            fx.damage(p, r); view.flash(e.u);
            if (r.weak) fx.number(p, '¡Débil!', P.dmg[r.type], false, 0.55);
            if (r.slowed) fx.number(p, 'Ralentizado', P.dmg.ice, false, 0.8);
            if (r.broke) { fx.number(p, '¡ROTO!', P.state.broken, true, 1.1); shake = Math.max(shake, 0.25); }
            if (r.kill) { view.kill(e.u); shake = Math.max(shake, 0.18); }
          } else if (e.kind === 'heal') fx.number(p, '+' + e.amt, P.state.hp, true);
          else if (e.kind === 'bless') fx.number(p, '+1 Potenciar', P.state.boost, false);
          else if (e.kind === 'taunt') fx.number(p, '¡Provoca!', P.side.select, true);
        });
        camera.shake(shake, 0.2);
      };
    }
  };
})();
// FIN DE ARCHIVO
