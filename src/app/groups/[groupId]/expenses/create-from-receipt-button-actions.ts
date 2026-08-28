'use server'

import { aiLog, createAiLogId } from '@/lib/ai-log'
import type { ExpenseDraftPayload } from '@/lib/draft-schemas'
import { extractReceiptDraftFromBase64 } from '@/lib/receipt-extract'

export type ReceiptExtractActionResult = {
  amount: number | null
  categoryId: null
  date: string | null
  title: string | null
  draft: ExpenseDraftPayload | null
  logId: string
  error?: string
}

export async function extractExpenseInformationFromImage(
  groupId: string,
  imageDataUrl: string,
  payerParticipantId?: string,
): Promise<ReceiptExtractActionResult> {
  'use server'

  const logId = createAiLogId()
  aiLog('info', {
    feature: 'ocr',
    stage: 'action_start',
    logId,
    groupId,
    meta: {
      hasPayerParticipantId: !!payerParticipantId,
      imageDataUrlKind: imageDataUrl.startsWith('data:image/')
        ? 'data_url'
        : 'other',
    },
  })

  try {
    const result = await extractReceiptDraftFromBase64(
      groupId,
      imageDataUrl,
      payerParticipantId,
      logId,
    )

    if (!result.draft) {
      aiLog('warn', {
        feature: 'ocr',
        stage: 'action_no_draft',
        logId: result.logId,
        groupId,
      })
      return {
        amount: null,
        categoryId: null,
        date: null,
        title: null,
        draft: null,
        logId: result.logId,
        error: 'Could not read anything from this receipt.',
      }
    }

    const { draft } = result
    aiLog('info', {
      feature: 'ocr',
      stage: 'action_success',
      logId: result.logId,
      groupId,
      meta: { title: draft.title, amountMinor: draft.amount },
    })

    return {
      amount: draft.amount / 100,
      categoryId: null,
      date: draft.expenseDate,
      title: draft.title,
      draft,
      logId: result.logId,
    }
  } catch (error) {
    aiLog('error', {
      feature: 'ocr',
      stage: 'action_failed',
      logId,
      groupId,
      error,
    })
    throw error
  }
}

export type { ExpenseDraftPayload }
