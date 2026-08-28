'use client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Activity,
  BarChart3,
  Info,
  MoreHorizontal,
  PiggyBank,
  Receipt,
  Scale,
  Settings,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { ComponentType } from 'react'

type Props = {
  groupId: string
}

const MORE = ['stats', 'fund', 'activity', 'information', 'edit'] as const

export function GroupTabs({ groupId }: Props) {
  const t = useTranslations()
  const pathname = usePathname()
  const value =
    pathname.replace(/\/groups\/[^\/]+\/([^/]+).*/, '$1') || 'expenses'
  const router = useRouter()
  const go = (next: string) => router.push(`/groups/${groupId}/${next}`)
  const moreActive = MORE.includes(value as (typeof MORE)[number])

  const primary: {
    value: string
    label: string
    Icon: ComponentType<{ className?: string }>
  }[] = [
    { value: 'expenses', label: t('Expenses.title'), Icon: Receipt },
    { value: 'balances', label: t('Balances.title'), Icon: Scale },
  ]

  const extra: {
    value: string
    label: string
    menuLabel: string
    hint: string
    Icon: ComponentType<{ className?: string }>
  }[] = [
    {
      value: 'stats',
      label: t('Stats.title'),
      menuLabel: t('AppShell.moreInsights'),
      hint: t('AppShell.moreInsightsHint'),
      Icon: BarChart3,
    },
    {
      value: 'fund',
      label: t('TripFund.title'),
      menuLabel: t('AppShell.moreTripMoney'),
      hint: t('AppShell.moreTripMoneyHint'),
      Icon: PiggyBank,
    },
    {
      value: 'activity',
      label: t('Activity.title'),
      menuLabel: t('AppShell.moreActivity'),
      hint: t('AppShell.moreActivityHint'),
      Icon: Activity,
    },
    {
      value: 'information',
      label: t('Information.title'),
      menuLabel: t('AppShell.moreMembers'),
      hint: t('AppShell.moreMembersHint'),
      Icon: Info,
    },
    {
      value: 'edit',
      label: t('Settings.title'),
      menuLabel: t('AppShell.moreGroupSettings'),
      hint: t('AppShell.moreGroupSettingsHint'),
      Icon: Settings,
    },
  ]

  return (
    <div className="flex items-center gap-2">
      <Tabs value={value} className="flex-1 min-w-0" onValueChange={go}>
        <TabsList className="h-auto bg-[#F5F5F5] p-1 w-full justify-start overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {primary.map(({ value: tab, label, Icon }) => (
            <TabsTrigger
              key={tab}
              value={tab}
              title={label}
              aria-label={label}
              className="gap-1.5 data-[state=active]:shadow-sm flex-1 md:flex-none"
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </TabsTrigger>
          ))}
          {extra.map(({ value: tab, label, Icon }) => (
            <TabsTrigger
              key={tab}
              value={tab}
              title={label}
              aria-label={label}
              className="gap-1.5 data-[state=active]:shadow-sm hidden md:inline-flex"
            >
              <Icon className="w-4 h-4" />
              <span className="hidden lg:inline">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="secondary"
            className={`md:hidden h-10 rounded-full px-3 gap-1.5 shrink-0 ${
              moreActive ? 'bg-[#1D1C22] text-white hover:bg-[#1D1C22]/90' : ''
            }`}
            aria-label={t('AppShell.more')}
          >
            <MoreHorizontal className="w-4 h-4" />
            <span className="text-sm">{t('AppShell.more')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72 rounded-2xl p-1.5">
          {extra.map(({ value: tab, menuLabel, hint, Icon }) => (
            <DropdownMenuItem
              key={tab}
              className="rounded-xl gap-2 items-start py-2.5"
              onClick={() => go(tab)}
            >
              <Icon className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="flex flex-col">
                <span className="font-medium">{menuLabel}</span>
                <span className="text-xs text-muted-foreground font-normal whitespace-normal">
                  {hint}
                </span>
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
