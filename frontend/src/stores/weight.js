import { defineStore } from 'pinia'
import { db, offlineOperations } from '../services/offline.js'
import { useAuthStore } from './auth.js'
import { convertToKg, getWeightForDisplay, formatWeightChange, formatAverageWeight } from '../utils/weightConversions.js'

export const useWeightStore = defineStore('weight', {
  state: () => ({
    entries: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    latestWeight: (state) => {
      if (state.entries.length === 0) return null
      return state.entries.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    },

    // Get latest weight for display in specified unit
    latestWeightForDisplay: (state) => {
      return (displayUnit = 'kg') => {
        if (state.entries.length === 0) return null
        const latest = state.entries.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
        return {
          ...latest,
          weight: getWeightForDisplay(latest.weight, displayUnit)
        }
      }
    },

    weightByDate: (state) => {
      return (date) => {
        const targetDate = new Date(date).toDateString()
        const entry = state.entries.find(
          (entry) => new Date(entry.date).toDateString() === targetDate,
        )
        return entry ? entry.weight : null
      }
    },

    // Weight trends data for charts
    weeklyWeightData: (state) => {
      return (weeks = 4) => {
        const now = new Date()
        const data = []

        for (let i = weeks - 1; i >= 0; i--) {
          const weekStart = new Date(now.getTime() - (i * 7 + now.getDay()) * 24 * 60 * 60 * 1000)
          const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000)

          // Get entries for this week
          const weekEntries = state.entries
            .filter((entry) => {
              const entryDate = new Date(entry.date)
              return entryDate >= weekStart && entryDate <= weekEnd
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date))

          // Use most recent entry in the week
          const weightKg = weekEntries.length > 0 ? weekEntries[0].weight : null

          data.push({
            week: `Week ${weeks - i}`,
            label: `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
            weight: weightKg, // Keep in kg for chart data
            date: weekStart.toISOString().split('T')[0],
          })
        }

        return data.filter((item) => item.weight !== null) // Only return weeks with data
      }
    },

    monthlyWeightData: (state) => {
      return (months = 6) => {
        const now = new Date()
        const data = []

        for (let i = months - 1; i >= 0; i--) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
          const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)

          // Get entries for this month
          const monthEntries = state.entries
            .filter((entry) => {
              const entryDate = new Date(entry.date)
              return entryDate >= monthStart && entryDate <= monthEnd
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date))

          // Use most recent entry in the month
          const weight = monthEntries.length > 0 ? monthEntries[0].weight : null

          data.push({
            month: monthDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
            label: monthDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
            weight: weight,
            date: monthStart.toISOString().split('T')[0],
          })
        }

        return data.filter((item) => item.weight !== null) // Only return months with data
      }
    },

    dailyWeightData: (state) => {
      return (days = 30) => {
        const now = new Date()
        const data = []

        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
          const dateString = date.toDateString()

          const entry = state.entries.find(
            (entry) => new Date(entry.date).toDateString() === dateString,
          )

          if (entry) {
            data.push({
              date: date.toISOString().split('T')[0],
              label: date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              }),
              weight: entry.weight,
            })
          }
        }

        return data
      }
    },

    // Weight statistics (all calculations done in kg)
    weightTrend: (state) => {
      if (state.entries.length < 2) return { direction: 'stable', change: 0 }

      const sorted = [...state.entries].sort((a, b) => new Date(a.date) - new Date(b.date))
      const latest = sorted[sorted.length - 1]
      const previous = sorted[sorted.length - 2]

      const change = latest.weight - previous.weight
      const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'stable'

      return { direction, change: Math.abs(change) }
    },

    weightChange: (state) => {
      return (days = 30) => {
        if (state.entries.length === 0) return 0

        const now = new Date()
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

        // Get current weight (most recent entry)
        const currentEntry = state.entries.sort((a, b) => new Date(b.date) - new Date(a.date))[0]

        if (!currentEntry) return 0

        // Get weight from N days ago (closest entry to start date)
        const pastEntries = state.entries
          .filter((entry) => new Date(entry.date) <= startDate)
          .sort((a, b) => new Date(b.date) - new Date(a.date))

        if (pastEntries.length === 0) return 0

        const pastEntry = pastEntries[0]
        return currentEntry.weight - pastEntry.weight // Returns change in kg
      }
    },

    averageWeight: (state) => {
      return (days = 30) => {
        if (state.entries.length === 0) return 0

        const now = new Date()
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

        const recentEntries = state.entries.filter((entry) => new Date(entry.date) >= startDate)

        if (recentEntries.length === 0) return 0

        const total = recentEntries.reduce((sum, entry) => sum + entry.weight, 0)
        return Math.round((total / recentEntries.length) * 100) / 100 // Round to 2 decimal places
      }
    },

    // Display methods that handle unit conversion
    weightChangeForDisplay: (state) => {
      return (days = 30, displayUnit = 'kg') => {
        const changeKg = state.weightChange(days)
        return formatWeightChange(changeKg, displayUnit)
      }
    },

    averageWeightForDisplay: (state) => {
      return (days = 30, displayUnit = 'kg') => {
        const avgKg = state.averageWeight(days)
        return formatAverageWeight(avgKg, displayUnit)
      }
    },
  },

  actions: {
    async loadWeightEntries() {
      this.isLoading = true
      try {
        this.entries = await db.weight_entries.toArray()
      } catch (error) {
        this.error = error.message
        this.entries = []
      } finally {
        this.isLoading = false
      }
    },

    async addWeightEntry(weight, date = null, inputUnit = 'kg') {
      const authStore = useAuthStore()
      const entryDate = date ? new Date(date).toISOString() : new Date().toISOString()

      // Convert to kg for storage
      const weightKg = convertToKg(parseFloat(weight), inputUnit)

      const weightData = {
        user_id: authStore.userId,
        weight: weightKg, // Always store in kg
        date: entryDate,
      }

      try {
        const id = await offlineOperations.addToOffline('weight_entries', weightData)
        const newEntry = { id, ...weightData, synced: false }

        this.entries.push(newEntry)

        return newEntry
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async updateWeightEntry(id, updates) {
      try {
        // Find the entry first
        const entryIndex = this.entries.findIndex((entry) => entry.id === id)
        if (entryIndex === -1) {
          throw new Error('Weight entry not found')
        }

        // Prepare update data
        const weightData = { ...updates }
        if (weightData.weight) {
          weightData.weight = parseFloat(weightData.weight)
        }
        if (weightData.date) {
          weightData.date = new Date(weightData.date).toISOString()
        }

        await offlineOperations.updateOffline('weight_entries', id, weightData)

        // Update local state
        const updatedEntry = {
          ...this.entries[entryIndex],
          ...weightData,
          synced: false,
        }
        this.entries[entryIndex] = updatedEntry

        return updatedEntry
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async deleteWeightEntry(id) {
      try {
        // Find the entry first
        const entryIndex = this.entries.findIndex((entry) => entry.id === id)
        if (entryIndex === -1) {
          throw new Error('Weight entry not found')
        }

        await offlineOperations.deleteOffline('weight_entries', id)

        this.entries = this.entries.filter((entry) => entry.id !== id)
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    clearError() {
      this.error = null
    },

    async clearAllData() {
      this.isLoading = true
      try {
        // Clear from offline storage
        await db.weight_entries.clear()
        
        // Clear local state
        this.entries = []
        
        // Clear any errors
        this.error = null
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    exportData(format = 'json') {
      if (format === 'csv') {
        const headers = 'Date,Weight'
        const rows = this.entries
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .map((entry) => {
            const date = new Date(entry.date).toLocaleDateString()
            return `${date},${entry.weight}`
          })
        return [headers, ...rows].join('\n')
      } else {
        return JSON.stringify(this.entries.sort((a, b) => new Date(a.date) - new Date(b.date)))
      }
    },
  },
})
