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

import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ConfirmDialog } from '@/components/confirm-dialog'
// import type { ApiResource } from '@/types/api-resource'
import { useApiResourcesContext } from './api-resources-provider'
import { useDeleteApiResource } from '../hooks/use-api-resource-mutations'

export function ApiResourcesDeleteDialog() {
  const { open, setOpen, currentRow } = useApiResourcesContext()
  const deleteMutation = useDeleteApiResource()

  const isOpen = open === 'delete' && currentRow !== null

  const handleDelete = async () => {
    if (!currentRow) return
    await deleteMutation.mutateAsync(currentRow.id)
    setOpen(null)
  }

  if (!currentRow) return null

  return (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) setOpen(null)
      }}
      handleConfirm={handleDelete}
      disabled={deleteMutation.isPending}
      confirmText={deleteMutation.isPending ? '删除中...' : '删除'}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          删除API资源
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            您确定要删除API资源{' '}
            <span className='font-bold'>
              {currentRow.method} {currentRow.path}
            </span>{' '}
            吗？
            <br />
            此操作将永久从系统中删除该API资源。此操作不可撤销。
          </p>
          <Alert variant='destructive'>
            <AlertTitle>警告！</AlertTitle>
            <AlertDescription>请谨慎操作，此操作不可回滚。</AlertDescription>
          </Alert>
        </div>
      }
      destructive
    />
  )
}
