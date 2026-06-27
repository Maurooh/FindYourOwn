'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Check, X, Loader2, Zap, UserCheck, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { acceptGroupRequest, rejectGroupRequest } from '@/lib/actions'
import type { GroupJoinRequest, MyGroupInvite } from '@/lib/queries'

function RequestRow({
  req,
  label,
}: {
  req: GroupJoinRequest
  label: string
}) {
  const [pending, startTransition] = useTransition()

  const handle = (action: 'accept' | 'reject') => {
    if (pending) return
    startTransition(async () => {
      const res = action === 'accept'
        ? await acceptGroupRequest(req.id)
        : await rejectGroupRequest(req.id)
      if (res?.error) toast.error(res.error)
      else toast.success(action === 'accept' ? 'Aceito!' : 'Recusado')
    })
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold">
        {(req.display_name ?? '?').slice(0, 2).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{req.display_name ?? 'Jogador'}</p>
        <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Zap className="h-3 w-3 text-primary" />
          {req.total_xp.toLocaleString('pt-BR')} XP · Nv {req.level}
          <span className="ml-1 opacity-60">· {label}</span>
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button
          size="icon-sm"
          className="h-8 w-8 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
          onClick={() => handle('accept')}
          disabled={pending}
          title="Aceitar"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => handle('reject')}
          disabled={pending}
          title="Recusar"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

function InviteRow({ invite }: { invite: MyGroupInvite }) {
  const [pending, startTransition] = useTransition()

  const handle = (action: 'accept' | 'reject') => {
    if (pending) return
    startTransition(async () => {
      const res = action === 'accept'
        ? await acceptGroupRequest(invite.id)
        : await rejectGroupRequest(invite.id)
      if (res?.error) toast.error(res.error)
      else toast.success(action === 'accept' ? `Entrou em "${invite.group_name}"!` : 'Convite recusado')
    })
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Mail className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">Convite para <span className="text-primary">{invite.group_name}</span></p>
        <p className="text-[11px] text-muted-foreground">Você foi convidado para participar</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button
          size="icon-sm"
          className="h-8 w-8 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
          onClick={() => handle('accept')}
          disabled={pending}
          title="Aceitar"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => handle('reject')}
          disabled={pending}
          title="Recusar"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

export function GroupRequestsPanel({
  requests,
  invites,
}: {
  requests: GroupJoinRequest[]
  invites: MyGroupInvite[]
}) {
  if (requests.length === 0 && invites.length === 0) return null

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card/50 p-5">
      {invites.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Convites recebidos</h3>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
              {invites.length}
            </span>
          </div>
          {invites.map((inv) => (
            <InviteRow key={inv.id} invite={inv} />
          ))}
        </div>
      )}

      {requests.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-yellow-400" />
            <h3 className="text-sm font-semibold">Pedidos de entrada</h3>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400/15 text-[11px] font-bold text-yellow-400">
              {requests.length}
            </span>
          </div>
          {requests.map((req) => (
            <RequestRow
              key={req.id}
              req={req}
              label={req.type === 'invite' ? 'convidado' : 'pediu para entrar'}
            />
          ))}
        </div>
      )}
    </div>
  )
}
