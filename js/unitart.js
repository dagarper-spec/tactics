// Sprites provisionales de unidades: chibi 32x32, 3 tonos, frente y espalda (el espejo se hace en la vista).
window.TT = window.TT || {};
(function () {
  var PX = TT.PX, OL = '#2D2742', SKIN = '#E8B98A', EYE = '#2D2742';
  var A = TT.UnitArt = { cache: {} };

  var KEY = { b: '#D5DAE2', d: '#8F98A6', h: '#7A5634', g: '#C9A24B', s: '#EFE6CF', r: '#D9473F', y: '#FFF0A0', c: '#B58CFF' };
  var PROPS = {
    sword: ['.b.', '.b.', '.b.', '.b.', '.b.', '.b.', '.d.', 'ggg', '.h.', '.h.'],
    spear: ['.b.', 'bbb', '.b.', '.h.', '.h.', '.h.', '.h.', '.h.', '.h.', '.h.', '.h.', '.h.', '.h.', '.h.', '.h.', '.h.', '.h.'],
    bow: ['..h', '.hs', '.hs', 'hs.', 'hs.', 'hs.', 'hs.', 'hs.', 'hs.', '.hs', '.hs', '..h'],
    staff: ['.c.', 'ccc', '.c.', '.h.', '.h.', '.h.', '.h.', '.h.', '.h.', '.h.', '.h.', '.h.', '.h.', '.h.', '.h.', '.h.', '.h.', '.h.', '.h.', '.h.', '.h.', '.h.'],
    mace: ['ggg', 'ggg', '.g.', '.h.', '.h.', '.h.', '.h.', '.h.', '.h.', '.h.', '.h.'],
    crossbow: ['h.....h', 'hh...hh', '.hhhhh.', '..hsh..', '...h...'],
    orb: ['.rr.', 'ryyr', 'rrrr', '.rr.'],
    axe: ['.bbd.', 'bbbbd', 'bbbd.', '..h..', '..h..', '..h..', '..h..', '..h..', '..h..', '..h..', '..h..', '..h..', '..h..']
  };

  // hat: helm | hood | point | horns. props: [nombre, x, y] (se espeja de espaldas).
  var SPEC = {
    warrior:  { body: '#B8BCC6', acc: '#D9A441', legs: '#5E5A55', hair: '#5A3A22', hat: 'helm', pads: 1, shield: 1, props: [['sword', 25, 14]] },
    archer:   { body: '#3E8F6B', acc: '#4FB286', legs: '#6B4A2F', hair: '#8A5A2B', hat: 'hood', props: [['bow', 25, 14]] },
    mage:     { body: '#6B45B0', acc: '#9B6BE0', legs: '#4A2F7A', hair: '#E6E0F0', hat: 'point', robe: 1, props: [['staff', 25, 8]] },
    cleric:   { body: '#F0EAD6', acc: '#C9A24B', legs: '#CFC6AE', hair: '#C9A24B', hat: 'hood', cross: 1, robe: 1, props: [['mace', 25, 13]] },
    soldier:  { body: '#A33A35', acc: '#D9473F', legs: '#4A3322', hair: '#3A2A22', hat: 'helm', pads: 1, props: [['spear', 25, 8]] },
    crossbow: { body: '#7A4A3A', acc: '#D9473F', legs: '#3A2A22', hair: '#2A2A2A', hat: 'hood', props: [['crossbow', 19, 18]] },
    sorcerer: { body: '#3A2A4A', acc: '#D9473F', legs: '#2A2036', hair: '#222222', hat: 'horns', robe: 1, props: [['orb', 25, 12]] },
    captain:  { body: '#7A2A2A', acc: '#C9A24B', legs: '#3A2222', hair: '#2A1A12', hat: 'helm', pads: 1, big: 1, cape: '#8C2F2F', props: [['axe', 24, 11]] }
  };

  function sh(c, f) { return PX.shade(c, f); }
  function box(g, x, y, w, h, c) {
    g.fillStyle = c; g.fillRect(x, y, w, h);
    g.fillStyle = sh(c, 1.22); g.fillRect(x, y, 1, h);
    g.fillStyle = sh(c, 0.76); g.fillRect(x + w - 1, y, 1, h); g.fillRect(x, y + h - 1, w, 1);
  }
  function round(g, x, y, w, h, c) {
    for (var i = 0; i < h; i++) {
      var ins = (i === 0 || i === h - 1) ? 2 : (i === 1 || i === h - 2) ? 1 : 0;
      g.fillStyle = c; g.fillRect(x + ins, y + i, w - ins * 2, 1);
    }
    g.fillStyle = sh(c, 0.84); g.fillRect(x + w - 1, y + 2, 1, h - 4);
  }

  // Dibuja el sprite sin contorno. back = true para la vista de espaldas.
  function draw(s, back) {
    var c = PX.canvas(32, 32), g = c.getContext('2d'), body = s.body, i;
    if (s.cape && !back) box(g, 8, 15, 16, 14, s.cape);
    box(g, 11, 24, 4, 6, s.legs); box(g, 17, 24, 4, 6, s.legs);        // piernas
    g.fillStyle = sh(s.legs, 0.6); g.fillRect(11, 29, 4, 1); g.fillRect(17, 29, 4, 1);

    if (s.robe) {                                                       // túnica trapezoidal
      for (i = 15; i < 29; i++) {
        var hw = 5 + Math.floor((i - 15) * 0.45);
        g.fillStyle = body; g.fillRect(16 - hw, i, hw * 2, 1);
        g.fillStyle = sh(body, 1.2); g.fillRect(16 - hw, i, 1, 1);
        g.fillStyle = sh(body, 0.75); g.fillRect(16 + hw - 1, i, 1, 1);
      }
      g.fillStyle = s.acc; g.fillRect(9, 27, 14, 2); g.fillRect(15, 16, 2, 11);
    } else {
      box(g, 10, 15, 12, 9, body);
      g.fillStyle = s.acc; g.fillRect(10, 21, 12, 1);
      if (!back) g.fillRect(14, 16, 4, 3);
    }
    if (s.pads) { box(g, 6, 14, 5, 4, s.acc); box(g, 21, 14, 5, 4, s.acc); }
    box(g, 7, 16, 3, 7, body); box(g, 22, 16, 3, 7, body);              // brazos
    g.fillStyle = SKIN; g.fillRect(7, 23, 3, 2); g.fillRect(22, 23, 3, 2);
    if (s.cape && back) box(g, 8, 15, 16, 14, s.cape);

    round(g, 10, 3, 12, 12, SKIN);                                      // cabeza
    if (back) {
      round(g, 10, 3, 12, 12, s.hair);
    } else {
      g.fillStyle = EYE; g.fillRect(13, 9, 2, 2); g.fillRect(18, 9, 2, 2);
      g.fillStyle = '#E58F7F'; g.fillRect(11, 11, 2, 1); g.fillRect(20, 11, 2, 1);
      g.fillStyle = '#B5654F'; g.fillRect(15, 12, 3, 1);
      g.fillStyle = s.hair; g.fillRect(11, 3, 10, 4); g.fillRect(10, 5, 2, 5); g.fillRect(20, 5, 2, 5);
      g.fillRect(12, 7, 3, 1); g.fillRect(17, 7, 2, 1);
    }
    var H = s.hat;
    if (H === 'helm') {
      box(g, 9, 2, 14, back ? 11 : 6, body);
      g.fillStyle = s.acc; g.fillRect(15, s.big ? -1 : 0, 2, s.big ? 4 : 3);
    } else if (H === 'hood' || H === 'horns') {
      box(g, 9, 2, 14, back ? 13 : 6, body);
      if (!back) { box(g, 9, 8, 3, 7, body); box(g, 20, 8, 3, 7, body); }
      if (s.cross && !back) { g.fillStyle = s.acc; g.fillRect(15, 3, 2, 4); g.fillRect(14, 4, 4, 1); }
      if (H === 'horns') { g.fillStyle = s.acc; g.fillRect(8, 0, 2, 5); g.fillRect(22, 0, 2, 5); g.fillRect(9, 0, 1, 1); g.fillRect(22, 0, 1, 1); }
    } else if (H === 'point') {
      var W = [2, 4, 6, 8, 10, 12, 12];
      for (i = 0; i < W.length; i++) { g.fillStyle = body; g.fillRect(16 - W[i] / 2, i, W[i], 1); }
      g.fillStyle = sh(body, 0.78); g.fillRect(21, 3, 1, 4);
      box(g, 6, 7, 20, 2, body);
      g.fillStyle = s.acc; g.fillRect(10, 6, 12, 1);
    }

    var cp = PX.fromRows;
    (s.props || []).forEach(function (p) {
      var rows = PROPS[p[0]], w = rows[0].length;
      g.drawImage(cp(rows, KEY), back ? 32 - p[1] - w : p[1], p[2]);
    });
    if (s.shield) {
      var map = { g: KEY.g, S: s.acc };
      g.drawImage(cp(['gggggg', 'gSSSSg', 'gSSSSg', 'gSSSSg', '.gSSg.', '..gg..'], map), back ? 24 : 2, 17);
    }
    return c;
  }

  A.canvas = function (type, back) {
    var k = type + (back ? 'B' : 'F');
    if (!A.cache[k]) A.cache[k] = TT.Sprites.outline(draw(SPEC[type], back), OL);
    return A.cache[k];
  };
  A.tex = function (type, back) { return PX.tex(A.canvas(type, back)); };
})();
// FIN DE ARCHIVO
