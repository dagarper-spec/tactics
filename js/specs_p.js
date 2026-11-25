// Protagonista del modo historia (sprite provisional dibujado por código; se sustituirá por una hoja de PixelLab).
window.TT = window.TT || {};
(function () {
  var A = TT.Art, S = TT.Specs = TT.Specs || {};

  S.traveler = {
    cloth: '#3F5E9A', sleeve: '#35508A', cuff: '#D9C7A0', pants: '#5A4A3A', boots: '#3A2A22', belt: '#6B4A2F', hair: '#2E2438', hairStyle: 'swept',
    post: function (g, back, p, by) {                         // bufanda naranja y cinto cruzado
      var Sc = A.ramp('#E0742E');
      A.box(g, 13, 18 + by, 14, 4, Sc, true);
      if (!back) { A.px(g, 21, 22 + by, Sc[2], 4, 6); A.px(g, 21, 27 + by, Sc[3], 4, 1); }
      else A.px(g, 14, 22 + by, A.ramp('#6B4A2F')[2], 12, 2);
    },
    gear: function (g, back, p, by) {                         // mochila a la espalda
      if (back) A.box(g, 15, 21 + by, 10, 11, A.ramp('#8A5A32'), true);
    }
  };
})();
// FIN DE ARCHIVO
