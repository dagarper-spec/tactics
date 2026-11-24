#!/usr/bin/env python3
"""Convierte una exportación de PixelLab (PNG + JSON de filas) en un atlas para el motor.
Uso: python3 tools/make_pl.py hoja.png hoja.json nombre
Genera img/<nombre>.png y js/sheet_<nombre>.js. Mantiene solo 5 direcciones (el oeste se obtiene por espejo)."""
import sys, json
import numpy as np
from PIL import Image
from scipy import ndimage

NCOL, COLS = 64, 16
DIRS = {'south': 'F', 'south-east': 'FS', 'east': 'S', 'north-east': 'BS', 'north': 'B'}
ANIMS = {'Walking': ('walk', [0, 2, 4, 6]), 'Golpe espada': ('sword', range(9)),
         'Golpe remolino': ('whirl', range(9)), 'Golpe escudo': ('shield', range(9))}

def main(src, jsn, name):
    j = json.load(open(jsn)); sp = j['spritesheet']; im = np.asarray(Image.open(src).convert('RGBA')); C = 88
    crops = {}
    def cell(r, c): return im[r * C:(r + 1) * C, c * C:(c + 1) * C].copy()
    def clean(a):                                        # quita los efectos sueltos (arcos, chispas): conserva el cuerpo
        m = a[:, :, 3] > 0
        lab, n = ndimage.label(ndimage.binary_dilation(m, iterations=1))
        if n > 1:
            big = 1 + int(np.argmax(ndimage.sum(m, lab, range(1, n + 1))))
            a[(lab != big), 3] = 0
        return a
    # filas: la de rotaciones tiene 8 fotogramas en orden fijo; las demás traen animación y dirección
    order = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west']
    for r in sp['rows']:
        if r.get('type') == 'rotations':
            for c, dn in enumerate(order):
                if dn in DIRS: crops['idle0' + DIRS[dn]] = clean(cell(r['row'], c))
        elif r.get('animation') in ANIMS and r.get('direction') in DIRS:
            pre, idx = ANIMS[r['animation']]
            for k, c in enumerate(idx): crops['%s%d%s' % (pre, k, DIRS[r['direction']])] = clean(cell(r['row'], c))
    for dn, s in DIRS.items():                            # alias que usan las animaciones genéricas
        crops['atk0' + s] = crops['sword1' + s]; crops['atk1' + s] = crops['sword5' + s]
    names = list(crops)
    pool = np.concatenate([crops[k][crops[k][:, :, 3] > 0][:, :3] for k in names])
    pal = Image.new('RGB', (len(pool), 1)); pal.putdata([tuple(p) for p in pool])
    pal = pal.quantize(NCOL, method=Image.MEDIANCUT, dither=Image.NONE)
    atlas = Image.new('RGBA', (COLS * C, ((len(names) + COLS - 1) // COLS) * C), (0, 0, 0, 0)); data = {}
    cache = {}
    for n, k in enumerate(names):
        a = crops[k]; key = a.tobytes()
        if key in cache: data[k] = cache[key]; continue
        q = np.asarray(Image.fromarray(a[:, :, :3]).quantize(palette=pal, dither=Image.NONE).convert('RGB'))
        out = np.dstack([q, a[:, :, 3]])
        pos = (len(cache) % COLS, len(cache) // COLS)
        atlas.paste(Image.fromarray(out, 'RGBA'), (pos[0] * C, pos[1] * C)); data[k] = cache[key] = list(pos)
    atlas = atlas.crop((0, 0, COLS * C, ((len(cache) + COLS - 1) // COLS) * C))
    atlas.save('img/%s.png' % name, optimize=True)
    meta = {'cell': C, 'feet': 74, 'sc': 1 / 50, 'por': [36, 44, 63], 'frames': data}
    open('js/sheet_%s.js' % name, 'w').write('window.TT = window.TT || {};\nTT.SheetData = TT.SheetData || {};\nTT.SheetData.%s = %s;\n// FIN DE ARCHIVO\n' % (name, json.dumps(meta, separators=(',', ':'))))
    print(len(names), 'fotogramas,', len(cache), 'únicos ->', atlas.size)

main(*sys.argv[1:4])
