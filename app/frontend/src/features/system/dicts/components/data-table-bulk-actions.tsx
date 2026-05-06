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
import { CheckCircle, MoreHorizontal, Trash2, XCircle } from 'lucide-react'
import { PERMISSIONS } from '@/constants/permissions'
import { usePermission } from '@/hooks/usePermission'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type DictType } from '../types/dict-types'
import {
  useBulkUpdateDictTypes,
  useDeleteDictTypes,
} from '../hooks/use-dict-types'

interface DataTableBulkActionsProps {
  selectedDictTypes: DictType[]
}

export function DataTableBulkActions({
  selectedDictTypes,
}: DataTableBulkActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { hasPermission } = usePermission()

  const deleteMutation = useDeleteDictTypes()
  const bulkUpdateMutation = useBulkUpdateDictTypes()

  const canEdit = hasPermission(PERMISSIONS.SYSTEM.DICT.EDIT_TYPE)
  const canDelete = hasPermission(PERMISSIONS.SYSTEM.DICT.DELETE_TYPE)

  const handleBulkDelete = async () => {
    const typeIds = selectedDictTypes.map((type) => type.id)
    await deleteMutation.mutateAsync(typeIds)
    setShowDeleteDialog(false)
  }

  const handleBulkStatusUpdate = async (status: 'active' | 'inactive') => {
    const typeIds = selectedDictTypes.map((type) => type.id)
    await bulkUpdateMutation.mutateAsync({ typeIds, status })
  }

  const selectedCount = selectedDictTypes.length

  return (
    <>
      <div className='flex items-center justify-between'>
        <div className='text-muted-foreground flex-1 text-sm'>
          已选择 {selectedCount} 个字典类型
        </div>
        <div className='flex items-center gap-2'>
          {canEdit && (
            <>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handleBulkStatusUpdate('active')}
                disabled={bulkUpdateMutation.isPending}
              >
                <CheckCircle className='mr-2 h-4 w-4' />
                批量启用
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handleBulkStatusUpdate('inactive')}
                disabled={bulkUpdateMutation.isPending}
              >
                <XCircle className='mr-2 h-4 w-4' />
                批量禁用
              </Button>
            </>
          )}
          {canDelete && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className='mr-2 h-4 w-4' />
              批量删除
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {canEdit && (
                <>
                  <DropdownMenuItem
                    onClick={() => handleBulkStatusUpdate('active')}
                  >
                    <CheckCircle className='mr-2 h-4 w-4' />
                    批量启用
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleBulkStatusUpdate('inactive')}
                  >
                    <XCircle className='mr-2 h-4 w-4' />
                    批量禁用
                  </DropdownMenuItem>
                </>
              )}
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className='text-destructive'
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  批量删除
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除选中的 {selectedCount} 个字典类型吗？
              <br />
              删除后这些类型下的所有字典项也将被删除，此操作不可恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={deleteMutation.isPending}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {deleteMutation.isPending ? '删除中...' : '确认删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
