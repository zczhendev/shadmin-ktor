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

import { useQuery } from '@tanstack/react-query'
import {
  type ApiResourcePagedResult,
  type ApiResourceQueryParams,
  getApiResources,
} from '@/services/apiResourceApi'

// Query keys for React Query
const API_RESOURCES_QUERY_KEY = 'api-resources'

// Custom hook for fetching API resources with pagination and filters
export function useApiResources(params?: ApiResourceQueryParams) {
  return useQuery<ApiResourcePagedResult>({
    queryKey: [API_RESOURCES_QUERY_KEY, params],
    queryFn: () => getApiResources(params),
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache at all to force refresh
    refetchOnWindowFocus: false,
    retry: 2,
    refetchOnMount: true, // Always refetch on mount to ensure data updates
    // Don't use placeholder data to ensure fresh data shows
    placeholderData: undefined,
  })
}
