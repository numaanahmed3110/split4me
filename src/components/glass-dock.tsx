'use client'

import {
  Home,
  Plus,
  Receipt,
  Scale,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

type DockNavItem = {
  href: string
  label: string
  icon: LucideIcon
  active: boolean
}

export function GlassDock({ groupId }: { groupId: string | null }) {
  const pathname = usePathname()
  const t = useTranslations('AppShell')
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    let last = window.scrollY
    let idle: number | undefined
    const onScroll = () => {
      const y = window.scrollY
      if (y > last && y > 24) setCompact(true)
      else setCompact(false)
      last = y
      window.clearTimeout(idle)
      idle = window.setTimeout(() => setCompact(false), 700)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.clearTimeout(idle)
    }
  }, [])

  const fabHref = groupId
    ? `/groups/${groupId}/expenses/create`
    : '/groups/create'
  const fabLabel = groupId ? t('addExpense') : t('newGroup')

  const left: DockNavItem[] = [
    {
      href: '/groups',
      label: t('home'),
      icon: Home,
      active: pathname === '/groups' || pathname === '/groups/',
    },
    {
      href: groupId ? `/groups/${groupId}/expenses` : '/groups',
      label: t('expenses'),
      icon: Receipt,
      active:
        !!groupId &&
        pathname.includes('/expenses') &&
        !pathname.includes('/create'),
    },
  ]

  const right: DockNavItem[] = [
    {
      href: groupId ? `/groups/${groupId}/balances` : '/groups',
      label: t('settle'),
      icon: Scale,
      active: pathname.includes('/balances'),
    },
    {
      href: '/settings',
      label: t('you'),
      icon: UserRound,
      active: pathname.startsWith('/settings'),
    },
  ]

  return (
    <nav
      aria-label={t('primaryNav')}
      className={`glass-dock-wrap md:hidden ${compact ? 'is-compact' : ''}`}
    >
      <div className="glass-dock">
        <div className="glass-dock__side">
          {left.map((item) => (
            <DockLink key={item.href} {...item} />
          ))}
        </div>

        <Link
          href={fabHref}
          aria-label={fabLabel}
          title={fabLabel}
          className="glass-dock__fab"
        >
          <Plus className="size-6" strokeWidth={2.25} aria-hidden />
          <span className="glass-dock__fab-label">{t('add')}</span>
        </Link>

        <div className="glass-dock__side">
          {right.map((item) => (
            <DockLink key={item.href} {...item} />
          ))}
        </div>
      </div>
    </nav>
  )
}

function DockLink({ href, label, icon: Icon, active }: DockNavItem) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      title={label}
      className={`glass-dock__item ${active ? 'is-active' : ''}`}
    >
      <span className="glass-dock__blob" aria-hidden />
      <Icon className="glass-dock__icon" strokeWidth={active ? 2.25 : 2} />
      <span className="glass-dock__label">{label}</span>
    </Link>
  )
}
