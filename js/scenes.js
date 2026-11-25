// Gestor de escenas (título, batalla, pueblo...). Cada escena: { enter(arg) -> función update(dt, time) opcional, leave(), three: usa el render 3D }.
// La escena activa se refleja como clase "scene-<nombre>" en <body> para que el CSS muestre u oculte la interfaz.
window.TT = window.TT || {};
(function () {
  var FADE = 350;
  var Sc = TT.Scenes = { defs: {}, cur: null, name: '', upd: null, busy: false };

  Sc.add = function (name, def) { Sc.defs[name] = def; };

  // go('batalla', arg, instantaneo)
  Sc.go = function (name, arg, instant) {
    var def = Sc.defs[name];
    if (!def || Sc.busy) return false;
    var fade = document.getElementById('fade');
    function swap() {
      if (Sc.cur && Sc.cur.leave) Sc.cur.leave();
      Sc.cur = def; Sc.name = name; Sc.upd = null;
      document.body.className = 'scene-' + name;
      var r = def.enter ? def.enter(arg) : null;
      Sc.upd = typeof r === 'function' ? r : null;
    }
    if (instant) { swap(); return true; }
    Sc.busy = true; fade.classList.add('on');
    setTimeout(function () {
      swap();
      setTimeout(function () { fade.classList.remove('on'); Sc.busy = false; }, 60);
    }, FADE);
    return true;
  };

  Sc.update = function (raw, now) { if (Sc.upd) Sc.upd(raw, now); };
  Sc.is3d = function () { return !!(Sc.cur && Sc.cur.three); };
})();
// FIN DE ARCHIVO
