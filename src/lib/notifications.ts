import 'server-only'

import { effectiveBaseUrl } from '@/lib/env'
import { notifyUsers } from '@/lib/onesignal'
import { prisma } from '@/lib/prisma'

/**
 * Tell a group's other members that an expense was added.
 *
 * Deliberately never throws: a push failure must not fail the mutation that
 * already wrote the expense. Callers run this after the response.
 */
export async function notifyExpenseCreated({
  groupId,
  actorUserId,
  expenseTitle,
}: {
  groupId: string
  actorUserId: string
  expenseTitle: string
}) {
  try {
    const [group, recipients, actor] = await Promise.all([
      prisma.group.findUnique({
        where: { id: groupId },
        select: { name: true },
      }),
      // Everyone in the group except whoever just added the expense.
      prisma.groupMember.findMany({
        where: { groupId, userId: { not: actorUserId } },
        select: { userId: true },
      }),
      prisma.user.findUnique({
        where: { id: actorUserId },
        select: { name: true },
      }),
    ])

    if (!group || recipients.length === 0) return

    await notifyUsers(
      recipients.map((member) => member.userId),
      group.name,
      `${actor?.name ?? 'Someone'} added “${expenseTitle}”`,
      `${effectiveBaseUrl}/groups/${groupId}/expenses`,
    )
  } catch (error) {
    console.error('[OneSignal] Failed to notify group members', error)
  }
}
