import { create } from 'zustand'
import { api } from '../lib/api'
import { useAuthStore } from './authStore'
import { useSettingsStore } from './settingsStore'

export interface Measurement {
  id: string
  _id?: string
  userId: string
  date: Date
  weight?: number
  height?: number
  bodyFat?: number
}

interface MeasurementResponse {
  _id: string
  userId: string
  date: string
  weight?: number
  height?: number
  bodyFat?: number
}

interface MeasurementsState {
  measurements: Measurement[]
  loading: boolean

  addMeasurement: (data: Omit<Measurement, 'id' | 'userId' | 'date'>) => Promise<void>
  updateMeasurement: (id: string, data: Omit<Measurement, 'id' | 'userId' | 'date'>) => Promise<void>
  deleteMeasurement: (id: string) => Promise<void>
  fetchMeasurements: () => Promise<void>
  getLatestWeight: () => number | null
  getLatestHeight: () => number | null
  getBMI: () => number | null
  getWeightTrend: () => { date: Date; weight: number }[]
}

export const useMeasurementsStore = create<MeasurementsState>((set, get) => ({
  measurements: [],
  loading: false,

  addMeasurement: async (data) => {
    const user = useAuthStore.getState().user
    if (!user) return

    set({ loading: true })
    try {
      await api.post('/measurements', {
        ...data,
        date: new Date().toISOString(),
      })
      set({ loading: false })
      get().fetchMeasurements()

      // Auto-recalculate calories if enabled and weight changed
      const settingsStore = useSettingsStore.getState()
      if (settingsStore.profile.isAutoCaloriesEnabled && data.weight) {
        const height = data.height || get().getLatestHeight()
        if (height) {
          settingsStore.recalculateCalories(data.weight, height)
        }
      }
    } catch (error) {
      console.error('Error adding measurement:', error)
      set({ loading: false })
    }
  },

  updateMeasurement: async (id, data) => {
    set({ loading: true })
    try {
      await api.put(`/measurements/${id}`, data)
      set({ loading: false })
      get().fetchMeasurements()
    } catch (error) {
      console.error('Error updating measurement:', error)
      set({ loading: false })
    }
  },

  deleteMeasurement: async (id) => {
    try {
      await api.delete(`/measurements/${id}`)
      get().fetchMeasurements()
    } catch (error) {
      console.error('Error deleting measurement:', error)
    }
  },

  fetchMeasurements: async () => {
    const user = useAuthStore.getState().user
    if (!user) return

    set({ loading: true })
    try {
      const data = await api.get<MeasurementResponse[]>('/measurements?limit=30')

      set({
        measurements: data.map((m) => ({
          id: m._id,
          _id: m._id,
          userId: m.userId,
          date: new Date(m.date),
          weight: m.weight,
          height: m.height,
          bodyFat: m.bodyFat,
        })),
        loading: false,
      })
    } catch (error) {
      console.error('Error fetching measurements:', error)
      set({ loading: false })
    }
  },

  getLatestWeight: () => {
    const { measurements } = get()
    const withWeight = measurements.find((m) => m.weight != null)
    return withWeight?.weight ?? null
  },

  getLatestHeight: () => {
    const { measurements } = get()
    const withHeight = measurements.find((m) => m.height != null)
    return withHeight?.height ?? null
  },

  getBMI: () => {
    const weight = get().getLatestWeight()
    const height = get().getLatestHeight()

    if (!weight || !height) return null

    const heightInMeters = height / 100
    return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10
  },

  getWeightTrend: () => {
    const { measurements } = get()
    return measurements
      .filter((m) => m.weight != null)
      .map((m) => ({ date: m.date, weight: m.weight! }))
      .reverse()
  },
}))
