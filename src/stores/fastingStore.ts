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
import { useStreakStore } from './streakStore'

export interface FastingSession {
  id: string
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

interface FastingState {
  currentFast: FastingSession | null
  history: FastingSession[]
  selectedPreset: FastingPreset
  loading: boolean
  unsubscribe: (() => void) | null

  setPreset: (preset: FastingPreset) => void
  startFast: () => Promise<void>
  endFast: (completed: boolean) => Promise<void>
  deleteFast: (id: string) => Promise<void>
  subscribeToFasts: () => void
  cleanup: () => void
  getStreak: () => number
  getElapsedTime: () => number
  getProgress: () => number
}

export const useFastingStore = create<FastingState>((set, get) => ({
  currentFast: null,
  history: [],
  selectedPreset: FASTING_PRESETS[0],
  loading: false,
  unsubscribe: null,

  setPreset: (preset) => set({ selectedPreset: preset }),

  startFast: async () => {
    const user = useAuthStore.getState().user
    if (!user) return

    set({ loading: true })
    try {
      const session = {
        userId: user.uid,
        startTime: Timestamp.now(),
        goalHours: get().selectedPreset.fastHours,
        completed: false,
      }

      const docRef = await addDoc(collection(db, 'fasts'), session)

      set({
        currentFast: {
          id: docRef.id,
          ...session,
          startTime: session.startTime.toDate(),
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
      await updateDoc(doc(db, 'fasts', currentFast.id), {
        endTime: Timestamp.now(),
        completed,
      })
      set({ currentFast: null, loading: false })

      // Update streak if fast was completed
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
      await deleteDoc(doc(db, 'fasts', id))
    } catch (error) {
      console.error('Error deleting fast:', error)
    }
  },

  subscribeToFasts: () => {
    const user = useAuthStore.getState().user
    if (!user) return

    const q = query(
      collection(db, 'fasts'),
      where('userId', '==', user.uid),
      orderBy('startTime', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fasts: FastingSession[] = []
      let activeFast: FastingSession | null = null

      snapshot.forEach((doc) => {
        const data = doc.data()
        const session: FastingSession = {
          id: doc.id,
          userId: data.userId,
          startTime: data.startTime.toDate(),
          endTime: data.endTime?.toDate(),
          goalHours: data.goalHours,
          completed: data.completed,
          notes: data.notes,
        }

        if (!session.endTime) {
          activeFast = session
        } else {
          fasts.push(session)
        }
      })

      set({ history: fasts, currentFast: activeFast })
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
