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

// 角色信息 (对应后端RoleInfo)
export interface RoleInfo {
  id: string // 角色ID
  name: string // 角色显示名称
  type: string // 角色类型
}

// Role Management
export interface Role {
  id: string
  name: string
  sequence: number
  data_scope?: string
  status: 'active' | 'inactive'
  is_system?: boolean
  parent_id?: string
  menus?: string[]
  permissions?: string[]
  inherited_menus?: string[]
  inherited_permissions?: string[]
  created_at?: string
  updated_at?: string
  menu_ids?: string[]
}

export interface CreateRoleRequest {
  name: string
  sequence: number
  data_scope?: string
  status?: 'active' | 'inactive'
  parent_id?: string
  menu_ids?: string[]
  permission_ids?: string[]
}

export interface UpdateRoleRequest {
  name?: string
  sequence?: number
  data_scope?: string
  status?: 'active' | 'inactive'
  parent_id?: string
  menu_ids?: string[]
  permission_ids?: string[]
}

export interface RolePagedResult {
  list: Role[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface AssignRoleRequest {
  user_id: string
  role_id: string
}
