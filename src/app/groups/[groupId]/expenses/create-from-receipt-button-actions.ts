'use server'

import type { ExpenseDraftPayload } from '@/lib/draft-schemas'
import {
  extractReceiptDraftFromBase64,
} from '@/lib/receipt-extract'

export async function extractExpenseInformationFromImage(
  groupId: string,
  imageDataUrl: string,
  payerParticipantId?: string,
) {
  'use server'

  const result = await extractReceiptDraftFromBase64(
    groupId,
    imageDataUrl,
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

export type { ExpenseDraftPayload }
