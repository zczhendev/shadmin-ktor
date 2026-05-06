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
import i18n from '@/i18n'

export const createMenuSchema = z.object({
  name: z.string().min(1, i18n.t('system.menus.validation.nameRequired')),
  sequence: z.number().min(0, i18n.t('system.menus.validation.sequenceMin')),
  type: z.enum(['menu', 'button']),
  path: z.string().optional(),
  icon: z.string().optional(),
  component: z.string().optional(),
  route_name: z.string().optional(),
  query: z.string().optional(),
  is_frame: z.boolean(),
  visible: z.enum(['show', 'hide']),
  permissions: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  parent_id: z.string().optional(),
  apiResources: z.array(z.string()).optional(),
})

export type CreateMenuFormData = z.infer<typeof createMenuSchema>

export const defaultFormValues: CreateMenuFormData = {
  name: '',
  sequence: 0,
  type: 'menu' as const,
  path: '',
  icon: '',
  component: '',
  route_name: '',
  query: '',
  is_frame: false,
  visible: 'show' as const,
  permissions: '',
  status: 'active' as const,
  parent_id: '',
  apiResources: [],
}
