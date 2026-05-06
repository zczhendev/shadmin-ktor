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

import { useCallback, useState } from 'react'
import type { MenuItem } from '@/lib/menu-utils'

interface MenuSelectionState {
  expandedNodes: Set<string>
  selectedMenus: Set<string>
  menusData: MenuItem[]
}

export function useMenuSelection() {
  const [state, setState] = useState<MenuSelectionState>({
    expandedNodes: new Set(),
    selectedMenus: new Set(),
    menusData: [],
  })

  const setMenusData = useCallback((data: MenuItem[]) => {
    setState((prev) => ({ ...prev, menusData: data }))
  }, [])

  const setSelectedMenus = useCallback((menus: Set<string>) => {
    setState((prev) => ({ ...prev, selectedMenus: menus }))
  }, [])

  const getAllDescendantIds = useCallback(
    (menuId: string, items: MenuItem[]): string[] => {
      const findMenu = (id: string, menuList: MenuItem[]): MenuItem | null => {
        for (const menu of menuList) {
          if (menu.id === id) return menu
          if (menu.children) {
            const found = findMenu(id, menu.children)
            if (found) return found
          }
        }
        return null
      }

      const collectDescendants = (menu: MenuItem): string[] => {
        const ids: string[] = []
        if (menu.children) {
          menu.children.forEach((child) => {
            ids.push(child.id)
            ids.push(...collectDescendants(child))
          })
        }
        return ids
      }

      const menu = findMenu(menuId, items)
      return menu ? collectDescendants(menu) : []
    },
    []
  )

  const toggleNode = useCallback((id: string) => {
    setState((prev) => {
      const newExpandedNodes = new Set(prev.expandedNodes)
      if (newExpandedNodes.has(id)) {
        newExpandedNodes.delete(id)
      } else {
        newExpandedNodes.add(id)
      }
      return { ...prev, expandedNodes: newExpandedNodes }
    })
  }, [])

  const toggleSelect = useCallback(
    (id: string, checked: boolean) => {
      setState((prev) => {
        const newSelectedMenus = new Set(prev.selectedMenus)

        if (checked) {
          newSelectedMenus.add(id)
          const childIds = getAllDescendantIds(id, prev.menusData)
          childIds.forEach((childId) => newSelectedMenus.add(childId))
        } else {
          newSelectedMenus.delete(id)
          const childIds = getAllDescendantIds(id, prev.menusData)
          childIds.forEach((childId) => newSelectedMenus.delete(childId))
        }

        return { ...prev, selectedMenus: newSelectedMenus }
      })
    },
    [getAllDescendantIds]
  )

  const toggleSelectAll = useCallback(() => {
    setState((prev) => {
      if (prev.selectedMenus.size) {
        return { ...prev, selectedMenus: new Set() }
      }
      const all = new Set<string>()
      const walk = (items: MenuItem[]) =>
        items.forEach((i) => {
          all.add(i.id)
          if (i.children) walk(i.children)
        })
      walk(prev.menusData)
      return { ...prev, selectedMenus: all }
    })
  }, [])

  const toggleExpandRoot = useCallback(() => {
    setState((prev) => {
      const roots = prev.menusData.map((m) => m.id)
      const allExpanded = roots.every((r) => prev.expandedNodes.has(r))
      const newExpandedNodes = allExpanded ? new Set<string>() : new Set(roots)
      return { ...prev, expandedNodes: newExpandedNodes }
    })
  }, [])

  const resetSelection = useCallback(() => {
    setState((prev) => ({
      ...prev,
      expandedNodes: new Set(),
      selectedMenus: new Set(),
    }))
  }, [])

  return {
    ...state,
    setMenusData,
    setSelectedMenus,
    toggleNode,
    toggleSelect,
    toggleSelectAll,
    toggleExpandRoot,
    resetSelection,
  }
}
