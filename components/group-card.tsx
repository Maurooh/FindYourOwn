'use client'

import { useTransition, useState } from 'react'
import { toast } from 'sonner'
import { Users, Copy, LogOut, Loader2, Check, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { leaveGroup } from '@/lib/actions'
import { InviteFriendsDialog } from '@/components/invite-friends-dialog'
import type { Group, FriendProfile } from '@/lib/queries'
import { cn } from '@/lib/utils'

export function GroupCard({
  group,
  selected,
  onSelect,
  friends,
  memberIds,
}: {
  group: Group
  selected: boolean
  onSelect: () => void
  friends: FriendProfile[]
  memberIds: string[]
}) {
  const [pending, startTransition] = useTransition()
  const [copied, setCopied] = useState(false)

  const copy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(group.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const leave = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (pending) return
    startTransition(async () => {
      const res = await leaveGroup(group.id)
      if (res?.error) toast.error(res.error)
      else toast.success('Você saiu do grupo')
    })
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full text-left flex items-center gap-3 rounded-xl border p-4 transition-all',
        selected
          ? 'border-primary/40 bg-primary/8 shadow-sm shadow-primary/10'
          : 'border-border bg-card hover:border-border/80 hover:bg-secondary/20',
      )}
    >
      <span className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-bold',
        selected ? 'bg-primary/20 text-primary' : 'bg-secondary text-foreground',
      )}>
        {group.name.slice(0, 1).toUpperCase()}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className={cn('text-sm font-semibold truncate', selected && 'text-primary')}>{group.name}</p>
          {group.is_owner && <Crown className="h-3 w-3 shrink-0 text-yellow-400" />}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {group.member_count} {group.member_count === 1 ? 'membro' : 'membros'}</span>
          <span>·</span>
          <span className="font-mono">{group.invite_code}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
        {group.is_owner && (
          <InviteFriendsDialog groupId={group.id} friends={friends} memberIds={memberIds} />
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={copy}
          title="Copiar código"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
        {!group.is_owner && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={leave}
            disabled={pending}
            title="Sair do grupo"
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
          </Button>
        )}
      </div>
    </button>
  )
}
