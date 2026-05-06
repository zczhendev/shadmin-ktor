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

import type { ColumnDef } from '@tanstack/react-table'
import type { ApiResource } from '@/types/api-resource'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { type HttpMethod, METHOD_COLORS } from '../constants/api-constants'
import { ApiResourcesRowActions } from './api-resources-row-actions'

const handleCopyPath = (apiResource: ApiResource) => {
  const pathText = `${apiResource.method} ${apiResource.path}`
  navigator.clipboard.writeText(pathText)
  toast.success('API路径已复制到剪贴板')
}

export const apiResourcesColumns: ColumnDef<ApiResource>[] = [
  {
    accessorKey: 'module',
    header: '模块',
    cell: ({ row }) => {
      const module = row.getValue('module') as string
      return module ? (
        <Badge variant='outline'>{module}</Badge>
      ) : (
        <span className='text-muted-foreground'>-</span>
      )
    },
    filterFn: (row, id, value) => {
      const module = row.getValue(id) as string
      if (!value || value.length === 0) return true
      return value.includes(module || '')
    },
  },
  {
    accessorKey: 'method',
    header: '方法',
    cell: ({ row }) => {
      const method = row.getValue('method') as string
      return (
        <Badge
          variant='secondary'
          className={METHOD_COLORS[method as HttpMethod]}
        >
          {method}
        </Badge>
      )
    },
    meta: {
      className: 'w-[100px]',
    },
  },
  {
    accessorKey: 'path',
    header: '路径',
    cell: ({ row }) => {
      const path = row.getValue('path') as string
      return <span className='font-mono text-sm'>{path}</span>
    },
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row }) => (
      <div className='flex items-center gap-1'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => handleCopyPath(row.original)}
          className='h-8 w-8 p-0'
        >
          <Copy className='h-4 w-4' />
        </Button>
        <ApiResourcesRowActions row={row} />
      </div>
    ),
    meta: {
      className: 'w-[100px]',
    },
  },
]
