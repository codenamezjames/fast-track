import { create } from 'zustand'
import { api, setTokens, clearTokens, getAccessToken } from '../lib/api'

interface User {
  id: string
  email: string
}

interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  initialized: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false,

  login: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      const data = await api.post<AuthResponse>('/auth/login', { email, password })
      setTokens(data.token, data.refreshToken)
      set({ user: data.user, loading: false })
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      set({ loading: false, error: message })
      return false
    }
  },

  register: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      const data = await api.post<AuthResponse>('/auth/register', { email, password })
      setTokens(data.token, data.refreshToken)
      set({ user: data.user, loading: false })
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      set({ loading: false, error: message })
      return false
    }
  },

  logout: async () => {
    clearTokens()
    set({ user: null })
  },

  clearError: () => set({ error: null }),
}))

// Initialize auth state from stored token
const initializeAuth = () => {
  const token = getAccessToken()
  if (token) {
    try {
      // Decode JWT payload to get user info
      const payload = JSON.parse(atob(token.split('.')[1]))
      useAuthStore.setState({
        user: { id: payload.userId, email: payload.email },
        initialized: true,
      })
    } catch {
      clearTokens()
      useAuthStore.setState({ initialized: true })
    }
  } else {
    useAuthStore.setState({ initialized: true })
  }
}

initializeAuth()
