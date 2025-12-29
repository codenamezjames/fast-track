/**
 * StreakService
 *
 * Implements streak mechanics as specified in REWRITE_SPEC:
 * - 2-of-3 daily activities required (meals logged, workout completed, fast completed)
 * - Streak freeze system with auto-use
 * - Milestone celebrations with freeze rewards
 * - Streak intensity levels (Cold → Warm → Hot → Fire → Inferno)
 */

import Streak from '#models/streak'
import DailyActivity from '#models/daily_activity'
import { DateTime } from 'luxon'

export type StreakIntensity = 'cold' | 'warm' | 'hot' | 'fire' | 'inferno'

export interface StreakStatus {
  currentStreak: number
  longestStreak: number
  freezesAvailable: number
  intensity: StreakIntensity
  milestonesAchieved: number[]
}

export default class StreakService {
  /**
   * Milestones that trigger celebrations
   */
  private static readonly MILESTONES = [3, 7, 14, 30, 50, 100, 150, 200, 365, 500, 1000]

  /**
   * Milestones that award freezes
   */
  private static readonly FREEZE_AWARD_MILESTONES = [7, 30, 100, 365]

  /**
   * Calculate streak intensity based on current streak count
   */
  public static getIntensity(streakCount: number): StreakIntensity {
    if (streakCount >= 365) return 'inferno'
    if (streakCount >= 100) return 'fire'
    if (streakCount >= 30) return 'hot'
    if (streakCount >= 7) return 'warm'
    return 'cold'
  }

  /**
   * Check if 2-of-3 daily activities are completed
   */
  public static checkStreakMaintained(
    fastCompleted: boolean,
    mealsLogged: boolean,
    workoutCompleted: boolean
  ): boolean {
    const completedCount = [fastCompleted, mealsLogged, workoutCompleted].filter(Boolean).length
    return completedCount >= 2
  }

  /**
   * Update streak based on daily activity
   * Returns new milestones achieved (if any)
   */
  public static async updateStreak(
    userId: number,
    date: Date
  ): Promise<{ newMilestones: number[]; streakBroken: boolean; freezeUsed: boolean }> {
    // Get or create streak record
    let streak = await Streak.query().where('userId', userId).first()
    if (!streak) {
      streak = await Streak.create({
        userId,
        currentStreak: 0,
        longestStreak: 0,
        freezesAvailable: 0,
        milestonesAchieved: [],
      })
    }

    // Get or create daily activity
    const dateStr = DateTime.fromJSDate(date).toISODate()
    let dailyActivity = await DailyActivity.query()
      .where('userId', userId)
      .where('date', dateStr)
      .first()

    if (!dailyActivity) {
      dailyActivity = await DailyActivity.create({
        userId,
        date: DateTime.fromJSDate(date),
        fastCompleted: false,
        mealsLogged: false,
        workoutCompleted: false,
        streakMaintained: false,
      })
    }

    // Check if streak is maintained today
    const streakMaintained = this.checkStreakMaintained(
      dailyActivity.fastCompleted,
      dailyActivity.mealsLogged,
      dailyActivity.workoutCompleted
    )

    dailyActivity.streakMaintained = streakMaintained
    await dailyActivity.save()

    // Update streak
    let freezeUsed = false
    let streakBroken = false

    if (streakMaintained) {
      streak.currentStreak += 1
    } else {
      // Streak not maintained - check for freeze
      if (streak.freezesAvailable > 0) {
        streak.freezesAvailable -= 1
        freezeUsed = true
      } else {
        streak.currentStreak = 0
        streakBroken = true
      }
    }

    // Update longest streak
    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak
    }

    // Check for new milestones
    const newMilestones: number[] = []
    for (const milestone of this.MILESTONES) {
      if (
        streak.currentStreak >= milestone &&
        !streak.milestonesAchieved.includes(milestone)
      ) {
        newMilestones.push(milestone)
        streak.milestonesAchieved = [...streak.milestonesAchieved, milestone]

        // Award freeze if applicable
        if (this.FREEZE_AWARD_MILESTONES.includes(milestone)) {
          streak.freezesAvailable += 1
        }
      }
    }

    await streak.save()

    return { newMilestones, streakBroken, freezeUsed }
  }

  /**
   * Mark an activity as completed and update streak
   */
  public static async markActivityCompleted(
    userId: number,
    date: Date,
    activityType: 'fast' | 'meal' | 'workout'
  ): Promise<void> {
    const dateStr = DateTime.fromJSDate(date).toISODate()

    let dailyActivity = await DailyActivity.query()
      .where('userId', userId)
      .where('date', dateStr)
      .first()

    if (!dailyActivity) {
      dailyActivity = await DailyActivity.create({
        userId,
        date: DateTime.fromJSDate(date),
        fastCompleted: false,
        mealsLogged: false,
        workoutCompleted: false,
        streakMaintained: false,
      })
    }

    switch (activityType) {
      case 'fast':
        dailyActivity.fastCompleted = true
        break
      case 'meal':
        dailyActivity.mealsLogged = true
        break
      case 'workout':
        dailyActivity.workoutCompleted = true
        break
    }

    await dailyActivity.save()

    // Update streak
    await this.updateStreak(userId, date)
  }

  /**
   * Get current streak status
   */
  public static async getStreakStatus(userId: number): Promise<StreakStatus | null> {
    const streak = await Streak.query().where('userId', userId).first()
    if (!streak) return null

    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      freezesAvailable: streak.freezesAvailable,
      intensity: this.getIntensity(streak.currentStreak),
      milestonesAchieved: streak.milestonesAchieved,
    }
  }
}
