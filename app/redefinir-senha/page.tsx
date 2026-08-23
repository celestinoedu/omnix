"use client";

import { CheckCircle2, LoaderCircle, LockKeyhole } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { OmniXMark } from "@/components/OmniXMark";

export default function RedefinirSenha() {
  const [ready, setReady] = useState(false);
  const [checked, setChecked] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => { setReady(Boolean(data.session)); setChecked(true); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { setReady(Boolean(session)); setChecked(true); });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function savePassword(event: FormEvent) {
    event.preventDefault();
    if (password.length < 8) return setError("A senha precisa ter pelo menos 8 caracteres.");
    if (password !== confirmation) return setError("As duas senhas não são iguais.");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setSaving(true);
    setError("");
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (updateError) return setError("Não foi possível definir a senha. Solicite um novo link e tente novamente.");
    setDone(true);
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <span className="auth-logo"><OmniXMark size={28} /></span>
        <p className="eyebrow">OMNIX SOCIAL</p>
        {done ? (
          <>
            <CheckCircle2 className="auth-success" size={38} />
            <h1>Senha definida</h1>
            <p>Sua senha foi salva e você já está conectado ao OmniX.</p>
            <a className="primary auth-action" href="/">Abrir o OmniX</a>
          </>
        ) : !checked ? (
          <div className="auth-loader"><LoaderCircle className="spin" /><span>Validando o link...</span></div>
        ) : ready ? (
          <>
            <h1>Defina sua senha</h1>
            <p>Use pelo menos 8 caracteres e não reutilize uma senha de outra conta.</p>
            <form onSubmit={savePassword}>
              <label>
                Nova senha
                <span className="auth-input"><LockKeyhole size={18} /><input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /></span>
              </label>
              <label>
                Confirmar senha
                <span className="auth-input"><LockKeyhole size={18} /><input type="password" autoComplete="new-password" minLength={8} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></span>
              </label>
              {error && <p className="auth-error">{error}</p>}
              <button className="primary" type="submit" disabled={saving}>{saving ? <LoaderCircle className="spin" size={18} /> : <LockKeyhole size={18} />} {saving ? "Salvando..." : "Salvar senha"}</button>
            </form>
          </>
        ) : (
          <>
            <h1>Link inválido ou expirado</h1>
            <p>Volte ao login e solicite uma nova recuperação de senha.</p>
            <a className="secondary auth-action" href="/">Voltar ao login</a>
          </>
        )}
      </section>
    </main>
  );
}
