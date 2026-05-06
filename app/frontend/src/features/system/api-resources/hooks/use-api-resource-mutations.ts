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

import {
  createApiResource,
  deleteApiResource,
  updateApiResource,
  type UpdateApiResourceRequest,
} from '@/services/apiResourceApi'
import { useCrudMutation } from '@/hooks/use-crud-mutation'

const API_RESOURCES_QUERY_KEY = 'api-resources'

// Custom hook for creating API resource
export function useCreateApiResource() {
  return useCrudMutation({
    mutationFn: createApiResource,
    queryKeys: [[API_RESOURCES_QUERY_KEY]],
    successMessage: 'API资源创建成功',
    errorMessage: '创建API资源失败',
  })
}

// Custom hook for updating API resource
export function useUpdateApiResource() {
  return useCrudMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: UpdateApiResourceRequest
    }) => updateApiResource(id, data),
    queryKeys: (_, { id }) => [[API_RESOURCES_QUERY_KEY], [API_RESOURCES_QUERY_KEY, id]],
    successMessage: 'API资源更新成功',
    errorMessage: '更新API资源失败',
  })
}

// Custom hook for deleting API resource
export function useDeleteApiResource() {
  return useCrudMutation({
    mutationFn: deleteApiResource,
    queryKeys: [[API_RESOURCES_QUERY_KEY]],
    successMessage: 'API资源删除成功',
    errorMessage: '删除API资源失败',
  })
}
