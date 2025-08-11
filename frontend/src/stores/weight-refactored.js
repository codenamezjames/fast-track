import { createDataStore } from './base/BaseStore.js'

export const useWeightStore = createDataStore('weight', {
  storageKey: 'weight-entries',

  getters: {
    // Weight statistics
    latestWeight: (state) => {
      if (state.data.length === 0) return null
      return state.data.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    },

    averageWeight: (state) => {
      if (state.data.length === 0) return 0
      const total = state.data.reduce((sum, entry) => sum + entry.weight, 0)
      return Math.round((total / state.data.length) * 10) / 10
    },

    weightChange: (state) => {
      if (state.data.length < 2) return 0
      const sorted = state.data.sort((a, b) => new Date(b.date) - new Date(a.date))
      const latest = sorted[0]
      const oldest = sorted[sorted.length - 1]
      return Math.round((latest.weight - oldest.weight) * 10) / 10
    },

    // Chart data
    weightChartData:
      (state) =>
      (days = 30) => {
        const now = new Date()
        const data = []

        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
          const dateString = date.toISOString().split('T')[0]

          // Find weight entry for this date
          const entry = state.data.find(
            (item) => new Date(item.date).toISOString().split('T')[0] === dateString,
          )

          data.push({
            date: dateString,
            label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            weight: entry ? entry.weight : null,
          })
        }

        return data
      },

    // Weight trends
    weightTrend: (state) => {
      if (state.data.length < 2) return 'stable'

      const sorted = state.data.sort((a, b) => new Date(a.date) - new Date(b.date))
      const first = sorted[0]
      const last = sorted[sorted.length - 1]

      const change = last.weight - first.weight
      if (change > 1) return 'increasing'
      if (change < -1) return 'decreasing'
      return 'stable'
    },

    // Recent entries
    recentEntries:
      (state) =>
      (limit = 10) => {
        return state.data.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit)
      },

    // Weight range
    weightRange: (state) => {
      if (state.data.length === 0) return { min: 0, max: 0 }

      const weights = state.data.map((entry) => entry.weight)
      return {
        min: Math.min(...weights),
        max: Math.max(...weights),
      }
    },

    // Entries by month
    entriesByMonth: (state) => (year, month) => {
      return state.data.filter((entry) => {
        const entryDate = new Date(entry.date)
        return entryDate.getFullYear() === year && entryDate.getMonth() === month
      })
    },
  },

  actions: {
    // Add weight entry
    async addWeightEntry(weight, date = null, unit = 'lbs') {
      const entry = {
        weight: parseFloat(weight),
        date: date || new Date().toISOString(),
        unit: unit,
      }

      return await this.addItem(entry)
    },

    // Update weight entry
    async updateWeightEntry(id, weight, date = null, unit = 'lbs') {
      const updates = {
        weight: parseFloat(weight),
        unit: unit,
      }

      if (date) {
        updates.date = date
      }

      return await this.updateItem(id, updates)
    },

    // Delete weight entry
    async deleteWeightEntry(id) {
      return await this.deleteItem(id)
    },

    // Get weight statistics for a date range
    async getWeightStats(startDate, endDate) {
      const entries = this.data.filter((entry) => {
        const entryDate = new Date(entry.date)
        return entryDate >= startDate && entryDate <= endDate
      })

      if (entries.length === 0) {
        return {
          totalEntries: 0,
          averageWeight: 0,
          weightChange: 0,
          trend: 'stable',
        }
      }

      const sorted = entries.sort((a, b) => new Date(a.date) - new Date(b.date))
      const first = sorted[0]
      const last = sorted[sorted.length - 1]
      const average = entries.reduce((sum, entry) => sum + entry.weight, 0) / entries.length

      return {
        totalEntries: entries.length,
        averageWeight: Math.round(average * 10) / 10,
        weightChange: Math.round((last.weight - first.weight) * 10) / 10,
        trend:
          last.weight > first.weight
            ? 'increasing'
            : last.weight < first.weight
              ? 'decreasing'
              : 'stable',
      }
    },

    // Convert weight between units
    convertWeight(weight, fromUnit, toUnit) {
      if (fromUnit === toUnit) return weight

      if (fromUnit === 'lbs' && toUnit === 'kg') {
        return Math.round(weight * 0.453592 * 10) / 10
      } else if (fromUnit === 'kg' && toUnit === 'lbs') {
        return Math.round(weight * 2.20462 * 10) / 10
      }

      return weight
    },

    // Export weight data
    async exportData() {
      return {
        entries: this.data,
        exportDate: new Date().toISOString(),
        totalEntries: this.data.length,
        averageWeight: this.averageWeight,
        weightChange: this.weightChange,
      }
    },

    // Import weight data
    async importData(importData) {
      if (!importData.entries || !Array.isArray(importData.entries)) {
        throw new Error('Invalid import data format')
      }

      // Clear existing data
      await this.clearAllData()

      // Add imported entries
      for (const entry of importData.entries) {
        await this.addWeightEntry(entry.weight, entry.date, entry.unit)
      }

      return {
        imported: importData.entries.length,
        averageWeight: this.averageWeight,
      }
    },
  },
})
