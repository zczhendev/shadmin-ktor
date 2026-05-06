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
import { type Table } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type User } from '../types/user-types'
import { useDeleteUsers } from '../hooks/use-users'

type UserMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
}

const CONFIRM_WORD = '删除'

export function UsersMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: UserMultiDeleteDialogProps<TData>) {
  const { t } = useTranslation()
  const [value, setValue] = useState('')
  const deleteUsers = useDeleteUsers()

  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleDelete = async () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(t('system.users.dialogs.multiDeleteInputError', { word: CONFIRM_WORD }))
      return
    }

    try {
      // Extract user IDs from selected rows
      const userIds = selectedRows.map((row) => (row.original as User).id)

      await deleteUsers.mutateAsync(userIds)

      table.resetRowSelection()
      onOpenChange(false)
      setValue('') // Reset input
    } catch (error) {
      // Error handling is done in the hook
      console.error('Error deleting users:', error)
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
      disabled={value.trim() !== CONFIRM_WORD || deleteUsers.isPending}
      confirmText={deleteUsers.isPending ? t('system.users.dialogs.deleting') : t('common.buttons.delete')}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          {t('system.users.dialogs.multiDeleteTitle', { count: selectedRows.length })}
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            {t('system.users.dialogs.multiDeleteConfirm')}
          </p>

          <Label className='my-4 flex flex-col items-start gap-1.5'>
            <span className=''>{t('system.users.dialogs.multiDeleteInputLabel', { word: CONFIRM_WORD })}</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t('system.users.dialogs.multiDeleteInputPlaceholder', { word: CONFIRM_WORD })}
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
