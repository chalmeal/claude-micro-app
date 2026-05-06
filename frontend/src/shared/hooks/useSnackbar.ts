import { createContext, useContext } from 'react'

export type SnackbarVariant = 'success' | 'error'

export type SnackbarContextValue = {
  show: (message: string, variant?: SnackbarVariant) => void
}

export const SnackbarContext = createContext<SnackbarContextValue | null>(null)

export function useSnackbar() {
  const ctx = useContext(SnackbarContext)
  if (!ctx) throw new Error('useSnackbar must be used within SnackbarProvider')
  return ctx
}
