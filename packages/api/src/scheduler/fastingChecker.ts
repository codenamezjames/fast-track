import Fast from '../models/Fast.js'
import User from '../models/User.js'
import PushSubscription from '../models/PushSubscription.js'
import { sendFastingAlert } from '../services/notificationService.js'

export const checkFastingProgress = async (): Promise<void> => {
  // Find active fasts (started but not ended)
  const activeFasts = await Fast.find({
    endTime: { $exists: false },
    startTime: { $exists: true },
  })

  const now = new Date()

  for (const fast of activeFasts) {
    const elapsedMs = now.getTime() - fast.startTime.getTime()
    const elapsedHours = elapsedMs / (1000 * 60 * 60)
    const goalMs = fast.goalHours * 60 * 60 * 1000
    const progress = (elapsedMs / goalMs) * 100

    // Get user preferences
    const user = await User.findById(fast.userId)
    if (!user?.notificationPreferences?.enabled) continue
    if (!user.notificationPreferences.fasting?.enabled) continue

    // Check if user has any push subscriptions
    const hasSubscription = await PushSubscription.exists({ userId: fast.userId })
    if (!hasSubscription) continue

    const remainingHours = Math.max(0, fast.goalHours - elapsedHours)

    // Check 80% alert (between 80-85% to avoid duplicate sends)
    if (
      progress >= 80 &&
      progress < 85 &&
      !fast.notified80Percent &&
      user.notificationPreferences.fasting.alertAt80Percent
    ) {
      await sendFastingAlert(fast.userId, '80percent', {
        goalHours: fast.goalHours,
        elapsedHours,
        remainingHours,
      })
      fast.notified80Percent = true
      await fast.save()
    }

    // Check 100% alert
    if (
      progress >= 100 &&
      !fast.notifiedComplete &&
      user.notificationPreferences.fasting.alertAtGoal
    ) {
      await sendFastingAlert(fast.userId, 'complete', {
        goalHours: fast.goalHours,
        elapsedHours,
      })
      fast.notifiedComplete = true
      await fast.save()
    }
  }
}
