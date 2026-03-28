# NOO'VO Guest App — Setup Guide

## Stack
- **Frontend**: React 18 + Vite + PWA (vite-plugin-pwa)
- **Backend**: Convex (bază de date reactivă + cron jobs)
- **Notificări**: Twilio (WhatsApp primary + SMS fallback)
- **Hosting frontend**: Netlify
- **Hosting backend**: Convex Cloud (inclus în plan gratuit)

---

## 1. Prerechiziite

```bash
node --version   # >= 18
npm --version    # >= 9
```

---

## 2. Instalare dependențe

```bash
cd noovo-app
npm install
```

---

## 3. Configurare Convex

### 3a. Creare cont Convex (gratuit)
→ https://dashboard.convex.dev → Sign Up

### 3b. Inițializare proiect Convex
```bash
npx convex dev
```
- Autentifică-te cu contul Convex
- Alege "Create a new project" → numește-l `noovo-guest`
- Convex va genera automat folderul `convex/_generated/` și va afișa URL-ul deployment-ului

### 3c. Copiază `.env.example` → `.env.local`
```bash
cp .env.example .env.local
```
Editează `.env.local` și completează:
```
VITE_CONVEX_URL=https://YOUR_DEPLOYMENT.convex.cloud   # din output-ul npx convex dev
VITE_DASHBOARD_PIN=1234   # schimbă cu un PIN propriu!
```

---

## 4. Configurare Twilio

### 4a. Creare cont Twilio (gratuit cu credit trial)
→ https://www.twilio.com/try-twilio

### 4b. Obține credențiale
- Dashboard Twilio → Account SID + Auth Token
- Cumpără un număr de telefon (SMS) sau activează WhatsApp Sandbox

### 4c. Setare variabile în Convex Dashboard
Mergi la: https://dashboard.convex.dev → Project-ul tău → Settings → Environment Variables

Adaugă:
| Cheie | Valoare |
|-------|---------|
| `TWILIO_ACCOUNT_SID` | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `TWILIO_AUTH_TOKEN` | `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `TWILIO_PHONE` | `+40XXXXXXXXX` |
| `TWILIO_WA_FROM` | `whatsapp:+14155238886` |

> **Important**: NU pune credențialele Twilio în `.env.local` — ele trăiesc doar în Convex Dashboard (serverside).

---

## 5. Iconițe PWA (necesare pentru instalare pe tabletă)

Generează iconițele PNG din SVG:

**Opțiunea 1 — online (recomandat):**
1. Mergi la https://realfavicongenerator.net
2. Încarcă `public/noovo-icon.svg`
3. Descarcă și pune în `public/`:
   - `noovo-icon-192.png`
   - `noovo-icon-512.png`

**Opțiunea 2 — cu ImageMagick:**
```bash
convert public/noovo-icon.svg -resize 192x192 public/noovo-icon-192.png
convert public/noovo-icon.svg -resize 512x512 public/noovo-icon-512.png
```

---

## 6. Testare locală

### Terminal 1 — Convex backend (live sync)
```bash
npx convex dev
```

### Terminal 2 — Frontend Vite
```bash
npm run dev
```
→ Deschide http://localhost:5173

---

## 7. Deploy pe Netlify

### Metoda rapidă — Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify env:set VITE_CONVEX_URL https://YOUR_DEPLOYMENT.convex.cloud
netlify env:set VITE_DASHBOARD_PIN 1234
netlify deploy --prod
```

### Metoda GitHub (recomandat)
1. Fă push la GitHub: `git push`
2. Netlify Dashboard → "New site from Git" → selectează repo-ul
3. Build settings (auto-detectate din `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Netlify → Site settings → Environment variables → adaugă:
   - `VITE_CONVEX_URL`
   - `VITE_DASHBOARD_PIN`
5. Deploy

### Deploy Convex pentru producție
```bash
npx convex deploy
```
Aceasta deployment-ează schema, funcțiile și cron jobs-urile în producție.

---

## 8. Instalare PWA pe tabletă (iPad/Android)

### iPad (Safari)
1. Deschide URL-ul Netlify în Safari
2. Tap pe iconița Share (⬆)
3. "Add to Home Screen"
4. Aplica apare ca o aplicație nativă, full-screen

### Android (Chrome)
1. Deschide URL-ul în Chrome
2. Tap pe cele 3 puncte → "Add to Home Screen"
3. Sau Chrome va afișa automat un banner de instalare

---

## 9. Structura proiectului

```
noovo-app/
├── public/
│   ├── noovo-icon.svg        ← logo SVG
│   ├── noovo-icon-192.png    ← PWA icon (generezi tu)
│   └── noovo-icon-512.png    ← PWA icon (generezi tu)
├── src/
│   ├── main.jsx              ← entry point + ConvexProvider
│   ├── App.jsx               ← routing form/dashboard + online/offline
│   ├── index.css             ← stiluri globale
│   └── components/
│       ├── NoovoLogo.jsx     ← logo branding
│       ├── SignaturePad.jsx  ← canvas pentru semnătură
│       ├── CustomerForm.jsx  ← pagina client (română)
│       └── Dashboard.jsx     ← pagina staff (engleză) + export
├── convex/
│   ├── schema.ts             ← structura bazei de date
│   ├── customers.ts          ← queries + mutations
│   ├── notifications.ts      ← logică Twilio WhatsApp/SMS
│   └── crons.ts              ← schedule: verificare la 30 min
├── package.json
├── vite.config.js            ← Vite + PWA plugin config
├── index.html
├── netlify.toml              ← Netlify build + redirects + headers
└── .env.example              ← template variabile de mediu
```

---

## 10. Notificări — intervale configurate

| Interval | Mesaj |
|----------|-------|
| 36 ore   | Mulțumire + feedback |
| 72 ore   | Invitație de revenire |
| 7 zile   | Preparate speciale ale săptămânii |
| 30 zile  | Ofertă 10% reducere |

Mesajele se trimit via **WhatsApp** (dacă clientul are WA) sau **SMS** (fallback automat).
Cron job-ul verifică la fiecare **30 de minute** — precizie de ±30 min față de intervalele de mai sus.

---

## 11. PIN Dashboard

PIN-ul implicit este `1234`. **Schimbă-l** setând variabila `VITE_DASHBOARD_PIN` la un cod mai sigur.

> **Notă**: Pentru securitate sporită, poți înlocui PIN-ul cu Clerk sau Convex Auth — contactează-mă și îl adăugăm.

---

## Suport

- Convex Docs: https://docs.convex.dev
- Twilio Docs: https://www.twilio.com/docs
- Netlify Docs: https://docs.netlify.com
- vite-plugin-pwa: https://vite-pwa-org.netlify.app
