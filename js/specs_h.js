// Detalles de las clases de los héroes: colores, equipo y armas. Se usan desde unitart.js.
window.TT = window.TT || {};
(function () {
  var A = TT.Art, S = TT.Specs = TT.Specs || {};
  var K = TT.Key = { a: '#B98A52', l: '#F4F7FB', s: '#C9D0DA', d: '#8792A3', g: '#E0B24D', G: '#A8802F', w: '#7A5634', W: '#4A3322', t: '#F2E9D8',
    B: '#4A78C2', b: '#6C98DE', n: '#34568F', r: '#C8423A', R: '#8E2B2B', c: '#7FD6FF', C: '#DDF6FF', p: '#B58CFF', y: '#FFF0A0', o: '#FF7A2F' };

  S.warrior = {
    cloth: '#AEB6C4', sleeve: '#9AA3B3', pants: '#5C4A3E', boots: '#4A3A32', belt: '#6B4A2F', hair: '#6A3F22', pads: '#C9D0DA',
    pre: function (g, back, p, by) { if (!back) A.box(g, 12, 22 + by, 16, 16, A.ramp('#9C2F34'), false); },
    post: function (g, back, p, by) {
      var cr = A.ramp('#9C2F34'), B = A.ramp('#4A78C2'), Gd = A.ramp('#E0B24D');
      if (back) { A.box(g, 12, 20 + by, 16, 20, cr, true); A.px(g, 12, 20 + by, Gd[2], 16, 1); return; }
      A.box(g, 17, 20 + by, 6, 12, B, false); A.stamp(g, 19, 22 + by, ['gg', 'gg'], null, K);
      A.box(g, 15, 31, 10, 5, A.ramp('#AEB6C4'), true); A.px(g, 15, 31, Gd[2], 10, 1);    // faldón de placas
      A.px(g, 19, 32, B[2], 2, 4);
    },
    gear: function (g, back, p, by) {
      var St = A.ramp('#C3CAD6'), Gd = A.ramp('#E0B24D'), R = A.ramp('#C8423A');
      A.blob(g, 13, 4 + by, 14, back ? 14 : 8, St);
      if (!back) { A.px(g, 14, 10 + by, Gd[2], 12, 1); A.px(g, 13, 11 + by, St[2], 1, 4); A.px(g, 26, 11 + by, St[3], 1, 4); }
      A.stamp(g, 18, 0 + by, ['.22.', '1222', '1223', '.23.'], R);
    },
    off: { grip: [3, 8], map: K, bmap: { G: '#4A3322', g: '#7A5634', b: '#7A5634', B: '#6A4A2C', n: '#4A3322' },
      rows: ['GggggggG', 'GbbbBBnG', 'GbbgBBnG', 'GbgggBnG', 'GbbgBBnG', '.GbBBnG.', '..GBBG..', '...GG...'] },
    prop: { grip: [2, 14], map: K, rows: ['..l..', '.lsd.', '.lsd.', '.lsd.', '.lsd.', '.lsd.', '.lsd.', '.lsd.', '.lsd.', '.lsd.', '.lsd.', '.lsd.', '.lsd.', 'GgggG', '..w..', '..W..', '..g..'] }
  };

  S.archer = {
    cloth: '#4C9A6E', sleeve: '#4C9A6E', cuff: '#4A3322', pants: '#6A5A44', boots: '#4A3322', belt: '#4A3322', hair: '#B5612C',
    pre: function (g, back, p, by) {
      if (!back) { A.box(g, 8, 15 + by, 4, 13, A.ramp('#7A5634'), true); A.stamp(g, 8, 12 + by, ['r.w', 'rrw', '.rw'], null, K); }
    },
    post: function (g, back, p, by) {
      var Br = A.ramp('#7A5634');
      if (back) { A.box(g, 17, 19 + by, 6, 13, Br, true); A.stamp(g, 17, 16 + by, ['r.w.r', 'rrwrr', '.rwr.'], null, K); }
      else for (var i = 0; i < 11; i++) A.px(g, 15 + i, 20 + by + Math.round(i * 0.7), Br[3]);   // correa
    },
    gear: function (g, back, p, by) {
      var H = A.ramp('#2F7A58');
      A.blob(g, 12, 3 + by, 16, back ? 17 : 8, H);
      if (!back) { A.box(g, 12, 7 + by, 2, 10, H, true); A.box(g, 26, 7 + by, 2, 10, H, true); }
      A.box(g, 11, 18 + by, 18, 3, H, true);
    },
    prop: { grip: [1, 11], map: K, rows: A.flip(['..Ww..', '.Ww.t', '.W..t', 'W...t', 'W...t', 'W...t', 'W...t', 'W...t', 'g...t', 'W...t', 'W...t', 'W...t', 'W...t', 'W...t', '.W..t', '.Ww.t', '..Ww.']) }
  };

  S.mage = {
    robe: 1, cloth: '#6B45B0', trim: '#E0B24D', sleeve: '#6B45B0', cuff: '#E0B24D', hair: '#EDEAF5', hairBack: 1, hairStyle: 'long', cast: 1, boots: '#3B2A5A',
    post: function (g, back, p, by) {
      var Gd = A.ramp('#E0B24D'), V = A.ramp('#9B6BE0');
      A.px(g, 14, 29, Gd[2], 12, 1); if (!back) { A.box(g, 19, 20 + by, 2, 9, V, false); A.px(g, 19, 25 + by, Gd[1], 2, 1); }
    },
    gear: function (g, back, p, by) {
      var H = A.ramp('#5A3A9A'), Gd = A.ramp('#E0B24D');
      for (var r = 0; r < 7; r++) {
        var half = r + 1, x0 = 20 - half + (r < 3 ? 1 : 0), x1 = 19 + half + (r < 3 ? 1 : 0);
        for (var x = x0; x <= x1; x++) A.px(g, x, 1 + r + by, H[x === x0 ? 1 : x >= x1 - 1 ? 3 : 2]);
      }
      A.blob(g, 10, 8 + by, 20, 4, H); A.px(g, 13, 8 + by, Gd[2], 14, 1);
      A.stamp(g, 19, 4 + by, ['y'], null, K);
    },
    prop: { grip: [1, 18], map: K, rows: ['.C.', 'CcC', 'cCc', '.c.', '.w.', '.w.', '.w.', '.w.', '.w.', '.w.', '.w.', '.w.', '.w.', '.w.', '.w.', '.w.', '.W.', '.W.', '.W.', '.W.', '.W.', '.W.', '.W.'] }
  };

  S.cleric = {
    robe: 1, cloth: '#EFE8D4', trim: '#C9A24B', sleeve: '#EFE8D4', cuff: '#C9A24B', hair: '#E0B24D', hairBack: 1, hairStyle: 'long', cast: 1, boots: '#B59B6A',
    post: function (g, back, p, by) {
      var Gd = A.ramp('#E0B24D'), Bl = A.ramp('#4A78C2');
      A.px(g, 14, 29, Bl[2], 12, 2);
      if (!back) { A.px(g, 19, 21 + by, Gd[1], 2, 7); A.px(g, 17, 23 + by, Gd[1], 6, 2); }
    },
    gear: function (g, back, p, by) {
      var Gd = A.ramp('#E0B24D');
      A.px(g, 14, 9 + by, Gd[2], 12, 1); if (!back) A.stamp(g, 19, 8 + by, ['cc'], null, K);
    },
    prop: { grip: [2, 12], map: K, rows: ['.GG..'.slice(0, 5), 'GggG.'.replace('.', 'G'), 'gyggG', 'GgggG', '.GgG.', '..w..', '..w..', '..w..', '..w..', '..w..', '..w..', '..W..', '..W..', '..W..', '..W..', '..g..'] }
  };
})();
// FIN DE ARCHIVO
