// Regenerează site/img/<id>.jpg din designul vectorial al ambalajelor.
// Cerințe: npm i playwright && npx playwright install chromium ; pip install pillow
// Rulare din folderul proiectului: node tools/ambalaje/randeaza.mjs [id ...]
import { chromium } from 'playwright';
import { execFileSync } from 'child_process';
import path from 'path'; import { fileURLToPath } from 'url'; import fs from 'fs';
const DIR = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.resolve(DIR, '../..');
global.window = {}; await import(path.join(ROOT, 'src/data.js'));
const only = process.argv.slice(2), out = path.join(ROOT, 'site/img'), tmp = path.join(DIR, '.tmp');
fs.mkdirSync(out, { recursive: true }); fs.mkdirSync(tmp, { recursive: true });
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 800, height: 800 }, deviceScaleFactor: 2 });
for (const p of window.PRODUCTS) {
  if (only.length && !only.includes(p.id)) continue;
  await pg.goto('file://' + path.join(DIR, 'ambalaje.html') + '?id=' + p.id); await pg.waitForSelector('body[data-ready]');
  const png = path.join(tmp, p.id + '.png'); await pg.locator('#st').screenshot({ path: png });
  execFileSync('python3', ['-c', `from PIL import Image;Image.open("${png}").convert("RGB").resize((800,800),Image.LANCZOS).save("${path.join(out, p.id + '.jpg')}","JPEG",quality=84,optimize=True,progressive=True)`]);
  console.log('✓', p.id);
}
await b.close(); fs.rmSync(tmp, { recursive: true, force: true });
