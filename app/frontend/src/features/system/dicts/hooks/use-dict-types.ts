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
import {
  deleteDictType,
  getDictTypes,
  updateDictType,
} from '@/services/dictApi'
import type { DictTypeQueryParams } from '@/types/dict'
import { useCrudMutation } from '@/hooks/use-crud-mutation'

// Query keys for React Query
const DICT_TYPES_QUERY_KEY = 'dict-types'

// Custom hook for fetching dict types with pagination and filters
export function useDictTypes(params?: DictTypeQueryParams) {
  return useQuery({
    queryKey: [DICT_TYPES_QUERY_KEY, params],
    queryFn: () => getDictTypes(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Custom hook for batch deleting dict types
export function useDeleteDictTypes() {
  return useCrudMutation({
    mutationFn: (typeIds: string[]) =>
      Promise.all(typeIds.map((id) => deleteDictType(id))),
    queryKeys: [[DICT_TYPES_QUERY_KEY]],
    successMessage: (_, typeIds) => `已删除 ${typeIds.length} 个字典类型`,
    errorMessage: '批量删除字典类型失败',
  })
}

// Custom hook for bulk status updates
export function useBulkUpdateDictTypes() {
  return useCrudMutation({
    mutationFn: ({
      typeIds,
      status,
    }: {
      typeIds: string[]
      status: 'active' | 'inactive'
    }) => Promise.all(typeIds.map((id) => updateDictType(id, { status }))),
    queryKeys: [[DICT_TYPES_QUERY_KEY]],
    successMessage: (_, { typeIds, status }) => {
      const statusText = status === 'active' ? '启用' : '禁用'
      return `已${statusText} ${typeIds.length} 个字典类型`
    },
    errorMessage: '批量更新字典类型状态失败',
  })
}
