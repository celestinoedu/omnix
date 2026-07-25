# OmniX Social — instruções permanentes

Este arquivo é a porta de entrada obrigatória para qualquer nova sessão de trabalho neste repositório.

## Antes de alterar o projeto

Leia, nesta ordem:

1. `docs/PROJECT_CONTEXT.md`
2. `docs/PROJECT_PREMISES.md`
3. `docs/ARCHITECTURE.md`
4. `docs/DECISIONS.md`
5. `docs/PROJECT_STATUS.md`
6. `docs/GUIA-CLIQUE-A-CLIQUE.md` quando a mudança afetar alguma ação do proprietário.

Não presuma que uma funcionalidade demonstrativa está integrada às APIs reais. Confirme o estado em `docs/PROJECT_STATUS.md`.

## Regras permanentes

- A premissa MASTER é **ZERO CUSTO**. Não habilite serviço pago, cobrança, upgrade ou recurso que possa gerar cobrança sem autorização explícita do proprietário.
- Prefira tecnologias com free tier adequado ao MVP. Registre limites e riscos de cobrança.
- O proprietário é não técnico. Toda configuração exigida dele deve receber instruções clique a clique, em português e sem depender de conhecimento prévio.
- Use apenas APIs oficiais para Instagram, TikTok e YouTube. Não use automação de navegador, scraping ou métodos que coloquem contas em risco.
- Tokens OAuth, client secrets e chaves nunca podem ir para o navegador, Git ou arquivos versionados.
- Preserve a interface simples, responsiva e acessível.
- Diferencie claramente: implementado, simulado, planejado, bloqueado por terceiro e dependente do proprietário.
- Antes de concluir uma mudança, execute validações proporcionais: build, auditoria de dependências e testes relevantes.

## Atualização obrigatória da memória

Toda mudança material deve atualizar, no mesmo trabalho:

- `docs/ARCHITECTURE.md` se alterar componentes, integrações, dados ou infraestrutura.
- `docs/DECISIONS.md` se houver uma nova decisão ou mudança de direção.
- `docs/PROJECT_STATUS.md` se alterar o que funciona, a etapa atual ou o próximo passo.
- `docs/PROJECT_PREMISES.md` apenas quando o proprietário mudar uma premissa.
- `docs/GUIA-CLIQUE-A-CLIQUE.md` se o proprietário precisar executar algo novo.

Nunca apague o histórico de decisões. Marque decisões substituídas e aponte para a decisão nova.

## Definição de pronto

Uma tarefa só está pronta quando:

- O comportamento solicitado foi implementado ou o bloqueio externo está documentado.
- Não existem segredos versionados.
- Build e verificações relevantes passaram.
- A documentação de memória está coerente com o código.
- O proprietário recebeu orientações simples para qualquer ação que dependa dele.
