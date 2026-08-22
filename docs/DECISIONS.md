# Registro de decisões

Última atualização: 22 de agosto de 2026.

Este registro é cumulativo. Decisões antigas não devem ser apagadas; quando substituídas, devem receber o estado **Substituída** e apontar para a nova decisão.

## D-001 — Zero custo como restrição principal

- Data: 25/07/2026
- Estado: **Substituída por D-010**
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
- Decisão: armazenar metadados das contas em `social_accounts` e tokens cifrados em `social_credentials` (renomeadas para `omnix_social_accounts` e `omnix_social_credentials` por D-013).
- Motivo: impedir que uma consulta feita pelo navegador alcance tokens, mesmo quando os registros pertencem ao usuário autenticado.
- Consequência: `omnix_social_credentials` não possui política RLS para clientes e será acessada somente pelo backend privilegiado.

## D-009 — Modo demonstração como fallback explícito

- Data: 25/07/2026
- Estado: Aceita
- Decisão: manter o comportamento local existente quando as variáveis Supabase não estiverem configuradas.
- Motivo: preservar o protótipo aprovado enquanto a infraestrutura gratuita é ativada.
- Consequência: a interface mostra “Modo demonstração”; depois da configuração, exige login e usa dados reais.

## D-010 — Supabase Pro como único serviço pago

- Data: 22/08/2026
- Estado: Aceita
- Decisão: autorizar o Supabase Pro como único custo recorrente do OmniX; manter os demais componentes em opções gratuitas.
- Motivo: o proprietário já possui o plano Pro e quer concentrar nele autenticação, banco, arquivos, funções e agendamento.
- Consequência: recursos incluídos no Pro podem ser usados, mas add-ons, excesso de cota e qualquer novo serviço pago continuam dependendo de autorização explícita.

## D-011 — GitHub Pages e domínio próprio para a interface

- Data: 22/08/2026
- Estado: Aceita
- Decisão: hospedar a interface estática no GitHub Pages e usar `omnix.lotusnegocios.com`, preservando o site principal em `lotusnegocios.com`.
- Motivo: o domínio raiz já aponta para GitHub Pages e o subdomínio está disponível na verificação DNS de 22/08/2026.
- Consequência: toda lógica secreta e dinâmica permanece nas Supabase Edge Functions; o navegador recebe apenas a URL e a chave publicável.

## D-012 — Supabase Edge Functions e Cron para o TikTok

- Data: 22/08/2026
- Estado: Aceita
- Decisão: executar OAuth, renovação cifrada de tokens, consulta do criador, envio e acompanhamento do TikTok em Edge Functions; disparar a fila com Supabase Cron.
- Motivo: mantém segredos fora do GitHub Pages e concentra o backend no único serviço pago autorizado.
- Consequência: a publicação real depende do cadastro e da aprovação do aplicativo no TikTok for Developers.

## D-013 — Projeto Supabase compartilhado com o NexLab

- Data: 22/08/2026
- Estado: Aceita
- Decisão: executar o OmniX no projeto Supabase Pro `nexlab` (`jycpsvlnnmbiwscvgdth`) para evitar o custo de um segundo projeto.
- Motivo: o volume inicial é pequeno e o proprietário aceita compartilhar a infraestrutura para concentrar o custo no plano já contratado.
- Consequência: tabelas, tipos, índices, policies, bucket, funções, segredos e job do OmniX recebem nomes exclusivos com `omnix`; a tabela `omnix_profiles` controla adesão explícita. Auth, cotas, disponibilidade, backups e privilégios administrativos continuam compartilhados, portanto uma indisponibilidade, migração incorreta ou vazamento da `service_role` pode afetar os dois produtos.
