import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getFriends, getFriendsRanking, getPendingRequests, getGlobalRanking } from '@/lib/queries'
import { AddFriendForm } from '@/components/add-friend-form'
import { FriendCard } from '@/components/friend-card'
import { FriendRequestCard } from '@/components/friend-request-card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Trophy, Users, Globe, Medal, Bell } from 'lucide-react'

export default async function FriendsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [friends, friendsRanking, pending, globalRanking] = await Promise.all([
    getFriends(user.id),
    getFriendsRanking(user.id),
    getPendingRequests(user.id),
    getGlobalRanking(user.id, 10),
  ])

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Amigos</h1>
          <p className="mt-1 text-sm text-muted-foreground">Evolua junto e dispute no ranking.</p>
        </div>
        {pending.length > 0 && (
          <div className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5">
            <Bell className="h-3.5 w-3.5 text-primary" />
            <span className="text-sm font-bold text-primary">{pending.length}</span>
            <span className="text-xs text-muted-foreground">
              {pending.length === 1 ? 'pedido' : 'pedidos'}
            </span>
          </div>
        )}
      </header>

      <div className="grid gap-6 md:grid-cols-[1fr_300px] md:items-start">
        <div className="flex flex-col gap-6">
          {/* Pending requests */}
          {pending.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <Bell className="h-4 w-4 text-primary" />
                Pedidos de amizade
                <span className="ml-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary">
                  {pending.length}
                </span>
              </h2>
              <div className="flex flex-col gap-2">
                {pending.map((r) => (
                  <FriendRequestCard key={r.requester_id} request={r} />
                ))}
              </div>
            </section>
          )}

          {/* Add friend */}
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-1 text-sm font-semibold">Adicionar amigo</h2>
            <p className="mb-4 text-xs text-muted-foreground">
              Digite o código de amigo que aparece no perfil da pessoa. Ela receberá um pedido para aceitar.
            </p>
            <AddFriendForm />
          </section>

          {/* Friends list */}
          <section className="flex flex-col gap-4">
            <h2 className="text-base font-semibold">
              Seus amigos{' '}
              {friends.length > 0 && (
                <span className="ml-1 text-sm font-normal text-muted-foreground">({friends.length})</span>
              )}
            </h2>
            {friends.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-10 text-center">
                <Users className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">Nenhum amigo ainda</p>
                <p className="text-xs text-muted-foreground/70">Use o código acima para conectar com alguém.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {friends.map((f) => (
                  <FriendCard key={f.friend_id} friend={f} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Rankings */}
        <div className="flex flex-col gap-4">
          <Tabs defaultValue="global">
            <TabsList className="w-full rounded-xl p-1 h-auto">
              <TabsTrigger value="global" className="flex-1 gap-1.5 text-sm rounded-lg">
                <Globe className="h-3.5 w-3.5" /> Global
              </TabsTrigger>
              <TabsTrigger value="friends" className="flex-1 gap-1.5 text-sm rounded-lg">
                <Users className="h-3.5 w-3.5" /> Amigos
              </TabsTrigger>
            </TabsList>

            {/* Global ranking */}
            <TabsContent value="global" className="mt-3">
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  <Globe className="h-3.5 w-3.5 text-primary" /> Ranking Global
                </h2>
                <RankingList entries={globalRanking.top} />
                {!globalRanking.userInTop && globalRanking.userEntry && (
                  <>
                    <div className="my-3 flex items-center gap-2">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-[11px] text-muted-foreground">sua posição</span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/8 px-2 py-2.5">
                      <span className="w-8 shrink-0 text-center text-sm font-bold text-muted-foreground">
                        #{globalRanking.userEntry.rank}
                      </span>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                        {(globalRanking.userEntry.display_name ?? '?').slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-primary">
                          {globalRanking.userEntry.display_name ?? 'Você'}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {globalRanking.userEntry.total_xp.toLocaleString('pt-BR')} XP
                        </p>
                      </div>
                      <span className="shrink-0 rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                        Nv {globalRanking.userEntry.level}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            {/* Friends ranking */}
            <TabsContent value="friends" className="mt-3">
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  <Trophy className="h-3.5 w-3.5 text-yellow-400" /> Entre amigos
                </h2>
                {friendsRanking.length <= 1 ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <Trophy className="h-7 w-7 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">Adicione amigos para ver o ranking.</p>
                  </div>
                ) : (
                  <RankingList entries={friendsRanking} />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function RankingList({ entries }: { entries: import('@/lib/queries').RankingEntry[] }) {
  const medalColors = ['text-yellow-400', 'text-slate-400', 'text-amber-600']

  return (
    <div className="flex flex-col gap-1">
      {entries.map((entry, i) => (
        <div
          key={entry.id}
          className={`flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors ${entry.isCurrentUser ? 'bg-primary/8 border border-primary/15' : ''}`}
        >
          <span className={`w-6 shrink-0 text-center ${i < 3 ? medalColors[i] : 'text-muted-foreground text-xs font-bold'}`}>
            {i < 3 ? <Medal className="h-4 w-4 mx-auto" /> : i + 1}
          </span>
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${entry.isCurrentUser ? 'bg-primary/20 text-primary' : 'bg-secondary'}`}>
            {(entry.display_name ?? '?').slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className={`truncate text-sm font-medium leading-tight ${entry.isCurrentUser ? 'text-primary' : ''}`}>
              {entry.display_name ?? 'Jogador'}
              {entry.isCurrentUser && <span className="ml-1 text-xs opacity-70">(você)</span>}
            </p>
            <p className="text-[11px] text-muted-foreground">{entry.total_xp.toLocaleString('pt-BR')} XP</p>
          </div>
          <span className="shrink-0 rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
            Nv {entry.level}
          </span>
        </div>
      ))}
    </div>
  )
}
