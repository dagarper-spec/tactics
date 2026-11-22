// IA enemiga simple. Lógica pura: planifica un turno (mover + una habilidad) sin aplicarlo.
// Prioridades: golpear a quien provoca > rematar > al más débil > acertar debilidades > altura.
window.TT = window.TT || {};
(function () {
  var M = TT.Map, U = TT.Units, C = TT.Combat, A = TT.Actions;
  var AI = TT.AI = {};

  function dist(a, b) { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); }
  function foesOf(u) { return U.list.filter(function (t) { return t.hp > 0 && t.side !== u.side; }); }

  // Coste real de caminar desde (x,y) a cada casilla (respeta ríos, alturas y muros).
  function distMap(x, y) {
    var m = {};
    M.reach(x, y, 99).forEach(function (c) { m[c.x + ',' + c.y] = c.c; });
    return m;
  }

  function score(fx, taunters) {
    var s = 0;
    fx.forEach(function (e) {
      var t = e.u, r = e.r;
      s += Math.min(r.dmg, t.hp);                         // daño útil
      if (r.kill) s += 60;                                // rematar
      s += (1 - t.hp / t.maxHp) * 30;                     // prefiere al más débil
      if (C.hitsWeak(t, r.type)) s += 20;                 // avanza hacia la Rotura
      if (taunters.indexOf(t) >= 0) s += 100;             // Provocar manda
    });
    return s;
  }

  function dmgFx(u, sk, aim, spend) {
    return A.preview(u, sk, aim, spend).filter(function (e) { return e.kind === 'dmg'; });
  }
  function kills(fx) { return fx.filter(function (e) { return e.r.kill; }).length; }

  // Gasta Potenciar si remata más, o si ya va al máximo.
  function chooseSpend(u, sk, aim) {
    var top = kills(dmgFx(u, sk, aim, u.boost));
    if (top > 0) {
      for (var s = 0; s <= u.boost; s++) if (kills(dmgFx(u, sk, aim, s)) === top) return s;
    }
    return u.boost >= 2 ? u.boost : 0;
  }

  AI.plan = function (u) {
    var foes = foesOf(u), kit = A.kit(u), reach = U.reach(u);
    var radius = TT.Skills.taunt.radius;
    var taunters = foes.filter(function (f) { return f.taunt > 0 && dist(u, f) <= radius; });
    var best = null, ox = u.x, oy = u.y;

    reach.forEach(function (r) {
      u.x = r.x; u.y = r.y;                                // simula estar en esa casilla
      kit.forEach(function (sk) {
        if ((sk.kind !== 'dmg' && sk.kind !== 'mix') || !A.available(u, sk)) return;
        var aims = A.needsAim(sk) ? A.aims(u, sk) : [null];
        aims.forEach(function (aim) {
          var fx = dmgFx(u, sk, aim, 0);
          if (!fx.length) return;
          var s = score(fx, taunters) + 4 * C.levelAt(r.x, r.y) - 0.3 * r.c;   // altura sí, caminar poco
          if (!best || s > best.score) best = { score: s, tile: r, skill: sk, aim: aim };
        });
      });
    });
    u.x = ox; u.y = oy;

    if (best) {
      var path = best.tile.c > 0 ? U.path(reach, best.tile.x, best.tile.y) : null;
      u.x = best.tile.x; u.y = best.tile.y;
      var spend = chooseSpend(u, best.skill, best.aim);
      u.x = ox; u.y = oy;
      var look = best.aim || foes.slice().sort(function (a, b) { return dist(best.tile, a) - dist(best.tile, b); })[0];
      return { path: path, skill: best.skill, aim: best.aim, spend: spend,
               face: look ? TT.faceOf(look.x - best.tile.x, look.y - best.tile.y) : u.face, tile: best.tile };
    }

    // Nadie a tiro: acercarse por el camino real al provocador o al enemigo más cercano.
    var pool = taunters.length ? taunters : foes, goal = null, gd = Infinity;
    var here = {};
    pool.forEach(function (f) {
      var m = distMap(f.x, f.y), d = m[u.x + ',' + u.y];
      if (d !== undefined && d < gd) { gd = d; goal = f; here = m; }
    });
    if (!goal) return { path: null, skill: null, aim: null, spend: 0, face: u.face, tile: { x: u.x, y: u.y } };
    var bt = null, bd = Infinity;
    reach.forEach(function (r) {
      var d = here[r.x + ',' + r.y];
      if (d === undefined) return;
      d = d * 10 - C.levelAt(r.x, r.y);                    // más cerca primero; a igualdad, más alto
      if (d < bd) { bd = d; bt = r; }
    });
    var p2 = bt && bt.c > 0 ? U.path(reach, bt.x, bt.y) : null;
    var at = bt || { x: u.x, y: u.y };
    return { path: p2, skill: null, aim: null, spend: 0, face: TT.faceOf(goal.x - at.x, goal.y - at.y), tile: at };
  };

  // Descripción corta para el panel durante el turno enemigo.
  AI.describe = function (u, plan) {
    if (!plan.skill) return '<b>' + u.name + '</b> avanza.';
    var tg = plan.aim ? U.at(plan.aim.x, plan.aim.y) : null;
    return '<b>' + u.name + '</b> usa <b>' + plan.skill.name + '</b>' + (tg ? ' sobre ' + tg.name : '') + '.';
  };
})();
// FIN DE ARCHIVO
