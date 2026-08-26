'use server'

import { aiLog, createAiLogId, withAiTiming } from '@/lib/ai-log'
import { getFundLedgerContext } from '@/lib/fund'
import { nemotronChat, parseModelJson } from '@/lib/nemotron'
import { z } from 'zod'

const ledgerAnswerSchema = z.object({
  answer: z.string(),
  proposedAction: z
    .object({
      type: z.enum([
        'create_reserve',
        'release_reserve',
        'update_budget',
        'none',
      ]),
      purpose: z.string().optional(),
      amount: z.number().optional(),
      reserveId: z.string().optional(),
      targetAmount: z.number().optional(),
    })
    .optional(),
})

export type LedgerAiResult = z.infer<typeof ledgerAnswerSchema>

function formatSnapshotForAi(
  context: NonNullable<Awaited<ReturnType<typeof getFundLedgerContext>>>,
) {
  const { snapshot, fund } = context
  return {
    targetAmountMinor: fund.targetAmount,
    totalSpentMinor: snapshot.totalSpent,
    remainingMinor: snapshot.remaining,
    totalReservedMinor: snapshot.totalReserved,
    freelySpendableMinor: snapshot.freelySpendable,
    consumedFromReservesMinor: snapshot.consumedFromReserves,
    overBudgetMinor: snapshot.overBudget,
    percentConsumed: snapshot.percentConsumed,
    withinBudget: snapshot.withinBudget,
    budgets: snapshot.budgets.map((b) => ({
      id: b.id,
      name: b.name,
      allocatedMinor: b.allocatedAmount,
      spentMinor: b.spent,
      remainingMinor: b.remaining,
    })),
    reserves: fund.reserves
      .filter((r) => !r.releasedAt)
      .map((r) => {
        const status = snapshot.reserves.find((s) => s.id === r.id)
        return {
          id: r.id,
          purpose: r.purpose,
          amountMinor: r.amount,
          consumedMinor: status?.consumed ?? 0,
          remainingMinor: status?.remaining ?? r.amount,
        }
      }),
  }
}

export async function askLedgerQuestion(
  groupId: string,
  question: string,
): Promise<LedgerAiResult> {
  const logId = createAiLogId()
  aiLog('info', {
    feature: 'ledger',
    stage: 'request',
    logId,
    groupId,
    meta: { questionChars: question.length },
  })

  const context = await getFundLedgerContext(groupId)
  if (!context) {
    aiLog('info', {
      feature: 'ledger',
      stage: 'no_context',
      logId,
      groupId,
    })
    return {
      answer:
        'No trip budget has been set up for this group yet. Create a budget on the Trip Fund tab first.',
      proposedAction: { type: 'none' },
    }
  }

  const ledgerJson = JSON.stringify(formatSnapshotForAi(context), null, 2)

  const content = await withAiTiming(
    'ledger',
    'nemotron_answer',
    () =>
      nemotronChat({
        messages: [
          {
            role: 'system',
            content: `You are a trip finance assistant. Answer ONLY using the ledger data provided. Never invent numbers.
All amounts in the JSON are in minor units (cents). Convert to human-readable in your answer when helpful.

If the user asks to reserve, release, or change budget, propose an action in proposedAction but NEVER claim it is done — the user must confirm.

Respond with ONLY JSON:
{
  "answer": "your helpful answer",
  "proposedAction": {
    "type": "create_reserve" | "release_reserve" | "update_budget" | "none",
    "purpose": "optional string",
    "amount": optional number in minor units,
    "reserveId": "optional id from reserves list",
    "targetAmount": optional number in minor units for budget update
  }
}

Ledger data:
${ledgerJson}`,
          },
          { role: 'user', content: question },
        ],
        maxTokens: 1024,
        temperature: 0.2,
        reasoningBudget: 0,
        logFeature: 'ledger',
        logStage: 'nemotron_answer',
        logId,
        groupId,
      }),
    { groupId, logId },
  )

  const parsed = parseModelJson(content, ledgerAnswerSchema, {
    feature: 'ledger',
    stage: 'ledger_schema',
    logId,
    groupId,
  })
  if (!parsed) {
    aiLog('warn', {
      feature: 'ledger',
      stage: 'invalid_model_json',
      logId,
      groupId,
    })
    return {
      answer:
        'I could not process that question. Try asking about freely spendable amount, remaining budget, or reserves.',
      proposedAction: { type: 'none' },
    }
  }

  aiLog('info', {
    feature: 'ledger',
    stage: 'success',
    logId,
    groupId,
    meta: {
      proposedAction: parsed.proposedAction?.type ?? 'none',
    },
  })

  return parsed
}

export async function executeLedgerAction(
  groupId: string,
  action: NonNullable<LedgerAiResult['proposedAction']>,
): Promise<{ ok: boolean; message: string }> {
  const { createReserve, releaseReserve, createOrUpdateFund } =
    await import('@/lib/fund')

  switch (action.type) {
    case 'create_reserve': {
      if (!action.purpose || !action.amount) {
        return { ok: false, message: 'Invalid reserve action.' }
      }
      await createReserve(groupId, {
        purpose: action.purpose,
        amount: action.amount,
      })
      return { ok: true, message: `Reserved for ${action.purpose}.` }
    }
    case 'release_reserve': {
      if (!action.reserveId) {
        return { ok: false, message: 'Invalid release action.' }
      }
      await releaseReserve(groupId, action.reserveId)
      return { ok: true, message: 'Reserve released.' }
    }
    case 'update_budget': {
      if (!action.targetAmount) {
        return { ok: false, message: 'Invalid budget update.' }
      }
      await createOrUpdateFund(groupId, action.targetAmount)
      return { ok: true, message: 'Trip budget updated.' }
    }
    default:
      return { ok: false, message: 'No action to execute.' }
  }
}
