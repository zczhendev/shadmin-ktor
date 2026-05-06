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
import { type UserPagedResult, type QueryParams } from '@/types/api'
import {
  type User,
  type CreateUserRequest,
  type InviteUserRequest,
  type UserUpdateRequest,
} from '@/types/user'
import { buildSearchParams } from '@/lib/query-params'

// User Management API - Based on swagger.json /system/user endpoints

// GET /system/user - Get all users
export async function getUsers(params?: QueryParams): Promise<UserPagedResult> {
  const searchParams = buildSearchParams(params)

  const response = await apiClient.get(`/api/v1/system/user?${searchParams}`)
  return response.data.data
}

// POST /system/user - Create a new user
export async function createUser(data: CreateUserRequest): Promise<User> {
  const response = await apiClient.post('/api/v1/system/user', data)
  return response.data.data
}

// POST /system/user/invite - Invite user
export async function inviteUser(data: InviteUserRequest): Promise<User> {
  const response = await apiClient.post('/api/v1/system/user/invite', data)
  return response.data.data
}

// GET /system/user/{id} - Get user by ID
export async function getUser(id: string): Promise<User> {
  const response = await apiClient.get(`/api/v1/system/user/${id}`)
  return response.data.data
}

// PUT /system/user/{id} - Update user
export async function updateUser(
  id: string,
  data: UserUpdateRequest
): Promise<User> {
  const response = await apiClient.put(`/api/v1/system/user/${id}`, data)
  return response.data.data
}

// DELETE /system/user/{id} - Delete user
export async function deleteUser(id: string): Promise<string> {
  const response = await apiClient.delete(`/api/v1/system/user/${id}`)
  return response.data.data
}

// GET /system/user/{userId}/roles - Get user roles
export async function getUserRoleList(userId: string): Promise<string[]> {
  const response = await apiClient.get(`/api/v1/system/user/${userId}/roles`)
  return response.data.data
}
