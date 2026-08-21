import 'server-only'

import { env } from '@/lib/env'
import { z } from 'zod'

const NEMOTRON_URL = 'https://integrate.api.nvidia.com/v1/chat/completions'

export type NemotronMessageContent =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } }

export type NemotronMessage = {
  role: 'user' | 'system' | 'assistant'
  content: string | NemotronMessageContent[]
}

type NemotronOptions = {
  messages: NemotronMessage[]
  maxTokens?: number
  temperature?: number
  reasoningBudget?: number
}

/**
 * Calls NVIDIA Nemotron (OpenAI-compatible chat completions API).
 * Structured output: prompt for JSON, then parse + Zod validate in callers.
 */
export async function nemotronChat(options: NemotronOptions): Promise<string> {
  if (!env.NVIDIA_API_KEY) {
    throw new Error('NVIDIA_API_KEY is not configured.')
  }

  const response = await fetch(NEMOTRON_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.NVIDIA_API_KEY}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.NVIDIA_MODEL,
      messages: options.messages,
      max_tokens: options.maxTokens ?? 4096,
      temperature: options.temperature ?? 0.6,
      top_p: 0.95,
      stream: false,
      reasoning_budget: options.reasoningBudget ?? 8192,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Nemotron API error ${response.status}: ${body}`)
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string | null } }[]
  }
  const content = data.choices?.[0]?.message?.content
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('Nemotron returned empty content.')
  }
  return content
}

/** Extract JSON object from model output (handles markdown fences). */
export function parseJsonFromModelOutput(text: string): unknown {
  const trimmed = text.trim()
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  const candidate = fenceMatch ? fenceMatch[1].trim() : trimmed
  return JSON.parse(candidate)
}

export function parseModelJson<T>(
  text: string,
  schema: z.ZodType<T>,
): T | null {
  try {
    return schema.parse(parseJsonFromModelOutput(text))
  } catch {
    return null
  }
}
