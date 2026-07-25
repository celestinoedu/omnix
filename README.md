# OmniX Social

MVP visual e interativo de um agendador de posts para Instagram, TikTok e YouTube.

## Memória do projeto

Antes de alterar o projeto, leia `AGENTS.md`. Ele aponta para as premissas, arquitetura, decisões e estado atual que devem ser preservados entre sessões.

## Rodar no computador

1. Instale o Node.js LTS em https://nodejs.org.
2. Abra esta pasta no terminal.
3. Execute `npm install`.
4. Execute `npm run dev`.
5. Abra http://localhost:3000.

## O que já funciona

- Dashboard responsivo.
- Calendário com filtros por rede.
- Criação de agendamentos.
- Persistência dos novos posts no navegador.
- Tela de conexões demonstrativa.

## Limite desta etapa

As conexões sociais ainda são demonstrativas. A publicação automática real exige cadastro e aprovação nas APIs oficiais de Meta, TikTok e Google/YouTube. Nunca armazene tokens de redes sociais no navegador.

Veja o roteiro completo em `docs/GUIA-CLIQUE-A-CLIQUE.md`.
