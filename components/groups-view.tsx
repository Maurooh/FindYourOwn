'use client'

import { useState } from 'react'
import { GroupCard } from '@/components/group-card'
import { GroupRequestsPanel } from '@/components/group-requests-panel'
import { Medal, Swords, Zap, Trophy, Users } from 'lucide-react'
import type { Group, GroupCompetitionEntry, GroupJoinRequest, MyGroupInvite, FriendProfile } from '@/lib/queries'
import { cn } from '@/lib/utils'

const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export function GroupsView({
  groups,
  competitionsByGroup,
  requestsByGroup,
  invites,
  friends,
  memberIdsByGroup,
}: {
  groups: Group[]
  competitionsByGroup: Record<string, GroupCompetitionEntry[]>
  requestsByGroup: Record<string, GroupJoinRequest[]>
  invites: MyGroupInvite[]
  friends: FriendProfile[]
  memberIdsByGroup: Record<string, string[]>
}) {
  const [selectedId, setSelectedId] = useState<string | null>(groups[0]?.id ?? null)
  const selectedGroup = groups.find((g) => g.id === selectedId) ?? null
  const competition = selectedId ? (competitionsByGroup[selectedId] ?? []) : []
  const selectedRequests = selectedId ? (requestsByGroup[selectedId] ?? []) : []

  const now = new Date()
  const monthLabel = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`
  const medalColors = ['text-yellow-400', 'text-slate-400', 'text-amber-600']

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_320px] md:items-start">
      {/* Lista de grupos + pedidos */}
      <div className="flex flex-col gap-3">
        <GroupRequestsPanel
          requests={selectedRequests}
          invites={invites}
        />
        {groups.map((g) => (
          <GroupCard
            key={g.id}
            group={g}
            selected={selectedId === g.id}
            onSelect={() => setSelectedId(g.id)}
            friends={friends}
            memberIds={memberIdsByGroup[g.id] ?? []}
          />
        ))}
      </div>

      {/* Ranking do grupo selecionado */}
      <div className="rounded-xl border border-border bg-card p-5">
        {selectedGroup ? (
          <>
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Competição — {monthLabel}
              </h2>
              <span className="flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[11px] font-semibold text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Ao vivo
              </span>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">{selectedGroup.name}</p>

            {competition.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <Trophy className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Nenhuma missão completada ainda este mês.</p>
                <p className="text-xs text-muted-foreground/70">Complete missões para aparecer no ranking!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {competition.map((entry, i) => (
                  <div
                    key={entry.user_id}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-2 py-3 transition-colors',
                      entry.isCurrentUser && 'bg-primary/8 border border-primary/15',
                    )}
                  >
                    {/* Posição */}
                    <span className={cn(
                      'w-6 shrink-0 text-center font-bold',
                      i < 3 ? `text-base ${medalColors[i]}` : 'text-xs text-muted-foreground',
                    )}>
                      {i < 3 ? <Medal className="h-4 w-4 mx-auto" /> : i + 1}
                    </span>

                    {/* Avatar */}
                    <span className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                      entry.isCurrentUser ? 'bg-primary/20 text-primary' : 'bg-secondary',
                    )}>
                      {(entry.display_name ?? '?').slice(0, 2).toUpperCase()}
                    </span>

                    {/* Nome + stats */}
                    <div className="min-w-0 flex-1">
                      <p className={cn('text-sm font-medium truncate leading-tight', entry.isCurrentUser && 'text-primary')}>
                        {entry.display_name ?? 'Jogador'}
                        {entry.isCurrentUser && <span className="ml-1 text-xs opacity-60">(você)</span>}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <Zap className="h-3 w-3 text-primary" />
                          {entry.xp_this_month.toLocaleString('pt-BR')} XP
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5">
                          <Swords className="h-3 w-3" />
                          {entry.missions_this_month} {entry.missions_this_month === 1 ? 'missão' : 'missões'}
                        </span>
                      </div>
                    </div>

                    {/* Nível */}
                    <span className="shrink-0 rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      Nv {entry.level}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Users className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Selecione um grupo para ver o ranking.</p>
          </div>
        )}
      </div>
    </div>
  )
}
