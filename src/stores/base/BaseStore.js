/**
 * Base Store Pattern
 * Provides common functionality for all stores including:
 * - Loading states
 * - Error handling
 * - Offline/online sync
 * - Data persistence
 * - Standardized actions
 *
 * @module BaseStore
 * @example
 * ```javascript
 * import { createBaseStore } from './base/BaseStore.js'
 *
 * export const useMyStore = createBaseStore('myStore', {
 *   // Initial state
 *   data: []
 * }, {
 *   // Custom getters
 *   getDataCount: (state) => state.data.length
 * }, {
 *   // Custom actions
 *   async loadData() {
 *     // Custom implementation
 *   }
 * })
 * ```
 */

import { defineStore } from 'pinia'
// import { useErrorHandling } from '../../composables/useErrorHandling.js'

/**
 * Creates a base store with common functionality
 *
 * @function createBaseStore
 * @memberof module:BaseStore
 * @param {string} storeName - The name of the store
 * @param {Object} [initialState={}] - Initial state object
 * @param {Object} [getters={}] - Store getters
 * @param {Object} [actions={}] - Store actions
 * @returns {Object} Pinia store definition with common functionality
 *
 * @description
 * Creates a Pinia store with standardized functionality including:
 * - Loading states management
 * - Error handling with standardized patterns
 * - Offline/online status tracking
 * - Data persistence helpers
 * - Sync capabilities
 *
 * @example
 * ```javascript
 * const useUserStore = createBaseStore('user', {
 *   user: null,
 *   preferences: {}
 * }, {
 *   isLoggedIn: (state) => !!state.user
 * }, {
 *   async login(credentials) {
 *     return this.executeWithErrorHandling(async () => {
 *       // Login implementation
 *     })
 *   }
 * })
 * ```
 */
export function createBaseStore(storeName, initialState = {}, getters = {}, actions = {}) {
  return defineStore(storeName, {
    state: () => ({
      // Common state properties
      isLoading: false,
      error: null,
      lastSync: null,
      isOnline: true,
      ...initialState,
    }),

    getters: {
      // Common getters
      hasError: (state) => !!state.error,
      isOffline: (state) => !state.isOnline,
      needsSync: (state) => {
        return state.lastSync && Date.now() - new Date(state.lastSync).getTime() > 5 * 60 * 1000 // 5 minutes
      },
      ...getters,
    },

    actions: {
      // Common actions
      setLoading(loading = true) {
        this.isLoading = loading
      },

      setError(error) {
        this.error = error
        console.error(`[${storeName}] Error:`, error)
      },

      clearError() {
        this.error = null
      },

      setOnlineStatus(isOnline) {
        this.isOnline = isOnline
      },

      updateLastSync() {
        this.lastSync = new Date().toISOString()
      },

      // Standardized async action wrapper
      async executeWithErrorHandling(action, errorMessage = 'Operation failed') {
        this.setLoading(true)
        this.clearError()

        try {
          const result = await action()
          this.updateLastSync()
          return result
        } catch (error) {
          this.setError(error.message || errorMessage)
          throw error
        } finally {
          this.setLoading(false)
        }
      },

      // Data persistence helpers
      async saveToStorage(key, data) {
        try {
          localStorage.setItem(`fasttrack-${key}`, JSON.stringify(data))
        } catch (error) {
          console.error(`Failed to save ${key} to storage:`, error)
        }
      },

      async loadFromStorage(key, defaultValue = null) {
        try {
          const stored = localStorage.getItem(`fasttrack-${key}`)
          return stored ? JSON.parse(stored) : defaultValue
        } catch (error) {
          console.error(`Failed to load ${key} from storage:`, error)
          return defaultValue
        }
      },

      // Sync helpers
      async syncData() {
        if (!this.isOnline) {
          console.log(`[${storeName}] Skipping sync - offline mode`)
          return
        }

        try {
          // Override in child stores
          console.log(`[${storeName}] Sync not implemented`)
        } catch (error) {
          this.setError(`Sync failed: ${error.message}`)
        }
      },

      // Clear all data
      async clearAllData() {
        this.setLoading(true)
        try {
          // Override in child stores
          console.log(`[${storeName}] Clear data not implemented`)
        } catch (error) {
          this.setError(`Failed to clear data: ${error.message}`)
        } finally {
          this.setLoading(false)
        }
      },

      // Initialize store
      async init() {
        this.setLoading(true)
        try {
          // Load from storage
          await this.loadFromStorage()

          // Perform initial sync if online
          if (this.isOnline) {
            await this.syncData()
          }
        } catch (error) {
          this.setError(`Initialization failed: ${error.message}`)
        } finally {
          this.setLoading(false)
        }
      },

      ...actions,
    },
  })
}

/**
 * Creates a data store with common CRUD operations
 * @param {string} storeName - The name of the store
 * @param {Object} config - Configuration object
 * @returns {Object} Pinia store definition
 */
export function createDataStore(storeName, config = {}) {
  const {
    initialState = {},
    getters = {},
    actions = {},
    storageKey,
    syncService,
    // offlineService,
  } = config

  return createBaseStore(
    storeName,
    {
      data: [],
      ...initialState,
    },
    {
      // Common data getters
      count: (state) => state.data.length,
      isEmpty: (state) => state.data.length === 0,
      hasData: (state) => state.data.length > 0,

      // Get by ID
      getById: (state) => (id) => state.data.find((item) => item.id === id || item.$id === id),

      // Get by date range
      getByDateRange: (state) => (startDate, endDate) => {
        return state.data.filter((item) => {
          const itemDate = new Date(item.created_at || item.date || item.meal_time)
          return itemDate >= startDate && itemDate <= endDate
        })
      },

      // Get recent items
      getRecent:
        (state) =>
        (limit = 10) => {
          return state.data
            .sort(
              (a, b) =>
                new Date(b.created_at || b.date || b.meal_time) -
                new Date(a.created_at || a.date || a.meal_time),
            )
            .slice(0, limit)
        },

      ...getters,
    },
    {
      // Common CRUD actions
      async loadData() {
        return this.executeWithErrorHandling(async () => {
          if (storageKey) {
            const stored = await this.loadFromStorage(storageKey, [])
            this.data = stored
          }

          if (this.isOnline && syncService) {
            const synced = await syncService.load()
            this.data = synced
            await this.saveToStorage(storageKey, synced)
          }
        }, 'Failed to load data')
      },

      async addItem(item) {
        return this.executeWithErrorHandling(async () => {
          const newItem = {
            ...item,
            id: item.id || `local-${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          this.data.push(newItem)
          await this.saveToStorage(storageKey, this.data)

          if (this.isOnline && syncService) {
            await syncService.create(newItem)
          }

          return newItem
        }, 'Failed to add item')
      },

      async updateItem(id, updates) {
        return this.executeWithErrorHandling(async () => {
          const index = this.data.findIndex((item) => item.id === id || item.$id === id)
          if (index === -1) {
            throw new Error('Item not found')
          }

          this.data[index] = {
            ...this.data[index],
            ...updates,
            updated_at: new Date().toISOString(),
          }

          await this.saveToStorage(storageKey, this.data)

          if (this.isOnline && syncService) {
            await syncService.update(id, this.data[index])
          }

          return this.data[index]
        }, 'Failed to update item')
      },

      async deleteItem(id) {
        return this.executeWithErrorHandling(async () => {
          const index = this.data.findIndex((item) => item.id === id || item.$id === id)
          if (index === -1) {
            throw new Error('Item not found')
          }

          const deletedItem = this.data.splice(index, 1)[0]
          await this.saveToStorage(storageKey, this.data)

          if (this.isOnline && syncService) {
            await syncService.delete(id)
          }

          return deletedItem
        }, 'Failed to delete item')
      },

      async clearAllData() {
        return this.executeWithErrorHandling(async () => {
          this.data = []
          await this.saveToStorage(storageKey, [])

          if (this.isOnline && syncService) {
            await syncService.clearAll()
          }
        }, 'Failed to clear data')
      },

      async syncData() {
        if (!this.isOnline || !syncService) return

        return this.executeWithErrorHandling(async () => {
          const synced = await syncService.sync(this.data)
          this.data = synced
          await this.saveToStorage(storageKey, synced)
        }, 'Failed to sync data')
      },

      ...actions,
    },
  )
}

/**
 * Creates a settings store with preferences management
 * @param {string} storeName - The name of the store
 * @param {Object} config - Configuration object
 * @returns {Object} Pinia store definition
 */
export function createSettingsStore(storeName, config = {}) {
  const { initialState = {}, getters = {}, actions = {}, storageKey = 'settings' } = config

  return createBaseStore(
    storeName,
    {
      preferences: {},
      ...initialState,
    },
    {
      // Common settings getters
      hasPreferences: (state) => Object.keys(state.preferences).length > 0,

      getPreference:
        (state) =>
        (key, defaultValue = null) => {
          return state.preferences[key] ?? defaultValue
        },

      ...getters,
    },
    {
      // Common settings actions
      async loadPreferences() {
        return this.executeWithErrorHandling(async () => {
          const stored = await this.loadFromStorage(storageKey, {})
          this.preferences = { ...this.preferences, ...stored }
        }, 'Failed to load preferences')
      },

      async savePreferences() {
        return this.executeWithErrorHandling(async () => {
          await this.saveToStorage(storageKey, this.preferences)
        }, 'Failed to save preferences')
      },

      async updatePreferences(newPreferences) {
        return this.executeWithErrorHandling(async () => {
          this.preferences = { ...this.preferences, ...newPreferences }
          await this.savePreferences()
        }, 'Failed to update preferences')
      },

      async resetPreferences() {
        return this.executeWithErrorHandling(async () => {
          this.preferences = {}
          await this.savePreferences()
        }, 'Failed to reset preferences')
      },

      ...actions,
    },
  )
}
