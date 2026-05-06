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
import { PageShell, PageHeader, PageContent } from '@/components/page-shell'
import { PageLoading, PageError } from '@/components/page-status'
import { RolesDialogs } from './components/roles-dialogs'
import { RolesPrimaryButtons } from './components/roles-primary-buttons'
import { RolesProvider } from './components/roles-provider'
import { RolesTable } from './components/roles-table'
import { useRoles } from './hooks/use-roles'

const route = getRouteApi('/_authenticated/system/role')

export function Roles() {
  const { t } = useTranslation()
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const queryParams = {
    page: search.page || 1,
    page_size: search.page_size || 10,
  }

  const { data: rolesData, isLoading, error } = useRoles(queryParams)

  const navigateWrapper = (opts: Record<string, unknown>) => {
    navigate(opts)
  }

  return (
    <RolesProvider>
      <PageShell>
        <PageHeader
          title={t('system.roles.title')}
          description={t('system.roles.description')}
        >
          <RolesPrimaryButtons />
        </PageHeader>

        <PageContent>
          {isLoading ? (
            <PageLoading />
          ) : error ? (
            <PageError message={t('system.roles.messages.loadFailed')} />
          ) : (
            <RolesTable
              data={rolesData?.list || []}
              search={search}
              navigate={navigateWrapper}
              totalCount={rolesData?.total || 0}
            />
          )}
        </PageContent>
      </PageShell>

      <RolesDialogs />
    </RolesProvider>
  )
}
