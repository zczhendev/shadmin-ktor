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

import { CircleOff, Loader2, SearchX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * 页面加载骨架屏 —— 标准表格加载状态。
 *
 * 显示一个与真实表格布局相近的骨架屏，减少布局跳动。
 */
export function PageLoading({ rowCount = 5 }: { rowCount?: number }) {
  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-10 w-32' />
      </div>
      <div className='space-y-2'>
        {Array.from({ length: rowCount }).map((_, i) => (
          <Skeleton key={i} className='h-16 w-full' />
        ))}
      </div>
    </div>
  )
}

/**
 * 页面错误状态 —— 加载失败时的反馈。
 *
 * @param message 错误提示文字
 * @param onRetry 点击重试时的回调
 */
export function PageError({
  message,
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  const { t } = useTranslation()
  const displayMessage = message ?? t('common.messages.loadFailed')

  return (
    <div className='flex h-64 flex-col items-center justify-center gap-3 text-center'>
      <CircleOff className='text-muted-foreground h-10 w-10' />
      <p className='text-muted-foreground text-sm'>{displayMessage}</p>
      {onRetry ? (
        <Button variant='outline' size='sm' onClick={onRetry}>
          <Loader2 className='mr-1 h-4 w-4' />
          {t('common.buttons.reload')}
        </Button>
      ) : null}
    </div>
  )
}

/**
 * 页面空状态 —— 无数据时的反馈。
 *
 * @param title 主标题，如"暂无数据"
 * @param description 补充说明
 */
export function PageEmpty({
  title,
  description,
}: {
  title?: string
  description?: string
}) {
  const { t } = useTranslation()
  const displayTitle = title ?? t('common.messages.noData')
  const displayDescription = description ?? t('common.messages.noRecords')

  return (
    <div className='flex h-64 flex-col items-center justify-center gap-2 text-center'>
      <SearchX className='text-muted-foreground h-10 w-10' />
      <p className='font-medium'>{displayTitle}</p>
      <p className='text-muted-foreground text-sm'>{displayDescription}</p>
    </div>
  )
}
