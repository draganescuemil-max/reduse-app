# reduse-app

Mobile-first price comparison app with admin dashboard and real backend.

## Descriere

Aceasta este o aplicație mobilă de comparare a prețurilor și reducerilor, concepută pentru piața din România. Proiectul include:

- căutare și comparare produse
- profil utilizator și favorite
- coș de cumpărături
- autentificare cu JWT
- backend real cu SQLite
- admin dashboard pentru gestionarea produselor
- imagini locale servite din backend

## Structură

- `mobile-app/` – aplicația principală (Expo + React Native + backend Express)
- `mobile-app/server.js` – backend API
- `mobile-app/public/admin/index.html` – admin panel
- `mobile-app/images/` – imagini locale
- `mobile-app/data/` – baza de date SQLite

## Cum rulează local

În folderul `mobile-app`:

```bash
npm install
node server.js
```

Apoi aplicația backend este disponibilă la:

```text
http://localhost:3001
```

Pentru admin:

```text
http://localhost:3001/admin
```

## Admin login

Email:

```text
admin@reduse.ro
```

Parolă:

```text
admin123
```

## Observație

Proiectul a evoluat de la prototip static la o soluție cu backend real, autentificare JWT, administrare produselor și pregătire pentru deploy.
