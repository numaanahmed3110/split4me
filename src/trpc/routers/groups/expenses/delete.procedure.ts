import { deleteExpense } from '@/lib/api'
import { protectedProcedure } from '@/trpc/init'
import { z } from 'zod'

export const deleteGroupExpenseProcedure = protectedProcedure
  .input(
    z.object({
      expenseId: z.string().min(1),
      groupId: z.string().min(1),
      participantId: z.string().optional(),
    }),
  )
  .mutation(async ({ input: { expenseId, groupId, participantId } }) => {
    await deleteExpense(groupId, expenseId, participantId)
    return {}
  })
