// Notification Service for FastTrack App
// Handles both PWA push notifications and browser notifications

class NotificationService {
  constructor() {
    this.permission = 'default'
    this.isSupported = this._checkNotificationSupport()
    this.swRegistration = null
    this.vapidPublicKey = null // Will be set when we have a push server
    this.scheduledNotifications = new Map()

    this.init()
  }

  _checkNotificationSupport() {
    // More robust check for notification support
    if (typeof window === 'undefined') {
      return false
    }

    // Check if Notification API exists
    if (!('Notification' in window)) {
      return false
    }

    // Check if Notification constructor is available
    if (typeof Notification !== 'function') {
      return false
    }

    // Check if requestPermission method exists
    if (typeof Notification.requestPermission !== 'function') {
      return false
    }

    return true
  }

  async init() {
    // Re-check support in case it wasn't available during construction
    if (!this.isSupported) {
      this.isSupported = this._checkNotificationSupport()
    }

    if (!this.isSupported) {
      return
    }

    // Check current permission
    this.permission = this.isSupported ? Notification.permission : 'default'

    // Register service worker for PWA notifications (optional)
    if ('serviceWorker' in navigator) {
      // Don't block on service worker registration
      navigator.serviceWorker.getRegistrations()
        .then(registrations => {
          if (registrations.length > 0) {
            this.swRegistration = registrations[0]
          }
        })
        .catch(() => {
          // Service Worker not available, continuing without PWA notifications
        })
    }

    // Load scheduled notifications from localStorage
    this.loadScheduledNotifications()
  }

  // Request notification permission
  async requestPermission() {
    if (!this.isSupported) {
      throw new Error('Notifications not supported')
    }

    const permission = await Notification.requestPermission()
    this.permission = permission

    if (permission === 'granted') {
      return true
    } else {
      return false
    }
  }

  // Check if notifications are enabled
  isEnabled() {
    return this.permission === 'granted'
  }

  // Re-check notification support (useful for browsers that load APIs late)
  recheckSupport() {
    const wasSupported = this.isSupported
    this.isSupported = this._checkNotificationSupport()
    
    if (!wasSupported && this.isSupported) {
      this.permission = Notification.permission
    }
    
    return this.isSupported
  }

  // Show immediate notification
  async showNotification(title, options = {}) {
    if (!this.isEnabled()) {
      return false
    }

    const defaultOptions = {
      icon: '/icons/favicon-96x96.png',
      badge: '/icons/favicon-32x32.png',
      vibrate: [200, 100, 200],
      tag: 'fasttrack',
      requireInteraction: false,
      silent: false,
      ...options,
    }

    try {
      // Use service worker notification if available (for PWA)
      if (this.swRegistration && this.swRegistration.showNotification) {
        await this.swRegistration.showNotification(title, defaultOptions)
      } else {
        // Fallback to browser notification - remove actions as they're not supported
        const browserOptions = { ...defaultOptions }
        delete browserOptions.actions // Remove actions for browser notifications
        
        new Notification(title, browserOptions)
      }
      return true
    } catch {
      return false
    }
  }

  // Schedule a notification for later
  scheduleNotification(id, title, options, scheduledTime) {
    const now = new Date().getTime()
    const delay = new Date(scheduledTime).getTime() - now

    if (delay <= 0) {
      // If time has passed, show immediately
      return this.showNotification(title, options)
    }

    // Clear existing notification with same ID
    this.cancelScheduledNotification(id)

    // Schedule the notification
    const timeoutId = setTimeout(() => {
      this.showNotification(title, options)
      this.scheduledNotifications.delete(id)
      this.saveScheduledNotifications()
    }, delay)

    // Store the scheduled notification
    this.scheduledNotifications.set(id, {
      title,
      options,
      scheduledTime,
      timeoutId,
    })

    this.saveScheduledNotifications()
    return true
  }

  // Cancel a scheduled notification
  cancelScheduledNotification(id) {
    const notification = this.scheduledNotifications.get(id)
    if (notification) {
      clearTimeout(notification.timeoutId)
      this.scheduledNotifications.delete(id)
      this.saveScheduledNotifications()
      return true
    }
    return false
  }

  // Get all scheduled notifications
  getScheduledNotifications() {
    return Array.from(this.scheduledNotifications.entries()).map(([id, notification]) => ({
      id,
      title: notification.title,
      scheduledTime: notification.scheduledTime,
      options: notification.options,
    }))
  }

  // Clear all scheduled notifications
  clearAllScheduledNotifications() {
    this.scheduledNotifications.forEach((notification) => {
      clearTimeout(notification.timeoutId)
    })
    this.scheduledNotifications.clear()
    this.saveScheduledNotifications()
  }

  // Fasting-specific notifications
  async notifyFastingStart(fastDuration) {
    return await this.showNotification('🚀 Fast Started!', {
      body: `Your ${fastDuration}h fast has begun. Good luck!`,
      tag: 'fasting-start',
      icon: '/icons/favicon-96x96.png',
      actions: [{ action: 'view', title: 'View Progress' }],
    })
  }

  async notifyFastingEnd(fastDuration) {
    return await this.showNotification('🎉 Fast Complete!', {
      body: `Congratulations! You completed your ${fastDuration}h fast.`,
      tag: 'fasting-end',
      icon: '/icons/favicon-96x96.png',
      actions: [
        { action: 'log-meal', title: 'Log First Meal' },
        { action: 'view', title: 'View Stats' },
      ],
    })
  }

  async notifyFastingProgress(remainingTime, totalDuration) {
    const progress = Math.round(((totalDuration - remainingTime) / totalDuration) * 100)
    return await this.showNotification(`⏰ Fast Progress: ${progress}%`, {
      body: `${this.formatDuration(remainingTime)} remaining`,
      tag: 'fasting-progress',
      icon: '/icons/favicon-96x96.png',
      requireInteraction: false,
    })
  }

  // Meal logging reminders
  async notifyMealReminder(mealType = 'meal') {
    return await this.showNotification('🍽️ Meal Reminder', {
      body: `Don't forget to log your ${mealType}!`,
      tag: 'meal-reminder',
      icon: '/icons/favicon-96x96.png',
      actions: [
        { action: 'log-meal', title: 'Log Meal' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    })
  }

  // Schedule fasting reminders
  scheduleFastingReminders(startTime, duration) {
    const start = new Date(startTime).getTime()
    const end = start + duration * 60 * 60 * 1000 // duration in hours

    // Schedule start notification
    this.scheduleNotification(
      'fasting-start',
      '🚀 Fast Starting Soon!',
      {
        body: 'Your fast begins in 5 minutes. Finish any last snacks!',
        tag: 'fasting-start-warning',
      },
      new Date(start - 5 * 60 * 1000), // 5 minutes before
    )

    // Schedule progress notifications (25%, 50%, 75%)
    const progressArray = [0.25, 0.5, 0.75]
    
    progressArray.forEach((progress) => {
      const notificationTime = start + duration * 60 * 60 * 1000 * progress
      const remaining = duration * (1 - progress)

      this.scheduleNotification(
        `fasting-progress-${Math.round(progress * 100)}`,
        `⏰ Fast ${Math.round(progress * 100)}% Complete`,
        {
          body: `${this.formatDuration(remaining)} hours remaining. Keep it up!`,
          tag: 'fasting-progress',
        },
        new Date(notificationTime),
      )
    })

    // Schedule end notification
    this.scheduleNotification(
      'fasting-end',
      '🎉 Fast Complete!',
      {
        body: `Congratulations! You completed your ${duration}h fast.`,
        tag: 'fasting-end',
        actions: [{ action: 'log-meal', title: 'Log First Meal' }],
      },
      new Date(end),
    )
  }

  // Schedule daily meal reminders
  scheduleDailyMealReminders(reminderTimes) {
    if (!reminderTimes || !Array.isArray(reminderTimes)) {
      return
    }
    
    reminderTimes.forEach((time, index) => {
      const [hours, minutes] = time.split(':').map(Number)
      const now = new Date()
      const reminderTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hours,
        minutes,
      )

      // If time has passed today, schedule for tomorrow
      if (reminderTime.getTime() <= now.getTime()) {
        reminderTime.setDate(reminderTime.getDate() + 1)
      }

      this.scheduleNotification(
        `meal-reminder-${index}`,
        '🍽️ Meal Reminder',
        {
          body: 'Time to log your meal!',
          tag: 'meal-reminder',
        },
        reminderTime,
      )
    })
  }

  // Utility methods
  formatDuration(hours) {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`
    }
    return `${Math.round(hours * 10) / 10}h`
  }

  // Persistence methods
  saveScheduledNotifications() {
    const data = Array.from(this.scheduledNotifications.entries()).map(([id, notification]) => ({
      id,
      title: notification.title,
      options: notification.options,
      scheduledTime: notification.scheduledTime,
    }))
    localStorage.setItem('fasttrack-scheduled-notifications', JSON.stringify(data))
  }

  loadScheduledNotifications() {
    try {
      const data = localStorage.getItem('fasttrack-scheduled-notifications')
      if (data) {
        const notifications = JSON.parse(data)
        const now = new Date().getTime()

        notifications.forEach((notification) => {
          const delay = new Date(notification.scheduledTime).getTime() - now
          if (delay > 0) {
            // Re-schedule notifications that haven't expired
            this.scheduleNotification(
              notification.id,
              notification.title,
              notification.options,
              notification.scheduledTime,
            )
          }
        })
      }
    } catch {
      // Failed to load scheduled notifications
    }
  }
}

// Create singleton instance
export const notificationService = new NotificationService()

// Export class for testing
export { NotificationService }
