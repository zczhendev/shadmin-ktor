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

import { apiClient } from '@/services/config.ts'
import { type ApiResponse } from '@/types/api.ts'
import { type Profile } from '@/types/profile.ts'
import { type User } from '@/types/user.ts'

// 登录请求类型
export interface LoginRequest {
  username: string
  password: string
}

// 登录响应类型
export interface LoginResponse {
  user: User
  accessToken: string
  refreshToken: string
}

// 刷新令牌响应类型
export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
}

// 用户登录
export async function login(
  credentials: LoginRequest
): Promise<ApiResponse<LoginResponse>> {
  const resp = await apiClient.post('/api/v1/auth/login', credentials)
  return resp.data
}

// 刷新访问令牌
export async function refreshToken(
  refreshToken: string
): Promise<ApiResponse<RefreshTokenResponse>> {
  const resp = await apiClient.post('/api/v1/auth/refresh', {
    refreshToken: refreshToken,
  })
  return resp.data
}

// 登出
export async function logout(): Promise<ApiResponse<void>> {
  // 尝试获取refresh token用于更完整的登出处理
  const refreshToken =
    document.cookie
      .split('; ')
      .find((row) => row.startsWith('refreshToken='))
      ?.split('=')[1] || localStorage.getItem('refreshToken')

  const requestBody = refreshToken ? { refresh_token: refreshToken } : {}

  const resp = await apiClient.post('/api/v1/auth/logout', requestBody)
  return resp.data
}

// 验证当前令牌是否有效
export async function validateToken(): Promise<ApiResponse<Profile>> {
  const resp = await apiClient.get('/api/v1/profile')
  return resp.data
}
