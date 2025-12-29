import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../authStore'
import api from '@/lib/api'

// Mock the api module
vi.mock('@/lib/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

describe('authStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('initial state', () => {
    it('should have null user initially', () => {
      const store = useAuthStore()
      expect(store.user).toBeNull()
    })

    it('should have null token initially if not in localStorage', () => {
      const store = useAuthStore()
      expect(store.token).toBeNull()
    })

    it('should load token from localStorage if present', () => {
      localStorage.setItem('auth_token', 'test-token')
      const store = useAuthStore()
      expect(store.token).toBe('test-token')
    })

    it('should not be authenticated initially', () => {
      const store = useAuthStore()
      expect(store.isAuthenticated).toBe(false)
    })

    it('should not be loading initially', () => {
      const store = useAuthStore()
      expect(store.loading).toBe(false)
    })

    it('should have null error initially', () => {
      const store = useAuthStore()
      expect(store.error).toBeNull()
    })
  })

  describe('isAuthenticated computed', () => {
    it('should be false when token and user are null', () => {
      const store = useAuthStore()
      expect(store.isAuthenticated).toBe(false)
    })

    it('should be false when only token exists', () => {
      const store = useAuthStore()
      store.token = 'test-token'
      expect(store.isAuthenticated).toBe(false)
    })

    it('should be false when only user exists', () => {
      const store = useAuthStore()
      store.user = { id: 1, email: 'test@example.com', notificationPreferences: {} }
      expect(store.isAuthenticated).toBe(false)
    })

    it('should be true when both token and user exist', () => {
      const store = useAuthStore()
      store.token = 'test-token'
      store.user = { id: 1, email: 'test@example.com', notificationPreferences: {} }
      expect(store.isAuthenticated).toBe(true)
    })
  })

  describe('login', () => {
    it('should successfully login and set user and token', async () => {
      const store = useAuthStore()
      const mockResponse = {
        data: {
          user: { id: 1, email: 'test@example.com', notificationPreferences: {} },
          token: { value: 'auth-token-123' },
        },
      }

      vi.mocked(api.post).mockResolvedValueOnce(mockResponse)

      await store.login({ email: 'test@example.com', password: 'password123' })

      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      })
      expect(store.user).toEqual(mockResponse.data.user)
      expect(store.token).toBe('auth-token-123')
      expect(localStorage.getItem('auth_token')).toBe('auth-token-123')
      expect(store.error).toBeNull()
    })

    it('should set loading state during login', async () => {
      const store = useAuthStore()
      const mockResponse = {
        data: {
          user: { id: 1, email: 'test@example.com', notificationPreferences: {} },
          token: { value: 'auth-token-123' },
        },
      }

      let loadingDuringCall = false
      vi.mocked(api.post).mockImplementation(async () => {
        loadingDuringCall = store.loading
        return mockResponse
      })

      await store.login({ email: 'test@example.com', password: 'password123' })

      expect(loadingDuringCall).toBe(true)
      expect(store.loading).toBe(false)
    })

    it('should handle login error', async () => {
      const store = useAuthStore()
      const errorMessage = 'Invalid credentials'

      vi.mocked(api.post).mockRejectedValueOnce({
        response: { data: { message: errorMessage } },
      })

      try {
        await store.login({ email: 'test@example.com', password: 'wrong-password' })
        expect.fail('Should have thrown an error')
      } catch (err) {
        expect(err).toBeDefined()
      }

      expect(store.user).toBeNull()
      expect(store.token).toBeNull()
      expect(store.error).toBe(errorMessage)
      expect(localStorage.getItem('auth_token')).toBeNull()
    })
  })

  describe('register', () => {
    it('should successfully register and set user and token', async () => {
      const store = useAuthStore()
      const mockResponse = {
        data: {
          user: { id: 1, email: 'newuser@example.com', notificationPreferences: {} },
          token: { value: 'new-auth-token' },
        },
      }

      vi.mocked(api.post).mockResolvedValueOnce(mockResponse)

      await store.register({
        email: 'newuser@example.com',
        password: 'password123',
      })

      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        email: 'newuser@example.com',
        password: 'password123',
      })
      expect(store.user).toEqual(mockResponse.data.user)
      expect(store.token).toBe('new-auth-token')
      expect(localStorage.getItem('auth_token')).toBe('new-auth-token')
    })

    it('should handle registration error', async () => {
      const store = useAuthStore()
      const errorMessage = 'Email already exists'

      vi.mocked(api.post).mockRejectedValueOnce({
        response: { data: { message: errorMessage } },
      })

      try {
        await store.register({
          email: 'existing@example.com',
          password: 'password123',
        })
        expect.fail('Should have thrown an error')
      } catch (err) {
        expect(err).toBeDefined()
      }

      expect(store.error).toBe(errorMessage)
      expect(store.user).toBeNull()
      expect(store.token).toBeNull()
    })
  })

  describe('logout', () => {
    it('should clear user, token, and localStorage', async () => {
      const store = useAuthStore()
      store.user = { id: 1, email: 'test@example.com', notificationPreferences: {} }
      store.token = 'test-token'
      localStorage.setItem('auth_token', 'test-token')

      vi.mocked(api.post).mockResolvedValueOnce({ data: {} })

      await store.logout()

      expect(api.post).toHaveBeenCalledWith('/auth/logout')
      expect(store.user).toBeNull()
      expect(store.token).toBeNull()
      expect(localStorage.getItem('auth_token')).toBeNull()
    })

    it('should clear state even if API call fails', async () => {
      const store = useAuthStore()
      store.user = { id: 1, email: 'test@example.com', notificationPreferences: {} }
      store.token = 'test-token'
      localStorage.setItem('auth_token', 'test-token')

      vi.mocked(api.post).mockRejectedValueOnce(new Error('Network error'))

      await store.logout()

      expect(store.user).toBeNull()
      expect(store.token).toBeNull()
      expect(localStorage.getItem('auth_token')).toBeNull()
    })
  })

  describe('fetchCurrentUser', () => {
    it('should fetch and set current user', async () => {
      const store = useAuthStore()
      store.token = 'test-token'
      const mockUser = { id: 1, email: 'test@example.com', notificationPreferences: {} }

      vi.mocked(api.get).mockResolvedValueOnce({
        data: { user: mockUser },
      })

      await store.fetchCurrentUser()

      expect(api.get).toHaveBeenCalledWith('/auth/me')
      expect(store.user).toEqual(mockUser)
      expect(store.error).toBeNull()
    })

    it('should handle fetch error', async () => {
      const store = useAuthStore()
      store.token = 'test-token'
      const errorMessage = 'Unauthorized'

      vi.mocked(api.get).mockRejectedValueOnce({
        response: { data: { message: errorMessage } },
      })

      try {
        await store.fetchCurrentUser()
        expect.fail('Should have thrown an error')
      } catch (err) {
        expect(err).toBeDefined()
      }

      expect(store.error).toBe(errorMessage)
      expect(store.user).toBeNull()
    })
  })
})
