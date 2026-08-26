import 'server-only'

import { aiLog } from '@/lib/ai-log'
import { env } from '@/lib/env'

const DEEPGRAM_URL = 'https://api.deepgram.com/v1/listen'

type TranscribeOptions = {
  /** Raw audio bytes (webm, wav, mp3, etc.) */
  audio: Buffer | ArrayBuffer
  mimeType?: string
  logId?: string
  groupId?: string
}

/**
 * Transcribe pre-recorded audio via Deepgram REST API.
 * API key stays server-side only.
 */
export async function transcribeAudio(
  options: TranscribeOptions,
): Promise<string> {
  const logId = options.logId
  const groupId = options.groupId

  if (!env.DEEPGRAM_API_KEY) {
    const error = new Error('DEEPGRAM_API_KEY is not configured.')
    aiLog('error', {
      feature: 'voice-transcribe',
      stage: 'missing_key',
      logId,
      groupId,
      error,
    })
    throw error
  }

  const buffer =
    options.audio instanceof Buffer
      ? options.audio
      : Buffer.from(new Uint8Array(options.audio))

  const params = new URLSearchParams({
    model: 'nova-3',
    language: 'en',
    smart_format: 'true',
    punctuate: 'true',
  })

  const started = Date.now()
  aiLog('info', {
    feature: 'voice-transcribe',
    stage: 'request',
    logId,
    groupId,
    meta: {
      mimeType: options.mimeType ?? 'audio/webm',
      audioBytes: buffer.byteLength,
    },
  })

  let response: Response
  try {
    response = await fetch(`${DEEPGRAM_URL}?${params}`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${env.DEEPGRAM_API_KEY}`,
        'Content-Type': options.mimeType ?? 'audio/webm',
      },
      body: new Uint8Array(buffer),
    })
  } catch (error) {
    aiLog('error', {
      feature: 'voice-transcribe',
      stage: 'network',
      logId,
      groupId,
      durationMs: Date.now() - started,
      error,
    })
    throw error
  }

  if (!response.ok) {
    const body = await response.text()
    const error = new Error(`Deepgram API error ${response.status}: ${body}`)
    aiLog('error', {
      feature: 'voice-transcribe',
      stage: `http_${response.status}`,
      logId,
      groupId,
      durationMs: Date.now() - started,
      error,
      meta: { responseBodyPreview: body.slice(0, 500) },
    })
    throw error
  }

  const data = (await response.json()) as {
    results?: { channels?: { alternatives?: { transcript?: string }[] }[] }
  }
  const transcript =
    data.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim() ?? ''
  if (!transcript) {
    const error = new Error('Deepgram returned empty transcript.')
    aiLog('error', {
      feature: 'voice-transcribe',
      stage: 'empty_transcript',
      logId,
      groupId,
      durationMs: Date.now() - started,
      error,
    })
    throw error
  }

  aiLog('info', {
    feature: 'voice-transcribe',
    stage: 'ok',
    logId,
    groupId,
    durationMs: Date.now() - started,
    meta: { transcriptChars: transcript.length },
  })

  return transcript
}
