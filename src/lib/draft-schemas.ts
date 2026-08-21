import { z } from 'zod'

export const expenseDraftPayloadSchema = z.object({
  title: z.string().min(1),
  amount: z.number().int().positive(),
  expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  paidByParticipantId: z.string().min(1),
  paidFor: z.array(
    z.object({
      participantId: z.string().min(1),
      shares: z.number().int().positive(),
    }),
  ),
  splitMode: z.enum(['EVENLY', 'BY_SHARES', 'BY_PERCENTAGE', 'BY_AMOUNT']),
  notes: z.string().optional(),
  budgetId: z.string().optional(),
  lineItems: z
    .array(
      z.object({
        description: z.string(),
        amount: z.number().int().positive(),
        participantIds: z.array(z.string()),
      }),
    )
    .optional(),
})

export type ExpenseDraftPayload = z.infer<typeof expenseDraftPayloadSchema>

export const receiptLineItemSchema = z.object({
  description: z.string(),
  amount: z.number().positive(),
  participantIds: z.array(z.string()).optional(),
})

export const receiptExtractSchema = z.object({
  title: z.string(),
  date: z.string(),
  total: z.number().positive(),
  tax: z.number().nonnegative().optional(),
  tip: z.number().nonnegative().optional(),
  lineItems: z.array(receiptLineItemSchema),
  paidByParticipantId: z.string().optional(),
})

export type ReceiptExtract = z.infer<typeof receiptExtractSchema>
