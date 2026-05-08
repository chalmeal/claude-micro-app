import { useNavigate } from 'react-router-dom'
import { DataTable, type Column } from '@/shared/components/DataTable'
import { GradeBadge } from '@/shared/components/Badge'
import type { Grade, Semester } from '@/features/grades/types'

type Props = {
  grades: Grade[]
}

const semesterLabel: Record<Semester, string> = { spring: '前期', fall: '後期' }

const columns: Column<Grade>[] = [
  { key: 'studentName', label: '学生名', render: (g) => g.studentName },
  { key: 'subject', label: '科目', render: (g) => g.subject },
  { key: 'score', label: '点数', className: 'grade-list__score', render: (g) => g.score },
  { key: 'letter', label: '評価', render: (g) => <GradeBadge letter={g.letter} /> },
  { key: 'year', label: '年度', className: 'grade-list__year', render: (g) => g.year },
  { key: 'semester', label: '学期', render: (g) => semesterLabel[g.semester] },
]

export function GradeList({ grades }: Props) {
  const navigate = useNavigate()

  return (
    <DataTable
      columns={columns}
      rows={grades}
      getRowKey={(g) => g.id}
      onRowClick={(g) => navigate(`/grades/${g.id}`)}
      getRowAriaLabel={(g) => `${g.studentName} ${g.subject} の詳細を表示`}
      emptyMessage="該当する成績データがありません"
      className="grade-list"
    />
  )
}
