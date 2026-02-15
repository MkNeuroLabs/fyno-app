'use client'

// src/app/page.tsx
import { useEffect, useState } from "react"
import Hero from "../components/Hero"
import MovieCategory, { VideoItem } from "../components/MovieCategory"
import SessionCategory, { SessionItem } from "../components/SessionCategory"

const seedItems: VideoItem[] = [
  {
    id: "v1",
    title: "Reforma completa en 7 días (timelapse)",
    channel: "Canal Construcción Pro",
    thumb: "/images/action.png",
    reason: "SEED_CHANNEL",
    meta: "hace 3 h · 120k views",
    href: "https://www.youtube.com",
  },
  {
    id: "v2",
    title: "Podcast: economía fácil (episodio 42)",
    channel: "AudioLab",
    thumb: "/images/drama.png",
    reason: "SEED_CHANNEL",
    meta: "hace 8 h · 48k views",
    href: "https://www.youtube.com",
  },
  {
    id: "v3",
    title: "Entrenamiento trail: fuerza y técnica",
    channel: "Trail & Vida",
    thumb: "/images/adventure.png",
    reason: "SEED_CHANNEL",
    meta: "hace 1 día · 210k views",
    href: "https://www.youtube.com",
  },
]

const liveItems: VideoItem[] = [
  {
    id: "l1",
    title: "DIRECTO: charla con invitado (Q&A)",
    channel: "Hablando Claro",
    thumb: "/images/horror.png",
    reason: "LIVE_OR_PREMIERE",
    meta: "ahora",
    href: "https://www.youtube.com",
  },
  {
    id: "l2",
    title: "Estreno: nuevo episodio (hoy)",
    channel: "Cine & Series",
    thumb: "/images/comedy.png",
    reason: "LIVE_OR_PREMIERE",
    meta: "estreno · 21:30",
    href: "https://www.youtube.com",
  },
]

const newCompatItems: VideoItem[] = [
  {
    id: "n1",
    title: "Cómo aislar una casa en zona fría (guía práctica)",
    channel: "Arquitectura Real",
    thumb: "/images/movies.png",
    reason: "NEW_COMPATIBLE",
    meta: "hace 6 h · 32k views",
    href: "https://www.youtube.com",
  },
  {
    id: "n2",
    title: "Herramientas imprescindibles (top 10)",
    channel: "Taller Geek",
    thumb: "/images/action.png",
    reason: "NEW_COMPATIBLE",
    meta: "hace 2 días · 88k views",
    href: "https://www.youtube.com",
  },
]

const discoveredItems: VideoItem[] = [
  {
    id: "d1",
    title: "Documental corto: detrás del diseño",
    channel: "Curiosidad Visual",
    thumb: "/images/drama.png",
    reason: "DISCOVERED",
    meta: "hace 5 días · 15k views",
    href: "https://www.youtube.com",
  },
  {
    id: "d2",
    title: "Cosas raras que funcionan (experimentos)",
    channel: "FreakLab",
    thumb: "/images/comedy.png",
    reason: "DISCOVERED",
    meta: "hace 1 semana · 62k views",
    href: "https://www.youtube.com",
  },
]

// Helper: duplicar items con IDs únicos (para probar carrusel/flechas)
function expandItems(base: VideoItem[], rounds: number) {
  const out: VideoItem[] = []
  out.push(...base)

  let i = 0
  while (i < rounds) {
    const suffix = "_" + (i + 1)
    const cloned = base.map((x) => ({
      ...x,
      id: x.id + suffix,
    }))
    out.push(...cloned)
    i = i + 1
  }

  return out
}

const seedItemsExpanded = expandItems(seedItems, 6)
const liveItemsExpanded = expandItems(liveItems, 10)
const newCompatItemsExpanded = expandItems(newCompatItems, 10)
const discoveredItemsExpanded = expandItems(discoveredItems, 10)

// Sessions (mock) — varias por duración + taxonomías núcleo
const sessions: SessionItem[] = [
  // 30 min (5)
  {
    id: "s30_1",
    title: "Lo más visto hoy (rápido)",
    durationLabel: "30 min",
    topic: "Tendencias en internet",
    reason: "Lo que está tirando fuerte hoy, ya filtrado para no perder tiempo.",
    thumbs: ["/images/horror.png","/images/comedy.png","/images/action.png","/images/movies.png","/images/drama.png","/images/adventure.png"],
    hrefs: ["https://www.youtube.com","https://www.youtube.com","https://www.youtube.com"],
  },
  {
    id: "s30_2",
    title: "Actualidad rápida + contexto",
    durationLabel: "30 min",
    topic: "Informativos & actualidad",
    reason: "Resumen del día con una pieza de análisis para entender lo importante.",
    thumbs: ["/images/drama.png","/images/movies.png","/images/comedy.png","/images/action.png","/images/horror.png","/images/adventure.png"],
    hrefs: ["https://www.youtube.com","https://www.youtube.com","https://www.youtube.com"],
  },
  {
    id: "s30_3",
    title: "Mini-doc: historia en píldoras",
    durationLabel: "30 min",
    topic: "Historia & documentales",
    reason: "Aprendes algo completo en poco tiempo, sin tener que elegir qué ver después.",
    thumbs: ["/images/movies.png","/images/adventure.png","/images/drama.png","/images/action.png","/images/comedy.png","/images/horror.png"],
    hrefs: ["https://www.youtube.com","https://www.youtube.com","https://www.youtube.com"],
  },
  {
    id: "s30_4",
    title: "Inglés: listening + 10 min de repaso",
    durationLabel: "30 min",
    topic: "Inglés (aprendizaje)",
    reason: "Una sesión corta para mantener ritmo sin quemarte.",
    thumbs: ["/images/comedy.png","/images/drama.png","/images/movies.png","/images/action.png","/images/adventure.png","/images/horror.png"],
    hrefs: ["https://www.youtube.com","https://www.youtube.com","https://www.youtube.com"],
  },
  {
    id: "s30_5",
    title: "Tech express: lo nuevo sin ruido",
    durationLabel: "30 min",
    topic: "Tecnología & ciencia",
    reason: "Novedades filtradas: solo lo que merece la pena hoy.",
    thumbs: ["/images/action.png","/images/movies.png","/images/adventure.png","/images/drama.png","/images/comedy.png","/images/horror.png"],
    hrefs: ["https://www.youtube.com","https://www.youtube.com","https://www.youtube.com"],
  },

  // 60 min (5)
  {
    id: "s60_1",
    title: "Lo más visto hoy (sesión completa)",
    durationLabel: "60 min",
    topic: "Tendencias en internet",
    reason: "Una hora con lo viral del día, ordenado para no saltar entre vídeos.",
    thumbs: ["/images/horror.png","/images/comedy.png","/images/drama.png","/images/movies.png","/images/action.png","/images/adventure.png"],
    hrefs: ["https://www.youtube.com","https://www.youtube.com","https://www.youtube.com","https://www.youtube.com"],
  },
  {
    id: "s60_2",
    title: "Finanzas: análisis + claves prácticas",
    durationLabel: "60 min",
    topic: "Finanzas & economía",
    reason: "Contexto + explicación: te lo dejo ya ordenado para una hora.",
    thumbs: ["/images/action.png","/images/drama.png","/images/movies.png","/images/adventure.png","/images/comedy.png","/images/horror.png"],
    hrefs: ["https://www.youtube.com","https://www.youtube.com","https://www.youtube.com","https://www.youtube.com"],
  },
  {
    id: "s60_3",
    title: "Historia: doc corto + comentario",
    durationLabel: "60 min",
    topic: "Historia & documentales",
    reason: "Documental y luego una pieza que te lo aterriza (sin buscar nada).",
    thumbs: ["/images/movies.png","/images/drama.png","/images/adventure.png","/images/action.png","/images/comedy.png","/images/horror.png"],
    hrefs: ["https://www.youtube.com","https://www.youtube.com","https://www.youtube.com","https://www.youtube.com"],
  },
  {
    id: "s60_4",
    title: "Inglés + tecnología (híbrida)",
    durationLabel: "60 min",
    topic: "Inglés (aprendizaje)",
    reason: "Aprendes escuchando temas que ya te interesan.",
    thumbs: ["/images/comedy.png","/images/action.png","/images/movies.png","/images/drama.png","/images/adventure.png","/images/horror.png"],
    hrefs: ["https://www.youtube.com","https://www.youtube.com","https://www.youtube.com","https://www.youtube.com"],
  },
  {
    id: "s60_5",
    title: "Lo que está viendo tu gente",
    durationLabel: "60 min",
    topic: "Lo más visto por tu gente",
    reason: "Sesión basada en señales sociales (en v2 conectaremos RRSS).",
    thumbs: ["/images/adventure.png","/images/horror.png","/images/drama.png","/images/movies.png","/images/action.png","/images/comedy.png"],
    hrefs: ["https://www.youtube.com","https://www.youtube.com","https://www.youtube.com","https://www.youtube.com"],
  },

  // 90 min (5)
  {
    id: "s90_1",
    title: "Lo más visto hoy (modo inmersión)",
    durationLabel: "90 min",
    topic: "Tendencias en internet",
    reason: "Una hora y media con lo más fuerte de hoy, sin tener que decidir nada.",
    thumbs: ["/images/horror.png","/images/comedy.png","/images/drama.png","/images/movies.png","/images/action.png","/images/adventure.png"],
    hrefs: ["https://www.youtube.com","https://www.youtube.com","https://www.youtube.com","https://www.youtube.com","https://www.youtube.com"],
  },
  {
    id: "s90_2",
    title: "Inmersión documental (larga)",
    durationLabel: "90 min",
    topic: "Historia & documentales",
    reason: "Para desconectar con algo completo y no estar eligiendo cada 10 minutos.",
    thumbs: ["/images/movies.png","/images/drama.png","/images/adventure.png","/images/action.png","/images/comedy.png","/images/horror.png"],
    hrefs: ["https://www.youtube.com","https://www.youtube.com","https://www.youtube.com","https://www.youtube.com","https://www.youtube.com"],
  },
  {
    id: "s90_3",
    title: "Economía profunda (sin ruido)",
    durationLabel: "90 min",
    topic: "Finanzas & economía",
    reason: "Una sesión larga para entender bien, no para picotear.",
    thumbs: ["/images/action.png","/images/movies.png","/images/drama.png","/images/adventure.png","/images/comedy.png","/images/horror.png"],
    hrefs: ["https://www.youtube.com","https://www.youtube.com","https://www.youtube.com","https://www.youtube.com","https://www.youtube.com"],
  },
  {
    id: "s90_4",
    title: "Tech + ciencia: panorama semanal",
    durationLabel: "90 min",
    topic: "Tecnología & ciencia",
    reason: "Varias piezas encadenadas para tener visión global.",
    thumbs: ["/images/adventure.png","/images/action.png","/images/movies.png","/images/drama.png","/images/comedy.png","/images/horror.png"],
    hrefs: ["https://www.youtube.com","https://www.youtube.com","https://www.youtube.com","https://www.youtube.com","https://www.youtube.com"],
  },
  {
    id: "s90_5",
    title: "Tarde friki: DIY + construcción",
    durationLabel: "90 min",
    topic: "Ocio friki / DIY / construcción",
    reason: "Sesión larga para engancharte a proyectos sin decidir cada rato.",
    thumbs: ["/images/action.png","/images/adventure.png","/images/comedy.png","/images/drama.png","/images/horror.png","/images/movies.png"],
    hrefs: ["https://www.youtube.com","https://www.youtube.com","https://www.youtube.com","https://www.youtube.com","https://www.youtube.com"],
  },
]

// Convertir "PT1H2M3S" a minutos aproximados (entero)
function isoDurationToMinutes(iso: string) {
  if (!iso) return 0
  // Formatos típicos: PT12M34S, PT1H2M, PT9M, PT45S...
  let h = 0
  let m = 0
  let s = 0

  const hMatch = iso.match(/(\d+)H/)
  const mMatch = iso.match(/(\d+)M/)
  const sMatch = iso.match(/(\d+)S/)

  if (hMatch && hMatch[1]) h = parseInt(hMatch[1], 10)
  if (mMatch && mMatch[1]) m = parseInt(mMatch[1], 10)
  if (sMatch && sMatch[1]) s = parseInt(sMatch[1], 10)

  const totalSeconds = h * 3600 + m * 60 + s
  const minutes = Math.round(totalSeconds / 60)
  return minutes
}

export default function Home() {
  // Arrancar siempre en 30 min
  const [selectedDuration, setSelectedDuration] = useState<"30 min" | "60 min" | "90 min">("30 min")

  // Datos reales para “De tus canales”
  const [seedApiItems, setSeedApiItems] = useState<VideoItem[]>([])
  const [seedApiError, setSeedApiError] = useState<string>("")

  // Datos reales para “Lo más visto hoy”
  const [mostPopularThumbs, setMostPopularThumbs] = useState<string[]>([])
  const [mostPopularHrefs, setMostPopularHrefs] = useState<string[]>([])
  const [mostPopularMinutes, setMostPopularMinutes] = useState<number>(0)

  useEffect(() => {
    async function run() {
      setSeedApiError("")

      // Fase 1: usa URLs tipo /channel/UC...
      const seedUrls = [
        "https://www.youtube.com/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw",
      ]

      try {
        const res = await fetch("/api/youtube/seed-latest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seedUrls }),
        })

        const data = await res.json()

        if (!res.ok) {
          setSeedApiError(data.error ? data.error : "Error al cargar seeds")
        } else {
          setSeedApiItems(data.items || [])
        }
      } catch (e) {
        setSeedApiError("Error de red al llamar a la API")
      }

      // Lo más visto hoy (thumbs + hrefs + duración)
      try {
        const res2 = await fetch("/api/youtube/most-popular?regionCode=ES&maxResults=6")
        const data2 = await res2.json()

        if (res2.ok) {
          const items = (data2.items || []).filter((x: any) => x && x.thumb)

          const thumbs = items.map((x: any) => x.thumb)
          const hrefs = items.map((x: any) => x.href).filter((x: any) => x)

          // sumar minutos de los 3 primeros como proxy de la sesión
          const firstThree = items.slice(0, 3)
          const mins = firstThree
            .map((x: any) => isoDurationToMinutes(x.duration))
            .reduce((a: number, b: number) => a + b, 0)

          setMostPopularThumbs(thumbs)
          setMostPopularHrefs(hrefs)
          setMostPopularMinutes(mins)
        }
      } catch (e) {}
    }

    run()
  }, [])

  // Inyectar datos reales en “Lo más visto hoy” (todas las duraciones)
  const sessionsWithLiveData = sessions.map((s) => {
    const isMost = s.title.toLowerCase().includes("lo más visto hoy")

    if (isMost) {
      const next: any = { ...s }

      if (mostPopularThumbs.length > 0) {
        next.thumbs = mostPopularThumbs
      }

      if (mostPopularHrefs.length > 0) {
        // SessionCategory suele usar 3 hrefs. Le damos mínimo 3.
        next.hrefs = mostPopularHrefs.slice(0, Math.max(3, (s.hrefs || []).length))
      }

      if (mostPopularMinutes > 0) {
        next.reason =
          (s.reason || "") +
          " · Duración aprox: " +
          String(mostPopularMinutes) +
          " min"
      }

      return next
    }

    return s
  })

  // “Lo más visto” siempre primero dentro de la duración seleccionada
  const filteredSessionsBase = sessionsWithLiveData.filter((s) => s.durationLabel === selectedDuration)
  const topPick = filteredSessionsBase.find((s) => s.title.toLowerCase().includes("lo más visto hoy"))
  const filteredSessions = topPick
    ? [topPick, ...filteredSessionsBase.filter((s) => s.id !== topPick.id)]
    : filteredSessionsBase

  return (
    <div className="relative min-h-screen text-white bg-[#141414]">
      {/* HERO */}
      <div
        className="relative w-full h-screen text-white"
        style={{
          backgroundImage: `url('/images/movies.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <Hero />

        <div className="absolute bottom-10 left-0 right-0 flex justify-center">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("rows")
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" })
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md flex items-center gap-2"
          >
            <span className="text-base">Mi selección</span>
            <span className="text-xl animate-bounce">↓</span>
          </button>
        </div>
      </div>

      {/* ROWS */}
      <div id="rows" className="pt-10 space-y-2 scroll-mt-24">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold text-white">Tu sesión</h2>

            <div className="flex gap-2 bg-[#0F0F0F] p-2 rounded-xl">
              {(["30 min", "60 min", "90 min"] as const).map((opt) => {
                const active = opt === selectedDuration
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSelectedDuration(opt)}
                    className={
                      active
                        ? "bg-white text-black font-semibold px-4 py-2 rounded-lg"
                        : "bg-[#1A1A1A] text-white/80 hover:text-white px-4 py-2 rounded-lg"
                    }
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <SessionCategory
          title={"Sesiones sugeridas"}
          subtitle={"Elige una programación ya montada según el tiempo que tengas."}
          items={filteredSessions}
        />

        {seedApiError ? (
          <div className="px-4 sm:px-6 lg:px-10 text-red-400 text-sm">
            {seedApiError}
          </div>
        ) : null}

        <MovieCategory
          title={"De tus canales"}
          subtitle="Últimos vídeos publicados por tus canales seed."
          items={seedApiItems.length > 0 ? seedApiItems : seedItemsExpanded}
        />

        <MovieCategory
          title={"En directo"}
          subtitle="Directos y estrenos activos ahora o programados."
          items={liveItemsExpanded}
        />

        <MovieCategory
          title={"Nuevo compatible"}
          subtitle="Canales nuevos que encajan con tus seeds."
          items={newCompatItemsExpanded}
        />

        <MovieCategory
          title={"Descubiertos"}
          subtitle="Exploración ligera para ampliar tu universo."
          items={discoveredItemsExpanded}
        />
      </div>
    </div>
  )
}