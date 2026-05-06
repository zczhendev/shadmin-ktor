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

import type { Menu } from '@/types/menu'

export interface MenuWithChildren extends Menu {
  children?: MenuWithChildren[]
}

/**
 * 构建菜单层级结构（支持无限嵌套层级）
 * @param menus 扁平化的菜单数组
 * @returns 构建好的层级菜单数组
 */
export function buildMenuHierarchy(menus: Menu[]): MenuWithChildren[] {
  const cloned = menus.map((m) => ({ ...m }))

  // 同级仅依据 sequence 递增排序
  const sortMenus = (arr: MenuWithChildren[]) =>
    arr.slice().sort((a, b) => a.sequence - b.sequence)

  // 递归构建层级结构
  const buildChildren = (parentId: string | undefined): MenuWithChildren[] => {
    // Use == to match both null and undefined (backend returns null for root menus)
    const children = cloned.filter((m) => m.parent_id == parentId)
    const sortedChildren = sortMenus(children)

    sortedChildren.forEach((child) => {
      const childChildren = buildChildren(child.id)
      if (childChildren.length > 0) {
        child.children = childChildren
      }
    })

    return sortedChildren
  }

  // 构建根级菜单
  return buildChildren(undefined)
}

/**
 * 扁平化层级菜单结构用于表格显示
 */
export interface TableMenuItem extends Menu {
  level: number
  parentIndex?: string
  isExpanded?: boolean
  hierarchyIndex: string
  hidden?: boolean
}

export function flattenMenus(
  items: MenuWithChildren[],
  expanded: Record<string, boolean>,
  level = 0,
  parentIndex = ''
): TableMenuItem[] {
  const result: TableMenuItem[] = []

  items.forEach((item, index) => {
    const currentIndex = parentIndex ? `${parentIndex}.${index}` : `${index}`
    const tableItem: TableMenuItem = {
      ...item,
      level,
      parentIndex: parentIndex || undefined,
      isExpanded: expanded[currentIndex] || false,
      hierarchyIndex: currentIndex,
      // Add computed display fields
      hidden: item.visible === 'hide' || item.status === 'inactive',
    }

    result.push(tableItem)

    // Add children if expanded
    if (item.children && item.children.length > 0 && expanded[currentIndex]) {
      result.push(
        ...flattenMenus(item.children, expanded, level + 1, currentIndex)
      )
    }
  })

  return result
}

/**
 * 菜单项接口（用于角色权限选择）
 */
export interface MenuItem {
  id: string
  label: string
  disabled: boolean
  children?: MenuItem[]
}

/**
 * 将菜单数据转换为角色权限选择所需的格式
 */
export function transformMenusForRoleSelection(
  menus: MenuWithChildren[]
): MenuItem[] {
  const transform = (menuList: MenuWithChildren[]): MenuItem[] => {
    return menuList.map((menu) => ({
      id: menu.id,
      label: menu.name,
      disabled: menu.status === 'inactive',
      children: menu.children ? transform(menu.children) : undefined,
    }))
  }

  return transform(menus)
}
