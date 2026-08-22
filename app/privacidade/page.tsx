import Link from "next/link";

export default function PrivacidadePage() {
  return <main className="legal-page">
    <Link href="/">← Voltar ao OmniX</Link>
    <article>
      <p className="eyebrow">OMNIX SOCIAL</p>
      <h1>Política de Privacidade</h1>
      <p className="legal-date">Atualizada em 22 de agosto de 2026.</p>
      <h2>Quais dados usamos</h2>
      <p>O OmniX usa seu e-mail para autenticação e, quando você autoriza o TikTok, recebe o identificador e o nome público da conta, permissões concedidas e tokens necessários para publicar. Também armazena os vídeos, legendas, datas, opções de publicação e resultados que você cria no aplicativo.</p>
      <h2>Para que usamos</h2>
      <p>Usamos esses dados somente para autenticar seu acesso, exibir sua conta conectada, guardar agendamentos, enviar o conteúdo escolhido ao TikTok e mostrar se a publicação foi concluída ou falhou.</p>
      <h2>Onde ficam armazenados</h2>
      <p>Dados e mídias ficam no Supabase. Tokens sociais permanecem cifrados no backend e nunca são enviados ao navegador ou ao GitHub Pages. O TikTok processa os dados conforme as próprias políticas quando você autoriza e publica.</p>
      <h2>Compartilhamento e retenção</h2>
      <p>Não vendemos dados pessoais. Compartilhamos conteúdo apenas com os provedores necessários para executar o serviço. Mantemos os dados enquanto sua conta ou os agendamentos estiverem ativos, salvo obrigação legal ou solicitação válida de exclusão.</p>
      <h2>Seus controles</h2>
      <p>Você pode desconectar o TikTok no OmniX, revogar o acesso nas configurações do TikTok e solicitar acesso, correção ou exclusão dos seus dados.</p>
      <h2>Contato</h2>
      <p>Para assuntos de privacidade, escreva para <a href="mailto:contato@lotusnegocios.com">contato@lotusnegocios.com</a>.</p>
    </article>
  </main>;
}
