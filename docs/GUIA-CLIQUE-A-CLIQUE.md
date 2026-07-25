# Guia clique a clique — OmniX Social

## O que esta primeira versão faz

Você já pode navegar pelo calendário, filtrar por rede social, abrir “Conexões” e criar novos agendamentos. Os dados criados ficam salvos apenas no navegador usado.

## Como abrir no seu computador

1. Abra https://nodejs.org.
2. Clique no botão **LTS**.
3. Abra o arquivo baixado e clique em **Next** até aparecer **Install**.
4. Clique em **Install** e depois em **Finish**.
5. Abra a pasta `OmniX`.
6. Clique com o botão direito em uma área vazia da pasta.
7. Clique em **Abrir no Terminal**.
8. Digite `npm install` e pressione Enter.
9. Quando terminar, digite `npm run dev` e pressione Enter.
10. Abra o navegador e acesse `http://localhost:3000`.

## Como testar

1. Clique em **Criar post**.
2. Preencha o título, escolha a rede, o dia e o horário.
3. Clique em **Agendar post**.
4. Confira o novo cartão no calendário.
5. Clique em **3 contas conectadas** para abrir a tela de conexões.

## Caminho para publicação automática real

Essa parte depende das plataformas, não apenas do código.

### Instagram

1. A conta precisa ser profissional (Empresa ou Criador) e vinculada a uma Página do Facebook.
2. Acesse `developers.facebook.com` e crie uma conta de desenvolvedor.
3. Crie um aplicativo do tipo Business.
4. Adicione os produtos de Login do Facebook e Instagram Graph API.
5. Cadastre a URL pública do OmniX nas URLs de redirecionamento.
6. Solicite as permissões necessárias para publicar conteúdo.
7. Envie o aplicativo para análise da Meta.

### TikTok

1. Acesse `developers.tiktok.com`.
2. Crie uma conta de desenvolvedor.
3. Crie um aplicativo.
4. Adicione o produto Content Posting API.
5. Cadastre a URL pública do OmniX como Redirect URI.
6. Solicite a liberação para Direct Post.
7. Envie o aplicativo e a demonstração para análise.

### YouTube

1. Acesse `console.cloud.google.com`.
2. Crie um novo projeto.
3. Abra **APIs e serviços**.
4. Clique em **Biblioteca**.
5. Procure e ative **YouTube Data API v3**.
6. Abra **Tela de consentimento OAuth** e preencha os dados.
7. Crie uma credencial OAuth do tipo Aplicativo da Web.
8. Cadastre a URL pública do OmniX nas URLs de redirecionamento.
9. Publique a tela de consentimento quando o aplicativo estiver pronto.

## Arquitetura gratuita recomendada para a próxima etapa

- Interface e API: Cloudflare Workers/Pages ou hospedagem equivalente no free tier.
- Banco, login e arquivos: Supabase free tier.
- Agendador: Supabase Cron ou Cloudflare Cron Triggers.
- Código: GitHub gratuito.

Os planos gratuitos têm limites. “Zero custo” funciona para desenvolvimento, validação e baixo volume, mas crescimento de uso ou armazenamento pode exigir um plano pago no futuro.

## Ativar login, banco e arquivos reais com Supabase

Não é necessário cadastrar cartão. Não compartilhe sua senha do Supabase nem a senha do banco.

### Parte 1 — Criar a conta e o projeto

1. Abra `https://supabase.com`.
2. Clique em **Start your project**.
3. Entre usando sua conta do GitHub ou escolha uma das opções de acesso oferecidas.
4. Se aparecer a criação de uma organização, clique em **New organization**.
5. No nome da organização, digite `OmniX`.
6. Escolha o plano **Free**.
7. Clique em **Create organization**.
8. Clique em **New project**.
9. Em **Name**, digite `omnix-social`.
10. Em **Database Password**, crie uma senha forte e guarde-a em um gerenciador de senhas. Essa senha não deve ser enviada na conversa.
11. Em **Region**, escolha a região mais próxima disponível.
12. Confirme que o plano exibido é **Free**.
13. Clique em **Create new project**.
14. Aguarde a preparação terminar.

### Parte 2 — Criar as tabelas e proteções

1. No menu esquerdo do Supabase, clique em **SQL Editor**.
2. Clique em **New query**.
3. No computador, abra a pasta `OmniX`.
4. Abra a pasta `supabase`.
5. Abra a pasta `migrations`.
6. Abra o arquivo `202607250001_initial_schema.sql` com o Bloco de Notas.
7. Pressione `Ctrl + A` para selecionar tudo.
8. Pressione `Ctrl + C` para copiar.
9. Volte ao navegador, clique na área da nova consulta e pressione `Ctrl + V`.
10. Clique em **Run**.
11. Aguarde a mensagem de sucesso. Se aparecer erro, não repita a execução: copie apenas a mensagem do erro para a conversa.

### Parte 3 — Encontrar os dois dados públicos

Esses dois dados podem ser configurados no app. Não copie a chave `service_role` ou `secret`.

1. No topo do painel do projeto, procure o botão **Connect**. Se não aparecer, clique em **Project Settings** e depois em **API Keys**.
2. Localize **Project URL** e copie o endereço que começa com `https://`.
3. Localize a chave chamada **Publishable key**. Em projetos antigos ela pode aparecer como chave **anon public**.
4. Não copie nenhuma chave marcada como `secret` ou `service_role`.
5. Envie na conversa somente o **Project URL** e a **Publishable key** para que sejam configurados no localhost e na hospedagem.

### Limites gratuitos registrados em 25/07/2026

- Banco: 500 MB.
- Arquivos: 1 GB.
- Tráfego direto: 5 GB.
- Tamanho máximo de cada arquivo: 50 MB.
- O projeto pode pausar após uma semana sem atividade e ser reativado pelo painel.
