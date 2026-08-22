import { createBudget } from '@/lib/fund'
import { protectedProcedure } from '@/trpc/init'
import { z } from 'zod'

export const createBudgetProcedure = protectedProcedure
  .input(
    z.object({
      groupId: z.string().min(1),
      name: z.string().min(1).max(50),
      allocatedAmount: z.number().int().positive(),
    }),
  )
  .mutation(async ({ input }) => {
    const budget = await createBudget(input.groupId, {
      name: input.name,
      allocatedAmount: input.allocatedAmount,
    })
    return { budgetId: budget.id }
  })
