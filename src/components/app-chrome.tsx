'use client'

import { GlassDock } from '@/components/glass-dock'
import { LocaleSwitcher } from '@/components/locale-switcher'
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
      <div className="flex flex-1 min-h-0 flex-col">
        {inApp ? (
          <header className="sticky top-0 z-40 px-4 pt-[max(10px,env(safe-area-inset-top))] pb-2">
            <div className="glass-topbar mx-auto max-w-lg flex items-center justify-between h-12 px-3">
              <Link className="flex items-center min-w-0" href="/groups">
                <Image
                  src="/logo-with-text.png"
                  className="h-7 w-auto"
                  width={(28 * 586) / 180}
                  height={28}
                  alt="split4me"
                />
              </Link>
              <div className="flex items-center gap-1">
                <LocaleSwitcher />
              </div>
            </div>
          </header>
        ) : (
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

        <div
          className={
            inApp
              ? 'flex-1 flex flex-col pb-[108px]'
              : 'pt-20 flex-1 flex flex-col'
          }
        >
          {children}
        </div>

        {!inApp && (
          <footer className="border-t p-6 mt-8 flex flex-col gap-3 text-xs bg-white [&_a]:underline">
            <Link className="flex items-center gap-2" href="/">
              <Image
                src="/logo-with-text.png"
                className="h-7 w-auto"
                width={(28 * 586) / 180}
                height={28}
                alt="split4me"
              />
            </Link>
            <span>{t('Footer.tagline')}</span>
          </footer>
        )}
      </div>

      {inApp && (
        <Show when="signed-in">
          <GlassDock groupId={activeGroupId} />
        </Show>
      )}
    </>
  )
}
