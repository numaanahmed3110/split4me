import 'server-only'

import { aiLog, type AiFeature } from '@/lib/ai-log'
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
  /** Disable reasoning/thinking tokens for faster structured JSON extraction. */
  enableThinking?: boolean
  /** Used in structured logs only */
  logFeature?: AiFeature
  logStage?: string
  logId?: string
  groupId?: string
}

const RETRYABLE_STATUS = new Set([429, 502, 503, 504])

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

function messageSummary(messages: NemotronMessage[]) {
  return messages.map((m) => {
    if (typeof m.content === 'string') {
      return { role: m.role, textChars: m.content.length }
    }
    return {
      role: m.role,
      parts: m.content.map((part) =>
        part.type === 'text'
          ? { type: 'text', chars: part.text.length }
          : {
              type: 'image_url',
              urlKind: part.image_url.url.startsWith('data:')
                ? 'data_url'
                : 'remote_url',
            },
      ),
    }
  })
}

/**
 * Calls NVIDIA Nemotron (chat completions API).
 * Structured output: prompt for JSON, then parse + Zod validate in callers.
 */
export async function nemotronChat(options: NemotronOptions): Promise<string> {
  const feature = options.logFeature ?? 'ocr'
  const stage = options.logStage ?? 'nemotron_chat'
  const logId = options.logId

  if (!env.NVIDIA_API_KEY) {
    const error = new Error('NVIDIA_API_KEY is not configured.')
    aiLog('error', {
      feature,
      stage: `${stage}:missing_key`,
      logId,
      groupId: options.groupId,
      error,
    })
    throw error
  }

  const enableThinking = options.enableThinking ?? false
  const reasoningBudget = options.reasoningBudget ?? (enableThinking ? 8192 : 0)

  const started = Date.now()
  aiLog('info', {
    feature,
    stage: `${stage}:request`,
    logId,
    groupId: options.groupId,
    meta: {
      model: env.NVIDIA_MODEL,
      maxTokens: options.maxTokens ?? 4096,
      reasoningBudget,
      enableThinking,
      messages: messageSummary(options.messages),
    },
  })

  const requestBody = {
    model: env.NVIDIA_MODEL,
    messages: options.messages,
    max_tokens: options.maxTokens ?? 4096,
    temperature: options.temperature ?? 0.6,
    top_p: 0.95,
    stream: false,
    reasoning_budget: reasoningBudget,
    chat_template_kwargs: { enable_thinking: enableThinking },
  }

  let response: Response | undefined
  let lastBody = ''
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      const delayMs = 2000 * attempt
      aiLog('warn', {
        feature,
        stage: `${stage}:retry`,
        logId,
        groupId: options.groupId,
        attempt: attempt + 1,
        meta: { delayMs, previousStatus: response?.status },
      })
      await sleep(delayMs)
    }

    try {
      response = await fetch(NEMOTRON_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.NVIDIA_API_KEY}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
    } catch (error) {
      if (attempt === 2) {
        aiLog('error', {
          feature,
          stage: `${stage}:network`,
          logId,
          groupId: options.groupId,
          durationMs: Date.now() - started,
          error,
        })
        throw error
      }
      continue
    }

    if (
      response.ok ||
      !RETRYABLE_STATUS.has(response.status) ||
      attempt === 2
    ) {
      break
    }

    lastBody = await response.text()
    aiLog('warn', {
      feature,
      stage: `${stage}:http_${response.status}`,
      logId,
      groupId: options.groupId,
      attempt: attempt + 1,
      meta: { responseBodyPreview: lastBody.slice(0, 300) },
    })
  }

  if (!response) {
    throw new Error('Nemotron request failed before a response was received.')
  }

  if (!response.ok) {
    const body = lastBody || (await response.text())
    const error = new Error(`Nemotron API error ${response.status}: ${body}`)
    aiLog('error', {
      feature,
      stage: `${stage}:http_${response.status}`,
      logId,
      groupId: options.groupId,
      durationMs: Date.now() - started,
      error,
      meta: { responseBodyPreview: body.slice(0, 500) },
    })
    throw error
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string | null } }[]
  }
  const content = data.choices?.[0]?.message?.content
  if (typeof content !== 'string' || !content.trim()) {
    const error = new Error('Nemotron returned empty content.')
    aiLog('error', {
      feature,
      stage: `${stage}:empty_content`,
      logId,
      groupId: options.groupId,
      durationMs: Date.now() - started,
      error,
      meta: { choiceCount: data.choices?.length ?? 0 },
    })
    throw error
  }

  aiLog('info', {
    feature,
    stage: `${stage}:response`,
    logId,
    groupId: options.groupId,
    durationMs: Date.now() - started,
    meta: { contentChars: content.length },
  })

  return content
}

/** Extract JSON object from model output (handles markdown fences and thinking tags). */
export function parseJsonFromModelOutput(text: string): unknown {
  const trimmed = text.trim()
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  let candidate = fenceMatch ? fenceMatch[1].trim() : trimmed

  // Reasoning models may emit thinking tags or prose before the JSON payload.
  const jsonObjectMatch = candidate.match(/\{[\s\S]*\}/)
  if (jsonObjectMatch) {
    candidate = jsonObjectMatch[0]
  }

  return JSON.parse(candidate)
}

export function parseModelJson<T>(
  text: string,
  schema: z.ZodType<T>,
  log?: {
    feature: AiFeature
    stage: string
    logId?: string
    groupId?: string
  },
): T | null {
  try {
    const raw = parseJsonFromModelOutput(text)
    return schema.parse(raw)
  } catch (error) {
    aiLog('warn', {
      feature: log?.feature ?? 'ocr',
      stage: log?.stage ? `${log.stage}:parse_json` : 'parse_json',
      logId: log?.logId,
      groupId: log?.groupId,
      error,
      meta: {
        modelOutputPreview: text.slice(0, 800),
      },
    })
    return null
  }
}
