import { cookies, headers } from "next/headers"

export const metadata = { title: "Middleware demo" }
export const dynamic = "force-dynamic"

export default async function MiddlewareDemo() {
  const c = await cookies()
  const h = await headers()
  const variant = c.get("ab-variant")?.value ?? "(未設定)"

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold">Middleware</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          <code>middleware.ts</code> でリクエストを横断的に処理にゃ。
          ALB/CloudFront 等の前段に置く処理を Next.js 側に寄せる選択肢。
          (Edge Runtime で動作、Node API は使えない点に注意)
        </p>
      </header>

      <section className="rounded-lg border p-4">
        <h2 className="font-medium">1. Redirect</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          <code>/old-page</code> へアクセスすると <code>/demos/middleware</code>
          へ 307 リダイレクトされるにゃ。
        </p>
        <a
          href="/old-page"
          className="mt-2 inline-block text-sm underline underline-offset-4"
        >
          → /old-page を開く
        </a>
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="font-medium">2. Rewrite (URL不変のproxy)</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          <code>/proxy/anything</code> はURLそのままで <code>/api/hello</code>{" "}
          にrewriteされる。ブラウザのアドレスバーは変わらない。
        </p>
        <a
          href="/proxy/anything?name=rewritten"
          className="mt-2 inline-block text-sm underline underline-offset-4"
          target="_blank"
        >
          → /proxy/anything?name=rewritten
        </a>
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="font-medium">3. A/B variant cookie</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          現在の variant: <code className="rounded bg-muted px-1">{variant}</code>
        </p>
        <a
          href="/demos/middleware?ab=on"
          className="mt-2 inline-block text-sm underline underline-offset-4"
        >
          → ?ab=on で再抽選
        </a>
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="font-medium">4. Response headers</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          DevTools の Network で <code>x-request-id</code> /{" "}
          <code>x-mw-time</code> ヘッダが付くにゃ。
        </p>
        <pre className="mt-2 overflow-auto rounded bg-muted p-3 text-xs">
{`x-request-id: (毎リクエストUUID)
x-mw-time:    ${new Date().toISOString()}
host:         ${h.get("host")}`}
        </pre>
      </section>
    </div>
  )
}
