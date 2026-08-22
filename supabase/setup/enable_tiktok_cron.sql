-- Execute somente depois de publicar a função tiktok-publisher e criar os dois
-- segredos abaixo no Vault. Substitua os marcadores antes de executar e não
-- salve valores reais neste arquivo.

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

select vault.create_secret(
  'https://SEU-PROJETO.supabase.co',
  'omnix_project_url',
  'URL do projeto usada pelo cron do OmniX'
);

select vault.create_secret(
  'COLE_AQUI_O_MESMO_OMNIX_CRON_SECRET_DAS_EDGE_FUNCTIONS',
  'omnix_cron_secret',
  'Segredo de autenticação do publicador TikTok'
);

do $$
declare existing_job bigint;
begin
  select jobid into existing_job from cron.job where jobname = 'omnix-tiktok-publisher';
  if existing_job is not null then perform cron.unschedule(existing_job); end if;
end $$;

select cron.schedule(
  'omnix-tiktok-publisher',
  '* * * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'omnix_project_url') || '/functions/v1/tiktok-publisher',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-omnix-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'omnix_cron_secret')
    ),
    body := jsonb_build_object('requested_at', now())
  ) as request_id;
  $$
);

