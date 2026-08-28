'use client'

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export function Switch1({
  id = 'notifications',
  label = 'Enable Notifications',
  checked,
  disabled,
  onCheckedChange,
}: {
  id?: string
  label?: string
  checked?: boolean
  disabled?: boolean
  onCheckedChange?: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
      <Label htmlFor={id}>{label}</Label>
    </div>
  )
}

export default Switch1
