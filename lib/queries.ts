import { createClient } from '@/lib/supabase/server'
import {
  dailyPeriodKey,
  weeklyPeriodKey,
  type AttributeDef,
  type AttributeKey,
  type Mission,
  type Profile,
} from '@/lib/game'

export interface MissionWithStatus extends Mission {
  completed: boolean
  period_key: string
}

export interface AttributeValue extends AttributeDef {
  value: number
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data as Profile | null
}

export async function getAttributes(userId: string): Promise<AttributeValue[]> {
  const supabase = await createClient()
  const { data: defs } = await supabase
    .from('attributes')
    .select('*')
    .order('sort_order')
  const { data: values } = await supabase
    .from('user_attributes')
    .select('attribute_key, value')
    .eq('user_id', userId)

  const valueMap = new Map(
    (values ?? []).map((v) => [v.attribute_key as AttributeKey, v.value]),
  )

  return (defs ?? []).map((d) => ({
    ...(d as AttributeDef),
    value: valueMap.get((d as AttributeDef).key) ?? 0,
  }))
}

export async function getMissionsWithStatus(
  userId: string,
): Promise<MissionWithStatus[]> {
  const supabase = await createClient()
  const { data: missions } = await supabase
    .from('missions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  const today = dailyPeriodKey()
  const week = weeklyPeriodKey()

  // completions deste período (diário + semanal)
  const { data: completions } = await supabase
    .from('user_missions')
    .select('mission_id, period_key')
    .eq('user_id', userId)
    .in('period_key', [today, week])

  const completedSet = new Set(
    (completions ?? []).map((c) => `${c.mission_id}:${c.period_key}`),
  )

  return (missions ?? []).map((m) => {
    const mission = m as Mission
    const periodKey = mission.type === 'weekly' ? week : today
    return {
      ...mission,
      period_key: periodKey,
      completed: completedSet.has(`${mission.id}:${periodKey}`),
    }
  })
}

export interface RankingEntry {
  id: string
  display_name: string | null
  level: number
  total_xp: number
  current_streak: number
  isCurrentUser: boolean
}

export async function getFriendsRanking(
  userId: string,
): Promise<RankingEntry[]> {
  const supabase = await createClient()
  const { data: friends } = await supabase
    .from('friends')
    .select('friend_id')
    .eq('user_id', userId)

  const ids = [userId, ...((friends ?? []).map((f) => f.friend_id) as string[])]

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, level, total_xp, current_streak')
    .in('id', ids)
    .order('total_xp', { ascending: false })

  return (profiles ?? []).map((p) => ({
    id: p.id,
    display_name: p.display_name,
    level: p.level,
    total_xp: p.total_xp,
    current_streak: p.current_streak,
    isCurrentUser: p.id === userId,
  }))
}

export interface FriendProfile extends RankingEntry {
  friend_id: string
}

export async function getFriends(userId: string): Promise<FriendProfile[]> {
  const supabase = await createClient()
  const { data: friends } = await supabase
    .from('friends')
    .select('friend_id')
    .eq('user_id', userId)

  const ids = (friends ?? []).map((f) => f.friend_id) as string[]
  if (ids.length === 0) return []

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, level, total_xp, current_streak')
    .in('id', ids)
    .order('total_xp', { ascending: false })

  return (profiles ?? []).map((p) => ({
    id: p.id,
    friend_id: p.id,
    display_name: p.display_name,
    level: p.level,
    total_xp: p.total_xp,
    current_streak: p.current_streak,
    isCurrentUser: false,
  }))
}

export async function getRecentHistory(userId: string, limit = 15) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('user_missions')
    .select('id, xp_earned, completed_at, missions(title, icon, type)')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(limit)
  return data ?? []
}

// Adicionar ao final de lib/queries.ts (mantendo os imports existentes)

export async function getSuggestedMissions(userId: string): Promise<Mission[]> {
  const supabase = await createClient()

  // templates disponíveis
  const { data: templates } = await supabase
    .from('missions')
    .select('*')
    .eq('is_template', true)
    .order('created_at', { ascending: true })

  // títulos das missões que o usuário já tem (para não sugerir duplicado)
  const { data: own } = await supabase
    .from('missions')
    .select('title')
    .eq('user_id', userId)

  const ownTitles = new Set((own ?? []).map((m) => m.title))

  return ((templates ?? []) as Mission[]).filter(
    (t) => !ownTitles.has(t.title),
  )
}
