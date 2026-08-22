"use client";

import { CheckCircle2, LoaderCircle, Mail, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function AuthGate() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setSending(true);
    setError("");
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
        shouldCreateUser: false,
      },
    });
    setSending(false);

    if (authError) {
      setError("Acesso não liberado para este e-mail. Confira o endereço ou fale com o administrador.");
      return;
    }

    setSent(true);
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <span className="auth-logo"><Sparkles size={24} /></span>
        <p className="eyebrow">OMNIX SOCIAL</p>
        {sent ? (
          <>
            <CheckCircle2 className="auth-success" size={38} />
            <h1>Confira seu e-mail</h1>
            <p>Enviamos um link seguro para <strong>{email}</strong>. Clique nele para entrar.</p>
            <button className="secondary auth-back" onClick={() => setSent(false)}>Usar outro e-mail</button>
          </>
        ) : (
          <>
            <h1>Bem-vindo ao OmniX</h1>
            <p>Entre com seu e-mail. Você não precisa criar ou memorizar uma senha.</p>
            <form onSubmit={handleSubmit}>
              <label>
                Seu e-mail
                <span className="auth-input"><Mail size={18} /><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@exemplo.com" /></span>
              </label>
              {error && <p className="auth-error">{error}</p>}
              <button className="primary" type="submit" disabled={sending}>
                {sending ? <LoaderCircle className="spin" size={18} /> : <Mail size={18} />}
                {sending ? "Enviando..." : "Enviar link de acesso"}
              </button>
            </form>
            <small>Seu acesso é protegido pelo Supabase Auth. Nenhuma senha social é solicitada.<br /><a href="/privacidade/">Privacidade</a> · <a href="/termos/">Termos de uso</a></small>
          </>
        )}
      </section>
    </main>
  );
}
