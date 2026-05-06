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

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

const data = [
  {
    name: '1月',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: '2月',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: '3月',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: '4月',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: '5月',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: '6月',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: '7月',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: '8月',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: '9月',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: '10月',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: '11月',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: '12月',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey='name'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Bar
          dataKey='total'
          fill='currentColor'
          radius={[4, 4, 0, 0]}
          className='fill-primary'
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
