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

import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  getDictItemsByTypeId,
  setDictItemAsDefault,
  toggleDictItemStatus,
} from '@/services/dictApi'
import type { DictItem } from '@/types/dict'
import { Edit, MoreHorizontal, Star, StarOff, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PERMISSIONS } from '@/constants/permissions'
import { usePermission } from '@/hooks/usePermission'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDicts } from './dicts-provider'

interface ItemsTableProps {
  search?: Record<string, unknown>
  navigate?: (opts: Record<string, unknown>) => void
}

export function ItemsTable(_props: ItemsTableProps) {
  const { t } = useTranslation()
  const {
    selectedType,
    setCurrentItemRow,
    setShowItemEditDialog,
    setShowItemDeleteDialog,
    refreshItems,
    setRefreshItems,
  } = useDicts()
  const { hasPermission } = usePermission()

  const canEdit = hasPermission(PERMISSIONS.SYSTEM.DICT.EDIT_ITEM)
  const canDelete = hasPermission(PERMISSIONS.SYSTEM.DICT.DELETE_ITEM)

  const {
    data: itemsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['dictItems', selectedType?.id, refreshItems],
    queryFn: () => {
      if (!selectedType?.id)
        return { list: [], total: 0, page: 1, page_size: 10, total_pages: 0 }
      return getDictItemsByTypeId(selectedType.id, { page: 1, page_size: 50 })
    },
    enabled: !!selectedType?.id,
  })

  const handleEdit = (item: DictItem) => {
    setCurrentItemRow(item)
    setShowItemEditDialog(true)
  }

  const handleDelete = (item: DictItem) => {
    setCurrentItemRow(item)
    setShowItemDeleteDialog(true)
  }

  const handleToggleDefault = async (item: DictItem) => {
    if (item.is_default) {
      toast.error(t('system.dicts.items.messages.alreadyDefault'))
      return
    }
    try {
      await setDictItemAsDefault(item.id)
      setRefreshItems((prev) => prev + 1)
      toast.success(t('system.dicts.items.messages.setDefaultSuccess'))
    } catch {
      toast.error(t('system.dicts.items.messages.setDefaultFailed'))
    }
  }

  const handleToggleStatus = async (item: DictItem) => {
    const action = item.status === 'active' ? t('system.dicts.items.actions.disable') : t('system.dicts.items.actions.enable')
    try {
      await toggleDictItemStatus(item.id, item.status)
      setRefreshItems((prev) => prev + 1)
      toast.success(t('system.dicts.items.messages.toggleStatusSuccess', { action }))
    } catch {
      toast.error(t('system.dicts.items.messages.toggleStatusFailed', { action }))
    }
  }

  if (!selectedType) {
    return (
      <div className='text-muted-foreground p-8 text-center'>
        {t('system.dicts.items.selectTypeFirst')}
      </div>
    )
  }
  if (isLoading) {
    return <div className='p-4 text-center'>{t('system.dicts.items.loading')}</div>
  }
  if (error) {
    return <div className='p-4 text-center text-red-500'>{t('system.dicts.items.loadFailed')}</div>
  }

  const items = itemsData?.list || []

  return (
    <div className='space-y-4'>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('system.dicts.items.columns.label')}</TableHead>
              <TableHead>{t('system.dicts.items.columns.value')}</TableHead>
              <TableHead>{t('system.dicts.items.columns.sort')}</TableHead>
              <TableHead>{t('system.dicts.items.columns.isDefault')}</TableHead>
              <TableHead>{t('system.dicts.items.columns.status')}</TableHead>
              <TableHead>{t('system.dicts.items.columns.color')}</TableHead>
              <TableHead className='w-[70px]'>{t('system.dicts.items.columns.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className='text-muted-foreground py-8 text-center'
                >
                  {t('system.dicts.items.noData')}
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className='font-medium'>{item.label}</TableCell>
                  <TableCell className='font-mono text-sm'>
                    {item.value}
                  </TableCell>
                  <TableCell>{item.sort}</TableCell>
                  <TableCell>
                    {item.is_default ? (
                      <Badge variant='default'>
                        <Star className='mr-1 h-3 w-3' /> {t('system.dicts.items.default')}
                      </Badge>
                    ) : (
                      <span className='text-muted-foreground'>-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.status === 'active' ? 'default' : 'secondary'
                      }
                    >
                      {item.status === 'active' ? t('system.dicts.items.statusActive') : t('system.dicts.items.statusInactive')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.color ? (
                      <div className='flex items-center space-x-2'>
                        <div
                          className='border-border h-4 w-4 rounded border'
                          style={{ backgroundColor: item.color }}
                        />
                        <span className='font-mono text-xs'>{item.color}</span>
                      </div>
                    ) : (
                      <span className='text-muted-foreground'>-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        {canEdit && (
                          <>
                            <DropdownMenuItem onClick={() => handleEdit(item)}>
                              <Edit className='mr-2 h-4 w-4' /> {t('system.dicts.items.actions.edit')}
                            </DropdownMenuItem>
                            {!item.is_default && (
                              <DropdownMenuItem
                                onClick={() => handleToggleDefault(item)}
                              >
                                <Star className='mr-2 h-4 w-4' /> {t('system.dicts.items.actions.setDefault')}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(item)}
                            >
                              {item.status === 'active' ? (
                                <>
                                  <StarOff className='mr-2 h-4 w-4' /> {t('system.dicts.items.actions.disable')}
                                </>
                              ) : (
                                <>
                                  <Star className='mr-2 h-4 w-4' /> {t('system.dicts.items.actions.enable')}
                                </>
                              )}
                            </DropdownMenuItem>
                          </>
                        )}
                        {canDelete && (
                          <DropdownMenuItem onClick={() => handleDelete(item)}>
                            <Trash2 className='mr-2 h-4 w-4' /> {t('system.dicts.items.actions.delete')}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
