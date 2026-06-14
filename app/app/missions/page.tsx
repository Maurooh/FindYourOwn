import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  getMissionsWithStatus,
  getSuggestedMissions,
} from '@/lib/queries'
import { MissionListCard } from '@/components/mission-list-card'
import { SuggestedMissionCard } from '@/components/suggested-mission-card'
import { CreateMissionDialog } from '@/components/create-mission-dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Sparkles } from 'lucide-react'

export default async function MissionsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [missions, suggested] = await Promise.all([
    getMissionsWithStatus(user.id),
    getSuggestedMissions(user.id),
  ])

  const daily = missions.filter((m) => m.type === 'daily')
  const weekly = missions.filter((m) => m.type === 'weekly')
  const custom = missions.filter((m) => m.type === 'custom')

  return (
    <div className="flex flex-col gap-5 px-4 pt-6 md:px-0">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Missões</h1>
          <p className="text-sm text-muted-foreground">
            Complete missões e ganhe XP.
          </p>
        </div>
        <CreateMissionDialog />
      </header>

      <div className="grid gap-5 md:grid-cols-[1.4fr_1fr] md:items-start">
        <div className="flex flex-col gap-4">
          <Tabs defaultValue="daily">
            <TabsList className="w-full">
              <TabsTrigger value="daily" className="flex-1">
                Diárias
                {daily.length > 0 && (
                  <span className="ml-1 text-muted-foreground">
                    ({daily.filter((m) => m.completed).length}/
                    {daily.length})
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="weekly" className="flex-1">
                Semanais
                {weekly.length > 0 && (
                  <span className="ml-1 text-muted-foreground">
                    ({weekly.filter((m) => m.completed).length}/
                    {weekly.length})
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex-1">
                Suas
                {custom.length > 0 && (
                  <span className="ml-1 text-muted-foreground">
                    ({custom.length})
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="mt-4">
              <MissionGroup
                missions={daily}
                emptyText="Nenhuma missão diária ainda. Adicione algumas nas sugestões!"
              />
            </TabsContent>

            <TabsContent value="weekly" className="mt-4">
              <MissionGroup
                missions={weekly}
                emptyText="Nenhuma missão semanal ainda. Adicione algumas nas sugestões!"
              />
            </TabsContent>

            <TabsContent value="custom" className="mt-4">
              <MissionGroup
                missions={custom}
                deletable
                emptyText="Você ainda não criou nenhuma missão personalizada. Use o botão 'Nova missão'."
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sugestões */}
        <section className="rounded-3xl border border-border bg-card p-5">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <Sparkles className="h-4 w-4 text-primary" /> Missões sugeridas
          </h2>
          {suggested.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Você já adicionou todas as missões sugeridas!
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
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
  deletable = false,
}: {
  missions: import('@/lib/queries').MissionWithStatus[]
  emptyText: string
  deletable?: boolean
}) {
  if (missions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-6 text-center">
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      {missions.map((m) => (
        <MissionListCard key={m.id} mission={m} deletable={deletable} />
      ))}
    </div>
  )
}