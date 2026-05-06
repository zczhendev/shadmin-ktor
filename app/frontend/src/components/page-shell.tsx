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

import { cn } from '@/lib/utils'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitch } from '@/components/language-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'

/**
 * 页面外壳组件 —— 自动包含标准 Header（搜索、主题切换、配置抽屉、用户下拉）和 Main 内容区。
 *
 * 用法：
 * ```tsx
 * <PageShell>
 *   <PageHeader title="用户列表" description="管理用户及角色">
 *     <Button>创建用户</Button>
 *   </PageHeader>
 *   <PageContent>
 *     <UsersTable />
 *   </PageContent>
 * </PageShell>
 * ```
 */
export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center gap-4'>
          <LanguageSwitch />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>
      <Main className={className}>{children}</Main>
    </>
  )
}

/**
 * 页面标题区 —— 统一标题、描述和操作按钮区域。
 *
 * 自动处理 flex 布局、间距和响应式换行。
 */
export function PageHeader({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'mb-4 flex flex-wrap items-center justify-between gap-4',
        className
      )}
    >
      <div className='space-y-1'>
        <h2 className='text-2xl font-bold tracking-tight'>{title}</h2>
        {description ? (
          <p className='text-muted-foreground text-sm'>{description}</p>
        ) : null}
      </div>
      {children ? (
        <div className='flex items-center gap-2'>{children}</div>
      ) : null}
    </div>
  )
}

/**
 * 页面内容区 —— 统一处理边距、滚动和弹性布局。
 *
 * 自动处理负边距补偿和横向滚动，适合承载表格、卡片列表等。
 */
export function PageContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        '-mx-4 flex-1 overflow-auto px-4 py-1',
        className
      )}
    >
      {children}
    </div>
  )
}
