import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCaloriesStore } from '../../src/stores/calories.js'
import { useAuthStore } from '../../src/stores/auth.js'

// Mock the offline service
vi.mock('../../src/services/offline.js', () => ({
  db: {
    meals: {
      toArray: vi.fn(() => Promise.resolve([])),
      add: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
  offlineOperations: {
    addToOffline: vi.fn((table, data) => Promise.resolve(Math.floor(Math.random() * 1000))),
    updateOffline: vi.fn(),
    deleteOffline: vi.fn(),
  },
}))

describe('Calories Store', () => {
  let caloriesStore
  let authStore

  beforeEach(() => {
    setActivePinia(createPinia())
    caloriesStore = useCaloriesStore()
    authStore = useAuthStore()

    // Set up auth store with test user
    authStore.user = createMockUser()
    authStore.isAuthenticated = true

    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      expect(caloriesStore.meals).toEqual([])
      expect(caloriesStore.todaysMeals).toEqual([])
      expect(caloriesStore.todaysCalories).toBe(0)
      expect(caloriesStore.isLoading).toBe(false)
      expect(caloriesStore.error).toBe(null)
    })
  })

  describe('Getters', () => {
    beforeEach(() => {
      // Set up test meals with explicit data
      caloriesStore.meals = [
        {
          id: 1,
          user_id: 'test-user-123',
          calories: 300,
          meal_time: '2024-01-15T08:00:00.000Z',
          notes: 'Breakfast',
          synced: false,
        },
        {
          id: 2,
          user_id: 'test-user-123',
          calories: 500,
          meal_time: '2024-01-15T12:00:00.000Z',
          notes: 'Lunch',
          synced: false,
        },
        {
          id: 3,
          user_id: 'test-user-123',
          calories: 400,
          meal_time: '2024-01-14T19:00:00.000Z',
          notes: 'Dinner',
          synced: false,
        },
      ]
    })

    it('should get meals by date correctly', () => {
      // Verify meals are set correctly
      expect(caloriesStore.meals).toHaveLength(3)

      // Use the correct date format that matches the meal times in our test data
      const jan15DateString = new Date('2024-01-15T08:00:00.000Z').toDateString() // "Mon Jan 15 2024"
      const jan14DateString = new Date('2024-01-14T19:00:00.000Z').toDateString() // "Sun Jan 14 2024"

      const todaysMeals = caloriesStore.mealsByDate(jan15DateString)
      const yesterdaysMeals = caloriesStore.mealsByDate(jan14DateString)

      expect(todaysMeals).toHaveLength(2)
      expect(todaysMeals[0].calories).toBe(300)
      expect(todaysMeals[1].calories).toBe(500)

      expect(yesterdaysMeals).toHaveLength(1)
      expect(yesterdaysMeals[0].calories).toBe(400)
    })

    it('should calculate calories by date correctly', () => {
      // Verify meals are set correctly
      expect(caloriesStore.meals).toHaveLength(3)

      // Use the correct date format that matches the meal times in our test data
      const jan15DateString = new Date('2024-01-15T08:00:00.000Z').toDateString() // "Mon Jan 15 2024"
      const jan14DateString = new Date('2024-01-14T19:00:00.000Z').toDateString() // "Sun Jan 14 2024"

      const todaysCalories = caloriesStore.caloriesByDate(jan15DateString)
      const yesterdaysCalories = caloriesStore.caloriesByDate(jan14DateString)

      expect(todaysCalories).toBe(800) // 300 + 500
      expect(yesterdaysCalories).toBe(400)
    })

    it('should calculate weekly calories correctly', () => {
      const weeklyCalories = caloriesStore.weeklyCalories
      expect(weeklyCalories).toBe(1200) // All meals within a week
    })
  })

  describe('Actions', () => {
    describe('loadMeals', () => {
      it('should load meals from offline storage', async () => {
        const mockMeals = [createMockMeal(), createMockMeal()]
        const { db } = await import('../../src/services/offline.js')
        db.meals.toArray.mockResolvedValue(mockMeals)

        await caloriesStore.loadMeals()

        expect(caloriesStore.meals).toEqual(mockMeals)
        expect(caloriesStore.isLoading).toBe(false)
      })

      it('should handle loading errors', async () => {
        const { db } = await import('../../src/services/offline.js')
        db.meals.toArray.mockRejectedValue(new Error('Database error'))

        await caloriesStore.loadMeals()

        expect(caloriesStore.error).toBe('Database error')
        expect(caloriesStore.isLoading).toBe(false)
      })
    })

    describe('addMeal', () => {
      it('should add a meal successfully', async () => {
        const { offlineOperations } = await import('../../src/services/offline.js')
        offlineOperations.addToOffline.mockResolvedValue(123)

        const result = await caloriesStore.addMeal(500, 'Test meal')

        expect(result).toEqual({
          id: 123,
          user_id: 'test-user-123',
          calories: 500,
          meal_time: expect.any(String),
          notes: 'Test meal',
          synced: false,
        })

        expect(caloriesStore.meals).toHaveLength(1)
        expect(offlineOperations.addToOffline).toHaveBeenCalledWith('meals', {
          user_id: 'test-user-123',
          calories: 500,
          meal_time: expect.any(String),
          notes: 'Test meal',
        })
      })

      it('should handle adding meal with no notes', async () => {
        await caloriesStore.addMeal(300)

        expect(caloriesStore.meals[0].notes).toBe('')
      })

      it('should handle add meal errors', async () => {
        const { offlineOperations } = await import('../../src/services/offline.js')
        offlineOperations.addToOffline.mockRejectedValue(new Error('Add failed'))

        await expect(caloriesStore.addMeal(500)).rejects.toThrow('Add failed')
        expect(caloriesStore.error).toBe('Add failed')
      })
    })

    describe('updateMeal', () => {
      beforeEach(() => {
        caloriesStore.meals = [createMockMeal({ id: 1, calories: 300 })]
      })

      it('should update a meal successfully', async () => {
        await caloriesStore.updateMeal(1, 600, 'Updated meal')

        const updatedMeal = caloriesStore.meals[0]
        expect(updatedMeal.calories).toBe(600)
        expect(updatedMeal.notes).toBe('Updated meal')
        expect(updatedMeal.synced).toBe(false)
      })

      it('should handle update meal errors', async () => {
        const { offlineOperations } = await import('../../src/services/offline.js')
        offlineOperations.updateOffline.mockRejectedValue(new Error('Update failed'))

        await expect(caloriesStore.updateMeal(1, 600)).rejects.toThrow('Update failed')
        expect(caloriesStore.error).toBe('Update failed')
      })
    })

    describe('deleteMeal', () => {
      beforeEach(() => {
        caloriesStore.meals = [createMockMeal({ id: 1 }), createMockMeal({ id: 2 })]
      })

      it('should delete a meal successfully', async () => {
        await caloriesStore.deleteMeal(1)

        expect(caloriesStore.meals).toHaveLength(1)
        expect(caloriesStore.meals[0].id).toBe(2)
      })

      it('should handle delete meal errors', async () => {
        const { offlineOperations } = await import('../../src/services/offline.js')
        offlineOperations.deleteOffline.mockRejectedValue(new Error('Delete failed'))

        await expect(caloriesStore.deleteMeal(1)).rejects.toThrow('Delete failed')
        expect(caloriesStore.error).toBe('Delete failed')
      })
    })

    describe('updateTodaysData', () => {
      it('should update todays meals and calories', () => {
        caloriesStore.meals = [
          createMockMeal({
            calories: 300,
            meal_time: '2024-01-15T08:00:00.000Z',
          }),
          createMockMeal({
            calories: 500,
            meal_time: '2024-01-15T12:00:00.000Z',
          }),
          createMockMeal({
            calories: 400,
            meal_time: '2024-01-14T19:00:00.000Z',
          }),
        ]

        caloriesStore.updateTodaysData()

        expect(caloriesStore.todaysMeals).toHaveLength(2)
        expect(caloriesStore.todaysCalories).toBe(800)
      })
    })

    describe('clearError', () => {
      it('should clear the error state', () => {
        caloriesStore.error = 'Some error'
        caloriesStore.clearError()
        expect(caloriesStore.error).toBe(null)
      })
    })
  })
})
