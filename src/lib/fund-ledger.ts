/**
 * Shared ledger calculations derived from expenses (source of truth).
 * Amounts are in minor units (cents). Reimbursements do not count as spending.
 */

export type LedgerExpense = {
  id: string
  amount: number
  isReimbursement: boolean
  budgetId: string | null
  reserveId: string | null
  title?: string
  createdAt?: Date
}

export type LedgerBudget = {
  id: string
  name: string
  allocatedAmount: number
}

export type LedgerReserve = {
  id: string
  purpose: string
  amount: number
  createdAt: Date
  releasedAt: Date | null
}

export type ReserveAlertLevel =
  | 'normal'
  | 'approaching'
  | 'consuming'
  | 'significant'
  | 'exhausted'

export type ReserveStatus = {
  id: string
  purpose: string
  amount: number
  consumed: number
  remaining: number
  percentConsumed: number
  alertLevel: ReserveAlertLevel
  released: boolean
}

export type BudgetStatus = {
  id: string
  name: string
  allocatedAmount: number
  spent: number
  remaining: number
  percentConsumed: number
  overAllocation: boolean
  withinBudget: boolean
}

export type FundLedgerSnapshot = {
  targetAmount: number
  totalSpent: number
  remaining: number
  totalReserved: number
  freelySpendable: number
  consumedFromReserves: number
  overBudget: number
  percentConsumed: number
  withinBudget: boolean
  budgets: BudgetStatus[]
  reserves: ReserveStatus[]
  overallAlertLevel: ReserveAlertLevel
}

export type ExpenseImpact = {
  current: FundLedgerSnapshot
  projected: FundLedgerSnapshot
  exceedsFreelySpendable: boolean
  exceedsFreelySpendableBy: number
  consumesFromReserves: boolean
  consumedFromReservesAmount: number
  warnings: string[]
}

const APPROACHING_THRESHOLD = 0.8
const SIGNIFICANT_THRESHOLD = 0.6

function spendingExpenses(expenses: LedgerExpense[]): LedgerExpense[] {
  return expenses.filter((e) => !e.isReimbursement)
}

function activeReserves(reserves: LedgerReserve[]): LedgerReserve[] {
  return reserves.filter((r) => r.releasedAt === null)
}

/** Direct consumption per reserve from explicitly linked expenses. */
export function getDirectReserveConsumption(
  expenses: LedgerExpense[],
  reserves: LedgerReserve[],
): Map<string, number> {
  const consumption = new Map<string, number>()
  for (const reserve of reserves) {
    consumption.set(reserve.id, 0)
  }
  for (const expense of spendingExpenses(expenses)) {
    if (!expense.reserveId) continue
    const current = consumption.get(expense.reserveId) ?? 0
    consumption.set(expense.reserveId, current + expense.amount)
  }
  return consumption
}

/**
 * Unassigned spending that overflows into protected reserves (FIFO by createdAt).
 */
export function getOverflowReserveConsumption(
  totalSpent: number,
  targetAmount: number,
  totalReserved: number,
  directConsumption: Map<string, number>,
  reserves: LedgerReserve[],
): Map<string, number> {
  const overflow = Math.max(0, totalSpent - Math.max(0, targetAmount - totalReserved))
  if (overflow <= 0) return new Map()

  const sorted = [...activeReserves(reserves)].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  )

  const fifo = new Map<string, number>()
  let remainingOverflow = overflow

  for (const reserve of sorted) {
    if (remainingOverflow <= 0) break
    const direct = directConsumption.get(reserve.id) ?? 0
    const capacity = Math.max(0, reserve.amount - direct)
    const allocated = Math.min(capacity, remainingOverflow)
    if (allocated > 0) {
      fifo.set(reserve.id, allocated)
      remainingOverflow -= allocated
    }
  }

  return fifo
}

function reserveAlertLevel(
  consumed: number,
  amount: number,
  hasOverflow: boolean,
): ReserveAlertLevel {
  if (amount <= 0) return 'normal'
  if (consumed >= amount) return 'exhausted'
  const ratio = consumed / amount
  if (ratio >= SIGNIFICANT_THRESHOLD) return 'significant'
  if (hasOverflow && consumed > 0) return 'consuming'
  if (ratio >= APPROACHING_THRESHOLD) return 'approaching'
  return 'normal'
}

export function computeFundLedger(input: {
  targetAmount: number
  expenses: LedgerExpense[]
  budgets: LedgerBudget[]
  reserves: LedgerReserve[]
}): FundLedgerSnapshot {
  const { targetAmount, expenses, budgets, reserves } = input
  const spent = spendingExpenses(expenses).reduce((s, e) => s + e.amount, 0)
  const active = activeReserves(reserves)
  const totalReserved = active.reduce((s, r) => s + r.amount, 0)
  const remaining = targetAmount - spent
  const overBudget = Math.max(0, spent - targetAmount)
  const percentConsumed =
    targetAmount > 0 ? Math.min(100, (spent / targetAmount) * 100) : 0

  const direct = getDirectReserveConsumption(expenses, reserves)
  const fifo = getOverflowReserveConsumption(
    spent,
    targetAmount,
    totalReserved,
    direct,
    reserves,
  )

  let consumedFromReserves = 0
  const reserveStatuses: ReserveStatus[] = reserves.map((reserve) => {
    const directAmt = Math.min(
      reserve.amount,
      direct.get(reserve.id) ?? 0,
    )
    const fifoAmt = reserve.releasedAt ? 0 : (fifo.get(reserve.id) ?? 0)
    const consumed = Math.min(reserve.amount, directAmt + fifoAmt)
    if (!reserve.releasedAt) {
      consumedFromReserves += consumed
    }
    const remainingReserve = Math.max(0, reserve.amount - consumed)
    const hasOverflow = fifoAmt > 0
    return {
      id: reserve.id,
      purpose: reserve.purpose,
      amount: reserve.amount,
      consumed,
      remaining: remainingReserve,
      percentConsumed:
        reserve.amount > 0 ? (consumed / reserve.amount) * 100 : 0,
      alertLevel: reserve.releasedAt
        ? 'normal'
        : reserveAlertLevel(consumed, reserve.amount, hasOverflow),
      released: reserve.releasedAt !== null,
    }
  })

  const activeReserveRemaining = reserveStatuses
    .filter((r) => !r.released)
    .reduce((s, r) => s + r.remaining, 0)

  const freelySpendable = Math.max(0, remaining - activeReserveRemaining)

  const budgetStatuses: BudgetStatus[] = budgets.map((budget) => {
    const budgetSpent = spendingExpenses(expenses)
      .filter((e) => e.budgetId === budget.id)
      .reduce((s, e) => s + e.amount, 0)
    const budgetRemaining = budget.allocatedAmount - budgetSpent
    return {
      id: budget.id,
      name: budget.name,
      allocatedAmount: budget.allocatedAmount,
      spent: budgetSpent,
      remaining: budgetRemaining,
      percentConsumed:
        budget.allocatedAmount > 0
          ? Math.min(100, (budgetSpent / budget.allocatedAmount) * 100)
          : 0,
      overAllocation: budgetSpent > budget.allocatedAmount,
      withinBudget: budgetSpent <= budget.allocatedAmount,
    }
  })

  const activeAlerts = reserveStatuses
    .filter((r) => !r.released)
    .map((r) => r.alertLevel)
  let overallAlertLevel: ReserveAlertLevel = 'normal'
  if (activeAlerts.includes('exhausted')) overallAlertLevel = 'exhausted'
  else if (activeAlerts.includes('significant')) overallAlertLevel = 'significant'
  else if (activeAlerts.includes('consuming')) overallAlertLevel = 'consuming'
  else if (activeAlerts.includes('approaching')) overallAlertLevel = 'approaching'
  else if (spent > targetAmount - totalReserved * APPROACHING_THRESHOLD) {
    overallAlertLevel = 'approaching'
  }

  return {
    targetAmount,
    totalSpent: spent,
    remaining,
    totalReserved,
    freelySpendable,
    consumedFromReserves,
    overBudget,
    percentConsumed,
    withinBudget: spent <= targetAmount,
    budgets: budgetStatuses,
    reserves: reserveStatuses,
    overallAlertLevel,
  }
}

export function computeExpenseImpact(
  ledger: {
    targetAmount: number
    expenses: LedgerExpense[]
    budgets: LedgerBudget[]
    reserves: LedgerReserve[]
  },
  expense: Omit<LedgerExpense, 'id'> & { id?: string },
  options?: { excludeExpenseId?: string },
): ExpenseImpact {
  const expenses = ledger.expenses.filter(
    (e) => e.id !== options?.excludeExpenseId,
  )
  const current = computeFundLedger({
    targetAmount: ledger.targetAmount,
    expenses,
    budgets: ledger.budgets,
    reserves: ledger.reserves,
  })

  const projectedExpenses = [
    ...expenses,
    {
      id: expense.id ?? '__preview__',
      amount: expense.amount,
      isReimbursement: expense.isReimbursement,
      budgetId: expense.budgetId,
      reserveId: expense.reserveId,
    },
  ]

  const projected = computeFundLedger({
    targetAmount: ledger.targetAmount,
    expenses: projectedExpenses,
    budgets: ledger.budgets,
    reserves: ledger.reserves,
  })

  const warnings: string[] = []
  const exceedsFreelySpendableBy = Math.max(
    0,
    expense.isReimbursement
      ? 0
      : expense.amount - current.freelySpendable,
  )
  const exceedsFreelySpendable = exceedsFreelySpendableBy > 0

  if (exceedsFreelySpendable) {
    warnings.push(
      `This expense exceeds freely spendable budget by ${exceedsFreelySpendableBy} minor units.`,
    )
  }

  const consumedFromReservesAmount =
    projected.consumedFromReserves - current.consumedFromReserves
  const consumesFromReserves = consumedFromReservesAmount > 0

  if (consumesFromReserves) {
    warnings.push(
      `This expense will consume ${consumedFromReservesAmount} from protected reserves.`,
    )
  }

  if (!projected.withinBudget) {
    warnings.push(
      `This expense will put the group over budget by ${projected.overBudget} minor units.`,
    )
  }

  if (expense.budgetId) {
    const budget = projected.budgets.find((b) => b.id === expense.budgetId)
    if (budget?.overAllocation) {
      warnings.push(`This expense exceeds the "${budget.name}" allocation.`)
    }
  }

  return {
    current,
    projected,
    exceedsFreelySpendable,
    exceedsFreelySpendableBy,
    consumesFromReserves,
    consumedFromReservesAmount,
    warnings,
  }
}

export function validateReserveAmount(input: {
  amount: number
  targetAmount: number
  expenses: LedgerExpense[]
  reserves: LedgerReserve[]
  excludeReserveId?: string
  minAmount?: number
}): { ok: true } | { ok: false; reason: string } {
  const { amount, targetAmount, expenses, reserves, excludeReserveId, minAmount } =
    input

  if (amount <= 0) {
    return { ok: false, reason: 'Reserve amount must be positive.' }
  }

  if (minAmount !== undefined && amount < minAmount) {
    return {
      ok: false,
      reason: `Reserve amount cannot be less than already consumed (${minAmount}).`,
    }
  }

  const active = activeReserves(reserves).filter(
    (r) => r.id !== excludeReserveId,
  )
  const otherReserved = active.reduce((s, r) => s + r.amount, 0)
  const spent = spendingExpenses(expenses).reduce((s, e) => s + e.amount, 0)
  const maxReservable = Math.max(0, targetAmount - spent - otherReserved)

  if (amount > maxReservable) {
    return {
      ok: false,
      reason: `Cannot reserve more than freely spendable amount (${maxReservable}).`,
    }
  }

  return { ok: true }
}

export function validateTargetAmount(input: {
  targetAmount: number
  expenses: LedgerExpense[]
  reserves: LedgerReserve[]
}): { ok: true } | { ok: false; reason: string } {
  const { targetAmount, expenses, reserves } = input

  if (targetAmount <= 0) {
    return { ok: false, reason: 'Budget must be positive.' }
  }

  const spent = spendingExpenses(expenses).reduce((s, e) => s + e.amount, 0)
  if (targetAmount < spent) {
    return {
      ok: false,
      reason: `Budget cannot be less than amount already spent (${spent}).`,
    }
  }

  const totalReserved = activeReserves(reserves).reduce((s, r) => s + r.amount, 0)
  if (targetAmount < spent + totalReserved) {
    return {
      ok: false,
      reason:
        'Budget cannot be less than spending plus active reserves.',
    }
  }

  return { ok: true }
}

export function validateBudgetAllocation(input: {
  allocatedAmount: number
  targetAmount: number
  budgets: LedgerBudget[]
  excludeBudgetId?: string
}): { ok: true } | { ok: false; reason: string } {
  const { allocatedAmount, targetAmount, budgets, excludeBudgetId } = input

  if (allocatedAmount <= 0) {
    return { ok: false, reason: 'Allocation must be positive.' }
  }

  const other = budgets
    .filter((b) => b.id !== excludeBudgetId)
    .reduce((s, b) => s + b.allocatedAmount, 0)

  if (other + allocatedAmount > targetAmount) {
    return {
      ok: false,
      reason: 'Total allocations cannot exceed trip budget.',
    }
  }

  return { ok: true }
}
