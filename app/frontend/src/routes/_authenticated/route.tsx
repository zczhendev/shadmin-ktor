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

import { createFileRoute, redirect } from '@tanstack/react-router'
import { menuService } from '@/services/menu-service'
import { useAuthStore } from '@/stores/auth-store'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

// Routes that are always accessible for authenticated users (not menu-managed)
const ALWAYS_ALLOWED_PATHS = ['/', '/settings', '/errors']

function isTokenExpired(auth: { user: { exp?: number } | null; accessToken: string }): boolean {
  if (!auth.accessToken) return true
  // Malformed token (user is null) or missing exp claim → treat as expired
  if (!auth.user) return true
  const exp = auth.user.exp
  if (!exp || exp <= 0) return true
  return exp * 1000 < Date.now()
}

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const { auth } = useAuthStore.getState()

    if (!auth.accessToken || isTokenExpired(auth)) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
      })
    }

    // Fetch profile if not already loaded
    if (!auth.profile && auth.accessToken) {
      try {
        await auth.fetchProfile()
      } catch (error: unknown) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch profile on route load:', error)

        // If auth error (401/403), reset and redirect to sign-in
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosErr = error as { response?: { status?: number } }
          const status = axiosErr.response?.status
          if (status === 401 || status === 403) {
            auth.reset()
            throw redirect({
              to: '/sign-in',
              search: { redirect: location.href },
            })
          }
        }
      }
    }

    // Load menu data (cached after first load) and check route authorization
    await menuService.loadMenuData()

    const pathname = location.pathname

    // Skip check for always-allowed non-menu routes
    const isAlwaysAllowed = ALWAYS_ALLOWED_PATHS.some(
      (p) => pathname === p || pathname.startsWith(p + '/')
    )

    if (!isAlwaysAllowed && !menuService.isPathAllowed(pathname)) {
      throw redirect({ to: '/403' })
    }
  },
  component: AuthenticatedLayout,
})
