import { useEffect, useState } from 'react'
import { getGradeById, getGradesByStudentAndSubject } from '@/features/grades/api/getGrades'
import type { Grade } from '@/features/grades/types'

type GradeData = {
  grade: Grade | null
  previousGrade: Grade | null
  allTermGrades: Grade[]
  loading: boolean
  error: Error | null
}

export function useGrade(id: string | undefined): GradeData {
  const [grade, setGrade] = useState<Grade | null>(null)
  const [previousGrade, setPreviousGrade] = useState<Grade | null>(null)
  const [allTermGrades, setAllTermGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(Boolean(id))
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!id) return

    let cancelled = false

    async function load() {
      try {
        const data = await getGradeById(id!)
        if (!cancelled) {
          setGrade(data)
          setError(null)
        }
        if (data && !cancelled) {
          const allTerms = await getGradesByStudentAndSubject(data.studentId, data.subject)
          if (!cancelled) {
            setAllTermGrades(allTerms)
            const currentIndex = allTerms.findIndex((g) => g.id === data.id)
            setPreviousGrade(
              currentIndex >= 0 && currentIndex < allTerms.length - 1
                ? allTerms[currentIndex + 1]
                : null,
            )
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id])

  if (!id) return { grade: null, previousGrade: null, allTermGrades: [], loading: false, error: null }
  return { grade, previousGrade, allTermGrades, loading, error }
}
