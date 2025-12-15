const BASE_URL = 'https://bilcobe-2.onrender.com'

export async function apiGet<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, createOptions('GET', undefined, options))

  if (!res.ok) {
    throw new Error(`GET ${path} failed with status ${res.status}`)
  }

  return res.json()
}

export async function apiPost<TBody, TResponse>(
  path: string,
  body: TBody,
  options?: RequestInit,
): Promise<TResponse> {
  const res = await fetch(`${BASE_URL}${path}`, createOptions('POST', body, options))

  if (!res.ok) {
    throw new Error(`POST ${path} failed with status ${res.status}`)
  }

  return res.json()
}

export async function apiPut<TBody, TResponse>(
  path: string,
  body: TBody,
  options?: RequestInit,
): Promise<TResponse> {
  const res = await fetch(`${BASE_URL}${path}`, createOptions('PUT', body, options))

  if (res.status === 204) {
    return {} as TResponse
  }

  if (!res.ok) {
    throw new Error(`PUT ${path} failed with status ${res.status}`)
  }

  return res.json()
}

export async function apiDelete<TResponse>(
  path: string,
  options?: RequestInit,
): Promise<TResponse> {
  const res = await fetch(`${BASE_URL}${path}`, createOptions('DELETE', undefined, options))

  if (res.status === 204 || res.status === 200) {
    return {} as TResponse
  }

  if (!res.ok) {
    throw new Error(`DELETE ${path} failed with status ${res.status}`)
  }

  return res.json()
}

function createOptions(method: string, body?: unknown, options?: RequestInit): RequestInit {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
    console.log('🔑 Token found, adding to headers:', token.substring(0, 20) + '...')
  } else {
    console.warn('⚠️ No token found in localStorage!')
  }

  console.log('📤 Request headers:', headers)

  return {
    method,
    ...options,
    headers,
    body: body !== undefined ? JSON.stringify(body) : options?.body,
  }
}



