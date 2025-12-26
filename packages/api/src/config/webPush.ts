import webPush from 'web-push'

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com'

if (vapidPublicKey && vapidPrivateKey) {
  webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)
}

export const isWebPushConfigured = (): boolean => {
  return !!(vapidPublicKey && vapidPrivateKey)
}

export const getVapidPublicKey = (): string | undefined => {
  return vapidPublicKey
}

export interface NotificationPayload {
  title: string
  body: string
  tag?: string
  actionUrl?: string
  icon?: string
}

export const sendPushNotification = async (
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: NotificationPayload
): Promise<boolean> => {
  if (!isWebPushConfigured()) {
    console.warn('Web push not configured - skipping notification')
    return false
  }

  try {
    await webPush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      JSON.stringify(payload)
    )
    return true
  } catch (error: unknown) {
    const webPushError = error as { statusCode?: number }
    if (webPushError.statusCode === 410 || webPushError.statusCode === 404) {
      // Subscription expired or invalid
      console.log('Push subscription expired:', subscription.endpoint)
      return false
    }
    console.error('Failed to send push notification:', error)
    throw error
  }
}
