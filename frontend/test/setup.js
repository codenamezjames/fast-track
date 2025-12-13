import { config } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { Quasar, Notify } from 'quasar'

// Configure Vue Test Utils globally
config.global.plugins = [
  [
    Quasar,
    {
      plugins: [Notify],
    },
  ],
  createTestingPinia({
    createSpy: vi.fn,
  }),
]

// Mock Quasar's global properties
config.global.mocks = {
  $q: {
    notify: vi.fn(),
    loading: {
      show: vi.fn(),
      hide: vi.fn(),
    },
    localStorage: {
      set: vi.fn(),
      get: vi.fn(),
      remove: vi.fn(),
    },
    platform: {
      is: {
        mobile: false,
        desktop: true,
        android: false,
        ios: false,
        cordova: false,
        capacitor: false,
        electron: false,
        bex: false,
      },
      has: {
        touch: false,
        webStorage: true,
      },
    },
    dark: {
      isActive: false,
      set: vi.fn(),
      toggle: vi.fn(),
    },
    screen: {
      width: 1024,
      height: 768,
      name: 'md',
      sizes: { sm: 600, md: 1024, lg: 1440, xl: 1920 },
      lt: { sm: false, md: false, lg: true, xl: true },
      gt: { xs: true, sm: true, md: false, lg: false },
      xs: false,
      sm: false,
      md: true,
      lg: false,
      xl: false,
    },
  },
}

// Mock window.localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
})

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:5500',
    origin: 'http://localhost:5500',
  },
  writable: true,
})

// Mock Date for consistent testing
const mockDate = new Date('2024-01-15T10:00:00.000Z')
vi.setSystemTime(mockDate)

// Global test utilities
global.createMockUser = () => ({
  id: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  $createdAt: '2024-01-01T00:00:00.000Z',
})

global.createMockMeal = (overrides = {}) => ({
  id: Math.floor(Math.random() * 1000),
  user_id: 'test-user-123',
  calories: 500,
  meal_time: '2024-01-15T12:00:00.000Z',
  notes: 'Test meal',
  synced: false,
  ...overrides,
})

global.createMockFastingSession = (overrides = {}) => ({
  id: Math.floor(Math.random() * 1000),
  user_id: 'test-user-123',
  start_time: '2024-01-15T08:00:00.000Z',
  end_time: null,
  duration_hours: null,
  is_active: true,
  synced: false,
  ...overrides,
})
