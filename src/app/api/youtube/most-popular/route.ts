import { NextResponse } from "next/server"

const YT_API = "https://www.googleapis.com/youtube/v3"

async function fetchJson(url: string) {
  const res = await fetch(url, { cache: "no-store" })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(JSON.stringify(data))
  }
  return data
}

export async function GET(req: Request) {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "Missing YOUTUBE_API_KEY in .env.local" }, { status: 500 })
  }

  const { searchParams } = new URL(req.url)

  // España por defecto (puedes cambiarlo luego)
  const regionCode = searchParams.get("regionCode") || "ES"

  // Cantidad de vídeos
  const maxResults = searchParams.get("maxResults") || "12"

  // categoryId opcional (ej: 25 = News & Politics, 28 = Science & Tech)
  const videoCategoryId = searchParams.get("videoCategoryId")

  let url =
    YT_API +
    "/videos?part=snippet,contentDetails,statistics&chart=mostPopular" +
    "&regionCode=" +
    encodeURIComponent(regionCode) +
    "&maxResults=" +
    encodeURIComponent(maxResults) +
    "&key=" +
    encodeURIComponent(apiKey)

  if (videoCategoryId) {
    url = url + "&videoCategoryId=" + encodeURIComponent(videoCategoryId)
  }

  let data: any
  try {
    data = await fetchJson(url)
  } catch (e: any) {
    return NextResponse.json({ error: "Error videos.list (mostPopular)", details: String(e) }, { status: 500 })
  }

  const items = (data.items || []).map((v: any) => {
    const videoId = v.id
    const sn = v.snippet || {}
    const thumbs = sn.thumbnails || {}

    // Duración ISO 8601: PT12M34S
    const duration = v.contentDetails?.duration || ""

    return {
      id: videoId,
      title: sn.title || "Vídeo",
      channel: sn.channelTitle || "Canal",
      thumb:
        thumbs.medium?.url ||
        thumbs.high?.url ||
        thumbs.default?.url ||
        "",
      reason: "MOST_POPULAR",
      meta: "Most popular · " + regionCode,
      duration: duration,
      href: "https://www.youtube.com/watch?v=" + videoId,
    }
  })

  return NextResponse.json({ regionCode, maxResults, items })
}