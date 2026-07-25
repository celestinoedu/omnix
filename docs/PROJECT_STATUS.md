# Estado atual do projeto

Última atualização: 25 de julho de 2026.

## Etapa atual

**Fundação de backend implementada / aguardando ativação do Supabase.**

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

## Simulado

- Conexão e desconexão das contas sociais.
- Perfil da usuária exibido na interface.
- Estatísticas de publicações.
- Upload de foto ou vídeo.
- Estados de posts publicados.

## Ainda não implementado

- Ativação do projeto Supabase remoto e aplicação da migração.
- Configuração das variáveis Supabase no localhost e na produção.
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

1. Proprietário cria o projeto gratuito no Supabase.
2. Proprietário executa a migração pelo SQL Editor.
3. Configurar URL e chave publicável no localhost e no Sites.
4. Testar magic link, salvamento, sincronização e upload.
5. Configurar fuso horário na interface.
6. Integrar primeiro o YouTube, por oferecer um fluxo de upload oficial bem documentado.
7. Implementar o worker de publicação idempotente.
8. Validar o fluxo completo antes de adicionar Instagram e TikTok.

## Validação mais recente

- `npm run build`: aprovado.
- `npm audit --audit-level=high`: zero vulnerabilidades encontradas.
- Teste em navegador: dashboard e modal de criação aprovados em modo demonstração.
- Deploy privado da versão 3: concluído.
- URL: `https://omnix-social.ecarvalho95.chatgpt.site`.

## Regra para a próxima sessão

Ler `AGENTS.md` e os documentos indicados nele antes de alterar o código. Atualizar este arquivo ao concluir qualquer funcionalidade material.
