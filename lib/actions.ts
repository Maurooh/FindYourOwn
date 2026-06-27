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

const XP_BY_DIFFICULTY: Record<string, number> = {
  easy: 15,
  medium: 35,
  hard: 70,
}

export async function createCustomMission(input: {
  title: string
  description: string
  type: 'daily' | 'weekly' | 'custom'
  difficulty: 'easy' | 'medium' | 'hard'
  attribute_key: string | null
  attribute_reward: number
  icon: string
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const xp_reward = XP_BY_DIFFICULTY[input.difficulty] ?? 15

  const { error } = await supabase.from('missions').insert({
    user_id: user.id,
    title: input.title,
    description: input.description || null,
    type: input.type,
    xp_reward,
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
  if (target.id === user.id) return { error: 'Você não pode adicionar a si mesmo' }

  // verifica se já existe relação em qualquer direção
  const { data: existing } = await supabase
    .from('friends')
    .select('status')
    .or(`and(user_id.eq.${user.id},friend_id.eq.${target.id}),and(user_id.eq.${target.id},friend_id.eq.${user.id})`)
    .limit(1)
    .maybeSingle()

  if (existing) {
    if (existing.status === 'accepted') return { error: 'Vocês já são amigos' }
    return { error: 'Pedido de amizade já enviado' }
  }

  const { error } = await supabase.from('friends').insert({
    user_id: user.id,
    friend_id: target.id,
    status: 'pending',
  })

  if (error) return { error: 'Não foi possível enviar o pedido' }

  revalidatePath('/app/friends')
  return { success: true, name: target.display_name }
}

export async function acceptFriendRequest(requesterId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error: updateErr } = await supabase
    .from('friends')
    .update({ status: 'accepted' })
    .eq('user_id', requesterId)
    .eq('friend_id', user.id)
    .eq('status', 'pending')

  if (updateErr) return { error: 'Pedido não encontrado' }

  // cria a relação reversa
  await supabase.from('friends').insert({
    user_id: user.id,
    friend_id: requesterId,
    status: 'accepted',
  })

  revalidatePath('/app/friends')
  return { success: true }
}

export async function rejectFriendRequest(requesterId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  await supabase
    .from('friends')
    .delete()
    .eq('user_id', requesterId)
    .eq('friend_id', user.id)
    .eq('status', 'pending')

  revalidatePath('/app/friends')
  return { success: true }
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

export async function createGroup(name: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const inviteCode = Math.random().toString(36).slice(2, 8).toUpperCase()

  const { data: group, error } = await supabase
    .from('groups')
    .insert({ name: name.trim(), created_by: user.id, invite_code: inviteCode })
    .select('id')
    .single()

  if (error || !group) return { error: 'Não foi possível criar o grupo' }

  await supabase.from('group_members').insert({ group_id: group.id, user_id: user.id })

  revalidatePath('/app/groups')
  return { success: true, id: group.id }
}

export async function joinGroupByCode(code: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: group } = await supabase
    .from('groups')
    .select('id, name, created_by')
    .eq('invite_code', code.trim().toUpperCase())
    .single()

  if (!group) return { error: 'Código de grupo inválido' }

  // Se é o dono, entra direto
  if (group.created_by === user.id) return { error: 'Você já é o dono deste grupo' }

  // Verifica se já é membro
  const { data: member } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', group.id)
    .eq('user_id', user.id)
    .single()

  if (member) return { error: 'Você já faz parte deste grupo' }

  // Cria pedido de entrada (owner precisa aprovar)
  const { error } = await supabase
    .from('group_join_requests')
    .insert({ group_id: group.id, user_id: user.id, type: 'request' })

  if (error) return { error: 'Você já tem um pedido pendente para este grupo' }

  revalidatePath('/app/groups')
  return { success: true, name: group.name, pending: true }
}

export async function sendGroupInvite(groupId: string, friendId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // Apenas o dono pode convidar
  const { data: group } = await supabase
    .from('groups')
    .select('created_by, name')
    .eq('id', groupId)
    .single()

  if (!group || group.created_by !== user.id) return { error: 'Apenas o dono pode convidar' }

  // Verifica se já é membro
  const { data: member } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId)
    .eq('user_id', friendId)
    .single()

  if (member) return { error: 'Esta pessoa já é membro do grupo' }

  const { error } = await supabase
    .from('group_join_requests')
    .insert({ group_id: groupId, user_id: friendId, type: 'invite' })

  if (error) return { error: 'Convite já enviado para esta pessoa' }

  revalidatePath('/app/groups')
  return { success: true }
}

export async function acceptGroupRequest(requestId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: req } = await supabase
    .from('group_join_requests')
    .select('id, group_id, user_id, type')
    .eq('id', requestId)
    .single()

  if (!req) return { error: 'Pedido não encontrado' }

  if (req.type === 'request') {
    // Apenas dono pode aceitar pedido
    const { data: group } = await supabase
      .from('groups')
      .select('created_by')
      .eq('id', req.group_id)
      .single()
    if (!group || group.created_by !== user.id) return { error: 'Sem permissão' }
  } else {
    // Apenas o próprio usuário pode aceitar convite
    if (req.user_id !== user.id) return { error: 'Sem permissão' }
  }

  await supabase
    .from('group_join_requests')
    .update({ status: 'accepted' })
    .eq('id', requestId)

  await supabase
    .from('group_members')
    .insert({ group_id: req.group_id, user_id: req.user_id })

  revalidatePath('/app/groups')
  return { success: true }
}

export async function rejectGroupRequest(requestId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: req } = await supabase
    .from('group_join_requests')
    .select('id, group_id, user_id, type')
    .eq('id', requestId)
    .single()

  if (!req) return { error: 'Pedido não encontrado' }

  if (req.type === 'request') {
    const { data: group } = await supabase
      .from('groups')
      .select('created_by')
      .eq('id', req.group_id)
      .single()
    if (!group || group.created_by !== user.id) return { error: 'Sem permissão' }
  } else {
    if (req.user_id !== user.id) return { error: 'Sem permissão' }
  }

  await supabase
    .from('group_join_requests')
    .update({ status: 'rejected' })
    .eq('id', requestId)

  revalidatePath('/app/groups')
  return { success: true }
}

export async function leaveGroup(groupId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', user.id)

  revalidatePath('/app/groups')
  return { success: true }
}

export async function classifyMissionDifficulty(title: string, description: string) {
  if (!title.trim()) return { error: 'Título obrigatório' }

  const VALID_ICONS = [
    'droplet','dumbbell','book-open','brain','phone-off','message-circle',
    'wallet','activity','library','piggy-bank','users','target',
    'heart-pulse','sparkles','sunrise','footprints','apple','pen-line',
  ]
  const VALID_ATTRS = ['health','knowledge','discipline','social','finance']

  try {
    const Groq = (await import('groq-sdk')).default
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const chat = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `Você classifica tarefas de desenvolvimento pessoal. Responda sempre com JSON válido.

Ícones disponíveis: ${VALID_ICONS.join(', ')}
Atributos disponíveis: health (saúde/exercício/alimentação), knowledge (estudo/leitura/aprendizado), discipline (hábitos/rotina/foco), social (pessoas/comunicação/networking), finance (dinheiro/investimento/economia)

Dificuldade: easy (< 15 min ou hábito simples), medium (15-60 min ou requer esforço), hard (> 1h ou desafio significativo)`,
        },
        {
          role: 'user',
          content: `Classifique esta tarefa e responda SOMENTE com JSON no formato:
{"difficulty":"easy"|"medium"|"hard","reason":"motivo curto em português","icon":"um dos ícones listados","attribute":"um dos atributos listados"}

Título: ${title}
Descrição: ${description || '(sem descrição)'}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 150,
      temperature: 0.1,
    })

    const raw = chat.choices[0]?.message?.content ?? '{}'
    const result = JSON.parse(raw) as {
      difficulty: 'easy' | 'medium' | 'hard'
      reason: string
      icon: string
      attribute: string
    }

    if (!['easy', 'medium', 'hard'].includes(result.difficulty)) {
      return { error: 'Resposta inesperada da IA' }
    }

    return {
      difficulty: result.difficulty,
      reason: result.reason,
      icon: VALID_ICONS.includes(result.icon) ? result.icon : 'target',
      attribute: VALID_ATTRS.includes(result.attribute) ? result.attribute as 'health'|'knowledge'|'discipline'|'social'|'finance' : null,
    }
  } catch {
    return { error: 'Erro ao classificar com IA. Verifique sua GROQ_API_KEY.' }
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}