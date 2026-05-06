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
import { Search, X } from 'lucide-react'
import { availableIconNames, availableIcons } from '@/lib/icons.ts'
import { cn } from '@/lib/utils.ts'
import { Button } from '@/components/ui/button.tsx'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx'
import { Input } from '@/components/ui/input.tsx'

// Use centralized available icons
const allIcons = availableIconNames

interface IconPickerProps {
  value?: string
  onChange: (icon: string) => void
  placeholder?: string
  className?: string
}

export function IconPicker({
  value,
  onChange,
  placeholder,
  className,
}: IconPickerProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Filter icons based on search term - add safety check
  const filteredIcons = (allIcons || []).filter(
    (iconName) =>
      iconName && iconName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleIconSelect = (iconName: string) => {
    if (iconName && onChange) {
      onChange(iconName)
      setOpen(false)
    }
  }

  const handleClear = () => {
    if (onChange) {
      onChange('')
    }
  }

  // Get the selected icon component - add safety check
  const SelectedIcon =
    value && availableIcons[value as keyof typeof availableIcons]
      ? availableIcons[value as keyof typeof availableIcons]
      : null

  return (
    <div className={cn('relative', className)}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            className='h-10 w-full justify-between'
          >
            <div className='flex items-center space-x-2'>
              {SelectedIcon ? (
                <>
                  <SelectedIcon className='h-4 w-4' />
                  <span>{value}</span>
                </>
              ) : (
                <span className='text-muted-foreground'>{placeholder ?? t('iconPicker.title')}</span>
              )}
            </div>
            <Search className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </DialogTrigger>

        <DialogContent className='flex h-[650px] flex-col sm:max-w-[700px]'>
          <DialogHeader className='flex-shrink-0'>
            <DialogTitle>{t('iconPicker.title')}</DialogTitle>
          </DialogHeader>

          <div className='flex min-h-0 flex-1 flex-col'>
            {/* Fixed search area */}
            <div className='flex-shrink-0 space-y-4 pb-4'>
              {/* Search input */}
              <div className='relative'>
                <Search className='text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 transform' />
                <Input
                  placeholder={t('iconPicker.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-8'
                />
              </div>

              {/* Selected icon display and clear button - fixed height */}
              <div className='h-16'>
                {value && (
                  <div className='bg-muted flex h-full items-center justify-between rounded-lg p-3'>
                    <div className='flex items-center space-x-2'>
                      {SelectedIcon && <SelectedIcon className='h-5 w-5' />}
                      <span className='font-medium'>{t('iconPicker.selected', { value })}</span>
                    </div>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={handleClear}
                      className='h-8 w-8 p-0'
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Scrollable icons grid - takes remaining space */}
            <div className='flex-1 overflow-y-auto'>
              <div className='grid grid-cols-10 gap-2'>
                {filteredIcons.map((iconName) => {
                  const IconComponent =
                    availableIcons[iconName as keyof typeof availableIcons]
                  const isSelected = value === iconName

                  return (
                    <Button
                      key={iconName}
                      variant={isSelected ? 'default' : 'ghost'}
                      className={cn(
                        'flex h-12 w-12 flex-col items-center justify-center p-2',
                        isSelected && 'bg-primary text-primary-foreground'
                      )}
                      onClick={() => handleIconSelect(iconName)}
                      title={iconName}
                    >
                      <IconComponent className='h-5 w-5' />
                    </Button>
                  )
                })}
              </div>

              {filteredIcons.length === 0 && (
                <div className='text-muted-foreground py-8 text-center'>
                  {t('iconPicker.noResults')}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
