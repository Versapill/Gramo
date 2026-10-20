# Gramo, magazin online de gustări proteice

Site static, fără framework. Limba site-ului: română. Brandul se numește **Gramo** (nu „Gramaj”).

## Structură
- `src/data.js` conține toate cele 76 de produse: id, categorie, nume, gramaj, preț, valori nutriționale, descrieri, ingrediente și alergeni.
- `src/app.js` conține logica: router pe hash (`#c-batoane`, `#p-<id>`, `#cos`...), coș, checkout demo și ilustrațiile SVG ale ambalajelor (`pack()`).
- `src/shell.html` conține designul (CSS cu tokeni, temă light/dark) și scheletul paginii.
- `tools/build.py` asamblează `src/` în `index.html` (artifact Claude) și `site/index.html` (versiunea de urcat pe hosting).
- `produse-poze.csv` e checklist-ul de poze: numele fișierului așteptat pentru fiecare produs.
- `refs/` conține imaginile de referință ale ambalajelor (logo + grame) pentru toate cele 76 de produse, randate din `tools/render.html`.
- `site/img/` conține pozele produselor în stil de ambalaj comercial, randate vectorial din `tools/ambalaje/` (design ambalaj, ilustrații aromă, fundal alb). Se regenerează cu `node tools/ambalaje/randeaza.mjs [id ...]`. Nu sunt fotografii: pentru poze realiste cu Gemini, șterge `site/img/*.jpg` înainte de `gen.py` sau dă id-urile ca argumente.
- `tools/gen.py` generează poze cu Gemini (`gemini-2.5-flash-image`) pornind de la `refs/`. Are nevoie de `GEMINI_API_KEY` cu facturare activă.

## Sarcina curentă: poze pentru fiecare produs
1. Pune câte o poză pentru fiecare produs în `site/img/<id>.jpg`. Numele fișierelor sunt în coloana `fisier_poza` din `produse-poze.csv`.
   - Pătrat, 800×800 px, JPG calitate ~84, sub ~150 KB.
   - Fundal deschis, în nuanța culorii ambalajului; produsul centrat, ocupând ~70% din cadru.
2. **Pe ambalaj trebuie să apară logoul Gramo**: cuvântul „gram” urmat de un cadran de cântar rotund (cerc galben #FFD84A cu contur bleumarin #11153D și ac albastru #2B37E8). Sub logo stau gramele de proteine pe porție, mari (ex. „20g”), iar jos e o bandă galbenă. Logoul nu se deformează și nu se adaugă alte mărci sau texte. Referința exactă se vede pe pagina `#brand` a site-ului și în `refs/`.
   - Logourile ies des deformate la generarea AI. Verifică fiecare poză și refă-le pe cele greșite, sau aplică logoul corect peste poză.
3. Rulează `python3 tools/build.py`. Scriptul detectează automat pozele din `site/img/` și listează produsele care încă nu au poză. Produsele fără poză păstrează ilustrația SVG.
4. Deschide `site/index.html` în browser și verifică grila de categorii, pagina de produs și coșul.

## Reguli de conținut (obligatorii)
- Nu folosi promisiuni de slăbire, „arde grăsimi”, „detox”, „vindecă” sau efecte medicale.
- Nu inventa recenzii.
- Nu schimba textele produselor sau valorile nutriționale fără acordul proprietarului.
- Câmpurile marcate `[...]` pe site (curier, telefon, date firmă) se completează doar cu date reale de la proprietar.
- Cheile API nu se pun în cod și nu se trimit altora (`tools/.env` e local).
