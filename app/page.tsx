"use client";

import {
  CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Clock3,
  Home, Instagram, LayoutGrid, LoaderCircle, Menu, MoreHorizontal, Plus, Search,
  Settings, Sparkles, Trash2, UploadCloud, Video, X, Youtube,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { AuthGate } from "@/components/AuthGate";
import { OmniXMark } from "@/components/OmniXMark";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

type Network = "Instagram" | "TikTok" | "YouTube";
type Status = "Agendado" | "Processando" | "Publicado" | "Falhou" | "Rascunho";
type Post = { id: string; title: string; network: Network; scheduledAt: string; status: Status; color: string };
type TikTokAccount = { id: string; display_name: string; status: string };
type PostPreview = {
  caption: string; accountName: string; privacy: string; publishedAt: string | null;
  errorCode: string | null; errorMessage: string | null; videoUrl: string;
  originalName: string; duration: number | null; width: number | null; height: number | null;
};
type CreatorInfo = {
  creator_nickname: string; creator_username: string; privacy_level_options: string[];
  comment_disabled: boolean; duet_disabled: boolean; stitch_disabled: boolean;
  max_video_post_duration_sec: number;
};

const colors = ["sun", "sky", "violet", "peach", "mint", "rose"];
const weekDays = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];
const privacyLabels: Record<string, string> = {
  PUBLIC_TO_EVERYONE: "Todos", MUTUAL_FOLLOW_FRIENDS: "Amigos",
  FOLLOWER_OF_CREATOR: "Seguidores", SELF_ONLY: "Somente eu",
};
const isTikTokAudited = process.env.NEXT_PUBLIC_TIKTOK_AUDITED === "true";
const seedPosts: Post[] = [{ id: "demo-1", title: "POV: você descobriu esse truque", network: "TikTok", scheduledAt: new Date(Date.now() + 86400000).toISOString(), status: "Agendado", color: "sky" }];

function NetworkIcon({ network, size = 16 }: { network: Network; size?: number }) {
  if (network === "Instagram") return <Instagram size={size} />;
  if (network === "YouTube") return <Youtube size={size} />;
  return <Video size={size} />;
}

function monthCells(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const leading = (first.getDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(month.getFullYear(), month.getMonth(), index - leading + 1);
    return { date, currentMonth: date.getMonth() === month.getMonth() };
  });
}

function sameLocalDay(iso: string, date: Date) {
  const value = new Date(iso);
  return value.getFullYear() === date.getFullYear() && value.getMonth() === date.getMonth() && value.getDate() === date.getDate();
}

function localDateTimeValue(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function displayStatus(postStatus: string, destinationStatus?: string): Status {
  const status = destinationStatus || postStatus;
  if (status === "published") return "Publicado";
  if (status === "processing") return "Processando";
  if (status === "failed" || postStatus === "failed") return "Falhou";
  if (postStatus === "draft") return "Rascunho";
  return "Agendado";
}

async function readVideoMetadata(file: File) {
  return new Promise<{ duration: number; width: number; height: number }>((resolve, reject) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const result = { duration: video.duration, width: video.videoWidth, height: video.videoHeight };
      URL.revokeObjectURL(objectUrl); resolve(result);
    };
    video.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Vídeo inválido.")); };
    video.src = objectUrl;
  });
}

export default function Dashboard() {
  const [posts, setPosts] = useState<Post[]>(isSupabaseConfigured ? [] : seedPosts);
  const [filter, setFilter] = useState<"Todas" | Network>("Todas");
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [composerOpen, setComposerOpen] = useState(false);
  const [connectionsOpen, setConnectionsOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toast, setToast] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured);
  const [membershipLoading, setMembershipLoading] = useState(isSupabaseConfigured);
  const [hasAccess, setHasAccess] = useState(!isSupabaseConfigured);
  const [dataLoading, setDataLoading] = useState(false);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [previewPost, setPreviewPost] = useState<Post | null>(null);
  const [previewDetails, setPreviewDetails] = useState<PostPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [tiktokAccount, setTikTokAccount] = useState<TikTokAccount | null>(null);
  const [creator, setCreator] = useState<CreatorInfo | null>(null);
  const [commercial, setCommercial] = useState(false);
  const [brandedContent, setBrandedContent] = useState(false);

  const showToast = useCallback((message: string) => {
    setToast(message); window.setTimeout(() => setToast(""), 4500);
  }, []);

  const loadAccounts = useCallback(async () => {
    const supabase = getSupabaseBrowserClient(); if (!supabase) return;
    const { data } = await supabase.from("omnix_social_accounts").select("id,display_name,status").eq("platform", "TikTok").eq("status", "active").limit(1).maybeSingle();
    setTikTokAccount(data as TikTokAccount | null);
  }, []);

  const loadPosts = useCallback(async () => {
    const supabase = getSupabaseBrowserClient(); if (!supabase) return;
    setDataLoading(true);
    const { data, error } = await supabase.from("omnix_posts").select("id,title,scheduled_at_utc,status,omnix_post_destinations(platform,status)").order("scheduled_at_utc", { ascending: true });
    if (error) showToast("Não foi possível carregar os posts.");
    else setPosts((data ?? []).map((item, index) => {
      const destination = Array.isArray(item.omnix_post_destinations) ? item.omnix_post_destinations[0] : item.omnix_post_destinations;
      const status = displayStatus(item.status, destination?.status);
      return { id: item.id, title: item.title, network: (destination?.platform ?? "TikTok") as Network, scheduledAt: item.scheduled_at_utc, status, color: colors[index % colors.length] };
    }));
    setDataLoading(false);
  }, [showToast]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const saved = localStorage.getItem("omnix-posts"); if (saved) setPosts(JSON.parse(saved)); return;
    }
    const supabase = getSupabaseBrowserClient(); if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); setAuthLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { setUser(session?.user ?? null); setAuthLoading(false); });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setHasAccess(false); setMembershipLoading(false); return; }
    const supabase = getSupabaseBrowserClient(); if (!supabase) return;
    setMembershipLoading(true);
    supabase.from("omnix_profiles").select("id").eq("user_id", user.id).maybeSingle().then(async ({ data }) => {
      const allowed = Boolean(data);
      setHasAccess(allowed); setMembershipLoading(false);
      if (!allowed) return;
      await Promise.all([loadPosts(), loadAccounts()]);
      const result = new URLSearchParams(window.location.search).get("tiktok");
      if (result) {
        const messages: Record<string, string> = { connected: "Conta TikTok conectada com sucesso!", denied: "A autorização do TikTok foi cancelada.", missing_scope: "O TikTok não liberou a permissão para publicar.", invalid_state: "A conexão expirou. Tente novamente.", error: "Não foi possível concluir a conexão com o TikTok." };
        showToast(messages[result] ?? "Retorno do TikTok recebido.");
        window.history.replaceState({}, "", window.location.pathname);
      }
    });
  }, [user, loadPosts, loadAccounts, showToast]);

  const visiblePosts = useMemo(() => posts.filter(post => filter === "Todas" || post.network === filter), [posts, filter]);
  const cells = useMemo(() => monthCells(calendarMonth), [calendarMonth]);
  const postsInMonth = visiblePosts.filter(post => { const date = new Date(post.scheduledAt); return date.getFullYear() === calendarMonth.getFullYear() && date.getMonth() === calendarMonth.getMonth(); }).length;
  const monthLabel = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(calendarMonth);

  async function connectTikTok() {
    const supabase = getSupabaseBrowserClient(); if (!supabase) return;
    setConnectionLoading(true);
    const { data, error } = await supabase.functions.invoke("tiktok-auth", { body: { action: "start" } });
    setConnectionLoading(false);
    if (error || !data?.authorizationUrl) return showToast(data?.error || "A integração TikTok ainda não está configurada no servidor.");
    window.location.assign(data.authorizationUrl);
  }

  async function disconnectTikTok() {
    const supabase = getSupabaseBrowserClient(); if (!supabase) return;
    setConnectionLoading(true);
    const { error } = await supabase.functions.invoke("tiktok-auth", { body: { action: "disconnect" } });
    setConnectionLoading(false);
    if (error) return showToast("Não foi possível desconectar a conta TikTok.");
    await loadAccounts(); showToast("Conta TikTok desconectada.");
  }

  async function openComposer() {
    if (!isSupabaseConfigured) { setComposerOpen(true); return; }
    if (!tiktokAccount) { setConnectionsOpen(true); showToast("Conecte sua conta TikTok antes de agendar."); return; }
    const supabase = getSupabaseBrowserClient(); if (!supabase) return;
    setDataLoading(true);
    const { data, error } = await supabase.functions.invoke("tiktok-creator-info");
    setDataLoading(false);
    if (error || !data?.creator) return showToast(data?.error || "Não foi possível consultar as opções da conta TikTok.");
    setCreator(data.creator); setCommercial(false); setBrandedContent(false); setComposerOpen(true);
  }

  async function savePost(form: FormData) {
    const title = String(form.get("title") || "").trim();
    const scheduledValue = String(form.get("scheduledAt") || "");
    const mediaFile = form.get("media");
    if (!title || !scheduledValue) return showToast("Preencha a legenda e a data do post.");

    if (isSupabaseConfigured && user) {
      if (!tiktokAccount || !creator) return showToast("Conecte e consulte sua conta TikTok novamente.");
      if (!(mediaFile instanceof File) || mediaFile.size === 0) return showToast("Escolha um vídeo para o TikTok.");
      if (mediaFile.size > 50 * 1024 * 1024) return showToast("O vídeo deve ter no máximo 50 MB.");
      if (!["video/mp4", "video/quicktime", "video/webm"].includes(mediaFile.type)) return showToast("Use um vídeo MP4, MOV ou WEBM.");
      const scheduledAt = new Date(scheduledValue);
      if (!Number.isFinite(scheduledAt.getTime()) || scheduledAt.getTime() <= Date.now()) return showToast("Escolha uma data e horário futuros.");
      const privacy = String(form.get("privacy") || "");
      if (!privacy) return showToast("Escolha manualmente quem poderá ver o post.");
      if (!isTikTokAudited && privacy !== "SELF_ONLY") return showToast("Durante a homologação, a privacidade deve ser Somente eu.");
      const brandOrganic = form.get("brandOrganic") === "on";
      const brandContent = form.get("brandContent") === "on";
      if (commercial && !brandOrganic && !brandContent) return showToast("Informe se o conteúdo promove sua marca, outra marca ou ambas.");
      if (brandContent && privacy === "SELF_ONLY") return showToast("Parceria paga não pode usar a privacidade Somente eu.");
      if (form.get("consent") !== "on") return showToast("Confirme a declaração de uso de música do TikTok.");

      if (savingRef.current) return;
      savingRef.current = true;
      setSaving(true);
      const supabase = getSupabaseBrowserClient(); if (!supabase) return;
      let storagePath = "";
      let mediaAssetId = "";
      try {
        const metadata = await readVideoMetadata(mediaFile);
        if (metadata.duration > creator.max_video_post_duration_sec) throw new Error(`Este vídeo excede o limite de ${creator.max_video_post_duration_sec} segundos da conta.`);
        if (metadata.width < 360 || metadata.height < 360 || metadata.width > 4096 || metadata.height > 4096) throw new Error("O vídeo deve ter largura e altura entre 360 e 4096 pixels.");
        storagePath = `${user.id}/${crypto.randomUUID()}-${mediaFile.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
        const { error: uploadError } = await supabase.storage.from("omnix-post-media").upload(storagePath, mediaFile, { contentType: mediaFile.type, upsert: false });
        if (uploadError) throw new Error("Não foi possível enviar o vídeo.");
        const { data: asset, error: assetError } = await supabase.from("omnix_media_assets").insert({ user_id: user.id, storage_path: storagePath, original_name: mediaFile.name, mime_type: mediaFile.type, size_bytes: mediaFile.size, duration_seconds: metadata.duration, width: metadata.width, height: metadata.height }).select("id").single();
        if (assetError || !asset) throw new Error("Não foi possível registrar o vídeo.");
        mediaAssetId = asset.id;
        const { data: post, error: postError } = await supabase.from("omnix_posts").insert({ user_id: user.id, media_asset_id: asset.id, title: title.slice(0, 200), caption: title.slice(0, 2200), scheduled_at_utc: scheduledAt.toISOString(), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo", status: "scheduled" }).select("id").single();
        if (postError || !post) throw new Error("Não foi possível salvar o agendamento.");
        const { error: destinationError } = await supabase.from("omnix_post_destinations").insert({
          post_id: post.id, social_account_id: tiktokAccount.id, platform: "TikTok", status: "pending",
          platform_options: { privacy_level: privacy, allow_comment: form.get("allowComment") === "on", allow_duet: form.get("allowDuet") === "on", allow_stitch: form.get("allowStitch") === "on", brand_organic: brandOrganic, brand_content: brandContent, is_aigc: form.get("isAigc") === "on", consent_at: new Date().toISOString() },
        });
        if (destinationError) { await supabase.from("omnix_posts").delete().eq("id", post.id); throw new Error("Não foi possível preparar o destino TikTok."); }
        await loadPosts(); setComposerOpen(false); showToast("Post do TikTok agendado com sucesso!");
      } catch (error) {
        if (mediaAssetId) await supabase.from("omnix_media_assets").delete().eq("id", mediaAssetId);
        if (storagePath) await supabase.storage.from("omnix-post-media").remove([storagePath]);
        showToast(error instanceof Error ? error.message : "Não foi possível agendar o post.");
      } finally { savingRef.current = false; setSaving(false); }
      return;
    }

    const newPost: Post = { id: String(Date.now()), title, network: "TikTok", scheduledAt: new Date(scheduledValue).toISOString(), status: "Agendado", color: colors[posts.length % colors.length] };
    const next = [...posts, newPost]; setPosts(next); localStorage.setItem("omnix-posts", JSON.stringify(next)); setComposerOpen(false); showToast("Demonstração salva neste navegador.");
  }

  async function deleteScheduledPost(post: Post) {
    if (!(["Agendado", "Falhou"] as Status[]).includes(post.status) || deletingPostId) return;
    if (!window.confirm(`Excluir o agendamento “${post.title}”?`)) return;
    const supabase = getSupabaseBrowserClient(); if (!supabase) return;
    setDeletingPostId(post.id);
    try {
      const { data, error } = await supabase.rpc("omnix_delete_scheduled_post", { target_post_id: post.id });
      const result = Array.isArray(data) ? data[0] : data;
      if (error || !result?.deleted) {
        await loadPosts();
        return showToast("Este post já está sendo processado ou publicado e não pode mais ser excluído.");
      }
      if (result.storage_path) await supabase.storage.from("omnix-post-media").remove([result.storage_path]);
      await loadPosts();
      showToast("Agendamento e vídeo excluídos.");
    } finally {
      setDeletingPostId(null);
    }
  }

  async function openPostPreview(post: Post) {
    setPreviewPost(post); setPreviewDetails(null); setPreviewLoading(true);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setPreviewLoading(false); return; }
    const { data, error } = await supabase.from("omnix_posts").select("id,title,caption,scheduled_at_utc,status,omnix_media_assets(storage_path,original_name,duration_seconds,width,height),omnix_post_destinations(status,published_at,last_error_code,last_error_message,platform_options,omnix_social_accounts(display_name))").eq("id", post.id).single();
    if (error || !data) {
      setPreviewLoading(false); setPreviewPost(null); return showToast("Não foi possível carregar os detalhes deste post.");
    }
    const destination = Array.isArray(data.omnix_post_destinations) ? data.omnix_post_destinations[0] : data.omnix_post_destinations;
    const account = Array.isArray(destination?.omnix_social_accounts) ? destination?.omnix_social_accounts[0] : destination?.omnix_social_accounts;
    const media = Array.isArray(data.omnix_media_assets) ? data.omnix_media_assets[0] : data.omnix_media_assets;
    let videoUrl = "";
    if (media?.storage_path) {
      const { data: signed } = await supabase.storage.from("omnix-post-media").createSignedUrl(media.storage_path, 10 * 60);
      videoUrl = signed?.signedUrl || "";
    }
    const currentStatus = displayStatus(data.status, destination?.status);
    setPreviewPost({ ...post, status: currentStatus });
    setPreviewDetails({
      caption: data.caption || data.title, accountName: account?.display_name || "TikTok",
      privacy: String(destination?.platform_options?.privacy_level || ""), publishedAt: destination?.published_at || null,
      errorCode: destination?.last_error_code || null, errorMessage: destination?.last_error_message || null,
      videoUrl, originalName: media?.original_name || "Vídeo indisponível", duration: media?.duration_seconds ?? null,
      width: media?.width ?? null, height: media?.height ?? null,
    });
    setPreviewLoading(false);
    await loadPosts();
  }

  async function signOut() { await getSupabaseBrowserClient()?.auth.signOut(); }
  if (authLoading || (isSupabaseConfigured && user && membershipLoading)) return <main className="auth-page"><div className="auth-loader"><Sparkles /><span>Preparando seu espaço...</span></div></main>;
  if (isSupabaseConfigured && !user) return <AuthGate />;
  if (isSupabaseConfigured && user && !hasAccess) return <main className="auth-page"><section className="auth-card"><span className="auth-logo"><OmniXMark size={28} /></span><p className="eyebrow">OMNIX SOCIAL</p><h1>Acesso ainda não liberado</h1><p>Seu login é válido, mas este e-mail ainda não foi autorizado para usar o OmniX.</p><button className="secondary auth-back" onClick={signOut}>Sair</button></section></main>;

  const connectedCount = tiktokAccount ? 1 : 0;
  return (
    <main className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "open" : ""}`}>
        <div className="brand"><span className="brand-mark"><OmniXMark size={23} /></span><span>OmniX</span><button className="mobile-close" onClick={() => setMobileMenu(false)} aria-label="Fechar menu"><X /></button></div>
        <nav><a className="active" href="#"><Home /> Visão geral</a><a href="#calendario"><CalendarDays /> Calendário</a><a href="#conteudos"><LayoutGrid /> Conteúdos <span className="nav-count">{posts.length}</span></a><button onClick={() => setConnectionsOpen(true)}><UploadCloud /> Conexões <span className="nav-count">{connectedCount}</span></button></nav>
        <div className="sidebar-bottom"><a href="#ajuda"><CircleHelp /> Central de ajuda</a><a href="#config"><Settings /> Configurações</a><div className="profile"><div className="avatar">{user?.email?.slice(0, 2).toUpperCase() ?? "MS"}</div><div><strong>{user?.email?.split("@")[0] ?? "Marina Silva"}</strong><small>{isSupabaseConfigured ? "Dados sincronizados" : "Modo demonstração"}</small></div>{user ? <button className="profile-more" onClick={signOut} title="Sair"><MoreHorizontal size={18} /></button> : <MoreHorizontal size={18} />}</div></div>
      </aside>
      <section className="content">
        <header className="topbar"><button className="menu-button" onClick={() => setMobileMenu(true)} aria-label="Abrir menu"><Menu /></button><div className="search"><Search size={18} /><input aria-label="Buscar conteúdo" placeholder="Buscar conteúdo..." /><kbd>⌘ K</kbd></div><div className="top-actions"><button className="icon-button" aria-label="Ajuda"><CircleHelp size={20} /></button><button className="primary" onClick={openComposer} disabled={dataLoading}><Plus size={18} /> Criar post</button></div></header>
        <div className="workspace">
          <div className="welcome-row"><div><p className="eyebrow">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "full" }).format(new Date()).toUpperCase()}</p><h1>Olá, {user?.email?.split("@")[0] ?? "Marina"} <span>👋</span></h1><p>Agende seus vídeos no TikTok, sem complicação.</p></div><button className="secondary" onClick={() => setConnectionsOpen(true)}><span className={`status-dot ${connectedCount ? "" : "offline"}`} /> {connectedCount ? "TikTok conectado" : "Conectar TikTok"} <ChevronDown size={16} /></button></div>
          <section className="stats-grid"><article><div className="stat-icon blue"><CalendarDays /></div><div><span>Agendados</span><strong>{posts.filter(p => p.status === "Agendado").length}</strong><small>Na fila</small></div></article><article><div className="stat-icon green"><Check /></div><div><span>Publicados</span><strong>{posts.filter(p => p.status === "Publicado").length}</strong><small>Confirmados pelo TikTok</small></div></article><article><div className="stat-icon amber"><Clock3 /></div><div><span>Processando</span><strong>{posts.filter(p => p.status === "Processando").length}</strong><small>Enviados ao TikTok</small></div></article></section>
          <section className="calendar-card" id="calendario"><div className="calendar-header"><div><div className="month-nav"><h2 className="capitalize">{monthLabel}</h2><button aria-label="Mês anterior" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}><ChevronLeft /></button><button aria-label="Próximo mês" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}><ChevronRight /></button><button className="today" onClick={() => setCalendarMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}>Hoje</button></div><p>{dataLoading ? "Carregando conteúdos..." : `${postsInMonth} conteúdos neste calendário`}</p></div><div className="filters">{(["Todas", "TikTok"] as const).map(item => <button key={item} className={filter === item ? "selected" : ""} onClick={() => setFilter(item)}>{item !== "Todas" && <NetworkIcon network={item} />} {item}</button>)}</div></div>
            <div className="calendar">{weekDays.map(day => <div className="weekday" key={day}>{day}</div>)}{cells.map(({ date, currentMonth }, index) => { const dayPosts = visiblePosts.filter(post => sameLocalDay(post.scheduledAt, date)); const today = sameLocalDay(new Date().toISOString(), date); return <div className={`day ${currentMonth ? "" : "muted"} ${today ? "current" : ""}`} key={index}><span className="day-number">{date.getDate()}</span>{dayPosts.map(post => <button className={`post ${post.color}`} key={post.id} title={`${post.title} — ${post.status}. Clique para visualizar.`} onClick={() => openPostPreview(post)}><span className="post-network"><NetworkIcon network={post.network} size={13} /> {new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(post.scheduledAt))}</span><strong>{post.title}</strong></button>)}{currentMonth && <button className="quick-add" onClick={openComposer} aria-label={`Adicionar no dia ${date.getDate()}`}><Plus size={14} /></button>}</div>; })}</div>
          </section>
          <section className="bottom-grid" id="conteudos"><article className="upcoming"><div className="section-title"><div><h3>Posts recentes</h3><p>Agendamentos e tentativas do TikTok.</p></div></div>{posts.filter(p => p.status === "Agendado" || p.status === "Processando" || p.status === "Falhou").slice(0, 6).map(post => <div className="queue-item" key={post.id}><div className={`thumb ${post.color}`}><NetworkIcon network={post.network} size={22} /></div><div className="queue-copy"><strong>{post.title}</strong><span><NetworkIcon network={post.network} size={13} /> {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(post.scheduledAt))}</span></div><span className={`scheduled ${post.status === "Falhou" ? "failed" : ""}`}>{post.status}</span>{(["Agendado", "Falhou"] as Status[]).includes(post.status) && <button className="delete-schedule" type="button" onClick={() => deleteScheduledPost(post)} disabled={deletingPostId === post.id} title="Excluir post" aria-label={`Excluir post ${post.title}`}>{deletingPostId === post.id ? <LoaderCircle className="spin" size={16} /> : <Trash2 size={16} />}</button>}</div>)}{!posts.length && <p className="empty-copy">Nenhum post agendado ainda.</p>}</article><article className="tip-card"><span className="tip-art"><Sparkles /></span><div><span className="mini-label">TIKTOK OFICIAL</span><h3>Seu vídeo, no horário certo.</h3><p>O OmniX usa a Content Posting API e confirma o resultado após o processamento.</p></div></article></section>
        </div>
      </section>

      {composerOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => !saving && setComposerOpen(false)}><div className="modal composer-modal" role="dialog" aria-modal="true" aria-labelledby="composer-title" onMouseDown={event => event.stopPropagation()}><div className="modal-head"><div><span className="mini-label">NOVO VÍDEO</span><h2 id="composer-title">Agendar no TikTok</h2><p>{creator ? `Publicando como ${creator.creator_nickname || creator.creator_username}` : "Modo demonstração"}</p></div><button onClick={() => setComposerOpen(false)} disabled={saving} aria-label="Fechar"><X /></button></div><form action={savePost}>
        <label>Legenda<textarea name="title" required maxLength={2200} placeholder="Escreva sua legenda e hashtags..." /></label>
        <div className="form-row tiktok-row"><label>Data e horário<input name="scheduledAt" type="datetime-local" min={localDateTimeValue(new Date(Date.now() + 60 * 1000))} defaultValue={localDateTimeValue(new Date(Date.now() + 5 * 60 * 1000))} required /></label><label>Quem pode assistir?<select name="privacy" defaultValue="" required><option value="" disabled>Escolha manualmente</option>{(creator?.privacy_level_options ?? ["SELF_ONLY"]).filter(option => isTikTokAudited || option === "SELF_ONLY").map(option => <option value={option} key={option}>{privacyLabels[option] ?? option}</option>)}</select></label></div>
        <label className="upload-zone"><UploadCloud /><strong>Escolha o vídeo</strong><span>MP4, MOV ou WEBM · até 50 MB · 360 a 4096 px</span><input name="media" type="file" required={isSupabaseConfigured} accept="video/mp4,video/quicktime,video/webm" /></label>
        {creator && <fieldset className="tiktok-options"><legend>Interações</legend><label className="check-label"><input name="allowComment" type="checkbox" disabled={creator.comment_disabled} /> Permitir comentários</label><label className="check-label"><input name="allowDuet" type="checkbox" disabled={creator.duet_disabled} /> Permitir Dueto</label><label className="check-label"><input name="allowStitch" type="checkbox" disabled={creator.stitch_disabled} /> Permitir Costura</label><small>Nenhuma opção vem marcada; você mantém o controle.</small></fieldset>}
        <fieldset className="tiktok-options"><legend>Declarações</legend><label className="check-label"><input type="checkbox" checked={commercial} onChange={event => setCommercial(event.target.checked)} /> Este conteúdo promove uma marca, produto ou serviço</label>{commercial && <div className="nested-options"><label className="check-label"><input name="brandOrganic" type="checkbox" /> Minha marca — conteúdo promocional</label><label className="check-label"><input name="brandContent" type="checkbox" checked={brandedContent} onChange={event => setBrandedContent(event.target.checked)} /> Outra marca — parceria paga</label></div>}<label className="check-label"><input name="isAigc" type="checkbox" /> Conteúdo gerado por IA</label><label className="check-label consent"><input name="consent" type="checkbox" required /> Ao agendar, concordo com a Confirmação de Uso de Música{brandedContent ? " e a Política de Conteúdo de Marca" : ""} do TikTok.</label></fieldset>
        {!isTikTokAudited && isSupabaseConfigured && <p className="demo-note"><CircleHelp size={16} /> Durante a homologação, o TikTok restringe os posts a “Somente eu”. Após a auditoria, as opções públicas serão liberadas.</p>}
        <p className="processing-note">O envio começa no horário agendado. O TikTok pode levar alguns minutos para processar e exibir o vídeo.</p><div className="modal-actions"><button type="button" className="secondary" onClick={() => setComposerOpen(false)} disabled={saving}>Cancelar</button><button type="submit" className="primary" disabled={saving}>{saving ? <LoaderCircle className="spin" size={17} /> : <CalendarDays size={17} />} {saving ? "Salvando..." : "Agendar post"}</button></div>
      </form></div></div>}

      {connectionsOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setConnectionsOpen(false)}><div className="modal connections-modal" role="dialog" aria-modal="true" onMouseDown={event => event.stopPropagation()}><div className="modal-head"><div><span className="mini-label">CANAIS</span><h2>Suas conexões</h2><p>Autorize a conta que receberá os vídeos agendados.</p></div><button onClick={() => setConnectionsOpen(false)} aria-label="Fechar"><X /></button></div><div className="connection-list">
        <div className="connection"><span className="network-logo tiktok"><Video size={22} /></span><div><strong>TikTok</strong><small>{tiktokAccount ? `${tiktokAccount.display_name} · Conectado pela API oficial` : "Nenhuma conta conectada"}</small></div><button className={tiktokAccount ? "disconnect" : "primary"} onClick={tiktokAccount ? disconnectTikTok : connectTikTok} disabled={connectionLoading}>{connectionLoading ? <LoaderCircle className="spin" size={16} /> : tiktokAccount ? "Desconectar" : "Conectar"}</button></div>
        {(["Instagram", "YouTube"] as Network[]).map(network => <div className="connection unavailable" key={network}><span className={`network-logo ${network.toLowerCase()}`}><NetworkIcon network={network} size={22} /></span><div><strong>{network}</strong><small>Integração planejada para uma próxima etapa</small></div><span className="soon">Em breve</span></div>)}
      </div><p className="demo-note"><CircleHelp size={16} /> O OmniX nunca pede sua senha do TikTok. A autorização acontece no site oficial e pode ser revogada a qualquer momento.</p></div></div>}
      {previewPost && <div className="modal-backdrop" role="presentation" onMouseDown={() => setPreviewPost(null)}><div className="modal preview-modal" role="dialog" aria-modal="true" aria-labelledby="preview-title" onMouseDown={event => event.stopPropagation()}><div className="modal-head"><div><span className="mini-label">DETALHES DO POST</span><h2 id="preview-title">{previewPost.title}</h2><p>{previewDetails?.accountName || "Carregando conta..."}</p></div><button onClick={() => setPreviewPost(null)} aria-label="Fechar"><X /></button></div>{previewLoading ? <div className="preview-loading"><LoaderCircle className="spin" /><span>Carregando preview...</span></div> : previewDetails && <div className="preview-content"><div className="video-preview">{previewDetails.videoUrl ? <video src={previewDetails.videoUrl} controls preload="metadata" /> : <div className="video-unavailable"><Video /><span>Preview indisponível</span></div>}</div><div className="preview-summary"><div className={`preview-status status-${previewPost.status.toLowerCase()}`}><span />{previewPost.status}</div><dl><div><dt>Conta</dt><dd>{previewDetails.accountName}</dd></div><div><dt>Agendado para</dt><dd>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(previewPost.scheduledAt))}</dd></div>{previewDetails.publishedAt && <div><dt>Publicado em</dt><dd>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(previewDetails.publishedAt))}</dd></div>}<div><dt>Privacidade</dt><dd>{privacyLabels[previewDetails.privacy] || previewDetails.privacy || "Não informada"}</dd></div><div><dt>Arquivo</dt><dd>{previewDetails.originalName}</dd></div>{previewDetails.duration !== null && <div><dt>Vídeo</dt><dd>{Math.round(previewDetails.duration)}s{previewDetails.width && previewDetails.height ? ` · ${previewDetails.width}×${previewDetails.height}` : ""}</dd></div>}</dl></div><section className="preview-caption"><span>LEGENDA</span><p>{previewDetails.caption || "Sem legenda"}</p></section>{previewDetails.errorMessage && <section className="preview-error"><strong>Falha na publicação{previewDetails.errorCode ? ` · ${previewDetails.errorCode}` : ""}</strong><p>{previewDetails.errorMessage}</p></section>}</div>}</div></div>}
      {toast && <div className="toast"><Check size={18} /> {toast}</div>}
    </main>
  );
}
