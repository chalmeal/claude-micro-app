import { useCallback, useRef, useState } from 'react'
import { SnackbarContext, type SnackbarVariant } from '@/shared/hooks/useSnackbar'
import './Snackbar.css'

const HIDE_DURATION = 400
const DISPLAY_DURATION = 3000

type SnackbarItem = {
  id: number
  message: string
  variant: SnackbarVariant
  hiding: boolean
}

type Props = { children: React.ReactNode }

export function SnackbarProvider({ children }: Props) {
  const [items, setItems] = useState<SnackbarItem[]>([])
  const idRef = useRef(0)

  const show = useCallback((message: string, variant: SnackbarVariant = 'success') => {
    const id = ++idRef.current
    setItems((prev) => [...prev, { id, message, variant, hiding: false }])
    setTimeout(() => {
      setItems((prev) => prev.map((item) => item.id === id ? { ...item, hiding: true } : item))
    }, DISPLAY_DURATION - HIDE_DURATION)
    setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id))
    }, DISPLAY_DURATION)
  }, [])

  return (
    <SnackbarContext.Provider value={{ show }}>
      {children}
      <div className="snackbar-container" aria-live="polite" aria-atomic="false">
        {items.map((item) => (
          <div
            key={item.id}
            role="status"
            className={`snackbar snackbar--${item.variant}${item.hiding ? ' snackbar--hiding' : ''}`}
          >
            {item.message}
          </div>
        ))}
      </div>
    </SnackbarContext.Provider>
  )
}
