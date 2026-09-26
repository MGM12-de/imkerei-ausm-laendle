-- =====================================================================
-- Besucherstatistik ohne Cookies und ohne personenbezogene Daten:
-- gespeichert werden nur Seite, Herkunfts-Domain, Gerätetyp und Land.
-- Keine IP-Adresse, kein User-Agent, keine Kennung pro Besucher.
-- =====================================================================
create table public.page_views (
  id bigint generated always as identity primary key,
  path text not null check (char_length(path) between 1 and 300),
  referrer_host text check (char_length(referrer_host) <= 200),
  device text not null default 'desktop' check (device in ('mobile', 'tablet', 'desktop')),
  country text check (char_length(country) = 2),
  created_at timestamptz not null default now()
);

create index page_views_created_idx on public.page_views (created_at desc);

alter table public.page_views enable row level security;

-- Jeder darf einen Aufruf zählen, aber nicht rückdatieren
create policy "Jeder darf Aufruf zählen" on public.page_views
  for insert to anon, authenticated
  with check (created_at >= now() - interval '1 minute' and created_at <= now() + interval '1 minute');

create policy "Admins lesen Aufrufe" on public.page_views
  for select to authenticated using ((select private.is_admin()));

create policy "Admins löschen Aufrufe" on public.page_views
  for delete to authenticated using ((select private.is_admin()));

-- ---------- Auswertung für das Admin-Dashboard ---------------------------
-- security invoker: RLS greift, Nicht-Admins bekommen nur Nullen.
create or replace function public.page_view_stats(days int default 30)
returns json
language sql
stable
security invoker
set search_path = ''
as $$
  with b as (
    select
      d as days,
      (now() at time zone 'Europe/Berlin')::date - (d - 1) as first_day,
      (now() at time zone 'Europe/Berlin')::date as last_day,
      (((now() at time zone 'Europe/Berlin')::date - (d - 1))::timestamp at time zone 'Europe/Berlin') as since
    from (select least(greatest(coalesce(days, 30), 1), 366) as d) x
  ),
  v as (
    select p.path, p.referrer_host, p.device, p.country,
           (p.created_at at time zone 'Europe/Berlin')::date as day
    from public.page_views p, b
    where p.created_at >= b.since
  )
  select json_build_object(
    'days', (select days from b),
    'total', (select count(*) from v),
    'previous', (
      select count(*) from public.page_views p, b
      where p.created_at >= b.since - make_interval(days => b.days) and p.created_at < b.since
    ),
    'today', (select count(*) from v, b where v.day = b.last_day),
    'daily', (
      select json_agg(json_build_object('day', g::date, 'views', (select count(*) from v where v.day = g::date)) order by g)
      from b, generate_series(b.first_day, b.last_day, interval '1 day') g
    ),
    'pages', (
      select coalesce(json_agg(t), '[]'::json) from (
        select path as label, count(*) as views from v group by path order by views desc, path limit 10
      ) t
    ),
    'referrers', (
      select coalesce(json_agg(t), '[]'::json) from (
        select referrer_host as label, count(*) as views from v
        where referrer_host is not null group by referrer_host order by views desc, referrer_host limit 10
      ) t
    ),
    'devices', (
      select coalesce(json_agg(t), '[]'::json) from (
        select device as label, count(*) as views from v group by device order by views desc
      ) t
    ),
    'countries', (
      select coalesce(json_agg(t), '[]'::json) from (
        select country as label, count(*) as views from v
        where country is not null group by country order by views desc, country limit 10
      ) t
    )
  );
$$;

revoke execute on function public.page_view_stats(int) from public, anon;
grant execute on function public.page_view_stats(int) to authenticated;
