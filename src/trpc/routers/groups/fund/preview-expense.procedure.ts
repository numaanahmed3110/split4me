import { previewExpenseLedgerImpact } from '@/lib/fund'
import { protectedProcedure } from '@/trpc/init'
import { z } from 'zod'

export const previewExpenseProcedure = protectedProcedure
  .input(
    z.object({
      groupId: z.string().min(1),
      amount: z.number().int(),
      isReimbursement: z.boolean().default(false),
      budgetId: z.string().nullish(),
      reserveId: z.string().nullish(),
      excludeExpenseId: z.string().optional(),
    }),
  )
  .query(async ({ input }) => {
    const impact = await previewExpenseLedgerImpact(
      input.groupId,
      {
        amount: input.amount,
        isReimbursement: input.isReimbursement,
        budgetId: input.budgetId,
        reserveId: input.reserveId,
      },
      { excludeExpenseId: input.excludeExpenseId },
    )
    return impact
  })
