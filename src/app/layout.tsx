import { ApplePwaSplash } from '@/app/apple-pwa-splash'
import { LocaleSwitcher } from '@/components/locale-switcher'
import { OneSignalInit } from '@/components/onesignal-init'
import { PreferencesMigration } from '@/components/preferences-migration'
import { ProgressBar } from '@/components/progress-bar'
import { ServiceWorkerRegistration } from '@/components/service-worker-registration'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { Analytics } from '@/lib/analytics/analytics'
import { getAnalyticsConfig } from '@/lib/analytics/config'
import { effectiveBaseUrl } from '@/lib/env'
import { TRPCProvider } from '@/trpc/client'
import { ClerkProvider, Show, UserButton } from '@clerk/nextjs'
import { shadcn } from '@clerk/ui/themes'
import type { Metadata, Viewport } from 'next'
import { NextIntlClientProvider, useTranslations } from 'next-intl'
import { getLocale, getMessages, getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Homepage')
  return {
    metadataBase: new URL(effectiveBaseUrl),
    title: {
      default: t('metaTitle'),
      template: '%s · split4me',
    },
    description:
      'split4me is a minimalist web application to share expenses with friends and family. No ads, no account, no problem.',
    openGraph: {
      title: t('metaTitle'),
      description:
        'split4me is a minimalist web application to share expenses with friends and family. No ads, no account, no problem.',
      images: `/banner.png`,
      type: 'website',
      url: '/',
    },
    twitter: {
      card: 'summary_large_image',
      images: `/banner.png`,
      title: t('metaTitle'),
      description:
        'split4me is a minimalist web application to share expenses with friends and family. No ads, no account, no problem.',
    },
    appleWebApp: {
      capable: true,
      title: 'split4me',
    },
    applicationName: 'split4me',
    icons: [
      {
        url: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}

export const viewport: Viewport = {
  themeColor: '#047857',
}

// Clerk's `shadcn` theme reads our design tokens as finished colors, e.g.
// `colorBackground: 'var(--card)'`. Ours are bare HSL channel triplets
// (`--card: 0 0% 100%`) that Tailwind wraps at use site as `hsl(var(--card))`,
// so handing them over raw yields `background: 0 0% 100%` -- not a valid color,
// which is why the modal rendered see-through over the page. Re-wrap every
// token the theme maps so it receives an actual color.
//
// `colorModalBackdrop` is deliberately absent: the theme builds it from
// `--color-black`, which Tailwind emits as `#000`, so it already works.
const clerkVariables = {
  colorBackground: 'hsl(var(--card))',
  colorForeground: 'hsl(var(--card-foreground))',
  colorInput: 'hsl(var(--input))',
  colorInputForeground: 'hsl(var(--card-foreground))',
  colorDanger: 'hsl(var(--destructive))',
  colorMuted: 'hsl(var(--muted))',
  colorMutedForeground: 'hsl(var(--muted-foreground))',
  colorNeutral: 'hsl(var(--foreground))',
  colorPrimary: 'hsl(var(--primary))',
  colorPrimaryForeground: 'hsl(var(--primary-foreground))',
  colorRing: 'color-mix(in srgb, hsl(var(--ring)), transparent 50%)',
}

function Content({ children }: { children: React.ReactNode }) {
  const t = useTranslations()
  return (
    <TRPCProvider>
      <PreferencesMigration />
      <header className="fixed top-0 left-0 right-0 h-16 flex justify-between bg-white dark:bg-gray-950 bg-opacity-50 dark:bg-opacity-50 p-2 border-b backdrop-blur-sm z-50">
        <Link
          className="flex items-center gap-2 hover:scale-105 transition-transform"
          href="/"
        >
          <h1>
            <Image
              src="/logo-with-text.png"
              className="m-1 h-auto w-auto"
              width={(35 * 586) / 180}
              height={35}
              alt="split4me"
            />
          </h1>
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

      <div className="pt-16 flex-1 flex flex-col">{children}</div>

      <footer className="sm:p-8 md:p-16 sm:mt-16 sm:text-sm md:text-base md:mt-32 bg-slate-50 dark:bg-card border-t p-6 mt-8 flex flex-col sm:flex-row sm:justify-between gap-4 text-xs [&_a]:underline">
        <div className="flex flex-col space-y-2">
          <div className="sm:text-lg font-semibold text-base flex space-x-2 items-center">
            <Link className="flex items-center gap-2" href="/">
              <Image
                src="/logo-with-text.png"
                className="m-1 h-auto w-auto"
                width={(35 * 586) / 180}
                height={35}
                alt="split4me"
              />
            </Link>
          </div>
          <div className="flex flex-col space-y a--no-underline-text-white">
            <span>{t('Footer.tagline')}</span>
          </div>
        </div>
      </footer>
      <Toaster />
    </TRPCProvider>
  )
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()
  const analyticsConfig = await getAnalyticsConfig()
  return (
    <html
      lang={locale}
      dir={['ar', 'he'].includes(locale) ? 'rtl' : 'ltr'}
      suppressHydrationWarning
    >
      <ApplePwaSplash icon="/logo-with-text.png" color="#047857" />
      <body className="min-h-[100dvh] flex flex-col items-stretch bg-slate-50 bg-opacity-30 dark:bg-background">
        <ClerkProvider
          appearance={{ theme: shadcn, variables: clerkVariables }}
        >
          <OneSignalInit />
          <NextIntlClientProvider messages={messages}>
            {/* Rendered inside the provider because it reads translations via
              `useTranslations`, which needs NextIntlClientProvider in its
              ancestor tree. */}
            <ServiceWorkerRegistration />
            <Analytics config={analyticsConfig}>
              <ThemeProvider
                attribute="class"
                defaultTheme="light"
                forcedTheme="light"
                disableTransitionOnChange
              >
                <Suspense>
                  <ProgressBar />
                </Suspense>
                <Content>{children}</Content>
              </ThemeProvider>
            </Analytics>
          </NextIntlClientProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
