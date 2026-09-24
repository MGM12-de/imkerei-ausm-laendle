-- is_admin() nicht über die REST-API (rpc) erreichbar machen:
-- in ein nicht exponiertes Schema verschieben. Policies referenzieren die
-- Funktion per OID und funktionieren unverändert weiter.
create schema if not exists private;
grant usage on schema private to anon, authenticated;
alter function public.is_admin() set schema private;
