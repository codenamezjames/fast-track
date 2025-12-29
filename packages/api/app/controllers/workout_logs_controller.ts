import type { HttpContext } from '@adonisjs/core/http'
import WorkoutLog from '#models/workout_log'
import { storeWorkoutLogValidator } from '#validators/workout_log/store'
import { updateWorkoutLogValidator } from '#validators/workout_log/update'
import StreakService from '#services/streak_service'
import { DateTime } from 'luxon'

export default class WorkoutLogsController {
  /**
   * Get all workout logs for current user
   */
  async index({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const { startDate, endDate } = request.qs()

    let query = WorkoutLog.query()
      .where('userId', user.id)
      .preload('routine')
      .orderBy('startTime', 'desc')

    if (startDate) {
      query = query.where('startTime', '>=', startDate)
    }
    if (endDate) {
      query = query.where('startTime', '<=', endDate)
    }

    const workoutLogs = await query

    return response.ok({ workoutLogs })
  }

  /**
   * Get a specific workout log
   */
  async show({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const workoutLog = await WorkoutLog.query()
      .where('id', params.id)
      .where('userId', user.id)
      .preload('routine')
      .firstOrFail()

    return response.ok({ workoutLog })
  }

  /**
   * Get active workout log (if any)
   */
  async active({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const activeWorkout = await WorkoutLog.query()
      .where('userId', user.id)
      .whereNull('endTime')
      .where('isCompleted', false)
      .preload('routine')
      .first()

    if (!activeWorkout) {
      return response.notFound({ message: 'No active workout found' })
    }

    // Calculate elapsed time
    const now = DateTime.now()
    const elapsed = now.diff(activeWorkout.startTime, 'minutes').minutes

    return response.ok({
      workoutLog: activeWorkout,
      elapsed: Math.round(elapsed),
    })
  }

  /**
   * Start a new workout log
   */
  async store({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(storeWorkoutLogValidator)

    // Check if there's already an active workout
    const activeWorkout = await WorkoutLog.query()
      .where('userId', user.id)
      .whereNull('endTime')
      .where('isCompleted', false)
      .first()

    if (activeWorkout) {
      return response.conflict({ message: 'You already have an active workout' })
    }

    const workoutLog = await WorkoutLog.create({
      userId: user.id,
      routineId: payload.routineId || null,
      startTime: DateTime.fromJSDate(payload.startTime),
      exercisesCompleted: payload.exercisesCompleted,
      isCompleted: false,
    })

    await workoutLog.load('routine')

    return response.created({ workoutLog })
  }

  /**
   * End a workout log
   */
  async end({ auth, params, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(updateWorkoutLogValidator)

    const workoutLog = await WorkoutLog.query()
      .where('id', params.id)
      .where('userId', user.id)
      .firstOrFail()

    if (workoutLog.endTime) {
      return response.conflict({ message: 'Workout already ended' })
    }

    const endTime = payload.endTime
      ? DateTime.fromJSDate(payload.endTime)
      : DateTime.now()

    const duration = endTime.diff(workoutLog.startTime, 'minutes').minutes

    workoutLog.endTime = endTime
    workoutLog.duration = Math.round(duration)
    workoutLog.isCompleted = payload.isCompleted ?? true

    if (payload.exercisesCompleted !== undefined) {
      workoutLog.exercisesCompleted = payload.exercisesCompleted
    }

    await workoutLog.save()

    // Mark workout completed for streak
    if (workoutLog.isCompleted) {
      await StreakService.markActivityCompleted(user.id, endTime.toJSDate(), 'workout')
    }

    return response.ok({ workoutLog })
  }

  /**
   * Delete a workout log
   */
  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const workoutLog = await WorkoutLog.query()
      .where('id', params.id)
      .where('userId', user.id)
      .firstOrFail()

    await workoutLog.delete()

    return response.ok({ message: 'Workout log deleted successfully' })
  }
}
