# Arquitetura do OmniX Social

Última atualização: 25 de julho de 2026.

Este documento separa a arquitetura existente da arquitetura-alvo. Componentes planejados não devem ser descritos ao proprietário como já implementados.

## Arquitetura atual — MVP visual com fundação de dados

### Interface

- React 19.
- TypeScript em modo estrito.
- Estrutura de rotas no padrão Next.js App Router.
- Empacotamento Vinext sobre Vite para execução em Cloudflare.
- Ícones `lucide-react`.
- CSS próprio e responsivo, sem biblioteca visual paga.

### Hospedagem

- Site privado no ambiente Sites/Cloudflare.
- URL atual: `https://omnix-social.ecarvalho95.chatgpt.site`.
- Identificador do projeto de hospedagem armazenado em `.openai/hosting.json`.
- Build gera `dist/server/index.js` e copia os metadados necessários para `dist/.openai/hosting.json`.

### Dados atuais

- Posts de demonstração definidos na interface.
- Novos agendamentos gravados no `localStorage` do navegador.
- Cliente Supabase, login por magic link, CRUD de agendamentos e upload privado já implementados no código.
- Migração SQL versionada em `supabase/migrations/202607250001_initial_schema.sql`.
- Projeto Supabase gratuito criado e migração inicial aplicada em 25/07/2026.
- Variáveis públicas configuradas no localhost e no ambiente Sites; a próxima versão de produção ativará a camada real.
- Quando não há configuração Supabase, o aplicativo ainda entra explicitamente em modo demonstração.
- Nenhum token social.

### Limitação essencial

O localhost já apresenta o login real. A versão de produção precisa ser republicada para receber a nova revisão de ambiente. Mesmo após essa ativação, ainda não haverá publicação social até a implementação dos adaptadores OAuth.

## Arquitetura-alvo — publicação automática

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
   - Cloudflare Cron Trigger ou Supabase Cron, após comparar limites gratuitos.
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

## Limites e riscos do free tier

- Vídeos podem consumir rapidamente o limite de armazenamento e tráfego.
- Cron gratuito pode ter frequência ou duração limitada.
- Cotas das APIs sociais são independentes da hospedagem.
- Contas de desenvolvedor e revisões podem exigir verificação de identidade ou empresa, mesmo sem cobrança.
- Antes da implementação real, registrar os limites atuais e definir travas de uso.

## Regras para mudanças arquiteturais

- Não trocar um componente apenas por preferência técnica.
- Registrar toda decisão relevante em `docs/DECISIONS.md`.
- Incluir plano de migração quando uma decisão substituir algo existente.
- Atualizar este documento e `docs/PROJECT_STATUS.md` no mesmo commit da mudança.
