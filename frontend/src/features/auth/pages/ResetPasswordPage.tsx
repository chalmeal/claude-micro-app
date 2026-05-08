import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { confirmPasswordReset } from '@/features/auth/api/resetPassword'
import { appConfig } from '@/app/config'
import './LoginPage.css'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password !== passwordConfirm) {
      setError('パスワードが一致しません。')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await confirmPasswordReset(token, password)
      navigate('/login', { state: { passwordReset: true } })
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      setError(
        msg === 'Invalid or expired reset token'
          ? '再設定リンクが無効または期限切れです。再度お試しください。'
          : 'パスワードの再設定に失敗しました。',
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div className="login-page">
        <div className="login-page__card">
          <p className="login-form__error" role="alert">
            無効なリンクです。
          </p>
          <Link to="/forgot-password" className="reset-back-link">
            再設定メールを再送する
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-page__card">
        <div className="login-page__brand">
          <p className="login-page__app-name">{appConfig.name}</p>
          <p className="login-page__description">{appConfig.description}</p>
        </div>
        <h1 className="login-page__title">新しいパスワードを設定</h1>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="login-form__field">
            <label htmlFor="password">新しいパスワード（8文字以上）</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>

          <div className="login-form__field">
            <label htmlFor="passwordConfirm">新しいパスワード（確認）</label>
            <input
              id="passwordConfirm"
              type="password"
              autoComplete="new-password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              minLength={8}
              required
            />
          </div>

          {error && (
            <p className="login-form__error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting}>
            {submitting ? '設定中...' : 'パスワードを設定する'}
          </button>
        </form>
      </div>
    </div>
  )
}
