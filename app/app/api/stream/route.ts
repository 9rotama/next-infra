export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 1; i <= 10; i++) {
        controller.enqueue(
          encoder.encode(`chunk ${i} @ ${new Date().toISOString()}\n`),
        )
        await new Promise((r) => setTimeout(r, 400))
      }
      controller.close()
    },
  })
  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  })
}
