import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { NotificationService } from '../../src/services/notifications.js'

describe('Notification Service', () => {
  let service
  let mockNotification

  beforeEach(() => {
    // Mock the Notification API
    mockNotification = vi.fn()
    mockNotification.permission = 'default'
    mockNotification.requestPermission = vi.fn().mockResolvedValue('granted')

    global.Notification = mockNotification
    global.navigator = {
      serviceWorker: {
        getRegistrations: vi.fn().mockResolvedValue([]),
      },
    }

    // Clear localStorage mock
    localStorage.getItem.mockReturnValue(null)
    localStorage.setItem.mockClear()

    // Create fresh instance
    service = new NotificationService()
  })

  afterEach(() => {
    // Clear any scheduled notifications
    service.clearAllScheduledNotifications()
    vi.clearAllMocks()
  })

  describe('Constructor and Support Check', () => {
    it('should check notification support on construction', () => {
      expect(service.isSupported).toBe(true)
    })

    it('should detect when notifications are not supported', () => {
      delete global.Notification
      const unsupportedService = new NotificationService()
      expect(unsupportedService.isSupported).toBe(false)
    })

    it('should initialize with default permission', () => {
      expect(service.permission).toBe('default')
    })

    it('should have empty scheduled notifications map', () => {
      expect(service.scheduledNotifications.size).toBe(0)
    })
  })

  describe('_checkNotificationSupport', () => {
    it('should return false when window is undefined', () => {
      const originalWindow = global.window
      delete global.window
      const result = service._checkNotificationSupport()
      global.window = originalWindow
      expect(result).toBe(false)
    })

    it('should return false when Notification is not in window', () => {
      delete global.Notification
      const result = service._checkNotificationSupport()
      expect(result).toBe(false)
    })

    it('should return false when Notification is not a function', () => {
      global.Notification = 'not a function'
      const result = service._checkNotificationSupport()
      expect(result).toBe(false)
    })

    it('should return false when requestPermission is not a function', () => {
      global.Notification = function () {}
      global.Notification.requestPermission = 'not a function'
      const result = service._checkNotificationSupport()
      expect(result).toBe(false)
    })

    it('should return true when all requirements are met', () => {
      const result = service._checkNotificationSupport()
      expect(result).toBe(true)
    })
  })

  describe('requestPermission', () => {
    it('should request permission and return true on grant', async () => {
      mockNotification.requestPermission.mockResolvedValue('granted')

      const result = await service.requestPermission()

      expect(mockNotification.requestPermission).toHaveBeenCalled()
      expect(result).toBe(true)
      expect(service.permission).toBe('granted')
    })

    it('should return false on denial', async () => {
      mockNotification.requestPermission.mockResolvedValue('denied')

      const result = await service.requestPermission()

      expect(result).toBe(false)
      expect(service.permission).toBe('denied')
    })

    it('should throw error when not supported', async () => {
      service.isSupported = false

      await expect(service.requestPermission()).rejects.toThrow('Notifications not supported')
    })
  })

  describe('isEnabled', () => {
    it('should return true when permission is granted', () => {
      service.permission = 'granted'
      expect(service.isEnabled()).toBe(true)
    })

    it('should return false when permission is not granted', () => {
      service.permission = 'default'
      expect(service.isEnabled()).toBe(false)
    })
  })

  describe('recheckSupport', () => {
    it('should re-check and update support status', () => {
      service.isSupported = false
      const result = service.recheckSupport()
      expect(result).toBe(true)
      expect(service.isSupported).toBe(true)
    })

    it('should update permission when newly supported', () => {
      service.isSupported = false
      mockNotification.permission = 'granted'
      service.recheckSupport()
      expect(service.permission).toBe('granted')
    })
  })

  describe('showNotification', () => {
    it('should return false when not enabled', async () => {
      service.permission = 'default'
      const result = await service.showNotification('Test')
      expect(result).toBe(false)
    })

    it('should create browser notification when no service worker', async () => {
      service.permission = 'granted'
      service.swRegistration = null

      const result = await service.showNotification('Test Title', {
        body: 'Test Body',
      })

      expect(mockNotification).toHaveBeenCalledWith(
        'Test Title',
        expect.objectContaining({
          body: 'Test Body',
          icon: '/icons/favicon-96x96.png',
          badge: '/icons/favicon-32x32.png',
        }),
      )
      expect(result).toBe(true)
    })

    it('should use service worker when available', async () => {
      service.permission = 'granted'
      const mockShowNotification = vi.fn().mockResolvedValue()
      service.swRegistration = {
        showNotification: mockShowNotification,
      }

      await service.showNotification('Test Title', { body: 'Test Body' })

      expect(mockShowNotification).toHaveBeenCalledWith(
        'Test Title',
        expect.objectContaining({ body: 'Test Body' }),
      )
    })

    it('should remove actions for browser notifications', async () => {
      service.permission = 'granted'
      service.swRegistration = null

      await service.showNotification('Test', {
        body: 'Body',
        actions: [{ action: 'test', title: 'Test' }],
      })

      expect(mockNotification).toHaveBeenCalledWith(
        'Test',
        expect.not.objectContaining({ actions: expect.anything() }),
      )
    })

    it('should handle notification errors gracefully', async () => {
      service.permission = 'granted'
      mockNotification.mockImplementation(() => {
        throw new Error('Notification error')
      })

      const result = await service.showNotification('Test')
      expect(result).toBe(false)
    })
  })

  describe('scheduleNotification', () => {
    beforeEach(() => {
      service.permission = 'granted'
    })

    it('should show immediately if scheduled time has passed', async () => {
      const pastTime = new Date(Date.now() - 1000)
      const showSpy = vi.spyOn(service, 'showNotification').mockResolvedValue(true)

      await service.scheduleNotification('test-id', 'Title', { body: 'Body' }, pastTime)

      expect(showSpy).toHaveBeenCalled()
    })

    it('should schedule notification for future time', () => {
      const futureTime = new Date(Date.now() + 60000)

      service.scheduleNotification('test-id', 'Title', { body: 'Body' }, futureTime)

      expect(service.scheduledNotifications.has('test-id')).toBe(true)
    })

    it('should cancel existing notification with same ID', () => {
      const futureTime = new Date(Date.now() + 60000)

      service.scheduleNotification('test-id', 'Title 1', {}, futureTime)
      service.scheduleNotification('test-id', 'Title 2', {}, futureTime)

      expect(service.scheduledNotifications.get('test-id').title).toBe('Title 2')
    })

    it('should save to localStorage', () => {
      const futureTime = new Date(Date.now() + 60000)
      service.scheduleNotification('test-id', 'Title', {}, futureTime)

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'fasttrack-scheduled-notifications',
        expect.any(String),
      )
    })
  })

  describe('cancelScheduledNotification', () => {
    beforeEach(() => {
      service.permission = 'granted'
    })

    it('should cancel a scheduled notification', () => {
      const futureTime = new Date(Date.now() + 60000)
      service.scheduleNotification('test-id', 'Title', {}, futureTime)

      const result = service.cancelScheduledNotification('test-id')

      expect(result).toBe(true)
      expect(service.scheduledNotifications.has('test-id')).toBe(false)
    })

    it('should return false for non-existent notification', () => {
      const result = service.cancelScheduledNotification('non-existent')
      expect(result).toBe(false)
    })
  })

  describe('getScheduledNotifications', () => {
    beforeEach(() => {
      service.permission = 'granted'
    })

    it('should return array of scheduled notifications', () => {
      const futureTime1 = new Date(Date.now() + 60000)
      const futureTime2 = new Date(Date.now() + 120000)

      service.scheduleNotification('id-1', 'Title 1', { body: 'Body 1' }, futureTime1)
      service.scheduleNotification('id-2', 'Title 2', { body: 'Body 2' }, futureTime2)

      const notifications = service.getScheduledNotifications()

      expect(notifications).toHaveLength(2)
      expect(notifications[0]).toMatchObject({ id: 'id-1', title: 'Title 1' })
      expect(notifications[1]).toMatchObject({ id: 'id-2', title: 'Title 2' })
    })
  })

  describe('clearAllScheduledNotifications', () => {
    beforeEach(() => {
      service.permission = 'granted'
    })

    it('should clear all scheduled notifications', () => {
      service.scheduleNotification('id-1', 'Title 1', {}, new Date(Date.now() + 60000))
      service.scheduleNotification('id-2', 'Title 2', {}, new Date(Date.now() + 120000))

      service.clearAllScheduledNotifications()

      expect(service.scheduledNotifications.size).toBe(0)
    })
  })

  describe('Fasting Notifications', () => {
    beforeEach(() => {
      service.permission = 'granted'
    })

    it('should show fasting start notification', async () => {
      const showSpy = vi.spyOn(service, 'showNotification').mockResolvedValue(true)

      await service.notifyFastingStart(16)

      expect(showSpy).toHaveBeenCalledWith(
        expect.stringContaining('Fast Started'),
        expect.objectContaining({
          body: expect.stringContaining('16h'),
        }),
      )
    })

    it('should show fasting end notification', async () => {
      const showSpy = vi.spyOn(service, 'showNotification').mockResolvedValue(true)

      await service.notifyFastingEnd(16)

      expect(showSpy).toHaveBeenCalledWith(
        expect.stringContaining('Fast Complete'),
        expect.objectContaining({
          body: expect.stringContaining('16h'),
        }),
      )
    })

    it('should show fasting progress notification', async () => {
      const showSpy = vi.spyOn(service, 'showNotification').mockResolvedValue(true)

      await service.notifyFastingProgress(8, 16)

      expect(showSpy).toHaveBeenCalledWith(
        expect.stringContaining('50%'),
        expect.objectContaining({
          body: expect.stringContaining('remaining'),
        }),
      )
    })
  })

  describe('scheduleFastingReminders', () => {
    beforeEach(() => {
      service.permission = 'granted'
    })

    it('should schedule all fasting reminders', () => {
      // Use a future start time so start-5min is still in the future
      const startTime = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
      const duration = 16 // hours

      service.scheduleFastingReminders(startTime, duration)

      // Should schedule: start warning (5min before), 25%, 50%, 75%, end
      expect(service.scheduledNotifications.has('fasting-start')).toBe(true)
      expect(service.scheduledNotifications.has('fasting-progress-25')).toBe(true)
      expect(service.scheduledNotifications.has('fasting-progress-50')).toBe(true)
      expect(service.scheduledNotifications.has('fasting-progress-75')).toBe(true)
      expect(service.scheduledNotifications.has('fasting-end')).toBe(true)
    })

    it('should handle start time in the past for progress notifications', () => {
      // Start time is now, so start warning (-5min) is in the past
      const startTime = new Date()
      const duration = 16 // hours

      service.scheduleFastingReminders(startTime, duration)

      // Progress and end notifications should still be scheduled
      expect(service.scheduledNotifications.has('fasting-progress-25')).toBe(true)
      expect(service.scheduledNotifications.has('fasting-end')).toBe(true)
    })
  })

  describe('Meal Notifications', () => {
    beforeEach(() => {
      service.permission = 'granted'
    })

    it('should show meal reminder notification', async () => {
      const showSpy = vi.spyOn(service, 'showNotification').mockResolvedValue(true)

      await service.notifyMealReminder('lunch')

      expect(showSpy).toHaveBeenCalledWith(
        expect.stringContaining('Meal Reminder'),
        expect.objectContaining({
          body: expect.stringContaining('lunch'),
        }),
      )
    })
  })

  describe('scheduleDailyMealReminders', () => {
    beforeEach(() => {
      service.permission = 'granted'
    })

    it('should schedule meal reminders for provided times', () => {
      const reminderTimes = ['08:00', '12:00', '18:00']

      service.scheduleDailyMealReminders(reminderTimes)

      expect(service.scheduledNotifications.has('meal-reminder-0')).toBe(true)
      expect(service.scheduledNotifications.has('meal-reminder-1')).toBe(true)
      expect(service.scheduledNotifications.has('meal-reminder-2')).toBe(true)
    })

    it('should handle invalid input gracefully', () => {
      expect(() => service.scheduleDailyMealReminders(null)).not.toThrow()
      expect(() => service.scheduleDailyMealReminders(undefined)).not.toThrow()
      expect(() => service.scheduleDailyMealReminders('not an array')).not.toThrow()
    })
  })

  describe('formatDuration', () => {
    it('should format hours correctly', () => {
      expect(service.formatDuration(2)).toBe('2h')
      expect(service.formatDuration(1.5)).toBe('1.5h')
    })

    it('should format minutes when less than 1 hour', () => {
      expect(service.formatDuration(0.5)).toBe('30m')
      expect(service.formatDuration(0.25)).toBe('15m')
    })
  })

  describe('Persistence', () => {
    beforeEach(() => {
      service.permission = 'granted'
    })

    it('should save scheduled notifications to localStorage', () => {
      service.scheduleNotification('test', 'Title', {}, new Date(Date.now() + 60000))

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'fasttrack-scheduled-notifications',
        expect.stringContaining('test'),
      )
    })

    it('should load and reschedule notifications from localStorage', () => {
      const futureTime = new Date(Date.now() + 60000).toISOString()
      const savedData = JSON.stringify([
        {
          id: 'saved-1',
          title: 'Saved Title',
          options: { body: 'Saved Body' },
          scheduledTime: futureTime,
        },
      ])
      localStorage.getItem.mockReturnValue(savedData)

      service.loadScheduledNotifications()

      expect(service.scheduledNotifications.has('saved-1')).toBe(true)
    })

    it('should not reschedule expired notifications', () => {
      const pastTime = new Date(Date.now() - 60000).toISOString()
      const savedData = JSON.stringify([
        {
          id: 'expired-1',
          title: 'Expired Title',
          options: {},
          scheduledTime: pastTime,
        },
      ])
      localStorage.getItem.mockReturnValue(savedData)

      service.loadScheduledNotifications()

      expect(service.scheduledNotifications.has('expired-1')).toBe(false)
    })

    it('should handle corrupted localStorage data', () => {
      localStorage.getItem.mockReturnValue('invalid json')

      expect(() => service.loadScheduledNotifications()).not.toThrow()
    })
  })
})
