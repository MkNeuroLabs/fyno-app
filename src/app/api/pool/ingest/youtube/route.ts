import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

export const runtime = "nodejs"

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url) throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL")
  if (!anon) throw new Error("Falta NEXT_PUBLIC_SUPABASE_ANON_KEY")
  return createClient(url, anon)
}

function asString(x: any) {
  return x ? String(x) : ""
}

function pickThumb(snippet: any) {
  if (!snippet || !snippet.thumbnails) return ""
  if (snippet.thumbnails.maxres) return snippet.thumbnails.maxres.url
  if (snippet.thumbnails.standard) return snippet.thumbnails.standard.url
  if (snippet.thumbnails.high) return snippet.thumbnails.high.url
  if (snippet.thumbnails.medium) return snippet.thumbnails.medium.url
  if (snippet.thumbnails.default) return snippet.thumbnails.default.url
  return ""
}

type Body = {
  taxonomy_id?: string
  actor_hint?: string
  topic_hint?: string
  region_code?: string
  // Para esta v1: pegamos directamente un JSON de YouTube (searchListResponse o videos.list)
  youtube_json?: any
  // opcional: fuente (por si luego metes "mostPopular", "search", etc.)
  query_tag?: string
}

export async function POST(req: NextRequest) {
  try {
    const body: Body = await req.json().catch(() => ({} as any))

    const taxonomy_id = body.taxonomy_id ? body.taxonomy_id : "tendencias"
    const actor_hint = body.actor_hint ? body.actor_hint : null
    const topic_hint = body.topic_hint ? body.topic_hint : null
    const region_code = body.region_code ? body.region_code : "ES"

    const payload = body.youtube_json
    if (!payload || !payload.items || !Array.isArray(payload.items)) {
      return NextResponse.json(
        { ok: false, error: "youtube_json.items requerido (pega respuesta de YouTube)" },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    // Normalizamos lo que venga:
    // - search: item.id.videoId + item.snippet
    // - videos.list: item.id + item.snippet + item.contentDetails
    const rows: any[] = []

    for (let i = 0; i < payload.items.length; i++) {
      const it = payload.items[i]
      let videoId = ""

      if (it && it.id) {
        if (typeof it.id === "string") videoId = it.id
        else if (it.id.videoId) videoId = it.id.videoId
      }

      if (!videoId) continue

      const snippet = it.snippet ? it.snippet : {}
      const title = asString(snippet.title)
      const channelId = asString(snippet.channelId)
      const channelTitle = asString(snippet.channelTitle)
      const publishedAt = snippet.publishedAt ? snippet.publishedAt : null
      const thumbUrl = pickThumb(snippet)

      const watchUrl = "https://www.youtube.com/watch?v=" + videoId
      const embedUrl = "https://www.youtube.com/embed/" + videoId

      // duraciones: si vienen en contentDetails (videos.list) las guardamos en raw por ahora
      // (en el siguiente paso las parseamos con batching)
      const durationSeconds = 0

      rows.push({
        id: crypto.randomUUID(),
        source: "youtube",
        source_video_id: videoId,
        url: watchUrl,
        embed_url: embedUrl,
        title: title,
        channel_id: channelId,
        channel_title: channelTitle,
        thumb_url: thumbUrl,
        published_at: publishedAt,
        duration_seconds: durationSeconds,
        region_code: region_code,
        taxonomy_id: taxonomy_id,
        actor_hint: actor_hint,
        topic_hint: topic_hint,
        raw: {
          ...it,
          _query_tag: body.query_tag ? body.query_tag : null,
        },
      })
    }

    if (rows.length === 0) {
      return NextResponse.json({ ok: true, inserted: 0, note: "0 items normalizables" })
    }

    // upsert por (source, source_video_id) => evita duplicados
    const { data, error } = await supabase
      .from("content_items")
      .upsert(rows, { onConflict: "source,source_video_id" })
      .select("source,source_video_id")

    if (error) {
      return NextResponse.json({ ok: false, error }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      received: payload.items.length,
      normalized: rows.length,
      upserted: data ? data.length : 0,
      note: "Ingesta v1 OK (duración pendiente de batching)",
    })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ? err.message : "unknown error" },
      { status: 500 }
    )
  }
}