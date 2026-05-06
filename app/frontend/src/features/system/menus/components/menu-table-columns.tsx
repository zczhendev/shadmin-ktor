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

import type { TFunction } from 'i18next'
import { type ColumnDef } from '@tanstack/react-table'
import {
  ChevronDown,
  ChevronRight,
  Circle,
  Edit,
  Plus,
  Settings,
  Trash2,
} from 'lucide-react'
import { getIconByName } from '@/lib/icons'
import type { TableMenuItem } from '@/lib/menu-utils'
import { cn } from '@/lib/utils'
import { PERMISSIONS } from '@/constants/permissions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface MenuTableColumnsProps {
  expanded: Record<string, boolean>
  onExpandToggle: (hierarchyIndex: string) => void
  onEditClick: (menu: TableMenuItem) => void
  onAddClick: (menu: TableMenuItem) => void
  onDeleteClick: (menu: TableMenuItem) => void
  hasPermission: (permission: string) => boolean
  t: TFunction
}

export function createMenuTableColumns({
  expanded,
  onExpandToggle,
  onEditClick,
  onAddClick,
  onDeleteClick,
  hasPermission,
  t,
}: MenuTableColumnsProps): ColumnDef<TableMenuItem, unknown>[] {
  return [
    {
      accessorKey: 'name',
      header: t('system.menus.columns.name'),
      cell: ({ row }) => {
        const menu = row.original
        const hasChildren = menu.children && menu.children.length > 0
        const hierarchyIndex = menu.hierarchyIndex

        const levelPadding = ['pl-0', 'pl-6', 'pl-12', 'pl-[72px]']
        return (
          <div
            className={cn('flex items-center gap-2', levelPadding[menu.level] || `pl-[${menu.level * 24}px]`)}
          >
            {hasChildren ? (
              <Button
                variant='ghost'
                size='sm'
                className='h-6 w-6 p-0'
                onClick={(e) => {
                  e.stopPropagation()
                  onExpandToggle(hierarchyIndex)
                }}
              >
                {expanded[hierarchyIndex] ? (
                  <ChevronDown className='h-4 w-4' />
                ) : (
                  <ChevronRight className='h-4 w-4' />
                )}
              </Button>
            ) : (
              <div className='w-6' />
            )}

            <div className='flex items-center gap-2'>
              {menu.icon &&
                (() => {
                  const IconComponent = getIconByName(menu.icon)
                  if (IconComponent) {
                    return (
                      <IconComponent className='text-muted-foreground h-4 w-4 flex-shrink-0' />
                    )
                  }
                  return (
                    <Circle className='text-muted-foreground h-4 w-4 flex-shrink-0' />
                  )
                })()}
              <span
                className={cn(
                  'font-medium',
                  menu.level === 0 && 'font-semibold',
                  menu.status === 'inactive' && 'line-through opacity-50'
                )}
              >
                {menu.name}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'type',
      header: t('system.menus.columns.type'),
      cell: ({ row }) => {
        const type = row.original.type
        const typeLabels: Record<string, string> = {
          menu: t('system.menus.type.menu'),
          button: t('system.menus.type.button'),
        }
        return (
          <Badge variant='secondary' className='text-xs'>
            {typeLabels[type as keyof typeof typeLabels] || type}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'sequence',
      header: t('system.menus.columns.sequence'),
      cell: ({ row }) => {
        const sequence = row.original.sequence
        return <div className='text-sm'>{sequence}</div>
      },
    },
    {
      accessorKey: 'path',
      header: t('system.menus.columns.path'),
      cell: ({ row }) => {
        const path = row.original.path
        return path ? (
          <Badge variant='outline' className='text-xs'>
            {path}
          </Badge>
        ) : (
          <span className='text-muted-foreground'>-</span>
        )
      },
    },
    {
      accessorKey: 'status',
      header: t('system.menus.columns.status'),
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge variant={status === 'active' ? 'default' : 'secondary'}>
            {status === 'active' ? t('system.menus.status.active') : t('system.menus.status.inactive')}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      header: t('system.menus.columns.actions'),
      cell: ({ row }) => {
        const menu = row.original

        // Check if user has any permissions for these actions
        const canEdit = hasPermission(PERMISSIONS.SYSTEM.MENU.EDIT)
        const canAdd = hasPermission(PERMISSIONS.SYSTEM.MENU.ADD)
        const canDelete = hasPermission(PERMISSIONS.SYSTEM.MENU.DELETE)

        // If no permissions, don't show dropdown
        if (!canEdit && !canAdd && !canDelete) {
          return null
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>{t('system.menus.openMenu')}</span>
                <Settings className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {canEdit && (
                <DropdownMenuItem onClick={() => onEditClick(menu)}>
                  <Edit className='mr-2 h-4 w-4' />
                  {t('system.menus.actions.edit')}
                </DropdownMenuItem>
              )}
              {canAdd && (
                <DropdownMenuItem onClick={() => onAddClick(menu)}>
                  <Plus className='mr-2 h-4 w-4' />
                  {t('system.menus.actions.add')}
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => onDeleteClick(menu)}
                  className='text-destructive'
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  {t('system.menus.actions.delete')}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
