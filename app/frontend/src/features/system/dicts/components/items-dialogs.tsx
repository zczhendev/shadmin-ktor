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

import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import i18n from '@/i18n'
import {
  createDictItem,
  deleteDictItem,
  updateDictItem,
} from '@/services/dictApi'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogClose,
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
import { Textarea } from '@/components/ui/textarea'
import { useDicts } from './dicts-provider'

type DictItemStatus = 'active' | 'inactive'

const formSchema = z.object({
  label: z.string().min(1, i18n.t('system.dicts.items.form.validation.labelRequired')),
  value: z.string().min(1, i18n.t('system.dicts.items.form.validation.valueRequired')),
  sort: z.number().min(0),
  is_default: z.boolean(),
  status: z.enum(['active', 'inactive']),
  color: z.string(),
  remark: z.string(),
})

type DictItemForm = z.infer<typeof formSchema>

interface ApiError {
  response?: {
    data?: {
      msg?: string
    }
  }
}

interface DictItemFormFieldsProps {
  form: ReturnType<typeof useForm<DictItemForm>>
}

function DictItemFormFields({ form }: DictItemFormFieldsProps) {
  const { t } = useTranslation()
  return (
    <div className='space-y-4'>
      <FormField
        control={form.control}
        name='label'
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('system.dicts.items.form.label')}</FormLabel>
            <FormControl>
              <Input placeholder={t('system.dicts.items.form.labelPlaceholder')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='value'
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('system.dicts.items.form.value')}</FormLabel>
            <FormControl>
              <Input placeholder={t('system.dicts.items.form.valuePlaceholder')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className='grid grid-cols-2 gap-4'>
        <FormField
          control={form.control}
          name='sort'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('system.dicts.items.form.sort')}</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  placeholder='0'
                  {...field}
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value) || 0)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='color'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('system.dicts.items.form.color')}</FormLabel>
              <FormControl>
                <Input placeholder='#FF0000' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name='is_default'
        render={({ field }) => (
          <FormItem className='flex flex-row items-start space-y-0 space-x-3'>
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className='space-y-1 leading-none'>
              <FormLabel>{t('system.dicts.items.form.isDefault')}</FormLabel>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='status'
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('system.dicts.items.form.status')}</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t('system.dicts.items.form.statusPlaceholder')} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value='active'>{t('system.dicts.items.form.statusActive')}</SelectItem>
                <SelectItem value='inactive'>{t('system.dicts.items.form.statusInactive')}</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='remark'
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('system.dicts.items.form.remark')}</FormLabel>
            <FormControl>
              <Textarea placeholder={t('system.dicts.items.form.remarkPlaceholder')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

export function ItemsDialogs() {
  const { t } = useTranslation()
  const {
    selectedType,
    showItemCreateDialog,
    setShowItemCreateDialog,
    showItemEditDialog,
    setShowItemEditDialog,
    showItemDeleteDialog,
    setShowItemDeleteDialog,
    currentItemRow,
    setCurrentItemRow,
  } = useDicts()

  const queryClient = useQueryClient()

  const createForm = useForm<DictItemForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: '',
      value: '',
      sort: 0,
      is_default: false,
      status: 'active',
      color: '',
      remark: '',
    },
  })

  const editForm = useForm<DictItemForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: '',
      value: '',
      sort: 0,
      is_default: false,
      status: 'active',
      color: '',
      remark: '',
    },
  })

  const handleApiError = (error: ApiError, defaultMessage: string) => {
    toast.error(error?.response?.data?.msg || defaultMessage)
  }

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['dictItems'] })
  }

  const createMutation = useMutation({
    mutationFn: createDictItem,
    onSuccess: () => {
      setShowItemCreateDialog(false)
      createForm.reset()
      refreshData()
      toast.success(t('system.dicts.items.messages.setDefaultSuccess').replace(t('system.dicts.items.messages.setDefaultSuccess'), t('system.dicts.types.messages.createSuccess')))
    },
    onError: (error: ApiError) => handleApiError(error, t('system.dicts.types.messages.createFailed')),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DictItemForm }) =>
      updateDictItem(id, data),
    onSuccess: () => {
      setShowItemEditDialog(false)
      setCurrentItemRow(null)
      refreshData()
      toast.success(t('system.dicts.types.messages.updateSuccess'))
    },
    onError: (error: ApiError) => handleApiError(error, t('system.dicts.types.messages.updateFailed')),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteDictItem,
    onSuccess: () => {
      setShowItemDeleteDialog(false)
      setCurrentItemRow(null)
      refreshData()
      toast.success(t('system.dicts.types.messages.deleteSuccess'))
    },
    onError: (error: ApiError) => handleApiError(error, t('system.dicts.types.messages.deleteFailed')),
  })

  const onCreateSubmit = async (values: DictItemForm) => {
    if (!selectedType) {
      toast.error(t('system.dicts.items.messages.selectTypeFirst'))
      return
    }
    try {
      await createMutation.mutateAsync({ type_id: selectedType.id, ...values })
    } catch (error) {
      console.error('Error creating dict item:', error)
    }
  }

  const onEditSubmit = async (values: DictItemForm) => {
    if (!currentItemRow) return
    try {
      await updateMutation.mutateAsync({ id: currentItemRow.id, data: values })
    } catch (error) {
      console.error('Error updating dict item:', error)
    }
  }

  const handleDelete = () => {
    if (!currentItemRow) return
    deleteMutation.mutate(currentItemRow.id)
  }

  useEffect(() => {
    if (showItemEditDialog && currentItemRow) {
      editForm.reset({
        label: currentItemRow.label,
        value: currentItemRow.value,
        sort: currentItemRow.sort,
        is_default: currentItemRow.is_default,
        status: currentItemRow.status as DictItemStatus,
        color: currentItemRow.color || '',
        remark: currentItemRow.remark || '',
      })
    }
  }, [showItemEditDialog, currentItemRow])

  const handleEditDialogChange = (open: boolean) => {
    setShowItemEditDialog(open)
  }

  const handleCreateDialogChange = (open: boolean) => {
    setShowItemCreateDialog(open)
    if (!open) {
      createForm.reset()
    }
  }

  return (
    <>
      {/* Create dialog */}
      <Dialog
        open={showItemCreateDialog}
        onOpenChange={handleCreateDialogChange}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('system.dicts.items.dialogs.createTitle')}</DialogTitle>
            <DialogDescription>
              {t('system.dicts.items.dialogs.createDesc', { name: selectedType?.name })}
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form
              id='create-item-form'
              onSubmit={createForm.handleSubmit(onCreateSubmit)}
              className='space-y-4'
            >
              <DictItemFormFields form={createForm} />
            </form>
          </Form>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline' disabled={createMutation.isPending}>
                {t('common.buttons.cancel')}
              </Button>
            </DialogClose>
            <Button
              type='submit'
              form='create-item-form'
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? t('system.dicts.items.dialogs.creating') : t('common.buttons.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={showItemEditDialog} onOpenChange={handleEditDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('system.dicts.items.dialogs.editTitle')}</DialogTitle>
            <DialogDescription>{t('system.dicts.items.dialogs.editDesc')}</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              id='edit-item-form'
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className='space-y-4'
            >
              <DictItemFormFields form={editForm} />
            </form>
          </Form>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline' disabled={updateMutation.isPending}>
                {t('common.buttons.cancel')}
              </Button>
            </DialogClose>
            <Button
              type='submit'
              form='edit-item-form'
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? t('system.dicts.items.dialogs.saving') : t('common.buttons.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={showItemDeleteDialog}
        onOpenChange={setShowItemDeleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('system.dicts.items.dialogs.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('system.dicts.items.dialogs.deleteDesc', { label: currentItemRow?.label })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.buttons.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? t('system.dicts.items.dialogs.deleting') : t('system.dicts.items.dialogs.confirmDelete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
