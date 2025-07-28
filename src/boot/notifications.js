import { boot } from 'quasar/wrappers'
import { useNotificationsStore } from '../stores/notifications.js'

export default boot(async ({ store }) => {
  // Initialize notifications early in the app lifecycle
  try {
    const notificationsStore = useNotificationsStore(store)

    await notificationsStore.init()

    // Schedule meal reminders if enabled
    if (notificationsStore.isMealNotificationsEnabled) {
      await notificationsStore.scheduleMealReminders()
    }

    console.log('Notifications system initialized')
  } catch (error) {
    console.error('Failed to initialize notifications:', error)
    // Don't let notification initialization block app startup
  }
})
