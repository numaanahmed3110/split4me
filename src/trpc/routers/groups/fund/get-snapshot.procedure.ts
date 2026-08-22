import { getFundLedgerContext } from '@/lib/fund'
import { protectedProcedure } from '@/trpc/init'
import { z } from 'zod'

export const getSnapshotProcedure = protectedProcedure
  .input(z.object({ groupId: z.string().min(1) }))
  .query(async ({ input: { groupId } }) => {
    const context = await getFundLedgerContext(groupId)
    if (!context) {
      return { fund: null, snapshot: null }
    }
    return {
      fund: {
        id: context.fund.id,
        targetAmount: context.fund.targetAmount,
        budgets: context.fund.budgets,
        reserves: context.fund.reserves,
      },
      snapshot: context.snapshot,
    }
  })
