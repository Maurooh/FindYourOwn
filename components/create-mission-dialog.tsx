'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Plus, Loader2 } from 'lucide-react'
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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
import { MissionIcon, ICON_OPTIONS } from '@/components/mission-icon'
import { createCustomMission } from '@/lib/actions'
import type { AttributeKey } from '@/lib/game'
import { cn } from '@/lib/utils'

const ATTRIBUTES: { key: AttributeKey | 'none'; label: string }[] = [
  { key: 'health', label: 'Saúde' },
  { key: 'knowledge', label: 'Conhecimento' },
  { key: 'discipline', label: 'Disciplina' },
  { key: 'social', label: 'Social' },
  { key: 'finance', label: 'Finanças' },
  { key: 'none', label: 'Nenhum' },
]

export function CreateMissionDialog() {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'daily' | 'weekly' | 'custom'>('daily')
  const [xp, setXp] = useState(10)
  const [attr, setAttr] = useState<AttributeKey | 'none'>('none')
  const [attrReward, setAttrReward] = useState(5)
  const [icon, setIcon] = useState(ICON_OPTIONS[0])

  const reset = () => {
    setTitle('')
    setDescription('')
    setType('daily')
    setXp(10)
    setAttr('none')
    setAttrReward(5)
    setIcon(ICON_OPTIONS[0])
  }

  const submit = () => {
    if (!title.trim() || pending) return
    startTransition(async () => {
      const res = await createCustomMission({
        title: title.trim(),
        description: description.trim(),
        type,
        xp_reward: xp,
        attribute_key: attr === 'none' ? null : attr,
        attribute_reward: attr === 'none' ? 0 : attrReward,
        icon,
      })
      if (res?.error) {
        toast.error(res.error)
        return
      }
      toast.success('Missão criada!', { description: title })
      reset()
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Nova missão
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova missão</DialogTitle>
          <DialogDescription>
            Crie uma missão personalizada para a sua jornada.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="m-title">Título</Label>
            <Input
              id="m-title"
              placeholder="Ex: Estudar inglês 20 minutos"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="m-desc">Descrição (opcional)</Label>
            <Input
              id="m-desc"
              placeholder="Detalhes sobre a missão"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Frequência</Label>
            <Tabs
              value={type}
              onValueChange={(v) => setType(v as typeof type)}
            >
              <TabsList className="w-full">
                <TabsTrigger value="daily" className="flex-1">
                  Diária
                </TabsTrigger>
                <TabsTrigger value="weekly" className="flex-1">
                  Semanal
                </TabsTrigger>
                <TabsTrigger value="custom" className="flex-1">
                  Avulsa
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="m-xp">Recompensa de XP</Label>
              <Input
                id="m-xp"
                type="number"
                min={1}
                max={200}
                value={xp}
                onChange={(e) => setXp(Number(e.target.value) || 0)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="m-attr-reward">Bônus de atributo</Label>
              <Input
                id="m-attr-reward"
                type="number"
                min={0}
                max={100}
                disabled={attr === 'none'}
                value={attrReward}
                onChange={(e) => setAttrReward(Number(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Atributo associado</Label>
            <div className="flex flex-wrap gap-2">
              {ATTRIBUTES.map((a) => (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => setAttr(a.key)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    attr === a.key
                      ? 'border-primary bg-primary/15 text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground',
                  )}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Ícone</Label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setIcon(opt)}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg border transition-colors',
                    icon === opt
                      ? 'border-primary bg-primary/15 text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground',
                  )}
                >
                  <MissionIcon name={opt} className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={submit}
            disabled={!title.trim() || pending}
            className="w-full"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Criar missão'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}