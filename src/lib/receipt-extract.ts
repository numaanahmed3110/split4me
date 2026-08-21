import 'server-only'

import { SplitMode } from '@/generated/prisma/client'
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
      : payerParticipantId ?? group.participants[0]?.id

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

export async function extractReceiptDraft(
  groupId: string,
  imageUrl: string,
  payerParticipantId?: string,
): Promise<{ draft: ExpenseDraftPayload; raw: unknown } | null> {
  const { enableReceiptExtract } = await getRuntimeFeatureFlags()
  if (!enableReceiptExtract || !env.NVIDIA_API_KEY) {
    throw new Error('Receipt extraction is not enabled.')
  }
  if (!isAllowedUploadUrl(imageUrl)) {
    throw new Error('Invalid image URL.')
  }

  const group = await getGroup(groupId)
  if (!group) throw new Error('Invalid group ID')

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

  const content = await nemotronChat({
    messages: [
      { role: 'user', content: [{ type: 'text', text: prompt }] },
      {
        role: 'user',
        content: [{ type: 'image_url', image_url: { url: imageUrl } }],
      },
    ],
    maxTokens: 8192,
  })

  const parsed = parseModelJson(content, receiptExtractSchema)
  if (!parsed) return null

  const draft = buildDraftFromExtract(group, parsed, payerParticipantId)
  if (!draft) return null

  return { draft, raw: parsed }
}

const voiceExtractSchema = receiptExtractSchema.extend({
  notes: z.string().optional(),
})

export async function parseVoiceTranscriptToDraft(
  groupId: string,
  transcript: string,
  payerParticipantId?: string,
): Promise<ExpenseDraftPayload | null> {
  if (!env.NVIDIA_API_KEY) {
    throw new Error('NVIDIA_API_KEY is not configured.')
  }

  const group = await getGroup(groupId)
  if (!group) throw new Error('Invalid group ID')

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

  const content = await nemotronChat({
    messages: [{ role: 'user', content: prompt }],
    maxTokens: 8192,
  })

  const parsed = parseModelJson(content, voiceExtractSchema)
  if (!parsed) return null

  return buildDraftFromExtract(
    group,
    parsed,
    payerParticipantId,
    parsed.notes,
  )
}
