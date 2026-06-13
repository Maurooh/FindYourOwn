'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, Swords, Users, User } from 'lucide-react'

const ITEMS = [
  { href: '/app', label: 'Início', icon: Home },
  { href: '/app/missions', label: 'Missões', icon: Swords },
  { href: '/app/friends', label: 'Amigos', icon: Users },
  { href: '/app/profile', label: 'Perfil', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
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
                'flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <item.icon
                className={cn('h-5 w-5', active && 'fill-primary/15')}
              />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
