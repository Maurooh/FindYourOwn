import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getMissionsWithStatus, getSuggestedMissions } from '@/lib/queries'
import { MissionListCard } from '@/components/mission-list-card'
import { SuggestedMissionCard } from '@/components/suggested-mission-card'
import { CreateMissionDialog } from '@/components/create-mission-dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Sparkles, Swords, Plus } from 'lucide-react'

export default async function MissionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [missions, suggested] = await Promise.all([
    getMissionsWithStatus(user.id),
    getSuggestedMissions(user.id),
  ])

  const daily = missions.filter((m) => m.type === 'daily')
  const weekly = missions.filter((m) => m.type === 'weekly')
  const custom = missions.filter((m) => m.type === 'custom')

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Missões</h1>
          <p className="mt-1 text-sm text-muted-foreground">Complete desafios e ganhe XP.</p>
        </div>
        <CreateMissionDialog />
      </header>

      <div className="grid gap-6 md:grid-cols-[1fr_280px] md:items-start">
        {/* Tabs */}
        <div className="flex flex-col gap-4">
          <Tabs defaultValue="daily">
            <TabsList className="w-full rounded-xl p-1 h-auto">
              {[
                { value: 'daily', label: 'Diárias', count: daily.length, done: daily.filter(m => m.completed).length },
                { value: 'weekly', label: 'Semanais', count: weekly.length, done: weekly.filter(m => m.completed).length },
                { value: 'custom', label: 'Suas', count: custom.length, done: null },
              ].map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="flex-1 gap-2 text-sm rounded-lg data-[state=active]:shadow-sm">
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground leading-none">
                      {tab.done !== null ? `${tab.done}/${tab.count}` : tab.count}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="daily" className="mt-4">
              <MissionGroup missions={daily} emptyText="Nenhuma missão diária." emptyHint="Adicione nas sugestões ao lado!" />
            </TabsContent>
            <TabsContent value="weekly" className="mt-4">
              <MissionGroup missions={weekly} emptyText="Nenhuma missão semanal." emptyHint="Adicione nas sugestões ao lado!" />
            </TabsContent>
            <TabsContent value="custom" className="mt-4">
              <MissionGroup missions={custom} deletable emptyText="Nenhuma missão personalizada." emptyHint="Use o botão 'Nova missão' no topo." />
            </TabsContent>
          </Tabs>
        </div>

        {/* Suggested */}
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Sugeridas
          </h2>
          {suggested.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Swords className="h-7 w-7 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Você já adicionou todas!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {suggested.map((m) => (
                <SuggestedMissionCard key={m.id} mission={m} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function MissionGroup({
  missions,
  emptyText,
  emptyHint,
  deletable = false,
}: {
  missions: import('@/lib/queries').MissionWithStatus[]
  emptyText: string
  emptyHint?: string
  deletable?: boolean
}) {
  if (missions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-border p-10 text-center">
        <Swords className="h-7 w-7 text-muted-foreground/30" />
        <p className="text-sm font-medium text-muted-foreground">{emptyText}</p>
        {emptyHint && <p className="text-xs text-muted-foreground/70">{emptyHint}</p>}
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-2">
      {missions.map((m) => (
        <MissionListCard key={m.id} mission={m} deletable={deletable} />
      ))}
    </div>
  )
}
