-- OmniX Social: OAuth e publicação agendada oficial do TikTok.

create table if not exists public.omnix_oauth_states (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('TikTok')),
  state_digest text not null unique,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.omnix_oauth_states enable row level security;
-- Sem policies: somente Edge Functions acessam estados OAuth.

alter table public.omnix_social_accounts
  add column if not exists refresh_token_expires_at timestamptz;

create index if not exists omnix_oauth_states_expiry_idx
  on public.omnix_oauth_states (expires_at) where consumed_at is null;
create index if not exists omnix_tiktok_destinations_processing_idx
  on public.omnix_post_destinations (updated_at)
  where platform = 'TikTok' and status = 'processing';

create or replace function public.omnix_claim_due_tiktok_destinations(batch_size integer default 3)
returns table (destination_id uuid)
language plpgsql security definer set search_path = public
as $$
begin
  return query
  with candidates as (
    select d.id, d.post_id
    from public.omnix_post_destinations d
    join public.omnix_posts p on p.id = d.post_id
    where d.platform = 'TikTok' and d.status = 'pending'
      and p.status = 'scheduled' and p.scheduled_at_utc <= now()
    order by p.scheduled_at_utc
    for update of d skip locked
    limit greatest(1, least(batch_size, 10))
  ), claimed as (
    update public.omnix_post_destinations d
    set status = 'processing', updated_at = now()
    from candidates c where d.id = c.id
    returning d.id, d.post_id
  ), marked_posts as (
    update public.omnix_posts p set status = 'processing', updated_at = now()
    where p.id in (select post_id from claimed) returning p.id
  )
  select id from claimed;
end;
$$;

revoke all on function public.omnix_claim_due_tiktok_destinations(integer) from public, anon, authenticated;
grant execute on function public.omnix_claim_due_tiktok_destinations(integer) to service_role;

