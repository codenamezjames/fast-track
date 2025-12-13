import { account } from './appwrite.js'
import { ID } from 'appwrite'

export const authService = {
  // Register new user
  async register(email, password, name) {
    const user = await account.create(ID.unique(), email, password, name)
    return user
  },

  // Login user
  async login(email, password) {
    const session = await account.createEmailPasswordSession(email, password)
    return session
  },

  // Logout user
  async logout() {
    await account.deleteSession('current')
  },

  // Get current user
  async getCurrentUser() {
    try {
      const user = await account.get()
      return user
    } catch {
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
    return await account.updatePrefs(preferences)
  },
}
