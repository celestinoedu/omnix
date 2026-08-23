-- Também permite limpar publicações que terminaram em falha.
create or replace function public.omnix_delete_scheduled_post(target_post_id uuid)
returns table (deleted boolean, storage_path text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  media_id uuid;
  media_path text;
begin
  select p.media_asset_id, m.storage_path
    into media_id, media_path
  from public.omnix_posts p
  left join public.omnix_media_assets m on m.id = p.media_asset_id
  where p.id = target_post_id
    and p.user_id = auth.uid()
    and p.status in ('scheduled', 'failed')
    and public.omnix_is_member()
  for update of p;

  if not found or exists (
    select 1 from public.omnix_post_destinations d
    where d.post_id = target_post_id and d.status not in ('pending', 'failed', 'cancelled')
  ) then
    return query select false, null::text;
    return;
  end if;

  delete from public.omnix_posts p
  where p.id = target_post_id and p.user_id = auth.uid();

  if media_id is not null then
    delete from public.omnix_media_assets m
    where m.id = media_id
      and m.user_id = auth.uid()
      and not exists (select 1 from public.omnix_posts p where p.media_asset_id = media_id);
  end if;

  return query select true, media_path;
end;
$$;

revoke all on function public.omnix_delete_scheduled_post(uuid) from public, anon;
grant execute on function public.omnix_delete_scheduled_post(uuid) to authenticated, service_role;
