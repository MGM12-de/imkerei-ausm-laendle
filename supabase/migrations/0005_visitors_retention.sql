-- =====================================================================
-- Eindeutige Besucher (ohne Cookies) + automatisches Löschen nach 18 Monaten
--
-- Besucher-Kennung wie bei Plausible: Hash aus IP + Browser + einem
-- zufälligen Tages-Salt. Der Salt wird am Folgetag gelöscht, danach lässt
-- sich der Hash keiner Person mehr zuordnen. IP und Browser werden nie
-- gespeichert. Gleiche Person an zwei Tagen = zwei Besucher.
-- =====================================================================
alter table public.page_views
  add column if not exists visitor_hash text check (char_length(visitor_hash) = 16);

create table private.visitor_salts (
  day date primary key,
  salt text not null default gen_random_uuid()::text
);

alter table private.visitor_salts enable row level security;
revoke all on private.visitor_salts from public, anon, authenticated;

-- Zählen nur noch über diese Funktion (bildet den Hash in der Datenbank)
create or replace function public.track_page_view(
  p_path text,
  p_referrer_host text default null,
  p_device text default 'desktop',
  p_country text default null,
  p_visitor text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  today date := (now() at time zone 'Europe/Berlin')::date;
  s text;
begin
  delete from private.visitor_salts where day < today;
  insert into private.visitor_salts (day) values (today) on conflict (day) do nothing;
  select salt into s from private.visitor_salts where day = today;

  insert into public.page_views (path, referrer_host, device, country, visitor_hash)
  values (
    p_path,
    p_referrer_host,
    coalesce(p_device, 'desktop'),
    p_country,
    case when coalesce(p_visitor, '') <> ''
      then left(encode(sha256(convert_to(s || p_visitor, 'UTF8')), 'hex'), 16)
    end
  );
end;
$$;

revoke execute on function public.track_page_view(text, text, text, text, text) from public;
grant execute on function public.track_page_view(text, text, text, text, text) to anon, authenticated;

-- Direktes Einfügen ist nicht mehr nötig
drop policy "Jeder darf Aufruf zählen" on public.page_views;

-- ---------- Auswertung inkl. Besucher -------------------------------------
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
    select p.path, p.referrer_host, p.device, p.country, p.visitor_hash,
           (p.created_at at time zone 'Europe/Berlin')::date as day
    from public.page_views p, b
    where p.created_at >= b.since
  ),
  prev as (
    select p.visitor_hash from public.page_views p, b
    where p.created_at >= b.since - make_interval(days => b.days) and p.created_at < b.since
  )
  select json_build_object(
    'days', (select days from b),
    'total', (select count(*) from v),
    'visitors', (select count(distinct visitor_hash) from v),
    'previous', (select count(*) from prev),
    'visitors_previous', (select count(distinct visitor_hash) from prev),
    'today', (select count(*) from v, b where v.day = b.last_day),
    'visitors_today', (select count(distinct visitor_hash) from v, b where v.day = b.last_day),
    'daily', (
      select json_agg(json_build_object(
        'day', g::date,
        'views', (select count(*) from v where v.day = g::date),
        'visitors', (select count(distinct visitor_hash) from v where v.day = g::date)
      ) order by g)
      from b, generate_series(b.first_day, b.last_day, interval '1 day') g
    ),
    'pages', (
      select coalesce(json_agg(t), '[]'::json) from (
        select path as label, count(*) as views, count(distinct visitor_hash) as visitors
        from v group by path order by views desc, path limit 10
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

-- ---------- Aufbewahrung: nach 18 Monaten löschen -------------------------
create extension if not exists pg_cron with schema pg_catalog;

select cron.schedule(
  'page-views-aufraeumen',
  '17 3 * * *', -- täglich 03:17 UTC
  $$delete from public.page_views where created_at < now() - interval '18 months'$$
);
