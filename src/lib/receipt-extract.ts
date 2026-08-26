import 'server-only'

import { SplitMode } from '@/generated/prisma/client'
import { aiLog, createAiLogId, logAiConfig, withAiTiming } from '@/lib/ai-log'
import { getCategories, getGroup } from '@/lib/api'
import {
  expenseDraftPayloadSchema,
  receiptExtractSchema,
  type ExpenseDraftPayload,
} from '@/lib/draft-schemas'
import { env } from '@/lib/env'
import { getRuntimeFeatureFlags } from '@/lib/featureFlags'
import { nemotronChat, parseModelJson } from '@/lib/nemotron'
import { isAllowedUploadUrl } from '@/lib/uploaded-image-url'
import { formatCategoryForAIPrompt } from '@/lib/utils'
import { z } from 'zod'

function toMinorUnits(amount: number): number {
  return Math.round(amount * 100)
}

function buildDraftFromExtract(
  group: NonNullable<Awaited<ReturnType<typeof getGroup>>>,
  parsed: z.infer<typeof receiptExtractSchema>,
  payerParticipantId?: string,
  notes?: string,
): ExpenseDraftPayload | null {
  const paidBy =
    parsed.paidByParticipantId &&
    group.participants.some((p) => p.id === parsed.paidByParticipantId)
      ? parsed.paidByParticipantId
      : (payerParticipantId ?? group.participants[0]?.id)

  if (!paidBy) return null

  const lineItems = parsed.lineItems.map((item) => ({
    description: item.description,
    amount: toMinorUnits(item.amount),
    participantIds:
      item.participantIds && item.participantIds.length > 0
        ? item.participantIds.filter((id) =>
            group.participants.some((p) => p.id === id),
          )
        : [paidBy],
  }))

  const paidForMap = new Map<string, number>()
  for (const item of lineItems) {
    if (item.participantIds.length === 0) continue
    const share = Math.round(item.amount / item.participantIds.length)
    for (const pid of item.participantIds) {
      paidForMap.set(pid, (paidForMap.get(pid) ?? 0) + share)
    }
  }

  const paidFor = Array.from(paidForMap.entries()).map(
    ([participantId, amount]) => ({
      participantId,
      shares: amount,
    }),
  )

  return expenseDraftPayloadSchema.parse({
    title: parsed.title,
    amount: toMinorUnits(parsed.total),
    expenseDate: parsed.date,
    paidByParticipantId: paidBy,
    paidFor:
      paidFor.length > 0
        ? paidFor
        : group.participants.map((p) => ({
            participantId: p.id,
            shares: 1,
          })),
    splitMode: paidFor.length > 0 ? SplitMode.BY_AMOUNT : SplitMode.EVENLY,
    lineItems,
    notes,
  })
}

export type ReceiptExtractResult = {
  logId: string
  draft: ExpenseDraftPayload | null
  raw?: unknown
}

export async function extractReceiptDraft(
  groupId: string,
  imageSource: string,
  payerParticipantId?: string,
  logId = createAiLogId(),
): Promise<ReceiptExtractResult> {
  const { enableReceiptExtract } = await getRuntimeFeatureFlags()
  logAiConfig(
    'ocr',
    {
      enableReceiptExtract,
      hasNvidiaKey: !!env.NVIDIA_API_KEY,
      model: env.NVIDIA_MODEL,
    },
    { groupId, logId },
  )

  if (!enableReceiptExtract || !env.NVIDIA_API_KEY) {
    const error = new Error('Receipt extraction is not enabled.')
    aiLog('error', {
      feature: 'ocr',
      stage: 'disabled',
      logId,
      groupId,
      error,
      meta: { enableReceiptExtract, hasNvidiaKey: !!env.NVIDIA_API_KEY },
    })
    throw error
  }

  const imageUrl = imageSource.startsWith('data:image/') ? imageSource : null

  if (!imageUrl) {
    if (!isAllowedUploadUrl(imageSource)) {
      const error = new Error('Invalid image URL.')
      aiLog('error', {
        feature: 'ocr',
        stage: 'invalid_image_url',
        logId,
        groupId,
        error,
      })
      throw error
    }
  }

  const nemotronImageUrl = imageUrl ?? imageSource

  const group = await getGroup(groupId)
  if (!group) {
    const error = new Error('Invalid group ID')
    aiLog('error', {
      feature: 'ocr',
      stage: 'group_not_found',
      logId,
      groupId,
      error,
    })
    throw error
  }

  const participants = group.participants
    .map((p) => `${p.id}:${p.name}`)
    .join(', ')

  const prompt = `You are parsing a receipt image for a group expense app.
Participants (id:name): ${participants}
Return ONLY JSON:
{
  "title": "merchant or short title",
  "date": "yyyy-mm-dd",
  "total": number,
  "tax": number optional,
  "tip": number optional,
  "lineItems": [{ "description": string, "amount": number, "participantIds": [string] optional }],
  "paidByParticipantId": string optional
}
Use plain currency numbers (1850 for ₹1,850).`

  const content = await withAiTiming(
    'ocr',
    'nemotron_vision',
    () =>
      nemotronChat({
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: { url: nemotronImageUrl },
              },
            ],
          },
        ],
        maxTokens: 8192,
        temperature: 0.2,
        reasoningBudget: 0,
        enableThinking: false,
        logFeature: 'ocr',
        logStage: 'nemotron_vision',
        logId,
        groupId,
      }),
    { groupId, logId },
  )

  const parsed = parseModelJson(content, receiptExtractSchema, {
    feature: 'ocr',
    stage: 'receipt_schema',
    logId,
    groupId,
  })
  if (!parsed) {
    aiLog('warn', {
      feature: 'ocr',
      stage: 'invalid_model_json',
      logId,
      groupId,
    })
    return { draft: null, logId }
  }

  const draft = buildDraftFromExtract(group, parsed, payerParticipantId)
  if (!draft) {
    aiLog('warn', {
      feature: 'ocr',
      stage: 'draft_build_failed',
      logId,
      groupId,
      meta: {
        participantCount: group.participants.length,
        lineItemCount: parsed.lineItems.length,
      },
    })
    return { draft: null, logId }
  }

  aiLog('info', {
    feature: 'ocr',
    stage: 'draft_ready',
    logId,
    groupId,
    meta: {
      title: draft.title,
      amountMinor: draft.amount,
      lineItems: draft.lineItems?.length ?? 0,
    },
  })

  return { draft, raw: parsed, logId }
}

/** Extract receipt from a base64 data URL (no S3 storage). */
export async function extractReceiptDraftFromBase64(
  groupId: string,
  imageDataUrl: string,
  payerParticipantId?: string,
  logId = createAiLogId(),
): Promise<ReceiptExtractResult> {
  if (!imageDataUrl.startsWith('data:image/')) {
    const error = new Error('Invalid image data.')
    aiLog('error', {
      feature: 'ocr',
      stage: 'invalid_data_url',
      logId,
      groupId,
      error,
    })
    throw error
  }
  const base64Part = imageDataUrl.split(',')[1]
  if (!base64Part) {
    const error = new Error('Invalid image data.')
    aiLog('error', {
      feature: 'ocr',
      stage: 'missing_base64',
      logId,
      groupId,
      error,
    })
    throw error
  }
  const byteLength = Math.ceil((base64Part.length * 3) / 4)
  const maxBytes = 5 * 1024 * 1024
  if (byteLength > maxBytes) {
    const error = new Error('Image is too large.')
    aiLog('error', {
      feature: 'ocr',
      stage: 'image_too_large',
      logId,
      groupId,
      error,
      meta: { byteLength, maxBytes },
    })
    throw error
  }

  aiLog('info', {
    feature: 'ocr',
    stage: 'image_accepted',
    logId,
    groupId,
    meta: { byteLength },
  })

  return extractReceiptDraft(groupId, imageDataUrl, payerParticipantId, logId)
}

const voiceExtractSchema = receiptExtractSchema.extend({
  notes: z.string().optional(),
})

export async function parseVoiceTranscriptToDraft(
  groupId: string,
  transcript: string,
  payerParticipantId?: string,
  logId = createAiLogId(),
): Promise<ExpenseDraftPayload | null> {
  logAiConfig(
    'voice-parse',
    {
      hasNvidiaKey: !!env.NVIDIA_API_KEY,
      model: env.NVIDIA_MODEL,
    },
    { groupId, logId },
  )

  if (!env.NVIDIA_API_KEY) {
    const error = new Error('NVIDIA_API_KEY is not configured.')
    aiLog('error', {
      feature: 'voice-parse',
      stage: 'missing_key',
      logId,
      groupId,
      error,
    })
    throw error
  }

  const group = await getGroup(groupId)
  if (!group) {
    const error = new Error('Invalid group ID')
    aiLog('error', {
      feature: 'voice-parse',
      stage: 'group_not_found',
      logId,
      groupId,
      error,
    })
    throw error
  }

  const categories = await getCategories()
  const participants = group.participants
    .map((p) => `${p.id}:${p.name}`)
    .join(', ')

  const prompt = `Parse this spoken expense into JSON.
Transcript: """${transcript}"""
Participants (id:name): ${participants}
Categories (reference): ${categories.map((c) => formatCategoryForAIPrompt(c)).join(', ')}

Return ONLY JSON matching:
{
  "title": string,
  "date": "yyyy-mm-dd",
  "total": number,
  "lineItems": [{ "description": string, "amount": number, "participantIds": [string] }],
  "paidByParticipantId": string optional,
  "notes": string optional
}
Use plain numbers (250 for ₹250). Assign each line item to participant ids who consumed it.`

  const content = await withAiTiming(
    'voice-parse',
    'nemotron_parse',
    () =>
      nemotronChat({
        messages: [{ role: 'user', content: prompt }],
        maxTokens: 8192,
        temperature: 0.2,
        reasoningBudget: 0,
        enableThinking: false,
        logFeature: 'voice-parse',
        logStage: 'nemotron_parse',
        logId,
        groupId,
      }),
    { groupId, logId },
  )

  const parsed = parseModelJson(content, voiceExtractSchema, {
    feature: 'voice-parse',
    stage: 'voice_schema',
    logId,
    groupId,
  })
  if (!parsed) {
    aiLog('warn', {
      feature: 'voice-parse',
      stage: 'invalid_model_json',
      logId,
      groupId,
      meta: { transcriptChars: transcript.length },
    })
    return null
  }

  const draft = buildDraftFromExtract(
    group,
    parsed,
    payerParticipantId,
    parsed.notes,
  )
  if (!draft) {
    aiLog('warn', {
      feature: 'voice-parse',
      stage: 'draft_build_failed',
      logId,
      groupId,
    })
    return null
  }

  aiLog('info', {
    feature: 'voice-parse',
    stage: 'draft_ready',
    logId,
    groupId,
    meta: { title: draft.title, amountMinor: draft.amount },
  })

  return draft
}
