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

import { z } from 'zod'
import i18n from '@/i18n'

const passwordValidation = {
  minLength: (password: string, isEdit: boolean) => {
    if (isEdit && !password) return true
    return password.length >= 8
  },
  hasLowercase: (password: string, isEdit: boolean) => {
    if (isEdit && !password) return true
    return /[a-z]/.test(password)
  },
  hasNumber: (password: string, isEdit: boolean) => {
    if (isEdit && !password) return true
    return /\d/.test(password)
  },
  isRequired: (password: string, isEdit: boolean) => {
    if (isEdit && !password) return true
    return password.length > 0
  },
  matchesConfirm: (
    password: string,
    confirmPassword: string,
    isEdit: boolean
  ) => {
    if (isEdit && !password) return true
    return password === confirmPassword
  },
}

export const userFormSchema = z
  .object({
    username: z.string().min(1, i18n.t('system.users.validation.usernameRequired')),
    email: z.email({
      error: (iss) => (iss.input === '' ? i18n.t('system.users.validation.emailRequired') : undefined),
    }),
    phone: z.string().optional(),
    password: z.string().transform((pwd) => pwd.trim()),
    confirmPassword: z.string().transform((pwd) => pwd.trim()),
    status: z.string().min(1, i18n.t('system.users.validation.statusRequired')),
    roles: z.array(z.string()),
    isEdit: z.boolean(),
  })
  .refine((data) => passwordValidation.isRequired(data.password, data.isEdit), {
    message: i18n.t('system.users.validation.passwordRequired'),
    path: ['password'],
  })
  .refine(
    ({ password, isEdit }) => passwordValidation.minLength(password, isEdit),
    {
      message: i18n.t('system.users.validation.passwordMinLength'),
      path: ['password'],
    }
  )
  .refine(
    ({ password, isEdit }) => passwordValidation.hasLowercase(password, isEdit),
    {
      message: i18n.t('system.users.validation.passwordLowercase'),
      path: ['password'],
    }
  )
  .refine(
    ({ password, isEdit }) => passwordValidation.hasNumber(password, isEdit),
    {
      message: i18n.t('system.users.validation.passwordNumber'),
      path: ['password'],
    }
  )
  .refine(
    ({ password, confirmPassword, isEdit }) =>
      passwordValidation.matchesConfirm(password, confirmPassword, isEdit),
    {
      message: i18n.t('system.users.validation.passwordMismatch'),
      path: ['confirmPassword'],
    }
  )

export type UserFormData = z.infer<typeof userFormSchema>

export const statusOptions = [
  { label: i18n.t('system.users.form.statusActive'), value: 'active' },
  { label: i18n.t('system.users.form.statusInactive'), value: 'inactive' },
  { label: i18n.t('system.users.form.statusInvited'), value: 'invited' },
  { label: i18n.t('system.users.form.statusSuspended'), value: 'suspended' },
] as const
