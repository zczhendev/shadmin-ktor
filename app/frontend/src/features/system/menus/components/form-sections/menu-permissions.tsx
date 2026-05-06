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
import type { UseFormReturn } from 'react-hook-form'
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PERMISSIONS } from '@/constants/permissions'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import type { CreateMenuFormData } from '../../schemas/menu-form-schema'

interface MenuPermissionsProps {
  form: UseFormReturn<CreateMenuFormData>
  selectedType: string
}

// Extract all permission values from the nested PERMISSIONS object
function getAllPermissions(): string[] {
  const extractPermissions = (obj: Record<string, unknown>): string[] => {
    const result: string[] = []
    for (const value of Object.values(obj)) {
      if (typeof value === 'string') {
        result.push(value)
      } else if (typeof value === 'object' && value !== null) {
        result.push(...extractPermissions(value as Record<string, unknown>))
      }
    }
    return result
  }
  return extractPermissions(PERMISSIONS)
}

export function MenuPermissions({ form, selectedType }: MenuPermissionsProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const allPermissions = getAllPermissions()

  if (selectedType !== 'button') {
    return null
  }

  return (
    <div className='space-y-4'>
      <FormField
        control={form.control}
        name='permissions'
        render={({ field }) => {
          const isValidPermission =
            !field.value || allPermissions.includes(field.value)

          return (
            <FormItem className='flex flex-col'>
              <FormLabel>{t('system.menus.form.permissionCode')}</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant='outline'
                      role='combobox'
                      aria-expanded={open}
                      className={cn(
                        'w-full justify-between',
                        !field.value && 'text-muted-foreground',
                        !isValidPermission &&
                          'border-red-500 focus-visible:ring-red-500'
                      )}
                    >
                      {field.value || t('system.menus.form.permissionPlaceholder')}
                      <ChevronsUpDownIcon className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className='w-full p-0' align='start'>
                  <Command>
                    <CommandInput
                      placeholder={t('system.menus.form.permissionSearch')}
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value)
                        // Auto-close popover when exact match is selected
                        if (allPermissions.includes(value)) {
                          setOpen(false)
                        }
                      }}
                    />
                    <CommandList>
                      <CommandEmpty>{t('system.menus.form.permissionNotFound')}</CommandEmpty>
                      <CommandGroup>
                        {allPermissions
                          .filter((permission) =>
                            permission
                              .toLowerCase()
                              .includes((field.value || '').toLowerCase())
                          )
                          .map((permission) => (
                            <CommandItem
                              key={permission}
                              value={permission}
                              onSelect={(value) => {
                                field.onChange(value)
                                setOpen(false)
                              }}
                            >
                              <CheckIcon
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  field.value === permission
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {permission}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {!isValidPermission && field.value && (
                <p className='text-sm text-red-500'>
                  {t('system.menus.form.permissionInvalid')}
                </p>
              )}
              <FormMessage />
            </FormItem>
          )
        }}
      />
    </div>
  )
}
