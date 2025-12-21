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
  onSnapshot,
  Timestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuthStore } from './authStore'
import { useHealthStore } from './healthStore'

export type ActivityType = 'run' | 'walk' | 'bike' | 'other'

export interface Activity {
  id: string
  userId: string
  type: ActivityType
  startTime: Date
  endTime: Date
  duration: number  // minutes
  distance: number  // km
  calories: number
}

interface ActiveSession {
  type: ActivityType
  startTime: Date
}

interface ActivityState {
  activities: Activity[]
  activeSession: ActiveSession | null
  loading: boolean
  unsubscribe: (() => void) | null

  startActivity: (type: ActivityType) => void
  endActivity: (distance: number) => Promise<void>
  updateActivity: (id: string, data: { distance: number; duration: number }) => Promise<void>
  deleteActivity: (id: string) => Promise<void>
  cancelActivity: () => void
  subscribeToActivities: () => void
  cleanup: () => void
  getTodaysDistance: () => number
  getThisWeeksActivities: () => Activity[]
}

// Calories per minute estimates by activity type
const CALORIES_PER_MINUTE: Record<ActivityType, number> = {
  run: 10,
  walk: 4,
  bike: 8,
  other: 5,
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: [],
  activeSession: null,
  loading: false,
  unsubscribe: null,

  startActivity: (type: ActivityType) => {
    set({ activeSession: { type, startTime: new Date() } })
  },

  endActivity: async (distance: number) => {
    const user = useAuthStore.getState().user
    const { activeSession } = get()
    if (!user || !activeSession) return

    set({ loading: true })

    const endTime = new Date()
    const duration = Math.round(
      (endTime.getTime() - activeSession.startTime.getTime()) / 60000
    )
    const calories = Math.round(duration * CALORIES_PER_MINUTE[activeSession.type])

    try {
      await addDoc(collection(db, 'activities'), {
        userId: user.uid,
        type: activeSession.type,
        startTime: Timestamp.fromDate(activeSession.startTime),
        endTime: Timestamp.fromDate(endTime),
        duration,
        distance,
        calories,
      })

      set({ activeSession: null, loading: false })

      // Sync to health app (only for run/walk/bike)
      if (activeSession.type === 'run' || activeSession.type === 'walk' || activeSession.type === 'bike') {
        const healthStore = useHealthStore.getState()
        healthStore.syncActivity(
          activeSession.type,
          activeSession.startTime,
          endTime,
          distance,
          calories
        )
      }
    } catch (error) {
      console.error('Error saving activity:', error)
      set({ loading: false })
    }
  },

  cancelActivity: () => {
    set({ activeSession: null })
  },

  updateActivity: async (id: string, data: { distance: number; duration: number }) => {
    set({ loading: true })
    try {
      const { activities } = get()
      const activity = activities.find((a) => a.id === id)
      if (!activity) return

      // Recalculate calories based on new duration
      const calories = Math.round(data.duration * CALORIES_PER_MINUTE[activity.type])

      await updateDoc(doc(db, 'activities', id), {
        distance: data.distance,
        duration: data.duration,
        calories,
      })
      set({ loading: false })
    } catch (error) {
      console.error('Error updating activity:', error)
      set({ loading: false })
    }
  },

  deleteActivity: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'activities', id))
    } catch (error) {
      console.error('Error deleting activity:', error)
    }
  },

  subscribeToActivities: () => {
    const user = useAuthStore.getState().user
    if (!user) return

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const q = query(
      collection(db, 'activities'),
      where('userId', '==', user.uid),
      where('startTime', '>=', Timestamp.fromDate(thirtyDaysAgo)),
      orderBy('startTime', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activities: Activity[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        activities.push({
          id: doc.id,
          userId: data.userId,
          type: data.type,
          startTime: data.startTime.toDate(),
          endTime: data.endTime.toDate(),
          duration: data.duration,
          distance: data.distance,
          calories: data.calories,
        })
      })
      set({ activities })
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

  getTodaysDistance: () => {
    const { activities } = get()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return activities
      .filter((a) => {
        const actDate = new Date(a.startTime)
        actDate.setHours(0, 0, 0, 0)
        return actDate.getTime() === today.getTime()
      })
      .reduce((sum, a) => sum + a.distance, 0)
  },

  getThisWeeksActivities: () => {
    const { activities } = get()
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    return activities.filter((a) => a.startTime >= weekAgo)
  },
}))
