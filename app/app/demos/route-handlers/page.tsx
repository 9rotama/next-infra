"use client"

import { useState } from "react"

export default function RouteHandlersDemo() {
  const [getResult, setGetResult] = useState<string>("")
  const [postResult, setPostResult] = useState<string>("")
  const [edgeResult, setEdgeResult] = useState<string>("")
  const [streamResult, setStreamResult] = useState<string>("")
  const [streaming, setStreaming] = useState(false)

  async function callGet() {
    const r = await fetch("/api/hello?name=infra")
    setGetResult(JSON.stringify(await r.json(), null, 2))
  }
  async function callPost() {
    const r = await fetch("/api/hello", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ hello: "from client", at: Date.now() }),
    })
    setPostResult(JSON.stringify(await r.json(), null, 2))
  }
  async function callEdge() {
    const r = await fetch("/api/edge")
    setEdgeResult(JSON.stringify(await r.json(), null, 2))
  }
  async function callStream() {
    setStreaming(true)
    setStreamResult("")
    const r = await fetch("/api/stream")
    const reader = r.body!.getReader()
    const dec = new TextDecoder()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      setStreamResult((prev) => prev + dec.decode(value))
    }
    setStreaming(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold">Route Handlers</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          <code>app/api/*/route.ts</code> で REST 風エンドポイントを定義にゃ。
          runtime (nodejs/edge) 切替、ストリーミング(ReadableStream)、
          NextRequest からのヘッダ参照などが試せる。
        </p>
      </header>

      <Block title="GET /api/hello?name=infra (nodejs)" onClick={callGet} out={getResult} />
      <Block title="POST /api/hello (nodejs)" onClick={callPost} out={postResult} />
      <Block title="GET /api/edge (edge runtime)" onClick={callEdge} out={edgeResult} />
      <Block
        title={`GET /api/stream (ReadableStream) ${streaming ? "…streaming" : ""}`}
        onClick={callStream}
        out={streamResult}
      />
    </div>
  )
}

function Block({
  title,
  onClick,
  out,
}: {
  title: string
  onClick: () => void
  out: string
}) {
  return (
    <section className="flex flex-col gap-2 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-medium">{title}</div>
        <button
          onClick={onClick}
          className="rounded bg-foreground px-3 py-1 text-xs text-background hover:opacity-90"
        >
          call
        </button>
      </div>
      {out && (
        <pre className="overflow-auto rounded bg-muted p-3 text-xs">{out}</pre>
      )}
    </section>
  )
}
