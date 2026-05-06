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

import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useMemo,
  useState,
} from 'react'
import type { Role } from '@/types/role'

interface RolesContext {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  currentRow: Role | null
  setCurrentRow: Dispatch<SetStateAction<Role | null>>
  showDeleteDialog: boolean
  setShowDeleteDialog: Dispatch<SetStateAction<boolean>>
  showCreateDialog: boolean
  setShowCreateDialog: Dispatch<SetStateAction<boolean>>
  showEditDialog: boolean
  setShowEditDialog: Dispatch<SetStateAction<boolean>>
}

const RolesContext = createContext<RolesContext | null>(null)

interface RolesProviderProps {
  children: ReactNode
}

export function RolesProvider({ children }: RolesProviderProps) {
  const [open, setOpen] = useState(false)
  const [currentRow, setCurrentRow] = useState<Role | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const contextValue: RolesContext = useMemo(
    () => ({
      open,
      setOpen,
      currentRow,
      setCurrentRow,
      showDeleteDialog,
      setShowDeleteDialog,
      showCreateDialog,
      setShowCreateDialog,
      showEditDialog,
      setShowEditDialog,
    }),
    [open, currentRow, showDeleteDialog, showCreateDialog, showEditDialog]
  )

  if (process.env.NODE_ENV !== 'production') {
    // 简单渲染次数日志
    console.debug('🧪 RolesProvider render', {
      open,
      showCreateDialog,
      showEditDialog,
      showDeleteDialog,
    })
  }

  return (
    <RolesContext.Provider value={contextValue}>
      {children}
    </RolesContext.Provider>
  )
}

export const useRoles = () => {
  const rolesContext = useContext(RolesContext)

  if (!rolesContext) {
    throw new Error('useRoles has to be used within <RolesProvider>')
  }

  return rolesContext
}
