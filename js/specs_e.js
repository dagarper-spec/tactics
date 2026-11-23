// Detalles de las clases enemigas: colores, equipo y armas. Se usan desde unitart.js.
window.TT = window.TT || {};
(function () {
  var A = TT.Art, S = TT.Specs = TT.Specs || {}, K = TT.Key;
  function rep(r, n) { var o = []; for (var i = 0; i < n; i++) o.push(r); return o; }
  K.a = '#B98A52'; K.i = '#9AA3B3'; K.j = '#6B7384'; K.e = '#E8DCC0'; K.E = '#B8A888'; K.k = '#B5392F'; K.q = '#FF4A4A'; K.Q = '#FFD0A0'; K.b = '#7A5634';

  S.soldier = {
    cloth: '#A33A35', sleeve: '#8E3030', cuff: '#5A5A66', pants: '#3A3A48', boots: '#2E2A2A', belt: '#2E2A2A', pads: '#7A8394',
    post: function (g, back, p, by) {
      var I = A.ramp('#8C94A4'), R = A.ramp('#D9473F');
      if (back) { A.box(g, 14, 19 + by, 12, 5, I, true); return; }
      A.box(g, 15, 20 + by, 10, 8, I, true); A.px(g, 19, 21 + by, R[2], 2, 5);
      A.box(g, 15, 31, 10, 4, A.ramp('#8E3030'), true);
    },
    gear: function (g, back, p, by) {
      var I = A.ramp('#8C94A4'), R = A.ramp('#D9473F');
      A.blob(g, 13, 4 + by, 14, back ? 14 : 8, I);
      if (!back) { A.px(g, 13, 10 + by, I[3], 14, 1); A.px(g, 19, 11 + by, I[2], 2, 4); A.px(g, 13, 11 + by, I[2], 1, 4); A.px(g, 26, 11 + by, I[3], 1, 4); }
      A.stamp(g, 17, 1 + by, ['.2222.', '12222 3'.replace(' ', ''), '.2233.'], R);
    },
    off: { grip: [3, 4], map: K, bmap: { G: '#4A3322', g: '#7A5634', R: '#4A3322', r: '#6A4A2C' },
      rows: ['..GGGG..', '.GggggG.', 'GggrrggG', 'GgrRRrgG', 'GgrRRrgG', 'GggrrggG', '.GggggG.', '..GGGG..'] },
    prop: { grip: [1, 14], map: K, rows: ['.l.', 'lsd', '.s.'].concat(rep('.w.', 10), rep('.W.', 8)) }
  };

  S.crossbow = {
    cloth: '#6B4A3A', sleeve: '#5A3F32', cuff: '#2E2A2A', pants: '#3A2E28', boots: '#2E2A2A', belt: '#2E2A2A',
    post: function (g, back, p, by) {
      if (!back) A.px(g, 14, 20 + by, A.ramp('#B5392F')[3], 12, 1);
    },
    gear: function (g, back, p, by) {
      var H = A.ramp('#4A3A32'), Sc = A.ramp('#B5392F');
      A.blob(g, 12, 3 + by, 16, back ? 17 : 8, H);
      if (!back) { A.box(g, 12, 7 + by, 2, 9, H, true); A.box(g, 26, 7 + by, 2, 9, H, true); A.box(g, 14, 15 + by, 12, 4, Sc, true); }
      A.box(g, 11, 18 + by, 18, 3, H, true);
    },
    pre: function (g, back, p, by) { if (back) A.box(g, 16, 20 + by, 8, 12, A.ramp('#3A2E28'), true); },
    prop: { grip: [3, 3], map: K, rows: ['.........a.', '.........at', '.........at', 'aaaaaaaaajt', 'bbbbbbbbbjt', '...W.....at', '...W.....at', '.........a.'] }
  };

  S.sorcerer = {
    robe: 1, cloth: '#3A2B4F', trim: '#B5392F', sleeve: '#3A2B4F', cuff: '#B5392F', skin: '#C9B8D2', hair: '#222222', hairStyle: 'none', cast: 1, eye: '#FF4A4A', boots: '#221A2E',
    post: function (g, back, p, by) {
      var Rd = A.ramp('#B5392F');
      A.px(g, 14, 29, Rd[2], 12, 1); if (!back) A.box(g, 19, 20 + by, 2, 9, Rd, false);
    },
    gear: function (g, back, p, by) {
      var H = A.ramp('#2A1F3A'), E = A.ramp('#E8DCC0');
      A.blob(g, 12, 3 + by, 16, back ? 17 : 8, H);
      if (!back) { A.box(g, 12, 7 + by, 2, 11, H, true); A.box(g, 26, 7 + by, 2, 11, H, true); A.px(g, 14, 10 + by, '#14101E', 12, 1); }
      A.box(g, 11, 18 + by, 18, 3, H, true);
      A.stamp(g, 10, 2 + by, ['.ee', '.ee', 'ee.', 'ee.', 'E..'], null, K);
      A.stamp(g, 27, 2 + by, A.flip(['.ee', '.ee', 'ee.', 'ee.', 'E..']), null, K);
    },
    prop: { grip: [3, 4], map: K, rows: ['...q...', '..qQq..', '.qQyQq.', 'qQyyyQq', '.qQyQq.', '..qQq..', '...q...'] }
  };

  S.captain = {
    cloth: '#7A2A2A', sleeve: '#6A2424', cuff: '#C9A24B', pants: '#3A2222', boots: '#2A1A1A', belt: '#C9A24B', pads: '#8E3A3A',
    pre: function (g, back, p, by) { if (!back) A.box(g, 10, 21 + by, 20, 18, A.ramp('#4A1A1A'), false); },
    post: function (g, back, p, by) {
      var Gd = A.ramp('#C9A24B'), P = A.ramp('#8E3A3A');
      if (back) { A.box(g, 10, 20 + by, 20, 20, A.ramp('#4A1A1A'), true); A.px(g, 10, 20 + by, Gd[2], 20, 1); return; }
      A.box(g, 15, 20 + by, 10, 10, P, true);
      for (var i = 0; i < 4; i++) { A.px(g, 16 + i, 22 + by + i, Gd[2]); A.px(g, 23 - i, 22 + by + i, Gd[2]); }
      A.box(g, 15, 31, 10, 5, A.ramp('#6A2424'), true); A.px(g, 15, 31, Gd[2], 10, 1);
    },
    gear: function (g, back, p, by) {
      var H = A.ramp('#5A5260'), Gd = A.ramp('#C9A24B'), E = A.ramp('#E8DCC0');
      A.blob(g, 12, 3 + by, 16, back ? 15 : 13, H);
      if (!back) {
        A.px(g, 14, 10 + by, '#14101E', 12, 2); A.px(g, 16, 11 + by, '#FFD04A', 2, 1); A.px(g, 22, 11 + by, '#FFD04A', 2, 1);
        A.box(g, 14, 13 + by, 12, 6, H, true); A.px(g, 16, 15 + by, H[4], 2, 3); A.px(g, 22, 15 + by, H[4], 2, 3); A.px(g, 19, 14 + by, H[3], 2, 4); A.px(g, 14, 13 + by, Gd[2], 12, 1);
      }
      A.stamp(g, 9, 2 + by, ['.ee', '.ee', 'ee.', 'ee.', 'E..'], null, K);
      A.stamp(g, 28, 2 + by, A.flip(['.ee', '.ee', 'ee.', 'ee.', 'E..']), null, K);
    },
    prop: { grip: [1, 13], map: K, rows: ['.wsl....', '.wlssd..', '.wssssd.', '.wsssssd', '.wssssd.', '.wsssd..', '.wlsd...', '.ww.....'].concat(rep('.w......', 6), rep('.W......', 8)) }
  };
})();
// FIN DE ARCHIVO
