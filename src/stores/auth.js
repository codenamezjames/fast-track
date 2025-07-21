import { defineStore } from 'pinia'
import { authService } from '../services/auth.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  }),

  getters: {
    userId: (state) => state.user?.$id || state.user?.id || 'offline-user',
    userEmail: (state) => state.user?.email,
    userName: (state) => state.user?.name,
    userPreferences: (state) => state.user?.prefs || {}
  },

  actions: {
    async initAuth() {
      this.isLoading = true
      try {
        // Check localStorage for offline auth
        const offlineUser = localStorage.getItem('fasttrack-user')
        if (offlineUser) {
          this.user = JSON.parse(offlineUser)
          this.isAuthenticated = true
          return
        }

        // Try Appwrite auth if available (skip for now in offline mode)
        // const user = await authService.getCurrentUser()
        // if (user) {
        //   this.user = user
        //   this.isAuthenticated = true
        // }
      } catch {
        console.log('Using offline mode - Appwrite not connected')
        this.isAuthenticated = false
      } finally {
        this.isLoading = false
      }
    },

    async register(email, password, name) {
      this.isLoading = true
      this.error = null
      try {
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
            $createdAt: new Date().toISOString()
          }
          
          // Store in localStorage
          localStorage.setItem('fasttrack-user', JSON.stringify(mockUser))
          localStorage.setItem('fasttrack-password', password) // In real app, this would be hashed
          
          this.user = mockUser
          this.isAuthenticated = true
          return mockUser
        }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async login(email, password) {
      this.isLoading = true
      this.error = null
      try {
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
          const storedUser = localStorage.getItem('fasttrack-user')
          const storedPassword = localStorage.getItem('fasttrack-password')
          
          if (storedUser && storedPassword === password) {
            const user = JSON.parse(storedUser)
            if (user.email === email) {
              this.user = user
              this.isAuthenticated = true
              return user
            }
          }
          
          throw new Error('Invalid credentials')
        }
      } catch (error) {
        this.error = error.message || 'Invalid credentials'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      this.isLoading = true
      try {
        // Clear offline state (skip Appwrite for now)
        console.log('Offline logout')
        this.user = null
        this.isAuthenticated = false
        this.error = null
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.isLoading = false
      }
    },

    async updatePreferences(preferences) {
      try {
        const updatedUser = await authService.updatePreferences(preferences)
        this.user = updatedUser
        return updatedUser
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    clearError() {
      this.error = null
    }
  }
}) 