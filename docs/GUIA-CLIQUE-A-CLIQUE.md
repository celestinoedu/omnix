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
