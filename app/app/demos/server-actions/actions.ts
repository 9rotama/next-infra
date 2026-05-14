"use server"

type Message = { id: string; text: string; createdAt: string }

const messages: Message[] = []

export async function addMessage(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const text = String(formData.get("text") ?? "").trim()
  if (!text) return { ok: false, error: "本文を入力するにゃ" }
  if (text.length > 140) return { ok: false, error: "140文字までにゃ" }

  await new Promise((r) => setTimeout(r, 600))
  messages.unshift({
    id: crypto.randomUUID(),
    text,
    createdAt: new Date().toISOString(),
  })
  return { ok: true }
}

export async function listMessages(): Promise<Message[]> {
  return messages.slice(0, 20)
}
