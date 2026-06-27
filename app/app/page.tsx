import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  getProfile,
  getAttributes,
  getMissionsWithStatus,
  getFriendsRanking,
} from '@/lib/queries'
import { getLevelProgress, levelTitle } from '@/lib/game'
import { LevelRing } from '@/components/level-ring'
import { AttributesPanel } from '@/components/attributes-panel'
import { MissionCard } from '@/components/mission-card'
import { Flame, Trophy, ChevronRight, Sparkles, Swords, ArrowRight } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profile, attributes, missions, ranking] = await Promise.all([
    getProfile(user.id),
    getAttributes(user.id),
    getMissionsWithStatus(user.id),
    getFriendsRanking(user.id),
  ])

  if (!profile) redirect('/auth/login')

  const progress = getLevelProgress(profile.total_xp)
  const dailyMissions = missions.filter((m) => m.type === 'daily')
  const completedToday = dailyMissions.filter((m) => m.completed).length
  const myRank = ranking.findIndex((r) => r.isCurrentUser) + 1

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Bom dia'
    if (h < 18) return 'Boa tarde'
    return 'Boa noite'
  })()

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <header className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{greeting} 👋</p>
          <h1 className="mt-0.5 text-3xl font-bold tracking-tight">
            {profile.display_name ?? 'Jogador'}
          </h1>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-2">
          <Flame className="h-4 w-4 text-orange-400" />
          <span className="text-sm font-bold text-orange-400">{profile.current_streak}</span>
          <span className="text-xs text-muted-foreground">dias</span>
        </div>
      </header>

      {/* Hero — Level card */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 p-6">
        <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative flex items-center gap-5">
          <LevelRing level={progress.level} percent={progress.percent} size={96} />
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 border border-primary/30 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3 w-3" />
              {levelTitle(progress.level)}
            </span>
            <p className="mt-3 text-3xl font-bold leading-none tabular-nums">
              {profile.total_xp.toLocaleString('pt-BR')}
              <span className="ml-1.5 text-base font-normal text-muted-foreground">XP</span>
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Faltam{' '}
              <span className="font-semibold text-foreground">
                {(progress.xpForNextLevel - progress.xpIntoLevel).toLocaleString('pt-BR')} XP
              </span>{' '}
              para o nível {progress.level + 1}
            </p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all shadow-sm shadow-primary/50"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Missões hoje', value: `${completedToday}/${dailyMissions.length}`, sub: 'concluídas', icon: Swords, color: 'text-primary' },
          { label: 'Sequência', value: `${profile.current_streak}`, sub: 'dias seguidos', icon: Flame, color: 'text-orange-400' },
          { label: 'Ranking', value: myRank > 0 ? `#${myRank}` : '—', sub: 'entre amigos', icon: Trophy, color: 'text-yellow-400' },
        ].map((s) => (
          <div key={s.label} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
            <s.icon className={`h-4 w-4 ${s.color}`} />
            <div>
              <p className="text-2xl font-bold leading-none">{s.value}</p>
              <p className="mt-1 text-[11px] text-muted-foreground leading-tight">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Missions */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Missões de hoje</h2>
            <Link href="/app/missions" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              Ver todas <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {dailyMissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border p-8 text-center">
              <Swords className="h-8 w-8 text-muted-foreground/30" />
              <div>
                <p className="text-sm font-medium">Nenhuma missão ainda</p>
                <p className="text-xs text-muted-foreground">Adicione missões para começar a ganhar XP</p>
              </div>
              <Link href="/app/missions" className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/15 transition-colors">
                Criar missão <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {dailyMissions.slice(0, 5).map((m) => (
                <MissionCard key={m.id} mission={m} />
              ))}
            </div>
          )}
        </section>

        <div className="flex flex-col gap-6">
          {/* Attributes */}
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Atributos</h2>
            <AttributesPanel attributes={attributes} />
          </section>

          {/* Ranking */}
          <section className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Ranking</h2>
              <Link href="/app/friends" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                Ver tudo <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {ranking.length <= 1 ? (
              <p className="py-3 text-center text-sm text-muted-foreground">Adicione amigos para ver o ranking.</p>
            ) : (
              <div className="flex flex-col gap-0.5">
                {ranking.slice(0, 3).map((entry, i) => (
                  <div key={entry.id} className={`flex items-center gap-3 rounded-lg px-2 py-2 ${entry.isCurrentUser ? 'bg-primary/8' : ''}`}>
                    <span className={`w-5 text-center text-xs font-bold ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                      {i + 1}
                    </span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-[11px] font-bold">
                      {(entry.display_name ?? '?').slice(0, 2).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {entry.display_name ?? 'Jogador'}
                      {entry.isCurrentUser && <span className="ml-1 text-xs text-primary">(você)</span>}
                    </span>
                    <span className="shrink-0 rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      Nv {entry.level}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
