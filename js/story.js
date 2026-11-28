// Guion del prólogo como datos + lógica de progreso (hechos guardados en TT.Save.flag). Sin dependencias de vista salvo TT.Dialog y TT.Scenes.
// Líneas: ['Quién', 'texto'] · ['', 'narración']. Hechos: intro, armor, mother, rumor, b1, b2, river.
window.TT = window.TT || {};
(function () {
  var TYPE = { David: 'warrior', Helen: 'archer', Marta: 'mage', Clara: 'cleric', Madre: 'cleric', Tabernera: 'cleric' };
  var Sy = TT.Story = {};

  var T = {
    intro: [['', 'Una mañana tranquila en la Aldea del Paso.'], ['David', 'Hoy es la feria de caballos, al otro lado del río. Siempre he querido verla.'],
      ['David', 'El camino no es seguro. Quizá debería llevar la armadura de mi padre: está en el cofre del rincón.']],
    chest: [['', 'David abre el cofre. Dentro está la armadura de su padre, limpia y bien cuidada.'], ['David', 'Pesa más de lo que recordaba... pero me queda bien. Gracias, papá.'], ['', 'David se pone la armadura.']],
    chest2: [['David', 'Ya llevo la armadura de mi padre.']],
    mother0: [['Madre', 'David, ¿ya has desayunado? Hoy te veo inquieto.'], ['Madre', 'Tu padre guardó su armadura en el cofre del rincón. Quizá quieras llevarla.']],
    mother1: [['Madre', 'Pero mira qué porte... Te pareces tanto a él.'], ['Madre', 'Escucha: no te fíes de los caminos solitarios y no te separes de la gente buena.'],
      ['Madre', 'Antes de partir, pregunta en la taberna. Allí se enteran de todo.'], ['David', 'Lo haré, madre. Volveré pronto.']],
    mother2: [['Madre', 'Ten cuidado, hijo. Y vuelve a casa.']],
    bar1: [['Tabernera', 'Vaya, el hijo de la casa del camino, con la armadura de su padre.'], ['David', 'Voy a la feria de caballos. ¿Sabes algo del camino?'],
      ['Tabernera', 'Mala cosa. Unos bandidos asaltan a los viajeros en el bosque, antes del río. Los manda un capitán, dicen.'],
      ['Tabernera', 'Ve con cuidado, y no vayas solo si puedes evitarlo.'], ['David', 'Gracias. Estaré atento.']],
    bar2: [['Tabernera', 'Cuidado con el camino del río. Los bandidos no perdonan.']],
    pre1: [['', 'Al llegar al bosque, David oye gritos y el choque de las armas.'], ['Helen', '¡Atrás! ¡Una flecha más y os arrepentiréis!'], ['Marta', '¡Helen, son demasiados!'], ['David', '¡Aguantad! ¡Voy a ayudaros!']],
    post1: [['Helen', 'Gracias, forastero. Nos habrían desplumado. Me llamo Helen.'], ['Marta', 'Y yo Marta. Algo de magia y poca suerte, hoy.'], ['David', 'Soy David. Voy a la feria de caballos, al otro lado del río.'],
      ['Helen', 'Nosotras también. Mejor ir juntos, ¿no?'], ['Marta', 'Más seguros, sí. Vamos.']],
    pre2: [['', 'Poco después, el camino vuelve a cerrarse: los bandidos no han terminado.'], ['Clara', '¡Ayuda! ¡Que alguien me ayude!'], ['David', 'Hay una mujer más allá. ¡Adelante!']],
    post2: [['Clara', 'Me llamo Clara, soy clériga. Os debo la vida. Dejadme acompañaros: sé curar heridas.'], ['Helen', 'Cuantos más seamos, mejor.'], ['David', 'Bienvenida, Clara. Sigamos hacia el río.']],
    pre3: [['', 'El río está cerca. Un capitán y su gente bloquean el paso.'], ['David', 'Es aquí. ¡Que nadie se quede atrás!']],
    post3: [['', 'El paso queda libre. Al otro lado del río, la feria de caballos espera.'], ['David', 'Lo hemos conseguido... Esto es solo el principio.']]
  };

  function L(k) { return T[k].map(function (p) { return { w: p[0], t: TYPE[p[0]], s: p[1] }; }); }
  function F(k, v) { return TT.Save.flag(k, v); }
  function go(enc) { TT.Scenes.go('battle', { enc: enc, story: true }); }
  function play(k, done) { TT.Dialog.play(L(k), done); }

  // Texto de objetivo actual (se muestra bajo el nombre de la zona).
  Sy.goal = function () {
    if (!F('armor')) return 'Objetivo: ponte la armadura de tu padre (cofre de casa).';
    if (!F('mother')) return 'Objetivo: habla con tu madre.';
    if (!F('rumor')) return 'Objetivo: pregunta en la taberna por el camino.';
    if (!F('river')) return 'Objetivo: parte hacia el río por el sur del pueblo.';
    return 'Continuará...';
  };

  // Al entrar en una zona (primera vez en casa: introducción).
  Sy.enter = function (id, done) {
    if (id === 'house' && !F('intro')) { F('intro', 1); play('intro', done); } else if (done) done();
  };

  // Hablar con un NPC: true si el guion se encarga (si no, se usa su frase de siempre).
  Sy.talk = function (n, done) {
    if (n.id === 'madre') { if (!F('armor')) play('mother0', done); else if (!F('mother')) { F('mother', 1); play('mother1', done); } else play('mother2', done); return true; }
    if (n.id === 'tabernera' && F('mother')) { if (!F('rumor')) { F('rumor', 1); play('bar1', done); } else play('bar2', done); return true; }
    return false;
  };

  // Objetos de la casa. dress() se llama cuando David se pone la armadura.
  Sy.spot = function (id, done, dress) {
    if (id !== 'chest') return done && done();
    if (F('armor')) return play('chest2', done);
    F('armor', 1); play('chest', function () { dress(); if (done) done(); });
  };

  // Salida del pueblo hacia el río: devuelve un mensaje si aún no se puede; si no, empieza la batalla que toque.
  Sy.exit = function () {
    if (!F('armor') || !F('mother')) return 'Aún no estoy listo. Debería ponerme la armadura y despedirme de mi madre.';
    if (!F('rumor')) return 'Antes de partir debería preguntar en la taberna si saben algo del camino.';
    if (!F('b1')) { play('pre1', function () { go('ambush1'); }); return null; }
    if (!F('b2')) { play('pre2', function () { go('ambush2'); }); return null; }
    if (!F('river')) { play('pre3', function () { go('river'); }); return null; }
    return 'Continuará: aquí termina esta parte de la historia.';
  };

  // Botón del panel de fin de batalla (Continuar / Reintentar).
  Sy.after = function (enc, win) {
    document.getElementById('end').hidden = true;
    if (!win) return go(enc);
    if (enc === 'ambush1') { F('b1', 1); TT.Dialog.play(L('post1').concat(L('pre2')), function () { go('ambush2'); }); }
    else if (enc === 'ambush2') { F('b2', 1); play('post2', function () { TT.Scenes.go('area', { id: 'village', spawn: 'x' }); }); }
    else { F('river', 1); play('post3', function () { TT.Scenes.go('area', { id: 'village', spawn: 'x' }); }); }
  };
})();
// FIN DE ARCHIVO
