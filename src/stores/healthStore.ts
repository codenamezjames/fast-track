import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { healthService } from '../services/healthService'

export interface SyncSettings {
  weight: boolean
  height: boolean
  bodyFat: boolean
  activities: boolean
  workouts: boolean
}

interface HealthState {
  // Availability
  isAvailable: boolean
  isChecking: boolean

  // Permissions
  hasPermissions: boolean
  permissionsChecked: boolean

  // Sync settings
  syncEnabled: boolean
  syncSettings: SyncSettings

  // Sync status
  lastSyncDate: string | null
  isSyncing: boolean
  syncError: string | null

  // Actions
  checkAvailability: () => Promise<void>
  requestPermissions: () => Promise<boolean>
  checkPermissions: () => Promise<boolean>
  setSyncEnabled: (enabled: boolean) => void
  updateSyncSettings: (settings: Partial<SyncSettings>) => void

  // Sync actions (stubs - write not supported by current plugin)
  syncWeight: (weight: number, date?: Date) => Promise<boolean>
  syncHeight: (heightCm: number, date?: Date) => Promise<boolean>
  syncBodyFat: (percentage: number, date?: Date) => Promise<boolean>
  syncActivity: (
    type: 'run' | 'walk' | 'bike',
    startDate: Date,
    endDate: Date,
    distance: number,
    calories: number
  ) => Promise<boolean>
  syncWorkout: (startDate: Date, endDate: Date, calories: number) => Promise<boolean>

  // Utility
  openHealthApp: () => Promise<void>
}

const DEFAULT_SYNC_SETTINGS: SyncSettings = {
  weight: true,
  height: true,
  bodyFat: true,
  activities: true,
  workouts: true,
}

export const useHealthStore = create<HealthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAvailable: false,
      isChecking: false,
      hasPermissions: false,
      permissionsChecked: false,
      syncEnabled: false,
      syncSettings: DEFAULT_SYNC_SETTINGS,
      lastSyncDate: null,
      isSyncing: false,
      syncError: null,

      checkAvailability: async () => {
        set({ isChecking: true })
        try {
          const available = await healthService.isAvailable()
          set({ isAvailable: available, isChecking: false })

          // If available, also check permissions
          if (available) {
            await get().checkPermissions()
          }
        } catch (error) {
          console.error('Failed to check health availability:', error)
          set({ isAvailable: false, isChecking: false })
        }
      },

      requestPermissions: async () => {
        try {
          const granted = await healthService.requestPermissions()
          set({ hasPermissions: granted, permissionsChecked: true })
          return granted
        } catch (error) {
          console.error('Failed to request health permissions:', error)
          set({ hasPermissions: false, permissionsChecked: true })
          return false
        }
      },

      checkPermissions: async () => {
        try {
          const granted = await healthService.checkPermissions()
          set({ hasPermissions: granted, permissionsChecked: true })
          return granted
        } catch (error) {
          console.error('Failed to check health permissions:', error)
          set({ hasPermissions: false, permissionsChecked: true })
          return false
        }
      },

      setSyncEnabled: (enabled: boolean) => {
        set({ syncEnabled: enabled })
      },

      updateSyncSettings: (settings: Partial<SyncSettings>) => {
        set((state) => ({
          syncSettings: { ...state.syncSettings, ...settings },
        }))
      },

      // Note: Write operations are stubs - the capacitor-health plugin is read-only
      // A different plugin would be needed for full write support

      syncWeight: async (weight: number, date?: Date) => {
        const { syncEnabled, syncSettings, hasPermissions } = get()
        if (!syncEnabled || !syncSettings.weight || !hasPermissions) {
          return false
        }

        set({ isSyncing: true, syncError: null })
        try {
          const success = await healthService.writeWeight(weight, date)
          set({ isSyncing: false })
          return success
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to sync weight'
          set({ isSyncing: false, syncError: message })
          return false
        }
      },

      syncHeight: async (heightCm: number, date?: Date) => {
        const { syncEnabled, syncSettings, hasPermissions } = get()
        if (!syncEnabled || !syncSettings.height || !hasPermissions) {
          return false
        }

        set({ isSyncing: true, syncError: null })
        try {
          const success = await healthService.writeHeight(heightCm, date)
          set({ isSyncing: false })
          return success
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to sync height'
          set({ isSyncing: false, syncError: message })
          return false
        }
      },

      syncBodyFat: async (percentage: number, date?: Date) => {
        const { syncEnabled, syncSettings, hasPermissions } = get()
        if (!syncEnabled || !syncSettings.bodyFat || !hasPermissions) {
          return false
        }

        set({ isSyncing: true, syncError: null })
        try {
          const success = await healthService.writeBodyFat(percentage, date)
          set({ isSyncing: false })
          return success
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to sync body fat'
          set({ isSyncing: false, syncError: message })
          return false
        }
      },

      syncActivity: async (
        type: 'run' | 'walk' | 'bike',
        startDate: Date,
        endDate: Date,
        distance: number,
        calories: number
      ) => {
        const { syncEnabled, syncSettings, hasPermissions } = get()
        if (!syncEnabled || !syncSettings.activities || !hasPermissions) {
          return false
        }

        set({ isSyncing: true, syncError: null })
        try {
          const duration = Math.round((endDate.getTime() - startDate.getTime()) / 60000)
          const success = await healthService.writeActivity({
            type,
            startDate,
            endDate,
            duration,
            distance,
            calories,
          })
          set({ isSyncing: false })
          return success
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to sync activity'
          set({ isSyncing: false, syncError: message })
          return false
        }
      },

      syncWorkout: async (startDate: Date, endDate: Date, calories: number) => {
        const { syncEnabled, syncSettings, hasPermissions } = get()
        if (!syncEnabled || !syncSettings.workouts || !hasPermissions) {
          return false
        }

        set({ isSyncing: true, syncError: null })
        try {
          const duration = Math.round((endDate.getTime() - startDate.getTime()) / 60000)
          const success = await healthService.writeActivity({
            type: 'workout',
            startDate,
            endDate,
            duration,
            calories,
          })
          set({ isSyncing: false })
          return success
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to sync workout'
          set({ isSyncing: false, syncError: message })
          return false
        }
      },

      openHealthApp: async () => {
        await healthService.openHealthSettings()
      },
    }),
    {
      name: 'fast-track-health',
      partialize: (state) => ({
        syncEnabled: state.syncEnabled,
        syncSettings: state.syncSettings,
        lastSyncDate: state.lastSyncDate,
      }),
    }
  )
)
