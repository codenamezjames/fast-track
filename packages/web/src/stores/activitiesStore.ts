import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/lib/api'
import type { Activity, ActivityType } from '@/types'

export const useActivitiesStore = defineStore('activities', () => {
  // State
  const activities = ref<Activity[]>([])
  const activeActivity = ref<Activity | null>(null)
  const activeElapsed = ref<number>(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const hasActiveActivity = computed(() => !!activeActivity.value)

  // Actions
  async function fetchActivities(params?: {
    startDate?: string
    endDate?: string
    type?: ActivityType
  }) {
    loading.value = true
    error.value = null

    try {
      const response = await api.get<{ activities: Activity[] }>('/activities', { params })
      activities.value = response.data.activities
      return response.data.activities
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch activities'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchActivity(id: number) {
    loading.value = true
    error.value = null

    try {
      const response = await api.get<{ activity: Activity }>(`/activities/${id}`)
      return response.data.activity
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch activity'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchActiveActivity() {
    loading.value = true
    error.value = null

    try {
      const response = await api.get<{
        activity: Activity
        elapsed: number
      }>('/activities/active')

      activeActivity.value = response.data.activity
      activeElapsed.value = response.data.elapsed
      return response.data
    } catch (err: any) {
      if (err.response?.status === 404) {
        // No active activity
        activeActivity.value = null
        activeElapsed.value = 0
        error.value = null
      } else {
        error.value = err.response?.data?.message || 'Failed to fetch active activity'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  async function startActivity(data: {
    type: ActivityType
    startTime: Date
    endTime?: Date
    duration?: number
    distance?: number
    calories?: number
  }) {
    loading.value = true
    error.value = null

    try {
      const response = await api.post<{ activity: Activity }>('/activities', data)
      activeActivity.value = response.data.activity
      activeElapsed.value = 0
      activities.value.unshift(response.data.activity)
      return response.data.activity
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to start activity'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function endActivity(
    id: number,
    data?: {
      endTime?: Date
      duration?: number
      distance?: number
      calories?: number
    }
  ) {
    loading.value = true
    error.value = null

    try {
      const response = await api.post<{ activity: Activity }>(`/activities/${id}/end`, data)

      activeActivity.value = null
      activeElapsed.value = 0

      const index = activities.value.findIndex((a) => a.id === id)
      if (index !== -1) {
        activities.value[index] = response.data.activity
      }

      return response.data.activity
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to end activity'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateActivity(
    id: number,
    data: {
      type?: ActivityType
      endTime?: Date
      duration?: number
      distance?: number
      calories?: number
    }
  ) {
    loading.value = true
    error.value = null

    try {
      const response = await api.put<{ activity: Activity }>(`/activities/${id}`, data)
      const index = activities.value.findIndex((a) => a.id === id)
      if (index !== -1) {
        activities.value[index] = response.data.activity
      }
      return response.data.activity
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update activity'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteActivity(id: number) {
    loading.value = true
    error.value = null

    try {
      await api.delete(`/activities/${id}`)
      activities.value = activities.value.filter((a) => a.id !== id)

      if (activeActivity.value?.id === id) {
        activeActivity.value = null
        activeElapsed.value = 0
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete activity'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function resetStore() {
    activities.value = []
    activeActivity.value = null
    activeElapsed.value = 0
    loading.value = false
    error.value = null
  }

  return {
    // State
    activities,
    activeActivity,
    activeElapsed,
    loading,
    error,
    // Getters
    hasActiveActivity,
    // Actions
    fetchActivities,
    fetchActivity,
    fetchActiveActivity,
    startActivity,
    endActivity,
    updateActivity,
    deleteActivity,
    clearError,
    resetStore,
  }
})
