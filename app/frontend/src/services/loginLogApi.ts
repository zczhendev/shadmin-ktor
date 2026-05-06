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

import { apiClient } from '@/services/config'
import { buildSearchParams } from '@/lib/query-params'
import type {
  PaginatedLoginLogsResponse,
  LoginLogFilter,
} from '@/types/login-log'

// Login Log Management API - Based on swagger.json /system/login-logs endpoints

// GET /system/login-logs - Get login logs with pagination and filtering
export async function getLoginLogs(
  params?: LoginLogFilter
): Promise<PaginatedLoginLogsResponse> {
  const searchParams = buildSearchParams(params)

  const response = await apiClient.get(
    `/api/v1/system/login-logs?${searchParams}`
  )
  return response.data.data
}

// DELETE /system/login-logs - Clear all login logs
export async function clearAllLoginLogs(): Promise<string> {
  const response = await apiClient.delete('/api/v1/system/login-logs')
  return response.data.data
}
