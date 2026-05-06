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

import type React from 'react'
import type { VariantProps } from 'class-variance-authority'
import { usePermission } from '@/hooks/usePermission'
import { Button, type buttonVariants } from '@/components/ui/button'

interface PermissionButtonProps
  extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  permission: string
  fallbackMode?: 'hide' | 'disable'
  asChild?: boolean
}

export function PermissionButton({
  permission,
  fallbackMode = 'hide',
  children,
  ...props
}: PermissionButtonProps) {
  const { hasPermission } = usePermission()

  if (!hasPermission(permission)) {
    if (fallbackMode === 'hide') return null
    return (
      <Button {...props} disabled>
        {children}
      </Button>
    )
  }

  return <Button {...props}>{children}</Button>
}

// 使用示例:
// <PermissionButton
//   permission="admin:user:delete"
//   fallbackMode="disable"
//   variant="destructive"
// >
//   删除用户
// </PermissionButton>
