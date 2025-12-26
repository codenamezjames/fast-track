import { useEffect, useState } from 'react'
import { Bell, BellOff, Clock, Utensils, Timer, Target, Send } from 'lucide-react'
import { useNotificationStore } from '../../stores/notificationStore'
import Button from '../ui/Button'

export default function NotificationSettings() {
  const {
    permissionStatus,
    isSubscribed,
    preferences,
    loading,
    checkPermission,
    subscribe,
    unsubscribe,
    fetchPreferences,
    updatePreferences,
    sendTestNotification,
  } = useNotificationStore()

  const [testSent, setTestSent] = useState(false)

  useEffect(() => {
    checkPermission()
    if (permissionStatus === 'granted') {
      fetchPreferences()
    }
  }, [checkPermission, fetchPreferences, permissionStatus])

  const handleEnableNotifications = async () => {
    await subscribe()
    await fetchPreferences()
  }

  const handleDisableNotifications = async () => {
    await unsubscribe()
  }

  const handleTest = async () => {
    const success = await sendTestNotification()
    if (success) {
      setTestSent(true)
      setTimeout(() => setTestSent(false), 3000)
    }
  }

  const handleToggle = (
    section: 'fasting' | 'meals' | 'dailyGoal',
    field: string,
    value: boolean | string | null
  ) => {
    const current = preferences[section]
    updatePreferences({
      [section]: {
        ...current,
        [field]: value,
      },
    })
  }

  if (permissionStatus === 'unsupported') {
    return (
      <div className="bg-neutral-800 rounded-xl p-4">
        <div className="flex items-center gap-3 text-neutral-400">
          <BellOff size={20} />
          <span>Notifications not supported in this browser</span>
        </div>
      </div>
    )
  }

  if (permissionStatus === 'denied') {
    return (
      <div className="bg-neutral-800 rounded-xl p-4">
        <div className="flex items-center gap-3 text-red-400">
          <BellOff size={20} />
          <div>
            <div className="font-medium">Notifications Blocked</div>
            <div className="text-sm text-neutral-400">
              Enable in your browser settings to receive notifications
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isSubscribed) {
    return (
      <div className="bg-neutral-800 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-4">
          <Bell size={20} className="text-primary" />
          <div>
            <div className="font-medium">Enable Notifications</div>
            <div className="text-sm text-neutral-400">
              Get reminders for fasting, meals, and daily goals
            </div>
          </div>
        </div>
        <Button onClick={handleEnableNotifications} disabled={loading} className="w-full">
          {loading ? 'Enabling...' : 'Enable Notifications'}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Master toggle & test */}
      <div className="bg-neutral-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Bell size={20} className="text-green-400" />
            <div>
              <div className="font-medium">Notifications Enabled</div>
              <div className="text-sm text-neutral-400">Receiving push notifications</div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={handleTest}
            disabled={loading || testSent}
            className="flex-1 text-sm"
          >
            <Send size={14} className="mr-1" />
            {testSent ? 'Sent!' : 'Test'}
          </Button>
          <Button
            variant="danger"
            onClick={handleDisableNotifications}
            disabled={loading}
            className="flex-1 text-sm"
          >
            Disable
          </Button>
        </div>
      </div>

      {/* Fasting Alerts */}
      <div className="bg-neutral-800 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <Timer size={18} className="text-purple-400" />
          <span className="font-medium">Fasting Alerts</span>
        </div>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-sm text-neutral-300">Alert at 80% complete</span>
            <input
              type="checkbox"
              checked={preferences.fasting.alertAt80Percent}
              onChange={(e) => handleToggle('fasting', 'alertAt80Percent', e.target.checked)}
              className="w-5 h-5 rounded bg-neutral-700 border-neutral-600 text-primary focus:ring-primary"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-neutral-300">Alert when goal reached</span>
            <input
              type="checkbox"
              checked={preferences.fasting.alertAtGoal}
              onChange={(e) => handleToggle('fasting', 'alertAtGoal', e.target.checked)}
              className="w-5 h-5 rounded bg-neutral-700 border-neutral-600 text-primary focus:ring-primary"
            />
          </label>
        </div>
      </div>

      {/* Meal Reminders */}
      <div className="bg-neutral-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Utensils size={18} className="text-orange-400" />
            <span className="font-medium">Meal Reminders</span>
          </div>
          <input
            type="checkbox"
            checked={preferences.meals.enabled}
            onChange={(e) => handleToggle('meals', 'enabled', e.target.checked)}
            className="w-5 h-5 rounded bg-neutral-700 border-neutral-600 text-primary focus:ring-primary"
          />
        </div>
        {preferences.meals.enabled && (
          <div className="space-y-3 pt-2 border-t border-neutral-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-300">Breakfast</span>
              <input
                type="time"
                value={preferences.meals.breakfastTime || ''}
                onChange={(e) => handleToggle('meals', 'breakfastTime', e.target.value || null)}
                className="bg-neutral-700 rounded px-2 py-1 text-sm"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-300">Lunch</span>
              <input
                type="time"
                value={preferences.meals.lunchTime || ''}
                onChange={(e) => handleToggle('meals', 'lunchTime', e.target.value || null)}
                className="bg-neutral-700 rounded px-2 py-1 text-sm"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-300">Dinner</span>
              <input
                type="time"
                value={preferences.meals.dinnerTime || ''}
                onChange={(e) => handleToggle('meals', 'dinnerTime', e.target.value || null)}
                className="bg-neutral-700 rounded px-2 py-1 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Daily Goal Nudge */}
      <div className="bg-neutral-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Target size={18} className="text-primary" />
            <span className="font-medium">Daily Goal Reminder</span>
          </div>
          <input
            type="checkbox"
            checked={preferences.dailyGoal.enabled}
            onChange={(e) => handleToggle('dailyGoal', 'enabled', e.target.checked)}
            className="w-5 h-5 rounded bg-neutral-700 border-neutral-600 text-primary focus:ring-primary"
          />
        </div>
        {preferences.dailyGoal.enabled && (
          <div className="flex items-center justify-between pt-2 border-t border-neutral-700">
            <div className="flex items-center gap-2 text-sm text-neutral-300">
              <Clock size={14} />
              <span>Reminder time</span>
            </div>
            <input
              type="time"
              value={preferences.dailyGoal.reminderTime}
              onChange={(e) => handleToggle('dailyGoal', 'reminderTime', e.target.value)}
              className="bg-neutral-700 rounded px-2 py-1 text-sm"
            />
          </div>
        )}
      </div>
    </div>
  )
}
