"use client"

import { useActionState, useOptimistic, useRef, startTransition } from "react"
import { addMessage } from "./actions"

type Message = { id: string; text: string; createdAt: string }

export function MessageForm({ initial }: { initial: Message[] }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, pending] = useActionState(addMessage, null)

  const [optimistic, addOptimistic] = useOptimistic(
    initial,
    (cur: Message[], next: Message) => [next, ...cur],
  )

  async function handleSubmit(formData: FormData) {
    const text = String(formData.get("text") ?? "").trim()
    if (!text) return
    startTransition(() => {
      addOptimistic({
        id: `optimistic-${Date.now()}`,
        text,
        createdAt: new Date().toISOString(),
      })
    })
    formRef.current?.reset()
    formAction(formData)
  }

  return (
    <div className="flex flex-col gap-4">
      <form ref={formRef} action={handleSubmit} className="flex flex-col gap-2">
        <textarea
          name="text"
          rows={2}
          maxLength={140}
          placeholder="140文字まで"
          className="rounded border bg-background p-2 text-sm"
        />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50"
          >
            {pending ? "posting…" : "post"}
          </button>
          {state?.error && (
            <span className="text-xs text-rose-500">{state.error}</span>
          )}
          {state?.ok && (
            <span className="text-xs text-emerald-500">posted!</span>
          )}
        </div>
      </form>

      <ul className="flex flex-col gap-2">
        {optimistic.length === 0 && (
          <li className="text-sm text-muted-foreground">まだ投稿が無いにゃ</li>
        )}
        {optimistic.map((m) => (
          <li
            key={m.id}
            className={`rounded border p-3 text-sm ${
              m.id.startsWith("optimistic-") ? "opacity-60" : ""
            }`}
          >
            <div>{m.text}</div>
            <div className="mt-1 font-mono text-xs text-muted-foreground">
              {m.createdAt}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
