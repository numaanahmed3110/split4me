'use client'

import { UserButton } from '@clerk/nextjs'
import { Activity, Home, Plus, Scale } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

export function MobileTabBar({ groupId }: { groupId: string | null }) {
  const pathname = usePathname()
  const t = useTranslations('AppShell')

  const fabHref = groupId
    ? `/groups/${groupId}/expenses/create`
    : '/groups/create'

  const item = (
    href: string,
    label: string,
    icon: ReactNode,
    active: boolean,
  ) => (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-1 min-w-[56px] text-[11px] font-medium ${
        active ? 'text-foreground' : 'text-muted-foreground'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  )

  return (
    <nav
      aria-label={t('primaryNav')}
      className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-5 items-end h-[72px] px-2">
        {item(
          '/groups',
          t('home'),
          <Home className="w-5 h-5" />,
          pathname === '/groups' || pathname === '/groups/',
        )}
        {item(
          groupId ? `/groups/${groupId}/balances` : '/groups',
          t('settle'),
          <Scale className="w-5 h-5" />,
          pathname.includes('/balances'),
        )}
        <div className="flex justify-center -mt-7">
          <Link
            href={fabHref}
            aria-label={groupId ? t('addExpense') : t('newGroup')}
            className="w-14 h-14 rounded-full bg-[#1D1C22] text-white shadow-lg flex items-center justify-center"
          >
            <Plus className="w-6 h-6" />
          </Link>
        </div>
        {item(
          groupId ? `/groups/${groupId}/activity` : '/groups',
          t('activity'),
          <Activity className="w-5 h-5" />,
          pathname.includes('/activity'),
        )}
        <div className="flex flex-col items-center justify-center gap-1 min-w-[56px] text-[11px] font-medium text-muted-foreground pb-1">
          <UserButton />
          <span>{t('you')}</span>
        </div>
      </div>
    </nav>
  )
}
