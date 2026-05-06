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

import { useTranslation } from 'react-i18next'
import type { UseFormReturn } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { IconPicker } from '@/components/icon-picker.tsx'
import type { CreateMenuFormData } from '../../schemas/menu-form-schema'

interface MenuDisplaySettingsProps {
  form: UseFormReturn<CreateMenuFormData>
}

export function MenuDisplaySettings({ form }: MenuDisplaySettingsProps) {
  const { t } = useTranslation()

  return (
    <div className='grid grid-cols-2 gap-4'>
      <FormField
        control={form.control}
        name='icon'
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('system.menus.form.menuIcon')}</FormLabel>
            <FormControl>
              <IconPicker
                value={field.value}
                onChange={field.onChange}
                placeholder={t('system.menus.form.iconPlaceholder')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='sequence'
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <span className='text-red-500'>*</span> {t('system.menus.form.displayOrder')}
            </FormLabel>
            <FormControl>
              <Input
                type='number'
                placeholder={t('system.menus.form.displayOrderPlaceholder')}
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
