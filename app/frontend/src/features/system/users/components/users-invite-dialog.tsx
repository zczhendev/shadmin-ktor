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
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import i18n from '@/i18n'
import { getRoles } from '@/services/roleApi'
import { MailPlus, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { Textarea } from '@/components/ui/textarea'
import { SelectDropdown } from '@/components/select-dropdown'
import { useInviteUser } from '../hooks/use-users'

const formSchema = z.object({
  email: z.email({
    error: (iss) => (iss.input === '' ? i18n.t('system.users.dialogs.inviteEmailRequired') : undefined),
  }),
  role: z.string().min(1, i18n.t('system.users.dialogs.inviteRoleRequired')),
  message: z.string().optional(),
})

type UserInviteForm = z.infer<typeof formSchema>

type UserInviteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersInviteDialog({
  open,
  onOpenChange,
}: UserInviteDialogProps) {
  const { t } = useTranslation()
  const inviteUser = useInviteUser()

  // Fetch roles from API
  const { data: rolesPaged, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles-all'],
    queryFn: () => getRoles({ page: 1, page_size: 1000 }),
    enabled: open,
  })
  const roles = rolesPaged?.list || []

  const form = useForm<UserInviteForm>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', role: '', message: '' },
  })

  // Convert roles data to options format for SelectDropdown
  const roleOptions = roles.map((role) => ({
    label: role.name,
    value: role.id,
  }))

  const onSubmit = async (values: UserInviteForm) => {
    try {
      await inviteUser.mutateAsync({
        email: values.email,
        role_ids: [values.role],
        message: values.message,
      })

      form.reset()
      onOpenChange(false)
    } catch (error) {
      // Error handling is done in the hook
      console.error('Error inviting user:', error)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle className='flex items-center gap-2'>
            <MailPlus /> {t('system.users.dialogs.inviteTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('system.users.dialogs.inviteDesc')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='user-invite-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('system.users.dialogs.emailLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder={t('system.users.dialogs.emailPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='role'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('system.users.dialogs.roleLabel')}</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder={rolesLoading ? t('system.users.dialogs.loadingRoles') : t('system.users.dialogs.rolePlaceholder')}
                    items={roleOptions}
                    disabled={rolesLoading}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='message'
              render={({ field }) => (
                <FormItem className=''>
                  <FormLabel>{t('system.users.dialogs.messageLabel')}</FormLabel>
                  <FormControl>
                    <Textarea
                      className='resize-none'
                      placeholder={t('system.users.dialogs.messagePlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter className='gap-y-2'>
          <DialogClose asChild>
            <Button variant='outline'>{t('common.buttons.cancel')}</Button>
          </DialogClose>
          <Button
            type='submit'
            form='user-invite-form'
            disabled={inviteUser.isPending || rolesLoading}
          >
            {inviteUser.isPending ? t('system.users.dialogs.inviting') : t('system.users.dialogs.invite')} <Send />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
