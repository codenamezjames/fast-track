import { create } from 'zustand'
import {
  doc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { getDateString, getWeekDates } from '../lib/dateUtils'
import { useAuthStore } from './authStore'

// Milestones to celebrate
export const MILESTONES = [3, 7, 14, 30, 50, 100, 150, 200, 365, 500, 1000]

export interface DailyActivity {
  date: string // YYYY-MM-DD
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

interface StreakState {
  streakData: StreakData
  weekActivities: DailyActivity[]
  todayActivity: DailyActivity | null
  loading: boolean
  showMilestone: number | null
  showDailyGoal: boolean
  unsubscribe: (() => void) | null

  subscribeToStreak: () => void
  cleanup: () => void
  updateTodayActivity: (activity: Partial<DailyActivity>) => Promise<void>
  useStreakFreeze: () => Promise<boolean>
  earnStreakFreeze: () => Promise<void>
  checkAndUpdateStreak: () => Promise<void>
  dismissMilestone: () => void
  dismissDailyGoal: () => void
  triggerDailyGoal: () => void
  getStreakIntensity: () => 'cold' | 'warm' | 'hot' | 'fire' | 'inferno'
  isTodayComplete: () => boolean
}

const defaultStreakData: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  freezesAvailable: 1, // Start with one free freeze
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
  unsubscribe: null,

  subscribeToStreak: () => {
    const user = useAuthStore.getState().user
    if (!user) return

    // Subscribe to streak data
    const streakDocRef = doc(db, 'streaks', user.uid)
    const unsubStreakData = onSnapshot(streakDocRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as StreakData
        set({ streakData: data })

        // Check for missed days and potentially break streak
        await get().checkAndUpdateStreak()
      } else {
        // Create initial streak document
        await setDoc(streakDocRef, defaultStreakData)
        set({ streakData: defaultStreakData })
      }
    })

    // Subscribe to week's activities
    const weekDates = getWeekDates()
    const activitiesRef = collection(db, 'users', user.uid, 'dailyActivities')
    // Note: removed orderBy to avoid needing composite index - we sort client-side
    const q = query(
      activitiesRef,
      where('date', 'in', weekDates)
    )

    const unsubActivities = onSnapshot(q, (snapshot) => {
      const activities: DailyActivity[] = []
      const today = getDateString()
      let todayAct: DailyActivity | null = null

      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as DailyActivity
        activities.push(data)
        if (data.date === today) {
          todayAct = data
        }
      })

      // Fill in missing days with empty activities
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

      set({ weekActivities, todayActivity: todayAct })
    })

    const cleanup = () => {
      unsubStreakData()
      unsubActivities()
    }

    set({ unsubscribe: cleanup })
  },

  cleanup: () => {
    const { unsubscribe } = get()
    if (unsubscribe) {
      unsubscribe()
      set({ unsubscribe: null })
    }
  },

  updateTodayActivity: async (activity: Partial<DailyActivity>) => {
    const user = useAuthStore.getState().user
    if (!user) return

    const today = getDateString()
    const activityRef = doc(db, 'users', user.uid, 'dailyActivities', today)

    const current = get().todayActivity || {
      date: today,
      fastCompleted: false,
      mealsLogged: false,
      workoutCompleted: false,
      streakMaintained: false,
    }

    const updated = { ...current, ...activity }

    // Check if streak requirement is met (custom combo: 2+ activities)
    const activitiesCount = [
      updated.fastCompleted,
      updated.mealsLogged,
      updated.workoutCompleted,
    ].filter(Boolean).length

    updated.streakMaintained = activitiesCount >= 2

    await setDoc(activityRef, updated)

    // If streak is now maintained, update streak data and show celebration
    if (updated.streakMaintained && !current.streakMaintained) {
      set({ showDailyGoal: true })
      await get().checkAndUpdateStreak()
    }
  },

  checkAndUpdateStreak: async () => {
    const user = useAuthStore.getState().user
    if (!user) return

    const { streakData, todayActivity } = get()
    const today = getDateString()
    const yesterday = getDateString(new Date(Date.now() - 86400000))

    const streakRef = doc(db, 'streaks', user.uid)
    let newStreak = streakData.currentStreak
    let newFreezes = streakData.freezesAvailable
    let freezesUsed = streakData.freezesUsed
    let longestStreak = streakData.longestStreak
    let totalActiveDays = streakData.totalActiveDays
    let milestonesAchieved = [...streakData.milestonesAchieved]
    let newMilestone: number | null = null

    // If today is complete
    if (todayActivity?.streakMaintained) {
      if (streakData.lastActiveDate === yesterday) {
        // Continuing streak
        newStreak = streakData.currentStreak + 1
      } else if (streakData.lastActiveDate === today) {
        // Already counted today
        return
      } else if (streakData.lastActiveDate) {
        // Missed days - check if we can use a freeze
        const lastDate = new Date(streakData.lastActiveDate)
        const daysMissed = Math.floor((Date.now() - lastDate.getTime()) / 86400000) - 1

        if (daysMissed === 1 && streakData.freezesAvailable > 0) {
          // Use a freeze
          newFreezes = streakData.freezesAvailable - 1
          freezesUsed = streakData.freezesUsed + 1
          newStreak = streakData.currentStreak + 1
        } else {
          // Streak broken
          newStreak = 1
        }
      } else {
        // First ever activity
        newStreak = 1
      }

      totalActiveDays++

      // Check for new milestone
      if (MILESTONES.includes(newStreak) && !milestonesAchieved.includes(newStreak)) {
        milestonesAchieved.push(newStreak)
        newMilestone = newStreak

        // Earn a freeze at certain milestones
        if ([7, 30, 100, 365].includes(newStreak)) {
          newFreezes++
        }
      }

      longestStreak = Math.max(longestStreak, newStreak)

      await updateDoc(streakRef, {
        currentStreak: newStreak,
        longestStreak,
        freezesAvailable: newFreezes,
        freezesUsed,
        lastActiveDate: today,
        milestonesAchieved,
        totalActiveDays,
      })

      if (newMilestone) {
        set({ showMilestone: newMilestone })
      }
    }
  },

  useStreakFreeze: async () => {
    const user = useAuthStore.getState().user
    if (!user) return false

    const { streakData } = get()
    if (streakData.freezesAvailable <= 0) return false

    const streakRef = doc(db, 'streaks', user.uid)
    await updateDoc(streakRef, {
      freezesAvailable: streakData.freezesAvailable - 1,
      freezesUsed: streakData.freezesUsed + 1,
    })

    return true
  },

  earnStreakFreeze: async () => {
    const user = useAuthStore.getState().user
    if (!user) return

    const { streakData } = get()
    const streakRef = doc(db, 'streaks', user.uid)
    await updateDoc(streakRef, {
      freezesAvailable: streakData.freezesAvailable + 1,
    })
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
}))
