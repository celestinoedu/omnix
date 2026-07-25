"use client";

import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Home,
  Instagram,
  LayoutGrid,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
  UploadCloud,
  Video,
  X,
  Youtube,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { AuthGate } from "@/components/AuthGate";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

type Network = "Instagram" | "TikTok" | "YouTube";
type Status = "Agendado" | "Rascunho" | "Publicado";
type Post = {
  id: number;
  title: string;
  network: Network;
  day: number;
  time: string;
  status: Status;
  color: string;
};

const seedPosts: Post[] = [
  { id: 1, title: "5 hábitos para uma semana produtiva", network: "Instagram", day: 6, time: "09:00", status: "Agendado", color: "sun" },
  { id: 2, title: "POV: você descobriu esse truque", network: "TikTok", day: 8, time: "18:30", status: "Agendado", color: "sky" },
  { id: 3, title: "Tutorial completo: do zero ao resultado", network: "YouTube", day: 11, time: "14:00", status: "Agendado", color: "violet" },
  { id: 4, title: "Bastidores do nosso processo criativo", network: "Instagram", day: 15, time: "10:00", status: "Rascunho", color: "peach" },
  { id: 5, title: "3 erros que você precisa evitar", network: "TikTok", day: 20, time: "19:00", status: "Agendado", color: "mint" },
  { id: 6, title: "Resumo da semana + novidades", network: "YouTube", day: 25, time: "16:00", status: "Agendado", color: "rose" },
];

const weekDays = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];
const calendarDays = [27, 28, 29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];

function NetworkIcon({ network, size = 16 }: { network: Network; size?: number }) {
  if (network === "Instagram") return <Instagram size={size} />;
  if (network === "YouTube") return <Youtube size={size} />;
  return <Video size={size} />;
}

export default function Dashboard() {
  const [posts, setPosts] = useState<Post[]>(isSupabaseConfigured ? [] : seedPosts);
  const [filter, setFilter] = useState<"Todas" | Network>("Todas");
  const [composerOpen, setComposerOpen] = useState(false);
  const [connectionsOpen, setConnectionsOpen] = useState(false);
  const [connected, setConnected] = useState<Network[]>(["Instagram", "TikTok", "YouTube"]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toast, setToast] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;

      supabase.auth.getSession().then(({ data }) => {
        setUser(data.session?.user ?? null);
        setAuthLoading(false);
      });

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setAuthLoading(false);
      });

      return () => listener.subscription.unsubscribe();
    }

    const saved = localStorage.getItem("omnix-posts");
    if (saved) setPosts(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !user) return;
    void loadPosts();
  }, [user]);

  async function loadPosts() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setDataLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select("id,title,scheduled_at_utc,status,post_destinations(platform)")
      .order("scheduled_at_utc", { ascending: true });

    if (error) {
      setToast("Não foi possível carregar os posts.");
      setDataLoading(false);
      return;
    }

    const colors = ["sun", "sky", "violet", "peach", "mint", "rose"];
    const mapped = (data ?? []).map((item, index) => {
      const scheduled = new Date(item.scheduled_at_utc);
      const destination = Array.isArray(item.post_destinations) ? item.post_destinations[0] : item.post_destinations;
      return {
        id: Number.parseInt(String(item.id).replaceAll("-", "").slice(0, 12), 16),
        databaseId: item.id,
        title: item.title,
        network: (destination?.platform ?? "Instagram") as Network,
        day: Number(new Intl.DateTimeFormat("pt-BR", { day: "numeric", timeZone: "America/Sao_Paulo" }).format(scheduled)),
        time: new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Sao_Paulo" }).format(scheduled),
        status: item.status === "published" ? "Publicado" : item.status === "draft" ? "Rascunho" : "Agendado",
        color: colors[index % colors.length],
      } as Post;
    });
    setPosts(mapped);
    setDataLoading(false);
  }

  const visiblePosts = useMemo(
    () => posts.filter((post) => filter === "Todas" || post.network === filter),
    [posts, filter],
  );

  async function savePost(form: FormData) {
    const network = form.get("network") as Network;
    const title = String(form.get("title") || "Novo conteúdo");
    const day = Number(form.get("day") || 18);
    const time = String(form.get("time") || "12:00");
    const mediaFile = form.get("media");

    if (isSupabaseConfigured && user) {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;

      let mediaAssetId: string | null = null;
      if (mediaFile instanceof File && mediaFile.size > 0) {
        if (mediaFile.size > 50 * 1024 * 1024) {
          setToast("O arquivo deve ter no máximo 50 MB no plano gratuito.");
          return;
        }

        const safeName = mediaFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const storagePath = `${user.id}/${crypto.randomUUID()}-${safeName}`;
        const { error: uploadError } = await supabase.storage.from("post-media").upload(storagePath, mediaFile, {
          contentType: mediaFile.type,
          upsert: false,
        });

        if (uploadError) {
          setToast("Não foi possível enviar a mídia.");
          return;
        }

        const { data: asset, error: assetError } = await supabase
          .from("media_assets")
          .insert({
            user_id: user.id,
            storage_path: storagePath,
            original_name: mediaFile.name,
            mime_type: mediaFile.type,
            size_bytes: mediaFile.size,
          })
          .select("id")
          .single();

        if (assetError) {
          await supabase.storage.from("post-media").remove([storagePath]);
          setToast("Não foi possível registrar a mídia.");
          return;
        }
        mediaAssetId = asset.id;
      }

      const scheduledAt = new Date(`2026-07-${String(day).padStart(2, "0")}T${time}:00-03:00`).toISOString();
      const { data: post, error: postError } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          media_asset_id: mediaAssetId,
          title,
          caption: title,
          scheduled_at_utc: scheduledAt,
          timezone: "America/Sao_Paulo",
          status: "scheduled",
        })
        .select("id")
        .single();

      if (postError) {
        setToast("Não foi possível salvar o agendamento.");
        return;
      }

      const { error: destinationError } = await supabase.from("post_destinations").insert({
        post_id: post.id,
        platform: network,
        status: "pending",
      });

      if (destinationError) {
        await supabase.from("posts").delete().eq("id", post.id);
        setToast("Não foi possível definir a rede social.");
        return;
      }

      await loadPosts();
      setComposerOpen(false);
      setToast("Post salvo no banco com sucesso!");
      setTimeout(() => setToast(""), 3000);
      return;
    }

    const newPost: Post = {
      id: Date.now(),
      title,
      network,
      day,
      time,
      status: "Agendado",
      color: ["sun", "sky", "violet", "peach", "mint", "rose"][posts.length % 6],
    };
    const next = [...posts, newPost];
    setPosts(next);
    localStorage.setItem("omnix-posts", JSON.stringify(next));
    setComposerOpen(false);
    setToast("Post agendado com sucesso!");
    setTimeout(() => setToast(""), 3000);
  }

  async function signOut() {
    await getSupabaseBrowserClient()?.auth.signOut();
  }

  function toggleConnection(network: Network) {
    setConnected((current) =>
      current.includes(network) ? current.filter((item) => item !== network) : [...current, network],
    );
  }

  if (authLoading) {
    return <main className="auth-page"><div className="auth-loader"><Sparkles /><span>Preparando seu espaço...</span></div></main>;
  }

  if (isSupabaseConfigured && !user) {
    return <AuthGate />;
  }

  return (
    <main className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "open" : ""}`}>
        <div className="brand">
          <span className="brand-mark"><Sparkles size={20} /></span>
          <span>OmniX</span>
          <button className="mobile-close" onClick={() => setMobileMenu(false)} aria-label="Fechar menu"><X /></button>
        </div>
        <nav>
          <a className="active" href="#"><Home /> Visão geral</a>
          <a href="#calendario"><CalendarDays /> Calendário</a>
          <a href="#conteudos"><LayoutGrid /> Conteúdos <span className="nav-count">{posts.length}</span></a>
          <button onClick={() => setConnectionsOpen(true)}><UploadCloud /> Conexões <span className="nav-count">{connected.length}</span></button>
        </nav>
        <div className="sidebar-bottom">
          <a href="#ajuda"><CircleHelp /> Central de ajuda</a>
          <a href="#config"><Settings /> Configurações</a>
          <div className="profile">
            <div className="avatar">MS</div>
            <div><strong>{user?.email?.split("@")[0] ?? "Marina Silva"}</strong><small>{isSupabaseConfigured ? "Dados sincronizados" : "Modo demonstração"}</small></div>
            {user ? <button className="profile-more" onClick={signOut} title="Sair"><MoreHorizontal size={18} /></button> : <MoreHorizontal size={18} />}
          </div>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMobileMenu(true)} aria-label="Abrir menu"><Menu /></button>
          <div className="search"><Search size={18} /><input aria-label="Buscar conteúdo" placeholder="Buscar conteúdo..." /><kbd>⌘ K</kbd></div>
          <div className="top-actions">
            <button className="icon-button" aria-label="Ajuda"><CircleHelp size={20} /></button>
            <button className="primary" onClick={() => setComposerOpen(true)}><Plus size={18} /> Criar post</button>
          </div>
        </header>

        <div className="workspace">
          <div className="welcome-row">
            <div>
              <p className="eyebrow">SÁBADO, 25 DE JULHO</p>
              <h1>Bom dia, {user?.email?.split("@")[0] ?? "Marina"} <span>👋</span></h1>
              <p>Organize sua presença digital, sem complicação.</p>
            </div>
            <button className="secondary" onClick={() => setConnectionsOpen(true)}>
              <span className="status-dot" /> {connected.length} contas conectadas <ChevronDown size={16} />
            </button>
          </div>

          <section className="stats-grid">
            <article><div className="stat-icon blue"><CalendarDays /></div><div><span>Agendados</span><strong>{posts.filter(p => p.status === "Agendado").length}</strong><small>Próximos 30 dias</small></div><span className="trend">+3</span></article>
            <article><div className="stat-icon green"><Check /></div><div><span>Publicados</span><strong>24</strong><small>Este mês</small></div><span className="trend">+18%</span></article>
            <article><div className="stat-icon amber"><Clock3 /></div><div><span>Economia de tempo</span><strong>8h</strong><small>Este mês</small></div><span className="trend">+2h</span></article>
          </section>

          <section className="calendar-card" id="calendario">
            <div className="calendar-header">
              <div>
                <div className="month-nav"><h2>Julho 2026</h2><button aria-label="Mês anterior"><ChevronLeft /></button><button aria-label="Próximo mês"><ChevronRight /></button><button className="today">Hoje</button></div>
                <p>{dataLoading ? "Carregando conteúdos..." : `${visiblePosts.length} conteúdos neste calendário`}</p>
              </div>
              <div className="filters">
                {(["Todas", "Instagram", "TikTok", "YouTube"] as const).map((item) => (
                  <button key={item} className={filter === item ? "selected" : ""} onClick={() => setFilter(item)}>
                    {item !== "Todas" && <NetworkIcon network={item} />} {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="calendar">
              {weekDays.map((day) => <div className="weekday" key={day}>{day}</div>)}
              {calendarDays.map((day, index) => {
                const muted = index < 4 || index > 34;
                const dayPosts = muted ? [] : visiblePosts.filter((post) => post.day === day);
                return (
                  <div className={`day ${muted ? "muted" : ""} ${day === 25 && !muted ? "current" : ""}`} key={`${day}-${index}`}>
                    <span className="day-number">{day}</span>
                    {dayPosts.map((post) => (
                      <button className={`post ${post.color}`} key={post.id} title={post.title}>
                        <span className="post-network"><NetworkIcon network={post.network} size={13} /> {post.time}</span>
                        <strong>{post.title}</strong>
                      </button>
                    ))}
                    {!muted && <button className="quick-add" onClick={() => setComposerOpen(true)} aria-label={`Adicionar no dia ${day}`}><Plus size={14} /></button>}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="bottom-grid" id="conteudos">
            <article className="upcoming">
              <div className="section-title"><div><h3>Próximos posts</h3><p>Sua fila está organizada.</p></div><button>Ver todos <ChevronRight size={15} /></button></div>
              {posts.filter(p => p.status === "Agendado").slice(0, 3).map(post => (
                <div className="queue-item" key={post.id}>
                  <div className={`thumb ${post.color}`}><NetworkIcon network={post.network} size={22} /></div>
                  <div className="queue-copy"><strong>{post.title}</strong><span><NetworkIcon network={post.network} size={13} /> {post.network} · {post.day} jul, {post.time}</span></div>
                  <span className="scheduled">Agendado</span>
                  <button aria-label="Mais opções"><MoreHorizontal /></button>
                </div>
              ))}
            </article>
            <article className="tip-card">
              <span className="tip-art"><Sparkles /></span>
              <div><span className="mini-label">DICA DA SEMANA</span><h3>Consistência vence perfeição.</h3><p>Marcas que publicam 3–4 vezes por semana têm mais chances de crescer.</p></div>
            </article>
          </section>
        </div>
      </section>

      {composerOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setComposerOpen(false)}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="composer-title" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-head"><div><span className="mini-label">NOVO CONTEÚDO</span><h2 id="composer-title">Agendar publicação</h2></div><button onClick={() => setComposerOpen(false)} aria-label="Fechar"><X /></button></div>
            <form action={savePost}>
              <label>Legenda ou título<textarea name="title" required placeholder="Sobre o que é este conteúdo?" /></label>
              <div className="form-row">
                <label>Rede social<select name="network" defaultValue="Instagram"><option>Instagram</option><option>TikTok</option><option>YouTube</option></select></label>
                <label>Dia de julho<input name="day" type="number" min="1" max="31" defaultValue="26" /></label>
                <label>Horário<input name="time" type="time" defaultValue="12:00" /></label>
              </div>
              <label className="upload-zone"><UploadCloud /><strong>Adicione sua foto ou vídeo</strong><span>{isSupabaseConfigured ? "JPEG, PNG, WEBP, MP4, MOV ou WEBM · máximo 50 MB" : "No modo demonstração, o arquivo não é enviado."}</span><input name="media" type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm" /></label>
              <div className="modal-actions"><button type="button" className="secondary" onClick={() => setComposerOpen(false)}>Cancelar</button><button type="submit" className="primary"><CalendarDays size={17} /> Agendar post</button></div>
            </form>
          </div>
        </div>
      )}

      {connectionsOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setConnectionsOpen(false)}>
          <div className="modal connections-modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-head"><div><span className="mini-label">CANAIS</span><h2>Suas conexões</h2><p>Gerencie onde seus conteúdos serão publicados.</p></div><button onClick={() => setConnectionsOpen(false)} aria-label="Fechar"><X /></button></div>
            <div className="connection-list">
              {(["Instagram", "TikTok", "YouTube"] as Network[]).map(network => {
                const isConnected = connected.includes(network);
                return <div className="connection" key={network}><span className={`network-logo ${network.toLowerCase()}`}><NetworkIcon network={network} size={22} /></span><div><strong>{network}</strong><small>{isConnected ? `@marina.criativa · Conectado` : "Nenhuma conta conectada"}</small></div><button className={isConnected ? "disconnect" : "primary"} onClick={() => toggleConnection(network)}>{isConnected ? "Desconectar" : "Conectar"}</button></div>;
              })}
            </div>
            <p className="demo-note"><CircleHelp size={16} /> Demonstração segura: os botões simulam a conexão. As credenciais oficiais serão configuradas na etapa de integrações.</p>
          </div>
        </div>
      )}

      {toast && <div className="toast"><Check size={18} /> {toast}</div>}
    </main>
  );
}
