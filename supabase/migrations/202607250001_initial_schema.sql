-- OmniX Social: estrutura isolada para coexistir no projeto Supabase do NexLab.
-- Todos os objetos públicos usam prefixo omnix_; não altera tabelas do ERP.

create extension if not exists pgcrypto;

do $$ begin
  create type public.omnix_social_platform as enum ('Instagram', 'TikTok', 'YouTube');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.omnix_post_status as enum ('draft', 'scheduled', 'processing', 'published', 'partial_failure', 'failed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.omnix_destination_status as enum ('pending', 'processing', 'published', 'failed', 'cancelled');
exception when duplicate_object then null; end $$;

-- Membership explícita: não existe auto-cadastro e usuários NexLab não ganham
-- acesso ao OmniX apenas por compartilharem o mesmo Auth.
create table public.omnix_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  timezone text not null default 'America/Sao_Paulo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.omnix_social_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform public.omnix_social_platform not null,
  platform_account_id text not null,
  display_name text not null,
  scopes text[] not null default '{}',
  status text not null default 'active' check (status in ('active', 'expired', 'revoked', 'error')),
  token_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, platform, platform_account_id)
);

-- Sem policies: somente Edge Functions com role administrativa acessam tokens.
create table public.omnix_social_credentials (
  social_account_id uuid primary key references public.omnix_social_accounts(id) on delete cascade,
  encrypted_access_token text not null,
  encrypted_refresh_token text,
  encryption_key_version integer not null default 1,
  updated_at timestamptz not null default now()
);

create table public.omnix_media_assets (
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

create table public.omnix_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  media_asset_id uuid references public.omnix_media_assets(id) on delete set null,
  title text not null check (char_length(title) between 1 and 200),
  caption text not null default '' check (char_length(caption) <= 5000),
  scheduled_at_utc timestamptz not null,
  timezone text not null default 'America/Sao_Paulo',
  status public.omnix_post_status not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.omnix_post_destinations (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.omnix_posts(id) on delete cascade,
  social_account_id uuid references public.omnix_social_accounts(id) on delete restrict,
  platform public.omnix_social_platform not null,
  platform_options jsonb not null default '{}',
  status public.omnix_destination_status not null default 'pending',
  platform_post_id text,
  published_at timestamptz,
  last_error_code text,
  last_error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (post_id, platform)
);

create table public.omnix_publication_attempts (
  id uuid primary key default gen_random_uuid(),
  post_destination_id uuid not null references public.omnix_post_destinations(id) on delete cascade,
  attempt_number integer not null check (attempt_number > 0),
  idempotency_key uuid not null unique default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  outcome text check (outcome in ('succeeded', 'retryable_failure', 'permanent_failure')),
  error_category text,
  unique (post_destination_id, attempt_number)
);

create index omnix_posts_due_idx on public.omnix_posts (scheduled_at_utc) where status = 'scheduled';
create index omnix_destinations_pending_idx on public.omnix_post_destinations (status, post_id) where status = 'pending';

alter table public.omnix_profiles enable row level security;
alter table public.omnix_social_accounts enable row level security;
alter table public.omnix_social_credentials enable row level security;
alter table public.omnix_media_assets enable row level security;
alter table public.omnix_posts enable row level security;
alter table public.omnix_post_destinations enable row level security;
alter table public.omnix_publication_attempts enable row level security;

create or replace function public.omnix_is_member()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.omnix_profiles where user_id = auth.uid()) $$;
revoke all on function public.omnix_is_member() from public, anon;
grant execute on function public.omnix_is_member() to authenticated, service_role;

create policy "omnix_profiles_owner_select" on public.omnix_profiles for select
  using (auth.uid() = user_id);
create policy "omnix_profiles_owner_update" on public.omnix_profiles for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "omnix_social_accounts_owner_select" on public.omnix_social_accounts for select
  using (auth.uid() = user_id and public.omnix_is_member());
create policy "omnix_media_owner_all" on public.omnix_media_assets for all
  using (auth.uid() = user_id and public.omnix_is_member())
  with check (auth.uid() = user_id and public.omnix_is_member());
create policy "omnix_posts_owner_all" on public.omnix_posts for all
  using (auth.uid() = user_id and public.omnix_is_member())
  with check (auth.uid() = user_id and public.omnix_is_member());
create policy "omnix_destinations_owner_all" on public.omnix_post_destinations for all
  using (exists (select 1 from public.omnix_posts p where p.id = post_id and p.user_id = auth.uid()) and public.omnix_is_member())
  with check (exists (select 1 from public.omnix_posts p where p.id = post_id and p.user_id = auth.uid()) and public.omnix_is_member());
create policy "omnix_attempts_owner_select" on public.omnix_publication_attempts for select
  using (exists (
    select 1 from public.omnix_post_destinations d
    join public.omnix_posts p on p.id = d.post_id
    where d.id = post_destination_id and p.user_id = auth.uid()
  ) and public.omnix_is_member());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('omnix-post-media', 'omnix-post-media', false, 52428800,
  array['video/mp4', 'video/quicktime', 'video/webm'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "omnix_media_files_owner_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'omnix-post-media' and (storage.foldername(name))[1] = auth.uid()::text and public.omnix_is_member());
create policy "omnix_media_files_owner_select" on storage.objects for select to authenticated
  using (bucket_id = 'omnix-post-media' and (storage.foldername(name))[1] = auth.uid()::text and public.omnix_is_member());
create policy "omnix_media_files_owner_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'omnix-post-media' and (storage.foldername(name))[1] = auth.uid()::text and public.omnix_is_member());
