-- Kennzeichnung KI-generierter Bilder: pro Bild ein Schalter,
-- auf der Webseite erscheint dann ein „KI-generiert“-Hinweis.
alter table public.site_settings
  add column if not exists hero_image_ai boolean not null default false,
  add column if not exists about_image_ai boolean not null default false;

alter table public.products add column if not exists image_ai boolean not null default false;
alter table public.posts add column if not exists image_ai boolean not null default false;
alter table public.gallery_images add column if not exists image_ai boolean not null default false;
