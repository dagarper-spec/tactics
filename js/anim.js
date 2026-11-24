// Animaciones de acción: cada habilidad usa un tipo de animación (pose, avance, salto, giro, brillo). Solo vista.
// sample(tipo, p) devuelve, para p entre 0 y 1: pose del sprite, avance (casillas), altura, escala y si emite brillo.
window.TT = window.TT || {};
(function () {
  function sm(a, b, p) { return Math.max(0, Math.min(1, (p - a) / (b - a))); }
  var R = { seq: null, p: 0, pose: 'idle0', fwd: 0, up: 0, sx: 1, sy: 1, glow: 0 };
  // Cada tipo: dur = duración (s), hit = momento del impacto (0-1), f(p) rellena R.
  var K = {
    swing:  { seq: 'sword', dur: 0.6, hit: 0.5, f: function (p) { R.pose = p < 0.35 ? 'atk0' : 'atk1'; R.fwd = p < 0.35 ? -0.05 * p / 0.35 : p < 0.8 ? -0.05 + 0.33 * sm(0.35, 0.55, p) : 0.28 * (1 - sm(0.8, 1, p)); } },
    thrust: { seq: 'sword', dur: 0.5, hit: 0.45, f: function (p) { R.pose = p < 0.3 ? 'atk0' : 'atk1'; R.fwd = p < 0.3 ? -0.1 * p / 0.3 : p < 0.7 ? -0.1 + 0.5 * sm(0.3, 0.45, p) : 0.4 * (1 - sm(0.7, 1, p)); } },
    bash:   { seq: 'shield', dur: 0.55, hit: 0.5, f: function (p) { R.pose = 'atk1'; R.fwd = 0.3 * Math.sin(Math.PI * sm(0.2, 0.75, p)); R.up = 0.1 * Math.sin(Math.PI * sm(0.3, 0.7, p)); R.sy = 1 - 0.06 * Math.sin(Math.PI * sm(0, 0.3, p)); } },
    spin:   { seq: 'whirl', dur: 0.75, hit: 0.5, f: function (p) { R.pose = 'atk1'; R.sx = Math.cos(Math.PI * 4 * sm(0.15, 0.85, p)); R.up = 0.12 * Math.sin(Math.PI * sm(0.15, 0.85, p)); } },
    shoot:  { seq: 'shoot', dur: 0.5, hit: 0.4, f: function (p) { R.pose = 'atk0'; R.fwd = p < 0.4 ? 0 : -0.07 * Math.sin(Math.PI * sm(0.4, 0.8, p)); } },
    aim:    { seq: 'shoot', dur: 0.95, hit: 0.7, f: function (p) { R.pose = 'atk0'; R.sy = 1 - 0.05 * sm(0, 0.65, p); R.fwd = p < 0.7 ? 0 : -0.09 * Math.sin(Math.PI * sm(0.7, 1, p)); R.glow = p < 0.7 ? 1 : 0; } },
    volley: { seq: 'shoot', dur: 0.8, hit: 0.5, f: function (p) { R.pose = 'atk0'; R.up = 0.28 * Math.sin(Math.PI * sm(0.1, 0.9, p)); } },
    cast:   { seq: 'cast', dur: 0.8, hit: 0.65, f: function (p) { R.pose = 'cast'; R.up = 0.06 + 0.04 * Math.sin(p * 12); R.glow = p < 0.7 ? 1 : 0; R.sx = 1 + 0.03 * Math.sin(p * 20); } },
    big:    { seq: 'cast', dur: 1.0, hit: 0.75, f: function (p) { R.pose = 'cast'; R.up = 0.14 * Math.min(1, p * 3) * (1 - sm(0.8, 1, p)); R.glow = p < 0.8 ? 2 : 0; R.sy = 1 + 0.05 * sm(0.7, 0.8, p); } },
    raise:  { seq: 'cast', dur: 0.85, hit: 0.6, f: function (p) { R.pose = 'cast'; R.up = 0.08 * Math.sin(Math.PI * p); R.glow = 1; } },
    shout:  { dur: 0.65, hit: 0.35, f: function (p) { R.pose = 'atk0'; R.up = 0.16 * Math.sin(Math.PI * sm(0, 0.5, p)); R.sy = 1 + 0.1 * Math.sin(Math.PI * sm(0.3, 0.7, p)); R.glow = 1; } }
  };
  // Habilidad -> tipo de animación.
  var OF = { slash: 'swing', cleave: 'swing', stab: 'thrust', shield: 'bash', whirl: 'spin', taunt: 'shout', shot: 'shoot', bolt: 'shoot', retreat: 'shoot',
    aimed: 'aim', rain: 'volley', flame: 'cast', dark: 'cast', ray: 'cast', icelance: 'cast', frost: 'cast', fireball: 'big', blaze: 'big', holy: 'big', heal: 'raise', bless: 'raise' };

  TT.Anim = {
    kindOf: function (id) { return OF[id] || 'swing'; },
    dur: function (kind) { return K[kind].dur; },
    delay: function (id) { var k = K[OF[id] || 'swing']; return k.dur * k.hit; },     // cuándo se ven los números de daño
    sample: function (kind, p) {
      R.seq = K[kind].seq || null; R.p = Math.max(0, Math.min(1, p)); R.pose = 'idle0'; R.fwd = 0; R.up = 0; R.sx = 1; R.sy = 1; R.glow = 0;
      K[kind].f(Math.max(0, Math.min(1, p)));
      return R;
    },
    // Color del brillo según la habilidad (tipo de daño, curación o apoyo).
    glowColor: function (id) {
      var s = TT.Skills[id], P = TT.PAL;
      return s.kind === 'heal' ? P.state.hp : s.kind === 'bless' ? P.state.boost : s.type ? P.dmg[s.type] : '#F5D060';
    }
  };
})();
// FIN DE ARCHIVO
