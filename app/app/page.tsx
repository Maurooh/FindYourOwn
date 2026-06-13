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
import { Flame, Trophy, ChevronRight, Sparkles } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
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
    <div className="flex flex-col gap-5 px-4 pt-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{greeting},</p>
          <h1 className="text-xl font-bold tracking-tight">
            {profile.display_name ?? 'Jogador'}
          </h1>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5">
          <Flame className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">
            {profile.current_streak}
          </span>
          <span className="text-xs text-muted-foreground">dias</span>
        </div>
      </header>

      {/* Hero level card */}
      <section className="rounded-3xl border border-border bg-card p-5">
        <div className="flex items-center gap-4">
          <LevelRing level={progress.level} percent={progress.percent} />
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" />
              {levelTitle(progress.level)}
            </span>
            <p className="mt-2 text-2xl font-bold leading-none">
              {profile.total_xp.toLocaleString('pt-BR')}{' '}
              <span className="text-sm font-normal text-muted-foreground">
                XP total
              </span>
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Faltam{' '}
              <span className="font-medium text-foreground">
                {progress.xpForNextLevel - progress.xpIntoLevel} XP
              </span>{' '}
              para o nível {progress.level + 1}
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Hoje"
          value={`${completedToday}/${dailyMissions.length}`}
          hint="missões"
        />
        <StatCard
          label="Sequência"
          value={`${profile.current_streak}`}
          hint="dias"
        />
        <StatCard
          label="Ranking"
          value={myRank > 0 ? `#${myRank}` : '—'}
          hint="entre amigos"
        />
      </div>

      {/* Missões de hoje */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Missões de hoje</h2>
          <Link
            href="/app/missions"
            className="flex items-center text-xs font-medium text-primary"
          >
            Ver todas <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {dailyMissions.length === 0 ? (
          <EmptyMissions />
        ) : (
          <div className="flex flex-col gap-2.5">
            {dailyMissions.slice(0, 5).map((m) => (
              <MissionCard key={m.id} mission={m} />
            ))}
          </div>
        )}
      </section>

      {/* Atributos */}
      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="mb-4 font-semibold">Atributos</h2>
        <AttributesPanel attributes={attributes} />
      </section>

      {/* Ranking preview */}
      <section className="rounded-3xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold">
            <Trophy className="h-4 w-4 text-primary" /> Ranking
          </h2>
          <Link
            href="/app/friends"
            className="flex items-center text-xs font-medium text-primary"
          >
            Ver tudo <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          {ranking.slice(0, 3).map((entry, i) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 rounded-xl px-1 py-1.5"
            >
              <span className="w-5 text-center text-sm font-bold text-muted-foreground">
                {i + 1}
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
                {(entry.display_name ?? '?').slice(0, 2).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {entry.display_name ?? 'Jogador'}
                {entry.isCurrentUser && (
                  <span className="ml-1 text-xs text-primary">(você)</span>
                )}
              </span>
              <span className="text-xs text-muted-foreground">
                Nv {entry.level}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 text-center">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold leading-none">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
    </div>
  )
}

function EmptyMissions() {
  return (
    <div className="rounded-2xl border border-dashed border-border p-6 text-center">
      <p className="text-sm text-muted-foreground">
        Nenhuma missão por aqui. Crie a sua primeira!
      </p>
      <Link
        href="/app/missions"
        className="mt-2 inline-block text-sm font-medium text-primary"
      >
        Ir para missões
      </Link>
    </div>
  )
}
