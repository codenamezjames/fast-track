import { create } from 'zustand'
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { getStartOfDay, getEndOfDay } from '../lib/dateUtils'
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
  userId: string
  date: Date
  type: MealType
  foods: FoodItem[]
  totalCalories: number
}

interface MealsState {
  meals: Meal[]
  loading: boolean
  unsubscribe: (() => void) | null
  selectedDate: Date

  addMeal: (type: MealType, foods: FoodItem[]) => Promise<void>
  updateMeal: (id: string, foods: FoodItem[]) => Promise<void>
  deleteMeal: (id: string) => Promise<void>
  subscribeToMeals: (date?: Date) => void
  setSelectedDate: (date: Date) => void
  cleanup: () => void
  getSelectedDateMeals: () => Meal[]
  getSelectedDateCalories: () => number
  getSelectedDateMacros: () => { protein: number; carbs: number; fat: number }
  getMealsByType: (type: MealType) => Meal[]
  isToday: () => boolean
  // For Dashboard - returns calories only if viewing today, otherwise 0
  getTodaysCalories: () => number
}

export const useMealsStore = create<MealsState>((set, get) => ({
  meals: [],
  loading: false,
  unsubscribe: null,
  selectedDate: getStartOfDay(new Date()),

  addMeal: async (type: MealType, foods: FoodItem[]) => {
    const user = useAuthStore.getState().user
    if (!user) return

    set({ loading: true })
    try {
      const totalCalories = foods.reduce((sum, food) => sum + food.calories, 0)

      await addDoc(collection(db, 'meals'), {
        userId: user.uid,
        date: Timestamp.now(),
        type,
        foods,
        totalCalories,
      })

      set({ loading: false })

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
      await updateDoc(doc(db, 'meals', id), {
        foods,
        totalCalories,
      })
      set({ loading: false })
    } catch (error) {
      console.error('Error updating meal:', error)
      set({ loading: false })
    }
  },

  deleteMeal: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'meals', id))
    } catch (error) {
      console.error('Error deleting meal:', error)
    }
  },

  setSelectedDate: (date: Date) => {
    const newDate = getStartOfDay(date)
    set({ selectedDate: newDate })
    get().subscribeToMeals(newDate)
  },

  subscribeToMeals: (date?: Date) => {
    const user = useAuthStore.getState().user
    if (!user) return

    // Clean up any existing subscription first
    const { unsubscribe: existingUnsubscribe } = get()
    if (existingUnsubscribe) {
      existingUnsubscribe()
    }

    // Clear stale meals immediately
    set({ meals: [], unsubscribe: null })

    // Use provided date or selectedDate
    const targetDate = date || get().selectedDate
    const dayStart = getStartOfDay(targetDate)
    const dayEnd = getEndOfDay(targetDate)

    // Debug: verify timezone handling
    console.log('Querying meals for:', {
      localDate: targetDate.toLocaleDateString(),
      rangeStart: dayStart.toLocaleString(),
      rangeEnd: dayEnd.toLocaleString(),
      utcStart: dayStart.toISOString(),
      utcEnd: dayEnd.toISOString(),
    })

    const q = query(
      collection(db, 'meals'),
      where('userId', '==', user.uid),
      where('date', '>=', Timestamp.fromDate(dayStart)),
      where('date', '<=', Timestamp.fromDate(dayEnd)),
      orderBy('date', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const meals: Meal[] = []

      snapshot.forEach((doc) => {
        const data = doc.data()
        const mealDate = data.date.toDate()
        console.log('Meal:', data.type, 'logged at', mealDate.toLocaleString(), '(local)')
        meals.push({
          id: doc.id,
          userId: data.userId,
          date: mealDate,
          type: data.type,
          foods: data.foods,
          totalCalories: data.totalCalories,
        })
      })

      console.log('Found', meals.length, 'meals for this date')
      set({ meals })
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

  getSelectedDateMeals: () => {
    // Meals are already filtered by date in the query
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
    // Only return calories if we're viewing today
    if (get().isToday()) {
      return get().getSelectedDateCalories()
    }
    return 0
  },
}))
