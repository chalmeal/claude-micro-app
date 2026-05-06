import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export function AdminRoute({ children }: Props) {
  const { isAuthenticated, isAdmin } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
