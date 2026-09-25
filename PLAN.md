# Plan Aplicatie Reduceri

Ultima actualizare: 2026-09-24

## Unde am ramas

Proiectul are un prototip web functional partial in radacina si un proiect Expo separat in `mobile-app/`.

- Prototipul web afiseaza produse mock si are cautare, filtre, categorii, oferta recomandata, favorite si taburi pentru explorare/monitorizare.
- `server.js` porneste un backend Express pe portul `3001`, cu `/api/health` si `/api/products`, dar datele sunt hardcodate.
- Pagina admin exista, dar este doar o pagina de status; nu exista inca autentificare sau CRUD real.
- `mobile-app/App.tsx` este inca ecranul implicit Expo si nu foloseste functionalitatile prototipului web.
- README-ul descrie SQLite, JWT si un admin complet, dar acestea nu sunt confirmate in codul actual si trebuie tratate ca obiective, nu ca functionalitati livrate.

## Urmatorul pas

**Testarea vizuala a MVP-ului Expo pe web si pe un device/emulator, apoi conectarea la API.**

Verificare facuta: `cd mobile-app` apoi `npx tsc --noEmit` a trecut fara erori.

## Obiectivul produsului

Aplicatie mobila Android/iOS pentru gasirea celei mai bune oferte reale din Romania, luand in calcul pretul total, transportul, reducerea, codurile promotionale, cashback-ul, disponibilitatea, reputatia magazinului, autenticitatea, istoricul pretului si variantele produsului.

## Etape

### 1. MVP mobil

- [x] Portare ecran principal in Expo/React Native.
- [x] Bara de cautare „Ce vrei sa cumperi?”.
- [x] Afisare rezultate, oferta recomandata si sumarul economiilor.
- [x] Filtre pentru tip produs si categorii; bugetul ramane de adaugat.
- [x] Favorite pastrate local in sesiunea curenta.
- [x] Buton „Vezi oferta” care deschide URL-ul magazinului.
- [x] Grafic liniar cu puncte datate pentru produsele favorite; fiecare verificare arata pretul si magazinul.
- [x] Stare pentru rezultat gol.
- [x] Căutare tolerantă la spații, cratime, diacritice și modele precum `TCL QD-MINILED 55P8L 139CM`.
- [ ] Stari pentru incarcare si eroare de retea.
- [ ] Verificare pe web si pe cel putin un emulator/device mobil.

### 2. Backend si date reale

- [ ] Stabilirea sursei de date si a magazinelor acceptate pentru Romania.
- [ ] Schema persistenta pentru produse, magazine, oferte si istoricul preturilor.
- [ ] Inlocuirea produselor hardcodate cu API si baza de date.
- [ ] Calcularea pretului total: produs + transport - reducere - cashback verificabil.
- [ ] Import periodic si marcarea ofertelor expirate.
- [ ] Validarea disponibilitatii si a variantelor: original, compatibil, marime, culoare, model, capacitate.

### 3. Cautare inteligenta

- [ ] Parsarea intentiei utilizatorului: brand, categorie, buget, marime, varianta si regiune.
- [ ] Clasificarea si ordonarea ofertelor dupa raportul calitate/pret, nu doar dupa pretul minim.
- [ ] Separarea clara intre date verificate si estimari.
- [ ] Adaugarea unui provider AI doar dupa definirea limitelor, costurilor si fallback-ului.

### 4. Cont, monitorizare si notificari

- [ ] Autentificare si autorizare pentru utilizatori.
- [ ] Salvarea cautarilor, favoritelor si alertelor de pret.
- [ ] Prag de pret si notificari pentru scadere, disponibilitate si cod promotional.
- [ ] Istoric vizibil al pretului pentru fiecare oferta.

### 5. Admin si publicare

- [ ] Login admin real, cu secrete din variabile de mediu.
- [ ] CRUD pentru produse, magazine si oferte.
- [ ] Jurnal pentru importuri, erori si modificari.
- [ ] Verificarea rutelor si a permisiunilor inainte de deploy.
- [ ] Configurarea deploy-ului si a monitorizarii in Render.

### 6. Calitate si lansare

- [ ] Teste pentru parsarea intentiei si calculul clasamentului.
- [ ] Teste API pentru health, cautare si autentificare.
- [ ] Teste de interfata pentru cautare, filtre, favorite si stari de eroare.
- [ ] Verificare responsive pe Android si iOS.
- [ ] Eliminarea secretelor si a datelor demo din build-ul de productie.
- [ ] Documentatie actualizata pentru instalare, configurare si deploy.

## Decizii de clarificat

- Ce magazine din Romania vor fi incluse la prima versiune?
- Datele vor fi obtinute prin API-uri oficiale, feed-uri de afiliere sau crawling permis?
- Ce provider AI si ce buget lunar sunt acceptate?
- Notificarile vor fi push, email sau ambele?
- Aplicatia va folosi SQLite la inceput sau o baza de date gestionata pentru productie?

## Jurnal de lucru

### 2026-09-24

- Am inventariat proiectul si am separat prototipul web de aplicatia Expo.
- Am confirmat ca backendul si datele sunt mock, iar aplicatia mobila este scaffold.
- Am portat primul MVP in `mobile-app/App.tsx`: cautare, categorii, filtre, oferta recomandata, rezultate si favorite.
- Am adaugat URL-uri pentru oferte si un grafic liniar cu puncte datate pentru favorite; istoricul este pregatit pentru date reale, dar valorile curente sunt mock.
- Am adaugat modelul demo TCL QD-MiniLED 55P8L 139 cm si cautare pe toate cuvintele normalizate ale query-ului.
- Am intarit cautarea cu potrivirea query-ului complet normalizat si resetarea filtrelor la o cautare noua, pentru a evita rezultate ascunse de filtre ramase active.
- Am reparat si prototipul web din radacina: TCL este in catalog, `139CM` se potriveste cu `139 cm`, iar intentia recunoaste televizoarele TCL/QD-MiniLED.
- Am reparat serverul web ca sa serveasca `app.js` si `styles.css` din radacina; anterior fallback-ul trimitea HTML in loc de JavaScript si pagina ramanea goala.
- Am verificat in browser query-ul `TCL QD-MINILED 55P8L, 139CM`: produsul apare, categoria este Televizor, marimea este 139 cm, iar bugetul este N/A.
- Am legat pretul si butonul „Vezi oferta” de URL-ul magazinului; verificat in browser pentru TCL: `2.399 RON` si link eMAG functional.
- Am reorganizat interfata web pentru mobil: tipografie mai lizibila, carduri aerisite, categorii grupate si comparatie cu trei magazine/linkuri pe rezultat.
- Tabul Favorite afiseaza acum produsele salvate cu preturile si magazinele disponibile; verificat la viewport 390px fara overflow orizontal.
- Preturile secundare Altex si Flanco sunt momentan estimari demo; trebuie inlocuite cu rezultate reale din API/feed-uri in etapa backend.
- Am eliminat sugestiile fixe de sub cautare; pagina porneste goala la fiecare acces/reload.
- Preferintele de marime se salveaza server-side in `data/search-preferences.json`, prin API-ul `/api/preferences`, pe brand. Nu se mai foloseste memoria browserului. O cautare Adidas cu `27.5 cm` va aplica marimea la cautarile urmatoare Adidas daca nu este specificata alta.
- Am verificat: serverul a salvat `adidas -> 27.5 cm`, browserul a aplicat preferinta dupa reload, iar `localStorage` este `null`.
- Am reparat ofertele TV care afisau stoc fara link: televizoarele au URL explicit, iar cardul afiseaza oferta principala plus linkuri de comparatie. Verificat pentru `LG OLED 55 inch`: pret, stoc si linkuri vizibile.
- Pentru TCL QD-MiniLED 55P8L am inlocuit linkul de cautare cu URL-ul exact eMAG (`/pd/D81CPY2BM/`); verificat in browser ca butonul „Vezi oferta” deschide produsul individual.
- Am adaugat tabul „Istoric” in navigarea de jos; afiseaza cronologia pretului, datele, magazinele si linkul ofertei actuale pentru produsele cautate sau favorite.
- Istoricul este acum legat strict de Favorite: fiecare card are „Șterge din favorite”, iar produsul dispare imediat din ambele liste. Verificat in browser.
- Butonul din Istoric se numeste acum „Șterge complet” si elimină produsul din Favorite, Monitorizate si alerta de pret asociată; preferința generală de mărime pe brand rămâne păstrată.
- Am eliminat favoritele hardcodate Adidas/iPhone si am mutat Favoritele in `data/search-preferences.json` prin `/api/favorites`; butonul „Salveaza” de pe oferta recomandata salveaza corect TCL, iar stergerea ramane dupa reload.
- Am adaugat alerte de pret persistente in `data/search-preferences.json`, cu prag configurabil „Anunta-ma sub ... lei” si endpointurile `/api/alerts`.
- Am reparat tabul Monitorizate: Adidas, Brother si iPhone nu mai apar automat; lista este persistenta prin `/api/monitored`, iar fiecare card are „Monitorizeaza”/„Monitorizat” pentru adaugare sau stergere individuala.
- Am sincronizat Favorite cu Monitorizate: salvarea unui produs la Favorite il adauga automat si la Monitorizate, iar stergerea din Favorite il elimina din ambele. TCL a fost reactivat si verificat in JSON ca `favorites: [9]`, `monitored: [9]`.
- Am reorganizat categoriile: Electrocasnice (Frigidere, Masini de spalat, Masini de spalat vase), Casa & Scule (Cartuse imprimante, Detergenti, Unelte), Fashion (Incaltaminte, Imbracaminte) si Electronice pentru Telefon/Televizor. Filtrarea pentru Frigidere si Cartuse imprimante a fost verificata in browser.
- Am inclus sursele cerute pentru cautari fashion si sneakers: Fashion Days, About You, Answear, Zalando, Peek & Cloppenburg, Buzz Sneakers, Sizeer, Footshop, Sport Vision si brandurile oficiale Nike, Adidas, Puma, New Balance, Under Armour, Timberland, Tommy Hilfiger si Calvin Klein. Sunt afisate ca linkuri de cautare; preturile apar doar dupa integrarea feed/API real.
- Am adaugat magazine favorite separat de produse: fiecare sursa verificata are stea de salvare, iar magazinele sunt persistente in `favoriteStores` din JSON si apar in tabul Favorite. `Nike.com` a fost testat si salvat cu succes; poate fi eliminat direct din acel tab.
- Telegram este pregatit prin `TELEGRAM_TOKEN` si `TELEGRAM_CHAT_ID` din `.env`; testat cu TCL la pragul de `2200 lei`, fara trimitere deoarece Telegram nu este configurat in mediul local.
- Tokenul Telegram trimis in chat trebuie revocat si regenerat in BotFather, apoi adaugat doar in `.env` local; nu il comitem si nu il afisam in proiect.
- Test Telegram: tokenul nou este valid (`getMe` OK), dar trimiterea raspunde `chat not found`; trebuie deschisa conversatia cu botul si trimis `/start`, apoi verificat `TELEGRAM_CHAT_ID`. Pragul TCL a fost restaurat la `2000 lei`.
- Retest Telegram reusit dupa restartul serverului: mesaj direct acceptat, iar endpointul aplicatiei a returnat `notified: true` pentru TCL la pragul temporar de `3000 lei`; pragul a fost restaurat la `2000 lei` si notificarea nu se repeta la acelasi pret.
- Am pregatit verificarea automata permanenta: endpoint securizat `POST /api/jobs/check-prices`, script `jobs/check-prices.js` si serviciu cron Render separat. Jobul ruleaza orar, dar executa efectiv la 08:00, 13:00 si 17:00 in `Europe/Bucharest`, chiar daca serviciul web nu primeste trafic.
- Pentru publicare trebuie configurate in Render `PRICE_CHECK_API_URL` si `CRON_SECRET`, iar sursele reale de pret trebuie conectate in checker; momentan endpointul raporteaza produsele monitorizate, dar nu preturi reale.
- `npx tsc --noEmit` trece fara erori in `mobile-app`.
- Urmatorul pas este testarea vizuala Expo si apoi conectarea la API.

### Sablon pentru urmatoarea sesiune

```text
Data:
Am finalizat:
Am ramas la:
Urmatorul pas:
Blocaje/decizii:
Verificare rulata:
```