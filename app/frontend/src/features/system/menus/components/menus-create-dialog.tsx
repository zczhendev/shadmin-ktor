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
import type { Menu } from '@/types/menu'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { MenuApiResources } from '@/features/system/menus/components/form-sections/menu-api-resources.tsx'
import { useMenuData } from '../hooks/useMenuData'
import { useMenuForm } from '../hooks/useMenuForm'
import { MenuBasicFields } from './form-sections/menu-basic-fields'
import { MenuBasicInfo } from './form-sections/menu-basic-info'
import { MenuDisplaySettings } from './form-sections/menu-display-settings'
import { MenuFrameSettings } from './form-sections/menu-frame-settings'
import { MenuPermissions } from './form-sections/menu-permissions'
import { MenuStatusSettings } from './form-sections/menu-status-settings'

interface MenusCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  menu?: Menu | null // Optional menu for edit mode
  mode?: 'create' | 'edit' // Dialog mode
}

export function MenusCreateDialog({
  open,
  onOpenChange,
  menu,
  mode = 'create',
}: MenusCreateDialogProps) {
  const { t } = useTranslation()
  const { form, selectedType, isEditMode, isLoading, onSubmit } = useMenuForm({
    menu,
    mode,
    onSuccess: () => onOpenChange(false),
  })
  const { parentMenuOptions } = useMenuData({ open })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[80vh] overflow-y-auto sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>{isEditMode ? t('system.menus.dialogs.editTitle') : t('system.menus.dialogs.createTitle')}</DialogTitle>
          <DialogDescription>
            {isEditMode ? t('system.menus.dialogs.editDesc') : t('system.menus.dialogs.createDesc')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <MenuBasicInfo form={form} parentMenuOptions={parentMenuOptions} />

            <MenuDisplaySettings form={form} />

            <MenuBasicFields form={form} />

            <MenuFrameSettings form={form} />

            <MenuPermissions form={form} selectedType={selectedType} />
            <MenuApiResources form={form} isEditMode={mode === 'edit'} />
            <MenuStatusSettings form={form} />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                {t('system.menus.cancel')}
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isEditMode ? t('system.menus.update') : t('system.menus.confirm')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
