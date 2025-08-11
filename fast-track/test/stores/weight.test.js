import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useWeightStore } from '../../src/stores/weight.js'
import { useAuthStore } from '../../src/stores/auth.js'

// Mock the offline service
vi.mock('../../src/services/offline.js', () => ({
  db: {
    weight_entries: {
      toArray: vi.fn().mockResolvedValue([]),
    },
  },
  offlineOperations: {
    addToOffline: vi.fn().mockResolvedValue(1),
    updateOffline: vi.fn().mockResolvedValue(undefined),
    deleteOffline: vi.fn().mockResolvedValue(undefined),
  },
}))

describe('Weight Store', () => {
  let weightStore
  let authStore

  beforeEach(() => {
    setActivePinia(createPinia())
    weightStore = useWeightStore()
    authStore = useAuthStore()

    // Set up auth store with test user
    authStore.user = createMockUser()
    authStore.isAuthenticated = true

    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      expect(weightStore.entries).toEqual([])
      expect(weightStore.isLoading).toBe(false)
      expect(weightStore.error).toBe(null)
    })
  })

  describe('Getters', () => {
    beforeEach(() => {
      // Set up test weight entries
      weightStore.entries = [
        {
          id: 1,
          user_id: 'test-user-123',
          weight: 70.5,
          date: '2024-01-15T10:00:00.000Z',
        },
        {
          id: 2,
          user_id: 'test-user-123',
          weight: 71.0,
          date: '2024-01-14T10:00:00.000Z',
        },
        {
          id: 3,
          user_id: 'test-user-123',
          weight: 70.8,
          date: '2024-01-13T10:00:00.000Z',
        },
      ]
    })

    it('should return latest weight', () => {
      expect(weightStore.latestWeight.weight).toBe(70.5)

      weightStore.entries = []
      expect(weightStore.latestWeight).toBe(null)
    })

    it('should return weight by date correctly', () => {
      const jan15Weight = weightStore.weightByDate('2024-01-15T10:00:00.000Z')
      expect(jan15Weight).toBe(70.5)

      const jan14Weight = weightStore.weightByDate('2024-01-14T10:00:00.000Z')
      expect(jan14Weight).toBe(71.0)

      const noWeight = weightStore.weightByDate('2024-01-01T10:00:00.000Z')
      expect(noWeight).toBe(null)
    })

    it('should return weekly weight data', () => {
      const weeklyData = weightStore.weeklyWeightData(4)
      expect(Array.isArray(weeklyData)).toBe(true)
      expect(weeklyData.length).toBeGreaterThan(0)
    })

    it('should return daily weight data', () => {
      const dailyData = weightStore.dailyWeightData(30)
      expect(Array.isArray(dailyData)).toBe(true)
      expect(dailyData.length).toBeGreaterThan(0)
    })

    it('should return weight trend', () => {
      const trend = weightStore.weightTrend

      expect(trend).toHaveProperty('direction')
      expect(trend).toHaveProperty('change')
      expect(['up', 'down', 'stable']).toContain(trend.direction)
    })
  })

  describe('Actions', () => {
    describe('loadWeightEntries', () => {
      it('should load weight entries from offline storage', async () => {
        const { db } = await import('../../src/services/offline.js')
        const mockEntries = [
          { id: 1, weight: 70.5, date: '2024-01-15T10:00:00.000Z' },
          { id: 2, weight: 71.0, date: '2024-01-14T10:00:00.000Z' },
        ]
        db.weight_entries.toArray.mockResolvedValue(mockEntries)

        await weightStore.loadWeightEntries()

        expect(weightStore.entries).toEqual(mockEntries)
        expect(weightStore.isLoading).toBe(false)
      })

      it('should handle loading errors', async () => {
        const { db } = await import('../../src/services/offline.js')
        db.weight_entries.toArray.mockRejectedValue(new Error('Database error'))

        await weightStore.loadWeightEntries()

        expect(weightStore.error).toBe('Database error')
        expect(weightStore.isLoading).toBe(false)
      })
    })

    describe('addWeightEntry', () => {
      it('should add a new weight entry', async () => {
        const { offlineOperations } = await import('../../src/services/offline.js')

        const result = await weightStore.addWeightEntry(69.5)

        expect(result.weight).toBe(69.5)
        expect(result.user_id).toBe('test-user-123')
        expect(weightStore.entries.length).toBe(1)
        expect(weightStore.entries[0].weight).toBe(69.5)
        expect(offlineOperations.addToOffline).toHaveBeenCalled()
      })

      it('should add entry with custom date', async () => {
        const { offlineOperations } = await import('../../src/services/offline.js')
        const customDate = new Date('2024-01-16T10:00:00.000Z')

        const result = await weightStore.addWeightEntry(69.5, customDate)

        expect(result.weight).toBe(69.5)
        expect(result.date).toBe(customDate.toISOString())
        expect(offlineOperations.addToOffline).toHaveBeenCalled()
      })

      it('should handle add entry errors', async () => {
        const { offlineOperations } = await import('../../src/services/offline.js')
        offlineOperations.addToOffline.mockRejectedValue(new Error('Save failed'))

        await expect(weightStore.addWeightEntry(69.5)).rejects.toThrow('Save failed')
        expect(weightStore.error).toBe('Save failed')
      })
    })

    describe('updateWeightEntry', () => {
      beforeEach(() => {
        weightStore.entries = [
          {
            id: 1,
            user_id: 'test-user-123',
            weight: 70.5,
            date: '2024-01-15T10:00:00.000Z',
          },
        ]
      })

      it('should update an existing weight entry', async () => {
        const { offlineOperations } = await import('../../src/services/offline.js')
        const updates = { weight: 71.5 }

        const result = await weightStore.updateWeightEntry(1, updates)

        expect(result.weight).toBe(71.5)
        expect(weightStore.entries[0].weight).toBe(71.5)
        expect(offlineOperations.updateOffline).toHaveBeenCalled()
      })

      it('should handle entry not found', async () => {
        await expect(weightStore.updateWeightEntry(999, { weight: 71.5 })).rejects.toThrow(
          'Weight entry not found',
        )
      })

      it('should handle update entry errors', async () => {
        const { offlineOperations } = await import('../../src/services/offline.js')
        offlineOperations.updateOffline.mockRejectedValue(new Error('Update failed'))

        await expect(weightStore.updateWeightEntry(1, { weight: 71.5 })).rejects.toThrow(
          'Update failed',
        )
        expect(weightStore.error).toBe('Update failed')
      })
    })

    describe('deleteWeightEntry', () => {
      beforeEach(() => {
        weightStore.entries = [
          {
            id: 1,
            user_id: 'test-user-123',
            weight: 70.5,
            date: '2024-01-15T10:00:00.000Z',
          },
          {
            id: 2,
            user_id: 'test-user-123',
            weight: 71.0,
            date: '2024-01-14T10:00:00.000Z',
          },
        ]
      })

      it('should delete a weight entry', async () => {
        const { offlineOperations } = await import('../../src/services/offline.js')

        await weightStore.deleteWeightEntry(1)

        expect(weightStore.entries).toHaveLength(1)
        expect(weightStore.entries.find((e) => e.id === 1)).toBeUndefined()
        expect(offlineOperations.deleteOffline).toHaveBeenCalledWith('weight_entries', 1)
      })

      it('should handle entry not found', async () => {
        await expect(weightStore.deleteWeightEntry(999)).rejects.toThrow('Weight entry not found')
      })

      it('should handle delete entry errors', async () => {
        const { offlineOperations } = await import('../../src/services/offline.js')
        offlineOperations.deleteOffline.mockRejectedValue(new Error('Delete failed'))

        await expect(weightStore.deleteWeightEntry(1)).rejects.toThrow('Delete failed')
        expect(weightStore.error).toBe('Delete failed')
      })
    })

    describe('clearError', () => {
      it('should clear the error state', () => {
        weightStore.error = 'Test error'

        weightStore.clearError()

        expect(weightStore.error).toBe(null)
      })
    })
  })

  describe('Data Export', () => {
    beforeEach(() => {
      weightStore.entries = [
        {
          id: 1,
          weight: 70.5,
          date: '2024-01-15T10:00:00.000Z',
        },
        {
          id: 2,
          weight: 71.0,
          date: '2024-01-14T10:00:00.000Z',
        },
      ]
    })

    it('should export weight data to CSV format', () => {
      const csvData = weightStore.exportData('csv')

      expect(csvData).toContain('Date,Weight')
      expect(csvData).toContain('70.5')
      expect(csvData).toContain('71') // CSV export shows 71 not 71.0
    })

    it('should export weight data to JSON format', () => {
      const jsonData = weightStore.exportData('json')
      const parsed = JSON.parse(jsonData)

      expect(parsed).toHaveLength(2)
      // Data is sorted by date, so 2024-01-14 comes first, then 2024-01-15
      expect(parsed[0]).toHaveProperty('weight', 71.0)
      expect(parsed[1]).toHaveProperty('weight', 70.5)
    })
  })
})
