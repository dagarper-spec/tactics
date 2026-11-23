#!/usr/bin/env python3
"""Convierte una hoja de sprites (fondo verde plano) en un atlas PNG de celdas fijas + datos JS.
Uso: python3 tools/make_sheet.py hoja.png nombre   (genera img/<nombre>.png y js/sheet_<nombre>.js)
Pasos: quitar el verde, reducir a la mitad con promedio, paleta común, limpiar píxeles sueltos, alinear por los pies."""
import sys, json
import numpy as np
from PIL import Image

CELL, FEET, COLS, NCOL = 72, 68, 8, 32
# nombre -> (banda, caja). Bandas: 0 reposo, 1 andar, 2 correr, 3 ataque, 4 herido, 5 defensa, 6 muerte.
FRAMES = {
    'idle0F': (0, 0), 'idle1F': (0, 2), 'idle0B': (0, 7), 'idle1B': (0, 9),
    'walk0F': (1, 0), 'walk1F': (1, 1), 'walk2F': (1, 2), 'walk3F': (1, 1),
    'walk0B': (1, 7), 'walk1B': (1, 8), 'walk2B': (1, 9), 'walk3B': (1, 8),
    'atk0F': (3, 0), 'atk1F': (3, 2), 'hurtF': (4, 0),
}
for i in range(9): FRAMES['die%d' % i] = (6, 4 + i)

def keyed(a):
    return (a[:, :, 1] > 150) & (a[:, :, 1] - a[:, :, 0] > 80) & (a[:, :, 1] - a[:, :, 2] > 80)

def runs(v, minlen):
    out, s = [], None
    for i, x in enumerate(list(v) + [False]):
        if x and s is None: s = i
        if not x and s is not None:
            if i - s >= minlen: out.append((s, i))
            s = None
    return out

def half(rgb, mask):
    """Reduce a la mitad promediando solo los píxeles opacos; devuelve (rgb, máscara)."""
    h, w = mask.shape; h -= h % 2; w -= w % 2
    rgb, mask = rgb[:h, :w].astype(float), mask[:h, :w].astype(float)
    n = mask[0::2, 0::2] + mask[1::2, 0::2] + mask[0::2, 1::2] + mask[1::2, 1::2]
    s = sum(rgb[i::2, j::2] * mask[i::2, j::2, None] for i in (0, 1) for j in (0, 1))
    return (s / np.maximum(n, 1)[:, :, None]).astype(np.uint8), n >= 2

def erode(m):
    o = m.copy()
    o[1:] &= m[:-1]; o[:-1] &= m[1:]; o[:, 1:] &= m[:, :-1]; o[:, :-1] &= m[:, 1:]
    return o

def main(src, name):
    im = np.asarray(Image.open(src).convert('RGB'), int); m = ~keyed(im)
    bands = runs(m[:, 120:].any(1), 40)
    crops = {}
    for k, (b, i) in FRAMES.items():
        y0, y1 = bands[b]; bx = runs(m[y0:y1, 120:].any(0), 12); x0, x1 = bx[i][0] + 120, bx[i][1] + 120
        sub = im[y0 - 2:y1 + 2, x0 - 3:x1 + 3]; mk = erode(~keyed(sub))
        rgb, mk = half(sub, mk)
        crops[k] = (rgb, mk)
    pool = np.concatenate([r[mk] for r, mk in crops.values()])
    pal = Image.new('RGB', (len(pool), 1)); pal.putdata([tuple(p) for p in pool])
    pal = pal.quantize(NCOL, method=Image.MEDIANCUT, dither=Image.NONE)
    atlas = Image.new('RGBA', (COLS * CELL, ((len(crops) + COLS - 1) // COLS) * CELL), (0, 0, 0, 0)); data = {}
    for n, (k, (rgb, mk)) in enumerate(crops.items()):
        q = np.asarray(Image.fromarray(rgb).quantize(palette=pal, dither=Image.NONE).convert('RGB'))
        q = q.copy()
        for y in range(1, q.shape[0] - 1):                      # quita píxeles sueltos (ruido)
            for x in range(1, q.shape[1] - 1):
                if not mk[y, x]: continue
                nb = [q[y - 1, x], q[y + 1, x], q[y, x - 1], q[y, x + 1]]
                if all((c != q[y, x]).any() for c in nb):
                    for c in nb:
                        if sum((c == d).all() for d in nb) >= 2: q[y, x] = c; break
        ys, xs = np.where(mk); bot = ys.max(); feet = mk[max(0, bot - 9):bot + 1]
        fx = int(np.where(feet)[1].mean())
        ox, oy = CELL // 2 - fx, FEET - bot
        cell = Image.new('RGBA', (CELL, CELL), (0, 0, 0, 0))
        a = np.dstack([q, np.where(mk, 255, 0).astype(np.uint8)])
        cell.alpha_composite(Image.fromarray(a, 'RGBA'), (max(ox, 0), max(oy, 0))) if ox >= 0 and oy >= 0 else \
            cell.paste(Image.fromarray(a, 'RGBA').crop((max(-ox, 0), max(-oy, 0), a.shape[1], a.shape[0])), (max(ox, 0), max(oy, 0)))
        atlas.paste(cell, ((n % COLS) * CELL, (n // COLS) * CELL)); data[k] = [n % COLS, n // COLS]
    atlas.save('img/%s.png' % name, optimize=True)
    js = 'window.TT = window.TT || {};\nTT.SheetData = TT.SheetData || {};\nTT.SheetData.%s = %s;\n// FIN DE ARCHIVO\n' % (
        name, json.dumps({'cell': CELL, 'feet': FEET, 'frames': data}, separators=(',', ':')))
    open('js/sheet_%s.js' % name, 'w').write(js)
    print(len(crops), 'fotogramas ->', atlas.size)

main(sys.argv[1], sys.argv[2])
