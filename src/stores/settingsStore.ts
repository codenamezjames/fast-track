import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Goals {
  calories: number
  protein: number // grams
  carbs: number   // grams
  fat: number     // grams
}

interface SettingsState {
  goals: Goals
  updateGoals: (goals: Partial<Goals>) => void
  resetGoals: () => void
}

const DEFAULT_GOALS: Goals = {
  calories: 2200,
  protein: 150,
  carbs: 250,
  fat: 70,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      goals: { ...DEFAULT_GOALS },

      updateGoals: (newGoals: Partial<Goals>) => {
        set((state) => ({
          goals: { ...state.goals, ...newGoals },
        }))
      },

      resetGoals: () => {
        set({ goals: { ...DEFAULT_GOALS } })
      },
    }),
    {
      name: 'fast-track-settings',
    }
  )
)
