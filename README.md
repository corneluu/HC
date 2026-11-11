# Corul „Harmonia Christi”, site public

Next.js cu export static pentru GitHub Pages, în română, engleză, italiană și germană. Paginile se generează din `src/data/seed.ts`, iar dacă Supabase este configurat, conținutul proaspăt se încarcă în browser.

## Rulare locală

```bash
npm install
npm run build
npx serve out -l 4173
# deschide http://localhost:4173/corul-harmonia-christi/ (cu serve: pune build-ul sub acel folder sau setează NEXT_PUBLIC_BASE_PATH=/)
```

Pentru lucru zilnic: `NEXT_PUBLIC_BASE_PATH=/ npm run dev`, apoi `http://localhost:3000/ro/`.

Verificări: `npm test`, `npm run typecheck`, `npm run lint`.

## Publicare: pașii, în ordine

### 1. Formularul de înscriere (Formspree)

1. Creează un cont pe [formspree.io](https://formspree.io) și un formular nou.
2. Alege adresa care primește înscrierile.
3. Copiază ID-ul formularului, partea de după `/f/` din adresa de trimitere.

Fără acest ID, pagina „Alătură-te” afișează numărul de telefon în locul trimiterii.

### 2. Proiectul Supabase

1. Creează un proiect pe [supabase.com](https://supabase.com).
2. Din **Project Settings → API** notează **Project URL** și cheia **anon public**. Cheia `service_role` nu se pune niciodată în site.
3. Din **Authentication → Providers → Email**, dezactivează înregistrarea publică (**Allow new users to sign up** oprit).

### 3. Baza de date

În **SQL Editor** rulează, în ordine, conținutul fișierelor:

1. `supabase/schema.sql` (tabele, reguli RLS, bucket-ul `images`)
2. `supabase/seed.sql` (evenimentele, consiliul, videoclipurile, galeria și setările actuale)

Ambele pot fi rulate din nou fără să strice ce s-a editat deja. După o schimbare în `src/data/seed.ts`, `npm run seed:sql` regenerează `seed.sql`.

### 4. Cei 8 utilizatori

În **Authentication → Users → Add user**, creează câte un cont (email și parolă, cu **Auto Confirm User** bifat) pentru fiecare membru al consiliului.

### 5. Lista de administratori

Doar cei din tabelul `admins` pot modifica ceva. În **SQL Editor**:

```sql
insert into public.admins (user_id, note)
select id, email from auth.users
on conflict do nothing;
```

Interogarea îi adaugă pe toți utilizatorii existenți. Pentru un utilizator adăugat ulterior, rulează-o din nou. Pentru a scoate pe cineva: `delete from public.admins where note = 'adresa@exemplu.ro';`.

### 6. Depozitul GitHub și variabilele

Creează depozitul, urcă proiectul, apoi în **Settings → Secrets and variables → Actions → Variables** adaugă:

| Variabilă | Valoare |
|---|---|
| `NEXT_PUBLIC_FORMSPREE_ID` | ID-ul de la pasul 1 |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | cheia anon public |
| `NEXT_PUBLIC_BASE_PATH` | opțional; implicit numele depozitului. Cu domeniu propriu: `/` |
| `NEXT_PUBLIC_SITE_URL` | adresa publică, fără `/` la final, de ex. `https://utilizator.github.io/corul-harmonia-christi` |

Valorile sunt publice prin natura lor: ajung în browser. Protecția vine din regulile RLS din baza de date.

### 7. GitHub Pages

În **Settings → Pages → Build and deployment**, alege **GitHub Actions**. Fiecare `push` pe `main` publică site-ul prin `.github/workflows/deploy.yml`. Panoul de administrare este la `/admin/`.

## Ce se întreține din panou

Evenimente (inclusiv starea „doar anunțat” sau „confirmat”), consiliul cu portrete, videoclipuri, albume și fotografii, IBAN-ul, data fondării, lista de turnee, biografia și fotografia dirijorului.

După fiecare concert, schimbă starea evenimentului în „Confirmat”, altfel nu intră în numărătoarea concertelor de pe prima pagină.

## Fotografii

`scripts/process-images.mjs` produce variantele AVIF și WebP din originale și elimină metadatele, inclusiv GPS. Lista fotografiilor alese este în script. Pozele încărcate din panou sunt redimensionate și curățate în browser.
