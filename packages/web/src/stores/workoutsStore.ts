import { create } from 'zustand'
import { api } from '../lib/api'
import { useAuthStore } from './authStore'
import { useStreakStore } from './streakStore'

export interface Exercise {
  id: string
  name: string
  sets: number
  reps: number
  weight?: number
}

export interface WorkoutRoutine {
  id: string
  _id?: string
  userId: string
  name: string
  exercises: Exercise[]
  createdAt: Date
}

export interface WorkoutLog {
  id: string
  _id?: string
  userId: string
  routineId: string
  routineName: string
  date: Date
  duration: number
  completed: boolean
  exercisesCompleted: number
}

interface RoutineResponse {
  _id: string
  userId: string
  name: string
  exercises: Exercise[]
  createdAt: string
}

interface WorkoutLogResponse {
  _id: string
  userId: string
  routineId: string
  routineName: string
  date: string
  duration: number
  completed: boolean
  exercisesCompleted: number
}

interface WorkoutsState {
  routines: WorkoutRoutine[]
  logs: WorkoutLog[]
  activeWorkout: { routineId: string; startTime: Date } | null
  loading: boolean

  createRoutine: (name: string, exercises: Omit<Exercise, 'id'>[]) => Promise<void>
  updateRoutine: (id: string, name: string, exercises: Exercise[]) => Promise<void>
  deleteRoutine: (id: string) => Promise<void>
  startWorkout: (routineId: string) => void
  endWorkout: (completed: boolean, exercisesCompleted: number) => Promise<void>
  updateWorkoutLog: (id: string, data: { duration: number; completed: boolean }) => Promise<void>
  deleteWorkoutLog: (id: string) => Promise<void>
  fetchData: () => Promise<void>
  getThisWeeksWorkouts: () => number
}

export const useWorkoutsStore = create<WorkoutsState>((set, get) => ({
  routines: [],
  logs: [],
  activeWorkout: null,
  loading: false,

  createRoutine: async (name: string, exercises: Omit<Exercise, 'id'>[]) => {
    const user = useAuthStore.getState().user
    if (!user) return

    set({ loading: true })
    try {
      const exercisesWithIds = exercises.map((e, i) => ({
        ...e,
        id: `ex-${Date.now()}-${i}`,
      }))

      await api.post('/routines', { name, exercises: exercisesWithIds })
      set({ loading: false })
      get().fetchData()
    } catch (error) {
      console.error('Error creating routine:', error)
      set({ loading: false })
    }
  },

  updateRoutine: async (id: string, name: string, exercises: Exercise[]) => {
    try {
      await api.put(`/routines/${id}`, { name, exercises })
      get().fetchData()
    } catch (error) {
      console.error('Error updating routine:', error)
    }
  },

  deleteRoutine: async (id: string) => {
    try {
      await api.delete(`/routines/${id}`)
      get().fetchData()
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
      await api.post('/workout-logs', {
        routineId: activeWorkout.routineId,
        routineName: routine.name,
        date: new Date().toISOString(),
        duration,
        completed,
        exercisesCompleted,
      })

      set({ activeWorkout: null })
      get().fetchData()

      if (completed) {
        useStreakStore.getState().updateTodayActivity({ workoutCompleted: true })
      }
    } catch (error) {
      console.error('Error logging workout:', error)
    }
  },

  updateWorkoutLog: async (id: string, data: { duration: number; completed: boolean }) => {
    try {
      await api.put(`/workout-logs/${id}`, data)
      get().fetchData()
    } catch (error) {
      console.error('Error updating workout log:', error)
    }
  },

  deleteWorkoutLog: async (id: string) => {
    try {
      await api.delete(`/workout-logs/${id}`)
      get().fetchData()
    } catch (error) {
      console.error('Error deleting workout log:', error)
    }
  },

  fetchData: async () => {
    const user = useAuthStore.getState().user
    if (!user) return

    set({ loading: true })
    try {
      const [routinesData, logsData] = await Promise.all([
        api.get<RoutineResponse[]>('/routines'),
        api.get<WorkoutLogResponse[]>('/workout-logs?days=30'),
      ])

      set({
        routines: routinesData.map((r) => ({
          id: r._id,
          _id: r._id,
          userId: r.userId,
          name: r.name,
          exercises: r.exercises,
          createdAt: new Date(r.createdAt),
        })),
        logs: logsData.map((l) => ({
          id: l._id,
          _id: l._id,
          userId: l.userId,
          routineId: l.routineId,
          routineName: l.routineName,
          date: new Date(l.date),
          duration: l.duration,
          completed: l.completed,
          exercisesCompleted: l.exercisesCompleted,
        })),
        loading: false,
      })
    } catch (error) {
      console.error('Error fetching workout data:', error)
      set({ loading: false })
    }
  },

  getThisWeeksWorkouts: () => {
    const { logs } = get()
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    return logs.filter((log) => log.date >= weekAgo).length
  },
}))
