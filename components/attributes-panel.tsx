import type { AttributeValue } from '@/lib/queries'
import { MissionIcon } from '@/components/mission-icon'
import { ATTRIBUTE_ICONS } from '@/lib/game'

const ATTR_VAR: Record<string, string> = {
  health: 'var(--attr-health)',
  knowledge: 'var(--attr-knowledge)',
  discipline: 'var(--attr-discipline)',
  social: 'var(--attr-social)',
  finance: 'var(--attr-finance)',
}

// nível do atributo a cada 100 pontos
function attrLevel(value: number) {
  return Math.floor(value / 100) + 1
}
function attrProgress(value: number) {
  return value % 100
}

export function AttributesPanel({
  attributes,
}: {
  attributes: AttributeValue[]
}) {
  return (
    <div className="flex flex-col gap-3.5">
      {attributes.map((attr) => {
        const accent = ATTR_VAR[attr.key] ?? 'var(--primary)'
        const lvl = attrLevel(attr.value)
        const prog = attrProgress(attr.value)
        return (
          <div key={attr.key} className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{
                backgroundColor: `color-mix(in oklab, ${accent} 18%, transparent)`,
                color: accent,
              }}
            >
              <MissionIcon
                name={ATTRIBUTE_ICONS[attr.key]}
                className="h-4 w-4"
              />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{attr.name}</span>
                <span className="text-xs text-muted-foreground">
                  Nv {lvl}
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${prog}%`,
                    backgroundColor: accent,
                  }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
