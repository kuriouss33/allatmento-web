# Állatmentő Portál - Next.js & React WebApp

Modern, teljes funkcióparitású Next.js (App Router, React 19, TypeScript, Tailwind CSS v4) frontend az Állatmentő és Diszpécser Portálhoz.

## 🚀 Indítás Fejlesztői Környezetben

```bash
cd allatmento-web
npm run dev
```

Az alkalmazás elérhető a [http://localhost:3000](http://localhost:3000) címen.

## 🏗️ Éles Build Készítése

```bash
cd allatmento-web
npm run build
npm run start
```

## 🔗 Kapcsolat a Meglévő Háttérrendszerekkel

- **Express/TypeScript Backend:** `https://allatmento-backend.onrender.com/api` (vagy a `NEXT_PUBLIC_BACKEND_URL` környezeti változóban felülbírálható)
- **Firebase Auth & Firestore Real-time Database:** `allatmento-app.firebaseapp.com`
- **Valós idejű eseményfigyelés:** Firestore `onSnapshot` a bejelentésekre és a chat üzenetekre
- **Fénykép tömörítés:** Kliensoldali HTML5 Canvas tömörítés feltöltés előtt

## 📁 Főbb Oldalak és Útvonalak

- `/` – Főoldal & Sürgősségi Irányítópult (élő statisztikák, gyorsgombok)
- `/terkep` – Diszpécser Műszerfal (2 oszlopos osztott felület, szűrők, Leaflet térkép, klaszterezés, akciók)
- `/bejelentes` – 3 lépéses Bejelentő Varázsló (Fajta ➔ Helyszín & GPS & Fotó ➔ Adatok & GDPR ➔ Sikeroldal megosztással)
- `/ugyek` – Saját Ügyeim (általam bejelentett és elvállalt esetek)
- `/szervezetek` – Menhelyek, állatorvosok, hatóságok és vadmentők országos jegyzéke közvetlen hívással
- `/kisokos` – Elsősegély útmutatók szakértői ajánlásokkal
- `/admin` – Rendszeradminisztrációs felület (jogosultságok kezelése, mentők jóváhagyása)
