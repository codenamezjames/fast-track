import type { FoodItem } from '@/types'

export function useMacros() {
  /**
   * Calculate total macros from an array of food items
   */
  function calculateMacroTotals(foods: FoodItem[]) {
    return foods.reduce(
      (totals, food) => ({
        calories: totals.calories + food.calories,
        protein: totals.protein + (food.protein || 0),
        carbs: totals.carbs + (food.carbs || 0),
        fat: totals.fat + (food.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
  }

  /**
   * Calculate macro percentages from totals
   */
  function calculateMacroPercentages(totals: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }) {
    const proteinCals = totals.protein * 4
    const carbsCals = totals.carbs * 4
    const fatCals = totals.fat * 9

    const totalMacroCals = proteinCals + carbsCals + fatCals

    if (totalMacroCals === 0) {
      return { protein: 0, carbs: 0, fat: 0 }
    }

    return {
      protein: Math.round((proteinCals / totalMacroCals) * 100),
      carbs: Math.round((carbsCals / totalMacroCals) * 100),
      fat: Math.round((fatCals / totalMacroCals) * 100),
    }
  }

  /**
   * Format macro value with unit
   */
  function formatMacro(value: number, unit: 'g' | 'cal' = 'g'): string {
    return `${Math.round(value)}${unit}`
  }

  /**
   * Get macro color for UI
   */
  function getMacroColor(macro: 'protein' | 'carbs' | 'fat'): string {
    const colors = {
      protein: '#ef4444', // red
      carbs: '#3b82f6', // blue
      fat: '#f59e0b', // amber
    }
    return colors[macro]
  }

  /**
   * Calculate daily macro goals based on calories
   * Uses 30/40/30 split (protein/carbs/fat)
   */
  function calculateDailyMacroGoals(dailyCalories: number) {
    return {
      protein: Math.round((dailyCalories * 0.3) / 4), // 30% of calories, 4 cal/g
      carbs: Math.round((dailyCalories * 0.4) / 4), // 40% of calories, 4 cal/g
      fat: Math.round((dailyCalories * 0.3) / 9), // 30% of calories, 9 cal/g
    }
  }

  /**
   * Calculate macro progress percentage
   */
  function calculateMacroProgress(current: number, goal: number): number {
    if (goal === 0) return 0
    return Math.min(100, Math.round((current / goal) * 100))
  }

  return {
    calculateMacroTotals,
    calculateMacroPercentages,
    formatMacro,
    getMacroColor,
    calculateDailyMacroGoals,
    calculateMacroProgress,
  }
}
