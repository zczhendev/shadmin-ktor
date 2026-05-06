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

import { useMemo, useState } from 'react'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { AxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { login } from '@/services/authApi'
import { Loader2, LogIn, Lock, User } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore, type AuthUser } from '@/stores/auth-store'
import { decodeJwt } from '@/lib/jwt'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'

function createFormSchema(t: (key: string) => string) {
  return z.object({
    username: z.string().min(1, t('auth.login.usernameRequired')),
    password: z.string().min(1, t('auth.login.passwordRequired')),
  })
}

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { auth } = useAuthStore()
  const { t } = useTranslation()
  const formSchema = useMemo(() => createFormSchema(t), [t])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const resp = await login({
        username: data.username,
        password: data.password,
      })

      if (!resp || resp.code !== 0) {
        toast.error(resp?.msg || t('auth.login.error'))
        return
      }

      const payload = resp.data

      // accessToken 存在性检查
      const accessToken = payload?.accessToken
      if (!accessToken) {
        toast.error(t('auth.login.noToken'))
        return
      }

      const tokenPayload = decodeJwt(accessToken) || {}

      // Build local user object from token payload (with fallbacks)
      const user: AuthUser = {
        accountNo: String(
          tokenPayload.name ?? tokenPayload.username ?? tokenPayload.id ?? ''
        ),
        email: String(tokenPayload.email ?? ''),
        role: Array.isArray(tokenPayload.roles)
          ? (tokenPayload.roles as string[])
          : Array.isArray(tokenPayload.role)
            ? (tokenPayload.role as string[])
            : [],
        permissions: Array.isArray(tokenPayload.permissions)
          ? (tokenPayload.permissions as string[])
          : [],
        is_admin: tokenPayload.is_admin === true,
        exp:
          typeof tokenPayload.exp === 'number'
            ? tokenPayload.exp
            : Date.now() + 24 * 60 * 60,
      }

      // Persist token for both auth store and axios interceptor (localStorage)
      auth.setUser(user)
      auth.setAccessToken(accessToken)

      // Store refresh token for silent token renewal
      const refreshTokenValue = payload?.refreshToken
      if (refreshTokenValue) {
        auth.setRefreshToken(refreshTokenValue)
      }

      // Clear sidebar cache since user has changed
      auth.clearSidebarCache()

      // Fetch complete profile information
      try {
        await auth.fetchProfile()
      } catch (error) {
        console.warn('Failed to fetch profile after login:', error)
        // Continue with login even if profile fetch fails
      }

      // Force reload menu data for the new user
      try {
        const { menuService } = await import('@/services/menu-service')
        await menuService.reloadMenuData()
      } catch (error) {
        console.warn('Failed to reload menu data after login:', error)
      }

      toast.success(
        t('auth.login.welcome', { name: tokenPayload.name ?? data.username ?? t('auth.login.defaultName') })
      )

      const targetPath = redirectTo || '/'
      navigate({ to: targetPath, replace: true })
    } catch (error: unknown) {
      // eslint-disable-next-line no-console
      console.error('Login error', error)
      let msg = t('auth.login.networkError')
      if (error instanceof AxiosError) {
        // Prefer backend response message (e.g. 423 lock message) over generic Axios message
        msg = error.response?.data?.msg || error.message
      } else if (error instanceof Error) {
        msg = error.message
      }
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('flex flex-col gap-5', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-sm font-medium'>
                {t('auth.login.username')}
              </FormLabel>
              <FormControl>
                <div className='relative'>
                  <User className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
                  <Input
                    className='h-11 pl-10'
                    placeholder={t('auth.login.usernamePlaceholder')}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <div className='flex items-center justify-between'>
                <FormLabel className='text-sm font-medium'>
                  {t('auth.login.password')}
                </FormLabel>
                <Link
                  to='/forgot-password'
                  className='text-muted-foreground text-xs font-medium transition-colors hover:text-primary'
                >
                  {t('auth.login.forgotPassword')}
                </Link>
              </div>
              <FormControl>
                <div className='relative'>
                  <Lock className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
                  <PasswordInput
                    inputClassName='h-11 pl-10'
                    placeholder={t('auth.login.password')}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className='mt-1 h-11 bg-gradient-to-r from-primary to-primary/90 font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:brightness-105 active:scale-[0.98]'
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            <LogIn className='mr-2 h-4 w-4' />
          )}
          {t('auth.login.submit')}
        </Button>
      </form>
    </Form>
  )
}
