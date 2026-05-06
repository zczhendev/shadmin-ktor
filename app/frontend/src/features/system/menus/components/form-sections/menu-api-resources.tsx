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

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { UseFormReturn } from 'react-hook-form'
import type { ApiResource } from '@/types/api-resource'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { METHOD_COLORS } from '@/features/system/api-resources/constants/api-constants'
import { useApiResources } from '@/features/system/api-resources/hooks/use-api-resources'
import type { CreateMenuFormData } from '../../schemas/menu-form-schema'
import { useMenus } from '../menus-provider'
import { ApiResourceSelector } from './api-resource-selector'

interface MenuApiResourcesProps {
  form: UseFormReturn<CreateMenuFormData>
  isEditMode?: boolean
}

export function MenuApiResources({
  form,
  isEditMode = false,
}: MenuApiResourcesProps) {
  const { t } = useTranslation()
  const { currentRow } = useMenus()
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  useEffect(() => {
    const formApiResources = form.getValues('apiResources')

    const currentRowApiResources = isEditMode ? currentRow?.apiResources : []

    const existingResources = formApiResources?.length
      ? formApiResources
      : currentRowApiResources

    if (existingResources && existingResources.length > 0) {
      setSelectedPermissions(existingResources)
    } else if (!isEditMode) {
      setSelectedPermissions([])
    }
  }, [form, currentRow, isEditMode])

  useEffect(() => {
    form.setValue('apiResources', selectedPermissions, {
      shouldDirty: false,
      shouldValidate: false,
    })
  }, [selectedPermissions, form])

  const { data: apiResourcesResult, isLoading } = useApiResources({
    page: 1,
    page_size: 1000,
  })
  const apiResources = apiResourcesResult?.data || []

  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    setSelectedPermissions((prev) => {
      if (checked) {
        return prev.includes(permissionId) ? prev : [...prev, permissionId]
      }
      return prev.filter((id) => id !== permissionId)
    })
  }

  const handleResourceSelect = (resource: ApiResource, checked: boolean) => {
    const resourceIdentifier = `${resource.method}:${resource.path}`
    handlePermissionToggle(resourceIdentifier, checked)
  }

  const isResourceSelected = (resource: ApiResource) => {
    const methodPathFormat = `${resource.method}:${resource.path}`
    return (
      selectedPermissions.includes(resource.id) ||
      selectedPermissions.includes(methodPathFormat)
    )
  }

  const handleRemovePermission = (permissionId: string) => {
    setSelectedPermissions((prev) => prev.filter((id) => id !== permissionId))
  }

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <div className='text-sm font-medium'>
          {t('system.menus.apiResources.title')}{' '}
          {selectedPermissions.length > 0 && `(${selectedPermissions.length})`}
        </div>
        <ApiResourceSelector
          apiResources={apiResources}
          isLoading={isLoading}
          selectedApiResources={selectedPermissions}
          onResourceSelect={handleResourceSelect}
          isResourceSelected={isResourceSelected}
        />
      </div>

      {selectedPermissions.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {selectedPermissions.map((resourceId) => {
            const matchingResource = apiResources.find((resource) => {
              if (resource.id === resourceId) return true
              const methodPathFormat = `${resource.method}:${resource.path}`
              if (methodPathFormat === resourceId) return true
              return false
            })

            return matchingResource ? (
              <Badge
                key={resourceId}
                variant='secondary'
                className='flex items-center space-x-1 pr-1'
              >
                <Badge
                  className={`mr-1 text-xs ${METHOD_COLORS[matchingResource.method as keyof typeof METHOD_COLORS] || 'bg-gray-100 text-gray-800'}`}
                >
                  {matchingResource.method}
                </Badge>
                <span>{matchingResource.path}</span>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-auto w-auto p-0.5 hover:bg-transparent'
                  onClick={() => handleRemovePermission(resourceId)}
                >
                  <X className='h-3 w-3' />
                </Button>
              </Badge>
            ) : (
              <Badge
                key={resourceId}
                variant='outline'
                className='text-muted-foreground flex items-center space-x-1 pr-1'
              >
                <span>{resourceId}</span>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-auto w-auto p-0.5 hover:bg-transparent'
                  onClick={() => handleRemovePermission(resourceId)}
                >
                  <X className='h-3 w-3' />
                </Button>
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}
