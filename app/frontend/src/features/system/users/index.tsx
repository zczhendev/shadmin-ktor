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

import { getRouteApi } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type { NavigateFn } from '@/hooks/use-table-url-state'
import { PageShell, PageHeader, PageContent } from '@/components/page-shell'
import { PageLoading, PageError } from '@/components/page-status'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider } from './components/users-provider'
import { UsersTable } from './components/users-table'
import { useUsers } from './hooks/use-users'

const route = getRouteApi('/_authenticated/system/user')

export function Users() {
  const { t } = useTranslation()
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const queryParams = {
    page: search.page || 1,
    page_size: search.pageSize || 10,
    search: search.username || undefined,
    status: search.status
      ? Array.isArray(search.status)
        ? search.status.join(',')
        : search.status
      : undefined,
  }

  const { data: usersData, isLoading, error } = useUsers(queryParams)

  const navigateWrapper: NavigateFn = ({ search: searchUpdate, replace }) => {
    navigate({ search: searchUpdate, replace })
  }

  return (
    <UsersProvider>
      <PageShell>
        <PageHeader
          title={t('system.users.title')}
          description={t('system.users.description')}
        >
          <UsersPrimaryButtons />
        </PageHeader>

        <PageContent>
          {isLoading ? (
            <PageLoading />
          ) : error ? (
            <PageError message={t('system.users.page.loadError')} />
          ) : (
            <UsersTable
              data={usersData?.list || []}
              search={search}
              navigate={navigateWrapper}
              totalCount={usersData?.total || 0}
            />
          )}
        </PageContent>
      </PageShell>

      <UsersDialogs />
    </UsersProvider>
  )
}
