'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Plus, Loader2 } from 'lucide-react'
import { MissionIcon } from '@/components/mission-icon'
import { adoptSuggestedMission } from '@/lib/actions'
import type { Mission } from '@/lib/game'

const ATTR_VAR: Record<string, string> = {
  health: 'var(--attr-health)',
  knowledge: 'var(--attr-knowledge)',
  discipline: 'var(--attr-discipline)',
  social: 'var(--attr-social)',
  finance: 'var(--attr-finance)',
}

export function SuggestedMissionCard({ mission }: { mission: Mission }) {
  const [pending, startTransition] = useTransition()

  const accent = mission.attribute_key
    ? ATTR_VAR[mission.attribute_key]
    : 'var(--primary)'

  const add = () => {
    if (pending) return
    startTransition(async () => {
      const res = await adoptSuggestedMission(mission.id)
      if (res?.error) {
        toast.error(res.error)
        return
      }
      toast.success('Missão adicionada!', { description: mission.title })
    })
  }

  return (
    <button
      onClick={add}
      disabled={pending}
      className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-border bg-card/50 p-3.5 text-left transition-all hover:border-primary/40 active:scale-[0.99]"
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
        <p className="truncate text-sm font-medium">{mission.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          +{mission.xp_reward} XP
          {mission.attribute_reward > 0 && mission.attribute_key
            ? ` · +${mission.attribute_reward} atributo`
            : ''}
        </p>
      </div>

      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/40 text-muted-foreground">
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Plus className="h-3.5 w-3.5" />
        )}
      </span>
    </button>
  )
}