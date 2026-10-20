"""Turn each refs/<id>.png packaging illustration into a product photo at site/img/<id>.jpg.
Usage: python3 tools/gen.py [id ...]   (no ids = every product that has a reference and no photo yet)
"""
import io, json, os, subprocess, sys, time, warnings
from pathlib import Path
warnings.filterwarnings("ignore")
from PIL import Image
from google import genai
from google.genai import types

ROOT = Path(__file__).resolve().parent.parent
ENV = ROOT / "tools/.env"  # optional: GEMINI_API_KEY=... (never commit or share this file)
if ENV.exists():
    for line in ENV.read_text().splitlines():
        if "=" in line:
            k, v = line.split("=", 1); os.environ.setdefault(k.strip(), v.strip())

PRODUCTS = json.loads(subprocess.check_output(
    ["node", "-e", 'global.window={};require("./src/data.js");console.log(JSON.stringify(window.PRODUCTS))'], cwd=ROOT))
CATS = {"batoane": "bar", "lactate": "cup", "snackuri": "bag", "pudre": "pouch", "bauturi": "bottle"}
PACKAGING = {
    "bar": "a protein bar in a glossy flow-wrap foil wrapper with crimped ends",
    "cup": "a single-serve plastic yogurt cup with a peelable foil lid",
    "tub": "a plastic dairy tub with a snap-on lid",
    "bag": "a matte snack bag with crimped top and bottom seals",
    "pouch": "a matte stand-up resealable pouch of protein powder",
    "box": "a printed cardboard box",
    "jar": "a matte jar with a dark screw lid",
    "cookie": "a large soft-baked protein cookie with a round paper sticker on it",
    "can": "a slim aluminium can",
    "carton": "a gable-top milk carton",
    "shot": "a small 60 ml plastic shot bottle with a dark cap",
    "bottle": "a 330 ml matte plastic bottle with a dark screw cap",
    "clear": "a clear plastic bottle showing the translucent liquid inside",
}

def prompt(p):
    shape = p.get("shape") or CATS.get(p["c"], "box")
    return (
        "Turn this flat packaging illustration into a photorealistic e-commerce studio product photograph. "
        f"The product is {PACKAGING[shape]}: '{p['name']}' ({p['size']}). "
        "Keep the package shape, its colour and the white label exactly as in the illustration. "
        "The label must keep the lowercase wordmark 'gram' followed by the round yellow-and-navy dial symbol, "
        f"and the large number '{str(p['pp']) + 'g' if p.get('pp') is not None else '10×'}', spelled exactly, sharp and legible, with the yellow stripe at the bottom. "
        "Do not add any other text, logos or brand names. "
        "Soft diffused studio light, gentle realistic shadow, 3/4 front view, product centred and filling about 70% of the frame, "
        "seamless background in a pale tint of the package colour, a few real ingredients matching the flavour placed subtly beside it. "
        "Square image, sharp focus, catalogue quality."
    )

def client():
    key = os.environ["GEMINI_API_KEY"]
    return genai.Client(api_key=key)

def generate(c, p, out):
    ref = Image.open(ROOT / "refs" / f"{p['id']}.png").convert("RGB")
    for attempt in range(3):
        try:
            r = c.models.generate_content(
                model="gemini-2.5-flash-image",
                contents=[prompt(p), ref],
                config=types.GenerateContentConfig(response_modalities=["IMAGE"],
                                                   image_config=types.ImageConfig(aspect_ratio="1:1")))
            for part in (r.candidates[0].content.parts if r.candidates else []):
                if getattr(part, "inline_data", None):
                    img = Image.open(io.BytesIO(part.inline_data.data)).convert("RGB").resize((800, 800), Image.LANCZOS)
                    img.save(out, "JPEG", quality=84, optimize=True, progressive=True)
                    return True
            print("  no image in response", flush=True)
        except Exception as e:
            print(f"  error: {str(e)[:200]}", flush=True)
            time.sleep(8 * (attempt + 1))
    return False

if __name__ == "__main__":
    want = set(sys.argv[1:])
    outdir = ROOT / "site/img"; outdir.mkdir(parents=True, exist_ok=True)
    c = client(); done = fail = 0
    for p in PRODUCTS:
        out = outdir / f"{p['id']}.jpg"
        if want and p["id"] not in want: continue
        if not want and out.exists(): continue
        if not (ROOT / "refs" / f"{p['id']}.png").exists(): print("skip (no ref)", p["id"]); continue
        print("→", p["id"], flush=True)
        if generate(c, p, out): done += 1
        else: fail += 1
    print(f"done {done}, failed {fail}")
