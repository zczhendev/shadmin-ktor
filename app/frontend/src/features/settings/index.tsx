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

import { Outlet } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Palette, UserCog, Wrench } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { PageShell, PageHeader } from '@/components/page-shell'
import { SidebarNav } from './components/sidebar-nav'

export function Settings() {
  const { t } = useTranslation()

  const sidebarNavItems = [
    {
      title: t('settings.profile.title'),
      href: '/settings',
      icon: <UserCog size={18} />,
    },
    {
      title: t('settings.account.title'),
      href: '/settings/account',
      icon: <Wrench size={18} />,
    },
    {
      title: t('settings.appearance.title'),
      href: '/settings/appearance',
      icon: <Palette size={18} />,
    },
  ]

  return (
    <PageShell>
      <PageHeader
        title={t('settings.title')}
        description={t('settings.description')}
      />
      <Separator className='my-4 lg:my-6' />
      <div className='flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12'>
        <aside className='top-0 lg:sticky lg:w-1/5'>
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className='flex w-full overflow-y-hidden p-1'>
          <Outlet />
        </div>
      </div>
    </PageShell>
  )
}
