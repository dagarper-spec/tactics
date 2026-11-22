// Render: escena, luces, cielo, niebla y postproceso (bloom, viñeta, FXAA).
window.TT = window.TT || {};
(function () {
  var P = TT.PAL, hex = TT.hex;

  var Q = TT.Quality = {
    low:    { name: 'Bajo',  pr: 1,   shadows: false, shadowSize: 512,  bloom: false, fireflies: 14, mist: 0 },
    medium: { name: 'Medio', pr: 1.5, shadows: true,  shadowSize: 1024, bloom: true,  fireflies: 24, mist: 1 },
    high:   { name: 'Alto',  pr: 2,   shadows: true,  shadowSize: 2048, bloom: true,  fireflies: 40, mist: 1 }
  };
  Q.order = ['low', 'medium', 'high'];
  Q.pick = function () {
    var saved = null;
    try { saved = localStorage.getItem('tt_quality'); } catch (e) {}
    if (saved && Q[saved]) return saved;
    var mobile = /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent) || (window.matchMedia && matchMedia('(pointer:coarse)').matches);
    return mobile ? 'medium' : 'high';
  };
  Q.save = function (k) { try { localStorage.setItem('tt_quality', k); } catch (e) {} };

  var VignetteShader = {
    uniforms: { tDiffuse: { value: null }, amount: { value: 0.35 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: [
      'uniform sampler2D tDiffuse; uniform float amount; varying vec2 vUv;',
      'void main(){',
      '  vec4 c = texture2D(tDiffuse, vUv);',
      '  float l = dot(c.rgb, vec3(0.299,0.587,0.114));',
      '  c.rgb = mix(vec3(l), c.rgb, 1.08);',                       // algo más de color
      '  float d = distance(vUv, vec2(0.5));',
      '  c.rgb *= 1.0 - smoothstep(0.35, 0.85, d) * amount;',       // viñeta
      '  gl_FragColor = c;',
      '}'
    ].join('\n')
  };

  TT.Render = {
    init: function (canvas, qKey) {
      var q = Q[qKey], w = window.innerWidth, h = window.innerHeight;
      var pr = Math.min(window.devicePixelRatio || 1, q.pr);
      var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, powerPreference: 'high-performance' });
      renderer.setPixelRatio(pr); renderer.setSize(w, h, false);
      if (q.shadows) { renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap; }

      var scene = new THREE.Scene();
      scene.background = TT.PX.skyTex(P.light.skyTop, P.light.skyLow);
      scene.fog = new THREE.Fog(hex(P.light.fog), 26, 70);

      scene.add(new THREE.AmbientLight(hex(P.light.ambient), 1.1));
      var sun = new THREE.DirectionalLight(hex(P.light.sun), 1.0);
      sun.position.set(7.5, 8, 15.5);
      sun.target.position.set(4.5, 0, 4.5);
      if (q.shadows) {
        sun.castShadow = true;
        sun.shadow.mapSize.set(q.shadowSize, q.shadowSize);
        var sc = sun.shadow.camera; sc.left = -10; sc.right = 10; sc.top = 10; sc.bottom = -10; sc.near = 1; sc.far = 45;
        sun.shadow.bias = -0.0006;
      }
      scene.add(sun); scene.add(sun.target);

      // Postproceso: render -> bloom -> viñeta -> FXAA.
      var composer = new THREE.EffectComposer(renderer);
      composer.setPixelRatio(pr); composer.setSize(w, h);
      composer.addPass(new THREE.RenderPass(scene, TT.Cam.camera));
      var bloom = null;
      if (q.bloom) {
        bloom = new THREE.UnrealBloomPass(new THREE.Vector2(w, h), 0.8, 0.5, 0.78);
        composer.addPass(bloom);
      }
      composer.addPass(new THREE.ShaderPass(VignetteShader));
      var fxaa = new THREE.ShaderPass(THREE.FXAAShader);
      composer.addPass(fxaa);

      var R = { renderer: renderer, scene: scene, composer: composer, sun: sun, bloom: bloom, fxaa: fxaa, pr: pr, q: q };
      R.resize = function () {
        var W = window.innerWidth, H = window.innerHeight;
        renderer.setSize(W, H, false);
        composer.setPixelRatio(pr); composer.setSize(W, H);
        fxaa.material.uniforms.resolution.value.set(1 / (W * pr), 1 / (H * pr));
        TT.Cam.resize(W, H);
      };
      R.render = function () { composer.render(); };
      R.resize();
      window.addEventListener('resize', R.resize);
      return R;
    }
  };
})();
// FIN DE ARCHIVO
