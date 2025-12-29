import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/lib/api'
import type { Meal, MealType, FoodItem, DailySummary } from '@/types'

export const useMealsStore = defineStore('meals', () => {
  // State
  const meals = ref<Meal[]>([])
  const dailySummary = ref<DailySummary | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  async function fetchMeals(startDate?: string, endDate?: string) {
    loading.value = true
    error.value = null

    try {
      const params: Record<string, string> = {}
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const response = await api.get<{ meals: Meal[] }>('/meals', { params })
      meals.value = response.data.meals
      return response.data.meals
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch meals'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchMeal(id: number) {
    loading.value = true
    error.value = null

    try {
      const response = await api.get<{ meal: Meal }>(`/meals/${id}`)
      return response.data.meal
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch meal'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createMeal(data: {
    date: Date
    type: MealType
    foods: FoodItem[]
    totalCalories: number
  }) {
    loading.value = true
    error.value = null

    try {
      const response = await api.post<{ meal: Meal }>('/meals', data)
      meals.value.unshift(response.data.meal)
      return response.data.meal
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create meal'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateMeal(
    id: number,
    data: {
      date?: Date
      type?: MealType
      foods?: FoodItem[]
      totalCalories?: number
    }
  ) {
    loading.value = true
    error.value = null

    try {
      const response = await api.put<{ meal: Meal }>(`/meals/${id}`, data)
      const index = meals.value.findIndex((m) => m.id === id)
      if (index !== -1) {
        meals.value[index] = response.data.meal
      }
      return response.data.meal
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update meal'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteMeal(id: number) {
    loading.value = true
    error.value = null

    try {
      await api.delete(`/meals/${id}`)
      meals.value = meals.value.filter((m) => m.id !== id)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete meal'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchDailySummary(date?: string) {
    loading.value = true
    error.value = null

    try {
      const params: Record<string, string> = {}
      if (date) params.date = date

      const response = await api.get<{ summary: DailySummary }>('/meals/daily-summary', { params })
      dailySummary.value = response.data.summary
      return response.data.summary
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch daily summary'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function resetStore() {
    meals.value = []
    dailySummary.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    meals,
    dailySummary,
    loading,
    error,
    // Actions
    fetchMeals,
    fetchMeal,
    createMeal,
    updateMeal,
    deleteMeal,
    fetchDailySummary,
    clearError,
    resetStore,
  }
})
