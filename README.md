# Imkerei ausm Ländle – Webseite

Nuxt 4 · Nuxt UI 4 · Supabase (Datenbank, Login, Bilder) · Hosting auf Cloudflare

## Was drin ist

**Öffentliche Seiten** (mobile first): Start, Honig & Produkte (+ Detailseiten), Über uns, Aktuelles (Blog), Termine, Galerie mit Vollbild-Ansicht, Kontaktformular, Impressum, Datenschutz.

**Verwaltung unter `/admin`** (Login mit E-Mail + Passwort):

| Bereich | Was der Imker dort machen kann |
|---|---|
| Übersicht | Schnellzugriff, Zahlen, neueste Nachrichten |
| Produkte | Anlegen/Bearbeiten, Preis, Foto, „verfügbar/ausverkauft“ per Schalter |
| Beiträge | Blogartikel mit Editor (fett, Listen, Links), Titelbild, Entwurf / geplant |
| Termine | Markttage etc., duplizieren als Vorlage |
| Galerie | Mehrere Fotos auf einmal hochladen (werden automatisch verkleinert), sortieren |
| Nachrichten | Anfragen aus dem Kontaktformular lesen & per Mail antworten |
| Einstellungen | Texte der Startseite, Über-uns, Kontaktdaten, Hinweis-Banner |

Ohne verbundene Datenbank läuft alles im **Demo-Modus** mit Beispielinhalten.

## Lokal starten

```bash
npm install
npm run dev          # http://localhost:3000  (Demo-Modus)
npm run lint         # ESLint (npm run lint:fix behebt Formatierung)
npm run typecheck    # TypeScript-Prüfung
```

Bei jedem Push auf `main` und jedem Pull Request prüft die GitHub Action `CI` (`.github/workflows/ci.yml`) Lint, Typecheck und den Cloudflare-Build.

## Supabase

Projekt `imkerei-ausm-laendle` (Frankfurt, eu-central-1) ist angelegt, Schema + Beispielinhalte sind eingespielt.
URL und Publishable Key stehen in `.env` (der Key ist öffentlich und darf ins Frontend).

### Admin-Konto anlegen

1. Supabase Dashboard → **Authentication → Users → Add user → Create new user** (E-Mail + Passwort, „Auto Confirm User“ anhaken).
2. **SQL Editor**:
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'imker@example.de';
   ```
3. **Authentication → Sign In / Providers**: „Allow new users to sign up“ ausschalten.
4. **Authentication → URL Configuration**: Site URL = echte Domain, Redirect URL `https://DEINE-DOMAIN/admin/passwort`.

## Supabase neu einrichten (falls nötig)

1. Projekt auf [supabase.com](https://supabase.com) anlegen (Region: Frankfurt `eu-central-1`).
2. **SQL Editor** → `supabase/migrations/0001_init.sql` und danach `0002_private_is_admin.sql` ausführen.
3. Optional: `supabase/seed.sql` ausführen (Beispielinhalte).
4. **Authentication → Users → Add user**: Konto für den Imker anlegen (E-Mail + Passwort, „Auto confirm“).
5. Diesen Benutzer als Admin freischalten (SQL Editor):
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'imker@example.de';
   ```
6. **Authentication → Sign In / Providers**: „Allow new users to sign up“ **deaktivieren**.
7. **Authentication → URL Configuration**: Site URL = Domain der Seite, Redirect URL `https://DEINE-DOMAIN/admin/passwort` hinzufügen (für „Passwort vergessen“).
8. `.env` anlegen (siehe `.env.example`):
   ```
   SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_KEY=sb_publishable_...
   ```

Sicherheit: Alle Schreibrechte laufen über Row Level Security – nur Benutzer in `public.admins` können Inhalte ändern, Besucher dürfen nur Veröffentlichtes lesen und Nachrichten senden.

## Deployment auf Cloudflare

**Variante A – Git (empfohlen):** Repo zu GitHub pushen → Cloudflare Dashboard → *Workers & Pages → Create → Import a repository*.
- Build command: `npm run build:cf`
- Deploy command: `npx wrangler deploy`
- Umgebungsvariablen (Settings → Variables): `NUXT_PUBLIC_SUPABASE_URL`, `NUXT_PUBLIC_SUPABASE_KEY` (und für den Build zusätzlich `SUPABASE_URL`, `SUPABASE_KEY`).

**Variante B – von der Kommandozeile:**
```bash
npx wrangler login
npm run deploy
```

Danach eigene Domain unter *Settings → Domains & Routes* verbinden.

## Vor dem Livegang

- [ ] Echte Texte, Fotos, Logo und Preise im Admin eintragen
- [ ] Impressum & Datenschutz rechtlich prüfen/vervollständigen (`app/pages/impressum.vue`, `datenschutz.vue`)
- [ ] `siteUrl` in `nuxt.config.ts` auf die echte Domain setzen
- [ ] Optional: E-Mail-Benachrichtigung bei neuen Kontaktanfragen (z. B. Supabase Database Webhook → Resend)

## Projektstruktur

```
app/
  components/        öffentliche Bausteine (Header, Footer, Karten …)
  components/admin/  Admin-Bausteine (Bild-Upload, Editor, Seitenrahmen)
  composables/       useSiteData (öffentlich), useAdmin (CRUD, Upload)
  pages/             öffentliche Seiten + pages/admin/*
  utils/demo.ts      Beispielinhalte (Demo-Modus & seed.sql)
server/api/contact.post.ts   Kontaktformular (Validierung + Honeypot)
shared/contact.ts            Zod-Schema (Client & Server)
supabase/migrations/         Datenbankschema + Rechte
```
