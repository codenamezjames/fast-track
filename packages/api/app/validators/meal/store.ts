import vine from '@vinejs/vine'

/**
 * Validator for creating a meal
 */
export const storeMealValidator = vine.compile(
  vine.object({
    date: vine.date(),
    type: vine.enum(['breakfast', 'lunch', 'dinner', 'snack']),
    foods: vine.array(
      vine.object({
        name: vine.string(),
        calories: vine.number().positive(),
        protein: vine.number().positive().optional(),
        carbs: vine.number().positive().optional(),
        fat: vine.number().positive().optional(),
        serving: vine.string().optional(),
        brand: vine.string().optional(),
      })
    ),
    totalCalories: vine.number().positive(),
  })
)