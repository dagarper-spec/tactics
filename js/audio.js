// Audio con WebAudio. Carga opcional desde audio/<nombre>.mp3 (o .ogg): si falta un archivo, ese sonido simplemente no suena.
// Los navegadores exigen un gesto del usuario: TT.Audio.unlock() se llama en el primer toque.
window.TT = window.TT || {};
(function () {
  var A = TT.Audio = { ctx: null, bufs: {}, loading: {}, enabled: true, music: { music: 0.55, sfx: 0.9 }, cur: null, want: null };
  var last = {};

  // Lista completa de sonidos esperados (ver audio/README.md).
  A.NAMES = ['music_battle', 'music_victory', 'music_defeat',
    'ui_select', 'ui_confirm', 'ui_cancel', 'ui_turn', 'step',
    'hit_slash', 'hit_blunt', 'hit_pierce', 'hit_fire', 'hit_ice', 'hit_light', 'hit_back', 'death',
    'shield_hit', 'break', 'recover', 'boost', 'taunt', 'heal'];

  function rd(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function wr(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  A.init = function () { A.enabled = rd('tt_audio') !== '0'; };

  function apply() {
    if (!A.ctx) return;
    A.gM.gain.value = A.enabled ? A.music.music : 0;
    A.gS.gain.value = A.enabled ? A.music.sfx : 0;
  }

  function load(name) {
    if (A.bufs[name] || A.loading[name] || !A.ctx) return;
    A.loading[name] = true;
    var exts = ['mp3', 'ogg'];
    (function next(i) {
      if (i >= exts.length) return;
      fetch('audio/' + name + '.' + exts[i]).then(function (r) {
        if (!r.ok) throw new Error('404');
        return r.arrayBuffer();
      }).then(function (b) {
        A.ctx.decodeAudioData(b, function (buf) {
          A.bufs[name] = buf;
          if (A.want === name) A.playMusic(name, A.wantLoop);
        }, function () { next(i + 1); });
      }).catch(function () { next(i + 1); });
    })(0);
  }

  A.unlock = function () {
    if (A.ctx) { if (A.ctx.state === 'suspended') A.ctx.resume(); return; }
    var C = window.AudioContext || window.webkitAudioContext;
    if (!C) return;
    A.ctx = new C();
    A.gM = A.ctx.createGain(); A.gS = A.ctx.createGain();
    A.gM.connect(A.ctx.destination); A.gS.connect(A.ctx.destination);
    apply();
    A.NAMES.forEach(load);
  };

  A.play = function (name, vol) {
    if (!A.ctx || !A.enabled) return;
    var b = A.bufs[name]; if (!b) return;
    var t = A.ctx.currentTime;
    if (last[name] && t - last[name] < 0.04) return;      // evita ráfagas del mismo sonido
    last[name] = t;
    var s = A.ctx.createBufferSource(), g = A.ctx.createGain();
    s.buffer = b; s.playbackRate.value = 0.96 + Math.random() * 0.08;
    g.gain.value = vol === undefined ? 1 : vol;
    s.connect(g); g.connect(A.gS); s.start();
  };

  // Música: una a la vez, con fundido. loop = false para victoria/derrota.
  A.playMusic = function (name, loop) {
    A.want = name; A.wantLoop = loop !== false;
    if (!A.ctx) return;
    A.stopMusic(true);
    var b = A.bufs[name];
    if (!b) { load(name); return; }
    var s = A.ctx.createBufferSource(), g = A.ctx.createGain();
    s.buffer = b; s.loop = A.wantLoop;
    g.gain.value = 0; g.gain.linearRampToValueAtTime(1, A.ctx.currentTime + 0.8);
    s.connect(g); g.connect(A.gM); s.start();
    A.cur = { s: s, g: g };
  };
  A.stopMusic = function (keepWant) {
    if (!keepWant) A.want = null;
    if (!A.cur || !A.ctx) return;
    var c = A.cur, t = A.ctx.currentTime;
    c.g.gain.cancelScheduledValues(t); c.g.gain.setValueAtTime(c.g.gain.value, t);
    c.g.gain.linearRampToValueAtTime(0, t + 0.6);
    try { c.s.stop(t + 0.65); } catch (e) {}
    A.cur = null;
  };

  A.toggle = function () { A.enabled = !A.enabled; wr('tt_audio', A.enabled ? '1' : '0'); apply(); return A.enabled; };
})();
// FIN DE ARCHIVO
