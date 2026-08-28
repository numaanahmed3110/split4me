'use client'

import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { CalendarIcon } from 'lucide-react'
import { useId, useState, type KeyboardEvent } from 'react'

function formatDate(date: Date | undefined) {
  if (!date) return ''
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function isValidDate(date: Date | undefined) {
  if (!date) return false
  return !isNaN(date.getTime())
}

export function DatePicker4({
  value,
  onChange,
  label,
  className,
}: {
  value?: Date
  onChange?: (date: Date | undefined) => void
  label?: string
  className?: string
}) {
  const id = useId()
  const initial = value && isValidDate(value) ? value : new Date()
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initial)
  const [visibleMonth, setVisibleMonth] = useState<Date | undefined>(initial)
  const [inputValue, setInputValue] = useState(formatDate(initial))

  if (value && isValidDate(value) && selectedDate?.getTime() !== value.getTime()) {
    setSelectedDate(value)
    setVisibleMonth(value)
    setInputValue(formatDate(value))
  }

  const commit = (date: Date | undefined) => {
    setSelectedDate(date)
    setInputValue(formatDate(date))
    onChange?.(date)
  }

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
    }
  }

  return (
    <div className={cn('w-full space-y-2', className)}>
      {label ? (
        <Label htmlFor={id} className="px-1 text-sm font-medium">
          {label}
        </Label>
      ) : null}
      <div className="relative flex gap-2">
        <Input
          id={id}
          type="date"
          value={
            selectedDate && isValidDate(selectedDate)
              ? selectedDate.toISOString().substring(0, 10)
              : ''
          }
          className="h-11 rounded-2xl border-border/60 bg-background pr-11 shadow-xs"
          onChange={(event) => {
            const nextDate = new Date(event.target.value)
            if (isValidDate(nextDate)) {
              commit(nextDate)
              setVisibleMonth(nextDate)
            }
          }}
          onKeyDown={handleInputKeyDown}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            id={`${id}-picker`}
            className="absolute top-1/2 right-2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground/80 outline-none transition-colors hover:bg-accent/30 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <CalendarIcon className="size-3.5" />
            <span className="sr-only">Pick a date</span>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden rounded-2xl border-border/60 p-0 shadow-sm"
            align="end"
            alignOffset={-8}
            sideOffset={10}
          >
            <Calendar
              mode="single"
              selected={selectedDate}
              month={visibleMonth}
              onMonthChange={setVisibleMonth}
              classNames={{
                today:
                  'rounded-full bg-muted/60 data-[selected=true]:bg-slate-900 data-[selected=true]:text-white',
              }}
              onSelect={(date) => {
                commit(date)
                setVisibleMonth(date)
                setOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

export default DatePicker4
