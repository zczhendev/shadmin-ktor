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

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteRole } from '@/services/roleApi'
import type { Role } from '@/types/role'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/error'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface RolesDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roleAssignment: Role | null
}

export function RolesDeleteDialog({
  open,
  onOpenChange,
  roleAssignment,
}: RolesDeleteDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const deleteRoleMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      toast.success(t('system.roles.messages.deleteSuccess'))
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      onOpenChange(false)
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, t('system.roles.messages.deleteFailed')))
    },
  })

  const handleDelete = () => {
    if (roleAssignment) {
      deleteRoleMutation.mutate(roleAssignment.id)
    }
  }

  if (!roleAssignment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('system.roles.dialogs.deleteTitle')}</DialogTitle>
          <DialogDescription>
            {t('system.roles.messages.deleteConfirm', { name: roleAssignment.name })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={deleteRoleMutation.isPending}
          >
            {t('common.buttons.cancel')}
          </Button>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={deleteRoleMutation.isPending}
          >
            {deleteRoleMutation.isPending ? t('system.roles.dialogs.deleting') : t('system.roles.dialogs.deleteTitle')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
