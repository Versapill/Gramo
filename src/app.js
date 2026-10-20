(function(){
"use strict";
const P = window.PRODUCTS, CATS = window.CATS;
const byId = Object.fromEntries(P.map(p => [p.id, p]));
const catById = Object.fromEntries(CATS.map(c => [c.id, c]));
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const app = $("#app");
const FREE = 199, SHIP = 19.99, CUTOFF = "14:00", COUPON = "GRAMO15";
const SITE_DESC = "Batoane, cookies, lactate, pudre și băuturi bogate în proteine. Peste 75 de produse, livrare rapidă în toată țara. Gramo, fiecare gram contează.";

/* ---------- utils ---------- */
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmt = n => n.toFixed(2).replace(".", ",") + " lei";
const dec = n => String(n).replace(".", ",");
const has = (p, t) => (p.tags || []).includes(t);
const isCold = p => p.c === "lactate" || !!p.cold;
const isSupp = p => p.c === "pudre" && !p.food;
const hash = s => { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
const store = {
  get(k, d){ try { const v = localStorage.getItem("gramo:" + k); return v == null ? d : JSON.parse(v); } catch(e){ return d; } },
  set(k, v){ try { localStorage.setItem("gramo:" + k, JSON.stringify(v)); } catch(e){} }
};
const validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

/* ---------- logo ---------- */
const DIAL = `<svg class="dial" viewBox="0 0 40 40" aria-hidden="true"><circle class="face" cx="20" cy="20" r="15"/><circle class="rim" cx="20" cy="20" r="15" stroke-width="6.5"/><path class="needle" d="M20 20 L28.5 11.5" stroke-width="5" stroke-linecap="round"/><circle class="hub" cx="20" cy="20" r="3.8"/></svg>`;
const logoHTML = () => `gram${DIAL}`;
$("#logo").innerHTML = logoHTML();

/* ---------- flavour colours ---------- */
const FLAV = [
  ["fistic","#7FB24A"],["zmeur","#D9356A"],["căpșuni","#E5486A"],["afine","#4F4CC9"],["fructe de pădure","#8E2F6B"],
  ["mango","#F2A93B"],["piersic","#F59C6B"],["lămâie","#E9CF3A"],["banan","#EDC93C"],["tropical","#F28C38"],
  ["espresso","#4A2E22"],["latte","#8A5A3C"],["caramel","#C67C2E"],["cocos","#3F8C88"],["arahide","#C9853F"],
  ["cozonac","#A3341F"],["cheesecake","#E8C547"],["cookie dough","#B98552"],["brownie","#4B2A20"],
  ["cacao","#6B3A26"],["ciocolat","#5C3324"],["vanilie","#E3B95B"],["paprika","#C9442B"],["smântână","#4D8F5B"],
  ["sare de mare","#3A6FB0"],["pufule","#E2A93A"],["covrig","#9C5B2C"],["jerky","#7A2E22"],["edamame","#5E9640"],
  ["ovăz","#B48A55"],["skyr","#6C9BD2"],["grecesc","#3D6FB6"],["soia","#7C9B4D"],["brânză","#5D86C5"],
  ["cottage","#5A9CC4"],["quark","#4F7FD0"],["mozzarella","#3FA06F"],["cașcaval","#E0A526"],["kefir","#6A8FD8"],
  ["lapte","#3E64D6"],["colagen","#9A8FB8"],["neutru","#7A86A8"],["clătite","#D88A3D"],["degustare","#2B37E8"],["natural","#3E64D6"]
];
function flav(p){
  const n = p.name.toLowerCase();
  for (const [k, c] of FLAV) if (n.includes(k)) return c;
  return "#2B37E8";
}
const tint = c => `background:color-mix(in srgb, ${c} 20%, var(--card))`;

/* ---------- packaging illustrations ---------- */
const INK = "#11153D", BUT = "#FFD84A";
function label(x, y, w, h, p, big){
  const g = p.pp != null ? p.pp + "g" : "10×";
  const fs = big || Math.min(h * .52, w * .36);
  // wordmark: "gram" + scale dial, same construction as the site logo
  const wf = h * .2, gw = wf * 2.05, dr = wf * .3, tw = gw + wf * .05 + dr * 2;
  const wx = x + (w - tw) / 2, wy = y + h * .27, dcx = wx + gw + wf * .05 + dr, dcy = wy - dr * .95;
  const wm = `<text x="${wx}" y="${wy}" textLength="${gw}" lengthAdjust="spacingAndGlyphs" font-family="Bricolage Grotesque, Arial Black, sans-serif" font-weight="800" font-size="${wf}" fill="${INK}">gram</text>
  <circle cx="${dcx}" cy="${dcy}" r="${dr * .82}" fill="${BUT}" stroke="${INK}" stroke-width="${dr * .36}"/>
  <path d="M${dcx} ${dcy} l${dr * .5} ${-dr * .5}" stroke="#2B37E8" stroke-width="${dr * .3}" stroke-linecap="round"/><circle cx="${dcx}" cy="${dcy}" r="${dr * .2}" fill="#2B37E8"/>`;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#fff"/>
  ${wm}
  <text x="${x + w/2}" y="${y + h*.27 + fs*.95}" text-anchor="middle" font-family="Bricolage Grotesque, Arial Black, sans-serif" font-weight="800" font-size="${fs}" fill="${INK}" letter-spacing="-2">${g}</text>
  <rect x="${x}" y="${y + h - h*.14}" width="${w}" height="${h*.14}" fill="${BUT}"/>`;
}
function pack(p){
  const c = flav(p);
  const shape = p.shape || (catById[p.c] ? catById[p.c].shape : "box");
  const v = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(p.name)}">`;
  let s = "";
  switch (shape) {
    case "bar":
      s = `<g transform="rotate(-14 100 100)">
        <path d="M14 66 l6 6 -6 6 6 6 -6 6 6 6 -6 6 6 6 -6 6 6 6 -6 6 H186 l-6 -6 6 -6 -6 -6 6 -6 -6 -6 6 -6 -6 -6 6 -6 -6 -6 6 -6Z" fill="${c}"/>
        <rect x="14" y="66" width="172" height="10" fill="#000" opacity=".12"/>
        ${label(60, 74, 80, 52, p)}</g>`; break;
    case "cup":
      s = `<path d="M48 62 H152 L139 172 Q100 182 61 172 Z" fill="${c}"/>
        <ellipse cx="100" cy="62" rx="56" ry="11" fill="#E4E7F4"/><ellipse cx="100" cy="60" rx="50" ry="7" fill="#C9CEE6"/>
        ${label(62, 92, 76, 58, p)}`; break;
    case "tub":
      s = `<path d="M34 78 H166 L156 170 Q100 180 44 170 Z" fill="${c}"/>
        <rect x="28" y="62" width="144" height="20" rx="8" fill="#E4E7F4"/>
        ${label(66, 96, 68, 58, p)}`; break;
    case "bag":
      s = `<path d="M46 36 H154 L160 48 Q152 100 160 156 L154 168 H46 L40 156 Q48 100 40 48 Z" fill="${c}"/>
        <path d="M46 36 H154 L160 48 H40Z M40 156 H160 L154 168 H46Z" fill="#000" opacity=".15"/>
        ${label(62, 70, 76, 70, p)}`; break;
    case "pouch":
      s = `<path d="M44 26 H156 V36 Q164 100 168 178 Q100 188 32 178 Q36 100 44 36Z" fill="${c}"/>
        <rect x="44" y="26" width="112" height="12" fill="#000" opacity=".18"/><line x1="48" y1="50" x2="152" y2="50" stroke="#fff" stroke-opacity=".45" stroke-width="2" stroke-dasharray="4 3"/>
        ${label(58, 74, 84, 80, p)}`; break;
    case "box":
      s = `<path d="M40 54 L60 34 H170 L150 54Z" fill="${c}" opacity=".7"/><path d="M150 54 L170 34 V160 L150 180Z" fill="${c}" opacity=".55"/>
        <rect x="40" y="54" width="110" height="126" fill="${c}"/>
        ${label(52, 82, 86, 70, p)}`; break;
    case "jar":
      s = `<rect x="50" y="58" width="100" height="122" rx="16" fill="${c}"/><rect x="46" y="38" width="108" height="26" rx="8" fill="${INK}"/>
        ${label(62, 86, 76, 66, p)}`; break;
    case "cookie": {
      const chips = [[70,72],[118,64],[136,108],[86,128],[60,108],[112,140],[100,96]];
      s = `<circle cx="100" cy="100" r="74" fill="#C9935A"/><circle cx="100" cy="100" r="74" fill="${c}" opacity=".45"/>
        <circle cx="100" cy="100" r="66" fill="none" stroke="#000" stroke-opacity=".08" stroke-width="6"/>
        ${chips.map(([x,y]) => `<rect x="${x}" y="${y}" width="12" height="10" rx="3" fill="#3A2016"/>`).join("")}
        <circle cx="132" cy="146" r="30" fill="#fff"/><text x="132" y="153" text-anchor="middle" font-family="Bricolage Grotesque, Arial Black, sans-serif" font-weight="800" font-size="22" fill="${INK}" letter-spacing="-1">${p.pp}g</text>`; break; }
    case "can":
      s = `<rect x="62" y="34" width="76" height="144" rx="12" fill="${c}"/><ellipse cx="100" cy="36" rx="38" ry="7" fill="#C9CEE6"/>
        ${label(66, 82, 68, 62, p)}`; break;
    case "carton":
      s = `<path d="M56 64 L76 30 H124 L144 64Z" fill="#fff"/><rect x="84" y="20" width="32" height="12" fill="${c}"/>
        <rect x="56" y="64" width="88" height="116" fill="${c}"/>${label(64, 88, 72, 64, p)}`; break;
    case "shot":
      s = `<rect x="84" y="54" width="32" height="16" rx="3" fill="${INK}"/><path d="M76 74 Q76 68 84 68 H116 Q124 68 124 74 V170 Q124 178 116 178 H84 Q76 178 76 170Z" fill="${c}"/>
        ${label(80, 98, 40, 56, p, 17)}`; break;
    case "clear":
    case "bottle":
    default: {
      const clear = shape === "clear";
      s = `<rect x="82" y="16" width="36" height="20" rx="4" fill="${clear ? c : INK}"/>
        <path d="M70 52 Q70 40 86 40 H114 Q130 40 130 52 L140 72 V172 Q140 184 128 184 H72 Q60 184 60 172 V72 Z" fill="${c}" ${clear ? 'fill-opacity=".38" stroke="'+c+'" stroke-width="3"' : ""}/>
        ${label(66, 90, 68, 64, p)}`;
    }
  }
  return v + s + "</svg>";
}


/* ---------- product photos (img/<id>.jpg when generated, otherwise the illustration) ---------- */
const PHOTOS = new Set(window.PHOTOS || []);
const PHOTO_SRC = window.PHOTO_SRC || {};
const art = p => PHOTOS.has(p.id) ? `<img class="photo" src="${PHOTO_SRC[p.id] || `img/${p.id}.jpg`}" alt="${esc(p.name)}" loading="lazy" width="800" height="800">` : pack(p);

/* ---------- state ---------- */
let cart = store.get("cart", []);
let coupon = store.get("coupon", "");
const saveCart = () => { store.set("cart", cart); store.set("coupon", coupon); renderCount(); };
const unit = l => byId[l.id].price * (l.s ? .9 : 1);
function totals(){
  const sub = cart.reduce((a, l) => a + unit(l) * l.q, 0);
  const disc = coupon === COUPON ? sub * .15 : 0;
  const after = sub - disc;
  const ship = cart.length === 0 || after >= FREE ? 0 : SHIP;
  return { sub, disc, after, ship, total: after + ship, cold: cart.some(l => isCold(byId[l.id])) };
}
function addToCart(id, q = 1, s = 0, silent){
  const p = byId[id]; if (!p || p.stock === 0) return;
  const ex = cart.find(l => l.id === id && l.s === s);
  if (ex) ex.q += q; else cart.push({ id, q, s });
  saveCart(); renderDrawer();
  if (!silent) toast(`<b>✓</b> ${esc(p.name)} a fost adăugat în coș`);
}
function renderCount(){ $("#cartCount").textContent = cart.reduce((a, l) => a + l.q, 0); }

let toastT;
function toast(html){
  const t = $("#toast"); t.innerHTML = html; t.classList.add("show");
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2600);
}

/* ---------- announcement ---------- */
const ANN = [
  `Livrare gratuită la comenzi peste <b>199 lei</b>`,
  `-15% la prima comandă cu codul <b>${COUPON}</b>`,
  `Livrăm în <b>24-48h</b> în toată țara`
];
let annI = 0;
function rotateAnn(){ $("#announce").innerHTML = `<span>${ANN[annI % ANN.length]}</span>`; annI++; }
rotateAnn(); setInterval(rotateAnn, 5000);

/* ---------- nav + footer ---------- */
const NAV = [["c-batoane","Batoane"],["c-lactate","Lactate"],["c-snackuri","Cookies & snackuri"],["c-pudre","Pudre"],["c-bauturi","Băuturi"],["pachete","Pachete"],["despre","Despre noi"]];
$("#nav").innerHTML = NAV.map(([h, t]) => `<a href="#${h}" data-r="${h}">${t}</a>`).join("");
$("#menuBtn").onclick = () => { const n = $("#nav"); const o = n.classList.toggle("open"); $("#menuBtn").setAttribute("aria-expanded", o); };

$("#footer").innerHTML = `
<div class="fgrid">
  <div class="about"><a href="#acasa" class="logo">${logoHTML()}</a>
    <p>Gramo face gustări proteice pentru viața reală. Gust întâi, cifre clare, fără compromisuri.</p></div>
  <div><h4>Magazin</h4><ul>
    <li><a href="#c-batoane">Batoane</a></li><li><a href="#c-lactate">Lactate</a></li><li><a href="#c-snackuri">Cookies & snackuri</a></li>
    <li><a href="#c-pudre">Pudre</a></li><li><a href="#c-bauturi">Băuturi</a></li><li><a href="#pachete">Pachete</a></li></ul></div>
  <div><h4>Ajutor</h4><ul>
    <li><a href="#livrare">Livrare</a></li><li><a href="#livrare">Retur</a></li><li><a href="#intrebari">Întrebări frecvente</a></li>
    <li><a href="#contact">Contact</a></li></ul></div>
</div>
<div class="legalbar"><span>© 2026 Gramo. Toate drepturile rezervate.</span></div>`;

/* ---------- product card ---------- */
function card(p){
  const c = flav(p);
  const flags = [];
  if (has(p, "Bestseller")) flags.push(`<span class="flag best">Bestseller</span>`);
  if (has(p, "Ediție limitată")) flags.push(`<span class="flag best">Ediție limitată</span>`);
  if (has(p, "Vegan")) flags.push(`<span class="flag">Vegan</span>`);
  if (isCold(p)) flags.push(`<span class="flag cold">❄ La rece</span>`);
  if (p.stock === 0) flags.push(`<span class="flag out">Epuizat</span>`);
  return `<article class="pcard">
    <a class="img" href="#p-${p.id}" style="${tint(c)}" aria-label="${esc(p.name)}">${art(p)}
      ${p.pp ? `<span class="gbadge"><b>${p.pp} g</b>proteine / porție</span>` : `<span class="gbadge"><b>10</b>produse</span>`}
      <span class="flags">${flags.slice(0,2).join("")}</span></a>
    <div class="body">
      <h3><a href="#p-${p.id}">${esc(p.name)}</a></h3>
      <p class="blurb">${esc(p.card)}</p>
      <div class="meta"><span class="price">${fmt(p.price)} <small>· ${esc(p.size)}</small></span>
        <button class="add" data-add="${p.id}" ${p.stock === 0 ? "disabled style='opacity:.35'" : ""} aria-label="Adaugă în coș: ${esc(p.name)}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button></div>
    </div></article>`;
}

/* ---------- icons ---------- */
const IC = {
  scale:`<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="12" width="30" height="22" rx="5"/><path d="M12 12a8 8 0 0 1 16 0"/><path d="M20 12l4-5"/><path d="M11 25h18"/></svg>`,
  taste:`<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="20" cy="20" r="14"/><path d="M13 22c2 4 12 4 14 0"/><path d="M14 15h2M24 15h2"/></svg>`,
  truck:`<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10h20v17H3z"/><path d="M23 16h8l6 6v5H23"/><circle cx="10" cy="30" r="3.5"/><circle cx="30" cy="30" r="3.5"/><path d="M9 15l2 2 4-4"/></svg>`,
  ret:`<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 16h20a7 7 0 0 1 0 14H14"/><path d="M14 10l-6 6 6 6"/></svg>`,
  info:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>`,
  snow:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v20M4 7l16 10M20 7L4 17"/></svg>`,
  check:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l5 5L20 6"/></svg>`
};

/* ---------- SEO ---------- */
function seo(title, desc){
  document.title = title;
  let m = $('meta[name="description"]');
  if (!m) { m = document.createElement("meta"); m.name = "description"; document.head.appendChild(m); }
  m.content = desc || SITE_DESC;
}

/* ---------- HOME ---------- */
const HERO = {
  a:{ h:`Proteină care chiar <em>are gust.</em>`, s:"Batoane, cookies, iaurturi și shake-uri cu 15-30 g de proteine pe porție. Fără gust de carton.", b:"Descoperă gustările" },
  b:{ h:`Sătul până la <em>masa următoare.</em>`, s:"Gustări bogate în proteine pentru zilele în care nu ai timp să gătești.", b:"Alege-ți gustarea" },
  c:{ h:`<em>20 g</em> de proteine. Zero compromisuri la gust.`, s:"Peste 75 de produse proteice, testate de noi înainte să ajungă la tine.", b:"Vezi produsele" }
};
function heroVariant(force){
  if (force) { store.set("hero", force); return force; }
  let v = store.get("hero", null);
  if (!v || !HERO[v]) { v = "abc"[Math.floor(Math.random() * 3)]; store.set("hero", v); }
  return v;
}
const BEST = ["baton-cacao-alune","cookie-chocolate-chip","whey-ciocolata","shake-ciocolata","baton-arahide-crocante","skyr-natural","chips-smantana-ceapa","apa-lamaie-lime"];

function viewHome(force, scrollTo){
  seo("Gramo | Gustări proteice care chiar au gust", SITE_DESC);
  const v = heroVariant(force), H = HERO[v];
  const tasteIds = ["baton-cacao-alune","cookie-chocolate-chip","chips-paprika","shake-vanilie","baton-vegan-cacao-migdale","pufuleti","apa-piersica","napolitana-alune","mini-cookies-cacao","baton-caramel-sarat"];
  app.innerHTML = `
  <section class="hero wrap" data-variant="${v}">
    <div class="hero-grid">
      <div>
        <p class="eyebrow">Gustări proteice · Fiecare gram contează</p>
        <h1 style="margin-top:16px">${H.h}</h1>
        <p class="sub">${H.s}</p>
        <div class="ctas"><a class="btn btn-primary" href="#c-batoane">${H.b} →</a><a class="btn btn-ghost" href="#p-pachet-degustare">Fă testul de gust</a></div>
      </div>
      <div class="scale" aria-label="Cântar care arată 20 g de proteine">
        <div class="readout"><small>proteine / porție</small><span class="v num" id="readout">0.0 g</span></div>
        <div>
          <div class="packs">${pack(byId["iaurt-capsuni"])}${pack(byId["shake-ciocolata"])}${pack(byId["baton-cacao-alune"])}</div>
          <div class="plate"></div>
        </div>
        <div class="tag"><span>TARA 0.0 g</span><span>75+ produse cântărite</span></div>
      </div>
    </div>
  </section>

  <section class="wrap"><div class="benefits">
    <div class="benefit">${IC.scale}<div><h3>Proteine scrise mare</h3><p>Vezi gramele pe fiecare produs, din prima.</p></div></div>
    <div class="benefit">${IC.taste}<div><h3>Gust testat</h3><p>Ce nu ne place nouă, nu vindem.</p></div></div>
    <div class="benefit">${IC.truck}<div><h3>Livrare în 24-48h</h3><p>Lactatele vin la rece.</p></div></div>
    <div class="benefit">${IC.ret}<div><h3>Fără bătăi de cap</h3><p>Retur simplu la produsele nedesfăcute.</p></div></div>
  </div></section>

  <section class="section wrap">
    <div class="sec-head"><h2>Ce poftă ai azi?</h2></div>
    <div class="cats">${CATS.map(c => { const first = P.find(p => p.c === c.id); const n = P.filter(p => p.c === c.id).length;
      return `<a class="cat" href="#c-${c.id}"><span class="count num">${n} produse</span><div class="art" style="${tint(flav(first))}">${art(first)}</div><h3>${c.name}</h3><p>${c.tile}</p></a>`; }).join("")}</div>
  </section>

  <section class="section wrap" id="bestsellers" style="padding-top:0">
    <div class="sec-head"><div><h2>Preferatele comunității</h2><p>Produsele pe care clienții le comandă iar și iar.</p></div><a class="btn btn-ghost btn-sm" href="#c-batoane">Toate produsele →</a></div>
    <div class="grid">${BEST.map(id => card(byId[id])).join("")}</div>
  </section>

  <section class="wrap"><div class="tasting">
    <div class="txt"><p class="eyebrow" style="color:inherit;opacity:.7">Pachet de degustare · 10 produse</p><h2>Nu știi de unde să începi?</h2>
      <p>Pachetul de degustare are 10 produse din toate categoriile. Afli ce-ți place fără să cumperi cutii întregi.</p>
      <div><a class="btn btn-butter" href="#p-pachet-degustare">Vreau pachetul de degustare</a></div></div>
    <div class="art"><div class="boxgrid">${tasteIds.map(id => pack(byId[id])).join("")}</div></div>
  </div></section>

  <section class="section wrap"><div class="learn">
    <div class="copy"><p class="eyebrow">Cum alegi</p><h2>Câtă proteină îți trebuie, de fapt?</h2>
      <p>Pentru un adult, recomandarea generală este de aproximativ 0,8 g de proteine pe kilogram corp pe zi. Dacă faci sport des, nevoia poate fi mai mare. O gustare Gramo îți aduce între 10 și 30 g, adică o parte bună din necesarul zilei.</p></div>
    ${calcHTML()}
  </div></section>

  <section class="wrap" style="padding-bottom:72px"><div class="sec-head"><h2>Ce spun cei care au gustat</h2></div>
    <div class="launch"><div class="stars" aria-hidden="true">★★★★★</div>
      <div><h3>Suntem noi.</h3><p>Fii printre primii care ne lasă o recenzie și primești 20 de lei la următoarea comandă.</p></div>
      <a class="btn btn-ghost" href="#c-batoane">Alege primul produs</a></div>
  </section>

  <section class="wrap">${newsHTML()}</section>`;
  bindCalc(); bindNews();
  animateReadout();
  if (scrollTo) setTimeout(() => $("#" + scrollTo)?.scrollIntoView({ behavior: "smooth" }), 30);
}
function animateReadout(){
  const el = $("#readout"); if (!el) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { el.textContent = "20.0 g"; return; }
  const t0 = performance.now(), D = 1400;
  (function f(t){ const k = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - k, 3);
    el.textContent = (20 * e).toFixed(1) + " g"; if (k < 1) requestAnimationFrame(f); })(t0);
}

function calcHTML(){
  return `<div class="calc" id="calc">
    <label for="kg">Greutatea ta</label>
    <div class="row"><input type="range" id="kg" min="40" max="140" value="70" step="1" aria-describedby="calcOut"><span class="kg num" id="kgv">70 kg</span></div>
    <div class="out" id="calcOut"><span class="big num" id="need">56</span><span>g de proteine pe zi, recomandarea generală pentru adulți (0,8 g/kg)</span></div>
    <div class="bars" id="bars" aria-hidden="true"></div>
    <p class="fine" id="calcNote"></p>
    <p class="fine">Estimare orientativă. Dacă faci sport intens sau ai nevoi speciale, discută cu un medic sau un nutriționist.</p>
  </div>`;
}
function bindCalc(){
  const r = $("#kg"); if (!r) return;
  const up = () => { const kg = +r.value, need = Math.round(kg * .8);
    $("#kgv").textContent = kg + " kg"; $("#need").textContent = need;
    const snacks = Math.max(1, Math.round(need / 20));
    $("#bars").innerHTML = Array.from({ length: Math.ceil(need / 10) }, (_, i) => `<i class="${i < 2 ? "on" : ""}"></i>`).join("");
    $("#calcNote").textContent = `Un baton de 20 g acoperă cam ${Math.round(20 / need * 100)}% din necesar. Restul vine din mesele zilei.`; };
  r.addEventListener("input", up); up();
}

function newsHTML(){
  return `<div class="news" id="news">
    <div><h2>-15% la prima comandă</h2><p>Abonează-te și primești codul pe email, plus rețete proteice și oferte înaintea tuturor.</p></div>
    <div id="newsBox"><form id="newsForm" novalidate>
      <label for="nEmail" class="sr">Adresa ta de email</label>
      <div class="field"><input id="nEmail" type="email" placeholder="Adresa ta de email" autocomplete="email"><button class="btn btn-butter" type="submit">Vreau reducerea</button></div>
      <p class="err" id="nErr" hidden></p>
      <p class="fine">Te poți dezabona oricând.</p>
    </form></div></div>`;
}
function bindNews(){
  const f = $("#newsForm"); if (!f) return;
  f.addEventListener("submit", e => { e.preventDefault();
    const v = $("#nEmail").value, err = $("#nErr");
    if (!v.trim()) { err.textContent = "Câmpul acesta e obligatoriu."; err.hidden = false; return; }
    if (!validEmail(v)) { err.textContent = "Verifică adresa de email, pare că lipsește ceva."; err.hidden = false; return; }
    $("#newsBox").innerHTML = `<div class="ok">Bine ai venit în Gramo! Codul tău e <code>${COUPON}</code>, valabil 7 zile.<br><small style="font-weight:500">Magazin demo: nu s-a trimis niciun email. Folosește codul în coș.</small></div>`;
  });
}

/* ---------- CATEGORY ---------- */
const FILT = {
  "Vegan": p => has(p, "Vegan"), "Fără zahăr adăugat": p => has(p, "Fără zahăr adăugat"),
  "Crocant": p => has(p, "Crocant"), "Moale": p => !has(p, "Crocant"), "Ediție limitată": p => has(p, "Ediție limitată"),
  "Iaurturi": p => p.sub === "iaurt", "Brânzeturi": p => p.sub === "branza", "Deserturi": p => p.sub === "desert",
  "Dulci": p => p.sub === "dulce", "Sărate": p => has(p, "Sărat"),
  "Whey concentrat": p => p.sub === "whey", "Izolat": p => p.sub === "izolat", "Cazeină": p => p.sub === "cazeina", "Mix-uri pentru gătit": p => p.sub === "mix",
  "Shake-uri": p => p.sub === "shake", "Apă proteică": p => p.sub === "apa", "Lactate de băut": p => p.sub === "lactat", "Cu cafeină": p => has(p, "Cu cafeină")
};
function viewCat(id){
  const c = catById[id]; if (!c) return view404();
  seo(c.mt, c.md);
  const items = P.filter(p => p.c === id);
  const maxP = Math.max(...items.map(p => p.pp || 0));
  const active = new Set(); let sort = "rec";
  app.innerHTML = `<div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="#acasa">Acasă</a><span>/</span><span>${c.name}</span></nav>
    <div class="cat-hero"><div><h1>${c.name}</h1><p>${c.intro}</p></div>
      <div class="stat"><span class="eyebrow">până la</span><b class="num">${maxP} g</b><span class="fine">proteine / porție</span></div></div>
    ${c.note ? `<div class="notice" style="margin-top:18px">${IC.snow}<span>${c.note}</span></div>` : ""}
    ${id === "pudre" ? `<div class="notice warn" style="margin-top:18px">${IC.info}<span>Supliment alimentar. Nu depășiți doza zilnică recomandată. Suplimentele alimentare nu înlocuiesc o dietă variată și echilibrată și un stil de viață sănătos. A nu se lăsa la îndemâna copiilor.</span></div>` : ""}
    <div class="toolbar" role="group" aria-label="Filtre">
      ${c.filters.map(f => `<button class="chip" aria-pressed="false" data-f="${esc(f)}">${f}</button>`).join("")}
      <span class="spacer"></span>
      <label class="sr" for="sort">Sortează</label>
      <select id="sort"><option value="rec">Recomandate</option><option value="pa">Preț crescător</option><option value="pd">Preț descrescător</option><option value="pr">Cele mai multe proteine</option></select>
    </div>
    <p class="fine" id="resCount" style="margin-bottom:12px"></p>
    <div class="grid" id="catGrid"></div></div>`;
  const draw = () => {
    let list = items.filter(p => [...active].every(f => FILT[f](p)));
    if (sort === "pa") list.sort((a, b) => a.price - b.price);
    if (sort === "pd") list.sort((a, b) => b.price - a.price);
    if (sort === "pr") list.sort((a, b) => (b.pp || 0) - (a.pp || 0));
    $("#resCount").textContent = `${list.length} ${list.length === 1 ? "produs" : "produse"}`;
    $("#catGrid").innerHTML = list.length ? list.map(card).join("") : `<div class="empty" style="grid-column:1/-1">Niciun produs nu se potrivește cu toate filtrele. Scoate un filtru și încearcă din nou.</div>`;
  };
  $$(".chip").forEach(b => b.onclick = () => { const f = b.dataset.f; active.has(f) ? active.delete(f) : active.add(f); b.setAttribute("aria-pressed", active.has(f)); draw(); });
  $("#sort").onchange = e => { sort = e.target.value; draw(); };
  draw();
}
function viewPacks(){
  seo("Pachete | Gramo", "Pachete de degustare și pachete economice Gramo.");
  const items = P.filter(p => p.pack);
  app.innerHTML = `<div class="wrap"><nav class="crumbs"><a href="#acasa">Acasă</a><span>/</span><span>Pachete</span></nav>
    <div class="cat-hero"><div><h1>Pachete</h1><p>Mai multe arome într-o singură cutie. Bune ca să descoperi ce-ți place sau ca să economisești.</p></div></div>
    <div class="grid" style="margin-top:24px">${items.map(card).join("")}</div></div>`;
}

/* ---------- PRODUCT ---------- */
const ALG = ["lapte","zer","cazeină","soia","arahide","arahidă","alune de pădure","alune","migdale","caju","fistic","nuci","miez de nucă","grâu","ovăz","gluten","ouă","ou","susan","muștar","țelină","smântână"];
function boldAllergens(t){
  const re = new RegExp(`(^|[\\s(,;:])(${ALG.sort((a,b) => b.length - a.length).join("|")})(?=[\\s),.;:%]|$)`, "gi");
  return esc(t).replace(re, (m, pre, w) => `${pre}<b>${w}</b>`);
}
function portionQty(p){ return parseFloat(String(p.por || p.size).replace(",", ".")) || 0; }
function nutritionTable(p){
  if (!p.n) return `<p>Valorile nutriționale sunt afișate pe pagina fiecărui produs inclus în pachet.</p>`;
  const u = p.ml ? "100 ml" : "100 g", q = portionQty(p), pu = p.por || p.size;
  const [k, pr, cb, su, fa, sa, fi, salt] = p.n, per = x => q ? dec(Math.round(x * q / 10) / 10) : "-";
  const kj = Math.round(k * 4.184);
  const rows = [
    ["Valoare energetică", `${kj} kJ / ${k} kcal`, q ? `${Math.round(kj*q/100)} kJ / ${Math.round(k*q/100)} kcal` : "-"],
    ["Grăsimi", dec(fa) + " g", per(fa) + " g"], ["din care acizi grași saturați", dec(sa) + " g", per(sa) + " g", 1],
    ["Glucide", dec(cb) + " g", per(cb) + " g"], ["din care zaharuri", dec(su) + " g", per(su) + " g", 1],
    ["Fibre", dec(fi) + " g", per(fi) + " g"], ["Proteine", dec(pr) + " g", (p.pp ?? per(pr)) + " g", 0, 1], ["Sare", dec(salt) + " g", per(salt) + " g"]
  ];
  return `<div class="nlabel"><table><caption>Declarație nutrițională</caption>
    <thead><tr><th scope="col"></th><th scope="col">per ${u}</th><th scope="col">per porție (${esc(pu)})</th></tr></thead>
    <tbody>${rows.map(r => `<tr class="${r[3] ? "indent" : ""}${r[4] ? " prot" : ""}"><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</tbody></table></div>
    <p class="fine">Valorile nutriționale sunt orientative. Pentru informații exacte, consultați eticheta produsului.</p>`;
}
function crossSell(p){
  const pool = P.filter(x => x.c !== p.c && x.c !== "pachete" && x.stock !== 0);
  const out = [], h = hash(p.id);
  for (let i = 0; out.length < 4 && i < 40; i++) { const x = pool[(h + i * 13) % pool.length]; if (!out.includes(x)) out.push(x); }
  return out;
}
function viewProduct(id){
  const p = byId[id]; if (!p) return view404();
  const c = catById[p.c];
  seo(`${p.name} | Gramo`, `${p.card} ${p.size}, ${fmt(p.price)}. Livrare în 24-48h.`);
  const col = flav(p), q = portionQty(p);
  const claim = p.n && (p.n[1] * 4 / p.n[0]) >= .12;
  const showTags = (p.tags || []).filter(t => t !== "Bestseller");
  const crumbs = c ? `<a href="#c-${c.id}">${c.name}</a>` : `<a href="#pachete">Pachete</a>`;
  let subOn = 0, freq = 2, qty = 1;
  app.innerHTML = `<div class="wrap">
    <nav class="crumbs"><a href="#acasa">Acasă</a><span>/</span>${crumbs}<span>/</span><span>${esc(p.name)}</span></nav>
    <div class="pdp">
      <div class="gallery" style="${tint(col)}">${art(p)}
        ${p.pp ? `<span class="gbadge"><b>${p.pp} g</b>proteine / porție</span>` : ""}</div>
      <div class="info">
        <div class="tagrow">${has(p, "Bestseller") ? `<span class="flag best">Bestseller</span>` : ""}${isCold(p) ? `<span class="flag cold">❄ Livrare la rece</span>` : ""}${showTags.map(t => `<span class="tag">${esc(t)}</span>`).join("")}</div>
        <h1>${esc(p.name)}</h1>
        <p class="lead">${esc(p.card)}</p>
        ${p.n ? `<div class="macro">
          <div class="hl"><b>${p.pp} g</b><span>proteine / porție</span></div>
          <div><b>${q ? Math.round(p.n[0] * q / 100) : "-"}</b><span>kcal / porție</span></div>
          <div><b>${dec(p.n[3])} g</b><span>zaharuri / ${p.ml ? "100 ml" : "100 g"}</span></div>
          <div><b>${dec(p.n[6])} g</b><span>fibre / ${p.ml ? "100 ml" : "100 g"}</span></div></div>` : ""}
        <div class="buybox">
          <div class="pr num" id="pdpPrice">${fmt(p.price)}</div>
          <p class="fine">${esc(p.size)}${p.por && p.por !== p.size ? ` · porție ${esc(p.por)}` : ""}</p>
          ${p.stock === 0 ? `
            <div class="notice warn">${IC.info}<span><b>Momentan epuizat.</b> Anunță-mă când revine</span></div>
            <form class="notify" id="notifyForm" novalidate><label class="sr" for="notifyEmail">Email</label><input class="input" id="notifyEmail" type="email" placeholder="Adresa ta de email"><button class="btn btn-primary" type="submit">Anunță-mă</button></form>
            <p class="err fine" id="notifyMsg" hidden></p>` : `
            ${p.stock ? `<p class="stock-low">Au mai rămas doar ${p.stock} bucăți</p>` : ""}
            ${p.mixed ? "" : `<div class="opt" role="radiogroup" aria-label="Tip cumpărare">
              <label><input type="radio" name="buy" value="0" checked><span><b>Cumpărare unică</b><small>${fmt(p.price)}</small></span></label>
              <label><input type="radio" name="buy" value="1"><span><b>Abonează-te și economisești 10%</b><small>Livrare la 2 sau 4 săptămâni, anulezi oricând.</small>
                <span class="freq"><button type="button" class="chip" data-fq="2" aria-pressed="true">La 2 săptămâni</button><button type="button" class="chip" data-fq="4" aria-pressed="false">La 4 săptămâni</button></span></span></label></div>`}
            <div class="qtyrow"><div class="qty"><button type="button" id="qm" aria-label="Scade cantitatea">−</button><span id="qv">1</span><button type="button" id="qp" aria-label="Crește cantitatea">+</button></div>
              <button class="btn btn-primary" id="addBtn">Adaugă în coș</button></div>
            <button class="btn btn-ghost btn-block" id="buyNow">Cumpără acum</button>
            <p class="ship-line">${IC.check}Comanzi până la ${CUTOFF} și pleacă azi</p>`}
          ${isCold(p) ? `<div class="notice">${IC.snow}<span>Produs refrigerat. Îl livrăm în cutie izotermă cu elemente de răcire. Se păstrează la 2-6°C și nu se poate returna.</span></div>` : ""}
          ${p.note ? `<div class="legal-note">${esc(p.note)}</div>` : ""}
        </div>
        <div class="tabs">
          <div class="tablist" role="tablist">
            <button role="tab" aria-selected="true" data-t="0">Descriere</button><button role="tab" aria-selected="false" data-t="1">Valori nutriționale</button>
            <button role="tab" aria-selected="false" data-t="2">Ingrediente & alergeni</button><button role="tab" aria-selected="false" data-t="3">Recenzii</button></div>
          <div class="tabpanel" role="tabpanel" data-p="0"><p>${esc(p.desc)}</p>
            ${p.use ? `<h4>Mod de utilizare</h4><p>${esc(p.use)}</p>` : ""}
            ${p.store ? `<h4>Păstrare</h4><p>${esc(p.store)}</p>` : ""}
            ${claim ? `<p class="fine">Proteinele contribuie la creșterea și menținerea masei musculare.</p>` : ""}
            ${isSupp(p) ? `<div class="legal-note">Supliment alimentar. Nu depășiți doza zilnică recomandată. Suplimentele alimentare nu înlocuiesc o dietă variată și echilibrată și un stil de viață sănătos. A nu se lăsa la îndemâna copiilor.</div>` : ""}</div>
          <div class="tabpanel" role="tabpanel" data-p="1" hidden>${nutritionTable(p)}</div>
          <div class="tabpanel" role="tabpanel" data-p="2" hidden><h4>Ingrediente</h4><p>${boldAllergens(p.ingr)}</p>
            <h4>Alergeni</h4><p class="allergens">${boldAllergens(p.alg)}</p>
            <p class="fine">Dacă ai o alergie severă, verifică și eticheta de pe ambalaj.</p></div>
          <div class="tabpanel" role="tabpanel" data-p="3" hidden><p><b>Încă nu are recenzii.</b> Fii printre primii care ne lasă o recenzie și primești 20 de lei la următoarea comandă.</p></div>
        </div>
      </div>
    </div>
    <section class="section" style="padding-top:24px"><div class="sec-head"><h2 style="font-size:36px">Merge perfect cu</h2></div>
      <div class="grid">${crossSell(p).map(card).join("")}</div></section></div>`;

  $$(".tablist button").forEach(b => b.onclick = () => {
    $$(".tablist button").forEach(x => x.setAttribute("aria-selected", x === b));
    $$(".tabpanel").forEach(x => x.hidden = x.dataset.p !== b.dataset.t); });
  const nf = $("#notifyForm");
  if (nf) nf.addEventListener("submit", e => { e.preventDefault(); const v = $("#notifyEmail").value, m = $("#notifyMsg"); m.hidden = false;
    if (!validEmail(v)) { m.style.color = "var(--berry)"; m.textContent = "Verifică adresa de email, pare că lipsește ceva."; return; }
    m.style.color = "var(--mint)"; m.textContent = "Te-am notat. (Magazin demo: nu se trimit emailuri încă.)"; });
  if (p.stock === 0) return;
  const price = () => { $("#pdpPrice").innerHTML = subOn ? `${fmt(p.price * .9)}<s>${fmt(p.price)}</s>` : fmt(p.price); };
  $$('input[name="buy"]').forEach(r => r.onchange = () => { subOn = +r.value; price(); });
  $$("[data-fq]").forEach(b => b.onclick = e => { e.preventDefault(); freq = +b.dataset.fq; $$("[data-fq]").forEach(x => x.setAttribute("aria-pressed", x === b)); $('input[name="buy"][value="1"]').checked = true; subOn = 1; price(); });
  $("#qm").onclick = () => { qty = Math.max(1, qty - 1); $("#qv").textContent = qty; };
  $("#qp").onclick = () => { qty = Math.min(99, qty + 1); $("#qv").textContent = qty; };
  $("#addBtn").onclick = () => addToCart(p.id, qty, subOn ? freq : 0);
  $("#buyNow").onclick = () => { addToCart(p.id, qty, subOn ? freq : 0, true); location.hash = "cos"; };
}

/* ---------- CART DRAWER ---------- */
const drawer = $("#drawer"), scrim = $("#scrim");
function openCart(){ renderDrawer(); drawer.classList.add("open"); scrim.classList.add("open"); drawer.setAttribute("aria-hidden", "false"); setTimeout(() => $("#closeCart")?.focus(), 50); }
function closeCart(){ drawer.classList.remove("open"); scrim.classList.remove("open"); drawer.setAttribute("aria-hidden", "true"); }
$("#cartBtn").onclick = openCart; scrim.onclick = closeCart;
document.addEventListener("keydown", e => { if (e.key === "Escape") closeCart(); });

function progressHTML(t){
  if (!cart.length) return "";
  const left = FREE - t.after, pct = Math.min(100, t.after / FREE * 100);
  return `<div class="progress ${left <= 0 ? "done" : ""}"><span>${left <= 0 ? "Super, ai livrare gratuită!" : `Mai adaugă produse de <b class="num">${fmt(left)}</b> și livrarea e gratuită`}</span>
    <div class="track"><i style="width:${pct}%"></i></div></div>`;
}
function totalsHTML(t){
  return `<div class="totals"><div><span>Subtotal</span><span class="num">${fmt(t.sub)}</span></div>
    ${t.disc ? `<div style="color:var(--mint)"><span>Reducere ${COUPON} (-15%)</span><span class="num">-${fmt(t.disc)}</span></div>` : ""}
    <div><span>Livrare</span><span class="num">${t.ship ? fmt(t.ship) : "Gratuită"}</span></div>
    <div class="grand"><span>Total</span><span>${fmt(t.total)}</span></div></div>`;
}
function couponHTML(){
  return `<details class="coupon" ${coupon ? "open" : ""}><summary>Ai un cod de reducere?</summary>
    <form class="cf" data-coupon novalidate><label class="sr" for="cc">Cod reducere</label><input class="input" id="cc" value="${esc(coupon)}" placeholder="ex. ${COUPON}" autocomplete="off"><button class="btn btn-ghost btn-sm" type="submit">Aplică</button></form>
    <p class="fine" data-cmsg ${coupon ? "" : "hidden"} style="margin-top:6px;color:var(--mint)">${coupon ? `Codul ${COUPON} a fost aplicat.` : ""}</p></details>`;
}
function bindCoupon(root, after){
  $$("[data-coupon]", root).forEach(f => f.addEventListener("submit", e => { e.preventDefault();
    const v = $("input", f).value.trim().toUpperCase(), m = $("[data-cmsg]", f.parentElement);
    m.hidden = false;
    if (v === COUPON) { coupon = COUPON; saveCart(); after(); }
    else { coupon = ""; saveCart(); m.style.color = "var(--berry)"; m.textContent = "Codul nu e valid sau a expirat"; }
  }));
}
function lineHTML(l, i){
  const p = byId[l.id];
  return `<div class="line"><a class="th" href="#p-${p.id}" style="${tint(flav(p))}">${art(p)}</a>
    <div><h4>${esc(p.name)}</h4><small>${esc(p.size)}${l.s ? ` · Abonament la ${l.s} săpt. (-10%)` : ""}</small>
      <div class="qty" style="margin-top:6px"><button data-dq="${i}" data-d="-1" aria-label="Scade">−</button><span>${l.q}</span><button data-dq="${i}" data-d="1" aria-label="Crește">+</button></div></div>
    <div class="r"><span class="price" style="font-size:15px">${fmt(unit(l) * l.q)}</span><button class="linkbtn" data-rm="${i}">Șterge</button></div></div>`;
}
function bindLines(root, after){
  $$("[data-dq]", root).forEach(b => b.onclick = () => { const l = cart[+b.dataset.dq]; l.q += +b.dataset.d; if (l.q < 1) cart.splice(+b.dataset.dq, 1); saveCart(); after(); });
  $$("[data-rm]", root).forEach(b => b.onclick = () => { cart.splice(+b.dataset.rm, 1); saveCart(); after(); });
}
function renderDrawer(){
  const t = totals();
  drawer.innerHTML = `<header><h2>Coșul tău</h2><button class="icon-btn" id="closeCart" aria-label="Închide coșul"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></header>
  ${cart.length ? `<div class="items">${progressHTML(t).replace('class="progress', 'style="margin-top:12px" class="progress')}${cart.map(lineHTML).join("")}
      ${t.cold ? `<div class="notice" style="margin-top:14px">${IC.snow}<span>Comanda conține produse refrigerate. Le livrăm în cutie izotermă.</span></div>` : ""}</div>
    <footer>${couponHTML()}${totalsHTML(t)}<a class="btn btn-primary btn-block" href="#cos">Finalizează comanda</a></footer>`
  : `<div class="items"><div class="cart-empty">${pack({ name: "Coș gol", pp: 0, shape: "bag", c: "x" })}
      <p style="font-size:18px;font-weight:600">Coșul tău e gol. Hai să-l umplem cu proteine.</p>
      <a class="btn btn-primary" href="#bestsellers">Vezi bestseller-urile</a></div></div>`}`;
  $("#closeCart").onclick = closeCart;
  bindLines(drawer, renderDrawer); bindCoupon(drawer, renderDrawer);
}

/* ---------- CHECKOUT ---------- */
function viewCheckout(){
  seo("Finalizează comanda | Gramo");
  closeCart();
  if (!cart.length) {
    app.innerHTML = `<div class="wrap confirm"><h1>Coșul tău e gol.</h1><p style="font-size:18px">Hai să-l umplem cu proteine.</p><a class="btn btn-primary" href="#bestsellers">Vezi bestseller-urile</a></div>`; return;
  }
  const t = totals();
  const f = (id, lab, type = "text", ac = "", opt) => `<label id="w-${id}">${lab}${opt ? ` <span class="fine">(opțional)</span>` : ""}<input class="input" id="${id}" type="${type}" autocomplete="${ac}" ${opt ? "" : "data-req"}><span class="err" hidden></span></label>`;
  app.innerHTML = `<div class="wrap"><nav class="crumbs"><a href="#acasa">Acasă</a><span>/</span><span>Finalizează comanda</span></nav>
  <div class="checkout">
    <form id="coForm" novalidate class="form">
      <h1>Finalizează comanda</h1>
      <p><span class="demo-pill">MAGAZIN DEMO</span> <span class="fine">Comenzile nu sunt procesate și nu se face nicio plată.</span></p>
      <div class="co-box form"><h2>Date de contact</h2>
        <div class="two">${f("fn","Nume","text","family-name")}${f("ln","Prenume","text","given-name")}</div>
        <div class="two">${f("em","Email","email","email")}${f("ph","Telefon","tel","tel")}</div></div>
      <div class="co-box form"><h2>Adresa de livrare</h2>
        ${f("ad","Stradă, număr, bloc, apartament","text","street-address")}
        <div class="two">${f("ci","Localitate","text","address-level2")}${f("co","Județ","text","address-level1")}</div>
        ${f("zp","Cod poștal","text","postal-code", 1)}</div>
      <div class="co-box form"><h2>Plată</h2>
        <div class="opt pay">
          <label><input type="radio" name="pay" value="cod" checked><span><b>Plata la livrare</b><small>Plătești curierului, cash sau card.</small></span></label>
          <label><input type="radio" name="pay" value="card"><span><b>Card online</b><small>Vei fi redirecționat către procesatorul de plăți securizat.</small></span></label></div></div>
      <p class="err" id="payErr" hidden></p>
      <button class="btn btn-primary btn-block" type="submit" style="padding:18px">Plasează comanda · ${fmt(t.total)}</button>
    </form>
    <aside class="summary"><div class="co-box" id="coSum"></div></aside>
  </div></div>`;
  const drawSum = () => { const t = totals();
    if (!cart.length) { viewCheckout(); return; }
    $("#coSum").innerHTML = `<h2>Sumar comandă</h2>${progressHTML(t)}${cart.map(lineHTML).join("")}
      ${t.cold ? `<div class="notice" style="margin-block:12px">${IC.snow}<span>Comanda conține produse refrigerate. Le livrăm în cutie izotermă.</span></div>` : ""}
      <div style="margin-block:14px">${couponHTML()}</div>${totalsHTML(t)}
      <p class="ship-line" style="margin-top:12px">${IC.check}Comanzi până la ${CUTOFF} și pleacă azi</p>`;
    bindLines($("#coSum"), () => { drawSum(); $('#coForm button[type="submit"]').textContent = `Plasează comanda · ${fmt(totals().total)}`; });
    bindCoupon($("#coSum"), () => { drawSum(); $('#coForm button[type="submit"]').textContent = `Plasează comanda · ${fmt(totals().total)}`; });
  };
  drawSum();
  $("#coForm").addEventListener("submit", e => { e.preventDefault();
    let ok = true, first;
    $$("[data-req]").forEach(i => { const w = i.parentElement, er = $(".err", w); let msg = "";
      if (!i.value.trim()) msg = "Câmpul acesta e obligatoriu.";
      else if (i.type === "email" && !validEmail(i.value)) msg = "Verifică adresa de email, pare că lipsește ceva.";
      w.classList.toggle("bad", !!msg); er.hidden = !msg; er.textContent = msg; if (msg) { ok = false; first = first || i; } });
    if (!ok) { first.focus(); return; }
    const order = 1000 + Math.floor(Math.random() * 9000);
    store.set("lastOrder", order);
    cart = []; coupon = ""; saveCart(); renderDrawer();
    viewConfirm(order);
  });
}
function viewConfirm(order){
  seo("Comandă primită | Gramo");
  app.innerHTML = `<div class="wrap confirm">
    <span style="width:72px;height:72px;border-radius:50%;background:var(--mint);color:#fff;display:grid;place-items:center">${IC.check.replace("<svg", '<svg width="36" height="36"')}</span>
    <h1>Mulțumim!</h1><p class="order">Comanda #${order}</p>
    <p style="font-size:18px;max-width:46ch">Comanda ta #${order} a fost primită. Îți trimitem pe email detaliile și numărul de urmărire.</p>
    <p class="fine">Magazin demo: nicio comandă nu a fost procesată și nu s-a trimis niciun email.</p>
    <a class="btn btn-primary" href="#acasa">Înapoi la magazin</a></div>`;
  window.scrollTo(0, 0);
}

/* ---------- STATIC PAGES ---------- */
const ph = s => `<span class="ph">${s}</span>`;
function staticPage(title, metaT, inner){ seo(metaT); app.innerHTML = `<div class="wrap"><div class="page"><h1>${title}</h1>${inner}</div></div>`; }

function viewAbout(){
  staticPage("Am obosit de gustări proteice cu gust de carton.", "Despre noi | Gramo", `<div class="prose">
    <p>Așa a început Gramo. Căutam ceva de mâncat între ședințe și sală, ceva care să ne țină sătui și să aibă gust bun. Găseam fie gustări bune și pline de zahăr, fie produse „fit” pe care le mâncam cu forța.</p>
    <p>Așa că am început să gustăm. Sute de batoane, iaurturi, pudre și cookies. Am păstrat doar ce ne-a plăcut cu adevărat și am pus cifrele mari pe fiecare produs, ca să știi exact ce primești.</p>
    <p>Astăzi avem peste 75 de produse în 5 categorii. Regula a rămas aceeași: gust întâi, cifre clare, fără compromisuri.</p>
    <h2>Valorile noastre</h2>
    <div class="values"><div><b>Gust întâi.</b><p>Fiecare produs trece testul echipei înainte să intre în magazin.</p></div>
      <div><b>Transparență.</b><p>Proteinele, zahărul și caloriile sunt la vedere, nu ascunse în josul paginii.</p></div>
      <div><b>Simplitate.</b><p>Fără diete complicate. Doar gustări mai bune pentru zilele tale.</p></div></div>
    <div style="margin-top:10px"><a class="btn btn-primary" href="#c-batoane">Vezi produsele</a></div></div>`);
}
const FAQ = [
  ["Pentru cine sunt produsele Gramo?","Pentru adulții care vor gustări mai sățioase și bogate în proteine. Nu trebuie să mergi la sală ca să le mănânci."],
  ["Câtă proteină am nevoie pe zi?","Recomandarea generală pentru adulți este de aproximativ 0,8 g pe kilogram corp pe zi. Dacă faci sport intens sau ai nevoi speciale, discută cu un medic sau un nutriționist."],
  ["Produsele înlocuiesc o masă?","Nu. Sunt gustări și suplimente alimentare care completează o alimentație variată și echilibrată."],
  ["Au zahăr adăugat?","Multe produse nu au zahăr adăugat. Vezi eticheta „Fără zahăr adăugat” pe pagina fiecărui produs și tabelul nutrițional complet."],
  ["Am alergii. Cum verific?","Pe fiecare pagină de produs găsești lista de ingrediente și alergenii scriși îngroșat. Dacă ai o alergie severă, verifică și eticheta de pe ambalaj."],
  ["Aveți produse vegane?","Da. Caută eticheta „Vegan” sau filtrează după ea în fiecare categorie."],
  ["Cum ajung lactatele la mine?","Le livrăm în ambalaj izoterm cu elemente de răcire, în maximum 48 de ore."],
  ["Cât costă livrarea?","19,99 lei, gratuit la comenzi peste 199 lei."],
  ["Pot returna produsele?","Da, produsele nedesfăcute și neperisabile, în 14 zile. Lactatele și produsele refrigerate nu pot fi returnate, pentru că se alterează rapid. Detalii pe pagina Livrare și retur."]
];
function viewFaq(){
  staticPage("Întrebări frecvente", "Întrebări frecvente | Gramo", `<div class="faq" style="margin-top:24px">${FAQ.map(([q, a], i) => `<details ${i === 0 ? "open" : ""}><summary>${q}</summary><p>${a}</p></details>`).join("")}</div>
    <p style="margin-top:28px">Nu ai găsit răspunsul? <a href="#contact">Scrie-ne</a>.</p>`);
}
function viewShipping(){
  staticPage("Livrare și retur", "Livrare și retur | Gramo", `<div class="prose">
    <h2>Livrare</h2><ul>
      <li>Livrăm prin ${ph("[curier]")} în toată țara, în 24-48 de ore lucrătoare.</li>
      <li>Cost livrare: 19,99 lei. Gratuit peste 199 lei.</li>
      <li>Comenzile plasate până la ora 14:00 pleacă în aceeași zi.</li>
      <li>Lactatele și produsele refrigerate vin în cutie izotermă cu elemente de răcire.</li>
      <li>Primești numărul de urmărire pe email imediat ce coletul pleacă.</li></ul>
    <h2>Retur</h2><ul>
      <li>Ai 14 zile de la primire să returnezi produsele nedesfăcute, cu sigiliul intact.</li>
      <li>Produsele refrigerate și cele cu termen scurt de valabilitate nu se pot returna (conform OUG 34/2014).</li>
      <li>Dacă un produs a ajuns deteriorat sau greșit, scrie-ne în 48 de ore la ${ph("[contact@gramo.ro]")} cu o poză și rezolvăm pe loc.</li>
      <li>Banii îți intră înapoi în maximum 14 zile de la primirea returului.</li></ul></div>`);
}
function viewContact(){
  staticPage("Scrie-ne. Răspundem repede.", "Contact | Gramo", `<div class="contact-grid">
    <dl><div><dt>Email</dt><dd>${ph("contact@gramo.ro")}</dd></div><div><dt>Telefon</dt><dd>${ph("07xx xxx xxx")}<br><span class="fine">luni-vineri, 9:00-17:00</span></dd></div>
      <div><dt>Adresă</dt><dd>${ph("[adresa firmei]")}</dd></div><div><dt>Date firmă</dt><dd>${ph("[denumire SRL, CUI, nr. Registrul Comerțului]")}</dd></div></dl>
    <form class="form co-box" id="ctForm" novalidate>
      <label>Nume<input class="input" id="ctName" data-req autocomplete="name"><span class="err" hidden></span></label>
      <label>Email<input class="input" id="ctEmail" type="email" data-req autocomplete="email"><span class="err" hidden></span></label>
      <label>Număr comandă <span class="fine">(opțional)</span><input class="input" id="ctOrder"></label>
      <label>Mesaj<textarea class="input" id="ctMsg" data-req></textarea><span class="err" hidden></span></label>
      <button class="btn btn-primary" type="submit">Trimite mesajul</button><p class="fine" id="ctOk" hidden></p></form></div>`);
  $("#ctForm").addEventListener("submit", e => { e.preventDefault(); let ok = true;
    $$("#ctForm [data-req]").forEach(i => { const er = $(".err", i.parentElement); let m = "";
      if (!i.value.trim()) m = "Câmpul acesta e obligatoriu."; else if (i.type === "email" && !validEmail(i.value)) m = "Verifică adresa de email, pare că lipsește ceva.";
      i.parentElement.classList.toggle("bad", !!m); er.hidden = !m; er.textContent = m; if (m) ok = false; });
    if (ok) { const o = $("#ctOk"); o.hidden = false; o.textContent = "Mesajul e gata. Magazin demo: formularul nu trimite încă mesaje, așa că folosește adresa de email de alături."; }
  });
}
function view404(){
  seo("Pagina nu există | Gramo");
  app.innerHTML = `<div class="wrap p404"><span class="n">404</span><p>Ups, pagina asta a dispărut mai repede decât un baton după sală.</p><a class="btn btn-primary" href="#acasa">Înapoi la magazin</a></div>`;
}

/* ---------- ROUTER ---------- */
function route(){
  const h = decodeURIComponent(location.hash.slice(1)) || "acasa";
  closeCart(); $("#nav").classList.remove("open");
  $$("#nav a").forEach(a => a.toggleAttribute("aria-current", false));
  const navHit = $$("#nav a").find(a => a.dataset.r === h); if (navHit) navHit.setAttribute("aria-current", "page");
  let scroll = true;
  if (h === "acasa") viewHome();
  else if (/^hero-[abc]$/.test(h)) viewHome(h.slice(-1));
  else if (h === "bestsellers") { viewHome(null, "bestsellers"); scroll = false; }
  else if (h.startsWith("c-")) viewCat(h.slice(2));
  else if (h.startsWith("p-")) viewProduct(h.slice(2));
  else if (h === "pachete") viewPacks();
  else if (h === "cos") viewCheckout();
  else if (h === "despre") viewAbout();
  else if (h === "intrebari") viewFaq();
  else if (h === "livrare") viewShipping();
  else if (h === "contact") viewContact();
  else view404();
  if (scroll) window.scrollTo(0, 0);
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-add]"); if (b) { e.preventDefault(); addToCart(b.dataset.add); }
});
window.addEventListener("hashchange", route);
renderCount(); renderDrawer(); route();
})();
