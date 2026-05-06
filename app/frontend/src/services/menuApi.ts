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
  type CreateMenuRequest,
  type Menu,
  type MenuPagedResult,
  type MenuQueryParams,
  type MenuTreeNode,
  type UpdateMenuRequest,
} from '@/types/menu'
import { buildSearchParams } from '@/lib/query-params'
import { apiClient } from './config'

// GET /system/menu - Get menus with pagination
export const getMenus = async (
  params?: MenuQueryParams
): Promise<MenuPagedResult> => {
  const searchParams = buildSearchParams(params)

  const response = await apiClient.get(
    `/api/v1/system/menu?${searchParams.toString()}`
  )
  const data = response.data.data

  // Backend now returns PagedResult
  if (data && Array.isArray(data.list)) {
    return data
  }

  // Fallback for backwards compatibility
  if (Array.isArray(data)) {
    return {
      list: data,
      total: data.length,
      page: 1,
      page_size: data.length,
      total_pages: 1,
    }
  }

  return data
}

// POST /system/menu - Create menu
export const createMenu = async (request: CreateMenuRequest): Promise<Menu> => {
  const response = await apiClient.post('/api/v1/system/menu', request)
  return response.data.data
}

// GET /system/menu/tree - Get menu tree
export const getMenuTree = async (status?: string): Promise<MenuTreeNode[]> => {
  const params = new URLSearchParams()
  if (status) params.append('status', status)

  const response = await apiClient.get(
    `/api/v1/system/menu/tree?${params.toString()}`
  )
  return response.data.data
}

// PUT /system/menu/{id} - Update menu
export const updateMenu = async (
  id: string,
  request: UpdateMenuRequest
): Promise<Menu> => {
  const response = await apiClient.put(`/api/v1/system/menu/${id}`, request)
  return response.data.data
}

// DELETE /system/menu/{id} - Delete menu
export const deleteMenu = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/v1/system/menu/${id}`)
}
