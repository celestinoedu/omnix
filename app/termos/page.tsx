import Link from "next/link";

export default function TermosPage() {
  return <main className="legal-page">
    <Link href="/">← Voltar ao OmniX</Link>
    <article>
      <p className="eyebrow">OMNIX SOCIAL</p>
      <h1>Termos de Uso</h1>
      <p className="legal-date">Atualizados em 22 de agosto de 2026.</p>
      <h2>Uso do serviço</h2>
      <p>O OmniX permite organizar e agendar conteúdo para contas sociais autorizadas pelo próprio usuário. Você deve ter direito de usar a conta, o vídeo, a música, a marca, a legenda e todos os demais elementos enviados.</p>
      <h2>Regras das plataformas</h2>
      <p>O uso do TikTok pelo OmniX depende das APIs oficiais e está sujeito aos termos, políticas de conteúdo, regras de música, limites, revisões e disponibilidade do TikTok. Uma publicação pode ser recusada, moderada, atrasada ou removida pela plataforma.</p>
      <h2>Conteúdo proibido</h2>
      <p>Não use o serviço para conteúdo ilegal, enganoso, abusivo, que viole direitos de terceiros ou que tente contornar proteções das plataformas. Informe corretamente conteúdo comercial, parceria paga e conteúdo gerado por IA quando aplicável.</p>
      <h2>Disponibilidade</h2>
      <p>O serviço pode sofrer interrupções por manutenção, limites de infraestrutura ou mudanças das plataformas. O OmniX registra o resultado disponível, mas não garante alcance, aprovação ou permanência de uma publicação.</p>
      <h2>Encerramento</h2>
      <p>Você pode desconectar a conta social a qualquer momento. O acesso pode ser suspenso em caso de abuso, risco de segurança ou violação destes termos.</p>
      <h2>Contato</h2>
      <p>Dúvidas podem ser enviadas para <a href="mailto:contato@lotusnegocios.com">contato@lotusnegocios.com</a>.</p>
    </article>
  </main>;
}
