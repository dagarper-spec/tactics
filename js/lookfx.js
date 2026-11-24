// Acabado HD-2D: desenfoque tilt-shift (efecto maqueta) y corrección de color con sombras frías y luces cálidas.
window.TT = window.TT || {};
(function () {
  var VERT = 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }';

  // Desenfoca más cuanto más lejos del centro de la pantalla (en vertical). 17 muestras en dos anillos.
  TT.TiltShift = {
    uniforms: { tDiffuse: { value: null }, texel: { value: new THREE.Vector2(1 / 1024, 1 / 768) }, focus: { value: 0.5 }, amount: { value: 3.5 } },
    vertexShader: VERT,
    fragmentShader: [
      'uniform sampler2D tDiffuse; uniform vec2 texel; uniform float focus; uniform float amount; varying vec2 vUv;',
      'void main(){',
      '  float b = smoothstep(0.17, 0.52, abs(vUv.y - focus)) * amount;',
      '  vec4 s = texture2D(tDiffuse, vUv) * 0.12;',
      '  for (int i = 0; i < 8; i++) {',
      '    float a = float(i) * 0.7853982;',
      '    vec2 d = vec2(cos(a), sin(a)) * texel;',
      '    s += texture2D(tDiffuse, vUv + d * b * 0.5) * 0.06;',
      '    s += texture2D(tDiffuse, vUv + d * b) * 0.05;',
      '  }',
      '  gl_FragColor = s;',
      '}'
    ].join('\n')
  };

  // Color: sombras hacia azul violáceo, luces hacia cálido, algo de contraste y saturación; viñeta suave.
  TT.Grade = {
    uniforms: { tDiffuse: { value: null }, vignette: { value: 0.35 }, warm: { value: 0.10 }, cool: { value: 0.10 } },
    vertexShader: VERT,
    fragmentShader: [
      'uniform sampler2D tDiffuse; uniform float vignette; uniform float warm; uniform float cool; varying vec2 vUv;',
      'void main(){',
      '  vec4 c = texture2D(tDiffuse, vUv);',
      '  float l = dot(c.rgb, vec3(0.299, 0.587, 0.114));',
      '  c.rgb = mix(vec3(l), c.rgb, 1.12);',
      '  c.rgb = (c.rgb - 0.5) * 1.06 + 0.5;',
      '  c.rgb += vec3(-cool * 0.5, -cool * 0.2, cool) * (1.0 - smoothstep(0.0, 0.5, l)) * 0.6;',
      '  c.rgb += vec3(warm, warm * 0.55, -warm * 0.6) * smoothstep(0.45, 0.95, l) * 0.6;',
      '  float d = distance(vUv, vec2(0.5));',
      '  c.rgb *= 1.0 - smoothstep(0.35, 0.85, d) * vignette;',
      '  gl_FragColor = vec4(max(c.rgb, 0.0), c.a);',
      '}'
    ].join('\n')
  };
})();
// FIN DE ARCHIVO
