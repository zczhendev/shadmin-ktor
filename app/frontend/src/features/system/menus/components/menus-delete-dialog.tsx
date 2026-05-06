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
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { menuService } from '@/services/menu-service'
import { deleteMenu } from '@/services/menuApi'
import type { Menu } from '@/types/menu'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/error'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface MenusDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  menu: Menu | null
}

export function MenusDeleteDialog({
  open,
  onOpenChange,
  menu,
}: MenusDeleteDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const deleteMenuMutation = useMutation({
    mutationFn: deleteMenu,
    onSuccess: () => {
      toast.success(t('system.menus.dialogs.deleteSuccess'))
      // Invalidate all menu-related queries to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['menu-tree'] })
      queryClient.invalidateQueries({ queryKey: ['menus'] })
      queryClient.invalidateQueries({ queryKey: ['parent-menus'] })
      // Clear sidebar menu cache to refresh navigation menu
      menuService.clearCache()
      onOpenChange(false)
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, t('system.menus.dialogs.deleteFailed')))
    },
  })

  const handleDelete = () => {
    if (menu) {
      deleteMenuMutation.mutate(menu.id)
    }
  }

  if (!menu) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('system.menus.dialogs.deleteTitle')}</DialogTitle>
          <DialogDescription>
            {t('system.menus.dialogs.deleteDesc', { name: menu.name })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={deleteMenuMutation.isPending}
          >
            {t('system.menus.cancel')}
          </Button>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={deleteMenuMutation.isPending}
          >
            {deleteMenuMutation.isPending ? t('system.menus.dialogs.deleting') : t('system.menus.dialogs.deleteTitle')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
