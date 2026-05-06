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

export interface Menu {
  id: string
  name: string
  sequence: number
  type: MenuType
  path?: string
  icon: string
  component?: string
  route_name?: string
  query?: string
  is_frame: boolean
  visible: string // show/hide
  permissions?: string
  status: MenuStatus
  parent_id?: string
  children?: Menu[]
  roles?: string[]
  apiResources?: string[]
}

export interface MenuTreeNode {
  id: string
  name: string
  sequence: number
  type: MenuType
  path?: string
  icon: string
  component?: string
  route_name?: string
  query?: string
  is_frame: boolean
  visible: string // show/hide
  permissions?: string
  status: MenuStatus
  parent_id?: string
  children?: MenuTreeNode[]
  roles?: string[]
  apiResources?: string[]
}

export interface CreateMenuRequest {
  name: string
  sequence: number
  type: MenuType
  path?: string
  icon: string
  component?: string
  route_name?: string
  query?: string
  is_frame: boolean
  visible: string // show/hide
  permissions?: string
  status?: MenuStatus
  parent_id?: string
  apiResources?: string[]
}

export interface UpdateMenuRequest {
  name: string
  sequence: number
  type: MenuType
  path?: string
  icon: string
  component?: string
  route_name?: string
  query?: string
  is_frame: boolean
  visible: string // show/hide
  permissions?: string
  status: MenuStatus
  parent_id?: string
  apiResources?: string[]
}

export interface MenuPagedResult {
  list: Menu[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface MenuQueryParams {
  type?: MenuType
  status?: MenuStatus
  parent_id?: string
  search?: string
  page?: number
  page_size?: number
}
// Resources response structure
export interface ResourcesResponse {
  menus: MenuTreeNode[]
  permissions: string[] | null
  roles: string[]
  is_admin: boolean
}

// Type definitions
export type MenuType = 'menu' | 'button'
export type MenuStatus = 'active' | 'inactive'
