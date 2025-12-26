import { create } from 'zustand'
import { api } from '../lib/api'
import { useAuthStore } from './authStore'
import { useStreakStore } from './streakStore'

export interface FastingSession {
  id: string
  _id?: string
  userId: string
  startTime: Date
  endTime?: Date
  goalHours: number
  completed: boolean
  notes?: string
}

export interface FastingPreset {
  name: string
  fastHours: number
  eatHours: number
}

export const FASTING_PRESETS: FastingPreset[] = [
  { name: '16:8', fastHours: 16, eatHours: 8 },
  { name: '18:6', fastHours: 18, eatHours: 6 },
  { name: '20:4', fastHours: 20, eatHours: 4 },
  { name: 'OMAD', fastHours: 23, eatHours: 1 },
]

interface FastResponse {
  _id: string
  userId: string
  startTime: string
  endTime?: string
  goalHours: number
  completed: boolean
  notes?: string
}

interface FastingState {
  currentFast: FastingSession | null
  history: FastingSession[]
  selectedPreset: FastingPreset
  loading: boolean

  setPreset: (preset: FastingPreset) => void
  startFast: () => Promise<void>
  endFast: (completed: boolean) => Promise<void>
  deleteFast: (id: string) => Promise<void>
  fetchFasts: () => Promise<void>
  getStreak: () => number
  getElapsedTime: () => number
  getProgress: () => number
}

export const useFastingStore = create<FastingState>((set, get) => ({
  currentFast: null,
  history: [],
  selectedPreset: FASTING_PRESETS[0],
  loading: false,

  setPreset: (preset) => set({ selectedPreset: preset }),

  startFast: async () => {
    const user = useAuthStore.getState().user
    if (!user) return

    set({ loading: true })
    try {
      const response = await api.post<FastResponse>('/fasts', {
        goalHours: get().selectedPreset.fastHours,
        startTime: new Date().toISOString(),
      })

      set({
        currentFast: {
          id: response._id,
          _id: response._id,
          userId: response.userId,
          startTime: new Date(response.startTime),
          goalHours: response.goalHours,
          completed: response.completed,
        },
        loading: false,
      })
    } catch (error) {
      console.error('Error starting fast:', error)
      set({ loading: false })
    }
  },

  endFast: async (completed: boolean) => {
    const { currentFast } = get()
    if (!currentFast) return

    set({ loading: true })
    try {
      await api.put(`/fasts/${currentFast.id}`, {
        endTime: new Date().toISOString(),
        completed,
      })
      set({ currentFast: null, loading: false })
      get().fetchFasts()

      if (completed) {
        useStreakStore.getState().updateTodayActivity({ fastCompleted: true })
      }
    } catch (error) {
      console.error('Error ending fast:', error)
      set({ loading: false })
    }
  },

  deleteFast: async (id: string) => {
    try {
      await api.delete(`/fasts/${id}`)
      get().fetchFasts()
    } catch (error) {
      console.error('Error deleting fast:', error)
    }
  },

  fetchFasts: async () => {
    const user = useAuthStore.getState().user
    if (!user) return

    set({ loading: true })
    try {
      const data = await api.get<FastResponse[]>('/fasts')

      const fasts: FastingSession[] = []
      let activeFast: FastingSession | null = null

      data.forEach((f) => {
        const session: FastingSession = {
          id: f._id,
          _id: f._id,
          userId: f.userId,
          startTime: new Date(f.startTime),
          endTime: f.endTime ? new Date(f.endTime) : undefined,
          goalHours: f.goalHours,
          completed: f.completed,
          notes: f.notes,
        }

        if (!session.endTime) {
          activeFast = session
        } else {
          fasts.push(session)
        }
      })

      set({ history: fasts, currentFast: activeFast, loading: false })
    } catch (error) {
      console.error('Error fetching fasts:', error)
      set({ loading: false })
    }
  },

  getStreak: () => {
    const { history } = get()
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < history.length; i++) {
      const fast = history[i]
      if (!fast.completed) continue

      const fastDate = new Date(fast.startTime)
      fastDate.setHours(0, 0, 0, 0)

      const expectedDate = new Date(today)
      expectedDate.setDate(expectedDate.getDate() - streak)

      if (fastDate.getTime() === expectedDate.getTime()) {
        streak++
      } else if (fastDate < expectedDate) {
        break
      }
    }

    return streak
  },

  getElapsedTime: () => {
    const { currentFast } = get()
    if (!currentFast) return 0

    const now = new Date()
    const elapsed = now.getTime() - currentFast.startTime.getTime()
    return elapsed
  },

  getProgress: () => {
    const { currentFast } = get()
    if (!currentFast) return 0

    const elapsed = get().getElapsedTime()
    const goal = currentFast.goalHours * 60 * 60 * 1000
    return Math.min(100, (elapsed / goal) * 100)
  },
}))
