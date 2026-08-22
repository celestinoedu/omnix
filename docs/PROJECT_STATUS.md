# Estado atual do projeto

Última atualização: 22 de agosto de 2026.

## Etapa atual

**Integração TikTok implementada localmente / aguardando configuração e aprovação externas.**

## Implementado

- Dashboard responsivo.
- Calendário mensal.
- Filtro de calendário para TikTok.
- Cards de métricas e próximos posts.
- Modal para criar agendamentos.
- Persistência dos novos posts no navegador com `localStorage`.
- Tela de conexões com TikTok real preparado e demais redes claramente planejadas.
- Layout para computador e celular.
- Hospedagem pública no GitHub Pages com domínio próprio e HTTPS.
- Build estático Next.js compatível com GitHub Pages.
- Auditoria de dependências sem vulnerabilidades conhecidas na última validação.
- Guia inicial clique a clique.
- Memória operacional do projeto em Markdown.
- Cliente Supabase com detecção segura de configuração.
- Login sem senha por link enviado ao e-mail.
- Migração PostgreSQL completa com Row Level Security.
- Tabelas para perfis, contas sociais, credenciais isoladas, mídias, posts, destinos e tentativas.
- Bucket privado de mídia com limite gratuito de 50 MB.
- Salvamento e leitura de agendamentos reais quando o Supabase estiver configurado.
- Upload privado com compensação em caso de falha no registro.
- Fallback explícito para modo demonstração.
- Projeto Supabase remoto configurado.
- Migração inicial aplicada e registrada no histórico remoto.
- URL e chave publicável configuradas localmente e nos secrets do GitHub Actions.
- Endpoint de autenticação validado com resposta HTTP 200.
- Tela de login real validada no localhost.
- Calendário deixou de ser fixo em julho de 2026 e agora navega por meses reais.
- Formulário específico para vídeo TikTok com data completa e fuso do navegador.
- Validação de formato, 50 MB, dimensões e duração máxima informada pela conta.
- Interface oficial de privacidade sem valor padrão, interações, conteúdo comercial, IA e consentimento.
- Estado real da conexão TikTok lido de `social_accounts`; Instagram e YouTube aparecem como planejados, não conectados.
- OAuth TikTok com proteção `state`, troca server-side e revogação.
- Tokens TikTok cifrados em AES-256-GCM e renovados no backend.
- Consulta obrigatória de `creator_info` antes de abrir o agendamento e novamente antes de publicar.
- Publicador TikTok com reivindicação transacional, registro de tentativa, upload e consulta de status.
- Restrição segura a `SELF_ONLY` enquanto o aplicativo não estiver auditado pelo TikTok.
- Exportação estática do Next.js e workflow de GitHub Pages.
- Domínio ativo: `omnix.lotusnegocios.com`.
- Repositório público GitHub conectado: `https://github.com/celestinoedu/omnix`.
- Workflow do GitHub Pages executado com sucesso em 22/08/2026.
- Produção publicada e validada em `https://omnix.lotusnegocios.com`, com HTTPS, login Supabase e páginas legais.

## Simulado

- Perfil da usuária exibido na interface.
- Estatísticas de publicações.
- Estados de posts publicados.
- Instagram e YouTube.

## Implementado, mas ainda não ativado no ambiente remoto

- Migração TikTok no Supabase.
- Edge Functions `tiktok-auth`, `tiktok-creator-info` e `tiktok-publisher`.
- Segredos do TikTok, criptografia e cron.

## Ainda não implementado

- Teste ponta a ponta do login, sincronização e upload contra o Supabase remoto.
- OAuth real de Meta/Instagram.
- OAuth real de Google/YouTube.
- Retentativas automáticas após falhas permanentes; o MVP evita repetição para não duplicar vídeos.
- Notificações.
- Edição, duplicação e cancelamento reais de posts.

## Dependências externas

- Criação do aplicativo no TikTok for Developers.
- Liberação dos produtos Login Kit e Content Posting API e do escopo `video.publish`.
- Cadastro exato da URL de callback do Supabase.
- Auditoria do Direct Post para sair de `SELF_ONLY` e publicar publicamente.
- Contas sociais do tipo aceito pelas APIs.

## Próximo marco recomendado

Ativar e validar o TikTok já implementado:

1. Criar o aplicativo no TikTok for Developers e adicionar os produtos exigidos.
2. Autenticar a CLI na conta Supabase que possui `hbhfqfebqtytgmjmqdtr`; o projeto não aparece na sessão CLI atual.
3. Aplicar a migração e publicar as três Edge Functions.
4. Configurar os seis segredos do backend e o Cron.
5. Conectar a conta TikTok pelo OmniX.
6. Agendar um vídeo de teste como `SELF_ONLY` e confirmar o ciclo completo.
7. Gravar a demonstração e solicitar auditoria do TikTok para publicação pública.

## Validação mais recente

- `npm run build`: aprovado.
- `npm run lint`: aprovado.
- `npm audit --audit-level=high`: zero vulnerabilidades encontradas em 22/08/2026.
- `deno check` nas três Edge Functions: aprovado.
- Teste Playwright em navegador: calendário atual, modal, persistência demonstrativa e layout móvel aprovados.
- Screenshot móvel: `output/playwright/omnix-mobile.png` (artefato local ignorado pelo Git).
- Teste em navegador: login Supabase e página de privacidade aprovados na produção GitHub Pages.
- Supabase Auth `/health`: HTTP 200.
- GitHub Actions: build e deploy aprovados no run `32585217908`.
- URL atual: `https://omnix.lotusnegocios.com`.

## Regra para a próxima sessão

Ler `AGENTS.md` e os documentos indicados nele antes de alterar o código. Atualizar este arquivo ao concluir qualquer funcionalidade material.
