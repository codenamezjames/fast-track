import { create } from 'zustand'
import { api } from '../lib/api'
import {
  isPushSupported,
  getNotificationPermission,
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  getCurrentSubscription,
} from '../lib/pushManager'

export interface NotificationPreferences {
  enabled: boolean
  fasting: {
    enabled: boolean
    alertAt80Percent: boolean
    alertAtGoal: boolean
  }
  meals: {
    enabled: boolean
    breakfastTime: string | null
    lunchTime: string | null
    dinnerTime: string | null
  }
  dailyGoal: {
    enabled: boolean
    reminderTime: string
  }
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: false,
  fasting: {
    enabled: true,
    alertAt80Percent: true,
    alertAtGoal: true,
  },
  meals: {
    enabled: false,
    breakfastTime: null,
    lunchTime: null,
    dinnerTime: null,
  },
  dailyGoal: {
    enabled: true,
    reminderTime: '20:00',
  },
}

interface NotificationState {
  permissionStatus: NotificationPermission | 'unsupported'
  isSubscribed: boolean
  preferences: NotificationPreferences
  loading: boolean
  error: string | null

  // Actions
  checkPermission: () => void
  requestPermission: () => Promise<boolean>
  subscribe: () => Promise<boolean>
  unsubscribe: () => Promise<void>
  fetchPreferences: () => Promise<void>
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>
  sendTestNotification: () => Promise<boolean>
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  permissionStatus: getNotificationPermission(),
  isSubscribed: false,
  preferences: { ...DEFAULT_PREFERENCES },
  loading: false,
  error: null,

  checkPermission: () => {
    const status = getNotificationPermission()
    set({ permissionStatus: status })

    // Check if we have an active subscription
    if (status === 'granted') {
      getCurrentSubscription().then((sub) => {
        set({ isSubscribed: !!sub })
      })
    }
  },

  requestPermission: async () => {
    if (!isPushSupported()) {
      set({ permissionStatus: 'unsupported' })
      return false
    }

    try {
      const permission = await requestNotificationPermission()
      set({ permissionStatus: permission })
      return permission === 'granted'
    } catch (error) {
      console.error('Permission request failed:', error)
      return false
    }
  },

  subscribe: async () => {
    set({ loading: true, error: null })

    try {
      // Request permission if needed
      if (Notification.permission !== 'granted') {
        const granted = await get().requestPermission()
        if (!granted) {
          set({ loading: false, error: 'Permission denied' })
          return false
        }
      }

      // Get push subscription
      const subscription = await subscribeToPush()
      if (!subscription) {
        set({ loading: false, error: 'Failed to subscribe' })
        return false
      }

      // Send to server
      const subJson = subscription.toJSON()
      await api.post('/notifications/subscribe', {
        endpoint: subJson.endpoint,
        keys: subJson.keys,
      })

      // Update preferences to enabled
      await get().updatePreferences({ enabled: true })

      set({ isSubscribed: true, loading: false })
      return true
    } catch (error) {
      console.error('Subscribe error:', error)
      set({ loading: false, error: 'Failed to subscribe' })
      return false
    }
  },

  unsubscribe: async () => {
    set({ loading: true, error: null })

    try {
      await unsubscribeFromPush()
      await api.delete('/notifications/unsubscribe')
      await get().updatePreferences({ enabled: false })

      set({ isSubscribed: false, loading: false })
    } catch (error) {
      console.error('Unsubscribe error:', error)
      set({ loading: false, error: 'Failed to unsubscribe' })
    }
  },

  fetchPreferences: async () => {
    set({ loading: true })

    try {
      const data = await api.get<{ preferences: NotificationPreferences }>(
        '/notifications/preferences'
      )
      set({ preferences: data.preferences || DEFAULT_PREFERENCES, loading: false })
    } catch (error) {
      console.error('Fetch preferences error:', error)
      set({ loading: false })
    }
  },

  updatePreferences: async (newPrefs: Partial<NotificationPreferences>) => {
    const currentPrefs = get().preferences
    const merged = deepMerge(currentPrefs, newPrefs)

    set({ preferences: merged })

    try {
      await api.put('/notifications/preferences', { preferences: merged })
    } catch (error) {
      console.error('Update preferences error:', error)
      // Revert on error
      set({ preferences: currentPrefs })
    }
  },

  sendTestNotification: async () => {
    try {
      await api.post('/notifications/test')
      return true
    } catch (error) {
      console.error('Test notification error:', error)
      return false
    }
  },
}))

function deepMerge(
  target: NotificationPreferences,
  source: Partial<NotificationPreferences>
): NotificationPreferences {
  return {
    enabled: source.enabled ?? target.enabled,
    fasting: {
      ...target.fasting,
      ...source.fasting,
    },
    meals: {
      ...target.meals,
      ...source.meals,
    },
    dailyGoal: {
      ...target.dailyGoal,
      ...source.dailyGoal,
    },
  }
}
