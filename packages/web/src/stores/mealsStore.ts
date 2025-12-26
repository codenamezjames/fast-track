import { create } from 'zustand'
import { api } from '../lib/api'
import { getStartOfDay, getDateString } from '../lib/dateUtils'
import { useAuthStore } from './authStore'
import { useStreakStore } from './streakStore'

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface FoodItem {
  name: string
  calories: number
  protein?: number
  carbs?: number
  fat?: number
  servingSize?: string
}

export interface Meal {
  id: string
  _id?: string
  userId: string
  date: Date
  type: MealType
  foods: FoodItem[]
  totalCalories: number
}

interface MealsState {
  meals: Meal[]
  loading: boolean
  selectedDate: Date

  addMeal: (type: MealType, foods: FoodItem[]) => Promise<void>
  updateMeal: (id: string, foods: FoodItem[]) => Promise<void>
  deleteMeal: (id: string) => Promise<void>
  fetchMeals: (date?: Date) => Promise<void>
  setSelectedDate: (date: Date) => void
  getSelectedDateMeals: () => Meal[]
  getSelectedDateCalories: () => number
  getSelectedDateMacros: () => { protein: number; carbs: number; fat: number }
  getMealsByType: (type: MealType) => Meal[]
  isToday: () => boolean
  getTodaysCalories: () => number
}

interface MealResponse {
  _id: string
  userId: string
  date: string
  type: MealType
  foods: FoodItem[]
  totalCalories: number
}

export const useMealsStore = create<MealsState>((set, get) => ({
  meals: [],
  loading: false,
  selectedDate: getStartOfDay(new Date()),

  addMeal: async (type: MealType, foods: FoodItem[]) => {
    const user = useAuthStore.getState().user
    if (!user) return

    set({ loading: true })
    try {
      const totalCalories = foods.reduce((sum, food) => sum + food.calories, 0)

      await api.post('/meals', {
        type,
        foods,
        totalCalories,
        date: new Date().toISOString(),
      })

      set({ loading: false })

      // Refresh meals list
      get().fetchMeals()

      // Update streak - meal logged
      useStreakStore.getState().updateTodayActivity({ mealsLogged: true })
    } catch (error) {
      console.error('Error adding meal:', error)
      set({ loading: false })
    }
  },

  updateMeal: async (id: string, foods: FoodItem[]) => {
    set({ loading: true })
    try {
      const totalCalories = foods.reduce((sum, food) => sum + food.calories, 0)
      await api.put(`/meals/${id}`, { foods, totalCalories })
      set({ loading: false })
      get().fetchMeals()
    } catch (error) {
      console.error('Error updating meal:', error)
      set({ loading: false })
    }
  },

  deleteMeal: async (id: string) => {
    try {
      await api.delete(`/meals/${id}`)
      get().fetchMeals()
    } catch (error) {
      console.error('Error deleting meal:', error)
    }
  },

  setSelectedDate: (date: Date) => {
    const newDate = getStartOfDay(date)
    set({ selectedDate: newDate })
    get().fetchMeals(newDate)
  },

  fetchMeals: async (date?: Date) => {
    const user = useAuthStore.getState().user
    if (!user) return

    const targetDate = date || get().selectedDate
    const dateStr = getDateString(targetDate)

    set({ loading: true })
    try {
      const meals = await api.get<MealResponse[]>(`/meals?date=${dateStr}`)

      set({
        meals: meals.map((m) => ({
          id: m._id,
          _id: m._id,
          userId: m.userId,
          date: new Date(m.date),
          type: m.type,
          foods: m.foods,
          totalCalories: m.totalCalories,
        })),
        loading: false,
      })
    } catch (error) {
      console.error('Error fetching meals:', error)
      set({ loading: false })
    }
  },

  getSelectedDateMeals: () => {
    return get().meals
  },

  getSelectedDateCalories: () => {
    return get().meals.reduce((sum, meal) => sum + meal.totalCalories, 0)
  },

  getSelectedDateMacros: () => {
    let protein = 0
    let carbs = 0
    let fat = 0

    get().meals.forEach((meal) => {
      meal.foods.forEach((food) => {
        protein += food.protein || 0
        carbs += food.carbs || 0
        fat += food.fat || 0
      })
    })

    return { protein, carbs, fat }
  },

  getMealsByType: (type: MealType) => {
    return get().meals.filter((meal) => meal.type === type)
  },

  isToday: () => {
    const { selectedDate } = get()
    const today = getStartOfDay(new Date())
    return selectedDate.getTime() === today.getTime()
  },

  getTodaysCalories: () => {
    if (get().isToday()) {
      return get().getSelectedDateCalories()
    }
    return 0
  },
}))
