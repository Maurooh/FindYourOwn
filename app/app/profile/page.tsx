import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getProfile, getAttributes } from '@/lib/queries'
import { getLevelProgress, levelTitle } from '@/lib/game'
import { LevelRing } from '@/components/level-ring'
import { AttributesPanel } from '@/components/attributes-panel'
import { SignOutButton } from '@/components/sign-out-button'
import { FriendCodeBox } from '@/components/friend-code-box'
import { Flame, Sparkles, Trophy } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profile, attributes] = await Promise.all([
    getProfile(user.id),
    getAttributes(user.id),
  ])

  if (!profile) redirect('/auth/login')

  const progress = getLevelProgress(profile.total_xp)

  return (
    <div className="flex flex-col gap-6">
      {/* Hero card */}
      <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 via-primary/8 to-transparent p-6">
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -left-6 bottom-0 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
          <LevelRing level={progress.level} percent={progress.percent} size={96} />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-2xl font-bold leading-tight truncate">
                  {profile.display_name ?? 'Jogador'}
                </p>
                <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  <Sparkles className="h-3 w-3" />
                  {levelTitle(progress.level)}
                </span>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-2xl font-bold tabular-nums leading-tight">
                  {profile.total_xp.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-muted-foreground">XP total</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground">Nível {progress.level}</span>
                <span className="text-xs text-muted-foreground">
                  {progress.xpIntoLevel.toLocaleString('pt-BR')} / {progress.xpForNextLevel.toLocaleString('pt-BR')} XP
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary shadow-sm shadow-primary/50 transition-all"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Faltam{' '}
                <span className="font-medium text-foreground">
                  {(progress.xpForNextLevel - progress.xpIntoLevel).toLocaleString('pt-BR')} XP
                </span>{' '}
                para o nível {progress.level + 1}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
            <Flame className="h-4 w-4 text-orange-400" />
          </span>
          <p className="text-2xl font-bold leading-none tabular-nums">{profile.current_streak}</p>
          <p className="text-xs text-muted-foreground leading-tight">Sequência atual</p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/10">
            <Trophy className="h-4 w-4 text-yellow-400" />
          </span>
          <p className="text-2xl font-bold leading-none tabular-nums">{profile.longest_streak}</p>
          <p className="text-xs text-muted-foreground leading-tight">Melhor sequência</p>
        </div>
      </div>

      {/* Atributos + Código */}
      <div className="grid gap-4 md:grid-cols-[1fr_260px]">
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Atributos</h2>
          <AttributesPanel attributes={attributes} />
        </section>

        <div className="flex flex-col gap-4">
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-1 text-sm font-semibold">Código de amigo</h2>
            <p className="mb-3 text-xs text-muted-foreground">Compartilhe para que amigos possam te adicionar.</p>
            <FriendCodeBox code={profile.friend_code} />
          </section>
          <SignOutButton />
        </div>
      </div>

    </div>
  )
}
