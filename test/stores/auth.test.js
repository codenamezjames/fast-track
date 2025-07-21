import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../../src/stores/auth.js'

// Mock the auth service
vi.mock('../../src/services/auth.js', () => ({
  authService: {
    register: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    isLoggedIn: vi.fn(),
    updatePreferences: vi.fn()
  }
}))

describe('Auth Store', () => {
  let authStore

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      expect(authStore.user).toBe(null)
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.isLoading).toBe(false)
      expect(authStore.error).toBe(null)
    })
  })

  describe('Getters', () => {
    beforeEach(() => {
      authStore.user = createMockUser()
    })

    it('should return correct userId', () => {
      expect(authStore.userId).toBe('test-user-123')
    })

    it('should return userEmail', () => {
      expect(authStore.userEmail).toBe('test@example.com')
    })

    it('should return userName', () => {
      expect(authStore.userName).toBe('Test User')
    })

    it('should return default userId when no user', () => {
      authStore.user = null
      expect(authStore.userId).toBe('offline-user')
    })

    it('should return userPreferences', () => {
      authStore.user.prefs = { theme: 'dark' }
      expect(authStore.userPreferences).toEqual({ theme: 'dark' })
    })
  })

  describe('initAuth', () => {
    it('should initialize with offline user from localStorage', async () => {
      const mockUser = createMockUser()
      localStorage.setItem('fasttrack-user', JSON.stringify(mockUser))

      await authStore.initAuth()

      expect(authStore.user).toEqual(mockUser)
      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.isLoading).toBe(false)
    })

    it('should handle no stored user', async () => {
      await authStore.initAuth()

      expect(authStore.user).toBe(null)
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.isLoading).toBe(false)
    })
  })

  describe('register', () => {
    it('should register user in offline mode when Appwrite fails', async () => {
      const { authService } = await import('../../src/services/auth.js')
      authService.register.mockRejectedValue(new Error('Appwrite unavailable'))

      const result = await authStore.register('test@example.com', 'password123', 'Test User')

      expect(result.email).toBe('test@example.com')
      expect(result.name).toBe('Test User')
      expect(result.id).toContain('offline-')
      expect(authStore.isAuthenticated).toBe(true)
      expect(localStorage.getItem('fasttrack-user')).toBeTruthy()
      expect(localStorage.getItem('fasttrack-password')).toBe('password123')
    })

    it('should handle registration errors', async () => {
      const { authService } = await import('../../src/services/auth.js')
      authService.register.mockRejectedValue(new Error('Registration failed'))
      authService.login.mockRejectedValue(new Error('Login failed'))

      await expect(authStore.register('invalid@email', 'weak', 'User'))
        .rejects.toThrow('Registration failed')
      
      expect(authStore.error).toBe('Registration failed')
      expect(authStore.isLoading).toBe(false)
    })
  })

  describe('login', () => {
    it('should login with offline credentials when Appwrite fails', async () => {
      const mockUser = createMockUser()
      localStorage.setItem('fasttrack-user', JSON.stringify(mockUser))
      localStorage.setItem('fasttrack-password', 'password123')

      const { authService } = await import('../../src/services/auth.js')
      authService.login.mockRejectedValue(new Error('Appwrite unavailable'))

      const result = await authStore.login('test@example.com', 'password123')

      expect(result).toEqual(mockUser)
      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.user).toEqual(mockUser)
    })

    it('should reject invalid offline credentials', async () => {
      localStorage.setItem('fasttrack-user', JSON.stringify(createMockUser()))
      localStorage.setItem('fasttrack-password', 'correctpassword')

      const { authService } = await import('../../src/services/auth.js')
      authService.login.mockRejectedValue(new Error('Appwrite unavailable'))

      await expect(authStore.login('test@example.com', 'wrongpassword'))
        .rejects.toThrow('Invalid credentials')
      
      expect(authStore.error).toBe('Invalid credentials')
      expect(authStore.isAuthenticated).toBe(false)
    })

    it('should reject login with non-matching email', async () => {
      const mockUser = createMockUser()
      localStorage.setItem('fasttrack-user', JSON.stringify(mockUser))
      localStorage.setItem('fasttrack-password', 'password123')

      const { authService } = await import('../../src/services/auth.js')
      authService.login.mockRejectedValue(new Error('Appwrite unavailable'))

      await expect(authStore.login('wrong@example.com', 'password123'))
        .rejects.toThrow('Invalid credentials')
    })

    it('should handle login when no offline user exists', async () => {
      const { authService } = await import('../../src/services/auth.js')
      authService.login.mockRejectedValue(new Error('Appwrite unavailable'))

      await expect(authStore.login('test@example.com', 'password123'))
        .rejects.toThrow('Invalid credentials')
    })

    it('should login successfully with Appwrite when available', async () => {
      const mockUser = createMockUser()
      const { authService } = await import('../../src/services/auth.js')
      authService.login.mockResolvedValue()
      authService.getCurrentUser.mockResolvedValue(mockUser)

      const result = await authStore.login('test@example.com', 'password123')

      expect(result).toEqual(mockUser)
      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.user).toEqual(mockUser)
    })
  })

  describe('error handling', () => {
    it('should set loading state correctly during async operations', async () => {
      const { authService } = await import('../../src/services/auth.js')
      
      // Create a promise that we can control
      let resolveLogin
      const loginPromise = new Promise(resolve => {
        resolveLogin = resolve
      })
      
      authService.login.mockReturnValue(loginPromise)
      authService.getCurrentUser.mockResolvedValue(createMockUser())

      // Start login
      const loginCall = authStore.login('test@example.com', 'password123')
      
      // Check loading state is true
      expect(authStore.isLoading).toBe(true)
      
      // Resolve the login
      resolveLogin()
      await loginCall
      
      // Check loading state is false
      expect(authStore.isLoading).toBe(false)
    })

    it('should clear errors properly', async () => {
      authStore.error = 'Some error'
      
      // Mock successful login to test error clearing
      const { authService } = await import('../../src/services/auth.js')
      authService.login.mockResolvedValue()
      authService.getCurrentUser.mockResolvedValue(createMockUser())

      await authStore.login('test@example.com', 'password123')

      expect(authStore.error).toBe(null)
    })
  })
}) 