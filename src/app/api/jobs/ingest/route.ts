import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const expected = "Bearer " + (process.env.JOB_SECRET || "");

  if (!process.env.JOB_SECRET) {
    return NextResponse.json(
      { ok: false, error: "JOB_SECRET no configurado en el servidor" },
      { status: 500 }
    );
  }

  if (auth !== expected) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  // TODO: aquí llamaremos a tu lógica real de ingesta:
  // - fetch a fuentes externas (YouTube/podcasts)
  // - guardado en Supabase (video_pool, transcripts, etc.)
  // - logging básico

  return NextResponse.json({
    ok: true,
    message: "ingest job executed (stub)",
    at: new Date().toISOString(),
  });
}