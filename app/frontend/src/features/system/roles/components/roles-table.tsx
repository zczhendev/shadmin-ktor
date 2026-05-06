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

import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { deleteRole } from '@/services/roleApi'
import { type Role } from '@/types/role'
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/error'
import { cn } from '@/lib/utils'
import { PERMISSIONS } from '@/constants/permissions'
import { usePermission } from '@/hooks/usePermission'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from '@/components/data-table'
import { useRoles } from './roles-provider'

interface RolesTableProps {
  data: Role[]
  search: Record<string, unknown>
  navigate: (opts: Record<string, unknown>) => void
  totalCount?: number
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'active':
      return 'default'
    case 'inactive':
      return 'secondary'
    default:
      return 'secondary'
  }
}

function getDataScopeLabel(scope?: string, t?: (key: string) => string) {
  switch (scope) {
    case 'ALL':
      return t?.('system.roles.table.dataScopeAll') ?? '全部数据'
    case 'DEPT':
      return t?.('system.roles.table.dataScopeDept') ?? '本部门'
    case 'DEPT_AND_CHILD':
      return t?.('system.roles.table.dataScopeDeptAndChild') ?? '本部门及子部门'
    case 'SELF':
      return t?.('system.roles.table.dataScopeSelf') ?? '仅自己'
    default:
      return t?.('system.roles.table.dataScopeAll') ?? '全部数据'
  }
}

function getDataScopeBadgeVariant(scope?: string) {
  switch (scope) {
    case 'ALL':
      return 'default'
    case 'DEPT':
      return 'secondary'
    case 'DEPT_AND_CHILD':
      return 'outline'
    case 'SELF':
      return 'destructive'
    default:
      return 'default'
  }
}

export function RolesTable({ data, totalCount = 0 }: RolesTableProps) {
  const { t } = useTranslation()
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const [searchValue, setSearchValue] = useState('')

  const { setCurrentRow, setShowEditDialog } = useRoles()
  const queryClient = useQueryClient()
  const { hasPermission } = usePermission()

  const canEdit = hasPermission(PERMISSIONS.SYSTEM.ROLE.EDIT)
  const canDelete = hasPermission(PERMISSIONS.SYSTEM.ROLE.DELETE)

  // Build role name lookup for parent display
  const roleNameById = useMemo(() => {
    return new Map(data.map((r) => [r.id, r.name]))
  }, [data])

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchValue) return data
    const searchLower = searchValue.toLowerCase()
    return data.filter((role: Role) => {
      return role.name?.toLowerCase().includes(searchLower)
    })
  }, [data, searchValue])

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      toast.success(t('system.roles.messages.deleteSuccess'))
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, t('system.roles.messages.deleteFailed')))
    },
  })

  const handleDeleteClick = useCallback(
    (role: Role) => {
      if (window.confirm(t('system.roles.messages.deleteConfirm', { name: role.name }))) {
        deleteRoleMutation.mutate(role.id)
      }
    },
    [deleteRoleMutation.mutate, t]
  )

  const handleEditClick = useCallback(
    (role: Role) => {
      setCurrentRow(role)
      setShowEditDialog(true)
    },
    [setCurrentRow, setShowEditDialog]
  )

  const columns = useMemo<ColumnDef<Role, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('system.roles.columns.name'),
        cell: ({ row }) => {
          const role = row.original
          return (
            <div className='flex items-center gap-2'>
              <span className='font-medium'>{row.getValue('name')}</span>
              {role.is_system && (
                <Badge variant='secondary' className='text-xs'>
                  {t('system.roles.table.system')}
                </Badge>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'parent_id',
        header: t('system.roles.columns.parent'),
        cell: ({ row }) => {
          const parentId = row.original.parent_id
          if (!parentId) return <span className='text-muted-foreground'>-</span>
          const parentName = roleNameById.get(parentId) ?? parentId
          return <span className='text-sm'>{parentName}</span>
        },
      },
      {
        accessorKey: 'data_scope',
        header: t('system.roles.columns.dataScope'),
        cell: ({ row }) => {
          const scope = row.getValue('data_scope') as string | undefined
          return (
            <Badge variant={getDataScopeBadgeVariant(scope)}>
              {getDataScopeLabel(scope, t)}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'permissions',
        header: t('system.roles.columns.permissions'),
        cell: ({ row }) => {
          const direct = row.original.permissions ?? []
          const inherited = row.original.inherited_permissions ?? []
          const count = new Set([...direct, ...inherited]).size
          const hasInherited = inherited.length > 0
          return (
            <div className='text-center'>
              {count}
              {hasInherited && (
                <span className='text-muted-foreground ml-1 text-xs'>
                  {t('system.roles.table.inherited', { count: inherited.length })}
                </span>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'menus',
        header: t('system.roles.columns.menus'),
        cell: ({ row }) => {
          const direct = row.original.menus ?? []
          const inherited = row.original.inherited_menus ?? []
          const count = new Set([...direct, ...inherited]).size
          const hasInherited = inherited.length > 0
          return (
            <div className='text-center'>
              {count}
              {hasInherited && (
                <span className='text-muted-foreground ml-1 text-xs'>
                  {t('system.roles.table.inherited', { count: inherited.length })}
                </span>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'status',
        header: t('system.roles.columns.status'),
        cell: ({ row }) => {
          const status = row.getValue('status') as string
          return (
            <Badge variant={getStatusBadgeVariant(status)}>
              {status === 'active' ? t('system.roles.table.statusActive') : t('system.roles.table.statusInactive')}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'sequence',
        header: t('system.roles.columns.sequence'),
        cell: ({ row }) => (
          <div className='text-center'>{row.getValue('sequence')}</div>
        ),
      },
      {
        id: 'actions',
        header: t('system.roles.columns.actions'),
        cell: ({ row }) => {
          const role = row.original

          // If no permissions, don't render the dropdown
          if (!canEdit && !canDelete) {
            return null
          }

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='h-8 w-8 p-0'>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                {canEdit && (
                  <DropdownMenuItem onClick={() => handleEditClick(role)}>
                    <Edit className='mr-2 h-4 w-4' />
                    {t('system.roles.actions.edit')}
                  </DropdownMenuItem>
                )}
                {canDelete && !role.is_system && (
                  <DropdownMenuItem
                    onClick={() => handleDeleteClick(role)}
                    className='text-destructive'
                  >
                    <Trash2 className='mr-2 h-4 w-4' />
                    {t('system.roles.actions.delete')}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [
      t,
      handleEditClick,
      handleDeleteClick,
      canEdit,
      canDelete,
      roleNameById,
    ]
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    manualPagination: true,
    pageCount: Math.ceil(totalCount / pagination.pageSize),
    state: {
      sorting,
      pagination,
    },
  })

  return (
    <div className='space-y-4'>
      {/* Search Filter */}
      <div className='flex items-center justify-between'>
        <Input
          placeholder={t('system.roles.table.searchPlaceholder')}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className='h-8 w-[150px] lg:w-[250px]'
        />
        <div className='text-muted-foreground text-sm'>
          {t('system.roles.table.totalRoles', { count: filteredData.length })}
        </div>
      </div>

      {/* Table */}
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        header.column.columnDef.meta?.className ?? ''
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='group/row'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        cell.column.columnDef.meta?.className ?? ''
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  {t('system.roles.table.noData')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <DataTablePagination table={table} />
    </div>
  )
}
