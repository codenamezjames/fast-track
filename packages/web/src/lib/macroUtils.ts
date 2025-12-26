import type { FoodItem } from '../stores/mealsStore'

export interface MacroTotals {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export function calculateMacroTotals(foods: FoodItem[]): MacroTotals {
  return {
    calories: foods.reduce((sum, f) => sum + (f.calories || 0), 0),
    protein: foods.reduce((sum, f) => sum + (f.protein || 0), 0),
    carbs: foods.reduce((sum, f) => sum + (f.carbs || 0), 0),
    fat: foods.reduce((sum, f) => sum + (f.fat || 0), 0),
  }
}

export function formatMacroSummary(food: FoodItem): string {
  const parts = [`${food.calories} cal`]
  if (food.protein) parts.push(`P:${food.protein}g`)
  if (food.carbs) parts.push(`C:${food.carbs}g`)
  if (food.fat) parts.push(`F:${food.fat}g`)
  return parts.join(' | ')
}
