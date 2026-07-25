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
- Estado: Aceita, fundação ativada
- Decisão: usar Supabase para autenticação, PostgreSQL e arquivos; usar Cloudflare/Vinext ou Workers para backend e agendamento.
- Motivo: disponibilidade de free tiers e baixo custo operacional inicial.
- Consequência: projeto remoto, esquema, login e upload estão configurados. Falta a validação humana do magic link e a publicação da versão com a nova revisão de ambiente. Limites registrados: 500 MB de banco, 1 GB de arquivos, 5 GB de egress e 50 MB por upload no plano gratuito consultado em 25/07/2026.

## D-007 — Documentação como memória operacional

- Data: 25/07/2026
- Estado: Aceita
- Decisão: manter contexto, premissas, arquitetura, decisões e estado em documentos dedicados, com `AGENTS.md` como índice obrigatório.
- Motivo: preservar continuidade e qualidade entre sessões.
- Consequência: mudanças materiais só estão concluídas quando a documentação correspondente também estiver atualizada.

## D-008 — Separação física de tokens sociais

- Data: 25/07/2026
- Estado: Aceita
- Decisão: armazenar metadados das contas em `social_accounts` e tokens cifrados em `social_credentials`.
- Motivo: impedir que uma consulta feita pelo navegador alcance tokens, mesmo quando os registros pertencem ao usuário autenticado.
- Consequência: `social_credentials` não possui política RLS para clientes e será acessada somente pelo backend privilegiado.

## D-009 — Modo demonstração como fallback explícito

- Data: 25/07/2026
- Estado: Aceita
- Decisão: manter o comportamento local existente quando as variáveis Supabase não estiverem configuradas.
- Motivo: preservar o protótipo aprovado enquanto a infraestrutura gratuita é ativada.
- Consequência: a interface mostra “Modo demonstração”; depois da configuração, exige login e usa dados reais.
