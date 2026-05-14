import { listMessages } from "./actions"
import { MessageForm } from "./MessageForm"

export const metadata = { title: "Server Actions demo" }
export const dynamic = "force-dynamic"

export default async function ServerActionsDemo() {
  const initial = await listMessages()
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold">Server Actions</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          フォーム送信が <strong>JSハンドラなしで</strong> サーバへPOSTされ、
          結果が返るにゃ。<code>useActionState</code> + <code>useOptimistic</code> で
          楽観的UIも実装している。インメモリ保存なのでサーバ再起動で消える。
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          ⚠️ Fargate 複数台運用では各タスクが独立メモリなので、
          投稿が見えるタスクと見えないタスクが発生する。本番は外部ストア必須にゃ。
        </p>
      </header>

      <MessageForm initial={initial} />
    </div>
  )
}
