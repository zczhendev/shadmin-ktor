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

import { type UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { Role } from '@/types/role'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { MultiSelectDropdown } from '@/components/multi-select-dropdown'
import { PasswordInput } from '@/components/password-input'
import { SelectDropdown } from '@/components/select-dropdown'
import { statusOptions, type UserFormData } from '../schemas/user-form-schema'

interface UserFormFieldsProps {
  form: UseFormReturn<UserFormData>
  isEdit: boolean
  isPasswordTouched: boolean
  allRoles?: Role[]
}

export function UserFormFields({
  form,
  isPasswordTouched,
  allRoles = [],
}: UserFormFieldsProps) {
  const { t } = useTranslation()
  return (
    <>
      <FormField
        control={form.control}
        name='username'
        render={({ field }) => (
          <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
            <FormLabel className='col-span-2 text-end'>{t('system.users.form.username')}</FormLabel>
            <FormControl>
              <Input placeholder={t('system.users.form.usernamePlaceholder')} className='col-span-4' {...field} />
            </FormControl>
            <FormMessage className='col-span-4 col-start-3' />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='email'
        render={({ field }) => (
          <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
            <FormLabel className='col-span-2 text-end'>{t('system.users.form.email')}</FormLabel>
            <FormControl>
              <Input
                placeholder={t('system.users.form.emailPlaceholder')}
                className='col-span-4'
                {...field}
              />
            </FormControl>
            <FormMessage className='col-span-4 col-start-3' />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='phone'
        render={({ field }) => (
          <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
            <FormLabel className='col-span-2 text-end'>{t('system.users.form.phone')}</FormLabel>
            <FormControl>
              <Input
                placeholder={t('system.users.form.phonePlaceholder')}
                className='col-span-4'
                {...field}
              />
            </FormControl>
            <FormMessage className='col-span-4 col-start-3' />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='status'
        render={({ field }) => (
          <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
            <FormLabel className='col-span-2 text-end'>{t('system.users.form.status')}</FormLabel>
            <SelectDropdown
              defaultValue={field.value}
              onValueChange={field.onChange}
              placeholder={t('system.users.form.statusPlaceholder')}
              className='col-span-4'
              items={[...statusOptions]}
            />
            <FormMessage className='col-span-4 col-start-3' />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='password'
        render={({ field }) => (
          <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
            <FormLabel className='col-span-2 text-end'>{t('system.users.form.password')}</FormLabel>
            <FormControl>
              <PasswordInput
                placeholder={t('system.users.form.passwordPlaceholder')}
                className='col-span-4'
                {...field}
              />
            </FormControl>
            <FormMessage className='col-span-4 col-start-3' />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='confirmPassword'
        render={({ field }) => (
          <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
            <FormLabel className='col-span-2 text-end'>{t('system.users.form.confirmPassword')}</FormLabel>
            <FormControl>
              <PasswordInput
                disabled={!isPasswordTouched}
                placeholder={t('system.users.form.passwordPlaceholder')}
                className='col-span-4'
                {...field}
              />
            </FormControl>
            <FormMessage className='col-span-4 col-start-3' />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='roles'
        render={({ field }) => {
          const selectedRoles = field.value || []

          const handleRoleChange = (roleIds: string[]) => {
            const roleNames = roleIds.map((id) => {
              const role = allRoles.find((r) => r.id === id)
              return role?.name || id
            })
            field.onChange(roleNames)
          }

          const selectedRoleIds = selectedRoles.map((roleName: string) => {
            const role = allRoles.find((r) => r.name === roleName)
            return role?.id || roleName
          })

          const roleItems = allRoles.map((role) => ({
            label: role.name,
            value: role.id,
          }))

          return (
            <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
              <FormLabel className='col-span-2 text-end'>{t('system.users.form.roles')}</FormLabel>
              <FormControl>
                <MultiSelectDropdown
                  value={selectedRoleIds}
                  onValueChange={handleRoleChange}
                  items={roleItems}
                  placeholder={t('system.users.form.rolesPlaceholder')}
                  className='col-span-4'
                />
              </FormControl>
              <FormMessage className='col-span-4 col-start-3' />
            </FormItem>
          )
        }}
      />
    </>
  )
}
