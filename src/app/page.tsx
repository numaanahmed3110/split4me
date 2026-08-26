'use client'

import { Button } from '@/components/ui/button'
import { TrackPage } from '@/lib/analytics/track-page'
import { Show, SignInButton } from '@clerk/nextjs'
import { ArrowLeftRight, Camera, Receipt, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function HomePage() {
  const t = useTranslations('Homepage')

  const features = [
    {
      icon: Users,
      title: t('features.groups.title'),
      description: t('features.groups.description'),
      tone: 'bg-[#E8E2FC]',
    },
    {
      icon: Receipt,
      title: t('features.expenses.title'),
      description: t('features.expenses.description'),
      tone: 'bg-[#FDECAD]',
    },
    {
      icon: ArrowLeftRight,
      title: t('features.balances.title'),
      description: t('features.balances.description'),
      tone: 'bg-[#E0F4F5]',
    },
    {
      icon: Camera,
      title: t('features.receipts.title'),
      description: t('features.receipts.description'),
      tone: 'bg-[#FDECAD]',
    },
  ]

  return (
    <main className="flex-1 flex flex-col">
      <TrackPage path="/" />

      <section className="py-16 md:py-24 lg:py-28">
        <div className="container max-w-screen-lg mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="!leading-[1.1] font-bold text-4xl sm:text-5xl md:text-[56px] tracking-tight text-balance landing-header">
              {t.rich('title', {
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </h1>
            <p className="mt-5 max-w-[36rem] leading-7 text-muted-foreground text-lg">
              {t.rich('description', {
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <Button size="lg" className="px-8 h-12 text-base">
                    {t('button.signIn')}
                  </Button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <Button asChild size="lg" className="px-8 h-12 text-base">
                  <Link href="/groups">{t('button.groups')}</Link>
                </Button>
              </Show>
            </div>
          </div>
          <div className="relative hidden md:block h-[380px]">
            <div className="absolute right-6 top-6 w-56 rounded-[24px] bg-[#FDECAD] p-5 shadow-[0_24px_60px_rgba(33,31,27,0.08)]">
              <p className="text-xs font-medium text-[#6F5A14]">This trip</p>
              <p className="text-2xl font-extrabold mt-1">Settled</p>
            </div>
            <div className="absolute left-4 top-36 w-52 rounded-[24px] bg-[#D8CEFA] p-5 shadow-[0_24px_60px_rgba(33,31,27,0.08)]">
              <p className="text-xs font-medium text-[#564787]">Last expense</p>
              <p className="text-lg font-bold mt-1">Dinner, split 4 ways</p>
            </div>
            <div className="absolute right-10 bottom-4 w-48 rounded-[24px] bg-[#E0F4F5] p-5 shadow-[0_24px_60px_rgba(33,31,27,0.08)]">
              <p className="text-xs font-medium text-[#23555B]">Balances</p>
              <p className="text-lg font-bold mt-1">Who owes whom</p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="container max-w-screen-lg mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {t('features.heading')}
            </h2>
            <p className="mt-3 text-muted-foreground text-balance max-w-xl mx-auto">
              {t('features.subheading')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-[28px] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.05)]"
              >
                <span
                  className={`inline-flex size-12 items-center justify-center rounded-2xl ${feature.tone}`}
                >
                  <feature.icon className="size-5" aria-hidden />
                </span>
                <h3 className="font-semibold mt-4">{feature.title}</h3>
                <p className="text-sm leading-6 text-muted-foreground mt-1">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24 md:pb-32 py-16 md:py-20 bg-white border-t">
        <div className="container max-w-screen-md mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-10">
            {t('how.heading')}
          </h2>
          <ol className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[1, 2, 3].map((step) => (
              <li key={step} className="flex flex-col items-start gap-3">
                <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-[#D8CEFA] font-bold">
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
