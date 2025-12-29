/**
 * MealReminderJob
 *
 * Runs every 5 minutes to check if users need meal reminders based on their notification preferences
 * Sends reminders for:
 * - Breakfast (default: 8:00 AM)
 * - Lunch (default: 12:00 PM)
 * - Dinner (default: 6:00 PM)
 */

import User from '#models/user'
import Meal from '#models/meal'
import NotificationService from '#services/notification_service'
import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'

interface MealReminderPreferences {
  enabled: boolean
  breakfastTime?: string // HH:mm format
  lunchTime?: string
  dinnerTime?: string
}

export default class MealReminderJob {
  private static readonly DEFAULT_TIMES = {
    breakfast: '08:00',
    lunch: '12:00',
    dinner: '18:00',
  }

  private static readonly REMINDER_WINDOW_MINUTES = 15 // Send reminder within 15 min of meal time

  public static async process(): Promise<void> {
    try {
      // Find users with meal reminder notifications enabled
      const users = await User.query().whereRaw(
        "notification_preferences->>'mealReminders' = 'true'"
      )

      const now = DateTime.now()
      const todayDate = now.toISODate()

      for (const user of users) {
        const prefs = user.notificationPreferences.mealReminders as MealReminderPreferences

        if (!prefs?.enabled) continue

        // Check each meal type
        await this.checkMealReminder(
          user.id,
          'breakfast',
          prefs.breakfastTime || this.DEFAULT_TIMES.breakfast,
          now,
          todayDate!
        )
        await this.checkMealReminder(
          user.id,
          'lunch',
          prefs.lunchTime || this.DEFAULT_TIMES.lunch,
          now,
          todayDate!
        )
        await this.checkMealReminder(
          user.id,
          'dinner',
          prefs.dinnerTime || this.DEFAULT_TIMES.dinner,
          now,
          todayDate!
        )
      }
    } catch (error) {
      logger.error({ error: error.message }, 'MealReminderJob failed')
      throw error
    }
  }

  /**
   * Check if a meal reminder should be sent
   */
  private static async checkMealReminder(
    userId: number,
    mealType: string,
    mealTime: string,
    now: DateTime,
    todayDate: string
  ): Promise<void> {
    // Parse meal time (HH:mm format)
    const [hours, minutes] = mealTime.split(':').map(Number)
    const mealDateTime = now.set({ hour: hours, minute: minutes, second: 0 })

    // Calculate time difference in minutes
    const diffMinutes = Math.abs(now.diff(mealDateTime, 'minutes').minutes)

    // Only send if within reminder window
    if (diffMinutes > this.REMINDER_WINDOW_MINUTES) return

    // Check if meal has already been logged today
    const existingMeal = await Meal.query()
      .where('userId', userId)
      .where('date', todayDate)
      .where('type', mealType)
      .first()

    if (existingMeal) return // Already logged, no reminder needed

    // Send reminder
    await NotificationService.sendMealReminder(userId, mealType)

    logger.info({ userId, mealType }, 'Meal reminder sent')
  }
}
