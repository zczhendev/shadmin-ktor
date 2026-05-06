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

import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PERMISSIONS } from '@/constants/permissions'
import { usePermission } from '@/hooks/usePermission'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDicts } from './dicts-provider'
import { ItemsTable } from './items-table'

export function ItemsListDialog() {
  const { t } = useTranslation()
  const {
    selectedType,
    showItemsListDialog,
    setShowItemsListDialog,
    setShowItemCreateDialog,
  } = useDicts()
  const { hasPermission } = usePermission()

  const canAddItem = hasPermission(PERMISSIONS.SYSTEM.DICT.ADD_ITEM)

  return (
    <Dialog open={showItemsListDialog} onOpenChange={setShowItemsListDialog}>
      <DialogContent className='max-w-4xl'>
        <DialogHeader>
          <DialogTitle>
            {t('system.dicts.items.listTitle')}
            {selectedType
              ? t('system.dicts.items.listTitleSuffix', { name: selectedType.name, code: selectedType.code })
              : ''}
          </DialogTitle>
        </DialogHeader>
        <div className='mb-2 flex items-center justify-between'>
          <div className='text-muted-foreground text-sm'>
            {selectedType ? t('system.dicts.items.listHint') : t('system.dicts.items.selectTypeHint')}
          </div>
          {canAddItem && (
            <Button
              size='sm'
              onClick={() => setShowItemCreateDialog(true)}
            >
              <Plus className='h-4 w-4' />
              {t('system.dicts.items.createItem')}
            </Button>
          )}
        </div>
        <div className='max-h-[60vh] overflow-auto'>
          <ItemsTable />
        </div>
      </DialogContent>
    </Dialog>
  )
}
