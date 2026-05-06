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

import { type QueryParams } from '@/types/api'
import {
  type CreateRoleRequest,
  type Role,
  type RolePagedResult,
  type UpdateRoleRequest,
} from '@/types/role'
import { apiClient } from './config'

// GET /system/role - Get all roles with pagination
export const getRoles = async (params?: QueryParams): Promise<RolePagedResult> => {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.append('page', String(params.page))
  if (params?.page_size) searchParams.append('page_size', String(params.page_size))
  const query = searchParams.toString()
  const response = await apiClient.get(`/api/v1/system/role${query ? '?' + query : ''}`)
  return response.data.data
}

// Create a new role
export const createRole = async (request: CreateRoleRequest): Promise<Role> => {
  const response = await apiClient.post('/api/v1/system/role', request)
  return response.data.data
}

// Get role by ID
export const getRole = async (id: string): Promise<Role> => {
  const response = await apiClient.get(`/api/v1/system/role/${id}`)
  return response.data.data
}

// Update a role
export const updateRole = async (
  id: string,
  request: UpdateRoleRequest
): Promise<Role> => {
  const response = await apiClient.put(`/api/v1/system/role/${id}`, request)
  return response.data.data
}

// Delete a role
export const deleteRole = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/v1/system/role/${id}`)
}

// Backwards compatibility alias
export const getRolesPaged = getRoles

// Get role menus
export const getRoleMenus = async (roleId: string): Promise<string[]> => {
  const response = await apiClient.get(`/api/v1/system/role/${roleId}/menus`)
  return response.data.data
}
