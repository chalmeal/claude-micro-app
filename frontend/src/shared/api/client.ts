const TOKEN_KEY = 'claude-micro-app:auth-token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError'
}

async function attempt<T>(path: string, init: RequestInit, headers: Record<string, string>): Promise<T> {
  const res = await fetch(`/api${path}`, { ...init, headers })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    let message = `HTTP ${res.status}`
    try {
      const json = JSON.parse(text) as { message?: string; error?: string }
      message = json.message ?? json.error ?? message
    } catch {
      // ignore
    }
    throw new Error(message)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers as Record<string, string> | undefined),
  }

  try {
    return await attempt<T>(path, init, headers)
  } catch (err) {
    // AbortError は再スローしてフック側で握り潰す
    if (isAbortError(err)) throw err
    // 一過性のネットワーク断（dev server 再起動等）は 1 回だけリトライ
    if (err instanceof TypeError && err.message === 'Failed to fetch' && !init.signal?.aborted) {
      await new Promise((r) => setTimeout(r, 300))
      if (init.signal?.aborted) throw new DOMException('Aborted', 'AbortError')
      return attempt<T>(path, init, headers)
    }
    throw err
  }
}
