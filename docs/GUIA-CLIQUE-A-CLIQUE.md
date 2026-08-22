# Guia clique a clique — ativar TikTok e GitHub Pages

Última atualização: 22 de agosto de 2026.

O código do OmniX está preparado para agendar vídeos usando a API oficial do TikTok. Para funcionar de verdade, ainda é necessário autorizar o aplicativo nos painéis do TikTok, Supabase e GitHub. Não envie nenhuma chave secreta por conversa e não coloque segredos no GitHub.

## Resultado esperado

Ao concluir este guia, o fluxo será:

1. Entrar no OmniX pelo link enviado ao e-mail.
2. Clicar em **Conectar TikTok** e autorizar no site oficial.
3. Escolher vídeo, legenda, data, privacidade e declarações.
4. O Supabase Cron verificar a fila a cada minuto.
5. O vídeo ser enviado ao TikTok no horário e o OmniX confirmar o resultado.

Enquanto o TikTok não concluir a auditoria do aplicativo, os vídeos ficam obrigatoriamente em **Somente eu**. Essa é uma restrição oficial, não uma limitação do OmniX.

## Parte 1 — criar o aplicativo no TikTok

1. Abra `https://developers.tiktok.com`.
2. Clique em **Log in** e entre com a conta que administrará o aplicativo.
3. Abra **Manage apps**.
4. Clique em **Connect an app** ou **Create app**.
5. Em nome, use `OmniX Social`.
6. Em plataforma, escolha **Web**.
7. Em URL do site, informe `https://omnix.lotusnegocios.com`.
8. Se forem solicitadas URLs legais, informe:
   - Privacidade: `https://omnix.lotusnegocios.com/privacidade/`
   - Termos: `https://omnix.lotusnegocios.com/termos/`
9. Salve sem publicar chaves em nenhum documento.
10. Se aparecer **URL properties** ou verificação de domínio, adicione `https://omnix.lotusnegocios.com/` e escolha a verificação por DNS.
11. Copie o registro indicado pelo TikTok para o painel DNS e aguarde aparecer **Verified**.

### Adicionar Login Kit

1. Dentro do aplicativo, procure **Products** ou **Add products**.
2. Adicione **Login Kit**.
3. Abra a configuração para Web.
4. Em **Redirect URI**, cadastre exatamente:
   `https://hbhfqfebqtytgmjmqdtr.supabase.co/functions/v1/tiktok-auth/callback`
5. Não acrescente barra no final e não use `http`.
6. Salve.

### Adicionar Content Posting API

1. Volte a **Products**.
2. Adicione **Content Posting API**.
3. Ative **Direct Post**.
4. Solicite os escopos `user.info.basic` e `video.publish`.
5. Preencha a descrição explicando que o usuário conecta a própria conta, escolhe um vídeo, edita a legenda, escolhe privacidade e consentimentos e agenda o envio.
6. Se o portal pedir uma demonstração, primeiro conclua as partes do Supabase e grave o fluxo de teste como **Somente eu**.
7. Envie para análise quando todas as informações estiverem completas.

### Guardar as duas credenciais

1. Abra **Basic information** ou **Credentials** no aplicativo TikTok.
2. Localize **Client key** e **Client secret**.
3. Guarde ambos em um gerenciador de senhas.
4. Não cole essas credenciais em `.env.local`, Markdown, GitHub Issue ou conversa.

## Parte 2 — aplicar o banco no Supabase

1. Abra `https://supabase.com/dashboard`.
2. Entre no projeto `omnix-social`.
3. No menu esquerdo, clique em **SQL Editor**.
4. Clique em **New query**.
5. No computador, abra `OmniX/supabase/migrations/202608220001_tiktok_direct_post.sql`.
6. Copie todo o conteúdo e cole no editor.
7. Clique em **Run** uma única vez.
8. Confirme que aparece sucesso. Se houver erro, pare e copie somente a mensagem do erro; nunca copie chaves.

## Parte 3 — publicar as Edge Functions

Esta etapa usa o terminal apenas para enviar os arquivos ao seu próprio Supabase.

1. Abra a pasta `OmniX`.
2. Clique com o botão direito em uma área vazia e escolha **Abrir no Terminal**.
3. Digite `npx supabase login` e pressione Enter.
4. O navegador abrirá. Autorize a CLI e volte ao terminal.
5. Digite `npx supabase link --project-ref hbhfqfebqtytgmjmqdtr`.
6. Se pedir a senha do banco, use a senha guardada no gerenciador; não envie a senha na conversa.
7. Execute, um por vez:
   - `npx supabase functions deploy tiktok-auth`
   - `npx supabase functions deploy tiktok-creator-info`
   - `npx supabase functions deploy tiktok-publisher`
8. Aguarde a confirmação de sucesso das três funções.

## Parte 4 — criar os segredos das funções

1. No Supabase, abra **Edge Functions**.
2. Clique em **Secrets** ou **Manage secrets**.
3. Crie estes segredos:

| Nome | Valor |
|---|---|
| `TIKTOK_CLIENT_KEY` | Client key copiada do TikTok |
| `TIKTOK_CLIENT_SECRET` | Client secret copiado do TikTok |
| `OMNIX_APP_URL` | `https://omnix.lotusnegocios.com` |
| `TIKTOK_APP_AUDITED` | `false` |

### Gerar os dois valores aleatórios

1. Abra o PowerShell.
2. Execute `[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))`.
3. Copie o resultado e crie `SOCIAL_TOKEN_ENCRYPTION_KEY` no Supabase.
4. Execute o mesmo comando novamente para obter outro valor.
5. Copie o novo resultado e crie `OMNIX_CRON_SECRET`.
6. Guarde o segundo resultado temporariamente no gerenciador de senhas; ele será usado na próxima parte.

Não troque `SOCIAL_TOKEN_ENCRYPTION_KEY` depois de conectar contas, pois os tokens existentes deixariam de ser legíveis.

## Parte 5 — ativar o agendador a cada minuto

1. No Supabase, volte ao **SQL Editor** e clique em **New query**.
2. Abra `OmniX/supabase/setup/enable_tiktok_cron.sql` no computador.
3. Copie o conteúdo para um editor temporário.
4. Substitua `https://SEU-PROJETO.supabase.co` por `https://hbhfqfebqtytgmjmqdtr.supabase.co`.
5. Substitua `COLE_AQUI_O_MESMO_OMNIX_CRON_SECRET_DAS_EDGE_FUNCTIONS` pelo valor de `OMNIX_CRON_SECRET`.
6. Copie o SQL já ajustado, cole no SQL Editor e clique em **Run**.
7. Feche o editor temporário sem salvar o segredo no repositório.
8. No menu esquerdo, abra **Integrations** e depois **Cron**.
9. Confirme que existe `omnix-tiktok-publisher` com frequência `* * * * *`.

## Parte 6 — preparar o GitHub Pages

1. Abra `https://github.com/new`.
2. Em **Repository name**, digite `omnix-social`.
3. Escolha **Public**. Isso mantém o GitHub Pages gratuito; o repositório não contém tokens nem segredos.
4. Não marque opções para criar README, `.gitignore` ou licença.
5. Clique em **Create repository**.
6. Use as instruções do GitHub para enviar a pasta OmniX ou peça para concluir o envio durante uma sessão com o GitHub autenticado.

### Configurar os dados públicos do build

1. Dentro do repositório, clique em **Settings**.
2. No menu esquerdo, abra **Secrets and variables** e depois **Actions**.
3. Em **Repository secrets**, clique em **New repository secret**.
4. Crie `NEXT_PUBLIC_SUPABASE_URL` com `https://hbhfqfebqtytgmjmqdtr.supabase.co`.
5. Crie `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` com a chave publicável do Supabase. Não use `secret` nem `service_role`.
6. Em **Variables**, crie `NEXT_PUBLIC_TIKTOK_AUDITED` com `false`.

### Ativar Pages

1. Ainda em **Settings**, abra **Pages**.
2. Em **Build and deployment**, selecione **GitHub Actions**.
3. Abra a aba **Actions** do repositório.
4. O workflow **Publicar OmniX no GitHub Pages** deve iniciar após o envio à branch `main`.
5. Aguarde o marcador verde.

## Parte 7 — apontar o subdomínio

O domínio raiz já aponta para GitHub Pages e não será alterado.

1. Abra o painel onde o DNS de `lotusnegocios.com` é administrado.
2. Clique em **Adicionar registro**.
3. Escolha o tipo **CNAME**.
4. Em nome/host, informe `omnix`.
5. Em destino, informe o endereço padrão mostrado pelo GitHub Pages, normalmente `SEU-USUARIO.github.io`.
6. Salve.
7. Volte a **GitHub > Settings > Pages**.
8. Em **Custom domain**, informe `omnix.lotusnegocios.com` e salve.
9. Quando ficar disponível, marque **Enforce HTTPS**.

## Parte 8 — autorizar URLs no Supabase

1. No Supabase, abra **Authentication**.
2. Clique em **URL Configuration**.
3. Em **Site URL**, informe `https://omnix.lotusnegocios.com`.
4. Em **Redirect URLs**, adicione `https://omnix.lotusnegocios.com/**`.
5. Salve.

## Parte 9 — primeiro teste real

1. Abra `https://omnix.lotusnegocios.com`.
2. Entre com seu e-mail pelo magic link.
3. Abra **Conexões** e clique em **Conectar** no TikTok.
4. Autorize no site oficial do TikTok.
5. Confirme que o OmniX mostra o nome real da conta.
6. Clique em **Criar post**.
7. Selecione um MP4 curto, de preferência abaixo de 20 MB.
8. Escreva a legenda.
9. Escolha uma data pelo menos cinco minutos no futuro.
10. Escolha manualmente **Somente eu**.
11. Marque ou deixe desmarcadas as interações conforme desejar.
12. Informe corretamente se há promoção de marca ou conteúdo gerado por IA.
13. Marque a declaração obrigatória do TikTok.
14. Clique em **Agendar post**.
15. Após o horário, aguarde alguns minutos e atualize o OmniX.
16. Confirme que o status virou **Publicado** e que o vídeo aparece como privado na conta TikTok.

## Depois do teste

Grave uma demonstração completa, envie a solicitação de auditoria do Direct Post no portal do TikTok e mantenha `TIKTOK_APP_AUDITED=false`. Somente depois da aprovação, altere `TIKTOK_APP_AUDITED` e a variável pública do GitHub para `true` e publique novamente.
