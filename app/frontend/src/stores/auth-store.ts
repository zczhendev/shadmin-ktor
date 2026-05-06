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

import { decodeJwt } from '@/lib/jwt'
import { registerAuthStoreReset } from '@/services/config'
import { menuService } from '@/services/menu-service'
import { getProfile } from '@/services/profileApi'
import { type User } from '@/types/user'
import { create } from 'zustand'
import {
  getAccessToken,
  setAccessToken as persistAccessToken,
  getRefreshToken,
  setRefreshToken as persistRefreshToken,
  removeAllTokens,
} from '@/lib/token-storage'

export interface AuthUser {
  accountNo: string
  email: string
  role: string[]
  permissions: string[]
  is_admin: boolean
  exp: number
}

interface UserPermissions {
  permissions: string[][]
  roles: string[]
  menus: string[]
  is_admin: boolean
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    profile: User | null
    setProfile: (profile: User | null) => void
    isLoadingProfile: boolean
    fetchProfile: () => Promise<void>
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    refreshToken: string
    setRefreshToken: (refreshToken: string) => void
    permissions: UserPermissions | null
    setPermissions: (permissions: UserPermissions | null) => void
    reset: () => void
    clearSidebarCache: () => void
    hasPermission: (permission: string) => boolean
    hasRole: (role: string) => boolean
    canAccessMenu: (menuPermission: string) => boolean
  }
}

export const useAuthStore = create<AuthState>()((set, get) => {
  const initToken = getAccessToken()
  const initRefreshToken = getRefreshToken()

  // Initialize user from lightweight JWT token (identity only)
  let initUser: AuthUser | null = null
  let effectiveToken = initToken
  if (initToken) {
    const tokenPayload = decodeJwt(initToken)
    const exp =
      tokenPayload && typeof tokenPayload.exp === 'number'
        ? tokenPayload.exp
        : 0

    // Check if token is valid and not expired (exp is in seconds, Date.now() is in ms)
    // Tokens without a valid exp claim are treated as expired for safety
    if (tokenPayload && exp > 0 && exp * 1000 >= Date.now()) {
      initUser = {
        accountNo: String(
          tokenPayload.name ?? tokenPayload.username ?? tokenPayload.id ?? ''
        ),
        email: String(tokenPayload.email ?? ''),
        role: Array.isArray(tokenPayload.role)
          ? (tokenPayload.role as string[])
          : ['authenticated_user'],
        permissions: Array.isArray(tokenPayload.permissions)
          ? (tokenPayload.permissions as string[])
          : [],
        is_admin: tokenPayload.is_admin === true,
        exp: exp,
      }
    } else {
      // Expired, malformed, or missing exp claim — clear stored credentials
      removeAllTokens()
      effectiveToken = ''
    }
  }

  return {
    auth: {
      user: initUser,
      setUser: (user) =>
        set((state) => ({ ...state, auth: { ...state.auth, user } })),
      profile: null,
      setProfile: (profile) =>
        set((state) => ({ ...state, auth: { ...state.auth, profile } })),
      isLoadingProfile: false,
      fetchProfile: async () => {
        const currentState = get()

        // Prevent duplicate calls if already loading, already have profile, or no token
        if (
          currentState.auth.isLoadingProfile ||
          currentState.auth.profile ||
          !currentState.auth.accessToken
        ) {
          return
        }

        try {
          set((state) => ({
            ...state,
            auth: { ...state.auth, isLoadingProfile: true },
          }))
          const profile = await getProfile()
          set((state) => ({
            ...state,
            auth: {
              ...state.auth,
              profile,
              isLoadingProfile: false,
            },
          }))
        } catch (error: unknown) {
          set((state) => ({
            ...state,
            auth: { ...state.auth, isLoadingProfile: false },
          }))

          // Sign out on auth errors (401/403) or user not found (404)
          if (error && typeof error === 'object' && 'response' in error) {
            const axiosErr = error as { response?: { status?: number } }
            const status = axiosErr.response?.status
            if (status === 401 || status === 403 || status === 404) {
              get().auth.reset()
            }
          }
        }
      },
      accessToken: effectiveToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          persistAccessToken(accessToken)
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      resetAccessToken: () =>
        set((state) => {
          removeAllTokens()
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
      refreshToken: initRefreshToken,
      setRefreshToken: (refreshToken) =>
        set((state) => {
          persistRefreshToken(refreshToken)
          return { ...state, auth: { ...state.auth, refreshToken } }
        }),
      permissions: null,
      setPermissions: (permissions) =>
        set((state) => ({ ...state, auth: { ...state.auth, permissions } })),
      reset: () =>
        set((state) => {
          removeAllTokens()

          // 清除侧边栏缓存
          try {
            menuService.clearCache()
          } catch {
            // Ignore cache clear errors during reset
          }

          return {
            ...state,
            auth: {
              ...state.auth,
              user: null,
              profile: null,
              isLoadingProfile: false,
              accessToken: '',
              refreshToken: '',
              permissions: null,
            },
          }
        }),
      clearSidebarCache: () => {
        try {
          menuService.clearCache()
        } catch (error) {
          console.warn('Failed to clear menu cache:', error)
        }
      },
      hasPermission: (permission: string) => {
        const { user } = get().auth
        if (!user) return false

        // Admin bypass (matches backend behavior using is_admin claim)
        if (user.is_admin) return true

        // Check specific permissions with wildcard support
        return user.permissions.some(
          (p) => p === permission || matchWildcard(p, permission)
        )
      },
      hasRole: (role: string) => {
        const { user } = get().auth
        if (!user) return false
        return user.role.includes(role)
      },
      canAccessMenu: (menuPermission: string) => {
        const { user } = get().auth
        if (!user) return false

        // Admin can access all menus (matches backend behavior)
        if (user.is_admin) return true

        // If no permission is required by the menu, allow access
        if (!menuPermission || menuPermission.trim() === '') return true

        // Check if user has the required permission (supports wildcard patterns)
        return user.permissions.some(
          (p) => p === menuPermission || matchWildcard(p, menuPermission)
        )
      },
    },
  }
})

// Register store reset with the axios interceptor (breaks circular import)
registerAuthStoreReset(() => {
  useAuthStore.getState().auth.reset()
})

// Wildcard matching: system:*:* matches system:user:read
function matchWildcard(pattern: string, permission: string): boolean {
  const patternParts = pattern.split(':')
  const permParts = permission.split(':')
  if (patternParts.length !== permParts.length) return false
  return patternParts.every(
    (part, index) => part === '*' || part === permParts[index]
  )
}
