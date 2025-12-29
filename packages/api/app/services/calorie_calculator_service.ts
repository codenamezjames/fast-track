/**
 * CalorieCalculatorService
 *
 * Implements calorie and macro calculations as specified in the REWRITE_SPEC:
 * - BMR (Basal Metabolic Rate) using Mifflin-St Jeor equation
 * - TDEE (Total Daily Energy Expenditure) using activity multipliers
 * - Daily calorie goals based on weight loss targets
 * - Macro breakdown (30/40/30 protein/carbs/fat by default)
 */

export type Gender = 'male' | 'female'
export type ActivityLevel = 'sedentary' | 'moderate' | 'active'

export interface CalorieCalculationInput {
  weight: number // kg
  height: number // cm
  age: number // years
  gender: Gender
  activityLevel: ActivityLevel
  targetWeight?: number // kg
  targetDate?: Date
}

export interface CalorieCalculationResult {
  bmr: number
  tdee: number
  dailyCalories: number
  dailyDeficit: number
  weeklyWeightChange: number // kg per week
  macros: {
    protein: number // grams
    carbs: number // grams
    fat: number // grams
  }
}

export default class CalorieCalculatorService {
  /**
   * Activity multipliers from peer-reviewed research
   */
  private static readonly ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    moderate: 1.55,
    active: 1.725,
  }

  /**
   * Energy density of fat (cal/kg) - standard value
   */
  private static readonly CAL_PER_KG_FAT = 7700

  /**
   * Calculate BMR using Mifflin-St Jeor equation
   */
  private static calculateBMR(weight: number, height: number, age: number, gender: Gender): number {
    const base = 10 * weight + 6.25 * height - 5 * age
    return gender === 'male' ? base + 5 : base - 161
  }

  /**
   * Calculate TDEE from BMR and activity level
   */
  private static calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
    return Math.round(bmr * this.ACTIVITY_MULTIPLIERS[activityLevel])
  }

  /**
   * Calculate daily calorie deficit needed to reach target weight by target date
   */
  private static calculateDailyDeficit(
    currentWeight: number,
    targetWeight: number,
    targetDate: Date
  ): number {
    const weightToLose = currentWeight - targetWeight
    if (weightToLose <= 0) return 0

    const today = new Date()
    const daysToGoal = Math.ceil(
      (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysToGoal <= 0) return 0

    return Math.round((weightToLose * this.CAL_PER_KG_FAT) / daysToGoal)
  }

  /**
   * Calculate macro breakdown using 30/40/30 split (protein/carbs/fat)
   * - Protein: 4 cal/g
   * - Carbs: 4 cal/g
   * - Fat: 9 cal/g
   */
  private static calculateMacros(dailyCalories: number): {
    protein: number
    carbs: number
    fat: number
  } {
    return {
      protein: Math.round((dailyCalories * 0.3) / 4),
      carbs: Math.round((dailyCalories * 0.4) / 4),
      fat: Math.round((dailyCalories * 0.3) / 9),
    }
  }

  /**
   * Main calculation method - computes all calorie and macro values
   */
  public static calculate(input: CalorieCalculationInput): CalorieCalculationResult {
    const bmr = this.calculateBMR(input.weight, input.height, input.age, input.gender)
    const tdee = this.calculateTDEE(bmr, input.activityLevel)

    let dailyDeficit = 0
    let weeklyWeightChange = 0

    if (input.targetWeight && input.targetDate) {
      dailyDeficit = this.calculateDailyDeficit(input.weight, input.targetWeight, input.targetDate)
      weeklyWeightChange = (dailyDeficit * 7) / this.CAL_PER_KG_FAT
    }

    const dailyCalories = Math.max(tdee - dailyDeficit, 1200) // Minimum 1200 cal for safety
    const macros = this.calculateMacros(dailyCalories)

    return {
      bmr: Math.round(bmr),
      tdee,
      dailyCalories,
      dailyDeficit,
      weeklyWeightChange: Math.round(weeklyWeightChange * 100) / 100,
      macros,
    }
  }
}
