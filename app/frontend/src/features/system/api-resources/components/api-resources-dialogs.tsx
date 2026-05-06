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

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { METHOD_OPTIONS } from '../constants/api-constants'
import { useApiResourcesContext } from './api-resources-provider'
import {
  useCreateApiResource,
  useUpdateApiResource,
} from '../hooks/use-api-resource-mutations'

const formSchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  path: z.string().min(1, '路径不能为空'),
  method: z.string().min(1, '方法不能为空'),
  module: z.string().optional(),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function ApiResourcesDialogs() {
  const { open, setOpen, currentRow } = useApiResourcesContext()
  const createMutation = useCreateApiResource()
  const updateMutation = useUpdateApiResource()

  const isEdit = open === 'edit' && currentRow !== null
  const isOpen = open === 'create' || isEdit

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      path: '',
      method: 'GET',
      module: '',
      description: '',
    },
  })

  // Reset form when dialog opens with current row data
  React.useEffect(() => {
    if (isOpen) {
      if (isEdit && currentRow) {
        form.reset({
          name: currentRow.name,
          path: currentRow.path,
          method: currentRow.method,
          module: currentRow.module || '',
          description: currentRow.description || '',
        })
      } else {
        form.reset({
          name: '',
          path: '',
          method: 'GET',
          module: '',
          description: '',
        })
      }
    }
  }, [isOpen, isEdit, currentRow, form])

  const onSubmit = async (values: FormValues) => {
    if (isEdit && currentRow) {
      await updateMutation.mutateAsync({
        id: currentRow.id,
        data: {
          name: values.name,
          path: values.path,
          method: values.method,
          module: values.module || undefined,
          description: values.description || undefined,
        },
      })
    } else {
      await createMutation.mutateAsync({
        name: values.name,
        path: values.path,
        method: values.method,
        module: values.module || undefined,
        description: values.description || undefined,
      })
    }
    setOpen(null)
    form.reset()
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(state) => {
        if (!state) {
          setOpen(null)
          form.reset()
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>{isEdit ? '编辑API资源' : '创建API资源'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '在此更新API资源。' : '在此创建新API资源。'}
            完成后点击保存。
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="api-resource-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 px-0.5"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>名称</FormLabel>
                  <FormControl>
                    <Input placeholder="用户列表" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="path"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>路径</FormLabel>
                  <FormControl>
                    <Input placeholder="/api/v1/example" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>方法</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择HTTP方法" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {METHOD_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="module"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>模块</FormLabel>
                  <FormControl>
                    <Input placeholder="system" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>描述</FormLabel>
                  <FormControl>
                    <Input placeholder="API资源描述" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type="submit" form="api-resource-form" disabled={isSubmitting}>
            {isSubmitting ? '保存中...' : '保存更改'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
