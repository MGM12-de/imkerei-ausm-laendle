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
| Team | Weitere Admins per E-Mail einladen, Admin-Rechte entziehen |
| Mein Profil | Anzeigename, E-Mail-Adresse und Passwort ändern (unten links auf den Namen klicken) |

Anmelden geht per Passwort oder per **Login-Link** (Link per E-Mail, kein Passwort nötig).

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

### Weitere Admins einladen

Im Admin unter **Team → Admin einladen**. Die eingeladene Person bekommt eine E-Mail, legt über den Link ihr Passwort fest und ist sofort Admin. Dafür braucht der Server einmalig den geheimen Supabase-Schlüssel:

1. Migration `supabase/migrations/0006_profiles_team.sql` im **SQL Editor** ausführen.
2. Supabase Dashboard → **Project Settings → API Keys** → Secret key (`sb_secret_…`) kopieren.
3. Cloudflare: `npx wrangler secret put NUXT_SUPABASE_SECRET_KEY` (oder Dashboard → Worker → *Settings → Variables and Secrets* → Typ **Secret**). Lokal in `.env` als `NUXT_SUPABASE_SECRET_KEY=…`. **Niemals** im Frontend oder im Workflow eintragen.
4. **Authentication → URL Configuration → Redirect URLs**: `https://DEINE-DOMAIN/**` eintragen (für Einladung, Login-Link, Passwort vergessen und E-Mail-Änderung).

Konten und Admin-Rechte sind getrennt: Jedes Konto hat ein Profil (`public.profiles`), Admin ist nur, wer zusätzlich in `public.admins` steht. Spätere Kundenkonten sind einfach Konten ohne Admin-Eintrag.

### Erstes Admin-Konto anlegen

1. Supabase Dashboard → **Authentication → Users → Add user → Create new user** (E-Mail + Passwort, „Auto Confirm User“ anhaken).
2. **SQL Editor**:
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'imker@example.de';
   ```
3. **Authentication → Sign In / Providers**: „Allow new users to sign up“ ausschalten.
4. **Authentication → URL Configuration**: Site URL = echte Domain, Redirect URL `https://DEINE-DOMAIN/**`.

## Supabase neu einrichten (falls nötig)

1. Projekt auf [supabase.com](https://supabase.com) anlegen (Region: Frankfurt `eu-central-1`).
2. **SQL Editor** → `supabase/migrations/0001_init.sql`, danach `0002_private_is_admin.sql`, `0003_image_ai_flag.sql`, `0004_page_views.sql`, `0005_visitors_retention.sql` und `0006_profiles_team.sql` ausführen.
3. Optional: `supabase/seed.sql` ausführen (Beispielinhalte).
4. **Authentication → Users → Add user**: Konto für den Imker anlegen (E-Mail + Passwort, „Auto confirm“).
5. Diesen Benutzer als Admin freischalten (SQL Editor):
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'imker@example.de';
   ```
6. **Authentication → Sign In / Providers**: „Allow new users to sign up“ **deaktivieren**.
7. **Authentication → URL Configuration**: Site URL = Domain der Seite, Redirect URL `https://DEINE-DOMAIN/**` hinzufügen (für Einladungen, Login-Link und „Passwort vergessen“).
8. `.env` anlegen (siehe `.env.example`):
   ```
   SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_KEY=sb_publishable_...
   NUXT_SUPABASE_SECRET_KEY=sb_secret_...   # nur für „Admin einladen“
   ```

Sicherheit: Alle Schreibrechte laufen über Row Level Security – nur Benutzer in `public.admins` können Inhalte ändern, Besucher dürfen nur Veröffentlichtes lesen und Nachrichten senden.

## Deployment auf Cloudflare

**Automatisch per GitHub Action:** Jeder Push auf `main` wird nach erfolgreichem Lint, Typecheck und Build als Cloudflare Worker `imkerei-ausm-laendle` deployt (Job `Deploy (Cloudflare)` in `.github/workflows/ci.yml`). Supabase-URL und Publishable Key stehen direkt im Workflow – beide sind öffentlich, die Daten schützt Row Level Security.

Einmalig einrichten (GitHub → *Settings → Secrets and variables → Actions → New repository secret*):
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare Dashboard → *Workers & Pages* → Account ID (rechte Seitenleiste)
- `CLOUDFLARE_API_TOKEN`: Cloudflare Dashboard → *My Profile → API Tokens → Create Token* → Vorlage **„Edit Cloudflare Workers“**

**Manuell von der Kommandozeile:**
```bash
npx wrangler login
npm run deploy
```

Danach eigene Domain unter *Settings → Domains & Routes* verbinden und die Domain in Supabase unter *Authentication → URL Configuration* eintragen.

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
server/api/admin/invite.post.ts  Admin einladen (prüft Admin-Rechte, nutzt Secret Key)
shared/contact.ts            Zod-Schema (Client & Server)
supabase/migrations/         Datenbankschema + Rechte
```
