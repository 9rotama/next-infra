import Image from "next/image"

export const metadata = { title: "Image demo" }

function Section({
  title,
  desc,
  children,
}: {
  title: string
  desc: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3 border-t pt-6">
      <div>
        <h2 className="font-medium">{title}</h2>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
      {children}
    </section>
  )
}

export default function ImageDemo() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-semibold">Image Optimization</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          DevTools の Network タブを開いて、{" "}
          <code className="rounded bg-muted px-1">/_next/image</code> 経由で
          AVIF/WebP に最適化されている事と、画面幅に応じた srcset を確認するにゃ。
        </p>
      </header>

      <Section
        title="1. Remote image + responsive sizes"
        desc="remotePatterns 経由で取得。sizes に応じて適切な解像度が配信される。"
      >
        <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg">
          <Image
            src="https://picsum.photos/id/1015/2000/1333"
            alt="remote mountain"
            fill
            sizes="(max-width: 768px) 100vw, 720px"
            className="object-cover"
          />
        </div>
      </Section>

      <Section
        title="2. priority + above-the-fold"
        desc="priority を付けると preload され LCP を改善する。1枚目に最適。"
      >
        <Image
          src="https://picsum.photos/id/1025/1200/800"
          alt="priority dog"
          width={1200}
          height={800}
          priority
          sizes="(max-width: 768px) 100vw, 720px"
          className="h-auto w-full rounded-lg"
        />
      </Section>

      <Section
        title="3. placeholder=blur (remote, blurDataURL)"
        desc="読み込み中はぼかしを表示。LCP の体感が改善される。"
      >
        <Image
          src="https://picsum.photos/id/1043/1200/800"
          alt="blur placeholder"
          width={1200}
          height={800}
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMCAxMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjY2NjIi8+PC9zdmc+"
          sizes="(max-width: 768px) 100vw, 720px"
          className="h-auto w-full rounded-lg"
        />
      </Section>

      <Section
        title="4. lazy loading (default)"
        desc="ビューポート外は遅延ロード。下までスクロールして Network を見るにゃ。"
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[1050, 1062, 1074, 110, 119, 122].map((id) => (
            <div
              key={id}
              className="relative aspect-square overflow-hidden rounded-md"
            >
              <Image
                src={`https://picsum.photos/id/${id}/600/600`}
                alt={`lazy ${id}`}
                fill
                sizes="(max-width: 640px) 50vw, 240px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}
