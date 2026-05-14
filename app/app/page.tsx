import Link from "next/link"

const demos = [
  {
    href: "/demos/image",
    title: "Image Optimization",
    desc: "next/image: remote / local / priority / blur placeholder / responsive sizes",
  },
  {
    href: "/demos/streaming",
    title: "Streaming (Suspense)",
    desc: "Server Components が遅延データを Suspense でストリーミング配信",
  },
  {
    href: "/demos/isr",
    title: "ISR (Incremental Static Regeneration)",
    desc: "revalidate / on-demand revalidation の挙動を確認",
  },
]

export default function Page() {
  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-semibold">Next.js features demo</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        インフラ上で Next.js の挙動を試すためのページ集にゃ。
      </p>
      <ul className="mt-8 flex flex-col gap-3">
        {demos.map((d) => (
          <li key={d.href}>
            <Link
              href={d.href}
              className="block rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <div className="font-medium">{d.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{d.desc}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
