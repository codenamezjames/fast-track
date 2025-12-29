import type { HttpContext } from '@adonisjs/core/http'
import Routine from '#models/routine'
import { storeRoutineValidator } from '#validators/routine/store'
import { updateRoutineValidator } from '#validators/routine/update'

export default class RoutinesController {
  /**
   * Get all routines for current user
   */
  async index({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const routines = await Routine.query().where('userId', user.id).orderBy('createdAt', 'desc')

    return response.ok({ routines })
  }

  /**
   * Get a specific routine
   */
  async show({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const routine = await Routine.query()
      .where('id', params.id)
      .where('userId', user.id)
      .firstOrFail()

    return response.ok({ routine })
  }

  /**
   * Create a new routine
   */
  async store({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(storeRoutineValidator)

    const routine = await Routine.create({
      userId: user.id,
      name: payload.name,
      exercises: payload.exercises,
    })

    return response.created({ routine })
  }

  /**
   * Update a routine
   */
  async update({ auth, params, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(updateRoutineValidator)

    const routine = await Routine.query()
      .where('id', params.id)
      .where('userId', user.id)
      .firstOrFail()

    routine.merge(payload)
    await routine.save()

    return response.ok({ routine })
  }

  /**
   * Delete a routine
   */
  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const routine = await Routine.query()
      .where('id', params.id)
      .where('userId', user.id)
      .firstOrFail()

    await routine.delete()

    return response.ok({ message: 'Routine deleted successfully' })
  }
}
