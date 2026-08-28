'use client'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import {
  CheckCircle2Icon,
  DownloadIcon,
  FileDown,
  FileJson,
  XIcon,
} from 'lucide-react'
import { useState } from 'react'

export function Popover6({
  csvHref,
  jsonHref,
  onExport,
}: {
  csvHref: string
  jsonHref: string
  onExport?: (format: 'csv' | 'json') => void
}) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(0)
  const [format, setFormat] = useState<'csv' | 'json' | null>(null)
  const [done, setDone] = useState(false)

  async function start(next: 'csv' | 'json') {
    setFormat(next)
    setDone(false)
    setValue(12)
    onExport?.(next)
    const href = next === 'csv' ? csvHref : jsonHref
    try {
      setValue(45)
      const res = await fetch(href)
      if (!res.ok) throw new Error('export failed')
      setValue(80)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = next === 'csv' ? 'expenses.csv' : 'expenses.json'
      a.click()
      URL.revokeObjectURL(url)
      setValue(100)
      setDone(true)
    } catch {
      setValue(0)
      setFormat(null)
    }
  }

  const label = done
    ? 'Export complete'
    : format
      ? `Exporting ${format.toUpperCase()}`
      : 'Export expenses'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl border-neutral-200 transition-all hover:bg-neutral-50"
          title="Export"
        >
          <DownloadIcon className="size-4 text-neutral-500" />
          <span className="sr-only">Export expenses</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 rounded-2xl border-neutral-200 bg-white p-6 shadow-lg">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="relative flex size-11 items-center justify-center rounded-xl border border-neutral-100 bg-neutral-50">
              <span
                className={cn(
                  'absolute inset-0 rounded-xl border-2 border-dashed',
                  done
                    ? 'border-emerald-500 opacity-30'
                    : 'border-indigo-600 opacity-20',
                  {
                    'animate-spin [animation-duration:8s]':
                      Boolean(format) && !done,
                  },
                )}
              />
              {done ? (
                <CheckCircle2Icon className="size-5 text-emerald-500" />
              ) : (
                <DownloadIcon className="z-1 size-5 text-indigo-600" />
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="block truncate text-sm font-bold tracking-tight text-neutral-900">
                {label}
              </span>
              <p className="truncate text-[10px] font-medium text-neutral-400">
                CSV or JSON for this group
              </p>
            </div>
            {format ? (
              <span
                className={cn(
                  'text-sm font-bold tabular-nums',
                  done ? 'text-emerald-500' : 'text-neutral-900',
                )}
              >
                {`${value}%`}
              </span>
            ) : null}
          </div>

          {format ? (
            <Progress
              value={value}
              className={cn(
                'h-1.5 bg-neutral-50',
                done
                  ? '[&>[data-slot=progress-indicator]]:bg-emerald-500'
                  : '[&>[data-slot=progress-indicator]]:bg-indigo-600',
              )}
            />
          ) : null}

          <div className="grid grid-cols-2 gap-2.5">
            <Button
              size="sm"
              variant="outline"
              className="h-9 gap-2 rounded-xl border-neutral-200 text-xs font-bold"
              disabled={Boolean(format) && !done}
              onClick={() => void start('csv')}
            >
              <FileDown className="size-3" />
              CSV
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-9 gap-2 rounded-xl border-neutral-200 text-xs font-bold"
              disabled={Boolean(format) && !done}
              onClick={() => void start('json')}
            >
              <FileJson className="size-3" />
              JSON
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 rounded-xl border-neutral-200 text-xs font-bold"
            onClick={() => {
              setOpen(false)
              setFormat(null)
              setValue(0)
              setDone(false)
            }}
          >
            <XIcon className="size-3.5" />
            {done ? 'Dismiss' : 'Close'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default Popover6
