'use client'

import { Button } from '@/components/ui/button'
import { Receipt, Scale, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const KEY = 'split4me-first-run-dismissed'

export function FirstRunGuide({ hasGroups }: { hasGroups: boolean }) {
  const t = useTranslations('Onboarding')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (hasGroups) return
    setOpen(window.localStorage.getItem(KEY) !== '1')
  }, [hasGroups])

  if (hasGroups || !open) return null

  const steps = [
    { icon: Users, title: t('step1Title'), body: t('step1Body') },
    { icon: Receipt, title: t('step2Title'), body: t('step2Body') },
    { icon: Scale, title: t('step3Title'), body: t('step3Body') },
  ]

  return (
    <section className="rounded-[28px] bg-white p-6 shadow-[0_15px_35px_rgba(0,0,0,0.06)] mb-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
        {t('kicker')}
      </p>
      <h2 className="text-2xl font-bold tracking-tight mb-2">{t('title')}</h2>
      <p className="text-sm text-muted-foreground mb-6">{t('subtitle')}</p>
      <ol className="space-y-4 mb-6">
        {steps.map((step, i) => (
          <li key={step.title} className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#E8E2FC]">
              <step.icon className="w-5 h-5" />
            </span>
            <div>
              <p className="font-semibold text-sm">
                {i + 1}. {step.title}
              </p>
              <p className="text-sm text-muted-foreground">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button asChild className="rounded-full h-12 flex-1">
          <Link href="/groups/create">{t('cta')}</Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full h-12"
          onClick={() => {
            window.localStorage.setItem(KEY, '1')
            setOpen(false)
          }}
        >
          {t('skip')}
        </Button>
      </div>
    </section>
  )
}
