import { account } from './appwrite.js'
import { ID } from 'appwrite'

export const authService = {
  // Register new user
  async register(email, password, name) {
    try {
      const user = await account.create(ID.unique(), email, password, name)
      console.log('User registered:', user)
      return user
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  },

  // Login user
  async login(email, password) {
    try {
      const session = await account.createEmailPasswordSession(email, password)
      console.log('User logged in:', session)
      return session
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  },

  // Logout user
  async logout() {
    try {
      await account.deleteSession('current')
      console.log('User logged out')
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const user = await account.get()
      return user
    } catch (error) {
      console.error('Get user error:', error)
      return null
    }
  },

  // Check if user is logged in
  async isLoggedIn() {
    try {
      await account.get()
      return true
    } catch {
      return false
    }
  },

  // Update user preferences
  async updatePreferences(preferences) {
    try {
      return await account.updatePrefs(preferences)
    } catch (error) {
      console.error('Update preferences error:', error)
      throw error
    }
  },
}
