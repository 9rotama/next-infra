import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  return NextResponse.json({
    method: "GET",
    runtime: "nodejs",
    now: new Date().toISOString(),
    name: req.nextUrl.searchParams.get("name") ?? "world",
    headers: {
      "user-agent": req.headers.get("user-agent"),
      "x-forwarded-for": req.headers.get("x-forwarded-for"),
    },
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  return NextResponse.json({ method: "POST", echo: body }, { status: 201 })
}
