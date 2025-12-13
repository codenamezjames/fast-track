import { defineStore } from 'pinia'
import { Dark } from 'quasar'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    // Theme mode: 'auto', 'light', 'dark'
    mode: 'auto',

    // System preference detection
    systemPrefersDark: false,

    // Media query listener
    mediaQueryListener: null,

    // Loading state
    isLoading: false,
  }),

  getters: {
    // Use Quasar's Dark.isActive instead of our own state
    isDark: () => Dark.isActive,

    currentTheme: (state) => {
      if (state.mode === 'auto') {
        return state.systemPrefersDark ? 'dark' : 'light'
      }
      return state.mode
    },

    themeIcon: (state) => {
      switch (state.mode) {
        case 'light':
          return 'light_mode'
        case 'dark':
          return 'dark_mode'
        case 'auto':
          return 'brightness_auto'
        default:
          return 'brightness_auto'
      }
    },

    themeLabel: (state) => {
      switch (state.mode) {
        case 'light':
          return 'Light Mode'
        case 'dark':
          return 'Dark Mode'
        case 'auto':
          return 'Auto (System)'
        default:
          return 'Auto (System)'
      }
    },

    availableThemes: () => [
      { value: 'auto', label: 'Auto (System)', icon: 'brightness_auto' },
      { value: 'light', label: 'Light Mode', icon: 'light_mode' },
      { value: 'dark', label: 'Dark Mode', icon: 'dark_mode' },
    ],
  },

  actions: {
    // Initialize theme system
    init() {
      if (typeof window === 'undefined') {
        return
      }

      this.isLoading = true

      try {
        // Load saved preference
        this.loadPreference()

        // Detect system preference
        this.detectSystemPreference()

        // Set up system preference listener
        this.setupSystemPreferenceListener()

        // Apply theme
        this.applyTheme()
      } catch {
        // Failed to initialize theme system
      } finally {
        this.isLoading = false
      }
    },

    // Detect system color scheme preference
    detectSystemPreference() {
      if (typeof window !== 'undefined' && window.matchMedia) {
        this.systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      }
    },

    // Set up listener for system preference changes
    setupSystemPreferenceListener() {
      if (typeof window !== 'undefined' && window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

        this.mediaQueryListener = (e) => {
          this.systemPrefersDark = e.matches

          // Apply theme if in auto mode
          if (this.mode === 'auto') {
            this.applyTheme()
          }
        }

        // Add listener
        if (mediaQuery.addEventListener) {
          mediaQuery.addEventListener('change', this.mediaQueryListener)
        } else {
          // Fallback for older browsers
          mediaQuery.addListener(this.mediaQueryListener)
        }
      }
    },

    // Remove system preference listener
    removeSystemPreferenceListener() {
      if (this.mediaQueryListener && typeof window !== 'undefined' && window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', this.mediaQueryListener)
        } else {
          // Fallback for older browsers
          mediaQuery.removeListener(this.mediaQueryListener)
        }

        this.mediaQueryListener = null
      }
    },

    // Set theme mode
    setMode(mode) {
      if (!['auto', 'light', 'dark'].includes(mode)) {
        return
      }

      this.mode = mode
      this.savePreference()
      this.applyTheme()
    },

    // Apply the current theme using Quasar's Dark mode
    applyTheme() {
      let shouldBeDark = false

      if (this.mode === 'auto') {
        shouldBeDark = this.systemPrefersDark
      } else {
        shouldBeDark = this.mode === 'dark'
      }

      // Use Quasar's Dark.set - it handles everything
      Dark.set(shouldBeDark)
    },

    // Toggle between light and dark (skips auto)
    toggle() {
      const newMode = this.mode === 'dark' ? 'light' : 'dark'
      this.setMode(newMode)
    },

    // Cycle through all modes: auto -> light -> dark -> auto
    cycle() {
      const modes = ['auto', 'light', 'dark']
      const currentIndex = modes.indexOf(this.mode)
      const nextIndex = (currentIndex + 1) % modes.length
      this.setMode(modes[nextIndex])
    },

    // Save preference to localStorage
    savePreference() {
      try {
        localStorage.setItem('fasttrack-theme-mode', this.mode)
      } catch {
        // Failed to save theme preference
      }
    },

    // Load preference from localStorage
    loadPreference() {
      try {
        const saved = localStorage.getItem('fasttrack-theme-mode')
        if (saved && ['auto', 'light', 'dark'].includes(saved)) {
          this.mode = saved
        } else {
          // Default to auto mode
          this.mode = 'auto'
        }
      } catch {
        this.mode = 'auto'
      }
    },

    // Get current theme info for display
    getThemeInfo() {
      return {
        mode: this.mode,
        isDark: Dark.isActive,
        currentTheme: this.currentTheme,
        systemPrefersDark: this.systemPrefersDark,
        icon: this.themeIcon,
        label: this.themeLabel,
      }
    },

    // Cleanup (call when app is destroyed)
    destroy() {
      this.removeSystemPreferenceListener()
    },
  },
})
