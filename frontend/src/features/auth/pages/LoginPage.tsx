import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { appConfig } from '@/app/config'
import './LoginPage.css'

type LocationState = {
  from?: { pathname: string }
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const redirectTo = (location.state as LocationState | null)?.from?.pathname ?? '/'

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  return (
    <div className="login-page">
      <div className="login-page__card">
        <div className="login-page__brand">
          <p className="login-page__app-name">{appConfig.name}</p>
          <p className="login-page__description">{appConfig.description}</p>
        </div>
        <h1 className="login-page__title">ログイン</h1>
        <LoginForm onSuccess={() => navigate(redirectTo, { replace: true })} />
      </div>
    </div>
  )
}
