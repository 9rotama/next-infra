import { NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  return NextResponse.json({
    runtime: "edge",
    now: new Date().toISOString(),
    geo: req.headers.get("x-vercel-ip-country") ?? "unknown",
    ua: req.headers.get("user-agent"),
  })
}
