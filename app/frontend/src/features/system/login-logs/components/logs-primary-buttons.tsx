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

import { RefreshCw, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  useClearAllLoginLogs,
  useRefreshLoginLogs,
} from '../hooks/use-login-logs'

export function LogsPrimaryButtons() {
  const { t } = useTranslation()
  const { hasPermission } = usePermission()
  const clearAllMutation = useClearAllLoginLogs()
  const refreshLogs = useRefreshLoginLogs()

  const canCleanLogs = hasPermission(PERMISSIONS.SYSTEM.LOGIN_LOGS.CLEAN)

  const handleRefresh = () => {
    refreshLogs()
    toast.success(t('system.loginLogs.messages.refreshSuccess'))
  }

  const handleClearAll = () => {
    clearAllMutation.mutate()
  }

  return (
    <div className='flex gap-2'>
      <Button variant='outline' onClick={handleRefresh}>
        <RefreshCw className='h-4 w-4' />
        {t('system.loginLogs.actions.refresh')}
      </Button>

      {canCleanLogs && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant='destructive'
              disabled={clearAllMutation.isPending}
            >
              <Trash2 className='h-4 w-4' />
              {t('system.loginLogs.actions.clearAll')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('system.loginLogs.dialogs.clearTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('system.loginLogs.dialogs.clearDesc')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.buttons.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClearAll}
                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              >
                {t('system.loginLogs.dialogs.confirmClear')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
