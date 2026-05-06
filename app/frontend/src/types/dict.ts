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

// 字典状态类型
export type DictStatus = 'active' | 'inactive'

// 字典类型接口
export interface DictType {
  id: string
  code: string
  name: string
  status: DictStatus
  remark?: string
  created_at: Date
  updated_at: Date
}

// 字典项接口
export interface DictItem {
  id: string
  type_id: string
  label: string
  value: string
  sort: number
  is_default: boolean
  status: DictStatus
  color?: string
  remark?: string
  created_at: Date
  updated_at: Date
}

// 创建字典类型请求
export interface CreateDictTypeRequest {
  code: string
  name: string
  status?: DictStatus
  remark?: string
}

// 更新字典类型请求
export interface UpdateDictTypeRequest {
  code?: string
  name?: string
  status?: DictStatus
  remark?: string
}

// 字典类型查询参数
export interface DictTypeQueryParams {
  page?: number
  page_size?: number
  code?: string
  name?: string
  status?: DictStatus
  search?: string
  sort_by?: string
  order?: 'asc' | 'desc'
}

// 创建字典项请求
export interface CreateDictItemRequest {
  type_id: string
  label: string
  value: string
  sort?: number
  is_default?: boolean
  status?: DictStatus
  color?: string
  remark?: string
}

// 更新字典项请求
export interface UpdateDictItemRequest {
  label?: string
  value?: string
  sort?: number
  is_default?: boolean
  status?: DictStatus
  color?: string
  remark?: string
}

// 字典项查询参数
export interface DictItemQueryParams {
  page?: number
  page_size?: number
  type_id?: string
  type_code?: string
  label?: string
  value?: string
  status?: DictStatus
  search?: string
  sort_by?: string
  order?: 'asc' | 'desc'
}

// 字典类型分页结果
export interface DictTypePagedResult {
  list: DictType[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// 字典项分页结果
export interface DictItemPagedResult {
  list: DictItem[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// 表单状态
export interface DictTypeFormData {
  code: string
  name: string
  status: DictStatus
  remark: string
}

export interface DictItemFormData {
  type_id: string
  label: string
  value: string
  sort: number
  is_default: boolean
  status: DictStatus
  color: string
  remark: string
}

// 字典操作类型
export type DictAction = 'create' | 'edit' | 'view'

// 字典对话框状态
export interface DictDialogState {
  open: boolean
  action: DictAction
  data?: DictType | DictItem
}

// 字典表格选择状态
export interface DictTableSelection {
  selectedTypeId?: string
  selectedType?: DictType
}
