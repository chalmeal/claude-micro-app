import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { requestPasswordReset } from '@/features/auth/api/resetPassword'
import { appConfig } from '@/app/config'
import './LoginPage.css'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await requestPasswordReset(email)
      setSubmitted(true)
    } catch {
      setError('送信に失敗しました。しばらく経ってからお試しください。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__card">
        <div className="login-page__brand">
          <p className="login-page__app-name">{appConfig.name}</p>
          <p className="login-page__description">{appConfig.description}</p>
        </div>
        <h1 className="login-page__title">パスワード再設定</h1>

        {submitted ? (
          <div className="reset-sent">
            <p>
              登録済みのメールアドレスの場合、再設定用のリンクをお送りしました。
              メールをご確認ください。
            </p>
            <Link to="/login" className="reset-back-link">
              ログインに戻る
            </Link>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="login-form__field">
              <label htmlFor="email">メールアドレス</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="login-form__error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" disabled={submitting}>
              {submitting ? '送信中...' : '再設定メールを送信'}
            </button>

            <Link to="/login" className="reset-back-link">
              ログインに戻る
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
