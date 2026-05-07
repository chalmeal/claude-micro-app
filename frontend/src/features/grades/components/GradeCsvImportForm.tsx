import { useState, type ChangeEvent, type FormEvent } from 'react'
import { type CreateGradeInput } from '@/features/grades/types'
import { parseGradesCsv } from '@/features/grades/utils/parseGradesCsv'

type Props = {
  onSubmit: (inputs: CreateGradeInput[]) => void
  submitting?: boolean
}

const semesterLabel: Record<string, string> = {
  spring: '前期',
  fall: '後期',
}

export function GradeCsvImportForm({ onSubmit, submitting }: Props) {
  const [fileName, setFileName] = useState<string>('')
  const [rows, setRows] = useState<CreateGradeInput[]>([])
  const [parseErrors, setParseErrors] = useState<string[]>([])

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setRows([])
    setParseErrors([])

    try {
      const text = await file.text()
      const result = parseGradesCsv(text)
      setRows(result.rows)
      setParseErrors(result.errors)
    } catch (err) {
      setParseErrors([
        `ファイルの読み込みに失敗しました: ${err instanceof Error ? err.message : String(err)}`,
      ])
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (rows.length === 0) return
    onSubmit(rows)
  }

  return (
    <form className="grade-csv-form" onSubmit={handleSubmit}>
      <div className="grade-csv-form__hint">
        ヘッダー行に <code>studentName,subject,score,year,semester</code> を含む CSV
        ファイルを選択してください。
        <br />
        例:
        <pre className="grade-csv-form__sample">{`studentName,subject,score,year,semester
田中 太郎,数学I,85,2024,spring
鈴木 花子,英語,72,2024,fall`}</pre>
        <p className="grade-csv-form__hint-note">
          semester は <code>spring</code>（前期）または <code>fall</code>
          （後期）を指定してください。
        </p>
      </div>

      <label className="grade-csv-form__file-label">
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="grade-csv-form__file"
        />
        <span className="grade-csv-form__file-button">ファイルを選択</span>
        <span className="grade-csv-form__file-name">{fileName || '選択されていません'}</span>
      </label>

      {parseErrors.length > 0 && (
        <ul className="grade-csv-form__errors" role="alert">
          {parseErrors.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
      )}

      {rows.length > 0 && (
        <div className="grade-csv-form__preview">
          <p className="grade-csv-form__preview-count">{rows.length} 件の成績が取り込まれます</p>
          <div className="grade-csv-form__preview-table-wrapper">
            <table className="grade-csv-form__preview-table">
              <thead>
                <tr>
                  <th>学生名</th>
                  <th>科目</th>
                  <th>点数</th>
                  <th>年度</th>
                  <th>学期</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    <td>{row.studentName}</td>
                    <td>{row.subject}</td>
                    <td>{row.score}</td>
                    <td>{row.year}年度</td>
                    <td>{semesterLabel[row.semester]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grade-csv-form__actions">
        <button
          type="submit"
          className="grade-csv-form__submit"
          disabled={rows.length === 0 || submitting}
        >
          {submitting ? '登録中...' : rows.length > 0 ? `${rows.length} 件を登録` : '登録'}
        </button>
      </div>
    </form>
  )
}
