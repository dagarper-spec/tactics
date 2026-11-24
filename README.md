# Tactics

RPG táctico HD-2D (three.js, scripts clásicos, sin módulos). Fase 1: una batalla pulida.

Estado: **Hito 6 completo + acabado HD-2D** (batalla completa jugable: turnos, altura y orientación, escudos y Rotura, Potenciar, habilidades de las 4 clases, IA enemiga y pantalla final). Abre `index.html` o activa GitHub Pages (rama `main`, carpeta root).

Controles: tocar/clic = seleccionar unidad o mover a casilla azul · arrastrar = mover cámara · pellizco/rueda = zoom · Q/E o botones = girar 90°.

## Sprites desde hojas PNG
`tools/make_sheet.py hoja.png nombre` convierte una hoja con fondo verde plano en `img/<nombre>.png` (atlas) y
- Sprites de PixelLab: `python3 tools/make_pl.py hoja.png hoja.json <clase>` (warrior, archer, mage, cleric, soldier, crossbow, sorcerer, captain). Reconoce las animaciones por el nombre (Walking/andar, idle, herido, muerte, disparo/arco, lanzar/hechizo, golpe/espada, remolino, escudo), usa 5 direcciones (el oeste, por espejo), calcula escala y pies solos y añade el `<script>` a index.html. Lo que falte lo cubre el motor (idle, herido y muerte genéricos; disparo y lanzar se sustituyen entre sí).
`js/sheet_<nombre>.js` (datos). Si una clase no tiene hoja, se dibuja por código (`unitart.js`, `specs_*.js`).
