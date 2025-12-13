/**
 * Store Manager
 * Manages cross-store operations, dependencies, and initialization
 */

import { useAuthStore } from './auth.js'
import { useCaloriesStore } from './calories.js'
import { useFastingStore } from './fasting.js'
import { useWeightStore } from './weight.js'
import { useNotificationsStore } from './notifications.js'
import { useThemeStore } from './theme.js'

class StoreManager {
  constructor() {
    this.stores = new Map()
    this.initialized = false
    this.initializationPromise = null
  }

  /**
   * Get a store instance
   * @param {string} storeName - Name of the store
   * @returns {Object} Store instance
   */
  getStore(storeName) {
    if (!this.stores.has(storeName)) {
      const storeMap = {
        auth: useAuthStore,
        calories: useCaloriesStore,
        fasting: useFastingStore,
        weight: useWeightStore,
        notifications: useNotificationsStore,
        theme: useThemeStore,
      }

      if (storeMap[storeName]) {
        this.stores.set(storeName, storeMap[storeName]())
      } else {
        throw new Error(`Unknown store: ${storeName}`)
      }
    }

    return this.stores.get(storeName)
  }

  /**
   * Initialize all stores
   * @returns {Promise} Initialization promise
   */
  async initializeStores() {
    if (this.initialized) {
      return Promise.resolve()
    }

    if (this.initializationPromise) {
      return this.initializationPromise
    }

    this.initializationPromise = this._performInitialization()
    return this.initializationPromise
  }

  /**
   * Perform the actual initialization
   * @returns {Promise}
   */
  async _performInitialization() {
    // Initialize stores in dependency order
    const authStore = this.getStore('auth')
    await authStore.initAuth()

    const themeStore = this.getStore('theme')
    await themeStore.init()

    const notificationsStore = this.getStore('notifications')
    await notificationsStore.init()

    const caloriesStore = this.getStore('calories')
    await caloriesStore.loadData()

    const fastingStore = this.getStore('fasting')
    await fastingStore.loadFastingData()

    const weightStore = this.getStore('weight')
    await weightStore.loadData()

    // Set up cross-store dependencies
    this._setupCrossStoreDependencies()

    this.initialized = true
  }

  /**
   * Set up cross-store dependencies and watchers
   */
  _setupCrossStoreDependencies() {
    const authStore = this.getStore('auth')
    const notificationsStore = this.getStore('notifications')
    const caloriesStore = this.getStore('calories')
    const fastingStore = this.getStore('fasting')

    // Watch for authentication changes
    authStore.$subscribe((mutation, state) => {
      if (mutation.type === 'direct' && mutation.events?.isAuthenticated) {
        this._handleAuthStateChange(state.isAuthenticated)
      }
    })

    // Watch for notification preference changes
    notificationsStore.$subscribe((mutation, state) => {
      if (mutation.type === 'direct' && mutation.events?.preferences) {
        this._handleNotificationPreferencesChange(state.preferences)
      }
    })

    // Watch for meal additions to trigger notifications
    caloriesStore.$subscribe((mutation, state) => {
      if (mutation.type === 'direct' && mutation.events?.data) {
        this._handleMealDataChange(state.data)
      }
    })

    // Watch for fasting session changes
    fastingStore.$subscribe((mutation, state) => {
      if (mutation.type === 'direct' && mutation.events?.sessions) {
        this._handleFastingDataChange(state.sessions)
      }
    })
  }

  /**
   * Handle authentication state changes
   * @param {boolean} isAuthenticated - New authentication state
   */
  async _handleAuthStateChange(isAuthenticated) {
    if (isAuthenticated) {
      // User logged in - sync data
      await this.syncAllStores()
    } else {
      // User logged out - clear sensitive data
      await this.clearUserData()
    }
  }

  /**
   * Handle notification preference changes
   * @param {Object} preferences - New notification preferences
   */
  async _handleNotificationPreferencesChange(preferences) {
    const fastingStore = this.getStore('fasting')
    const caloriesStore = this.getStore('calories')

    // Reschedule notifications based on new preferences
    if (preferences.fasting?.enabled) {
      await fastingStore.rescheduleNotifications()
    }

    if (preferences.meals?.enabled) {
      await caloriesStore.scheduleMealReminders()
    }
  }

  /**
   * Handle meal data changes
   * @param {Array} meals - Updated meals data
   */
  async _handleMealDataChange() {
    const notificationsStore = this.getStore('notifications')

    // Update meal reminders if enabled
    if (notificationsStore.isMealNotificationsEnabled) {
      await notificationsStore.scheduleMealReminders()
    }
  }

  /**
   * Handle fasting data changes
   * @param {Array} sessions - Updated fasting sessions
   */
  async _handleFastingDataChange() {
    const notificationsStore = this.getStore('notifications')

    // Update fasting notifications if enabled
    if (notificationsStore.isFastingNotificationsEnabled) {
      await notificationsStore.rescheduleNotifications()
    }
  }

  /**
   * Sync all stores with backend
   * @returns {Promise}
   */
  async syncAllStores() {
    const stores = ['calories', 'fasting', 'weight']

    for (const storeName of stores) {
      const store = this.getStore(storeName)
      if (store.syncData) {
        try {
          await store.syncData()
        } catch {
          // Failed to sync store
        }
      }
    }
  }

  /**
   * Clear all user data
   * @returns {Promise}
   */
  async clearUserData() {
    const stores = ['calories', 'fasting', 'weight', 'notifications']

    for (const storeName of stores) {
      const store = this.getStore(storeName)
      if (store.clearAllData) {
        try {
          await store.clearAllData()
        } catch {
          // Failed to clear store
        }
      }
    }
  }

  /**
   * Export all data for backup
   * @returns {Promise<Object>} All user data
   */
  async exportAllData() {
    const authStore = this.getStore('auth')
    const caloriesStore = this.getStore('calories')
    const fastingStore = this.getStore('fasting')
    const weightStore = this.getStore('weight')
    const notificationsStore = this.getStore('notifications')
    const themeStore = this.getStore('theme')

    return {
      exportDate: new Date().toISOString(),
      user: authStore.user,
      meals: caloriesStore.data,
      fastingSessions: fastingStore.sessions,
      weightEntries: weightStore.data,
      notificationPreferences: notificationsStore.preferences,
      themePreferences: themeStore.preferences,
      version: '1.0.0',
    }
  }

  /**
   * Import all data from backup
   * @param {Object} importData - Data to import
   * @returns {Promise<Object>} Import results
   */
  async importAllData(importData) {
    const results = {}

    // Import meals
    if (importData.meals) {
      const caloriesStore = this.getStore('calories')
      results.meals = await caloriesStore.importData({ meals: importData.meals })
    }

    // Import fasting sessions
    if (importData.fastingSessions) {
      const fastingStore = this.getStore('fasting')
      results.fasting = await fastingStore.importData({ sessions: importData.fastingSessions })
    }

    // Import weight entries
    if (importData.weightEntries) {
      const weightStore = this.getStore('weight')
      results.weight = await weightStore.importData({ entries: importData.weightEntries })
    }

    // Import notification preferences
    if (importData.notificationPreferences) {
      const notificationsStore = this.getStore('notifications')
      await notificationsStore.updatePreferences(importData.notificationPreferences)
      results.notifications = { imported: true }
    }

    // Import theme preferences
    if (importData.themePreferences) {
      const themeStore = this.getStore('theme')
      await themeStore.updatePreferences(importData.themePreferences)
      results.theme = { imported: true }
    }

    return results
  }

  /**
   * Get store status for debugging
   * @returns {Object} Status of all stores
   */
  getStoreStatus() {
    const status = {}

    for (const [storeName, store] of this.stores) {
      status[storeName] = {
        isLoading: store.isLoading,
        hasError: store.hasError,
        error: store.error,
        dataCount: store.data?.length || 0,
        lastSync: store.lastSync,
      }
    }

    return status
  }

  /**
   * Reset all stores (for testing)
   * @returns {Promise}
   */
  async resetAllStores() {
    for (const [, store] of this.stores) {
      if (store.clearAllData) {
        await store.clearAllData()
      }
    }

    this.initialized = false
    this.initializationPromise = null
  }
}

// Create singleton instance
const storeManager = new StoreManager()

export default storeManager
