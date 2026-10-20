"""Bundle src/ into the final pages and pick up product photos.

  python3 tools/build.py

- reads src/shell.html, src/data.js, src/app.js
- lists site/img/<product-id>.jpg and injects them as window.PHOTOS (products without a photo keep the illustration)
- writes index.html (single-file version, used for the Claude artifact) and site/index.html (the version to host, e.g. Netlify)
"""
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
shell = (ROOT / "src/shell.html").read_text()
data = (ROOT / "src/data.js").read_text()
app = (ROOT / "src/app.js").read_text()

img_dir = ROOT / "site/img"
photos = sorted(p.stem for p in img_dir.glob("*.jpg")) if img_dir.exists() else []
ids = set(re.findall(r'\bid:"([a-z0-9-]+)"', data))
unknown = [p for p in photos if p not in ids]
photos = [p for p in photos if p in ids]

body = f"{shell}<script>\n{data}\nwindow.PHOTOS = {json.dumps(photos)};\n</script>\n<script>\n{app}\n</script>\n"

# Claude artifact version: photos embedded as data: URIs (the artifact viewer does not load sibling image files)
import base64, io
from PIL import Image
emb = {}
for pid in photos:
    im = Image.open(img_dir / f"{pid}.jpg").convert("RGB").resize((600, 600), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, "JPEG", quality=80, optimize=True, progressive=True)
    emb[pid] = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()
art_body = body.replace(f"window.PHOTOS = {json.dumps(photos)};", f"window.PHOTOS = {json.dumps(photos)};\nwindow.PHOTO_SRC = {json.dumps(emb)};", 1)
(ROOT / "index.html").write_text(art_body)

# hosted version: proper document with title/meta/styles in <head>
rest, moved = body, []
for pat in [r'<title>.*?</title>\n', r'<meta name="description"[^>]*>\n', r'<link rel="preconnect"[^>]*>\n',
            r'<link rel="preconnect"[^>]*>\n', r'<link rel="stylesheet"[^>]*>\n', r'<style>\n/\* Layout.*?</style>\n']:
    m = re.search(pat, rest, re.S)
    moved.append(m.group(0)); rest = rest[:m.start()] + rest[m.end():]
moved[0] = "<title>Gramo | Gustări proteice care chiar au gust</title>\n"
head = ('<!doctype html>\n<html lang="ro">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        '<style>[hidden]{display:none!important}img{max-width:100%}body{margin:0}</style>\n' + "".join(moved) + "</head>\n<body>\n")
(ROOT / "site").mkdir(exist_ok=True)
(ROOT / "site/index.html").write_text(head + rest + "\n</body>\n</html>\n")

print(f"Built index.html and site/index.html with {len(photos)}/{len(ids)} product photos.")
missing = sorted(ids - set(photos))
if missing: print("Fără poză încă:", ", ".join(missing))
if unknown: print("ATENȚIE, fișiere care nu corespund niciunui produs:", ", ".join(unknown))
