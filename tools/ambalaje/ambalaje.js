/* Gramo – commercial-style packaging renders (vector, deterministic). One product per page: ?id=<id> */
const P = window.PRODUCTS, CATS = window.CATS;
const INK = "#11153D", BUT = "#FFD84A", BLUE = "#2B37E8";
const FONT = 'font-family="Bricolage Grotesque, Arial Black, sans-serif"';
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ---------- colour ---------- */
const FLAV = [
  ["fistic","#7FB24A"],["zmeur","#D9356A"],["căpșuni","#E5486A"],["afine","#4F4CC9"],["fructe de pădure","#8E2F6B"],
  ["merișoare","#B8323F"],["mango","#F2A93B"],["piersic","#F59C6B"],["lămâie","#E9CF3A"],["banan","#EDC93C"],["tropical","#F28C38"],
  ["espresso","#4A2E22"],["latte","#8A5A3C"],["caramel","#C67C2E"],["cocos","#3F8C88"],["arahide","#C9853F"],
  ["cozonac","#A3341F"],["cheesecake","#E8C547"],["cookie dough","#B98552"],["brownie","#4B2A20"],["chocolate chip","#7A4A2E"],
  ["cookies & cream","#2E2F45"],["cacao","#6B3A26"],["ciocolat","#5C3324"],["vanilie","#E3B95B"],["paprika","#C9442B"],["smântână","#4D8F5B"],
  ["sare de mare","#3A6FB0"],["pufule","#E2A93A"],["covrig","#9C5B2C"],["jerky","#7A2E22"],["edamame","#5E9640"],["stafide","#8A5A3C"],
  ["ovăz","#B48A55"],["skyr","#6C9BD2"],["grecesc","#3D6FB6"],["soia","#7C9B4D"],["brânză","#5D86C5"],
  ["cottage","#5A9CC4"],["quark","#4F7FD0"],["mozzarella","#3FA06F"],["cașcaval","#E0A526"],["kefir","#6A8FD8"],
  ["lapte","#3E64D6"],["colagen","#9A8FB8"],["neutru","#7A86A8"],["clătite","#D88A3D"],["degustare","#2B37E8"],["natural","#3E64D6"],["alune","#9A6435"]
];
const flav = p => { const n = p.name.toLowerCase(); for (const [k, c] of FLAV) if (n.includes(k)) return c; return BLUE; };
const rgb = h => [0, 2, 4].map(i => parseInt(h.replace("#", "").substr(i, 2), 16));
const hex = a => "#" + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
const mix = (a, b, t) => { const A = rgb(a), B = rgb(b); return hex(A.map((v, i) => v * (1 - t) + B[i] * t)); };
const dark = (c, t) => mix(c, "#000000", t), light = (c, t) => mix(c, "#ffffff", t);
const lum = c => { const [r, g, b] = rgb(c).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * r + .7152 * g + .0722 * b; };

/* ---------- names ---------- */
const TYPES = ["Baton proteic Vegan", "Baton proteic", "Napolitană proteică", "Iaurt grecesc proteic", "Iaurt vegetal proteic", "Iaurt de băut proteic", "Iaurt proteic",
  "Brânză de vaci proteică", "Cottage cheese proteic", "Quark proteic", "Mozzarella light proteică", "Cașcaval light", "Budincă proteică", "Desert proteic",
  "Cookie proteic", "Cookie vegan", "Mini cookies proteice", "Chips proteice", "Pufuleți proteici", "Covrigei proteici", "Crispies proteice", "Granola proteică",
  "Mix proteic", "Jerky de vită", "Whey izolat", "Whey", "Cazeină micelară", "Proteină vegană", "Peptide de colagen", "Mix clătite proteice",
  "Terci de ovăz proteic", "Pachet degustare Whey", "Shake proteic", "Shake vegan", "Iced Latte proteic", "Apă proteică", "Kefir proteic", "Lapte proteic",
  "Shot proteic", "Ciocolată caldă proteică", "Pachet 12 shake-uri", "Pachet de degustare", "Skyr"];
function split(p) {
  let n = p.name, badge = "";
  const m = n.match(/\s*\(([^)]*)\)\s*$/); if (m) { badge = m[1]; n = n.slice(0, m.index); }
  for (const t of TYPES) if (n.toLowerCase().startsWith(t.toLowerCase())) {
    let f = n.slice(t.length).trim().replace(/^de\s+/, "");
    let type = t;
    if (/vegan$/i.test(t) && t.startsWith("Baton")) { type = "Baton proteic vegan"; }
    if (!f) { // whole name is the product
      if (/^Mix clătite/.test(t)) return { type: "Mix proteic", flav: "Clătite", badge };
      if (/^Cottage/.test(t)) return { type: "Proteic", flav: "Cottage cheese", badge };
      if (/^Quark/.test(t)) return { type: "Proteic", flav: "Quark", badge: badge ? "Brânză cremoasă" : "" };
      if (/^Kefir/.test(t)) return { type: "Proteic", flav: "Kefir", badge };
      if (/^Mozzarella/.test(t)) return { type: "Proteică", flav: "Mozzarella light", badge };
      if (/^Pufuleți/.test(t)) return { type: "Proteici", flav: "Pufuleți", badge };
      if (/^Covrigei/.test(t)) return { type: "Proteici", flav: "Covrigei", badge };
      if (/^Pachet de degustare/.test(t)) return { type: "Pachet", flav: "Degustare", badge: "10 produse" };
      if (/^Pachet 12/.test(t)) return { type: "Pachet 12 shake-uri", flav: "Mix", badge };
      if (/^Pachet degustare Whey/.test(t)) return { type: "Pachet degustare", flav: "Whey", badge };
      return { type: "", flav: t, badge };
    }
    if (/^Napolitană/.test(t)) return { type: "Napolitană proteică", flav: "Alune", badge: "Crocantă" };
    if (/^Pachet degustare Whey/.test(t)) return { type: "Pachet degustare", flav: "Whey", badge: "10 plicuri" };
    if (/^Pachet 12/.test(t)) return { type: "Pachet 12 shake-uri", flav: "Mix", badge };
    if (/^Jerky/.test(t)) return { type: "Jerky de vită", flav: f, badge };
    if (/^Mozzarella|^Cașcaval/.test(t)) return { type: "Proteică", flav: t.replace(/ proteică$/, ""), badge: f || "" };
    if (/^Brânză/.test(t)) return { type: "Proteică", flav: "Brânză de vaci", badge: f };
    if (/^Iaurt grecesc/.test(t)) return { type: "Proteic", flav: "Iaurt grecesc", badge: f };
    if (/^Iaurt vegetal/.test(t)) return { type: "Iaurt vegetal proteic", flav: f.replace(/^din\s+/, ""), badge };
    if (/^Iaurt proteic/.test(t) && /0%/.test(f)) return { type: "Iaurt proteic", flav: "Natural", badge: "0% grăsime" };
    if (/^Skyr/.test(t)) return { type: "Skyr", flav: f[0].toUpperCase() + f.slice(1), badge };
    if (/^Lapte/.test(t)) return { type: "Lapte proteic", flav: f[0].toUpperCase() + f.slice(1), badge };
    if (/^Mix proteic/.test(t)) { const ff = f.replace(/^de\s+/, ""); return { type: "Mix proteic", flav: ff[0].toUpperCase() + ff.slice(1), badge }; }
    if (/^Pachet de degustare/.test(t)) return { type: "Pachet", flav: "Degustare", badge: "10 produse" };
    return { type, flav: f[0].toUpperCase() + f.slice(1), badge };
  }
  return { type: "", flav: n, badge };
}
const CLAIM_TAGS = ["Fără zahăr adăugat", "Vegan", "Fără lactoză", "Fără grăsimi", "Bogat în fibre", "Sursă de fibre", "Low carb", "Crocant"];
const claim = p => { const sp = split(p), f = sp.flav.toLowerCase(), bd = (sp.badge || '').toLowerCase(); return (p.tags || []).find(t => CLAIM_TAGS.includes(t) && t.toLowerCase() !== f && !bd.startsWith(t.toLowerCase())) || "Bogat în proteine"; };

/* ---------- logo (same construction as the site) ---------- */
function logo(x, y, wf, ink = INK) { // x,y = left/baseline
  const gw = wf * 2.05, dr = wf * .3, tw = gw + wf * .05 + dr * 2, dcx = x + gw + wf * .05 + dr, dcy = y - dr * .95;
  return { w: tw, svg: `<text x="${x}" y="${y}" textLength="${gw}" lengthAdjust="spacingAndGlyphs" ${FONT} font-weight="800" font-size="${wf}" fill="${ink}">gram</text>
  <circle cx="${dcx}" cy="${dcy}" r="${dr * .82}" fill="${BUT}" stroke="${ink}" stroke-width="${dr * .36}"/>
  <path d="M${dcx} ${dcy} l${dr * .5} ${-dr * .5}" stroke="${BLUE}" stroke-width="${dr * .3}" stroke-linecap="round"/><circle cx="${dcx}" cy="${dcy}" r="${dr * .2}" fill="${BLUE}"/>` };
}
function logoBadge(cx, cy, wf) { // white pill with the logo, centred
  const L = logo(0, 0, wf), padX = wf * .55, padY = wf * .38, w = L.w + padX * 2, h = wf * .95 + padY * 2;
  const x = cx - w / 2, y = cy - h / 2;
  return { w, h, svg: `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h * .28}" fill="#fff"/>` + logo(x + padX, y + padY + wf * .78, wf).svg };
}

/* ---------- ingredient illustrations (unit box ≈ -50..50) ---------- */
let gid = 0; const uid = s => s + (++gid);
const G = {
  chunk(col = "#4B2A20") { const id = uid("ch"); return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${light(col, .18)}"/><stop offset="1" stop-color="${dark(col, .25)}"/></linearGradient></defs>
    <path d="M-34 -22 L22 -34 L36 20 L-22 34Z" fill="${dark(col, .35)}"/><path d="M-30 -20 L20 -30 L31 16 L-19 28Z" fill="url(#${id})"/>
    <path d="M-5 -25 L6 22 M-24 4 L26 -8" stroke="${dark(col, .3)}" stroke-width="2.4" opacity=".6"/><path d="M-30 -20 L20 -30" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>`; },
  shaving(col) { return `<path d="M-30 6 Q-10 -26 26 -10 Q8 -14 -6 2 Q-16 12 -30 6Z" fill="${col}"/><path d="M-26 4 Q-8 -18 20 -10" stroke="#fff" stroke-opacity=".3" stroke-width="2" fill="none"/>`; },
  hazelnut() { const id = uid("hz"); return `<defs><radialGradient id="${id}" cx=".35" cy=".35"><stop offset="0" stop-color="#C98A4E"/><stop offset="1" stop-color="#7A4220"/></radialGradient></defs>
    <path d="M0 -36 C26 -36 36 -6 32 14 C28 34 12 40 0 40 C-12 40 -28 34 -32 14 C-36 -6 -26 -36 0 -36Z" fill="url(#${id})"/>
    <path d="M-30 -2 C-24 -30 24 -30 30 -2 C20 -10 -20 -10 -30 -2Z" fill="#E5C79A"/><path d="M-26 -6 C-14 -14 14 -14 26 -6" stroke="#B88A5A" stroke-width="1.5" fill="none"/>
    <ellipse cx="-12" cy="14" rx="6" ry="12" fill="#fff" opacity=".18"/>`; },
  peanut() { return `<g transform="rotate(-30)"><path d="M0 -40 C18 -40 20 -18 12 -4 C20 10 20 40 0 40 C-20 40 -20 10 -12 -4 C-20 -18 -18 -40 0 -40Z" fill="#D9AE72"/>
    <path d="M-10 -24 h20 M-12 18 h24 M-8 -32 h16 M-10 28 h20 M0 -38 v76" stroke="#B48A55" stroke-width="2" opacity=".7"/></g>`; },
  almond() { return `<g transform="rotate(25)"><path d="M0 -40 C20 -20 22 20 0 40 C-22 20 -20 -20 0 -40Z" fill="#B97A47"/>
    <path d="M0 -34 C10 -14 10 14 0 34 M-8 -16 C-10 0 -10 10 -6 22 M8 -16 C10 0 10 10 6 22" stroke="#8E5530" stroke-width="2" fill="none"/></g>`; },
  pistachio() { return `<g transform="rotate(-20)"><ellipse cx="0" cy="0" rx="26" ry="38" fill="#E8D7B3"/><ellipse cx="0" cy="0" rx="26" ry="38" fill="none" stroke="#C8B58F" stroke-width="3"/>
    <path d="M-10 -34 C-22 -10 -22 10 -10 34 C2 20 4 -20 -10 -34Z" fill="#8DB33F"/><path d="M-10 -30 C-16 -10 -16 8 -10 28" stroke="#A64A6B" stroke-width="3" fill="none" opacity=".7"/></g>`; },
  raspberry() { let s = ""; const pts = [[0, -26], [-14, -18], [14, -18], [-20, -2], [0, -6], [20, -2], [-14, 12], [6, 12], [18, 16], [-4, 26], [10, 28], [-16, 24]];
    pts.forEach(([x, y]) => s += `<circle cx="${x}" cy="${y}" r="11" fill="#C8204E"/><circle cx="${x - 3}" cy="${y - 3}" r="3.5" fill="#fff" opacity=".45"/>`);
    return `<path d="M-6 -36 l6 8 6 -8" stroke="#4E8A3A" stroke-width="4" fill="none"/>` + s; },
  strawberry() { let s = `<path d="M0 40 C-34 20 -40 -10 -28 -24 C-16 -34 -6 -28 0 -26 C6 -28 16 -34 28 -24 C40 -10 34 20 0 40Z" fill="#E1263E"/>
    <path d="M-20 -18 C-12 -8 -16 14 -4 30" stroke="#fff" stroke-opacity=".25" stroke-width="6" fill="none"/>`;
    [[-16, -10], [0, -14], [16, -10], [-22, 6], [-6, 2], [10, 2], [24, 4], [-12, 18], [4, 18], [16, 18], [-2, 30]].forEach(([x, y]) => s += `<ellipse cx="${x}" cy="${y}" rx="1.8" ry="2.8" fill="#F7D35A"/>`);
    return s + `<path d="M0 -26 L-20 -36 L-8 -30 L-12 -44 L0 -32 L12 -44 L8 -30 L20 -36Z" fill="#3E8E3A"/>`; },
  blueberry() { const id = uid("bb"); return `<defs><radialGradient id="${id}" cx=".35" cy=".3"><stop offset="0" stop-color="#7A7FE0"/><stop offset="1" stop-color="#2A2470"/></radialGradient></defs>
    <circle r="34" fill="url(#${id})"/><path d="M-8 -26 l8 6 8 -6 -2 10 -6 -2 -6 2Z" fill="#1B1650"/><circle cx="-12" cy="-6" r="7" fill="#fff" opacity=".2"/>`; },
  cranberry() { return `<circle cx="-10" cy="4" r="18" fill="#B11E33"/><circle cx="14" cy="-6" r="16" fill="#C72A40"/><circle cx="-15" cy="-1" r="5" fill="#fff" opacity=".35"/><circle cx="9" cy="-11" r="4" fill="#fff" opacity=".35"/>`; },
  citrus(col = "#F2D23B", rim = "#E3B714") { let s = `<circle r="38" fill="${rim}"/><circle r="33" fill="#FFF6C9"/><circle r="30" fill="${col}"/>`;
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; s += `<line x1="0" y1="0" x2="${Math.cos(a) * 30}" y2="${Math.sin(a) * 30}" stroke="#FFF6C9" stroke-width="3"/>`; }
    return s + `<circle r="4" fill="#FFF6C9"/>`; },
  lime() { return G.citrus("#9BCB45", "#4E8F2A"); },
  banana() { return `<path d="M-40 -20 C-30 30 30 40 42 6 C30 22 -14 22 -32 -24Z" fill="#F4D03F"/><path d="M-40 -20 C-28 18 20 30 42 6" stroke="#D9AE20" stroke-width="3" fill="none"/>
    <path d="M-42 -26 l6 6" stroke="#5B3A1A" stroke-width="5" stroke-linecap="round"/>`; },
  coconut() { return `<circle r="38" fill="#6B4226"/><circle r="31" fill="#fff"/><circle r="31" fill="none" stroke="#EDE6DA" stroke-width="5"/><ellipse cx="-10" cy="-10" rx="10" ry="6" fill="#F4F1EC"/>
    <path d="M-36 -10 l4 2 M-30 -24 l4 3 M30 -22 l-4 3 M36 6 l-4 0" stroke="#4A2C18" stroke-width="2"/>`; },
  bean() { return `<g transform="rotate(30)"><ellipse rx="22" ry="30" fill="#4A2A1A"/><ellipse rx="22" ry="30" fill="none" stroke="#2E180D" stroke-width="2"/>
    <path d="M0 -28 C-8 -10 8 10 0 28" stroke="#2A140A" stroke-width="4" fill="none"/><ellipse cx="-8" cy="-10" rx="5" ry="10" fill="#fff" opacity=".12"/></g>`; },
  caramel() { return `<path d="M0 -40 C14 -16 30 4 30 18 C30 34 16 42 0 42 C-16 42 -30 34 -30 18 C-30 4 -14 -16 0 -40Z" fill="#D88A2E"/>
    <path d="M-14 6 C-18 18 -12 28 -2 32" stroke="#fff" stroke-opacity=".45" stroke-width="5" fill="none" stroke-linecap="round"/>`; },
  salt() { return `<rect x="-10" y="-10" width="14" height="14" fill="#fff" transform="rotate(20)"/><rect x="10" y="4" width="10" height="10" fill="#F4F6FA" transform="rotate(-15)"/><rect x="-24" y="10" width="9" height="9" fill="#fff" transform="rotate(35)"/>`; },
  vanilla() { let s = `<path d="M-40 36 C-10 10 20 -14 44 -40" stroke="#3A2214" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    for (let i = 0; i < 5; i++) s += `<ellipse cx="0" cy="-14" rx="10" ry="18" fill="#FFF3D1" stroke="#EAD39A" stroke-width="1.5" transform="rotate(${i * 72})"/>`;
    return s + `<circle r="7" fill="#E8C24A"/>`; },
  mango() { const id = uid("mg"); return `<defs><linearGradient id="${id}" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#F2C23B"/><stop offset=".6" stop-color="#F28C38"/><stop offset="1" stop-color="#D9452B"/></linearGradient></defs>
    <path d="M-30 20 C-40 -20 -6 -42 22 -32 C44 -22 40 20 14 36 C-4 46 -24 40 -30 20Z" fill="url(#${id})"/><path d="M18 -34 C30 -50 48 -46 54 -40 C40 -32 30 -30 18 -34Z" fill="#4E9A3A"/>`; },
  peach() { const id = uid("pc"); return `<defs><radialGradient id="${id}" cx=".35" cy=".35"><stop offset="0" stop-color="#FFD1A1"/><stop offset=".6" stop-color="#F59C6B"/><stop offset="1" stop-color="#D9573C"/></radialGradient></defs>
    <circle r="36" fill="url(#${id})"/><path d="M0 -34 C-10 -10 -8 16 4 34" stroke="#C9573A" stroke-width="2.5" fill="none" opacity=".6"/><path d="M2 -34 C10 -50 30 -50 36 -44 C24 -36 14 -34 2 -34Z" fill="#4E9A3A"/>`; },
  apple() { return `<path d="M0 -24 C-20 -40 -44 -24 -38 6 C-32 34 -12 42 0 34 C12 42 32 34 38 6 C44 -24 20 -40 0 -24Z" fill="#D63B2F"/>
    <path d="M0 -24 l4 -16" stroke="#5B3A1A" stroke-width="4"/><path d="M4 -34 C16 -46 30 -40 32 -36 C20 -30 12 -30 4 -34Z" fill="#4E9A3A"/><ellipse cx="-18" cy="-6" rx="6" ry="12" fill="#fff" opacity=".25"/>`; },
  cinnamon() { return `<g transform="rotate(-35)"><rect x="-44" y="-9" width="88" height="18" rx="6" fill="#8A4B24"/><path d="M-44 -2 h88 M-44 4 h88" stroke="#6A3517" stroke-width="2"/><ellipse cx="44" cy="0" rx="5" ry="9" fill="#B06A38"/></g>`; },
  oats() { let s = ""; [[-18, -10, 20], [10, -16, -30], [16, 12, 50], [-12, 16, -10], [0, 0, 80]].forEach(([x, y, r]) => s += `<ellipse cx="${x}" cy="${y}" rx="14" ry="9" fill="#E8D2A6" stroke="#C9A96E" stroke-width="1.5" transform="rotate(${r} ${x} ${y})"/>`); return s; },
  cookie(chips = "#3A2016", base = "#C9935A") { let s = `<circle r="40" fill="${base}"/><circle r="40" fill="none" stroke="${dark(base, .2)}" stroke-width="3"/>`;
    [[-16, -18], [12, -22], [22, 4], [-4, 2], [-22, 10], [6, 24], [-10, 26]].forEach(([x, y]) => s += `<rect x="${x - 5}" y="${y - 4}" width="10" height="8" rx="2" fill="${chips}"/>`);
    return s + `<path d="M-30 -18 C-20 -32 0 -38 16 -34" stroke="#fff" stroke-opacity=".25" stroke-width="4" fill="none"/>`; },
  cheesecake() { return `<path d="M-40 10 L36 -26 L40 26 L-40 30Z" fill="#C79A5C"/><path d="M-40 6 L36 -30 L40 14 L-40 22Z" fill="#FFF1C9"/><path d="M-40 6 L36 -30 L38 -22 L-40 12Z" fill="#F6D86A"/>`; },
  cozonac() { return `<ellipse rx="42" ry="34" fill="#C77A3A"/><ellipse rx="36" ry="28" fill="#F6E2B0"/><path d="M0 0 C10 -4 12 8 2 10 C-12 12 -14 -8 0 -12 C18 -16 22 10 6 18 C-14 26 -26 6 -20 -10" stroke="#6B3A1E" stroke-width="5" fill="none"/>`; },
  chip(col = "#F0C063") { const id = uid("cp"); let r = ""; for (let i = -3; i <= 3; i++) r += `<path d="M${-34 + Math.abs(i) * 3} ${i * 8} C-14 ${i * 8 - 8} 10 ${i * 8 + 6} ${32 - Math.abs(i) * 4} ${i * 8 - 4}" stroke="${dark(col, .22)}" stroke-opacity=".45" stroke-width="2.2" fill="none"/>`;
    return `<defs><radialGradient id="${id}" cx=".4" cy=".35"><stop offset="0" stop-color="${light(col, .3)}"/><stop offset="1" stop-color="${dark(col, .12)}"/></radialGradient><clipPath id="${id}c"><path d="M-38 4 C-34 -26 6 -36 30 -24 C46 -14 42 14 24 26 C2 38 -34 32 -38 4Z"/></clipPath></defs>
    <path d="M-38 4 C-34 -26 6 -36 30 -24 C46 -14 42 14 24 26 C2 38 -34 32 -38 4Z" fill="url(#${id})"/><g clip-path="url(#${id}c)">${r}</g>`; },
  chipOld(col = "#F0C063") { return `<path d="M-38 6 C-30 -24 10 -34 34 -18 C44 -8 40 14 22 24 C0 36 -30 30 -38 6Z" fill="${col}"/><path d="M-26 0 C-14 -14 10 -20 26 -12" stroke="#fff" stroke-opacity=".4" stroke-width="3" fill="none"/>
    <circle cx="-10" cy="10" r="2" fill="${dark(col, .25)}"/><circle cx="12" cy="4" r="2" fill="${dark(col, .25)}"/><circle cx="2" cy="18" r="1.6" fill="${dark(col, .25)}"/>`; },
  onion() { return `<circle r="34" fill="none" stroke="#EDE7F2" stroke-width="7"/><circle r="22" fill="none" stroke="#E2D6EA" stroke-width="6"/><circle r="10" fill="none" stroke="#EDE7F2" stroke-width="5"/>`; },
  herb() { return `<path d="M0 40 C0 10 -4 -10 0 -40" stroke="#3E7A34" stroke-width="3" fill="none"/>` + [[-1, -26, -40], [1, -10, 40], [-1, 6, -40], [1, 20, 40]].map(([d, y, r]) => `<ellipse cx="${d * 10}" cy="${y}" rx="12" ry="5" fill="#5BA048" transform="rotate(${r} ${d * 10} ${y})"/>`).join(""); },
  paprika() { return `<path d="M-10 -30 C-36 -20 -40 20 -16 36 C-4 44 10 44 20 34 C40 14 30 -24 6 -30 C0 -32 -6 -32 -10 -30Z" fill="#C9302B"/><path d="M-2 -30 C0 -40 8 -46 14 -44" stroke="#3E7A34" stroke-width="5" fill="none" stroke-linecap="round"/>
    <ellipse cx="-14" cy="-6" rx="5" ry="14" fill="#fff" opacity=".3"/>`; },
  puff() { let s = ""; [[-20, -8, 20], [10, -18, -20], [16, 12, 60], [-8, 18, -50]].forEach(([x, y, r]) => s += `<rect x="${x - 22}" y="${y - 8}" width="44" height="16" rx="8" fill="#F2C14E" stroke="#DDA22C" stroke-width="2" transform="rotate(${r} ${x} ${y})"/>`); return s; },
  pretzel() { return `<path d="M-30 20 C-50 -10 -20 -40 0 -14 C20 -40 50 -10 30 20 C14 40 -14 40 -30 20Z M-30 20 L20 -10 M30 20 L-20 -10" stroke="#8A4B1E" stroke-width="11" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="-14" cy="24" r="2.5" fill="#fff"/><circle cx="18" cy="-24" r="2.5" fill="#fff"/><circle cx="-26" cy="-14" r="2.5" fill="#fff"/>`; },
  jerky() { return `<path d="M-40 -10 C-20 -24 10 -18 40 -26 L36 -6 C10 0 -18 -6 -38 8Z" fill="#7A2E22"/><path d="M-38 14 C-14 2 12 12 38 2 L40 22 C12 30 -14 22 -36 32Z" fill="#8E3A2A"/>
    <path d="M-30 -8 C-10 -16 10 -12 30 -18 M-28 20 C-6 12 14 20 32 12" stroke="#C9604A" stroke-width="2" fill="none" opacity=".6"/>`; },
  edamame() { return `<path d="M-40 10 C-30 -20 20 -30 40 -14 C30 0 -10 20 -40 10Z" fill="#6DAE3E"/><circle cx="-16" cy="2" r="9" fill="#9CCB5A"/><circle cx="2" cy="-6" r="9" fill="#9CCB5A"/><circle cx="20" cy="-12" r="8" fill="#9CCB5A"/>`; },
  raisin() { return `<ellipse cx="-12" cy="0" rx="12" ry="9" fill="#5A2E3A"/><ellipse cx="12" cy="8" rx="11" ry="8" fill="#6B3445"/><path d="M-18 -2 c6 -4 10 2 14 -2" stroke="#3A1A24" stroke-width="2" fill="none"/>`; },
  bowl(col = "#FFFDF8") { return `<path d="M-44 -4 C-44 30 44 30 44 -4Z" fill="#fff"/><path d="M-44 -4 C-44 30 44 30 44 -4" fill="none" stroke="#E2E4EC" stroke-width="2"/>
    <ellipse cx="0" cy="-4" rx="44" ry="11" fill="#E9EBF2"/><ellipse cx="0" cy="-5" rx="39" ry="8" fill="${col}"/><path d="M-12 -8 C-4 -16 8 -14 14 -8 C6 -10 -4 -10 -12 -8Z" fill="#fff"/>
    <path d="M20 -10 L52 -40" stroke="#C9CDD8" stroke-width="6" stroke-linecap="round"/><ellipse cx="16" cy="-8" rx="10" ry="5" fill="#C9CDD8" transform="rotate(-40 16 -8)"/>`; },
  milk() { return `<path d="M-44 18 C-40 -6 -26 -2 -22 -18 C-18 -34 -6 -40 0 -26 C6 -40 18 -34 22 -18 C26 -2 40 -6 44 18 C30 36 -30 36 -44 18Z" fill="#fff"/>
    <circle cx="-30" cy="-26" r="5" fill="#fff"/><circle cx="30" cy="-30" r="4" fill="#fff"/><circle cx="0" cy="-44" r="4" fill="#fff"/>`; },
  swirl(col = "#FFF8EC") { return `<path d="M-38 30 C-44 10 -24 0 -4 4 C-30 -6 -24 -26 0 -24 C-16 -34 0 -46 12 -40 C30 -32 26 -16 14 -10 C34 -6 40 12 30 24 C20 36 -24 40 -38 30Z" fill="${col}" stroke="${dark(col, .12)}" stroke-width="2"/>`; },
  cheeseSlice() { return `<path d="M-40 -24 L40 -30 L40 28 L-36 30Z" fill="#F4C542"/><circle cx="-14" cy="-6" r="7" fill="#E0A526"/><circle cx="14" cy="10" r="5" fill="#E0A526"/><circle cx="24" cy="-14" r="4" fill="#E0A526"/>`; },
  mozz() { return `<circle r="34" fill="#FAFAF5"/><ellipse cx="-10" cy="-10" rx="12" ry="8" fill="#fff"/><circle r="34" fill="none" stroke="#E6E4D8" stroke-width="2"/><path d="M20 -34 C30 -44 44 -40 46 -34 C36 -30 28 -28 20 -34Z" fill="#3E9A4A"/>`; },
  tomato() { return `<circle r="22" fill="#D9342B"/><circle cx="-7" cy="-7" r="6" fill="#fff" opacity=".3"/>`; },
  ball(col = "#7A4A2E") { let s = ""; [[-16, -8], [8, -16], [14, 10], [-6, 14], [0, -2]].forEach(([x, y]) => s += `<circle cx="${x}" cy="${y}" r="12" fill="${col}"/><circle cx="${x - 4}" cy="${y - 4}" r="3.5" fill="#fff" opacity=".3"/>`); return s; },
  pancakes() { return [24, 12, 0, -12].map(y => `<ellipse cx="0" cy="${y}" rx="42" ry="12" fill="#D88A3D"/><ellipse cx="0" cy="${y - 3}" rx="40" ry="9" fill="#F2C27A"/>`).join("") + `<path d="M-14 -22 C-10 -10 10 -10 14 -22 L16 -10 C10 0 -10 0 -16 -10Z" fill="#F7D35A" opacity=".9"/>`; },
  scoop(col = "#EFE6D6") { return `<path d="M-34 0 C-34 30 34 30 34 0Z" fill="#DADDE6"/><path d="M34 -2 L58 -10" stroke="#DADDE6" stroke-width="8" stroke-linecap="round"/>
    <path d="M-30 0 C-24 -24 24 -24 30 0Z" fill="${col}"/><ellipse cx="-8" cy="-10" rx="8" ry="4" fill="#fff" opacity=".4"/>`; },
  cup(col = "#6B3A26") { return `<path d="M-30 -10 L30 -10 L24 34 L-24 34Z" fill="#fff"/><ellipse cx="0" cy="-10" rx="30" ry="8" fill="${col}"/><path d="M30 0 C46 0 46 20 26 22" stroke="#fff" stroke-width="6" fill="none"/>
    <path d="M-8 -22 C-14 -32 -2 -36 -8 -46 M8 -22 C2 -32 14 -36 8 -46" stroke="#fff" stroke-opacity=".8" stroke-width="3" fill="none"/>`; },
  wafer() { return `<rect x="-42" y="-16" width="84" height="32" rx="3" fill="#E6B873"/>` + [-8, 0, 8].map(y => `<rect x="-42" y="${y - 2}" width="84" height="4" fill="#7A4A2E"/>`).join("") + `<path d="M-42 -16 h84" stroke="#C99550" stroke-width="2"/>`; },
  bar(col = "#5C3324") { return `<path d="M-44 -6 L30 -18 L44 -6 L-30 6Z" fill="${light(col, .15)}"/><path d="M-30 6 L44 -6 L44 10 L-30 22Z" fill="${dark(col, .2)}"/><path d="M-44 -6 L-30 6 L-30 22 L-44 10Z" fill="${dark(col, .35)}"/>
    <path d="M-34 -2 C-20 -10 0 -4 10 -12 C20 -18 30 -10 36 -12" stroke="${light(col, .4)}" stroke-width="2.5" fill="none"/>`; },
  bottleMini(col) { return `<rect x="-10" y="-40" width="20" height="10" rx="2" fill="${INK}"/><path d="M-16 -30 h32 v66 a6 6 0 0 1 -6 6 h-20 a6 6 0 0 1 -6 -6Z" fill="${col}"/><rect x="-14" y="-12" width="28" height="24" fill="#fff"/>`; },
};
function artFor(p) {
  const n = p.name.toLowerCase(), A = [];
  const add = (...a) => A.push(...a);
  if (/pachet de degustare/.test(n)) return [["bar", "#5C3324"], ["cookie"], ["chip"], ["bottleMini", "#E5486A"]];
  if (/pachet 12/.test(n)) return [["bottleMini", "#5C3324"], ["bottleMini", "#E3B95B"], ["bottleMini", "#E5486A"]];
  if (/cookies & cream/.test(n)) add(["cookie", "#fff", "#2E2F45"], ["swirl"]);
  if (/cookie dough/.test(n)) add(["cookie"], ["chunk", "#4B2A20"]);
  if (/chocolate chip/.test(n)) add(["cookie"], ["chunk", "#4B2A20"]);
  if (/cookie.*dublă/.test(n)) add(["cookie", "#C9935A", "#3A2016"], ["chunk", "#3A2016"]);
  if (/cookie.*unt de arahide/.test(n)) add(["cookie", "#3A2016", "#D9A766"], ["peanut"]);
  if (/cookie.*ovăz/.test(n)) add(["cookie", "#5A2E3A", "#D8B07A"], ["oats"], ["raisin"]);
  if (/cookie vegan/.test(n)) add(["cookie", "#3A2016", "#B98552"], ["hazelnut"]);
  if (/mini cookies/.test(n)) add(["cookie", "#2A140A", "#6B3A26"], ["cookie", "#2A140A", "#7A4A2E"]);
  if (/napolitan/.test(n)) add(["wafer"], ["hazelnut"]);
  if (/brownie/.test(n)) add(["chunk", "#3A2016"], ["chunk", "#5C3324"]);
  if (/cozonac/.test(n)) add(["cozonac"], ["raisin"]);
  if (/cheesecake/.test(n)) add(["cheesecake"], ["citrus"]);
  if (/ciocolată albă/.test(n)) add(["chunk", "#F4E9D3"]);
  if (/budinc|terci|crispies|granola|ciocolată caldă/.test(n)) { if (/crispies|granola/.test(n)) add(["ball", "#7A4A2E"], ["chunk", "#4B2A20"]); else if (/terci/.test(n)) add(["oats"], ["chunk", "#4B2A20"]); else if (/caldă/.test(n)) add(["cup", "#5C3324"]); else add(["swirl", "#6B3A26"], ["chunk", "#4B2A20"]); }
  else if (/(cacao|ciocolat)/.test(n) && !/albă/.test(n) && !A.length) add(["chunk", "#4B2A20"]);
  if (/alune/.test(n) && !/cookie|napolitan/.test(n)) add(["hazelnut"]);
  if (/migdale/.test(n)) add(["almond"]);
  if (/arahide/.test(n) && !/cookie/.test(n)) add(["peanut"]);
  if (/merișoare/.test(n)) add(["cranberry"]);
  if (/fistic/.test(n)) add(["pistachio"], ["pistachio"]);
  if (/zmeur/.test(n)) add(["raspberry"]);
  if (/căpșuni/.test(n)) add(["strawberry"]);
  if (/afine/.test(n)) add(["blueberry"], ["blueberry"]);
  if (/fructe de pădure/.test(n)) add(["raspberry"], ["blueberry"]);
  if (/caramel/.test(n)) add(["caramel"], ["salt"]);
  if (/cocos/.test(n)) add(["coconut"]);
  if (/espresso|latte/.test(n)) add(["bean"], ["bean"]);
  if (/banan/.test(n)) add(["banana"]);
  if (/lămâie/.test(n) && !/cheesecake/.test(n)) add(["citrus"], ["lime"]);
  if (/mango/.test(n)) add(["mango"]);
  if (/tropical/.test(n)) add(["mango"], ["citrus", "#F7B733", "#E07B1A"]);
  if (/piersic/.test(n)) add(["peach"]);
  if (/vanilie/.test(n)) add(["vanilla"]);
  if (/mere/.test(n)) add(["apple"], ["cinnamon"], ["oats"]);
  if (/smântână/.test(n)) add(["chip"], ["onion"], ["herb"]);
  if (/paprika/.test(n)) add(["chip"], ["paprika"]);
  if (/sare de mare/.test(n)) add(["chip"], ["salt"]);
  if (/pufule/.test(n)) add(["puff"]);
  if (/covrig/.test(n)) add(["pretzel"]);
  if (/jerky/.test(n)) add(["jerky"]);
  if (/edamame/.test(n)) add(["edamame"], ["almond"], ["hazelnut"]);
  if (/clătite/.test(n)) add(["pancakes"]);
  if (/mozzarella/.test(n)) add(["mozz"], ["tomato"]);
  if (/cașcaval/.test(n)) add(["cheeseSlice"]);
  if (/neutru|colagen/.test(n)) add(["scoop"]);
  if (/izolat|whey|cazeină|proteină vegană/.test(n) && A.length < 2) add(["scoop", light(flav(p), .55)]);
  if (/skyr|iaurt|brânză|cottage|quark/.test(n) && A.length === 0) add(["bowl"]); else if (/skyr|iaurt|brânză|cottage|quark/.test(n) && !/mere/.test(n)) A.unshift(["bowl", light(flav(p), .75)]);
  if (/kefir|lapte/.test(n)) A.unshift(["milk"]);
  if (!A.length) add(["milk"]);
  return A.slice(0, 3);
}
function artSVG(p, cx, cy, size, ringCol) {
  const list = artFor(p), s = size / 100;
  const LAY = { 1: [[0, 0, 1]], 2: [[-.14, -.08, .9], [.26, .22, .62]], 3: [[-.06, -.1, .86], [.3, .2, .55], [-.32, .26, .5]], 4: [[-.22, -.18, .55], [.22, -.18, .55], [-.22, .22, .55], [.22, .22, .55]] };
  const lay = LAY[list.length];
  let out = ringCol ? `<circle cx="${cx}" cy="${cy}" r="${size * .5}" fill="${ringCol}"/>` : "";
  list.forEach(([k, ...args], i) => { const [dx, dy, sc] = lay[i]; out += `<g transform="translate(${cx + dx * size} ${cy + dy * size}) scale(${s * sc})"><g filter="url(#ishadow)">${G[k](...args)}</g></g>`; });
  return out;
}

/* ---------- front panel ---------- */
// layout: "wide" (bars, cookie packs), "tall" (most), "compact" (small label)
function panel(p, W, H, layout, c, inset = 0) {
  const S = split(p), tagline = claim(p), txt = lum(c) > .42 ? INK : "#fff", sub = lum(c) > .42 ? dark(c, .55) : light(c, .7);
  const g = p.pp != null ? p.pp + "g" : "10×", gsub = p.pp != null ? "PROTEINE" : "PRODUSE";
  const band = H * (layout === "wide" ? .12 : .085);
  let s = `<rect width="${W}" height="${H}" fill="${c}"/>
    <path d="M${W * .52} 0 L${W} 0 L${W} ${H} L${W * .30} ${H}Z" fill="${light(c, .08)}" opacity=".6"/>
    <rect y="${H - band}" width="${W}" height="${band}" fill="${BUT}"/>
    <text x="${W / 2}" y="${H - band / 2 + band * .17}" text-anchor="middle" ${FONT} font-weight="800" font-size="${band * .48}" letter-spacing="${band * .06}" fill="${INK}" data-fit="${W * .9}">${esc(tagline.toUpperCase())}</text>`;
  const flavLines = wrap(S.flav, layout === "wide" ? 16 : 14);
  if (layout === "wide") {
    const lb = logoBadge(W * .155, H * .2, Math.min(H, W * .38) * .13);
    s += lb.svg;
    s += `<text x="${W * .155}" y="${H * .5 + Math.min(H, W * .38) * .16}" text-anchor="middle" ${FONT} font-weight="800" font-size="${Math.min(H, W * .38) * .36}" letter-spacing="${-H * .012}" fill="${txt}" data-fit="${W * .25}">${g}</text>
      <text x="${W * .155}" y="${H * .5 + Math.min(H, W * .38) * .29}" text-anchor="middle" ${FONT} font-weight="700" font-size="${Math.min(H, W * .38) * .062}" letter-spacing="${H * .01}" fill="${sub}" data-fit="${W * .27}">${gsub} / PORȚIE</text>`;
    const Hh = Math.min(H, W * .38), tx = W * .33, fs = Hh * (flavLines.length > 1 ? .15 : .175);
    s += `<text x="${tx}" y="${H * .25}" ${FONT} font-weight="700" font-size="${Hh * .065}" letter-spacing="${Hh * .012}" fill="${sub}" data-fit="${W * .32}">${esc(S.type.toUpperCase())}</text>`;
    flavLines.forEach((l, i) => s += `<text x="${tx}" y="${H * .25 + fs * (1.05 + i * 1.0)}" ${FONT} font-weight="800" font-size="${fs}" letter-spacing="${-fs * .02}" fill="${txt}" data-fit="${W * .33}">${esc(l)}</text>`);
    if (S.badge) s += pill(tx, H * .25 + fs * (1.05 + flavLines.length) + H * .02, S.badge, H * .062, txt === INK ? INK : "#fff", txt === INK ? "#fff" : INK);
    s += `<text x="${W * .985}" y="${H - band - H * .045}" text-anchor="end" ${FONT} font-weight="700" font-size="${H * .06}" fill="${sub}">${esc(p.size)}</text>`;
    s += artSVG(p, W * .83, H * .45, Math.min(H * .66, W * .28), light(c, .18));
  } else {
    const compact = layout === "compact";
    const u = Math.min(W, H * .75);
    const lb = logoBadge(W / 2, H * .085, u * .085);
    s += lb.svg;
    let y = H * .085 + lb.h / 2 + u * .085;
    if (S.type) { s += `<text x="${W / 2}" y="${y}" text-anchor="middle" ${FONT} font-weight="700" font-size="${u * .05}" letter-spacing="${u * .01}" fill="${sub}" data-fit="${W * .86}">${esc(S.type.toUpperCase())}</text>`; y += u * .02; }
    const fs = u * (flavLines.length > 1 ? .105 : .12);
    flavLines.forEach((l, i) => { y += fs * (i ? .98 : 1.0); s += `<text x="${W / 2}" y="${y}" text-anchor="middle" ${FONT} font-weight="800" font-size="${fs}" letter-spacing="${-fs * .02}" fill="${txt}" data-fit="${W * .86}">${esc(l)}</text>`; });
    if (S.badge) { const bf = u * .04; y += u * .03 + bf * 1.2; s += pillC(W / 2, y, S.badge, bf, txt === INK ? INK : "#fff", txt === INK ? "#fff" : INK); y += bf * .6; }
    const bottomTop = H - band - u * .24;
    const artTop = y + u * .03, artH = Math.max(u * .2, bottomTop - artTop - u * .01);
    const asz = Math.min(artH, W * .62);
    if (!compact) s += artSVG(p, W / 2, artTop + artH / 2, asz, light(c, .18));
    // protein block bottom-left, size bottom-right
    const subY = H - band - u * .03, gy = subY - u * .062, lx = W * (.08 + inset), rx = W * (.92 - inset);
    s += `<text x="${lx}" y="${gy}" ${FONT} font-weight="800" font-size="${u * .2}" letter-spacing="${-u * .006}" fill="${txt}" data-fit="${W * (.5 - inset)}">${g}</text>
      <text x="${lx + 2}" y="${subY}" ${FONT} font-weight="700" font-size="${u * .036}" letter-spacing="${u * .006}" fill="${sub}">${gsub} / PORȚIE</text>
      <text x="${rx}" y="${gy}" text-anchor="end" ${FONT} font-weight="800" font-size="${u * .055}" fill="${txt}">${esc(p.size)}</text>`;
  }
  return s;
}
function wrap(t, max) {
  if (t.length <= max) return [t];
  const w = t.split(" "); let best = [t], bd = 1e9;
  for (let i = 1; i < w.length; i++) { const a = w.slice(0, i).join(" "), b = w.slice(i).join(" "); const d = Math.max(a.length, b.length); if (d < bd) { bd = d; best = [a, b]; } }
  return best;
}
function pill(x, y, t, fs, bg, fg) { const w = t.length * fs * .62 + fs * 1.4, h = fs * 1.7; return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${bg}"/><text x="${x + w / 2}" y="${y + h * .66}" text-anchor="middle" ${FONT} font-weight="800" font-size="${fs}" letter-spacing="${fs * .04}" fill="${fg}">${esc(t.toUpperCase())}</text>`; }
function pillC(cx, y, t, fs, bg, fg) { const w = t.length * fs * .66 + fs * 1.6; return pill(cx - w / 2, y - fs * 1.2, t, fs, bg, fg); }

/* ---------- packaging shapes (canvas 800×800) ---------- */
function crimp(x, y, w, h, dir, c) { // vertical serrated seal; dir -1 = left end, 1 = right end
  let d = "", n = Math.round(h / 12), st = h / n, ex = dir < 0 ? x : x + w, ix = dir < 0 ? x + w : x;
  d = `M${ix} ${y} L${ex} ${y}`; for (let i = 0; i < n; i++) d += ` L${ex + dir * 7} ${y + st * (i + .5)} L${ex} ${y + st * (i + 1)}`; d += ` L${ix} ${y + h}Z`;
  let r = ""; for (let xx = x + 3; xx < x + w; xx += 5) r += `<line x1="${xx}" y1="${y}" x2="${xx}" y2="${y + h}" stroke="${(xx - x) % 10 < 5 ? "#fff" : "#000"}" stroke-opacity="${(xx - x) % 10 < 5 ? .18 : .14}" stroke-width="2"/>`;
  return `<path d="${d}" fill="${dark(c, .12)}"/>${r}`;
}
const SHAPES = {
  bar(p, c) { // flow-wrap bar, slight tilt
    const W = 700, H = 220, x0 = 400 - W / 2, y0 = 400 - H / 2, e = 44;
    const body = `M${x0 + e} ${y0 + 6} Q${x0 + W / 2} ${y0 - 6} ${x0 + W - e} ${y0 + 6} L${x0 + W - e} ${y0 + H - 6} Q${x0 + W / 2} ${y0 + H + 6} ${x0 + e} ${y0 + H - 6}Z`;
    return { tilt: -8, floor: false, svg: `${crimp(x0, y0 + 14, e + 2, H - 28, -1, c)}${crimp(x0 + W - e - 2, y0 + 14, e + 2, H - 28, 1, c)}
      <clipPath id="bc"><path d="${body}"/></clipPath>
      <g clip-path="url(#bc)"><g transform="translate(${x0 + e} ${y0 - 6})">${panel(p, W - 2 * e, H + 12, "wide", c)}</g>
      <rect x="${x0}" y="${y0 - 6}" width="${W}" height="${H + 12}" fill="url(#pillowV)"/><rect x="${x0}" y="${y0 - 6}" width="${W}" height="${H + 12}" fill="url(#edgeH)"/>
      <rect x="${x0}" y="${y0 - 6}" width="${W}" height="${H + 12}" fill="url(#foil)"/></g>`, box: [x0, y0, W, H] };
  },
  cookie(p, c) { // individually wrapped cookie: wide pillow pack
    const W = 640, H = 330, x0 = 400 - W / 2, y0 = 400 - H / 2, e = 40;
    const body = `M${x0 + e} ${y0 + 8} Q${x0 + W / 2} ${y0 - 8} ${x0 + W - e} ${y0 + 8} L${x0 + W - e} ${y0 + H - 8} Q${x0 + W / 2} ${y0 + H + 8} ${x0 + e} ${y0 + H - 8}Z`;
    return { tilt: -5, floor: false, svg: `${crimp(x0, y0 + 16, e + 2, H - 32, -1, c)}${crimp(x0 + W - e - 2, y0 + 16, e + 2, H - 32, 1, c)}
      <clipPath id="bc"><path d="${body}"/></clipPath>
      <g clip-path="url(#bc)"><g transform="translate(${x0 + e} ${y0 - 8})">${panel(p, W - 2 * e, H + 16, "wide", c)}</g>
      <rect x="${x0}" y="${y0 - 8}" width="${W}" height="${H + 16}" fill="url(#pillowV)"/><rect x="${x0}" y="${y0 - 8}" width="${W}" height="${H + 16}" fill="url(#edgeH)"/>
      <rect x="${x0}" y="${y0 - 8}" width="${W}" height="${H + 16}" fill="url(#foil)"/></g>`, box: [x0, y0, W, H] };
  },
  bigtub(p, c) { // whey tub with ridged lid
    const W = 440, H = 470, x0 = 400 - W / 2, top = 175, lidH = 92, ry = 26, bot = top + lidH + H;
    let ridges = ""; for (let x = x0 + 8; x < x0 + W - 4; x += 9) ridges += `<line x1="${x}" y1="${top + 10}" x2="${x}" y2="${top + lidH - 8}" stroke="#fff" stroke-opacity=".07" stroke-width="3"/>`;
    const bodyPath = `M${x0} ${top + lidH} L${x0 + W} ${top + lidH} L${x0 + W} ${bot - ry} A${W / 2} ${ry} 0 0 1 ${x0} ${bot - ry}Z`;
    return { floor: true, svg: `<clipPath id="bc"><path d="${bodyPath}"/></clipPath>
      <g clip-path="url(#bc)"><g transform="translate(${x0} ${top + lidH})">${panel(p, W, H - ry, "tall", c)}</g><rect x="${x0}" y="${top + lidH}" width="${W}" height="${H}" fill="url(#cyl)"/></g>
      <rect x="${x0 - 6}" y="${top + 6}" width="${W + 12}" height="${lidH}" rx="10" fill="#15172A"/>${ridges}
      <rect x="${x0 - 6}" y="${top + 6}" width="${W + 12}" height="${lidH}" rx="10" fill="url(#cyl)"/>
      <ellipse cx="400" cy="${top + 6}" rx="${W / 2 + 6}" ry="${ry * .9}" fill="#23263D"/><ellipse cx="400" cy="${top + 4}" rx="${W / 2 - 14}" ry="${ry * .62}" fill="#2C2F49"/>
      <rect x="${x0 - 6}" y="${top + lidH - 2}" width="${W + 12}" height="6" fill="#000" opacity=".25"/>`, box: [x0, top - 20, W, bot - top + 20] };
  },
  pouch(p, c) {
    const W = 470, H = 600, x0 = 400 - W / 2, y0 = 100, gus = 30;
    const path = `M${x0 + 6} ${y0} H${x0 + W - 6} V${y0 + 40} Q${x0 + W - 2} ${y0 + H * .5} ${x0 + W + 10} ${y0 + H - gus} Q${x0 + W / 2} ${y0 + H + 12} ${x0 - 10} ${y0 + H - gus} Q${x0 + 2} ${y0 + H * .5} ${x0 + 6} ${y0 + 40}Z`;
    return { floor: true, svg: `<clipPath id="bc"><path d="${path}"/></clipPath>
      <g clip-path="url(#bc)"><rect x="${x0 - 20}" y="${y0}" width="${W + 40}" height="${H + 20}" fill="${c}"/><g transform="translate(${x0} ${y0 + 58})">${panel(p, W, H - 58 - gus + 4, "tall", c)}</g>
      <rect x="${x0 - 20}" y="${y0}" width="${W + 40}" height="22" fill="#000" opacity=".16"/><line x1="${x0}" y1="${y0 + 44}" x2="${x0 + W}" y2="${y0 + 44}" stroke="#000" stroke-opacity=".22" stroke-width="3"/>
      <line x1="${x0}" y1="${y0 + 48}" x2="${x0 + W}" y2="${y0 + 48}" stroke="#fff" stroke-opacity=".25" stroke-width="2"/>
      <rect x="${x0 - 20}" y="${y0}" width="${W + 40}" height="${H + 20}" fill="url(#pouchG)"/><rect x="${x0 - 20}" y="${y0 + H - 70}" width="${W + 40}" height="90" fill="url(#gusset)"/></g>
      <path d="M${x0 + 6} ${y0 + 14} l10 6 -10 6" fill="#fff" opacity=".9"/>`, box: [x0, y0, W, H] };
  },
  cup(p, c) {
    const Wt = 380, Wb = 300, H = 400, top = 230, ry = 34;
    const xl = 400 - Wt / 2, xr = 400 + Wt / 2, bl = 400 - Wb / 2, br = 400 + Wb / 2, bot = top + H;
    const path = `M${xl} ${top} L${xr} ${top} L${br} ${bot - 14} Q400 ${bot + 14} ${bl} ${bot - 14}Z`;
    return { floor: true, svg: `<clipPath id="bc"><path d="${path}"/></clipPath>
      <g clip-path="url(#bc)"><g transform="translate(${xl} ${top + 16})">${panel(p, Wt, H - 26, "tall", c, .1)}</g><rect x="${xl}" y="${top}" width="${Wt}" height="${H + 20}" fill="url(#cyl)"/></g>
      <ellipse cx="400" cy="${top}" rx="${Wt / 2 + 12}" ry="${ry}" fill="#D9DCE6"/><ellipse cx="400" cy="${top - 3}" rx="${Wt / 2 + 4}" ry="${ry - 6}" fill="url(#foilLid)"/>
      <path d="M${xr - 10} ${top - 18} q30 -10 36 6 q-14 10 -30 6Z" fill="#CBD0DE"/>`, box: [xl, top - ry, Wt, H + ry] };
  },
  tub(p, c) {
    const Wt = 480, Wb = 420, H = 330, top = 270, ry = 40, lid = 46;
    const xl = 400 - Wt / 2, xr = 400 + Wt / 2, bl = 400 - Wb / 2, br = 400 + Wb / 2, bot = top + H;
    const path = `M${xl} ${top} L${xr} ${top} L${br} ${bot - 14} Q400 ${bot + 16} ${bl} ${bot - 14}Z`;
    return { floor: true, svg: `<clipPath id="bc"><path d="${path}"/></clipPath>
      <g clip-path="url(#bc)"><g transform="translate(${xl} ${top + 10})">${panel(p, Wt, H - 18, "tall", c, .06)}</g><rect x="${xl}" y="${top}" width="${Wt}" height="${H + 20}" fill="url(#cyl)"/></g>
      <path d="M${xl - 12} ${top - lid} L${xr + 12} ${top - lid} L${xr + 14} ${top + 6} Q400 ${top + 30} ${xl - 14} ${top + 6}Z" fill="${light(c, .82)}"/>
      <path d="M${xl - 12} ${top - lid} L${xr + 12} ${top - lid} L${xr + 14} ${top + 6} Q400 ${top + 30} ${xl - 14} ${top + 6}Z" fill="url(#cyl)"/>
      <ellipse cx="400" cy="${top - lid}" rx="${Wt / 2 + 12}" ry="${ry}" fill="${light(c, .9)}"/><ellipse cx="400" cy="${top - lid}" rx="${Wt / 2 - 20}" ry="${ry - 10}" fill="${light(c, .85)}" stroke="#fff" stroke-width="3"/>`, box: [xl, top - lid - ry, Wt, H + lid + ry] };
  },
  bag(p, c) { // snack pillow bag
    const W = 430, H = 560, x0 = 400 - W / 2, y0 = 120, e = 40;
    const sealH = (y, up) => { let d = `M${x0 + 8} ${y} `; const n = 34, st = (W - 16) / n; const ey = up ? y - e : y + e; d = `M${x0 + 8} ${y} L${x0 + 8} ${ey}`; for (let i = 0; i < n; i++) d += ` L${x0 + 8 + st * (i + .5)} ${ey + (up ? -7 : 7)} L${x0 + 8 + st * (i + 1)} ${ey}`; d += ` L${x0 + W - 8} ${y}Z`;
      let r = ""; for (let yy = Math.min(y, ey) + 3; yy < Math.max(y, ey); yy += 5) r += `<line x1="${x0 + 8}" y1="${yy}" x2="${x0 + W - 8}" y2="${yy}" stroke="${Math.round(yy) % 10 < 5 ? "#fff" : "#000"}" stroke-opacity=".14" stroke-width="2"/>`;
      return `<path d="${d}" fill="${dark(c, .12)}"/>${r}`; };
    const body = `M${x0 + 8} ${y0 + e} Q${x0 - 8} ${y0 + H / 2} ${x0 + 8} ${y0 + H - e} L${x0 + W - 8} ${y0 + H - e} Q${x0 + W + 8} ${y0 + H / 2} ${x0 + W - 8} ${y0 + e}Z`;
    return { floor: true, svg: `${sealH(y0 + e, true)}${sealH(y0 + H - e, false)}<clipPath id="bc"><path d="${body}"/></clipPath>
      <g clip-path="url(#bc)"><g transform="translate(${x0} ${y0 + e})">${panel(p, W, H - 2 * e, "tall", c)}</g>
      <rect x="${x0 - 10}" y="${y0}" width="${W + 20}" height="${H}" fill="url(#pillowH)"/><rect x="${x0 - 10}" y="${y0}" width="${W + 20}" height="${H}" fill="url(#pillowV2)"/><rect x="${x0 - 10}" y="${y0}" width="${W + 20}" height="${H}" fill="url(#foil)"/></g>`, box: [x0, y0, W, H] };
  },
  box(p, c) { // 3/4 carton box
    const W = 380, H = 520, D = 90, x0 = 400 - (W + D) / 2, y0 = 160;
    const tc = light(c, .12), sc = dark(c, .28);
    return { floor: true, svg: `<path d="M${x0} ${y0} L${x0 + D * .55} ${y0 - 40} L${x0 + W + D * .55} ${y0 - 40} L${x0 + W} ${y0}Z" fill="${tc}"/>
      <path d="M${x0 + W} ${y0} L${x0 + W + D * .55} ${y0 - 40} L${x0 + W + D * .55} ${y0 + H - 40} L${x0 + W} ${y0 + H}Z" fill="${sc}"/>
      <path d="M${x0 + W} ${y0 + H * .915} L${x0 + W + D * .55} ${y0 + H * .915 - 40} L${x0 + W + D * .55} ${y0 + H - 40} L${x0 + W} ${y0 + H}Z" fill="${dark(BUT, .22)}" opacity="0"/>
      <g transform="translate(${x0} ${y0})">${panel(p, W, H, "tall", c)}</g>
      <rect x="${x0}" y="${y0}" width="${W}" height="${H}" fill="url(#boxG)"/>
      <path d="M${x0} ${y0} H${x0 + W}" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>`, box: [x0, y0 - 40, W + D * .55, H + 40] };
  },
  jar(p, c) {
    const W = 380, H = 380, x0 = 400 - W / 2, top = 290, lidH = 80, ry = 24, bot = top + H;
    const path = `M${x0} ${top + 20} Q${x0} ${top} ${x0 + 30} ${top} H${x0 + W - 30} Q${x0 + W} ${top} ${x0 + W} ${top + 20} V${bot - 30} Q${x0 + W} ${bot} ${x0 + W - 40} ${bot} H${x0 + 40} Q${x0} ${bot} ${x0} ${bot - 30}Z`;
    let ridges = ""; for (let x = x0 + 16; x < x0 + W - 8; x += 9) ridges += `<line x1="${x}" y1="${top - lidH + 8}" x2="${x}" y2="${top + 2}" stroke="#fff" stroke-opacity=".07" stroke-width="3"/>`;
    return { floor: true, svg: `<clipPath id="bc"><path d="${path}"/></clipPath>
      <g clip-path="url(#bc)"><g transform="translate(${x0} ${top + 8})">${panel(p, W, H - 14, "tall", c)}</g><rect x="${x0}" y="${top}" width="${W}" height="${H}" fill="url(#cyl)"/></g>
      <rect x="${x0 + 8}" y="${top - lidH}" width="${W - 16}" height="${lidH + 8}" rx="10" fill="#15172A"/>${ridges}<rect x="${x0 + 8}" y="${top - lidH}" width="${W - 16}" height="${lidH + 8}" rx="10" fill="url(#cyl)"/>
      <ellipse cx="400" cy="${top - lidH}" rx="${W / 2 - 8}" ry="${ry * .7}" fill="#23263D"/>`, box: [x0, top - lidH - ry, W, H + lidH + ry] };
  },
  bottle(p, c, clear) {
    const W = 250, x0 = 400 - W / 2, capT = 90, capH = 70, neckT = capT + capH, sh = 250, bot = 720;
    const path = `M${400 - 48} ${neckT} H${400 + 48} V${neckT + 20} Q${x0 + W} ${neckT + 40} ${x0 + W} ${sh} V${bot - 26} Q${x0 + W} ${bot} ${x0 + W - 26} ${bot} H${x0 + 26} Q${x0} ${bot} ${x0} ${bot - 26} V${sh} Q${x0} ${neckT + 40} ${400 - 48} ${neckT + 20}Z`;
    let ridges = ""; for (let x = 400 - 54; x < 400 + 54; x += 7) ridges += `<line x1="${x}" y1="${capT + 6}" x2="${x}" y2="${capT + capH - 4}" stroke="#fff" stroke-opacity=".08" stroke-width="2.5"/>`;
    const lt = clear ? sh + 40 : sh + 10, lh = clear ? 300 : bot - sh - 40;
    const liquid = clear ? `<rect x="${x0 - 10}" y="${neckT + 40}" width="${W + 20}" height="${bot}" fill="${light(c, .45)}" opacity=".75"/><rect x="${x0 - 10}" y="${neckT + 40}" width="${W + 20}" height="6" fill="#fff" opacity=".5"/>` : `<rect x="${x0 - 10}" y="${neckT}" width="${W + 20}" height="${bot}" fill="${c}"/>`;
    return { floor: true, svg: `<clipPath id="bc"><path d="${path}"/></clipPath>
      ${clear ? `<path d="${path}" fill="#fff" opacity=".35"/>` : ""}
      <g clip-path="url(#bc)">${liquid}<g transform="translate(${x0} ${lt})">${panel(p, W, lh, clear ? "compact" : "tall", c)}</g><rect x="${x0}" y="${neckT}" width="${W}" height="${bot - neckT}" fill="url(#cyl)"/></g>
      ${clear ? `<path d="${path}" fill="none" stroke="${dark(c, .1)}" stroke-opacity=".5" stroke-width="3"/>` : ""}
      <rect x="${400 - 56}" y="${capT}" width="112" height="${capH}" rx="10" fill="${clear ? dark(c, .15) : "#15172A"}"/>${ridges}<rect x="${400 - 56}" y="${capT}" width="112" height="${capH}" rx="10" fill="url(#cyl)"/>`, box: [x0, capT, W, bot - capT] };
  },
  clear(p, c) { return SHAPES.bottle(p, c, true); },
  can(p, c) {
    const W = 240, x0 = 400 - W / 2, top = 110, bot = 720, ry = 18;
    const path = `M${x0 + 14} ${top + 20} H${x0 + W - 14} L${x0 + W} ${top + 52} V${bot - 30} L${x0 + W - 14} ${bot - 6} Q400 ${bot + 8} ${x0 + 14} ${bot - 6} L${x0} ${bot - 30} V${top + 52}Z`;
    return { floor: true, svg: `<clipPath id="bc"><path d="${path}"/></clipPath>
      <g clip-path="url(#bc)"><rect x="${x0}" y="${top}" width="${W}" height="${bot}" fill="${c}"/><g transform="translate(${x0} ${top + 60})">${panel(p, W, bot - top - 92, "tall", c)}</g>
      <rect x="${x0}" y="${top}" width="${W}" height="54" fill="#C9CDD8"/><rect x="${x0}" y="${bot - 34}" width="${W}" height="40" fill="#C9CDD8"/>
      <rect x="${x0}" y="${top}" width="${W}" height="${bot - top}" fill="url(#cyl)"/></g>
      <ellipse cx="400" cy="${top + 20}" rx="${W / 2 - 14}" ry="${ry}" fill="#B6BBC8"/><ellipse cx="400" cy="${top + 20}" rx="${W / 2 - 24}" ry="${ry - 5}" fill="#D7DBE4"/>
      <ellipse cx="410" cy="${top + 18}" rx="20" ry="6" fill="#9AA0B0"/>`, box: [x0, top, W, bot - top] };
  },
  carton(p, c) {
    const W = 260, D = 70, x0 = 400 - (W + D * .6) / 2, top = 240, bot = 720, roof = 110;
    return { floor: true, svg: `<path d="M${x0 + W} ${top} L${x0 + W + D * .6} ${top - 26} V${bot - 26} L${x0 + W} ${bot}Z" fill="${dark(c, .28)}"/>
      <path d="M${x0} ${top} L${x0 + W / 2} ${top - roof} L${x0 + W} ${top}Z" fill="#F4F5FA"/><path d="M${x0 + W / 2} ${top - roof} L${x0 + W / 2 + D * .6} ${top - roof - 26} L${x0 + W + D * .6} ${top - 26} L${x0 + W} ${top}Z" fill="#D6D9E4"/>
      <rect x="${x0 + W / 2 - 4}" y="${top - roof - 34}" width="${D * .6 + 8}" height="22" fill="#E6E8F0" transform="skewY(-20)" transform-origin="${x0 + W / 2} ${top - roof}"/>
      <circle cx="${x0 + W * .72}" cy="${top - roof * .42}" r="16" fill="${c}"/><circle cx="${x0 + W * .72}" cy="${top - roof * .42}" r="16" fill="url(#cylS)"/>
      <g transform="translate(${x0} ${top})">${panel(p, W, bot - top, "tall", c)}</g><rect x="${x0}" y="${top}" width="${W}" height="${bot - top}" fill="url(#boxG)"/>`, box: [x0, top - roof - 30, W + D * .6, bot - top + roof + 30] };
  },
  shot(p, c) {
    const W = 200, x0 = 400 - W / 2, capT = 150, capH = 70, neckT = capT + capH, bot = 700;
    const path = `M${400 - 52} ${neckT} H${400 + 52} Q${x0 + W} ${neckT + 4} ${x0 + W} ${neckT + 60} V${bot - 22} Q${x0 + W} ${bot} ${x0 + W - 22} ${bot} H${x0 + 22} Q${x0} ${bot} ${x0} ${bot - 22} V${neckT + 60} Q${x0} ${neckT + 4} ${400 - 52} ${neckT}Z`;
    return { floor: true, svg: `<clipPath id="bc"><path d="${path}"/></clipPath>
      <g clip-path="url(#bc)"><rect x="${x0}" y="${neckT}" width="${W}" height="${bot}" fill="${c}"/><g transform="translate(${x0} ${neckT + 64})">${panel(p, W, bot - neckT - 70, "tall", c)}</g><rect x="${x0}" y="${neckT}" width="${W}" height="${bot - neckT}" fill="url(#cyl)"/></g>
      <rect x="${400 - 60}" y="${capT}" width="120" height="${capH}" rx="10" fill="#15172A"/><rect x="${400 - 60}" y="${capT}" width="120" height="${capH}" rx="10" fill="url(#cyl)"/>`, box: [x0, capT, W, bot - capT] };
  },
};
function shapeOf(p) {
  if (/^(whey|izolat|cazeina)/.test(p.id)) return "bigtub";
  const s = p.shape || (CATS.find(c => c.id === p.c) || {}).shape || "box";
  return s;
}

/* ---------- scene ---------- */
const DEFS = `<defs>
  <radialGradient id="bgR" cx=".5" cy=".42" r=".75"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#F7F7F8"/><stop offset="1" stop-color="#EDEDF0"/></radialGradient>
  <linearGradient id="cyl" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#000" stop-opacity=".42"/><stop offset=".08" stop-color="#000" stop-opacity=".12"/><stop offset=".17" stop-color="#fff" stop-opacity=".30"/>
    <stop offset=".22" stop-color="#fff" stop-opacity=".05"/><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset=".86" stop-color="#000" stop-opacity=".14"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient>
  <linearGradient id="cylS" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>
  <linearGradient id="pillowV" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#000" stop-opacity=".30"/><stop offset=".06" stop-color="#fff" stop-opacity=".10"/><stop offset=".14" stop-color="#fff" stop-opacity=".34"/><stop offset=".24" stop-color="#fff" stop-opacity="0"/>
    <stop offset=".75" stop-color="#000" stop-opacity="0"/><stop offset=".92" stop-color="#000" stop-opacity=".16"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></linearGradient>
  <linearGradient id="pillowV2" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#000" stop-opacity=".25"/><stop offset=".12" stop-color="#fff" stop-opacity=".22"/><stop offset=".22" stop-color="#fff" stop-opacity="0"/>
    <stop offset=".80" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>
  <linearGradient id="edgeH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset=".08" stop-color="#000" stop-opacity="0"/><stop offset=".92" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>
  <linearGradient id="pillowH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".38"/><stop offset=".1" stop-color="#000" stop-opacity=".05"/><stop offset=".2" stop-color="#fff" stop-opacity=".22"/><stop offset=".28" stop-color="#fff" stop-opacity="0"/><stop offset=".85" stop-color="#000" stop-opacity=".06"/><stop offset="1" stop-color="#000" stop-opacity=".40"/></linearGradient>
  <linearGradient id="foil" x1="0" y1="0" x2="1" y2=".35"><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset=".52" stop-color="#fff" stop-opacity=".20"/><stop offset=".56" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#fff" stop-opacity=".1"/><stop offset=".66" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <linearGradient id="pouchG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".32"/><stop offset=".07" stop-color="#000" stop-opacity=".06"/><stop offset=".16" stop-color="#fff" stop-opacity=".18"/><stop offset=".26" stop-color="#fff" stop-opacity="0"/><stop offset=".88" stop-color="#000" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".34"/></linearGradient>
  <linearGradient id="gusset" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".6" stop-color="#000" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>
  <linearGradient id="boxG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".14"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>
  <radialGradient id="foilLid" cx=".4" cy=".4" r=".8"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#E9ECF3"/><stop offset="1" stop-color="#C3C8D6"/></radialGradient>
  <filter id="ishadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity=".25"/></filter>
  <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>
  <filter id="soft2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
  <filter id="cast" x="-30%" y="-30%" width="160%" height="160%"><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"/><feGaussianBlur stdDeviation="16"/></filter>
</defs>`;

function render(p) {
  const c = flav(p), sh = shapeOf(p), S = (SHAPES[sh] || SHAPES.box)(p, c);
  const [bx, by, bw, bh] = S.box;
  const fit = (sh === 'bar' ? 690 : sh === 'cookie' ? 660 : 600) / Math.max(bw, bh);
  const k = Math.min(1.15, fit);
  const cx = bx + bw / 2, cy = by + bh / 2;
  const tx = 400 - cx * k, ty = (S.floor ? 405 : 395) - cy * k;
  const bottom = ty + (by + bh) * k, halfW = bw * k / 2;
  const prod = `<g transform="translate(${tx} ${ty}) scale(${k})"><g ${S.tilt ? `transform="rotate(${S.tilt} 400 400)"` : ""}>${S.svg}</g></g>`;
  const shadow = S.floor
    ? `<ellipse cx="${400 + 18}" cy="${bottom - 2}" rx="${halfW * 1.08}" ry="${halfW * .14}" fill="#2A2A35" opacity=".22" filter="url(#soft)"/>
       <ellipse cx="400" cy="${bottom - 2}" rx="${halfW * .9}" ry="${halfW * .04}" fill="#000" opacity=".35" filter="url(#soft2)"/>`
    : `<g transform="translate(14 34)" opacity=".30" filter="url(#cast)">${prod}</g>`;
  return `<svg id="st" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">${DEFS}<rect width="800" height="800" fill="url(#bgR)"/>${shadow}${prod}</svg>`;
}

function fitText() {
  document.querySelectorAll("text[data-fit]").forEach(t => {
    const max = +t.dataset.fit, len = t.getComputedTextLength();
    if (len > max) { const fs = parseFloat(t.getAttribute("font-size")); t.setAttribute("font-size", fs * max / len); }
  });
}
const id = new URLSearchParams(location.search).get("id"); const p = P.find(x => x.id === id);
document.fonts.load('800 40px "Bricolage Grotesque"').then(() => document.fonts.load('700 40px "Bricolage Grotesque"')).then(() => {
  document.body.innerHTML = render(p); fitText(); document.body.dataset.ready = 1;
});
