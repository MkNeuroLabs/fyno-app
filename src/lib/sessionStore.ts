import { createClient } from "@supabase/supabase-js"
import { randomUUID } from "crypto"

type SessionRow = {
  session_id: string
  owner_user_id: string
  created_at: string
  updated_at: string
  duration_target: number
  region_code: string
  taxonomy_id: string
  shared_visibility: string
  share_slug: string | null
  intent_source: string
  status: string
  current_index: number
  seed_snapshot: any
}

type SlotRow = {
  slot_id: string
  session_id: string
  role: string
  target_seconds: number
  candidate_source: string
  constraints: any
}

type ItemRow = {
  item_id: string
  session_id: string
  video_id: string | null
  title: string | null
  channel_id: string | null
  channel_title: string | null
  thumb_url: string | null
  watch_url: string | null
  embed_url: string | null
  duration_seconds: number
  source: string | null
  why: string | null
  created_at: string
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url) throw new Error("SUPABASE_URL missing (NEXT_PUBLIC_SUPABASE_URL)")
  if (!anon) throw new Error("SUPABASE_ANON_KEY missing (NEXT_PUBLIC_SUPABASE_ANON_KEY)")

  return createClient(url, anon)
}

/**
 * Estructura de sesión (compat con lo que ya estabas guardando en JSON)
 */
export type Session = {
  session_id: string
  owner_user_id: string
  created_at: string
  updated_at: string
  duration_target: number
  region_code: string
  taxonomy_id: string
  shared_visibility: string
  share_slug: string
  intent_source: string
  status: string
  current_index: number
  seed_snapshot: any
  slots: Array<{
    slot_id: string
    role: string
    target_seconds: number
    candidate_source: string
    constraints: any
  }>
  items: Array<{
    item_id: string
    video_id?: string
    title?: string
    channel_id?: string
    channel_title?: string
    thumb_url?: string
    watch_url?: string
    embed_url?: string
    duration_seconds?: number
    source?: string
    why?: string
  }>
  edits: any[]
  events: any[]
}

export function newSessionId() {
  return randomUUID()
}

export function newSlotId() {
  return randomUUID()
}

export function newItemId() {
  return randomUUID()
}

/**
 * Crea una sesión nueva (y sus slots).
 * items/edits/events empiezan vacíos.
 */
export async function createSession(initial: Partial<Session> = {}) {
  const supabase = getSupabase()

  const session_id = initial.session_id ? initial.session_id : newSessionId()
  const now = new Date().toISOString()

  const base: Session = {
    session_id: session_id,
    owner_user_id: initial.owner_user_id ? initial.owner_user_id : "local",
    created_at: now,
    updated_at: now,
    duration_target: initial.duration_target ? initial.duration_target : 30,
    region_code: initial.region_code ? initial.region_code : "ES",
    taxonomy_id: initial.taxonomy_id ? initial.taxonomy_id : "tendencias",
    shared_visibility: initial.shared_visibility ? initial.shared_visibility : "private",
    share_slug: initial.share_slug ? initial.share_slug : session_id.slice(0, 8),
    intent_source: initial.intent_source ? initial.intent_source : "manual",
    status: initial.status ? initial.status : "draft",
    current_index: initial.current_index ? initial.current_index : 0,
    seed_snapshot: initial.seed_snapshot ? initial.seed_snapshot : { seed_urls: [], notes: "v1: snapshot simple" },
    slots: initial.slots ? initial.slots : [],
    items: initial.items ? initial.items : [],
    edits: initial.edits ? initial.edits : [],
    events: initial.events ? initial.events : [],
  }

  // 1) insert sessions
  const { error: sErr } = await supabase.from("sessions").insert({
    session_id: base.session_id,
    owner_user_id: base.owner_user_id,
    duration_target: base.duration_target,
    region_code: base.region_code,
    taxonomy_id: base.taxonomy_id,
    shared_visibility: base.shared_visibility,
    share_slug: base.share_slug,
    intent_source: base.intent_source,
    status: base.status,
    current_index: base.current_index,
    seed_snapshot: base.seed_snapshot,
  })
  if (sErr) throw sErr

  // 2) insert slots si hay
  if (base.slots.length > 0) {
    const rows: SlotRow[] = base.slots.map((sl) => ({
      slot_id: sl.slot_id ? sl.slot_id : newSlotId(),
      session_id: base.session_id,
      role: sl.role,
      target_seconds: sl.target_seconds,
      candidate_source: sl.candidate_source,
      constraints: sl.constraints ? sl.constraints : {},
    }))
    const { error: slotErr } = await supabase.from("session_slots").insert(rows)
    if (slotErr) throw slotErr

    // actualizamos ids por si venían vacíos
    base.slots = rows.map((r) => ({
      slot_id: r.slot_id,
      role: r.role,
      target_seconds: r.target_seconds,
      candidate_source: r.candidate_source,
      constraints: r.constraints,
    }))
  }

  return base
}

/**
 * Lee sesión completa (session + slots + items).
 */
export async function getSession(session_id: string) {
  const supabase = getSupabase()

  const { data: sData, error: sErr } = await supabase
    .from("sessions")
    .select("*")
    .eq("session_id", session_id)
    .single()

  if (sErr) throw sErr
  const s = sData as SessionRow

  const { data: slotsData, error: slotsErr } = await supabase
    .from("session_slots")
    .select("*")
    .eq("session_id", session_id)
    .order("role", { ascending: true })

  if (slotsErr) throw slotsErr

  const { data: itemsData, error: itemsErr } = await supabase
    .from("session_items")
    .select("*")
    .eq("session_id", session_id)
    .order("created_at", { ascending: true })

  if (itemsErr) throw itemsErr

  const session: Session = {
    session_id: s.session_id,
    owner_user_id: s.owner_user_id,
    created_at: s.created_at,
    updated_at: s.updated_at,
    duration_target: s.duration_target,
    region_code: s.region_code,
    taxonomy_id: s.taxonomy_id,
    shared_visibility: s.shared_visibility,
    share_slug: s.share_slug ? s.share_slug : "",
    intent_source: s.intent_source,
    status: s.status,
    current_index: s.current_index,
    seed_snapshot: s.seed_snapshot ? s.seed_snapshot : {},
    slots: (slotsData as SlotRow[]).map((r) => ({
      slot_id: r.slot_id,
      role: r.role,
      target_seconds: r.target_seconds,
      candidate_source: r.candidate_source,
      constraints: r.constraints ? r.constraints : {},
    })),
    items: (itemsData as ItemRow[]).map((r) => ({
      item_id: r.item_id,
      video_id: r.video_id ? r.video_id : undefined,
      title: r.title ? r.title : undefined,
      channel_id: r.channel_id ? r.channel_id : undefined,
      channel_title: r.channel_title ? r.channel_title : undefined,
      thumb_url: r.thumb_url ? r.thumb_url : undefined,
      watch_url: r.watch_url ? r.watch_url : undefined,
      embed_url: r.embed_url ? r.embed_url : undefined,
      duration_seconds: r.duration_seconds,
      source: r.source ? r.source : undefined,
      why: r.why ? r.why : undefined,
    })),
    edits: [],
    events: [],
  }

  return session
}

/**
 * Guarda sesión completa:
 * - upsert session
 * - reemplaza slots e items (borra y re-inserta)
 */
export async function saveSession(session: Session) {
  const supabase = getSupabase()

  // upsert sessions
  const { error: upErr } = await supabase.from("sessions").upsert({
    session_id: session.session_id,
    owner_user_id: session.owner_user_id,
    duration_target: session.duration_target,
    region_code: session.region_code,
    taxonomy_id: session.taxonomy_id,
    shared_visibility: session.shared_visibility,
    share_slug: session.share_slug,
    intent_source: session.intent_source,
    status: session.status,
    current_index: session.current_index,
    seed_snapshot: session.seed_snapshot ? session.seed_snapshot : {},
    updated_at: new Date().toISOString(),
  })
  if (upErr) throw upErr

  // replace slots
  const { error: delSlotsErr } = await supabase.from("session_slots").delete().eq("session_id", session.session_id)
  if (delSlotsErr) throw delSlotsErr

  if (session.slots && session.slots.length > 0) {
    const slotRows: SlotRow[] = session.slots.map((sl) => ({
      slot_id: sl.slot_id ? sl.slot_id : newSlotId(),
      session_id: session.session_id,
      role: sl.role,
      target_seconds: sl.target_seconds,
      candidate_source: sl.candidate_source,
      constraints: sl.constraints ? sl.constraints : {},
    }))
    const { error: insSlotsErr } = await supabase.from("session_slots").insert(slotRows)
    if (insSlotsErr) throw insSlotsErr
  }

  // replace items
  const { error: delItemsErr } = await supabase.from("session_items").delete().eq("session_id", session.session_id)
  if (delItemsErr) throw delItemsErr

  if (session.items && session.items.length > 0) {
    const itemRows: any[] = session.items.map((it) => ({
      item_id: it.item_id ? it.item_id : newItemId(),
      session_id: session.session_id,
      video_id: it.video_id ? it.video_id : null,
      title: it.title ? it.title : null,
      channel_id: it.channel_id ? it.channel_id : null,
      channel_title: it.channel_title ? it.channel_title : null,
      thumb_url: it.thumb_url ? it.thumb_url : null,
      watch_url: it.watch_url ? it.watch_url : null,
      embed_url: it.embed_url ? it.embed_url : null,
      duration_seconds: typeof it.duration_seconds === "number" ? it.duration_seconds : 0,
      source: it.source ? it.source : null,
      why: it.why ? it.why : null,
    }))
    const { error: insItemsErr } = await supabase.from("session_items").insert(itemRows)
    if (insItemsErr) throw insItemsErr
  }

  return { ok: true }
}