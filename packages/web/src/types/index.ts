// User & Auth Types
export interface User {
  id: number
  email: string
  notificationPreferences: Record<string, any>
}

export interface AuthTokens {
  type: string
  value: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
}

// Meal Types
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface FoodItem {
  name: string
  calories: number
  protein?: number
  carbs?: number
  fat?: number
  serving?: string
  brand?: string
}

export interface Meal {
  id: number
  userId: number
  date: string
  type: MealType
  foods: FoodItem[]
  totalCalories: number
  createdAt: string
  updatedAt: string
}

export interface DailySummary {
  date: string
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  mealBreakdown: Array<{
    type: MealType
    calories: number
    foodCount: number
  }>
}

// Fasting Types
export interface Fast {
  id: number
  userId: number
  startTime: string
  endTime: string | null
  goalHours: number
  isCompleted: boolean
  notified80Percent: boolean
  notifiedComplete: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface FastProgress {
  elapsed: number
  remaining: number
  percentage: number
}

// Workout Types
export interface Exercise {
  name: string
  sets?: number
  reps?: number
  weight?: number
  duration?: number
  notes?: string
}

export interface Routine {
  id: number
  userId: number
  name: string
  exercises: Exercise[]
  createdAt: string
  updatedAt: string
}

export interface WorkoutLog {
  id: number
  userId: number
  routineId: number | null
  routine?: Routine
  startTime: string
  endTime: string | null
  duration: number | null
  exercisesCompleted: Exercise[]
  isCompleted: boolean
  createdAt: string
  updatedAt: string
}

// Activity Types
export type ActivityType = 'run' | 'walk' | 'bike' | 'other'

export interface Activity {
  id: number
  userId: number
  type: ActivityType
  startTime: string
  endTime: string | null
  duration: number | null
  distance: number | null
  calories: number | null
  createdAt: string
  updatedAt: string
}

// Measurement Types
export interface Measurement {
  id: number
  userId: number
  date: string
  weight: number | null
  height: number | null
  bodyFat: number | null
  bmi: number | null
  createdAt: string
  updatedAt: string
}

// Streak Types
export type StreakIntensity = 'cold' | 'warm' | 'hot' | 'fire' | 'inferno'

export interface Streak {
  id: number
  userId: number
  currentStreak: number
  longestStreak: number
  freezesAvailable: number
  milestonesAchieved: number[]
  intensity: StreakIntensity
  createdAt: string
  updatedAt: string
}

export interface DailyActivity {
  id: number
  userId: number
  date: string
  fastCompleted: boolean
  mealsLogged: boolean
  workoutCompleted: boolean
  streakMaintained: boolean
  createdAt: string
  updatedAt: string
}

// Push Subscription Types
export interface PushSubscription {
  id: number
  userId: number
  endpoint: string
  p256dhKey: string
  authKey: string
  userAgent: string | null
  createdAt: string
  updatedAt: string
}

// API Response Types
export interface ApiResponse<T> {
  data: T
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}
