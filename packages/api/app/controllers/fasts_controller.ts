import type { HttpContext } from '@adonisjs/core/http'
import Fast from '#models/fast'
import { storeFastValidator } from '#validators/fast/store'
import { updateFastValidator } from '#validators/fast/update'
import StreakService from '#services/streak_service'
import { DateTime } from 'luxon'

export default class FastsController {
  /**
   * Get all fasts for current user
   */
  async index({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const fasts = await Fast.query().where('userId', user.id).orderBy('startTime', 'desc')

    return response.ok({ fasts })
  }

  /**
   * Get active fast (if any)
   */
  async active({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const activeFast = await Fast.query()
      .where('userId', user.id)
      .whereNull('endTime')
      .where('isCompleted', false)
      .first()

    if (!activeFast) {
      return response.notFound({ message: 'No active fast found' })
    }

    // Calculate progress
    const now = DateTime.now()
    const elapsed = now.diff(activeFast.startTime, 'hours').hours
    const goalHours = activeFast.goalHours
    const progress = Math.min((elapsed / goalHours) * 100, 100)
    const remaining = Math.max(goalHours - elapsed, 0)

    return response.ok({
      fast: activeFast,
      progress: {
        elapsed: Math.round(elapsed * 100) / 100,
        remaining: Math.round(remaining * 100) / 100,
        percentage: Math.round(progress * 100) / 100,
      },
    })
  }

  /**
   * Start a new fast
   */
  async store({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(storeFastValidator)

    // Check if there's already an active fast
    const activeFast = await Fast.query()
      .where('userId', user.id)
      .whereNull('endTime')
      .where('isCompleted', false)
      .first()

    if (activeFast) {
      return response.conflict({ message: 'You already have an active fast' })
    }

    const fast = await Fast.create({
      userId: user.id,
      startTime: DateTime.fromJSDate(payload.startTime),
      goalHours: payload.goalHours,
      notes: payload.notes,
      isCompleted: false,
      notified80Percent: false,
      notifiedComplete: false,
    })

    return response.created({ fast })
  }

  /**
   * End a fast
   */
  async end({ auth, params, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(updateFastValidator)

    const fast = await Fast.query()
      .where('id', params.id)
      .where('userId', user.id)
      .firstOrFail()

    if (fast.endTime) {
      return response.conflict({ message: 'Fast already ended' })
    }

    const endTime = payload.endTime
      ? DateTime.fromJSDate(payload.endTime)
      : DateTime.now()
    const duration = endTime.diff(fast.startTime, 'hours').hours
    const isCompleted = duration >= fast.goalHours

    fast.endTime = endTime
    fast.isCompleted = isCompleted
    if (payload.notes !== undefined) {
      fast.notes = payload.notes
    }
    await fast.save()

    // Mark fast completed for streak if it's 100%
    if (isCompleted) {
      await StreakService.markActivityCompleted(user.id, endTime.toJSDate(), 'fast')
    }

    return response.ok({ fast, isCompleted })
  }

  /**
   * Delete a fast
   */
  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const fast = await Fast.query()
      .where('id', params.id)
      .where('userId', user.id)
      .firstOrFail()

    await fast.delete()

    return response.ok({ message: 'Fast deleted successfully' })
  }
}
