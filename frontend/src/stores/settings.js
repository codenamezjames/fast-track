import { defineStore } from 'pinia'
import { db } from '../services/offline.js'
import { useAuthStore } from './auth.js'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    // Goals
    calorieGoal: 2000,
    weightGoal: null, // in kg
    weeklyFastingGoal: 5, // days per week

    // Units
    weightUnit: 'lbs', // 'lbs' or 'kg'
    heightUnit: 'ft', // 'ft' or 'cm'

    // Loading state
    isLoading: false,
    isLoaded: false,
  }),

  getters: {
    weightGoalDisplay: (state) => {
      if (!state.weightGoal) return null
      if (state.weightUnit === 'lbs') {
        return Math.round(state.weightGoal * 2.20462 * 10) / 10
      }
      return state.weightGoal
    },
  },

  actions: {
    async loadSettings() {
      if (this.isLoaded) return

      this.isLoading = true
      try {
        const authStore = useAuthStore()
        const userId = authStore.userId

        // Try to load from IndexedDB
        const saved = await db.user_settings?.where('user_id').equals(userId).first()

        if (saved) {
          this.calorieGoal = saved.calorie_goal ?? 2000
          this.weightGoal = saved.weight_goal ?? null
          this.weeklyFastingGoal = saved.weekly_fasting_goal ?? 5
          this.weightUnit = saved.weight_unit ?? 'lbs'
          this.heightUnit = saved.height_unit ?? 'ft'
        } else {
          // Try localStorage fallback
          this.loadFromLocalStorage()
        }

        this.isLoaded = true
      } catch {
        // Fallback to localStorage
        this.loadFromLocalStorage()
        this.isLoaded = true
      } finally {
        this.isLoading = false
      }
    },

    loadFromLocalStorage() {
      try {
        const saved = localStorage.getItem('fasttrack-settings')
        if (saved) {
          const data = JSON.parse(saved)
          this.calorieGoal = data.calorieGoal ?? 2000
          this.weightGoal = data.weightGoal ?? null
          this.weeklyFastingGoal = data.weeklyFastingGoal ?? 5
          this.weightUnit = data.weightUnit ?? 'lbs'
          this.heightUnit = data.heightUnit ?? 'ft'
        }
      } catch {
        // Use defaults
      }
    },

    async saveSettings() {
      this.isLoading = true
      try {
        const authStore = useAuthStore()
        const userId = authStore.userId

        const data = {
          user_id: userId,
          calorie_goal: this.calorieGoal,
          weight_goal: this.weightGoal,
          weekly_fasting_goal: this.weeklyFastingGoal,
          weight_unit: this.weightUnit,
          height_unit: this.heightUnit,
        }

        // Save to IndexedDB
        const existing = await db.user_settings?.where('user_id').equals(userId).first()
        if (existing) {
          await db.user_settings.update(existing.id, data)
        } else {
          await db.user_settings?.add(data)
        }

        // Also save to localStorage as backup
        this.saveToLocalStorage()
      } catch {
        // Fallback to localStorage only
        this.saveToLocalStorage()
      } finally {
        this.isLoading = false
      }
    },

    saveToLocalStorage() {
      try {
        localStorage.setItem(
          'fasttrack-settings',
          JSON.stringify({
            calorieGoal: this.calorieGoal,
            weightGoal: this.weightGoal,
            weeklyFastingGoal: this.weeklyFastingGoal,
            weightUnit: this.weightUnit,
            heightUnit: this.heightUnit,
          }),
        )
      } catch {
        // Storage full or unavailable
      }
    },

    async setCalorieGoal(goal) {
      this.calorieGoal = Math.max(500, Math.min(10000, goal))
      await this.saveSettings()
    },

    async setWeightGoal(goal, unit = null) {
      // Convert to kg for storage
      const inputUnit = unit || this.weightUnit
      if (inputUnit === 'lbs') {
        this.weightGoal = goal / 2.20462
      } else {
        this.weightGoal = goal
      }
      await this.saveSettings()
    },

    async setWeeklyFastingGoal(days) {
      this.weeklyFastingGoal = Math.max(1, Math.min(7, days))
      await this.saveSettings()
    },

    async setWeightUnit(unit) {
      if (['lbs', 'kg'].includes(unit)) {
        this.weightUnit = unit
        await this.saveSettings()
      }
    },

    async setHeightUnit(unit) {
      if (['ft', 'cm'].includes(unit)) {
        this.heightUnit = unit
        await this.saveSettings()
      }
    },

    async clearWeightGoal() {
      this.weightGoal = null
      await this.saveSettings()
    },
  },
})
