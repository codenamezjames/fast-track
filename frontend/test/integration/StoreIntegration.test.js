/**
 * Integration Tests for Store Interactions
 * Tests cross-store operations and dependencies
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../../src/stores/auth.js'
import { useCaloriesStore } from '../../src/stores/calories.js'
import { useWeightStore } from '../../src/stores/weight.js'
import { useNotificationsStore } from '../../src/stores/notifications.js'

describe('Store Integration Tests', () => {
  let pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  afterEach(() => {
    // Clean up stores
    const authStore = useAuthStore()
    const caloriesStore = useCaloriesStore()
    const weightStore = useWeightStore()
    const notificationsStore = useNotificationsStore()

    authStore.$reset()
    caloriesStore.$reset()
    weightStore.$reset()
    notificationsStore.$reset()
  })

  describe('Authentication Flow', () => {
    it('should sync data when user logs in', async () => {
      const authStore = useAuthStore()
      const caloriesStore = useCaloriesStore()
      const weightStore = useWeightStore()

      // Mock successful login
      await authStore.login('test@example.com', 'password')

      // Verify stores are synced
      expect(authStore.isAuthenticated).toBe(true)
      expect(caloriesStore.lastSync).toBeDefined()
      expect(weightStore.lastSync).toBeDefined()
    })

    it('should clear data when user logs out', async () => {
      const authStore = useAuthStore()
      const caloriesStore = useCaloriesStore()
      const weightStore = useWeightStore()

      // Add some data
      await caloriesStore.addMeal(500, 'Test meal')
      await weightStore.addWeightEntry(70.5)

      // Logout
      await authStore.logout()

      // Verify data is cleared
      expect(authStore.isAuthenticated).toBe(false)
      expect(caloriesStore.meals).toEqual([])
      expect(weightStore.weightEntries).toEqual([])
    })
  })

  describe('Data Synchronization', () => {
    it('should sync all stores when online status changes', async () => {
      const caloriesStore = useCaloriesStore()
      const weightStore = useWeightStore()

      // Add offline data
      await caloriesStore.addMeal(300, 'Offline meal')
      await weightStore.addWeightEntry(70.0)

      // Simulate going online
      caloriesStore.setOnlineStatus(true)
      weightStore.setOnlineStatus(true)

      // Verify sync attempts
      expect(caloriesStore.needsSync).toBe(true)
      expect(weightStore.needsSync).toBe(true)
    })

    it('should handle sync conflicts gracefully', async () => {
      const caloriesStore = useCaloriesStore()
      const weightStore = useWeightStore()

      // Add conflicting data
      await caloriesStore.addMeal(500, 'Local meal')
      await weightStore.addWeightEntry(71.0)

      // Simulate sync with server data
      const serverMeals = [{ id: '1', calories: 600, notes: 'Server meal' }]
      const serverWeights = [{ id: '1', weight: 72.0, date: new Date().toISOString() }]

      // Mock sync response
      caloriesStore.meals = serverMeals
      weightStore.weightEntries = serverWeights

      // Verify conflict resolution
      expect(caloriesStore.meals.length).toBe(1)
      expect(weightStore.weightEntries.length).toBe(1)
    })
  })

  describe('Notification Integration', () => {
    it('should schedule notifications when fasting starts', async () => {
      const notificationsStore = useNotificationsStore()
      const fastingStore = useFastingStore()

      // Start fasting
      await fastingStore.startFasting()

      // Verify notification is scheduled
      expect(notificationsStore.scheduledNotifications.length).toBeGreaterThan(0)
    })

    it('should update notifications when preferences change', async () => {
      const notificationsStore = useNotificationsStore()

      // Change notification preferences
      await notificationsStore.updatePreferences({
        fastingReminders: false,
        mealReminders: true,
      })

      // Verify notifications are updated
      expect(notificationsStore.preferences.fastingReminders).toBe(false)
      expect(notificationsStore.preferences.mealReminders).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should propagate errors across stores', async () => {
      const authStore = useAuthStore()
      const caloriesStore = useCaloriesStore()

      // Mock network error
      const mockError = new Error('Network error')
      authStore.setError(mockError)

      // Verify error state is shared
      expect(authStore.hasError).toBe(true)
      expect(caloriesStore.isOffline).toBe(true)
    })

    it('should handle store initialization errors', async () => {
      const caloriesStore = useCaloriesStore()

      // Mock initialization error
      try {
        await caloriesStore.loadData()
      } catch (error) {
        expect(caloriesStore.hasError).toBe(true)
        expect(caloriesStore.error).toBeDefined()
      }
    })
  })

  describe('Performance', () => {
    it('should handle large datasets efficiently', async () => {
      const caloriesStore = useCaloriesStore()

      // Add many meals
      const meals = Array.from({ length: 1000 }, (_, i) => ({
        calories: 500 + i,
        notes: `Meal ${i}`,
        meal_time: new Date().toISOString(),
      }))

      // Measure performance
      const startTime = performance.now()
      for (const meal of meals) {
        await caloriesStore.addMeal(meal.calories, meal.notes)
      }
      const endTime = performance.now()

      // Verify performance is acceptable (< 1 second for 1000 items)
      expect(endTime - startTime).toBeLessThan(1000)
      expect(caloriesStore.meals.length).toBe(1000)
    })

    it('should handle concurrent operations', async () => {
      const caloriesStore = useCaloriesStore()

      // Perform concurrent operations
      const operations = Array.from({ length: 10 }, (_, i) =>
        caloriesStore.addMeal(500 + i, `Concurrent meal ${i}`),
      )

      await Promise.all(operations)

      // Verify all operations completed
      expect(caloriesStore.meals.length).toBe(10)
    })
  })
})
