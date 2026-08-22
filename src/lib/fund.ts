import { ActivityType } from '@/generated/prisma/client'
import { logActivity } from '@/lib/api'
import {
  computeExpenseImpact,
  computeFundLedger,
  type LedgerExpense,
  validateBudgetAllocation,
  validateReserveAmount,
  validateTargetAmount,
} from '@/lib/fund-ledger'
import { prisma } from '@/lib/prisma'
import { randomId } from '@/lib/random'

export async function getFundForGroup(groupId: string) {
  return prisma.groupFund.findUnique({
    where: { groupId },
    include: {
      budgets: { orderBy: { name: 'asc' } },
      reserves: { orderBy: { createdAt: 'asc' } },
    },
  })
}

async function getLedgerExpenses(groupId: string): Promise<LedgerExpense[]> {
  const expenses = await prisma.expense.findMany({
    where: { groupId },
    select: {
      id: true,
      amount: true,
      isReimbursement: true,
      budgetId: true,
      reserveId: true,
      title: true,
      createdAt: true,
    },
  })
  return expenses
}

export async function getFundLedgerSnapshot(groupId: string) {
  const fund = await getFundForGroup(groupId)
  if (!fund) return null

  const expenses = await getLedgerExpenses(groupId)
  return computeFundLedger({
    targetAmount: fund.targetAmount,
    expenses,
    budgets: fund.budgets,
    reserves: fund.reserves,
  })
}

export async function getFundLedgerContext(groupId: string) {
  const fund = await getFundForGroup(groupId)
  if (!fund) return null

  const expenses = await getLedgerExpenses(groupId)
  return {
    fund,
    expenses,
    snapshot: computeFundLedger({
      targetAmount: fund.targetAmount,
      expenses,
      budgets: fund.budgets,
      reserves: fund.reserves,
    }),
  }
}

export async function ensureFundForGroup(
  groupId: string,
  targetAmount: number,
) {
  const existing = await getFundForGroup(groupId)
  if (existing) return existing

  const fund = await prisma.groupFund.create({
    data: {
      id: randomId(),
      groupId,
      targetAmount,
    },
    include: { budgets: true, reserves: true },
  })

  await logActivity(groupId, ActivityType.CREATE_FUND, {
    data: JSON.stringify({ targetAmount }),
  })

  return fund
}

export async function createOrUpdateFund(
  groupId: string,
  targetAmount: number,
) {
  const existing = await getFundForGroup(groupId)
  const expenses = await getLedgerExpenses(groupId)
  const reserves = existing?.reserves ?? []

  const validation = validateTargetAmount({
    targetAmount,
    expenses,
    reserves,
  })
  if (!validation.ok) {
    throw new Error(validation.reason)
  }

  if (existing) {
    await logActivity(groupId, ActivityType.UPDATE_FUND, {
      data: JSON.stringify({
        from: existing.targetAmount,
        to: targetAmount,
      }),
    })
    return prisma.groupFund.update({
      where: { id: existing.id },
      data: { targetAmount },
      include: { budgets: true, reserves: true },
    })
  }

  return ensureFundForGroup(groupId, targetAmount)
}

export async function createBudget(
  groupId: string,
  input: { name: string; allocatedAmount: number },
) {
  const fund = await getFundForGroup(groupId)
  if (!fund) throw new Error('Create a trip budget before adding allocations.')

  const validation = validateBudgetAllocation({
    allocatedAmount: input.allocatedAmount,
    targetAmount: fund.targetAmount,
    budgets: fund.budgets,
  })
  if (!validation.ok) throw new Error(validation.reason)

  const budget = await prisma.budget.create({
    data: {
      id: randomId(),
      fundId: fund.id,
      name: input.name,
      allocatedAmount: input.allocatedAmount,
    },
  })

  await logActivity(groupId, ActivityType.CREATE_BUDGET, {
    data: JSON.stringify({
      name: input.name,
      allocatedAmount: input.allocatedAmount,
    }),
  })

  return budget
}

export async function updateBudget(
  groupId: string,
  budgetId: string,
  input: { name?: string; allocatedAmount?: number },
) {
  const fund = await getFundForGroup(groupId)
  if (!fund) throw new Error('Fund not found.')

  const budget = fund.budgets.find((b) => b.id === budgetId)
  if (!budget) throw new Error('Budget not found.')

  const allocatedAmount = input.allocatedAmount ?? budget.allocatedAmount
  const validation = validateBudgetAllocation({
    allocatedAmount,
    targetAmount: fund.targetAmount,
    budgets: fund.budgets,
    excludeBudgetId: budgetId,
  })
  if (!validation.ok) throw new Error(validation.reason)

  const updated = await prisma.budget.update({
    where: { id: budgetId },
    data: {
      name: input.name ?? budget.name,
      allocatedAmount,
    },
  })

  await logActivity(groupId, ActivityType.UPDATE_BUDGET, {
    data: JSON.stringify({ budgetId, ...input }),
  })

  return updated
}

export async function deleteBudget(groupId: string, budgetId: string) {
  const fund = await getFundForGroup(groupId)
  if (!fund) throw new Error('Fund not found.')

  await prisma.expense.updateMany({
    where: { budgetId },
    data: { budgetId: null },
  })

  await prisma.budget.delete({ where: { id: budgetId } })

  await logActivity(groupId, ActivityType.DELETE_BUDGET, {
    data: JSON.stringify({ budgetId }),
  })
}

export async function createReserve(
  groupId: string,
  input: { purpose: string; amount: number },
) {
  const fund = await getFundForGroup(groupId)
  if (!fund) throw new Error('Create a trip budget before adding reserves.')

  const expenses = await getLedgerExpenses(groupId)
  const validation = validateReserveAmount({
    amount: input.amount,
    targetAmount: fund.targetAmount,
    expenses,
    reserves: fund.reserves,
  })
  if (!validation.ok) throw new Error(validation.reason)

  const reserve = await prisma.fundReserve.create({
    data: {
      id: randomId(),
      fundId: fund.id,
      purpose: input.purpose,
      amount: input.amount,
    },
  })

  await logActivity(groupId, ActivityType.CREATE_RESERVE, {
    data: JSON.stringify(input),
  })

  return reserve
}

export async function updateReserve(
  groupId: string,
  reserveId: string,
  input: { purpose?: string; amount?: number },
) {
  const fund = await getFundForGroup(groupId)
  if (!fund) throw new Error('Fund not found.')

  const reserve = fund.reserves.find((r) => r.id === reserveId)
  if (!reserve) throw new Error('Reserve not found.')
  if (reserve.releasedAt) throw new Error('Cannot edit a released reserve.')

  const expenses = await getLedgerExpenses(groupId)
  const snapshot = computeFundLedger({
    targetAmount: fund.targetAmount,
    expenses,
    budgets: fund.budgets,
    reserves: fund.reserves,
  })
  const status = snapshot.reserves.find((r) => r.id === reserveId)
  const minAmount = status?.consumed ?? 0

  const amount = input.amount ?? reserve.amount
  const validation = validateReserveAmount({
    amount,
    targetAmount: fund.targetAmount,
    expenses,
    reserves: fund.reserves,
    excludeReserveId: reserveId,
    minAmount,
  })
  if (!validation.ok) throw new Error(validation.reason)

  const updated = await prisma.fundReserve.update({
    where: { id: reserveId },
    data: {
      purpose: input.purpose ?? reserve.purpose,
      amount,
    },
  })

  await logActivity(groupId, ActivityType.UPDATE_RESERVE, {
    data: JSON.stringify({ reserveId, ...input }),
  })

  return updated
}

export async function releaseReserve(groupId: string, reserveId: string) {
  const fund = await getFundForGroup(groupId)
  if (!fund) throw new Error('Fund not found.')

  const reserve = fund.reserves.find((r) => r.id === reserveId)
  if (!reserve) throw new Error('Reserve not found.')
  if (reserve.releasedAt) throw new Error('Reserve already released.')

  const updated = await prisma.fundReserve.update({
    where: { id: reserveId },
    data: { releasedAt: new Date() },
  })

  await logActivity(groupId, ActivityType.RELEASE_RESERVE, {
    data: JSON.stringify({ reserveId, purpose: reserve.purpose }),
  })

  return updated
}

export async function previewExpenseLedgerImpact(
  groupId: string,
  expense: {
    amount: number
    isReimbursement: boolean
    budgetId?: string | null
    reserveId?: string | null
  },
  options?: { excludeExpenseId?: string },
) {
  const context = await getFundLedgerContext(groupId)
  if (!context) return null

  return computeExpenseImpact(
    {
      targetAmount: context.fund.targetAmount,
      expenses: context.expenses,
      budgets: context.fund.budgets,
      reserves: context.fund.reserves,
    },
    {
      amount: expense.amount,
      isReimbursement: expense.isReimbursement,
      budgetId: expense.budgetId ?? null,
      reserveId: expense.reserveId ?? null,
    },
    options,
  )
}

export async function resolveExpenseFundFields(
  groupId: string,
  budgetId?: string | null,
  reserveId?: string | null,
) {
  const fund = await getFundForGroup(groupId)
  if (!fund) {
    return { fundId: null as string | null, budgetId: null, reserveId: null }
  }

  if (budgetId) {
    const budget = fund.budgets.find((b) => b.id === budgetId)
    if (!budget) throw new Error('Invalid budget for this group.')
  }

  if (reserveId) {
    const reserve = fund.reserves.find(
      (r) => r.id === reserveId && !r.releasedAt,
    )
    if (!reserve) throw new Error('Invalid or released reserve.')
  }

  return {
    fundId: fund.id,
    budgetId: budgetId ?? null,
    reserveId: reserveId ?? null,
  }
}

export type LedgerHistoryEntry = {
  id: string
  time: Date
  type: string
  label: string
  amount?: number
  meta?: Record<string, unknown>
}

export async function getLedgerHistory(
  groupId: string,
  options?: { limit?: number },
): Promise<LedgerHistoryEntry[]> {
  const limit = options?.limit ?? 50
  const [activities, expenses] = await Promise.all([
    prisma.activity.findMany({
      where: {
        groupId,
        activityType: {
          in: [
            ActivityType.CREATE_FUND,
            ActivityType.UPDATE_FUND,
            ActivityType.CREATE_BUDGET,
            ActivityType.UPDATE_BUDGET,
            ActivityType.DELETE_BUDGET,
            ActivityType.CREATE_RESERVE,
            ActivityType.UPDATE_RESERVE,
            ActivityType.RELEASE_RESERVE,
            ActivityType.CREATE_EXPENSE,
            ActivityType.UPDATE_EXPENSE,
            ActivityType.DELETE_EXPENSE,
          ],
        },
      },
      orderBy: { time: 'desc' },
      take: limit,
    }),
    prisma.expense.findMany({
      where: { groupId, isReimbursement: false },
      select: {
        id: true,
        title: true,
        amount: true,
        reserveId: true,
        createdAt: true,
        expenseDate: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
  ])

  const fund = await getFundForGroup(groupId)
  const ledgerExpenses = await getLedgerExpenses(groupId)
  const snapshot = fund
    ? computeFundLedger({
        targetAmount: fund.targetAmount,
        expenses: ledgerExpenses,
        budgets: fund.budgets,
        reserves: fund.reserves,
      })
    : null

  const entries: LedgerHistoryEntry[] = []

  for (const activity of activities) {
    let label: string = activity.activityType
    let amount: number | undefined
    try {
      const data = activity.data
        ? (JSON.parse(activity.data) as Record<string, unknown>)
        : {}
      switch (activity.activityType) {
        case ActivityType.CREATE_FUND:
          label = 'Trip budget created'
          amount = Number(data.targetAmount)
          break
        case ActivityType.UPDATE_FUND:
          label = 'Trip budget updated'
          amount = Number(data.to)
          break
        case ActivityType.CREATE_BUDGET:
          label = `Budget allocation: ${String(data.name)}`
          amount = Number(data.allocatedAmount)
          break
        case ActivityType.CREATE_RESERVE:
          label = `Reserved: ${String(data.purpose)}`
          amount = Number(data.amount)
          break
        case ActivityType.RELEASE_RESERVE:
          label = `Released reserve: ${String(data.purpose)}`
          break
        case ActivityType.DELETE_EXPENSE:
          label = `Deleted expense: ${String(activity.data ?? '')}`
          break
        default:
          label = activity.activityType
      }
    } catch {
      label = activity.activityType
    }

    entries.push({
      id: activity.id,
      time: activity.time,
      type: activity.activityType,
      label,
      amount,
    })
  }

  for (const exp of expenses) {
    const reserveStatus = exp.reserveId
      ? snapshot?.reserves.find((r) => r.id === exp.reserveId)
      : undefined
    entries.push({
      id: `expense-${exp.id}`,
      time: exp.createdAt,
      type: 'EXPENSE',
      label: exp.title,
      amount: -exp.amount,
      meta: reserveStatus
        ? { reservePurpose: reserveStatus.purpose }
        : undefined,
    })
  }

  return entries
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, limit)
}
