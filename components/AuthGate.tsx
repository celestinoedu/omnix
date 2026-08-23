"use client";

import { CheckCircle2, KeyRound, LoaderCircle, LockKeyhole, LogIn, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { OmniXMark } from "@/components/OmniXMark";

export function AuthGate() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setLoading(true);
    setError("");
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (authError) setError("E-mail ou senha incorretos. Se ainda não possui senha, use a opção abaixo.");
  }

  async function requestPassword() {
    if (!email) {
      setError("Informe seu e-mail antes de criar ou recuperar a senha.");
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setLoading(true);
    setError("");
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha/`,
    });
    setLoading(false);

    if (resetError) {
      setError("Não foi possível enviar a recuperação agora. Confira o e-mail e tente novamente.");
      return;
    }
    setRecoverySent(true);
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <span className="auth-logo"><OmniXMark size={28} /></span>
        <p className="eyebrow">OMNIX SOCIAL</p>
        {recoverySent ? (
          <>
            <CheckCircle2 className="auth-success" size={38} />
            <h1>Confira seu e-mail</h1>
            <p>Enviamos a definição de senha para <strong>{email}</strong>. Esse link é usado somente para criar ou trocar sua senha.</p>
            <button className="secondary auth-back" onClick={() => setRecoverySent(false)}>Voltar ao login</button>
          </>
        ) : (
          <>
            <h1>Bem-vindo ao OmniX</h1>
            <p>Entre com seu e-mail e sua senha.</p>
            <form onSubmit={handleSubmit}>
              <label>
                Seu e-mail
                <span className="auth-input"><Mail size={18} /><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@exemplo.com" /></span>
              </label>
              <label>
                Sua senha
                <span className="auth-input"><LockKeyhole size={18} /><input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Digite sua senha" /></span>
              </label>
              {error && <p className="auth-error">{error}</p>}
              <button className="primary" type="submit" disabled={loading}>
                {loading ? <LoaderCircle className="spin" size={18} /> : <LogIn size={18} />}
                {loading ? "Entrando..." : "Entrar"}
              </button>
              <button className="auth-link" type="button" onClick={requestPassword} disabled={loading}>
                <KeyRound size={15} /> Criar ou recuperar senha
              </button>
            </form>
            <small>Seu acesso é protegido pelo Supabase Auth. Nenhuma senha social é solicitada.<br /><a href="/privacidade/">Privacidade</a> · <a href="/termos/">Termos de uso</a></small>
          </>
        )}
      </section>
    </main>
  );
}
