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

import { menuService } from '@/services/menu-service'
import { sidebarService } from '@/services/sidebarService'
import { Command } from 'lucide-react'
import { type SidebarData } from '../types'

// Default fallback data
const defaultSidebarData = {
  user: {
    name: 'User',
    email: 'user@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'shadmin',
      logo: Command,
      plan: 'Vite + ShadcnUI',
    },
  ],
}

/**
 * Get dynamic sidebar data from API
 */
export async function getDynamicSidebarData(): Promise<SidebarData> {
  try {
    // Use the new sidebar service to get all data
    const sidebarData = await sidebarService.getSidebarData()

    if (sidebarData.navGroups && sidebarData.navGroups.length > 0) {
      return {
        user: sidebarData.user,
        teams: sidebarData.teams,
        navGroups: sidebarData.navGroups,
      }
    } else {
      // eslint-disable-next-line no-console
      console.warn('No dynamic menu data loaded')
      return {
        user: sidebarData.user,
        teams: sidebarData.teams,
        navGroups: [],
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load dynamic sidebar data:', error)
    // Fallback to default data if everything fails
    return {
      ...defaultSidebarData,
      navGroups: [],
    }
  }
}

/**
 * Get sidebar data synchronously (returns cached dynamic data or default data)
 */
export function getSidebarData(): SidebarData {
  // Use the sidebar service to get cached data
  const cachedData = sidebarService.getCachedSidebarData()
  const cachedMenuData = menuService.getCachedMenuData()

  return {
    user: cachedData.user || defaultSidebarData.user,
    teams: cachedData.teams || defaultSidebarData.teams,
    navGroups: cachedMenuData || [],
  }
}
