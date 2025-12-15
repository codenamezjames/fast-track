import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotificationsStore } from '../../src/stores/notifications.js'

// Mock the notification service
vi.mock('../../src/services/notifications.js', () => ({
  notificationService: {
    init: vi.fn().mockResolvedValue(),
    recheckSupport: vi.fn().mockReturnValue(true),
    requestPermission: vi.fn(),
    isEnabled: vi.fn().mockReturnValue(true),
    isSupported: true,
    permission: 'granted',
    showNotification: vi.fn().mockResolvedValue(true),
    scheduleNotification: vi.fn().mockReturnValue(true),
    cancelScheduledNotification: vi.fn().mockReturnValue(true),
    clearAllScheduledNotifications: vi.fn(),
    getScheduledNotifications: vi.fn().mockReturnValue([]),
    notifyFastingStart: vi.fn().mockResolvedValue(true),
    notifyFastingEnd: vi.fn().mockResolvedValue(true),
    notifyMealReminder: vi.fn().mockResolvedValue(true),
    scheduleFastingReminders: vi.fn(),
    scheduleDailyMealReminders: vi.fn(),
  },
}))

// Import after mocking
import { notificationService } from '../../src/services/notifications.js'

describe('Notifications Store', () => {
  let notificationsStore

  beforeEach(() => {
    setActivePinia(createPinia())
    notificationsStore = useNotificationsStore()
    vi.clearAllMocks()

    // Reset mock service state
    notificationService.permission = 'granted'
    notificationService.isSupported = true
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      expect(notificationsStore.permission).toBe('default')
      expect(notificationsStore.isSupported).toBe(false)
      expect(notificationsStore.isLoading).toBe(false)
      expect(notificationsStore.error).toBe(null)
      expect(notificationsStore.preferences.enabled).toBe(false)
    })

    it('should have default fasting preferences', () => {
      expect(notificationsStore.preferences.fasting.enabled).toBe(true)
      expect(notificationsStore.preferences.fasting.startReminder).toBe(true)
      expect(notificationsStore.preferences.fasting.progressUpdates).toBe(true)
      expect(notificationsStore.preferences.fasting.endReminder).toBe(true)
    })

    it('should have default meal preferences', () => {
      expect(notificationsStore.preferences.meals.enabled).toBe(true)
      expect(notificationsStore.preferences.meals.reminderTimes).toEqual([
        '08:00',
        '12:00',
        '18:00',
      ])
    })

    it('should have default general preferences', () => {
      expect(notificationsStore.preferences.general.sound).toBe(true)
      expect(notificationsStore.preferences.general.vibration).toBe(true)
      expect(notificationsStore.preferences.general.quietHours.enabled).toBe(false)
    })
  })

  describe('Getters', () => {
    it('should return isEnabled correctly when granted and enabled', () => {
      notificationsStore.permission = 'granted'
      notificationsStore.preferences.enabled = true
      expect(notificationsStore.isEnabled).toBe(true)
    })

    it('should return isEnabled false when permission not granted', () => {
      notificationsStore.permission = 'default'
      notificationsStore.preferences.enabled = true
      expect(notificationsStore.isEnabled).toBe(false)
    })

    it('should return isEnabled false when not enabled in preferences', () => {
      notificationsStore.permission = 'granted'
      notificationsStore.preferences.enabled = false
      expect(notificationsStore.isEnabled).toBe(false)
    })

    it('should return isFastingNotificationsEnabled correctly', () => {
      notificationsStore.permission = 'granted'
      notificationsStore.preferences.enabled = true
      notificationsStore.preferences.fasting.enabled = true
      expect(notificationsStore.isFastingNotificationsEnabled).toBe(true)
    })

    it('should return isFastingNotificationsEnabled false when master disabled', () => {
      notificationsStore.permission = 'granted'
      notificationsStore.preferences.enabled = false
      notificationsStore.preferences.fasting.enabled = true
      expect(notificationsStore.isFastingNotificationsEnabled).toBe(false)
    })

    it('should return isMealNotificationsEnabled correctly', () => {
      notificationsStore.permission = 'granted'
      notificationsStore.preferences.enabled = true
      notificationsStore.preferences.meals.enabled = true
      expect(notificationsStore.isMealNotificationsEnabled).toBe(true)
    })

    it('should return notification summary when enabled', () => {
      notificationsStore.permission = 'granted'
      notificationsStore.preferences.enabled = true
      notificationsStore.preferences.fasting.enabled = true
      notificationsStore.preferences.meals.enabled = true
      expect(notificationsStore.notificationSummary).toBe('Fasting, Meals')
    })

    it('should return notification summary when disabled', () => {
      notificationsStore.permission = 'granted'
      notificationsStore.preferences.enabled = false
      expect(notificationsStore.notificationSummary).toBe('Notifications disabled')
    })

    it('should return false when quiet hours disabled', () => {
      notificationsStore.preferences.general.quietHours.enabled = false
      notificationsStore.preferences.general.quietHours.startTime = '00:00'
      notificationsStore.preferences.general.quietHours.endTime = '23:59'

      expect(notificationsStore.isQuietHours).toBe(false)
    })

    it('should detect quiet hours when enabled and time matches', () => {
      notificationsStore.preferences.general.quietHours.enabled = true
      // Set quiet hours to cover entire day
      notificationsStore.preferences.general.quietHours.startTime = '00:00'
      notificationsStore.preferences.general.quietHours.endTime = '23:59'

      expect(notificationsStore.isQuietHours).toBe(true)
    })
  })

  describe('Actions', () => {
    describe('init', () => {
      it('should initialize the store from service', async () => {
        await notificationsStore.init()

        expect(notificationService.init).toHaveBeenCalled()
        expect(notificationService.recheckSupport).toHaveBeenCalled()
        expect(notificationsStore.permission).toBe('granted')
        expect(notificationsStore.isSupported).toBe(true)
        expect(notificationsStore.isLoading).toBe(false)
      })

      it('should handle initialization errors', async () => {
        notificationService.init.mockRejectedValueOnce(new Error('Init failed'))

        await notificationsStore.init()

        expect(notificationsStore.error).toBe('Init failed')
        expect(notificationsStore.isLoading).toBe(false)
      })
    })

    describe('requestPermission', () => {
      it('should request permission and update state on grant', async () => {
        notificationService.requestPermission.mockResolvedValueOnce(true)
        notificationService.permission = 'granted'

        const result = await notificationsStore.requestPermission()

        expect(result).toBe(true)
        expect(notificationService.requestPermission).toHaveBeenCalled()
        expect(notificationsStore.permission).toBe('granted')
        expect(notificationsStore.preferences.enabled).toBe(true)
      })

      it('should handle permission denial', async () => {
        notificationService.requestPermission.mockResolvedValueOnce(false)
        notificationService.permission = 'denied'

        const result = await notificationsStore.requestPermission()

        expect(result).toBe(false)
        expect(notificationsStore.permission).toBe('denied')
      })

      it('should handle permission request errors', async () => {
        notificationService.requestPermission.mockRejectedValueOnce(
          new Error('Permission request failed'),
        )

        await expect(notificationsStore.requestPermission()).rejects.toThrow(
          'Permission request failed',
        )
        expect(notificationsStore.error).toBe('Permission request failed')
      })
    })

    describe('toggleNotifications', () => {
      it('should enable notifications and reschedule', async () => {
        notificationsStore.permission = 'granted'
        notificationsStore.preferences.enabled = false

        await notificationsStore.toggleNotifications(true)

        expect(notificationsStore.preferences.enabled).toBe(true)
      })

      it('should disable notifications and clear all', async () => {
        notificationsStore.permission = 'granted'
        notificationsStore.preferences.enabled = true

        await notificationsStore.toggleNotifications(false)

        expect(notificationsStore.preferences.enabled).toBe(false)
        expect(notificationService.clearAllScheduledNotifications).toHaveBeenCalled()
      })

      it('should request permission when enabling if not granted', async () => {
        notificationsStore.permission = 'default'
        notificationService.requestPermission.mockResolvedValueOnce(true)
        notificationService.permission = 'granted'

        await notificationsStore.toggleNotifications(true)

        expect(notificationService.requestPermission).toHaveBeenCalled()
      })
    })

    describe('notifyFastingStart', () => {
      it('should send fasting start notification when enabled', async () => {
        notificationsStore.permission = 'granted'
        notificationsStore.preferences.enabled = true
        notificationsStore.preferences.fasting.enabled = true

        await notificationsStore.notifyFastingStart(16)

        expect(notificationService.notifyFastingStart).toHaveBeenCalledWith(16)
      })

      it('should not send notification when disabled', async () => {
        notificationsStore.permission = 'granted'
        notificationsStore.preferences.enabled = false

        const result = await notificationsStore.notifyFastingStart(16)

        expect(result).toBe(false)
        expect(notificationService.notifyFastingStart).not.toHaveBeenCalled()
      })
    })

    describe('notifyFastingEnd', () => {
      it('should send fasting end notification when enabled', async () => {
        notificationsStore.permission = 'granted'
        notificationsStore.preferences.enabled = true
        notificationsStore.preferences.fasting.enabled = true

        await notificationsStore.notifyFastingEnd(16)

        expect(notificationService.notifyFastingEnd).toHaveBeenCalledWith(16)
      })
    })

    describe('scheduleFastingNotifications', () => {
      it('should schedule fasting notifications when enabled', async () => {
        notificationsStore.permission = 'granted'
        notificationsStore.preferences.enabled = true
        notificationsStore.preferences.fasting.enabled = true

        const startTime = new Date()
        await notificationsStore.scheduleFastingNotifications(startTime, 16)

        expect(notificationService.scheduleFastingReminders).toHaveBeenCalledWith(startTime, 16)
      })

      it('should not schedule when disabled', async () => {
        notificationsStore.permission = 'granted'
        notificationsStore.preferences.enabled = false

        const result = await notificationsStore.scheduleFastingNotifications(new Date(), 16)

        expect(result).toBe(false)
        expect(notificationService.scheduleFastingReminders).not.toHaveBeenCalled()
      })
    })

    describe('notifyMealReminder', () => {
      it('should send meal reminder when enabled and not in quiet hours', async () => {
        notificationsStore.permission = 'granted'
        notificationsStore.preferences.enabled = true
        notificationsStore.preferences.meals.enabled = true

        await notificationsStore.notifyMealReminder('lunch')

        expect(notificationService.notifyMealReminder).toHaveBeenCalledWith('lunch')
      })

      it('should not send meal reminder when in quiet hours', async () => {
        notificationsStore.permission = 'granted'
        notificationsStore.preferences.enabled = true
        notificationsStore.preferences.meals.enabled = true
        notificationsStore.preferences.general.quietHours.enabled = true
        // Set quiet hours to cover entire day to ensure we're in quiet hours
        notificationsStore.preferences.general.quietHours.startTime = '00:00'
        notificationsStore.preferences.general.quietHours.endTime = '23:59'

        const result = await notificationsStore.notifyMealReminder('lunch')

        expect(result).toBe(false)
        expect(notificationService.notifyMealReminder).not.toHaveBeenCalled()
      })
    })

    describe('scheduleMealReminders', () => {
      it('should schedule meal reminders when enabled', async () => {
        notificationsStore.permission = 'granted'
        notificationsStore.preferences.enabled = true
        notificationsStore.preferences.meals.enabled = true

        await notificationsStore.scheduleMealReminders()

        expect(notificationService.scheduleDailyMealReminders).toHaveBeenCalledWith([
          '08:00',
          '12:00',
          '18:00',
        ])
      })
    })

    describe('clearFastingNotifications', () => {
      it('should cancel all fasting notifications', () => {
        notificationsStore.clearFastingNotifications()

        expect(notificationService.cancelScheduledNotification).toHaveBeenCalledWith('fasting-start')
        expect(notificationService.cancelScheduledNotification).toHaveBeenCalledWith(
          'fasting-progress-25',
        )
        expect(notificationService.cancelScheduledNotification).toHaveBeenCalledWith(
          'fasting-progress-50',
        )
        expect(notificationService.cancelScheduledNotification).toHaveBeenCalledWith(
          'fasting-progress-75',
        )
        expect(notificationService.cancelScheduledNotification).toHaveBeenCalledWith('fasting-end')
      })
    })

    describe('clearMealNotifications', () => {
      it('should cancel all meal notifications', () => {
        notificationsStore.clearMealNotifications()

        // Should clear up to 10 meal reminders
        expect(notificationService.cancelScheduledNotification).toHaveBeenCalledWith(
          'meal-reminder-0',
        )
        expect(notificationService.cancelScheduledNotification).toHaveBeenCalledWith(
          'meal-reminder-1',
        )
        expect(notificationService.cancelScheduledNotification).toHaveBeenCalledWith(
          'meal-reminder-2',
        )
      })
    })

    describe('clearAllNotifications', () => {
      it('should clear all scheduled notifications', () => {
        notificationsStore.clearAllNotifications()

        expect(notificationService.clearAllScheduledNotifications).toHaveBeenCalled()
        expect(notificationsStore.scheduledNotifications).toEqual([])
      })
    })

    describe('sendTestNotification', () => {
      it('should send test notification when enabled', async () => {
        notificationsStore.permission = 'granted'
        notificationsStore.preferences.enabled = true

        await notificationsStore.sendTestNotification()

        expect(notificationService.showNotification).toHaveBeenCalledWith(
          expect.stringContaining('Test'),
          expect.objectContaining({
            body: 'FastTrack notifications are working correctly!',
          }),
        )
      })

      it('should throw error when not enabled', async () => {
        notificationsStore.permission = 'granted'
        notificationsStore.preferences.enabled = false

        await expect(notificationsStore.sendTestNotification()).rejects.toThrow(
          'Notifications not enabled',
        )
      })
    })

    describe('addMealReminderTime', () => {
      it('should add a new meal reminder time', () => {
        notificationsStore.addMealReminderTime('15:00')

        expect(notificationsStore.preferences.meals.reminderTimes).toContain('15:00')
      })

      it('should not add duplicate reminder time', () => {
        notificationsStore.addMealReminderTime('12:00')

        expect(
          notificationsStore.preferences.meals.reminderTimes.filter((t) => t === '12:00').length,
        ).toBe(1)
      })

      it('should sort reminder times', () => {
        notificationsStore.addMealReminderTime('10:00')

        expect(notificationsStore.preferences.meals.reminderTimes).toEqual([
          '08:00',
          '10:00',
          '12:00',
          '18:00',
        ])
      })
    })

    describe('removeMealReminderTime', () => {
      it('should remove an existing meal reminder time', () => {
        notificationsStore.removeMealReminderTime('12:00')

        expect(notificationsStore.preferences.meals.reminderTimes).not.toContain('12:00')
      })

      it('should handle removing non-existent time', () => {
        const originalLength = notificationsStore.preferences.meals.reminderTimes.length
        notificationsStore.removeMealReminderTime('99:00')

        expect(notificationsStore.preferences.meals.reminderTimes.length).toBe(originalLength)
      })
    })

    describe('addCustomFastingReminder', () => {
      it('should add a custom fasting reminder', () => {
        notificationsStore.addCustomFastingReminder(30, 'Halfway there!')

        expect(notificationsStore.preferences.fasting.customReminders).toContainEqual({
          offset: 30,
          message: 'Halfway there!',
          enabled: true,
        })
      })
    })

    describe('removeCustomFastingReminder', () => {
      it('should remove a custom fasting reminder by index', () => {
        notificationsStore.preferences.fasting.customReminders = [
          { offset: 30, message: 'Test', enabled: true },
          { offset: 60, message: 'Test 2', enabled: true },
        ]

        notificationsStore.removeCustomFastingReminder(0)

        expect(notificationsStore.preferences.fasting.customReminders.length).toBe(1)
        expect(notificationsStore.preferences.fasting.customReminders[0].offset).toBe(60)
      })
    })

    describe('scheduleCustomNotification', () => {
      it('should schedule a custom notification when enabled', async () => {
        notificationsStore.permission = 'granted'
        notificationsStore.preferences.enabled = true

        const scheduledTime = new Date(Date.now() + 60000)
        await notificationsStore.scheduleCustomNotification(
          'custom-1',
          'Custom Title',
          'Custom message',
          scheduledTime,
        )

        expect(notificationService.scheduleNotification).toHaveBeenCalledWith(
          'custom-1',
          'Custom Title',
          expect.objectContaining({ body: 'Custom message', tag: 'custom-1' }),
          scheduledTime,
        )
      })

      it('should not schedule when disabled', async () => {
        notificationsStore.permission = 'granted'
        notificationsStore.preferences.enabled = false

        const result = await notificationsStore.scheduleCustomNotification(
          'custom-1',
          'Title',
          'Message',
          new Date(),
        )

        expect(result).toBe(false)
        expect(notificationService.scheduleNotification).not.toHaveBeenCalled()
      })
    })
  })

  describe('Persistence', () => {
    it('should save preferences to localStorage', () => {
      notificationsStore.preferences.enabled = true
      notificationsStore.savePreferences()

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'fasttrack-notification-preferences',
        expect.any(String),
      )
    })

    it('should load preferences from localStorage', () => {
      const savedPrefs = JSON.stringify({
        enabled: true,
        fasting: { enabled: false },
      })
      localStorage.getItem.mockReturnValue(savedPrefs)

      notificationsStore.loadPreferences()

      expect(notificationsStore.preferences.enabled).toBe(true)
      expect(notificationsStore.preferences.fasting.enabled).toBe(false)
    })

    it('should handle corrupted localStorage data', () => {
      localStorage.getItem.mockReturnValue('not valid json')

      // Should not throw
      expect(() => notificationsStore.loadPreferences()).not.toThrow()
    })
  })
})
