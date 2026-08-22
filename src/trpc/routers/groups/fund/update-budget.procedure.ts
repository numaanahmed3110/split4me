import { updateBudget } from '@/lib/fund'
import { protectedProcedure } from '@/trpc/init'
import { z } from 'zod'

export const updateBudgetProcedure = protectedProcedure
  .input(
    z.object({
      groupId: z.string().min(1),
      budgetId: z.string().min(1),
      name: z.string().min(1).max(50).optional(),
      allocatedAmount: z.number().int().positive().optional(),
    }),
  )
  .mutation(async ({ input: { groupId, budgetId, ...data } }) => {
    await updateBudget(groupId, budgetId, data)
    return { ok: true }
  })
