import { revalidatePath, revalidateTag } from "next/cache"
import { redirect } from "next/navigation"

export const metadata = { title: "ISR demo" }
export const revalidate = 10

async function getRandomFact() {
  const res = await fetch("https://uselessfacts.jsph.pl/api/v2/facts/random", {
    next: { tags: ["fact"], revalidate: 10 },
  } as RequestInit)
  if (!res.ok) throw new Error("fetch failed")
  return (await res.json()) as { text: string; id: string }
}

async function revalidateAction() {
  "use server"
  revalidateTag("fact", "max")
  revalidatePath("/demos/isr")
  redirect("/demos/isr")
}

export default async function ISRDemo() {
  const fact = await getRandomFact().catch(() => ({
    text: "fetch に失敗にゃ。ネットワークを確認してください。",
    id: "fallback",
  }))
  const renderedAt = new Date().toISOString()

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold">ISR</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          <code>export const revalidate = 10</code> で10秒ごとに再生成にゃ。
          リロードしても <strong>10秒以内</strong> はキャッシュされた同じ値が返り、
          経過後の最初のアクセスでバックグラウンド再生成される (stale-while-revalidate)。
        </p>
      </header>

      <div className="rounded-lg border p-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          rendered at
        </div>
        <div className="font-mono text-sm">{renderedAt}</div>

        <div className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">
          fact id
        </div>
        <div className="font-mono text-sm">{fact.id}</div>

        <div className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">
          fact
        </div>
        <p className="text-sm">{fact.text}</p>
      </div>

      <form action={revalidateAction}>
        <button
          type="submit"
          className="rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
        >
          On-demand revalidate (tag: fact)
        </button>
        <p className="mt-2 text-xs text-muted-foreground">
          押すと <code>revalidateTag</code> + <code>revalidatePath</code> が走り、
          次のレンダリングで強制的に再フェッチされるにゃ。
        </p>
      </form>
    </div>
  )
}
