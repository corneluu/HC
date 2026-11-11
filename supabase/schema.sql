-- Corul „Harmonia Christi”: schema. Run once in the Supabase SQL editor, then seed.sql.
-- Public read; writes only for authenticated users listed in public.admins, enforced here by RLS.

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  note text,
  created_at timestamptz not null default now()
);

-- security definer so the check can read admins regardless of the caller's own policies.
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.admins where user_id = (select auth.uid())) $$;

-- Multilingual text: {"ro": "...", "en": "...", "it": "...", "de": "..."}; ro is mandatory.
create or replace function public.is_ltext(v jsonb) returns boolean
language sql immutable set search_path = ''
as $$ select jsonb_typeof(v) = 'object' and v ? 'ro' and jsonb_typeof(v -> 'ro') = 'string' $$;

create table if not exists public.events (
  id text primary key default gen_random_uuid()::text,
  date date not null,
  end_date date,
  time text check (time is null or time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  kind text not null check (kind in ('concert', 'festival')),
  status text not null default 'announced' check (status in ('confirmed', 'announced')),
  title jsonb not null check (public.is_ltext(title)),
  place jsonb not null check (public.is_ltext(place)),
  note jsonb not null default '{"ro": ""}' check (public.is_ltext(note)),
  poster text check (poster is null or poster ~ '^https://'),
  position integer not null default 0,
  check (end_date is null or end_date >= date)
);

create table if not exists public.council_members (
  id text primary key default gen_random_uuid()::text,
  name text not null check (length(trim(name)) > 0),
  role jsonb not null default '{"ro": ""}' check (public.is_ltext(role)),
  age integer check (age is null or age between 1 and 120),
  description jsonb not null default '{"ro": ""}' check (public.is_ltext(description)),
  portrait text check (portrait is null or portrait ~ '^https://'),
  position integer not null default 0
);

create table if not exists public.videos (
  id text primary key default gen_random_uuid()::text,
  youtube_id text not null check (youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
  title jsonb not null check (public.is_ltext(title)),
  position integer not null default 0
);

create table if not exists public.gallery_albums (
  id text primary key default gen_random_uuid()::text,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title jsonb not null check (public.is_ltext(title)),
  description jsonb not null default '{"ro": ""}' check (public.is_ltext(description)),
  position integer not null default 0
);

create table if not exists public.gallery_photos (
  id text primary key default gen_random_uuid()::text,
  album_id text not null references public.gallery_albums (id) on delete cascade,
  -- https URL from storage, or the key of an image shipped with the site
  src text not null check (src ~ '^https://' or src ~ '^[a-z0-9/-]+$'),
  alt jsonb not null default '{"ro": ""}' check (public.is_ltext(alt)),
  width integer,
  height integer,
  position integer not null default 0
);
create index if not exists gallery_photos_album_idx on public.gallery_photos (album_id, position);

create table if not exists public.settings (
  key text primary key,
  value jsonb not null
);

-- Row Level Security
alter table public.admins enable row level security;

drop policy if exists "admins read own row" on public.admins;
create policy "admins read own row" on public.admins
  for select to authenticated using (user_id = (select auth.uid()));
-- No write policy on admins on purpose: membership is managed by the owner in the Supabase dashboard.

do $$
declare t text;
begin
  foreach t in array array['events', 'council_members', 'videos', 'gallery_albums', 'gallery_photos', 'settings'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
    execute format('drop policy if exists "admins insert" on public.%I', t);
    execute format('create policy "admins insert" on public.%I for insert to authenticated with check ((select public.is_admin()))', t);
    execute format('drop policy if exists "admins update" on public.%I', t);
    execute format('create policy "admins update" on public.%I for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', t);
    execute format('drop policy if exists "admins delete" on public.%I', t);
    execute format('create policy "admins delete" on public.%I for delete to authenticated using ((select public.is_admin()))', t);
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

grant select on public.admins to authenticated;
revoke insert, update, delete on public.admins from anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- Storage: public read, restricted write; the bucket itself limits type and size on the server.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('images', 'images', true, 5242880, array['image/webp', 'image/jpeg', 'image/png', 'image/avif'])
on conflict (id) do update
  set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "images public read" on storage.objects;
create policy "images public read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'images');

drop policy if exists "images admin insert" on storage.objects;
create policy "images admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'images' and (select public.is_admin()));

drop policy if exists "images admin update" on storage.objects;
create policy "images admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'images' and (select public.is_admin()))
  with check (bucket_id = 'images' and (select public.is_admin()));

drop policy if exists "images admin delete" on storage.objects;
create policy "images admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'images' and (select public.is_admin()));
