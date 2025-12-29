import type { HttpContext } from '@adonisjs/core/http'
import StreakService from '#services/streak_service'
import DailyActivity from '#models/daily_activity'
import { DateTime } from 'luxon'

export default class StreaksController {
  /**
   * Get current streak status
   */
  async show({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const streakStatus = await StreakService.getStreakStatus(user.id)

    if (!streakStatus) {
      return response.notFound({ message: 'Streak not found' })
    }

    return response.ok({ streak: streakStatus })
  }

  /**
   * Get daily activities for a date range (for calendar/heatmap)
   */
  async dailyActivities({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const { startDate, endDate, days } = request.qs()

    let query = DailyActivity.query().where('userId', user.id).orderBy('date', 'desc')

    if (startDate && endDate) {
      query = query.whereBetween('date', [startDate, endDate])
    } else if (days) {
      // Get last N days
      const daysCount = parseInt(days, 10)
      const start = DateTime.now().minus({ days: daysCount }).toISODate()
      query = query.where('date', '>=', start)
    } else {
      // Default to last 30 days
      const start = DateTime.now().minus({ days: 30 }).toISODate()
      query = query.where('date', '>=', start)
    }

    const activities = await query

    return response.ok({ activities })
  }

  /**
   * Get today's activity status
   */
  async today({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const today = DateTime.now().toISODate()

    const todayActivity = await DailyActivity.query()
      .where('userId', user.id)
      .where('date', today)
      .first()

    if (!todayActivity) {
      return response.ok({
        activity: {
          date: today,
          fastCompleted: false,
          mealsLogged: false,
          workoutCompleted: false,
          streakMaintained: false,
        },
      })
    }

    return response.ok({ activity: todayActivity })
  }
}
