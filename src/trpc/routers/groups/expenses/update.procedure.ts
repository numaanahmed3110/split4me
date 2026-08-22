import { updateExpense } from '@/lib/api'
import { previewExpenseLedgerImpact } from '@/lib/fund'
import { expenseFormSchema } from '@/lib/schemas'
import { protectedProcedure } from '@/trpc/init'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const updateGroupExpenseProcedure = protectedProcedure
  .input(
    z.object({
      expenseId: z.string().min(1),
      groupId: z.string().min(1),
      expenseFormValues: expenseFormSchema,
      participantId: z.string().optional(),
    }),
  )
  .mutation(
    async ({
      input: { expenseId, groupId, expenseFormValues, participantId },
    }) => {
      if (!expenseFormValues.ignoreBudgetWarning) {
        const impact = await previewExpenseLedgerImpact(
          groupId,
          {
            amount: expenseFormValues.amount,
            isReimbursement: expenseFormValues.isReimbursement,
            budgetId: expenseFormValues.budgetId,
            reserveId: expenseFormValues.reserveId,
          },
          { excludeExpenseId: expenseId },
        )
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

      const expense = await updateExpense(
        groupId,
        expenseId,
        expenseFormValues,
        participantId,
      )
      return { expenseId: expense.id }
    },
  )
