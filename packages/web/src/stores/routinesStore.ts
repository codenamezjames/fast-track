import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/lib/api'
import type { Routine, Exercise } from '@/types'

export const useRoutinesStore = defineStore('routines', () => {
  // State
  const routines = ref<Routine[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  async function fetchRoutines() {
    loading.value = true
    error.value = null

    try {
      const response = await api.get<{ routines: Routine[] }>('/routines')
      routines.value = response.data.routines
      return response.data.routines
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch routines'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchRoutine(id: number) {
    loading.value = true
    error.value = null

    try {
      const response = await api.get<{ routine: Routine }>(`/routines/${id}`)
      return response.data.routine
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch routine'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createRoutine(data: { name: string; exercises: Exercise[] }) {
    loading.value = true
    error.value = null

    try {
      const response = await api.post<{ routine: Routine }>('/routines', data)
      routines.value.unshift(response.data.routine)
      return response.data.routine
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create routine'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateRoutine(
    id: number,
    data: { name?: string; exercises?: Exercise[] }
  ) {
    loading.value = true
    error.value = null

    try {
      const response = await api.put<{ routine: Routine }>(`/routines/${id}`, data)
      const index = routines.value.findIndex((r) => r.id === id)
      if (index !== -1) {
        routines.value[index] = response.data.routine
      }
      return response.data.routine
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update routine'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteRoutine(id: number) {
    loading.value = true
    error.value = null

    try {
      await api.delete(`/routines/${id}`)
      routines.value = routines.value.filter((r) => r.id !== id)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete routine'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function resetStore() {
    routines.value = []
    loading.value = false
    error.value = null
  }

  return {
    // State
    routines,
    loading,
    error,
    // Actions
    fetchRoutines,
    fetchRoutine,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    clearError,
    resetStore,
  }
})
