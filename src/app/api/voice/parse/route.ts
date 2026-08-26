import { aiLog, createAiLogId } from '@/lib/ai-log'
import { parseVoiceTranscriptToDraft } from '@/lib/receipt-extract'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const parseBodySchema = z.object({
  groupId: z.string().min(1),
  transcript: z.string().min(1),
  payerParticipantId: z.string().optional(),
})

/** Parse an existing voice transcript into an expense draft (for retries). */
export async function POST(request: Request) {
  const logId = createAiLogId()
  const { userId } = await auth()
  if (!userId) {
    aiLog('warn', {
      feature: 'voice-parse',
      stage: 'unauthorized',
      logId,
    })
    return NextResponse.json({ error: 'Unauthorized', logId }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    aiLog('warn', {
      feature: 'voice-parse',
      stage: 'invalid_json',
      logId,
      userId,
    })
    return NextResponse.json(
      { error: 'Invalid JSON body', logId },
      { status: 400 },
    )
  }

  const parsed = parseBodySchema.safeParse(body)
  if (!parsed.success) {
    aiLog('warn', {
      feature: 'voice-parse',
      stage: 'invalid_request',
      logId,
      userId,
      meta: { issues: parsed.error.issues.map((issue) => issue.message) },
    })
    return NextResponse.json(
      { error: 'Invalid request', logId },
      { status: 400 },
    )
  }

  const { groupId, transcript, payerParticipantId } = parsed.data

  aiLog('info', {
    feature: 'voice-parse',
    stage: 'request',
    logId,
    groupId,
    userId,
    meta: { transcriptChars: transcript.length },
  })

  try {
    const draft = await parseVoiceTranscriptToDraft(
      groupId,
      transcript,
      payerParticipantId,
      logId,
    )

    if (!draft) {
      aiLog('warn', {
        feature: 'voice-parse',
        stage: 'route_no_draft',
        logId,
        groupId,
        userId,
        meta: { transcriptChars: transcript.length },
      })
      return NextResponse.json(
        {
          error: 'Could not parse expense from voice',
          transcript,
          logId,
        },
        { status: 422 },
      )
    }

    aiLog('info', {
      feature: 'voice-parse',
      stage: 'success',
      logId,
      groupId,
      userId,
      meta: { title: draft.title, amountMinor: draft.amount },
    })

    return NextResponse.json({ transcript, draft, logId })
  } catch (error) {
    aiLog('error', {
      feature: 'voice-parse',
      stage: 'route_failed',
      logId,
      groupId,
      userId,
      error,
      meta: { transcriptChars: transcript.length },
    })
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Could not parse expense',
        transcript,
        logId,
      },
      { status: 500 },
    )
  }
}
