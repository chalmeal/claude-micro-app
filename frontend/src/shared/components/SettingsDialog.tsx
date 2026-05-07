import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/features/auth'
import './SettingsDialog.css'

type Props = {
  onClose: () => void
}

type PasswordStatus = 'idle' | 'loading' | 'success' | 'error'

export function SettingsDialog({ onClose }: Props) {
  const { user, changePassword } = useAuth()
  const dialogRef = useRef<HTMLDivElement>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState<PasswordStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    dialogRef.current?.focus()
  }, [])

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage('')

    if (newPassword !== confirmPassword) {
      setStatus('error')
      setErrorMessage('新しいパスワードが一致しません')
      return
    }
    if (newPassword.length < 8) {
      setStatus('error')
      setErrorMessage('新しいパスワードは8文字以上で入力してください')
      return
    }

    setStatus('loading')
    try {
      await changePassword(currentPassword, newPassword)
      setStatus('success')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'パスワードの変更に失敗しました')
    }
  }

  return (
    <div
      className="settings-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      aria-modal="true"
      role="dialog"
      aria-label="設定"
    >
      <div className="settings-dialog" ref={dialogRef} tabIndex={-1}>
        <div className="settings-dialog__header">
          <h2 className="settings-dialog__title">設定</h2>
          <button className="settings-dialog__close" onClick={onClose} aria-label="閉じる">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="settings-dialog__body">
          {/* アカウント */}
          <section className="settings-section">
            <h3 className="settings-section__title">アカウント</h3>
            <div className="settings-section__card">
              <div className="settings-row">
                <div className="settings-row__avatar">{user?.email?.[0]?.toUpperCase() ?? '?'}</div>
                <div className="settings-row__info">
                  <span className="settings-row__label">メールアドレス</span>
                  <span className="settings-row__value">{user?.email}</span>
                </div>
              </div>
            </div>
          </section>

          {/* パスワード変更 */}
          <section className="settings-section">
            <h3 className="settings-section__title">パスワード変更</h3>
            <div className="settings-section__card">
              <form className="password-form" onSubmit={handleChangePassword}>
                {status === 'success' && (
                  <p className="password-form__success">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    パスワードを変更しました
                  </p>
                )}
                {status === 'error' && <p className="password-form__error">{errorMessage}</p>}

                <div className="password-form__field">
                  <label htmlFor="current-password">現在のパスワード</label>
                  <input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    disabled={status === 'loading'}
                  />
                </div>

                <div className="password-form__field">
                  <label htmlFor="new-password">新しいパスワード</label>
                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    disabled={status === 'loading'}
                  />
                  <span className="password-form__hint">8文字以上</span>
                </div>

                <div className="password-form__field">
                  <label htmlFor="confirm-password">新しいパスワード（確認）</label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    disabled={status === 'loading'}
                  />
                </div>

                <div className="password-form__actions">
                  <button
                    type="submit"
                    className="password-form__submit"
                    disabled={status === 'loading'}
                  >
                    {status === 'loading' ? '変更中…' : 'パスワードを変更する'}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>

        <div className="settings-dialog__footer">
          <button className="settings-dialog__cancel" onClick={onClose}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}
