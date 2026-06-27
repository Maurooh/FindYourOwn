'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, Swords, Users, User, Trophy } from 'lucide-react'

const ITEMS = [
  { href: '/app', label: 'Início', icon: Home },
  { href: '/app/missions', label: 'Missões', icon: Swords },
  { href: '/app/groups', label: 'Grupos', icon: Trophy },
  { href: '/app/friends', label: 'Amigos', icon: Users },
  { href: '/app/profile', label: 'Perfil', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/90 backdrop-blur-xl md:hidden">
      <div className="flex items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
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
                'flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <span className={cn(
                'flex h-7 w-7 items-center justify-center rounded-lg transition-all',
                active && 'bg-primary/15',
              )}>
                <item.icon className={cn('h-4.5 w-4.5', active && 'text-primary')} />
              </span>
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
