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
import { PageShell, PageHeader, PageContent } from '@/components/page-shell'
import { MenusDialogs } from './components/menus-dialogs'
import { MenusPrimaryButtons } from './components/menus-primary-buttons'
import { MenusProvider, useMenus } from './components/menus-provider'
import { MenusTable } from './components/menus-table'

function MenusContent() {
  const { t } = useTranslation()
  const { setCurrentRow } = useMenus()

  const handleMenuSelect = (menu: Menu) => {
    setCurrentRow(menu)
    console.log('Selected menu:', menu)
  }

  return (
    <>
      <PageHeader
        title={t('system.menus.title')}
        description={t('system.menus.description')}
      >
        <MenusPrimaryButtons />
      </PageHeader>

      <PageContent>
        <MenusTable onMenuSelect={handleMenuSelect} />
      </PageContent>

      <MenusDialogs />
    </>
  )
}

export function Menus() {
  return (
    <MenusProvider>
      <PageShell>
        <MenusContent />
      </PageShell>
    </MenusProvider>
  )
}
