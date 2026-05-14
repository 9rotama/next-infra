import Link from "next/link"

export default function DemosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto max-w-3xl p-8">
      <Link
        href="/"
        className="text-xs text-muted-foreground underline-offset-4 hover:underline"
      >
        ← back to index
      </Link>
      <div className="mt-4">{children}</div>
    </div>
  )
}
