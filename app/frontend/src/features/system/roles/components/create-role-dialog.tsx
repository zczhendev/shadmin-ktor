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

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getMenus } from '@/services/menuApi'
import {
  createRole,
  getRole,
  getRoleMenus,
  getRoles,
  updateRole,
} from '@/services/roleApi'
import { getPermissions, getRolePermissions } from '@/services/permissionApi'
import {
  type CreateRoleRequest,
  type Role,
  type UpdateRoleRequest,
} from '@/types/role'
import { type Permission } from '@/types/permission'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/error'
import {
  buildMenuHierarchy,
  transformMenusForRoleSelection,
} from '@/lib/menu-utils'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useMenuSelection } from '../hooks/useMenuSelection'
import { type RoleFormData, useRoleForm } from '../hooks/useRoleForm'
import { MenuTreeSection } from './MenuTreeSection'

interface CreateRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: Role | null // Optional role for edit mode
}

export function CreateRoleDialog({
  open,
  onOpenChange,
  role,
}: CreateRoleDialogProps) {
  const { t } = useTranslation()
  const isEditMode = !!role
  const queryClient = useQueryClient()

  const dataScopeOptions = useMemo(
    () => [
      { value: 'ALL', label: t('system.roles.table.dataScopeAll') },
      { value: 'DEPT', label: t('system.roles.table.dataScopeDept') },
      { value: 'DEPT_AND_CHILD', label: t('system.roles.table.dataScopeDeptAndChild') },
      { value: 'SELF', label: t('system.roles.table.dataScopeSelf') },
    ],
    [t]
  )

  const menuSelection = useMenuSelection()
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set()
  )

  // Fetch menus for role selection
  const { data: menuData, isLoading: menusLoading } = useQuery({
    queryKey: ['menus-for-role'],
    queryFn: () => {
      return getMenus({
        status: 'active',
        page_size: 1000,
      })
    },
    enabled: open,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  // Fetch all permissions
  const { data: permissionsData, isLoading: permissionsLoading } = useQuery({
    queryKey: ['permissions-for-role'],
    queryFn: getPermissions,
    enabled: open,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  // Fetch all roles for parent selection
  const { data: allRolesPaged } = useQuery({
    queryKey: ['roles-all'],
    queryFn: () => getRoles({ page: 1, page_size: 1000 }),
    enabled: open,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
  const allRolesData = allRolesPaged?.list

  // Available parent roles: exclude current role and all its descendants
  const availableParentRoles = useMemo(() => {
    if (!allRolesData) return []
    const currentId = isEditMode ? role?.id : undefined
    if (!currentId) return allRolesData
    // BFS to find all descendants
    const descendants = new Set<string>()
    const queue = [currentId]
    while (queue.length > 0) {
      const pid = queue.shift()!
      const children = allRolesData.filter((r) => r.parent_id === pid)
      for (const child of children) {
        if (!descendants.has(child.id)) {
          descendants.add(child.id)
          queue.push(child.id)
        }
      }
    }
    return allRolesData.filter((r) => r.id !== currentId && !descendants.has(r.id))
  }, [allRolesData, isEditMode, role])

  // Fetch role details when in edit mode
  const {
    data: roleDetail,
    isLoading: roleDetailLoading,
    isError: roleDetailError,
  } = useQuery({
    queryKey: ['role-detail', role?.id],
    queryFn: () => getRole(role!.id),
    enabled: !!(open && isEditMode && role?.id),
    retry: 1,
  })

  // Fetch role menus when in edit mode
  const {
    data: roleMenus,
    isLoading: roleMenusLoading,
    isError: roleMenusError,
  } = useQuery({
    queryKey: ['roleMenus', role?.id],
    queryFn: () => getRoleMenus(role!.id),
    enabled: !!(open && isEditMode && role?.id),
    retry: 1,
  })

  // Fetch role permissions when in edit mode
  const {
    data: rolePermissionsData,
    isLoading: rolePermissionsLoading,
    isError: rolePermissionsError,
  } = useQuery({
    queryKey: ['rolePermissions', role?.id],
    queryFn: () => getRolePermissions(role!.id),
    enabled: !!(open && isEditMode && role?.id),
    retry: 1,
  })

  // Show toast on edit data fetch errors
  useEffect(() => {
    if (roleDetailError) toast.error(t('system.roles.messages.loadDetailFailed'))
    if (roleMenusError) toast.error(t('system.roles.messages.loadMenusFailed'))
    if (rolePermissionsError) toast.error(t('system.roles.messages.loadPermissionsFailed'))
  }, [roleDetailError, roleMenusError, rolePermissionsError, t])

  const { form } = useRoleForm({
    open,
    isEditMode,
    role: roleDetail || role,
    roleMenus,
    rolePermissions: rolePermissionsData,
    onMenuSelectionChange: menuSelection.setSelectedMenus,
    onPermissionSelectionChange: setSelectedPermissions,
  })

  // Mutation for both create and update
  const roleMutation = useMutation({
    mutationFn: (data: RoleFormData) => {
      if (isEditMode && role) {
        const payload: UpdateRoleRequest = {
          name: data.name,
          sequence: data.sequence,
          status: data.status,
          data_scope: data.data_scope,
          parent_id: data.parent_id,
          menu_ids: Array.from(menuSelection.selectedMenus),
          permission_ids: Array.from(selectedPermissions),
        }
        return updateRole(role.id, payload)
      } else {
        const payload: CreateRoleRequest = {
          name: data.name,
          sequence: data.sequence,
          status: data.status,
          data_scope: data.data_scope,
          parent_id: data.parent_id,
          menu_ids: Array.from(menuSelection.selectedMenus),
          permission_ids: Array.from(selectedPermissions),
        }
        return createRole(payload)
      }
    },
    onSuccess: () => {
      toast.success(isEditMode ? t('system.roles.messages.updateSuccess') : t('system.roles.messages.createSuccess'))
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      closeDialog()
    },
    onError: (e: unknown) => {
      toast.error(
        getErrorMessage(e, isEditMode ? t('system.roles.messages.updateFailed') : t('system.roles.messages.createFailed'))
      )
    },
  })

  const closeDialog = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const { mutate } = roleMutation
  const onSubmit = useCallback(
    (data: RoleFormData) => {
      mutate(data)
    },
    [mutate]
  )

  // Process menu data when it changes
  useEffect(() => {
    if (menuData?.list) {
      const hierarchicalMenus = buildMenuHierarchy(menuData.list)
      const transformedMenus = transformMenusForRoleSelection(hierarchicalMenus)
      menuSelection.setMenusData(transformedMenus)
    }
  }, [menuData, menuSelection.setMenusData])

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      menuSelection.resetSelection()
      setSelectedPermissions(new Set())
    }
  }, [open, menuSelection.resetSelection])

  // Group permissions by module
  const permissionsByModule = useMemo(() => {
    if (!permissionsData) return new Map<string, Permission[]>()
    const map = new Map<string, Permission[]>()
    permissionsData.forEach((perm) => {
      const module = perm.module || '其他'
      if (!map.has(module)) {
        map.set(module, [])
      }
      map.get(module)!.push(perm)
    })
    return map
  }, [permissionsData])

  const togglePermission = useCallback((code: string) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev)
      if (next.has(code)) {
        next.delete(code)
      } else {
        next.add(code)
      }
      return next
    })
  }, [])

  const toggleModulePermissions = useCallback(
    (module: string) => {
      const perms = permissionsByModule.get(module) || []
      const codes = perms.map((p) => p.code)
      const allSelected = codes.every((c) => selectedPermissions.has(c))

      setSelectedPermissions((prev) => {
        const next = new Set(prev)
        if (allSelected) {
          codes.forEach((c) => next.delete(c))
        } else {
          codes.forEach((c) => next.add(c))
        }
        return next
      })
    },
    [permissionsByModule, selectedPermissions]
  )

  // Current parent role and inherited permissions preview
  const selectedParentId = form.watch('parent_id')
  const parentRole = useMemo(() => {
    if (!selectedParentId || !allRolesData) return null
    return allRolesData.find((r) => r.id === selectedParentId)
  }, [selectedParentId, allRolesData])

  const inheritedPermissionCodes = useMemo(() => {
    if (!parentRole) return []
    const direct = parentRole.permissions || []
    const inherited = parentRole.inherited_permissions || []
    return [...new Set([...direct, ...inherited])]
  }, [parentRole])

  const isEditLoading =
    isEditMode &&
    (roleDetailLoading || roleMenusLoading || rolePermissionsLoading)

  const renderStatusOverlay = useMemo(() => {
    if (!open) return null
    if (menusLoading || permissionsLoading || isEditLoading)
      return (
        <div className='text-muted-foreground p-4 text-sm'>{t('system.roles.dialogs.dataLoading')}</div>
      )
    return null
  }, [open, menusLoading, permissionsLoading, isEditLoading, t])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex min-w-[40%] flex-col'>
        <SheetHeader>
          <SheetTitle>{isEditMode ? t('system.roles.dialogs.editTitle') : t('system.roles.dialogs.createTitle')}</SheetTitle>
          <SheetDescription>
            {isEditMode
              ? t('system.roles.dialogs.editDesc')
              : t('system.roles.dialogs.createDesc')}
          </SheetDescription>
        </SheetHeader>

        {renderStatusOverlay}

        <div className='flex min-h-0 flex-1 flex-col'>
          {open && !menusLoading && !permissionsLoading && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='mx-4 flex h-full flex-col space-y-4 overflow-y-auto'
              >
                {/* 基本信息 */}
                <div className='space-y-4'>
                  <h4 className='text-sm font-semibold'>{t('system.roles.dialogs.basicInfo')}</h4>
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('system.roles.dialogs.roleName')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('system.roles.dialogs.roleNamePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='sequence'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('system.roles.dialogs.roleSequence')}</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            {...field}
                            value={field.value?.toString() || '0'}
                            onChange={(e) => {
                              const v = e.target.value
                              const n = v === '' ? 0 : parseInt(v, 10)
                              field.onChange(Number.isNaN(n) ? 0 : n)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='parent_id'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('system.roles.dialogs.inheritedFrom')}</FormLabel>
                        <Select
                          onValueChange={(v) =>
                            field.onChange(v === '__none__' ? undefined : v)
                          }
                          value={field.value ?? '__none__'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('system.roles.dialogs.parentPlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='__none__'>{t('system.roles.dialogs.none')}</SelectItem>
                            {availableParentRoles.map((r) => (
                              <SelectItem key={r.id} value={r.id}>
                                {r.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='data_scope'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('system.roles.dialogs.dataScope')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('system.roles.dialogs.dataScopePlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {dataScopeOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='status'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('system.roles.dialogs.status')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='active'>{t('system.roles.dialogs.statusActive')}</SelectItem>
                            <SelectItem value='inactive'>{t('system.roles.dialogs.statusInactive')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 权限配置 */}
                <div className='space-y-3'>
                  <h4 className='text-sm font-semibold'>{t('system.roles.dialogs.permissionConfig')}</h4>
                  {inheritedPermissionCodes.length > 0 && (
                    <div className='rounded-md border border-dashed bg-muted/30 p-3'>
                      <p className='text-muted-foreground mb-2 text-xs font-medium'>
                        {t('system.roles.table.inheritedFrom', { name: parentRole?.name })}
                      </p>
                      <div className='flex flex-wrap gap-1.5'>
                        {inheritedPermissionCodes.map((code) => {
                          const permName =
                            permissionsData?.find((p) => p.code === code)?.name ??
                            code
                          return (
                            <Badge
                              key={code}
                              variant='secondary'
                              className='text-xs'
                            >
                              {permName}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  <div className='max-h-[240px] overflow-y-auto rounded-md border p-3'>
                    {permissionsByModule.size === 0 && (
                      <p className='text-muted-foreground text-sm'>{t('system.roles.dialogs.noPermissions')}</p>
                    )}
                    {Array.from(permissionsByModule.entries()).map(
                      ([module, perms]) => {
                        const moduleCodes = perms.map((p) => p.code)
                        const moduleSelectedCount = moduleCodes.filter((c) =>
                          selectedPermissions.has(c)
                        ).length
                        const allSelected =
                          moduleSelectedCount === moduleCodes.length &&
                          moduleCodes.length > 0

                        return (
                          <div key={module} className='mb-3'>
                            <div className='flex items-center gap-2 pb-1'>
                              <Checkbox
                                checked={
                                  moduleSelectedCount > 0
                                    ? allSelected
                                      ? true
                                      : 'indeterminate'
                                    : false
                                }
                                onCheckedChange={() =>
                                  toggleModulePermissions(module)
                                }
                              />
                              <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                                {module}
                              </span>
                              <span className='text-muted-foreground text-xs'>
                                ({moduleSelectedCount}/{moduleCodes.length})
                              </span>
                            </div>
                            <div className='ml-6 grid grid-cols-2 gap-2'>
                              {perms.map((perm) => (
                                <div
                                  key={perm.code}
                                  className='flex items-center gap-2'
                                >
                                  <Checkbox
                                    checked={selectedPermissions.has(perm.code)}
                                    onCheckedChange={() =>
                                      togglePermission(perm.code)
                                    }
                                  />
                                  <label className='text-sm'>{perm.name}</label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      }
                    )}
                  </div>
                  <p className='text-muted-foreground text-xs'>
                    {t('system.roles.dialogs.selectedPermissions', { count: selectedPermissions.size })}
                  </p>
                </div>

                {/* 菜单配置 */}
                <div className='min-h-0 flex-1 space-y-3'>
                  <h4 className='text-sm font-semibold'>{t('system.roles.dialogs.menuConfig')}</h4>
                  <MenuTreeSection
                    menusData={menuSelection.menusData}
                    expandedNodes={menuSelection.expandedNodes}
                    selectedMenus={menuSelection.selectedMenus}
                    onToggle={menuSelection.toggleNode}
                    onSelect={menuSelection.toggleSelect}
                    onSelectAll={menuSelection.toggleSelectAll}
                    onExpandRoot={menuSelection.toggleExpandRoot}
                    className='h-full overflow-hidden'
                  />
                </div>

                <SheetFooter className='pt-4'>
                  <div className='flex w-full justify-center'>
                    <Button
                      type='submit'
                      disabled={roleMutation.isPending}
                      className='mx-4 w-full max-w-xs'
                    >
                      {roleMutation.isPending
                        ? isEditMode
                          ? t('system.roles.dialogs.updating')
                          : t('system.roles.dialogs.creating')
                        : isEditMode
                          ? t('system.roles.dialogs.update')
                          : t('system.roles.dialogs.create')}
                    </Button>
                  </div>
                </SheetFooter>
              </form>
            </Form>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
