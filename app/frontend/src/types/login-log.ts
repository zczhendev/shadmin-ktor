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

import { z } from 'zod'

export const loginLogStatusSchema = z.union([
  z.literal('success'),
  z.literal('failed'),
])

export type LoginLogStatus = z.infer<typeof loginLogStatusSchema>

export const loginLogSchema = z.object({
  id: z.string(),
  username: z.string(),
  login_ip: z.string(),
  user_agent: z.string(),
  browser: z.string().optional(),
  os: z.string().optional(),
  device: z.string().optional(),
  status: loginLogStatusSchema,
  failure_reason: z.string().optional(),
  login_time: z.coerce.date(),
})

export type LoginLog = z.infer<typeof loginLogSchema>

export const loginLogListSchema = z.array(loginLogSchema)

// 分页响应类型
export type PaginatedLoginLogsResponse = {
  list: LoginLog[] | null
  total: number
  page: number
  page_size: number
  total_pages: number
}

// 查询过滤器schema
export const loginLogFilterSchema = z.object({
  page: z.number().optional(),
  page_size: z.number().optional(),
  username: z.string().optional(),
  login_ip: z.string().optional(),
  status: loginLogStatusSchema.optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  sort_by: z.string().optional(),
  order: z.union([z.literal('asc'), z.literal('desc')]).optional(),
})

export type LoginLogFilter = z.infer<typeof loginLogFilterSchema>
