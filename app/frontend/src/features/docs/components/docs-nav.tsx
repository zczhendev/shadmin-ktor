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
import { FileText, Layers, Server, Settings, Users } from 'lucide-react'

export interface DocItem {
  id: string
  title: string
  titleEn: string
  file: string
  icon: React.ReactNode
}

export const DOC_ITEMS: DocItem[] = [
  {
    id: 'architecture',
    title: '系统架构',
    titleEn: 'Architecture',
    file: 'architecture.md',
    icon: <Layers className='h-4 w-4' />,
  },
  {
    id: 'development-guide',
    title: '开发指南',
    titleEn: 'Development Guide',
    file: 'development-guide.md',
    icon: <Settings className='h-4 w-4' />,
  },
  {
    id: 'deployment',
    title: '部署指南',
    titleEn: 'Deployment',
    file: 'deployment.md',
    icon: <Server className='h-4 w-4' />,
  },
  {
    id: 'api-reference',
    title: 'API 参考',
    titleEn: 'API Reference',
    file: 'api-reference.md',
    icon: <FileText className='h-4 w-4' />,
  },
  {
    id: 'contributing',
    title: '贡献指南',
    titleEn: 'Contributing',
    file: 'contributing.md',
    icon: <Users className='h-4 w-4' />,
  },
]

interface DocsNavProps {
  activeId: string
  onSelect: (id: string) => void
  lang: 'zh' | 'en'
}

export function DocsNav({ activeId, onSelect, lang }: DocsNavProps) {
  return (
    <nav>
      <div className='text-muted-foreground mb-3 px-3 text-xs font-semibold uppercase tracking-wider'>
        {lang === 'zh' ? '文档' : 'Documents'}
      </div>
      {DOC_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={cn(
            'group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
            activeId === item.id
              ? 'text-foreground font-medium'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <span
            className={cn(
              'transition-colors',
              activeId === item.id
                ? 'text-foreground'
                : 'text-muted-foreground group-hover:text-foreground'
            )}
          >
            {item.icon}
          </span>
          <span>{lang === 'zh' ? item.title : item.titleEn}</span>
        </button>
      ))}
    </nav>
  )
}
