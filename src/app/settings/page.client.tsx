'use client'

import { NotificationSettings } from '@/app/settings/notification-settings'
import { BrandMark } from '@/components/brand-icons'
import { LocaleSwitcher } from '@/components/locale-switcher'
import { Button } from '@/components/ui/button'
import { SignOutButton, useClerk, useUser } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export function SettingsPageClient() {
  const t = useTranslations('AccountSettings')
  const { user } = useUser()
  const { openUserProfile } = useClerk()

  const name =
    user?.fullName ||
    user?.firstName ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress
  const email = user?.primaryEmailAddress?.emailAddress
  const imageUrl = user?.imageUrl

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-bold text-2xl tracking-tight">{t('title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('subtitle')}</p>
      </div>

      <section className="rounded-[28px] bg-white p-5 shadow-[0_15px_35px_rgba(0,0,0,0.06)]">
        <h2 className="text-sm font-semibold mb-4">{t('profileTitle')}</h2>
        <div className="flex items-center gap-3 mb-5">
          {imageUrl ? (
            // Clerk hosts avatars on their CDN; a plain img avoids next/image allowlists.
            <img
              src={imageUrl}
              alt=""
              width={56}
              height={56}
              className="size-14 rounded-full object-cover bg-[#F6F2E9]"
            />
          ) : (
            <span className="size-14 rounded-full bg-[#F6F2E9] flex items-center justify-center">
              <BrandMark className="size-8" />
            </span>
          )}
          <div className="min-w-0">
            <p className="font-semibold truncate">{name}</p>
            {email && name !== email ? (
              <p className="text-sm text-muted-foreground truncate">{email}</p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="secondary"
            className="h-11 rounded-full"
            onClick={() => openUserProfile()}
          >
            {t('manageAccount')}
          </Button>
          <p className="text-xs text-muted-foreground px-1">
            {t('manageAccountHint')}
          </p>
          <SignOutButton>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-full"
            >
              {t('signOut')}
            </Button>
          </SignOutButton>
        </div>
      </section>

      <NotificationSettings />

      <section className="rounded-[28px] bg-white p-5 shadow-[0_15px_35px_rgba(0,0,0,0.06)]">
        <h2 className="text-sm font-semibold mb-1">{t('languageTitle')}</h2>
        <p className="text-sm text-muted-foreground mb-3">
          {t('languageDescription')}
        </p>
        <LocaleSwitcher className="rounded-full h-10 px-4 border" />
      </section>

      <section className="rounded-[28px] bg-white p-5 shadow-[0_15px_35px_rgba(0,0,0,0.06)]">
        <h2 className="text-sm font-semibold mb-1">{t('aboutTitle')}</h2>
        <p className="text-sm text-muted-foreground leading-6">
          {t('aboutBody')}
        </p>
        <Link
          href="/"
          className="inline-flex mt-4 text-sm font-medium underline underline-offset-4"
        >
          {t('aboutLink')}
        </Link>
      </section>
    </div>
  )
}
