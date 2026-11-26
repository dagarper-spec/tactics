# Audio de Tactics

Coloca aquí los archivos con **estos nombres exactos**. Formato preferido: **`.mp3`** (también se acepta `.ogg`).
Si falta un archivo, ese sonido simplemente no suena; el juego funciona igual.

Recomendaciones: efectos de **0,2 a 1,5 s**, sin silencio al principio, normalizados a un volumen parecido.
Las músicas de batalla deben ser un **bucle sin corte** (el final enlaza con el principio).

## Música
| Archivo | Cuándo suena |
|---|---|
| `music_town` | Pueblo y sus interiores (bucle). Ya incluida: Cobblestone Memories |
| `music_battle`, `music_battle2` | Batalla: alternan una tras otra (ya incluidas: Tactical Charge y Steel and Strings) |
| `music_victory` | Al ganar (una vez, 5-15 s) |
| `music_defeat` | Al perder (una vez, 5-15 s) |

## Interfaz
| Archivo | Cuándo suena |
|---|---|
| `ui_select` | Tocar una unidad/casilla o un botón normal |
| `ui_confirm` | Confirmar ataque / terminar turno |
| `ui_cancel` | Cancelar, volver atrás, deshacer |
| `ui_turn` | Empieza el turno de un héroe |

## Movimiento
| Archivo | Cuándo suena |
|---|---|
| `step` | Cada casilla que camina una unidad (muy corto, 0,1-0,2 s) |

## Golpes (según el tipo de daño)
| Archivo | Tipo |
|---|---|
| `hit_slash` | Tajo |
| `hit_blunt` | Contundente |
| `hit_pierce` | Perforante |
| `hit_fire` | Fuego |
| `hit_ice` | Hielo |
| `hit_light` | Luz |
| `hit_back` | Capa extra cuando se golpea por la espalda o el flanco |
| `death` | Una unidad cae |

## Estados
| Archivo | Cuándo suena |
|---|---|
| `shield_hit` | Se acierta una debilidad (se pierde un escudo) |
| `break` | Un enemigo se rompe (0 escudos) |
| `recover` | Un enemigo roto recupera sus escudos |
| `boost` | Se gana Potenciar (Bendición) |
| `taunt` | Provocar |
| `heal` | Curación |
