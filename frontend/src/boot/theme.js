import { boot } from 'quasar/wrappers'
import { useThemeStore } from '../stores/theme.js'

export default boot(({ store }) => {
  // Initialize theme system early
  try {
    const themeStore = useThemeStore(store)
    themeStore.init()
  } catch {
    // Don't let theme initialization block app startup
  }
})
