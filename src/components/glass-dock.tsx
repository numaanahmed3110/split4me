'use client'

import { UserButton } from '@clerk/nextjs'
import { Activity, Home, Plus, Scale } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'

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

  const homeActive = pathname === '/groups' || pathname === '/groups/'
  const settleActive = pathname.includes('/balances')
  const activityActive = pathname.includes('/activity')

  return (
    <nav
      aria-label={t('primaryNav')}
      className={`glass-dock-wrap ${compact ? 'is-compact' : ''}`}
    >
      <div className="glass-dock">
        <DockLink
          href="/groups"
          label={t('home')}
          active={homeActive}
        >
          <Home className="size-[22px]" strokeWidth={1.75} />
        </DockLink>
        <DockLink
          href={groupId ? `/groups/${groupId}/balances` : '/groups'}
          label={t('settle')}
          active={settleActive}
        >
          <Scale className="size-[22px]" strokeWidth={1.75} />
        </DockLink>

        <Link
          href={fabHref}
          aria-label={groupId ? t('addExpense') : t('newGroup')}
          className="glass-dock__fab"
        >
          <Plus className="size-6" strokeWidth={2.25} />
        </Link>

        <DockLink
          href={groupId ? `/groups/${groupId}/activity` : '/groups'}
          label={t('activity')}
          active={activityActive}
        >
          <Activity className="size-[22px]" strokeWidth={1.75} />
        </DockLink>

        <div className="glass-dock__item glass-dock__you">
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'size-8',
              },
            }}
          />
        </div>
      </div>
    </nav>
  )
}

function DockLink({
  href,
  label,
  active,
  children,
}: {
  href: string
  label: string
  active: boolean
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      title={label}
      className={`glass-dock__item ${active ? 'is-active' : ''}`}
    >
      <span className="glass-dock__blob" aria-hidden />
      {children}
    </Link>
  )
}
