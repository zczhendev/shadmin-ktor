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

import { useCallback, useEffect, useRef, useState } from 'react'
import { marked, type Renderer } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import { Globe, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { DocsNav, DOC_ITEMS } from './components/docs-nav'
import './styles/docs.css'

const LANG_STORAGE_KEY = 'shadmin-docs-lang'

type Lang = 'zh' | 'en'

interface TocItem {
  level: number
  text: string
  id: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 60)
}

function setupCodeCopyButtons(container: HTMLElement) {
  const pres = container.querySelectorAll('pre')
  pres.forEach((pre) => {
    if (pre.querySelector('.code-copy-btn')) return

    const btn = document.createElement('button')
    btn.className = 'code-copy-btn'
    btn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>'
    btn.title = 'Copy'

    btn.addEventListener('click', () => {
      const code = pre.querySelector('code')
      if (code) {
        navigator.clipboard.writeText(code.textContent || '')
        btn.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
        btn.classList.add('copied')
        setTimeout(() => {
          btn.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>'
          btn.classList.remove('copied')
        }, 2000)
      }
    })

    pre.appendChild(btn)
  })
}

function setupExternalLinks(container: HTMLElement) {
  const links = container.querySelectorAll('a')
  links.forEach((a) => {
    const href = a.getAttribute('href')
    if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
      a.setAttribute('target', '_blank')
      a.setAttribute('rel', 'noopener noreferrer')
    }
  })
}

// Configure marked globally (outside component to avoid re-registration)
const renderer: Partial<Renderer> = {
  code({ text, lang: language }) {
    const validLang =
      language && hljs.getLanguage(language) ? language : 'plaintext'
    const highlighted = hljs.highlight(text, { language: validLang }).value
    return `<pre><code class="hljs language-${validLang}">${highlighted}</code></pre>`
  },
}

marked.use({ renderer })

export function DocsPage() {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY)
    return saved === 'en' ? 'en' : 'zh'
  })
  const [activeId, setActiveId] = useState(DOC_ITEMS[0].id)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [toc, setToc] = useState<TocItem[]>([])
  const [activeTocId, setActiveTocId] = useState<string>('')
  const contentRef = useRef<HTMLDivElement>(null)

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === 'zh' ? 'en' : 'zh'
      localStorage.setItem(LANG_STORAGE_KEY, next)
      return next
    })
  }, [])

  const loadDoc = useCallback(
    async (id: string) => {
      const item = DOC_ITEMS.find((d) => d.id === id)
      if (!item) return
      setLoading(true)
      const path = `/docs/${lang}/${item.file}`
      try {
        const response = await fetch(path)
        if (!response.ok) {
          throw new Error(`Failed to load ${path}`)
        }
        const text = await response.text()
        const rawHtml = await marked.parse(text)

        // Post-process: assign stable unique ids to headings and build TOC
        const parser = new DOMParser()
        const doc = parser.parseFromString(
          `<div>${rawHtml}</div>`,
          'text/html'
        )
        const wrapper = doc.body.firstChild as HTMLElement
        const headings = wrapper.querySelectorAll('h2, h3, h4')
        const newToc: TocItem[] = []
        const usedIds = new Set<string>()

        headings.forEach((h) => {
          const level = parseInt(h.tagName[1])
          const text = (h.textContent || '').trim()
          let baseId = slugify(text)
          let finalId = baseId
          let suffix = 1
          while (!finalId || usedIds.has(finalId)) {
            finalId = `${baseId}-${suffix++}`
          }
          usedIds.add(finalId)

          h.setAttribute('id', finalId)

          // Inject anchor link
          if (!h.querySelector('.anchor-link')) {
            const anchor = document.createElement('a')
            anchor.href = `#${finalId}`
            anchor.className = 'anchor-link'
            anchor.setAttribute('aria-hidden', 'true')
            anchor.innerHTML =
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>'
            h.insertBefore(anchor, h.firstChild)
          }

          newToc.push({ level, text, id: finalId })
        })

        setContent(wrapper.innerHTML)
        setToc(newToc)
        setActiveTocId('')
      } catch (error) {
        toast.error(`加载文档失败: ${path}`)
        setContent('<p class="text-red-500">加载文档失败</p>')
        setToc([])
      } finally {
        setLoading(false)
      }
    },
    [lang]
  )

  useEffect(() => {
    loadDoc(activeId)
  }, [activeId, lang, loadDoc])

  useEffect(() => {
    if (contentRef.current) {
      setupCodeCopyButtons(contentRef.current)
      setupExternalLinks(contentRef.current)
    }
  }, [content])

  // Track active heading with IntersectionObserver
  useEffect(() => {
    if (!contentRef.current || toc.length === 0) return

    const viewport = contentRef.current.closest(
      '[data-radix-scroll-area-viewport]'
    ) as HTMLElement | null
    if (!viewport) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) {
          setActiveTocId(visible[0].target.id)
        }
      },
      { root: viewport, rootMargin: '-20px 0px -60% 0px', threshold: 0 }
    )

    const headings = contentRef.current.querySelectorAll('h2, h3, h4')
    headings.forEach((h) => observer.observe(h))

    return () => observer.disconnect()
  }, [content, toc.length])

  const scrollToHeading = (id: string) => {
    if (!contentRef.current) return

    const el = contentRef.current.querySelector(`[id="${id}"]`) as HTMLElement | null
    if (!el) return

    // Manually highlight the clicked TOC item immediately
    setActiveTocId(id)

    // ScrollArea uses a custom viewport
    const viewport = contentRef.current.closest(
      '[data-radix-scroll-area-viewport]'
    ) as HTMLElement | null
    if (viewport) {
      // Walk up offsetParent chain to get correct position inside viewport
      let offset = 0
      let current: HTMLElement | null = el
      while (current && current !== viewport) {
        offset += current.offsetTop
        current = current.offsetParent as HTMLElement | null
      }
      viewport.scrollTo({ top: Math.max(0, offset - 20), behavior: 'smooth' })
    }
  }

  const currentTitle = (() => {
    const item = DOC_ITEMS.find((d) => d.id === activeId)
    return item ? (lang === 'zh' ? item.title : item.titleEn) : ''
  })()

  return (
    <div className='flex h-svh overflow-hidden'>
      {/* Left Sidebar */}
      <aside className='w-60 flex-shrink-0 border-r bg-sidebar/50'>
        <div className='flex items-center gap-2 px-4 py-4'>
          <div className='bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg'>
            <Globe className='text-primary h-4 w-4' />
          </div>
          <div>
            <h2 className='text-sm font-semibold leading-tight'>
              {lang === 'zh' ? '帮助文档' : 'Documentation'}
            </h2>
            <p className='text-muted-foreground text-xs'>
              v{__APP_VERSION__}
            </p>
          </div>
        </div>
        <Separator />
        <ScrollArea className='h-[calc(100%-5rem)]'>
          <div className='px-2 py-3'>
            <DocsNav activeId={activeId} onSelect={setActiveId} lang={lang} />
          </div>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main className='min-w-0 flex-1 overflow-hidden bg-background'>
        {/* Top bar */}
        <div className='flex items-center justify-between border-b bg-background/80 px-6 py-3 backdrop-blur-sm'>
          <div className='flex items-center gap-3'>
            <span className='bg-primary/10 text-primary rounded-md px-2 py-0.5 text-xs font-medium'>
              {lang === 'zh' ? '文档' : 'Docs'}
            </span>
            <h1 className='text-lg font-semibold tracking-tight'>{currentTitle}</h1>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={toggleLang}
            className='gap-2'
          >
            <Globe className='h-4 w-4' />
            {lang === 'zh' ? 'English' : '中文'}
          </Button>
        </div>

        <div className='flex h-[calc(100%-3.5rem)]'>
          <ScrollArea className='flex-1'>
            <div className='max-w-3xl px-8 py-8'>
              {loading ? (
                <div className='flex items-center justify-center py-20'>
                  <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                </div>
              ) : (
                <article
                  ref={contentRef}
                  className='docs-content'
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              )}
            </div>
          </ScrollArea>

          {/* Right TOC */}
          {toc.length > 0 && (
            <aside className='hidden h-full w-60 flex-shrink-0 border-l bg-sidebar/30 xl:flex xl:flex-col'>
              <div className='flex-shrink-0 px-4 py-3'>
                <h3 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                  {lang === 'zh' ? '目录' : 'Contents'}
                </h3>
              </div>
              <ScrollArea className='flex-1'>
                <nav className='px-3 pb-4'>
                  {toc.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToHeading(item.id)}
                      className={cn(
                        'group flex w-full items-center rounded-md text-left text-sm transition-colors',
                        activeTocId === item.id
                          ? 'text-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                      style={{
                        paddingLeft: `${(item.level - 2) * 14 + 12}px`,
                        paddingRight: '8px',
                        paddingTop: '8px',
                        paddingBottom: '8px',
                        marginTop: '0',
                        fontWeight:
                          item.level === 2
                            ? 600
                            : activeTocId === item.id
                              ? 500
                              : 400,
                      }}
                    >
                      <span
                        className={cn(
                          'mr-2 inline-block flex-shrink-0 rounded-full transition-all',
                          activeTocId === item.id
                            ? 'bg-foreground h-1.5 w-1.5'
                            : 'bg-muted-foreground/30 h-1 w-1 group-hover:bg-muted-foreground/60'
                        )}
                      />
                      <span className='truncate'>{item.text}</span>
                    </button>
                  ))}
                </nav>
              </ScrollArea>
            </aside>
          )}
        </div>
      </main>
    </div>
  )
}
