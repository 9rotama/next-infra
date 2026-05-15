import { NextRequest, NextResponse } from "next/server"

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl

  // 1. /old-page -> /demos へ redirect (永続的な引っ越し)
  if (pathname === "/old-page") {
    return NextResponse.redirect(new URL("/demos/middleware", req.url))
  }

  // 2. /proxy/* -> /api/hello に rewrite (URLはそのまま、内部は別のリソース)
  if (pathname.startsWith("/proxy/")) {
    const rewritten = req.nextUrl.clone()
    rewritten.pathname = "/api/hello"
    rewritten.searchParams.set("via", "middleware-rewrite")
    rewritten.searchParams.set("original", pathname)
    return NextResponse.rewrite(rewritten)
  }

  // 3. A/B テスト: ?ab=on で variant cookie をセット
  if (searchParams.get("ab") === "on") {
    const res = NextResponse.next()
    const variant = Math.random() < 0.5 ? "A" : "B"
    res.cookies.set("ab-variant", variant, { path: "/", maxAge: 60 * 60 })
    return res
  }

  // 4. 全レスポンスにヘッダを付与 (request-id / trace用途)
  const res = NextResponse.next()
  res.headers.set("x-request-id", crypto.randomUUID())
  res.headers.set("x-mw-time", new Date().toISOString())
  return res
}

export const config = {
  matcher: [
    // _next, favicon, 静的アセットは除外
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
