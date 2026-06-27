'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, Swords, Users, User, Flame, Star, Trophy } from 'lucide-react'

const ITEMS = [
  { href: '/app', label: 'Início', icon: Home, description: 'Visão geral' },
  { href: '/app/missions', label: 'Missões', icon: Swords, description: 'Suas tarefas' },
  { href: '/app/groups', label: 'Grupos', icon: Trophy, description: 'Competições mensais' },
  { href: '/app/friends', label: 'Amigos', icon: Users, description: 'Ranking & social' },
  { href: '/app/profile', label: 'Perfil', icon: User, description: 'Sua jornada' },
]

export function Sidebar({ streak, level }: { streak: number | null; level: number | null }) {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col md:flex overflow-hidden">
      {/* Background com gradiente sutil */}
      <div className="absolute inset-0 bg-card/80 backdrop-blur-xl border-r border-border" />
      {/* Glow decorativo no topo */}
      <div aria-hidden className="pointer-events-none absolute -top-20 -left-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative flex flex-col h-full px-4 py-6">
        {/* Logo */}
        <Link href="/app" className="mb-8 group flex items-center gap-3 px-2">
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden">
            <Image src="/find-your-own-primary-180.png" alt="Find Your Own" width={40} height={40} className="object-cover" />
          </span>
          <div>
            <p className="text-sm font-bold tracking-tight leading-none">Find Your Own</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Desenvolvimento pessoal</p>
          </div>
        </Link>

        {/* Label da seção */}
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Navegação
        </p>

        {/* Nav */}
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
                  'group relative flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-150',
                  active
                    ? 'bg-primary/12 text-primary'
                    : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground',
                )}
              >
                {/* Borda esquerda ativa */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-primary shadow-sm shadow-primary/50" />
                )}

                {/* Ícone com fundo */}
                <span className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all',
                  active
                    ? 'bg-primary/20 text-primary shadow-sm shadow-primary/20'
                    : 'bg-secondary/60 text-muted-foreground group-hover:bg-secondary group-hover:text-foreground',
                )}>
                  <item.icon className="h-4 w-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className={cn('text-sm font-medium leading-none', active && 'text-primary')}>{item.label}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground/70 leading-none">{item.description}</p>
                </div>

                {active && (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary animate-pulse" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Separador */}
        <div className="my-6 h-px bg-border/60" />

        {/* Stats rápidas */}
        <div className="flex flex-col gap-2 px-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Status rápido
          </p>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1 rounded-lg border border-border bg-secondary/30 p-2.5">
              <Flame className="h-3.5 w-3.5 text-orange-400" />
              <p className="text-xs font-bold leading-none">{streak ?? '—'}</p>
              <p className="text-[10px] text-muted-foreground leading-none">Sequência</p>
            </div>
            <div className="flex flex-col gap-1 rounded-lg border border-border bg-secondary/30 p-2.5">
              <Star className="h-3.5 w-3.5 text-yellow-400" />
              <p className="text-xs font-bold leading-none">{level ?? '—'}</p>
              <p className="text-[10px] text-muted-foreground leading-none">Nível</p>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="mt-auto">
          <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-4">
            <div aria-hidden className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-primary/15 blur-xl" />
            <p className="relative text-xs font-semibold text-primary">💡 Dica</p>
            <p className="relative mt-1 text-[11px] text-muted-foreground leading-relaxed">
              Complete missões todos os dias para manter sua sequência e subir no ranking!
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
