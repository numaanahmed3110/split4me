import { aiLog, createAiLogId } from '@/lib/ai-log'
import { parseVoiceTranscriptToDraft } from '@/lib/receipt-extract'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const logId = createAiLogId()
  const { userId } = await auth()
  if (!userId) {
    aiLog('warn', {
      feature: 'voice-transcribe',
      stage: 'unauthorized',
      logId,
    })
    return NextResponse.json({ error: 'Unauthorized', logId }, { status: 401 })
  }

  const formData = await request.formData()
  const groupId = formData.get('groupId')
  const payerParticipantId = formData.get('payerParticipantId')
  const audio = formData.get('audio')

  if (typeof groupId !== 'string' || !(audio instanceof File)) {
    aiLog('warn', {
      feature: 'voice-transcribe',
      stage: 'invalid_request',
      logId,
      userId,
      meta: {
        hasGroupId: typeof groupId === 'string',
        hasAudio: audio instanceof File,
      },
    })
    return NextResponse.json(
      { error: 'Invalid request', logId },
      { status: 400 },
    )
  }

  aiLog('info', {
    feature: 'voice-transcribe',
    stage: 'request',
    logId,
    groupId,
    userId,
    meta: {
      mimeType: audio.type || 'audio/webm',
      audioBytes: audio.size,
      hasPayerParticipantId: typeof payerParticipantId === 'string',
    },
  })

  const buffer = Buffer.from(await audio.arrayBuffer())

  let transcript: string
  try {
    const { transcribeAudio } = await import('@/lib/deepgram')
    transcript = await transcribeAudio({
      audio: buffer,
      mimeType: audio.type || 'audio/webm',
      logId,
      groupId,
    })
  } catch (error) {
    aiLog('error', {
      feature: 'voice-transcribe',
      stage: 'transcribe_failed',
      logId,
      groupId,
      userId,
      error,
    })
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Could not transcribe audio',
        stage: 'transcribe',
        logId,
      },
      { status: 502 },
    )
  }

  try {
    const draft = await parseVoiceTranscriptToDraft(
      groupId,
      transcript,
      typeof payerParticipantId === 'string' ? payerParticipantId : undefined,
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
          stage: 'parse',
          logId,
        },
        { status: 422 },
      )
    }

    aiLog('info', {
      feature: 'voice-transcribe',
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
        stage: 'parse',
        logId,
      },
      { status: 500 },
    )
  }
}
