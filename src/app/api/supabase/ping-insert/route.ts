import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL en .env.local")
if (!supabaseAnonKey) throw new Error("Falta NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local")

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const message = body.message ? String(body.message) : "hello-from-api"

  const { data, error } = await supabase
    .from("ping")
    .insert({ message })
    .select("*")
    .single()

  if (error) return NextResponse.json({ ok: false, error }, { status: 500 })

  return NextResponse.json({ ok: true, data })
}