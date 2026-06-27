'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { UserPlus, Loader2, Check, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { sendGroupInvite } from '@/lib/actions'
import type { FriendProfile } from '@/lib/queries'
import { cn } from '@/lib/utils'

export function InviteFriendsDialog({
  groupId,
  friends,
  memberIds,
}: {
  groupId: string
  friends: FriendProfile[]
  memberIds: string[]
}) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [invited, setInvited] = useState<Set<string>>(new Set())

  const invite = (friendId: string) => {
    if (pending) return
    startTransition(async () => {
      const res = await sendGroupInvite(groupId, friendId)
      if (res?.error) {
        toast.error(res.error)
        return
      }
      setInvited((prev) => new Set(prev).add(friendId))
      toast.success('Convite enviado!')
    })
  }

  const eligible = friends.filter((f) => !memberIds.includes(f.id))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs">
          <UserPlus className="h-3.5 w-3.5" /> Convidar amigos
        </Button>
      } />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar amigos</DialogTitle>
          <DialogDescription>
            Selecione quais amigos deseja convidar para o grupo.
          </DialogDescription>
        </DialogHeader>

        {eligible.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {friends.length === 0
              ? 'Você ainda não tem amigos adicionados.'
              : 'Todos os seus amigos já fazem parte deste grupo.'}
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
            {eligible.map((friend) => {
              const isInvited = invited.has(friend.id)
              return (
                <div
                  key={friend.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold">
                    {(friend.display_name ?? '?').slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{friend.display_name ?? 'Jogador'}</p>
                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Zap className="h-3 w-3 text-primary" />
                      {friend.total_xp.toLocaleString('pt-BR')} XP · Nv {friend.level}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={isInvited ? 'secondary' : 'default'}
                    className={cn('shrink-0 gap-1.5 h-8 text-xs', isInvited && 'text-emerald-400')}
                    onClick={() => invite(friend.id)}
                    disabled={isInvited || pending}
                  >
                    {isInvited ? (
                      <><Check className="h-3.5 w-3.5" /> Enviado</>
                    ) : (
                      <><UserPlus className="h-3.5 w-3.5" /> Convidar</>
                    )}
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
