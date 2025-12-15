export type ApiErrorBody = {
  error?: string
}

async function parseError(res: Response) {
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    const json = (await res.json().catch(() => null)) as ApiErrorBody | null
    if (json?.error) return json.error
  }

  const text = await res.text().catch(() => '')
  return text || res.statusText
}

interface ApiRequestOptions extends RequestInit {
  baseUrl?: string
}

export async function apiRequest<T>(path: string, init?: ApiRequestOptions): Promise<T> {
  const baseUrl = init?.baseUrl || ''
  const url = path.startsWith('http') ? path : `${baseUrl}${path}`
  
  const res = await fetch(url, {
    credentials: 'include',
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers || {}),
    },
  })

  if (!res.ok) {
    const message = await parseError(res)
    throw new Error(message)
  }

  return (await res.json()) as T
}

export async function apiGet<T>(path: string, init?: ApiRequestOptions): Promise<T> {
  return apiRequest<T>(path, { ...init, method: 'GET' })
}

export async function apiPost<T>(path: string, body?: unknown, init?: ApiRequestOptions): Promise<T> {
  return apiRequest<T>(path, {
    ...init,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    body: body == null ? undefined : JSON.stringify(body),
  })
}

export async function apiDelete<T>(path: string, init?: ApiRequestOptions): Promise<T> {
  return apiRequest<T>(path, { ...init, method: 'DELETE' })
}

export async function apiPut<T>(path: string, body?: unknown, init?: ApiRequestOptions): Promise<T> {
  return apiRequest<T>(path, {
    ...init,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    body: body == null ? undefined : JSON.stringify(body),
  })
}
