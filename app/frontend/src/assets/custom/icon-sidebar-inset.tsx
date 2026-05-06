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

export function IconSidebarInset(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      data-name='icon-sidebar-inset'
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 79.86 51.14'
      {...props}
    >
      <rect
        x={23.39}
        y={5.57}
        width={50.22}
        height={40}
        rx={2}
        ry={2}
        opacity={0.2}
        strokeLinecap='round'
        strokeMiterlimit={10}
      />
      <path
        fill='none'
        opacity={0.72}
        strokeLinecap='round'
        strokeMiterlimit={10}
        strokeWidth='2px'
        d='M5.08 17.05L17.31 17.05'
      />
      <path
        fill='none'
        opacity={0.48}
        strokeLinecap='round'
        strokeMiterlimit={10}
        strokeWidth='2px'
        d='M5.08 24.25L15.6 24.25'
      />
      <path
        fill='none'
        opacity={0.55}
        strokeLinecap='round'
        strokeMiterlimit={10}
        strokeWidth='2px'
        d='M5.08 20.54L14.46 20.54'
      />
      <g strokeLinecap='round' strokeMiterlimit={10}>
        <circle cx={7.04} cy={9.57} r={2.54} opacity={0.8} />
        <path
          fill='none'
          opacity={0.8}
          strokeWidth='2px'
          d='M11.59 8.3L17.31 8.3'
        />
        <path fill='none' opacity={0.6} d='M11.38 10.95L16.44 10.95' />
      </g>
    </svg>
  )
}
