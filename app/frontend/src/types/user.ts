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

export type UserRole = 'admin' | 'user' | 'viewer'

export type UserStatus = 'active' | 'inactive' | 'invited' | 'suspended'

export interface User {
  id: string
  username: string
  email: string
  phone?: string
  bio?: string
  avatar?: string
  status: UserStatus
  created_at: Date
  updated_at: Date
  invited_at?: Date
  invited_by?: string
  roles?: string[]
}

export interface CreateUserRequest {
  username: string
  email: string
  phone?: string
  password: string
  status?: UserStatus
  role_ids?: string[]
}

export interface InviteUserRequest {
  email: string
  role_ids?: string[]
  message?: string
}

export interface UserUpdateRequest {
  username?: string
  email?: string
  phone?: string
  password?: string
  status?: UserStatus
  avatar?: string
  role_ids?: string[]
}

export interface MenuItem {
  id: string
  name: string
  path: string
  icon: string
  component: string
  sort: number
  visible: boolean
  requiresAuth: boolean
  requiresAdmin: boolean
}

export interface UserPermissions {
  user_id: string
  permissions: string[][]
  roles: string[]
  menus: MenuItem[] // 用户可访问的菜单列表
  is_admin: boolean // 是否管理员
}
