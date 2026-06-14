'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { UserPlus, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { addFriendByCode } from '@/lib/actions'

export function AddFriendForm() {
  const [code, setCode] = useState('')
  const [pending, startTransition] = useTransition()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim() || pending) return
    startTransition(async () => {
      const res = await addFriendByCode(code.trim())
      if (res?.error) {
        toast.error(res.error)
        return
      }
      toast.success('Amigo adicionado!', {
        description: res?.name ?? undefined,
      })
      setCode('')
    })
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <Input
        placeholder="Código de amigo (ex: AB12CD)"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        className="font-mono uppercase"
        maxLength={12}
      />
      <Button type="submit" disabled={!code.trim() || pending} className="gap-1.5 shrink-0">
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UserPlus className="h-4 w-4" />
        )}
        Adicionar
      </Button>
    </form>
  )
}