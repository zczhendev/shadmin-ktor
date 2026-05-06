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
import { DictTypesTable } from './components/dict-types-table'
import { DictsDialogs } from './components/dicts-dialogs'
import { DictsPrimaryButtons } from './components/dicts-primary-buttons'
import { DictsProvider } from './components/dicts-provider'
import { useDictTypes } from './hooks/use-dict-types'

const route = getRouteApi('/_authenticated/system/dict')

export function Dicts() {
  const { t } = useTranslation()
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const queryParams = {
    page: search.page || 1,
    page_size: search.page_size || 10,
    search: search.search || undefined,
    status: search.status || undefined,
  }

  const { data: dictTypesData, isLoading, error } = useDictTypes(queryParams)

  const navigateWrapper: NavigateFn = ({ search: searchUpdate, replace }) => {
    navigate({ search: searchUpdate, replace })
  }

  return (
    <DictsProvider>
      <PageShell>
        <PageHeader
          title={t('system.dicts.title')}
          description={t('system.dicts.description')}
        >
          <DictsPrimaryButtons />
        </PageHeader>

        <PageContent>
          {isLoading ? (
            <PageLoading />
          ) : error ? (
            <PageError message={t('system.dicts.messages.loadFailed')} />
          ) : (
            <div className='grid grid-cols-1 gap-6'>
              <div>
                <DictTypesTable
                  data={dictTypesData?.list || []}
                  search={search}
                  navigate={navigateWrapper}
                  totalCount={dictTypesData?.total || 0}
                />
              </div>
            </div>
          )}
        </PageContent>
      </PageShell>

      <DictsDialogs />
    </DictsProvider>
  )
}
