import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/lib/api'
import type { User, LoginCredentials, RegisterData, AuthTokens } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // Actions
  async function register(data: RegisterData) {
    loading.value = true
    error.value = null

    try {
      const response = await api.post<{
        user: User
        token: AuthTokens
      }>('/auth/register', data)

      user.value = response.data.user
      token.value = response.data.token.value
      localStorage.setItem('auth_token', response.data.token.value)

      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function login(credentials: LoginCredentials) {
    loading.value = true
    error.value = null

    try {
      const response = await api.post<{
        user: User
        token: AuthTokens
      }>('/auth/login', credentials)

      user.value = response.data.user
      token.value = response.data.token.value
      localStorage.setItem('auth_token', response.data.token.value)

      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    error.value = null

    try {
      await api.post('/auth/logout')
    } catch (err: any) {
      console.error('Logout error:', err)
    } finally {
      user.value = null
      token.value = null
      localStorage.removeItem('auth_token')
      loading.value = false
    }
  }

  async function fetchCurrentUser() {
    if (!token.value) return

    loading.value = true
    error.value = null

    try {
      const response = await api.get<{ user: User }>('/auth/me')
      user.value = response.data.user
      return response.data.user
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch user'
      // If unauthorized, clear auth state
      if (err.response?.status === 401) {
        user.value = null
        token.value = null
        localStorage.removeItem('auth_token')
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    user,
    token,
    loading,
    error,
    // Getters
    isAuthenticated,
    // Actions
    register,
    login,
    logout,
    fetchCurrentUser,
    clearError,
  }
})
