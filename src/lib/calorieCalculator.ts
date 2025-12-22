export type Gender = 'male' | 'female'
export type ActivityLevel = 'sedentary' | 'moderate' | 'active'

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,   // Little or no exercise, desk job
  moderate: 1.55,   // Moderate exercise 3-5 days/week
  active: 1.725,    // Hard exercise 6-7 days/week
}

const MIN_CALORIES: Record<Gender, number> = {
  male: 1500,
  female: 1200,
}

// Calories per kg of body weight (7700 kcal = 1 kg of fat)
const CALORIES_PER_KG = 7700

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor equation
 * @param weight - Weight in kg
 * @param height - Height in cm
 * @param age - Age in years
 * @param gender - 'male' or 'female'
 * @returns BMR in calories/day
 */
export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: Gender
): number {
  // Mifflin-St Jeor Equation:
  // Male: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
  // Female: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
  const base = 10 * weight + 6.25 * height - 5 * age
  return Math.round(gender === 'male' ? base + 5 : base - 161)
}

/**
 * Calculate Total Daily Energy Expenditure
 * @param bmr - Basal Metabolic Rate
 * @param activityLevel - Activity level
 * @returns TDEE in calories/day
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel])
}

/**
 * Calculate daily calorie deficit needed to reach target weight by target date
 * @param currentWeight - Current weight in kg
 * @param targetWeight - Target weight in kg
 * @param targetDate - Target date (ISO string or Date)
 * @returns Daily deficit in calories (positive = need to eat less)
 */
export function calculateDailyDeficit(
  currentWeight: number,
  targetWeight: number,
  targetDate: string | Date
): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate
  target.setHours(0, 0, 0, 0)

  const daysToGoal = Math.max(1, Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
  const weightToLose = currentWeight - targetWeight // kg

  if (weightToLose <= 0) {
    return 0 // No deficit needed for maintenance or weight gain
  }

  const totalCaloriesToBurn = weightToLose * CALORIES_PER_KG
  return Math.round(totalCaloriesToBurn / daysToGoal)
}

/**
 * Calculate recommended daily calories for weight loss
 * @param tdee - Total Daily Energy Expenditure
 * @param dailyDeficit - Daily calorie deficit
 * @param gender - Gender (for minimum calorie floor)
 * @returns Recommended daily calories
 */
export function calculateDailyCalories(
  tdee: number,
  dailyDeficit: number,
  gender: Gender
): number {
  const targetCalories = tdee - dailyDeficit
  const minCalories = MIN_CALORIES[gender]
  return Math.max(minCalories, Math.round(targetCalories))
}

/**
 * Calculate weekly weight loss rate
 * @param currentWeight - Current weight in kg
 * @param targetWeight - Target weight in kg
 * @param targetDate - Target date
 * @returns Weekly loss in kg
 */
export function calculateWeeklyLoss(
  currentWeight: number,
  targetWeight: number,
  targetDate: string | Date
): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate
  target.setHours(0, 0, 0, 0)

  const weeksToGoal = Math.max(1, (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 7))
  const weightToLose = currentWeight - targetWeight

  return Math.round((weightToLose / weeksToGoal) * 100) / 100
}

/**
 * Validate weight loss rate and return warnings
 * @param weeklyLoss - Weekly weight loss in kg
 * @returns Object with isValid flag and optional warning message
 */
export function validateWeightLossRate(weeklyLoss: number): {
  isValid: boolean
  isSafe: boolean
  message: string | null
} {
  if (weeklyLoss <= 0) {
    return {
      isValid: true,
      isSafe: true,
      message: null,
    }
  }

  if (weeklyLoss > 1) {
    return {
      isValid: true,
      isSafe: false,
      message: `Losing ${weeklyLoss.toFixed(1)} kg/week may be too aggressive. Aim for 0.5-1 kg/week for sustainable results.`,
    }
  }

  if (weeklyLoss > 0.5) {
    return {
      isValid: true,
      isSafe: true,
      message: `${weeklyLoss.toFixed(1)} kg/week is an ambitious but achievable goal.`,
    }
  }

  return {
    isValid: true,
    isSafe: true,
    message: `${weeklyLoss.toFixed(1)} kg/week is a healthy, sustainable pace.`,
  }
}

/**
 * Calculate macros based on calorie goal
 * Uses 30/40/30 split (protein/carbs/fat) by default
 * @param calories - Daily calorie goal
 * @returns Macro goals in grams
 */
export function calculateMacros(calories: number): {
  protein: number
  carbs: number
  fat: number
} {
  // Protein: 30% of calories, 4 cal/g
  const protein = Math.round((calories * 0.3) / 4)
  // Carbs: 40% of calories, 4 cal/g
  const carbs = Math.round((calories * 0.4) / 4)
  // Fat: 30% of calories, 9 cal/g
  const fat = Math.round((calories * 0.3) / 9)

  return { protein, carbs, fat }
}

/**
 * Convert pounds to kilograms
 */
export function lbsToKg(lbs: number): number {
  return Math.round(lbs * 0.453592 * 10) / 10
}

/**
 * Convert kilograms to pounds
 */
export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10
}

/**
 * Convert feet and inches to centimeters
 */
export function feetInchesToCm(feet: number, inches: number): number {
  return Math.round((feet * 30.48 + inches * 2.54) * 10) / 10
}

/**
 * Convert centimeters to feet and inches
 */
export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return { feet, inches }
}

/**
 * Full calculation from profile data to daily calories
 */
export function calculateCaloriesFromProfile(profile: {
  weight: number
  height: number
  age: number
  gender: Gender
  activityLevel: ActivityLevel
  targetWeight: number
  targetDate: string
}): {
  bmr: number
  tdee: number
  dailyDeficit: number
  dailyCalories: number
  weeklyLoss: number
  macros: { protein: number; carbs: number; fat: number }
  validation: { isValid: boolean; isSafe: boolean; message: string | null }
} {
  const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.gender)
  const tdee = calculateTDEE(bmr, profile.activityLevel)
  const dailyDeficit = calculateDailyDeficit(profile.weight, profile.targetWeight, profile.targetDate)
  const dailyCalories = calculateDailyCalories(tdee, dailyDeficit, profile.gender)
  const weeklyLoss = calculateWeeklyLoss(profile.weight, profile.targetWeight, profile.targetDate)
  const macros = calculateMacros(dailyCalories)
  const validation = validateWeightLossRate(weeklyLoss)

  return {
    bmr,
    tdee,
    dailyDeficit,
    dailyCalories,
    weeklyLoss,
    macros,
    validation,
  }
}
