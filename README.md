# OmniX Social

Agendador de vídeos para TikTok com interface estática e backend no Supabase.

## Memória do projeto

Antes de alterar o projeto, leia `AGENTS.md`. Ele aponta para as premissas, arquitetura, decisões e estado atual que devem ser preservados entre sessões.

## Rodar no computador

1. Instale o Node.js LTS em https://nodejs.org.
2. Abra esta pasta no terminal.
3. Execute `npm install`.
4. Execute `npm run dev`.
5. Abra http://localhost:3000.

## O que está implementado

- Dashboard responsivo.
- Calendário com filtros por rede.
- Criação de agendamentos.
- Persistência dos novos posts no navegador.
- OAuth oficial do TikTok em Edge Function.
- Criptografia e renovação de tokens no backend.
- Regras obrigatórias de privacidade, interação, conteúdo comercial e consentimento.
- Publicador agendado e acompanhamento de status pela Content Posting API.
- Exportação estática e workflow do GitHub Pages para `omnix.lotusnegocios.com`.

## Limite desta etapa

O código está pronto, mas a operação real depende da configuração e aprovação do aplicativo no TikTok for Developers, publicação das Edge Functions e ativação do Cron. Nunca armazene tokens de redes sociais no navegador ou no GitHub.

Veja o roteiro completo em `docs/GUIA-CLIQUE-A-CLIQUE.md`.
