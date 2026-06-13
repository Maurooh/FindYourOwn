// Core de gamificação do Find Your Own

export type AttributeKey =
  | 'health'
  | 'knowledge'
  | 'discipline'
  | 'social'
  | 'finance'

export interface AttributeDef {
  key: AttributeKey
  name: string
  color: string
  sort_order: number
}

export interface Profile {
  id: string
  username: string | null
  display_name: string | null
  friend_code: string | null
  level: number
  total_xp: number
  current_streak: number
  longest_streak: number
  last_completed_date: string | null
}

export interface Mission {
  id: string
  user_id: string | null
  title: string
  description: string | null
  type: 'daily' | 'weekly' | 'custom'
  xp_reward: number
  attribute_key: AttributeKey | null
  attribute_reward: number
  icon: string
  is_template: boolean
  created_at: string
}

export interface UserMission {
  id: string
  user_id: string
  mission_id: string
  period_key: string
  xp_earned: number
  completed_at: string
}

// --- Lógica de nível ---
// XP necessário para alcançar o próximo nível cresce de forma suave.
// Curva: total de XP para atingir o nível n = 50 * n * (n - 1)
export function xpForLevel(level: number): number {
  return 50 * level * (level - 1)
}

export function levelFromXp(totalXp: number): number {
  let level = 1
  while (xpForLevel(level + 1) <= totalXp) {
    level++
  }
  return level
}

export interface LevelProgress {
  level: number
  currentLevelXp: number // xp acumulado dentro do nível atual
  xpIntoLevel: number
  xpForNextLevel: number
  percent: number
}

export function getLevelProgress(totalXp: number): LevelProgress {
  const level = levelFromXp(totalXp)
  const floor = xpForLevel(level)
  const ceil = xpForLevel(level + 1)
  const xpIntoLevel = totalXp - floor
  const xpForNextLevel = ceil - floor
  return {
    level,
    currentLevelXp: floor,
    xpIntoLevel,
    xpForNextLevel,
    percent: Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100)),
  }
}

// --- Títulos por faixa de nível ---
export function levelTitle(level: number): string {
  if (level >= 50) return 'Lenda'
  if (level >= 40) return 'Mestre'
  if (level >= 30) return 'Veterano'
  if (level >= 20) return 'Experiente'
  if (level >= 12) return 'Determinado'
  if (level >= 6) return 'Aprendiz'
  return 'Iniciante'
}

// --- Chaves de período ---
export function dailyPeriodKey(date = new Date()): string {
  return date.toISOString().slice(0, 10) // YYYY-MM-DD
}

export function weeklyPeriodKey(date = new Date()): string {
  // ISO week number
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  )
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  )
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

export function periodKeyForMission(mission: Mission): string {
  if (mission.type === 'weekly') return weeklyPeriodKey()
  return dailyPeriodKey()
}

export const ATTRIBUTE_ICONS: Record<AttributeKey, string> = {
  health: 'heart-pulse',
  knowledge: 'brain',
  discipline: 'target',
  social: 'users',
  finance: 'wallet',
}
