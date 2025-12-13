import { defineStore } from 'pinia'
import { db, offlineOperations } from '../services/offline.js'
import { useAuthStore } from './auth.js'
import { useNotificationsStore } from './notifications.js'
// TODO: import { databases } from '../services/appwrite.js' // Will be used for sync later

export const useCaloriesStore = defineStore('calories', {
  state: () => ({
    meals: [],
    todaysMeals: [],
    todaysCalories: 0,
    isLoading: false,
    error: null,
  }),

  getters: {
    mealsByDate: (state) => {
      return (date) => {
        const targetDate = new Date(date).toDateString()
        return state.meals.filter((meal) => new Date(meal.meal_time).toDateString() === targetDate)
      }
    },

    caloriesByDate: (state) => {
      return (date) => {
        const targetDate = new Date(date).toDateString()
        return state.meals
          .filter((meal) => new Date(meal.meal_time).toDateString() === targetDate)
          .reduce((total, meal) => total + meal.calories, 0)
      }
    },

    weeklyCalories: (state) => {
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      return state.meals
        .filter((meal) => new Date(meal.meal_time) >= weekAgo)
        .reduce((total, meal) => total + meal.calories, 0)
    },

    // New getters for chart data
    dailyCaloriesData: (state) => {
      return (days = 7) => {
        const now = new Date()
        const data = []

        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
          const dateString = date.toDateString()
          const dayCalories = state.meals
            .filter((meal) => new Date(meal.meal_time).toDateString() === dateString)
            .reduce((total, meal) => total + meal.calories, 0)

          data.push({
            date: date.toISOString().split('T')[0], // YYYY-MM-DD format
            label: date.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            }),
            calories: dayCalories,
          })
        }

        return data
      }
    },

    weeklyCaloriesData: (state) => {
      return (weeks = 4) => {
        const now = new Date()
        const data = []

        for (let i = weeks - 1; i >= 0; i--) {
          const weekStart = new Date(now.getTime() - (i * 7 + now.getDay()) * 24 * 60 * 60 * 1000)
          const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000)

          const weekCalories = state.meals
            .filter((meal) => {
              const mealDate = new Date(meal.meal_time)
              return mealDate >= weekStart && mealDate <= weekEnd
            })
            .reduce((total, meal) => total + meal.calories, 0)

          data.push({
            week: `Week ${weeks - i}`,
            label: `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
            calories: weekCalories,
          })
        }

        return data
      }
    },

    monthlyCaloriesData: (state) => {
      return (months = 6) => {
        const now = new Date()
        const data = []

        for (let i = months - 1; i >= 0; i--) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
          const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)

          const monthCalories = state.meals
            .filter((meal) => {
              const mealDate = new Date(meal.meal_time)
              return mealDate >= monthStart && mealDate <= monthEnd
            })
            .reduce((total, meal) => total + meal.calories, 0)

          data.push({
            month: monthDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
            label: monthDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
            calories: monthCalories,
          })
        }

        return data
      }
    },

    averageDailyCalories: (state) => {
      return (days = 30) => {
        const now = new Date()
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

        const totalCalories = state.meals
          .filter((meal) => new Date(meal.meal_time) >= startDate)
          .reduce((total, meal) => total + meal.calories, 0)

        return Math.round(totalCalories / days)
      }
    },

    caloriesByDateRange: (state) => {
      return (startDate, endDate) => {
        const start = new Date(startDate)
        const end = new Date(endDate)

        return state.meals
          .filter((meal) => {
            const mealDate = new Date(meal.meal_time)
            return mealDate >= start && mealDate <= end
          })
          .reduce((total, meal) => total + meal.calories, 0)
      }
    },
  },

  actions: {
    async loadMeals() {
      this.isLoading = true
      try {
        // Load from offline storage first
        this.meals = await db.meals.toArray()
        this.updateTodaysData()

        // Try to sync with server if online
        await this.syncMeals()
      } catch (error) {
        this.error = error.message
        // Initialize empty array on error to prevent undefined issues
        this.meals = []
      } finally {
        this.isLoading = false
      }
    },

    async addMeal(calories, notes = '', customDateTime = null) {
      const authStore = useAuthStore()
      const notificationsStore = useNotificationsStore()
      const mealTime = customDateTime
        ? new Date(customDateTime).toISOString()
        : new Date().toISOString()

      const mealData = {
        user_id: authStore.userId,
        calories: parseInt(calories),
        meal_time: mealTime,
        notes: notes.trim(),
      }

      try {
        // Add to offline storage first
        const id = await offlineOperations.addToOffline('meals', mealData)

        // Add to local state
        const newMeal = { id, ...mealData, synced: false }
        this.meals.push(newMeal)
        this.updateTodaysData()

        // Reschedule meal reminders (they reset daily)
        if (notificationsStore.isMealNotificationsEnabled) {
          await notificationsStore.scheduleMealReminders()
        }

        // Try to sync immediately if online
        await this.syncMeals()

        return newMeal
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async updateMeal(id, calories, notes = '', customDateTime = null) {
      const mealData = {
        calories: parseInt(calories),
        notes: notes.trim(),
      }

      // Add meal_time if provided
      if (customDateTime) {
        mealData.meal_time = new Date(customDateTime).toISOString()
      }

      try {
        // Update in offline storage
        await offlineOperations.updateOffline('meals', id, mealData)

        // Update local state
        const mealIndex = this.meals.findIndex((meal) => meal.id === id)
        if (mealIndex !== -1) {
          this.meals[mealIndex] = {
            ...this.meals[mealIndex],
            ...mealData,
            synced: false,
          }
          this.updateTodaysData()
        }

        // Try to sync immediately if online
        await this.syncMeals()
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async deleteMeal(id) {
      try {
        // Delete from offline storage
        await offlineOperations.deleteOffline('meals', id)

        // Remove from local state
        this.meals = this.meals.filter((meal) => meal.id !== id)
        this.updateTodaysData()

        // Try to sync immediately if online
        await this.syncMeals()
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    updateTodaysData() {
      const today = new Date().toDateString()
      this.todaysMeals = this.meals.filter(
        (meal) => new Date(meal.meal_time).toDateString() === today,
      )
      this.todaysCalories = this.todaysMeals.reduce((total, meal) => total + meal.calories, 0)
    },

    async syncMeals() {
      // Skip sync for now - pure offline mode
      // TODO: Implement Appwrite sync when needed
      return
    },

    clearError() {
      this.error = null
    },

    async clearAllData() {
      this.isLoading = true
      try {
        // Clear from offline storage
        await db.meals.clear()
        
        // Clear local state
        this.meals = []
        this.todaysMeals = []
        this.todaysCalories = 0
        
        // Clear any errors
        this.error = null
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },
  },
})
