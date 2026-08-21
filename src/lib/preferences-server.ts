import 'server-only'

import { prisma } from '@/lib/prisma'
import { randomId } from '@/lib/random'

export async function ensureUserPreferenceRow(userId: string, groupId: string) {
  return prisma.userGroupPreference.upsert({
    where: { userId_groupId: { userId, groupId } },
    create: { userId, groupId },
    update: {},
  })
}

export async function touchRecentGroup(userId: string, groupId: string) {
  const minOrder = await prisma.userGroupPreference.aggregate({
    where: { userId },
    _min: { recentOrder: true },
  })
  const nextOrder = (minOrder._min.recentOrder ?? 0) - 1

  return prisma.userGroupPreference.upsert({
    where: { userId_groupId: { userId, groupId } },
    create: { userId, groupId, recentOrder: nextOrder },
    update: { recentOrder: nextOrder },
  })
}

export async function listUserGroupPreferences(userId: string) {
  return prisma.userGroupPreference.findMany({
    where: { userId },
    orderBy: [{ recentOrder: 'asc' }, { groupId: 'asc' }],
    include: {
      group: {
        select: { id: true, name: true },
      },
    },
  })
}

export async function setGroupStarred(
  userId: string,
  groupId: string,
  starred: boolean,
) {
  await ensureUserPreferenceRow(userId, groupId)
  return prisma.userGroupPreference.update({
    where: { userId_groupId: { userId, groupId } },
    data: { starred },
  })
}

export async function setGroupArchived(
  userId: string,
  groupId: string,
  archived: boolean,
) {
  await ensureUserPreferenceRow(userId, groupId)
  return prisma.userGroupPreference.update({
    where: { userId_groupId: { userId, groupId } },
    data: { archived },
  })
}

export async function getMembership(userId: string, groupId: string) {
  return prisma.groupMember.findUnique({
    where: { userId_groupId: { userId, groupId } },
    select: { participantId: true },
  })
}

export async function setMembership(
  userId: string,
  groupId: string,
  participantId: string | null,
) {
  if (!participantId) {
    await prisma.groupMember.deleteMany({ where: { userId, groupId } })
    return null
  }

  return prisma.groupMember.upsert({
    where: { userId_groupId: { userId, groupId } },
    create: { userId, groupId, participantId },
    update: { participantId },
  })
}

export async function joinGroupAsParticipant(
  userId: string,
  groupId: string,
  participantId: string,
) {
  const participant = await prisma.participant.findFirst({
    where: { id: participantId, groupId },
  })
  if (!participant) {
    throw new Error('Participant not found in group')
  }

  const existing = await prisma.groupMember.findUnique({
    where: { participantId },
  })
  if (existing && existing.userId !== userId) {
    throw new Error('Participant already claimed by another user')
  }

  return setMembership(userId, groupId, participantId)
}

export async function createMembershipForNewGroup(
  userId: string,
  groupId: string,
  participantId: string,
) {
  return prisma.groupMember.create({
    data: { userId, groupId, participantId },
  })
}

export async function getDefaultSplitJson(userId: string, groupId: string) {
  const pref = await prisma.userGroupPreference.findUnique({
    where: { userId_groupId: { userId, groupId } },
    select: { defaultSplitJson: true },
  })
  return pref?.defaultSplitJson ?? null
}

export async function setDefaultSplitJson(
  userId: string,
  groupId: string,
  defaultSplitJson: string | null,
) {
  await ensureUserPreferenceRow(userId, groupId)
  return prisma.userGroupPreference.update({
    where: { userId_groupId: { userId, groupId } },
    data: { defaultSplitJson },
  })
}

export async function migrateLocalPreferences(
  userId: string,
  data: {
    recentGroups: { id: string; name: string }[]
    starredGroups: string[]
    archivedGroups: string[]
    memberships: Record<string, string>
    defaultSplits: Record<string, string>
  },
) {
  for (let i = 0; i < data.recentGroups.length; i++) {
    const group = data.recentGroups[i]
    await prisma.userGroupPreference.upsert({
      where: { userId_groupId: { userId, groupId: group.id } },
      create: {
        userId,
        groupId: group.id,
        recentOrder: i,
        starred: data.starredGroups.includes(group.id),
        archived: data.archivedGroups.includes(group.id),
        defaultSplitJson: data.defaultSplits[group.id] ?? null,
      },
      update: {
        recentOrder: i,
        starred: data.starredGroups.includes(group.id),
        archived: data.archivedGroups.includes(group.id),
        defaultSplitJson: data.defaultSplits[group.id] ?? undefined,
      },
    })
  }

  for (const [groupId, participantId] of Object.entries(data.memberships)) {
    if (!participantId || participantId === 'None' || participantId === 'none') {
      continue
    }
    try {
      await joinGroupAsParticipant(userId, groupId, participantId)
    } catch {
      // Participant may no longer exist or already claimed — skip
    }
  }
}
