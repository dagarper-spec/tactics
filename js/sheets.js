// Hojas de sprites (atlas PNG hechos con tools/make_sheet.py). Si una hoja falta o no carga, la unidad se dibuja por código.
window.TT = window.TT || {};
TT.Sheets = {
  img: {},
  has: function (type) { return !!(TT.SheetData && TT.SheetData[type] && this.img[type]); },
  // Carga todas las hojas declaradas en TT.SheetData y avisa al terminar (haya o no errores).
  load: function (done) {
    var names = Object.keys(TT.SheetData || {}), left = names.length, self = this;
    if (!left || typeof Image === 'undefined') { done(); return; }
    function fin() { if (--left === 0) done(); }
    names.forEach(function (k) {
      var im = new Image();
      im.onload = function () { self.img[k] = im; fin(); };
      im.onerror = fin;
      im.src = 'img/' + k + '.png';
    });
  }
};
// FIN DE ARCHIVO
