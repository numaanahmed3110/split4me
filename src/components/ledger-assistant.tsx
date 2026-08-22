'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  askLedgerQuestion,
  executeLedgerAction,
  type LedgerAiResult,
} from '@/lib/ledger-ai-actions'
import { trpc } from '@/trpc/client'
import { Bot, Send } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

export function LedgerAssistant({ groupId }: { groupId: string }) {
  const t = useTranslations('TripFund.ai')
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; text: string; action?: LedgerAiResult['proposedAction'] }[]
  >([])
  const utils = trpc.useUtils()

  const submit = async () => {
    if (!question.trim() || loading) return
    const q = question.trim()
    setQuestion('')
    setMessages((m) => [...m, { role: 'user', text: q }])
    setLoading(true)
    try {
      const result = await askLedgerQuestion(groupId, q)
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: result.answer, action: result.proposedAction },
      ])
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: t('error') },
      ])
    } finally {
      setLoading(false)
    }
  }

  const confirmAction = async (action: LedgerAiResult['proposedAction']) => {
    if (!action || action.type === 'none') return
    setLoading(true)
    try {
      const result = await executeLedgerAction(groupId, action)
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: result.message },
      ])
      if (result.ok) {
        utils.groups.fund.invalidate()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Bot className="w-4 h-4" />
          {t('title')}
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {messages.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto text-sm">
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.role === 'user' ? 'text-right' : 'text-left'}
              >
                <p
                  className={
                    m.role === 'user'
                      ? 'inline-block bg-primary text-primary-foreground rounded-lg px-3 py-1'
                      : 'bg-muted rounded-lg px-3 py-1 inline-block'
                  }
                >
                  {m.text}
                </p>
                {m.action && m.action.type !== 'none' && (
                  <div className="mt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={loading}
                      onClick={() => confirmAction(m.action)}
                    >
                      {t('confirm')}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            placeholder={t('placeholder')}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            disabled={loading}
          />
          <Button size="icon" onClick={submit} disabled={loading}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
