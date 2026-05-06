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

'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type User } from '../types/user-types'
import { useDeleteUser } from '../hooks/use-users'

type UserDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

export function UsersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: UserDeleteDialogProps) {
  const { t } = useTranslation()
  const [value, setValue] = useState('')
  const deleteUser = useDeleteUser()

  const handleDelete = async () => {
    if (value.trim() !== currentRow.username) return

    try {
      await deleteUser.mutateAsync(currentRow.id)
      onOpenChange(false)
      setValue('') // Reset input
    } catch (error) {
      // Error handling is done in the hook
      console.error('Error deleting user:', error)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) setValue('') // Reset input when dialog closes
      }}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.username || deleteUser.isPending}
      confirmText={deleteUser.isPending ? t('system.users.dialogs.deleting') : t('common.buttons.delete')}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          {t('system.users.dialogs.deleteTitle')}
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            {t('system.users.dialogs.deleteConfirm', { username: currentRow.username })}
          </p>

          <Label className='my-2'>
            {t('system.users.dialogs.usernameLabel')}
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t('system.users.dialogs.deleteInputPlaceholder')}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>{t('system.users.dialogs.warning')}</AlertTitle>
            <AlertDescription>{t('system.users.dialogs.warningDesc')}</AlertDescription>
          </Alert>
        </div>
      }
      destructive
    />
  )
}
