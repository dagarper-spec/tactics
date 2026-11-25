#!/usr/bin/env python3
"""Convierte una exportación de PixelLab (PNG + JSON) en un atlas para el motor.
Uso: python3 tools/make_pl.py hoja.png hoja.json clase     (clase: warrior archer mage cleric soldier crossbow sorcerer captain) [altura en casillas, por defecto 1.25]
Genera img/<clase>.png y js/sheet_<clase>.js, y añade el <script> a index.html si falta.
Las animaciones se reconocen por palabras del nombre (ver KEYS). Solo se usan 5 direcciones; el oeste sale por espejo."""
import sys, re, json
import numpy as np
from PIL import Image
from scipy import ndimage

NCOL, COLS = 64, 16
DIRS = {'south': 'F', 'south-east': 'FS', 'east': 'S', 'north-east': 'BS', 'north': 'B'}
ORDER = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west']
# palabra del nombre de la animación (minúsculas) -> secuencia. La primera que coincida gana.
KEYS = [('remolino', 'whirl'), ('whirl', 'whirl'), ('escudo', 'shield'), ('shield', 'shield'),
        ('walk', 'walk'), ('camin', 'walk'), ('andar', 'walk'), ('marcha', 'walk'),
        ('idle', 'idle'), ('repos', 'idle'), ('hurt', 'hurt'), ('herid', 'hurt'), ('daño', 'hurt'),
        ('die', 'die'), ('death', 'die'), ('muert', 'die'), ('dead', 'die'),
        ('dispar', 'shoot'), ('shoot', 'shoot'), ('arco', 'shoot'), ('ballest', 'shoot'), ('bow', 'shoot'),
        ('lanz', 'cast'), ('throw', 'cast'), ('cast', 'cast'), ('hechiz', 'cast'), ('magia', 'cast'), ('cura', 'cast'), ('spell', 'cast'),
        ('espada', 'sword'), ('sword', 'sword'), ('golpe', 'sword'), ('ataque', 'sword'), ('attack', 'sword'), ('slash', 'sword')]

def seq_of(name):
    n = name.lower()
    for k, v in KEYS:
        if k in n: return v
    return None

def pick(n, k):                                          # k fotogramas repartidos entre n
    return [int(round(i * n / k)) % n for i in range(k)]

def main(src, jsn, name, alto=1.25):
    j = json.load(open(jsn)); sp = j['spritesheet']; im = np.asarray(Image.open(src).convert('RGBA'))
    C = sp['cell_size']['width']
    def cell(r, c): return im[r * C:(r + 1) * C, c * C:(c + 1) * C].copy()
    def clean(a):                                        # quita efectos sueltos que no tocan el cuerpo
        m = a[:, :, 3] > 0
        lab, n = ndimage.label(ndimage.binary_dilation(m, iterations=1))
        if n > 1:
            big = 1 + int(np.argmax(ndimage.sum(m, lab, range(1, n + 1))))
            a[(lab != big), 3] = 0
        return a
    crops, count, ign = {}, {}, set()
    for r in sp['rows']:
        if r.get('type') == 'rotations':
            for c, dn in enumerate(r.get('directions', ORDER)):
                if dn in DIRS: crops['idle0' + DIRS[dn]] = clean(cell(r['row'], c))
            continue
        sq, dn = seq_of(r.get('animation', '')), r.get('direction')
        if not sq: ign.add(r.get('animation')); continue
        n = r['frame_count']
        if sq == 'die':                                  # la muerte no depende de la dirección: 9 fotogramas desde el sur
            if dn != 'south': continue
            for k, c in enumerate(pick(n, 9) if n != 9 else range(9)): crops['die%d' % k] = clean(cell(r['row'], c))
            continue
        if dn not in DIRS: continue
        s = DIRS[dn]
        if sq == 'walk': idx = pick(n, 4)
        elif sq == 'idle': idx = [0, n // 2]
        elif sq == 'hurt': idx = [n // 2]
        else: idx = range(n)
        for k, c in enumerate(idx):
            crops[('hurt' if sq == 'hurt' else sq + str(k) if sq != 'idle' else 'idle%d' % k) + s] = clean(cell(r['row'], c))
        if sq not in ('walk', 'idle', 'hurt'): count[sq] = n
        if sq == 'idle': crops.pop('idle0' + s, None); crops['idle0' + s] = clean(cell(r['row'], 0)); crops['idle1' + s] = clean(cell(r['row'], n // 2))
    for s in DIRS.values():                              # alias genéricos para animaciones que no tienen secuencia propia
        for a, b in (('atk0', 'sword'), ('atk1', 'sword')):
            if b + '0' + s in crops: crops[a + s] = crops[b + str(1 if a == 'atk0' else count.get(b, 9) * 5 // 9) + s]
        if 'atk0' + s not in crops:
            for b in ('shoot', 'cast'):
                if b + '0' + s in crops: crops['atk0' + s] = crops[b + '0' + s]; crops['atk1' + s] = crops[b + str(count[b] // 2) + s]; break
    names = list(crops)
    south = crops['idle0F'][:, :, 3] > 0; ys = np.where(south.any(1))[0]; hgt = int(ys.max() - ys.min() + 1)
    feet = int(np.median([np.where((c[:, :, 3] > 0).any(1))[0].max() for c in crops.values()])) + 1
    pool = np.concatenate([crops[k][crops[k][:, :, 3] > 0][:, :3] for k in names])
    pal = Image.new('RGB', (len(pool), 1)); pal.putdata([tuple(p) for p in pool])
    pal = pal.quantize(NCOL, method=Image.MEDIANCUT, dither=Image.NONE)
    cache, data, tiles = {}, {}, []
    for k in names:
        a = crops[k]; key = a.tobytes()
        if key not in cache:
            q = np.asarray(Image.fromarray(a[:, :, :3]).quantize(palette=pal, dither=Image.NONE).convert('RGB'))
            cache[key] = [len(cache) % COLS, len(cache) // COLS]; tiles.append((cache[key], np.dstack([q, a[:, :, 3]])))
        data[k] = cache[key]
    atlas = Image.new('RGBA', (COLS * C, ((len(cache) + COLS - 1) // COLS) * C), (0, 0, 0, 0))
    for (cx, cy), t in tiles: atlas.paste(Image.fromarray(t, 'RGBA'), (cx * C, cy * C))
    atlas.save('img/%s.png' % name, optimize=True)
    meta = {'cell': C, 'feet': feet, 'sc': round(float(alto) / hgt, 5), 'por': [round(hgt * .58), round(hgt * .7), hgt + 1], 'n': count, 'frames': data}
    open('js/sheet_%s.js' % name, 'w').write('window.TT = window.TT || {};\nTT.SheetData = TT.SheetData || {};\nTT.SheetData.%s = %s;\n// FIN DE ARCHIVO\n' % (name, json.dumps(meta, separators=(',', ':'))))
    tag = '<script src="js/sheet_%s.js"></script>' % name
    h = open('index.html').read()
    if tag not in h:
        last = list(re.finditer(r'<script src="js/sheet_[a-z]+\.js"></script>', h))[-1]
        open('index.html', 'w').write(h[:last.end()] + '\n' + tag + h[last.end():])
    print(name, len(names), 'fotogramas,', len(cache), 'únicos ->', atlas.size, '| alto', hgt, 'pies', feet, '| secuencias', count, '| sin usar', ign or '-')

main(*sys.argv[1:5])
