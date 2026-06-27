'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Check, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { acceptFriendRequest, rejectFriendRequest } from '@/lib/actions'
import type { PendingRequest } from '@/lib/queries'

export function FriendRequestCard({ request }: { request: PendingRequest }) {
  const [acceptPending, startAccept] = useTransition()
  const [rejectPending, startReject] = useTransition()

  const accept = () => {
    startAccept(async () => {
      const res = await acceptFriendRequest(request.requester_id)
      if (res?.error) toast.error(res.error)
      else toast.success('Pedido aceito! Vocês agora são amigos.')
    })
  }

  const reject = () => {
    startReject(async () => {
      const res = await rejectFriendRequest(request.requester_id)
      if (res?.error) toast.error(res.error)
      else toast.info('Pedido recusado.')
    })
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
        {(request.display_name ?? '?').slice(0, 2).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{request.display_name ?? 'Jogador'}</p>
        <p className="text-xs text-muted-foreground">Nível {request.level} · {request.total_xp.toLocaleString('pt-BR')} XP</p>
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={reject}
          disabled={rejectPending || acceptPending}
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          {rejectPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
        </Button>
        <Button
          size="icon-sm"
          onClick={accept}
          disabled={acceptPending || rejectPending}
          className="h-8 w-8 bg-primary/15 text-primary hover:bg-primary/25 border-0"
        >
          {acceptPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </div>
  )
}
