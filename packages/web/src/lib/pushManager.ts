const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

export const isPushSupported = (): boolean => {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

export const getNotificationPermission = (): NotificationPermission | 'unsupported' => {
  if (!isPushSupported()) return 'unsupported'
  return Notification.permission
}

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isPushSupported()) {
    throw new Error('Push notifications not supported')
  }
  return await Notification.requestPermission()
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const buffer = new ArrayBuffer(rawData.length)
  const outputArray = new Uint8Array(buffer)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export const subscribeToPush = async (): Promise<PushSubscription | null> => {
  console.log('[Push] subscribeToPush called')

  if (!isPushSupported()) {
    console.warn('[Push] Push not supported')
    return null
  }

  if (!VAPID_PUBLIC_KEY) {
    console.warn('[Push] VAPID public key not configured')
    console.log('[Push] VAPID_PUBLIC_KEY value:', VAPID_PUBLIC_KEY)
    return null
  }

  console.log('[Push] VAPID key present:', VAPID_PUBLIC_KEY.substring(0, 20) + '...')

  try {
    console.log('[Push] Checking service worker registration...')
    const registrations = await navigator.serviceWorker.getRegistrations()
    console.log('[Push] Existing registrations:', registrations.length)

    console.log('[Push] Waiting for navigator.serviceWorker.ready...')
    const registration = await navigator.serviceWorker.ready
    console.log('[Push] Service worker is ready:', registration)

    // Check for existing subscription
    console.log('[Push] Checking for existing subscription...')
    let subscription = await registration.pushManager.getSubscription()
    console.log('[Push] Existing subscription:', subscription)

    if (!subscription) {
      console.log('[Push] Creating new subscription...')
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
      console.log('[Push] New subscription created:', subscription)
    }

    return subscription
  } catch (error) {
    console.error('[Push] Failed to subscribe to push:', error)
    return null
  }
}

export const unsubscribeFromPush = async (): Promise<boolean> => {
  if (!isPushSupported()) return false

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      await subscription.unsubscribe()
    }

    return true
  } catch (error) {
    console.error('Failed to unsubscribe from push:', error)
    return false
  }
}

export const getCurrentSubscription = async (): Promise<PushSubscription | null> => {
  if (!isPushSupported()) return null

  try {
    const registration = await navigator.serviceWorker.ready
    return await registration.pushManager.getSubscription()
  } catch {
    return null
  }
}
