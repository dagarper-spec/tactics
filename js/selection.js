// Controlador de turno: entrada -> lógica -> vista.
// Modos: move, menu, aim, preview, retreat, face, busy, over.
window.TT = window.TT || {};
(function () {
  var S = TT.Audio, P = TT.PAL, M = TT.Map, U = TT.Units, C = TT.Combat, A = TT.Actions, T = TT.Turns, HUD = TT.HUD;

  TT.Selection = {
    init: function (terrain, view, fx, camera, badges, hl) {
      var mode = 'move', insp = null, reach = [], sk = null, aim = null, spend = 0, timers = [];
      function later(sec, fn) { timers.push({ t: sec, fn: fn }); }
      var ray = new THREE.Raycaster(), ndc = new THREE.Vector2();

      function potenciable(s) { return s.kind === 'dmg' || s.kind === 'heal' || s.kind === 'mix'; }
      function back() {                                  // a dónde vuelve "Cancelar"
        var basic = sk === A.kit(T.cur)[0];
        S.play('ui_cancel');
        mode = (sk.shape !== 'self' && sk.shape !== 'around' && mode === 'preview') ? 'aim' : (basic ? 'move' : 'menu');
        refresh();
      }
      function choose(s) {
        S.play('ui_select'); sk = s; spend = 0; aim = null;
        mode = A.needsAim(s) ? 'aim' : 'preview';
        refresh();
      }

      function startTurn() {
        insp = T.cur; mode = 'move'; sk = null; aim = null; spend = 0;
        T.skipped.forEach(function (u) { S.play('recover'); fx.number(view.posOf(u), 'Recupera', P.state.shield, false); });
        var p = view.posOf(T.cur); camera.focus(p.x, p.y, p.z);
        TT.QueueUI.refresh();
        if (T.cur.side === 'enemy') runAI(); else { S.play('ui_turn'); refresh(); }
      }

      function refresh() {
        hl.clear(); badges.refresh();
        var cur = T.cur, btn = [], kit = A.kit(cur), head = HUD.turnLine();
        if (mode === 'over') {
          hl.cursorShow(false); view.select(null);
          HUD.text('Fin de la batalla.'); HUD.buttons([]);
          if (!S.ended) { S.ended = true; S.list = false; S.playMusic(T.winner === 'hero' ? 'music_victory' : 'music_defeat', false); }
          HUD.end(T.winner, T.round, U.list.filter(function (u) { return u.side === 'hero' && u.hp > 0; }).length);
          return;
        }
        view.select(cur); hl.cursorShow(true);
        if (mode === 'move') {
          reach = cur.moved ? [] : U.reach(cur);
          reach.forEach(function (r) { if (r.c > 0) hl.add(r.x, r.y, 'move'); });
          HUD.text(head + '<br>' + HUD.card(insp || cur) + (cur.moved ? '' : '<br><span class="dim">Toca una casilla azul para moverte.</span>'));
          btn.push({ label: 'Atacar', sub: TT.TypeNames[kit[0].type] || '', fn: function () { choose(kit[0]); } });
          if (kit.length > 1) btn.push({ label: 'Habilidades', sub: (kit.length - 1) + ' disponibles', fn: function () { mode = 'menu'; refresh(); } });
          btn.push({ label: 'Esperar', sys: 1, fn: function () { T.wait(); mode = 'face'; refresh(); } });
          if (cur.moved) btn.push({ label: 'Deshacer', sys: 1, fn: function () { S.play('ui_cancel'); U.undoMove(cur); view.snap(cur); refresh(); } });
        } else if (mode === 'menu') {
          HUD.text(head + '<br><span class="dim">Elige habilidad (⟳ = recarga).</span>');
          btn = kit.slice(1).map(function (s) {
            var cd = A.cd(cur, s);
            return { label: s.name, sub: (TT.TypeNames[s.type] || (s.kind === 'heal' ? 'Curación' : 'Apoyo')) + (cd ? ' · ⟳' + cd : ''), off: !A.available(cur, s), fn: function () { choose(s); } };
          });
          btn.push({ label: 'Atrás', sys: 1, fn: function () { mode = 'move'; refresh(); } });
        } else if (mode === 'aim') {
          var aims = A.aims(cur, sk), single = sk.shape === 'single';
          aims.forEach(function (a) { hl.add(a.x, a.y, single ? (A.isAlly(sk) ? 'heal' : 'target') : 'faint'); });
          HUD.text(head + '<br>' + HUD.skillHint(sk) + '<br>' +
            (!aims.length ? 'Nada a tiro desde aquí.' : single ? 'Toca un objetivo.' : 'Toca dónde apuntar.'));
          btn = [{ label: 'Cancelar', sys: 1, fn: back }];
        } else if (mode === 'preview') {
          var fxs = A.preview(cur, sk, aim, spend), extra = '';
          if (aim) A.area(cur, sk, aim).forEach(function (t) { hl.add(t.x, t.y, A.isAlly(sk) ? 'heal' : 'area'); });
          else if (sk.shape === 'around') A.area(cur, sk, null).forEach(function (t) { hl.add(t.x, t.y, 'area'); });
          if (sk.kind === 'taunt') extra = 'Provoca a ' + A.tauntTargets(cur, sk).length + ' enemigo(s) · radio ' + sk.radius + ' · ' + sk.turns + ' turnos';
          spend = Math.min(spend, cur.boost);
          HUD.text(HUD.preview(cur, sk, fxs, spend, extra));
          btn = [{ label: 'Confirmar', main: 1, off: !fxs.length && sk.kind !== 'taunt', fn: confirm }];
          if (potenciable(sk)) {
            btn.push({ label: 'Potenciar +', off: spend >= cur.boost, fn: function () { spend++; refresh(); } });
            btn.push({ label: 'Potenciar −', off: spend <= 0, fn: function () { spend--; refresh(); } });
          }
          btn.push({ label: 'Cancelar', sys: 1, fn: back });
        } else if (mode === 'retreat') {
          reach = U.reach(cur, sk.retreat);
          reach.forEach(function (r) { if (r.c > 0) hl.add(r.x, r.y, 'move'); });
          HUD.text(head + '<br><b>Retirada</b>: hasta ' + sk.retreat + ' casillas. Toca una azul.');
          btn = [{ label: 'Quedarse', sys: 1, fn: function () { mode = 'face'; refresh(); } }];
        } else if (mode === 'face') {
          TT.DIR.forEach(function (d) { hl.add(cur.x + d[0], cur.y + d[1], 'face'); });
          HUD.text(head + '<br><span class="dim">Toca una casilla vecina para girar (mira al ' + TT.DIR_NAMES[cur.face] + ').</span>');
          btn = [{ label: 'Terminar turno', sys: 1, fn: function () { if (view.busy()) return; S.play('ui_confirm'); T.endTurn(); changed(); } }];
        }
        HUD.buttons(btn);
      }

      function changed() { if (T.phase === 'over') { mode = 'over'; TT.QueueUI.refresh(); refresh(); } else startTurn(); }

      var play = TT.PlayFX.make(view, fx, camera);

      function confirm() {
        S.play('ui_confirm');
        var cur = T.cur, res = A.resolve(cur, sk, aim, spend);
        if (aim && (aim.x !== cur.x || aim.y !== cur.y)) { cur.face = TT.faceOf(aim.x - cur.x, aim.y - cur.y); view.face(cur); }
        var dl = TT.Anim.delay(sk.id);
        view.attack(cur, sk.id); later(dl, function () { play(res); });
        spend = 0; T.attackDone(); TT.QueueUI.refresh();
        mode = T.phase === 'over' ? 'busy' : (sk.retreat ? 'retreat' : 'face');
        refresh();
        if (T.phase === 'over') later(dl + 1.2, function () { mode = 'over'; refresh(); });
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
          if (p.unit) { S.play('ui_select'); insp = p.unit; refresh(); return; }
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

      // Turno enemigo automático, con pausas para que se pueda seguir lo que ocurre.
      function runAI() {
        var cur = T.cur, plan = TT.AI.plan(cur);
        mode = 'busy'; hl.clear(); badges.refresh(); view.select(cur); hl.cursorShow(true);
        HUD.buttons([]); HUD.text(HUD.turnLine() + '<br>' + HUD.card(cur));
        function finish() {
          cur.face = plan.face; view.face(cur);
          if (T.phase === 'act') T.wait();
          hl.clear(); T.endTurn(); changed();
        }
        function act() {
          if (!plan.skill) { finish(); return; }
          var s = plan.skill, a = plan.aim;
          if (a) A.area(cur, s, a).forEach(function (t) { hl.add(t.x, t.y, 'area'); });
          else if (s.shape === 'around') A.area(cur, s, null).forEach(function (t) { hl.add(t.x, t.y, 'area'); });
          HUD.text(HUD.turnLine() + '<br>' + TT.AI.describe(cur, plan));
          later(1.1, function () {
            var res = A.resolve(cur, s, a, plan.spend);
            if (a && (a.x !== cur.x || a.y !== cur.y)) { cur.face = TT.faceOf(a.x - cur.x, a.y - cur.y); view.face(cur); }
            var dl = TT.Anim.delay(s.id);
            view.attack(cur, s.id); later(dl, function () { play(res); }); hl.clear(); T.attackDone(); badges.refresh(); TT.QueueUI.refresh();
            if (T.phase === 'over') later(1.1 + dl, function () { mode = 'over'; refresh(); });
            else later(1.3 + dl, finish);
          });
        }
        later(0.45, function () {
          if (plan.path) { U.move(cur, plan.path); view.moveAlong(cur, plan.path, function () { later(0.25, act); }); }
          else act();
        });
      }

      T.init(); startTurn();

      return {
        onTap: onTap,
        update: function (time, dt) {
          for (var i = timers.length - 1; i >= 0; i--) {          // temporizadores por delta time
            timers[i].t -= dt;
            if (timers[i].t <= 0) { var f = timers[i].fn; timers.splice(i, 1); f(); }
          }
          if (mode === 'over') return;
          hl.cursorAt(view.posOf(T.cur), M.get(T.cur.x, T.cur.y).type === 'ford', time);
        }
      };
    }
  };
})();
// FIN DE ARCHIVO
