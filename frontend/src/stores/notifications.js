import { defineStore } from 'pinia'
import { notificationService } from '../services/notifications.js'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    // Permission status
    permission: 'default', // 'default', 'granted', 'denied'
    isSupported: false,

    // User preferences
    preferences: {
      enabled: false,
      fasting: {
        enabled: true,
        startReminder: true, // Remind before fast starts
        progressUpdates: true, // Progress notifications during fast
        endReminder: true, // Remind when fast ends
        customReminders: [], // Custom reminder times with offsets
      },
      meals: {
        enabled: true,
        reminderTimes: ['08:00', '12:00', '18:00'], // Default meal reminder times
        customMessages: {
          breakfast: 'Time for breakfast! 🌅',
          lunch: 'Lunch time! 🍽️',
          dinner: 'Dinner time! 🌆',
          snack: 'Snack reminder! 🥨',
        },
      },
      general: {
        sound: true,
        vibration: true,
        quietHours: {
          enabled: false,
          startTime: '22:00',
          endTime: '07:00',
        },
      },
    },

    // Active notifications
    scheduledNotifications: [],

    // Loading states
    isLoading: false,
    error: null,
  }),

  getters: {
    isEnabled: (state) => state.permission === 'granted' && state.preferences.enabled,
    isFastingNotificationsEnabled: (state) => state.preferences.fasting.enabled && state.isEnabled,
    isMealNotificationsEnabled: (state) => state.preferences.meals.enabled && state.isEnabled,

    // Get notification preferences for display
    notificationSummary: (state) => {
      if (!state.isEnabled) return 'Notifications disabled'

      const activeTypes = []
      if (state.preferences.fasting.enabled) activeTypes.push('Fasting')
      if (state.preferences.meals.enabled) activeTypes.push('Meals')

      return activeTypes.length > 0 ? activeTypes.join(', ') : 'No active notifications'
    },

    // Check if currently in quiet hours
    isQuietHours: (state) => {
      if (!state.preferences.general.quietHours.enabled) return false

      const now = new Date()
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      const startTime = state.preferences.general.quietHours.startTime
      const endTime = state.preferences.general.quietHours.endTime

      // Handle overnight quiet hours (e.g., 22:00 to 07:00)
      if (startTime > endTime) {
        return currentTime >= startTime || currentTime <= endTime
      } else {
        return currentTime >= startTime && currentTime <= endTime
      }
    },
  },

  actions: {
    // Initialize the notifications store
    async init() {
      this.isLoading = true
      try {
        // Initialize notification service first
        await notificationService.init()

        // Re-check support in case it wasn't detected initially
        notificationService.recheckSupport()

        // Update state from service
        this.permission = notificationService.permission
        this.isSupported = notificationService.isSupported

        // Load preferences from localStorage after service is ready
        this.loadPreferences()

        // Force refresh state from service
        this.refreshStateFromService()

        // Load scheduled notifications
        this.scheduledNotifications = notificationService.getScheduledNotifications()
      } catch (error) {
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    // Request notification permission
    async requestPermission() {
      this.isLoading = true
      try {
        const granted = await notificationService.requestPermission()
        this.permission = notificationService.permission

        if (granted) {
          this.preferences.enabled = true
          this.savePreferences()
        }

        return granted
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Update notification preferences
    updatePreferences(newPreferences) {
      this.preferences = { ...this.preferences, ...newPreferences }
      this.savePreferences()

      // Reschedule notifications if needed
      if (this.isEnabled) {
        this.rescheduleNotifications()
      }
    },

    // Enable/disable all notifications
    async toggleNotifications(enabled) {
      if (enabled && this.permission !== 'granted') {
        const granted = await this.requestPermission()
        if (!granted) return false
      }

      this.preferences.enabled = enabled
      this.savePreferences()

      if (!enabled) {
        // Clear all scheduled notifications
        this.clearAllNotifications()
      } else {
        // Reschedule notifications
        this.rescheduleNotifications()
      }

      return true
    },

    // Fasting notification methods
    async notifyFastingStart(duration) {
      if (!this.isFastingNotificationsEnabled) return false

      return await notificationService.notifyFastingStart(duration)
    },

    async notifyFastingEnd(duration) {
      if (!this.isFastingNotificationsEnabled) return false

      return await notificationService.notifyFastingEnd(duration)
    },

    async scheduleFastingNotifications(startTime, duration) {
      if (!this.isFastingNotificationsEnabled) return false

      // Clear existing fasting notifications
      this.clearFastingNotifications()

      // Schedule new notifications
      notificationService.scheduleFastingReminders(startTime, duration)

      // Update scheduled notifications list
      this.scheduledNotifications = notificationService.getScheduledNotifications()

      return true
    },

    // Meal notification methods
    async notifyMealReminder(mealType = 'meal') {
      if (!this.isMealNotificationsEnabled || this.isQuietHours) return false

      return await notificationService.notifyMealReminder(mealType)
    },

    async scheduleMealReminders() {
      if (!this.isMealNotificationsEnabled) return false

      // Clear existing meal notifications
      this.clearMealNotifications()

      // Schedule new meal reminders
      const reminderTimes = this.preferences.meals.reminderTimes
      if (reminderTimes && Array.isArray(reminderTimes)) {
        notificationService.scheduleDailyMealReminders(reminderTimes)
      }

      // Update scheduled notifications list
      this.scheduledNotifications = notificationService.getScheduledNotifications()

      return true
    },

    // Custom notification scheduling
    async scheduleCustomNotification(id, title, message, scheduledTime, options = {}) {
      if (!this.isEnabled) return false

      const notificationOptions = {
        body: message,
        tag: id,
        ...options,
      }

      notificationService.scheduleNotification(id, title, notificationOptions, scheduledTime)
      this.scheduledNotifications = notificationService.getScheduledNotifications()

      return true
    },

    // Clear notification methods
    clearFastingNotifications() {
      const fastingNotificationIds = [
        'fasting-start',
        'fasting-progress-25',
        'fasting-progress-50',
        'fasting-progress-75',
        'fasting-end',
      ]

      fastingNotificationIds.forEach((id) => {
        notificationService.cancelScheduledNotification(id)
      })

      this.scheduledNotifications = notificationService.getScheduledNotifications()
    },

    clearMealNotifications() {
      // Clear meal reminder notifications
      for (let i = 0; i < 10; i++) {
        // Clear up to 10 meal reminders
        notificationService.cancelScheduledNotification(`meal-reminder-${i}`)
      }

      this.scheduledNotifications = notificationService.getScheduledNotifications()
    },

    clearAllNotifications() {
      notificationService.clearAllScheduledNotifications()
      this.scheduledNotifications = []
    },

    // Reschedule all notifications based on current preferences
    rescheduleNotifications() {
      this.clearAllNotifications()

      if (this.preferences.meals.enabled) {
        this.scheduleMealReminders()
      }

      // Note: Fasting notifications will be scheduled when a fast is started
    },

    // Test notification (for settings page)
    async sendTestNotification() {
      if (!this.isEnabled) {
        throw new Error('Notifications not enabled')
      }

      // Use unique tag to ensure each test notification shows
      const uniqueTag = `test-notification-${Date.now()}`

      return await notificationService.showNotification('🧪 Test Notification', {
        body: 'FastTrack notifications are working correctly!',
        tag: uniqueTag,
      })
    },

    // Persistence methods
    loadPreferences() {
      try {
        const saved = localStorage.getItem('fasttrack-notification-preferences')
        if (saved) {
          const preferences = JSON.parse(saved)
          // Merge with defaults to handle new preference keys
          this.preferences = { ...this.preferences, ...preferences }
        }
      } catch {
        // Failed to load notification preferences
      }
    },

    savePreferences() {
      try {
        localStorage.setItem('fasttrack-notification-preferences', JSON.stringify(this.preferences))
      } catch {
        // Failed to save notification preferences
      }
    },

    // Add meal reminder time
    addMealReminderTime(time) {
      if (!this.preferences.meals.reminderTimes.includes(time)) {
        this.preferences.meals.reminderTimes.push(time)
        this.preferences.meals.reminderTimes.sort()
        this.savePreferences()

        if (this.isMealNotificationsEnabled) {
          this.scheduleMealReminders()
        }
      }
    },

    // Remove meal reminder time
    removeMealReminderTime(time) {
      const index = this.preferences.meals.reminderTimes.indexOf(time)
      if (index > -1) {
        this.preferences.meals.reminderTimes.splice(index, 1)
        this.savePreferences()

        if (this.isMealNotificationsEnabled) {
          this.scheduleMealReminders()
        }
      }
    },

    // Add custom fasting reminder
    addCustomFastingReminder(offsetMinutes, message) {
      this.preferences.fasting.customReminders.push({
        offset: offsetMinutes,
        message: message,
        enabled: true,
      })
      this.savePreferences()
    },

    // Remove custom fasting reminder
    removeCustomFastingReminder(index) {
      this.preferences.fasting.customReminders.splice(index, 1)
      this.savePreferences()
    },

    // Force refresh state from service
    refreshStateFromService() {
      this.permission = notificationService.permission
      this.isSupported = notificationService.isSupported
      
      // Also load preferences from localStorage
      this.loadPreferences()
    },
  },
})
