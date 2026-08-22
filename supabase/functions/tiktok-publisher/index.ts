import { json, safeError } from "../_shared/http.ts";
import { adminClient, requiredEnv } from "../_shared/supabase.ts";
import { getActiveTikTokToken, queryCreatorInfo } from "../_shared/tiktok.ts";

type Destination = {
  id: string;
  post_id: string;
  social_account_id: string;
  platform_options: Record<string, unknown>;
  platform_post_id: string | null;
  omnix_posts: { caption: string; media_asset_id: string; omnix_media_assets: { storage_path: string; mime_type: string; size_bytes: number; duration_seconds: number | null } | null };
};

async function markFailed(client: ReturnType<typeof adminClient>, destination: Destination, code: string, message: string, attemptId?: string) {
  await client.from("omnix_post_destinations").update({ status: "failed", last_error_code: code, last_error_message: message.slice(0, 500), updated_at: new Date().toISOString() }).eq("id", destination.id);
  await client.from("omnix_posts").update({ status: "failed", updated_at: new Date().toISOString() }).eq("id", destination.post_id);
  if (attemptId) await client.from("omnix_publication_attempts").update({ finished_at: new Date().toISOString(), outcome: "permanent_failure", error_category: code }).eq("id", attemptId);
}

async function publishOne(client: ReturnType<typeof adminClient>, destinationId: string) {
  const { data, error } = await client.from("omnix_post_destinations")
    .select("id,post_id,social_account_id,platform_options,platform_post_id,omnix_posts(caption,media_asset_id,omnix_media_assets(storage_path,mime_type,size_bytes,duration_seconds))")
    .eq("id", destinationId).single();
  if (error || !data) throw new Error("Destino agendado não encontrado.");
  const destination = data as unknown as Destination;
  const { data: attempts } = await client.from("omnix_publication_attempts").select("attempt_number").eq("post_destination_id", destination.id).order("attempt_number", { ascending: false }).limit(1);
  const { data: attempt, error: attemptError } = await client.from("omnix_publication_attempts").insert({ post_destination_id: destination.id, attempt_number: (attempts?.[0]?.attempt_number ?? 0) + 1 }).select("id").single();
  if (attemptError || !attempt) throw new Error("Não foi possível registrar a tentativa de publicação.");

  try {
    const media = destination.omnix_posts.omnix_media_assets;
    if (!media || !destination.social_account_id) throw new Error("O agendamento não possui vídeo ou conta TikTok.");
    if (!["video/mp4", "video/quicktime", "video/webm"].includes(media.mime_type)) throw new Error("O TikTok aceita MP4, MOV ou WEBM neste fluxo.");

    const options = destination.platform_options;
    if (!options.consent_at || typeof options.privacy_level !== "string") throw new Error("Consentimento ou privacidade do TikTok ausente.");
    const appAudited = Deno.env.get("TIKTOK_APP_AUDITED") === "true";
    if (!appAudited && options.privacy_level !== "SELF_ONLY") throw new Error("Aplicativos ainda não auditados só podem publicar como Somente eu.");
    if (options.brand_content && options.privacy_level === "SELF_ONLY") throw new Error("Parceria paga não pode ser publicada como Somente eu.");
    const token = await getActiveTikTokToken(client, destination.social_account_id);
    const creator = await queryCreatorInfo(token);
    if (!creator.privacy_level_options.includes(options.privacy_level)) throw new Error("A privacidade escolhida não está mais disponível. Edite o agendamento.");
    if (media.duration_seconds && media.duration_seconds > creator.max_video_post_duration_sec) throw new Error("O vídeo excede a duração permitida para esta conta TikTok.");

    const { data: blob, error: downloadError } = await client.storage.from("omnix-post-media").download(media.storage_path);
    if (downloadError || !blob) throw new Error("Não foi possível recuperar o vídeo agendado.");
    const videoSize = Number(media.size_bytes);
    const initResponse = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({
        post_info: {
          title: destination.omnix_posts.caption.slice(0, 2200),
          privacy_level: options.privacy_level,
          disable_comment: !options.allow_comment,
          disable_duet: !options.allow_duet,
          disable_stitch: !options.allow_stitch,
          brand_content_toggle: Boolean(options.brand_content),
          brand_organic_toggle: Boolean(options.brand_organic),
          is_aigc: Boolean(options.is_aigc),
        },
        source_info: { source: "FILE_UPLOAD", video_size: videoSize, chunk_size: videoSize, total_chunk_count: 1 },
      }),
    });
    const initialized = await initResponse.json();
    if (!initResponse.ok || initialized.error?.code !== "ok" || !initialized.data?.upload_url) {
      throw new Error(initialized.error?.message || initialized.error?.code || "TikTok recusou o início da publicação.");
    }

    await client.from("omnix_post_destinations").update({ platform_post_id: initialized.data.publish_id, updated_at: new Date().toISOString() }).eq("id", destination.id);
    const upload = await fetch(initialized.data.upload_url, {
      method: "PUT",
      headers: { "Content-Type": media.mime_type, "Content-Length": String(videoSize), "Content-Range": `bytes 0-${videoSize - 1}/${videoSize}` },
      body: blob,
    });
    if (!upload.ok) throw new Error(`Falha ao transferir o vídeo para o TikTok (${upload.status}).`);
    await client.from("omnix_publication_attempts").update({ finished_at: new Date().toISOString(), outcome: "succeeded" }).eq("id", attempt.id);
  } catch (error) {
    await markFailed(client, destination, "tiktok_publish_error", safeError(error), attempt?.id);
  }
}

async function pollOne(client: ReturnType<typeof adminClient>, destination: Destination) {
  if (!destination.platform_post_id || !destination.social_account_id) return;
  try {
    const token = await getActiveTikTokToken(client, destination.social_account_id);
    const response = await fetch("https://open.tiktokapis.com/v2/post/publish/status/fetch/", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({ publish_id: destination.platform_post_id }),
    });
    const result = await response.json();
    if (!response.ok || result.error?.code !== "ok") throw new Error(result.error?.message || result.error?.code || "Falha ao consultar o TikTok.");
    if (result.data.status === "PUBLISH_COMPLETE") {
      const platformPostId = result.data.publicaly_available_post_id?.[0] || destination.platform_post_id;
      await client.from("omnix_post_destinations").update({ status: "published", platform_post_id: platformPostId, published_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", destination.id);
      await client.from("omnix_posts").update({ status: "published", updated_at: new Date().toISOString() }).eq("id", destination.post_id);
    } else if (result.data.status === "FAILED") {
      await markFailed(client, destination, result.data.fail_reason || "tiktok_processing_failed", "O TikTok não conseguiu processar esta publicação.");
    }
  } catch (error) {
    console.error("tiktok-status", destination.id, safeError(error));
  }
}

Deno.serve(async (req) => {
  if (req.headers.get("x-omnix-cron-secret") !== requiredEnv("OMNIX_CRON_SECRET")) return json({ error: "Não autorizado." }, 401);
  const client = adminClient();
  try {
    const { data: claimed, error } = await client.rpc("omnix_claim_due_tiktok_destinations", { batch_size: 3 });
    if (error) throw error;
    for (const item of claimed ?? []) await publishOne(client, item.destination_id);

    const { data: processing } = await client.from("omnix_post_destinations")
      .select("id,post_id,social_account_id,platform_options,platform_post_id,omnix_posts(caption,media_asset_id,omnix_media_assets(storage_path,mime_type,size_bytes,duration_seconds))")
      .eq("platform", "TikTok").eq("status", "processing").not("platform_post_id", "is", null).limit(10);
    for (const item of processing ?? []) await pollOne(client, item as unknown as Destination);
    return json({ claimed: claimed?.length ?? 0, checked: processing?.length ?? 0 });
  } catch (error) {
    console.error("tiktok-publisher", safeError(error));
    return json({ error: safeError(error) }, 500);
  }
});
