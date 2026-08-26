'use client'

import { ActiveUserModal } from '@/app/groups/[groupId]/expenses/active-user-modal'
import { CreateFromReceiptButton } from '@/app/groups/[groupId]/expenses/create-from-receipt-button'
import { ExpenseList } from '@/app/groups/[groupId]/expenses/expense-list'
import { VoiceExpenseButton } from '@/app/groups/[groupId]/expenses/voice-expense-button'
import { TripFundSummary } from '@/components/trip-fund-summary'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Popover6 } from '@/components/ui/popover-06'
import { TrackPage } from '@/lib/analytics/track-page'
import { useIsInstalledPwa } from '@/lib/hooks'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useCurrentGroup } from '../current-group-context'

export default function GroupExpensesPageClient({
  enableReceiptExtract,
  enableVoiceExpense,
}: {
  enableReceiptExtract: boolean
  enableVoiceExpense: boolean
}) {
  const t = useTranslations('Expenses')
  const { groupId } = useCurrentGroup()
  // Voice capture is offered only in the installed app, not in a browser tab.
  // Receipt scanning stays available everywhere.
  const isInstalledPwa = useIsInstalledPwa()

  return (
    <>
      <TrackPage path={`/groups/${groupId}/expenses`} />
      <div className="hidden md:block">
        <TripFundSummary />
      </div>
      <Card className="mb-4 rounded-none -mx-4 border-x-0 sm:border-0 sm:rounded-[28px] sm:mx-0 sm:shadow-[0_15px_35px_rgba(0,0,0,0.06)]">
        <div className="flex flex-1">
          <CardHeader className="flex-1 p-4 sm:p-6">
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </CardHeader>
          <CardHeader className="p-4 sm:p-6 flex flex-row space-y-0 gap-2">
            <Popover6
              csvHref={`/groups/${groupId}/expenses/export/csv`}
              jsonHref={`/groups/${groupId}/expenses/export/json`}
            />
            {enableReceiptExtract && <CreateFromReceiptButton />}
            {enableVoiceExpense && isInstalledPwa && <VoiceExpenseButton />}
            <Button asChild size="icon">
              <Link
                href={`/groups/${groupId}/expenses/create`}
                title={t('create')}
              >
                <Plus className="w-4 h-4" />
              </Link>
            </Button>
          </CardHeader>
        </div>

        <CardContent className="p-0 pt-2 pb-4 sm:pb-6 flex flex-col gap-4 relative">
          <ExpenseList />
        </CardContent>
      </Card>

      <ActiveUserModal groupId={groupId} />
    </>
  )
}
