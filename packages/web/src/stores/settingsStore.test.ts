import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSettingsStore } from './settingsStore'

// Mock calorieCalculator functions
vi.mock('../lib/calorieCalculator', () => ({
  calculateBMR: vi.fn(() => 1600),
  calculateTDEE: vi.fn(() => 2200),
  calculateDailyDeficit: vi.fn(() => 500),
  calculateDailyCalories: vi.fn(() => 1700),
  calculateMacros: vi.fn(() => ({
    protein: 140,
    carbs: 170,
    fat: 55,
  })),
  calculateWeeklyLoss: vi.fn(() => 0.5),
}))

describe('settingsStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    const { resetGoals, resetProfile } = useSettingsStore.getState()
    resetGoals()
    resetProfile()
  })

  describe('updateGoals', () => {
    it('should update goals partially', () => {
      const { updateGoals, goals } = useSettingsStore.getState()

      updateGoals({ calories: 2500 })

      const newGoals = useSettingsStore.getState().goals
      expect(newGoals.calories).toBe(2500)
      expect(newGoals.protein).toBe(goals.protein) // Other values unchanged
    })

    it('should update multiple goal values', () => {
      const { updateGoals } = useSettingsStore.getState()

      updateGoals({ calories: 2500, protein: 180 })

      const newGoals = useSettingsStore.getState().goals
      expect(newGoals.calories).toBe(2500)
      expect(newGoals.protein).toBe(180)
    })
  })

  describe('updateProfile', () => {
    it('should update profile partially', () => {
      const { updateProfile } = useSettingsStore.getState()

      updateProfile({ age: 30 })

      const newProfile = useSettingsStore.getState().profile
      expect(newProfile.age).toBe(30)
    })

    it('should update multiple profile values', () => {
      const { updateProfile } = useSettingsStore.getState()

      updateProfile({ age: 30, gender: 'male' })

      const newProfile = useSettingsStore.getState().profile
      expect(newProfile.age).toBe(30)
      expect(newProfile.gender).toBe('male')
    })
  })

  describe('hasCompletedSetup', () => {
    it('should return false when profile is incomplete', () => {
      const { hasCompletedSetup } = useSettingsStore.getState()

      expect(hasCompletedSetup()).toBe(false)
    })

    it('should return true when all required fields are filled', () => {
      const { updateProfile, hasCompletedSetup } = useSettingsStore.getState()

      updateProfile({
        age: 30,
        gender: 'male',
        height: 180,
        currentWeight: 80,
        activityLevel: 'moderate',
        targetWeight: 75,
        targetDate: '2024-12-31',
        isAutoCaloriesEnabled: false, // Disable auto-calc for this test
      })

      expect(hasCompletedSetup()).toBe(true)
    })

    it('should return false when only some fields are filled', () => {
      const { updateProfile, hasCompletedSetup } = useSettingsStore.getState()

      updateProfile({
        age: 30,
        gender: 'male',
        isAutoCaloriesEnabled: false,
      })

      expect(hasCompletedSetup()).toBe(false)
    })
  })

  describe('resetGoals', () => {
    it('should reset goals to default values', () => {
      const { updateGoals, resetGoals } = useSettingsStore.getState()

      // Change goals
      updateGoals({ calories: 3000, protein: 200 })

      // Reset
      resetGoals()

      const goals = useSettingsStore.getState().goals
      expect(goals.calories).toBe(2200) // Default value
      expect(goals.protein).toBe(150) // Default value
    })
  })

  describe('resetProfile', () => {
    it('should reset profile and metrics to default values', () => {
      const { updateProfile, resetProfile } = useSettingsStore.getState()

      // Change profile
      updateProfile({ age: 30, gender: 'male', isAutoCaloriesEnabled: false })

      // Reset
      resetProfile()

      const { profile, metrics } = useSettingsStore.getState()
      expect(profile.age).toBe(null)
      expect(profile.gender).toBe(null)
      expect(metrics.bmr).toBe(null)
      expect(metrics.tdee).toBe(null)
    })
  })

  describe('recalculateCalories', () => {
    it('should not calculate when profile is incomplete', () => {
      const { updateProfile, recalculateCalories, metrics } = useSettingsStore.getState()

      // Only set some fields
      updateProfile({ age: 30, gender: 'male', isAutoCaloriesEnabled: false })

      recalculateCalories()

      const newMetrics = useSettingsStore.getState().metrics
      expect(newMetrics.bmr).toBe(metrics.bmr) // Unchanged (null)
    })

    it('should calculate metrics when profile is complete', () => {
      const { updateProfile, recalculateCalories } = useSettingsStore.getState()

      // Set all required fields
      updateProfile({
        age: 30,
        gender: 'male',
        height: 180,
        currentWeight: 80,
        activityLevel: 'moderate',
        targetWeight: 75,
        targetDate: '2024-12-31',
        isAutoCaloriesEnabled: false,
      })

      recalculateCalories()

      const { metrics, goals } = useSettingsStore.getState()
      expect(metrics.bmr).toBe(1600) // Mocked value
      expect(metrics.tdee).toBe(2200) // Mocked value
      expect(goals.calories).toBe(1700) // Mocked value
    })

    it('should use provided weight and height values', () => {
      const { updateProfile, recalculateCalories } = useSettingsStore.getState()

      // Set all required fields
      updateProfile({
        age: 30,
        gender: 'male',
        height: 180,
        currentWeight: 80,
        activityLevel: 'moderate',
        targetWeight: 75,
        targetDate: '2024-12-31',
        isAutoCaloriesEnabled: false,
      })

      // Recalculate with different values
      recalculateCalories(85, 185)

      const profile = useSettingsStore.getState().profile
      expect(profile.currentWeight).toBe(85)
      expect(profile.height).toBe(185)
    })
  })
})
