import { Client, Account, Databases, ID, Query } from 'appwrite'

// Configuration from environment or defaults
const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || 'fasttrack-health'

const client = new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID)

export const account = new Account(client)
export const databases = new Databases(client)

// Database and collection configuration
export const config = {
  databaseId: 'fasttrack-db',
  collections: {
    users: 'users',
    meals: 'meals',
    fasting_sessions: 'fasting_sessions',
    fasting_schedules: 'fasting_schedules',
    weight_entries: 'weight_entries',
    user_preferences: 'user_preferences',
  },
}

// Helper functions for common operations
export const appwriteHelpers = {
  // Test connection to Appwrite
  async testConnection() {
    try {
      await account.get()
      return { success: true, online: true }
    } catch (error) {
      if (error.code === 401) {
        // User not authenticated but service is online
        return { success: true, online: true, authenticated: false }
      }
      return { success: false, online: false, error: error.message }
    }
  },

  // Create user session
  async createSession(email, password) {
    try {
      const session = await account.createEmailPasswordSession(email, password)
      return { success: true, session }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Register new user
  async createUser(email, password, name) {
    try {
      const user = await account.create(ID.unique(), email, password, name)

      // Automatically create session after registration
      const sessionResult = await this.createSession(email, password)
      return {
        success: true,
        user,
        session: sessionResult.session,
        autoLogin: sessionResult.success,
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const user = await account.get()
      return { success: true, user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Logout user
  async logout() {
    try {
      await account.deleteSession('current')
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Generic document operations
  async createDocument(collectionId, data, documentId = ID.unique()) {
    try {
      const document = await databases.createDocument(
        config.databaseId,
        collectionId,
        documentId,
        data,
      )
      return { success: true, document }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async updateDocument(collectionId, documentId, data) {
    try {
      const document = await databases.updateDocument(
        config.databaseId,
        collectionId,
        documentId,
        data,
      )
      return { success: true, document }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async deleteDocument(collectionId, documentId) {
    try {
      await databases.deleteDocument(config.databaseId, collectionId, documentId)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async getDocument(collectionId, documentId) {
    try {
      const document = await databases.getDocument(config.databaseId, collectionId, documentId)
      return { success: true, document }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async listDocuments(collectionId, queries = []) {
    try {
      const documents = await databases.listDocuments(config.databaseId, collectionId, queries)
      return { success: true, documents: documents.documents, total: documents.total }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // User-specific document queries
  async getUserDocuments(collectionId, userId, queries = []) {
    const userQueries = [Query.equal('user_id', userId), ...queries]
    return this.listDocuments(collectionId, userQueries)
  },
}

export { client, ID, Query }
