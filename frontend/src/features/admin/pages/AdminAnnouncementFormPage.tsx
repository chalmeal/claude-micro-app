import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  createAnnouncement,
  getAnnouncementById,
  updateAnnouncement,
} from '@/shared/api/announcements'
import type { Announcement } from '@/shared/types'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { useSnackbar } from '@/shared/hooks/useSnackbar'
import './AdminAnnouncementFormPage.css'

type FormValues = {
  title: string
  body: string
  category: Announcement['category']
  date: string
}

const EMPTY: FormValues = {
  title: '',
  body: '',
  category: 'info',
  date: new Date().toISOString().slice(0, 10),
}

export function AdminAnnouncementFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const snackbar = useSnackbar()
  const isEdit = id !== undefined

  const [values, setValues] = useState<FormValues>(EMPTY)
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  const [titleError, setTitleError] = useState(false)
  const [dateError, setDateError] = useState(false)
  const [bodyError, setBodyError] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    let cancelled = false

    async function load() {
      const item = await getAnnouncementById(id!)
      if (cancelled) return
      if (!item) {
        navigate('/admin/announcements', { replace: true })
        return
      }
      setValues({ title: item.title, body: item.body, category: item.category, date: item.date })
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id, isEdit, navigate])

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaveError('')

    const hasTitleError = !values.title.trim()
    const hasDateError = !values.date
    const hasBodyError = !values.body.trim()

    setTitleError(hasTitleError)
    setDateError(hasDateError)
    setBodyError(hasBodyError)

    if (hasTitleError || hasDateError || hasBodyError) return

    setShowConfirm(true)
  }

  async function doSave() {
    setSubmitting(true)
    try {
      if (isEdit) {
        await updateAnnouncement(id!, values)
      } else {
        await createAnnouncement(values)
      }
      snackbar.show(isEdit ? 'お知らせを更新しました' : 'お知らせを作成しました')
      navigate('/admin/announcements')
    } catch {
      setSaveError('保存に失敗しました。もう一度お試しください。')
      setSubmitting(false)
    }
  }

  return (
    <div className="announcement-form-page">
      <Link to="/admin/announcements" className="announcement-form-page__back">
        ← お知らせ管理に戻る
      </Link>

      <div className="announcement-form-page__intro">
        <h1>{isEdit ? 'お知らせを編集' : 'お知らせを作成'}</h1>
      </div>

      {loading ? (
        <div className="announcement-form-page__skeleton">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="announcement-form-page__skeleton-row" />
          ))}
        </div>
      ) : (
        <div className="announcement-form-page__card">
          {saveError && (
            <p className="announcement-form-page__error" role="alert">
              {saveError}
            </p>
          )}

          <form className="announcement-form" onSubmit={handleSubmit} noValidate>
            <div
              className={`announcement-form__field${titleError ? ' announcement-form__field--error' : ''}`}
            >
              <label htmlFor="af-title">
                タイトル{' '}
                <span className="announcement-form__required" aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="af-title"
                type="text"
                value={values.title}
                onChange={(e) => {
                  set('title', e.target.value)
                  if (e.target.value.trim()) setTitleError(false)
                }}
                placeholder="お知らせのタイトルを入力"
                disabled={submitting}
                aria-required="true"
                aria-invalid={titleError}
              />
              {titleError && (
                <span className="announcement-form__error-msg" role="alert">
                  タイトルを入力してください
                </span>
              )}
            </div>

            <div className="announcement-form__row">
              <div className="announcement-form__field">
                <label htmlFor="af-category">カテゴリ</label>
                <select
                  id="af-category"
                  value={values.category}
                  onChange={(e) => set('category', e.target.value as Announcement['category'])}
                  disabled={submitting}
                >
                  <option value="info">お知らせ</option>
                  <option value="important">重要</option>
                  <option value="maintenance">メンテナンス</option>
                </select>
              </div>

              <div
                className={`announcement-form__field${dateError ? ' announcement-form__field--error' : ''}`}
              >
                <label htmlFor="af-date">
                  日付{' '}
                  <span className="announcement-form__required" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  id="af-date"
                  type="date"
                  value={values.date}
                  onChange={(e) => {
                    set('date', e.target.value)
                    if (e.target.value) setDateError(false)
                  }}
                  disabled={submitting}
                  aria-required="true"
                  aria-invalid={dateError}
                />
                {dateError && (
                  <span className="announcement-form__error-msg" role="alert">
                    日付を入力してください
                  </span>
                )}
              </div>
            </div>

            <div
              className={`announcement-form__field${bodyError ? ' announcement-form__field--error' : ''}`}
            >
              <label htmlFor="af-body">
                本文{' '}
                <span className="announcement-form__required" aria-hidden="true">
                  *
                </span>
              </label>
              <textarea
                id="af-body"
                value={values.body}
                onChange={(e) => {
                  set('body', e.target.value)
                  if (e.target.value.trim()) setBodyError(false)
                }}
                placeholder="お知らせの内容を入力"
                rows={6}
                disabled={submitting}
                aria-required="true"
                aria-invalid={bodyError}
              />
              {bodyError && (
                <span className="announcement-form__error-msg" role="alert">
                  本文を入力してください
                </span>
              )}
            </div>

            <div className="announcement-form__actions">
              <Link to="/admin/announcements" className="announcement-form__cancel">
                キャンセル
              </Link>
              <button type="submit" className="announcement-form__submit" disabled={submitting}>
                {submitting ? '保存中…' : isEdit ? '更新する' : '作成する'}
              </button>
            </div>
          </form>
        </div>
      )}

      {showConfirm && (
        <ConfirmDialog
          title={isEdit ? '更新の確認' : '登録の確認'}
          message={isEdit ? '以下の内容でお知らせを更新しますか？' : '以下の内容でお知らせを作成しますか？'}
          details={
            <table className="confirm-detail-table">
              <tbody>
                <tr><th>タイトル</th><td>{values.title}</td></tr>
                <tr>
                  <th>カテゴリ</th>
                  <td>
                    {{ info: 'お知らせ', important: '重要', maintenance: 'メンテナンス' }[values.category]}
                  </td>
                </tr>
                <tr><th>日付</th><td>{values.date}</td></tr>
                <tr>
                  <th>本文</th>
                  <td>{values.body.length > 80 ? `${values.body.slice(0, 80)}…` : values.body}</td>
                </tr>
              </tbody>
            </table>
          }
          confirmLabel={isEdit ? '更新する' : '作成する'}
          onConfirm={() => {
            setShowConfirm(false)
            doSave()
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  )
}
