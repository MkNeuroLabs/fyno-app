import { NextRequest, NextResponse } from "next/server"
import { getSession, saveSession, newItemId } from "@/lib/sessionStore"

// Ajusta aquí si quieres más tarde tu lógica real.
// Por ahora meto items dummy si no hay items, para probar end-to-end.
function buildDemoItems() {
  const now = Date.now()
  return [
    {
      item_id: newItemId(),
      video_id: "dQw4w9WgXcQ",
      title: "Demo item (fill stub)",
      channel_id: "demo",
      channel_title: "Fyno Demo",
      thumb_url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      watch_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      embed_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      duration_seconds: 213,
      source: "DEMO",
      why: "Relleno de prueba para verificar Supabase end-to-end",
    },
    {
      item_id: newItemId(),
      video_id: "Cp2nGBXIkfE",
      title: "Demo item 2 (fill stub)",
      channel_id: "demo2",
      channel_title: "Fyno Demo 2",
      thumb_url: "https://i.ytimg.com/vi/Cp2nGBXIkfE/hqdefault.jpg",
      watch_url: "https://www.youtube.com/watch?v=Cp2nGBXIkfE",
      embed_url: "https://www.youtube.com/embed/Cp2nGBXIkfE",
      duration_seconds: 282,
      source: "DEMO",
      why: "Segundo item de prueba",
    },
  ]
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const session_id = body.session_id

    if (!session_id) {
      return NextResponse.json({ ok: false, error: "session_id required" }, { status: 400 })
    }

    const session = await getSession(session_id)

    // Aquí es donde irá tu lógica real (YouTube / personajes / taxonomías…)
    // Por ahora: si no hay items, metemos unos demo; si ya hay, no rompemos nada.
    if (!session.items) session.items = []
    if (session.items.length === 0) {
      session.items = buildDemoItems()
    }

    session.updated_at = new Date().toISOString()

    await saveSession(session)

    const duration_total_seconds = session.items.reduce((acc, it) => {
      const d = typeof it.duration_seconds === "number" ? it.duration_seconds : 0
      return acc + d
    }, 0)

    return NextResponse.json({
      ok: true,
      summary: {
        duration_target_seconds: (session.duration_target || 30) * 60,
        duration_total_seconds,
        count_items: session.items.length,
        note: "fill conectado a Supabase (stub). Sustituir por motor real.",
      },
      session,
    })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ? err.message : "unknown error" },
      { status: 500 }
    )
  }
}