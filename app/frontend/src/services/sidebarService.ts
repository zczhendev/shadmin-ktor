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

import { Command } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { type SidebarData } from '@/components/layout/types'
import { menuService } from './menu-service'

/**
 * Sidebar service for fetching all sidebar data from APIs
 * Consolidates user profile, teams, and menu data
 */
export class SidebarService {
  /**
   * Get complete sidebar data from APIs
   */
  async getSidebarData(): Promise<SidebarData> {
    try {
      // Load all data in parallel for better performance
      const [userProfile, menuData] = await Promise.all([
        this.getUserProfile(),
        menuService.loadMenuData(),
      ])

      return {
        user: userProfile,
        teams: [
          {
            name: 'shadmin',
            logo: Command,
            plan: 'Vite + ShadcnUI',
          },
        ],
        navGroups: menuData || [],
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load sidebar data:', error)
      throw error
    }
  }

  /**
   * Get user profile data from auth store (avoid duplicate API calls)
   */
  private async getUserProfile() {
    try {
      const auth = useAuthStore.getState().auth

      // Use profile from auth store if available
      if (auth.profile) {
        return {
          name: auth.profile.username || auth.profile.email || 'User',
          email: auth.profile.email || '',
          avatar: auth.profile.avatar || '/avatars/shadcn.jpg',
        }
      }

      // Fallback to basic user data from JWT token
      if (auth.user) {
        return {
          name: auth.user.email || auth.user.accountNo || 'User',
          email: auth.user.email || '',
          avatar: '/avatars/shadcn.jpg',
        }
      }

      // If no authenticated user, return default data
      console.warn('No authenticated user found, using default user data')
      return {
        name: 'User',
        email: 'user@example.com',
        avatar: '/avatars/shadcn.jpg',
      }
    } catch (error) {
      console.error('Failed to get user data:', error)
      return {
        name: 'User',
        email: 'user@example.com',
        avatar: '/avatars/shadcn.jpg',
      }
    }
  }

  /**
   * Refresh sidebar data (clears cache and reloads)
   */
  async refreshSidebarData(): Promise<SidebarData> {
    // Clear menu cache to force reload
    await menuService.reloadMenuData()
    return this.getSidebarData()
  }

  /**
   * Get cached sidebar data synchronously
   * Returns data from auth store and cached menu data
   */
  getCachedSidebarData(): Partial<SidebarData> {
    const auth = useAuthStore.getState().auth
    const cachedMenuData = menuService.getCachedMenuData()

    // Get user data from auth store
    let userData = {
      name: 'User',
      email: 'user@example.com',
      avatar: '/avatars/shadcn.jpg',
    }

    if (auth.user) {
      userData = {
        name: auth.user.email || 'User',
        email: auth.user.email,
        avatar: '/avatars/shadcn.jpg',
      }
    }

    return {
      user: userData,
      teams: [
        {
          name: 'shadmin',
          logo: Command,
          plan: 'Vite + ShadcnUI',
        },
      ],
      navGroups: cachedMenuData || undefined,
    }
  }
}

// Export singleton instance
export const sidebarService = new SidebarService()
