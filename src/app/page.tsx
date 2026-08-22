'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { TrackPage } from '@/lib/analytics/track-page'
import { Show, SignInButton } from '@clerk/nextjs'
import {
  ArrowLeftRight,
  BarChart3,
  Camera,
  Globe,
  Percent,
  Receipt,
  Repeat,
  Users,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function HomePage() {
  const t = useTranslations('Homepage')

  const features = [
    {
      icon: Users,
      title: t('features.groups.title'),
      description: t('features.groups.description'),
    },
    {
      icon: Receipt,
      title: t('features.expenses.title'),
      description: t('features.expenses.description'),
    },
    {
      icon: Percent,
      title: t('features.splitting.title'),
      description: t('features.splitting.description'),
    },
    {
      icon: ArrowLeftRight,
      title: t('features.balances.title'),
      description: t('features.balances.description'),
    },
    {
      icon: Globe,
      title: t('features.currencies.title'),
      description: t('features.currencies.description'),
    },
    {
      icon: BarChart3,
      title: t('features.stats.title'),
      description: t('features.stats.description'),
    },
    {
      icon: Camera,
      title: t('features.receipts.title'),
      description: t('features.receipts.description'),
    },
    {
      icon: Repeat,
      title: t('features.recurring.title'),
      description: t('features.recurring.description'),
    },
  ]

  return (
    <main className="flex-1 flex flex-col">
      <TrackPage path="/" />

      <section className="py-20 md:py-28 lg:py-32">
        <div className="container max-w-screen-md mx-auto px-4 flex flex-col items-center gap-6 text-center">
          <h1 className="!leading-tight font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight text-balance landing-header">
            {t.rich('title', {
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </h1>
          <p className="max-w-[42rem] leading-normal sm:leading-8 text-muted-foreground sm:text-xl text-balance">
            {t.rich('description', {
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>
          {/* Groups are behind auth, so the single call to action opens the
              sign-in modal for a visitor rather than sending them to /groups
              just to be bounced back by the middleware. This is the only
              sign-in entry point on the page. */}
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button size="lg" className="mt-2 px-8 h-12 text-base rounded-full">
                {t('button.signIn')}
              </Button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <Button asChild size="lg" className="mt-2 px-8 h-12 text-base rounded-full">
              <Link href="/groups">{t('button.groups')}</Link>
            </Button>
          </Show>
        </div>
      </section>

      <section className="pb-20 md:pb-28">
        <div className="container max-w-screen-lg mx-auto px-4">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-balance">
              {t('features.heading')}
            </h2>
            <p className="mt-3 text-muted-foreground sm:text-lg text-balance">
              {t('features.subheading')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="bg-white/60 dark:bg-card/60 border-none shadow-none"
              >
                <CardContent className="flex flex-col items-start gap-3 p-6">
                  <span className="inline-flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <feature.icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24 md:pb-32 border-t bg-slate-50 dark:bg-card py-16 md:py-24 mt-auto">
        <div className="container max-w-screen-md mx-auto px-4">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              {t('how.heading')}
            </h2>
          </div>
          <ol className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[1, 2, 3].map((step) => (
              <li key={step} className="flex flex-col items-center gap-3 text-center">
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  {step}
                </span>
                <h3 className="font-semibold text-lg">
                  {t(`how.step${step}.title`)}
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  {t(`how.step${step}.description`)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  )
}
