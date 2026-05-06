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

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getRoles } from '@/services/roleApi'
import { getUserRoleList } from '@/services/userApi'
import type { UserStatus } from '@/types/user'
import { type User } from '../types/user-types'
import { type UserFormData, userFormSchema } from '../schemas/user-form-schema'
import { useCreateUser, useUpdateUser } from './use-users'

interface UseUserFormProps {
  currentRow?: User
  onSuccess: () => void
}

export function useUserForm({ currentRow, onSuccess }: UseUserFormProps) {
  const isEdit = !!currentRow
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const queryClient = useQueryClient()

  // Fetch user roles if editing
  const { data: userRoles = [] } = useQuery({
    queryKey: ['userRoles', currentRow?.id],
    queryFn: () => getUserRoleList(currentRow!.id) as Promise<string[]>,
    enabled: !!currentRow?.id,
  })

  // Fetch all roles for selection
  const { data: allRolesData } = useQuery({
    queryKey: ['roles-all'],
    queryFn: () => getRoles({ page: 1, page_size: 1000 }),
  })
  const allRoles = allRolesData?.list || []

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: isEdit ? currentRow.username : '',
      email: isEdit ? currentRow.email : '',
      phone: isEdit ? currentRow.phone || '' : '',
      status: isEdit ? currentRow.status : 'active',
      password: '',
      confirmPassword: '',
      roles: [],
      isEdit,
    },
  })

  // Update form roles when userRoles data is loaded
  if (
    isEdit &&
    userRoles &&
    userRoles.length > 0 &&
    form.getValues('roles').length === 0
  ) {
    form.setValue('roles', userRoles)
  }

  const onSubmit = async (values: UserFormData) => {
    try {
      if (isEdit) {
        const updateData: Record<string, unknown> = {
          username: values.username,
          email: values.email,
          phone: values.phone || undefined,
          status: values.status,
        }

        if (values.password) {
          updateData.password = values.password
        }

        // Create mapping from role name to role ID for the new roles
        const roleNameToIdMap = allRoles.reduce(
          (map, role) => {
            map[role.name] = role.id
            return map
          },
          {} as Record<string, string>
        )

        // Convert role names to role IDs
        const roleIds = values.roles
          .map((roleName) => roleNameToIdMap[roleName])
          .filter(Boolean)

        // Update user with roles included
        const updateDataWithRoles = {
          ...updateData,
          role_ids: roleIds,
        }

        await updateUser.mutateAsync({
          id: currentRow!.id,
          data: updateDataWithRoles,
        })

        // Invalidate queries
        queryClient.invalidateQueries({
          queryKey: ['userRoles', currentRow!.id],
        })
        queryClient.invalidateQueries({ queryKey: ['users'] })
      } else {
        // Create mapping from role name to role ID
        const roleNameToIdMap = allRoles.reduce(
          (map, role) => {
            map[role.name] = role.id
            return map
          },
          {} as Record<string, string>
        )

        // Convert role names to role IDs
        const roleIds = values.roles
          .map((roleName) => roleNameToIdMap[roleName])
          .filter(Boolean)

        // Create user with roles
        await createUser.mutateAsync({
          username: values.username,
          email: values.email,
          phone: values.phone || undefined,
          password: values.password,
          status: values.status as UserStatus,
          role_ids: roleIds,
        })

        queryClient.invalidateQueries({ queryKey: ['users'] })
      }

      form.reset()
      onSuccess()
    } catch (error) {
      console.error('Error submitting user form:', error)
    }
  }

  const isPasswordTouched = !!form.formState.dirtyFields.password
  const isSubmitting = createUser.isPending || updateUser.isPending

  return {
    form,
    onSubmit,
    isEdit,
    isPasswordTouched,
    isSubmitting,
    allRoles,
    userRoles,
  }
}
