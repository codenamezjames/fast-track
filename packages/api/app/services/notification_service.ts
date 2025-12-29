/**
 * NotificationService
 *
 * Handles Web Push notifications as specified in REWRITE_SPEC:
 * - Fasting progress notifications (80%, 100%)
 * - Meal reminders (breakfast, lunch, dinner)
 * - Daily goal nudges
 */

import webPush from 'web-push'
import PushSubscription from '#models/push_subscription'
import env from '#start/env'

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: Record<string, any>
}

export default class NotificationService {
  /**
   * Initialize web-push with VAPID keys
   */
  private static initialize() {
    webPush.setVapidDetails(
      env.get('VAPID_SUBJECT'),
      env.get('VAPID_PUBLIC_KEY'),
      env.get('VAPID_PRIVATE_KEY')
    )
  }

  /**
   * Send notification to a specific user
   */
  public static async sendToUser(userId: number, payload: NotificationPayload): Promise<void> {
    this.initialize()

    const subscriptions = await PushSubscription.query().where('userId', userId)

    const sendPromises = subscriptions.map(async (subscription) => {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dhKey,
            auth: subscription.authKey,
          },
        }

        await webPush.sendNotification(pushSubscription, JSON.stringify(payload))
      } catch (error) {
        // If subscription is no longer valid, delete it
        if (error.statusCode === 410) {
          await subscription.delete()
        } else {
          console.error('Error sending push notification:', error)
        }
      }
    })

    await Promise.all(sendPromises)
  }

  /**
   * Send fasting 80% alert
   */
  public static async sendFasting80Alert(
    userId: number,
    timeRemaining: string
  ): Promise<void> {
    await this.sendToUser(userId, {
      title: 'Almost there!',
      body: `${timeRemaining} to go!`,
      icon: '/icon-192.png',
      data: { type: 'fasting_80' },
    })
  }

  /**
   * Send fasting completion alert
   */
  public static async sendFastingCompleteAlert(userId: number): Promise<void> {
    await this.sendToUser(userId, {
      title: 'Congratulations!',
      body: 'Fast complete! 🎉',
      icon: '/icon-192.png',
      data: { type: 'fasting_complete' },
    })
  }

  /**
   * Send meal reminder
   */
  public static async sendMealReminder(
    userId: number,
    mealType: 'breakfast' | 'lunch' | 'dinner'
  ): Promise<void> {
    const mealNames = {
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
    }

    await this.sendToUser(userId, {
      title: 'Meal Reminder',
      body: `Don't forget to log your ${mealNames[mealType]}!`,
      icon: '/icon-192.png',
      data: { type: 'meal_reminder', mealType },
    })
  }

  /**
   * Send daily goal nudge
   */
  public static async sendDailyGoalNudge(
    userId: number,
    incompleteActivities: string[]
  ): Promise<void> {
    await this.sendToUser(userId, {
      title: 'Daily Goal Reminder',
      body: `You still need to: ${incompleteActivities.join(', ')}`,
      icon: '/icon-192.png',
      data: { type: 'daily_goal_nudge', incompleteActivities },
    })
  }

  /**
   * Send daily goal encouragement (when user has completed 2+ activities)
   */
  public static async sendDailyGoalEncouragement(
    userId: number,
    completedCount: number
  ): Promise<void> {
    const messages = {
      2: 'Great job! You completed 2 activities today. Keep up the streak! 🔥',
      3: 'Perfect! All 3 activities completed today. You are on fire! 🔥🔥🔥',
    }

    await this.sendToUser(userId, {
      title: 'Daily Goal Achievement',
      body: messages[completedCount as 2 | 3] || messages[2],
      icon: '/icon-192.png',
      data: { type: 'daily_goal_encouragement', completedCount },
    })
  }

  /**
   * Send daily goal reminder (when user has incomplete goals)
   */
  public static async sendDailyGoalReminder(
    userId: number,
    incompleteActivities: string[]
  ): Promise<void> {
    const activityNames = incompleteActivities.join(', ')

    await this.sendToUser(userId, {
      title: 'Daily Goal Reminder',
      body: `You still have time to complete: ${activityNames}`,
      icon: '/icon-192.png',
      data: { type: 'daily_goal_reminder', incompleteActivities },
    })
  }
}
