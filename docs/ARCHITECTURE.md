# Arquitetura do OmniX Social

Última atualização: 22 de agosto de 2026.

Este documento separa a arquitetura existente da arquitetura-alvo. Componentes planejados não devem ser descritos ao proprietário como já implementados.

## Arquitetura atual — TikTok implementado, aguardando configuração externa

### Interface

- React 19.
- TypeScript em modo estrito.
- Estrutura de rotas no padrão Next.js App Router.
- Exportação estática do Next.js para GitHub Pages.
- Ícones `lucide-react`.
- CSS próprio e responsivo, sem biblioteca visual paga.

### Hospedagem

- Destino definido: GitHub Pages, com workflow em `.github/workflows/deploy-pages.yml`.
- Domínio definido: `https://omnix.lotusnegocios.com`.
- O domínio raiz já usa GitHub Pages; o subdomínio estava livre na verificação DNS de 22/08/2026.
- Build gera o site estático em `out/`; não há segredo nem código de publicação social no GitHub Pages.

### Dados atuais

- Posts de demonstração definidos na interface.
- Novos agendamentos gravados no `localStorage` do navegador.
- Cliente Supabase, login por magic link, CRUD de agendamentos e upload privado já implementados no código.
- Migração SQL versionada em `supabase/migrations/202607250001_initial_schema.sql`.
- Projeto Supabase gratuito criado e migração inicial aplicada em 25/07/2026.
- Variáveis públicas configuradas no localhost e no ambiente Sites; a versão 4 de produção ativou a camada real.
- Quando não há configuração Supabase, o aplicativo ainda entra explicitamente em modo demonstração.
- Estrutura de OAuth e publicação TikTok implementada no repositório, ainda não aplicada/publicada no Supabase remoto.

### Backend TikTok implementado

- `tiktok-auth`: inicia OAuth, valida `state`, troca o código, lê o perfil e permite revogação.
- `tiktok-creator-info`: renova tokens e consulta as opções atuais obrigatórias do criador.
- `tiktok-publisher`: reivindica posts vencidos, valida consentimentos, envia vídeo, consulta o processamento e atualiza estados.
- Tokens são cifrados com AES-256-GCM e ficam em `social_credentials`, sem acesso pelo navegador.
- A migração `202608220001_tiktok_direct_post.sql` adiciona estados OAuth e a reivindicação transacional da fila.
- Supabase Cron chama o publicador a cada minuto usando um segredo guardado no Vault.

### Limitação essencial

A integração só ficará operacional após criar e aprovar o aplicativo no TikTok for Developers, aplicar a migração, publicar as Edge Functions e configurar seus segredos. Até a auditoria do TikTok, Direct Post publica apenas com visibilidade `SELF_ONLY`.

## Arquitetura-alvo — expansão após validar o TikTok

A seleção final de serviços deve ser validada novamente contra os free tiers vigentes antes da implementação.

### Componentes propostos

1. **Cliente web**
   - Mantém a experiência atual.
   - Faz chamadas autenticadas ao backend.
   - Nunca recebe client secrets nem tokens sociais persistentes.

2. **Autenticação**
   - Supabase Auth no free tier, com magic link por e-mail já implementado.
   - Cada registro de negócio deve pertencer a um `user_id`.

3. **Banco de dados**
   - PostgreSQL do Supabase.
   - Row Level Security ativada.
   - Migrações versionadas no repositório.
   - Estrutura e políticas iniciais já versionadas, aguardando aplicação no projeto remoto.

4. **Armazenamento de mídia**
   - Supabase Storage no MVP, condicionado aos limites gratuitos.
   - Arquivos privados com URLs assinadas e prazo curto.
   - Política de retenção para remover mídias antigas quando seguro.
   - Bucket privado e limite de 50 MB definidos na migração inicial.

5. **Backend e OAuth**
   - Rotas server-side no ambiente Cloudflare/Vinext ou Workers dedicados.
   - Troca e renovação de tokens executadas apenas no backend.
   - Tokens cifrados em repouso.
   - `state` e PKCE quando suportados para evitar sequestro do fluxo OAuth.

6. **Agendador**
   - Supabase Cron no plano Pro.
   - Execução em intervalos curtos para buscar posts vencidos.
   - Travamento transacional para impedir dois workers de publicarem o mesmo post.

7. **Adaptadores das plataformas**
   - Um adaptador por rede: Instagram, TikTok e YouTube.
   - Interface comum para validar, preparar, publicar, consultar status e tratar erros.
   - Regras específicas de duração, proporção, tamanho e formato isoladas por adaptador.

8. **Observabilidade**
   - Tabela de tentativas de publicação e logs estruturados sem dados sensíveis.
   - Mensagem clara para o usuário.
   - Retentativas com espera crescente apenas para falhas recuperáveis.

## Modelo de dados proposto

### `profiles`

- `id`
- `user_id`
- `display_name`
- `timezone`
- `created_at`
- `updated_at`

### `social_accounts`

- `id`
- `user_id`
- `platform`
- `platform_account_id`
- `display_name`
- `token_expires_at`
- `scopes`
- `status`
- `created_at`
- `updated_at`

### `social_credentials`

- `social_account_id`
- `encrypted_access_token`
- `encrypted_refresh_token`
- `encryption_key_version`
- `updated_at`

Essa tabela não possui políticas para clientes autenticados. Somente o backend privilegiado poderá acessar tokens.

### `media_assets`

- `id`
- `user_id`
- `storage_path`
- `mime_type`
- `size_bytes`
- `duration_seconds`
- `width`
- `height`
- `status`
- `created_at`

### `posts`

- `id`
- `user_id`
- `title`
- `caption`
- `scheduled_at_utc`
- `timezone`
- `status`
- `created_at`
- `updated_at`

### `post_destinations`

- `id`
- `post_id`
- `social_account_id`
- `platform_options`
- `status`
- `platform_post_id`
- `published_at`
- `last_error_code`
- `last_error_message`

### `publication_attempts`

- `id`
- `post_destination_id`
- `attempt_number`
- `idempotency_key`
- `started_at`
- `finished_at`
- `outcome`
- `error_category`

## Estados propostos

Estado geral do post:

`draft → scheduled → processing → published`

Saídas de exceção:

- `scheduled → cancelled`
- `processing → partial_failure`
- `processing → failed`
- `failed → scheduled`, somente após correção ou retentativa autorizada.

Cada destino deve ter estado próprio. Um post enviado a três redes pode ser publicado em duas e falhar em uma.

## Fluxo de publicação proposto

1. Usuário envia a mídia.
2. Backend valida arquivo e propriedade.
3. Usuário escolhe contas, data, horário e fuso.
4. Backend converte o horário para UTC e salva também o fuso original.
5. Agendador localiza destinos vencidos ainda não processados.
6. Worker adquire um bloqueio e cria uma chave de idempotência.
7. Adaptador da rede valida o token e publica.
8. Backend salva o identificador externo e o resultado.
9. Falha recuperável entra em retentativa; falha permanente pede ação do usuário.

## Limites e custos

- Supabase Pro é o único custo recorrente autorizado; add-ons e excesso de cota exigem autorização.
- Vídeos podem consumir rapidamente armazenamento e tráfego incluídos.
- A Edge Function tem limite de duração e memória; por isso o MVP limita vídeos a 50 MB e processa lotes pequenos.
- Limites consultados em 22/08/2026 para o Pro: 100 GB de Storage incluído, 250 GB de egress incluído e 2 milhões de invocações de Edge Functions por mês; a duração máxima de uma função Pro é 400 segundos e a memória máxima é 256 MB.
- O GitHub Pages usa repositório público e não adiciona custo. O workflow não recebe segredos sociais.
- Cotas das APIs sociais são independentes da hospedagem.
- Contas de desenvolvedor e revisões podem exigir verificação de identidade ou empresa, mesmo sem cobrança.
- Antes da implementação real, registrar os limites atuais e definir travas de uso.

## Regras para mudanças arquiteturais

- Não trocar um componente apenas por preferência técnica.
- Registrar toda decisão relevante em `docs/DECISIONS.md`.
- Incluir plano de migração quando uma decisão substituir algo existente.
- Atualizar este documento e `docs/PROJECT_STATUS.md` no mesmo commit da mudança.
