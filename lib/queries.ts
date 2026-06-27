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
    .eq('status', 'accepted')

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
    .eq('status', 'accepted')

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

export interface PendingRequest {
  requester_id: string
  display_name: string | null
  level: number
  total_xp: number
}

export async function getPendingRequests(userId: string): Promise<PendingRequest[]> {
  const supabase = await createClient()
  const { data: requests } = await supabase
    .from('friends')
    .select('user_id')
    .eq('friend_id', userId)
    .eq('status', 'pending')

  const ids = (requests ?? []).map((r) => r.user_id) as string[]
  if (ids.length === 0) return []

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, level, total_xp')
    .in('id', ids)

  return (profiles ?? []).map((p) => ({
    requester_id: p.id,
    display_name: p.display_name,
    level: p.level,
    total_xp: p.total_xp,
  }))
}

export interface GlobalRankingResult {
  top: RankingEntry[]
  userEntry: RankingEntry & { rank: number } | null
  userInTop: boolean
}

export async function getGlobalRanking(userId: string, limit = 10): Promise<GlobalRankingResult> {
  const supabase = await createClient()

  const { data: top } = await supabase
    .from('profiles')
    .select('id, display_name, level, total_xp, current_streak')
    .order('total_xp', { ascending: false })
    .limit(limit)

  const topEntries: RankingEntry[] = (top ?? []).map((p) => ({
    id: p.id,
    display_name: p.display_name,
    level: p.level,
    total_xp: p.total_xp,
    current_streak: p.current_streak,
    isCurrentUser: p.id === userId,
  }))

  const userInTop = topEntries.some((e) => e.id === userId)

  let userEntry: (RankingEntry & { rank: number }) | null = null
  if (!userInTop) {
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id, display_name, level, total_xp, current_streak')
      .eq('id', userId)
      .single()

    if (userProfile) {
      const { count } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gt('total_xp', userProfile.total_xp)

      userEntry = {
        id: userProfile.id,
        display_name: userProfile.display_name,
        level: userProfile.level,
        total_xp: userProfile.total_xp,
        current_streak: userProfile.current_streak,
        isCurrentUser: true,
        rank: (count ?? 0) + 1,
      }
    }
  }

  return { top: topEntries, userEntry, userInTop }
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

export interface Group {
  id: string
  name: string
  invite_code: string
  created_by: string
  created_at: string
  member_count: number
  is_owner: boolean
}

export async function getMyGroups(userId: string): Promise<Group[]> {
  const supabase = await createClient()
  const { data: memberships } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', userId)

  const groupIds = (memberships ?? []).map((m) => m.group_id)
  if (groupIds.length === 0) return []

  const { data: groups } = await supabase
    .from('groups')
    .select('id, name, invite_code, created_by, created_at')
    .in('id', groupIds)
    .order('created_at', { ascending: false })

  const { data: counts } = await supabase
    .from('group_members')
    .select('group_id')
    .in('group_id', groupIds)

  const countMap = new Map<string, number>()
  for (const row of counts ?? []) {
    countMap.set(row.group_id, (countMap.get(row.group_id) ?? 0) + 1)
  }

  return (groups ?? []).map((g) => ({
    id: g.id,
    name: g.name,
    invite_code: g.invite_code,
    created_by: g.created_by,
    created_at: g.created_at,
    member_count: countMap.get(g.id) ?? 0,
    is_owner: g.created_by === userId,
  }))
}

export interface GroupCompetitionEntry {
  user_id: string
  display_name: string | null
  level: number
  xp_this_month: number
  missions_this_month: number
  isCurrentUser: boolean
}

export async function getGroupCompetition(
  groupId: string,
  userId: string,
): Promise<GroupCompetitionEntry[]> {
  const supabase = await createClient()

  const { data: members } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId)

  const memberIds = (members ?? []).map((m) => m.user_id)
  if (memberIds.length === 0) return []

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, level')
    .in('id', memberIds)

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const { data: completions } = await supabase
    .from('user_missions')
    .select('user_id, xp_earned')
    .in('user_id', memberIds)
    .gte('completed_at', monthStart)

  const statsMap = new Map<string, { xp: number; missions: number }>()
  for (const c of completions ?? []) {
    const prev = statsMap.get(c.user_id) ?? { xp: 0, missions: 0 }
    statsMap.set(c.user_id, { xp: prev.xp + c.xp_earned, missions: prev.missions + 1 })
  }

  return (profiles ?? [])
    .map((p) => {
      const stats = statsMap.get(p.id) ?? { xp: 0, missions: 0 }
      return {
        user_id: p.id,
        display_name: p.display_name,
        level: p.level,
        xp_this_month: stats.xp,
        missions_this_month: stats.missions,
        isCurrentUser: p.id === userId,
      }
    })
    .sort((a, b) => b.xp_this_month - a.xp_this_month || b.missions_this_month - a.missions_this_month)
}

export interface GroupJoinRequest {
  id: string
  group_id: string
  user_id: string
  type: 'request' | 'invite'
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  display_name: string | null
  level: number
  total_xp: number
}

export async function getGroupPendingRequests(groupId: string): Promise<GroupJoinRequest[]> {
  const supabase = await createClient()
  const { data: requests } = await supabase
    .from('group_join_requests')
    .select('id, group_id, user_id, type, status, created_at')
    .eq('group_id', groupId)
    .eq('status', 'pending')

  if (!requests || requests.length === 0) return []

  const userIds = requests.map((r) => r.user_id)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, level, total_xp')
    .in('id', userIds)

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

  return requests.map((r) => {
    const p = profileMap.get(r.user_id)
    return {
      id: r.id,
      group_id: r.group_id,
      user_id: r.user_id,
      type: r.type as 'request' | 'invite',
      status: r.status as 'pending',
      created_at: r.created_at,
      display_name: p?.display_name ?? null,
      level: p?.level ?? 1,
      total_xp: p?.total_xp ?? 0,
    }
  })
}

export interface MyGroupInvite {
  id: string
  group_id: string
  group_name: string
  created_at: string
}

export async function getMyGroupInvites(userId: string): Promise<MyGroupInvite[]> {
  const supabase = await createClient()
  const { data: invites } = await supabase
    .from('group_join_requests')
    .select('id, group_id, created_at')
    .eq('user_id', userId)
    .eq('type', 'invite')
    .eq('status', 'pending')

  if (!invites || invites.length === 0) return []

  const groupIds = invites.map((i) => i.group_id)
  const { data: groups } = await supabase
    .from('groups')
    .select('id, name')
    .in('id', groupIds)

  const groupMap = new Map((groups ?? []).map((g) => [g.id, g.name]))

  return invites.map((i) => ({
    id: i.id,
    group_id: i.group_id,
    group_name: groupMap.get(i.group_id) ?? 'Grupo',
    created_at: i.created_at,
  }))
}

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
