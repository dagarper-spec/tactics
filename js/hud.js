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

  // buttons: [{ label, fn, off }]
  H.buttons = function (list) {
    var box = $('actions'); box.innerHTML = '';
    list.forEach(function (b) {
      var el = document.createElement('button');
      el.textContent = b.label; el.disabled = !!b.off;
      el.addEventListener('click', b.fn);
      box.appendChild(el);
    });
  };

  H.turnLine = function () {
    var T = TT.Turns, u = T.cur;
    return 'Ronda ' + T.round + ' · Turno de <b>' + u.name + '</b> (' + SIDE[u.side] + ')' +
      (u.side === 'enemy' ? ' · <i>manual hasta el Hito 5</i>' : '');
  };

  function ic(t) { return '<img class="ic" src="' + TT.Icons.url(t) + '" alt="">' + TT.TypeNames[t]; }
  // Estados activos y recargas.
  function st(u) {
    var a = [];
    if (u.taunt > 0) a.push('Provocando (' + u.taunt + ')');
    if (u.slow > 0) a.push('Ralentizado');
    Object.keys(u.cd).forEach(function (k) { if (u.cd[k] > 0) a.push(TT.Skills[k].name + ' en recarga (' + u.cd[k] + ')'); });
    return a.length ? ' · ' + a.join(' · ') : '';
  }
  function n2(x) { return String(+x.toFixed(2)).replace('.', ','); }

  H.card = function (u) {
    var s = u.st, c = M.get(u.x, u.y), ex = '<br>Potenciar ' + u.boost + '/' + TT.Bal.boostMax + st(u);
    if (u.shieldMax) {
      ex += ' · ' + (u.broken ? '<b style="color:#FF3B6B">ROTO</b> (pierde su próximo turno, recibe ×1,5)' : 'Escudos ' + u.shield + '/' + u.shieldMax) +
        '<br>Debilidades: ' + u.weak.map(function (t) { return u.known[t] ? ic(t) : '?'; }).join(' · ') +
        '<br><small>Escudo = golpes de debilidad que faltan para romperlo · ? = debilidad oculta · flecha dorada = Potenciar</small>';
    }
    return '<b>' + u.name + '</b> · ' + SIDE[u.side] + ' · ' + M.label(u.x, u.y) + ' · altura ' + Math.max(0, c.h) +
      ' · mira al ' + TT.DIR_NAMES[u.face] + '<br>HP ' + u.hp + '/' + u.maxHp + ' · AT ' + s.at + ' · MG ' + s.mg +
      ' · DF ' + s.df + ' · RS ' + s.rs + ' · VL ' + s.vl + ' · MV ' + s.mv + ex;
  };

  // Pantalla de fin de batalla.
  H.end = function (winner, rounds, alive) {
    var el = $('end'), win = winner === 'hero';
    el.innerHTML = '<h2 class="' + (win ? 'win' : 'lose') + '">' + (win ? '¡Victoria!' : 'Derrota') + '</h2>' +
      '<p>' + (win ? 'Los enemigos han caído.' : 'Los héroes han caído.') + '</p>' +
      '<p>Rondas: <b>' + rounds + '</b> · Héroes en pie: <b>' + alive + '/4</b></p>' +
      '<button id="again">Jugar de nuevo</button>';
    el.hidden = false;
    $('again').addEventListener('click', function () { location.reload(); });
  };

  H.tile = function (c) { return '<b>' + M.label(c.x, c.y) + '</b> · ' + TILE[c.type] + ' · altura ' + Math.max(0, c.h); };

  var SHAPE = { burst: 'área 3×3', cross: 'cruz de 5', line: 'línea de 3', around: 'las 4 casillas vecinas', self: 'sobre sí mismo' };

  // Descripción corta de una habilidad (alcance, forma, recarga).
  H.skillHint = function (sk) {
    var a = [];
    if (sk.type) a.push(TT.TypeNames[sk.type]);
    if (sk.shape !== 'self' && sk.shape !== 'around') a.push('alcance ' + sk.range + (sk.melee ? '' : ' (+1 por nivel de ventaja)'));
    if (SHAPE[sk.shape]) a.push(SHAPE[sk.shape]);
    if (sk.cd) a.push('recarga ' + sk.cd);
    return '<b>' + sk.name + '</b> · ' + a.join(' · ');
  };

  function line(e, att) {
    var u = e.u, n = '<b>' + u.name + '</b>: ';
    if (e.kind === 'heal') return n + '+' + e.amt + ' PV (HP ' + u.hp + ' → ' + (u.hp + e.amt) + ')';
    if (e.kind === 'bless') return n + '+1 Potenciar';
    var r = e.r, m = [];
    if (r.dl !== 0) m.push('Altura ' + pct(r.mH - 1));
    if (r.orient !== 'front') m.push(ORIENT[r.orient]);
    if (u.broken) m.push('Roto ×1,5');
    if (r.capped) m.push('tope ×3,5');
    var wk = u.known[r.type] && TT.Combat.hitsWeak(u, r.type)           // solo si ya se conoce la debilidad
      ? ' · ' + ic(r.type) + '<b>¡Débil!</b> −1 escudo' + (u.shield === 1 ? ' → <b>¡Rotura!</b>' : '') : '';
    return n + 'daño <b>' + r.dmg + '</b> (HP ' + u.hp + ' → ' + r.hpAfter + ')' + (r.kill ? ' <b>¡derrotado!</b>' : '') +
      (m.length ? ' · ' + m.join(' · ') : '') + wk;
  }

  // Previsualización exacta antes de confirmar: una línea por objetivo afectado.
  H.preview = function (att, sk, effects, spend, extra) {
    var out = [H.skillHint(sk)];
    if (!effects.length && !extra) out.push('Sin objetivos en la zona.');
    effects.forEach(function (e) { out.push(line(e, att)); });
    if (extra) out.push(extra);
    if (sk.kind !== 'taunt' && sk.kind !== 'bless')
      out.push('Potenciar: gastas ' + spend + ' de ' + att.boost + ' disponibles' + (spend ? ' (×' + n2(1 + TT.Bal.boostPer * spend) + ')' : ''));
    return out.join('<br>');
  };

})();
// FIN DE ARCHIVO
