import { Types } from 'mongoose'
import PushSubscription from '../models/PushSubscription.js'
import { sendPushNotification, NotificationPayload } from '../config/webPush.js'

export const sendToUser = async (
  userId: Types.ObjectId | string,
  payload: NotificationPayload
): Promise<{ sent: number; failed: number }> => {
  const subscriptions = await PushSubscription.find({ userId })

  let sent = 0
  let failed = 0
  const expiredEndpoints: string[] = []

  for (const sub of subscriptions) {
    try {
      const success = await sendPushNotification(
        { endpoint: sub.endpoint, keys: sub.keys },
        payload
      )
      if (success) {
        sent++
        sub.lastUsed = new Date()
        await sub.save()
      } else {
        expiredEndpoints.push(sub.endpoint)
        failed++
      }
    } catch {
      failed++
    }
  }

  // Clean up expired subscriptions
  if (expiredEndpoints.length > 0) {
    await PushSubscription.deleteMany({ endpoint: { $in: expiredEndpoints } })
  }

  return { sent, failed }
}

export const sendFastingAlert = async (
  userId: Types.ObjectId | string,
  type: '80percent' | 'complete',
  fastData: { goalHours: number; elapsedHours: number; remainingHours?: number }
): Promise<void> => {
  const payload: NotificationPayload =
    type === '80percent'
      ? {
          title: 'Almost there! 80% complete',
          body: `You've been fasting for ${formatHours(fastData.elapsedHours)}. Only ${formatHours(fastData.remainingHours || 0)} to go!`,
          tag: `fast-80-${Date.now()}`,
          actionUrl: '/#/fasting',
          icon: '/pwa-192x192.png',
        }
      : {
          title: 'Fast Complete!',
          body: `Congratulations! You've completed your ${fastData.goalHours}:${24 - fastData.goalHours} fast.`,
          tag: `fast-complete-${Date.now()}`,
          actionUrl: '/#/fasting',
          icon: '/pwa-192x192.png',
        }

  await sendToUser(userId, payload)
}

export const sendMealReminder = async (
  userId: Types.ObjectId | string,
  mealType: 'breakfast' | 'lunch' | 'dinner'
): Promise<void> => {
  const mealNames = {
    breakfast: 'breakfast',
    lunch: 'lunch',
    dinner: 'dinner',
  }

  const payload: NotificationPayload = {
    title: `Time for ${mealNames[mealType]}!`,
    body: `No ${mealNames[mealType]} logged yet today. Track your meal?`,
    tag: `meal-${mealType}-${new Date().toISOString().split('T')[0]}`,
    actionUrl: '/#/meals',
    icon: '/pwa-192x192.png',
  }

  await sendToUser(userId, payload)
}

export const sendDailyGoalNudge = async (
  userId: Types.ObjectId | string,
  incomplete: { calories?: boolean; workout?: boolean; fasting?: boolean }
): Promise<void> => {
  const items: string[] = []
  if (incomplete.workout) items.push('workout')
  if (incomplete.calories) items.push('calories')
  if (incomplete.fasting) items.push('fasting')

  if (items.length === 0) return

  const payload: NotificationPayload = {
    title: "Don't break your streak!",
    body: `You still need: ${items.join(', ')}`,
    tag: `daily-goal-${new Date().toISOString().split('T')[0]}`,
    actionUrl: '/#/',
    icon: '/pwa-192x192.png',
  }

  await sendToUser(userId, payload)
}

function formatHours(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}
