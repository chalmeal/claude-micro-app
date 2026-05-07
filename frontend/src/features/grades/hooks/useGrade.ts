import { useEffect, useState } from 'react'
import { getGradeById, getGradesByStudentAndSubject } from '@/features/grades/api/getGrades'
import { isAbortError } from '@/shared/api/client'
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
    const controller = new AbortController()
    const { signal } = controller

    async function load() {
      try {
        const data = await getGradeById(id!, signal)
        setGrade(data)
        setError(null)

        if (data) {
          const allTerms = await getGradesByStudentAndSubject(data.studentId, data.subject, signal)
          setAllTermGrades(allTerms)
          const currentIndex = allTerms.findIndex((g) => g.id === data.id)
          setPreviousGrade(
            currentIndex >= 0 && currentIndex < allTerms.length - 1
              ? allTerms[currentIndex + 1]
              : null,
          )
        }
      } catch (err) {
        if (isAbortError(err)) return
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        if (!signal.aborted) setLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [id])

  if (!id)
    return { grade: null, previousGrade: null, allTermGrades: [], loading: false, error: null }
  return { grade, previousGrade, allTermGrades, loading, error }
}
