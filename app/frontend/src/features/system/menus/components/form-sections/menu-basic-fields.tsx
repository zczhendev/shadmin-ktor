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
import type { CreateMenuFormData } from '../../schemas/menu-form-schema'

interface MenuBasicFieldsProps {
  form: UseFormReturn<CreateMenuFormData>
}

export function MenuBasicFields({ form }: MenuBasicFieldsProps) {
  const { t } = useTranslation()
  const selectedType = form.watch('type')
  const isMenu = selectedType == 'menu'

  return (
    <div className='grid grid-cols-2 gap-4'>
      <FormField
        control={form.control}
        name='name'
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <span className='text-red-500'>*</span>
              {isMenu ? ` ${t('system.menus.form.menuName')}` : ` ${t('system.menus.form.buttonName')}`}
            </FormLabel>
            <FormControl>
              <Input
                placeholder={isMenu ? t('system.menus.form.menuNamePlaceholder') : t('system.menus.form.buttonNamePlaceholder')}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {isMenu && (
        <FormField
          control={form.control}
          name='path'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <span className='text-red-500'>*</span> {t('system.menus.form.routePath')}
              </FormLabel>
              <FormControl>
                <Input placeholder={t('system.menus.form.routePathPlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  )
}
