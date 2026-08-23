'use client'

import { ChevronDown, Loader2 } from 'lucide-react'

import { Button, ButtonProps } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Currency } from '@/lib/currency'
import { useMediaQuery } from '@/lib/hooks'
import { useTranslations } from 'next-intl'
import { forwardRef, useEffect, useState } from 'react'

type Props = {
  currencies: Currency[]
  onValueChange: (currencyCode: Currency['code']) => void
  /** Currency code to be selected by default. Overwriting this value will update current selection, too. */
  defaultValue: Currency['code']
  isLoading: boolean
}

export function CurrencySelector({
  currencies,
  onValueChange,
  defaultValue,
  isLoading,
}: Props) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState<string>(defaultValue)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  useEffect(() => {
    setValue(defaultValue)
    onValueChange(defaultValue)
    // Intentionally not depending on onValueChange: parents often pass an
    // inline callback, and re-firing it every render would reset the form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue])

  const selectedCurrency =
    currencies.find((currency) => (currency.code ?? '') === value) ??
    currencies[0]

  const pick = (code: Currency['code']) => {
    setValue(code)
    onValueChange(code)
    setOpen(false)
  }

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <CurrencyButton
            currency={selectedCurrency}
            open={open}
            isLoading={isLoading}
          />
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[min(100vw-2rem,22rem)]" align="start">
          <CurrencyCommand currencies={currencies} onValueChange={pick} />
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      // Only the grab handle dismisses the sheet, so the list can scroll
      // and taps on a currency are not stolen as a swipe-to-close.
      handleOnly
      repositionInputs={false}
    >
      <DrawerTrigger asChild>
        <CurrencyButton
          currency={selectedCurrency}
          open={open}
          isLoading={isLoading}
        />
      </DrawerTrigger>
      <DrawerContent className="p-0 max-h-[85dvh]">
        <CurrencyCommand currencies={currencies} onValueChange={pick} />
      </DrawerContent>
    </Drawer>
  )
}

function CurrencyCommand({
  currencies,
  onValueChange,
}: {
  currencies: Currency[]
  onValueChange: (currencyId: Currency['code']) => void
}) {
  const currencyGroup = (currency: Currency) => {
    switch (currency.code) {
      case 'INR':
      case 'USD':
      case 'EUR':
      case 'JPY':
      case 'GBP':
      case 'CNY':
        return 'common'
      default:
        if (currency.code === '') return 'custom'
        return 'other'
    }
  }
  const t = useTranslations('Currencies')
  const currenciesByGroup = currencies.reduce<Record<string, Currency[]>>(
    (acc, currency) => ({
      ...acc,
      [currencyGroup(currency)]: (acc[currencyGroup(currency)] ?? []).concat([
        currency,
      ]),
    }),
    {},
  )
  const groupOrder = ['common', 'other', 'custom']

  return (
    <Command className="flex flex-col max-h-[min(70dvh,28rem)]">
      <CommandInput placeholder={t('search')} className="text-base" />
      <CommandList className="max-h-[min(60dvh,24rem)] overflow-y-auto overscroll-contain touch-pan-y">
        <CommandEmpty>{t('noCurrency')}</CommandEmpty>
        {groupOrder
          .filter((group) => currenciesByGroup[group]?.length)
          .map((group) => (
            <CommandGroup key={group} heading={t(`${group}.heading`)}>
              {currenciesByGroup[group].map((currency) => (
                <CommandItem
                  key={currency.code || 'custom'}
                  value={`${currency.code} ${currency.name} ${currency.symbol} ${currency.name_plural}`}
                  className="cursor-pointer py-3"
                  onPointerDown={(event) => {
                    // cmdk + vaul: mobile keyboards fire onSelect from the
                    // keyboard but swallow the tap. Pointer-down selects first.
                    if (event.button !== 0) return
                    event.preventDefault()
                    onValueChange(currency.code)
                  }}
                  onSelect={() => onValueChange(currency.code)}
                >
                  <CurrencyLabel currency={currency} />
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
      </CommandList>
    </Command>
  )
}

type CurrencyButtonProps = {
  currency: Currency
  open: boolean
  isLoading: boolean
}
const CurrencyButton = forwardRef<HTMLButtonElement, CurrencyButtonProps>(
  (
    { currency, open, isLoading, ...props }: ButtonProps & CurrencyButtonProps,
    ref,
  ) => {
    const iconClassName = 'ml-2 h-4 w-4 shrink-0 opacity-50'
    return (
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="flex w-full justify-between"
        ref={ref}
        {...props}
      >
        <CurrencyLabel currency={currency} />
        {isLoading ? (
          <Loader2 className={`animate-spin ${iconClassName}`} />
        ) : (
          <ChevronDown className={iconClassName} />
        )}
      </Button>
    )
  },
)
CurrencyButton.displayName = 'CurrencyButton'

function CurrencyLabel({ currency }: { currency: Currency }) {
  const region =
    currency?.code === 'INR'
      ? 'in'
      : currency?.code.length
        ? currency.code.slice(0, 2).toLowerCase()
        : 'un'
  const flagUrl = `https://flagcdn.com/h24/${region}.png`
  return (
    <div className="flex items-center gap-3">
      <img src={flagUrl} className="w-4" alt="" />
      {currency.name}
      {currency.code ? ` (${currency.code})` : ''}
    </div>
  )
}
