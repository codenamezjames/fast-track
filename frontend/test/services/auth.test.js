import { describe, it, expect, beforeEach, vi } from 'vitest'
import { authService } from '../../src/services/auth.js'

// Mock Appwrite
vi.mock('../../src/services/appwrite.js', () => ({
  account: {
    create: vi.fn(),
    createEmailPasswordSession: vi.fn(),
    deleteSession: vi.fn(),
    get: vi.fn(),
    updatePrefs: vi.fn(),
  },
}))

// Mock Appwrite ID
vi.mock('appwrite', () => ({
  ID: {
    unique: vi.fn(() => 'mock-unique-id'),
  },
}))

describe('Auth Service', () => {
  let mockAccount

  beforeEach(async () => {
    vi.clearAllMocks()
    const { account } = await import('../../src/services/appwrite.js')
    mockAccount = account
  })

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        $id: 'mock-unique-id',
        email: 'test@example.com',
        name: 'Test User',
      }

      mockAccount.create.mockResolvedValue(mockUser)

      const result = await authService.register('test@example.com', 'password123', 'Test User')

      expect(mockAccount.create).toHaveBeenCalledWith(
        'mock-unique-id',
        'test@example.com',
        'password123',
        'Test User',
      )
      expect(result).toEqual(mockUser)
    })

    it('should handle registration errors', async () => {
      const error = new Error('Email already exists')
      mockAccount.create.mockRejectedValue(error)

      await expect(
        authService.register('test@example.com', 'password123', 'Test User'),
      ).rejects.toThrow('Email already exists')
    })
  })

  describe('login', () => {
    it('should login user successfully', async () => {
      const mockSession = {
        $id: 'session-id',
        userId: 'user-id',
      }

      mockAccount.createEmailPasswordSession.mockResolvedValue(mockSession)

      const result = await authService.login('test@example.com', 'password123')

      expect(mockAccount.createEmailPasswordSession).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
      )
      expect(result).toEqual(mockSession)
    })

    it('should handle login errors', async () => {
      const error = new Error('Invalid credentials')
      mockAccount.createEmailPasswordSession.mockRejectedValue(error)

      await expect(authService.login('test@example.com', 'wrongpassword')).rejects.toThrow(
        'Invalid credentials',
      )
    })
  })

  describe('logout', () => {
    it('should logout user successfully', async () => {
      mockAccount.deleteSession.mockResolvedValue()

      await authService.logout()

      expect(mockAccount.deleteSession).toHaveBeenCalledWith('current')
    })

    it('should handle logout errors', async () => {
      const error = new Error('Logout failed')
      mockAccount.deleteSession.mockRejectedValue(error)

      await expect(authService.logout()).rejects.toThrow('Logout failed')
    })
  })

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      const mockUser = {
        $id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
      }

      mockAccount.get.mockResolvedValue(mockUser)

      const result = await authService.getCurrentUser()

      expect(mockAccount.get).toHaveBeenCalled()
      expect(result).toEqual(mockUser)
    })

    it('should return null on error', async () => {
      const error = new Error('No session')
      mockAccount.get.mockRejectedValue(error)

      const result = await authService.getCurrentUser()

      expect(result).toBe(null)
    })
  })

  describe('isLoggedIn', () => {
    it('should return true when user is logged in', async () => {
      mockAccount.get.mockResolvedValue({ $id: 'user-id' })

      const result = await authService.isLoggedIn()

      expect(result).toBe(true)
    })

    it('should return false when user is not logged in', async () => {
      mockAccount.get.mockRejectedValue(new Error('No session'))

      const result = await authService.isLoggedIn()

      expect(result).toBe(false)
    })
  })

  describe('updatePreferences', () => {
    it('should update user preferences successfully', async () => {
      const preferences = { theme: 'dark', notifications: true }
      const mockResult = { success: true }

      mockAccount.updatePrefs.mockResolvedValue(mockResult)

      const result = await authService.updatePreferences(preferences)

      expect(mockAccount.updatePrefs).toHaveBeenCalledWith(preferences)
      expect(result).toEqual(mockResult)
    })

    it('should handle update preferences errors', async () => {
      const error = new Error('Update failed')
      mockAccount.updatePrefs.mockRejectedValue(error)

      await expect(authService.updatePreferences({ theme: 'dark' })).rejects.toThrow(
        'Update failed',
      )
    })
  })
})
