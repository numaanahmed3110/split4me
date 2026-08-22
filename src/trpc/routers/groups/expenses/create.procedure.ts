import { createExpense } from '@/lib/api'
import { previewExpenseLedgerImpact } from '@/lib/fund'
import { notifyExpenseCreated } from '@/lib/notifications'
import { expenseFormSchema } from '@/lib/schemas'
import { protectedProcedure } from '@/trpc/init'
import { TRPCError } from '@trpc/server'
import { after } from 'next/server'
import { z } from 'zod'

export const createGroupExpenseProcedure = protectedProcedure
  .input(
    z.object({
      groupId: z.string().min(1),
      expenseFormValues: expenseFormSchema,
      participantId: z.string().optional(),
    }),
  )
  .mutation(
    async ({ ctx, input: { groupId, expenseFormValues, participantId } }) => {
      if (!expenseFormValues.ignoreBudgetWarning) {
        const impact = await previewExpenseLedgerImpact(groupId, {
          amount: expenseFormValues.amount,
          isReimbursement: expenseFormValues.isReimbursement,
          budgetId: expenseFormValues.budgetId,
          reserveId: expenseFormValues.reserveId,
        })
        if (
          impact &&
          (impact.exceedsFreelySpendable ||
            impact.consumesFromReserves ||
            !impact.projected.withinBudget)
        ) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: JSON.stringify({
              code: 'BUDGET_WARNING',
              warnings: impact.warnings,
              impact,
            }),
          })
        }
      }

      const expense = await createExpense(
        expenseFormValues,
        groupId,
        participantId,
      )

      // After the response: the client should not wait on OneSignal, and a
      // push failure must not roll back an expense that is already saved.
      after(() =>
        notifyExpenseCreated({
          groupId,
          actorUserId: ctx.userId,
          expenseTitle: expenseFormValues.title,
        }),
      )

      return { expenseId: expense.id }
    },
  )
