import { createBaseStore } from './base/BaseStore.js'
import { authService } from '../services/auth.js'

export const useAuthStore = createBaseStore(
  'auth',
  {
    user: null,
    isAuthenticated: false,
  },
  {
    // User getters
    userId: (state) => state.user?.$id || state.user?.id || 'offline-user',
    userEmail: (state) => state.user?.email,
    userName: (state) => state.user?.name,
    userPreferences: (state) => state.user?.prefs || {},

    // Authentication status
    isOnline: (state) => state.user?.$id?.startsWith('offline') === false,
    isOfflineUser: (state) => state.user?.$id?.startsWith('offline') === true,
  },
  {
    // Initialize authentication
    async initAuth() {
      return this.executeWithErrorHandling(async () => {
        // Check localStorage for offline auth
        const offlineUser = await this.loadFromStorage('user')
        if (offlineUser) {
          this.user = offlineUser
          this.isAuthenticated = true
          return
        }

        // Try Appwrite auth if available
        try {
          const user = await authService.getCurrentUser()
          if (user) {
            this.user = user
            this.isAuthenticated = true
          }
        } catch {
          console.log('Using offline mode - Appwrite not connected')
          this.isAuthenticated = false
        }
      }, 'Authentication initialization failed')
    },

    // Register new user
    async register(email, password, name) {
      return this.executeWithErrorHandling(async () => {
        // Try Appwrite first
        try {
          await authService.register(email, password, name)
          return await this.login(email, password)
        } catch {
          // Fall back to offline mode
          console.log('Appwrite unavailable, using offline mode')
          const mockUser = {
            id: 'offline-' + Date.now(),
            email,
            name,
            $createdAt: new Date().toISOString(),
          }

          // Store in localStorage
          await this.saveToStorage('user', mockUser)
          await this.saveToStorage('password', password) // In real app, this would be hashed

          this.user = mockUser
          this.isAuthenticated = true
          return mockUser
        }
      }, 'Registration failed')
    },

    // Login user
    async login(email, password) {
      return this.executeWithErrorHandling(async () => {
        // Try Appwrite first
        try {
          await authService.login(email, password)
          const user = await authService.getCurrentUser()
          this.user = user
          this.isAuthenticated = true
          return user
        } catch {
          // Fall back to offline mode
          console.log('Appwrite unavailable, checking offline credentials')
          const storedUser = await this.loadFromStorage('user')
          const storedPassword = await this.loadFromStorage('password')

          if (storedUser && storedPassword === password) {
            if (storedUser.email === email) {
              this.user = storedUser
              this.isAuthenticated = true
              return storedUser
            }
          }

          throw new Error('Invalid credentials')
        }
      }, 'Login failed')
    },

    // Logout user
    async logout() {
      return this.executeWithErrorHandling(async () => {
        // Clear Appwrite session if online
        if (this.isOnline) {
          try {
            await authService.logout()
          } catch {
            console.log('Appwrite logout failed, continuing with local logout')
          }
        }

        // Clear local storage
        await this.saveToStorage('user', null)
        await this.saveToStorage('password', null)

        // Reset state
        this.user = null
        this.isAuthenticated = false
      }, 'Logout failed')
    },

    // Update user preferences
    async updatePreferences(preferences) {
      return this.executeWithErrorHandling(async () => {
        if (!this.user) {
          throw new Error('No user logged in')
        }

        this.user.prefs = { ...this.user.prefs, ...preferences }

        // Save to storage
        await this.saveToStorage('user', this.user)

        // Sync to Appwrite if online
        if (this.isOnline) {
          try {
            await authService.updateUser(this.user)
          } catch {
            console.log('Failed to sync preferences to Appwrite')
          }
        }
      }, 'Failed to update preferences')
    },

    // Check if user exists
    async checkUserExists(email) {
      return this.executeWithErrorHandling(async () => {
        // Try Appwrite first
        try {
          return await authService.checkUserExists(email)
        } catch {
          // Check local storage for offline users
          const storedUser = await this.loadFromStorage('user')
          return storedUser && storedUser.email === email
        }
      }, 'Failed to check user existence')
    },

    // Reset password
    async resetPassword(email) {
      return this.executeWithErrorHandling(async () => {
        if (this.isOnline) {
          return await authService.resetPassword(email)
        } else {
          throw new Error('Password reset not available in offline mode')
        }
      }, 'Password reset failed')
    },

    // Get user profile
    async getUserProfile() {
      return this.executeWithErrorHandling(async () => {
        if (!this.user) {
          throw new Error('No user logged in')
        }

        if (this.isOnline) {
          return await authService.getUserProfile()
        } else {
          return {
            id: this.user.id,
            email: this.user.email,
            name: this.user.name,
            createdAt: this.user.$createdAt,
            prefs: this.user.prefs || {},
          }
        }
      }, 'Failed to get user profile')
    },

    // Update user profile
    async updateUserProfile(updates) {
      return this.executeWithErrorHandling(async () => {
        if (!this.user) {
          throw new Error('No user logged in')
        }

        this.user = { ...this.user, ...updates }
        await this.saveToStorage('user', this.user)

        if (this.isOnline) {
          return await authService.updateUserProfile(updates)
        }
      }, 'Failed to update user profile')
    },
  },
)
