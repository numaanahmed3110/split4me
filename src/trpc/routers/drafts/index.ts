import { RecurrenceRule, SplitMode } from '@/generated/prisma/client'
import { createExpense, getGroup } from '@/lib/api'
import {
  expenseDraftPayloadSchema,
  type ExpenseDraftPayload,
} from '@/lib/draft-schemas'
import { prisma } from '@/lib/prisma'
import { randomId } from '@/lib/random'
import { getExpenseShares } from '@/lib/shares'
import { createTRPCRouter, protectedProcedure } from '@/trpc/init'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

function draftToFormValues(draft: ExpenseDraftPayload) {
  return {
    expenseDate: new Date(`${draft.expenseDate}T12:00:00.000Z`),
    title: draft.title,
    category: 0,
    amount: draft.amount,
    paidBy: draft.paidByParticipantId,
    paidFor: draft.paidFor.map((p) => ({
      participant: p.participantId,
      shares: p.shares,
    })),
    splitMode: draft.splitMode as SplitMode,
    documents: [],
    notes: draft.notes ?? '',
    recurrenceRule: RecurrenceRule.NONE,
    isReimbursement: false,
    saveDefaultSplittingOptions: false,
  }
}

export const draftsRouter = createTRPCRouter({
  preview: protectedProcedure
    .input(z.object({ payload: expenseDraftPayloadSchema }))
    .query(({ input }) => {
      const shares = getExpenseShares({
        amount: input.payload.amount,
        splitMode: input.payload.splitMode,
        paidFor: input.payload.paidFor,
      })
      return { shares: Object.fromEntries(shares) }
    }),

  create: protectedProcedure
    .input(
      z.object({
        groupId: z.string(),
        payload: expenseDraftPayloadSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const draft = await prisma.expenseDraft.create({
        data: {
          id: randomId(),
          groupId: input.groupId,
          createdByUserId: ctx.userId,
          payload: input.payload,
        },
      })
      return { draftId: draft.id }
    }),

  confirm: protectedProcedure
    .input(
      z.object({
        draftId: z.string(),
        groupId: z.string(),
        payload: expenseDraftPayloadSchema.optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const draft = await prisma.expenseDraft.findFirst({
        where: {
          id: input.draftId,
          groupId: input.groupId,
          createdByUserId: ctx.userId,
          status: 'PENDING',
        },
      })
      if (!draft) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Draft not found' })
      }

      const payload = expenseDraftPayloadSchema.parse(
        input.payload ?? draft.payload,
      )
      const group = await getGroup(input.groupId)
      if (!group) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Group not found' })
      }

      const expense = await createExpense(
        draftToFormValues(payload),
        input.groupId,
        payload.paidByParticipantId,
      )

      await prisma.expenseDraft.update({
        where: { id: draft.id },
        data: { status: 'CONFIRMED' },
      })

      await prisma.expense.update({
        where: { id: expense.id },
        data: { draftId: draft.id },
      })

      return { expenseId: expense.id }
    }),
})
