import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/lib/api'
import type { WorkoutLog, Exercise } from '@/types'

export const useWorkoutLogsStore = defineStore('workoutLogs', () => {
  // State
  const workoutLogs = ref<WorkoutLog[]>([])
  const activeWorkout = ref<WorkoutLog | null>(null)
  const activeElapsed = ref<number>(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const hasActiveWorkout = computed(() => !!activeWorkout.value)

  // Actions
  async function fetchWorkoutLogs(startDate?: string, endDate?: string) {
    loading.value = true
    error.value = null

    try {
      const params: Record<string, string> = {}
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const response = await api.get<{ workoutLogs: WorkoutLog[] }>('/workout-logs', { params })
      workoutLogs.value = response.data.workoutLogs
      return response.data.workoutLogs
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch workout logs'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchWorkoutLog(id: number) {
    loading.value = true
    error.value = null

    try {
      const response = await api.get<{ workoutLog: WorkoutLog }>(`/workout-logs/${id}`)
      return response.data.workoutLog
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch workout log'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchActiveWorkout() {
    loading.value = true
    error.value = null

    try {
      const response = await api.get<{
        workoutLog: WorkoutLog
        elapsed: number
      }>('/workout-logs/active')

      activeWorkout.value = response.data.workoutLog
      activeElapsed.value = response.data.elapsed
      return response.data
    } catch (err: any) {
      if (err.response?.status === 404) {
        // No active workout
        activeWorkout.value = null
        activeElapsed.value = 0
        error.value = null
      } else {
        error.value = err.response?.data?.message || 'Failed to fetch active workout'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  async function startWorkout(data: {
    routineId?: number
    startTime: Date
    exercisesCompleted: Exercise[]
  }) {
    loading.value = true
    error.value = null

    try {
      const response = await api.post<{ workoutLog: WorkoutLog }>('/workout-logs', data)
      activeWorkout.value = response.data.workoutLog
      activeElapsed.value = 0
      workoutLogs.value.unshift(response.data.workoutLog)
      return response.data.workoutLog
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to start workout'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function endWorkout(
    id: number,
    data?: {
      endTime?: Date
      isCompleted?: boolean
      exercisesCompleted?: Exercise[]
    }
  ) {
    loading.value = true
    error.value = null

    try {
      const response = await api.post<{ workoutLog: WorkoutLog }>(`/workout-logs/${id}/end`, data)

      activeWorkout.value = null
      activeElapsed.value = 0

      const index = workoutLogs.value.findIndex((w) => w.id === id)
      if (index !== -1) {
        workoutLogs.value[index] = response.data.workoutLog
      }

      return response.data.workoutLog
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to end workout'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteWorkoutLog(id: number) {
    loading.value = true
    error.value = null

    try {
      await api.delete(`/workout-logs/${id}`)
      workoutLogs.value = workoutLogs.value.filter((w) => w.id !== id)

      if (activeWorkout.value?.id === id) {
        activeWorkout.value = null
        activeElapsed.value = 0
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete workout log'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function resetStore() {
    workoutLogs.value = []
    activeWorkout.value = null
    activeElapsed.value = 0
    loading.value = false
    error.value = null
  }

  return {
    // State
    workoutLogs,
    activeWorkout,
    activeElapsed,
    loading,
    error,
    // Getters
    hasActiveWorkout,
    // Actions
    fetchWorkoutLogs,
    fetchWorkoutLog,
    fetchActiveWorkout,
    startWorkout,
    endWorkout,
    deleteWorkoutLog,
    clearError,
    resetStore,
  }
})
