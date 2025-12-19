const BASE_URL = 'https://bilcobe-2.onrender.com'

// --- LOGGING HELPER ---
const LOG_KEY = 'bilco_api_logs'
const MAX_LOGS = 100

interface ApiLog {
  id: string
  method: string
  url: string
  status: number
  duration: number
  timestamp: string
}

function trackApiCall(method: string, url: string, status: number, startTime: number) {
  const duration = performance.now() - startTime
  const newLog: ApiLog = {
    id: Math.random().toString(36).substr(2, 9),
    method,
    url: url.replace(BASE_URL, ''),
    status,
    duration,
    timestamp: new Date().toISOString()
  }

  try {
    const stored = localStorage.getItem(LOG_KEY)
    let logs: ApiLog[] = stored ? JSON.parse(stored) : []
    logs.push(newLog)
    if (logs.length > MAX_LOGS) {
      logs = logs.slice(logs.length - MAX_LOGS)
    }
    localStorage.setItem(LOG_KEY, JSON.stringify(logs))
  } catch (e) {
    // Ignore logging errors
  }
}
// ----------------------

export async function apiGet<T>(path: string, options?: RequestInit): Promise<T> {
  const start = performance.now()
  let status = 0
  try {
    const res = await fetch(`${BASE_URL}${path}`, createOptions('GET', undefined, options))
    status = res.status
    if (!res.ok) {
      throw new Error(`GET ${path} failed with status ${res.status}`)
    }
    return await res.json()
  } finally {
    trackApiCall('GET', path, status || 500, start)
  }
}

export async function apiPost<TBody, TResponse>(
  path: string,
  body: TBody,
  options?: RequestInit,
): Promise<TResponse> {
  const start = performance.now()
  let status = 0
  try {
    const res = await fetch(`${BASE_URL}${path}`, createOptions('POST', body, options))
    status = res.status
    if (!res.ok) {
      throw new Error(`POST ${path} failed with status ${res.status}`)
    }
    return await res.json()
  } finally {
    trackApiCall('POST', path, status || 500, start)
  }
}

export async function apiPut<TBody, TResponse>(
  path: string,
  body: TBody,
  options?: RequestInit,
): Promise<TResponse> {
  const start = performance.now()
  let status = 0
  try {
    const res = await fetch(`${BASE_URL}${path}`, createOptions('PUT', body, options))
    status = res.status
    if (res.status === 204) {
      return {} as TResponse
    }
    if (!res.ok) {
      throw new Error(`PUT ${path} failed with status ${res.status}`)
    }
    return await res.json()
  } finally {
    trackApiCall('PUT', path, status || 500, start)
  }
}

export async function apiDelete<TResponse>(
  path: string,
  options?: RequestInit,
): Promise<TResponse> {
  const start = performance.now()
  let status = 0
  try {
    const res = await fetch(`${BASE_URL}${path}`, createOptions('DELETE', undefined, options))
    status = res.status
    if (res.status === 204 || res.status === 200) {
      return {} as TResponse
    }
    if (!res.ok) {
      throw new Error(`DELETE ${path} failed with status ${res.status}`)
    }
    return await res.json()
  } finally {
    trackApiCall('DELETE', path, status || 500, start)
  }
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



