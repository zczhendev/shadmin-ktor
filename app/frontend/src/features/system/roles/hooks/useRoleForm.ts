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

import { useCallback, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Role } from '@/types/role'
import i18n from '@/i18n'

function createRoleSchema() {
  return z.object({
    name: z.string().min(1, i18n.t('system.roles.validation.nameRequired')).max(100, i18n.t('system.roles.validation.nameMaxLength')),
    sequence: z.number().int().min(0, i18n.t('system.roles.validation.sequenceNonNegative')),
    status: z.enum(['active', 'inactive']),
    data_scope: z.enum(['ALL', 'DEPT', 'DEPT_AND_CHILD', 'SELF']),
    parent_id: z.string().optional(),
  })
}

export type RoleFormData = z.infer<ReturnType<typeof createRoleSchema>>

interface UseRoleFormProps {
  open: boolean
  isEditMode: boolean
  role?: Role | null
  roleMenus?: string[]
  rolePermissions?: string[]
  onMenuSelectionChange: (menus: Set<string>) => void
  onPermissionSelectionChange: (permissions: Set<string>) => void
}

export function useRoleForm({
  open,
  isEditMode,
  role,
  roleMenus,
  rolePermissions,
  onMenuSelectionChange,
  onPermissionSelectionChange,
}: UseRoleFormProps) {
  const form = useForm<RoleFormData>({
    resolver: zodResolver(createRoleSchema()),
    defaultValues: {
      name: '',
      sequence: 0,
      status: 'active',
      data_scope: 'ALL',
      parent_id: undefined,
    },
  })

  const resetForm = useCallback(() => {
    if (open && isEditMode && role) {
      form.reset({
        name: role.name,
        sequence: role.sequence,
        status: role.status,
        data_scope: (role.data_scope as 'ALL' | 'DEPT' | 'DEPT_AND_CHILD' | 'SELF') || 'ALL',
        parent_id: role.parent_id,
      })
      if (roleMenus) {
        onMenuSelectionChange(new Set(roleMenus))
      }
      if (rolePermissions) {
        onPermissionSelectionChange(new Set(rolePermissions))
      }
    } else if (open && !isEditMode) {
      form.reset({
        name: '',
        sequence: 0,
        status: 'active',
        data_scope: 'ALL',
        parent_id: undefined,
      })
      onMenuSelectionChange(new Set())
      onPermissionSelectionChange(new Set())
    }

    if (!open) {
      form.reset()
      onMenuSelectionChange(new Set())
      onPermissionSelectionChange(new Set())
    }
  }, [open, isEditMode, role, roleMenus, rolePermissions, form, onMenuSelectionChange, onPermissionSelectionChange])

  useEffect(() => {
    resetForm()
  }, [resetForm])

  return { form, resetForm }
}
