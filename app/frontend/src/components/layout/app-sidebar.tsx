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

import { useLayout } from '@/context/layout-provider'
import { useSidebarData } from '@/hooks/use-sidebar-data'
import { usePermission } from '@/hooks/usePermission'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { TeamSwitcher } from '@/components/layout/team-switcher.tsx'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import type { NavGroup as NavGroupType, NavItem, NavLink } from './types'

/**
 * Recursively filter nav items based on menu permissions.
 * Returns null if the item (and all its children) should be hidden.
 */
function filterNavItems(
  items: NavItem[],
  canAccess: (permission: string) => boolean
): NavItem[] {
  const result: NavItem[] = []

  for (const item of items) {
    // Check if this item has a permission requirement
    const itemAllowed =
      !item.permission || item.permission.trim() === '' || canAccess(item.permission)

    if ('items' in item && item.items && item.items.length > 0) {
      // Collapsible item: filter children first
      const visibleChildren = filterNavItems(item.items, canAccess)

      // If children remain, show this item with filtered children
      if (visibleChildren.length > 0) {
        result.push({
          ...item,
          items: visibleChildren,
        })
      } else if (itemAllowed && 'url' in item && item.url) {
        // No visible children but item itself has a URL and is allowed
        const linkItem = item as NavLink
        result.push({
          title: linkItem.title,
          url: linkItem.url,
          icon: linkItem.icon,
          badge: linkItem.badge,
          permission: linkItem.permission,
        } as NavItem)
      }
      // If not allowed and no visible children, skip entirely
    } else if ('url' in item && item.url) {
      // Simple link item
      if (itemAllowed) {
        result.push(item)
      }
    }
  }

  return result
}

/**
 * Filter nav groups based on menu permissions.
 * A group is hidden if it has no visible items and no accessible direct URL.
 */
function filterNavGroups(
  groups: NavGroupType[],
  canAccess: (permission: string) => boolean
): NavGroupType[] {
  const result: NavGroupType[] = []

  for (const group of groups) {
    const groupAllowed =
      !group.permission ||
      group.permission.trim() === '' ||
      canAccess(group.permission)

    if (group.items && group.items.length > 0) {
      const visibleItems = filterNavItems(group.items, canAccess)

      if (visibleItems.length > 0) {
        result.push({
          ...group,
          items: visibleItems,
        })
      } else if (groupAllowed && group.url) {
        // No visible items but group itself has a URL and is allowed
        result.push({
          title: group.title,
          url: group.url,
          icon: group.icon,
          badge: group.badge,
          permission: group.permission,
        })
      }
    } else if (group.url && groupAllowed) {
      // Direct-link group with no items
      result.push(group)
    }
  }

  return result
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { collapsible, variant } = useLayout()
  const { sidebarData } = useSidebarData()
  const { canAccessMenu } = usePermission()

  // Filter nav groups based on user permissions
  const visibleNavGroups = filterNavGroups(
    sidebarData.navGroups,
    canAccessMenu
  )

  return (
    <Sidebar {...props} collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent className='gap-0 px-2 py-3'>
        {visibleNavGroups.map((group, index) => (
          <div key={group.title}>
            <NavGroup {...group} />
            {index < visibleNavGroups.length - 1 && (
              <SidebarSeparator className='my-3' />
            )}
          </div>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
