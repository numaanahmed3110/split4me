import { ApplePwaSplash } from '@/app/apple-pwa-splash'
import { AppChrome } from '@/components/app-chrome'
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
import { ClerkProvider } from '@clerk/nextjs'
import { shadcn } from '@clerk/ui/themes'
import type { Metadata, Viewport } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages, getTranslations } from 'next-intl/server'
import { Suspense, type ReactNode } from 'react'
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
  themeColor: '#F6F2E9',
}

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

function Content({ children }: { children: ReactNode }) {
  return (
    <TRPCProvider>
      <PreferencesMigration />
      <AppChrome>{children}</AppChrome>
      <Toaster />
    </TRPCProvider>
  )
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode
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
      <ApplePwaSplash icon="/logo-with-text.png" color="#F6F2E9" />
      <body className="min-h-[100dvh] flex flex-col items-stretch bg-background">
        <ClerkProvider
          appearance={{ theme: shadcn, variables: clerkVariables }}
        >
          <OneSignalInit />
          <NextIntlClientProvider messages={messages}>
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
