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

import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createRole,
  deleteRole,
  getRole,
  getRoles,
  updateRole,
} from '@/services/roleApi'
import type { QueryParams } from '@/types/api'
import type { UpdateRoleRequest } from '@/types/role'
import { useCrudMutation } from '@/hooks/use-crud-mutation'
import i18n from '@/i18n'

// Query keys for React Query
const ROLES_QUERY_KEY = 'roles'
const ROLE_QUERY_KEY = 'role'

// Custom hook for fetching all roles with pagination
export function useRoles(params?: QueryParams) {
  return useQuery({
    queryKey: [ROLES_QUERY_KEY, params],
    queryFn: () => getRoles(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Custom hook for fetching a single role
export function useRole(id: string, enabled = true) {
  return useQuery({
    queryKey: [ROLE_QUERY_KEY, id],
    queryFn: () => getRole(id),
    enabled: !!id && enabled,
  })
}

// Custom hook for creating a role
export function useCreateRole() {
  return useCrudMutation({
    mutationFn: createRole,
    queryKeys: [[ROLES_QUERY_KEY]],
    successMessage: i18n.t('system.roles.messages.createSuccess'),
    errorMessage: i18n.t('system.roles.messages.createFailed'),
  })
}

// Custom hook for updating a role
export function useUpdateRole() {
  return useCrudMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleRequest }) =>
      updateRole(id, data),
    queryKeys: (_, { id }) => [[ROLES_QUERY_KEY], [ROLE_QUERY_KEY, id]],
    successMessage: i18n.t('system.roles.messages.updateSuccess'),
    errorMessage: i18n.t('system.roles.messages.updateFailed'),
  })
}

// Custom hook for deleting a role
export function useDeleteRole() {
  return useCrudMutation({
    mutationFn: deleteRole,
    queryKeys: [[ROLES_QUERY_KEY]],
    successMessage: i18n.t('system.roles.messages.deleteSuccess'),
    errorMessage: i18n.t('system.roles.messages.deleteFailed'),
  })
}

// Custom hook for refreshing roles data
export function useRefreshRoles() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: [ROLES_QUERY_KEY] })
  }
}
