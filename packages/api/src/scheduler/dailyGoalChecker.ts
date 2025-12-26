import User from '../models/User.js'
import DailyActivity from '../models/DailyActivity.js'
import PushSubscription from '../models/PushSubscription.js'
import { sendDailyGoalNudge } from '../services/notificationService.js'

export const checkDailyGoals = async (): Promise<void> => {
  const now = new Date()
  const currentHour = now.getHours()
  const currentTime = `${currentHour.toString().padStart(2, '0')}:00`

  // Get all users with daily goal nudge enabled
  const users = await User.find({
    'notificationPreferences.enabled': true,
    'notificationPreferences.dailyGoal.enabled': true,
  })

  const today = now.toISOString().split('T')[0]

  for (const user of users) {
    const reminderTime = user.notificationPreferences.dailyGoal.reminderTime

    // Check if the reminder hour matches (we run at :55, so check the next hour)
    const [reminderHour] = reminderTime.split(':').map(Number)
    const nextHour = currentHour + 1

    if (reminderHour !== nextHour && reminderHour !== currentHour) continue

    // Check if user has any push subscriptions
    const hasSubscription = await PushSubscription.exists({ userId: user._id })
    if (!hasSubscription) continue

    // Get today's activity status
    const dailyActivity = await DailyActivity.findOne({
      userId: user._id,
      date: today,
    })

    const incomplete: { calories?: boolean; workout?: boolean; fasting?: boolean } = {}

    // If no daily activity record, everything is incomplete
    if (!dailyActivity) {
      incomplete.calories = true
      incomplete.workout = true
      incomplete.fasting = true
    } else {
      if (!dailyActivity.mealsLogged) incomplete.calories = true
      if (!dailyActivity.workoutCompleted) incomplete.workout = true
      if (!dailyActivity.fastCompleted) incomplete.fasting = true
    }

    // Only send if something is incomplete
    if (Object.keys(incomplete).length > 0) {
      await sendDailyGoalNudge(user._id, incomplete)
    }
  }
}
