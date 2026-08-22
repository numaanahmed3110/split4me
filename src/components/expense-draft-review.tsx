'use client'

import type { ExpenseDraftPayload } from '@/lib/draft-schemas'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  formatCurrency,
  formatDate,
  getCurrencyFromGroup,
} from '@/lib/utils'
import { trpc } from '@/trpc/client'
import { AppRouterOutput } from '@/trpc/routers/_app'
import { Check, Loader2, Pencil, Sparkles, X } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'

type Group = NonNullable<AppRouterOutput['groups']['get']['group']>

function participantName(group: Group, id: string) {
  return group.participants.find((p) => p.id === id)?.name ?? id
}

export function ExpenseDraftReview({
  groupId,
  group,
  draftId,
  initialPayload,
  previewImageUrl,
  source,
  onCancel,
}: {
  groupId: string
  group: Group
  draftId: string
  initialPayload: ExpenseDraftPayload
  previewImageUrl?: string
  source: 'receipt' | 'voice'
  onCancel?: () => void
}) {
  const locale = useLocale()
  const router = useRouter()
  const { toast } = useToast()
  const [payload, setPayload] = useState(initialPayload)
  const [editing, setEditing] = useState(false)

  const preview = trpc.drafts.preview.useQuery({ payload })
  const confirmMutation = trpc.drafts.confirm.useMutation({
    onSuccess: () => {
      toast({ title: 'Expense added', description: 'Your expense was saved.' })
      // `/groups/<id>/expenses/<expenseId>` is not a route -- only
      // `.../<expenseId>/edit` exists -- so confirming a receipt or voice draft
      // used to create the expense and then drop the user on a 404. Go where the
      // normal create and edit forms go: the group's expense list.
      router.push(`/groups/${groupId}`)
      router.refresh()
    },
    onError: (err) => {
      toast({
        title: 'Could not save expense',
        description: err.message,
        variant: 'destructive',
      })
    },
  })

  const currency = getCurrencyFromGroup(group)
  const displayAmount = payload.amount / 100

  const lineItems = payload.lineItems ?? []

  const shareRows = useMemo(() => {
    if (!preview.data?.shares) return []
    return Object.entries(preview.data.shares).map(([participantId, amount]) => ({
      participantId,
      name: participantName(group, participantId),
      amount,
    }))
  }, [preview.data?.shares, group])

  useEffect(() => {
    setPayload(initialPayload)
  }, [initialPayload])

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="font-semibold text-lg">Review expense</h3>
            <Badge variant="secondary" className="capitalize">
              {source}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Check the details below, then confirm to add this to the group.
          </p>
        </div>
        {onCancel && (
          <Button variant="ghost" size="icon" onClick={onCancel} title="Close">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        {previewImageUrl && (
          <div className="rounded-lg border bg-muted/30 p-2 flex items-center justify-center min-h-[140px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImageUrl}
              alt="Receipt preview"
              className="max-h-48 w-full object-contain"
            />
          </div>
        )}

        <div className="space-y-3 rounded-lg border p-4 bg-card">
          {editing ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="draft-title">Title</Label>
                <Input
                  id="draft-title"
                  value={payload.title}
                  onChange={(e) =>
                    setPayload((p) => ({ ...p, title: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="draft-amount">Amount</Label>
                  <Input
                    id="draft-amount"
                    type="number"
                    step="0.01"
                    value={displayAmount}
                    onChange={(e) =>
                      setPayload((p) => ({
                        ...p,
                        amount: Math.round(Number(e.target.value) * 100),
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="draft-date">Date</Label>
                  <Input
                    id="draft-date"
                    type="date"
                    value={payload.expenseDate}
                    onChange={(e) =>
                      setPayload((p) => ({
                        ...p,
                        expenseDate: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="draft-notes">Notes</Label>
                <Textarea
                  id="draft-notes"
                  value={payload.notes ?? ''}
                  onChange={(e) =>
                    setPayload((p) => ({ ...p, notes: e.target.value }))
                  }
                  rows={2}
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setEditing(false)}
              >
                Done editing
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Title
                  </p>
                  <p className="font-medium text-base">{payload.title}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(true)}
                >
                  <Pencil className="w-3.5 h-3.5 mr-1" />
                  Edit
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Amount
                  </p>
                  <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(currency, displayAmount, locale, true)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Date
                  </p>
                  <p>
                    {formatDate(
                      new Date(`${payload.expenseDate}T12:00:00.000Z`),
                      locale,
                      { dateStyle: 'medium' },
                    )}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Paid by
                  </p>
                  <p>{participantName(group, payload.paidByParticipantId)}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {lineItems.length > 0 && (
        <div className="rounded-lg border overflow-hidden">
          <div className="px-4 py-2 bg-muted/50 border-b text-sm font-medium">
            Line items
          </div>
          <ul className="divide-y">
            {lineItems.map((item, index) => (
              <li
                key={`${item.description}-${index}`}
                className="px-4 py-3 flex items-start justify-between gap-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{item.description}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {item.participantIds
                      .map((id) => participantName(group, id))
                      .join(', ')}
                  </p>
                </div>
                <span className="shrink-0 font-medium">
                  {formatCurrency(currency, item.amount / 100, locale, true)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {shareRows.length > 0 && (
        <div className="rounded-lg border overflow-hidden">
          <div className="px-4 py-2 bg-muted/50 border-b text-sm font-medium">
            Split preview
          </div>
          <ul className="divide-y">
            {shareRows.map((row) => (
              <li
                key={row.participantId}
                className="px-4 py-2.5 flex justify-between text-sm"
              >
                <span>{row.name}</span>
                <span className="font-medium">
                  {formatCurrency(currency, row.amount / 100, locale, true)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            router.push(
              `/groups/${groupId}/expenses/create?title=${encodeURIComponent(payload.title)}&amount=${displayAmount}&date=${payload.expenseDate}`,
            )
          }
        >
          Edit in full form
        </Button>
        <Button
          type="button"
          disabled={confirmMutation.isPending}
          onClick={() =>
            confirmMutation.mutate({ draftId, groupId, payload })
          }
          className="bg-emerald-700 hover:bg-emerald-600"
        >
          {confirmMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Check className="w-4 h-4 mr-2" />
          )}
          Confirm & add expense
        </Button>
      </div>
    </div>
  )
}
