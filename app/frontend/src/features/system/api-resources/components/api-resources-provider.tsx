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

import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import type { ApiResource } from '@/types/api-resource'

type ApiResourcesDialogType = 'create' | 'edit' | 'delete'

type ApiResourcesContextType = {
  open: ApiResourcesDialogType | null
  setOpen: (str: ApiResourcesDialogType | null) => void
  currentRow: ApiResource | null
  setCurrentRow: React.Dispatch<React.SetStateAction<ApiResource | null>>
}

const ApiResourcesContext = React.createContext<ApiResourcesContextType | null>(null)

export function ApiResourcesProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<ApiResourcesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<ApiResource | null>(null)

  return (
    <ApiResourcesContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </ApiResourcesContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useApiResourcesContext = () => {
  const context = React.useContext(ApiResourcesContext)
  if (!context) {
    throw new Error('useApiResourcesContext has to be used within <ApiResourcesProvider>')
  }
  return context
}
