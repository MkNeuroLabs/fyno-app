import { NextResponse } from "next/server"

const YT_API = "https://www.googleapis.com/youtube/v3"

function extractChannelIdFromUrl(url: string) {
    // Fase 1: SOLO soportamos URLs tipo:
    // https://www.youtube.com/channel/UCxxxxxxxxxxxxxxxx
    try {
        const u = new URL(url)
        const parts = u.pathname.split("/").filter(Boolean)
        const idx = parts.indexOf("channel")
        if (idx >= 0 && parts[idx + 1]) {
            return parts[idx + 1]
        }
    } catch (e) {}
    return null
}

async function fetchJson(url: string) {
    const res = await fetch(url, { cache: "no-store" })
    const data = await res.json()
    if (!res.ok) {
        throw new Error(JSON.stringify(data))
    }
    return data
}

export async function POST(req: Request) {
    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey) {
        return NextResponse.json({ error: "Missing YOUTUBE_API_KEY in .env.local" }, { status: 500 })
    }

    const body = await req.json()
    const seedUrls: string[] = body.seedUrls || []

    const channelIds: string[] = []
    for (let i = 0; i < seedUrls.length; i = i + 1) {
        const id = extractChannelIdFromUrl(seedUrls[i])
        if (id) channelIds.push(id)
    }

    if (channelIds.length === 0) {
        return NextResponse.json(
            {
                error:
                    "No channelIds detectados. Usa URLs tipo https://www.youtube.com/channel/UCxxxxxxxxxxxxxxxx",
            },
            { status: 400 }
        )
    }

    // 1) Info de canales (nombre)
    const channelsUrl =
        YT_API +
        "/channels?part=snippet&id=" +
        encodeURIComponent(channelIds.join(",")) +
        "&key=" +
        encodeURIComponent(apiKey)

    let channelsData: any
    try {
        channelsData = await fetchJson(channelsUrl)
    } catch (e: any) {
        return NextResponse.json({ error: "Error channels.list", details: String(e) }, { status: 500 })
    }

    const channelMeta: any = {}
    for (let i = 0; i < (channelsData.items || []).length; i = i + 1) {
        const c = channelsData.items[i]
        channelMeta[c.id] = {
            title: c.snippet?.title || "Canal",
        }
    }

    // 2) Últimos vídeos por canal
    const allVideos: any[] = []

    for (let i = 0; i < channelIds.length; i = i + 1) {
        const chId = channelIds[i]

        const searchUrl =
            YT_API +
            "/search?part=snippet&channelId=" +
            encodeURIComponent(chId) +
            "&order=date&maxResults=6&type=video&key=" +
            encodeURIComponent(apiKey)

        let data: any
        try {
            data = await fetchJson(searchUrl)
        } catch (e: any) {
            // si un canal falla, seguimos con los demás
            continue
        }

        for (let j = 0; j < (data.items || []).length; j = j + 1) {
            const v = data.items[j]
            const videoId = v.id?.videoId
            if (videoId) {
                allVideos.push({
                    id: videoId,
                    title: v.snippet?.title || "Vídeo",
                    channel: channelMeta[chId]?.title || v.snippet?.channelTitle || "Canal",
                    thumb:
                        v.snippet?.thumbnails?.medium?.url ||
                        v.snippet?.thumbnails?.high?.url ||
                        "",
                    reason: "SEED_CHANNEL",
                    meta: "YouTube",
                    href: "https://www.youtube.com/watch?v=" + videoId,
                })
            }
        }
    }

    return NextResponse.json({ items: allVideos })
}