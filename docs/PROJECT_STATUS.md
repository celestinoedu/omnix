# Estado atual do projeto

Última atualização: 25 de julho de 2026.

## Etapa atual

**Fundação de backend publicada / aguardando validação do magic link pelo usuário.**

## Implementado

- Dashboard responsivo.
- Calendário mensal.
- Filtros por Instagram, TikTok e YouTube.
- Cards de métricas e próximos posts.
- Modal para criar agendamentos.
- Persistência dos novos posts no navegador com `localStorage`.
- Tela demonstrativa de conexões sociais.
- Layout para computador e celular.
- Hospedagem privada de produção.
- Build Vinext compatível com o host.
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
- URL e chave publicável configuradas localmente e no ambiente Sites.
- Endpoint de autenticação validado com resposta HTTP 200.
- Tela de login real validada no localhost.
- Versão 4 publicada com a revisão 1 das variáveis Supabase.

## Simulado

- Conexão e desconexão das contas sociais.
- Perfil da usuária exibido na interface.
- Estatísticas de publicações.
- Upload de foto ou vídeo.
- Estados de posts publicados.

## Ainda não implementado

- Teste ponta a ponta do login, sincronização e upload contra o Supabase remoto.
- OAuth real de Meta/Instagram.
- OAuth real de TikTok.
- OAuth real de Google/YouTube.
- Publicação automática.
- Agendador no servidor.
- Retentativas e acompanhamento de erros.
- Notificações.
- Configuração de fuso horário pelo usuário.
- Edição, duplicação e cancelamento reais de posts.

## Dependências externas

- Criação dos aplicativos nos portais de Meta, TikTok e Google.
- Configuração das URLs de OAuth após definir a infraestrutura real.
- Aprovação das permissões de publicação quando exigida.
- Contas sociais do tipo aceito pelas APIs.

## Próximo marco recomendado

Ativar e validar a fundação já implementada:

1. Proprietário testa o magic link com seu e-mail.
2. Testar salvamento, sincronização e upload.
3. Configurar fuso horário na interface.
4. Integrar primeiro o YouTube, por oferecer um fluxo de upload oficial bem documentado.
5. Implementar o worker de publicação idempotente.
6. Validar o fluxo completo antes de adicionar Instagram e TikTok.

## Validação mais recente

- `npm run build`: aprovado.
- `npm audit --audit-level=high`: zero vulnerabilidades encontradas.
- Teste em navegador: dashboard e modal de criação aprovados em modo demonstração.
- Teste em navegador: tela de login Supabase aprovada no localhost.
- Supabase Auth `/health`: HTTP 200.
- Deploy privado da versão 4: concluído com `env_set_revision` 1.
- URL: `https://omnix-social.ecarvalho95.chatgpt.site`.

## Regra para a próxima sessão

Ler `AGENTS.md` e os documentos indicados nele antes de alterar o código. Atualizar este arquivo ao concluir qualquer funcionalidade material.
