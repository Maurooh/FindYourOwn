'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  dailyPeriodKey,
  levelFromXp,
  periodKeyForMission,
  type Mission,
} from '@/lib/game'
import { revalidatePath } from 'next/cache'

export async function completeMission(missionId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // carregar missão (precisa pertencer ao usuário)
  const { data: mission, error: mErr } = await supabase
    .from('missions')
    .select('*')
    .eq('id', missionId)
    .eq('user_id', user.id)
    .single<Mission>()

  if (mErr || !mission) return { error: 'Missão não encontrada' }

  const periodKey = periodKeyForMission(mission)

  // tenta inserir conclusão (unique impede duplicado no período)
  const { error: insErr } = await supabase.from('user_missions').insert({
    user_id: user.id,
    mission_id: mission.id,
    period_key: periodKey,
    xp_earned: mission.xp_reward,
  })

  if (insErr) {
    // já concluída neste período
    return { error: 'Missão já concluída neste período' }
  }

  // atualizar perfil: XP, nível, streak
  const { data: profile } = await supabase
    .from('profiles')
    .select('total_xp, current_streak, longest_streak, last_completed_date')
    .eq('id', user.id)
    .single()

  const today = dailyPeriodKey()
  let newStreak = profile?.current_streak ?? 0
  const last = profile?.last_completed_date

  if (last !== today) {
    const yesterday = dailyPeriodKey(new Date(Date.now() - 86400000))
    newStreak = last === yesterday ? newStreak + 1 : 1
  }

  const newXp = (profile?.total_xp ?? 0) + mission.xp_reward
  const newLevel = levelFromXp(newXp)
  const longest = Math.max(profile?.longest_streak ?? 0, newStreak)

  await supabase
    .from('profiles')
    .update({
      total_xp: newXp,
      level: newLevel,
      current_streak: newStreak,
      longest_streak: longest,
      last_completed_date: today,
    })
    .eq('id', user.id)

  // atualizar atributo associado
  if (mission.attribute_key && mission.attribute_reward > 0) {
    const { data: attr } = await supabase
      .from('user_attributes')
      .select('value')
      .eq('user_id', user.id)
      .eq('attribute_key', mission.attribute_key)
      .single()

    await supabase
      .from('user_attributes')
      .update({ value: (attr?.value ?? 0) + mission.attribute_reward })
      .eq('user_id', user.id)
      .eq('attribute_key', mission.attribute_key)
  }

  revalidatePath('/app')
  revalidatePath('/app/missions')
  return {
    success: true,
    xpEarned: mission.xp_reward,
    newLevel,
    leveledUp: newLevel > levelFromXp(profile?.total_xp ?? 0),
  }
}

export async function uncompleteMission(missionId: string, periodKey: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: mission } = await supabase
    .from('missions')
    .select('*')
    .eq('id', missionId)
    .eq('user_id', user.id)
    .single<Mission>()
  if (!mission) return { error: 'Missão não encontrada' }

  const { data: completion } = await supabase
    .from('user_missions')
    .select('id, xp_earned')
    .eq('user_id', user.id)
    .eq('mission_id', missionId)
    .eq('period_key', periodKey)
    .single()

  if (!completion) return { error: 'Conclusão não encontrada' }

  await supabase.from('user_missions').delete().eq('id', completion.id)

  // reverter XP / nível
  const { data: profile } = await supabase
    .from('profiles')
    .select('total_xp')
    .eq('id', user.id)
    .single()
  const newXp = Math.max(0, (profile?.total_xp ?? 0) - completion.xp_earned)
  await supabase
    .from('profiles')
    .update({ total_xp: newXp, level: levelFromXp(newXp) })
    .eq('id', user.id)

  // reverter atributo
  if (mission.attribute_key && mission.attribute_reward > 0) {
    const { data: attr } = await supabase
      .from('user_attributes')
      .select('value')
      .eq('user_id', user.id)
      .eq('attribute_key', mission.attribute_key)
      .single()
    await supabase
      .from('user_attributes')
      .update({
        value: Math.max(0, (attr?.value ?? 0) - mission.attribute_reward),
      })
      .eq('user_id', user.id)
      .eq('attribute_key', mission.attribute_key)
  }

  revalidatePath('/app')
  revalidatePath('/app/missions')
  return { success: true }
}

export async function createCustomMission(input: {
  title: string
  description: string
  type: 'daily' | 'weekly' | 'custom'
  xp_reward: number
  attribute_key: string | null
  attribute_reward: number
  icon: string
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase.from('missions').insert({
    user_id: user.id,
    title: input.title,
    description: input.description || null,
    type: input.type,
    xp_reward: input.xp_reward,
    attribute_key: input.attribute_key,
    attribute_reward: input.attribute_reward,
    icon: input.icon,
    is_template: false,
  })

  if (error) return { error: error.message }
  revalidatePath('/app/missions')
  return { success: true }
}

export async function deleteMission(missionId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase
    .from('missions')
    .delete()
    .eq('id', missionId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/app/missions')
  return { success: true }
}

export async function addFriendByCode(code: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const normalized = code.trim().toUpperCase()
  const { data: target } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('friend_code', normalized)
    .single()

  if (!target) return { error: 'Código de amigo inválido' }
  if (target.id === user.id)
    return { error: 'Você não pode adicionar a si mesmo' }

  // adiciona nos dois sentidos
  const { error } = await supabase.from('friends').insert([
    { user_id: user.id, friend_id: target.id },
  ])
  if (error) return { error: 'Vocês já são amigos' }

  // tentativa de reciprocidade (ignora erro se já existir)
  await supabase
    .from('friends')
    .insert([{ user_id: target.id, friend_id: user.id }])

  revalidatePath('/app/friends')
  return { success: true, name: target.display_name }
}

export async function removeFriend(friendId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  await supabase
    .from('friends')
    .delete()
    .eq('user_id', user.id)
    .eq('friend_id', friendId)
  await supabase
    .from('friends')
    .delete()
    .eq('user_id', friendId)
    .eq('friend_id', user.id)

  revalidatePath('/app/friends')
  return { success: true }
}

// Adicionar ao final de lib/actions.ts (mantendo os imports existentes)

export async function adoptSuggestedMission(templateId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: template, error: tErr } = await supabase
    .from('missions')
    .select('*')
    .eq('id', templateId)
    .eq('is_template', true)
    .single<Mission>()

  if (tErr || !template) return { error: 'Missão sugerida não encontrada' }

  const { error } = await supabase.from('missions').insert({
    user_id: user.id,
    title: template.title,
    description: template.description,
    type: template.type,
    xp_reward: template.xp_reward,
    attribute_key: template.attribute_key,
    attribute_reward: template.attribute_reward,
    icon: template.icon,
    is_template: false,
  })

  if (error) return { error: error.message }

  revalidatePath('/app')
  revalidatePath('/app/missions')
  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}