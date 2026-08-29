'use client'

import { GlassDock } from '@/components/glass-dock'
import { LocaleSwitcher } from '@/components/locale-switcher'
import { PwaOnboarding } from '@/components/pwa-onboarding'
import { SiteFooter } from '@/components/site-footer'
import { WebSidebar } from '@/components/web-sidebar'
import { useIsInstalledPwa } from '@/lib/hooks'
import { readLastGroup } from '@/lib/last-group'
import { Show, UserButton } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PropsWithChildren, useEffect, useState } from 'react'

function groupIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/groups\/([^/]+)/)
  if (!match) return null
  if (match[1] === 'create') return null
  return match[1]
}

export function AppChrome({ children }: PropsWithChildren) {
  const t = useTranslations()
  const pathname = usePathname()
  const installedPwa = useIsInstalledPwa()
  const inApp =
    pathname.startsWith('/groups') || pathname.startsWith('/settings')
  const groupId = groupIdFromPath(pathname)
  const [lastGroupId, setLastGroupId] = useState<string | null>(groupId)

  useEffect(() => {
    setLastGroupId(groupId ?? readLastGroup())
  }, [groupId])

  const activeGroupId = groupId ?? lastGroupId
  const showWebLandingNav = !inApp && !installedPwa
  const showWebAppHeader = inApp

  return (
    <>
      <PwaOnboarding />
      <div className="flex flex-1 min-h-0">
        {inApp && (
          <div className="hidden md:block">
            <WebSidebar groupId={activeGroupId} />
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          {showWebLandingNav && (
            <header className="fixed top-0 left-0 right-0 z-50 p-3">
              <div className="glass-topbar mx-auto max-w-5xl flex items-center justify-between h-14 px-3">
                <Link className="flex items-center" href="/">
                  <Image
                    src="/logo-with-text.png"
                    className="h-8 w-auto"
                    width={(32 * 586) / 180}
                    height={32}
                    alt="split4me"
                  />
                </Link>
                <div className="flex items-center gap-2">
                  <LocaleSwitcher />
                  <Show when="signed-in">
                    <UserButton />
                  </Show>
                </div>
              </div>
            </header>
          )}

          {showWebAppHeader && (
            <header className="hidden md:flex sticky top-0 z-40 h-16 items-center justify-end px-6 border-b bg-white/80 backdrop-blur-md">
              <LocaleSwitcher />
              <div className="ml-2">
                <Show when="signed-in">
                  <UserButton />
                </Show>
              </div>
            </header>
          )}

          <div
            className={
              inApp
                ? 'flex-1 flex flex-col pb-[120px] pt-[max(12px,env(safe-area-inset-top))] md:pb-0 md:pt-0'
                : showWebLandingNav
                  ? 'pt-20 flex-1 flex flex-col'
                  : 'flex-1 flex flex-col pt-[max(12px,env(safe-area-inset-top))]'
            }
          >
            {children}
          </div>

          {showWebLandingNav && <SiteFooter tagline={t('Footer.tagline')} />}
        </div>
      </div>

      {inApp && (
        <Show when="signed-in">
          <GlassDock groupId={activeGroupId} />
        </Show>
      )}
    </>
  )
}
