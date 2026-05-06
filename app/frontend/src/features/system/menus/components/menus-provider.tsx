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
  useState,
} from 'react'
import type { Menu } from '@/types/menu'

interface MenusContext {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  currentRow: Menu | null
  setCurrentRow: Dispatch<SetStateAction<Menu | null>>
  showDeleteDialog: boolean
  setShowDeleteDialog: Dispatch<SetStateAction<boolean>>
  showCreateDialog: boolean
  setShowCreateDialog: Dispatch<SetStateAction<boolean>>
  showEditDialog: boolean
  setShowEditDialog: Dispatch<SetStateAction<boolean>>
  showTreeView: boolean
  setShowTreeView: Dispatch<SetStateAction<boolean>>
}

const MenusContext = createContext<MenusContext | null>(null)

interface MenusProviderProps {
  children: ReactNode
}

export function MenusProvider({ children }: MenusProviderProps) {
  const [open, setOpen] = useState(false)
  const [currentRow, setCurrentRow] = useState<Menu | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showTreeView, setShowTreeView] = useState(false)

  return (
    <MenusContext.Provider
      value={{
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
        showTreeView,
        setShowTreeView,
      }}
    >
      {children}
    </MenusContext.Provider>
  )
}

export const useMenus = () => {
  const menusContext = useContext(MenusContext)

  if (!menusContext) {
    throw new Error('useMenus has to be used within <MenusProvider>')
  }

  return menusContext
}
