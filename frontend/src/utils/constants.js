// Application Constants and Error Messages

// Error Messages
export const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password',
  REGISTRATION_FAILED: 'Failed to create account',
  LOGIN_FAILED: 'Failed to log in',
  USER_NOT_FOUND: 'User not found',

  // Data Operations
  LOAD_FAILED: 'Failed to load data',
  SAVE_FAILED: 'Failed to save data',
  DELETE_FAILED: 'Failed to delete item',
  UPDATE_FAILED: 'Failed to update item',
  SYNC_FAILED: 'Failed to sync data',

  // Validation
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PASSWORD: 'Password must be at least 6 characters',
  INVALID_CALORIES: 'Please enter a valid calorie amount',
  INVALID_WEIGHT: 'Please enter a valid weight',
  INVALID_DATE: 'Please select a valid date',
  INVALID_TIME: 'Please select a valid time',

  // Network
  NETWORK_ERROR: 'Network connection error',
  OFFLINE_MODE: 'Working in offline mode',
  SYNC_UNAVAILABLE: 'Sync temporarily unavailable',

  // Notifications
  NOTIFICATION_DENIED: 'Notification permission denied',
  NOTIFICATION_UNAVAILABLE: 'Notifications not supported',

  // General
  UNKNOWN_ERROR: 'An unexpected error occurred',
  OPERATION_CANCELLED: 'Operation was cancelled',
  DATA_NOT_FOUND: 'No data found',
  PERMISSION_DENIED: 'Permission denied',
}

// Success Messages
export const SUCCESS_MESSAGES = {
  MEAL_ADDED: 'Meal added successfully',
  MEAL_UPDATED: 'Meal updated successfully',
  MEAL_DELETED: 'Meal deleted successfully',
  WEIGHT_ADDED: 'Weight entry added successfully',
  WEIGHT_UPDATED: 'Weight entry updated successfully',
  WEIGHT_DELETED: 'Weight entry deleted successfully',
  FAST_STARTED: 'Fast started successfully',
  FAST_ENDED: 'Fast ended successfully',
  SCHEDULE_CREATED: 'Fasting schedule created',
  DATA_EXPORTED: 'Data exported successfully',
  DATA_CLEARED: 'All data cleared successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
  LOGIN_SUCCESS: 'Login successful',
  REGISTRATION_SUCCESS: 'Account created successfully',
  SYNC_COMPLETE: 'Data synced successfully',
}

// Info Messages
export const INFO_MESSAGES = {
  OFFLINE_MODE: 'Working offline - data will sync when reconnected',
  SYNC_IN_PROGRESS: 'Syncing data...',
  LOADING_DATA: 'Loading data...',
  SAVING_DATA: 'Saving data...',
  DELETING_DATA: 'Deleting data...',
  EXPORTING_DATA: 'Exporting data...',
  CLEARING_DATA: 'Clearing data...',
}

// App Constants
export const APP_CONSTANTS = {
  // Calorie tracking
  DEFAULT_CALORIE_INCREMENT: 50,
  QUICK_CALORIE_AMOUNTS: [25, 50, 100],
  MAX_CALORIES_PER_MEAL: 5000,
  MIN_CALORIES_PER_MEAL: 1,

  // Fasting
  DEFAULT_FAST_DURATION: 16,
  PRESET_FAST_DURATIONS: [12, 16, 18, 20, 24],
  MAX_FAST_DURATION: 72,

  // Weight tracking (stored in kg, displayed in user preference)
  DEFAULT_WEIGHT_UNIT: 'kg',
  SUPPORTED_WEIGHT_UNITS: ['kg', 'lbs'],
  MAX_WEIGHT_KG: 300, // ~661 lbs
  MIN_WEIGHT_KG: 20, // ~44 lbs
  MAX_WEIGHT_LBS: 661,
  MIN_WEIGHT_LBS: 44,

  // UI
  MAX_NOTES_LENGTH: 100,
  MAX_NAME_LENGTH: 50,
  DEBOUNCE_DELAY: 300,
  NOTIFICATION_TIMEOUT: 3000,

  // Data
  MAX_HISTORY_DAYS: 365,
  DEFAULT_CHART_HEIGHT: 200,
  PAGINATION_SIZE: 20,

  // Validation
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,

  // Time
  MILLISECONDS_PER_DAY: 24 * 60 * 60 * 1000,
  MILLISECONDS_PER_HOUR: 60 * 60 * 1000,
  MILLISECONDS_PER_MINUTE: 60 * 1000,
}

// Chart Configuration
export const CHART_CONFIG = {
  COLORS: {
    PRIMARY: '#4f7cff',
    SECONDARY: '#ff6b6b',
    SUCCESS: '#4ade80',
    WARNING: '#fbbf24',
    DANGER: '#ef4444',
    INFO: '#3b82f6',
  },
  DARK_MODE_COLORS: {
    PRIMARY: '#60a5fa',
    SECONDARY: '#f87171',
    SUCCESS: '#34d399',
    WARNING: '#fbbf24',
    DANGER: '#f87171',
    INFO: '#60a5fa',
  },
  ANIMATION_DURATION: 300,
  RESPONSIVE_BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1200,
  },
}

// Notification Configuration
export const NOTIFICATION_CONFIG = {
  DEFAULT_TIMEOUT: 3000,
  POSITIONS: {
    TOP: 'top',
    BOTTOM: 'bottom',
    TOP_LEFT: 'top-left',
    TOP_RIGHT: 'top-right',
    BOTTOM_LEFT: 'bottom-left',
    BOTTOM_RIGHT: 'bottom-right',
  },
  TYPES: {
    POSITIVE: 'positive',
    NEGATIVE: 'negative',
    WARNING: 'warning',
    INFO: 'info',
  },
}

// Export default for convenience
export default {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  INFO_MESSAGES,
  APP_CONSTANTS,
  CHART_CONFIG,
  NOTIFICATION_CONFIG,
}
