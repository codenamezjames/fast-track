import { create } from 'zustand'
import { api } from '../lib/api'
import { getDateString, getWeekDates, getStartOfMonth, getEndOfMonth } from '../lib/dateUtils'
import { useAuthStore } from './authStore'

export const MILESTONES = [3, 7, 14, 30, 50, 100, 150, 200, 365, 500, 1000]

export interface DailyActivity {
  date: string
  fastCompleted: boolean
  mealsLogged: boolean
  workoutCompleted: boolean
  streakMaintained: boolean
}

export interface StreakData {
  currentStreak: number
  longestStreak: number
  freezesAvailable: number
  freezesUsed: number
  lastActiveDate: string | null
  milestonesAchieved: number[]
  totalActiveDays: number
}

interface StreakResponse {
  _id?: string
  userId?: string
  currentStreak: number
  longestStreak: number
  freezesAvailable: number
  freezesUsed: number
  lastActiveDate: string | null
  milestonesAchieved: number[]
  totalActiveDays: number
}

interface DailyActivityResponse {
  _id?: string
  userId?: string
  date: string
  fastCompleted: boolean
  mealsLogged: boolean
  workoutCompleted: boolean
  streakMaintained: boolean
}

export interface HistoryStats {
  totalDays: number
  activeDays: number
  completionRate: number
  bestDayOfWeek: number
  dayOfWeekBreakdown: { day: number; count: number }[]
  activityBreakdown: { fasting: number; meals: number; workouts: number }
}

interface HistoryResponse {
  activities: DailyActivityResponse[]
  stats: HistoryStats
}

interface StreakState {
  streakData: StreakData
  weekActivities: DailyActivity[]
  todayActivity: DailyActivity | null
  loading: boolean
  showMilestone: number | null
  showDailyGoal: boolean

  // History state
  monthActivities: DailyActivity[]
  selectedMonth: Date
  historyStats: HistoryStats | null
  historyLoading: boolean

  fetchStreak: () => Promise<void>
  updateTodayActivity: (activity: Partial<DailyActivity>) => Promise<void>
  useStreakFreeze: () => Promise<boolean>
  earnStreakFreeze: () => Promise<void>
  checkAndUpdateStreak: () => Promise<void>
  dismissMilestone: () => void
  dismissDailyGoal: () => void
  triggerDailyGoal: () => void
  getStreakIntensity: () => 'cold' | 'warm' | 'hot' | 'fire' | 'inferno'
  isTodayComplete: () => boolean

  // History actions
  fetchMonthHistory: (month: Date) => Promise<void>
  setSelectedMonth: (month: Date) => void
}

const defaultStreakData: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  freezesAvailable: 1,
  freezesUsed: 0,
  lastActiveDate: null,
  milestonesAchieved: [],
  totalActiveDays: 0,
}

export const useStreakStore = create<StreakState>((set, get) => ({
  streakData: defaultStreakData,
  weekActivities: [],
  todayActivity: null,
  loading: false,
  showMilestone: null,
  showDailyGoal: false,

  // History state
  monthActivities: [],
  selectedMonth: new Date(),
  historyStats: null,
  historyLoading: false,

  fetchStreak: async () => {
    const user = useAuthStore.getState().user
    if (!user) return

    set({ loading: true })
    try {
      // Fetch streak data
      const streakData = await api.get<StreakResponse>('/streaks')

      // Fetch week's activities
      const weekDates = getWeekDates()
      const activitiesData = await api.get<DailyActivityResponse[]>(
        `/streaks/daily-activities?dates=${weekDates.join(',')}`
      )

      const today = getDateString()
      let todayAct: DailyActivity | null = null

      const activities: DailyActivity[] = activitiesData.map((a) => {
        const activity: DailyActivity = {
          date: a.date,
          fastCompleted: a.fastCompleted,
          mealsLogged: a.mealsLogged,
          workoutCompleted: a.workoutCompleted,
          streakMaintained: a.streakMaintained,
        }
        if (a.date === today) {
          todayAct = activity
        }
        return activity
      })

      // Fill in missing days
      const weekActivities = weekDates.map((date) => {
        const existing = activities.find((a) => a.date === date)
        return existing || {
          date,
          fastCompleted: false,
          mealsLogged: false,
          workoutCompleted: false,
          streakMaintained: false,
        }
      })

      set({
        streakData: {
          currentStreak: streakData.currentStreak,
          longestStreak: streakData.longestStreak,
          freezesAvailable: streakData.freezesAvailable,
          freezesUsed: streakData.freezesUsed,
          lastActiveDate: streakData.lastActiveDate,
          milestonesAchieved: streakData.milestonesAchieved,
          totalActiveDays: streakData.totalActiveDays,
        },
        weekActivities,
        todayActivity: todayAct,
        loading: false,
      })

      // Check for missed days
      await get().checkAndUpdateStreak()
    } catch (error) {
      console.error('Error fetching streak:', error)
      set({ loading: false })
    }
  },

  updateTodayActivity: async (activity: Partial<DailyActivity>) => {
    const user = useAuthStore.getState().user
    if (!user) return

    const today = getDateString()
    const current = get().todayActivity || {
      date: today,
      fastCompleted: false,
      mealsLogged: false,
      workoutCompleted: false,
      streakMaintained: false,
    }

    const updated = { ...current, ...activity }

    // Check if streak requirement is met
    const activitiesCount = [
      updated.fastCompleted,
      updated.mealsLogged,
      updated.workoutCompleted,
    ].filter(Boolean).length

    updated.streakMaintained = activitiesCount >= 2

    try {
      await api.put(`/streaks/daily-activities/${today}`, updated)
      set({ todayActivity: updated })

      if (updated.streakMaintained && !current.streakMaintained) {
        set({ showDailyGoal: true })
        await get().checkAndUpdateStreak()
      }
    } catch (error) {
      console.error('Error updating daily activity:', error)
    }
  },

  checkAndUpdateStreak: async () => {
    const user = useAuthStore.getState().user
    if (!user) return

    const { streakData, todayActivity } = get()
    const today = getDateString()
    const yesterday = getDateString(new Date(Date.now() - 86400000))

    let newStreak = streakData.currentStreak
    let newFreezes = streakData.freezesAvailable
    let freezesUsed = streakData.freezesUsed
    let longestStreak = streakData.longestStreak
    let totalActiveDays = streakData.totalActiveDays
    let milestonesAchieved = [...streakData.milestonesAchieved]
    let newMilestone: number | null = null

    if (todayActivity?.streakMaintained) {
      if (streakData.lastActiveDate === yesterday) {
        newStreak = streakData.currentStreak + 1
      } else if (streakData.lastActiveDate === today) {
        return
      } else if (streakData.lastActiveDate) {
        const lastDate = new Date(streakData.lastActiveDate)
        const daysMissed = Math.floor((Date.now() - lastDate.getTime()) / 86400000) - 1

        if (daysMissed === 1 && streakData.freezesAvailable > 0) {
          newFreezes = streakData.freezesAvailable - 1
          freezesUsed = streakData.freezesUsed + 1
          newStreak = streakData.currentStreak + 1
        } else {
          newStreak = 1
        }
      } else {
        newStreak = 1
      }

      totalActiveDays++

      if (MILESTONES.includes(newStreak) && !milestonesAchieved.includes(newStreak)) {
        milestonesAchieved.push(newStreak)
        newMilestone = newStreak

        if ([7, 30, 100, 365].includes(newStreak)) {
          newFreezes++
        }
      }

      longestStreak = Math.max(longestStreak, newStreak)

      try {
        await api.put('/streaks', {
          currentStreak: newStreak,
          longestStreak,
          freezesAvailable: newFreezes,
          freezesUsed,
          lastActiveDate: today,
          milestonesAchieved,
          totalActiveDays,
        })

        set({
          streakData: {
            currentStreak: newStreak,
            longestStreak,
            freezesAvailable: newFreezes,
            freezesUsed,
            lastActiveDate: today,
            milestonesAchieved,
            totalActiveDays,
          },
        })

        if (newMilestone) {
          set({ showMilestone: newMilestone })
        }
      } catch (error) {
        console.error('Error updating streak:', error)
      }
    }
  },

  useStreakFreeze: async () => {
    const user = useAuthStore.getState().user
    if (!user) return false

    const { streakData } = get()
    if (streakData.freezesAvailable <= 0) return false

    try {
      await api.put('/streaks', {
        freezesAvailable: streakData.freezesAvailable - 1,
        freezesUsed: streakData.freezesUsed + 1,
      })

      set({
        streakData: {
          ...streakData,
          freezesAvailable: streakData.freezesAvailable - 1,
          freezesUsed: streakData.freezesUsed + 1,
        },
      })

      return true
    } catch (error) {
      console.error('Error using streak freeze:', error)
      return false
    }
  },

  earnStreakFreeze: async () => {
    const user = useAuthStore.getState().user
    if (!user) return

    const { streakData } = get()

    try {
      await api.put('/streaks', {
        freezesAvailable: streakData.freezesAvailable + 1,
      })

      set({
        streakData: {
          ...streakData,
          freezesAvailable: streakData.freezesAvailable + 1,
        },
      })
    } catch (error) {
      console.error('Error earning streak freeze:', error)
    }
  },

  dismissMilestone: () => {
    set({ showMilestone: null })
  },

  dismissDailyGoal: () => {
    set({ showDailyGoal: false })
  },

  triggerDailyGoal: () => {
    set({ showDailyGoal: true })
  },

  getStreakIntensity: () => {
    const { streakData } = get()
    const streak = streakData.currentStreak

    if (streak >= 100) return 'inferno'
    if (streak >= 30) return 'fire'
    if (streak >= 14) return 'hot'
    if (streak >= 7) return 'warm'
    return 'cold'
  },

  isTodayComplete: () => {
    const { todayActivity } = get()
    return todayActivity?.streakMaintained ?? false
  },

  // History actions
  fetchMonthHistory: async (month: Date) => {
    const user = useAuthStore.getState().user
    if (!user) return

    set({ historyLoading: true })
    try {
      const startDate = getDateString(getStartOfMonth(month))
      const endDate = getDateString(getEndOfMonth(month))

      const response = await api.get<HistoryResponse>(
        `/streaks/history?startDate=${startDate}&endDate=${endDate}`
      )

      const activities: DailyActivity[] = response.activities.map((a) => ({
        date: a.date,
        fastCompleted: a.fastCompleted,
        mealsLogged: a.mealsLogged,
        workoutCompleted: a.workoutCompleted,
        streakMaintained: a.streakMaintained,
      }))

      set({
        monthActivities: activities,
        historyStats: response.stats,
        historyLoading: false,
      })
    } catch (error) {
      console.error('Error fetching month history:', error)
      set({ historyLoading: false })
    }
  },

  setSelectedMonth: (month: Date) => {
    set({ selectedMonth: month })
    get().fetchMonthHistory(month)
  },
}))
