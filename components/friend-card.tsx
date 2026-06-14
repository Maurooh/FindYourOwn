'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { UserMinus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { removeFriend } from '@/lib/actions'
import type { FriendProfile } from '@/lib/queries'

export function FriendCard({ friend }: { friend: FriendProfile }) {
  const [pending, startTransition] = useTransition()

  const remove = () => {
    if (pending) return
    startTransition(async () => {
      const res = await removeFriend(friend.friend_id)
      if (res?.error) {
        toast.error(res.error)
        return
      }
      toast.success('Amigo removido')
    })
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
        {(friend.display_name ?? '?').slice(0, 2).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {friend.display_name ?? 'Jogador'}
        </p>
        <p className="text-xs text-muted-foreground">
          Nível {friend.level} ·{' '}
          {friend.total_xp.toLocaleString('pt-BR')} XP
        </p>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        🔥 {friend.current_streak}
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={remove}
        disabled={pending}
        className="text-muted-foreground hover:text-destructive"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UserMinus className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}