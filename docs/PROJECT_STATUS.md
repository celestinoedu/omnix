# Estado atual do projeto

Última atualização: 25 de julho de 2026.

## Etapa atual

**Protótipo funcional de interface / pré-backend.**

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

## Simulado

- Conexão e desconexão das contas sociais.
- Perfil da usuária exibido na interface.
- Estatísticas de publicações.
- Upload de foto ou vídeo.
- Estados de posts publicados.

## Ainda não implementado

- Cadastro e login próprios.
- Banco de dados.
- Sincronização entre dispositivos.
- Upload e armazenamento real de mídia.
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

Transformar o protótipo em um MVP com dados reais, sem integrar todas as redes de uma vez:

1. Criar projeto gratuito no Supabase.
2. Implementar login.
3. Criar banco com Row Level Security.
4. Salvar agendamentos no banco.
5. Implementar upload privado de mídia e limites de tamanho.
6. Configurar fuso horário.
7. Integrar primeiro o YouTube ou Instagram, conforme a conta disponível para testes.
8. Implementar o worker de publicação idempotente.
9. Validar o fluxo completo antes de adicionar as demais redes.

## Validação mais recente

- `npm run build`: aprovado.
- `npm audit --audit-level=high`: zero vulnerabilidades encontradas.
- Deploy privado da versão 3: concluído.
- URL: `https://omnix-social.ecarvalho95.chatgpt.site`.

## Regra para a próxima sessão

Ler `AGENTS.md` e os documentos indicados nele antes de alterar o código. Atualizar este arquivo ao concluir qualquer funcionalidade material.
