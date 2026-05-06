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

import { useTranslation } from 'react-i18next'
import { LanguageSwitch } from '@/components/language-switch'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation()

  return (
    <div className='relative flex min-h-svh items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5'>
      {/* Subtle grid pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[size:60px_60px] bg-[linear-gradient(to_right,hsl(var(--border)/0.2)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.2)_1px,transparent_1px)]" />

      {/* Decorative gradient orbs */}
      <div className='pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/8 blur-[100px]' />
      <div className='pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-primary/6 blur-[100px]' />

      {/* Brand logo - page top left, no card background */}
      <div className='absolute left-6 top-6 z-10 flex items-center gap-2.5 md:left-10 md:top-10'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='h-6 w-6 text-primary'
        >
          <path d='M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3' />
        </svg>
        <div>
          <h1 className='text-sm font-semibold tracking-tight'>Shadmin</h1>
          <p className='text-muted-foreground text-[11px]'>
            {t('auth.login.brandTagline')}
          </p>
        </div>
      </div>

      {/* Language switch - top right */}
      <div className='absolute right-6 top-6 z-10 md:right-10 md:top-10'>
        <LanguageSwitch />
      </div>

      {/* Main card: no border, no solid background, clean shadow only */}
      <div className='relative z-10 w-full max-w-[400px] px-4'>
        <div className='rounded-2xl bg-background/40 shadow-2xl shadow-black/5 backdrop-blur-xl'>
          <div className='p-8 sm:p-10'>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
