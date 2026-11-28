# NOTAS del proyecto (leer esto al empezar una conversación nueva)

## Reglas de trabajo
- Diseño primero, cambiar solo lo necesario, respuestas cortas, avisar de riesgos. No releer código que ya funciona.
- Scripts clásicos en `js/` y `css/`, three.js r128, delta time, lógica separada de la vista, cada archivo < ~11 KB acabado en `// FIN DE ARCHIVO`.
- Audio: Claude nunca hace música; dice qué sonidos crear (Flow Music) y el usuario envía los archivos.
- Tests (scratchpad): smoke6.js (batalla), verify.js, area_smoke.js. Cada uno acaba en "TODO OK".

## Historia
David (= guerrero, armadura de su padre, quiere ver una feria de caballos), Helen (arquera) y Marta (maga) son atacados por bandidos en el camino y se unen. En la 2ª batalla se une Clara (clériga). Ids internos: warrior/archer/mage/cleric.
Prólogo por defecto: casa de David (armadura + cofre) → ponerse la armadura → madre da consejo → taberna con rumores de bandidos → se abre salida sur → batalla 1 (David+Helen+Marta) → batalla 2 con Clara.

## Progresión (enfoque ligero, aprobado)
XP fija por batalla igual para todos, nivel máx. 8, tabla de crecimiento por clase (`TT.Growth`), enemigos fijos por encuentro. Habilidades como premio de batalla (por ahora todas). Equipo: 1 arma + 1 armadura, modificadores pequeños; se compra, se encuentra en cofres, se mejora en herrería (+1..+3, monedas + material). Sin consumables por ahora.

## Hitos
- HECHO: motor de batalla, sprites PixelLab, UI, escenas, guardado, pueblo, **10a** (`party.js`, `encounters.js`, Save v2), **10b** (código escrito, SIN probar en navegador).
- 10b: `dialog.js` (+`css/dialog.css`), `story.js` (guion como datos + hechos: intro, armor, mother, rumor, b1, b2, river), casa de David (`house` en areas.js, cofre = spot 'a'), NPC con `id` (madre, tabernera), salida sur del pueblo = batallas `ambush1` → `ambush2` (entra Clara) → `river`. Fin de batalla en historia: Continuar/Reintentar (`Encounters.cur.fromStory`). Nueva partida empieza en la casa. Enemigos de ambush1/2 sin equilibrar: ajustar jugando (`mod` en encounters.js).
- SIGUE: probar 10b → **11** XP/niveles → **12** equipo/tienda/herrería.

## Pendiente del usuario
Audio: music_victory, music_defeat, hit_light. Sprites: David civil, NPC familiar, enemigos soldier/crossbow/captain, animaciones del hechicero. Confirmar defaults del prólogo.
