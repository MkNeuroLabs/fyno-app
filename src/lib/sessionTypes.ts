// src/lib/sessionTypes.ts

export type SessionStatus = "draft" | "ready" | "playing" | "completed" | "abandoned";

export type TaxonomyId =
  | "tendencias"
  | "actualidad"
  | "historia"
  | "finanzas"
  | "tecnologia"
  | "ingles"
  | "diy"
  | "personajes";

export type SlotRole = "hook" | "core" | "context" | "close";

export type CandidateSource = "SEED" | "MOST_POPULAR" | "QUERY" | "MANUAL";

export interface ActorContext {
  actor_name: string;
  aliases?: string[];
  time_window?: "24h" | "7d" | "30d";
}

export interface SessionSlot {
  slot_id: string;
  role: SlotRole;
  target_seconds: number;
  candidate_source: CandidateSource;
  constraints?: Record<string, unknown>;
}

export interface SessionItem {
  item_id: string; // internal id
  video_id: string;
  title: string;
  channel_id: string;
  channel_title: string;
  thumb_url: string;
  watch_url: string;
  embed_url: string;
  duration_seconds: number;
  source: CandidateSource;
  why?: string;
}

export interface SessionEditEvent {
  edit_id: string;
  ts: string;
  action:
    | "replace_item"
    | "remove_item"
    | "reorder_items"
    | "add_item"
    | "change_duration";
  context?: {
    taxonomy_id?: TaxonomyId;
    duration_target?: 30 | 60 | 90;
    position?: number;
    slot_id?: string;
  };
  from_item_id?: string;
  to_item_id?: string;
  reason?: string;
}

export interface SessionPlayEvent {
  event_id: string;
  ts: string;
  type: "play" | "pause" | "ended" | "skip_next" | "skip_prev" | "progress";
  item_id?: string;
  watched_seconds?: number;
  completion_ratio?: number;
}

export interface Session {
  session_id: string;
  owner_user_id: string; // v1: "local"
  created_at: string;
  updated_at: string;

  duration_target: 30 | 60 | 90;
  region_code: string;
  taxonomy_id: TaxonomyId;

  // para futuro compartir
  shared_visibility: "private" | "public" | "link-only";
  share_slug: string;

  // para futuro intents
  intent_source: "manual" | "whatsapp" | "agent";
  intent_text?: string;

  // “personajes”
  actor_context?: ActorContext;

  status: SessionStatus;
  current_index: number;

  seed_snapshot?: {
    seed_urls?: string[];
    notes?: string;
  };

  slots: SessionSlot[];
  items: SessionItem[];

  edits: SessionEditEvent[];
  events: SessionPlayEvent[];
}