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

  addMeal: (type: MealType, foods: FoodItem[]) => Promise<void>
  updateMeal: (id: string, foods: FoodItem[]) => Promise<void>
  deleteMeal: (id: string) => Promise<void>
  subscribeToMeals: () => void
  cleanup: () => void
  getTodaysMeals: () => Meal[]
  getTodaysCalories: () => number
  getTodaysMacros: () => { protein: number; carbs: number; fat: number }
  getMealsByType: (type: MealType) => Meal[]
}

export const useMealsStore = create<MealsState>((set, get) => ({
  meals: [],
  loading: false,
  unsubscribe: null,

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

  subscribeToMeals: () => {
    const user = useAuthStore.getState().user
    if (!user) return

    // Get today's start
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const q = query(
      collection(db, 'meals'),
      where('userId', '==', user.uid),
      where('date', '>=', Timestamp.fromDate(today)),
      orderBy('date', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const meals: Meal[] = []

      snapshot.forEach((doc) => {
        const data = doc.data()
        meals.push({
          id: doc.id,
          userId: data.userId,
          date: data.date.toDate(),
          type: data.type,
          foods: data.foods,
          totalCalories: data.totalCalories,
        })
      })

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

  getTodaysMeals: () => {
    const { meals } = get()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return meals.filter((meal) => {
      const mealDate = new Date(meal.date)
      mealDate.setHours(0, 0, 0, 0)
      return mealDate.getTime() === today.getTime()
    })
  },

  getTodaysCalories: () => {
    const todaysMeals = get().getTodaysMeals()
    return todaysMeals.reduce((sum, meal) => sum + meal.totalCalories, 0)
  },

  getTodaysMacros: () => {
    const todaysMeals = get().getTodaysMeals()
    let protein = 0
    let carbs = 0
    let fat = 0

    todaysMeals.forEach((meal) => {
      meal.foods.forEach((food) => {
        protein += food.protein || 0
        carbs += food.carbs || 0
        fat += food.fat || 0
      })
    })

    return { protein, carbs, fat }
  },

  getMealsByType: (type: MealType) => {
    return get().getTodaysMeals().filter((meal) => meal.type === type)
  },
}))
