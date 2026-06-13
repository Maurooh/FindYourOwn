import Link from 'next/link'
import { Compass } from 'lucide-react'

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <main className="flex min-h-svh w-full flex-col items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Compass className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            Find Your Own
          </span>
        </Link>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </main>
  )
}
