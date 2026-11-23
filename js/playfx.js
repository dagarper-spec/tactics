// Reproduce visualmente el resultado de una habilidad (números, destellos, sacudida). Solo vista.
window.TT = window.TT || {};
(function () {
  var P = TT.PAL;

  TT.PlayFX = {
    make: function (view, fx, camera) {
      var S = TT.Audio;
      return function play(res) {
        var shake = 0.1;
        res.forEach(function (e) {
          var p = view.posOf(e.u);
          if (e.kind === 'dmg') {
            var r = e.r;
            fx.damage(p, r); view.flash(e.u);
            S.play('hit_' + r.type);
            var big = r.weak || r.orient !== 'front' || r.kill;
            TT.Impact.burst(p, r.type, big, P.dmg[r.type]);
            TT.Impact.hitstop(r.broke ? 0.14 : big ? 0.07 : 0.035);
            if (r.orient !== 'front') S.play('hit_back', 0.7);
            if (r.weak && !r.broke) S.play('shield_hit');
            if (r.weak) fx.number(p, '¡Débil!', P.dmg[r.type], false, 0.55);
            if (r.slowed) fx.number(p, 'Ralentizado', P.dmg.ice, false, 0.8);
            if (r.broke) { S.play('break'); TT.Impact.burst(p, 'light', true, P.state.broken); fx.number(p, '¡ROTO!', P.state.broken, true, 1.1); shake = Math.max(shake, 0.25); }
            if (r.kill) { S.play('death'); view.kill(e.u); shake = Math.max(shake, 0.18); }
          } else if (e.kind === 'heal') { S.play('heal'); TT.Impact.burst(p, 'heal', false, P.state.hp); fx.number(p, '+' + e.amt, P.state.hp, true); }
          else if (e.kind === 'bless') { S.play('boost'); fx.number(p, '+1 Potenciar', P.state.boost, false); }
          else if (e.kind === 'taunt') { S.play('taunt'); fx.number(p, '¡Provoca!', P.side.select, true); }
        });
        camera.shake(shake, 0.2);
      };
    }
  };
})();
// FIN DE ARCHIVO
