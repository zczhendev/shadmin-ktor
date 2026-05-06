/*
 * Copyright (c) 2026 zczhendev
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type MultiSelectDropdownProps = {
  onValueChange?: (values: string[]) => void
  value?: string[]
  placeholder?: string
  items: { label: string; value: string }[]
  disabled?: boolean
  className?: string
}

export function MultiSelectDropdown({
  value = [],
  onValueChange,
  items,
  placeholder,
  disabled,
  className = '',
}: MultiSelectDropdownProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const handleToggleItem = (itemValue: string) => {
    const isSelected = value.includes(itemValue)
    const newValue = isSelected
      ? value.filter((v) => v !== itemValue)
      : [...value, itemValue]
    onValueChange?.(newValue)
  }

  const getDisplayValue = () => {
    if (value.length === 0) return placeholder ?? t('common.selectOption')
    const selectedLabels = value
      .map((v) => items.find((item) => item.value === v)?.label || v)
      .join(', ')
    return selectedLabels
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={cn(
            'w-full justify-between font-normal',
            value.length === 0 && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <span className='truncate'>{getDisplayValue()}</span>
          <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='start'>
        {items.map((item) => {
          const isSelected = value.includes(item.value)
          return (
            <DropdownMenuItem
              key={item.value}
              className='flex cursor-pointer items-center space-x-2'
              onSelect={(e) => {
                e.preventDefault()
                handleToggleItem(item.value)
              }}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => handleToggleItem(item.value)}
                className='pointer-events-none'
              />
              <span className='flex-1'>{item.label}</span>
              {isSelected && <Check className='text-primary h-4 w-4' />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
