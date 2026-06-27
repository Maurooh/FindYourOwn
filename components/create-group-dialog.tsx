'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Plus, Loader2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createGroup } from '@/lib/actions'

export function CreateGroupDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [pending, startTransition] = useTransition()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || pending) return
    startTransition(async () => {
      const res = await createGroup(name)
      if (res?.error) { toast.error(res.error); return }
      toast.success('Grupo criado!', { description: 'Compartilhe o código com seus amigos.' })
      setName('')
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> Criar grupo
        </Button>
      } />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar grupo</DialogTitle>
          <DialogDescription>
            Crie um grupo e convide seus amigos para competir durante o mês.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="g-name">Nome do grupo</Label>
            <Input
              id="g-name"
              placeholder="Ex: Os Guerreiros"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!name.trim() || pending} className="w-full">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar grupo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
