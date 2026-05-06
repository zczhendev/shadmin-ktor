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
import { type Table } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { Mail, Trash2, UserCheck, UserX } from 'lucide-react'
import { PERMISSIONS } from '@/constants/permissions'
import { usePermission } from '@/hooks/usePermission'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type User } from '../types/user-types'
import { useBulkUpdateUsers } from '../hooks/use-users'
import { UsersMultiDeleteDialog } from './users-multi-delete-dialog'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const { t } = useTranslation()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const bulkUpdateUsers = useBulkUpdateUsers()
  const { hasPermission } = usePermission()

  const canInvite = hasPermission(PERMISSIONS.SYSTEM.USER.INVITE)
  const canEdit = hasPermission(PERMISSIONS.SYSTEM.USER.EDIT)
  const canDelete = hasPermission(PERMISSIONS.SYSTEM.USER.DELETE)

  const handleBulkStatusChange = async (status: 'active' | 'inactive') => {
    const selectedUsers = selectedRows.map((row) => row.original as User)
    const userIds = selectedUsers.map((user) => user.id)

    try {
      await bulkUpdateUsers.mutateAsync({ userIds, status })
      table.resetRowSelection()
    } catch (error) {
      // Error handling is done in the hook
      console.error('Error updating user status:', error)
    }
  }

  const handleBulkInvite = () => {
    // This would require a bulk invite API endpoint
    // For now, keeping the mock implementation
    const selectedUsers = selectedRows.map((row) => row.original as User)
    console.log('Bulk invite not yet implemented for:', selectedUsers)
    // TODO: Implement bulk invite API
    table.resetRowSelection()
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='user'>
        {canInvite && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                size='icon'
                onClick={handleBulkInvite}
                className='size-8'
                aria-label={t('system.users.bulk.inviteSelected')}
                title={t('system.users.bulk.inviteSelected')}
              >
                <Mail />
                <span className='sr-only'>{t('system.users.bulk.inviteSelected')}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('system.users.bulk.inviteSelected')}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {canEdit && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                size='icon'
                onClick={() => handleBulkStatusChange('active')}
                className='size-8'
                disabled={bulkUpdateUsers.isPending}
                aria-label={t('system.users.bulk.activateSelected')}
                title={t('system.users.bulk.activateSelected')}
              >
                <UserCheck />
                <span className='sr-only'>{t('system.users.bulk.activateSelected')}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('system.users.bulk.activateSelected')}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {canEdit && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                size='icon'
                onClick={() => handleBulkStatusChange('inactive')}
                className='size-8'
                disabled={bulkUpdateUsers.isPending}
                aria-label={t('system.users.bulk.deactivateSelected')}
                title={t('system.users.bulk.deactivateSelected')}
              >
                <UserX />
                <span className='sr-only'>{t('system.users.bulk.deactivateSelected')}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('system.users.bulk.deactivateSelected')}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {canDelete && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='destructive'
                size='icon'
                onClick={() => setShowDeleteConfirm(true)}
                className='size-8'
                aria-label={t('system.users.bulk.deleteSelected')}
                title={t('system.users.bulk.deleteSelected')}
              >
                <Trash2 />
                <span className='sr-only'>{t('system.users.bulk.deleteSelected')}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('system.users.bulk.deleteSelected')}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </BulkActionsToolbar>

      {canDelete && (
        <UsersMultiDeleteDialog
          table={table}
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
        />
      )}
    </>
  )
}
