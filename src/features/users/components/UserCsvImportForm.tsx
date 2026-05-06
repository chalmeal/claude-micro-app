import { useState, type ChangeEvent, type FormEvent } from 'react'
import type { CreateUserInput } from '@/features/users/types'
import { parseUsersCsv } from '@/features/users/utils/parseUsersCsv'

type Props = {
  onSubmit: (inputs: CreateUserInput[]) => void
  onCancel: () => void
  submitting?: boolean
}

export function UserCsvImportForm({ onSubmit, onCancel, submitting }: Props) {
  const [fileName, setFileName] = useState<string>('')
  const [rows, setRows] = useState<CreateUserInput[]>([])
  const [parseErrors, setParseErrors] = useState<string[]>([])

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setRows([])
    setParseErrors([])

    try {
      const text = await file.text()
      const result = parseUsersCsv(text)
      setRows(result.rows)
      setParseErrors(result.errors)
    } catch (err) {
      setParseErrors([
        `ファイルの読み込みに失敗しました: ${
          err instanceof Error ? err.message : String(err)
        }`,
      ])
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (rows.length === 0) return
    onSubmit(rows)
  }

  return (
    <form className="csv-form" onSubmit={handleSubmit}>
      <div className="csv-form__hint">
        ヘッダー行に <code>name,email,role,status</code> を含む CSV ファイルを選択してください。
        <br />
        例:
        <pre className="csv-form__sample">{`name,email,role,status
田中 太郎,tanaka@example.com,member,active
鈴木 花子,suzuki@example.com,admin,active`}</pre>
      </div>

      <label className="csv-form__file-label">
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="csv-form__file"
        />
        <span className="csv-form__file-button">ファイルを選択</span>
        <span className="csv-form__file-name">
          {fileName || '選択されていません'}
        </span>
      </label>

      {parseErrors.length > 0 && (
        <ul className="csv-form__errors" role="alert">
          {parseErrors.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
      )}

      {rows.length > 0 && (
        <div className="csv-form__preview">
          <p className="csv-form__preview-count">
            {rows.length} 件のユーザーが取り込まれます
          </p>
          <div className="csv-form__preview-table-wrapper">
            <table className="csv-form__preview-table">
              <thead>
                <tr>
                  <th>名前</th>
                  <th>メールアドレス</th>
                  <th>ロール</th>
                  <th>ステータス</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    <td>{row.name}</td>
                    <td>{row.email}</td>
                    <td>{row.role}</td>
                    <td>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="csv-form__actions">
        <button type="button" onClick={onCancel} disabled={submitting}>
          キャンセル
        </button>
        <button
          type="submit"
          className="csv-form__submit"
          disabled={rows.length === 0 || submitting}
        >
          {submitting
            ? '登録中...'
            : rows.length > 0
              ? `${rows.length} 件を登録`
              : '登録'}
        </button>
      </div>
    </form>
  )
}
