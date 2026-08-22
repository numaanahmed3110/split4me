import {
  computeExpenseImpact,
  computeFundLedger,
  validateReserveAmount,
  validateTargetAmount,
} from './fund-ledger'

const reserve = (id: string, amount: number, purpose = id) => ({
  id,
  purpose,
  amount,
  createdAt: new Date('2026-01-01'),
  releasedAt: null,
})

const expense = (
  amount: number,
  opts?: { budgetId?: string; reserveId?: string; id?: string },
) => ({
  id: opts?.id ?? `exp-${amount}-${Math.random()}`,
  amount,
  isReimbursement: false,
  budgetId: opts?.budgetId ?? null,
  reserveId: opts?.reserveId ?? null,
})

describe('computeFundLedger', () => {
  it('tracks budget, spending, remaining, and freely spendable', () => {
    const ledger = computeFundLedger({
      targetAmount: 600_000,
      expenses: [expense(350_000)],
      budgets: [],
      reserves: [reserve('r1', 200_000, 'Return train')],
    })

    expect(ledger.totalSpent).toBe(350_000)
    expect(ledger.remaining).toBe(250_000)
    expect(ledger.totalReserved).toBe(200_000)
    expect(ledger.freelySpendable).toBe(50_000)
    expect(ledger.withinBudget).toBe(true)
  })

  it('detects overflow into reserved money (FIFO)', () => {
    const ledger = computeFundLedger({
      targetAmount: 600_000,
      expenses: [expense(420_000)],
      budgets: [],
      reserves: [reserve('r1', 200_000)],
    })

    expect(ledger.consumedFromReserves).toBe(20_000)
    expect(ledger.freelySpendable).toBe(0)
    expect(ledger.reserves[0].consumed).toBe(20_000)
    expect(ledger.reserves[0].remaining).toBe(180_000)
    expect(ledger.reserves[0].alertLevel).toBe('consuming')
  })

  it('tracks direct reserve consumption from linked expenses', () => {
    const ledger = computeFundLedger({
      targetAmount: 600_000,
      expenses: [expense(170_000, { reserveId: 'r1' })],
      budgets: [],
      reserves: [reserve('r1', 200_000)],
    })

    expect(ledger.reserves[0].consumed).toBe(170_000)
    expect(ledger.reserves[0].remaining).toBe(30_000)
    expect(ledger.consumedFromReserves).toBe(170_000)
    expect(ledger.freelySpendable).toBe(400_000)
  })

  it('excludes reimbursements from spending', () => {
    const ledger = computeFundLedger({
      targetAmount: 600_000,
      expenses: [
        expense(300_000),
        { ...expense(100_000), isReimbursement: true },
      ],
      budgets: [],
      reserves: [],
    })

    expect(ledger.totalSpent).toBe(300_000)
  })

  it('tracks per-budget spending', () => {
    const ledger = computeFundLedger({
      targetAmount: 600_000,
      expenses: [
        expense(500_00, { budgetId: 'food' }),
        expense(800_00, { budgetId: 'transport' }),
      ],
      budgets: [
        { id: 'food', name: 'Food', allocatedAmount: 150_000 },
        { id: 'transport', name: 'Transport', allocatedAmount: 100_000 },
      ],
      reserves: [],
    })

    expect(ledger.budgets.find((b) => b.id === 'food')?.spent).toBe(500_00)
    expect(ledger.budgets.find((b) => b.id === 'transport')?.spent).toBe(800_00)
  })

  it('detects over budget', () => {
    const ledger = computeFundLedger({
      targetAmount: 600_000,
      expenses: [expense(630_000)],
      budgets: [],
      reserves: [],
    })

    expect(ledger.overBudget).toBe(30_000)
    expect(ledger.withinBudget).toBe(false)
  })

  it('ignores released reserves in totals', () => {
    const ledger = computeFundLedger({
      targetAmount: 600_000,
      expenses: [],
      budgets: [],
      reserves: [
        {
          ...reserve('r1', 200_000),
          releasedAt: new Date(),
        },
      ],
    })

    expect(ledger.totalReserved).toBe(0)
    expect(ledger.freelySpendable).toBe(600_000)
  })
})

describe('computeExpenseImpact', () => {
  it('warns when expense exceeds freely spendable', () => {
    const impact = computeExpenseImpact(
      {
        targetAmount: 600_000,
        expenses: [expense(350_000)],
        budgets: [],
        reserves: [reserve('r1', 200_000)],
      },
      {
        amount: 120_000,
        isReimbursement: false,
        budgetId: null,
        reserveId: null,
      },
    )

    expect(impact.exceedsFreelySpendable).toBe(true)
    expect(impact.exceedsFreelySpendableBy).toBe(70_000)
    expect(impact.warnings.length).toBeGreaterThan(0)
  })

  it('reverses old expense when editing', () => {
    const existing = expense(350_000, { id: 'e1' })
    const impact = computeExpenseImpact(
      {
        targetAmount: 600_000,
        expenses: [existing],
        budgets: [],
        reserves: [reserve('r1', 200_000)],
      },
      {
        id: 'e1',
        amount: 200_000,
        isReimbursement: false,
        budgetId: null,
        reserveId: null,
      },
      { excludeExpenseId: 'e1' },
    )

    expect(impact.projected.totalSpent).toBe(200_000)
    expect(impact.projected.freelySpendable).toBe(200_000)
  })
})

describe('validateReserveAmount', () => {
  it('rejects reserve larger than freely spendable', () => {
    const result = validateReserveAmount({
      amount: 300_000,
      targetAmount: 600_000,
      expenses: [expense(350_000)],
      reserves: [reserve('r1', 200_000)],
    })
    expect(result.ok).toBe(false)
  })

  it('allows valid reserve', () => {
    const result = validateReserveAmount({
      amount: 200_000,
      targetAmount: 600_000,
      expenses: [],
      reserves: [],
    })
    expect(result.ok).toBe(true)
  })
})

describe('validateTargetAmount', () => {
  it('rejects budget below spending', () => {
    const result = validateTargetAmount({
      targetAmount: 300_000,
      expenses: [expense(350_000)],
      reserves: [],
    })
    expect(result.ok).toBe(false)
  })

  it('rejects budget below spending plus reserves', () => {
    const result = validateTargetAmount({
      targetAmount: 500_000,
      expenses: [expense(350_000)],
      reserves: [reserve('r1', 200_000)],
    })
    expect(result.ok).toBe(false)
  })
})

describe('edge cases', () => {
  it('handles deleting expense after reserve consumption', () => {
    const before = computeFundLedger({
      targetAmount: 600_000,
      expenses: [expense(420_000)],
      budgets: [],
      reserves: [reserve('r1', 200_000)],
    })
    expect(before.consumedFromReserves).toBe(20_000)

    const after = computeFundLedger({
      targetAmount: 600_000,
      expenses: [],
      budgets: [],
      reserves: [reserve('r1', 200_000)],
    })
    expect(after.consumedFromReserves).toBe(0)
    expect(after.freelySpendable).toBe(400_000)
  })

  it('handles multiple reserves with FIFO overflow', () => {
    const ledger = computeFundLedger({
      targetAmount: 1_000_000,
      expenses: [expense(850_000)],
      budgets: [],
      reserves: [
        reserve('r1', 200_000),
        { ...reserve('r2', 150_000), createdAt: new Date('2026-01-02') },
      ],
    })

    // Freely spendable cap = 1M - 350k = 650k. Overflow = 200k.
    expect(ledger.consumedFromReserves).toBe(200_000)
    expect(ledger.reserves[0].consumed).toBe(200_000)
    expect(ledger.reserves[1].consumed).toBe(0)
  })
})
