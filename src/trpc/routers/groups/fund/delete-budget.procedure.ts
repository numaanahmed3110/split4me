import { deleteBudget } from '@/lib/fund'
import { protectedProcedure } from '@/trpc/init'
import { z } from 'zod'

export const deleteBudgetProcedure = protectedProcedure
  .input(
    z.object({
      groupId: z.string().min(1),
      budgetId: z.string().min(1),
    }),
  )
  .mutation(async ({ input: { groupId, budgetId } }) => {
    await deleteBudget(groupId, budgetId)
    return { ok: true }
  })
