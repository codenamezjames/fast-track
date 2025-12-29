/**
 * DailyGoalCheckerJob
 *
 * Runs at the 55th minute of each hour to remind users about incomplete daily goals
 * Checks:
 * - Morning (9:55 AM): Breakfast reminder if not logged
 * - Afternoon (2:55 PM): Lunch reminder if not logged
 * - Evening (8:55 PM): Daily goal status (meals, workout, fast)
 */

import User from '#models/user'
import DailyActivity from '#models/daily_activity'
import NotificationService from '#services/notification_service'
import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'

interface DailyGoalPreferences {
  enabled: boolean
}

export default class DailyGoalCheckerJob {
  public static async process(): Promise<void> {
    try {
      const now = DateTime.now()
      const hour = now.hour
      const todayDate = now.toISODate()

      // Only run at specific hours: 9, 14, 20 (at :55 minutes)
      if (![9, 14, 20].includes(hour)) return

      // Find users with daily goal notifications enabled
      const users = await User.query().whereRaw(
        "notification_preferences->>'dailyGoals' = 'true'"
      )

      for (const user of users) {
        const prefs = user.notificationPreferences.dailyGoals as DailyGoalPreferences

        if (!prefs?.enabled) continue

        // Get today's activity status
        const todayActivity = await DailyActivity.query()
          .where('userId', user.id)
          .where('date', todayDate)
          .first()

        if (hour === 20) {
          // Evening check: Overall daily goal status
          await this.sendDailyGoalStatus(user.id, todayActivity)
        } else {
          // Morning/afternoon checks handled by MealReminderJob
          // This is just a fallback for general goal checking
        }
      }
    } catch (error) {
      logger.error({ error: error.message }, 'DailyGoalCheckerJob failed')
      throw error
    }
  }

  /**
   * Send daily goal status notification in the evening
   */
  private static async sendDailyGoalStatus(
    userId: number,
    todayActivity: DailyActivity | null
  ): Promise<void> {
    // Count completed activities
    const completedCount =
      (todayActivity?.fastCompleted ? 1 : 0) +
      (todayActivity?.mealsLogged ? 1 : 0) +
      (todayActivity?.workoutCompleted ? 1 : 0)

    // If user has completed 2+ activities, they're maintaining streak - send encouragement
    if (completedCount >= 2) {
      await NotificationService.sendDailyGoalEncouragement(userId, completedCount)
      logger.info({ userId, completedCount }, 'Daily goal encouragement sent')
      return
    }

    // Otherwise, send reminder about incomplete goals
    const incomplete: string[] = []

    if (!todayActivity?.fastCompleted) {
      incomplete.push('fasting')
    }
    if (!todayActivity?.mealsLogged) {
      incomplete.push('meals')
    }
    if (!todayActivity?.workoutCompleted) {
      incomplete.push('workout')
    }

    if (incomplete.length > 0) {
      await NotificationService.sendDailyGoalReminder(userId, incomplete)
      logger.info({ userId, incomplete }, 'Daily goal reminder sent')
    }
  }
}
