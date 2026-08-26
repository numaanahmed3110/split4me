'use client'

import {
  Activity,
  BarChart3,
  Home,
  Plus,
  Receipt,
  Scale,
  Settings,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function WebSidebar({ groupId }: { groupId: string | null }) {
  const pathname = usePathname()
  const t = useTranslations('AppShell')

  const link = (
    href: string,
    label: string,
    Icon: typeof Home,
    active: boolean,
  ) => (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-colors ${
        active
          ? 'bg-[#F6F2E9] text-foreground'
          : 'text-muted-foreground hover:bg-[#F6F2E9] hover:text-foreground'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  )

  return (
    <aside className="w-[248px] sticky top-0 h-[100dvh] border-r bg-white px-4 py-6 flex flex-col gap-1">
      <Link href="/groups" className="px-2 mb-6 text-lg font-extrabold tracking-tight">
        split4me
      </Link>
      <nav className="flex flex-col gap-1">
        {link('/groups', t('home'), Home, pathname === '/groups')}
        {groupId &&
          link(
            `/groups/${groupId}/expenses`,
            t('expenses'),
            Receipt,
            pathname.includes('/expenses') && !pathname.includes('/create'),
          )}
        {groupId &&
          link(
            `/groups/${groupId}/balances`,
            t('settle'),
            Scale,
            pathname.includes('/balances'),
          )}
        {groupId &&
          link(
            `/groups/${groupId}/stats`,
            t('stats'),
            BarChart3,
            pathname.includes('/stats'),
          )}
        {groupId &&
          link(
            `/groups/${groupId}/activity`,
            t('activity'),
            Activity,
            pathname.includes('/activity'),
          )}
        {groupId &&
          link(
            `/groups/${groupId}/edit`,
            t('settings'),
            Settings,
            pathname.includes('/edit'),
          )}
      </nav>
      <Link
        href={groupId ? `/groups/${groupId}/expenses/create` : '/groups/create'}
        className="mt-auto mb-2 flex items-center justify-center gap-2 rounded-full bg-[#1D1C22] text-white py-3 text-sm font-semibold"
      >
        <Plus className="w-4 h-4" />
        {groupId ? t('addExpense') : t('newGroup')}
      </Link>
    </aside>
  )
}
