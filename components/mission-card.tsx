'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { MissionIcon } from '@/components/mission-icon'
import { cn } from '@/lib/utils'
import { Check, Loader2 } from 'lucide-react'
import { completeMission, uncompleteMission } from '@/lib/actions'
import type { MissionWithStatus } from '@/lib/queries'

const ATTR_VAR: Record<string, string> = {
  health: 'var(--attr-health)',
  knowledge: 'var(--attr-knowledge)',
  discipline: 'var(--attr-discipline)',
  social: 'var(--attr-social)',
  finance: 'var(--attr-finance)',
}

export function MissionCard({ mission }: { mission: MissionWithStatus }) {
  const [completed, setCompleted] = useState(mission.completed)
  const [pending, startTransition] = useTransition()

  const accent = mission.attribute_key
    ? ATTR_VAR[mission.attribute_key]
    : 'var(--primary)'

  const toggle = () => {
    if (pending) return
    startTransition(async () => {
      if (!completed) {
        const res = await completeMission(mission.id)
        if (res?.error) {
          toast.error(res.error)
          return
        }
        setCompleted(true)
        if (res?.leveledUp) {
          toast.success(`Subiu para o nível ${res.newLevel}!`, {
            description: `+${res.xpEarned} XP`,
          })
        } else {
          toast.success(`+${res?.xpEarned ?? mission.xp_reward} XP`, {
            description: mission.title,
          })
        }
      } else {
        const res = await uncompleteMission(mission.id, mission.period_key)
        if (res?.error) {
          toast.error(res.error)
          return
        }
        setCompleted(false)
      }
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={cn(
        'flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all',
        completed
          ? 'border-primary/40 bg-primary/5'
          : 'border-border bg-card hover:border-border/80 active:scale-[0.99]',
      )}
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{
          backgroundColor: `color-mix(in oklab, ${accent} 18%, transparent)`,
          color: accent,
        }}
      >
        <MissionIcon name={mission.icon} className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-sm font-medium',
            completed && 'text-muted-foreground line-through',
          )}
        >
          {mission.title}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          +{mission.xp_reward} XP
          {mission.attribute_reward > 0 && mission.attribute_key
            ? ` · +${mission.attribute_reward} atributo`
            : ''}
        </p>
      </div>

      <span
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          completed
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-muted-foreground/40',
        )}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : completed ? (
          <Check className="h-4 w-4" />
        ) : null}
      </span>
    </button>
  )
}
