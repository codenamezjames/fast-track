import User from '../models/User.js'
import Meal from '../models/Meal.js'
import PushSubscription from '../models/PushSubscription.js'
import { sendMealReminder } from '../services/notificationService.js'

type MealType = 'breakfast' | 'lunch' | 'dinner'

export const checkMealReminders = async (): Promise<void> => {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`

  // Get all users with meal reminders enabled
  const users = await User.find({
    'notificationPreferences.enabled': true,
    'notificationPreferences.meals.enabled': true,
  })

  for (const user of users) {
    const prefs = user.notificationPreferences.meals

    // Check if user has any push subscriptions
    const hasSubscription = await PushSubscription.exists({ userId: user._id })
    if (!hasSubscription) continue

    // Check each meal type
    const mealChecks: { type: MealType; time: string | null }[] = [
      { type: 'breakfast', time: prefs.breakfastTime },
      { type: 'lunch', time: prefs.lunchTime },
      { type: 'dinner', time: prefs.dinnerTime },
    ]

    for (const { type, time } of mealChecks) {
      if (!time) continue

      // Check if current time is within 5 minutes of the reminder time
      if (!isWithinTimeWindow(currentTime, time, 5)) continue

      // Check if meal already logged today
      const todayStart = new Date(now)
      todayStart.setHours(0, 0, 0, 0)
      const todayEnd = new Date(now)
      todayEnd.setHours(23, 59, 59, 999)

      const mealExists = await Meal.exists({
        userId: user._id,
        type,
        date: { $gte: todayStart, $lte: todayEnd },
      })

      if (!mealExists) {
        await sendMealReminder(user._id, type)
      }
    }
  }
}

function isWithinTimeWindow(current: string, target: string, windowMinutes: number): boolean {
  const [currentH, currentM] = current.split(':').map(Number)
  const [targetH, targetM] = target.split(':').map(Number)

  const currentTotal = currentH * 60 + currentM
  const targetTotal = targetH * 60 + targetM

  const diff = Math.abs(currentTotal - targetTotal)
  return diff <= windowMinutes
}
