import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  getProfile,
  getAttributes,
  getRecentHistory,
} from '@/lib/queries'
import { getLevelProgress, levelTitle } from '@/lib/game'
import { LevelRing } from '@/components/level-ring'
import { AttributesPanel } from '@/components/attributes-panel'
import { MissionIcon } from '@/components/mission-icon'
import { SignOutButton } from '@/components/sign-out-button'
import { FriendCodeBox } from '@/components/friend-code-box'
import {
  Flame,
  Sparkles,
  Trophy,
  Calendar,
} from 'lucide-react'

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profile, attributes, history] = await Promise.all([
    getProfile(user.id),
    getAttributes(user.id),
    getRecentHistory(user.id, 10),
  ])

  if (!profile) redirect('/auth/login')

  const progress = getLevelProgress(profile.total_xp)

  return (
    <div className="flex flex-col gap-5 px-4 pt-6 md:px-0">
      {/* Header */}
      <header>
        <h1 className="text-xl font-bold tracking-tight">Perfil</h1>
        <p className="text-sm text-muted-foreground">
          Sua jornada, do começo até aqui.
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-[1.2fr_1fr] md:items-start">
        <div className="flex flex-col gap-5">
          {/* Hero do jogador */}
          <section className="rounded-3xl border border-border bg-card p-5">
            <div className="flex items-center gap-4">
              <LevelRing level={progress.level} percent={progress.percent} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-bold leading-tight">
                  {profile.display_name ?? 'Jogador'}
                </p>
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary">
                  <Sparkles className="h-3 w-3" />
                  {levelTitle(progress.level)}
                </span>
                <p className="mt-2 text-xl font-bold leading-none">
                  {profile.total_xp.toLocaleString('pt-BR')}{' '}
                  <span className="text-sm font-normal text-muted-foreground">
                    XP total
                  </span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
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

          {/* Código de amigo */}
          <section className="rounded-3xl border border-border bg-card p-5">
            <h2 className="mb-3 font-semibold">Código de amigo</h2>
            <FriendCodeBox code={profile.friend_code} />
            <p className="mt-2 text-xs text-muted-foreground">
              Compartilhe esse código para que outras pessoas possam te
              adicionar como amigo.
            </p>
          </section>

          {/* Stats */}
          <section className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-card p-4 text-center">
              <Flame className="mx-auto h-5 w-5 text-primary" />
              <p className="mt-2 text-xl font-bold leading-none">
                {profile.current_streak}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                dias de sequência
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 text-center">
              <Trophy className="mx-auto h-5 w-5 text-primary" />
              <p className="mt-2 text-xl font-bold leading-none">
                {profile.longest_streak}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                melhor sequência
              </p>
            </div>
          </section>

          {/* Sair */}
          <SignOutButton />
        </div>

        <div className="flex flex-col gap-5">
          {/* Atributos */}
          <section className="rounded-3xl border border-border bg-card p-5">
            <h2 className="mb-4 font-semibold">Atributos</h2>
            <AttributesPanel attributes={attributes} />
          </section>

          {/* Histórico recente */}
          <section className="rounded-3xl border border-border bg-card p-5">
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <Calendar className="h-4 w-4 text-primary" /> Atividade recente
            </h2>
            {history.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nenhuma missão concluída ainda.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {history.map((h) => {
                  const mission = Array.isArray(h.missions)
                    ? h.missions[0]
                    : h.missions
                  return (
                    <div
                      key={h.id}
                      className="flex items-center gap-3 rounded-xl px-1 py-1.5"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                        <MissionIcon
                          name={mission?.icon ?? 'target'}
                          className="h-4 w-4"
                        />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {mission?.title ?? 'Missão'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(h.completed_at).toLocaleDateString(
                            'pt-BR',
                            { day: '2-digit', month: 'short' },
                          )}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-primary">
                        +{h.xp_earned} XP
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}