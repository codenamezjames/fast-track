import { Capacitor } from '@capacitor/core'
import { Health } from 'capacitor-health'

export type HealthDataType =
  | 'weight'
  | 'height'
  | 'bodyFat'
  | 'steps'
  | 'distance'
  | 'calories'
  | 'workout'

export interface HealthPermission {
  read: HealthDataType[]
  write: HealthDataType[]
}

export interface WeightSample {
  value: number // kg
  date: Date
  source?: string
}

export interface ActivitySample {
  type: 'run' | 'walk' | 'bike' | 'workout'
  startDate: Date
  endDate: Date
  duration: number // minutes
  distance?: number // km
  calories?: number
}

class HealthService {
  private isNative: boolean

  constructor() {
    this.isNative = Capacitor.isNativePlatform()
  }

  /**
   * Check if health features are available on this platform
   */
  async isAvailable(): Promise<boolean> {
    if (!this.isNative) {
      return false
    }

    try {
      const result = await Health.isHealthAvailable()
      return result.available
    } catch (error) {
      console.error('Health availability check failed:', error)
      return false
    }
  }

  /**
   * Request permissions for health data access
   */
  async requestPermissions(): Promise<boolean> {
    if (!this.isNative) {
      return false
    }

    try {
      await Health.requestHealthPermissions({
        permissions: [
          'READ_STEPS',
          'READ_WORKOUTS',
          'READ_ACTIVE_CALORIES',
          'READ_DISTANCE',
        ],
      })
      return true
    } catch (error) {
      console.error('Health permission request failed:', error)
      return false
    }
  }

  /**
   * Check if we have permissions
   */
  async checkPermissions(): Promise<boolean> {
    if (!this.isNative) {
      return false
    }

    try {
      const result = await Health.checkHealthPermissions({
        permissions: ['READ_STEPS', 'READ_WORKOUTS'],
      })

      // Check if any permissions were granted
      return result.permissions.some((p) => Object.values(p).some((v) => v === true))
    } catch (error) {
      console.error('Health permission check failed:', error)
      return false
    }
  }

  /**
   * Read workouts from health store
   */
  async readWorkouts(startDate: Date, endDate: Date): Promise<ActivitySample[]> {
    if (!this.isNative) {
      return []
    }

    try {
      const result = await Health.queryWorkouts({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        includeHeartRate: false,
        includeRoute: false,
        includeSteps: false,
      })

      return result.workouts.map((workout) => ({
        type: mapWorkoutType(workout.workoutType),
        startDate: new Date(workout.startDate),
        endDate: new Date(workout.endDate),
        duration: workout.duration,
        distance: workout.distance ? workout.distance / 1000 : undefined, // Convert m to km
        calories: workout.calories,
      }))
    } catch (error) {
      console.error('Failed to read workouts:', error)
      return []
    }
  }

  /**
   * Read aggregated data (steps, calories)
   */
  async readAggregated(
    dataType: 'steps' | 'active-calories',
    startDate: Date,
    endDate: Date
  ): Promise<{ date: Date; value: number }[]> {
    if (!this.isNative) {
      return []
    }

    try {
      const result = await Health.queryAggregated({
        dataType,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        bucket: 'day',
      })

      return result.aggregatedData.map((sample) => ({
        date: new Date(sample.startDate),
        value: sample.value,
      }))
    } catch (error) {
      console.error('Failed to read aggregated data:', error)
      return []
    }
  }

  // Write methods - these are stubs that log but don't actually write
  // The capacitor-health plugin is read-only
  // A different plugin (like @nicofee/capacitor-healthkit) would be needed for write support

  async writeWeight(_weight: number, _date?: Date): Promise<boolean> {
    console.log('Health write not supported with current plugin - weight sync skipped')
    return false
  }

  async writeHeight(_heightCm: number, _date?: Date): Promise<boolean> {
    console.log('Health write not supported with current plugin - height sync skipped')
    return false
  }

  async writeBodyFat(_percentage: number, _date?: Date): Promise<boolean> {
    console.log('Health write not supported with current plugin - body fat sync skipped')
    return false
  }

  async writeActivity(_activity: ActivitySample): Promise<boolean> {
    console.log('Health write not supported with current plugin - activity sync skipped')
    return false
  }

  /**
   * Open the health app settings
   */
  async openHealthSettings(): Promise<void> {
    if (!this.isNative) {
      return
    }

    try {
      if (Capacitor.getPlatform() === 'ios') {
        await Health.openAppleHealthSettings()
      } else {
        await Health.openHealthConnectSettings()
      }
    } catch (error) {
      console.error('Failed to open health settings:', error)
    }
  }
}

function mapWorkoutType(type: string): 'run' | 'walk' | 'bike' | 'workout' {
  const typeMap: Record<string, 'run' | 'walk' | 'bike' | 'workout'> = {
    running: 'run',
    walking: 'walk',
    cycling: 'bike',
    strength_training: 'workout',
    functional_strength_training: 'workout',
    traditional_strength_training: 'workout',
  }
  return typeMap[type.toLowerCase()] || 'workout'
}

export const healthService = new HealthService()
