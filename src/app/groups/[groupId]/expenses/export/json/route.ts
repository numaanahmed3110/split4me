import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { create as contentDisposition } from 'content-disposition'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
  // Defence in depth: the middleware already gates /groups, but these handlers
  // stream group data straight out of the database, so they must not rely on
  // the matcher staying correct.
  await auth.protect()

  const { groupId } = await params
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: {
      id: true,
      name: true,
      information: true,
      currency: true,
      currencyCode: true,
      expenses: {
        select: {
          id: true,
          createdAt: true,
          expenseDate: true,
          title: true,
          category: { select: { grouping: true, name: true } },
          amount: true,
          originalAmount: true,
          originalCurrency: true,
          conversionRate: true,
          paidById: true,
          paidFor: { select: { participantId: true, shares: true } },
          isReimbursement: true,
          splitMode: true,
          recurrenceRule: true,
          notes: true,
        },
        orderBy: [{ expenseDate: 'asc' }, { createdAt: 'asc' }],
      },
      participants: { select: { id: true, name: true } },
      activities: {
        select: {
          id: true,
          time: true,
          activityType: true,
          participantId: true,
          expenseId: true,
          data: true,
        },
        orderBy: { time: 'asc' },
      },
    },
  })
  if (!group)
    return NextResponse.json({ error: 'Invalid group ID' }, { status: 404 })

  const date = new Date().toISOString().split('T')[0]
  const filename = `Spliit Export - ${date}`
  return NextResponse.json(group, {
    headers: {
      'content-type': 'application/json',
      'content-disposition': contentDisposition(`${filename}.json`),
    },
  })
}
