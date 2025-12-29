import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/lib/api'
import type { Measurement } from '@/types'

export const useMeasurementsStore = defineStore('measurements', () => {
  // State
  const measurements = ref<Measurement[]>([])
  const latestMeasurement = ref<Measurement | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  async function fetchMeasurements(startDate?: string, endDate?: string) {
    loading.value = true
    error.value = null

    try {
      const params: Record<string, string> = {}
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const response = await api.get<{ measurements: Measurement[] }>('/measurements', { params })
      measurements.value = response.data.measurements
      return response.data.measurements
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch measurements'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchMeasurement(id: number) {
    loading.value = true
    error.value = null

    try {
      const response = await api.get<{ measurement: Measurement }>(`/measurements/${id}`)
      return response.data.measurement
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch measurement'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchLatestMeasurement() {
    loading.value = true
    error.value = null

    try {
      const response = await api.get<{ measurement: Measurement }>('/measurements/latest')
      latestMeasurement.value = response.data.measurement
      return response.data.measurement
    } catch (err: any) {
      if (err.response?.status === 404) {
        // No measurements yet
        latestMeasurement.value = null
        error.value = null
      } else {
        error.value = err.response?.data?.message || 'Failed to fetch latest measurement'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createMeasurement(data: {
    date: Date
    weight?: number
    height?: number
    bodyFat?: number
  }) {
    loading.value = true
    error.value = null

    try {
      const response = await api.post<{ measurement: Measurement }>('/measurements', data)
      measurements.value.unshift(response.data.measurement)
      latestMeasurement.value = response.data.measurement
      return response.data.measurement
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create measurement'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateMeasurement(
    id: number,
    data: {
      weight?: number
      height?: number
      bodyFat?: number
    }
  ) {
    loading.value = true
    error.value = null

    try {
      const response = await api.put<{ measurement: Measurement }>(`/measurements/${id}`, data)
      const index = measurements.value.findIndex((m) => m.id === id)
      if (index !== -1) {
        measurements.value[index] = response.data.measurement
      }
      if (latestMeasurement.value?.id === id) {
        latestMeasurement.value = response.data.measurement
      }
      return response.data.measurement
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update measurement'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteMeasurement(id: number) {
    loading.value = true
    error.value = null

    try {
      await api.delete(`/measurements/${id}`)
      measurements.value = measurements.value.filter((m) => m.id !== id)

      if (latestMeasurement.value?.id === id) {
        // Fetch new latest measurement
        await fetchLatestMeasurement()
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete measurement'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function resetStore() {
    measurements.value = []
    latestMeasurement.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    measurements,
    latestMeasurement,
    loading,
    error,
    // Actions
    fetchMeasurements,
    fetchMeasurement,
    fetchLatestMeasurement,
    createMeasurement,
    updateMeasurement,
    deleteMeasurement,
    clearError,
    resetStore,
  }
})
