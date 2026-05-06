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

import { formatDistanceToNow } from 'date-fns'
import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { zhCN } from 'date-fns/locale'
import { Edit, List, MoreHorizontal, Trash2 } from 'lucide-react'
import { PERMISSIONS } from '@/constants/permissions'
import { usePermission } from '@/hooks/usePermission'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTableColumnHeader } from '@/components/data-table'
import { type DictType } from '../types/dict-types'
import { useDicts } from './dicts-provider'

// Extract actions cell to a proper React component to follow Hooks rules
function ActionsCell({ dictType }: { dictType: DictType }) {
  const { t } = useTranslation()
  const {
    setCurrentTypeRow,
    setShowTypeEditDialog,
    setShowTypeDeleteDialog,
    setSelectedType,
    setShowItemsListDialog,
  } = useDicts()
  const { hasPermission } = usePermission()
  const canEdit = hasPermission(PERMISSIONS.SYSTEM.DICT.EDIT_TYPE)
  const canDelete = hasPermission(PERMISSIONS.SYSTEM.DICT.DELETE_TYPE)

  const handleEdit = () => {
    setCurrentTypeRow(dictType)
    setShowTypeEditDialog(true)
  }
  const handleDelete = () => {
    setCurrentTypeRow(dictType)
    setShowTypeDeleteDialog(true)
  }
  const handleViewItems = () => {
    setSelectedType(dictType)
    setShowItemsListDialog(true)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <span className='sr-only'>Open menu</span>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={handleViewItems}>
          <List className='mr-2 h-4 w-4' /> {t('system.dicts.actions.viewItems')}
        </DropdownMenuItem>
        {canEdit && (
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className='mr-2 h-4 w-4' /> {t('system.dicts.actions.edit')}
          </DropdownMenuItem>
        )}
        {canDelete && (
          <DropdownMenuItem onClick={handleDelete} className='text-destructive'>
            <Trash2 className='mr-2 h-4 w-4' /> {t('system.dicts.actions.delete')}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function getDictTypesColumns(t: TFunction): ColumnDef<DictType>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
          className='translate-y-[2px]'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Select row'
          className='translate-y-[2px]'
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'code',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('system.dicts.columns.code')} />
      ),
      cell: ({ row }) => (
        <div className='font-mono text-sm font-medium'>
          {row.getValue('code')}
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('system.dicts.columns.name')} />
      ),
      cell: ({ row }) => (
        <div className='font-medium'>{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('system.dicts.columns.status')} />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return (
          <Badge variant={status === 'active' ? 'default' : 'secondary'}>
            {status === 'active' ? t('system.dicts.status.active') : t('system.dicts.status.inactive')}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'remark',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('system.dicts.columns.remark')} />
      ),
      cell: ({ row }) => {
        const remark = row.getValue('remark') as string
        return <div className='max-w-[200px] truncate'>{remark || '-'}</div>
      },
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('system.dicts.columns.createdAt')} />
      ),
      cell: ({ row }) => {
        const date = row.getValue('created_at') as Date
        return (
          <div className='text-muted-foreground text-sm'>
            {formatDistanceToNow(date, { addSuffix: true, locale: zhCN })}
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: t('system.dicts.columns.actions'),
      cell: ({ row }) => <ActionsCell dictType={row.original} />,
    },
  ]
}
