import { Suspense } from "react"

export const metadata = { title: "Streaming demo" }
export const dynamic = "force-dynamic"

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms))
}

async function FastPanel() {
  await sleep(300)
  return (
    <Panel title="Fast (300ms)" tone="emerald">
      ほぼ即座に解決される Server Component にゃ。
    </Panel>
  )
}

async function MediumPanel() {
  await sleep(1500)
  return (
    <Panel title="Medium (1.5s)" tone="sky">
      API 呼び出しを想定。{new Date().toISOString()}
    </Panel>
  )
}

async function SlowPanel() {
  await sleep(3500)
  return (
    <Panel title="Slow (3.5s)" tone="rose">
      重いクエリを想定。これだけ遅くてもページ全体はブロックしないにゃ。
    </Panel>
  )
}

function Panel({
  title,
  tone,
  children,
}: {
  title: string
  tone: "emerald" | "sky" | "rose"
  children: React.ReactNode
}) {
  const toneCls = {
    emerald: "border-emerald-500/40 bg-emerald-500/5",
    sky: "border-sky-500/40 bg-sky-500/5",
    rose: "border-rose-500/40 bg-rose-500/5",
  }[tone]
  return (
    <div className={`rounded-lg border p-4 ${toneCls}`}>
      <div className="text-sm font-medium">{title}</div>
      <div className="mt-1 text-sm text-muted-foreground">{children}</div>
    </div>
  )
}

function Skeleton({ label }: { label: string }) {
  return (
    <div className="animate-pulse rounded-lg border border-dashed p-4">
      <div className="text-sm text-muted-foreground">loading… {label}</div>
    </div>
  )
}

export default function StreamingDemo() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold">Streaming (Suspense)</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Server Components を <code>Suspense</code> で囲むと、
          遅いものを待たずに段階的に HTML が flush されるにゃ。 DevTools の Network
          で <code>Transfer-Encoding: chunked</code> を確認できる。
          ページレンダリング開始時刻: <code>{new Date().toISOString()}</code>
        </p>
      </header>

      <div className="flex flex-col gap-3">
        <Suspense fallback={<Skeleton label="fast" />}>
          <FastPanel />
        </Suspense>
        <Suspense fallback={<Skeleton label="medium" />}>
          <MediumPanel />
        </Suspense>
        <Suspense fallback={<Skeleton label="slow" />}>
          <SlowPanel />
        </Suspense>
      </div>
    </div>
  )
}
