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

import { type MenuTreeNode, type ResourcesResponse } from '@/types/menu'
import { apiClient } from './config'

/**
 * Resource API service for fetching menu resources from backend
 * Based on the resource_controller.go endpoints
 */

// GET /resources - Get resources (menu tree)
export const getResources = async (): Promise<MenuTreeNode[]> => {
  try {
    const response = await apiClient.get(`/api/v1/resources`)

    if (response.data && response.data.data) {
      const resourcesData: ResourcesResponse = response.data.data
      console.log(
        'API Response - Total menu items received:',
        resourcesData.menus?.length || 0
      )
      console.log('API Response - Permissions:', resourcesData.permissions)
      return resourcesData.menus || []
    } else {
      console.warn('No menu data returned from API')
      return []
    }
  } catch (error) {
    console.error('Failed to fetch resources:', error)
    throw error
  }
}

// GET /resources - Get complete resources with permissions
export const getResourcesWithPermissions =
  async (): Promise<ResourcesResponse> => {
    try {
      const response = await apiClient.get(`/api/v1/resources`)

      if (response.data && response.data.data) {
        return response.data.data
      } else {
        return { menus: [], permissions: null, roles: [], is_admin: false }
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error)
      throw error
    }
  }
