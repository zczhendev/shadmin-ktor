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

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  inviteUser,
  updateUser,
} from '@/services/userApi'
import type { QueryParams } from '@/types/api'
import type { UserUpdateRequest } from '@/types/user'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/error'
import { useCrudMutation } from '@/hooks/use-crud-mutation'

// Query keys for React Query
const USERS_QUERY_KEY = 'users'
const USER_QUERY_KEY = 'user'

// Custom hook for fetching users with pagination and filters
export function useUsers(params?: QueryParams) {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, params],
    queryFn: async () => {
      const usersResult = await getUsers(params)
      // Backend already returns roles in user.roles field via batch join
      return usersResult
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Custom hook for fetching single user
export function useUser(id: string, enabled = true) {
  return useQuery({
    queryKey: [USER_QUERY_KEY, id],
    queryFn: () => getUser(id),
    enabled: !!id && enabled,
  })
}

// Custom hook for creating user
export function useCreateUser() {
  return useCrudMutation({
    mutationFn: createUser,
    queryKeys: [[USERS_QUERY_KEY]],
    successMessage: '用户创建成功',
    errorMessage: '创建用户失败',
  })
}

// Custom hook for updating user
export function useUpdateUser() {
  return useCrudMutation({
    mutationFn: ({ id, data }: { id: string; data: UserUpdateRequest }) =>
      updateUser(id, data),
    queryKeys: (_, { id }) => [[USERS_QUERY_KEY], [USER_QUERY_KEY, id]],
    successMessage: '用户更新成功',
    errorMessage: '更新用户失败',
  })
}

// Custom hook for deleting user
export function useDeleteUser() {
  return useCrudMutation({
    mutationFn: deleteUser,
    queryKeys: [[USERS_QUERY_KEY]],
    successMessage: '用户删除成功',
    errorMessage: '删除用户失败',
  })
}

// Custom hook for batch deleting users
export function useDeleteUsers() {
  return useCrudMutation({
    mutationFn: (userIds: string[]) =>
      Promise.all(userIds.map((id) => deleteUser(id))),
    queryKeys: [[USERS_QUERY_KEY]],
    successMessage: (_, userIds) => `已删除 ${userIds.length} 个用户`,
    errorMessage: '批量删除用户失败',
  })
}

// Custom hook for inviting user
export function useInviteUser() {
  return useCrudMutation({
    mutationFn: inviteUser,
    queryKeys: [[USERS_QUERY_KEY]],
    successMessage: '邀请发送成功',
    errorMessage: '邀请用户失败',
  })
}

// Custom hook for refreshing users data
export function useRefreshUsers() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] })
  }
}

// Custom hook for bulk status updates
export function useBulkUpdateUsers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userIds,
      status,
    }: {
      userIds: string[]
      status: 'active' | 'inactive' | 'suspended'
    }) => {
      const promises = userIds.map((id) => updateUser(id, { status }))
      return Promise.all(promises)
    },
    onSuccess: (_, { userIds, status }) => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] })
      const statusText =
        status === 'active' ? '激活' : status === 'inactive' ? '停用' : '暂停'
      toast.success(`已${statusText} ${userIds.length} 个用户`)
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, '批量更新用户状态失败'))
      throw error
    },
  })
}
