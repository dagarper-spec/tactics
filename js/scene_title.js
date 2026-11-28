// Escena de título: Continuar / Nueva partida. Solo DOM.
window.TT = window.TT || {};
(function () {
  function $(id) { return document.getElementById(id); }
  var armed = false;

  TT.Scenes.add('title', {
    three: false,
    enter: function () {
      var S = TT.Save; S.load(); TT.Party.load(); armed = false;
      var cont = $('hCont'), nw = $('hNew');
      cont.disabled = !S.exists(); nw.textContent = 'Nueva partida';
      $('hSave').textContent = S.summary();
      cont.onclick = function () { TT.Audio.unlock(); TT.Audio.play('ui_confirm'); TT.Scenes.go('area', { id: S.flag('area') || 'village' }); };
      nw.onclick = function () {
        TT.Audio.unlock();
        if (S.exists() && !armed) { armed = true; nw.textContent = 'Pulsa otra vez: se borra la partida'; return; }
        S.fresh(); TT.Party.load(); TT.Audio.play('ui_confirm'); TT.Scenes.go('area', { id: 'house' });
      };
      $('hBat').onclick = function () { TT.Audio.unlock(); TT.Audio.play('ui_confirm'); TT.Scenes.go('battle'); };
    }
  });
})();
// FIN DE ARCHIVO
