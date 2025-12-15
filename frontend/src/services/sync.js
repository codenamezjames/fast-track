/**
 * Data Synchronization Service
 * Handles bidirectional sync between local IndexedDB and Appwrite Cloud
 */

import { appwriteHelpers, config } from './appwrite.js'
import { db } from './offline.js'

class SyncService {
  constructor() {
    this.isOnline = navigator.onLine
    this.syncInProgress = false
    this.lastSyncTime = this.getLastSyncTime()

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true
      this.syncAll()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  /**
   * Check if sync is available
   */
  async canSync() {
    if (!this.isOnline) return false

    const connectionTest = await appwriteHelpers.testConnection()
    return connectionTest.success && connectionTest.online
  }

  /**
   * Get last sync timestamp
   */
  getLastSyncTime() {
    const lastSync = localStorage.getItem('fasttrack-last-sync')
    return lastSync ? new Date(lastSync) : null
  }

  /**
   * Set last sync timestamp
   */
  setLastSyncTime() {
    const now = new Date().toISOString()
    localStorage.setItem('fasttrack-last-sync', now)
    this.lastSyncTime = new Date(now)
  }

  /**
   * Sync all data types
   */
  async syncAll() {
    if (this.syncInProgress || !(await this.canSync())) {
      return { success: false, reason: 'sync_not_available' }
    }

    try {
      this.syncInProgress = true

      const results = {
        meals: await this.syncMeals(),
        fastingSessions: await this.syncFastingSessions(),
        fastingSchedules: await this.syncFastingSchedules(),
        weightEntries: await this.syncWeightEntries(),
        userPreferences: await this.syncUserPreferences(),
      }

      this.setLastSyncTime()
      this.syncInProgress = false

      return { success: true, results }
    } catch (error) {
      this.syncInProgress = false
      return { success: false, error: error.message }
    }
  }

  /**
   * Sync meals data
   */
  async syncMeals() {
    try {
      // Get current user
      const userResult = await appwriteHelpers.getCurrentUser()
      if (!userResult.success) {
        throw new Error('User not authenticated')
      }

      const userId = userResult.user.$id

      // Get local meals that need syncing
      const localMeals = await db.meals.where('synced').equals(false).toArray()

      // Upload local meals to Appwrite
      for (const meal of localMeals) {
        const mealData = {
          user_id: userId,
          calories: meal.calories,
          meal_time: meal.meal_time,
          notes: meal.notes || '',
          meal_type: meal.meal_type || 'general',
          created_at: meal.created_at || new Date().toISOString(),
          synced: true,
        }

        const result = await appwriteHelpers.createDocument(
          config.collections.meals,
          mealData,
          meal.id,
        )

        if (result.success) {
          // Update local record as synced
          await db.meals.update(meal.id, { synced: true })
        }
      }

      // Download remote meals and merge with local
      const remoteMealsResult = await appwriteHelpers.getUserDocuments(
        config.collections.meals,
        userId,
      )

      if (remoteMealsResult.success) {
        for (const remoteMeal of remoteMealsResult.documents) {
          const localMeal = await db.meals.get(remoteMeal.$id)

          if (!localMeal) {
            // Add new remote meal to local storage
            await db.meals.add({
              id: remoteMeal.$id,
              calories: remoteMeal.calories,
              meal_time: remoteMeal.meal_time,
              notes: remoteMeal.notes,
              meal_type: remoteMeal.meal_type,
              created_at: remoteMeal.created_at,
              synced: true,
            })
          }
        }
      }

      return {
        success: true,
        uploaded: localMeals.length,
        downloaded: remoteMealsResult.documents?.length || 0,
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Sync fasting sessions
   */
  async syncFastingSessions() {
    try {
      const userResult = await appwriteHelpers.getCurrentUser()
      if (!userResult.success) {
        throw new Error('User not authenticated')
      }

      const userId = userResult.user.$id
      const localSessions = await db.fasting_sessions.where('synced').equals(false).toArray()

      // Upload local sessions
      for (const session of localSessions) {
        const sessionData = {
          user_id: userId,
          start_time: session.start_time,
          end_time: session.end_time,
          planned_end_time: session.planned_end_time,
          planned_duration: session.planned_duration,
          actual_duration: session.actual_duration,
          status: session.status,
          session_type: session.session_type || 'regular',
          notes: session.notes || '',
          synced: true,
        }

        const result = await appwriteHelpers.createDocument(
          config.collections.fasting_sessions,
          sessionData,
          session.id,
        )

        if (result.success) {
          await db.fasting_sessions.update(session.id, { synced: true })
        }
      }

      // Download remote sessions
      const remoteSessionsResult = await appwriteHelpers.getUserDocuments(
        config.collections.fasting_sessions,
        userId,
      )

      if (remoteSessionsResult.success) {
        for (const remoteSession of remoteSessionsResult.documents) {
          const localSession = await db.fasting_sessions.get(remoteSession.$id)

          if (!localSession) {
            await db.fasting_sessions.add({
              id: remoteSession.$id,
              start_time: remoteSession.start_time,
              end_time: remoteSession.end_time,
              planned_end_time: remoteSession.planned_end_time,
              planned_duration: remoteSession.planned_duration,
              actual_duration: remoteSession.actual_duration,
              status: remoteSession.status,
              session_type: remoteSession.session_type,
              notes: remoteSession.notes,
              synced: true,
            })
          }
        }
      }

      return {
        success: true,
        uploaded: localSessions.length,
        downloaded: remoteSessionsResult.documents?.length || 0,
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Sync fasting schedules
   */
  async syncFastingSchedules() {
    try {
      const userResult = await appwriteHelpers.getCurrentUser()
      if (!userResult.success) {
        throw new Error('User not authenticated')
      }

      const userId = userResult.user.$id
      const localSchedules = await db.fasting_schedules.where('synced').equals(false).toArray()

      // Upload local schedules
      for (const schedule of localSchedules) {
        const scheduleData = {
          user_id: userId,
          name: schedule.name,
          schedule_data: schedule.schedule_data,
          is_active: schedule.is_active,
          schedule_type: schedule.schedule_type || 'custom',
          created_at: schedule.created_at || new Date().toISOString(),
          synced: true,
        }

        const result = await appwriteHelpers.createDocument(
          config.collections.fasting_schedules,
          scheduleData,
          schedule.id,
        )

        if (result.success) {
          await db.fasting_schedules.update(schedule.id, { synced: true })
        }
      }

      // Download remote schedules
      const remoteSchedulesResult = await appwriteHelpers.getUserDocuments(
        config.collections.fasting_schedules,
        userId,
      )

      if (remoteSchedulesResult.success) {
        for (const remoteSchedule of remoteSchedulesResult.documents) {
          const localSchedule = await db.fasting_schedules.get(remoteSchedule.$id)

          if (!localSchedule) {
            await db.fasting_schedules.add({
              id: remoteSchedule.$id,
              name: remoteSchedule.name,
              schedule_data: remoteSchedule.schedule_data,
              is_active: remoteSchedule.is_active,
              schedule_type: remoteSchedule.schedule_type,
              created_at: remoteSchedule.created_at,
              synced: true,
            })
          }
        }
      }

      return {
        success: true,
        uploaded: localSchedules.length,
        downloaded: remoteSchedulesResult.documents?.length || 0,
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Sync weight entries
   */
  async syncWeightEntries() {
    try {
      const userResult = await appwriteHelpers.getCurrentUser()
      if (!userResult.success) {
        throw new Error('User not authenticated')
      }

      const userId = userResult.user.$id
      const localEntries = await db.weight_entries.where('synced').equals(false).toArray()

      // Upload local entries
      for (const entry of localEntries) {
        const entryData = {
          user_id: userId,
          weight: entry.weight,
          unit: entry.unit || 'kg',
          date: entry.date,
          notes: entry.notes || '',
          synced: true,
        }

        const result = await appwriteHelpers.createDocument(
          config.collections.weight_entries,
          entryData,
          entry.id,
        )

        if (result.success) {
          await db.weight_entries.update(entry.id, { synced: true })
        }
      }

      // Download remote entries
      const remoteEntriesResult = await appwriteHelpers.getUserDocuments(
        config.collections.weight_entries,
        userId,
      )

      if (remoteEntriesResult.success) {
        for (const remoteEntry of remoteEntriesResult.documents) {
          const localEntry = await db.weight_entries.get(remoteEntry.$id)

          if (!localEntry) {
            await db.weight_entries.add({
              id: remoteEntry.$id,
              weight: remoteEntry.weight,
              unit: remoteEntry.unit,
              date: remoteEntry.date,
              notes: remoteEntry.notes,
              synced: true,
            })
          }
        }
      }

      return {
        success: true,
        uploaded: localEntries.length,
        downloaded: remoteEntriesResult.documents?.length || 0,
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Sync user preferences
   */
  async syncUserPreferences() {
    try {
      const userResult = await appwriteHelpers.getCurrentUser()
      if (!userResult.success) {
        throw new Error('User not authenticated')
      }

      const userId = userResult.user.$id

      // Get local preferences
      const localPrefs = JSON.parse(localStorage.getItem('fasttrack-preferences') || '{}')

      if (Object.keys(localPrefs).length > 0) {
        const prefsData = {
          user_id: userId,
          notifications: localPrefs.notifications || {},
          display_settings: localPrefs.display || {},
          goals: localPrefs.goals || {},
          timezone: localPrefs.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          weight_unit: localPrefs.weightUnit || 'kg',
          theme: localPrefs.theme || 'auto',
        }

        await appwriteHelpers.createDocument(config.collections.user_preferences, prefsData, userId)
      }

      // Download remote preferences
      const remotePrefsResult = await appwriteHelpers.getDocument(
        config.collections.user_preferences,
        userId,
      )

      if (remotePrefsResult.success) {
        const remotePrefs = remotePrefsResult.document
        const mergedPrefs = {
          ...localPrefs,
          notifications: remotePrefs.notifications || localPrefs.notifications,
          display: remotePrefs.display_settings || localPrefs.display,
          goals: remotePrefs.goals || localPrefs.goals,
          timezone: remotePrefs.timezone || localPrefs.timezone,
          weightUnit: remotePrefs.weight_unit || localPrefs.weightUnit,
          theme: remotePrefs.theme || localPrefs.theme,
        }

        localStorage.setItem('fasttrack-preferences', JSON.stringify(mergedPrefs))
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
      lastSyncTime: this.lastSyncTime,
      canSync: this.canSync(),
    }
  }
}

// Create singleton instance
export const syncService = new SyncService()

// Export sync functions for manual usage
export const sync = {
  all: () => syncService.syncAll(),
  meals: () => syncService.syncMeals(),
  fasting: () => syncService.syncFastingSessions(),
  schedules: () => syncService.syncFastingSchedules(),
  weight: () => syncService.syncWeightEntries(),
  preferences: () => syncService.syncUserPreferences(),
  status: () => syncService.getSyncStatus(),
}
