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

import { useQuery } from '@tanstack/react-query'
import i18n from '@/i18n'
import { getMenuTree } from '@/services/menuApi'
import type { MenuTreeNode } from '@/types/menu'

interface UseMenuDataProps {
  open: boolean
}

export function useMenuData({ open }: UseMenuDataProps) {
  const { data: parentMenuOptions } = useQuery({
    queryKey: ['parent-menus'],
    queryFn: async () => {
      const menuTree = await getMenuTree('active')

      const flattenMenus = (
        nodes: MenuTreeNode[],
        result: Array<{ id: string; name: string }> = []
      ): Array<{
        id: string
        name: string
      }> => {
        nodes.forEach((node: MenuTreeNode) => {
          if (node.type === 'menu') {
            result.push({
              id: node.id,
              name: node.name,
            })
            if (node.children) {
              flattenMenus(node.children, result)
            }
          }
        })
        return result
      }

      const parentOptions = flattenMenus(menuTree)
      return [{ id: 'ROOT', name: i18n.t('system.menus.form.rootCategory') }, ...parentOptions]
    },
    enabled: open,
    staleTime: 5 * 60 * 1000,
  })

  return {
    parentMenuOptions,
  }
}
