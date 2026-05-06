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

export const PERMISSIONS = {
  SYSTEM: {
    MENU: {
      LIST: 'system:menu:list',
      CREATE: 'system:menu:create',
      UPDATE: 'system:menu:update',
      DELETE: 'system:menu:delete',
      // Aliases for backward compatibility
      ADD: 'system:menu:create',
      EDIT: 'system:menu:update',
    },
    ROLE: {
      LIST: 'system:role:list',
      CREATE: 'system:role:create',
      UPDATE: 'system:role:update',
      DELETE: 'system:role:delete',
      // Aliases for backward compatibility
      ADD: 'system:role:create',
      EDIT: 'system:role:update',
    },
    USER: {
      LIST: 'system:user:list',
      CREATE: 'system:user:create',
      UPDATE: 'system:user:update',
      DELETE: 'system:user:delete',
      INVITE: 'system:user:invite',
      // Aliases for backward compatibility
      ADD: 'system:user:create',
      EDIT: 'system:user:update',
    },
    LOGIN_LOGS: {
      LIST: 'system:login-log:list',
      CLEAN: 'system:login-log:delete',
    },
    API_RESOURCE: {
      LIST: 'system:api-resource:list',
      CREATE: 'system:api-resource:create',
      UPDATE: 'system:api-resource:update',
      DELETE: 'system:api-resource:delete',
    },
    DICT: {
      LIST: 'system:dict:list',
      CREATE_TYPE: 'system:dict:create',
      UPDATE_TYPE: 'system:dict:update',
      DELETE_TYPE: 'system:dict:delete',
      CREATE_ITEM: 'system:dict:create',
      UPDATE_ITEM: 'system:dict:update',
      DELETE_ITEM: 'system:dict:delete',
      // Aliases for backward compatibility
      ADD_TYPE: 'system:dict:create',
      EDIT_TYPE: 'system:dict:update',
      ADD_ITEM: 'system:dict:create',
      EDIT_ITEM: 'system:dict:update',
    },
  },
} as const

// 权限标识类型
export type PermissionKey =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS][keyof (typeof PERMISSIONS)[keyof typeof PERMISSIONS]][keyof (typeof PERMISSIONS)[keyof typeof PERMISSIONS][keyof (typeof PERMISSIONS)[keyof typeof PERMISSIONS]]]
