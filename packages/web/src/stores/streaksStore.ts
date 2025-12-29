import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/lib/api'
import type { Streak, DailyActivity } from '@/types'

export const useStreaksStore = defineStore('streaks', () => {
  // State
  const streak = ref<Streak | null>(null)
  const dailyActivities = ref<DailyActivity[]>([])
  const todayActivity = ref<DailyActivity | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  async function fetchStreak() {
    loading.value = true
    error.value = null

    try {
      const response = await api.get<{ streak: Streak }>('/streaks')
      streak.value = response.data.streak
      return response.data.streak
    } catch (err: any) {
      if (err.response?.status === 404) {
        // No streak yet
        streak.value = null
        error.value = null
      } else {
        error.value = err.response?.data?.message || 'Failed to fetch streak'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchDailyActivities(params?: {
    startDate?: string
    endDate?: string
    days?: number
  }) {
    loading.value = true
    error.value = null

    try {
      const response = await api.get<{ activities: DailyActivity[] }>('/streaks/daily-activities', {
        params,
      })
      dailyActivities.value = response.data.activities
      return response.data.activities
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch daily activities'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchTodayActivity() {
    loading.value = true
    error.value = null

    try {
      const response = await api.get<{ activity: DailyActivity }>('/streaks/today')
      todayActivity.value = response.data.activity
      return response.data.activity
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch today activity'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function resetStore() {
    streak.value = null
    dailyActivities.value = []
    todayActivity.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    streak,
    dailyActivities,
    todayActivity,
    loading,
    error,
    // Actions
    fetchStreak,
    fetchDailyActivities,
    fetchTodayActivity,
    clearError,
    resetStore,
  }
})
