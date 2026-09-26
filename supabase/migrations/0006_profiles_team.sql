-- =====================================================================
-- Profile für alle Konten + Team-Verwaltung für Admins
--
-- Jedes Konto (heute nur Admins, später auch Kunden) bekommt automatisch
-- ein Profil. Admin-Rechte stehen weiterhin nur in public.admins – ein
-- Kundenkonto ist also einfach ein Profil ohne Eintrag in admins.
-- =====================================================================

-- ---------- Profile -----------------------------------------------------
create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

create policy "Eigenes Profil lesen" on public.profiles
  for select to authenticated using (user_id = (select auth.uid()) or (select private.is_admin()));

create policy "Eigenes Profil anlegen" on public.profiles
  for insert to authenticated with check (user_id = (select auth.uid()));

create policy "Eigenes Profil ändern" on public.profiles
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Neues Konto → Profil anlegen (Name kommt aus der Einladung, falls angegeben)
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();

-- Bestehende Konten nachtragen
insert into public.profiles (user_id)
select id from auth.users
on conflict (user_id) do nothing;

-- ---------- Team (Admins) ----------------------------------------------
-- Admins dürfen andere Admins entfernen, aber nicht sich selbst
-- (so bleibt immer mindestens ein Admin übrig).
create policy "Admins entfernen andere Admins" on public.admins
  for delete to authenticated
  using ((select private.is_admin()) and user_id <> (select auth.uid()));

-- Liste aller Admins inkl. E-Mail (auth.users ist sonst nicht lesbar)
create or replace function public.admin_team()
returns table (
  user_id uuid,
  email text,
  display_name text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  invited_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select a.user_id, u.email::text, p.display_name, a.created_at, u.last_sign_in_at, u.invited_at
  from public.admins a
  join auth.users u on u.id = a.user_id
  left join public.profiles p on p.user_id = a.user_id
  where (select private.is_admin())
  order by a.created_at;
$$;

revoke execute on function public.admin_team() from public, anon;
grant execute on function public.admin_team() to authenticated;

-- Nur für den Server (Einladen): bestehendes Konto per E-Mail finden,
-- um z. B. einen späteren Kunden zum Admin zu machen.
create or replace function public.user_id_by_email(p_email text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from auth.users where lower(email) = lower(trim(p_email)) limit 1;
$$;

revoke execute on function public.user_id_by_email(text) from public, anon, authenticated;
grant execute on function public.user_id_by_email(text) to service_role;
