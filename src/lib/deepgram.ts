import 'server-only'

import { env } from '@/lib/env'

const DEEPGRAM_URL = 'https://api.deepgram.com/v1/listen'

type TranscribeOptions = {
  /** Raw audio bytes (webm, wav, mp3, etc.) */
  audio: Buffer | ArrayBuffer
  mimeType?: string
}

/**
 * Transcribe pre-recorded audio via Deepgram REST API.
 * API key stays server-side only.
 */
export async function transcribeAudio(
  options: TranscribeOptions,
): Promise<string> {
  if (!env.DEEPGRAM_API_KEY) {
    throw new Error('DEEPGRAM_API_KEY is not configured.')
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

  const response = await fetch(`${DEEPGRAM_URL}?${params}`, {
    method: 'POST',
    headers: {
      Authorization: `Token ${env.DEEPGRAM_API_KEY}`,
      'Content-Type': options.mimeType ?? 'audio/webm',
    },
    body: new Uint8Array(buffer),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Deepgram API error ${response.status}: ${body}`)
  }

  const data = (await response.json()) as {
    results?: { channels?: { alternatives?: { transcript?: string }[] }[] }
  }
  const transcript =
    data.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim() ?? ''
  if (!transcript) {
    throw new Error('Deepgram returned empty transcript.')
  }
  return transcript
}
