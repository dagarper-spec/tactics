// Controlador de turno: entrada -> lógica -> vista.
// Modos: move, menu, aim, preview, retreat, face, busy, over.
window.TT = window.TT || {};
(function () {
  var P = TT.PAL, M = TT.Map, U = TT.Units, C = TT.Combat, A = TT.Actions, T = TT.Turns, HUD = TT.HUD;

  TT.Selection = {
    init: function (terrain, view, fx, camera, badges, hl) {
      var mode = 'move', insp = null, reach = [], sk = null, aim = null, spend = 0;
      var ray = new THREE.Raycaster(), ndc = new THREE.Vector2();

      function potenciable(s) { return s.kind === 'dmg' || s.kind === 'heal' || s.kind === 'mix'; }
      function back() {                                  // a dónde vuelve "Cancelar"
        var basic = sk === A.kit(T.cur)[0];
        mode = (sk.shape !== 'self' && sk.shape !== 'around' && mode === 'preview') ? 'aim' : (basic ? 'move' : 'menu');
        refresh();
      }
      function choose(s) {
        sk = s; spend = 0; aim = null;
        mode = A.needsAim(s) ? 'aim' : 'preview';
        refresh();
      }

      function startTurn() {
        insp = T.cur; mode = 'move'; sk = null; aim = null; spend = 0;
        T.skipped.forEach(function (u) { fx.number(view.posOf(u), 'Recupera', P.state.shield, false); });
        var p = view.posOf(T.cur); camera.focus(p.x, p.y, p.z);
        TT.QueueUI.refresh();
        refresh();
      }

      function refresh() {
        hl.clear(); badges.refresh();
        var cur = T.cur, btn = [], kit = A.kit(cur), head = HUD.turnLine();
        if (mode === 'over') {
          hl.cursorShow(false); view.select(null);
          HUD.text(T.winner === 'hero' ? '<b>¡Victoria!</b> Todos los enemigos han caído.' : '<b>Derrota.</b> Los héroes han caído.');
          HUD.buttons([{ label: 'Reiniciar', fn: function () { location.reload(); } }]);
          return;
        }
        view.select(cur); hl.cursorShow(true);
        if (mode === 'move') {
          reach = cur.moved ? [] : U.reach(cur);
          reach.forEach(function (r) { if (r.c > 0) hl.add(r.x, r.y, 'move'); });
          HUD.text(head + '<br>' + HUD.card(insp || cur) + (cur.moved ? '' : '<br>Toca una casilla azul para moverte.'));
          btn.push({ label: 'Atacar', fn: function () { choose(kit[0]); } });
          if (kit.length > 1) btn.push({ label: 'Habilidades', fn: function () { mode = 'menu'; refresh(); } });
          btn.push({ label: 'Esperar', fn: function () { T.wait(); mode = 'face'; refresh(); } });
          if (cur.moved) btn.push({ label: 'Deshacer', fn: function () { U.undoMove(cur); view.snap(cur); refresh(); } });
        } else if (mode === 'menu') {
          HUD.text(head + '<br>Elige una habilidad (entre paréntesis, turnos de recarga).');
          btn = kit.slice(1).map(function (s) {
            var cd = A.cd(cur, s);
            return { label: s.name + (cd ? ' (' + cd + ')' : ''), off: !A.available(cur, s), fn: function () { choose(s); } };
          });
          btn.push({ label: 'Atrás', fn: function () { mode = 'move'; refresh(); } });
        } else if (mode === 'aim') {
          var aims = A.aims(cur, sk), single = sk.shape === 'single';
          aims.forEach(function (a) { hl.add(a.x, a.y, single ? (A.isAlly(sk) ? 'heal' : 'target') : 'faint'); });
          HUD.text(head + '<br>' + HUD.skillHint(sk) + '<br>' +
            (!aims.length ? 'Nada a tiro desde aquí.' : single ? 'Toca un objetivo marcado.' : 'Toca la casilla donde apuntar.'));
          btn = [{ label: 'Cancelar', fn: back }];
        } else if (mode === 'preview') {
          var fxs = A.preview(cur, sk, aim, spend), extra = '';
          if (aim) A.area(cur, sk, aim).forEach(function (t) { hl.add(t.x, t.y, A.isAlly(sk) ? 'heal' : 'area'); });
          else if (sk.shape === 'around') A.area(cur, sk, null).forEach(function (t) { hl.add(t.x, t.y, 'area'); });
          if (sk.kind === 'taunt') extra = 'Provoca a ' + A.tauntTargets(cur, sk).length + ' enemigo(s) en radio ' + sk.radius + ' durante ' + sk.turns + ' turnos.';
          spend = Math.min(spend, cur.boost);
          HUD.text(HUD.preview(cur, sk, fxs, spend, extra));
          btn = [{ label: 'Confirmar', off: !fxs.length && sk.kind !== 'taunt', fn: confirm }];
          if (potenciable(sk)) {
            btn.push({ label: 'Potenciar +', off: spend >= cur.boost, fn: function () { spend++; refresh(); } });
            btn.push({ label: 'Potenciar −', off: spend <= 0, fn: function () { spend--; refresh(); } });
          }
          btn.push({ label: 'Cancelar', fn: back });
        } else if (mode === 'retreat') {
          reach = U.reach(cur, sk.retreat);
          reach.forEach(function (r) { if (r.c > 0) hl.add(r.x, r.y, 'move'); });
          HUD.text(head + '<br><b>Retirada</b>: puedes moverte hasta ' + sk.retreat + ' casillas. Toca una casilla azul.');
          btn = [{ label: 'Quedarse', fn: function () { mode = 'face'; refresh(); } }];
        } else if (mode === 'face') {
          TT.DIR.forEach(function (d) { hl.add(cur.x + d[0], cur.y + d[1], 'face'); });
          HUD.text(head + '<br>Toca una casilla vecina para cambiar hacia dónde mira (ahora: ' + TT.DIR_NAMES[cur.face] + ').');
          btn = [{ label: 'Terminar turno', fn: function () { T.endTurn(); changed(); } }];
        }
        HUD.buttons(btn);
      }

      function changed() { if (T.phase === 'over') { mode = 'over'; TT.QueueUI.refresh(); refresh(); } else startTurn(); }

      // Efectos visuales de un resultado (números, destellos, sacudida).
      function play(res) {
        var shake = 0.1;
        res.forEach(function (e) {
          var p = view.posOf(e.u);
          if (e.kind === 'dmg') {
            var r = e.r;
            fx.damage(p, r); view.flash(e.u);
            if (r.weak) fx.number(p, '¡Débil!', P.dmg[r.type], false, 0.55);
            if (r.slowed) fx.number(p, 'Ralentizado', P.dmg.ice, false, 0.8);
            if (r.broke) { fx.number(p, '¡ROTO!', P.state.broken, true, 1.1); shake = Math.max(shake, 0.25); }
            if (r.kill) { view.kill(e.u); shake = Math.max(shake, 0.18); }
          } else if (e.kind === 'heal') fx.number(p, '+' + e.amt, P.state.hp, true);
          else if (e.kind === 'bless') fx.number(p, '+1 Potenciar', P.state.boost, false);
          else if (e.kind === 'taunt') fx.number(p, '¡Provoca!', P.side.select, true);
        });
        camera.shake(shake, 0.2);
      }

      function confirm() {
        var cur = T.cur, res = A.resolve(cur, sk, aim, spend);
        if (aim && (aim.x !== cur.x || aim.y !== cur.y)) { cur.face = TT.faceOf(aim.x - cur.x, aim.y - cur.y); view.face(cur); }
        play(res);
        spend = 0; T.attackDone(); TT.QueueUI.refresh();
        mode = T.phase === 'over' ? 'over' : (sk.retreat ? 'retreat' : 'face');
        refresh();
      }

      function pick(cx, cy) {
        ndc.set((cx / window.innerWidth) * 2 - 1, -(cy / window.innerHeight) * 2 + 1);
        ray.setFromCamera(ndc, camera.camera);
        var hits = ray.intersectObjects(view.picks.concat(terrain.pickables), false);
        for (var i = 0; i < hits.length; i++) {
          var h = hits[i], o = h.object;
          if (o.userData.unit) { if (o.userData.unit.hp > 0) return { unit: o.userData.unit }; continue; }
          var cell = o.userData.cell || M.get(Math.round(h.point.x), Math.round(h.point.z));
          if (cell) { var u = U.at(cell.x, cell.y); return u ? { unit: u } : { cell: cell }; }
        }
        return null;
      }

      function moveTo(path, next) {
        var cur = T.cur;
        U.move(cur, path); mode = 'busy'; hl.clear(); hl.cursorShow(false);
        view.moveAlong(cur, path, function () { mode = next; insp = cur; refresh(); });
      }

      function onTap(cx, cy) {
        if (mode === 'busy' || mode === 'over' || view.busy()) return;
        var p = pick(cx, cy), cur = T.cur;
        if (!p) return;
        var t = p.unit || p.cell;
        if (mode === 'move') {
          if (p.unit) { insp = p.unit; refresh(); return; }
          var path = cur.moved ? null : U.path(reach, t.x, t.y);
          if (path) moveTo(path, 'move');
          else { insp = cur; refresh(); HUD.text(HUD.tile(p.cell)); }
        } else if (mode === 'aim' || mode === 'preview') {
          if (A.needsAim(sk) && A.isAim(cur, sk, t.x, t.y)) { aim = { x: t.x, y: t.y }; mode = 'preview'; refresh(); }
        } else if (mode === 'retreat') {
          var rp = U.path(reach, t.x, t.y);
          if (rp) moveTo(rp, 'face');
        } else if (mode === 'face') {
          var dx = t.x - cur.x, dy = t.y - cur.y;
          if (Math.abs(dx) + Math.abs(dy) === 1) { cur.face = TT.faceOf(dx, dy); view.face(cur); refresh(); }
        }
      }

      T.init(); startTurn();

      return {
        onTap: onTap,
        update: function (time) {
          if (mode === 'over' || mode === 'busy') return;
          hl.cursorAt(view.posOf(T.cur), M.get(T.cur.x, T.cur.y).type === 'ford', time);
        }
      };
    }
  };
})();
// FIN DE ARCHIVO
