// src/app/api/session/create/route.ts
import { NextResponse } from "next/server"
import crypto from "crypto"
import { createSession } from "@/lib/sessionStore"
import type { TaxonomyId } from "@/lib/sessionTypes"

export const runtime = "nodejs"

type CreateBody = {
  duration_target?: 30 | 60 | 90
  taxonomy_id?: TaxonomyId
  region_code?: string

  intent_source?: "manual" | "whatsapp" | "agent"
  intent_text?: string

  actor_context?: {
    actor_name: string
    aliases?: string[]
    time_window?: "24h" | "7d" | "30d"
  }

  seed_urls?: string[]
}

function buildDefaultSlots(duration_target: 30 | 60 | 90, taxonomy_id: TaxonomyId) {
  const total = duration_target * 60
  const hook = Math.round(total * 0.2)
  const core = Math.round(total * 0.6)
  const close = total - hook - core

  return [
    {
      slot_id: crypto.randomUUID(),
      role: "hook",
      target_seconds: hook,
      candidate_source: taxonomy_id === "tendencias" ? "MOST_POPULAR" : "QUERY",
      constraints: { no_repeat_channel: true },
    },
    {
      slot_id: crypto.randomUUID(),
      role: "core",
      target_seconds: core,
      candidate_source: "SEED",
      constraints: { no_repeat_channel: true },
    },
    {
      slot_id: crypto.randomUUID(),
      role: "close",
      target_seconds: close,
      candidate_source: "SEED",
      constraints: { no_repeat_channel: true },
    },
  ]
}

export async function POST(req: Request) {
  let body: CreateBody = {}
  try {
    body = await req.json()
  } catch {
    body = {}
  }

  const duration_target = body.duration_target ?? 30
  const taxonomy_id = body.taxonomy_id ?? "tendencias"
  const region_code = body.region_code ?? "ES"

  const session_id = crypto.randomUUID()
  const share_slug = crypto.randomUUID().slice(0, 8)

  const slots = buildDefaultSlots(duration_target, taxonomy_id)

  // Creamos en Supabase (session + slots). Items vacíos.
  const session = await createSession({
    session_id,
    duration_target,
    taxonomy_id,
    region_code,
    shared_visibility: "private",
    share_slug,
    intent_source: body.intent_source ?? "manual",
    status: "draft",
    current_index: 0,
    seed_snapshot: {
      seed_urls: body.seed_urls ?? [],
      notes: "v1: snapshot simple (se mejora en A2)",
    },
    slots,
    // guardamos extra (actor_context / intent_text) dentro de seed_snapshot para no romper esquema ahora
    // (en v2 hacemos columnas propias si quieres)
  })

  // Metemos campos extra dentro de seed_snapshot (v1 rápido)
  session.seed_snapshot = {
    ...(session.seed_snapshot ? session.seed_snapshot : {}),
    intent_text: body.intent_text ?? null,
    actor_context: body.actor_context ?? null,
  }

  // Persistimos la actualización del snapshot
  await (await import("@/lib/sessionStore")).saveSession(session)

  return NextResponse.json({ ok: true, session }, { status: 201 })
}