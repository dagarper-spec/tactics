// Cuadro de diálogo con retrato: se toca para avanzar. Líneas: { w: 'David', t: 'warrior', s: 'texto' } (sin w = narración). Solo DOM.
window.TT = window.TT || {};
(function () {
  var D = TT.Dialog = { open: false }, q = [], cb = null, at = 0;

  function $(id) { return document.getElementById(id); }

  // Retrato provisional: el sprite de la unidad dibujado en pequeño (se cambiará por retratos propios).
  function portrait(cv, type) {
    var x = cv.getContext('2d'); x.clearRect(0, 0, cv.width, cv.height);
    if (!type) return;
    var src = TT.UnitArt.canvas(type, false), k = Math.min(cv.width / src.width, cv.height / src.height);
    x.imageSmoothingEnabled = false;
    x.drawImage(src, (cv.width - src.width * k) / 2, cv.height - src.height * k, src.width * k, src.height * k);
  }

  function show() {
    var l = q[0], el = $('dlg'); at = performance.now();
    el.className = 'panel' + (l.w ? '' : ' narr');
    $('dlgName').textContent = l.w || '';
    $('dlgText').textContent = l.s;
    $('dlgPic').style.display = l.w ? '' : 'none';
    portrait($('dlgPic'), l.w ? l.t : null);
  }

  function next() {
    if (!D.open || performance.now() - at < 180) return;       // evita saltarse una línea con el mismo toque
    TT.Audio.play('ui_select');
    q.shift();
    if (q.length) return show();
    D.open = false; $('dlg').hidden = true;
    var f = cb; cb = null; if (f) f();
  }

  D.play = function (lines, done) {
    if (!lines || !lines.length) { if (done) done(); return; }
    q = lines.slice(); cb = done || null; D.open = true;
    $('dlg').hidden = false; show();
  };
  D.init = function () { $('dlg').addEventListener('click', next); };
})();
// FIN DE ARCHIVO
