import 'server-only'

import { randomBytes } from 'crypto'

export type AiFeature =
  'ocr' | 'voice-transcribe' | 'voice-parse' | 'ledger' | 'category'

type LogLevel = 'info' | 'warn' | 'error'

export type AiLogContext = {
  feature: AiFeature
  stage: string
  logId?: string
  groupId?: string
  userId?: string
  durationMs?: number
  attempt?: number
  error?: unknown
  meta?: Record<string, unknown>
}

function newLogId() {
  return randomBytes(4).toString('hex')
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 6),
    }
  }
  return { message: String(error) }
}

function sanitizeMeta(meta: Record<string, unknown>) {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(meta)) {
    if (value === undefined) continue
    if (typeof value === 'string') {
      // Never log base64 image/audio blobs.
      if (value.startsWith('data:image/') || value.length > 2000) {
        out[key] = `[redacted string len=${value.length}]`
        continue
      }
      out[key] = value.length > 500 ? `${value.slice(0, 500)}…` : value
      continue
    }
    out[key] = value
  }
  return out
}

/** Structured JSON lines for Vercel / container logs (`[split4me-ai]` prefix). */
export function aiLog(level: LogLevel, ctx: AiLogContext) {
  const payload = {
    tag: 'split4me-ai',
    ts: new Date().toISOString(),
    level,
    feature: ctx.feature,
    stage: ctx.stage,
    ...(ctx.logId ? { logId: ctx.logId } : {}),
    ...(ctx.groupId ? { groupId: ctx.groupId } : {}),
    ...(ctx.userId ? { userId: ctx.userId } : {}),
    ...(ctx.durationMs !== undefined ? { durationMs: ctx.durationMs } : {}),
    ...(ctx.attempt !== undefined ? { attempt: ctx.attempt } : {}),
    ...(ctx.error ? { error: serializeError(ctx.error) } : {}),
    ...(ctx.meta ? { meta: sanitizeMeta(ctx.meta) } : {}),
  }

  const line = JSON.stringify(payload)
  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else console.log(line)
}

export function createAiLogId() {
  return newLogId()
}

export async function withAiTiming<T>(
  feature: AiFeature,
  stage: string,
  fn: () => Promise<T>,
  opts?: { groupId?: string; userId?: string; logId?: string },
): Promise<T> {
  const logId = opts?.logId ?? newLogId()
  const start = Date.now()
  aiLog('info', {
    feature,
    stage,
    logId,
    groupId: opts?.groupId,
    userId: opts?.userId,
    meta: { status: 'start' },
  })
  try {
    const result = await fn()
    aiLog('info', {
      feature,
      stage,
      logId,
      groupId: opts?.groupId,
      userId: opts?.userId,
      durationMs: Date.now() - start,
      meta: { status: 'ok' },
    })
    return result
  } catch (error) {
    aiLog('error', {
      feature,
      stage,
      logId,
      groupId: opts?.groupId,
      userId: opts?.userId,
      durationMs: Date.now() - start,
      error,
    })
    throw error
  }
}

export function logAiConfig(
  feature: AiFeature,
  config: Record<string, boolean | string | undefined>,
  opts?: { groupId?: string; logId?: string },
) {
  aiLog('info', {
    feature,
    stage: 'config',
    logId: opts?.logId,
    groupId: opts?.groupId,
    meta: config,
  })
}
