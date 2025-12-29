/**
 * FastingNotificationJob
 *
 * Runs every minute to check active fasts and send notifications at:
 * - 80% progress (notified_80_percent = false)
 * - 100% progress (notified_complete = false)
 */

import Fast from '#models/fast'
import NotificationService from '#services/notification_service'
import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'

export default class FastingNotificationJob {
  public static async process(): Promise<void> {
    try {
      // Find active fasts
      const activeFasts = await Fast.query()
        .whereNull('endTime')
        .where('isCompleted', false)

      for (const fast of activeFasts) {
        const now = DateTime.now()
        const elapsed = now.diff(fast.startTime, 'hours').hours
        const progress = (elapsed / fast.goalHours) * 100

        // Check for 80% notification
        if (progress >= 80 && !fast.notified80Percent) {
          const remaining = fast.goalHours - elapsed
          const remainingFormatted = this.formatTimeRemaining(remaining)

          await NotificationService.sendFasting80Alert(fast.userId, remainingFormatted)

          fast.notified80Percent = true
          await fast.save()

          logger.info({ userId: fast.userId, fastId: fast.id }, '80% fasting notification sent')
        }

        // Check for 100% notification
        if (progress >= 100 && !fast.notifiedComplete) {
          await NotificationService.sendFastingCompleteAlert(fast.userId)

          fast.notifiedComplete = true
          await fast.save()

          logger.info({ userId: fast.userId, fastId: fast.id }, '100% fasting notification sent')
        }
      }
    } catch (error) {
      logger.error({ error: error.message }, 'FastingNotificationJob failed')
      throw error
    }
  }

  /**
   * Format remaining time for notification
   */
  private static formatTimeRemaining(hours: number): string {
    if (hours < 1) {
      const minutes = Math.round(hours * 60)
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`
    }

    const wholeHours = Math.floor(hours)
    const minutes = Math.round((hours - wholeHours) * 60)

    if (minutes === 0) {
      return `${wholeHours} hour${wholeHours !== 1 ? 's' : ''}`
    }

    return `${wholeHours}h ${minutes}m`
  }
}
