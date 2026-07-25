# Registro de decisões

Última atualização: 25 de julho de 2026.

Este registro é cumulativo. Decisões antigas não devem ser apagadas; quando substituídas, devem receber o estado **Substituída** e apontar para a nova decisão.

## D-001 — Zero custo como restrição principal

- Data: 25/07/2026
- Estado: Aceita
- Decisão: desenvolver e validar o MVP usando apenas recursos sem custo.
- Motivo: premissa MASTER definida pelo proprietário.
- Consequência: capacidade e volume terão limites; qualquer necessidade paga exige aprovação explícita.

## D-002 — Uso exclusivo de APIs oficiais

- Data: 25/07/2026
- Estado: Aceita
- Decisão: integrar Instagram, TikTok e YouTube somente por APIs e OAuth oficiais.
- Motivo: proteger contas, credenciais e conformidade.
- Consequência: o lançamento real depende das análises e permissões de terceiros.

## D-003 — Primeira entrega como MVP visual

- Data: 25/07/2026
- Estado: Aceita
- Decisão: validar primeiro a experiência de calendário, criação e conexões antes de implementar backend.
- Motivo: permitir avaliação rápida do produto e evitar infraestrutura prematura.
- Consequência: dados atuais são locais e publicação automática ainda não funciona.

## D-004 — Interface React/TypeScript com Vinext

- Data: 25/07/2026
- Estado: Aceita
- Decisão: usar React, TypeScript e estrutura App Router, empacotada com Vinext para o host Cloudflare.
- Motivo: tipagem, experiência moderna e compatibilidade com a hospedagem escolhida.
- Consequência: manter o build Vinext e validar `dist/server/index.js` antes de publicar.

## D-005 — Hospedagem inicialmente privada

- Data: 25/07/2026
- Estado: Aceita
- Decisão: publicar o protótipo com acesso restrito ao proprietário.
- Motivo: conexões são simuladas e o produto ainda não possui autenticação própria.
- Consequência: tornar o app público exigirá aprovação explícita e revisão de segurança.

## D-006 — Backend proposto com Supabase e Cloudflare

- Data: 25/07/2026
- Estado: Proposta, ainda não implementada
- Decisão proposta: usar Supabase para autenticação, PostgreSQL e arquivos; usar Cloudflare/Vinext ou Workers para backend e agendamento.
- Motivo: disponibilidade de free tiers e baixo custo operacional inicial.
- Consequência: os limites vigentes devem ser verificados antes da adoção; a escolha final pode mudar sem migração, pois ainda não há dados reais.

## D-007 — Documentação como memória operacional

- Data: 25/07/2026
- Estado: Aceita
- Decisão: manter contexto, premissas, arquitetura, decisões e estado em documentos dedicados, com `AGENTS.md` como índice obrigatório.
- Motivo: preservar continuidade e qualidade entre sessões.
- Consequência: mudanças materiais só estão concluídas quando a documentação correspondente também estiver atualizada.
