import { boot } from 'quasar/wrappers'
import { useThemeStore } from '../stores/theme.js'

export default boot(({ store }) => {
  // Initialize theme system early
  try {
    const themeStore = useThemeStore(store)
    themeStore.init()
    console.log('Theme system initialized in boot file')
  } catch (error) {
    console.error('Failed to initialize theme system:', error)
    // Don't let theme initialization block app startup
  }
}) 