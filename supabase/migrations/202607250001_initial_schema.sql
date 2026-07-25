-- OmniX Social: estrutura inicial, RLS e armazenamento privado.
-- Execute pelo SQL Editor do Supabase conforme o guia do projeto.

create extension if not exists pgcrypto;

create type public.social_platform as enum ('Instagram', 'TikTok', 'YouTube');
create type public.post_status as enum ('draft', 'scheduled', 'processing', 'published', 'partial_failure', 'failed', 'cancelled');
create type public.destination_status as enum ('pending', 'processing', 'published', 'failed', 'cancelled');

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  timezone text not null default 'America/Sao_Paulo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform public.social_platform not null,
  platform_account_id text not null,
  display_name text not null,
  scopes text[] not null default '{}',
  status text not null default 'active' check (status in ('active', 'expired', 'revoked', 'error')),
  token_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, platform, platform_account_id)
);

-- Sem políticas para o cliente: somente backend/service role poderá acessar.
create table public.social_credentials (
  social_account_id uuid primary key references public.social_accounts(id) on delete cascade,
  encrypted_access_token text not null,
  encrypted_refresh_token text,
  encryption_key_version integer not null default 1,
  updated_at timestamptz not null default now()
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null unique,
  original_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 52428800),
  duration_seconds numeric,
  width integer,
  height integer,
  status text not null default 'ready' check (status in ('uploading', 'ready', 'failed', 'deleted')),
  created_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  media_asset_id uuid references public.media_assets(id) on delete set null,
  title text not null check (char_length(title) between 1 and 200),
  caption text not null default '' check (char_length(caption) <= 5000),
  scheduled_at_utc timestamptz not null,
  timezone text not null default 'America/Sao_Paulo',
  status public.post_status not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.post_destinations (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  social_account_id uuid references public.social_accounts(id) on delete restrict,
  platform public.social_platform not null,
  platform_options jsonb not null default '{}',
  status public.destination_status not null default 'pending',
  platform_post_id text,
  published_at timestamptz,
  last_error_code text,
  last_error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (post_id, platform)
);

create table public.publication_attempts (
  id uuid primary key default gen_random_uuid(),
  post_destination_id uuid not null references public.post_destinations(id) on delete cascade,
  attempt_number integer not null check (attempt_number > 0),
  idempotency_key uuid not null unique default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  outcome text check (outcome in ('succeeded', 'retryable_failure', 'permanent_failure')),
  error_category text,
  unique (post_destination_id, attempt_number)
);

create index posts_due_idx on public.posts (scheduled_at_utc)
  where status = 'scheduled';
create index destinations_pending_idx on public.post_destinations (status, post_id)
  where status = 'pending';

alter table public.profiles enable row level security;
alter table public.social_accounts enable row level security;
alter table public.social_credentials enable row level security;
alter table public.media_assets enable row level security;
alter table public.posts enable row level security;
alter table public.post_destinations enable row level security;
alter table public.publication_attempts enable row level security;

create policy "profiles_owner_all" on public.profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "social_accounts_owner_select" on public.social_accounts
  for select using (auth.uid() = user_id);
create policy "media_owner_all" on public.media_assets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "posts_owner_all" on public.posts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "destinations_owner_all" on public.post_destinations
  for all
  using (exists (select 1 from public.posts where posts.id = post_id and posts.user_id = auth.uid()))
  with check (exists (select 1 from public.posts where posts.id = post_id and posts.user_id = auth.uid()));
create policy "attempts_owner_select" on public.publication_attempts
  for select
  using (
    exists (
      select 1
      from public.post_destinations d
      join public.posts p on p.id = d.post_id
      where d.id = post_destination_id and p.user_id = auth.uid()
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-media',
  'post-media',
  false,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "media_files_owner_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'post-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "media_files_owner_select" on storage.objects
  for select to authenticated
  using (bucket_id = 'post-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "media_files_owner_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'post-media' and (storage.foldername(name))[1] = auth.uid()::text);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
