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
    error: null
  }),

  getters: {
    mealsByDate: (state) => {
      return (date) => {
        const targetDate = new Date(date).toDateString()
        return state.meals.filter(meal => 
          new Date(meal.meal_time).toDateString() === targetDate
        )
      }
    },

    caloriesByDate: (state) => {
      return (date) => {
        const targetDate = new Date(date).toDateString()
        return state.meals
          .filter(meal => new Date(meal.meal_time).toDateString() === targetDate)
          .reduce((total, meal) => total + meal.calories, 0)
      }
    },

    weeklyCalories: (state) => {
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      return state.meals
        .filter(meal => new Date(meal.meal_time) >= weekAgo)
        .reduce((total, meal) => total + meal.calories, 0)
    }
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
        console.error('Error loading meals:', error)
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
      const mealTime = customDateTime ? new Date(customDateTime).toISOString() : new Date().toISOString()
      
      const mealData = {
        user_id: authStore.userId,
        calories: parseInt(calories),
        meal_time: mealTime,
        notes: notes.trim()
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
        console.error('Error adding meal:', error)
        this.error = error.message
        throw error
      }
    },

    async updateMeal(id, calories, notes = '') {
      const mealData = {
        calories: parseInt(calories),
        notes: notes.trim()
      }

      try {
        // Update in offline storage
        await offlineOperations.updateOffline('meals', id, mealData)
        
        // Update local state
        const mealIndex = this.meals.findIndex(meal => meal.id === id)
        if (mealIndex !== -1) {
          this.meals[mealIndex] = { 
            ...this.meals[mealIndex], 
            ...mealData, 
            synced: false 
          }
          this.updateTodaysData()
        }

        // Try to sync immediately if online
        await this.syncMeals()
      } catch (error) {
        console.error('Error updating meal:', error)
        this.error = error.message
        throw error
      }
    },

    async deleteMeal(id) {
      try {
        // Delete from offline storage
        await offlineOperations.deleteOffline('meals', id)
        
        // Remove from local state
        this.meals = this.meals.filter(meal => meal.id !== id)
        this.updateTodaysData()

        // Try to sync immediately if online
        await this.syncMeals()
      } catch (error) {
        console.error('Error deleting meal:', error)
        this.error = error.message
        throw error
      }
    },

    updateTodaysData() {
      const today = new Date().toDateString()
      this.todaysMeals = this.meals.filter(meal => 
        new Date(meal.meal_time).toDateString() === today
      )
      this.todaysCalories = this.todaysMeals.reduce(
        (total, meal) => total + meal.calories, 0
      )
    },

    async syncMeals() {
      // Skip sync for now - pure offline mode
      // TODO: Implement Appwrite sync when needed
      console.log('Running in offline mode - sync disabled')
      return
    },

    clearError() {
      this.error = null
    }
  }
}) 