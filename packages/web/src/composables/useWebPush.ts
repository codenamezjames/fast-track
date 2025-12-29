import { ref, computed } from 'vue'
import api from '@/lib/api'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

export function useWebPush() {
  const isSubscribed = ref(false)
  const isSupported = ref('serviceWorker' in navigator && 'PushManager' in window)
  const permission = ref<NotificationPermission>(Notification.permission)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const canSubscribe = computed(() => {
    return isSupported.value && permission.value === 'granted' && !isSubscribed.value
  })

  const canRequestPermission = computed(() => {
    return isSupported.value && permission.value === 'default'
  })

  function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  async function requestPermission(): Promise<boolean> {
    if (!isSupported.value) {
      error.value = 'Push notifications are not supported in this browser'
      return false
    }

    if (permission.value === 'granted') {
      return true
    }

    if (permission.value === 'denied') {
      error.value = 'Push notifications are blocked. Please enable them in your browser settings.'
      return false
    }

    try {
      const result = await Notification.requestPermission()
      permission.value = result

      if (result === 'granted') {
        error.value = null
        return true
      } else {
        error.value = 'Permission denied for push notifications'
        return false
      }
    } catch (err) {
      error.value = 'Failed to request notification permission'
      console.error('Permission request error:', err)
      return false
    }
  }

  async function subscribe(): Promise<boolean> {
    if (!canSubscribe.value && permission.value !== 'granted') {
      const permitted = await requestPermission()
      if (!permitted) {
        return false
      }
    }

    loading.value = true
    error.value = null

    try {
      // Get service worker registration
      const registration = await navigator.serviceWorker.ready

      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription()

      if (!subscription) {
        // Subscribe to push notifications
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        })
      }

      // Send subscription to backend
      await api.post('/push-subscriptions', {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: arrayBufferToBase64(subscription.getKey('auth')!),
        },
      })

      isSubscribed.value = true
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to subscribe to push notifications'
      console.error('Push subscription error:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  async function unsubscribe(): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Unsubscribe from push notifications
        await subscription.unsubscribe()

        // Remove subscription from backend
        await api.delete('/push-subscriptions', {
          data: { endpoint: subscription.endpoint },
        })
      }

      isSubscribed.value = false
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to unsubscribe from push notifications'
      console.error('Push unsubscribe error:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  async function checkSubscription(): Promise<void> {
    if (!isSupported.value) {
      return
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      isSubscribed.value = !!subscription
    } catch (err) {
      console.error('Failed to check subscription:', err)
    }
  }

  async function testNotification(): Promise<void> {
    if (permission.value !== 'granted') {
      await requestPermission()
    }

    if (permission.value === 'granted') {
      new Notification('Fast Track', {
        body: 'Notifications are working! 🎉',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
      })
    }
  }

  function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }

  return {
    isSubscribed,
    isSupported,
    permission,
    loading,
    error,
    canSubscribe,
    canRequestPermission,
    requestPermission,
    subscribe,
    unsubscribe,
    checkSubscription,
    testNotification,
  }
}
