import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { GradeList } from '../GradeList'
import type { Grade } from '@/features/grades/types'

const grades: Grade[] = [
  { id: '1', studentId: 'u1', studentName: '田中', subject: '数学', score: 85, letter: 'A', year: 2024, semester: 'spring' },
  { id: '2', studentId: 'u2', studentName: '鈴木', subject: '英語', score: 45, letter: 'F', year: 2024, semester: 'fall' },
]

describe('GradeList', () => {
  it('学生名と科目を表示する', () => {
    render(<MemoryRouter><GradeList grades={grades} /></MemoryRouter>)
    expect(screen.getByText('田中')).toBeInTheDocument()
    expect(screen.getByText('数学')).toBeInTheDocument()
    expect(screen.getByText('英語')).toBeInTheDocument()
  })

  it('点数を表示する', () => {
    render(<MemoryRouter><GradeList grades={grades} /></MemoryRouter>)
    expect(screen.getByText('85')).toBeInTheDocument()
    expect(screen.getByText('45')).toBeInTheDocument()
  })

  it('評価バッジを表示する', () => {
    render(<MemoryRouter><GradeList grades={grades} /></MemoryRouter>)
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('F')).toBeInTheDocument()
  })

  it('学期を日本語で表示する', () => {
    render(<MemoryRouter><GradeList grades={grades} /></MemoryRouter>)
    expect(screen.getByText('前期')).toBeInTheDocument()
    expect(screen.getByText('後期')).toBeInTheDocument()
  })

  it('年度を表示する', () => {
    render(<MemoryRouter><GradeList grades={grades} /></MemoryRouter>)
    expect(screen.getAllByText('2024')).toHaveLength(2)
  })

  it('行に aria-label が設定される', () => {
    render(<MemoryRouter><GradeList grades={grades} /></MemoryRouter>)
    expect(screen.getByRole('row', { name: '田中 数学 の詳細を表示' })).toBeInTheDocument()
  })

  it('行にクリック可能なクラスが付く', () => {
    const { container } = render(<MemoryRouter><GradeList grades={grades} /></MemoryRouter>)
    const rows = container.querySelectorAll('tr.data-table__row--clickable')
    expect(rows.length).toBe(grades.length)
  })

  it('成績が空のときはメッセージを表示する', () => {
    render(<MemoryRouter><GradeList grades={[]} /></MemoryRouter>)
    expect(screen.getByText('該当する成績データがありません')).toBeInTheDocument()
  })
})
