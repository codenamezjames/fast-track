import { create } from 'zustand'
import { api } from '../lib/api'
import { useAuthStore } from './authStore'

export type ActivityType = 'run' | 'walk' | 'bike' | 'other'

export interface Activity {
  id: string
  _id?: string
  userId: string
  type: ActivityType
  startTime: Date
  endTime: Date
  duration: number
  distance: number
  calories: number
}

interface ActiveSession {
  type: ActivityType
  startTime: Date
}

interface ActivityResponse {
  _id: string
  userId: string
  type: ActivityType
  startTime: string
  endTime: string
  duration: number
  distance: number
  calories: number
}

interface ActivityState {
  activities: Activity[]
  activeSession: ActiveSession | null
  loading: boolean

  startActivity: (type: ActivityType) => void
  endActivity: (distance: number) => Promise<void>
  updateActivity: (id: string, data: { distance: number; duration: number }) => Promise<void>
  deleteActivity: (id: string) => Promise<void>
  cancelActivity: () => void
  fetchActivities: () => Promise<void>
  getTodaysDistance: () => number
  getThisWeeksActivities: () => Activity[]
}

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
      await api.post('/activities', {
        type: activeSession.type,
        startTime: activeSession.startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration,
        distance,
        calories,
      })

      set({ activeSession: null, loading: false })
      get().fetchActivities()
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

      await api.put(`/activities/${id}`, {
        distance: data.distance,
        duration: data.duration,
        type: activity.type,
      })
      set({ loading: false })
      get().fetchActivities()
    } catch (error) {
      console.error('Error updating activity:', error)
      set({ loading: false })
    }
  },

  deleteActivity: async (id: string) => {
    try {
      await api.delete(`/activities/${id}`)
      get().fetchActivities()
    } catch (error) {
      console.error('Error deleting activity:', error)
    }
  },

  fetchActivities: async () => {
    const user = useAuthStore.getState().user
    if (!user) return

    set({ loading: true })
    try {
      const data = await api.get<ActivityResponse[]>('/activities?days=30')

      set({
        activities: data.map((a) => ({
          id: a._id,
          _id: a._id,
          userId: a.userId,
          type: a.type,
          startTime: new Date(a.startTime),
          endTime: new Date(a.endTime),
          duration: a.duration,
          distance: a.distance,
          calories: a.calories,
        })),
        loading: false,
      })
    } catch (error) {
      console.error('Error fetching activities:', error)
      set({ loading: false })
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
