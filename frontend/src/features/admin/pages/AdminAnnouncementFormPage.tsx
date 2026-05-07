import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  createAnnouncement,
  getAnnouncementById,
  updateAnnouncement,
} from '@/shared/api/announcements'
import type { Announcement } from '@/shared/types'
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
  const [error, setError] = useState('')

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!values.title.trim()) {
      setError('タイトルを入力してください')
      return
    }
    if (!values.body.trim()) {
      setError('本文を入力してください')
      return
    }
    if (!values.date) {
      setError('日付を入力してください')
      return
    }

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
      setError('保存に失敗しました。もう一度お試しください。')
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
          {error && (
            <p className="announcement-form-page__error" role="alert">
              {error}
            </p>
          )}

          <form className="announcement-form" onSubmit={handleSubmit}>
            <div className="announcement-form__field">
              <label htmlFor="af-title">タイトル</label>
              <input
                id="af-title"
                type="text"
                value={values.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="お知らせのタイトルを入力"
                disabled={submitting}
                required
              />
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

              <div className="announcement-form__field">
                <label htmlFor="af-date">日付</label>
                <input
                  id="af-date"
                  type="date"
                  value={values.date}
                  onChange={(e) => set('date', e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            <div className="announcement-form__field">
              <label htmlFor="af-body">本文</label>
              <textarea
                id="af-body"
                value={values.body}
                onChange={(e) => set('body', e.target.value)}
                placeholder="お知らせの内容を入力"
                rows={6}
                disabled={submitting}
                required
              />
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
    </div>
  )
}
