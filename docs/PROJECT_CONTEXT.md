# Contexto permanente do projeto

Última atualização: 22 de agosto de 2026.

## Resumo

OmniX Social é um aplicativo simples para conectar contas sociais, organizar conteúdo em um calendário e publicar automaticamente nas datas agendadas. O marco atual prioriza fazer o TikTok funcionar de ponta a ponta antes das outras redes.

A referência de produto informada pelo proprietário é o Publer, mas o OmniX deve priorizar simplicidade, clareza e operação de baixo volume no free tier.

## Proprietário e forma de colaboração

O proprietário é um profissional não técnico, com zero experiência em desenvolvimento.

Consequências práticas:

- Evitar respostas que pressuponham conhecimento de terminal, APIs, OAuth ou deploy.
- Quando uma ação humana for inevitável, fornecer um guia clique a clique.
- Explicar termos técnicos em linguagem comum.
- Nunca pedir que o proprietário escolha entre opções técnicas sem antes explicar impacto, custo e recomendação.
- Automatizar com segurança tudo que puder ser automatizado dentro do escopo autorizado.

## Objetivo do produto

Permitir que uma pessoa:

1. Acesse o OmniX com segurança.
2. Conecte uma ou mais contas sociais pelas autorizações oficiais.
3. Envie foto ou vídeo e escreva o conteúdo.
4. Escolha rede, data, horário e fuso.
5. Consulte e altere a fila em um calendário.
6. Tenha o conteúdo publicado automaticamente.
7. Saiba se a publicação foi concluída ou falhou.

## Estado resumido

Existe um MVP visual publicado em ambiente privado. Ele demonstra o dashboard, calendário, filtros, criação de agendamentos e gestão visual de conexões.

As conexões sociais e a publicação automática ainda não são reais. Os agendamentos criados pelo usuário ficam apenas no armazenamento local do navegador.

O estado detalhado e os próximos passos estão em `docs/PROJECT_STATUS.md`.

## Links importantes

- Produção privada: `https://omnix-social.ecarvalho95.chatgpt.site`
- Guia do proprietário: `docs/GUIA-CLIQUE-A-CLIQUE.md`
- Arquitetura: `docs/ARCHITECTURE.md`
- Decisões: `docs/DECISIONS.md`
