import { auth } from '@clerk/nextjs/server'
import { parseVoiceTranscriptToDraft } from '@/lib/receipt-extract'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const groupId = formData.get('groupId')
  const payerParticipantId = formData.get('payerParticipantId')
  const audio = formData.get('audio')

  if (typeof groupId !== 'string' || !(audio instanceof File)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const buffer = Buffer.from(await audio.arrayBuffer())
  const { transcribeAudio } = await import('@/lib/deepgram')
  const transcript = await transcribeAudio({
    audio: buffer,
    mimeType: audio.type || 'audio/webm',
  })

  const draft = await parseVoiceTranscriptToDraft(
    groupId,
    transcript,
    typeof payerParticipantId === 'string' ? payerParticipantId : undefined,
  )

  if (!draft) {
    return NextResponse.json(
      { error: 'Could not parse expense from voice', transcript },
      { status: 422 },
    )
  }

  return NextResponse.json({ transcript, draft })
}
