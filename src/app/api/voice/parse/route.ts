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
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = parseBodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { groupId, transcript, payerParticipantId } = parsed.data

  try {
    const draft = await parseVoiceTranscriptToDraft(
      groupId,
      transcript,
      payerParticipantId,
    )

    if (!draft) {
      return NextResponse.json(
        {
          error: 'Could not parse expense from voice',
          transcript,
        },
        { status: 422 },
      )
    }

    return NextResponse.json({ transcript, draft })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Could not parse expense',
        transcript,
      },
      { status: 500 },
    )
  }
}
