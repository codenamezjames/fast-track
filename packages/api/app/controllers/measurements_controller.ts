import type { HttpContext } from '@adonisjs/core/http'
import Measurement from '#models/measurement'
import { storeMeasurementValidator } from '#validators/measurement/store'
import { updateMeasurementValidator } from '#validators/measurement/update'
import { DateTime } from 'luxon'

export default class MeasurementsController {
  /**
   * Calculate BMI from weight (kg) and height (cm)
   */
  private calculateBMI(weight: number, height: number): number {
    // BMI = weight (kg) / (height (m))^2
    const heightInMeters = height / 100
    return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10
  }

  /**
   * Get all measurements for current user
   */
  async index({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const { startDate, endDate } = request.qs()

    let query = Measurement.query().where('userId', user.id).orderBy('date', 'desc')

    if (startDate) {
      query = query.where('date', '>=', startDate)
    }
    if (endDate) {
      query = query.where('date', '<=', endDate)
    }

    const measurements = await query

    return response.ok({ measurements })
  }

  /**
   * Get latest measurement
   */
  async latest({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const latest = await Measurement.query()
      .where('userId', user.id)
      .orderBy('date', 'desc')
      .first()

    if (!latest) {
      return response.notFound({ message: 'No measurements found' })
    }

    return response.ok({ measurement: latest })
  }

  /**
   * Get a specific measurement
   */
  async show({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const measurement = await Measurement.query()
      .where('id', params.id)
      .where('userId', user.id)
      .firstOrFail()

    return response.ok({ measurement })
  }

  /**
   * Create a new measurement
   */
  async store({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(storeMeasurementValidator)

    // Calculate BMI if weight and height are provided
    let bmi: number | null = null
    if (payload.weight && payload.height) {
      bmi = this.calculateBMI(payload.weight, payload.height)
    } else {
      // Try to get height from previous measurement if only weight is provided
      if (payload.weight && !payload.height) {
        const previousMeasurement = await Measurement.query()
          .where('userId', user.id)
          .whereNotNull('height')
          .orderBy('date', 'desc')
          .first()

        if (previousMeasurement?.height) {
          bmi = this.calculateBMI(payload.weight, previousMeasurement.height)
        }
      }
    }

    const measurement = await Measurement.create({
      userId: user.id,
      date: DateTime.fromJSDate(payload.date),
      weight: payload.weight || null,
      height: payload.height || null,
      bodyFat: payload.bodyFat || null,
      bmi,
    })

    // TODO: Trigger calorie recalculation when user settings are implemented
    // if (payload.weight || payload.height) {
    //   await CalorieCalculatorService.recalculateForUser(user.id)
    // }

    return response.created({ measurement })
  }

  /**
   * Update a measurement
   */
  async update({ auth, params, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(updateMeasurementValidator)

    const measurement = await Measurement.query()
      .where('id', params.id)
      .where('userId', user.id)
      .firstOrFail()

    // Update fields
    if (payload.weight !== undefined) {
      measurement.weight = payload.weight
    }
    if (payload.height !== undefined) {
      measurement.height = payload.height
    }
    if (payload.bodyFat !== undefined) {
      measurement.bodyFat = payload.bodyFat
    }

    // Recalculate BMI if we have both weight and height
    const weight = measurement.weight
    const height = measurement.height

    if (weight && height) {
      measurement.bmi = this.calculateBMI(weight, height)
    }

    await measurement.save()

    // TODO: Trigger calorie recalculation when user settings are implemented
    // if (payload.weight || payload.height) {
    //   await CalorieCalculatorService.recalculateForUser(user.id)
    // }

    return response.ok({ measurement })
  }

  /**
   * Delete a measurement
   */
  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const measurement = await Measurement.query()
      .where('id', params.id)
      .where('userId', user.id)
      .firstOrFail()

    await measurement.delete()

    return response.ok({ message: 'Measurement deleted successfully' })
  }
}
