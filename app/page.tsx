import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import {
  Compass,
  Swords,
  Flame,
  TrendingUp,
  Users,
  Trophy,
  ArrowRight,
} from 'lucide-react'

export default async function LandingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect('/app')

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Compass className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            Find Your Own
          </span>
        </div>
        <Link href="/auth/login">
          <Button variant="ghost" size="sm">Entrar</Button>
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-5 pt-10 pb-16 md:pt-20">
        <div className="flex flex-col items-center text-center">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <Flame className="h-3.5 w-3.5 text-primary" />O RPG da vida real
          </span>
          <h1 className="max-w-3xl text-balance text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Evolua a sua vida como se fosse{' '}
            <span className="text-primary">um jogo</span>.
          </h1>
          <p className="mt-5 max-w-xl text-pretty leading-relaxed text-muted-foreground md:text-lg">
            Complete missões diárias e semanais, ganhe XP, suba de nível e
            evolua seus atributos. Acompanhe sua evolução ao lado dos seus
            amigos.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/auth/sign-up">
              <Button size="lg" className="gap-2">
                Começar agora <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="secondary">Já tenho conta</Button>
            </Link>
          </div>
        </div>

        {/* Feature grid */}
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Swords,
              title: 'Missões',
              desc: 'Tarefas diárias, semanais e personalizadas para a sua jornada.',
            },
            {
              icon: TrendingUp,
              title: 'Atributos',
              desc: 'Saúde, Conhecimento, Disciplina, Social e Finanças.',
            },
            {
              icon: Flame,
              title: 'Streak',
              desc: 'Mantenha a constância e não quebre a sua sequência.',
            },
            {
              icon: Trophy,
              title: 'Ranking',
              desc: 'Compare seu progresso com amigos e suba no ranking.',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Find Your Own
          </span>
          <span>Sua jornada começa hoje.</span>
        </div>
      </footer>
    </main>
  )
}