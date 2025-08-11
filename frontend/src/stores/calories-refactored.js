import { createDataStore } from './base/BaseStore.js'
// import { db } from '../services/offline.js'
import { useNotificationsStore } from './notifications.js'

export const useCaloriesStore = createDataStore('calories', {
  initialState: {
    todaysMeals: [],
    todaysCalories: 0,
  },

  storageKey: 'meals',

  getters: {
    // Date-based getters
    mealsByDate: (state) => (date) => {
      const targetDate = new Date(date).toDateString()
      return state.data.filter((meal) => new Date(meal.meal_time).toDateString() === targetDate)
    },

    caloriesByDate: (state) => (date) => {
      const targetDate = new Date(date).toDateString()
      return state.data
        .filter((meal) => new Date(meal.meal_time).toDateString() === targetDate)
        .reduce((total, meal) => total + meal.calories, 0)
    },

    // Time-based aggregations
    weeklyCalories: (state) => {
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      return state.data
        .filter((meal) => new Date(meal.meal_time) >= weekAgo)
        .reduce((total, meal) => total + meal.calories, 0)
    },

    monthlyCalories: (state) => {
      const now = new Date()
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      return state.data
        .filter((meal) => new Date(meal.meal_time) >= monthAgo)
        .reduce((total, meal) => total + meal.calories, 0)
    },

    // Chart data getters
    dailyCaloriesData:
      (state) =>
      (days = 7) => {
        const now = new Date()
        const data = []

        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
          const dateString = date.toDateString()
          const dayCalories = state.data
            .filter((meal) => new Date(meal.meal_time).toDateString() === dateString)
            .reduce((total, meal) => total + meal.calories, 0)

          data.push({
            date: date.toISOString().split('T')[0],
            label: date.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            }),
            calories: dayCalories,
          })
        }

        return data
      },

    weeklyCaloriesData:
      (state) =>
      (weeks = 4) => {
        const now = new Date()
        const data = []

        for (let i = weeks - 1; i >= 0; i--) {
          const weekStart = new Date(now.getTime() - (i * 7 + now.getDay()) * 24 * 60 * 60 * 1000)
          const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000)

          const weekCalories = state.data
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
      },

    monthlyCaloriesData:
      (state) =>
      (months = 6) => {
        const now = new Date()
        const data = []

        for (let i = months - 1; i >= 0; i--) {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)

          const monthCalories = state.data
            .filter((meal) => {
              const mealDate = new Date(meal.meal_time)
              return mealDate >= monthStart && mealDate <= monthEnd
            })
            .reduce((total, meal) => total + meal.calories, 0)

          data.push({
            month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            label: monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            calories: monthCalories,
          })
        }

        return data
      },

    // Today's data
    todaysMeals: (state) => {
      const today = new Date().toDateString()
      return state.data.filter((meal) => new Date(meal.meal_time).toDateString() === today)
    },

    todaysCalories: (state) => {
      const today = new Date().toDateString()
      return state.data
        .filter((meal) => new Date(meal.meal_time).toDateString() === today)
        .reduce((total, meal) => total + meal.calories, 0)
    },

    // Meal statistics
    averageCaloriesPerMeal: (state) => {
      if (state.data.length === 0) return 0
      const totalCalories = state.data.reduce((sum, meal) => sum + meal.calories, 0)
      return Math.round(totalCalories / state.data.length)
    },

    totalMeals: (state) => state.data.length,

    // Recent meals for quick access
    recentMeals:
      (state) =>
      (limit = 5) => {
        return state.data
          .sort((a, b) => new Date(b.meal_time) - new Date(a.meal_time))
          .slice(0, limit)
      },
  },

  actions: {
    // Override loadData to handle today's data
    async loadData() {
      // Load data using base store method
      if (this.storageKey) {
        const stored = await this.loadFromStorage(this.storageKey, [])
        this.data = stored
      }

      // Update today's data
      this.updateTodaysData()
    },

    // Add meal with enhanced functionality
    async addMeal(calories, notes = '', customDateTime = null) {
      const meal = {
        calories: parseInt(calories),
        notes: notes.trim(),
        meal_time: customDateTime || new Date().toISOString(),
      }

      const newMeal = await this.addItem(meal)
      this.updateTodaysData()

      // Schedule meal reminder if enabled
      const notificationsStore = useNotificationsStore()
      if (notificationsStore.isMealNotificationsEnabled) {
        await notificationsStore.scheduleMealReminders()
      }

      return newMeal
    },

    // Update meal
    async updateMeal(id, calories, notes = '', customDateTime = null) {
      const updates = {
        calories: parseInt(calories),
        notes: notes.trim(),
      }

      if (customDateTime) {
        updates.meal_time = customDateTime
      }

      const updatedMeal = await this.updateItem(id, updates)
      this.updateTodaysData()
      return updatedMeal
    },

    // Delete meal
    async deleteMeal(id) {
      const deletedMeal = await this.deleteItem(id)
      this.updateTodaysData()
      return deletedMeal
    },

    // Update today's data (called after data changes)
    updateTodaysData() {
      // this.todaysMeals = this.todaysMeals
      // this.todaysCalories = this.todaysCalories
    },

    // Get meals for a specific date range
    async getMealsByDateRange(startDate, endDate) {
      return this.data.filter((meal) => {
        const mealDate = new Date(meal.meal_time)
        return mealDate >= startDate && mealDate <= endDate
      })
    },

    // Get calorie statistics for a date range
    async getCalorieStats(startDate, endDate) {
      const meals = await this.getMealsByDateRange(startDate, endDate)

      if (meals.length === 0) {
        return {
          totalCalories: 0,
          averageCalories: 0,
          totalMeals: 0,
          daysWithMeals: 0,
        }
      }

      const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0)
      const uniqueDays = new Set(meals.map((meal) => new Date(meal.meal_time).toDateString())).size

      return {
        totalCalories,
        averageCalories: Math.round(totalCalories / meals.length),
        totalMeals: meals.length,
        daysWithMeals: uniqueDays,
      }
    },

    // Export data for backup
    async exportData() {
      return {
        meals: this.data,
        exportDate: new Date().toISOString(),
        totalMeals: this.data.length,
        totalCalories: this.data.reduce((sum, meal) => sum + meal.calories, 0),
      }
    },

    // Import data from backup
    async importData(importData) {
      if (!importData.meals || !Array.isArray(importData.meals)) {
        throw new Error('Invalid import data format')
      }

      // Clear existing data
      await this.clearAllData()

      // Add imported meals
      for (const meal of importData.meals) {
        await this.addMeal(meal.calories, meal.notes || '', meal.meal_time)
      }

      return {
        imported: importData.meals.length,
        totalCalories: importData.meals.reduce((sum, meal) => sum + meal.calories, 0),
      }
    },
  },
})
