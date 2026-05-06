import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export function ProtectedRoute({ children }: Props) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}
