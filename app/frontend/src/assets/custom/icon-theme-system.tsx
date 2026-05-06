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

import { type SVGProps } from 'react'
import { cn } from '@/lib/utils'

export function IconThemeSystem({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      data-name='icon-theme-system'
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 79.86 51.14'
      className={cn(
        'overflow-hidden rounded-[6px]',
        'stroke-primary fill-primary group-data-[state=unchecked]:stroke-muted-foreground group-data-[state=unchecked]:fill-muted-foreground',
        className
      )}
      {...props}
    >
      <path opacity={0.2} d='M0 0.03H22.88V51.17H0z' />
      <circle
        cx={6.7}
        cy={7.04}
        r={3.54}
        fill='#fff'
        opacity={0.8}
        stroke='#fff'
        strokeLinecap='round'
        strokeMiterlimit={10}
      />
      <path
        d='M18.12 6.39h-5.87c-.6 0-1.09-.45-1.09-1s.49-1 1.09-1h5.87c.6 0 1.09.45 1.09 1s-.49 1-1.09 1zM16.55 9.77h-4.24c-.55 0-1-.45-1-1s.45-1 1-1h4.24c.55 0 1 .45 1 1s-.45 1-1 1z'
        fill='#fff'
        stroke='none'
        opacity={0.75}
      />
      <path
        d='M18.32 17.37H4.59c-.69 0-1.25-.47-1.25-1.05s.56-1.05 1.25-1.05h13.73c.69 0 1.25.47 1.25 1.05s-.56 1.05-1.25 1.05z'
        fill='#fff'
        stroke='none'
        opacity={0.72}
      />
      <path
        d='M15.34 21.26h-11c-.55 0-1-.41-1-.91s.45-.91 1-.91h11c.55 0 1 .41 1 .91s-.45.91-1 .91z'
        fill='#fff'
        stroke='none'
        opacity={0.55}
      />
      <path
        d='M16.46 25.57H4.43c-.6 0-1.09-.44-1.09-.98s.49-.98 1.09-.98h12.03c.6 0 1.09.44 1.09.98s-.49.98-1.09.98z'
        fill='#fff'
        stroke='none'
        opacity={0.67}
      />
      <rect
        x={33.36}
        y={19.73}
        width={2.75}
        height={3.42}
        rx={0.33}
        ry={0.33}
        opacity={0.31}
        stroke='none'
      />
      <rect
        x={29.64}
        y={16.57}
        width={2.75}
        height={6.58}
        rx={0.33}
        ry={0.33}
        opacity={0.4}
        stroke='none'
      />
      <rect
        x={37.16}
        y={14.44}
        width={2.75}
        height={8.7}
        rx={0.33}
        ry={0.33}
        opacity={0.26}
        stroke='none'
      />
      <rect
        x={41.19}
        y={10.75}
        width={2.75}
        height={12.4}
        rx={0.33}
        ry={0.33}
        opacity={0.37}
        stroke='none'
      />
      <g>
        <circle cx={62.74} cy={16.32} r={8} opacity={0.25} />
        <path
          d='M62.74 16.32l4.1-6.87c1.19.71 2.18 1.72 2.86 2.92s1.04 2.57 1.04 3.95h-8z'
          opacity={0.45}
        />
      </g>
      <rect
        x={29.64}
        y={27.75}
        width={41.62}
        height={18.62}
        rx={1.69}
        ry={1.69}
        opacity={0.3}
        stroke='none'
        strokeLinecap='round'
        strokeMiterlimit={10}
      />
    </svg>
  )
}
