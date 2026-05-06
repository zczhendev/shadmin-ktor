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

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { clearAllLoginLogs, getLoginLogs } from '@/services/loginLogApi'
import { useCrudMutation } from '@/hooks/use-crud-mutation'
import type { LoginLogFilter } from '@/types/login-log'

// Query keys for React Query
const LOGIN_LOGS_QUERY_KEY = 'login-logs'

// Custom hook for fetching login logs with pagination and filters
export function useLoginLogs(params?: LoginLogFilter) {
  return useQuery({
    queryKey: [LOGIN_LOGS_QUERY_KEY, params],
    queryFn: () => getLoginLogs(params),
    staleTime: 30 * 1000, // 30 seconds - logs change frequently
  })
}

// Custom hook for clearing all login logs
export function useClearAllLoginLogs() {
  return useCrudMutation({
    mutationFn: clearAllLoginLogs,
    queryKeys: [[LOGIN_LOGS_QUERY_KEY]],
    successMessage: '已清空所有登录日志',
    errorMessage: '清空登录日志失败',
  })
}

// Custom hook for refreshing login logs data
export function useRefreshLoginLogs() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: [LOGIN_LOGS_QUERY_KEY] })
  }
}
