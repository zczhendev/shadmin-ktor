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

import { apiClient } from '@/services/config'
import { type ApiResource } from '@/types/api-resource'
import { buildSearchParams } from '@/lib/query-params'

export interface ApiResourceQueryParams {
  page?: number
  page_size?: number
  method?: string
  module?: string
  keyword?: string
  path?: string
}

export interface ApiResourcePagedResult {
  data: ApiResource[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

interface ApiResourceApiResponse {
  list: ApiResource[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface CreateApiResourceRequest {
  name: string
  path: string
  method: string
  module?: string
  description?: string
  status?: string
}

export interface UpdateApiResourceRequest {
  name?: string
  path?: string
  method?: string
  module?: string
  description?: string
  status?: string
}

// GET /system/api-resources - Get API resources with pagination
export async function getApiResources(
  params?: ApiResourceQueryParams
): Promise<ApiResourcePagedResult> {
  const searchParams = buildSearchParams(params)

  const response = await apiClient.get(
    `/api/v1/system/api-resources?${searchParams}`
  )
  const apiData: ApiResourceApiResponse = response.data.data

  // Transform API response to expected format
  return {
    data: apiData.list || [],
    total: apiData.total || 0,
    page: apiData.page || 1,
    page_size: apiData.page_size || 10,
    total_pages: apiData.total_pages || 0,
  }
}

// POST /system/api-resources - Create a new API resource
export async function createApiResource(
  data: CreateApiResourceRequest
): Promise<ApiResource> {
  const response = await apiClient.post('/api/v1/system/api-resources', data)
  return response.data.data
}

// PUT /system/api-resources/{id} - Update an API resource
export async function updateApiResource(
  id: string,
  data: UpdateApiResourceRequest
): Promise<ApiResource> {
  const response = await apiClient.put(
    `/api/v1/system/api-resources/${id}`,
    data
  )
  return response.data.data
}

// DELETE /system/api-resources/{id} - Delete an API resource
export async function deleteApiResource(id: string): Promise<string> {
  const response = await apiClient.delete(`/api/v1/system/api-resources/${id}`)
  return response.data.data
}
