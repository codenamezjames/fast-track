const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Token management
let accessToken: string | null = localStorage.getItem('accessToken')
let refreshToken: string | null = localStorage.getItem('refreshToken')

export const setTokens = (access: string, refresh: string) => {
  accessToken = access
  refreshToken = refresh
  localStorage.setItem('accessToken', access)
  localStorage.setItem('refreshToken', refresh)
}

export const clearTokens = () => {
  accessToken = null
  refreshToken = null
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

export const getAccessToken = () => accessToken

interface ApiError extends Error {
  status?: number
}

// Fetch wrapper with auth and refresh logic
export const apiFetch = async <T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (accessToken) {
    ;(headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`
  }

  let response = await fetch(`${API_URL}${endpoint}`, { ...options, headers })

  // If 401, try to refresh token
  if (response.status === 401 && refreshToken) {
    try {
      const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })

      if (refreshResponse.ok) {
        const data = await refreshResponse.json()
        setTokens(data.token, data.refreshToken)
        ;(headers as Record<string, string>)['Authorization'] = `Bearer ${data.token}`
        response = await fetch(`${API_URL}${endpoint}`, { ...options, headers })
      } else {
        clearTokens()
        window.location.hash = '#/login'
        const error: ApiError = new Error('Session expired')
        error.status = 401
        throw error
      }
    } catch (refreshError) {
      clearTokens()
      window.location.hash = '#/login'
      const error: ApiError = new Error('Session expired')
      error.status = 401
      throw error
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }))
    const error: ApiError = new Error(errorData.error || 'Request failed')
    error.status = response.status
    throw error
  }

  // Handle empty responses (204 No Content)
  const text = await response.text()
  if (!text) return {} as T

  return JSON.parse(text) as T
}

// Convenience methods
export const api = {
  get: <T = unknown>(endpoint: string) => apiFetch<T>(endpoint),

  post: <T = unknown>(endpoint: string, data?: unknown) =>
    apiFetch<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = unknown>(endpoint: string, data?: unknown) =>
    apiFetch<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = unknown>(endpoint: string) =>
    apiFetch<T>(endpoint, { method: 'DELETE' }),
}
