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
import { Plus } from 'lucide-react'
import { type NavigateFn } from '@/hooks/use-table-url-state'
import { Button } from '@/components/ui/button'
import { PageShell, PageHeader, PageContent } from '@/components/page-shell'
import { PageLoading, PageError } from '@/components/page-status'
import {
  ApiResourcesProvider,
  useApiResourcesContext,
} from './components/api-resources-provider'
import { ApiResourcesTable } from './components/api-resources-table'
import { ApiResourcesDialogs } from './components/api-resources-dialogs'
import { ApiResourcesDeleteDialog } from './components/api-resources-delete-dialog'
import { useApiResources } from './hooks/use-api-resources'

const route = getRouteApi('/_authenticated/system/api-resources')

function ApiResourcesContent() {
  const { t } = useTranslation()
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { setOpen } = useApiResourcesContext()

  // Extract query parameters from URL search
  const queryParams = {
    page: search.page || 1,
    page_size: search.page_size || 10,
    module: search.module
      ? Array.isArray(search.module)
        ? search.module.join(',')
        : search.module
      : undefined,
    method: search.method || undefined,
    path: search.path || undefined,
  }

  // Use regular hook with forced refresh on parameter changes
  const {
    data: apiResourcesData,
    isLoading,
    isFetching,
    error,
  } = useApiResources(queryParams)

  // Create a wrapper function to match NavigateFn type
  const navigateWrapper: NavigateFn = ({ search: searchUpdate, replace }) => {
    navigate({ search: searchUpdate, replace })
  }

  // Reset function to clear all filters and reset to defaults
  const handleReset = () => {
    // Use window.location to force a complete navigation refresh
    window.location.href = '/system/api-resources'
  }

  return (
    <>
      <PageShell>
        <PageHeader
          title={t('system.apiResources.title')}
          description={t('system.apiResources.description')}
        >
          <Button onClick={() => setOpen('create')}>
            <Plus className='h-4 w-4' />
            {t('system.apiResources.actions.create')}
          </Button>
        </PageHeader>

        <PageContent>
          {isLoading && !apiResourcesData ? (
            <PageLoading />
          ) : error ? (
            <PageError message={t('system.apiResources.messages.loadFailed')} />
          ) : (
            <div className='relative'>
              {isFetching && (
                <div className='absolute top-0 right-0 z-10'>
                  <div className='bg-background/80 text-muted-foreground rounded-md border px-2 py-1 text-xs backdrop-blur-sm'>
                    {t('system.apiResources.messages.updating')}
                  </div>
                </div>
              )}
              <ApiResourcesTable
                data={apiResourcesData?.data || []}
                search={search}
                navigate={navigateWrapper}
                totalCount={apiResourcesData?.total || 0}
                onReset={handleReset}
              />
            </div>
          )}
        </PageContent>
      </PageShell>

      <ApiResourcesDialogs />
      <ApiResourcesDeleteDialog />
    </>
  )
}

export function ApiResources() {
  return (
    <ApiResourcesProvider>
      <ApiResourcesContent />
    </ApiResourcesProvider>
  )
}
