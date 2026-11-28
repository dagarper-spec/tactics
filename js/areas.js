// Zonas del modo historia (pueblo e interiores): datos y lógica de casillas (paso, puertas, rutas). Sin dependencias de vista.
// Leyenda exterior: . hierba · , camino · : adoquín · T árbol · f valla · w pozo · l farola · u arbusto · q caja · o barril · v banco · H/S/B/M/N edificios · h/s/b/m/n/x puertas.
// Leyenda interior: . suelo · e salida · c mostrador · k estantería · t mesa · s taburete · p chimenea · o barril · r alfombra (se pisa).
window.TT = window.TT || {};
(function () {
  var DEF = {
    village: {
      name: 'Aldea del Paso', kind: 'out', solid: 'TfwlHSBMNuqov',
      rows: ['TTTTTTTTTTTTTTTTTT', 'T..T.............T', 'T.HHH...SSSS.BBBBT', 'T.HHH.u.SSSS.BBBBT', 'T..h..q..s.o..bv.T', 'T.,,,,,,,,,,,,,,.T', 'T.f..,..:::...,.lT', 'T.fMM,..:w:NNN,..T', 'T..MM,..:::NNN,..T', 'T..Tm,,,,,,,n,,..T', 'T....,.......T...T', 'T.l..,..T.....T..T', 'TTTTTTTTTxTTTTTTTT'],
      b: { H: { door: 'h', wall: '#E8D9B8', roof: '#9C4A3A', label: '' }, S: { door: 's', wall: '#D9C7A0', roof: '#3F6FA8', label: 'TIENDA' }, B: { door: 'b', wall: '#C9A98A', roof: '#8A3A2A', label: 'TABERNA' },
        M: { door: 'm', wall: '#C8B890', roof: '#5A7A4A', label: '' }, N: { door: 'n', wall: '#E0C8A0', roof: '#7A4A6A', label: '' } },
      doors: { h: { to: 'house', at: 'e' }, s: { to: 'shop', at: 'e' }, b: { to: 'bar', at: 'e' }, m: { msg: 'La puerta está cerrada con llave.' }, n: { msg: 'Nadie contesta. Parece que no hay nadie en casa.' },
        x: { story: 'exit', out: [0, -1], msg: '' } },
      spawn: 'h', npcs: []
    },
    house: {
      name: 'Casa de David', kind: 'room', flat: true, solid: 'cktopsagy',
      rows: ['kkkkkkkkk', 'y.aa..gg.', '.........', '..rrr.tt.', '..rrr.s..', '.........', '....e....'],
      spots: { a: 'chest' }, doors: { e: { to: 'village', at: 'h', out: [0, -1] } }, spawn: 'e',
      npcs: [{ id: 'madre', type: 'cleric', x: 4, y: 2, face: 2, name: 'Madre', line: 'Ten cuidado, hijo.' }]
    },
    shop: {
      name: 'Tienda', kind: 'room', flat: true, solid: 'cktopsagy',
      rows: ['kkkkkkkkk', '.........', '.ccccc..y', '..rrr....', 'o.rrr...o', '.........', '....e....'],
      doors: { e: { to: 'village', at: 's', out: [0, -1] } }, spawn: 'e',
      npcs: [{ type: 'mage', x: 3, y: 1, face: 2, name: 'Mercader', line: 'Bienvenido. De momento no tengo nada a la venta; vuelve pronto.' }]
    },
    bar: {
      name: 'Taberna', kind: 'room', flat: true, solid: 'cktopsagy',
      rows: ['kkkkkkkkkkk', '.......ppp.', '.ccccccc...', '..rrrrrrr..', '.tt..tt..tt', '.ss..ss..ss', 'o.........o', 'y...e.....y'],
      doors: { e: { to: 'village', at: 'b', out: [0, -1] } }, spawn: 'e',
      npcs: [{ id: 'tabernera', type: 'cleric', x: 4, y: 1, face: 2, name: 'Tabernera', line: 'La mejor sidra del paso. Hoy hay poca gente, siéntete como en casa.' }]
    }
  };
  var DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]], cache = {};

  var Ar = TT.Areas = {};

  // Área ya procesada: cuadrícula, edificios y puertas con su casilla.
  Ar.get = function (id) {
    if (cache[id]) return cache[id];
    var d = DEF[id]; if (!d) return null;
    var a = { id: id, def: d, name: d.name, kind: d.kind, rows: d.rows, W: d.rows[0].length, H: d.rows.length, doors: [], buildings: [], npcs: d.npcs || [] };
    var bb = {};
    d.rows.forEach(function (r, y) {
      if (r.length !== a.W) throw new Error(id + ': fila ' + y + ' con ancho distinto');
      for (var x = 0; x < a.W; x++) {
        var c = r.charAt(x);
        if (d.doors[c]) a.doors.push({ ch: c, x: x, y: y, def: d.doors[c] });
        if (d.b && d.b[c]) { var q = bb[c] || (bb[c] = { ch: c, x0: x, y0: y, x1: x, y1: y, def: d.b[c] }); q.x1 = Math.max(q.x1, x); q.y1 = Math.max(q.y1, y); q.x0 = Math.min(q.x0, x); q.y0 = Math.min(q.y0, y); }
      }
    });
    Object.keys(bb).forEach(function (k) {
      var q = bb[k]; q.w = q.x1 - q.x0 + 1; q.h = q.y1 - q.y0 + 1;
      q.door = a.doors.filter(function (o) { return o.ch === q.def.door; })[0];
      a.buildings.push(q);
    });
    return (cache[id] = a);
  };

  Ar.ch = function (a, x, y) { return x < 0 || y < 0 || x >= a.W || y >= a.H ? '#' : a.rows[y].charAt(x); };
  Ar.npcAt = function (a, x, y) { return a.npcs.filter(function (n) { return n.x === x && n.y === y; })[0] || null; };
  Ar.solid = function (a, x, y) { var c = Ar.ch(a, x, y); return c === '#' || a.def.solid.indexOf(c) >= 0 || !!Ar.npcAt(a, x, y); };
  Ar.doorAt = function (a, x, y) { return a.doors.filter(function (o) { return o.x === x && o.y === y; })[0] || null; };
  Ar.doorByCh = function (a, ch) { return a.doors.filter(function (o) { return o.ch === ch; })[0] || null; };
  Ar.buildingAt = function (a, x, y) { return a.buildings.filter(function (q) { return x >= q.x0 && x <= q.x1 && y >= q.y0 && y <= q.y1; })[0] || null; };

  // Ruta más corta (4 direcciones) sin contar la casilla de salida; null si no hay.
  Ar.path = function (a, from, to) {
    if (Ar.solid(a, to.x, to.y)) return null;
    var prev = {}, key = function (x, y) { return x + ',' + y; }, q = [from], i = 0;
    prev[key(from.x, from.y)] = null;
    while (i < q.length) {
      var c = q[i++];
      if (c.x === to.x && c.y === to.y) {
        var out = [];
        for (var p = c; p && !(p.x === from.x && p.y === from.y); p = prev[key(p.x, p.y)]) out.unshift({ x: p.x, y: p.y });
        return out;
      }
      for (var k = 0; k < 4; k++) {
        var nx = c.x + DIRS[k][0], ny = c.y + DIRS[k][1];
        if (prev[key(nx, ny)] !== undefined || Ar.solid(a, nx, ny)) continue;
        prev[key(nx, ny)] = c; q.push({ x: nx, y: ny });
      }
    }
    return null;
  };

  // Casilla más cercana desde la que se puede hablar con (x,y): hasta 2 casillas de distancia (así se habla por encima de un mostrador).
  Ar.beside = function (a, x, y, from) {
    var best = null, bl = 1e9;
    for (var dx = -2; dx <= 2; dx++) for (var dy = -2; dy <= 2; dy++) {
      if (!dx && !dy || Math.abs(dx) + Math.abs(dy) > 2) continue;
      var t = { x: x + dx, y: y + dy };
      if (t.x === from.x && t.y === from.y) return t;
      var p = Ar.path(a, from, t);
      if (p && p.length < bl) { bl = p.length; best = t; }
    }
    return best;
  };
})();
// FIN DE ARCHIVO
