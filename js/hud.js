// Panel de información y botones de acción (DOM). No contiene reglas.
window.TT = window.TT || {};
(function () {
  var M = TT.Map;
  var SIDE = { hero: 'Héroe', enemy: 'Enemigo' };
  var TILE = { ground: 'Terreno', deep: 'Agua profunda (no se pisa)', ford: 'Vado (coste 2)', bridge: 'Puente', tree: 'Árbol (bloquea)', rock: 'Roca (bloquea)' };
  var ORIENT = { back: 'Espalda ×1,3', flank: 'Flanco ×1,15', front: 'Frente' };

  function $(id) { return document.getElementById(id); }
  function pct(x) { return (x >= 0 ? '+' : '−') + Math.abs(Math.round(x * 100)) + ' %'; }

  var H = TT.HUD = {};

  H.text = function (html) { $('info').innerHTML = html; };

  // buttons: [{ label, sub, fn, off, main, sys }]. Acciones en cuadrícula de columnas iguales; "sys" (atrás, deshacer, esperar, terminar) en fila aparte y discretos.
  H.buttons = function (list) {
    var box = $('actions'), g = document.createElement('div'), y = document.createElement('div');
    box.innerHTML = ''; g.className = 'grid'; y.className = 'sys';
    list.forEach(function (b) {
      var el = document.createElement('button');
      el.innerHTML = b.label + (b.sub ? '<small>' + b.sub + '</small>' : ''); el.disabled = !!b.off;
      if (b.main) el.className = 'main';
      el.addEventListener('click', b.fn);
      (b.sys ? y : g).appendChild(el);
    });
    if (g.children.length) box.appendChild(g);
    if (y.children.length) box.appendChild(y);
  };

  H.turnLine = function () {
    var T = TT.Turns, u = T.cur;
    return '<span class="rd">R' + T.round + '</span><b class="' + u.side + '">' + u.name + '</b>';
  };

  function ic(t) { return '<img class="ic" src="' + TT.Icons.url(t) + '" alt="">' + TT.TypeNames[t]; }
  // Estados activos y recargas, como etiquetas.
  function st(u) {
    var a = [];
    if (u.taunt > 0) a.push('Provoca ' + u.taunt);
    if (u.slow > 0) a.push('Lento');
    Object.keys(u.cd).forEach(function (k) { if (u.cd[k] > 0) a.push(TT.Skills[k].name + ' ⟳' + u.cd[k]); });
    return a.map(function (x) { return '<span class="tag">' + x + '</span>'; }).join('');
  }
  function n2(x) { return String(+x.toFixed(2)).replace('.', ','); }
  function dots(n, max) { var o = ''; for (var i = 0; i < max; i++) o += i < n ? '●' : '○'; return o; }

  // Tarjeta compacta: nombre, HP, estadísticas, Potenciar, estados y (enemigos) escudos y debilidades.
  H.card = function (u) {
    var s = u.st, c = M.get(u.x, u.y), pc = Math.max(0, Math.round(100 * u.hp / u.maxHp));
    var o = '<div class="row"><b class="' + u.side + '">' + u.name + '</b> <span class="dim">' + SIDE[u.side] + ' · ' +
      M.label(u.x, u.y) + ' · alt ' + Math.max(0, c.h) + '</span></div>' +
      '<div class="hp"><i><b class="' + (pc < 35 ? 'low' : '') + '" style="width:' + pc + '%"></b></i>' + u.hp + '/' + u.maxHp + '</div>' +
      '<div class="chips">' + ['at', 'mg', 'df', 'rs', 'vl', 'mv'].map(function (k) { return '<span>' + k.toUpperCase() + ' <b>' + s[k] + '</b></span>'; }).join('') + '</div>' +
      '<div class="row pot">Potenciar <span class="gold">' + dots(u.boost, TT.Bal.boostMax) + '</span>' + st(u) + '</div>';
    if (u.shieldMax) {
      o += '<div class="row">' + (u.broken ? '<b class="broken">ROTO</b> <span class="dim">sin turno · ×1,5</span>' : 'Escudos <b>' + u.shield + '/' + u.shieldMax + '</b>') +
        ' · Débil: ' + u.weak.map(function (t) { return u.known[t] ? ic(t) : '<b>?</b>'; }).join(' ') + '</div>';
    }
    return o;
  };

  // Pantalla de fin de batalla.
  H.end = function (winner, rounds, alive) {
    var el = $('end'), win = winner === 'hero';
    el.innerHTML = '<h2 class="' + (win ? 'win' : 'lose') + '">' + (win ? '¡Victoria!' : 'Derrota') + '</h2>' +
      '<p>' + (win ? 'Los enemigos han caído.' : 'Los héroes han caído.') + '</p>' +
      '<p>Rondas: <b>' + rounds + '</b> · Héroes en pie: <b>' + alive + '/4</b></p>' +
      '<button id="again">Jugar de nuevo</button>';
    el.hidden = false;
    $('again').addEventListener('click', function () { try { sessionStorage.setItem('tt_retry', '1'); } catch (e) {} location.reload(); });
  };

  H.tile = function (c) { return '<b>' + M.label(c.x, c.y) + '</b> · ' + TILE[c.type] + ' · altura ' + Math.max(0, c.h); };

  var SHAPE = { burst: 'área 3×3', cross: 'cruz', line: 'línea', around: 'alrededor' };

  // Descripción corta de una habilidad (alcance, forma, recarga).
  H.skillHint = function (sk) {
    var a = [];
    if (sk.type) a.push(TT.TypeNames[sk.type]);
    if (sk.shape !== 'self' && sk.shape !== 'around') a.push('alc. ' + sk.range + (sk.melee ? '' : '+'));
    if (SHAPE[sk.shape]) a.push(SHAPE[sk.shape]);
    if (sk.cd) a.push('rec. ' + sk.cd);
    return '<b>' + sk.name + '</b> · ' + a.join(' · ');
  };

  function line(e, att) {
    var u = e.u, n = '<b>' + u.name + '</b>: ';
    if (e.kind === 'heal') return n + '+' + e.amt + ' (' + u.hp + '→' + Math.min(u.maxHp, u.hp + e.amt) + ')';
    if (e.kind === 'bless') return n + '+1 Potenciar';
    var r = e.r, m = [];
    if (r.dl !== 0) m.push('Altura ' + pct(r.mH - 1));
    if (r.orient !== 'front') m.push(ORIENT[r.orient]);
    if (u.broken) m.push('Roto ×1,5');
    if (r.capped) m.push('tope ×3,5');
    var wk = u.known[r.type] && TT.Combat.hitsWeak(u, r.type)           // solo si ya se conoce la debilidad
      ? ' · ' + ic(r.type) + '<b>¡Débil!</b>' + (u.shield === 1 ? ' → <b>¡Rotura!</b>' : '') : '';
    return n + '<b>' + r.dmg + '</b> (' + u.hp + '→' + r.hpAfter + ')' + (r.kill ? ' <b>¡cae!</b>' : '') +
      (m.length ? ' · ' + m.join(' · ') : '') + wk;
  }

  // Previsualización exacta antes de confirmar: una línea por objetivo afectado.
  H.preview = function (att, sk, effects, spend, extra) {
    var out = [H.skillHint(sk)];
    if (!effects.length && !extra) out.push('Sin objetivos en la zona.');
    effects.forEach(function (e) { out.push(line(e, att)); });
    if (extra) out.push(extra);
    if (sk.kind !== 'taunt' && sk.kind !== 'bless')
      out.push('Potenciar ' + spend + '/' + att.boost + (spend ? ' (×' + n2(1 + TT.Bal.boostPer * spend) + ')' : ''));
    return out.join('<br>');
  };

})();
// FIN DE ARCHIVO
