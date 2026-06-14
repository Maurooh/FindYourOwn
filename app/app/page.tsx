import {
  Trophy,
  Flame,
  Target,
  ChevronRight,
  Users,
  TrendingUp,
  BookOpen,
  Dumbbell,
  Wallet,
  Sparkles,
  Crown,
} from 'lucide-react'

const stats = [
  {
    icon: Trophy,
    value: '2.480',
    label: 'XP Total',
    tone: 'text-primary',
    bg: 'bg-primary/12',
  },
  {
    icon: Flame,
    value: '12',
    label: 'Dias seguidos',
    tone: 'text-streak',
    bg: 'bg-streak/12',
  },
  {
    icon: Target,
    value: '3/5',
    label: 'Missões hoje',
    tone: 'text-mission',
    bg: 'bg-mission/12',
  },
  {
    icon: TrendingUp,
    value: '#4',
    label: 'Ranking da guilda',
    tone: 'text-rank',
    bg: 'bg-rank/12',
  },
]

const missions = [
  {
    icon: BookOpen,
    title: 'Ler 10 páginas',
    category: 'Conhecimento',
    xp: 30,
    tone: 'text-rank',
    bg: 'bg-rank/12',
  },
  {
    icon: Dumbbell,
    title: 'Treinar 20 minutos',
    category: 'Saúde',
    xp: 50,
    tone: 'text-mission',
    bg: 'bg-mission/12',
  },
  {
    icon: Wallet,
    title: 'Planejar gastos da semana',
    category: 'Finanças',
    xp: 40,
    tone: 'text-streak',
    bg: 'bg-streak/12',
  },
]

const guild = [
  { rank: 1, name: 'João', xp: '3.240', medal: '🥇' },
  { rank: 2, name: 'Ana', xp: '2.890', medal: '🥈' },
  { rank: 3, name: 'Carlos', xp: '2.710', medal: '🥉' },
  { rank: 4, name: 'Você', xp: '2.480', medal: null, isYou: true },
]

export default function DashboardPage() {
  return (
    <main className="min-h-screen p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/15 blur-3xl"
          />
          <div className="relative p-6 md:p-8">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-5">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-primary/30 bg-primary/12">
                  <span className="text-3xl font-bold text-primary">11</span>
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Nível
                  </span>
                </div>

                <div>
                  <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.3em] text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    Find Your Own
                  </p>
                  <h1 className="mt-2 text-pretty text-3xl font-bold md:text-4xl">
                    Guerreiro Nível 11
                  </h1>
                  <p className="mt-1.5 text-muted-foreground">
                    Você está mais perto do próximo nível do que imagina.
                  </p>
                </div>
              </div>

              <div className="w-full max-w-md rounded-2xl border border-border bg-secondary/40 p-5">
                <div className="mb-2.5 flex items-end justify-between">
                  <span className="text-sm font-semibold">
                    2.480 <span className="text-muted-foreground">XP</span>
                  </span>
                  <span className="text-sm font-bold text-primary">68%</span>
                </div>

                <div
                  className="h-3 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuenow={68}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Progresso do nível"
                >
                  <div
                    className="h-full rounded-full bg-primary shadow-[0_0_12px_var(--primary)]"
                    style={{ width: '68%' }}
                  />
                </div>

                <p className="mt-2.5 text-xs text-muted-foreground">
                  Faltam <span className="font-semibold text-foreground">820 XP</span> para o próximo nível
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* RESUMO */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}
              >
                <stat.icon className={`h-5 w-5 ${stat.tone}`} />
              </div>
              <h2 className="mt-4 text-2xl font-bold tracking-tight">
                {stat.value}
              </h2>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* GRID PRINCIPAL */}
        <section className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          {/* MISSÕES */}
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Missões de Hoje</h2>
                <p className="text-sm text-muted-foreground">
                  3 de 5 concluídas
                </p>
              </div>
              <button
                type="button"
                className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                Ver todas
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {missions.map((mission) => (
                <div
                  key={mission.title}
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-secondary/30 p-4 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${mission.bg}`}
                    >
                      <mission.icon className={`h-5 w-5 ${mission.tone}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{mission.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {mission.category}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-primary/12 px-3 py-1 text-sm font-bold text-primary">
                    +{mission.xp} XP
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* GUILDA */}
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Sua Guilda</h2>
                <p className="text-sm text-muted-foreground">
                  Ranking semanal
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              {guild.map((member) => (
                <div
                  key={member.name}
                  className={`flex items-center justify-between gap-3 rounded-2xl border p-3 ${
                    member.isYou
                      ? 'border-primary/40 bg-primary/10'
                      : 'border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-bold">
                      {member.medal ?? member.name.charAt(0)}
                    </span>
                    <span
                      className={`font-medium ${member.isYou ? 'text-primary' : ''}`}
                    >
                      {member.isYou && (
                        <Crown className="mr-1 inline h-4 w-4 text-primary" />
                      )}
                      {member.name}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-semibold tabular-nums ${
                      member.isYou ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {member.xp} XP
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
