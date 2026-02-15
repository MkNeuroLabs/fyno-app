import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/sessionStore"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const session_id = searchParams.get("session_id")

    if (!session_id) {
      return NextResponse.json({ ok: false, error: "session_id required" }, { status: 400 })
    }

    const session = await getSession(session_id)
    return NextResponse.json({ ok: true, session })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ? err.message : "unknown error" },
      { status: 500 }
    )
  }
}