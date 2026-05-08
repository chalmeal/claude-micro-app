import './ErrorAlert.css'

type Props = {
  error: Error | string | null | undefined
  prefix?: string
}

export function ErrorAlert({ error, prefix = 'データの読み込みに失敗しました' }: Props) {
  if (!error) return null
  const message = error instanceof Error ? error.message : error
  return (
    <p className="error-alert" role="alert">
      {prefix}: {message}
    </p>
  )
}
