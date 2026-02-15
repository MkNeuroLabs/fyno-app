import { NextResponse } from "next/server"

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "Missing YOUTUBE_API_KEY in .env.local" },
      { status: 500 }
    )
  }

  // Llamada mínima a YouTube (solo para comprobar que la key funciona)
  const url =
    "https://www.googleapis.com/youtube/v3/search?part=snippet&q=historia&maxResults=1&type=video&key=" +
    encodeURIComponent(apiKey)

  const res = await fetch(url, { cache: "no-store" })
  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json(
      { ok: false, error: "YouTube API error", details: data },
      { status: res.status }
    )
  }

  return NextResponse.json({ ok: true, sample: data })
}