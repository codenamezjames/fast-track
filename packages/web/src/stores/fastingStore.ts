import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/lib/api'
import type { Fast, FastProgress } from '@/types'

export const useFastingStore = defineStore('fasting', () => {
  // State
  const fasts = ref<Fast[]>([])
  const activeFast = ref<Fast | null>(null)
  const activeProgress = ref<FastProgress | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const hasActiveFast = computed(() => !!activeFast.value)
  const isFastCompleted = computed(() => {
    if (!activeProgress.value) return false
    return activeProgress.value.percentage >= 100
  })

  // Actions
  async function fetchFasts() {
    loading.value = true
    error.value = null

    try {
      const response = await api.get<{ fasts: Fast[] }>('/fasts')
      fasts.value = response.data.fasts
      return response.data.fasts
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch fasts'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchActiveFast() {
    loading.value = true
    error.value = null

    try {
      const response = await api.get<{
        fast: Fast
        progress: FastProgress
      }>('/fasts/active')

      activeFast.value = response.data.fast
      activeProgress.value = response.data.progress
      return response.data
    } catch (err: any) {
      if (err.response?.status === 404) {
        // No active fast
        activeFast.value = null
        activeProgress.value = null
        error.value = null
      } else {
        error.value = err.response?.data?.message || 'Failed to fetch active fast'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  async function startFast(data: { startTime: Date; goalHours: number; notes?: string }) {
    loading.value = true
    error.value = null

    try {
      const response = await api.post<{ fast: Fast }>('/fasts', data)
      activeFast.value = response.data.fast
      fasts.value.unshift(response.data.fast)
      return response.data.fast
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to start fast'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function endFast(id: number, data?: { endTime?: Date; notes?: string }) {
    loading.value = true
    error.value = null

    try {
      const response = await api.post<{ fast: Fast; isCompleted: boolean }>(
        `/fasts/${id}/end`,
        data
      )

      activeFast.value = null
      activeProgress.value = null

      const index = fasts.value.findIndex((f) => f.id === id)
      if (index !== -1) {
        fasts.value[index] = response.data.fast
      }

      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to end fast'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteFast(id: number) {
    loading.value = true
    error.value = null

    try {
      await api.delete(`/fasts/${id}`)
      fasts.value = fasts.value.filter((f) => f.id !== id)

      if (activeFast.value?.id === id) {
        activeFast.value = null
        activeProgress.value = null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete fast'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function resetStore() {
    fasts.value = []
    activeFast.value = null
    activeProgress.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    fasts,
    activeFast,
    activeProgress,
    loading,
    error,
    // Getters
    hasActiveFast,
    isFastCompleted,
    // Actions
    fetchFasts,
    fetchActiveFast,
    startFast,
    endFast,
    deleteFast,
    clearError,
    resetStore,
  }
})
