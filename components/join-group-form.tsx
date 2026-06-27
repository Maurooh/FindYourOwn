'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { LogIn, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { joinGroupByCode } from '@/lib/actions'

export function JoinGroupForm() {
  const [code, setCode] = useState('')
  const [pending, startTransition] = useTransition()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim() || pending) return
    startTransition(async () => {
      const res = await joinGroupByCode(code)
      if (res?.error) { toast.error(res.error); return }
      if (res.pending) {
        toast.success(`Pedido enviado para "${res.name}"!`, {
          description: 'O dono do grupo precisará aprovar sua entrada.',
        })
      } else {
        toast.success(`Entrou em "${res.name}"!`)
      }
      setCode('')
    })
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <Input
        placeholder="Código do grupo (ex: AB12CD)"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        className="font-mono uppercase"
        maxLength={8}
      />
      <Button type="submit" disabled={!code.trim() || pending} className="shrink-0 gap-1.5">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
        Entrar
      </Button>
    </form>
  )
}
