import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  calculateBMR,
  calculateTDEE,
  calculateDailyDeficit,
  calculateDailyCalories,
  calculateMacros,
  calculateWeeklyLoss,
  type Gender,
  type ActivityLevel,
} from '../lib/calorieCalculator'

export interface Goals {
  calories: number
  protein: number // grams
  carbs: number   // grams
  fat: number     // grams
}

export interface UserProfile {
  age: number | null
  gender: Gender | null
  height: number | null         // cm
  currentWeight: number | null  // kg
  activityLevel: ActivityLevel | null
  targetWeight: number | null   // kg
  targetDate: string | null     // ISO date
  isAutoCaloriesEnabled: boolean
}

export interface CalculatedMetrics {
  bmr: number | null
  tdee: number | null
  dailyDeficit: number | null
  weeklyLoss: number | null
}

interface SettingsState {
  goals: Goals
  profile: UserProfile
  metrics: CalculatedMetrics
  updateGoals: (goals: Partial<Goals>) => void
  updateProfile: (profile: Partial<UserProfile>) => void
  recalculateCalories: (currentWeight?: number, height?: number) => void
  hasCompletedSetup: () => boolean
  resetGoals: () => void
  resetProfile: () => void
}

const DEFAULT_GOALS: Goals = {
  calories: 2200,
  protein: 150,
  carbs: 250,
  fat: 70,
}

const DEFAULT_PROFILE: UserProfile = {
  age: null,
  gender: null,
  height: null,
  currentWeight: null,
  activityLevel: null,
  targetWeight: null,
  targetDate: null,
  isAutoCaloriesEnabled: true,
}

const DEFAULT_METRICS: CalculatedMetrics = {
  bmr: null,
  tdee: null,
  dailyDeficit: null,
  weeklyLoss: null,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      goals: { ...DEFAULT_GOALS },
      profile: { ...DEFAULT_PROFILE },
      metrics: { ...DEFAULT_METRICS },

      updateGoals: (newGoals: Partial<Goals>) => {
        set((state) => ({
          goals: { ...state.goals, ...newGoals },
        }))
      },

      updateProfile: (newProfile: Partial<UserProfile>) => {
        set((state) => ({
          profile: { ...state.profile, ...newProfile },
        }))
        // Auto-recalculate if enabled and we have enough data
        const state = get()
        if (state.profile.isAutoCaloriesEnabled) {
          get().recalculateCalories()
        }
      },

      recalculateCalories: (currentWeight?: number, height?: number) => {
        const { profile } = get()

        // Use provided values or fall back to stored profile
        const weight = currentWeight ?? profile.currentWeight
        const h = height ?? profile.height
        const { age, gender, activityLevel, targetWeight, targetDate } = profile

        // Need all values to calculate
        if (!weight || !h || !age || !gender || !activityLevel || !targetWeight || !targetDate) {
          return
        }

        const bmr = calculateBMR(weight, h, age, gender)
        const tdee = calculateTDEE(bmr, activityLevel)
        const dailyDeficit = calculateDailyDeficit(weight, targetWeight, targetDate)
        const dailyCalories = calculateDailyCalories(tdee, dailyDeficit, gender)
        const weeklyLoss = calculateWeeklyLoss(weight, targetWeight, targetDate)
        const macros = calculateMacros(dailyCalories)

        set({
          metrics: {
            bmr,
            tdee,
            dailyDeficit,
            weeklyLoss,
          },
          goals: {
            calories: dailyCalories,
            protein: macros.protein,
            carbs: macros.carbs,
            fat: macros.fat,
          },
          profile: {
            ...get().profile,
            currentWeight: weight,
            height: h,
          },
        })
      },

      hasCompletedSetup: () => {
        const { profile } = get()
        return !!(
          profile.age &&
          profile.gender &&
          profile.height &&
          profile.currentWeight &&
          profile.activityLevel &&
          profile.targetWeight &&
          profile.targetDate
        )
      },

      resetGoals: () => {
        set({ goals: { ...DEFAULT_GOALS } })
      },

      resetProfile: () => {
        set({
          profile: { ...DEFAULT_PROFILE },
          metrics: { ...DEFAULT_METRICS },
        })
      },
    }),
    {
      name: 'fast-track-settings',
    }
  )
)
