import { create } from 'zustand'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuthStore } from './authStore'
import { useHealthStore } from './healthStore'
import { useSettingsStore } from './settingsStore'

export interface Measurement {
  id: string
  userId: string
  date: Date
  weight?: number    // kg
  height?: number    // cm
  bodyFat?: number   // percentage
}

interface MeasurementsState {
  measurements: Measurement[]
  loading: boolean
  unsubscribe: (() => void) | null

  addMeasurement: (data: Omit<Measurement, 'id' | 'userId' | 'date'>) => Promise<void>
  updateMeasurement: (id: string, data: Omit<Measurement, 'id' | 'userId' | 'date'>) => Promise<void>
  deleteMeasurement: (id: string) => Promise<void>
  subscribeToMeasurements: () => void
  cleanup: () => void
  getLatestWeight: () => number | null
  getLatestHeight: () => number | null
  getBMI: () => number | null
  getWeightTrend: () => { date: Date; weight: number }[]
}

export const useMeasurementsStore = create<MeasurementsState>((set, get) => ({
  measurements: [],
  loading: false,
  unsubscribe: null,

  addMeasurement: async (data) => {
    const user = useAuthStore.getState().user
    if (!user) return

    set({ loading: true })
    try {
      await addDoc(collection(db, 'measurements'), {
        userId: user.uid,
        date: Timestamp.now(),
        ...data,
      })
      set({ loading: false })

      // Sync to health app
      const healthStore = useHealthStore.getState()
      if (data.weight) {
        healthStore.syncWeight(data.weight)
      }
      if (data.height) {
        healthStore.syncHeight(data.height)
      }
      if (data.bodyFat) {
        healthStore.syncBodyFat(data.bodyFat)
      }

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
      await updateDoc(doc(db, 'measurements', id), data)
      set({ loading: false })
    } catch (error) {
      console.error('Error updating measurement:', error)
      set({ loading: false })
    }
  },

  deleteMeasurement: async (id) => {
    try {
      await deleteDoc(doc(db, 'measurements', id))
    } catch (error) {
      console.error('Error deleting measurement:', error)
    }
  },

  subscribeToMeasurements: () => {
    const user = useAuthStore.getState().user
    if (!user) return

    const q = query(
      collection(db, 'measurements'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc'),
      limit(30)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const measurements: Measurement[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        measurements.push({
          id: doc.id,
          userId: data.userId,
          date: data.date.toDate(),
          weight: data.weight,
          height: data.height,
          bodyFat: data.bodyFat,
        })
      })
      set({ measurements })
    })

    set({ unsubscribe })
  },

  cleanup: () => {
    const { unsubscribe } = get()
    if (unsubscribe) {
      unsubscribe()
      set({ unsubscribe: null })
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

    // BMI = weight (kg) / height (m)^2
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
