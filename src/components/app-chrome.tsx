'use client'

import { LocaleSwitcher } from '@/components/locale-switcher'
import { MobileTabBar } from '@/components/mobile-tab-bar'
import { WebSidebar } from '@/components/web-sidebar'
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
  const inApp = pathname.startsWith('/groups')
  const groupId = groupIdFromPath(pathname)
  const [lastGroupId, setLastGroupId] = useState<string | null>(groupId)

  useEffect(() => {
    setLastGroupId(groupId ?? readLastGroup())
  }, [groupId])

  const activeGroupId = groupId ?? lastGroupId

  return (
    <>
      <div className="flex flex-1 min-h-0">
        {inApp && (
          <div className="hidden md:block">
            <WebSidebar groupId={activeGroupId} />
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <header
            className={
              inApp
                ? 'hidden md:flex sticky top-0 z-40 h-16 items-center justify-between px-6 bg-[color-mix(in_srgb,var(--background)_88%,white)] backdrop-blur-md border-b'
                : 'fixed top-0 left-0 right-0 h-16 flex justify-between bg-white/80 backdrop-blur-md p-2 border-b z-50'
            }
          >
            <Link className="flex items-center gap-2" href={inApp ? '/groups' : '/'}>
              <Image
                src="/logo-with-text.png"
                className="m-1 h-auto w-auto"
                width={(35 * 586) / 180}
                height={35}
                alt="split4me"
              />
            </Link>
            <div role="navigation" aria-label="Menu" className="flex">
              <ul className="flex items-center text-sm">
                <li>
                  <LocaleSwitcher />
                </li>
                <li className="ml-2 flex items-center gap-2">
                  <Show when="signed-in">
                    <UserButton />
                  </Show>
                </li>
              </ul>
            </div>
          </header>

          <div
            className={
              inApp
                ? 'flex-1 flex flex-col pb-24 md:pb-0 md:pt-0'
                : 'pt-16 flex-1 flex flex-col'
            }
          >
            {children}
          </div>

          {!inApp && (
            <footer className="sm:p-8 md:p-16 sm:mt-16 sm:text-sm md:text-base md:mt-32 border-t p-6 mt-8 flex flex-col sm:flex-row sm:justify-between gap-4 text-xs [&_a]:underline bg-white">
              <div className="flex flex-col space-y-2">
                <Link className="flex items-center gap-2" href="/">
                  <Image
                    src="/logo-with-text.png"
                    className="m-1 h-auto w-auto"
                    width={(35 * 586) / 180}
                    height={35}
                    alt="split4me"
                  />
                </Link>
                <span>{t('Footer.tagline')}</span>
              </div>
            </footer>
          )}
        </div>
      </div>

      {inApp && (
        <Show when="signed-in">
          <MobileTabBar groupId={activeGroupId} />
        </Show>
      )}
    </>
  )
}
