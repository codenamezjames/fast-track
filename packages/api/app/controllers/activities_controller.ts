import type { HttpContext } from '@adonisjs/core/http'
import Activity from '#models/activity'
import { storeActivityValidator } from '#validators/activity/store'
import { updateActivityValidator } from '#validators/activity/update'
import { DateTime } from 'luxon'

export default class ActivitiesController {
  /**
   * Estimate calories burned based on activity type, duration, and distance
   * This is a simplified calculation - in production you'd use more sophisticated formulas
   */
  private calculateCalories(
    type: string,
    duration: number,
    distance?: number
  ): number {
    // Average calorie burn rates per minute (very rough estimates)
    const calorieRates: Record<string, number> = {
      run: 10, // ~600 cal/hour
      walk: 4, // ~240 cal/hour
      bike: 8, // ~480 cal/hour
      other: 6, // ~360 cal/hour
    }

    const rate = calorieRates[type] || calorieRates.other
    return Math.round(rate * duration)
  }

  /**
   * Get all activities for current user
   */
  async index({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const { startDate, endDate, type } = request.qs()

    let query = Activity.query().where('userId', user.id).orderBy('startTime', 'desc')

    if (startDate) {
      query = query.where('startTime', '>=', startDate)
    }
    if (endDate) {
      query = query.where('startTime', '<=', endDate)
    }
    if (type) {
      query = query.where('type', type)
    }

    const activities = await query

    return response.ok({ activities })
  }

  /**
   * Get a specific activity
   */
  async show({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const activity = await Activity.query()
      .where('id', params.id)
      .where('userId', user.id)
      .firstOrFail()

    return response.ok({ activity })
  }

  /**
   * Get active activity (if any)
   */
  async active({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const activeActivity = await Activity.query()
      .where('userId', user.id)
      .whereNull('endTime')
      .first()

    if (!activeActivity) {
      return response.notFound({ message: 'No active activity found' })
    }

    // Calculate elapsed time
    const now = DateTime.now()
    const elapsed = now.diff(activeActivity.startTime, 'minutes').minutes

    return response.ok({
      activity: activeActivity,
      elapsed: Math.round(elapsed),
    })
  }

  /**
   * Create a new activity (start tracking)
   */
  async store({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(storeActivityValidator)

    // Check if there's already an active activity
    const activeActivity = await Activity.query()
      .where('userId', user.id)
      .whereNull('endTime')
      .first()

    if (activeActivity) {
      return response.conflict({ message: 'You already have an active activity' })
    }

    const activity = await Activity.create({
      userId: user.id,
      type: payload.type,
      startTime: DateTime.fromJSDate(payload.startTime),
      endTime: payload.endTime ? DateTime.fromJSDate(payload.endTime) : null,
      duration: payload.duration || null,
      distance: payload.distance || null,
      calories: payload.calories || null,
    })

    return response.created({ activity })
  }

  /**
   * End an activity
   */
  async end({ auth, params, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(updateActivityValidator)

    const activity = await Activity.query()
      .where('id', params.id)
      .where('userId', user.id)
      .firstOrFail()

    if (activity.endTime) {
      return response.conflict({ message: 'Activity already ended' })
    }

    const endTime = payload.endTime ? DateTime.fromJSDate(payload.endTime) : DateTime.now()
    const duration = payload.duration || endTime.diff(activity.startTime, 'minutes').minutes

    activity.endTime = endTime
    activity.duration = Math.round(duration)
    activity.distance = payload.distance || activity.distance
    activity.calories =
      payload.calories ||
      this.calculateCalories(activity.type, activity.duration, activity.distance || undefined)

    await activity.save()

    return response.ok({ activity })
  }

  /**
   * Update an activity
   */
  async update({ auth, params, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(updateActivityValidator)

    const activity = await Activity.query()
      .where('id', params.id)
      .where('userId', user.id)
      .firstOrFail()

    if (payload.type !== undefined) {
      activity.type = payload.type
    }
    if (payload.endTime !== undefined) {
      activity.endTime = DateTime.fromJSDate(payload.endTime)
    }
    if (payload.duration !== undefined) {
      activity.duration = payload.duration
    }
    if (payload.distance !== undefined) {
      activity.distance = payload.distance
    }
    if (payload.calories !== undefined) {
      activity.calories = payload.calories
    }

    await activity.save()

    return response.ok({ activity })
  }

  /**
   * Delete an activity
   */
  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const activity = await Activity.query()
      .where('id', params.id)
      .where('userId', user.id)
      .firstOrFail()

    await activity.delete()

    return response.ok({ message: 'Activity deleted successfully' })
  }
}
