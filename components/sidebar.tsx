'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, Swords, Users, User, Compass } from 'lucide-react'

const ITEMS = [
  { href: '/app', label: 'Início', icon: Home },
  { href: '/app/missions', label: 'Missões', icon: Swords },
  { href: '/app/friends', label: 'Amigos', icon: Users },
  { href: '/app/profile', label: 'Perfil', icon: User },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card/40 px-4 py-6 md:flex">
      <Link href="/app" className="mb-8 flex items-center gap-2 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Compass className="h-5 w-5" />
        </span>
        <span className="text-lg font-semibold tracking-tight">
          Find Your Own
        </span>
      </Link>

      <nav className="flex flex-col gap-1">
        {ITEMS.map((item) => {
          const active =
            item.href === '/app'
              ? pathname === '/app'
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
              )}
            >
              <item.icon
                className={cn('h-5 w-5', active && 'fill-primary/15')}
              />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}