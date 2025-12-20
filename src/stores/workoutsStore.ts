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

export interface Exercise {
  id: string
  name: string
  sets: number
  reps: number
  weight?: number
}

export interface WorkoutRoutine {
  id: string
  userId: string
  name: string
  exercises: Exercise[]
  createdAt: Date
}

export interface WorkoutLog {
  id: string
  userId: string
  routineId: string
  routineName: string
  date: Date
  duration: number // minutes
  completed: boolean
  exercisesCompleted: number
}

interface WorkoutsState {
  routines: WorkoutRoutine[]
  logs: WorkoutLog[]
  activeWorkout: { routineId: string; startTime: Date } | null
  loading: boolean
  unsubscribeRoutines: (() => void) | null
  unsubscribeLogs: (() => void) | null

  createRoutine: (name: string, exercises: Omit<Exercise, 'id'>[]) => Promise<void>
  updateRoutine: (id: string, name: string, exercises: Exercise[]) => Promise<void>
  deleteRoutine: (id: string) => Promise<void>
  startWorkout: (routineId: string) => void
  endWorkout: (completed: boolean, exercisesCompleted: number) => Promise<void>
  updateWorkoutLog: (id: string, data: { duration: number; completed: boolean }) => Promise<void>
  deleteWorkoutLog: (id: string) => Promise<void>
  subscribeToData: () => void
  cleanup: () => void
  getThisWeeksWorkouts: () => number
}

export const useWorkoutsStore = create<WorkoutsState>((set, get) => ({
  routines: [],
  logs: [],
  activeWorkout: null,
  loading: false,
  unsubscribeRoutines: null,
  unsubscribeLogs: null,

  createRoutine: async (name: string, exercises: Omit<Exercise, 'id'>[]) => {
    const user = useAuthStore.getState().user
    if (!user) return

    set({ loading: true })
    try {
      const exercisesWithIds = exercises.map((e, i) => ({
        ...e,
        id: `ex-${Date.now()}-${i}`,
      }))

      await addDoc(collection(db, 'routines'), {
        userId: user.uid,
        name,
        exercises: exercisesWithIds,
        createdAt: Timestamp.now(),
      })

      set({ loading: false })
    } catch (error) {
      console.error('Error creating routine:', error)
      set({ loading: false })
    }
  },

  updateRoutine: async (id: string, name: string, exercises: Exercise[]) => {
    try {
      await updateDoc(doc(db, 'routines', id), { name, exercises })
    } catch (error) {
      console.error('Error updating routine:', error)
    }
  },

  deleteRoutine: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'routines', id))
    } catch (error) {
      console.error('Error deleting routine:', error)
    }
  },

  startWorkout: (routineId: string) => {
    set({ activeWorkout: { routineId, startTime: new Date() } })
  },

  endWorkout: async (completed: boolean, exercisesCompleted: number) => {
    const user = useAuthStore.getState().user
    const { activeWorkout, routines } = get()
    if (!user || !activeWorkout) return

    const routine = routines.find((r) => r.id === activeWorkout.routineId)
    if (!routine) return

    const duration = Math.round(
      (new Date().getTime() - activeWorkout.startTime.getTime()) / 60000
    )

    try {
      await addDoc(collection(db, 'workoutLogs'), {
        userId: user.uid,
        routineId: activeWorkout.routineId,
        routineName: routine.name,
        date: Timestamp.now(),
        duration,
        completed,
        exercisesCompleted,
      })

      set({ activeWorkout: null })
    } catch (error) {
      console.error('Error logging workout:', error)
    }
  },

  updateWorkoutLog: async (id: string, data: { duration: number; completed: boolean }) => {
    try {
      await updateDoc(doc(db, 'workoutLogs', id), data)
    } catch (error) {
      console.error('Error updating workout log:', error)
    }
  },

  deleteWorkoutLog: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'workoutLogs', id))
    } catch (error) {
      console.error('Error deleting workout log:', error)
    }
  },

  subscribeToData: () => {
    const user = useAuthStore.getState().user
    if (!user) return

    // Subscribe to routines
    const routinesQuery = query(
      collection(db, 'routines'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )

    const unsubscribeRoutines = onSnapshot(routinesQuery, (snapshot) => {
      const routines: WorkoutRoutine[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        routines.push({
          id: doc.id,
          userId: data.userId,
          name: data.name,
          exercises: data.exercises,
          createdAt: data.createdAt.toDate(),
        })
      })
      set({ routines })
    })

    // Subscribe to workout logs (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const logsQuery = query(
      collection(db, 'workoutLogs'),
      where('userId', '==', user.uid),
      where('date', '>=', Timestamp.fromDate(thirtyDaysAgo)),
      orderBy('date', 'desc')
    )

    const unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
      const logs: WorkoutLog[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        logs.push({
          id: doc.id,
          userId: data.userId,
          routineId: data.routineId,
          routineName: data.routineName,
          date: data.date.toDate(),
          duration: data.duration,
          completed: data.completed,
          exercisesCompleted: data.exercisesCompleted,
        })
      })
      set({ logs })
    })

    set({ unsubscribeRoutines, unsubscribeLogs })
  },

  cleanup: () => {
    const { unsubscribeRoutines, unsubscribeLogs } = get()
    if (unsubscribeRoutines) unsubscribeRoutines()
    if (unsubscribeLogs) unsubscribeLogs()
    set({ unsubscribeRoutines: null, unsubscribeLogs: null })
  },

  getThisWeeksWorkouts: () => {
    const { logs } = get()
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    return logs.filter((log) => log.date >= weekAgo).length
  },
}))
