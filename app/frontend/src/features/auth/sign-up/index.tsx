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
import { Link } from '@tanstack/react-router'
import { AuthLayout } from '../auth-layout'
import { SignUpForm } from './components/sign-up-form'

export function SignUp() {
  const { t } = useTranslation()

  return (
    <AuthLayout>
      <div className='space-y-6'>
        <div className='space-y-2 text-center'>
          <h2 className='text-lg font-semibold tracking-tight'>
            {t('auth.signUp.title')}
          </h2>
          <p className='text-muted-foreground text-sm'>
            {t('auth.signUp.description')}{' '}
            <Link
              to='/sign-in'
              className='hover:text-primary font-medium underline underline-offset-4'
            >
              {t('auth.signUp.signIn')}
            </Link>
          </p>
        </div>
        <SignUpForm />
        <p className='text-muted-foreground text-center text-xs'>
          {t('auth.signUp.footer')}{' '}
          <a
            href='/terms'
            className='hover:text-primary underline underline-offset-4'
          >
            {t('auth.signUp.terms')}
          </a>{' '}
          {t('auth.signUp.and')}{' '}
          <a
            href='/privacy'
            className='hover:text-primary underline underline-offset-4'
          >
            {t('auth.signUp.privacy')}
          </a>
          。
        </p>
      </div>
    </AuthLayout>
  )
}
