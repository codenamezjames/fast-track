import type { HttpContext } from '@adonisjs/core/http'
import Meal from '#models/meal'
import { storeMealValidator } from '#validators/meal/store'
import { updateMealValidator } from '#validators/meal/update'
import StreakService from '#services/streak_service'
import { DateTime } from 'luxon'

export default class MealsController {
  /**
   * Get all meals for current user, optionally filtered by date range
   */
  async index({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const { startDate, endDate } = request.qs()

    let query = Meal.query().where('userId', user.id).orderBy('date', 'desc')

    if (startDate) {
      query = query.where('date', '>=', startDate)
    }
    if (endDate) {
      query = query.where('date', '<=', endDate)
    }

    const meals = await query

    return response.ok({ meals })
  }

  /**
   * Get a specific meal
   */
  async show({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const meal = await Meal.query()
      .where('id', params.id)
      .where('userId', user.id)
      .firstOrFail()

    return response.ok({ meal })
  }

  /**
   * Create a new meal
   */
  async store({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(storeMealValidator)

    const meal = await Meal.create({
      userId: user.id,
      date: DateTime.fromJSDate(payload.date),
      type: payload.type,
      foods: payload.foods,
      totalCalories: payload.totalCalories,
    })

    // Mark meal logged for streak
    await StreakService.markActivityCompleted(user.id, payload.date, 'meal')

    return response.created({ meal })
  }

  /**
   * Update a meal
   */
  async update({ auth, params, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(updateMealValidator)

    const meal = await Meal.query()
      .where('id', params.id)
      .where('userId', user.id)
      .firstOrFail()

    meal.merge(payload)
    await meal.save()

    return response.ok({ meal })
  }

  /**
   * Delete a meal
   */
  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const meal = await Meal.query()
      .where('id', params.id)
      .where('userId', user.id)
      .firstOrFail()

    await meal.delete()

    return response.ok({ message: 'Meal deleted successfully' })
  }

  /**
   * Get daily nutrition summary for a specific date
   */
  async dailySummary({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const { date } = request.qs()
    const targetDate = date ? DateTime.fromISO(date) : DateTime.local()

    const meals = await Meal.query()
      .where('userId', user.id)
      .where('date', targetDate.toISODate())

    const summary = {
      date: targetDate.toISODate(),
      totalCalories: meals.reduce((sum, meal) => sum + meal.totalCalories, 0),
      totalProtein: meals.reduce(
        (sum, meal) =>
          sum + meal.foods.reduce((foodSum, food) => foodSum + (food.protein || 0), 0),
        0
      ),
      totalCarbs: meals.reduce(
        (sum, meal) => sum + meal.foods.reduce((foodSum, food) => foodSum + (food.carbs || 0), 0),
        0
      ),
      totalFat: meals.reduce(
        (sum, meal) => sum + meal.foods.reduce((foodSum, food) => foodSum + (food.fat || 0), 0),
        0
      ),
      mealBreakdown: meals.map((meal) => ({
        type: meal.type,
        calories: meal.totalCalories,
        foodCount: meal.foods.length,
      })),
    }

    return response.ok({ summary })
  }
}