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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { CreateMenuFormData } from '../../schemas/menu-form-schema'

interface MenuStatusSettingsProps {
  form: UseFormReturn<CreateMenuFormData>
}

export function MenuStatusSettings({ form }: MenuStatusSettingsProps) {
  const { t } = useTranslation()

  return (
    <div className='grid grid-cols-2 gap-4'>
      <FormField
        control={form.control}
        name='visible'
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('system.menus.form.displayStatus')}</FormLabel>
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value}
              className='flex space-x-4'
            >
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='show' id='show' />
                <Label htmlFor='show'>{t('system.menus.form.show')}</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='hide' id='hide' />
                <Label htmlFor='hide'>{t('system.menus.form.hide')}</Label>
              </div>
            </RadioGroup>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='status'
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('system.menus.form.menuStatus')}</FormLabel>
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value}
              className='flex space-x-4'
            >
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='active' id='active' />
                <Label htmlFor='active'>{t('system.menus.status.active')}</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='inactive' id='inactive' />
                <Label htmlFor='inactive'>{t('system.menus.status.inactive')}</Label>
              </div>
            </RadioGroup>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
