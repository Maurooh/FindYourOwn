import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  getMyGroups,
  getGroupCompetition,
  getGroupPendingRequests,
  getMyGroupInvites,
  getFriends,
} from '@/lib/queries'
import { CreateGroupDialog } from '@/components/create-group-dialog'
import { JoinGroupForm } from '@/components/join-group-form'
import { GroupsView } from '@/components/groups-view'
import { Trophy } from 'lucide-react'

export default async function GroupsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [groups, invites, friends] = await Promise.all([
    getMyGroups(user.id),
    getMyGroupInvites(user.id),
    getFriends(user.id),
  ])

  const [competitionsByGroup, requestsByGroup, memberIdsByGroup] = await Promise.all([
    Promise.all(groups.map((g) => getGroupCompetition(g.id, user.id).then((c) => [g.id, c] as const)))
      .then((entries) => Object.fromEntries(entries)),
    Promise.all(
      groups.filter((g) => g.is_owner).map((g) =>
        getGroupPendingRequests(g.id).then((r) => [g.id, r] as const)
      )
    ).then((entries) => Object.fromEntries(entries)),
    // buscar membros de cada grupo para o InviteFriendsDialog saber quem já está dentro
    Promise.all(groups.map(async (g) => {
      const { data } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', g.id)
      return [g.id, (data ?? []).map((m) => m.user_id)] as const
    })).then((entries) => Object.fromEntries(entries)),
  ])

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grupos</h1>
          <p className="mt-1 text-sm text-muted-foreground">Compita com sua galera todo mês.</p>
        </div>
        <CreateGroupDialog />
      </header>

      {/* Entrar por código */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-1 text-sm font-semibold">Entrar em um grupo</h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Peça o código do grupo e solicite entrada — o dono precisará aprovar.
        </p>
        <JoinGroupForm />
      </section>

      {/* Grupos */}
      {groups.length === 0 && invites.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
            <Trophy className="h-7 w-7 text-muted-foreground/50" />
          </div>
          <div>
            <p className="text-base font-semibold">Nenhum grupo ainda</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Crie um grupo ou entre com o código de alguém para começar a competir.
            </p>
          </div>
        </div>
      ) : (
        <>
          {groups.length > 0 && (
            <h2 className="text-base font-semibold -mb-3">
              Seus grupos{' '}
              <span className="text-sm font-normal text-muted-foreground">({groups.length})</span>
            </h2>
          )}
          <GroupsView
            groups={groups}
            competitionsByGroup={competitionsByGroup}
            requestsByGroup={requestsByGroup}
            invites={invites}
            friends={friends}
            memberIdsByGroup={memberIdsByGroup}
          />
        </>
      )}
    </div>
  )
}
