import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFastingStore } from '../../src/stores/fasting.js'
import { useAuthStore } from '../../src/stores/auth.js'

// Mock the offline service
vi.mock('../../src/services/offline.js', () => ({
  db: {
    fasting_schedules: {
      toArray: vi.fn().mockResolvedValue([]),
    },
    fasting_sessions: {
      toArray: vi.fn().mockResolvedValue([]),
    },
  },
  offlineOperations: {
    addToOffline: vi.fn().mockResolvedValue(1),
    updateOffline: vi.fn().mockResolvedValue(undefined),
  },
}))

// Mock the notifications store
vi.mock('../../src/stores/notifications.js', () => ({
  useNotificationsStore: () => ({
    isFastingNotificationsEnabled: true,
    scheduleFastingNotifications: vi.fn(),
    notifyFastingStart: vi.fn(),
    clearFastingNotifications: vi.fn(),
    notifyFastingEnd: vi.fn(),
  }),
}))

describe('Fasting Store', () => {
  let fastingStore
  let authStore

  beforeEach(() => {
    setActivePinia(createPinia())
    fastingStore = useFastingStore()
    authStore = useAuthStore()

    // Set up auth store with test user
    authStore.user = createMockUser()
    authStore.isAuthenticated = true

    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      expect(fastingStore.currentSession).toBe(null)
      expect(fastingStore.activeSchedule).toBe(null)
      expect(fastingStore.schedules).toEqual([])
      expect(fastingStore.sessions).toEqual([])
      expect(fastingStore.presetSchedules).toHaveLength(4)
      expect(fastingStore.isLoading).toBe(false)
      expect(fastingStore.error).toBe(null)
    })
  })

  describe('Getters', () => {
    beforeEach(() => {
      // Set up a current fasting session
      fastingStore.currentSession = {
        id: 1,
        user_id: 'test-user-123',
        start_time: '2024-01-15T08:00:00.000Z',
        planned_end_time: '2024-01-16T00:00:00.000Z',
        planned_duration: 16,
        status: 'active',
      }
    })

    it('should return correct isFasting status', () => {
      expect(fastingStore.isFasting).toBe(true)

      fastingStore.currentSession = null
      expect(fastingStore.isFasting).toBe(false)
    })

    it('should calculate fastingTimeElapsed correctly', () => {
      const elapsed = fastingStore.fastingTimeElapsed
      expect(elapsed).toBeGreaterThan(0)

      fastingStore.currentSession = null
      expect(fastingStore.fastingTimeElapsed).toBe(0)
    })

    it('should calculate fastingTimeRemaining correctly', () => {
      const remaining = fastingStore.fastingTimeRemaining
      expect(remaining).toBeGreaterThan(0)

      fastingStore.currentSession = null
      expect(fastingStore.fastingTimeRemaining).toBe(0)
    })

    it('should calculate fastingProgress correctly', () => {
      const progress = fastingStore.fastingProgress
      expect(progress).toBeGreaterThanOrEqual(0)
      expect(progress).toBeLessThanOrEqual(100)

      fastingStore.currentSession = null
      expect(fastingStore.fastingProgress).toBe(0)
    })

    it('should return todaysSessions correctly', () => {
      const today = new Date().toDateString()
      fastingStore.sessions = [
        { id: 1, start_time: new Date().toISOString(), status: 'completed' },
        { id: 2, start_time: '2024-01-01T08:00:00.000Z', status: 'completed' },
      ]

      const todaySessions = fastingStore.todaysSessions
      expect(todaySessions).toHaveLength(1)
      expect(todaySessions[0].id).toBe(1)
    })

    it('should return completedSessions correctly', () => {
      fastingStore.sessions = [
        { id: 1, status: 'completed' },
        { id: 2, status: 'active' },
        { id: 3, status: 'completed' },
      ]

      const completed = fastingStore.completedSessions
      expect(completed).toHaveLength(2)
    })
  })

  describe('Actions', () => {
    describe('loadFastingData', () => {
      it('should load fasting data from offline storage', async () => {
        const { db } = await import('../../src/services/offline.js')
        const mockSchedules = [{ id: 1, name: 'Test Schedule', is_active: true }]
        const mockSessions = [{ id: 1, status: 'active' }]

        db.fasting_schedules.toArray.mockResolvedValue(mockSchedules)
        db.fasting_sessions.toArray.mockResolvedValue(mockSessions)

        await fastingStore.loadFastingData()

        expect(fastingStore.schedules).toEqual(mockSchedules)
        expect(fastingStore.sessions).toEqual(mockSessions)
        expect(fastingStore.currentSession).toEqual(mockSessions[0])
        expect(fastingStore.activeSchedule).toEqual(mockSchedules[0])
        expect(fastingStore.isLoading).toBe(false)
      })

      it('should handle loading errors', async () => {
        const { db } = await import('../../src/services/offline.js')
        db.fasting_schedules.toArray.mockRejectedValue(new Error('Database error'))

        await fastingStore.loadFastingData()

        expect(fastingStore.error).toBe('Database error')
        expect(fastingStore.isLoading).toBe(false)
      })
    })

    describe('createSchedule', () => {
      it('should create a new fasting schedule', async () => {
        const { offlineOperations } = await import('../../src/services/offline.js')
        const scheduleData = {
          name: '16:8 Custom',
          fastingHours: 16,
          eatingHours: 8,
          setAsActive: true,
        }

        const result = await fastingStore.createSchedule(scheduleData)

        expect(result.name).toBe('16:8 Custom')
        expect(result.user_id).toBe('test-user-123')
        expect(fastingStore.schedules.length).toBe(1)
        expect(fastingStore.schedules[0].name).toBe('16:8 Custom')
        expect(offlineOperations.addToOffline).toHaveBeenCalled()
      })
    })

    describe('startFast', () => {
      it('should start a new fasting session', async () => {
        const { offlineOperations } = await import('../../src/services/offline.js')

        const result = await fastingStore.startFast(16)

        expect(result.planned_duration).toBe(16)
        expect(result.status).toBe('active')
        expect(fastingStore.currentSession).toEqual(result)
        expect(offlineOperations.addToOffline).toHaveBeenCalled()
      })

      it('should handle start fasting errors', async () => {
        const { offlineOperations } = await import('../../src/services/offline.js')
        offlineOperations.addToOffline.mockRejectedValue(new Error('Save failed'))

        await expect(fastingStore.startFast(16)).rejects.toThrow('Save failed')
        expect(fastingStore.error).toBe('Save failed')
      })
    })

    describe('endFast', () => {
      beforeEach(() => {
        fastingStore.currentSession = {
          id: 1,
          user_id: 'test-user-123',
          start_time: '2024-01-15T08:00:00.000Z',
          planned_end_time: '2024-01-16T00:00:00.000Z',
          planned_duration: 16,
          status: 'active',
        }
        fastingStore.sessions = [fastingStore.currentSession]
      })

      it('should end the current fasting session', async () => {
        const { offlineOperations } = await import('../../src/services/offline.js')

        const result = await fastingStore.endFast()

        expect(result.status).toBe('completed')
        expect(result.end_time).toBeTruthy()
        expect(fastingStore.currentSession).toBe(null)
        expect(offlineOperations.updateOffline).toHaveBeenCalled()
      })

      it('should handle no active session', async () => {
        fastingStore.currentSession = null

        await expect(fastingStore.endFast()).rejects.toThrow('No active fasting session')
      })

      it('should handle end fasting errors', async () => {
        const { offlineOperations } = await import('../../src/services/offline.js')
        offlineOperations.updateOffline.mockRejectedValue(new Error('Save failed'))

        await expect(fastingStore.endFast()).rejects.toThrow('Save failed')
        expect(fastingStore.error).toBe('Save failed')
      })
    })

    describe('clearError', () => {
      it('should clear the error state', () => {
        fastingStore.error = 'Test error'

        fastingStore.clearError()

        expect(fastingStore.error).toBe(null)
      })
    })
  })

  describe('Timer Management', () => {
    beforeEach(() => {
      fastingStore.currentSession = {
        id: 1,
        status: 'active',
        start_time: '2024-01-15T08:00:00.000Z',
        planned_duration: 16,
      }
    })

    it('should have timer management methods', () => {
      expect(typeof fastingStore.startTimer).toBe('function')
      expect(typeof fastingStore.stopTimer).toBe('function')
      expect(typeof fastingStore.updateCurrentTime).toBe('function')
    })
  })
})
