import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getFriends, getFriendsRanking } from '@/lib/queries'
import { AddFriendForm } from '@/components/add-friend-form'
import { FriendCard } from '@/components/friend-card'
import { Trophy, Users } from 'lucide-react'

export default async function FriendsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [friends, ranking] = await Promise.all([
    getFriends(user.id),
    getFriendsRanking(user.id),
  ])

  return (
    <div className="flex flex-col gap-5 px-4 pt-6 md:px-0">
      {/* Header */}
      <header>
        <h1 className="text-xl font-bold tracking-tight">Amigos</h1>
        <p className="text-sm text-muted-foreground">
          Evolua junto e suba no ranking.
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-[1.2fr_1fr] md:items-start">
        <div className="flex flex-col gap-5">
          {/* Adicionar amigo */}
          <section className="rounded-3xl border border-border bg-card p-5">
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <Users className="h-4 w-4 text-primary" /> Adicionar amigo
            </h2>
            <AddFriendForm />
            <p className="mt-2 text-xs text-muted-foreground">
              Peça o código de amigo da pessoa (disponível no perfil dela) e
              adicione aqui.
            </p>
          </section>

          {/* Lista de amigos */}
          <section>
            <h2 className="mb-3 font-semibold">
              Seus amigos {friends.length > 0 && `(${friends.length})`}
            </h2>
            {friends.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Você ainda não tem amigos adicionados. Use o código de
                  amigo para conectar com alguém!
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {friends.map((f) => (
                  <FriendCard key={f.friend_id} friend={f} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Ranking */}
        <section className="rounded-3xl border border-border bg-card p-5">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <Trophy className="h-4 w-4 text-primary" /> Ranking
          </h2>
          {ranking.length <= 1 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Adicione amigos para ver o ranking.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {ranking.map((entry, i) => (
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
                      <span className="ml-1 text-xs text-primary">
                        (você)
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Nv {entry.level}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}