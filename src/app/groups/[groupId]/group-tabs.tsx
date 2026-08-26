'use client'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Activity,
  BarChart3,
  Info,
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

const PRIMARY = new Set(['expenses', 'balances', 'stats'])

export function GroupTabs({ groupId }: Props) {
  const t = useTranslations()
  const pathname = usePathname()
  const value =
    pathname.replace(/\/groups\/[^\/]+\/([^/]+).*/, '$1') || 'expenses'
  const router = useRouter()

  const tabs: { value: string; label: string; Icon: ComponentType<any> }[] = [
    { value: 'expenses', label: t('Expenses.title'), Icon: Receipt },
    { value: 'balances', label: t('Balances.title'), Icon: Scale },
    { value: 'stats', label: t('Stats.title'), Icon: BarChart3 },
    { value: 'fund', label: t('TripFund.title'), Icon: PiggyBank },
    { value: 'activity', label: t('Activity.title'), Icon: Activity },
    { value: 'information', label: t('Information.title'), Icon: Info },
    { value: 'edit', label: t('Settings.title'), Icon: Settings },
  ]

  return (
    <Tabs
      value={value}
      className="flex-1 min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      onValueChange={(next) => {
        router.push(`/groups/${groupId}/${next}`)
      }}
    >
      <TabsList className="h-auto bg-[#F5F5F5] p-1">
        {tabs.map(({ value: tab, label, Icon }) => {
          const primary = PRIMARY.has(tab)
          return (
            <TabsTrigger
              key={tab}
              value={tab}
              title={label}
              aria-label={label}
              className="gap-1.5 data-[state=active]:shadow-sm"
            >
              <Icon className="w-4 h-4" />
              <span className={primary ? '' : 'hidden lg:inline'}>{label}</span>
            </TabsTrigger>
          )
        })}
      </TabsList>
    </Tabs>
  )
}
