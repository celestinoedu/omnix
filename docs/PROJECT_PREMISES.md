# Premissas do projeto

Última atualização: 22 de agosto de 2026.

## Premissa MASTER

**SUPABASE PRO COMO ÚNICO SERVIÇO PAGO.**

O OmniX pode usar os recursos incluídos no Supabase Pro. A interface será hospedada gratuitamente no GitHub Pages e usará um subdomínio de `lotusnegocios.com`. Nenhum outro serviço pago, add-on ou cobrança variável deve ser ativado sem autorização explícita.

Regras derivadas:

- Supabase Pro está autorizado e é o custo recorrente previsto.
- GitHub Pages e eventuais recursos auxiliares devem permanecer em camadas gratuitas.
- Não ativar add-ons do Supabase nem qualquer outro serviço que gere cobrança sem autorização explícita.
- Registrar os limites relevantes do plano Pro antes de depender deles.
- Criar alertas ou travas quando houver risco de exceder cotas incluídas e gerar cobrança variável.

## Produto

- O aplicativo deve ser simples e inspirado na clareza de ferramentas como Publer.
- As redes-alvo iniciais são Instagram, TikTok e YouTube.
- O fluxo principal é conectar, criar, agendar, publicar e acompanhar.
- A interface deve funcionar bem em computador e celular.
- Estados vazios, erros e bloqueios devem explicar o próximo passo em linguagem simples.

## Integrações sociais

- Usar somente APIs oficiais e fluxos OAuth oficiais.
- Respeitar revisão de aplicativo, permissões, cotas e regras de cada plataforma.
- Não usar scraping, armazenamento de senha social ou automação de navegador para publicar.
- Não prometer suporte a formatos que a API oficial da rede não permita.
- A publicação automática pode depender do tipo de conta, aprovação do aplicativo e disponibilidade regional.

## Segurança e privacidade

- Tokens e segredos permanecem exclusivamente no backend.
- Tokens devem ser criptografados em repouso quando a integração real for implementada.
- Solicitar apenas permissões mínimas.
- Validar propriedade de todo post, arquivo e conta conectada no servidor.
- Registrar eventos essenciais sem gravar tokens, legendas privadas ou arquivos em logs.
- O aplicativo deve permitir desconectar uma rede e invalidar seus tokens.

## Experiência do proprietário

- Toda ação que dependa do proprietário recebe instruções clique a clique.
- Guias devem informar exatamente qual botão procurar e o que preencher.
- Credenciais nunca devem ser coladas em conversas, documentos `.md` ou commits.
- Etapas que exigirem análise de Meta, TikTok ou Google devem ser apresentadas como dependências externas, com expectativas realistas.

## Qualidade de engenharia

- TypeScript em modo estrito.
- Dependências auditadas e atualizadas.
- Build de produção validado antes de deploy.
- Mudanças materiais acompanhadas de testes adequados.
- Migrações de banco versionadas.
- Operações de publicação devem ser idempotentes para evitar posts duplicados.
- Arquitetura e estado do projeto devem permanecer documentados nos arquivos indicados por `AGENTS.md`.
