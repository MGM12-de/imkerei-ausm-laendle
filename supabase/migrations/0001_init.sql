-- =====================================================================
-- Imkerei ausm Ländle – Datenbankschema
-- Öffentlich lesbar: nur veröffentlichte Inhalte
-- Schreiben: nur Benutzer, die in public.admins eingetragen sind
-- =====================================================================

-- ---------- Admins ----------------------------------------------------
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

grant execute on function public.is_admin() to anon, authenticated;

create policy "Admins sehen Admin-Liste" on public.admins
  for select to authenticated using ((select public.is_admin()));

-- ---------- Hilfsfunktion updated_at -------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- Seiteneinstellungen (genau 1 Zeile) --------------------------
create table public.site_settings (
  id int primary key default 1 check (id = 1),
  site_name text not null default 'Imkerei ausm Ländle',
  tagline text,
  hero_title text,
  hero_text text,
  hero_image_url text,
  about_title text,
  about_intro text,
  about_text text,            -- HTML aus dem Editor
  about_image_url text,
  owner_name text,
  street text,
  zip text,
  city text,
  phone text,
  email text,
  instagram_handle text,
  sales_info text,            -- z.B. Hofverkauf-Zeiten
  announcement text,          -- optionaler Hinweis-Banner oben
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id) values (1) on conflict (id) do nothing;

create trigger site_settings_updated before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ---------- Produkte ----------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category text not null default 'honig' check (category in ('honig', 'wachs', 'geschenk', 'sonstiges')),
  short_description text,
  description text,           -- HTML aus dem Editor
  taste text,
  consistency text,
  harvest text,
  size text,
  price numeric(8, 2),
  image_url text,
  available boolean not null default true,
  featured boolean not null default false,
  published boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_sort_idx on public.products (sort, name);
create trigger products_updated before update on public.products
  for each row execute function public.set_updated_at();

-- ---------- Beiträge / Aktuelles ---------------------------------------
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,               -- HTML aus dem Editor
  image_url text,
  published boolean not null default false,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_published_idx on public.posts (published, published_at desc);
create trigger posts_updated before update on public.posts
  for each row execute function public.set_updated_at();

-- ---------- Termine ----------------------------------------------------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date not null,
  time_from time,
  time_to time,
  location text,
  description text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_date_idx on public.events (date);
create trigger events_updated before update on public.events
  for each row execute function public.set_updated_at();

-- ---------- Galerie ----------------------------------------------------
create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  sort int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create index gallery_sort_idx on public.gallery_images (sort, created_at desc);

-- ---------- Kontaktanfragen --------------------------------------------
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) between 5 and 200),
  phone text check (char_length(phone) <= 60),
  subject text check (char_length(subject) <= 200),
  message text not null check (char_length(message) between 5 and 5000),
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index messages_created_idx on public.messages (created_at desc);

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.site_settings enable row level security;
alter table public.products enable row level security;
alter table public.posts enable row level security;
alter table public.events enable row level security;
alter table public.gallery_images enable row level security;
alter table public.messages enable row level security;

-- Einstellungen
create policy "Einstellungen öffentlich" on public.site_settings
  for select to anon, authenticated using (true);
create policy "Admins ändern Einstellungen" on public.site_settings
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- Produkte, Beiträge, Termine, Galerie: veröffentlichte Einträge öffentlich,
-- Admins sehen und bearbeiten alles.
do $$
declare t text;
begin
  foreach t in array array['products', 'posts', 'events', 'gallery_images'] loop
    execute format(
      'create policy "Öffentlich lesbar" on public.%I for select to anon, authenticated using (published or (select public.is_admin()))', t);
    execute format(
      'create policy "Admins anlegen" on public.%I for insert to authenticated with check ((select public.is_admin()))', t);
    execute format(
      'create policy "Admins ändern" on public.%I for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', t);
    execute format(
      'create policy "Admins löschen" on public.%I for delete to authenticated using ((select public.is_admin()))', t);
  end loop;
end $$;

-- Beiträge zusätzlich erst ab Veröffentlichungsdatum sichtbar
drop policy "Öffentlich lesbar" on public.posts;
create policy "Öffentlich lesbar" on public.posts
  for select to anon, authenticated
  using ((published and published_at <= now()) or (select public.is_admin()));

-- Nachrichten: jeder darf senden, nur Admins lesen/ändern/löschen
create policy "Jeder darf Nachricht senden" on public.messages
  for insert to anon, authenticated with check (read = false);
create policy "Admins lesen Nachrichten" on public.messages
  for select to authenticated using ((select public.is_admin()));
create policy "Admins ändern Nachrichten" on public.messages
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins löschen Nachrichten" on public.messages
  for delete to authenticated using ((select public.is_admin()));

-- =====================================================================
-- Storage: öffentlicher Bucket "media" für Bilder
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'])
on conflict (id) do nothing;

create policy "Admins laden Bilder hoch" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and (select public.is_admin()));
create policy "Admins ändern Bilder" on storage.objects
  for update to authenticated using (bucket_id = 'media' and (select public.is_admin()));
create policy "Admins löschen Bilder" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and (select public.is_admin()));
