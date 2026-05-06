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

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ApiResource } from '@/types/api-resource'
import { ChevronDown, Filter } from 'lucide-react'
import { createPortal } from 'react-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  METHOD_COLORS,
  METHOD_OPTIONS,
} from '@/features/system/api-resources/constants/api-constants'

interface ApiResourceSelectorProps {
  apiResources: ApiResource[]
  isLoading: boolean
  selectedApiResources: string[]
  onResourceSelect: (resource: ApiResource, checked: boolean) => void
  isResourceSelected: (resource: ApiResource) => boolean
}

export function ApiResourceSelector({
  apiResources,
  isLoading,
  selectedApiResources,
  onResourceSelect,
  isResourceSelected,
}: ApiResourceSelectorProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL')

  const checkIsResourceSelected = (resource: ApiResource) => {
    const methodPathFormat = `${resource.method}:${resource.path}`
    return (
      selectedApiResources.includes(resource.id) ||
      selectedApiResources.includes(methodPathFormat) ||
      isResourceSelected(resource)
    )
  }

  const filteredApiResources = apiResources.filter(
    (resource) => selectedMethod === 'ALL' || resource.method === selectedMethod
  )

  const groupedApiResources = filteredApiResources.reduce(
    (acc, resource) => {
      const module = resource.module || t('system.menus.apiResources.other')
      if (!acc[module]) {
        acc[module] = []
      }
      acc[module].push(resource)
      return acc
    },
    {} as Record<string, ApiResource[]>
  )

  return (
    <>
      <Button
        type='button'
        variant='outline'
        size='sm'
        disabled={isLoading}
        onClick={() => setOpen(true)}
      >
        {isLoading ? t('common.buttons.loading') : t('system.menus.apiResources.select')}
      </Button>

      {typeof window !== 'undefined' &&
        createPortal(
          <CommandDialog open={open} onOpenChange={setOpen}>
            <div className='p-4'>
              <CommandInput placeholder={t('system.menus.apiResources.searchPlaceholder')} className='w-full' />
            </div>
            <div className='flex items-center justify-start p-3'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    className='flex h-8 items-center space-x-1'
                  >
                    <Filter className='h-4 w-4' />
                    <Badge
                      className={`text-xs ${selectedMethod === 'ALL' ? 'bg-gray-100 text-gray-800' : METHOD_COLORS[selectedMethod as keyof typeof METHOD_COLORS]}`}
                    >
                      {selectedMethod === 'ALL' ? t('system.menus.apiResources.all') : selectedMethod}
                    </Badge>
                    <ChevronDown className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='start' className='w-[200px]'>
                  <DropdownMenuItem
                    onClick={() => setSelectedMethod('ALL')}
                    className={selectedMethod === 'ALL' ? 'bg-accent' : ''}
                  >
                    <Badge className='bg-gray-100 text-xs text-gray-800'>
                      {t('system.menus.apiResources.all')}
                    </Badge>
                  </DropdownMenuItem>
                  {METHOD_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setSelectedMethod(option.value)}
                      className={
                        selectedMethod === option.value ? 'bg-accent' : ''
                      }
                    >
                      <Badge
                        className={`text-xs ${METHOD_COLORS[option.value as keyof typeof METHOD_COLORS]}`}
                      >
                        {option.label}
                      </Badge>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CommandList>
              <CommandEmpty>{t('system.menus.apiResources.noResults')}</CommandEmpty>
              {Object.entries(groupedApiResources).map(
                ([module, moduleResources]) => (
                  <CommandGroup key={module} heading={module}>
                    {moduleResources.map((resource) => (
                        <CommandItem
                          key={resource.id}
                          value={`${resource.path} ${resource.method} ${module}`}
                          className='flex cursor-pointer items-start space-x-2 p-3'
                          onSelect={() => {
                            // Prevent default command item behavior
                          }}
                        >
                          <Checkbox
                            className='h-5 w-5'
                            checked={checkIsResourceSelected(resource)}
                            onCheckedChange={(checked) => {
                              onResourceSelect(resource, !!checked)
                            }}
                          />
                          <div className='flex-1 space-y-1'>
                            <div className='flex items-center space-x-2'>
                              <span className='text-sm font-medium'>
                                {resource.path}
                              </span>
                              <Badge
                                className={`text-xs ${METHOD_COLORS[resource.method as keyof typeof METHOD_COLORS] || 'bg-gray-100 text-gray-800'}`}
                              >
                                {resource.method}
                              </Badge>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                )
              )}
            </CommandList>
          </CommandDialog>,
          document.body
        )}
    </>
  )
}
