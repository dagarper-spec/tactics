// Cola de turnos visible (DOM). Muestra la ronda actual y la siguiente con retratos de los sprites.
window.TT = window.TT || {};
(function () {
  var Q = TT.QueueUI = {};
  var root = null;

  function portrait(u, cls) {
    var d = document.createElement('div');
    d.className = 'qi ' + u.side + (cls ? ' ' + cls : '');
    d.title = u.name;
    var src = TT.UnitArt.canvas(u.type, false), c = document.createElement('canvas');
    c.width = 28; c.height = 34;                          // retrato: cabeza y torso
    c.getContext('2d').drawImage(src, 6, 0, 28, 34, 0, 0, 28, 34);
    d.appendChild(c);
    var bar = document.createElement('i'), fill = document.createElement('b');
    fill.style.width = Math.max(0, Math.round(100 * u.hp / u.maxHp)) + '%';
    if (u.hp / u.maxHp < 0.35) fill.className = 'low';
    bar.appendChild(fill); d.appendChild(bar);
    return d;
  }
  function label(text) {
    var s = document.createElement('span');
    s.className = 'ql'; s.textContent = text;
    return s;
  }

  Q.init = function (el) { root = el; };

  // Redibuja la cola: se llama tras cada cambio (turno, daño), no en cada fotograma.
  Q.refresh = function () {
    if (!root) return;
    var q = TT.Turns.upcoming();
    root.innerHTML = '';
    root.appendChild(label('R' + q.round));
    q.now.forEach(function (u, i) { root.appendChild(portrait(u, i === 0 ? 'cur' : '')); });
    root.appendChild(label('R' + (q.round + 1)));
    q.next.forEach(function (u) { root.appendChild(portrait(u, 'later')); });
  };
})();
// FIN DE ARCHIVO
