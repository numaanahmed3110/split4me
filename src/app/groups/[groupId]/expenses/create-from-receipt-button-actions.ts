'use server'

import { extractReceiptDraft } from '@/lib/receipt-extract'

export async function extractExpenseInformationFromImage(
  groupId: string,
  imageUrl: string,
  payerParticipantId?: string,
) {
  'use server'

  const result = await extractReceiptDraft(
    groupId,
    imageUrl,
    payerParticipantId,
  )
  if (!result) {
    return {
      amount: null,
      categoryId: null,
      date: null,
      title: null,
      draft: null,
    }
  }

  const { draft } = result
  return {
    amount: draft.amount / 100,
    categoryId: null,
    date: draft.expenseDate,
    title: draft.title,
    draft,
  }
}

export type ReceiptExtractedInfo = Awaited<
  ReturnType<typeof extractExpenseInformationFromImage>
>
