'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Plus, Loader2, Zap, Sparkles, Brain } from 'lucide-react'
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
} from '@/components/ui/tabs'
import { MissionIcon, ICON_OPTIONS } from '@/components/mission-icon'
import { createCustomMission, classifyMissionDifficulty } from '@/lib/actions'
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

const DIFFICULTY_META = {
  easy:   { label: 'Fácil',   xp: 15, color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30' },
  medium: { label: 'Médio',   xp: 35, color: 'text-yellow-400',  bg: 'bg-yellow-400/10 border-yellow-400/30'  },
  hard:   { label: 'Difícil', xp: 70, color: 'text-red-400',     bg: 'bg-red-400/10 border-red-400/30'        },
}

export function CreateMissionDialog() {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [classifying, setClassifying] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'daily' | 'weekly' | 'custom'>('daily')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null)
  const [aiReason, setAiReason] = useState<string | null>(null)
  const [attr, setAttr] = useState<AttributeKey | 'none'>('none')
  const [attrReward, setAttrReward] = useState(5)
  const [icon, setIcon] = useState(ICON_OPTIONS[0])

  const reset = () => {
    setTitle('')
    setDescription('')
    setType('daily')
    setDifficulty(null)
    setAiReason(null)
    setAttr('none')
    setAttrReward(5)
    setIcon(ICON_OPTIONS[0])
  }

  const classify = async () => {
    if (!title.trim() || classifying) return
    setClassifying(true)
    setDifficulty(null)
    setAiReason(null)
    const res = await classifyMissionDifficulty(title, description)
    setClassifying(false)
    if ('error' in res) {
      toast.error(res.error)
      return
    }
    setDifficulty(res.difficulty)
    setAiReason(res.reason)
    if (res.icon) setIcon(res.icon)
    if (res.attribute) setAttr(res.attribute)
  }

  const submit = () => {
    if (!title.trim() || !difficulty || pending) return
    startTransition(async () => {
      const res = await createCustomMission({
        title: title.trim(),
        description: description.trim(),
        type,
        difficulty,
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

  const diffMeta = difficulty ? DIFFICULTY_META[difficulty] : null

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
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
            A IA vai avaliar e definir a dificuldade automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="m-title">Título</Label>
            <Input
              id="m-title"
              placeholder="Ex: Estudar inglês 20 minutos"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setDifficulty(null); setAiReason(null) }}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="m-desc">Descrição (opcional)</Label>
            <Input
              id="m-desc"
              placeholder="Detalhes sobre a missão"
              value={description}
              onChange={(e) => { setDescription(e.target.value); setDifficulty(null); setAiReason(null) }}
            />
          </div>

          <div className="grid gap-2">
            <Label>Frequência</Label>
            <Tabs value={type} onValueChange={(v) => setType(v as typeof type)}>
              <TabsList className="w-full">
                <TabsTrigger value="daily" className="flex-1">Diária</TabsTrigger>
                <TabsTrigger value="weekly" className="flex-1">Semanal</TabsTrigger>
                <TabsTrigger value="custom" className="flex-1">Avulsa</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Classificação por IA */}
          <div className="grid gap-2">
            <Label>Dificuldade</Label>

            {!difficulty ? (
              <button
                type="button"
                onClick={classify}
                disabled={!title.trim() || classifying}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl border border-dashed p-4 text-sm font-medium transition-colors',
                  title.trim()
                    ? 'border-primary/40 text-primary hover:bg-primary/5 cursor-pointer'
                    : 'border-border text-muted-foreground cursor-not-allowed',
                )}
              >
                {classifying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analisando com IA…
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4" />
                    Avaliar dificuldade com IA
                  </>
                )}
              </button>
            ) : (
              <div className={cn('flex flex-col gap-2 rounded-xl border p-4', diffMeta!.bg)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className={cn('h-4 w-4', diffMeta!.color)} />
                    <span className={cn('text-sm font-bold', diffMeta!.color)}>
                      {diffMeta!.label}
                    </span>
                    <span className={cn('flex items-center gap-0.5 text-xs font-semibold', diffMeta!.color)}>
                      <Zap className="h-3 w-3" /> {diffMeta!.xp} XP
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={classify}
                    disabled={classifying}
                    className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2"
                  >
                    {classifying ? 'Reavaliando…' : 'Reavaliar'}
                  </button>
                </div>
                {aiReason && (
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    🤖 {aiReason}
                  </p>
                )}
              </div>
            )}

            {!difficulty && title.trim() && (
              <p className="text-[11px] text-muted-foreground">
                Clique em &quot;Avaliar com IA&quot; para definir a dificuldade antes de criar.
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <Label>Atributo associado</Label>
              {difficulty && attr !== 'none' && (
                <span className="flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  <Sparkles className="h-2.5 w-2.5" /> IA
                </span>
              )}
            </div>
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

          {attr !== 'none' && (
            <div className="grid gap-2">
              <Label htmlFor="m-attr-reward">Bônus de atributo</Label>
              <Input
                id="m-attr-reward"
                type="number"
                min={0}
                max={20}
                value={attrReward}
                onChange={(e) => setAttrReward(Number(e.target.value) || 0)}
              />
            </div>
          )}

          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <Label>Ícone</Label>
              {difficulty && (
                <span className="flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  <Sparkles className="h-2.5 w-2.5" /> IA
                </span>
              )}
            </div>
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
            disabled={!title.trim() || !difficulty || pending}
            className="w-full"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar missão'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
